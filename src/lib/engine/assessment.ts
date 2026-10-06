import { EXAM } from "@/config/exam";
import { isValidatedPool } from "@/lib/content/validate";
import type { Curriculum, ModuleContent, Question } from "@/lib/schemas/content";
import type { AssessmentKindValue } from "@/lib/schemas/learner";
import { assembleForm, BLUEPRINT, largestFeasible, MIN_FORM_QUIZ, usableQuestions, type Blueprint, type FormPlan } from "./forms";
import { practiceQuestions, reservedFamilies } from "./planner";

export type AssessmentKind = AssessmentKindValue;

export const FORM_POOL = "form-a";

export const STANDARD_SIZES = {
  baseline: 30,
  checkpoint: 60,
} as const;

export type AssessmentRequest = {
  kind: AssessmentKind;
  /** Requested length for quizzes; standard kinds ignore it. */
  size?: number;
  topicId?: string;
};

export type Fallback = { kind: AssessmentKind; size: number; label: string; topicId?: string };

export type AssessmentOffer =
  | {
      ok: true;
      kind: AssessmentKind;
      label: string;
      size: number;
      scored: number;
      pilots: number;
      pool: string;
      topicId?: string;
      why: string;
      plan: FormPlan;
    }
  | {
      ok: false;
      kind: AssessmentKind;
      label: string;
      available: number;
      required: number;
      shortfall: FormPlan["shortfall"];
      reason: string;
      fallback: Fallback | null;
    };

type Catalog = { curriculum: Curriculum; modules: ModuleContent[] };

export function labelFor(kind: AssessmentKind, size: number, topicTitle?: string): string {
  switch (kind) {
    case "baseline":
      return `${size}-question baseline`;
    case "checkpoint":
      return `${size}-question checkpoint`;
    case "simulation":
      return `Full ${EXAM.totalQuestions}-question simulation`;
    case "form_quiz":
      return `${size}-question reserved Form A quiz`;
    case "topic_quiz":
      return `${size}-question topic quiz${topicTitle ? `: ${topicTitle}` : ""}`;
    case "mixed_quiz":
      return `${size}-question mixed quiz`;
  }
}

export function dailyPracticePool(modules: ModuleContent[]): Question[] {
  const reserved = reservedFamilies(modules);
  return practiceQuestions(modules).filter((q) => !reserved.has(q.familyId));
}

export function formPool(modules: ModuleContent[]): Question[] {
  return usableQuestions(modules, FORM_POOL);
}

function topicBlueprint(curriculum: Curriculum, topicId: string): { blueprint: Blueprint; objectiveIds: Set<string> } | null {
  const topic = curriculum.topics.find((t) => t.id === topicId);
  if (!topic) return null;
  return {
    blueprint: [{ id: topic.subdomainId, name: topic.title, weight: 1 }],
    objectiveIds: new Set(curriculum.objectives.filter((o) => o.topicId === topicId).map((o) => o.id)),
  };
}

export function topicQuestions(catalog: Catalog, topicId: string): Question[] {
  const t = topicBlueprint(catalog.curriculum, topicId);
  if (!t) return [];
  return dailyPracticePool(catalog.modules).filter((q) => q.objectiveIds.some((id) => t.objectiveIds.has(id)));
}

function shortfallText(plan: FormPlan): string {
  return plan.shortfall.map((s) => `${s.name} ${s.have} of ${s.need} (short ${s.need - s.have})`).join("; ");
}

function needText(plan: FormPlan): string {
  return BLUEPRINT.map((b) => `${plan.scoredTarget[b.id]} ${b.name}`).join(", ");
}

/** The largest valid shorter reserved option: a smaller standard form if it fits, else the largest balanced Form A quiz. */
function reservedFallback(catalog: Catalog, below: number): Fallback | null {
  const pool = formPool(catalog.modules);
  for (const kind of ["checkpoint", "baseline"] as const) {
    const n = STANDARD_SIZES[kind];
    if (n >= below) continue;
    if (assembleForm({ questions: pool, curriculum: catalog.curriculum, scored: n, salt: "probe" }).ok) {
      return { kind, size: n, label: labelFor(kind, n) };
    }
  }
  const n = largestFeasible({ questions: pool, curriculum: catalog.curriculum, max: Math.min(below - 1, pool.length) });
  if (n >= MIN_FORM_QUIZ) return { kind: "form_quiz", size: n, label: labelFor("form_quiz", n) };
  const practice = dailyPracticePool(catalog.modules);
  const m = largestFeasible({ questions: practice, curriculum: catalog.curriculum, max: Math.min(20, practice.length) });
  return m > 0 ? { kind: "mixed_quiz", size: m, label: labelFor("mixed_quiz", m) } : null;
}

export function offerAssessment(req: AssessmentRequest | AssessmentKind, catalog: Catalog): AssessmentOffer {
  const r: AssessmentRequest = typeof req === "string" ? { kind: req } : req;
  const { kind } = r;
  const { curriculum, modules } = catalog;

  if (kind === "topic_quiz") {
    const tb = r.topicId ? topicBlueprint(curriculum, r.topicId) : null;
    const title = curriculum.topics.find((t) => t.id === r.topicId)?.title;
    const pool = r.topicId ? topicQuestions(catalog, r.topicId) : [];
    const want = r.size ?? 8;
    const label = labelFor(kind, want, title);
    const plan = tb ? assembleForm({ questions: pool, curriculum, scored: want, salt: `topic:${r.topicId}`, blueprint: tb.blueprint }) : null;
    const size = plan ? plan.items.length : 0;
    if (!plan || size === 0) {
      return {
        ok: false,
        kind,
        label,
        available: 0,
        required: want,
        shortfall: [],
        reason: title ? `No practice questions are written for ${title} yet.` : "Choose a topic first.",
        fallback: null,
      };
    }
    const final = size < want ? assembleForm({ questions: pool, curriculum, scored: size, salt: `topic:${r.topicId}`, blueprint: tb!.blueprint }) : plan;
    return {
      ok: true,
      kind,
      label: labelFor(kind, size, title),
      size,
      scored: size,
      pilots: 0,
      pool: "practice",
      topicId: r.topicId,
      why:
        size < want
          ? `${title} has ${size} distinct practice question families, not ${want}. This is a shorter quiz, not a padded one.`
          : `${size} practice questions on ${title}, one per question family.`,
      plan: final,
    };
  }

  if (kind === "mixed_quiz") {
    const pool = dailyPracticePool(modules);
    const want = r.size ?? 10;
    let plan = assembleForm({ questions: pool, curriculum, scored: want, salt: "mixed" });
    let size = want;
    if (!plan.ok) {
      size = largestFeasible({ questions: pool, curriculum, max: want });
      plan = assembleForm({ questions: pool, curriculum, scored: size, salt: "mixed" });
    }
    if (size === 0) {
      return { ok: false, kind, label: labelFor(kind, want), available: pool.length, required: want, shortfall: plan.shortfall, reason: "No practice questions are available yet.", fallback: null };
    }
    return {
      ok: true,
      kind,
      label: labelFor(kind, size),
      size,
      scored: size,
      pilots: 0,
      pool: "practice",
      why:
        size < want
          ? `The practice bank supports a blueprint-balanced ${size}-question mix, not ${want}. This is a shorter quiz, not a padded one.`
          : `${size} practice questions spread across the four blueprint areas in exam proportions.`,
      plan,
    };
  }

  const pool = formPool(modules);
  const scored = kind === "simulation" ? EXAM.scoredQuestions : kind === "form_quiz" ? (r.size ?? MIN_FORM_QUIZ) : STANDARD_SIZES[kind];
  const pilots = kind === "simulation" ? EXAM.pilotQuestions : 0;
  const total = scored + pilots;
  const label = labelFor(kind, total);
  const plan = assembleForm({ questions: pool, curriculum, scored, pilots, salt: `${FORM_POOL}:${kind}` });

  if (!plan.ok) {
    const parts: string[] = [];
    if (plan.shortfall.length) parts.push(`Short by blueprint area: ${shortfallText(plan)}.`);
    if (plan.pilotPicked < pilots) {
      parts.push(`After the scored slots, ${plan.pilotPicked} of ${pilots} distinct families remain for simulated pilots.`);
    }
    const fallback = reservedFallback(catalog, total);
    return {
      ok: false,
      kind,
      label,
      available: pool.length,
      required: total,
      shortfall: plan.shortfall,
      reason:
        `${label} needs ${scored} scored questions allocated ${needText(plan)}` +
        (pilots ? `, plus ${pilots} simulated pilots` : "") +
        `, each from a distinct reserved family. ${parts.join(" ")} Repeating items or padding from daily practice would manufacture a score, so this is not offered yet.`,
      fallback,
    };
  }

  const pilotNote =
    pilots > 0
      ? plan.designatedPilots > 0
        ? ` ${pilots - plan.designatedPilots} pilots are marked in the bank and ${plan.designatedPilots} were designated by a fixed rule before you start.`
        : ` All ${pilots} pilots are pre-designated in the bank.`
      : "";
  return {
    ok: true,
    kind,
    label,
    size: total,
    scored,
    pilots,
    pool: FORM_POOL,
    why:
      kind === "simulation"
        ? `${EXAM.totalQuestions} reserved Form A questions in ${EXAM.testMinutes} minutes: ${EXAM.scoredQuestions} scored (${needText(plan)}) and ${pilots} simulated pilots, which are revealed after you submit.${pilotNote}`
        : `${total} reserved Form A questions allocated ${needText(plan)}. These families never appear in daily study.`,
    plan,
  };
}

export function noneValidated(modules: ModuleContent[]): boolean {
  return !modules.flatMap((m) => m.questions).some((q) => isValidatedPool(q.review.status));
}
