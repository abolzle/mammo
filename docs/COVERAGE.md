# Coverage report

Generated 2026-10-06 by `npm run content:assemble`. Do not treat completeness as clinical review.

An objective is **complete** when it is source-backed and has a lesson, recall cards, and at least 3 practice questions.

## Totals

| Measure | Current | Production target |
|---|---|---|
| Objectives complete | 12 / 79 | all |
| Micro-lessons | 24 | 60–80 |
| Recall cards | 66 | 200+ |
| Practice questions | 86 | ~800 incl. two full forms |
| Reserved-form questions | 10 | two full forms |
| Visual exercises | 8 | — |

Source state: 23 open/public-domain, 0 link-only, 53 need a source, 3 blocked.

## Blocked objectives and the URLs needed

- `obj-ap-lexicon-masses-calcs`: Descriptor definitions require the ACR BI-RADS Atlas (commercial; not accessible to this pipeline) or an accessible secondary source. Radiopaedia returned HTTP 406 to automated retrieval. Once a maintainer reads an accessible source, facts can be taught in original wording with a link-only citation. https://www.acr.org/Clinical-Resources/Clinical-Tools-and-Reference/Reporting-and-Data-Systems/BI-RADS, https://radiopaedia.org/articles/breast-imaging-reporting-and-data-system-bi-rads
- `obj-pp-cc`: ARRT names the ACR Clinical Image Quality manual (1999) as the positioning reference. No accessible copy or equivalent open source has been located; a maintainer must obtain it (link-only citation is fine) or identify an accessible equivalent such as ACR accreditation positioning guidance. https://www.acr.org/Accreditation/Mammography, https://www.acr.org/Clinical-Resources/Clinical-Tools-and-Reference/Practice-Parameters-and-Technical-Standards
- `obj-pp-mlo`: Same reference gap as the CC objective. https://www.acr.org/Accreditation/Mammography

## Objective matrix

| Objective | Source | Lessons | Cards | Practice | Visuals | Gap |
|---|---|---|---|---|---|---|
| `obj-pc-pre-exam-instructions` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-pc-rapport-support` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-pc-explain-compression` | needs_source | 1 | 2 | 4 | 0 | needs source retrieval before a lesson can be written |
| `obj-pc-explain-repeat` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-pc-screening-guidelines` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-pc-bse-cbe` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-pc-typical-dose` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-pc-modalities` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-pc-results-pathway` | source_backed_open | 0 | 0 | 3 | 0 | missing lesson |
| `obj-pc-additional-imaging` | source_backed_open | 0 | 0 | 0 | 0 | no learner assets yet |
| `obj-pc-clinician-role` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-pc-epidemiology` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-pc-inherent-risk` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-pc-social-risk` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-pc-signs-symptoms` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-pc-history-documentation` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-pc-prior-images` | source_backed_open | 0 | 0 | 1 | 0 | missing lesson |
| `obj-pc-surgical-options` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-pc-nonsurgical-options` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-ip-kvp-tube` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-ip-paddles-grids` | source_backed_open | 0 | 2 | 1 | 0 | missing lesson |
| `obj-ip-geometry` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-ip-unit-components` | source_backed_open | 0 | 0 | 0 | 1 | missing lesson |
| `obj-ip-acquisition-types` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-ip-receptors-monitors` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-ip-informatics` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-ip-cad` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-mqsa-certification` | source_backed_open | 1 | 4 | 3 | 0 |  |
| `obj-mqsa-image-review-equip` | source_backed_open | 1 | 2 | 3 | 0 |  |
| `obj-mqsa-rt-initial` | source_backed_open | 1 | 4 | 4 | 0 |  |
| `obj-mqsa-rt-continuing` | source_backed_open | 1 | 6 | 4 | 0 |  |
| `obj-mqsa-qa-roles` | source_backed_open | 1 | 3 | 3 | 0 |  |
| `obj-mqsa-report-assessment` | source_backed_open | 1 | 3 | 4 | 0 |  |
| `obj-mqsa-results-communication` | source_backed_open | 1 | 2 | 4 | 1 |  |
| `obj-mqsa-density-reporting` | source_backed_open | 0 | 2 | 1 | 1 | missing lesson |
| `obj-mqsa-image-labeling` | source_backed_open | 2 | 2 | 6 | 2 |  |
| `obj-mqsa-records-transfer` | source_backed_open | 1 | 2 | 2 | 0 |  |
| `obj-mqsa-outcomes-audit` | source_backed_open | 1 | 2 | 3 | 0 |  |
| `obj-mqsa-required-policies` | source_backed_open | 1 | 2 | 2 | 0 |  |
| `obj-mqsa-equipment-qc` | source_backed_open | 1 | 4 | 3 | 0 |  |
| `obj-qc-phantom` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-qc-compression-tests` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-qc-visual-checklist` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-qc-monitors-viewing` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-qc-repeat-analysis` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-qc-detector-calibration` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-qc-physicist-survey` | source_backed_open | 0 | 2 | 1 | 0 | missing lesson |
| `obj-qc-physicist-tests` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-ip-exposure-factors` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-ip-thickness-target-filter` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-ip-magnification-technique` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-ip-image-quality-attributes` | source_backed_open | 0 | 3 | 3 | 0 | missing lesson |
| `obj-ip-patient-artifacts` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-ap-clock-quadrants` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-ap-triangulation` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-ap-external-landmarks` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-ap-internal-structures` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-ap-tdlu` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-ap-cytology` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-ap-lexicon-masses-calcs` | blocked | 0 | 0 | 0 | 0 | blocked: no accessible source verifies the fact |
| `obj-ap-assessment-density-categories` | source_backed_open | 0 | 1 | 1 | 0 | missing lesson |
| `obj-ap-benign-conditions` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-ap-high-risk-lesions` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-ap-malignant` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-pp-cc` | blocked | 2 | 3 | 9 | 1 | blocked: no accessible source verifies the fact |
| `obj-pp-mlo` | blocked | 2 | 2 | 7 | 1 | blocked: no accessible source verifies the fact |
| `obj-pp-lateral-views` | needs_source | 1 | 1 | 1 | 0 | needs source retrieval before a lesson can be written |
| `obj-pp-exaggerated-cleavage-at` | needs_source | 0 | 1 | 2 | 0 | needs source retrieval before a lesson can be written |
| `obj-pp-tangential-rolled` | needs_source | 0 | 0 | 1 | 0 | needs source retrieval before a lesson can be written |
| `obj-pp-implant-displaced` | needs_source | 1 | 1 | 4 | 1 | needs source retrieval before a lesson can be written |
| `obj-pp-spot-mag-nipple` | needs_source | 1 | 1 | 4 | 0 | needs source retrieval before a lesson can be written |
| `obj-pp-implant-inquiry` | source_backed_open | 1 | 2 | 5 | 0 |  |
| `obj-pp-body-habitus` | needs_source | 1 | 1 | 2 | 0 | needs source retrieval before a lesson can be written |
| `obj-pp-postsurgical` | needs_source | 0 | 1 | 1 | 0 | needs source retrieval before a lesson can be written |
| `obj-pp-screening-vs-diagnostic` | source_backed_open | 1 | 5 | 6 | 0 |  |
| `obj-pp-us-mri` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-pp-interventional-prep` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-pp-biopsy-localization` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
| `obj-pp-biohazard` | needs_source | 0 | 0 | 0 | 0 | needs source retrieval before a lesson can be written |
