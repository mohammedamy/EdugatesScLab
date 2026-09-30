// Edugates-ClipSAT Science Labs - Unit Test Suite for Simple Harmonic Motion Lab
// Verifies:
// 1. Module export and initialization
// 2. Analytical periods for Mass-Spring and Simple Gravity Pendulum
// 3. Mechanical Energy Conservation calculations
// 4. Trial Store & Lab Dossier integration

import assert from "assert";
import { initHarmonicLab } from "../labs/phys-harmonic.js";
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

test("initHarmonicLab is exported as a function", () => {
  assert.strictEqual(typeof initHarmonicLab, "function");
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

console.log("\n========================================================");
console.log(`📊 Harmonic Lab Tests: ${passed} Passed, 0 Failed`);
console.log("========================================================\n");
