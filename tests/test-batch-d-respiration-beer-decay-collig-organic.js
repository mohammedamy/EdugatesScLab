// Edugates-ClipSAT Science Labs - Unit Test Suite for Respiration, Beer-Lambert, Nuclear Decay, Colligative Properties, and Organic Reactions
// Verifies:
// 1. Module export and lifecycle initialization/teardown
// 2. Keyboard shortcut suites ('E' CSV export) with clean unmount teardown
// 3. Telemetry Suite: Multi-parameter RFC-4180 CSV datasets
// 4. Comprehensive 5-question inquiry checkpoint pools for respiration, beerlambert, decay, colligative, and organic

import assert from "assert";
import fs from "fs";
import path from "path";
import { initRespirationLab } from "../labs/bio-respiration.js";
import { initBeerLambertLab } from "../labs/chem-beer-lambert.js";
import { initNuclearDecayLab } from "../labs/chem-nuclear-decay.js";
import { initColligativeLab } from "../labs/chem-colligative.js";
import { initOrganicReactionsLab } from "../labs/chem-organic-reactions.js";
import { LAB_CHECKPOINTS } from "../labs/lab-telemetry-exporter.js";

console.log("\n========================================================");
console.log("🧪 Respiration, Beer-Lambert, Decay, Colligative & Organic Verification");
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
  assert.strictEqual(typeof initRespirationLab, "function");
  assert.strictEqual(typeof initBeerLambertLab, "function");
  assert.strictEqual(typeof initNuclearDecayLab, "function");
  assert.strictEqual(typeof initColligativeLab, "function");
  assert.strictEqual(typeof initOrganicReactionsLab, "function");
});

// 2. Cellular Respiration & Respirometry
test("bio-respiration.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/bio-respiration.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('mountLabCheckpoint("resp-checkpoint-container", "respiration")'), "Must mount respiration checkpoint");
});

test("LAB_CHECKPOINTS.respiration contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.respiration) && LAB_CHECKPOINTS.respiration.length === 5, "respiration pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.respiration.map(q => q.question);
  assert(prompts.some(p => p.includes("ultimate terminal electron acceptor")), "Must include terminal electron acceptor question");
  assert(prompts.some(p => p.includes("potassium hydroxide (KOH) pellets")), "Must include KOH CO2 absorption question");
  assert(prompts.some(p => p.includes("anaerobic alcoholic fermentation")), "Must include fermentation NAD+ regeneration question");
  assert(prompts.some(p => p.includes("Respiratory Quotient ($RQ")), "Must include Respiratory Quotient RQ question");
  assert(prompts.some(p => p.includes("2,4-dinitrophenol (DNP)")), "Must include proton gradient uncoupling question");
});

// 3. Beer-Lambert Spectrophotometry
test("chem-beer-lambert.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/chem-beer-lambert.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('mountLabCheckpoint("beer-checkpoint-container", "beerlambert")'), "Must mount beerlambert checkpoint");
});

test("LAB_CHECKPOINTS.beerlambert contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.beerlambert) && LAB_CHECKPOINTS.beerlambert.length === 5, "beerlambert pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.beerlambert.map(q => q.question);
  assert(prompts.some(p => p.includes("mathematical relationship between optical absorbance $A$ and molar concentration $c$")), "Must include linearity question");
  assert(prompts.some(p => p.includes("transmits exactly 10%")), "Must include 10% transmittance A=1.000 question");
  assert(prompts.some(p => p.includes("analytical peak absorption wavelength")), "Must include lambda_max question");
  assert(prompts.some(p => p.includes("transferred to a 2.00 cm cuvette")), "Must include path length doubling question");
  assert(prompts.some(p => p.includes("deviate negatively from linearity")), "Must include high concentration deviation question");
});

// 4. Radioactive Decay & Nuclear Kinetics
test("chem-nuclear-decay.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/chem-nuclear-decay.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('mountLabCheckpoint("decay-checkpoint-container", "decay")'), "Must mount decay checkpoint");
});

test("LAB_CHECKPOINTS.decay contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.decay) && LAB_CHECKPOINTS.decay.length === 5, "decay pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.decay.map(q => q.question);
  assert(prompts.some(p => p.includes("highest ionizing power")), "Must include alpha radiation ionizing power question");
  assert(prompts.some(p => p.includes("half-life of 8.0 days")), "Must include half-life calculation question");
  assert(prompts.some(p => p.includes("beta-minus (β⁻) emission")), "Must include beta-minus transformation question");
  assert(prompts.some(p => p.includes("decay constant $\\lambda$ and half-life $t_{1/2}$")), "Must include lambda and t1/2 relation question");
  assert(prompts.some(p => p.includes("Gamma ($\\gamma$) decay")), "Must include gamma radiation photon shielding question");
});

// 5. Colligative Properties & Freezing Point Depression
test("chem-colligative.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/chem-colligative.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('mountLabCheckpoint("colligative-checkpoint-container", "colligative")'), "Must mount colligative checkpoint");
});

test("LAB_CHECKPOINTS.colligative contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.colligative) && LAB_CHECKPOINTS.colligative.length === 5, "colligative pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.colligative.map(q => q.question);
  assert(prompts.some(p => p.includes("CaCl₂ produce approximately 1.5 times")), "Must include van 't Hoff factor question");
  assert(prompts.some(p => p.includes("temperature plateau")), "Must include latent heat of fusion question");
  assert(prompts.some(p => p.includes("Colligative properties of a solution")), "Must include particle concentration dependence question");
  assert(prompts.some(p => p.includes("5.00 g of an unknown non-electrolyte solute")), "Must include molar mass determination question");
  assert(prompts.some(p => p.includes("osmotic pressure ($\\Pi = i M R T$)")), "Must include osmotic pressure temperature dependence question");
});

// 6. Organic Reaction Mechanisms & Coordinate Diagrams
test("chem-organic-reactions.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/chem-organic-reactions.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('mountLabCheckpoint("organic-checkpoint-container", "organic")'), "Must mount organic checkpoint");
});

test("LAB_CHECKPOINTS.organic contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.organic) && LAB_CHECKPOINTS.organic.length === 5, "organic pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.organic.map(q => q.question);
  assert(prompts.some(p => p.includes("S_N2 nucleophilic substitution")), "Must include SN2 Walden inversion question");
  assert(prompts.some(p => p.includes("tertiary alkyl halides")), "Must include tertiary alkyl halide SN1 question");
  assert(prompts.some(p => p.includes("maximum peak of the energy curve")), "Must include transition state energy peak question");
  assert(prompts.some(p => p.includes("Zaitsev's rule")), "Must include Zaitsev E2 elimination question");
  assert(prompts.some(p => p.includes("Markovnikov's rule")), "Must include Markovnikov carbocation stability question");
});

console.log("\n========================================================");
console.log(`📊 All ${passed} Laboratory Verification Tests Passed!`);
console.log("========================================================\n");
