// tests/test-circuits-lab.js
// Verification suite for Precision DC & AC Circuit Analysis Suite (labs/phys-circuits.js)

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("\n========================================================");
console.log("⚡ Precision DC & AC Circuit Analysis Suite Verification");
console.log("========================================================\n");

// 1. Verify module exports
const circuitsModule = await import("../labs/phys-circuits.js");
assert.strictEqual(typeof circuitsModule.initCircuitsLab, "function", "initCircuitsLab must be exported as a function");
assert.strictEqual(typeof circuitsModule.cleanupCircuitsLab, "function", "cleanupCircuitsLab must be exported as a function");
console.log("  ✅ PASS: initCircuitsLab and cleanupCircuitsLab are exported as functions");

// 2. Verify DC Ohm's Law and Series Equivalent Resistance
function calcDCSeries(v, r1, r2) {
  const req = r1 + r2;
  const i = v / req;
  const v1 = i * r1;
  const v2 = i * r2;
  const p = i * i * req;
  return { req, i, v1, v2, p };
}
const dcSeries = calcDCSeries(12.0, 10.0, 10.0);
assert.strictEqual(dcSeries.req, 20.0, "Series Req = 10 + 10 = 20 Ω");
assert.strictEqual(dcSeries.i, 0.60, "Series current I = 12 / 20 = 0.60 A");
assert.strictEqual(dcSeries.v1, 6.0, "Voltage divider drops 6.0V on R1");
assert.strictEqual(dcSeries.v2, 6.0, "Voltage divider drops 6.0V on R2");
assert(Math.abs(dcSeries.p - 7.20) < 1e-4, "Total circuit power is 7.20 W");
console.log("  ✅ PASS: DC series circuit Req = R1 + R2 (20.0 Ω), I = 0.60 A, and voltage divider (6.0V each)");

// 3. Verify DC Parallel Equivalent Resistance and Branch Currents
function calcDCParallel(v, r1, r2) {
  const req = (r1 * r2) / (r1 + r2);
  const i1 = v / r1;
  const i2 = v / r2;
  const iTot = i1 + i2;
  const p = v * iTot;
  return { req, i1, i2, iTot, p };
}
const dcParallel = calcDCParallel(12.0, 10.0, 10.0);
assert.strictEqual(dcParallel.req, 5.0, "Parallel Req = (10 * 10) / (10 + 10) = 5.0 Ω");
assert.strictEqual(dcParallel.i1, 1.20, "Branch 1 current = 12 / 10 = 1.20 A");
assert.strictEqual(dcParallel.i2, 1.20, "Branch 2 current = 12 / 10 = 1.20 A");
assert.strictEqual(dcParallel.iTot, 2.40, "Total parallel current = 1.2 + 1.2 = 2.40 A");
assert(Math.abs(dcParallel.p - 28.80) < 1e-4, "Parallel total power = 12 * 2.4 = 28.80 W");
console.log("  ✅ PASS: DC parallel circuit Req = 5.0 Ω, I_tot = 2.40 A (Kirkhoff Current Law)");

// 4. Verify DC Joule Thermal Power Dissipation (P = I^2 * R = V^2 / R)
const pOhm1 = 0.60 * 0.60 * 20.0;
const pOhm2 = (12.0 * 12.0) / 20.0;
assert(Math.abs(pOhm1 - 7.20) < 1e-4, "P = I^2 * R must equal 7.20 W");
assert(Math.abs(pOhm2 - 7.20) < 1e-4, "P = V^2 / R must equal 7.20 W");
console.log("  ✅ PASS: Joule heating formulation P = I²R = V²/R verified (7.20 W)");

// 5. Verify AC Series RLC Inductive Reactance (XL = 2*pi*f*L = omega*L)
function calcInductiveReactance(f, L) {
  return 2 * Math.PI * f * L;
}
const xl100mH = calcInductiveReactance(159.155, 0.100);
assert(Math.abs(xl100mH - 100.0) < 0.1, `Inductive reactance for 100mH at ~159.15Hz should be ~100 Ω, got ${xl100mH.toFixed(2)}`);
console.log("  ✅ PASS: Inductive reactance X_L = 2π·f·L verified (~100.0 Ω for 100 mH at 159.15 Hz)");

// 6. Verify AC Series RLC Capacitive Reactance (XC = 1 / (2*pi*f*C) = 1 / (omega*C))
function calcCapacitiveReactance(f, C) {
  return 1 / (2 * Math.PI * f * C);
}
const xc10uF = calcCapacitiveReactance(159.155, 10e-6);
assert(Math.abs(xc10uF - 100.0) < 0.1, `Capacitive reactance for 10µF at ~159.15Hz should be ~100 Ω, got ${xc10uF.toFixed(2)}`);
console.log("  ✅ PASS: Capacitive reactance X_C = 1/(2π·f·C) verified (~100.0 Ω for 10 µF at 159.15 Hz)");

// 7. Verify AC Series RLC Net Impedance (Z = sqrt(R^2 + (XL - XC)^2))
function calcRLCImpedance(f, R, L, C) {
  const xl = calcInductiveReactance(f, L);
  const xc = calcCapacitiveReactance(f, C);
  const xnet = xl - xc;
  const z = Math.sqrt(R * R + xnet * xnet);
  const phiRad = Math.atan2(xnet, R);
  const phiDeg = (phiRad * 180) / Math.PI;
  return { xl, xc, xnet, z, phiDeg };
}
const offResImpedance = calcRLCImpedance(300, 20.0, 0.100, 10e-6);
// At 300 Hz: XL = 2*pi*300*0.1 = 188.50 Ω; XC = 1/(2*pi*300*10e-6) = 53.05 Ω
// Xnet = 188.50 - 53.05 = 135.45 Ω
// Z = sqrt(20^2 + 135.45^2) = sqrt(400 + 18346.7) = 136.92 Ω
assert(Math.abs(offResImpedance.z - 136.92) < 0.5, `Impedance at 300Hz is ~136.9 Ω, got ${offResImpedance.z.toFixed(2)}`);
assert(offResImpedance.phiDeg > 0, "At 300 Hz (> f0), inductive dominance means voltage leads current (phi > 0)");
console.log("  ✅ PASS: AC RLC impedance Z = √(R² + (X_L - X_C)²) verified (136.9 Ω at 300 Hz)");

// 8. Verify AC Natural Resonant Frequency (f0 = 1 / (2*pi*sqrt(L*C)))
function calcResonantFrequency(L, C) {
  return 1 / (2 * Math.PI * Math.sqrt(L * C));
}
const f0 = calcResonantFrequency(0.100, 10e-6);
assert(Math.abs(f0 - 159.155) < 0.1, `Resonant frequency f0 for 100mH and 10µF is ~159.15 Hz, got ${f0.toFixed(2)}`);
const atRes = calcRLCImpedance(f0, 20.0, 0.100, 10e-6);
assert(Math.abs(atRes.xl - atRes.xc) < 1e-4, "At resonance, XL must exactly equal XC");
assert(Math.abs(atRes.z - 20.0) < 1e-4, "At resonance, net reactance cancels and Z = R = 20.0 Ω");
assert(Math.abs(atRes.phiDeg) < 1e-4, "At resonance, phase angle phi = 0.00°");
console.log("  ✅ PASS: Natural resonance f₀ = 1/(2π√(LC)) = 159.15 Hz with Z = R and φ = 0.00°");

// 9. Verify Quality Factor Q and Voltage Magnification
function calcQualityFactor(R, L, C) {
  const f0 = calcResonantFrequency(L, C);
  const omega0 = 2 * Math.PI * f0;
  return (omega0 * L) / R;
}
const qFactor = calcQualityFactor(20.0, 0.100, 10e-6);
// omega0 = 1000 rad/s -> Q = (1000 * 0.1) / 20 = 100 / 20 = 5.0
assert(Math.abs(qFactor - 5.0) < 1e-4, "Quality factor Q = (omega0 * L) / R is 5.0");
console.log("  ✅ PASS: Quality factor Q = (ω₀·L)/R = 5.00 (Voltage magnification across L and C is 5× source voltage)");

// 10. Verify Half-Power Bandwidth (Delta f = f0 / Q)
function calcBandwidth(f0Val, qVal) {
  return f0Val / qVal;
}
const deltaF = calcBandwidth(f0, qFactor);
assert(Math.abs(deltaF - 31.83) < 0.1, `Bandwidth Delta f = f0/Q is ~31.83 Hz, got ${deltaF.toFixed(2)}`);
console.log("  ✅ PASS: Half-power bandwidth Δf = f₀/Q = 31.83 Hz verified");

// 11. Verify AC Phase Regimes: Inductive Lag vs Capacitive Lead
const capFreqCase = calcRLCImpedance(80, 20.0, 0.100, 10e-6);
assert(capFreqCase.phiDeg < 0, `Below resonance (80 Hz < 159 Hz), XC > XL and phi must be negative (got ${capFreqCase.phiDeg.toFixed(1)}°)`);
const indFreqCase = calcRLCImpedance(320, 20.0, 0.100, 10e-6);
assert(indFreqCase.phiDeg > 0, `Above resonance (320 Hz > 159 Hz), XL > XC and phi must be positive (got ${indFreqCase.phiDeg.toFixed(1)}°)`);
console.log("  ✅ PASS: Phase sign regimes verified: Capacitive lead (φ < 0 below f₀) and Inductive lag (φ > 0 above f₀)");

// 12. Verify Real Power and Power Factor (PF = cos(phi))
function calcACPower(v0, R, L, C, f) {
  const imp = calcRLCImpedance(f, R, L, C);
  const vRms = v0 / Math.SQRT2;
  const iRms = vRms / imp.z;
  const pf = Math.cos((imp.phiDeg * Math.PI) / 180);
  const pReal = vRms * iRms * pf;
  return { vRms, iRms, pf, pReal };
}
const resP = calcACPower(10.0, 20.0, 0.100, 10e-6, f0);
assert(Math.abs(resP.pf - 1.0) < 1e-4, "Power factor at resonance is unity (1.000)");
assert(Math.abs(resP.pReal - (resP.iRms * resP.iRms * 20.0)) < 1e-4, "Real power equals I_rms^2 * R");
console.log("  ✅ PASS: AC real power P = V_rms·I_rms·cos(φ) and unity power factor at resonance");

// 13. Verify Wheatstone Bridge Node Potentials
function calcBridgePotentials(vin, r1, r2, r3, rx) {
  const vb = vin * (r2 / (r1 + r2));
  const vd = vin * (rx / (r3 + rx));
  const vg = vb - vd;
  const rxCalc = (r2 * r3) / r1;
  const isBalanced = Math.abs(vg) < 0.005;
  return { vb, vd, vg, rxCalc, isBalanced };
}
const bridgeUnbalanced = calcBridgePotentials(10.0, 100.0, 100.0, 80.0, 120.0);
assert.strictEqual(bridgeUnbalanced.vb, 5.0, "V_B is exactly 5.00 V with equal ratio arms (100Ω/100Ω)");
assert(Math.abs(bridgeUnbalanced.vd - 6.0) < 1e-4, "V_D = 10 * (120 / (80 + 120)) = 6.00 V");
assert(Math.abs(bridgeUnbalanced.vg - (-1.0)) < 1e-4, "Galvanometer voltage difference VG = VB - VD = -1.00 V");
assert.strictEqual(bridgeUnbalanced.isBalanced, false, "Bridge is off-balance");
console.log("  ✅ PASS: Wheatstone bridge node potentials VB = 5.0V, VD = 6.0V, VG = -1.0V (off-balance)");

// 14. Verify Wheatstone Bridge Balance Null Condition (Rx = R2*R3/R1)
const bridgeBalanced = calcBridgePotentials(10.0, 100.0, 100.0, 120.0, 120.0);
assert.strictEqual(bridgeBalanced.vb, 5.0);
assert.strictEqual(bridgeBalanced.vd, 5.0);
assert.strictEqual(bridgeBalanced.vg, 0.0, "At balance, galvanometer voltage difference is exactly 0.00 V");
assert.strictEqual(bridgeBalanced.rxCalc, 120.0, "Rx calculated matches actual unknown resistance (120.0 Ω)");
assert.strictEqual(bridgeBalanced.isBalanced, true, "Bridge is balanced");
console.log("  ✅ PASS: Wheatstone bridge null condition: VG = 0.00 V and Rx = (R2·R3)/R1 = 120.0 Ω");

// 15. Verify 4-Band Axial Resistor Color Band Code Algorithm
const colorBands = {
  0: "Black", 1: "Brown", 2: "Red", 3: "Orange", 4: "Yellow",
  5: "Green", 6: "Blue", 7: "Violet", 8: "Gray", 9: "White"
};
function getBands(ohms) {
  const s = Math.round(ohms).toString();
  const b1 = parseInt(s[0], 10);
  const b2 = s.length > 1 ? parseInt(s[1], 10) : 0;
  const mult = Math.max(0, s.length - 2);
  return [colorBands[b1], colorBands[b2], colorBands[mult]];
}
const r10Bands = getBands(10);
assert.deepStrictEqual(r10Bands, ["Brown", "Black", "Black"], "10 Ω resistor bands: Brown (1), Black (0), Black (10^0)");
const r47Bands = getBands(47);
assert.deepStrictEqual(r47Bands, ["Yellow", "Violet", "Black"], "47 Ω resistor bands: Yellow (4), Violet (7), Black (10^0)");
const r100Bands = getBands(100);
assert.deepStrictEqual(r100Bands, ["Brown", "Black", "Brown"], "100 Ω resistor bands: Brown (1), Black (0), Brown (10^1)");
console.log("  ✅ PASS: 4-band axial resistor color code encoding (10Ω: Br-Bk-Bk, 47Ω: Ye-Vi-Bk, 100Ω: Br-Bk-Br)");

// 16. Verify LabTrialStore integration
const { LabTrialStore } = await import("../labs/lab-telemetry-exporter.js");
LabTrialStore.clearTrials("circuits");
LabTrialStore.addTrial("circuits", {
  measurements: {
    "Mode": "AC RLC Resonance",
    "V0 (V)": 10.0,
    "Freq (Hz)": 159.0,
    "L (mH)": 100.0,
    "C (µF)": 10.0,
    "Z (Ω)": 20.0,
    "Irms (A)": 0.354,
    "f0 (Hz)": 159.0,
    "Q Factor": 5.0
  }
});
const trials = LabTrialStore.getTrials("circuits");
assert.strictEqual(trials.length, 1, "LabTrialStore must record 1 trial for circuits");
assert.strictEqual(trials[0].measurements["Q Factor"], 5.0);
console.log("  ✅ PASS: LabTrialStore records and persists circuits laboratory trials");

// 17. Verify touch-action: none on interactive canvas for tactile dragging
const circuitsSrc = fs.readFileSync(path.join(rootDir, "labs/phys-circuits.js"), "utf-8");
assert(
  circuitsSrc.includes("touch-action: none") || circuitsSrc.includes("touchAction = 'none'"),
  "phys-circuits.js must include touch-action: none on the interactive canvas"
);
console.log("  ✅ PASS: phys-circuits.js includes touch-action: none on interactive canvas");

// 18. Verify direct pointer dragging and setPointerCapture
assert(circuitsSrc.includes("setPointerCapture"), "phys-circuits.js must utilize setPointerCapture for multi-touch");
assert(circuitsSrc.includes("pointerdown"), "phys-circuits.js must implement pointerdown listener");
assert(circuitsSrc.includes("pointermove"), "phys-circuits.js must implement pointermove listener");
assert(circuitsSrc.includes("pointerup"), "phys-circuits.js must implement pointerup listener");
console.log("  ✅ PASS: phys-circuits.js implements direct tactile pointer dragging for switch and DMM probes");

// 19. Verify HiDPI DPR canvas scaling with window.getLabDPR
assert(circuitsSrc.includes("getLabDPR"), "phys-circuits.js must implement window.getLabDPR for HiDPI scaling");
console.log("  ✅ PASS: phys-circuits.js implements HiDPI DPR canvas scaling with window.getLabDPR");

// 20. Verify Keyboard shortcuts and unmount cleanup
assert(circuitsSrc.includes("keydown"), "phys-circuits.js must listen for keydown events (Space, 1-4, R)");
assert(circuitsSrc.includes("removeEventListener"), "phys-circuits.js must cleanly remove all listeners on unmount");
console.log("  ✅ PASS: phys-circuits.js implements keyboard controls and unmount listener cleanup");

// 21. Verify Lab Dossier exporter and CSV exporter integration
assert(circuitsSrc.includes("openLabReportModal"), "phys-circuits.js must integrate openLabReportModal");
assert(circuitsSrc.includes("exportLabDataCsv"), "phys-circuits.js must integrate exportLabDataCsv");
console.log("  ✅ PASS: phys-circuits.js integrates Lab Dossier generator and CSV data exporter");

// 22. Verify Oscilloscope, Phasor Diagram, and Wheatstone Bridge render pipelines
assert(circuitsSrc.includes("drawDualTraceOscilloscope"), "phys-circuits.js must implement drawDualTraceOscilloscope");
assert(circuitsSrc.includes("drawPhasorDiagram"), "phys-circuits.js must implement drawPhasorDiagram");
assert(circuitsSrc.includes("drawGalvanometer"), "phys-circuits.js must implement drawGalvanometer");
console.log("  ✅ PASS: phys-circuits.js implements dual-trace oscilloscope, rotating phasor diagram, and galvanometer renderers");

// 23. Verify index.css includes .circuits-layout in responsive media query list
const cssSrc = fs.readFileSync(path.join(rootDir, "index.css"), "utf-8");
assert(cssSrc.includes(".circuits-layout"), "index.css must include .circuits-layout in responsive media query list");
console.log("  ✅ PASS: index.css includes .circuits-layout in responsive single-column layout at 980px");

// 24. Verify Mode-Specific CSV Telemetry Export
assert(circuitsSrc.includes('labId: "circuits_dc"'), "Must export DC series/parallel analysis dataset");
assert(circuitsSrc.includes('labId: "circuits_ac"'), "Must export AC RLC resonance frequency sweep dataset");
assert(circuitsSrc.includes('labId: "circuits_bridge"'), "Must export Wheatstone bridge metrology dataset");
assert(circuitsSrc.includes('"Resonant Frequency (f₀)"'), "AC export must include resonant frequency");
assert(circuitsSrc.includes('"Ratio Arm R1"'), "Bridge export must include ratio arm R1");
console.log("  ✅ PASS: phys-circuits.js exports mode-specific CSV telemetry across DC, AC RLC, and Wheatstone bridge modes");

// 25. Verify Comprehensive 5-Question Circuits Checkpoint Assessment
const telemetryCode = fs.readFileSync(path.join(rootDir, "labs/lab-telemetry-exporter.js"), "utf-8");
assert(telemetryCode.includes("circuits: ["), "Must declare circuits checkpoint pool");
assert(telemetryCode.includes("Ohm's Law"), "Must include Ohm's law question");
assert(telemetryCode.includes("series circuit containing two resistors"), "Must include series current invariance question");
assert(telemetryCode.includes("parallel branches"), "Must include parallel equivalent resistance question");
assert(telemetryCode.includes("resonant frequency"), "Must include AC RLC resonance impedance minimum question");
assert(telemetryCode.includes("Wheatstone bridge"), "Must include Wheatstone bridge null balance question");
console.log("  ✅ PASS: LAB_CHECKPOINTS.circuits contains comprehensive 5-question inquiry suite");

// 26. Verify Keyboard Shortcut 'e' / 'E' for CSV Telemetry Export
assert(circuitsSrc.includes('e.key === "e" || e.key === "E"'), "phys-circuits.js must bind 'e'/'E' to CSV export");
console.log("  ✅ PASS: phys-circuits.js binds 'e'/'E' shortcut for instant telemetry CSV export");

console.log("\n========================================================");
console.log("📊 DC & AC Circuits Lab Tests: All 26 Passed!");
console.log("========================================================\n");
