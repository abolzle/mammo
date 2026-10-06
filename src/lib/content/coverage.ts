import type { Curriculum, ModuleContent, Objective } from "@/lib/schemas/content";
import { isLearnerVisible, isValidatedPool } from "./validate";

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
  validatedQuestionCount: number;
  gap: string | null;
};

export function coverageMatrix(curriculum: Curriculum, modules: ModuleContent[]): CoverageRow[] {
  const topicById = new Map(curriculum.topics.map((t) => [t.id, t]));
  return curriculum.objectives.map((o) => {
    const lessonIds: string[] = [];
    const cardIds: string[] = [];
    const questionIds: string[] = [];
    const visualIds: string[] = [];
    let learnerQuestionCount = 0;
    let validatedQuestionCount = 0;
    for (const m of modules) {
      for (const l of m.lessons) if (l.objectiveId === o.id) lessonIds.push(l.id);
      for (const c of m.cards) if (c.objectiveId === o.id) cardIds.push(c.id);
      for (const v of m.visuals) if (v.objectiveId === o.id) visualIds.push(v.id);
      for (const q of m.questions) {
        if (!q.objectiveIds.includes(o.id)) continue;
        questionIds.push(q.id);
        if (isLearnerVisible(q.review.status) && q.pool === "practice") learnerQuestionCount += 1;
        if (isValidatedPool(q.review.status)) validatedQuestionCount += 1;
      }
    }
    let gap: string | null = null;
    if (o.sourceState === "blocked") gap = "blocked: no accessible source verifies the fact";
    else if (o.sourceState === "needs_source") gap = "needs source retrieval before a lesson can be written";
    else if (lessonIds.length === 0 && questionIds.length === 0 && cardIds.length === 0) gap = "no learner assets yet";
    else if (lessonIds.length === 0) gap = "missing lesson";
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
      validatedQuestionCount,
      gap,
    };
  });
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
