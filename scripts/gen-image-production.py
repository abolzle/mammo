#!/usr/bin/env python3
"""Generate Stage 2 image-production module content. Run once, then delete or keep as maintainer aid."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MOD = ROOT / "content/modules/image-production"
EV = ROOT / "content/evidence"
ASSETS = ROOT / "public/assets/image-production"

DRAFT_REVIEW = {
    "status": "draft",
    "requiresQualifiedReview": False,
    "aiAssisted": True,
    "history": [
        {
            "at": "2026-10-06",
            "status": "draft",
            "actor": "ai-assisted",
            "kind": "revision",
            "note": "AI-assisted draft from retrieved sources. Not yet maintainer source-checked.",
        }
    ],
}

NEEDS_REVIEW = {
    **DRAFT_REVIEW,
    "requiresQualifiedReview": True,
    "history": [
        {
            "at": "2026-10-06",
            "status": "draft",
            "actor": "ai-assisted",
            "kind": "revision",
            "note": "Touches dose, thresholds, or device-specific practice; keep out of verified pools until qualified review.",
        }
    ],
}


def wjson(path: Path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, indent=2, ensure_ascii=False) + "\n")
    print("wrote", path.relative_to(ROOT))


# --------------------------------------------------------------------------- evidence
evidence = [
    {
        "id": "ev-ip-brems-characteristic",
        "sourceId": "src-openstax-college-physics-2e",
        "locator": "College Physics 2e § 30.4",
        "claim": "In an x-ray tube, electrons accelerated by high voltage strike the anode and produce x-rays by two processes: bremsstrahlung (braking radiation from electron deceleration) and characteristic x-rays (emitted when an inner-shell vacancy in an anode atom is filled).",
        "scope": "General x-ray tube physics; not mammography-specific technique charts.",
        "excerpt": "There are two processes by which x rays are produced in the anode of an x-ray tube. In one process, the deceleration of electrons produces x rays, and these x rays are called bremsstrahlung, or braking radiation. The second process is atomic in nature and produces characteristic x rays, so called because they are characteristic of the anode material.",
        "citation": "quoted_public",
        "context": {"modality": []},
    },
    {
        "id": "ev-ip-emax-kvp",
        "sourceId": "src-openstax-college-physics-2e",
        "locator": "College Physics 2e § 30.4",
        "claim": "The maximum energy of an x-ray photon from a tube equals the electron kinetic energy set by the accelerating voltage: E_max = qeV (for example, 100 kV accelerating voltage yields a maximum photon energy of 100 keV).",
        "scope": "General tube physics relating kV setting to maximum photon energy.",
        "excerpt": "Thus the accelerating voltage and the maximum x-ray energy are related by conservation of energy. Electric potential energy is converted to kinetic energy and then to photon energy, so that Emax=hfmax=qeV. Units of electron volts are convenient. For example, a 100-kV accelerating voltage produces x-ray photons with a maximum energy of 100 keV.",
        "citation": "quoted_public",
        "context": {"modality": []},
    },
    {
        "id": "ev-ip-energy-penetration-contrast",
        "sourceId": "src-openstax-college-physics-2e",
        "locator": "College Physics 2e § 30.4 (Medical and Other Diagnostic Uses)",
        "claim": "Higher-energy x-ray photons penetrate more material; lower-energy x-rays provide better contrast (sharper differentiation) but are more attenuated by thicker materials. Soft-tissue structures with similar absorption are hard to separate on a simple radiograph.",
        "scope": "General radiographic contrast and penetration principles.",
        "excerpt": "The more energy an x-ray photon has, the more material it will penetrate. … Low-energy x rays provide better contrast (sharper images). However, due to greater attenuation and less scattering, they are more absorbed by thicker materials. … X-ray absorption by different types of soft tissue is very similar, so contrast is difficult",
        "citation": "quoted_public",
        "context": {"modality": []},
    },
    {
        "id": "ev-ip-breast-soft-tissue-contrast",
        "sourceId": "src-openstax-college-physics-2e",
        "locator": "College Physics 2e § 30.4 (mammogram paragraph)",
        "claim": "Mammography is used because early detection matters, but a mammogram cannot diagnose malignancy by itself—it shows evidence of a lump or denser region. Soft-tissue absorption is similar across tissue types, so contrast is difficult, especially in denser younger breasts; more fat in older breasts can improve contrast of a lump.",
        "scope": "Conceptual soft-tissue imaging challenge; not a positioning or BI-RADS lesson.",
        "excerpt": "A mammogram cannot diagnose a malignant tumor, only give evidence of a lump or region of increased density within the breast. X-ray absorption by different types of soft tissue is very similar, so contrast is difficult; this is especially true for younger women, who typically have denser breasts.",
        "citation": "quoted_public",
        "context": {"modality": ["mammography"]},
    },
    {
        "id": "ev-ip-ionizing-dna",
        "sourceId": "src-openstax-college-physics-2e",
        "locator": "College Physics 2e § 32.2",
        "claim": "Ionizing radiation affects molecules within cells, particularly DNA. It can interfere with cell reproduction and cell function; rapidly dividing cells (including many cancer cells) are especially sensitive, so radiation can both treat and cause cancer.",
        "scope": "Technologist-level radiation biology concepts.",
        "excerpt": "All the effects of ionizing radiation on biological tissue can be understood by knowing that ionizing radiation affects molecules within cells, particularly DNA molecules. … Since ionizing radiation damages the DNA, which is critical in cell reproduction, it has its greatest effect on cells that rapidly reproduce, including most types of cancer. … Without contradiction, ionizing radiation can be both a cure and a cause.",
        "citation": "quoted_public",
        "context": {"modality": []},
    },
    {
        "id": "ev-ip-dose-units",
        "sourceId": "src-openstax-college-physics-2e",
        "locator": "College Physics 2e § 32.2",
        "claim": "Absorbed dose is measured in gray (Gy), where 1 Gy = 1 J/kg = 100 rad. Equivalent dose accounting for radiation type uses sievert (Sv) and rem, with Sv = Gy × RBE and 1 Sv = 100 rem.",
        "scope": "Unit definitions only; not occupational dose limits or mammography technique factors.",
        "excerpt": "The SI unit for radiation dose is the gray (Gy), which is defined to be 1 Gy = 1 J/kg = 100 rad. … The SI equivalent of the rem is the sievert (Sv), defined to be Sv = Gy × RBE and 1 Sv = 100 rem.",
        "citation": "quoted_public",
        "context": {"modality": []},
        "review": NEEDS_REVIEW,
    },
    {
        "id": "ev-ip-linear-hypothesis",
        "sourceId": "src-openstax-college-physics-2e",
        "locator": "College Physics 2e § 32.2 / Ch. 32 summary",
        "claim": "Immediate effects of very low doses are not observed, but radiation protection often assumes risk is proportional to dose even at low levels (the linear hypothesis). OpenStax also notes radiation protection uses shielding, distance, and limiting time of exposure.",
        "scope": "Risk model language for teaching; not a numerical risk calculator.",
        "excerpt": "Effects due to low doses are not observed, but their risk is assumed to be directly proportional to those of high doses, an assumption known as the linear hypothesis. … To physically limit radiation doses, we use shielding, increase the distance from a source, and limit the time of exposure.",
        "citation": "quoted_public",
        "context": {"modality": []},
    },
    {
        "id": "ev-ip-nrc-lnt",
        "sourceId": "src-nrc-radiation-cancer",
        "locator": "NRC Radiation Exposure and Cancer (reviewed 2020-03-20)",
        "claim": "Public health data do not absolutely establish cancer occurrence below about 10,000 mrem (100 mSv), but the radiation protection community conservatively assumes any amount of radiation may pose some risk and that risk rises with dose. The NRC accepts the linear no-threshold (LNT) hypothesis as a conservative model for estimating radiation risk.",
        "scope": "Risk-communication framing for technologists; not a patient-specific risk number.",
        "excerpt": "Although radiation may cause cancer at high doses and high dose rates, public health data do not absolutely establish the occurrence of cancer following exposure to low doses and dose rates — below about 10,000 mrem (100 mSv). … A linear no-threshold (LNT) dose-response relationship is used to describe the relationship between radiation dose and the occurrence of cancer. … The U.S. Nuclear Regulatory Commission (NRC) accepts the LNT hypothesis as a conservative model for estimating radiation risk.",
        "citation": "quoted_public",
        "context": {"modality": [], "jurisdiction": "US federal"},
        "review": NEEDS_REVIEW,
    },
    {
        "id": "ev-ip-cdc-alara",
        "sourceId": "src-cdc-alara",
        "locator": "CDC ALARA page (updated 2026-07-17)",
        "claim": "ALARA means as low as reasonably achievable: avoid radiation exposure that has no direct benefit, even if the dose is small. The three basic protective measures are time (minimize), distance (maximize), and shielding (place an appropriate barrier).",
        "scope": "General radiation safety philosophy; clinical mammography practice applies these ideas with facility procedures.",
        "excerpt": "ALARA stands for \"as low as reasonably achievable.\" ALARA means avoiding exposure to radiation that does not have a direct benefit to you, even if the dose is small. To do this, you can use three basic protective measures in radiation safety: time, distance, and shielding.",
        "citation": "quoted_public",
        "context": {"modality": [], "jurisdiction": "US"},
    },
    {
        "id": "ev-ip-cdc-tech-barrier",
        "sourceId": "src-cdc-alara",
        "locator": "CDC ALARA page, time/distance/shielding clinic example",
        "claim": "In a medical x-ray setting, the three ALARA measures work together when the technologist goes behind a barrier while making the exposure, protecting against repeated occupational exposure.",
        "scope": "Occupational protection concept illustration from CDC.",
        "excerpt": "You can see how these principles work together when you have an x-ray at your doctor's office or clinic. The radiation technician goes behind a barrier while taking the x-ray image. The barrier protects them from repeated daily exposure to radiation.",
        "citation": "quoted_public",
        "context": {"modality": ["radiography"]},
    },
    {
        "id": "ev-ip-nci-mammogram-low-dose",
        "sourceId": "src-nci-mammograms",
        "locator": "NCI Mammograms fact sheet (updated 2025-12-02), 'What is a mammogram?'",
        "claim": "Mammography uses low-dose x-rays to create pictures of the breast for screening and diagnosis.",
        "scope": "Patient-facing description of modality; not a quantitative typical dose.",
        "excerpt": "Mammography is an imaging test that uses low-dose x-rays to create pictures of the breast. It is used both to screen for breast cancer and diagnose breast conditions.",
        "citation": "quoted_public",
        "context": {"modality": ["mammography"]},
    },
    {
        "id": "ev-ip-nci-dbt",
        "sourceId": "src-nci-mammograms",
        "locator": "NCI Mammograms fact sheet, 'What are 3D mammograms?'",
        "claim": "Digital breast tomosynthesis (DBT, 3D mammography) takes multiple thin-slice pictures across the breast that software assembles into a 3D picture; DBT also creates 2D images like standard mammography. Combining DBT with standard mammography finds more tumors than standard mammography alone, but whether DBT reduces breast-cancer deaths more than standard mammography alone is still being studied (e.g., TMIST).",
        "scope": "Modality comparison at fact-sheet level.",
        "excerpt": "Three-dimensional, or 3D, mammography, also called digital breast tomosynthesis (DBT), creates three-dimensional images of the breast. To do this, the DBT machine takes multiple pictures of thin “slices” across the breast that are then assembled into a 3D picture by computer software. DBT also creates 2D images of the breast like those created by standard mammography. DBT combined with standard mammography is better at finding tumors than standard mammography alone. However, it's still unknown whether DBT is more effective than standard mammography at reducing deaths from breast cancer.",
        "citation": "quoted_public",
        "context": {"modality": ["FFDM", "DBT"]},
    },
    {
        "id": "ev-ip-nci-diagnostic-more-images",
        "sourceId": "src-nci-mammograms",
        "locator": "NCI Mammograms fact sheet, screening vs diagnostic",
        "claim": "The same machines are used for screening and diagnostic mammograms, but diagnostic mammography requires images from more angles, so the radiation dose is higher.",
        "scope": "Relative dose concept; not a numeric dose value.",
        "excerpt": "The same machines are used for both types of mammograms. However, diagnostic mammography requires images from more angles than screening mammography, so the dose of radiation is higher.",
        "citation": "quoted_public",
        "context": {"modality": ["mammography"]},
        "review": NEEDS_REVIEW,
    },
    {
        "id": "ev-ip-nci-compression-purpose",
        "sourceId": "src-nci-mammograms",
        "locator": "NCI Mammograms fact sheet, 'What happens during a mammogram?'",
        "claim": "During a mammogram the breast is placed between two plates that are pressed together; pressing helps get a better x-ray picture of the inside of the breast.",
        "scope": "Patient-facing purpose of compression.",
        "excerpt": "During a mammogram, your breast is placed between two plates that are then pressed together. Pressing the breast helps get a better x-ray picture of the inside of your breast.",
        "citation": "quoted_public",
        "context": {"modality": ["mammography"]},
    },
    {
        "id": "ev-ip-acr-dmqc-link",
        "sourceId": "src-acr-dmqc-manual",
        "locator": "ACR Digital Mammography QC Manual resources page",
        "claim": "FDA has determined that facilities may use the ACR 2018 Digital Mammography QC Manual for quality control of both 2D digital mammography and DBT; the manual itself is copyrighted and is cited link-only in Mammo (no redistributed text or device-specific pass/fail criteria).",
        "scope": "Pointer to the accepted digital QC program source; not a substitute for reading the manual.",
        "citation": "link_only",
        "context": {"modality": ["FFDM", "DBT"]},
        "review": NEEDS_REVIEW,
    },
]

wjson(
    EV / "image-production.json",
    {
        "version": "2026-10-06.1",
        "defaults": {
            "retrievedOn": "2026-10-06",
            "review": DRAFT_REVIEW,
        },
        "evidence": evidence,
    },
)

# --------------------------------------------------------------------------- module meta + visuals
assets = [
    {
        "id": "asset-ip-beam-path",
        "kind": "svg_schematic",
        "title": "Beam path through a mammography unit",
        "src": "/assets/image-production/beam-path.svg",
        "width": 320,
        "height": 420,
        "alt": "Schematic side view: tube housing at top, then beam-limiting device, compression paddle, breast, and breast support with image receptor. Not a photograph and not to scale.",
        "isSchematic": True,
        "modality": "schematic",
        "license": "Original work for Mammo; same license as repository content",
        "attribution": "Mammo contributors",
        "evidenceIds": ["ev-mqsa-mammography-unit-definition", "ev-mqsa-compression-device"],
    },
    {
        "id": "asset-ip-dbt-slices",
        "kind": "svg_schematic",
        "title": "DBT acquisition as thin slices",
        "src": "/assets/image-production/dbt-slices.svg",
        "width": 560,
        "height": 280,
        "alt": "Schematic: an x-ray tube arc above a compressed breast, with several thin slice planes through the breast labeled as reconstructed tomosynthesis slices. Not a mammogram.",
        "isSchematic": True,
        "modality": "schematic",
        "license": "Original work for Mammo; same license as repository content",
        "attribution": "Mammo contributors",
        "evidenceIds": ["ev-ip-nci-dbt"],
    },
    {
        "id": "asset-ip-alara-triad",
        "kind": "svg_schematic",
        "title": "ALARA: time, distance, shielding",
        "src": "/assets/image-production/alara-triad.svg",
        "width": 600,
        "height": 220,
        "alt": "Three labeled panels: minimize time near a source, maximize distance, and place shielding between you and the source.",
        "isSchematic": True,
        "modality": "none",
        "license": "Original work for Mammo; same license as repository content",
        "attribution": "Mammo contributors",
        "evidenceIds": ["ev-ip-cdc-alara"],
    },
    {
        "id": "asset-ip-geometry-mag",
        "kind": "svg_schematic",
        "title": "Contact versus magnification geometry",
        "src": "/assets/image-production/geometry-mag.svg",
        "width": 560,
        "height": 300,
        "alt": "Two schematic side views: contact geometry with breast on the receptor, and magnification geometry with the breast raised on a platform creating an air gap above the receptor. Not to scale.",
        "isSchematic": True,
        "modality": "schematic",
        "license": "Original work for Mammo; same license as repository content",
        "attribution": "Mammo contributors",
        "evidenceIds": ["ev-mqsa-magnification-equipment"],
        "review": {"requiresQualifiedReview": True},
    },
    {
        "id": "asset-ip-eight-attributes",
        "kind": "svg_schematic",
        "title": "Eight clinical image quality attributes",
        "src": "/assets/image-production/eight-attributes.svg",
        "width": 640,
        "height": 240,
        "alt": "Eight equal boxes listing positioning, compression, exposure level, contrast, sharpness, noise, artifacts, and examination identification.",
        "isSchematic": True,
        "modality": "none",
        "license": "Original work for Mammo; same license as repository content",
        "attribution": "Mammo contributors",
        "evidenceIds": ["ev-mqsa-clinical-image-attributes"],
    },
]

visuals = [
    {
        "id": "vis-ip-beam-limiting",
        "revision": 1,
        "objectiveId": "obj-ip-unit-components",
        "assetId": "asset-ip-beam-path",
        "estSeconds": 45,
        "title": "Find the beam-limiting device",
        "prompt": "Select the beam-limiting device on this schematic unit.",
        "hotspots": [
            {"id": "a", "neutralLabel": "Component A, top block on the C-arm", "x": 105, "y": 22, "w": 110, "h": 55, "revealLabel": "Tube housing assembly"},
            {"id": "b", "neutralLabel": "Component B, small block just below A", "x": 130, "y": 90, "w": 60, "h": 28, "revealLabel": "Beam-limiting device"},
            {"id": "c", "neutralLabel": "Component C, thin plate above the breast", "x": 85, "y": 230, "w": 150, "h": 16, "revealLabel": "Compression paddle"},
            {"id": "d", "neutralLabel": "Component D, base under the breast", "x": 75, "y": 295, "w": 170, "h": 28, "revealLabel": "Breast support / image receptor"},
        ],
        "correctHotspotId": "b",
        "feedback": {
            "a": "That is the tube housing, where x-rays are produced.",
            "b": "Correct. The beam-limiting device shapes the field between the tube and the patient.",
            "c": "That is the compression paddle.",
            "d": "That is the breast support with the image receptor.",
        },
        "explanation": "Along the beam: tube housing → beam-limiting device → compression paddle → breast → breast support and receptor. MQSA's unit definition includes generator, control, tube housing, beam-limiting device, and supports.",
        "accessibilityNote": "Components are described by position only until after you answer.",
        "evidenceIds": ["ev-mqsa-mammography-unit-definition", "ev-mqsa-compression-device"],
    },
    {
        "id": "vis-ip-dbt-idea",
        "revision": 1,
        "objectiveId": "obj-ip-acquisition-types",
        "assetId": "asset-ip-dbt-slices",
        "estSeconds": 40,
        "title": "What does DBT reconstruct?",
        "prompt": "Select the part of the schematic that represents the thin reconstructed slice planes through the breast.",
        "hotspots": [
            {"id": "a", "neutralLabel": "Region A, the tube arc above the breast", "x": 40, "y": 20, "w": 200, "h": 70, "revealLabel": "Tube motion arc"},
            {"id": "b", "neutralLabel": "Region B, stacked horizontal lines inside the breast", "x": 250, "y": 110, "w": 160, "h": 90, "revealLabel": "Reconstructed thin slices"},
            {"id": "c", "neutralLabel": "Region C, the paddle alone", "x": 230, "y": 95, "w": 200, "h": 18, "revealLabel": "Compression paddle"},
            {"id": "d", "neutralLabel": "Region D, the support table only", "x": 220, "y": 210, "w": 220, "h": 30, "revealLabel": "Breast support"},
        ],
        "correctHotspotId": "b",
        "feedback": {
            "a": "The arc shows tube positions during acquisition, not the reconstructed slices.",
            "b": "Correct. DBT assembles multiple thin-slice images into a 3D dataset.",
            "c": "The paddle compresses the breast; it is not the reconstructed volume.",
            "d": "The support holds the breast; the slices are the reconstructed planes inside tissue.",
        },
        "explanation": "NCI describes DBT as acquiring multiple thin-slice pictures that software assembles into a 3D picture, while also creating 2D images.",
        "accessibilityNote": "Regions are announced by location; names appear after answering.",
        "evidenceIds": ["ev-ip-nci-dbt"],
    },
    {
        "id": "vis-ip-alara-shield",
        "revision": 1,
        "objectiveId": "obj-pc-typical-dose",
        "assetId": "asset-ip-alara-triad",
        "estSeconds": 35,
        "title": "Which panel is shielding?",
        "prompt": "Select the ALARA panel that shows placing a barrier between you and the source.",
        "hotspots": [
            {"id": "a", "neutralLabel": "Left panel", "x": 20, "y": 30, "w": 170, "h": 160, "revealLabel": "Time: minimize stay"},
            {"id": "b", "neutralLabel": "Center panel", "x": 215, "y": 30, "w": 170, "h": 160, "revealLabel": "Distance: stand farther away"},
            {"id": "c", "neutralLabel": "Right panel", "x": 410, "y": 30, "w": 170, "h": 160, "revealLabel": "Shielding: barrier between you and source"},
            {"id": "d", "neutralLabel": "Title banner only", "x": 20, "y": 0, "w": 560, "h": 28, "revealLabel": "Title, not a protective measure"},
        ],
        "correctHotspotId": "c",
        "feedback": {
            "a": "That panel is time: finish the necessary work and leave.",
            "b": "That panel is distance: farther away means lower dose.",
            "c": "Correct. Shielding puts material between you and the source.",
            "d": "The banner labels the figure; it is not one of the three measures.",
        },
        "explanation": "CDC's ALARA measures are time, distance, and shielding. In a clinic, standing behind a barrier while exposing is the everyday shielding example.",
        "accessibilityNote": "Panels are selectable by left/center/right position.",
        "evidenceIds": ["ev-ip-cdc-alara", "ev-ip-cdc-tech-barrier"],
    },
    {
        "id": "vis-ip-mag-air-gap",
        "revision": 1,
        "objectiveId": "obj-ip-magnification-technique",
        "assetId": "asset-ip-geometry-mag",
        "estSeconds": 45,
        "title": "Which setup is magnification geometry?",
        "prompt": "Select the schematic that shows the breast raised above the receptor with an air gap.",
        "hotspots": [
            {"id": "a", "neutralLabel": "Left schematic", "x": 20, "y": 40, "w": 240, "h": 220, "revealLabel": "Contact geometry"},
            {"id": "b", "neutralLabel": "Right schematic", "x": 300, "y": 40, "w": 240, "h": 220, "revealLabel": "Magnification geometry with air gap"},
            {"id": "c", "neutralLabel": "Left label only", "x": 20, "y": 10, "w": 240, "h": 28, "revealLabel": "Label for contact view"},
            {"id": "d", "neutralLabel": "Right label only", "x": 300, "y": 10, "w": 240, "h": 28, "revealLabel": "Label for magnification view"},
        ],
        "correctHotspotId": "b",
        "feedback": {
            "a": "Contact geometry places the breast on the receptor; there is no air gap.",
            "b": "Correct. Magnification raises the breast, creating OID and an air gap; MQSA requires the system can operate with the grid removed.",
            "c": "That is only the caption for the contact diagram.",
            "d": "That is only the caption; select the diagram itself.",
        },
        "explanation": "MQSA requires magnification systems to provide at least one factor between 1.4 and 2.0 and to operate with the grid removed. The air gap replaces grid cleanup in that geometry.",
        "accessibilityNote": "Left versus right schematic can be chosen from the keyboard.",
        "evidenceIds": ["ev-mqsa-magnification-equipment"],
        "review": {"requiresQualifiedReview": True},
    },
]

glossary = [
    {"term": "Bremsstrahlung", "definition": "X-rays produced when electrons decelerate in the anode (braking radiation).", "evidenceIds": ["ev-ip-brems-characteristic"]},
    {"term": "Characteristic x-ray", "definition": "X-ray emitted when an electron fills an inner-shell vacancy in an anode atom; energies identify the element.", "evidenceIds": ["ev-ip-brems-characteristic"]},
    {"term": "Digital breast tomosynthesis (DBT)", "definition": "3D mammography that acquires multiple thin-slice projections and reconstructs a volumetric image set; also produces 2D images.", "evidenceIds": ["ev-ip-nci-dbt"]},
    {"term": "FFDM", "definition": "Full-field digital mammography: a digital 2D mammographic modality under MQSA's modality definition.", "evidenceIds": ["ev-mqsa-modality-definition"]},
    {"term": "ALARA", "definition": "As low as reasonably achievable: avoid non-beneficial radiation exposure; use time, distance, and shielding.", "evidenceIds": ["ev-ip-cdc-alara"]},
    {"term": "Linear no-threshold (LNT)", "definition": "Conservative model assuming any increase in dose incrementally increases cancer risk; accepted by the NRC for radiation protection estimates.", "evidenceIds": ["ev-ip-nrc-lnt"]},
    {"term": "Gray (Gy)", "definition": "SI unit of absorbed dose: 1 Gy = 1 J/kg = 100 rad.", "evidenceIds": ["ev-ip-dose-units"]},
    {"term": "Sievert (Sv)", "definition": "SI unit of equivalent dose: Sv = Gy × RBE; 1 Sv = 100 rem.", "evidenceIds": ["ev-ip-dose-units"]},
    {"term": "Beam-limiting device", "definition": "Component that shapes the x-ray field; required part of a mammography unit under MQSA.", "evidenceIds": ["ev-mqsa-mammography-unit-definition"]},
    {"term": "Air gap", "definition": "Space between the magnified breast and the receptor that reduces scatter reaching the detector when the grid is removed.", "evidenceIds": ["ev-mqsa-magnification-equipment"]},
]

module = {
    "id": "mod-image-production",
    "version": "1.0.0-beta.1",
    "title": "Image production: acquisition, quality, and radiation",
    "summary": "How the mammography beam is made and shaped, how FFDM and DBT differ, how technologists judge image quality, and how to talk about radiation risk without inventing numbers.",
    "topicIds": [
        "top-ip-unit-design",
        "top-ip-digital",
        "top-ip-technique",
        "top-ip-image-evaluation",
        "top-pc-education",
    ],
    "assets": assets,
    "visuals": visuals,
    "glossary": glossary,
}
wjson(MOD / "module.json", module)

# --------------------------------------------------------------------------- lessons
lessons = [
    {
        "id": "les-ip-beam-path",
        "revision": 1,
        "moduleId": "mod-image-production",
        "objectiveId": "obj-ip-unit-components",
        "title": "Components along the beam path",
        "estMinutes": 3,
        "summary": "Name the required parts of a mammography unit and walk the beam from tube to receptor.",
        "explanation": [
            {
                "heading": "What counts as a mammography unit",
                "body": "Under MQSA, a **mammography unit** includes at least an **x-ray generator**, an **x-ray control**, a **tube housing assembly**, a **beam-limiting device**, and the **supporting structures** for those parts.\n\nGeneral-purpose radiographic equipment—even with mammography attachments—may not be used for mammography. The system must be designed for mammography.",
            },
            {
                "heading": "Follow the beam",
                "body": "In clinical order along the primary beam:\n\n1. **Tube housing** — where x-rays are produced\n2. **Beam-limiting device** — shapes the field\n3. **Compression paddle** — contacts and compresses the breast\n4. **Breast** — the anatomy being imaged\n5. **Breast support with image receptor** — detects the remnant beam\n\nKnowing this order helps you troubleshoot artifacts, collimation problems, and labeling questions.",
            },
        ],
        "example": "If a bright edge of the paddle appears on the image, you are looking at a paddle/alignment problem near the breast support—not a tube-housing failure.",
        "misconception": {
            "belief": "Any x-ray room can do mammography if you add a special paddle.",
            "correction": "MQSA prohibits using general-purpose or modified non-mammography systems for mammography.",
        },
        "variants": {
            "simpler": "Think: make the x-rays, shape them, compress the breast, then catch what gets through.",
            "example": "On a schematic, the small block under the tube is usually the beam-limiting device, not the paddle.",
            "deeper": "The compression device has its own MQSA design rules (hands-free power drive from both sides, paddle parallelism limits). Those sit beside the unit definition, not inside it.",
        },
        "observationPrompt": "With your preceptor, point to each named component on your unit without looking at the service labels first.",
        "checkQuestionId": "q-ip-001",
        "evidenceIds": [
            "ev-mqsa-mammography-unit-definition",
            "ev-mqsa-prohibited-equipment",
            "ev-mqsa-compression-device",
        ],
    },
    {
        "id": "les-ip-xray-production",
        "revision": 1,
        "moduleId": "mod-image-production",
        "objectiveId": "obj-ip-kvp-tube",
        "title": "How the tube makes the beam",
        "estMinutes": 4,
        "summary": "Bremsstrahlung, characteristic x-rays, and why accelerating voltage sets the maximum photon energy.",
        "explanation": [
            {
                "heading": "Electrons become x-rays in the anode",
                "body": "In an x-ray tube, electrons leave a heated filament, accelerate across a high voltage, and strike the **anode**. Two processes create x-rays:\n\n- **Bremsstrahlung** (\"braking radiation\"): electrons decelerate in the anode and emit a continuous spectrum of x-ray energies.\n- **Characteristic x-rays**: an electron knocks out an inner-shell electron; when that vacancy is filled, the atom emits photons at energies **characteristic of the anode element**.",
            },
            {
                "heading": "What kV controls",
                "body": "Conservation of energy links accelerating voltage to the **maximum** photon energy: a 100 kV accelerating voltage can produce photons up to 100 keV. Not every electron converts all of its energy into one photon, so the spectrum is broad, with characteristic peaks riding on the bremsstrahlung curve.",
            },
            {
                "heading": "Why mammography cares about soft-tissue contrast",
                "body": "OpenStax notes that soft tissues absorb x-rays similarly, so contrast is hard—especially in denser breasts. Mammography is designed for that soft-tissue problem. Facility technique charts and target/filter choices are device-specific; learn your unit's documented selections with your physicist and manufacturer materials rather than memorizing unsupported universal numbers.",
            },
        ],
        "example": "If someone says \"we used 100 kV,\" the *maximum* photon energy available is 100 keV; most photons in the beam are lower energy.",
        "misconception": {
            "belief": "Characteristic peaks mean every photon in the beam has that single energy.",
            "correction": "Characteristic peaks sit on a broad bremsstrahlung continuum; the beam contains a range of energies up to E_max.",
        },
        "variants": {
            "simpler": "Electrons slam into the anode. Some slow down (bremsstrahlung). Some knock out inner electrons that get replaced (characteristic x-rays). Higher kV allows higher-energy photons.",
            "example": "Tungsten is a common general radiographic anode example in textbooks because it tolerates heat; mammography systems may use other targets—check your unit documentation.",
            "deeper": "Creating a K-shell vacancy requires the incident electron energy to exceed the shell binding energy. That is why characteristic lines appear only when kV is high enough for that anode.",
        },
        "observationPrompt": "Ask your preceptor which target/filter combinations your unit offers and where that is documented (do not change clinical technique without supervision).",
        "checkQuestionId": "q-ip-005",
        "evidenceIds": [
            "ev-ip-brems-characteristic",
            "ev-ip-emax-kvp",
            "ev-ip-breast-soft-tissue-contrast",
            "ev-mqsa-technique-display",
        ],
        "review": NEEDS_REVIEW,
    },
    {
        "id": "les-ip-paddles-grids",
        "revision": 1,
        "moduleId": "mod-image-production",
        "objectiveId": "obj-ip-paddles-grids",
        "title": "Compression paddles and the grid's job",
        "estMinutes": 3,
        "summary": "MQSA paddle design rules, why compression helps the picture, and when the grid must come out.",
        "explanation": [
            {
                "heading": "Compression is an image-quality tool",
                "body": "NCI explains the practical point patients feel: the breast is pressed between two plates because **pressing helps get a better x-ray picture**. MQSA's clinical image attributes also judge compression for reducing overlapping tissue and motion.",
            },
            {
                "heading": "Paddle design you can be tested on",
                "body": "Every system needs a compression device with initial **power-driven, hands-free** controls operable from both sides, plus fine adjustment from both sides. Flat paddles must stay within **1.0 cm of parallel** under compression, match full-field receptor sizes (spot paddles may be special-purpose), and keep the chest-wall edge straight and off the image.",
            },
            {
                "heading": "Grids and magnification",
                "body": "Grids reduce scatter reaching the receptor in contact imaging. Systems used for magnification must be able to operate **with the grid removed**—magnification geometry uses an air gap instead. Exact grid ratios and Bucky factors are device-specific; do not invent universal numbers.",
            },
        ],
        "example": "Before a magnification view, confirm the unit is in a magnification mode that removes the grid and uses an approved magnification factor.",
        "misconception": {
            "belief": "Magnification views still use the grid the same way contact views do.",
            "correction": "MQSA requires magnification systems to operate with the grid removed.",
        },
        "variants": {
            "simpler": "Compression thins and steadies the breast. Flat paddles must stay nearly parallel. Magnification: grid out.",
            "example": "A spot paddle is allowed as a special-purpose paddle; it does not have to be full-field size.",
            "deeper": "Compression force performance limits appear in MQSA testing language; treat numeric force limits as items that need qualified review before you rely on them as memorized absolutes for every digital unit.",
        },
        "checkQuestionId": "q-ip-009",
        "evidenceIds": [
            "ev-ip-nci-compression-purpose",
            "ev-mqsa-compression-device",
            "ev-mqsa-magnification-equipment",
            "ev-mqsa-clinical-image-attributes",
        ],
    },
    {
        "id": "les-ip-geometry",
        "revision": 1,
        "moduleId": "mod-image-production",
        "objectiveId": "obj-ip-geometry",
        "title": "SID, OID, and magnification range",
        "estMinutes": 3,
        "summary": "Relate geometry language to MQSA's magnification factor range and field-alignment checks that use percent of SID.",
        "explanation": [
            {
                "heading": "Words that locate the anatomy",
                "body": "- **SID**: source-to-image-receptor distance\n- **OID**: object-to-image-receptor distance\n- Raising the breast on a magnification platform increases OID, enlarges the projected anatomy, and creates an **air gap** above the receptor.",
            },
            {
                "heading": "MQSA magnification capability",
                "body": "Systems used for magnification must provide **at least one magnification value between 1.4 and 2.0** and must be able to operate without the grid. That is a design requirement you can quote; it is not a claim that every exam uses 1.4×.",
            },
            {
                "heading": "Why SID shows up in QC language",
                "body": "Alignment tolerances in MQSA are stated as percentages of SID (for example, how far the x-ray field or paddle edge may extend relative to the receptor). Those checks belong with physicist testing; technologists should recognize that SID is the reference length, not invent new percentages.",
            },
        ],
        "example": "If a question asks for the required magnification range on systems used for magnification, answer 1.4 to 2.0—not \"as large as possible.\"",
        "misconception": {
            "belief": "Any geometric enlargement counts as meeting MQSA magnification capability.",
            "correction": "The regulation specifies at least one value in the 1.4–2.0 range, plus grid-out operation.",
        },
        "variants": {
            "simpler": "Pull the breast away from the detector to magnify it. MQSA wants a factor somewhere between 1.4 and 2.0, and the grid must be removable.",
            "example": "Field-alignment failures are often discussed in \"percent of SID\" units because SID is the system's reference distance.",
            "deeper": "Geometric blur grows with focal-spot size and OID. That is why magnification technique pairs a small focal spot with raised geometry—covered in the magnification-technique lesson.",
        },
        "checkQuestionId": "q-ip-013",
        "evidenceIds": ["ev-mqsa-magnification-equipment", "ev-mqsa-field-alignment"],
        "review": NEEDS_REVIEW,
    },
    {
        "id": "les-ip-ffdm-dbt",
        "revision": 1,
        "moduleId": "mod-image-production",
        "objectiveId": "obj-ip-acquisition-types",
        "title": "FFDM, DBT, and synthesized 2D",
        "estMinutes": 4,
        "summary": "Compare 2D digital mammography with tomosynthesis using NCI and MQSA modality language.",
        "explanation": [
            {
                "heading": "Modalities named in MQSA",
                "body": "MQSA defines a **mammographic modality** as a breast radiography technology. Examples explicitly include **screen-film**, **full-field digital mammography (FFDM)**, and **digital breast tomosynthesis (DBT)**.",
            },
            {
                "heading": "What DBT adds",
                "body": "NCI describes DBT (3D mammography) as acquiring multiple pictures of thin slices across the breast that software assembles into a 3D picture. DBT **also creates 2D images** like those from standard mammography. Many systems offer a **synthesized 2D** image reconstructed from the tomosynthesis data so a separate 2D exposure may not be needed—follow your unit's cleared workflow.",
            },
            {
                "heading": "What is known vs still studied",
                "body": "NCI states DBT combined with standard mammography finds more tumors than standard mammography alone, but whether DBT reduces deaths more than standard mammography alone is still being studied (for example, the TMIST trial). Teach detection improvement carefully, without claiming proven mortality superiority.",
            },
        ],
        "example": "A facility transitioning every screening exam to DBT still treats DBT as its own modality for MQSA training hours.",
        "misconception": {
            "belief": "DBT replaces 2D entirely and never produces a 2D-looking image.",
            "correction": "NCI notes DBT also creates 2D images; many systems add synthesized 2D from the DBT dataset.",
        },
        "variants": {
            "simpler": "2D digital: one projection image per view. DBT: many thin slices stacked into a 3D set, plus 2D images.",
            "example": "If a patient asks whether 3D \"is proven to save more lives,\" the honest answer is that it finds more cancers in studies, while mortality benefit versus 2D alone is still being researched.",
            "deeper": "For digital modalities, MQSA points QC to programs substantially the same as the manufacturer's (with the phantom dose ceiling still applying). Device-specific tests stay in the ACR manual / manufacturer docs—link-only here.",
        },
        "observationPrompt": "Ask which acquisition modes your unit offers (2D, DBT, synthesized 2D) and how they are labeled on the console.",
        "checkQuestionId": "q-ip-017",
        "evidenceIds": [
            "ev-mqsa-modality-definition",
            "ev-ip-nci-dbt",
            "ev-mqsa-other-modalities-qc",
            "ev-ip-acr-dmqc-link",
        ],
    },
    {
        "id": "les-ip-receptors-displays",
        "revision": 1,
        "moduleId": "mod-image-production",
        "objectiveId": "obj-ip-receptors-monitors",
        "title": "Receptors and the two kinds of workstations",
        "estMinutes": 3,
        "summary": "Separate the detector that captures the image from the monitors used to acquire versus interpret it.",
        "explanation": [
            {
                "heading": "The receptor captures the remnant beam",
                "body": "In digital mammography the **image receptor** (detector) sits in the breast support and converts the remnant x-ray pattern into a digital signal. MQSA still requires a complete mammography unit (generator, control, tube housing, beam-limiting device, supports) around that receptor.",
            },
            {
                "heading": "Acquisition vs interpretation displays",
                "body": "Technologists review images at an **acquisition workstation** to decide whether the exam is complete and adequate. Interpreting physicians use **interpretation workstations** intended for diagnostic review. Brightness, ambient light, and cleanliness matter for both; detailed monitor QC patterns and pass/fail criteria live in the facility's digital QC program (commonly the ACR Digital Mammography QC Manual—link-only in Mammo).",
            },
            {
                "heading": "What not to invent",
                "body": "Pixel pitches, required megapixel counts, and vendor calibration clicks are device-specific. Learn the purpose (detect problems before they affect clinical images) and follow your written QC procedures.",
            },
        ],
        "example": "Approving a noisy or motion-blurred image on a dim acquisition monitor can send a non-diagnostic study to interpretation—even if the detector itself is fine.",
        "misconception": {
            "belief": "If the acquisition monitor looks acceptable, interpretation quality is guaranteed.",
            "correction": "Acquisition and interpretation environments differ; each has QC responsibilities in the digital QC program.",
        },
        "variants": {
            "simpler": "Detector captures. Acquisition screen checks technique. Interpretation screen is for diagnosis. Keep both clean and under QC.",
            "example": "Dust or fingerprints on a monitor can mimic artifacts—clean per procedure before blaming the detector.",
            "deeper": "FDA allows facilities to use the ACR 2018 Digital Mammography QC Manual for 2D and DBT QC. Mammo does not reprint that manual's steps.",
        },
        "checkQuestionId": "q-ip-021",
        "evidenceIds": [
            "ev-mqsa-mammography-unit-definition",
            "ev-mqsa-other-modalities-qc",
            "ev-ip-acr-dmqc-link",
        ],
        "review": NEEDS_REVIEW,
    },
    {
        "id": "les-ip-exposure-factors",
        "revision": 1,
        "moduleId": "mod-image-production",
        "objectiveId": "obj-ip-exposure-factors",
        "title": "Exposure factors without fake rules of thumb",
        "estMinutes": 4,
        "summary": "Predict directional effects of kV and mAs on penetration, contrast, and relative exposure using physics you can source.",
        "explanation": [
            {
                "heading": "Penetration vs contrast",
                "body": "From OpenStax: **higher-energy** photons penetrate more; **lower-energy** x-rays generally give **better contrast** but are attenuated more in thick material. Soft-tissue contrast is inherently subtle—that is why mammography technique is specialized.",
            },
            {
                "heading": "Quantity of x-rays",
                "body": "**mAs** (tube current × time) mainly scales how many electrons strike the anode and therefore how many x-ray photons are produced, affecting receptor exposure and patient dose in the same direction. AEC aims to deliver adequate receptor exposure automatically; manual mode is required to be available under MQSA.",
            },
            {
                "heading": "What the console must show",
                "body": "After AEC exposures, MQSA requires the system to display the **actual kVp and mAs** used (and the target/focal spot actually used when chosen by algorithm). Before exposure, the selected focal spot and target material must be indicated. Read those values—they are part of evaluating the image.",
            },
        ],
        "example": "If an AEC image is underexposed and noisy, check displayed mAs/kVp, compression thickness, and whether the AEC sensor region matched dense tissue—before guessing a magic kV number.",
        "misconception": {
            "belief": "There is one universal mammography kVp that every unit uses for every breast.",
            "correction": "Units differ. Learn directional physics plus your facility charts; do not memorize unsupported universal technique numbers.",
        },
        "variants": {
            "simpler": "More kV: beam punches through easier, contrast usually drops. More mAs: more photons, brighter signal, more dose. Read the post-exposure display.",
            "example": "Diagnostic workups use more images/angles, so NCI notes dose is higher than a screening exam on the same machine—not because kV mysteriously changed by itself.",
            "deeper": "Noise and contrast trade off with exposure. Fixing noise by always raising dose conflicts with ALARA; use adequate exposure, not reflexive overexposure.",
        },
        "worked": {
            "title": "Maximum photon energy from kV",
            "given": "An exposure is made at 28 kV accelerating voltage. What is the maximum energy a photon in that beam can have, using E_max = qeV?",
            "steps": [
                {"step": "Recall that accelerating voltage in kV sets maximum photon energy in keV one-for-one.", "result": "28 kV → 28 keV maximum."},
                {"step": "State what this does not tell you.", "result": "It does not give average beam energy, HVL, or patient dose."},
            ],
            "answer": "28 keV maximum photon energy. Most photons are lower energy.",
            "checkedBy": "Direct application of OpenStax § 30.4 E_max = qeV example pattern; awaiting maintainer source check.",
        },
        "checkQuestionId": "q-ip-025",
        "evidenceIds": [
            "ev-ip-energy-penetration-contrast",
            "ev-ip-emax-kvp",
            "ev-mqsa-technique-display",
            "ev-ip-nci-diagnostic-more-images",
        ],
        "review": NEEDS_REVIEW,
    },
    {
        "id": "les-ip-thickness-target",
        "revision": 1,
        "moduleId": "mod-image-production",
        "objectiveId": "obj-ip-thickness-target-filter",
        "title": "Thickness, target/filter, and what you must verify",
        "estMinutes": 3,
        "summary": "Compressed thickness drives automatic technique; verify displayed target, filter, and focal spot rather than inventing charts.",
        "explanation": [
            {
                "heading": "Thickness is an input to technique",
                "body": "Compressed breast thickness (and composition) strongly influence automatic exposure control. NCI's compression purpose—better pictures—works partly because a thinner, more uniform path improves the remnant beam. Recorded thickness also matters for QC trends.",
            },
            {
                "heading": "Target and filtration are not decorations",
                "body": "Anode material shapes characteristic peaks; filtration removes low-energy photons that would raise patient dose without helping the image. MQSA requires the system to **indicate the selected focal spot and target material before exposure**. After AEC, it must show the technique actually delivered.",
            },
            {
                "heading": "Stay honest about numbers",
                "body": "Vendor-specific pairings (which target/filter for which thickness) belong in manufacturer documentation and your technique chart. Mammo will not invent universal Mo/Rh switch points. If a question asks for a device-specific pairing without a source, treat it as blocked until your facility materials are cited.",
            },
        ],
        "example": "Before exposing, glance at the indicated target and focal spot. After AEC, confirm the displayed kVp/mAs match what you expected for that thickness.",
        "misconception": {
            "belief": "If AEC is on, displayed technique factors can be ignored.",
            "correction": "MQSA requires post-AEC display of actual kVp and mAs so you can evaluate whether the exposure makes sense.",
        },
        "variants": {
            "simpler": "Thicker breast → AEC usually gives more exposure. Check target/focal spot before, kV/mAs after.",
            "example": "A sudden jump in displayed mAs for a thickness that usually needs less is a cue to recheck compression, AEC mode, or implant settings.",
            "deeper": "Focal-spot selection trades sharpness against tube loading. Magnification typically needs the small spot—next lesson.",
        },
        "checkQuestionId": "q-ip-029",
        "evidenceIds": [
            "ev-mqsa-technique-display",
            "ev-ip-nci-compression-purpose",
            "ev-ip-brems-characteristic",
        ],
        "review": NEEDS_REVIEW,
    },
    {
        "id": "les-ip-mag-technique",
        "revision": 1,
        "moduleId": "mod-image-production",
        "objectiveId": "obj-ip-magnification-technique",
        "title": "Magnification technique changes",
        "estMinutes": 3,
        "summary": "Small focal spot, grid out, air gap—and the MQSA magnification factor range.",
        "explanation": [
            {
                "heading": "What changes for magnification",
                "body": "When the breast is raised on a magnification stand:\n\n- **OID increases**, so the projected image enlarges.\n- An **air gap** reduces scatter reaching the detector.\n- The **grid is removed** (MQSA requires the system can operate without it).\n- A **small focal spot** is used to limit geometric blur at the larger OID.",
            },
            {
                "heading": "Required capability",
                "body": "Systems used for magnification must offer **at least one magnification value between 1.4 and 2.0**. Spot compression paddles may be used with magnification for problem-solving, but paddle selection is still constrained by MQSA design rules.",
            },
            {
                "heading": "Dose and time awareness",
                "body": "Magnification views are additional exposures. Keep the clinical indication clear, use ALARA thinking (no non-beneficial extras), and explain briefly to the patient why the extra images help characterize a finding—without quoting unsupported dose multipliers.",
            },
        ],
        "example": "A radiologist requests a mag view of microcalcifications. You select magnification mode (grid out, small focal spot, factor in the allowed range) and re-compress with appropriate collimation.",
        "misconception": {
            "belief": "Magnification is only a post-processing zoom on a contact image.",
            "correction": "True geometric magnification changes acquisition geometry (OID, air gap, grid, focal spot), not merely on-screen zoom.",
        },
        "variants": {
            "simpler": "Raise the breast, take the grid out, use the small focal spot, factor between 1.4 and 2.0.",
            "example": "Zooming a PACS image is not a magnification mammogram.",
            "deeper": "Air-gap scatter cleanup is why removing the grid does not automatically ruin contrast in mag geometry—still verify image quality attributes before the patient leaves.",
        },
        "checkQuestionId": "q-ip-033",
        "evidenceIds": ["ev-mqsa-magnification-equipment", "ev-ip-cdc-alara", "ev-mqsa-compression-device"],
        "review": NEEDS_REVIEW,
    },
    {
        "id": "les-ip-image-quality",
        "revision": 1,
        "moduleId": "mod-image-production",
        "objectiveId": "obj-ip-image-quality-attributes",
        "title": "Eight attributes that define clinical image quality",
        "estMinutes": 3,
        "summary": "Use the accreditation review attributes as your everyday checklist before the patient gets dressed.",
        "explanation": [
            {
                "heading": "The eight attributes",
                "body": "Accreditation clinical image review evaluates:\n\n1. **Positioning** — enough tissue imaged that cancers are not likely missed\n2. **Compression** — reduces overlap and motion\n3. **Exposure level** — not under- or overexposed\n4. **Contrast** — subtle density differences visible\n5. **Sharpness** — margins of normal structures distinct\n6. **Noise** — does not obscure or mimic anatomy\n7. **Artifacts** — nothing external obscures or mimics structures\n8. **Examination identification** — required labels present and readable",
            },
            {
                "heading": "Ongoing expectation",
                "body": "Certified facilities must keep producing images that meet their accreditation body's clinical image quality standards—not only during the every-3-year review submission.",
            },
            {
                "heading": "Patient-related problems",
                "body": "Motion, deodorant/powder artifacts, overlapping skin folds, and devices can fail the artifacts or sharpness attributes. Prevention (clear instructions, skin care product removal, careful positioning) is part of image production, not only \"patient care trivia.\"",
            },
        ],
        "example": "A sharp, well-positioned image with a deodorant speck over the axilla still fails the artifacts attribute and may need a repeat after cleaning the skin.",
        "misconception": {
            "belief": "If labeling is correct, image quality review has nothing left to judge.",
            "correction": "Identification is only one of eight attributes; geometry and radiographic quality still matter.",
        },
        "variants": {
            "simpler": "Ask: tissue in? Held still? Brightness OK? Contrast OK? Sharp? Quiet? Clean? Labeled?",
            "example": "Noise that looks like calcifications is a classic \"mimics structures\" failure.",
            "deeper": "EQUIP asks whether your facility reviews sample images from each technologist between accreditation cycles—the eight attributes are the language of those reviews.",
        },
        "checkQuestionId": "q-ip-037",
        "evidenceIds": [
            "ev-mqsa-clinical-image-attributes",
            "ev-mqsa-clinical-image-quality-standard",
            "ev-mqsa-equip",
        ],
    },
    {
        "id": "les-ip-radiation-concepts",
        "revision": 1,
        "moduleId": "mod-image-production",
        "objectiveId": "obj-pc-typical-dose",
        "title": "Radiation concepts for technologist conversations",
        "estMinutes": 4,
        "summary": "Low-dose framing, LNT conservatism, ALARA, and units—without inventing a typical patient dose number.",
        "explanation": [
            {
                "heading": "What you can say from NCI",
                "body": "NCI describes mammography as using **low-dose x-rays**. Screening and diagnostic exams use the same machines, but diagnostic exams need **more angles**, so dose is higher. Avoid quoting a single \"average mGy\" unless you are reading a sourced facility or physicist figure.",
            },
            {
                "heading": "Risk language from NRC and OpenStax",
                "body": "Ionizing radiation can damage **DNA** and is both a cancer treatment tool and a cancer risk factor at higher doses. For low doses, public health data do not absolutely prove cancer risk below about **100 mSv (10,000 mrem)**, yet radiation protection conservatively uses the **linear no-threshold (LNT)** model: any increase in dose is assumed to increase risk a little. That is a protection philosophy, not a prediction that one mammogram will cause cancer.",
            },
            {
                "heading": "ALARA in the room",
                "body": "CDC's ALARA means **as low as reasonably achievable**—skip exposure that has no benefit. Use **time**, **distance**, and **shielding**. The everyday occupational picture: the technologist steps behind a barrier for the exposure. For patients, ALARA means correct positioning the first time, no casual extras, and clear clinical purpose for repeats or additional views.",
            },
            {
                "heading": "Units worth knowing",
                "body": "**Gray (Gy)** measures absorbed dose (1 Gy = 1 J/kg = 100 rad). **Sievert (Sv)** folds in radiation type (Sv = Gy × RBE). MQSA's phantom average-glandular-dose ceiling is a **QC limit on a phantom**, not a personal dosimeter reading—and it stays in the needs-review bucket for verified assessments.",
            },
        ],
        "example": "Patient: \"Is this a lot of radiation?\" You: \"It's a low-dose breast x-ray exam. We only take the images needed for a clear look, and I stand behind shielding for each exposure. Your report will explain the findings.\"",
        "misconception": {
            "belief": "If risk cannot be proven at mammography doses, ALARA does not apply.",
            "correction": "ALARA and LNT are deliberately conservative: avoid non-beneficial exposure even when the dose is small.",
        },
        "variants": {
            "simpler": "Low-dose x-rays, only what's needed, technologist behind a barrier. We assume less dose is better even when risk is tiny.",
            "example": "Repeating for a fixable deodorant artifact is an ALARA miss and an image-quality miss.",
            "deeper": "Occupational dose limits and facility badge programs are important but are not reproduced here as memorized numbers until a maintainer sources the current regulation text into evidence.",
        },
        "observationPrompt": "Ask where technologists stand during exposure and how your facility documents repeat reasons.",
        "checkQuestionId": "q-ip-041",
        "evidenceIds": [
            "ev-ip-nci-mammogram-low-dose",
            "ev-ip-nci-diagnostic-more-images",
            "ev-ip-ionizing-dna",
            "ev-ip-nrc-lnt",
            "ev-ip-cdc-alara",
            "ev-ip-cdc-tech-barrier",
            "ev-ip-dose-units",
            "ev-mqsa-dose-limit",
        ],
        "review": NEEDS_REVIEW,
    },
]
wjson(MOD / "lessons.json", {"lessons": lessons})

# --------------------------------------------------------------------------- cards
cards = [
    ("card-ip-unit-parts", "obj-ip-unit-components", 20, "Minimum components of a mammography unit under MQSA?", "X-ray generator, x-ray control, tube housing assembly, beam-limiting device, and supporting structures.", ["ev-mqsa-mammography-unit-definition"]),
    ("card-ip-no-general-purpose", "obj-ip-unit-components", 15, "May general-purpose x-ray equipment with mammography attachments be used for mammography?", "No. MQSA prohibits general-purpose or specially modified non-mammography systems.", ["ev-mqsa-prohibited-equipment"]),
    ("card-ip-beam-order", "obj-ip-unit-components", 25, "Order along the beam after the tube housing?", "Beam-limiting device → compression paddle → breast → breast support/image receptor.", ["ev-mqsa-mammography-unit-definition", "ev-mqsa-compression-device"]),
    ("card-ip-brems", "obj-ip-kvp-tube", 20, "What is bremsstrahlung?", "X-rays produced when electrons decelerate in the anode (braking radiation).", ["ev-ip-brems-characteristic"]),
    ("card-ip-characteristic", "obj-ip-kvp-tube", 20, "What are characteristic x-rays?", "Photons emitted when an inner-shell vacancy in an anode atom is filled; energies identify the element.", ["ev-ip-brems-characteristic"]),
    ("card-ip-emax", "obj-ip-kvp-tube", 20, "How is maximum photon energy related to tube voltage?", "E_max equals the electron energy from the accelerating voltage (e.g., 100 kV → 100 keV max).", ["ev-ip-emax-kvp"]),
    ("card-ip-low-e-contrast", "obj-ip-kvp-tube", 20, "Do lower- or higher-energy x-rays generally provide better subject contrast?", "Lower-energy x-rays generally provide better contrast; higher-energy photons penetrate more.", ["ev-ip-energy-penetration-contrast"]),
    ("card-ip-soft-tissue", "obj-ip-kvp-tube", 20, "Why is soft-tissue contrast difficult on radiographs?", "Different soft tissues absorb x-rays very similarly.", ["ev-ip-breast-soft-tissue-contrast"]),
    ("card-ip-paddle-deflect", "obj-ip-paddles-grids", 15, "Maximum flat-paddle deflection from parallel under compression?", "1.0 cm.", ["ev-mqsa-compression-device"]),
    ("card-ip-compression-why", "obj-ip-paddles-grids", 15, "Why press the breast between plates (NCI)?", "Pressing helps get a better x-ray picture of the inside of the breast.", ["ev-ip-nci-compression-purpose"]),
    ("card-ip-mag-range", "obj-ip-geometry", 15, "MQSA magnification factor range that must be available?", "At least one value between 1.4 and 2.0.", ["ev-mqsa-magnification-equipment"]),
    ("card-ip-mag-grid", "obj-ip-magnification-technique", 15, "Grid requirement for magnification systems?", "Must be able to operate with the grid removed.", ["ev-mqsa-magnification-equipment"]),
    ("card-ip-sid-word", "obj-ip-geometry", 15, "What does SID stand for?", "Source-to-image-receptor distance.", ["ev-mqsa-field-alignment"]),
    ("card-ip-modality-examples", "obj-ip-acquisition-types", 20, "Examples of mammographic modalities in MQSA?", "Screen-film, full-field digital mammography (FFDM), and digital breast tomosynthesis (DBT).", ["ev-mqsa-modality-definition"]),
    ("card-ip-dbt-slices", "obj-ip-acquisition-types", 25, "How does DBT create a 3D picture (NCI)?", "Takes multiple thin-slice pictures across the breast; software assembles them into a 3D picture.", ["ev-ip-nci-dbt"]),
    ("card-ip-dbt-2d", "obj-ip-acquisition-types", 15, "Does DBT also create 2D images?", "Yes. NCI states DBT also creates 2D images like standard mammography.", ["ev-ip-nci-dbt"]),
    ("card-ip-dbt-mortality", "obj-ip-acquisition-types", 25, "Is DBT proven to reduce breast-cancer deaths more than standard mammography alone?", "Not established yet; NCI notes this is still being studied (e.g., TMIST).", ["ev-ip-nci-dbt"]),
    ("card-ip-acq-vs-interp", "obj-ip-receptors-monitors", 20, "Acquisition workstation vs interpretation workstation?", "Acquisition: technologist checks completeness/quality. Interpretation: physician diagnostic review.", ["ev-ip-acr-dmqc-link"]),
    ("card-ip-digital-qc-pointer", "obj-ip-receptors-monitors", 20, "Where do detailed digital/DBT QC procedures live for many facilities?", "In the image receptor manufacturer's program / commonly the ACR Digital Mammography QC Manual (link-only).", ["ev-mqsa-other-modalities-qc", "ev-ip-acr-dmqc-link"]),
    ("card-ip-post-aec", "obj-ip-exposure-factors", 20, "After AEC, what technique factors must the system display?", "Actual kVp and mAs used (and target/focal spot when algorithm-selected).", ["ev-mqsa-technique-display"]),
    ("card-ip-manual-mas", "obj-ip-exposure-factors", 15, "Must manual selection of mAs (or mA/time) be available?", "Yes.", ["ev-mqsa-technique-display"]),
    ("card-ip-diagnostic-dose", "obj-ip-exposure-factors", 20, "Why is diagnostic mammography dose higher than screening (NCI)?", "Diagnostic exams require images from more angles.", ["ev-ip-nci-diagnostic-more-images"]),
    ("card-ip-indicate-target", "obj-ip-thickness-target-filter", 15, "What must be indicated before exposure regarding the tube?", "Selected focal spot and target material.", ["ev-mqsa-technique-display"]),
    ("card-ip-mag-trio", "obj-ip-magnification-technique", 25, "Three technique changes typical of geometric magnification?", "Increased OID/air gap, grid removed, small focal spot (with factor 1.4–2.0 available).", ["ev-mqsa-magnification-equipment"]),
    ("card-ip-eight", "obj-ip-image-quality-attributes", 30, "List the eight clinical image review attributes.", "Positioning, compression, exposure level, contrast, sharpness, noise, artifacts, examination identification.", ["ev-mqsa-clinical-image-attributes"]),
    ("card-ip-ongoing-ciq", "obj-ip-image-quality-attributes", 20, "Must clinical images keep meeting accreditation quality standards between reviews?", "Yes. Certified facilities must continue to comply with their AB's clinical image quality standards.", ["ev-mqsa-clinical-image-quality-standard"]),
    ("card-ip-alara", "obj-pc-typical-dose", 20, "What does ALARA stand for, and what are the three measures?", "As low as reasonably achievable; time, distance, and shielding.", ["ev-ip-cdc-alara"]),
    ("card-ip-lnt", "obj-pc-typical-dose", 25, "What is the LNT model (NRC)?", "Linear no-threshold: any increase in dose is assumed to increase cancer risk; used conservatively for protection estimates.", ["ev-ip-nrc-lnt"]),
    ("card-ip-low-dose-words", "obj-pc-typical-dose", 15, "How does NCI describe the x-ray dose level of mammography?", "Low-dose x-rays.", ["ev-ip-nci-mammogram-low-dose"]),
    ("card-ip-dna", "obj-pc-typical-dose", 15, "Primary cellular target of ionizing radiation damage discussed in OpenStax?", "DNA molecules.", ["ev-ip-ionizing-dna"]),
    ("card-ip-gy", "obj-pc-typical-dose", 15, "Define the gray.", "1 Gy = 1 J/kg absorbed dose (= 100 rad).", ["ev-ip-dose-units"]),
    ("card-ip-barrier", "obj-pc-typical-dose", 15, "CDC clinic example of shielding for the technologist?", "Going behind a barrier while making the x-ray exposure.", ["ev-ip-cdc-tech-barrier"]),
    ("card-ip-phantom-dose", "obj-mqsa-equipment-qc", 20, "MQSA phantom average glandular dose limit (single CC of standard-breast phantom)?", "Must not exceed 3.0 mGy (0.3 rad) per exposure.", ["ev-mqsa-dose-limit"]),
    ("card-ip-standard-breast", "obj-mqsa-equipment-qc", 15, "MQSA standard breast definition used with phantom dose?", "4.2 cm compressed; 50% glandular / 50% adipose.", ["ev-mqsa-dose-limit"]),
]

card_objs = []
for cid, oid, sec, prompt, answer, eids in cards:
    obj = {
        "id": cid,
        "revision": 1,
        "objectiveId": oid,
        "estSeconds": sec,
        "prompt": prompt,
        "answer": answer,
        "evidenceIds": eids,
    }
    if cid in {"card-ip-phantom-dose", "card-ip-gy", "card-ip-lnt", "card-ip-diagnostic-dose"}:
        obj["review"] = NEEDS_REVIEW
    card_objs.append(obj)
wjson(MOD / "cards.json", {"cards": card_objs})


print("Base module files ready; questions generated by gen-ip-questions.py")
