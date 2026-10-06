import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadRepoContent } from "./assemble-content";
import { buildCritiquePacket, buildGeneratePacket } from "../src/lib/content/packet";
import { readFileSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const loaded = loadRepoContent();
if (!loaded.ok || !loaded.curriculum) {
  console.error("Content does not validate; refusing to export packets.");
  process.exit(1);
}

const generateTemplate = readFileSync(join(root, "content/pipeline/generate.md"), "utf8");
const critiqueTemplate = readFileSync(join(root, "content/pipeline/critique.md"), "utf8");
const packetSource = {
  sources: loaded.sources,
  evidence: loaded.evidence,
  curriculum: loaded.curriculum,
};

const outDir = join(root, "content/packets");
mkdirSync(outDir, { recursive: true });

const objectiveId = arg("--objective");
const questionId = arg("--critique");

if (questionId) {
  const q = loaded.modules.flatMap((m) => m.questions).find((x) => x.id === questionId);
  if (!q) {
    console.error(`Question ${questionId} not found`);
    process.exit(1);
  }
  const text = buildCritiquePacket({
    question: q,
    evidence: loaded.evidence,
    sources: loaded.sources,
    critiqueTemplate,
  });
  const dest = join(outDir, `critique-${q.id}.md`);
  writeFileSync(dest, text);
  console.log(`Wrote ${dest}`);
  process.exit(0);
}

const ids = objectiveId
  ? [objectiveId]
  : loaded.curriculum.objectives.filter((o) => o.sourceState === "source_backed_open").map((o) => o.id);

const dest = join(outDir, objectiveId ? `generate-${objectiveId}.md` : "generate-open-objectives.md");
writeFileSync(dest, buildGeneratePacket(packetSource, ids, generateTemplate));
console.log(`Wrote ${dest} covering ${ids.length} objective(s).`);
