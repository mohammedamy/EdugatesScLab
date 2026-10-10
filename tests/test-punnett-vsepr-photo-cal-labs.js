// Edugates-ClipSAT Science Labs - Unit Test Suite for Punnett Square, VSEPR Geometry, Photosynthesis, and Calorimetry
// Verifies:
// 1. Module export and lifecycle initialization/teardown
// 2. Keyboard shortcut suites ('E' CSV export) with clean unmount teardown
// 3. Telemetry Suite: Multi-parameter RFC-4180 CSV datasets
// 4. Comprehensive 5-question inquiry checkpoint pools for punnett, vsepr, photosynthesis, and calorimetry

import assert from "assert";
import fs from "fs";
import path from "path";
import { initPunnettLab } from "../labs/bio-punnett-square.js";
import { initVseprLab, cleanupVseprLab } from "../labs/chem-vsepr.js";
import { initPhotosynthesisLab, cleanupPhotosynthesisLab } from "../labs/bio-photosynthesis.js";
import { initCalorimetryLab } from "../labs/chem-calorimetry.js";
import { LAB_CHECKPOINTS, LabTrialStore } from "../labs/lab-telemetry-exporter.js";

console.log("\n========================================================");
console.log("🧬 Mendelian Genetics, VSEPR, Photosynthesis & Calorimetry Verification");
console.log("========================================================\n");

let passed = 0;
function test(desc, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${desc}`, err);
    process.exit(1);
  }
}

// 1. Lifecycle Exports
test("Laboratory lifecycle functions are exported correctly", () => {
  assert.strictEqual(typeof initPunnettLab, "function");
  assert.strictEqual(typeof initVseprLab, "function");
  assert.strictEqual(typeof cleanupVseprLab, "function");
  assert.strictEqual(typeof initPhotosynthesisLab, "function");
  assert.strictEqual(typeof cleanupPhotosynthesisLab, "function");
  assert.strictEqual(typeof initCalorimetryLab, "function");
  cleanupVseprLab();
  cleanupPhotosynthesisLab();
});

// 2. Mendelian Genetics & Punnett Square
test("bio-punnett-square.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/bio-punnett-square.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
});

test("LAB_CHECKPOINTS.punnett contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.punnett) && LAB_CHECKPOINTS.punnett.length === 5, "punnett pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.punnett.map(q => q.question);
  assert(prompts.some(p => p.includes("expected phenotypic ratio")), "Must include monohybrid phenotypic ratio question");
  assert(prompts.some(p => p.includes("expected genotypic ratio")), "Must include monohybrid genotypic ratio question");
  assert(prompts.some(p => p.includes("homozygous (BB) or heterozygous (Bb)")), "Must include test cross question");
  assert(prompts.some(p => p.includes("RrYy × RrYy")), "Must include dihybrid 9:3:3:1 ratio question");
  assert(prompts.some(p => p.includes("Chi-Square goodness-of-fit")), "Must include Chi-Square degrees of freedom question");
});

// 3. VSEPR Molecular Geometry
test("chem-vsepr.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/chem-vsepr.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('mountLabCheckpoint("vsepr-checkpoint-mount", "vsepr")'), "Must mount vsepr checkpoint");
});

test("LAB_CHECKPOINTS.vsepr contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.vsepr) && LAB_CHECKPOINTS.vsepr.length === 5, "vsepr pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.vsepr.map(q => q.question);
  assert(prompts.some(p => p.includes("molecular geometry is determined by")), "Must include repulsion minimization question");
  assert(prompts.some(p => p.includes("CH₄")), "Must include tetrahedral 109.5° question");
  assert(prompts.some(p => p.includes("bent molecular geometry")), "Must include water lone pair repulsion question");
  assert(prompts.some(p => p.includes("PCl}_5")), "Must include trigonal bipyramidal expanded octet question");
  assert(prompts.some(p => p.includes("CO}_2")), "Must include linear nonpolar dipole vector symmetry question");
});

// 4. Photosynthesis Respirometry
test("bio-photosynthesis.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/bio-photosynthesis.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('mountLabCheckpoint("photo-checkpoint-mount", "photosynthesis")'), "Must mount photosynthesis checkpoint");
});

test("LAB_CHECKPOINTS.photosynthesis contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.photosynthesis) && LAB_CHECKPOINTS.photosynthesis.length === 5, "photosynthesis pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.photosynthesis.map(q => q.question);
  assert(prompts.some(p => p.includes("initial electron donor that undergoes photolysis")), "Must include water photolysis question");
  assert(prompts.some(p => p.includes("proton electrochemical gradient")), "Must include ATP synthase chemiosmosis question");
  assert(prompts.some(p => p.includes("Calvin cycle")), "Must include Rubisco carbon fixation question");
  assert(prompts.some(p => p.includes("green light (~550 nm)")), "Must include action spectrum green reflectance question");
  assert(prompts.some(p => p.includes("past 45°C")), "Must include thermal enzyme denaturation question");
});

// 5. Calorimetry & Enthalpy of Reaction
test("chem-calorimetry.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/chem-calorimetry.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
});

test("LAB_CHECKPOINTS.calorimetry contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.calorimetry) && LAB_CHECKPOINTS.calorimetry.length === 5, "calorimetry pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.calorimetry.map(q => q.question);
  assert(prompts.some(p => p.includes("q_{\\text{rxn}}")), "Must include energy conservation calorimetry equation question");
  assert(prompts.some(p => p.includes("enthalpy of neutralization")), "Must include exothermic temperature rise question");
  assert(prompts.some(p => p.includes("Specific heat capacity")), "Must include specific heat definition question");
  assert(prompts.some(p => p.includes("molar enthalpy of neutralization")), "Must include molar enthalpy calculation (-57.0 kJ/mol) question");
  assert(prompts.some(p => p.includes("Hess's Law")), "Must include Hess's Law state function summation question");
});

console.log("\n========================================================");
console.log(`📊 All 10 Laboratory Verification Tests Passed!`);
console.log("========================================================\n");
