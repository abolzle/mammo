import { z } from "zod";

export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");
export const id = (prefix: string) =>
  z.string().regex(new RegExp(`^${prefix}-[a-z0-9]+(?:-[a-z0-9]+)*$`), `ID must look like ${prefix}-lower-kebab`);

/**
 * Review statuses describe distinct kinds of evidence. Passing automated or AI
 * checks is never clinical review.
 */
export const reviewStatus = z.enum([
  "draft",
  "auto_checked",
  "source_checked",
  "clinically_reviewed",
  "disputed",
  "retired",
]);
export type ReviewStatus = z.infer<typeof reviewStatus>;

export const reviewEvent = z.object({
  at: isoDate,
  status: reviewStatus,
  /** "automation", "ai-assisted", or a maintainer-entered reviewer label. Never auto-filled with a real person. */
  actor: z.string().min(1),
  kind: z.enum(["automated_validation", "ai_cross_check", "maintainer_source_check", "clinical_review", "dispute", "retirement", "revision"]),
  note: z.string().optional(),
});
export type ReviewEvent = z.infer<typeof reviewEvent>;

export const review = z.object({
  status: reviewStatus,
  /** Content that touches thresholds, dose limits, positioning correction, device QC or ambiguous interpretation. */
  requiresQualifiedReview: z.boolean().default(false),
  aiAssisted: z.boolean().default(true),
  history: z.array(reviewEvent).min(1),
});
export type Review = z.infer<typeof review>;

/** Applied at load when an item omits `review`. Not clinical review. */
export const DEFAULT_REVIEW: Review = {
  status: "auto_checked",
  requiresQualifiedReview: false,
  aiAssisted: true,
  history: [
    {
      at: "2026-10-06",
      status: "auto_checked",
      actor: "automation",
      kind: "automated_validation",
      note: "Default review object applied at load because the item omitted one. Passing automated checks is not clinical review.",
    },
  ],
};

export const reviewField = z.preprocess((val) => {
  if (val == null || typeof val !== "object") return DEFAULT_REVIEW;
  const v = val as Record<string, unknown>;
  const history = Array.isArray(v.history) && v.history.length > 0 ? v.history : DEFAULT_REVIEW.history;
  return {
    status: v.status ?? DEFAULT_REVIEW.status,
    requiresQualifiedReview: v.requiresQualifiedReview ?? false,
    aiAssisted: v.aiAssisted ?? true,
    history,
  };
}, review);

// ---------------------------------------------------------------- Exam config

export const examDomain = z.object({
  id: id("dom"),
  name: z.string(),
  scoredQuestions: z.number().int().positive(),
  subdomains: z.array(z.object({ id: id("sub"), name: z.string(), scoredQuestions: z.number().int().positive() })),
});

export const examConfig = z.object({
  configVersion: z.string(),
  examId: z.literal("arrt-mammography"),
  examName: z.string(),
  blueprintVersion: z.string(),
  blueprintEffective: isoDate,
  researchDate: isoDate,
  verifiedOn: isoDate.nullable(),
  domains: z.array(examDomain).min(1),
  scoredQuestions: z.number().int().positive(),
  pilotQuestions: z.number().int().nonnegative(),
  totalQuestions: z.number().int().positive(),
  testMinutes: z.number().int().positive(),
  appointmentMinutes: z.number().int().positive().nullable(),
  passingScaledScore: z.number(),
  scaledScoreRange: z.tuple([z.number(), z.number()]),
  notes: z.array(z.string()),
  sourceIds: z.array(z.string()).min(1),
});
export type ExamConfig = z.infer<typeof examConfig>;

// ---------------------------------------------------------------- Curriculum

export const objective = z.object({
  id: id("obj"),
  topicId: z.string(),
  statement: z.string().min(10),
  /** Short pointer into the official content specification category, e.g. "IP 1.C.2.b". Not a copy of the outline. */
  blueprintRef: z.string(),
  prerequisites: z.array(z.string()).default([]),
  depth: z.enum(["define", "explain", "apply"]),
  requiresQualifiedReview: z.boolean().default(false),
  /** Candidate sources for writing this objective. */
  sourceIds: z.array(z.string()).default([]),
  /**
   * Source-backing, independent of review status. Copyright protects expression, not facts:
   * a fact verified in a restricted source is taught in original wording with a link-only citation.
   * "blocked" means no accessible source verifies the fact.
   */
  sourceState: z.enum(["source_backed_open", "source_backed_link_only", "needs_source", "blocked"]),
  blockedNote: z.string().optional(),
  blockedUrls: z.array(z.string()).optional(),
});
export type Objective = z.infer<typeof objective>;

export const topic = z.object({
  id: id("top"),
  domainId: z.string(),
  subdomainId: z.string(),
  title: z.string(),
  summary: z.string(),
  order: z.number().int(),
  moduleId: z.string().optional(),
});
export type Topic = z.infer<typeof topic>;

export const curriculum = z.object({
  version: z.string(),
  topics: z.array(topic),
  objectives: z.array(objective),
});
export type Curriculum = z.infer<typeof curriculum>;

// ---------------------------------------------------------------- Sources & evidence

export const rights = z.object({
  status: z.enum(["public_domain", "open_license", "copyrighted_link_only", "copyrighted_permission_needed", "unknown"]),
  license: z.string().optional(),
  canRead: z.boolean(),
  canQuote: z.boolean(),
  canRedistribute: z.boolean(),
  canSubmitToAI: z.boolean(),
  basis: z.string(),
  basisSourceId: z.string().optional(),
});

export const source = z.object({
  id: id("src"),
  title: z.string(),
  publisher: z.string(),
  url: z.string().url(),
  publishedOrEffective: z.string().nullable(),
  retrievedOn: isoDate.nullable(),
  retrievalStatus: z.enum(["retrieved", "blocked", "not_attempted", "link_only"]),
  retrievalNote: z.string().optional(),
  sections: z.array(z.string()).default([]),
  rights,
  kind: z.enum(["regulation", "official_exam_document", "government_guidance", "professional_guideline", "dataset", "policy", "other"]),
});
export type Source = z.infer<typeof source>;

export const evidence = z.object({
  id: id("ev"),
  sourceId: z.string(),
  locator: z.string(),
  claim: z.string(),
  scope: z.string(),
  exceptions: z.string().optional(),
  /** Verbatim excerpt; only allowed when the source permits quoting. Link-only evidence restates the fact in original words. */
  excerpt: z.string().optional(),
  citation: z.enum(["quoted_public", "link_only"]),
  context: z.object({
    modality: z.array(z.string()).default([]),
    jurisdiction: z.string().optional(),
    effective: z.string().optional(),
  }),
  retrievedOn: isoDate,
  review: reviewField,
});
export type Evidence = z.infer<typeof evidence>;

// ---------------------------------------------------------------- Learning content

export const explanationVariants = z.object({
  simpler: z.string().min(10),
  example: z.string().min(10),
  deeper: z.string().optional(),
});

export const choice = z.object({
  id: z.string().regex(/^[a-d]$/),
  text: z.string().min(1),
  /** Why this option is right, or specifically why a learner might pick it and why it is wrong. */
  rationale: z.string().min(10),
});

export const question = z.object({
  id: id("q"),
  revision: z.number().int().positive(),
  objectiveIds: z.array(z.string()).min(1),
  familyId: id("fam"),
  /** practice = daily study; form-* = reserved for an assessment form and excluded from daily study. */
  pool: z.enum(["practice", "form-a", "form-b"]),
  difficultyIntent: z.enum(["recall", "understand", "apply"]),
  kind: z.enum(["single", "case", "calculation", "visual"]),
  stem: z.string().min(10),
  choices: z.array(choice).length(4),
  correctChoiceId: z.string().regex(/^[a-d]$/),
  explanation: z.string().min(20),
  variants: explanationVariants,
  evidenceIds: z.array(z.string()).min(1),
  assetId: z.string().optional(),
  estSeconds: z.number().int().positive(),
  review: reviewField,
  keyHistory: z
    .array(z.object({ revision: z.number().int().positive(), correctChoiceId: z.string(), changedOn: isoDate, reason: z.string() }))
    .default([]),
});
export type Question = z.infer<typeof question>;

export const lessonSection = z.object({
  heading: z.string(),
  body: z.string().min(10),
});

export const workedStep = z.object({ step: z.string(), result: z.string() });

export const lesson = z.object({
  id: id("les"),
  revision: z.number().int().positive(),
  moduleId: z.string(),
  objectiveId: z.string(),
  title: z.string(),
  estMinutes: z.number().positive().max(6),
  summary: z.string(),
  explanation: z.array(lessonSection).min(1),
  example: z.string().min(10),
  misconception: z.object({ belief: z.string(), correction: z.string() }),
  variants: explanationVariants,
  worked: z
    .object({ title: z.string(), given: z.string(), steps: z.array(workedStep).min(1), answer: z.string(), checkedBy: z.string() })
    .optional(),
  observationPrompt: z.string().optional(),
  checkQuestionId: z.string(),
  evidenceIds: z.array(z.string()).min(1),
  review: reviewField,
});
export type Lesson = z.infer<typeof lesson>;

export const recallCard = z.object({
  id: id("card"),
  revision: z.number().int().positive(),
  objectiveId: z.string(),
  prompt: z.string().min(5),
  answer: z.string().min(1),
  elaboration: z.string().optional(),
  evidenceIds: z.array(z.string()).min(1),
  estSeconds: z.number().int().positive(),
  review: reviewField,
});
export type RecallCard = z.infer<typeof recallCard>;

export const hotspot = z.object({
  id: z.string(),
  /** Neutral label used for keyboard/screen-reader selection; must not reveal the answer. */
  neutralLabel: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  /** Text shown only after the answer is revealed. */
  revealLabel: z.string(),
});

export const asset = z.object({
  id: id("asset"),
  kind: z.enum(["svg_schematic", "clinical_image"]),
  title: z.string(),
  /** Path under /public. */
  src: z.string().startsWith("/"),
  width: z.number(),
  height: z.number(),
  alt: z.string().min(10),
  longDescription: z.string().optional(),
  isSchematic: z.boolean(),
  modality: z.enum(["schematic", "ffdm", "dbt", "screen_film_historical", "none"]),
  license: z.string(),
  attribution: z.string(),
  evidenceIds: z.array(z.string()),
  review: reviewField,
});
export type Asset = z.infer<typeof asset>;

export const visualExercise = z.object({
  id: id("vis"),
  revision: z.number().int().positive(),
  objectiveId: z.string(),
  assetId: z.string(),
  title: z.string(),
  prompt: z.string(),
  hotspots: z.array(hotspot).min(2),
  correctHotspotId: z.string(),
  feedback: z.record(z.string(), z.string()),
  explanation: z.string(),
  accessibilityNote: z.string(),
  evidenceIds: z.array(z.string()).min(1),
  estSeconds: z.number().int().positive(),
  review: reviewField,
});
export type VisualExercise = z.infer<typeof visualExercise>;

export const glossaryEntry = z.object({
  term: z.string(),
  definition: z.string(),
  evidenceIds: z.array(z.string()).default([]),
});

export const moduleContent = z.object({
  id: id("mod"),
  version: z.string(),
  title: z.string(),
  summary: z.string(),
  topicIds: z.array(z.string()),
  lessons: z.array(lesson),
  questions: z.array(question),
  cards: z.array(recallCard),
  visuals: z.array(visualExercise),
  assets: z.array(asset),
  glossary: z.array(glossaryEntry),
});
export type ModuleContent = z.infer<typeof moduleContent>;

// ---------------------------------------------------------------- Content issues & revisions

export const issueReport = z.object({
  id: z.string(),
  itemId: z.string(),
  itemRevision: z.number().int(),
  category: z.enum(["key_wrong", "unclear", "source_mismatch", "typo", "accessibility", "other"]),
  note: z.string().max(2000),
  createdAt: z.string(),
});
export type IssueReport = z.infer<typeof issueReport>;

export const contentRevision = z.object({
  itemId: z.string(),
  revision: z.number().int().positive(),
  changedOn: isoDate,
  summary: z.string(),
  affectsScoring: z.boolean(),
});
