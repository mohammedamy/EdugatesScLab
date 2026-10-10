// Edugates-ClipSAT Science Labs - Analytical Chemistry: Acid-Base Titration & pH Metrology
// High-Fidelity Laboratory Simulation: 4K Analytical Workbench, Photorealistic Glassware,
// Dynamic Surface-Tension Drops, Vortex Physics, Real-Time Derivative Metrology, and Dual Indicators.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

let _currentTitrationCleanup = null;

export function cleanupTitrationLab() {
  if (typeof _currentTitrationCleanup === "function") {
    try { _currentTitrationCleanup(); } catch (e) {}
    _currentTitrationCleanup = null;
  }
}

export function initTitrationLab(containerId) {
  cleanupTitrationLab();
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="lab-container">
      <!-- Mode & Visual Header Toolbar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding: 10px 18px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #06b6d4; box-shadow: 0 0 10px #06b6d4;"></span>
            Analytical Titration Workstation
          </span>
          <span class="badge" style="background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.3); color: #38bdf8; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            Class-A Volumetric Metrology (±0.03 mL)
          </span>
          <span class="badge" style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            Interactive Valve: Click/Drag Glass Stopcock
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <!-- View Switcher -->
          <div class="lab-view-switcher" style="display: flex; border-radius: 8px; padding: 3px;">
            <button id="view-mode-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Interactive Simulation
            </button>
            <button id="view-mode-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Lab Bench
            </button>
          </div>

          <!-- Derivative Curve Toggle -->
          <label class="lab-checkbox-label" style="display: flex; align-items: center; gap: 6px; font-size: 0.78rem; cursor: pointer; user-select: none; margin-left: 8px;">
            <input type="checkbox" id="chk-derivative" style="accent-color: #ec4899; width: 15px; height: 15px;">
            <span>Show dpH/dV Derivative Peak</span>
          </label>
        </div>
      </div>

      <!-- Main Visual Workstation: Apparatus & Real-Time Titration Curve -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="titration-layout">
        <!-- Left: Apparatus Bench Canvas / Photo Viewport -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(6, 182, 212, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); overflow: hidden; height: 530px;">
          <!-- Interactive HTML5 Canvas -->
          <canvas id="titration-apparatus-canvas" width="560" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
          <div id="titration-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <picture>
              <source srcset="assets/labs/titration_bench.webp" type="image/webp">
              <img src="assets/labs/titration_bench.jpg" decoding="async" loading="lazy" alt="4K Analytical Chemistry Laboratory Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            </picture>
            
            <!-- Live Analytical Telemetry Callout on Photo -->
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(14px); border: 1px solid rgba(6, 182, 212, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Stuart Digital Hotplate</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.95rem;">STIR 420 RPM • ATC ON</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Class-A Borosilicate Burette</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.95rem;">0.05 mL Droplet Calibrated</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Colorimetric Indicator</div>
                <div style="color: #ec4899; font-weight: 700; font-family: var(--font-mono); font-size: 0.95rem;">Phenolphthalein (Pink Endpt)</div>
              </div>
            </div>
          </div>

          <!-- Top HUD: Status Badge & Digital pH Meter Unified to Prevent Overlap -->
          <div class="sim-top-hud-bar" style="position: absolute; top: 12px; left: 14px; right: 14px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; pointer-events: none; z-index: 10;">
            <div class="sim-hud-badges" style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px; pointer-events: auto; max-width: 58%; min-width: 0;">
              <span class="badge" style="background: rgba(15, 23, 42, 0.94); border: 1px solid rgba(6, 182, 212, 0.4); padding: 5px 12px; border-radius: 9999px; font-family: var(--font-mono); font-size: 0.8rem; color: #38bdf8; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 14px rgba(0,0,0,0.5); white-space: nowrap;">
                <span id="titr-status-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #06b6d4; display: inline-block;"></span>
                <span id="titr-status">Burette Charged (0.100 M NaOH)</span>
              </span>
            </div>

            <!-- Digital Benchtop pH Meter Display -->
            <div style="background: rgba(10, 15, 30, 0.95); border: 2px solid #334155; border-radius: 10px; padding: 8px 14px; box-shadow: inset 0 2px 6px rgba(0,0,0,0.8), 0 8px 25px rgba(0,0,0,0.7); backdrop-filter: blur(8px); pointer-events: auto; flex-shrink: 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.65rem; color: #94a3b8; font-family: var(--font-mono); margin-bottom: 2px; gap: 8px;">
                <span>METTLER TOLEDO SEVENCOMPACT</span>
                <span style="color: #10b981; font-weight: 700;">ATC 25.0°C</span>
              </div>
              <div style="font-family: var(--font-mono); font-size: 1.6rem; font-weight: 800; color: #34d399; text-shadow: 0 0 12px rgba(52, 211, 153, 0.45); line-height: 1;" id="disp-digital-ph">
                1.00
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: #cbd5e1; font-family: var(--font-mono); margin-top: 4px; gap: 10px;">
                <span>V_disp: <strong id="disp-digital-vol" style="color: #38bdf8;">0.00 mL</strong></span>
                <span id="disp-ph-state" style="color: #f59e0b; font-weight: 600;">Strong Acid</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Real-Time Analytical Titration Curve & Derivative -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(56, 189, 248, 0.25); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: #070a12;">
            <canvas id="titration-curve-canvas" width="520" height="340" style="height: 340px; width: 100%; display: block;"></canvas>

            <!-- Curve Telemetry Legend -->
            <div style="position: absolute; top: 12px; left: 16px; font-family: var(--font-mono); font-size: 0.76rem; background: rgba(15, 23, 42, 0.9); padding: 6px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); display: flex; gap: 12px; z-index: 5;">
              <span style="color: #38bdf8; display: flex; align-items: center; gap: 4px;">
                <span style="display: inline-block; width: 10px; height: 3px; background: #38bdf8;"></span> pH Curve
              </span>
              <span id="legend-deriv" style="display: none; color: #ec4899; align-items: center; gap: 4px;">
                <span style="display: inline-block; width: 10px; height: 2px; background: #ec4899;"></span> dpH/dV Derivative
              </span>
              <span style="color: #f59e0b; display: flex; align-items: center; gap: 4px;">
                <span style="display: inline-block; width: 10px; height: 2px; border-top: 2px dashed #f59e0b;"></span> Equiv (25.0 mL)
              </span>
            </div>
          </div>

          <!-- Analytical Metrology & Stoichiometry Breakdown -->
          <div class="sim-telemetry-card" style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px 20px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.4);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.78rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em;">
                Analytical Equivalence Metrology
              </span>
              <span id="neutral-badge" style="font-size: 0.75rem; font-weight: 700; padding: 2px 8px; border-radius: 9999px; background: rgba(56, 189, 248, 0.15); color: #38bdf8;">
                Pre-Equivalence Zone
              </span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.88rem;">
              <div>
                <span style="color: var(--text-muted); font-size: 0.8rem;">Acid Solution Sample:</span>
                <div style="color: var(--text-main); font-weight: 700;" id="anal-acid-text">25.00 mL of 0.100 M HCl</div>
              </div>
              <div>
                <span style="color: var(--text-muted); font-size: 0.8rem;">Stoichiometric Target:</span>
                <div style="color: #10b981; font-weight: 700;" id="anal-target-text">25.00 mL NaOH (pH 7.00)</div>
              </div>
            </div>

            <!-- Mathematical Formulation & Derivative Pill -->
            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 8px;">
              <div class="sim-sub-card" style="border-radius: 8px; padding: 8px 12px; font-size: 0.82rem; display: flex; justify-content: space-between; align-items: center;">
                <span>Equivalents:</span>
                <span style="color: #38bdf8;">${renderLatex("M_A V_A = M_B V_B")}</span>
              </div>
              <div class="sim-sub-card" style="border-radius: 8px; padding: 8px 12px; font-size: 0.82rem; display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #ec4899; font-weight: 600;">dpH/dV:</span>
                <span id="anal-deriv-text" style="color: #ec4899; font-family: var(--font-mono); font-weight: 700;">0.00 pH/mL</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Controls Panel & Real Laboratory Actions -->
      <div class="lab-controls-panel" style="margin-top: 18px;">
        <!-- Acid Analyte Selector -->
        <div class="control-group">
          <label class="control-label">
            <span>Analyte Acid Solution in Flask</span>
          </label>
          <select id="select-acid-type" class="select-input">
            <option value="HCl" selected>Strong Acid: 0.100 M HCl (Equiv pH 7.00)</option>
            <option value="CH3COOH">Weak Acid: 0.100 M CH₃COOH (Ka=1.8×10⁻⁵, Equiv pH 8.72)</option>
          </select>
        </div>

        <!-- Chemical Indicator Selector -->
        <div class="control-group">
          <label class="control-label">
            <span>Colorimetric pH Indicator</span>
          </label>
          <select id="select-indicator" class="select-input">
            <option value="phenolphthalein" selected>Phenolphthalein (Clear → Vibrant Magenta, pH 8.2–10.0)</option>
            <option value="bromothymol_blue">Bromothymol Blue (Yellow → Green → Royal Blue, pH 6.0–7.6)</option>
            <option value="methyl_orange">Methyl Orange (Red → Orange → Yellow, pH 3.1–4.4)</option>
          </select>
        </div>

        <!-- Magnetic Stirrer Speed -->
        <div class="control-group">
          <label class="control-label">
            <span>Magnetic Stirrer Velocity</span>
            <span class="control-val" id="disp-stirrer-rpm">450 RPM</span>
          </label>
          <input type="range" id="input-stirrer" class="custom-slider" min="0" max="900" value="450" step="50">
        </div>

        <!-- Burette Dispensing Actions -->
        <div class="lab-action-buttons">
          <button class="btn btn-primary" id="btn-add-drop" style="box-shadow: 0 0 15px rgba(6, 182, 212, 0.4);">
            💧 Calibrated Drop (+0.05 mL)
          </button>

          <button class="btn btn-secondary" id="btn-titr-slow">
            ▶ Continuous Slow (0.2 mL/s)
          </button>

          <button class="btn btn-secondary" id="btn-titr-fast">
            ⏩ Fast Stream (1.5 mL/s)
          </button>

          <button class="btn btn-secondary" id="btn-titr-stop" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.4);">
            ⏹ Stop Valve
          </button>

          <button class="btn btn-secondary" id="btn-titr-auto" style="border-color: rgba(16, 185, 129, 0.4); color: #34d399;">
            🎯 Auto-Titrate to Equivalence
          </button>

          <button class="btn btn-secondary" id="btn-titr-reset" style="margin-left: auto;">
            ↺ Reset Experiment
          </button>
        </div>
      </div>

      <!-- Telemetry Suite & Multi-Trial Bar -->
      <div class="lab-telemetry-suite-bar">
        <div class="lab-trials-badge-group" id="titr-trials-badge-group">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">Multi-Trial Titrations:</span>
          <span class="lab-trial-pill trial-1" id="titr-pill-trial-1" style="opacity: 0.5;">Trial 1 (Cyan)</span>
          <span class="lab-trial-pill trial-2" id="titr-pill-trial-2" style="opacity: 0.5;">Trial 2 (Amber)</span>
          <span class="lab-trial-pill trial-3" id="titr-pill-trial-3" style="opacity: 0.5;">Trial 3 (Emerald)</span>
        </div>

        <div class="lab-export-buttons-group">
          <button class="btn btn-secondary" id="btn-record-titr-trial" style="padding: 6px 12px; font-size: 0.8rem; gap: 6px; border-color: rgba(6,182,212,0.4); color: #06b6d4;">
            <span>📸 Log Current Trial</span>
          </button>
          <button class="btn btn-secondary" id="btn-export-titr-csv" style="padding: 6px 12px; font-size: 0.8rem; gap: 6px;">
            <span>📥 Export CSV Data</span>
          </button>
          <button class="btn btn-primary" id="btn-open-titr-report" style="padding: 6px 14px; font-size: 0.8rem; gap: 6px; background: linear-gradient(135deg, #0891b2, #0284c7); border: none;">
            <span>📑 Generate Lab Report</span>
          </button>
        </div>
      </div>

      <!-- Mount for Post-Lab Checkpoint Assessment -->
      <div id="titr-checkpoint-container"></div>
    </div>
  `;

  const appCanvas = document.getElementById("titration-apparatus-canvas");
  const appCtx = appCanvas.getContext("2d");
  const curveCanvas = document.getElementById("titration-curve-canvas");
  const curveCtx = curveCanvas.getContext("2d");
  const photoOverlay = document.getElementById("titration-photo-overlay");

  // State
  let acidType = "HCl";
  let indicator = "phenolphthalein";
  let vTitrant = 0.0; // mL
  let flowRate = 0; // mL/sec (0 = closed)
  let stirrerRpm = 450;
  let stirrerAngle = 0;
  let dataPoints = [];
  let drops = [];
  let bubbles = [];
  let colorPlumes = [];
  let reachedEquivalenceSoundPlayed = false;
  let isHoveringStopcock = false;
  let isDraggingStopcock = false;
  let stopcockDragStartY = 0;
  let stopcockDragStartFlow = 0;
  let animId = null;
  let viewMode = "sim"; // "sim" or "photo"
  let showDerivative = false;

  // Sound synthesis via pooled audio engine
  function playDropSound() {
    try {
      SoundFX.playDroplet();
    } catch(e) {}
  }

  // Precise pH Calculation
  function calculatePH(vAdded) {
    const vAcid = 25.0; // mL
    const cAcid = 0.100; // M
    const cBase = 0.100; // M
    const totalV = (vAcid + vAdded) / 1000; // L

    if (acidType === "HCl") {
      const molAcid = (vAcid / 1000) * cAcid;
      const molBase = (vAdded / 1000) * cBase;

      if (vAdded < 25.0) {
        const remainingAcid = molAcid - molBase;
        const hConc = remainingAcid / totalV;
        return Math.max(1.0, -Math.log10(hConc));
      } else if (Math.abs(vAdded - 25.0) < 0.001) {
        return 7.00;
      } else {
        const excessBase = molBase - molAcid;
        const ohConc = excessBase / totalV;
        const pOH = -Math.log10(ohConc);
        return Math.min(13.3, 14.0 - pOH);
      }
    } else {
      // Acetic Acid (Ka = 1.8e-5, pKa = 4.74)
      const Ka = 1.8e-5;
      const pKa = 4.74;
      const molAcidInitial = (vAcid / 1000) * cAcid;
      const molBase = (vAdded / 1000) * cBase;

      if (vAdded <= 0.01) {
        const hConc = Math.sqrt(Ka * cAcid);
        return -Math.log10(hConc);
      } else if (vAdded < 25.0) {
        const molAcetate = molBase;
        const molHA = molAcidInitial - molBase;
        return Math.max(2.8, Math.min(7.5, pKa + Math.log10(molAcetate / molHA)));
      } else if (Math.abs(vAdded - 25.0) < 0.001) {
        const Kb = 1e-14 / Ka;
        const concAcetate = (molAcidInitial) / totalV;
        const ohConc = Math.sqrt(Kb * concAcetate);
        const pOH = -Math.log10(ohConc);
        return 14.0 - pOH; // ~8.72
      } else {
        const excessBase = molBase - molAcidInitial;
        const ohConc = excessBase / totalV;
        const pOH = -Math.log10(ohConc);
        return Math.min(13.3, 14.0 - pOH);
      }
    }
  }

  // Dynamic Colorimetric Solution Appearance
  function getFlaskColor(ph) {
    if (indicator === "phenolphthalein") {
      if (ph < 8.2) return "rgba(240, 249, 255, 0.12)"; // Crystal clear
      if (ph > 10.0) return "rgba(236, 72, 153, 0.85)"; // Deep magenta
      const f = (ph - 8.2) / 1.8;
      return `rgba(236, 72, 153, ${0.12 + f * 0.73})`;
    } else if (indicator === "bromothymol_blue") {
      if (ph < 6.0) return "rgba(234, 179, 8, 0.75)"; // Bright yellow
      if (ph > 7.6) return "rgba(37, 99, 235, 0.85)"; // Deep royal blue
      const f = (ph - 6.0) / 1.6;
      const r = Math.round(234 * (1 - f) + 37 * f);
      const g = Math.round(179 * (1 - f) + 99 * f);
      const b = Math.round(8 * (1 - f) + 235 * f);
      return `rgba(${r}, ${g}, ${b}, 0.8)`;
    } else {
      if (ph < 3.1) return "rgba(239, 68, 68, 0.85)"; // Red
      if (ph > 4.4) return "rgba(234, 179, 8, 0.85)"; // Yellow
      const f = (ph - 3.1) / 1.3;
      return `rgba(249, 115, 22, ${0.75 + f * 0.1})`; // Orange
    }
  }

  // Initialize Stirrer Bubbles
  for (let i = 0; i < 20; i++) {
    bubbles.push({
      x: 0,
      y: 0,
      radius: 1 + Math.random() * 2.5,
      speed: 0.5 + Math.random() * 1.5,
      angle: Math.random() * Math.PI * 2
    });
  }

  // Draw Apparatus Bench
  function drawApparatus(dtFactor = 0) {
    if (!container || !container.isConnected) return;
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
    const w = appCanvas.width / dpr;
    const h = appCanvas.height / dpr;

    appCtx.save();
    appCtx.scale(dpr, dpr);
    appCtx.clearRect(0, 0, w, h);

    // 1. Bench Wall & Depth Background
    const wallGrad = appCtx.createLinearGradient(0, 0, 0, h);
    wallGrad.addColorStop(0, "#080e1a");
    wallGrad.addColorStop(0.65, "#0f172a");
    wallGrad.addColorStop(1, "#182234");
    appCtx.fillStyle = wallGrad;
    appCtx.fillRect(0, 0, w, h);

    // Ceramic Bench Tile grid line
    appCtx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    appCtx.lineWidth = 1;
    appCtx.beginPath();
    appCtx.moveTo(0, h - 55);
    appCtx.lineTo(w, h - 55);
    appCtx.stroke();

    // 2. Heavy Laboratory Cast-Iron Stand
    const standX = 110;
    // Heavy Base Plate with Beveled Chamfer
    const baseGrad = appCtx.createLinearGradient(standX - 60, h - 35, standX + 160, h);
    baseGrad.addColorStop(0, "#475569");
    baseGrad.addColorStop(0.5, "#1e293b");
    baseGrad.addColorStop(1, "#0f172a");
    appCtx.fillStyle = baseGrad;
    appCtx.fillRect(standX - 45, h - 35, 210, 24);
    appCtx.strokeStyle = "rgba(56, 189, 248, 0.3)";
    appCtx.lineWidth = 1.5;
    appCtx.strokeRect(standX - 45, h - 35, 210, 24);

    // Stainless Steel Vertical Support Rod
    const rodGrad = appCtx.createLinearGradient(standX, 0, standX + 14, 0);
    rodGrad.addColorStop(0, "#94a3b8");
    rodGrad.addColorStop(0.4, "#ffffff");
    rodGrad.addColorStop(0.7, "#64748b");
    rodGrad.addColorStop(1, "#334155");
    appCtx.fillStyle = rodGrad;
    appCtx.fillRect(standX, 30, 14, h - 65);

    // 3. Metallic Burette Clamp Arms with Thumbscrews
    function drawClamp(clampY) {
      appCtx.fillStyle = "#334155";
      appCtx.fillRect(standX + 14, clampY - 5, 80, 10);
      appCtx.fillStyle = "#64748b";
      appCtx.fillRect(standX + 94, clampY - 14, 12, 28);
      appCtx.fillStyle = "#f59e0b";
      appCtx.beginPath();
      appCtx.arc(standX + 7, clampY, 6, 0, Math.PI * 2);
      appCtx.fill();
    }
    drawClamp(85);
    drawClamp(240);

    // 4. Photorealistic 50.00 mL Borosilicate Glass Burette
    const buretX = standX + 100;
    const buretTop = 35;
    const buretH = 240;
    const buretW = 22;

    // Glass Tube Shadow
    appCtx.fillStyle = "rgba(0,0,0,0.3)";
    appCtx.fillRect(buretX - buretW/2 + 4, buretTop + 6, buretW, buretH);

    // Glass Tube Background
    const glassGrad = appCtx.createLinearGradient(buretX - buretW/2, 0, buretX + buretW/2, 0);
    glassGrad.addColorStop(0, "rgba(255, 255, 255, 0.12)");
    glassGrad.addColorStop(0.3, "rgba(255, 255, 255, 0.03)");
    glassGrad.addColorStop(0.7, "rgba(255, 255, 255, 0.05)");
    glassGrad.addColorStop(1, "rgba(255, 255, 255, 0.18)");
    appCtx.fillStyle = glassGrad;
    appCtx.fillRect(buretX - buretW/2, buretTop, buretW, buretH);

    // Liquid in Burette (NaOH Titrant Solution)
    const liquidFillFrac = Math.max(0, 1 - (vTitrant / 50.0));
    const liquidTopY = buretTop + (1 - liquidFillFrac) * buretH;
    const liquidHeight = liquidFillFrac * buretH;

    if (liquidHeight > 0) {
      const buretLiqGrad = appCtx.createLinearGradient(buretX - buretW/2, 0, buretX + buretW/2, 0);
      buretLiqGrad.addColorStop(0, "rgba(56, 189, 248, 0.45)");
      buretLiqGrad.addColorStop(0.5, "rgba(14, 165, 233, 0.25)");
      buretLiqGrad.addColorStop(1, "rgba(56, 189, 248, 0.55)");
      appCtx.fillStyle = buretLiqGrad;
      appCtx.fillRect(buretX - buretW/2, liquidTopY, buretW, liquidHeight);

      // Concave Meniscus Curve at Top of Liquid Column
      appCtx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      appCtx.lineWidth = 1.5;
      appCtx.beginPath();
      appCtx.ellipse(buretX, liquidTopY, buretW/2, 3.5, 0, 0, Math.PI);
      appCtx.stroke();
    }

    // Glass Tube Borders
    appCtx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    appCtx.lineWidth = 1.5;
    appCtx.strokeRect(buretX - buretW/2, buretTop, buretW, buretH);

    // Volumetric Graduations (0 to 50 mL in 5 mL steps)
    appCtx.fillStyle = "rgba(255, 255, 255, 0.75)";
    appCtx.font = "8px JetBrains Mono";
    for (let ml = 0; ml <= 50; ml += 5) {
      const markY = buretTop + (ml / 50.0) * buretH;
      appCtx.beginPath();
      appCtx.moveTo(buretX - buretW/2, markY);
      appCtx.lineTo(buretX - buretW/2 + (ml % 10 === 0 ? 8 : 4), markY);
      appCtx.stroke();

      if (ml % 10 === 0 && ml > 0 && ml < 50) {
        appCtx.fillText(`${ml}`, buretX - buretW/2 - 16, markY + 3);
      }
    }

    // 5. Precision Stopcock Valve & Tip
    const stopcockY = buretTop + buretH;
    appCtx.fillStyle = "#64748b";
    appCtx.fillRect(buretX - 4, stopcockY, 8, 16);

    // Interactive Hover/Active Focus Halo around Stopcock Valve
    if (isHoveringStopcock || isDraggingStopcock) {
      appCtx.save();
      appCtx.strokeStyle = "#38bdf8";
      appCtx.lineWidth = 2;
      appCtx.shadowColor = "#06b6d4";
      appCtx.shadowBlur = 10;
      appCtx.beginPath();
      appCtx.arc(buretX, stopcockY + 8, 20, 0, Math.PI * 2);
      appCtx.stroke();

      // Holographic Valve Prompt Tooltip
      appCtx.fillStyle = "rgba(15, 23, 42, 0.94)";
      appCtx.strokeStyle = "rgba(56, 189, 248, 0.5)";
      appCtx.lineWidth = 1;
      appCtx.beginPath();
      appCtx.roundRect(buretX + 26, stopcockY - 6, 134, 26, 6);
      appCtx.fill();
      appCtx.stroke();
      appCtx.fillStyle = "#38bdf8";
      appCtx.font = "bold 9px JetBrains Mono";
      appCtx.fillText(isDraggingStopcock ? "Drag: Adjust Flow" : "Click / Drag Valve", buretX + 32, stopcockY + 11);
      appCtx.restore();
    }

    // PTFE Valve handle with true physical rotation angle
    // flowRate 0 = 90 deg (perpendicular, closed)
    // flowRate 1.5 = 0 deg (parallel, open)
    const valveAngle = (flowRate === 0) ? (Math.PI / 2) : ((1 - Math.min(1, flowRate / 1.5)) * (Math.PI / 2));
    appCtx.save();
    appCtx.translate(buretX, stopcockY + 8);
    appCtx.rotate(valveAngle);

    // Handle Shadow
    appCtx.fillStyle = "rgba(0,0,0,0.4)";
    appCtx.fillRect(-14, -2, 28, 10);

    // PTFE Teflon Handle Body
    const valveGrad = appCtx.createLinearGradient(-14, 0, 14, 0);
    if (flowRate === 0) {
      valveGrad.addColorStop(0, "#ef4444");
      valveGrad.addColorStop(0.5, "#f87171");
      valveGrad.addColorStop(1, "#dc2626");
    } else if (flowRate < 0.8) {
      valveGrad.addColorStop(0, "#10b981");
      valveGrad.addColorStop(0.5, "#34d399");
      valveGrad.addColorStop(1, "#059669");
    } else {
      valveGrad.addColorStop(0, "#f59e0b");
      valveGrad.addColorStop(0.5, "#fbbf24");
      valveGrad.addColorStop(1, "#d97706");
    }
    appCtx.fillStyle = valveGrad;
    appCtx.beginPath();
    appCtx.roundRect(-14, -5, 28, 10, 4);
    appCtx.fill();

    // Valve Center Retaining Ring
    appCtx.fillStyle = "#ffffff";
    appCtx.beginPath();
    appCtx.arc(0, 0, 3, 0, Math.PI * 2);
    appCtx.fill();
    appCtx.restore();

    // Fine Delivery Tip
    appCtx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    appCtx.lineWidth = 1.5;
    appCtx.beginPath();
    appCtx.moveTo(buretX - 4, stopcockY + 16);
    appCtx.lineTo(buretX - 1.5, stopcockY + 38);
    appCtx.lineTo(buretX + 1.5, stopcockY + 38);
    appCtx.lineTo(buretX + 4, stopcockY + 16);
    appCtx.stroke();

    // Surface-Tension Forming Droplet or Continuous Laminar Stream
    if (flowRate >= 0.5) {
      // Continuous Laminar Fluid Stream
      const streamTop = stopcockY + 38;
      const streamBottom = h - 68 - 65; // flask fluid top surface
      const streamW = Math.min(3.5, 1.5 + flowRate * 1.2);
      
      appCtx.save();
      const streamGrad = appCtx.createLinearGradient(buretX - streamW, 0, buretX + streamW, 0);
      streamGrad.addColorStop(0, "rgba(56, 189, 248, 0.85)");
      streamGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.95)");
      streamGrad.addColorStop(1, "rgba(56, 189, 248, 0.85)");
      appCtx.fillStyle = streamGrad;
      appCtx.shadowColor = "#38bdf8";
      appCtx.shadowBlur = 6;
      appCtx.beginPath();
      appCtx.moveTo(buretX - streamW/2, streamTop);
      appCtx.lineTo(buretX + streamW/2, streamTop);
      appCtx.lineTo(buretX + streamW/2 + 0.4, streamBottom);
      appCtx.lineTo(buretX - streamW/2 - 0.4, streamBottom);
      appCtx.closePath();
      appCtx.fill();
      appCtx.restore();

      // Fluid impact ripple rings at solution surface
      appCtx.strokeStyle = "rgba(255, 255, 255, 0.75)";
      appCtx.lineWidth = 1;
      appCtx.beginPath();
      appCtx.ellipse(buretX, streamBottom + 2, 7 + Math.sin(Date.now() * 0.02) * 2, 2.5, 0, 0, Math.PI * 2);
      appCtx.stroke();
    } else if (flowRate > 0 || drops.length === 0) {
      appCtx.fillStyle = "rgba(56, 189, 248, 0.75)";
      appCtx.beginPath();
      appCtx.arc(buretX, stopcockY + 39, 2.5, 0, Math.PI * 2);
      appCtx.fill();
    }

    // 6. Stuart Laboratory Hotplate Magnetic Stirrer
    const stirrerW = 160;
    const stirrerH = 34;
    const stirrerX = buretX;
    const stirrerY = h - 68;

    // Hotplate Ceramic Top Plate
    appCtx.fillStyle = "#f8fafc";
    appCtx.fillRect(stirrerX - stirrerW/2, stirrerY, stirrerW, 8);
    appCtx.fillStyle = "#e2e8f0";
    appCtx.fillRect(stirrerX - stirrerW/2, stirrerY + 8, stirrerW, 2);

    // Hotplate Heavy Aluminum Base Housing
    const stirGrad = appCtx.createLinearGradient(0, stirrerY + 10, 0, stirrerY + stirrerH);
    stirGrad.addColorStop(0, "#334155");
    stirGrad.addColorStop(1, "#0f172a");
    appCtx.fillStyle = stirGrad;
    appCtx.fillRect(stirrerX - stirrerW/2, stirrerY + 10, stirrerW, stirrerH - 10);
    appCtx.strokeStyle = "#475569";
    appCtx.strokeRect(stirrerX - stirrerW/2, stirrerY + 10, stirrerW, stirrerH - 10);

    // Digital LED Display on Stirrer Housing
    appCtx.fillStyle = "#020617";
    appCtx.fillRect(stirrerX - 55, stirrerY + 14, 52, 16);
    appCtx.fillStyle = stirrerRpm > 0 ? "#38bdf8" : "#64748b";
    appCtx.font = "bold 9px JetBrains Mono";
    appCtx.fillText(`${stirrerRpm} RPM`, stirrerX - 51, stirrerY + 26);

    // Rotary Control Dial
    appCtx.fillStyle = "#94a3b8";
    appCtx.beginPath();
    appCtx.arc(stirrerX + 38, stirrerY + 22, 7, 0, Math.PI * 2);
    appCtx.fill();

    // 7. Borosilicate Erlenmeyer Flask with Animated Swirl Vortex
    const flaskX = buretX;
    const flaskY = stirrerY;
    const neckTop = stopcockY + 54;
    const neckW = 26;
    const baseW = 110;
    const fluidH = 65;

    // Flask Analyte Liquid Fill
    const currentPH = calculatePH(vTitrant);
    const flaskFillColor = getFlaskColor(currentPH);

    appCtx.save();
    // Clip to Erlenmeyer Flask Shape
    appCtx.beginPath();
    appCtx.moveTo(flaskX - neckW/2, neckTop);
    appCtx.lineTo(flaskX + neckW/2, neckTop);
    appCtx.lineTo(flaskX + neckW/2, neckTop + 35);
    appCtx.lineTo(flaskX + baseW/2, flaskY);
    appCtx.lineTo(flaskX - baseW/2, flaskY);
    appCtx.lineTo(flaskX - neckW/2, neckTop + 35);
    appCtx.closePath();
    appCtx.clip();

    // Draw Liquid Body
    const liqGrad = appCtx.createLinearGradient(0, flaskY - fluidH, 0, flaskY);
    liqGrad.addColorStop(0, flaskFillColor);
    liqGrad.addColorStop(1, flaskFillColor);
    appCtx.fillStyle = liqGrad;
    appCtx.fillRect(flaskX - baseW, flaskY - fluidH, baseW * 2, fluidH);

    // Dynamic Swirling Indicator Diffusion Plumes (Localized high-pH splash plumes)
    if (colorPlumes.length > 0) {
      for (let pIdx = colorPlumes.length - 1; pIdx >= 0; pIdx--) {
        const p = colorPlumes[pIdx];
        if (dtFactor > 0) {
          p.radius += 0.45 * dtFactor;
          p.opacity -= 0.02 * dtFactor;
          if (stirrerRpm > 0) {
            p.angle += (stirrerRpm / 600) * 0.14 * dtFactor;
            p.x = flaskX + Math.cos(p.angle) * (p.radius * 1.6);
            p.y += 0.25 * dtFactor;
          }
        }
        if (p.opacity <= 0.02 || p.radius >= p.maxRadius) {
          colorPlumes.splice(pIdx, 1);
          continue;
        }
        appCtx.fillStyle = `${p.color}${Math.max(0, p.opacity).toFixed(3)})`;
        appCtx.beginPath();
        appCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        appCtx.fill();
      }
    }

    // Dynamic Swirling Vortex Cone (Physics when Stirrer > 0)
    if (stirrerRpm > 0) {
      const vortexDepth = (stirrerRpm / 900) * 22;
      appCtx.fillStyle = "rgba(255, 255, 255, 0.15)";
      appCtx.beginPath();
      appCtx.ellipse(flaskX, flaskY - fluidH + 4, 30, 8, 0, 0, Math.PI * 2);
      appCtx.fill();

      // Vortex Core Dip
      appCtx.fillStyle = "rgba(15, 23, 42, 0.4)";
      appCtx.beginPath();
      appCtx.moveTo(flaskX - 16, flaskY - fluidH);
      appCtx.quadraticCurveTo(flaskX, flaskY - fluidH + vortexDepth, flaskX + 16, flaskY - fluidH);
      appCtx.closePath();
      appCtx.fill();

      // Aeration Micro-bubbles swirling
      appCtx.fillStyle = "rgba(255, 255, 255, 0.65)";
      bubbles.forEach(b => {
        b.angle += (stirrerRpm / 600) * 0.1;
        const bRad = 10 + Math.sin(b.angle * 2) * 18;
        const bx = flaskX + Math.cos(b.angle) * bRad;
        const by = (flaskY - 10) - (b.speed * 15) % (fluidH - 12);
        appCtx.beginPath();
        appCtx.arc(bx, by, b.radius, 0, Math.PI * 2);
        appCtx.fill();
      });
    }

    // Magnetic Stir Bar at Bottom of Flask
    appCtx.save();
    appCtx.translate(flaskX, flaskY - 6);
    if (stirrerRpm > 0) {
      stirrerAngle += (stirrerRpm / 60) * 0.25;
      appCtx.rotate(Math.sin(stirrerAngle) * 0.35);
    }
    // PTFE Teflon coated white capsule
    appCtx.fillStyle = "#ffffff";
    appCtx.shadowColor = "rgba(0,0,0,0.5)";
    appCtx.shadowBlur = 4;
    appCtx.beginPath();
    appCtx.roundRect(-16, -3, 32, 6, 3);
    appCtx.fill();
    appCtx.shadowBlur = 0;
    appCtx.restore();

    appCtx.restore(); // Restore clip

    // Draw Glassware Outline & Specular Highlights
    appCtx.beginPath();
    appCtx.moveTo(flaskX - neckW/2, neckTop);
    appCtx.lineTo(flaskX + neckW/2, neckTop);
    appCtx.lineTo(flaskX + neckW/2, neckTop + 35);
    appCtx.lineTo(flaskX + baseW/2, flaskY);
    appCtx.lineTo(flaskX - baseW/2, flaskY);
    appCtx.lineTo(flaskX - neckW/2, neckTop + 35);
    appCtx.closePath();

    appCtx.fillStyle = "rgba(255, 255, 255, 0.04)";
    appCtx.fill();
    appCtx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    appCtx.lineWidth = 2;
    appCtx.stroke();

    // Flask Lip Ring
    appCtx.strokeRect(flaskX - neckW/2 - 2, neckTop - 3, neckW + 4, 3);

    // Specular Highlight Streak on Glass Cone
    appCtx.strokeStyle = "rgba(255, 255, 255, 0.45)";
    appCtx.lineWidth = 1.5;
    appCtx.beginPath();
    appCtx.moveTo(flaskX - neckW/2 + 3, neckTop + 38);
    appCtx.lineTo(flaskX - baseW/2 + 10, flaskY - 4);
    appCtx.stroke();

    // Flask Volume Graduation Lines
    appCtx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    appCtx.lineWidth = 1;
    appCtx.font = "8px JetBrains Mono";
    [50, 100, 150].forEach((ml, idx) => {
      const lineY = flaskY - 18 - idx * 16;
      appCtx.beginPath();
      appCtx.moveTo(flaskX - 25, lineY);
      appCtx.lineTo(flaskX - 12, lineY);
      appCtx.stroke();
      appCtx.fillText(`${ml}mL`, flaskX - 44, lineY + 3);
    });

    // 8. Digital pH Sensor Probe Dipped in Flask
    const probeX = flaskX + 16;
    appCtx.fillStyle = "#334155";
    appCtx.fillRect(probeX - 3, neckTop - 25, 6, 75);
    // Glass electrode bulb tip
    appCtx.fillStyle = "rgba(56, 189, 248, 0.75)";
    appCtx.beginPath();
    appCtx.arc(probeX, neckTop + 50, 5, 0, Math.PI * 2);
    appCtx.fill();
    // Cable running up to meter
    appCtx.strokeStyle = "#475569";
    appCtx.lineWidth = 2.5;
    appCtx.beginPath();
    appCtx.moveTo(probeX, neckTop - 25);
    appCtx.bezierCurveTo(probeX + 40, neckTop - 60, w - 80, 50, w - 40, 50);
    appCtx.stroke();

    // 9. Falling Drops Simulation (Parabolic falling with teardrop shape)
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      if (dtFactor > 0) {
        d.speed += 0.35 * dtFactor; // Gravity acceleration scaled by dt
        d.y += d.speed * dtFactor;
      }

      // Draw Teardrop
      appCtx.fillStyle = "#38bdf8";
      appCtx.shadowColor = "#38bdf8";
      appCtx.shadowBlur = 6;
      appCtx.beginPath();
      appCtx.moveTo(d.x, d.y - 4);
      appCtx.lineTo(d.x + 2.5, d.y + 2);
      appCtx.arc(d.x, d.y + 2, 2.5, 0, Math.PI);
      appCtx.closePath();
      appCtx.fill();
      appCtx.shadowBlur = 0;

      // Droplet hits liquid surface
      if (d.y >= (flaskY - fluidH)) {
        drops.splice(i, 1);
        playDropSound();

        // Spawn localized alkaline plume that swirls with magnetic stirrer
        colorPlumes.push({
          x: d.x + (Math.random() - 0.5) * 4,
          y: flaskY - fluidH + 4,
          radius: 2.5,
          maxRadius: 16 + Math.random() * 8,
          opacity: 0.85,
          angle: Math.random() * Math.PI * 2,
          color: (indicator === "phenolphthalein") ? "rgba(236, 72, 153," : (indicator === "bromothymol_blue" ? "rgba(37, 99, 235," : "rgba(234, 179, 8,")
        });
      }
    }

    appCtx.restore();
  }

  // Draw Titration Curve Graph & Derivative Peak
  function drawCurve() {
    if (!container || !container.isConnected) return;
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
    const w = curveCanvas.width / dpr;
    const h = curveCanvas.height / dpr;

    curveCtx.save();
    curveCtx.scale(dpr, dpr);
    curveCtx.clearRect(0, 0, w, h);

    // Background
    curveCtx.fillStyle = "#090d16";
    curveCtx.fillRect(0, 0, w, h);

    const padLeft = 45;
    const padRight = 25;
    const padTop = 30;
    const padBottom = 40;
    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    // Grid lines for pH (0 to 14)
    curveCtx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    curveCtx.lineWidth = 1;
    curveCtx.font = "10px JetBrains Mono";
    curveCtx.fillStyle = "rgba(255, 255, 255, 0.4)";

    for (let ph = 0; ph <= 14; ph += 2) {
      const y = padTop + plotH - (ph / 14.0) * plotH;
      curveCtx.beginPath();
      curveCtx.moveTo(padLeft, y);
      curveCtx.lineTo(padLeft + plotW, y);
      curveCtx.stroke();

      curveCtx.fillText(`${ph}`, padLeft - 22, y + 3);
    }

    // Grid lines for Volume NaOH (0 to 50 mL)
    for (let vol = 0; vol <= 50; vol += 10) {
      const x = padLeft + (vol / 50.0) * plotW;
      curveCtx.beginPath();
      curveCtx.moveTo(x, padTop);
      curveCtx.lineTo(x, padTop + plotH);
      curveCtx.stroke();

      curveCtx.fillText(`${vol}`, x - 6, padTop + plotH + 18);
    }

    // Axis Labels
    curveCtx.fillStyle = "#94a3b8";
    curveCtx.font = "bold 10px JetBrains Mono";
    curveCtx.fillText("Added 0.100 M NaOH Volume (mL)", padLeft + plotW / 2 - 90, h - 8);

    curveCtx.save();
    curveCtx.translate(14, padTop + plotH / 2 + 15);
    curveCtx.rotate(-Math.PI / 2);
    curveCtx.fillText("Solution pH", 0, 0);
    curveCtx.restore();

    // Equivalence Point Vertical Guideline (25.0 mL)
    const eqX = padLeft + (25.0 / 50.0) * plotW;
    curveCtx.strokeStyle = "#f59e0b";
    curveCtx.lineWidth = 1.5;
    curveCtx.setLineDash([4, 4]);
    curveCtx.beginPath();
    curveCtx.moveTo(eqX, padTop);
    curveCtx.lineTo(eqX, padTop + plotH);
    curveCtx.stroke();
    curveCtx.setLineDash([]);

    // First Derivative Curve (dpH/dV) if enabled
    if (showDerivative) {
      curveCtx.strokeStyle = "rgba(236, 72, 153, 0.85)";
      curveCtx.lineWidth = 2.5;
      curveCtx.beginPath();

      const deltaV = 0.2;
      let maxDeriv = 20.0;
      let peakV = 25.0;
      let peakDeriv = 0;

      for (let v = 0.5; v <= 49.5; v += 0.2) {
        const ph1 = calculatePH(v - deltaV);
        const ph2 = calculatePH(v + deltaV);
        const deriv = (ph2 - ph1) / (2 * deltaV);
        if (deriv > peakDeriv) {
          peakDeriv = deriv;
          peakV = v;
        }
        const normDeriv = Math.min(1.0, deriv / maxDeriv);

        const x = padLeft + (v / 50.0) * plotW;
        const y = padTop + plotH - (normDeriv * plotH * 0.85);

        if (v === 0.5) curveCtx.moveTo(x, y);
        else curveCtx.lineTo(x, y);
      }
      curveCtx.stroke();

      // Peak Indicator Marker & Holographic Equivalence Inflection Badge
      const peakX = padLeft + (peakV / 50.0) * plotW;
      const peakY = padTop + plotH - (Math.min(1.0, peakDeriv / maxDeriv) * plotH * 0.85);

      curveCtx.save();
      // Glowing Magenta Peak Dot
      curveCtx.fillStyle = "#ec4899";
      curveCtx.shadowColor = "#ec4899";
      curveCtx.shadowBlur = 12;
      curveCtx.beginPath();
      curveCtx.arc(peakX, peakY, 5, 0, Math.PI * 2);
      curveCtx.fill();

      // Golden Target Ring
      curveCtx.strokeStyle = "#f59e0b";
      curveCtx.lineWidth = 1.5;
      curveCtx.beginPath();
      curveCtx.arc(peakX, peakY, 9, 0, Math.PI * 2);
      curveCtx.stroke();

      // Floating Analytical Callout Banner
      curveCtx.fillStyle = "rgba(15, 23, 42, 0.92)";
      curveCtx.strokeStyle = "rgba(236, 72, 153, 0.65)";
      curveCtx.lineWidth = 1;
      curveCtx.shadowColor = "rgba(0,0,0,0.6)";
      curveCtx.shadowBlur = 8;
      curveCtx.beginPath();
      curveCtx.roundRect(peakX - 90, peakY - 32, 180, 22, 6);
      curveCtx.fill();
      curveCtx.stroke();
      curveCtx.shadowBlur = 0;

      curveCtx.fillStyle = "#ec4899";
      curveCtx.font = "bold 9px JetBrains Mono";
      curveCtx.fillText(`🎯 Peak: V_eq=${peakV.toFixed(2)}mL (dpH/dV=${peakDeriv.toFixed(1)})`, peakX - 84, peakY - 18);
      curveCtx.restore();
    }

    // Theoretical Curve Path (Preview Ghost)
    curveCtx.strokeStyle = "rgba(56, 189, 248, 0.25)";
    curveCtx.lineWidth = 1.5;
    curveCtx.beginPath();
    for (let v = 0; v <= 50; v += 0.5) {
      const phVal = calculatePH(v);
      const x = padLeft + (v / 50.0) * plotW;
      const y = padTop + plotH - (phVal / 14.0) * plotH;
      if (v === 0) curveCtx.moveTo(x, y);
      else curveCtx.lineTo(x, y);
    }
    curveCtx.stroke();

    // Actual Dispensed Data Points Path
    if (dataPoints.length > 1) {
      curveCtx.strokeStyle = "#38bdf8";
      curveCtx.lineWidth = 3;
      curveCtx.shadowColor = "#0284c7";
      curveCtx.shadowBlur = 8;
      curveCtx.beginPath();
      dataPoints.forEach((pt, idx) => {
        const x = padLeft + (pt.v / 50.0) * plotW;
        const y = padTop + plotH - (pt.ph / 14.0) * plotH;
        if (idx === 0) curveCtx.moveTo(x, y);
        else curveCtx.lineTo(x, y);
      });
      curveCtx.stroke();
      curveCtx.shadowBlur = 0;

      // Current Point Marker
      const lastPt = dataPoints[dataPoints.length - 1];
      const cx = padLeft + (lastPt.v / 50.0) * plotW;
      const cy = padTop + plotH - (lastPt.ph / 14.0) * plotH;

      curveCtx.fillStyle = "#10b981";
      curveCtx.shadowColor = "#10b981";
      curveCtx.shadowBlur = 10;
      curveCtx.beginPath();
      curveCtx.arc(cx, cy, 6, 0, Math.PI * 2);
      curveCtx.fill();
      curveCtx.shadowBlur = 0;

      curveCtx.fillStyle = "#ffffff";
      curveCtx.font = "bold 10px JetBrains Mono";
      curveCtx.fillText(`(${lastPt.v.toFixed(1)}mL, pH ${lastPt.ph.toFixed(2)})`, cx + 8, cy - 8);
    }

    curveCtx.restore();
  }

  let autoTitrateInterval = null;

  function stopAutoTitrate() {
    if (autoTitrateInterval) {
      clearInterval(autoTitrateInterval);
      autoTitrateInterval = null;
    }
  }

  function updateTelemetry() {
    if (!container || !container.isConnected || !document.getElementById("titration-apparatus-canvas")) {
      stopAutoTitrate();
      return;
    }
    const ph = calculatePH(vTitrant);
    const dispPh = document.getElementById("disp-digital-ph");
    if (dispPh) dispPh.innerText = ph.toFixed(2);
    const dispVol = document.getElementById("disp-digital-vol");
    if (dispVol) dispVol.innerText = `${vTitrant.toFixed(2)} mL`;

    const neutralBadge = document.getElementById("neutral-badge");
    const phState = document.getElementById("disp-ph-state");

    if (!neutralBadge || !phState) {
      stopAutoTitrate();
      return;
    }

    if (vTitrant < 24.5) {
      neutralBadge.innerText = "Pre-Equivalence Zone";
      neutralBadge.style.color = "#38bdf8";
      neutralBadge.style.background = "rgba(56, 189, 248, 0.15)";
      phState.innerText = "Excess Acid";
      phState.style.color = "#38bdf8";
      reachedEquivalenceSoundPlayed = false;
    } else if (Math.abs(vTitrant - 25.0) <= 0.2) {
      neutralBadge.innerText = "🎯 AT EQUIVALENCE POINT";
      neutralBadge.style.color = "#10b981";
      neutralBadge.style.background = "rgba(16, 185, 129, 0.25)";
      phState.innerText = (acidType === "HCl") ? "Neutral (pH 7.00)" : "Equivalence (pH 8.72)";
      phState.style.color = "#10b981";
      if (!reachedEquivalenceSoundPlayed) {
        try { SoundFX.playSuccess(); } catch(e) {}
        reachedEquivalenceSoundPlayed = true;
      }
    } else {
      neutralBadge.innerText = "Post-Equivalence Zone";
      neutralBadge.style.color = "#ec4899";
      neutralBadge.style.background = "rgba(236, 72, 153, 0.15)";
      phState.innerText = "Excess Base";
      phState.style.color = "#ec4899";
    }

    // Live Analytical Derivative Calculation dpH/dV
    const dV = 0.05;
    const dpH = Math.abs(calculatePH(vTitrant + dV) - calculatePH(Math.max(0, vTitrant - dV)));
    const currentDeriv = dpH / (2 * dV);
    const derivText = document.getElementById("anal-deriv-text");
    if (derivText) derivText.innerText = `${currentDeriv.toFixed(2)} pH/mL`;
  }

  function addVolume(amount) {
    if (!container || !container.isConnected || !document.getElementById("titration-apparatus-canvas")) {
      stopAutoTitrate();
      return;
    }
    if (vTitrant >= 50.0) {
      stopAutoTitrate();
      return;
    }
    vTitrant = Math.min(50.0, vTitrant + amount);
    const ph = calculatePH(vTitrant);
    dataPoints.push({ v: vTitrant, ph });

    // Spawn drop particle
    const standX = 110;
    const buretX = standX + 100;
    const stopcockY = 35 + 240;
    drops.push({ x: buretX, y: stopcockY + 38, speed: 2 });

    updateTelemetry();
    drawApparatus(0);
    drawCurve();
  }

  let lastPhysicsTime = 0;
  let lastDrawTime = 0;
  let dropAccumulator = 0;
  let needsRedraw = true;

  // Animation Loop for Continuous Flow & Drops (Delta-T physics decoupled from render pacing)
  function animate(now) {
    if (!container || !container.isConnected || !document.getElementById("titration-apparatus-canvas")) {
      stopAutoTitrate();
      if (animId) cancelAnimationFrame(animId);
      return;
    }

    const currentTime = now || performance.now();
    if (!lastPhysicsTime) lastPhysicsTime = currentTime;
    const dtSeconds = Math.min((currentTime - lastPhysicsTime) / 1000, 0.1);
    lastPhysicsTime = currentTime;

    const isSmart = (document.documentElement.getAttribute("data-mode") === "smartboard") ||
                    document.documentElement.classList.contains("fast-smartboard-mode") ||
                    /Android|MAXHUB/i.test(navigator.userAgent);
    const drawInterval = isSmart ? 33.3 : 16.0;

    const photoEl = container.querySelector("#titr-photo-overlay");
    const isPhotoOverlay = photoEl && photoEl.style.display === "block";

    if (!isPhotoOverlay) {
      const isFlowing = (flowRate > 0 && vTitrant < 50.0);

      if (isFlowing) {
        // True physical calculation based on real elapsed seconds dt (mL/s * s = mL)
        const stepVol = flowRate * dtSeconds;
        vTitrant = Math.min(50.0, vTitrant + stepVol);
        const ph = calculatePH(vTitrant);
        dataPoints.push({ v: vTitrant, ph });

        // Spawn drops periodically based on elapsed time and flowRate
        dropAccumulator += flowRate * dtSeconds;
        if (dropAccumulator >= 0.04) {
          dropAccumulator = 0;
          const standX = 110;
          const buretX = standX + 100;
          const stopcockY = 35 + 240;
          drops.push({ x: buretX, y: stopcockY + 38, speed: 2.5 });

          if (flowRate >= 0.5) {
            // Also generate swirling splash plume directly in solution
            const fluidH = 65;
            const flaskY = (appCanvas.height / (typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1))) - 68;
            colorPlumes.push({
              x: buretX + (Math.random() - 0.5) * 4,
              y: flaskY - fluidH + 4,
              radius: 3,
              maxRadius: 20 + Math.random() * 8,
              opacity: 0.85,
              angle: Math.random() * Math.PI * 2,
              color: (indicator === "phenolphthalein") ? "rgba(236, 72, 153," : (indicator === "bromothymol_blue" ? "rgba(37, 99, 235," : "rgba(234, 179, 8,")
            });
          }
        }

        updateTelemetry();
        needsRedraw = true;
      }

      if (drops.length > 0 || colorPlumes.length > 0) {
        needsRedraw = true;
      }

      if (needsRedraw && (!now || currentTime - lastDrawTime >= drawInterval || isFlowing)) {
        const dtDrawSeconds = Math.min((currentTime - (lastDrawTime || currentTime)) / 1000, 0.1);
        lastDrawTime = currentTime;
        const dtFactor = dtDrawSeconds > 0 ? (dtDrawSeconds * 60) : 1.0;
        drawApparatus(dtFactor);
        drawCurve();
        if (!isFlowing && drops.length === 0 && colorPlumes.length === 0) {
          needsRedraw = false;
        }
      }
    }

    animId = requestAnimationFrame(animate);
  }

  // Initial Record
  dataPoints.push({ v: 0, ph: calculatePH(0) });
  updateTelemetry();
  drawCurve();
  animate();

  // ----------------------------------------------------
  // Interactive Direct Canvas Valve Hit-Testing & Dragging
  // ----------------------------------------------------
  const buretStandX = 110;
  const valveCenterBX = buretStandX + 100; // 210
  const valveCenterBY = 35 + 240 + 8; // 283

  function getCanvasPos(e) {
    const rect = appCanvas.getBoundingClientRect();
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
    const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    const scaleX = (appCanvas.width / dpr) / rect.width;
    const scaleY = (appCanvas.height / dpr) / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  function isOverValve(x, y) {
    const dx = x - valveCenterBX;
    const dy = y - valveCenterBY;
    return (dx * dx + dy * dy) <= (24 * 24);
  }

  function setValveFlow(rate, playAudio = true) {
    stopAutoTitrate();
    flowRate = rate;
    const statusEl = document.getElementById("titr-status");
    const dotEl = document.getElementById("titr-status-dot");
    if (rate === 0) {
      if (statusEl) statusEl.innerText = "Stopcock Valve Closed";
      if (dotEl) dotEl.style.background = "#ef4444";
    } else if (rate <= 0.25) {
      if (statusEl) statusEl.innerText = `Dropwise Flow (${rate.toFixed(1)} mL/s)`;
      if (dotEl) dotEl.style.background = "#10b981";
    } else if (rate <= 0.7) {
      if (statusEl) statusEl.innerText = `Continuous Flow (${rate.toFixed(1)} mL/s)`;
      if (dotEl) dotEl.style.background = "#38bdf8";
    } else {
      if (statusEl) statusEl.innerText = `Fast Stream (${rate.toFixed(1)} mL/s)`;
      if (dotEl) dotEl.style.background = "#f59e0b";
    }
    if (playAudio) {
      try { SoundFX.playSwitchSnap(); } catch(e) {}
    }
    needsRedraw = true;
  }

  function cycleValve() {
    if (flowRate === 0) {
      setValveFlow(0.2);
    } else if (flowRate <= 0.25) {
      setValveFlow(0.6);
    } else if (flowRate <= 0.7) {
      setValveFlow(1.5);
    } else {
      setValveFlow(0);
    }
  }

  appCanvas.addEventListener("pointermove", (e) => {
    const { x, y } = getCanvasPos(e);
    if (isDraggingStopcock) {
      const dy = stopcockDragStartY - y;
      const newRate = Math.max(0, Math.min(1.5, stopcockDragStartFlow + dy * 0.035));
      flowRate = parseFloat(newRate.toFixed(2));
      const statusEl = document.getElementById("titr-status");
      const dotEl = document.getElementById("titr-status-dot");
      if (flowRate === 0) {
        if (statusEl) statusEl.innerText = "Stopcock Valve Closed";
        if (dotEl) dotEl.style.background = "#ef4444";
      } else {
        if (statusEl) statusEl.innerText = `Valve Open (${flowRate.toFixed(2)} mL/s)`;
        if (dotEl) dotEl.style.background = flowRate > 0.8 ? "#f59e0b" : "#10b981";
      }
      needsRedraw = true;
      return;
    }

    const over = isOverValve(x, y);
    if (over !== isHoveringStopcock) {
      isHoveringStopcock = over;
      appCanvas.style.cursor = over ? "pointer" : "default";
      needsRedraw = true;
    }
  });

  appCanvas.addEventListener("pointerdown", (e) => {
    const { x, y } = getCanvasPos(e);
    if (isOverValve(x, y)) {
      isDraggingStopcock = true;
      stopcockDragStartY = y;
      stopcockDragStartFlow = flowRate;
      try { appCanvas.setPointerCapture(e.pointerId); } catch(err) {}
    }
  });

  appCanvas.addEventListener("pointerup", (e) => {
    if (isDraggingStopcock) {
      const { y } = getCanvasPos(e);
      const moved = Math.abs(y - stopcockDragStartY);
      if (moved < 5) {
        // Simple click / tap
        cycleValve();
      } else {
        try { SoundFX.playClick(); } catch(err) {}
      }
      isDraggingStopcock = false;
      try { appCanvas.releasePointerCapture(e.pointerId); } catch(err) {}
    }
  });

  appCanvas.addEventListener("pointercancel", () => {
    isDraggingStopcock = false;
    isHoveringStopcock = false;
  });

  // Control Handlers
  document.getElementById("btn-add-drop")?.addEventListener("click", () => {
    stopAutoTitrate();
    addVolume(0.05);
    try { SoundFX.playClick(); } catch(e) {}
  });

  document.getElementById("btn-titr-slow")?.addEventListener("click", () => {
    setValveFlow(0.2);
  });

  document.getElementById("btn-titr-fast")?.addEventListener("click", () => {
    setValveFlow(1.5);
  });

  document.getElementById("btn-titr-stop")?.addEventListener("click", () => {
    setValveFlow(0);
  });

  document.getElementById("btn-titr-auto")?.addEventListener("click", () => {
    stopAutoTitrate();
    flowRate = 0;
    const statusEl = document.getElementById("titr-status");
    if (statusEl) statusEl.innerText = "⚡ Automated Micro-Dosing Active...";
    const dotEl = document.getElementById("titr-status-dot");
    if (dotEl) dotEl.style.background = "#38bdf8";

    autoTitrateInterval = setInterval(() => {
      if (!container || !container.isConnected) {
        stopAutoTitrate();
        return;
      }
      if (vTitrant < 24.9) {
        addVolume(0.2);
      } else if (vTitrant < 25.0) {
        addVolume(0.02);
      } else {
        stopAutoTitrate();
        const sEl = document.getElementById("titr-status");
        if (sEl) sEl.innerText = "🎯 Titration Complete at Equivalence";
        const dEl = document.getElementById("titr-status-dot");
        if (dEl) dEl.style.background = "#10b981";
      }
    }, 40);
  });

  document.getElementById("btn-titr-reset")?.addEventListener("click", () => {
    stopAutoTitrate();
    flowRate = 0;
    vTitrant = 0;
    dataPoints = [{ v: 0, ph: calculatePH(0) }];
    drops = [];
    colorPlumes = [];
    reachedEquivalenceSoundPlayed = false;
    const statusEl = document.getElementById("titr-status");
    if (statusEl) statusEl.innerText = "Burette Charged (0.100 M NaOH)";
    const dotEl = document.getElementById("titr-status-dot");
    if (dotEl) dotEl.style.background = "#06b6d4";
    try { SoundFX.playClick(); } catch(e) {}
    updateTelemetry();
    drawApparatus();
    drawCurve();
  });

  document.getElementById("select-acid-type")?.addEventListener("change", (e) => {
    stopAutoTitrate();
    acidType = e.target.value;
    flowRate = 0;
    vTitrant = 0;
    dataPoints = [{ v: 0, ph: calculatePH(0) }];
    const analAcid = document.getElementById("anal-acid-text");
    const analTarget = document.getElementById("anal-target-text");
    if (acidType === "HCl") {
      if (analAcid) analAcid.innerText = "25.00 mL of 0.100 M HCl";
      if (analTarget) analTarget.innerText = "25.00 mL NaOH (pH 7.00)";
    } else {
      if (analAcid) analAcid.innerText = "25.00 mL of 0.100 M CH₃COOH";
      if (analTarget) analTarget.innerText = "25.00 mL NaOH (pH 8.72)";
    }
    updateTelemetry();
    drawApparatus();
    drawCurve();
  });

  document.getElementById("select-indicator")?.addEventListener("change", (e) => {
    indicator = e.target.value;
    drawApparatus();
  });

  document.getElementById("input-stirrer").addEventListener("input", (e) => {
    stirrerRpm = parseInt(e.target.value, 10);
    document.getElementById("disp-stirrer-rpm").innerText = `${stirrerRpm} RPM`;
  });

  // View Mode Switcher
  const btnSim = document.getElementById("view-mode-sim");
  const btnPhoto = document.getElementById("view-mode-photo");

  btnSim.addEventListener("click", () => {
    viewMode = "sim";
    photoOverlay.style.display = "none";
    btnSim.style.background = "rgba(6, 182, 212, 0.25)";
    btnSim.style.color = "#38bdf8";
    btnPhoto.style.background = "transparent";
    btnPhoto.style.color = "#94a3b8";
  });

  btnPhoto.addEventListener("click", () => {
    viewMode = "photo";
    photoOverlay.style.display = "block";
    btnPhoto.style.background = "rgba(6, 182, 212, 0.25)";
    btnPhoto.style.color = "#38bdf8";
    btnSim.style.background = "transparent";
    btnSim.style.color = "#94a3b8";
  });

  // Derivative Checkbox
  const chkDeriv = document.getElementById("chk-derivative");
  const legendDeriv = document.getElementById("legend-deriv");
  chkDeriv.addEventListener("change", (e) => {
    showDerivative = e.target.checked;
    legendDeriv.style.display = showDerivative ? "flex" : "none";
    drawCurve();
  });

  // Telemetry Suite: Record Current Trial
  document.getElementById("btn-record-titr-trial")?.addEventListener("click", () => {
    const curPH = calculatePH(vTitrant);
    const trialEntry = LabTrialStore.addTrial("titration", {
      measurements: {
        "Volume Added (mL)": parseFloat(vTitrant.toFixed(2)),
        "Final pH": parseFloat(curPH.toFixed(2)),
        "Analyte": acidType,
        "Indicator": indicator
      }
    });

    const trials = LabTrialStore.getTrials("titration");
    trials.forEach((tr, i) => {
      const pill = document.getElementById(`titr-pill-trial-${i + 1}`);
      if (pill) {
        pill.style.opacity = "1";
        pill.innerText = `Trial ${tr.trialNumber}: ${tr.measurements["Volume Added (mL)"]}mL → pH ${tr.measurements["Final pH"]}`;
      }
    });
  });

  // Telemetry Suite: Export CSV
  document.getElementById("btn-export-titr-csv")?.addEventListener("click", () => {
    const headers = ["Volume Dispensed (mL)", "Measured pH", "dpH/dV Derivative", "Analyte Type", "Indicator"];
    const rows = dataPoints.map(dp => [
      dp.v,
      dp.ph,
      dp.deriv || 0,
      acidType,
      indicator
    ]);

    exportLabDataCsv({
      title: "Analytical Acid-Base Titration & pH Metrology",
      labId: "titration",
      parameters: {
        "Analyte Acid": `${acidType} (25.0 mL, 0.100 M)`,
        "Titrant Base": "NaOH (0.100 M Standardized)",
        "Selected Indicator": indicator,
        "Stirrer Speed": `${stirrerRpm} RPM`,
        "Equivalence Volume": "25.00 mL"
      },
      headers,
      dataRows: rows.length > 0 ? rows : [[vTitrant, calculatePH(vTitrant), 0, acidType, indicator]]
    });
  });

  // Telemetry Suite: Generate Lab Report
  document.getElementById("btn-open-titr-report")?.addEventListener("click", () => {
    const trials = LabTrialStore.getTrials("titration");
    const curPH = calculatePH(vTitrant);
    openLabReportModal({
      title: "Analytical Acid-Base Titration & pH Metrology",
      subject: "Chemistry",
      inquiryQuestion: "How does the volumetric titration curve characterize stoichiometric equivalence and analyte dissociation equilibrium?",
      parameters: {
        "Analyte Solution": `${acidType} (25.0 mL, 0.100 M)`,
        "Standard Titrant": "NaOH (0.100 M)",
        "Colorimetric Indicator": indicator,
        "Stirrer Speed": `${stirrerRpm} RPM`,
        "Current Dispensed Volume": `${vTitrant.toFixed(2)} mL`,
        "Current Measured pH": curPH.toFixed(2)
      },
      trials,
      formulas: [
        "M_A \\cdot V_A = M_B \\cdot V_B",
        "\\text{pH} = -\\log_{10}[\\text{H}_3\\text{O}^+]",
        "\\text{pH} = \\text{p}K_a + \\log\\left(\\frac{[\\text{A}^-]}{[\\text{HA}]}\\right)",
        "\\text{dpH/dV} = \\lim_{\\Delta V \\to 0} \\frac{\\Delta \\text{pH}}{\\Delta V}"
      ]
    });
  });

  // Mount Post-Lab Checkpoint Assessment
  mountLabCheckpoint("titr-checkpoint-container", "titration");

  // Keyboard Shortcuts (Space: Drop, E: CSV, R: Reset, S: Stop, A: Auto, D: Derivative)
  function handleKeyDown(e) {
    if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.tagName === "TEXTAREA") return;
    if (e.code === "Space") {
      e.preventDefault();
      document.getElementById("btn-add-drop")?.click();
    } else if (e.key === "e" || e.key === "E") {
      e.preventDefault();
      document.getElementById("btn-export-titr-csv")?.click();
    } else if (e.key === "r" || e.key === "R") {
      e.preventDefault();
      document.getElementById("btn-titr-reset")?.click();
    } else if (e.key === "s" || e.key === "S") {
      e.preventDefault();
      document.getElementById("btn-titr-stop")?.click();
    } else if (e.key === "a" || e.key === "A") {
      e.preventDefault();
      document.getElementById("btn-titr-auto")?.click();
    } else if (e.key === "d" || e.key === "D") {
      e.preventDefault();
      document.getElementById("chk-derivative")?.click();
    }
  }
  window.addEventListener("keydown", handleKeyDown);

  const cleanup = () => {
    stopAutoTitrate();
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("keydown", handleKeyDown);
  };
  _currentTitrationCleanup = cleanup;
  return cleanup;
}

