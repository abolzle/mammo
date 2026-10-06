"use client";

import { useApp } from "@/components/app-provider";

const RIGHTS_LABELS = {
  public_domain: "public domain",
  open_license: "openly licensed",
  copyrighted_link_only: "copyrighted · link only",
  copyrighted_permission_needed: "copyrighted · permission needed to reuse",
  unknown: "reuse terms still being checked",
} as const;

const SOURCE_STATUS_LABELS = {
  retrieved: "source reviewed",
  link_only: "official link available",
  blocked: "currently unavailable",
  not_attempted: "review not started",
} as const;

export default function SourcesPage() {
  const { content, ready } = useApp();
  if (!ready || !content) return <p>Loading…</p>;
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-3xl text-navy">Sources and review</h1>
      <p className="text-muted-foreground">
        Mammo connects its key teaching points to the source used to support them, so you can check the original guidance for yourself. Some sources can only be linked;
        in those cases Mammo explains the fact in original wording and sends you to the source for the official text.
      </p>
      <ul className="space-y-3">
        {content.sources.map((s) => (
          <li key={s.id} className="rounded-xl border p-3">
            <p className="font-medium">{s.title}</p>
            <p className="text-sm text-muted-foreground">
              {s.publisher} · {RIGHTS_LABELS[s.rights.status]} · {SOURCE_STATUS_LABELS[s.retrievalStatus]}
              {s.retrievedOn ? ` on ${s.retrievedOn}` : ""}
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
