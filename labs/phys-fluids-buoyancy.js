// Edugates-ClipSAT Science Labs - Physics: Fluid Dynamics, Buoyancy & Bernoulli Suite
// 60 FPS Precision Fluid Mechanics Simulation:
// - Archimedes Buoyant Force F_b = ρ_fluid · V_disp · g, Apparent Weight W_app = W_real - F_b
// - Free Floating Equilibrium vs Suspended Spring Balance Metrology
// - Overflow Catch Beaker Metrology with Dynamic Pouring Droplets & Surface Ripples
// - Direct Tactile Touch & Pointer Dragging on Submerged Block (MAXHUB & Tablet Ready)
// - Venturi Flow Tube with Dynamic Streamline Particles, Continuity A1·v1 = A2·v2, and Manometer Heads
// - Dual Analytical Charts, Lab Dossier Generator (openLabReportModal), and Trial Recording Store

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";
import { showToast } from "../utils/toast.js";

let _currentFluidsCleanup = null;

export function cleanupFluidsBuoyancyLab() {
  if (typeof _currentFluidsCleanup === "function") {
    try { _currentFluidsCleanup(); } catch (e) {}
    _currentFluidsCleanup = null;
  }
}

export function initFluidsBuoyancyLab(containerId) {
  cleanupFluidsBuoyancyLab();
  const container = document.getElementById(containerId);
  if (!container) return;

  // Fluid Library (Density ρ in kg/m³)
  const FLUIDS = {
    water: { name: "Fresh Water (H₂O)", density: 1000.0, color: "rgba(56, 189, 248, 0.4)", surfaceColor: "#0284c7" },
    seawater: { name: "Seawater (3.5% Salinity)", density: 1025.0, color: "rgba(14, 165, 233, 0.45)", surfaceColor: "#0369a1" },
    oil: { name: "Mineral Oil", density: 870.0, color: "rgba(234, 179, 8, 0.35)", surfaceColor: "#ca8a04" },
    ethanol: { name: "Ethanol (C₂H₅OH)", density: 789.0, color: "rgba(16, 185, 129, 0.35)", surfaceColor: "#059669" },
    mercury: { name: "Liquid Mercury (Hg)", density: 13600.0, color: "rgba(148, 163, 184, 0.85)", surfaceColor: "#475569" }
  };

  // Block Material Library (Density ρ in kg/m³)
  const MATERIALS = {
    wood: { name: "Pine Wood (Floats)", density: 550.0, color: "#a16207", borderColor: "#d97706" },
    ice: { name: "Glacial Ice", density: 917.0, color: "#7dd3fc", borderColor: "#bae6fd" },
    aluminum: { name: "Solid Aluminum", density: 2700.0, color: "#94a3b8", borderColor: "#cbd5e1" },
    iron: { name: "Cast Iron", density: 7870.0, color: "#475569", borderColor: "#64748b" },
    lead: { name: "Pure Lead", density: 11340.0, color: "#334155", borderColor: "#475569" }
  };

  // Simulation State
  let apparatusMode = "buoyancy"; // "buoyancy" or "venturi"
  let fluidKey = "water";
  let materialKey = "aluminum";
  let blockVolumeLiters = 1.0; // Liters = 1e-3 m³
  let submersionPercent = 100.0; // 0% to 100%
  let isFreeFloating = false; // false = suspended on spring scale; true = free float
  let flowRateLps = 2.0; // L/s for Venturi mode (0.5 to 5.0 L/s)
  const g = 9.81;

  let isRunning = true;
  let animId = null;
  let simTime = 0;
  let lastFrameTime = 0;
  let needsRedraw = true;

  // Direct Tactile Drag State
  let isDragging = false;
  let dragStartY = 0;
  let dragStartSubmersion = 100.0;
  let surfaceRippleAmp = 0.0;

  // Venturi Tracer Streamline Particles
  const venturiParticles = [];
  for (let i = 0; i < 35; i++) {
    venturiParticles.push({
      x: 40 + Math.random() * 500,
      yOff: (Math.random() - 0.5) * 44, // offset from pipe centerline
      speedFactor: 0.85 + Math.random() * 0.3
    });
  }

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #06b6d4; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #06b6d4; box-shadow: 0 0 10px #06b6d4;"></span>
            Fluid Dynamics, Buoyancy &amp; Bernoulli Suite
          </span>
          <span class="badge" style="background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.3); color: #38bdf8; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            ${renderLatex("F_b = \\rho_{f} V_{\\text{disp}} g \\quad \\bullet \\quad P_1 + \\frac{1}{2}\\rho v_1^2 = P_2 + \\frac{1}{2}\\rho v_2^2")}
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-fluids-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Fluids Simulator
            </button>
            <button id="view-mode-fluids-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-fluid-mode" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(6, 182, 212, 0.4); color: #38bdf8;" title="Hotkey: M">
            🔀 Switch Mode
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-fluid-float" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(245, 158, 11, 0.4); color: #facc15;" title="Toggle Free Float vs Suspended Scale (Hotkey: F)">
            🪝 Release to Float
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-record-trial" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #34d399;" title="Record Trial (Hotkey: T)">
            📌 Record Trial
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-fluid-report" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;" title="Open Lab Dossier Report (Hotkey: R)">
            📋 Lab Dossier
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-fluid-export" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(148, 163, 184, 0.4); color: #94a3b8;" title="Export CSV Data">
            📥 CSV
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-fluid-reset" style="padding: 5px 12px; font-size: 0.78rem;">
            ⟲ Reset
          </button>
        </div>
      </div>

      <!-- Main Layout -->
      <div style="display: grid; grid-template-columns: 1.25fr 1fr; gap: 20px;" class="fluids-layout">
        <!-- Canvas Viewport: Archimedes Tank or Venturi Tube -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(6, 182, 212, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #083344 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="fluids-canvas" width="620" height="530" style="height: 530px; width: 100%; display: block; touch-action: none; cursor: default;"></canvas>

          <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
          <div id="fluids-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <img src="assets/labs/fluids_bench.jpg" alt="4K Fluid Mechanics & Archimedes Buoyancy Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            
            <!-- Live Analytical Telemetry Callout on Photo -->
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(6, 182, 212, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Archimedes Overflow Tank</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Suspended Brass Mass &amp; Spout</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">OHAUS Digital Tare Balance</div>
                <div style="color: #facc15; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Displaced Water m = 245.0 g</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Digital Dynamometer Tension</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Buoyant Force F_b = 3.62 N</div>
              </div>
            </div>
          </div>

          <!-- Top HUD -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(6, 182, 212, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div id="hud-fluids-title-left" style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">BUOYANT FORCE F_b</div>
              <div id="hud-fluids-fb" style="font-size: 1.25rem; font-weight: 800; color: #38bdf8; font-family: var(--font-mono);">
                9.81 N
              </div>
              <div id="hud-fluids-sub-left" style="font-size: 0.72rem; color: #67e8f9; font-family: var(--font-mono);">
                V_disp = 1.00 L
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div id="hud-fluids-title-right" style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">APPARENT WEIGHT W_app</div>
              <div id="hud-fluids-wapp" style="font-size: 1.25rem; font-weight: 800; color: #10b981; font-family: var(--font-mono);">
                16.68 N
              </div>
              <div id="hud-fluids-sub-right" style="font-size: 0.72rem; color: #6ee7b7; font-family: var(--font-mono);">
                Scale Tension T
              </div>
            </div>
          </div>

          <!-- Bottom Drag Instruction Indicator -->
          <div id="fluids-drag-hint" style="position: absolute; bottom: 12px; left: 16px; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 6px; padding: 4px 10px; font-size: 0.72rem; color: #94a3b8; pointer-events: none; z-index: 5;">
            👆 Drag block vertically inside tank • Touch/Wheel friendly
          </div>
        </div>

        <!-- Controls & Metrology Analysis -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Controls Panel -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 0.75rem; font-weight: 700; color: #38bdf8; text-transform: uppercase;">
                Apparatus Physical Parameters
              </span>
              <span id="badge-float-status" class="badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); font-size: 0.7rem; padding: 2px 8px; border-radius: 9999px;">
                Suspended from Scale
              </span>
            </div>

            <!-- Buoyancy Specific Controls -->
            <div id="panel-buoyancy-controls">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                <div>
                  <label style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Liquid Medium</label>
                  <select id="select-fluids-fluid" class="form-control" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                    ${Object.entries(FLUIDS).map(([k, f]) => `<option value="${k}">${f.name}</option>`).join("")}
                  </select>
                </div>

                <div>
                  <label style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Solid Material</label>
                  <select id="select-fluids-material" class="form-control" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                    ${Object.entries(MATERIALS).map(([k, m]) => `<option value="${k}" ${k === 'aluminum' ? 'selected' : ''}>${m.name}</option>`).join("")}
                  </select>
                </div>
              </div>

              <!-- Submersion Depth Slider -->
              <div id="row-submersion-slider" style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                  <span style="color: #94a3b8;">Submersion Depth (Immersion %)</span>
                  <span id="lbl-fluids-submersion" style="font-weight: 700; color: #38bdf8; font-family: var(--font-mono);">100%</span>
                </div>
                <input type="range" id="slider-fluids-submersion" min="0" max="100" step="1" value="100" style="width: 100%; accent-color: #38bdf8;">
              </div>

              <!-- Block Volume Slider -->
              <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                  <span style="color: #94a3b8;">Solid Object Volume (V)</span>
                  <span id="lbl-fluids-vol" style="font-weight: 700; color: #10b981; font-family: var(--font-mono);">1.00 L (1000 cm³)</span>
                </div>
                <input type="range" id="slider-fluids-vol" min="0.2" max="3.0" step="0.1" value="1.0" style="width: 100%; accent-color: #10b981;">
              </div>
            </div>

            <!-- Venturi Specific Controls -->
            <div id="panel-venturi-controls" style="display: none; margin-bottom: 12px;">
              <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                  <span style="color: #94a3b8;">Volumetric Flow Rate (Q)</span>
                  <span id="lbl-venturi-flow" style="font-weight: 700; color: #38bdf8; font-family: var(--font-mono);">2.00 L/s</span>
                </div>
                <input type="range" id="slider-venturi-flow" min="0.5" max="5.0" step="0.1" value="2.0" style="width: 100%; accent-color: #38bdf8;">
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.76rem; background: rgba(0,0,0,0.3); border-radius: 8px; padding: 10px;">
                <div>
                  <div style="color: #94a3b8;">Wide Pipe Diameter D₁</div>
                  <div style="color: #f1f5f9; font-weight: 700; font-family: var(--font-mono);">60.0 mm (A₁ = 28.3 cm²)</div>
                </div>
                <div>
                  <div style="color: #94a3b8;">Constricted Throat D₂</div>
                  <div style="color: #f59e0b; font-weight: 700; font-family: var(--font-mono);">30.0 mm (A₂ = 7.1 cm²)</div>
                </div>
              </div>
            </div>

            <!-- Quick Specs -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; background: rgba(0,0,0,0.3); border-radius: 8px; padding: 8px 10px; font-size: 0.75rem; text-align: center;">
              <div>
                <span id="label-stat-1" style="color: #64748b; display: block;">Fluid Density</span>
                <span id="info-fluids-rhof" style="font-weight: 700; color: #38bdf8; font-family: var(--font-mono);">1000 kg/m³</span>
              </div>
              <div>
                <span id="label-stat-2" style="color: #64748b; display: block;">Real Weight (Air)</span>
                <span id="info-fluids-wreal" style="font-weight: 700; color: #f59e0b; font-family: var(--font-mono);">26.49 N</span>
              </div>
              <div>
                <span id="label-stat-3" style="color: #64748b; display: block;">Displaced Mass</span>
                <span id="info-fluids-mdisp" style="font-weight: 700; color: #10b981; font-family: var(--font-mono);">1.000 kg</span>
              </div>
            </div>
          </div>

          <!-- Analytical Real-time Chart -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; flex: 1; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span id="lbl-chart-title" style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">
                Archimedes Linear Verification (F_b vs V_disp)
              </span>
              <span id="lbl-chart-slope" style="font-size: 0.72rem; color: #38bdf8; font-family: var(--font-mono);">
                Slope = ρ_f · g
              </span>
            </div>
            <div style="position: relative; flex: 1; min-height: 180px;">
              <canvas id="fluids-chart-canvas" width="460" height="180" style="width: 100%; height: 180px; display: block; border-radius: 6px;"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Assessment Checkpoint Container -->
      <div id="fluids-checkpoint-container" style="margin-top: 24px;"></div>
    </div>
  `;

  const canvas = container.querySelector("#fluids-canvas");
  const ctx = canvas.getContext("2d");
  const chartCanvas = container.querySelector("#fluids-chart-canvas");
  const chartCtx = chartCanvas.getContext("2d");

  // HiDPI / Retina Canvas Initialization
  function setupHiDPICanvas() {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (typeof window.getOptimizedDPR === "function" ? window.getOptimizedDPR() : (window.devicePixelRatio || 1));
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0) {
      canvas.width = rect.width * dpr;
      canvas.height = 530 * dpr;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    }
    const chartRect = chartCanvas.getBoundingClientRect();
    if (chartRect.width > 0) {
      chartCanvas.width = chartRect.width * dpr;
      chartCanvas.height = 180 * dpr;
      chartCtx.resetTransform();
      chartCtx.scale(dpr, dpr);
    }
    needsRedraw = true;
  }
  setupHiDPICanvas();
  window.addEventListener("resize", setupHiDPICanvas);

  function getCalculations() {
    const f = FLUIDS[fluidKey];
    const m = MATERIALS[materialKey];

    const volM3 = blockVolumeLiters * 1e-3; // m³
    const massRealKg = m.density * volM3;
    const weightRealN = massRealKg * g;

    // Density ratio and floating physics
    const densityRatio = m.density / f.density;
    const canFloat = densityRatio < 1.0;
    const equilibriumSubmersion = Math.min(100.0, densityRatio * 100.0);

    let effectiveSubmersion = submersionPercent;
    if (isFreeFloating) {
      if (canFloat) {
        // Bobbing harmonic oscillation around equilibrium
        const bob = Math.sin(simTime * 3.5) * Math.exp(-0.04 * (simTime % 15)) * 2.0;
        effectiveSubmersion = Math.max(1, Math.min(99, equilibriumSubmersion + bob));
      } else {
        effectiveSubmersion = 100.0;
      }
    }

    const dispVolM3 = volM3 * (effectiveSubmersion / 100.0);
    const fbN = f.density * dispVolM3 * g;
    const massDispKg = f.density * dispVolM3;

    let weightAppN = 0;
    let normalForceN = 0;

    if (!isFreeFloating) {
      weightAppN = Math.max(0, weightRealN - fbN);
    } else {
      if (!canFloat) {
        normalForceN = Math.max(0, weightRealN - fbN);
      }
    }

    // Venturi Calculations:
    const d1 = 0.06; // 60 mm diameter
    const d2 = 0.03; // 30 mm throat diameter
    const a1 = Math.PI * Math.pow(d1 / 2, 2);
    const a2 = Math.PI * Math.pow(d2 / 2, 2);
    const qM3s = flowRateLps * 1e-3;
    const v1 = qM3s / a1;
    const v2 = qM3s / a2;
    const deltaP = 0.5 * f.density * (v2 * v2 - v1 * v1);
    const deltaH = deltaP / (f.density * g);

    return {
      f, m, volM3, dispVolM3, massRealKg, weightRealN,
      fbN, weightAppN, massDispKg, normalForceN,
      effectiveSubmersion, canFloat, densityRatio, equilibriumSubmersion,
      v1, v2, deltaP, deltaH, a1, a2
    };
  }

  function updateHUD() {
    const calc = getCalculations();
    const hudFb = container.querySelector("#hud-fluids-fb");
    const hudWapp = container.querySelector("#hud-fluids-wapp");
    const hudSubLeft = container.querySelector("#hud-fluids-sub-left");
    const hudSubRight = container.querySelector("#hud-fluids-sub-right");
    const hudTitleLeft = container.querySelector("#hud-fluids-title-left");
    const hudTitleRight = container.querySelector("#hud-fluids-title-right");

    const infoRhof = container.querySelector("#info-fluids-rhof");
    const infoWreal = container.querySelector("#info-fluids-wreal");
    const infoMdisp = container.querySelector("#info-fluids-mdisp");
    const labelStat1 = container.querySelector("#label-stat-1");
    const labelStat2 = container.querySelector("#label-stat-2");
    const labelStat3 = container.querySelector("#label-stat-3");
    const badgeFloat = container.querySelector("#badge-float-status");

    if (apparatusMode === "buoyancy") {
      if (hudTitleLeft) hudTitleLeft.innerText = "BUOYANT FORCE F_b";
      if (hudFb) hudFb.innerText = `${calc.fbN.toFixed(2)} N`;
      if (hudSubLeft) hudSubLeft.innerText = `V_disp = ${(calc.dispVolM3 * 1000).toFixed(2)} L`;

      if (hudTitleRight) hudTitleRight.innerText = isFreeFloating ? "FLOAT EQUILIBRIUM" : "APPARENT WEIGHT W_app";
      if (hudWapp) {
        if (isFreeFloating) {
          hudWapp.innerText = calc.canFloat ? "FLOATING" : "SUNKEN";
          hudWapp.style.color = calc.canFloat ? "#38bdf8" : "#f87171";
        } else {
          hudWapp.innerText = `${calc.weightAppN.toFixed(2)} N`;
          hudWapp.style.color = "#10b981";
        }
      }
      if (hudSubRight) {
        hudSubRight.innerText = isFreeFloating 
          ? (calc.canFloat ? `Submerged: ${calc.equilibriumSubmersion.toFixed(1)}%` : `Resting on Floor (F_N = ${calc.normalForceN.toFixed(1)}N)`)
          : "Spring Scale Tension T";
      }

      if (labelStat1) labelStat1.innerText = "Fluid Density";
      if (infoRhof) infoRhof.innerText = `${calc.f.density} kg/m³`;
      if (labelStat2) labelStat2.innerText = "Real Weight (Air)";
      if (infoWreal) infoWreal.innerText = `${calc.weightRealN.toFixed(2)} N`;
      if (labelStat3) labelStat3.innerText = "Displaced Mass";
      if (infoMdisp) infoMdisp.innerText = `${calc.massDispKg.toFixed(3)} kg`;

      if (badgeFloat) {
        if (isFreeFloating) {
          badgeFloat.innerText = calc.canFloat ? "Free Floating at Equilibrium" : "Sunk to Floor (ρ_s > ρ_f)";
          badgeFloat.style.color = calc.canFloat ? "#38bdf8" : "#f87171";
          badgeFloat.style.background = calc.canFloat ? "rgba(56, 189, 248, 0.15)" : "rgba(239, 68, 68, 0.15)";
        } else {
          badgeFloat.innerText = "Suspended from Scale";
          badgeFloat.style.color = "#38bdf8";
          badgeFloat.style.background = "rgba(56, 189, 248, 0.15)";
        }
      }
    } else {
      // Venturi Mode HUD
      if (hudTitleLeft) hudTitleLeft.innerText = "PRESSURE DROP ΔP";
      if (hudFb) hudFb.innerText = `${(calc.deltaP / 1000).toFixed(2)} kPa`;
      if (hudSubLeft) hudSubLeft.innerText = `Head Δh = ${(calc.deltaH * 100).toFixed(1)} cm`;

      if (hudTitleRight) hudTitleRight.innerText = "THROAT VELOCITY v₂";
      if (hudWapp) {
        hudWapp.innerText = `${calc.v2.toFixed(2)} m/s`;
        hudWapp.style.color = "#f59e0b";
      }
      if (hudSubRight) hudSubRight.innerText = `Entrance v₁ = ${calc.v1.toFixed(2)} m/s`;

      if (labelStat1) labelStat1.innerText = "Flow Rate Q";
      if (infoRhof) infoRhof.innerText = `${flowRateLps.toFixed(2)} L/s`;
      if (labelStat2) labelStat2.innerText = "Velocity Ratio (v₂/v₁)";
      if (infoWreal) infoWreal.innerText = "4.0× (A₁/A₂)";
      if (labelStat3) labelStat3.innerText = "Reynolds Reg.";
      if (infoMdisp) infoMdisp.innerText = "Laminar/Trans.";
    }
  }

  function drawBuoyancyApparatus() {
    const canvasWidth = canvas.getBoundingClientRect().width || 620;
    const canvasHeight = 530;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    const calc = getCalculations();

    if (apparatusMode === "buoyancy") {
      // Coordinate layout
      const scaleX = Math.round(canvasWidth * 0.40);
      const scaleY = 40;

      // 1. Digital Spring Scale / Dynamometer at Top
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = isFreeFloating ? "#475569" : "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(scaleX - 50, scaleY, 100, 52, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isFreeFloating ? "#64748b" : "#10b981";
      ctx.font = "bold 14px var(--font-mono, monospace)";
      ctx.textAlign = "center";
      ctx.fillText(isFreeFloating ? "0.00 N (FREE)" : `${calc.weightAppN.toFixed(2)} N`, scaleX, scaleY + 28);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "8px system-ui, sans-serif";
      ctx.fillText(isFreeFloating ? "SCALE DETACHED" : "SPRING SCALE TENSION", scaleX, scaleY + 42);

      // 2. Main Overflow Tank with Glass Refraction & Spout
      const tankX = scaleX - 105;
      const tankY = 175;
      const tankW = 210;
      const tankH = 270;
      const waterSurfaceY = tankY + 50;

      // Tank Body Glass
      ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(tankX, tankY);
      ctx.lineTo(tankX, tankY + tankH);
      ctx.lineTo(tankX + tankW, tankY + tankH);
      ctx.lineTo(tankX + tankW, waterSurfaceY); // Spout opening
      // Spout beak
      ctx.lineTo(tankX + tankW + 45, waterSurfaceY + 20);
      ctx.lineTo(tankX + tankW + 45, waterSurfaceY + 30);
      ctx.lineTo(tankX + tankW, waterSurfaceY + 10);
      ctx.lineTo(tankX + tankW, tankY);
      ctx.stroke();

      // Fluid in main tank up to spout level
      ctx.fillStyle = calc.f.color;
      ctx.fillRect(tankX + 4, waterSurfaceY, tankW - 8, tankH - (waterSurfaceY - tankY) - 4);

      // Surface meniscus ripples
      surfaceRippleAmp = Math.max(0, surfaceRippleAmp * 0.96);
      ctx.strokeStyle = calc.f.surfaceColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(tankX + 4, waterSurfaceY);
      for (let x = tankX + 4; x <= tankX + tankW - 4; x += 6) {
        const wave = Math.sin((x - tankX) * 0.08 + simTime * 6) * surfaceRippleAmp;
        ctx.lineTo(x, waterSurfaceY + wave);
      }
      ctx.stroke();

      // Graduated volume ticks on side of tank
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1;
      for (let y = waterSurfaceY + 20; y < tankY + tankH - 10; y += 35) {
        ctx.beginPath();
        ctx.moveTo(tankX + 4, y);
        ctx.lineTo(tankX + 16, y);
        ctx.stroke();
      }

      // Overflow Catch Beaker on tare balance (Right side)
      const catchX = tankX + tankW + 35;
      const catchY = tankY + 130;
      const catchW = 85;
      const catchH = 135;

      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(catchX, catchY);
      ctx.lineTo(catchX, catchY + catchH);
      ctx.lineTo(catchX + catchW, catchY + catchH);
      ctx.lineTo(catchX + catchW, catchY);
      ctx.stroke();

      // Displaced liquid in catch beaker
      const dispLiquidHeight = Math.min(catchH - 12, (calc.dispVolM3 * 1000) * 32);
      ctx.fillStyle = calc.f.color;
      ctx.fillRect(catchX + 3, catchY + catchH - dispLiquidHeight, catchW - 6, dispLiquidHeight);

      // Animated Overflow Pouring Stream & Droplets
      if (calc.effectiveSubmersion > 0.5) {
        ctx.save();
        ctx.strokeStyle = calc.f.surfaceColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        // Stream arc from spout to catch beaker
        ctx.moveTo(tankX + tankW + 45, waterSurfaceY + 25);
        ctx.quadraticCurveTo(
          catchX + 15,
          waterSurfaceY + 45,
          catchX + catchW / 2,
          catchY + catchH - dispLiquidHeight
        );
        ctx.stroke();

        // Glistening droplets along stream
        const dropT = (simTime * 4) % 1.0;
        const dropX = (1 - dropT) * (1 - dropT) * (tankX + tankW + 45) + 2 * (1 - dropT) * dropT * (catchX + 15) + dropT * dropT * (catchX + catchW / 2);
        const dropY = (1 - dropT) * (1 - dropT) * (waterSurfaceY + 25) + 2 * (1 - dropT) * dropT * (waterSurfaceY + 45) + dropT * dropT * (catchY + catchH - dispLiquidHeight);
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(dropX, dropY, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Catch balance platform & readout
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(catchX - 10, catchY + catchH, catchW + 20, 22);
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 11px var(--font-mono, monospace)";
      ctx.textAlign = "center";
      ctx.fillText(`${(calc.massDispKg * 1000).toFixed(0)} g (${calc.fbN.toFixed(2)} N)`, catchX + catchW / 2, catchY + catchH + 15);

      // Immersed Solid Block calculations
      const blockW = 68;
      const blockH = 68;
      let blockBottomTargetY = waterSurfaceY + (calc.effectiveSubmersion / 100.0) * blockH;
      let blockY = blockBottomTargetY - blockH;

      // Suspension wire from scale to block
      ctx.strokeStyle = isFreeFloating ? "rgba(148, 163, 184, 0.3)" : "#94a3b8";
      ctx.lineWidth = isFreeFloating ? 1 : 2;
      ctx.setLineDash(isFreeFloating ? [3, 3] : []);
      ctx.beginPath();
      ctx.moveTo(scaleX, scaleY + 52);
      ctx.lineTo(scaleX, isFreeFloating ? scaleY + 80 : blockY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Top suspension hook on block
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(scaleX, blockY - 5, 5, 0, Math.PI);
      ctx.stroke();

      // Draw Block with material shading and border
      ctx.fillStyle = calc.m.color;
      ctx.strokeStyle = calc.m.borderColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(scaleX - blockW / 2, blockY, blockW, blockH, 4);
      ctx.fill();
      ctx.stroke();

      // High-tech tactile dragging ring when dragging
      if (isDragging) {
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(scaleX - blockW / 2 - 4, blockY - 4, blockW + 8, blockH + 8);
        ctx.setLineDash([]);
      }

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(calc.m.name.split(" ")[0], scaleX, blockY + 30);
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.font = "9px var(--font-mono, monospace)";
      ctx.fillText(`${calc.m.density} kg/m³`, scaleX, blockY + 44);

      // Free-Body Force Vectors
      // 1. Gravity (Down Red Arrow)
      const arrowLengthFg = Math.min(80, calc.weightRealN * 2.2);
      ctx.strokeStyle = "#ef4444";
      ctx.fillStyle = "#ef4444";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(scaleX, blockY + blockH / 2);
      ctx.lineTo(scaleX, blockY + blockH / 2 + arrowLengthFg);
      ctx.stroke();
      // Arrowhead
      ctx.beginPath();
      ctx.moveTo(scaleX - 5, blockY + blockH / 2 + arrowLengthFg - 8);
      ctx.lineTo(scaleX + 5, blockY + blockH / 2 + arrowLengthFg - 8);
      ctx.lineTo(scaleX, blockY + blockH / 2 + arrowLengthFg);
      ctx.fill();
      ctx.font = "bold 10px var(--font-mono, monospace)";
      ctx.fillText(`F_g = ${calc.weightRealN.toFixed(1)} N`, scaleX, blockY + blockH / 2 + arrowLengthFg + 14);

      // 2. Buoyancy (Up Cyan Arrow)
      if (calc.fbN > 0.2) {
        const arrowLengthFb = Math.min(80, calc.fbN * 2.2);
        const fbStartY = blockY + blockH - (calc.effectiveSubmersion / 100 * blockH) / 2;
        ctx.strokeStyle = "#38bdf8";
        ctx.fillStyle = "#38bdf8";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(scaleX + 42, fbStartY);
        ctx.lineTo(scaleX + 42, fbStartY - arrowLengthFb);
        ctx.stroke();
        // Arrowhead
        ctx.beginPath();
        ctx.moveTo(scaleX + 42 - 5, fbStartY - arrowLengthFb + 8);
        ctx.lineTo(scaleX + 42 + 5, fbStartY - arrowLengthFb + 8);
        ctx.lineTo(scaleX + 42, fbStartY - arrowLengthFb);
        ctx.fill();
        ctx.textAlign = "left";
        ctx.fillText(`F_b = ${calc.fbN.toFixed(1)} N`, scaleX + 50, fbStartY - arrowLengthFb + 4);
      }

      // 3. Tension or Normal Force
      if (!isFreeFloating && calc.weightAppN > 0.2) {
        const arrowLengthT = Math.min(70, calc.weightAppN * 2.2);
        ctx.strokeStyle = "#f59e0b";
        ctx.fillStyle = "#f59e0b";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(scaleX - 42, blockY);
        ctx.lineTo(scaleX - 42, blockY - arrowLengthT);
        ctx.stroke();
        // Arrowhead
        ctx.beginPath();
        ctx.moveTo(scaleX - 42 - 5, blockY - arrowLengthT + 8);
        ctx.lineTo(scaleX - 42 + 5, blockY - arrowLengthT + 8);
        ctx.lineTo(scaleX - 42, blockY - arrowLengthT);
        ctx.fill();
        ctx.textAlign = "right";
        ctx.fillText(`T = ${calc.weightAppN.toFixed(1)} N`, scaleX - 50, blockY - arrowLengthT + 4);
      }
    } else {
      // Venturi Flow Tube Mode
      drawVenturiTube(canvasWidth);
    }
  }

  function drawVenturiTube(canvasWidth) {
    const py = 250;
    const calc = getCalculations();

    // Pipe with constriction: Section 1 wide, Section 2 narrow throat, Section 3 wide
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 3;

    // Top pipe profile
    ctx.beginPath();
    ctx.moveTo(40, py - 60);
    ctx.lineTo(190, py - 60);
    ctx.lineTo(260, py - 25); // constricted
    ctx.lineTo(330, py - 25);
    ctx.lineTo(400, py - 60);
    ctx.lineTo(canvasWidth - 40, py - 60);
    ctx.stroke();

    // Bottom pipe profile
    ctx.beginPath();
    ctx.moveTo(40, py + 60);
    ctx.lineTo(190, py + 60);
    ctx.lineTo(260, py + 25);
    ctx.lineTo(330, py + 25);
    ctx.lineTo(400, py + 60);
    ctx.lineTo(canvasWidth - 40, py + 60);
    ctx.stroke();

    // Fluid background in pipe
    ctx.fillStyle = calc.f.color;
    ctx.beginPath();
    ctx.moveTo(40, py - 58);
    ctx.lineTo(190, py - 58);
    ctx.lineTo(260, py - 23);
    ctx.lineTo(330, py - 23);
    ctx.lineTo(400, py - 58);
    ctx.lineTo(canvasWidth - 40, py - 58);
    ctx.lineTo(canvasWidth - 40, py + 58);
    ctx.lineTo(400, py + 58);
    ctx.lineTo(330, py + 23);
    ctx.lineTo(260, py + 23);
    ctx.lineTo(190, py + 58);
    ctx.lineTo(40, py + 58);
    ctx.closePath();
    ctx.fill();

    // Fluid flowing stream lines
    ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
      const lineOff = (i - 2) * 18;
      ctx.beginPath();
      ctx.moveTo(40, py + lineOff);
      ctx.lineTo(190, py + lineOff);
      ctx.lineTo(260, py + lineOff * 0.42);
      ctx.lineTo(330, py + lineOff * 0.42);
      ctx.lineTo(400, py + lineOff);
      ctx.lineTo(canvasWidth - 40, py + lineOff);
      ctx.stroke();
    }

    // Dynamic Tracer Flow Particles
    ctx.fillStyle = "#ffffff";
    venturiParticles.forEach(p => {
      // Calculate velocity based on horizontal position x
      let localSpeed = calc.v1 * 22 * p.speedFactor;
      let localHeightScale = 1.0;

      if (p.x >= 190 && p.x <= 260) {
        const t = (p.x - 190) / 70;
        localSpeed = (calc.v1 * (1 - t) + calc.v2 * t) * 22 * p.speedFactor;
        localHeightScale = 1.0 * (1 - t) + 0.42 * t;
      } else if (p.x > 260 && p.x < 330) {
        localSpeed = calc.v2 * 22 * p.speedFactor;
        localHeightScale = 0.42;
      } else if (p.x >= 330 && p.x <= 400) {
        const t = (p.x - 330) / 70;
        localSpeed = (calc.v2 * (1 - t) + calc.v1 * t) * 22 * p.speedFactor;
        localHeightScale = 0.42 * (1 - t) + 1.0 * t;
      }

      p.x += localSpeed * 0.016;
      if (p.x > canvasWidth - 40) {
        p.x = 40;
      }

      const curY = py + p.yOff * localHeightScale;
      ctx.beginPath();
      ctx.arc(p.x, curY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Vertical Manometers: Column 1 at Wide Section, Column 2 at Narrow Section
    // Manometer 1 (High pressure -> High column)
    const m1X = 135;
    const m2X = 295;
    const col1H = 90;
    const col2H = Math.max(25, col1H - calc.deltaH * 160);

    // Glass tubes
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 2;
    ctx.strokeRect(m1X - 10, 75, 20, 115);
    ctx.strokeRect(m2X - 10, 75, 20, 150);

    // Liquid in Manometer 1
    ctx.fillStyle = calc.f.surfaceColor;
    ctx.fillRect(m1X - 8, 190 - col1H, 16, col1H);
    // Liquid in Manometer 2
    ctx.fillRect(m2X - 8, 225 - col2H, 16, col2H);

    // Annotations & Callouts
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 12px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`Wide Section: v₁ = ${calc.v1.toFixed(2)} m/s`, m1X, 55);
    ctx.fillStyle = "#f59e0b";
    ctx.fillText(`Constricted Throat: v₂ = ${calc.v2.toFixed(2)} m/s`, m2X, 55);

    // Height differential indicator Δh
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(m1X + 10, 190 - col1H);
    ctx.lineTo(m2X + 35, 190 - col1H);
    ctx.moveTo(m2X + 10, 225 - col2H);
    ctx.lineTo(m2X + 35, 225 - col2H);
    ctx.stroke();
    ctx.setLineDash([]);

    // Double-headed arrow for Δh
    ctx.beginPath();
    ctx.moveTo(m2X + 28, 190 - col1H);
    ctx.lineTo(m2X + 28, 225 - col2H);
    ctx.stroke();
    ctx.fillStyle = "#facc15";
    ctx.font = "bold 10px var(--font-mono, monospace)";
    ctx.textAlign = "left";
    ctx.fillText(`Δh = ${(calc.deltaH * 100).toFixed(1)} cm`, m2X + 32, (190 - col1H + 225 - col2H) / 2 + 4);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "11px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Bernoulli Principle: P₁ + ½ρv₁² = P₂ + ½ρv₂²  ⟹  ΔP = ½ρ(v₂² - v₁²)", canvasWidth / 2, 380);
  }

  function drawAnalyticalChart() {
    const chartW = chartCanvas.getBoundingClientRect().width || 460;
    const chartH = 180;
    chartCtx.clearRect(0, 0, chartW, chartH);

    // Background grid
    chartCtx.fillStyle = "#030712";
    chartCtx.fillRect(0, 0, chartW, chartH);
    chartCtx.strokeStyle = "rgba(255, 255, 255, 0.07)";
    chartCtx.lineWidth = 1;

    for (let x = 45; x < chartW; x += 45) {
      chartCtx.beginPath();
      chartCtx.moveTo(x, 10);
      chartCtx.lineTo(x, chartH - 25);
      chartCtx.stroke();
    }
    for (let y = 15; y < chartH - 25; y += 30) {
      chartCtx.beginPath();
      chartCtx.moveTo(45, y);
      chartCtx.lineTo(chartW - 15, y);
      chartCtx.stroke();
    }

    // Axes
    chartCtx.strokeStyle = "#475569";
    chartCtx.lineWidth = 1.5;
    chartCtx.beginPath();
    chartCtx.moveTo(45, 10);
    chartCtx.lineTo(45, chartH - 25);
    chartCtx.lineTo(chartW - 15, chartH - 25);
    chartCtx.stroke();

    const calc = getCalculations();

    if (apparatusMode === "buoyancy") {
      // Buoyancy Curve: F_b vs V_disp
      chartCtx.fillStyle = "#94a3b8";
      chartCtx.font = "10px var(--font-mono, monospace)";
      chartCtx.textAlign = "center";
      chartCtx.fillText("Displaced Fluid Volume V_disp (L)", chartW / 2, chartH - 6);

      chartCtx.save();
      chartCtx.translate(16, chartH / 2);
      chartCtx.rotate(-Math.PI / 2);
      chartCtx.fillText("Buoyant Force F_b (N)", 0, 0);
      chartCtx.restore();

      const maxVolL = 3.0;
      const maxFb = calc.f.density * (maxVolL * 1e-3) * g;

      // Theoretical linear line
      chartCtx.strokeStyle = "#06b6d4";
      chartCtx.lineWidth = 2.5;
      chartCtx.beginPath();
      chartCtx.moveTo(45, chartH - 25);
      chartCtx.lineTo(chartW - 25, 20);
      chartCtx.stroke();

      // Current Operating Point
      const curVolL = calc.dispVolM3 * 1000;
      const px = 45 + (curVolL / maxVolL) * (chartW - 70);
      const py = (chartH - 25) - (calc.fbN / maxFb) * (chartH - 45);

      chartCtx.beginPath();
      chartCtx.arc(px, py, 6, 0, Math.PI * 2);
      chartCtx.fillStyle = "#facc15";
      chartCtx.shadowColor = "#facc15";
      chartCtx.shadowBlur = 8;
      chartCtx.fill();
      chartCtx.shadowBlur = 0;
    } else {
      // Venturi Curve: Pressure Drop ΔP vs Flow Rate Q
      chartCtx.fillStyle = "#94a3b8";
      chartCtx.font = "10px var(--font-mono, monospace)";
      chartCtx.textAlign = "center";
      chartCtx.fillText("Volumetric Flow Rate Q (L/s)", chartW / 2, chartH - 6);

      chartCtx.save();
      chartCtx.translate(16, chartH / 2);
      chartCtx.rotate(-Math.PI / 2);
      chartCtx.fillText("Pressure Drop ΔP (kPa)", 0, 0);
      chartCtx.restore();

      const maxQLps = 5.0;
      const maxDeltaP = 0.5 * calc.f.density * (Math.pow(maxQLps * 1e-3 / calc.a2, 2) - Math.pow(maxQLps * 1e-3 / calc.a1, 2));

      // Parabolic curve ΔP ∝ Q²
      chartCtx.strokeStyle = "#38bdf8";
      chartCtx.lineWidth = 2.5;
      chartCtx.beginPath();
      for (let step = 0; step <= 30; step++) {
        const qVal = (step / 30) * maxQLps;
        const qM3s = qVal * 1e-3;
        const v1Loc = qM3s / calc.a1;
        const v2Loc = qM3s / calc.a2;
        const dpLoc = 0.5 * calc.f.density * (v2Loc * v2Loc - v1Loc * v1Loc);
        const xPos = 45 + (qVal / maxQLps) * (chartW - 70);
        const yPos = (chartH - 25) - (dpLoc / maxDeltaP) * (chartH - 45);
        if (step === 0) chartCtx.moveTo(xPos, yPos);
        else chartCtx.lineTo(xPos, yPos);
      }
      chartCtx.stroke();

      // Current Operating Point
      const curX = 45 + (flowRateLps / maxQLps) * (chartW - 70);
      const curY = (chartH - 25) - (calc.deltaP / maxDeltaP) * (chartH - 45);
      chartCtx.beginPath();
      chartCtx.arc(curX, curY, 6, 0, Math.PI * 2);
      chartCtx.fillStyle = "#facc15";
      chartCtx.shadowColor = "#facc15";
      chartCtx.shadowBlur = 8;
      chartCtx.fill();
      chartCtx.shadowBlur = 0;
    }
  }

  // Pointer Interaction (Direct Tactile Dragging of Submerged Block)
  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
      width: rect.width,
      height: rect.height
    };
  }

  function handlePointerDown(e) {
    if (apparatusMode !== "buoyancy") return;
    const coords = getCanvasCoords(e);
    const canvasWidth = coords.width;
    const scaleX = Math.round(canvasWidth * 0.40);
    const tankY = 175;
    const waterSurfaceY = tankY + 50;
    const blockH = 68;
    const blockW = 68;

    const calc = getCalculations();
    const blockBottomTargetY = waterSurfaceY + (calc.effectiveSubmersion / 100.0) * blockH;
    const blockY = blockBottomTargetY - blockH;

    // Hit test on block
    if (
      Math.abs(coords.x - scaleX) <= blockW / 2 + 15 &&
      coords.y >= blockY - 15 &&
      coords.y <= blockY + blockH + 15
    ) {
      isDragging = true;
      dragStartY = coords.y;
      dragStartSubmersion = submersionPercent;
      canvas.style.cursor = "grabbing";
      surfaceRippleAmp = 3.5;
      SoundFX.playClick();
    }
  }

  function handlePointerMove(e) {
    if (apparatusMode !== "buoyancy") return;
    const coords = getCanvasCoords(e);
    const canvasWidth = coords.width;
    const scaleX = Math.round(canvasWidth * 0.40);
    const tankY = 175;
    const waterSurfaceY = tankY + 50;
    const blockH = 68;
    const blockW = 68;

    const calc = getCalculations();
    const blockBottomTargetY = waterSurfaceY + (calc.effectiveSubmersion / 100.0) * blockH;
    const blockY = blockBottomTargetY - blockH;

    if (isDragging) {
      const deltaY = coords.y - dragStartY;
      const deltaSub = (deltaY / blockH) * 100;
      submersionPercent = Math.max(0, Math.min(100, Math.round(dragStartSubmersion + deltaSub)));

      const sliderSub = container.querySelector("#slider-fluids-submersion");
      const lblSub = container.querySelector("#lbl-fluids-submersion");
      if (sliderSub) sliderSub.value = submersionPercent;
      if (lblSub) lblSub.innerText = `${submersionPercent}%`;

      surfaceRippleAmp = Math.min(5.0, surfaceRippleAmp + Math.abs(deltaY) * 0.05);
      needsRedraw = true;
    } else {
      // Hover feedback
      const isHover = (
        Math.abs(coords.x - scaleX) <= blockW / 2 + 10 &&
        coords.y >= blockY - 10 &&
        coords.y <= blockY + blockH + 10
      );
      canvas.style.cursor = isHover ? "grab" : "default";
    }
  }

  function handlePointerUp() {
    if (isDragging) {
      isDragging = false;
      canvas.style.cursor = "default";
      SoundFX.playPop();
    }
  }

  canvas.addEventListener("pointerdown", handlePointerDown);
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);
  window.addEventListener("pointercancel", handlePointerUp);

  // Keyboard Shortcuts Handler
  function handleKeyDown(e) {
    if (["input", "select", "textarea"].includes(document.activeElement?.tagName?.toLowerCase())) return;

    if (e.code === "Space" || e.key === " ") {
      e.preventDefault();
      isRunning = !isRunning;
      showToast(isRunning ? "Simulation Resumed" : "Simulation Paused", "Press Spacebar to toggle", "info");
      SoundFX.playClick();
    } else if (e.code === "ArrowUp") {
      e.preventDefault();
      submersionPercent = Math.min(100, submersionPercent + 5);
      const slider = container.querySelector("#slider-fluids-submersion");
      if (slider) slider.value = submersionPercent;
      container.querySelector("#lbl-fluids-submersion").innerText = `${submersionPercent}%`;
      surfaceRippleAmp = 2.5;
      needsRedraw = true;
      SoundFX.playClick();
    } else if (e.code === "ArrowDown") {
      e.preventDefault();
      submersionPercent = Math.max(0, submersionPercent - 5);
      const slider = container.querySelector("#slider-fluids-submersion");
      if (slider) slider.value = submersionPercent;
      container.querySelector("#lbl-fluids-submersion").innerText = `${submersionPercent}%`;
      surfaceRippleAmp = 2.5;
      needsRedraw = true;
      SoundFX.playClick();
    } else if (e.key === "m" || e.key === "M") {
      container.querySelector("#btn-fluid-mode")?.click();
    } else if (e.key === "f" || e.key === "F") {
      container.querySelector("#btn-fluid-float")?.click();
    } else if (e.key === "t" || e.key === "T") {
      container.querySelector("#btn-record-trial")?.click();
    } else if (e.key === "r" || e.key === "R") {
      container.querySelector("#btn-fluid-report")?.click();
    }
  }
  window.addEventListener("keydown", handleKeyDown);

  // Main 60 FPS Render Loop
  function loop(now) {
    if (!isRunning) return;
    if (!container || !container.isConnected) {
      isRunning = false;
      if (animId) cancelAnimationFrame(animId);
      return;
    }

    const isSmart = (document.documentElement.getAttribute("data-mode") === "smartboard") ||
                    document.documentElement.classList.contains("fast-smartboard-mode") ||
                    /Android|MAXHUB/i.test(navigator.userAgent);
    const interval = isSmart ? 33.3 : 16.0;

    const fluidsPhotoOverlay = container.querySelector("#fluids-photo-overlay");
    const isPhotoOverlay = fluidsPhotoOverlay && fluidsPhotoOverlay.style.display === "block";

    if (!isPhotoOverlay) {
      if (apparatusMode === "venturi" || isFreeFloating || isDragging || surfaceRippleAmp > 0.05) {
        if (!now || now - lastFrameTime >= interval) {
          lastFrameTime = now || performance.now();
          simTime += (interval / 1000);
          updateHUD();
          drawBuoyancyApparatus();
          drawAnalyticalChart();
        }
      } else if (needsRedraw) {
        updateHUD();
        drawBuoyancyApparatus();
        drawAnalyticalChart();
        needsRedraw = false;
      }
    }

    animId = requestAnimationFrame(loop);
  }

  // Event Listeners for UI Controls
  container.querySelector("#btn-fluid-mode")?.addEventListener("click", () => {
    apparatusMode = apparatusMode === "buoyancy" ? "venturi" : "buoyancy";
    const btn = container.querySelector("#btn-fluid-mode");
    const pBuoy = container.querySelector("#panel-buoyancy-controls");
    const pVent = container.querySelector("#panel-venturi-controls");
    const chartTitle = container.querySelector("#lbl-chart-title");
    const chartSlope = container.querySelector("#lbl-chart-slope");
    const dragHint = container.querySelector("#fluids-drag-hint");
    const btnFloat = container.querySelector("#btn-fluid-float");

    if (apparatusMode === "venturi") {
      btn.innerText = "🔀 Switch to Archimedes";
      if (pBuoy) pBuoy.style.display = "none";
      if (pVent) pVent.style.display = "block";
      if (chartTitle) chartTitle.innerText = "Venturi Pressure Differential (ΔP vs Q)";
      if (chartSlope) chartSlope.innerText = "ΔP = ½ρ(v₂² - v₁²)";
      if (dragHint) dragHint.innerText = "💨 High-speed Venturi Tube • Flow acceleration in constricted throat";
      if (btnFloat) btnFloat.style.display = "none";
    } else {
      btn.innerText = "🔀 Switch to Venturi Tube";
      if (pBuoy) pBuoy.style.display = "block";
      if (pVent) pVent.style.display = "none";
      if (chartTitle) chartTitle.innerText = "Archimedes Linear Verification (F_b vs V_disp)";
      if (chartSlope) chartSlope.innerText = "Slope = ρ_f · g";
      if (dragHint) dragHint.innerText = "👆 Drag block vertically inside tank • Touch/Wheel friendly";
      if (btnFloat) btnFloat.style.display = "inline-flex";
    }
    needsRedraw = true;
    SoundFX.playClick();
  });

  // Free Floating vs Suspended Scale Toggle
  container.querySelector("#btn-fluid-float")?.addEventListener("click", () => {
    isFreeFloating = !isFreeFloating;
    const btn = container.querySelector("#btn-fluid-float");
    const calc = getCalculations();
    if (isFreeFloating) {
      btn.innerText = "⚖️ Suspend from Scale";
      btn.style.color = "#38bdf8";
      btn.style.borderColor = "rgba(56, 189, 248, 0.4)";
      surfaceRippleAmp = 4.0;
      showToast(
        calc.canFloat ? "Object Released to Free Float" : "Object Sunk to Floor",
        calc.canFloat ? `Equilibrium at ${calc.equilibriumSubmersion.toFixed(1)}% Submersion` : "Solid density exceeds liquid density",
        calc.canFloat ? "success" : "warning"
      );
    } else {
      btn.innerText = "🪝 Release to Float";
      btn.style.color = "#facc15";
      btn.style.borderColor = "rgba(245, 158, 11, 0.4)";
      showToast("Object Hooked to Spring Scale", "Scale measures apparent weight", "info");
    }
    needsRedraw = true;
    SoundFX.playClick();
  });

  container.querySelector("#select-fluids-fluid")?.addEventListener("change", (e) => {
    fluidKey = e.target.value;
    surfaceRippleAmp = 3.0;
    needsRedraw = true;
    SoundFX.playClick();
  });

  container.querySelector("#select-fluids-material")?.addEventListener("change", (e) => {
    materialKey = e.target.value;
    surfaceRippleAmp = 3.0;
    needsRedraw = true;
    SoundFX.playClick();
  });

  container.querySelector("#slider-fluids-submersion")?.addEventListener("input", (e) => {
    submersionPercent = parseFloat(e.target.value);
    container.querySelector("#lbl-fluids-submersion").innerText = `${submersionPercent.toFixed(0)}%`;
    surfaceRippleAmp = 2.0;
    needsRedraw = true;
  });

  container.querySelector("#slider-fluids-vol")?.addEventListener("input", (e) => {
    blockVolumeLiters = parseFloat(e.target.value);
    container.querySelector("#lbl-fluids-vol").innerText = `${blockVolumeLiters.toFixed(2)} L (${(blockVolumeLiters * 1000).toFixed(0)} cm³)`;
    surfaceRippleAmp = 2.5;
    needsRedraw = true;
  });

  container.querySelector("#slider-venturi-flow")?.addEventListener("input", (e) => {
    flowRateLps = parseFloat(e.target.value);
    container.querySelector("#lbl-venturi-flow").innerText = `${flowRateLps.toFixed(2)} L/s`;
    needsRedraw = true;
  });

  container.querySelector("#btn-fluid-reset")?.addEventListener("click", () => {
    submersionPercent = 100.0;
    blockVolumeLiters = 1.0;
    isFreeFloating = false;
    fluidKey = "water";
    materialKey = "aluminum";
    flowRateLps = 2.0;

    const btnFloat = container.querySelector("#btn-fluid-float");
    if (btnFloat) {
      btnFloat.innerText = "🪝 Release to Float";
      btnFloat.style.color = "#facc15";
      btnFloat.style.borderColor = "rgba(245, 158, 11, 0.4)";
    }
    const selFluid = container.querySelector("#select-fluids-fluid");
    if (selFluid) selFluid.value = "water";
    const selMat = container.querySelector("#select-fluids-material");
    if (selMat) selMat.value = "aluminum";

    container.querySelector("#slider-fluids-submersion").value = 100;
    container.querySelector("#lbl-fluids-submersion").innerText = "100%";
    container.querySelector("#slider-fluids-vol").value = 1.0;
    container.querySelector("#lbl-fluids-vol").innerText = "1.00 L (1000 cm³)";
    container.querySelector("#slider-venturi-flow").value = 2.0;
    container.querySelector("#lbl-venturi-flow").innerText = "2.00 L/s";

    surfaceRippleAmp = 3.0;
    needsRedraw = true;
    SoundFX.playClick();
  });

  // Record Trial Store Integration
  container.querySelector("#btn-record-trial")?.addEventListener("click", () => {
    const calc = getCalculations();
    const trialSummary = apparatusMode === "buoyancy"
      ? `${calc.m.name} in ${calc.f.name} (${isFreeFloating ? 'Free Floating' : `${calc.effectiveSubmersion.toFixed(0)}% Submerged`})`
      : `Venturi Flow at Q = ${flowRateLps.toFixed(2)} L/s (${calc.f.name})`;

    const metrics = apparatusMode === "buoyancy" ? {
      "Liquid Medium": calc.f.name,
      "Fluid Density (kg/m³)": `${calc.f.density}`,
      "Object Material": calc.m.name,
      "Solid Density (kg/m³)": `${calc.m.density}`,
      "Volume (L)": `${blockVolumeLiters.toFixed(2)}`,
      "Submersion (%)": `${calc.effectiveSubmersion.toFixed(0)}%`,
      "Displaced Vol (L)": `${(calc.dispVolM3 * 1000).toFixed(2)}`,
      "Displaced Mass (kg)": `${calc.massDispKg.toFixed(3)}`,
      "Buoyant Force Fb (N)": `${calc.fbN.toFixed(2)}`,
      "Real Weight (N)": `${calc.weightRealN.toFixed(2)}`,
      "Apparent Weight (N)": `${calc.weightAppN.toFixed(2)}`
    } : {
      "Volumetric Flow Q (L/s)": `${flowRateLps.toFixed(2)}`,
      "Wide Pipe v₁ (m/s)": `${calc.v1.toFixed(2)}`,
      "Constriction v₂ (m/s)": `${calc.v2.toFixed(2)}`,
      "Pressure Drop ΔP (kPa)": `${(calc.deltaP / 1000).toFixed(2)}`,
      "Manometer Head Δh (cm)": `${(calc.deltaH * 100).toFixed(1)}`
    };

    LabTrialStore.addTrial("fluids", {
      summary: trialSummary,
      metrics
    });

    SoundFX.playSuccess();
    showToast("Trial Recorded", trialSummary, "success");
  });

  // Lab Report Modal Generator
  container.querySelector("#btn-fluid-report")?.addEventListener("click", () => {
    const calc = getCalculations();
    const trials = LabTrialStore.getTrials("fluids");

    openLabReportModal({
      title: "Fluid Dynamics, Archimedes Buoyancy & Bernoulli Suite",
      labId: "fluids",
      subject: "Physics",
      inquiryQuestion: "How do fluid density and displaced volume govern buoyant force, and how does pipe cross-sectional geometry govern fluid velocity and pressure heads in Venturi flow?",
      apparatusConfig: {
        "Apparatus Mode": apparatusMode === "buoyancy" ? "Archimedes Overflow Tank" : "Venturi Constriction Pipe",
        "Fluid Medium": `${calc.f.name} (ρ = ${calc.f.density} kg/m³)`,
        "Solid Material": `${calc.m.name} (ρ = ${calc.m.density} kg/m³)`,
        "Solid Volume": `${blockVolumeLiters.toFixed(2)} L`,
        "Submersion Depth": `${calc.effectiveSubmersion.toFixed(1)}%`,
        "Free Floating State": isFreeFloating ? (calc.canFloat ? "Equilibrium Floating" : "Sunk to Floor") : "Suspended from Scale",
        "Flow Rate (Venturi)": `${flowRateLps.toFixed(2)} L/s`
      },
      trials,
      formulas: [
        "F_b = \\rho_{\\text{fluid}} \\cdot V_{\\text{disp}} \\cdot g",
        "W_{\\text{app}} = W_{\\text{real}} - F_b = (\\rho_{\\text{solid}} - \\rho_{\\text{fluid}}) V g",
        "\\frac{V_{\\text{disp}}}{V} = \\frac{\\rho_{\\text{solid}}}{\\rho_{\\text{fluid}}} \\quad (\\text{Floating Equilibrium})",
        "A_1 v_1 = A_2 v_2 \\quad (\\text{Mass Continuity})",
        "P_1 + \\frac{1}{2}\\rho v_1^2 = P_2 + \\frac{1}{2}\\rho v_2^2 \\quad (\\text{Bernoulli Equation})",
        "\\Delta h = \\frac{v_2^2 - v_1^2}{2g} \\quad (\\text{Differential Manometer Head})"
      ]
    });
    SoundFX.playClick();
  });

  // Export CSV
  container.querySelector("#btn-fluid-export")?.addEventListener("click", () => {
    const calc = getCalculations();
    exportLabDataCsv({
      title: "Archimedes Buoyancy & Fluid Dynamics Telemetry",
      labId: "fluids",
      parameters: {
        "Apparatus Mode": apparatusMode.toUpperCase(),
        "Liquid Medium": calc.f.name,
        "Fluid Density (kg/m³)": calc.f.density,
        "Object Material": calc.m.name,
        "Solid Density (kg/m³)": calc.m.density,
        "Object Volume (L)": blockVolumeLiters
      },
      headers: ["Submersion (%)", "Displaced Vol (L)", "Displaced Mass (kg)", "Buoyant Force Fb (N)", "Apparent Weight (N)"],
      dataRows: [0, 25, 50, 75, 100].map(sub => {
        const dVol = (blockVolumeLiters * 1e-3) * (sub / 100);
        const mDisp = calc.f.density * dVol;
        const fb = mDisp * g;
        const wApp = Math.max(0, calc.weightRealN - fb);
        return [
          `${sub}%`,
          (dVol * 1000).toFixed(2),
          mDisp.toFixed(3),
          fb.toFixed(2),
          wApp.toFixed(2)
        ];
      })
    });
    SoundFX.playClick();
  });

  // 4K Photo View Switcher
  const btnFluidsSim = container.querySelector("#view-mode-fluids-sim");
  const btnFluidsPhoto = container.querySelector("#view-mode-fluids-photo");
  const fluidsPhotoOverlay = container.querySelector("#fluids-photo-overlay");

  btnFluidsSim?.addEventListener("click", () => {
    btnFluidsSim.classList.add("active");
    btnFluidsSim.style.background = "";
    btnFluidsPhoto.classList.remove("active");
    btnFluidsPhoto.style.background = "transparent";
    if (fluidsPhotoOverlay) fluidsPhotoOverlay.style.display = "none";
    SoundFX.playClick();
  });

  btnFluidsPhoto?.addEventListener("click", () => {
    btnFluidsPhoto.classList.add("active");
    btnFluidsPhoto.style.background = "";
    btnFluidsSim.classList.remove("active");
    btnFluidsSim.style.background = "transparent";
    if (fluidsPhotoOverlay) fluidsPhotoOverlay.style.display = "block";
    SoundFX.playClick();
  });

  // Mount Assessment
  mountLabCheckpoint("fluids-checkpoint-container", "fluids");

  // Launch Loop
  loop();

  // Return Unmount Cleanup Hook
  _currentFluidsCleanup = function cleanup() {
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

  return _currentFluidsCleanup;
}
