// Edugates-ClipSAT Science Labs - Unit Test Suite: Diagram Uniqueness & Typography Readability
import { getQuestionDiagramKey, deduplicateQuestions } from "../components/quiz-engine.js";
import { polishDiagramForPrint } from "../utils/diagram-print-polisher.js";
import { SCIENTIFIC_DIAGRAMS } from "../data/scientific-diagrams.js";

let passedCount = 0;
let failedCount = 0;

function check(condition, desc) {
  if (condition) {
    console.log(`  ✅ PASS: ${desc}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${desc}`);
    failedCount++;
  }
}

console.log("========================================================");
console.log("🧬 Diagram Uniqueness & Typography Readability Test Suite");
console.log("========================================================");

// 1. Diagram Key Extraction
const qWithId = {
  id: "Q1",
  question: "What is phase change B-C?",
  diagram: { id: "chem_heating_curve", caption: "Figure 1: Heating Curve" }
};
const qWithCaptionOnly = {
  id: "Q2",
  question: "What is the cell membrane?",
  diagram: { caption: "Cell Structure Model", svg: "<svg><text>Membrane</text></svg>" }
};
const qWithSvgOnly = {
  id: "Q3",
  question: "Analyze circuit",
  diagram: { svg: "<svg viewBox='0 0 100 100'><line x1='0' y1='0' x2='100' y2='100'/></svg>" }
};
const qNoDiagram = {
  id: "Q4",
  question: "What is molar mass of H2O?",
  diagram: null
};

check(getQuestionDiagramKey(qWithId) === "diag_id:chem_heating_curve", "getQuestionDiagramKey extracts diagram ID key correctly");
check(getQuestionDiagramKey(qWithCaptionOnly) === "diag_cap:cell structure model", "getQuestionDiagramKey extracts caption fallback key correctly");
check(typeof getQuestionDiagramKey(qWithSvgOnly) === "string" && getQuestionDiagramKey(qWithSvgOnly).startsWith("diag_svg:"), "getQuestionDiagramKey computes SVG fingerprint fallback");
check(getQuestionDiagramKey(qNoDiagram) === null, "getQuestionDiagramKey returns null for questions without diagram");

// 2. Deduplication with uniqueDiagrams: true
const duplicateDiagramQuestions = [
  { id: "Q1", question: "Melting point?", diagram: { id: "chem_heating_curve", caption: "Figure 1: Heating Curve" } },
  { id: "Q2", question: "Boiling point?", diagram: { id: "chem_heating_curve", caption: "Figure 1: Heating Curve" } },
  { id: "Q3", question: "Specific heat capacity?", diagram: { id: "chem_heating_curve", caption: "Figure 1: Heating Curve" } },
  { id: "Q4", question: "Galvanic anode?", diagram: { id: "chem_galvanic_cell", caption: "Figure 2: Galvanic Cell" } },
  { id: "Q5", question: "Standard cell potential?", diagram: { id: "chem_galvanic_cell", caption: "Figure 2: Galvanic Cell" } },
  { id: "Q6", question: "Solve stoichiometry", diagram: null },
  { id: "Q7", question: "Balance redox equation", diagram: null }
];

const dedupedDefault = deduplicateQuestions(duplicateDiagramQuestions);
check(dedupedDefault.length === 7, "Default deduplication preserves different questions sharing diagrams");

const dedupedUniqueDiagrams = deduplicateQuestions(duplicateDiagramQuestions, { uniqueDiagrams: true });
check(dedupedUniqueDiagrams.length === 4, "uniqueDiagrams: true filters out repeating diagrams (1 heating curve + 1 galvanic + 2 non-diagram questions)");

const diagramKeysInDeduped = dedupedUniqueDiagrams
  .map(q => getQuestionDiagramKey(q))
  .filter(Boolean);
const uniqueKeys = new Set(diagramKeysInDeduped);
check(diagramKeysInDeduped.length === uniqueKeys.size, "All diagrams in result set have strictly unique keys with zero repeats");

// 3. Typography Contrast & Readability Verification
const heatingCurvePolished = polishDiagramForPrint(SCIENTIFIC_DIAGRAMS.chem_heating_curve.svg);
check(heatingCurvePolished.includes('stroke="#ffffff"'), "Polished diagram text includes protective white halo stroke");
check(heatingCurvePolished.includes('stroke-width="2.5px"'), "Polished diagram text has calibrated 2.5px stroke width");
check(heatingCurvePolished.includes('paint-order="stroke fill"'), "Polished diagram text uses paint-order: stroke fill for crisp black letterforms");
check(heatingCurvePolished.includes('fill="#000000"'), "Polished diagram text has solid jet black fill for copiers");

// Check font size bounds across flagship diagrams
let textCount = 0;
let allFontSizesReadable = true;
let noInflatedOverlappingFonts = true;

for (const key of Object.keys(SCIENTIFIC_DIAGRAMS)) {
  const d = SCIENTIFIC_DIAGRAMS[key];
  const polished = polishDiagramForPrint(d.svg);
  const fontMatches = polished.matchAll(/font-size="([\d\.]+)px"/g);
  for (const m of fontMatches) {
    textCount++;
    const fs = parseFloat(m[1]);
    if (fs < 12) allFontSizesReadable = false;
    if (fs > 16.5) noInflatedOverlappingFonts = false;
  }
}

check(textCount > 200, `Analyzed ${textCount} text elements across all scientific diagrams`);
check(allFontSizesReadable, "All diagram text font-sizes are at least 12px for high legibility");
check(noInflatedOverlappingFonts, "All diagram text font-sizes are capped (<= 16.5px) to prevent collisions and overlap");

console.log("========================================================");
console.log(`📊 Test Results: ${passedCount} Passed, ${failedCount} Failed`);
console.log("========================================================");

if (failedCount > 0) {
  process.exit(1);
}
