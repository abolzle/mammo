import { EXAM } from "@/config/exam";
import { isLearnerVisible } from "@/lib/content/validate";
import type { Curriculum, ModuleContent, Question } from "@/lib/schemas/content";

export type Blueprint = { id: string; name: string; weight: number }[];

/** Scored-question allocation units, in exam order: 20 / 30 / 26 + 39. */
export const BLUEPRINT: Blueprint = EXAM.domains.flatMap((d) =>
  d.subdomains.map((s) => ({ id: s.id, name: s.name, weight: s.scoredQuestions })),
);

export const MIN_FORM_QUIZ = 10;

export function fnv1a(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Largest-remainder apportionment; ties go to the earlier blueprint unit so results are deterministic. */
export function allocate(total: number, blueprint: Blueprint = BLUEPRINT): Record<string, number> {
  const weightSum = blueprint.reduce((a, b) => a + b.weight, 0);
  const raw = blueprint.map((b, i) => ({ id: b.id, i, exact: (total * b.weight) / weightSum }));
  const out: Record<string, number> = {};
  for (const r of raw) out[r.id] = Math.floor(r.exact);
  let left = total - raw.reduce((a, r) => a + Math.floor(r.exact), 0);
  const order = [...raw].sort((a, b) => b.exact - Math.floor(b.exact) - (a.exact - Math.floor(a.exact)) || a.i - b.i);
  for (const r of order) {
    if (left <= 0) break;
    out[r.id] += 1;
    left -= 1;
  }
  return out;
}

export function subdomainIndex(curriculum: Curriculum): (q: Question) => string | null {
  const topicSub = new Map(curriculum.topics.map((t) => [t.id, t.subdomainId]));
  const objSub = new Map(curriculum.objectives.map((o) => [o.id, topicSub.get(o.topicId) ?? null]));
  return (q) => {
    for (const oid of q.objectiveIds) {
      const s = objSub.get(oid);
      if (s) return s;
    }
    return null;
  };
}

export function usableQuestions(modules: ModuleContent[], pool: string): Question[] {
  return modules.flatMap((m) =>
    m.questions.filter((q) => q.pool === pool && isLearnerVisible(q.review.status)),
  );
}

export type FormItem = {
  question: Question;
  subdomainId: string;
  role: "scored" | "pilot";
  pilotSource?: "marked" | "designated";
  priorExposure: boolean;
};

export type FormPlan = {
  ok: boolean;
  items: FormItem[];
  scoredTarget: Record<string, number>;
  scoredPicked: Record<string, number>;
  /** Distinct, separable families available per blueprint unit for scored slots. */
  available: Record<string, number>;
  shortfall: { id: string; name: string; need: number; have: number }[];
  pilotTarget: number;
  pilotPicked: number;
  designatedPilots: number;
  formVersion: string;
};

/**
 * Builds a form with at most one item per question family and per image asset, allocating scored
 * slots by blueprint. Unseen families are preferred; the rest of the order is a stable hash, so the
 * same bank and exposure history give the same form.
 */
export function assembleForm(args: {
  questions: Question[];
  curriculum: Curriculum;
  scored: number;
  pilots?: number;
  salt: string;
  seenFamilies?: Set<string>;
  blueprint?: Blueprint;
}): FormPlan {
  const blueprint = args.blueprint ?? BLUEPRINT;
  const seen = args.seenFamilies ?? new Set<string>();
  const subOf = subdomainIndex(args.curriculum);
  const pilotsWanted = args.pilots ?? 0;
  const rank = (q: Question) => fnv1a(`${args.salt}|${q.id}`);
  const sorted = [...args.questions]
    .filter((q) => subOf(q) && blueprint.some((b) => b.id === subOf(q)))
    .sort((a, b) => Number(seen.has(a.familyId)) - Number(seen.has(b.familyId)) || rank(a) - rank(b) || a.id.localeCompare(b.id));

  const usedFamilies = new Set<string>();
  const usedAssets = new Set<string>();
  const separable = (q: Question) => !usedFamilies.has(q.familyId) && !(q.assetId && usedAssets.has(q.assetId));
  const take = (q: Question) => {
    usedFamilies.add(q.familyId);
    if (q.assetId) usedAssets.add(q.assetId);
  };

  // Marked pilots are never promoted to scored slots in a simulation.
  const scoredCandidates = pilotsWanted > 0 ? sorted.filter((q) => q.simulationRole !== "pilot") : sorted;
  const markedPilots = pilotsWanted > 0 ? sorted.filter((q) => q.simulationRole === "pilot") : [];

  const available: Record<string, number> = {};
  for (const b of blueprint) {
    available[b.id] = new Set(scoredCandidates.filter((q) => subOf(q) === b.id).map((q) => q.familyId)).size;
  }

  const scoredTarget = allocate(args.scored, blueprint);
  const scoredPicked: Record<string, number> = {};
  const items: FormItem[] = [];
  const unitOrder = [...blueprint].sort(
    (a, b) => available[a.id] - scoredTarget[a.id] - (available[b.id] - scoredTarget[b.id]),
  );
  for (const b of unitOrder) {
    scoredPicked[b.id] = 0;
    for (const q of scoredCandidates) {
      if (scoredPicked[b.id] >= scoredTarget[b.id]) break;
      if (subOf(q) !== b.id || !separable(q)) continue;
      take(q);
      scoredPicked[b.id] += 1;
      items.push({ question: q, subdomainId: b.id, role: "scored", priorExposure: seen.has(q.familyId) });
    }
  }

  let pilotPicked = 0;
  let designatedPilots = 0;
  if (pilotsWanted > 0) {
    const pushPilot = (q: Question, source: "marked" | "designated") => {
      take(q);
      pilotPicked += 1;
      if (source === "designated") designatedPilots += 1;
      items.push({ question: q, subdomainId: subOf(q)!, role: "pilot", pilotSource: source, priorExposure: seen.has(q.familyId) });
    };
    const pilotTarget = allocate(pilotsWanted, blueprint);
    const spread = (pool: Question[], source: "marked" | "designated") => {
      for (const b of blueprint) {
        let n = items.filter((i) => i.role === "pilot" && i.subdomainId === b.id).length;
        for (const q of pool) {
          if (pilotPicked >= pilotsWanted || n >= pilotTarget[b.id]) break;
          if (subOf(q) !== b.id || !separable(q)) continue;
          pushPilot(q, source);
          n += 1;
        }
      }
      for (const q of pool) {
        if (pilotPicked >= pilotsWanted) break;
        if (separable(q)) pushPilot(q, source);
      }
    };
    spread(markedPilots, "marked");
    if (pilotPicked < pilotsWanted) spread(scoredCandidates, "designated");
  }

  const shortfall = blueprint
    .filter((b) => scoredPicked[b.id] < scoredTarget[b.id])
    .map((b) => ({ id: b.id, name: b.name, need: scoredTarget[b.id], have: scoredPicked[b.id] }));
  const orderKey = (i: FormItem) => fnv1a(`${args.salt}|order|${i.question.id}`);
  items.sort((a, b) => orderKey(a) - orderKey(b) || a.question.id.localeCompare(b.question.id));
  const formVersion = fnv1a(items.map((i) => `${i.question.id}@${i.question.revision}:${i.role}`).join(",")).toString(36);

  return {
    ok: shortfall.length === 0 && pilotPicked === pilotsWanted,
    items,
    scoredTarget,
    scoredPicked,
    available,
    shortfall,
    pilotTarget: pilotsWanted,
    pilotPicked,
    designatedPilots,
    formVersion,
  };
}

/** Largest blueprint-balanced, family-separated form (no pilots) that fits in the pool, up to `max`. */
export function largestFeasible(args: { questions: Question[]; curriculum: Curriculum; max: number }): number {
  for (let n = args.max; n > 0; n--) {
    if (assembleForm({ questions: args.questions, curriculum: args.curriculum, scored: n, salt: "probe" }).ok) return n;
  }
  return 0;
}

/** Proportional share of the configured exam time, rounded up to whole minutes. */
export function proportionalMinutes(questionCount: number): number {
  if (questionCount >= EXAM.totalQuestions) return EXAM.testMinutes;
  return Math.max(1, Math.ceil((questionCount * EXAM.testMinutes) / EXAM.totalQuestions));
}
