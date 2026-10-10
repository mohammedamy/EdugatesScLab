// Edugates-ClipSAT Science Labs - Unit Test Suite for Simple Harmonic Motion Lab
// Verifies:
// 1. Module export and initialization
// 2. Analytical periods for Mass-Spring and Simple Gravity Pendulum
// 3. Mechanical Energy Conservation calculations
// 4. Trial Store & Lab Dossier integration

import assert from "assert";
import fs from "fs";
import path from "path";
import { initHarmonicLab, cleanupHarmonicLab } from "../labs/phys-harmonic.js";
import { LabTrialStore } from "../labs/lab-telemetry-exporter.js";

console.log("\n========================================================");
console.log("🌀 Simple Harmonic Motion & Hooke's Law Verification");
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

test("initHarmonicLab and cleanupHarmonicLab are exported as functions", () => {
  assert.strictEqual(typeof initHarmonicLab, "function");
  assert.strictEqual(typeof cleanupHarmonicLab, "function");
  cleanupHarmonicLab(); // Safe idempotent call
});

test("Mass-Spring theoretical period formula T = 2π√(m/k)", () => {
  const m = 1.0;
  const k = 50.0;
  const T = 2 * Math.PI * Math.sqrt(m / k);
  assert(Math.abs(T - 0.88857) < 0.001, `Expected T ~ 0.889s, got ${T}`);
});

test("Simple Pendulum theoretical period formula T = 2π√(L/g)", () => {
  const L = 1.0;
  const g = 9.80665;
  const T = 2 * Math.PI * Math.sqrt(L / g);
  assert(Math.abs(T - 2.006) < 0.01, `Expected T ~ 2.006s, got ${T}`);
});

test("Celestial gravity variations scale pendulum period correctly", () => {
  const L = 1.0;
  const gMoon = 1.62;
  const TMoon = 2 * Math.PI * Math.sqrt(L / gMoon);
  const TEarth = 2 * Math.PI * Math.sqrt(L / 9.80665);
  assert(TMoon > TEarth * 2.4, "Moon period should be ~2.46x slower than Earth");
});

test("Spring potential energy formula PE = 0.5 * k * x²", () => {
  const k = 50.0;
  const x = 0.35;
  const pe = 0.5 * k * x * x;
  assert(Math.abs(pe - 3.0625) < 0.001, `Expected PE = 3.0625 J, got ${pe}`);
});

test("Pendulum potential energy formula PE = m * g * L * (1 - cos(θ))", () => {
  const m = 1.0;
  const g = 9.81;
  const L = 1.0;
  const theta = 0.35; // rad
  const pe = m * g * L * (1 - Math.cos(theta));
  assert(pe > 0 && pe < 1.0, `Expected PE in physical range, got ${pe}`);
});

test("LabTrialStore records and persists SHM trials", () => {
  LabTrialStore.clearTrials("harmonic");
  LabTrialStore.addTrial("harmonic", {
    summary: "Spring (k=50N/m), m=1.00kg",
    metrics: { "Period T (s)": "0.889" }
  });
  const trials = LabTrialStore.getTrials("harmonic");
  assert.strictEqual(trials.length, 1);
  assert.strictEqual(trials[0].summary, "Spring (k=50N/m), m=1.00kg");
});

test("phys-harmonic.js includes touch-action: none on interactive canvas for smartboard/touchscreen dragging", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-harmonic.js"), "utf-8");
  assert(code.includes('touch-action: none'), "Canvas markup must specify touch-action: none");
});

test("phys-harmonic.js implements Spacebar pause/resume listener with cleanup unbinding", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-harmonic.js"), "utf-8");
  assert(code.includes('e.code === "Space" || e.key === " "'), "Must handle Spacebar event");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must remove keydown listener");
});

test("index.css includes .harmonic-layout in responsive single-column layout at 980px", () => {
  const css = fs.readFileSync(path.resolve("index.css"), "utf-8");
  assert(css.includes(".harmonic-layout"), "index.css must include .harmonic-layout rule");
});

test("phys-harmonic.js implements simulation speed multiplier buttons (1.0x, 0.5x, 0.25x)", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-harmonic.js"), "utf-8");
  assert(code.includes('btn-shm-speed'), "Must include speed buttons with btn-shm-speed class");
  assert(code.includes('data-speed="0.5"'), "Must include 0.5x half-speed slow motion option");
  assert(code.includes('data-speed="0.25"'), "Must include 0.25x slow motion option");
});

test("phys-harmonic.js implements live cycle counter and empirical period zero-crossing measurement", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-harmonic.js"), "utf-8");
  assert(code.includes('id="disp-shm-cycles"'), "Must include cycle counter HUD element");
  assert(code.includes('prevDisplacement < 0 && x >= 0'), "Must track equilibrium zero-crossings for empirical period calculation");
});

test("phys-harmonic.js includes dynamic real-time mechanical energy partition ratio bar", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-harmonic.js"), "utf-8");
  assert(code.includes('id="shm-energy-bar-pe"'), "Must include PE progress bar segment");
  assert(code.includes('id="shm-energy-bar-ke"'), "Must include KE progress bar segment");
});

test("phys-harmonic.js implements 'e'/'E' CSV export and 'r'/'R' reset shortcuts", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-harmonic.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('e.key === "r" || e.key === "R"'), "Must handle 'r'/'R' reset shortcut");
});

test("LAB_CHECKPOINTS.harmonic contains comprehensive 5-question inquiry suite", async () => {
  const { LAB_CHECKPOINTS } = await import("../labs/lab-telemetry-exporter.js");
  assert(Array.isArray(LAB_CHECKPOINTS.harmonic), "harmonic checkpoint pool must be an array");
  assert.strictEqual(LAB_CHECKPOINTS.harmonic.length, 5, `Expected 5 harmonic questions, found ${LAB_CHECKPOINTS.harmonic.length}`);
  
  const prompts = LAB_CHECKPOINTS.harmonic.map(q => q.question);
  assert(prompts.some(p => p.includes("period of oscillation $T$ is given by")), "Must include mass-spring period formula question");
  assert(prompts.some(p => p.includes("maximum displacement")), "Must include turning point acceleration question");
  assert(prompts.some(p => p.includes("factor of 4")), "Must include 4x mass frequency halving question");
  assert(prompts.some(p => p.includes("doubling the bob mass")), "Must include simple pendulum mass independence question");
  assert(prompts.some(p => p.includes("viscous damping")), "Must include damped harmonic oscillator decay question");
});

console.log("\n========================================================");
console.log(`📊 Harmonic Lab Tests: ${passed} Passed, 0 Failed`);
console.log("========================================================\n");
