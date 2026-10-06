import type { MinutesPref, StudySession } from "@/lib/schemas/learner";
import { newId, nowIso } from "./ids";
import type { SessionItem } from "@/lib/schemas/learner";

export function createSession(args: {
  kind: StudySession["kind"];
  mode: StudySession["mode"];
  minutes: MinutesPref;
  items: SessionItem[];
  why: string;
  contentVersion: string;
  beta: boolean;
  timed?: boolean;
  timeLimitMs?: number | null;
}): StudySession {
  const now = nowIso();
  return {
    id: newId("ses"),
    kind: args.kind,
    mode: args.mode,
    budgetMinutes: args.minutes,
    status: "in_progress",
    startedAt: now,
    lastActiveAt: now,
    completedAt: null,
    elapsedMs: 0,
    elapsedAnchorAt: now,
    timed: args.timed ?? false,
    timeLimitMs: args.timeLimitMs ?? null,
    items: args.items,
    currentIndex: 0,
    why: args.why,
    contentVersion: args.contentVersion,
    beta: args.beta,
    submitted: false,
  };
}
