import { CONTENT_POLICY, STATUS_ORDER } from "@/config/exam";
import {
  curriculum as curriculumSchema,
  evidence as evidenceSchema,
  moduleContent as moduleSchema,
  source as sourceSchema,
  type Curriculum,
  type Evidence,
  type ModuleContent,
  type Question,
  type ReviewStatus,
  type Source,
} from "@/lib/schemas/content";

export type ValidationIssue = { level: "error" | "warning"; path: string; message: string };

const STATUS_RANK = Object.fromEntries(STATUS_ORDER.map((s, i) => [s, i])) as Record<string, number>;

export function statusMeets(status: ReviewStatus, min: ReviewStatus): boolean {
  if (status === "disputed" || status === "retired" || status === "draft") return false;
  return (STATUS_RANK[status] ?? -1) >= (STATUS_RANK[min] ?? 99);
}

export function isLearnerVisible(status: ReviewStatus): boolean {
  return statusMeets(status, CONTENT_POLICY.learnerVisibleMinStatus);
}

export function isValidatedPool(status: ReviewStatus): boolean {
  return status === CONTENT_POLICY.validatedPoolStatus;
}

export function mergeDefaults<T extends Record<string, unknown>>(
  item: T,
  defaults: Record<string, unknown> | undefined,
): T {
  if (!defaults) return item;
  return {
    ...defaults,
    ...item,
    review: item.review ?? defaults.review,
    context: { ...(defaults.context as object | undefined), ...(item.context as object | undefined) },
  };
}

export function parseSources(raw: unknown): { sources: Source[]; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  const obj = raw as { sources?: unknown[] };
  const sources: Source[] = [];
  for (const [i, s] of (obj.sources ?? []).entries()) {
    const r = sourceSchema.safeParse(s);
    if (!r.success) {
      issues.push({ level: "error", path: `sources[${i}]`, message: r.error.issues.map((x) => x.message).join("; ") });
    } else sources.push(r.data);
  }
  return { sources, issues };
}

export function parseCurriculum(raw: unknown): { curriculum: Curriculum | null; issues: ValidationIssue[] } {
  const r = curriculumSchema.safeParse(raw);
  if (!r.success) {
    return {
      curriculum: null,
      issues: r.error.issues.map((x) => ({ level: "error" as const, path: x.path.join("."), message: x.message })),
    };
  }
  return { curriculum: r.data, issues: [] };
}

export function parseEvidenceFile(raw: unknown): { evidence: Evidence[]; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  const obj = raw as { evidence?: unknown[]; defaults?: Record<string, unknown> };
  const evidence: Evidence[] = [];
  for (const [i, item] of (obj.evidence ?? []).entries()) {
    const merged = mergeDefaults(item as Record<string, unknown>, obj.defaults);
    const r = evidenceSchema.safeParse(merged);
    if (!r.success) {
      issues.push({
        level: "error",
        path: `evidence[${i}]`,
        message: r.error.issues.map((x) => `${x.path.join(".")}: ${x.message}`).join("; "),
      });
    } else evidence.push(r.data);
  }
  return { evidence, issues };
}

export function assembleModule(parts: {
  module: Record<string, unknown>;
  lessons: unknown[];
  questions: unknown[];
  cards: unknown[];
}): { module: ModuleContent | null; issues: ValidationIssue[] } {
  const candidate = {
    ...parts.module,
    lessons: parts.lessons,
    questions: parts.questions,
    cards: parts.cards,
    visuals: parts.module.visuals ?? [],
    assets: parts.module.assets ?? [],
    glossary: parts.module.glossary ?? [],
  };
  const r = moduleSchema.safeParse(candidate);
  if (!r.success) {
    return {
      module: null,
      issues: r.error.issues.map((x) => ({
        level: "error" as const,
        path: x.path.join("."),
        message: x.message,
      })),
    };
  }
  return { module: r.data, issues: [] };
}

export function crossCheck(args: {
  curriculum: Curriculum;
  sources: Source[];
  evidence: Evidence[];
  modules: ModuleContent[];
}): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const sourceIds = new Set(args.sources.map((s) => s.id));
  const evidenceIds = new Set(args.evidence.map((e) => e.id));
  const objectiveIds = new Set(args.curriculum.objectives.map((o) => o.id));
  const topicIds = new Set(args.curriculum.topics.map((t) => t.id));

  for (const o of args.curriculum.objectives) {
    if (!topicIds.has(o.topicId)) issues.push({ level: "error", path: o.id, message: `Unknown topic ${o.topicId}` });
    for (const sid of o.sourceIds) {
      if (!sourceIds.has(sid)) issues.push({ level: "error", path: o.id, message: `Unknown source ${sid}` });
    }
    if (o.sourceState === "blocked" && !o.blockedNote) {
      issues.push({ level: "error", path: o.id, message: "blocked objectives need blockedNote" });
    }
  }
  for (const e of args.evidence) {
    if (!sourceIds.has(e.sourceId)) issues.push({ level: "error", path: e.id, message: `Unknown source ${e.sourceId}` });
    if (e.citation === "quoted_public" && !e.excerpt) {
      issues.push({ level: "warning", path: e.id, message: "quoted_public without excerpt" });
    }
    const src = args.sources.find((s) => s.id === e.sourceId);
    if (src && e.citation === "quoted_public" && !src.rights.canQuote) {
      issues.push({ level: "error", path: e.id, message: "quoted excerpt from a source that cannot be quoted" });
    }
  }

  const questionIds = new Set<string>();
  const familyByPool = new Map<string, string>();

  for (const mod of args.modules) {
    for (const q of mod.questions) {
      issues.push(...checkQuestion(q, { objectiveIds, evidenceIds, questionIds, familyByPool }));
    }
    for (const les of mod.lessons) {
      if (!objectiveIds.has(les.objectiveId)) issues.push({ level: "error", path: les.id, message: "Unknown objective" });
      for (const ev of les.evidenceIds) {
        if (!evidenceIds.has(ev)) issues.push({ level: "error", path: les.id, message: `Unknown evidence ${ev}` });
      }
      if (!mod.questions.some((q) => q.id === les.checkQuestionId)) {
        issues.push({ level: "error", path: les.id, message: `Missing check question ${les.checkQuestionId}` });
      }
    }
    for (const card of mod.cards) {
      if (!objectiveIds.has(card.objectiveId)) issues.push({ level: "error", path: card.id, message: "Unknown objective" });
      for (const ev of card.evidenceIds) {
        if (!evidenceIds.has(ev)) issues.push({ level: "error", path: card.id, message: `Unknown evidence ${ev}` });
      }
    }
    const assetIds = new Set(mod.assets.map((a) => a.id));
    for (const vis of mod.visuals) {
      if (!assetIds.has(vis.assetId)) issues.push({ level: "error", path: vis.id, message: `Unknown asset ${vis.assetId}` });
      if (!vis.hotspots.some((h) => h.id === vis.correctHotspotId)) {
        issues.push({ level: "error", path: vis.id, message: "correctHotspotId not in hotspots" });
      }
    }
  }
  return issues;
}

function checkQuestion(
  q: Question,
  ctx: {
    objectiveIds: Set<string>;
    evidenceIds: Set<string>;
    questionIds: Set<string>;
    familyByPool: Map<string, string>;
  },
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (ctx.questionIds.has(q.id)) issues.push({ level: "error", path: q.id, message: "Duplicate question id" });
  ctx.questionIds.add(q.id);
  const ids = q.choices.map((c) => c.id);
  if (new Set(ids).size !== 4) issues.push({ level: "error", path: q.id, message: "Choice ids must be unique a–d" });
  if (!ids.includes(q.correctChoiceId)) issues.push({ level: "error", path: q.id, message: "correctChoiceId not in choices" });
  for (const oid of q.objectiveIds) {
    if (!ctx.objectiveIds.has(oid)) issues.push({ level: "error", path: q.id, message: `Unknown objective ${oid}` });
  }
  for (const ev of q.evidenceIds) {
    if (!ctx.evidenceIds.has(ev)) issues.push({ level: "error", path: q.id, message: `Unknown evidence ${ev}` });
  }
  const prev = ctx.familyByPool.get(q.familyId);
  if (prev && prev !== q.pool) {
    issues.push({ level: "error", path: q.id, message: `Family ${q.familyId} spans pools ${prev} and ${q.pool}` });
  }
  ctx.familyByPool.set(q.familyId, q.pool);
  const unsafe = [q.stem, q.explanation, ...q.choices.map((c) => c.text)].join(" ");
  if (/<script/i.test(unsafe)) issues.push({ level: "error", path: q.id, message: "Script tags are not allowed in content" });
  return issues;
}

export function validateImportedJson(text: string): { ok: false; issues: ValidationIssue[] } | { ok: true; data: unknown } {
  if (/<script/i.test(text) || /javascript:/i.test(text)) {
    return { ok: false, issues: [{ level: "error", path: "body", message: "Unsafe script content rejected" }] };
  }
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, issues: [{ level: "error", path: "body", message: "Malformed JSON" }] };
  }
  return { ok: true, data };
}
