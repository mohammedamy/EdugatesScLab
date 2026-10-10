// Edugates-ClipSAT Science Labs - Unit Test Suite for Flame Test, Precipitation, Activity Series, Arduino, and Human Anatomy Atlas (Batch H)
// Verifies:
// 1. Module export and lifecycle initialization/teardown
// 2. Keyboard shortcut suites ('E' CSV export) with clean unmount teardown
// 3. Telemetry Suite: Multi-parameter RFC-4180 CSV datasets
// 4. Comprehensive 5-question inquiry checkpoint pools for flametest, precipitation, activityseries, arduino, and anatomy

import assert from "assert";
import fs from "fs";
import path from "path";
import { initFlameTestLab } from "../labs/chem-flame-test.js";
import { initPrecipitationLab } from "../labs/chem-precipitation.js";
import { initActivitySeriesLab } from "../labs/chem-activity-series.js";
import { initArduinoLab } from "../labs/phys-arduino.js";
import { initAnatomyAtlasLab, cleanupAnatomyAtlasLab } from "../labs/anatomy-atlas.js";
import { LAB_CHECKPOINTS } from "../labs/lab-telemetry-exporter.js";

console.log("\n========================================================");
console.log("⚡ Flame Test, Precipitation, Activity Series, Arduino & Anatomy Verification");
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
  assert.strictEqual(typeof initFlameTestLab, "function");
  assert.strictEqual(typeof initPrecipitationLab, "function");
  assert.strictEqual(typeof initActivitySeriesLab, "function");
  assert.strictEqual(typeof initArduinoLab, "function");
  assert.strictEqual(typeof initAnatomyAtlasLab, "function");
  assert.strictEqual(typeof cleanupAnatomyAtlasLab, "function");
});

// 2. Flame Test & Atomic Emission Spectroscopy
test("chem-flame-test.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/chem-flame-test.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('mountLabCheckpoint("flame-checkpoint-container", "flametest")'), "Must mount flametest checkpoint");
  assert(code.includes('📥 Export CSV (E)'), "Export button must include (E) hotkey hint");
});

test("LAB_CHECKPOINTS.flametest contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.flametest) && LAB_CHECKPOINTS.flametest.length === 5, "flametest pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.flametest.map(q => q.question);
  assert(prompts.some(p => p.includes("sodium chloride") && p.includes("copper(II) chloride")), "Must include flame color cation excitation question");
  assert(prompts.some(p => p.includes("cobalt blue glass")), "Must include cobalt blue filter question");
  assert(prompts.some(p => p.includes("quantum energy difference")), "Must include lithium quantum energy calculation question");
  assert(prompts.some(p => p.includes("Rydberg equation") || p.includes("Balmer")), "Must include Rydberg Balmer alpha line transition question");
  assert(prompts.some(p => p.includes("hydrochloric acid") && p.includes("burner flame")), "Must include HCl cleaning wire loop volatilization question");
});

// 3. Precipitation & Solubility Rules
test("chem-precipitation.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/chem-precipitation.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('mountLabCheckpoint("precip-checkpoint-container", "precipitation")'), "Must mount precipitation checkpoint");
  assert(code.includes('📥 Export CSV (E)'), "Export button must include (E) hotkey hint");
});

test("LAB_CHECKPOINTS.precipitation contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.precipitation) && LAB_CHECKPOINTS.precipitation.length === 5, "precipitation pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.precipitation.map(q => q.question);
  assert(prompts.some(p => p.includes("Pb(NO") && p.includes("KI")), "Must include PbI2 Qsp vs Ksp calculation question");
  assert(prompts.some(p => p.includes("Net Ionic Equation")), "Must include net ionic equation question");
  assert(prompts.some(p => p.includes("Golden Rain")), "Must include Golden Rain crystallization temperature question");
  assert(prompts.some(p => p.includes("common ion effect")), "Must include common ion effect on molar solubility question");
  assert(prompts.some(p => p.includes("ammonia") && p.includes("redissolves")), "Must include complex ion formation dissolution question");
});

// 4. Metal Activity Series & Single Displacement
test("chem-activity-series.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/chem-activity-series.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('mountLabCheckpoint("activity-checkpoint-container", "activityseries")'), "Must mount activityseries checkpoint");
  assert(code.includes('📥 Export CSV (E)'), "Export button must include (E) hotkey hint");
});

test("LAB_CHECKPOINTS.activityseries contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.activityseries) && LAB_CHECKPOINTS.activityseries.length === 5, "activityseries pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.activityseries.map(q => q.question);
  assert(prompts.some(p => p.includes("zinc metal") && p.includes("copper(II) sulfate")), "Must include Zn + CuSO4 redox displacement question");
  assert(prompts.some(p => p.includes("hydrochloric acid (HCl) to produce hydrogen gas")), "Must include acid displacement reactivity series question");
  assert(prompts.some(p => p.includes("silver nitrate") && p.includes("pale blue")), "Must include Cu in AgNO3 crystal dendrite question");
  assert(prompts.some(p => p.includes("Aluminum (Al)") && p.includes("soda can")), "Must include aluminum oxide passivation layer question");
  assert(prompts.some(p => p.includes("Gibbs free energy") || p.includes("\\Delta G^\\circ = -nFE^\\circ")), "Must include Gibbs free energy cell EMF calculation question");
});

// 5. Arduino Microcontroller & Embedded Systems
test("phys-arduino.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-arduino.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('mountLabCheckpoint("arduino-checkpoint-mount", "arduino")'), "Must mount arduino checkpoint");
  assert(code.includes('<span>Export CSV (E)</span>'), "Export button must include (E) hotkey hint");
  assert(code.includes('labId: "arduino"'), "exportLabDataCsv must be called with proper options object containing labId");
});

test("LAB_CHECKPOINTS.arduino contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.arduino) && LAB_CHECKPOINTS.arduino.length === 5, "arduino pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.arduino.map(q => q.question);
  assert(prompts.some(p => p.includes("10-bit Analog-to-Digital Converter")), "Must include ADC quantization resolution question");
  assert(prompts.some(p => p.includes("HC-SR04 ultrasonic sonar")), "Must include sonar pulse transit distance calculation question");
  assert(prompts.some(p => p.includes("current-limiting resistor")), "Must include LED Ohm's Law current limiting resistor question");
  assert(prompts.some(p => p.includes("Pulse-Width Modulation") || p.includes("analogWrite")), "Must include PWM duty cycle and average DC voltage question");
  assert(prompts.some(p => p.includes("pushbutton") || p.includes("multi-triggering")), "Must include switch bounce and firmware debouncing question");
});

// 6. Human Anatomy & Histology Interactive Atlas
test("anatomy-atlas.js binds 'e'/'E' to CSV export and unbinds on cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/anatomy-atlas.js"), "utf-8");
  assert(code.includes('id="btn-anatomy-export-csv"'), "Must include btn-anatomy-export-csv button in atlas UI");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('mountLabCheckpoint("atlas-checkpoint-mount", "anatomy"'), "Must mount anatomy checkpoint");
  assert(code.includes('Export CSV (E)'), "Export button must include (E) hotkey hint");
});

test("LAB_CHECKPOINTS.anatomy contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.anatomy) && LAB_CHECKPOINTS.anatomy.length === 5, "anatomy pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.anatomy.map(q => q.question);
  assert(prompts.some(p => p.includes("ventricular systole") && p.includes("S1")), "Must include cardiac cycle S1 valve closure question");
  assert(prompts.some(p => p.includes("thick ascending limb of the Loop of Henle")), "Must include renal countercurrent multiplier NKCC2 question");
  assert(prompts.some(p => p.includes("cranial nerve") || p.includes("parasympathetic")), "Must include vagus nerve CN X parasympathetic question");
  assert(prompts.some(p => p.includes("sliding filament theory")), "Must include sliding filament cross-bridge ATP detachment question");
  assert(prompts.some(p => p.includes("Type II alveolar cells") || p.includes("surfactant")), "Must include alveolar histology and Laplace's law surfactant question");
});

console.log("\n========================================================");
console.log(`🎉 Batch H Verification Complete: All ${passed}/11 Tests Passed!`);
console.log("========================================================\n");
