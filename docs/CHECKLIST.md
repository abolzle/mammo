# Implementation checklist

Keep this file current. A missing asset or unresolved source is a gap, not a completed lesson.

## Stage 1 — software and first module (this build)

- [x] Typed schemas (exam, curriculum, sources, evidence, lessons, questions, cards, visuals, learner progress)
- [x] Versioned exam configuration (blueprint 2025-09-01; research 2026-09-29; verified 2026-10-06)
- [x] Full curriculum map with sourceState
- [x] MQSA module: 12 lessons, 45 cards, 48 questions (38 practice / 10 form-a), 4 schematic visual exercises
- [x] Content validator, assembler, coverage matrix
- [x] Static-export Next.js app; no login; no live AI
- [x] IndexedDB + schema version 2 (additive indexes; v1 guests upgrade)
- [x] Today / Learn / Practice / Progress
- [x] Session player with refresh/resume and idempotent events
- [x] Spaced review (ts-fsrs)
- [x] Short beta quizzes; honest refusal of 145-item simulation, 30-item baseline, and 60-item checkpoint
- [x] Backup/import (merge and replace)
- [x] Generation and critique prompt templates plus filled packet export / draft import
- [x] Service worker offline cache for shell + MQSA assets
- [x] Unit tests for validation, family separation, time budget, resume, backup, coverage, key correction
- [x] README and this checklist
- [x] Generated `docs/COVERAGE.md`

## Intentionally not taken from `stage1-first-builder`

- MQSA `questions.json` / `module.json` rewrite (main already validates; do not overwrite)
- Parallel IndexedDB schema (`attempts` / `cardStates`) that would drop guest progress on main

## Content needing review (not done)

- [ ] Maintainer source-check worksheet: [docs/source-check-worksheet.md](./source-check-worksheet.md) — 18 objectives with lesson/cards/practice/Form A already citing retrieved evidence, but curriculum `sourceState` still `needs_source`. Aaron marks Confirm / Reject / Needs more source; a follow-up commit flips status (do not flip in the worksheet PR). Regenerate: `npx tsx scripts/gen-source-check-worksheet.ts`
- [ ] Maintainer source-check of MQSA excerpts against eCFR
- [ ] Qualified clinical review of dose, compression force, and equipment items
- [ ] BI-RADS lexicon objective (`obj-ap-lexicon-masses-calcs`) — truly blocked until an accessible source is read
- [ ] CC/MLO positioning criteria (`obj-pp-cc`, `obj-pp-mlo`) — truly blocked pending ACR clinical image quality manual or equivalent

## Stage 2+ (do not start until Stage 1 is accepted)

- [x] Patient-care module batch (`mod-patient-care`): 12 lessons, 35 cards, 48 questions (43 practice / 5 form-a), 4 schematic visuals — AI-assisted, auto_checked beta; not clinically reviewed
- [ ] Content batches for remaining source-backed-open and needs-source objectives
- [x] Two distinct full-length forms (Form A and Form B) with family separation; Practice lets learners choose which form to take for baseline, checkpoint, and full simulation
- [x] Practice page: topic and mixed quizzes (study or test mode), 30-question baseline, 60-question checkpoint, and full 145-question / 150-minute simulation, each assembled from the chosen reserved form (A or B) by blueprint allocation and family separation; options switch on automatically when that form's bank supports them, otherwise a per-area shortfall and the largest valid shorter option are shown; daily study excludes both form pools' families; retakes of the same form stay labeled
- [x] Test mode: feedback hidden until submit, flags and review grid, autosave, wall-clock timer across refresh/backgrounding with submit on expiry, answer required before advancing in full simulation; untimed and extended-time accommodations labeled non-standard
- [x] Results: headline on scored items only, pilots revealed after submit, domain counts, topic gaps, time, confidence calibration, first exposure vs repeat, "Limited evidence" under 20 items, retakes labeled
- [ ] Optional replaceable sync adapter (local mode remains complete)
- [ ] Hosting-term check immediately before any public deploy
