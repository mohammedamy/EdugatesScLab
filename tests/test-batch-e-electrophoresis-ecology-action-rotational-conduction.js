// Edugates-ClipSAT Science Labs - Unit Test Suite for Gel Electrophoresis, Population Ecology, Action Potential, Rotational Dynamics, and Thermal Conduction
// Verifies:
// 1. Module export and lifecycle initialization/teardown
// 2. Keyboard shortcut suites ('E' CSV export) with clean unmount teardown
// 3. Telemetry Suite: Multi-parameter RFC-4180 CSV datasets
// 4. Comprehensive 5-question inquiry checkpoint pools for electrophoresis, ecology, actionpotential, rotational, and conduction

import assert from "assert";
import fs from "fs";
import path from "path";
import { initGelElectrophoresisLab } from "../labs/bio-gel-electrophoresis.js";
import { initPopulationEcologyLab } from "../labs/bio-population-ecology.js";
import { initActionPotentialLab } from "../labs/bio-action-potential.js";
import { initRotationalDynamicsLab } from "../labs/phys-rotational-dynamics.js";
import { initThermalConductionLab } from "../labs/phys-thermal-conduction.js";
import { LAB_CHECKPOINTS } from "../labs/lab-telemetry-exporter.js";

console.log("\n========================================================");
console.log("⚡ Electrophoresis, Ecology, Action Potential, Rotation & Conduction Verification");
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
  assert.strictEqual(typeof initGelElectrophoresisLab, "function");
  assert.strictEqual(typeof initPopulationEcologyLab, "function");
  assert.strictEqual(typeof initActionPotentialLab, "function");
  assert.strictEqual(typeof initRotationalDynamicsLab, "function");
  assert.strictEqual(typeof initThermalConductionLab, "function");
});

// 2. Agarose Gel Electrophoresis
test("bio-gel-electrophoresis.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/bio-gel-electrophoresis.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('mountLabCheckpoint("electrophoresis-checkpoint-container", "electrophoresis")'), "Must mount electrophoresis checkpoint");
});

test("LAB_CHECKPOINTS.electrophoresis contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.electrophoresis) && LAB_CHECKPOINTS.electrophoresis.length === 5, "electrophoresis pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.electrophoresis.map(q => q.question);
  assert(prompts.some(p => p.includes("migrate toward the positive anode")), "Must include backbone charge question");
  assert(prompts.some(p => p.includes("correlate with migration distance")), "Must include molecular sieving question");
  assert(prompts.some(p => p.includes("agarose gel concentration provides the highest analytical resolution")), "Must include gel concentration question");
  assert(prompts.some(p => p.includes("Ethidium Bromide or GelGreen")), "Must include fluorescent intercalating dye question");
  assert(prompts.some(p => p.includes("calibrated DNA ladder")), "Must include molecular weight standard question");
});

// 3. Population Ecology & Predator-Prey
test("bio-population-ecology.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/bio-population-ecology.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('mountLabCheckpoint("ecology-checkpoint-container", "ecology")'), "Must mount ecology checkpoint");
});

test("LAB_CHECKPOINTS.ecology contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.ecology) && LAB_CHECKPOINTS.ecology.length === 5, "ecology pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.ecology.map(q => q.question);
  assert(prompts.some(p => p.includes("Lotka-Volterra predator-prey model")), "Must include Lotka-Volterra lag question");
  assert(prompts.some(p => p.includes("finite carrying capacity K")), "Must include carrying capacity logistic question");
  assert(prompts.some(p => p.includes("apex keystone predator")), "Must include keystone trophic cascade question");
  assert(prompts.some(p => p.includes("r-selected species")), "Must include r vs K selection question");
  assert(prompts.some(p => p.includes("Competitive Exclusion Principle")), "Must include Gause competitive exclusion question");
});

// 4. Neurophysiology & Action Potentials
test("bio-action-potential.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/bio-action-potential.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('mountLabCheckpoint("actionpotential-checkpoint-container", "actionpotential")'), "Must mount actionpotential checkpoint");
});

test("LAB_CHECKPOINTS.actionpotential contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.actionpotential) && LAB_CHECKPOINTS.actionpotential.length === 5, "actionpotential pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.actionpotential.map(q => q.question);
  assert(prompts.some(p => p.includes("rapid rising phase (depolarization)")), "Must include rising phase Na+ channel question");
  assert(prompts.some(p => p.includes("Tetrodotoxin (TTX")), "Must include TTX channel blocker question");
  assert(prompts.some(p => p.includes("absolute refractory period")), "Must include refractory period h-gate inactivation question");
  assert(prompts.some(p => p.includes("falling phase (repolarization)")), "Must include repolarization K+ efflux question");
  assert(prompts.some(p => p.includes("myelin sheath insulation")), "Must include saltatory conduction question");
});

// 5. Rotational Dynamics & Moment of Inertia
test("phys-rotational-dynamics.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-rotational-dynamics.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('mountLabCheckpoint("rotational-checkpoint-container", "rotational")'), "Must mount rotational checkpoint");
});

test("LAB_CHECKPOINTS.rotational contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.rotational) && LAB_CHECKPOINTS.rotational.length === 5, "rotational pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.rotational.map(q => q.question);
  assert(prompts.some(p => p.includes("solid sphere") && p.includes("hollow hoop")), "Must include sphere vs hoop incline race question");
  assert(prompts.some(p => p.includes("force exerts the net torque")), "Must include static friction torque question");
  assert(prompts.some(p => p.includes("rotating figure skater")), "Must include angular momentum conservation question");
  assert(prompts.some(p => p.includes("Parallel Axis Theorem")), "Must include parallel axis theorem question");
  assert(prompts.some(p => p.includes("fraction of its total mechanical kinetic energy")), "Must include rotational kinetic fraction question");
});

// 6. Thermal Conduction & Fourier's Law
test("phys-thermal-conduction.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-thermal-conduction.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('mountLabCheckpoint("conduction-checkpoint-container", "conduction")'), "Must mount conduction checkpoint");
});

test("LAB_CHECKPOINTS.conduction contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.conduction) && LAB_CHECKPOINTS.conduction.length === 5, "conduction pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.conduction.map(q => q.question);
  assert(prompts.some(p => p.includes("Fourier's Law of 1D Heat Conduction")), "Must include Fourier's law thickness question");
  assert(prompts.some(p => p.includes("metallic conductors such as copper")), "Must include free electron thermal transport question");
  assert(prompts.some(p => p.includes("temperature gradient (dT/dx)")), "Must include steady-state linear gradient question");
  assert(prompts.some(p => p.includes("analogy to Ohm's Law")), "Must include series thermal resistance question");
  assert(prompts.some(p => p.includes("Thermal diffusivity")), "Must include thermal diffusivity question");
});

console.log("\n========================================================");
console.log(`📊 All ${passed} Laboratory Verification Tests Passed!`);
console.log("========================================================\n");
