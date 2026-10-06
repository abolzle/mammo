import { EXAM, domainShare } from "@/config/exam";
import type { Attempt, CardState, PlannedItem } from "@/lib/schemas/learner";
import type { Question } from "@/lib/schemas/content";
import type { Lookup } from "./lookup";
import { isDue } from "./scheduler";

export interface PlanInput {
  minutes: number;
  now: Date;
  lookup: Lookup;
  attempts: Attempt[];
  cardStates: CardState[];
  lastActiveAt: string | null;
}

export interface Plan {
  items: PlannedItem[];
  reasons: string[];
  budgetSeconds: number;
  estSeconds: number;
  deferredCards: number;
  paceFactor: number;
  focus: string[];
}

export const RECAP_SECONDS = 30;
export const DUE_CARD_SHARE = 0.35;
export const LONG_ABSENCE_DAYS = 14;
const DAY = 86_400_000;

/** Ratio of observed to estimated time on recent questions, clamped so one slow day can't distort the plan. */
export function paceFactor(attempts: Attempt[], lookup: Lookup): number {
  const ratios = attempts
    .filter((a) => a.itemType === "question" && a.ms > 0 && a.mode === "study")
    .sort((a, b) => b.answeredAt.localeCompare(a.answeredAt))
    .slice(0, 20)
    .map((a) => a.ms / 1000 / (lookup.questions.get(a.itemId)?.estSeconds ?? 60))
    .sort((a, b) => a - b);
  if (ratios.length < 5) return 1;
  const median = ratios[Math.floor(ratios.length / 2)];
  return Math.min(1.5, Math.max(0.75, median));
}

export interface ObjectiveStat {
  objectiveId: string;
  attempts: number;
  correct: number;
  recentWrong: number;
  lastAt: string | null;
}

export function objectiveStats(attempts: Attempt[]): Map<string, ObjectiveStat> {
  const graded = attempts.filter((a) => (a.itemType === "question" || a.itemType === "visual") && a.correct !== null && !a.pilot);
  const byObj = new Map<string, Attempt[]>();
  for (const a of graded) for (const o of a.objectiveIds) byObj.set(o, [...(byObj.get(o) ?? []), a]);
  const out = new Map<string, ObjectiveStat>();
  for (const [o, list] of byObj) {
    list.sort((a, b) => b.answeredAt.localeCompare(a.answeredAt));
    const recent = list.slice(0, 3);
    out.set(o, {
      objectiveId: o,
      attempts: list.length,
      correct: list.filter((a) => a.correct).length,
      recentWrong: recent.filter((a) => !a.correct).length,
      lastAt: list[0]?.answeredAt ?? null,
    });
  }
  return out;
}

export function weakObjectives(stats: Map<string, ObjectiveStat>): ObjectiveStat[] {
  return [...stats.values()]
    .filter((s) => s.recentWrong >= 1 && s.correct / s.attempts < 0.75)
    .sort((a, b) => b.recentWrong - a.recentWrong || (b.lastAt ?? "").localeCompare(a.lastAt ?? ""));
}

export function planDailySession(input: PlanInput): Plan {
  const { lookup, attempts, now } = input;
  const pace = paceFactor(attempts, lookup);
  const budget = Math.round(input.minutes * 60);
  const items: PlannedItem[] = [];
  const reasons: string[] = [];
  const focus: string[] = [];
  let used = RECAP_SECONDS;
  const est = (s: number) => Math.round(s * pace);
  const fits = (s: number) => used + s <= budget;
  const add = (item: Omit<PlannedItem, "estSeconds"> & { baseSeconds: number }) => {
    const { baseSeconds, ...rest } = item;
    const s = est(baseSeconds);
    items.push({ ...rest, estSeconds: s });
    used += s;
  };
  const inSession = new Set<string>();
  const familiesInSession = new Set<string>();

  const lastSeenFamily = new Map<string, string>();
  for (const a of attempts) if (a.familyId && (lastSeenFamily.get(a.familyId) ?? "") < a.answeredAt) lastSeenFamily.set(a.familyId, a.answeredAt);
  const lessonsDone = new Set(attempts.filter((a) => a.itemType === "lesson").map((a) => a.itemId));
  const stats = objectiveStats(attempts);

  const coolDown = now.getTime() - 2 * DAY;
  const pickQuestion = (pred: (q: Question) => boolean, avoidFamilies: Set<string> = new Set()): Question | undefined => {
    const pool = lookup.studyQuestions.filter(
      (q) => pred(q) && !inSession.has(q.id) && !familiesInSession.has(q.familyId) && !avoidFamilies.has(q.familyId),
    );
    const rested = pool.filter((q) => {
      const seen = lastSeenFamily.get(q.familyId);
      return !seen || new Date(seen).getTime() < coolDown;
    });
    const candidates = rested.length ? rested : pool;
    // Unseen families first, then the least recently seen.
    return candidates.sort((a, b) => (lastSeenFamily.get(a.familyId) ?? "").localeCompare(lastSeenFamily.get(b.familyId) ?? "") || a.id.localeCompare(b.id))[0];
  };
  const addQuestion = (q: Question, reason?: string) => {
    add({ key: `question:${q.id}`, type: "question", refId: q.id, revision: q.revision, reason, baseSeconds: q.estSeconds });
    inSession.add(q.id);
    familiesInSession.add(q.familyId);
  };
  const objTitle = (id: string) => lookup.objectives.get(id)?.statement.replace(/\.$/, "") ?? id;
  const topicTitle = (objId: string) => lookup.topics.get(lookup.objectives.get(objId)?.topicId ?? "")?.title ?? objTitle(objId);

  // 1. Long absence: a short recheck of things previously answered correctly.
  const daysAway = input.lastActiveAt ? Math.floor((now.getTime() - new Date(input.lastActiveAt).getTime()) / DAY) : 0;
  if (attempts.length && daysAway > LONG_ABSENCE_DAYS) {
    const known = [...stats.values()].filter((s) => s.correct > 0).sort((a, b) => (a.lastAt ?? "").localeCompare(b.lastAt ?? ""));
    let added = 0;
    for (const s of known) {
      if (added >= 3) break;
      const q = pickQuestion((x) => x.objectiveIds.includes(s.objectiveId));
      if (q && fits(est(q.estSeconds))) {
        addQuestion(q, `Recheck after ${daysAway} days away`);
        added++;
      }
    }
    if (added) reasons.push(`It's been ${daysAway} days, so we start with a quick ${added}-question recheck of things you knew before. No catching up required.`);
  }

  // 2. Due recall cards, capped so a backlog never takes over the session.
  const visibleCards = new Set(lookup.cards.keys());
  const due = input.cardStates.filter((c) => visibleCards.has(c.cardId) && isDue(c, now)).sort((a, b) => a.due.localeCompare(b.due));
  const cardCap = Math.max(est(20), Math.floor(budget * DUE_CARD_SHARE));
  let cardSeconds = 0;
  let dueTaken = 0;
  for (const c of due) {
    const card = lookup.cards.get(c.cardId)!;
    const s = est(card.estSeconds);
    if (cardSeconds + s > cardCap || !fits(s)) break;
    add({ key: `card:${card.id}`, type: "card", refId: card.id, revision: card.revision, reason: "Due for review", baseSeconds: card.estSeconds });
    cardSeconds += s;
    dueTaken++;
  }
  const deferredCards = due.length - dueTaken;
  if (dueTaken)
    reasons.push(
      deferredCards > 0
        ? `${dueTaken} recall cards are due now. ${deferredCards} more will be spread over the next few sessions so nothing piles up.`
        : `${dueTaken} recall card${dueTaken === 1 ? " is" : "s are"} due, so memory gets a quick refresh before it fades.`,
    );

  // 3. Weak concept repair, using a different example than the one missed.
  const weak = weakObjectives(stats).filter((w) => lookup.studyQuestions.some((q) => q.objectiveIds.includes(w.objectiveId)));
  for (const w of weak.slice(0, 2)) {
    const missedFamilies = new Set(
      attempts.filter((a) => a.objectiveIds.includes(w.objectiveId) && a.correct === false && a.familyId).map((a) => a.familyId!),
    );
    const q = pickQuestion((x) => x.objectiveIds.includes(w.objectiveId), missedFamilies);
    if (q && fits(est(q.estSeconds))) {
      addQuestion(q, `Repair: ${topicTitle(w.objectiveId)}`);
      focus.push(w.objectiveId);
      reasons.push(
        `You're revisiting ${topicTitle(w.objectiveId).toLowerCase()} because ${w.recentWrong === 1 ? "a recent question was" : `${w.recentWrong} recent questions were`} difficult. This one uses a different example.`,
      );
    }
  }

  // 4. Next lesson whose prerequisites are met.
  const prereqMet = (objId: string) =>
    (lookup.objectives.get(objId)?.prerequisites ?? []).every((p) => {
      const l = lookup.lessonForObjective.get(p);
      return !l || lessonsDone.has(l.id);
    });
  const nextLesson = [...lookup.lessons.values()].find((l) => !lessonsDone.has(l.id) && prereqMet(l.objectiveId));
  if (nextLesson) {
    const check = lookup.questions.get(nextLesson.checkQuestionId);
    const lessonSeconds = est(nextLesson.estMinutes * 60) + (check ? est(check.estSeconds) : 0);
    if (fits(lessonSeconds) && lessonSeconds <= (budget - used) * 0.85 + RECAP_SECONDS) {
      add({ key: `lesson:${nextLesson.id}`, type: "lesson", refId: nextLesson.id, revision: nextLesson.revision, reason: "New lesson", baseSeconds: nextLesson.estMinutes * 60 });
      if (check && !inSession.has(check.id) && !lookup.reservedFamilies.has(check.familyId)) addQuestion(check, "Lesson check");
      focus.push(nextLesson.objectiveId);
      reasons.push(`A ${nextLesson.estMinutes}-minute lesson: ${nextLesson.title}. It ends with a quick check.`);
    } else {
      reasons.push(`The next lesson takes about ${Math.ceil(lessonSeconds / 60)} minutes, so today focuses on review and practice. Choose a longer session when you have time.`);
    }
  } else if (lookup.lessons.size) {
    reasons.push("You've finished every available lesson. New modules will appear as content is added.");
  }

  // 5. Application questions weighted toward blueprint domains you've practised least.
  const answeredByDomain = new Map<string, number>();
  for (const a of attempts) if (a.itemType === "question" && a.objectiveIds[0]) {
    const d = lookup.objectiveDomain(a.objectiveIds[0]);
    answeredByDomain.set(d, (answeredByDomain.get(d) ?? 0) + 1);
  }
  const available = new Set(lookup.studyQuestions.map((q) => lookup.objectiveDomain(q.objectiveIds[0])));
  let guard = 0;
  while (guard++ < 50) {
    const total = [...answeredByDomain.values()].reduce((a, b) => a + b, 0) + 1;
    const domains = EXAM.domains
      .filter((d) => available.has(d.id))
      .map((d) => ({ id: d.id, deficit: domainShare(d.id) - (answeredByDomain.get(d.id) ?? 0) / total }))
      .sort((a, b) => b.deficit - a.deficit);
    let picked: Question | undefined;
    for (const d of domains) {
      picked =
        pickQuestion((q) => lookup.objectiveDomain(q.objectiveIds[0]) === d.id && q.objectiveIds.some((o) => lessonsDone.has(lookup.lessonForObjective.get(o)?.id ?? ""))) ??
        pickQuestion((q) => lookup.objectiveDomain(q.objectiveIds[0]) === d.id);
      if (picked && fits(est(picked.estSeconds))) break;
      picked = undefined;
    }
    if (!picked) break;
    addQuestion(picked, "Practice");
    const d = lookup.objectiveDomain(picked.objectiveIds[0]);
    answeredByDomain.set(d, (answeredByDomain.get(d) ?? 0) + 1);
  }
  const practiceCount = items.filter((i) => i.reason === "Practice").length;
  if (practiceCount) reasons.push(`${practiceCount} application question${practiceCount === 1 ? "" : "s"}, balanced across exam domains in proportion to the ARRT blueprint.`);

  // 6. New recall cards for lessons already studied, if time remains.
  const known = new Set(input.cardStates.map((c) => c.cardId));
  const newCards = [...lookup.cards.values()].filter((c) => !known.has(c.id) && lessonsDone.has(lookup.lessonForObjective.get(c.objectiveId)?.id ?? "") && !inSession.has(c.id));
  let newTaken = 0;
  for (const c of newCards) {
    if (newTaken >= 4 || !fits(est(c.estSeconds))) break;
    add({ key: `card:${c.id}`, type: "card", refId: c.id, revision: c.revision, reason: "New card", baseSeconds: c.estSeconds });
    newTaken++;
  }
  if (newTaken) reasons.push(`${newTaken} new recall card${newTaken === 1 ? "" : "s"} from lessons you've finished.`);

  items.push({ key: "recap", type: "recap", refId: "recap", revision: 1, estSeconds: RECAP_SECONDS });

  return { items, reasons, budgetSeconds: budget, estSeconds: used, deferredCards, paceFactor: pace, focus };
}

/** Honest feasibility check against the learner's exam date. */
export function timeCheck(opts: { examDate: string | null; now: Date; studyDays: number[]; minutes: number; remainingLessonMinutes: number }) {
  if (!opts.examDate) return null;
  const days = Math.max(0, Math.ceil((new Date(opts.examDate).getTime() - opts.now.getTime()) / DAY));
  const sessions = Math.floor((days / 7) * Math.max(1, opts.studyDays.length));
  const available = sessions * opts.minutes;
  const needed = Math.ceil(opts.remainingLessonMinutes * 2.5); // lessons plus their review and practice
  return { days, sessions, availableMinutes: available, neededMinutes: needed, enough: available >= needed };
}
