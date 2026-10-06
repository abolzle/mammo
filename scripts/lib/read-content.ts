import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { RawContent } from "@/lib/content/assemble";

export const ROOT = join(import.meta.dirname, "..", "..");
export const CONTENT_DIR = join(ROOT, "content");

const readJson = (p: string) => JSON.parse(readFileSync(p, "utf8"));

/** Date the authored drafts were written; used for default review history. */
export const AUTHORED_ON = "2026-10-06";

export function readRawContent(dir = CONTENT_DIR): RawContent {
  const evDir = join(dir, "evidence");
  const modDir = join(dir, "modules");
  return {
    register: readJson(join(dir, "sources", "register.json")),
    evidenceFiles: readdirSync(evDir).filter((f) => f.endsWith(".json")).sort().map((f) => readJson(join(evDir, f))),
    curriculum: readJson(join(dir, "curriculum", "curriculum.json")),
    modules: readdirSync(modDir)
      .filter((d) => existsSync(join(modDir, d, "module.json")))
      .sort()
      .map((d) => ({
        meta: readJson(join(modDir, d, "module.json")),
        lessons: readJson(join(modDir, d, "lessons.json")),
        questions: readJson(join(modDir, d, "questions.json")),
        cards: readJson(join(modDir, d, "cards.json")),
      })),
    authoredOn: AUTHORED_ON,
  };
}
