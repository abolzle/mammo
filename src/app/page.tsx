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
      <BetaBanner />
      <header className="space-y-2">
        <p className="text-sm font-medium text-teal">Free MQSA study, on your time</p>
        <h1 className="font-heading text-3xl text-navy">You have {sessionMinutes} minutes. Let&apos;s make them useful.</h1>
        <p className="text-muted-foreground">
          No account. No API key. Today&apos;s mix stays on this device. App study is not approved CE and does not establish clinical qualification.
        </p>
      </header>

      {!profile.onboardingComplete ? (
        <Onboarding
          profile={profile}
          onSave={updateProfile}
          onDiagnostic={async () => {
            const s = await startDiagnosticSession(content);
            await updateProfile({ ...profile, onboardingComplete: true, diagnosticStatus: "done" });
            router.push(`/session/?id=${s.id}`);
          }}
        />
      ) : null}

      {fit ? (
        <p className="rounded-lg border p-3 text-sm" role="status">
          {fit}
        </p>
      ) : null}
      {longAbsence ? (
        <p className="rounded-lg border p-3 text-sm" role="status">
          It has been a while. A short diagnostic is available from Practice if you want a recheck. Missed days do not become a backlog.
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{primary}</CardTitle>
          <CardDescription>
            {open
              ? `You left a ${open.budgetMinutes}-minute session partway through. Answers already saved stay on this device. Start over clears that session from Today.`
              : `A ${minutes}-minute plan: due recall first, then a small MQSA lesson or questions, then a recap. We will not promise ${minutes} minutes and deliver twenty-five.`}
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

      <p className="text-sm text-muted-foreground">
        Progress lives in this browser. It does not sync across devices and can disappear if storage is cleared. Export a backup from Settings after a real study streak.
      </p>
    </div>
  );
}
