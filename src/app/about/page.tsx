"use client";

import { EXAM } from "@/config/exam";

export default function AboutPage() {
  return (
    <article className="space-y-4">
      <h1 className="font-heading text-3xl text-navy">About Mammo</h1>
      <p>
        Mammo is a free study app for people preparing for the U.S. ARRT Mammography certification examination. There is no subscription, trial, advertisement, or account.
      </p>
      <p>
        Educational text is generated ahead of time. Everyday studying does not call an AI service. Content that still needs qualified clinical review is labeled as such.
      </p>
      <p>
        Exam configuration in this build: blueprint effective {EXAM.blueprintEffective}, {EXAM.scoredQuestions} scored questions plus {EXAM.pilotQuestions} pilots ({EXAM.totalQuestions} total), {EXAM.testMinutes} minutes of test time. Research date {EXAM.researchDate}; figures were checked against ARRT documents on {EXAM.verifiedOn}. A passing scaled score of {EXAM.passingScaledScore} is not {EXAM.passingScaledScore}% correct in this bank, and Mammo never converts practice results into a scaled score.
      </p>
      <p className="text-sm text-muted-foreground">
        This is independent educational software. It is not affiliated with ARRT, ACR, ASRT, or FDA. Practice tests are independently designed.
      </p>
    </article>
  );
}
