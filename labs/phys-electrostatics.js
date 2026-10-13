// Edugates-ClipSAT Science Labs - Physics: Coulomb's Law & Electrostatic Field Mapping Suite
// 60 FPS Precision Classical Electromagnetism Simulation:
// Coulomb's Law F = ke·|q1·q2|/r², Electric field vector superposition E = ∑ ke·qi/ri² · r̂i,
// Electric potential V(r) = ∑ ke·qi/ri, Continuous Equipotential Contours via Marching Iso-Lines,
// Animated Electric Field Streamline Flux Particles,
// Preset configurations (Dipole, Quadrupole, Point Charges, Parallel Plates),
// Movable high-impedance digital electrometer / test charge probe with Coaxial Cable.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initElectrostaticsLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return () => {};

  // Physical Constants
  const COULOMB_KE = 8.9875517923e9; // N·m²/C²
  const EPSILON_0 = 8.8541878128e-12; // F/m

  // Active Charges Array
  const charges = [];

  // Preset Configurations
  const PRESETS = {
    dipole: {
      name: "Electric Dipole (+q and -q)",
      description: "Equal and opposite point charges separated by distance d. Generates classic dipole field lines and planar V=0 equipotential.",
      init: (cw, ch) => [
        { id: 1, q: 2.0, x: cw * 0.5 - 90, y: ch * 0.5, radius: 14, color: "#ef4444" },
        { id: 2, q: -2.0, x: cw * 0.5 + 90, y: ch * 0.5, radius: 14, color: "#3b82f6" }
      ]
    },
    like_charges: {
      name: "Repelling Like Charges (+q and +q)",
      description: "Two identical positive charges demonstrating mutual repulsion and a central saddle point where E = 0.",
      init: (cw, ch) => [
        { id: 1, q: 2.5, x: cw * 0.5 - 90, y: ch * 0.5, radius: 15, color: "#ef4444" },
        { id: 2, q: 2.5, x: cw * 0.5 + 90, y: ch * 0.5, radius: 15, color: "#ef4444" }
      ]
    },
    quadrupole: {
      name: "Electric Quadrupole (+ - / - +)",
      description: "Four alternating point charges forming a symmetric quadrupole field with high angular dependence.",
      init: (cw, ch) => [
        { id: 1, q: 2.0, x: cw * 0.5 - 80, y: ch * 0.5 - 80, radius: 14, color: "#ef4444" },
        { id: 2, q: -2.0, x: cw * 0.5 + 80, y: ch * 0.5 - 80, radius: 14, color: "#3b82f6" },
        { id: 3, q: -2.0, x: cw * 0.5 - 80, y: ch * 0.5 + 80, radius: 14, color: "#3b82f6" },
        { id: 4, q: 2.0, x: cw * 0.5 + 80, y: ch * 0.5 + 80, radius: 14, color: "#ef4444" }
      ]
    },
    parallel_plates: {
      name: "Parallel Capacitor Plates",
      description: "Oppositely charged parallel plates demonstrating a uniform electric field E = σ / ε₀ between plates with fringing fields at edges.",
      init: (cw, ch) => {
        const arr = [];
        for (let i = -3; i <= 3; i++) {
          arr.push({ id: 10 + i, q: 0.6, x: cw * 0.5 - 80, y: ch * 0.5 + i * 26, radius: 8, color: "#ef4444" });
          arr.push({ id: 20 + i, q: -0.6, x: cw * 0.5 + 80, y: ch * 0.5 + i * 26, radius: 8, color: "#3b82f6" });
        }
        return arr;
      }
    }
  };

  // State Variables
  let currentPresetKey = "dipole";
  let probeX = 290;
  let probeY = 180;
  let isDraggingProbe = false;
  let showVectors = true;
  let showEquipotentials = true;
  let viewMode = "sim"; // "sim" or "photo"
  let animId = null;
  let timeTick = 0;

  // Streamline Energy Flow Particle Swarm
  const fieldParticles = [];
  const NUM_PARTICLES = 60;
  for (let i = 0; i < NUM_PARTICLES; i++) {
    fieldParticles.push({
      x: Math.random() * 580,
      y: Math.random() * 530,
      life: Math.floor(Math.random() * 80),
      maxLife: 60 + Math.floor(Math.random() * 60),
      speed: 1.2 + Math.random() * 1.2
    });
  }

  function loadPreset(key) {
    currentPresetKey = key;
    charges.length = 0;
    const cw = 580;
    const ch = 530;
    charges.push(...PRESETS[key].init(cw, ch));
    // Reset streamline particles
    fieldParticles.forEach(p => {
      p.life = Math.floor(Math.random() * 80);
      p.x = Math.random() * cw;
      p.y = Math.random() * ch;
    });
    SoundFX.droplet();
  }

  // Calculate Field E and Potential V at arbitrary point (x, y)
  // Scale: 100 pixels = 0.50 meters (1 px = 0.005 m = 5 mm)
  const METERS_PER_PX = 0.005;

  function calculateFieldAt(px, py) {
    let Ex = 0;
    let Ey = 0;
    let V = 0;

    for (let i = 0; i < charges.length; i++) {
      const ch = charges[i];
      const dxMeters = (px - ch.x) * METERS_PER_PX;
      const dyMeters = (py - ch.y) * METERS_PER_PX;
      const rMeters = Math.sqrt(dxMeters * dxMeters + dyMeters * dyMeters);

      if (rMeters > 0.012) {
        // Potential V = ke * q / r (where q is in nanoCoulombs 1e-9)
        const qC = ch.q * 1e-9;
        V += (COULOMB_KE * qC) / rMeters;

        // Field E = ke * q / r² · r̂
        const eMag = (COULOMB_KE * qC) / (rMeters * rMeters);
        Ex += eMag * (dxMeters / rMeters);
        Ey += eMag * (dyMeters / rMeters);
      }
    }

    const eTotal = Math.sqrt(Ex * Ex + Ey * Ey);
    return { Ex, Ey, eTotal, V };
  }

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #818cf8; box-shadow: 0 0 10px #818cf8;"></span>
            Coulomb's Law &amp; Electrostatic Field Mapping
          </span>
          <span class="badge" style="background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); color: #a5b4fc; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            ${renderLatex("F = \\frac{k_e q_1 q_2}{r^2} \\quad \\bullet \\quad E = -\\nabla V \\quad \\bullet \\quad \\text{Equipotential Contours}")}
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-electro-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              ⚡ Field Visualizer
            </button>
            <button id="view-mode-electro-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-electro-reset-probe" style="padding: 5px 14px; font-size: 0.78rem; background: linear-gradient(135deg, #6366f1, #4f46e5); border: none; font-weight: 700; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);">
            📍 Center Probe
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-electro-export" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export CSV (E)
          </button>
        </div>
      </div>

      <!-- Main Layout Grid -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="electro-layout">
        <!-- Canvas Viewport -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(99, 102, 241, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #131238 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px; cursor: crosshair;">
          <canvas id="electro-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Real Laboratory Photograph Overlay -->
          <div id="electro-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <picture>
              <source srcset="assets/labs/electrostatics_bench.webp" type="image/webp">
              <img src="assets/labs/electrostatics_bench.jpg" decoding="async" loading="lazy" alt="4K Research High-Voltage Van de Graaff & Electrostatics Field Mapping Workbench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            </picture>
            
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Field Tank Apparatus</div>
                <div style="color: #818cf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Conductive Electrolytic Tank</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Voltmeter Probe</div>
                <div style="color: #facc15; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Silver Needle Electrode (10 GΩ)</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Electric Potential Precision</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">ΔV = ±0.01 Volts Resolution</div>
              </div>
            </div>
          </div>

          <!-- Top HUD -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto; box-shadow: 0 6px 18px rgba(0,0,0,0.6);">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase; display: flex; align-items: center; gap: 6px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #facc15; display: inline-block; box-shadow: 0 0 6px #facc15;"></span>
                ELECTRIC POTENTIAL AT PROBE (V)
              </div>
              <div id="hud-electro-v" style="font-size: 1.12rem; font-weight: 800; color: #facc15; font-family: var(--font-mono);">
                V = +24.80 Volts
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto; box-shadow: 0 6px 18px rgba(0,0,0,0.6);">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase; display: flex; align-items: center; justify-content: flex-end; gap: 6px;">
                ELECTRIC FIELD INTENSITY |E|
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #38bdf8; display: inline-block; box-shadow: 0 0 6px #38bdf8;"></span>
              </div>
              <div id="hud-electro-e" style="font-size: 1.12rem; font-weight: 800; color: #38bdf8; font-family: var(--font-mono);">
                |E| = 142.5 V/m (N/C)
              </div>
            </div>
          </div>
        </div>

        <!-- Controls & Field Analytics Side -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Controls Panel -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #818cf8; text-transform: uppercase; margin-bottom: 12px;">Charge Topologies &amp; Visual Overlays</div>
            
            <div style="margin-bottom: 12px;">
              <label style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Electrode Configuration Preset</label>
              <select id="select-electro-preset" class="form-control" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                ${Object.entries(PRESETS).map(([k, p]) => `<option value="${k}" ${k === currentPresetKey ? "selected" : ""}>${p.name}</option>`).join("")}
              </select>
            </div>

            <!-- Toggles for Field Vectors & Equipotentials -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <label style="display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.3); border: 1px solid #334155; border-radius: 8px; padding: 8px 10px; cursor: pointer; font-size: 0.76rem; color: #cbd5e1;">
                <input id="toggle-field-vectors" type="checkbox" checked style="accent-color: #38bdf8; width: 16px; height: 16px;">
                <span>E-Field Vector Grid</span>
              </label>

              <label style="display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.3); border: 1px solid #334155; border-radius: 8px; padding: 8px 10px; cursor: pointer; font-size: 0.76rem; color: #cbd5e1;">
                <input id="toggle-equipotentials" type="checkbox" checked style="accent-color: #facc15; width: 16px; height: 16px;">
                <span>Equipotential Lines</span>
              </label>
            </div>
          </div>

          <!-- Voltmeter Probe Telemetry -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div style="font-size: 0.75rem; font-weight: 700; color: #38bdf8; text-transform: uppercase;">Electrometer Probe Sensor</div>
              <span class="badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-size: 0.68rem; padding: 2px 8px; border-radius: 6px;">
                Drag Probe Anywhere on Canvas
              </span>
            </div>
            
            <div style="background: #030712; border: 1px solid #1e293b; border-radius: 8px; padding: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.76rem;">
              <div>
                <span style="color: #64748b;">Probe Coordinates:</span>
                <strong id="val-probe-pos" style="color: #f8fafc; display: block; font-family: var(--font-mono);">x = 0.00 m, y = -0.15 m</strong>
              </div>
              <div>
                <span style="color: #64748b;">Field Vector Angle:</span>
                <strong id="val-field-theta" style="color: #38bdf8; display: block; font-family: var(--font-mono);">θ = -34.2°</strong>
              </div>
              <div>
                <span style="color: #64748b;">E_x Component:</span>
                <strong id="val-ex" style="color: #f8fafc; display: block; font-family: var(--font-mono);">+117.8 V/m</strong>
              </div>
              <div>
                <span style="color: #64748b;">E_y Component:</span>
                <strong id="val-ey" style="color: #f8fafc; display: block; font-family: var(--font-mono);">-80.4 V/m</strong>
              </div>
            </div>

            <div id="electro-preset-desc" style="margin-top: 10px; font-size: 0.74rem; color: #94a3b8; line-height: 1.4; background: rgba(0,0,0,0.25); border-radius: 6px; padding: 8px 12px;">
              Equal and opposite point charges separated by distance d. Generates classic dipole field lines.
            </div>
          </div>

          <!-- Theoretical Foundations Badge -->
          <div style="background: rgba(15, 23, 42, 0.6); border: 1px dashed #334155; border-radius: 12px; padding: 12px 16px; font-size: 0.73rem; color: #94a3b8; line-height: 1.5;">
            <strong style="color: #cbd5e1; display: block; margin-bottom: 2px;">⚡ Orthogonality Theorem:</strong>
            Electric field lines $\\vec{E}$ are strictly perpendicular to equipotential lines at every point ($d\\vec{l} \\cdot \\vec{E} = 0$). No work is done moving a test charge along an equipotential surface ($W = q\\Delta V = 0$).
          </div>
        </div>
      </div>

      <!-- Assessment Checkpoint Container -->
      <div id="electrostatics-checkpoint-container" style="margin-top: 24px;"></div>
    </div>
  `;

  // Attach Checkpoint
  mountLabCheckpoint("electrostatics-checkpoint-container", "electrostatics");

  // DOM Elements
  const canvas = container.querySelector("#electro-canvas");
  const ctx = canvas.getContext("2d");
  const selectPreset = container.querySelector("#select-electro-preset");
  const toggleVectors = container.querySelector("#toggle-field-vectors");
  const togglePotentials = container.querySelector("#toggle-equipotentials");
  const btnResetProbe = container.querySelector("#btn-electro-reset-probe");
  const btnExport = container.querySelector("#btn-electro-export");
  const viewSimBtn = container.querySelector("#view-mode-electro-sim");
  const viewPhotoBtn = container.querySelector("#view-mode-electro-photo");
  const photoOverlay = container.querySelector("#electro-photo-overlay");

  // HUD Elements
  const hudV = container.querySelector("#hud-electro-v");
  const hudE = container.querySelector("#hud-electro-e");
  const valProbePos = container.querySelector("#val-probe-pos");
  const valFieldTheta = container.querySelector("#val-field-theta");
  const valEx = container.querySelector("#val-ex");
  const valEy = container.querySelector("#val-ey");
  const presetDesc = container.querySelector("#electro-preset-desc");

  // HiDPI / Retina Canvas Setup
  const logicalW = 580;
  const logicalH = 530;

  function setupHiDPICanvas() {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (typeof window.getOptimizedDPR === "function" ? window.getOptimizedDPR() : (window.devicePixelRatio || 1));
    const rect = canvas.getBoundingClientRect();
    const w = rect.width > 0 ? rect.width : logicalW;
    const h = rect.height > 0 ? rect.height : logicalH;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.resetTransform();
    ctx.scale(dpr * (w / logicalW), dpr * (h / logicalH));
  }
  setupHiDPICanvas();
  window.addEventListener("resize", setupHiDPICanvas);

  function updateHUD() {
    const { Ex, Ey, eTotal, V } = calculateFieldAt(probeX, probeY);

    // Convert pixel coordinates to meters relative to center
    const xMeters = (probeX - logicalW * 0.5) * METERS_PER_PX;
    const yMeters = -(probeY - logicalH * 0.5) * METERS_PER_PX;

    // Angle in degrees
    const angleRad = Math.atan2(Ey, Ex);
    const angleDeg = (angleRad * 180 / Math.PI);

    hudV.textContent = `V = ${V >= 0 ? "+" : ""}${V.toFixed(2)} Volts`;
    hudE.textContent = `|E| = ${eTotal.toFixed(1)} V/m (N/C)`;

    valProbePos.textContent = `x = ${xMeters.toFixed(2)} m, y = ${yMeters.toFixed(2)} m`;
    valFieldTheta.textContent = `θ = ${angleDeg.toFixed(1)}°`;
    valEx.textContent = `${Ex >= 0 ? "+" : ""}${Ex.toFixed(1)} V/m`;
    valEy.textContent = `${Ey >= 0 ? "+" : ""}${Ey.toFixed(1)} V/m`;

    presetDesc.textContent = PRESETS[currentPresetKey].description;
  }

  // Pre-allocated grid memory for fast continuous marching squares
  const STEP = 10;
  const cols = Math.floor(logicalW / STEP) + 1;
  const rows = Math.floor(logicalH / STEP) + 1;
  const vGrid = new Float32Array(cols * rows);

  // 60 FPS Electrostatic Canvas Render Loop
  function renderElectroCanvas() {
    if (!container || !container.isConnected) return;
    timeTick += 0.02;

    ctx.clearRect(0, 0, logicalW, logicalH);

    // Subtle background grid
    ctx.save();
    ctx.strokeStyle = "rgba(99, 102, 241, 0.08)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= logicalW; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, logicalH);
      ctx.stroke();
    }
    for (let y = 0; y <= logicalH; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(logicalW, y);
      ctx.stroke();
    }
    ctx.restore();

    // 1. Smooth Continuous Equipotential Contours via Marching Squares
    if (showEquipotentials) {
      ctx.save();
      // Sample potential on the grid
      for (let r = 0; r < rows; r++) {
        const y = r * STEP;
        for (let c = 0; c < cols; c++) {
          const x = c * STEP;
          vGrid[r * cols + c] = calculateFieldAt(x, y).V;
        }
      }

      // Contour isovalues to trace
      const contourLevels = [-60, -40, -25, -15, -8, -3, 0, 3, 8, 15, 25, 40, 60];

      contourLevels.forEach(isoV => {
        const isZero = Math.abs(isoV) < 0.1;
        const isPos = isoV > 0;

        if (isZero) {
          ctx.strokeStyle = "rgba(248, 250, 252, 0.75)";
          ctx.lineWidth = 1.8;
          ctx.setLineDash([4, 3]);
        } else if (isPos) {
          ctx.strokeStyle = `rgba(251, 191, 36, ${Math.min(0.7, 0.2 + (Math.abs(isoV) / 60) * 0.5)})`;
          ctx.lineWidth = 1.2;
          ctx.setLineDash([]);
        } else {
          ctx.strokeStyle = `rgba(56, 189, 248, ${Math.min(0.7, 0.2 + (Math.abs(isoV) / 60) * 0.5)})`;
          ctx.lineWidth = 1.2;
          ctx.setLineDash([]);
        }

        ctx.beginPath();
        for (let r = 0; r < rows - 1; r++) {
          const y0 = r * STEP;
          const y1 = y0 + STEP;
          for (let c = 0; c < cols - 1; c++) {
            const x0 = c * STEP;
            const x1 = x0 + STEP;

            const v0 = vGrid[r * cols + c];
            const v1 = vGrid[r * cols + (c + 1)];
            const v2 = vGrid[(r + 1) * cols + (c + 1)];
            const v3 = vGrid[(r + 1) * cols + c];

            let cellIdx = 0;
            if (v0 > isoV) cellIdx |= 1;
            if (v1 > isoV) cellIdx |= 2;
            if (v2 > isoV) cellIdx |= 4;
            if (v3 > isoV) cellIdx |= 8;

            if (cellIdx === 0 || cellIdx === 15) continue;

            // Interpolation helper along cell edges
            const topPt = () => ({ x: x0 + (STEP * (isoV - v0)) / (v1 - v0), y: y0 });
            const rightPt = () => ({ x: x1, y: y0 + (STEP * (isoV - v1)) / (v2 - v1) });
            const botPt = () => ({ x: x0 + (STEP * (isoV - v3)) / (v2 - v3), y: y1 });
            const leftPt = () => ({ x: x0, y: y0 + (STEP * (isoV - v0)) / (v3 - v0) });

            let pA, pB, pC, pD;
            switch (cellIdx) {
              case 1: case 14:
                pA = leftPt(); pB = topPt();
                ctx.moveTo(pA.x, pA.y); ctx.lineTo(pB.x, pB.y);
                break;
              case 2: case 13:
                pA = topPt(); pB = rightPt();
                ctx.moveTo(pA.x, pA.y); ctx.lineTo(pB.x, pB.y);
                break;
              case 3: case 12:
                pA = leftPt(); pB = rightPt();
                ctx.moveTo(pA.x, pA.y); ctx.lineTo(pB.x, pB.y);
                break;
              case 4: case 11:
                pA = rightPt(); pB = botPt();
                ctx.moveTo(pA.x, pA.y); ctx.lineTo(pB.x, pB.y);
                break;
              case 5:
                pA = leftPt(); pB = topPt();
                pC = rightPt(); pD = botPt();
                ctx.moveTo(pA.x, pA.y); ctx.lineTo(pB.x, pB.y);
                ctx.moveTo(pC.x, pC.y); ctx.lineTo(pD.x, pD.y);
                break;
              case 10:
                pA = topPt(); pB = rightPt();
                pC = botPt(); pD = leftPt();
                ctx.moveTo(pA.x, pA.y); ctx.lineTo(pB.x, pB.y);
                ctx.moveTo(pC.x, pC.y); ctx.lineTo(pD.x, pD.y);
                break;
              case 6: case 9:
                pA = topPt(); pB = botPt();
                ctx.moveTo(pA.x, pA.y); ctx.lineTo(pB.x, pB.y);
                break;
              case 7: case 8:
                pA = leftPt(); pB = botPt();
                ctx.moveTo(pA.x, pA.y); ctx.lineTo(pB.x, pB.y);
                break;
            }
          }
        }
        ctx.stroke();
      });
      ctx.restore();
    }

    // 2. Animated Electric Field Streamlines (Flux energy flow particles)
    ctx.save();
    const posCharges = charges.filter(c => c.q > 0);
    const negCharges = charges.filter(c => c.q < 0);

    for (let i = 0; i < fieldParticles.length; i++) {
      const p = fieldParticles[i];
      const { Ex, Ey, eTotal } = calculateFieldAt(p.x, p.y);

      if (eTotal > 1.0) {
        p.x += (Ex / eTotal) * p.speed;
        p.y += (Ey / eTotal) * p.speed;
      }
      p.life++;

      // Check collision with negative charge or boundary or expired life
      let reset = p.life >= p.maxLife || p.x < 0 || p.x > logicalW || p.y < 0 || p.y > logicalH;
      if (!reset) {
        for (let nc = 0; nc < negCharges.length; nc++) {
          const ch = negCharges[nc];
          const d2 = (p.x - ch.x) ** 2 + (p.y - ch.y) ** 2;
          if (d2 < (ch.radius + 2) ** 2) {
            reset = true;
            break;
          }
        }
      }

      if (reset) {
        p.life = 0;
        if (posCharges.length > 0 && Math.random() < 0.85) {
          const ch = posCharges[Math.floor(Math.random() * posCharges.length)];
          const ang = Math.random() * Math.PI * 2;
          p.x = ch.x + Math.cos(ang) * (ch.radius + 3);
          p.y = ch.y + Math.sin(ang) * (ch.radius + 3);
        } else {
          p.x = Math.random() * logicalW;
          p.y = Math.random() * logicalH;
        }
      }

      const pAlpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.65;
      ctx.fillStyle = `rgba(165, 180, 252, ${pAlpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 3. Electric Field Vector Grid Arrows (E = -∇V)
    if (showVectors) {
      ctx.save();
      const gridSpacing = 32;
      for (let x = gridSpacing / 2; x < logicalW; x += gridSpacing) {
        for (let y = gridSpacing / 2; y < logicalH; y += gridSpacing) {
          const { Ex, Ey, eTotal } = calculateFieldAt(x, y);
          if (eTotal > 2.0) {
            const angle = Math.atan2(Ey, Ex);
            const arrowLen = Math.min(18, 5 + Math.log10(eTotal) * 4);
            const alpha = Math.min(0.85, 0.2 + (arrowLen / 18) * 0.65);

            ctx.strokeStyle = `rgba(129, 140, 248, ${alpha})`;
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.moveTo(x, y);
            const tipX = x + Math.cos(angle) * arrowLen;
            const tipY = y + Math.sin(angle) * arrowLen;
            ctx.lineTo(tipX, tipY);
            ctx.stroke();

            // Arrowhead
            const headLen = 3.5;
            ctx.fillStyle = `rgba(129, 140, 248, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(tipX, tipY);
            ctx.lineTo(tipX - headLen * Math.cos(angle - Math.PI / 6), tipY - headLen * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(tipX - headLen * Math.cos(angle + Math.PI / 6), tipY - headLen * Math.sin(angle + Math.PI / 6));
            ctx.closePath();
            ctx.fill();
          }
        }
      }
      ctx.restore();
    }

    // 4. Render High-Voltage Plasma Point Charges
    charges.forEach(chg => {
      ctx.save();
      const isPositive = chg.q > 0;
      const pulse = Math.sin(timeTick * 4 + chg.id) * 2;

      // Multi-layer corona glow
      const outerGlow = ctx.createRadialGradient(chg.x, chg.y, chg.radius * 0.5, chg.x, chg.y, (chg.radius * 2.8) + pulse);
      outerGlow.addColorStop(0, isPositive ? "rgba(239, 68, 68, 0.85)" : "rgba(59, 130, 246, 0.85)");
      outerGlow.addColorStop(0.5, isPositive ? "rgba(244, 63, 94, 0.35)" : "rgba(96, 165, 250, 0.35)");
      outerGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(chg.x, chg.y, (chg.radius * 2.8) + pulse, 0, Math.PI * 2);
      ctx.fill();

      // 3D Spherical Shading on charge body
      const bodyGrad = ctx.createRadialGradient(
        chg.x - chg.radius * 0.35, chg.y - chg.radius * 0.35, chg.radius * 0.1,
        chg.x, chg.y, chg.radius
      );
      if (isPositive) {
        bodyGrad.addColorStop(0, "#fca5a5");
        bodyGrad.addColorStop(0.3, "#ef4444");
        bodyGrad.addColorStop(0.8, "#b91c1c");
        bodyGrad.addColorStop(1, "#7f1d1d");
      } else {
        bodyGrad.addColorStop(0, "#93c5fd");
        bodyGrad.addColorStop(0.3, "#3b82f6");
        bodyGrad.addColorStop(0.8, "#1d4ed8");
        bodyGrad.addColorStop(1, "#1e3a8a");
      }

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.arc(chg.x, chg.y, chg.radius, 0, Math.PI * 2);
      ctx.fill();

      // Outer rim ring
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Charge symbol (+ or −) with embossed shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
      ctx.shadowBlur = 4;
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${Math.max(12, chg.radius * 1.1)}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(isPositive ? "+" : "−", chg.x, chg.y + (isPositive ? 1 : -1));
      ctx.restore();
    });

    // 5. Movable Digital Electrometer Voltmeter Sensor Probe & Coaxial Cable
    ctx.save();
    // Coaxial Cable from corner (0, logicalH) to probe
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(15, logicalH - 15);
    ctx.bezierCurveTo(logicalW * 0.2, logicalH * 0.8, probeX - 60, probeY + 80, probeX, probeY + 12);
    ctx.stroke();

    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(15, logicalH - 15);
    ctx.bezierCurveTo(logicalW * 0.2, logicalH * 0.8, probeX - 60, probeY + 80, probeX, probeY + 12);
    ctx.stroke();

    // Concentric probe reticle
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(probeX, probeY, 14, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(probeX - 18, probeY);
    ctx.lineTo(probeX + 18, probeY);
    ctx.moveTo(probeX, probeY - 18);
    ctx.lineTo(probeX, probeY + 18);
    ctx.stroke();

    // Center gold needle electrode
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(probeX, probeY, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Probe Glassmorphic Readout Tag
    const { V, eTotal } = calculateFieldAt(probeX, probeY);
    const tagX = Math.min(logicalW - 100, probeX + 20);
    const tagY = Math.max(25, probeY - 18);

    ctx.fillStyle = "rgba(15, 23, 42, 0.94)";
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(tagX, tagY, 82, 34, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#facc15";
    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText(`${V >= 0 ? "+" : ""}${V.toFixed(1)} V`, tagX + 8, tagY + 14);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.fillText(`${eTotal.toFixed(0)} V/m`, tagX + 8, tagY + 28);
    ctx.restore();

    updateHUD();
    animId = requestAnimationFrame(renderElectroCanvas);
  }

  // Pointer Dragging for Voltmeter Probe
  function handlePointerMove(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = logicalW / rect.width;
    const scaleY = logicalH / rect.height;
    probeX = Math.max(10, Math.min(logicalW - 10, (e.clientX - rect.left) * scaleX));
    probeY = Math.max(10, Math.min(logicalH - 10, (e.clientY - rect.top) * scaleY));
  }

  canvas.addEventListener("pointerdown", (e) => {
    isDraggingProbe = true;
    handlePointerMove(e);
    canvas.setPointerCapture(e.pointerId);
    SoundFX.click();
  });

  canvas.addEventListener("pointermove", (e) => {
    if (isDraggingProbe) {
      handlePointerMove(e);
    }
  });

  canvas.addEventListener("pointerup", (e) => {
    isDraggingProbe = false;
    canvas.releasePointerCapture(e.pointerId);
  });

  // Event Listeners
  selectPreset.addEventListener("change", (e) => {
    loadPreset(e.target.value);
    updateHUD();
  });

  toggleVectors.addEventListener("change", (e) => {
    showVectors = e.target.checked;
    SoundFX.click();
  });

  togglePotentials.addEventListener("change", (e) => {
    showEquipotentials = e.target.checked;
    SoundFX.click();
  });

  btnResetProbe.addEventListener("click", () => {
    probeX = logicalW * 0.5;
    probeY = logicalH * 0.5 - 40;
    SoundFX.snap();
    updateHUD();
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
    const { Ex, Ey, eTotal, V } = calculateFieldAt(probeX, probeY);

    exportLabDataCsv({
      title: "Coulomb's Law & Electrostatic Field Mapping Lab",
      labId: "electrostatics",
      parameters: {
        "Charge Topology": PRESETS[currentPresetKey].name,
        "Total Point Charges": charges.length,
        "Probe Coordinates": `(${((probeX - logicalW * 0.5) * METERS_PER_PX).toFixed(3)} m, ${(-(probeY - logicalH * 0.5) * METERS_PER_PX).toFixed(3)} m)`,
        "Potential V at Probe": `${V.toFixed(2)} Volts`,
        "Electric Field |E| at Probe": `${eTotal.toFixed(2)} V/m`,
        "Coulomb Constant ke": "8.988 × 10⁹ N·m²/C²"
      },
      headers: ["Grid X (m)", "Grid Y (m)", "Potential V (Volts)", "Ex (V/m)", "Ey (V/m)", "|E| Field (V/m)"],
      dataRows: [-0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3].map(xM => {
        const px = logicalW * 0.5 + xM / METERS_PER_PX;
        const py = probeY;
        const f = calculateFieldAt(px, py);
        return [
          xM.toFixed(2),
          (-(py - logicalH * 0.5) * METERS_PER_PX).toFixed(2),
          f.V.toFixed(2),
          f.Ex.toFixed(2),
          f.Ey.toFixed(2),
          f.eTotal.toFixed(2)
        ];
      })
    });
    SoundFX.success();
  });

  // Standardized Hotkey: 'e' or 'E' triggers CSV telemetry export
  const handleKeyDown = (e) => {
    if ((e.key === "e" || e.key === "E") && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      btnExport.click();
    }
  };
  window.addEventListener("keydown", handleKeyDown);

  // Start Animation Loop
  loadPreset(currentPresetKey);
  updateHUD();
  animId = requestAnimationFrame(renderElectroCanvas);

  return function cleanupElectrostaticsLab() {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("resize", setupHiDPICanvas);
    window.removeEventListener("keydown", handleKeyDown);
  };
}
