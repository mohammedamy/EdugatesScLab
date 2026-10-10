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

  // Fluid Library (Density ρ in kg/m³, Dynamic Viscosity μ in Pa·s)
  const FLUIDS = {
    water: { name: "Fresh Water (H₂O)", density: 1000.0, viscosity: 0.001002, color: "rgba(56, 189, 248, 0.4)", surfaceColor: "#0284c7" },
    seawater: { name: "Seawater (3.5% Salinity)", density: 1025.0, viscosity: 0.00107, color: "rgba(14, 165, 233, 0.45)", surfaceColor: "#0369a1" },
    oil: { name: "Mineral Oil", density: 870.0, viscosity: 0.030, color: "rgba(234, 179, 8, 0.35)", surfaceColor: "#ca8a04" },
    ethanol: { name: "Ethanol (C₂H₅OH)", density: 789.0, viscosity: 0.0012, color: "rgba(16, 185, 129, 0.35)", surfaceColor: "#059669" },
    glycerin: { name: "Pure Glycerin (C₃H₈O₃)", density: 1261.0, viscosity: 0.950, color: "rgba(245, 158, 11, 0.45)", surfaceColor: "#d97706" },
    gasoline: { name: "Refined Gasoline", density: 720.0, viscosity: 0.0006, color: "rgba(244, 114, 182, 0.35)", surfaceColor: "#db2777" },
    mercury: { name: "Liquid Mercury (Hg)", density: 13600.0, viscosity: 0.00153, color: "rgba(148, 163, 184, 0.85)", surfaceColor: "#475569" }
  };

  // Block Material Library (Density ρ in kg/m³)
  const MATERIALS = {
    cork: { name: "Cork Bark (Super Buoyant)", density: 240.0, color: "#d97706", borderColor: "#b45309" },
    wood: { name: "Pine Wood (Floats)", density: 550.0, color: "#a16207", borderColor: "#d97706" },
    ice: { name: "Glacial Ice", density: 917.0, color: "#7dd3fc", borderColor: "#bae6fd" },
    acrylic: { name: "Cast Acrylic / PMMA", density: 1180.0, color: "#38bdf8", borderColor: "#0284c7" },
    aluminum: { name: "Solid Aluminum", density: 2700.0, color: "#94a3b8", borderColor: "#cbd5e1" },
    iron: { name: "Cast Iron", density: 7870.0, color: "#475569", borderColor: "#64748b" },
    lead: { name: "Pure Lead", density: 11340.0, color: "#334155", borderColor: "#475569" },
    gold: { name: "Pure Gold (24 Karat)", density: 19320.0, color: "#eab308", borderColor: "#ca8a04" }
  };

  // Pascal Hydraulic Lift Vehicle & Load Library
  const HYDRAULIC_LOADS = {
    car: { name: "Passenger Sedan Car", massKg: 1500, color: "#38bdf8", icon: "🚗" },
    suv: { name: "Heavy SUV / Pickup Truck", massKg: 2400, color: "#f59e0b", icon: "🚙" },
    forklift: { name: "Industrial Warehouse Forklift", massKg: 3800, color: "#eab308", icon: "🚜" },
    weights: { name: "Precision Calibration Weights", massKg: 300, color: "#a855f7", icon: "⚖️" }
  };

  // Simulation State
  let apparatusMode = "buoyancy"; // "buoyancy", "venturi", "torricelli", or "hydraulic"
  let fluidKey = "water";
  let materialKey = "aluminum";
  let blockVolumeLiters = 1.0; // Liters = 1e-3 m³
  let submersionPercent = 100.0; // 0% to 100%
  let isFreeFloating = false; // false = suspended on spring scale; true = free float
  let flowRateLps = 2.0; // L/s for Venturi mode (0.5 to 5.0 L/s)
  const g = 9.81;

  // Torricelli Efflux Simulation State
  let orificeHeightM = 0.40; // 0.10 to 0.70 m above tank floor
  let tankLiquidLevelM = 0.80; // Total liquid column level
  let dischargeCoeff = 0.62; // Standard sharp-edged orifice Cd = 0.62
  let isDraggingOrifice = false;
  let dragOrificeStartY = 0;
  let dragOrificeStartH = 0.40;

  // Interactive Hydrostatic Depth Pressure Probe
  let showPressureProbe = false;
  let probeDepthCm = 10.0; // 0 to 22 cm
  let isDraggingProbe = false;
  let dragProbeStartY = 0;
  let dragProbeStartDepth = 10.0;

  // Pascal's Principle Hydraulic Press State
  let piston1DiameterCm = 4.0; // cm (input small cylinder D1)
  let piston2DiameterCm = 20.0; // cm (output large cylinder D2)
  let inputForceN = 150.0; // N (applied force F1)
  let inputStrokeCm = 12.0; // cm (input piston stroke displacement d1)
  let liftedLoadKey = "car";
  let isDraggingPiston1 = false;
  let dragPistonStartY = 0;
  let dragPistonStartStroke = 12.0;

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

  // Torricelli Efflux Jet Stream Droplets
  const torricelliParticles = [];
  for (let i = 0; i < 42; i++) {
    torricelliParticles.push({
      progress: Math.random(),
      speed: 0.85 + Math.random() * 0.3,
      size: 1.4 + Math.random() * 1.6,
      yScatter: (Math.random() - 0.5) * 3
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
            <button id="view-mode-fluids-sim" class="btn btn-secondary active" aria-label="Switch to Fluids Simulator Canvas" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Fluids Simulator
            </button>
            <button id="view-mode-fluids-photo" class="btn btn-secondary" aria-label="Switch to 4K Real Laboratory Bench Photo" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-fluid-mode" aria-label="Switch Mode between Archimedes Tank, Venturi Tube, and Torricelli Tank" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(6, 182, 212, 0.4); color: #38bdf8;" title="Hotkey: M">
            🔀 Switch Mode
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-fluid-probe" aria-label="Toggle Hydrostatic Depth Pressure Probe" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(14, 165, 233, 0.4); color: #38bdf8;" title="Toggle Depth Pressure Mano-Probe (Hotkey: P)">
            📍 Depth Probe
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-fluid-float" aria-label="Toggle Free Float vs Suspended Scale" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(245, 158, 11, 0.4); color: #facc15;" title="Toggle Free Float vs Suspended Scale (Hotkey: F)">
            🪝 Release to Float
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-record-trial" aria-label="Record Fluid Dynamics Trial Data" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #34d399;" title="Record Trial (Hotkey: T)">
            📌 Record Trial
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-fluid-report" aria-label="Open Fluid Dynamics Lab Dossier Report" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;" title="Open Lab Dossier Report (Hotkey: R)">
            📋 Lab Dossier
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-fluid-export" aria-label="Export Fluid Dynamics Trials to CSV" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(148, 163, 184, 0.4); color: #94a3b8;" title="Export CSV Data">
            📥 CSV
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-fluid-reset" aria-label="Reset Fluid Dynamics Simulation Parameters" style="padding: 5px 12px; font-size: 0.78rem;">
            ⟲ Reset
          </button>
        </div>
      </div>

      <!-- Main Layout -->
      <div style="display: grid; grid-template-columns: 1.25fr 1fr; gap: 20px;" class="fluids-layout">
        <!-- Canvas Viewport: Archimedes Tank, Venturi Tube, or Torricelli Efflux Tank -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(6, 182, 212, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #083344 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="fluids-canvas" width="620" height="530" style="height: 530px; width: 100%; display: block; touch-action: none; cursor: default;"></canvas>

          <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
          <div id="fluids-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <picture>
              <source srcset="assets/labs/fluids_bench.webp" type="image/webp">
              <img src="assets/labs/fluids_bench.jpg" alt="4K Fluid Mechanics & Archimedes Buoyancy Bench" loading="lazy" decoding="async" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            </picture>
            
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
                  <label for="select-fluids-fluid" style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Liquid Medium</label>
                  <select id="select-fluids-fluid" class="form-control" aria-label="Liquid Medium Selection" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                    ${Object.entries(FLUIDS).map(([k, f]) => `<option value="${k}">${f.name}</option>`).join("")}
                  </select>
                </div>

                <div>
                  <label for="select-fluids-material" style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Solid Material</label>
                  <select id="select-fluids-material" class="form-control" aria-label="Solid Material Selection" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                    ${Object.entries(MATERIALS).map(([k, m]) => `<option value="${k}" ${k === 'aluminum' ? 'selected' : ''}>${m.name}</option>`).join("")}
                  </select>
                </div>
              </div>

              <!-- Submersion Depth Slider -->
              <div id="row-submersion-slider" style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                  <label for="slider-fluids-submersion" style="color: #94a3b8;">Submersion Depth (Immersion %)</label>
                  <span id="lbl-fluids-submersion" style="font-weight: 700; color: #38bdf8; font-family: var(--font-mono);">100%</span>
                </div>
                <input type="range" id="slider-fluids-submersion" min="0" max="100" step="1" value="100" role="slider" aria-label="Submersion Depth Percentage" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100" style="width: 100%; accent-color: #38bdf8;">
              </div>

              <!-- Block Volume Slider -->
              <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                  <label for="slider-fluids-vol" style="color: #94a3b8;">Solid Object Volume (V)</label>
                  <span id="lbl-fluids-vol" style="font-weight: 700; color: #10b981; font-family: var(--font-mono);">1.00 L (1000 cm³)</span>
                </div>
                <input type="range" id="slider-fluids-vol" min="0.2" max="3.0" step="0.1" value="1.0" role="slider" aria-label="Solid Object Volume" aria-valuemin="0.2" aria-valuemax="3.0" aria-valuenow="1.0" style="width: 100%; accent-color: #10b981;">
              </div>

              <!-- Hydrostatic Depth Pressure Probe Controls -->
              <div id="row-pressure-probe-control" style="display: none; margin-bottom: 12px; background: rgba(14, 165, 233, 0.08); border: 1px solid rgba(14, 165, 233, 0.35); border-radius: 8px; padding: 10px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                  <label for="slider-probe-depth" style="color: #38bdf8; font-weight: 700;">📍 Hydrostatic Mano-Probe Depth (h)</label>
                  <span id="lbl-probe-depth" style="font-weight: 700; color: #38bdf8; font-family: var(--font-mono);">10.0 cm</span>
                </div>
                <input type="range" id="slider-probe-depth" min="0" max="22" step="0.5" value="10.0" role="slider" aria-label="Hydrostatic Probe Depth" aria-valuemin="0" aria-valuemax="22" aria-valuenow="10.0" style="width: 100%; accent-color: #0284c7;">
                <div style="display: flex; justify-content: space-between; font-size: 0.72rem; margin-top: 6px; color: #94a3b8; font-family: var(--font-mono); background: rgba(0,0,0,0.3); border-radius: 4px; padding: 4px 8px;">
                  <span>P_gauge: <strong id="val-probe-gauge" style="color: #34d399;">0.98 kPa</strong></span>
                  <span>P_abs: <strong id="val-probe-abs" style="color: #facc15;">102.31 kPa</strong></span>
                </div>
              </div>
            </div>

            <!-- Venturi Specific Controls -->
            <div id="panel-venturi-controls" style="display: none; margin-bottom: 12px;">
              <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                  <label for="slider-venturi-flow" style="color: #94a3b8;">Volumetric Flow Rate (Q)</label>
                  <span id="lbl-venturi-flow" style="font-weight: 700; color: #38bdf8; font-family: var(--font-mono);">2.00 L/s</span>
                </div>
                <input type="range" id="slider-venturi-flow" min="0.5" max="5.0" step="0.1" value="2.0" role="slider" aria-label="Volumetric Flow Rate" aria-valuemin="0.5" aria-valuemax="5.0" aria-valuenow="2.0" style="width: 100%; accent-color: #38bdf8;">
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

              <!-- Reynolds Number & Hydrodynamic Flow Regime Telemetry -->
              <div id="venturi-reynolds-box" style="margin-top: 10px; background: rgba(0,0,0,0.4); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 8px; padding: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Hydrodynamic Flow Regime</span>
                  <span id="badge-flow-regime" style="font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 9999px; background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4);">Laminar (Re < 2300)</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.76rem;">
                  <div>
                    <span style="color: #64748b; display: block; font-size: 0.7rem;">Inlet Reynolds (Re₁)</span>
                    <span id="val-reynolds-1" style="font-weight: 700; color: #38bdf8; font-family: var(--font-mono);">Re₁ = 42,440</span>
                  </div>
                  <div>
                    <span style="color: #64748b; display: block; font-size: 0.7rem;">Throat Reynolds (Re₂)</span>
                    <span id="val-reynolds-2" style="font-weight: 700; color: #f59e0b; font-family: var(--font-mono);">Re₂ = 84,880</span>
                  </div>
                </div>
                <div style="margin-top: 6px; font-size: 0.7rem; color: #64748b; display: flex; justify-content: space-between;">
                  <span>Dynamic Viscosity μ: <strong id="val-fluid-viscosity" style="color: #cbd5e1; font-family: var(--font-mono);">1.00 mPa·s</strong></span>
                  <span style="color: #94a3b8; font-family: var(--font-mono);">Re = ρ·v·D / μ</span>
                </div>
              </div>
            </div>

            <!-- Torricelli Efflux Controls -->
            <div id="panel-torricelli-controls" style="display: none; margin-bottom: 12px;">
              <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                  <label for="slider-orifice-height" style="color: #94a3b8;">Orifice Elevation y_h (above floor)</label>
                  <span id="lbl-orifice-height" style="font-weight: 700; color: #38bdf8; font-family: var(--font-mono);">0.40 m (40.0 cm)</span>
                </div>
                <input type="range" id="slider-orifice-height" min="0.10" max="0.70" step="0.01" value="0.40" role="slider" aria-label="Orifice Elevation above floor" aria-valuemin="0.10" aria-valuemax="0.70" aria-valuenow="0.40" style="width: 100%; accent-color: #38bdf8;">
              </div>

              <div style="margin-bottom: 12px;">
                <label for="select-nozzle-type" style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Nozzle Geometry &amp; Discharge Coefficient (C_d)</label>
                <select id="select-nozzle-type" class="form-control" aria-label="Nozzle Geometry and Discharge Coefficient" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                  <option value="0.62" selected>Sharp-Edged Orifice (C_d = 0.62, Vena Contracta)</option>
                  <option value="0.98">Well-Rounded Streamlined Nozzle (C_d = 0.98)</option>
                  <option value="0.80">Short Cylindrical Borda Tube (C_d = 0.80)</option>
                  <option value="1.00">Frictionless Theoretical Torricelli (C_d = 1.00)</option>
                </select>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.76rem; background: rgba(0,0,0,0.3); border-radius: 8px; padding: 10px;">
                <div>
                  <div style="color: #94a3b8;">Total Column Head H</div>
                  <div style="color: #f1f5f9; font-weight: 700; font-family: var(--font-mono);">0.80 m (80.0 cm)</div>
                </div>
                <div>
                  <div style="color: #94a3b8;">Efflux Liquid Head h</div>
                  <div id="lbl-torricelli-head" style="color: #facc15; font-weight: 700; font-family: var(--font-mono);">0.40 m (h = H - y_h)</div>
                </div>
              </div>

              <!-- Torricelli Trajectory Telemetry Box -->
              <div style="margin-top: 10px; background: rgba(0,0,0,0.4); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 8px; padding: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Parabolic Jet Trajectory</span>
                  <span id="badge-max-range" style="font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 9999px; background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4);">Peak Range at y = H/2</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.76rem;">
                  <div>
                    <span style="color: #64748b; display: block; font-size: 0.7rem;">Horizontal Range R</span>
                    <span id="val-torricelli-range" style="font-weight: 700; color: #38bdf8; font-family: var(--font-mono);">R = 0.50 m</span>
                  </div>
                  <div>
                    <span style="color: #64748b; display: block; font-size: 0.7rem;">Efflux Velocity v</span>
                    <span id="val-torricelli-vel" style="font-weight: 700; color: #10b981; font-family: var(--font-mono);">v = 1.74 m/s</span>
                  </div>
                </div>
                <div style="margin-top: 6px; font-size: 0.7rem; color: #64748b; display: flex; justify-content: space-between;">
                  <span>Nozzle Dia: <strong style="color: #cbd5e1; font-family: var(--font-mono);">12.0 mm</strong></span>
                  <span style="color: #94a3b8; font-family: var(--font-mono);">R = 2·C_d·√(h·y_h)</span>
                </div>
              </div>
            </div>

            <!-- Pascal's Principle Hydraulic Press Controls -->
            <div id="panel-hydraulic-controls" style="display: none; margin-bottom: 12px;">
              <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                  <label for="slider-input-force" style="color: #94a3b8;">Input Applied Force F₁ (Small Piston)</label>
                  <span id="lbl-input-force" style="font-weight: 700; color: #38bdf8; font-family: var(--font-mono);">150 N (15.3 kg equiv)</span>
                </div>
                <input type="range" id="slider-input-force" min="10" max="1000" step="10" value="150" role="slider" aria-label="Input Applied Force F1" aria-valuemin="10" aria-valuemax="1000" aria-valuenow="150" style="width: 100%; accent-color: #38bdf8;">
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 4px;">
                    <label for="slider-d1" style="color: #94a3b8;">Input Dia. D₁</label>
                    <span id="lbl-d1" style="font-weight: 700; color: #38bdf8; font-family: var(--font-mono);">4.0 cm</span>
                  </div>
                  <input type="range" id="slider-d1" min="2.0" max="8.0" step="0.5" value="4.0" role="slider" aria-label="Input Cylinder Diameter D1" aria-valuemin="2.0" aria-valuemax="8.0" aria-valuenow="4.0" style="width: 100%; accent-color: #38bdf8;">
                </div>
                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 4px;">
                    <label for="slider-d2" style="color: #94a3b8;">Output Dia. D₂</label>
                    <span id="lbl-d2" style="font-weight: 700; color: #f59e0b; font-family: var(--font-mono);">20.0 cm</span>
                  </div>
                  <input type="range" id="slider-d2" min="10.0" max="40.0" step="1.0" value="20.0" role="slider" aria-label="Output Cylinder Diameter D2" aria-valuemin="10.0" aria-valuemax="40.0" aria-valuenow="20.0" style="width: 100%; accent-color: #f59e0b;">
                </div>
              </div>

              <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                  <label for="slider-input-stroke" style="color: #94a3b8;">Piston 1 Stroke d₁ (Displacement)</label>
                  <span id="lbl-input-stroke" style="font-weight: 700; color: #10b981; font-family: var(--font-mono);">12.0 cm (d₂ = 0.48 cm)</span>
                </div>
                <input type="range" id="slider-input-stroke" min="1.0" max="25.0" step="0.5" value="12.0" role="slider" aria-label="Input Piston Stroke Displacement d1" aria-valuemin="1.0" aria-valuemax="25.0" aria-valuenow="12.0" style="width: 100%; accent-color: #10b981;">
              </div>

              <div style="margin-bottom: 12px;">
                <label for="select-hydraulic-load" style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Lifted Vehicle &amp; Industrial Load Platform</label>
                <select id="select-hydraulic-load" class="form-control" aria-label="Lifted Vehicle and Load" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                  <option value="car" selected>🚗 Passenger Sedan Car (1,500 kg / 14.7 kN)</option>
                  <option value="suv">🚙 Heavy SUV / Pickup Truck (2,400 kg / 23.5 kN)</option>
                  <option value="forklift">🚜 Industrial Warehouse Forklift (3,800 kg / 37.3 kN)</option>
                  <option value="weights">⚖️ Precision Calibration Weights (300 kg / 2.94 kN)</option>
                </select>
              </div>

              <!-- Pascal Hydraulic Telemetry Card -->
              <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Pascal Mechanical Advantage</span>
                  <span id="badge-hydraulic-status" style="font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 9999px; background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4);">IMA = 25.0×</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.76rem;">
                  <div>
                    <span style="color: #64748b; display: block; font-size: 0.7rem;">Ideal Mechanical Adv.</span>
                    <span id="val-hydraulic-ima" style="font-weight: 700; color: #38bdf8; font-family: var(--font-mono);">IMA = 25.0×</span>
                  </div>
                  <div>
                    <span style="color: #64748b; display: block; font-size: 0.7rem;">Energy / Work Done W</span>
                    <span id="val-hydraulic-work" style="font-weight: 700; color: #facc15; font-family: var(--font-mono);">W = 18.0 J (W₁=W₂)</span>
                  </div>
                </div>
                <div style="margin-top: 6px; font-size: 0.7rem; color: #64748b; display: flex; justify-content: space-between;">
                  <span>Max Lift Capacity: <strong id="val-hydraulic-maxlift" style="color: #cbd5e1; font-family: var(--font-mono);">382 kg</strong></span>
                  <span style="color: #94a3b8; font-family: var(--font-mono);">F₂/F₁ = (D₂/D₁)²</span>
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

    // Hydrodynamic Viscosity & Reynolds Number (Re = ρ · v · D / μ)
    const visc = f.viscosity || 0.001002;
    const re1 = (f.density * v1 * d1) / visc;
    const re2 = (f.density * v2 * d2) / visc;
    const isTurbulent = re1 >= 4000;
    const isTransitional = re1 >= 2300 && re1 < 4000;
    const isLaminar = re1 < 2300;

    // Torricelli Efflux Physics:
    const H_total = tankLiquidLevelM; // 0.80 m
    const y_h = Math.max(0.05, Math.min(H_total - 0.05, orificeHeightM));
    const headM = Math.max(0.01, H_total - y_h);
    const vIdeal = Math.sqrt(2 * g * headM);
    const vActual = dischargeCoeff * vIdeal;
    const tFlight = Math.sqrt((2 * y_h) / g);
    const rangeM = vActual * tFlight;
    const idealRangeM = 2 * Math.sqrt(headM * y_h);
    const maxRangeM = dischargeCoeff * H_total; // at y_h = H/2
    const nozzleDiaM = 0.012; // 12 mm
    const nozzleAreaM2 = Math.PI * Math.pow(nozzleDiaM / 2, 2);
    const qM3s_torr = dischargeCoeff * nozzleAreaM2 * Math.sqrt(2 * g * headM);
    const qLps_torr = qM3s_torr * 1000;
    const isAtMaxRange = Math.abs(y_h - H_total / 2) < 0.02;

    // Hydrostatic Depth Pressure Probe Physics:
    const probeDepthM = probeDepthCm / 100;
    const pGaugePa = f.density * g * probeDepthM;
    const pGaugeKPa = pGaugePa / 1000;
    const pAtmKPa = 101.325;
    const pAbsKPa = pAtmKPa + pGaugeKPa;

    // Pascal's Principle Hydraulic Press Physics:
    const d1_m = piston1DiameterCm / 100;
    const d2_m = piston2DiameterCm / 100;
    const a1_hyd = Math.PI * Math.pow(d1_m / 2, 2);
    const a2_hyd = Math.PI * Math.pow(d2_m / 2, 2);
    const a1Cm2 = a1_hyd * 1e4;
    const a2Cm2 = a2_hyd * 1e4;
    const ima = a2_hyd / a1_hyd; // (d2 / d1)^2
    const outputForceN = inputForceN * ima;
    const pressurePa = inputForceN / a1_hyd;
    const pressureKPa = pressurePa / 1000;
    const pressureBar = pressurePa / 100000;
    const stroke1M = inputStrokeCm / 100;
    const stroke2M = stroke1M / ima; // Volume conservation A1*d1 = A2*d2
    const outputStrokeCm = stroke2M * 100;
    const dispVolHydM3 = a1_hyd * stroke1M;
    const dispVolHydLiters = dispVolHydM3 * 1000;
    const workJ = inputForceN * stroke1M; // W1 = F1*d1 = W2 = F2*d2
    const load = HYDRAULIC_LOADS[liftedLoadKey] || HYDRAULIC_LOADS.car;
    const loadWeightN = load.massKg * g;
    const maxLiftKg = outputForceN / g;
    const canLiftLoad = outputForceN >= loadWeightN;
    const minForceToLiftN = loadWeightN / ima;

    return {
      f, m, volM3, dispVolM3, massRealKg, weightRealN,
      fbN, weightAppN, massDispKg, normalForceN,
      effectiveSubmersion, canFloat, densityRatio, equilibriumSubmersion,
      v1, v2, deltaP, deltaH, a1, a2,
      visc, re1, re2, isTurbulent, isTransitional, isLaminar,
      H_total, y_h, headM, vIdeal, vActual, tFlight,
      rangeM, idealRangeM, maxRangeM, nozzleDiaM, nozzleAreaM2,
      qM3s_torr, qLps_torr, isAtMaxRange,
      probeDepthM, pGaugePa, pGaugeKPa, pAtmKPa, pAbsKPa,
      d1_m, d2_m, a1_hyd, a2_hyd, a1Cm2, a2Cm2, ima,
      outputForceN, pressurePa, pressureKPa, pressureBar,
      stroke1M, stroke2M, outputStrokeCm, dispVolHydM3, dispVolHydLiters,
      workJ, load, loadWeightN, maxLiftKg, canLiftLoad, minForceToLiftN
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

      // Update Hydrostatic Depth Pressure Probe telemetry
      const valProbeGauge = container.querySelector("#val-probe-gauge");
      const valProbeAbs = container.querySelector("#val-probe-abs");
      if (valProbeGauge) valProbeGauge.innerText = `${calc.pGaugeKPa.toFixed(2)} kPa`;
      if (valProbeAbs) valProbeAbs.innerText = `${calc.pAbsKPa.toFixed(2)} kPa`;

    } else if (apparatusMode === "venturi") {
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
      if (infoMdisp) {
        infoMdisp.innerText = calc.isLaminar ? "Laminar" : (calc.isTransitional ? "Transitional" : "Turbulent");
        infoMdisp.style.color = calc.isLaminar ? "#34d399" : (calc.isTransitional ? "#facc15" : "#f87171");
      }

      if (badgeFloat) {
        if (calc.isLaminar) {
          badgeFloat.innerText = "Laminar Flow (Re < 2300)";
          badgeFloat.style.color = "#34d399";
          badgeFloat.style.background = "rgba(16, 185, 129, 0.15)";
        } else if (calc.isTransitional) {
          badgeFloat.innerText = "Transitional Flow (2300–4000)";
          badgeFloat.style.color = "#facc15";
          badgeFloat.style.background = "rgba(234, 179, 8, 0.15)";
        } else {
          badgeFloat.innerText = "Turbulent Flow (Re > 4000)";
          badgeFloat.style.color = "#f87171";
          badgeFloat.style.background = "rgba(239, 68, 68, 0.15)";
        }
      }

      const valRe1 = container.querySelector("#val-reynolds-1");
      const valRe2 = container.querySelector("#val-reynolds-2");
      const badgeRegime = container.querySelector("#badge-flow-regime");
      const valVisc = container.querySelector("#val-fluid-viscosity");

      if (valRe1) valRe1.innerText = `Re₁ = ${Math.round(calc.re1).toLocaleString()}`;
      if (valRe2) valRe2.innerText = `Re₂ = ${Math.round(calc.re2).toLocaleString()}`;
      if (valVisc) valVisc.innerText = `${(calc.visc * 1000).toFixed(2)} mPa·s`;
      if (badgeRegime) {
        if (calc.isLaminar) {
          badgeRegime.innerText = "Laminar (Re < 2300)";
          badgeRegime.style.color = "#34d399";
          badgeRegime.style.background = "rgba(16, 185, 129, 0.2)";
          badgeRegime.style.borderColor = "rgba(16, 185, 129, 0.4)";
        } else if (calc.isTransitional) {
          badgeRegime.innerText = "Transitional (2300–4000)";
          badgeRegime.style.color = "#facc15";
          badgeRegime.style.background = "rgba(234, 179, 8, 0.2)";
          badgeRegime.style.borderColor = "rgba(234, 179, 8, 0.4)";
        } else {
          badgeRegime.innerText = "Turbulent (Re > 4000)";
          badgeRegime.style.color = "#f87171";
          badgeRegime.style.background = "rgba(239, 68, 68, 0.2)";
          badgeRegime.style.borderColor = "rgba(239, 68, 68, 0.4)";
        }
      }
    } else if (apparatusMode === "torricelli") {
      // Torricelli Efflux Tank HUD
      if (hudTitleLeft) hudTitleLeft.innerText = "TORRICELLI EFFLUX v";
      if (hudFb) hudFb.innerText = `${calc.vActual.toFixed(2)} m/s`;
      if (hudSubLeft) hudSubLeft.innerText = `Head h = ${(calc.headM * 100).toFixed(1)} cm (v_ideal = ${calc.vIdeal.toFixed(2)} m/s)`;

      if (hudTitleRight) hudTitleRight.innerText = "HORIZONTAL RANGE R";
      if (hudWapp) {
        hudWapp.innerText = `${calc.rangeM.toFixed(2)} m`;
        hudWapp.style.color = calc.isAtMaxRange ? "#facc15" : "#38bdf8";
      }
      if (hudSubRight) hudSubRight.innerText = `Flight t = ${calc.tFlight.toFixed(3)} s (Peak at y = ${(calc.H_total / 2).toFixed(2)} m)`;

      if (labelStat1) labelStat1.innerText = "Efflux Head h";
      if (infoRhof) infoRhof.innerText = `${(calc.headM * 100).toFixed(1)} cm`;
      if (labelStat2) labelStat2.innerText = "Discharge Q";
      if (infoWreal) infoWreal.innerText = `${calc.qLps_torr.toFixed(2)} L/s`;
      if (labelStat3) labelStat3.innerText = "Discharge Coeff";
      if (infoMdisp) {
        infoMdisp.innerText = `${dischargeCoeff.toFixed(2)}`;
        infoMdisp.style.color = "#38bdf8";
      }

      if (badgeFloat) {
        if (calc.isAtMaxRange) {
          badgeFloat.innerText = "Peak Maximum Range (y_h = H / 2)";
          badgeFloat.style.color = "#facc15";
          badgeFloat.style.background = "rgba(245, 158, 11, 0.2)";
        } else {
          badgeFloat.innerText = `Torricelli Efflux (C_d = ${dischargeCoeff.toFixed(2)})`;
          badgeFloat.style.color = "#38bdf8";
          badgeFloat.style.background = "rgba(56, 189, 248, 0.15)";
        }
      }

      const valTorrRange = container.querySelector("#val-torricelli-range");
      const valTorrVel = container.querySelector("#val-torricelli-vel");
      const lblTorrHead = container.querySelector("#lbl-torricelli-head");
      const badgeMaxRange = container.querySelector("#badge-max-range");
      if (valTorrRange) valTorrRange.innerText = `R = ${calc.rangeM.toFixed(2)} m`;
      if (valTorrVel) valTorrVel.innerText = `v = ${calc.vActual.toFixed(2)} m/s`;
      if (lblTorrHead) lblTorrHead.innerText = `${(calc.headM * 100).toFixed(1)} cm (h = H - y_h)`;
      if (badgeMaxRange) {
        badgeMaxRange.innerText = calc.isAtMaxRange ? "★ PEAK MAX RANGE (y = H/2)" : "Range R = 2·C_d·√(h·y_h)";
        badgeMaxRange.style.color = calc.isAtMaxRange ? "#facc15" : "#38bdf8";
        badgeMaxRange.style.background = calc.isAtMaxRange ? "rgba(245, 158, 11, 0.25)" : "rgba(56, 189, 248, 0.15)";
      }
    } else if (apparatusMode === "hydraulic") {
      // Pascal's Principle Hydraulic Press HUD
      if (hudTitleLeft) hudTitleLeft.innerText = "FORCE AMPLIFICATION F₂";
      if (hudFb) {
        if (calc.outputForceN >= 1000) {
          hudFb.innerText = `${(calc.outputForceN / 1000).toFixed(2)} kN`;
        } else {
          hudFb.innerText = `${calc.outputForceN.toFixed(1)} N`;
        }
      }
      if (hudSubLeft) hudSubLeft.innerText = `IMA = ${calc.ima.toFixed(1)}× • F₂ = ${(calc.outputForceN).toFixed(0)} N`;

      if (hudTitleRight) hudTitleRight.innerText = "HYDRAULIC PRESSURE P";
      if (hudWapp) {
        hudWapp.innerText = `${calc.pressureKPa.toFixed(1)} kPa`;
        hudWapp.style.color = "#38bdf8";
      }
      if (hudSubRight) hudSubRight.innerText = `${calc.pressureBar.toFixed(2)} bar (Pascal Transmitted)`;

      if (labelStat1) labelStat1.innerText = "Input Force F₁";
      if (infoRhof) infoRhof.innerText = `${inputForceN.toFixed(0)} N`;
      if (labelStat2) labelStat2.innerText = "Output Stroke d₂";
      if (infoWreal) infoWreal.innerText = `${(calc.outputStrokeCm).toFixed(2)} cm`;
      if (labelStat3) labelStat3.innerText = "Work Conserved W";
      if (infoMdisp) {
        infoMdisp.innerText = `${calc.workJ.toFixed(1)} J (W₁=W₂)`;
        infoMdisp.style.color = "#10b981";
      }

      if (badgeFloat) {
        if (calc.canLiftLoad) {
          badgeFloat.innerText = `✓ Lifting ${calc.load.name} (${calc.load.massKg} kg)`;
          badgeFloat.style.color = "#34d399";
          badgeFloat.style.background = "rgba(16, 185, 129, 0.15)";
        } else {
          badgeFloat.innerText = `✗ Insufficient Force (${(calc.outputForceN / 1000).toFixed(1)} kN < ${(calc.loadWeightN / 1000).toFixed(1)} kN)`;
          badgeFloat.style.color = "#f59e0b";
          badgeFloat.style.background = "rgba(245, 158, 11, 0.15)";
        }
      }

      const lblInputForce = container.querySelector("#lbl-input-force");
      const lblD1 = container.querySelector("#lbl-d1");
      const lblD2 = container.querySelector("#lbl-d2");
      const lblStroke = container.querySelector("#lbl-input-stroke");
      const valIma = container.querySelector("#val-hydraulic-ima");
      const valWork = container.querySelector("#val-hydraulic-work");
      const valMaxLift = container.querySelector("#val-hydraulic-maxlift");
      const badgeHyd = container.querySelector("#badge-hydraulic-status");

      if (lblInputForce) lblInputForce.innerText = `${inputForceN.toFixed(0)} N (${(inputForceN / g).toFixed(1)} kg equiv)`;
      if (lblD1) lblD1.innerText = `${piston1DiameterCm.toFixed(1)} cm (A₁ = ${calc.a1Cm2.toFixed(1)} cm²)`;
      if (lblD2) lblD2.innerText = `${piston2DiameterCm.toFixed(1)} cm (A₂ = ${calc.a2Cm2.toFixed(1)} cm²)`;
      if (lblStroke) lblStroke.innerText = `${inputStrokeCm.toFixed(1)} cm (d₂ = ${calc.outputStrokeCm.toFixed(2)} cm)`;
      if (valIma) valIma.innerText = `IMA = ${calc.ima.toFixed(1)}×`;
      if (valWork) valWork.innerText = `W = ${calc.workJ.toFixed(2)} J (W₁=W₂)`;
      if (valMaxLift) valMaxLift.innerText = `${calc.maxLiftKg.toFixed(0)} kg (${(calc.outputForceN / 1000).toFixed(2)} kN)`;
      if (badgeHyd) {
        badgeHyd.innerText = `IMA = ${calc.ima.toFixed(1)}× (D₂/D₁)²`;
        badgeHyd.style.color = calc.canLiftLoad ? "#34d399" : "#38bdf8";
        badgeHyd.style.background = calc.canLiftLoad ? "rgba(16, 185, 129, 0.2)" : "rgba(56, 189, 248, 0.2)";
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

  function drawVectorArrow(c, fromX, fromY, toX, toY, color, lineWidth = 2) {
    c.save();
    c.strokeStyle = color;
    c.fillStyle = color;
    c.lineWidth = lineWidth;
    c.beginPath();
    c.moveTo(fromX, fromY);
    c.lineTo(toX, toY);
    c.stroke();

    const angle = Math.atan2(toY - fromY, toX - fromX);
    const headLen = Math.max(7, lineWidth * 2.8);
    c.beginPath();
    c.moveTo(toX, toY);
    c.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
    c.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
    c.closePath();
    c.fill();
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

      // 7. Interactive Hydrostatic Depth Pressure Probe (Mano-Sensor)
      if (showPressureProbe) {
        // Vertical Graduation Scale on tank left wall
        const rulerX = tankX + 14;
        const rulerTopY = waterSurfaceY;
        const rulerH = 214; // represents 22 cm of water column
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rulerX, rulerTopY);
        ctx.lineTo(rulerX, rulerTopY + rulerH);
        ctx.stroke();

        ctx.font = "8px var(--font-mono, monospace)";
        ctx.fillStyle = "#94a3b8";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        for (let cm = 0; cm <= 22; cm += 2) {
          const yTick = rulerTopY + (cm / 22) * rulerH;
          const isMajor = cm % 5 === 0 || cm === 0;
          const tickLen = isMajor ? 8 : 4;
          ctx.beginPath();
          ctx.moveTo(rulerX, yTick);
          ctx.lineTo(rulerX + tickLen, yTick);
          ctx.stroke();
          if (isMajor) {
            ctx.fillText(`${cm}cm`, rulerX + 11, yTick);
          }
        }

        // Draggable Stainless Steel Probe Wand
        const probeX = tankX + 52;
        const probeTipY = waterSurfaceY + (probeDepthCm / 22) * rulerH;
        const probeGripY = waterSurfaceY - 45;

        // Silicone Signal Capillary Cable leading to Benchtop Digital Manometer
        const meterX = 22;
        const meterY = 385;
        const meterW = 95;
        const meterH = 92;

        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(probeX, probeGripY - 5);
        ctx.bezierCurveTo(probeX - 10, probeGripY - 40, meterX + meterW + 20, meterY - 20, meterX + meterW / 2, meterY);
        ctx.stroke();

        // Probe Stainless Steel Stem
        const stemGrad = ctx.createLinearGradient(probeX - 3, 0, probeX + 3, 0);
        stemGrad.addColorStop(0, "#475569");
        stemGrad.addColorStop(0.35, "#f1f5f9");
        stemGrad.addColorStop(0.7, "#cbd5e1");
        stemGrad.addColorStop(1, "#334155");
        ctx.fillStyle = stemGrad;
        ctx.fillRect(probeX - 2.5, probeGripY, 5, probeTipY - probeGripY);

        // Tactile Grip Collar at top of probe
        const gripGrad = ctx.createLinearGradient(probeX - 7, 0, probeX + 7, 0);
        gripGrad.addColorStop(0, "#0284c7");
        gripGrad.addColorStop(0.5, "#38bdf8");
        gripGrad.addColorStop(1, "#0369a1");
        ctx.fillStyle = gripGrad;
        ctx.beginPath();
        ctx.roundRect(probeX - 7, probeGripY - 10, 14, 16, 4);
        ctx.fill();
        ctx.strokeStyle = "#e0f2fe";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Depth Label Pill next to Grip
        drawVectorPill(ctx, probeX, probeGripY - 24, `h = ${probeDepthCm.toFixed(1)} cm`, "#38bdf8", "center");

        // Sensor Head at Tip (Piezo Diaphragm)
        const sensorR = 8;
        ctx.fillStyle = "#1e293b";
        ctx.strokeStyle = "#0284c7";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(probeX, probeTipY, sensorR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Gold Piezo Contact Diaphragm
        ctx.fillStyle = "#facc15";
        ctx.beginPath();
        ctx.arc(probeX, probeTipY, 4, 0, Math.PI * 2);
        ctx.fill();

        // 4 Isotropic Hydrostatic Pressure Vector Arrows (← → ↑ ↓)
        const arrLen = Math.min(24, Math.max(10, (calc.pGaugeKPa / 2.5) * 22));
        ctx.strokeStyle = "#34d399";
        ctx.fillStyle = "#34d399";
        ctx.lineWidth = 1.8;

        const dirs = [
          { dx: 1, dy: 0 },
          { dx: -1, dy: 0 },
          { dx: 0, dy: 1 },
          { dx: 0, dy: -1 }
        ];
        dirs.forEach(d => {
          const sx = probeX + d.dx * (sensorR + 2);
          const sy = probeTipY + d.dy * (sensorR + 2);
          const ex = probeX + d.dx * (sensorR + 2 + arrLen);
          const ey = probeTipY + d.dy * (sensorR + 2 + arrLen);
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          ctx.stroke();
          // Arrowhead
          ctx.beginPath();
          ctx.arc(ex, ey, 2.2, 0, Math.PI * 2);
          ctx.fill();
        });

        // Pill displaying Hydrostatic Pressure Formula & Value
        drawVectorPill(ctx, probeX + 45, probeTipY, `P_g = ${calc.pGaugeKPa.toFixed(2)} kPa`, "#34d399", "left");

        // Tabletop Digital Manometer Instrument on Bench
        // Housing
        const boxGrad = ctx.createLinearGradient(meterX, meterY, meterX + meterW, meterY + meterH);
        boxGrad.addColorStop(0, "#0f172a");
        boxGrad.addColorStop(0.5, "#1e293b");
        boxGrad.addColorStop(1, "#020617");
        ctx.fillStyle = boxGrad;
        ctx.strokeStyle = "#0284c7";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(meterX, meterY, meterW, meterH, 8);
        ctx.fill();
        ctx.stroke();

        // Rubber non-slip feet
        ctx.fillStyle = "#334155";
        ctx.fillRect(meterX + 6, meterY + meterH, 12, 4);
        ctx.fillRect(meterX + meterW - 18, meterY + meterH, 12, 4);

        // Header label
        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 7.5px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("DIGITAL MANOMETER", meterX + meterW / 2, meterY + 12);
        ctx.fillStyle = "#38bdf8";
        ctx.font = "6.5px var(--font-mono, monospace)";
        ctx.fillText("PIEZO-DEPTH SENSOR", meterX + meterW / 2, meterY + 22);

        // Dual Segmented LCD Display Backdrops
        // Screen 1: Gauge Pressure (Green LCD)
        ctx.fillStyle = "#031a14";
        ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(meterX + 6, meterY + 28, meterW - 12, 26, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#6ee7b7";
        ctx.font = "6.5px var(--font-mono, monospace)";
        ctx.textAlign = "left";
        ctx.fillText("GAUGE (ρgh):", meterX + 10, meterY + 37);
        ctx.fillStyle = "#34d399";
        ctx.font = "bold 10px var(--font-mono, monospace)";
        ctx.fillText(`${calc.pGaugeKPa.toFixed(2)} kPa`, meterX + 10, meterY + 49);

        // Screen 2: Absolute Pressure (Amber LCD)
        ctx.fillStyle = "#1c1404";
        ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(meterX + 6, meterY + 58, meterW - 12, 26, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#fde68a";
        ctx.font = "6.5px var(--font-mono, monospace)";
        ctx.textAlign = "left";
        ctx.fillText("P_abs (P₀+ρgh):", meterX + 10, meterY + 67);
        ctx.fillStyle = "#facc15";
        ctx.font = "bold 9.5px var(--font-mono, monospace)";
        ctx.fillText(`${calc.pAbsKPa.toFixed(2)} kPa`, meterX + 10, meterY + 79);

        ctx.restore();
      }
    } else if (apparatusMode === "venturi") {
      // Venturi Flow Tube Mode
      drawVenturiTube(canvasWidth);
    } else if (apparatusMode === "torricelli") {
      // Torricelli Efflux Tank Mode
      drawTorricelliTank(canvasWidth);
    } else if (apparatusMode === "hydraulic") {
      // Pascal's Principle Hydraulic Press Mode
      drawHydraulicPress(canvasWidth);
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

      // Hydrodynamic Turbulence Flutter (Transverse Eddie Perturbations)
      let turbOffset = 0;
      if (calc.isTurbulent) {
        turbOffset = Math.sin(simTime * 14 + p.x * 0.08) * 3.5 * (localR / R1);
      } else if (calc.isTransitional) {
        turbOffset = Math.sin(simTime * 8 + p.x * 0.04) * 1.5 * (localR / R1);
      }

      const curY = py + p.yFrac * (localR - 6) + turbOffset;
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

      // Tracer bead head with flow regime coloring (crisp white for laminar, warm amber for transitional, rose for turbulent)
      ctx.fillStyle = calc.isTurbulent ? "#fca5a5" : (calc.isTransitional ? "#fef08a" : "#ffffff");
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

  function drawTorricelliTank(canvasWidth) {
    const canvasHeight = 530;
    const calc = getCalculations();
    const benchY = 485;

    // 1. Tabletop Bench Surface
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

    // 2. Tank Geometry & Supports
    const tankX = 55;
    const tankW = 150;
    const tankFloorY = benchY - 15; // 470
    const tankColumnH = 260; // 0.80 m column height in px (325 px/m)
    const liquidSurfaceY = tankFloorY - (calc.H_total / 0.80) * tankColumnH; // 210
    const tankTopY = 160;
    const S_y = tankColumnH / 0.80; // 325 px/m
    const S_x = 380; // 380 px/m horizontal scale
    const tankRightX = tankX + tankW; // 205

    // Tank Pedestal Support
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(tankX - 8, tankFloorY, tankW + 16, 15, 3);
    ctx.fill();
    ctx.stroke();

    // Rubber shock pads under pedestal
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(tankX + 6, tankFloorY + 11, 24, 4);
    ctx.fillRect(tankX + tankW - 30, tankFloorY + 11, 24, 4);

    // 3. Constant Supply Inflow & Overflow Ports
    // Overhead supply pipe pouring fresh water
    const supplyPipeX = tankX + 45;
    const pipeGrad = ctx.createLinearGradient(supplyPipeX - 8, 0, supplyPipeX + 8, 0);
    pipeGrad.addColorStop(0, "#475569");
    pipeGrad.addColorStop(0.4, "#f1f5f9");
    pipeGrad.addColorStop(1, "#334155");
    ctx.fillStyle = pipeGrad;
    ctx.fillRect(supplyPipeX - 6, 110, 12, 50);

    // Spigot nozzle
    ctx.fillStyle = "#64748b";
    ctx.beginPath();
    ctx.roundRect(supplyPipeX - 8, 155, 16, 8, 2);
    ctx.fill();

    // Inflow stream falling into liquid surface
    const trickleX = supplyPipeX;
    ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(trickleX, 163);
    ctx.lineTo(trickleX, liquidSurfaceY);
    ctx.stroke();

    // Inflow splash ripples
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    const ripR = 5 + Math.sin(simTime * 6) * 3;
    ctx.ellipse(trickleX, liquidSurfaceY, ripR, ripR * 0.35, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Inflow steady-state label
    ctx.font = "8px var(--font-mono, monospace)";
    ctx.fillStyle = "#94a3b8";
    ctx.textAlign = "center";
    ctx.fillText("STEADY RE-FILL (H = const)", supplyPipeX, 102);

    // Overflow safety port on left wall
    ctx.fillStyle = "#334155";
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(tankX - 18, liquidSurfaceY + 2, 20, 8, 2);
    ctx.fill();
    ctx.stroke();

    // 4. Glass Column Fluid Body
    const fluidGrad = ctx.createLinearGradient(tankX, liquidSurfaceY, tankX, tankFloorY);
    fluidGrad.addColorStop(0, calc.f.color);
    fluidGrad.addColorStop(0.2, calc.f.color);
    fluidGrad.addColorStop(1, "rgba(8, 51, 68, 0.95)");
    ctx.fillStyle = fluidGrad;
    ctx.fillRect(tankX + 1.5, liquidSurfaceY, tankW - 3, tankFloorY - liquidSurfaceY);

    // Liquid surface meniscus
    ctx.strokeStyle = calc.f.surfaceColor;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(tankX, liquidSurfaceY);
    ctx.lineTo(tankX + tankW, liquidSurfaceY);
    ctx.stroke();

    // Rising micro-bubbles in column
    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
    for (let i = 0; i < 18; i++) {
      const bx = tankX + 18 + ((i * 37 + Math.sin(simTime * 1.5 + i) * 12) % (tankW - 36));
      const by = liquidSurfaceY + 12 + (((i * 41 - simTime * 32) % (tankFloorY - liquidSurfaceY - 20) + (tankFloorY - liquidSurfaceY - 20)) % (tankFloorY - liquidSurfaceY - 20));
      const br = 1.2 + (i % 3) * 0.6;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    }

    // Glass Tank Walls (Double Line with reflections)
    ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(tankX, tankTopY);
    ctx.lineTo(tankX, tankFloorY);
    ctx.lineTo(tankRightX, tankFloorY);
    ctx.lineTo(tankRightX, tankTopY);
    ctx.stroke();

    // Glass Wall specular sheen on left wall
    const sheenGrad = ctx.createLinearGradient(tankX, 0, tankX + 25, 0);
    sheenGrad.addColorStop(0, "rgba(255, 255, 255, 0.22)");
    sheenGrad.addColorStop(1, "rgba(255, 255, 255, 0.0)");
    ctx.fillStyle = sheenGrad;
    ctx.fillRect(tankX + 2, tankTopY, 22, tankFloorY - tankTopY);

    // 5. Height Metric Ruler along Left Tank Edge
    const rulerX = tankX - 4;
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rulerX, tankFloorY);
    ctx.lineTo(rulerX, tankFloorY - tankColumnH);
    ctx.stroke();

    ctx.font = "8px var(--font-mono, monospace)";
    ctx.fillStyle = "#94a3b8";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    for (let cm = 0; cm <= 80; cm += 10) {
      const yPos = tankFloorY - (cm / 80) * tankColumnH;
      const isMajor = cm % 20 === 0;
      const tickW = isMajor ? 8 : 4;
      ctx.beginPath();
      ctx.moveTo(rulerX, yPos);
      ctx.lineTo(rulerX - tickW, yPos);
      ctx.stroke();
      if (isMajor) {
        ctx.fillText(`${cm}cm`, rulerX - 11, yPos);
      }
    }
    ctx.restore();

    // Total Column Head H dimension bracket
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(tankX - 42, tankFloorY);
    ctx.lineTo(tankX - 48, tankFloorY);
    ctx.lineTo(tankX - 48, liquidSurfaceY);
    ctx.lineTo(tankX - 42, liquidSurfaceY);
    ctx.stroke();
    drawVectorPill(ctx, tankX - 52, (liquidSurfaceY + tankFloorY) / 2, "H = 0.80 m", "#38bdf8", "right");

    // 6. Side Orifice Spout & Discharge Nozzle Assembly
    const nozzleY = tankFloorY - (calc.y_h / 0.80) * tankColumnH;
    const nozzleExitX = tankRightX + 20;

    // Vertical sliding track along tank right wall
    ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    const trackTopY = tankFloorY - (0.70 / 0.80) * tankColumnH;
    const trackBottomY = tankFloorY - (0.10 / 0.80) * tankColumnH;
    ctx.moveTo(tankRightX, trackTopY - 10);
    ctx.lineTo(tankRightX, trackBottomY + 10);
    ctx.stroke();

    // Draggable Orifice Spout Collar
    const nozzleCollarH = 20;
    const collarGrad = ctx.createLinearGradient(tankRightX, nozzleY - 10, tankRightX + 20, nozzleY + 10);
    collarGrad.addColorStop(0, "#475569");
    collarGrad.addColorStop(0.4, "#cbd5e1");
    collarGrad.addColorStop(1, "#334155");
    ctx.fillStyle = collarGrad;
    ctx.beginPath();
    ctx.roundRect(tankRightX - 4, nozzleY - nozzleCollarH / 2, 24, nozzleCollarH, 3);
    ctx.fill();
    ctx.strokeStyle = isDraggingOrifice ? "#facc15" : "#38bdf8";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Nozzle orifice lip
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.ellipse(nozzleExitX, nozzleY, 3, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Tactile drag arrows on nozzle collar
    ctx.fillStyle = isDraggingOrifice ? "#facc15" : "#f8fafc";
    ctx.font = "bold 9px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⇅", tankRightX + 8, nozzleY);

    // 6b. Dual Dimension Brackets: Liquid Head (h) and Orifice Elevation (y_h)
    // Both brackets partition total column H = h + y_h without visual collision
    const dimBracketX = tankRightX - 48;

    // Upper Liquid Head (h) Dimension Line
    ctx.strokeStyle = "rgba(250, 204, 21, 0.85)";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(dimBracketX, liquidSurfaceY);
    ctx.lineTo(dimBracketX, nozzleY);
    ctx.stroke();
    // Head end tick marks
    ctx.beginPath();
    ctx.moveTo(dimBracketX - 5, liquidSurfaceY);
    ctx.lineTo(dimBracketX + 5, liquidSurfaceY);
    ctx.moveTo(dimBracketX - 5, nozzleY);
    ctx.lineTo(dimBracketX + 5, nozzleY);
    ctx.stroke();
    drawVectorPill(ctx, dimBracketX, (liquidSurfaceY + nozzleY) / 2, `h = ${(calc.headM * 100).toFixed(1)} cm`, "#facc15", "center");

    // Lower Orifice Elevation (y_h) Dimension Line
    ctx.strokeStyle = isDraggingOrifice ? "rgba(250, 204, 21, 0.85)" : "rgba(56, 189, 248, 0.85)";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(dimBracketX, nozzleY);
    ctx.lineTo(dimBracketX, tankFloorY);
    ctx.stroke();
    // Elevation end tick marks
    ctx.beginPath();
    ctx.moveTo(dimBracketX - 5, tankFloorY);
    ctx.lineTo(dimBracketX + 5, tankFloorY);
    ctx.stroke();
    drawVectorPill(ctx, dimBracketX, (nozzleY + tankFloorY) / 2, `y_h = ${(calc.y_h * 100).toFixed(0)} cm`, isDraggingOrifice ? "#facc15" : "#38bdf8", "center");

    // 7. Catch Basin & Graduated Metric Trough
    const troughX = 215;
    const troughW = canvasWidth - 235;
    const troughY = tankFloorY - 4;
    const troughH = 18;

    // Trough casing
    const troughGrad = ctx.createLinearGradient(0, troughY, 0, troughY + troughH);
    troughGrad.addColorStop(0, "#1e293b");
    troughGrad.addColorStop(0.5, "#334155");
    troughGrad.addColorStop(1, "#0f172a");
    ctx.fillStyle = troughGrad;
    ctx.beginPath();
    ctx.roundRect(troughX, troughY, troughW, troughH, [0, 4, 4, 0]);
    ctx.fill();
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Internal water catch layer in trough
    ctx.fillStyle = "rgba(6, 182, 212, 0.35)";
    ctx.fillRect(troughX + 2, troughY + 5, troughW - 4, troughH - 7);

    // Trough Metric Centimeter Graduations (0 to 80 cm)
    ctx.font = "8px var(--font-mono, monospace)";
    ctx.fillStyle = "#94a3b8";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let cm = 0; cm <= 80; cm += 10) {
      const markX = nozzleExitX + (cm / 100) * S_x;
      if (markX <= troughX + troughW - 5) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(markX, troughY);
        ctx.lineTo(markX, troughY + 5);
        ctx.stroke();
        ctx.fillText(`${cm}`, markX, troughY + 6);
      }
    }

    // 8. Educational Comparison Ghost Paths (y = 20 cm and y = 60 cm)
    const ghostConfigs = [
      { y_h: 0.20, label: "y=20cm" },
      { y_h: 0.60, label: "y=60cm" }
    ];

    ctx.save();
    ghostConfigs.forEach(gCfg => {
      const gHead = calc.H_total - gCfg.y_h;
      const gV = dischargeCoeff * Math.sqrt(2 * 9.81 * gHead);
      const gT = Math.sqrt((2 * gCfg.y_h) / 9.81);
      const gNozzleY = tankFloorY - (gCfg.y_h / 0.80) * tankColumnH;

      ctx.strokeStyle = "rgba(148, 163, 184, 0.22)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      for (let s = 0; s <= 25; s++) {
        const tCur = (s / 25) * gT;
        const gx = nozzleExitX + (gV * tCur) * S_x;
        const gy = gNozzleY + 0.5 * 9.81 * tCur * tCur * S_y;
        if (s === 0) ctx.moveTo(gx, gy);
        else ctx.lineTo(gx, gy);
      }
      ctx.stroke();
    });
    ctx.restore();

    // 9. Theoretical Frictionless Ideal Trajectory (Cd = 1.0)
    ctx.save();
    ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    for (let s = 0; s <= 30; s++) {
      const tCur = (s / 30) * calc.tFlight;
      const ix = nozzleExitX + (calc.vIdeal * tCur) * S_x;
      const iy = nozzleY + 0.5 * 9.81 * tCur * tCur * S_y;
      if (s === 0) ctx.moveTo(ix, iy);
      else ctx.lineTo(ix, iy);
    }
    ctx.stroke();
    ctx.restore();

    // 10. Actual Streaming Efflux Fluid Jet (Parabola)
    const landingX = nozzleExitX + calc.rangeM * S_x;

    // Fluid Jet Ribbon Fill
    const steps = 36;
    const upperPoints = [];
    const lowerPoints = [];

    for (let s = 0; s <= steps; s++) {
      const t = (s / steps) * calc.tFlight;
      const x = nozzleExitX + (calc.vActual * t) * S_x;
      const y = nozzleY + 0.5 * 9.81 * t * t * S_y;
      // Jet thickness tapers slightly due to gravitational acceleration
      const thick = 5.5 * Math.pow(Math.max(0.2, 1.0 - (s / steps) * 0.45), 0.5);
      upperPoints.push({ x, y: y - thick });
      lowerPoints.push({ x, y: y + thick });
    }

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(upperPoints[0].x, upperPoints[0].y);
    for (let i = 1; i < upperPoints.length; i++) ctx.lineTo(upperPoints[i].x, upperPoints[i].y);
    for (let i = lowerPoints.length - 1; i >= 0; i--) ctx.lineTo(lowerPoints[i].x, lowerPoints[i].y);
    ctx.closePath();

    const jetGrad = ctx.createLinearGradient(nozzleExitX, nozzleY, landingX, tankFloorY);
    jetGrad.addColorStop(0, calc.f.color);
    jetGrad.addColorStop(0.5, "rgba(56, 189, 248, 0.75)");
    jetGrad.addColorStop(1, "rgba(14, 165, 233, 0.95)");
    ctx.fillStyle = jetGrad;
    ctx.fill();

    // Upper specular highlight streak
    ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(upperPoints[0].x, upperPoints[0].y + 1);
    for (let i = 1; i < upperPoints.length; i++) ctx.lineTo(upperPoints[i].x, upperPoints[i].y + 1);
    ctx.stroke();
    ctx.restore();

    // Animated Streaming Water Droplets inside Jet
    for (let i = 0; i < torricelliParticles.length; i++) {
      const p = torricelliParticles[i];
      p.progress = (p.progress + 0.015 * p.speed) % 1.0;
      const tP = p.progress * calc.tFlight;
      const px = nozzleExitX + (calc.vActual * tP) * S_x;
      const py = nozzleY + 0.5 * 9.81 * tP * tP * S_y + p.yScatter;

      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 11. Landing Point Impact & Splashing Basin
    // Glowing impact vertical marker
    ctx.strokeStyle = calc.isAtMaxRange ? "#facc15" : "#38bdf8";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(landingX, troughY - 8);
    ctx.lineTo(landingX, troughY + 5);
    ctx.stroke();

    // Concentric Splash Ripples in trough
    ctx.strokeStyle = calc.isAtMaxRange ? "rgba(250, 204, 21, 0.7)" : "rgba(56, 189, 248, 0.7)";
    ctx.lineWidth = 1.5;
    for (let r = 1; r <= 3; r++) {
      const ripPhase = ((simTime * 5 + r * 0.33) % 1.0);
      const ripRad = ripPhase * 16;
      ctx.beginPath();
      ctx.ellipse(landingX, troughY + 3, ripRad, ripRad * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Dynamic Splash droplets leaping up
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    for (let s = 0; s < 6; s++) {
      const splashAngle = -Math.PI / 2 + (s - 2.5) * 0.35;
      const splashDist = 8 + Math.sin(simTime * 12 + s) * 7;
      const spX = landingX + Math.cos(splashAngle) * splashDist;
      const spY = troughY - Math.abs(Math.sin(splashAngle)) * splashDist;
      ctx.beginPath();
      ctx.arc(spX, spY, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Landing Range Callout Pill
    drawVectorPill(ctx, landingX, troughY - 26, `R = ${calc.rangeM.toFixed(2)} m (${(calc.rangeM * 100).toFixed(1)} cm)`, calc.isAtMaxRange ? "#facc15" : "#38bdf8", "center");

    // 12. Floating Academic Principle Banner (Header Card)
    const cardX = 230;
    const cardY = 70;
    const cardW = canvasWidth - cardX - 25;
    const cardH = 50;

    ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
    ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 8);
    ctx.fill();
    ctx.stroke();

    const colW = cardW / 3;
    // Col 1: Torricelli Efflux Velocity
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#94a3b8";
    ctx.font = "8px system-ui, sans-serif";
    ctx.fillText("TORRICELLI'S LAW (EFFLUX VELOCITY)", cardX + colW * 0.5, cardY + 14);
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 10px var(--font-mono, monospace)";
    ctx.fillText(`v = C_d·√(2gh) = ${calc.vActual.toFixed(2)} m/s`, cardX + colW * 0.5, cardY + 32);

    // Divider 1
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cardX + colW, cardY + 6);
    ctx.lineTo(cardX + colW, cardY + cardH - 6);
    ctx.stroke();

    // Col 2: Efflux Trajectory Range
    ctx.fillStyle = "#94a3b8";
    ctx.font = "8px system-ui, sans-serif";
    ctx.fillText("PARABOLIC HORIZONTAL RANGE", cardX + colW * 1.5, cardY + 14);
    ctx.fillStyle = calc.isAtMaxRange ? "#facc15" : "#38bdf8";
    ctx.font = "bold 10px var(--font-mono, monospace)";
    ctx.fillText(`R = 2·C_d·√(h·y_h) = ${calc.rangeM.toFixed(2)} m`, cardX + colW * 1.5, cardY + 32);

    // Divider 2
    ctx.beginPath();
    ctx.moveTo(cardX + colW * 2, cardY + 6);
    ctx.lineTo(cardX + colW * 2, cardY + cardH - 6);
    ctx.stroke();

    // Col 3: Maximum Range Theorem
    ctx.fillStyle = "#94a3b8";
    ctx.font = "8px system-ui, sans-serif";
    ctx.fillText("MAX RANGE THEOREM (AT y = H/2)", cardX + colW * 2.5, cardY + 14);
    ctx.fillStyle = calc.isAtMaxRange ? "#facc15" : "#10b981";
    ctx.font = "bold 10px var(--font-mono, monospace)";
    ctx.fillText(calc.isAtMaxRange ? `★ PEAK RANGE: ${calc.maxRangeM.toFixed(2)} m` : `R_max = ${(calc.maxRangeM).toFixed(2)} m (y=0.40m)`, cardX + colW * 2.5, cardY + 32);
  }

  function drawHydraulicPress(canvasWidth) {
    const canvasHeight = 530;
    const calc = getCalculations();
    const benchY = 475;

    // 1. Tabletop Workshop Bench
    const benchGrad = ctx.createLinearGradient(0, benchY, 0, canvasHeight);
    benchGrad.addColorStop(0, "#0f172a");
    benchGrad.addColorStop(0.12, "#1e293b");
    benchGrad.addColorStop(1, "#090d16");
    ctx.fillStyle = benchGrad;
    ctx.fillRect(0, benchY, canvasWidth, canvasHeight - benchY);

    ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, benchY);
    ctx.lineTo(canvasWidth, benchY);
    ctx.stroke();

    // Steel base plate mounting brackets
    ctx.fillStyle = "#334155";
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(40, benchY - 10, canvasWidth - 80, 10, 2);
    ctx.fill();
    ctx.stroke();

    // 2. Geometry layout
    const cyl1CenterX = Math.max(90, Math.round(canvasWidth * 0.22));
    const cyl2CenterX = Math.min(canvasWidth - 140, Math.round(canvasWidth * 0.70));
    
    // Scale cylinder diameters in px
    const cyl1Width = Math.max(30, Math.min(65, (piston1DiameterCm / 8.0) * 55));
    const cyl2Width = Math.max(80, Math.min(170, (piston2DiameterCm / 40.0) * 150));
    
    const manifoldTopY = benchY - 50;
    const manifoldBotY = benchY - 14;

    const cylTopY = 220; // Top of cylinder bores
    const cyl1LeftX = cyl1CenterX - cyl1Width / 2;
    const cyl1RightX = cyl1CenterX + cyl1Width / 2;
    const cyl2LeftX = cyl2CenterX - cyl2Width / 2;
    const cyl2RightX = cyl2CenterX + cyl2Width / 2;

    // 3. Fluid Body (Connected U-Tube System)
    const p1TravelPx = 110;
    const p1NormStroke = Math.min(1.0, inputStrokeCm / 25.0);
    const p1Y = cylTopY + 30 + p1NormStroke * p1TravelPx; // Piston 1 face Y
    
    // Large piston stroke d2 raises fluid up (A1*d1 = A2*d2)
    const p2TravelPx = (p1TravelPx / calc.ima);
    const liftFraction = calc.canLiftLoad ? 1.0 : Math.min(0.9, calc.outputForceN / calc.loadWeightN);
    const p2LiftPx = p2TravelPx * liftFraction;
    const p2RestY = manifoldTopY - 20;
    const p2Y = p2RestY - p2LiftPx; // Piston 2 face Y

    // Fill Hydraulic Fluid
    const fluidGrad = ctx.createLinearGradient(0, Math.min(p1Y, p2Y), 0, manifoldBotY);
    if (fluidKey === "oil") {
      fluidGrad.addColorStop(0, "rgba(234, 179, 8, 0.75)");
      fluidGrad.addColorStop(0.5, "rgba(202, 138, 4, 0.85)");
      fluidGrad.addColorStop(1, "rgba(161, 98, 7, 0.95)");
    } else if (fluidKey === "mercury") {
      fluidGrad.addColorStop(0, "rgba(148, 163, 184, 0.85)");
      fluidGrad.addColorStop(0.5, "rgba(100, 116, 139, 0.95)");
      fluidGrad.addColorStop(1, "rgba(71, 85, 105, 1.0)");
    } else if (fluidKey === "glycerin") {
      fluidGrad.addColorStop(0, "rgba(168, 85, 247, 0.75)");
      fluidGrad.addColorStop(0.5, "rgba(147, 51, 234, 0.85)");
      fluidGrad.addColorStop(1, "rgba(126, 34, 206, 0.95)");
    } else {
      // Default Hydraulic Blue Oil
      fluidGrad.addColorStop(0, "rgba(14, 165, 233, 0.75)");
      fluidGrad.addColorStop(0.5, "rgba(2, 132, 199, 0.85)");
      fluidGrad.addColorStop(1, "rgba(3, 105, 161, 0.95)");
    }

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cyl1LeftX, p1Y);
    ctx.lineTo(cyl1RightX, p1Y);
    ctx.lineTo(cyl1RightX, manifoldTopY);
    ctx.lineTo(cyl2LeftX, manifoldTopY);
    ctx.lineTo(cyl2LeftX, p2Y);
    ctx.lineTo(cyl2RightX, p2Y);
    ctx.lineTo(cyl2RightX, manifoldBotY);
    ctx.lineTo(cyl1LeftX, manifoldBotY);
    ctx.closePath();
    ctx.fillStyle = fluidGrad;
    ctx.fill();

    // Internal isobaric pressure flow streamlines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([6, 6]);
    ctx.lineDashOffset = -simTime * 25;
    ctx.beginPath();
    const flowMidY = (manifoldTopY + manifoldBotY) / 2;
    ctx.moveTo(cyl1CenterX, (p1Y + manifoldTopY) / 2);
    ctx.lineTo(cyl1CenterX, flowMidY);
    ctx.lineTo(cyl2CenterX, flowMidY);
    ctx.lineTo(cyl2CenterX, (p2Y + manifoldTopY) / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // 4. Heavy Steel Cylinder Walls
    function drawCylinderBore(leftX, rightX, topY, botY, width) {
      const wallThick = 9;
      // Left wall
      const wallGrad1 = ctx.createLinearGradient(leftX - wallThick, 0, leftX, 0);
      wallGrad1.addColorStop(0, "#1e293b");
      wallGrad1.addColorStop(0.4, "#475569");
      wallGrad1.addColorStop(1, "#334155");
      ctx.fillStyle = wallGrad1;
      ctx.fillRect(leftX - wallThick, topY, wallThick, botY - topY);
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 1;
      ctx.strokeRect(leftX - wallThick, topY, wallThick, botY - topY);

      // Right wall
      const wallGrad2 = ctx.createLinearGradient(rightX, 0, rightX + wallThick, 0);
      wallGrad2.addColorStop(0, "#334155");
      wallGrad2.addColorStop(0.6, "#475569");
      wallGrad2.addColorStop(1, "#1e293b");
      ctx.fillStyle = wallGrad2;
      ctx.fillRect(rightX, topY, wallThick, botY - topY);
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 1;
      ctx.strokeRect(rightX, topY, wallThick, botY - topY);

      // Top cylinder flange collar
      ctx.fillStyle = "#334155";
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(leftX - wallThick - 4, topY - 5, width + wallThick * 2 + 8, 8, 2);
      ctx.fill();
      ctx.stroke();
    }

    drawCylinderBore(cyl1LeftX, cyl1RightX, cylTopY, manifoldTopY, cyl1Width);
    drawCylinderBore(cyl2LeftX, cyl2RightX, cylTopY + 20, manifoldTopY, cyl2Width);

    // Manifold Bottom Pipe Shell
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cyl1RightX, manifoldTopY);
    ctx.lineTo(cyl2LeftX, manifoldTopY);
    ctx.moveTo(cyl1LeftX - 9, manifoldBotY);
    ctx.lineTo(cyl2RightX + 9, manifoldBotY);
    ctx.stroke();

    // 5. Small Piston Plunger (Piston 1)
    const p1Thick = 14;
    const pHeadGrad = ctx.createLinearGradient(cyl1LeftX, 0, cyl1RightX, 0);
    pHeadGrad.addColorStop(0, "#475569");
    pHeadGrad.addColorStop(0.4, "#cbd5e1");
    pHeadGrad.addColorStop(1, "#334155");
    ctx.fillStyle = pHeadGrad;
    ctx.fillRect(cyl1LeftX + 1, p1Y - p1Thick, cyl1Width - 2, p1Thick);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(cyl1LeftX + 1, p1Y - p1Thick / 2 - 2, cyl1Width - 2, 4);

    // Piston Rod
    const rod1W = Math.max(8, cyl1Width * 0.35);
    const rod1TopY = p1Y - 70;
    const rodGrad = ctx.createLinearGradient(cyl1CenterX - rod1W / 2, 0, cyl1CenterX + rod1W / 2, 0);
    rodGrad.addColorStop(0, "#94a3b8");
    rodGrad.addColorStop(0.5, "#f8fafc");
    rodGrad.addColorStop(1, "#475569");
    ctx.fillStyle = rodGrad;
    ctx.fillRect(cyl1CenterX - rod1W / 2, rod1TopY, rod1W, p1Y - p1Thick - rod1TopY);

    // Plunger Ergonomic Handle / Push Pad
    const handleW = Math.max(50, cyl1Width + 24);
    const handleH = 16;
    const handleY = rod1TopY - handleH;
    ctx.save();
    ctx.fillStyle = isDraggingPiston1 ? "#38bdf8" : "#0284c7";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = isDraggingPiston1 ? 14 : 6;
    ctx.beginPath();
    ctx.roundRect(cyl1CenterX - handleW / 2, handleY, handleW, handleH, 5);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Handle grip ridges
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 1.2;
    for (let gx = -16; gx <= 16; gx += 8) {
      ctx.beginPath();
      ctx.moveTo(cyl1CenterX + gx, handleY + 4);
      ctx.lineTo(cyl1CenterX + gx, handleY + handleH - 4);
      ctx.stroke();
    }

    // Drag Hint & Label on Handle
    ctx.font = "bold 9px var(--font-mono, monospace)";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText("INPUT F₁ ↕", cyl1CenterX, handleY - 6);
    ctx.restore();

    // Applied Force Vector F1 (Pointing Down onto handle)
    const f1VecLen = Math.min(55, Math.max(22, (inputForceN / 1000) * 55));
    drawVectorArrow(ctx, cyl1CenterX, handleY - 14 - f1VecLen, cyl1CenterX, handleY - 14, "#38bdf8", 3);
    ctx.font = "bold 10px var(--font-mono, monospace)";
    ctx.fillStyle = "#38bdf8";
    ctx.textAlign = "center";
    ctx.fillText(`F₁ = ${inputForceN.toFixed(0)} N`, cyl1CenterX, handleY - 18 - f1VecLen);

    // Stroke d1 dimension bracket
    const p1RestY = cylTopY + 30;
    if (p1Y > p1RestY + 4) {
      const dimX = cyl1LeftX - 16;
      ctx.strokeStyle = "#34d399";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(dimX - 4, p1RestY);
      ctx.lineTo(dimX, p1RestY);
      ctx.lineTo(dimX, p1Y);
      ctx.lineTo(dimX - 4, p1Y);
      ctx.stroke();
      ctx.font = "9px var(--font-mono, monospace)";
      ctx.fillStyle = "#34d399";
      ctx.textAlign = "right";
      ctx.fillText(`d₁ = ${inputStrokeCm.toFixed(1)} cm`, dimX - 6, (p1RestY + p1Y) / 2 + 3);
    }

    // 6. Large Hydraulic Ram & Lift Platform (Piston 2)
    const p2Thick = 20;
    const p2HeadGrad = ctx.createLinearGradient(cyl2LeftX, 0, cyl2RightX, 0);
    p2HeadGrad.addColorStop(0, "#334155");
    p2HeadGrad.addColorStop(0.3, "#cbd5e1");
    p2HeadGrad.addColorStop(1, "#1e293b");
    ctx.fillStyle = p2HeadGrad;
    ctx.fillRect(cyl2LeftX + 1, p2Y - p2Thick, cyl2Width - 2, p2Thick);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(cyl2LeftX + 1, p2Y - p2Thick / 2 - 2, cyl2Width - 2, 5);

    // Heavy Ram Column Rod
    const rod2W = Math.max(22, cyl2Width * 0.45);
    const platformH = 18;
    const platformY = p2Y - p2Thick - 45;
    const ramGrad = ctx.createLinearGradient(cyl2CenterX - rod2W / 2, 0, cyl2CenterX + rod2W / 2, 0);
    ramGrad.addColorStop(0, "#475569");
    ramGrad.addColorStop(0.3, "#f8fafc");
    ramGrad.addColorStop(0.7, "#94a3b8");
    ramGrad.addColorStop(1, "#334155");
    ctx.fillStyle = ramGrad;
    ctx.fillRect(cyl2CenterX - rod2W / 2, platformY + platformH, rod2W, (p2Y - p2Thick) - (platformY + platformH));

    // Lift Platform (Heavy Steel Table with Safety Hazard Stripes)
    const platW = Math.max(cyl2Width + 50, 150);
    const platLeftX = cyl2CenterX - platW / 2;
    const platRightX = cyl2CenterX + platW / 2;

    const platGrad = ctx.createLinearGradient(0, platformY, 0, platformY + platformH);
    platGrad.addColorStop(0, "#64748b");
    platGrad.addColorStop(0.3, "#94a3b8");
    platGrad.addColorStop(1, "#334155");
    ctx.fillStyle = platGrad;
    ctx.fillRect(platLeftX, platformY, platW, platformH);
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(platLeftX, platformY, platW, platformH);

    // Safety hazard chevron stripes on front lip
    ctx.save();
    ctx.beginPath();
    ctx.rect(platLeftX + 1, platformY + 1, platW - 2, platformH - 2);
    ctx.clip();
    for (let sx = platLeftX - 10; sx < platRightX + 20; sx += 14) {
      ctx.fillStyle = "#eab308";
      ctx.beginPath();
      ctx.moveTo(sx, platformY + platformH);
      ctx.lineTo(sx + 7, platformY);
      ctx.lineTo(sx + 13, platformY);
      ctx.lineTo(sx + 6, platformY + platformH);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Lift displacement d2 bracket
    if (p2LiftPx > 2) {
      const dim2X = cyl2RightX + 16;
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(dim2X, p2RestY);
      ctx.lineTo(dim2X + 4, p2RestY);
      ctx.lineTo(dim2X + 4, p2Y);
      ctx.lineTo(dim2X, p2Y);
      ctx.stroke();
      ctx.font = "9px var(--font-mono, monospace)";
      ctx.fillStyle = "#facc15";
      ctx.textAlign = "left";
      ctx.fillText(`d₂ = ${calc.outputStrokeCm.toFixed(2)} cm`, dim2X + 7, (p2RestY + p2Y) / 2 + 3);
    }

    // 7. Render Lifted Vehicle / Load on Platform
    drawHydraulicLoad(ctx, cyl2CenterX, platformY, calc);

    // Upward Lift Force Vector F2 (Pointing Up from platform)
    const f2VecLen = Math.min(65, Math.max(25, (calc.outputForceN / (calc.loadWeightN * 1.5)) * 65));
    drawVectorArrow(ctx, cyl2CenterX, platformY, cyl2CenterX, platformY - f2VecLen, "#10b981", 3.5);
    ctx.font = "bold 10.5px var(--font-mono, monospace)";
    ctx.fillStyle = "#10b981";
    ctx.textAlign = "center";
    ctx.fillText(`F₂ = ${(calc.outputForceN / 1000).toFixed(2)} kN (${(calc.outputForceN).toFixed(0)} N)`, cyl2CenterX, platformY - f2VecLen - 6);

    // 8. Bourdon Tube Pressure Dial Gauge (Center Manifold)
    const gaugeX = Math.round((cyl1CenterX + cyl2CenterX) / 2);
    const gaugeY = manifoldTopY - 32;
    const gaugeR = 26;

    // Gauge mounting vertical brass stem
    ctx.fillStyle = "#ca8a04";
    ctx.fillRect(gaugeX - 4, gaugeY + gaugeR - 2, 8, manifoldTopY - (gaugeY + gaugeR) + 4);

    // Outer Chrome Rim
    const rimGrad = ctx.createLinearGradient(gaugeX - gaugeR, gaugeY - gaugeR, gaugeX + gaugeR, gaugeY + gaugeR);
    rimGrad.addColorStop(0, "#f8fafc");
    rimGrad.addColorStop(0.5, "#64748b");
    rimGrad.addColorStop(1, "#1e293b");
    ctx.fillStyle = rimGrad;
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, gaugeR + 3, 0, Math.PI * 2);
    ctx.fill();

    // White Gauge Face Dial
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, gaugeR, 0, Math.PI * 2);
    ctx.fill();

    // Gauge tick marks
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    for (let a = -Math.PI * 0.75; a <= Math.PI * 0.75; a += Math.PI * 0.25) {
      ctx.beginPath();
      ctx.moveTo(gaugeX + Math.cos(a) * (gaugeR - 5), gaugeY + Math.sin(a) * (gaugeR - 5));
      ctx.lineTo(gaugeX + Math.cos(a) * (gaugeR - 1), gaugeY + Math.sin(a) * (gaugeR - 1));
      ctx.stroke();
    }

    // Gauge Needle
    const normP = Math.min(1.0, calc.pressureKPa / 600);
    const needleAngle = -Math.PI * 0.75 + normP * (Math.PI * 1.5);
    ctx.save();
    ctx.strokeStyle = "#dc2626";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(gaugeX, gaugeY);
    ctx.lineTo(gaugeX + Math.cos(needleAngle) * (gaugeR - 6), gaugeY + Math.sin(needleAngle) * (gaugeR - 6));
    ctx.stroke();
    // Center cap
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Gauge Digital Readout Tag
    ctx.font = "bold 9px var(--font-mono, monospace)";
    ctx.fillStyle = "#38bdf8";
    ctx.textAlign = "center";
    ctx.fillText(`${calc.pressureKPa.toFixed(0)} kPa`, gaugeX, gaugeY - gaugeR - 6);
    ctx.font = "7.5px var(--font-mono, monospace)";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(`P = ${calc.pressureBar.toFixed(2)} bar`, gaugeX, gaugeY + gaugeR + 13);

    // 9. Analytical Telemetry Card on Canvas Bottom
    const cardY = 485;
    const cardH = 40;
    const cardX = 35;
    const cardW = canvasWidth - 70;
    const colW = cardW / 4;

    ctx.fillStyle = "rgba(15, 23, 42, 0.94)";
    ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 8);
    ctx.fill();
    ctx.stroke();

    // Col 1: Pascal Pressure Transmission
    ctx.fillStyle = "#94a3b8";
    ctx.font = "8px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("PASCAL'S LAW (ISOBARIC P)", cardX + colW * 0.5, cardY + 13);
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 10px var(--font-mono, monospace)";
    ctx.fillText(`P₁ = P₂ = ${calc.pressureKPa.toFixed(1)} kPa`, cardX + colW * 0.5, cardY + 30);

    // Divider 1
    ctx.strokeStyle = "rgba(51, 65, 85, 0.6)";
    ctx.beginPath();
    ctx.moveTo(cardX + colW, cardY + 6);
    ctx.lineTo(cardX + colW, cardY + cardH - 6);
    ctx.stroke();

    // Col 2: Mechanical Advantage IMA
    ctx.fillStyle = "#94a3b8";
    ctx.font = "8px system-ui, sans-serif";
    ctx.fillText("MECHANICAL ADVANTAGE", cardX + colW * 1.5, cardY + 13);
    ctx.fillStyle = "#34d399";
    ctx.font = "bold 10px var(--font-mono, monospace)";
    ctx.fillText(`IMA = (D₂/D₁)² = ${calc.ima.toFixed(1)}×`, cardX + colW * 1.5, cardY + 30);

    // Divider 2
    ctx.beginPath();
    ctx.moveTo(cardX + colW * 2, cardY + 6);
    ctx.lineTo(cardX + colW * 2, cardY + cardH - 6);
    ctx.stroke();

    // Col 3: Work Conservation
    ctx.fillStyle = "#94a3b8";
    ctx.font = "8px system-ui, sans-serif";
    ctx.fillText("ENERGY CONSERVATION (WORK)", cardX + colW * 2.5, cardY + 13);
    ctx.fillStyle = "#facc15";
    ctx.font = "bold 10px var(--font-mono, monospace)";
    ctx.fillText(`W₁ = W₂ = ${calc.workJ.toFixed(2)} J`, cardX + colW * 2.5, cardY + 30);

    // Divider 3
    ctx.beginPath();
    ctx.moveTo(cardX + colW * 3, cardY + 6);
    ctx.lineTo(cardX + colW * 3, cardY + cardH - 6);
    ctx.stroke();

    // Col 4: Lift Status & Vehicle Load
    ctx.fillStyle = "#94a3b8";
    ctx.font = "8px system-ui, sans-serif";
    ctx.fillText("LOAD LIFT STATUS", cardX + colW * 3.5, cardY + 13);
    ctx.fillStyle = calc.canLiftLoad ? "#34d399" : "#f87171";
    ctx.font = "bold 10px var(--font-mono, monospace)";
    ctx.fillText(calc.canLiftLoad ? `✓ LIFTED (${calc.load.massKg} kg)` : `✗ HEAVY (Needs ${(calc.minForceToLiftN).toFixed(0)} N)`, cardX + colW * 3.5, cardY + 30);
  }

  function drawHydraulicLoad(c, x, platformY, calc) {
    c.save();
    const loadKey = liftedLoadKey;

    if (loadKey === "weights") {
      // Precision Slotted Weights Stack
      const spindleH = 50;
      c.fillStyle = "#94a3b8";
      c.fillRect(x - 3, platformY - spindleH, 6, spindleH);
      
      const numWeights = 5;
      const weightH = 8;
      for (let i = 0; i < numWeights; i++) {
        const wY = platformY - (i + 1) * weightH;
        const wW = 75 - i * 6;
        const discGrad = c.createLinearGradient(x - wW / 2, 0, x + wW / 2, 0);
        discGrad.addColorStop(0, "#a855f7");
        discGrad.addColorStop(0.3, "#e9d5ff");
        discGrad.addColorStop(1, "#7e22ce");
        c.fillStyle = discGrad;
        c.beginPath();
        c.roundRect(x - wW / 2, wY, wW, weightH - 1, 2);
        c.fill();
        c.strokeStyle = "#c084fc";
        c.lineWidth = 1;
        c.stroke();
      }
      c.font = "bold 9px var(--font-mono, monospace)";
      c.fillStyle = "#f8fafc";
      c.textAlign = "center";
      c.fillText("CALIBRATION DISCS (300 kg)", x, platformY - spindleH - 8);
    } else if (loadKey === "forklift") {
      // Industrial Forklift
      const bY = platformY - 14;
      // Body chassis
      c.fillStyle = "#eab308";
      c.beginPath();
      c.roundRect(x - 45, bY - 25, 65, 25, [6, 4, 0, 0]);
      c.fill();
      // Counterweight rear
      c.fillStyle = "#334155";
      c.fillRect(x - 45, bY - 20, 16, 20);
      // Roll cage cabin
      c.strokeStyle = "#0f172a";
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(x - 20, bY - 25);
      c.lineTo(x - 20, bY - 50);
      c.lineTo(x + 10, bY - 50);
      c.lineTo(x + 10, bY - 25);
      c.stroke();
      // Front vertical mast
      c.strokeStyle = "#475569";
      c.lineWidth = 4;
      c.beginPath();
      c.moveTo(x + 22, bY);
      c.lineTo(x + 22, bY - 55);
      c.stroke();
      // Wheels
      c.fillStyle = "#0f172a";
      c.beginPath();
      c.arc(x - 30, platformY - 7, 7, 0, Math.PI * 2);
      c.arc(x + 15, platformY - 7, 7, 0, Math.PI * 2);
      c.fill();
      c.font = "bold 9px var(--font-mono, monospace)";
      c.fillStyle = "#facc15";
      c.textAlign = "center";
      c.fillText("FORKLIFT (3,800 kg)", x - 5, bY - 56);
    } else if (loadKey === "suv") {
      // Heavy SUV / Pickup Truck
      const carW = 120;
      const wheelR = 8;
      const carBotY = platformY - wheelR;
      // Main SUV Body
      const bodyGrad = c.createLinearGradient(0, carBotY - 38, 0, carBotY);
      bodyGrad.addColorStop(0, "#f59e0b");
      bodyGrad.addColorStop(1, "#b45309");
      c.fillStyle = bodyGrad;
      c.beginPath();
      c.roundRect(x - carW / 2, carBotY - 22, carW, 22, [4, 6, 0, 0]);
      c.fill();
      // Cabin roof
      c.beginPath();
      c.moveTo(x - 35, carBotY - 22);
      c.lineTo(x - 20, carBotY - 40);
      c.lineTo(x + 35, carBotY - 40);
      c.lineTo(x + 50, carBotY - 22);
      c.closePath();
      c.fill();
      // Windows
      c.fillStyle = "#0284c7";
      c.beginPath();
      c.moveTo(x - 16, carBotY - 24);
      c.lineTo(x - 14, carBotY - 37);
      c.lineTo(x + 8, carBotY - 37);
      c.lineTo(x + 8, carBotY - 24);
      c.closePath();
      c.moveTo(x + 12, carBotY - 24);
      c.lineTo(x + 12, carBotY - 37);
      c.lineTo(x + 30, carBotY - 37);
      c.lineTo(x + 42, carBotY - 24);
      c.closePath();
      c.fill();
      // Heavy all-terrain wheels
      c.fillStyle = "#1e293b";
      c.beginPath();
      c.arc(x - 38, platformY - wheelR, wheelR, 0, Math.PI * 2);
      c.arc(x + 38, platformY - wheelR, wheelR, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#94a3b8";
      c.beginPath();
      c.arc(x - 38, platformY - wheelR, 3.5, 0, Math.PI * 2);
      c.arc(x + 38, platformY - wheelR, 3.5, 0, Math.PI * 2);
      c.fill();
      c.font = "bold 9px var(--font-mono, monospace)";
      c.fillStyle = "#f59e0b";
      c.textAlign = "center";
      c.fillText("SUV / TRUCK (2,400 kg)", x, carBotY - 45);
    } else {
      // Default: Sedan Passenger Car
      const carW = 115;
      const wheelR = 7;
      const carBotY = platformY - wheelR;
      // Streamlined car body
      const bodyGrad = c.createLinearGradient(0, carBotY - 32, 0, carBotY);
      bodyGrad.addColorStop(0, "#38bdf8");
      bodyGrad.addColorStop(1, "#0369a1");
      c.fillStyle = bodyGrad;
      c.beginPath();
      c.roundRect(x - carW / 2, carBotY - 16, carW, 16, [4, 8, 0, 0]);
      c.fill();
      // Sleek cabin roof
      c.beginPath();
      c.moveTo(x - 30, carBotY - 16);
      c.lineTo(x - 15, carBotY - 32);
      c.lineTo(x + 25, carBotY - 32);
      c.lineTo(x + 42, carBotY - 16);
      c.closePath();
      c.fill();
      // Windshield & windows
      c.fillStyle = "rgba(15, 23, 42, 0.85)";
      c.beginPath();
      c.moveTo(x - 12, carBotY - 18);
      c.lineTo(x - 11, carBotY - 30);
      c.lineTo(x + 6, carBotY - 30);
      c.lineTo(x + 6, carBotY - 18);
      c.closePath();
      c.moveTo(x + 10, carBotY - 18);
      c.lineTo(x + 10, carBotY - 30);
      c.lineTo(x + 22, carBotY - 30);
      c.lineTo(x + 35, carBotY - 18);
      c.closePath();
      c.fill();
      // Headlights
      c.fillStyle = "#facc15";
      c.fillRect(x + carW / 2 - 4, carBotY - 13, 4, 6);
      // Wheels
      c.fillStyle = "#0f172a";
      c.beginPath();
      c.arc(x - 34, platformY - wheelR, wheelR, 0, Math.PI * 2);
      c.arc(x + 34, platformY - wheelR, wheelR, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#cbd5e1";
      c.beginPath();
      c.arc(x - 34, platformY - wheelR, 3, 0, Math.PI * 2);
      c.arc(x + 34, platformY - wheelR, 3, 0, Math.PI * 2);
      c.fill();
      c.font = "bold 9px var(--font-mono, monospace)";
      c.fillStyle = "#38bdf8";
      c.textAlign = "center";
      c.fillText("SEDAN CAR (1,500 kg)", x, carBotY - 37);
    }

    // Gravity Load Force Vector W_load = m*g (pointing down)
    drawVectorArrow(c, x - 55, platformY - 35, x - 55, platformY, "#ef4444", 2);
    c.font = "8px var(--font-mono, monospace)";
    c.fillStyle = "#ef4444";
    c.textAlign = "right";
    c.fillText(`W = ${(calc.loadWeightN / 1000).toFixed(1)} kN`, x - 58, platformY - 18);
    c.restore();
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
    } else if (apparatusMode === "venturi") {
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
    } else if (apparatusMode === "torricelli") {
      // Torricelli Curve: Horizontal Range R vs Orifice Elevation y_h
      chartCtx.fillStyle = "#94a3b8";
      chartCtx.font = "10px var(--font-mono, monospace)";
      chartCtx.textAlign = "center";
      chartCtx.fillText("Orifice Elevation y_h (m)", chartW / 2, chartH - 6);

      chartCtx.save();
      chartCtx.translate(16, chartH / 2);
      chartCtx.rotate(-Math.PI / 2);
      chartCtx.fillText("Range R (m)", 0, 0);
      chartCtx.restore();

      const maxYAxis = 1.0; // 1.0 m max range scale
      const maxXAxis = 0.80; // 0.80 m max column level

      // Theoretical Frictionless Curve (Cd = 1.0)
      chartCtx.strokeStyle = "rgba(6, 182, 212, 0.4)";
      chartCtx.lineWidth = 1.5;
      chartCtx.setLineDash([4, 4]);
      chartCtx.beginPath();
      for (let step = 0; step <= 40; step++) {
        const yVal = (step / 40) * maxXAxis;
        const rIdeal = 2 * Math.sqrt(Math.max(0, yVal * (maxXAxis - yVal)));
        const xPos = 45 + (yVal / maxXAxis) * (chartW - 70);
        const yPos = (chartH - 25) - (rIdeal / maxYAxis) * (chartH - 45);
        if (step === 0) chartCtx.moveTo(xPos, yPos);
        else chartCtx.lineTo(xPos, yPos);
      }
      chartCtx.stroke();
      chartCtx.setLineDash([]);

      // Actual Discharge Curve R = 2·Cd·√(y·(H - y))
      chartCtx.strokeStyle = "#38bdf8";
      chartCtx.lineWidth = 2.5;
      chartCtx.beginPath();
      for (let step = 0; step <= 40; step++) {
        const yVal = (step / 40) * maxXAxis;
        const rActual = 2 * dischargeCoeff * Math.sqrt(Math.max(0, yVal * (maxXAxis - yVal)));
        const xPos = 45 + (yVal / maxXAxis) * (chartW - 70);
        const yPos = (chartH - 25) - (rActual / maxYAxis) * (chartH - 45);
        if (step === 0) chartCtx.moveTo(xPos, yPos);
        else chartCtx.lineTo(xPos, yPos);
      }
      chartCtx.stroke();

      // Peak Range Apex Guideline (y = H/2 = 0.40 m)
      const apexX = 45 + (0.40 / maxXAxis) * (chartW - 70);
      const apexY = (chartH - 25) - (calc.maxRangeM / maxYAxis) * (chartH - 45);
      chartCtx.strokeStyle = "rgba(250, 204, 21, 0.4)";
      chartCtx.lineWidth = 1;
      chartCtx.setLineDash([2, 3]);
      chartCtx.beginPath();
      chartCtx.moveTo(apexX, chartH - 25);
      chartCtx.lineTo(apexX, apexY);
      chartCtx.stroke();
      chartCtx.setLineDash([]);

      // Current Operating Point
      const curX = 45 + (calc.y_h / maxXAxis) * (chartW - 70);
      const curY = (chartH - 25) - (calc.rangeM / maxYAxis) * (chartH - 45);
      chartCtx.beginPath();
      chartCtx.arc(curX, curY, 6, 0, Math.PI * 2);
      chartCtx.fillStyle = calc.isAtMaxRange ? "#facc15" : "#38bdf8";
      chartCtx.shadowColor = calc.isAtMaxRange ? "#facc15" : "#38bdf8";
      chartCtx.shadowBlur = 8;
      chartCtx.fill();
      chartCtx.shadowBlur = 0;

      // Operating coordinate label
      chartCtx.font = "8.5px var(--font-mono, monospace)";
      chartCtx.fillStyle = "#f8fafc";
      chartCtx.textAlign = curX > chartW - 90 ? "right" : "left";
      chartCtx.fillText(`(${calc.y_h.toFixed(2)}m, ${calc.rangeM.toFixed(2)}m)`, curX + (curX > chartW - 90 ? -10 : 10), curY - 6);
    } else if (apparatusMode === "hydraulic") {
      // Hydraulic Curve: Output Lift Force F2 vs Input Applied Force F1
      chartCtx.fillStyle = "#94a3b8";
      chartCtx.font = "10px var(--font-mono, monospace)";
      chartCtx.textAlign = "center";
      chartCtx.fillText("Input Applied Force F₁ (N)", chartW / 2, chartH - 6);

      chartCtx.save();
      chartCtx.translate(16, chartH / 2);
      chartCtx.rotate(-Math.PI / 2);
      chartCtx.fillText("Output Lift Force F₂ (kN)", 0, 0);
      chartCtx.restore();

      const maxF1 = 500; // N
      const maxF2kN = Math.max(25, (maxF1 * calc.ima) / 1000); // kN

      // Target Load Required Lift Force Line
      const loadF2kN = calc.loadWeightN / 1000;
      if (loadF2kN <= maxF2kN) {
        const loadY = (chartH - 25) - (loadF2kN / maxF2kN) * (chartH - 45);
        chartCtx.strokeStyle = "rgba(239, 68, 68, 0.5)";
        chartCtx.lineWidth = 1.2;
        chartCtx.setLineDash([4, 4]);
        chartCtx.beginPath();
        chartCtx.moveTo(45, loadY);
        chartCtx.lineTo(chartW - 20, loadY);
        chartCtx.stroke();
        chartCtx.setLineDash([]);
        chartCtx.font = "8px var(--font-mono, monospace)";
        chartCtx.fillStyle = "#f87171";
        chartCtx.textAlign = "right";
        chartCtx.fillText(`Load: ${loadF2kN.toFixed(1)} kN`, chartW - 25, loadY - 4);
      }

      // Linear Mechanical Advantage Line F2 = IMA * F1
      chartCtx.strokeStyle = "#10b981";
      chartCtx.lineWidth = 2.5;
      chartCtx.beginPath();
      chartCtx.moveTo(45, chartH - 25);
      const topX = 45 + (maxF1 / maxF1) * (chartW - 70);
      const topY = (chartH - 25) - ((maxF1 * calc.ima / 1000) / maxF2kN) * (chartH - 45);
      chartCtx.lineTo(topX, topY);
      chartCtx.stroke();

      // Current Operating Point
      const curX = 45 + (Math.min(maxF1, inputForceN) / maxF1) * (chartW - 70);
      const curF2kN = calc.outputForceN / 1000;
      const curY = (chartH - 25) - (Math.min(maxF2kN, curF2kN) / maxF2kN) * (chartH - 45);

      chartCtx.beginPath();
      chartCtx.arc(curX, curY, 6, 0, Math.PI * 2);
      chartCtx.fillStyle = calc.canLiftLoad ? "#10b981" : "#f59e0b";
      chartCtx.shadowColor = calc.canLiftLoad ? "#10b981" : "#f59e0b";
      chartCtx.shadowBlur = 8;
      chartCtx.fill();
      chartCtx.shadowBlur = 0;

      // Operating coordinate label
      chartCtx.font = "8.5px var(--font-mono, monospace)";
      chartCtx.fillStyle = "#f8fafc";
      chartCtx.textAlign = curX > chartW - 110 ? "right" : "left";
      chartCtx.fillText(`(${inputForceN.toFixed(0)}N, ${curF2kN.toFixed(2)}kN)`, curX + (curX > chartW - 110 ? -10 : 10), curY - 6);
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
    const coords = getCanvasCoords(e);
    const canvasWidth = coords.width;

    if (apparatusMode === "hydraulic") {
      const cyl1CenterX = Math.max(90, Math.round(canvasWidth * 0.22));
      const p1TravelPx = 110;
      const p1NormStroke = Math.min(1.0, inputStrokeCm / 25.0);
      const cylTopY = 220;
      const p1Y = cylTopY + 30 + p1NormStroke * p1TravelPx;
      const rod1TopY = p1Y - 70;
      const handleY = rod1TopY - 16;
      const handleW = 60;
      if (
        Math.abs(coords.x - cyl1CenterX) <= handleW &&
        coords.y >= handleY - 25 &&
        coords.y <= p1Y + 15
      ) {
        isDraggingPiston1 = true;
        dragPistonStartY = coords.y;
        dragPistonStartStroke = inputStrokeCm;
        canvas.style.cursor = "ns-resize";
        SoundFX.playClick();
      }
      return;
    }

    if (apparatusMode === "torricelli") {
      // Hit test on orifice nozzle collar
      const tankFloorY = 470;
      const nozzleY = tankFloorY - (orificeHeightM / 0.80) * 260;
      const nozzleX = 205;
      if (
        coords.x >= nozzleX - 35 && coords.x <= nozzleX + 45 &&
        coords.y >= nozzleY - 20 && coords.y <= nozzleY + 20
      ) {
        isDraggingOrifice = true;
        dragOrificeStartY = coords.y;
        dragOrificeStartH = orificeHeightM;
        canvas.style.cursor = "ns-resize";
        SoundFX.playClick();
      }
      return;
    }

    if (apparatusMode === "buoyancy") {
      const scaleX = Math.round(canvasWidth * 0.40);
      const tankX = scaleX - 105;
      const tankY = 175;
      const tankH = 270;
      const waterSurfaceY = tankY + 50;

      // Hit test on Depth Pressure Probe wand if enabled
      if (showPressureProbe) {
        const probeX = tankX + 52;
        const probeTipY = waterSurfaceY + (probeDepthCm / 22) * 214;
        const probeGripY = waterSurfaceY - 45;
        if (
          Math.abs(coords.x - probeX) <= 24 &&
          coords.y >= probeGripY - 20 &&
          coords.y <= probeTipY + 20
        ) {
          isDraggingProbe = true;
          dragProbeStartY = coords.y;
          dragProbeStartDepth = probeDepthCm;
          canvas.style.cursor = "ns-resize";
          SoundFX.playClick();
          return;
        }
      }

      // Hit test on suspended/floating solid block
      const { w: blockW, h: blockH } = getBlockDimensions(blockVolumeLiters);
      const calc = getCalculations();
      let blockBottomTargetY = waterSurfaceY + (calc.effectiveSubmersion / 100.0) * blockH;
      let blockY = blockBottomTargetY - blockH;

      if (isFreeFloating && !calc.canFloat) {
        blockY = tankY + tankH - 6 - blockH;
      }

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
  }

  function handlePointerMove(e) {
    const coords = getCanvasCoords(e);
    const canvasWidth = coords.width;

    if (isDraggingPiston1) {
      const deltaY = coords.y - dragPistonStartY;
      const deltaStroke = (deltaY / 110) * 25.0;
      inputStrokeCm = Math.max(1.0, Math.min(25.0, parseFloat((dragPistonStartStroke + deltaStroke).toFixed(1))));

      const sliderStroke = container.querySelector("#slider-input-stroke");
      const lblStroke = container.querySelector("#lbl-input-stroke");
      if (sliderStroke) sliderStroke.value = inputStrokeCm;
      const calc = getCalculations();
      if (lblStroke) lblStroke.innerText = `${inputStrokeCm.toFixed(1)} cm (d₂ = ${calc.outputStrokeCm.toFixed(2)} cm)`;
      needsRedraw = true;
      return;
    }

    if (isDraggingOrifice) {
      const deltaY = coords.y - dragOrificeStartY;
      const deltaH = -(deltaY / 260) * 0.80;
      orificeHeightM = Math.max(0.10, Math.min(0.70, parseFloat((dragOrificeStartH + deltaH).toFixed(2))));

      const sliderOrifice = container.querySelector("#slider-orifice-height");
      const lblOrifice = container.querySelector("#lbl-orifice-height");
      if (sliderOrifice) sliderOrifice.value = orificeHeightM;
      if (lblOrifice) lblOrifice.innerText = `${orificeHeightM.toFixed(2)} m (${(orificeHeightM * 100).toFixed(0)} cm)`;
      needsRedraw = true;
      return;
    }

    if (isDraggingProbe) {
      const deltaY = coords.y - dragProbeStartY;
      const deltaD = (deltaY / 214) * 22;
      probeDepthCm = Math.max(0, Math.min(22, parseFloat((dragProbeStartDepth + deltaD).toFixed(1))));

      const sliderProbe = container.querySelector("#slider-probe-depth");
      const lblProbe = container.querySelector("#lbl-probe-depth");
      if (sliderProbe) sliderProbe.value = probeDepthCm;
      if (lblProbe) lblProbe.innerText = `${probeDepthCm.toFixed(1)} cm`;
      needsRedraw = true;
      return;
    }

    if (isDragging) {
      const { h: blockH } = getBlockDimensions(blockVolumeLiters);
      const deltaY = coords.y - dragStartY;
      const deltaSub = (deltaY / blockH) * 100;
      submersionPercent = Math.max(0, Math.min(100, Math.round(dragStartSubmersion + deltaSub)));

      const sliderSub = container.querySelector("#slider-fluids-submersion");
      const lblSub = container.querySelector("#lbl-fluids-submersion");
      if (sliderSub) sliderSub.value = submersionPercent;
      if (lblSub) lblSub.innerText = `${submersionPercent}%`;

      surfaceRippleAmp = Math.min(5.0, surfaceRippleAmp + Math.abs(deltaY) * 0.05);
      needsRedraw = true;
      return;
    }

    // Hover feedback
    if (apparatusMode === "hydraulic") {
      const cyl1CenterX = Math.max(90, Math.round(canvasWidth * 0.22));
      const p1TravelPx = 110;
      const p1NormStroke = Math.min(1.0, inputStrokeCm / 25.0);
      const cylTopY = 220;
      const p1Y = cylTopY + 30 + p1NormStroke * p1TravelPx;
      const rod1TopY = p1Y - 70;
      const handleY = rod1TopY - 16;
      const handleW = 60;
      const isHoverHandle = (
        Math.abs(coords.x - cyl1CenterX) <= handleW &&
        coords.y >= handleY - 25 &&
        coords.y <= p1Y + 15
      );
      canvas.style.cursor = isHoverHandle ? "ns-resize" : "default";
    } else if (apparatusMode === "torricelli") {
      const tankFloorY = 470;
      const nozzleY = tankFloorY - (orificeHeightM / 0.80) * 260;
      const nozzleX = 205;
      const isHoverNozzle = (
        coords.x >= nozzleX - 35 && coords.x <= nozzleX + 45 &&
        coords.y >= nozzleY - 20 && coords.y <= nozzleY + 20
      );
      canvas.style.cursor = isHoverNozzle ? "ns-resize" : "default";
    } else if (apparatusMode === "buoyancy") {
      const scaleX = Math.round(canvasWidth * 0.40);
      const tankX = scaleX - 105;
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

      const isHoverBlock = (
        Math.abs(coords.x - scaleX) <= blockW / 2 + 10 &&
        coords.y >= blockY - 10 &&
        coords.y <= blockY + blockH + 10
      );

      let isHoverProbe = false;
      if (showPressureProbe) {
        const probeX = tankX + 52;
        const probeTipY = waterSurfaceY + (probeDepthCm / 22) * 214;
        const probeGripY = waterSurfaceY - 45;
        isHoverProbe = (
          Math.abs(coords.x - probeX) <= 24 &&
          coords.y >= probeGripY - 20 &&
          coords.y <= probeTipY + 20
        );
      }

      canvas.style.cursor = (isHoverBlock || isHoverProbe) ? "grab" : "default";
    } else {
      canvas.style.cursor = "default";
    }
  }

  function handlePointerUp() {
    if (isDragging || isDraggingOrifice || isDraggingProbe || isDraggingPiston1) {
      isDragging = false;
      isDraggingOrifice = false;
      isDraggingProbe = false;
      isDraggingPiston1 = false;
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
    } else if (e.key === "p" || e.key === "P") {
      container.querySelector("#btn-fluid-probe")?.click();
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
      if (apparatusMode === "venturi" || apparatusMode === "torricelli" || apparatusMode === "hydraulic" || apparatusMode === "buoyancy" || isFreeFloating || isDragging || isDraggingOrifice || isDraggingProbe || isDraggingPiston1 || surfaceRippleAmp > 0.05) {
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

  // 4-Mode Cyclic Switcher: Archimedes Overflow Tank ➔ Venturi Tube ➔ Torricelli Efflux Tank ➔ Pascal Hydraulic Lift
  container.querySelector("#btn-fluid-mode")?.addEventListener("click", () => {
    if (apparatusMode === "buoyancy") apparatusMode = "venturi";
    else if (apparatusMode === "venturi") apparatusMode = "torricelli";
    else if (apparatusMode === "torricelli") apparatusMode = "hydraulic";
    else apparatusMode = "buoyancy";

    const calc = getCalculations();
    const btn = container.querySelector("#btn-fluid-mode");
    const pBuoy = container.querySelector("#panel-buoyancy-controls");
    const pVent = container.querySelector("#panel-venturi-controls");
    const pTorr = container.querySelector("#panel-torricelli-controls");
    const pHyd = container.querySelector("#panel-hydraulic-controls");
    const chartTitle = container.querySelector("#lbl-chart-title");
    const chartSlope = container.querySelector("#lbl-chart-slope");
    const dragHint = container.querySelector("#fluids-drag-hint");
    const btnFloat = container.querySelector("#btn-fluid-float");
    const btnProbe = container.querySelector("#btn-fluid-probe");

    if (apparatusMode === "venturi") {
      btn.innerText = "🔀 Switch to Torricelli Tank";
      if (pBuoy) pBuoy.style.display = "none";
      if (pVent) pVent.style.display = "block";
      if (pTorr) pTorr.style.display = "none";
      if (pHyd) pHyd.style.display = "none";
      if (chartTitle) chartTitle.innerText = "Venturi Pressure Differential (ΔP vs Q)";
      if (chartSlope) chartSlope.innerText = "ΔP = ½ρ(v₂² - v₁²)";
      if (dragHint) dragHint.innerText = "💨 High-speed Venturi Tube • Flow acceleration in constricted throat";
      if (btnFloat) btnFloat.style.display = "none";
      if (btnProbe) btnProbe.style.display = "none";
      const badgeFloat = container.querySelector("#badge-float-status");
      if (badgeFloat) {
        badgeFloat.innerText = calc.isLaminar ? "Laminar Flow (Re < 2300)" : (calc.isTransitional ? "Transitional Flow (2300–4000)" : "Turbulent Flow (Re > 4000)");
        badgeFloat.style.color = calc.isLaminar ? "#34d399" : (calc.isTransitional ? "#facc15" : "#f87171");
        badgeFloat.style.background = calc.isLaminar ? "rgba(16, 185, 129, 0.15)" : (calc.isTransitional ? "rgba(234, 179, 8, 0.15)" : "rgba(239, 68, 68, 0.15)");
      }
    } else if (apparatusMode === "torricelli") {
      btn.innerText = "🔀 Switch to Hydraulic Press";
      if (pBuoy) pBuoy.style.display = "none";
      if (pVent) pVent.style.display = "none";
      if (pTorr) pTorr.style.display = "block";
      if (pHyd) pHyd.style.display = "none";
      if (chartTitle) chartTitle.innerText = "Torricelli Efflux Trajectory Range (R vs y_h)";
      if (chartSlope) chartSlope.innerText = "R_max at y_h = H/2";
      if (dragHint) dragHint.innerText = "👆 Drag orifice spout vertically to vary efflux velocity & horizontal range";
      if (btnFloat) btnFloat.style.display = "none";
      if (btnProbe) btnProbe.style.display = "none";
      const badgeFloat = container.querySelector("#badge-float-status");
      if (badgeFloat) {
        badgeFloat.innerText = calc.isAtMaxRange ? "Peak Maximum Range (y_h = H / 2)" : `Torricelli Efflux (C_d = ${dischargeCoeff.toFixed(2)})`;
        badgeFloat.style.color = calc.isAtMaxRange ? "#facc15" : "#38bdf8";
        badgeFloat.style.background = calc.isAtMaxRange ? "rgba(245, 158, 11, 0.2)" : "rgba(56, 189, 248, 0.15)";
      }
    } else if (apparatusMode === "hydraulic") {
      btn.innerText = "🔀 Switch to Archimedes Tank";
      if (pBuoy) pBuoy.style.display = "none";
      if (pVent) pVent.style.display = "none";
      if (pTorr) pTorr.style.display = "none";
      if (pHyd) pHyd.style.display = "block";
      if (chartTitle) chartTitle.innerText = "Pascal Force Amplification (F₂ vs F₁)";
      if (chartSlope) chartSlope.innerText = "IMA = (D₂/D₁)²";
      if (dragHint) dragHint.innerText = "👆 Drag input piston plunger ↕ to pump hydraulic press & lift heavy vehicle";
      if (btnFloat) btnFloat.style.display = "none";
      if (btnProbe) btnProbe.style.display = "none";
      const badgeFloat = container.querySelector("#badge-float-status");
      if (badgeFloat) {
        badgeFloat.innerText = calc.canLiftLoad ? `✓ Lifting ${calc.load.name} (${calc.load.massKg} kg)` : `✗ Insufficient Force (${(calc.outputForceN / 1000).toFixed(1)} kN < ${(calc.loadWeightN / 1000).toFixed(1)} kN)`;
        badgeFloat.style.color = calc.canLiftLoad ? "#34d399" : "#f59e0b";
        badgeFloat.style.background = calc.canLiftLoad ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)";
      }
    } else {
      btn.innerText = "🔀 Switch to Venturi Tube";
      if (pBuoy) pBuoy.style.display = "block";
      if (pVent) pVent.style.display = "none";
      if (pTorr) pTorr.style.display = "none";
      if (pHyd) pHyd.style.display = "none";
      if (chartTitle) chartTitle.innerText = "Archimedes Linear Verification (F_b vs V_disp)";
      if (chartSlope) chartSlope.innerText = "Slope = ρ_f · g";
      if (dragHint) dragHint.innerText = "👆 Drag block vertically inside tank • Touch/Wheel friendly";
      if (btnFloat) btnFloat.style.display = "inline-flex";
      if (btnProbe) btnProbe.style.display = "inline-flex";
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

  // Toggle Depth Pressure Probe
  container.querySelector("#btn-fluid-probe")?.addEventListener("click", () => {
    showPressureProbe = !showPressureProbe;
    const btn = container.querySelector("#btn-fluid-probe");
    const rowProbe = container.querySelector("#row-pressure-probe-control");
    if (showPressureProbe) {
      if (btn) {
        btn.style.color = "#38bdf8";
        btn.style.borderColor = "rgba(56, 189, 248, 0.6)";
        btn.style.background = "rgba(6, 182, 212, 0.25)";
        btn.innerText = "📍 Hide Probe";
      }
      if (rowProbe) rowProbe.style.display = "block";
      showToast("Hydrostatic Mano-Probe Active", "Drag probe vertically in tank to measure depth pressure", "info");
    } else {
      if (btn) {
        btn.style.color = "#38bdf8";
        btn.style.borderColor = "rgba(14, 165, 233, 0.4)";
        btn.style.background = "";
        btn.innerText = "📍 Depth Probe";
      }
      if (rowProbe) rowProbe.style.display = "none";
    }
    needsRedraw = true;
    SoundFX.playClick();
  });

  // Hydrostatic Probe Depth Slider
  container.querySelector("#slider-probe-depth")?.addEventListener("input", (e) => {
    probeDepthCm = parseFloat(e.target.value);
    const lbl = container.querySelector("#lbl-probe-depth");
    if (lbl) lbl.innerText = `${probeDepthCm.toFixed(1)} cm`;
    needsRedraw = true;
  });

  // Torricelli Orifice Height Slider
  container.querySelector("#slider-orifice-height")?.addEventListener("input", (e) => {
    orificeHeightM = parseFloat(e.target.value);
    const lbl = container.querySelector("#lbl-orifice-height");
    if (lbl) lbl.innerText = `${orificeHeightM.toFixed(2)} m (${(orificeHeightM * 100).toFixed(0)} cm)`;
    needsRedraw = true;
  });

  // Torricelli Nozzle Profile Selector
  container.querySelector("#select-nozzle-type")?.addEventListener("change", (e) => {
    dischargeCoeff = parseFloat(e.target.value);
    needsRedraw = true;
    SoundFX.playClick();
  });

  // Pascal Hydraulic Lift Controls Listeners
  container.querySelector("#slider-input-force")?.addEventListener("input", (e) => {
    inputForceN = parseFloat(e.target.value);
    const lbl = container.querySelector("#lbl-input-force");
    if (lbl) lbl.innerText = `${inputForceN.toFixed(0)} N (${(inputForceN / g).toFixed(1)} kg equiv)`;
    needsRedraw = true;
  });

  container.querySelector("#slider-d1")?.addEventListener("input", (e) => {
    piston1DiameterCm = parseFloat(e.target.value);
    const calc = getCalculations();
    const lbl = container.querySelector("#lbl-d1");
    if (lbl) lbl.innerText = `${piston1DiameterCm.toFixed(1)} cm (A₁ = ${calc.a1Cm2.toFixed(1)} cm²)`;
    needsRedraw = true;
  });

  container.querySelector("#slider-d2")?.addEventListener("input", (e) => {
    piston2DiameterCm = parseFloat(e.target.value);
    const calc = getCalculations();
    const lbl = container.querySelector("#lbl-d2");
    if (lbl) lbl.innerText = `${piston2DiameterCm.toFixed(1)} cm (A₂ = ${calc.a2Cm2.toFixed(1)} cm²)`;
    needsRedraw = true;
  });

  container.querySelector("#slider-input-stroke")?.addEventListener("input", (e) => {
    inputStrokeCm = parseFloat(e.target.value);
    const calc = getCalculations();
    const lbl = container.querySelector("#lbl-input-stroke");
    if (lbl) lbl.innerText = `${inputStrokeCm.toFixed(1)} cm (d₂ = ${calc.outputStrokeCm.toFixed(2)} cm)`;
    needsRedraw = true;
  });

  container.querySelector("#select-hydraulic-load")?.addEventListener("change", (e) => {
    liftedLoadKey = e.target.value;
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
    orificeHeightM = 0.40;
    dischargeCoeff = 0.62;
    probeDepthCm = 10.0;
    showPressureProbe = false;

    const btnFloat = container.querySelector("#btn-fluid-float");
    if (btnFloat) {
      btnFloat.innerText = "🪝 Release to Float";
      btnFloat.style.color = "#facc15";
      btnFloat.style.borderColor = "rgba(245, 158, 11, 0.4)";
    }
    const btnProbe = container.querySelector("#btn-fluid-probe");
    if (btnProbe) {
      btnProbe.style.color = "#38bdf8";
      btnProbe.style.borderColor = "rgba(14, 165, 233, 0.4)";
      btnProbe.style.background = "";
      btnProbe.innerText = "📍 Depth Probe";
    }
    const rowProbe = container.querySelector("#row-pressure-probe-control");
    if (rowProbe) rowProbe.style.display = "none";

    const selFluid = container.querySelector("#select-fluids-fluid");
    if (selFluid) selFluid.value = "water";
    const selMat = container.querySelector("#select-fluids-material");
    if (selMat) selMat.value = "aluminum";

    const sliderSub = container.querySelector("#slider-fluids-submersion");
    if (sliderSub) sliderSub.value = 100;
    const lblSub = container.querySelector("#lbl-fluids-submersion");
    if (lblSub) lblSub.innerText = "100%";

    const sliderVol = container.querySelector("#slider-fluids-vol");
    if (sliderVol) sliderVol.value = 1.0;
    const lblVol = container.querySelector("#lbl-fluids-vol");
    if (lblVol) lblVol.innerText = "1.00 L (1000 cm³)";

    const sliderVent = container.querySelector("#slider-venturi-flow");
    if (sliderVent) sliderVent.value = 2.0;
    const lblVent = container.querySelector("#lbl-venturi-flow");
    if (lblVent) lblVent.innerText = "2.00 L/s";

    const sliderOrifice = container.querySelector("#slider-orifice-height");
    if (sliderOrifice) sliderOrifice.value = 0.40;
    const lblOrifice = container.querySelector("#lbl-orifice-height");
    if (lblOrifice) lblOrifice.innerText = "0.40 m (40.0 cm)";

    const selNozzle = container.querySelector("#select-nozzle-type");
    if (selNozzle) selNozzle.value = "0.62";

    const sliderProbe = container.querySelector("#slider-probe-depth");
    if (sliderProbe) sliderProbe.value = 10.0;
    const lblProbe = container.querySelector("#lbl-probe-depth");
    if (lblProbe) lblProbe.innerText = "10.0 cm";

    inputForceN = 150.0;
    piston1DiameterCm = 4.0;
    piston2DiameterCm = 20.0;
    inputStrokeCm = 12.0;
    liftedLoadKey = "car";

    const sliderForce = container.querySelector("#slider-input-force");
    if (sliderForce) sliderForce.value = 150;
    const lblForce = container.querySelector("#lbl-input-force");
    if (lblForce) lblForce.innerText = "150 N (15.3 kg equiv)";

    const sliderD1 = container.querySelector("#slider-d1");
    if (sliderD1) sliderD1.value = 4.0;
    const lblD1 = container.querySelector("#lbl-d1");
    if (lblD1) lblD1.innerText = "4.0 cm (A₁ = 12.6 cm²)";

    const sliderD2 = container.querySelector("#slider-d2");
    if (sliderD2) sliderD2.value = 20.0;
    const lblD2 = container.querySelector("#lbl-d2");
    if (lblD2) lblD2.innerText = "20.0 cm (A₂ = 314.2 cm²)";

    const sliderStroke = container.querySelector("#slider-input-stroke");
    if (sliderStroke) sliderStroke.value = 12.0;
    const lblStroke = container.querySelector("#lbl-input-stroke");
    if (lblStroke) lblStroke.innerText = "12.0 cm (d₂ = 0.48 cm)";

    const selLoad = container.querySelector("#select-hydraulic-load");
    if (selLoad) selLoad.value = "car";

    surfaceRippleAmp = 3.0;
    needsRedraw = true;
    SoundFX.playClick();
  });

  // Record Trial Store Integration
  container.querySelector("#btn-record-trial")?.addEventListener("click", () => {
    const calc = getCalculations();
    let trialSummary = "";
    let metrics = {};

    if (apparatusMode === "buoyancy") {
      trialSummary = `${calc.m.name} in ${calc.f.name} (${isFreeFloating ? 'Free Floating' : `${calc.effectiveSubmersion.toFixed(0)}% Submerged`})`;
      metrics = {
        "Apparatus Mode": "Archimedes Overflow Tank",
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
      };
      if (showPressureProbe) {
        metrics["Probe Depth (cm)"] = `${probeDepthCm.toFixed(1)}`;
        metrics["Hydrostatic Gauge Pressure (kPa)"] = `${calc.pGaugeKPa.toFixed(2)}`;
        metrics["Absolute Pressure (kPa)"] = `${calc.pAbsKPa.toFixed(2)}`;
      }
    } else if (apparatusMode === "venturi") {
      trialSummary = `Venturi Flow at Q = ${flowRateLps.toFixed(2)} L/s (${calc.f.name})`;
      metrics = {
        "Apparatus Mode": "Venturi Constriction Pipe",
        "Liquid Medium": calc.f.name,
        "Volumetric Flow Q (L/s)": `${flowRateLps.toFixed(2)}`,
        "Wide Pipe v₁ (m/s)": `${calc.v1.toFixed(2)}`,
        "Constriction v₂ (m/s)": `${calc.v2.toFixed(2)}`,
        "Pressure Drop ΔP (kPa)": `${(calc.deltaP / 1000).toFixed(2)}`,
        "Manometer Head Δh (cm)": `${(calc.deltaH * 100).toFixed(1)}`,
        "Dynamic Viscosity μ (mPa·s)": `${(calc.visc * 1000).toFixed(2)}`,
        "Inlet Reynolds Re₁": `${Math.round(calc.re1).toLocaleString()}`,
        "Throat Reynolds Re₂": `${Math.round(calc.re2).toLocaleString()}`,
        "Flow Regime": calc.isLaminar ? "Laminar (Re < 2300)" : (calc.isTransitional ? "Transitional" : "Turbulent (Re > 4000)")
      };
    } else if (apparatusMode === "torricelli") {
      // Torricelli Efflux Mode
      trialSummary = `Torricelli Efflux at y_h = ${orificeHeightM.toFixed(2)} m (C_d = ${dischargeCoeff.toFixed(2)}) in ${calc.f.name}`;
      metrics = {
        "Apparatus Mode": "Torricelli Efflux Tank",
        "Liquid Medium": calc.f.name,
        "Fluid Density (kg/m³)": `${calc.f.density}`,
        "Total Column Head H (m)": `${calc.H_total.toFixed(2)}`,
        "Orifice Height y_h (m)": `${calc.y_h.toFixed(2)}`,
        "Efflux Head h (m)": `${calc.headM.toFixed(2)}`,
        "Discharge Coeff C_d": `${dischargeCoeff.toFixed(2)}`,
        "Efflux Velocity v (m/s)": `${calc.vActual.toFixed(2)}`,
        "Ideal Torricelli v (m/s)": `${calc.vIdeal.toFixed(2)}`,
        "Flight Time t (s)": `${calc.tFlight.toFixed(3)}`,
        "Horizontal Range R (m)": `${calc.rangeM.toFixed(2)}`,
        "Max Theoretical Range (m)": `${calc.maxRangeM.toFixed(2)}`,
        "Discharge Flow Q (L/s)": `${calc.qLps_torr.toFixed(2)}`
      };
    } else {
      // Pascal Hydraulic Press Mode
      trialSummary = `Pascal Hydraulic Lift: F₁ = ${inputForceN.toFixed(0)} N ➔ F₂ = ${(calc.outputForceN / 1000).toFixed(2)} kN (IMA = ${calc.ima.toFixed(1)}×)`;
      metrics = {
        "Apparatus Mode": "Pascal Hydraulic Lift Press",
        "Liquid Medium": calc.f.name,
        "Input Cylinder D₁ (cm)": `${piston1DiameterCm.toFixed(1)}`,
        "Output Cylinder D₂ (cm)": `${piston2DiameterCm.toFixed(1)}`,
        "Input Area A₁ (cm²)": `${calc.a1Cm2.toFixed(1)}`,
        "Output Area A₂ (cm²)": `${calc.a2Cm2.toFixed(1)}`,
        "Mechanical Advantage (IMA)": `${calc.ima.toFixed(1)}×`,
        "Input Applied Force F₁ (N)": `${inputForceN.toFixed(0)}`,
        "Output Lift Force F₂ (kN)": `${(calc.outputForceN / 1000).toFixed(2)}`,
        "Hydraulic Pressure (kPa)": `${calc.pressureKPa.toFixed(1)}`,
        "Hydraulic Pressure (bar)": `${calc.pressureBar.toFixed(2)}`,
        "Input Stroke d₁ (cm)": `${inputStrokeCm.toFixed(1)}`,
        "Output Stroke d₂ (cm)": `${calc.outputStrokeCm.toFixed(2)}`,
        "Work Done W (J)": `${calc.workJ.toFixed(2)}`,
        "Lifted Vehicle / Load": `${calc.load.name}`,
        "Load Mass (kg)": `${calc.load.massKg}`,
        "Load Weight (kN)": `${(calc.loadWeightN / 1000).toFixed(2)}`,
        "Lift Capability": calc.canLiftLoad ? "LIFTED" : "INSUFFICIENT FORCE"
      };
    }

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
      inquiryQuestion: "How do fluid density and displaced volume govern buoyant force, how does pipe cross-sectional geometry govern Bernoulli pressure differentials, how does orifice elevation govern Torricelli efflux velocity, and how does cylinder geometry govern Pascal force amplification?",
      apparatusConfig: {
        "Apparatus Mode": apparatusMode === "buoyancy" ? "Archimedes Overflow Tank" : (apparatusMode === "venturi" ? "Venturi Constriction Pipe" : (apparatusMode === "torricelli" ? "Torricelli Efflux Tank" : "Pascal Hydraulic Lift Press")),
        "Fluid Medium": `${calc.f.name} (ρ = ${calc.f.density} kg/m³)`,
        "Solid Material": `${calc.m.name} (ρ = ${calc.m.density} kg/m³)`,
        "Solid Volume": `${blockVolumeLiters.toFixed(2)} L`,
        "Submersion Depth": `${calc.effectiveSubmersion.toFixed(1)}%`,
        "Free Floating State": isFreeFloating ? (calc.canFloat ? "Equilibrium Floating" : "Sunk to Floor") : "Suspended from Scale",
        "Flow Rate (Venturi)": `${flowRateLps.toFixed(2)} L/s`,
        "Orifice Elevation (Torricelli)": `${orificeHeightM.toFixed(2)} m (Head h = ${(calc.headM).toFixed(2)} m)`,
        "Discharge Coeff C_d": `${dischargeCoeff.toFixed(2)}`,
        "Hydraulic Mechanical Advantage": `${calc.ima.toFixed(1)}× ((D₂/D₁)² = (${piston2DiameterCm.toFixed(0)}/${piston1DiameterCm.toFixed(0)})²)`,
        "Applied Input Force F₁": `${inputForceN.toFixed(0)} N ➔ Output F₂ = ${(calc.outputForceN / 1000).toFixed(2)} kN`,
        "Hydraulic Gauge Pressure": `${calc.pressureKPa.toFixed(1)} kPa (${calc.pressureBar.toFixed(2)} bar)`,
        "Mano-Probe Depth": showPressureProbe ? `${probeDepthCm.toFixed(1)} cm` : "Inactive"
      },
      trials,
      formulas: [
        "F_b = \\rho_{\\text{fluid}} \\cdot V_{\\text{disp}} \\cdot g",
        "W_{\\text{app}} = W_{\\text{real}} - F_b = (\\rho_{\\text{solid}} - \\rho_{\\text{fluid}}) V g",
        "\\frac{V_{\\text{disp}}}{V} = \\frac{\\rho_{\\text{solid}}}{\\rho_{\\text{fluid}}} \\quad (\\text{Floating Equilibrium})",
        "A_1 v_1 = A_2 v_2 \\quad (\\text{Mass Continuity})",
        "P_1 + \\frac{1}{2}\\rho v_1^2 = P_2 + \\frac{1}{2}\\rho v_2^2 \\quad (\\text{Bernoulli Equation})",
        "\\Delta h = \\frac{v_2^2 - v_1^2}{2g} \\quad (\\text{Differential Manometer Head})",
        "v = C_d \\sqrt{2gh} \\quad (\\text{Torricelli's Efflux Velocity})",
        "R = v \\cdot t = 2 C_d \\sqrt{h \\cdot y_h} \\quad (\\text{Parabolic Jet Range})",
        "R_{\\max} = C_d H \\quad (\\text{Maximum Range Theorem at } y_h = H / 2)",
        "P = \\rho g h \\quad (\\text{Hydrostatic Gauge Pressure})",
        "\\frac{F_1}{A_1} = \\frac{F_2}{A_2} = P \\quad (\\text{Pascal's Pressure Transmission})",
        "\\text{IMA} = \\frac{A_2}{A_1} = \\left(\\frac{D_2}{D_1}\\right)^2 \\quad (\\text{Ideal Mechanical Advantage})",
        "\\Delta V = A_1 d_1 = A_2 d_2 \\implies d_2 = \\frac{d_1}{\\text{IMA}} \\quad (\\text{Fluid Incompressibility})",
        "W_1 = F_1 d_1 = F_2 d_2 = W_2 \\quad (\\text{Work / Energy Conservation})"
      ]
    });
    SoundFX.playClick();
  });

  // Export CSV (Mode-Aware: Archimedes, Venturi, Torricelli, and Pascal Hydraulic Press)
  container.querySelector("#btn-fluid-export")?.addEventListener("click", () => {
    const calc = getCalculations();

    if (apparatusMode === "buoyancy") {
      exportLabDataCsv({
        title: "Archimedes Buoyancy & Displaced Fluid Telemetry",
        labId: "fluids_buoyancy",
        parameters: {
          "Apparatus Mode": "Archimedes Overflow Tank",
          "Liquid Medium": calc.f.name,
          "Fluid Density (kg/m³)": calc.f.density,
          "Object Material": calc.m.name,
          "Solid Density (kg/m³)": calc.m.density,
          "Object Volume (L)": blockVolumeLiters.toFixed(2),
          "Object Real Weight (N)": calc.weightRealN.toFixed(2),
          "Free Floating State": isFreeFloating ? (calc.canFloat ? "Equilibrium Floating" : "Sunk to Floor") : "Suspended from Scale",
          "Pressure Probe Status": showPressureProbe ? `Active (Depth = ${probeDepthCm.toFixed(1)} cm, P_gauge = ${calc.pGaugeKPa.toFixed(2)} kPa)` : "Inactive"
        },
        headers: ["Submersion (%)", "Displaced Vol (L)", "Displaced Mass (kg)", "Buoyant Force Fb (N)", "Apparent Weight (N)", "Net Normal / Bottom Force (N)"],
        dataRows: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(sub => {
          const dVol = (blockVolumeLiters * 1e-3) * (sub / 100);
          const mDisp = calc.f.density * dVol;
          const fb = mDisp * g;
          const wApp = Math.max(0, calc.weightRealN - fb);
          const fNorm = calc.m.density > calc.f.density && sub === 100 ? (calc.weightRealN - fb).toFixed(2) : "0.00";
          return [
            `${sub}%`,
            (dVol * 1000).toFixed(2),
            mDisp.toFixed(3),
            fb.toFixed(2),
            wApp.toFixed(2),
            fNorm
          ];
        })
      });
    } else if (apparatusMode === "venturi") {
      exportLabDataCsv({
        title: "Venturi Tube Continuity & Bernoulli Telemetry",
        labId: "fluids_venturi",
        parameters: {
          "Apparatus Mode": "Venturi Constriction Pipe",
          "Liquid Medium": calc.f.name,
          "Fluid Density (kg/m³)": calc.f.density,
          "Dynamic Viscosity μ (Pa·s)": calc.visc.toFixed(6),
          "Inlet Pipe Diameter D₁ (mm)": "60.0",
          "Throat Diameter D₂ (mm)": "30.0",
          "Area Ratio (A₁ / A₂)": "4.0×",
          "Current Volumetric Flow Q (L/s)": flowRateLps.toFixed(2)
        },
        headers: ["Flow Rate Q (L/s)", "Inlet Velocity v₁ (m/s)", "Throat Velocity v₂ (m/s)", "Pressure Drop ΔP (kPa)", "Manometer Head Δh (cm)", "Inlet Reynolds Re₁", "Throat Reynolds Re₂", "Flow Regime"],
        dataRows: [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0].map(qLps => {
          const qM3s = qLps * 1e-3;
          const v1Val = qM3s / calc.a1;
          const v2Val = qM3s / calc.a2;
          const dP = 0.5 * calc.f.density * (v2Val * v2Val - v1Val * v1Val);
          const dH = dP / (calc.f.density * g);
          const r1 = (calc.f.density * v1Val * 0.06) / calc.visc;
          const r2 = (calc.f.density * v2Val * 0.03) / calc.visc;
          const regime = r1 < 2300 ? "Laminar" : (r1 < 4000 ? "Transitional" : "Turbulent");
          return [
            qLps.toFixed(2),
            v1Val.toFixed(2),
            v2Val.toFixed(2),
            (dP / 1000).toFixed(2),
            (dH * 100).toFixed(1),
            Math.round(r1).toString(),
            Math.round(r2).toString(),
            regime
          ];
        })
      });
    } else if (apparatusMode === "torricelli") {
      exportLabDataCsv({
        title: "Torricelli Efflux Velocity & Jet Range Telemetry",
        labId: "fluids_torricelli",
        parameters: {
          "Apparatus Mode": "Torricelli Efflux Tank",
          "Liquid Medium": calc.f.name,
          "Fluid Density (kg/m³)": calc.f.density,
          "Total Liquid Level H (m)": calc.H_total.toFixed(2),
          "Discharge Coeff C_d": dischargeCoeff.toFixed(2),
          "Nozzle Diameter (mm)": "12.0",
          "Current Orifice Elevation y_h (m)": calc.y_h.toFixed(2),
          "Theoretical Max Range": `${calc.maxRangeM.toFixed(2)} m (at midpoint y_h = ${(calc.H_total / 2).toFixed(2)} m)`
        },
        headers: ["Orifice Elevation y_h (m)", "Liquid Head h (m)", "Ideal Efflux Vel v_ideal (m/s)", "Actual Efflux Vel v (m/s)", "Flight Time t (s)", "Horizontal Range R (m)", "Max Range R_max (m)", "Discharge Q (L/s)"],
        dataRows: [0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70, 0.75].map(yh => {
          const hHead = Math.max(0.01, calc.H_total - yh);
          const vId = Math.sqrt(2 * g * hHead);
          const vAct = dischargeCoeff * vId;
          const tFl = Math.sqrt((2 * yh) / g);
          const r = vAct * tFl;
          const qVal = dischargeCoeff * calc.nozzleAreaM2 * vId * 1000;
          return [
            yh.toFixed(2),
            hHead.toFixed(2),
            vId.toFixed(2),
            vAct.toFixed(2),
            tFl.toFixed(3),
            r.toFixed(2),
            calc.maxRangeM.toFixed(2),
            qVal.toFixed(2)
          ];
        })
      });
    } else {
      // Pascal Hydraulic Press Mode
      exportLabDataCsv({
        title: "Pascal Hydraulic Press & Mechanical Advantage Telemetry",
        labId: "fluids_hydraulic",
        parameters: {
          "Apparatus Mode": "Pascal Hydraulic Lift Press",
          "Liquid Medium": calc.f.name,
          "Fluid Density (kg/m³)": calc.f.density,
          "Input Cylinder D₁ (cm)": piston1DiameterCm.toFixed(1),
          "Output Cylinder D₂ (cm)": piston2DiameterCm.toFixed(1),
          "Ideal Mechanical Advantage (IMA)": `${calc.ima.toFixed(1)}×`,
          "Input Stroke d₁ (cm)": inputStrokeCm.toFixed(1),
          "Output Stroke d₂ (cm)": calc.outputStrokeCm.toFixed(2),
          "Lifted Load": `${calc.load.name} (${calc.load.massKg} kg, ${(calc.loadWeightN / 1000).toFixed(2)} kN)`,
          "Minimum Force to Lift Load": `${calc.minForceToLiftN.toFixed(1)} N`
        },
        headers: ["Input Force F₁ (N)", "Input Mass Equiv (kg)", "Output Lift Force F₂ (kN)", "Hydraulic Pressure (kPa)", "Pressure (bar)", "Work Done W (J)", "Output Stroke d₂ (cm)", "Lift Capability"],
        dataRows: [25, 50, 75, 100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 1000].map(f1 => {
          const f2 = f1 * calc.ima;
          const pPa = f1 / calc.a1_hyd;
          const pKPa = pPa / 1000;
          const pBar = pPa / 100000;
          const wJ = f1 * (inputStrokeCm / 100);
          const canLift = f2 >= calc.loadWeightN ? "LIFTED" : "INSUFFICIENT";
          return [
            f1.toFixed(0),
            (f1 / g).toFixed(1),
            (f2 / 1000).toFixed(2),
            pKPa.toFixed(1),
            pBar.toFixed(2),
            wJ.toFixed(2),
            calc.outputStrokeCm.toFixed(2),
            canLift
          ];
        })
      });
    }

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
