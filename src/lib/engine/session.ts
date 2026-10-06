import type { Attempt, Confidence, PlannedItem, SessionKind, SessionRecord } from "@/lib/schemas/learner";
import type { Lookup } from "./lookup";

export function newId(prefix: string, now = new Date()): string {
  const rand = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${now.getTime().toString(36)}-${rand}`;
}

export function createSession(opts: {
  kind: SessionKind;
  mode: "study" | "test";
  title: string;
  items: PlannedItem[];
  contentVersion: string;
  minutesBudget: number | null;
  reasons?: string[];
  timeLimitMinutes?: number | null;
  requireAnswer?: boolean;
  retake?: boolean;
  formId?: string | null;
  now?: Date;
}): SessionRecord {
  const now = opts.now ?? new Date();
  return {
    id: newId("ses", now),
    kind: opts.kind,
    mode: opts.mode,
    title: opts.title,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    contentVersion: opts.contentVersion,
    minutesBudget: opts.minutesBudget,
    items: opts.items,
    cursor: 0,
    status: "active",
    completedAt: null,
    reasons: opts.reasons ?? [],
    deadline: opts.timeLimitMinutes ? now.getTime() + opts.timeLimitMinutes * 60_000 : null,
    flagged: [],
    requireAnswer: opts.requireAnswer ?? false,
    retake: opts.retake ?? false,
    formId: opts.formId ?? null,
    autoSubmitted: false,
  };
}

export const attemptId = (sessionId: string, itemKey: string) => `${sessionId}:${itemKey}`;

export function makeAttempt(opts: {
  session: SessionRecord;
  item: PlannedItem;
  lookup: Lookup;
  response: string | null;
  confidence?: Confidence | null;
  startedAt: Date;
  answeredAt: Date;
  priorAttempts: Attempt[];
}): Attempt {
  const { session, item, lookup } = opts;
  let objectiveIds: string[] = [];
  let familyId: string | null = null;
  let key: string | null = null;
  let correct: boolean | null = null;
  if (item.type === "question") {
    const q = lookup.questions.get(item.refId)!;
    objectiveIds = q.objectiveIds;
    familyId = q.familyId;
    key = q.correctChoiceId;
    // In test mode correctness is computed only at submission.
    correct = session.mode === "test" ? null : opts.response === q.correctChoiceId;
  } else if (item.type === "visual") {
    const v = lookup.visuals.get(item.refId)!;
    objectiveIds = [v.objectiveId];
    familyId = `fam-vis-${v.id}`;
    key = v.correctHotspotId;
    correct = session.mode === "test" ? null : opts.response === v.correctHotspotId;
  } else if (item.type === "lesson") {
    objectiveIds = [lookup.lessons.get(item.refId)?.objectiveId ?? ""].filter(Boolean);
  } else if (item.type === "card") {
    objectiveIds = [lookup.cards.get(item.refId)?.objectiveId ?? ""].filter(Boolean);
  }
  const firstExposure = familyId ? !opts.priorAttempts.some((a) => a.familyId === familyId && a.sessionId !== session.id) : true;
  return {
    id: attemptId(session.id, item.key),
    sessionId: session.id,
    itemKey: item.key,
    itemType: item.type,
    itemId: item.refId,
    revision: item.revision,
    contentVersion: session.contentVersion,
    objectiveIds,
    familyId,
    response: opts.response,
    keyAtAttempt: key,
    correct,
    confidence: opts.confidence ?? null,
    mode: session.mode,
    scored: item.type === "question" || item.type === "visual",
    pilot: item.pilot ?? false,
    firstExposure,
    startedAt: opts.startedAt.toISOString(),
    answeredAt: opts.answeredAt.toISOString(),
    ms: Math.max(0, Math.min(opts.answeredAt.getTime() - opts.startedAt.getTime(), 15 * 60_000)),
  };
}

/** Grades test-mode drafts at submission. Unanswered items count as incorrect. */
export function gradeSubmission(session: SessionRecord, drafts: Attempt[], lookup: Lookup, now: Date, priorAttempts: Attempt[]): Attempt[] {
  const byKey = new Map(drafts.map((d) => [d.itemKey, d]));
  return session.items
    .filter((i) => i.type === "question" || i.type === "visual")
    .map((item) => {
      const d = byKey.get(item.key) ?? makeAttempt({ session, item, lookup, response: null, startedAt: now, answeredAt: now, priorAttempts });
      return { ...d, correct: d.response !== null && d.response === d.keyAtAttempt };
    });
}

export function remainingMs(session: SessionRecord, now: number): number | null {
  return session.deadline === null ? null : Math.max(0, session.deadline - now);
}

export const isExpired = (session: SessionRecord, now: number) => session.deadline !== null && now >= session.deadline && session.status === "active";
