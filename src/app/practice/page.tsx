"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useApp } from "@/components/app-provider";
import { EXAM } from "@/config/exam";
import { planFullSimulationUnavailable, practiceQuestions, reservedFamilies } from "@/lib/engine/planner";
import { startFormQuizSession, startQuizSession } from "@/lib/engine/start";
import { offerAssessment } from "@/lib/engine/assessment";

export default function PracticePage() {
  const { content, ready, error } = useApp();
  const router = useRouter();
  const [note, setNote] = useState<string | null>(null);
  const [mode, setMode] = useState<"study" | "test">("study");

  if (!ready) return <p>Loading…</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!content) return null;

  const available = practiceQuestions(content.modules).length;
  const reserved = reservedFamilies(content.modules).size;
  const sim = planFullSimulationUnavailable(EXAM.totalQuestions, available);
  const baseline = offerAssessment("baseline", content.modules);
  const checkpoint = offerAssessment("checkpoint", content.modules);
  const formQuiz = offerAssessment("form_quiz", content.modules);

  async function go(size: number, topicId?: string) {
    if (!content) return;
    const s = await startQuizSession(content, size, mode, topicId);
    router.push(`/session/?id=${s.id}`);
  }

  async function goForm() {
    if (!content) return;
    if (!formQuiz.ok) {
      setNote(formQuiz.reason);
      return;
    }
    const s = await startFormQuizSession(content, formQuiz.size);
    router.push(`/session/?id=${s.id}`);
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl text-navy">Practice</h1>
      <p className="text-muted-foreground">
        Short beta quizzes from the MQSA practice pool. {available} practice questions are available. {reserved} families are reserved for a future form and stay out of daily study.
      </p>
      <fieldset>
        <legend className="text-sm font-medium">Feedback</legend>
        <div className="mt-2 flex gap-2">
          <Button variant={mode === "study" ? "default" : "outline"} className="min-h-11" onClick={() => setMode("study")}>
            Study mode (immediate explanation)
          </Button>
          <Button variant={mode === "test" ? "default" : "outline"} className="min-h-11" onClick={() => setMode("test")}>
            Test mode (feedback after submit)
          </Button>
        </div>
      </fieldset>
      <div className="grid gap-3">
        <Button className="min-h-11" onClick={() => go(8)}>
          8-question MQSA quiz
        </Button>
        <Button variant="outline" className="min-h-11" onClick={() => go(20)}>
          20-question MQSA quiz
        </Button>
        <Button
          variant="outline"
          className="min-h-11"
          onClick={() => {
            if (!baseline.ok) setNote(baseline.reason);
            else void go(30);
          }}
        >
          30-question baseline
        </Button>
        <Button
          variant="outline"
          className="min-h-11"
          onClick={() => {
            if (!checkpoint.ok) setNote(checkpoint.reason);
            else void go(60);
          }}
        >
          60-question checkpoint
        </Button>
        <Button variant="outline" className="min-h-11" onClick={() => void goForm()}>
          Reserved Form A quiz (test mode)
        </Button>
        <Button variant="outline" className="min-h-11" onClick={() => setNote(sim.message)}>
          Full {EXAM.totalQuestions}-question simulation
        </Button>
      </div>
      {note ? (
        <p className="rounded-lg border p-3 text-sm" role="status">
          {note}
        </p>
      ) : null}
      <p className="text-sm text-muted-foreground">
        There is no clinically reviewed assessment pool yet. Scores are provisional practice results. Local timers can be manipulated; this is self-study, not a proctored exam.
      </p>
    </div>
  );
}
