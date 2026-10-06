import { contentVersions, type LoadedContent } from "@/lib/content/load";
import { allExposures, allObjectives, allSchedules, allSessions, putSession } from "@/lib/db";
import { createSession } from "@/lib/engine/create";
import { planLessonSession, planQuiz, planStudySession, practiceQuestions } from "@/lib/engine/planner";
import {
  dailyPracticePool,
  formPool,
  isFormPool,
  offerAssessment,
  type AssessmentOffer,
  type AssessmentRequest,
  type FormPool,
} from "@/lib/engine/assessment";
import { assembleForm, proportionalMinutes } from "@/lib/engine/forms";
import { newId } from "@/lib/engine/ids";
import type { MinutesPref, Profile, SessionItem, StudySession } from "@/lib/schemas/learner";

export async function startDailySession(content: LoadedContent, profile: Profile, minutes: MinutesPref): Promise<StudySession> {
  const exposures = await allExposures();
  const plan = planStudySession({
    catalog: { curriculum: content.curriculum, modules: content.modules },
    profile,
    minutes,
    schedules: await allSchedules(),
    histories: await allObjectives(),
    seenContent: new Set(exposures.map((e) => e.contentId)),
  });
  const session = createSession({
    kind: "study",
    mode: "study",
    minutes,
    items: plan.items,
    why: plan.why,
    contentVersion: contentVersions(content).curriculum,
    beta: true,
  });
  await putSession(session);
  return session;
}

export async function startDiagnosticSession(content: LoadedContent): Promise<StudySession> {
  const plan = planQuiz({ catalog: { curriculum: content.curriculum, modules: content.modules }, size: 5, mode: "study" });
  const session = createSession({
    kind: "diagnostic",
    mode: "study",
    minutes: 10,
    items: plan.items,
    why: "A short knowledge check to help you choose what to review. You can leave at any time, and the result is only a practice guide.",
    contentVersion: contentVersions(content).curriculum,
    beta: true,
  });
  await putSession(session);
  return session;
}

export async function startLessonSession(content: LoadedContent, lessonId: string): Promise<StudySession | null> {
  const lesson = content.modules.flatMap((m) => m.lessons).find((l) => l.id === lessonId);
  if (!lesson) return null;
  const check = practiceQuestions(content.modules).find((q) => q.id === lesson.checkQuestionId);
  const session = createSession({
    kind: "lesson",
    mode: "study",
    minutes: 10,
    items: planLessonSession(lesson, check),
    why: `You chose a focused lesson on ${lesson.title}.`,
    contentVersion: contentVersions(content).curriculum,
    beta: true,
  });
  await putSession(session);
  return session;
}

export type TimingChoice = { timing: "standard" | "extended" | "untimed"; multiplier: number; allowSkip: boolean };

export const STANDARD_TIMING: TimingChoice = { timing: "standard", multiplier: 1, allowSkip: false };

export function priorAttempts(sessions: StudySession[], formId: string): number {
  return sessions.filter((s) => s.assessment?.formId === formId && s.status === "completed").length;
}

export function formIdFor(offer: Extract<AssessmentOffer, { ok: true }>): string {
  if (offer.kind === "topic_quiz") return `practice:topic:${offer.topicId}`;
  if (offer.kind === "mixed_quiz") return "practice:mixed";
  return `${offer.pool}:${offer.kind}`;
}

/**
 * Starts any Practice-page option. Test mode, and every reserved-form option, uses the
 * submit-at-end player; study-mode quizzes keep immediate explanations.
 */
export async function startAssessment(
  content: LoadedContent,
  request: AssessmentRequest,
  opts: { mode: "study" | "test"; timing: TimingChoice },
): Promise<StudySession> {
  const exposures = await allExposures();
  const seenFamilies = new Set(exposures.map((e) => e.familyId).filter((f): f is string => Boolean(f)));
  const offer = offerAssessment(request, { curriculum: content.curriculum, modules: content.modules });
  if (!offer.ok) throw new Error(offer.reason);
  const reservedKind = offer.pool !== "practice";
  const mode = reservedKind ? "test" : opts.mode;
  const salt = offer.kind === "topic_quiz" ? `topic:${offer.topicId}` : offer.kind === "mixed_quiz" ? "mixed" : `${offer.pool}:${offer.kind}`;
  const reservedPool: FormPool | null = isFormPool(offer.pool) ? offer.pool : null;
  const plan =
    offer.kind === "topic_quiz"
      ? offer.plan
      : assembleForm({
          questions: reservedPool ? formPool(content.modules, reservedPool) : dailyPracticePool(content.modules),
          curriculum: content.curriculum,
          scored: offer.scored,
          pilots: offer.pilots,
          salt,
          seenFamilies,
        });
  if (!plan.ok) throw new Error(offer.kind === "topic_quiz" ? offer.why : "Mammo could not build that form from the questions currently available.");
  const formId = formIdFor(offer);
  const prior = priorAttempts(await allSessions(), formId);
  const isSim = offer.kind === "simulation";
  const timing = mode === "study" ? { ...STANDARD_TIMING, timing: "untimed" as const } : opts.timing;
  const baseMinutes = proportionalMinutes(offer.size);
  const timed = mode === "test" && timing.timing !== "untimed";
  const limitMinutes = timing.timing === "extended" ? Math.ceil(baseMinutes * timing.multiplier) : baseMinutes;
  const requireAnswer = isSim && !timing.allowSkip;
  const standard = mode === "test" && timing.timing === "standard" && (!isSim || requireAnswer);

  const items: SessionItem[] = plan.items.map((fi) => ({
    id: newId("it"),
    type: "question",
    contentId: fi.question.id,
    revision: fi.question.revision,
    objectiveIds: fi.question.objectiveIds,
    familyId: fi.question.familyId,
    pool: fi.question.pool,
    estSeconds: fi.question.estSeconds,
    status: "pending",
    revealed: false,
    role: fi.role,
    ...(fi.pilotSource ? { pilotSource: fi.pilotSource } : {}),
    subdomainId: fi.subdomainId,
    priorExposure: fi.priorExposure,
    flagged: false,
  }));
  if (mode === "study") items.push({ id: newId("it"), type: "recap", contentId: "recap", revision: 1, objectiveIds: [], familyId: null, pool: null, estSeconds: 45, status: "pending", revealed: false });

  const retakeNote = prior > 0 ? ` Retake ${prior + 1}: you have taken this form before, so treat the result as practice rather than a fresh measurement.` : "";
  const timingNote =
    mode === "study"
      ? ""
      : timing.timing === "untimed"
        ? " Untimed practice: not standard exam conditions."
        : timing.timing === "extended"
          ? ` Practice accommodation: ${limitMinutes} minutes (${timing.multiplier}× time). Not standard exam conditions.`
          : ` Timed: ${limitMinutes} minutes.`;
  const session = createSession({
    kind: mode === "test" ? "assessment" : "quiz",
    mode,
    minutes: timed ? limitMinutes : baseMinutes,
    items,
    why: `${offer.why}${timingNote}${isSim && timing.allowSkip ? " Skipping allowed (non-standard)." : ""}${retakeNote}`,
    contentVersion: contentVersions(content).curriculum,
    beta: true,
    timed,
    timeLimitMs: timed ? limitMinutes * 60 * 1000 : null,
    assessment: {
      kind: offer.kind,
      label: offer.label,
      pool: offer.pool,
      formId,
      formVersion: plan.formVersion,
      ...(offer.topicId ? { topicId: offer.topicId } : {}),
      attempt: prior + 1,
      retake: prior > 0,
      standard,
      timing: timing.timing,
      timeMultiplier: timing.timing === "extended" ? timing.multiplier : 1,
      requireAnswer,
      designatedPilots: plan.designatedPilots,
    },
  });
  await putSession(session);
  return session;
}

export { practiceQuestions };
