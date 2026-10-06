import { describe, expect, it } from "vitest";
import { loadRepoContent } from "../scripts/assemble-content";
import { EXAM } from "../src/config/exam";
import { allocate, assembleForm, BLUEPRINT, largestFeasible } from "../src/lib/engine/forms";
import { dailyPracticePool, formPool, offerAssessment } from "../src/lib/engine/assessment";
import { createSession } from "../src/lib/engine/create";
import { planStudySession, reservedFamilies } from "../src/lib/engine/planner";
import { remainingMs } from "../src/lib/engine/session";
import { formIdFor, priorAttempts } from "../src/lib/engine/start";
import {
  assessmentReport,
  canAdvance,
  canSubmit,
  expireIfDue,
  feedbackVisible,
  goToIndex,
  setTestAnswer,
  submissionEvents,
  submitAssessment,
  toggleFlag,
} from "../src/lib/engine/test-mode";
import { defaultProfile } from "../src/lib/db";
import { session as sessionSchema, type SessionItem, type StudySession } from "../src/lib/schemas/learner";
import type { Curriculum, ModuleContent, Question } from "../src/lib/schemas/content";

const loaded = loadRepoContent();
const curriculum = loaded.curriculum!;

const objectiveFor = Object.fromEntries(
  BLUEPRINT.map((b) => {
    const topic = curriculum.topics.find((t) => t.subdomainId === b.id)!;
    return [b.id, curriculum.objectives.find((o) => o.topicId === topic.id)!.id];
  }),
);

const template = loaded.modules[0].questions[0];

function makeQ(id: string, sub: string, opts: Partial<Question> = {}): Question {
  return {
    ...template,
    id: `q-${id}`,
    familyId: `fam-${id}`,
    objectiveIds: [objectiveFor[sub]],
    pool: "form-a",
    correctChoiceId: "a",
    assetId: undefined,
    simulationRole: undefined,
    ...opts,
  };
}

/** A synthetic bank with `perSub` items in every blueprint unit. */
function bank(perSub: Record<string, number>, opts: (sub: string, i: number) => Partial<Question> = () => ({})): Question[] {
  return BLUEPRINT.flatMap((b) => Array.from({ length: perSub[b.id] ?? 0 }, (_, i) => makeQ(`${b.id.replace("sub-", "")}-${i}`, b.id, opts(b.id, i))));
}

function asModules(questions: Question[]): ModuleContent[] {
  return [{ ...loaded.modules[0], questions }];
}

const full = Object.fromEntries(BLUEPRINT.map((b) => [b.id, 60]));

describe("blueprint allocation", () => {
  it("allocates the full scored form exactly 20/30/26/39 = 115", () => {
    const a = allocate(EXAM.scoredQuestions);
    expect(a).toEqual({ "sub-patient-interactions": 20, "sub-acquisition-qa": 30, "sub-anatomy-pathology": 26, "sub-positioning-procedures": 39 });
    const domainTotals = EXAM.domains.map((d) => d.subdomains.reduce((s, x) => s + a[x.id], 0));
    expect(domainTotals).toEqual([20, 30, 65]);
  });

  it("apportions shorter forms proportionally and sums to the requested length", () => {
    for (const n of [10, 30, 60]) {
      const a = allocate(n);
      expect(Object.values(a).reduce((x, y) => x + y, 0)).toBe(n);
    }
    expect(allocate(30)).toEqual({ "sub-patient-interactions": 5, "sub-acquisition-qa": 8, "sub-anatomy-pathology": 7, "sub-positioning-procedures": 10 });
  });

  it("assembles a simulation of 115 scored + 30 pilots that matches the blueprint", () => {
    const plan = assembleForm({ questions: bank(full), curriculum, scored: 115, pilots: 30, salt: "t" });
    expect(plan.ok).toBe(true);
    expect(plan.items).toHaveLength(145);
    const scored = plan.items.filter((i) => i.role === "scored");
    expect(scored).toHaveLength(115);
    for (const b of BLUEPRINT) expect(scored.filter((i) => i.subdomainId === b.id)).toHaveLength(allocate(115)[b.id]);
  });

  it("uses pre-designated pilots and never scores them", () => {
    const qs = bank(full, (_sub, i) => (i < 8 ? { simulationRole: "pilot" } : {}));
    const plan = assembleForm({ questions: qs, curriculum, scored: 115, pilots: 30, salt: "t" });
    expect(plan.ok).toBe(true);
    const marked = new Set(qs.filter((q) => q.simulationRole === "pilot").map((q) => q.id));
    expect(plan.items.filter((i) => i.role === "scored").some((i) => marked.has(i.question.id))).toBe(false);
    expect(plan.items.filter((i) => i.role === "pilot").every((i) => marked.has(i.question.id))).toBe(true);
    expect(plan.designatedPilots).toBe(0);
  });

  it("falls back to a deterministic designation only when too few pilots are marked", () => {
    const qs = bank(full, (sub, i) => (sub === "sub-acquisition-qa" && i < 4 ? { simulationRole: "pilot" } : {}));
    const a = assembleForm({ questions: qs, curriculum, scored: 115, pilots: 30, salt: "t" });
    const b = assembleForm({ questions: qs, curriculum, scored: 115, pilots: 30, salt: "t" });
    expect(a.ok).toBe(true);
    expect(a.items.filter((i) => i.pilotSource === "marked")).toHaveLength(4);
    expect(a.designatedPilots).toBe(26);
    expect(a.items.map((i) => i.question.id)).toEqual(b.items.map((i) => i.question.id));
  });
});

describe("family separation", () => {
  it("never puts two items from one family, or two on one image case, in a form", () => {
    const qs = bank(full, (sub, i) => ({
      familyId: `fam-${sub.replace("sub-", "")}-${Math.floor(i / 2)}`,
      ...(i % 10 === 0 ? { assetId: "asset-shared" } : {}),
    }));
    const plan = assembleForm({ questions: qs, curriculum, scored: 60, salt: "t" });
    const fams = plan.items.map((i) => i.question.familyId);
    expect(new Set(fams).size).toBe(fams.length);
    expect(plan.items.filter((i) => i.question.assetId === "asset-shared").length).toBeLessThanOrEqual(1);
  });

  it("counts families, not reworded items, toward availability", () => {
    const qs = bank({ "sub-patient-interactions": 10, "sub-acquisition-qa": 10, "sub-anatomy-pathology": 10, "sub-positioning-procedures": 10 }, (sub) => ({
      familyId: `fam-${sub.replace("sub-", "")}-one`,
    }));
    expect(largestFeasible({ questions: qs, curriculum, max: 30 })).toBeLessThan(10);
  });

  it("prefers families the learner has not seen and flags seen ones as repeats", () => {
    const qs = bank({ "sub-patient-interactions": 8, "sub-acquisition-qa": 9, "sub-anatomy-pathology": 8, "sub-positioning-procedures": 11 });
    const seen = new Set(qs.slice(0, 3).map((q) => q.familyId));
    const plan = assembleForm({ questions: qs, curriculum, scored: 30, salt: "t", seenFamilies: seen });
    expect(plan.items.filter((i) => i.priorExposure).length).toBe(plan.items.filter((i) => seen.has(i.question.familyId)).length);
    const pcPicked = plan.items.filter((i) => i.subdomainId === "sub-patient-interactions");
    expect(pcPicked.every((i) => !seen.has(i.question.familyId))).toBe(true);
  });

  it("keeps the real bank's reserved families out of daily study and practice quizzes", () => {
    const reserved = reservedFamilies(loaded.modules);
    expect(dailyPracticePool(loaded.modules).some((q) => reserved.has(q.familyId))).toBe(false);
    const daily = planStudySession({
      catalog: { curriculum, modules: loaded.modules },
      profile: defaultProfile(),
      minutes: 20,
      schedules: [],
      histories: [],
      seenContent: new Set(),
    });
    expect(daily.items.some((i) => i.familyId && reserved.has(i.familyId))).toBe(false);
    const mixed = offerAssessment({ kind: "mixed_quiz", size: 40 }, { curriculum, modules: loaded.modules });
    if (mixed.ok) expect(mixed.plan.items.some((i) => reserved.has(i.question.familyId))).toBe(false);
  });

  it("excludes both Form A and Form B families from daily study, and keeps A/B form pools disjoint", () => {
    const aFams = new Set(formPool(loaded.modules, "form-a").map((q) => q.familyId));
    const bFams = new Set(formPool(loaded.modules, "form-b").map((q) => q.familyId));
    expect(aFams.size).toBeGreaterThan(0);
    expect(bFams.size).toBeGreaterThan(0);
    for (const fam of aFams) expect(bFams.has(fam)).toBe(false);

    const daily = dailyPracticePool(loaded.modules);
    expect(daily.some((q) => aFams.has(q.familyId) || bFams.has(q.familyId))).toBe(false);

    const aBaseline = offerAssessment({ kind: "baseline", form: "form-a" }, { curriculum, modules: loaded.modules });
    const bBaseline = offerAssessment({ kind: "baseline", form: "form-b" }, { curriculum, modules: loaded.modules });
    if (aBaseline.ok && bBaseline.ok) {
      const aIds = new Set(aBaseline.plan.items.map((i) => i.question.id));
      expect(bBaseline.plan.items.some((i) => aIds.has(i.question.id))).toBe(false);
      expect(aBaseline.plan.items.every((i) => i.question.pool === "form-a")).toBe(true);
      expect(bBaseline.plan.items.every((i) => i.question.pool === "form-b")).toBe(true);
    }
  });
});

describe("refusal and fallback", () => {
  const small = asModules(bank({ "sub-patient-interactions": 6, "sub-acquisition-qa": 12, "sub-anatomy-pathology": 4, "sub-positioning-procedures": 3 }));

  it("refuses with a per-area shortfall and offers the largest valid shorter form", () => {
    const offer = offerAssessment("baseline", { curriculum, modules: small });
    expect(offer.ok).toBe(false);
    if (offer.ok) return;
    expect(offer.shortfall.map((s) => s.id).sort()).toEqual(["sub-anatomy-pathology", "sub-positioning-procedures"]);
    expect(offer.reason).toMatch(/Anatomy, Physiology, and Pathology 4 of 7 \(short 3\)/);
    expect(offer.reason).toMatch(/Mammographic Positioning and Procedures 3 of 10 \(short 7\)/);
    expect(offer.reason).not.toMatch(/18/);
    const largest = largestFeasible({ questions: formPool(small, "form-a"), curriculum, max: 29 });
    expect(offer.fallback).toEqual({
      kind: "form_quiz",
      size: largest,
      label: `${largest}-question reserved Form A quiz`,
      form: "form-a",
    });
    const fb = offerAssessment({ kind: "form_quiz", size: largest, form: "form-a" }, { curriculum, modules: small });
    expect(fb.ok).toBe(true);
  });

  it("offers the next standard form when it fits", () => {
    const mid = asModules(bank({ "sub-patient-interactions": 12, "sub-acquisition-qa": 18, "sub-anatomy-pathology": 15, "sub-positioning-procedures": 22 }));
    const sim = offerAssessment("simulation", { curriculum, modules: mid });
    expect(sim.ok).toBe(false);
    if (!sim.ok) expect(sim.fallback?.kind).toBe("checkpoint");
  });

  it("goes away automatically once the pool is big enough", () => {
    const big = asModules(bank(full));
    for (const kind of ["baseline", "checkpoint", "simulation"] as const) {
      expect(offerAssessment(kind, { curriculum, modules: big }).ok).toBe(true);
    }
  });

  it("falls back to a practice quiz when the reserved pool is tiny", () => {
    const tiny = [...asModules(bank({ "sub-acquisition-qa": 3 })), ...loaded.modules.map((m) => ({ ...m, questions: m.questions.filter((q) => q.pool === "practice") }))];
    const offer = offerAssessment("baseline", { curriculum, modules: tiny });
    expect(offer.ok).toBe(false);
    if (!offer.ok) expect(offer.fallback?.kind).toBe("mixed_quiz");
  });

  it("refuses Form B independently when that bank is short, even if Form A is full", () => {
    const aQs = bank(full, () => ({ pool: "form-a" as const }));
    const bQs = bank(
      { "sub-patient-interactions": 2, "sub-acquisition-qa": 2, "sub-anatomy-pathology": 2, "sub-positioning-procedures": 2 },
      () => ({ pool: "form-b" as const }),
    );
    const modules = asModules([...aQs, ...bQs]);
    const aOk = offerAssessment({ kind: "baseline", form: "form-a" }, { curriculum, modules });
    const bNo = offerAssessment({ kind: "baseline", form: "form-b" }, { curriculum, modules });
    expect(aOk.ok).toBe(true);
    expect(bNo.ok).toBe(false);
    if (!bNo.ok) {
      expect(bNo.reason).toMatch(/Form B/);
      expect(bNo.pool).toBe("form-b");
      expect(bNo.shortfall.length).toBeGreaterThan(0);
    }
  });
});

describe("form selection", () => {
  it("routes baseline, checkpoint, and simulation to the chosen reserved pool", () => {
    const aQs = bank(full, () => ({ pool: "form-a" as const }));
    const bQs = bank(full, (sub, i) => ({
      pool: "form-b" as const,
      id: `q-b-${sub.replace("sub-", "")}-${i}`,
      familyId: `fam-b-${sub.replace("sub-", "")}-${i}`,
    }));
    const modules = asModules([...aQs, ...bQs]);
    for (const kind of ["baseline", "checkpoint", "simulation"] as const) {
      const a = offerAssessment({ kind, form: "form-a" }, { curriculum, modules });
      const b = offerAssessment({ kind, form: "form-b" }, { curriculum, modules });
      expect(a.ok).toBe(true);
      expect(b.ok).toBe(true);
      if (!a.ok || !b.ok) continue;
      expect(a.pool).toBe("form-a");
      expect(b.pool).toBe("form-b");
      expect(a.label).toMatch(/Form A/);
      expect(b.label).toMatch(/Form B/);
      expect(a.plan.items.every((i) => i.question.pool === "form-a")).toBe(true);
      expect(b.plan.items.every((i) => i.question.pool === "form-b")).toBe(true);
      expect(formIdFor(a)).toBe(`form-a:${kind}`);
      expect(formIdFor(b)).toBe(`form-b:${kind}`);
    }
  });

  it("labels retakes only when the same formId was completed before", () => {
    const offerA = offerAssessment({ kind: "baseline", form: "form-a" }, { curriculum, modules: asModules(bank(full)) });
    expect(offerA.ok).toBe(true);
    if (!offerA.ok) return;
    const formIdA = formIdFor(offerA);
    const formIdB = "form-b:baseline";
    const completed = (formId: string, n: number): StudySession[] =>
      Array.from({ length: n }, (_, i) =>
        createSession({
          kind: "assessment",
          mode: "test",
          minutes: 30,
          items: [],
          why: "t",
          contentVersion: "1",
          beta: true,
          assessment: {
            kind: "baseline",
            label: "t",
            pool: formId.startsWith("form-b") ? "form-b" : "form-a",
            formId,
            formVersion: "v",
            attempt: i + 1,
            retake: i > 0,
            standard: true,
            timing: "standard",
            timeMultiplier: 1,
            requireAnswer: false,
            designatedPilots: 0,
          },
        }),
      ).map((s) => ({ ...s, status: "completed" as const, completedAt: s.startedAt }));

    expect(priorAttempts([], formIdA)).toBe(0);
    expect(priorAttempts(completed(formIdA, 1), formIdA)).toBe(1);
    expect(priorAttempts(completed(formIdA, 2), formIdA)).toBe(2);
    // Completing Form B does not make a Form A attempt a retake.
    expect(priorAttempts(completed(formIdB, 3), formIdA)).toBe(0);
    expect(priorAttempts([...completed(formIdA, 1), ...completed(formIdB, 2)], formIdA)).toBe(1);
    expect(priorAttempts([...completed(formIdA, 1), ...completed(formIdB, 2)], formIdB)).toBe(2);
  });
});

function testSession(questions: Question[], opts: { requireAnswer?: boolean; minutes?: number } = {}) {
  const items: SessionItem[] = questions.map((q, i) => ({
    id: `it-${i}`,
    type: "question",
    contentId: q.id,
    revision: q.revision,
    objectiveIds: q.objectiveIds,
    familyId: q.familyId,
    pool: q.pool,
    estSeconds: 60,
    status: "pending",
    revealed: false,
    role: i === 0 ? "pilot" : "scored",
    subdomainId: BLUEPRINT.find((b) => objectiveFor[b.id] === q.objectiveIds[0])!.id,
    priorExposure: i === 1,
    flagged: false,
  }));
  return createSession({
    kind: "assessment",
    mode: "test",
    minutes: opts.minutes ?? 10,
    items,
    why: "t",
    contentVersion: "1",
    beta: true,
    timed: true,
    timeLimitMs: (opts.minutes ?? 10) * 60 * 1000,
    assessment: {
      kind: "simulation",
      label: "Full simulation",
      pool: "form-a",
      formId: "form-a:simulation",
      formVersion: "v",
      attempt: 1,
      retake: false,
      standard: true,
      timing: "standard",
      timeMultiplier: 1,
      requireAnswer: opts.requireAnswer ?? true,
      designatedPilots: 0,
    },
  });
}

describe("test mode", () => {
  const qs = bank({ "sub-patient-interactions": 2, "sub-acquisition-qa": 2 });
  const lookup = (id: string) => qs.find((q) => q.id === id);

  it("hides feedback and correctness until submit", () => {
    let s = testSession(qs);
    s = setTestAnswer(s, "it-1", "a");
    s = setTestAnswer(s, "it-1", "b");
    expect(feedbackVisible(s)).toBe(false);
    expect(s.items[1].selected).toBe("b");
    expect(s.items.some((i) => i.correct != null || i.revealed)).toBe(false);
    expect(submissionEvents(s)).toEqual([]);
    const done = submitAssessment(s, lookup);
    expect(feedbackVisible(done)).toBe(true);
    expect(done.items[1].correct).toBe(false);
    expect(setTestAnswer(done, "it-1", "a").items[1].selected).toBe("b");
  });

  it("requires an answer before advancing in full simulation, and supports flags", () => {
    let s = testSession(qs);
    expect(canAdvance(s)).toBe(false);
    expect(goToIndex(s, 2).currentIndex).toBe(0);
    s = toggleFlag(setTestAnswer(s, "it-0", "a"), "it-0");
    expect(s.items[0].flagged).toBe(true);
    expect(canAdvance(s)).toBe(true);
    s = goToIndex(s, 1);
    expect(s.currentIndex).toBe(1);
    expect(goToIndex(s, 0).currentIndex).toBe(0);
    expect(canSubmit(s)).toBe(false);
    const loose = testSession(qs, { requireAnswer: false });
    expect(canAdvance(loose)).toBe(true);
    expect(canSubmit(loose)).toBe(true);
  });

  it("resumes the clock after a refresh and submits on expiry", () => {
    const s = setTestAnswer(testSession(qs, { minutes: 10 }), "it-0", "a");
    const restored = sessionSchema.parse(JSON.parse(JSON.stringify(s)));
    const anchor = Date.parse(restored.elapsedAnchorAt);
    expect(remainingMs(restored, anchor + 4 * 60 * 1000)).toBe(6 * 60 * 1000 - restored.elapsedMs);
    expect(expireIfDue(restored, lookup, anchor + 9 * 60 * 1000)).toBe(restored);
    const expired = expireIfDue(restored, lookup, anchor + 60 * 60 * 1000);
    expect(expired.submitted).toBe(true);
    expect(expired.assessment?.submitReason).toBe("time_expired");
    expect(expired.elapsedMs).toBe(10 * 60 * 1000);
    expect(expired.items[0].correct).toBe(true);
    expect(expired.items[1].correct).toBe(false);
  });

  it("scores the headline on scored items only and reveals pilots separately", () => {
    let s = testSession(qs, { requireAnswer: false });
    for (const it of s.items) s = setTestAnswer(s, it.id, "a");
    const done = submitAssessment(s, lookup);
    const r = assessmentReport(done, curriculum as Curriculum);
    expect(r.headline.total).toBe(3);
    expect(r.headline.correct).toBe(3);
    expect(r.headline.limited).toBe(true);
    expect(r.pilots?.total).toBe(1);
    expect(r.exposure.repeat.total).toBe(1);
    expect(r.exposure.first.total).toBe(2);
    const events = submissionEvents(done);
    expect(new Set(events.map((e) => e.id)).size).toBe(events.length);
    expect(submissionEvents(done).map((e) => e.id)).toEqual(events.map((e) => e.id));
    expect(events.find((e) => e.itemId === "it-1")?.firstExposure).toBe(false);
  });
});

describe("current bank", () => {
  it("reports which Form A and Form B options are live", () => {
    const lines: string[] = [];
    for (const form of ["form-a", "form-b"] as const) {
      const status = (["baseline", "checkpoint", "simulation"] as const).map((k) => {
        const o = offerAssessment({ kind: k, form }, { curriculum, modules: loaded.modules });
        return o.ok
          ? `${k}: live`
          : `${k}: refused (${o.shortfall.map((s) => `${s.id} ${s.have}/${s.need}`).join(", ")}) → ${o.fallback?.label ?? "none"}`;
      });
      lines.push(`${form} usable: ${formPool(loaded.modules, form).length}`, ...status);
      for (const k of ["baseline", "checkpoint", "simulation"] as const) {
        expect(offerAssessment({ kind: k, form }, { curriculum, modules: loaded.modules }).ok).toBe(true);
      }
    }
    console.log(lines.join("\n"));
  });
});
