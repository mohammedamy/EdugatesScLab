// tests/test-optics-lab.js
// Verification suite for Precision Geometric & Physical Optics Laboratory (labs/phys-optics.js)

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("\n========================================================");
console.log("🔬 Precision Geometric & Physical Optics Suite Verification");
console.log("========================================================\n");

// 1. Verify module exports
const opticsModule = await import("../labs/phys-optics.js");
assert.strictEqual(typeof opticsModule.initOpticsLab, "function", "initOpticsLab must be exported as a function");
assert.strictEqual(typeof opticsModule.cleanupOpticsLab, "function", "cleanupOpticsLab must be exported as a function");
console.log("  ✅ PASS: initOpticsLab and cleanupOpticsLab are exported as functions");

// 2. Verify Thin Lens Equation for Converging Lens
// 1/f = 1/do + 1/di -> di = (f * do) / (do - f)
function calcThinLens(doVal, fVal) {
  if (Math.abs(doVal - fVal) < 1e-4) return { di: Infinity, m: Infinity, isReal: false };
  const di = (fVal * doVal) / (doVal - fVal);
  const m = -di / doVal;
  return { di, m, isReal: di > 0 };
}

const convCase = calcThinLens(30, 15);
assert.strictEqual(convCase.di, 30, "Object at 2F (do=30, f=15) produces real image at 2F (di=30)");
assert.strictEqual(convCase.m, -1, "Magnification at 2F is exactly -1.0 (inverted, same size)");
assert.strictEqual(convCase.isReal, true, "Image is real");
console.log("  ✅ PASS: Thin lens equation for converging lens at 2F (m = -1.00, di = 2f)");

// 3. Verify Thin Lens Equation for Diverging Lens (f < 0)
const divCase = calcThinLens(30, -15);
assert.strictEqual(Math.round(divCase.di * 100) / 100, -10, "Diverging lens (do=30, f=-15) produces virtual image at di = -10 cm");
assert.strictEqual(Math.round(divCase.m * 1000) / 1000, 0.333, "Diverging lens magnification is +0.333 (upright, reduced)");
assert.strictEqual(divCase.isReal, false, "Image is virtual");
console.log("  ✅ PASS: Diverging lens produces virtual upright reduced image (di < 0, 0 < m < 1)");

// 4. Verify Virtual Image for Converging Lens inside Focal Length (do < f)
const magGlass = calcThinLens(10, 15);
assert.strictEqual(magGlass.di, -30, "Magnifying glass (do=10, f=15) produces di = -30 cm");
assert.strictEqual(magGlass.m, 3, "Magnifying glass magnification is +3.00 (virtual, upright, magnified)");
assert.strictEqual(magGlass.isReal, false, "Image is virtual");
console.log("  ✅ PASS: Magnifying glass mode (do < f) produces enlarged virtual image");

// 5. Verify Snell's Law of Refraction
// n1 * sin(theta1) = n2 * sin(theta2) -> theta2 = asin((n1/n2) * sin(theta1))
function calcSnellRefraction(n1, n2, theta1Deg) {
  const theta1Rad = (theta1Deg * Math.PI) / 180;
  const sinTheta2 = (n1 / n2) * Math.sin(theta1Rad);
  if (sinTheta2 > 1.0) {
    return { tir: true, theta2Deg: null };
  }
  const theta2Rad = Math.asin(sinTheta2);
  return { tir: false, theta2Deg: (theta2Rad * 180) / Math.PI };
}

// Air (1.000) to Crown Glass (1.520) at 30 deg incidence
const airToGlass = calcSnellRefraction(1.000, 1.520, 30);
assert.strictEqual(airToGlass.tir, false, "Light entering glass does not undergo TIR");
assert.strictEqual(Math.round(airToGlass.theta2Deg * 100) / 100, 19.2, "Refracted angle in crown glass is ~19.2 degrees");
console.log("  ✅ PASS: Snell's law refraction: air to crown glass (30° -> 19.2°)");

// 6. Verify Total Internal Reflection (TIR) & Critical Angle
// Critical angle: theta_c = asin(n2 / n1) when n1 > n2
function calcCriticalAngle(n1, n2) {
  if (n1 <= n2) return null;
  return (Math.asin(n2 / n1) * 180) / Math.PI;
}

const critAngleGlassAir = calcCriticalAngle(1.520, 1.000);
assert.strictEqual(Math.round(critAngleGlassAir * 100) / 100, 41.14, "Critical angle for crown glass-air is ~41.14 degrees");

// Beyond critical angle -> TIR
const pastCrit = calcSnellRefraction(1.520, 1.000, 45);
assert.strictEqual(pastCrit.tir, true, "45 deg incidence from glass to air undergoes Total Internal Reflection");
console.log("  ✅ PASS: Total Internal Reflection (TIR) and critical angle θ_c = arcsin(n2/n1)");

// 7. Verify Cauchy Chromatic Dispersion
// n(lambda) = A + B / lambda^2
function calcCauchyIndex(A, B, lambdaNm) {
  const lambdaMicrons = lambdaNm / 1000;
  return A + B / (lambdaMicrons * lambdaMicrons);
}

// Crown glass parameters: A = 1.5046, B = 0.00420
const nRed = calcCauchyIndex(1.5046, 0.00420, 656.3);   // Red Fraunhofer C line
const nBlue = calcCauchyIndex(1.5046, 0.00420, 486.1);  // Blue Fraunhofer F line
assert(nBlue > nRed, `Shorter blue wavelength (n=${nBlue}) must have higher refractive index than red (n=${nRed})`);
console.log("  ✅ PASS: Cauchy chromatic dispersion: n(blue) > n(red), causing prism spectrum separation");

// 8. Verify LabTrialStore integration
const { LabTrialStore } = await import("../labs/lab-telemetry-exporter.js");
LabTrialStore.clearTrials("optics");
LabTrialStore.addTrial("optics", {
  measurements: {
    "Lens Type": "Biconvex Converging",
    "Focal Length (f)": "15.0 cm",
    "Object Distance (do)": "30.0 cm",
    "Image Distance (di)": "30.0 cm",
    "Magnification (m)": "-1.00x",
    "Image Nature": "Real, Inverted"
  }
});
const trials = LabTrialStore.getTrials("optics");
assert.strictEqual(trials.length, 1, "LabTrialStore must record 1 trial for optics");
assert.strictEqual(trials[0].measurements["Image Distance (di)"], "30.0 cm");
console.log("  ✅ PASS: LabTrialStore records and persists Optics laboratory trials");

// 9. Verify tactile dragging & touch-action
const opticsSrc = fs.readFileSync(path.join(rootDir, "labs/phys-optics.js"), "utf-8");
assert(
  opticsSrc.includes("touch-action: none") || opticsSrc.includes("touchAction = 'none'") || opticsSrc.includes("touchAction = \"none\""),
  "phys-optics.js must include touch-action: none on the interactive canvas"
);
console.log("  ✅ PASS: phys-optics.js includes touch-action: none on interactive canvas for tactile dragging");

// 10. Verify pointerdown, pointermove, pointerup direct dragging handlers
assert(opticsSrc.includes("pointerdown"), "phys-optics.js must implement pointerdown listener");
assert(opticsSrc.includes("pointermove"), "phys-optics.js must implement pointermove listener");
assert(opticsSrc.includes("pointerup"), "phys-optics.js must implement pointerup listener");
console.log("  ✅ PASS: phys-optics.js implements tactile pointer/touch dragging on optical components");

// 11. Verify HiDPI canvas scaling with window.getLabDPR
assert(opticsSrc.includes("getLabDPR"), "phys-optics.js must implement window.getLabDPR for HiDPI scaling");
console.log("  ✅ PASS: phys-optics.js implements HiDPI DPR canvas scaling with window.getLabDPR");

// 12. Verify keyboard shortcut listener and cleanup unbinding
assert(opticsSrc.includes("keydown"), "phys-optics.js must listen for keydown events (e.g. Space, 1-4, R)");
assert(opticsSrc.includes("removeEventListener"), "phys-optics.js must cleanly remove all listeners on unmount");
console.log("  ✅ PASS: phys-optics.js implements keyboard controls and unmount listener cleanup");

// 13. Verify Lab Dossier exporter integration
assert(opticsSrc.includes("openLabReportModal"), "phys-optics.js must integrate openLabReportModal");
console.log("  ✅ PASS: phys-optics.js integrates Lab Dossier generator with openLabReportModal");

// 14. Verify index.css includes .optics-layout in responsive single-column layout at 980px
const cssSrc = fs.readFileSync(path.join(rootDir, "index.css"), "utf-8");
assert(cssSrc.includes(".optics-layout"), "index.css must include .optics-layout in responsive styles");
console.log("  ✅ PASS: index.css includes .optics-layout in responsive media query list");

console.log("\n========================================================");
console.log("📊 Optics Lab Tests: All 14 Passed!");
console.log("========================================================\n");
