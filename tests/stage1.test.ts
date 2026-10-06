import { describe, expect, it } from "vitest";
import { loadRepoContent } from "../scripts/assemble-content";
import { coverageMatrix, sourceBreakdown } from "../src/lib/content/coverage";
import { isLearnerVisible, isValidatedPool, validateImportedJson } from "../src/lib/content/validate";
import { planFullSimulationUnavailable, planQuiz, planStudySession, practiceQuestions, reservedFamilies } from "../src/lib/engine/planner";
import { defaultProfile } from "../src/lib/db";
import { applyAnswer, liveElapsedMs } from "../src/lib/engine/session";
import { createSession } from "../src/lib/engine/create";
import { eventId } from "../src/lib/engine/ids";
import { parseBackupText } from "../src/lib/engine/backup";
import { EXAM } from "../src/config/exam";

const loaded = loadRepoContent();

describe("content validation", () => {
  it("loads MQSA content without errors", () => {
    expect(loaded.ok).toBe(true);
    expect(loaded.issues.filter((i) => i.level === "error")).toEqual([]);
    expect(loaded.modules[0].questions).toHaveLength(48);
    expect(loaded.modules[0].lessons.length).toBeGreaterThanOrEqual(8);
  });

  it("keeps review status distinct from clinical review", () => {
    const q = loaded.modules[0].questions[0];
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
    const sim = planFullSimulationUnavailable(EXAM.totalQuestions, practiceQuestions(loaded.modules).length);
    expect(sim.allowed).toBe(false);
    const quiz = planQuiz({
      catalog: { curriculum: loaded.curriculum!, modules: loaded.modules },
      size: 60,
      mode: "test",
    });
    expect(quiz.shorter).toBe(true);
    expect(quiz.offered).toBeLessThan(60);
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
});

describe("coverage", () => {
  it("reports four-way source breakdown", () => {
    const b = sourceBreakdown(loaded.curriculum!);
    expect(b.public_domain_open).toBeGreaterThan(0);
    expect(b.truly_blocked).toBeGreaterThan(0);
    const rows = coverageMatrix(loaded.curriculum!, loaded.modules);
    expect(rows.some((r) => r.gap)).toBe(true);
  });
});
