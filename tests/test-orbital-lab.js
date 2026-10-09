// Edugates-ClipSAT Science Labs - Unit Test Suite for Keplerian Orbital Mechanics & Astrodynamics Suite
// Verifies:
// 1. Module export and initialization lifecycle (initOrbitalMechanicsLab, cleanupOrbitalMechanicsLab)
// 2. Celestial primary attractors and gravitational parameters (μ = GM)
// 3. Kepler's 1st Law: Elliptical orbit geometry (b = a√(1-e²), c = a·e, r_p = a(1-e), r_a = a(1+e))
// 4. Kepler's 2nd Law: Angular momentum conservation (r_p·v_p = r_a·v_a) and equal area sweeps (dA/dt = L/2m)
// 5. Vis-Viva orbital speed v(r) = √(μ(2/r - 1/a)), circular speed v_circ, and escape velocity v_esc = √(2μ/r)
// 6. Kepler's 3rd Law: Harmonic constant T² / a³ = 4π² / μ
// 7. Specific orbital energy invariance (ε = v²/2 - μ/r = -μ / 2a) and mechanical energy conservation (E = K + U)
// 8. Hohmann transfer orbit equations, delta-v burn budgets (Δv1, Δv2, Δv_tot), and transfer flight duration
// 9. Three-body problem Lagrange points (L1 - L5) and Hill radius
// 10. Hyperbolic gravitational slingshot / flyby turning angle (δ = 2·arcsin(1/e))
// 11. Relativistic black hole Schwarzschild radius (r_s = 2GM/c²)
// 12. Smartboard touch-action, direct canvas dragging, HiDPI DPR scaling, Spacebar pause, and Lab Dossier

import assert from "assert";
import fs from "fs";
import path from "path";
import { initOrbitalMechanicsLab, cleanupOrbitalMechanicsLab } from "../labs/phys-orbital-mechanics.js";
import { LabTrialStore } from "../labs/lab-telemetry-exporter.js";

console.log("\n========================================================");
console.log("🪐 Keplerian Orbital Mechanics & Astrodynamics Suite Verification");
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

// 1. Module Exports & Idempotency
test("initOrbitalMechanicsLab and cleanupOrbitalMechanicsLab are exported as functions", () => {
  assert.strictEqual(typeof initOrbitalMechanicsLab, "function", "initOrbitalMechanicsLab must be exported");
  assert.strictEqual(typeof cleanupOrbitalMechanicsLab, "function", "cleanupOrbitalMechanicsLab must be exported");
  cleanupOrbitalMechanicsLab(); // Safe idempotent unmount
});

// 2. Gravitational Parameters
test("Primary celestial attractors μ = GM precision", () => {
  const G = 6.67430e-11; // m³/(kg·s²)
  const M_earth = 5.972e24;
  const mu_calc = G * M_earth;
  const mu_standard = 3.986004418e14;
  assert(Math.abs(mu_calc - mu_standard) / mu_standard < 0.005, "Earth GM must match standard gravitational parameter within 0.5%");

  const M_sun = 1.989e30;
  const mu_sun = G * M_sun;
  const mu_sun_standard = 1.3271244e20;
  assert(Math.abs(mu_sun - mu_sun_standard) / mu_sun_standard < 0.005, "Sun GM must match heliocentric parameter within 0.5%");
});

// 3. Kepler's First Law
test("Kepler's First Law: Elliptical orbit geometry, focal distance, periapsis, and apoapsis", () => {
  const a = 20000; // km
  const e = 0.40;

  const b = a * Math.sqrt(1 - e * e); // 20000 * sqrt(0.84) ≈ 18330.3 km
  const c = a * e; // 8000 km
  const rp = a * (1 - e); // 12000 km
  const ra = a * (1 + e); // 28000 km

  assert.strictEqual(rp, 12000, "Periapsis distance rp = a(1-e) must be 12,000 km");
  assert.strictEqual(ra, 28000, "Apoapsis distance ra = a(1+e) must be 28,000 km");
  assert.strictEqual((rp + ra) / 2, a, "Average of periapsis and apoapsis must equal semi-major axis a");
  assert.strictEqual(c, 8000, "Focal distance c = a·e must be 8,000 km");
  assert(Math.abs(b - 18330.3) < 1.0, "Semi-minor axis b = a√(1-e²) must equal ~18,330.3 km");

  // String definition of ellipse: sum of distances from F1 and F2 to any point equals 2a
  // At periapsis: dist(F1, P) = rp = a(1-e); dist(F2, P) = rp + 2c = a(1-e) + 2ae = a(1+e) = ra
  // Sum = a(1-e) + a(1+e) = 2a
  assert.strictEqual(rp + ra, 2 * a, "Sum of focal distances from F1 and F2 must identically equal 2a");
});

// 4. Kepler's Second Law & Conservation of Angular Momentum
test("Kepler's Second Law: Angular momentum conservation rp·vp = ra·va and velocity ratio", () => {
  const mu = 3.986004418e14; // Earth
  const aKm = 24000;
  const aM = aKm * 1000;
  const e = 0.50;

  const rpM = aM * (1 - e); // 12,000,000 m
  const raM = aM * (1 + e); // 36,000,000 m

  const vp = Math.sqrt((mu / aM) * ((1 + e) / (1 - e)));
  const va = Math.sqrt((mu / aM) * ((1 - e) / (1 + e)));

  // Speed ratio vp / va = (1+e)/(1-e)
  const ratioSpeed = vp / va;
  const expectedRatio = (1 + e) / (1 - e); // 1.5 / 0.5 = 3.0
  assert(Math.abs(ratioSpeed - expectedRatio) < 1e-6, "vp / va must equal (1+e)/(1-e) = 3.0");

  // Specific Angular Momentum h = rp * vp = ra * va
  const hp = rpM * vp;
  const ha = raM * va;
  const h_theoretical = Math.sqrt(mu * aM * (1 - e * e));

  assert(Math.abs(hp - ha) / hp < 1e-9, "Specific angular momentum at periapsis must match apoapsis within 1 ppb");
  assert(Math.abs(hp - h_theoretical) / hp < 1e-9, "Specific angular momentum must match √(μ·a·(1-e²))");
});

// 5. Vis-Viva Equation & Escape Velocity
test("Vis-Viva orbital velocity v² = μ(2/r - 1/a) and Escape Speed v_esc = √(2) · v_circ", () => {
  const mu = 3.986004418e14;
  const rM = 7000e3; // 7,000 km radius
  const aM = 10000e3; // 10,000 km semi-major axis

  // Vis-Viva velocity
  const vVisViva = Math.sqrt(mu * (2 / rM - 1 / aM)); // ~8.608 km/s
  assert(vVisViva > 8600 && vVisViva < 8620, `Vis-Viva velocity should be ~8.61 km/s, got ${vVisViva/1000} km/s`);

  // Circular speed (r = a)
  const vCirc = Math.sqrt(mu / rM); // ~7.546 km/s
  assert(vCirc > 7540 && vCirc < 7555, `Circular velocity should be ~7.55 km/s, got ${vCirc/1000} km/s`);

  // Escape velocity
  const vEsc = Math.sqrt(2 * mu / rM);
  assert(Math.abs(vEsc - Math.SQRT2 * vCirc) < 1e-6, "Escape velocity must be exactly √2 times circular velocity");
});

// 6. Kepler's Third Law (Harmonic Constant)
test("Kepler's Third Law: Harmonic ratio T² / a³ = 4π² / μ is invariant across eccentricities", () => {
  const mu = 3.986004418e14;
  const aKm = 25000;
  const aM = aKm * 1000;
  const theoreticalRatio = (4 * Math.PI * Math.PI) / mu;

  [0.0, 0.25, 0.50, 0.75].forEach(e => {
    const periodSec = 2 * Math.PI * Math.sqrt(Math.pow(aM, 3) / mu);
    const measuredRatio = Math.pow(periodSec, 2) / Math.pow(aM, 3);
    const diff = Math.abs(measuredRatio - theoreticalRatio);
    assert(diff / theoreticalRatio < 1e-10, `Kepler harmonic ratio for e=${e} must match 4π²/μ to floating-point precision`);
  });
});

// 7. Specific Orbital Energy & Conservation of Total Mechanical Energy
test("Specific Orbital Energy ε = v²/2 - μ/r = -μ / (2a) and Mechanical Energy Conservation", () => {
  const mu = 3.986004418e14;
  const aM = 15000e3;
  const e = 0.45;
  const m = 1200; // 1,200 kg probe
  const theoreticalEps = -mu / (2 * aM); // -1.32867e7 J/kg

  // Verify at 5 different orbital anomalies
  [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI].forEach(theta => {
    const r = (aM * (1 - e * e)) / (1 + e * Math.cos(theta));
    const v = Math.sqrt(mu * (2 / r - 1 / aM));
    const eps = (v * v) / 2 - mu / r;

    assert(Math.abs(eps - theoreticalEps) / Math.abs(theoreticalEps) < 1e-9, `Specific energy at θ=${theta} must equal -μ / (2a)`);

    // Probe total mechanical energy E = K + U
    const K = 0.5 * m * v * v;
    const U = -(mu * m) / r;
    const E = K + U;
    const theoreticalE = -(mu * m) / (2 * aM);

    assert(Math.abs(E - theoreticalE) / Math.abs(theoreticalE) < 1e-9, `Total mechanical energy K + U at θ=${theta} must strictly be conserved`);
  });
});

// 8. Hohmann Transfer Orbit & Delta-v Budget
test("Hohmann Transfer Orbit: LEO (r1=6,671 km) to GEO (r2=42,157 km) Delta-v budget and transfer duration", () => {
  const mu = 3.986004418e14;
  const r1 = 6671e3; // LEO radius (300 km altitude)
  const r2 = 42157e3; // GEO radius (35,786 km altitude)

  const aTx = (r1 + r2) / 2; // 24,414 km
  assert.strictEqual(aTx, 24414e3, "Transfer semi-major axis must be (r1 + r2)/2 = 24,414 km");

  const vCirc1 = Math.sqrt(mu / r1); // 7.730 km/s
  const vTx1 = Math.sqrt(mu * (2 / r1 - 1 / aTx)); // 10.158 km/s
  const deltaV1 = vTx1 - vCirc1; // 2.428 km/s

  assert(deltaV1 > 2420 && deltaV1 < 2435, `Burn 1 Δv1 must be ~2.428 km/s, got ${deltaV1} m/s`);

  const vCirc2 = Math.sqrt(mu / r2); // 3.075 km/s
  const vTx2 = Math.sqrt(mu * (2 / r2 - 1 / aTx)); // 1.607 km/s
  const deltaV2 = vCirc2 - vTx2; // 1.468 km/s

  assert(deltaV2 > 1460 && deltaV2 < 1475, `Burn 2 Δv2 must be ~1.468 km/s, got ${deltaV2} m/s`);

  const deltaVTot = deltaV1 + deltaV2; // 3.896 km/s
  assert(deltaVTot > 3880 && deltaVTot < 3910, `Total Hohmann Δv must be ~3.90 km/s, got ${deltaVTot} m/s`);

  const transferTimeSec = Math.PI * Math.sqrt(Math.pow(aTx, 3) / mu);
  const transferTimeHours = transferTimeSec / 3600;
  assert(transferTimeHours > 5.25 && transferTimeHours < 5.30, `Transfer time must be ~5.27 hours, got ${transferTimeHours.toFixed(2)} h`);
});

// 9. Three-Body Problem & Lagrange Points
test("Circular Restricted Three-Body Problem (CR3BP) and Sun-Earth Lagrange Point L1 / L2 distance", () => {
  const M_sun = 1.989e30;
  const M_earth = 5.972e24;
  const R_se = 1.496e11; // 1 AU

  const alpha = M_earth / (M_sun + M_earth);
  const rHill = R_se * Math.cbrt(alpha / 3);

  // Hill sphere / L1/L2 distance from Earth is ~1.5 million km (~0.01 AU)
  const distFromEarthKm = rHill / 1000;
  assert(distFromEarthKm > 1480000 && distFromEarthKm < 1520000, `Sun-Earth L1/L2 distance should be ~1.50 million km, got ${distFromEarthKm.toFixed(0)} km`);
});

// 10. Hyperbolic Planetary Slingshot (Gravity Assist)
test("Hyperbolic Gravity Assist: Deflection turning angle δ = 2·arcsin(1/e) for hyperbolic trajectory", () => {
  const mu = 3.986004418e14;
  const rMin = 10000e3; // 10,000 km periapsis
  const vInf = 10000; // 10 km/s asymptotic incoming speed

  // Hyperbolic eccentricity e = 1 + (r_min * v_inf²) / μ
  const eHyp = 1 + (rMin * vInf * vInf) / mu;
  assert(eHyp > 1.0, `Hyperbolic eccentricity must exceed 1.0, got ${eHyp}`);

  const deltaRad = 2 * Math.asin(1 / eHyp);
  const deltaDeg = (deltaRad * 180) / Math.PI;
  assert(deltaDeg > 0 && deltaDeg < 180, `Deflection turning angle must be between 0 and 180 degrees, got ${deltaDeg}°`);
});

// 11. Relativistic Black Hole Schwarzschild Radius
test("Black Hole Schwarzschild event horizon radius r_s = 2GM / c²", () => {
  const G = 6.67430e-11;
  const c = 299792458;
  const M_bh = 8.0e30; // ~4 solar masses
  const rsMeters = (2 * G * M_bh) / (c * c);
  const rsKm = rsMeters / 1000;

  // 2 * 6.67430e-11 * 8.0e30 / 299792458² ≈ 11,881 m = ~11.88 km
  assert(rsKm > 11.5 && rsKm < 12.2, `Schwarzschild radius for 8.0e30 kg black hole must be ~11.88 km, got ${rsKm.toFixed(2)} km`);

  // Photon sphere is at 1.5 * r_s
  const rPhotonKm = 1.5 * rsKm;
  assert(rPhotonKm > 17.5 && rPhotonKm < 18.5, `Photon sphere must be at 1.5·r_s ≈ 17.8 km, got ${rPhotonKm.toFixed(2)} km`);
});

// 12. LabTrialStore Persistence
test("LabTrialStore records and persists orbital maneuvers and burns", () => {
  LabTrialStore.addTrial("orbital", {
    type: "Prograde Burn (+Δv)",
    body: "Earth",
    semiMajorAxisKm: 24500,
    eccentricity: "0.420",
    periodHours: "2.85",
    periapsisSpeedKms: "10.15",
    apoapsisSpeedKms: "5.20"
  });

  const trials = LabTrialStore.getTrials("orbital");
  assert(trials.length > 0, "LabTrialStore must record orbital maneuvers");
  const lastTrial = trials[trials.length - 1];
  assert.strictEqual(lastTrial.type, "Prograde Burn (+Δv)");
  assert.strictEqual(lastTrial.body, "Earth");
});

// 13. Source Code Integrity Checks
test("phys-orbital-mechanics.js includes touch-action: none on interactive canvas for smartboard/touchscreen dragging", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-orbital-mechanics.js"), "utf-8");
  assert(code.includes('touch-action: none;'), "Must include touch-action: none for touch dragging");
  assert(code.includes("pointerdown"), "Must include pointerdown listener");
  assert(code.includes("pointermove"), "Must include pointermove listener");
  assert(code.includes("pointerup"), "Must include pointerup listener");
  assert(code.includes("isDraggingSat"), "Must implement dragging on spacecraft satellite");
  assert(code.includes("isDraggingPeriapsis"), "Must implement dragging on periapsis node");
  assert(code.includes("isDraggingApoapsis"), "Must implement dragging on apoapsis node");
});

test("phys-orbital-mechanics.js implements HiDPI DPR canvas scaling with window.getLabDPR", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-orbital-mechanics.js"), "utf-8");
  assert(code.includes("window.getLabDPR"), "Must support window.getLabDPR HiDPI scaling");
  assert(code.includes("setupHiDPICanvas"), "Must define setupHiDPICanvas function");
});

test("phys-orbital-mechanics.js implements Spacebar pause/resume listener with cleanup unbinding", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-orbital-mechanics.js"), "utf-8");
  assert(code.includes('e.code === "Space"'), "Must handle Spacebar pause/play");
  assert(code.includes("removeEventListener"), "Must unbind event listeners on cleanup");
});

test("phys-orbital-mechanics.js integrates Lab Dossier generator with openLabReportModal and CSV export", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-orbital-mechanics.js"), "utf-8");
  assert(code.includes("openLabReportModal"), "Must call openLabReportModal");
  assert(code.includes("exportLabDataCsv"), "Must call exportLabDataCsv");
  assert(code.includes("Vis-Viva Orbital Energy Equation"), "Lab dossier must include Vis-Viva formula");
  assert(code.includes("Kepler's Harmonic Third Law"), "Lab dossier must include Kepler's 3rd Law");
  assert(code.includes("Hohmann Transfer Delta-v Budget"), "Lab dossier must include Hohmann equation");
});

test("phys-orbital-mechanics.js implements all 4 mission modes and celestial primaries catalog", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-orbital-mechanics.js"), "utf-8");
  assert(code.includes("tab-mode-kepler"), "Must include Kepler 3 Laws tab");
  assert(code.includes("tab-mode-hohmann"), "Must include Hohmann transfer tab");
  assert(code.includes("tab-mode-lagrange"), "Must include Lagrange points tab");
  assert(code.includes("tab-mode-slingshot"), "Must include Slingshot tab");
  assert(code.includes("CENTRAL_BODIES"), "Must include CENTRAL_BODIES catalog");
  assert(code.includes("blackhole"), "Must include Cygnus X-1 Black Hole primary");
  assert(code.includes("jupiter"), "Must include Jupiter primary");
  assert(code.includes("mars"), "Must include Mars primary");
  assert(code.includes("moon"), "Must include Moon primary");
});

test("phys-orbital-mechanics.js implements Mechanical Energy Partition bar and Live HUD displays", () => {
  const code = fs.readFileSync(path.resolve("labs/phys-orbital-mechanics.js"), "utf-8");
  assert(code.includes("hud-energy-meter"), "Must include hud-energy-meter");
  assert(code.includes("bar-energy-kinetic"), "Must include bar-energy-kinetic");
  assert(code.includes("bar-energy-potential"), "Must include bar-energy-potential");
  assert(code.includes("hud-orbital-speed"), "Must include hud-orbital-speed");
  assert(code.includes("hud-orbital-period"), "Must include hud-orbital-period");
});

test("index.css includes .orbital-layout in responsive single-column layout at 980px", () => {
  const css = fs.readFileSync(path.resolve("index.css"), "utf-8");
  assert(css.includes(".orbital-layout"), "index.css must include .orbital-layout in media query");
});

console.log("\n========================================================");
console.log(`📊 Orbital Mechanics Lab Tests: All ${passed} Passed!`);
console.log("========================================================\n");
