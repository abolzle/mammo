"use client";

import { Fragment } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SafeMarkdown } from "@/lib/markdown";
import { assessmentReport, type Tally } from "@/lib/engine/test-mode";
import type { LoadedContent } from "@/lib/content/load";
import type { StudySession } from "@/lib/schemas/learner";

function minutes(ms: number) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m} min ${String(s).padStart(2, "0")} s`;
}

function TallyText({ t, empty = "—" }: { t: Tally; empty?: string }) {
  if (!t.total) return <span className="text-muted-foreground">{empty}</span>;
  return (
    <span>
      {t.correct}/{t.total} ({t.pct}%)
      {t.limited ? <span className="ml-1 text-xs text-muted-foreground">Limited evidence</span> : null}
    </span>
  );
}

export function AssessmentReportView({ session, content, onHome }: { session: StudySession; content: LoadedContent; onHome: () => void }) {
  const report = assessmentReport(session, content.curriculum);
  const meta = session.assessment;
  const questions = new Map(content.modules.flatMap((m) => m.questions).map((q) => [q.id, q]));
  const isSim = meta?.kind === "simulation";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-heading text-2xl text-navy">{meta?.label ?? "Test results"}</h1>
        {report.retake ? <Badge variant="secondary">Retake {report.attempt}</Badge> : <Badge variant="outline">First attempt</Badge>}
        {!report.standard ? <Badge variant="outline">Non-standard conditions</Badge> : null}
      </div>
      {report.retake ? (
        <p className="text-sm">
          You have seen this form before. Retaking it can be useful for review, but remembering the questions may raise your score, so compare it carefully with a first
          attempt.
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{isSim ? `Scored items (${report.headline.total})` : "Result"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="font-heading text-3xl">
            {report.headline.correct} of {report.headline.total} correct
            {report.headline.pct != null ? ` · ${report.headline.pct}%` : ""}
          </p>
          {report.headline.limited ? <p className="text-sm text-muted-foreground">This result comes from fewer than 20 scored questions, so it is a small sample.</p> : null}
          {report.headline.unanswered ? <p className="text-sm">{report.headline.unanswered} unanswered questions counted as incorrect.</p> : null}
          <p className="text-sm text-muted-foreground">
            This is the percent you answered correctly on an independently written practice form. It is not an ARRT scaled score or a prediction of passing, and Form A
            and Form B may not be equally difficult.
          </p>
        </CardContent>
      </Card>

      {report.pilots ? (
        <section className="space-y-1">
          <h2 className="font-heading text-xl">Practice pilot questions</h2>
          <p className="text-sm">
            To mirror the exam format, {report.pilots.total} questions were treated as unscored pilots and did not count toward the result above. You answered{" "}
            {report.pilots.correct} of {report.pilots.total} correctly. They are marked &ldquo;Pilot&rdquo; in the question review below.
          </p>
        </section>
      ) : null}

      <section className="space-y-2">
        <h2 className="font-heading text-xl">By content area</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="py-1 font-normal">Area</th>
              <th className="py-1 font-normal">Correct</th>
            </tr>
          </thead>
          <tbody>
            {report.domains.map((d) => (
              <Fragment key={d.id}>
                <tr className="border-t">
                  <td className="py-1.5 font-medium">{d.name}</td>
                  <td className="py-1.5">
                    <TallyText t={d.tally} empty="Not in this quiz" />
                  </td>
                </tr>
                {d.subdomains.length > 1
                  ? d.subdomains.map((s) => (
                      <tr key={s.id}>
                        <td className="py-1 pl-4 text-muted-foreground">{s.name}</td>
                        <td className="py-1">
                          <TallyText t={s.tally} />
                        </td>
                      </tr>
                    ))
                  : null}
              </Fragment>
            ))}
          </tbody>
        </table>
      </section>

      {report.topicGaps.length ? (
        <section className="space-y-2">
          <h2 className="font-heading text-xl">Topics to revisit</h2>
          <ul className="space-y-1 text-sm">
            {report.topicGaps.slice(0, 8).map((t) => (
              <li key={t.topicId}>
                {t.title}: <TallyText t={t.tally} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <h2 className="font-heading text-xl">Time</h2>
          <p className="text-sm">
            {minutes(report.timing.elapsedMs)}
            {report.timing.limitMs ? ` of ${minutes(report.timing.limitMs)}` : " (untimed)"}
            {report.timing.perItemSeconds != null ? ` · about ${report.timing.perItemSeconds} s per answered question` : ""}
          </p>
          {report.timing.expired ? <p className="text-sm">Time ran out and the test submitted automatically.</p> : null}
          {report.timing.mode === "extended" ? <p className="text-sm text-muted-foreground">Practice accommodation: {meta?.timeMultiplier}× time.</p> : null}
        </div>
        <div className="space-y-1">
          <h2 className="font-heading text-xl">New questions and repeat practice</h2>
          <p className="text-sm">
            Question concepts you had not practiced before: <TallyText t={report.exposure.first} />
          </p>
          <p className="text-sm">
            Concepts you had practiced before, including reworded versions: <TallyText t={report.exposure.repeat} />
          </p>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-xl">How confidence matched your answers</h2>
        {report.calibration.length ? (
          <ul className="space-y-1 text-sm">
            {report.calibration.map((c) => (
              <li key={c.value}>
                Marked &ldquo;{c.label}&rdquo;: <TallyText t={c.tally} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">You did not rate confidence on any question.</p>
        )}
        {report.noConfidence && report.calibration.length ? (
          <p className="text-sm text-muted-foreground">{report.noConfidence} answered questions had no confidence rating.</p>
        ) : null}
        <p className="text-sm text-muted-foreground">
          This can help you spot areas that feel familiar but still need review. Ideally, answers marked &ldquo;Confident&rdquo; are correct more often than answers marked
          &ldquo;Guessing.&rdquo;
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-xl">Question review</h2>
        <ol className="space-y-2">
          {session.items
            .filter((i) => i.type === "question")
            .map((it, n) => {
              const q = questions.get(it.contentId);
              const yours = q?.choices.find((c) => c.id === it.selected);
              const key = q?.choices.find((c) => c.id === q.correctChoiceId);
              return (
                <li key={it.id} className="rounded-lg border">
                  <details>
                    <summary className="flex min-h-11 cursor-pointer flex-wrap items-center gap-2 p-3">
                      <span className="tabular-nums">{n + 1}.</span>
                      <span>{it.correct ? "Correct" : it.status === "answered" ? "Incorrect" : "Unanswered"}</span>
                      {it.role === "pilot" ? <Badge variant="outline">Pilot · unscored</Badge> : null}
                      {it.flagged ? <Badge variant="secondary">Flagged</Badge> : null}
                      {it.priorExposure ? <Badge variant="outline">Seen before</Badge> : null}
                    </summary>
                    {q ? (
                      <div className="space-y-2 border-t p-3 text-sm">
                        <p className="font-medium">{q.stem}</p>
                        <p>Your answer: {yours ? `${yours.id.toUpperCase()}. ${yours.text}` : "none"}</p>
                        {yours && !it.correct ? <p className="text-muted-foreground">{yours.rationale}</p> : null}
                        <p>Best answer: {key ? `${key.id.toUpperCase()}. ${key.text}` : "—"}</p>
                        <SafeMarkdown text={q.explanation} />
                        {it.revision !== q.revision ? (
                          <p className="text-muted-foreground">This question has been revised since your attempt; your result reflects the version you saw.</p>
                        ) : null}
                      </div>
                    ) : (
                      <p className="border-t p-3 text-sm">This question is no longer in the library. Your attempt is preserved.</p>
                    )}
                  </details>
                </li>
              );
            })}
        </ol>
      </section>

      <p className="text-xs text-muted-foreground">
        Attempt details: form {meta?.formId} · version {meta?.formVersion} · content {session.contentVersion}. Results stay in this browser.
      </p>
      <Button className="min-h-11" onClick={onHome}>
        Back to Practice
      </Button>
    </div>
  );
}
