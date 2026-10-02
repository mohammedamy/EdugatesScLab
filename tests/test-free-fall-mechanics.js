// tests/test-free-fall-mechanics.js
// Automated verification for Free Fall Kinematics, Scientific Formulas, and Lesson Alignment

import { LESSON_INTERACTIVE_REGISTRY } from "../data/lesson-interactive-specs.js";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log("\n========================================================");
console.log("🚀 Free Fall Kinematics & Scientific Models Verification");
console.log("========================================================\n");

// 1. Analytical Kinematics Regression Benchmark
const y0 = 80;
const v0 = 0;
const g = 9.8;

const disc = v0 * v0 + 2 * g * y0;
const tImpact = (v0 + Math.sqrt(disc)) / g;
const vImpact = -Math.sqrt(disc);
const speedImpact = Math.abs(vImpact);

assert(
  Math.abs(tImpact - 4.0406) < 0.01,
  `Dropping from 80 m (v0=0, g=9.8 m/s²) gives t_impact = ${tImpact.toFixed(2)} s (expected approx 4.04 s)`
);

assert(
  Math.abs(speedImpact - 39.598) < 0.05,
  `Dropping from 80 m gives impact speed = ${speedImpact.toFixed(1)} m/s (expected approx 39.6 m/s)`
);

assert(
  vImpact < 0,
  `Free fall impact velocity is signed downwards: v_impact = ${vImpact.toFixed(1)} m/s`
);

// 2. Upward Vertical Launch Kinematics
const y0_up = 20;
const v0_up = 15;
const g_up = 9.8;
const tApex = v0_up / g_up;
const yMax = y0_up + (v0_up * v0_up) / (2 * g_up);
const disc_up = v0_up * v0_up + 2 * g_up * y0_up;
const tImpact_up = (v0_up + Math.sqrt(disc_up)) / g_up;

assert(
  Math.abs(tApex - 1.53) < 0.02,
  `Upward launch (v0=+15 m/s) reaches apex at t = ${tApex.toFixed(2)} s (expected 1.53 s)`
);

assert(
  Math.abs(yMax - 31.48) < 0.05,
  `Upward launch reaches max altitude y_max = ${yMax.toFixed(2)} m (expected 31.48 m)`
);

assert(
  tImpact_up > tApex,
  `Ground impact (t = ${tImpact_up.toFixed(2)} s) occurs strictly after apex`
);

// 3. Lesson Interactive Registry Specifications
const physSpec = LESSON_INTERACTIVE_REGISTRY["PHYS-M03-L3"];
assert(
  physSpec && physSpec.type === "phys-free-fall",
  `PHYS-M03-L3 is mapped to type 'phys-free-fall' (not braking cart 'phys-kinematics-1d')`
);

assert(
  physSpec.defaultParams.y0 === 80 && physSpec.defaultParams.v0 === 0 && physSpec.defaultParams.g === 9.8,
  `PHYS-M03-L3 defaultParams contains y0=80, v0=0, g=9.8 (regression defaults preserved)`
);

const chemAvogadro = LESSON_INTERACTIVE_REGISTRY["CHEM-M09-L1"];
assert(
  chemAvogadro && chemAvogadro.type === "chem-avogadro-workbench",
  `CHEM-M09-L1 is mapped to 'chem-avogadro-workbench'`
);

const chemEmpirical = LESSON_INTERACTIVE_REGISTRY["CHEM-M09-L4"];
assert(
  chemEmpirical && chemEmpirical.type === "chem-empirical-formula",
  `CHEM-M09-L4 is mapped to 'chem-empirical-formula'`
);

const chemHydrate = LESSON_INTERACTIVE_REGISTRY["CHEM-M09-L5"];
assert(
  chemHydrate && chemHydrate.type === "chem-hydrate-dehydration",
  `CHEM-M09-L5 is mapped to 'chem-hydrate-dehydration'`
);

const bioResp = LESSON_INTERACTIVE_REGISTRY["BIO-M08-L3"];
assert(
  bioResp && bioResp.defaultParams.mode === "resp",
  `BIO-M08-L3 initializes with defaultParams mode: 'resp'`
);

assert(
  bioResp.formula.includes("30") && bioResp.formula.includes("32") && bioResp.formula.includes("ATP"),
  `BIO-M08-L3 formula reflects reconciled modern standard 30–32 ATP yield`
);

console.log("\n========================================================");
console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
console.log("========================================================\n");

if (failed > 0) {
  process.exit(1);
}
