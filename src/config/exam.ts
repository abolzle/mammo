import { examConfig, type ExamConfig } from "@/lib/schemas/content";

/**
 * The single source of truth for exam facts. Components must read these values
 * from here rather than hard-coding numbers.
 */
export const EXAM: ExamConfig = examConfig.parse({
  configVersion: "2026-10-06.1",
  examId: "arrt-mammography",
  examName: "ARRT Mammography (postprimary) examination",
  blueprintVersion: "ARRT Mammography Content Specifications V.2024.09.09",
  blueprintEffective: "2025-09-01",
  researchDate: "2026-09-29",
  verifiedOn: "2026-10-06",
  domains: [
    {
      id: "dom-patient-care",
      name: "Patient Care",
      scoredQuestions: 20,
      subdomains: [{ id: "sub-patient-interactions", name: "Patient Interactions and Management", scoredQuestions: 20 }],
    },
    {
      id: "dom-image-production",
      name: "Image Production",
      scoredQuestions: 30,
      subdomains: [{ id: "sub-acquisition-qa", name: "Image Acquisition and Quality Assurance", scoredQuestions: 30 }],
    },
    {
      id: "dom-procedures",
      name: "Procedures",
      scoredQuestions: 65,
      subdomains: [
        { id: "sub-anatomy-pathology", name: "Anatomy, Physiology, and Pathology", scoredQuestions: 26 },
        { id: "sub-positioning-procedures", name: "Mammographic Positioning and Procedures", scoredQuestions: 39 },
      ],
    },
  ],
  scoredQuestions: 115,
  pilotQuestions: 30,
  totalQuestions: 145,
  testMinutes: 150,
  appointmentMinutes: 170,
  passingScaledScore: 75,
  scaledScoreRange: [1, 99],
  notes: [
    "Counts verified on 2026-10-06 against the ARRT content specifications (p.1) and the 2026 postprimary handbook timing chart (Section 4).",
    "ARRT's passing scaled score of 75 is not 75% correct, and Mammo never converts practice results into a scaled score.",
    "The appointment includes a tutorial, a nondisclosure agreement, and a survey in addition to test time.",
    "On the real exam you must answer each question before moving on; you can flag questions and return to them.",
  ],
  sourceIds: ["src-arrt-content-spec-2025", "src-arrt-postprimary-handbook-2026", "src-arrt-score-report", "src-arrt-mammography-page"],
});

/**
 * Content policy. Before a public deployment, maintainers should raise
 * `learnerVisibleMinStatus` to "source_checked" once items have actually been checked.
 */
export const CONTENT_POLICY = {
  learnerVisibleMinStatus: "auto_checked" as const,
  validatedPoolStatus: "clinically_reviewed" as const,
  limitedEvidenceBelow: 20,
};

export const STATUS_ORDER = ["draft", "auto_checked", "source_checked", "clinically_reviewed"] as const;

export function domainShare(domainId: string): number {
  const d = EXAM.domains.find((x) => x.id === domainId);
  return d ? d.scoredQuestions / EXAM.scoredQuestions : 0;
}
