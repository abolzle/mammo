#!/usr/bin/env python3
"""Append Patient Care risk / symptoms / treatment batch into module files."""

from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TODAY = "2026-10-06"

REVIEW_AUTO = {
    "status": "auto_checked",
    "requiresQualifiedReview": False,
    "aiAssisted": True,
    "history": [
        {
            "at": TODAY,
            "status": "draft",
            "actor": "ai-assisted",
            "kind": "revision",
            "note": "AI-assisted draft from retrieved public sources (NCI PDQ/fact sheets, SEER Training, USPSTF, NCI Dictionary).",
        },
        {
            "at": TODAY,
            "status": "auto_checked",
            "actor": "automation",
            "kind": "automated_validation",
            "note": "Passed repository schema/cross-check validation. Not maintainer source-checked; not clinically reviewed. Beta practice only.",
        },
    ],
}

REVIEW_QR = {
    **REVIEW_AUTO,
    "requiresQualifiedReview": True,
    "history": [
        REVIEW_AUTO["history"][0],
        {
            "at": TODAY,
            "status": "auto_checked",
            "actor": "automation",
            "kind": "automated_validation",
            "note": "Passed automated validation. Clinical thresholds, risk magnitudes, or guideline implications need qualified review before verified pools.",
        },
    ],
}


def load(path: Path):
    return json.loads(path.read_text())


def dump(path: Path, obj):
    path.write_text(json.dumps(obj, indent=2, ensure_ascii=False) + "\n")
    print("wrote", path.relative_to(ROOT))


def upsert_source(reg: dict, entry: dict):
    sources = reg["sources"]
    for i, s in enumerate(sources):
        if s["id"] == entry["id"]:
            sources[i] = {**s, **entry}
            return
    sources.append(entry)


def q(
    qid: str,
    objective: str,
    family: str,
    stem: str,
    choices: list[tuple[str, str, str]],
    correct: str,
    explanation: str,
    evidence: list[str],
    *,
    difficulty: str = "recall",
    review=None,
    simpler: str | None = None,
    example: str | None = None,
    est: int = 55,
    extra_objectives: list[str] | None = None,
):
    objs = [objective] + (extra_objectives or [])
    return {
        "id": qid,
        "revision": 1,
        "objectiveIds": objs,
        "familyId": family,
        "pool": "practice",
        "difficultyIntent": difficulty,
        "kind": "single",
        "estSeconds": est,
        "stem": stem,
        "choices": [{"id": cid, "text": text, "rationale": rat} for cid, text, rat in choices],
        "correctChoiceId": correct,
        "explanation": explanation,
        "variants": {
            "simpler": simpler or explanation[:140],
            "example": example or "Match the stem to the sourced definition before eliminating distractors.",
        },
        "evidenceIds": evidence,
        "review": deepcopy(review or REVIEW_AUTO),
    }


def card(cid: str, objective: str, prompt: str, answer: str, evidence: list[str], *, review=None, est: int = 20):
    return {
        "id": cid,
        "revision": 1,
        "objectiveId": objective,
        "estSeconds": est,
        "prompt": prompt,
        "answer": answer,
        "evidenceIds": evidence,
        "review": deepcopy(review or REVIEW_AUTO),
    }


def lesson(**kwargs):
    base = {
        "estMinutes": 3,
        "moduleId": "mod-patient-care",
        "revision": 1,
        "review": deepcopy(REVIEW_AUTO),
    }
    base.update(kwargs)
    if "review" not in kwargs:
        base["review"] = deepcopy(REVIEW_AUTO)
    return base


def main():
    reg = load(ROOT / "content/sources/register.json")

    nci_rights = {
        "status": "public_domain",
        "canRead": True,
        "canQuote": True,
        "canRedistribute": True,
        "canSubmitToAI": True,
        "basis": "NCI reuse policy: text is free of copyright unless otherwise indicated; credit NCI. Graphics vary—check each.",
        "basisSourceId": "src-nci-reuse",
    }

    # Refresh / add sources
    upsert_source(
        reg,
        {
            "id": "src-nci-pdq-breast-screening-hp",
            "title": "Breast Cancer Screening (PDQ®) — Health Professional Version",
            "publisher": "National Cancer Institute",
            "url": "https://www.cancer.gov/types/breast/hp/breast-screening-pdq",
            "publishedOrEffective": "Retrieved 2026-10-06 (PDQ continuously updated)",
            "retrievedOn": TODAY,
            "retrievalStatus": "retrieved",
            "retrievalNote": "Full HP screening PDQ retrieved 2026-10-06 for incidence (2025 estimates), risk factor overview, density/hormone imaging implications, and disparities context.",
            "sections": [
                "Breast Cancer Incidence and Mortality",
                "Risk factors overview",
                "Women with BRCA1 and BRCA2 genetic mutations",
                "Recipients of thoracic radiation",
                "Black women",
                "Breast density",
                "Accuracy of mammography",
            ],
            "rights": nci_rights,
            "kind": "government_guidance",
        },
    )
    upsert_source(
        reg,
        {
            "id": "src-nci-pdq-breast-prevention-hp",
            "title": "Breast Cancer Prevention (PDQ®) — Health Professional Version",
            "publisher": "National Cancer Institute",
            "url": "https://www.cancer.gov/types/breast/hp/breast-prevention-pdq",
            "publishedOrEffective": "Retrieved 2026-10-06 (PDQ continuously updated)",
            "retrievedOn": TODAY,
            "retrievalStatus": "retrieved",
            "retrievalNote": "Retrieved 2026-10-06 for inherent/social risk factors (age, reproductive history, MHT, alcohol, obesity, mantle radiation).",
            "sections": [
                "Overview of risk factors",
                "Age",
                "Reproductive factors",
                "Menopausal hormone therapy",
                "Alcohol",
                "Obesity",
                "Ionizing radiation / mantle radiation",
            ],
            "rights": nci_rights,
            "kind": "government_guidance",
        },
    )
    upsert_source(
        reg,
        {
            "id": "src-nci-pdq-breast-treatment-hp",
            "title": "Breast Cancer Treatment (PDQ®) — Health Professional Version",
            "publisher": "National Cancer Institute",
            "url": "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq",
            "publishedOrEffective": "Retrieved 2026-10-06 (PDQ continuously updated)",
            "retrievedOn": TODAY,
            "retrievalStatus": "retrieved",
            "retrievalNote": "Retrieved 2026-10-06 for surgery taxonomy, SLN biopsy definition, ER/PR/HER2 classification, reconstruction/implant overview at terminology level.",
            "sections": [
                "General Information About Breast Cancer — receptor status",
                "Breast-Conserving Surgery",
                "Mastectomy options",
                "Sentinel lymph node biopsy",
                "Breast Reconstruction",
            ],
            "rights": nci_rights,
            "kind": "government_guidance",
        },
    )
    upsert_source(
        reg,
        {
            "id": "src-nci-seer-breast",
            "title": "SEER Training Modules — Breast Cancer",
            "publisher": "National Cancer Institute / SEER",
            "url": "https://training.seer.cancer.gov/breast/",
            "publishedOrEffective": "Updated January 10, 2025",
            "retrievedOn": TODAY,
            "retrievalStatus": "retrieved",
            "retrievalNote": "Module hub plus incidence, physical-exam (symptoms), surgery of primary site, reconstruction, biomarkers, and treatment overview pages retrieved 2026-10-06.",
            "sections": [
                "Incidence and Mortality",
                "Physical Exam (signs/symptoms)",
                "Surgery of Primary Site",
                "Reconstruction",
                "Biomarkers (ER/PR/HER2)",
                "Treatment overview",
            ],
            "rights": nci_rights,
            "kind": "government_guidance",
        },
    )
    upsert_source(
        reg,
        {
            "id": "src-nci-breast-symptoms",
            "title": "Breast Cancer Signs and Symptoms (NCI)",
            "publisher": "National Cancer Institute",
            "url": "https://www.cancer.gov/types/breast/symptoms",
            "publishedOrEffective": "Posted December 2, 2025",
            "retrievedOn": TODAY,
            "retrievalStatus": "retrieved",
            "retrievalNote": "Patient-facing signs/symptoms page retrieved 2026-10-06.",
            "sections": [
                "Lumps and size/shape change",
                "Nipple changes or discharge",
                "Skin changes",
                "Pain is usually not cancer",
                "Diagnostic follow-up after symptoms",
            ],
            "rights": nci_rights,
            "kind": "government_guidance",
        },
    )
    upsert_source(
        reg,
        {
            "id": "src-nci-breast-surgery",
            "title": "Breast Cancer Surgery (NCI patient topics)",
            "publisher": "National Cancer Institute",
            "url": "https://www.cancer.gov/types/breast/treatment/surgery",
            "publishedOrEffective": "Retrieved 2026-10-06",
            "retrievedOn": TODAY,
            "retrievalStatus": "retrieved",
            "retrievalNote": "Surgery hub plus lumpectomy, mastectomy (including simple/modified radical/prophylactic context), and reconstruction pages retrieved 2026-10-06.",
            "sections": [
                "Surgery overview / SLN biopsy",
                "Lumpectomy",
                "Mastectomy types",
                "Breast reconstruction after mastectomy",
            ],
            "rights": nci_rights,
            "kind": "government_guidance",
        },
    )
    upsert_source(
        reg,
        {
            "id": "src-nci-breast-nonsurgical",
            "title": "Breast Cancer Nonsurgical Treatments (NCI patient topics)",
            "publisher": "National Cancer Institute",
            "url": "https://www.cancer.gov/types/breast/treatment",
            "publishedOrEffective": "Retrieved 2026-10-06",
            "retrievedOn": TODAY,
            "retrievalStatus": "retrieved",
            "retrievalNote": "Hormone therapy, chemotherapy, and radiation patient pages retrieved 2026-10-06 for terminology-level definitions.",
            "sections": [
                "Hormone therapy for breast cancer",
                "Chemotherapy for breast cancer",
                "Radiation for breast cancer",
            ],
            "rights": nci_rights,
            "kind": "government_guidance",
        },
    )
    # Expand dictionary sections
    for s in reg["sources"]:
        if s["id"] == "src-nci-dictionary":
            extra = [
                "lumpectomy",
                "mastectomy",
                "simple mastectomy",
                "modified radical mastectomy",
                "prophylactic mastectomy",
                "sentinel lymph node biopsy",
                "estrogen receptor",
                "progesterone receptor",
                "HER2/neu",
                "chemotherapy",
                "radiation therapy",
                "hormone therapy",
                "breast reconstruction",
            ]
            secs = list(dict.fromkeys([*(s.get("sections") or []), *extra]))
            s["sections"] = secs
            s["retrievedOn"] = TODAY
            s["retrievalStatus"] = "retrieved"
            s["retrievalNote"] = (
                "Additional treatment terminology retrieved via glossary API "
                "https://webapis.cancer.gov/glossary/v1/Terms/Cancer.gov/Patient/en/{termId} on 2026-10-06."
            )
        if s["id"] == "src-openstax-clinical-nursing-breast":
            s["retrievedOn"] = TODAY
            s["retrievalStatus"] = "retrieved"
            s["retrievalNote"] = (
                "Breast assessment expected findings and health-history interview cues retrieved 2026-10-06 "
                "for history-documentation teaching (inspection/palpation findings)."
            )
            s["sections"] = list(
                dict.fromkeys(
                    [
                        *(s.get("sections") or []),
                        "Health history interview / risk factors",
                        "Inspection and palpation expected findings",
                        "Dimpling, discharge, pain cues",
                    ]
                )
            )
        if s["id"] == "src-uspstf-breast-2024":
            s["retrievedOn"] = TODAY
            s["retrievalNote"] = (
                (s.get("retrievalNote") or "")
                + " Reconfirmed 2026-10-06 for average-risk population including transgender men and nonbinary persons AFAB, and high-risk exclusions relevant to imaging pathways."
            ).strip()

    dump(ROOT / "content/sources/register.json", reg)

    # ---- Evidence ----
    ev_path = ROOT / "content/evidence/patient-care.json"
    ev_doc = load(ev_path)
    existing = {e["id"] for e in ev_doc["evidence"]}

    new_ev = [
        {
            "id": "ev-pc-pdq-incidence-2025",
            "sourceId": "src-nci-pdq-breast-screening-hp",
            "locator": "Breast Cancer Screening PDQ (HP), Breast Cancer Incidence and Mortality",
            "claim": "Breast cancer is the most common noncutaneous cancer in U.S. women, with an estimated 316,950 invasive cases, 59,080 in situ cases, and 42,170 deaths expected in 2025. Men account for about 1% of breast cancer cases and deaths.",
            "scope": "Patient-education level incidence framing for technologists.",
            "exceptions": "Estimates are year-specific; always cite the source year. Do not treat as lifetime risk.",
            "excerpt": "Breast cancer is the most common noncutaneous cancer in U.S. women, with an estimated 316,950 cases of invasive disease, 59,080 cases of in situ disease, and 42,170 deaths expected in 2025. … Men account for about 1% of breast cancer cases and breast cancer deaths.",
            "citation": "quoted_public",
            "context": {"modality": [], "jurisdiction": "US", "effective": "2025 estimates in PDQ retrieved 2026-10-06"},
            "review": deepcopy(REVIEW_QR),
        },
        {
            "id": "ev-pc-pdq-brca-share",
            "sourceId": "src-nci-pdq-breast-screening-hp",
            "locator": "Breast Cancer Screening PDQ (HP), Incidence and Mortality",
            "claim": "Women with inherited risk, including BRCA1 and BRCA2 carriers, make up approximately 5% to 10% of breast cancer cases.",
            "scope": "Proportion of cases linked to inherited high-risk mutations.",
            "exceptions": "Not every patient with a family history has a BRCA mutation.",
            "excerpt": "Women with inherited risk, including BRCA1 and BRCA2 gene carriers, make up approximately 5% to 10% of breast cancer cases.",
            "citation": "quoted_public",
            "context": {"modality": [], "jurisdiction": "US"},
            "review": deepcopy(REVIEW_QR),
        },
        {
            "id": "ev-pc-pdq-incidence-drivers",
            "sourceId": "src-nci-pdq-breast-screening-hp",
            "locator": "Breast Cancer Screening PDQ (HP), Incidence and Mortality",
            "claim": "Breast cancer incidence depends on reproductive factors, screening participation, and postmenopausal hormone use. Incidence (especially DCIS) rose after widespread mammography adoption; postmenopausal hormone therapy use was associated with incidence increases that later reversed when use decreased.",
            "scope": "Why incidence numbers move over time — relevant when patients ask about rising rates.",
            "exceptions": "Technologists explain patterns; they do not attribute an individual's diagnosis.",
            "excerpt": "Breast cancer incidence depends on reproductive issues (such as early vs. late pregnancy, multiparity, and breastfeeding), participation in screening, and postmenopausal hormone usage. The incidence of breast cancer (especially ductal carcinoma in situ [DCIS]) increased dramatically after mammography was widely adopted … Widespread use of postmenopausal hormone therapy was associated with a dramatic increase in breast cancer incidence, a trend that reversed when its use decreased.",
            "citation": "quoted_public",
            "context": {"modality": ["mammography"], "jurisdiction": "US"},
            "review": deepcopy(REVIEW_QR),
        },
        {
            "id": "ev-pc-pdq-disparity",
            "sourceId": "src-nci-pdq-breast-screening-hp",
            "locator": "Breast Cancer Screening PDQ (HP), Incidence and Mortality; Black women subsection",
            "claim": "Incidence is higher in White women than Black women overall, but Black women have lower survival for every stage and about 40% higher mortality; PDQ attributes this to factors such as screening quality, follow-up timeliness, treatment quality, and tumor type.",
            "scope": "Social/access disparities at epidemiology teaching level.",
            "exceptions": "Do not reduce a patient's outcome to race alone; use for education about equity and follow-up urgency.",
            "excerpt": "Breast cancer incidence is higher in White women than in Black women, although Black women have a lower survival rate for every stage of disease. … Black women have a 40% higher breast cancer mortality than White women, a finding that is attributed to multiple factors, such as delayed follow-up of abnormal mammograms, later stage at diagnosis, inferior breast cancer treatment, and more aggressive tumor types.",
            "citation": "quoted_public",
            "context": {"modality": ["mammography"], "jurisdiction": "US"},
            "review": deepcopy(REVIEW_QR),
        },
        {
            "id": "ev-pc-pdq-biggest-risks",
            "sourceId": "src-nci-pdq-breast-screening-hp",
            "locator": "Breast Cancer Screening PDQ (HP), Incidence and Mortality",
            "claim": "The biggest risk factor for breast cancer is being female, followed by advancing age. Other listed risks include hormonal/reproductive factors (early menarche, late menopause, nulliparity, late first pregnancy, postmenopausal hormone therapy), alcohol, and ionizing radiation exposure.",
            "scope": "Inherent and hormonal risk overview for patient education.",
            "exceptions": "Risk factors raise probability; they do not diagnose cancer.",
            "excerpt": "The biggest risk factor for breast cancer is being female followed by advancing age. Other risk factors include hormonal aspects (such as early menarche, late menopause, nulliparity, late first pregnancy, and postmenopausal hormone therapy use), alcohol consumption, and exposure to ionizing radiation.",
            "citation": "quoted_public",
            "context": {"modality": [], "jurisdiction": "US"},
            "review": deepcopy(REVIEW_QR),
        },
        {
            "id": "ev-pc-prev-age-risk",
            "sourceId": "src-nci-pdq-breast-prevention-hp",
            "locator": "Breast Cancer Prevention PDQ (HP), Age",
            "claim": "Besides female sex, advancing age is the biggest risk factor. A 30-year-old woman has about a 1 in 175 chance of diagnosis in the next 10 years; a 70-year-old woman has about a 1 in 9 chance over the same period.",
            "scope": "Age-related risk magnitude for education (not individual counseling).",
            "exceptions": "Numbers are population estimates; do not present as a personal prediction.",
            "excerpt": "The major risk factor for breast cancer is advancing age. A 30-year-old woman has about a 1 in 175 chance of being diagnosed with breast cancer in the next 10 years, whereas a 70-year-old woman has a 1 in 9 chance over the same time period.",
            "citation": "quoted_public",
            "context": {"modality": [], "jurisdiction": "US"},
            "review": deepcopy(REVIEW_QR),
        },
        {
            "id": "ev-pc-prev-repro-mht",
            "sourceId": "src-nci-pdq-breast-prevention-hp",
            "locator": "Breast Cancer Prevention PDQ (HP), Overview of risk factors; Menopausal hormone therapy",
            "claim": "Reproductive factors that increase endogenous estrogen exposure (early menarche, late menopause), nulliparity, and combination estrogen-progesterone menopausal hormone therapy after menopause increase breast cancer risk. Alcohol is also associated with increased risk.",
            "scope": "Inherent reproductive and hormone-related risk factors.",
            "exceptions": "Hormone therapy decisions are clinician-managed; technologists document history, not prescribe.",
            "excerpt": "Besides female sex, advancing age is the biggest risk factor for breast cancer. Reproductive factors that increase exposure to endogenous estrogen, such as early menarche and late menopause, increase risk, as does the use of combination estrogen-progesterone hormones after menopause. Nulliparity and alcohol consumption also are associated with increased risk.",
            "citation": "quoted_public",
            "context": {"modality": [], "jurisdiction": "US"},
            "review": deepcopy(REVIEW_QR),
        },
        {
            "id": "ev-pc-prev-radiation-mantle",
            "sourceId": "src-nci-pdq-breast-prevention-hp",
            "locator": "Breast Cancer Prevention PDQ (HP), Ionizing radiation; Screening PDQ thoracic radiation subsection",
            "claim": "Prior ionizing radiation, especially during puberty or young adulthood (including mantle irradiation for lymphoma), increases later breast cancer risk and may justify earlier or more intensive screening planning by clinicians.",
            "scope": "Prior chest radiation as an inherent risk with imaging-pathway implications.",
            "exceptions": "Screening start age/modality for high-risk patients is clinician-directed; USPSTF average-risk recommendation excludes high-dose chest radiation history.",
            "excerpt": "Women treated for Hodgkin lymphoma with mantle radiation by age 16 years have a subsequent risk up to 35% of developing breast cancer by age 40 years. … Women with Hodgkin and non-Hodgkin lymphoma who were treated with mantle irradiation have an increased risk of breast cancer, starting 10 years after completing therapy and continuing life-long.",
            "citation": "quoted_public",
            "context": {"modality": ["mammography", "MRI"], "jurisdiction": "US"},
            "review": deepcopy(REVIEW_QR),
        },
        {
            "id": "ev-pc-pdq-density-imaging",
            "sourceId": "src-nci-pdq-breast-screening-hp",
            "locator": "Breast Cancer Screening PDQ (HP), Breast density",
            "claim": "Dense breasts can obscure small masses and reduce mammographic sensitivity (about 10%–29% lower sensitivity with high density). High density is also associated with modestly increased cancer risk but not higher breast cancer death. Hormone therapy is associated with increased density, lower sensitivity, and more interval cancers.",
            "scope": "Imaging implications of density and exogenous hormones.",
            "exceptions": "Supplemental screening mortality benefit is unproven in PDQ; FDA density notification directs patients to clinicians.",
            "excerpt": "Dense breasts may obscure the detection of small masses on mammography, thereby reducing the sensitivity of mammography. For women of all ages, high breast density is associated with 10% to 29% lower sensitivity. High breast density is also associated with a modestly increased risk of developing breast cancer. … Hormone therapy is associated with increased breast density, lower mammographic sensitivity, and an increased rate of interval cancers.",
            "citation": "quoted_public",
            "context": {"modality": ["mammography"], "jurisdiction": "US"},
            "review": deepcopy(REVIEW_QR),
        },
        {
            "id": "ev-pc-prev-obesity-alcohol",
            "sourceId": "src-nci-pdq-breast-prevention-hp",
            "locator": "Breast Cancer Prevention PDQ (HP), Obesity; alcohol mentioned in overview",
            "claim": "Obesity is associated with increased breast cancer risk in postmenopausal women who have not used hormone therapy. Alcohol consumption is associated with increased risk.",
            "scope": "Lifestyle/social risk factors at education level.",
            "exceptions": "Weight-loss benefit is uncertain per PDQ; do not lecture patients—document and educate neutrally.",
            "excerpt": "Based on solid evidence, obesity is associated with an increased breast cancer risk in postmenopausal women who have not used HT. It is uncertain whether weight reduction decreases the risk of breast cancer in women with obesity. … Nulliparity and alcohol consumption also are associated with increased risk.",
            "citation": "quoted_public",
            "context": {"modality": [], "jurisdiction": "US"},
            "review": deepcopy(REVIEW_QR),
        },
        {
            "id": "ev-pc-nci-symptoms-list",
            "sourceId": "src-nci-breast-symptoms",
            "locator": "NCI Breast Cancer Signs and Symptoms (posted 2025-12-02)",
            "claim": "Reportable breast changes include lumps (breast, near breast, or underarm), thickening, change in size/shape, nipple discharge not milk, nipple direction/shape change, and skin changes (scaliness, swelling, redness/darkening, itching/tingling, rash, dimpling/puckering). Early breast cancer often has no symptoms—screening matters. Most changes are not cancer, but follow-up is needed.",
            "scope": "Technologist recognition and documentation of symptoms that may convert a study to diagnostic work-up.",
            "exceptions": "Technologists do not diagnose; facility protocol governs screening vs diagnostic routing.",
            "excerpt": "Although most breast changes are not cancer, it is important to check with your doctor if you notice unusual changes, including: … a lump in or near your breast … a lump under your arm … thick or firm area … a change in the size or shape of your breast … fluid or discharge that is not breast milk … changes in the shape of the nipple … scaly or swollen skin … redness or darkening … dimples or puckering. … early breast cancer often has no symptoms, which is why breast cancer screening is important.",
            "citation": "quoted_public",
            "context": {"modality": ["mammography"], "jurisdiction": "US"},
            "review": deepcopy(REVIEW_AUTO),
        },
        {
            "id": "ev-pc-nci-pain-not-usual",
            "sourceId": "src-nci-breast-symptoms",
            "locator": "NCI Breast Cancer Signs and Symptoms — Is pain a symptom?",
            "claim": "Breast cancer does not usually cause pain; cysts, hormonal changes, and some medications can cause soreness. Persistent pain still warrants clinician evaluation.",
            "scope": "Common misconception about pain as a cancer symptom.",
            "exceptions": "Persistent pain is still a reason to see a clinician.",
            "excerpt": "Breast cancer does not usually cause pain. Several conditions that are not cancer, such as breast cysts and hormonal changes before your period, can cause breast soreness or pain, as can certain medications. If you have breast pain that persists, it’s important to see a doctor.",
            "citation": "quoted_public",
            "context": {"modality": [], "jurisdiction": "US"},
            "review": deepcopy(REVIEW_AUTO),
        },
        {
            "id": "ev-pc-seer-symptoms-exam",
            "sourceId": "src-nci-seer-breast",
            "locator": "SEER Training — Physical Exam (updated 2025-01-10)",
            "claim": "Physical exam of both breasts and axilla looks for lump/thickening, size/shape change, dimpling/puckering, inverted nipple, non-milk nipple fluid (especially bloody), scaly/red/swollen skin on breast/nipple/areola, and peau d’orange dimpling. Many cancers are found before symptoms because of screening.",
            "scope": "Clinical findings list for history/documentation teaching.",
            "exceptions": "SEER module is for registry training, not a clinical practice guideline.",
            "excerpt": "During the physical examination, physician is specifically searching for the following signs: Lump or thickening in or near the breast or in the underarm area; Change in the size or shape of the breast; Dimpling or puckering in the skin of the breast; Nipple turned inward toward the breast; Fluid, other than breast milk, from the nipple, especially if it’s bloody; Scaly, red, or swollen skin on the breast, nipple, or areola; Dimples in the breast that look like the skin of an orange, called peau d’orange.",
            "citation": "quoted_public",
            "context": {"modality": [], "jurisdiction": "US"},
            "review": deepcopy(REVIEW_AUTO),
        },
        {
            "id": "ev-pc-openstax-breast-hx",
            "sourceId": "src-openstax-clinical-nursing-breast",
            "locator": "OpenStax Clinical Nursing Skills §23.4 — history interview and expected breast findings",
            "claim": "Collection of subjective data begins with a health-history interview noting breast-cancer risk factors (including age and family/personal history). Expected inspection/palpation findings include smooth skin without dimpling or thickening, soft tissue without masses, no pain on palpation, and nipples mostly symmetrical without discharge (except lactation).",
            "scope": "History-taking and physical-finding documentation habits transferable to mammography intake.",
            "exceptions": "Nursing textbook context; facility mammography worksheets and marker protocols still govern imaging documentation. Scars/moles/tattoos marker methods are not specified here.",
            "excerpt": "Collection of subjective data begins with a patient interview to collect a health history … note of any risk factors for breast cancer including age over 50, family or personal history … Skin over breasts should be smooth, without evidence of dimpling or skin thickening … Patient should not report any pain or discomfort during palpation. Nipples should be mostly symmetrical without discharge (except for lactating mothers).",
            "citation": "quoted_public",
            "context": {"modality": [], "jurisdiction": "US"},
            "review": deepcopy(REVIEW_QR),
        },
        {
            "id": "ev-pc-uspstf-gender-population",
            "sourceId": "src-uspstf-breast-2024",
            "locator": "USPSTF 2024 Breast Cancer Screening — Clinician Summary population",
            "claim": "USPSTF average-risk screening recommendations apply to cisgender women and other persons assigned female at birth (including transgender men and nonbinary persons) age 40+, and to those with some increased-risk factors (e.g., first-degree family history, dense breasts). They do not apply to high-risk genetic markers/syndromes, high-dose chest radiation at a young age, previous breast cancer, or high-risk prior biopsy lesions.",
            "scope": "Gender-affirming/inclusive population framing and high-risk exclusions that change imaging pathways.",
            "exceptions": "Does not specify how to document top surgery or hormone therapy details—follow facility intake protocol; high-risk pathways are clinician-directed.",
            "excerpt": "These recommendations apply to cisgender women and all other persons assigned female at birth (including transgender men and nonbinary persons) 40 years or older at average risk of breast cancer. … These recommendations do not apply to persons who have a genetic marker or syndrome associated with a high risk of breast cancer (eg, BRCA1 or BRCA2 genetic variation), a history of high-dose radiation therapy to the chest at a young age, previous breast cancer, or a high-risk breast lesion on previous biopsy.",
            "citation": "quoted_public",
            "context": {"modality": ["mammography"], "jurisdiction": "US", "effective": "2024-04-30"},
            "review": deepcopy(REVIEW_QR),
        },
        {
            "id": "ev-pc-dict-lumpectomy",
            "sourceId": "src-nci-dictionary",
            "locator": "NCI Dictionary — lumpectomy (termId 45758)",
            "claim": "Lumpectomy removes cancer or abnormal breast tissue plus some surrounding normal tissue, but not the whole breast; some axillary nodes may be removed for biopsy.",
            "scope": "Surgical terminology for technologist patient education.",
            "excerpt": "Surgery to remove cancer or other abnormal tissue from the breast and some normal tissue around it, but not the breast itself. Some lymph nodes under the arm may be removed for biopsy. … Also called breast-conserving surgery, breast-sparing surgery, partial mastectomy, quadrantectomy, and segmental mastectomy.",
            "citation": "quoted_public",
            "context": {"modality": [], "jurisdiction": "US"},
            "review": deepcopy(REVIEW_AUTO),
        },
        {
            "id": "ev-pc-dict-simple-mastectomy",
            "sourceId": "src-nci-dictionary",
            "locator": "NCI Dictionary — simple mastectomy (termId 45071)",
            "claim": "Simple (total) mastectomy removes the whole breast (may include nipple, areola, and skin). Some underarm nodes may also be removed to check for cancer.",
            "scope": "Surgical terminology.",
            "excerpt": "Surgery to remove the whole breast, which may include the nipple, areola (the dark-colored skin around the nipple), and skin over the breast. Some of the lymph nodes under the arm may also be removed to check for cancer. Also called total mastectomy.",
            "citation": "quoted_public",
            "context": {"modality": [], "jurisdiction": "US"},
            "review": deepcopy(REVIEW_AUTO),
        },
        {
            "id": "ev-pc-dict-mrm",
            "sourceId": "src-nci-dictionary",
            "locator": "NCI Dictionary — modified radical mastectomy (termId 46285)",
            "claim": "Modified radical mastectomy removes the whole breast and most of the lymph nodes under the arm.",
            "scope": "Surgical terminology.",
            "excerpt": "Surgery to remove the whole breast, which may include the nipple, areola … and skin over the breast. Most of the lymph nodes under the arm are also removed.",
            "citation": "quoted_public",
            "context": {"modality": [], "jurisdiction": "US"},
            "review": deepcopy(REVIEW_AUTO),
        },
        {
            "id": "ev-pc-dict-prophylactic-mastectomy",
            "sourceId": "src-nci-dictionary",
            "locator": "NCI Dictionary — prophylactic mastectomy (termId 44227)",
            "claim": "Prophylactic (preventive / risk-reducing) mastectomy removes one or both breasts before disease develops to reduce risk in people at very high risk.",
            "scope": "Surgical terminology — not a technologist treatment decision.",
            "excerpt": "Surgery to reduce the risk of breast cancer by removing one or both breasts before disease develops. Prophylactic mastectomy may be done in people who have a very high risk of developing breast cancer. Also called preventive mastectomy and risk-reducing mastectomy.",
            "citation": "quoted_public",
            "context": {"modality": [], "jurisdiction": "US"},
            "review": deepcopy(REVIEW_AUTO),
        },
        {
            "id": "ev-pc-dict-slnb",
            "sourceId": "src-nci-dictionary",
            "locator": "NCI Dictionary — sentinel lymph node biopsy (termId 46712)",
            "claim": "Sentinel lymph node biopsy removes and examines the first node(s) likely to receive drainage from the tumor, identified with radioactive tracer and/or blue dye.",
            "scope": "Surgical terminology.",
            "excerpt": "Removal and examination of the sentinel node(s) (the first lymph node(s) to which cancer cells are likely to spread from a primary tumor). To identify the sentinel lymph node(s), the surgeon injects a radioactive substance, blue dye, or both near the tumor.",
            "citation": "quoted_public",
            "context": {"modality": [], "jurisdiction": "US"},
            "review": deepcopy(REVIEW_AUTO),
        },
        {
            "id": "ev-pc-nci-mastectomy-types",
            "sourceId": "src-nci-breast-surgery",
            "locator": "NCI Mastectomy patient page — Types of mastectomy",
            "claim": "Total/simple mastectomy removes the whole breast; modified radical mastectomy adds axillary lymph node dissection; skin- and nipple-sparing variants preserve skin and/or nipple-areola when appropriate; radical mastectomy (chest wall muscles) is rarely used today.",
            "scope": "Terminology map for post-surgical mammography patients.",
            "exceptions": "Procedure choice is surgical; technologists use terms for history and positioning context only.",
            "excerpt": "Total mastectomy (also called simple mastectomy). … removes your whole breast, including the nipple, areola, breast tissue, and skin. … Modified radical mastectomy. This is the same as a total mastectomy, but the surgeon also removes lymph nodes under your arm (axillary lymph node dissection). … Radical mastectomy … is now rarely performed …",
            "citation": "quoted_public",
            "context": {"modality": [], "jurisdiction": "US"},
            "review": deepcopy(REVIEW_AUTO),
        },
        {
            "id": "ev-pc-nci-reconstruction-implant",
            "sourceId": "src-nci-breast-surgery",
            "locator": "NCI Breast Reconstruction After Mastectomy — implants",
            "claim": "Breast reconstruction rebuilds breast shape after mastectomy using implants (saline/silicone) and/or autologous tissue. Implant reconstruction is often two-stage (tissue expander then permanent implant) and may be immediate or delayed.",
            "scope": "Reconstruction terminology including implants — not prescribing.",
            "exceptions": "Mammography after reconstruction follows facility/protocol and order type; NCI notes mammography is not typically done on a fully reconstructed post-mastectomy breast.",
            "excerpt": "Breasts can be rebuilt using implants (saline or silicone) or autologous tissue … Surgery to reconstruct the breasts can be done (or started) at the time of the mastectomy, called immediate reconstruction, or … delayed reconstruction. … In the first stage, the surgeon places a device called a tissue expander … The expander is slowly filled … In the second stage … the expander is removed and replaced with an implant.",
            "citation": "quoted_public",
            "context": {"modality": [], "jurisdiction": "US"},
            "review": deepcopy(REVIEW_AUTO),
        },
        {
            "id": "ev-pc-dict-er-pr-her2",
            "sourceId": "src-nci-dictionary",
            "locator": "NCI Dictionary — estrogen receptor (46409), progesterone receptor (423248), HER2/neu (44945)",
            "claim": "ER and PR are proteins that hormones can bind to inside cells; HER2/neu is a growth-related protein that some cancers overproduce. Receptor/HER2 status helps plan treatment.",
            "scope": "Receptor-status terminology only.",
            "excerpt": "Estrogen receptor: A protein found inside the cells … The hormone estrogen will bind to the receptors … Also called ER. Progesterone receptor: … Also called PR. HER2/neu: A protein involved in normal cell growth. HER2/neu may be made in larger than normal amounts by some types of cancer cells, including breast … Checking the amount of HER2/neu on some types of cancer cells may help plan treatment.",
            "citation": "quoted_public",
            "context": {"modality": [], "jurisdiction": "US"},
            "review": deepcopy(REVIEW_AUTO),
        },
        {
            "id": "ev-pc-pdq-receptor-classes",
            "sourceId": "src-nci-pdq-breast-treatment-hp",
            "locator": "Breast Cancer Treatment PDQ (HP) — ER/PR/HER2 classification",
            "claim": "Based on ER, PR, and HER2 results, breast cancer is classified as hormone receptor–positive patterns, HER2-positive, or triple-negative (ER, PR, and HER2 negative). Status predicts response to endocrine and HER2-directed therapy.",
            "scope": "Terminology for why biomarker results matter — no regimen teaching.",
            "exceptions": "Assay interpretation and therapy selection require qualified clinicians.",
            "excerpt": "On the basis of ER, PR, and HER2 results, breast cancer is classified as one of the following types: … HER2 positive. Triple negative (ER, PR, and HER2 negative). ER, PR, and HER2 status are important in determining prognosis and in predicting response to endocrine and HER2-directed therapy.",
            "citation": "quoted_public",
            "context": {"modality": [], "jurisdiction": "US"},
            "review": deepcopy(REVIEW_QR),
        },
        {
            "id": "ev-pc-seer-biomarkers",
            "sourceId": "src-nci-seer-breast",
            "locator": "SEER Training — Biomarkers",
            "claim": "ER/PR positivity predicts favorable response to endocrine (hormonal) therapy. About 15%–20% of breast carcinomas overexpress HER2; untreated HER2 overexpression associates with worse prognosis. Biomarkers may be diagnostic, predictive, and/or prognostic.",
            "scope": "Registry-level biomarker definitions supporting technologist vocabulary.",
            "exceptions": "Not a prescribing reference.",
            "excerpt": "Positive results predict a favorable response to endocrine (hormonal) therapy. … A subset of breast carcinomas (approximately 15% to 20%) overexpress human epidermal growth factor receptor 2 (HER2). … Biomarkers (tumor markers) can be diagnostic, predictive, and/or prognostic.",
            "citation": "quoted_public",
            "context": {"modality": [], "jurisdiction": "US"},
            "review": deepcopy(REVIEW_AUTO),
        },
        {
            "id": "ev-pc-dict-chemo-rt-ht",
            "sourceId": "src-nci-dictionary",
            "locator": "NCI Dictionary — chemotherapy (45214), radiation therapy (44971), hormone therapy (45110)",
            "claim": "Chemotherapy uses drugs to kill cancer cells or stop division. Radiation therapy uses high-energy radiation to kill cancer cells/shrink tumors (external beam or internal). Hormone (endocrine) therapy adds, blocks, or removes hormones to slow hormone-sensitive cancers.",
            "scope": "Nonsurgical treatment terminology.",
            "excerpt": "Chemotherapy: Treatment that uses drugs to stop the growth of cancer cells, either by killing the cells or by stopping them from dividing. Radiation therapy: The use of high-energy radiation … to kill cancer cells and shrink tumors. Hormone therapy: Treatment that adds, blocks, or removes hormones. … To slow or stop the growth of cancer, synthetic hormones or other drugs may be given to block the body’s natural hormones … Also called endocrine therapy.",
            "citation": "quoted_public",
            "context": {"modality": [], "jurisdiction": "US"},
            "review": deepcopy(REVIEW_AUTO),
        },
        {
            "id": "ev-pc-nci-ht-receptors",
            "sourceId": "src-nci-breast-nonsurgical",
            "locator": "NCI Hormone Therapy for Breast Cancer — Who gets hormone therapy?",
            "claim": "Hormone therapy is used when tumor cells contain estrogen and/or progesterone receptors (HR-positive). HR-negative tumors do not respond to hormone therapy. About 80% of breast cancers are HR-positive. This is different from menopausal hormone therapy.",
            "scope": "Link receptor status to endocrine therapy terminology.",
            "exceptions": "Drug selection is clinician-only; technologists do not advise regimens.",
            "excerpt": "You may receive hormone therapy if the cells in your breast cancer contain proteins called hormone receptors. … If the tumor cells contain hormone receptors, the cancer is called hormone receptor positive (HR positive). Tumors that lack hormone receptors (HR negative) do not respond to hormone therapy. About 80% of people diagnosed with breast cancer have HR-positive cancers. Hormone therapy for breast cancer is different from menopausal hormone therapy.",
            "citation": "quoted_public",
            "context": {"modality": [], "jurisdiction": "US"},
            "review": deepcopy(REVIEW_QR),
        },
        {
            "id": "ev-pc-nci-local-systemic",
            "sourceId": "src-nci-breast-nonsurgical",
            "locator": "NCI Breast Cancer Treatment hub — Local vs systemic",
            "claim": "Local treatments (surgery, radiation) target the cancer area; systemic treatments (e.g., chemotherapy, hormone therapy, targeted therapy, immunotherapy) can reach cancer cells throughout the body.",
            "scope": "High-level treatment vocabulary.",
            "excerpt": "Your treatment options may include both local and systemic treatments. Local treatments, such as surgery and radiation, are directed at the area with cancer and not the whole body. Systemic treatments, such as chemotherapy, are drugs that can reach cancer cells throughout the body.",
            "citation": "quoted_public",
            "context": {"modality": [], "jurisdiction": "US"},
            "review": deepcopy(REVIEW_AUTO),
        },
        {
            "id": "ev-pc-nci-symptoms-diagnostic",
            "sourceId": "src-nci-breast-symptoms",
            "locator": "NCI Signs and Symptoms — diagnostic mammogram after symptoms",
            "claim": "Depending on symptoms, clinicians may order a diagnostic mammogram or other tests to distinguish cancer from benign conditions; follow up even after a recent normal screening mammogram.",
            "scope": "History/symptoms → imaging pathway implication.",
            "excerpt": "Depending on your symptoms, your doctor may suggest that you have a diagnostic mammogram or another test … But it’s important to follow up with your doctor when you notice a breast change, even if you had a recent normal mammogram.",
            "citation": "quoted_public",
            "context": {"modality": ["mammography"], "jurisdiction": "US"},
            "review": deepcopy(REVIEW_AUTO),
        },
    ]

    for e in new_ev:
        if e["id"] not in existing:
            ev_doc["evidence"].append(e)
            existing.add(e["id"])
    dump(ev_path, ev_doc)

    # ---- Lessons / cards / questions ----
    les_path = ROOT / "content/modules/patient-care/lessons.json"
    card_path = ROOT / "content/modules/patient-care/cards.json"
    q_path = ROOT / "content/modules/patient-care/questions.json"
    cov_path = ROOT / "content/modules/patient-care/coverage.json"
    mod_path = ROOT / "content/modules/patient-care/module.json"
    cur_path = ROOT / "content/curriculum/curriculum.json"

    lessons_doc = load(les_path)
    cards_doc = load(card_path)
    qs_doc = load(q_path)
    cov = load(cov_path)
    mod = load(mod_path)
    cur = load(cur_path)

    les_ids = {l["id"] for l in lessons_doc["lessons"]}
    card_ids = {c["id"] for c in cards_doc["cards"]}
    q_ids = {q["id"] for q in qs_doc["questions"]}

    new_lessons = [
        lesson(
            id="les-pc-epidemiology",
            objectiveId="obj-pc-epidemiology",
            title="Incidence numbers that stay honest",
            summary="Use year-labeled NCI figures for invasive, in situ, and male breast cancer—and explain why screening and hormone use move incidence.",
            explanation=[
                {
                    "heading": "What to say about how common it is",
                    "body": "NCI's Screening PDQ states breast cancer is the most common **noncutaneous** cancer in U.S. women, with **2025** estimates of about **316,950 invasive**, **59,080 in situ**, and **42,170 deaths**. Men account for about **1%** of cases and deaths.\n\nSay the year. Estimates change. Never invent a \"1 in X lifetime\" number unless you have that exact sourced figure in front of you.",
                },
                {
                    "heading": "Why the curve moves",
                    "body": "PDQ links incidence shifts to reproductive patterns, **screening participation** (more DCIS found), and **postmenopausal hormone therapy** use (rise, then decline when use fell). Inherited high-risk mutations including BRCA1/2 account for about **5%–10%** of cases—not most cases.",
                },
                {
                    "heading": "Disparities without stereotypes",
                    "body": "Incidence is higher in White women than Black women overall, but Black women have lower stage-specific survival and about **40% higher mortality**, which PDQ ties to follow-up, treatment quality, screening quality, and tumor biology. Your job is timely, respectful care—not explaining away a person's risk.",
                },
            ],
            example="A patient asks, \"Is breast cancer exploding?\" You answer: \"More imaging finds more early disease, and hormone-therapy trends changed rates over time. The NCI figure for 2025 invasive cases is about 317,000—I'll stick to sourced numbers.\"",
            misconception={
                "belief": "Male breast cancer is so rare we can ignore it in education.",
                "correction": "Men still account for about 1% of cases and deaths—small, not zero.",
            },
            variants={
                "simpler": "Use NCI's year-labeled counts. Mention that screening and hormones change incidence. About 1% of cases are in men.",
                "example": "If asked for a personal lifetime risk, defer to the clinician and avoid unsourced slogans.",
                "deeper": "PDQ notes adoption of screening is not automatically followed by a decline in advanced-stage incidence—another reason not to oversell incidence figures as proof of prevention.",
            },
            observationPrompt="Ask your preceptor where the facility keeps current patient-education statistics and which year they cite.",
            checkQuestionId="q-pc-104",
            evidenceIds=[
                "ev-pc-pdq-incidence-2025",
                "ev-pc-pdq-brca-share",
                "ev-pc-pdq-incidence-drivers",
                "ev-pc-pdq-disparity",
            ],
            review=deepcopy(REVIEW_QR),
        ),
        lesson(
            id="les-pc-inherent-risk",
            objectiveId="obj-pc-inherent-risk",
            title="Inherent risk factors that change the history",
            summary="Female sex and age lead; reproductive history, personal/family history, genetics, prior chest radiation, and density also matter for imaging context.",
            explanation=[
                {
                    "heading": "Start with the strongest factors",
                    "body": "PDQ: being **female**, then **advancing age**, are the biggest risks. A sourced illustration: about **1 in 175** chance of diagnosis in the next 10 years at age 30 versus about **1 in 9** at age 70—population figures, not a personal forecast.",
                },
                {
                    "heading": "History items to capture",
                    "body": "Document reproductive history that increases estrogen exposure (**early menarche, late menopause, nulliparity, late first pregnancy**), **personal or family** breast cancer history, known **BRCA** or other high-risk genetics when disclosed, and **prior chest/mantle radiation**. Dense tissue is both a risk factor and a masking factor on mammography.",
                },
                {
                    "heading": "Imaging implication",
                    "body": "High density lowers mammographic sensitivity. Prior high-dose chest radiation and high-risk genetics sit **outside** USPSTF average-risk screening rules—those patients need clinician-directed pathways. You gather history; you do not invent a screening schedule.",
                },
            ],
            example="Intake notes prior mantle radiation for lymphoma at age 15. You flag it for the radiologist/order pathway rather than treating the visit as average-risk screening chatter.",
            misconception={
                "belief": "If density is high, cancer death risk must also be high.",
                "correction": "PDQ links high density to higher incidence and lower mammographic sensitivity, not to higher breast-cancer death.",
            },
            variants={
                "simpler": "Age and female sex matter most. Also note family/personal history, genetics, chest radiation, reproductive history, and density.",
                "example": "Ask about prior chest radiation when the history form includes cancer treatment as a child or young adult.",
                "deeper": "PDQ dense-breast supplemental imaging may find more cancers but has not shown a mortality benefit; more false positives are expected.",
            },
            observationPrompt="Review your facility history sheet and mark which fields map to inherent risk factors in this lesson.",
            checkQuestionId="q-pc-112",
            evidenceIds=[
                "ev-pc-pdq-biggest-risks",
                "ev-pc-prev-age-risk",
                "ev-pc-prev-repro-mht",
                "ev-pc-prev-radiation-mantle",
                "ev-pc-pdq-density-imaging",
                "ev-pc-nci-dense-risk",
                "ev-pc-uspstf-gender-population",
            ],
            review=deepcopy(REVIEW_QR),
        ),
        lesson(
            id="les-pc-social-risk",
            objectiveId="obj-pc-social-risk",
            title="Hormones, lifestyle, and access on the imaging history",
            summary="Alcohol, postmenopausal obesity, menopausal hormone therapy, and access barriers belong on the history—and they change how you talk about screening follow-up.",
            explanation=[
                {
                    "heading": "Hormone and lifestyle factors",
                    "body": "Combination **estrogen-progesterone menopausal hormone therapy** increases risk. **Alcohol** is associated with increased risk. **Obesity** increases risk in postmenopausal women who have not used hormone therapy. Document MHT use because PDQ also links hormone therapy to **higher density, lower mammographic sensitivity, and more interval cancers**.",
                },
                {
                    "heading": "Access is part of risk",
                    "body": "PDQ disparities discussion highlights delayed follow-up after abnormal screens and unequal treatment quality. Know your facility's path to programs such as NBCCEDP (via NCI patient guidance) without promising eligibility.",
                },
                {
                    "heading": "Boundaries",
                    "body": "You are not prescribing hormones or diets. You record history accurately, explain why priors and timely callback matter, and hand clinical counseling to qualified clinicians.",
                },
            ],
            example="Patient reports current combined MHT. You document it and avoid saying \"hormones always cause cancer,\" while recognizing density/sensitivity effects described in PDQ.",
            misconception={
                "belief": "Social risk factors are optional small talk.",
                "correction": "They affect incidence patterns and can change mammographic sensitivity—document them.",
            },
            variants={
                "simpler": "Ask about alcohol, weight-related history as your form requires, and menopausal hormone therapy. Access barriers matter for follow-up.",
                "example": "If a patient cannot afford follow-up, share facility-approved resource language rather than inventing program rules.",
                "deeper": "Distinguish menopausal hormone therapy (risk factor) from breast-cancer hormone/endocrine *treatment* (different purpose).",
            },
            observationPrompt="Locate where your EMR or paper history captures MHT, alcohol, and financial/access barriers.",
            checkQuestionId="q-pc-120",
            evidenceIds=[
                "ev-pc-prev-repro-mht",
                "ev-pc-prev-obesity-alcohol",
                "ev-pc-pdq-density-imaging",
                "ev-pc-pdq-disparity",
                "ev-pc-nci-access-nbccedp",
                "ev-pc-nci-ht-receptors",
            ],
            review=deepcopy(REVIEW_QR),
        ),
        lesson(
            id="les-pc-signs-symptoms",
            objectiveId="obj-pc-signs-symptoms",
            title="Signs and symptoms that change the exam path",
            summary="Recognize lumps, nipple and skin changes, and peau d’orange—and remember pain is usually not cancer while early cancer is often silent.",
            explanation=[
                {
                    "heading": "What to notice and document",
                    "body": "NCI and SEER lists align: **lump or thickening** (breast or underarm), **size/shape change**, **dimpling/puckering**, **nipple inversion or non-milk discharge** (especially bloody), **scaliness, redness/swelling**, and **peau d’orange**. Document laterality, location language your facility uses, and onset.",
                },
                {
                    "heading": "Pain and silence",
                    "body": "NCI: breast cancer **does not usually cause pain**. Early cancer often has **no symptoms**—that is why screening exists. Persistent pain still needs a clinician visit.",
                },
                {
                    "heading": "Pathway",
                    "body": "Symptoms can prompt a **diagnostic** mammogram or other tests even after a recent normal screen. You do not diagnose; you escalate per protocol.",
                },
            ],
            example="Patient mentions new bloody nipple discharge on the history. You stop treating the study as asymptomatic screening and follow diagnostic intake steps.",
            misconception={
                "belief": "No pain means no problem worth documenting.",
                "correction": "Many cancers are painless; documented symptoms still matter for exam type.",
            },
            variants={
                "simpler": "Lumps, skin/nipple changes, and underarm findings matter. Pain is an unreliable cancer signal. Screening finds silent disease.",
                "example": "Peau d’orange means orange-peel skin dimpling—document and escalate; do not label inflammatory cancer yourself.",
                "deeper": "SEER notes many women never develop symptoms because screening detects disease earlier—use that to reinforce why asymptomatic screening still matters.",
            },
            observationPrompt="Ask how your site converts a screening appointment to diagnostic when new symptoms are reported at check-in.",
            checkQuestionId="q-pc-128",
            evidenceIds=[
                "ev-pc-nci-symptoms-list",
                "ev-pc-nci-pain-not-usual",
                "ev-pc-seer-symptoms-exam",
                "ev-pc-nci-symptoms-diagnostic",
                "ev-pc-nci-screen-vs-dx",
            ],
            review=deepcopy(REVIEW_AUTO),
        ),
        lesson(
            id="les-pc-history-doc",
            objectiveId="obj-pc-history-documentation",
            title="History that the images cannot say alone",
            summary="Review the order, interview for risk and surgical history, document clinical findings, and note gender-inclusive screening population factors—marker details stay facility-specific.",
            explanation=[
                {
                    "heading": "Start with the request",
                    "body": "Confirm the imaging request matches the visit type (screening vs diagnostic), laterality, and clinical question. Symptoms on the order should match what the patient reports today.",
                },
                {
                    "heading": "What open sources support documenting",
                    "body": "OpenStax emphasizes a structured **health-history interview** (age, personal/family history, and other risk factors) plus inspection/palpation cues (dimpling, thickening, discharge, pain). NCI/SEER supply the symptom list. Document **surgical history** in plain terms (lumpectomy, mastectomy type, reconstruction/implants, axillary surgery) because it changes anatomy and comparison.",
                },
                {
                    "heading": "Gender-affirming care — sourced boundary",
                    "body": "USPSTF average-risk recommendations include **transgender men and nonbinary persons assigned female at birth**. High-risk exclusions (BRCA syndromes, high-dose chest radiation young, prior breast cancer, high-risk biopsy lesions) need clinician pathways. Exact charting of top surgery or gender-affirming hormones follows **facility protocol**—do not invent fields.",
                },
                {
                    "heading": "Scars, moles, tattoos",
                    "body": "Objective language expects documenting lumps, scars, moles, and tattoos for correlation. Open public sources retrieved for this batch do **not** specify marker shapes or diagram rules. Follow your written protocol and accreditation guidance; leave unsourced marker trivia out of scored teaching until a permitted source is registered.",
                },
            ],
            example="Order says screening, but the patient reports a new lump. You reconcile the history with the order before imaging and escalate per protocol.",
            misconception={
                "belief": "If it is not on the order, you can skip asking.",
                "correction": "Intake interview still captures symptoms and surgical changes that affect the study.",
            },
            variants={
                "simpler": "Match the order to the patient story. Record surgeries and symptoms. Use facility rules for skin findings.",
                "example": "Ask about prior breast surgery and reconstruction before positioning.",
                "deeper": "Prior mammogram transfer (15 calendar days under MQSA) is part of history workflow when comparison is needed.",
            },
            observationPrompt="With a preceptor, walk one history sheet and mark which items are required by policy versus optional local prompts.",
            checkQuestionId="q-pc-136",
            evidenceIds=[
                "ev-pc-openstax-breast-hx",
                "ev-pc-nci-symptoms-list",
                "ev-pc-seer-symptoms-exam",
                "ev-pc-uspstf-gender-population",
                "ev-mqsa-record-transfer",
                "ev-pc-nci-symptoms-diagnostic",
            ],
            review=deepcopy(REVIEW_QR),
        ),
        lesson(
            id="les-pc-prior-images",
            objectiveId="obj-pc-prior-images",
            title="Why priors matter—and the 15-day transfer clock",
            summary="Comparison reduces unnecessary callbacks; MQSA requires transfer of originals or copies within 15 calendar days when requested.",
            explanation=[
                {
                    "heading": "Clinical reason",
                    "body": "Priors help the interpreting physician see stability versus change. Incomplete work-ups may explicitly need prior mammograms for comparison under MQSA reporting language.",
                },
                {
                    "heading": "Regulatory clock",
                    "body": "On patient request, facilities transfer originals or release copies within **15 calendar days**, in the original modality, with digital/DBT available electronically as original digital images when sent for final interpretation.",
                },
                {
                    "heading": "Technologist actions",
                    "body": "Ask where priors live, help patients request transfers early, and document when comparison is pending—without blaming the patient for another facility's delay.",
                },
            ],
            example="New patient has no priors on the workstation. You start the transfer request the same day rather than waiting until after the read.",
            misconception={
                "belief": "Priors are a courtesy; timing is flexible.",
                "correction": "MQSA sets a 15-calendar-day transfer timeline after the facility receives the request.",
            },
            variants={
                "simpler": "Get priors for comparison. Transfers are due within 15 calendar days of the request.",
                "example": "Give patients the facility's medical-records request path before they leave.",
                "deeper": "Fees for copies cannot exceed documented costs under MQSA.",
            },
            observationPrompt="Find your site's prior-request form and the person who tracks outstanding transfers.",
            checkQuestionId="q-pc-144",
            evidenceIds=["ev-mqsa-record-transfer", "ev-mqsa-incomplete-categories"],
            review=deepcopy(REVIEW_AUTO),
        ),
        lesson(
            id="les-pc-surgical",
            objectiveId="obj-pc-surgical-options",
            title="Surgery words patients hear",
            summary="Define lumpectomy, sentinel node biopsy, simple and modified radical mastectomy, and prophylactic mastectomy—without choosing a treatment.",
            explanation=[
                {
                    "heading": "Breast-conserving surgery",
                    "body": "**Lumpectomy** removes the cancer/abnormal tissue and a rim of normal tissue, not the whole breast. It is also called breast-conserving or partial mastectomy. Radiation often follows.",
                },
                {
                    "heading": "Mastectomy family",
                    "body": "**Simple/total mastectomy** removes the whole breast. **Modified radical mastectomy** removes the whole breast plus most axillary nodes. **Prophylactic/risk-reducing mastectomy** removes one or both breasts before disease in very high-risk people. Skin- and nipple-sparing variants exist when surgeons judge them appropriate.",
                },
                {
                    "heading": "Nodes",
                    "body": "**Sentinel lymph node biopsy** finds and removes the first drainage node(s) using tracer and/or blue dye—less extensive than a full axillary dissection.",
                },
            ],
            example="A patient says she had a \"partial mastectomy.\" You map that synonym to lumpectomy/breast-conserving surgery when recording history.",
            misconception={
                "belief": "Mastectomy always includes removing chest muscles.",
                "correction": "That describes historic radical mastectomy, which is rarely used now.",
            },
            variants={
                "simpler": "Lumpectomy keeps the breast; mastectomy removes it. Sentinel biopsy checks the first node. Prophylactic means risk-reducing before cancer.",
                "example": "Ask whether reconstruction was immediate or delayed when relevant to anatomy.",
                "deeper": "NCI notes lumpectomy plus radiation can match mastectomy for survival in appropriate candidates—still a clinician conversation.",
            },
            observationPrompt="List the surgical history terms your intake form already includes and match them to this lesson's definitions.",
            checkQuestionId="q-pc-148",
            evidenceIds=[
                "ev-pc-dict-lumpectomy",
                "ev-pc-dict-simple-mastectomy",
                "ev-pc-dict-mrm",
                "ev-pc-dict-prophylactic-mastectomy",
                "ev-pc-dict-slnb",
                "ev-pc-nci-mastectomy-types",
            ],
            review=deepcopy(REVIEW_AUTO),
        ),
        lesson(
            id="les-pc-nonsurgical",
            objectiveId="obj-pc-nonsurgical-options",
            title="Systemic and local nonsurgical terms",
            summary="Define radiation, chemotherapy, hormone therapy, ER/PR/HER2 status, and implant reconstruction at vocabulary level only.",
            explanation=[
                {
                    "heading": "Local vs systemic",
                    "body": "**Radiation** is a local treatment using high-energy beams or internal sources. **Chemotherapy** is systemic drug therapy that kills or stops dividing cells. **Hormone/endocrine therapy** blocks or removes hormonal fuel for HR-positive disease—and is **not** the same as menopausal hormone therapy.",
                },
                {
                    "heading": "Receptor status",
                    "body": "Tumors are tested for **ER**, **PR**, and **HER2**. Combinations include HER2-positive and **triple-negative** (ER/PR/HER2 negative). HR-positive cancers may respond to endocrine therapy; HR-negative do not. About **80%** of breast cancers are HR-positive per NCI patient guidance.",
                },
                {
                    "heading": "Reconstruction implants",
                    "body": "Reconstruction may use **implants** (often expander then implant) and/or the patient's own tissue, immediate or delayed. Know the words for history; do not counsel cosmetic choices.",
                },
            ],
            example="Patient says she is on \"hormone therapy.\" You clarify whether she means breast-cancer endocrine treatment or menopausal hormones before documenting.",
            misconception={
                "belief": "Technologists should explain which chemo regimen is best.",
                "correction": "Stay at definitions; regimens are clinician territory.",
            },
            variants={
                "simpler": "Radiation is local. Chemo and many drug therapies are systemic. ER/PR/HER2 guide drug classes. Implants are one reconstruction option.",
                "example": "Triple-negative means ER, PR, and HER2 are all negative.",
                "deeper": "SEER notes biomarkers can be diagnostic, predictive, or prognostic—predictive means they help anticipate treatment response.",
            },
            observationPrompt="Ask oncology or your preceptor how biomarker results appear on reports patients bring to mammography visits.",
            checkQuestionId="q-pc-156",
            evidenceIds=[
                "ev-pc-dict-chemo-rt-ht",
                "ev-pc-dict-er-pr-her2",
                "ev-pc-pdq-receptor-classes",
                "ev-pc-seer-biomarkers",
                "ev-pc-nci-ht-receptors",
                "ev-pc-nci-local-systemic",
                "ev-pc-nci-reconstruction-implant",
            ],
            review=deepcopy(REVIEW_QR),
        ),
    ]

    for L in new_lessons:
        if L["id"] not in les_ids:
            lessons_doc["lessons"].append(L)
            les_ids.add(L["id"])

    new_cards = [
        # epidemiology
        card("card-pc-epi-invasive", "obj-pc-epidemiology", "About how many invasive U.S. female breast cancer cases did NCI PDQ estimate for 2025?", "About 316,950 invasive cases (year-labeled estimate).", ["ev-pc-pdq-incidence-2025"], review=REVIEW_QR),
        card("card-pc-epi-male", "obj-pc-epidemiology", "About what share of breast cancer cases and deaths occur in men?", "About 1%.", ["ev-pc-pdq-incidence-2025"]),
        card("card-pc-epi-brca-share", "obj-pc-epidemiology", "About what percentage of breast cancer cases are linked to inherited risk including BRCA1/2?", "Approximately 5% to 10%.", ["ev-pc-pdq-brca-share"], review=REVIEW_QR),
        card("card-pc-epi-drivers", "obj-pc-epidemiology", "Name two population factors PDQ links to changing breast cancer incidence.", "Screening participation (more DCIS) and postmenopausal hormone therapy use trends; reproductive patterns also listed.", ["ev-pc-pdq-incidence-drivers"], review=REVIEW_QR),
        # inherent
        card("card-pc-risk-age", "obj-pc-inherent-risk", "Besides female sex, what does PDQ call the biggest breast cancer risk factor?", "Advancing age.", ["ev-pc-pdq-biggest-risks", "ev-pc-prev-age-risk"]),
        card("card-pc-risk-repro", "obj-pc-inherent-risk", "List three reproductive/hormonal inherent factors PDQ associates with higher risk.", "Examples: early menarche, late menopause, nulliparity, late first pregnancy, postmenopausal combined hormone therapy.", ["ev-pc-prev-repro-mht", "ev-pc-pdq-biggest-risks"]),
        card("card-pc-risk-mantle", "obj-pc-inherent-risk", "Why does prior mantle/chest radiation in youth matter for mammography history?", "It raises later breast cancer risk and sits outside average-risk screening assumptions.", ["ev-pc-prev-radiation-mantle", "ev-pc-uspstf-gender-population"], review=REVIEW_QR),
        card("card-pc-risk-density-sens", "obj-pc-inherent-risk", "How can high breast density affect mammography performance?", "It can obscure masses and lower sensitivity; also associated with modestly higher incidence.", ["ev-pc-pdq-density-imaging", "ev-pc-nci-dense-risk"], review=REVIEW_QR),
        # social
        card("card-pc-social-mht", "obj-pc-social-risk", "Which menopausal hormone pattern does PDQ highlight for increased breast cancer risk?", "Combination estrogen-progesterone therapy after menopause.", ["ev-pc-prev-repro-mht"], review=REVIEW_QR),
        card("card-pc-social-alcohol", "obj-pc-social-risk", "Name a lifestyle exposure PDQ associates with increased breast cancer risk.", "Alcohol consumption (obesity also for some postmenopausal women).", ["ev-pc-prev-obesity-alcohol", "ev-pc-pdq-biggest-risks"]),
        card("card-pc-social-mht-imaging", "obj-pc-social-risk", "What imaging effects does PDQ link to hormone therapy?", "Increased density, lower mammographic sensitivity, more interval cancers.", ["ev-pc-pdq-density-imaging"], review=REVIEW_QR),
        card("card-pc-social-access", "obj-pc-social-risk", "Why does timely follow-up after abnormal screening matter in disparity discussions?", "PDQ cites delayed follow-up among factors tied to worse outcomes for Black women.", ["ev-pc-pdq-disparity"], review=REVIEW_QR),
        # signs
        card("card-pc-sx-list", "obj-pc-signs-symptoms", "Name four breast findings NCI says patients should report.", "Examples: lump, underarm lump, size/shape change, nipple discharge, nipple direction change, skin dimpling/redness/scaliness.", ["ev-pc-nci-symptoms-list"]),
        card("card-pc-sx-pain", "obj-pc-signs-symptoms", "Does breast cancer usually cause pain?", "No. Pain is usually from other causes, but persistent pain still needs evaluation.", ["ev-pc-nci-pain-not-usual"]),
        card("card-pc-sx-peau", "obj-pc-signs-symptoms", "What is peau d’orange in SEER's symptom list?", "Breast skin dimples that look like orange peel.", ["ev-pc-seer-symptoms-exam"]),
        card("card-pc-sx-silent", "obj-pc-signs-symptoms", "Why does NCI say screening still matters if someone feels fine?", "Early breast cancer often has no symptoms.", ["ev-pc-nci-symptoms-list"]),
        # history
        card("card-pc-hx-interview", "obj-pc-history-documentation", "What does OpenStax say subjective breast assessment begins with?", "A patient interview/health history including risk factors such as age and personal/family history.", ["ev-pc-openstax-breast-hx"]),
        card("card-pc-hx-uspstf", "obj-pc-history-documentation", "Who besides cisgender women is included in USPSTF average-risk screening recommendations?", "Other persons assigned female at birth, including transgender men and nonbinary persons, age 40+ at average risk.", ["ev-pc-uspstf-gender-population"], review=REVIEW_QR),
        card("card-pc-hx-order", "obj-pc-history-documentation", "If a screening patient reports a new lump at intake, what should you do first?", "Reconcile history with the order and follow facility protocol for diagnostic pathway—do not ignore the symptom.", ["ev-pc-nci-symptoms-diagnostic", "ev-pc-nci-screen-vs-dx"]),
        card("card-pc-hx-markers-gap", "obj-pc-history-documentation", "Do the open sources in this batch specify scar/mole/tattoo marker shapes?", "No—use facility protocol; marker methods remain a documented source gap.", ["ev-pc-openstax-breast-hx"], review=REVIEW_QR),
        # priors
        card("card-pc-priors-15", "obj-pc-prior-images", "Within how many calendar days must a facility transfer mammograms after a proper request?", "15 calendar days.", ["ev-mqsa-record-transfer"]),
        card("card-pc-priors-why", "obj-pc-prior-images", "Why obtain prior mammograms when possible?", "Comparison helps interpretation; MQSA incomplete categories may note need for priors.", ["ev-mqsa-incomplete-categories", "ev-mqsa-record-transfer"]),
        # surgical
        card("card-pc-sx-lump", "obj-pc-surgical-options", "Define lumpectomy in one sentence.", "Removes cancer/abnormal tissue and some surrounding normal tissue but not the whole breast.", ["ev-pc-dict-lumpectomy"]),
        card("card-pc-sx-simple", "obj-pc-surgical-options", "Simple mastectomy is also called what, and what is removed?", "Total mastectomy; the whole breast (nipple/areola/skin as applicable).", ["ev-pc-dict-simple-mastectomy"]),
        card("card-pc-sx-mrm", "obj-pc-surgical-options", "How does modified radical mastectomy differ from simple mastectomy?", "It also removes most axillary lymph nodes.", ["ev-pc-dict-mrm", "ev-pc-nci-mastectomy-types"]),
        card("card-pc-sx-proph", "obj-pc-surgical-options", "What is prophylactic mastectomy?", "Risk-reducing removal of one or both breasts before disease in very high-risk people.", ["ev-pc-dict-prophylactic-mastectomy"]),
        card("card-pc-sx-slnb", "obj-pc-surgical-options", "How are sentinel nodes identified for biopsy?", "Radioactive tracer and/or blue dye marking the first drainage node(s).", ["ev-pc-dict-slnb"]),
        # nonsurgical
        card("card-pc-rx-local", "obj-pc-nonsurgical-options", "Name a local nonsurgical breast cancer treatment.", "Radiation therapy.", ["ev-pc-nci-local-systemic", "ev-pc-dict-chemo-rt-ht"]),
        card("card-pc-rx-ht", "obj-pc-nonsurgical-options", "Which tumors may respond to hormone/endocrine therapy?", "Hormone receptor–positive (ER and/or PR) tumors—not HR-negative.", ["ev-pc-nci-ht-receptors", "ev-pc-seer-biomarkers"]),
        card("card-pc-rx-tnbc", "obj-pc-nonsurgical-options", "What does triple-negative mean?", "ER, PR, and HER2 are all negative.", ["ev-pc-pdq-receptor-classes"]),
        card("card-pc-rx-implant", "obj-pc-nonsurgical-options", "Describe a common two-stage implant reconstruction sequence.", "Tissue expander placed and filled over time, then replaced with a permanent implant.", ["ev-pc-nci-reconstruction-implant"]),
    ]

    for c in new_cards:
        if c["id"] not in card_ids:
            cards_doc["cards"].append(c)
            card_ids.add(c["id"])

    def four(a, b, c, d):
        return [("a", *a), ("b", *b), ("c", *c), ("d", *d)]

    new_qs = [
        # epidemiology 104-111
        q(
            "q-pc-104",
            "obj-pc-epidemiology",
            "fam-pc-epi-invasive",
            "According to NCI Breast Cancer Screening PDQ estimates cited for 2025, about how many invasive female breast cancer cases were expected in the U.S.?",
            four(
                ("About 316,950", "Correct—PDQ's 2025 invasive estimate."),
                ("About 42,170", "That is the death estimate, not invasive incidence."),
                ("About 59,080", "That is the in situ estimate."),
                ("About 1% of all cancers in men only", "Men are ~1% of breast cancers; this is not the invasive count."),
            ),
            "a",
            "PDQ estimates about 316,950 invasive cases for 2025—always keep the year with the number.",
            ["ev-pc-pdq-incidence-2025"],
            review=REVIEW_QR,
            simpler="Use the PDQ 2025 invasive estimate (~316,950).",
            difficulty="recall",
        ),
        q(
            "q-pc-105",
            "obj-pc-epidemiology",
            "fam-pc-epi-male",
            "NCI PDQ states men account for about what share of breast cancer cases and deaths?",
            four(
                ("About 10%", "That figure is closer to the inherited-risk share of cases, not male share."),
                ("About 1%", "Correct."),
                ("About 25%", "Far too high."),
                ("Zero—male breast cancer is not reported", "Male breast cancer is uncommon but real (~1%)."),
            ),
            "b",
            "Men account for about 1% of breast cancer cases and deaths.",
            ["ev-pc-pdq-incidence-2025"],
            simpler="About 1% of cases/deaths are in men.",
        ),
        q(
            "q-pc-106",
            "obj-pc-epidemiology",
            "fam-pc-epi-brca",
            "About what proportion of breast cancer cases does PDQ attribute to inherited risk including BRCA1/BRCA2 carriers?",
            four(
                ("Fewer than 1%", "Too low."),
                ("Approximately 5% to 10%", "Correct."),
                ("Approximately 50%", "Most cases are not BRCA-driven."),
                ("All cases with any family history", "Family history ≠ proven inherited high-risk mutation."),
            ),
            "b",
            "Inherited risk including BRCA1/2 accounts for about 5%–10% of cases.",
            ["ev-pc-pdq-brca-share"],
            review=REVIEW_QR,
        ),
        q(
            "q-pc-107",
            "obj-pc-epidemiology",
            "fam-pc-epi-drivers",
            "Which pair does PDQ explicitly link to major shifts in breast cancer incidence patterns?",
            four(
                ("Screening adoption and postmenopausal hormone therapy use", "Correct."),
                ("Deodorant brand and underwire bras", "Not PDQ-supported causes."),
                ("Only solar UV exposure", "Not the breast incidence drivers named here."),
                ("Only male breast cancer trends", "Male disease is ~1%; not the main incidence driver discussion."),
            ),
            "a",
            "PDQ ties incidence shifts to screening participation and postmenopausal hormone therapy trends (plus reproductive patterns).",
            ["ev-pc-pdq-incidence-drivers"],
            review=REVIEW_QR,
            difficulty="understand",
        ),
        q(
            "q-pc-108",
            "obj-pc-epidemiology",
            "fam-pc-epi-insitu",
            "Alongside ~316,950 invasive cases, what in situ estimate does PDQ give for 2025?",
            four(
                ("About 5,908", "Off by a factor of ten."),
                ("About 59,080", "Correct."),
                ("About 316,950", "That is invasive incidence."),
                ("About 42,170", "Deaths, not in situ cases."),
            ),
            "b",
            "PDQ's 2025 in situ estimate is about 59,080.",
            ["ev-pc-pdq-incidence-2025"],
            review=REVIEW_QR,
        ),
        q(
            "q-pc-109",
            "obj-pc-epidemiology",
            "fam-pc-epi-disparity",
            "Which disparity statement matches PDQ?",
            four(
                ("Black women have higher incidence at every age and lower mortality", "Opposite of the PDQ pattern described."),
                ("Incidence is higher in White women overall, but Black women have lower survival by stage and higher mortality", "Correct."),
                ("Disparities are fully explained by denser breasts alone", "PDQ lists multiple care and biology factors."),
                ("Hispanic women have the highest U.S. incidence and mortality", "PDQ states Hispanic, Asian/PI, and AI/AN women have lower incidence and mortality than White or Black women."),
            ),
            "b",
            "PDQ: higher incidence in White women overall; Black women have worse survival/mortality with multifactorial contributors.",
            ["ev-pc-pdq-disparity"],
            review=REVIEW_QR,
            difficulty="understand",
        ),
        q(
            "q-pc-110",
            "obj-pc-epidemiology",
            "fam-pc-epi-dcis-screen",
            "Why did DCIS incidence rise after mammography became widespread, per PDQ?",
            four(
                ("Because deodorant use increased", "Unsupported."),
                ("Because screening detects more in situ disease", "Correct—PDQ links dramatic DCIS increases to screening adoption."),
                ("Because male breast cancer surged", "Not the explanation."),
                ("Because radiation from one mammogram causes DCIS within days", "PDQ does not support that claim."),
            ),
            "b",
            "Widespread screening increased detection of DCIS and changed detected-cancer characteristics.",
            ["ev-pc-pdq-incidence-drivers"],
            review=REVIEW_QR,
        ),
        q(
            "q-pc-111",
            "obj-pc-epidemiology",
            "fam-pc-epi-year",
            "A learner quotes an incidence number without a year. Best teaching correction?",
            four(
                ("Any recent-sounding number is fine", "Unsafe."),
                ("Keep the source year with the estimate because figures are year-specific", "Correct."),
                ("Round every statistic to the nearest million", "Loses meaning."),
                ("Replace all numbers with \"very common\"", "Avoids accountability to sources."),
            ),
            "b",
            "Incidence estimates are year-labeled; teach the year with the number.",
            ["ev-pc-pdq-incidence-2025"],
            review=REVIEW_QR,
            difficulty="apply",
        ),
        # inherent 112-119
        q(
            "q-pc-112",
            "obj-pc-inherent-risk",
            "fam-pc-risk-biggest",
            "Per NCI PDQ, what are the two biggest breast cancer risk factors in order?",
            four(
                ("Alcohol, then obesity", "Listed, but not the biggest."),
                ("Being female, then advancing age", "Correct."),
                ("Dense breasts, then caffeine", "Caffeine is not the PDQ lead pair."),
                ("Night-shift work, then bras", "Not the PDQ lead pair."),
            ),
            "b",
            "Female sex, then advancing age, are the biggest risk factors.",
            ["ev-pc-pdq-biggest-risks"],
            review=REVIEW_QR,
        ),
        q(
            "q-pc-113",
            "obj-pc-inherent-risk",
            "fam-pc-risk-age-mag",
            "PDQ Prevention cites which approximate 10-year diagnosis chances by age?",
            four(
                ("Age 30 ≈ 1 in 9; age 70 ≈ 1 in 175", "Reversed."),
                ("Age 30 ≈ 1 in 175; age 70 ≈ 1 in 9", "Correct."),
                ("Both ages ≈ 1 in 8 lifetime only", "Different metric; not this locator."),
                ("Age is unrelated once screening starts", "False."),
            ),
            "b",
            "About 1 in 175 at age 30 vs about 1 in 9 at age 70 over the next 10 years.",
            ["ev-pc-prev-age-risk"],
            review=REVIEW_QR,
        ),
        q(
            "q-pc-114",
            "obj-pc-inherent-risk",
            "fam-pc-risk-repro",
            "Which reproductive history pattern is associated with higher risk in PDQ?",
            four(
                ("Late menarche and early menopause only", "Opposite direction for estrogen exposure time."),
                ("Early menarche, late menopause, nulliparity, or late first pregnancy", "Correct."),
                ("Multiparity with breastfeeding only as risk raisers", "Those are generally discussed as risk-lowering/protective patterns, not the risk raisers listed."),
                ("Only cesarean delivery history", "Not listed."),
            ),
            "b",
            "Longer estrogen exposure patterns (early menarche, late menopause, nulliparity, late first pregnancy) increase risk.",
            ["ev-pc-prev-repro-mht", "ev-pc-pdq-biggest-risks"],
            review=REVIEW_QR,
            difficulty="understand",
        ),
        q(
            "q-pc-115",
            "obj-pc-inherent-risk",
            "fam-pc-risk-radiation",
            "A history of mantle radiation for lymphoma in adolescence should cue the technologist that:",
            four(
                ("Average-risk USPSTF timing automatically applies unchanged", "High-dose chest radiation young is excluded from USPSTF average-risk recommendations."),
                ("Later breast cancer risk is increased and clinicians may use different screening planning", "Correct."),
                ("Mammography is never allowed again", "False."),
                ("Only ultrasound can ever be used", "Not a sourced absolute."),
            ),
            "b",
            "Prior thoracic/mantle radiation raises risk and moves patients out of average-risk assumptions.",
            ["ev-pc-prev-radiation-mantle", "ev-pc-uspstf-gender-population"],
            review=REVIEW_QR,
            difficulty="apply",
        ),
        q(
            "q-pc-116",
            "obj-pc-inherent-risk",
            "fam-pc-risk-density",
            "Which statement about dense breasts matches PDQ?",
            four(
                ("Density only affects how the breast feels on clinical exam", "Density is mammographic; NCI notes it is not how breasts feel."),
                ("High density can lower mammographic sensitivity and is linked to higher incidence, not higher death", "Correct."),
                ("Density guarantees cancer within one year", "False."),
                ("Density eliminates the need for priors", "False."),
            ),
            "b",
            "High density lowers sensitivity and raises incidence modestly without raising death risk per PDQ.",
            ["ev-pc-pdq-density-imaging", "ev-pc-nci-dense-risk"],
            review=REVIEW_QR,
            difficulty="understand",
        ),
        q(
            "q-pc-117",
            "obj-pc-inherent-risk",
            "fam-pc-risk-family",
            "Personal or family history of breast cancer is best treated by the technologist as:",
            four(
                ("Irrelevant if the patient feels well", "Still relevant risk history."),
                ("An inherent risk factor to document accurately for the care team", "Correct."),
                ("Proof the patient must have BRCA1", "Family history ≠ confirmed mutation."),
                ("A reason to refuse screening", "Opposite of usual care."),
            ),
            "b",
            "Document personal/family history; do not over-interpret genetics.",
            ["ev-pc-pdq-biggest-risks", "ev-pc-pdq-brca-share"],
        ),
        q(
            "q-pc-118",
            "obj-pc-inherent-risk",
            "fam-pc-risk-uspstf-exclude",
            "Which history places a person outside USPSTF average-risk screening recommendations?",
            four(
                ("Dense breasts alone", "Dense breasts are still within the recommendation's applicable population, though risk is higher."),
                ("Known BRCA1/BRCA2 or other high-risk genetic syndrome", "Correct—excluded from the average-risk recommendation."),
                ("First-degree relative with breast cancer alone", "Still within applicable population per USPSTF text."),
                ("Age 45", "Age 40+ average-risk is included."),
            ),
            "b",
            "High-risk genetic markers/syndromes are outside the USPSTF average-risk recommendation.",
            ["ev-pc-uspstf-gender-population"],
            review=REVIEW_QR,
            difficulty="apply",
        ),
        q(
            "q-pc-119",
            "obj-pc-inherent-risk",
            "fam-pc-risk-ionizing",
            "Besides mantle therapy, PDQ lists which exposure class among breast cancer risk factors?",
            four(
                ("Ionizing radiation exposure", "Correct."),
                ("Visible light from viewing stations", "Not a listed risk factor."),
                ("Ultrasound gel brand", "Not a risk factor."),
                ("Compression paddle material", "Not a risk factor."),
            ),
            "a",
            "Ionizing radiation exposure is among listed risk factors.",
            ["ev-pc-pdq-biggest-risks"],
        ),
        # social 120-127
        q(
            "q-pc-120",
            "obj-pc-social-risk",
            "fam-pc-social-mht",
            "Which menopausal hormone pattern does PDQ highlight as increasing breast cancer risk?",
            four(
                ("Vaginal moisturizer only", "Not the highlighted systemic risk pattern."),
                ("Combination estrogen-progesterone after menopause", "Correct."),
                ("All thyroid replacement", "Not this claim."),
                ("Insulin only", "Not this claim."),
            ),
            "b",
            "Combined estrogen-progesterone MHT after menopause increases risk.",
            ["ev-pc-prev-repro-mht"],
            review=REVIEW_QR,
        ),
        q(
            "q-pc-121",
            "obj-pc-social-risk",
            "fam-pc-social-alcohol",
            "Which lifestyle factor is associated with increased breast cancer risk in PDQ?",
            four(
                ("Alcohol consumption", "Correct."),
                ("Drinking fluoridated water", "Not listed."),
                ("Eating any soy product once", "Not the PDQ claim used here."),
                ("Using antiperspirant", "Not supported as a cause in these sources."),
            ),
            "a",
            "Alcohol consumption is associated with increased risk.",
            ["ev-pc-prev-obesity-alcohol", "ev-pc-pdq-biggest-risks"],
        ),
        q(
            "q-pc-122",
            "obj-pc-social-risk",
            "fam-pc-social-obesity",
            "Obesity is linked in PDQ to higher breast cancer risk particularly in which group?",
            four(
                ("All preadolescent boys", "Not the claim."),
                ("Postmenopausal women who have not used hormone therapy", "Correct."),
                ("Only BRCA carriers", "Not limited that way in the obesity statement."),
                ("Only men", "Not the claim."),
            ),
            "b",
            "Obesity associates with increased risk in postmenopausal women without HT use.",
            ["ev-pc-prev-obesity-alcohol"],
            review=REVIEW_QR,
        ),
        q(
            "q-pc-123",
            "obj-pc-social-risk",
            "fam-pc-social-imaging",
            "Hormone therapy's imaging-related effects in PDQ include:",
            four(
                ("Guaranteed higher sensitivity", "Opposite."),
                ("Increased density, lower sensitivity, more interval cancers", "Correct."),
                ("Elimination of the need for compression", "False."),
                ("Automatic conversion of every screen to MRI", "Not automatic."),
            ),
            "b",
            "HT associates with increased density, lower sensitivity, and more interval cancers.",
            ["ev-pc-pdq-density-imaging"],
            review=REVIEW_QR,
            difficulty="understand",
        ),
        q(
            "q-pc-124",
            "obj-pc-social-risk",
            "fam-pc-social-ht-vs-endocrine",
            "Best technologist clarification when a patient says she is \"on hormones\":",
            four(
                ("Assume menopausal HT and cancer endocrine therapy are identical", "They are different."),
                ("Distinguish menopausal hormone therapy (risk factor) from breast-cancer endocrine treatment", "Correct."),
                ("Tell her to stop all hormones today", "Prescribing—out of scope."),
                ("Refuse to document either", "Document accurately instead."),
            ),
            "b",
            "Menopausal HT ≠ breast-cancer hormone/endocrine therapy.",
            ["ev-pc-nci-ht-receptors", "ev-pc-prev-repro-mht"],
            difficulty="apply",
        ),
        q(
            "q-pc-125",
            "obj-pc-social-risk",
            "fam-pc-social-followup",
            "Why emphasize timely follow-up after abnormal screening when discussing disparities?",
            four(
                ("PDQ cites delayed follow-up among contributors to mortality disparities", "Correct."),
                ("Follow-up timing never affects stage", "False."),
                ("Only cosmetic clinics need follow-up", "False."),
                ("Dense breasts make follow-up optional", "False."),
            ),
            "a",
            "Delayed follow-up after abnormal mammograms is among factors PDQ lists in disparity discussions.",
            ["ev-pc-pdq-disparity"],
            review=REVIEW_QR,
            difficulty="understand",
        ),
        q(
            "q-pc-126",
            "obj-pc-social-risk",
            "fam-pc-social-access",
            "An uninsured patient worries about paying for future screening. Best technologist action among these?",
            four(
                ("Invent eligibility rules for federal programs", "Do not invent."),
                ("Share facility-approved resource information (e.g., paths described in NCI patient materials) without guaranteeing enrollment", "Correct."),
                ("Cancel the current exam", "Not appropriate."),
                ("Tell her screening is worthless without insurance", "False and harmful."),
            ),
            "b",
            "Point to approved access resources; do not promise eligibility.",
            ["ev-pc-nci-access-nbccedp"],
            difficulty="apply",
            extra_objectives=["obj-pc-rapport-support"],
        ),
        q(
            "q-pc-127",
            "obj-pc-social-risk",
            "fam-pc-social-document",
            "Documenting alcohol and MHT on the mammography history is important because:",
            four(
                ("They are irrelevant social chatter", "They are risk/imaging-relevant."),
                ("They are sourced risk factors and MHT can affect density/sensitivity", "Correct."),
                ("They replace the need for a radiology report", "False."),
                ("They allow technologists to prescribe tamoxifen", "Out of scope."),
            ),
            "b",
            "Lifestyle and hormone history inform risk context and imaging performance.",
            ["ev-pc-prev-repro-mht", "ev-pc-pdq-density-imaging", "ev-pc-prev-obesity-alcohol"],
            review=REVIEW_QR,
        ),
        # signs 128-135
        q(
            "q-pc-128",
            "obj-pc-signs-symptoms",
            "fam-pc-sx-lump",
            "Which finding belongs on NCI's list of breast changes to report?",
            four(
                ("A new underarm lump", "Correct."),
                ("Occasional thirst after exercise", "Unrelated."),
                ("Seasonal allergies alone", "Unrelated."),
                ("Normal lactation discharge while breastfeeding with no other change", "Milk discharge in lactation is expected; non-milk discharge is the concern."),
            ),
            "a",
            "Underarm lumps are explicitly included in NCI's symptom list.",
            ["ev-pc-nci-symptoms-list"],
        ),
        q(
            "q-pc-129",
            "obj-pc-signs-symptoms",
            "fam-pc-sx-pain",
            "Which statement about breast pain matches NCI?",
            four(
                ("Breast cancer usually presents with severe pain", "Opposite."),
                ("Breast cancer does not usually cause pain; persistent pain still needs evaluation", "Correct."),
                ("Pain always means inflammatory carcinoma", "Not true."),
                ("Pain means screening is unnecessary", "False."),
            ),
            "b",
            "Cancer is usually painless; persistent pain still warrants a clinician visit.",
            ["ev-pc-nci-pain-not-usual"],
        ),
        q(
            "q-pc-130",
            "obj-pc-signs-symptoms",
            "fam-pc-sx-peau",
            "Peau d’orange refers to:",
            four(
                ("Normal Montgomery glands only", "Different."),
                ("Orange-peel-like skin dimpling of the breast", "Correct."),
                ("A type of calcification on mammography", "Clinical skin finding, not a calc pattern name here."),
                ("A brand of skin marker", "No."),
            ),
            "b",
            "SEER lists peau d’orange as orange-peel skin dimpling.",
            ["ev-pc-seer-symptoms-exam"],
        ),
        q(
            "q-pc-131",
            "obj-pc-signs-symptoms",
            "fam-pc-sx-nipple",
            "Which nipple finding is a reportable change on NCI's list?",
            four(
                ("Fluid that is not breast milk", "Correct."),
                ("Temporary nipple erection from cold", "Not pathologic discharge."),
                ("Symmetric lactation in a nursing parent", "Expected."),
                ("Wearing a darker bra", "Irrelevant."),
            ),
            "a",
            "Non-milk nipple fluid/discharge is a listed change.",
            ["ev-pc-nci-symptoms-list", "ev-pc-seer-symptoms-exam"],
        ),
        q(
            "q-pc-132",
            "obj-pc-signs-symptoms",
            "fam-pc-sx-silent",
            "Why can a patient have breast cancer without noticing symptoms?",
            four(
                ("Early breast cancer often has no symptoms, which is why screening matters", "Correct."),
                ("Cancer always hurts first", "False."),
                ("Symptoms only appear after age 80", "False."),
                ("Symptoms are impossible before metastasis", "False."),
            ),
            "a",
            "NCI emphasizes that early disease is often asymptomatic.",
            ["ev-pc-nci-symptoms-list"],
        ),
        q(
            "q-pc-133",
            "obj-pc-signs-symptoms",
            "fam-pc-sx-skin",
            "Scaly, red, or swollen skin of the breast, nipple, or areola should be:",
            four(
                ("Ignored if the last mammogram was normal", "NCI says follow up even after a recent normal mammogram."),
                ("Documented and escalated per protocol", "Correct."),
                ("Treated by the technologist with steroid cream", "Out of scope."),
                ("Proof of deodorant artifact only", "Do not assume."),
            ),
            "b",
            "Skin changes are listed symptoms requiring clinical follow-up.",
            ["ev-pc-nci-symptoms-list", "ev-pc-nci-symptoms-diagnostic"],
            difficulty="apply",
        ),
        q(
            "q-pc-134",
            "obj-pc-signs-symptoms",
            "fam-pc-sx-diagnostic",
            "A symptomatic patient may be referred for which exam type per NCI?",
            four(
                ("Diagnostic mammogram or other tests to evaluate the change", "Correct."),
                ("Only a screening mammogram with no clinical history", "Symptoms change the pathway."),
                ("No imaging ever", "False."),
                ("Only whole-body PET by technologist order", "Technologists do not order that."),
            ),
            "a",
            "Symptoms may prompt diagnostic mammography or other tests.",
            ["ev-pc-nci-symptoms-diagnostic", "ev-pc-nci-screen-vs-dx"],
            difficulty="understand",
        ),
        q(
            "q-pc-135",
            "obj-pc-signs-symptoms",
            "fam-pc-sx-most-benign",
            "Which counseling point matches NCI?",
            four(
                ("Most breast changes are cancer until proven otherwise by the technologist", "Technologists do not diagnose; NCI notes most changes are not cancer but still need follow-up."),
                ("Most breast changes are not cancer, but unusual changes still need clinician follow-up", "Correct."),
                ("Only painful changes matter", "Pain is unreliable."),
                ("Skin dimpling is always benign", "Needs evaluation."),
            ),
            "b",
            "Most changes are not cancer; follow-up is still required.",
            ["ev-pc-nci-symptoms-list"],
        ),
        # history 136-143
        q(
            "q-pc-136",
            "obj-pc-history-documentation",
            "fam-pc-hx-interview",
            "OpenStax frames the start of subjective breast assessment as:",
            four(
                ("Skipping history if screening is ordered", "History still matters."),
                ("A health-history interview that notes risk factors such as age and personal/family history", "Correct."),
                ("Only photographing the breasts", "Incomplete."),
                ("Immediate biopsy by the technologist", "Out of scope."),
            ),
            "b",
            "Subjective data begins with a structured history interview.",
            ["ev-pc-openstax-breast-hx"],
        ),
        q(
            "q-pc-137",
            "obj-pc-history-documentation",
            "fam-pc-hx-order",
            "Screening is ordered, but the patient reports a new lump today. Best first action?",
            four(
                ("Ignore the lump to keep the schedule", "Unsafe."),
                ("Reconcile the history with the order and follow facility diagnostic protocol", "Correct."),
                ("Tell the patient it is definitely cancer", "Do not diagnose."),
                ("Cancel all future mammograms permanently", "Inappropriate."),
            ),
            "b",
            "Symptoms can change exam type; reconcile and escalate per protocol.",
            ["ev-pc-nci-symptoms-diagnostic", "ev-pc-nci-screen-vs-dx"],
            difficulty="apply",
        ),
        q(
            "q-pc-138",
            "obj-pc-history-documentation",
            "fam-pc-hx-gender",
            "USPSTF average-risk screening recommendations apply to:",
            four(
                ("Only cisgender women who have never taken hormones", "Too narrow."),
                ("Cisgender women and other persons assigned female at birth, including transgender men and nonbinary persons, age 40+ at average risk", "Correct."),
                ("Only people who have completed gender-affirming mastectomy", "Not the USPSTF population statement."),
                ("Men assigned male at birth with no breast tissue always", "Not this recommendation's population."),
            ),
            "b",
            "USPSTF includes AFAB persons including transgender men and nonbinary persons at average risk.",
            ["ev-pc-uspstf-gender-population"],
            review=REVIEW_QR,
            difficulty="understand",
        ),
        q(
            "q-pc-139",
            "obj-pc-history-documentation",
            "fam-pc-hx-exclude",
            "Which history is outside USPSTF average-risk recommendations and needs clinician-directed planning?",
            four(
                ("High-dose chest radiation at a young age", "Correct."),
                ("Dense breasts alone", "Still within applicable population."),
                ("Age 42", "Included if average risk."),
                ("First-degree family history alone", "Still within applicable population per USPSTF."),
            ),
            "a",
            "High-dose chest radiation young is an exclusion.",
            ["ev-pc-uspstf-gender-population"],
            review=REVIEW_QR,
        ),
        q(
            "q-pc-140",
            "obj-pc-history-documentation",
            "fam-pc-hx-surgery",
            "Why document prior lumpectomy or mastectomy on the history?",
            four(
                ("Surgical history changes anatomy and comparison context for imaging", "Correct."),
                ("Surgery history is confidential from radiology", "Radiology needs it."),
                ("Only anesthesia needs surgical history", "Incomplete."),
                ("It lets technologists choose chemo", "Out of scope."),
            ),
            "a",
            "Surgical history informs anatomy, positioning, and comparison.",
            ["ev-pc-dict-lumpectomy", "ev-pc-nci-mastectomy-types", "ev-pc-openstax-breast-hx"],
            difficulty="understand",
        ),
        q(
            "q-pc-141",
            "obj-pc-history-documentation",
            "fam-pc-hx-markers",
            "Regarding scars, moles, and tattoos, what does this sourced batch support teaching?",
            four(
                ("Exact ACR marker SKUs every technologist must buy", "Not retrieved as redistributable detail here."),
                ("Clinical findings matter for correlation, but specific marker/diagram methods follow facility protocol because open sources in this batch do not specify them", "Correct."),
                ("Never document skin findings", "Opposite of the objective."),
                ("Tattoos always contraindicate mammography", "False."),
            ),
            "b",
            "Honest gap: document findings; marker technique is protocol/accreditation-specific pending permitted sources.",
            ["ev-pc-openstax-breast-hx", "ev-pc-nci-symptoms-list"],
            review=REVIEW_QR,
            difficulty="apply",
        ),
        q(
            "q-pc-142",
            "obj-pc-history-documentation",
            "fam-pc-hx-findings",
            "OpenStax expected inspection findings include skin that is:",
            four(
                ("Smooth without dimpling or thickening", "Correct."),
                ("Always peau d’orange at baseline", "That is abnormal."),
                ("Covered in radiopaque ink before history", "Not the textbook claim."),
                ("Ignored if mammography is planned", "Still assess/document relevant findings."),
            ),
            "a",
            "Expected: smooth skin without dimpling/thickening.",
            ["ev-pc-openstax-breast-hx"],
        ),
        q(
            "q-pc-143",
            "obj-pc-history-documentation",
            "fam-pc-hx-priors-link",
            "When comparison mammograms are needed, MQSA transfer timing after request is:",
            four(
                ("15 calendar days", "Correct."),
                ("15 business weeks", "Wrong unit."),
                ("90 minutes", "Too short/wrong."),
                ("Whenever the reading radiologist retires", "Not the rule."),
            ),
            "a",
            "Transfer within 15 calendar days of the facility receiving the request.",
            ["ev-mqsa-record-transfer"],
            extra_objectives=["obj-pc-prior-images"],
        ),
        # priors 144-147
        q(
            "q-pc-144",
            "obj-pc-prior-images",
            "fam-pc-prior-clock",
            "MQSA requires transfer of mammograms after a qualifying request within:",
            four(
                ("15 calendar days", "Correct."),
                ("15 months", "Too long."),
                ("5 years only if unpaid", "Not the transfer clock."),
                ("Next accreditation cycle", "Wrong."),
            ),
            "a",
            "15 calendar days.",
            ["ev-mqsa-record-transfer"],
        ),
        q(
            "q-pc-145",
            "obj-pc-prior-images",
            "fam-pc-prior-modality",
            "When digital mammograms/DBT are transferred for final interpretation, MQSA expects:",
            four(
                ("Faxed paper screenshots only", "Insufficient."),
                ("Electronic availability as original digital images", "Correct."),
                ("Verbal description of density only", "Not imaging transfer."),
                ("Destruction of priors first", "Opposite."),
            ),
            "b",
            "Digital/DBT for final interpretation must be available electronically as original digital images.",
            ["ev-mqsa-record-transfer"],
            difficulty="understand",
        ),
        q(
            "q-pc-146",
            "obj-pc-prior-images",
            "fam-pc-prior-incomplete",
            "MQSA incomplete assessment language may include need for:",
            four(
                ("Prior mammograms for comparison", "Correct."),
                ("Patient to write the radiology report", "No."),
                ("Immediate mastectomy", "Not an incomplete assessment category."),
                ("Stopping all future imaging forever", "No."),
            ),
            "a",
            "Incomplete categories include needing priors for comparison.",
            ["ev-mqsa-incomplete-categories"],
        ),
        q(
            "q-pc-147",
            "obj-pc-prior-images",
            "fam-pc-prior-fees",
            "Regarding fees for transferring/copying mammograms, MQSA states fees:",
            four(
                ("May be any amount the facility likes", "Limited."),
                ("Cannot exceed documented costs", "Correct."),
                ("Must be waived only for radiologists", "Not the rule stated."),
                ("Are banned in all states automatically", "Not what the evidence says."),
            ),
            "b",
            "Fees cannot exceed documented costs.",
            ["ev-mqsa-record-transfer"],
        ),
        # surgical 148-155
        q(
            "q-pc-148",
            "obj-pc-surgical-options",
            "fam-pc-surg-lump",
            "Lumpectomy is best defined as:",
            four(
                ("Removal of the entire breast and chest wall muscles", "Radical mastectomy territory."),
                ("Removal of cancer/abnormal tissue and some surrounding normal tissue, not the whole breast", "Correct."),
                ("Radiation without surgery", "Not surgery."),
                ("Biopsy of every axillary node by default", "Not the definition."),
            ),
            "b",
            "Lumpectomy is breast-conserving removal of disease plus a margin of normal tissue.",
            ["ev-pc-dict-lumpectomy"],
        ),
        q(
            "q-pc-149",
            "obj-pc-surgical-options",
            "fam-pc-surg-simple",
            "Simple mastectomy is also called:",
            four(
                ("Total mastectomy", "Correct."),
                ("Lumpectomy", "Opposite."),
                ("Sentinel node biopsy alone", "Node procedure, not breast removal."),
                ("Radiation boost", "Not surgery."),
            ),
            "a",
            "Simple = total mastectomy.",
            ["ev-pc-dict-simple-mastectomy"],
        ),
        q(
            "q-pc-150",
            "obj-pc-surgical-options",
            "fam-pc-surg-mrm",
            "Modified radical mastectomy adds which element beyond total mastectomy?",
            four(
                ("Removal of most axillary lymph nodes", "Correct."),
                ("Mandatory removal of both ovaries", "Not the definition."),
                ("Only nipple tattooing", "Reconstruction detail, not MRM definition."),
                ("Chemotherapy infusion in the OR", "Systemic therapy, not the surgery definition."),
            ),
            "a",
            "MRM = whole breast plus most axillary nodes.",
            ["ev-pc-dict-mrm", "ev-pc-nci-mastectomy-types"],
        ),
        q(
            "q-pc-151",
            "obj-pc-surgical-options",
            "fam-pc-surg-proph",
            "Prophylactic mastectomy means:",
            four(
                ("Emergency mastectomy after trauma only", "No."),
                ("Risk-reducing removal of one or both breasts before disease in very high-risk people", "Correct."),
                ("Lumpectomy of a known cancer", "Therapeutic breast conservation."),
                ("Sentinel node biopsy without breast surgery", "Different."),
            ),
            "b",
            "Prophylactic/risk-reducing mastectomy precedes disease in very high-risk patients.",
            ["ev-pc-dict-prophylactic-mastectomy"],
        ),
        q(
            "q-pc-152",
            "obj-pc-surgical-options",
            "fam-pc-surg-slnb",
            "Sentinel lymph node biopsy identifies nodes using:",
            four(
                ("Radioactive tracer and/or blue dye", "Correct."),
                ("Only verbal patient report of pain", "Not localization."),
                ("MRI contrast in every case exclusively", "Not the dictionary method."),
                ("Compression paddle serial numbers", "Irrelevant."),
            ),
            "a",
            "Tracer and/or blue dye map the sentinel node(s).",
            ["ev-pc-dict-slnb"],
        ),
        q(
            "q-pc-153",
            "obj-pc-surgical-options",
            "fam-pc-surg-radical",
            "NCI notes radical mastectomy (including chest wall muscles) is:",
            four(
                ("The most common modern first choice for every DCIS", "False."),
                ("Rarely performed now because it does not improve longevity compared with less extensive surgery", "Correct."),
                ("Identical to lumpectomy", "No."),
                ("Required before any reconstruction", "No."),
            ),
            "b",
            "Radical mastectomy is rarely used today.",
            ["ev-pc-nci-mastectomy-types"],
            difficulty="understand",
        ),
        q(
            "q-pc-154",
            "obj-pc-surgical-options",
            "fam-pc-surg-synonym",
            "Which term is a synonym group for lumpectomy in NCI's dictionary?",
            four(
                ("Breast-conserving surgery / partial mastectomy", "Correct."),
                ("Modified radical mastectomy only", "Different."),
                ("Prophylactic bilateral mastectomy only", "Different."),
                ("Axillary dissection alone", "Different."),
            ),
            "a",
            "Lumpectomy is also called breast-conserving/partial mastectomy (and related terms).",
            ["ev-pc-dict-lumpectomy"],
        ),
        q(
            "q-pc-155",
            "obj-pc-surgical-options",
            "fam-pc-surg-scope",
            "A patient asks which surgery she should choose. Best technologist response?",
            four(
                ("Prescribe modified radical mastectomy", "Out of scope."),
                ("Explain definitions and defer decision-making to the surgical/oncology team", "Correct."),
                ("Tell her lumpectomy never needs radiation", "Often false and beyond scope."),
                ("Refuse to define any terms", "Education is appropriate; decisions are not."),
            ),
            "b",
            "Terminology yes; treatment choice no.",
            ["ev-pc-dict-lumpectomy", "ev-pc-nci-mastectomy-types"],
            difficulty="apply",
        ),
        # nonsurgical 156-163
        q(
            "q-pc-156",
            "obj-pc-nonsurgical-options",
            "fam-pc-rx-local",
            "Which therapy is classified as a local treatment on NCI's overview?",
            four(
                ("Radiation therapy", "Correct."),
                ("Intravenous chemotherapy circulating systemically", "Systemic."),
                ("Oral endocrine therapy alone", "Systemic."),
                ("HER2-targeted antibody therapy alone", "Systemic/targeted."),
            ),
            "a",
            "Surgery and radiation are local; many drugs are systemic.",
            ["ev-pc-nci-local-systemic", "ev-pc-dict-chemo-rt-ht"],
        ),
        q(
            "q-pc-157",
            "obj-pc-nonsurgical-options",
            "fam-pc-rx-chemo",
            "Chemotherapy is best defined as:",
            four(
                ("Surgery to remove the breast", "Surgery."),
                ("Drug treatment that kills cancer cells or stops them from dividing", "Correct."),
                ("Only external-beam x-rays", "Radiation."),
                ("Placement of a saline implant", "Reconstruction."),
            ),
            "b",
            "Chemo uses drugs to kill or stop dividing cancer cells.",
            ["ev-pc-dict-chemo-rt-ht"],
        ),
        q(
            "q-pc-158",
            "obj-pc-nonsurgical-options",
            "fam-pc-rx-ht",
            "Hormone therapy for breast cancer is used when tumors are:",
            four(
                ("HR-positive (contain hormone receptors)", "Correct."),
                ("Always HR-negative", "Opposite."),
                ("Only HER2-positive regardless of ER/PR", "HER2 is separate; HT needs hormone receptors."),
                ("Never tested for receptors", "Testing guides therapy."),
            ),
            "a",
            "HR-positive tumors may respond; HR-negative do not.",
            ["ev-pc-nci-ht-receptors", "ev-pc-seer-biomarkers"],
            review=REVIEW_QR,
        ),
        q(
            "q-pc-159",
            "obj-pc-nonsurgical-options",
            "fam-pc-rx-tnbc",
            "Triple-negative breast cancer means:",
            four(
                ("ER, PR, and HER2 are all negative", "Correct."),
                ("Only HER2 is positive", "Different."),
                ("Three lumpectomies are required", "Nonsense."),
                ("Three negative mammograms prove cure", "False."),
            ),
            "a",
            "TNBC: ER−, PR−, HER2−.",
            ["ev-pc-pdq-receptor-classes"],
            review=REVIEW_QR,
        ),
        q(
            "q-pc-160",
            "obj-pc-nonsurgical-options",
            "fam-pc-rx-her2",
            "HER2/neu status is checked because:",
            four(
                ("It may help plan treatment when overexpressed/amplified", "Correct."),
                ("It measures blood pressure", "No."),
                ("It replaces the need for mammography forever", "No."),
                ("It is only a dental finding", "No."),
            ),
            "a",
            "HER2 results help plan therapy.",
            ["ev-pc-dict-er-pr-her2", "ev-pc-pdq-receptor-classes"],
        ),
        q(
            "q-pc-161",
            "obj-pc-nonsurgical-options",
            "fam-pc-rx-implant",
            "A common implant reconstruction path uses:",
            four(
                ("Tissue expander gradually filled, then permanent implant", "Correct."),
                ("Only oral chemotherapy to rebuild shape", "Not reconstruction."),
                ("Mandatory radical mastectomy of the contralateral lung", "Nonsense."),
                ("No surgical steps ever", "Reconstruction is surgical."),
            ),
            "a",
            "Expander then implant is a standard two-stage approach.",
            ["ev-pc-nci-reconstruction-implant"],
        ),
        q(
            "q-pc-162",
            "obj-pc-nonsurgical-options",
            "fam-pc-rx-ht-vs-mht",
            "NCI emphasizes that breast-cancer hormone therapy is:",
            four(
                ("Identical to menopausal hormone therapy", "Explicitly different."),
                ("Different from menopausal hormone therapy", "Correct."),
                ("A type of screening mammogram", "No."),
                ("Always given without receptor testing", "Testing matters."),
            ),
            "b",
            "Endocrine treatment ≠ menopausal HT.",
            ["ev-pc-nci-ht-receptors"],
            difficulty="understand",
        ),
        q(
            "q-pc-163",
            "obj-pc-nonsurgical-options",
            "fam-pc-rx-scope",
            "A patient asks which aromatase inhibitor she should take. Best response?",
            four(
                ("Pick one and dose it", "Prescribing—prohibited here."),
                ("Explain that endocrine drugs are clinician-selected for HR-positive disease and refer questions to the oncology team", "Correct."),
                ("Say HR-negative tumors respond best to tamoxifen", "Incorrect and out of scope."),
                ("Tell her biomarkers are irrelevant", "False."),
            ),
            "b",
            "Terminology-level teaching only; no prescribing.",
            ["ev-pc-nci-ht-receptors", "ev-pc-dict-chemo-rt-ht"],
            review=REVIEW_QR,
            difficulty="apply",
        ),
    ]

    for item in new_qs:
        if item["id"] not in q_ids:
            qs_doc["questions"].append(item)
            q_ids.add(item["id"])

    dump(les_path, lessons_doc)
    dump(card_path, cards_doc)
    dump(q_path, qs_doc)

    # ---- Coverage ----
    def cov_entry(oid, lesson_ids, question_ids, card_ids_list, visual_ids=None):
        return {
            "objectiveId": oid,
            "lessonIds": lesson_ids,
            "questionIds": question_ids,
            "cardIds": card_ids_list,
            "visualIds": visual_ids or [],
        }

    # Replace/extend objectiveCoverage rows for our objectives
    coverage_map = {
        "obj-pc-epidemiology": cov_entry(
            "obj-pc-epidemiology",
            ["les-pc-epidemiology"],
            [f"q-pc-{n}" for n in range(104, 112)] + ["q-pc-100"],
            ["card-pc-epi-invasive", "card-pc-epi-male", "card-pc-epi-brca-share", "card-pc-epi-drivers"],
        ),
        "obj-pc-inherent-risk": cov_entry(
            "obj-pc-inherent-risk",
            ["les-pc-inherent-risk"],
            [f"q-pc-{n}" for n in range(112, 120)] + ["q-pc-031", "q-pc-049", "q-pc-066", "q-pc-079", "q-pc-080"],
            [
                "card-pc-risk-age",
                "card-pc-risk-repro",
                "card-pc-risk-mantle",
                "card-pc-risk-density-sens",
                "card-pc-dense-common",
                "card-pc-dense-feel",
                "card-pc-dense-risk",
            ],
        ),
        "obj-pc-social-risk": cov_entry(
            "obj-pc-social-risk",
            ["les-pc-social-risk"],
            [f"q-pc-{n}" for n in range(120, 128)] + ["q-pc-052"],
            ["card-pc-social-mht", "card-pc-social-alcohol", "card-pc-social-mht-imaging", "card-pc-social-access"],
        ),
        "obj-pc-signs-symptoms": cov_entry(
            "obj-pc-signs-symptoms",
            ["les-pc-signs-symptoms"],
            [f"q-pc-{n}" for n in range(128, 136)] + ["q-pc-101"],
            ["card-pc-sx-list", "card-pc-sx-pain", "card-pc-sx-peau", "card-pc-sx-silent"],
        ),
        "obj-pc-history-documentation": cov_entry(
            "obj-pc-history-documentation",
            ["les-pc-history-doc"],
            [f"q-pc-{n}" for n in range(136, 144)],
            ["card-pc-hx-interview", "card-pc-hx-uspstf", "card-pc-hx-order", "card-pc-hx-markers-gap"],
        ),
        "obj-pc-prior-images": cov_entry(
            "obj-pc-prior-images",
            ["les-pc-prior-images"],
            [f"q-pc-{n}" for n in range(144, 148)] + ["q-pc-028", "q-pc-070", "q-pc-088", "q-pc-143"],
            ["card-pc-priors-15", "card-pc-priors-why", "card-pc-transfer-15"],
        ),
        "obj-pc-surgical-options": cov_entry(
            "obj-pc-surgical-options",
            ["les-pc-surgical"],
            [f"q-pc-{n}" for n in range(148, 156)] + ["q-pc-102"],
            ["card-pc-sx-lump", "card-pc-sx-simple", "card-pc-sx-mrm", "card-pc-sx-proph", "card-pc-sx-slnb"],
        ),
        "obj-pc-nonsurgical-options": cov_entry(
            "obj-pc-nonsurgical-options",
            ["les-pc-nonsurgical"],
            [f"q-pc-{n}" for n in range(156, 164)] + ["q-pc-072"],
            ["card-pc-rx-local", "card-pc-rx-ht", "card-pc-rx-tnbc", "card-pc-rx-implant"],
        ),
    }

    kept = []
    seen = set()
    for row in cov.get("objectiveCoverage", []):
        oid = row["objectiveId"]
        if oid in coverage_map:
            kept.append(coverage_map[oid])
            seen.add(oid)
        else:
            kept.append(row)
            seen.add(oid)
    for oid, row in coverage_map.items():
        if oid not in seen:
            kept.append(row)
    cov["objectiveCoverage"] = kept
    cov["version"] = "2026-10-06.2"
    cov["note"] = (
        "Patient-care coverage including risk/epidemiology, signs/history, and treatment-terminology batch. "
        "curriculumFollowUps open sourceState for coverage counting; curriculum.json sourceState remains needs_source until Aaron source-checks."
    )
    cov["curriculumFollowUps"] = [
        {
            "objectiveId": "obj-pc-epidemiology",
            "suggestedSourceState": "source_backed_open",
            "suggestedSourceIds": [
                "src-nci-pdq-breast-screening-hp",
                "src-nci-seer-breast",
            ],
            "note": "Incidence and disparity claims from Screening PDQ; SEER incidence page cross-check. Year-labeled estimates require qualified review.",
        },
        {
            "objectiveId": "obj-pc-inherent-risk",
            "suggestedSourceState": "source_backed_open",
            "suggestedSourceIds": [
                "src-nci-pdq-breast-screening-hp",
                "src-nci-pdq-breast-prevention-hp",
                "src-nci-dense-breasts",
                "src-uspstf-breast-2024",
            ],
            "note": "Inherent risk + density/imaging implications from PDQ Prevention/Screening and USPSTF exclusions.",
        },
        {
            "objectiveId": "obj-pc-social-risk",
            "suggestedSourceState": "source_backed_open",
            "suggestedSourceIds": [
                "src-nci-pdq-breast-prevention-hp",
                "src-nci-pdq-breast-screening-hp",
                "src-nci-mammograms",
            ],
            "note": "MHT, alcohol, obesity, access/disparity, and HT imaging effects. ACS remains link-only if used elsewhere.",
        },
        {
            "objectiveId": "obj-pc-signs-symptoms",
            "suggestedSourceState": "source_backed_open",
            "suggestedSourceIds": [
                "src-nci-breast-symptoms",
                "src-nci-seer-breast",
                "src-nci-mammograms",
            ],
            "note": "NCI symptoms page + SEER physical-exam signs list.",
        },
        {
            "objectiveId": "obj-pc-history-documentation",
            "suggestedSourceState": "source_backed_open",
            "suggestedSourceIds": [
                "src-openstax-clinical-nursing-breast",
                "src-nci-breast-symptoms",
                "src-uspstf-breast-2024",
                "src-ecfr-21-cfr-900",
            ],
            "note": "History interview + symptoms + USPSTF inclusive population + priors. Scar/mole/tattoo marker technique remains facility/ACR gap (see gapsNoted).",
        },
        {
            "objectiveId": "obj-pc-prior-images",
            "suggestedSourceState": "source_backed_open",
            "suggestedSourceIds": ["src-ecfr-21-cfr-900"],
            "note": "Already open via MQSA transfer evidence; lesson added for Learn path.",
        },
        {
            "objectiveId": "obj-pc-surgical-options",
            "suggestedSourceState": "source_backed_open",
            "suggestedSourceIds": [
                "src-nci-dictionary",
                "src-nci-breast-surgery",
                "src-nci-pdq-breast-treatment-hp",
                "src-nci-seer-breast",
            ],
            "note": "Terminology-only surgical definitions from NCI Dictionary + surgery pages.",
        },
        {
            "objectiveId": "obj-pc-nonsurgical-options",
            "suggestedSourceState": "source_backed_open",
            "suggestedSourceIds": [
                "src-nci-dictionary",
                "src-nci-breast-nonsurgical",
                "src-nci-pdq-breast-treatment-hp",
                "src-nci-breast-surgery",
                "src-nci-seer-breast",
            ],
            "note": "Radiation/chemo/HT/receptors/implant reconstruction at definition level only—no prescribing.",
        },
    ]
    cov["gapsNoted"] = [
        {
            "objectiveId": "obj-pc-bse-cbe",
            "note": "Still uncovered; ACS BSE/CBE position not extracted into evidence this batch.",
            "urlsNeeded": [
                "https://www.cancer.org/cancer/types/breast-cancer/screening-tests-and-early-detection/american-cancer-society-recommendations-for-the-early-detection-of-breast-cancer.html",
            ],
        },
        {
            "objectiveId": "obj-pc-typical-dose",
            "note": "Patient-friendly dose script still reserved; not part of this risk/symptoms/treatment batch.",
            "urlsNeeded": [
                "https://www.cancer.gov/types/breast/screening/mammograms",
                "https://www.cdc.gov/radiation-health/safety/alara.html",
            ],
        },
        {
            "objectiveId": "obj-pc-history-documentation",
            "state": "partial",
            "note": "Scars/moles/tattoos documentation methods (radiopaque markers vs diagram) lack a retrieved redistributable open source in this batch. Teach facility protocol; do not invent marker shapes.",
            "urlsNeeded": [
                "https://www.acr.org/Data-Science-and-Informatics/AI-in-Your-Practice/AI-Use-Cases/Use-Cases/Mammography-Skin-Markers",
                "https://accreditationsupport.acr.org/support/solutions/articles/11000065937-clinical-image-testing-mammography-revised-05-02-2024-",
                "https://www.asrt.org/educators/asrt-curricula/mammography",
            ],
        },
    ]
    dump(cov_path, cov)

    # Module summary bump
    mod["summary"] = (
        "Technologist-level patient communication plus risk/epidemiology, signs and history, and treatment terminology: "
        "preparing patients, explaining the exam, screening versus diagnostic purpose, results boundaries, infection control, "
        "breast cancer incidence and risk factors, symptom recognition, history documentation, and surgical/nonsurgical definitions."
    )
    mod["version"] = "1.1.0-beta.1"
    dump(mod_path, mod)

    # Curriculum: update sourceIds only; leave sourceState needs_source for Aaron check
    src_updates = {
        "obj-pc-epidemiology": ["src-nci-pdq-breast-screening-hp", "src-nci-seer-breast"],
        "obj-pc-inherent-risk": [
            "src-nci-pdq-breast-screening-hp",
            "src-nci-pdq-breast-prevention-hp",
            "src-nci-mammograms",
            "src-nci-dense-breasts",
            "src-uspstf-breast-2024",
        ],
        "obj-pc-social-risk": [
            "src-nci-pdq-breast-prevention-hp",
            "src-nci-pdq-breast-screening-hp",
            "src-nci-mammograms",
        ],
        "obj-pc-signs-symptoms": ["src-nci-breast-symptoms", "src-nci-seer-breast", "src-nci-mammograms"],
        "obj-pc-history-documentation": [
            "src-openstax-clinical-nursing-breast",
            "src-nci-breast-symptoms",
            "src-uspstf-breast-2024",
            "src-ecfr-21-cfr-900",
        ],
        "obj-pc-prior-images": ["src-ecfr-21-cfr-900"],
        "obj-pc-surgical-options": [
            "src-nci-dictionary",
            "src-nci-breast-surgery",
            "src-nci-pdq-breast-treatment-hp",
            "src-nci-seer-breast",
        ],
        "obj-pc-nonsurgical-options": [
            "src-nci-dictionary",
            "src-nci-breast-nonsurgical",
            "src-nci-pdq-breast-treatment-hp",
            "src-nci-breast-surgery",
            "src-nci-seer-breast",
        ],
    }
    for o in cur["objectives"]:
        if o["id"] in src_updates:
            o["sourceIds"] = src_updates[o["id"]]
            # Keep needs_source until Aaron source-checks; coverage uses followUps.
            if o["id"] != "obj-pc-prior-images":
                o["sourceState"] = "needs_source"
    dump(cur_path, cur)

    print("Done. Lessons", len(new_lessons), "cards", len(new_cards), "questions", len(new_qs), "evidence", len(new_ev))


if __name__ == "__main__":
    main()
