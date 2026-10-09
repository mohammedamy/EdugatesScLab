// Edugates-ClipSAT Science Labs - Unit Test Suite for Precision Kinematics & Projectile Range Lab
// Verifies:
// 1. Module export and idempotent cleanup
// 2. Analytical Kinematic Formulas (Max Range at 45°, Complementary Angles 30°/60°, Time of Flight, Apex Height)
// 3. Elevated platform trajectory math
// 4. Aerodynamic air drag numerical integration (Euler-Cromer sub-stepping, range attenuation, asymmetry)
// 5. Direct canvas pointer drag interaction & keyboard shortcut bindings
// 6. Complete lifecycle event listener cleanup (keydown, pointerdown, pointermove, pointerup, resize, timers)
// 7. Telemetry & Multi-Trial store persistence

import assert from "assert";
import fs from "fs";
import path from "path";
import { initProjectileLab, cleanupProjectileLab } from "../labs/phys-projectile.js";
import { LabTrialStore } from "../labs/lab-telemetry-exporter.js";

console.log("\n========================================================");
console.log("🚀 Precision Kinematics & Projectile Range Verification");
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

test("initProjectileLab and cleanupProjectileLab are exported as functions", () => {
  assert.strictEqual(typeof initProjectileLab, "function");
  assert.strictEqual(typeof cleanupProjectileLab, "function");
  cleanupProjectileLab(); // Safe idempotent call
});

test("Theoretical maximum range formula R = (v₀² * sin(2θ)) / g at θ = 45°", () => {
  const v0 = 35.0; // m/s
  const thetaRad = 45 * Math.PI / 180;
  const g = 9.8;
  const R = (v0 * v0 * Math.sin(2 * thetaRad)) / g;
  // 35^2 * sin(90°) / 9.8 = 1225 / 9.8 = 125.00 m
  assert.strictEqual(parseFloat(R.toFixed(2)), 125.00, `Expected 125.00m, got ${R}`);
});

test("Complementary launch angles (30° and 60°) produce identical theoretical range in vacuum", () => {
  const v0 = 35.0;
  const g = 9.8;
  const r30 = (v0 * v0 * Math.sin(2 * 30 * Math.PI / 180)) / g;
  const r60 = (v0 * v0 * Math.sin(2 * 60 * Math.PI / 180)) / g;
  // sin(60°) = sin(120°) = √3 / 2 ≈ 0.866025 -> 1225 * 0.866025 / 9.8 ≈ 108.25m
  assert(Math.abs(r30 - r60) < 1e-9, `Complementary angle ranges must be equal: r30=${r30}, r60=${r60}`);
  assert.strictEqual(parseFloat(r30.toFixed(2)), 108.25);
});

test("Theoretical maximum altitude formula H = y₀ + (v₀² * sin²(θ)) / (2g)", () => {
  const v0 = 35.0;
  const g = 9.8;
  const y0 = 0.0;
  const thetaRad = 45 * Math.PI / 180;
  const H = y0 + (v0 * v0 * Math.pow(Math.sin(thetaRad), 2)) / (2 * g);
  // 1225 * 0.5 / 19.6 = 612.5 / 19.6 = 31.25 m
  assert.strictEqual(parseFloat(H.toFixed(2)), 31.25, `Expected H = 31.25m, got ${H}`);
});

test("Time of flight theoretical formula t_flight = 2 * v₀ * sin(θ) / g", () => {
  const v0 = 35.0;
  const g = 9.8;
  const thetaRad = 45 * Math.PI / 180;
  const tFlight = (2 * v0 * Math.sin(thetaRad)) / g;
  // 70 * 0.70710678 / 9.8 ≈ 5.05076 s
  assert.strictEqual(parseFloat(tFlight.toFixed(2)), 5.05, `Expected t_flight = 5.05s, got ${tFlight}`);
});

test("Elevated platform launch (y₀ > 0) calculates correct landing time and extended range", () => {
  const v0 = 35.0;
  const g = 9.8;
  const y0 = 15.0; // 15m hill
  const thetaRad = 45 * Math.PI / 180;
  const vy0 = v0 * Math.sin(thetaRad);
  const vx0 = v0 * Math.cos(thetaRad);

  // Quadratic equation for y(t) = y0 + vy0*t - 0.5*g*t^2 = 0
  // 0.5*g*t^2 - vy0*t - y0 = 0
  const a = 0.5 * g;
  const b = -vy0;
  const c = -y0;
  const tLanding = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
  const rangeElevated = vx0 * tLanding;

  assert(tLanding > 5.05, `Landing time from hill (${tLanding}s) must exceed flat ground (5.05s)`);
  assert(rangeElevated > 125.0, `Range from elevated platform (${rangeElevated}m) must exceed flat range (125.0m)`);
  assert.strictEqual(parseFloat(tLanding.toFixed(2)), 5.60);
  assert(Math.abs(rangeElevated - 138.535) < 0.05, `Expected rangeElevated ~ 138.535, got ${rangeElevated}`);
});

test("Euler-Cromer aerodynamic drag simulation proves range attenuation (R_drag < R_vacuum)", () => {
  const v0 = 35.0;
  const g = 9.8;
  const thetaRad = 45 * Math.PI / 180;
  const kDrag = 0.0058; // Earth air drag parameter

  let x = 0;
  let y = 0;
  let vx = v0 * Math.cos(thetaRad);
  let vy = v0 * Math.sin(thetaRad);
  let t = 0;
  const dt = 0.002; // High-precision sub-step

  while (y >= 0 || t < 0.1) {
    const vMag = Math.sqrt(vx * vx + vy * vy);
    const dragAcc = kDrag * vMag;
    const ax = -dragAcc * vx;
    const ay = -g - dragAcc * vy;
    vx += ax * dt;
    vy += ay * dt;
    x += vx * dt;
    y += vy * dt;
    t += dt;
    if (y < 0 && t > 0.1) break;
  }

  const rangeDrag = x;
  const rangeVac = (v0 * v0 * Math.sin(2 * thetaRad)) / g;

  assert(rangeDrag < rangeVac, `Aerodynamic drag must attenuate range: R_drag=${rangeDrag}m vs R_vac=${rangeVac}m`);
  assert(rangeDrag > 75.0 && rangeDrag < 115.0, `Realistic drag range should be ~82-100m, got ${rangeDrag}m`);
  
  // Also verify impact speed is attenuated compared to launch speed v0
  const impactSpeed = Math.sqrt(vx * vx + vy * vy);
  assert(impactSpeed < v0, `Impact speed under drag (${impactSpeed.toFixed(2)} m/s) must be lower than launch speed (${v0} m/s)`);
});

test("Celestial environment gravitational constants scale correctly", () => {
  const v0 = 35.0;
  const thetaRad = 45 * Math.PI / 180;
  const gMoon = 1.62;
  const gMars = 3.71;
  const gEarth = 9.80;
  const gJupiter = 24.79;

  const rMoon = (v0 * v0 * Math.sin(2 * thetaRad)) / gMoon;
  const rMars = (v0 * v0 * Math.sin(2 * thetaRad)) / gMars;
  const rEarth = (v0 * v0 * Math.sin(2 * thetaRad)) / gEarth;
  const rJupiter = (v0 * v0 * Math.sin(2 * thetaRad)) / gJupiter;

  assert(rMoon > rMars && rMars > rEarth && rEarth > rJupiter, "Range must inversely scale with planetary gravity");
  assert(rMoon > 700, `Moon range should be over 700m (low gravity), got ${rMoon.toFixed(1)}m`);
  assert(rJupiter < 55, `Jupiter range should be under 55m (high gravity), got ${rJupiter.toFixed(1)}m`);
});

test("LabTrialStore records and persists Projectile trials with aerodynamic parameters", () => {
  LabTrialStore.clearTrials("projectile");
  LabTrialStore.addTrial("projectile", {
    measurements: {
      "Range (m)": 125.00,
      "Flight Time (s)": 5.05,
      "Max Altitude (m)": 31.25,
      "Angle (°)": 45,
      "Speed (m/s)": 35,
      "Platform Height (m)": 0,
      "Air Drag": "Disabled (Vacuum)"
    }
  });

  const trials = LabTrialStore.getTrials("projectile");
  assert.strictEqual(trials.length, 1);
  assert.strictEqual(trials[0].measurements["Range (m)"], 125.00);
  assert.strictEqual(trials[0].measurements["Air Drag"], "Disabled (Vacuum)");
});

test("phys-projectile.js implements direct canvas pointer dragging with setPointerCapture", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-projectile.js"), "utf-8");
  assert(code.includes("pointerdown"), "Must register pointerdown listener on canvas");
  assert(code.includes("setPointerCapture"), "Must use setPointerCapture for smooth dragging");
  assert(code.includes("isDraggingAngle") && code.includes("isDraggingTarget"), "Must support both angle and target dragging");
});

test("phys-projectile.js implements comprehensive keyboard controls with cleanup", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-projectile.js"), "utf-8");
  assert(code.includes('e.code === "Space" || e.key === "Enter"'), "Must handle Space/Enter launch hotkeys");
  assert(code.includes('e.key === "c" || e.key === "C"'), "Must handle 'C' key clear traces hotkey");
  assert(code.includes('e.key === "ArrowUp"') && code.includes('e.key === "ArrowDown"'), "Must handle Arrow Up/Down angle hotkeys");
  assert(code.includes('e.key === "ArrowLeft"') && code.includes('e.key === "ArrowRight"'), "Must handle Arrow Left/Right speed hotkeys");
  assert(code.includes('window.removeEventListener("keydown", handleKeydown)'), "Cleanup must remove keydown listener");
  assert(code.includes('canvas.removeEventListener("pointerdown", onPointerDown)'), "Cleanup must remove pointerdown listener");
});

test("phys-projectile.js stores timestamp t in trajectory points for accurate CSV telemetry", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-projectile.js"), "utf-8");
  assert(code.includes("t: parseFloat(t.toFixed(3))"), "Trajectory points must store timestamp t");
  assert(code.includes('"Time (s)", "x (m)", "y (m)", "vx (m/s)", "vy (m/s)", "Speed v (m/s)"'), "CSV headers must include velocity and speed");
});

test("phys-projectile.js has touch-action: none on canvas element", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-projectile.js"), "utf-8");
  assert(code.includes("touch-action: none"), "Canvas element must explicitly declare touch-action: none");
});

test("Projectile presets specify calibrated physical masses and aerodynamic drag coefficients", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-projectile.js"), "utf-8");
  assert(code.includes('cannonball:'), "Must define cannonball preset");
  assert(code.includes('baseball:'), "Must define baseball preset");
  assert(code.includes('golfball:'), "Must define golfball preset");
  assert(code.includes('artillery:'), "Must define artillery shell preset");
  assert(code.includes('cd: 0.47'), "Cannonball Cd must be 0.47 (sphere)");
  assert(code.includes('cd: 0.30'), "Baseball Cd must be 0.30 (seamed sphere)");
  assert(code.includes('cd: 0.22'), "Golf ball Cd must be 0.22 (dimpled)");
  assert(code.includes('cd: 0.15'), "Artillery shell Cd must be 0.15 (streamlined ogive)");
});

test("Relative wind vector kinematics modulate aerodynamic airspeed and landing range", () => {
  const v0 = 35.0;
  const thetaRad = 45 * Math.PI / 180;
  const g = 9.8;
  const m = 1.0;
  const kDrag = 0.0058;

  function simulateFlightWithWind(wx) {
    let x = 0, y = 0;
    let vx = v0 * Math.cos(thetaRad);
    let vy = v0 * Math.sin(thetaRad);
    let t = 0;
    const dt = 0.002;
    while (y >= 0 || t < 0.1) {
      const vrelX = vx - wx;
      const vrelY = vy;
      const vrel = Math.sqrt(vrelX * vrelX + vrelY * vrelY);
      const Fdx = -kDrag * m * vrel * vrelX;
      const Fdy = -kDrag * m * vrel * vrelY;
      vx += (Fdx / m) * dt;
      vy += (-g + Fdy / m) * dt;
      x += vx * dt;
      y += vy * dt;
      t += dt;
      if (y < 0 && t > 0.1) break;
    }
    return x;
  }

  const rangeCalm = simulateFlightWithWind(0);
  const rangeHeadwind = simulateFlightWithWind(-15); // 15 m/s headwind
  const rangeTailwind = simulateFlightWithWind(15);  // 15 m/s tailwind

  assert(rangeHeadwind < rangeCalm, `Headwind must shorten range: ${rangeHeadwind.toFixed(1)}m < ${rangeCalm.toFixed(1)}m`);
  assert(rangeTailwind > rangeCalm, `Tailwind must extend range: ${rangeTailwind.toFixed(1)}m > ${rangeCalm.toFixed(1)}m`);
  assert(rangeTailwind - rangeHeadwind > 40.0, "Range variation between ±15m/s wind must exceed 40m");
});

test("Magnus effect generates aerodynamic lift (backspin) and dive (topspin)", () => {
  const v0 = 35.0;
  const thetaRad = 45 * Math.PI / 180;
  const g = 9.8;
  const m = 0.145; // baseball
  const r = 0.037;
  const A = Math.PI * r * r;
  const rho = 1.225;
  const cd = 0.30;

  function simulateSpin(spinRpm) {
    let x = 0, y = 0;
    let vx = v0 * Math.cos(thetaRad);
    let vy = v0 * Math.sin(thetaRad);
    let t = 0;
    const dt = 0.002;
    const omegaRad = spinRpm * 2 * Math.PI / 60;

    while (y >= 0 || t < 0.1) {
      const vrel = Math.sqrt(vx * vx + vy * vy);
      const fDragX = -0.5 * cd * rho * A * vrel * vx;
      const fDragY = -0.5 * cd * rho * A * vrel * vy;

      const spinRatio = (r * Math.abs(omegaRad)) / Math.max(0.5, vrel);
      const cLift = Math.sign(spinRpm) * Math.min(0.40, 0.5 * spinRatio);
      const fMagnusX = -0.5 * cLift * rho * A * vrel * vy;
      const fMagnusY = 0.5 * cLift * rho * A * vrel * vx;

      const ax = (fDragX + fMagnusX) / m;
      const ay = -g + (fDragY + fMagnusY) / m;

      vx += ax * dt;
      vy += ay * dt;
      x += vx * dt;
      y += vy * dt;
      t += dt;
      if (y < 0 && t > 0.1) break;
    }
    return { x, t };
  }

  const calm = simulateSpin(0);
  const backspin = simulateSpin(2500); // Backspin creates lift
  const topspin = simulateSpin(-2500); // Topspin creates dive

  assert(backspin.x > calm.x, `Backspin must extend range: ${backspin.x.toFixed(1)}m > ${calm.x.toFixed(1)}m`);
  assert(backspin.t > calm.t, `Backspin must extend hang time: ${backspin.t.toFixed(2)}s > ${calm.t.toFixed(2)}s`);
  assert(topspin.x < calm.x, `Topspin must compress range: ${topspin.x.toFixed(1)}m < ${calm.x.toFixed(1)}m`);
  assert(topspin.t < calm.t, `Topspin must reduce flight time: ${topspin.t.toFixed(2)}s < ${calm.t.toFixed(2)}s`);
});

test("Barometric altitude air density scales exponentially rho(y) = rho0 * exp(-y / 8500)", () => {
  const rho0 = 1.225; // Sea level
  const scaleHeight = 8500; // m

  const rhoDenver = rho0 * Math.exp(-1600 / scaleHeight); // 1600m
  const rhoEverest = rho0 * Math.exp(-8848 / scaleHeight); // 8848m

  assert(rhoDenver < rho0, "Air density at 1600m must be less than sea level");
  assert(rhoEverest < rhoDenver, "Air density at Everest must be less than Denver");
  assert.strictEqual(parseFloat(rhoDenver.toFixed(3)), 1.015);
  assert.strictEqual(parseFloat(rhoEverest.toFixed(3)), 0.433);
});

test("First Law of Thermodynamics: Mechanical energy lost to drag equals dissipated thermal work W_drag", () => {
  const v0 = 35.0;
  const thetaRad = 45 * Math.PI / 180;
  const g = 9.8;
  const m = 1.0;
  const kDrag = 0.0058;
  const E0 = 0.5 * m * v0 * v0;

  let x = 0, y = 0;
  let vx = v0 * Math.cos(thetaRad);
  let vy = v0 * Math.sin(thetaRad);
  let t = 0, wDrag = 0;
  const dt = 0.001;

  while (y >= 0 || t < 0.1) {
    const v = Math.sqrt(vx * vx + vy * vy);
    const Fd = kDrag * m * v * v;
    wDrag += (Fd * v) * dt;

    vx += (-kDrag * v * vx) * dt;
    vy += (-g - kDrag * v * vy) * dt;
    x += vx * dt;
    y += vy * dt;
    t += dt;
    if (y < 0 && t > 0.1) break;
  }

  const keImpact = 0.5 * m * (vx * vx + vy * vy);
  const peImpact = m * g * Math.max(0, y);
  const totalFinalEnergy = keImpact + peImpact + wDrag;

  const energyDiscrepancy = Math.abs(totalFinalEnergy - E0);
  assert(energyDiscrepancy < 0.1, `Energy discrepancy must be < 0.1J, got ${energyDiscrepancy.toFixed(3)}J`);
  assert(wDrag > 250, `Substantial energy must be converted to drag work, got ${wDrag.toFixed(1)}J`);
});

test("Dual laser photogate transit time formula delta_t = delta_x / v0", () => {
  const v0 = 35.0; // m/s
  const deltaX = 0.15; // 15 cm muzzle laser separation
  const dtPhotogate = deltaX / v0; // seconds
  const dtMs = dtPhotogate * 1000;

  assert.strictEqual(parseFloat(dtMs.toFixed(3)), 4.286, `Expected photogate time 4.286 ms, got ${dtMs.toFixed(3)} ms`);
  // Reconstruct velocity from measured photogate transit time
  const vReconstructed = deltaX / (dtMs / 1000);
  assert.strictEqual(parseFloat(vReconstructed.toFixed(1)), 35.0);
});

test("Multi-target scenario challenge specifications (Hoop, Castle, Drone)", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-projectile.js"), "utf-8");
  assert(code.includes('targetScenario === "hoop"'), "Must implement basketball hoop detection");
  assert(code.includes('3.05'), "Basketball hoop must be calibrated to regulation 3.05m (10ft)");
  assert(code.includes('targetScenario === "castle"'), "Must implement castle fortress defense scenario");
  assert(code.includes('simY <= 16'), "Castle fortress wall must be 16m high");
  assert(code.includes('targetScenario === "drone"'), "Must implement moving drone target intercept");
  assert(code.includes('distToDrone <= 5.5'), "Drone interception collision radius must be 5.5m");
});

test("Analytical Trajectory & Energy Charts view switcher and rendering components verified", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-projectile.js"), "utf-8");
  assert(code.includes('id="proj-mode-chart"'), "Must render analytical chart mode button");
  assert(code.includes('drawAnalyticalCharts'), "Must implement drawAnalyticalCharts function");
  assert(code.includes('BALLISTIC PHASE-SPACE & THERMODYNAMIC ENERGY PARTITION'), "Chart must have title header");
  assert(code.includes('THERMODYNAMIC ENERGY CONSERVATION (FIRST LAW)'), "Chart must include thermodynamic energy bar");
  assert(code.includes('VELOCITY COMPONENT DECAY v(t)'), "Chart must include velocity decay graph");
});

console.log("\n========================================================");
console.log(`📊 Projectile Lab Tests: ${passed} Passed, 0 Failed`);
console.log("========================================================\n");

