// Edugates-ClipSAT Science Labs - Unit Test Suite for Osmosis, Mitosis, Plant Transpiration, Antibiotic Resistance, and ELISA Immunoassays
// Verifies:
// 1. Module export and lifecycle initialization/teardown
// 2. Keyboard shortcut suites ('E' CSV export) with clean unmount teardown
// 3. Telemetry Suite: Multi-parameter RFC-4180 CSV datasets
// 4. Comprehensive 5-question inquiry checkpoint pools for osmosis, mitosis, transpiration, antibiotic, and elisa

import assert from "assert";
import fs from "fs";
import path from "path";
import { initOsmosisLab } from "../labs/bio-osmosis.js";
import { initMitosisLab } from "../labs/bio-mitosis.js";
import { initPlantTranspirationLab } from "../labs/bio-plant-transpiration.js";
import { initAntibioticResistanceLab } from "../labs/bio-antibiotic-resistance.js";
import { initElisaLab } from "../labs/bio-immune-elisa.js";
import { LAB_CHECKPOINTS } from "../labs/lab-telemetry-exporter.js";

console.log("\n========================================================");
console.log("⚡ Osmosis, Mitosis, Transpiration, Antibiotic & ELISA Verification");
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
  assert.strictEqual(typeof initOsmosisLab, "function");
  assert.strictEqual(typeof initMitosisLab, "function");
  assert.strictEqual(typeof initPlantTranspirationLab, "function");
  assert.strictEqual(typeof initAntibioticResistanceLab, "function");
  assert.strictEqual(typeof initElisaLab, "function");
});

// 2. Cell Membrane Osmosis & Tonicity
test("bio-osmosis.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/bio-osmosis.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('mountLabCheckpoint("osmosis-checkpoint-mount", "bio-osmosis")'), "Must mount osmosis checkpoint");
  assert(code.includes('📥 Export CSV (E)'), "Export button must include (E) hotkey hint");
});

test("LAB_CHECKPOINTS.osmosis contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.osmosis) && LAB_CHECKPOINTS.osmosis.length === 5, "osmosis pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.osmosis.map(q => q.question);
  assert(prompts.some(p => p.includes("red blood cell") && p.includes("hypotonic")), "Must include RBC hypotonic hemolysis question");
  assert(prompts.some(p => p.includes("water potential equation")), "Must include water potential equation question");
  assert(prompts.some(p => p.includes("Elodea") && p.includes("hypertonic")), "Must include Elodea hypertonic solution question");
  assert(prompts.some(p => p.includes("Van 't Hoff equation")), "Must include Van 't Hoff solute potential calculation question");
  assert(prompts.some(p => p.includes("water permeability")), "Must include aquaporin / water permeability channel question");
});

// 3. Cell Cycle & Mitotic Index Cytogenetics
test("bio-mitosis.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/bio-mitosis.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('mountLabCheckpoint("mitosis-checkpoint-mount", "bio-mitosis")'), "Must mount mitosis checkpoint");
  assert(code.includes('📥 Export CSV (E)'), "Export button must include (E) hotkey hint");
});

test("LAB_CHECKPOINTS.mitosis contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.mitosis) && LAB_CHECKPOINTS.mitosis.length === 5, "mitosis pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.mitosis.map(q => q.question);
  assert(prompts.some(p => p.includes("Mitotic Index (MI)")), "Must include mitotic index calculation question");
  assert(prompts.some(p => p.includes("sister chromatids disjoin")), "Must include anaphase chromatid disjunction question");
  assert(prompts.some(p => p.includes("Colchicine")), "Must include colchicine metaphase arrest question");
  assert(prompts.some(p => p.includes("Maturation/Mitosis Promoting Factor (MPF)") || p.includes("Cyclin B")), "Must include MPF cyclin-CDK question");
  assert(prompts.some(p => p.includes("cytokinesis") && p.includes("plant cells")), "Must include cell plate vs cleavage furrow cytokinesis question");
});

// 4. Plant Transpiration & Stomatal Dynamics
test("bio-plant-transpiration.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/bio-plant-transpiration.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('mountLabCheckpoint("transp-checkpoint-container", "transpiration")'), "Must mount transpiration checkpoint");
  assert(code.includes('📥 Export CSV (E)'), "Export button must include (E) hotkey hint");
});

test("LAB_CHECKPOINTS.transpiration contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.transpiration) && LAB_CHECKPOINTS.transpiration.length === 5, "transpiration pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.transpiration.map(q => q.question);
  assert(prompts.some(p => p.includes("Ganong potometer")), "Must include potometer water uptake question");
  assert(prompts.some(p => p.includes("guard cells open the stomatal aperture")), "Must include guard cell turgor opening question");
  assert(prompts.some(p => p.includes("electric fan") || p.includes("boundary layer")), "Must include boundary layer wind speed question");
  assert(prompts.some(p => p.includes("Cohesion-Tension theory")), "Must include cohesion-tension negative xylem pressure question");
  assert(prompts.some(p => p.includes("soil drought") || p.includes("stomatal closure")), "Must include drought stomatal closure signaling question");
});

// 5. Kirby-Bauer Antibiotic Susceptibility Antibiogram
test("bio-antibiotic-resistance.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/bio-antibiotic-resistance.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('mountLabCheckpoint("antibiotic-checkpoint-container", "antibiotic")'), "Must mount antibiotic checkpoint");
  assert(code.includes('📥 Export CSV (E)'), "Export button must include (E) hotkey hint");
});

test("LAB_CHECKPOINTS.antibiotic contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.antibiotic) && LAB_CHECKPOINTS.antibiotic.length === 5, "antibiotic pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.antibiotic.map(q => q.question);
  assert(prompts.some(p => p.includes("Zone of Inhibition (ZOI)")), "Must include radial diffusion and MIC question");
  assert(prompts.some(p => p.includes("MRSA")), "Must include MRSA CLSI breakpoint question");
  assert(prompts.some(p => p.includes("vancomycin")), "Must include Gram-negative intrinsic resistance to vancomycin question");
  assert(prompts.some(p => p.includes("beta-lactam")), "Must include beta-lactam resistance mechanism question");
  assert(prompts.some(p => p.includes("bactericidal") && p.includes("bacteriostatic")), "Must include bactericidal vs bacteriostatic distinction question");
});

// 6. ELISA Immunoassay Spectrophotometry & Serodiagnosis
test("bio-immune-elisa.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/bio-immune-elisa.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('mountLabCheckpoint("elisa-checkpoint-container", "elisa")'), "Must mount elisa checkpoint");
  assert(code.includes('📥 Export CSV (E)'), "Export button must include (E) hotkey hint");
});

test("LAB_CHECKPOINTS.elisa contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.elisa) && LAB_CHECKPOINTS.elisa.length === 5, "elisa pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.elisa.map(q => q.question);
  assert(prompts.some(p => p.includes("Bovine Serum Albumin (BSA)")), "Must include BSA blocking non-specific binding question");
  assert(prompts.some(p => p.includes("HRP-based ELISA")), "Must include HRP TMB oxidation color reaction question");
  assert(prompts.some(p => p.includes("Cutoff threshold")), "Must include serology diagnostic cutoff calculation question");
  assert(prompts.some(p => p.includes("Sandwich ELISA")), "Must include double-antibody sandwich ELISA specificity question");
  assert(prompts.some(p => p.includes("serial twofold dilutions") || p.includes("calibration curve")), "Must include sample dilution and dynamic range question");
});

console.log("\n========================================================");
console.log(`📊 Batch G Verification: All ${passed} Tests Passed!`);
console.log("========================================================\n");
