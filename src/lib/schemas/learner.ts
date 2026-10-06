import { z } from "zod";
import { issueReport } from "./content";

export const minutesOption = z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(20)]);
export type MinutesOption = z.infer<typeof minutesOption>;

export const settings = z.object({
  examDate: z.string().nullable().default(null),
  /** 0 = Sunday … 6 = Saturday */
  studyDays: z.array(z.number().int().min(0).max(6)).default([1, 2, 3, 4, 5]),
  minutes: minutesOption.default(10),
  experience: z.enum(["student", "working_rt", "returning", "unspecified"]).default("unspecified"),
  onboarded: z.boolean().default(false),
  /** Practice accommodation for timed quizzes. Standard simulation always uses 1. */
  timeMultiplier: z.union([z.literal(1), z.literal(1.5), z.literal(2)]).default(1),
  lastActiveAt: z.string().nullable().default(null),
  lastBackupAt: z.string().nullable().default(null),
});
export type Settings = z.infer<typeof settings>;

export const consent = z.object({
  researchExport: z.boolean().default(false),
  decidedAt: z.string().nullable().default(null),
});
export type Consent = z.infer<typeof consent>;

export const itemType = z.enum(["lesson", "question", "card", "visual", "recap"]);
export type ItemType = z.infer<typeof itemType>;

export const plannedItem = z.object({
  /** Unique within a session; part of the idempotency key for attempts. */
  key: z.string(),
  type: itemType,
  refId: z.string(),
  revision: z.number().int(),
  reason: z.string().optional(),
  /** Simulation only: designated before the test as an unscored pilot item. */
  pilot: z.boolean().optional(),
  estSeconds: z.number().int().nonnegative(),
});
export type PlannedItem = z.infer<typeof plannedItem>;

export const sessionKind = z.enum(["daily", "topic_quiz", "mixed_quiz", "form_quiz", "simulation", "mistakes", "visual", "cards"]);
export type SessionKind = z.infer<typeof sessionKind>;

export const sessionRecord = z.object({
  id: z.string(),
  kind: sessionKind,
  mode: z.enum(["study", "test"]),
  title: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  contentVersion: z.string(),
  minutesBudget: z.number().nullable(),
  items: z.array(plannedItem),
  cursor: z.number().int().nonnegative(),
  status: z.enum(["active", "submitted", "completed", "abandoned"]),
  completedAt: z.string().nullable().default(null),
  reasons: z.array(z.string()).default([]),
  /** Test mode: wall-clock deadline in epoch ms. Survives refresh and backgrounding. */
  deadline: z.number().nullable().default(null),
  flagged: z.array(z.string()).default([]),
  requireAnswer: z.boolean().default(false),
  /** Assessment retakes stay useful practice but are labeled as such. */
  retake: z.boolean().default(false),
  formId: z.string().nullable().default(null),
  autoSubmitted: z.boolean().default(false),
});
export type SessionRecord = z.infer<typeof sessionRecord>;

export const confidence = z.enum(["guess", "unsure", "sure"]);
export type Confidence = z.infer<typeof confidence>;

export const attempt = z.object({
  /** `${sessionId}:${itemKey}`. Writing the same attempt twice is a no-op. */
  id: z.string(),
  sessionId: z.string(),
  itemKey: z.string(),
  itemType,
  itemId: z.string(),
  revision: z.number().int(),
  contentVersion: z.string(),
  objectiveIds: z.array(z.string()),
  familyId: z.string().nullable(),
  /** Choice ID, hotspot ID, or "done" for lessons. */
  response: z.string().nullable(),
  /** The key in force when the item was answered; later corrections are reconciled, never overwritten. */
  keyAtAttempt: z.string().nullable(),
  correct: z.boolean().nullable(),
  confidence: confidence.nullable().default(null),
  mode: z.enum(["study", "test"]),
  scored: z.boolean(),
  pilot: z.boolean().default(false),
  firstExposure: z.boolean(),
  startedAt: z.string(),
  answeredAt: z.string(),
  ms: z.number().nonnegative(),
});
export type Attempt = z.infer<typeof attempt>;

export const cardState = z.object({
  cardId: z.string(),
  due: z.string(),
  stability: z.number(),
  difficulty: z.number(),
  elapsed_days: z.number(),
  scheduled_days: z.number(),
  learning_steps: z.number().default(0),
  reps: z.number(),
  lapses: z.number(),
  state: z.number(),
  last_review: z.string().nullable(),
});
export type CardState = z.infer<typeof cardState>;

/** Self-ratings are kept apart from objective assessment attempts. */
export const reviewLog = z.object({
  id: z.string(),
  cardId: z.string(),
  sessionId: z.string(),
  rating: z.enum(["again", "hard", "good", "easy"]),
  at: z.string(),
  ms: z.number().nonnegative(),
  revision: z.number().int(),
});
export type ReviewLog = z.infer<typeof reviewLog>;

export const examOutcome = z.object({
  id: z.string(),
  examDate: z.string().nullable(),
  attempt: z.enum(["first", "repeat", "prefer_not"]),
  result: z.enum(["pass", "not_pass", "prefer_not"]),
  otherResources: z.array(z.string()).default([]),
  recordedAt: z.string(),
  contentVersion: z.string(),
});
export type ExamOutcome = z.infer<typeof examOutcome>;

export const storedIssue = issueReport.extend({ contentVersion: z.string() });
export type StoredIssue = z.infer<typeof storedIssue>;

export const BACKUP_VERSION = 1;

export const backupFile = z.object({
  app: z.literal("mammo"),
  backupVersion: z.number().int().positive(),
  exportedAt: z.string(),
  contentVersion: z.string(),
  data: z.object({
    settings: settings,
    consent: consent,
    sessions: z.array(sessionRecord),
    attempts: z.array(attempt),
    cardStates: z.array(cardState),
    reviewLogs: z.array(reviewLog),
    outcomes: z.array(examOutcome),
    issues: z.array(storedIssue),
  }),
});
export type BackupFile = z.infer<typeof backupFile>;
