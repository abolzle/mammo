"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/components/app-provider";
import { ReviewBadge } from "@/components/review-badge";
import { SourceDrawer } from "@/components/source-drawer";
import { SafeMarkdown } from "@/lib/markdown";
import {
  getExposure,
  getObjective,
  getSchedule,
  getSession,
  putEvent,
  putExposure,
  putIssue,
  putObjective,
  putSchedule,
  putSession,
} from "@/lib/db";
import {
  applyAnswer,
  bumpObjective,
  completeSession,
  currentItem,
  liveElapsedMs,
  questionCorrect,
  remainingMs,
  revealItem,
  scheduleAfterCard,
  scoreSession,
  submitTest,
} from "@/lib/engine/session";
import type { StudySession } from "@/lib/schemas/learner";
import type { Lesson, Question, RecallCard, VisualExercise } from "@/lib/schemas/content";
import { newId } from "@/lib/engine/ids";
import { TestPlayer } from "@/components/test-player";

function lookup<T extends { id: string }>(list: T[], id: string) {
  return list.find((x) => x.id === id);
}

export function SessionPlayer({ sessionId }: { sessionId: string }) {
  const { content } = useApp();
  const router = useRouter();
  const [session, setSession] = useState<StudySession | null>(null);
  const [choice, setChoice] = useState("");
  const [variant, setVariant] = useState<"none" | "simpler" | "example" | "wrong">("none");
  const [tick, setTick] = useState(0);
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueNote, setIssueNote] = useState("");
  const [mounted, setMounted] = useState(false);
  const [pending, setPending] = useState(true);

  const persist = useCallback(async (s: StudySession) => {
    await putSession(s);
    setSession(s);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setPending(true);
    void getSession(sessionId)
      .then((s) => {
        if (cancelled) return;
        setSession(s ?? null);
        setPending(false);
      })
      .catch(() => {
        if (cancelled) return;
        setSession(null);
        setPending(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTick((t) => t + 1);
      setSession((s) => {
        if (!s || s.kind === "assessment" || s.status !== "in_progress" || !s.timed || s.submitted) return s;
        if (remainingMs(s) !== 0) return s;
        const next = submitTest(s);
        void putSession(next);
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const modules = content?.modules ?? [];
  const item = session ? currentItem(session) : undefined;
  const question = item?.type === "question" ? lookup(modules.flatMap((m) => m.questions), item.contentId) : undefined;
  const lesson = item?.type === "lesson" ? lookup(modules.flatMap((m) => m.lessons), item.contentId) : undefined;
  const card = item?.type === "card" ? lookup(modules.flatMap((m) => m.cards), item.contentId) : undefined;
  const visual = item?.type === "visual" ? lookup(modules.flatMap((m) => m.visuals), item.contentId) : undefined;
  const asset = visual ? lookup(modules.flatMap((m) => m.assets), visual.assetId) : undefined;

  const elapsedLabel = useMemo(() => {
    if (!session) return "";
    const s = Math.floor(liveElapsedMs(session) / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    // tick retriggers the wall-clock read in liveElapsedMs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, tick]);

  // Wait until mount so the server HTML and the first client render match.
  // Date.now() in the timer, and library data loaded in an effect, both differ otherwise.
  if (!mounted || !content || pending) return <p>Loading the library…</p>;
  if (!session) return <p>That session was not found on this device.</p>;
  if (session.kind === "assessment") return <TestPlayer initial={session} />;

  const done = session.status === "completed";
  const score = scoreSession(session);
  const hideKey = session.mode === "test" && !session.submitted;

  async function recordAnswer(answer: string, correct: boolean | null, extra?: { selfRating?: 1 | 2 | 3 | 4 }) {
    if (!session || !item) return;
    const exposure = await getExposure(item.contentId);
    const { session: next, event } = applyAnswer({
      session,
      itemId: item.id,
      answer,
      correct,
      selfRating: extra?.selfRating,
      firstExposure: !exposure,
    });
    const stored = await putEvent(event);
    if (stored.inserted) {
      await putExposure({
        contentId: item.contentId,
        familyId: item.familyId,
        firstAt: exposure?.firstAt ?? event.createdAt,
        lastAt: event.createdAt,
        count: (exposure?.count ?? 0) + 1,
      });
      for (const oid of item.objectiveIds) {
        await putObjective(bumpObjective(await getObjective(oid), oid, correct));
      }
    }
    if (item.type === "card" && extra?.selfRating) {
      await putSchedule(scheduleAfterCard(await getSchedule(item.contentId), item.contentId, extra.selfRating));
    }
    await persist(next);
    setChoice("");
    setVariant("none");
  }

  async function goNext() {
    if (!session) return;
    const idx = Math.min(session.currentIndex + 1, session.items.length - 1);
    if (session.items[session.currentIndex]?.type === "recap") {
      await persist(completeSession(session));
      return;
    }
    await persist({ ...session, currentIndex: idx });
  }

  async function finish() {
    if (!session) return;
    await persist(session.mode === "test" ? submitTest(session) : completeSession(session));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <p>
          {session.assessment?.label ?? (session.kind === "quiz" ? "Beta quiz" : "Study session")} · {session.currentIndex + 1} of {session.items.length}
        </p>
        <p aria-live="polite">
          {elapsedLabel}
          {session.timed && remainingMs(session) != null ? ` · ${Math.ceil((remainingMs(session) ?? 0) / 60000)} min left` : null}
        </p>
      </div>
      <Progress value={(100 * (session.currentIndex + (item?.status === "answered" ? 1 : 0))) / session.items.length} />
      {session.beta ? <p className="text-sm text-muted-foreground">Provisional practice. Not a scaled score or pass prediction.</p> : null}

      {done ? (
        <RecapView session={session} score={score} onHome={() => router.push("/")} />
      ) : item?.type === "lesson" && lesson ? (
        <LessonBlock lesson={lesson} onContinue={() => recordAnswer("complete", null)} />
      ) : item?.type === "card" && card ? (
        <CardBlock
          card={card}
          revealed={Boolean(item.revealed)}
          onReveal={() => persist(revealItem(session, item.id))}
          onRate={(r) => recordAnswer("self", null, { selfRating: r })}
        />
      ) : item?.type === "question" && question ? (
        <QuestionBlock
          question={question}
          hideKey={hideKey}
          revealed={Boolean(item.revealed)}
          selected={item.selected ?? choice}
          onSelect={setChoice}
          onSubmit={() => {
            if (!choice && !item.selected) return;
            const ans = choice || item.selected || "";
            void recordAnswer(ans, questionCorrect(question, ans));
          }}
          onContinue={goNext}
          variant={variant}
          setVariant={setVariant}
        />
      ) : item?.type === "visual" && visual && asset ? (
        <VisualBlock
          visual={visual}
          asset={asset}
          hideKey={hideKey}
          revealed={Boolean(item.revealed)}
          selected={item.selected ?? choice}
          onSelect={setChoice}
          onSubmit={() => {
            const ans = choice || item.selected || "";
            if (!ans) return;
            void recordAnswer(ans, ans === visual.correctHotspotId);
          }}
          onContinue={goNext}
        />
      ) : item?.type === "recap" ? (
        <div className="space-y-3">
          <h1 className="font-heading text-2xl">Recap</h1>
          <p>{session.why}</p>
          <Button className="min-h-11" onClick={finish}>
            Finish
          </Button>
        </div>
      ) : (
        <p>This item is no longer in the library. Your attempt is preserved.</p>
      )}

      {item && content ? (
        <SourceDrawer
          evidenceIds={question?.evidenceIds ?? lesson?.evidenceIds ?? card?.evidenceIds ?? visual?.evidenceIds ?? []}
          content={content}
        />
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" className="min-h-11" onClick={() => router.push("/")}>
          Save and exit
        </Button>
        <Button variant="ghost" className="min-h-11" onClick={() => setIssueOpen((v) => !v)}>
          Report a problem
        </Button>
      </div>
      {issueOpen && item ? (
        <form
          className="space-y-2"
          onSubmit={async (e) => {
            e.preventDefault();
            await putIssue({
              id: newId("iss"),
              itemId: item.contentId,
              itemRevision: item.revision,
              category: "other",
              note: issueNote.slice(0, 2000),
              createdAt: new Date().toISOString(),
            });
            setIssueNote("");
            setIssueOpen(false);
          }}
        >
          <Label htmlFor="issue">What looks wrong? Do not include patient information.</Label>
          <textarea
            id="issue"
            className="min-h-24 w-full rounded-md border p-2"
            value={issueNote}
            onChange={(e) => setIssueNote(e.target.value)}
            required
          />
          <Button type="submit" className="min-h-11">
            Save locally
          </Button>
        </form>
      ) : null}
    </div>
  );
}

function LessonBlock({ lesson, onContinue }: { lesson: Lesson; onContinue: () => void }) {
  const [which, setWhich] = useState<"main" | "simpler" | "example" | "deeper">("main");
  return (
    <article className="space-y-4">
      <ReviewBadge status={lesson.review.status} requiresQualifiedReview={lesson.review.requiresQualifiedReview} />
      <h1 className="font-heading text-2xl text-navy">{lesson.title}</h1>
      <p className="text-muted-foreground">{lesson.summary}</p>
      {which === "main"
        ? lesson.explanation.map((s) => (
            <section key={s.heading}>
              <h2 className="font-heading text-lg">{s.heading}</h2>
              <SafeMarkdown text={s.body} />
            </section>
          ))
        : null}
      {which === "simpler" ? <SafeMarkdown text={lesson.variants.simpler} /> : null}
      {which === "example" ? <SafeMarkdown text={lesson.example} /> : null}
      {which === "deeper" && lesson.variants.deeper ? <SafeMarkdown text={lesson.variants.deeper} /> : null}
      <div className="rounded-lg bg-muted p-3">
        <p className="text-sm font-medium">Common mix-up</p>
        <p>{lesson.misconception.belief}</p>
        <p className="mt-1">{lesson.misconception.correction}</p>
      </div>
      {lesson.observationPrompt ? (
        <p className="text-sm text-muted-foreground">
          Workplace observation (optional): {lesson.observationPrompt} This is not competency verification.
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" className="min-h-11" onClick={() => setWhich("simpler")}>
          Explain more simply
        </Button>
        <Button variant="outline" className="min-h-11" onClick={() => setWhich("example")}>
          Show an example
        </Button>
        {lesson.variants.deeper ? (
          <Button variant="outline" className="min-h-11" onClick={() => setWhich("deeper")}>
            Go deeper
          </Button>
        ) : null}
      </div>
      <Button className="min-h-11" onClick={onContinue}>
        Continue
      </Button>
    </article>
  );
}

function CardBlock({
  card,
  revealed,
  onReveal,
  onRate,
}: {
  card: RecallCard;
  revealed: boolean;
  onReveal: () => void;
  onRate: (r: 1 | 2 | 3 | 4) => void;
}) {
  return (
    <div className="space-y-4">
      <ReviewBadge status={card.review.status} requiresQualifiedReview={card.review.requiresQualifiedReview} />
      <h1 className="font-heading text-2xl">Recall</h1>
      <p className="text-lg">{card.prompt}</p>
      {!revealed ? (
        <Button className="min-h-11" onClick={onReveal}>
          Show answer
        </Button>
      ) : (
        <div className="space-y-3">
          <p className="rounded-lg bg-muted p-3">{card.answer}</p>
          <p className="text-sm">How well did you know it? This rating schedules review; it is not a test score.</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {([
              [1, "Again"],
              [2, "Hard"],
              [3, "Good"],
              [4, "Easy"],
            ] as const).map(([n, label]) => (
              <Button key={n} variant="outline" className="min-h-11" onClick={() => onRate(n)}>
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionBlock({
  question,
  hideKey,
  revealed,
  selected,
  onSelect,
  onSubmit,
  onContinue,
  variant,
  setVariant,
}: {
  question: Question;
  hideKey: boolean;
  revealed: boolean;
  selected: string;
  onSelect: (v: string) => void;
  onSubmit: () => void;
  onContinue: () => void;
  variant: "none" | "simpler" | "example" | "wrong";
  setVariant: (v: "none" | "simpler" | "example" | "wrong") => void;
}) {
  const show = revealed && !hideKey;
  return (
    <div className="space-y-4">
      <ReviewBadge status={question.review.status} requiresQualifiedReview={question.review.requiresQualifiedReview} />
      <h1 className="font-heading text-xl leading-snug">{question.stem}</h1>
      <RadioGroup value={selected} onValueChange={onSelect} disabled={show} className="gap-2">
        {question.choices.map((c) => {
          const isCorrect = c.id === question.correctChoiceId;
          const isPicked = selected === c.id;
          return (
            <Label
              key={c.id}
              className={`flex min-h-14 items-start gap-3 rounded-lg border p-3 ${show && isCorrect ? "border-navy bg-muted" : ""} ${show && isPicked && !isCorrect ? "border-dashed" : ""}`}
            >
              <RadioGroupItem value={c.id} className="size-5 shrink-0" />
              <span className="min-w-0 leading-5">
                <span className="font-medium">{c.id.toUpperCase()}.</span> {c.text}
                {show ? (
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {isCorrect ? "Best answer. " : "Not the best answer. "}
                    {c.rationale}
                  </span>
                ) : null}
              </span>
            </Label>
          );
        })}
      </RadioGroup>
      {!show ? (
        <Button className="min-h-11" disabled={!selected} onClick={onSubmit}>
          {hideKey ? "Save answer" : "Check"}
        </Button>
      ) : (
        <div className="space-y-3">
          <SafeMarkdown text={question.explanation} />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="min-h-11" onClick={() => setVariant("simpler")}>
              Explain more simply
            </Button>
            <Button variant="outline" className="min-h-11" onClick={() => setVariant("example")}>
              Show an example
            </Button>
            <Button variant="outline" className="min-h-11" onClick={() => setVariant("wrong")}>
              Why is my answer wrong?
            </Button>
          </div>
          {variant === "simpler" ? <p>{question.variants.simpler}</p> : null}
          {variant === "example" ? <p>{question.variants.example}</p> : null}
          {variant === "wrong" ? (
            <p>{selected ? question.choices.find((c) => c.id === selected)?.rationale : "Choose an option to see its rationale."}</p>
          ) : null}
          <Button className="min-h-11" onClick={onContinue}>
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}

function VisualBlock({
  visual,
  asset,
  hideKey,
  revealed,
  selected,
  onSelect,
  onSubmit,
  onContinue,
}: {
  visual: VisualExercise;
  asset: { src: string; alt: string; width: number; height: number; isSchematic: boolean };
  hideKey: boolean;
  revealed: boolean;
  selected: string;
  onSelect: (v: string) => void;
  onSubmit: () => void;
  onContinue: () => void;
}) {
  const show = revealed && !hideKey;
  return (
    <div className="space-y-4">
      <ReviewBadge status={visual.review.status} requiresQualifiedReview={visual.review.requiresQualifiedReview} />
      <h1 className="font-heading text-xl">{visual.title}</h1>
      <p>{visual.prompt}</p>
      <p className="text-sm text-muted-foreground">
        {asset.isSchematic ? "Schematic illustration, not a mammogram. " : ""}
        {visual.accessibilityNote}
      </p>
      <div className="overflow-hidden rounded-lg border bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset.src} alt={asset.alt} width={asset.width} height={asset.height} className="h-auto w-full" />
      </div>
      <RadioGroup value={selected} onValueChange={onSelect} disabled={show}>
        {visual.hotspots.map((h) => (
          <Label key={h.id} className="flex min-h-12 items-start gap-3 rounded-lg border p-3">
            <RadioGroupItem value={h.id} className="size-5 shrink-0" />
            <span className="min-w-0 leading-5">
              {h.neutralLabel}
              {show ? (
                <span className="block text-sm text-muted-foreground">
                  {h.revealLabel}. {visual.feedback[h.id]}
                </span>
              ) : null}
            </span>
          </Label>
        ))}
      </RadioGroup>
      {!show ? (
        <Button className="min-h-11" disabled={!selected} onClick={onSubmit}>
          {hideKey ? "Save answer" : "Check"}
        </Button>
      ) : (
        <div className="space-y-3">
          <p>{visual.explanation}</p>
          <Button className="min-h-11" onClick={onContinue}>
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}

function RecapView({
  session,
  score,
  onHome,
}: {
  session: StudySession;
  score: { correct: number; total: number; pct: number | null; limited: boolean };
  onHome: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Session complete</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p>
          {score.total
            ? `${score.correct} of ${score.total} application items correct${score.pct != null ? ` (${score.pct}%).` : "."}`
            : "Recall and lesson work recorded. No scored items in this session."}
        </p>
        {score.limited && score.total > 0 ? <p className="text-sm text-muted-foreground">Limited evidence — small sample.</p> : null}
        <p className="text-sm">{session.why}</p>
        <p className="text-sm text-muted-foreground">This is not an ARRT scaled score and is not a pass probability.</p>
        <p className="text-sm text-muted-foreground">Progress is only on this device. Download a JSON backup from Settings after a real study streak.</p>
        <Button className="min-h-11" onClick={onHome}>
          Back to Today
        </Button>
      </CardContent>
    </Card>
  );
}
