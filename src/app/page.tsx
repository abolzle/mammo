"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/components/app-provider";
import { BetaBanner } from "@/components/review-badge";
import { activeSession } from "@/lib/db";
import { startDailySession } from "@/lib/engine/start";
import { Onboarding } from "@/components/onboarding";
import type { MinutesPref, StudySession } from "@/lib/schemas/learner";

export default function TodayPage() {
  const { ready, error, content, profile, updateProfile } = useApp();
  const router = useRouter();
  const [open, setOpen] = useState<StudySession | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void activeSession().then(setOpen);
  }, [ready]);

  if (!ready) return <p>Loading…</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!content || !profile) return null;

  const minutes = profile.minutesPref;
  const primary = open ? "Continue my session" : `Start my ${minutes} minutes`;

  async function start(mins: MinutesPref) {
    if (!content || !profile) return;
    setBusy(true);
    const s = await startDailySession(content, profile, mins);
    router.push(`/session/?id=${s.id}`);
  }

  return (
    <div className="space-y-6">
      <BetaBanner />
      <header className="space-y-2">
        <p className="text-sm font-medium text-teal">Free MQSA study, on your time</p>
        <h1 className="font-heading text-3xl text-navy">You have five minutes. Let&apos;s make them useful.</h1>
        <p className="text-muted-foreground">
          No account. No API key. Today&apos;s mix stays on this device. App study is not approved CE and does not establish clinical qualification.
        </p>
      </header>

      {!profile.onboardingComplete ? <Onboarding profile={profile} onSave={updateProfile} /> : null}

      <Card>
        <CardHeader>
          <CardTitle>{primary}</CardTitle>
          <CardDescription>
            {open
              ? `You left a ${open.budgetMinutes}-minute session partway through. Answers already saved will not be duplicated.`
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
          <Button variant="outline" className="min-h-11" disabled={busy} onClick={() => start(5)}>
            Five minutes instead
          </Button>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Progress lives in this browser. It does not sync across devices and can disappear if storage is cleared. Export a backup from Settings after a real study streak.
      </p>
    </div>
  );
}
