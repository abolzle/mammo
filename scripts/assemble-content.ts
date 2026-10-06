import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assembleModule,
  crossCheck,
  parseCurriculum,
  parseEvidenceFile,
  parseSources,
  type ValidationIssue,
} from "../src/lib/content/validate";
import { coverageMatrix, sourceBreakdown, coverageMarkdown } from "../src/lib/content/coverage";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readJson(p: string) {
  return JSON.parse(readFileSync(p, "utf8"));
}

function loadRepoContent() {
  const issues: ValidationIssue[] = [];
  const { sources, issues: sIssues } = parseSources(readJson(join(root, "content/sources/register.json")));
  issues.push(...sIssues);
  const { curriculum, issues: cIssues } = parseCurriculum(readJson(join(root, "content/curriculum/curriculum.json")));
  issues.push(...cIssues);
  const { evidence, issues: eIssues } = parseEvidenceFile(readJson(join(root, "content/evidence/mqsa.json")));
  issues.push(...eIssues);
  const moduleMeta = readJson(join(root, "content/modules/mqsa/module.json")) as Record<string, unknown>;
  const lessons = (readJson(join(root, "content/modules/mqsa/lessons.json")) as { lessons: unknown[] }).lessons;
  const questions = (readJson(join(root, "content/modules/mqsa/questions.json")) as { questions: unknown[] }).questions;
  const cards = (readJson(join(root, "content/modules/mqsa/cards.json")) as { cards: unknown[] }).cards;
  const { module, issues: mIssues } = assembleModule({ module: moduleMeta, lessons, questions, cards });
  issues.push(...mIssues);
  if (!curriculum || !module) {
    return { ok: false as const, issues, curriculum, sources, evidence, modules: module ? [module] : [] };
  }
  issues.push(...crossCheck({ curriculum, sources, evidence, modules: [module] }));
  return { ok: issues.filter((i) => i.level === "error").length === 0, issues, curriculum, sources, evidence, modules: [module] };
}

export function assemble() {
  const loaded = loadRepoContent();
  const errors = loaded.issues.filter((i) => i.level === "error");
  if (errors.length) {
    console.error(JSON.stringify(errors, null, 2));
    throw new Error(`${errors.length} content validation errors`);
  }
  const coverage = coverageMatrix(loaded.curriculum!, loaded.modules);
  const breakdown = sourceBreakdown(loaded.curriculum!);
  const catalog = {
    version: loaded.curriculum!.version,
    assembledAt: new Date().toISOString().slice(0, 10),
    modules: loaded.modules.map((m) => ({
      id: m.id,
      version: m.version,
      title: m.title,
      summary: m.summary,
      topicIds: m.topicIds,
      path: `/content/modules/${m.id.replace("mod-", "")}.json`,
      lessonCount: m.lessons.length,
      questionCount: m.questions.length,
      cardCount: m.cards.length,
      visualCount: m.visuals.length,
    })),
    coverageSummary: {
      objectives: coverage.length,
      withLesson: coverage.filter((r) => r.lessonIds.length).length,
      withGap: coverage.filter((r) => r.gap).length,
      breakdown,
    },
  };
  const outDir = join(root, "public/content");
  mkdirSync(join(outDir, "modules"), { recursive: true });
  writeFileSync(join(outDir, "catalog.json"), JSON.stringify(catalog, null, 2));
  writeFileSync(join(outDir, "curriculum.json"), JSON.stringify(loaded.curriculum, null, 2));
  writeFileSync(join(outDir, "sources.json"), JSON.stringify({ sources: loaded.sources }, null, 2));
  writeFileSync(join(outDir, "evidence.json"), JSON.stringify({ evidence: loaded.evidence }, null, 2));
  writeFileSync(join(outDir, "coverage.json"), JSON.stringify({ rows: coverage, breakdown }, null, 2));
  const counts = {
    lessons: loaded.modules.reduce((a, m) => a + m.lessons.length, 0),
    cards: loaded.modules.reduce((a, m) => a + m.cards.length, 0),
    practice: loaded.modules.reduce((a, m) => a + m.questions.filter((q) => q.pool === "practice").length, 0),
    reserved: loaded.modules.reduce((a, m) => a + m.questions.filter((q) => q.pool !== "practice").length, 0),
    visuals: loaded.modules.reduce((a, m) => a + m.visuals.length, 0),
  };
  writeFileSync(join(root, "docs/COVERAGE.md"), coverageMarkdown(coverage, breakdown, counts, catalog.assembledAt));
  mkdirSync(join(outDir, "pipeline"), { recursive: true });
  copyFileSync(join(root, "content/pipeline/generate.md"), join(outDir, "pipeline/generate.md"));
  copyFileSync(join(root, "content/pipeline/critique.md"), join(outDir, "pipeline/critique.md"));
  for (const m of loaded.modules) {
    const name = m.id.replace("mod-", "");
    writeFileSync(join(outDir, "modules", `${name}.json`), JSON.stringify(m));
  }
  console.log(
    `Assembled ${loaded.modules.length} module(s); ${loaded.issues.filter((i) => i.level === "warning").length} warnings.`,
  );
  return loaded;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("assemble-content.ts")) {
  assemble();
}

export { loadRepoContent };
