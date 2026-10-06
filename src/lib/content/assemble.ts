import {
  asset,
  curriculum,
  evidence,
  glossaryEntry,
  lesson,
  moduleContent,
  question,
  recallCard,
  source,
  visualExercise,
  type Curriculum,
  type Evidence,
  type ModuleContent,
  type Source,
} from "@/lib/schemas/content";
import { z } from "zod";

/** Raw authored files as they sit under /content. Items may omit `review` or give a partial one. */
export interface RawContent {
  register: { version: string; sources: unknown[] };
  evidenceFiles: { version: string; defaults?: Record<string, unknown>; evidence: unknown[] }[];
  curriculum: unknown;
  modules: {
    meta: Record<string, unknown> & { assets?: unknown[]; visuals?: unknown[]; glossary?: unknown[] };
    lessons: { lessons: unknown[]; defaults?: Record<string, unknown> };
    questions: { questions: unknown[]; defaults?: Record<string, unknown> };
    cards: { cards: unknown[]; defaults?: Record<string, unknown> };
  }[];
  authoredOn: string;
}

export interface AssembledContent {
  sources: Source[];
  evidence: Evidence[];
  curriculum: Curriculum;
  modules: ModuleContent[];
}

export interface Issue {
  level: "error" | "warning";
  itemId: string;
  code: string;
  message: string;
}

const defaultReview = (authoredOn: string) => ({
  status: "draft",
  requiresQualifiedReview: false,
  aiAssisted: true,
  history: [
    {
      at: authoredOn,
      status: "draft",
      actor: "ai-assisted",
      kind: "revision",
      note: "Drafted by an AI agent from the cited evidence. Not yet maintainer source-checked or clinically reviewed.",
    },
  ],
});

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Shallow-merges file defaults, then deep-merges `review` so a partial `{ requiresQualifiedReview: true }` keeps the default history. */
export function applyDefaults(item: unknown, defaults: Record<string, unknown> | undefined, authoredOn: string): unknown {
  if (!isObject(item)) return item;
  const base = { review: defaultReview(authoredOn), ...(defaults ?? {}) } as Record<string, unknown>;
  const merged: Record<string, unknown> = { ...base, ...item };
  const baseReview = isObject(base.review) ? base.review : {};
  const itemReview = isObject(item.review) ? item.review : {};
  merged.review = { ...baseReview, ...itemReview };
  return merged;
}

function parseAll<T>(
  schema: z.ZodType<T>,
  items: unknown[],
  defaults: Record<string, unknown> | undefined,
  authoredOn: string,
  issues: Issue[],
): T[] {
  const out: T[] = [];
  for (const raw of items) {
    const r = schema.safeParse(applyDefaults(raw, defaults, authoredOn));
    const itemId = isObject(raw) && typeof raw.id === "string" ? raw.id : "(missing id)";
    if (r.success) out.push(r.data);
    else
      for (const e of r.error.issues)
        issues.push({ level: "error", itemId, code: "schema", message: `${e.path.join(".") || "(root)"}: ${e.message}` });
  }
  return out;
}

export function assemble(raw: RawContent): { content: AssembledContent; issues: Issue[] } {
  const issues: Issue[] = [];
  const sources = raw.register.sources
    .map((s) => {
      const r = source.safeParse(s);
      if (!r.success)
        for (const e of r.error.issues)
          issues.push({ level: "error", itemId: (s as { id?: string }).id ?? "(source)", code: "schema", message: `${e.path.join(".")}: ${e.message}` });
      return r.success ? r.data : null;
    })
    .filter((s): s is Source => s !== null);

  const ev = raw.evidenceFiles.flatMap((f) => parseAll(evidence, f.evidence, f.defaults, raw.authoredOn, issues));

  const cur = curriculum.safeParse(raw.curriculum);
  if (!cur.success)
    for (const e of cur.error.issues) issues.push({ level: "error", itemId: "curriculum", code: "schema", message: `${e.path.join(".")}: ${e.message}` });

  const modules: ModuleContent[] = [];
  for (const m of raw.modules) {
    const lessons = parseAll(lesson, m.lessons.lessons, m.lessons.defaults, raw.authoredOn, issues);
    const questions = parseAll(question, m.questions.questions, m.questions.defaults, raw.authoredOn, issues);
    const cards = parseAll(recallCard, m.cards.cards, m.cards.defaults, raw.authoredOn, issues);
    const assets = parseAll(asset, m.meta.assets ?? [], undefined, raw.authoredOn, issues);
    const visuals = parseAll(visualExercise, m.meta.visuals ?? [], undefined, raw.authoredOn, issues);
    const glossary = (m.meta.glossary ?? []).map((g) => glossaryEntry.parse(g));
    const r = moduleContent.safeParse({ ...m.meta, lessons, questions, cards, assets, visuals, glossary });
    if (r.success) modules.push(r.data);
    else
      for (const e of r.error.issues)
        issues.push({ level: "error", itemId: String(m.meta.id), code: "schema", message: `${e.path.join(".")}: ${e.message}` });
  }

  return {
    content: { sources, evidence: ev, curriculum: cur.success ? cur.data : { version: "invalid", topics: [], objectives: [] }, modules },
    issues,
  };
}
