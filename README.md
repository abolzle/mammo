# Mammo

Free study software for people preparing for the U.S. ARRT Mammography certification examination. No account, no paywall, no live AI calls while studying.

This repository currently ships **Stage 1**: the learner app, local progress, and one complete MQSA module (lessons, recall cards, ~48 questions, schematic visuals) plus a full curriculum map. It is a public **beta**. Material is AI-assisted and source-backed from federal rules; it is **not independently clinically validated**. Practice scores are not ARRT scaled scores and are not pass probabilities.

## Run locally

```bash
npm install
npm run content:assemble
npm run dev
```

Open [http://127.0.0.1:43147](http://127.0.0.1:43147). Studying starts on Today. Optional onboarding can be skipped.

```bash
npm test              # schema, planner, backup, resume unit tests
npm run content:validate
npm run content:packet -- --objective obj-mqsa-certification
npm run typecheck
npx playwright test   # core journey (install browsers once with npx playwright install)
```

Static export:

```bash
npm run build         # writes `out/`
```

Serve `out/` with any static host. The app uses IndexedDB on the learner's device. There is no server database.

## What works now

- Today / Learn / Practice / Progress, plus About, Requirements, Sources, Reference, Settings
- Daily sessions sized to 5/10/15/20 minutes, with a five-minute option
- Session player with explanations, source drawer, refresh/resume, no duplicate answer events
- Spaced recall via [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) (fuzz off for determinism)
- Short beta quizzes; study mode vs test mode
- JSON backup/import with merge (duplicate events skipped)
- Service worker cache of the shell, MQSA JSON, and schematic SVGs
- Maintainer workshop: coverage, paste-in JSON validation, filled generation packets, generation/critique prompt templates
- IndexedDB schema v2 (status/session/due indexes) with additive migrations

## What is not claimed

- Effectiveness or sufficiency for passing the registry exam
- A clinically reviewed question pool (none yet)
- Full-length 145-item simulation (the bank is too small; the UI says so)
- Cross-device sync
- Secure proctored testing (answers ship with the static site)

## Zero-budget hosting

Any static host works (GitHub Pages, Cloudflare Pages, Netlify, or an `npx serve out` folder). Check the host's current free-tier terms before promising a public pilot. Do not enable paid analytics, auth, or databases by default.

Optional future sync would be a replaceable adapter; local mode must remain complete.

## Content rights

Facts may be taught in original wording. Restricted sources are **link-only**. An objective is **blocked** only when no accessible source verifies the fact. Review status (draft / auto-checked / source-checked / clinically reviewed) is separate from blocked.

Do not add leaked exam items, copied commercial banks, or patient images.

## Layout

- `content/` — exam-aligned curriculum, source register, evidence, MQSA module, pipeline prompts
- `content/drafts/` — validated unpublished imports (`npm run content:import`)
- `public/content/` — assembled JSON produced by `npm run content:assemble`
- `src/lib` — schemas, validator, IndexedDB, study engine
- `docs/CHECKLIST.md` — completed vs remaining work
- `docs/COVERAGE.md` — generated coverage matrix
