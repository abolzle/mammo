import { EXAM, CONTENT_POLICY } from "@/config/exam";
import type { Question } from "@/lib/schemas/content";
import type { Attempt, PlannedItem, SessionKind } from "@/lib/schemas/learner";
import type { Lookup } from "./lookup";
import { isValidatedPoolEligible } from "@/lib/content/bundle";

export type AssessmentKind = "topic_quiz" | "mixed_quiz" | "form_quiz" | "baseline" | "checkpoint" | "simulation";

export interface AssessmentSpec {
  kind: AssessmentKind;
  title: string;
  description: string;
  required: number;
  minutes: number | null;
  mode: "study" | "test";
}

export const ASSESSMENTS: Record<Exclude<AssessmentKind, "topic_quiz">, AssessmentSpec> = {
  mixed_quiz: { kind: "mixed_quiz", title: "Mixed practice quiz", description: "10 practice questions across everything available. Feedback after each answer.", required: 10, minutes: null, mode: "study" },
  form_quiz: { kind: "form_quiz", title: "Beta Form A quiz", description: "Reserved questions you have never seen in daily study, in test mode.", required: 10, minutes: 15, mode: "test" },
  baseline: { kind: "baseline", title: "30-question baseline", description: "Reserved questions in test mode, to compare against later checkpoints.", required: 30, minutes: 36, mode: "test" },
  checkpoint: { kind: "checkpoint", title: "60-question checkpoint", description: "Reserved questions in test mode.", required: 60, minutes: 72, mode: "test" },
  simulation: {
    kind: "simulation",
    title: "Full simulation",
    description: `${EXAM.totalQuestions} questions in ${EXAM.testMinutes} minutes: ${EXAM.scoredQuestions} scored (${EXAM.domains.map((d) => d.scoredQuestions).join("/")}) and ${EXAM.pilotQuestions} simulated pilots.`,
    required: EXAM.totalQuestions,
    minutes: EXAM.testMinutes,
    mode: "test",
  },
};

export type BuildResult =
  | { ok: true; items: PlannedItem[]; retake: boolean; validated: boolean; formId: string | null; sessionKind: SessionKind; notes: string[] }
  | { ok: false; available: number; required: number; reason: string; fallback: AssessmentKind | null };

const seeded = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
function shuffle<T>(xs: T[], seed: number): T[] {
  const r = seeded(seed);
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const toItem = (q: Question, pilot = false): PlannedItem => ({ key: `question:${q.id}`, type: "question", refId: q.id, revision: q.revision, estSeconds: q.estSeconds, ...(pilot ? { pilot } : {}) });

/**
 * Builds a quiz without duplicating items or manufacturing a score. Reserved forms
 * draw only from reserved pools; study quizzes only from study questions.
 */
export function buildAssessment(kind: AssessmentKind, lookup: Lookup, attempts: Attempt[], opts: { topicId?: string; seed?: number } = {}): BuildResult {
  const seed = opts.seed ?? Date.now();
  const seenFamilies = new Set(attempts.filter((a) => a.familyId).map((a) => a.familyId!));

  if (kind === "topic_quiz" || kind === "mixed_quiz") {
    const pool = lookup.studyQuestions.filter((q) => !opts.topicId || q.objectiveIds.some((o) => lookup.objectives.get(o)?.topicId === opts.topicId));
    const want = kind === "mixed_quiz" ? 10 : Math.min(8, pool.length);
    if (pool.length === 0) return { ok: false, available: 0, required: 1, reason: "No practice questions are available for this topic yet.", fallback: null };
    const fresh = shuffle(pool.filter((q) => !seenFamilies.has(q.familyId)), seed);
    const seen = shuffle(pool.filter((q) => seenFamilies.has(q.familyId)), seed + 1);
    const items = [...fresh, ...seen].slice(0, want).map((q) => toItem(q));
    return {
      ok: true,
      items,
      retake: false,
      validated: false,
      formId: null,
      sessionKind: kind,
      notes: items.length < want ? [`Only ${items.length} questions are available, so this quiz is shorter.`] : [],
    };
  }

  const reserved = [...lookup.questions.values()].filter((q) => q.pool !== "practice");
  const forms = new Map<string, Question[]>();
  for (const q of reserved) forms.set(q.pool, [...(forms.get(q.pool) ?? []), q]);
  const spec = ASSESSMENTS[kind];

  if (kind === "simulation") {
    const byDomain = EXAM.domains.map((d) => ({ d, qs: reserved.filter((q) => lookup.objectiveDomain(q.objectiveIds[0]) === d.id) }));
    const short = byDomain.find(({ d, qs }) => qs.length < d.scoredQuestions);
    if (short || reserved.length < EXAM.totalQuestions)
      return {
        ok: false,
        available: reserved.length,
        required: EXAM.totalQuestions,
        reason: `A full simulation needs ${EXAM.totalQuestions} distinct reserved questions (${EXAM.scoredQuestions} scored, allocated ${EXAM.domains.map((d) => `${d.scoredQuestions} ${d.name}`).join(", ")}, plus ${EXAM.pilotQuestions} pilots). The bank has ${reserved.length}, so a full simulation would mean repeating items or inventing a score.`,
        fallback: reserved.length >= 10 ? "form_quiz" : null,
      };
    const scored = byDomain.flatMap(({ d, qs }) => shuffle(qs, seed).slice(0, d.scoredQuestions));
    const scoredIds = new Set(scored.map((q) => q.id));
    const pilots = shuffle(reserved.filter((q) => !scoredIds.has(q.id)), seed + 7).slice(0, EXAM.pilotQuestions);
    const items = shuffle([...scored.map((q) => toItem(q)), ...pilots.map((q) => toItem(q, true))], seed + 3);
    const all = [...scored, ...pilots];
    return { ok: true, items, retake: all.some((q) => seenFamilies.has(q.familyId)), validated: all.every((q) => isValidatedPoolEligible(q.review)), formId: "simulation", sessionKind: "simulation", notes: [] };
  }

  const formA = forms.get("form-a") ?? [];
  if (formA.length < spec.required) {
    const fallback: AssessmentKind | null = kind !== "form_quiz" && formA.length >= ASSESSMENTS.form_quiz.required ? "form_quiz" : null;
    return {
      ok: false,
      available: formA.length,
      required: spec.required,
      reason: `${spec.title} needs ${spec.required} distinct reserved questions; ${formA.length} are written so far.`,
      fallback,
    };
  }
  const chosen = shuffle(formA, seed).slice(0, spec.required);
  return {
    ok: true,
    items: chosen.map((q) => toItem(q)),
    retake: chosen.some((q) => seenFamilies.has(q.familyId)),
    validated: chosen.every((q) => isValidatedPoolEligible(q.review)),
    formId: "form-a",
    sessionKind: "form_quiz",
    notes: [],
  };
}

// ---------------------------------------------------------------- Key corrections

export type Reconciled = { attempt: Attempt; status: "current" | "revised" | "key_corrected" | "removed"; correctedCorrect: boolean | null; note: string | null };

/** History is never rewritten: the original result stays, and any corrected result is shown alongside it. */
export function reconcile(a: Attempt, q: Question | undefined): Reconciled {
  if (a.itemType !== "question") return { attempt: a, status: "current", correctedCorrect: a.correct, note: null };
  if (!q) return { attempt: a, status: "removed", correctedCorrect: null, note: "This question is no longer in the content bank. Your original result is kept." };
  if (q.revision === a.revision) return { attempt: a, status: "current", correctedCorrect: a.correct, note: null };
  if (a.keyAtAttempt && a.keyAtAttempt !== q.correctChoiceId) {
    const corrected = a.response === q.correctChoiceId;
    const change = q.keyHistory.find((k) => k.revision >= a.revision);
    return {
      attempt: a,
      status: "key_corrected",
      correctedCorrect: corrected,
      note: `The answer key was corrected after you answered${change ? ` (${change.changedOn}: ${change.reason})` : ""}. Original result: ${a.correct ? "correct" : "incorrect"}; under the corrected key: ${corrected ? "correct" : "incorrect"}.`,
    };
  }
  return { attempt: a, status: "revised", correctedCorrect: a.correct, note: "The question wording was revised after you answered; the key did not change." };
}

// ---------------------------------------------------------------- Reports

export interface Tally { correct: number; total: number; limited: boolean }
const tally = (xs: { correct: boolean | null }[]): Tally => {
  const total = xs.length;
  return { correct: xs.filter((x) => x.correct).length, total, limited: total < CONTENT_POLICY.limitedEvidenceBelow };
};

export interface AssessmentReport {
  headline: Tally & { pct: number | null };
  pilots: Tally | null;
  byDomain: { domainId: string; name: string; tally: Tally }[];
  topicGaps: { topicId: string; title: string; missed: number; total: number }[];
  timeMs: number;
  calibration: { level: "guess" | "unsure" | "sure" | "not_rated"; tally: Tally }[];
  firstExposure: Tally;
  repeat: Tally;
  keyCorrections: Reconciled[];
  provisional: boolean;
  limitedEvidence: boolean;
}

export function buildReport(attempts: Attempt[], lookup: Lookup, opts: { validated?: boolean } = {}): AssessmentReport {
  const qs = attempts.filter((a) => a.itemType === "question" && a.response !== null);
  const reconciled = qs.map((a) => reconcile(a, lookup.questions.get(a.itemId)));
  const eff = reconciled.map((r) => ({ ...r.attempt, correct: r.correctedCorrect ?? r.attempt.correct }));
  const scored = eff.filter((a) => !a.pilot);
  const pilots = eff.filter((a) => a.pilot);
  const head = tally(scored);
  const topicMap = new Map<string, { missed: number; total: number }>();
  for (const a of scored) {
    const t = lookup.objectives.get(a.objectiveIds[0])?.topicId ?? "unknown";
    const cur = topicMap.get(t) ?? { missed: 0, total: 0 };
    cur.total++;
    if (!a.correct) cur.missed++;
    topicMap.set(t, cur);
  }
  return {
    headline: { ...head, pct: head.total ? Math.round((head.correct / head.total) * 100) : null },
    pilots: pilots.length ? tally(pilots) : null,
    byDomain: EXAM.domains.map((d) => ({ domainId: d.id, name: d.name, tally: tally(scored.filter((a) => lookup.objectiveDomain(a.objectiveIds[0]) === d.id)) })),
    topicGaps: [...topicMap.entries()]
      .filter(([, v]) => v.missed > 0)
      .map(([topicId, v]) => ({ topicId, title: lookup.topics.get(topicId)?.title ?? topicId, ...v }))
      .sort((a, b) => b.missed - a.missed),
    timeMs: attempts.reduce((s, a) => s + a.ms, 0),
    calibration: (["sure", "unsure", "guess", "not_rated"] as const).map((level) => ({
      level,
      tally: tally(scored.filter((a) => (a.confidence ?? "not_rated") === level)),
    })),
    firstExposure: tally(scored.filter((a) => a.firstExposure)),
    repeat: tally(scored.filter((a) => !a.firstExposure)),
    keyCorrections: reconciled.filter((r) => r.status !== "current"),
    provisional: !opts.validated,
    limitedEvidence: head.total < CONTENT_POLICY.limitedEvidenceBelow,
  };
}
