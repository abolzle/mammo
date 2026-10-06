# Implementation checklist

Keep this file current. A missing asset or unresolved source is a gap, not a completed lesson.

## Stage 1 — software and first module (this build)

- [x] Typed schemas (exam, curriculum, sources, evidence, lessons, questions, cards, visuals, learner progress)
- [x] Versioned exam configuration (blueprint 2025-09-01; research 2026-09-29; verified 2026-10-06)
- [x] Full curriculum map with sourceState
- [x] MQSA module: 12 lessons, 45 cards, 48 questions (38 practice / 10 form-a), 4 schematic visual exercises
- [x] Content validator, assembler, coverage matrix
- [x] Static-export Next.js app; no login; no live AI
- [x] IndexedDB + schema version 1
- [x] Today / Learn / Practice / Progress
- [x] Session player with refresh/resume and idempotent events
- [x] Spaced review (ts-fsrs)
- [x] Short beta quizzes; honest refusal of 145-item simulation
- [x] Backup/import
- [x] Generation and critique prompt templates
- [x] Service worker offline cache for shell + MQSA assets
- [x] Unit tests for validation, family separation, time budget, resume, backup, coverage
- [x] README and this checklist

## Content needing review (not done)

- [ ] Maintainer source-check of MQSA excerpts against eCFR
- [ ] Qualified clinical review of dose, compression force, and equipment items
- [ ] BI-RADS lexicon objective (`obj-ap-lexicon-masses-calcs`) — truly blocked until an accessible source is read
- [ ] CC/MLO positioning criteria (`obj-pp-cc`, `obj-pp-mlo`) — truly blocked pending ACR clinical image quality manual or equivalent

## Stage 2+ (do not start until Stage 1 is accepted)

- [ ] Content batches for remaining source-backed-open and needs-source objectives
- [ ] Two distinct full-length forms when the bank supports 115+30 with family separation
- [ ] 30-question baseline and 60-question checkpoint as honest sizes
- [ ] Optional replaceable sync adapter (local mode remains complete)
- [ ] Hosting-term check immediately before any public deploy
