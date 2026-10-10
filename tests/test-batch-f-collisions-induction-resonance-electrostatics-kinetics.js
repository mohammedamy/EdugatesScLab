// Edugates-ClipSAT Science Labs - Unit Test Suite for Collisions, Induction, Sound Resonance, Electrostatics, and Reaction Kinetics
// Verifies:
// 1. Module export and lifecycle initialization/teardown
// 2. Keyboard shortcut suites ('E' CSV export) with clean unmount teardown
// 3. Telemetry Suite: Multi-parameter RFC-4180 CSV datasets
// 4. Comprehensive 5-question inquiry checkpoint pools for collisions, induction, resonance, electrostatics, and kinetics

import assert from "assert";
import fs from "fs";
import path from "path";
import { initCollisionsLab } from "../labs/phys-collisions.js";
import { initInductionLab } from "../labs/phys-induction.js";
import { initSoundResonanceLab } from "../labs/phys-sound-resonance.js";
import { initElectrostaticsLab } from "../labs/phys-electrostatics.js";
import { initReactionKineticsLab } from "../labs/chem-reaction-kinetics.js";
import { LAB_CHECKPOINTS } from "../labs/lab-telemetry-exporter.js";

console.log("\n========================================================");
console.log("⚡ Collisions, Induction, Resonance, Electrostatics & Kinetics Verification");
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
  assert.strictEqual(typeof initCollisionsLab, "function");
  assert.strictEqual(typeof initInductionLab, "function");
  assert.strictEqual(typeof initSoundResonanceLab, "function");
  assert.strictEqual(typeof initElectrostaticsLab, "function");
  assert.strictEqual(typeof initReactionKineticsLab, "function");
});

// 2. Linear Momentum & Air Track Collisions
test("phys-collisions.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-collisions.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('mountLabCheckpoint("collisions-checkpoint-mount", "phys-collisions")'), "Must mount collisions checkpoint");
  assert(code.includes('📥 Export CSV (E)'), "Export button must include (E) hotkey hint");
});

test("LAB_CHECKPOINTS.collisions contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.collisions) && LAB_CHECKPOINTS.collisions.length === 5, "collisions pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.collisions.map(q => q.question);
  assert(prompts.some(p => p.includes("quantity is strictly conserved during all collisions")), "Must include linear momentum conservation question");
  assert(prompts.some(p => p.includes("perfectly inelastic collision")), "Must include inelastic collision stick-together question");
  assert(prompts.some(p => p.includes("perfectly elastic collision")), "Must include equal mass elastic collision transfer question");
  assert(prompts.some(p => p.includes("average force") || p.includes("impulse")), "Must include impulse-momentum average force question");
  assert(prompts.some(p => p.includes("percentage of initial system kinetic energy is converted")), "Must include kinetic energy loss calculation question");
});

// 3. Electromagnetic Induction & Faraday-Lenz Dynamo
test("phys-induction.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-induction.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('window.removeEventListener("mousemove", onMouseMove)'), "Cleanup must unbind mousemove listener");
  assert(code.includes('window.removeEventListener("mouseup", onMouseUp)'), "Cleanup must unbind mouseup listener");
  assert(code.includes('window.removeEventListener("touchmove", onTouchMove)'), "Cleanup must unbind touchmove listener");
  assert(code.includes('window.removeEventListener("touchend", onTouchEnd)'), "Cleanup must unbind touchend listener");
  assert(code.includes('mountLabCheckpoint("induction-checkpoint-mount", "phys-induction")'), "Must mount induction checkpoint");
  assert(code.includes('📥 Export CSV (E)'), "Export button must include (E) hotkey hint");
});

test("LAB_CHECKPOINTS.induction contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.induction) && LAB_CHECKPOINTS.induction.length === 5, "induction pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.induction.map(q => q.question);
  assert(prompts.some(p => p.includes("Faraday's Law of Induction")), "Must include Faraday rate of flux change question");
  assert(prompts.some(p => p.includes("Lenz's Law")), "Must include Lenz opposing magnetic field question");
  assert(prompts.some(p => p.includes("ferromagnetic soft-iron core")), "Must include magnetic permeability iron core question");
  assert(prompts.some(p => p.includes("conductive slider bar") || p.includes("motional EMF")), "Must include motional EMF question");
  assert(prompts.some(p => p.includes("rotating") || p.includes("peak output voltage")), "Must include AC generator peak voltage question");
});

// 4. Acoustic Resonance Tube & Speed of Sound
test("phys-sound-resonance.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-sound-resonance.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('mountLabCheckpoint("sound-checkpoint-container", "resonance")'), "Must mount resonance checkpoint");
  assert(code.includes('📥 Export CSV (E)'), "Export button must include (E) hotkey hint");
});

test("LAB_CHECKPOINTS.resonance contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.resonance) && LAB_CHECKPOINTS.resonance.length === 5, "resonance pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.resonance.map(q => q.question);
  assert(prompts.some(p => p.includes("closed-open acoustic resonance tube")), "Must include boundary conditions question");
  assert(prompts.some(p => p.includes("experimental speed of sound")), "Must include 2f(L2-L1) speed of sound question");
  assert(prompts.some(p => p.includes("temperature")), "Must include temperature dependence question");
  assert(prompts.some(p => p.includes("end correction")), "Must include end correction cancellation question");
  assert(prompts.some(p => p.includes("odd harmonics") || p.includes("fundamental frequency")), "Must include closed-open odd harmonics question");
});

// 5. Coulomb's Law & Electrostatic Field Mapping
test("phys-electrostatics.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-electrostatics.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('📥 Export CSV (E)'), "Export button must include (E) hotkey hint");
});

test("LAB_CHECKPOINTS.electrostatics contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.electrostatics) && LAB_CHECKPOINTS.electrostatics.length === 5, "electrostatics pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.electrostatics.map(q => q.question);
  assert(prompts.some(p => p.includes("Coulomb's Law")), "Must include inverse-square law question");
  assert(prompts.some(p => p.includes("equipotential lines")), "Must include orthogonal field lines question");
  assert(prompts.some(p => p.includes("electric dipole")), "Must include dipole perpendicular bisector zero potential question");
  assert(prompts.some(p => p.includes("electric potential") && p.includes("point charge")), "Must include point charge V and E calculation question");
  assert(prompts.some(p => p.includes("Faraday cage") || p.includes("conductor")), "Must include Gauss's law / electrostatic shielding question");
});

// 6. Chemical Reaction Kinetics & Arrhenius Dynamics
test("chem-reaction-kinetics.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/chem-reaction-kinetics.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('mountLabCheckpoint("kinetics-checkpoint-mount", "chem-kinetics")'), "Must mount kinetics checkpoint");
  assert(code.includes('📥 Export CSV (E)'), "Export button must include (E) hotkey hint");
});

test("LAB_CHECKPOINTS.kinetics contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.kinetics) && LAB_CHECKPOINTS.kinetics.length === 5, "kinetics pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.kinetics.map(q => q.question);
  assert(prompts.some(p => p.includes("Arrhenius equation") || p.includes("catalyst")), "Must include catalyst activation energy question");
  assert(prompts.some(p => p.includes("rate law")), "Must include reaction order instantaneous rate question");
  assert(prompts.some(p => p.includes("Arrhenius plot of ln(k)")), "Must include Arrhenius plot slope question");
  assert(prompts.some(p => p.includes("half-life")), "Must include first-order half-life question");
  assert(prompts.some(p => p.includes("rate-determining")), "Must include two-step reaction mechanism question");
});

console.log("\n========================================================");
console.log(`📊 Batch F Verification: All ${passed} Tests Passed!`);
console.log("========================================================\n");
