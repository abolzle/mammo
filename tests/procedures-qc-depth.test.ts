import { describe, expect, it } from "vitest";
import { loadRepoContent } from "../scripts/assemble-content";
import { applyCurriculumFollowUps, coverageMatrix } from "../src/lib/content/coverage";
import { isValidatedPool } from "../src/lib/content/validate";

const loaded = loadRepoContent();
const mod = loaded.modules.find((m) => m.id === "mod-procedures-qc-depth");

describe("procedures-qc-depth module", () => {
  it("loads with lessons, cards, and a practice-only question pool", () => {
    expect(loaded.ok).toBe(true);
    expect(mod).toBeDefined();
    expect(mod!.lessons.length).toBeGreaterThanOrEqual(10);
    expect(mod!.questions.length).toBeGreaterThanOrEqual(40);
    expect(mod!.cards.length).toBeGreaterThanOrEqual(30);
    expect(mod!.questions.every((q) => q.pool === "practice")).toBe(true);
  });

  it("keeps AI-assisted drafts out of the validated pool", () => {
    for (const item of [...mod!.questions, ...mod!.lessons, ...mod!.cards]) {
      expect(isValidatedPool(item.review.status)).toBe(false);
    }
  });

  it("does not redistribute ACR DMQC procedure excerpts", () => {
    const acr = loaded.evidence.filter((e) => e.sourceId === "src-acr-dmqc-manual" && e.id.startsWith("ev-pqd-"));
    expect(acr.length).toBeGreaterThan(0);
    expect(acr.every((e) => e.citation === "link_only" && !e.excerpt)).toBe(true);
  });

  it("applies curriculumFollowUps for the seven empty QC objectives", () => {
    const applied = applyCurriculumFollowUps(loaded.curriculum!, loaded.moduleCoverage, loaded.sources);
    const byId = new Map(applied.curriculum.objectives.map((o) => [o.id, o.sourceState]));
    for (const id of [
      "obj-qc-phantom",
      "obj-qc-compression-tests",
      "obj-qc-visual-checklist",
      "obj-qc-repeat-analysis",
      "obj-qc-detector-calibration",
      "obj-qc-physicist-tests",
      "obj-qc-monitors-viewing",
    ]) {
      expect(byId.get(id)).toBe("source_backed_open");
    }
  });

  it("adds countable practice coverage for consent/time-out", () => {
    const { curriculum } = applyCurriculumFollowUps(loaded.curriculum!, loaded.moduleCoverage, loaded.sources);
    const rows = coverageMatrix(curriculum, loaded.modules, {
      moduleCoverage: loaded.moduleCoverage,
      evidence: loaded.evidence,
      sources: loaded.sources,
    });
    const prep = rows.find((r) => r.objectiveId === "obj-pp-interventional-prep")!;
    expect(prep.lessonIds.length).toBeGreaterThan(0);
    expect(prep.learnerQuestionCount).toBeGreaterThanOrEqual(3);
    expect(prep.sourceState).toBe("source_backed_open");
  });
});
