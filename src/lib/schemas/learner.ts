import { z } from "zod";

export const LEARNER_SCHEMA_VERSION = 2;
export const BACKUP_FORMAT = "mammo-backup";

export const minutesPref = z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(20)]);
export type MinutesPref = z.infer<typeof minutesPref>;

export const profile = z.object({
  id: z.literal("guest"),
  createdAt: z.string(),
  examDate: z.string().nullable(),
  studyDays: z.array(z.number().int().min(0).max(6)),
  minutesPref,
  experience: z.enum(["new", "experienced"]),
  onboardingComplete: z.boolean(),
  diagnosticStatus: z.enum(["skipped", "pending", "done"]),
  lastBackupPromptAt: z.string().nullable(),
  lastActiveAt: z.string(),
  longAbsenceRecheckAt: z.string().nullable(),
});
export type Profile = z.infer<typeof profile>;

export const sessionKind = z.enum(["study", "quiz", "diagnostic", "lesson"]);
export const sessionMode = z.enum(["study", "test"]);
export const sessionStatus = z.enum(["in_progress", "completed", "abandoned"]);
export const itemType = z.enum(["lesson", "card", "question", "visual", "recap"]);
export const itemStatus = z.enum(["pending", "answered", "skipped"]);

export const sessionItem = z.object({
  id: z.string(),
  type: itemType,
  contentId: z.string(),
  revision: z.number().int(),
  objectiveIds: z.array(z.string()),
  familyId: z.string().nullable(),
  pool: z.string().nullable(),
  estSeconds: z.number().int(),
  status: itemStatus,
  revealed: z.boolean().default(false),
  selected: z.string().nullable().optional(),
  correct: z.boolean().nullable().optional(),
  selfRating: z.number().int().min(1).max(4).nullable().optional(),
  confidence: z.number().int().min(1).max(5).nullable().optional(),
  startedAt: z.string().nullable().optional(),
  answeredAt: z.string().nullable().optional(),
});
export type SessionItem = z.infer<typeof sessionItem>;

export const session = z.object({
  id: z.string(),
  kind: sessionKind,
  mode: sessionMode,
  budgetMinutes: z.number().int().positive(),
  status: sessionStatus,
  startedAt: z.string(),
  lastActiveAt: z.string(),
  completedAt: z.string().nullable(),
  /** Accumulated elapsed study/test time, excluding time while hidden if we later pause. */
  elapsedMs: z.number().int().nonnegative(),
  /** Wall-clock when elapsedMs was last committed; used to resume after refresh. */
  elapsedAnchorAt: z.string(),
  timed: z.boolean(),
  timeLimitMs: z.number().int().nullable(),
  items: z.array(sessionItem),
  currentIndex: z.number().int().nonnegative(),
  why: z.string(),
  contentVersion: z.string(),
  beta: z.boolean(),
  submitted: z.boolean().default(false),
});
export type StudySession = z.infer<typeof session>;

export const responseEvent = z.object({
  id: z.string(),
  sessionId: z.string(),
  itemId: z.string(),
  contentId: z.string(),
  contentRevision: z.number().int(),
  type: itemType,
  answer: z.string().nullable(),
  correct: z.boolean().nullable(),
  confidence: z.number().int().nullable(),
  selfRating: z.number().int().nullable(),
  objectiveIds: z.array(z.string()),
  firstExposure: z.boolean(),
  createdAt: z.string(),
  elapsedMs: z.number().int(),
});
export type ResponseEvent = z.infer<typeof responseEvent>;

export const cardSchedule = z.object({
  cardId: z.string(),
  due: z.string(),
  stability: z.number(),
  difficulty: z.number(),
  elapsed_days: z.number(),
  scheduled_days: z.number(),
  learning_steps: z.number(),
  reps: z.number(),
  lapses: z.number(),
  state: z.number(),
  last_review: z.string().nullable(),
});
export type CardSchedule = z.infer<typeof cardSchedule>;

export const objectiveHistory = z.object({
  objectiveId: z.string(),
  seen: z.number().int().nonnegative(),
  correct: z.number().int().nonnegative(),
  incorrect: z.number().int().nonnegative(),
  lastSeenAt: z.string().nullable(),
  weakUntil: z.string().nullable(),
});
export type ObjectiveHistory = z.infer<typeof objectiveHistory>;

export const exposure = z.object({
  contentId: z.string(),
  familyId: z.string().nullable(),
  firstAt: z.string(),
  lastAt: z.string(),
  count: z.number().int(),
});
export type Exposure = z.infer<typeof exposure>;

export const settings = z.object({
  id: z.literal("settings"),
  reducedMotion: z.boolean(),
  researchExportOptIn: z.boolean(),
  examOutcomeConsent: z.boolean(),
  cacheNoteDismissed: z.boolean(),
});
export type Settings = z.infer<typeof settings>;

export const examOutcome = z.object({
  id: z.string(),
  examDate: z.string(),
  attempt: z.enum(["first", "repeat"]),
  result: z.enum(["pass", "not_pass", "prefer_not"]),
  otherResources: z.string(),
  createdAt: z.string(),
});
export type ExamOutcome = z.infer<typeof examOutcome>;

export const backupFile = z.object({
  format: z.literal(BACKUP_FORMAT),
  version: z.number().int(),
  schemaVersion: z.number().int(),
  exportedAt: z.string(),
  contentVersions: z.record(z.string(), z.string()),
  profile,
  sessions: z.array(session),
  events: z.array(responseEvent),
  schedules: z.array(cardSchedule),
  objectives: z.array(objectiveHistory),
  exposures: z.array(exposure),
  settings,
  issues: z.array(z.unknown()),
  outcomes: z.array(examOutcome),
});
export type BackupFile = z.infer<typeof backupFile>;
