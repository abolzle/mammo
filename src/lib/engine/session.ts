import type { ModuleContent, Question } from "@/lib/schemas/content";
import type { ObjectiveHistory, ResponseEvent, SessionItem, StudySession } from "@/lib/schemas/learner";
import { eventId, nowIso } from "./ids";
import { emptySchedule, reviewCard } from "./scheduler";
import type { CardSchedule } from "@/lib/schemas/learner";

export function liveElapsedMs(session: StudySession, now = Date.now()): number {
  if (session.status !== "in_progress") return session.elapsedMs;
  const anchor = new Date(session.elapsedAnchorAt).getTime();
  return session.elapsedMs + Math.max(0, now - anchor);
}

export function commitElapsed(session: StudySession, now = new Date()): StudySession {
  const elapsedMs = liveElapsedMs(session, now.getTime());
  return { ...session, elapsedMs, elapsedAnchorAt: now.toISOString(), lastActiveAt: now.toISOString() };
}

export function remainingMs(session: StudySession, now = Date.now()): number | null {
  if (!session.timed || session.timeLimitMs == null) return null;
  return Math.max(0, session.timeLimitMs - liveElapsedMs(session, now));
}

export function applyAnswer(args: {
  session: StudySession;
  itemId: string;
  answer: string;
  correct: boolean | null;
  selfRating?: 1 | 2 | 3 | 4 | null;
  confidence?: number | null;
  firstExposure: boolean;
}): { session: StudySession; event: ResponseEvent } {
  const existingItem = args.session.items.find((i) => i.id === args.itemId);
  if (existingItem?.status === "answered") {
    return {
      session: args.session,
      event: {
        id: eventId(args.session.id, args.itemId),
        sessionId: args.session.id,
        itemId: args.itemId,
        contentId: existingItem.contentId,
        contentRevision: existingItem.revision,
        type: existingItem.type,
        answer: existingItem.selected ?? args.answer,
        correct: existingItem.correct ?? args.correct,
        confidence: existingItem.confidence ?? null,
        selfRating: existingItem.selfRating ?? null,
        objectiveIds: existingItem.objectiveIds,
        firstExposure: args.firstExposure,
        createdAt: existingItem.answeredAt ?? nowIso(),
        elapsedMs: liveElapsedMs(args.session),
      },
    };
  }
  const now = nowIso();
  const items = args.session.items.map((it) =>
    it.id === args.itemId
      ? {
          ...it,
          status: "answered" as const,
          selected: args.answer,
          correct: args.correct,
          selfRating: args.selfRating ?? it.selfRating,
          confidence: args.confidence ?? it.confidence,
          answeredAt: now,
          revealed: args.session.mode === "study" ? true : it.revealed,
        }
      : it,
  );
  const item = items.find((i) => i.id === args.itemId)!;
  const event: ResponseEvent = {
    id: eventId(args.session.id, args.itemId),
    sessionId: args.session.id,
    itemId: args.itemId,
    contentId: item.contentId,
    contentRevision: item.revision,
    type: item.type,
    answer: args.answer,
    correct: args.correct,
    confidence: args.confidence ?? null,
    selfRating: args.selfRating ?? null,
    objectiveIds: item.objectiveIds,
    firstExposure: args.firstExposure,
    createdAt: now,
    elapsedMs: liveElapsedMs(args.session),
  };
  const nextIndex = Math.min(args.session.currentIndex + 1, items.length - 1);
  return {
    session: commitElapsed({
      ...args.session,
      items,
      currentIndex: args.session.mode === "test" ? nextIndex : args.session.currentIndex,
    }),
    event,
  };
}

export function revealItem(session: StudySession, itemId: string): StudySession {
  return {
    ...session,
    items: session.items.map((it) => (it.id === itemId ? { ...it, revealed: true } : it)),
  };
}

export function completeSession(session: StudySession): StudySession {
  const now = nowIso();
  return commitElapsed({
    ...session,
    status: "completed",
    completedAt: now,
    submitted: true,
    items: session.items.map((it) => (it.type === "recap" ? { ...it, status: "answered", revealed: true } : it)),
  });
}

export function submitTest(session: StudySession): StudySession {
  return completeSession({
    ...session,
    items: session.items.map((it) => ({ ...it, revealed: true })),
    submitted: true,
  });
}

export function scoreSession(session: StudySession) {
  const scored = session.items.filter((i) => i.type === "question" || i.type === "visual");
  const answered = scored.filter((i) => i.status === "answered");
  const correct = answered.filter((i) => i.correct).length;
  const total = scored.length;
  const pct = total === 0 ? null : Math.round((1000 * correct) / total) / 10;
  return { correct, total, answered: answered.length, pct, limited: answered.length < 20 };
}

export function questionCorrect(q: Question, choiceId: string): boolean {
  return q.correctChoiceId === choiceId;
}

export function bumpObjective(
  existing: ObjectiveHistory | undefined,
  objectiveId: string,
  correct: boolean | null,
): ObjectiveHistory {
  const base: ObjectiveHistory = existing ?? {
    objectiveId,
    seen: 0,
    correct: 0,
    incorrect: 0,
    lastSeenAt: null,
    weakUntil: null,
  };
  const now = nowIso();
  const next: ObjectiveHistory = {
    ...base,
    seen: base.seen + 1,
    lastSeenAt: now,
  };
  if (correct === true) next.correct += 1;
  if (correct === false) {
    next.incorrect += 1;
    next.weakUntil = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  }
  return next;
}

export function scheduleAfterCard(
  existing: CardSchedule | undefined,
  cardId: string,
  rating: 1 | 2 | 3 | 4,
): CardSchedule {
  const sch = existing ?? emptySchedule(cardId);
  return reviewCard(sch, rating);
}

export function currentItem(session: StudySession): SessionItem | undefined {
  return session.items[session.currentIndex];
}

export function findQuestion(modules: ModuleContent[], id: string): Question | undefined {
  for (const m of modules) {
    const q = m.questions.find((x) => x.id === id);
    if (q) return q;
  }
}
