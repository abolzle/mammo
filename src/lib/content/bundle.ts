import { CONTENT_POLICY, STATUS_ORDER } from "@/config/exam";
import type { Curriculum, Evidence, ModuleContent, ReviewStatus, Source } from "@/lib/schemas/content";
import type { AssembledContent, Issue } from "./assemble";

export interface ModuleSummary {
  id: string;
  version: string;
  title: string;
  summary: string;
  topicIds: string[];
  file: string;
  counts: { lessons: number; questions: number; cards: number; visuals: number };
}

/** /content/index.json: small, loaded first. Modules are fetched per topic on demand. */
export interface ContentIndex {
  contentVersion: string;
  builtOn: string;
  curriculum: Curriculum;
  sources: Source[];
  evidence: Evidence[];
  modules: ModuleSummary[];
}

type Reviewed = { id: string; review: { status: ReviewStatus; history: { at: string; status: ReviewStatus; actor: string; kind: string; note?: string }[] } };

/**
 * Marks drafts that passed every automated check as "auto_checked". This records an
 * automated result only; it is never maintainer source checking or clinical review.
 */
export function promoteAutoChecked(content: AssembledContent, issues: Issue[], on: string): AssembledContent {
  const failing = new Set(issues.filter((i) => i.level === "error").map((i) => i.itemId));
  const promote = <T extends Reviewed>(x: T): T =>
    x.review.status !== "draft" || failing.has(x.id)
      ? x
      : {
          ...x,
          review: {
            ...x.review,
            status: "auto_checked",
            history: [
              ...x.review.history,
              { at: on, status: "auto_checked", actor: "automation", kind: "automated_validation", note: "Passed schema, reference, key, rights and text-safety checks. Not a source check or clinical review." },
            ],
          },
        };
  return {
    ...content,
    evidence: content.evidence.map(promote),
    modules: content.modules.map((m) => ({
      ...m,
      lessons: m.lessons.map(promote),
      questions: m.questions.map(promote),
      cards: m.cards.map(promote),
      visuals: m.visuals.map(promote),
      assets: m.assets.map(promote),
    })),
  };
}

export const statusRank = (s: ReviewStatus) => {
  const i = (STATUS_ORDER as readonly string[]).indexOf(s);
  return i === -1 ? -1 : i;
};

/** Disputed and retired items are never shown; others must reach the configured minimum. */
export function isLearnerVisible(status: ReviewStatus, min: ReviewStatus = CONTENT_POLICY.learnerVisibleMinStatus): boolean {
  if (status === "disputed" || status === "retired") return false;
  return statusRank(status) >= statusRank(min);
}

/** Only clinically reviewed, non-qualified-flag-pending items may enter the validated assessment pool. */
export function isValidatedPoolEligible(review: { status: ReviewStatus }): boolean {
  return review.status === CONTENT_POLICY.validatedPoolStatus;
}

export function filterVisible(m: ModuleContent, min?: ReviewStatus): ModuleContent {
  const ok = (x: { review: { status: ReviewStatus } }) => isLearnerVisible(x.review.status, min);
  return { ...m, lessons: m.lessons.filter(ok), questions: m.questions.filter(ok), cards: m.cards.filter(ok), visuals: m.visuals.filter(ok) };
}

export const STATUS_LABEL: Record<ReviewStatus, string> = {
  draft: "Draft",
  auto_checked: "Beta · automated checks passed",
  source_checked: "Beta · source checked by maintainer",
  clinically_reviewed: "Clinically reviewed",
  disputed: "Disputed",
  retired: "Retired",
};
