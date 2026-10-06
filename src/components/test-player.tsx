"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReviewBadge } from "@/components/review-badge";
import { AssessmentReportView } from "@/components/assessment-report";
import { useApp } from "@/components/app-provider";
import { getExposure, getObjective, putEvent, putExposure, putObjective, putSession } from "@/lib/db";
import { bumpObjective, liveElapsedMs, remainingMs } from "@/lib/engine/session";
import {
  CONFIDENCE_LEVELS,
  canAdvance,
  canSubmit,
  expireIfDue,
  feedbackVisible,
  goToIndex,
  reachableIndex,
  setConfidence,
  setTestAnswer,
  submissionEvents,
  submitAssessment,
  toggleFlag,
  unansweredCount,
} from "@/lib/engine/test-mode";
import type { Question } from "@/lib/schemas/content";
import type { StudySession } from "@/lib/schemas/learner";

function clock(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}

async function recordSubmission(session: StudySession) {
  for (const ev of submissionEvents(session)) {
    const stored = await putEvent(ev);
    if (!stored.inserted) continue;
    const item = session.items.find((i) => i.id === ev.itemId);
    const exposure = await getExposure(ev.contentId);
    await putExposure({
      contentId: ev.contentId,
      familyId: item?.familyId ?? null,
      firstAt: exposure?.firstAt ?? ev.createdAt,
      lastAt: ev.createdAt,
      count: (exposure?.count ?? 0) + 1,
    });
    for (const oid of ev.objectiveIds) await putObjective(bumpObjective(await getObjective(oid), oid, ev.correct));
  }
}

export function TestPlayer({ initial }: { initial: StudySession }) {
  const { content } = useApp();
  const router = useRouter();
  const [session, setSession] = useState(initial);
  const [, setTick] = useState(0);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const sessionRef = useRef(session);
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const questions = useMemo(() => new Map((content?.modules ?? []).flatMap((m) => m.questions).map((q) => [q.id, q])), [content]);
  const lookup = useCallback((id: string) => questions.get(id), [questions]);

  const save = useCallback(async (next: StudySession) => {
    setSession(next);
    await putSession(next);
    if (next.submitted) await recordSubmission(next);
  }, []);

  useEffect(() => {
    const check = () => {
      const cur = sessionRef.current;
      const next = expireIfDue(cur, lookup);
      if (next !== cur) void save(next);
      setTick((t) => t + 1);
    };
    check();
    if (sessionRef.current.submitted) void recordSubmission(sessionRef.current);
    const id = window.setInterval(check, 1000);
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [lookup, save]);

  if (!content) return <p>Loading the library…</p>;
  const meta = session.assessment;
  const label = meta?.label ?? "Test-mode quiz";

  if (session.submitted) {
    return <AssessmentReportView session={session} content={content} onHome={() => router.push("/practice/")} />;
  }

  const item = session.items[session.currentIndex];
  const question = item ? lookup(item.contentId) : undefined;
  const remaining = remainingMs(session);
  const answered = session.items.length - unansweredCount(session);
  const flagged = session.items.filter((i) => i.flagged).length;
  const lowTime = remaining != null && remaining <= 5 * 60 * 1000;
  const isLast = session.currentIndex === session.items.length - 1;

  async function next() {
    if (!canAdvance(session)) {
      setBlocked(true);
      return;
    }
    setBlocked(false);
    await save(goToIndex(session, session.currentIndex + 1));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{label}</p>
          {meta?.retake ? <Badge variant="secondary">Retake {meta.attempt}</Badge> : null}
          {meta && !meta.standard ? <Badge variant="outline">Non-standard conditions</Badge> : null}
          <Badge variant="outline">Test mode</Badge>
        </div>
        <p className={`tabular-nums ${lowTime ? "font-semibold text-destructive" : "text-muted-foreground"}`} aria-live="off">
          {remaining != null ? `${clock(remaining)} left` : `${clock(liveElapsedMs(session))} elapsed · untimed`}
        </p>
      </div>
      {lowTime ? (
        <p className="sr-only" aria-live="polite">
          Less than five minutes remain. The test submits automatically when time runs out.
        </p>
      ) : null}
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Question {session.currentIndex + 1} of {session.items.length} · {answered} answered · {flagged} flagged
        </p>
        <Progress value={(100 * answered) / Math.max(1, session.items.length)} aria-label={`${answered} of ${session.items.length} answered`} />
      </div>

      {item && question ? (
        <TestQuestion
          key={item.id}
          question={question}
          selected={item.selected ?? ""}
          confidence={item.confidence ?? null}
          flagged={Boolean(item.flagged)}
          feedback={feedbackVisible(session)}
          onSelect={(c) => {
            setBlocked(false);
            void save(setTestAnswer(session, item.id, c));
          }}
          onConfidence={(v) => void save(setConfidence(session, item.id, v))}
          onFlag={() => void save(toggleFlag(session, item.id))}
        />
      ) : (
        <p>This item is no longer in the library. Your saved answers are preserved.</p>
      )}

      {blocked ? (
        <p role="alert" className="text-sm">
          Choose an answer before moving on. The full simulation follows this rule to keep the pacing exam-like. You can flag the question and return to it before you
          submit.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" className="min-h-11" disabled={session.currentIndex === 0} onClick={() => void save(goToIndex(session, session.currentIndex - 1))}>
          Previous
        </Button>
        {!isLast ? (
          <Button className="min-h-11" onClick={() => void next()}>
            Next
          </Button>
        ) : null}
        <Button variant="outline" className="min-h-11" onClick={() => setReviewOpen((v) => !v)} aria-expanded={reviewOpen}>
          Review answers
        </Button>
        <Button variant={isLast ? "default" : "outline"} className="min-h-11" onClick={() => setConfirmOpen(true)}>
          Submit test
        </Button>
      </div>

      {reviewOpen ? (
        <section aria-label="Review grid" className="space-y-2 rounded-lg border p-3">
          <p className="text-sm text-muted-foreground">
            Select a number to return to any question you have reached. A flag marks questions you wanted to revisit.
            {meta?.requireAnswer ? " Unanswered questions ahead stay locked until you answer the current one." : ""}
          </p>
          <ol className="grid grid-cols-6 gap-1.5 sm:grid-cols-10 md:grid-cols-12">
            {session.items.map((it, i) => {
              const locked = i > reachableIndex(session);
              const state = it.status === "answered" ? "answered" : "unanswered";
              return (
                <li key={it.id}>
                  <Button
                    variant={i === session.currentIndex ? "default" : it.status === "answered" ? "secondary" : "outline"}
                    className="relative h-10 w-full min-w-0 px-0 tabular-nums"
                    disabled={locked}
                    aria-label={`Question ${i + 1}, ${state}${it.flagged ? ", flagged" : ""}${locked ? ", locked" : ""}`}
                    onClick={() => {
                      void save(goToIndex(session, i));
                      setReviewOpen(false);
                    }}
                  >
                    {i + 1}
                    {it.flagged ? <Flag className="absolute top-0.5 right-0.5 size-3" aria-hidden /> : null}
                  </Button>
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit {label.toLowerCase()}?</DialogTitle>
            <DialogDescription>
              {answered} of {session.items.length} answered, {flagged} flagged.
              {canSubmit(session)
                ? unansweredCount(session)
                  ? ` ${unansweredCount(session)} unanswered questions will count as incorrect.`
                  : " Answers and explanations appear after you submit."
                : ` Answer the remaining ${unansweredCount(session)} questions first; the full simulation requires an answer to every question.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="min-h-11" onClick={() => setConfirmOpen(false)}>
              Keep working
            </Button>
            <Button
              className="min-h-11"
              disabled={!canSubmit(session)}
              onClick={() => {
                setConfirmOpen(false);
                void save(submitAssessment(session, lookup, "learner"));
              }}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" className="min-h-11" onClick={() => router.push("/practice/")}>
          Save and exit
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Your answers save in this browser as you go.{" "}
        {session.timed ? "The clock keeps running if you leave, refresh, or switch apps, and the test submits automatically when time runs out. " : ""}
        This is beta practice, not an ARRT scaled score or a prediction of passing.
      </p>
    </div>
  );
}

function TestQuestion({
  question,
  selected,
  confidence,
  flagged,
  feedback,
  onSelect,
  onConfidence,
  onFlag,
}: {
  question: Question;
  selected: string;
  confidence: number | null;
  flagged: boolean;
  feedback: boolean;
  onSelect: (c: string) => void;
  onConfidence: (v: number | null) => void;
  onFlag: () => void;
}) {
  return (
    <div className="space-y-4">
      <ReviewBadge status={question.review.status} requiresQualifiedReview={question.review.requiresQualifiedReview} />
      <h1 className="font-heading text-xl leading-snug">{question.stem}</h1>
      <RadioGroup value={selected} onValueChange={(v) => onSelect(String(v))} className="gap-2" aria-label="Answer choices">
        {question.choices.map((c) => (
          <Label key={c.id} className={`flex min-h-14 items-start gap-3 rounded-lg border p-3 ${selected === c.id ? "border-navy" : ""}`}>
            <RadioGroupItem value={c.id} className="size-5 shrink-0" />
            <span className="min-w-0 leading-5">
              <span className="font-medium">{c.id.toUpperCase()}.</span> {c.text}
              {feedback ? <span className="mt-1 block text-sm text-muted-foreground">{c.rationale}</span> : null}
            </span>
          </Label>
        ))}
      </RadioGroup>
      <fieldset className="space-y-2">
        <legend className="text-sm text-muted-foreground">
          How sure are you? This is optional. After you submit, Mammo will show whether your confidence matched your results.
        </legend>
        <div className="flex flex-wrap gap-2">
          {CONFIDENCE_LEVELS.map((c) => (
            <Button
              key={c.value}
              variant={confidence === c.value ? "default" : "outline"}
              className="min-h-11"
              aria-pressed={confidence === c.value}
              onClick={() => onConfidence(confidence === c.value ? null : c.value)}
            >
              {c.label}
            </Button>
          ))}
          <Button variant={flagged ? "default" : "outline"} className="min-h-11" aria-pressed={flagged} onClick={onFlag}>
            <Flag className="size-4" aria-hidden /> {flagged ? "Flagged for review" : "Flag for review"}
          </Button>
        </div>
      </fieldset>
    </div>
  );
}
