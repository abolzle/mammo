"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/components/app-provider";
import { validateImportedJson } from "@/lib/content/validate";
import { question as questionSchema } from "@/lib/schemas/content";
import { coverageMatrix, sourceBreakdown } from "@/lib/content/coverage";

export default function MaintainerPage() {
  const { content, ready } = useApp();
  const [draft, setDraft] = useState("");
  const [result, setResult] = useState<string>("");
  const [packet, setPacket] = useState("");

  useEffect(() => {
    void fetch("/content/pipeline/generate.md")
      .then((r) => (r.ok ? r.text() : ""))
      .then((t) => setPacket(t));
  }, []);

  if (!ready || !content) return <p>Loading…</p>;
  const rows = coverageMatrix(content.curriculum, content.modules);
  const breakdown = sourceBreakdown(content.curriculum);
  const gaps = rows.filter((r) => r.gap);

  function inspect() {
    const parsed = validateImportedJson(draft);
    if (!parsed.ok) {
      setResult(parsed.issues.map((i) => i.message).join("\n"));
      return;
    }
    const q = questionSchema.safeParse(parsed.data);
    if (!q.success) {
      setResult(q.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n"));
      return;
    }
    setResult(`OK: ${q.data.id} key=${q.data.correctChoiceId} pool=${q.data.pool} status=${q.data.review.status}`);
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl text-navy">Content workshop</h1>
      <p className="text-sm text-muted-foreground">
        Local maintainer tools. This page is not authentication and cannot publish content. Paste JSON, validate it, and download files for a repository review. AI adapters stay off unless you paste into an external tool yourself.
      </p>
      <section>
        <h2 className="font-heading text-lg">Coverage</h2>
        <p className="text-sm">
          {rows.length} objectives · {rows.filter((r) => r.lessonIds.length).length} with lessons · {gaps.length} with gaps
        </p>
        <ul className="mt-2 text-sm">
          <li>Public-domain / open-backed: {breakdown.public_domain_open}</li>
          <li>Link-only: {breakdown.link_only}</li>
          <li>Needs clinical review (flagged): {breakdown.needs_clinical_review}</li>
          <li>Truly blocked: {breakdown.truly_blocked}</li>
          <li>Needs source retrieval: {breakdown.needs_source}</li>
        </ul>
      </section>
      <section className="space-y-2">
        <h2 className="font-heading text-lg">Validate a drafted question</h2>
        <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} className="min-h-40 font-mono text-xs" />
        <Button className="min-h-11" onClick={inspect}>
          Validate JSON
        </Button>
        {result ? <pre className="overflow-auto rounded-md bg-muted p-3 text-xs">{result}</pre> : null}
      </section>
      <section className="space-y-2">
        <h2 className="font-heading text-lg">Prompt templates</h2>
        <p className="text-sm">
          Copy <a className="text-teal underline" href="/content/pipeline/generate.md">generate.md</a> and{" "}
          <a className="text-teal underline" href="/content/pipeline/critique.md">critique.md</a> into any chat tool. Drafts must cite evidence IDs from the packet.
        </p>
        {packet ? <pre className="max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs">{packet.slice(0, 1200)}</pre> : null}
      </section>
      <Button
        variant="outline"
        className="min-h-11"
        onClick={() => {
          const blob = new Blob([JSON.stringify({ rows, breakdown }, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "coverage.json";
          a.click();
        }}
      >
        Download coverage JSON
      </Button>
    </div>
  );
}
