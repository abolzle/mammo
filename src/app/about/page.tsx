"use client";

import { EXAM } from "@/config/exam";

export default function AboutPage() {
  return (
    <article className="space-y-4">
      <h1 className="font-heading text-3xl text-navy">About Mammo</h1>
      <p>
        Mammo is a free, self-paced study tool for mammography technologists and anyone preparing for the U.S. ARRT Mammography certification examination. It is designed
        to make it easier to fit focused review into a workday, whether you have five minutes or time for a full practice form.
      </p>
      <p>
        Start on <strong>Today</strong> for a short study plan, open <strong>Learn</strong> when you want to choose a lesson, use <strong>Practice</strong> for quizzes and
        exam-style forms, and visit <strong>Progress</strong> to see what you have covered. Your work is saved in this browser, so there is no account, subscription, trial,
        or advertising.
      </p>
      <p>
        Mammo&apos;s educational material is prepared before it reaches the app. Studying does not send your questions or answers to a live AI service. Material created
        with AI assistance is identified, tied to sources, and labeled when it still needs qualified clinical review.
      </p>
      <p>
        {`This build follows the ARRT blueprint effective ${EXAM.blueprintEffective}: ${EXAM.scoredQuestions} scored questions plus ${EXAM.pilotQuestions} pilot questions (${EXAM.totalQuestions} total) in ${EXAM.testMinutes} minutes. These details were checked against ARRT documents on ${EXAM.verifiedOn}. ARRT's passing scaled score of ${EXAM.passingScaledScore} does not mean ${EXAM.passingScaledScore}% correct here, and Mammo does not turn practice results into a scaled score or a chance of passing.`}
      </p>
      <p className="text-sm text-muted-foreground">
        Mammo is independent educational software and is not affiliated with ARRT, ACR, ASRT, or FDA. Its practice questions and forms are independently designed.
      </p>
    </article>
  );
}
