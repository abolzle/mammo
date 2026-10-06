import { EXAM, domainShare } from "@/config/exam";
import type { Curriculum, ModuleContent, Objective, ReviewStatus } from "@/lib/schemas/content";

export interface ObjectiveCoverage {
  objectiveId: string;
  statement: string;
  topicId: string;
  domainId: string;
  sourceState: Objective["sourceState"];
  requiresQualifiedReview: boolean;
  lessons: number;
  cards: number;
  practiceQuestions: number;
  reservedQuestions: number;
  visuals: number;
  statuses: Partial<Record<ReviewStatus, number>>;
  gaps: string[];
  blockedUrls: string[];
}

export interface DomainCoverage {
  domainId: string;
  name: string;
  blueprintShare: number;
  objectives: number;
  objectivesWithLesson: number;
  objectivesComplete: number;
  practiceQuestions: number;
  bankShare: number;
}

export interface CoverageReport {
  generatedOn: string;
  contentVersion: string;
  totals: {
    objectives: number;
    complete: number;
    lessons: number;
    cards: number;
    practiceQuestions: number;
    reservedQuestions: number;
    visuals: number;
    bySourceState: Record<Objective["sourceState"], number>;
    needsQualifiedReview: number;
  };
  targets: { lessons: string; cards: string; questions: string };
  domains: DomainCoverage[];
  objectives: ObjectiveCoverage[];
}

/** "Complete" means a lesson, recall material and at least three practice questions on a source-backed objective. Review status is reported separately. */
export const MIN_PRACTICE_PER_OBJECTIVE = 3;

export function computeCoverage(cur: Curriculum, modules: ModuleContent[], contentVersion: string, generatedOn: string): CoverageReport {
  const topicDomain = new Map(cur.topics.map((t) => [t.id, t.domainId]));
  const rows: ObjectiveCoverage[] = cur.objectives.map((o) => {
    const statuses: Partial<Record<ReviewStatus, number>> = {};
    const bump = (s: ReviewStatus) => (statuses[s] = (statuses[s] ?? 0) + 1);
    let lessons = 0, cards = 0, practice = 0, reserved = 0, visuals = 0;
    let qualified = o.requiresQualifiedReview;
    for (const m of modules) {
      for (const l of m.lessons) if (l.objectiveId === o.id) { lessons++; bump(l.review.status); qualified ||= l.review.requiresQualifiedReview; }
      for (const c of m.cards) if (c.objectiveId === o.id) { cards++; bump(c.review.status); }
      for (const q of m.questions)
        if (q.objectiveIds.includes(o.id)) {
          if (q.pool === "practice") practice++;
          else reserved++;
          bump(q.review.status);
          qualified ||= q.review.requiresQualifiedReview;
        }
      for (const v of m.visuals) if (v.objectiveId === o.id) { visuals++; bump(v.review.status); }
    }
    const gaps: string[] = [];
    if (o.sourceState === "blocked") gaps.push("Blocked: no accessible source verifies this objective");
    if (o.sourceState === "needs_source") gaps.push("Needs source: evidence records not yet created");
    if (lessons === 0) gaps.push("No lesson");
    if (cards === 0) gaps.push("No recall cards");
    if (practice < MIN_PRACTICE_PER_OBJECTIVE) gaps.push(`${practice} practice questions (target ≥ ${MIN_PRACTICE_PER_OBJECTIVE})`);
    if (reserved === 0) gaps.push("No reserved-form items");
    if (qualified) gaps.push("Needs qualified clinical review before it counts as verified instruction");
    const total = lessons + cards + practice + reserved + visuals;
    if (total > 0 && !statuses.clinically_reviewed) gaps.push("Not clinically reviewed (beta)");
    return {
      objectiveId: o.id,
      statement: o.statement,
      topicId: o.topicId,
      domainId: topicDomain.get(o.topicId) ?? "unknown",
      sourceState: o.sourceState,
      requiresQualifiedReview: qualified,
      lessons, cards, practiceQuestions: practice, reservedQuestions: reserved, visuals,
      statuses, gaps,
      blockedUrls: o.blockedUrls ?? [],
    };
  });

  const isComplete = (r: ObjectiveCoverage) =>
    r.sourceState.startsWith("source_backed") && r.lessons > 0 && r.cards > 0 && r.practiceQuestions >= MIN_PRACTICE_PER_OBJECTIVE;

  const totalPractice = rows.reduce((a, r) => a + r.practiceQuestions, 0);
  const allQuestions = modules.flatMap((m) => m.questions);
  const domains: DomainCoverage[] = EXAM.domains.map((d) => {
    const dr = rows.filter((r) => r.domainId === d.id);
    const objIds = new Set(dr.map((r) => r.objectiveId));
    // A question counts once toward the domain of its first objective.
    const dq = allQuestions.filter((q) => q.pool === "practice" && objIds.has(q.objectiveIds[0])).length;
    return {
      domainId: d.id,
      name: d.name,
      blueprintShare: domainShare(d.id),
      objectives: dr.length,
      objectivesWithLesson: dr.filter((r) => r.lessons > 0).length,
      objectivesComplete: dr.filter(isComplete).length,
      practiceQuestions: dq,
      bankShare: totalPractice ? dq / allQuestions.filter((q) => q.pool === "practice").length : 0,
    };
  });

  const bySourceState = { source_backed_open: 0, source_backed_link_only: 0, needs_source: 0, blocked: 0 };
  for (const r of rows) bySourceState[r.sourceState]++;

  return {
    generatedOn,
    contentVersion,
    totals: {
      objectives: rows.length,
      complete: rows.filter(isComplete).length,
      lessons: modules.reduce((a, m) => a + m.lessons.length, 0),
      cards: modules.reduce((a, m) => a + m.cards.length, 0),
      practiceQuestions: allQuestions.filter((q) => q.pool === "practice").length,
      reservedQuestions: allQuestions.filter((q) => q.pool !== "practice").length,
      visuals: modules.reduce((a, m) => a + m.visuals.length, 0),
      bySourceState,
      needsQualifiedReview: rows.filter((r) => r.requiresQualifiedReview).length,
    },
    targets: { lessons: "60–80", cards: "200+", questions: "~800 incl. two full forms" },
    domains,
    objectives: rows,
  };
}

export function coverageMarkdown(r: CoverageReport, objectiveTitle: (id: string) => string): string {
  const pct = (x: number) => `${Math.round(x * 100)}%`;
  const lines: string[] = [];
  lines.push(`# Coverage report`, "");
  lines.push(`Generated ${r.generatedOn} from content version \`${r.contentVersion}\` by \`npm run content:build\`. Do not edit by hand.`, "");
  lines.push(
    `An objective is **complete** when it is source-backed and has a lesson, recall cards, and at least ${MIN_PRACTICE_PER_OBJECTIVE} practice questions. ` +
      `Completeness says nothing about review: every item below is AI-drafted beta content until a maintainer source-checks it and a qualified reviewer clinically reviews it.`,
    "",
  );
  lines.push(`## Totals`, "");
  lines.push(`| Measure | Current | Production target |`, `|---|---|---|`);
  lines.push(`| Objectives complete | ${r.totals.complete} / ${r.totals.objectives} | all |`);
  lines.push(`| Micro-lessons | ${r.totals.lessons} | ${r.targets.lessons} |`);
  lines.push(`| Recall cards | ${r.totals.cards} | ${r.targets.cards} |`);
  lines.push(`| Practice questions | ${r.totals.practiceQuestions} | ${r.targets.questions} |`);
  lines.push(`| Reserved-form questions | ${r.totals.reservedQuestions} | two full forms |`);
  lines.push(`| Visual exercises | ${r.totals.visuals} | — |`, "");
  const s = r.totals.bySourceState;
  lines.push(`Source state of objectives: ${s.source_backed_open} open/public-domain, ${s.source_backed_link_only} link-only, ${s.needs_source} need a source, ${s.blocked} blocked. ${r.totals.needsQualifiedReview} touch thresholds, dose, positioning correction or device QC and need qualified review.`, "");
  lines.push(`## Domains`, "");
  lines.push(`| Domain | Blueprint share | Objectives | With lesson | Complete | Practice questions | Bank share |`, `|---|---|---|---|---|---|---|`);
  for (const d of r.domains)
    lines.push(`| ${d.name} | ${pct(d.blueprintShare)} | ${d.objectives} | ${d.objectivesWithLesson} | ${d.objectivesComplete} | ${d.practiceQuestions} | ${pct(d.bankShare)} |`);
  lines.push("", `## Objective matrix`, "");
  lines.push(`| Objective | Source | Lessons | Cards | Practice | Reserved | Visuals | Gaps |`, `|---|---|---|---|---|---|---|---|`);
  for (const o of r.objectives)
    lines.push(`| \`${o.objectiveId}\` ${objectiveTitle(o.objectiveId)} | ${o.sourceState.replace(/_/g, " ")} | ${o.lessons} | ${o.cards} | ${o.practiceQuestions} | ${o.reservedQuestions} | ${o.visuals} | ${o.gaps.join("; ") || "—"} |`);
  const blocked = r.objectives.filter((o) => o.sourceState === "blocked");
  if (blocked.length) {
    lines.push("", `## Blocked objectives and the URLs needed`, "");
    for (const o of blocked) lines.push(`- \`${o.objectiveId}\`: ${o.blockedUrls.map((u) => `<${u}>`).join(", ")}`);
  }
  return lines.join("\n") + "\n";
}
