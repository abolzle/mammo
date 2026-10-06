#!/usr/bin/env python3
"""Write SVG assets and module coverage.json for image-production."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public/assets/image-production"
MOD = ROOT / "content/modules/image-production"
ASSETS.mkdir(parents=True, exist_ok=True)

(ASSETS / "beam-path.svg").write_text(
    """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 420" role="img" aria-labelledby="t d">
  <title id="t">Beam path through a mammography unit</title>
  <desc id="d">Schematic side view from tube housing at top through beam-limiting device, compression paddle, breast, and breast support with image receptor. Not to scale.</desc>
  <rect width="320" height="420" fill="#fbfaf7"/>
  <rect x="24" y="16" width="28" height="390" rx="6" fill="#cbd5e1"/>
  <rect x="52" y="48" width="36" height="300" fill="#e2e8f0"/>
  <rect x="108" y="28" width="110" height="58" rx="10" fill="#1e3a5f"/>
  <text x="163" y="62" fill="#f8fafc" font-size="11" font-family="system-ui,sans-serif" text-anchor="middle">Tube</text>
  <rect x="138" y="96" width="50" height="26" rx="3" fill="#2f6f73"/>
  <path d="M163 122 L110 305 L216 305 Z" fill="#14b8a6" opacity="0.12"/>
  <rect x="90" y="238" width="150" height="10" rx="2" fill="#5eead4" stroke="#0f766e" stroke-width="2"/>
  <path d="M96 248 L96 300 L200 300 C 224 290, 226 260, 204 248 Z" fill="#f1d9c7" stroke="#9a6b4f" stroke-width="1.5"/>
  <rect x="80" y="302" width="170" height="28" rx="3" fill="#475569"/>
  <text x="165" y="320" fill="#f8fafc" font-size="10" font-family="system-ui,sans-serif" text-anchor="middle">Receptor</text>
  <line x1="163" y1="86" x2="163" y2="302" stroke="#0f766e" stroke-width="1" stroke-dasharray="4 4"/>
  <text x="300" y="408" fill="#334155" font-size="11" font-family="system-ui,sans-serif" text-anchor="end">SCHEMATIC — NOT TO SCALE</text>
</svg>
"""
)

(ASSETS / "dbt-slices.svg").write_text(
    """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 280" role="img" aria-labelledby="t d">
  <title id="t">DBT acquisition as thin slices</title>
  <desc id="d">Schematic tube arc above a compressed breast with stacked reconstructed slice planes. Not a mammogram.</desc>
  <rect width="560" height="280" fill="#fbfaf7"/>
  <path d="M60 90 Q 180 20 300 90" fill="none" stroke="#1e3a5f" stroke-width="3"/>
  <circle cx="60" cy="90" r="10" fill="#2f6f73"/>
  <circle cx="180" cy="36" r="10" fill="#2f6f73"/>
  <circle cx="300" cy="90" r="10" fill="#2f6f73"/>
  <text x="180" y="22" fill="#334155" font-size="12" font-family="system-ui,sans-serif" text-anchor="middle">Tube positions</text>
  <rect x="220" y="120" width="200" height="12" rx="2" fill="#5eead4" stroke="#0f766e"/>
  <ellipse cx="320" cy="175" rx="90" ry="45" fill="#f1d9c7" stroke="#9a6b4f"/>
  <line x1="250" y1="150" x2="390" y2="150" stroke="#0f766e" stroke-width="2"/>
  <line x1="245" y1="165" x2="395" y2="165" stroke="#0f766e" stroke-width="2"/>
  <line x1="242" y1="180" x2="398" y2="180" stroke="#0f766e" stroke-width="2"/>
  <line x1="248" y1="195" x2="392" y2="195" stroke="#0f766e" stroke-width="2"/>
  <rect x="230" y="220" width="180" height="22" rx="3" fill="#475569"/>
  <text x="420" y="175" fill="#134e4a" font-size="12" font-family="system-ui,sans-serif">Thin slices</text>
  <text x="540" y="268" fill="#334155" font-size="11" font-family="system-ui,sans-serif" text-anchor="end">SCHEMATIC — NOT A MAMMOGRAM</text>
</svg>
"""
)

(ASSETS / "alara-triad.svg").write_text(
    """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 220" role="img" aria-labelledby="t d">
  <title id="t">ALARA: time, distance, shielding</title>
  <desc id="d">Three panels for minimize time, maximize distance, and place shielding.</desc>
  <rect width="600" height="220" fill="#fbfaf7"/>
  <text x="300" y="22" fill="#1e3a5f" font-size="14" font-family="system-ui,sans-serif" text-anchor="middle">ALARA protective measures</text>
  <rect x="20" y="40" width="170" height="150" rx="8" fill="#ffffff" stroke="#94a3b8"/>
  <rect x="215" y="40" width="170" height="150" rx="8" fill="#ffffff" stroke="#94a3b8"/>
  <rect x="410" y="40" width="170" height="150" rx="8" fill="#ffffff" stroke="#94a3b8"/>
  <text x="105" y="68" fill="#0f766e" font-size="16" font-family="system-ui,sans-serif" text-anchor="middle">Time</text>
  <text x="105" y="100" fill="#334155" font-size="12" font-family="system-ui,sans-serif" text-anchor="middle">Minimize stay</text>
  <circle cx="105" cy="145" r="22" fill="#ccfbf1" stroke="#0f766e"/>
  <circle cx="105" cy="145" r="14" fill="none" stroke="#134e4a" stroke-width="2"/>
  <line x1="105" y1="145" x2="105" y2="134" stroke="#134e4a" stroke-width="2"/>
  <line x1="105" y1="145" x2="114" y2="145" stroke="#134e4a" stroke-width="2"/>
  <text x="300" y="68" fill="#0f766e" font-size="16" font-family="system-ui,sans-serif" text-anchor="middle">Distance</text>
  <text x="300" y="100" fill="#334155" font-size="12" font-family="system-ui,sans-serif" text-anchor="middle">Stand farther</text>
  <line x1="255" y1="145" x2="345" y2="145" stroke="#0f766e" stroke-width="3" marker-end="url(#arrow)"/>
  <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#0f766e"/></marker></defs>
  <text x="495" y="68" fill="#0f766e" font-size="16" font-family="system-ui,sans-serif" text-anchor="middle">Shielding</text>
  <text x="495" y="100" fill="#334155" font-size="12" font-family="system-ui,sans-serif" text-anchor="middle">Use a barrier</text>
  <rect x="455" y="120" width="18" height="50" fill="#1e3a5f"/>
  <circle cx="520" cy="145" r="16" fill="#ccfbf1" stroke="#0f766e"/>
</svg>
"""
)

(ASSETS / "geometry-mag.svg").write_text(
    """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 300" role="img" aria-labelledby="t d">
  <title id="t">Contact versus magnification geometry</title>
  <desc id="d">Left: contact geometry with breast on receptor. Right: magnification with air gap. Not to scale.</desc>
  <rect width="560" height="300" fill="#fbfaf7"/>
  <text x="140" y="28" fill="#1e3a5f" font-size="13" font-family="system-ui,sans-serif" text-anchor="middle">Contact</text>
  <text x="420" y="28" fill="#1e3a5f" font-size="13" font-family="system-ui,sans-serif" text-anchor="middle">Magnification</text>
  <rect x="90" y="50" width="40" height="24" rx="4" fill="#1e3a5f"/>
  <rect x="70" y="160" width="100" height="10" fill="#5eead4" stroke="#0f766e"/>
  <ellipse cx="120" cy="185" rx="40" ry="18" fill="#f1d9c7" stroke="#9a6b4f"/>
  <rect x="70" y="205" width="100" height="18" fill="#475569"/>
  <text x="120" y="250" fill="#334155" font-size="11" font-family="system-ui,sans-serif" text-anchor="middle">Breast on receptor</text>
  <rect x="370" y="50" width="40" height="24" rx="4" fill="#1e3a5f"/>
  <rect x="350" y="130" width="100" height="10" fill="#5eead4" stroke="#0f766e"/>
  <ellipse cx="400" cy="155" rx="40" ry="18" fill="#f1d9c7" stroke="#9a6b4f"/>
  <rect x="360" y="175" width="80" height="12" fill="#94a3b8"/>
  <text x="400" y="192" fill="#0f766e" font-size="10" font-family="system-ui,sans-serif" text-anchor="middle">air gap</text>
  <rect x="350" y="220" width="100" height="18" fill="#475569"/>
  <text x="400" y="260" fill="#334155" font-size="11" font-family="system-ui,sans-serif" text-anchor="middle">Raised platform</text>
  <text x="540" y="290" fill="#334155" font-size="11" font-family="system-ui,sans-serif" text-anchor="end">SCHEMATIC — NOT TO SCALE</text>
</svg>
"""
)

(ASSETS / "eight-attributes.svg").write_text(
    """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 240" role="img" aria-labelledby="t d">
  <title id="t">Eight clinical image quality attributes</title>
  <desc id="d">Eight boxes: positioning, compression, exposure level, contrast, sharpness, noise, artifacts, examination identification.</desc>
  <rect width="640" height="240" fill="#fbfaf7"/>
  <text x="320" y="24" fill="#1e3a5f" font-size="14" font-family="system-ui,sans-serif" text-anchor="middle">Clinical image review attributes</text>
"""
    + "".join(
        f'<rect x="{(i%4)*155+20}" y="{(i//4)*90+45}" width="145" height="75" rx="8" fill="#ffffff" stroke="#2f6f73"/>'
        f'<text x="{(i%4)*155+92}" y="{(i//4)*90+88}" fill="#134e4a" font-size="12" font-family="system-ui,sans-serif" text-anchor="middle">{label}</text>'
        for i, label in enumerate(
            [
                "Positioning",
                "Compression",
                "Exposure level",
                "Contrast",
                "Sharpness",
                "Noise",
                "Artifacts",
                "Exam ID",
            ]
        )
    )
    + "\n</svg>\n"
)

# coverage matrix local to module (avoid rewriting shared curriculum.json)
lessons = json.loads((MOD / "lessons.json").read_text())["lessons"] if (MOD / "lessons.json").exists() else []
questions = json.loads((MOD / "questions.json").read_text())["questions"] if (MOD / "questions.json").exists() else []
cards = json.loads((MOD / "cards.json").read_text())["cards"] if (MOD / "cards.json").exists() else []
module = json.loads((MOD / "module.json").read_text()) if (MOD / "module.json").exists() else {"visuals": []}

obj_ids = sorted(
    {
        *(l["objectiveId"] for l in lessons),
        *(c["objectiveId"] for c in cards),
        *(oid for q in questions for oid in q["objectiveIds"]),
        *(v.get("objectiveId") for v in module.get("visuals", [])),
    }
)

rows = []
for oid in obj_ids:
    les = [l["id"] for l in lessons if l["objectiveId"] == oid]
    qs = [q["id"] for q in questions if oid in q["objectiveIds"]]
    cds = [c["id"] for c in cards if c["objectiveId"] == oid]
    vis = [v["id"] for v in module.get("visuals", []) if v.get("objectiveId") == oid]
    gap = not (les and qs and cds)
    rows.append(
        {
            "objectiveId": oid,
            "lessonIds": les,
            "questionIds": qs,
            "cardIds": cds,
            "visualIds": vis,
            "gap": gap,
            "notes": "Dose/QC numeric items remain needs-review; ACR DMQC is link-only."
            if oid
            in {
                "obj-pc-typical-dose",
                "obj-mqsa-equipment-qc",
                "obj-ip-receptors-monitors",
                "obj-ip-kvp-tube",
                "obj-ip-exposure-factors",
                "obj-ip-thickness-target-filter",
                "obj-ip-magnification-technique",
                "obj-ip-geometry",
            }
            else "",
        }
    )

coverage = {
    "moduleId": "mod-image-production",
    "version": "1.0.0-beta.1",
    "assembledForCurriculumVersion": "2026-10-06.1",
    "note": "Module-local coverage to avoid conflicting edits to shared curriculum.json. Topic moduleId pointers in curriculum may still list mod-mqsa for overlapping topics.",
    "counts": {
        "lessons": len(lessons),
        "questions": len(questions),
        "cards": len(cards),
        "visuals": len(module.get("visuals", [])),
        "objectivesTouched": len(obj_ids),
        "rowsWithGap": sum(1 for r in rows if r["gap"]),
    },
    "blockedOrNeedsReview": [
        {
            "objectiveId": "obj-ip-informatics",
            "state": "not_in_this_module",
            "note": "No open sourced evidence packet yet.",
        },
        {
            "objectiveId": "obj-ip-cad",
            "state": "not_in_this_module",
            "note": "No open sourced evidence packet yet.",
        },
        {
            "objectiveId": "obj-qc-phantom",
            "state": "excluded_device_qc",
            "note": "Device-specific QC stays out; see ACR DMQC link-only source.",
            "sourceIds": ["src-acr-dmqc-manual"],
        },
        {
            "objectiveId": "obj-mqsa-equipment-qc",
            "state": "partial_needs_review",
            "note": "Phantom dose limit taught as QC concept with requiresQualifiedReview; not verified-pool ready.",
        },
    ],
    "rows": rows,
}
(MOD / "coverage.json").write_text(json.dumps(coverage, indent=2, ensure_ascii=False) + "\n")
print("Wrote SVGs and coverage.json")
