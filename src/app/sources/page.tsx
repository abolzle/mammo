"use client";

import { useApp } from "@/components/app-provider";

export default function SourcesPage() {
  const { content, ready } = useApp();
  if (!ready || !content) return <p>Loading…</p>;
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-3xl text-navy">Sources</h1>
      <p className="text-muted-foreground">
        Every important explanation is tied to a registered source. Copyright protects expression, not facts: link-only sources are cited without copying their wording.
      </p>
      <ul className="space-y-3">
        {content.sources.map((s) => (
          <li key={s.id} className="rounded-xl border p-3">
            <p className="font-medium">{s.title}</p>
            <p className="text-sm text-muted-foreground">
              {s.publisher} · {s.rights.status.replaceAll("_", " ")} · retrieved {s.retrievedOn ?? "n/a"} ({s.retrievalStatus})
            </p>
            <a className="text-sm text-teal underline" href={s.url} target="_blank" rel="noreferrer">
              {s.url}
            </a>
            <p className="mt-1 text-sm">{s.rights.basis}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
