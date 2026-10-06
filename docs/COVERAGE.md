# Coverage report

Generated 2026-10-06 by `npm run content:assemble`. Do not treat completeness as clinical review.

An objective is **complete** when it is source-backed and has a lesson, recall cards, at least 3 learner-visible practice questions, and at least one learner-visible assessment-form item, counting only items whose evidence resolves to a registered, retrieved (or link-only) source. Links come from item objective ids plus each module's `coverage.json`; module `curriculumFollowUps` are applied to source states.

## Totals

| Measure | Current | Production target |
|---|---|---|
| Objectives complete | 27 / 79 | all |
| Micro-lessons | 91 | 60–80 |
| Recall cards | 275 | 200+ |
| Practice questions | 375 | ~800 incl. two full forms |
| Reserved-form questions | 291 | two full forms |
| Visual exercises | 32 | — |

Source state: 34 open/public-domain, 3 link-only, 39 need a source, 3 blocked.

## Complete objectives by domain

| Domain | Complete | Objectives |
|---|---|---|
| dom-patient-care | 2 | 19 |
| dom-image-production | 18 | 34 |
| dom-procedures | 7 | 26 |

## Blocked objectives and the URLs needed

- `obj-ap-lexicon-masses-calcs`: Descriptor definitions require the ACR BI-RADS Atlas (commercial; not accessible to this pipeline) or an accessible secondary source. Radiopaedia returned HTTP 406 to automated retrieval. Once a maintainer reads an accessible source, facts can be taught in original wording with a link-only citation. https://www.acr.org/Clinical-Resources/Clinical-Tools-and-Reference/Reporting-and-Data-Systems/BI-RADS, https://radiopaedia.org/articles/breast-imaging-reporting-and-data-system-bi-rads
- `obj-pp-cc`: ARRT names the ACR Clinical Image Quality manual (1999) as the positioning reference. No accessible copy or equivalent open source has been located; a maintainer must obtain it (link-only citation is fine) or identify an accessible equivalent such as ACR accreditation positioning guidance. https://www.acr.org/Accreditation/Mammography, https://www.acr.org/Clinical-Resources/Clinical-Tools-and-Reference/Practice-Parameters-and-Technical-Standards
- `obj-pp-mlo`: Same reference gap as the CC objective. https://www.acr.org/Accreditation/Mammography

## Objective matrix

| Objective | Source | Lessons | Cards | Practice | Form | Visuals | Gap |
|---|---|---|---|---|---|---|---|
| `obj-pc-pre-exam-instructions` | needs_source | 1 | 3 | 4 | 2 | 0 | needs source retrieval before a lesson can be written |
| `obj-pc-rapport-support` | needs_source | 1 | 1 | 3 | 2 | 0 | needs source retrieval before a lesson can be written |
| `obj-pc-explain-compression` | needs_source | 2 | 3 | 7 | 6 | 0 | needs source retrieval before a lesson can be written |
| `obj-pc-explain-repeat` | needs_source | 1 | 1 | 3 | 1 | 0 | needs source retrieval before a lesson can be written |
| `obj-pc-screening-guidelines` | needs_source | 1 | 5 | 5 | 9 | 0 | needs source retrieval before a lesson can be written |
| `obj-pc-bse-cbe` | needs_source | 0 | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-pc-typical-dose` | needs_source | 1 | 6 | 3 | 7 | 1 | needs source retrieval before a lesson can be written |
| `obj-pc-modalities` | needs_source | 1 | 2 | 3 | 2 | 0 | needs source retrieval before a lesson can be written |
| `obj-pc-results-pathway` | source_backed_open | 1 | 3 | 8 | 8 | 0 |  |
| `obj-pc-additional-imaging` | source_backed_open | 1 | 2 | 5 | 2 | 0 |  |
| `obj-pc-clinician-role` | needs_source | 0 | 1 | 5 | 3 | 1 | needs source retrieval before a lesson can be written |
| `obj-pc-epidemiology` | needs_source | 0 | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-pc-inherent-risk` | needs_source | 0 | 3 | 1 | 4 | 0 | needs source retrieval before a lesson can be written |
| `obj-pc-social-risk` | needs_source | 0 | 0 | 0 | 1 | 0 | needs source retrieval before a lesson can be written |
| `obj-pc-signs-symptoms` | needs_source | 0 | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-pc-history-documentation` | needs_source | 0 | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-pc-prior-images` | source_backed_open | 0 | 2 | 5 | 2 | 0 | missing lesson |
| `obj-pc-surgical-options` | needs_source | 0 | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-pc-nonsurgical-options` | needs_source | 0 | 0 | 0 | 1 | 0 | needs source retrieval before a lesson can be written |
| `obj-ip-kvp-tube` | needs_source | 1 | 5 | 0 | 1 | 0 | needs source retrieval before a lesson can be written |
| `obj-ip-paddles-grids` | source_backed_open | 1 | 4 | 5 | 3 | 0 |  |
| `obj-ip-geometry` | needs_source | 1 | 2 | 0 | 3 | 0 | needs source retrieval before a lesson can be written |
| `obj-ip-unit-components` | source_backed_open | 1 | 3 | 5 | 0 | 2 | no assessment-form item |
| `obj-ip-acquisition-types` | needs_source | 1 | 4 | 4 | 1 | 1 | needs source retrieval before a lesson can be written |
| `obj-ip-receptors-monitors` | needs_source | 2 | 4 | 5 | 1 | 0 | needs source retrieval before a lesson can be written |
| `obj-ip-informatics` | source_backed_open | 4 | 15 | 17 | 0 | 2 | no assessment-form item |
| `obj-ip-cad` | source_backed_open | 2 | 8 | 10 | 0 | 1 | no assessment-form item |
| `obj-mqsa-certification` | source_backed_open | 2 | 6 | 6 | 5 | 0 |  |
| `obj-mqsa-image-review-equip` | source_backed_open | 4 | 14 | 18 | 8 | 1 |  |
| `obj-mqsa-rt-initial` | source_backed_open | 1 | 4 | 5 | 5 | 0 |  |
| `obj-mqsa-rt-continuing` | source_backed_open | 2 | 9 | 9 | 10 | 0 |  |
| `obj-mqsa-qa-roles` | source_backed_open | 2 | 7 | 9 | 4 | 0 |  |
| `obj-mqsa-report-assessment` | source_backed_open | 1 | 3 | 4 | 4 | 0 |  |
| `obj-mqsa-results-communication` | source_backed_open | 1 | 2 | 4 | 0 | 1 | no assessment-form item |
| `obj-mqsa-density-reporting` | source_backed_open | 1 | 4 | 7 | 4 | 2 |  |
| `obj-mqsa-image-labeling` | source_backed_open | 3 | 5 | 12 | 5 | 2 |  |
| `obj-mqsa-records-transfer` | source_backed_open | 3 | 10 | 13 | 5 | 2 |  |
| `obj-mqsa-outcomes-audit` | source_backed_open | 1 | 2 | 3 | 8 | 0 |  |
| `obj-mqsa-required-policies` | source_backed_open | 3 | 7 | 11 | 5 | 2 |  |
| `obj-mqsa-equipment-qc` | source_backed_open | 2 | 11 | 11 | 9 | 1 |  |
| `obj-qc-phantom` | source_backed_open | 1 | 6 | 7 | 1 | 0 |  |
| `obj-qc-compression-tests` | source_backed_open | 1 | 4 | 4 | 1 | 1 |  |
| `obj-qc-visual-checklist` | source_backed_open | 1 | 2 | 4 | 0 | 0 | no assessment-form item |
| `obj-qc-monitors-viewing` | source_backed_open | 2 | 7 | 9 | 0 | 0 | no assessment-form item |
| `obj-qc-repeat-analysis` | source_backed_open | 1 | 2 | 4 | 2 | 0 |  |
| `obj-qc-detector-calibration` | source_backed_open | 1 | 2 | 4 | 0 | 1 | no assessment-form item |
| `obj-qc-physicist-survey` | source_backed_open | 1 | 4 | 3 | 2 | 0 |  |
| `obj-qc-physicist-tests` | source_backed_open | 1 | 5 | 4 | 0 | 0 | no assessment-form item |
| `obj-ip-exposure-factors` | needs_source | 1 | 3 | 2 | 1 | 0 | needs source retrieval before a lesson can be written |
| `obj-ip-thickness-target-filter` | needs_source | 1 | 1 | 1 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-ip-magnification-technique` | needs_source | 1 | 2 | 1 | 1 | 1 | needs source retrieval before a lesson can be written |
| `obj-ip-image-quality-attributes` | source_backed_open | 1 | 7 | 9 | 6 | 0 |  |
| `obj-ip-patient-artifacts` | needs_source | 0 | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-ap-clock-quadrants` | needs_source | 1 | 4 | 5 | 8 | 1 | needs source retrieval before a lesson can be written |
| `obj-ap-triangulation` | source_backed_link_only | 1 | 2 | 4 | 0 | 0 | no assessment-form item |
| `obj-ap-external-landmarks` | needs_source | 1 | 3 | 4 | 3 | 0 | needs source retrieval before a lesson can be written |
| `obj-ap-internal-structures` | needs_source | 1 | 3 | 4 | 11 | 1 | needs source retrieval before a lesson can be written |
| `obj-ap-tdlu` | needs_source | 1 | 3 | 4 | 8 | 1 | needs source retrieval before a lesson can be written |
| `obj-ap-cytology` | needs_source | 1 | 2 | 4 | 7 | 0 | needs source retrieval before a lesson can be written |
| `obj-ap-lexicon-masses-calcs` | blocked | 0 | 2 | 3 | 6 | 0 | blocked: no accessible source verifies the fact |
| `obj-ap-assessment-density-categories` | source_backed_open | 2 | 6 | 11 | 20 | 1 |  |
| `obj-ap-benign-conditions` | needs_source | 1 | 2 | 5 | 8 | 0 | needs source retrieval before a lesson can be written |
| `obj-ap-high-risk-lesions` | needs_source | 1 | 2 | 4 | 11 | 0 | needs source retrieval before a lesson can be written |
| `obj-ap-malignant` | needs_source | 1 | 4 | 5 | 16 | 0 | needs source retrieval before a lesson can be written |
| `obj-pp-cc` | blocked | 0 | 3 | 7 | 6 | 1 | blocked: no accessible source verifies the fact |
| `obj-pp-mlo` | blocked | 1 | 2 | 6 | 3 | 1 | blocked: no accessible source verifies the fact |
| `obj-pp-lateral-views` | source_backed_link_only | 1 | 3 | 5 | 1 | 0 |  |
| `obj-pp-exaggerated-cleavage-at` | source_backed_open | 1 | 4 | 5 | 1 | 1 |  |
| `obj-pp-tangential-rolled` | source_backed_link_only | 1 | 2 | 4 | 1 | 0 |  |
| `obj-pp-implant-displaced` | needs_source | 1 | 1 | 3 | 1 | 1 | needs source retrieval before a lesson can be written |
| `obj-pp-spot-mag-nipple` | needs_source | 1 | 1 | 3 | 6 | 0 | needs source retrieval before a lesson can be written |
| `obj-pp-implant-inquiry` | source_backed_open | 2 | 4 | 8 | 8 | 0 |  |
| `obj-pp-body-habitus` | needs_source | 0 | 0 | 1 | 3 | 0 | needs source retrieval before a lesson can be written |
| `obj-pp-postsurgical` | needs_source | 0 | 1 | 1 | 3 | 0 | needs source retrieval before a lesson can be written |
| `obj-pp-screening-vs-diagnostic` | source_backed_open | 2 | 8 | 11 | 16 | 1 |  |
| `obj-pp-us-mri` | needs_source | 0 | 0 | 0 | 12 | 0 | needs source retrieval before a lesson can be written |
| `obj-pp-interventional-prep` | source_backed_open | 1 | 3 | 4 | 6 | 1 |  |
| `obj-pp-biopsy-localization` | needs_source | 0 | 0 | 0 | 6 | 0 | needs source retrieval before a lesson can be written |
| `obj-pp-biohazard` | needs_source | 0 | 3 | 3 | 20 | 0 | needs source retrieval before a lesson can be written |
