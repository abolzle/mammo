import type { Curriculum, Evidence, ModuleContent, Objective, Source } from "@/lib/schemas/content";
import { isLearnerVisible, isValidatedPool, type ValidationIssue } from "./validate";

export type ModuleCoverageLink = {
  objectiveId: string;
  lessonIds: string[];
  cardIds: string[];
  questionIds: string[];
  visualIds: string[];
};

export type CurriculumFollowUp = {
  objectiveId: string;
  suggestedSourceState: Objective["sourceState"];
  suggestedSourceIds: string[];
  note?: string;
};

/** Normalized form of a content/modules/<name>/coverage.json file. */
export type ModuleCoverage = {
  moduleId: string;
  links: ModuleCoverageLink[];
  followUps: CurriculumFollowUp[];
};

function strings(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

/** Module coverage files use either `objectiveCoverage` or `rows` for the per-objective links. */
export function parseModuleCoverage(raw: unknown, fallbackModuleId = ""): ModuleCoverage {
  const r = (raw ?? {}) as Record<string, unknown>;
  const entries = (Array.isArray(r.objectiveCoverage) ? r.objectiveCoverage : Array.isArray(r.rows) ? r.rows : []) as Record<
    string,
    unknown
  >[];
  const followUps = (Array.isArray(r.curriculumFollowUps) ? r.curriculumFollowUps : []) as Record<string, unknown>[];
  return {
    moduleId: typeof r.moduleId === "string" ? r.moduleId : fallbackModuleId,
    links: entries
      .filter((e) => typeof e.objectiveId === "string")
      .map((e) => ({
        objectiveId: e.objectiveId as string,
        lessonIds: strings(e.lessonIds),
        cardIds: strings(e.cardIds),
        questionIds: strings(e.questionIds),
        visualIds: strings(e.visualIds),
      })),
    followUps: followUps
      .filter((f) => typeof f.objectiveId === "string" && typeof f.suggestedSourceState === "string")
      .map((f) => ({
        objectiveId: f.objectiveId as string,
        suggestedSourceState: f.suggestedSourceState as Objective["sourceState"],
        suggestedSourceIds: strings(f.suggestedSourceIds),
        note: typeof f.note === "string" ? f.note : undefined,
      })),
  };
}

const SOURCE_STATES: Objective["sourceState"][] = ["source_backed_open", "source_backed_link_only", "needs_source", "blocked"];

function sourceUsable(s: Source | undefined): boolean {
  return Boolean(s) && s!.retrievalStatus !== "blocked" && s!.retrievalStatus !== "not_attempted";
}

/**
 * Applies module-recorded curriculum follow-ups. A follow-up may only mark an objective
 * source-backed when every suggested source is registered and was actually retrieved
 * (or is a link-only citation); otherwise the curriculum state is kept.
 */
export function applyCurriculumFollowUps(
  curriculum: Curriculum,
  coverages: ModuleCoverage[],
  sources: Source[],
): { curriculum: Curriculum; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  const sourceById = new Map(sources.map((s) => [s.id, s]));
  const objectives = curriculum.objectives.map((o) => ({ ...o, sourceIds: [...o.sourceIds] }));
  const byId = new Map(objectives.map((o) => [o.id, o]));
  for (const cov of coverages) {
    for (const f of cov.followUps) {
      const path = `${cov.moduleId}/coverage.json:curriculumFollowUps:${f.objectiveId}`;
      const o = byId.get(f.objectiveId);
      if (!o) {
        issues.push({ level: "error", path, message: `Unknown objective ${f.objectiveId}` });
        continue;
      }
      if (!SOURCE_STATES.includes(f.suggestedSourceState)) {
        issues.push({ level: "error", path, message: `Unknown source state ${f.suggestedSourceState}` });
        continue;
      }
      const unknown = f.suggestedSourceIds.filter((id) => !sourceById.has(id));
      if (unknown.length) issues.push({ level: "error", path, message: `Unknown source(s) ${unknown.join(", ")}` });
      for (const id of f.suggestedSourceIds) if (sourceById.has(id) && !o.sourceIds.includes(id)) o.sourceIds.push(id);
      const backed = f.suggestedSourceState === "source_backed_open" || f.suggestedSourceState === "source_backed_link_only";
      if (backed && (f.suggestedSourceIds.length === 0 || !f.suggestedSourceIds.every((id) => sourceUsable(sourceById.get(id))))) {
        issues.push({ level: "warning", path, message: "Follow-up not applied: suggested sources are missing or not retrieved" });
        continue;
      }
      if (o.sourceState === "blocked" && backed) {
        issues.push({ level: "warning", path, message: "Follow-up not applied: curriculum marks the objective blocked" });
        continue;
      }
      o.sourceState = f.suggestedSourceState;
    }
  }
  return { curriculum: { ...curriculum, objectives }, issues };
}

/** Every id a module coverage file references must exist in the assembled modules. */
export function checkModuleCoverage(curriculum: Curriculum, modules: ModuleContent[], coverages: ModuleCoverage[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const objectiveIds = new Set(curriculum.objectives.map((o) => o.id));
  const ids = {
    lessonIds: new Set(modules.flatMap((m) => m.lessons.map((x) => x.id))),
    cardIds: new Set(modules.flatMap((m) => m.cards.map((x) => x.id))),
    questionIds: new Set(modules.flatMap((m) => m.questions.map((x) => x.id))),
    visualIds: new Set(modules.flatMap((m) => m.visuals.map((x) => x.id))),
  };
  for (const cov of coverages) {
    for (const link of cov.links) {
      const path = `${cov.moduleId}/coverage.json:${link.objectiveId}`;
      if (!objectiveIds.has(link.objectiveId)) issues.push({ level: "error", path, message: `Unknown objective ${link.objectiveId}` });
      for (const key of ["lessonIds", "cardIds", "questionIds", "visualIds"] as const) {
        for (const id of link[key]) if (!ids[key].has(id)) issues.push({ level: "error", path, message: `Unknown item ${id}` });
      }
    }
  }
  return issues;
}

export type CoverageRow = {
  objectiveId: string;
  topicId: string;
  domainId: string;
  statement: string;
  sourceState: Objective["sourceState"];
  blockedNote?: string;
  blockedUrls?: string[];
  requiresQualifiedReview: boolean;
  lessonIds: string[];
  cardIds: string[];
  questionIds: string[];
  visualIds: string[];
  learnerQuestionCount: number;
  formQuestionCount: number;
  validatedQuestionCount: number;
  /** Mapped items left out of the counts because an evidence id or its source does not resolve. */
  unresolvedItemIds: string[];
  complete: boolean;
  gap: string | null;
};

export type CoverageOptions = {
  moduleCoverage?: ModuleCoverage[];
  /** When both are given, items count only if every evidence id resolves to a usable source. */
  evidence?: Evidence[];
  sources?: Source[];
};

export const MIN_PRACTICE_QUESTIONS = 3;

export function coverageMatrix(curriculum: Curriculum, modules: ModuleContent[], opts: CoverageOptions = {}): CoverageRow[] {
  const topicById = new Map(curriculum.topics.map((t) => [t.id, t]));
  const lessons = new Map(modules.flatMap((m) => m.lessons.map((x) => [x.id, x] as const)));
  const cards = new Map(modules.flatMap((m) => m.cards.map((x) => [x.id, x] as const)));
  const questions = new Map(modules.flatMap((m) => m.questions.map((x) => [x.id, x] as const)));
  const visuals = new Map(modules.flatMap((m) => m.visuals.map((x) => [x.id, x] as const)));

  const linked = new Map<string, { lessonIds: Set<string>; cardIds: Set<string>; questionIds: Set<string>; visualIds: Set<string> }>();
  const bucket = (oid: string) => {
    let b = linked.get(oid);
    if (!b) linked.set(oid, (b = { lessonIds: new Set(), cardIds: new Set(), questionIds: new Set(), visualIds: new Set() }));
    return b;
  };
  for (const l of lessons.values()) bucket(l.objectiveId).lessonIds.add(l.id);
  for (const c of cards.values()) bucket(c.objectiveId).cardIds.add(c.id);
  for (const v of visuals.values()) bucket(v.objectiveId).visualIds.add(v.id);
  for (const q of questions.values()) for (const oid of q.objectiveIds) bucket(oid).questionIds.add(q.id);
  for (const cov of opts.moduleCoverage ?? []) {
    for (const link of cov.links) {
      const b = bucket(link.objectiveId);
      for (const id of link.lessonIds) if (lessons.has(id)) b.lessonIds.add(id);
      for (const id of link.cardIds) if (cards.has(id)) b.cardIds.add(id);
      for (const id of link.questionIds) if (questions.has(id)) b.questionIds.add(id);
      for (const id of link.visualIds) if (visuals.has(id)) b.visualIds.add(id);
    }
  }

  const checkSources = Boolean(opts.evidence && opts.sources);
  const evidenceById = new Map((opts.evidence ?? []).map((e) => [e.id, e]));
  const sourceById = new Map((opts.sources ?? []).map((s) => [s.id, s]));
  const resolves = (evidenceIds: string[]) =>
    !checkSources ||
    (evidenceIds.length > 0 &&
      evidenceIds.every((id) => {
        const e = evidenceById.get(id);
        return Boolean(e) && sourceUsable(sourceById.get(e!.sourceId));
      }));

  return curriculum.objectives.map((o) => {
    const b = linked.get(o.id);
    const unresolvedItemIds: string[] = [];
    const keep = <T extends { id: string; evidenceIds: string[] }>(ids: Set<string> | undefined, items: Map<string, T>) =>
      [...(ids ?? [])].filter((id) => {
        if (resolves(items.get(id)!.evidenceIds)) return true;
        unresolvedItemIds.push(id);
        return false;
      });
    const lessonIds = keep(b?.lessonIds, lessons);
    const cardIds = keep(b?.cardIds, cards);
    const questionIds = keep(b?.questionIds, questions);
    const visualIds = keep(b?.visualIds, visuals);
    let learnerQuestionCount = 0;
    let formQuestionCount = 0;
    let validatedQuestionCount = 0;
    for (const id of questionIds) {
      const q = questions.get(id)!;
      if (isLearnerVisible(q.review.status)) {
        if (q.pool === "practice") learnerQuestionCount += 1;
        else formQuestionCount += 1;
      }
      if (isValidatedPool(q.review.status)) validatedQuestionCount += 1;
    }
    let gap: string | null = null;
    if (o.sourceState === "blocked") gap = "blocked: no accessible source verifies the fact";
    else if (o.sourceState === "needs_source") gap = "needs source retrieval before a lesson can be written";
    else if (lessonIds.length === 0 && questionIds.length === 0 && cardIds.length === 0) gap = "no learner assets yet";
    else if (lessonIds.length === 0) gap = "missing lesson";
    else if (cardIds.length === 0) gap = "missing recall cards";
    else if (learnerQuestionCount < MIN_PRACTICE_QUESTIONS) gap = `fewer than ${MIN_PRACTICE_QUESTIONS} practice questions`;
    else if (formQuestionCount === 0) gap = "no assessment-form item";
    const topic = topicById.get(o.topicId);
    return {
      objectiveId: o.id,
      topicId: o.topicId,
      domainId: topic?.domainId ?? "unknown",
      statement: o.statement,
      sourceState: o.sourceState,
      blockedNote: o.blockedNote,
      blockedUrls: o.blockedUrls,
      requiresQualifiedReview: o.requiresQualifiedReview,
      lessonIds,
      cardIds,
      questionIds,
      visualIds,
      learnerQuestionCount,
      formQuestionCount,
      validatedQuestionCount,
      unresolvedItemIds,
      complete: gap === null,
      gap,
    };
  });
}

export function coverageMarkdown(
  rows: CoverageRow[],
  breakdown: ReturnType<typeof sourceBreakdown>,
  counts: { lessons: number; cards: number; practice: number; reserved: number; visuals: number },
  generatedOn: string,
): string {
  const complete = rows.filter((r) => r.complete).length;
  const domains = [...new Set(rows.map((r) => r.domainId))];
  const lines = [
    "# Coverage report",
    "",
    `Generated ${generatedOn} by \`npm run content:assemble\`. Do not treat completeness as clinical review.`,
    "",
    `An objective is **complete** when it is source-backed and has a lesson, recall cards, at least ${MIN_PRACTICE_QUESTIONS} learner-visible practice questions, and at least one learner-visible assessment-form item, counting only items whose evidence resolves to a registered, retrieved (or link-only) source. Links come from item objective ids plus each module's \`coverage.json\`; module \`curriculumFollowUps\` are applied to source states.`,
    "",
    "## Totals",
    "",
    "| Measure | Current | Production target |",
    "|---|---|---|",
    `| Objectives complete | ${complete} / ${rows.length} | all |`,
    `| Micro-lessons | ${counts.lessons} | 60–80 |`,
    `| Recall cards | ${counts.cards} | 200+ |`,
    `| Practice questions | ${counts.practice} | ~800 incl. two full forms |`,
    `| Reserved-form questions | ${counts.reserved} | two full forms |`,
    `| Visual exercises | ${counts.visuals} | — |`,
    "",
    `Source state: ${breakdown.public_domain_open} open/public-domain, ${breakdown.link_only} link-only, ${breakdown.needs_source} need a source, ${breakdown.truly_blocked} blocked.`,
    "",
    "## Complete objectives by domain",
    "",
    "| Domain | Complete | Objectives |",
    "|---|---|---|",
    ...domains.map((d) => {
      const inDomain = rows.filter((r) => r.domainId === d);
      return `| ${d} | ${inDomain.filter((r) => r.complete).length} | ${inDomain.length} |`;
    }),
    "",
    "## Blocked objectives and the URLs needed",
    "",
  ];
  const blocked = rows.filter((r) => r.sourceState === "blocked");
  if (!blocked.length) lines.push("None.");
  for (const r of blocked) {
    const urls = (r.blockedUrls ?? []).join(", ");
    lines.push(`- \`${r.objectiveId}\`: ${r.blockedNote ?? ""}${urls ? ` ${urls}` : ""}`);
  }
  lines.push(
    "",
    "## Objective matrix",
    "",
    "| Objective | Source | Lessons | Cards | Practice | Form | Visuals | Gap |",
    "|---|---|---|---|---|---|---|---|",
  );
  for (const r of rows) {
    lines.push(
      `| \`${r.objectiveId}\` | ${r.sourceState} | ${r.lessonIds.length} | ${r.cardIds.length} | ${r.learnerQuestionCount} | ${r.formQuestionCount} | ${r.visualIds.length} | ${r.gap ?? ""} |`,
    );
  }
  lines.push("");
  return lines.join("\n");
}

export function sourceBreakdown(curriculum: Curriculum) {
  const counts = {
    public_domain_open: 0,
    link_only: 0,
    needs_clinical_review: 0,
    truly_blocked: 0,
    needs_source: 0,
  };
  for (const o of curriculum.objectives) {
    if (o.sourceState === "blocked") counts.truly_blocked += 1;
    else if (o.sourceState === "source_backed_link_only") counts.link_only += 1;
    else if (o.sourceState === "source_backed_open") {
      counts.public_domain_open += 1;
      if (o.requiresQualifiedReview) counts.needs_clinical_review += 1;
    } else {
      counts.needs_source += 1;
      if (o.requiresQualifiedReview) counts.needs_clinical_review += 1;
    }
  }
  return counts;
}
