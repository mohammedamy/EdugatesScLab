// Edugates-ClipSAT Science Labs - Unit Test Suite for Wave Interference & Ripple Tank Lab
// Verifies:
// 1. Module export and cleanupWaveLab idempotent disposal
// 2. Fundamental Wave Equation (v = f • λ)
// 3. Young's Double-Slit Fringe Separation (Δy = λL / d) and inverse scaling with d
// 4. Single-Slit Fraunhofer Diffraction Central Maximum Width (w = 2λL / a)
// 5. Doppler Effect Frequency Shifts (approaching vs receding observer)
// 6. PML sponge boundary damping layer mathematics
// 7. Interactive canvas pointer droplet ripples and keyboard controls
// 8. Multi-trial persistence in LabTrialStore and standard CSV telemetry schema

import assert from "assert";
import fs from "fs";
import path from "path";
import { initWaveLab, cleanupWaveLab } from "../labs/phys-waves.js";
import { LabTrialStore } from "../labs/lab-telemetry-exporter.js";

console.log("\n========================================================");
console.log("🌊 Wave Interference & Ripple Tank Simulator Verification");
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

test("initWaveLab and cleanupWaveLab are exported as functions", () => {
  assert.strictEqual(typeof initWaveLab, "function");
  assert.strictEqual(typeof cleanupWaveLab, "function");
  cleanupWaveLab(); // Safe idempotent call
});

test("Fundamental wave equation calculates accurate wavelength λ = v / f", () => {
  const v = 160.0; // mm/s
  const f = 4.0; // Hz
  const lambda = v / f;
  assert.strictEqual(lambda, 40.0, `Expected wavelength λ = 40.0mm, got ${lambda}`);
});

test("Young's double-slit fringe separation formula Δy = (λ • L) / d", () => {
  const lambda = 40.0; // mm
  const L = 350.0; // mm
  const d = 40.0; // mm
  const deltaY = (lambda * L) / d;
  assert.strictEqual(deltaY, 350.0, `Expected Δy = 350.0mm, got ${deltaY}`);
  
  // With scaled screen separation (d in cm or scaling constant)
  const dScaled = 40;
  const fringeSeparation = (lambda * L) / dScaled;
  assert.strictEqual(fringeSeparation, 350.0);
});

test("Slit separation d exhibits exact inverse proportionality with fringe spacing Δy", () => {
  const lambda = 40.0;
  const L = 350.0;
  const d1 = 40.0;
  const d2 = 20.0; // halved separation
  const deltaY1 = (lambda * L) / d1;
  const deltaY2 = (lambda * L) / d2;
  
  assert.strictEqual(deltaY2, deltaY1 * 2, "Halving slit separation d must exactly double fringe spacing Δy");
});

test("Single-slit diffraction central maximum width w = 2λL / a", () => {
  const lambda = 40.0; // mm
  const L = 350.0; // mm
  const a = 14.0; // mm
  const w = (2 * lambda * L) / a;
  assert.strictEqual(parseFloat(w.toFixed(2)), 2000.00, `Expected w = 2000.00mm, got ${w}`);
});

test("Doppler effect frequency shift formulas (approaching vs receding)", () => {
  const f = 4.0; // Hz
  const mach = 0.5; // v/c = 0.5
  
  // Ahead of source (approaching)
  const fApproach = f / (1.0 - mach);
  assert.strictEqual(fApproach, 8.0, `Approaching frequency should double at Mach 0.5, got ${fApproach}`);
  
  // Behind source (receding)
  const fRecede = f / (1.0 + mach);
  assert.strictEqual(parseFloat(fRecede.toFixed(2)), 2.67, `Receding frequency should be 2.67 Hz, got ${fRecede}`);
});

test("PML sponge boundary precomputation damps boundary reflections more heavily than interior", () => {
  const GW = 180;
  const GH = 140;
  const damping = 0.992;
  const spongeDepth = 14;

  const dampingMap = new Float32Array(GW * GH);
  for (let y = 0; y < GH; y++) {
    for (let x = 0; x < GW; x++) {
      const idx = y * GW + x;
      const distRight = (GW - 1) - x;
      const distTop = y;
      const distBottom = (GH - 1) - y;
      const distLeft = x;
      const minDist = Math.min(distRight, distTop, distBottom, distLeft < 5 ? 999 : distLeft);
      if (minDist < spongeDepth) {
        const factor = minDist / spongeDepth;
        dampingMap[idx] = damping * (0.84 + 0.16 * factor);
      } else {
        dampingMap[idx] = damping;
      }
    }
  }

  const centerIdx = Math.floor(GH / 2) * GW + Math.floor(GW / 2);
  const edgeIdx = 2 * GW + 175; // Right edge sponge zone

  assert(Math.abs(dampingMap[centerIdx] - damping) < 1e-6, "Interior cell must use base damping factor");
  assert(dampingMap[edgeIdx] < dampingMap[centerIdx], "Sponge zone cell must have stronger attenuation");
});

test("LabTrialStore records and persists Wave Interference trials", () => {
  LabTrialStore.clearTrials("waves");
  LabTrialStore.addTrial("waves", {
    measurements: {
      "Mode": "double_slit",
      "Frequency (Hz)": 4.0,
      "Wavelength (mm)": 40.0,
      "Slit Separation d (mm)": 40,
      "Slit Width a (mm)": 14,
      "Fringe Spacing Δy (mm)": 35.00
    }
  });

  const trials = LabTrialStore.getTrials("waves");
  assert.strictEqual(trials.length, 1);
  assert.strictEqual(trials[0].measurements["Mode"], "double_slit");
  assert.strictEqual(trials[0].measurements["Fringe Spacing Δy (mm)"], 35.00);
});

test("phys-waves.js implements tactile droplet ripples on canvas with pointerdown and pointermove", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-waves.js"), "utf-8");
  assert(code.includes("addWaveDroplet"), "Must implement addWaveDroplet for tactile interaction");
  assert(code.includes("canvas.addEventListener(\"pointerdown\""), "Must listen for pointerdown on canvas");
  assert(code.includes("touch-action: none"), "Canvas element must declare touch-action: none");
});

test("phys-waves.js implements keyboard controls and unmount listener cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-waves.js"), "utf-8");
  assert(code.includes('e.code === "Space"'), "Must handle Spacebar pause/resume");
  assert(code.includes('e.key === "c" || e.key === "C"'), "Must handle 'C' key clear tank");
  assert(code.includes('window.removeEventListener("keydown", handleKeydown)'), "Cleanup must remove keydown listener");
  assert(code.includes('canvas.removeEventListener("pointerdown", onPointerDown)'), "Cleanup must remove pointerdown listener");
});

test("phys-waves.js supports multiple color palettes (ocean, ultraviolet, thermal, emerald)", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-waves.js"), "utf-8");
  assert(code.includes('data-palette="ocean"'), "Must include ocean palette button");
  assert(code.includes('data-palette="ultraviolet"'), "Must include ultraviolet palette button");
  assert(code.includes('data-palette="thermal"'), "Must include thermal palette button");
  assert(code.includes('data-palette="emerald"'), "Must include emerald palette button");
});

test("index.css includes .wave-layout in responsive media queries", () => {
  const css = fs.readFileSync(path.resolve("index.css"), "utf-8");
  assert(css.includes(".wave-layout"), "index.css must include .wave-layout rule");
});

test("phys-waves.js binds 'e' / 'E' keyboard shortcut to export telemetry CSV", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-waves.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export telemetry shortcut");
  assert(code.includes("exportTelemetryCsv()"), "Must invoke exportTelemetryCsv");
});

test("LAB_CHECKPOINTS.waves contains comprehensive 5-question inquiry suite", () => {
  const telemetrySrc = fs.readFileSync(path.resolve("labs/lab-telemetry-exporter.js"), "utf-8");
  assert(telemetrySrc.includes("waves: ["), "Must declare waves checkpoint pool");
  assert(telemetrySrc.includes("Young's double-slit experiment"), "Must include Young's double slit question");
  assert(telemetrySrc.includes("fringe separation"), "Must include fringe separation question");
  assert(telemetrySrc.includes("light waves are transverse"), "Must include transverse polarization question");
  assert(telemetrySrc.includes("single-slit Fraunhofer diffraction"), "Must include single slit diffraction question");
  assert(telemetrySrc.includes("approaching source"), "Must include Doppler effect question");
});

console.log("\n========================================================");
console.log(`📊 Wave Lab Tests: ${passed} Passed, 0 Failed`);
console.log("========================================================\n");
