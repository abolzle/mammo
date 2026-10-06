import { Badge } from "@/components/ui/badge";
import type { ReviewStatus } from "@/lib/schemas/content";

const LABELS: Record<ReviewStatus, string> = {
  draft: "Draft",
  auto_checked: "AI-assisted · not clinically reviewed",
  source_checked: "Source-checked",
  clinically_reviewed: "Clinically reviewed",
  disputed: "Disputed",
  retired: "Retired",
};

export function ReviewBadge({ status, requiresQualifiedReview }: { status: ReviewStatus; requiresQualifiedReview?: boolean }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <Badge variant={status === "clinically_reviewed" ? "default" : "outline"}>{LABELS[status]}</Badge>
      {requiresQualifiedReview && status !== "clinically_reviewed" ? (
        <Badge variant="secondary">Needs qualified review</Badge>
      ) : null}
    </span>
  );
}

export function BetaBanner() {
  return (
    <div className="mb-4 rounded-lg border border-teal/30 bg-teal/10 px-3 py-2 text-sm text-navy" role="status">
      Public beta: MQSA material is AI-assisted and source-backed from federal rules, but it has not been independently clinically validated. Quiz scores are practice results, not readiness estimates.
    </div>
  );
}
