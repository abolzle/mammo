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

export function needsConfirmation(review: { status: ReviewStatus; requiresQualifiedReview?: boolean }) {
  return Boolean(review.requiresQualifiedReview) && review.status !== "clinically_reviewed";
}

export function NeedsConfirmationBadge() {
  return <Badge variant="secondary">Needs confirmation by a qualified reviewer</Badge>;
}

export function ReviewBadge({ status, requiresQualifiedReview }: { status: ReviewStatus; requiresQualifiedReview?: boolean }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <Badge variant={status === "clinically_reviewed" ? "default" : "outline"}>{LABELS[status]}</Badge>
      {needsConfirmation({ status, requiresQualifiedReview }) ? <NeedsConfirmationBadge /> : null}
    </span>
  );
}

export function BetaBanner() {
  return (
    <div className="rounded-lg border border-teal/30 bg-teal/10 px-3 py-2 text-sm text-navy" role="status">
      You&apos;re using a public beta. Mammo&apos;s MQSA lessons and questions were created with AI assistance and checked against federal sources, but they have not yet
      been independently clinically validated. Use your results to guide what you practice next, not to predict exam readiness.
    </div>
  );
}
