"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/components/app-provider";
import { parseDraftJson, buildGeneratePacket } from "@/lib/content/packet";
import { coverageMatrix, sourceBreakdown } from "@/lib/content/coverage";

export default function MaintainerPage() {
  const { content, ready } = useApp();
  const [draft, setDraft] = useState("");
  const [result, setResult] = useState<string>("");
  const [packet, setPacket] = useState("");
  const [objId, setObjId] = useState("");

  useEffect(() => {
    void fetch("/content/pipeline/generate.md")
      .then((r) => (r.ok ? r.text() : ""))
      .then((t) => setPacket(t));
  }, []);

  if (!ready || !content) return <p>Loading…</p>;
  const rows = coverageMatrix(content.curriculum, content.modules, {
    moduleCoverage: content.moduleCoverage,
    evidence: content.evidence,
    sources: content.sources,
  });
  const breakdown = sourceBreakdown(content.curriculum);
  const gaps = rows.filter((r) => r.gap);

  function inspect() {
    const parsed = parseDraftJson(draft);
    if (!parsed.ok) {
      setResult(parsed.issues.join("\n"));
      return;
    }
    const id = (parsed.data as { id: string }).id;
    setResult(`OK ${parsed.kind}: ${id}. Validated locally. Copy into content/modules only after a source check. This does not publish.`);
  }

  function downloadPacket() {
    if (!content) return;
    const ids = objId.trim() ? [objId.trim()] : content.curriculum.objectives.filter((o) => o.sourceState === "source_backed_open").map((o) => o.id);
    const text = buildGeneratePacket(
      { sources: content.sources, evidence: content.evidence, curriculum: content.curriculum },
      ids,
      packet || "# Generation packet\n\n## Evidence\nPaste authorized evidence records here.\n\n## Objectives\nPaste objective ids and statements here.\n",
    );
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = objId.trim() ? `generate-${objId.trim()}.md` : "generate-open-objectives.md";
    a.click();
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
          {rows.length} objectives · {rows.filter((r) => r.lessonIds.length).length} with lessons · {rows.filter((r) => r.complete).length} complete · {gaps.length} with gaps
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
        <label className="block text-sm">
          Objective id (optional)
          <input
            className="mt-1 min-h-11 w-full rounded-md border px-3"
            value={objId}
            onChange={(e) => setObjId(e.target.value)}
            placeholder="obj-mqsa-certification"
          />
        </label>
        <Button variant="outline" className="min-h-11" onClick={downloadPacket}>
          Download filled generation packet
        </Button>
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
