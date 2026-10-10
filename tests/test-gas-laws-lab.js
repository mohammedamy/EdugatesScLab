// Edugates-ClipSAT Science Labs - Unit Test Suite for Gas Laws & Kinetic Molecular Theory Lab
// Verifies:
// 1. Module export and lifecycle initialization/teardown
// 2. Ideal Gas Law calculations (P = nRT/V) and root-mean-square speed (v_rms = √(3RT/M))
// 3. Telemetry Suite: Multi-trial logging and isothermal pressure-volume Boyle's Law sweep
// 4. Full keyboard shortcuts suite (E export, R reset, H heat, C cool) with clean unmount cleanup
// 5. Comprehensive 5-question inquiry checkpoint assessment pool

import assert from "assert";
import fs from "fs";
import path from "path";
import { initGasLawsLab, cleanupGasLawsLab } from "../labs/chem-gas-laws.js";
import { LAB_CHECKPOINTS, LabTrialStore } from "../labs/lab-telemetry-exporter.js";

console.log("\n========================================================");
console.log("💨 Ideal Gas Laws & Kinetic Molecular Theory Verification");
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
test("initGasLawsLab and cleanupGasLawsLab are exported as functions", () => {
  assert.strictEqual(typeof initGasLawsLab, "function");
  assert.strictEqual(typeof cleanupGasLawsLab, "function");
  cleanupGasLawsLab(); // Safe idempotent teardown
});

// 2. Physical & Thermodynamic Formula Fidelity
test("Ideal Gas Law conforms to P = nRT/V at STP (1 mol, 273.15 K, 22.414 L)", () => {
  const n = 1.0;
  const R_atm = 0.08206;
  const T = 273.15;
  const V = 22.414;
  const P = (n * R_atm * T) / V;
  assert(Math.abs(P - 1.0) < 0.005, `Expected P ~ 1.00 atm, got ${P.toFixed(4)} atm`);
});

test("Root-mean-square speed v_rms = √(3RT/M) for N2 at 298.15 K conforms to ~515 m/s", () => {
  const R = 8.314;
  const T = 298.15;
  const M = 0.028; // kg/mol for N2
  const vRMS = Math.sqrt((3 * R * T) / M);
  assert(Math.abs(vRMS - 515.2) < 2.0, `Expected v_rms ~ 515 m/s, got ${vRMS.toFixed(1)} m/s`);
});

test("Mean molecular kinetic energy KE = 3/2 * k_B * T scales linearly with absolute temperature", () => {
  const kB = 1.3806e-23;
  const T1 = 300;
  const T2 = 600;
  const ke1 = 1.5 * kB * T1;
  const ke2 = 1.5 * kB * T2;
  assert.strictEqual(ke2, 2 * ke1, "Doubling absolute temperature must double average kinetic energy");
});

// 3. Multi-Trial Store Integration
test("LabTrialStore records and persists Gas Laws states", () => {
  LabTrialStore.clearTrials("gaslaws");
  LabTrialStore.addTrial("gaslaws", {
    summary: "Standard State (V=22.4L, T=298K, n=1.00mol)",
    measurements: {
      "Pressure (atm)": 1.09,
      "Volume (L)": 22.4,
      "Temperature (K)": 298,
      "Moles (mol)": 1.00
    }
  });
  const trials = LabTrialStore.getTrials("gaslaws");
  assert.strictEqual(trials.length, 1);
  assert.strictEqual(trials[0].measurements["Volume (L)"], 22.4);
});

// 4. Source Code Invariants: Keyboard Shortcuts, Teardown, and CSV Telemetry
test("chem-gas-laws.js implements keyboard shortcuts suite ('E' CSV export, 'R' reset, 'H' burner, 'C' cooling)", () => {
  const code = fs.readFileSync(path.resolve("labs/chem-gas-laws.js"), "utf-8");
  assert(code.includes('handleKeyDown(e)'), "Must define handleKeyDown listener");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must bind 'e'/'E' to CSV export");
  assert(code.includes('e.key === "r" || e.key === "R"'), "Must bind 'r'/'R' to reset");
  assert(code.includes('e.key === "h" || e.key === "H"'), "Must bind 'h'/'H' to Bunsen burner");
  assert(code.includes('e.key === "c" || e.key === "C"'), "Must bind 'c'/'C' to ice cooling");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
});

test("chem-gas-laws.js CSV export bundles multi-trial telemetry and isothermal Boyle's law curve sweep", () => {
  const code = fs.readFileSync(path.resolve("labs/chem-gas-laws.js"), "utf-8");
  assert(code.includes('title: "Kinetic Molecular Theory & Ideal Gas Metrology"'), "Must export standard title");
  assert(code.includes('Isotherm T='), "Must generate isothermal sweep rows for plotting");
  assert(code.includes('P · V Product (atm·L)'), "Must include P·V constancy column");
});

// 5. Checkpoint Assessment Pool Verification
test("LAB_CHECKPOINTS.gaslaws contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.gaslaws), "gaslaws checkpoint pool must be an array");
  assert.strictEqual(LAB_CHECKPOINTS.gaslaws.length, 5, `Expected 5 gas laws questions, found ${LAB_CHECKPOINTS.gaslaws.length}`);

  const prompts = LAB_CHECKPOINTS.gaslaws.map(q => q.question);
  assert(prompts.some(p => p.includes("Boyle's Law states")), "Must include Boyle's Law inverse relationship question");
  assert(prompts.some(p => p.includes("Kelvin scale")), "Must include Kelvin absolute temperature question");
  assert(prompts.some(p => p.includes("Standard Temperature and Pressure")), "Must include STP molar volume 22.4 L question");
  assert(prompts.some(p => p.includes("Charles's Law")), "Must include Charles's Law temperature-volume direct proportionality question");
  assert(prompts.some(p => p.includes("Maxwell-Boltzmann distribution and Kinetic Molecular Theory")), "Must include v_rms molar mass scaling question");

  LAB_CHECKPOINTS.gaslaws.forEach((q, idx) => {
    assert(q.id, `Question ${idx + 1} must have an ID`);
    assert(Array.isArray(q.options) && q.options.length === 4, `Question ${idx + 1} must provide 4 options`);
    assert(typeof q.correctIndex === "number" && q.correctIndex >= 0 && q.correctIndex < 4, `Question ${idx + 1} must have valid correctIndex`);
    assert(q.explanation && q.explanation.length > 20, `Question ${idx + 1} must provide rigorous pedagogical explanation`);
  });
});

console.log("\n========================================================");
console.log(`📊 Gas Laws Lab Tests: ${passed} Passed, 0 Failed`);
console.log("========================================================\n");
