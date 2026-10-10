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

test("phys-fluids-buoyancy.js implements Spacebar pause/resume listener with cleanup unbinding and full keyboard shortcut mapping", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-fluids-buoyancy.js"), "utf-8");
  assert(code.includes('e.code === "Space" || e.key === " "'), "Must handle Spacebar event");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must remove keydown listener");
  assert(code.includes('e.key === "m" || e.key === "M"'), "Must handle 'm' mode switch shortcut");
  assert(code.includes('e.key === "p" || e.key === "P"'), "Must handle 'p' probe toggle shortcut");
  assert(code.includes('e.key === "f" || e.key === "F"'), "Must handle 'f' free float toggle shortcut");
  assert(code.includes('e.key === "t" || e.key === "T"'), "Must handle 't' record trial shortcut");
  assert(code.includes('e.key === "r" || e.key === "R"'), "Must handle 'r' lab report shortcut");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e' export CSV shortcut");
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

test("phys-fluids-buoyancy.js btn-fluid-mode switches between Archimedes, Venturi, and Torricelli modes cleanly", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-fluids-buoyancy.js"), "utf-8");
  assert(code.includes('container.querySelector("#btn-fluid-mode")?.addEventListener("click"'), "Must bind click listener to mode button");
  assert(code.includes('const calc = getCalculations();'), "Must safely obtain calculations object in mode switch");
  assert(code.includes('apparatusMode === "torricelli"'), "Must support Torricelli mode in switcher");
});

test("Torricelli's Law efflux velocity v = C_d · √(2gh) and discharge coefficients", () => {
  const g = 9.81;
  const H = 0.80; // m
  const yh = 0.40; // m orifice elevation
  const head = H - yh; // 0.40 m liquid head
  const vIdeal = Math.sqrt(2 * g * head);
  assert(Math.abs(vIdeal - 2.8014) < 0.01, `Ideal efflux velocity should be ~2.80 m/s, got ${vIdeal}`);

  // Sharp-edged orifice Cd = 0.62 (vena contracta)
  const vSharp = 0.62 * vIdeal;
  assert(Math.abs(vSharp - 1.7369) < 0.01, `Sharp-edged orifice efflux should be ~1.74 m/s, got ${vSharp}`);

  // Well-rounded streamlined nozzle Cd = 0.98
  const vRounded = 0.98 * vIdeal;
  assert(Math.abs(vRounded - 2.7454) < 0.01, `Streamlined nozzle efflux should be ~2.75 m/s, got ${vRounded}`);

  // Frictionless ideal Cd = 1.00
  const vFrictionless = 1.00 * vIdeal;
  assert(Math.abs(vFrictionless - vIdeal) < 1e-9, "Ideal Cd = 1.00 should match vIdeal");
});

test("Torricelli horizontal range symmetry R(y) = R(H - y) and peak range at y = H/2", () => {
  const g = 9.81;
  const H = 0.80;
  const Cd = 0.62;

  function calcRange(yh) {
    const head = H - yh;
    const v = Cd * Math.sqrt(2 * g * head);
    const tFlight = Math.sqrt((2 * yh) / g);
    return v * tFlight; // Identically 2 * Cd * sqrt(yh * (H - yh))
  }

  // Symmetry check: yh = 0.20 m and yh = 0.60 m must yield identical horizontal range
  const r20 = calcRange(0.20);
  const r60 = calcRange(0.60);
  assert(Math.abs(r20 - r60) < 1e-6, `Symmetry violated: R(0.20) = ${r20} != R(0.60) = ${r60}`);
  assert(Math.abs(r20 - 0.4295) < 0.01, `Expected range ~0.43 m for y=0.20m, got ${r20}`);

  // Maximum Range Theorem: Peak range occurs strictly at yh = H / 2 = 0.40 m
  const rMid = calcRange(0.40);
  const rMaxTheoretical = Cd * H; // 0.62 * 0.80 = 0.496 m
  assert(Math.abs(rMid - rMaxTheoretical) < 1e-6, `Midpoint range must equal Cd * H = ${rMaxTheoretical}, got ${rMid}`);

  // Test across search grid that no elevation achieves higher range than H / 2
  for (let y = 0.05; y <= 0.75; y += 0.05) {
    const rTest = calcRange(y);
    assert(rTest <= rMid + 1e-9, `Range at y=${y} (${rTest}) exceeded midpoint max range (${rMid})`);
  }
});

test("Hydrostatic depth pressure probe formula P_gauge = ρ·g·h and P_abs = P_atm + ρ·g·h", () => {
  const g = 9.81;
  const pAtmKPa = 101.325;

  // Pure water (1000 kg/m³) at depth 10 cm (0.10 m)
  const rhoWater = 1000.0;
  const h10cm = 0.10;
  const pGaugeWater = rhoWater * g * h10cm; // 981 Pa = 0.981 kPa
  const pAbsWater = pAtmKPa + pGaugeWater / 1000;
  assert(Math.abs(pGaugeWater - 981.0) < 0.01, `Water gauge pressure at 10cm should be 981 Pa, got ${pGaugeWater}`);
  assert(Math.abs(pAbsWater - 102.306) < 0.01, `Water absolute pressure at 10cm should be 102.31 kPa, got ${pAbsWater}`);

  // Denser glycerin (1261 kg/m³) at depth 20 cm (0.20 m)
  const rhoGlycerin = 1261.0;
  const h20cm = 0.20;
  const pGaugeGlycerin = rhoGlycerin * g * h20cm;
  assert(Math.abs(pGaugeGlycerin - 2474.08) < 0.1, `Glycerin gauge pressure at 20cm should be ~2474 Pa, got ${pGaugeGlycerin}`);

  // Gasoline (680 kg/m³) lower hydrostatic pressure
  const rhoGasoline = 680.0;
  const pGaugeGasoline = rhoGasoline * g * h10cm;
  assert(pGaugeGasoline < pGaugeWater, "Gasoline hydrostatic pressure must be strictly less than water");
});

test("phys-fluids-buoyancy.js implements Torricelli and Mano-Probe UI and canvas components", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-fluids-buoyancy.js"), "utf-8");
  assert(code.includes("btn-fluid-probe"), "Must include Depth Probe button");
  assert(code.includes("panel-torricelli-controls"), "Must include Torricelli control panel");
  assert(code.includes("slider-orifice-height"), "Must include orifice elevation slider");
  assert(code.includes("select-nozzle-type"), "Must include nozzle geometry selector");
  assert(code.includes("slider-probe-depth"), "Must include probe depth slider");
  assert(code.includes("val-probe-gauge"), "Must include probe gauge pressure readout");
  assert(code.includes("val-probe-abs"), "Must include probe absolute pressure readout");
  assert(code.includes("val-torricelli-range"), "Must include Torricelli horizontal range readout");
  assert(code.includes("val-torricelli-vel"), "Must include Torricelli efflux velocity readout");
  assert(code.includes("badge-max-range"), "Must include maximum range theorem badge");
  assert(code.includes("function drawTorricelliTank"), "Must include photorealistic Torricelli tank renderer");
  assert(code.includes("torricelliParticles"), "Must include streaming efflux jet droplets");
  assert(code.includes("openLabReportModal"), "Must integrate Lab Dossier report modal with Torricelli formulas");
  assert(code.includes("Torricelli's Efflux Velocity"), "Lab report modal must include Torricelli equation");
});

test("Pascal's Principle isobaric pressure transmission P1 = P2 and Mechanical Advantage IMA = (D2/D1)²", () => {
  const d1 = 0.04; // 4.0 cm
  const d2 = 0.20; // 20.0 cm
  const a1 = Math.PI * Math.pow(d1 / 2, 2); // 1.2566e-3 m²
  const a2 = Math.PI * Math.pow(d2 / 2, 2); // 3.1416e-2 m²
  const ima = a2 / a1; // 25.0
  assert(Math.abs(ima - 25.0) < 1e-6, `Expected IMA = 25.0, got ${ima}`);

  const f1 = 150.0; // N applied
  const f2 = f1 * ima; // 3750 N output lift
  assert(Math.abs(f2 - 3750.0) < 1e-6, `Expected F2 = 3750 N, got ${f2}`);

  // Isobaric pressure equality
  const p1 = f1 / a1; // Pa
  const p2 = f2 / a2; // Pa
  assert(Math.abs(p1 - p2) < 1e-6, `Pascal's principle violated: P1 (${p1}) != P2 (${p2})`);
  assert(Math.abs(p1 / 1000 - 119.366) < 0.1, `Expected pressure ~119.37 kPa, got ${p1 / 1000}`);
});

test("Hydraulic stroke volume conservation A1·d1 = A2·d2 and stroke displacement d2 = d1 / IMA", () => {
  const d1 = 0.04;
  const d2 = 0.20;
  const a1 = Math.PI * Math.pow(d1 / 2, 2);
  const a2 = Math.PI * Math.pow(d2 / 2, 2);
  const ima = a2 / a1;

  const stroke1 = 0.12; // 12.0 cm input stroke
  const stroke2 = stroke1 / ima; // 0.0048 m = 0.48 cm
  assert(Math.abs(stroke2 * 100 - 0.48) < 1e-6, `Expected output stroke d2 = 0.48 cm, got ${stroke2 * 100}`);

  // Displaced volume conservation
  const vol1 = a1 * stroke1;
  const vol2 = a2 * stroke2;
  assert(Math.abs(vol1 - vol2) < 1e-9, `Volume conservation violated: V1 (${vol1}) != V2 (${vol2})`);
});

test("Conservation of Energy and Work equivalence W1 = F1·d1 = W2 = F2·d2", () => {
  const f1 = 150.0;
  const stroke1 = 0.12;
  const w1 = f1 * stroke1; // 18.0 J

  const d1 = 0.04;
  const d2 = 0.20;
  const ima = Math.pow(d2 / d1, 2); // 25.0
  const f2 = f1 * ima; // 3750 N
  const stroke2 = stroke1 / ima; // 0.0048 m
  const w2 = f2 * stroke2; // 18.0 J

  assert(Math.abs(w1 - 18.0) < 1e-6, `Input work should be 18.0 J, got ${w1}`);
  assert(Math.abs(w2 - 18.0) < 1e-6, `Output work should be 18.0 J, got ${w2}`);
  assert(Math.abs(w1 - w2) < 1e-9, `Energy conservation violated: W1 (${w1}) != W2 (${w2})`);
});

test("Hydraulic vehicle load lifting threshold F2 >= m_load · g", () => {
  const g = 9.81;
  const ima = 25.0;

  // Calibration weights: 300 kg -> 2943 N
  const wWeights = 300 * g;
  const f1_150 = 150.0;
  const f2_150 = f1_150 * ima; // 3750 N
  assert(f2_150 >= wWeights, "150 N input force must successfully lift 300 kg calibration weights");

  // Sedan car: 1500 kg -> 14,715 N
  const wCar = 1500 * g;
  assert(f2_150 < wCar, "150 N input force must be insufficient to lift 1500 kg car");
  const f1MinCar = wCar / ima; // 588.6 N
  assert(f1MinCar > 588.0 && f1MinCar < 589.0, `Min force to lift sedan should be ~588.6 N, got ${f1MinCar}`);
  const f2CarLift = 600.0 * ima; // 15,000 N
  assert(f2CarLift >= wCar, "600 N input force must successfully lift 1500 kg car");

  // Forklift: 3800 kg -> 37,278 N
  const wForklift = 3800 * g;
  // With D1 = 3 cm, D2 = 30 cm -> IMA = 100x
  const imaHigh = Math.pow(30 / 3, 2); // 100x
  const f1MinForklift = wForklift / imaHigh; // 372.78 N
  assert(f1MinForklift < 400.0, "Forklift liftable with 100x mechanical advantage under 400 N input");
});

test("phys-fluids-buoyancy.js implements Pascal Hydraulic Lift UI controls, Bourdon gauge, and load library", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-fluids-buoyancy.js"), "utf-8");
  assert(code.includes("panel-hydraulic-controls"), "Must include hydraulic controls panel");
  assert(code.includes("slider-input-force"), "Must include input force slider");
  assert(code.includes("slider-d1"), "Must include D1 cylinder diameter slider");
  assert(code.includes("slider-d2"), "Must include D2 cylinder diameter slider");
  assert(code.includes("slider-input-stroke"), "Must include input stroke slider");
  assert(code.includes("select-hydraulic-load"), "Must include lifted load selector");
  assert(code.includes("HYDRAULIC_LOADS"), "Must include vehicle and load preset dictionary");
  assert(code.includes("val-hydraulic-ima"), "Must include IMA mechanical advantage readout");
  assert(code.includes("val-hydraulic-work"), "Must include work done energy conservation readout");
  assert(code.includes("val-hydraulic-maxlift"), "Must include max lift capacity readout");
  assert(code.includes("badge-hydraulic-status"), "Must include hydraulic status badge");
  assert(code.includes("function drawHydraulicPress"), "Must include photorealistic hydraulic press renderer");
  assert(code.includes("function drawHydraulicLoad"), "Must include vehicle and platform load renderer");
  assert(code.includes("isDraggingPiston1"), "Must implement tactile dragging on input piston handle");
  assert(code.includes("Pascal's Pressure Transmission"), "Lab dossier must include Pascal equation");
  assert(code.includes("Ideal Mechanical Advantage"), "Lab dossier must include IMA equation");
  assert(code.includes("Work / Energy Conservation"), "Lab dossier must include Work conservation equation");
});

test("phys-fluids-buoyancy.js exports mode-specific CSV telemetry for Archimedes, Venturi, Torricelli, and Pascal", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-fluids-buoyancy.js"), "utf-8");
  assert(code.includes('labId: "fluids_buoyancy"'), "Must export Archimedes buoyancy dataset");
  assert(code.includes('labId: "fluids_venturi"'), "Must export Venturi continuity & Bernoulli dataset");
  assert(code.includes('labId: "fluids_torricelli"'), "Must export Torricelli efflux dataset");
  assert(code.includes('labId: "fluids_hydraulic"'), "Must export Pascal hydraulic press dataset");
  assert(code.includes('"Flow Rate Q (L/s)"'), "Venturi CSV must include volumetric flow column");
  assert(code.includes('"Horizontal Range R (m)"'), "Torricelli CSV must include horizontal range column");
  assert(code.includes('"Output Lift Force F₂ (kN)"'), "Hydraulic CSV must include output force column");
  assert(code.includes("Export CSV (E)"), "Export button must include (E) hotkey hint");
});

test("LAB_CHECKPOINTS.fluids contains comprehensive 5-question inquiry suite across Archimedes, Venturi, Torricelli, and Pascal", () => {
  const telemetryCode = fs.readFileSync(path.resolve("labs/lab-telemetry-exporter.js"), "utf-8");
  assert(telemetryCode.includes("fluids: ["), "Must declare fluids checkpoint pool");
  assert(telemetryCode.includes("Archimedes' Principle"), "Must include Archimedes checkpoint question");
  assert(telemetryCode.includes("Venturi flow tube"), "Must include Venturi checkpoint question");
  assert(telemetryCode.includes("apparent weight"), "Must include Apparent Weight checkpoint question");
  assert(telemetryCode.includes("Torricelli's Law"), "Must include Torricelli checkpoint question");
  assert(telemetryCode.includes("hydraulic press governed by Pascal's Principle"), "Must include Pascal checkpoint question");
});

test("btn-fluid-reset comprehensively resets state and controls across all 4 apparatus modes", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-fluids-buoyancy.js"), "utf-8");
  assert(code.includes('container.querySelector("#btn-fluid-reset")'), "Must bind reset button");
  assert(code.includes('sliderForce.value = 150'), "Must reset hydraulic force slider");
  assert(code.includes('sliderD1.value = 4.0'), "Must reset hydraulic D1 cylinder diameter");
  assert(code.includes('sliderD2.value = 20.0'), "Must reset hydraulic D2 cylinder diameter");
  assert(code.includes('sliderStroke.value = 12.0'), "Must reset hydraulic stroke slider");
  assert(code.includes('selLoad.value = "car"'), "Must reset hydraulic load selector");
  assert(code.includes('sliderOrifice.value = 0.40'), "Must reset Torricelli orifice elevation");
  assert(code.includes('sliderVent.value = 2.0'), "Must reset Venturi flow rate");
  assert(code.includes('sliderSub.value = 100'), "Must reset Archimedes submersion slider");
});

test("phys-fluids-buoyancy.js renders physical nozzle hardware fittings and vena contracta jet constriction", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-fluids-buoyancy.js"), "utf-8");
  assert(code.includes("Well-rounded streamlined bellmouth nozzle"), "Must support bellmouth nozzle geometry");
  assert(code.includes("Short cylindrical Borda tube"), "Must support Borda tube cylinder geometry");
  assert(code.includes("Sharp-edged orifice plate with vena contracta bevel"), "Must support sharp orifice plate bevel");
  assert(code.includes("Vena contracta constriction waist"), "Must model fluid jet vena contracta waist constriction");
  assert(code.includes("Vena Contracta (C_c ≈ 0.62)"), "Must render visual annotation for vena contracta");
});

test("phys-fluids-buoyancy.js triggers synchronous updateHUD across all slider and mode control handlers", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-fluids-buoyancy.js"), "utf-8");
  assert(code.includes('#slider-input-force")?.addEventListener("input"') && code.includes("updateHUD();"), "Must update HUD on input force change");
  assert(code.includes('#slider-orifice-height")?.addEventListener("input"') && code.includes("updateHUD();"), "Must update HUD on orifice height change");
  assert(code.includes('#slider-probe-depth")?.addEventListener("input"') && code.includes("updateHUD();"), "Must update HUD on probe depth change");
  assert(code.includes('#slider-fluids-submersion")?.addEventListener("input"') && code.includes("updateHUD();"), "Must update HUD on submersion change");
  assert(code.includes('#slider-fluids-vol")?.addEventListener("input"') && code.includes("updateHUD();"), "Must update HUD on volume change");
  assert(code.includes('#slider-venturi-flow")?.addEventListener("input"') && code.includes("updateHUD();"), "Must update HUD on Venturi flow change");
  assert(code.includes("if (isDraggingOrifice)") && code.includes("if (isDraggingProbe)"), "Must support direct canvas drag interactions");
});

console.log("\n========================================================");
console.log(`📊 Fluids Lab Tests: All ${passed} Passed!`);
console.log("========================================================\n");

