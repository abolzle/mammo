import type { Curriculum, Evidence, ModuleContent, Source } from "@/lib/schemas/content";
import type { ModuleCoverage } from "./coverage";

export type ContentCatalog = {
  version: string;
  assembledAt: string;
  modules: Array<{
    id: string;
    version: string;
    title: string;
    summary: string;
    topicIds: string[];
    path: string;
    lessonCount: number;
    questionCount: number;
    cardCount: number;
    visualCount: number;
  }>;
  coverageSummary: {
    objectives: number;
    withLesson: number;
    complete?: number;
    withGap: number;
    breakdown: Record<string, number>;
  };
};

export type LoadedContent = {
  catalog: ContentCatalog;
  curriculum: Curriculum;
  sources: Source[];
  evidence: Evidence[];
  modules: ModuleContent[];
  moduleCoverage: ModuleCoverage[];
};

let cache: LoadedContent | null = null;

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json() as Promise<T>;
}

export async function loadContent(): Promise<LoadedContent> {
  if (cache) return cache;
  const catalog = await getJson<ContentCatalog>("/content/catalog.json");
  const curriculum = await getJson<Curriculum>("/content/curriculum.json");
  const sourcesFile = await getJson<{ sources: Source[] }>("/content/sources.json");
  const evidenceFile = await getJson<{ evidence: Evidence[] }>("/content/evidence.json");
  const modules: ModuleContent[] = [];
  for (const m of catalog.modules) {
    modules.push(await getJson<ModuleContent>(m.path));
  }
  const moduleCoverage = await getJson<{ modules: ModuleCoverage[] }>("/content/module-coverage.json")
    .then((f) => f.modules)
    .catch(() => []);
  cache = {
    catalog,
    curriculum,
    sources: sourcesFile.sources,
    evidence: evidenceFile.evidence,
    modules,
    moduleCoverage,
  };
  return cache;
}

export function contentVersions(loaded: LoadedContent): Record<string, string> {
  const v: Record<string, string> = { curriculum: loaded.curriculum.version };
  for (const m of loaded.modules) v[m.id] = m.version;
  return v;
}

export function lookupEvidence(loaded: LoadedContent, ids: string[]): Evidence[] {
  return ids.map((id) => loaded.evidence.find((e) => e.id === id)).filter((e): e is Evidence => Boolean(e));
}

export function lookupSource(loaded: LoadedContent, id: string): Source | undefined {
  return loaded.sources.find((s) => s.id === id);
}
