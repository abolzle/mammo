import { contentVersions, type LoadedContent } from "@/lib/content/load";
import { allExposures, allObjectives, allSchedules, putSession } from "@/lib/db";
import { createSession } from "@/lib/engine/create";
import { planLessonSession, planQuiz, planStudySession, practiceQuestions } from "@/lib/engine/planner";
import type { MinutesPref, Profile, StudySession } from "@/lib/schemas/learner";

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

export async function startQuizSession(
  content: LoadedContent,
  size: number,
  mode: "study" | "test",
  topicId?: string,
): Promise<StudySession> {
  const plan = planQuiz({ catalog: { curriculum: content.curriculum, modules: content.modules }, size, topicId, mode });
  const minutes = (plan.offered <= 8 ? 10 : plan.offered <= 20 ? 20 : 20) as MinutesPref;
  const session = createSession({
    kind: "quiz",
    mode,
    minutes,
    items: plan.items,
    why: plan.why,
    contentVersion: contentVersions(content).curriculum,
    beta: true,
    timed: mode === "test",
    timeLimitMs: mode === "test" ? minutes * 60 * 1000 : null,
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
    why: `A single lesson: ${lesson.title}.`,
    contentVersion: contentVersions(content).curriculum,
    beta: true,
  });
  await putSession(session);
  return session;
}

export { practiceQuestions };
