import { CONTENT_POLICY, EXAM } from "@/config/exam";
import type { Curriculum, Question } from "@/lib/schemas/content";
import type { ResponseEvent, SessionItem, StudySession } from "@/lib/schemas/learner";
import { eventId, nowIso } from "./ids";
import { commitElapsed, liveElapsedMs, remainingMs } from "./session";

export const CONFIDENCE_LEVELS = [
  { value: 1, label: "Guessing" },
  { value: 3, label: "Unsure" },
  { value: 5, label: "Confident" },
] as const;

/** Before submission a test-mode item exposes nothing about the key. */
export function feedbackVisible(session: StudySession): boolean {
  return session.mode === "study" || session.submitted;
}

function patchItem(session: StudySession, itemId: string, patch: Partial<SessionItem>): StudySession {
  return { ...session, items: session.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)) };
}

/** Saves (or changes) an answer without grading it. */
export function setTestAnswer(session: StudySession, itemId: string, choiceId: string, now = new Date()): StudySession {
  if (session.submitted || session.status !== "in_progress") return session;
  return commitElapsed(patchItem(session, itemId, { selected: choiceId, status: "answered", answeredAt: now.toISOString() }), now);
}

export function setConfidence(session: StudySession, itemId: string, confidence: number | null): StudySession {
  if (session.submitted) return session;
  return patchItem(session, itemId, { confidence });
}

export function toggleFlag(session: StudySession, itemId: string): StudySession {
  if (session.submitted) return session;
  const it = session.items.find((i) => i.id === itemId);
  return patchItem(session, itemId, { flagged: !it?.flagged });
}

/** Furthest index the learner may reach. With requireAnswer, every earlier item must be answered. */
export function reachableIndex(session: StudySession): number {
  if (!session.assessment?.requireAnswer) return session.items.length - 1;
  const firstOpen = session.items.findIndex((i) => i.status !== "answered");
  return firstOpen === -1 ? session.items.length - 1 : firstOpen;
}

export function canAdvance(session: StudySession): boolean {
  if (session.currentIndex >= session.items.length - 1) return false;
  return session.currentIndex + 1 <= reachableIndex(session);
}

export function goToIndex(session: StudySession, index: number): StudySession {
  if (index < 0 || index >= session.items.length) return session;
  if (index > reachableIndex(session)) return session;
  return commitElapsed({ ...session, currentIndex: index });
}

export function unansweredCount(session: StudySession): number {
  return session.items.filter((i) => i.status !== "answered").length;
}

export function canSubmit(session: StudySession): boolean {
  if (session.submitted) return false;
  return !session.assessment?.requireAnswer || unansweredCount(session) === 0;
}

export function submitAssessment(
  session: StudySession,
  lookup: (contentId: string) => Question | undefined,
  reason: "learner" | "time_expired" = "learner",
  now = new Date(),
): StudySession {
  if (session.submitted) return session;
  const committed = commitElapsed(session, now);
  const elapsedMs = committed.timeLimitMs != null && committed.timed ? Math.min(committed.elapsedMs, committed.timeLimitMs) : committed.elapsedMs;
  return {
    ...committed,
    elapsedMs,
    status: "completed",
    completedAt: now.toISOString(),
    submitted: true,
    assessment: committed.assessment ? { ...committed.assessment, submitReason: reason } : undefined,
    items: committed.items.map((it) => {
      const q = lookup(it.contentId);
      const answered = it.status === "answered" && it.selected;
      return { ...it, revealed: true, correct: answered && q ? q.correctChoiceId === it.selected : answered ? null : false };
    }),
  };
}

/** Submits automatically once a timed session runs out, including after a refresh or long background. */
export function expireIfDue(session: StudySession, lookup: (contentId: string) => Question | undefined, now = Date.now()): StudySession {
  if (session.status !== "in_progress" || session.submitted || !session.timed) return session;
  if (remainingMs(session, now) !== 0) return session;
  return submitAssessment(session, lookup, "time_expired", new Date(now));
}

/** Response events written once, at submission, with stable ids so a retried submit does not double count. */
export function submissionEvents(session: StudySession): ResponseEvent[] {
  if (!session.submitted) return [];
  return session.items
    .filter((it) => it.type === "question" && it.status === "answered")
    .map((it) => ({
      id: eventId(session.id, it.id),
      sessionId: session.id,
      itemId: it.id,
      contentId: it.contentId,
      contentRevision: it.revision,
      type: it.type,
      answer: it.selected ?? null,
      correct: it.correct ?? null,
      confidence: it.confidence ?? null,
      selfRating: null,
      objectiveIds: it.objectiveIds,
      firstExposure: !it.priorExposure,
      createdAt: it.answeredAt ?? session.completedAt ?? nowIso(),
      elapsedMs: session.elapsedMs,
    }));
}

export type Tally = { correct: number; total: number; pct: number | null; limited: boolean };

function tally(items: SessionItem[], limitBelow = CONTENT_POLICY.limitedEvidenceBelow): Tally {
  const total = items.length;
  const correct = items.filter((i) => i.correct).length;
  return { correct, total, pct: total ? Math.round((1000 * correct) / total) / 10 : null, limited: total < limitBelow };
}

export type AssessmentReport = {
  headline: Tally & { unanswered: number };
  domains: { id: string; name: string; tally: Tally; subdomains: { id: string; name: string; tally: Tally }[] }[];
  pilots: (Tally & { marked: number; designated: number }) | null;
  timing: { elapsedMs: number; limitMs: number | null; perItemSeconds: number | null; mode: string; expired: boolean };
  calibration: { value: number; label: string; tally: Tally }[];
  noConfidence: number;
  exposure: { first: Tally; repeat: Tally };
  topicGaps: { topicId: string; title: string; tally: Tally }[];
  retake: boolean;
  attempt: number;
  standard: boolean;
};

export function assessmentReport(session: StudySession, curriculum: Curriculum): AssessmentReport {
  const questions = session.items.filter((i) => i.type === "question");
  const scored = questions.filter((i) => i.role !== "pilot");
  const pilots = questions.filter((i) => i.role === "pilot");
  const objTopic = new Map(curriculum.objectives.map((o) => [o.id, o.topicId]));

  const domains = EXAM.domains.map((d) => {
    const subIds = new Set(d.subdomains.map((s) => s.id));
    return {
      id: d.id,
      name: d.name,
      tally: tally(scored.filter((i) => i.subdomainId && subIds.has(i.subdomainId))),
      subdomains: d.subdomains.map((s) => ({ id: s.id, name: s.name, tally: tally(scored.filter((i) => i.subdomainId === s.id)) })),
    };
  });

  const byTopic = new Map<string, SessionItem[]>();
  for (const it of scored) {
    const t = it.objectiveIds.map((o) => objTopic.get(o)).find(Boolean);
    if (!t) continue;
    byTopic.set(t, [...(byTopic.get(t) ?? []), it]);
  }
  const topicGaps = [...byTopic.entries()]
    .map(([topicId, items]) => ({ topicId, title: curriculum.topics.find((t) => t.id === topicId)?.title ?? topicId, tally: tally(items) }))
    .filter((t) => t.tally.total > t.tally.correct && (t.tally.pct ?? 0) < 70)
    .sort((a, b) => (a.tally.pct ?? 0) - (b.tally.pct ?? 0) || b.tally.total - a.tally.total);

  const answered = scored.filter((i) => i.status === "answered");
  return {
    headline: { ...tally(scored), unanswered: scored.length - answered.length },
    domains,
    pilots: pilots.length
      ? {
          ...tally(pilots),
          marked: pilots.filter((p) => p.pilotSource !== "designated").length,
          designated: pilots.filter((p) => p.pilotSource === "designated").length,
        }
      : null,
    timing: {
      elapsedMs: liveElapsedMs(session),
      limitMs: session.timed ? session.timeLimitMs : null,
      perItemSeconds: answered.length ? Math.round(liveElapsedMs(session) / 1000 / Math.max(1, questions.filter((q) => q.status === "answered").length)) : null,
      mode: session.assessment?.timing ?? (session.timed ? "standard" : "untimed"),
      expired: session.assessment?.submitReason === "time_expired",
    },
    calibration: [1, 2, 3, 4, 5]
      .map((v) => ({
        value: v,
        label: CONFIDENCE_LEVELS.find((c) => c.value === v)?.label ?? String(v),
        tally: tally(answered.filter((i) => i.confidence === v)),
      }))
      .filter((c) => c.tally.total > 0),
    noConfidence: answered.filter((i) => i.confidence == null).length,
    exposure: { first: tally(scored.filter((i) => !i.priorExposure)), repeat: tally(scored.filter((i) => i.priorExposure)) },
    topicGaps,
    retake: session.assessment?.retake ?? false,
    attempt: session.assessment?.attempt ?? 1,
    standard: session.assessment?.standard ?? false,
  };
}
