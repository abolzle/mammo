import { describe, expect, it } from "vitest";
import { loadRepoContent } from "../scripts/assemble-content";
import { isValidatedPool } from "../src/lib/content/validate";

const loaded = loadRepoContent();
const mod = loaded.modules.find((m) => m.id === "mod-informatics");

describe("informatics/CAD module", () => {
  it("loads with lessons, cards, and practice plus reserved-form items", () => {
    expect(loaded.ok).toBe(true);
    expect(mod).toBeDefined();
    expect(mod!.lessons.length).toBeGreaterThanOrEqual(8);
    expect(mod!.questions.length).toBeGreaterThanOrEqual(35);
    expect(mod!.cards.length).toBeGreaterThanOrEqual(25);
    expect(mod!.questions.some((q) => q.pool === "practice")).toBe(true);
    expect(mod!.questions.some((q) => q.pool === "form-a")).toBe(true);
    expect(mod!.questions.some((q) => q.pool === "form-b")).toBe(true);
  });

  it("keeps AI-assisted drafts out of the validated pool", () => {
    for (const item of [...mod!.questions, ...mod!.lessons, ...mod!.cards]) {
      expect(isValidatedPool(item.review.status)).toBe(false);
    }
  });

  it("flags monitor-QC content for qualified review", () => {
    const monitorItems = [
      ...mod!.questions.filter((q) => q.objectiveIds.includes("obj-qc-monitors-viewing")),
      ...mod!.lessons.filter((l) => l.objectiveId === "obj-qc-monitors-viewing"),
    ];
    expect(monitorItems.length).toBeGreaterThan(0);
    expect(monitorItems.every((i) => i.review.requiresQualifiedReview)).toBe(true);
  });

  it("cites DICOM only as link-only evidence without excerpts", () => {
    const dicom = loaded.evidence.filter((e) => e.sourceId === "src-dicom-ps3-1");
    expect(dicom.length).toBeGreaterThan(0);
    expect(dicom.every((e) => e.citation === "link_only" && !e.excerpt)).toBe(true);
    const src = loaded.sources.find((s) => s.id === "src-dicom-ps3-1")!;
    expect(src.rights.canSubmitToAI).toBe(false);
  });
});
