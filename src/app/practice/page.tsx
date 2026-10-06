"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/components/app-provider";
import { EXAM } from "@/config/exam";
import { allSessions, putSession } from "@/lib/db";
import { abandonSession } from "@/lib/engine/session";
import {
  DEFAULT_FORM_POOL,
  dailyPracticePool,
  formDisplayName,
  formPool,
  FORM_POOLS,
  offerAssessment,
  topicQuestions,
  type AssessmentOffer,
  type AssessmentRequest,
  type FormPool,
} from "@/lib/engine/assessment";
import { proportionalMinutes } from "@/lib/engine/forms";
import { startAssessment, type TimingChoice } from "@/lib/engine/start";
import { assessmentReport } from "@/lib/engine/test-mode";
import type { StudySession } from "@/lib/schemas/learner";

const TOPIC_SIZES = [5, 10, 20] as const;
const MIXED_SIZES = [10, 20, 40] as const;
const MULTIPLIERS = [1.25, 1.5, 2] as const;

function Toggle<T extends string | number>({
  value,
  options,
  onChange,
  label,
  render,
}: {
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
  label: string;
  render: (v: T) => string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Button key={String(o)} variant={value === o ? "default" : "outline"} className="min-h-11" aria-pressed={value === o} onClick={() => onChange(o)}>
          {render(o)}
        </Button>
      ))}
    </div>
  );
}

function timeText(offer: Extract<AssessmentOffer, { ok: true }>, timing: TimingChoice, mode: "study" | "test") {
  const reserved = offer.pool !== "practice";
  if (!reserved && mode === "study") return "There is no timer, and you will see an explanation after each answer.";
  if (timing.timing === "untimed") return "There is no timer. You will see your results and explanations after you submit.";
  const base = proportionalMinutes(offer.size);
  const mins = timing.timing === "extended" ? Math.ceil(base * timing.multiplier) : base;
  return `You will have ${mins} minutes${timing.timing === "extended" ? ` (${timing.multiplier}× extended time)` : ""}. Results and explanations appear after you submit.`;
}

function assessmentUse(kind: AssessmentOffer["kind"]) {
  if (kind === "baseline") return "A shorter starting point when you want to see which content areas deserve attention.";
  if (kind === "checkpoint") return "A mid-length check you can use after more study to choose your next areas for review.";
  if (kind === "simulation") return "A full-length practice experience for working on pacing, focus, and the complete exam format.";
  return "A reserved set of questions for a broader check of your current practice.";
}

export default function PracticePage() {
  const { content, ready, error } = useApp();
  const router = useRouter();
  const [mode, setMode] = useState<"study" | "test">("study");
  const [timingKind, setTimingKind] = useState<TimingChoice["timing"]>("standard");
  const [multiplier, setMultiplier] = useState<number>(1.5);
  const [allowSkip, setAllowSkip] = useState(false);
  const [topicId, setTopicId] = useState<string | null>(null);
  const [topicSize, setTopicSize] = useState<number>(10);
  const [mixedSize, setMixedSize] = useState<number>(20);
  const [form, setForm] = useState<FormPool>(DEFAULT_FORM_POOL);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    void allSessions().then(setSessions);
  }, [ready]);

  const catalog = useMemo(() => (content ? { curriculum: content.curriculum, modules: content.modules } : null), [content]);
  const topics = useMemo(() => {
    if (!catalog) return [];
    return [...catalog.curriculum.topics]
      .sort((a, b) => a.order - b.order)
      .map((t) => ({ value: t.id, label: `${t.title} (${new Set(topicQuestions(catalog, t.id).map((q) => q.familyId)).size})`, count: topicQuestions(catalog, t.id).length }))
      .filter((t) => t.count > 0);
  }, [catalog]);
  const standardOffers = useMemo(
    () => (catalog ? (["baseline", "checkpoint", "simulation"] as const).map((k) => offerAssessment({ kind: k, form }, catalog)) : []),
    [catalog, form],
  );
  const formCounts = useMemo(() => {
    if (!content) return { "form-a": 0, "form-b": 0 };
    return {
      "form-a": formPool(content.modules, "form-a").length,
      "form-b": formPool(content.modules, "form-b").length,
    };
  }, [content]);
  const formName = formDisplayName(form);

  if (!ready) return <p>Loading…</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!content || !catalog) return null;

  const activeTopic = topicId ?? topics[0]?.value ?? null;
  const topicOffer = activeTopic ? offerAssessment({ kind: "topic_quiz", topicId: activeTopic, size: topicSize }, catalog) : null;
  const mixedOffer = offerAssessment({ kind: "mixed_quiz", size: mixedSize }, catalog);
  const timing: TimingChoice = { timing: timingKind, multiplier, allowSkip };
  const inProgress = sessions.filter((s) => s.status === "in_progress" && s.assessment);
  const history = sessions
    .filter((s) => s.status === "completed" && s.assessment)
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));

  async function startOver() {
    if (busy) return;
    setBusy(true);
    setNote(null);
    try {
      const open = sessions.filter((s) => s.status === "in_progress" && s.assessment);
      const abandoned = open.map((s) => abandonSession(s));
      for (const s of abandoned) await putSession(s);
      const ids = new Set(abandoned.map((s) => s.id));
      setSessions((prev) => prev.map((s) => (ids.has(s.id) ? abandoned.find((a) => a.id === s.id)! : s)));
    } catch (e) {
      setNote(e instanceof Error ? e.message : "Those sessions could not be cleared.");
    } finally {
      setBusy(false);
    }
  }

  async function start(req: AssessmentRequest, forceMode?: "test") {
    if (!content || busy) return;
    setBusy(true);
    setNote(null);
    try {
      const s = await startAssessment(content, req, { mode: forceMode ?? mode, timing });
      router.push(`/session/?id=${s.id}`);
    } catch (e) {
      setNote(e instanceof Error ? e.message : "That option could not be started.");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-heading text-3xl text-navy">Practice</h1>
        <p className="text-muted-foreground">
          Choose a quick quiz for focused practice, or use a reserved form when you want to work under test-like conditions. Study mode explains each answer as you go;
          test mode waits until you submit.
        </p>
        <p className="text-sm text-muted-foreground">
          The current beta includes {dailyPracticePool(content.modules).length} practice questions, plus {formCounts["form-a"]} questions in Form A and{" "}
          {formCounts["form-b"]} in Form B. Questions in the reserved forms do not appear in Today or regular quizzes before you take them.
        </p>
      </header>

      {inProgress.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Resume</CardTitle>
            <CardDescription>
              Continue an unfinished quiz or assessment. Your answers are saved as you go. If the attempt is timed, the clock keeps running while you are away. Start over
              clears unfinished attempts from this screen.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {inProgress.map((s) => (
              <Button key={s.id} className="min-h-11" onClick={() => router.push(`/session/?id=${s.id}`)}>
                Resume {s.assessment!.label.toLowerCase()}
              </Button>
            ))}
            <Button variant="ghost" className="min-h-11" disabled={busy} onClick={() => void startOver()}>
              Start over
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <section className="space-y-4" aria-labelledby="settings-h">
        <h2 id="settings-h" className="font-heading text-xl">
          Choose how you want to practice
        </h2>
        <div className="space-y-2">
          <p className="text-sm font-medium">When would you like to see explanations?</p>
          <Toggle
            label="Feedback mode"
            value={mode}
            options={["study", "test"] as const}
            onChange={setMode}
            render={(v) => (v === "study" ? "After each answer" : "After I submit")}
          />
          <p className="text-sm text-muted-foreground">
            This choice applies to topic and mixed quizzes. Baselines, checkpoints, and simulations show explanations after you submit.
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">How much time would you like for test mode?</p>
          <Toggle
            label="Timing"
            value={timingKind}
            options={["standard", "extended", "untimed"] as const}
            onChange={setTimingKind}
            render={(v) => (v === "standard" ? "Standard time" : v === "extended" ? "Extended time" : "Untimed practice")}
          />
          {timingKind === "extended" ? (
            <Toggle label="Time multiplier" value={multiplier} options={MULTIPLIERS} onChange={setMultiplier} render={(v) => `${v}× time`} />
          ) : null}
          <div className="flex min-h-11 items-center gap-3">
            <Switch id="allow-skip" checked={allowSkip} onCheckedChange={(v) => setAllowSkip(Boolean(v))} />
            <Label htmlFor="allow-skip">Let me move on without answering in the full simulation</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Standard timing follows the exam pace: {EXAM.testMinutes} minutes for {EXAM.totalQuestions} questions, adjusted for shorter forms. Extended time, untimed
            practice, and simulations that allow skipped answers are labeled as non-standard in your results.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2" aria-label="Quizzes from the daily practice pool">
        <Card>
          <CardHeader>
            <CardTitle>Topic quiz</CardTitle>
            <CardDescription>Choose one content area to review. Each quiz uses different question concepts instead of repeating close variations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topics.length ? (
              <>
                <Select items={topics} value={activeTopic} onValueChange={(v) => setTopicId(v as string)}>
                  <SelectTrigger className="h-11 w-full" aria-label="Topic">
                    <SelectValue placeholder="Choose a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Toggle label="Topic quiz length" value={topicSize} options={TOPIC_SIZES} onChange={setTopicSize} render={(v) => `${v} questions`} />
                {topicOffer ? (
                  <p className="text-sm text-muted-foreground">{topicOffer.ok ? `${topicOffer.why} ${timeText(topicOffer, timing, mode)}` : topicOffer.reason}</p>
                ) : null}
                <Button className="min-h-11" disabled={busy || !topicOffer?.ok} onClick={() => activeTopic && void start({ kind: "topic_quiz", topicId: activeTopic, size: topicSize })}>
                  Start {topicOffer?.ok ? `${topicOffer.size}-question topic quiz` : "topic quiz"}
                </Button>
              </>
            ) : (
              <p className="text-sm">No topic has practice questions yet.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mixed quiz</CardTitle>
            <CardDescription>Practice across the exam content areas in roughly the same proportions as the exam.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Toggle label="Mixed quiz length" value={mixedSize} options={MIXED_SIZES} onChange={setMixedSize} render={(v) => `${v} questions`} />
            <p className="text-sm text-muted-foreground">{mixedOffer.ok ? `${mixedOffer.why} ${timeText(mixedOffer, timing, mode)}` : mixedOffer.reason}</p>
            <Button className="min-h-11" disabled={busy || !mixedOffer.ok} onClick={() => void start({ kind: "mixed_quiz", size: mixedSize })}>
              Start {mixedOffer.ok ? mixedOffer.label.toLowerCase() : "mixed quiz"}
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4" aria-labelledby="forms-h">
        <h2 id="forms-h" className="font-heading text-xl">
          Reserved practice forms
        </h2>
        <p className="text-sm text-muted-foreground">
          Use these when you want a more exam-like check. Their questions are kept out of regular study beforehand. Results can help you choose what to review next, but
          they do not predict whether you are ready to pass.
        </p>
        <div className="space-y-2">
          <p className="text-sm font-medium">Choose a question set</p>
          <Toggle
            label="Reserved form"
            value={form}
            options={FORM_POOLS}
            onChange={setForm}
            render={(v) => `${formDisplayName(v)} (${formCounts[v]} questions)`}
          />
          <p className="text-sm text-muted-foreground">
            Form A and Form B use separate questions. If you take the same form again, Mammo labels it as a retake because remembering the questions can raise your score.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {standardOffers.map((offer) => (
            <Card key={`${form}:${offer.kind}`}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>{offer.label}</CardTitle>
                  {offer.ok ? <Badge>Available</Badge> : <Badge variant="outline">Not enough questions yet</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>{assessmentUse(offer.kind)}</p>
                {offer.ok ? (
                  <>
                    <p>{offer.why}</p>
                    <p className="text-muted-foreground">{timeText(offer, timing, "test")}</p>
                    {offer.kind === "simulation" ? (
                      <p className="text-muted-foreground">
                        {allowSkip ? "Skipping allowed (non-standard)." : "You must answer each question before moving on; flag any to revisit."}
                      </p>
                    ) : null}
                    <Button className="min-h-11" disabled={busy} onClick={() => void start({ kind: offer.kind, form }, "test")}>
                      Start {formName} {offer.kind === "simulation" ? "simulation" : offer.kind}
                    </Button>
                  </>
                ) : (
                  <>
                    <p>{offer.reason}</p>
                    {offer.fallback ? (
                      <Button
                        variant="outline"
                        className="h-auto min-h-11 whitespace-normal"
                        disabled={busy}
                        onClick={() =>
                          void start(
                            {
                              kind: offer.fallback!.kind,
                              size: offer.fallback!.size,
                              ...(offer.fallback!.form ? { form: offer.fallback!.form } : {}),
                            },
                            offer.fallback!.kind === "mixed_quiz" ? undefined : "test",
                          )
                        }
                      >
                        Take the {offer.fallback.label.toLowerCase()} instead
                      </Button>
                    ) : null}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {note ? (
        <p className="rounded-lg border p-3 text-sm" role="status">
          {note}
        </p>
      ) : null}

      <section className="space-y-2" aria-labelledby="history-h">
        <h2 id="history-h" className="font-heading text-xl">
          Your completed practice
        </h2>
        {history.length ? (
          <ul className="divide-y rounded-lg border">
            {history.slice(0, 20).map((s) => {
              const r = s.mode === "test" ? assessmentReport(s, content.curriculum) : null;
              const studyScore = s.items.filter((i) => i.type === "question");
              const correct = r ? r.headline.correct : studyScore.filter((i) => i.correct).length;
              const total = r ? r.headline.total : studyScore.length;
              return (
                <li key={s.id}>
                  <button
                    className="flex min-h-11 w-full flex-wrap items-center gap-2 p-3 text-left text-sm hover:bg-muted"
                    onClick={() => router.push(`/session/?id=${s.id}`)}
                  >
                    <span className="font-medium">{s.assessment!.label}</span>
                    {s.assessment!.retake ? <Badge variant="secondary">Retake {s.assessment!.attempt}</Badge> : null}
                    {s.mode === "test" && !s.assessment!.standard ? <Badge variant="outline">Non-standard</Badge> : null}
                    <span>
                      {correct}/{total}
                      {total ? ` (${Math.round((1000 * correct) / total) / 10}%)` : ""}
                      {total < 20 ? " · Limited evidence" : ""}
                    </span>
                    <span className="text-muted-foreground">
                      {Math.round(s.elapsedMs / 60000)} min · {new Date(s.completedAt ?? s.startedAt).toLocaleDateString()}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No completed quizzes or assessments yet.</p>
        )}
      </section>

      <p className="text-sm text-muted-foreground">
        These questions have not yet been independently clinically reviewed, so treat every score as a practice result. Mammo does not convert results to an ARRT scaled
        score or a chance of passing. This is self-study on your device, not a proctored exam.
      </p>
    </div>
  );
}
