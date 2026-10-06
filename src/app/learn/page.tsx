"use client";

import { useRouter } from "next/navigation";
import { EXAM } from "@/config/exam";
import { useApp } from "@/components/app-provider";
import { Button } from "@/components/ui/button";
import { startLessonSession } from "@/lib/engine/start";

export default function LearnPage() {
  const { content, ready, error } = useApp();
  const router = useRouter();
  if (!ready) return <p>Loading…</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!content) return null;

  const lessonsByTopic = new Map<string, typeof content.modules[0]["lessons"]>();
  for (const m of content.modules) {
    for (const l of m.lessons) {
      const obj = content.curriculum.objectives.find((o) => o.id === l.objectiveId);
      const topicId = obj?.topicId ?? "other";
      const list = lessonsByTopic.get(topicId) ?? [];
      list.push(l);
      lessonsByTopic.set(topicId, list);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl text-navy">Learn</h1>
      <p className="text-muted-foreground">
        The full curriculum map is here. Only the MQSA module has lessons in this beta. Gaps are listed honestly — a missing source is not a finished lesson.
      </p>
      {EXAM.domains.map((domain) => (
        <section key={domain.id} className="space-y-3">
          <h2 className="font-heading text-xl">{domain.name}</h2>
          {content.curriculum.topics
            .filter((t) => t.domainId === domain.id)
            .map((topic) => {
              const lessons = lessonsByTopic.get(topic.id) ?? [];
              const objs = content.curriculum.objectives.filter((o) => o.topicId === topic.id);
              return (
                <div key={topic.id} className="rounded-xl border p-4">
                  <h3 className="font-medium">{topic.title}</h3>
                  <p className="text-sm text-muted-foreground">{topic.summary}</p>
                  {lessons.length ? (
                    <ul className="mt-3 space-y-2">
                      {lessons.map((l) => (
                        <li key={l.id}>
                          <Button
                            variant="outline"
                            className="min-h-11 w-full justify-start whitespace-normal text-left"
                            onClick={async () => {
                              const s = await startLessonSession(content, l.id);
                              if (s) router.push(`/session/?id=${s.id}`);
                            }}
                          >
                            {l.title} · {l.estMinutes} min
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {objs.some((o) => o.sourceState === "blocked")
                        ? "Blocked: no accessible source verifies this topic yet."
                        : objs.some((o) => o.sourceState === "needs_source")
                          ? "No lesson yet — source still needs retrieval."
                          : "Mapped, not yet written."}
                    </p>
                  )}
                </div>
              );
            })}
        </section>
      ))}
    </div>
  );
}
