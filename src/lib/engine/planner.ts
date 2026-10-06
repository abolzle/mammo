import { EXAM } from "@/config/exam";
import type { Curriculum, Lesson, ModuleContent, Question, RecallCard, VisualExercise } from "@/lib/schemas/content";
import type { CardSchedule, MinutesPref, ObjectiveHistory, Profile, SessionItem } from "@/lib/schemas/learner";
import { isDue } from "./scheduler";
import { isLearnerVisible } from "@/lib/content/validate";
import { newId } from "./ids";

export type Catalog = {
  curriculum: Curriculum;
  modules: ModuleContent[];
};

export type PlanResult = {
  items: SessionItem[];
  why: string;
  budgetMinutes: number;
  truncated: boolean;
};

const DAILY_POOL = "practice";

export function practiceQuestions(modules: ModuleContent[]): Question[] {
  return modules.flatMap((m) =>
    m.questions.filter((q) => q.pool === DAILY_POOL && isLearnerVisible(q.review.status) && q.review.status !== "disputed"),
  );
}

export function reservedFamilies(modules: ModuleContent[]): Set<string> {
  const set = new Set<string>();
  for (const m of modules) {
    for (const q of m.questions) {
      if (q.pool !== DAILY_POOL) set.add(q.familyId);
    }
  }
  return set;
}

export function learnerLessons(modules: ModuleContent[]): Lesson[] {
  return modules.flatMap((m) => m.lessons.filter((l) => isLearnerVisible(l.review.status)));
}

export function learnerCards(modules: ModuleContent[]): RecallCard[] {
  return modules.flatMap((m) => m.cards.filter((c) => isLearnerVisible(c.review.status)));
}

export function learnerVisuals(modules: ModuleContent[]): VisualExercise[] {
  return modules.flatMap((m) => m.visuals.filter((v) => isLearnerVisible(v.review.status)));
}

function itemFromQuestion(q: Question): SessionItem {
  return {
    id: newId("it"),
    type: "question",
    contentId: q.id,
    revision: q.revision,
    objectiveIds: q.objectiveIds,
    familyId: q.familyId,
    pool: q.pool,
    estSeconds: q.estSeconds,
    status: "pending",
    revealed: false,
  };
}

function itemFromCard(c: RecallCard): SessionItem {
  return {
    id: newId("it"),
    type: "card",
    contentId: c.id,
    revision: c.revision,
    objectiveIds: [c.objectiveId],
    familyId: null,
    pool: DAILY_POOL,
    estSeconds: c.estSeconds,
    status: "pending",
    revealed: false,
  };
}

function itemFromLesson(l: Lesson): SessionItem {
  return {
    id: newId("it"),
    type: "lesson",
    contentId: l.id,
    revision: l.revision,
    objectiveIds: [l.objectiveId],
    familyId: null,
    pool: DAILY_POOL,
    estSeconds: Math.round(l.estMinutes * 60),
    status: "pending",
    revealed: false,
  };
}

function itemFromVisual(v: VisualExercise): SessionItem {
  return {
    id: newId("it"),
    type: "visual",
    contentId: v.id,
    revision: v.revision,
    objectiveIds: [v.objectiveId],
    familyId: null,
    pool: DAILY_POOL,
    estSeconds: v.estSeconds,
    status: "pending",
    revealed: false,
  };
}

function recapItem(): SessionItem {
  return {
    id: newId("it"),
    type: "recap",
    contentId: "recap",
    revision: 1,
    objectiveIds: [],
    familyId: null,
    pool: null,
    estSeconds: 45,
    status: "pending",
    revealed: false,
  };
}

function pack(candidates: SessionItem[], budgetSeconds: number): SessionItem[] {
  const out: SessionItem[] = [];
  let used = 0;
  for (const c of candidates) {
    if (used + c.estSeconds > budgetSeconds) continue;
    out.push(c);
    used += c.estSeconds;
  }
  return out;
}

export function planStudySession(args: {
  catalog: Catalog;
  profile: Profile;
  minutes: MinutesPref;
  schedules: CardSchedule[];
  histories: ObjectiveHistory[];
  seenContent: Set<string>;
  now?: Date;
}): PlanResult {
  const now = args.now ?? new Date();
  const budgetSeconds = args.minutes * 60;
  const recap = recapItem();
  const workBudget = Math.max(60, budgetSeconds - recap.estSeconds);

  const reserved = reservedFamilies(args.catalog.modules);
  const questions = practiceQuestions(args.catalog.modules).filter((q) => !reserved.has(q.familyId));
  const cards = learnerCards(args.catalog.modules);
  const lessons = learnerLessons(args.catalog.modules);
  const visuals = learnerVisuals(args.catalog.modules);

  const dueCards = cards.filter((c) => {
    const sch = args.schedules.find((s) => s.cardId === c.id);
    return !sch || isDue(sch, now);
  });
  const weak = new Set(
    args.histories.filter((h) => h.incorrect > h.correct && h.seen > 0).map((h) => h.objectiveId),
  );
  const unseenLessons = lessons.filter((l) => !args.seenContent.has(l.id));
  const weakQuestions = questions.filter((q) => q.objectiveIds.some((id) => weak.has(id)));
  const unseenQuestions = questions.filter((q) => !args.seenContent.has(q.id));
  const unseenVisuals = visuals.filter((v) => !args.seenContent.has(v.id));

  const reasons: string[] = [];
  const ordered: SessionItem[] = [];

  const dueTake = dueCards.slice(0, args.minutes <= 5 ? 2 : 4);
  if (dueTake.length) {
    reasons.push(`You're reviewing ${dueTake.length === 1 ? "a due recall card" : `${dueTake.length} due recall cards`}.`);
    ordered.push(...dueTake.map(itemFromCard));
  }

  const lesson = unseenLessons[0] ?? lessons.find((l) => weak.has(l.objectiveId));
  if (lesson && args.minutes >= 10) {
    reasons.push(`Then a short lesson on ${lesson.title.replace(/:.*/, "").toLowerCase()}.`);
    ordered.push(itemFromLesson(lesson));
    const check = questions.find((q) => q.id === lesson.checkQuestionId);
    if (check) ordered.push(itemFromQuestion(check));
  }

  const vis = unseenVisuals[0];
  if (vis && args.minutes >= 10 && !ordered.some((i) => i.type === "visual")) {
    ordered.push(itemFromVisual(vis));
  }

  const qPool = [...weakQuestions, ...unseenQuestions, ...questions];
  const usedQ = new Set(ordered.filter((i) => i.type === "question").map((i) => i.contentId));
  for (const q of qPool) {
    if (usedQ.has(q.id)) continue;
    usedQ.add(q.id);
    ordered.push(itemFromQuestion(q));
  }

  const packed = pack(ordered, workBudget);
  packed.push(recap);

  if (!reasons.length) {
    reasons.push("A short mix of MQSA practice so a small window still moves you forward.");
  }

  const domainHint = coverageHint(args.catalog, args.histories);
  if (domainHint) reasons.push(domainHint);

  return {
    items: packed,
    why: reasons.join(" "),
    budgetMinutes: args.minutes,
    truncated: packed.filter((i) => i.type !== "recap").length < ordered.filter((i) => i.type !== "recap").length,
  };
}

function coverageHint(catalog: Catalog, histories: ObjectiveHistory[]): string | null {
  const byDomain = new Map<string, { seen: number; total: number }>();
  for (const d of EXAM.domains) byDomain.set(d.id, { seen: 0, total: 0 });
  const topicDomain = new Map(catalog.curriculum.topics.map((t) => [t.id, t.domainId]));
  const hist = new Map(histories.map((h) => [h.objectiveId, h]));
  for (const o of catalog.curriculum.objectives) {
    const d = topicDomain.get(o.topicId);
    if (!d || !byDomain.has(d)) continue;
    const rec = byDomain.get(d)!;
    rec.total += 1;
    if ((hist.get(o.id)?.seen ?? 0) > 0) rec.seen += 1;
  }
  const thin = [...byDomain.entries()].find(([, v]) => v.total > 0 && v.seen / v.total < 0.1);
  if (thin) {
    const name = EXAM.domains.find((d) => d.id === thin[0])?.name;
    return `We'll keep some ${name} material in the mix so one domain doesn't drop out.`;
  }
  return null;
}

export function planQuiz(args: {
  catalog: Catalog;
  size: number;
  topicId?: string;
  mode: "study" | "test";
}): { items: SessionItem[]; why: string; offered: number; requested: number; shorter: boolean } {
  const reserved = reservedFamilies(args.catalog.modules);
  let qs = practiceQuestions(args.catalog.modules).filter((q) => !reserved.has(q.familyId));
  if (args.topicId) {
    const objIds = new Set(args.catalog.curriculum.objectives.filter((o) => o.topicId === args.topicId).map((o) => o.id));
    qs = qs.filter((q) => q.objectiveIds.some((id) => objIds.has(id)));
  }
  const requested = args.size;
  const slice = qs.slice(0, requested);
  const shorter = slice.length < requested;
  const why = shorter
    ? `The available beta bank has ${slice.length} questions for this request, not ${requested}. This is a shorter quiz, not a padded score.`
    : `A ${slice.length}-question beta quiz from the practice pool. Results are provisional practice, not a readiness estimate.`;
  return { items: [...slice.map(itemFromQuestion), recapItem()], why, offered: slice.length, requested, shorter };
}

export function planFullSimulationUnavailable(requested: number, available: number) {
  return {
    allowed: false as const,
    message: `A ${requested}-question simulation is not offered. The practice pool currently has ${available} items, and reserved form families stay out of daily study. Use a shorter beta quiz instead of a fabricated full-length result.`,
  };
}

export function planLessonSession(lesson: Lesson, check: Question | undefined): SessionItem[] {
  const items = [itemFromLesson(lesson)];
  if (check) items.push(itemFromQuestion(check));
  items.push(recapItem());
  return items;
}
