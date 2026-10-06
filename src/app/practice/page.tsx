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
import { dailyPracticePool, formPool, offerAssessment, topicQuestions, type AssessmentOffer, type AssessmentRequest } from "@/lib/engine/assessment";
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
  if (!reserved && mode === "study") return "Untimed, with an explanation after each answer.";
  if (timing.timing === "untimed") return "Untimed practice, feedback after you submit.";
  const base = proportionalMinutes(offer.size);
  const mins = timing.timing === "extended" ? Math.ceil(base * timing.multiplier) : base;
  return `${mins} minutes${timing.timing === "extended" ? ` (${timing.multiplier}× practice accommodation)` : ""}, feedback after you submit.`;
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
    () => (catalog ? (["baseline", "checkpoint", "simulation"] as const).map((k) => offerAssessment(k, catalog)) : []),
    [catalog],
  );

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
          {dailyPracticePool(content.modules).length} daily-practice questions and {formPool(content.modules).length} reserved Form A questions are usable. Form A
          families never appear in daily study, so baseline, checkpoint, and simulation results come from questions you have not drilled.
        </p>
      </header>

      {inProgress.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Resume</CardTitle>
            <CardDescription>
              Timed tests keep running while you are away. Answers already saved stay on this device. Start over clears unfinished quizzes and assessments from Practice.
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
          How you want to practice
        </h2>
        <div className="space-y-2">
          <p className="text-sm font-medium">Feedback for topic and mixed quizzes</p>
          <Toggle
            label="Feedback mode"
            value={mode}
            options={["study", "test"] as const}
            onChange={setMode}
            render={(v) => (v === "study" ? "Study mode: explain after each answer" : "Test mode: feedback after submit")}
          />
          <p className="text-sm text-muted-foreground">Baseline, checkpoint, and simulation always run in test mode.</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Timing for test mode</p>
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
            Standard time is {EXAM.testMinutes} minutes for {EXAM.totalQuestions} questions, scaled down for shorter forms. Extended, untimed, or skip-allowed attempts
            are practice accommodations and are labeled as non-standard in results.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2" aria-label="Quizzes from the daily practice pool">
        <Card>
          <CardHeader>
            <CardTitle>Topic quiz</CardTitle>
            <CardDescription>One topic, one question per family. Number in brackets is distinct families written.</CardDescription>
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
            <CardDescription>All four content areas in exam proportions, from daily practice.</CardDescription>
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
          Reserved Form A Assessments
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {standardOffers.map((offer) => (
            <Card key={offer.kind}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>{offer.label}</CardTitle>
                  {offer.ok ? <Badge>Available</Badge> : <Badge variant="outline">Not enough questions yet</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {offer.ok ? (
                  <>
                    <p>{offer.why}</p>
                    <p className="text-muted-foreground">{timeText(offer, timing, "test")}</p>
                    {offer.kind === "simulation" ? (
                      <p className="text-muted-foreground">
                        {allowSkip ? "Skipping allowed (non-standard)." : "You must answer each question before moving on; flag any to revisit."}
                      </p>
                    ) : null}
                    <Button className="min-h-11" disabled={busy} onClick={() => void start({ kind: offer.kind }, "test")}>
                      Start {offer.kind === "simulation" ? "simulation" : offer.kind}
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
                        onClick={() => void start({ kind: offer.fallback!.kind, size: offer.fallback!.size }, offer.fallback!.kind === "mixed_quiz" ? undefined : "test")}
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
          Your attempts on this device
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
        No question here has been clinically reviewed yet, so every score is a provisional practice result. Mammo never converts results into an ARRT scaled score or a
        pass probability. Local timers can be changed by the device clock; this is self-study, not a proctored exam.
      </p>
    </div>
  );
}
