import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadRepoContent } from "../scripts/assemble-content";
import { applyCurriculumFollowUps, coverageMatrix, parseModuleCoverage } from "../src/lib/content/coverage";

const loaded = loadRepoContent();
const curriculum = loaded.curriculum!;
const opts = { evidence: loaded.evidence, sources: loaded.sources };
const row = (rows: ReturnType<typeof coverageMatrix>, id: string) => rows.find((r) => r.objectiveId === id)!;

describe("module-local coverage", () => {
  it("counts a module coverage.json entry toward its objective", () => {
    const target = "obj-pc-prior-images";
    const lesson = loaded.modules.flatMap((m) => m.lessons).find((l) => l.id === "les-pc-results")!;
    expect(lesson.objectiveId).not.toBe(target);

    const without = row(coverageMatrix(curriculum, loaded.modules, opts), target);
    expect(without.lessonIds).not.toContain(lesson.id);
    expect(without.gap).toBe("missing lesson");

    const moduleCoverage = [
      parseModuleCoverage({ moduleId: "mod-patient-care", objectiveCoverage: [{ objectiveId: target, lessonIds: [lesson.id] }] }),
    ];
    const withLink = row(coverageMatrix(curriculum, loaded.modules, { ...opts, moduleCoverage }), target);
    expect(withLink.lessonIds).toContain(lesson.id);
    expect(withLink.gap).not.toBe("missing lesson");
  });

  it("reads the `rows` shape used by some modules", () => {
    const cov = parseModuleCoverage({ moduleId: "mod-x", rows: [{ objectiveId: "obj-a", questionIds: ["q-1"] }] });
    expect(cov.links).toEqual([{ objectiveId: "obj-a", lessonIds: [], cardIds: [], questionIds: ["q-1"], visualIds: [] }]);
  });

  it("applies informatics curriculumFollowUps; procedures-qc-depth may later open monitors QC", () => {
    const raw = JSON.parse(readFileSync(join(__dirname, "../content/curriculum/curriculum.json"), "utf8")) as {
      objectives: { id: string; sourceState: string }[];
    };
    expect(raw.objectives.find((o) => o.id === "obj-ip-cad")!.sourceState).toBe("needs_source");
    const applied = new Map(curriculum.objectives.map((o) => [o.id, o.sourceState]));
    expect(applied.get("obj-ip-cad")).toBe("source_backed_open");
    expect(applied.get("obj-ip-informatics")).toBe("source_backed_open");
    // procedures-qc-depth adds federal viewing/digital-QC evidence and follow-up for monitors
    expect(applied.get("obj-qc-monitors-viewing")).toBe("source_backed_open");
    const rows = coverageMatrix(curriculum, loaded.modules, { ...opts, moduleCoverage: loaded.moduleCoverage });
    // Still incomplete without an assessment-form item (practice depth only in this pass)
    expect(row(rows, "obj-qc-monitors-viewing").complete).toBe(false);
    expect(row(rows, "obj-qc-monitors-viewing").gap).toMatch(/assessment-form|form/i);
  });

  it("does not apply a follow-up whose sources are unregistered", () => {
    const cov = parseModuleCoverage({
      moduleId: "mod-x",
      curriculumFollowUps: [{ objectiveId: "obj-pc-epidemiology", suggestedSourceState: "source_backed_open", suggestedSourceIds: ["src-nope"] }],
    });
    const { curriculum: next, issues } = applyCurriculumFollowUps(curriculum, [cov], loaded.sources);
    expect(next.objectives.find((o) => o.id === "obj-pc-epidemiology")!.sourceState).toBe("needs_source");
    expect(issues.some((i) => i.level === "error")).toBe(true);
  });

  it("keeps blocked and needs-source objectives as gaps even with full content", () => {
    const rows = coverageMatrix(curriculum, loaded.modules, { ...opts, moduleCoverage: loaded.moduleCoverage });
    for (const r of rows.filter((r) => r.sourceState === "blocked" || r.sourceState === "needs_source")) {
      expect(r.complete).toBe(false);
    }
    expect(rows.every((r) => !r.complete || (r.lessonIds.length && r.cardIds.length && r.learnerQuestionCount >= 3 && r.formQuestionCount >= 1))).toBe(true);
  });
});
