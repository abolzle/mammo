# Source-check worksheet

Maintainer worksheet for Aaron Bolzle. Generated 2026-10-06 from assembled content on branch tip. **Status recorded 2026-10-06:** Aaron Bolzle confirmed all 18 objectives. Curriculum `sourceState` and dependent item `review.status` were updated in the follow-up source-check confirmation PR (maintainer source check only — not clinical review).

These **18** objectives already have a lesson, recall cards, at least 3 learner-visible practice questions, and at least one learner-visible Form A item, each citing evidence that resolves to a registered retrieved or link-only source. Aaron Bolzle confirmed all 18 on 2026-10-06; curriculum `sourceState` and dependent reviews were flipped to source-backed / `source_checked` in the confirmation PR.

## How to record a confirmation

After Aaron confirms an objective (and its cited claims) against the linked sources:

1. In `content/curriculum/curriculum.json`, set that objective's `sourceState` to `source_backed_open` (public-domain / open) or `source_backed_link_only` (restricted source, facts taught in original words).
2. On every dependent lesson, card, and question listed below, set `review.status` to `source_checked`, and append a history entry with `status: "source_checked"`, `actor` / reviewer name **"Aaron Bolzle"**, and `at` set to **today's date** (ISO `YYYY-MM-DD`).
3. Re-run `npm run content:assemble` so `docs/COVERAGE.md` and `public/content/` refresh.
4. Prefer a separate follow-up PR (or commit) for status flips — not this worksheet PR.

Reject or Needs more source: leave `sourceState` as `needs_source` (or set `blocked` with a note/URLs if truly inaccessible). Do not mark `source_checked`.

## Decision key

- **Confirm** — excerpts/claims match the cited source; safe to set `source_backed_*` + `source_checked`.
- **Reject** — content or citation is wrong; leave needs_source and fix content first.
- **Needs more source** — partial match or missing locator; gather another source before sign-off.

## Objectives (18)

### 1. `obj-pc-pre-exam-instructions`

**Title / statement:** Explain common pre-exam instructions (such as removing deodorant or powder and clothing above the waist) and why they matter for image quality.

**Current sourceState:** `needs_source`

**Domain / topic:** `dom-patient-care` / `top-pc-preparation`

**Dependent items**

- Lessons (1): `les-pc-pre-exam`
- Cards (3): `card-pc-deodorant`, `card-pc-deodorant-why`, `card-pc-menses`
- Practice questions (4): `q-pc-001`, `q-pc-002`, `q-pc-003`, `q-pc-004`
- Form A questions (1): `q-pc-050`

**Claims / evidence**

- `ev-pc-nci-compression-comfort`
  - Claim: Compression can be painful for some people. NCI notes that over-the-counter pain medication beforehand may lessen discomfort, and that scheduling around menses may help because breasts can be especially tender then.
  - Excerpt: For some people, the compression of the breast can be painful. Taking an over-the-counter pain medication before the procedure may lessen the discomfort. If possible, try not to schedule your mammogram right before or during your menstrual period, when your breasts may be especially tender.
  - Citation: `quoted_public` · locator: NCI Mammograms fact sheet, What happens during a mammogram?
  - Source: `src-nci-mammograms` — https://www.cancer.gov/types/breast/screening/mammograms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-pc-nci-deodorant`
  - Claim: On the day of the mammogram, patients should avoid personal care products such as deodorants, antiperspirants, powders, lotions, creams, or perfumes around the breasts or under the arms, because these products can appear on the image and interfere with interpretation.
  - Excerpt: You should avoid using personal care products, such as deodorants, antiperspirants, powders, lotions, creams, or perfumes, around the breasts or under the arms on the day of your mammogram.
  - Citation: `quoted_public` · locator: NCI Mammograms fact sheet, What happens during a mammogram?
  - Source: `src-nci-mammograms` — https://www.cancer.gov/types/breast/screening/mammograms
  - Retrieval: 2026-10-06 · status `retrieved`

**Aaron decision**

- [x] Confirm — 2026-10-06, Aaron Bolzle
- [ ] Reject
- [ ] Needs more source

_Notes:_ Aaron Bolzle confirmed the cited evidence supports the claims (maintainer source check; not clinical review).


---

### 2. `obj-pc-rapport-support`

**Title / statement:** Build rapport and respond to anxiety, modesty, and physical or cognitive needs while keeping the exam on track.

**Current sourceState:** `needs_source`

**Domain / topic:** `dom-patient-care` / `top-pc-preparation`

**Dependent items**

- Lessons (1): `les-pc-exam-process`
- Cards (1): `card-pc-narrate`
- Practice questions (3): `q-pc-005`, `q-pc-006`, `q-pc-007`
- Form A questions (2): `q-pc-051`, `q-pc-052`

**Claims / evidence**

- `ev-mqsa-lay-summary-timing`
  - Claim: Each patient receives a lay-language summary within 30 calendar days of the exam, including patient name, facility name/address/telephone, and a breast density statement. If the assessment is Suspicious or Highly Suggestive of Malignancy, the lay summary is due within 7 calendar days of the final interpretation.
  - Excerpt: If the assessment of the mammography report is “Suspicious” or “Highly Suggestive of Malignancy,” the facility shall provide the patient a summary of the mammography report written in lay language within 7 calendar days of the final interpretation of the mammograms.
  - Citation: `quoted_public` · locator: 21 CFR 900.12(c)(2)
  - Source: `src-ecfr-21-cfr-900` — https://www.ecfr.gov/current/title-21/chapter-I/subchapter-I/part-900
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-pc-nci-access-nbccedp`
  - Claim: CDC's National Breast and Cervical Cancer Early Detection Program provides screening services, including clinical breast exams and mammograms, to low-income, uninsured women; contact CDC or 1-800-CDC-INFO for local programs.
  - Excerpt: CDC's National Breast and Cervical Cancer Early Detection Program provides screening services, including clinical breast exams and mammograms, to low-income, uninsured women throughout the United States and in several U.S. territories. Contact information for local programs is available from the CDC or by calling 1–800–CDC–INFO (1–800–232–4636).
  - Citation: `quoted_public` · locator: NCI Mammograms fact sheet, How can uninsured or low-income women get a free or low-cost screening mammogram?
  - Source: `src-nci-mammograms` — https://www.cancer.gov/types/breast/screening/mammograms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-pc-nci-callback`
  - Claim: Being called back for further imaging or biopsy can be frightening, but most people who are called back are not found to have breast cancer.
  - Excerpt: Although it can be scary to be called back for further testing, it is important to keep in mind that most people who are called back are not found to have breast cancer.
  - Citation: `quoted_public` · locator: NCI Mammograms fact sheet, How are mammogram results reported?
  - Source: `src-nci-mammograms` — https://www.cancer.gov/types/breast/screening/mammograms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-pc-nci-compression-why`
  - Claim: During a mammogram the breast is placed between two plates that are pressed together; pressing the breast helps get a better x-ray picture of the inside of the breast. Several images are taken from different angles with the breast repositioned each time.
  - Excerpt: During a mammogram, your breast is placed between two plates that are then pressed together. Pressing the breast helps get a better x-ray picture of the inside of your breast. Several images are taken from different angles, with the breast repositioned each time.
  - Citation: `quoted_public` · locator: NCI Mammograms fact sheet, What happens during a mammogram?
  - Source: `src-nci-mammograms` — https://www.cancer.gov/types/breast/screening/mammograms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-pc-nci-results-timing`
  - Claim: NCI states patients typically receive the radiologist screening report within about 2 weeks by mail or electronic record, with a copy to the ordering provider, and should contact the provider if results are not received within 2 weeks.
  - Excerpt: You will receive the radiologist's report of your screening mammogram within about 2 weeks, either by mail or in your electronic medical record. The results will also be sent to the health care provider who ordered the mammogram. If you don't get your results within 2 weeks, you should contact your provider.
  - Citation: `quoted_public` · locator: NCI Mammograms fact sheet, How are mammogram results reported?
  - Source: `src-nci-mammograms` — https://www.cancer.gov/types/breast/screening/mammograms
  - Retrieval: 2026-10-06 · status `retrieved`

**Aaron decision**

- [x] Confirm — 2026-10-06, Aaron Bolzle
- [ ] Reject
- [ ] Needs more source

_Notes:_ Aaron Bolzle confirmed the cited evidence supports the claims (maintainer source check; not clinical review).


---

### 3. `obj-pc-explain-compression`

**Title / statement:** Explain to a patient in plain language why firm compression improves the image.

**Current sourceState:** `needs_source`

**Domain / topic:** `dom-patient-care` / `top-pc-preparation`

**Dependent items**

- Lessons (2): `les-pc-compression`, `les-pos-compression-purpose`
- Cards (3): `card-pc-compression-why`, `card-pos-compression-attr`, `card-pos-nci-compression`
- Practice questions (7): `q-pc-008`, `q-pc-009`, `q-pc-010`, `q-pos-017`, `q-pos-018`, `q-pos-019`, `q-pos-020`
- Form A questions (1): `q-pc-053`

**Claims / evidence**

- `ev-mqsa-clinical-image-attributes`
  - Claim: Clinical image review uses eight attributes: positioning, compression, exposure level, contrast, sharpness, noise, artifacts, and examination identification.
  - Excerpt: (i) Positioning. Sufficient breast tissue shall be imaged to ensure that cancers are not likely to be missed because of inadequate positioning. (ii) Compression. Compression shall be applied in a manner that minimizes the potential obscuring effect of overlying breast tissue and motion artifact.
  - Citation: `quoted_public` · locator: 21 CFR 900.4(c)(2)(i)–(viii)
  - Source: `src-ecfr-21-cfr-900` — https://www.ecfr.gov/current/title-21/chapter-I/subchapter-I/part-900
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-mqsa-compression-device`
  - Claim: Every mammography system has a compression device with initial power-driven compression activated by hands-free controls from both sides of the patient and fine-adjustment controls operable from both sides. Paddles match the full-field receptor sizes; special-purpose paddles (e.g., spot) may be provided. A flat paddle may not deflect from parallel by more than 1.0 cm when compression is applied, and its chest-wall edge is straight, parallel to the receptor edge, and must not appear on the image.
  - Excerpt: the compression paddle shall be flat and parallel to the breast support table and shall not deflect from parallel by more than 1.0 cm at any point on the surface of the compression paddle when compression is applied.
  - Citation: `quoted_public` · locator: 21 CFR 900.12(b)(8)
  - Source: `src-ecfr-21-cfr-900` — https://www.ecfr.gov/current/title-21/chapter-I/subchapter-I/part-900
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-mqsa-compression-force`
  - Claim: Compression device performance: at least 111 newtons (25 pounds) of force must be available, and the maximum force for the initial power drive is between 111 N (25 lb) and 200 N (45 lb).
  - Excerpt: (A) A compression force of at least 111 newtons (25 pounds) shall be provided. (B) Effective October 28, 2002, the maximum compression force for the initial power drive shall be between 111 newtons (25 pounds) and 200 newtons (45 pounds).
  - Citation: `quoted_public` · locator: 21 CFR 900.12(e)(4)(iii)
  - Source: `src-ecfr-21-cfr-900` — https://www.ecfr.gov/current/title-21/chapter-I/subchapter-I/part-900
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-pc-nci-compression-comfort`
  - Claim: Compression can be painful for some people. NCI notes that over-the-counter pain medication beforehand may lessen discomfort, and that scheduling around menses may help because breasts can be especially tender then.
  - Excerpt: For some people, the compression of the breast can be painful. Taking an over-the-counter pain medication before the procedure may lessen the discomfort. If possible, try not to schedule your mammogram right before or during your menstrual period, when your breasts may be especially tender.
  - Citation: `quoted_public` · locator: NCI Mammograms fact sheet, What happens during a mammogram?
  - Source: `src-nci-mammograms` — https://www.cancer.gov/types/breast/screening/mammograms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-pc-nci-compression-why`
  - Claim: During a mammogram the breast is placed between two plates that are pressed together; pressing the breast helps get a better x-ray picture of the inside of the breast. Several images are taken from different angles with the breast repositioned each time.
  - Excerpt: During a mammogram, your breast is placed between two plates that are then pressed together. Pressing the breast helps get a better x-ray picture of the inside of your breast. Several images are taken from different angles, with the breast repositioned each time.
  - Citation: `quoted_public` · locator: NCI Mammograms fact sheet, What happens during a mammogram?
  - Source: `src-nci-mammograms` — https://www.cancer.gov/types/breast/screening/mammograms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-pos-mqsa-compression-attribute`
  - Claim: For clinical image review, compression is applied to minimize overlying tissue obscuring anatomy and to reduce motion artifact.
  - Excerpt: Compression. Compression shall be applied in a manner that minimizes the potential obscuring effect of overlying breast tissue and motion artifact.
  - Citation: `quoted_public` · locator: 21 CFR 900.4(c)(2)(ii)
  - Source: `src-ecfr-21-cfr-900` — https://www.ecfr.gov/current/title-21/chapter-I/subchapter-I/part-900
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-pos-nci-compression-purpose`
  - Claim: During a mammogram the breast is pressed between two plates; pressing helps produce a better x-ray picture of the inside of the breast. Several images are taken from different angles with the breast repositioned each time.
  - Excerpt: Pressing the breast helps get a better x-ray picture of the inside of your breast. Several images are taken from different angles, with the breast repositioned each time.
  - Citation: `quoted_public` · locator: NCI Mammograms fact sheet — What happens during a mammogram? (updated 2025-12-02)
  - Source: `src-nci-mammograms` — https://www.cancer.gov/types/breast/screening/mammograms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-pos-pmc-compression-benefits`
  - Claim: Breast compression improves digital mammography image quality by immobilizing the breast and shortening exposure (less motion blur), creating more uniform thinner tissue (less scatter, more even penetration, less geometric blur and superposition), and lowering breast dose.
  - Excerpt: (link-only; claim restated in original words) Breast compression improves digital mammography image quality by immobilizing the breast and shortening exposure (less motion blur), creating more uniform thinner tissue (less scatter, more even penetration, less geometric blur and superposition), and lowering breast dose.
  - Citation: `link_only` · locator: PMC3553374 — Breast compression paragraph under image acquisition determinants
  - Source: `src-acr-aapm-siim-dm-iq-2013` — https://pmc.ncbi.nlm.nih.gov/articles/PMC3553374/
  - Retrieval: 2026-10-06 · status `retrieved`

**Aaron decision**

- [x] Confirm — 2026-10-06, Aaron Bolzle
- [ ] Reject
- [ ] Needs more source

_Notes:_ Aaron Bolzle confirmed the cited evidence supports the claims (maintainer source check; not clinical review).


---

### 4. `obj-pc-explain-repeat`

**Title / statement:** Explain the need for a repeat image (for example motion or artifact) honestly and without alarming the patient.

**Current sourceState:** `needs_source`

**Domain / topic:** `dom-patient-care` / `top-pc-preparation`

**Dependent items**

- Lessons (1): `les-pc-repeat`
- Cards (1): `card-pc-repeat`
- Practice questions (3): `q-pc-011`, `q-pc-012`, `q-pc-013`
- Form A questions (1): `q-pc-073`

**Claims / evidence**

- `ev-ip-cdc-alara`
  - Claim: ALARA means as low as reasonably achievable: avoid radiation exposure that has no direct benefit, even if the dose is small. The three basic protective measures are time (minimize), distance (maximize), and shielding (place an appropriate barrier).
  - Excerpt: ALARA stands for "as low as reasonably achievable." ALARA means avoiding exposure to radiation that does not have a direct benefit to you, even if the dose is small. To do this, you can use three basic protective measures in radiation safety: time, distance, and shielding.
  - Citation: `quoted_public` · locator: CDC ALARA page (updated 2026-07-17)
  - Source: `src-cdc-alara` — https://www.cdc.gov/radiation-health/safety/alara.html
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ip-nci-mammogram-low-dose`
  - Claim: Mammography uses low-dose x-rays to create pictures of the breast for screening and diagnosis.
  - Excerpt: Mammography is an imaging test that uses low-dose x-rays to create pictures of the breast. It is used both to screen for breast cancer and diagnose breast conditions.
  - Citation: `quoted_public` · locator: NCI Mammograms fact sheet (updated 2025-12-02), 'What is a mammogram?'
  - Source: `src-nci-mammograms` — https://www.cancer.gov/types/breast/screening/mammograms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-mqsa-clinical-image-attributes`
  - Claim: Clinical image review uses eight attributes: positioning, compression, exposure level, contrast, sharpness, noise, artifacts, and examination identification.
  - Excerpt: (i) Positioning. Sufficient breast tissue shall be imaged to ensure that cancers are not likely to be missed because of inadequate positioning. (ii) Compression. Compression shall be applied in a manner that minimizes the potential obscuring effect of overlying breast tissue and motion artifact.
  - Citation: `quoted_public` · locator: 21 CFR 900.4(c)(2)(i)–(viii)
  - Source: `src-ecfr-21-cfr-900` — https://www.ecfr.gov/current/title-21/chapter-I/subchapter-I/part-900
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-mqsa-equip`
  - Claim: EQUIP added three inspection questions on: facility procedures to keep clinical images compliant with accreditation-body standards (including regular review of sample images from each technologist and interpreting physician); corrective procedures for poor-quality images, including feedback to technologists; and lead interpreting physician oversight of QA/QC records.
  - Excerpt: The first new inspection question assesses for facility procedures to ensure that clinical images continue to comply with AB standards (including image quality attributes such as positioning), and include regular reviews of sample images from each technologist and each interpreting physician (IP).
  - Citation: `quoted_public` · locator: FDA MQSA Insights: EQUIP (archived 2022-09-30), paragraphs 1 and 5
  - Source: `src-fda-equip` — https://www.fda.gov/radiation-emitting-products/mqsa-insights/equip-enhancing-quality-using-inspection-program
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-pc-nci-callback`
  - Claim: Being called back for further imaging or biopsy can be frightening, but most people who are called back are not found to have breast cancer.
  - Excerpt: Although it can be scary to be called back for further testing, it is important to keep in mind that most people who are called back are not found to have breast cancer.
  - Citation: `quoted_public` · locator: NCI Mammograms fact sheet, How are mammogram results reported?
  - Source: `src-nci-mammograms` — https://www.cancer.gov/types/breast/screening/mammograms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-pc-nci-deodorant`
  - Claim: On the day of the mammogram, patients should avoid personal care products such as deodorants, antiperspirants, powders, lotions, creams, or perfumes around the breasts or under the arms, because these products can appear on the image and interfere with interpretation.
  - Excerpt: You should avoid using personal care products, such as deodorants, antiperspirants, powders, lotions, creams, or perfumes, around the breasts or under the arms on the day of your mammogram.
  - Citation: `quoted_public` · locator: NCI Mammograms fact sheet, What happens during a mammogram?
  - Source: `src-nci-mammograms` — https://www.cancer.gov/types/breast/screening/mammograms
  - Retrieval: 2026-10-06 · status `retrieved`

**Aaron decision**

- [x] Confirm — 2026-10-06, Aaron Bolzle
- [ ] Reject
- [ ] Needs more source

_Notes:_ Aaron Bolzle confirmed the cited evidence supports the claims (maintainer source check; not clinical review).


---

### 5. `obj-pc-screening-guidelines`

**Title / statement:** Summarize current ACS and ACR screening recommendations and how they differ from USPSTF guidance.

**Current sourceState:** `needs_source`

**Domain / topic:** `dom-patient-care` / `top-pc-education`

**Dependent items**

- Lessons (1): `les-pc-guidelines`
- Cards (5): `card-pc-uspstf`, `card-pc-uspstf-75`, `card-pc-acs`, `card-pc-uspstf-dense-i`, `card-pc-nbccedp`
- Practice questions (5): `q-pc-018`, `q-pc-019`, `q-pc-020`, `q-pc-021`, `q-pc-048`
- Form A questions (4): `q-pc-054`, `q-pc-055`, `q-pc-056`, `q-pc-057`

**Claims / evidence**

- `ev-pc-acs-average-ages`
  - Claim: ACS average-risk guidance (as stated in Facts & Figures 2024–2025): ages 40–44 may begin annual screening; ages 45–54 should have annual mammograms; ages 55+ may transition to every other year or continue annually; continue while in good health with life expectancy of about 10 years or more.
  - Excerpt: (link-only; claim restated in original words) ACS average-risk guidance (as stated in Facts & Figures 2024–2025): ages 40–44 may begin annual screening; ages 45–54 should have annual mammograms; ages 55+ may transition to every other year or continue annually; continue while in good health with life expectancy of about 10 years or more.
  - Citation: `link_only` · locator: ACS Breast Cancer Facts & Figures 2024-2025, ACS Recommendations for Breast Cancer Screening (average-risk)
  - Source: `src-acs-facts-2024-2025` — https://www.cancer.org/content/dam/cancer-org/research/cancer-facts-and-statistics/breast-cancer-facts-and-figures/2024/breast-cancer-facts-and-figures-2024.pdf
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-pc-acs-high-risk`
  - Claim: ACS high-risk guidance (as stated in Facts & Figures 2024–2025): women at high risk (about 20–25% or greater lifetime risk by family-history tools, known high-risk genetic variation or first-degree relative with such a variation, strong family history, or prior chest radiation) generally begin annual MRI and mammography at age 30.
  - Excerpt: (link-only; claim restated in original words) ACS high-risk guidance (as stated in Facts & Figures 2024–2025): women at high risk (about 20–25% or greater lifetime risk by family-history tools, known high-risk genetic variation or first-degree relative with such a variation, strong family history, or prior chest radiation) generally begin annual MRI and mammography at age 30.
  - Citation: `link_only` · locator: ACS Breast Cancer Facts & Figures 2024-2025, ACS Recommendations for Breast Cancer Screening (high-risk)
  - Source: `src-acs-facts-2024-2025` — https://www.cancer.org/content/dam/cancer-org/research/cancer-facts-and-statistics/breast-cancer-facts-and-figures/2024/breast-cancer-facts-and-figures-2024.pdf
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-pc-nci-access-nbccedp`
  - Claim: CDC's National Breast and Cervical Cancer Early Detection Program provides screening services, including clinical breast exams and mammograms, to low-income, uninsured women; contact CDC or 1-800-CDC-INFO for local programs.
  - Excerpt: CDC's National Breast and Cervical Cancer Early Detection Program provides screening services, including clinical breast exams and mammograms, to low-income, uninsured women throughout the United States and in several U.S. territories. Contact information for local programs is available from the CDC or by calling 1–800–CDC–INFO (1–800–232–4636).
  - Citation: `quoted_public` · locator: NCI Mammograms fact sheet, How can uninsured or low-income women get a free or low-cost screening mammogram?
  - Source: `src-nci-mammograms` — https://www.cancer.gov/types/breast/screening/mammograms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-pc-nci-dense-common`
  - Claim: Dense breasts are common: nearly half of women age 40 and older who get mammograms are found to have dense breast tissue.
  - Excerpt: Yes, dense breasts are common. Nearly half of all women who are 40 and older who get mammograms are found to have dense breast tissue.
  - Citation: `quoted_public` · locator: NCI Dense Breasts Q&A, Are dense breasts common? (updated 2025-12-02)
  - Source: `src-nci-dense-breasts` — https://www.cancer.gov/types/breast/breast-changes/dense-breasts
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-pc-uspstf-75`
  - Claim: USPSTF concludes evidence is insufficient to assess benefits and harms of screening mammography in women 75 years or older (I statement).
  - Excerpt: The USPSTF concludes that the current evidence is insufficient to assess the balance of benefits and harms of screening mammography in women 75 years or older.
  - Citation: `quoted_public` · locator: USPSTF Breast Cancer Screening final recommendation (April 30, 2024), Recommendation Summary
  - Source: `src-uspstf-breast-2024` — https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-pc-uspstf-biennial`
  - Claim: USPSTF recommends biennial screening mammography for women aged 40 to 74 years (Grade B).
  - Excerpt: The USPSTF recommends biennial screening mammography for women aged 40 to 74 years.
  - Citation: `quoted_public` · locator: USPSTF Breast Cancer Screening final recommendation (April 30, 2024), Recommendation Summary
  - Source: `src-uspstf-breast-2024` — https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-pc-uspstf-dense-i`
  - Claim: USPSTF concludes evidence is insufficient to assess benefits and harms of supplemental ultrasound or MRI screening in women with dense breasts and an otherwise negative screening mammogram (I statement).
  - Excerpt: The USPSTF concludes that the current evidence is insufficient to assess the balance of benefits and harms of supplemental screening for breast cancer using breast ultrasonography or magnetic resonance imaging (MRI) in women identified to have dense breasts on an otherwise negative screening mammogram.
  - Citation: `quoted_public` · locator: USPSTF Breast Cancer Screening final recommendation (April 30, 2024), Recommendation Summary
  - Source: `src-uspstf-breast-2024` — https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-pc-uspstf-modalities`
  - Claim: USPSTF states both digital mammography and digital breast tomosynthesis are effective mammographic screening modalities.
  - Excerpt: Both digital mammography and digital breast tomosynthesis (or “3D mammography”) are effective mammographic screening modalities.
  - Citation: `quoted_public` · locator: USPSTF Breast Cancer Screening final recommendation (April 30, 2024), Clinician Summary — How to implement
  - Source: `src-uspstf-breast-2024` — https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-pc-uspstf-population`
  - Claim: The 2024 USPSTF recommendation applies to cisgender women and other persons assigned female at birth age 40+ at average risk, and also to those with factors such as a first-degree family history or dense breasts. It does not apply to persons with high-risk genetic markers/syndromes, high-dose chest radiation at a young age, previous breast cancer, or a high-risk breast lesion on prior biopsy.
  - Excerpt: These recommendations apply to cisgender women and all other persons assigned female at birth (including transgender men and nonbinary persons) 40 years or older at average risk of breast cancer. They also apply to women who have factors associated with an increased risk of breast cancer, such as a family history of breast cancer (ie, a first-degree relative with breast cancer) or having dense breasts. These recommendations do not apply to persons who have a genetic marker or syndrome associated with a high risk of breast cancer (eg, BRCA1 or BRCA2 genetic variation), a history of high-dose radiation therapy to the chest at a young age, or previous breast cancer or a high-risk breast lesion on previous biopsies.
  - Citation: `quoted_public` · locator: USPSTF Breast Cancer Screening final recommendation (April 30, 2024), Clinician Summary — To whom does this recommendation apply?
  - Source: `src-uspstf-breast-2024` — https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening
  - Retrieval: 2026-10-06 · status `retrieved`

**Aaron decision**

- [x] Confirm — 2026-10-06, Aaron Bolzle
- [ ] Reject
- [ ] Needs more source

_Notes:_ Aaron Bolzle confirmed the cited evidence supports the claims (maintainer source check; not clinical review).


---

### 6. `obj-pc-typical-dose`

**Title / statement:** Describe typical mammography dose in patient-friendly terms without overstating or minimizing risk.

**Current sourceState:** `needs_source`

**Domain / topic:** `dom-patient-care` / `top-pc-education`

**Dependent items**

- Lessons (1): `les-ip-radiation-concepts`
- Cards (6): `card-ip-alara`, `card-ip-lnt`, `card-ip-low-dose-words`, `card-ip-dna`, `card-ip-gy`, `card-ip-barrier`
- Practice questions (3): `q-ip-041`, `q-ip-042`, `q-ip-044`
- Form A questions (4): `q-pc-058`, `q-pc-059`, `q-pc-060`, `q-pc-068`

**Claims / evidence**

- `ev-ip-cdc-alara`
  - Claim: ALARA means as low as reasonably achievable: avoid radiation exposure that has no direct benefit, even if the dose is small. The three basic protective measures are time (minimize), distance (maximize), and shielding (place an appropriate barrier).
  - Excerpt: ALARA stands for "as low as reasonably achievable." ALARA means avoiding exposure to radiation that does not have a direct benefit to you, even if the dose is small. To do this, you can use three basic protective measures in radiation safety: time, distance, and shielding.
  - Citation: `quoted_public` · locator: CDC ALARA page (updated 2026-07-17)
  - Source: `src-cdc-alara` — https://www.cdc.gov/radiation-health/safety/alara.html
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ip-cdc-tech-barrier`
  - Claim: In a medical x-ray setting, the three ALARA measures work together when the technologist goes behind a barrier while making the exposure, protecting against repeated occupational exposure.
  - Excerpt: You can see how these principles work together when you have an x-ray at your doctor's office or clinic. The radiation technician goes behind a barrier while taking the x-ray image. The barrier protects them from repeated daily exposure to radiation.
  - Citation: `quoted_public` · locator: CDC ALARA page, time/distance/shielding clinic example
  - Source: `src-cdc-alara` — https://www.cdc.gov/radiation-health/safety/alara.html
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ip-dose-units`
  - Claim: Absorbed dose is measured in gray (Gy), where 1 Gy = 1 J/kg = 100 rad. Equivalent dose accounting for radiation type uses sievert (Sv) and rem, with Sv = Gy × RBE and 1 Sv = 100 rem.
  - Excerpt: The SI unit for radiation dose is the gray (Gy), which is defined to be 1 Gy = 1 J/kg = 100 rad. … The SI equivalent of the rem is the sievert (Sv), defined to be Sv = Gy × RBE and 1 Sv = 100 rem.
  - Citation: `quoted_public` · locator: College Physics 2e § 32.2
  - Source: `src-openstax-college-physics-2e` — https://openstax.org/details/books/college-physics-2e
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ip-ionizing-dna`
  - Claim: Ionizing radiation affects molecules within cells, particularly DNA. It can interfere with cell reproduction and cell function; rapidly dividing cells (including many cancer cells) are especially sensitive, so radiation can both treat and cause cancer.
  - Excerpt: All the effects of ionizing radiation on biological tissue can be understood by knowing that ionizing radiation affects molecules within cells, particularly DNA molecules. … Since ionizing radiation damages the DNA, which is critical in cell reproduction, it has its greatest effect on cells that rapidly reproduce, including most types of cancer. … Without contradiction, ionizing radiation can be both a cure and a cause.
  - Citation: `quoted_public` · locator: College Physics 2e § 32.2
  - Source: `src-openstax-college-physics-2e` — https://openstax.org/details/books/college-physics-2e
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ip-nci-diagnostic-more-images`
  - Claim: The same machines are used for screening and diagnostic mammograms, but diagnostic mammography requires images from more angles, so the radiation dose is higher.
  - Excerpt: The same machines are used for both types of mammograms. However, diagnostic mammography requires images from more angles than screening mammography, so the dose of radiation is higher.
  - Citation: `quoted_public` · locator: NCI Mammograms fact sheet, screening vs diagnostic
  - Source: `src-nci-mammograms` — https://www.cancer.gov/types/breast/screening/mammograms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ip-nci-mammogram-low-dose`
  - Claim: Mammography uses low-dose x-rays to create pictures of the breast for screening and diagnosis.
  - Excerpt: Mammography is an imaging test that uses low-dose x-rays to create pictures of the breast. It is used both to screen for breast cancer and diagnose breast conditions.
  - Citation: `quoted_public` · locator: NCI Mammograms fact sheet (updated 2025-12-02), 'What is a mammogram?'
  - Source: `src-nci-mammograms` — https://www.cancer.gov/types/breast/screening/mammograms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ip-nrc-lnt`
  - Claim: Public health data do not absolutely establish cancer occurrence below about 10,000 mrem (100 mSv), but the radiation protection community conservatively assumes any amount of radiation may pose some risk and that risk rises with dose. The NRC accepts the linear no-threshold (LNT) hypothesis as a conservative model for estimating radiation risk.
  - Excerpt: Although radiation may cause cancer at high doses and high dose rates, public health data do not absolutely establish the occurrence of cancer following exposure to low doses and dose rates — below about 10,000 mrem (100 mSv). … A linear no-threshold (LNT) dose-response relationship is used to describe the relationship between radiation dose and the occurrence of cancer. … The U.S. Nuclear Regulatory Commission (NRC) accepts the LNT hypothesis as a conservative model for estimating radiation risk.
  - Citation: `quoted_public` · locator: NRC Radiation Exposure and Cancer (reviewed 2020-03-20)
  - Source: `src-nrc-radiation-cancer` — https://www.nrc.gov/about-nrc/radiation/health-effects/rad-exposure-cancer.html
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-mqsa-dose-limit`
  - Claim: The average glandular dose for a single craniocaudal view of an FDA-accepted phantom simulating a standard breast must not exceed 3.0 mGy (0.3 rad) per exposure, using clinical technique for a standard breast. This maximum also applies to non-screen-film modalities. A standard breast is a 4.2 cm compressed breast of 50% glandular and 50% adipose tissue.
  - Excerpt: The average glandular dose delivered during a single cranio-caudal view of an FDA-accepted phantom simulating a standard breast shall not exceed 3.0 milligray (mGy) (0.3 rad) per exposure.
  - Citation: `quoted_public` · locator: 21 CFR 900.12(e)(5)(vi), (e)(6); 900.2(uu)
  - Source: `src-ecfr-21-cfr-900` — https://www.ecfr.gov/current/title-21/chapter-I/subchapter-I/part-900
  - Retrieval: 2026-10-06 · status `retrieved`

**Aaron decision**

- [x] Confirm — 2026-10-06, Aaron Bolzle
- [ ] Reject
- [ ] Needs more source

_Notes:_ Aaron Bolzle confirmed the cited evidence supports the claims (maintainer source check; not clinical review).


---

### 7. `obj-pc-modalities`

**Title / statement:** Explain the difference between 2D mammography, DBT, and breast ultrasound to a patient.

**Current sourceState:** `needs_source`

**Domain / topic:** `dom-patient-care` / `top-pc-education`

**Dependent items**

- Lessons (1): `les-pc-modalities`
- Cards (2): `card-pc-dbt`, `card-pc-modalities-uspstf`
- Practice questions (3): `q-pc-041`, `q-pc-042`, `q-pc-043`
- Form A questions (1): `q-pc-071`

**Claims / evidence**

- `ev-ip-breast-soft-tissue-contrast`
  - Claim: Mammography is used because early detection matters, but a mammogram cannot diagnose malignancy by itself—it shows evidence of a lump or denser region. Soft-tissue absorption is similar across tissue types, so contrast is difficult, especially in denser younger breasts; more fat in older breasts can improve contrast of a lump.
  - Excerpt: A mammogram cannot diagnose a malignant tumor, only give evidence of a lump or region of increased density within the breast. X-ray absorption by different types of soft tissue is very similar, so contrast is difficult; this is especially true for younger women, who typically have denser breasts.
  - Citation: `quoted_public` · locator: College Physics 2e § 30.4 (mammogram paragraph)
  - Source: `src-openstax-college-physics-2e` — https://openstax.org/details/books/college-physics-2e
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-pc-nci-callback`
  - Claim: Being called back for further imaging or biopsy can be frightening, but most people who are called back are not found to have breast cancer.
  - Excerpt: Although it can be scary to be called back for further testing, it is important to keep in mind that most people who are called back are not found to have breast cancer.
  - Citation: `quoted_public` · locator: NCI Mammograms fact sheet, How are mammogram results reported?
  - Source: `src-nci-mammograms` — https://www.cancer.gov/types/breast/screening/mammograms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-pc-nci-dbt`
  - Claim: DBT (3D mammography) takes multiple thin-slice images assembled into a 3D picture and also creates 2D images. DBT combined with standard mammography finds more tumors than standard mammography alone, but it is still unknown whether DBT reduces breast cancer deaths more than standard mammography; TMIST is studying that question.
  - Excerpt: Three-dimensional, or 3D, mammography, also called digital breast tomosynthesis (DBT), creates three-dimensional images of the breast. … DBT combined with standard mammography is better at finding tumors than standard mammography alone. However, it's still unknown whether DBT is more effective than standard mammography at reducing deaths from breast cancer.
  - Citation: `quoted_public` · locator: NCI Mammograms fact sheet, What are 3D mammograms?
  - Source: `src-nci-mammograms` — https://www.cancer.gov/types/breast/screening/mammograms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-pc-nci-dense-supplemental`
  - Claim: According to USPSTF as cited by NCI, there is not yet enough evidence to recommend for or against additional imaging such as ultrasound or MRI for screening women with dense breasts; patients should talk with their clinician.
  - Excerpt: There is not yet enough evidence to recommend for or against additional imaging tests such as ultrasound or MRI to screen for breast cancer in women with dense breasts, according to the Recommendation Statement on Breast Cancer Screening by the United States Preventive Services Task Force (USPSTF). Talk with your doctor or nurse to learn more about your options.
  - Citation: `quoted_public` · locator: NCI Dense Breasts Q&A, Should women with dense breasts have additional screening?
  - Source: `src-nci-dense-breasts` — https://www.cancer.gov/types/breast/breast-changes/dense-breasts
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-pc-uspstf-modalities`
  - Claim: USPSTF states both digital mammography and digital breast tomosynthesis are effective mammographic screening modalities.
  - Excerpt: Both digital mammography and digital breast tomosynthesis (or “3D mammography”) are effective mammographic screening modalities.
  - Citation: `quoted_public` · locator: USPSTF Breast Cancer Screening final recommendation (April 30, 2024), Clinician Summary — How to implement
  - Source: `src-uspstf-breast-2024` — https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening
  - Retrieval: 2026-10-06 · status `retrieved`

**Aaron decision**

- [x] Confirm — 2026-10-06, Aaron Bolzle
- [ ] Reject
- [ ] Needs more source

_Notes:_ Aaron Bolzle confirmed the cited evidence supports the claims (maintainer source check; not clinical review).


---

### 8. `obj-ip-acquisition-types`

**Title / statement:** Compare FFDM, DBT, and synthesized 2D imaging.

**Current sourceState:** `needs_source`

**Domain / topic:** `dom-image-production` / `top-ip-digital`

**Dependent items**

- Lessons (1): `les-ip-ffdm-dbt`
- Cards (4): `card-ip-modality-examples`, `card-ip-dbt-slices`, `card-ip-dbt-2d`, `card-ip-dbt-mortality`
- Practice questions (4): `q-ip-017`, `q-ip-018`, `q-ip-019`, `q-ip-020`
- Form A questions (1): `q-ip-053`

**Claims / evidence**

- `ev-ip-acr-dmqc-link`
  - Claim: FDA has determined that facilities may use the ACR 2018 Digital Mammography QC Manual for quality control of both 2D digital mammography and DBT; the manual itself is copyrighted and is cited link-only in Mammo (no redistributed text or device-specific pass/fail criteria).
  - Excerpt: (link-only; claim restated in original words) FDA has determined that facilities may use the ACR 2018 Digital Mammography QC Manual for quality control of both 2D digital mammography and DBT; the manual itself is copyrighted and is cited link-only in Mammo (no redistributed text or device-specific pass/fail criteria).
  - Citation: `link_only` · locator: ACR Digital Mammography QC Manual resources page
  - Source: `src-acr-dmqc-manual` — https://www.acr.org/Accreditation/Resources/Digital-Mammography-QC-Manual
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ip-nci-dbt`
  - Claim: Digital breast tomosynthesis (DBT, 3D mammography) takes multiple thin-slice pictures across the breast that software assembles into a 3D picture; DBT also creates 2D images like standard mammography. Combining DBT with standard mammography finds more tumors than standard mammography alone, but whether DBT reduces breast-cancer deaths more than standard mammography alone is still being studied (e.g., TMIST).
  - Excerpt: Three-dimensional, or 3D, mammography, also called digital breast tomosynthesis (DBT), creates three-dimensional images of the breast. To do this, the DBT machine takes multiple pictures of thin “slices” across the breast that are then assembled into a 3D picture by computer software. DBT also creates 2D images of the breast like those created by standard mammography. DBT combined with standard mammography is better at finding tumors than standard mammography alone. However, it's still unknown whether DBT is more effective than standard mammography at reducing deaths from breast cancer.
  - Citation: `quoted_public` · locator: NCI Mammograms fact sheet, 'What are 3D mammograms?'
  - Source: `src-nci-mammograms` — https://www.cancer.gov/types/breast/screening/mammograms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-mqsa-modality-definition`
  - Claim: A mammographic modality is a breast radiography technology such as screen-film, full-field digital mammography, or digital breast tomosynthesis. For Part 900, 'mammography' excludes radiography during invasive localization/biopsy procedures, investigational-device studies, and breast CT.
  - Excerpt: Mammographic modality means a technology, within the scope of 42 U.S.C. 263b, for radiography of the breast. Examples are screen-film mammography, full field digital mammography, and digital breast tomosynthesis.
  - Citation: `quoted_public` · locator: 21 CFR 900.2(z), (aa)
  - Source: `src-ecfr-21-cfr-900` — https://www.ecfr.gov/current/title-21/chapter-I/subchapter-I/part-900
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-mqsa-other-modalities-qc`
  - Claim: For image receptor modalities other than screen-film (e.g., FFDM, DBT), the QA program is substantially the same as the image receptor manufacturer's recommended program, except that the dose may not exceed the screen-film maximum.
  - Excerpt: For systems with image receptor modalities other than screen-film, the quality assurance program shall be substantially the same as the quality assurance program recommended by the image receptor manufacturer, except that the maximum allowable dose shall not exceed the maximum allowable dose for screen-film systems
  - Citation: `quoted_public` · locator: 21 CFR 900.12(e)(6), (b)(16)
  - Source: `src-ecfr-21-cfr-900` — https://www.ecfr.gov/current/title-21/chapter-I/subchapter-I/part-900
  - Retrieval: 2026-10-06 · status `retrieved`

**Aaron decision**

- [x] Confirm — 2026-10-06, Aaron Bolzle
- [ ] Reject
- [ ] Needs more source

_Notes:_ Aaron Bolzle confirmed the cited evidence supports the claims (maintainer source check; not clinical review).


---

### 9. `obj-ip-receptors-monitors`

**Title / statement:** Describe digital image receptors and the difference between acquisition and interpretation workstations.

**Current sourceState:** `needs_source`

**Domain / topic:** `dom-image-production` / `top-ip-digital`

**Dependent items**

- Lessons (2): `les-ip-receptors-displays`, `les-inf-display-roles`
- Cards (4): `card-ip-acq-vs-interp`, `card-ip-digital-qc-pointer`, `card-inf-display-ifu`, `card-inf-display-510k`
- Practice questions (5): `q-ip-023`, `q-inf-014`, `q-inf-015`, `q-inf-016`, `q-inf-017`
- Form A questions (1): `q-ip-054`

**Claims / evidence**

- `ev-inf-892-mimps`
  - Claim: A medical image management and processing system provides review and digital processing of medical images for interpretation by a trained practitioner; it is Class II, with DICOM, JPEG, and the SMPTE test pattern named as voluntary standards.
  - Excerpt: A medical image management and processing system is a device that provides one or more capabilities relating to the review and digital processing of medical images for the purposes of interpretation by a trained practitioner of disease detection, diagnosis, or patient management.
  - Citation: `quoted_public` · locator: 21 CFR 892.2050(a)–(b)
  - Source: `src-ecfr-21-cfr-892-image-devices` — https://www.ecfr.gov/current/title-21/chapter-I/subchapter-H/part-892/subpart-C
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-inf-cfr-devices-authorized`
  - Claim: All devices used in mammography must have met the applicable FDA premarket authorization requirements for that device type and intended use.
  - Excerpt: All devices used in mammography must have met the applicable FDA premarket authorization requirements for medical devices of that type with that intended use.
  - Citation: `quoted_public` · locator: 21 CFR 900.12(b)(2)(i)
  - Source: `src-ecfr-21-cfr-900` — https://www.ecfr.gov/current/title-21/chapter-I/subchapter-I/part-900
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-inf-disp-ifu`
  - Claim: A diagnostic display's indications for use should state whether it is or is not intended for mammography (including FFDM and DBT).
  - Excerpt: The IFU should state whether your device is or is not intended for mammography.
  - Citation: `quoted_public` · locator: FDA Display Devices for Diagnostic Radiology (2022), IV.A Indications for Use
  - Source: `src-fda-display-devices-guidance` — https://www.fda.gov/regulatory-information/search-fda-guidance-documents/display-devices-diagnostic-radiology
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-inf-disp-scope`
  - Claim: The guidance covers display devices for diagnostic radiology classified under 21 CFR 892.2050, sometimes called soft-copy displays or medical grade monitors.
  - Excerpt: This includes display devices for diagnostic radiology that may be referred to as soft-copy display or medical grade monitors.
  - Citation: `quoted_public` · locator: FDA Display Devices for Diagnostic Radiology (2022), Scope
  - Source: `src-fda-display-devices-guidance` — https://www.fda.gov/regulatory-information/search-fda-guidance-documents/display-devices-diagnostic-radiology
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-inf-fr-display-clearance`
  - Claim: § 900.12(b)(2)(i) applies to devices used to acquire, process, or display digital mammograms; a display used for interpretation generally needs 510(k) clearance, while some devices such as image storage devices may be exempt.
  - Excerpt: This applies to devices used in the acquisition, processing, or display of digital mammographic images. For example, a display device used in the interpretation of digital mammographic images generally needs to have 510(k) clearance prior to being used in a mammographic facility. Not all equipment needs clearance or approval; for example, some devices, such as medical image storage devices, may be exempted from premarket notification requirements.
  - Citation: `quoted_public` · locator: 88 FR 15126 (Mar. 10, 2023) preamble, Response 19
  - Source: `src-fr-88-15126` — https://www.federalregister.gov/documents/2023/03/10/2023-04550/mammography-quality-standards-act
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-inf-fr-display-qc-separate`
  - Claim: Display QC tests are a separate MQSA standard; having QC tests for a display does not by itself satisfy FDA premarket requirements, and interpreting on a display without the applicable authorization would generally violate MQSA.
  - Excerpt: The QC tests for a display are another MQSA quality standard required for use of that display for mammography interpretation (see Sec. 900.12(e)(6)), but the existence of QC tests for a display is generally not sufficient to satisfy all FDA premarket regulatory requirements that may apply to the device.
  - Citation: `quoted_public` · locator: 88 FR 15126 (Mar. 10, 2023) preamble, Response 22
  - Source: `src-fr-88-15126` — https://www.federalregister.gov/documents/2023/03/10/2023-04550/mammography-quality-standards-act
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ip-acr-dmqc-link`
  - Claim: FDA has determined that facilities may use the ACR 2018 Digital Mammography QC Manual for quality control of both 2D digital mammography and DBT; the manual itself is copyrighted and is cited link-only in Mammo (no redistributed text or device-specific pass/fail criteria).
  - Excerpt: (link-only; claim restated in original words) FDA has determined that facilities may use the ACR 2018 Digital Mammography QC Manual for quality control of both 2D digital mammography and DBT; the manual itself is copyrighted and is cited link-only in Mammo (no redistributed text or device-specific pass/fail criteria).
  - Citation: `link_only` · locator: ACR Digital Mammography QC Manual resources page
  - Source: `src-acr-dmqc-manual` — https://www.acr.org/Accreditation/Resources/Digital-Mammography-QC-Manual
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-mqsa-mammography-unit-definition`
  - Claim: A mammography unit includes, at a minimum, an x-ray generator, an x-ray control, a tube housing assembly, a beam limiting device, and supporting structures.
  - Excerpt: Mammography unit or units means an assemblage of components for the production of X-rays for use during mammography, including, at a minimum: An X-ray generator, an X-ray control, a tube housing assembly, a beam limiting device, and the supporting structures for these components.
  - Citation: `quoted_public` · locator: 21 CFR 900.2(dd)
  - Source: `src-ecfr-21-cfr-900` — https://www.ecfr.gov/current/title-21/chapter-I/subchapter-I/part-900
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-mqsa-other-modalities-qc`
  - Claim: For image receptor modalities other than screen-film (e.g., FFDM, DBT), the QA program is substantially the same as the image receptor manufacturer's recommended program, except that the dose may not exceed the screen-film maximum.
  - Excerpt: For systems with image receptor modalities other than screen-film, the quality assurance program shall be substantially the same as the quality assurance program recommended by the image receptor manufacturer, except that the maximum allowable dose shall not exceed the maximum allowable dose for screen-film systems
  - Citation: `quoted_public` · locator: 21 CFR 900.12(e)(6), (b)(16)
  - Source: `src-ecfr-21-cfr-900` — https://www.ecfr.gov/current/title-21/chapter-I/subchapter-I/part-900
  - Retrieval: 2026-10-06 · status `retrieved`

**Aaron decision**

- [x] Confirm — 2026-10-06, Aaron Bolzle
- [ ] Reject
- [ ] Needs more source

_Notes:_ Aaron Bolzle confirmed the cited evidence supports the claims (maintainer source check; not clinical review).


---

### 10. `obj-ap-clock-quadrants`

**Title / statement:** Localize findings using clock positions and quadrants for right and left breasts.

**Current sourceState:** `needs_source`

**Domain / topic:** `dom-procedures` / `top-ap-localization`

**Dependent items**

- Lessons (1): `les-ap-clock-quadrants`
- Cards (4): `card-ap-quadrants`, `card-ap-central`, `card-ap-ax-tail`, `card-ap-clock-overlap`
- Practice questions (5): `q-ap-001`, `q-ap-002`, `q-ap-003`, `q-ap-004`, `q-ap-005`
- Form A questions (3): `q-ap-048`, `q-ap-051`, `q-ap-052`

**Claims / evidence**

- `ev-ap-seer-quadrants-clock`
  - Claim: Each breast is divided into four quadrants (upper inner, upper outer, lower inner, lower outer) plus a central portion containing areola and nipple; tumor location is typically described as a clock time. ICD-O includes axillary tail (C506). Overlapping lesions include tumors at 3, 6, 9, or 12 o’clock.
  - Excerpt: Each breast is divided into four quadrants-Upper inner, upper outer, lower inner, and lower outer, as well as a central portion that contains the areola and nipple. The location of the tumor in the breast is typically described as specific time on a clock.
  - Citation: `quoted_public` · locator: SEER Training — Breast anatomy / ICD-O-3 table
  - Source: `src-nci-seer-breast` — https://training.seer.cancer.gov/breast/anatomy.html
  - Retrieval: 2026-10-06 · status `retrieved`

**Aaron decision**

- [x] Confirm — 2026-10-06, Aaron Bolzle
- [ ] Reject
- [ ] Needs more source

_Notes:_ Aaron Bolzle confirmed the cited evidence supports the claims (maintainer source check; not clinical review).


---

### 11. `obj-ap-external-landmarks`

**Title / statement:** Identify external landmarks including breast margins, nipple, areola (Morgagni tubercles, Montgomery glands), skin structures, axillary tail, inframammary fold, and pectoral muscle angle.

**Current sourceState:** `needs_source`

**Domain / topic:** `dom-procedures` / `top-ap-external`

**Dependent items**

- Lessons (1): `les-ap-external`
- Cards (3): `card-ap-areola`, `card-ap-montgomery`, `card-ap-no-muscle`
- Practice questions (4): `q-ap-006`, `q-ap-007`, `q-ap-008`, `q-ap-009`
- Form A questions (1): `q-ap-053`

**Claims / evidence**

- `ev-ap-dict-areola`
  - Claim: The areola is the dark-colored skin on the breast surrounding the nipple.
  - Excerpt: The area of dark-colored skin on the breast that surrounds the nipple.
  - Citation: `quoted_public` · locator: NCI Dictionary — areola (termId 46525)
  - Source: `src-nci-dictionary` — https://www.cancer.gov/publications/dictionaries/cancer-terms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-openstax-structure`
  - Claim: Non-pregnant/non-lactating breast is mostly adipose and collagenous tissue. Alveoli are lined by milk-secreting cells (lactocytes) surrounded by contractile myoepithelial cells. Clusters of alveoli draining to a common duct are lobules (about 12–20). Milk drains via lactiferous ducts to lactiferous sinuses and nipple pores. Montgomery glands on the areola secrete oil.
  - Excerpt: Breast alveoli are balloon-like structures lined with milk-secreting cuboidal cells, or lactocytes, that are surrounded by a net of contractile myoepithelial cells. … Clusters of alveoli that drain to a common duct are called lobules; the lactating female has 12–20 lobules organized radially around the nipple. … The small bumps of the areola … are called Montgomery glands.
  - Citation: `quoted_public` · locator: Anatomy and Physiology 2e § 28.6 Lactation — Structure of the Lactating Breast
  - Source: `src-openstax-anatomy-phys-2e` — https://openstax.org/books/anatomy-and-physiology-2e/pages/28-6-lactation
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-seer-no-muscle-in-breast`
  - Claim: The breast itself has no muscle tissue; a layer of fat surrounds the mammary glands.
  - Excerpt: The breast itself has no muscle tissue. A layer of fat surrounds the mammary glands.
  - Citation: `quoted_public` · locator: SEER Training — Breast anatomy
  - Source: `src-nci-seer-breast` — https://training.seer.cancer.gov/breast/anatomy.html
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-seer-quadrants-clock`
  - Claim: Each breast is divided into four quadrants (upper inner, upper outer, lower inner, lower outer) plus a central portion containing areola and nipple; tumor location is typically described as a clock time. ICD-O includes axillary tail (C506). Overlapping lesions include tumors at 3, 6, 9, or 12 o’clock.
  - Excerpt: Each breast is divided into four quadrants-Upper inner, upper outer, lower inner, and lower outer, as well as a central portion that contains the areola and nipple. The location of the tumor in the breast is typically described as specific time on a clock.
  - Citation: `quoted_public` · locator: SEER Training — Breast anatomy / ICD-O-3 table
  - Source: `src-nci-seer-breast` — https://training.seer.cancer.gov/breast/anatomy.html
  - Retrieval: 2026-10-06 · status `retrieved`

**Aaron decision**

- [x] Confirm — 2026-10-06, Aaron Bolzle
- [ ] Reject
- [ ] Needs more source

_Notes:_ Aaron Bolzle confirmed the cited evidence supports the claims (maintainer source check; not clinical review).


---

### 12. `obj-ap-internal-structures`

**Title / statement:** Describe fascial layers, retroglandular space, fibroglandular and adipose tissue, Cooper ligaments, pectoral muscle, vessels, and lymphatics.

**Current sourceState:** `needs_source`

**Domain / topic:** `dom-procedures` / `top-ap-internal`

**Dependent items**

- Lessons (1): `les-ap-internal`
- Cards (3): `card-ap-suspensory`, `card-ap-fibroglandular`, `card-ap-sentinel`
- Practice questions (4): `q-ap-010`, `q-ap-011`, `q-ap-012`, `q-ap-013`
- Form A questions (7): `q-ap-054`, `q-ap-055`, `q-ap-056`, `q-ap-057`, `q-ap-089`, `q-ap-090`, `q-ap-092`

**Claims / evidence**

- `ev-ap-dict-fibroglandular`
  - Claim: Fibroglandular tissue is fibrous connective tissue plus glandular tissue (ducts and lobules); it often appears dense on a mammogram and may make cancer harder to find.
  - Excerpt: A term used to describe breast tissue that is made up of fibrous connective tissue and glandular tissue (milk ducts and lobules). Fibroglandular breast tissue often appears dense on a mammogram, which may make it harder to find breast cancer or other changes in the breast.
  - Citation: `quoted_public` · locator: NCI Dictionary — fibroglandular breast tissue (termId 809580)
  - Source: `src-nci-dictionary` — https://www.cancer.gov/publications/dictionaries/cancer-terms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-dict-sentinel`
  - Claim: The sentinel lymph node is the first lymph node to which cancer is likely to spread from the primary tumor.
  - Excerpt: The first lymph node to which cancer is likely to spread from the primary tumor.
  - Citation: `quoted_public` · locator: NCI Dictionary — sentinel lymph node (termId 45876)
  - Source: `src-nci-dictionary` — https://www.cancer.gov/publications/dictionaries/cancer-terms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-nci-dense-definition`
  - Claim: Breasts contain glandular, fibrous connective, and fatty tissue. Density describes their relative amounts on a mammogram. Dense tissue has relatively more glandular/fibrous and less fatty tissue.
  - Excerpt: Breasts contain glandular tissue, fibrous connective tissue, and fatty breast tissue. Breast density is a term that describes the relative amount of these different types of breast tissue as seen on a mammogram.
  - Citation: `quoted_public` · locator: NCI Dense Breasts FAQ — What are dense breasts? (updated 2025-12-02)
  - Source: `src-nci-dense-breasts` — https://www.cancer.gov/types/breast/breast-changes/dense-breasts
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-openstax-structure`
  - Claim: Non-pregnant/non-lactating breast is mostly adipose and collagenous tissue. Alveoli are lined by milk-secreting cells (lactocytes) surrounded by contractile myoepithelial cells. Clusters of alveoli draining to a common duct are lobules (about 12–20). Milk drains via lactiferous ducts to lactiferous sinuses and nipple pores. Montgomery glands on the areola secrete oil.
  - Excerpt: Breast alveoli are balloon-like structures lined with milk-secreting cuboidal cells, or lactocytes, that are surrounded by a net of contractile myoepithelial cells. … Clusters of alveoli that drain to a common duct are called lobules; the lactating female has 12–20 lobules organized radially around the nipple. … The small bumps of the areola … are called Montgomery glands.
  - Citation: `quoted_public` · locator: Anatomy and Physiology 2e § 28.6 Lactation — Structure of the Lactating Breast
  - Source: `src-openstax-anatomy-phys-2e` — https://openstax.org/books/anatomy-and-physiology-2e/pages/28-6-lactation
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-openstax-suspensory`
  - Claim: Supporting the breasts are bands of connective tissue called suspensory ligaments that connect breast tissue to the dermis of the overlying skin.
  - Excerpt: Supporting the breasts are multiple bands of connective tissue called suspensory ligaments that connect the breast tissue to the dermis of the overlying skin.
  - Citation: `quoted_public` · locator: Clinical Nursing Skills § 23.4 / OpenStax A&P key term suspensory ligaments
  - Source: `src-openstax-clinical-nursing-breast` — https://openstax.org/books/clinical-nursing-skills/pages/23-4-breast-and-lymphatic-system
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-seer-lobes-ducts`
  - Claim: Each breast has 15–20 lobes arranged circularly; fat covering the lobes contributes to size/shape; each lobe contains lobules ending in milk-making bulbs; lobes/lobules/bulbs are linked by ducts; breasts rest on pectoralis major and are attached by ligaments.
  - Excerpt: The breast is made up of lobes and ducts. Each breast has 15 to 20 sections called lobes, which are arranged in a circular fashion. The fat (subcutaneous adipose tissue) that covers the lobes gives the breast its size and shape. Each lobe has many smaller sections called lobules. Lobules end in dozens of tiny bulbs that can make milk. The lobes, lobules, and bulbs are linked by thin tubes called ducts. … They rest on the major chest muscle, the pectoralis major.
  - Citation: `quoted_public` · locator: SEER Training — Breast anatomy (updated 2025-01-10)
  - Source: `src-nci-seer-breast` — https://training.seer.cancer.gov/breast/anatomy.html
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-seer-lymph-groups`
  - Claim: Regional lymph nodes for breast include axillary levels I–III (including interpectoral/Rotter’s), infraclavicular, internal mammary (parasternal), intramammary, and supraclavicular nodes. A sentinel lymph node is the first node to which cancer cells are most likely to spread from a primary tumor.
  - Excerpt: Groups of lymph nodes are found near the breast in the axilla (under the arm), above the collarbone, and in the chest. … Per the NCI Dictionary A sentinel lymph node is “defined as the first lymph node to which cancer cells are most likely to spread from a primary tumor.”
  - Citation: `quoted_public` · locator: SEER Training — Breast anatomy, Lymph Nodes
  - Source: `src-nci-seer-breast` — https://training.seer.cancer.gov/breast/anatomy.html
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-seer-no-muscle-in-breast`
  - Claim: The breast itself has no muscle tissue; a layer of fat surrounds the mammary glands.
  - Excerpt: The breast itself has no muscle tissue. A layer of fat surrounds the mammary glands.
  - Citation: `quoted_public` · locator: SEER Training — Breast anatomy
  - Source: `src-nci-seer-breast` — https://training.seer.cancer.gov/breast/anatomy.html
  - Retrieval: 2026-10-06 · status `retrieved`

**Aaron decision**

- [x] Confirm — 2026-10-06, Aaron Bolzle
- [ ] Reject
- [ ] Needs more source

_Notes:_ Aaron Bolzle confirmed the cited evidence supports the claims (maintainer source check; not clinical review).


---

### 13. `obj-ap-tdlu`

**Title / statement:** Describe the terminal ductal lobular unit and its parts, and why it matters in pathology.

**Current sourceState:** `needs_source`

**Domain / topic:** `dom-procedures` / `top-ap-internal`

**Dependent items**

- Lessons (1): `les-ap-ductal-lobular`
- Cards (3): `card-ap-lobes`, `card-ap-ductal-origin`, `card-ap-lobular-origin`
- Practice questions (4): `q-ap-014`, `q-ap-015`, `q-ap-016`, `q-ap-017`
- Form A questions (5): `q-ap-053`, `q-ap-058`, `q-ap-059`, `q-ap-060`, `q-ap-089`

**Claims / evidence**

- `ev-ap-openstax-structure`
  - Claim: Non-pregnant/non-lactating breast is mostly adipose and collagenous tissue. Alveoli are lined by milk-secreting cells (lactocytes) surrounded by contractile myoepithelial cells. Clusters of alveoli draining to a common duct are lobules (about 12–20). Milk drains via lactiferous ducts to lactiferous sinuses and nipple pores. Montgomery glands on the areola secrete oil.
  - Excerpt: Breast alveoli are balloon-like structures lined with milk-secreting cuboidal cells, or lactocytes, that are surrounded by a net of contractile myoepithelial cells. … Clusters of alveoli that drain to a common duct are called lobules; the lactating female has 12–20 lobules organized radially around the nipple. … The small bumps of the areola … are called Montgomery glands.
  - Citation: `quoted_public` · locator: Anatomy and Physiology 2e § 28.6 Lactation — Structure of the Lactating Breast
  - Source: `src-openstax-anatomy-phys-2e` — https://openstax.org/books/anatomy-and-physiology-2e/pages/28-6-lactation
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-seer-ductal-vs-lobular-origin`
  - Claim: Ductal carcinoma refers to cancer that starts in the milk ducts; lobular carcinoma originates in the lobes (lobules).
  - Excerpt: Ductal carcinoma refers to cancer that starts in the mild ducts (mammary glands), while lobular carcinoma originates in the lobes (lobules).
  - Citation: `quoted_public` · locator: SEER Training — Breast anatomy
  - Source: `src-nci-seer-breast` — https://training.seer.cancer.gov/breast/anatomy.html
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-seer-lobes-ducts`
  - Claim: Each breast has 15–20 lobes arranged circularly; fat covering the lobes contributes to size/shape; each lobe contains lobules ending in milk-making bulbs; lobes/lobules/bulbs are linked by ducts; breasts rest on pectoralis major and are attached by ligaments.
  - Excerpt: The breast is made up of lobes and ducts. Each breast has 15 to 20 sections called lobes, which are arranged in a circular fashion. The fat (subcutaneous adipose tissue) that covers the lobes gives the breast its size and shape. Each lobe has many smaller sections called lobules. Lobules end in dozens of tiny bulbs that can make milk. The lobes, lobules, and bulbs are linked by thin tubes called ducts. … They rest on the major chest muscle, the pectoralis major.
  - Citation: `quoted_public` · locator: SEER Training — Breast anatomy (updated 2025-01-10)
  - Source: `src-nci-seer-breast` — https://training.seer.cancer.gov/breast/anatomy.html
  - Retrieval: 2026-10-06 · status `retrieved`

**Aaron decision**

- [x] Confirm — 2026-10-06, Aaron Bolzle
- [ ] Reject
- [ ] Needs more source

_Notes:_ Aaron Bolzle confirmed the cited evidence supports the claims (maintainer source check; not clinical review).


---

### 14. `obj-ap-cytology`

**Title / statement:** Define epithelial cells, myoepithelial cells, and basement membrane, and relate them to in situ versus invasive disease.

**Current sourceState:** `needs_source`

**Domain / topic:** `dom-procedures` / `top-ap-internal`

**Dependent items**

- Lessons (1): `les-ap-insitu-invasive`
- Cards (2): `card-ap-insitu`, `card-ap-myoepithelial`
- Practice questions (4): `q-ap-018`, `q-ap-019`, `q-ap-020`, `q-ap-021`
- Form A questions (4): `q-ap-059`, `q-ap-061`, `q-ap-062`, `q-ap-088`

**Claims / evidence**

- `ev-ap-dict-dcis`
  - Claim: DCIS: abnormal cells in the lining of a breast duct that have not spread outside the duct to other breast tissues; may become invasive in some cases; also called intraductal breast carcinoma.
  - Excerpt: A condition in which abnormal cells are found in the lining of a breast duct. The abnormal cells have not spread outside the duct to other tissues in the breast.
  - Citation: `quoted_public` · locator: NCI Dictionary of Cancer Terms — ductal carcinoma in situ (termId 45674)
  - Source: `src-nci-dictionary` — https://www.cancer.gov/publications/dictionaries/cancer-terms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-dict-idc`
  - Claim: Invasive ductal carcinoma is the most common invasive breast cancer; it begins in duct lining and spreads outside the ducts to surrounding normal tissue and can spread via blood/lymph.
  - Excerpt: The most common type of invasive breast cancer. It begins in the lining of the milk ducts … and spreads outside the ducts to surrounding normal tissue.
  - Citation: `quoted_public` · locator: NCI Dictionary — invasive ductal carcinoma (termId 750209)
  - Source: `src-nci-dictionary` — https://www.cancer.gov/publications/dictionaries/cancer-terms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-dict-ilc`
  - Claim: Invasive lobular carcinoma begins in breast lobules (milk glands) and spreads to surrounding normal tissue; can spread via blood/lymph.
  - Excerpt: A type of invasive breast cancer that begins in the lobules (milk glands) of the breast and spreads to surrounding normal tissue.
  - Citation: `quoted_public` · locator: NCI Dictionary — invasive lobular carcinoma (termId 750211)
  - Source: `src-nci-dictionary` — https://www.cancer.gov/publications/dictionaries/cancer-terms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-dict-insitu`
  - Claim: In situ means in its original place; in carcinoma in situ, abnormal cells have not spread from where they first formed.
  - Excerpt: In its original place. For example, in carcinoma in situ, abnormal cells are found only in the place where they first formed. They have not spread.
  - Citation: `quoted_public` · locator: NCI Dictionary — in situ (termId 638205)
  - Source: `src-nci-dictionary` — https://www.cancer.gov/publications/dictionaries/cancer-terms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-dict-lcis`
  - Claim: LCIS: abnormal cells in breast lobules; seldom becomes invasive cancer itself, but increases risk of breast cancer in either breast.
  - Excerpt: A condition in which abnormal cells are found in the lobules of the breast. This condition seldom becomes invasive cancer. However, having lobular carcinoma in situ in one breast increases the risk of developing breast cancer in either breast.
  - Citation: `quoted_public` · locator: NCI Dictionary — lobular carcinoma in situ (termId 46315)
  - Source: `src-nci-dictionary` — https://www.cancer.gov/publications/dictionaries/cancer-terms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-openstax-structure`
  - Claim: Non-pregnant/non-lactating breast is mostly adipose and collagenous tissue. Alveoli are lined by milk-secreting cells (lactocytes) surrounded by contractile myoepithelial cells. Clusters of alveoli draining to a common duct are lobules (about 12–20). Milk drains via lactiferous ducts to lactiferous sinuses and nipple pores. Montgomery glands on the areola secrete oil.
  - Excerpt: Breast alveoli are balloon-like structures lined with milk-secreting cuboidal cells, or lactocytes, that are surrounded by a net of contractile myoepithelial cells. … Clusters of alveoli that drain to a common duct are called lobules; the lactating female has 12–20 lobules organized radially around the nipple. … The small bumps of the areola … are called Montgomery glands.
  - Citation: `quoted_public` · locator: Anatomy and Physiology 2e § 28.6 Lactation — Structure of the Lactating Breast
  - Source: `src-openstax-anatomy-phys-2e` — https://openstax.org/books/anatomy-and-physiology-2e/pages/28-6-lactation
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-seer-histologies`
  - Claim: DCIS develops in milk ducts (~15–20% of breast cancers in this module’s framing). Invasive ductal carcinoma / carcinoma of no special type accounts for about 70% of breast cancers. Invasive lobular carcinoma originates in milk glands and accounts for about 10–15% of invasive breast cancers. Both ductal and lobular carcinomas can be in situ or invasive.
  - Excerpt: The earliest form of the disease, ductal carcinoma in situ (8500/2), comprises about 15-20% of all breast cancers and develops solely in the milk ducts. … Invasive ductal carcinoma accounts for about 70% of breast cancers. … Invasive lobular carcinoma originates in the milk glands and accounts for 10-15% of invasive breast cancers.
  - Citation: `quoted_public` · locator: SEER Training — Types of Breast Histologies (updated 2025-01-10)
  - Source: `src-nci-seer-breast-types` — https://training.seer.cancer.gov/breast/types.html
  - Retrieval: 2026-10-06 · status `retrieved`

**Aaron decision**

- [x] Confirm — 2026-10-06, Aaron Bolzle
- [ ] Reject
- [ ] Needs more source

_Notes:_ Aaron Bolzle confirmed the cited evidence supports the claims (maintainer source check; not clinical review).


---

### 15. `obj-ap-benign-conditions`

**Title / statement:** Describe the typical presentation and mammographic appearance of common benign conditions (cyst, galactocele, fibroadenoma, lipoma, hamartoma, papilloma, duct ectasia, hematoma, abscess, fat necrosis, lymph nodes, gynecomastia, edema, seroma).

**Current sourceState:** `needs_source`

**Domain / topic:** `dom-procedures` / `top-ap-benign`

**Dependent items**

- Lessons (1): `les-ap-benign`
- Cards (2): `card-ap-fibroadenoma`, `card-ap-papilloma`
- Practice questions (5): `q-ap-035`, `q-ap-036`, `q-ap-037`, `q-ap-038`, `q-ap-039`
- Form A questions (4): `q-ap-075`, `q-ap-076`, `q-ap-077`, `q-ap-078`

**Claims / evidence**

- `ev-ap-dict-cyst`
  - Claim: A cyst is a closed sac-like pocket that may contain fluid/air/pus; most cysts are benign. NCI notes smooth/round/clear-edged lumps are often benign cysts.
  - Excerpt: A closed, sac-like pocket of tissue that can form anywhere in the body. It may be filled with fluid, air, pus, or other material. Most cysts are benign (not cancer).
  - Citation: `quoted_public` · locator: NCI Dictionary — cyst (termId 46461) + NCI Mammograms mass description
  - Source: `src-nci-dictionary` — https://www.cancer.gov/publications/dictionaries/cancer-terms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-dict-fat-necrosis`
  - Claim: Fat necrosis is a benign condition after injury/surgery/radiation in which fat may be replaced by a cyst or scar that can feel like a firm lump.
  - Excerpt: A benign condition in which fat tissue in the breast or other organs is damaged by injury, surgery, or radiation therapy. The fat tissue in the breast may be replaced by a cyst or by scar tissue, which may feel like a round, firm lump.
  - Citation: `quoted_public` · locator: NCI Dictionary — fat necrosis (termId 637593)
  - Source: `src-nci-dictionary` — https://www.cancer.gov/publications/dictionaries/cancer-terms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-dict-fibroadenoma`
  - Claim: Fibroadenoma is the most common benign breast tumor (fibrous + glandular); typically painless, mobile, well-defined; most do not increase breast cancer risk.
  - Excerpt: A benign (not cancer) tumor that most often forms in the breast and is made up of fibrous (connective) tissue and glandular tissue. … Fibroadenomas are the most common type of benign breast tumor. … Most fibroadenomas do not increase the risk of breast cancer.
  - Citation: `quoted_public` · locator: NCI Dictionary — fibroadenoma (termId 523438)
  - Source: `src-nci-dictionary` — https://www.cancer.gov/publications/dictionaries/cancer-terms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-dict-lipoma`
  - Claim: A lipoma is a benign tumor made of fat cells.
  - Excerpt: A benign (not cancer) tumor made of fat cells.
  - Citation: `quoted_public` · locator: NCI Dictionary — lipoma (termId 454795)
  - Source: `src-nci-dictionary` — https://www.cancer.gov/publications/dictionaries/cancer-terms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-dict-papilloma`
  - Claim: Intraductal papilloma is a benign wart-like growth in a milk duct, often near the nipple, and may cause nipple discharge; a single papilloma does not increase breast cancer risk.
  - Excerpt: A benign (not cancer), wart-like growth in a milk duct of the breast. It is usually found close to the nipple and may cause a discharge from the nipple. … Having a single papilloma does not increase the risk of breast cancer.
  - Citation: `quoted_public` · locator: NCI Dictionary — intraductal papilloma (termId 430864)
  - Source: `src-nci-dictionary` — https://www.cancer.gov/publications/dictionaries/cancer-terms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-nci-mass-calcs`
  - Claim: Mammograms can show masses, calcifications, and density. Smooth/round/clear-edged lumps are often benign cysts; jagged/irregular features may need more tests. Macrocalcifications are often benign; clustered microcalcifications may suggest DCIS or cancer. Neither calcification type is related to dietary calcium.
  - Excerpt: A lump that is not cancer often looks smooth and round and has clear, defined edges. … Macrocalcifications look like small white dots on a mammogram. They are often … usually benign. Microcalcifications look like white specks … they may be a sign of DCIS or breast cancer.
  - Citation: `quoted_public` · locator: NCI Mammograms — What can a mammogram show?
  - Source: `src-nci-mammograms` — https://www.cancer.gov/types/breast/screening/mammograms
  - Retrieval: 2026-10-06 · status `retrieved`

**Aaron decision**

- [x] Confirm — 2026-10-06, Aaron Bolzle
- [ ] Reject
- [ ] Needs more source

_Notes:_ Aaron Bolzle confirmed the cited evidence supports the claims (maintainer source check; not clinical review).


---

### 16. `obj-ap-high-risk-lesions`

**Title / statement:** Define LCIS, ADH, ALH, papilloma with atypia, flat epithelial atypia, radial scar, and phyllodes tumor, and why upgrade potential matters.

**Current sourceState:** `needs_source`

**Domain / topic:** `dom-procedures` / `top-ap-high-risk`

**Dependent items**

- Lessons (1): `les-ap-high-risk`
- Cards (2): `card-ap-adh`, `card-ap-lcis`
- Practice questions (4): `q-ap-040`, `q-ap-041`, `q-ap-042`, `q-ap-043`
- Form A questions (6): `q-ap-062`, `q-ap-079`, `q-ap-080`, `q-ap-081`, `q-ap-082`, `q-ap-083`

**Claims / evidence**

- `ev-ap-dict-adh`
  - Claim: ADH is a benign condition with increased abnormal-appearing cells in duct linings that increases breast cancer risk.
  - Excerpt: A benign (not cancer) condition in which there are more cells than normal in the lining of breast ducts and the cells look abnormal under a microscope. Having atypical ductal hyperplasia increases the risk of breast cancer.
  - Citation: `quoted_public` · locator: NCI Dictionary — atypical ductal hyperplasia (termId 638190)
  - Source: `src-nci-dictionary` — https://www.cancer.gov/publications/dictionaries/cancer-terms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-dict-alh`
  - Claim: ALH is a benign condition with increased abnormal-appearing cells in breast lobules that increases breast cancer risk.
  - Excerpt: A benign (not cancer) condition in which there are more cells than normal in the breast lobules and the cells look abnormal under a microscope. Having atypical lobular hyperplasia increases the risk of breast cancer.
  - Citation: `quoted_public` · locator: NCI Dictionary — atypical lobular hyperplasia (termId 638183)
  - Source: `src-nci-dictionary` — https://www.cancer.gov/publications/dictionaries/cancer-terms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-dict-insitu`
  - Claim: In situ means in its original place; in carcinoma in situ, abnormal cells have not spread from where they first formed.
  - Excerpt: In its original place. For example, in carcinoma in situ, abnormal cells are found only in the place where they first formed. They have not spread.
  - Citation: `quoted_public` · locator: NCI Dictionary — in situ (termId 638205)
  - Source: `src-nci-dictionary` — https://www.cancer.gov/publications/dictionaries/cancer-terms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-dict-lcis`
  - Claim: LCIS: abnormal cells in breast lobules; seldom becomes invasive cancer itself, but increases risk of breast cancer in either breast.
  - Excerpt: A condition in which abnormal cells are found in the lobules of the breast. This condition seldom becomes invasive cancer. However, having lobular carcinoma in situ in one breast increases the risk of developing breast cancer in either breast.
  - Citation: `quoted_public` · locator: NCI Dictionary — lobular carcinoma in situ (termId 46315)
  - Source: `src-nci-dictionary` — https://www.cancer.gov/publications/dictionaries/cancer-terms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-dict-papilloma`
  - Claim: Intraductal papilloma is a benign wart-like growth in a milk duct, often near the nipple, and may cause nipple discharge; a single papilloma does not increase breast cancer risk.
  - Excerpt: A benign (not cancer), wart-like growth in a milk duct of the breast. It is usually found close to the nipple and may cause a discharge from the nipple. … Having a single papilloma does not increase the risk of breast cancer.
  - Citation: `quoted_public` · locator: NCI Dictionary — intraductal papilloma (termId 430864)
  - Source: `src-nci-dictionary` — https://www.cancer.gov/publications/dictionaries/cancer-terms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-dict-phyllodes`
  - Claim: Phyllodes tumors are rare connective-tissue tumors that grow quickly; most are benign but some are malignant or borderline; usually surgically removed; can recur.
  - Excerpt: A rare tumor that usually forms in the connective tissue of the breast. Phyllodes tumors tend to grow quickly and get large, but they rarely spread to other parts of the body. Most are benign … but some may be malignant … or borderline.
  - Citation: `quoted_public` · locator: NCI Dictionary — phyllodes tumor (termId 46035)
  - Source: `src-nci-dictionary` — https://www.cancer.gov/publications/dictionaries/cancer-terms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-dict-radial-scar`
  - Claim: Radial scar is a benign hardened tissue area that may look like cancer on a mammogram; biopsy is usually needed to differentiate.
  - Excerpt: A benign (not cancer) area of hardened tissue in the breast that looks like a scar when viewed under a microscope. … may look like breast cancer on a mammogram … A biopsy is usually needed to tell the difference between these lesions and breast cancer.
  - Citation: `quoted_public` · locator: NCI Dictionary — radial scar (termId 804972)
  - Source: `src-nci-dictionary` — https://www.cancer.gov/publications/dictionaries/cancer-terms
  - Retrieval: 2026-10-06 · status `retrieved`

**Aaron decision**

- [x] Confirm — 2026-10-06, Aaron Bolzle
- [ ] Reject
- [ ] Needs more source

_Notes:_ Aaron Bolzle confirmed the cited evidence supports the claims (maintainer source check; not clinical review).


---

### 17. `obj-ap-malignant`

**Title / statement:** Describe DCIS, invasive ductal and lobular carcinoma, inflammatory carcinoma, Paget disease, sarcoma, lymphoma, and metastases at a technologist level.

**Current sourceState:** `needs_source`

**Domain / topic:** `dom-procedures` / `top-ap-malignant`

**Dependent items**

- Lessons (1): `les-ap-malignant`
- Cards (4): `card-ap-dcis`, `card-ap-idc`, `card-ap-ibc`, `card-ap-paget`
- Practice questions (5): `q-ap-044`, `q-ap-045`, `q-ap-046`, `q-ap-047`, `q-ap-050`
- Form A questions (8): `q-ap-061`, `q-ap-084`, `q-ap-085`, `q-ap-086`, `q-ap-087`, `q-ap-088`, `q-ap-091`, `q-ap-093`

**Claims / evidence**

- `ev-ap-dict-dcis`
  - Claim: DCIS: abnormal cells in the lining of a breast duct that have not spread outside the duct to other breast tissues; may become invasive in some cases; also called intraductal breast carcinoma.
  - Excerpt: A condition in which abnormal cells are found in the lining of a breast duct. The abnormal cells have not spread outside the duct to other tissues in the breast.
  - Citation: `quoted_public` · locator: NCI Dictionary of Cancer Terms — ductal carcinoma in situ (termId 45674)
  - Source: `src-nci-dictionary` — https://www.cancer.gov/publications/dictionaries/cancer-terms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-dict-ibc`
  - Claim: Inflammatory breast cancer is rare and fast-growing; cancer cells block skin lymph vessels, causing swollen/inflamed appearance; often no palpable lump and may not be seen on mammogram; peau d’orange-like skin changes; usually invasive ductal.
  - Excerpt: A rare, fast-growing type of breast cancer in which cancer cells block lymph vessels in the skin of the breast, causing the breast to look swollen or inflamed. Inflammatory breast cancer usually does not form a lump that can be felt and may not be seen on a mammogram.
  - Citation: `quoted_public` · locator: NCI Dictionary — inflammatory breast cancer (termId 45313)
  - Source: `src-nci-dictionary` — https://www.cancer.gov/publications/dictionaries/cancer-terms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-dict-idc`
  - Claim: Invasive ductal carcinoma is the most common invasive breast cancer; it begins in duct lining and spreads outside the ducts to surrounding normal tissue and can spread via blood/lymph.
  - Excerpt: The most common type of invasive breast cancer. It begins in the lining of the milk ducts … and spreads outside the ducts to surrounding normal tissue.
  - Citation: `quoted_public` · locator: NCI Dictionary — invasive ductal carcinoma (termId 750209)
  - Source: `src-nci-dictionary` — https://www.cancer.gov/publications/dictionaries/cancer-terms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-dict-ilc`
  - Claim: Invasive lobular carcinoma begins in breast lobules (milk glands) and spreads to surrounding normal tissue; can spread via blood/lymph.
  - Excerpt: A type of invasive breast cancer that begins in the lobules (milk glands) of the breast and spreads to surrounding normal tissue.
  - Citation: `quoted_public` · locator: NCI Dictionary — invasive lobular carcinoma (termId 750211)
  - Source: `src-nci-dictionary` — https://www.cancer.gov/publications/dictionaries/cancer-terms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-dict-insitu`
  - Claim: In situ means in its original place; in carcinoma in situ, abnormal cells have not spread from where they first formed.
  - Excerpt: In its original place. For example, in carcinoma in situ, abnormal cells are found only in the place where they first formed. They have not spread.
  - Citation: `quoted_public` · locator: NCI Dictionary — in situ (termId 638205)
  - Source: `src-nci-dictionary` — https://www.cancer.gov/publications/dictionaries/cancer-terms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-dict-paget`
  - Claim: Paget disease of the breast involves nipple and usually areola with skin changes (itching, flaking, discharge); most patients also have DCIS or invasive breast cancer.
  - Excerpt: A rare type of breast cancer that involves the nipple and, usually, the areola … Most people with Paget disease of the breast also have ductal carcinoma in situ … or invasive breast cancer.
  - Citation: `quoted_public` · locator: NCI Dictionary — Paget disease of the breast/nipple
  - Source: `src-nci-dictionary` — https://www.cancer.gov/publications/dictionaries/cancer-terms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-dict-sentinel`
  - Claim: The sentinel lymph node is the first lymph node to which cancer is likely to spread from the primary tumor.
  - Excerpt: The first lymph node to which cancer is likely to spread from the primary tumor.
  - Citation: `quoted_public` · locator: NCI Dictionary — sentinel lymph node (termId 45876)
  - Source: `src-nci-dictionary` — https://www.cancer.gov/publications/dictionaries/cancer-terms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-nci-mass-calcs`
  - Claim: Mammograms can show masses, calcifications, and density. Smooth/round/clear-edged lumps are often benign cysts; jagged/irregular features may need more tests. Macrocalcifications are often benign; clustered microcalcifications may suggest DCIS or cancer. Neither calcification type is related to dietary calcium.
  - Excerpt: A lump that is not cancer often looks smooth and round and has clear, defined edges. … Macrocalcifications look like small white dots on a mammogram. They are often … usually benign. Microcalcifications look like white specks … they may be a sign of DCIS or breast cancer.
  - Citation: `quoted_public` · locator: NCI Mammograms — What can a mammogram show?
  - Source: `src-nci-mammograms` — https://www.cancer.gov/types/breast/screening/mammograms
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-ap-seer-histologies`
  - Claim: DCIS develops in milk ducts (~15–20% of breast cancers in this module’s framing). Invasive ductal carcinoma / carcinoma of no special type accounts for about 70% of breast cancers. Invasive lobular carcinoma originates in milk glands and accounts for about 10–15% of invasive breast cancers. Both ductal and lobular carcinomas can be in situ or invasive.
  - Excerpt: The earliest form of the disease, ductal carcinoma in situ (8500/2), comprises about 15-20% of all breast cancers and develops solely in the milk ducts. … Invasive ductal carcinoma accounts for about 70% of breast cancers. … Invasive lobular carcinoma originates in the milk glands and accounts for 10-15% of invasive breast cancers.
  - Citation: `quoted_public` · locator: SEER Training — Types of Breast Histologies (updated 2025-01-10)
  - Source: `src-nci-seer-breast-types` — https://training.seer.cancer.gov/breast/types.html
  - Retrieval: 2026-10-06 · status `retrieved`

**Aaron decision**

- [x] Confirm — 2026-10-06, Aaron Bolzle
- [ ] Reject
- [ ] Needs more source

_Notes:_ Aaron Bolzle confirmed the cited evidence supports the claims (maintainer source check; not clinical review).


---

### 18. `obj-pp-spot-mag-nipple`

**Title / statement:** Describe nipple-in-profile, anterior compression, spot compression, and magnification views and their purposes.

**Current sourceState:** `needs_source`

**Domain / topic:** `dom-procedures` / `top-pp-additional-views`

**Dependent items**

- Lessons (1): `les-pos-problem-solving`
- Cards (1): `card-pos-mag-range`
- Practice questions (3): `q-pos-037`, `q-pos-038`, `q-pos-040`
- Form A questions (4): `q-pos-056`, `q-pos-057`, `q-pos-058`, `q-pos-083`

**Claims / evidence**

- `ev-mqsa-compression-device`
  - Claim: Every mammography system has a compression device with initial power-driven compression activated by hands-free controls from both sides of the patient and fine-adjustment controls operable from both sides. Paddles match the full-field receptor sizes; special-purpose paddles (e.g., spot) may be provided. A flat paddle may not deflect from parallel by more than 1.0 cm when compression is applied, and its chest-wall edge is straight, parallel to the receptor edge, and must not appear on the image.
  - Excerpt: the compression paddle shall be flat and parallel to the breast support table and shall not deflect from parallel by more than 1.0 cm at any point on the surface of the compression paddle when compression is applied.
  - Citation: `quoted_public` · locator: 21 CFR 900.12(b)(8)
  - Source: `src-ecfr-21-cfr-900` — https://www.ecfr.gov/current/title-21/chapter-I/subchapter-I/part-900
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-mqsa-magnification-equipment`
  - Claim: Systems used for noninterventional problem solving have magnification capability; systems used for magnification provide at least one magnification value from 1.4 to 2.0 and can operate with the grid removed.
  - Excerpt: (ii) Systems used for magnification procedures shall provide, at a minimum, at least one magnification value within the range of 1.4 to 2.0.
  - Citation: `quoted_public` · locator: 21 CFR 900.12(b)(4)(iii), (b)(6)
  - Source: `src-ecfr-21-cfr-900` — https://www.ecfr.gov/current/title-21/chapter-I/subchapter-I/part-900
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-mqsa-screening-diagnostic-definition`
  - Claim: For audit purposes, a screening mammogram is routine views of an asymptomatic patient; a diagnostic mammogram is individualized views for a patient with symptoms, physical signs, or abnormal screening findings.
  - Excerpt: a mammographic examination consisting of routine views of an asymptomatic patient shall be termed a screening mammogram, while a mammographic examination consisting of individualized views of a patient with breast symptoms, physical signs of breast disease, or abnormal findings on a screening mammogram shall be termed a diagnostic mammogram.
  - Citation: `quoted_public` · locator: 21 CFR 900.12(f)(1)
  - Source: `src-ecfr-21-cfr-900` — https://www.ecfr.gov/current/title-21/chapter-I/subchapter-I/part-900
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-pos-mqsa-magnification-capability`
  - Claim: Systems used for noninterventional problem solving must have magnification capability; magnification systems provide at least one magnification value between 1.4 and 2.0 and can operate with the grid removed.
  - Excerpt: Systems used for magnification procedures shall provide, at a minimum, at least one magnification value within the range of 1.4 to 2.0.
  - Citation: `quoted_public` · locator: 21 CFR 900.12(b)(4)(iii), (b)(6)
  - Source: `src-ecfr-21-cfr-900` — https://www.ecfr.gov/current/title-21/chapter-I/subchapter-I/part-900
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-pos-mqsa-screening-diagnostic-audit`
  - Claim: For audit purposes, a screening mammogram is routine views of an asymptomatic patient; a diagnostic mammogram is individualized views for a patient with symptoms, physical signs, or abnormal screening findings.
  - Excerpt: a mammographic examination consisting of routine views of an asymptomatic patient shall be termed a screening mammogram, while a mammographic examination consisting of individualized views of a patient with breast symptoms, physical signs of breast disease, or abnormal findings on a screening mammogram shall be termed a diagnostic mammogram.
  - Citation: `quoted_public` · locator: 21 CFR 900.12(f)(1)
  - Source: `src-ecfr-21-cfr-900` — https://www.ecfr.gov/current/title-21/chapter-I/subchapter-I/part-900
  - Retrieval: 2026-10-06 · status `retrieved`
- `ev-pos-nci-screening-vs-diagnostic`
  - Claim: Screening mammograms look for cancer before symptoms; diagnostic mammograms evaluate a lump or other change. The same machines are used, but diagnostic exams use images from more angles and therefore a higher radiation dose.
  - Excerpt: diagnostic mammography requires images from more angles than screening mammography, so the dose of radiation is higher.
  - Citation: `quoted_public` · locator: NCI Mammograms fact sheet — What is a mammogram?
  - Source: `src-nci-mammograms` — https://www.cancer.gov/types/breast/screening/mammograms
  - Retrieval: 2026-10-06 · status `retrieved`

**Aaron decision**

- [x] Confirm — 2026-10-06, Aaron Bolzle
- [ ] Reject
- [ ] Needs more source

_Notes:_ Aaron Bolzle confirmed the cited evidence supports the claims (maintainer source check; not clinical review).


---

## Summary checklist

- [x] `obj-pc-pre-exam-instructions` — **Confirm** (2026-10-06, Aaron Bolzle)
- [x] `obj-pc-rapport-support` — **Confirm** (2026-10-06, Aaron Bolzle)
- [x] `obj-pc-explain-compression` — **Confirm** (2026-10-06, Aaron Bolzle)
- [x] `obj-pc-explain-repeat` — **Confirm** (2026-10-06, Aaron Bolzle)
- [x] `obj-pc-screening-guidelines` — **Confirm** (2026-10-06, Aaron Bolzle)
- [x] `obj-pc-typical-dose` — **Confirm** (2026-10-06, Aaron Bolzle)
- [x] `obj-pc-modalities` — **Confirm** (2026-10-06, Aaron Bolzle)
- [x] `obj-ip-acquisition-types` — **Confirm** (2026-10-06, Aaron Bolzle)
- [x] `obj-ip-receptors-monitors` — **Confirm** (2026-10-06, Aaron Bolzle)
- [x] `obj-ap-clock-quadrants` — **Confirm** (2026-10-06, Aaron Bolzle)
- [x] `obj-ap-external-landmarks` — **Confirm** (2026-10-06, Aaron Bolzle)
- [x] `obj-ap-internal-structures` — **Confirm** (2026-10-06, Aaron Bolzle)
- [x] `obj-ap-tdlu` — **Confirm** (2026-10-06, Aaron Bolzle)
- [x] `obj-ap-cytology` — **Confirm** (2026-10-06, Aaron Bolzle)
- [x] `obj-ap-benign-conditions` — **Confirm** (2026-10-06, Aaron Bolzle)
- [x] `obj-ap-high-risk-lesions` — **Confirm** (2026-10-06, Aaron Bolzle)
- [x] `obj-ap-malignant` — **Confirm** (2026-10-06, Aaron Bolzle)
- [x] `obj-pp-spot-mag-nipple` — **Confirm** (2026-10-06, Aaron Bolzle)
