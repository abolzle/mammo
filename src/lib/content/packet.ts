import type { Curriculum, Evidence, Question, Source } from "@/lib/schemas/content";
import { lesson, question as questionSchema, recallCard } from "@/lib/schemas/content";
import { validateImportedJson } from "./validate";

const QUESTION_FIELDS = `id, revision, objectiveIds, familyId, pool (practice|form-a|form-b), difficultyIntent, kind, stem, choices[4]{id a-d, text, rationale}, correctChoiceId, explanation, variants{simpler, example, deeper?}, evidenceIds, estSeconds, review.status=draft`;

export type PacketSource = {
  sources: Source[];
  evidence: Evidence[];
  curriculum: Curriculum;
};

function evidenceForObjectives(packet: PacketSource, objectiveIds: string[]): Evidence[] {
  const obj = packet.curriculum.objectives.filter((o) => objectiveIds.includes(o.id));
  const allowed = new Set(obj.flatMap((o) => o.sourceIds));
  return packet.evidence.filter((e) => allowed.has(e.sourceId));
}

function renderEvidence(e: Evidence, source: Source | undefined): string {
  const canAi = source?.rights.canSubmitToAI ?? false;
  const canQuote = source?.rights.canQuote && e.citation === "quoted_public";
  if (!canAi) {
    return [
      `### ${e.id} (link-only — do not ingest restricted text)`,
      `Source: ${source?.title ?? e.sourceId} — ${source?.url ?? ""}`,
      `Locator: ${e.locator}`,
      `Claim (original wording): ${e.claim}`,
      `Scope: ${e.scope}`,
      e.exceptions ? `Exceptions: ${e.exceptions}` : "",
      "Do not quote or submit the source document to an AI service. Teach the fact in original wording and keep the citation link-only.",
    ]
      .filter(Boolean)
      .join("\n");
  }
  return [
    `### ${e.id}`,
    `Source: ${source?.title ?? e.sourceId} (${e.sourceId})`,
    `Locator: ${e.locator}`,
    `Claim: ${e.claim}`,
    `Scope: ${e.scope}`,
    e.exceptions ? `Exceptions: ${e.exceptions}` : "",
    canQuote && e.excerpt ? `Excerpt (quoted_public):\n${e.excerpt}` : "No verbatim excerpt in this packet.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildGeneratePacket(packet: PacketSource, objectiveIds: string[], generateTemplate: string): string {
  const objectives = packet.curriculum.objectives.filter((o) => objectiveIds.includes(o.id));
  const evidence = evidenceForObjectives(packet, objectiveIds);
  const evidenceBlock = evidence
    .map((e) => renderEvidence(e, packet.sources.find((s) => s.id === e.sourceId)))
    .join("\n\n");
  const objBlock = objectives
    .map((o) => `- ${o.id} [${o.sourceState}] ${o.statement}${o.blockedNote ? ` BLOCKED: ${o.blockedNote}` : ""}`)
    .join("\n");
  return generateTemplate
    .replace("Paste authorized evidence records here.", evidenceBlock || "(no authorized evidence for these objectives)")
    .replace("Paste objective ids and statements here.", objBlock || "(no objectives)")
    .concat(
      `\n\n## JSON field contract\n${QUESTION_FIELDS}\n\nIf an objective is blocked or needs_source, output {"status":"needs source","objectiveId":"..."} instead of inventing a fact.\n`,
    );
}

export function buildCritiquePacket(args: {
  question: Question;
  evidence: Evidence[];
  sources: Source[];
  critiqueTemplate: string;
}): string {
  const ev = args.question.evidenceIds
    .map((id) => args.evidence.find((e) => e.id === id))
    .filter((e): e is Evidence => Boolean(e));
  const body = [
    args.critiqueTemplate,
    "",
    "## Item under review",
    JSON.stringify(
      {
        id: args.question.id,
        stem: args.question.stem,
        choices: args.question.choices,
        proposedCorrectChoiceId: args.question.correctChoiceId,
        explanation: args.question.explanation,
        evidenceIds: args.question.evidenceIds,
        review: args.question.review,
      },
      null,
      2,
    ),
    "",
    "## Evidence",
    ev.map((e) => renderEvidence(e, args.sources.find((s) => s.id === e.sourceId))).join("\n\n") || "(missing evidence)",
  ].join("\n");
  return body;
}

export type DraftKind = "question" | "lesson" | "card";

export function parseDraftJson(text: string): { ok: true; kind: DraftKind; data: unknown } | { ok: false; issues: string[] } {
  const raw = validateImportedJson(text);
  if (!raw.ok) return { ok: false, issues: raw.issues.map((i) => i.message) };
  const q = questionSchema.safeParse(raw.data);
  if (q.success) {
    if (q.data.review.status === "clinically_reviewed") {
      return { ok: false, issues: ["Imported drafts may not set review.status to clinically_reviewed."] };
    }
    return { ok: true, kind: "question", data: q.data };
  }
  const l = lesson.safeParse(raw.data);
  if (l.success) {
    if (l.data.review.status === "clinically_reviewed") {
      return { ok: false, issues: ["Imported drafts may not set review.status to clinically_reviewed."] };
    }
    return { ok: true, kind: "lesson", data: l.data };
  }
  const c = recallCard.safeParse(raw.data);
  if (c.success) {
    if (c.data.review.status === "clinically_reviewed") {
      return { ok: false, issues: ["Imported drafts may not set review.status to clinically_reviewed."] };
    }
    return { ok: true, kind: "card", data: c.data };
  }
  return {
    ok: false,
    issues: [
      "JSON did not match the question, lesson, or recall-card schema.",
      ...q.error.issues.slice(0, 8).map((i) => `question: ${i.path.join(".")}: ${i.message}`),
    ],
  };
}

