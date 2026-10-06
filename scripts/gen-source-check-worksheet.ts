/**
 * One-shot generator for docs/source-check-worksheet.md.
 * Lists needs_source objectives that already meet content completeness
 * (lesson + cards + 3+ practice + Form A item with resolvable evidence).
 * Does not modify curriculum or review status.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
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
import {
  applyCurriculumFollowUps,
  checkModuleCoverage,
  coverageMatrix,
  MIN_PRACTICE_QUESTIONS,
  parseModuleCoverage,
  type ModuleCoverage,
} from "../src/lib/content/coverage";
import type { Evidence, ModuleContent, Source } from "../src/lib/schemas/content";
import { isLearnerVisible } from "../src/lib/content/validate";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readJson(p: string) {
  return JSON.parse(readFileSync(p, "utf8"));
}

function loadAllSources(): { sources: Source[]; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  const byId = new Map<string, Source>();
  const { sources: registered, issues: regIssues } = parseSources(readJson(join(root, "content/sources/register.json")));
  issues.push(...regIssues);
  for (const s of registered) byId.set(s.id, s);
  const modulesDir = join(root, "content/modules");
  for (const name of readdirSync(modulesDir)) {
    const extra = join(modulesDir, name, "sources.json");
    if (!existsSync(extra)) continue;
    const { sources, issues: sIssues } = parseSources(readJson(extra));
    issues.push(...sIssues);
    for (const s of sources) if (!byId.has(s.id)) byId.set(s.id, s);
  }
  return { sources: [...byId.values()], issues };
}

function loadAllEvidence(): Evidence[] {
  const evidence: Evidence[] = [];
  const evidenceDir = join(root, "content/evidence");
  for (const file of readdirSync(evidenceDir).filter((f) => f.endsWith(".json")).sort()) {
    const { evidence: items } = parseEvidenceFile(readJson(join(evidenceDir, file)));
    const seen = new Set(evidence.map((e) => e.id));
    for (const item of items) if (!seen.has(item.id)) evidence.push(item);
  }
  return evidence;
}

function loadAllModules(): ModuleContent[] {
  const modules: ModuleContent[] = [];
  const modulesDir = join(root, "content/modules");
  for (const name of readdirSync(modulesDir).sort()) {
    const dir = join(modulesDir, name);
    if (!existsSync(join(dir, "module.json"))) continue;
    const { module } = assembleModule({
      module: readJson(join(dir, "module.json")),
      lessons: (readJson(join(dir, "lessons.json")) as { lessons: unknown[] }).lessons,
      questions: (readJson(join(dir, "questions.json")) as { questions: unknown[] }).questions,
      cards: (readJson(join(dir, "cards.json")) as { cards: unknown[] }).cards,
    });
    if (module) modules.push(module);
  }
  return modules;
}

function loadAllModuleCoverage(): ModuleCoverage[] {
  const modulesDir = join(root, "content/modules");
  const coverages: ModuleCoverage[] = [];
  for (const name of readdirSync(modulesDir).sort()) {
    const p = join(modulesDir, name, "coverage.json");
    if (existsSync(p)) coverages.push(parseModuleCoverage(readJson(p), `mod-${name}`));
  }
  return coverages;
}

function esc(s: string): string {
  return s.replace(/\r?\n/g, " ").trim();
}

function main() {
  const { sources } = loadAllSources();
  const { curriculum } = parseCurriculum(readJson(join(root, "content/curriculum/curriculum.json")));
  if (!curriculum) throw new Error("Failed to parse curriculum");
  const evidence = loadAllEvidence();
  const modules = loadAllModules();
  const moduleCoverage = loadAllModuleCoverage();
  const applied = applyCurriculumFollowUps(curriculum, moduleCoverage, sources);
  const rows = coverageMatrix(applied.curriculum, modules, { moduleCoverage, evidence, sources });

  const ready = rows.filter(
    (r) =>
      r.sourceState === "needs_source" &&
      r.lessonIds.length >= 1 &&
      r.cardIds.length >= 1 &&
      r.learnerQuestionCount >= MIN_PRACTICE_QUESTIONS &&
      r.formQuestionCount >= 1,
  );

  const evidenceById = new Map(evidence.map((e) => [e.id, e]));
  const sourceById = new Map(sources.map((s) => [s.id, s]));
  const lessons = new Map(modules.flatMap((m) => m.lessons.map((x) => [x.id, x] as const)));
  const cards = new Map(modules.flatMap((m) => m.cards.map((x) => [x.id, x] as const)));
  const questions = new Map(modules.flatMap((m) => m.questions.map((x) => [x.id, x] as const)));

  const today = new Date().toISOString().slice(0, 10);
  const lines: string[] = [];
  lines.push("# Source-check worksheet");
  lines.push("");
  lines.push(
    `Maintainer worksheet for Aaron Bolzle. Generated ${today} from assembled content on branch tip. **Do not flip \`sourceState\` or review status in the PR that adds this file** — only check boxes here (or copy the decision into a follow-up commit after review).`,
  );
  lines.push("");
  lines.push(
    `These **${ready.length}** objectives already have a lesson, recall cards, at least ${MIN_PRACTICE_QUESTIONS} learner-visible practice questions, and at least one learner-visible Form A item, each citing evidence that resolves to a registered retrieved or link-only source. Curriculum \`sourceState\` is still \`needs_source\`, so coverage does not count them complete.`,
  );
  lines.push("");
  lines.push("## How to record a confirmation");
  lines.push("");
  lines.push("After Aaron confirms an objective (and its cited claims) against the linked sources:");
  lines.push("");
  lines.push("1. In `content/curriculum/curriculum.json`, set that objective's `sourceState` to `source_backed_open` (public-domain / open) or `source_backed_link_only` (restricted source, facts taught in original words).");
  lines.push(
    '2. On every dependent lesson, card, and question listed below, set `review.status` to `source_checked`, and append a history entry with `status: "source_checked"`, `actor` / reviewer name **"Aaron Bolzle"**, and `at` set to **today\'s date** (ISO `YYYY-MM-DD`).',
  );
  lines.push("3. Re-run `npm run content:assemble` so `docs/COVERAGE.md` and `public/content/` refresh.");
  lines.push("4. Prefer a separate follow-up PR (or commit) for status flips — not this worksheet PR.");
  lines.push("");
  lines.push("Reject or Needs more source: leave `sourceState` as `needs_source` (or set `blocked` with a note/URLs if truly inaccessible). Do not mark `source_checked`.");
  lines.push("");
  lines.push("## Decision key");
  lines.push("");
  lines.push("- **Confirm** — excerpts/claims match the cited source; safe to set `source_backed_*` + `source_checked`.");
  lines.push("- **Reject** — content or citation is wrong; leave needs_source and fix content first.");
  lines.push("- **Needs more source** — partial match or missing locator; gather another source before sign-off.");
  lines.push("");
  lines.push(`## Objectives (${ready.length})`);
  lines.push("");

  for (const [i, r] of ready.entries()) {
    const practiceIds = r.questionIds.filter((id) => {
      const q = questions.get(id)!;
      return q.pool === "practice" && isLearnerVisible(q.review.status);
    });
    const formIds = r.questionIds.filter((id) => {
      const q = questions.get(id)!;
      return q.pool !== "practice" && isLearnerVisible(q.review.status);
    });

    const evidenceIds = new Set<string>();
    for (const id of r.lessonIds) for (const eid of lessons.get(id)?.evidenceIds ?? []) evidenceIds.add(eid);
    for (const id of r.cardIds) for (const eid of cards.get(id)?.evidenceIds ?? []) evidenceIds.add(eid);
    for (const id of r.questionIds) for (const eid of questions.get(id)?.evidenceIds ?? []) evidenceIds.add(eid);

    lines.push(`### ${i + 1}. \`${r.objectiveId}\``);
    lines.push("");
    lines.push(`**Title / statement:** ${r.statement}`);
    lines.push("");
    lines.push(`**Current sourceState:** \`${r.sourceState}\``);
    lines.push("");
    lines.push(`**Domain / topic:** \`${r.domainId}\` / \`${r.topicId}\``);
    lines.push("");
    lines.push("**Dependent items**");
    lines.push("");
    lines.push(`- Lessons (${r.lessonIds.length}): ${r.lessonIds.map((id) => `\`${id}\``).join(", ") || "—"}`);
    lines.push(`- Cards (${r.cardIds.length}): ${r.cardIds.map((id) => `\`${id}\``).join(", ") || "—"}`);
    lines.push(
      `- Practice questions (${practiceIds.length}): ${practiceIds.map((id) => `\`${id}\``).join(", ") || "—"}`,
    );
    lines.push(`- Form A questions (${formIds.length}): ${formIds.map((id) => `\`${id}\``).join(", ") || "—"}`);
    if (r.unresolvedItemIds.length) {
      lines.push(
        `- Unresolved (not counted): ${r.unresolvedItemIds.map((id) => `\`${id}\``).join(", ")}`,
      );
    }
    lines.push("");
    lines.push("**Claims / evidence**");
    lines.push("");

    const sortedEv = [...evidenceIds].sort();
    if (sortedEv.length === 0) {
      lines.push("_No evidence ids on dependent items._");
      lines.push("");
    } else {
      for (const eid of sortedEv) {
        const e = evidenceById.get(eid);
        if (!e) {
          lines.push(`- \`${eid}\` — **MISSING from evidence bank**`);
          continue;
        }
        const src = sourceById.get(e.sourceId);
        const excerpt = e.excerpt?.trim()
          ? e.excerpt.trim()
          : e.citation === "link_only"
            ? `(link-only; claim restated in original words) ${e.claim}`
            : e.claim;
        lines.push(`- \`${e.id}\``);
        lines.push(`  - Claim: ${esc(e.claim)}`);
        lines.push(`  - Excerpt: ${esc(excerpt)}`);
        lines.push(`  - Citation: \`${e.citation}\` · locator: ${esc(e.locator)}`);
        lines.push(`  - Source: \`${e.sourceId}\` — ${src?.url ?? "(no URL)"}`);
        lines.push(
          `  - Retrieval: ${src?.retrievedOn ?? "(unknown)"} · status \`${src?.retrievalStatus ?? "unknown"}\``,
        );
      }
      lines.push("");
    }

    lines.push("**Aaron decision**");
    lines.push("");
    lines.push("- [ ] Confirm");
    lines.push("- [ ] Reject");
    lines.push("- [ ] Needs more source");
    lines.push("");
    lines.push("_Notes:_");
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  lines.push("## Summary checklist");
  lines.push("");
  for (const r of ready) {
    lines.push(`- [ ] \`${r.objectiveId}\` — Confirm / Reject / Needs more source`);
  }
  lines.push("");

  const out = join(root, "docs/source-check-worksheet.md");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, lines.join("\n"));
  console.log(`Wrote ${out} with ${ready.length} objectives`);
  console.log(ready.map((r) => r.objectiveId).join("\n"));
}

main();
