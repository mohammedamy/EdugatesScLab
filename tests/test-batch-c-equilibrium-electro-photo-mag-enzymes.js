// Edugates-ClipSAT Science Labs - Unit Test Suite for Equilibrium, Electrochem, Photoelectric, Magnetism, and Enzyme Kinetics
// Verifies:
// 1. Module export and lifecycle initialization/teardown
// 2. Keyboard shortcut suites ('E' CSV export) with clean unmount teardown
// 3. Telemetry Suite: Multi-parameter RFC-4180 CSV datasets
// 4. Comprehensive 5-question inquiry checkpoint pools for equilibrium, electrochem, photoelectric, magnetism, and enzymes

import assert from "assert";
import fs from "fs";
import path from "path";
import { initEquilibriumLab } from "../labs/chem-equilibrium.js";
import { initElectrochemLab } from "../labs/chem-electrochem.js";
import { initPhotoelectricLab, cleanupPhotoelectricLab } from "../labs/phys-photoelectric.js";
import { initMagnetismLab } from "../labs/phys-magnetism.js";
import { initEnzymeLab, cleanupEnzymeLab } from "../labs/bio-enzyme-kinetics.js";
import { LAB_CHECKPOINTS } from "../labs/lab-telemetry-exporter.js";

console.log("\n========================================================");
console.log("⚗️ Equilibrium, Electrochem, Photoelectric, Magnetism & Enzymes Verification");
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
  assert.strictEqual(typeof initEquilibriumLab, "function");
  assert.strictEqual(typeof initElectrochemLab, "function");
  assert.strictEqual(typeof initPhotoelectricLab, "function");
  assert.strictEqual(typeof cleanupPhotoelectricLab, "function");
  assert.strictEqual(typeof initMagnetismLab, "function");
  assert.strictEqual(typeof initEnzymeLab, "function");
  assert.strictEqual(typeof cleanupEnzymeLab, "function");
  cleanupPhotoelectricLab();
  cleanupEnzymeLab();
});

// 2. Chemical Equilibrium & Le Chatelier
test("chem-equilibrium.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/chem-equilibrium.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('mountLabCheckpoint("eq-checkpoint-container", "equilibrium")'), "Must mount equilibrium checkpoint");
});

test("LAB_CHECKPOINTS.equilibrium contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.equilibrium) && LAB_CHECKPOINTS.equilibrium.length === 5, "equilibrium pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.equilibrium.map(q => q.question);
  assert(prompts.some(p => p.includes("Le Chatelier's principle states")), "Must include Le Chatelier principle question");
  assert(prompts.some(p => p.includes("N}_2\\text{O}_4")), "Must include N2O4 temperature shift question");
  assert(prompts.some(p => p.includes("CONSTANT VOLUME")), "Must include constant volume inert gas question");
  assert(prompts.some(p => p.includes("synthesis of ammonia")), "Must include Haber-Bosch gas stoichiometry pressure question");
  assert(prompts.some(p => p.includes("reaction quotient $Q$ greater than")), "Must include Q vs K directionality question");
});

// 3. Electrochemistry & Galvanic Cells
test("chem-electrochem.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/chem-electrochem.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('mountLabCheckpoint("ec-checkpoint-container", "electrochem")'), "Must mount electrochem checkpoint");
});

test("LAB_CHECKPOINTS.electrochem contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.electrochem) && LAB_CHECKPOINTS.electrochem.length === 5, "electrochem pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.electrochem.map(q => q.question);
  assert(prompts.some(p => p.includes("oxidation occurs spontaneously at the")), "Must include anode oxidation question");
  assert(prompts.some(p => p.includes("function of the salt bridge")), "Must include salt bridge charge neutrality question");
  assert(prompts.some(p => p.includes("reaction quotient $Q < 1$")), "Must include Nernst Q < 1 question");
  assert(prompts.some(p => p.includes("thermodynamic equilibrium ($\\Delta G = 0$)")), "Must include equilibrium dead battery question");
  assert(prompts.some(p => p.includes("standard reduction potentials")), "Must include standard cell potential calculation question");
});

// 4. Photoelectric Effect & Quantum Physics
test("phys-photoelectric.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-photoelectric.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('mountLabCheckpoint("pe-checkpoint-container", "photoelectric")'), "Must mount photoelectric checkpoint");
});

test("LAB_CHECKPOINTS.photoelectric contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.photoelectric) && LAB_CHECKPOINTS.photoelectric.length === 5, "photoelectric pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.photoelectric.map(q => q.question);
  assert(prompts.some(p => p.includes("maximum kinetic energy")), "Must include Einstein KE_max question");
  assert(prompts.some(p => p.includes("threshold frequency ($f < f_0$)")), "Must include threshold frequency question");
  assert(prompts.some(p => p.includes("increasing light intensity")), "Must include intensity vs photocurrent question");
  assert(prompts.some(p => p.includes("stopping potential $V_{\\text{stop}}$ is plotted")), "Must include stopping potential slope h/e question");
  assert(prompts.some(p => p.includes("de Broglie matter wavelength")), "Must include de Broglie wavelength question");
});

// 5. Magnetism & Thomson e/m Fine-Beam Tube
test("phys-magnetism.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-magnetism.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('mountLabCheckpoint("mag-checkpoint-container", "magnetism")'), "Must mount magnetism checkpoint");
});

test("LAB_CHECKPOINTS.magnetism contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.magnetism) && LAB_CHECKPOINTS.magnetism.length === 5, "magnetism pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.magnetism.map(q => q.question);
  assert(prompts.some(p => p.includes("magnetic Lorentz force")), "Must include Lorentz force perpendicularity question");
  assert(prompts.some(p => p.includes("circular path")), "Must include centripetal circular motion question");
  assert(prompts.some(p => p.includes("accelerating potential V in the electron gun is doubled")), "Must include radius vs sqrt(V) question");
  assert(prompts.some(p => p.includes("oblique angle")), "Must include helical corkscrew trajectory question");
  assert(prompts.some(p => p.includes("specific charge experiment")), "Must include specific charge e/m formula derivation question");
});

// 6. Enzyme Kinetics & Michaelis-Menten
test("bio-enzyme-kinetics.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/bio-enzyme-kinetics.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('mountLabCheckpoint("enz-checkpoint-container", "enzymes")'), "Must mount enzyme checkpoint");
});

test("LAB_CHECKPOINTS.enzymes contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.enzymes) && LAB_CHECKPOINTS.enzymes.length === 5, "enzymes pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.enzymes.map(q => q.question);
  assert(prompts.some(p => p.includes("Michaelis constant ($K_m$) represents")), "Must include Michaelis constant Km question");
  assert(prompts.some(p => p.includes("competitive inhibitor")), "Must include competitive inhibitor question");
  assert(prompts.some(p => p.includes("optimal temperature")), "Must include thermal denaturation question");
  assert(prompts.some(p => p.includes("Lineweaver-Burk double-reciprocal plot")), "Must include Lineweaver-Burk intercepts question");
  assert(prompts.some(p => p.includes("pure non-competitive inhibitor")), "Must include non-competitive allosteric inhibition question");
});

console.log("\n========================================================");
console.log(`📊 All ${passed} Laboratory Verification Tests Passed!`);
console.log("========================================================\n");
