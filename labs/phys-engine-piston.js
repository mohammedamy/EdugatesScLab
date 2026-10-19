// Edugates-ClipSAT Science Labs - Physics: Four-Stroke Engine Piston & Otto Cycle Suite
// 60 FPS Precision Thermodynamics & Mechanical Kinematics Simulation:
// Piston Slider-Crank Kinematics x(θ), Thermodynamic PV Indicator Diagram,
// Four Stroke Stages (Intake, Compression, Combustion/Power, Exhaust),
// Otto Cycle Thermal Efficiency η = 1 - (1/r^(γ-1)), Indicated Work W_net = ∮ P dV, and Engine Torque.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initEnginePistonLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Engine Geometry & Physical Constants
  const BORE_M = 0.085; // 85 mm cylinder bore
  const STROKE_M = 0.088; // 88 mm stroke
  const CRANK_RADIUS_M = STROKE_M / 2; // 44 mm crank throw
  const CON_ROD_LENGTH_M = 0.145; // 145 mm connecting rod
  const LAMBDA = CRANK_RADIUS_M / CON_ROD_LENGTH_M; // ~0.303
  const PISTON_AREA = (Math.PI / 4) * BORE_M * BORE_M; // m^2
  const DISPLACEMENT_VOL_M3 = PISTON_AREA * STROKE_M; // ~0.000499 m^3 (~499 cc single cylinder)
  const DISPLACEMENT_CC = DISPLACEMENT_VOL_M3 * 1e6; // cc
  const GAMMA = 1.40; // Specific heat ratio for air/fuel mix (Cp/Cv)
  const P_ATM_KPA = 101.325; // Atmospheric pressure (kPa)
  const T_ATM_K = 298.15; // Ambient temperature (25 °C)

  // Fuel Properties
  const FUELS = {
    regular: { name: "Regular Gasoline (87 Octane)", qLhv: 44.0e6, flameSpeed: 0.42, color: "#38bdf8", maxSafeComp: 10.5 },
    premium: { name: "Premium Gasoline (93 Octane)", qLhv: 44.5e6, flameSpeed: 0.45, color: "#a855f7", maxSafeComp: 12.0 },
    e85: { name: "E85 Bio-Ethanol (105 Octane)", qLhv: 29.2e6, flameSpeed: 0.52, color: "#10b981", maxSafeComp: 13.5 },
    racing: { name: "Methanol Racing Fuel", qLhv: 20.0e6, flameSpeed: 0.65, color: "#f59e0b", maxSafeComp: 14.5 }
  };

  // State Variables
  let rpm = 1800; // Revolutions per minute
  let compRatio = 9.5; // Compression ratio r = V_max / V_min (7.0 to 14.0)
  let throttlePct = 85; // Throttle percentage (20% to 100%)
  let selectedFuelKey = "regular";
  let isRunning = true;
  let isPaused = false;
  let timeScale = 1.0; // Playback speed multiplier (0.2, 0.5, 1.0)
  let crankAngleDeg = 0.0; // 0° to 720° for 4-stroke cycle
  let animId = null;
  let lastTimestamp = performance.now();
  let sparkIntensity = 0.0; // Visual spark plug plasma flash (0.0 to 1.0)
  let flameRadius = 0.0; // Flame front expansion radius
  let audioEngineActive = false;
  let audioCtx = null;
  let engineOsc = null;
  let engineGain = null;

  // Visual Particle Effects (Intake Air Mist, Combustion Flame Sparks, Exhaust Smoke)
  const chamberParticles = [];

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #f59e0b; box-shadow: 0 0 10px #f59e0b;"></span>
            Four-Stroke Engine &amp; Piston Dynamics
          </span>
          <span class="badge" style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); color: #fbbf24; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            ${renderLatex("\\eta_{\\text{Otto}} = 1 - \\frac{1}{r^{\\gamma-1}} \\quad \\bullet \\quad W_{\\text{net}} = \\oint P\\,dV \\quad \\bullet \\quad P_{\\text{ind}} = \\frac{W_{\\text{net}} \\cdot \\text{RPM}}{120}")}
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-piston-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Engine Cutaway
            </button>
            <button id="view-mode-piston-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-piston-playpause" style="padding: 5px 14px; font-size: 0.78rem; background: linear-gradient(135deg, #f59e0b, #d97706); border: none; font-weight: 700; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.35);">
            ⏸ Pause Engine
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-piston-step" title="Advance Crankshaft by +15°" style="padding: 5px 12px; font-size: 0.78rem;">
            ↷ Step +15°
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-piston-audio" title="Toggle Synthesized Engine Acoustic Rumble" style="padding: 5px 12px; font-size: 0.78rem; color: #38bdf8;">
            🔊 Audio: Off
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-piston-export" title="Export thermodynamic PV telemetry to CSV (Hotkey: E)" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export CSV (E)
          </button>
        </div>
      </div>

      <!-- Main Layout: 2-Column Split (Engine Cylinder Cross-Section & PV Indicator Diagram) -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="piston-layout">
        <!-- Left Column: 60 FPS Animated Cutaway Engine Canvas -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(245, 158, 11, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #1e1708 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 570px;">
          <canvas id="piston-engine-canvas" width="620" height="570" style="height: 570px; width: 100%; display: block;"></canvas>

          <!-- Stroke Stage Indicator HUD Overlay -->
          <div style="position: absolute; top: 14px; left: 14px; right: 14px; display: flex; justify-content: space-between; align-items: center; pointer-events: none;">
            <div id="piston-stroke-badge" style="background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(8px); border: 1.5px solid #f59e0b; padding: 6px 14px; border-radius: 8px; font-weight: 800; font-size: 0.85rem; color: #f59e0b; display: flex; align-items: center; gap: 8px;">
              <span id="piston-stroke-dot" style="width: 10px; height: 10px; border-radius: 50%; background: #f59e0b; display: inline-block;"></span>
              <span id="piston-stroke-name">1. INTAKE STROKE (0° - 180°)</span>
            </div>
            <div style="background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.15); padding: 6px 12px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.8rem; color: #94a3b8;">
              θ = <span id="piston-crank-angle-text" style="color: #38bdf8; font-weight: 700;">0.0°</span> / 720°
            </div>
          </div>

          <!-- Bottom Engine Status Overlay -->
          <div style="position: absolute; bottom: 12px; left: 14px; right: 14px; background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 10px; padding: 10px 14px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; pointer-events: none;">
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Pressure (P)</div>
              <div id="hud-pressure" style="font-size: 0.95rem; font-weight: 700; color: #f59e0b; font-family: var(--font-mono);">101.3 kPa</div>
            </div>
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Temperature (T)</div>
              <div id="hud-temperature" style="font-size: 0.95rem; font-weight: 700; color: #ef4444; font-family: var(--font-mono);">25.0 °C</div>
            </div>
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Volume (V)</div>
              <div id="hud-volume" style="font-size: 0.95rem; font-weight: 700; color: #38bdf8; font-family: var(--font-mono);">557 cc</div>
            </div>
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Piston Speed</div>
              <div id="hud-piston-speed" style="font-size: 0.95rem; font-weight: 700; color: #10b981; font-family: var(--font-mono);">0.0 m/s</div>
            </div>
          </div>

          <!-- 4K Authentic Real Bench Photo Overlay -->
          <div id="piston-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <picture>
              <source srcset="assets/labs/engine_piston_bench.webp" type="image/webp">
              <img src="assets/labs/engine_piston_bench.jpg" decoding="async" loading="lazy" alt="4K Internal Combustion Engine &amp; Dynamometer Test Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            </picture>

            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Test Apparatus</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.88rem;">Cutaway Single-Cylinder Engine</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Telemetry Sensor</div>
                <div style="color: #f59e0b; font-weight: 700; font-family: var(--font-mono); font-size: 0.88rem;">Kistler Quartz Pressure Transducer</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Indicator Output</div>
                <div style="color: #10b981; font-weight: 700; font-family: var(--font-mono); font-size: 0.88rem;">High-Speed Digital PV Scope</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: PV Indicator Diagram & Controls -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <!-- Real-Time PV Indicator Diagram Canvas -->
          <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; padding: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.82rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
                <span>📈</span> PV Indicator Diagram (Otto Cycle)
              </span>
              <span id="lbl-pv-loop-work" style="font-family: var(--font-mono); font-size: 0.76rem; color: #10b981; font-weight: 700;">
                W_net = 0.0 J
              </span>
            </div>
            <canvas id="piston-pv-canvas" width="480" height="230" style="width: 100%; height: 210px; display: block; border-radius: 8px; background: #030712;"></canvas>
          </div>

          <!-- Stroke Navigation Pills -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
            <button class="btn btn-secondary btn-sm stroke-jump-btn" data-target-angle="90" style="padding: 6px 4px; font-size: 0.72rem; font-weight: 700; border-color: rgba(56, 189, 248, 0.3); color: #38bdf8;">
              1. Intake
            </button>
            <button class="btn btn-secondary btn-sm stroke-jump-btn" data-target-angle="270" style="padding: 6px 4px; font-size: 0.72rem; font-weight: 700; border-color: rgba(245, 158, 11, 0.3); color: #f59e0b;">
              2. Compression
            </button>
            <button class="btn btn-secondary btn-sm stroke-jump-btn" data-target-angle="400" style="padding: 6px 4px; font-size: 0.72rem; font-weight: 700; border-color: rgba(239, 68, 68, 0.3); color: #ef4444;">
              3. Power
            </button>
            <button class="btn btn-secondary btn-sm stroke-jump-btn" data-target-angle="630" style="padding: 6px 4px; font-size: 0.72rem; font-weight: 700; border-color: rgba(148, 163, 184, 0.3); color: #94a3b8;">
              4. Exhaust
            </button>
          </div>

          <!-- Interactive Controls Dashboard -->
          <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 12px;">
            <!-- Engine RPM & Playback Speed -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #94a3b8; margin-bottom: 4px;">
                  <span>Engine Speed (RPM)</span>
                  <span id="lbl-piston-rpm" style="color: #f59e0b; font-weight: 700; font-family: var(--font-mono);">1800 RPM</span>
                </div>
                <input type="range" id="slider-piston-rpm" min="600" max="6000" step="100" value="1800" style="width: 100%; accent-color: #f59e0b;">
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #94a3b8; margin-bottom: 4px;">
                  <span>Time Pacing</span>
                  <span id="lbl-piston-speed" style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono);">1.0x (Realtime)</span>
                </div>
                <div style="display: flex; gap: 6px;">
                  <button class="btn btn-secondary btn-sm time-pacing-btn" data-speed="0.2" style="flex: 1; padding: 4px; font-size: 0.7rem;">0.2x</button>
                  <button class="btn btn-secondary btn-sm time-pacing-btn" data-speed="0.5" style="flex: 1; padding: 4px; font-size: 0.7rem;">0.5x</button>
                  <button class="btn btn-secondary btn-sm time-pacing-btn active" data-speed="1.0" style="flex: 1; padding: 4px; font-size: 0.7rem; background: #38bdf8; color: #0f172a; font-weight: 700;">1.0x</button>
                </div>
              </div>
            </div>

            <!-- Compression Ratio & Throttle Position -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #94a3b8; margin-bottom: 4px;">
                  <span>Compression Ratio (r)</span>
                  <span id="lbl-piston-comp" style="color: #10b981; font-weight: 700; font-family: var(--font-mono);">9.5 : 1</span>
                </div>
                <input type="range" id="slider-piston-comp" min="7.0" max="14.0" step="0.5" value="9.5" style="width: 100%; accent-color: #10b981;">
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #94a3b8; margin-bottom: 4px;">
                  <span>Throttle Valve (%)</span>
                  <span id="lbl-piston-throttle" style="color: #ef4444; font-weight: 700; font-family: var(--font-mono);">85%</span>
                </div>
                <input type="range" id="slider-piston-throttle" min="20" max="100" step="5" value="85" style="width: 100%; accent-color: #ef4444;">
              </div>
            </div>

            <!-- Fuel Selection -->
            <div>
              <label for="select-piston-fuel" style="font-size: 0.75rem; color: #94a3b8; display: block; margin-bottom: 4px;">Fuel Mixture &amp; Octane Grade</label>
              <select id="select-piston-fuel" style="width: 100%; background: #0f172a; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #f1f5f9; padding: 6px 10px; font-size: 0.8rem;">
                <option value="regular">Regular Gasoline (87 Octane) - Economy</option>
                <option value="premium">Premium Gasoline (93 Octane) - High Comp</option>
                <option value="e85">E85 Bio-Ethanol (105 Octane) - High Cooling</option>
                <option value="racing">Methanol Racing Fuel - Extreme Boost</option>
              </select>
            </div>
          </div>

          <!-- Analytical Performance Telemetry Cards -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 8px; padding: 8px 10px; text-align: center;">
              <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase;">Otto Efficiency (η)</div>
              <div id="calc-otto-eff" style="font-size: 1.05rem; font-weight: 800; color: #f59e0b; font-family: var(--font-mono);">59.4%</div>
            </div>
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 8px; padding: 8px 10px; text-align: center;">
              <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase;">Indicated Power</div>
              <div id="calc-power" style="font-size: 1.05rem; font-weight: 800; color: #10b981; font-family: var(--font-mono);">18.2 kW</div>
            </div>
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 8px; padding: 8px 10px; text-align: center;">
              <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase;">Engine Torque (τ)</div>
              <div id="calc-torque" style="font-size: 1.05rem; font-weight: 800; color: #38bdf8; font-family: var(--font-mono);">96.5 N·m</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Competency Checkpoint Assessment Container -->
      <div id="engine-piston-checkpoint-container" style="margin-top: 24px;"></div>
    </div>
  `;

  // Canvas References
  const engineCanvas = container.querySelector("#piston-engine-canvas");
  const pvCanvas = container.querySelector("#piston-pv-canvas");
  const engineCtx = engineCanvas?.getContext("2d");
  const pvCtx = pvCanvas?.getContext("2d");

  // HiDPI Canvas Scaling Helper
  function getDPR() {
    return typeof window.getLabDPR === "function" ? window.getLabDPR() : (typeof window.getOptimizedDPR === "function" ? window.getOptimizedDPR() : (window.devicePixelRatio || 1));
  }

  function resizeCanvases() {
    if (!engineCanvas || !pvCanvas) return;
    const dpr = getDPR();
    const wEng = engineCanvas.clientWidth || 620;
    const hEng = engineCanvas.clientHeight || 570;
    engineCanvas.width = Math.round(wEng * dpr);
    engineCanvas.height = Math.round(hEng * dpr);
    if (engineCtx && engineCtx.setTransform) {
      engineCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const wPv = pvCanvas.clientWidth || 480;
    const hPv = pvCanvas.clientHeight || 210;
    pvCanvas.width = Math.round(wPv * dpr);
    pvCanvas.height = Math.round(hPv * dpr);
    if (pvCtx && pvCtx.setTransform) {
      pvCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }
  resizeCanvases();
  window.addEventListener("resize", resizeCanvases);

  // Thermodynamics & Kinematics Calculations
  function calculateEngineState(angleDeg) {
    const angleRad = (angleDeg * Math.PI) / 180;
    // Piston displacement from TDC (Top Dead Center) down toward BDC
    // x = r_c * [(1 - cos θ) + (1/λ) * (1 - sqrt(1 - λ² sin² θ))]
    const sinA = Math.sin(angleRad);
    const cosA = Math.cos(angleRad);
    const radical = Math.max(0, 1 - LAMBDA * LAMBDA * sinA * sinA);
    const pistonDispM = CRANK_RADIUS_M * ((1 - cosA) + (1 / LAMBDA) * (1 - Math.sqrt(radical)));
    
    // Instantaneous Piston Speed (m/s)
    const omegaCrank = (2 * Math.PI * rpm) / 60; // rad/s
    const pistonSpeedMps = CRANK_RADIUS_M * omegaCrank * (sinA + (LAMBDA * Math.sin(2 * angleRad)) / (2 * Math.sqrt(radical)));

    // Cylinder Volume
    const vClearanceM3 = DISPLACEMENT_VOL_M3 / (compRatio - 1);
    const vCurrentM3 = vClearanceM3 + PISTON_AREA * pistonDispM;
    const vMaxM3 = vClearanceM3 + DISPLACEMENT_VOL_M3;
    const vCurrentCc = vCurrentM3 * 1e6;

    // Stroke Identification:
    // 0° - 180°: Intake (TDC -> BDC)
    // 180° - 360°: Compression (BDC -> TDC)
    // 360° - 540°: Combustion & Power (TDC -> BDC)
    // 540° - 720°: Exhaust (BDC -> TDC)
    let strokeId = 1;
    let strokeName = "1. INTAKE STROKE (0° - 180°)";
    let strokeColor = "#38bdf8";
    let pressureKpa = P_ATM_KPA;
    let tempK = T_ATM_K;
    let intakeValveOpen = 0.0; // 0 to 1 open fraction
    let exhaustValveOpen = 0.0;

    const fuel = FUELS[selectedFuelKey] || FUELS.regular;
    const heatAddedJ = (fuel.qLhv * 1e-4) * (throttlePct / 100);

    if (angleDeg < 180) {
      // Stroke 1: Intake
      strokeId = 1;
      strokeName = "1. INTAKE STROKE (0° - 180°)";
      strokeColor = "#38bdf8";
      intakeValveOpen = Math.sin((angleDeg / 180) * Math.PI);
      exhaustValveOpen = 0.0;
      pressureKpa = P_ATM_KPA * (0.95 - (1 - throttlePct / 100) * 0.25);
      tempK = T_ATM_K + 10 * (angleDeg / 180);
    } else if (angleDeg < 360) {
      // Stroke 2: Compression
      strokeId = 2;
      strokeName = "2. COMPRESSION STROKE (180° - 360°)";
      strokeColor = "#f59e0b";
      intakeValveOpen = 0.0;
      exhaustValveOpen = 0.0;
      // Isentropic compression: P = P1 * (V_max / V)^gamma
      const p1 = P_ATM_KPA;
      pressureKpa = p1 * Math.pow(vMaxM3 / vCurrentM3, GAMMA);
      tempK = T_ATM_K * Math.pow(vMaxM3 / vCurrentM3, GAMMA - 1);
    } else if (angleDeg < 540) {
      // Stroke 3: Combustion & Power
      strokeId = 3;
      strokeName = "3. COMBUSTION & POWER (360° - 540°)";
      strokeColor = "#ef4444";
      intakeValveOpen = 0.0;
      exhaustValveOpen = 0.0;

      // Peak state at TDC (360°):
      const p2 = P_ATM_KPA * Math.pow(compRatio, GAMMA);
      const t2 = T_ATM_K * Math.pow(compRatio, GAMMA - 1);
      const pPeakKpa = p2 + ((GAMMA - 1) * heatAddedJ * 1e-3) / (vClearanceM3 * 1e3);
      const tPeakK = t2 * (pPeakKpa / p2);

      // Isentropic expansion from peak:
      pressureKpa = pPeakKpa * Math.pow(vClearanceM3 / vCurrentM3, GAMMA);
      tempK = tPeakK * Math.pow(vClearanceM3 / vCurrentM3, GAMMA - 1);

      // Trigger spark at ~360°
      if (angleDeg >= 360 && angleDeg <= 375) {
        sparkIntensity = 1.0 - (angleDeg - 360) / 15;
      } else {
        sparkIntensity = 0.0;
      }
    } else {
      // Stroke 4: Exhaust
      strokeId = 4;
      strokeName = "4. EXHAUST STROKE (540° - 720°)";
      strokeColor = "#94a3b8";
      intakeValveOpen = 0.0;
      exhaustValveOpen = Math.sin(((angleDeg - 540) / 180) * Math.PI);
      pressureKpa = P_ATM_KPA * 1.06;
      tempK = (T_ATM_K + 350) - 150 * ((angleDeg - 540) / 180);
    }

    // Theoretical Otto Cycle Metrics
    const ottoEff = 1 - Math.pow(compRatio, 1 - GAMMA);
    // Net Work per cycle (approx closed Otto loop):
    const p1 = P_ATM_KPA * 1e3; // Pa
    const v1 = vMaxM3;
    const v2 = vClearanceM3;
    const p2 = p1 * Math.pow(compRatio, GAMMA);
    const pPeak = (p2 + ((GAMMA - 1) * heatAddedJ) / v2);
    const p4 = pPeak * Math.pow(1 / compRatio, GAMMA);

    const wExp = (pPeak * v2 - p4 * v1) / (GAMMA - 1);
    const wComp = (p2 * v2 - p1 * v1) / (GAMMA - 1);
    const wNetJ = Math.max(0, (wExp - wComp) * (throttlePct / 100));

    // Indicated Power (kW) = W_net * (RPM / 120) / 1000
    const powerKw = (wNetJ * (rpm / 120)) / 1000;
    // Torque (N*m) = Power (W) / omega_crank
    const torqueNm = (powerKw * 1000) / omegaCrank;

    return {
      angleDeg,
      strokeId,
      strokeName,
      strokeColor,
      pistonDispM,
      pistonSpeedMps,
      pressureKpa,
      tempK,
      vCurrentCc,
      vMaxM3,
      vClearanceM3,
      intakeValveOpen,
      exhaustValveOpen,
      ottoEff,
      wNetJ,
      powerKw,
      torqueNm
    };
  }

  // Draw 60 FPS Cutaway Cylinder Engine
  function drawEngine(state) {
    if (!engineCtx || !engineCanvas) return;
    const w = engineCanvas.clientWidth || 620;
    const h = engineCanvas.clientHeight || 570;

    engineCtx.clearRect(0, 0, w, h);

    // Coordinate Centerings
    const centerX = w * 0.50;
    const cylinderTopY = 90;
    const cylinderBottomY = 320;
    const cylinderWidth = 170;
    const crankCenterY = 460;

    // Background Engineering Grid
    engineCtx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    engineCtx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      engineCtx.beginPath();
      engineCtx.moveTo(x, 0);
      engineCtx.lineTo(x, h);
      engineCtx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      engineCtx.beginPath();
      engineCtx.moveTo(0, y);
      engineCtx.lineTo(w, y);
      engineCtx.stroke();
    }

    // 1. Cast-Iron Engine Block & Cooling Water Jackets
    const blockGrad = engineCtx.createLinearGradient(centerX - 130, 0, centerX + 130, 0);
    blockGrad.addColorStop(0, "#1e293b");
    blockGrad.addColorStop(0.2, "#334155");
    blockGrad.addColorStop(0.5, "#475569");
    blockGrad.addColorStop(0.8, "#334155");
    blockGrad.addColorStop(1, "#1e293b");

    engineCtx.fillStyle = blockGrad;
    // Outer engine block walls
    engineCtx.beginPath();
    engineCtx.roundRect(centerX - 135, cylinderTopY - 20, 270, 250, 8);
    engineCtx.fill();

    // Cooling Passages / Water Jacket Voids
    engineCtx.fillStyle = "rgba(14, 165, 233, 0.25)";
    engineCtx.strokeStyle = "rgba(14, 165, 233, 0.5)";
    engineCtx.lineWidth = 1.5;
    [-115, 95].forEach(dx => {
      engineCtx.fillRect(centerX + dx, cylinderTopY + 10, 20, 190);
      engineCtx.strokeRect(centerX + dx, cylinderTopY + 10, 20, 190);
    });

    // 2. Combustion Chamber Bore (Honed Cylinder Liner)
    const linerGrad = engineCtx.createLinearGradient(centerX - cylinderWidth / 2, 0, centerX + cylinderWidth / 2, 0);
    linerGrad.addColorStop(0, "#0f172a");
    linerGrad.addColorStop(0.08, "#1e293b");
    linerGrad.addColorStop(0.5, "#0b0f19");
    linerGrad.addColorStop(0.92, "#1e293b");
    linerGrad.addColorStop(1, "#0f172a");

    engineCtx.fillStyle = linerGrad;
    engineCtx.fillRect(centerX - cylinderWidth / 2, cylinderTopY, cylinderWidth, 230);
    engineCtx.strokeStyle = "#64748b";
    engineCtx.lineWidth = 2.5;
    engineCtx.strokeRect(centerX - cylinderWidth / 2, cylinderTopY, cylinderWidth, 230);

    // Calculate Piston Vertical Position
    // Top Dead Center (TDC) Y = cylinderTopY + 35
    // Bottom Dead Center (BDC) Y = cylinderTopY + 35 + 100
    const strokePixels = 95;
    const tdcPistonY = cylinderTopY + 35;
    const pistonY = tdcPistonY + (state.pistonDispM / (2 * CRANK_RADIUS_M)) * strokePixels;
    const pistonHeight = 65;

    // 3. Dynamic Gas Glow Inside Cylinder Chamber (Between Cylinder Head & Piston Crown)
    const chamberHeight = Math.max(8, pistonY - cylinderTopY);
    let gasFillGrad = engineCtx.createLinearGradient(centerX, cylinderTopY, centerX, pistonY);

    if (state.strokeId === 1) {
      // Intake: Cool cyan/blue atmospheric vapor
      gasFillGrad.addColorStop(0, "rgba(56, 189, 248, 0.45)");
      gasFillGrad.addColorStop(1, "rgba(2, 132, 199, 0.15)");
    } else if (state.strokeId === 2) {
      // Compression: Heating amber / orange gas
      const compRatioFrac = (state.pressureKpa - 100) / 1200;
      gasFillGrad.addColorStop(0, `rgba(245, 158, 11, ${0.3 + 0.4 * compRatioFrac})`);
      gasFillGrad.addColorStop(1, "rgba(217, 119, 6, 0.2)");
    } else if (state.strokeId === 3) {
      // Combustion: Blinding yellow / fiery explosion
      const flameP = Math.min(1.0, (state.pressureKpa - 100) / 3500);
      gasFillGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      gasFillGrad.addColorStop(0.25, `rgba(253, 224, 71, ${0.8 + 0.2 * flameP})`);
      gasFillGrad.addColorStop(0.7, "rgba(239, 68, 68, 0.65)");
      gasFillGrad.addColorStop(1, "rgba(185, 28, 28, 0.4)");
    } else {
      // Exhaust: Smoky charcoal & ruby embers
      gasFillGrad.addColorStop(0, "rgba(100, 116, 139, 0.5)");
      gasFillGrad.addColorStop(1, "rgba(51, 65, 85, 0.25)");
    }

    engineCtx.fillStyle = gasFillGrad;
    engineCtx.fillRect(centerX - cylinderWidth / 2 + 2, cylinderTopY, cylinderWidth - 4, chamberHeight);

    // Particle Agitation (Fuel drops / Flame sparks / Smoke)
    if (chamberParticles.length < 35 && Math.random() < 0.4) {
      chamberParticles.push({
        x: centerX + (Math.random() - 0.5) * (cylinderWidth - 20),
        y: cylinderTopY + Math.random() * chamberHeight,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 1.0,
        color: state.strokeId === 3 ? "#facc15" : (state.strokeId === 1 ? "#38bdf8" : "#94a3b8")
      });
    }
    for (let i = chamberParticles.length - 1; i >= 0; i--) {
      const p = chamberParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.035;
      if (p.life <= 0 || p.y > pistonY) {
        chamberParticles.splice(i, 1);
        continue;
      }
      engineCtx.fillStyle = p.color;
      engineCtx.globalAlpha = p.life;
      engineCtx.beginPath();
      engineCtx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      engineCtx.fill();
      engineCtx.globalAlpha = 1.0;
    }

    // 4. Cylinder Head Top, Intake Port (Left), Exhaust Port (Right)
    // Cylinder Head Roof (Angled Pent-Roof)
    engineCtx.fillStyle = "#334155";
    engineCtx.beginPath();
    engineCtx.moveTo(centerX - cylinderWidth / 2, cylinderTopY);
    engineCtx.lineTo(centerX - 40, cylinderTopY - 25);
    engineCtx.lineTo(centerX, cylinderTopY - 12);
    engineCtx.lineTo(centerX + 40, cylinderTopY - 25);
    engineCtx.lineTo(centerX + cylinderWidth / 2, cylinderTopY);
    engineCtx.closePath();
    engineCtx.fill();
    engineCtx.strokeStyle = "#94a3b8";
    engineCtx.stroke();

    // Intake Port Runner (Left: Blue charge entry)
    engineCtx.fillStyle = "rgba(56, 189, 248, 0.2)";
    engineCtx.beginPath();
    engineCtx.moveTo(centerX - cylinderWidth / 2 - 40, cylinderTopY - 45);
    engineCtx.quadraticCurveTo(centerX - 50, cylinderTopY - 45, centerX - 45, cylinderTopY - 10);
    engineCtx.lineTo(centerX - 25, cylinderTopY - 8);
    engineCtx.quadraticCurveTo(centerX - 40, cylinderTopY - 30, centerX - cylinderWidth / 2 - 40, cylinderTopY - 30);
    engineCtx.closePath();
    engineCtx.fill();

    // Exhaust Port Runner (Right: Red exhaust exit)
    engineCtx.fillStyle = "rgba(239, 68, 68, 0.2)";
    engineCtx.beginPath();
    engineCtx.moveTo(centerX + cylinderWidth / 2 + 40, cylinderTopY - 45);
    engineCtx.quadraticCurveTo(centerX + 50, cylinderTopY - 45, centerX + 45, cylinderTopY - 10);
    engineCtx.lineTo(centerX + 25, cylinderTopY - 8);
    engineCtx.quadraticCurveTo(centerX + 40, cylinderTopY - 30, centerX + cylinderWidth / 2 + 40, cylinderTopY - 30);
    engineCtx.closePath();
    engineCtx.fill();

    // Poppet Valves:
    // Intake Valve (Left)
    const intakeValveLift = state.intakeValveOpen * 14;
    engineCtx.save();
    engineCtx.translate(centerX - 42, cylinderTopY - 14 + intakeValveLift);
    engineCtx.fillStyle = state.intakeValveOpen > 0.1 ? "#38bdf8" : "#94a3b8";
    // Valve disc
    engineCtx.beginPath();
    engineCtx.ellipse(0, 0, 18, 4, 0, 0, Math.PI * 2);
    engineCtx.fill();
    // Valve stem
    engineCtx.fillStyle = "#cbd5e1";
    engineCtx.fillRect(-3, -35, 6, 35);
    engineCtx.restore();

    // Exhaust Valve (Right)
    const exhaustValveLift = state.exhaustValveOpen * 14;
    engineCtx.save();
    engineCtx.translate(centerX + 42, cylinderTopY - 14 + exhaustValveLift);
    engineCtx.fillStyle = state.exhaustValveOpen > 0.1 ? "#ef4444" : "#94a3b8";
    // Valve disc
    engineCtx.beginPath();
    engineCtx.ellipse(0, 0, 18, 4, 0, 0, Math.PI * 2);
    engineCtx.fill();
    // Valve stem
    engineCtx.fillStyle = "#cbd5e1";
    engineCtx.fillRect(-3, -35, 6, 35);
    engineCtx.restore();

    // 5. Central Spark Plug with High-Voltage Plasma Arc
    engineCtx.fillStyle = "#f8fafc"; // Ceramic insulator
    engineCtx.fillRect(centerX - 5, cylinderTopY - 60, 10, 42);
    engineCtx.strokeStyle = "#64748b"; // Threaded steel hex
    engineCtx.strokeRect(centerX - 6.5, cylinderTopY - 26, 13, 16);
    engineCtx.fillStyle = "#0284c7"; // Terminal nut
    engineCtx.fillRect(centerX - 4, cylinderTopY - 68, 8, 8);

    // Electrodes
    engineCtx.strokeStyle = "#e2e8f0";
    engineCtx.lineWidth = 1.5;
    engineCtx.beginPath();
    engineCtx.moveTo(centerX, cylinderTopY - 10);
    engineCtx.lineTo(centerX, cylinderTopY + 2); // Center electrode
    engineCtx.moveTo(centerX - 5, cylinderTopY - 2);
    engineCtx.lineTo(centerX - 5, cylinderTopY + 4);
    engineCtx.lineTo(centerX - 1, cylinderTopY + 4); // Ground ground electrode
    engineCtx.stroke();

    // Spark Flash (Ignition Arc)
    if (sparkIntensity > 0.05) {
      engineCtx.save();
      engineCtx.shadowColor = "#38bdf8";
      engineCtx.shadowBlur = 25 * sparkIntensity;
      engineCtx.strokeStyle = "#ffffff";
      engineCtx.lineWidth = 2.5;
      engineCtx.beginPath();
      engineCtx.moveTo(centerX, cylinderTopY + 2);
      // Zigzag lightning plasma
      engineCtx.lineTo(centerX - 2, cylinderTopY + 3);
      engineCtx.lineTo(centerX, cylinderTopY + 3.5);
      engineCtx.lineTo(centerX - 1, cylinderTopY + 4);
      engineCtx.stroke();

      // Expanding explosion flash burst
      const burstGrad = engineCtx.createRadialGradient(centerX, cylinderTopY + 4, 2, centerX, cylinderTopY + 4, 45 * sparkIntensity);
      burstGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      burstGrad.addColorStop(0.3, "rgba(250, 204, 21, 0.75)");
      burstGrad.addColorStop(1, "rgba(239, 68, 68, 0)");
      engineCtx.fillStyle = burstGrad;
      engineCtx.beginPath();
      engineCtx.arc(centerX, cylinderTopY + 4, 45 * sparkIntensity, 0, Math.PI * 2);
      engineCtx.fill();
      engineCtx.restore();
    }

    // 6. Machined Aluminum Piston Assembly
    const pistonW = cylinderWidth - 6;
    const pistonLeft = centerX - pistonW / 2;

    const pistonGrad = engineCtx.createLinearGradient(pistonLeft, 0, pistonLeft + pistonW, 0);
    pistonGrad.addColorStop(0, "#94a3b8");
    pistonGrad.addColorStop(0.2, "#f1f5f9");
    pistonGrad.addColorStop(0.5, "#cbd5e1");
    pistonGrad.addColorStop(0.8, "#f1f5f9");
    pistonGrad.addColorStop(1, "#94a3b8");

    engineCtx.fillStyle = pistonGrad;
    engineCtx.beginPath();
    engineCtx.roundRect(pistonLeft, pistonY, pistonW, pistonHeight, 4);
    engineCtx.fill();
    engineCtx.strokeStyle = "#475569";
    engineCtx.lineWidth = 1.5;
    engineCtx.strokeRect(pistonLeft, pistonY, pistonW, pistonHeight);

    // Compression Rings (Top Ring, Second Ring, Oil Ring)
    engineCtx.fillStyle = "#1e293b";
    [8, 16, 24].forEach(dy => {
      engineCtx.fillRect(pistonLeft, pistonY + dy, 4, 3);
      engineCtx.fillRect(pistonLeft + pistonW - 4, pistonY + dy, 4, 3);
    });

    // Piston Crown Recesses / Valve Reliefs
    engineCtx.strokeStyle = "rgba(0,0,0,0.25)";
    engineCtx.lineWidth = 2;
    engineCtx.beginPath();
    engineCtx.arc(pistonLeft + 35, pistonY + 5, 12, 0, Math.PI);
    engineCtx.arc(pistonLeft + pistonW - 35, pistonY + 5, 12, 0, Math.PI);
    engineCtx.stroke();

    // Wrist Pin (Gudgeon Pin)
    const wristPinX = centerX;
    const wristPinY = pistonY + 38;
    engineCtx.fillStyle = "#475569";
    engineCtx.beginPath();
    engineCtx.arc(wristPinX, wristPinY, 13, 0, Math.PI * 2);
    engineCtx.fill();
    engineCtx.strokeStyle = "#cbd5e1";
    engineCtx.lineWidth = 2;
    engineCtx.stroke();
    engineCtx.fillStyle = "#0f172a";
    engineCtx.beginPath();
    engineCtx.arc(wristPinX, wristPinY, 6, 0, Math.PI * 2);
    engineCtx.fill();

    // 7. Crankshaft & Connecting Rod Kinematics
    const crankRadiusPx = (CRANK_RADIUS_M / STROKE_M) * strokePixels; // ~47.5 px
    const crankAngleRad = (state.angleDeg * Math.PI) / 180;
    // Crank pin orbits crank center:
    const crankPinX = centerX + crankRadiusPx * Math.sin(crankAngleRad);
    const crankPinY = crankCenterY - crankRadiusPx * Math.cos(crankAngleRad);

    // Connecting Rod (Connecting Wrist Pin to Crank Pin)
    engineCtx.save();
    const conRodGrad = engineCtx.createLinearGradient(wristPinX - 8, 0, wristPinX + 8, 0);
    conRodGrad.addColorStop(0, "#475569");
    conRodGrad.addColorStop(0.5, "#94a3b8");
    conRodGrad.addColorStop(1, "#334155");

    engineCtx.strokeStyle = conRodGrad;
    engineCtx.lineWidth = 14;
    engineCtx.lineCap = "round";
    engineCtx.beginPath();
    engineCtx.moveTo(wristPinX, wristPinY);
    engineCtx.lineTo(crankPinX, crankPinY);
    engineCtx.stroke();

    // I-Beam Center Channel in Connecting Rod
    engineCtx.strokeStyle = "#1e293b";
    engineCtx.lineWidth = 5;
    engineCtx.beginPath();
    engineCtx.moveTo(wristPinX, wristPinY);
    engineCtx.lineTo(crankPinX, crankPinY);
    engineCtx.stroke();
    engineCtx.restore();

    // Big-End Journal Cap & Bolts
    engineCtx.fillStyle = "#cbd5e1";
    engineCtx.beginPath();
    engineCtx.arc(crankPinX, crankPinY, 15, 0, Math.PI * 2);
    engineCtx.fill();
    engineCtx.strokeStyle = "#334155";
    engineCtx.lineWidth = 2;
    engineCtx.stroke();

    // 8. Rotating Crankshaft Counterweight & Flywheel
    engineCtx.save();
    engineCtx.translate(centerX, crankCenterY);
    engineCtx.rotate(crankAngleRad);

    // Counterweight Web (Opposite crank pin)
    engineCtx.fillStyle = "#334155";
    engineCtx.beginPath();
    engineCtx.arc(0, 0, 52, Math.PI * 0.1, Math.PI * 0.9, false);
    engineCtx.lineTo(0, 0);
    engineCtx.closePath();
    engineCtx.fill();
    engineCtx.strokeStyle = "#64748b";
    engineCtx.lineWidth = 2;
    engineCtx.stroke();

    // Flywheel Outer Rim
    engineCtx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    engineCtx.lineWidth = 2;
    engineCtx.beginPath();
    engineCtx.arc(0, 0, 58, 0, Math.PI * 2);
    engineCtx.stroke();

    // Central Crank Main Journal
    engineCtx.fillStyle = "#0f172a";
    engineCtx.beginPath();
    engineCtx.arc(0, 0, 16, 0, Math.PI * 2);
    engineCtx.fill();
    engineCtx.strokeStyle = "#f59e0b";
    engineCtx.lineWidth = 2.5;
    engineCtx.stroke();

    engineCtx.restore();

    // TDC & BDC Reference Markers on Cylinder Wall
    engineCtx.fillStyle = "#fbbf24";
    engineCtx.font = "10px monospace";
    engineCtx.fillText("TDC", centerX + cylinderWidth / 2 + 6, tdcPistonY + 4);
    engineCtx.strokeStyle = "rgba(251, 191, 36, 0.4)";
    engineCtx.setLineDash([3, 3]);
    engineCtx.beginPath();
    engineCtx.moveTo(centerX - cylinderWidth / 2, tdcPistonY);
    engineCtx.lineTo(centerX + cylinderWidth / 2, tdcPistonY);
    engineCtx.stroke();

    engineCtx.fillText("BDC", centerX + cylinderWidth / 2 + 6, tdcPistonY + strokePixels + 4);
    engineCtx.beginPath();
    engineCtx.moveTo(centerX - cylinderWidth / 2, tdcPistonY + strokePixels);
    engineCtx.lineTo(centerX + cylinderWidth / 2, tdcPistonY + strokePixels);
    engineCtx.stroke();
    engineCtx.setLineDash([]);
  }

  // Draw Thermodynamic PV Indicator Diagram on Canvas
  function drawPVDiagram(state) {
    if (!pvCtx || !pvCanvas) return;
    const w = pvCanvas.clientWidth || 480;
    const h = pvCanvas.clientHeight || 210;

    pvCtx.clearRect(0, 0, w, h);

    const padLeft = 45;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 35;
    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    // Coordinate Mapping: Volume (x) from V_c to V_max, Pressure (y) from 0 to P_peak (~4500 kPa)
    const maxP = 4200; // kPa
    const minP = 0;
    const vMin = state.vClearanceM3;
    const vMax = state.vMaxM3;

    function xFromV(vol) {
      return padLeft + ((vol - vMin) / (vMax - vMin)) * plotW;
    }
    function yFromP(p) {
      return padTop + plotH - ((p - minP) / (maxP - minP)) * plotH;
    }

    // Grid & Axis
    pvCtx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    pvCtx.lineWidth = 1;
    for (let pStep = 1000; pStep <= maxP; pStep += 1000) {
      const y = yFromP(pStep);
      pvCtx.beginPath();
      pvCtx.moveTo(padLeft, y);
      pvCtx.lineTo(padLeft + plotW, y);
      pvCtx.stroke();
      pvCtx.fillStyle = "#64748b";
      pvCtx.font = "9px monospace";
      pvCtx.textAlign = "right";
      pvCtx.fillText(`${pStep}`, padLeft - 6, y + 3);
    }

    // Volume Grid
    pvCtx.textAlign = "center";
    [vMin, vMin + (vMax - vMin) * 0.5, vMax].forEach((vStep, i) => {
      const x = xFromV(vStep);
      pvCtx.beginPath();
      pvCtx.moveTo(x, padTop);
      pvCtx.lineTo(x, padTop + plotH);
      pvCtx.stroke();
      pvCtx.fillStyle = "#64748b";
      pvCtx.fillText(i === 0 ? "Vc" : (i === 2 ? "Vmax" : "V"), x, padTop + plotH + 14);
    });

    // Outer Axis Lines
    pvCtx.strokeStyle = "#475569";
    pvCtx.lineWidth = 1.5;
    pvCtx.beginPath();
    pvCtx.moveTo(padLeft, padTop);
    pvCtx.lineTo(padLeft, padTop + plotH);
    pvCtx.lineTo(padLeft + plotW, padTop + plotH);
    pvCtx.stroke();

    // Axis Labels
    pvCtx.fillStyle = "#94a3b8";
    pvCtx.font = "9px sans-serif";
    pvCtx.textAlign = "left";
    pvCtx.fillText("P (kPa)", padLeft - 10, padTop - 8);
    pvCtx.textAlign = "right";
    pvCtx.fillText("Volume (V)", padLeft + plotW, padTop + plotH + 24);

    // Calculate Ideal Otto Cycle Curve Points
    // Point 1: (V_max, P_atm)
    // Point 2: (V_c, P2 = P1 * r^gamma)
    // Point 3: (V_c, P3 = P_peak)
    // Point 4: (V_max, P4 = P3 / r^gamma)
    const p1 = P_ATM_KPA;
    const p2 = p1 * Math.pow(compRatio, GAMMA);
    const fuel = FUELS[selectedFuelKey] || FUELS.regular;
    const heatAddedJ = (fuel.qLhv * 1e-4) * (throttlePct / 100);
    const p3 = p2 + ((GAMMA - 1) * heatAddedJ * 1e-3) / (state.vClearanceM3 * 1e3);
    const p4 = p3 / Math.pow(compRatio, GAMMA);

    // Shaded Area (Indicated Net Work)
    pvCtx.beginPath();
    // 1 -> 2 Compression
    const compSteps = 25;
    for (let i = 0; i <= compSteps; i++) {
      const v = vMax - (i / compSteps) * (vMax - vMin);
      const p = p1 * Math.pow(vMax / v, GAMMA);
      if (i === 0) pvCtx.moveTo(xFromV(v), yFromP(p));
      else pvCtx.lineTo(xFromV(v), yFromP(p));
    }
    // 2 -> 3 Isochoric Combustion
    pvCtx.lineTo(xFromV(vMin), yFromP(p3));
    // 3 -> 4 Expansion
    for (let i = 0; i <= compSteps; i++) {
      const v = vMin + (i / compSteps) * (vMax - vMin);
      const p = p3 * Math.pow(vMin / v, GAMMA);
      pvCtx.lineTo(xFromV(v), yFromP(p));
    }
    // 4 -> 1 Blowdown
    pvCtx.lineTo(xFromV(vMax), yFromP(p1));
    pvCtx.closePath();
    pvCtx.fillStyle = "rgba(245, 158, 11, 0.18)";
    pvCtx.fill();

    // Stroke 1: Intake Line (Bottom horizontal)
    pvCtx.strokeStyle = "#38bdf8";
    pvCtx.lineWidth = 2;
    pvCtx.beginPath();
    pvCtx.moveTo(xFromV(vMin), yFromP(P_ATM_KPA * 0.95));
    pvCtx.lineTo(xFromV(vMax), yFromP(P_ATM_KPA * 0.95));
    pvCtx.stroke();

    // Stroke 2: Compression Curve (1 -> 2)
    pvCtx.strokeStyle = "#f59e0b";
    pvCtx.lineWidth = 2.5;
    pvCtx.beginPath();
    for (let i = 0; i <= compSteps; i++) {
      const v = vMax - (i / compSteps) * (vMax - vMin);
      const p = p1 * Math.pow(vMax / v, GAMMA);
      if (i === 0) pvCtx.moveTo(xFromV(v), yFromP(p));
      else pvCtx.lineTo(xFromV(v), yFromP(p));
    }
    pvCtx.stroke();

    // Stroke 3: Combustion & Power (2 -> 3 -> 4)
    // 2 -> 3 Isochoric line
    pvCtx.strokeStyle = "#ef4444";
    pvCtx.lineWidth = 3;
    pvCtx.beginPath();
    pvCtx.moveTo(xFromV(vMin), yFromP(p2));
    pvCtx.lineTo(xFromV(vMin), yFromP(p3));
    pvCtx.stroke();

    // 3 -> 4 Power Expansion curve
    pvCtx.beginPath();
    for (let i = 0; i <= compSteps; i++) {
      const v = vMin + (i / compSteps) * (vMax - vMin);
      const p = p3 * Math.pow(vMin / v, GAMMA);
      if (i === 0) pvCtx.moveTo(xFromV(v), yFromP(p));
      else pvCtx.lineTo(xFromV(v), yFromP(p));
    }
    pvCtx.stroke();

    // Stroke 4: Exhaust & Blowdown (4 -> 1)
    pvCtx.strokeStyle = "#94a3b8";
    pvCtx.lineWidth = 2;
    pvCtx.beginPath();
    pvCtx.moveTo(xFromV(vMax), yFromP(p4));
    pvCtx.lineTo(xFromV(vMax), yFromP(p1));
    pvCtx.stroke();

    // State Point Labels
    pvCtx.fillStyle = "#ffffff";
    pvCtx.font = "bold 10px monospace";
    pvCtx.fillText("1", xFromV(vMax) + 8, yFromP(p1) + 4);
    pvCtx.fillText("2", xFromV(vMin) - 10, yFromP(p2));
    pvCtx.fillText("3", xFromV(vMin) - 10, yFromP(p3));
    pvCtx.fillText("4", xFromV(vMax) + 8, yFromP(p4));

    // Live Pulsing Tracer Bead on the PV Curve
    const currentVol = (state.vCurrentCc * 1e-6);
    const tracerX = xFromV(currentVol);
    const tracerY = yFromP(state.pressureKpa);

    pvCtx.save();
    pvCtx.shadowColor = state.strokeColor;
    pvCtx.shadowBlur = 12;
    pvCtx.fillStyle = state.strokeColor;
    pvCtx.beginPath();
    pvCtx.arc(tracerX, tracerY, 5.5, 0, Math.PI * 2);
    pvCtx.fill();
    pvCtx.strokeStyle = "#ffffff";
    pvCtx.lineWidth = 2;
    pvCtx.stroke();
    pvCtx.restore();
  }

  // Web Audio Synthesizer for Engine Rumble
  function updateAudio(state) {
    if (!audioEngineActive) return;
    if (!audioCtx) {
      try {
        const AudioCtor = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioCtor();
        engineOsc = audioCtx.createOscillator();
        engineGain = audioCtx.createGain();
        engineOsc.type = "sawtooth";
        engineGain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        engineOsc.connect(engineGain);
        engineGain.connect(audioCtx.destination);
        engineOsc.start();
      } catch (e) {
        audioEngineActive = false;
        return;
      }
    }
    if (audioCtx && engineOsc && isRunning && !isPaused) {
      // Cylinder firing frequency in a 4-stroke single cylinder = RPM / 120 Hz
      const targetFreq = Math.max(15, (rpm / 120) * 2.5);
      engineOsc.frequency.setTargetAtTime(targetFreq, audioCtx.currentTime, 0.05);
      // Volume modulation on power stroke
      const gainVal = state.strokeId === 3 ? 0.07 : 0.035;
      engineGain.gain.setTargetAtTime(gainVal, audioCtx.currentTime, 0.02);
    }
  }

  function stopAudio() {
    if (engineGain && audioCtx) {
      engineGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
    }
    if (audioCtx && audioCtx.state !== "closed") {
      audioCtx.close().catch(() => {});
      audioCtx = null;
    }
    audioEngineActive = false;
  }

  // Master 60 FPS Animation Loop
  function tick(timestamp) {
    if (!container.isConnected) {
      isRunning = false;
      stopAudio();
      return;
    }

    const dtMs = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    if (isRunning && !isPaused) {
      // 4-Stroke Cycle completes 720° in 2 crank revolutions
      // Degrees per second = (RPM / 60) * 360°
      const degPerSec = (rpm / 60) * 360 * timeScale;
      crankAngleDeg = (crankAngleDeg + degPerSec * (dtMs / 1000)) % 720;
    }

    const state = calculateEngineState(crankAngleDeg);

    // Update DOM HUD & Telemetry
    const strokeBadge = container.querySelector("#piston-stroke-badge");
    const strokeDot = container.querySelector("#piston-stroke-dot");
    const strokeName = container.querySelector("#piston-stroke-name");
    const angleText = container.querySelector("#piston-crank-angle-text");
    if (strokeBadge) strokeBadge.style.borderColor = state.strokeColor;
    if (strokeDot) strokeDot.style.background = state.strokeColor;
    if (strokeName) {
      strokeName.innerText = state.strokeName;
      strokeName.style.color = state.strokeColor;
    }
    if (angleText) angleText.innerText = `${state.angleDeg.toFixed(1)}°`;

    container.querySelector("#hud-pressure").innerText = `${state.pressureKpa.toFixed(1)} kPa (${(state.pressureKpa / 100).toFixed(2)} bar)`;
    container.querySelector("#hud-temperature").innerText = `${(state.tempK - 273.15).toFixed(1)} °C (${state.tempK.toFixed(0)} K)`;
    container.querySelector("#hud-volume").innerText = `${state.vCurrentCc.toFixed(1)} cc`;
    container.querySelector("#hud-piston-speed").innerText = `${Math.abs(state.pistonSpeedMps).toFixed(2)} m/s`;

    container.querySelector("#calc-otto-eff").innerText = `${(state.ottoEff * 100).toFixed(1)}%`;
    container.querySelector("#calc-power").innerText = `${state.powerKw.toFixed(1)} kW (${(state.powerKw * 1.341).toFixed(1)} hp)`;
    container.querySelector("#calc-torque").innerText = `${state.torqueNm.toFixed(1)} N·m`;
    container.querySelector("#lbl-pv-loop-work").innerText = `W_net = ${state.wNetJ.toFixed(1)} J/cycle`;

    // Render Canvas Visualizations
    drawEngine(state);
    drawPVDiagram(state);
    updateAudio(state);

    if (isRunning) {
      animId = requestAnimationFrame(tick);
    }
  }

  // Event Listeners & Interactive Handlers
  container.querySelector("#slider-piston-rpm")?.addEventListener("input", (e) => {
    rpm = parseInt(e.target.value, 10);
    container.querySelector("#lbl-piston-rpm").innerText = `${rpm} RPM`;
  });

  container.querySelector("#slider-piston-comp")?.addEventListener("input", (e) => {
    compRatio = parseFloat(e.target.value);
    container.querySelector("#lbl-piston-comp").innerText = `${compRatio.toFixed(1)} : 1`;
  });

  container.querySelector("#slider-piston-throttle")?.addEventListener("input", (e) => {
    throttlePct = parseInt(e.target.value, 10);
    container.querySelector("#lbl-piston-throttle").innerText = `${throttlePct}%`;
  });

  container.querySelector("#select-piston-fuel")?.addEventListener("change", (e) => {
    selectedFuelKey = e.target.value;
    SoundFX.playClick();
  });

  // Play / Pause Toggle
  const btnPlayPause = container.querySelector("#btn-piston-playpause");
  btnPlayPause?.addEventListener("click", () => {
    isPaused = !isPaused;
    btnPlayPause.innerText = isPaused ? "▶ Run Engine" : "⏸ Pause Engine";
    btnPlayPause.style.background = isPaused ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #f59e0b, #d97706)";
    SoundFX.playClick();
  });

  // Step +15° Crank Angle Button
  container.querySelector("#btn-piston-step")?.addEventListener("click", () => {
    isPaused = true;
    if (btnPlayPause) {
      btnPlayPause.innerText = "▶ Run Engine";
      btnPlayPause.style.background = "linear-gradient(135deg, #10b981, #059669)";
    }
    crankAngleDeg = (crankAngleDeg + 15) % 720;
    SoundFX.playClick();
  });

  // Direct Jump to Stroke Buttons
  container.querySelectorAll(".stroke-jump-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      isPaused = true;
      if (btnPlayPause) {
        btnPlayPause.innerText = "▶ Run Engine";
        btnPlayPause.style.background = "linear-gradient(135deg, #10b981, #059669)";
      }
      const target = parseFloat(btn.dataset.targetAngle || 0);
      crankAngleDeg = target;
      SoundFX.playScorePip();
    });
  });

  // Time Pacing (Slow Motion) Buttons
  container.querySelectorAll(".time-pacing-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(".time-pacing-btn").forEach(b => {
        b.classList.remove("active");
        b.style.background = "";
        b.style.color = "";
      });
      btn.classList.add("active");
      btn.style.background = "#38bdf8";
      btn.style.color = "#0f172a";
      timeScale = parseFloat(btn.dataset.speed || 1.0);
      container.querySelector("#lbl-piston-speed").innerText = `${timeScale.toFixed(1)}x`;
      SoundFX.playClick();
    });
  });

  // Audio Rumble Toggle
  const btnAudio = container.querySelector("#btn-piston-audio");
  btnAudio?.addEventListener("click", () => {
    audioEngineActive = !audioEngineActive;
    if (btnAudio) {
      btnAudio.innerText = audioEngineActive ? "🔊 Audio: On" : "🔇 Audio: Off";
      btnAudio.style.color = audioEngineActive ? "#10b981" : "#94a3b8";
    }
    if (!audioEngineActive) stopAudio();
    SoundFX.playClick();
  });

  // 4K Photo Viewport Switcher
  const btnSim = container.querySelector("#view-mode-piston-sim");
  const btnPhoto = container.querySelector("#view-mode-piston-photo");
  const photoOverlay = container.querySelector("#piston-photo-overlay");

  btnSim?.addEventListener("click", () => {
    btnSim.classList.add("active");
    btnSim.style.background = "";
    btnPhoto?.classList.remove("active");
    if (btnPhoto) btnPhoto.style.background = "transparent";
    if (photoOverlay) photoOverlay.style.display = "none";
    SoundFX.playClick();
  });

  btnPhoto?.addEventListener("click", () => {
    btnPhoto.classList.add("active");
    btnPhoto.style.background = "";
    btnSim?.classList.remove("active");
    if (btnSim) btnSim.style.background = "transparent";
    if (photoOverlay) photoOverlay.style.display = "block";
    SoundFX.playClick();
  });

  // CSV Telemetry Export (RFC-4180 Format)
  container.querySelector("#btn-piston-export")?.addEventListener("click", () => {
    const currentState = calculateEngineState(crankAngleDeg);
    const rows = [];
    // Export full 720° cycle in 10° increments
    for (let a = 0; a < 720; a += 10) {
      const s = calculateEngineState(a);
      rows.push([
        a,
        s.strokeName.split(" ")[1],
        s.pressureKpa.toFixed(2),
        (s.tempK - 273.15).toFixed(2),
        s.vCurrentCc.toFixed(2),
        s.pistonSpeedMps.toFixed(3),
        s.intakeValveOpen.toFixed(3),
        s.exhaustValveOpen.toFixed(3)
      ]);
    }

    exportLabDataCsv({
      title: "Four-Stroke Engine & Thermodynamic Otto Cycle Telemetry",
      labId: "engine-piston",
      parameters: {
        "Engine RPM": rpm,
        "Compression Ratio (r)": compRatio,
        "Throttle Position (%)": throttlePct,
        "Fuel Mixture": FUELS[selectedFuelKey].name,
        "Theoretical Otto Efficiency (%)": (currentState.ottoEff * 100).toFixed(2),
        "Indicated Power (kW)": currentState.powerKw.toFixed(2),
        "Engine Torque (N*m)": currentState.torqueNm.toFixed(2)
      },
      headers: ["Crank Angle (deg)", "Stroke Stage", "Pressure (kPa)", "Temperature (C)", "Cylinder Vol (cc)", "Piston Speed (m/s)", "Intake Valve Lift", "Exhaust Valve Lift"],
      dataRows: rows
    });
  });

  // Standardized Hotkey: 'e' or 'E' triggers CSV export
  const handleKeyDown = (e) => {
    if ((e.key === "e" || e.key === "E") && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      container.querySelector("#btn-piston-export")?.click();
    }
  };
  window.addEventListener("keydown", handleKeyDown);

  // Mount Assessment Checkpoint Questions
  mountLabCheckpoint("engine-piston-checkpoint-container", "engine-piston");

  // Launch Simulation Loop
  lastTimestamp = performance.now();
  animId = requestAnimationFrame(tick);

  // Return Teardown Cleanup Function
  return () => {
    isRunning = false;
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("resize", resizeCanvases);
    window.removeEventListener("keydown", handleKeyDown);
    stopAudio();
  };
}
