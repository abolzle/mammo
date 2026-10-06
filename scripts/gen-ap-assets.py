#!/usr/bin/env python3
"""Write original SVG schematics for anatomy-pathology (not mammograms)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public/assets/anatomy-pathology"
OUT.mkdir(parents=True, exist_ok=True)

CLOCK = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 340" role="img" aria-labelledby="t d">
  <title id="t">Schematic breast quadrants and clock face</title>
  <desc id="d">Two schematic breast outlines labeled Right and Left, each with upper/lower and inner/outer quadrant labels and a simple clock face. Labeled SCHEMATIC — NOT A MAMMOGRAM.</desc>
  <rect width="640" height="340" fill="#fbfaf7"/>
  <text x="320" y="22" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" fill="#0f766e" font-weight="600">SCHEMATIC — NOT A MAMMOGRAM</text>
  <!-- Right breast (viewer left when facing patient) -->
  <ellipse cx="170" cy="175" rx="110" ry="120" fill="#e8eef5" stroke="#193854" stroke-width="2"/>
  <circle cx="170" cy="175" r="10" fill="#193854"/>
  <line x1="170" y1="55" x2="170" y2="295" stroke="#94a3b8" stroke-dasharray="4 3"/>
  <line x1="60" y1="175" x2="280" y2="175" stroke="#94a3b8" stroke-dasharray="4 3"/>
  <!-- Facing patient: outer/lateral toward axilla (outside of page); inner/medial toward midline -->
  <text x="100" y="120" font-family="system-ui,sans-serif" font-size="12" fill="#193854">UOQ</text>
  <text x="210" y="120" font-family="system-ui,sans-serif" font-size="12" fill="#193854">UIQ</text>
  <text x="100" y="240" font-family="system-ui,sans-serif" font-size="12" fill="#193854">LOQ</text>
  <text x="210" y="240" font-family="system-ui,sans-serif" font-size="12" fill="#193854">LIQ</text>
  <text x="170" y="318" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" fill="#193854">Right breast</text>
  <!-- Left breast -->
  <ellipse cx="470" cy="175" rx="110" ry="120" fill="#e8eef5" stroke="#193854" stroke-width="2"/>
  <circle cx="470" cy="175" r="10" fill="#193854"/>
  <line x1="470" y1="55" x2="470" y2="295" stroke="#94a3b8" stroke-dasharray="4 3"/>
  <line x1="360" y1="175" x2="580" y2="175" stroke="#94a3b8" stroke-dasharray="4 3"/>
  <text x="420" y="120" font-family="system-ui,sans-serif" font-size="12" fill="#193854">UIQ</text>
  <text x="510" y="120" font-family="system-ui,sans-serif" font-size="12" fill="#193854">UOQ</text>
  <text x="420" y="240" font-family="system-ui,sans-serif" font-size="12" fill="#193854">LIQ</text>
  <text x="510" y="240" font-family="system-ui,sans-serif" font-size="12" fill="#193854">LOQ</text>
  <text x="470" y="318" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" fill="#193854">Left breast</text>
  <text x="320" y="48" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" fill="#64748b">Quadrant names as SEER ICD-O subsites; clock language overlays the same map</text>
</svg>
"""

DUCTAL = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 300" role="img" aria-labelledby="t d">
  <title id="t">Schematic lobe, lobule, and duct tree</title>
  <desc id="d">Tree-like schematic from nipple pores through ducts to lobules with alveoli bulbs. Labeled SCHEMATIC — NOT A MAMMOGRAM.</desc>
  <rect width="640" height="300" fill="#fbfaf7"/>
  <text x="320" y="22" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" fill="#0f766e" font-weight="600">SCHEMATIC — NOT A MAMMOGRAM</text>
  <circle cx="80" cy="150" r="28" fill="#fde68a" stroke="#193854"/>
  <text x="80" y="155" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" fill="#193854">Nipple</text>
  <path d="M108 150 H180 Q220 150 240 110 T300 80" fill="none" stroke="#193854" stroke-width="3"/>
  <path d="M180 150 Q220 150 240 190 T300 220" fill="none" stroke="#193854" stroke-width="3"/>
  <path d="M180 150 H260" fill="none" stroke="#193854" stroke-width="3"/>
  <g fill="#c7d2fe" stroke="#193854">
    <circle cx="320" cy="70" r="18"/><circle cx="350" cy="55" r="12"/><circle cx="355" cy="85" r="12"/>
    <circle cx="320" cy="150" r="18"/><circle cx="355" cy="140" r="12"/><circle cx="355" cy="170" r="12"/>
    <circle cx="320" cy="230" r="18"/><circle cx="350" cy="215" r="12"/><circle cx="355" cy="245" r="12"/>
  </g>
  <text x="430" y="80" font-family="system-ui,sans-serif" font-size="12" fill="#193854">Lobule / alveoli (milk-making bulbs)</text>
  <text x="430" y="155" font-family="system-ui,sans-serif" font-size="12" fill="#193854">Ducts link lobules to nipple</text>
  <text x="430" y="230" font-family="system-ui,sans-serif" font-size="12" fill="#193854">Fat surrounds glandular tissue</text>
  <text x="320" y="285" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" fill="#64748b">Based on SEER/OpenStax structure — educational outline only</text>
</svg>
"""

DENSITY = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 220" role="img" aria-labelledby="t d">
  <title id="t">Schematic four density categories</title>
  <desc id="d">Four shaded boxes from almost entirely fatty to extremely dense with dense/not-dense patient mapping. Labeled SCHEMATIC — NOT A MAMMOGRAM.</desc>
  <rect width="640" height="220" fill="#fbfaf7"/>
  <text x="320" y="20" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="#0f766e" font-weight="600">SCHEMATIC shading — NOT A MAMMOGRAM</text>
  <g font-family="system-ui,sans-serif" font-size="11" text-anchor="middle">
    <rect x="16" y="36" width="140" height="110" fill="#f8f1e3" stroke="#193854"/>
    <text x="86" y="80" fill="#193854">Almost entirely</text>
    <text x="86" y="96" fill="#193854">fatty</text>
    <text x="86" y="170" fill="#0f766e" font-size="12">Not dense</text>
    <rect x="172" y="36" width="140" height="110" fill="#e7d9b8" stroke="#193854"/>
    <text x="242" y="80" fill="#193854">Scattered</text>
    <text x="242" y="96" fill="#193854">fibroglandular</text>
    <text x="242" y="170" fill="#0f766e" font-size="12">Not dense</text>
    <rect x="328" y="36" width="140" height="110" fill="#c8b089" stroke="#193854"/>
    <text x="398" y="80" fill="#193854">Heterogeneously</text>
    <text x="398" y="96" fill="#193854">dense</text>
    <text x="398" y="170" fill="#9a3412" font-size="12">Dense</text>
    <rect x="484" y="36" width="140" height="110" fill="#8b7355" stroke="#193854"/>
    <text x="554" y="80" fill="#fbfaf7">Extremely</text>
    <text x="554" y="96" fill="#fbfaf7">dense</text>
    <text x="554" y="170" fill="#9a3412" font-size="12">Dense</text>
  </g>
  <text x="320" y="205" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" fill="#64748b">MQSA patient mapping: A–B not dense; C–D dense</text>
</svg>
"""

LYMPH = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 320" role="img" aria-labelledby="t d">
  <title id="t">Schematic regional lymph node groups near the breast</title>
  <desc id="d">Simple torso outline with markers for axillary, infraclavicular, internal mammary, and supraclavicular node regions. Labeled SCHEMATIC — NOT A MAMMOGRAM.</desc>
  <rect width="520" height="320" fill="#fbfaf7"/>
  <text x="260" y="22" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" fill="#0f766e" font-weight="600">SCHEMATIC — NOT A MAMMOGRAM</text>
  <ellipse cx="260" cy="180" rx="90" ry="100" fill="#e8eef5" stroke="#193854" stroke-width="2"/>
  <circle cx="260" cy="150" r="8" fill="#193854"/>
  <circle cx="140" cy="140" r="16" fill="#99f6e4" stroke="#0f766e"/>
  <text x="140" y="144" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#134e4a">Axilla</text>
  <circle cx="200" cy="70" r="14" fill="#99f6e4" stroke="#0f766e"/>
  <text x="200" y="74" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9" fill="#134e4a">Supra-</text>
  <circle cx="320" cy="70" r="14" fill="#99f6e4" stroke="#0f766e"/>
  <text x="320" y="74" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9" fill="#134e4a">Infra-</text>
  <circle cx="300" cy="160" r="12" fill="#fde68a" stroke="#193854"/>
  <text x="300" y="164" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9" fill="#193854">IM</text>
  <text x="260" y="300" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" fill="#64748b">SEER regional groups (axillary, IM, infra/supraclavicular) — locations only</text>
</svg>
"""

INSITU = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 260" role="img" aria-labelledby="t d">
  <title id="t">Schematic in situ versus invasive duct disease</title>
  <desc id="d">Two duct cross-section schematics: abnormal cells confined inside a duct versus cells crossing into surrounding tissue. Labeled SCHEMATIC — NOT A MAMMOGRAM / NOT DIAGNOSTIC.</desc>
  <rect width="640" height="260" fill="#fbfaf7"/>
  <text x="320" y="20" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="#0f766e" font-weight="600">SCHEMATIC — NOT A MAMMOGRAM / NOT DIAGNOSTIC</text>
  <circle cx="160" cy="130" r="70" fill="#fef3c7" stroke="#193854" stroke-width="3"/>
  <circle cx="160" cy="130" r="40" fill="#fca5a5" stroke="#193854"/>
  <text x="160" y="220" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" fill="#193854">In situ: cells stay in place of origin</text>
  <circle cx="480" cy="130" r="70" fill="#fef3c7" stroke="#193854" stroke-width="3" stroke-dasharray="6 4"/>
  <circle cx="480" cy="130" r="40" fill="#fca5a5" stroke="#193854"/>
  <circle cx="430" cy="100" r="14" fill="#ef4444" stroke="#193854"/>
  <circle cx="520" cy="160" r="16" fill="#ef4444" stroke="#193854"/>
  <text x="480" y="220" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" fill="#193854">Invasive: cells leave duct into tissue</text>
  <text x="320" y="248" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" fill="#64748b">Vocabulary schematic from NCI in situ / DCIS / IDC wording — not histology ground truth</text>
</svg>
"""

for name, svg in {
    "clock-quadrants.svg": CLOCK,
    "ductal-lobular.svg": DUCTAL,
    "density-categories.svg": DENSITY,
    "lymph-regions.svg": LYMPH,
    "insitu-vs-invasive.svg": INSITU,
}.items():
    (OUT / name).write_text(svg)
    print("wrote", name)
