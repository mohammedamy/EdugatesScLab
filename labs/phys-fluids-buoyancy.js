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

  // Venturi Tracer Streamline Particles (LDV Fluid Tracers)
  const venturiParticles = [];
  for (let i = 0; i < 48; i++) {
    venturiParticles.push({
      x: 35 + Math.random() * 530,
      yFrac: -0.78 + Math.random() * 1.56,
      speedFactor: 0.88 + Math.random() * 0.24,
      size: 1.6 + Math.random() * 1.4,
      brightness: 0.7 + Math.random() * 0.3
    });
  }

  // Ambient Micro-Bubbles in Fluid Tank
  const ambientBubbles = [];
  for (let i = 0; i < 22; i++) {
    ambientBubbles.push({
      x: 10 + Math.random() * 190,
      y: 10 + Math.random() * 210,
      r: 0.8 + Math.random() * 1.6,
      speed: 0.35 + Math.random() * 0.55,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleSpeed: 1.5 + Math.random() * 2.5
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

      if (badgeFloat) {
        badgeFloat.innerText = "Venturi Flow Active";
        badgeFloat.style.color = "#38bdf8";
        badgeFloat.style.background = "rgba(56, 189, 248, 0.15)";
      }
    }
  }

  function getBlockDimensions(volLiters) {
    const scale = Math.cbrt(Math.max(0.1, volLiters) / 1.0);
    return {
      w: Math.round(72 * scale),
      h: Math.round(76 * scale),
      scale
    };
  }

  function drawVectorPill(c, x, y, text, color, align = "center") {
    c.save();
    c.font = "bold 10px var(--font-mono, monospace)";
    const textWidth = c.measureText(text).width;
    const pillW = textWidth + 22;
    const pillH = 20;
    let pillX = x;
    if (align === "center") pillX = x - pillW / 2;
    else if (align === "right") pillX = x - pillW;
    const pillY = y - pillH / 2;

    c.fillStyle = "rgba(15, 23, 42, 0.92)";
    c.strokeStyle = color;
    c.lineWidth = 1.3;
    c.beginPath();
    c.roundRect(pillX, pillY, pillW, pillH, 10);
    c.fill();
    c.stroke();

    c.fillStyle = color;
    c.beginPath();
    c.arc(pillX + 8, y, 3, 0, Math.PI * 2);
    c.fill();

    c.fillStyle = "#f8fafc";
    c.textAlign = "left";
    c.textBaseline = "middle";
    c.fillText(text, pillX + 15, y);
    c.restore();
  }

  function drawCoiledSpring(c, startX, startY, endY, numCoils = 6, coilRadius = 6) {
    c.save();
    c.lineWidth = 2.2;
    c.strokeStyle = "#94a3b8";
    c.lineCap = "round";
    c.lineJoin = "round";
    c.beginPath();
    c.moveTo(startX, startY);
    const lead = 3;
    c.lineTo(startX, startY + lead);
    const coilH = endY - startY - lead * 2;
    const totalSteps = numCoils * 10;
    for (let s = 1; s <= totalSteps; s++) {
      const t = s / totalSteps;
      const y = startY + lead + t * coilH;
      const x = startX + Math.sin(t * numCoils * Math.PI * 2) * coilRadius;
      c.lineTo(x, y);
    }
    c.lineTo(startX, endY);
    c.stroke();

    // Specular highlight gleam on spring wire
    c.lineWidth = 0.9;
    c.strokeStyle = "rgba(255, 255, 255, 0.6)";
    c.beginPath();
    for (let s = 2; s < totalSteps; s += 10) {
      const t = s / totalSteps;
      const y = startY + lead + t * coilH;
      const x = startX + Math.sin(t * numCoils * Math.PI * 2) * coilRadius;
      c.moveTo(x - 1.5, y);
      c.lineTo(x + 1.5, y);
    }
    c.stroke();
    c.restore();
  }

  function drawBuoyancyApparatus() {
    const canvasWidth = canvas.getBoundingClientRect().width || 620;
    const canvasHeight = 530;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    const calc = getCalculations();

    if (apparatusMode === "buoyancy") {
      // Coordinate layout
      const scaleX = Math.round(canvasWidth * 0.40);
      const scaleY = 32;

      // Tabletop Bench Surface
      const benchY = 485;
      const benchGrad = ctx.createLinearGradient(0, benchY, 0, canvasHeight);
      benchGrad.addColorStop(0, "#0f172a");
      benchGrad.addColorStop(0.12, "#1e293b");
      benchGrad.addColorStop(1, "#090d16");
      ctx.fillStyle = benchGrad;
      ctx.fillRect(0, benchY, canvasWidth, canvasHeight - benchY);

      ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, benchY);
      ctx.lineTo(canvasWidth, benchY);
      ctx.stroke();

      // Main Overflow Tank Geometry
      const tankX = scaleX - 105;
      const tankY = 175;
      const tankW = 210;
      const tankH = 270;
      const waterSurfaceY = tankY + 50;
      const tankFloorY = tankY + tankH - 6;

      // 1. Heavy Retort Stand (Upright Rod & Base holding the scale)
      const standX = tankX - 16;
      // Heavy cast-iron bench clamp base
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(standX - 20, benchY - 8, 40, 10, 3);
      ctx.fill();
      ctx.stroke();

      // Stainless steel vertical upright rod
      const rodGrad = ctx.createLinearGradient(standX - 4, 0, standX + 4, 0);
      rodGrad.addColorStop(0, "#334155");
      rodGrad.addColorStop(0.35, "#f1f5f9");
      rodGrad.addColorStop(0.7, "#94a3b8");
      rodGrad.addColorStop(1, "#1e293b");
      ctx.fillStyle = rodGrad;
      ctx.fillRect(standX - 3.5, 18, 7, benchY - 26);

      // Bosshead clamp at scale top
      const clampY = 24;
      ctx.fillStyle = "#0f172a";
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(standX - 6, clampY - 5, 12, 14, 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(standX - 10, clampY - 1, 4, 4);

      // Horizontal chrome support arm extending to scaleX
      const armGrad = ctx.createLinearGradient(0, clampY - 2.5, 0, clampY + 2.5);
      armGrad.addColorStop(0, "#f8fafc");
      armGrad.addColorStop(0.5, "#94a3b8");
      armGrad.addColorStop(1, "#334155");
      ctx.fillStyle = armGrad;
      ctx.fillRect(standX + 6, clampY - 2.5, (scaleX - standX) + 12, 5);

      // Suspension collar ring holding dynamometer top
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(scaleX, clampY + 4, 4.5, 0, Math.PI * 2);
      ctx.stroke();

      // 2. Precision Laboratory Dynamometer (Spring Scale)
      const dynW = 72;
      const dynH = 92;
      const dynX = scaleX - dynW / 2;

      // Outer Casing: brushed navy/slate polycarbonate housing
      const caseGrad = ctx.createLinearGradient(dynX, scaleY, dynX + dynW, scaleY);
      caseGrad.addColorStop(0, "#1e293b");
      caseGrad.addColorStop(0.5, "#334155");
      caseGrad.addColorStop(1, "#1e293b");
      ctx.fillStyle = caseGrad;
      ctx.strokeStyle = isFreeFloating ? "#475569" : "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(dynX, scaleY, dynW, dynH, 8);
      ctx.fill();
      ctx.stroke();

      // Top mounting eyelet on dynamometer
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(scaleX, scaleY, 5, Math.PI, 0);
      ctx.stroke();

      // Recessed Transparent Measurement Window
      const winX = scaleX - 22;
      const winY = scaleY + 10;
      const winW = 44;
      const winH = 50;

      ctx.fillStyle = "#090d16";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(winX, winY, winW, winH, 4);
      ctx.fill();
      ctx.stroke();

      // Calibrated Newton Scale Markings (0 to 30 N)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "7px var(--font-mono, monospace)";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      for (let n = 0; n <= 30; n += 5) {
        const tickY = winY + 4 + (n / 30.0) * (winH - 8);
        ctx.beginPath();
        ctx.moveTo(winX + 2, tickY);
        ctx.lineTo(winX + (n % 10 === 0 ? 8 : 5), tickY);
        ctx.stroke();
        if (n % 10 === 0) {
          ctx.fillText(`${n}`, winX + 10, tickY);
        }
      }

      // Physical Coiled Spring
      const springTopY = winY + 4;
      const maxStretch = 30;
      const stretch = isFreeFloating ? 0 : Math.min(maxStretch, (calc.weightAppN / 30.0) * maxStretch);
      const springEndY = springTopY + 12 + stretch;

      drawCoiledSpring(ctx, scaleX + 8, springTopY, springEndY, 6, 6);

      // Indicator Pointer at bottom of spring
      ctx.fillStyle = isFreeFloating ? "#64748b" : "#ef4444";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(scaleX + 8, springEndY);
      ctx.lineTo(winX + 4, springEndY);
      ctx.lineTo(winX + 7, springEndY - 3);
      ctx.lineTo(winX + 7, springEndY + 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Pointer central rod extending through bottom of housing
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(scaleX, springEndY);
      ctx.lineTo(scaleX, scaleY + dynH);
      ctx.stroke();

      // Bottom Suspension Hook
      const bottomHookY = scaleY + dynH + 4;
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(scaleX, bottomHookY, 4.5, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();

      // Digital OLED Display Window at bottom of scale
      const oledX = scaleX - 26;
      const oledY = scaleY + 66;
      const oledW = 52;
      const oledH = 18;

      ctx.fillStyle = "#020617";
      ctx.strokeStyle = isFreeFloating ? "#334155" : "rgba(16, 185, 129, 0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(oledX, oledY, oledW, oledH, 3);
      ctx.fill();
      ctx.stroke();

      ctx.font = "bold 9.5px var(--font-mono, monospace)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (isFreeFloating) {
        ctx.fillStyle = "#64748b";
        ctx.fillText("0.00 N", scaleX, oledY + 9);
      } else {
        ctx.fillStyle = "#10b981";
        ctx.fillText(`${calc.weightAppN.toFixed(2)} N`, scaleX, oledY + 9);
      }

      // 3. Main Overflow Tank with Borosilicate Glass & Spout
      const spoutTipX = tankX + tankW + 42;
      const spoutTipY = waterSurfaceY + 22;

      // Tank Body Glass Backdrop
      ctx.fillStyle = "rgba(15, 23, 42, 0.82)";
      ctx.fillRect(tankX, tankY, tankW, tankH);

      // Fluid in main tank up to spout level with depth gradient
      const fluidDepthGrad = ctx.createLinearGradient(0, waterSurfaceY, 0, tankY + tankH);
      fluidDepthGrad.addColorStop(0, calc.f.color);
      fluidDepthGrad.addColorStop(1, "rgba(10, 45, 75, 0.88)");
      ctx.fillStyle = fluidDepthGrad;
      ctx.fillRect(tankX + 4, waterSurfaceY, tankW - 8, tankH - (waterSurfaceY - tankY) - 4);

      // Fluid inside spout neck
      ctx.fillStyle = calc.f.color;
      ctx.beginPath();
      ctx.moveTo(tankX + tankW - 4, waterSurfaceY);
      ctx.lineTo(spoutTipX, spoutTipY);
      ctx.lineTo(spoutTipX, spoutTipY + 8);
      ctx.lineTo(tankX + tankW - 4, waterSurfaceY + 12);
      ctx.closePath();
      ctx.fill();

      // Ambient Rising Micro-Bubbles in Fluid
      ctx.save();
      ambientBubbles.forEach(b => {
        b.y -= b.speed;
        if (b.y < waterSurfaceY + 4) {
          b.y = tankY + tankH - 12;
          b.x = 10 + Math.random() * (tankW - 20);
        }
        const curX = tankX + b.x + Math.sin(simTime * b.wobbleSpeed + b.wobblePhase) * 1.5;
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.beginPath();
        ctx.arc(curX, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.beginPath();
        ctx.arc(curX - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.35, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

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

      // Tank Outer Glass Contour & Molded Spout
      ctx.strokeStyle = "rgba(255, 255, 255, 0.42)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(tankX, tankY);
      ctx.lineTo(tankX, tankY + tankH);
      ctx.lineTo(tankX + tankW, tankY + tankH);
      ctx.lineTo(tankX + tankW, waterSurfaceY + 12);
      ctx.lineTo(spoutTipX, spoutTipY + 8);
      ctx.lineTo(spoutTipX, spoutTipY);
      ctx.lineTo(tankX + tankW, waterSurfaceY);
      ctx.lineTo(tankX + tankW, tankY);
      ctx.stroke();

      // Inner glass refraction line
      ctx.strokeStyle = "rgba(56, 189, 248, 0.16)";
      ctx.lineWidth = 1.2;
      ctx.strokeRect(tankX + 3, tankY + 3, tankW - 6, tankH - 6);

      // Heavy glass bottom plate
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(tankX - 4, tankY + tankH, tankW + 8, 6, 2);
      ctx.fill();
      ctx.stroke();

      // Enameled White Graduated Volume Markings on Glass Wall
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
      ctx.lineWidth = 1.2;
      ctx.font = "8px var(--font-mono, monospace)";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      const volLabels = ["2000 mL", "1500 mL", "1000 mL", "500 mL"];
      let vIdx = 0;
      for (let y = waterSurfaceY + 25; y < tankY + tankH - 25; y += 45) {
        ctx.beginPath();
        ctx.moveTo(tankX + 4, y);
        ctx.lineTo(tankX + 16, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(tankX + 4, y + 22.5);
        ctx.lineTo(tankX + 10, y + 22.5);
        ctx.stroke();
        if (vIdx < volLabels.length) {
          ctx.fillText(volLabels[vIdx], tankX + 20, y);
          vIdx++;
        }
      }

      // 4. Overflow Catch Beaker on Tare Balance (Right side)
      const catchX = tankX + tankW + 35;
      const catchY = tankY + 120;
      const catchW = 80;
      const catchH = 145;

      ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
      ctx.fillRect(catchX, catchY, catchW, catchH);

      const maxCatchVolL = 3.2;
      const curDispVolL = calc.dispVolM3 * 1000;
      const dispLiquidHeight = Math.min(catchH - 12, (curDispVolL / maxCatchVolL) * (catchH - 20));

      if (dispLiquidHeight > 1) {
        const catchFluidGrad = ctx.createLinearGradient(0, catchY + catchH - dispLiquidHeight, 0, catchY + catchH);
        catchFluidGrad.addColorStop(0, calc.f.color);
        catchFluidGrad.addColorStop(1, "rgba(10, 45, 75, 0.9)");
        ctx.fillStyle = catchFluidGrad;
        ctx.fillRect(catchX + 3, catchY + catchH - dispLiquidHeight, catchW - 6, dispLiquidHeight);

        ctx.strokeStyle = calc.f.surfaceColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(catchX + 3, catchY + catchH - dispLiquidHeight);
        ctx.lineTo(catchX + catchW - 3, catchY + catchH - dispLiquidHeight);
        ctx.stroke();
      }

      // Catch glass beaker outline
      ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(catchX - 4, catchY - 4);
      ctx.lineTo(catchX, catchY);
      ctx.lineTo(catchX, catchY + catchH);
      ctx.lineTo(catchX + catchW, catchY + catchH);
      ctx.lineTo(catchX + catchW, catchY);
      ctx.stroke();

      // Graduated ticks on catch cylinder
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
      ctx.font = "8px var(--font-mono, monospace)";
      ctx.textAlign = "right";
      for (let volL = 0.5; volL <= 2.5; volL += 0.5) {
        const tickY = catchY + catchH - (volL / maxCatchVolL) * (catchH - 20);
        ctx.beginPath();
        ctx.moveTo(catchX + catchW - 3, tickY);
        ctx.lineTo(catchX + catchW - 12, tickY);
        ctx.stroke();
        if (volL % 1.0 === 0) {
          ctx.fillText(`${volL.toFixed(1)}L`, catchX + catchW - 15, tickY + 3);
        }
      }

      // Animated Parabolic Overflow Pouring Stream
      if (calc.effectiveSubmersion > 0.5) {
        ctx.save();
        const streamTargetX = catchX + catchW * 0.45;
        const streamTargetY = catchY + catchH - Math.max(8, dispLiquidHeight);

        // Fluid stream arc
        ctx.strokeStyle = calc.f.color;
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(spoutTipX, spoutTipY + 4);
        ctx.quadraticCurveTo(
          spoutTipX + 16,
          spoutTipY + 28,
          streamTargetX,
          streamTargetY
        );
        ctx.stroke();

        // Highlight core stream
        ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Animated traveling droplets
        for (let k = 0; k < 3; k++) {
          const dropT = ((simTime * 3.5) + k * 0.33) % 1.0;
          const cpX = spoutTipX + 16;
          const cpY = spoutTipY + 28;
          const dx = (1 - dropT) * (1 - dropT) * spoutTipX + 2 * (1 - dropT) * dropT * cpX + dropT * dropT * streamTargetX;
          const dy = (1 - dropT) * (1 - dropT) * (spoutTipY + 4) + 2 * (1 - dropT) * dropT * cpY + dropT * dropT * streamTargetY;
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(dx, dy, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Impact ripples at beaker liquid surface
        const splashPhase = (simTime * 5) % 1.0;
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.7 * (1 - splashPhase)})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(streamTargetX, streamTargetY, 4 + splashPhase * 8, 1.5 + splashPhase * 3, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      // Precision Digital Tare Balance Base
      const balX = catchX - 10;
      const balY = catchY + catchH;
      const balW = catchW + 20;
      const balH = 26;

      // Stainless steel pan
      const panGrad = ctx.createLinearGradient(balX, balY, balX + balW, balY);
      panGrad.addColorStop(0, "#94a3b8");
      panGrad.addColorStop(0.5, "#f1f5f9");
      panGrad.addColorStop(1, "#64748b");
      ctx.fillStyle = panGrad;
      ctx.beginPath();
      ctx.roundRect(balX + 4, balY, balW - 8, 4, 1);
      ctx.fill();

      // Scale chassis
      ctx.fillStyle = "#0f172a";
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(balX, balY + 4, balW, balH - 4, [0, 0, 6, 6]);
      ctx.fill();
      ctx.stroke();

      // Rubber feet
      ctx.fillStyle = "#020617";
      ctx.fillRect(balX + 4, balY + balH, 8, 3);
      ctx.fillRect(balX + balW - 12, balY + balH, 8, 3);

      // OLED screen
      ctx.fillStyle = "#020617";
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(balX + 8, balY + 7, balW - 16, 14, 3);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 9px var(--font-mono, monospace)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const dispMassG = (calc.massDispKg * 1000).toFixed(0);
      ctx.fillText(`${dispMassG} g (${calc.fbN.toFixed(2)} N)`, balX + balW / 2, balY + 14);

      // 5. Immersed Solid Block with Responsive Volumetric Sizing
      const blockDim = getBlockDimensions(blockVolumeLiters);
      const blockW = blockDim.w;
      const blockH = blockDim.h;

      let blockBottomTargetY = waterSurfaceY + (calc.effectiveSubmersion / 100.0) * blockH;
      let blockY = blockBottomTargetY - blockH;

      // Sinking to tank floor when free-floating and denser than fluid
      if (isFreeFloating && !calc.canFloat) {
        blockY = tankFloorY - blockH;
        blockBottomTargetY = tankFloorY;
      }
      const blockX = scaleX - blockW / 2;

      // Suspension wire from scale to block
      if (!isFreeFloating) {
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(scaleX, bottomHookY + 4);
        ctx.lineTo(scaleX, blockY - 8);
        ctx.stroke();

        ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(scaleX, bottomHookY + 4);
        ctx.lineTo(scaleX, blockY - 8);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // Disconnected wire segment at hook
        ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(scaleX, bottomHookY + 4);
        ctx.quadraticCurveTo(scaleX + 4, bottomHookY + 10, scaleX, bottomHookY + 14);
        ctx.stroke();
      }

      // Top suspension eye-bolt bracket on block
      ctx.fillStyle = "#64748b";
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(scaleX - 10, blockY - 3, 20, 4, 1);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(scaleX, blockY - 8, 5, 0, Math.PI * 2);
      ctx.stroke();

      // Authentic Material Shaders
      if (materialKey === "wood") {
        const woodGrad = ctx.createLinearGradient(blockX, blockY, blockX + blockW, blockY + blockH);
        woodGrad.addColorStop(0, "#d97706");
        woodGrad.addColorStop(0.3, "#b45309");
        woodGrad.addColorStop(0.7, "#92400e");
        woodGrad.addColorStop(1, "#78350f");
        ctx.fillStyle = woodGrad;
        ctx.beginPath();
        ctx.roundRect(blockX, blockY, blockW, blockH, 5);
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(blockX, blockY, blockW, blockH, 5);
        ctx.clip();
        ctx.strokeStyle = "rgba(69, 26, 3, 0.35)";
        ctx.lineWidth = 1.5;
        for (let gx = blockX + 6; gx < blockX + blockW; gx += 10) {
          ctx.beginPath();
          ctx.moveTo(gx, blockY);
          ctx.bezierCurveTo(
            gx + Math.sin(gx) * 6, blockY + blockH * 0.35,
            gx - Math.cos(gx) * 6, blockY + blockH * 0.7,
            gx + 2, blockY + blockH
          );
          ctx.stroke();
        }
        ctx.strokeStyle = "rgba(69, 26, 3, 0.4)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(blockX + blockW * 0.7, blockY + blockH * 0.4, 5, 9, 0.2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (materialKey === "ice") {
        const iceGrad = ctx.createLinearGradient(blockX, blockY, blockX + blockW, blockY + blockH);
        iceGrad.addColorStop(0, "rgba(224, 242, 254, 0.92)");
        iceGrad.addColorStop(0.5, "rgba(186, 230, 253, 0.8)");
        iceGrad.addColorStop(1, "rgba(125, 211, 252, 0.88)");
        ctx.fillStyle = iceGrad;
        ctx.beginPath();
        ctx.roundRect(blockX, blockY, blockW, blockH, 5);
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(blockX, blockY, blockW, blockH, 5);
        ctx.clip();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(blockX + 8, blockY + 12);
        ctx.lineTo(blockX + blockW * 0.4, blockY + blockH * 0.45);
        ctx.lineTo(blockX + blockW * 0.35, blockY + blockH * 0.75);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(blockX + blockW * 0.4, blockY + blockH * 0.45);
        ctx.lineTo(blockX + blockW * 0.78, blockY + blockH * 0.3);
        ctx.stroke();
        ctx.restore();
      } else if (materialKey === "aluminum") {
        const alGrad = ctx.createLinearGradient(blockX, blockY, blockX + blockW, blockY + blockH);
        alGrad.addColorStop(0, "#f1f5f9");
        alGrad.addColorStop(0.2, "#cbd5e1");
        alGrad.addColorStop(0.5, "#94a3b8");
        alGrad.addColorStop(0.8, "#64748b");
        alGrad.addColorStop(1, "#94a3b8");
        ctx.fillStyle = alGrad;
        ctx.beginPath();
        ctx.roundRect(blockX, blockY, blockW, blockH, 5);
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(blockX, blockY, blockW, blockH, 5);
        ctx.clip();
        for (let gy = blockY + 4; gy < blockY + blockH; gy += 3) {
          ctx.strokeStyle = (gy % 6 === 0) ? "rgba(255, 255, 255, 0.22)" : "rgba(0, 0, 0, 0.12)";
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(blockX, gy);
          ctx.lineTo(blockX + blockW, gy);
          ctx.stroke();
        }
        const sheenGrad = ctx.createLinearGradient(blockX, blockY, blockX + blockW, blockY + blockH);
        sheenGrad.addColorStop(0, "rgba(255,255,255,0)");
        sheenGrad.addColorStop(0.4, "rgba(255,255,255,0.22)");
        sheenGrad.addColorStop(0.5, "rgba(255,255,255,0.45)");
        sheenGrad.addColorStop(0.6, "rgba(255,255,255,0.15)");
        sheenGrad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = sheenGrad;
        ctx.fillRect(blockX, blockY, blockW, blockH);
        ctx.restore();
      } else if (materialKey === "iron") {
        const ironGrad = ctx.createLinearGradient(blockX, blockY, blockX + blockW, blockY + blockH);
        ironGrad.addColorStop(0, "#475569");
        ironGrad.addColorStop(0.4, "#334155");
        ironGrad.addColorStop(0.8, "#1e293b");
        ironGrad.addColorStop(1, "#0f172a");
        ctx.fillStyle = ironGrad;
        ctx.beginPath();
        ctx.roundRect(blockX, blockY, blockW, blockH, 5);
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(blockX, blockY, blockW, blockH, 5);
        ctx.clip();
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        for (let i = 0; i < 25; i++) {
          const sx = blockX + ((i * 17) % Math.max(1, blockW - 6)) + 3;
          const sy = blockY + ((i * 23) % Math.max(1, blockH - 6)) + 3;
          ctx.fillRect(sx, sy, 1.5, 1.5);
        }
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        for (let i = 0; i < 25; i++) {
          const sx = blockX + ((i * 29) % Math.max(1, blockW - 6)) + 3;
          const sy = blockY + ((i * 19) % Math.max(1, blockH - 6)) + 3;
          ctx.fillRect(sx, sy, 1.5, 1.5);
        }
        ctx.restore();
      } else {
        // Pure Lead
        const leadGrad = ctx.createLinearGradient(blockX, blockY, blockX + blockW, blockY + blockH);
        leadGrad.addColorStop(0, "#64748b");
        leadGrad.addColorStop(0.3, "#475569");
        leadGrad.addColorStop(0.7, "#334155");
        leadGrad.addColorStop(1, "#1e293b");
        ctx.fillStyle = leadGrad;
        ctx.beginPath();
        ctx.roundRect(blockX, blockY, blockW, blockH, 5);
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(blockX, blockY, blockW, blockH, 5);
        ctx.clip();
        const leadSheen = ctx.createRadialGradient(
          blockX + blockW * 0.35, blockY + blockH * 0.35, 2,
          blockX + blockW * 0.35, blockY + blockH * 0.35, blockW * 0.6
        );
        leadSheen.addColorStop(0, "rgba(255, 255, 255, 0.2)");
        leadSheen.addColorStop(1, "rgba(0, 0, 0, 0.15)");
        ctx.fillStyle = leadSheen;
        ctx.fillRect(blockX, blockY, blockW, blockH);
        ctx.restore();
      }

      // Outer bevel chamfer border
      ctx.strokeStyle = calc.m.borderColor;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.roundRect(blockX, blockY, blockW, blockH, 5);
      ctx.stroke();

      // Tactile dragging border when active
      if (isDragging) {
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(scaleX - blockW / 2 - 5, blockY - 5, blockW + 10, blockH + 10);
        ctx.setLineDash([]);
      }

      // Stamped Industrial Specification Plaque
      const plaqueW = Math.max(40, Math.min(blockW - 12, 70));
      const plaqueH = Math.max(26, Math.min(blockH - 14, 40));
      const plaqueX = scaleX - plaqueW / 2;
      const plaqueY = blockY + blockH / 2 - plaqueH / 2;

      ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(plaqueX, plaqueY, plaqueW, plaqueH, 3);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${Math.max(8, Math.min(10, Math.round(10 * blockDim.scale)))}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(calc.m.name.split(" ")[0].toUpperCase(), scaleX, plaqueY + plaqueH * 0.26);

      ctx.fillStyle = "#38bdf8";
      ctx.font = `${Math.max(7, Math.min(9, Math.round(9 * blockDim.scale)))}px var(--font-mono, monospace)`;
      ctx.fillText(`${calc.m.density} kg/m³`, scaleX, plaqueY + plaqueH * 0.54);

      ctx.fillStyle = "#10b981";
      ctx.font = `bold ${Math.max(7, Math.min(9, Math.round(9 * blockDim.scale)))}px var(--font-mono, monospace)`;
      ctx.fillText(`V = ${blockVolumeLiters.toFixed(2)} L`, scaleX, plaqueY + plaqueH * 0.80);

      // Submersion Refraction Tint & Waterline Meniscus
      if (calc.effectiveSubmersion > 0) {
        const subH = Math.min(blockH, (calc.effectiveSubmersion / 100.0) * blockH);
        const subTopY = blockY + blockH - subH;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(blockX, subTopY, blockW, subH, [0, 0, 5, 5]);
        ctx.clip();
        ctx.fillStyle = calc.f.color;
        ctx.fillRect(blockX, subTopY, blockW, subH);

        // Waterline capillary meniscus curve
        ctx.strokeStyle = calc.f.surfaceColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(blockX - 3, subTopY);
        ctx.quadraticCurveTo(blockX + 4, subTopY + 2, blockX + 8, subTopY);
        ctx.lineTo(blockX + blockW - 8, subTopY);
        ctx.quadraticCurveTo(blockX + blockW - 4, subTopY + 2, blockX + blockW + 3, subTopY);
        ctx.stroke();
        ctx.restore();
      }

      // 6. Textbook-Grade Free-Body Force Vectors
      const vecLeftX = scaleX - (blockW / 2 + 32);
      const vecRightX = scaleX + (blockW / 2 + 32);
      const blockCenterY = blockY + blockH / 2;

      // 1. Gravity F_g (Down Red Arrow) starting at center of mass
      const arrowLengthFg = Math.min(85, Math.max(28, calc.weightRealN * 2.2));
      ctx.strokeStyle = "#ef4444";
      ctx.fillStyle = "#ef4444";
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(scaleX, blockCenterY);
      ctx.lineTo(scaleX, blockCenterY + arrowLengthFg);
      ctx.stroke();
      // Arrowhead
      ctx.beginPath();
      ctx.moveTo(scaleX - 5, blockCenterY + arrowLengthFg - 8);
      ctx.lineTo(scaleX + 5, blockCenterY + arrowLengthFg - 8);
      ctx.lineTo(scaleX, blockCenterY + arrowLengthFg);
      ctx.fill();

      drawVectorPill(ctx, scaleX, blockCenterY + arrowLengthFg + 16, `F_g = ${calc.weightRealN.toFixed(1)} N`, "#ef4444", "center");

      // 2. Buoyant Force F_b (Up Cyan Arrow)
      if (calc.fbN > 0.1) {
        const arrowLengthFb = Math.min(85, Math.max(24, calc.fbN * 2.2));
        const subCenterY = blockY + blockH - (calc.effectiveSubmersion / 100 * blockH) / 2;
        ctx.strokeStyle = "#38bdf8";
        ctx.fillStyle = "#38bdf8";
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(vecRightX, subCenterY);
        ctx.lineTo(vecRightX, subCenterY - arrowLengthFb);
        ctx.stroke();
        // Arrowhead
        ctx.beginPath();
        ctx.moveTo(vecRightX - 5, subCenterY - arrowLengthFb + 8);
        ctx.lineTo(vecRightX + 5, subCenterY - arrowLengthFb + 8);
        ctx.lineTo(vecRightX, subCenterY - arrowLengthFb);
        ctx.fill();

        drawVectorPill(ctx, vecRightX, subCenterY - arrowLengthFb - 14, `F_b = ${calc.fbN.toFixed(1)} N`, "#38bdf8", "center");
      }

      // 3. Tension T or Normal Force F_N
      if (!isFreeFloating && calc.weightAppN > 0.1) {
        const arrowLengthT = Math.min(85, Math.max(24, calc.weightAppN * 2.2));
        ctx.strokeStyle = "#f59e0b";
        ctx.fillStyle = "#f59e0b";
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(vecLeftX, blockY);
        ctx.lineTo(vecLeftX, blockY - arrowLengthT);
        ctx.stroke();
        // Arrowhead
        ctx.beginPath();
        ctx.moveTo(vecLeftX - 5, blockY - arrowLengthT + 8);
        ctx.lineTo(vecLeftX + 5, blockY - arrowLengthT + 8);
        ctx.lineTo(vecLeftX, blockY - arrowLengthT);
        ctx.fill();

        drawVectorPill(ctx, vecLeftX, blockY - arrowLengthT - 14, `T = ${calc.weightAppN.toFixed(1)} N`, "#f59e0b", "center");
      } else if (isFreeFloating && !calc.canFloat && calc.normalForceN > 0.1) {
        // Sunk to floor: Normal force F_N from tank bottom
        const arrowLengthFn = Math.min(85, Math.max(24, calc.normalForceN * 2.2));
        const floorContactY = blockY + blockH;
        ctx.strokeStyle = "#10b981";
        ctx.fillStyle = "#10b981";
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(vecLeftX, floorContactY);
        ctx.lineTo(vecLeftX, floorContactY - arrowLengthFn);
        ctx.stroke();
        // Arrowhead
        ctx.beginPath();
        ctx.moveTo(vecLeftX - 5, floorContactY - arrowLengthFn + 8);
        ctx.lineTo(vecLeftX + 5, floorContactY - arrowLengthFn + 8);
        ctx.lineTo(vecLeftX, floorContactY - arrowLengthFn);
        ctx.fill();

        drawVectorPill(ctx, vecLeftX, floorContactY - arrowLengthFn - 14, `F_N = ${calc.normalForceN.toFixed(1)} N`, "#10b981", "center");
      }
    } else {
      // Venturi Flow Tube Mode
      drawVenturiTube(canvasWidth);
    }
  }

  function drawVenturiTube(canvasWidth) {
    const canvasHeight = 530;
    const calc = getCalculations();
    const py = 290; // Pipe horizontal centerline
    const x0 = 35;
    const x5 = canvasWidth - 35;

    // ASME Venturi Hydrodynamic Stations
    const x1 = 180; // End of inlet section
    const x2 = 255; // End of convergent contraction (start of throat)
    const x3 = 330; // End of parallel throat (start of diffuser)
    const x4 = 460; // End of divergent diffuser expansion

    const R1 = 48; // Wide section radius (D1 = 60 mm)
    const R2 = 22; // Constricted throat radius (D2 = 30 mm)

    function getLocalRadius(x) {
      if (x <= x1) return R1;
      if (x >= x1 && x <= x2) {
        const t = (x - x1) / (x2 - x1);
        const ease = (1 - Math.cos(t * Math.PI)) / 2;
        return R1 * (1 - ease) + R2 * ease;
      }
      if (x > x2 && x < x3) return R2;
      if (x >= x3 && x <= x4) {
        const t = (x - x3) / (x4 - x3);
        const ease = (1 - Math.cos(t * Math.PI)) / 2;
        return R2 * (1 - ease) + R1 * ease;
      }
      return R1;
    }

    // 1. Laboratory Tabletop Bench Surface at Bottom
    const benchY = 485;
    const benchGrad = ctx.createLinearGradient(0, benchY, 0, canvasHeight);
    benchGrad.addColorStop(0, "#0f172a");
    benchGrad.addColorStop(0.12, "#1e293b");
    benchGrad.addColorStop(1, "#090d16");
    ctx.fillStyle = benchGrad;
    ctx.fillRect(0, benchY, canvasWidth, canvasHeight - benchY);

    ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, benchY);
    ctx.lineTo(canvasWidth, benchY);
    ctx.stroke();

    // 2. Anodized Aluminum Pipe Mounting Support Saddles
    const saddlePositions = [x0 + 75, x5 - 75];
    saddlePositions.forEach(sx => {
      // Base clamp
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(sx - 16, benchY - 14, 32, 16, 2);
      ctx.fill();
      ctx.stroke();

      // Vertical support pillar
      const pilGrad = ctx.createLinearGradient(sx - 5, 0, sx + 5, 0);
      pilGrad.addColorStop(0, "#334155");
      pilGrad.addColorStop(0.35, "#f1f5f9");
      pilGrad.addColorStop(0.7, "#94a3b8");
      pilGrad.addColorStop(1, "#1e293b");
      ctx.fillStyle = pilGrad;
      ctx.fillRect(sx - 4, py + R1 + 4, 8, (benchY - 14) - (py + R1 + 4));

      // Saddle bracket ring around pipe
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(sx, py, R1 + 3, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    });

    // 3. Piezometer Manometer Board & Glass Tubes
    const m1X = 145; // Inlet static tap (safely centered in inlet section)
    const m2X = Math.round((x2 + x3) / 2); // 292: Throat tap (exact center of constricted throat)
    const pipeTop1 = py - R1; // 242
    const pipeTop2 = py - R2; // 268

    const boardTopY = 70;
    const boardH = 175;

    // Aluminum scale backboard
    const boardX = m1X - 28;
    const boardW = (m2X - m1X) + 95;
    ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(boardX, boardTopY, boardW, boardH, 6);
    ctx.fill();
    ctx.stroke();

    // Millimeter graduations on backboard
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "7.5px var(--font-mono, monospace)";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    for (let mm = 0; mm <= 300; mm += 25) {
      const ty = (boardTopY + boardH - 10) - (mm / 300) * (boardH - 25);
      ctx.beginPath();
      ctx.moveTo(boardX + 6, ty);
      ctx.lineTo(boardX + (mm % 50 === 0 ? 16 : 10), ty);
      ctx.stroke();
      if (mm % 50 === 0) {
        ctx.fillText(`${mm}`, boardX + 18, ty);
      }
    }

    // Reference Datum & Water Levels in Tubes
    // Tube 1 (Inlet): High static head
    const col1H = 135;
    const y1 = (boardTopY + boardH - 10) - col1H;

    // Tube 2 (Throat): Low static head (Bernoulli depression Δh)
    // Scale visual differential smoothly with flow rate
    const headScale = Math.min(105, (calc.deltaH / 0.45) * 88);
    const col2H = Math.max(18, col1H - headScale);
    const y2 = (boardTopY + boardH - 10) - col2H;

    // Brass/Chrome Pressure Tap Fittings at pipe wall
    [ { x: m1X, topY: pipeTop1 }, { x: m2X, topY: pipeTop2 } ].forEach(tap => {
      ctx.fillStyle = "#f59e0b";
      ctx.strokeStyle = "#b45309";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(tap.x - 9, tap.topY - 6, 18, 7, 1);
      ctx.fill();
      ctx.stroke();
    });

    // Manometer Glass Tubes
    const tubeW = 16;
    [ { x: m1X, topY: pipeTop1, yLvl: y1 }, { x: m2X, topY: pipeTop2, yLvl: y2 } ].forEach(tube => {
      const tx = tube.x - tubeW / 2;
      const tH = tube.topY - boardTopY;

      // Tube Glass Background
      ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
      ctx.fillRect(tx, boardTopY, tubeW, tH);

      // Liquid in Tube
      const fluidH = tube.topY - tube.yLvl;
      if (fluidH > 0) {
        const tubeFluidGrad = ctx.createLinearGradient(0, tube.yLvl, 0, tube.topY);
        tubeFluidGrad.addColorStop(0, calc.f.surfaceColor);
        tubeFluidGrad.addColorStop(1, calc.f.color);
        ctx.fillStyle = tubeFluidGrad;
        ctx.fillRect(tx + 2, tube.yLvl, tubeW - 4, fluidH);

        // Meniscus curve
        ctx.strokeStyle = calc.f.surfaceColor;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(tube.x, tube.yLvl, (tubeW - 4) / 2, 2.5, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Glass Tube Outer Borders & Rounded Top
      ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(tx, tube.topY);
      ctx.lineTo(tx, boardTopY + 4);
      ctx.arc(tube.x, boardTopY + 4, tubeW / 2, Math.PI, 0);
      ctx.lineTo(tx + tubeW, tube.topY);
      ctx.stroke();
    });

    // Differential Head Δh Indicator & Pill Badge
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    // Horizontal projection line from Tube 1 to Tube 2
    ctx.beginPath();
    ctx.moveTo(m1X + tubeW / 2, y1);
    ctx.lineTo(m2X + 28, y1);
    ctx.moveTo(m2X + tubeW / 2, y2);
    ctx.lineTo(m2X + 28, y2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Double-headed vertical dimension arrow
    const dimX = m2X + 24;
    ctx.beginPath();
    ctx.moveTo(dimX, y1);
    ctx.lineTo(dimX, y2);
    ctx.stroke();
    // Arrowheads
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.moveTo(dimX - 4, y1 + 6);
    ctx.lineTo(dimX + 4, y1 + 6);
    ctx.lineTo(dimX, y1);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(dimX - 4, y2 - 6);
    ctx.lineTo(dimX + 4, y2 - 6);
    ctx.lineTo(dimX, y2);
    ctx.fill();

    // Callout Pill Badge for Δh
    const badgeDeltaH_X = m2X + 34;
    const badgeDeltaH_Y = (y1 + y2) / 2;
    drawVectorPill(ctx, badgeDeltaH_X + 44, badgeDeltaH_Y, `Δh = ${(calc.deltaH * 100).toFixed(1)} cm`, "#facc15", "center");

    // Energy Grade Line (EGL) & Hydraulic Grade Line (HGL)
    const yEGL = y1 - 12; // Total energy datum
    ctx.strokeStyle = "rgba(245, 158, 11, 0.75)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(m1X - 20, yEGL);
    ctx.lineTo(x4 + 40, yEGL);
    ctx.stroke();
    ctx.fillStyle = "#f59e0b";
    ctx.font = "bold 8px var(--font-mono, monospace)";
    ctx.fillText("EGL (Total Energy)", x4 + 44, yEGL + 3);

    // HGL (Hydraulic Grade Line - traces piezometric pressure head)
    ctx.strokeStyle = "rgba(56, 189, 248, 0.75)";
    ctx.lineWidth = 1.8;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(m1X - 20, y1);
    ctx.lineTo(x1, y1);
    ctx.bezierCurveTo(x1 + 35, y1, x2 - 25, y2, x2, y2);
    ctx.lineTo(x3, y2);
    ctx.bezierCurveTo(x3 + 45, y2, x4 - 35, y1 + 6, x4, y1 + 6);
    ctx.lineTo(x4 + 40, y1 + 6);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("HGL (Piezometric Head)", x4 + 44, y1 + 9);

    // 4. Hydrodynamic Venturi Tube Body
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x0, py - R1);
    for (let x = x0; x <= x5; x += 3) {
      ctx.lineTo(x, py - getLocalRadius(x));
    }
    ctx.lineTo(x5, py + R1);
    for (let x = x5; x >= x0; x -= 3) {
      ctx.lineTo(x, py + getLocalRadius(x));
    }
    ctx.closePath();

    // Fluid Body Fill
    ctx.fillStyle = calc.f.color;
    ctx.fill();

    // Dynamic Bernoulli Pressure Isobar Gradient
    const pressGrad = ctx.createLinearGradient(x0, 0, x5, 0);
    pressGrad.addColorStop(0, "rgba(56, 189, 248, 0.22)");
    pressGrad.addColorStop(0.3, "rgba(56, 189, 248, 0.15)");
    pressGrad.addColorStop(0.48, "rgba(2, 132, 199, 0.02)"); // Low pressure in throat
    pressGrad.addColorStop(0.72, "rgba(56, 189, 248, 0.14)");
    pressGrad.addColorStop(1, "rgba(56, 189, 248, 0.20)");
    ctx.fillStyle = pressGrad;
    ctx.fill();

    // 3D Cylindrical Specular Glare across glass tube
    const specGrad = ctx.createLinearGradient(0, py - R1, 0, py + R1);
    specGrad.addColorStop(0, "rgba(255, 255, 255, 0.22)");
    specGrad.addColorStop(0.18, "rgba(255, 255, 255, 0.42)");
    specGrad.addColorStop(0.38, "rgba(255, 255, 255, 0.04)");
    specGrad.addColorStop(0.78, "rgba(0, 0, 0, 0.14)");
    specGrad.addColorStop(1, "rgba(0, 0, 0, 0.32)");
    ctx.fillStyle = specGrad;
    ctx.fill();

    // Fluid Flow Streamlines
    [-0.7, -0.35, 0, 0.35, 0.7].forEach(f => {
      ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
      ctx.lineWidth = f === 0 ? 1.5 : 1.0;
      ctx.beginPath();
      for (let x = x0; x <= x5; x += 5) {
        const r = getLocalRadius(x);
        const sy = py + f * (r - 4);
        if (x === x0) ctx.moveTo(x, sy);
        else ctx.lineTo(x, sy);
      }
      ctx.stroke();
    });

    // Dynamic Tracer Flow Particles with LDV Velocity Streaks
    venturiParticles.forEach(p => {
      const localR = getLocalRadius(p.x);
      const speedRatio = Math.pow(R1 / localR, 2);
      const localSpeed = calc.v1 * 26 * speedRatio * p.speedFactor;

      p.x += localSpeed * 0.016;
      if (p.x > x5) {
        p.x = x0;
        p.yFrac = -0.78 + Math.random() * 1.56;
      }

      const curY = py + p.yFrac * (localR - 6);
      const streakLen = Math.max(3, Math.min(26, localSpeed * 0.42));

      // Luminous velocity streak tail
      const streakGrad = ctx.createLinearGradient(p.x - streakLen, curY, p.x, curY);
      streakGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
      streakGrad.addColorStop(1, `rgba(255, 255, 255, ${p.brightness})`);
      ctx.strokeStyle = streakGrad;
      ctx.lineWidth = p.size;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(p.x - streakLen, curY);
      ctx.lineTo(p.x, curY);
      ctx.stroke();

      // Bright tracer bead head
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(p.x, curY, p.size * 0.75, 0, Math.PI * 2);
      ctx.fill();
    });

    // Outer Glass Profile Stroke
    ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
    ctx.lineWidth = 2.8;
    ctx.stroke();

    // Inner Glass Refraction Line
    ctx.strokeStyle = "rgba(56, 189, 248, 0.22)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();

    // 5. Metallic Machined Pipe Flanges at Inlet & Outlet
    const flangeW = 8;
    const flangeH = (R1 + 10) * 2;
    const flangeGrad = ctx.createLinearGradient(x0 - flangeW, 0, x0, 0);
    flangeGrad.addColorStop(0, "#334155");
    flangeGrad.addColorStop(0.5, "#cbd5e1");
    flangeGrad.addColorStop(1, "#475569");

    [ { x: x0 - flangeW, txt: "INLET FLOW ➔", txtAlign: "left", offX: 10 },
      { x: x5, txt: "➔ DISCHARGE", txtAlign: "right", offX: -10 } ].forEach(flange => {
      ctx.fillStyle = flangeGrad;
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(flange.x, py - flangeH / 2, flangeW, flangeH, 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#f8fafc";
      for (let by = py - flangeH / 2 + 8; by <= py + flangeH / 2 - 8; by += 22) {
        ctx.beginPath();
        ctx.arc(flange.x + flangeW / 2, by, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Flow Direction Badges
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 9px var(--font-mono, monospace)";
    ctx.textAlign = "left";
    ctx.fillText("INLET FLOW ➔", x0 + 12, py + R1 + 18);
    ctx.textAlign = "right";
    ctx.fillText("➔ DISCHARGE", x5 - 12, py + R1 + 18);

    // 6. Station Telemetry Callouts (Cleanly positioned, NO collisions!)
    // Station 1: Wide Section (Inlet) - placed directly above inlet pipe at y = 215, below HUD!
    drawVectorPill(ctx, m1X, py - R1 - 22, `STATION 1 (INLET): v₁ = ${calc.v1.toFixed(2)} m/s • D₁ = 60 mm`, "#38bdf8", "center");

    // Station 2: Constricted Throat - placed directly below throat at y = 329!
    drawVectorPill(ctx, m2X, py + R2 + 22, `STATION 2 (THROAT): v₂ = ${calc.v2.toFixed(2)} m/s • D₂ = 30 mm (4.0×)`, "#f59e0b", "center");

    // 7. Glassmorphic Laboratory Theory Card at Bottom
    const cardX = 40;
    const cardY = 432;
    const cardW = canvasWidth - 80;
    const cardH = 46;

    ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
    ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 8);
    ctx.fill();
    ctx.stroke();

    const colW = cardW / 3;
    // Col 1: Bernoulli Conservation of Energy
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#94a3b8";
    ctx.font = "8px system-ui, sans-serif";
    ctx.fillText("CONSERVATION OF MECHANICAL ENERGY", cardX + colW * 0.5, cardY + 14);
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 10px var(--font-mono, monospace)";
    ctx.fillText("P₁ + ½ρv₁² = P₂ + ½ρv₂²", cardX + colW * 0.5, cardY + 30);

    // Divider 1
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cardX + colW, cardY + 6);
    ctx.lineTo(cardX + colW, cardY + cardH - 6);
    ctx.stroke();

    // Col 2: Measured Head & Pressure Drop
    ctx.fillStyle = "#94a3b8";
    ctx.font = "8px system-ui, sans-serif";
    ctx.fillText("BERNOULLI PRESSURE DIFFERENTIAL", cardX + colW * 1.5, cardY + 14);
    ctx.fillStyle = "#facc15";
    ctx.font = "bold 10px var(--font-mono, monospace)";
    ctx.fillText(`ΔP = ½ρ(v₂² - v₁²) = ${(calc.deltaP / 1000).toFixed(2)} kPa`, cardX + colW * 1.5, cardY + 30);

    // Divider 2
    ctx.beginPath();
    ctx.moveTo(cardX + colW * 2, cardY + 6);
    ctx.lineTo(cardX + colW * 2, cardY + cardH - 6);
    ctx.stroke();

    // Col 3: Continuity Equation
    ctx.fillStyle = "#94a3b8";
    ctx.font = "8px system-ui, sans-serif";
    ctx.fillText("MASS CONTINUITY (FLOW RATE)", cardX + colW * 2.5, cardY + 14);
    ctx.fillStyle = "#10b981";
    ctx.font = "bold 10px var(--font-mono, monospace)";
    ctx.fillText(`A₁·v₁ = A₂·v₂ = Q (${flowRateLps.toFixed(2)} L/s)`, cardX + colW * 2.5, cardY + 30);
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
    const tankH = 270;
    const waterSurfaceY = tankY + 50;
    const { w: blockW, h: blockH } = getBlockDimensions(blockVolumeLiters);

    const calc = getCalculations();
    let blockBottomTargetY = waterSurfaceY + (calc.effectiveSubmersion / 100.0) * blockH;
    let blockY = blockBottomTargetY - blockH;

    if (isFreeFloating && !calc.canFloat) {
      blockY = tankY + tankH - 6 - blockH;
    }

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
    const tankH = 270;
    const waterSurfaceY = tankY + 50;
    const { w: blockW, h: blockH } = getBlockDimensions(blockVolumeLiters);

    const calc = getCalculations();
    let blockBottomTargetY = waterSurfaceY + (calc.effectiveSubmersion / 100.0) * blockH;
    let blockY = blockBottomTargetY - blockH;

    if (isFreeFloating && !calc.canFloat) {
      blockY = tankY + tankH - 6 - blockH;
    }

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
      if (apparatusMode === "venturi" || apparatusMode === "buoyancy" || isFreeFloating || isDragging || surfaceRippleAmp > 0.05) {
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
      const badgeFloat = container.querySelector("#badge-float-status");
      if (badgeFloat) {
        badgeFloat.innerText = "Venturi Flow Active";
        badgeFloat.style.color = "#38bdf8";
        badgeFloat.style.background = "rgba(56, 189, 248, 0.15)";
      }
    } else {
      btn.innerText = "🔀 Switch to Venturi Tube";
      if (pBuoy) pBuoy.style.display = "block";
      if (pVent) pVent.style.display = "none";
      if (chartTitle) chartTitle.innerText = "Archimedes Linear Verification (F_b vs V_disp)";
      if (chartSlope) chartSlope.innerText = "Slope = ρ_f · g";
      if (dragHint) dragHint.innerText = "👆 Drag block vertically inside tank • Touch/Wheel friendly";
      if (btnFloat) btnFloat.style.display = "inline-flex";
      const badgeFloat = container.querySelector("#badge-float-status");
      if (badgeFloat) {
        badgeFloat.innerText = isFreeFloating ? (calc.canFloat ? "Free Floating at Equilibrium" : "Sunk to Floor (ρ_s > ρ_f)") : "Suspended from Scale";
        badgeFloat.style.color = "#38bdf8";
        badgeFloat.style.background = "rgba(56, 189, 248, 0.15)";
      }
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
