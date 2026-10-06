import { EXAM } from "@/config/exam";
import type { AssembledContent, Issue } from "./assemble";

const UNSAFE_PATTERNS: [RegExp, string][] = [
  [/<\s*\/?\s*[a-z!][^>]*>/i, "HTML tags are not allowed in content text"],
  [/javascript\s*:/i, "javascript: URLs are not allowed"],
  [/\bon[a-z]+\s*=/i, "Inline event handler syntax is not allowed"],
  [/data\s*:\s*text\/html/i, "data:text/html URLs are not allowed"],
];

/** Claims Mammo must never make. Matched case-insensitively against learner-visible text. */
const PROHIBITED_CLAIMS: [RegExp, string][] = [
  [/guarantee[sd]?\s+(?:a\s+|that\s+you\s+)?pass/i, "Pass guarantees are prohibited"],
  [/pass(?:ing)?\s+probability|chance\s+of\s+passing/i, "Pass probabilities are prohibited without external validation"],
  [/\b75\s*%\s*(?:correct|to pass)|passing score of 75\s*%/i, "ARRT's scaled score of 75 is not 75% correct"],
  [/\b(?:actual|real|recalled|leaked)\s+(?:arrt\s+)?exam\s+questions?\b/i, "Claims about real or recalled exam questions are prohibited"],
  [/\b(?:arrt|acr|fda)[-\s](?:approved|endorsed|certified)\s+(?:course|app|content|questions)/i, "Endorsement claims are prohibited"],
  [/\bclinically\s+(?:validated|verified)\b/i, "Do not claim clinical validation in content text"],
];

/** Common unit slips: a number glued to a unit, or nonstandard dose spellings. */
const UNIT_PATTERNS: [RegExp, string][] = [
  [/\d(?:mGy|mSv|mAs|kVp|cm|mm|N|lb)\b/, "Put a space between a number and its unit"],
  [/\bmgy\b|\bMGy\b/, "Use mGy for milligray"],
  [/\bkvp\b|\bKVP\b/, "Use kVp"],
  [/\bmas\b/, "Use mAs"],
];

export function scanText(value: unknown, itemId: string, issues: Issue[], path = ""): void {
  if (typeof value === "string") {
    for (const [re, msg] of UNSAFE_PATTERNS) if (re.test(value)) issues.push({ level: "error", itemId, code: "unsafe_text", message: `${path}: ${msg}` });
    for (const [re, msg] of PROHIBITED_CLAIMS) if (re.test(value)) issues.push({ level: "error", itemId, code: "prohibited_claim", message: `${path}: ${msg}` });
    for (const [re, msg] of UNIT_PATTERNS) if (re.test(value)) issues.push({ level: "warning", itemId, code: "units", message: `${path}: ${msg}` });
    return;
  }
  if (Array.isArray(value)) value.forEach((v, i) => scanText(v, itemId, issues, `${path}[${i}]`));
  else if (value && typeof value === "object")
    for (const [k, v] of Object.entries(value)) {
      // Source URLs, IDs and asset paths are not rendered as prose.
      if (k === "url" || k === "src" || k === "blockedUrls" || k === "id") continue;
      scanText(v, itemId, issues, path ? `${path}.${k}` : k);
    }
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export function validateContent(c: AssembledContent): Issue[] {
  const issues: Issue[] = [];
  const err = (itemId: string, code: string, message: string) => issues.push({ level: "error", itemId, code, message });
  const warn = (itemId: string, code: string, message: string) => issues.push({ level: "warning", itemId, code, message });

  const seen = new Map<string, string>();
  const claimId = (id: string, kind: string) => {
    if (seen.has(id)) err(id, "duplicate_id", `ID already used by a ${seen.get(id)}`);
    else seen.set(id, kind);
  };

  const sourceById = new Map(c.sources.map((s) => [s.id, s]));
  const evidenceById = new Map(c.evidence.map((e) => [e.id, e]));
  const objectiveById = new Map(c.curriculum.objectives.map((o) => [o.id, o]));
  const topicById = new Map(c.curriculum.topics.map((t) => [t.id, t]));
  c.sources.forEach((s) => claimId(s.id, "source"));
  c.evidence.forEach((e) => claimId(e.id, "evidence record"));
  c.curriculum.topics.forEach((t) => claimId(t.id, "topic"));
  c.curriculum.objectives.forEach((o) => claimId(o.id, "objective"));

  // Sources & evidence
  for (const s of c.sources) {
    if (s.retrievalStatus === "retrieved" && !s.retrievedOn) err(s.id, "retrieval", "Retrieved sources need a retrieval date");
    if (s.rights.basisSourceId && !sourceById.has(s.rights.basisSourceId)) err(s.id, "reference", `Unknown rights basis ${s.rights.basisSourceId}`);
  }
  for (const e of c.evidence) {
    const s = sourceById.get(e.sourceId);
    if (!s) {
      err(e.id, "reference", `Unknown source ${e.sourceId}`);
      continue;
    }
    if (e.excerpt && !s.rights.canQuote) err(e.id, "rights", `${s.id} does not permit quoting; restate the fact and cite link-only`);
    if (e.citation === "quoted_public" && !e.excerpt) err(e.id, "evidence", "quoted_public evidence needs the excerpt that supports it");
    if (s.retrievalStatus === "blocked" || s.retrievalStatus === "not_attempted")
      err(e.id, "evidence", `Evidence cites ${s.id}, which was never retrieved (${s.retrievalStatus})`);
    scanText({ claim: e.claim, scope: e.scope, exceptions: e.exceptions }, e.id, issues);
  }

  // Curriculum
  const domainIds = new Set(EXAM.domains.map((d) => d.id));
  const subIds = new Set(EXAM.domains.flatMap((d) => d.subdomains.map((s) => s.id)));
  for (const t of c.curriculum.topics) {
    if (!domainIds.has(t.domainId)) err(t.id, "reference", `Unknown domain ${t.domainId}`);
    if (!subIds.has(t.subdomainId)) err(t.id, "reference", `Unknown subdomain ${t.subdomainId}`);
  }
  for (const o of c.curriculum.objectives) {
    if (!topicById.has(o.topicId)) err(o.id, "reference", `Unknown topic ${o.topicId}`);
    for (const p of o.prerequisites) if (!objectiveById.has(p)) err(o.id, "reference", `Unknown prerequisite ${p}`);
    for (const s of o.sourceIds) if (!sourceById.has(s)) err(o.id, "reference", `Unknown source ${s}`);
    if (o.sourceState === "blocked" && !(o.blockedUrls?.length && o.blockedNote)) err(o.id, "blocked", "Blocked objectives must list the URLs needed and why");
    if (o.sourceState.startsWith("source_backed") && o.sourceIds.length === 0) err(o.id, "source", "Source-backed objectives need at least one source");
  }
  // Prerequisite cycles
  const state = new Map<string, 0 | 1 | 2>();
  const visit = (id: string, stack: string[]) => {
    if (state.get(id) === 2) return;
    if (state.get(id) === 1) {
      err(id, "prerequisite_cycle", `Cycle: ${[...stack, id].join(" → ")}`);
      return;
    }
    state.set(id, 1);
    for (const p of objectiveById.get(id)?.prerequisites ?? []) visit(p, [...stack, id]);
    state.set(id, 2);
  };
  c.curriculum.objectives.forEach((o) => visit(o.id, []));

  const checkEvidence = (itemId: string, ids: string[], objectiveIds: string[]) => {
    for (const id of ids) if (!evidenceById.has(id)) err(itemId, "missing_citation", `Unknown evidence ${id}`);
    for (const oid of objectiveIds) {
      const o = objectiveById.get(oid);
      if (!o) err(itemId, "reference", `Unknown objective ${oid}`);
      else if (o.sourceState === "blocked" || o.sourceState === "needs_source")
        err(itemId, "unsourced_objective", `Objective ${oid} is ${o.sourceState}; content cannot be published for it yet`);
    }
  };

  const stems = new Map<string, string>();
  const familyPools = new Map<string, Set<string>>();

  for (const m of c.modules) {
    claimId(m.id, "module");
    for (const t of m.topicIds) if (!topicById.has(t)) err(m.id, "reference", `Unknown topic ${t}`);
    const qById = new Map(m.questions.map((q) => [q.id, q]));
    const assetById = new Map(m.assets.map((a) => [a.id, a]));

    for (const l of m.lessons) {
      claimId(l.id, "lesson");
      if (l.moduleId !== m.id) err(l.id, "reference", `moduleId ${l.moduleId} does not match ${m.id}`);
      checkEvidence(l.id, l.evidenceIds, [l.objectiveId]);
      const check = qById.get(l.checkQuestionId);
      if (!check) err(l.id, "reference", `Unknown check question ${l.checkQuestionId}`);
      else if (check.pool !== "practice") err(l.id, "family_separation", "A lesson check question cannot come from a reserved form");
      scanText(l, l.id, issues);
    }

    const positions: Record<string, number> = { a: 0, b: 0, c: 0, d: 0 };
    for (const q of m.questions) {
      claimId(q.id, "question");
      checkEvidence(q.id, q.evidenceIds, q.objectiveIds);
      const ids = q.choices.map((ch) => ch.id);
      if (new Set(ids).size !== 4 || ids.join("") !== "abcd") err(q.id, "choices", "Choices must be exactly a, b, c, d in order");
      if (!ids.includes(q.correctChoiceId)) err(q.id, "key", `Key ${q.correctChoiceId} is not a choice`);
      const texts = q.choices.map((ch) => norm(ch.text));
      if (new Set(texts).size !== texts.length) err(q.id, "choices", "Two choices have the same text");
      if (q.assetId && !assetById.has(q.assetId)) err(q.id, "reference", `Unknown asset ${q.assetId}`);
      if (q.kind === "visual" && !q.assetId) err(q.id, "reference", "Visual questions need an asset");
      for (const k of q.keyHistory) if (k.revision >= q.revision) err(q.id, "key_history", "Key history entries must predate the current revision");
      const n = norm(q.stem);
      if (stems.has(n)) err(q.id, "duplicate", `Stem duplicates ${stems.get(n)}`);
      stems.set(n, q.id);
      if (!familyPools.has(q.familyId)) familyPools.set(q.familyId, new Set());
      familyPools.get(q.familyId)!.add(q.pool);
      positions[q.correctChoiceId] = (positions[q.correctChoiceId] ?? 0) + 1;
      const correctLen = q.choices.find((ch) => ch.id === q.correctChoiceId)?.text.length ?? 0;
      if (correctLen > 40 && q.choices.every((ch) => ch.id === q.correctChoiceId || ch.text.length * 1.8 < correctLen))
        warn(q.id, "cueing", "The key is much longer than every distractor, which can cue the answer");
      scanText(q, q.id, issues);
    }
    const total = m.questions.length;
    if (total >= 20)
      for (const [pos, count] of Object.entries(positions))
        if (count / total > 0.4 || count / total < 0.1) warn(m.id, "key_balance", `Key position ${pos} is used for ${count}/${total} questions`);

    for (const card of m.cards) {
      claimId(card.id, "card");
      checkEvidence(card.id, card.evidenceIds, [card.objectiveId]);
      scanText(card, card.id, issues);
    }
    for (const a of m.assets) {
      claimId(a.id, "asset");
      for (const id of a.evidenceIds) if (!evidenceById.has(id)) err(a.id, "missing_citation", `Unknown evidence ${id}`);
      if (a.kind === "svg_schematic" && !a.isSchematic) err(a.id, "asset", "SVG schematics must be marked as schematic");
      if (a.modality === "screen_film_historical" && !/film|historical/i.test(a.title + a.alt)) err(a.id, "asset", "Historical film images must say so");
      scanText({ title: a.title, alt: a.alt, longDescription: a.longDescription }, a.id, issues);
    }
    for (const v of m.visuals) {
      claimId(v.id, "visual exercise");
      checkEvidence(v.id, v.evidenceIds, [v.objectiveId]);
      if (!assetById.has(v.assetId)) err(v.id, "reference", `Unknown asset ${v.assetId}`);
      const hs = v.hotspots.map((h) => h.id);
      if (!hs.includes(v.correctHotspotId)) err(v.id, "key", "Correct hotspot is not one of the hotspots");
      for (const h of hs) if (!v.feedback[h]) err(v.id, "feedback", `Hotspot ${h} has no feedback`);
      const a = assetById.get(v.assetId);
      if (a) for (const h of v.hotspots) if (h.x < 0 || h.y < 0 || h.x + h.w > a.width || h.y + h.h > a.height) err(v.id, "hotspot", `Hotspot ${h.id} falls outside the asset`);
      const revealing = v.hotspots.find((h) => norm(h.neutralLabel).includes(norm(h.revealLabel)));
      if (revealing) err(v.id, "accessibility", `Neutral label for ${revealing.id} reveals the answer`);
      scanText(v, v.id, issues);
    }
    for (const g of m.glossary) for (const id of g.evidenceIds) if (!evidenceById.has(id)) err(m.id, "missing_citation", `Glossary "${g.term}" cites unknown ${id}`);
  }

  for (const [fam, pools] of familyPools)
    if (pools.size > 1) err(fam, "family_separation", `Family spans pools ${[...pools].join(", ")}; reserved forms would leak into daily study`);

  return issues;
}
