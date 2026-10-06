import type { Question } from "@/lib/schemas/content";
import type { ResponseEvent } from "@/lib/schemas/learner";

export type Reconciled = {
  event: ResponseEvent;
  status: "current" | "revised" | "key_corrected" | "removed";
  correctedCorrect: boolean | null;
  note: string | null;
};

/** History is never rewritten: the original result stays, and any corrected result is shown alongside it. */
export function reconcileEvent(event: ResponseEvent, question: Question | undefined): Reconciled {
  if (event.type !== "question") {
    return { event, status: "current", correctedCorrect: event.correct, note: null };
  }
  if (!question) {
    return {
      event,
      status: "removed",
      correctedCorrect: null,
      note: "This question is no longer in the library. Your original result is still saved.",
    };
  }
  if (question.revision === event.contentRevision) {
    return { event, status: "current", correctedCorrect: event.correct, note: null };
  }
  const keyAtAttempt = question.keyHistory.find((k) => k.revision === event.contentRevision);
  const oldKey = keyAtAttempt?.correctChoiceId;
  if (oldKey && oldKey !== question.correctChoiceId) {
    const corrected = event.answer === question.correctChoiceId;
    const change = question.keyHistory.find((k) => k.revision >= event.contentRevision);
    return {
      event,
      status: "key_corrected",
      correctedCorrect: corrected,
      note: `The answer key was corrected after you answered${change ? ` (${change.changedOn}: ${change.reason})` : ""}. Original result: ${event.correct ? "correct" : "incorrect"}; under the corrected key: ${corrected ? "correct" : "incorrect"}. Historical scores are not silently rewritten.`,
    };
  }
  return {
    event,
    status: "revised",
    correctedCorrect: event.correct,
    note: "The question wording was revised after you answered; the key did not change.",
  };
}
