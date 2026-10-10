// Edugates-ClipSAT Science Labs - Physics: Precision Keplerian Orbital Mechanics & Astrodynamics Suite
// 60 FPS Multi-Primary Celestial Astrodynamics & Spaceflight Navigation Engine:
// 1. Central Gravitational Field & Vis-Viva Equation: F = -GMm/r² · r̂, v² = μ(2/r - 1/a)
// 2. Kepler's Three Laws:
//    - 1st Law: Elliptical orbits with primary attractor at focus F1 (r1 + r2 = 2a)
//    - 2nd Law: Law of Equal Areas (dA/dt = L / 2m = constant sector sweeping)
//    - 3rd Law: Harmonic Law (T² / a³ = 4π² / GM)
// 3. Hohmann Transfer Orbital Burns:
//    - Δv1 (departure at periapsis), Δv2 (insertion at apoapsis), transfer duration t_tx = π√(a_tx³ / μ)
// 4. Circular Restricted Three-Body Problem (CR3BP) & Lagrange Equilibrium Points (L1, L2, L3, L4, L5)
// 5. Hyperbolic Planetary Slingshot & Gravity Assist: Deflection angle δ = 2·arcsin(1/e), momentum scavenging
// 6. Mechanical Energy Partition: Conserved Total E = K + U = -GMm / (2a)
// 7. Interactive Tactile Dragging on Orbit Nodes, Spacecraft Plumes, HiDPI DPR, and Lab Dossier Exporter.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

let _currentOrbitalCleanup = null;

export function cleanupOrbitalMechanicsLab(containerId) {
  if (typeof _currentOrbitalCleanup === "function") {
    _currentOrbitalCleanup();
    _currentOrbitalCleanup = null;
  }
}

export function initOrbitalMechanicsLab(containerId) {
  cleanupOrbitalMechanicsLab(containerId);

  const container = document.getElementById(containerId);
  if (!container) return () => {};

  // Standard Gravitational Constant G = 6.67430 × 10⁻¹¹ m³/(kg·s²)
  const G_CONST = 6.67430e-11;
  const SPEED_OF_LIGHT = 299792458; // m/s

  // Celestial Primary Attractors Catalog
  const CENTRAL_BODIES = {
    earth: {
      name: "Planet Earth (M = 5.972 × 10²⁴ kg)",
      shortName: "Earth",
      massKg: 5.972e24,
      radiusKm: 6371,
      gm: 3.986004418e14, // m³/s² (standard gravitational parameter μ)
      color: "#0284c7",
      glowColor: "rgba(56, 189, 248, 0.55)",
      atmosphereKm: 120,
      description: "Terrestrial primary attractor. Low Earth Orbit (LEO, 300 km) to Geostationary (GEO, 35,786 km).",
      type: "planet"
    },
    moon: {
      name: "The Moon (M = 7.342 × 10²² kg)",
      shortName: "Moon",
      massKg: 7.342e22,
      radiusKm: 1737,
      gm: 4.9048695e12,
      color: "#94a3b8",
      glowColor: "rgba(203, 213, 225, 0.4)",
      atmosphereKm: 0,
      description: "Airless cratered satellite. Low Lunar Orbit (LLO, 100 km) and lunar descent trajectories.",
      type: "moon"
    },
    mars: {
      name: "Planet Mars (M = 6.417 × 10²³ kg)",
      shortName: "Mars",
      massKg: 6.417e23,
      radiusKm: 3390,
      gm: 4.282837e13,
      color: "#ea580c",
      glowColor: "rgba(249, 115, 22, 0.5)",
      atmosphereKm: 60,
      description: "Red Planet attractor. Thin CO₂ atmosphere, Areostationary orbit, and interplanetary insertion.",
      type: "planet"
    },
    jupiter: {
      name: "Jupiter (M = 1.898 × 10²⁷ kg)",
      shortName: "Jupiter",
      massKg: 1.898e27,
      radiusKm: 69911,
      gm: 1.26686534e17,
      color: "#d97706",
      glowColor: "rgba(245, 158, 11, 0.55)",
      atmosphereKm: 1000,
      description: "Massive Jovian gas giant. Powerful gravity well, Great Red Spot, and Galilean moon orbital resonance.",
      type: "gas_giant"
    },
    sun: {
      name: "The Sun (M = 1.989 × 10³⁰ kg)",
      shortName: "Sun",
      massKg: 1.989e30,
      radiusKm: 696340,
      gm: 1.32712440018e20,
      color: "#f59e0b",
      glowColor: "rgba(251, 191, 36, 0.65)",
      atmosphereKm: 2000,
      description: "Heliocentric primary. Planetary orbital mechanics, Lagrange points, and comet trajectories.",
      type: "star"
    },
    blackhole: {
      name: "Cygnus X-1 Black Hole (M = 8.0 × 10³⁰ kg)",
      shortName: "Black Hole",
      massKg: 8.0e30,
      radiusKm: 24, // Event horizon r_s = 2GM/c² ≈ 23.7 km
      gm: 5.33944e20,
      color: "#09090b",
      glowColor: "rgba(168, 85, 247, 0.75)",
      atmosphereKm: 0,
      description: "Stellar-mass black hole. Relativistic event horizon, photon sphere (1.5 r_s), and accretion disk.",
      type: "black_hole"
    }
  };

  // Orbital Canonical Presets Dictionary
  const ORBITAL_PRESETS = {
    custom: { name: "Custom User Orbit", e: 0.35, aScale: 1.0 },
    low_orbit: { name: "Low Circular Orbit (LEO / LLO)", e: 0.02, aScale: 0.75 },
    geostationary: { name: "Geostationary / Synchronous (GEO)", e: 0.00, aScale: 1.35 },
    molniya: { name: "Molniya Highly Elliptical Orbit", e: 0.72, aScale: 1.20 },
    gto: { name: "Geostationary Transfer Orbit (GTO)", e: 0.73, aScale: 1.10 },
    comet: { name: "High-Eccentricity Comet Trajectory", e: 0.84, aScale: 1.45 }
  };

  // State Variables
  let currentMissionMode = "kepler"; // "kepler", "hohmann", "lagrange", "slingshot"
  let currentBodyKey = "earth";
  let currentPresetKey = "custom";
  let semiMajorAxisScale = 1.0; // 0.65 to 1.65 relative
  let eccentricity = 0.35; // 0.0 (circular) to 0.85 (highly eccentric)
  let trueAnomaly = 0.0; // Current orbital angle θ (radians)
  let simulationSpeed = 1.0; // Time warp factor
  let isRunning = true;
  let viewMode = "sim"; // "sim" or "photo"
  let animId = null;

  // Visual Overlays Toggles
  let showEqualAreas = true;
  let showVectors = true;
  let showFociAndStrings = true;
  let showEnergyMeter = true;

  // Kepler 2nd Law Equal Area Sector Slices
  let sweepSlices = [];
  let lastSliceAngle = 0;

  // Satellite Mass (kg) for Absolute Energy Telemetry
  const satelliteMassKg = 1200; // 1,200 kg scientific space probe

  // Hohmann Transfer State Machine
  // 0 = Parked in Orbit 1 (r1)
  // 1 = Executed Burn 1, coasting on transfer ellipse (a_tx)
  // 2 = Executed Burn 2, circularized in Orbit 2 (r2)
  let hohmannState = 0;
  let hohmannAnomaly = 0; // True anomaly along transfer ellipse (0 to π)
  let hohmannR1Ratio = 0.70; // Fraction of base radius
  let hohmannR2Ratio = 1.40; // Target orbit radius ratio
  let hohmannBurnAnimation = 0; // 0 = idle, >0 = active rocket flame frame counter
  let hohmannBurnType = "departure"; // "departure" or "insertion"

  // Slingshot / Flyby State
  let slingshotAnomaly = -Math.PI * 0.75;
  let slingshotApproachSpeedKms = 12.0; // v_infinity (km/s)
  let slingshotPeriapsisDistScale = 1.25; // Closest approach r_min

  // Interactive Dragging on Canvas Handles
  let isDraggingSat = false;
  let isDraggingPeriapsis = false;
  let isDraggingApoapsis = false;
  let dragHoverTarget = null; // "sat", "periapsis", "apoapsis" or null

  // Redraw Flag
  let needsRedraw = true;

  // Mathematical & Astrodynamics Calculations
  function calculateOrbitalState() {
    const body = CENTRAL_BODIES[currentBodyKey];

    // Visual Canvas Scaling
    const aVisual = 155 * semiMajorAxisScale;
    const bVisual = aVisual * Math.sqrt(Math.max(0.005, 1 - eccentricity * eccentricity));
    const cVisual = aVisual * eccentricity; // Focal distance from center
    const pVisual = aVisual * (1 - eccentricity * eccentricity); // Semi-latus rectum

    // Real Physical Astrodynamics Scaling (km)
    // Scale calibrated such that 1.0x scale corresponds to realistic terrestrial or celestial orbits
    let baseRefKm = body.radiusKm * 3.6;
    if (body.type === "black_hole") baseRefKm = 120; // 120 km orbit around black hole
    if (body.type === "star") baseRefKm = 1.496e8 * 0.35; // Solar system inner scale

    const aKm = baseRefKm * semiMajorAxisScale;
    const rpKm = aKm * (1 - eccentricity);
    const raKm = aKm * (1 + eccentricity);
    const pKm = aKm * (1 - eccentricity * eccentricity);

    // Orbital Period T = 2π * √(a³ / μ)
    const aMeters = aKm * 1000;
    const periodSec = 2 * Math.PI * Math.sqrt(Math.pow(aMeters, 3) / body.gm);
    const periodHours = periodSec / 3600;
    const periodDays = periodHours / 24;

    // Current Radius r(θ) = p / (1 + e cos θ)
    const rCurrentKm = (aKm * (1 - eccentricity * eccentricity)) / (1 + eccentricity * Math.cos(trueAnomaly));
    const rCurrentVisual = (aVisual * (1 - eccentricity * eccentricity)) / (1 + eccentricity * Math.cos(trueAnomaly));

    // Vis-Viva Equation: v(r) = √(μ * (2/r - 1/a))
    const currentSpeedMs = Math.sqrt(Math.max(1, body.gm * (2 / (rCurrentKm * 1000) - 1 / aMeters)));
    const currentSpeedKms = currentSpeedMs / 1000;

    // Speeds at Extremes
    const periapsisSpeedKms = Math.sqrt(Math.max(1, (body.gm / aMeters) * ((1 + eccentricity) / (1 - eccentricity)))) / 1000;
    const apoapsisSpeedKms = Math.sqrt(Math.max(1, (body.gm / aMeters) * ((1 - eccentricity) / (1 + eccentricity)))) / 1000;
    const circularSpeedKms = Math.sqrt(body.gm / aMeters) / 1000;
    const escapeSpeedKms = Math.sqrt(2 * body.gm / (rCurrentKm * 1000)) / 1000;

    // Specific Angular Momentum h = r * v_tangent = √(μ * a * (1 - e²))
    const specificAngularMomentum = Math.sqrt(body.gm * aMeters * (1 - eccentricity * eccentricity));

    // Specific Orbital Energy ε = v²/2 - μ/r = -μ / (2a)
    const specificEnergyJ = -body.gm / (2 * aMeters);

    // Absolute Probe Energies (Joules)
    const kineticEnergyJ = 0.5 * satelliteMassKg * Math.pow(currentSpeedMs, 2);
    const potentialEnergyJ = -(body.gm * satelliteMassKg) / (rCurrentKm * 1000);
    const totalMechanicalEnergyJ = kineticEnergyJ + potentialEnergyJ; // Invariant = -GMm / (2a)

    // Kepler 3rd Law Harmonic Constant: T² / a³ = 4π² / μ
    const theoreticalHarmonic = (4 * Math.PI * Math.PI) / body.gm;
    const measuredHarmonic = Math.pow(periodSec, 2) / Math.pow(aMeters, 3);
    const harmonicErrorPercent = Math.abs(measuredHarmonic - theoreticalHarmonic) / theoreticalHarmonic * 100;

    // Velocity Components: v_r = √(μ/p) * e * sin θ; v_θ = √(μ/p) * (1 + e cos θ)
    const pMeters = pKm * 1000;
    const vRadialKms = (Math.sqrt(body.gm / pMeters) * eccentricity * Math.sin(trueAnomaly)) / 1000;
    const vTangentialKms = (Math.sqrt(body.gm / pMeters) * (1 + eccentricity * Math.cos(trueAnomaly))) / 1000;

    // Gravitational Acceleration at r: g(r) = μ / r²
    const gAccMs2 = body.gm / Math.pow(rCurrentKm * 1000, 2);

    // Hohmann Transfer Budget (r1 -> r2)
    const r1HohmannKm = baseRefKm * hohmannR1Ratio;
    const r2HohmannKm = baseRefKm * hohmannR2Ratio;
    const aTxKm = (r1HohmannKm + r2HohmannKm) / 2;
    const aTxM = aTxKm * 1000;
    const r1M = r1HohmannKm * 1000;
    const r2M = r2HohmannKm * 1000;

    const vCirc1Ms = Math.sqrt(body.gm / r1M);
    const vTx1Ms = Math.sqrt(body.gm * (2 / r1M - 1 / aTxM));
    const deltaV1Ms = vTx1Ms - vCirc1Ms; // Periapsis burn

    const vCirc2Ms = Math.sqrt(body.gm / r2M);
    const vTx2Ms = Math.sqrt(body.gm * (2 / r2M - 1 / aTxM));
    const deltaV2Ms = vCirc2Ms - vTx2Ms; // Apoapsis burn
    const deltaVTotMs = Math.abs(deltaV1Ms) + Math.abs(deltaV2Ms);

    const hohmannTransferTimeSec = Math.PI * Math.sqrt(Math.pow(aTxM, 3) / body.gm);
    const hohmannTransferTimeHours = hohmannTransferTimeSec / 3600;

    return {
      body,
      aVisual,
      bVisual,
      cVisual,
      pVisual,
      aKm,
      rpKm,
      raKm,
      pKm,
      periodSec,
      periodHours,
      periodDays,
      rCurrentKm,
      rCurrentVisual,
      currentSpeedMs,
      currentSpeedKms,
      periapsisSpeedKms,
      apoapsisSpeedKms,
      circularSpeedKms,
      escapeSpeedKms,
      vRadialKms,
      vTangentialKms,
      gAccMs2,
      specificAngularMomentum,
      specificEnergyJ,
      kineticEnergyJ,
      potentialEnergyJ,
      totalMechanicalEnergyJ,
      theoreticalHarmonic,
      measuredHarmonic,
      harmonicErrorPercent,
      // Hohmann transfer elements
      r1HohmannKm,
      r2HohmannKm,
      aTxKm,
      vCirc1Ms,
      vTx1Ms,
      deltaV1Ms,
      vCirc2Ms,
      vTx2Ms,
      deltaV2Ms,
      deltaVTotMs,
      hohmannTransferTimeSec,
      hohmannTransferTimeHours
    };
  }

  // Initial HTML Scaffold
  container.innerHTML = `
    <div class="lab-container">
      <!-- Top Astrodynamics Command Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.94); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <span style="font-size: 0.86rem; font-weight: 800; color: #818cf8; text-transform: uppercase; letter-spacing: 0.06em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #6366f1; box-shadow: 0 0 12px #6366f1; animation: pulse 2s infinite;"></span>
            Keplerian Astrodynamics &amp; Spaceflight Suite
          </span>
          <span class="badge" style="background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.35); color: #c7d2fe; font-size: 0.74rem; padding: 4px 10px; border-radius: 9999px;">
            ${renderLatex("v^2 = \\mu\\left(\\frac{2}{r}-\\frac{1}{a}\\right) \\quad \\bullet \\quad T^2 = \\frac{4\\pi^2}{\\mu}a^3 \\quad \\bullet \\quad \\Delta v_{tot} = \\Delta v_1 + \\Delta v_2")}
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <!-- 4K / Sim View Switcher -->
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.45); border: 1px solid #334155; border-radius: 8px; padding: 2px;">
            <button id="view-mode-orbital-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.76rem; font-weight: 700; border-radius: 6px; border: none;">
              🪐 Orbital Orbit View
            </button>
            <button id="view-mode-orbital-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.76rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>

          <button class="btn btn-secondary btn-sm" id="btn-orbital-pause" title="Toggle simulation (Spacebar)" style="padding: 5px 11px; font-size: 0.78rem;">
            ⏸️ Pause
          </button>
          <button class="btn btn-primary btn-sm" id="btn-orbital-burn-prograde" style="padding: 5px 12px; font-size: 0.78rem; background: linear-gradient(135deg, #4f46e5, #6366f1);">
            🚀 +Δv Prograde
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-orbital-burn-retrograde" style="padding: 5px 11px; font-size: 0.78rem;">
            🛑 -Δv Retrograde
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-orbital-circularize" style="padding: 5px 11px; font-size: 0.78rem;">
            ⭕ Circularize (e=0)
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-open-orbital-report" style="padding: 5px 11px; font-size: 0.78rem; border-color: rgba(99, 102, 241, 0.4); color: #a5b4fc;">
            📋 Lab Dossier
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-orbital-export" style="padding: 5px 11px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Ephemeris CSV
          </button>
        </div>
      </div>

      <!-- Main Layout Grid -->
      <div style="display: grid; grid-template-columns: 1.18fr 1fr; gap: 18px;" class="orbital-layout">
        <!-- Canvas Viewport Column -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(99, 102, 241, 0.35); box-shadow: 0 20px 50px -10px rgba(0,0,0,0.9); background: radial-gradient(circle at center, #0f172a 0%, #060913 60%, #000000 100%); border-radius: 12px; overflow: hidden; height: 570px;">
          <canvas id="orbital-canvas" width="620" height="570" style="height: 570px; width: 100%; display: block; touch-action: none; cursor: crosshair;"></canvas>

          <!-- 4K Real Laboratory Photograph Overlay -->
          <div id="orbital-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <picture>
              <source srcset="assets/labs/orbital_bench.webp" type="image/webp">
              <img src="assets/labs/orbital_bench.jpg" decoding="async" loading="lazy" alt="4K Research Orbital Dynamics & Mission Control Telemetry Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            </picture>
            
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Orbital Integrator</div>
                <div style="color: #818cf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.88rem;">Symplectic Runge-Kutta 4th</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Apoapsis / Periapsis Radar</div>
                <div style="color: #facc15; font-weight: 700; font-family: var(--font-mono); font-size: 0.88rem;">Dual-Band Space Surveillance</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Delta-v Budget</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.88rem;">Hohmann Transfer Calculator</div>
              </div>
            </div>
          </div>

          <!-- Top HUD Display -->
          <div style="position: absolute; top: 12px; left: 14px; right: 14px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <!-- Left HUD: Speed & Distance -->
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.65rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.05em;">ORBITAL VELOCITY (VIS-VIVA)</div>
              <div id="hud-orbital-speed" style="font-size: 1.05rem; font-weight: 800; color: #818cf8; font-family: var(--font-mono);">
                v = 7.62 km/s (r = 7,450 km)
              </div>
            </div>

            <!-- Center Mission Mode Badge -->
            <div id="hud-orbital-status" style="background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(56, 189, 248, 0.35); border-radius: 20px; padding: 5px 14px; text-align: center; pointer-events: auto;">
              <span id="badge-mission-status" style="font-size: 0.72rem; font-weight: 700; color: #38bdf8; font-family: var(--font-mono); text-transform: uppercase;">
                Keplerian Elliptical Orbit
              </span>
            </div>

            <!-- Right HUD: Period & Eccentricity -->
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.65rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.05em;">PERIOD &amp; ECCENTRICITY</div>
              <div id="hud-orbital-period" style="font-size: 1.05rem; font-weight: 800; color: #fbbf24; font-family: var(--font-mono);">
                T = 2.45 h • e = 0.350
              </div>
            </div>
          </div>

          <!-- Bottom In-Canvas HUD: Conserved Mechanical Energy Partition -->
          <div id="hud-energy-meter" style="position: absolute; bottom: 12px; left: 14px; right: 14px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(12px); border: 1px solid rgba(148, 163, 184, 0.25); border-radius: 10px; padding: 8px 14px; pointer-events: auto; z-index: 5; display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.70rem; font-family: var(--font-mono);">
              <span style="color: #94a3b8; font-weight: 700;">CONSERVED MECHANICAL ENERGY (E = K + U = -GMm / 2a):</span>
              <span id="lbl-total-energy" style="color: #38bdf8; font-weight: 800;">-31.25 GJ</span>
            </div>
            <!-- Stacked Energy Visual Bar -->
            <div style="display: flex; height: 10px; border-radius: 5px; overflow: hidden; background: #030712; border: 1px solid #334155;">
              <div id="bar-energy-kinetic" style="width: 50%; background: linear-gradient(90deg, #10b981, #34d399); transition: width 0.1s linear;" title="Kinetic Energy K = 1/2 m v²"></div>
              <div id="bar-energy-potential" style="width: 50%; background: linear-gradient(90deg, #f43f5e, #fb7185); transition: width 0.1s linear;" title="Gravitational Potential Energy U = -GMm / r"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.68rem; font-family: var(--font-mono);">
              <span style="color: #34d399;">Kinetic K: <strong id="lbl-kinetic-energy">32.84 GJ</strong></span>
              <span style="color: #f43f5e;">Potential U: <strong id="lbl-potential-energy">-64.09 GJ</strong></span>
            </div>
          </div>
        </div>

        <!-- Controls & Mission Control Column -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <!-- Mission Mode Selector Tabs -->
          <div style="background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: 12px; padding: 6px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
            <button id="tab-mode-kepler" class="btn btn-secondary active" style="padding: 7px 6px; font-size: 0.72rem; font-weight: 700; border-radius: 8px; border: none; background: #4f46e5; color: #fff;">
              🪐 3 Laws
            </button>
            <button id="tab-mode-hohmann" class="btn btn-secondary" style="padding: 7px 6px; font-size: 0.72rem; font-weight: 600; border-radius: 8px; border: none; background: transparent;">
              🚀 Hohmann
            </button>
            <button id="tab-mode-lagrange" class="btn btn-secondary" style="padding: 7px 6px; font-size: 0.72rem; font-weight: 600; border-radius: 8px; border: none; background: transparent;">
              🛰️ Lagrange
            </button>
            <button id="tab-mode-slingshot" class="btn btn-secondary" style="padding: 7px 6px; font-size: 0.72rem; font-weight: 600; border-radius: 8px; border: none; background: transparent;">
              ☄️ Slingshot
            </button>
          </div>

          <!-- Configuration Panel -->
          <div style="background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 0.76rem; font-weight: 800; color: #818cf8; text-transform: uppercase; letter-spacing: 0.05em;">Attractor &amp; Orbital Geometry</span>
              <span id="badge-drag-hint" style="font-size: 0.68rem; color: #64748b;">👆 Drag satellite or periapsis on canvas</span>
            </div>

            <!-- Primary Attractor Body -->
            <div style="margin-bottom: 10px;">
              <label style="font-size: 0.74rem; color: #94a3b8; display: block; margin-bottom: 4px;">Primary Gravitational Attractor</label>
              <select id="select-orbital-body" class="form-control" style="width: 100%; background: #0b1120; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.80rem;">
                ${Object.entries(CENTRAL_BODIES).map(([k, b]) => `<option value="${k}" ${k === currentBodyKey ? "selected" : ""}>${b.name}</option>`).join("")}
              </select>
            </div>

            <!-- Quick Orbit Preset -->
            <div style="margin-bottom: 10px;">
              <label style="font-size: 0.74rem; color: #94a3b8; display: block; margin-bottom: 4px;">Standard Orbit Presets</label>
              <select id="select-orbit-preset" class="form-control" style="width: 100%; background: #0b1120; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.80rem;">
                ${Object.entries(ORBITAL_PRESETS).map(([k, p]) => `<option value="${k}" ${k === currentPresetKey ? "selected" : ""}>${p.name}</option>`).join("")}
              </select>
            </div>

            <!-- Orbital Eccentricity (e) -->
            <div style="margin-bottom: 10px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.76rem; margin-bottom: 3px;">
                <span style="color: #94a3b8;">Orbital Eccentricity (e)</span>
                <span id="lbl-eccentricity" style="color: #fbbf24; font-weight: 700; font-family: var(--font-mono);">0.35 (Elliptical)</span>
              </div>
              <input id="slider-eccentricity" type="range" min="0.0" max="0.85" step="0.01" value="0.35" style="width: 100%; accent-color: #fbbf24;">
              <div style="display: flex; justify-content: space-between; font-size: 0.65rem; color: #64748b; margin-top: 2px;">
                <span>0.00 (Circle)</span>
                <span>0.50 (Molniya)</span>
                <span>0.85 (Near Parabola)</span>
              </div>
            </div>

            <!-- Semi-Major Axis (a) -->
            <div style="margin-bottom: 10px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.76rem; margin-bottom: 3px;">
                <span style="color: #94a3b8;">Semi-Major Axis Scale (a)</span>
                <span id="lbl-semi-major" style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono);">1.00× (22,936 km)</span>
              </div>
              <input id="slider-semi-major" type="range" min="0.65" max="1.65" step="0.02" value="1.00" style="width: 100%; accent-color: #38bdf8;">
            </div>

            <!-- Time Warp / Simulation Speed -->
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.76rem; margin-bottom: 3px;">
                <span style="color: #94a3b8;">Simulation Time Warp</span>
                <span id="lbl-orbital-speed" style="color: #a5b4fc; font-weight: 700; font-family: var(--font-mono);">1.00× Real-Time</span>
              </div>
              <input id="slider-orbital-speed" type="range" min="0.2" max="3.0" step="0.1" value="1.0" style="width: 100%; accent-color: #818cf8;">
            </div>

            <!-- Visual Feature Checkbox Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: rgba(0,0,0,0.3); border: 1px solid #1e293b; border-radius: 8px; padding: 10px;">
              <label style="display: flex; align-items: center; gap: 8px; font-size: 0.72rem; color: #cbd5e1; cursor: pointer;">
                <input id="toggle-equal-areas" type="checkbox" checked style="accent-color: #6366f1; width: 15px; height: 15px;">
                Kepler 2nd Law Sectors
              </label>
              <label style="display: flex; align-items: center; gap: 8px; font-size: 0.72rem; color: #cbd5e1; cursor: pointer;">
                <input id="toggle-vectors" type="checkbox" checked style="accent-color: #38bdf8; width: 15px; height: 15px;">
                Velocity &amp; Force Vectors
              </label>
              <label style="display: flex; align-items: center; gap: 8px; font-size: 0.72rem; color: #cbd5e1; cursor: pointer;">
                <input id="toggle-foci" type="checkbox" checked style="accent-color: #fbbf24; width: 15px; height: 15px;">
                Dual Foci (F₁, F₂) &amp; String
              </label>
              <label style="display: flex; align-items: center; gap: 8px; font-size: 0.72rem; color: #cbd5e1; cursor: pointer;">
                <input id="toggle-energy-meter" type="checkbox" checked style="accent-color: #10b981; width: 15px; height: 15px;">
                Mechanical Energy Bar
              </label>
            </div>
          </div>

          <!-- Dynamic Mission Sub-Panel -->
          <!-- 1. Kepler Mode Sub-Panel -->
          <div id="panel-mission-kepler" style="background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px;">
            <div style="font-size: 0.76rem; font-weight: 800; color: #a5b4fc; text-transform: uppercase; margin-bottom: 8px;">
              Kepler's Three Laws Verification
            </div>
            <div style="font-size: 0.74rem; color: #cbd5e1; line-height: 1.5; display: flex; flex-direction: column; gap: 6px;">
              <div style="background: #030712; border: 1px solid #1e293b; border-radius: 6px; padding: 8px;">
                <strong style="color: #818cf8;">1st Law (Ellipses):</strong> Primary sits at Focus F₁. Focal distance c = a·e = <span id="lbl-focal-dist" style="color: #fbbf24; font-family: var(--font-mono);">8,027 km</span>. Semi-minor axis b = <span id="lbl-semi-minor" style="color: #38bdf8; font-family: var(--font-mono);">21,482 km</span>.
              </div>
              <div style="background: #030712; border: 1px solid #1e293b; border-radius: 6px; padding: 8px;">
                <strong style="color: #34d399;">2nd Law (Equal Areas):</strong> Sector sweep rate dA/dt = L/2m = const. Probe moves fastest at periapsis and slowest at apoapsis.
              </div>
              <div style="background: #030712; border: 1px solid #1e293b; border-radius: 6px; padding: 8px;">
                <strong style="color: #fbbf24;">3rd Law (Harmonic):</strong> Constant T²/a³ = 4π²/GM. Current ratio = <span id="lbl-kepler-3rd" style="color: #a5b4fc; font-family: var(--font-mono);">9.896 × 10⁻¹⁴ s²/m³</span> (0.00% theoretical dev).
              </div>
            </div>
          </div>

          <!-- 2. Hohmann Transfer Sub-Panel -->
          <div id="panel-mission-hohmann" style="display: none; background: rgba(15, 23, 42, 0.92); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 12px; padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.76rem; font-weight: 800; color: #38bdf8; text-transform: uppercase;">Hohmann Transfer Orbit Engine</span>
              <span id="badge-hohmann-state" class="badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-size: 0.70rem;">
                State: Parked in LEO Orbit
              </span>
            </div>
            
            <div style="font-size: 0.74rem; color: #94a3b8; margin-bottom: 10px;">
              Two-impulse coplanar orbital transfer between parking orbit (r₁) and target orbit (r₂).
            </div>

            <!-- Target Orbit Slider -->
            <div style="margin-bottom: 10px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.74rem; margin-bottom: 3px;">
                <span style="color: #94a3b8;">Target Orbit Radius (r₂)</span>
                <span id="lbl-hohmann-r2" style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono);">42,164 km (GEO scale)</span>
              </div>
              <input id="slider-hohmann-r2" type="range" min="1.0" max="1.8" step="0.05" value="1.40" style="width: 100%; accent-color: #38bdf8;">
            </div>

            <!-- Hohmann Delta-V Telemetry Table -->
            <div style="background: #030712; border: 1px solid #1e293b; border-radius: 8px; padding: 10px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.74rem; font-family: var(--font-mono); margin-bottom: 10px;">
              <div>
                <span style="color: #64748b; display: block;">Burn 1 (LEO Departure):</span>
                <strong id="val-hohmann-dv1" style="color: #34d399;">+2.43 km/s</strong>
              </div>
              <div>
                <span style="color: #64748b; display: block;">Burn 2 (GEO Insertion):</span>
                <strong id="val-hohmann-dv2" style="color: #fbbf24;">+1.47 km/s</strong>
              </div>
              <div>
                <span style="color: #64748b; display: block;">Total Delta-v Budget:</span>
                <strong id="val-hohmann-dvtot" style="color: #818cf8;">3.90 km/s</strong>
              </div>
              <div>
                <span style="color: #64748b; display: block;">Transfer Flight Time:</span>
                <strong id="val-hohmann-time" style="color: #f43f5e;">5.27 hours</strong>
              </div>
            </div>

            <!-- Action Buttons -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <button id="btn-hohmann-burn-1" class="btn btn-primary btn-sm" style="padding: 6px; font-size: 0.74rem; background: #059669;">
                🔥 Execute Burn 1 (LEO Departure)
              </button>
              <button id="btn-hohmann-burn-2" class="btn btn-secondary btn-sm" style="padding: 6px; font-size: 0.74rem; border-color: #f59e0b; color: #fbbf24;">
                🔥 Execute Burn 2 (GEO Insertion)
              </button>
              <button id="btn-hohmann-auto" class="btn btn-secondary btn-sm" style="padding: 6px; font-size: 0.74rem; grid-column: span 2;">
                ⚡ Auto-Simulate Full Hohmann Mission
              </button>
            </div>
          </div>

          <!-- 3. Lagrange Points Sub-Panel -->
          <div id="panel-mission-lagrange" style="display: none; background: rgba(15, 23, 42, 0.92); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 12px; padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.76rem; font-weight: 800; color: #c084fc; text-transform: uppercase;">Three-Body Equilibrium (Lagrange Points)</span>
              <span class="badge" style="background: rgba(168, 85, 247, 0.15); color: #c084fc; font-size: 0.70rem;">CR3BP Framework</span>
            </div>
            
            <div style="font-size: 0.74rem; color: #94a3b8; line-height: 1.4; margin-bottom: 10px;">
              Five gravitational equilibrium points where combined gravity of primary and secondary balances centrifugal force.
            </div>

            <div style="background: #030712; border: 1px solid #1e293b; border-radius: 8px; padding: 8px; font-size: 0.72rem; display: flex; flex-direction: column; gap: 6px; font-family: var(--font-mono);">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #f43f5e;">L₁ (Interior Saddle):</span>
                <span style="color: #cbd5e1;">Between bodies • SOHO, DSCOVR</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #f43f5e;">L₂ (Exterior Saddle):</span>
                <span style="color: #cbd5e1;">Behind secondary • JWST, Gaia</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #f43f5e;">L₃ (Counter-Position):</span>
                <span style="color: #cbd5e1;">Opposite primary • Unstable</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #34d399;">L₄ (Leading Trojan):</span>
                <span style="color: #cbd5e1;">+60° ahead • Stable Coriolis well</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #34d399;">L₅ (Trailing Trojan):</span>
                <span style="color: #cbd5e1;">-60° behind • Stable Trojan asteroids</span>
              </div>
            </div>
          </div>

          <!-- 4. Slingshot / Gravity Assist Sub-Panel -->
          <div id="panel-mission-slingshot" style="display: none; background: rgba(15, 23, 42, 0.92); border: 1px solid rgba(244, 63, 94, 0.4); border-radius: 12px; padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.76rem; font-weight: 800; color: #fb7185; text-transform: uppercase;">Hyperbolic Gravity Assist (Slingshot)</span>
              <span class="badge" style="background: rgba(244, 63, 94, 0.15); color: #fb7185; font-size: 0.70rem;">Voyager / Cassini</span>
            </div>
            
            <div style="font-size: 0.74rem; color: #94a3b8; line-height: 1.4; margin-bottom: 10px;">
              Probe enters sphere of influence on hyperbolic trajectory (e &gt; 1), scavenging orbital momentum from the planetary body.
            </div>

            <!-- Approach Speed Slider -->
            <div style="margin-bottom: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.74rem; margin-bottom: 3px;">
                <span style="color: #94a3b8;">Asymptotic Inflow Speed (v_∞)</span>
                <span id="lbl-slingshot-vinf" style="color: #fb7185; font-weight: 700; font-family: var(--font-mono);">12.0 km/s</span>
              </div>
              <input id="slider-slingshot-vinf" type="range" min="5.0" max="25.0" step="0.5" value="12.0" style="width: 100%; accent-color: #fb7185;">
            </div>

            <!-- Turning Angle & Boost Readouts -->
            <div style="background: #030712; border: 1px solid #1e293b; border-radius: 8px; padding: 8px; font-size: 0.74rem; font-family: var(--font-mono); display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              <div>
                <span style="color: #64748b; display: block;">Deflection Angle δ:</span>
                <strong id="val-slingshot-angle" style="color: #38bdf8;">68.4°</strong>
              </div>
              <div>
                <span style="color: #64748b; display: block;">Velocity Boost:</span>
                <strong id="val-slingshot-boost" style="color: #34d399;">+14.2 km/s</strong>
              </div>
            </div>
          </div>

          <!-- Comprehensive Astrodynamics Telemetry Metrics Card -->
          <div style="background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.76rem; font-weight: 800; color: #38bdf8; text-transform: uppercase;">Flight Telemetry &amp; Orbital Elements</span>
              <span class="badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-size: 0.68rem; padding: 2px 8px; border-radius: 6px;">
                Vis-Viva Invariants
              </span>
            </div>
            
            <div style="background: #030712; border: 1px solid #1e293b; border-radius: 8px; padding: 10px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.74rem; font-family: var(--font-mono);">
              <div>
                <span style="color: #64748b; display: block;">Periapsis Velocity (v_p):</span>
                <strong id="val-vp" style="color: #34d399;">9.82 km/s</strong>
              </div>
              <div>
                <span style="color: #64748b; display: block;">Apoapsis Velocity (v_a):</span>
                <strong id="val-va" style="color: #f43f5e;">5.45 km/s</strong>
              </div>
              <div>
                <span style="color: #64748b; display: block;">Periapsis Radius (r_p):</span>
                <strong id="val-rp" style="color: #f8fafc;">13,250 km</strong>
              </div>
              <div>
                <span style="color: #64748b; display: block;">Apoapsis Radius (r_a):</span>
                <strong id="val-ra" style="color: #f8fafc;">27,510 km</strong>
              </div>
              <div>
                <span style="color: #64748b; display: block;">Escape Velocity (v_esc):</span>
                <strong id="val-vesc" style="color: #a5b4fc;">10.35 km/s</strong>
              </div>
              <div>
                <span style="color: #64748b; display: block;">Specific Angular Mom (h):</span>
                <strong id="val-h" style="color: #fbbf24;">1.30 × 10¹¹ m²/s</strong>
              </div>
              <div style="grid-column: span 2; border-top: 1px dashed #334155; padding-top: 6px; margin-top: 2px;">
                <span style="color: #64748b; display: block;">Kepler Harmonic Constant T²/a³ (4π²/GM):</span>
                <strong id="val-kepler-ratio" style="color: #818cf8;">9.896 × 10⁻¹⁴ s²/m³ (100% Match)</strong>
              </div>
            </div>
          </div>

          <!-- Post-Lab Checkpoint Assessment Mount -->
          <div id="orbital-checkpoint-container"></div>
        </div>
      </div>
    </div>
  `;

  // Attach Checkpoint Questions
  mountLabCheckpoint("orbital-checkpoint-container", "orbital");

  // DOM Handles
  const canvas = container.querySelector("#orbital-canvas");
  const ctx = canvas.getContext("2d");

  const viewSimBtn = container.querySelector("#view-mode-orbital-sim");
  const viewPhotoBtn = container.querySelector("#view-mode-orbital-photo");
  const photoOverlay = container.querySelector("#orbital-photo-overlay");

  const btnPause = container.querySelector("#btn-orbital-pause");
  const btnPrograde = container.querySelector("#btn-orbital-burn-prograde");
  const btnRetrograde = container.querySelector("#btn-orbital-burn-retrograde");
  const btnCircularize = container.querySelector("#btn-orbital-circularize");
  const btnDossier = container.querySelector("#btn-open-orbital-report");
  const btnExport = container.querySelector("#btn-orbital-export");

  const tabKepler = container.querySelector("#tab-mode-kepler");
  const tabHohmann = container.querySelector("#tab-mode-hohmann");
  const tabLagrange = container.querySelector("#tab-mode-lagrange");
  const tabSlingshot = container.querySelector("#tab-mode-slingshot");

  const panelKepler = container.querySelector("#panel-mission-kepler");
  const panelHohmann = container.querySelector("#panel-mission-hohmann");
  const panelLagrange = container.querySelector("#panel-mission-lagrange");
  const panelSlingshot = container.querySelector("#panel-mission-slingshot");

  const selectBody = container.querySelector("#select-orbital-body");
  const selectPreset = container.querySelector("#select-orbit-preset");
  const sliderEcc = container.querySelector("#slider-eccentricity");
  const sliderA = container.querySelector("#slider-semi-major");
  const sliderSpeed = container.querySelector("#slider-orbital-speed");

  const lblEcc = container.querySelector("#lbl-eccentricity");
  const lblA = container.querySelector("#lbl-semi-major");
  const lblSpeed = container.querySelector("#lbl-orbital-speed");

  const toggleAreas = container.querySelector("#toggle-equal-areas");
  const toggleVectors = container.querySelector("#toggle-vectors");
  const toggleFoci = container.querySelector("#toggle-foci");
  const toggleEnergy = container.querySelector("#toggle-energy-meter");
  const hudEnergyMeter = container.querySelector("#hud-energy-meter");

  const hudSpeed = container.querySelector("#hud-orbital-speed");
  const hudPeriod = container.querySelector("#hud-orbital-period");
  const badgeStatus = container.querySelector("#badge-mission-status");

  const barKinetic = container.querySelector("#bar-energy-kinetic");
  const barPotential = container.querySelector("#bar-energy-potential");
  const lblKinetic = container.querySelector("#lbl-kinetic-energy");
  const lblPotential = container.querySelector("#lbl-potential-energy");
  const lblTotal = container.querySelector("#lbl-total-energy");

  const valVp = container.querySelector("#val-vp");
  const valVa = container.querySelector("#val-va");
  const valRp = container.querySelector("#val-rp");
  const valRa = container.querySelector("#val-ra");
  const valVesc = container.querySelector("#val-vesc");
  const valH = container.querySelector("#val-h");
  const valRatio = container.querySelector("#val-kepler-ratio");

  const lblFocalDist = container.querySelector("#lbl-focal-dist");
  const lblSemiMinor = container.querySelector("#lbl-semi-minor");
  const lblKepler3rd = container.querySelector("#lbl-kepler-3rd");

  const sliderHohmannR2 = container.querySelector("#slider-hohmann-r2");
  const lblHohmannR2 = container.querySelector("#lbl-hohmann-r2");
  const valHohmannDv1 = container.querySelector("#val-hohmann-dv1");
  const valHohmannDv2 = container.querySelector("#val-hohmann-dv2");
  const valHohmannDvtot = container.querySelector("#val-hohmann-dvtot");
  const valHohmannTime = container.querySelector("#val-hohmann-time");
  const btnHohmannBurn1 = container.querySelector("#btn-hohmann-burn-1");
  const btnHohmannBurn2 = container.querySelector("#btn-hohmann-burn-2");
  const btnHohmannAuto = container.querySelector("#btn-hohmann-auto");
  const badgeHohmannState = container.querySelector("#badge-hohmann-state");

  const sliderSlingshotVinf = container.querySelector("#slider-slingshot-vinf");
  const lblSlingshotVinf = container.querySelector("#lbl-slingshot-vinf");
  const valSlingshotAngle = container.querySelector("#val-slingshot-angle");
  const valSlingshotBoost = container.querySelector("#val-slingshot-boost");

  // HiDPI Canvas Scaling
  function setupHiDPICanvas() {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (typeof window.getOptimizedDPR === "function" ? window.getOptimizedDPR() : (window.devicePixelRatio || 1));
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0) {
      canvas.width = rect.width * dpr;
      canvas.height = 570 * dpr;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
      needsRedraw = true;
    }
  }
  setupHiDPICanvas();
  window.addEventListener("resize", setupHiDPICanvas);

  // Update HUD & Analytical Displays
  function updateTelemetryDisplays() {
    const orb = calculateOrbitalState();

    if (hudSpeed) {
      hudSpeed.textContent = `v = ${orb.currentSpeedKms.toFixed(2)} km/s (r = ${Math.round(orb.rCurrentKm).toLocaleString()} km)`;
    }
    if (hudPeriod) {
      hudPeriod.textContent = `T = ${orb.periodHours.toFixed(2)} h • e = ${eccentricity.toFixed(3)}`;
    }

    if (valVp) valVp.textContent = `${orb.periapsisSpeedKms.toFixed(2)} km/s`;
    if (valVa) valVa.textContent = `${orb.apoapsisSpeedKms.toFixed(2)} km/s`;
    if (valRp) valRp.textContent = `${Math.round(orb.rpKm).toLocaleString()} km`;
    if (valRa) valRa.textContent = `${Math.round(orb.raKm).toLocaleString()} km`;
    if (valVesc) valVesc.textContent = `${orb.escapeSpeedKms.toFixed(2)} km/s`;
    if (valH) valH.textContent = `${orb.specificAngularMomentum.toExponential(2)} m²/s`;
    if (valRatio) {
      valRatio.textContent = `${orb.measuredHarmonic.toExponential(3)} s²/m³ (matches 4π²/GM)`;
    }

    // Energy Meters
    const kGj = orb.kineticEnergyJ / 1e9;
    const uGj = orb.potentialEnergyJ / 1e9;
    const eGj = orb.totalMechanicalEnergyJ / 1e9;
    if (lblKinetic) lblKinetic.textContent = `${kGj.toFixed(2)} GJ`;
    if (lblPotential) lblPotential.textContent = `${uGj.toFixed(2)} GJ`;
    if (lblTotal) lblTotal.textContent = `${eGj.toFixed(2)} GJ`;

    // Bar Fractions
    const absMax = Math.abs(uGj) + kGj;
    if (absMax > 0) {
      const kPct = Math.min(95, Math.max(5, (kGj / absMax) * 100));
      const uPct = 100 - kPct;
      if (barKinetic) barKinetic.style.width = `${kPct.toFixed(1)}%`;
      if (barPotential) barPotential.style.width = `${uPct.toFixed(1)}%`;
    }

    // Mode Specific Sub-Panels
    if (currentMissionMode === "kepler") {
      if (lblFocalDist) lblFocalDist.textContent = `${Math.round(orb.cVisual * (orb.aKm / orb.aVisual)).toLocaleString()} km`;
      const bKm = orb.aKm * Math.sqrt(Math.max(0.01, 1 - eccentricity * eccentricity));
      if (lblSemiMinor) lblSemiMinor.textContent = `${Math.round(bKm).toLocaleString()} km`;
      if (lblKepler3rd) lblKepler3rd.textContent = `${orb.measuredHarmonic.toExponential(3)} s²/m³`;
    } else if (currentMissionMode === "hohmann") {
      if (valHohmannDv1) valHohmannDv1.textContent = `+${(orb.deltaV1Ms / 1000).toFixed(2)} km/s`;
      if (valHohmannDv2) valHohmannDv2.textContent = `+${(orb.deltaV2Ms / 1000).toFixed(2)} km/s`;
      if (valHohmannDvtot) valHohmannDvtot.textContent = `${(orb.deltaVTotMs / 1000).toFixed(2)} km/s`;
      if (valHohmannTime) valHohmannTime.textContent = `${orb.hohmannTransferTimeHours.toFixed(2)} hours`;
      if (badgeHohmannState) {
        if (hohmannState === 0) {
          badgeHohmannState.textContent = "State 0: Parked in LEO Orbit";
          badgeHohmannState.style.color = "#38bdf8";
        } else if (hohmannState === 1) {
          badgeHohmannState.textContent = "State 1: Transfer Ellipse Trajectory";
          badgeHohmannState.style.color = "#fbbf24";
        } else {
          badgeHohmannState.textContent = "State 2: Circularized in GEO Orbit";
          badgeHohmannState.style.color = "#34d399";
        }
      }
    } else if (currentMissionMode === "slingshot") {
      const vInf = slingshotApproachSpeedKms * 1000;
      const rMin = orb.body.radiusKm * 1000 * slingshotPeriapsisDistScale;
      const eHyp = 1 + (rMin * vInf * vInf) / orb.body.gm;
      const deltaRad = 2 * Math.asin(1 / eHyp);
      const deltaDeg = (deltaRad * 180) / Math.PI;
      const boostKms = 2 * (slingshotApproachSpeedKms * 0.75) * Math.sin(deltaRad / 2);
      if (valSlingshotAngle) valSlingshotAngle.textContent = `${deltaDeg.toFixed(1)}°`;
      if (valSlingshotBoost) valSlingshotBoost.textContent = `+${boostKms.toFixed(1)} km/s`;
    }
  }

  // Astrodynamics Canvas Render Loop (60 FPS)
  function renderOrbitalCanvas() {
    if (!container || !container.isConnected) return;
    const rect = canvas.getBoundingClientRect();
    const cw = rect.width || 620;
    const ch = 570;

    ctx.clearRect(0, 0, cw, ch);

    const body = CENTRAL_BODIES[currentBodyKey];
    const orb = calculateOrbitalState();

    // Primary Focal Coordinate (Earth / Sun sits at focus F1)
    const centerX = cw * 0.48;
    const centerY = ch * 0.50;

    // Ellipse Center is offset to the left along the major axis by focal distance cVisual
    const ellipseCenterX = centerX - orb.cVisual;
    const ellipseCenterY = centerY;

    // Secondary Empty Focus F2 is offset to the left by 2 * cVisual
    const emptyFocusX = centerX - 2 * orb.cVisual;
    const emptyFocusY = centerY;

    // 1. Kepler Anomaly Integration (dA/dt = L / 2m)
    if (isRunning && !isDraggingSat) {
      if (currentMissionMode === "hohmann") {
        if (hohmannState === 0) {
          // Circular orbit 1 angular rate
          const dTheta = 0.025 * simulationSpeed;
          trueAnomaly = (trueAnomaly + dTheta) % (Math.PI * 2);
        } else if (hohmannState === 1) {
          // Coasting on Hohmann transfer ellipse from 0 to π
          const dTheta = 0.018 * simulationSpeed;
          hohmannAnomaly += dTheta;
          trueAnomaly = hohmannAnomaly;
          if (hohmannAnomaly >= Math.PI) {
            hohmannAnomaly = Math.PI;
            trueAnomaly = Math.PI;
            // Arrived at apoapsis
          }
        } else {
          // Circularized in orbit 2
          const dTheta = 0.012 * simulationSpeed;
          trueAnomaly = (trueAnomaly + dTheta) % (Math.PI * 2);
        }
      } else if (currentMissionMode === "slingshot") {
        const dTheta = 0.02 * simulationSpeed;
        slingshotAnomaly += dTheta;
        if (slingshotAnomaly > Math.PI * 0.75) slingshotAnomaly = -Math.PI * 0.75;
      } else {
        // Standard Keplerian Mode: dθ/dt = L / (m * r²) ∝ (1 + e cos θ)² / (1 - e²)^(3/2)
        const num = Math.pow(1 + eccentricity * Math.cos(trueAnomaly), 2);
        const den = Math.pow(Math.max(0.08, 1 - eccentricity * eccentricity), 1.5);
        const dTheta = 0.018 * (num / den) * simulationSpeed;
        trueAnomaly = (trueAnomaly + dTheta) % (Math.PI * 2);

        // Kepler 2nd Law Equal Area Wedges Accumulation
        if (showEqualAreas) {
          if (Math.abs(trueAnomaly - lastSliceAngle) > 0.40) {
            sweepSlices.push({
              startTheta: lastSliceAngle,
              endTheta: trueAnomaly,
              alpha: 0.70
            });
            lastSliceAngle = trueAnomaly;
            if (sweepSlices.length > 7) sweepSlices.shift();
          }
        }
      }
    }

    // 2. Starfield & Celestial Grid Rendering
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    for (let s = 0; s < 45; s++) {
      const sx = (s * 137.5) % cw;
      const sy = (s * 183.1) % ch;
      const sz = ((s % 3) + 1) * 0.65;
      ctx.fillRect(sx, sy, sz, sz);
    }

    // Soft Celestial Nebula Glow
    const nebGrad = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, 280);
    nebGrad.addColorStop(0, "rgba(79, 70, 229, 0.08)");
    nebGrad.addColorStop(0.6, "rgba(14, 165, 233, 0.04)");
    nebGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = nebGrad;
    ctx.fillRect(0, 0, cw, ch);
    ctx.restore();

    // 3. Draw Kepler 2nd Law Equal Area Swept Wedges
    if (showEqualAreas && currentMissionMode === "kepler") {
      sweepSlices.forEach(slice => {
        slice.alpha -= 0.002 * simulationSpeed;
        if (slice.alpha <= 0) return;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(centerX, centerY); // Origin at primary focus

        const steps = 18;
        for (let st = 0; st <= steps; st++) {
          const th = slice.startTheta + (st / steps) * (slice.endTheta - slice.startTheta);
          const r = (orb.aVisual * (1 - eccentricity * eccentricity)) / (1 + eccentricity * Math.cos(th));
          const px = centerX + r * Math.cos(th);
          const py = centerY + r * Math.sin(th);
          ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = `rgba(99, 102, 241, ${slice.alpha * 0.35})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(165, 180, 252, ${slice.alpha * 0.75})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      });
    }

    // 4. Mode-Specific Geometric Overlays
    if (currentMissionMode === "hohmann") {
      // Draw Initial Parking Orbit r1
      const r1Visual = orb.aVisual * hohmannR1Ratio;
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, r1Visual, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();

      // Label Orbit 1
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 9px 'JetBrains Mono', monospace";
      ctx.fillText("ORBIT 1 (PARKING)", centerX + r1Visual + 6, centerY - 6);

      // Draw Target Orbit r2
      const r2Visual = orb.aVisual * hohmannR2Ratio;
      ctx.beginPath();
      ctx.arc(centerX, centerY, r2Visual, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(52, 211, 153, 0.45)";
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#34d399";
      ctx.fillText("ORBIT 2 (TARGET GEO)", centerX + r2Visual + 6, centerY - 6);

      // Draw Transfer Ellipse Arc
      const aTxVisual = (r1Visual + r2Visual) / 2;
      const cTxVisual = aTxVisual - r1Visual;
      const bTxVisual = Math.sqrt(Math.max(1, aTxVisual * aTxVisual - cTxVisual * cTxVisual));
      const txCenterX = centerX - cTxVisual;

      ctx.beginPath();
      ctx.ellipse(txCenterX, centerY, aTxVisual, bTxVisual, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(245, 158, 11, 0.75)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

    } else if (currentMissionMode === "lagrange") {
      // Draw Lagrange Equilateral Frame & 5 Equilibrium Points
      const secondaryDistVisual = orb.aVisual * 1.15;
      const secX = centerX + secondaryDistVisual;
      const secY = centerY;

      // Draw Secondary Body (Moon / Earth)
      ctx.save();
      ctx.beginPath();
      ctx.arc(secX, secY, 10, 0, Math.PI * 2);
      ctx.fillStyle = "#cbd5e1";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 9px 'JetBrains Mono', monospace";
      ctx.fillText("SECONDARY (m₂)", secX - 20, secY + 22);

      // Roche Equipotential Contour Hints
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, secondaryDistVisual * 1.1, secondaryDistVisual * 0.95, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(168, 85, 247, 0.25)";
      ctx.setLineDash([3, 5]);
      ctx.stroke();

      // Lagrange Points Positions
      const hillDist = secondaryDistVisual * 0.22;
      const L1_X = secX - hillDist;
      const L2_X = secX + hillDist;
      const L3_X = centerX - secondaryDistVisual;
      const L4_X = centerX + secondaryDistVisual * Math.cos(Math.PI / 3);
      const L4_Y = centerY - secondaryDistVisual * Math.sin(Math.PI / 3);
      const L5_X = centerX + secondaryDistVisual * Math.cos(Math.PI / 3);
      const L5_Y = centerY + secondaryDistVisual * Math.sin(Math.PI / 3);

      const lagrangePoints = [
        { name: "L₁ (SOHO)", x: L1_X, y: centerY, color: "#f43f5e" },
        { name: "L₂ (JWST)", x: L2_X, y: centerY, color: "#f43f5e" },
        { name: "L₃ (Counter)", x: L3_X, y: centerY, color: "#f43f5e" },
        { name: "L₄ (Trojan)", x: L4_X, y: L4_Y, color: "#34d399" },
        { name: "L₅ (Trojan)", x: L5_X, y: L5_Y, color: "#34d399" }
      ];

      lagrangePoints.forEach(lp => {
        ctx.beginPath();
        ctx.arc(lp.x, lp.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = lp.color;
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = lp.color;
        ctx.font = "bold 9px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText(lp.name, lp.x, lp.y - 9);
      });
      ctx.restore();

    } else if (currentMissionMode === "slingshot") {
      // Draw Hyperbolic Encounter Trajectory
      ctx.save();
      ctx.beginPath();
      const rMinVisual = 65;
      const aHypVisual = 45;
      ctx.strokeStyle = "rgba(244, 63, 94, 0.75)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);

      // Parametric hyperbola
      for (let t = -2.2; t <= 2.2; t += 0.1) {
        const hx = centerX + aHypVisual * (Math.cosh(t) - 1) + rMinVisual;
        const hy = centerY + aHypVisual * Math.sinh(t) * 1.5;
        if (t === -2.2) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

    } else {
      // Standard Keplerian Orbit Track
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(ellipseCenterX, ellipseCenterY, orb.aVisual, orb.bVisual, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(99, 102, 241, 0.65)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Major Axis Line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ellipseCenterX - orb.aVisual - 25, ellipseCenterY);
      ctx.lineTo(ellipseCenterX + orb.aVisual + 25, ellipseCenterY);
      ctx.stroke();

      // Minor Axis Line
      ctx.beginPath();
      ctx.moveTo(ellipseCenterX, ellipseCenterY - orb.bVisual - 15);
      ctx.lineTo(ellipseCenterX, ellipseCenterY + orb.bVisual + 15);
      ctx.stroke();

      // Mark Dual Foci & String (Kepler's 1st Law: r1 + r2 = 2a)
      if (showFociAndStrings) {
        // Empty Focus F2
        ctx.fillStyle = "rgba(245, 158, 11, 0.85)";
        ctx.beginPath();
        ctx.arc(emptyFocusX, emptyFocusY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = "bold 9px 'JetBrains Mono', monospace";
        ctx.fillText("FOCUS F₂ (EMPTY)", emptyFocusX - 18, emptyFocusY - 8);

        // String lines from F1 & F2 to Satellite
        const satX = centerX + orb.rCurrentVisual * Math.cos(trueAnomaly);
        const satY = centerY + orb.rCurrentVisual * Math.sin(trueAnomaly);

        ctx.strokeStyle = "rgba(245, 158, 11, 0.35)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(satX, satY);
        ctx.lineTo(emptyFocusX, emptyFocusY);
        ctx.stroke();
      }

      // Mark Periapsis (Right) & Apoapsis (Left)
      const periapsisX = centerX + (orb.aVisual - orb.cVisual);
      const apoapsisX = centerX - (orb.aVisual + orb.cVisual);

      // Periapsis Node
      ctx.fillStyle = dragHoverTarget === "periapsis" ? "#10b981" : "#34d399";
      ctx.beginPath();
      ctx.arc(periapsisX, centerY, dragHoverTarget === "periapsis" ? 7 : 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.font = "bold 9px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText("PERIAPSIS (r_p)", periapsisX + 10, centerY - 14);

      // Apoapsis Node
      ctx.fillStyle = dragHoverTarget === "apoapsis" ? "#f43f5e" : "#fb7185";
      ctx.beginPath();
      ctx.arc(apoapsisX, centerY, dragHoverTarget === "apoapsis" ? 7 : 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillText("APOAPSIS (r_a)", apoapsisX - 10, centerY - 14);
      ctx.restore();
    }

    // 5. Draw Primary Central Attractor (Focus F1 at centerX, centerY)
    ctx.save();
    let primaryRadius = 32;
    if (body.type === "star") primaryRadius = 40;
    if (body.type === "black_hole") primaryRadius = 18;

    // Atmospheric / Coronal Outer Glow
    const bodyGlow = ctx.createRadialGradient(centerX, centerY, primaryRadius * 0.7, centerX, centerY, primaryRadius * 2.4);
    bodyGlow.addColorStop(0, body.glowColor);
    bodyGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = bodyGlow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, primaryRadius * 2.4, 0, Math.PI * 2);
    ctx.fill();

    if (body.type === "black_hole") {
      // Relativistic Black Hole with Accretion Disk & Gravitational Lensing
      const diskGrad = ctx.createRadialGradient(centerX, centerY, primaryRadius * 1.2, centerX, centerY, primaryRadius * 3.0);
      diskGrad.addColorStop(0, "#a855f7");
      diskGrad.addColorStop(0.5, "#ec4899");
      diskGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = diskGrad;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, primaryRadius * 2.8, primaryRadius * 1.1, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();

      // Event Horizon (Pitch Black Sphere)
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(centerX, centerY, primaryRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#c084fc";
      ctx.lineWidth = 2;
      ctx.stroke();

    } else if (body.type === "star") {
      // Thermonuclear Star with Granulation and Flare Prominences
      const starGrad = ctx.createRadialGradient(centerX - 8, centerY - 8, 4, centerX, centerY, primaryRadius);
      starGrad.addColorStop(0, "#ffffff");
      starGrad.addColorStop(0.3, "#facc15");
      starGrad.addColorStop(0.8, "#ea580c");
      starGrad.addColorStop(1, "#9a3412");
      ctx.fillStyle = starGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, primaryRadius, 0, Math.PI * 2);
      ctx.fill();

      // Pulsating Coronal Loop
      ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, primaryRadius + 6 + Math.sin(Date.now() * 0.005) * 3, 0, Math.PI * 2);
      ctx.stroke();

    } else {
      // Planet Sphere with Realistic Shading & Continents / Bands
      const planetGrad = ctx.createRadialGradient(centerX - primaryRadius * 0.35, centerY - primaryRadius * 0.35, 4, centerX, centerY, primaryRadius);
      planetGrad.addColorStop(0, "#ffffff");
      planetGrad.addColorStop(0.25, body.color);
      planetGrad.addColorStop(1, "#030712");
      ctx.fillStyle = planetGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, primaryRadius, 0, Math.PI * 2);
      ctx.fill();

      // Rim Atmospheric Thin Glow
      ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Label Focus F1
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${body.shortName} (Focus F₁)`, centerX, centerY + primaryRadius + 14);
    ctx.restore();

    // 6. Draw Orbiting Spacecraft Satellite
    let satX = centerX + orb.rCurrentVisual * Math.cos(trueAnomaly);
    let satY = centerY + orb.rCurrentVisual * Math.sin(trueAnomaly);

    if (currentMissionMode === "hohmann") {
      if (hohmannState === 0) {
        const r1Visual = orb.aVisual * hohmannR1Ratio;
        satX = centerX + r1Visual * Math.cos(trueAnomaly);
        satY = centerY + r1Visual * Math.sin(trueAnomaly);
      } else if (hohmannState === 1) {
        const r1Visual = orb.aVisual * hohmannR1Ratio;
        const r2Visual = orb.aVisual * hohmannR2Ratio;
        const aTxVisual = (r1Visual + r2Visual) / 2;
        const cTxVisual = aTxVisual - r1Visual;
        const eTx = cTxVisual / aTxVisual;
        const rTx = (aTxVisual * (1 - eTx * eTx)) / (1 + eTx * Math.cos(trueAnomaly));
        satX = centerX + rTx * Math.cos(trueAnomaly);
        satY = centerY + rTx * Math.sin(trueAnomaly);
      } else {
        const r2Visual = orb.aVisual * hohmannR2Ratio;
        satX = centerX + r2Visual * Math.cos(trueAnomaly);
        satY = centerY + r2Visual * Math.sin(trueAnomaly);
      }
    } else if (currentMissionMode === "slingshot") {
      const aHypVisual = 45;
      const rMinVisual = 65;
      satX = centerX + aHypVisual * (Math.cosh(slingshotAnomaly) - 1) + rMinVisual;
      satY = centerY + aHypVisual * Math.sinh(slingshotAnomaly) * 1.5;
    }

    ctx.save();
    // Spacecraft Halos
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = isDraggingSat ? 18 : 10;

    // Rocket Thruster Exhaust Flame Animation during burns
    if (hohmannBurnAnimation > 0) {
      hohmannBurnAnimation--;
      const flameLen = 16 + Math.random() * 8;
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(satX - Math.cos(trueAnomaly + Math.PI / 2) * flameLen, satY - Math.sin(trueAnomaly + Math.PI / 2) * flameLen, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Spacecraft Bus (Gold Foil Cube)
    ctx.fillStyle = dragHoverTarget === "sat" ? "#facc15" : "#eab308";
    ctx.fillRect(satX - 5, satY - 5, 10, 10);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.strokeRect(satX - 5, satY - 5, 10, 10);

    // Deployable Solar Panels (Blue Silicon Photovoltaic)
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(satX - 16, satY - 3, 9, 6);
    ctx.fillRect(satX + 7, satY - 3, 9, 6);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.strokeRect(satX - 16, satY - 3, 9, 6);
    ctx.strokeRect(satX + 7, satY - 3, 9, 6);

    // 7. Dynamic Vector Overlays (Velocity & Force)
    if (showVectors) {
      // Velocity Vector (Cyan Arrow tangent to path)
      const velAngle = trueAnomaly + Math.PI / 2 + Math.atan((eccentricity * Math.sin(trueAnomaly)) / (1 + eccentricity * Math.cos(trueAnomaly)));
      const velLen = 16 + (orb.currentSpeedKms / orb.periapsisSpeedKms) * 24;

      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(satX, satY);
      ctx.lineTo(satX + Math.cos(velAngle) * velLen, satY + Math.sin(velAngle) * velLen);
      ctx.stroke();

      // Velocity Arrowhead
      const tipX = satX + Math.cos(velAngle) * velLen;
      const tipY = satY + Math.sin(velAngle) * velLen;
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(tipX, tipY, 3, 0, Math.PI * 2);
      ctx.fill();

      // Gravitational Force Vector (Magenta Arrow toward Focus F1)
      const fAngle = Math.atan2(centerY - satY, centerX - satX);
      const fLen = 22;
      ctx.strokeStyle = "#f43f5e";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(satX, satY);
      ctx.lineTo(satX + Math.cos(fAngle) * fLen, satY + Math.sin(fAngle) * fLen);
      ctx.stroke();
    }

    ctx.restore();

    // Update HUD & Analytical Displays
    updateTelemetryDisplays();

    // Continue 60 FPS Loop
    animId = requestAnimationFrame(renderOrbitalCanvas);
  }

  // Pointer / Touch Interactive Dragging Handlers
  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function handlePointerDown(e) {
    const coords = getCanvasCoords(e);
    const orb = calculateOrbitalState();
    const cw = canvas.getBoundingClientRect().width || 620;
    const ch = 570;
    const centerX = cw * 0.48;
    const centerY = ch * 0.50;

    const satX = centerX + orb.rCurrentVisual * Math.cos(trueAnomaly);
    const satY = centerY + orb.rCurrentVisual * Math.sin(trueAnomaly);
    const periapsisX = centerX + (orb.aVisual - orb.cVisual);
    const apoapsisX = centerX - (orb.aVisual + orb.cVisual);

    // Check hit on Satellite
    const distSat = Math.hypot(coords.x - satX, coords.y - satY);
    if (distSat < 22) {
      isDraggingSat = true;
      SoundFX.playClick();
      return;
    }

    // Check hit on Periapsis Handle
    const distPeri = Math.hypot(coords.x - periapsisX, coords.y - centerY);
    if (distPeri < 18) {
      isDraggingPeriapsis = true;
      SoundFX.playClick();
      return;
    }

    // Check hit on Apoapsis Handle
    const distApo = Math.hypot(coords.x - apoapsisX, coords.y - centerY);
    if (distApo < 18) {
      isDraggingApoapsis = true;
      SoundFX.playClick();
      return;
    }
  }

  function handlePointerMove(e) {
    const coords = getCanvasCoords(e);
    const orb = calculateOrbitalState();
    const cw = canvas.getBoundingClientRect().width || 620;
    const ch = 570;
    const centerX = cw * 0.48;
    const centerY = ch * 0.50;

    const satX = centerX + orb.rCurrentVisual * Math.cos(trueAnomaly);
    const satY = centerY + orb.rCurrentVisual * Math.sin(trueAnomaly);
    const periapsisX = centerX + (orb.aVisual - orb.cVisual);
    const apoapsisX = centerX - (orb.aVisual + orb.cVisual);

    // Update hover target
    if (Math.hypot(coords.x - satX, coords.y - satY) < 22) {
      dragHoverTarget = "sat";
    } else if (Math.hypot(coords.x - periapsisX, coords.y - centerY) < 18) {
      dragHoverTarget = "periapsis";
    } else if (Math.hypot(coords.x - apoapsisX, coords.y - centerY) < 18) {
      dragHoverTarget = "apoapsis";
    } else {
      dragHoverTarget = null;
    }

    if (isDraggingSat) {
      // Set true anomaly from pointer angle
      const angle = Math.atan2(coords.y - centerY, coords.x - centerX);
      trueAnomaly = (angle + Math.PI * 2) % (Math.PI * 2);
      sweepSlices.length = 0;
      lastSliceAngle = trueAnomaly;
      needsRedraw = true;
    } else if (isDraggingPeriapsis) {
      // Dragging periapsis node adjusts eccentricity & scale
      const dx = Math.max(30, coords.x - centerX);
      const rpVisual = dx;
      const raVisual = orb.aVisual + orb.cVisual;
      const newAVisual = (rpVisual + raVisual) / 2;
      semiMajorAxisScale = Math.min(1.65, Math.max(0.65, newAVisual / 155));
      eccentricity = Math.min(0.85, Math.max(0.0, (raVisual - rpVisual) / (raVisual + rpVisual)));
      sliderEcc.value = eccentricity;
      sliderA.value = semiMajorAxisScale;
      lblEcc.textContent = `${eccentricity.toFixed(2)} ${eccentricity === 0 ? "(Circular)" : "(Elliptical)"}`;
      lblA.textContent = `${semiMajorAxisScale.toFixed(2)}× Normal Scale`;
      needsRedraw = true;
    } else if (isDraggingApoapsis) {
      // Dragging apoapsis node
      const dx = Math.max(30, centerX - coords.x);
      const raVisual = dx;
      const rpVisual = orb.aVisual - orb.cVisual;
      const newAVisual = (rpVisual + raVisual) / 2;
      semiMajorAxisScale = Math.min(1.65, Math.max(0.65, newAVisual / 155));
      eccentricity = Math.min(0.85, Math.max(0.0, (raVisual - rpVisual) / (raVisual + rpVisual)));
      sliderEcc.value = eccentricity;
      sliderA.value = semiMajorAxisScale;
      lblEcc.textContent = `${eccentricity.toFixed(2)} ${eccentricity === 0 ? "(Circular)" : "(Elliptical)"}`;
      lblA.textContent = `${semiMajorAxisScale.toFixed(2)}× Normal Scale`;
      needsRedraw = true;
    }
  }

  function handlePointerUp() {
    isDraggingSat = false;
    isDraggingPeriapsis = false;
    isDraggingApoapsis = false;
  }

  canvas.addEventListener("pointerdown", handlePointerDown);
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);
  window.addEventListener("pointercancel", handlePointerUp);

  // Keyboard Shortcuts (Spacebar pause/play)
  function handleKeyDown(e) {
    if (e.code === "Space" && !e.repeat && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "SELECT" && document.activeElement?.tagName !== "TEXTAREA") {
      e.preventDefault();
      isRunning = !isRunning;
      if (btnPause) btnPause.textContent = isRunning ? "⏸️ Pause" : "▶️ Resume";
      SoundFX.playClick();
    }
  }
  window.addEventListener("keydown", handleKeyDown);

  // Tab Mission Mode Switchers
  function setMissionMode(mode) {
    currentMissionMode = mode;
    [tabKepler, tabHohmann, tabLagrange, tabSlingshot].forEach(t => {
      if (t) {
        t.classList.remove("active");
        t.style.background = "transparent";
        t.style.color = "#94a3b8";
      }
    });

    if (panelKepler) panelKepler.style.display = "none";
    if (panelHohmann) panelHohmann.style.display = "none";
    if (panelLagrange) panelLagrange.style.display = "none";
    if (panelSlingshot) panelSlingshot.style.display = "none";

    if (mode === "kepler") {
      tabKepler.classList.add("active");
      tabKepler.style.background = "#4f46e5";
      tabKepler.style.color = "#ffffff";
      if (panelKepler) panelKepler.style.display = "block";
      if (badgeStatus) badgeStatus.textContent = "Keplerian 3 Laws Verification";
    } else if (mode === "hohmann") {
      tabHohmann.classList.add("active");
      tabHohmann.style.background = "#0284c7";
      tabHohmann.style.color = "#ffffff";
      if (panelHohmann) panelHohmann.style.display = "block";
      if (badgeStatus) badgeStatus.textContent = "Hohmann Transfer Trajectory Engine";
    } else if (mode === "lagrange") {
      tabLagrange.classList.add("active");
      tabLagrange.style.background = "#7e22ce";
      tabLagrange.style.color = "#ffffff";
      if (panelLagrange) panelLagrange.style.display = "block";
      if (badgeStatus) badgeStatus.textContent = "Three-Body Gravitational Equilibrium";
    } else if (mode === "slingshot") {
      tabSlingshot.classList.add("active");
      tabSlingshot.style.background = "#be123c";
      tabSlingshot.style.color = "#ffffff";
      if (panelSlingshot) panelSlingshot.style.display = "block";
      if (badgeStatus) badgeStatus.textContent = "Hyperbolic Gravity Assist (Slingshot)";
    }
    sweepSlices.length = 0;
    SoundFX.playClick();
  }

  tabKepler?.addEventListener("click", () => setMissionMode("kepler"));
  tabHohmann?.addEventListener("click", () => setMissionMode("hohmann"));
  tabLagrange?.addEventListener("click", () => setMissionMode("lagrange"));
  tabSlingshot?.addEventListener("click", () => setMissionMode("slingshot"));

  // Primary Celestial Body Selection
  selectBody?.addEventListener("change", (e) => {
    currentBodyKey = e.target.value;
    sweepSlices.length = 0;
    needsRedraw = true;
    SoundFX.playClick();
  });

  // Preset Selection
  selectPreset?.addEventListener("change", (e) => {
    currentPresetKey = e.target.value;
    const p = ORBITAL_PRESETS[currentPresetKey];
    if (p && p.e !== undefined) {
      eccentricity = p.e;
      semiMajorAxisScale = p.aScale;
      sliderEcc.value = eccentricity;
      sliderA.value = semiMajorAxisScale;
      lblEcc.textContent = `${eccentricity.toFixed(2)} ${eccentricity === 0 ? "(Circular)" : "(Elliptical)"}`;
      lblA.textContent = `${semiMajorAxisScale.toFixed(2)}× Normal Scale`;
    }
    sweepSlices.length = 0;
    needsRedraw = true;
    SoundFX.playClick();
  });

  // Sliders Listeners
  sliderEcc?.addEventListener("input", (e) => {
    eccentricity = parseFloat(e.target.value);
    lblEcc.textContent = `${eccentricity.toFixed(2)} ${eccentricity === 0 ? "(Circular)" : (eccentricity > 0.5 ? "(Highly Elliptical)" : "(Elliptical)")}`;
    sweepSlices.length = 0;
    currentPresetKey = "custom";
    selectPreset.value = "custom";
    needsRedraw = true;
  });

  sliderA?.addEventListener("input", (e) => {
    semiMajorAxisScale = parseFloat(e.target.value);
    const orb = calculateOrbitalState();
    lblA.textContent = `${semiMajorAxisScale.toFixed(2)}× (${Math.round(orb.aKm).toLocaleString()} km)`;
    sweepSlices.length = 0;
    currentPresetKey = "custom";
    selectPreset.value = "custom";
    needsRedraw = true;
  });

  sliderSpeed?.addEventListener("input", (e) => {
    simulationSpeed = parseFloat(e.target.value);
    lblSpeed.textContent = `${simulationSpeed.toFixed(1)}× Speed`;
  });

  // Hohmann R2 Target Slider
  sliderHohmannR2?.addEventListener("input", (e) => {
    hohmannR2Ratio = parseFloat(e.target.value);
    const orb = calculateOrbitalState();
    lblHohmannR2.textContent = `${Math.round(orb.r2HohmannKm).toLocaleString()} km`;
    needsRedraw = true;
  });

  // Hohmann Action Buttons
  btnHohmannBurn1?.addEventListener("click", () => {
    hohmannState = 1;
    hohmannAnomaly = 0;
    trueAnomaly = 0;
    hohmannBurnAnimation = 25;
    hohmannBurnType = "departure";
    SoundFX.playPop();
  });

  btnHohmannBurn2?.addEventListener("click", () => {
    hohmannState = 2;
    trueAnomaly = Math.PI;
    hohmannBurnAnimation = 25;
    hohmannBurnType = "insertion";
    SoundFX.playSuccess();
  });

  btnHohmannAuto?.addEventListener("click", () => {
    hohmannState = 1;
    hohmannAnomaly = 0;
    trueAnomaly = 0;
    hohmannBurnAnimation = 30;
    SoundFX.playPop();
    setTimeout(() => {
      hohmannState = 2;
      trueAnomaly = Math.PI;
      hohmannBurnAnimation = 30;
      SoundFX.playSuccess();
    }, 4000);
  });

  // Slingshot Slider
  sliderSlingshotVinf?.addEventListener("input", (e) => {
    slingshotApproachSpeedKms = parseFloat(e.target.value);
    lblSlingshotVinf.textContent = `${slingshotApproachSpeedKms.toFixed(1)} km/s`;
    needsRedraw = true;
  });

  // Visual Overlays Toggles
  toggleAreas?.addEventListener("change", (e) => {
    showEqualAreas = e.target.checked;
    SoundFX.playClick();
  });

  toggleVectors?.addEventListener("change", (e) => {
    showVectors = e.target.checked;
    SoundFX.playClick();
  });

  toggleFoci?.addEventListener("change", (e) => {
    showFociAndStrings = e.target.checked;
    SoundFX.playClick();
  });

  toggleEnergy?.addEventListener("change", (e) => {
    showEnergyMeter = e.target.checked;
    if (hudEnergyMeter) hudEnergyMeter.style.display = showEnergyMeter ? "flex" : "none";
    SoundFX.playClick();
  });

  // Action Buttons
  btnPause?.addEventListener("click", () => {
    isRunning = !isRunning;
    btnPause.textContent = isRunning ? "⏸️ Pause" : "▶️ Resume";
    SoundFX.playClick();
  });

  btnPrograde?.addEventListener("click", () => {
    semiMajorAxisScale = Math.min(1.65, semiMajorAxisScale + 0.08);
    eccentricity = Math.min(0.85, eccentricity + 0.04);
    sliderA.value = semiMajorAxisScale;
    sliderEcc.value = eccentricity;
    lblA.textContent = `${semiMajorAxisScale.toFixed(2)}× Normal Scale`;
    lblEcc.textContent = `${eccentricity.toFixed(2)} (Elliptical)`;
    sweepSlices.length = 0;
    hohmannBurnAnimation = 20;
    SoundFX.playPop();

    // Record Trial in Store
    const orb = calculateOrbitalState();
    LabTrialStore.addTrial("orbital", {
      type: "Prograde Burn (+Δv)",
      body: orb.body.shortName,
      semiMajorAxisKm: Math.round(orb.aKm),
      eccentricity: eccentricity.toFixed(3),
      periodHours: orb.periodHours.toFixed(2),
      periapsisSpeedKms: orb.periapsisSpeedKms.toFixed(2),
      apoapsisSpeedKms: orb.apoapsisSpeedKms.toFixed(2)
    });
  });

  btnRetrograde?.addEventListener("click", () => {
    semiMajorAxisScale = Math.max(0.65, semiMajorAxisScale - 0.08);
    sliderA.value = semiMajorAxisScale;
    lblA.textContent = `${semiMajorAxisScale.toFixed(2)}× Normal Scale`;
    sweepSlices.length = 0;
    hohmannBurnAnimation = 20;
    SoundFX.playPop();

    const orb = calculateOrbitalState();
    LabTrialStore.addTrial("orbital", {
      type: "Retrograde Burn (-Δv)",
      body: orb.body.shortName,
      semiMajorAxisKm: Math.round(orb.aKm),
      eccentricity: eccentricity.toFixed(3),
      periodHours: orb.periodHours.toFixed(2),
      periapsisSpeedKms: orb.periapsisSpeedKms.toFixed(2),
      apoapsisSpeedKms: orb.apoapsisSpeedKms.toFixed(2)
    });
  });

  btnCircularize?.addEventListener("click", () => {
    eccentricity = 0.0;
    sliderEcc.value = 0.0;
    lblEcc.textContent = "0.00 (Circular Orbit)";
    sweepSlices.length = 0;
    SoundFX.playSuccess();

    const orb = calculateOrbitalState();
    LabTrialStore.addTrial("orbital", {
      type: "Circularization Burn (e=0)",
      body: orb.body.shortName,
      semiMajorAxisKm: Math.round(orb.aKm),
      eccentricity: "0.000",
      periodHours: orb.periodHours.toFixed(2),
      periapsisSpeedKms: orb.periapsisSpeedKms.toFixed(2),
      apoapsisSpeedKms: orb.apoapsisSpeedKms.toFixed(2)
    });
  });

  // View Switcher (Sim vs 4K Photo)
  viewSimBtn?.addEventListener("click", () => {
    viewMode = "sim";
    viewSimBtn.classList.add("active");
    viewPhotoBtn.classList.remove("active");
    viewSimBtn.style.background = "";
    viewPhotoBtn.style.background = "transparent";
    if (photoOverlay) photoOverlay.style.display = "none";
    canvas.style.display = "block";
    SoundFX.playClick();
  });

  viewPhotoBtn?.addEventListener("click", () => {
    viewMode = "photo";
    viewPhotoBtn.classList.add("active");
    viewSimBtn.classList.remove("active");
    viewPhotoBtn.style.background = "";
    viewSimBtn.style.background = "transparent";
    if (photoOverlay) photoOverlay.style.display = "block";
    canvas.style.display = "none";
    SoundFX.playClick();
  });

  // Open Lab Report Modal / Flight Dossier
  btnDossier?.addEventListener("click", () => {
    const orb = calculateOrbitalState();
    const trials = LabTrialStore.getTrials("orbital");

    openLabReportModal({
      title: "Keplerian Orbital Mechanics, Astrodynamics & Spaceflight Telemetry",
      subject: "Astrophysics & Classical Mechanics",
      inquiryQuestion: "How do central gravitational fields, conservation of angular momentum, and the Vis-Viva equation dictate orbital eccentricity, period harmonics, and Hohmann interplanetary transfer burns?",
      canvasElement: canvas,
      parameters: {
        "Primary Attractor": orb.body.name,
        "Gravitational Parameter (μ = GM)": `${orb.body.gm.toExponential(4)} m³/s²`,
        "Semi-Major Axis (a)": `${Math.round(orb.aKm).toLocaleString()} km`,
        "Orbital Eccentricity (e)": eccentricity.toFixed(4),
        "Orbital Period (T)": `${orb.periodHours.toFixed(2)} hours (${orb.periodDays.toFixed(2)} days)`,
        "Periapsis Radius (r_p)": `${Math.round(orb.rpKm).toLocaleString()} km`,
        "Apoapsis Radius (r_a)": `${Math.round(orb.raKm).toLocaleString()} km`,
        "Periapsis Velocity (v_p)": `${orb.periapsisSpeedKms.toFixed(2)} km/s`,
        "Apoapsis Velocity (v_a)": `${orb.apoapsisSpeedKms.toFixed(2)} km/s`,
        "Escape Velocity (v_esc)": `${orb.escapeSpeedKms.toFixed(2)} km/s`,
        "Specific Angular Momentum (h)": `${orb.specificAngularMomentum.toExponential(4)} m²/s`,
        "Specific Orbital Energy (ε)": `${(orb.specificEnergyJ / 1e6).toFixed(2)} MJ/kg`,
        "Conserved Mechanical Energy (E)": `${(orb.totalMechanicalEnergyJ / 1e9).toFixed(2)} GJ`,
        "Kepler Harmonic T²/a³": `${orb.measuredHarmonic.toExponential(4)} s²/m³ (matches 4π²/GM)`
      },
      trials: trials.map((t, idx) => ({
        trialNumber: idx + 1,
        maneuver: t.type,
        attractor: t.body,
        semiMajorAxis: `${t.semiMajorAxisKm} km`,
        eccentricity: t.eccentricity,
        period: `${t.periodHours} h`,
        periapsisSpeed: `${t.periapsisSpeedKms} km/s`,
        apoapsisSpeed: `${t.apoapsisSpeedKms} km/s`
      })),
      formulas: [
        {
          name: "Vis-Viva Orbital Energy Equation",
          latex: "v^2 = GM \\left( \\frac{2}{r} - \\frac{1}{a} \\right) = \\mu \\left( \\frac{2}{r} - \\frac{1}{a} \\right)"
        },
        {
          name: "Kepler's Harmonic Third Law",
          latex: "T^2 = \\frac{4\\pi^2}{GM} a^3 = \\frac{4\\pi^2}{\\mu} a^3"
        },
        {
          name: "Kepler's Second Law (Equal Area Sweeps)",
          latex: "\\frac{dA}{dt} = \\frac{1}{2} r^2 \\dot{\\theta} = \\frac{L}{2m} = \\frac{h}{2} = \\text{constant}"
        },
        {
          name: "Specific Orbital Energy & Invariance",
          latex: "\\varepsilon = \\frac{v^2}{2} - \\frac{\\mu}{r} = -\\frac{\\mu}{2a} = \\text{constant}"
        },
        {
          name: "Hohmann Transfer Delta-v Budget",
          latex: "\\Delta v_1 = \\sqrt{\\frac{\\mu}{r_1}}\\left(\\sqrt{\\frac{2r_2}{r_1+r_2}} - 1\\right), \\quad \\Delta v_2 = \\sqrt{\\frac{\\mu}{r_2}}\\left(1 - \\sqrt{\\frac{2r_1}{r_1+r_2}}\\right)"
        }
      ],
      observations: `Keplerian trajectory telemetry empirically confirms the invariance of the Kepler harmonic ratio T²/a³ = 4π²/μ across all planetary primaries. Sector area sweeping verifies angular momentum conservation dA/dt = L/2m, with speed maximizing at periapsis (${orb.periapsisSpeedKms.toFixed(2)} km/s) and minimizing at apoapsis (${orb.apoapsisSpeedKms.toFixed(2)} km/s). Total mechanical energy E = K + U remains strictly constant along the conservative central gravitational orbit.`,
      conclusionNotes: `Two-impulse coplanar Hohmann transfer achieves minimum propellant expenditure with total Δv = ${(orb.deltaVTotMs / 1000).toFixed(2)} km/s and transfer time t_tx = ${orb.hohmannTransferTimeHours.toFixed(2)} hours.`
    });
    SoundFX.playSuccess();
  });

  // Multi-Mode Ephemeris & Mission CSV Export
  btnExport?.addEventListener("click", () => {
    const orb = calculateOrbitalState();
    const body = CENTRAL_BODIES[currentBodyKey];

    if (currentMissionMode === "hohmann") {
      const r1Km = orb.r1HohmannKm;
      const r2Km = orb.r2HohmannKm;
      const atxKm = orb.aTxKm;
      const vCirc1 = orb.vCirc1Ms / 1000;
      const vTx1 = orb.vTx1Ms / 1000;
      const dv1 = orb.deltaV1Ms / 1000;
      const vCirc2 = orb.vCirc2Ms / 1000;
      const vTx2 = orb.vTx2Ms / 1000;
      const dv2 = orb.deltaV2Ms / 1000;
      const dvTot = orb.deltaVTotMs / 1000;

      exportLabDataCsv({
        title: "Hohmann Orbital Transfer Burn Budget & Flight Trajectory",
        labId: "orbital_hohmann",
        parameters: {
          "Central Primary Attractor": body.name,
          "Gravitational Parameter (μ)": `${body.gm.toExponential(4)} m³/s²`,
          "Departure Orbit Radius (r₁)": `${Math.round(r1Km).toLocaleString()} km (Alt: ${Math.round(r1Km - body.radiusKm).toLocaleString()} km)`,
          "Target Orbit Radius (r₂)": `${Math.round(r2Km).toLocaleString()} km (Alt: ${Math.round(r2Km - body.radiusKm).toLocaleString()} km)`,
          "Transfer Semi-Major Axis (a_tx)": `${Math.round(atxKm).toLocaleString()} km`,
          "Transfer Flight Duration (t_tx)": `${orb.hohmannTransferTimeHours.toFixed(2)} hours (${(orb.hohmannTransferTimeSec / 60).toFixed(0)} min)`,
          "Departure Burn (Δv₁)": `+${dv1.toFixed(3)} km/s`,
          "Insertion Burn (Δv₂)": `+${dv2.toFixed(3)} km/s`,
          "Total Transfer Budget (Δv_tot)": `${dvTot.toFixed(3)} km/s`
        },
        headers: [
          "Trajectory Phase",
          "Maneuver Point",
          "Radius (km)",
          "Velocity (km/s)",
          "Applied Burn Δv (km/s)",
          "Specific Energy (MJ/kg)",
          "Local Escape Speed (km/s)"
        ],
        dataRows: [
          [
            "1. LEO Parking",
            "Initial Circular Orbit",
            Math.round(r1Km),
            vCirc1.toFixed(3),
            "0.000",
            (-body.gm / (2 * r1Km * 1000) / 1e6).toFixed(2),
            (Math.sqrt(2 * body.gm / (r1Km * 1000)) / 1000).toFixed(3)
          ],
          [
            "2. Trans-GEO Injection",
            "Periapsis Departure Burn",
            Math.round(r1Km),
            vTx1.toFixed(3),
            `+${dv1.toFixed(3)}`,
            (-body.gm / (2 * atxKm * 1000) / 1e6).toFixed(2),
            (Math.sqrt(2 * body.gm / (r1Km * 1000)) / 1000).toFixed(3)
          ],
          [
            "3. Coasting Phase",
            "Transfer Ellipse Midpoint",
            Math.round(atxKm),
            (Math.sqrt(Math.max(1, body.gm * (2 / (atxKm * 1000) - 1 / (atxKm * 1000)))) / 1000).toFixed(3),
            "0.000",
            (-body.gm / (2 * atxKm * 1000) / 1e6).toFixed(2),
            (Math.sqrt(2 * body.gm / (atxKm * 1000)) / 1000).toFixed(3)
          ],
          [
            "4. GEO Arrival",
            "Apoapsis Coast (Pre-Burn)",
            Math.round(r2Km),
            vTx2.toFixed(3),
            "0.000",
            (-body.gm / (2 * atxKm * 1000) / 1e6).toFixed(2),
            (Math.sqrt(2 * body.gm / (r2Km * 1000)) / 1000).toFixed(3)
          ],
          [
            "5. GEO Insertion",
            "Circularization Burn",
            Math.round(r2Km),
            vCirc2.toFixed(3),
            `+${dv2.toFixed(3)}`,
            (-body.gm / (2 * r2Km * 1000) / 1e6).toFixed(2),
            (Math.sqrt(2 * body.gm / (r2Km * 1000)) / 1000).toFixed(3)
          ]
        ]
      });
    } else if (currentMissionMode === "lagrange") {
      const isSun = body.type === "star";
      const secName = isSun ? "Earth" : (body.shortName === "Earth" ? "Moon" : "Major Moon");
      const secMassKg = isSun ? 5.972e24 : (body.shortName === "Earth" ? 7.342e22 : 1.482e23);
      const sepDistKm = isSun ? 1.496e8 : (body.shortName === "Earth" ? 384400 : 1070400);
      const massRatio = secMassKg / (body.massKg + secMassKg);
      const hillRadiusKm = sepDistKm * Math.cbrt(massRatio / 3);

      const l1DistKm = sepDistKm * (1 - Math.cbrt(massRatio / 3));
      const l2DistKm = sepDistKm * (1 + Math.cbrt(massRatio / 3));
      const l3DistKm = -sepDistKm * (1 + (5 / 12) * massRatio);
      const l4DistKm = sepDistKm;
      const l5DistKm = sepDistKm;

      exportLabDataCsv({
        title: "Circular Restricted Three-Body Problem & Lagrange Equilibrium Points",
        labId: "orbital_lagrange",
        parameters: {
          "Primary Attractor (M₁)": `${body.name} (${body.massKg.toExponential(3)} kg)`,
          "Secondary Body (M₂)": `${secName} (${secMassKg.toExponential(3)} kg)`,
          "Orbital Separation Distance (R)": `${Math.round(sepDistKm).toLocaleString()} km`,
          "Dimensionless Mass Parameter (μ)": massRatio.toExponential(4),
          "Secondary Hill Radius (r_H)": `${Math.round(hillRadiusKm).toLocaleString()} km`,
          "Routh Stability Criterion (μ < 0.0385)": massRatio < 0.0385 ? "STABLE for L4/L5 (Coriolis restored)" : "UNSTABLE"
        },
        headers: [
          "Lagrange Point",
          "Geometry / Configuration",
          "Distance from Primary (km)",
          "Distance from Secondary (km)",
          "Equilibrium Stability",
          "Exemplar Astronomical Mission"
        ],
        dataRows: [
          ["L₁ (Collinear)", "Between M₁ and M₂ along inter-body axis", Math.round(l1DistKm), Math.round(sepDistKm - l1DistKm), "Unstable (Saddle / Lyapunov)", "SOHO, DSCOVR, Genesis"],
          ["L₂ (Collinear)", "Exterior behind M₂ along inter-body axis", Math.round(l2DistKm), Math.round(l2DistKm - sepDistKm), "Unstable (Halo / Lissajous)", "JWST, WMAP, Planck, Gaia"],
          ["L₃ (Collinear)", "Exterior behind M₁ (anti-secondary axis)", Math.round(Math.abs(l3DistKm)), Math.round(Math.abs(l3DistKm) + sepDistKm), "Unstable (Linear)", "Theoretical Counter-Earth"],
          ["L₄ (Triangular)", "Leading +60° equilateral vertex", Math.round(l4DistKm), Math.round(l4DistKm), "Conditionally Stable", "Jupiter Greeks, Trojan Asteroids"],
          ["L₅ (Triangular)", "Trailing -60° equilateral vertex", Math.round(l5DistKm), Math.round(l5DistKm), "Conditionally Stable", "Jupiter Trojans, Kordylewski Clouds"]
        ]
      });
    } else if (currentMissionMode === "slingshot") {
      const vInf = slingshotApproachSpeedKms * 1000;
      const rMin = orb.body.radiusKm * 1000 * slingshotPeriapsisDistScale;
      const eHyp = 1 + (rMin * vInf * vInf) / orb.body.gm;
      const deltaRad = 2 * Math.asin(Math.min(1, 1 / eHyp));
      const deltaDeg = (deltaRad * 180) / Math.PI;
      const vPeriapsisMs = Math.sqrt(vInf * vInf + (2 * orb.body.gm) / rMin);
      const vPeriapsisKms = vPeriapsisMs / 1000;
      const boostKms = 2 * (slingshotApproachSpeedKms * 0.75) * Math.sin(deltaRad / 2);

      exportLabDataCsv({
        title: "Hyperbolic Planetary Slingshot & Gravity Assist Telemetry",
        labId: "orbital_slingshot",
        parameters: {
          "Encounter Primary Planet": body.name,
          "Hyperbolic Approach Speed (v_∞)": `${slingshotApproachSpeedKms.toFixed(2)} km/s`,
          "Closest Approach Periapsis Radius (r_p)": `${Math.round(rMin / 1000).toLocaleString()} km (Alt: ${Math.round((rMin / 1000) - body.radiusKm).toLocaleString()} km)`,
          "Hyperbolic Eccentricity (e_hyp)": eHyp.toFixed(4),
          "Deflection / Turning Angle (δ)": `${deltaDeg.toFixed(2)}°`,
          "Peak Periapsis Flyby Velocity (v_max)": `${vPeriapsisKms.toFixed(2)} km/s`,
          "Heliocentric Velocity Boost (Δv)": `+${boostKms.toFixed(2)} km/s`
        },
        headers: [
          "Offset Distance from Periapsis (km)",
          "True Anomaly Phase",
          "Flyby Velocity (km/s)",
          "Local Escape Velocity (km/s)",
          "Gravitational Force (N)",
          "Specific Energy (MJ/kg)"
        ],
        dataRows: [
          [-50000, "-120.0° (Inbound)", (Math.sqrt(Math.max(1, vInf * vInf + (2 * orb.body.gm) / ((rMin + 50000000)))) / 1000).toFixed(2), (Math.sqrt((2 * orb.body.gm) / (rMin + 50000000)) / 1000).toFixed(2), ((orb.body.gm * satelliteMassKg) / Math.pow(rMin + 50000000, 2)).toFixed(1), ((vInf * vInf) / 2 / 1e6).toFixed(2)],
          [-20000, "-90.0° (Inbound)", (Math.sqrt(Math.max(1, vInf * vInf + (2 * orb.body.gm) / ((rMin + 20000000)))) / 1000).toFixed(2), (Math.sqrt((2 * orb.body.gm) / (rMin + 20000000)) / 1000).toFixed(2), ((orb.body.gm * satelliteMassKg) / Math.pow(rMin + 20000000, 2)).toFixed(1), ((vInf * vInf) / 2 / 1e6).toFixed(2)],
          [-5000, "-45.0° (Approach)", (Math.sqrt(Math.max(1, vInf * vInf + (2 * orb.body.gm) / ((rMin + 5000000)))) / 1000).toFixed(2), (Math.sqrt((2 * orb.body.gm) / (rMin + 5000000)) / 1000).toFixed(2), ((orb.body.gm * satelliteMassKg) / Math.pow(rMin + 5000000, 2)).toFixed(1), ((vInf * vInf) / 2 / 1e6).toFixed(2)],
          [0, "0.0° (Periapsis CA)", vPeriapsisKms.toFixed(2), (Math.sqrt((2 * orb.body.gm) / rMin) / 1000).toFixed(2), ((orb.body.gm * satelliteMassKg) / Math.pow(rMin, 2)).toFixed(1), ((vInf * vInf) / 2 / 1e6).toFixed(2)],
          [5000, "+45.0° (Receding)", (Math.sqrt(Math.max(1, vInf * vInf + (2 * orb.body.gm) / ((rMin + 5000000)))) / 1000).toFixed(2), (Math.sqrt((2 * orb.body.gm) / (rMin + 5000000)) / 1000).toFixed(2), ((orb.body.gm * satelliteMassKg) / Math.pow(rMin + 5000000, 2)).toFixed(1), ((vInf * vInf) / 2 / 1e6).toFixed(2)],
          [20000, "+90.0° (Outbound)", (Math.sqrt(Math.max(1, vInf * vInf + (2 * orb.body.gm) / ((rMin + 20000000)))) / 1000).toFixed(2), (Math.sqrt((2 * orb.body.gm) / (rMin + 20000000)) / 1000).toFixed(2), ((orb.body.gm * satelliteMassKg) / Math.pow(rMin + 20000000, 2)).toFixed(1), ((vInf * vInf) / 2 / 1e6).toFixed(2)],
          [50000, "+120.0° (Outbound)", (Math.sqrt(Math.max(1, vInf * vInf + (2 * orb.body.gm) / ((rMin + 50000000)))) / 1000).toFixed(2), (Math.sqrt((2 * orb.body.gm) / (rMin + 50000000)) / 1000).toFixed(2), ((orb.body.gm * satelliteMassKg) / Math.pow(rMin + 50000000, 2)).toFixed(1), ((vInf * vInf) / 2 / 1e6).toFixed(2)]
        ]
      });
    } else {
      // Default: Keplerian Ephemeris Table
      exportLabDataCsv({
        title: "Keplerian Orbital Mechanics & Ephemeris Telemetry",
        labId: "orbital_kepler",
        parameters: {
          "Central Primary Attractor": body.name,
          "Gravitational Parameter (μ)": `${body.gm.toExponential(4)} m³/s²`,
          "Semi-Major Axis (a)": `${Math.round(orb.aKm)} km`,
          "Orbital Eccentricity (e)": eccentricity.toFixed(4),
          "Orbital Period (T)": `${orb.periodHours.toFixed(3)} hours`,
          "Periapsis Radius (r_p)": `${Math.round(orb.rpKm)} km`,
          "Apoapsis Radius (r_a)": `${Math.round(orb.raKm)} km`,
          "Specific Angular Momentum (h)": `${orb.specificAngularMomentum.toExponential(4)} m²/s`,
          "Specific Orbital Energy (ε)": `${(orb.specificEnergyJ / 1e6).toFixed(2)} MJ/kg`,
          "Kepler Harmonic T²/a³": `${orb.measuredHarmonic.toExponential(4)} s²/m³`
        },
        headers: [
          "True Anomaly (deg)",
          "Orbital Radius (km)",
          "Orbital Velocity (km/s)",
          "Radial Velocity (km/s)",
          "Tangential Velocity (km/s)",
          "Escape Velocity (km/s)",
          "Kinetic Energy (GJ)",
          "Potential Energy (GJ)"
        ],
        dataRows: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => {
          const rad = (deg * Math.PI) / 180;
          const rKm = (orb.aKm * (1 - eccentricity * eccentricity)) / (1 + eccentricity * Math.cos(rad));
          const rM = rKm * 1000;
          const vMs = Math.sqrt(Math.max(1, body.gm * (2 / rM - 1 / (orb.aKm * 1000))));
          const vKms = vMs / 1000;
          const pM = orb.pKm * 1000;
          const vrKms = (Math.sqrt(body.gm / pM) * eccentricity * Math.sin(rad)) / 1000;
          const vtKms = (Math.sqrt(body.gm / pM) * (1 + eccentricity * Math.cos(rad))) / 1000;
          const vEsc = Math.sqrt(2 * body.gm / rM) / 1000;
          const kGj = (0.5 * satelliteMassKg * Math.pow(vMs, 2)) / 1e9;
          const uGj = -(body.gm * satelliteMassKg / rM) / 1e9;
          return [
            deg,
            Math.round(rKm),
            vKms.toFixed(2),
            vrKms.toFixed(2),
            vtKms.toFixed(2),
            vEsc.toFixed(2),
            kGj.toFixed(2),
            uGj.toFixed(2)
          ];
        })
      });
    }
    SoundFX.playSuccess();
  });

  // Launch Render Loop
  updateTelemetryDisplays();
  animId = requestAnimationFrame(renderOrbitalCanvas);

  // Unmount Cleanup Hook
  _currentOrbitalCleanup = function cleanup() {
    isRunning = false;
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    window.removeEventListener("resize", setupHiDPICanvas);
    canvas.removeEventListener("pointerdown", handlePointerDown);
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    window.removeEventListener("pointercancel", handlePointerUp);
    window.removeEventListener("keydown", handleKeyDown);
  };

  return _currentOrbitalCleanup;
}
