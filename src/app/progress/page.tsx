"use client";

import { useEffect, useState } from "react";
import { EXAM } from "@/config/exam";
import { useApp } from "@/components/app-provider";
import { allEvents, allObjectives, allSessions } from "@/lib/db";
import { reconcileEvent } from "@/lib/engine/reconcile";
import type { ObjectiveHistory, ResponseEvent, StudySession } from "@/lib/schemas/learner";

export default function ProgressPage() {
  const { content, ready } = useApp();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [events, setEvents] = useState<ResponseEvent[]>([]);
  const [hist, setHist] = useState<ObjectiveHistory[]>([]);

  useEffect(() => {
    void Promise.all([allSessions(), allEvents(), allObjectives()]).then(([s, e, h]) => {
      setSessions(s);
      setEvents(e);
      setHist(h);
    });
  }, [ready]);

  if (!ready || !content) return <p>Loading…</p>;

  const scored = events.filter((e) => e.type === "question" || e.type === "visual");
  const first = scored.filter((e) => e.firstExposure);
  const firstCorrect = first.filter((e) => e.correct).length;
  const completed = sessions.filter((s) => s.status === "completed");
  const minutes = Math.round(sessions.reduce((a, s) => a + s.elapsedMs, 0) / 60000);

  const questions = content.modules.flatMap((m) => m.questions);
  const corrections = events
    .map((e) => reconcileEvent(e, questions.find((q) => q.id === e.contentId)))
    .filter((r) => r.status === "key_corrected");

  const byDomain = EXAM.domains.map((d) => {
    const topicIds = new Set(content.curriculum.topics.filter((t) => t.domainId === d.id).map((t) => t.id));
    const objs = content.curriculum.objectives.filter((o) => topicIds.has(o.topicId));
    const seen = objs.filter((o) => (hist.find((h) => h.objectiveId === o.id)?.seen ?? 0) > 0).length;
    return { name: d.name, seen, total: objs.length };
  });

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl text-navy">Progress</h1>
      <p className="text-muted-foreground">
        See what you have covered, how much time you have spent, and how your first answers compare with repeat practice. This page reflects work saved in this browser
        only; it is not an ARRT score or a prediction of exam readiness.
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        <li className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Completed sessions</p>
          <p className="text-2xl font-heading">{completed.length}</p>
        </li>
        <li className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Time on this device</p>
          <p className="text-2xl font-heading">{minutes} min</p>
        </li>
        <li className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Correct on the first try</p>
          <p className="text-2xl font-heading">
            {first.length ? `${firstCorrect}/${first.length}` : "—"}
          </p>
          {first.length < 20 ? <p className="text-xs text-muted-foreground">Small sample so far</p> : null}
        </li>
        <li className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Questions repeated for review</p>
          <p className="text-2xl font-heading">{scored.length - first.length}</p>
        </li>
      </ul>
      <section>
        <h2 className="font-heading text-xl">Content you have covered</h2>
        <ul className="mt-2 space-y-2">
          {byDomain.map((d) => (
            <li key={d.name} className="text-sm">
              {d.name}: {d.seen} of {d.total} objectives seen
            </li>
          ))}
        </ul>
      </section>
      <p className="text-sm text-muted-foreground">
        Your first-try result is based on {first.length || 0} answered items. It becomes more useful as you answer more questions, but it still cannot show that Mammo
        caused an exam result.
      </p>
      {corrections.length ? (
        <section>
          <h2 className="font-heading text-xl">Questions updated since you answered</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {corrections.map((c) => (
              <li key={c.event.id}>{c.note}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
