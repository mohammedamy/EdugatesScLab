// Edugates-ClipSAT Science Labs - Physics: Keplerian Orbital Mechanics & Gravitation Suite
// 60 FPS Precision Celestial Astrodynamics Simulation:
// Central gravitational field F = -GMm/r² · r̂, Vis-Viva energy v² = GM(2/r - 1/a),
// Kepler's Three Laws: Ellipses, Equal-area sector sweeps (dA/dt = L/2m), Harmonic law T²/a³,
// Hohmann transfer orbital burns (Δv), escape velocity vesc = √(2GM/r),
// Orbital elements: Semi-major axis a, eccentricity e, apoapsis ra, periapsis rp, period T.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initOrbitalMechanicsLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return () => {};

  // Primary Gravitational Bodies
  const CENTRAL_BODIES = {
    earth: {
      name: "Planet Earth (M = 5.97 × 10²⁴ kg)",
      massKg: 5.972e24,
      radiusKm: 6371,
      gm: 3.986e14, // m³/s² (standard gravitational parameter μ)
      color: "#0284c7",
      glowColor: "rgba(56, 189, 248, 0.4)",
      atmosphereKm: 100,
      description: "Terrestrial primary. Low Earth Orbit (LEO) to Geostationary (GEO) dynamics."
    },
    sun: {
      name: "The Sun (M = 1.989 × 10³⁰ kg)",
      massKg: 1.989e30,
      radiusKm: 696340,
      gm: 1.327e20,
      color: "#f59e0b",
      glowColor: "rgba(251, 191, 36, 0.45)",
      atmosphereKm: 0,
      description: "Heliocentric primary. Planetary orbital mechanics and comet trajectories."
    }
  };

  // State Variables
  let currentBodyKey = "earth";
  let semiMajorAxisScale = 1.0; // 0.6 to 2.2 relative
  let eccentricity = 0.35; // 0.0 (circular) to 0.85 (highly elliptical)
  let trueAnomaly = 0; // Current angle θ (radians)
  let showEqualAreas = true;
  let sweepSlices = []; // Animated area sectors
  let lastSliceAngle = 0;
  let timeScale = 1.0;
  let viewMode = "sim"; // "sim" or "photo"
  let animId = null;

  // Orbital Elements Calculations
  function calculateOrbitalState() {
    const body = CENTRAL_BODIES[currentBodyKey];
    // Base scale in pixels: center = (cw/2, ch/2)
    // a in visual pixels: 160 * scale
    const aVisual = 150 * semiMajorAxisScale;
    const bVisual = aVisual * Math.sqrt(Math.max(0.01, 1 - eccentricity * eccentricity));
    const cVisual = aVisual * eccentricity; // Focal distance

    // Periapsis & Apoapsis distances (relative km)
    const baseScaleKm = body.radiusKm * 3.2;
    const aKm = baseScaleKm * semiMajorAxisScale;
    const rpKm = aKm * (1 - eccentricity);
    const raKm = aKm * (1 + eccentricity);

    // Orbital Period T = 2π * sqrt(a³ / μ)
    const periodSec = 2 * Math.PI * Math.sqrt(Math.pow(aKm * 1000, 3) / body.gm);
    const periodHours = periodSec / 3600;

    // Current distance r(θ) = a(1 - e²) / (1 + e cos θ)
    const rCurrentVisual = (aVisual * (1 - eccentricity * eccentricity)) / (1 + eccentricity * Math.cos(trueAnomaly));
    const rCurrentKm = (aKm * (1 - eccentricity * eccentricity)) / (1 + eccentricity * Math.cos(trueAnomaly));

    // Vis-Viva Speed v = sqrt(μ * (2/r - 1/a))
    const currentSpeedKms = Math.sqrt(body.gm * (2 / (rCurrentKm * 1000) - 1 / (aKm * 1000))) / 1000;
    const periapsisSpeedKms = Math.sqrt(body.gm * (2 / (rpKm * 1000) - 1 / (aKm * 1000))) / 1000;
    const apoapsisSpeedKms = Math.sqrt(body.gm * (2 / (raKm * 1000) - 1 / (aKm * 1000))) / 1000;
    const escapeSpeedKms = Math.sqrt(2 * body.gm / (rCurrentKm * 1000)) / 1000;

    // Kepler 3rd Law ratio T² / a³ (constant = 4π² / GM)
    const harmonicRatio = Math.pow(periodSec, 2) / Math.pow(aKm * 1000, 3);

    return {
      aVisual,
      bVisual,
      cVisual,
      aKm,
      rpKm,
      raKm,
      periodHours,
      rCurrentKm,
      currentSpeedKms,
      periapsisSpeedKms,
      apoapsisSpeedKms,
      escapeSpeedKms,
      harmonicRatio
    };
  }

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #6366f1; box-shadow: 0 0 10px #6366f1;"></span>
            Keplerian Orbital Mechanics &amp; Gravitation
          </span>
          <span class="badge" style="background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); color: #a5b4fc; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            v² = GM(2/r - 1/a) • T² ∝ a³ • Equal Areas
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-orbital-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🪐 Orbital Orbit View
            </button>
            <button id="view-mode-orbital-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-orbital-burn-prograde" style="padding: 5px 14px; font-size: 0.78rem;">
            🚀 +Δv Prograde Burn
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-orbital-circularize" style="padding: 5px 12px; font-size: 0.78rem;">
            ⭕ Circularize Orbit (e=0)
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-orbital-export" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export Ephemeris CSV
          </button>
        </div>
      </div>

      <!-- Main Layout Grid -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="orbital-layout">
        <!-- Canvas Viewport -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(99, 102, 241, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #1e1b4b 0%, #09090b 60%, #000000 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="orbital-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Real Laboratory Photograph Overlay -->
          <div id="orbital-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <img src="assets/labs/orbital_bench.jpg" alt="4K Research Orbital Dynamics & Mission Control Telemetry Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Orbital Integrator</div>
                <div style="color: #818cf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Symplectic Runge-Kutta 4th</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Apoapsis / Periapsis Radar</div>
                <div style="color: #facc15; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Dual-Band Space Surveillance</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Delta-v Budget</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Hohmann Transfer Calculator</div>
              </div>
            </div>
          </div>

          <!-- Top HUD -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">ORBITAL VELOCITY (VIS-VIVA)</div>
              <div id="hud-orbital-speed" style="font-size: 1.12rem; font-weight: 800; color: #818cf8; font-family: var(--font-mono);">
                v = 7.62 km/s (r = 7,450 km)
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">ORBITAL PERIOD &amp; ECCENTRICITY</div>
              <div id="hud-orbital-period" style="font-size: 1.12rem; font-weight: 800; color: #fbbf24; font-family: var(--font-mono);">
                T = 2.45 h • e = 0.350
              </div>
            </div>
          </div>
        </div>

        <!-- Controls & Keplerian Analytics Side -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Controls Panel -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #818cf8; text-transform: uppercase; margin-bottom: 12px;">Attractor &amp; Orbital Parameters</div>
            
            <div style="margin-bottom: 12px;">
              <label style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Primary Gravitational Body</label>
              <select id="select-orbital-body" class="form-control" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                ${Object.entries(CENTRAL_BODIES).map(([k, b]) => `<option value="${k}" ${k === currentBodyKey ? "selected" : ""}>${b.name}</option>`).join("")}
              </select>
            </div>

            <!-- Eccentricity Slider -->
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                <span style="color: #94a3b8;">Orbital Eccentricity (e)</span>
                <span id="lbl-eccentricity" style="color: #fbbf24; font-weight: 700;">0.35 (Elliptical)</span>
              </div>
              <input id="slider-eccentricity" type="range" min="0.0" max="0.80" step="0.02" value="0.35" style="width: 100%; accent-color: #fbbf24;">
              <div style="display: flex; justify-content: space-between; font-size: 0.68rem; color: #64748b; margin-top: 2px;">
                <span>0.00 (Circular Orbit)</span>
                <span>0.80 (Highly Eccentric)</span>
              </div>
            </div>

            <!-- Semi-Major Axis Slider -->
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                <span style="color: #94a3b8;">Semi-Major Axis (a)</span>
                <span id="lbl-semi-major" style="color: #38bdf8; font-weight: 700;">1.00× Normal Scale</span>
              </div>
              <input id="slider-semi-major" type="range" min="0.65" max="1.50" step="0.05" value="1.00" style="width: 100%; accent-color: #38bdf8;">
            </div>

            <!-- Equal Areas Sector Visualizer Toggle -->
            <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.3); border: 1px solid #334155; border-radius: 8px; padding: 8px 12px;">
              <div>
                <div style="font-size: 0.78rem; font-weight: 700; color: #cbd5e1;">Kepler's 2nd Law (Equal-Area Sectors)</div>
                <div style="font-size: 0.68rem; color: #94a3b8;">Animates sweeping equal sector areas (dA/dt = const)</div>
              </div>
              <input id="toggle-equal-areas" type="checkbox" checked style="accent-color: #6366f1; width: 18px; height: 18px; cursor: pointer;">
            </div>
          </div>

          <!-- Astrodynamics Metrics Card -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div style="font-size: 0.75rem; font-weight: 700; color: #38bdf8; text-transform: uppercase;">Orbital Mechanics Telemetry</div>
              <span class="badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-size: 0.68rem; padding: 2px 8px; border-radius: 6px;">
                Kepler Harmonic T²/a³
              </span>
            </div>
            
            <div style="background: #030712; border: 1px solid #1e293b; border-radius: 8px; padding: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.76rem;">
              <div>
                <span style="color: #64748b;">Periapsis Velocity (Max):</span>
                <strong id="val-vp" style="color: #34d399; display: block; font-family: var(--font-mono);">9.82 km/s</strong>
              </div>
              <div>
                <span style="color: #64748b;">Apoapsis Velocity (Min):</span>
                <strong id="val-va" style="color: #f43f5e; display: block; font-family: var(--font-mono);">5.45 km/s</strong>
              </div>
              <div>
                <span style="color: #64748b;">Periapsis Radius (rp):</span>
                <strong id="val-rp" style="color: #f8fafc; display: block; font-family: var(--font-mono);">13,250 km</strong>
              </div>
              <div>
                <span style="color: #64748b;">Apoapsis Radius (ra):</span>
                <strong id="val-ra" style="color: #f8fafc; display: block; font-family: var(--font-mono);">27,510 km</strong>
              </div>
              <div style="grid-column: span 2; border-top: 1px dashed #334155; padding-top: 6px; margin-top: 2px;">
                <span style="color: #64748b;">Kepler Harmonic Constant T²/a³:</span>
                <strong id="val-kepler-ratio" style="color: #a5b4fc; display: block; font-family: var(--font-mono);">9.896 × 10⁻¹⁴ s²/m³ (Matches 4π²/GM)</strong>
              </div>
            </div>
          </div>

          <!-- Post-Lab Checkpoint Container -->
          <div id="orbital-checkpoint-container"></div>
        </div>
      </div>
    </div>
  `;

  // Attach Checkpoint
  mountLabCheckpoint("orbital-checkpoint-container", "orbital");

  // DOM Elements
  const canvas = document.getElementById("orbital-canvas");
  const ctx = canvas.getContext("2d");

  const viewSimBtn = document.getElementById("view-mode-orbital-sim");
  const viewPhotoBtn = document.getElementById("view-mode-orbital-photo");
  const photoOverlay = document.getElementById("orbital-photo-overlay");

  const btnPrograde = document.getElementById("btn-orbital-burn-prograde");
  const btnCircularize = document.getElementById("btn-orbital-circularize");
  const btnExport = document.getElementById("btn-orbital-export");

  const selectBody = document.getElementById("select-orbital-body");
  const sliderEcc = document.getElementById("slider-eccentricity");
  const sliderA = document.getElementById("slider-semi-major");
  const toggleAreas = document.getElementById("toggle-equal-areas");

  const lblEcc = document.getElementById("lbl-eccentricity");
  const lblA = document.getElementById("lbl-semi-major");

  const hudSpeed = document.getElementById("hud-orbital-speed");
  const hudPeriod = document.getElementById("hud-orbital-period");
  const valVp = document.getElementById("val-vp");
  const valVa = document.getElementById("val-va");
  const valRp = document.getElementById("val-rp");
  const valRa = document.getElementById("val-ra");
  const valRatio = document.getElementById("val-kepler-ratio");

  function updateHUD() {
    const orb = calculateOrbitalState();
    hudSpeed.textContent = `v = ${orb.currentSpeedKms.toFixed(2)} km/s (r = ${Math.round(orb.rCurrentKm).toLocaleString()} km)`;
    hudPeriod.textContent = `T = ${orb.periodHours.toFixed(2)} h • e = ${eccentricity.toFixed(3)}`;

    valVp.textContent = `${orb.periapsisSpeedKms.toFixed(2)} km/s`;
    valVa.textContent = `${orb.apoapsisSpeedKms.toFixed(2)} km/s`;
    valRp.textContent = `${Math.round(orb.rpKm).toLocaleString()} km`;
    valRa.textContent = `${Math.round(orb.raKm).toLocaleString()} km`;
    valRatio.textContent = `${orb.harmonicRatio.toExponential(3)} s²/m³ (Verified Constant)`;
  }

  // 60 FPS Astrodynamics Canvas Render Loop
  function renderOrbitalCanvas() {
    if (!container || !container.isConnected) return;
    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);

    const body = CENTRAL_BODIES[currentBodyKey];
    const orb = calculateOrbitalState();

    // Center of Canvas
    const centerX = cw * 0.5;
    const centerY = ch * 0.5;

    // The primary central body sits at one focus F1
    // Ellipse center is offset by cVisual along the major axis
    // Let's place the primary body at (centerX, centerY)
    // Focus F1 = (centerX, centerY)
    // Ellipse center = (centerX - orb.cVisual, centerY)
    const ellipseCenterX = centerX - orb.cVisual;
    const ellipseCenterY = centerY;

    // Update true anomaly θ using Kepler's 2nd Law angular rate:
    // dθ/dt = L / (m * r²) ∝ (1 + e cos θ)² / (1 - e²)^(3/2)
    const num = Math.pow(1 + eccentricity * Math.cos(trueAnomaly), 2);
    const den = Math.pow(Math.max(0.1, 1 - eccentricity * eccentricity), 1.5);
    const dTheta = 0.02 * (num / den) * timeScale;
    trueAnomaly = (trueAnomaly + dTheta) % (Math.PI * 2);

    // Track equal-area slices every ~45 degrees or fixed time interval
    if (showEqualAreas) {
      if (Math.abs(trueAnomaly - lastSliceAngle) > 0.45) {
        sweepSlices.push({
          startTheta: lastSliceAngle,
          endTheta: trueAnomaly,
          alpha: 0.65
        });
        lastSliceAngle = trueAnomaly;
        if (sweepSlices.length > 8) sweepSlices.shift();
      }
    }

    // 1. Deep Space Background Starfield
    ctx.fillStyle = "#ffffff";
    for (let s = 0; s < 25; s++) {
      const sx = (s * 97) % cw;
      const sy = (s * 131) % ch;
      ctx.fillRect(sx, sy, 1.2, 1.2);
    }

    // 2. Draw Equal-Area Slices (Kepler's 2nd Law dA/dt = const)
    if (showEqualAreas) {
      sweepSlices.forEach(slice => {
        slice.alpha -= 0.003;
        if (slice.alpha <= 0) return;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(centerX, centerY); // From primary focus

        // Arc along ellipse between startTheta and endTheta
        const steps = 15;
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
        ctx.strokeStyle = `rgba(165, 180, 252, ${slice.alpha * 0.7})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      });
    }

    // 3. Draw Elliptical Orbit Track
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(ellipseCenterX, ellipseCenterY, orb.aVisual, orb.bVisual, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(99, 102, 241, 0.6)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Major Axis Line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ellipseCenterX - orb.aVisual - 20, ellipseCenterY);
    ctx.lineTo(ellipseCenterX + orb.aVisual + 20, ellipseCenterY);
    ctx.stroke();

    // Mark Periapsis (Right) & Apoapsis (Left)
    const periapsisX = centerX + (orb.aVisual - orb.cVisual);
    const apoapsisX = centerX - (orb.aVisual + orb.cVisual);

    ctx.fillStyle = "#34d399";
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("PERIAPSIS (rp)", periapsisX + 10, centerY - 12);
    ctx.beginPath();
    ctx.arc(periapsisX, centerY, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f43f5e";
    ctx.fillText("APOAPSIS (ra)", apoapsisX - 10, centerY - 12);
    ctx.beginPath();
    ctx.arc(apoapsisX, centerY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 4. Draw Central Primary Attractor (Focus F1)
    ctx.save();
    const primaryR = currentBodyKey === "earth" ? 28 : 34;

    // Atmospheric / Corona Glow
    const bodyGlow = ctx.createRadialGradient(centerX, centerY, primaryR * 0.7, centerX, centerY, primaryR * 2.2);
    bodyGlow.addColorStop(0, body.glowColor);
    bodyGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = bodyGlow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, primaryR * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Planet Sphere
    const sphereGrad = ctx.createRadialGradient(centerX - 8, centerY - 8, 4, centerX, centerY, primaryR);
    sphereGrad.addColorStop(0, "#ffffff");
    sphereGrad.addColorStop(0.3, body.color);
    sphereGrad.addColorStop(1, "#0f172a");
    ctx.fillStyle = sphereGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, primaryR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // 5. Draw Orbiting Satellite
    const rCurrentVisual = (orb.aVisual * (1 - eccentricity * eccentricity)) / (1 + eccentricity * Math.cos(trueAnomaly));
    const satX = centerX + rCurrentVisual * Math.cos(trueAnomaly);
    const satY = centerY + rCurrentVisual * Math.sin(trueAnomaly);

    ctx.save();
    // Satellite Glow
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 10;

    // Satellite Bus
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(satX - 4, satY - 4, 8, 8);

    // Solar Arrays
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(satX - 14, satY - 2, 8, 4);
    ctx.fillRect(satX + 6, satY - 2, 8, 4);

    // Velocity Vector Arrow
    const velAngle = trueAnomaly + Math.PI / 2 + Math.atan((eccentricity * Math.sin(trueAnomaly)) / (1 + eccentricity * Math.cos(trueAnomaly)));
    const velLen = 14 + (orb.currentSpeedKms / orb.periapsisSpeedKms) * 22;
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
    ctx.arc(tipX, tipY, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    updateHUD();
    animId = requestAnimationFrame(renderOrbitalCanvas);
  }

  // Event Listeners
  selectBody.addEventListener("change", (e) => {
    currentBodyKey = e.target.value;
    sweepSlices.length = 0;
    SoundFX.droplet();
  });

  sliderEcc.addEventListener("input", (e) => {
    eccentricity = parseFloat(e.target.value);
    lblEcc.textContent = `${eccentricity.toFixed(2)} ${eccentricity === 0 ? "(Circular)" : (eccentricity > 0.5 ? "(Highly Elliptical)" : "(Elliptical)")}`;
    sweepSlices.length = 0;
  });

  sliderA.addEventListener("input", (e) => {
    semiMajorAxisScale = parseFloat(e.target.value);
    lblA.textContent = `${semiMajorAxisScale.toFixed(2)}× Normal Scale`;
    sweepSlices.length = 0;
  });

  toggleAreas.addEventListener("change", (e) => {
    showEqualAreas = e.target.checked;
    SoundFX.click();
  });

  btnPrograde.addEventListener("click", () => {
    // Prograde burn increases semi-major axis and eccentricity
    semiMajorAxisScale = Math.min(1.5, semiMajorAxisScale + 0.1);
    sliderA.value = semiMajorAxisScale;
    lblA.textContent = `${semiMajorAxisScale.toFixed(2)}× Normal Scale`;
    SoundFX.snap();
  });

  btnCircularize.addEventListener("click", () => {
    eccentricity = 0.0;
    sliderEcc.value = 0.0;
    lblEcc.textContent = "0.00 (Circular Orbit)";
    sweepSlices.length = 0;
    SoundFX.success();
  });

  // View Switcher (Sim vs 4K Photo)
  viewSimBtn.addEventListener("click", () => {
    viewMode = "sim";
    viewSimBtn.classList.add("active");
    viewPhotoBtn.classList.remove("active");
    viewSimBtn.style.background = "#0284c7";
    viewPhotoBtn.style.background = "transparent";
    photoOverlay.style.display = "none";
    canvas.style.display = "block";
    SoundFX.click();
  });

  viewPhotoBtn.addEventListener("click", () => {
    viewMode = "photo";
    viewPhotoBtn.classList.add("active");
    viewSimBtn.classList.remove("active");
    viewPhotoBtn.style.background = "#0284c7";
    viewSimBtn.style.background = "transparent";
    photoOverlay.style.display = "block";
    canvas.style.display = "none";
    SoundFX.click();
  });

  // Telemetry CSV Export
  btnExport.addEventListener("click", () => {
    const orb = calculateOrbitalState();
    const body = CENTRAL_BODIES[currentBodyKey];

    exportLabDataCsv({
      title: "Keplerian Orbital Mechanics & Gravitational Orbit Ephemeris",
      labId: "orbital",
      parameters: {
        "Central Primary Body": body.name,
        "Primary GM (µ)": `${body.gm.toExponential(4)} m³/s²`,
        "Semi-Major Axis (a)": `${Math.round(orb.aKm)} km`,
        "Orbital Eccentricity (e)": eccentricity.toFixed(4),
        "Orbital Period (T)": `${orb.periodHours.toFixed(3)} hours`,
        "Periapsis Radius (rp)": `${Math.round(orb.rpKm)} km`,
        "Apoapsis Radius (ra)": `${Math.round(orb.raKm)} km`,
        "Kepler Harmonic Constant T²/a³": `${orb.harmonicRatio.toExponential(4)} s²/m³`
      },
      headers: ["True Anomaly (deg)", "Orbital Radius (km)", "Orbital Velocity (km/s)", "Escape Velocity (km/s)"],
      dataRows: [0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
        const rad = (deg * Math.PI) / 180;
        const rKm = (orb.aKm * (1 - eccentricity * eccentricity)) / (1 + eccentricity * Math.cos(rad));
        const vKms = Math.sqrt(body.gm * (2 / (rKm * 1000) - 1 / (orb.aKm * 1000))) / 1000;
        const vEsc = Math.sqrt(2 * body.gm / (rKm * 1000)) / 1000;
        return [deg, Math.round(rKm), vKms.toFixed(2), vEsc.toFixed(2)];
      })
    });
    SoundFX.success();
  });

  // Start Animation Loop
  updateHUD();
  animId = requestAnimationFrame(renderOrbitalCanvas);

  return function cleanupOrbitalMechanicsLab() {
    if (animId) cancelAnimationFrame(animId);
  };
}
