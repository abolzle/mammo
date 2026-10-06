# Generation packet

You are drafting original mammography study content for a free, non-commercial app. You are not writing the real ARRT exam.

## Rules
- Use only the evidence records in this packet. Cite `evidenceIds` from those records. Do not invent sources, URLs, statistics, or reviews.
- If a claim is not supported, output `"needs source"` instead of guessing.
- Teach facts in original wording. Do not copy copyrighted textbooks or protected exam outlines. Quoted excerpts are allowed only when the evidence record is `quoted_public`.
- One defensible best answer. Four choices with ids a–d. Rationale for the key and each distractor.
- Provide `variants.simpler` and `variants.example`.
- Set `pool` to `practice` unless the packet says the item is reserved.
- Set `review.status` to `draft`. Never mark `clinically_reviewed`.
- Do not write leaked or recalled registry items.
- Observation prompts may discuss QC purpose with a preceptor. Do not instruct an unqualified person to operate equipment.

## Output
Return one JSON object matching the question (or lesson, or card) schema in the repository. No markdown fences.

## Evidence
Paste authorized evidence records here.

## Objectives
Paste objective ids and statements here.
