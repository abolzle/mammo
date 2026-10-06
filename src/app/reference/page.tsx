"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { useApp } from "@/components/app-provider";

export default function ReferencePage() {
  const { content, ready } = useApp();
  const [q, setQ] = useState("");
  const terms = useMemo(() => {
    if (!content) return [];
    const glossary = content.modules.flatMap((m) => m.glossary);
    const lessons = content.modules.flatMap((m) => m.lessons).map((l) => ({ term: l.title, definition: l.summary }));
    return [...glossary, ...lessons].filter((t) => t.term.toLowerCase().includes(q.toLowerCase()) || t.definition.toLowerCase().includes(q.toLowerCase()));
  }, [content, q]);
  if (!ready || !content) return <p>Loading…</p>;
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-3xl text-navy">Reference</h1>
      <p className="text-muted-foreground">
        Looking for a definition or a quick refresher? Search lesson summaries and the glossary here without starting a study session.
      </p>
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a term or topic" aria-label="Search reference" className="min-h-11" />
      <ul className="space-y-3">
        {terms.map((t) => (
          <li key={t.term} className="rounded-xl border p-3">
            <p className="font-medium">{t.term}</p>
            <p className="text-sm text-muted-foreground">{t.definition}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
