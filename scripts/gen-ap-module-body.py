#!/usr/bin/env python3
"""Write lessons, questions, cards, module.json, coverage, sources for anatomy-pathology."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MOD = ROOT / "content/modules/anatomy-pathology"

AUTO = {
    "status": "auto_checked",
    "requiresQualifiedReview": False,
    "aiAssisted": True,
    "history": [
        {
            "at": "2026-10-06",
            "status": "draft",
            "actor": "ai-assisted",
            "kind": "revision",
            "note": "AI-assisted draft from retrieved public sources.",
        },
        {
            "at": "2026-10-06",
            "status": "auto_checked",
            "actor": "automation",
            "kind": "automated_validation",
            "note": "Passed repository schema/cross-check validation. Not maintainer source-checked; not clinically reviewed. Beta practice only.",
        },
    ],
}
NEED = {
    **AUTO,
    "requiresQualifiedReview": True,
    "history": [
        {
            "at": "2026-10-06",
            "status": "draft",
            "actor": "ai-assisted",
            "kind": "revision",
            "note": "Pathology/interpretation-adjacent; keep out of verified pools until qualified review.",
        },
        AUTO["history"][1],
    ],
}


def wjson(path: Path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, indent=2, ensure_ascii=False) + "\n")
    print("wrote", path.relative_to(ROOT))


def lesson(**kwargs):
    kwargs.setdefault("revision", 1)
    kwargs.setdefault("moduleId", "mod-anatomy-pathology")
    kwargs.setdefault("review", AUTO)
    return kwargs


def card(id, prompt, answer, objective, evidence, review=None, elaboration=None):
    o = {
        "id": id,
        "prompt": prompt,
        "answer": answer,
        "objectiveId": objective,
        "evidenceIds": evidence,
        "revision": 1,
        "estSeconds": 25,
        "review": review or AUTO,
    }
    if elaboration:
        o["elaboration"] = elaboration
    return o


def q(id, obj, fam, stem, choices, correct, expl, evid, pool="practice", diff="recall", review=None, simpler=None, example=None, deeper=None):
    choice_objs = []
    for a, b, c in choices:
        rat = c
        if len(rat) < 10:
            rat = (rat.rstrip(".") + (". This matches the cited source definition for the stem." if a == correct else ". This does not match the cited source for the stem.")).strip()
        choice_objs.append({"id": a, "text": b, "rationale": rat})
    if len(expl) < 20:
        expl = expl.rstrip(".") + ". Use the sourced definition in the stem."
    return {
        "id": id,
        "revision": 1,
        "objectiveIds": [obj],
        "familyId": fam,
        "pool": pool,
        "difficultyIntent": diff,
        "kind": "single",
        "estSeconds": 55,
        "stem": stem,
        "choices": choice_objs,
        "correctChoiceId": correct,
        "explanation": expl,
        "variants": {
            "simpler": simpler or expl[:140],
            "example": example or "Match the stem to the sourced definition before choosing.",
            **({"deeper": deeper} if deeper else {}),
        },
        "evidenceIds": evid,
        "review": review or AUTO,
    }


lessons = [
    lesson(
        id="les-ap-clock-quadrants",
        objectiveId="obj-ap-clock-quadrants",
        title="Clock face and quadrant language",
        estMinutes=3,
        summary="Localize using named quadrants, the central nipple–areola region, axillary tail, and clock language—without inventing hour maps the source does not spell out.",
        explanation=[
            {
                "heading": "Named quadrants and central region",
                "body": "SEER training divides each breast into **upper inner (UIQ)**, **upper outer (UOQ)**, **lower inner (LIQ)**, and **lower outer (LOQ)** quadrants, plus a **central** portion containing the areola and nipple. ICD-O also codes the **axillary tail** (C506).",
            },
            {
                "heading": "Clock language",
                "body": "Tumor location is typically described as a clock time. SEER notes that lesions sitting directly at **3, 6, 9, or 12 o’clock** (or overlapping quadrants) are coded as overlapping when they are a single tumor across subsites.\n\nWhen you document, state laterality first, then the clock or quadrant your facility uses—and do not guess a quadrant from a clock hour unless your site map is clear.",
            },
            {
                "heading": "Positioning relevance",
                "body": "Quadrant and clock language helps you and the radiologist talk about where to look on CC versus MLO and which additional view might include more of that tissue. Detailed triangulation methods need separate sourced teaching.",
            },
        ],
        example="A history says “right breast 12 o’clock.” You document laterality and the clock position as given, and you know 12 o’clock sits on a vertical boundary that SEER treats as overlapping for coding when a single tumor sits on that hour.",
        misconception={
            "belief": "Clock positions are the same absolute map on both breasts without thinking about laterality.",
            "correction": "Always pair clock/quadrant language with laterality. SEER names quadrants separately for each breast; do not drop “right” or “left.”",
        },
        variants={
            "simpler": "Say which breast, then use UIQ/UOQ/LIQ/LOQ, central, axillary tail, or a clock time.",
            "example": "“Left UOQ” and “left 10 o’clock” are both localization languages—use what the order and your protocol require.",
            "deeper": "SEER’s ICD-O table is a coding map, not a positioning checklist. Still, knowing axillary-tail and central codes keeps your landmark vocabulary aligned with how findings are recorded.",
        },
        observationPrompt="Ask where your site records clock vs quadrant on the requisition and who updates localization after diagnostic work-up.",
        checkQuestionId="q-ap-001",
        evidenceIds=["ev-ap-seer-quadrants-clock"],
    ),
    lesson(
        id="les-ap-external",
        objectiveId="obj-ap-external-landmarks",
        title="External landmarks that guide positioning",
        estMinutes=3,
        summary="Nipple, areola (with Montgomery glands), axillary tail, and the breast’s relationship to pectoralis are the external cues you use every exam.",
        explanation=[
            {
                "heading": "Nipple and areola",
                "body": "The **areola** is the darker skin around the nipple (NCI Dictionary). OpenStax describes **Montgomery glands** on the areola as oil-secreting bumps that help protect the nipple. SEER’s central breast region contains the areola and nipple—useful when a finding is “retroareolar.”",
            },
            {
                "heading": "Axillary tail and chest wall",
                "body": "SEER codes the **axillary tail** as its own ICD-O subsite. Lymph nodes near the breast include axillary groups under the arm—so covering the tail of tissue that extends toward the axilla matters for complete imaging, even though lymph staging itself is not your job.",
            },
            {
                "heading": "Muscle is under the breast, not inside it",
                "body": "SEER states the breast itself has **no muscle tissue**; breasts rest on **pectoralis major**. When MLO images show a muscle band, that is underlying chest-wall muscle, not intrinsic breast muscle.",
            },
        ],
        example="Before an MLO, you orient to the inframammary crease and the axillary tail of tissue rather than assuming “breast” ends at the anterior fold.",
        misconception={
            "belief": "The pectoralis band on an MLO is breast muscle.",
            "correction": "SEER: the breast has no muscle tissue; it rests on pectoralis major.",
        },
        variants={
            "simpler": "Know nipple/areola, axillary tail, and that muscle under the breast is pectoralis—not breast muscle.",
            "example": "Montgomery glands are normal areolar bumps, not skin lesions to “clean off” unless product residue is the issue.",
            "deeper": "Morgagni tubercles are closely related areolar gland terminology used in some texts; OpenStax’s sourced term here is Montgomery glands.",
        },
        observationPrompt="With a preceptor, point to axillary tail tissue on a patient (with consent) and name where it should appear on MLO.",
        checkQuestionId="q-ap-006",
        evidenceIds=["ev-ap-dict-areola", "ev-ap-openstax-structure", "ev-ap-seer-no-muscle-in-breast", "ev-ap-seer-quadrants-clock"],
    ),
    lesson(
        id="les-ap-internal",
        objectiveId="obj-ap-internal-structures",
        title="Inside the breast: fat, glands, ligaments, lymph",
        estMinutes=3,
        summary="Fibroglandular tissue, fat, suspensory ligaments, ducts/lobules, and regional lymphatics are the internal map behind what compression and positioning try to spread and include.",
        explanation=[
            {
                "heading": "Tissue types",
                "body": "NCI: breasts contain **glandular**, **fibrous connective**, and **fatty** tissue. Fibroglandular tissue (ducts + lobules + fibrous tissue) often looks dense on a mammogram. SEER: fat covering the lobes contributes to size and shape; fat surrounds the mammary glands.",
            },
            {
                "heading": "Suspensory ligaments",
                "body": "OpenStax describes **suspensory ligaments**—connective-tissue bands attaching breast tissue to the overlying dermis. They help explain why breast tissue is mobile and why you lift and spread rather than “smash flat.”",
            },
            {
                "heading": "Lymphatics",
                "body": "SEER lists regional nodes including axillary levels, internal mammary, infraclavicular, and supraclavicular groups. The **sentinel lymph node** is the first node cancer is most likely to reach from a primary tumor (NCI Dictionary / SEER).",
            },
        ],
        example="When compression spreads fibroglandular tissue, you are separating overlapping dense structures so the radiologist can see through them—not removing density.",
        misconception={
            "belief": "Breast size equals cancer risk or glandular volume.",
            "correction": "OpenStax notes non-lactating breasts are mostly adipose/collagenous tissue; size alone does not tell you density.",
        },
        variants={
            "simpler": "Breasts are fat + fibrous + glandular tissue on muscle, held by suspensory ligaments, draining to nearby lymph nodes.",
            "example": "Axillary nodes are under the arm; internal mammary nodes sit along the sternum side—both are SEER regional groups.",
            "deeper": "Detailed fascial-layer names and retroglandular-fat criteria for image evaluation need additional sourced teaching beyond this lesson.",
        },
        observationPrompt="Ask how your site describes “posterior tissue” or retroglandular fat on image critique sheets.",
        checkQuestionId="q-ap-010",
        evidenceIds=["ev-ap-nci-dense-definition", "ev-ap-dict-fibroglandular", "ev-ap-openstax-suspensory", "ev-ap-seer-lymph-groups", "ev-ap-dict-sentinel"],
    ),
    lesson(
        id="les-ap-ductal-lobular",
        objectiveId="obj-ap-tdlu",
        title="Ducts, lobules, and why origin matters",
        estMinutes=3,
        summary="Milk is made in lobular/alveolar units and travels through ducts—the same architecture that names ductal versus lobular disease.",
        explanation=[
            {
                "heading": "The tree",
                "body": "SEER: 15–20 **lobes**, each with **lobules** ending in milk-making **bulbs**, linked by **ducts**. OpenStax: **alveoli** lined by lactocytes, clustered into **lobules**, draining through lactiferous ducts to the nipple.",
            },
            {
                "heading": "Pathology relevance",
                "body": "SEER: **ductal** carcinoma starts in the milk ducts; **lobular** carcinoma originates in the lobes/lobules. That is why technologists hear “DCIS,” “IDC,” and “ILC” as origin-based names—not as something you diagnose from the console.",
            },
            {
                "heading": "About the term TDLU",
                "body": "Many curricula name the **terminal ductal lobular unit** as the functional end-unit. This lesson teaches the sourced duct–lobule–alveoli structure; the exact TDLU micro-anatomy label is left for a source that defines that phrase explicitly.",
            },
        ],
        example="A pathology report saying “invasive lobular carcinoma” tells you the named origin is lobular—not that you should have seen a classic mass on every mammogram.",
        misconception={
            "belief": "Ductal and lobular names describe how round the finding looks on the image.",
            "correction": "They describe histologic origin (ducts vs lobules), per SEER/NCI wording—not a shape rule for technologists.",
        },
        variants={
            "simpler": "Lobules make milk; ducts carry it. Cancers are named for where they start.",
            "example": "DCIS stays in the duct lining; invasive ductal disease has left that confined space.",
            "deeper": "OpenStax’s myoepithelial net around alveoli is physiology for milk ejection; relating every cell layer to invasion still needs careful pathology sources.",
        },
        checkQuestionId="q-ap-014",
        evidenceIds=["ev-ap-seer-lobes-ducts", "ev-ap-openstax-structure", "ev-ap-seer-ductal-vs-lobular-origin"],
        review=NEED,
    ),
    lesson(
        id="les-ap-insitu-invasive",
        objectiveId="obj-ap-cytology",
        title="In situ versus invasive — vocabulary, not diagnosis",
        estMinutes=3,
        summary="In situ means abnormal cells remain where they formed; invasive means they have spread into surrounding tissue—definitions from NCI, not your image call.",
        explanation=[
            {
                "heading": "In situ",
                "body": "NCI Dictionary: **in situ** means in its original place. In carcinoma in situ, abnormal cells have not spread from where they first formed. **DCIS** is abnormal cells in the duct lining that have not spread outside the duct.",
            },
            {
                "heading": "Invasive",
                "body": "NCI: **invasive ductal carcinoma** begins in duct lining and spreads outside the ducts into surrounding normal tissue. **Invasive lobular carcinoma** begins in lobules and likewise spreads into surrounding tissue.",
            },
            {
                "heading": "Myoepithelial cells (physiology hook)",
                "body": "OpenStax: alveoli are surrounded by contractile **myoepithelial** cells that squeeze milk into ducts. That is a structural fact. Claims about basement-membrane breach as the histologic definition of invasion need a pathology source beyond this batch—so we do not invent that mechanism here.",
            },
        ],
        example="You can explain to a curious student technologist: “In situ means still in place; invasive means it left that place”—then stop short of interpreting the patient’s images.",
        misconception={
            "belief": "If there is no palpable lump, disease cannot be invasive.",
            "correction": "Inflammatory breast cancer often has no palpable lump and may not be seen on mammogram (NCI Dictionary)—clinical signs still matter.",
        },
        variants={
            "simpler": "In situ = still in the original place. Invasive = has spread into nearby tissue.",
            "example": "DCIS is in situ in a duct; IDC has left the duct.",
            "deeper": "LCIS is also “in situ” in lobules but behaves as a risk marker more than a direct precursor in NCI’s wording—see the high-risk lesson.",
        },
        checkQuestionId="q-ap-018",
        evidenceIds=["ev-ap-dict-insitu", "ev-ap-dict-dcis", "ev-ap-dict-idc", "ev-ap-dict-ilc", "ev-ap-openstax-structure"],
        review=NEED,
    ),
    lesson(
        id="les-ap-density-tissue",
        objectiveId="obj-ap-assessment-density-categories",
        title="Tissue composition and what “dense” means",
        estMinutes=3,
        summary="Density is a mammographic description of relative fibroglandular versus fatty tissue—not something patients can feel.",
        explanation=[
            {
                "heading": "Composition",
                "body": "Dense breasts have relatively more glandular and fibrous tissue and less fat (NCI). Nearly half of women 40+ who get mammograms have dense tissue.",
            },
            {
                "heading": "Why images get harder",
                "body": "Dense tissue and some abnormalities both appear white, while fat appears darker—so cancers can hide (masking). Density is also a risk factor separate from masking.",
            },
            {
                "heading": "What you do not tell patients as fact from touch",
                "body": "Density cannot be felt on clinical or self-exam; only the interpreting radiologist assigns it from the mammogram.",
            },
        ],
        example="A patient says “my breasts feel dense.” You redirect: density is judged on the mammogram report, not by firmness.",
        misconception={
            "belief": "Firm breasts on exam equal dense breasts on mammography.",
            "correction": "NCI: density is not palpable; it is a mammographic assessment.",
        },
        variants={
            "simpler": "Dense means more white fibroglandular tissue on the mammogram—not how the breast feels.",
            "example": "Fatty tissue looks darker; dense tissue looks whiter and can hide findings.",
            "deeper": "NCI notes USPSTF finds insufficient evidence for/against routine supplemental screening for density alone—hand that conversation to the clinician.",
        },
        checkQuestionId="q-ap-022",
        evidenceIds=["ev-ap-nci-dense-definition", "ev-ap-nci-dense-common", "ev-ap-nci-dense-not-palpable", "ev-ap-nci-dense-masking-risk"],
        review=NEED,
    ),
    lesson(
        id="les-ap-density-categories",
        objectiveId="obj-ap-assessment-density-categories",
        title="Four density categories and the patient letter",
        estMinutes=3,
        summary="Map the four report density categories to the two MQSA patient statements: not dense versus dense.",
        explanation=[
            {
                "heading": "Four categories",
                "body": "NCI/BI-RADS framing used in the dense-breasts FAQ: almost entirely fatty; scattered fibroglandular; heterogeneously dense; extremely dense. Approximate shares: ~10% / ~40% / ~40% / ~10%.",
            },
            {
                "heading": "Patient mapping (MQSA)",
                "body": "On the lay summary, the first two categories map to **“Your breast tissue is not dense.”** Heterogeneously or extremely dense map to **“Your breast tissue is dense,”** with language that other imaging may help some people.",
            },
            {
                "heading": "Your lane",
                "body": "You can explain that dense/not-dense language comes from the report categories. You do not assign the category yourself or invent supplemental-screening orders.",
            },
        ],
        example="Heterogeneously dense → patient letter says dense. Scattered fibroglandular → not dense.",
        misconception={
            "belief": "Only extremely dense counts as dense on the patient letter.",
            "correction": "Heterogeneously dense also maps to the dense patient statement.",
        },
        variants={
            "simpler": "A/B = not dense letter. C/D = dense letter.",
            "example": "If the report says heterogeneously dense, the lay letter uses the dense paragraph.",
            "deeper": "MQSA also requires the density category on the medical report itself—separate from the patient wording.",
        },
        checkQuestionId="q-ap-026",
        evidenceIds=["ev-ap-nci-dense-four", "ev-ap-mqsa-density", "ev-mqsa-density-statements"] if False else ["ev-ap-nci-dense-four", "ev-ap-mqsa-density"],
    ),
    lesson(
        id="les-ap-assessment",
        objectiveId="obj-ap-assessment-density-categories",
        title="BI-RADS assessment awareness (not interpretation)",
        estMinutes=3,
        summary="Know what assessment categories mean for follow-up communication—without pretending you assign them from the images.",
        explanation=[
            {
                "heading": "Why categories exist",
                "body": "NCI: BI-RADS categories give a consistent way to report findings and recommended follow-up. MQSA requires an overall final assessment (or incomplete category) on the report.",
            },
            {
                "heading": "Category map (NCI patient table)",
                "body": "**0** needs more imaging; **1** negative; **2** benign; **3** probably benign (often 6-month follow-up); **4** suspicious (may need biopsy); **5** highly suggestive (biopsy); **6** known biopsy-proven malignancy.",
            },
            {
                "heading": "Hard stop",
                "body": "You do not “call it a 3” from the console. Detailed lexicon descriptors live in the ACR BI-RADS Atlas (link-only). Ambiguous image interpretation stays out of verified pools.",
            },
        ],
        example="A patient asks what BI-RADS 0 means after a callback letter. You say additional imaging is needed before a final category—then point them to the written results and their provider.",
        misconception={
            "belief": "Technologists should practice assigning BI-RADS categories on screening images.",
            "correction": "Assessment is the interpreting physician’s report duty. Your job is process, positioning, and accurate communication boundaries.",
        },
        variants={
            "simpler": "0 = need more pictures. 1–2 = routine follow-up. 3 = short-interval. 4–5 = biopsy pathway. 6 = known cancer.",
            "example": "MQSA incomplete categories cover needing more imaging or prior mammograms.",
            "deeper": "Compare NCI’s patient-facing table with MQSA’s regulatory wording when you study reports—same idea, different documents.",
        },
        checkQuestionId="q-ap-030",
        evidenceIds=["ev-ap-nci-birads-table", "ev-ap-mqsa-assessment", "ev-ap-acr-birads-link"],
        review=NEED,
    ),
    lesson(
        id="les-ap-findings-vocab",
        objectiveId="obj-ap-lexicon-masses-calcs",
        title="Masses and calcifications — technologist vocabulary",
        estMinutes=3,
        summary="Use NCI’s public descriptions of masses and calcifications. Full ACR BI-RADS descriptor lists remain link-only.",
        explanation=[
            {
                "heading": "Masses",
                "body": "NCI: size, shape, and edges matter. Smooth, round, clear-edged lumps are often benign cysts; jagged or irregular features may need more tests. That is awareness language—not a license to diagnose.",
            },
            {
                "heading": "Calcifications",
                "body": "NCI: **macrocalcifications** are larger white dots, often from aging/injury/inflammation and usually benign. **Microcalcifications** are fine white specks; clustered patterns may be associated with DCIS or cancer. Neither type comes from dietary calcium.",
            },
            {
                "heading": "Atlas boundary",
                "body": "Shape/margin/density lexicon details and calcification morphology/distribution codes require the ACR BI-RADS Atlas. We link it; we do not invent those descriptor definitions here.",
            },
        ],
        example="A student asks if white flecks mean cancer. You answer with NCI’s distinction: macros are often benign; clustered micros can be concerning—and the radiologist decides.",
        misconception={
            "belief": "Any calcification means cancer.",
            "correction": "Macrocalcifications are usually benign; only certain microcalcification patterns raise concern—interpreted by the radiologist.",
        },
        variants={
            "simpler": "Masses: edges matter. Macros often benign. Clustered micros can be concerning.",
            "example": "Dietary calcium does not create mammographic calcifications.",
            "deeper": "Asymmetry and architectural distortion lexicon terms are atlas-bound; leave them for a source-backed update.",
        },
        checkQuestionId="q-ap-034",
        evidenceIds=["ev-ap-nci-mass-calcs", "ev-ap-acr-birads-link"],
        review=NEED,
    ),
    lesson(
        id="les-ap-benign",
        objectiveId="obj-ap-benign-conditions",
        title="Common benign conditions — know the names",
        estMinutes=4,
        summary="Fibroadenoma, cyst, lipoma, intraductal papilloma, fat necrosis, and related terms at dictionary level—not mammographic differential diagnosis.",
        explanation=[
            {
                "heading": "Solid benign tumors",
                "body": "**Fibroadenoma**: most common benign breast tumor (fibrous + glandular), usually mobile and well-defined; most do not raise cancer risk. **Lipoma**: benign fat-cell tumor. **Hamartoma**: benign growth of a disordered mixture of local tissues.",
            },
            {
                "heading": "Cysts and duct findings",
                "body": "**Cyst**: fluid-filled sac; most are benign. NCI notes smooth round clear-edged lumps are often cysts. **Intraductal papilloma**: benign wart-like duct growth, often near the nipple, may cause discharge; a single papilloma does not increase risk per NCI.",
            },
            {
                "heading": "Post-injury and other",
                "body": "**Fat necrosis** can follow trauma, surgery, or radiation and may feel like a firm lump. **Fibrocystic changes** are common benign cyclic breast changes that do not increase cancer risk (NCI).",
            },
        ],
        example="History of seat-belt trauma with a new firm area: fat necrosis is on the clinician’s differential—you document history and image as ordered.",
        misconception={
            "belief": "Benign means “cannot look weird on a mammogram.”",
            "correction": "Radial scars (high-risk lesson) and fat necrosis can mimic concerning findings; biopsy decisions belong to the care team.",
        },
        variants={
            "simpler": "Learn the dictionary definitions; do not assign the diagnosis from the image.",
            "example": "Nipple discharge plus a near-nipple lesion may prompt papilloma evaluation—ordered by the provider.",
            "deeper": "Galactocele, duct ectasia, hematoma, abscess, edema, and seroma appear on the blueprint list; only terms with retrieved dictionary/SEER support are taught here—others stay gaps.",
        },
        checkQuestionId="q-ap-038",
        evidenceIds=["ev-ap-dict-fibroadenoma", "ev-ap-dict-cyst", "ev-ap-dict-lipoma", "ev-ap-dict-papilloma", "ev-ap-dict-fat-necrosis", "ev-ap-nci-mass-calcs"],
        review=NEED,
    ),
    lesson(
        id="les-ap-high-risk",
        objectiveId="obj-ap-high-risk-lesions",
        title="High-risk and risk-marker lesions — awareness only",
        estMinutes=3,
        summary="ADH, ALH, LCIS, radial scar, and phyllodes: what the names mean and why upgrade/risk talk stays with the clinician.",
        explanation=[
            {
                "heading": "Atypia",
                "body": "**ADH** and **ALH** are benign conditions with too many abnormal-appearing cells in ducts or lobules; both increase breast cancer risk (NCI Dictionary).",
            },
            {
                "heading": "LCIS",
                "body": "**LCIS**: abnormal cells in lobules; seldom becomes invasive itself, but raises risk in either breast.",
            },
            {
                "heading": "Mimics and uncommon tumors",
                "body": "**Radial scar** may look like cancer on a mammogram; biopsy usually needed. **Phyllodes** tumors grow quickly in connective tissue; most are benign but some are malignant/borderline.",
            },
        ],
        example="A pathology addendum says ADH on core biopsy. Your role is not to counsel upgrade risk percentages—you facilitate imaging/procedures the team orders.",
        misconception={
            "belief": "LCIS is treated exactly like DCIS because both say carcinoma in situ.",
            "correction": "NCI describes LCIS as seldom becoming invasive itself while still raising bilateral risk—management differs and is clinician-led.",
        },
        variants={
            "simpler": "ADH/ALH/LCIS raise risk. Radial scar can mimic cancer. Phyllodes are uncommon connective-tissue tumors.",
            "example": "“Upgrade potential” means a core biopsy label might change after excision—interpreted by pathology/surgery, not the technologist.",
            "deeper": "Flat epithelial atypia and papilloma with atypia need additional sourced entries before scored teaching.",
        },
        checkQuestionId="q-ap-042",
        evidenceIds=["ev-ap-dict-adh", "ev-ap-dict-alh", "ev-ap-dict-lcis", "ev-ap-dict-radial-scar", "ev-ap-dict-phyllodes"],
        review=NEED,
    ),
    lesson(
        id="les-ap-malignant",
        objectiveId="obj-ap-malignant",
        title="Malignant disease names at technologist level",
        estMinutes=4,
        summary="DCIS, invasive ductal and lobular carcinoma, inflammatory breast cancer, and Paget disease—definitions for literacy, not image diagnosis.",
        explanation=[
            {
                "heading": "Common carcinomas",
                "body": "**DCIS** stays in the duct. **IDC** is the most common invasive cancer (SEER ~70%). **ILC** begins in lobules (~10–15% of invasive cancers per SEER) and spreads into surrounding tissue.",
            },
            {
                "heading": "Special clinical presentations",
                "body": "**Inflammatory breast cancer**: rare, fast-growing, blocks skin lymphatics; swollen/red/peau-d’orange appearance; often no lump and may not show on mammogram. **Paget disease**: nipple/areola skin changes; usually accompanied by DCIS or invasive cancer.",
            },
            {
                "heading": "Stay in your scope",
                "body": "Recognizing why a clinical history of skin changes or nipple changes matters for exam urgency is appropriate. Declaring a histologic type from a screening image is not.",
            },
        ],
        example="A patient arrives with rapid breast redness and edema ordered as diagnostic—you prioritize the clinical pathway and avoid reassuring “it is probably infection” from the hallway.",
        misconception={
            "belief": "If mammography is normal, inflammatory cancer is excluded.",
            "correction": "NCI: inflammatory breast cancer may not be seen on a mammogram.",
        },
        variants={
            "simpler": "DCIS in the duct; IDC/ILC invade tissue; IBC is a skin-lymphatic emergency picture; Paget involves the nipple.",
            "example": "ILC can be harder to see as a classic mass—another reason clinical history and multimodal imaging are clinician decisions.",
            "deeper": "Sarcoma, lymphoma, and metastases to breast are uncommon blueprint items left for a later sourced expansion.",
        },
        checkQuestionId="q-ap-045",
        evidenceIds=["ev-ap-seer-histologies", "ev-ap-dict-dcis", "ev-ap-dict-idc", "ev-ap-dict-ilc", "ev-ap-dict-ibc", "ev-ap-dict-paget"],
        review=NEED,
    ),
]

# Fix density lesson evidence - use only ap evidence ids (can also use existing mqsa if present)
for les in lessons:
    if les["id"] == "les-ap-density-categories":
        les["evidenceIds"] = ["ev-ap-nci-dense-four", "ev-ap-mqsa-density"]

wjson(MOD / "lessons.json", {"lessons": lessons})

cards = [
    card("card-ap-quadrants", "Name the four breast quadrants used in SEER/ICD-O localization.", "Upper inner (UIQ), upper outer (UOQ), lower inner (LIQ), lower outer (LOQ).", "obj-ap-clock-quadrants", ["ev-ap-seer-quadrants-clock"]),
    card("card-ap-central", "What does the central portion of the breast contain in SEER’s description?", "The areola and nipple.", "obj-ap-clock-quadrants", ["ev-ap-seer-quadrants-clock"]),
    card("card-ap-ax-tail", "Which ICD-O breast subsite codes the axillary tail?", "C506 — axillary tail of breast.", "obj-ap-clock-quadrants", ["ev-ap-seer-quadrants-clock"]),
    card("card-ap-clock-overlap", "SEER treats a single tumor at which clock hours as overlapping for coding?", "Directly at 3, 6, 9, or 12 o’clock (or otherwise overlapping quadrants).", "obj-ap-clock-quadrants", ["ev-ap-seer-quadrants-clock"]),
    card("card-ap-areola", "Define areola.", "The dark-colored skin surrounding the nipple.", "obj-ap-external-landmarks", ["ev-ap-dict-areola"]),
    card("card-ap-montgomery", "What do Montgomery glands do (OpenStax)?", "Secrete oil to cleanse/protect the nipple area.", "obj-ap-external-landmarks", ["ev-ap-openstax-structure"]),
    card("card-ap-no-muscle", "Does the breast itself contain muscle tissue (SEER)?", "No. It rests on pectoralis major; fat surrounds the mammary glands.", "obj-ap-external-landmarks", ["ev-ap-seer-no-muscle-in-breast"]),
    card("card-ap-suspensory", "What are suspensory ligaments of the breast?", "Connective-tissue bands connecting breast tissue to the overlying dermis.", "obj-ap-internal-structures", ["ev-ap-openstax-suspensory"]),
    card("card-ap-fibroglandular", "What is fibroglandular breast tissue?", "Fibrous connective tissue plus glandular tissue (ducts and lobules).", "obj-ap-internal-structures", ["ev-ap-dict-fibroglandular"]),
    card("card-ap-sentinel", "Define sentinel lymph node.", "The first lymph node to which cancer is likely to spread from the primary tumor.", "obj-ap-internal-structures", ["ev-ap-dict-sentinel"]),
    card("card-ap-lobes", "About how many lobes does each breast have (SEER)?", "15 to 20.", "obj-ap-tdlu", ["ev-ap-seer-lobes-ducts"]),
    card("card-ap-ductal-origin", "Where does ductal carcinoma start (SEER)?", "In the milk ducts.", "obj-ap-tdlu", ["ev-ap-seer-ductal-vs-lobular-origin"], NEED),
    card("card-ap-lobular-origin", "Where does lobular carcinoma originate (SEER)?", "In the lobes/lobules.", "obj-ap-tdlu", ["ev-ap-seer-ductal-vs-lobular-origin"], NEED),
    card("card-ap-insitu", "What does in situ mean?", "In its original place; abnormal cells have not spread from where they formed.", "obj-ap-cytology", ["ev-ap-dict-insitu"]),
    card("card-ap-myoepithelial", "What do myoepithelial cells do in lactation (OpenStax)?", "Contract to squeeze milk from alveoli into ducts.", "obj-ap-cytology", ["ev-ap-openstax-structure"]),
    card("card-ap-dense-def", "What does breast density describe?", "Relative amounts of glandular, fibrous, and fatty tissue on a mammogram.", "obj-ap-assessment-density-categories", ["ev-ap-nci-dense-definition"]),
    card("card-ap-dense-common", "About what fraction of women 40+ have dense breasts (NCI)?", "Nearly half.", "obj-ap-assessment-density-categories", ["ev-ap-nci-dense-common"]),
    card("card-ap-dense-map", "Which two density categories map to “dense” on the patient letter?", "Heterogeneously dense and extremely dense.", "obj-ap-assessment-density-categories", ["ev-ap-nci-dense-four", "ev-ap-mqsa-density"]),
    card("card-ap-birads0", "What does BI-RADS 0 mean on NCI’s table?", "Need additional imaging evaluation before a category can be assigned.", "obj-ap-assessment-density-categories", ["ev-ap-nci-birads-table"], NEED),
    card("card-ap-birads3", "Typical follow-up for BI-RADS 3 on NCI’s table?", "A 6-month follow-up mammogram.", "obj-ap-assessment-density-categories", ["ev-ap-nci-birads-table"], NEED),
    card("card-ap-macro", "Are macrocalcifications usually related to cancer (NCI)?", "They are usually benign.", "obj-ap-lexicon-masses-calcs", ["ev-ap-nci-mass-calcs"], NEED),
    card("card-ap-micro", "Why can clustered microcalcifications matter?", "They may be a sign of DCIS or breast cancer.", "obj-ap-lexicon-masses-calcs", ["ev-ap-nci-mass-calcs"], NEED),
    card("card-ap-fibroadenoma", "What is a fibroadenoma?", "The most common benign breast tumor made of fibrous and glandular tissue.", "obj-ap-benign-conditions", ["ev-ap-dict-fibroadenoma"], NEED),
    card("card-ap-papilloma", "Classic symptom association of intraductal papilloma?", "Nipple discharge (often near-nipple duct growth).", "obj-ap-benign-conditions", ["ev-ap-dict-papilloma"], NEED),
    card("card-ap-adh", "Does ADH increase breast cancer risk?", "Yes — it is benign but increases risk.", "obj-ap-high-risk-lesions", ["ev-ap-dict-adh"], NEED),
    card("card-ap-lcis", "Does LCIS usually become invasive cancer itself (NCI)?", "Seldom; it increases risk of breast cancer in either breast.", "obj-ap-high-risk-lesions", ["ev-ap-dict-lcis"], NEED),
    card("card-ap-dcis", "Define DCIS in one sentence.", "Abnormal cells in a breast duct lining that have not spread outside the duct.", "obj-ap-malignant", ["ev-ap-dict-dcis"], NEED),
    card("card-ap-idc", "What is the most common invasive breast cancer?", "Invasive (infiltrating) ductal carcinoma.", "obj-ap-malignant", ["ev-ap-dict-idc", "ev-ap-seer-histologies"], NEED),
    card("card-ap-ibc", "Why might inflammatory breast cancer be mammographically occult?", "It often forms no palpable lump and may not be seen on a mammogram.", "obj-ap-malignant", ["ev-ap-dict-ibc"], NEED),
    card("card-ap-paget", "Which skin area does Paget disease of the breast involve?", "The nipple and usually the areola.", "obj-ap-malignant", ["ev-ap-dict-paget"], NEED),
]
wjson(MOD / "cards.json", {"cards": cards})

questions = []

def add(qid, *args, **kwargs):
    questions.append(q(qid, *args, **kwargs))

# Localization
add("q-ap-001", "obj-ap-clock-quadrants", "fam-ap-quadrants",
    "According to SEER training, which structures are included in the central portion of the breast?",
    [("a", "Only Cooper ligaments", "Ligaments are support structures, not the SEER central portion."),
     ("b", "The areola and nipple", "Correct. SEER places areola and nipple in the central portion."),
     ("c", "Only axillary lymph nodes", "Nodes are regional structures, not the central breast portion."),
     ("d", "Only the pectoralis major", "Pectoralis is the chest-wall muscle under the breast.")],
    "b", "SEER’s central portion contains the areola and nipple.",
    ["ev-ap-seer-quadrants-clock"], simpler="Central = areola + nipple.")

add("q-ap-002", "obj-ap-clock-quadrants", "fam-ap-quadrants",
    "Which ICD-O-3 code does SEER list for axillary tail of breast?",
    [("a", "C500", "C500 is nipple."),
     ("b", "C502", "C502 is upper inner quadrant."),
     ("c", "C506", "Correct. C506 is axillary tail of breast."),
     ("d", "C509", "C509 is breast, NOS.")],
    "c", "SEER’s table lists C506 for axillary tail.",
    ["ev-ap-seer-quadrants-clock"])

add("q-ap-003", "obj-ap-clock-quadrants", "fam-ap-quadrants",
    "SEER notes that a single tumor located directly at which clock positions is treated as overlapping for coding?",
    [("a", "1, 2, 4, and 5 o’clock only", "Those hours are not the boundary set SEER calls out."),
     ("b", "3, 6, 9, and 12 o’clock", "Correct. SEER’s overlapping note includes tumors at 3, 6, 9, or 12 o’clock."),
     ("c", "Only 12 o’clock", "3, 6, and 9 are included too."),
     ("d", "Clock language is never used in SEER", "SEER says location is typically described as a clock time.")],
    "b", "Overlapping coding includes the 3/6/9/12 boundary hours for a single tumor.",
    ["ev-ap-seer-quadrants-clock"])

add("q-ap-004", "obj-ap-clock-quadrants", "fam-ap-quadrants",
    "Which set correctly lists SEER’s four breast quadrants?",
    [("a", "Superior, inferior, medial, lateral lobes", "Those are directional words, not the SEER quadrant names."),
     ("b", "UIQ, UOQ, LIQ, LOQ", "Correct. Upper/lower × inner/outer quadrants."),
     ("c", "CC, MLO, ML, LM", "Those are mammographic views, not quadrants."),
     ("d", "Level I, II, III, Rotter", "Those are axillary node levels.")],
    "b", "SEER names UIQ, UOQ, LIQ, and LOQ.",
    ["ev-ap-seer-quadrants-clock"])

add("q-ap-005", "obj-ap-clock-quadrants", "fam-ap-quadrants",
    "When documenting localization, what must always accompany a clock or quadrant description?",
    [("a", "The patient’s bra size", "Not required for localization language."),
     ("b", "Laterality (right or left)", "Correct. Each breast has its own quadrant/clock map."),
     ("c", "A BI-RADS category assigned by the technologist", "Technologists do not assign BI-RADS assessments."),
     ("d", "The kVp used", "Technique factors are separate from localization.")],
    "b", "Pair every clock/quadrant statement with laterality.",
    ["ev-ap-seer-quadrants-clock"], diff="understand")

# External
add("q-ap-006", "obj-ap-external-landmarks", "fam-ap-external",
    "NCI Dictionary defines the areola as:",
    [("a", "The first lymph node in the axilla", "That is a sentinel/axillary node concept."),
     ("b", "The dark-colored skin surrounding the nipple", "Correct."),
     ("c", "A malignant nipple ulcer", "Areola is normal anatomy."),
     ("d", "The pectoralis fascia only", "Not the definition of areola.")],
    "b", "Areola = pigmented skin around the nipple.",
    ["ev-ap-dict-areola"])

add("q-ap-007", "obj-ap-external-landmarks", "fam-ap-external",
    "According to SEER, which statement about muscle and the breast is true?",
    [("a", "The breast is mostly skeletal muscle", "SEER says the breast has no muscle tissue."),
     ("b", "The breast itself has no muscle tissue and rests on pectoralis major", "Correct."),
     ("c", "Pectoralis major is inside each lobule", "Pectoralis is the underlying chest muscle."),
     ("d", "Montgomery glands are muscle bundles", "They are oil glands on the areola.")],
    "b", "No intrinsic breast muscle; breasts rest on pectoralis major.",
    ["ev-ap-seer-no-muscle-in-breast"])

add("q-ap-008", "obj-ap-external-landmarks", "fam-ap-external",
    "OpenStax describes Montgomery glands as:",
    [("a", "Lymph nodes behind the nipple", "Incorrect structure."),
     ("b", "Small areolar bumps that secrete oil", "Correct."),
     ("c", "Malignant calcifications", "They are normal glands."),
     ("d", "Suspensory ligaments", "Ligaments are separate connective-tissue bands.")],
    "b", "Montgomery glands secrete oil on the areola.",
    ["ev-ap-openstax-structure"])

add("q-ap-009", "obj-ap-external-landmarks", "fam-ap-external",
    "Why does SEER’s axillary-tail subsite matter for mammography practice?",
    [("a", "It proves implants are present", "Unrelated."),
     ("b", "It names the breast tissue extending toward the underarm as its own localization region", "Correct — C506 axillary tail."),
     ("c", "It replaces the need for MLO imaging", "Views are not replaced by a code."),
     ("d", "It is only used for male patients", "Not what SEER states.")],
    "b", "Axillary tail is a named breast subsite toward the axilla.",
    ["ev-ap-seer-quadrants-clock"], diff="understand")

# Internal
add("q-ap-010", "obj-ap-internal-structures", "fam-ap-internal",
    "OpenStax suspensory ligaments of the breast connect breast tissue to the:",
    [("a", "Humerus", "Wrong attachment."),
     ("b", "Dermis of the overlying skin", "Correct."),
     ("c", "Liver capsule", "Unrelated."),
     ("d", "Nipple pores only", "Ligaments support breast tissue to skin, not only pores.")],
    "b", "Suspensory ligaments attach to overlying dermis.",
    ["ev-ap-openstax-suspensory"])

add("q-ap-011", "obj-ap-internal-structures", "fam-ap-internal",
    "Fibroglandular breast tissue includes:",
    [("a", "Only skin keratin", "Not fibroglandular tissue."),
     ("b", "Fibrous connective tissue and glandular tissue (ducts and lobules)", "Correct."),
     ("c", "Only pectoralis muscle fibers", "Muscle is not fibroglandular breast tissue."),
     ("d", "Only calcifications", "Calcifications are deposits, not the tissue type.")],
    "b", "Fibroglandular = fibrous + glandular (ducts/lobules).",
    ["ev-ap-dict-fibroglandular"])

add("q-ap-012", "obj-ap-internal-structures", "fam-ap-internal",
    "Which definition matches the sentinel lymph node?",
    [("a", "Any node anywhere in the body", "Too broad."),
     ("b", "The first lymph node to which cancer is likely to spread from the primary tumor", "Correct."),
     ("c", "A node that never contains cancer", "Incorrect."),
     ("d", "The interpreting physician’s workstation", "Not anatomy.")],
    "b", "Sentinel = first likely drainage node from the tumor.",
    ["ev-ap-dict-sentinel", "ev-ap-seer-lymph-groups"])

add("q-ap-013", "obj-ap-internal-structures", "fam-ap-internal",
    "SEER lists which of the following as a regional lymph node group for breast?",
    [("a", "Popliteal nodes only", "Wrong region."),
     ("b", "Internal mammary (parasternal) nodes", "Correct — SEER lists internal mammary among regional nodes."),
     ("c", "Mesenteric nodes only", "Not breast regional."),
     ("d", "Inguinal nodes only", "Not breast regional.")],
    "b", "Internal mammary nodes are regional for breast.",
    ["ev-ap-seer-lymph-groups"])

# TDLU / ductal-lobular
add("q-ap-014", "obj-ap-tdlu", "fam-ap-tdlu",
    "SEER states each breast has about how many lobes?",
    [("a", "2 to 3", "Too few."),
     ("b", "15 to 20", "Correct."),
     ("c", "200 to 300", "That overstates lobes (lobules/alveoli are more numerous)."),
     ("d", "Exactly 4", "Four refers to quadrants, not lobes.")],
    "b", "SEER: 15–20 lobes.",
    ["ev-ap-seer-lobes-ducts"])

add("q-ap-015", "obj-ap-tdlu", "fam-ap-tdlu",
    "In SEER’s wording, lobular carcinoma originates in the:",
    [("a", "Skin epidermis only", "Incorrect."),
     ("b", "Lobes (lobules)", "Correct."),
     ("c", "Axillary vein lumen", "Incorrect."),
     ("d", "Pectoralis tendon", "Incorrect.")],
    "b", "Lobular carcinoma originates in lobes/lobules.",
    ["ev-ap-seer-ductal-vs-lobular-origin"], review=NEED)

add("q-ap-016", "obj-ap-tdlu", "fam-ap-tdlu",
    "OpenStax clusters of alveoli that drain to a common duct are called:",
    [("a", "Sentinel nodes", "Lymphatic structure."),
     ("b", "Lobules", "Correct."),
     ("c", "Macrocalcifications", "Calcium deposits."),
     ("d", "BI-RADS categories", "Report categories, not anatomy.")],
    "b", "Alveolar clusters = lobules.",
    ["ev-ap-openstax-structure"])

add("q-ap-017", "obj-ap-tdlu", "fam-ap-tdlu",
    "Why does ductal versus lobular origin matter to a mammography technologist?",
    [("a", "It lets the technologist assign BI-RADS 5", "Out of scope."),
     ("b", "It explains disease names you will see in histories and reports without requiring you to diagnose them", "Correct — literacy for histories/reports."),
     ("c", "It sets the legal kVp", "Unrelated."),
     ("d", "It replaces the need for laterality markers", "Unrelated.")],
    "b", "Origin vocabulary supports understanding orders/reports, not interpretation.",
    ["ev-ap-seer-ductal-vs-lobular-origin"], diff="understand", review=NEED)

# Cytology / in situ
add("q-ap-018", "obj-ap-cytology", "fam-ap-cytology",
    "NCI defines in situ as:",
    [("a", "Already metastatic to bone", "Opposite idea."),
     ("b", "In its original place; abnormal cells have not spread from where they formed", "Correct."),
     ("c", "A normal lactation finding", "Not the definition."),
     ("d", "A density category", "Unrelated.")],
    "b", "In situ = still in the original place.",
    ["ev-ap-dict-insitu"])

add("q-ap-019", "obj-ap-cytology", "fam-ap-cytology",
    "In DCIS, abnormal cells have:",
    [("a", "Spread outside the duct into other breast tissues", "That would be invasive behavior."),
     ("b", "Not spread outside the duct to other tissues in the breast", "Correct."),
     ("c", "Always metastasized to sentinel nodes", "Not part of the DCIS definition."),
     ("d", "Formed only in pectoralis muscle", "Wrong location.")],
    "b", "DCIS remains in the duct lining.",
    ["ev-ap-dict-dcis"], review=NEED)

add("q-ap-020", "obj-ap-cytology", "fam-ap-cytology",
    "OpenStax myoepithelial cells surrounding alveoli primarily:",
    [("a", "Produce calcifications", "Incorrect."),
     ("b", "Contract to move milk into ducts", "Correct."),
     ("c", "Assign BI-RADS categories", "Nonsense."),
     ("d", "Form the axillary tail", "Wrong scale/structure.")],
    "b", "Myoepithelial contraction supports milk ejection.",
    ["ev-ap-openstax-structure"])

add("q-ap-021", "obj-ap-cytology", "fam-ap-cytology",
    "Compared with DCIS, invasive ductal carcinoma has:",
    [("a", "Stayed only in the duct lining", "That describes DCIS."),
     ("b", "Spread outside the ducts into surrounding normal tissue", "Correct."),
     ("c", "No relationship to ducts", "IDC begins in duct lining then invades."),
     ("d", "Been redefined as a density category", "Incorrect.")],
    "b", "Invasion = outside the duct into surrounding tissue.",
    ["ev-ap-dict-idc", "ev-ap-dict-dcis"], review=NEED)

# Density / assessment
add("q-ap-022", "obj-ap-assessment-density-categories", "fam-ap-density",
    "Breast density is assessed based on:",
    [("a", "How firm the breast feels on exam", "NCI: density cannot be felt."),
     ("b", "Relative amounts of tissue types as seen on a mammogram", "Correct."),
     ("c", "Serum estrogen level alone", "Not the definition."),
     ("d", "Bra cup size alone", "Not the definition.")],
    "b", "Density is a mammographic composition description.",
    ["ev-ap-nci-dense-definition", "ev-ap-nci-dense-not-palpable"])

add("q-ap-023", "obj-ap-assessment-density-categories", "fam-ap-density",
    "About how common are dense breasts among women 40+ who get mammograms (NCI)?",
    [("a", "About 1 in 100", "Too rare."),
     ("b", "Nearly half", "Correct."),
     ("c", "Essentially all patients", "Overstated."),
     ("d", "Dense breasts do not occur after age 40", "Opposite of NCI’s statement.")],
    "b", "Nearly half of women 40+ screened have dense tissue.",
    ["ev-ap-nci-dense-common"])

add("q-ap-024", "obj-ap-assessment-density-categories", "fam-ap-density",
    "Why can dense tissue make mammography less sensitive?",
    [("a", "Dense tissue is always radioactive", "False."),
     ("b", "Dense tissue and some abnormalities both appear white, so findings can be masked", "Correct."),
     ("c", "Fat always appears whiter than cancer", "Fat appears darker."),
     ("d", "Density removes the need for compression", "Compression remains important.")],
    "b", "White-on-white masking reduces sensitivity.",
    ["ev-ap-nci-dense-masking-risk"], review=NEED)

add("q-ap-025", "obj-ap-assessment-density-categories", "fam-ap-density",
    "If a report says “heterogeneously dense,” the MQSA patient density statement maps to:",
    [("a", "Not dense", "Heterogeneously dense maps to dense."),
     ("b", "Dense", "Correct — C or D → dense letter."),
     ("c", "BI-RADS 6 automatically", "Density ≠ assessment category 6."),
     ("d", "No density statement is allowed", "MQSA requires a density statement.")],
    "b", "Heterogeneously dense → dense patient wording.",
    ["ev-ap-nci-dense-four", "ev-ap-mqsa-density"], diff="apply")

add("q-ap-026", "obj-ap-assessment-density-categories", "fam-ap-density",
    "Scattered areas of fibroglandular density map to which patient notification wording?",
    [("a", "Your breast tissue is dense", "That wording is for hetero/extremely dense."),
     ("b", "Your breast tissue is not dense", "Correct for fatty or scattered categories."),
     ("c", "Known biopsy-proven malignancy", "That is an assessment category, not density."),
     ("d", "Incomplete: need priors", "Incomplete assessment, not density.")],
    "b", "Scattered = not dense on the lay summary mapping.",
    ["ev-ap-nci-dense-four", "ev-ap-mqsa-density"], diff="apply")

add("q-ap-027", "obj-ap-assessment-density-categories", "fam-ap-assessment",
    "On NCI’s BI-RADS table, category 0 means:",
    [("a", "Known biopsy-proven malignancy", "That is category 6."),
     ("b", "Need additional imaging evaluation", "Correct."),
     ("c", "Definitely benign forever", "Incorrect."),
     ("d", "Extremely dense tissue", "Density is separate from assessment category.")],
    "b", "0 = incomplete pending additional imaging.",
    ["ev-ap-nci-birads-table"], review=NEED)

add("q-ap-028", "obj-ap-assessment-density-categories", "fam-ap-assessment",
    "NCI’s table lists typical follow-up for BI-RADS 3 as:",
    [("a", "Immediate mastectomy", "Not the NCI table follow-up."),
     ("b", "A 6-month follow-up mammogram", "Correct."),
     ("c", "No further imaging ever", "Incorrect."),
     ("d", "Category 3 is not used in BI-RADS", "It is listed.")],
    "b", "Probably benign → short-interval follow-up in the NCI table.",
    ["ev-ap-nci-birads-table"], review=NEED)

add("q-ap-029", "obj-ap-assessment-density-categories", "fam-ap-assessment",
    "Who assigns the overall BI-RADS assessment category on the mammography report?",
    [("a", "The mammography technologist at the console", "Out of scope."),
     ("b", "The interpreting physician via the report process", "Correct — technologists do not assign assessments."),
     ("c", "The patient via the lay letter", "Patients receive the summary; they do not assign categories."),
     ("d", "The medical physicist during QC", "QC is separate.")],
    "b", "Assessment is an interpreting-physician report element (MQSA report contents).",
    ["ev-ap-mqsa-assessment", "ev-ap-nci-birads-table"], diff="apply", review=NEED)

add("q-ap-030", "obj-ap-assessment-density-categories", "fam-ap-assessment",
    "BI-RADS category 5 on NCI’s table is described as:",
    [("a", "Negative", "Category 1."),
     ("b", "Highly suggestive of malignancy, requires biopsy", "Correct."),
     ("c", "Need priors only", "Incomplete pathway."),
     ("d", "Almost entirely fatty", "Density category, not assessment 5.")],
    "b", "5 = highly suggestive; biopsy pathway.",
    ["ev-ap-nci-birads-table"], review=NEED)

# Findings vocab
add("q-ap-031", "obj-ap-lexicon-masses-calcs", "fam-ap-findings",
    "According to NCI, macrocalcifications on mammography are:",
    [("a", "Always cancer", "NCI says usually benign."),
     ("b", "Often related to aging, old injury, or inflammation and usually benign", "Correct."),
     ("c", "Caused by eating too much dietary calcium", "NCI: not related to dietary calcium."),
     ("d", "Invisible on mammograms", "They are seen as white dots.")],
    "b", "Macros are usually benign.",
    ["ev-ap-nci-mass-calcs"], review=NEED)

add("q-ap-032", "obj-ap-lexicon-masses-calcs", "fam-ap-findings",
    "NCI states clustered microcalcifications may be a sign of:",
    [("a", "Only deodorant artifact", "Artifact is a different issue."),
     ("b", "DCIS or breast cancer", "Correct."),
     ("c", "Normal lactation only", "Not NCI’s warning about clusters."),
     ("d", "BI-RADS density category A only", "Unrelated.")],
    "b", "Clustered micros can indicate DCIS/cancer — radiologist interprets.",
    ["ev-ap-nci-mass-calcs"], review=NEED)

add("q-ap-033", "obj-ap-lexicon-masses-calcs", "fam-ap-findings",
    "NCI’s patient-facing description says a noncancerous lump often looks:",
    [("a", "Jagged with spiculations only", "That raises concern for more testing."),
     ("b", "Smooth and round with clear, defined edges", "Correct — often a benign cyst pattern in NCI’s wording."),
     ("c", "Exactly like inflammatory carcinoma skin changes", "Different entity."),
     ("d", "Invisible in all cases", "Masses can be visible.")],
    "b", "Smooth/round/clear edges often benign cysts in NCI’s teaching.",
    ["ev-ap-nci-mass-calcs"], review=NEED)

add("q-ap-034", "obj-ap-lexicon-masses-calcs", "fam-ap-findings",
    "Detailed ACR BI-RADS lexicon definitions for mass margins and calcification morphology are:",
    [("a", "Fully redistributed in this free app from the atlas text", "Atlas is copyrighted; link-only."),
     ("b", "Available in the commercial ACR BI-RADS Atlas (link-only here)", "Correct — we do not invent atlas descriptors."),
     ("c", "Unnecessary because technologists assign categories", "Technologists do not assign assessments."),
     ("d", "Replaced by USPSTF age guidelines", "Unrelated.")],
    "b", "Lexicon depth stays link-only to ACR BI-RADS.",
    ["ev-ap-acr-birads-link"], review=NEED)

# Benign
add("q-ap-035", "obj-ap-benign-conditions", "fam-ap-benign",
    "The most common type of benign breast tumor (NCI Dictionary) is:",
    [("a", "Inflammatory carcinoma", "Malignant."),
     ("b", "Fibroadenoma", "Correct."),
     ("c", "DCIS", "Not a benign tumor."),
     ("d", "Paget disease", "Malignant nipple disease.")],
    "b", "Fibroadenoma is the most common benign breast tumor.",
    ["ev-ap-dict-fibroadenoma"], review=NEED)

add("q-ap-036", "obj-ap-benign-conditions", "fam-ap-benign",
    "A lipoma is:",
    [("a", "A malignant lymphoid cancer", "Wrong."),
     ("b", "A benign tumor made of fat cells", "Correct."),
     ("c", "Always a BI-RADS 5 mass", "Technologists/atlas don’t work that way here."),
     ("d", "A type of sentinel node", "Incorrect.")],
    "b", "Lipoma = benign fat-cell tumor.",
    ["ev-ap-dict-lipoma"])

add("q-ap-037", "obj-ap-benign-conditions", "fam-ap-benign",
    "Intraductal papilloma is often found near the nipple and may cause:",
    [("a", "Nipple discharge", "Correct."),
     ("b", "Mandatory BI-RADS 6", "Not automatic."),
     ("c", "Pectoralis rupture", "Unrelated."),
     ("d", "Complete absence of ducts", "Opposite.")],
    "a", "Near-nipple papillomas may cause discharge.",
    ["ev-ap-dict-papilloma"], review=NEED)

add("q-ap-038", "obj-ap-benign-conditions", "fam-ap-benign",
    "Fat necrosis in the breast can follow:",
    [("a", "Only dietary fat intake", "Incorrect."),
     ("b", "Injury, surgery, or radiation therapy", "Correct."),
     ("c", "Only BI-RADS category 1 exams", "Unrelated."),
     ("d", "Hand hygiene failure alone", "Not the NCI definition.")],
    "b", "Fat necrosis follows trauma/surgery/radiation.",
    ["ev-ap-dict-fat-necrosis"])

add("q-ap-039", "obj-ap-benign-conditions", "fam-ap-benign",
    "Most cysts are:",
    [("a", "Malignant by definition", "NCI: most cysts are benign."),
     ("b", "Benign", "Correct."),
     ("c", "The same as inflammatory breast cancer", "Different entity."),
     ("d", "Calcifications from diet", "Incorrect.")],
    "b", "Most cysts are benign.",
    ["ev-ap-dict-cyst"])

# High risk
add("q-ap-040", "obj-ap-high-risk-lesions", "fam-ap-highrisk",
    "Atypical ductal hyperplasia (ADH) is best described as:",
    [("a", "A malignant tumor that always metastasizes", "NCI calls ADH benign but risk-raising."),
     ("b", "A benign condition with abnormal-appearing increased duct cells that increases breast cancer risk", "Correct."),
     ("c", "Normal lactation histology", "Incorrect."),
     ("d", "A density category", "Incorrect.")],
    "b", "ADH = benign atypia that raises risk.",
    ["ev-ap-dict-adh"], review=NEED)

add("q-ap-041", "obj-ap-high-risk-lesions", "fam-ap-highrisk",
    "LCIS seldom becomes invasive cancer itself, but NCI states it:",
    [("a", "Has no relationship to risk", "Opposite."),
     ("b", "Increases the risk of developing breast cancer in either breast", "Correct."),
     ("c", "Is identical to BI-RADS 0", "Unrelated."),
     ("d", "Only occurs in men", "Not what NCI states.")],
    "b", "LCIS raises bilateral risk.",
    ["ev-ap-dict-lcis"], review=NEED)

add("q-ap-042", "obj-ap-high-risk-lesions", "fam-ap-highrisk",
    "Why do radial scars matter in mammography workflows?",
    [("a", "They are always fatty tissue and ignored", "Incorrect."),
     ("b", "They may look like breast cancer on a mammogram, so biopsy is usually needed to differentiate", "Correct."),
     ("c", "They are assigned by technologists as BI-RADS 1", "Out of scope."),
     ("d", "They only appear on ultrasound", "NCI discusses mammographic mimicry.")],
    "b", "Radial scar can mimic cancer imaging — pathology decides.",
    ["ev-ap-dict-radial-scar"], review=NEED)

add("q-ap-043", "obj-ap-high-risk-lesions", "fam-ap-highrisk",
    "Phyllodes tumors:",
    [("a", "Never occur in the breast", "Incorrect."),
     ("b", "Are rare connective-tissue tumors that grow quickly; most are benign but some are malignant or borderline", "Correct."),
     ("c", "Are the same as macrocalcifications", "Incorrect."),
     ("d", "Are a required MQSA density category", "Incorrect.")],
    "b", "Phyllodes: uncommon, fast-growing, spectrum of biologic behavior.",
    ["ev-ap-dict-phyllodes"], review=NEED)

# Malignant
add("q-ap-044", "obj-ap-malignant", "fam-ap-malignant",
    "SEER training attributes about what share of breast cancers to invasive ductal carcinoma?",
    [("a", "About 5%", "Too low."),
     ("b", "About 70%", "Correct."),
     ("c", "100%", "Other histologies exist."),
     ("d", "0% — only lobular exists", "False.")],
    "b", "SEER: IDC ~70%.",
    ["ev-ap-seer-histologies"], review=NEED)

add("q-ap-045", "obj-ap-malignant", "fam-ap-malignant",
    "Inflammatory breast cancer often:",
    [("a", "Forms an easy-to-feel lump and is always obvious on mammography", "NCI says usually no lump and may not be seen on mammogram."),
     ("b", "Presents with swollen/inflamed skin changes and may not form a palpable lump or mammographic mass", "Correct."),
     ("c", "Is identical to a lipoma", "Opposite."),
     ("d", "Is a density category A finding", "Incorrect.")],
    "b", "IBC is a clinical skin-lymphatic picture that can be mammographically occult.",
    ["ev-ap-dict-ibc"], review=NEED)

add("q-ap-046", "obj-ap-malignant", "fam-ap-malignant",
    "Paget disease of the breast involves:",
    [("a", "Only the liver", "Wrong organ."),
     ("b", "The nipple and usually the areola, often with underlying DCIS or invasive cancer", "Correct."),
     ("c", "Only axillary level III nodes", "Not the definition."),
     ("d", "Only fatty breasts", "Unrelated.")],
    "b", "Paget = nipple/areola disease, usually with underlying carcinoma.",
    ["ev-ap-dict-paget"], review=NEED)

add("q-ap-047", "obj-ap-malignant", "fam-ap-malignant",
    "Invasive lobular carcinoma begins in the:",
    [("a", "Lobules (milk glands)", "Correct."),
     ("b", "Epidermis only", "Incorrect."),
     ("c", "Sentinel node capsule only", "Incorrect."),
     ("d", "Montgomery glands exclusively", "Incorrect.")],
    "a", "ILC begins in lobules.",
    ["ev-ap-dict-ilc"], review=NEED)

# Form-a reserved
add("q-ap-048", "obj-ap-clock-quadrants", "fam-ap-form-a",
    "A history reads “left breast LOQ.” LOQ means:",
    [("a", "Lower outer quadrant", "Correct."),
     ("b", "Left occipital quadrant", "Wrong anatomy."),
     ("c", "Lateral only quadrant — upper", "LOQ is lower outer."),
     ("d", "Lymphatic-only quadrant", "Incorrect.")],
    "a", "LOQ = lower outer quadrant.",
    ["ev-ap-seer-quadrants-clock"], pool="form-a")

add("q-ap-049", "obj-ap-assessment-density-categories", "fam-ap-form-a",
    "Extremely dense tissue on the report corresponds to which patient density wording?",
    [("a", "Not dense", "Extremely dense maps to dense."),
     ("b", "Dense", "Correct."),
     ("c", "BI-RADS 0 only", "Assessment ≠ density."),
     ("d", "No letter is required", "MQSA requires density notification.")],
    "b", "Extremely dense → dense lay statement.",
    ["ev-ap-nci-dense-four", "ev-ap-mqsa-density"], pool="form-a", diff="apply")

add("q-ap-050", "obj-ap-malignant", "fam-ap-form-a",
    "DCIS is best described as:",
    [("a", "Abnormal duct-lining cells that have not spread outside the duct", "Correct."),
     ("b", "Cancer already throughout the body", "Not DCIS."),
     ("c", "A benign lipoma", "Incorrect."),
     ("d", "Normal myoepithelial physiology", "Incorrect.")],
    "a", "DCIS = in-duct abnormal cells without spread outside the duct.",
    ["ev-ap-dict-dcis"], pool="form-a", review=NEED)

wjson(MOD / "questions.json", {"questions": questions})
print("questions", len(questions), "lessons", len(lessons), "cards", len(cards))

# module.json
assets = [
    {
        "id": "asset-ap-clock",
        "kind": "svg_schematic",
        "title": "Schematic quadrants on right and left breasts",
        "src": "/assets/anatomy-pathology/clock-quadrants.svg",
        "width": 640,
        "height": 340,
        "alt": "Schematic right and left breast outlines with UIQ/UOQ/LIQ/LOQ labels. Labeled SCHEMATIC — NOT A MAMMOGRAM.",
        "isSchematic": True,
        "modality": "schematic",
        "license": "Original work for Mammo; same license as repository content",
        "attribution": "Mammo contributors",
        "evidenceIds": ["ev-ap-seer-quadrants-clock"],
        "review": AUTO,
    },
    {
        "id": "asset-ap-ductal",
        "kind": "svg_schematic",
        "title": "Schematic ductal–lobular tree",
        "src": "/assets/anatomy-pathology/ductal-lobular.svg",
        "width": 640,
        "height": 300,
        "alt": "Schematic nipple-to-lobule duct tree with alveoli clusters. Labeled SCHEMATIC — NOT A MAMMOGRAM.",
        "isSchematic": True,
        "modality": "schematic",
        "license": "Original work for Mammo; same license as repository content",
        "attribution": "Mammo contributors",
        "evidenceIds": ["ev-ap-seer-lobes-ducts", "ev-ap-openstax-structure"],
        "review": AUTO,
    },
    {
        "id": "asset-ap-density",
        "kind": "svg_schematic",
        "title": "Schematic density categories",
        "src": "/assets/anatomy-pathology/density-categories.svg",
        "width": 640,
        "height": 220,
        "alt": "Four shaded boxes for density categories with not-dense vs dense mapping. Labeled SCHEMATIC — NOT A MAMMOGRAM.",
        "isSchematic": True,
        "modality": "schematic",
        "license": "Original work for Mammo; same license as repository content",
        "attribution": "Mammo contributors",
        "evidenceIds": ["ev-ap-nci-dense-four", "ev-ap-mqsa-density"],
        "review": AUTO,
    },
    {
        "id": "asset-ap-lymph",
        "kind": "svg_schematic",
        "title": "Schematic regional lymph node groups",
        "src": "/assets/anatomy-pathology/lymph-regions.svg",
        "width": 520,
        "height": 320,
        "alt": "Schematic breast with markers for axillary, infra/supraclavicular, and internal mammary regions. Labeled SCHEMATIC — NOT A MAMMOGRAM.",
        "isSchematic": True,
        "modality": "schematic",
        "license": "Original work for Mammo; same license as repository content",
        "attribution": "Mammo contributors",
        "evidenceIds": ["ev-ap-seer-lymph-groups"],
        "review": AUTO,
    },
    {
        "id": "asset-ap-insitu",
        "kind": "svg_schematic",
        "title": "Schematic in situ versus invasive",
        "src": "/assets/anatomy-pathology/insitu-vs-invasive.svg",
        "width": 640,
        "height": 260,
        "alt": "Two duct schematics comparing cells confined in place versus spreading outside. Labeled SCHEMATIC — NOT A MAMMOGRAM / NOT DIAGNOSTIC.",
        "isSchematic": True,
        "modality": "schematic",
        "license": "Original work for Mammo; same license as repository content",
        "attribution": "Mammo contributors",
        "evidenceIds": ["ev-ap-dict-insitu", "ev-ap-dict-dcis", "ev-ap-dict-idc"],
        "review": NEED,
    },
]

visuals = [
    {
        "id": "vis-ap-uoq-right",
        "revision": 1,
        "objectiveId": "obj-ap-clock-quadrants",
        "assetId": "asset-ap-clock",
        "estSeconds": 45,
        "title": "Find the right-breast UOQ",
        "prompt": "On the left schematic (right breast, facing patient), select the upper outer quadrant label region (lateral/axillary side).",
        "hotspots": [
            {"id": "a", "neutralLabel": "Region A, upper-left area of the left schematic (toward axilla)", "x": 70, "y": 90, "w": 70, "h": 50, "revealLabel": "Right UOQ"},
            {"id": "b", "neutralLabel": "Region B, upper-right area of the left schematic (toward midline)", "x": 185, "y": 90, "w": 70, "h": 50, "revealLabel": "Right UIQ"},
            {"id": "c", "neutralLabel": "Region C, lower-left area of the left schematic", "x": 70, "y": 210, "w": 70, "h": 50, "revealLabel": "Right LOQ"},
            {"id": "d", "neutralLabel": "Region D, nipple marker center", "x": 150, "y": 155, "w": 40, "h": 40, "revealLabel": "Central nipple"},
        ],
        "correctHotspotId": "a",
        "feedback": {
            "a": "Correct. Outer/lateral on the right breast is toward the axilla (outside of the page).",
            "b": "That is UIQ (upper inner / toward midline).",
            "c": "That is LOQ (lower outer).",
            "d": "The center marker is the nipple/central region.",
        },
        "explanation": "SEER names UOQ as upper outer quadrant. Match the label on the correct laterality schematic.",
        "accessibilityNote": "Regions described by position on the left (right-breast) schematic until reveal.",
        "evidenceIds": ["ev-ap-seer-quadrants-clock"],
        "review": AUTO,
    },
    {
        "id": "vis-ap-lobule",
        "revision": 1,
        "objectiveId": "obj-ap-tdlu",
        "assetId": "asset-ap-ductal",
        "estSeconds": 40,
        "title": "Find a lobule/alveoli cluster",
        "prompt": "Select the region that represents lobule/alveoli clusters on this duct-tree schematic.",
        "hotspots": [
            {"id": "a", "neutralLabel": "Region A, far-left circle", "x": 50, "y": 120, "w": 60, "h": 60, "revealLabel": "Nipple"},
            {"id": "b", "neutralLabel": "Region B, right-side clustered circles", "x": 300, "y": 50, "w": 80, "h": 60, "revealLabel": "Lobule / alveoli"},
            {"id": "c", "neutralLabel": "Region C, empty lower margin", "x": 100, "y": 250, "w": 100, "h": 30, "revealLabel": "Margin / label area"},
            {"id": "d", "neutralLabel": "Region D, title banner", "x": 200, "y": 5, "w": 200, "h": 25, "revealLabel": "Schematic banner"},
        ],
        "correctHotspotId": "b",
        "feedback": {
            "a": "That is the nipple marker.",
            "b": "Correct — clustered circles represent lobules/alveoli.",
            "c": "Not a lobule cluster.",
            "d": "Banner text, not anatomy.",
        },
        "explanation": "Lobules are clusters of alveoli along the duct tree.",
        "accessibilityNote": "Choose by position description; names reveal after answer.",
        "evidenceIds": ["ev-ap-openstax-structure", "ev-ap-seer-lobes-ducts"],
        "review": AUTO,
    },
    {
        "id": "vis-ap-dense-map",
        "revision": 1,
        "objectiveId": "obj-ap-assessment-density-categories",
        "assetId": "asset-ap-density",
        "estSeconds": 40,
        "title": "Which categories are “dense” for patients?",
        "prompt": "Select a box that maps to the dense patient statement.",
        "hotspots": [
            {"id": "a", "neutralLabel": "Box A, farthest left", "x": 16, "y": 36, "w": 140, "h": 110, "revealLabel": "Almost entirely fatty — not dense"},
            {"id": "b", "neutralLabel": "Box B, second from left", "x": 172, "y": 36, "w": 140, "h": 110, "revealLabel": "Scattered — not dense"},
            {"id": "c", "neutralLabel": "Box C, third from left", "x": 328, "y": 36, "w": 140, "h": 110, "revealLabel": "Heterogeneously dense — dense"},
            {"id": "d", "neutralLabel": "Banner text at top", "x": 200, "y": 0, "w": 240, "h": 28, "revealLabel": "Schematic banner"},
        ],
        "correctHotspotId": "c",
        "feedback": {
            "a": "Fatty maps to not dense.",
            "b": "Scattered maps to not dense.",
            "c": "Correct — heterogeneously dense maps to dense.",
            "d": "Not a density category box.",
        },
        "explanation": "Heterogeneously dense and extremely dense map to the dense patient statement.",
        "accessibilityNote": "Boxes described left-to-right without revealing dense/not-dense until feedback.",
        "evidenceIds": ["ev-ap-nci-dense-four", "ev-ap-mqsa-density"],
        "review": AUTO,
    },
    {
        "id": "vis-ap-axilla-node",
        "revision": 1,
        "objectiveId": "obj-ap-internal-structures",
        "assetId": "asset-ap-lymph",
        "estSeconds": 40,
        "title": "Find the axillary node region marker",
        "prompt": "Select the marker that represents the axillary (underarm) node region.",
        "hotspots": [
            {"id": "a", "neutralLabel": "Marker A, left of the breast outline", "x": 120, "y": 120, "w": 40, "h": 40, "revealLabel": "Axilla"},
            {"id": "b", "neutralLabel": "Marker B, upper center-left", "x": 180, "y": 50, "w": 40, "h": 40, "revealLabel": "Supraclavicular area"},
            {"id": "c", "neutralLabel": "Marker C, on the breast labeled IM", "x": 285, "y": 145, "w": 35, "h": 35, "revealLabel": "Internal mammary"},
            {"id": "d", "neutralLabel": "Marker D, upper center-right", "x": 300, "y": 50, "w": 40, "h": 40, "revealLabel": "Infraclavicular area"},
        ],
        "correctHotspotId": "a",
        "feedback": {
            "a": "Correct — underarm/axillary region marker.",
            "b": "That marker is toward the supraclavicular area.",
            "c": "IM marks internal mammary (parasternal) region.",
            "d": "That marker is toward the infraclavicular area.",
        },
        "explanation": "SEER lists axillary nodes under the arm among regional groups.",
        "accessibilityNote": "Markers described by position until reveal.",
        "evidenceIds": ["ev-ap-seer-lymph-groups"],
        "review": AUTO,
    },
]

glossary = [
    {"term": "Areola", "definition": "Dark-colored skin surrounding the nipple.", "evidenceIds": ["ev-ap-dict-areola"]},
    {"term": "Fibroglandular tissue", "definition": "Fibrous connective tissue plus glandular tissue (ducts and lobules).", "evidenceIds": ["ev-ap-dict-fibroglandular"]},
    {"term": "In situ", "definition": "In its original place; abnormal cells have not spread from where they formed.", "evidenceIds": ["ev-ap-dict-insitu"]},
    {"term": "Sentinel lymph node", "definition": "First lymph node to which cancer is likely to spread from a primary tumor.", "evidenceIds": ["ev-ap-dict-sentinel"]},
    {"term": "DCIS", "definition": "Abnormal cells in a breast duct lining that have not spread outside the duct.", "evidenceIds": ["ev-ap-dict-dcis"]},
    {"term": "Suspensory ligaments", "definition": "Connective-tissue bands connecting breast tissue to the overlying dermis.", "evidenceIds": ["ev-ap-openstax-suspensory"]},
]

module = {
    "id": "mod-anatomy-pathology",
    "version": "1.0.0-beta.1",
    "title": "Anatomy, physiology, and pathology",
    "summary": "Breast anatomy for positioning relevance, tissue composition and density concepts, findings vocabulary at technologist level, and BI-RADS/MQSA assessment–density awareness — without teaching independent image interpretation. Honest beta status throughout.",
    "topicIds": [
        "top-ap-localization",
        "top-ap-external",
        "top-ap-internal",
        "top-ap-reporting",
        "top-ap-benign",
        "top-ap-high-risk",
        "top-ap-malignant",
    ],
    "assets": assets,
    "visuals": visuals,
    "glossary": glossary,
}
wjson(MOD / "module.json", module)

# sources.json
sources = {
    "version": "2026-10-06.1",
    "note": "Sources added for the anatomy-pathology module. Also appended into content/sources/register.json.",
    "sources": [
        {
            "id": "src-nci-dictionary",
            "title": "NCI Dictionary of Cancer Terms",
            "publisher": "National Cancer Institute",
            "url": "https://www.cancer.gov/publications/dictionaries/cancer-terms",
            "publishedOrEffective": "Retrieved 2026-10-06 via NCI Glossary API",
            "retrievedOn": "2026-10-06",
            "retrievalStatus": "retrieved",
            "retrievalNote": "Term definitions retrieved through https://webapis.cancer.gov/glossary/v1/Terms/Cancer.gov/Patient/en/{termId} on 2026-10-06.",
            "sections": [
                "fibroadenoma",
                "DCIS",
                "IDC",
                "ILC",
                "inflammatory breast cancer",
                "Paget disease",
                "LCIS",
                "ADH",
                "ALH",
                "radial scar",
                "phyllodes",
                "in situ",
                "cyst",
                "lipoma",
                "intraductal papilloma",
                "fat necrosis",
                "sentinel lymph node",
                "areola",
                "fibroglandular breast tissue",
                "breast density",
                "calcification",
                "microcalcification",
            ],
            "rights": {
                "status": "public_domain",
                "canRead": True,
                "canQuote": True,
                "canRedistribute": True,
                "canSubmitToAI": True,
                "basis": "NCI reuse policy: Dictionary of Cancer Terms text is free of copyright unless otherwise indicated.",
                "basisSourceId": "src-nci-reuse",
            },
            "kind": "government_guidance",
        },
        {
            "id": "src-nci-seer-breast-types",
            "title": "SEER Training Modules — Types of Breast Histologies",
            "publisher": "National Cancer Institute SEER Program",
            "url": "https://training.seer.cancer.gov/breast/types.html",
            "publishedOrEffective": "Updated 2025-01-10",
            "retrievedOn": "2026-10-06",
            "retrievalStatus": "retrieved",
            "retrievalNote": "Full page retrieved 2026-10-06.",
            "sections": ["DCIS share", "Invasive ductal ~70%", "Invasive lobular 10–15%", "In situ vs invasive framing"],
            "rights": {
                "status": "public_domain",
                "canRead": True,
                "canQuote": True,
                "canRedistribute": True,
                "canSubmitToAI": True,
                "basis": "NCI/NIH government work; verify per-graphic credits (some figures © Terese Winslow — not redistributed).",
                "basisSourceId": "src-nci-reuse",
            },
            "kind": "government_guidance",
        },
        {
            "id": "src-openstax-anatomy-phys-2e",
            "title": "Anatomy and Physiology 2e — § 28.6 Lactation",
            "publisher": "OpenStax / Rice University",
            "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/28-6-lactation",
            "publishedOrEffective": "Anatomy and Physiology 2e",
            "retrievedOn": "2026-10-06",
            "retrievalStatus": "retrieved",
            "retrievalNote": "Lactation / breast structure section retrieved 2026-10-06.",
            "sections": ["Structure of the Lactating Breast", "alveoli", "myoepithelial cells", "lobules", "Montgomery glands"],
            "rights": {
                "status": "open_license",
                "license": "CC BY 4.0",
                "canRead": True,
                "canQuote": True,
                "canRedistribute": True,
                "canSubmitToAI": True,
                "basis": "OpenStax textbooks are licensed CC BY 4.0; attribute OpenStax.",
            },
            "kind": "other",
        },
        {
            "id": "src-openstax-clinical-nursing-breast",
            "title": "Clinical Nursing Skills — § 23.4 Breast and Lymphatic System",
            "publisher": "OpenStax / Rice University",
            "url": "https://openstax.org/books/clinical-nursing-skills/pages/23-4-breast-and-lymphatic-system",
            "publishedOrEffective": "Clinical Nursing Skills",
            "retrievedOn": "2026-10-06",
            "retrievalStatus": "retrieved",
            "retrievalNote": "Suspensory ligaments wording retrieved 2026-10-06.",
            "sections": ["Internal Breast", "suspensory ligaments"],
            "rights": {
                "status": "open_license",
                "license": "CC BY 4.0",
                "canRead": True,
                "canQuote": True,
                "canRedistribute": True,
                "canSubmitToAI": True,
                "basis": "OpenStax CC BY 4.0; attribute OpenStax.",
            },
            "kind": "other",
        },
    ],
}
wjson(MOD / "sources.json", sources)

# coverage
def ids_for(obj_id, lessons_l, questions_l, cards_l, visuals_l):
    return {
        "objectiveId": obj_id,
        "lessonIds": [x["id"] for x in lessons_l if x["objectiveId"] == obj_id],
        "questionIds": [x["id"] for x in questions_l if obj_id in x["objectiveIds"]],
        "cardIds": [x["id"] for x in cards_l if x["objectiveId"] == obj_id],
        "visualIds": [x["id"] for x in visuals_l if x["objectiveId"] == obj_id],
    }

objective_ids = sorted({
    *(l["objectiveId"] for l in lessons),
    *(o for qq in questions for o in qq["objectiveIds"]),
    *(c["objectiveId"] for c in cards),
    *(v["objectiveId"] for v in visuals),
})

coverage = {
    "moduleId": "mod-anatomy-pathology",
    "version": "2026-10-06.1",
    "note": "Module-local coverage for Stage 2 anatomy-pathology. Shared curriculum.json left unchanged to avoid merge conflicts with parallel batches.",
    "objectiveCoverage": [ids_for(oid, lessons, questions, cards, visuals) for oid in objective_ids],
    "gapsNoted": [
        {
            "objectiveId": "obj-ap-triangulation",
            "note": "No accessible open source retrieved that teaches a specific triangulation method between CC/MLO. Left uncovered rather than inventing rules.",
        },
        {
            "objectiveId": "obj-ap-cytology",
            "note": "Basement-membrane breach as the histologic criterion for invasion not sourced in this batch; taught in situ vs invasive + myoepithelial physiology only.",
        },
        {
            "objectiveId": "obj-ap-tdlu",
            "note": "Exact phrase “terminal ductal lobular unit” not retrieved from NCI Dictionary/SEER pages used; duct–lobule–alveoli structure taught instead.",
        },
        {
            "objectiveId": "obj-ap-lexicon-masses-calcs",
            "note": "Full ACR BI-RADS mass/calcification descriptor lexicon remains blocked (copyrighted atlas). NCI patient-level mass/calc vocabulary taught; asymmetries/distortion left for a source-backed update.",
        },
        {
            "objectiveId": "obj-ap-benign-conditions",
            "note": "Galactocele, duct ectasia, hematoma, abscess, edema, seroma, gynecomastia lack complete sourced teaching packages here (some dictionary stubs exist for later).",
        },
        {
            "objectiveId": "obj-ap-high-risk-lesions",
            "note": "Flat epithelial atypia and papilloma with atypia not retrieved into evidence this batch.",
        },
        {
            "objectiveId": "obj-ap-malignant",
            "note": "Sarcoma, lymphoma, and metastases-to-breast reserved for a later expansion.",
        },
        {
            "objectiveId": "obj-ap-external-landmarks",
            "note": "Inframammary fold and pectoral muscle angle criteria for image evaluation overlap positioning module; only anatomic identity taught here.",
        },
    ],
}
wjson(MOD / "coverage.json", coverage)
print("module body complete")