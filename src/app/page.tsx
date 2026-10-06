"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/components/app-provider";
import { BetaBanner } from "@/components/review-badge";
import { allObjectives, openDailySessions, putSession } from "@/lib/db";
import { abandonSession } from "@/lib/engine/session";
import { startDailySession, startDiagnosticSession } from "@/lib/engine/start";
import { planInsufficientTime } from "@/lib/engine/planner";
import { Onboarding } from "@/components/onboarding";
import type { MinutesPref, StudySession } from "@/lib/schemas/learner";

export default function TodayPage() {
  const { ready, error, content, profile, updateProfile } = useApp();
  const router = useRouter();
  const [open, setOpen] = useState<StudySession | null>(null);
  const [busy, setBusy] = useState(false);
  const [unseen, setUnseen] = useState(0);

  useEffect(() => {
    void openDailySessions().then((sessions) => setOpen(sessions[0] ?? null));
    void allObjectives().then((hist) => {
      if (!content) return;
      const seen = new Set(hist.filter((h) => h.seen > 0).map((h) => h.objectiveId));
      setUnseen(content.curriculum.objectives.filter((o) => o.sourceState !== "blocked" && !seen.has(o.id)).length);
    });
  }, [ready, content]);

  if (!ready) return <p>Loading…</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!content || !profile) return null;

  const minutes = profile.minutesPref;
  const sessionMinutes = open?.budgetMinutes ?? minutes;
  const primary = open ? "Continue my session" : `Start my ${minutes} minutes`;
  const fit = planInsufficientTime({ examDate: profile.examDate, minutesPref: minutes, remainingObjectives: unseen });
  const absenceDays = (Date.now() - Date.parse(profile.lastActiveAt)) / (24 * 60 * 60 * 1000);
  const longAbsence = profile.onboardingComplete && absenceDays >= 14;

  async function clearOpenSessions() {
    const sessions = await openDailySessions();
    for (const s of sessions) await putSession(abandonSession(s));
    setOpen(null);
  }

  async function start(mins: MinutesPref) {
    if (!content || !profile) return;
    setBusy(true);
    try {
      await clearOpenSessions();
      const s = await startDailySession(content, profile, mins);
      router.push(`/session/?id=${s.id}`);
    } catch (e) {
      setBusy(false);
      console.error(e);
    }
  }

  async function startOver() {
    if (busy) return;
    setBusy(true);
    try {
      await clearOpenSessions();
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium text-teal">Study support for the mammography registry</p>
        <h1 className="font-heading text-3xl text-navy">Ready for a {sessionMinutes}-minute study session?</h1>
        <p className="text-muted-foreground">
          Mammo builds a focused mix of review cards, short lessons, and practice questions for the time you have. No account is required, and your work is saved in
          this browser. This study does not award CE or establish clinical qualification.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{primary}</CardTitle>
          <CardDescription>
            {open
              ? `Pick up where you left off. Your answers are already saved in this browser, or you can start over with a fresh plan.`
              : `We will begin with any review cards that are due, then add a short lesson or a few questions, and finish with a recap. The plan is designed to fit the ${minutes} minutes you chose.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          {open ? (
            <Button className="min-h-11" onClick={() => router.push(`/session/?id=${open.id}`)}>
              Continue my session
            </Button>
          ) : (
            <Button className="min-h-11" disabled={busy} onClick={() => start(minutes)}>
              {busy ? "Building…" : primary}
            </Button>
          )}
          {sessionMinutes === 5 ? null : (
            <Button variant="outline" className="min-h-11" disabled={busy} onClick={() => start(5)}>
              Five minutes instead
            </Button>
          )}
          {open ? (
            <Button variant="ghost" className="min-h-11" disabled={busy} onClick={() => void startOver()}>
              Start over
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <BetaBanner />

      {fit ? (
        <p className="rounded-lg border p-3 text-sm" role="status">
          {fit}
        </p>
      ) : null}
      {longAbsence ? (
        <p className="rounded-lg border p-3 text-sm" role="status">
          Welcome back. You do not need to make up missed days. Start with today&apos;s plan, or use a short knowledge check in Practice to see what you want to review.
        </p>
      ) : null}

      {!profile.onboardingComplete ? (
        <>
          <section className="space-y-3" aria-labelledby="how-mammo-works">
            <div className="space-y-1">
              <h2 id="how-mammo-works" className="font-heading text-2xl text-navy">
                How Mammo works
              </h2>
              <p className="text-muted-foreground">Use the part that matches what you need today. Your work carries across all four screens.</p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              <li className="rounded-xl border p-4">
                <p className="font-medium">Today</p>
                <p className="mt-1 text-sm text-muted-foreground">Start a short, guided mix of review cards, lessons, and questions.</p>
              </li>
              <li className="rounded-xl border p-4">
                <p className="font-medium">Learn</p>
                <p className="mt-1 text-sm text-muted-foreground">Browse available lessons by exam content area and choose your own topic.</p>
              </li>
              <li className="rounded-xl border p-4">
                <p className="font-medium">Practice</p>
                <p className="mt-1 text-sm text-muted-foreground">Take focused quizzes or work through a reserved, exam-style form.</p>
              </li>
              <li className="rounded-xl border p-4">
                <p className="font-medium">Progress</p>
                <p className="mt-1 text-sm text-muted-foreground">See your study time, completed sessions, results, and content coverage.</p>
              </li>
            </ul>
          </section>

          <Onboarding
            profile={profile}
            onSave={updateProfile}
            onDiagnostic={async () => {
              const s = await startDiagnosticSession(content);
              await updateProfile({ ...profile, onboardingComplete: true, diagnosticStatus: "done" });
              router.push(`/session/?id=${s.id}`);
            }}
          />
        </>
      ) : null}

      <p className="text-sm text-muted-foreground">
        Your progress is saved in this browser and does not sync to another device. Once you have study history you want to keep, download a backup from Settings.
      </p>
    </div>
  );
}
