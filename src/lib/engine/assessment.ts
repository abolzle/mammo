import { EXAM } from "@/config/exam";
import { isValidatedPool } from "@/lib/content/validate";
import type { ModuleContent, Question } from "@/lib/schemas/content";
import { practiceQuestions, reservedFamilies } from "./planner";

export type AssessmentKind = "topic_quiz" | "mixed_quiz" | "form_quiz" | "baseline" | "checkpoint" | "simulation";

export type AssessmentOffer =
  | { ok: true; kind: AssessmentKind; size: number; pool: "practice" | "form-a"; mode: "study" | "test"; why: string }
  | { ok: false; kind: AssessmentKind; available: number; required: number; reason: string; fallback: AssessmentKind | null };

export function offerAssessment(kind: AssessmentKind, modules: ModuleContent[]): AssessmentOffer {
  const practice = practiceQuestions(modules).filter((q) => !reservedFamilies(modules).has(q.familyId));
  const formA = modules.flatMap((m) => m.questions.filter((q) => q.pool === "form-a"));
  const reserved = modules.flatMap((m) => m.questions.filter((q) => q.pool !== "practice"));

  if (kind === "mixed_quiz") {
    const size = Math.min(10, practice.length);
    if (size === 0) return { ok: false, kind, available: 0, required: 1, reason: "No practice questions are available yet.", fallback: null };
    return {
      ok: true,
      kind,
      size,
      pool: "practice",
      mode: "study",
      why: size < 10 ? `Only ${size} practice questions are available, so this quiz is shorter.` : "A 10-question mixed beta quiz.",
    };
  }
  if (kind === "topic_quiz") {
    const size = Math.min(8, practice.length);
    if (size === 0) return { ok: false, kind, available: 0, required: 1, reason: "No practice questions are available for this topic yet.", fallback: null };
    return { ok: true, kind, size, pool: "practice", mode: "study", why: `A ${size}-question topic quiz from the practice pool.` };
  }
  if (kind === "form_quiz") {
    if (formA.length < 10) {
      return {
        ok: false,
        kind,
        available: formA.length,
        required: 10,
        reason: `A reserved Form A quiz needs 10 distinct items; ${formA.length} are written so far.`,
        fallback: practice.length >= 8 ? "mixed_quiz" : null,
      };
    }
    return {
      ok: true,
      kind,
      size: 10,
      pool: "form-a",
      mode: "test",
      why: "Reserved Form A items in test mode. These families stay out of daily study.",
    };
  }
  if (kind === "baseline") {
    if (formA.length < 30) {
      return {
        ok: false,
        kind,
        available: formA.length,
        required: 30,
        reason: `A 30-question baseline needs 30 distinct reserved questions; ${formA.length} Form A items are written. Take a shorter quiz instead of a padded score.`,
        fallback: formA.length >= 10 ? "form_quiz" : "mixed_quiz",
      };
    }
    return { ok: true, kind, size: 30, pool: "form-a", mode: "test", why: "30-question reserved baseline." };
  }
  if (kind === "checkpoint") {
    if (formA.length < 60) {
      return {
        ok: false,
        kind,
        available: formA.length,
        required: 60,
        reason: `A 60-question checkpoint needs 60 distinct reserved questions; ${formA.length} Form A items are written.`,
        fallback: formA.length >= 10 ? "form_quiz" : "mixed_quiz",
      };
    }
    return { ok: true, kind, size: 60, pool: "form-a", mode: "test", why: "60-question reserved checkpoint." };
  }
  const required = EXAM.totalQuestions;
  if (reserved.length < required) {
    return {
      ok: false,
      kind: "simulation",
      available: reserved.length,
      required,
      reason: `A full simulation needs ${required} distinct reserved questions (${EXAM.scoredQuestions} scored allocated ${EXAM.domains.map((d) => d.scoredQuestions).join("/")} plus ${EXAM.pilotQuestions} pilots). The bank has ${reserved.length}.`,
      fallback: formA.length >= 10 ? "form_quiz" : "mixed_quiz",
    };
  }
  return { ok: true, kind: "simulation", size: required, pool: "form-a", mode: "test", why: "Full simulation." };
}

export function formQuestions(modules: ModuleContent[]): Question[] {
  return modules.flatMap((m) => m.questions.filter((q) => q.pool === "form-a"));
}

export function noneValidated(modules: ModuleContent[]): boolean {
  return !modules.flatMap((m) => m.questions).some((q) => isValidatedPool(q.review.status));
}
