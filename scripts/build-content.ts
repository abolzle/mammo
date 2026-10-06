/**
 * Validates /content, marks passing drafts as auto_checked in the generated output,
 * and writes the static bundles the app loads plus the maintainer coverage report.
 *
 *   npm run content:build          # validate + write
 *   npm run content:check          # validate only (CI)
 */
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { assemble } from "@/lib/content/assemble";
import { validateContent } from "@/lib/content/validate";
import { promoteAutoChecked, type ContentIndex } from "@/lib/content/bundle";
import { computeCoverage, coverageMarkdown } from "@/lib/content/coverage";
import { readRawContent, ROOT } from "./lib/read-content";

const checkOnly = process.argv.includes("--check");
const raw = readRawContent();
const { content, issues: schemaIssues } = assemble(raw);
const issues = [...schemaIssues, ...validateContent(content)];
const errors = issues.filter((i) => i.level === "error");
const warnings = issues.filter((i) => i.level === "warning");

for (const i of [...errors, ...warnings]) console.log(`${i.level === "error" ? "ERROR" : "warn "} ${i.itemId} [${i.code}] ${i.message}`);
console.log(`\n${errors.length} errors, ${warnings.length} warnings`);
if (errors.length) process.exit(1);
if (checkOnly) process.exit(0);

const contentVersion = createHash("sha256").update(JSON.stringify(raw)).digest("hex").slice(0, 12);
const builtOn = new Date().toISOString().slice(0, 10);
const promoted = promoteAutoChecked(content, issues, raw.authoredOn);

const out = join(ROOT, "public", "content");
rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, "modules"), { recursive: true });

const index: ContentIndex = {
  contentVersion,
  builtOn,
  curriculum: promoted.curriculum,
  sources: promoted.sources,
  evidence: promoted.evidence,
  modules: promoted.modules.map((m) => ({
    id: m.id,
    version: m.version,
    title: m.title,
    summary: m.summary,
    topicIds: m.topicIds,
    file: `/content/modules/${m.id}.${contentVersion}.json`,
    counts: { lessons: m.lessons.length, questions: m.questions.length, cards: m.cards.length, visuals: m.visuals.length },
  })),
};
writeFileSync(join(out, "index.json"), JSON.stringify(index));
for (const m of promoted.modules) writeFileSync(join(out, "modules", `${m.id}.${contentVersion}.json`), JSON.stringify(m));

const coverage = computeCoverage(promoted.curriculum, promoted.modules, contentVersion, builtOn);
writeFileSync(join(out, "coverage.json"), JSON.stringify(coverage));
const title = new Map(promoted.curriculum.objectives.map((o) => [o.id, o.statement]));
writeFileSync(join(ROOT, "docs", "COVERAGE.md"), coverageMarkdown(coverage, (id) => `— ${title.get(id) ?? ""}`));

console.log(`Wrote content ${contentVersion}: ${index.modules.length} module(s), coverage ${coverage.totals.complete}/${coverage.totals.objectives} objectives complete.`);
