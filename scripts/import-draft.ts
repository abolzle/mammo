import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { parseDraftJson } from "../src/lib/content/packet";
import { isValidatedPool } from "../src/lib/content/validate";
import type { Question } from "../src/lib/schemas/content";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const file = process.argv[2];
if (!file) {
  console.error("Usage: tsx scripts/import-draft.ts <draft.json>");
  process.exit(1);
}

const text = readFileSync(file, "utf8");
const parsed = parseDraftJson(text);
if (!parsed.ok) {
  console.error(parsed.issues.join("\n"));
  process.exit(1);
}

if (parsed.kind === "question") {
  const q = parsed.data as Question;
  if (isValidatedPool(q.review.status)) {
    console.error("Draft imports cannot enter the clinically reviewed pool.");
    process.exit(1);
  }
}

const outDir = join(root, "content/drafts");
mkdirSync(outDir, { recursive: true });
const id = (parsed.data as { id: string }).id;
const dest = join(outDir, `${parsed.kind}-${id}.json`);
writeFileSync(dest, JSON.stringify(parsed.data, null, 2));
console.log(`Validated ${parsed.kind} ${id}. Wrote ${dest}. Copy into a module only after a human source check. This does not publish.`);
