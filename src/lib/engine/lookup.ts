import type { Curriculum, Lesson, ModuleContent, Objective, Question, RecallCard, Topic, VisualExercise, Asset, Evidence, Source } from "@/lib/schemas/content";

export interface Lookup {
  curriculum: Curriculum;
  modules: ModuleContent[];
  questions: Map<string, Question>;
  lessons: Map<string, Lesson>;
  cards: Map<string, RecallCard>;
  visuals: Map<string, VisualExercise>;
  assets: Map<string, Asset>;
  objectives: Map<string, Objective>;
  topics: Map<string, Topic>;
  evidence: Map<string, Evidence>;
  sources: Map<string, Source>;
  objectiveDomain: (objectiveId: string) => string;
  /** Families with any item in a reserved form. Daily study never draws from these. */
  reservedFamilies: Set<string>;
  /** Practice-pool questions whose family is not shared with a reserved form. */
  studyQuestions: Question[];
  lessonForObjective: Map<string, Lesson>;
}

export function createLookup(curriculum: Curriculum, modules: ModuleContent[], evidence: Evidence[] = [], sources: Source[] = []): Lookup {
  const topics = new Map(curriculum.topics.map((t) => [t.id, t]));
  const objectives = new Map(curriculum.objectives.map((o) => [o.id, o]));
  const all = <T extends { id: string }>(pick: (m: ModuleContent) => T[]) => new Map(modules.flatMap(pick).map((x) => [x.id, x]));
  const questions = all((m) => m.questions);
  const reservedFamilies = new Set([...questions.values()].filter((q) => q.pool !== "practice").map((q) => q.familyId));
  const lessons = all((m) => m.lessons);
  return {
    curriculum,
    modules,
    questions,
    lessons,
    cards: all((m) => m.cards),
    visuals: all((m) => m.visuals),
    assets: all((m) => m.assets),
    objectives,
    topics,
    evidence: new Map(evidence.map((e) => [e.id, e])),
    sources: new Map(sources.map((s) => [s.id, s])),
    objectiveDomain: (id) => topics.get(objectives.get(id)?.topicId ?? "")?.domainId ?? "unknown",
    reservedFamilies,
    studyQuestions: [...questions.values()].filter((q) => q.pool === "practice" && !reservedFamilies.has(q.familyId)),
    lessonForObjective: new Map([...lessons.values()].map((l) => [l.objectiveId, l])),
  };
}
