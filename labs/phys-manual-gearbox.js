// Edugates-ClipSAT Science Labs - Physics: Manual Gearbox & Transmission Mechanics Suite
// 60 FPS Precision Classical Mechanics & Mechanical Engineering Simulation:
// Gear Ratio i = N_driven / N_driver, Torque Multiplication τ_out = τ_in · i · η,
// Angular Velocity Transformation ω_out = ω_in / i, Mechanical Advantage MA,
// Synchronizer Cone Engagement, Clutch Flywheel Decoupling, and Reverse Idler Gear Kinematics.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initManualGearboxLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Mechanical Constants & Automotive Specs
  const FINAL_DRIVE_RATIO = 3.73; // Differential ring & pinion ratio
  const TIRE_RADIUS_M = 0.315; // 315 mm tire radius (~205/55R16)
  const VEHICLE_MASS_KG = 1350; // 1350 kg compact car
  const G = 9.81;

  // Transmission Gear Specifications (5-Speed Manual + Reverse)
  // Constant Mesh: Input Drive Gear (24T) drives Countershaft Main Gear (36T) -> Drive Pair Ratio = 1.50
  const GEAR_SPECS = {
    "N": { name: "Neutral", ratio: 0.0, eff: 0.0, color: "#94a3b8", collar: null, desc: "All synchronizer collars centered. Free-wheeling output shaft decoupled." },
    "1": { name: "1st Gear", ratio: 3.82, eff: 0.95, color: "#38bdf8", collar: "1-2", collarPos: -1, desc: "High torque multiplication for starting from rest & climbing steep inclines." },
    "2": { name: "2nd Gear", ratio: 2.15, eff: 0.96, color: "#06b6d4", collar: "1-2", collarPos: 1, desc: "Moderate torque multiplication for city acceleration and low-speed navigation." },
    "3": { name: "3rd Gear", ratio: 1.45, eff: 0.97, color: "#10b981", collar: "3-4", collarPos: -1, desc: "Mid-range passing gear balancing engine torque and road velocity." },
    "4": { name: "4th Gear", ratio: 1.00, eff: 0.99, color: "#f59e0b", collar: "3-4", collarPos: 1, desc: "Direct Drive: Output shaft locked 1:1 with input shaft. Minimal friction." },
    "5": { name: "5th Gear", ratio: 0.72, eff: 0.96, color: "#a855f7", collar: "5-R", collarPos: -1, desc: "Overdrive: Output shaft spins faster than engine for high-speed fuel economy." },
    "R": { name: "Reverse", ratio: -3.54, eff: 0.93, color: "#ef4444", collar: "5-R", collarPos: 1, desc: "Intermediate Reverse Idler gear inverts rotation direction vector." }
  };

  // State Variables
  let currentGear = "1";
  let clutchDepressedPct = 0; // 0% = Clutch Engaged (pedal released), 100% = Disengaged (pedal pressed)
  let engineRpm = 2200; // Engine input speed (800 to 6000 RPM)
  let engineTorqueNm = 240; // Engine input torque (100 to 450 N*m)
  let roadGradePct = 0; // Incline grade (-10% to +20%)
  let isRunning = true;
  let isPaused = false;
  let animId = null;
  let lastTimestamp = performance.now();
  let gearGrindAlertTime = 0; // Timestamp of gear grind notification

  // Continuous Shaft Rotation Angles (Radians)
  let inputShaftAngle = 0.0;
  let counterShaftAngle = 0.0;
  let outputShaftAngle = 0.0;

  // Visual Synchronizer Collar Displacements (-1 to +1)
  let collar12Pos = -1.0; // Currently in 1st gear
  let collar34Pos = 0.0;
  let collar5RPos = 0.0;

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #38bdf8; box-shadow: 0 0 10px #38bdf8;"></span>
            Manual Gearbox &amp; Transmission Mechanics
          </span>
          <span class="badge" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            ${renderLatex("i = \\frac{N_{\\text{driven}}}{N_{\\text{driver}}} \\quad \\bullet \\quad \\tau_{\\text{out}} = \\tau_{\\text{in}} \\cdot i \\cdot \\eta \\quad \\bullet \\quad \\omega_{\\text{out}} = \\frac{\\omega_{\\text{in}}}{i} \\quad \\bullet \\quad P = \\tau \\omega")}
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-gear-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Gearbox Simulator
            </button>
            <button id="view-mode-gear-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-gear-clutch-toggle" style="padding: 5px 14px; font-size: 0.78rem; background: linear-gradient(135deg, #0284c7, #0369a1); border: none; font-weight: 700; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);">
            🦶 Depress Clutch (Disengage)
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-gear-reset" style="padding: 5px 12px; font-size: 0.78rem;">
            ⟲ Reset (Neutral)
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-gear-export" title="Export transmission mechanical telemetry to CSV (Hotkey: E)" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export CSV (E)
          </button>
        </div>
      </div>

      <!-- Main Layout: 2-Column Split (Cutaway Transmission Canvas & H-Gate Shifter / Telemetry) -->
      <div style="display: grid; grid-template-columns: 1.25fr 1fr; gap: 20px;" class="gear-layout">
        <!-- Left Column: 60 FPS Cutaway Transmission Canvas -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(56, 189, 248, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #0c1a2e 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 570px;">
          <canvas id="gear-transmission-canvas" width="650" height="570" style="height: 570px; width: 100%; display: block;"></canvas>

          <!-- Top Gear & Clutch HUD -->
          <div style="position: absolute; top: 14px; left: 14px; right: 14px; display: flex; justify-content: space-between; align-items: center; pointer-events: none;">
            <div id="gear-status-badge" style="background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(8px); border: 1.5px solid #38bdf8; padding: 6px 14px; border-radius: 8px; font-weight: 800; font-size: 0.85rem; color: #38bdf8; display: flex; align-items: center; gap: 8px;">
              <span id="gear-status-dot" style="width: 10px; height: 10px; border-radius: 50%; background: #38bdf8; display: inline-block;"></span>
              <span id="gear-status-name">ACTIVE GEAR: 1st (Ratio: 3.82 : 1)</span>
            </div>
            <div id="clutch-status-badge" style="background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(8px); border: 1px solid rgba(16, 185, 129, 0.4); padding: 6px 12px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.8rem; color: #10b981;">
              Clutch: <span id="clutch-status-text" style="font-weight: 700;">ENGAGED (0%)</span>
            </div>
          </div>

          <!-- Gear Grind Warning Alert Box -->
          <div id="gear-grind-alert" style="display: none; position: absolute; top: 60px; left: 50%; transform: translateX(-50%); background: rgba(239, 68, 68, 0.92); backdrop-filter: blur(8px); border: 1px solid #fca5a5; color: #ffffff; padding: 8px 18px; border-radius: 8px; font-weight: 800; font-size: 0.85rem; box-shadow: 0 10px 25px rgba(239, 68, 68, 0.5); z-index: 3;">
            ⚠️ SYNCHRONIZER STRESS: Disengage clutch before shifting!
          </div>

          <!-- Bottom Telemetry HUD Overlay -->
          <div style="position: absolute; bottom: 12px; left: 14px; right: 14px; background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 10px; padding: 10px 14px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; pointer-events: none;">
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Input Speed (Engine)</div>
              <div id="hud-gear-in-rpm" style="font-size: 0.95rem; font-weight: 700; color: #f59e0b; font-family: var(--font-mono);">2200 RPM</div>
            </div>
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Output Speed (Shaft)</div>
              <div id="hud-gear-out-rpm" style="font-size: 0.95rem; font-weight: 700; color: #38bdf8; font-family: var(--font-mono);">576 RPM</div>
            </div>
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Output Torque</div>
              <div id="hud-gear-out-torque" style="font-size: 0.95rem; font-weight: 700; color: #10b981; font-family: var(--font-mono);">871 N·m</div>
            </div>
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Vehicle Road Speed</div>
              <div id="hud-gear-road-speed" style="font-size: 0.95rem; font-weight: 700; color: #c084fc; font-family: var(--font-mono);">18.4 km/h</div>
            </div>
          </div>

          <!-- 4K Real Laboratory Photograph Overlay -->
          <div id="gear-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <picture>
              <source srcset="assets/labs/manual_gearbox_bench.webp" type="image/webp">
              <img src="assets/labs/manual_gearbox_bench.jpg" decoding="async" loading="lazy" alt="4K Automotive Transmission &amp; Dynamometer Test Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            </picture>

            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Test Apparatus</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.88rem;">Cutaway 5-Speed Manual Transaxle</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Torque Telemetry</div>
                <div style="color: #10b981; font-weight: 700; font-family: var(--font-mono); font-size: 0.88rem;">Magtrol Dual In-Line Load Cells</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Synchronizers</div>
                <div style="color: #f59e0b; font-weight: 700; font-family: var(--font-mono); font-size: 0.88rem;">Brass Friction Blocker Rings</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Interactive H-Pattern Shifter, Clutch, & Torque Multiplier Chart -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <!-- Interactive H-Pattern Shifter Console -->
          <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; padding: 14px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 0.82rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
                <span>🕹️</span> 5-Speed + Reverse H-Gate Shifter
              </span>
              <span id="lbl-active-gear-ratio" style="font-family: var(--font-mono); font-size: 0.76rem; color: #f59e0b; font-weight: 700;">
                Ratio: 3.82 : 1
              </span>
            </div>

            <!-- Tactile H-Gate Shifter Graphic -->
            <div style="display: flex; justify-content: center; align-items: center; padding: 10px 0;">
              <div style="position: relative; width: 200px; height: 130px; background: rgba(0,0,0,0.5); border: 2px solid #334155; border-radius: 12px; padding: 10px;">
                <!-- H-Gate Grooves -->
                <div style="position: absolute; top: 60px; left: 30px; right: 30px; height: 10px; background: #1e293b; border-radius: 5px;"></div>
                <div style="position: absolute; top: 20px; left: 30px; width: 10px; height: 90px; background: #1e293b; border-radius: 5px;"></div>
                <div style="position: absolute; top: 20px; left: 95px; width: 10px; height: 90px; background: #1e293b; border-radius: 5px;"></div>
                <div style="position: absolute; top: 20px; right: 30px; width: 10px; height: 90px; background: #1e293b; border-radius: 5px;"></div>

                <!-- Shifter Gate Buttons -->
                <button class="shifter-gate-btn" data-gear="1" style="position: absolute; top: 12px; left: 18px; width: 34px; height: 34px; border-radius: 50%; background: #0f172a; border: 2px solid #38bdf8; color: #38bdf8; font-weight: 800; font-size: 0.85rem; cursor: pointer;">1</button>
                <button class="shifter-gate-btn" data-gear="2" style="position: absolute; bottom: 12px; left: 18px; width: 34px; height: 34px; border-radius: 50%; background: #0f172a; border: 2px solid #38bdf8; color: #38bdf8; font-weight: 800; font-size: 0.85rem; cursor: pointer;">2</button>
                <button class="shifter-gate-btn" data-gear="3" style="position: absolute; top: 12px; left: 83px; width: 34px; height: 34px; border-radius: 50%; background: #0f172a; border: 2px solid #10b981; color: #10b981; font-weight: 800; font-size: 0.85rem; cursor: pointer;">3</button>
                <button class="shifter-gate-btn" data-gear="4" style="position: absolute; bottom: 12px; left: 83px; width: 34px; height: 34px; border-radius: 50%; background: #0f172a; border: 2px solid #f59e0b; color: #f59e0b; font-weight: 800; font-size: 0.85rem; cursor: pointer;">4</button>
                <button class="shifter-gate-btn" data-gear="5" style="position: absolute; top: 12px; right: 18px; width: 34px; height: 34px; border-radius: 50%; background: #0f172a; border: 2px solid #a855f7; color: #a855f7; font-weight: 800; font-size: 0.85rem; cursor: pointer;">5</button>
                <button class="shifter-gate-btn" data-gear="R" style="position: absolute; bottom: 12px; right: 18px; width: 34px; height: 34px; border-radius: 50%; background: #0f172a; border: 2px solid #ef4444; color: #ef4444; font-weight: 800; font-size: 0.85rem; cursor: pointer;">R</button>
                <button class="shifter-gate-btn" data-gear="N" style="position: absolute; top: 48px; left: 83px; width: 34px; height: 34px; border-radius: 50%; background: #334155; border: 2px solid #94a3b8; color: #f1f5f9; font-weight: 800; font-size: 0.85rem; cursor: pointer;">N</button>
              </div>
            </div>

            <!-- Quick Gear Selector Buttons -->
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-top: 10px;">
              <button class="btn btn-secondary btn-sm gear-quick-btn" data-gear="N" style="padding: 4px 2px; font-size: 0.72rem; font-weight: 700;">N</button>
              <button class="btn btn-secondary btn-sm gear-quick-btn active" data-gear="1" style="padding: 4px 2px; font-size: 0.72rem; font-weight: 700; background: #38bdf8; color: #0f172a;">1st</button>
              <button class="btn btn-secondary btn-sm gear-quick-btn" data-gear="2" style="padding: 4px 2px; font-size: 0.72rem; font-weight: 700;">2nd</button>
              <button class="btn btn-secondary btn-sm gear-quick-btn" data-gear="3" style="padding: 4px 2px; font-size: 0.72rem; font-weight: 700;">3rd</button>
              <button class="btn btn-secondary btn-sm gear-quick-btn" data-gear="4" style="padding: 4px 2px; font-size: 0.72rem; font-weight: 700;">4th</button>
              <button class="btn btn-secondary btn-sm gear-quick-btn" data-gear="5" style="padding: 4px 2px; font-size: 0.72rem; font-weight: 700;">5th</button>
              <button class="btn btn-secondary btn-sm gear-quick-btn" data-gear="R" style="padding: 4px 2px; font-size: 0.72rem; font-weight: 700; color: #ef4444;">Rev</button>
            </div>
          </div>

          <!-- Clutch Pedal Slider & Controls -->
          <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 12px;">
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #94a3b8; margin-bottom: 4px;">
                <span>Clutch Pedal Position</span>
                <span id="lbl-clutch-pos" style="color: #10b981; font-weight: 700; font-family: var(--font-mono);">0% (Engaged / Coupled)</span>
              </div>
              <input type="range" id="slider-gear-clutch" min="0" max="100" step="5" value="0" style="width: 100%; accent-color: #10b981;">
              <div style="display: flex; justify-content: space-between; font-size: 0.65rem; color: #64748b; margin-top: 2px;">
                <span>0% (Engaged)</span>
                <span>50% (Bite Point)</span>
                <span>100% (Disengaged)</span>
              </div>
            </div>

            <!-- Engine RPM & Engine Torque -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #94a3b8; margin-bottom: 4px;">
                  <span>Engine Speed</span>
                  <span id="lbl-gear-in-rpm" style="color: #f59e0b; font-weight: 700; font-family: var(--font-mono);">2200 RPM</span>
                </div>
                <input type="range" id="slider-gear-rpm" min="800" max="6000" step="100" value="2200" style="width: 100%; accent-color: #f59e0b;">
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #94a3b8; margin-bottom: 4px;">
                  <span>Engine Torque</span>
                  <span id="lbl-gear-in-torque" style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono);">240 N·m</span>
                </div>
                <input type="range" id="slider-gear-torque" min="100" max="450" step="10" value="240" style="width: 100%; accent-color: #38bdf8;">
              </div>
            </div>

            <!-- Road Incline Grade -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #94a3b8; margin-bottom: 4px;">
                <span>Road Incline / Grade</span>
                <span id="lbl-gear-grade" style="color: #e2e8f0; font-weight: 700; font-family: var(--font-mono);">0% (Flat Ground)</span>
              </div>
              <input type="range" id="slider-gear-grade" min="-10" max="20" step="1" value="0" style="width: 100%; accent-color: #94a3b8;">
            </div>
          </div>

          <!-- Torque vs Speed Multiplication Chart Canvas -->
          <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 0.78rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em;">
                📊 Torque Multiplication vs Speed
              </span>
              <span id="lbl-gear-ma" style="font-family: var(--font-mono); font-size: 0.76rem; color: #10b981; font-weight: 700;">
                MA = 3.63x
              </span>
            </div>
            <canvas id="gear-chart-canvas" width="480" height="135" style="width: 100%; height: 120px; display: block; border-radius: 6px; background: #030712;"></canvas>
          </div>
        </div>
      </div>

      <!-- Competency Checkpoint Assessment Container -->
      <div id="manual-gearbox-checkpoint-container" style="margin-top: 24px;"></div>
    </div>
  `;

  // Canvas References
  const transCanvas = container.querySelector("#gear-transmission-canvas");
  const chartCanvas = container.querySelector("#gear-chart-canvas");
  const transCtx = transCanvas?.getContext("2d");
  const chartCtx = chartCanvas?.getContext("2d");

  function getDPR() {
    return typeof window.getLabDPR === "function" ? window.getLabDPR() : (typeof window.getOptimizedDPR === "function" ? window.getOptimizedDPR() : (window.devicePixelRatio || 1));
  }

  function resizeCanvases() {
    if (!transCanvas || !chartCanvas) return;
    const dpr = getDPR();
    const wTrans = transCanvas.clientWidth || 650;
    const hTrans = transCanvas.clientHeight || 570;
    transCanvas.width = Math.round(wTrans * dpr);
    transCanvas.height = Math.round(hTrans * dpr);
    if (transCtx && transCtx.setTransform) {
      transCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const wChart = chartCanvas.clientWidth || 480;
    const hChart = chartCanvas.clientHeight || 120;
    chartCanvas.width = Math.round(wChart * dpr);
    chartCanvas.height = Math.round(hChart * dpr);
    if (chartCtx && chartCtx.setTransform) {
      chartCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }
  resizeCanvases();
  window.addEventListener("resize", resizeCanvases);

  // Transmission Physics Calculations
  function calculateTransmissionState() {
    const spec = GEAR_SPECS[currentGear] || GEAR_SPECS["1"];
    const clutchEngagedFrac = Math.max(0, 1.0 - clutchDepressedPct / 100);

    // Input Shaft Speed (connected through clutch):
    const inputShaftRpm = engineRpm * clutchEngagedFrac;
    const omegaIn = (2 * Math.PI * inputShaftRpm) / 60; // rad/s

    // Output Shaft Speed & Torque
    let outputShaftRpm = 0;
    let outputTorqueNm = 0;
    let mechanicalAdvantage = 0;
    let roadSpeedKmh = 0;

    if (currentGear !== "N" && Math.abs(spec.ratio) > 0.001) {
      outputShaftRpm = inputShaftRpm / spec.ratio;
      outputTorqueNm = engineTorqueNm * Math.abs(spec.ratio) * spec.eff * clutchEngagedFrac;
      mechanicalAdvantage = Math.abs(spec.ratio) * spec.eff;

      // Wheel speed & vehicle road velocity:
      const wheelRpm = outputShaftRpm / FINAL_DRIVE_RATIO;
      const wheelOmega = (2 * Math.PI * wheelRpm) / 60;
      const roadSpeedMps = wheelOmega * TIRE_RADIUS_M;
      roadSpeedKmh = roadSpeedMps * 3.6;
    }

    // Power Flow: P = tau * omega
    const inputPowerKw = (engineTorqueNm * ((2 * Math.PI * engineRpm) / 60)) / 1000;
    const outputPowerKw = (outputTorqueNm * ((2 * Math.PI * Math.abs(outputShaftRpm)) / 60)) / 1000;

    // Incline Resistance Force: F_grade = M * g * sin(theta)
    const gradeRad = Math.atan(roadGradePct / 100);
    const gradeForceN = VEHICLE_MASS_KG * G * Math.sin(gradeRad);
    const wheelDriveForceN = (outputTorqueNm * FINAL_DRIVE_RATIO) / TIRE_RADIUS_M;

    return {
      spec,
      clutchEngagedFrac,
      inputShaftRpm,
      outputShaftRpm,
      outputTorqueNm,
      mechanicalAdvantage,
      roadSpeedKmh,
      inputPowerKw,
      outputPowerKw,
      gradeForceN,
      wheelDriveForceN
    };
  }

  // Draw 60 FPS Cutaway Transmission Canvas
  function drawTransmission(state) {
    if (!transCtx || !transCanvas) return;
    const w = transCanvas.clientWidth || 650;
    const h = transCanvas.clientHeight || 570;

    transCtx.clearRect(0, 0, w, h);

    // Coordinate Anchors
    const mainShaftY = 195; // Top shaft: Input shaft & Output Mainshaft (coaxial)
    const counterShaftY = 375; // Bottom shaft: Layshaft / Countershaft
    const shaftStartX = 110;
    const shaftEndX = w - 40;

    // Background Grid
    transCtx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    transCtx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      transCtx.beginPath();
      transCtx.moveTo(x, 0);
      transCtx.lineTo(x, h);
      transCtx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      transCtx.beginPath();
      transCtx.moveTo(0, y);
      transCtx.lineTo(w, y);
      transCtx.stroke();
    }

    // 1. Transmission Aluminum Bellhousing & Case
    transCtx.fillStyle = "rgba(15, 23, 42, 0.85)";
    transCtx.strokeStyle = "#334155";
    transCtx.lineWidth = 3;
    transCtx.beginPath();
    transCtx.moveTo(30, 80);
    transCtx.lineTo(120, 130);
    transCtx.lineTo(w - 20, 130);
    transCtx.lineTo(w - 20, 440);
    transCtx.lineTo(120, 440);
    transCtx.lineTo(30, 490);
    transCtx.closePath();
    transCtx.fill();
    transCtx.stroke();

    // 2. Engine Flywheel & Clutch Assembly (Left side)
    const flywheelX = 55;
    // Spinning Flywheel
    transCtx.fillStyle = "#334155";
    transCtx.strokeStyle = "#64748b";
    transCtx.lineWidth = 2;
    transCtx.beginPath();
    transCtx.roundRect(flywheelX - 12, mainShaftY - 80, 24, 160, 4);
    transCtx.fill();
    transCtx.stroke();
    transCtx.fillStyle = "#94a3b8";
    transCtx.font = "bold 9px monospace";
    transCtx.textAlign = "center";
    transCtx.fillText("FLYWHEEL", flywheelX, mainShaftY - 88);

    // Clutch Friction Disc & Pressure Plate
    // Disengagement gap increases when clutchDepressedPct > 0
    const clutchGapPx = (clutchDepressedPct / 100) * 14;
    const clutchDiscX = flywheelX + 22 + clutchGapPx;

    transCtx.fillStyle = clutchDepressedPct < 15 ? "#10b981" : "#ef4444";
    transCtx.beginPath();
    transCtx.roundRect(clutchDiscX, mainShaftY - 65, 8, 130, 2);
    transCtx.fill();
    transCtx.strokeStyle = "#f8fafc";
    transCtx.stroke();
    transCtx.fillText("CLUTCH", clutchDiscX + 4, mainShaftY - 72);

    // 3. Lower Layshaft / Countershaft (Solid cluster gear)
    transCtx.strokeStyle = "#475569";
    transCtx.lineWidth = 14;
    transCtx.lineCap = "round";
    transCtx.beginPath();
    transCtx.moveTo(shaftStartX + 30, counterShaftY);
    transCtx.lineTo(shaftEndX - 20, counterShaftY);
    transCtx.stroke();

    // Center steel highlight on countershaft
    transCtx.strokeStyle = "#94a3b8";
    transCtx.lineWidth = 3;
    transCtx.beginPath();
    transCtx.moveTo(shaftStartX + 30, counterShaftY);
    transCtx.lineTo(shaftEndX - 20, counterShaftY);
    transCtx.stroke();

    // 4. Upper Input Shaft (Left section) & Output Mainshaft (Right section, coaxial)
    // Input Shaft (from clutch into transmission)
    transCtx.strokeStyle = "#38bdf8";
    transCtx.lineWidth = 14;
    transCtx.beginPath();
    transCtx.moveTo(clutchDiscX + 8, mainShaftY);
    transCtx.lineTo(shaftStartX + 75, mainShaftY);
    transCtx.stroke();

    // Coaxial Pilot Bearing separation gap
    transCtx.fillStyle = "#facc15";
    transCtx.beginPath();
    transCtx.arc(shaftStartX + 78, mainShaftY, 6, 0, Math.PI * 2);
    transCtx.fill();

    // Output Mainshaft (Coaxial, carries free-wheeling gears)
    transCtx.strokeStyle = "#cbd5e1";
    transCtx.lineWidth = 14;
    transCtx.beginPath();
    transCtx.moveTo(shaftStartX + 82, mainShaftY);
    transCtx.lineTo(shaftEndX, mainShaftY);
    transCtx.stroke();

    // Driveshaft Output Flange (Far Right)
    transCtx.fillStyle = "#475569";
    transCtx.fillRect(shaftEndX - 4, mainShaftY - 28, 12, 56);
    transCtx.fillStyle = "#38bdf8";
    transCtx.font = "bold 9px monospace";
    transCtx.fillText("OUTPUT", shaftEndX + 2, mainShaftY - 34);

    // Gear Set Layout Along Shaft X Positions:
    // Pair 0: Constant Drive Pair (Input Drive -> Countershaft Driven)
    // Pair 1: 4th Gear (Direct Drive at X = shaftStartX + 140)
    // Pair 2: 3rd Gear (X = shaftStartX + 205)
    // Pair 3: 2nd Gear (X = shaftStartX + 295)
    // Pair 4: 1st Gear (X = shaftStartX + 360)
    // Pair 5: 5th Gear (X = shaftStartX + 425)
    // Pair 6: Reverse Gear with Idler (X = shaftStartX + 475)

    const GEAR_POSITIONS = [
      { id: "drive", x: shaftStartX + 60, upperR: 35, lowerR: 55, upperTeeth: 24, lowerTeeth: 36, color: "#64748b" },
      { id: "4", x: shaftStartX + 145, upperR: 45, lowerR: 45, upperTeeth: 32, lowerTeeth: 32, color: "#f59e0b" },
      { id: "3", x: shaftStartX + 215, upperR: 52, lowerR: 38, upperTeeth: 36, lowerTeeth: 28, color: "#10b981" },
      { id: "2", x: shaftStartX + 295, upperR: 62, lowerR: 28, upperTeeth: 44, lowerTeeth: 20, color: "#06b6d4" },
      { id: "1", x: shaftStartX + 365, upperR: 70, lowerR: 20, upperTeeth: 50, lowerTeeth: 14, color: "#38bdf8" },
      { id: "5", x: shaftStartX + 430, upperR: 32, lowerR: 58, upperTeeth: 22, lowerTeeth: 42, color: "#a855f7" },
      { id: "R", x: shaftStartX + 490, upperR: 60, lowerR: 24, upperTeeth: 42, lowerTeeth: 16, color: "#ef4444", isReverse: true }
    ];

    // Helper: Draw Involute Spur Gear with Teeth and Rotation Indicator
    function drawGear(cx, cy, radius, teeth, rotAngle, color, isEngaged) {
      transCtx.save();
      transCtx.translate(cx, cy);
      transCtx.rotate(rotAngle);

      // Gear Body
      const grad = transCtx.createRadialGradient(0, 0, 4, 0, 0, radius);
      grad.addColorStop(0, "#1e293b");
      grad.addColorStop(0.7, color);
      grad.addColorStop(1, "#0f172a");

      transCtx.fillStyle = grad;
      transCtx.strokeStyle = isEngaged ? "#ffffff" : "rgba(255,255,255,0.4)";
      transCtx.lineWidth = isEngaged ? 2.5 : 1;
      transCtx.beginPath();
      transCtx.arc(0, 0, radius, 0, Math.PI * 2);
      transCtx.fill();
      transCtx.stroke();

      // Gear Teeth
      transCtx.fillStyle = color;
      const toothStep = (Math.PI * 2) / teeth;
      for (let i = 0; i < teeth; i++) {
        const a = i * toothStep;
        const tx = Math.cos(a) * radius;
        const ty = Math.sin(a) * radius;
        transCtx.fillRect(tx - 2, ty - 3, 4, 6);
      }

      // Hub & Spokes
      transCtx.fillStyle = "#0f172a";
      transCtx.beginPath();
      transCtx.arc(0, 0, 9, 0, Math.PI * 2);
      transCtx.fill();
      transCtx.strokeStyle = "#94a3b8";
      transCtx.lineWidth = 1.5;
      transCtx.stroke();

      transCtx.restore();
    }

    // Draw All Gear Pairs
    GEAR_POSITIONS.forEach(pair => {
      const isCurrent = currentGear === pair.id;
      // Countershaft gear rotation angle:
      const counterRot = counterShaftAngle;
      // Upper gear rotation angle (free-wheeling unless locked by synchronizer):
      let upperRot = 0;
      if (pair.id === "drive") {
        upperRot = inputShaftAngle;
      } else if (isCurrent) {
        upperRot = outputShaftAngle;
      } else {
        // Free-spinning on output shaft
        upperRot = -counterShaftAngle * (pair.lowerTeeth / pair.upperTeeth);
      }

      // Draw Lower Countershaft Gear
      drawGear(pair.x, counterShaftY, pair.lowerR, pair.lowerTeeth, counterRot, pair.color, isCurrent);

      // Draw Upper Mainshaft Gear
      if (pair.isReverse) {
        // Reverse Idler Gear between countershaft and output gear!
        const idlerY = (mainShaftY + counterShaftY) / 2 + 10;
        const idlerX = pair.x + 14;
        const idlerR = 20;
        const idlerRot = -counterShaftAngle * (pair.lowerTeeth / 18);
        drawGear(idlerX, idlerY, idlerR, 18, idlerRot, "#f43f5e", isCurrent);

        // Reverse Output Gear
        drawGear(pair.x, mainShaftY, pair.upperR, pair.upperTeeth, upperRot, pair.color, isCurrent);

        // Idler Bracket Support
        transCtx.strokeStyle = "rgba(244, 63, 94, 0.4)";
        transCtx.lineWidth = 2;
        transCtx.beginPath();
        transCtx.moveTo(pair.x, counterShaftY);
        transCtx.lineTo(idlerX, idlerY);
        transCtx.lineTo(pair.x, mainShaftY);
        transCtx.stroke();
      } else {
        drawGear(pair.x, mainShaftY, pair.upperR, pair.upperTeeth, upperRot, pair.color, isCurrent);
      }

      // Label Gear
      transCtx.fillStyle = isCurrent ? "#ffffff" : "#94a3b8";
      transCtx.font = isCurrent ? "bold 11px sans-serif" : "9px sans-serif";
      transCtx.textAlign = "center";
      const lbl = pair.id === "drive" ? "Drive" : (pair.id === "R" ? "Rev" : `${pair.id}st`);
      transCtx.fillText(lbl, pair.x, counterShaftY + pair.lowerR + 15);
    });

    // 5. Sliding Synchronizer Sleeves & Dog Teeth (Collars 1-2, 3-4, 5-R)
    // Helper to draw synchronizer hub and shifting sleeve
    function drawSynchro(collarX, collarOffset, activeShift, label) {
      const sleeveX = collarX + collarOffset * 18;
      // Fixed Hub on Mainshaft
      transCtx.fillStyle = "#334155";
      transCtx.fillRect(collarX - 6, mainShaftY - 18, 12, 36);

      // Brass Blocker Rings (Golden Cones)
      transCtx.fillStyle = "#fbbf24";
      transCtx.fillRect(collarX - 16, mainShaftY - 14, 4, 28);
      transCtx.fillRect(collarX + 12, mainShaftY - 14, 4, 28);

      // Sliding Dog Collar (Sleeve)
      transCtx.fillStyle = activeShift ? "#38bdf8" : "#94a3b8";
      transCtx.strokeStyle = "#ffffff";
      transCtx.lineWidth = activeShift ? 2 : 1;
      transCtx.beginPath();
      transCtx.roundRect(sleeveX - 8, mainShaftY - 24, 16, 48, 3);
      transCtx.fill();
      transCtx.stroke();

      // Shift Fork Claw
      transCtx.strokeStyle = "#64748b";
      transCtx.lineWidth = 3;
      transCtx.beginPath();
      transCtx.moveTo(sleeveX, mainShaftY - 24);
      transCtx.lineTo(sleeveX, mainShaftY - 45);
      transCtx.stroke();
      transCtx.fillStyle = "#cbd5e1";
      transCtx.beginPath();
      transCtx.arc(sleeveX, mainShaftY - 45, 4, 0, Math.PI * 2);
      transCtx.fill();

      // Collar Label
      transCtx.fillStyle = activeShift ? "#38bdf8" : "#64748b";
      transCtx.font = "bold 8px monospace";
      transCtx.textAlign = "center";
      transCtx.fillText(label, collarX, mainShaftY - 52);
    }

    // Collar 3-4 (between 4th and 3rd gear)
    drawSynchro(shaftStartX + 180, collar34Pos, currentGear === "3" || currentGear === "4", "SYNCHRO 3-4");
    // Collar 1-2 (between 2nd and 1st gear)
    drawSynchro(shaftStartX + 330, collar12Pos, currentGear === "1" || currentGear === "2", "SYNCHRO 1-2");
    // Collar 5-R (between 5th and Reverse gear)
    drawSynchro(shaftStartX + 460, collar5RPos, currentGear === "5" || currentGear === "R", "SYNCHRO 5-R");

    // 6. Active Torque Flow Energy Conduit (Pulsing Glow Line)
    if (currentGear !== "N" && state.clutchEngagedFrac > 0.05) {
      transCtx.save();
      transCtx.shadowColor = state.spec.color;
      transCtx.shadowBlur = 15;
      transCtx.strokeStyle = state.spec.color;
      transCtx.lineWidth = 3;
      transCtx.beginPath();
      // From Flywheel through Clutch
      transCtx.moveTo(flywheelX, mainShaftY);
      transCtx.lineTo(shaftStartX + 60, mainShaftY);

      if (currentGear === "4") {
        // Direct Drive locks straight through to output
        transCtx.lineTo(shaftEndX, mainShaftY);
      } else {
        // Drops to Countershaft
        transCtx.lineTo(shaftStartX + 60, counterShaftY);
        // Finds active gear position
        const activePair = GEAR_POSITIONS.find(p => p.id === currentGear);
        if (activePair) {
          transCtx.lineTo(activePair.x, counterShaftY);
          transCtx.lineTo(activePair.x, mainShaftY);
          transCtx.lineTo(shaftEndX, mainShaftY);
        }
      }
      transCtx.stroke();
      transCtx.restore();
    }
  }

  // Draw Comparative Torque & Speed Multiplication Bar Chart
  function drawMultiplierChart(state) {
    if (!chartCtx || !chartCanvas) return;
    const w = chartCanvas.clientWidth || 480;
    const h = chartCanvas.clientHeight || 120;

    chartCtx.clearRect(0, 0, w, h);

    const padLeft = 70;
    const padRight = 30;
    const padTop = 15;
    const padBottom = 25;
    const plotW = w - padLeft - padRight;
    const barHeight = 22;

    // Bar 1: Torque Comparison (Input Torque vs Output Torque)
    // Scale max torque = 1200 N*m
    const maxTorque = 1200;
    const inTorqueW = Math.min(plotW, (engineTorqueNm / maxTorque) * plotW);
    const outTorqueW = Math.min(plotW, (state.outputTorqueNm / maxTorque) * plotW);

    chartCtx.font = "bold 9px monospace";
    chartCtx.fillStyle = "#94a3b8";
    chartCtx.textAlign = "right";
    chartCtx.fillText("Torque", padLeft - 8, padTop + 14);

    // Input Torque Bar (Amber)
    chartCtx.fillStyle = "rgba(245, 158, 11, 0.4)";
    chartCtx.fillRect(padLeft, padTop, inTorqueW, barHeight / 2);
    chartCtx.fillStyle = "#f59e0b";
    chartCtx.textAlign = "left";
    chartCtx.fillText(`In: ${engineTorqueNm} N·m`, padLeft + inTorqueW + 6, padTop + 9);

    // Output Torque Bar (Cyan/Green)
    chartCtx.fillStyle = state.spec.color;
    chartCtx.fillRect(padLeft, padTop + barHeight / 2 + 2, outTorqueW, barHeight / 2);
    chartCtx.fillStyle = state.spec.color;
    chartCtx.fillText(`Out: ${state.outputTorqueNm.toFixed(0)} N·m (${state.mechanicalAdvantage.toFixed(2)}x)`, padLeft + outTorqueW + 6, padTop + barHeight + 1);

    // Bar 2: Speed Comparison (Input RPM vs Output RPM)
    const speedY = padTop + barHeight + 25;
    const maxRpm = 6000;
    const inRpmW = Math.min(plotW, (state.inputShaftRpm / maxRpm) * plotW);
    const outRpmW = Math.min(plotW, (Math.abs(state.outputShaftRpm) / maxRpm) * plotW);

    chartCtx.fillStyle = "#94a3b8";
    chartCtx.textAlign = "right";
    chartCtx.fillText("Rot Speed", padLeft - 8, speedY + 14);

    // Input Speed Bar
    chartCtx.fillStyle = "rgba(245, 158, 11, 0.4)";
    chartCtx.fillRect(padLeft, speedY, inRpmW, barHeight / 2);
    chartCtx.fillStyle = "#f59e0b";
    chartCtx.textAlign = "left";
    chartCtx.fillText(`In: ${Math.round(state.inputShaftRpm)} RPM`, padLeft + inRpmW + 6, speedY + 9);

    // Output Speed Bar
    chartCtx.fillStyle = "#38bdf8";
    chartCtx.fillRect(padLeft, speedY + barHeight / 2 + 2, outRpmW, barHeight / 2);
    chartCtx.fillStyle = "#38bdf8";
    chartCtx.fillText(`Out: ${Math.round(state.outputShaftRpm)} RPM`, padLeft + outRpmW + 6, speedY + barHeight + 1);
  }

  // Smooth Synchronizer Collar Transitions
  function updateCollars(dt) {
    const spec = GEAR_SPECS[currentGear] || GEAR_SPECS["1"];
    const target12 = spec.collar === "1-2" ? spec.collarPos : 0.0;
    const target34 = spec.collar === "3-4" ? spec.collarPos : 0.0;
    const target5R = spec.collar === "5-R" ? spec.collarPos : 0.0;

    const rate = 8.0 * dt;
    collar12Pos += (target12 - collar12Pos) * rate;
    collar34Pos += (target34 - collar34Pos) * rate;
    collar5RPos += (target5R - collar5RPos) * rate;
  }

  // Master 60 FPS Animation Loop
  function tick(timestamp) {
    if (!container.isConnected) {
      isRunning = false;
      return;
    }

    const dt = Math.min(0.1, (timestamp - lastTimestamp) / 1000);
    lastTimestamp = timestamp;

    const state = calculateTransmissionState();

    if (isRunning && !isPaused) {
      // Rotate Input Shaft & Countershaft
      const inputRadPerSec = (state.inputShaftRpm * 2 * Math.PI) / 60;
      inputShaftAngle = (inputShaftAngle + inputRadPerSec * dt) % (Math.PI * 2);

      // Countershaft driven by 24T/36T pair (ratio = 1.5)
      const counterRadPerSec = -inputRadPerSec / 1.5;
      counterShaftAngle = (counterShaftAngle + counterRadPerSec * dt) % (Math.PI * 2);

      // Output Shaft rotates according to gear ratio:
      if (currentGear !== "N" && Math.abs(state.spec.ratio) > 0.01) {
        const outRadPerSec = (state.outputShaftRpm * 2 * Math.PI) / 60;
        outputShaftAngle = (outputShaftAngle + outRadPerSec * dt) % (Math.PI * 2);
      }
    }

    updateCollars(dt);

    // Check Gear Grind Alert Timeout
    if (gearGrindAlertTime > 0 && performance.now() - gearGrindAlertTime > 2500) {
      gearGrindAlertTime = 0;
      const alertEl = container.querySelector("#gear-grind-alert");
      if (alertEl) alertEl.style.display = "none";
    }

    // Update DOM Telemetry Elements
    const statusBadge = container.querySelector("#gear-status-badge");
    const statusDot = container.querySelector("#gear-status-dot");
    const statusName = container.querySelector("#gear-status-name");
    const ratioLbl = container.querySelector("#lbl-active-gear-ratio");

    if (statusBadge) statusBadge.style.borderColor = state.spec.color;
    if (statusDot) statusDot.style.background = state.spec.color;
    if (statusName) {
      statusName.innerText = `ACTIVE GEAR: ${state.spec.name} (${state.spec.ratio === 0 ? "Neutral" : `Ratio ${state.spec.ratio} : 1`})`;
      statusName.style.color = state.spec.color;
    }
    if (ratioLbl) {
      ratioLbl.innerText = state.spec.ratio === 0 ? "Neutral" : `Ratio: ${state.spec.ratio} : 1`;
      ratioLbl.style.color = state.spec.color;
    }

    container.querySelector("#hud-gear-in-rpm").innerText = `${Math.round(state.inputShaftRpm)} RPM`;
    container.querySelector("#hud-gear-out-rpm").innerText = `${Math.round(state.outputShaftRpm)} RPM`;
    container.querySelector("#hud-gear-out-torque").innerText = `${state.outputTorqueNm.toFixed(0)} N·m`;
    container.querySelector("#hud-gear-road-speed").innerText = `${Math.abs(state.roadSpeedKmh).toFixed(1)} km/h (${(Math.abs(state.roadSpeedKmh) * 0.621371).toFixed(1)} mph)`;
    container.querySelector("#lbl-gear-ma").innerText = `MA = ${state.mechanicalAdvantage.toFixed(2)}x`;

    // Render Canvases
    drawTransmission(state);
    drawMultiplierChart(state);

    if (isRunning) {
      animId = requestAnimationFrame(tick);
    }
  }

  // Gear Shift Action Handler (checks clutch state and triggers synchro simulation)
  function shiftToGear(newGearKey) {
    if (!GEAR_SPECS[newGearKey]) return;

    // Check if shifting without depressing clutch (synchro wear / gear grind warning)
    if (clutchDepressedPct < 30 && newGearKey !== "N" && newGearKey !== currentGear) {
      gearGrindAlertTime = performance.now();
      const alertEl = container.querySelector("#gear-grind-alert");
      if (alertEl) alertEl.style.display = "block";
      SoundFX.playGlassBreak?.() || SoundFX.playScorePip();
    } else {
      SoundFX.playClick();
    }

    currentGear = newGearKey;

    // Update Shifter Gate Buttons UI
    container.querySelectorAll(".shifter-gate-btn").forEach(btn => {
      if (btn.dataset.gear === currentGear) {
        btn.style.boxShadow = "0 0 15px #38bdf8";
        btn.style.transform = "scale(1.15)";
      } else {
        btn.style.boxShadow = "";
        btn.style.transform = "scale(1.0)";
      }
    });

    // Update Quick Buttons
    container.querySelectorAll(".gear-quick-btn").forEach(btn => {
      if (btn.dataset.gear === currentGear) {
        btn.classList.add("active");
        btn.style.background = "#38bdf8";
        btn.style.color = "#0f172a";
      } else {
        btn.classList.remove("active");
        btn.style.background = "";
        btn.style.color = "";
      }
    });
  }

  // Event Listeners
  container.querySelectorAll(".shifter-gate-btn, .gear-quick-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const g = btn.dataset.gear;
      if (g) shiftToGear(g);
    });
  });

  // Clutch Slider
  const clutchSlider = container.querySelector("#slider-gear-clutch");
  clutchSlider?.addEventListener("input", (e) => {
    clutchDepressedPct = parseInt(e.target.value, 10);
    const clutchText = container.querySelector("#clutch-status-text");
    const clutchBadge = container.querySelector("#clutch-status-badge");
    const lblClutch = container.querySelector("#lbl-clutch-pos");

    if (clutchDepressedPct === 0) {
      if (clutchText) clutchText.innerText = "ENGAGED (0%)";
      if (clutchBadge) {
        clutchBadge.style.color = "#10b981";
        clutchBadge.style.borderColor = "rgba(16, 185, 129, 0.4)";
      }
      if (lblClutch) lblClutch.innerText = "0% (Engaged / Coupled)";
    } else if (clutchDepressedPct === 100) {
      if (clutchText) clutchText.innerText = "DISENGAGED (100%)";
      if (clutchBadge) {
        clutchBadge.style.color = "#ef4444";
        clutchBadge.style.borderColor = "rgba(239, 68, 68, 0.4)";
      }
      if (lblClutch) lblClutch.innerText = "100% (Disengaged / Decoupled)";
    } else {
      if (clutchText) clutchText.innerText = `SLIPPING (${clutchDepressedPct}%)`;
      if (clutchBadge) {
        clutchBadge.style.color = "#f59e0b";
        clutchBadge.style.borderColor = "rgba(245, 158, 11, 0.4)";
      }
      if (lblClutch) lblClutch.innerText = `${clutchDepressedPct}% (Friction Slipping)`;
    }
  });

  // Clutch Quick Toggle Button
  const btnClutchToggle = container.querySelector("#btn-gear-clutch-toggle");
  btnClutchToggle?.addEventListener("click", () => {
    if (clutchDepressedPct < 50) {
      clutchDepressedPct = 100;
      if (clutchSlider) clutchSlider.value = "100";
      btnClutchToggle.innerText = "👟 Release Clutch (Engage)";
      btnClutchToggle.style.background = "linear-gradient(135deg, #10b981, #059669)";
    } else {
      clutchDepressedPct = 0;
      if (clutchSlider) clutchSlider.value = "0";
      btnClutchToggle.innerText = "🦶 Depress Clutch (Disengage)";
      btnClutchToggle.style.background = "linear-gradient(135deg, #0284c7, #0369a1)";
    }
    clutchSlider?.dispatchEvent(new Event("input"));
    SoundFX.playClick();
  });

  // Engine RPM Slider
  container.querySelector("#slider-gear-rpm")?.addEventListener("input", (e) => {
    engineRpm = parseInt(e.target.value, 10);
    container.querySelector("#lbl-gear-in-rpm").innerText = `${engineRpm} RPM`;
  });

  // Engine Torque Slider
  container.querySelector("#slider-gear-torque")?.addEventListener("input", (e) => {
    engineTorqueNm = parseInt(e.target.value, 10);
    container.querySelector("#lbl-gear-in-torque").innerText = `${engineTorqueNm} N·m`;
  });

  // Incline Grade Slider
  container.querySelector("#slider-gear-grade")?.addEventListener("input", (e) => {
    roadGradePct = parseInt(e.target.value, 10);
    container.querySelector("#lbl-gear-grade").innerText = `${roadGradePct}% ${roadGradePct > 0 ? "(Uphill Incline)" : (roadGradePct < 0 ? "(Downhill)" : "(Flat)")}`;
  });

  // Reset to Neutral
  container.querySelector("#btn-gear-reset")?.addEventListener("click", () => {
    shiftToGear("N");
  });

  // 4K Photo Viewport Switcher
  const btnSim = container.querySelector("#view-mode-gear-sim");
  const btnPhoto = container.querySelector("#view-mode-gear-photo");
  const photoOverlay = container.querySelector("#gear-photo-overlay");

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
  container.querySelector("#btn-gear-export")?.addEventListener("click", () => {
    const currentState = calculateTransmissionState();
    const rows = [];
    Object.keys(GEAR_SPECS).forEach(gKey => {
      const gSpec = GEAR_SPECS[gKey];
      const outRpm = gSpec.ratio === 0 ? 0 : engineRpm / gSpec.ratio;
      const outTorque = engineTorqueNm * Math.abs(gSpec.ratio) * gSpec.eff;
      const roadSpeed = (outRpm / FINAL_DRIVE_RATIO) * ((2 * Math.PI * TIRE_RADIUS_M) / 60) * 3.6;
      rows.push([
        gKey,
        gSpec.name,
        gSpec.ratio.toFixed(2),
        (gSpec.eff * 100).toFixed(1),
        engineRpm,
        Math.round(outRpm),
        engineTorqueNm,
        outTorque.toFixed(1),
        (Math.abs(gSpec.ratio) * gSpec.eff).toFixed(2),
        roadSpeed.toFixed(1)
      ]);
    });

    exportLabDataCsv({
      title: "Manual Transmission & Gearbox Kinematics Telemetry",
      labId: "manual-gearbox",
      parameters: {
        "Engine RPM": engineRpm,
        "Engine Torque (N*m)": engineTorqueNm,
        "Clutch Position (%)": clutchDepressedPct,
        "Active Gear": currentState.spec.name,
        "Gear Ratio": currentState.spec.ratio,
        "Road Speed (km/h)": currentState.roadSpeedKmh.toFixed(1)
      },
      headers: ["Gear Code", "Gear Name", "Gear Ratio", "Efficiency (%)", "Input RPM", "Output RPM", "Input Torque (N*m)", "Output Torque (N*m)", "Mech Advantage", "Road Speed (km/h)"],
      dataRows: rows
    });
  });

  // Standardized Hotkey: 'e' or 'E' triggers CSV export
  const handleKeyDown = (e) => {
    if ((e.key === "e" || e.key === "E") && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      container.querySelector("#btn-gear-export")?.click();
    }
  };
  window.addEventListener("keydown", handleKeyDown);

  // Mount Assessment Checkpoint Questions
  mountLabCheckpoint("manual-gearbox-checkpoint-container", "manual-gearbox");

  // Launch Simulation Loop
  lastTimestamp = performance.now();
  animId = requestAnimationFrame(tick);

  // Return Teardown Cleanup Function
  return () => {
    isRunning = false;
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("resize", resizeCanvases);
    window.removeEventListener("keydown", handleKeyDown);
  };
}
