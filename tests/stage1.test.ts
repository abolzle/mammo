import { describe, expect, it } from "vitest";
import { loadRepoContent } from "../scripts/assemble-content";
import { coverageMatrix, sourceBreakdown } from "../src/lib/content/coverage";
import { isLearnerVisible, isValidatedPool, validateImportedJson } from "../src/lib/content/validate";
import { planQuiz, planStudySession, practiceQuestions, reservedFamilies } from "../src/lib/engine/planner";
import { defaultProfile } from "../src/lib/db";
import { abandonSession, applyAnswer, liveElapsedMs } from "../src/lib/engine/session";
import { createSession } from "../src/lib/engine/create";
import { eventId } from "../src/lib/engine/ids";
import { parseBackupText, importBackup, exportBackup } from "../src/lib/engine/backup";
import { parseDraftJson, buildGeneratePacket } from "../src/lib/content/packet";
import { reconcileEvent } from "../src/lib/engine/reconcile";
import { ensureProfile, putEvent, putExposure, getExposure, resetDb } from "../src/lib/db";
import { planInsufficientTime } from "../src/lib/engine/planner";

const loaded = loadRepoContent();

describe("content validation", () => {
  it("loads MQSA content without errors", () => {
    expect(loaded.ok).toBe(true);
    expect(loaded.issues.filter((i) => i.level === "error")).toEqual([]);
    const mqsa = loaded.modules.find((m) => m.id === "mod-mqsa");
    expect(mqsa).toBeDefined();
    expect(mqsa!.questions.length).toBeGreaterThanOrEqual(48);
    expect(mqsa!.lessons.length).toBeGreaterThanOrEqual(8);
    const anatomy = loaded.modules.find((m) => m.id === "mod-anatomy-pathology");
    expect(anatomy).toBeDefined();
    expect(anatomy!.questions.length).toBeGreaterThanOrEqual(40);
    expect(anatomy!.lessons.length).toBeGreaterThanOrEqual(8);
    const qcr = loaded.modules.find((m) => m.id === "mod-qc-regulations");
    expect(qcr).toBeDefined();
    expect(qcr!.questions.length).toBeGreaterThanOrEqual(40);
    expect(qcr!.lessons.length).toBeGreaterThanOrEqual(8);
  });

  it("keeps review status distinct from clinical review", () => {
    const mqsa = loaded.modules.find((m) => m.id === "mod-mqsa")!;
    const q = mqsa.questions[0];
    expect(isLearnerVisible(q.review.status)).toBe(true);
    expect(isValidatedPool(q.review.status)).toBe(false);
  });

  it("rejects unsafe and malformed imports", () => {
    expect(validateImportedJson("<script>alert(1)</script>").ok).toBe(false);
    expect(validateImportedJson("{").ok).toBe(false);
  });
});

describe("planner", () => {
  it("excludes reserved form families from daily study", () => {
    const reserved = reservedFamilies(loaded.modules);
    expect(reserved.size).toBeGreaterThan(0);
    const practice = practiceQuestions(loaded.modules);
    expect(practice.every((q) => !reserved.has(q.familyId))).toBe(true);
    expect(practice.every((q) => q.pool === "practice")).toBe(true);
  });

  it("respects a 5-minute budget", () => {
    const plan = planStudySession({
      catalog: { curriculum: loaded.curriculum!, modules: loaded.modules },
      profile: defaultProfile(),
      minutes: 5,
      schedules: [],
      histories: [],
      seenContent: new Set(),
    });
    const work = plan.items.filter((i) => i.type !== "recap").reduce((a, i) => a + i.estSeconds, 0);
    expect(work).toBeLessThanOrEqual(5 * 60);
  });

  it("offers a shorter quiz instead of inventing a full simulation", () => {
    const available = practiceQuestions(loaded.modules).length;
    const requested = available + 40;
    const quiz = planQuiz({
      catalog: { curriculum: loaded.curriculum!, modules: loaded.modules },
      size: requested,
      mode: "test",
    });
    expect(quiz.shorter).toBe(true);
    expect(quiz.offered).toBeLessThan(requested);
  });
});

describe("session resume", () => {
  it("does not duplicate events for the same item", () => {
    const session = createSession({
      kind: "study",
      mode: "study",
      minutes: 10,
      why: "test",
      contentVersion: "1",
      beta: true,
      items: [
        {
          id: "it-one",
          type: "question",
          contentId: "q-mqsa-001",
          revision: 1,
          objectiveIds: ["obj-mqsa-certification"],
          familyId: "fam-mqsa-cert-basis",
          pool: "practice",
          estSeconds: 60,
          status: "pending",
          revealed: false,
        },
      ],
    });
    const a = applyAnswer({ session, itemId: "it-one", answer: "a", correct: true, firstExposure: true });
    const b = applyAnswer({ session: a.session, itemId: "it-one", answer: "a", correct: true, firstExposure: false });
    expect(a.event.id).toBe(b.event.id);
    expect(a.event.id).toBe(eventId(session.id, "it-one"));
  });

  it("abandons an open session so Today can start fresh", () => {
    const session = createSession({
      kind: "study",
      mode: "study",
      minutes: 10,
      why: "test",
      contentVersion: "1",
      beta: true,
      items: [],
    });
    const abandoned = abandonSession(session);
    expect(abandoned.status).toBe("abandoned");
    expect(abandoned.completedAt).toBeTruthy();
    expect(abandoned.id).toBe(session.id);
  });

  it("continues elapsed time after a simulated refresh", () => {
    const session = createSession({
      kind: "quiz",
      mode: "test",
      minutes: 10,
      why: "test",
      contentVersion: "1",
      beta: true,
      timed: true,
      timeLimitMs: 10 * 60 * 1000,
      items: [],
    });
    const later = new Date(Date.parse(session.elapsedAnchorAt) + 5000).getTime();
    expect(liveElapsedMs(session, later)).toBeGreaterThanOrEqual(5000);
  });
});

describe("backup", () => {
  it("rejects a non-backup file", () => {
    const r = parseBackupText(JSON.stringify({ hello: "world" }));
    expect(r.ok).toBe(false);
  });

  it("merges backups and skips duplicate events", async () => {
    await resetDb();
    await ensureProfile();
    const versions = { curriculum: "test" };
    const first = await exportBackup(versions);
    const event = {
      id: "evt-ses-it-one",
      sessionId: "ses-one",
      itemId: "it-one",
      contentId: "q-mqsa-001",
      contentRevision: 1,
      type: "question" as const,
      answer: "a",
      correct: true,
      confidence: null,
      selfRating: null,
      objectiveIds: ["obj-mqsa-certification"],
      firstExposure: true,
      createdAt: new Date().toISOString(),
      elapsedMs: 1000,
    };
    first.events = [event];
    const result = await importBackup(first, versions, "merge");
    expect(result.ok).toBe(true);
    const again = await importBackup(first, { curriculum: "newer" }, "merge");
    expect(again.skippedEvents).toBeGreaterThan(0);
    expect(again.contentVersionNote).toMatch(/does not recalculate/i);
  });
});

describe("assessment honesty", () => {
  it("keeps reserved Form A families out of daily study", () => {
    const reserved = reservedFamilies(loaded.modules);
    const daily = planStudySession({
      catalog: { curriculum: loaded.curriculum!, modules: loaded.modules },
      profile: defaultProfile(),
      minutes: 10,
      schedules: [],
      histories: [],
      seenContent: new Set(),
    });
    expect(daily.items.filter((i) => i.familyId && reserved.has(i.familyId))).toEqual([]);
  });
});

describe("pipeline", () => {
  it("rejects clinically reviewed status on import and unsafe text", () => {
    expect(parseDraftJson("<script>alert(1)</script>").ok).toBe(false);
    const sample = loaded.modules[0].questions[0];
    const bad = { ...sample, review: { ...sample.review, status: "clinically_reviewed" } };
    expect(parseDraftJson(JSON.stringify(bad)).ok).toBe(false);
  });

  it("fills a generation packet from authorized evidence", () => {
    const text = buildGeneratePacket(
      { sources: loaded.sources, evidence: loaded.evidence, curriculum: loaded.curriculum! },
      ["obj-mqsa-certification"],
      "# Generation packet\n## Evidence\nPaste authorized evidence records here.\n## Objectives\nPaste objective ids and statements here.\n",
    );
    expect(text).toContain("obj-mqsa-certification");
    expect(text).not.toContain("Paste authorized evidence records here.");
  });
});

describe("key correction", () => {
  it("keeps the original result next to a corrected key", () => {
    const q = { ...loaded.modules[0].questions[0], revision: 2, correctChoiceId: "b" as const, keyHistory: [{ revision: 1, correctChoiceId: "a", changedOn: "2026-10-06", reason: "test" }] };
    const event = {
      id: "evt-x",
      sessionId: "ses-x",
      itemId: "it-x",
      contentId: q.id,
      contentRevision: 1,
      type: "question" as const,
      answer: "a",
      correct: true,
      confidence: null,
      selfRating: null,
      objectiveIds: q.objectiveIds,
      firstExposure: true,
      createdAt: new Date().toISOString(),
      elapsedMs: 1,
    };
    const r = reconcileEvent(event, q);
    expect(r.status).toBe("key_corrected");
    expect(r.correctedCorrect).toBe(false);
    expect(r.event.correct).toBe(true);
  });
});

describe("IndexedDB", () => {
  it("does not duplicate exposures when the same event is written twice", async () => {
    await resetDb();
    await ensureProfile();
    const ev = {
      id: "evt-dup",
      sessionId: "ses-dup",
      itemId: "it-dup",
      contentId: "q-dup",
      contentRevision: 1,
      type: "question" as const,
      answer: "a",
      correct: true,
      confidence: null,
      selfRating: null,
      objectiveIds: ["obj-mqsa-certification"],
      firstExposure: true,
      createdAt: new Date().toISOString(),
      elapsedMs: 1,
    };
    expect((await putEvent(ev)).inserted).toBe(true);
    expect((await putEvent(ev)).inserted).toBe(false);
    await putExposure({ contentId: "q-dup", familyId: "fam-x", firstAt: ev.createdAt, lastAt: ev.createdAt, count: 1 });
    const exp = await getExposure("q-dup");
    expect(exp?.count).toBe(1);
  });
});

describe("plan fit", () => {
  it("warns when remaining material cannot fit before the exam date", () => {
    const note = planInsufficientTime({
      examDate: "2026-10-10",
      minutesPref: 5,
      remainingObjectives: 70,
      now: new Date("2026-10-06T00:00:00"),
    });
    expect(note).toMatch(/not be enough time/i);
  });
});

describe("coverage", () => {
  it("reports four-way source breakdown", () => {
    const b = sourceBreakdown(loaded.curriculum!);
    expect(b.public_domain_open).toBeGreaterThan(0);
    expect(b.public_domain_open + b.link_only + b.needs_source + b.truly_blocked).toBe(loaded.curriculum!.objectives.length);
    const blocked = loaded.curriculum!.objectives.filter((o) => o.sourceState === "blocked");
    expect(b.truly_blocked).toBe(blocked.length);
    expect(blocked.every((o) => o.blockedNote)).toBe(true);
    const rows = coverageMatrix(loaded.curriculum!, loaded.modules);
    // Blueprint objectives are source-backed with learner assets; keep the matrix honest if gaps return.
    expect(rows.every((r) => r.complete === (r.gap === null))).toBe(true);
    expect(rows.filter((r) => r.complete).length).toBe(rows.length);
  });
});
