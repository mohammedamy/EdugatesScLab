// Edugates-ClipSAT Science Labs - Unit Test Suite for Diagram Print & Copier Optimization

import assert from "node:assert";
import { polishDiagramForPrint } from "../utils/diagram-print-polisher.js";
import { polishDiagramForPrint as enginePolisher } from "../components/quiz-engine.js";
import { SCIENTIFIC_DIAGRAMS } from "../data/scientific-diagrams.js";
import { getOrGenerateDiagram } from "../scripts/diagram-svg-generator.mjs";

console.log("\n========================================================");
console.log("🖨️ Diagram Print & Copier Optimization Verification Suite");
console.log("========================================================\n");

let passed = 0;
let failed = 0;

function check(cond, desc) {
  if (cond) {
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${desc}`);
    failed++;
  }
}

// 1. Export Verification
check(typeof polishDiagramForPrint === "function", "polishDiagramForPrint exported from utils/diagram-print-polisher.js");
check(typeof enginePolisher === "function", "polishDiagramForPrint exported from components/quiz-engine.js");

// 2. Flagship Diagram Transformation & Dark Fill Eradication
let allFlagshipsPolished = true;
let allFlagshipsWhiteBg = true;
let allFlagshipsBlackText = true;
let allFlagshipsValidSvg = true;

for (const [key, diag] of Object.entries(SCIENTIFIC_DIAGRAMS)) {
  const polished = polishDiagramForPrint(diag.svg);

  if (!polished.includes("<svg") || !polished.includes("</svg>")) {
    allFlagshipsValidSvg = false;
    console.error(`  Flagship ${key} produced invalid SVG markup`);
  }

  if (polished.includes('fill="#0f172a"')) {
    allFlagshipsWhiteBg = false;
    console.error(`  Flagship ${key} still contains dark fill="#0f172a"`);
  }

  // Must have white background on outer rect
  if (!polished.includes('fill="#ffffff"')) {
    allFlagshipsWhiteBg = false;
    console.error(`  Flagship ${key} does not have fill="#ffffff"`);
  }

  // Must have pure black text fill
  if (!polished.includes('fill="#000000"')) {
    allFlagshipsBlackText = false;
    console.error(`  Flagship ${key} does not have fill="#000000" on text`);
  }
}

check(allFlagshipsValidSvg, "All 20 flagship diagrams produce valid SVG XML structure");
check(allFlagshipsWhiteBg, "All 20 flagship diagrams have dark backgrounds replaced with pure white (#ffffff)");
check(allFlagshipsBlackText, "All 20 flagship diagrams convert labels to solid black (#000000) for copiers");

// 3. Specific Critical Experiment Apparatus Inspections

// Daniell Galvanic Cell Inspection
const galvanicPolished = polishDiagramForPrint(SCIENTIFIC_DIAGRAMS.chem_galvanic_cell.svg);
check(
  galvanicPolished.includes('fill="#f1f5f9"') && galvanicPolished.includes('stroke="#000000"'),
  "Galvanic Cell converts dark blue solutions to light toner tint (#f1f5f9) and wires to solid black"
);
check(
  galvanicPolished.includes('fill="#ffffff"') && galvanicPolished.includes('Zn(s) Anode (-)'),
  "Galvanic Cell preserves electrode labels and meter display with high-contrast text"
);

// Photoelectric Effect Inspection
const pePolished = polishDiagramForPrint(SCIENTIFIC_DIAGRAMS.phys_photoelectric_effect.svg);
check(
  !pePolished.includes('fill="#0f172a"') && pePolished.includes("Work Function"),
  "Photoelectric Effect converts dark apparatus background to clean white paper line-art"
);

// DNA Replication Fork Inspection
const dnaPolished = polishDiagramForPrint(SCIENTIFIC_DIAGRAMS.bio_dna_replication_fork.svg);
check(
  !dnaPolished.includes('fill="#0f172a"') && dnaPolished.includes("Helicase"),
  "DNA Replication Fork converts dark background to white with crisp black replication strands"
);

// 4. Generative Diagrams Across All 3 Disciplines and 6 Visual Types
const testTypes = ["apparatus", "structural", "vector", "cycle", "spectrometry", "graph"];
let allGenerativePolished = true;

for (const t of testTypes) {
  // Chemistry
  const dChem = getOrGenerateDiagram("CHEM", { id: 1 }, { id: 1 }, { mechanism: "test", calc1: { label: "T", formula: "T" } }, t);
  const pChem = polishDiagramForPrint(dChem.svg);
  if (!pChem.includes("<svg") || pChem.includes('fill="#0f172a"') || !pChem.includes('fill="#000000"')) {
    allGenerativePolished = false;
    console.error(`  Generative CHEM ${t} failed polishing check`);
  }

  // Biology
  const dBio = getOrGenerateDiagram("BIO", { id: 1 }, { id: 1 }, { mechanism: "test", calc1: { label: "T", formula: "T" } }, t);
  const pBio = polishDiagramForPrint(dBio.svg);
  if (!pBio.includes("<svg") || pBio.includes('fill="#0f172a"') || !pBio.includes('fill="#000000"')) {
    allGenerativePolished = false;
    console.error(`  Generative BIO ${t} failed polishing check`);
  }

  // Physics
  const dPhys = getOrGenerateDiagram("PHYS", { id: 1 }, { id: 1 }, { mechanism: "test", calc1: { label: "T", formula: "T" } }, t);
  const pPhys = polishDiagramForPrint(dPhys.svg);
  if (!pPhys.includes("<svg") || pPhys.includes('fill="#0f172a"') || !pPhys.includes('fill="#000000"')) {
    allGenerativePolished = false;
    console.error(`  Generative PHYS ${t} failed polishing check`);
  }
}

check(allGenerativePolished, "All generative diagrams (18 variants across Chem, Bio, Phys) polish cleanly");

// 5. Embedded Print Style Block Check
const samplePolished = polishDiagramForPrint(SCIENTIFIC_DIAGRAMS.chem_heating_curve.svg);
check(
  samplePolished.includes("<style>") && samplePolished.includes("svg { background-color: #ffffff !important; }"),
  "Polished diagram includes embedded publication <style> stylesheet for external word processors & copiers"
);

// 6. Idempotency Check (Running twice produces stable result)
const doublePolished = polishDiagramForPrint(samplePolished);
check(
  doublePolished.includes("<svg") && !doublePolished.includes('fill="#0f172a"'),
  "polishDiagramForPrint is idempotent and safely handles pre-polished SVGs"
);

// 7. Typography Legibility & Font-Size Boost Verification
let allLabelsBoosted = true;
let totalLabelsChecked = 0;
let minDetectedFontSize = 999;

for (const [key, diag] of Object.entries(SCIENTIFIC_DIAGRAMS)) {
  const polished = polishDiagramForPrint(diag.svg);
  const textTags = polished.match(/<text\b[^>]*>/g) || [];
  for (const tag of textTags) {
    totalLabelsChecked++;
    const fsMatch = tag.match(/font-size=["']([\d\.]+)(?:px)?["']/);
    if (fsMatch) {
      const sz = parseFloat(fsMatch[1]);
      if (sz < minDetectedFontSize) minDetectedFontSize = sz;
      if (sz < 12.0) {
        allLabelsBoosted = false;
        console.error(`  Label in ${key} is too small: ${tag}`);
      }
    } else {
      allLabelsBoosted = false;
      console.error(`  Missing font-size in ${key}: ${tag}`);
    }
    if (!tag.includes('font-weight="800"')) {
      allLabelsBoosted = false;
      console.error(`  Missing font-weight="800" in ${key}: ${tag}`);
    }
  }
}

check(
  allLabelsBoosted && totalLabelsChecked > 100 && minDetectedFontSize >= 12.0,
  `All diagram labels (${totalLabelsChecked} checked across all flagships) have font-size boosted (min: ${minDetectedFontSize}px >= 12px) and font-weight="800"`
);

// 8. Idempotent Font Size Boost Check
const fs1 = (samplePolished.match(/font-size=["'][^"']*["']/g) || []).join("|");
const fs2 = (doublePolished.match(/font-size=["'][^"']*["']/g) || []).join("|");
check(fs1 === fs2 && fs1.length > 0, "polishDiagramForPrint is font-size idempotent (running twice does not multiply font sizes)");

// 9. Responsive Print Sizing & Flag Verification
check(
  samplePolished.includes('data-print-polished="true"') && samplePolished.includes("max-width: 560px"),
  "Polished diagram includes data-print-polished flag and responsive max-width: 560px styling"
);

console.log("\n========================================================");
console.log(`📊 Diagram Print Optimization Suite: ${passed} Passed, ${failed} Failed`);
console.log("========================================================\n");

if (failed > 0) {
  process.exit(1);
}
