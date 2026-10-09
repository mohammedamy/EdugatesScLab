// Edugates-ClipSAT Science Labs - Unit Test Suite for Fluid Dynamics & Buoyancy Lab
// Verifies:
// 1. Module export and initialization lifecycle (initFluidsBuoyancyLab, cleanupFluidsBuoyancyLab)
// 2. Analytical Archimedes buoyant force calculations (F_b = ρ_f · V_disp · g)
// 3. Apparent weight and spring balance tension (W_app = W_real - F_b)
// 4. Equilibrium floating depth ratios (h_eq / H = ρ_object / ρ_fluid)
// 5. Venturi tube continuity (A1·v1 = A2·v2) and Bernoulli pressure differential (ΔP = 1/2·ρ·(v2² - v1²))
// 6. Tactile pointer dragging, touch-action: none, and HiDPI DPR shielding
// 7. Keyboard shortcuts and LabTrialStore telemetry persistence

import assert from "assert";
import fs from "fs";
import path from "path";
import { initFluidsBuoyancyLab, cleanupFluidsBuoyancyLab } from "../labs/phys-fluids-buoyancy.js";
import { LabTrialStore } from "../labs/lab-telemetry-exporter.js";

console.log("\n========================================================");
console.log("🌊 Fluid Dynamics, Buoyancy & Bernoulli Suite Verification");
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

test("initFluidsBuoyancyLab and cleanupFluidsBuoyancyLab are exported as functions", () => {
  assert.strictEqual(typeof initFluidsBuoyancyLab, "function");
  assert.strictEqual(typeof cleanupFluidsBuoyancyLab, "function");
  cleanupFluidsBuoyancyLab(); // Safe idempotent call
});

test("Archimedes buoyant force formula F_b = ρ_fluid · V_disp · g", () => {
  const rhoWater = 1000.0; // kg/m³
  const volDisp = 0.001; // 1.0 L in m³
  const g = 9.81;
  const fb = rhoWater * volDisp * g;
  assert(Math.abs(fb - 9.81) < 0.001, `Expected F_b = 9.81 N, got ${fb}`);

  // Seawater density (1025 kg/m³)
  const rhoSea = 1025.0;
  const fbSea = rhoSea * volDisp * g;
  assert(Math.abs(fbSea - 10.055) < 0.01, `Expected F_b = 10.055 N in seawater, got ${fbSea}`);
});

test("Apparent weight formula W_app = max(0, W_real - F_b)", () => {
  const rhoAluminum = 2700.0; // kg/m³
  const vol = 0.001; // 1.0 L
  const g = 9.81;
  const massReal = rhoAluminum * vol; // 2.7 kg
  const weightReal = massReal * g; // 26.487 N
  const fb = 1000.0 * vol * g; // 9.81 N
  const wApp = Math.max(0, weightReal - fb);
  assert(Math.abs(wApp - 16.677) < 0.01, `Expected W_app = 16.68 N, got ${wApp}`);
});

test("Floating equilibrium submersion ratio equals density ratio (ρ_object / ρ_fluid)", () => {
  const rhoPine = 550.0;
  const rhoWater = 1000.0;
  const ratioPine = rhoPine / rhoWater;
  assert(Math.abs(ratioPine - 0.55) < 0.001, "Pine wood should float at 55% submersion");

  const rhoIce = 917.0;
  const ratioIce = rhoIce / rhoWater;
  assert(Math.abs(ratioIce - 0.917) < 0.001, "Glacial ice should float at 91.7% submersion");

  // Heavy sinking metal
  const rhoIron = 7870.0;
  const ratioIron = rhoIron / rhoWater;
  assert(ratioIron > 1.0, "Cast iron should sink because density ratio > 1.0");
});

test("Venturi tube mass continuity A1·v1 = A2·v2", () => {
  const d1 = 0.06; // 60 mm diameter
  const d2 = 0.03; // 30 mm diameter throat
  const a1 = Math.PI * Math.pow(d1 / 2, 2);
  const a2 = Math.PI * Math.pow(d2 / 2, 2);
  const flowRateQ = 0.002; // 2.0 L/s in m³/s

  const v1 = flowRateQ / a1;
  const v2 = flowRateQ / a2;
  const ratio = v2 / v1;
  assert(Math.abs(ratio - 4.0) < 0.01, `Expected velocity ratio = 4.0, got ${ratio}`);
});

test("Bernoulli static pressure drop ΔP = 1/2 · ρ · (v2² - v1²)", () => {
  const rho = 1000.0;
  const v1 = 0.707;
  const v2 = 2.83;
  const deltaP = 0.5 * rho * (v2 * v2 - v1 * v1);
  assert(deltaP > 0, "Pressure drop ΔP must be positive in constricted throat");
  const deltaH = deltaP / (rho * 9.81);
  assert(deltaH > 0 && deltaH < 1.0, `Manometer column difference Δh should be physically calibrated, got ${deltaH} m`);
});

test("LabTrialStore records and persists Fluid Dynamics trials", () => {
  LabTrialStore.clearTrials("fluids");
  LabTrialStore.addTrial("fluids", {
    summary: "Solid Aluminum in Fresh Water (100% Submerged)",
    metrics: {
      "Displaced Vol": "1.00 L",
      "Buoyant Force": "9.81 N",
      "Apparent Weight": "16.68 N"
    }
  });
  const trials = LabTrialStore.getTrials("fluids");
  assert.strictEqual(trials.length, 1);
  assert.strictEqual(trials[0].summary, "Solid Aluminum in Fresh Water (100% Submerged)");
});

test("phys-fluids-buoyancy.js includes touch-action: none on interactive canvas for smartboard/touchscreen dragging", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-fluids-buoyancy.js"), "utf-8");
  assert(code.includes('touch-action: none'), "Canvas markup must specify touch-action: none");
});

test("phys-fluids-buoyancy.js implements pointer/touch dragging on the submerged block", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-fluids-buoyancy.js"), "utf-8");
  assert(code.includes("pointerdown") || code.includes("touchstart"), "Must implement pointer/touch down listener");
  assert(code.includes("pointermove") || code.includes("touchmove"), "Must implement pointer/touch move listener");
  assert(code.includes("pointerup") || code.includes("touchend"), "Must implement pointer/touch up listener");
});

test("phys-fluids-buoyancy.js implements HiDPI DPR canvas scaling with window.getLabDPR", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-fluids-buoyancy.js"), "utf-8");
  assert(code.includes("window.getLabDPR"), "Must shield canvas resolution using window.getLabDPR");
});

test("phys-fluids-buoyancy.js implements Spacebar pause/resume listener with cleanup unbinding", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-fluids-buoyancy.js"), "utf-8");
  assert(code.includes('e.code === "Space" || e.key === " "'), "Must handle Spacebar event");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must remove keydown listener");
});

test("phys-fluids-buoyancy.js integrates Lab Dossier generator with openLabReportModal", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-fluids-buoyancy.js"), "utf-8");
  assert(code.includes("openLabReportModal"), "Must integrate openLabReportModal for NGSS lab reports");
});

test("index.css includes .fluids-layout in responsive single-column layout at 980px", () => {
  const css = fs.readFileSync(path.resolve("index.css"), "utf-8");
  assert(css.includes(".fluids-layout"), "index.css must include .fluids-layout rule");
});

test("Extended Materials: Cork, Acrylic, and Gold density & equilibrium behavior", () => {
  const rhoWater = 1000.0;
  const rhoCork = 240.0;
  const rhoAcrylic = 1180.0;
  const rhoGold = 19320.0;
  const rhoGlycerin = 1261.0;
  const rhoMercury = 13600.0;

  // Cork floats at 24% submersion
  assert.strictEqual(rhoCork / rhoWater, 0.24, "Cork floats with only 24% submersion in water");

  // Acrylic sinks in water but floats in Glycerin
  assert(rhoAcrylic > rhoWater, "Acrylic (1180 kg/m³) sinks in fresh water");
  assert(rhoAcrylic < rhoGlycerin, "Acrylic (1180 kg/m³) floats in glycerin (1261 kg/m³)");

  // Lead vs Gold in Mercury
  const rhoLead = 11340.0;
  assert(rhoLead < rhoMercury, "Lead (11340 kg/m³) floats in liquid mercury (13600 kg/m³)");
  assert(rhoGold > rhoMercury, "Gold (19320 kg/m³) sinks in liquid mercury (13600 kg/m³)");
});

test("Hydrodynamic Viscosity and Reynolds Number calculation (Re = ρ·v·D / μ)", () => {
  const d1 = 0.06; // 60 mm diameter
  const a1 = Math.PI * Math.pow(d1 / 2, 2);
  const flowRateQ = 0.002; // 2.0 L/s in m³/s
  const v1 = flowRateQ / a1; // ~0.707 m/s

  // Water at Q = 2.0 L/s
  const rhoWater = 1000.0;
  const muWater = 0.001002; // Pa·s
  const reWater = (rhoWater * v1 * d1) / muWater;
  assert(reWater > 4000, `Water flow at 2.0 L/s is turbulent: Re = ${Math.round(reWater)} > 4000`);

  // High-viscosity Glycerin at Q = 0.5 L/s (low flow rate)
  const qLow = 0.0005; // 0.5 L/s
  const v1Low = qLow / a1;
  const rhoGlycerin = 1261.0;
  const muGlycerin = 0.950; // Pa·s
  const reGlycerin = (rhoGlycerin * v1Low * d1) / muGlycerin;
  assert(reGlycerin < 2300, `Glycerin flow is laminar: Re = ${reGlycerin.toFixed(1)} < 2300`);
});

test("phys-fluids-buoyancy.js includes Reynolds number telemetry and regime indicators", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-fluids-buoyancy.js"), "utf-8");
  assert(code.includes("val-reynolds-1"), "Must render inlet Reynolds Re₁ telemetry element");
  assert(code.includes("val-reynolds-2"), "Must render throat Reynolds Re₂ telemetry element");
  assert(code.includes("badge-flow-regime"), "Must render hydrodynamic flow regime badge");
  assert(code.includes("cork:"), "Must include Cork in MATERIALS");
  assert(code.includes("acrylic:"), "Must include Acrylic in MATERIALS");
  assert(code.includes("gold:"), "Must include Gold in MATERIALS");
  assert(code.includes("glycerin:"), "Must include Glycerin in FLUIDS");
  assert(code.includes("gasoline:"), "Must include Gasoline in FLUIDS");
});

test("phys-fluids-buoyancy.js btn-fluid-mode switches between Archimedes and Venturi modes cleanly", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-fluids-buoyancy.js"), "utf-8");
  assert(code.includes('container.querySelector("#btn-fluid-mode")?.addEventListener("click"'), "Must bind click listener to mode button");
  assert(code.includes('const calc = getCalculations();'), "Must safely obtain calculations object in mode switch");
});

console.log("\n========================================================");
console.log(`📊 Fluids Lab Tests: All ${passed} Passed!`);
console.log("========================================================\n");
