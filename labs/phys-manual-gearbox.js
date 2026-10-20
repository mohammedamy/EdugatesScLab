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
  // Transmission Gear Specifications (5-Speed Manual + Reverse)
  // Constant Mesh: Input Drive Gear (18T) drives Countershaft Cluster (26T) -> Drive Pair Ratio = 1.444
  const GEAR_SPECS = {
    "N": { name: "Neutral", ratio: 0.0, eff: 0.0, color: "#94a3b8", collar: null, collarPos: 0, desc: "All synchronizer collars centered. Free-wheeling output shaft decoupled." },
    "1": { name: "1st Gear", ratio: 3.82, eff: 0.95, color: "#38bdf8", collar: "1-2", collarPos: 1, desc: "High torque multiplication for starting from rest & climbing steep inclines." },
    "2": { name: "2nd Gear", ratio: 2.15, eff: 0.96, color: "#06b6d4", collar: "1-2", collarPos: -1, desc: "Moderate torque multiplication for city acceleration and low-speed navigation." },
    "3": { name: "3rd Gear", ratio: 1.45, eff: 0.97, color: "#10b981", collar: "3-4", collarPos: 1, desc: "Mid-range passing gear balancing engine torque and road velocity." },
    "4": { name: "4th Gear", ratio: 1.00, eff: 0.99, color: "#f59e0b", collar: "3-4", collarPos: -1, desc: "Direct Drive: Output shaft locked 1:1 with input shaft. Minimal friction." },
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

  // Continuous Shaft & Gear Rotation Angles (Radians)
  let inputShaftAngle = 0.0;
  let counterShaftAngle = 0.0;
  let outputShaftAngle = 0.0;
  const freeGearAngles = { "1": 0.0, "2": 0.0, "3": 0.0, "4": 0.0, "5": 0.0, "R": 0.0, "Idler": 0.0 };

  // Visual Synchronizer Collar Displacements (-1 to +1)
  let collar12Pos = 1.0; // Currently in 1st gear
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
            <canvas id="gear-chart-canvas" width="480" height="135" style="width: 100%; height: 110px; display: block; border-radius: 6px; background: #030712;"></canvas>
          </div>

          <!-- Involute Tooth Mesh & Pitch Contact Micro-Inspection Viewport -->
          <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; padding: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 0.78rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
                <span>🔬</span> Involute Tooth Mesh &amp; Contact Mechanics
              </span>
              <span id="lbl-mesh-detail" style="font-family: var(--font-mono); font-size: 0.72rem; color: #f59e0b; font-weight: 700;">
                Line of Action (20° PA)
              </span>
            </div>
            <canvas id="gear-mesh-zoom-canvas" width="480" height="135" style="width: 100%; height: 125px; display: block; border-radius: 6px; background: #030712;"></canvas>
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
  const meshZoomCanvas = container.querySelector("#gear-mesh-zoom-canvas");
  const transCtx = transCanvas?.getContext("2d");
  const chartCtx = chartCanvas?.getContext("2d");
  const meshZoomCtx = meshZoomCanvas?.getContext("2d");

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
    const hChart = chartCanvas.clientHeight || 110;
    chartCanvas.width = Math.round(wChart * dpr);
    chartCanvas.height = Math.round(hChart * dpr);
    if (chartCtx && chartCtx.setTransform) {
      chartCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    if (meshZoomCanvas && meshZoomCtx) {
      const wMesh = meshZoomCanvas.clientWidth || 480;
      const hMesh = meshZoomCanvas.clientHeight || 125;
      meshZoomCanvas.width = Math.round(wMesh * dpr);
      meshZoomCanvas.height = Math.round(hMesh * dpr);
      if (meshZoomCtx.setTransform) {
        meshZoomCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
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

  // Draw Involute Spur/Helical Gear with 3D Axial Extrusion, Chamfers, and Web Cavities
  function drawInvoluteGear(ctx, cx, cy, rPitch, teeth, angle, color, isEngaged, isUpper, options = {}) {
    const m = (2 * rPitch) / teeth; // Module
    const ha = 0.82 * m; // Addendum
    const hd = 1.18 * m; // Dedendum
    const rTip = rPitch + ha;
    const rRoot = Math.max(8, rPitch - hd);
    const rRim = rRoot - 3;
    const rHub = Math.max(14, rPitch * 0.28);
    const step = (Math.PI * 2) / teeth;
    const halfThick = step * 0.25; // pitch line tooth half-thickness
    const rootFillet = step * 0.16;

    ctx.save();
    ctx.translate(cx, cy);

    // 1. 3D Extruded Gear Rim & Shadow (Axial Depth)
    const depthX = -3.5;
    const depthY = 4.5;
    ctx.save();
    ctx.translate(depthX, depthY);
    ctx.fillStyle = "#090d16";
    ctx.strokeStyle = "rgba(0, 0, 0, 0.7)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < teeth; i++) {
      const th = angle + i * step;
      const a1 = th - step * 0.5 + rootFillet;
      const a2 = th - halfThick * 1.25;
      const a3 = th - halfThick;
      const a4 = th - halfThick * 0.6;
      const a5 = th + halfThick * 0.6;
      const a6 = th + halfThick;
      const a7 = th + halfThick * 1.25;
      const a8 = th + step * 0.5 - rootFillet;

      if (i === 0) ctx.moveTo(Math.cos(a1) * rRoot, Math.sin(a1) * rRoot);
      else ctx.lineTo(Math.cos(a1) * rRoot, Math.sin(a1) * rRoot);

      ctx.lineTo(Math.cos(a2) * (rRoot + (rPitch - rRoot) * 0.3), Math.sin(a2) * (rRoot + (rPitch - rRoot) * 0.3));
      ctx.lineTo(Math.cos(a3) * rPitch, Math.sin(a3) * rPitch);
      ctx.lineTo(Math.cos(a4) * rTip, Math.sin(a4) * rTip);
      ctx.lineTo(Math.cos(a5) * rTip, Math.sin(a5) * rTip);
      ctx.lineTo(Math.cos(a6) * rPitch, Math.sin(a6) * rPitch);
      ctx.lineTo(Math.cos(a7) * (rRoot + (rPitch - rRoot) * 0.3), Math.sin(a7) * (rRoot + (rPitch - rRoot) * 0.3));
      ctx.lineTo(Math.cos(a8) * rRoot, Math.sin(a8) * rRoot);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 2. Front Face Involute Profile & Metallic Shading
    ctx.beginPath();
    for (let i = 0; i < teeth; i++) {
      const th = angle + i * step;
      const a1 = th - step * 0.5 + rootFillet;
      const a2 = th - halfThick * 1.25;
      const a3 = th - halfThick;
      const a4 = th - halfThick * 0.6;
      const a5 = th + halfThick * 0.6;
      const a6 = th + halfThick;
      const a7 = th + halfThick * 1.25;
      const a8 = th + step * 0.5 - rootFillet;

      if (i === 0) ctx.moveTo(Math.cos(a1) * rRoot, Math.sin(a1) * rRoot);
      else ctx.lineTo(Math.cos(a1) * rRoot, Math.sin(a1) * rRoot);

      ctx.lineTo(Math.cos(a2) * (rRoot + (rPitch - rRoot) * 0.3), Math.sin(a2) * (rRoot + (rPitch - rRoot) * 0.3));
      ctx.lineTo(Math.cos(a3) * rPitch, Math.sin(a3) * rPitch);
      ctx.lineTo(Math.cos(a4) * rTip, Math.sin(a4) * rTip);
      ctx.lineTo(Math.cos(a5) * rTip, Math.sin(a5) * rTip);
      ctx.lineTo(Math.cos(a6) * rPitch, Math.sin(a6) * rPitch);
      ctx.lineTo(Math.cos(a7) * (rRoot + (rPitch - rRoot) * 0.3), Math.sin(a7) * (rRoot + (rPitch - rRoot) * 0.3));
      ctx.lineTo(Math.cos(a8) * rRoot, Math.sin(a8) * rRoot);
    }
    ctx.closePath();

    // Rich Metallic Radial Gradient with Hardened Steel Tint
    const gearGrad = ctx.createRadialGradient(0, 0, rHub * 0.8, 0, 0, rTip);
    gearGrad.addColorStop(0, "#1e293b");
    gearGrad.addColorStop(0.35, "#334155");
    gearGrad.addColorStop(0.7, color);
    gearGrad.addColorStop(0.92, "#1e293b");
    gearGrad.addColorStop(1.0, "#0f172a");

    ctx.fillStyle = gearGrad;
    ctx.fill();

    // Perimeter Bevel Highlight
    ctx.strokeStyle = isEngaged ? "#ffffff" : "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = isEngaged ? 2 : 1;
    ctx.stroke();

    // 3. Helical Tooth Crest Facets (18° Helical Cut Lines across Gear Face)
    ctx.save();
    ctx.strokeStyle = isEngaged ? "rgba(255, 255, 255, 0.75)" : "rgba(255, 255, 255, 0.22)";
    ctx.lineWidth = 1;
    for (let i = 0; i < teeth; i++) {
      const th = angle + i * step;
      const xTip = Math.cos(th) * rTip;
      const yTip = Math.sin(th) * rTip;
      const xSlant = Math.cos(th - 0.08) * (rTip + 2) + depthX * 0.7;
      const ySlant = Math.sin(th - 0.08) * (rTip + 2) + depthY * 0.7;
      ctx.beginPath();
      ctx.moveTo(xTip, yTip);
      ctx.lineTo(xSlant, ySlant);
      ctx.stroke();
    }
    ctx.restore();

    // 4. Recessed Gear Web Pocket (Forged/Stamped Depression)
    if (rRim > rHub + 10) {
      const webGrad = ctx.createRadialGradient(0, 0, rHub, 0, 0, rRim);
      webGrad.addColorStop(0, "#0f172a");
      webGrad.addColorStop(0.2, "#1e293b");
      webGrad.addColorStop(0.85, "#0b1120");
      webGrad.addColorStop(1.0, "#030712");

      ctx.fillStyle = webGrad;
      ctx.beginPath();
      ctx.arc(0, 0, rRim, 0, Math.PI * 2);
      ctx.fill();

      // Inner rim drop shadow & metallic chamfer
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // 5. Machined Lightening Holes (Weight Reduction Cutaways)
    if (rRim - rHub > 22) {
      const numHoles = teeth >= 28 ? 5 : (teeth >= 18 ? 4 : 3);
      const rHoleCenter = (rRim + rHub) * 0.5;
      const rHole = (rRim - rHub) * 0.25;

      for (let k = 0; k < numHoles; k++) {
        const aHole = angle + k * ((Math.PI * 2) / numHoles);
        const hx = Math.cos(aHole) * rHoleCenter;
        const hy = Math.sin(aHole) * rHoleCenter;

        // Interior void
        ctx.fillStyle = "#030712";
        ctx.beginPath();
        ctx.arc(hx, hy, rHole, 0, Math.PI * 2);
        ctx.fill();

        // Top inner shadow (3D cylindrical wall)
        ctx.strokeStyle = "rgba(0, 0, 0, 0.85)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(hx, hy, rHole - 0.5, Math.PI * 0.8, Math.PI * 1.8);
        ctx.stroke();

        // Bottom inner metallic bevel reflection
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(hx, hy, rHole - 0.5, -Math.PI * 0.2, Math.PI * 0.8);
        ctx.stroke();
      }
    }

    // 6. Machined Raised Center Hub & Needle Bearing
    const hubGrad = ctx.createRadialGradient(0, 0, 3, 0, 0, rHub);
    hubGrad.addColorStop(0, "#cbd5e1");
    hubGrad.addColorStop(0.5, "#475569");
    hubGrad.addColorStop(0.9, "#1e293b");
    hubGrad.addColorStop(1.0, "#0f172a");

    ctx.fillStyle = hubGrad;
    ctx.beginPath();
    ctx.arc(0, 0, rHub, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Bronze Needle Roller Bearing Cage (visible inside bore)
    const rBore = Math.max(7, rHub * 0.55);
    ctx.fillStyle = "#b45309"; // Bronze
    ctx.beginPath();
    ctx.arc(0, 0, rBore, 0, Math.PI * 2);
    ctx.fill();

    // Snap Ring / Circlip
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, rBore + 2, 0.4, Math.PI * 2 - 0.4);
    ctx.stroke();

    // Shaft Core
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(0, 0, rBore - 2, 0, Math.PI * 2);
    ctx.fill();

    // 7. Dog Teeth Ring (Clutch teeth on mainshaft speed gears)
    if (options.hasDogRing) {
      const rDog = rHub + 4;
      const dogTeeth = 16;
      const dogStep = (Math.PI * 2) / dogTeeth;
      ctx.fillStyle = isEngaged ? "#38bdf8" : "#94a3b8";
      for (let d = 0; d < dogTeeth; d++) {
        const da = angle * 1.5 + d * dogStep;
        const dx1 = Math.cos(da) * rDog;
        const dy1 = Math.sin(da) * rDog;
        const dx2 = Math.cos(da + dogStep * 0.4) * (rDog + 3.5);
        const dy2 = Math.sin(da + dogStep * 0.4) * (rDog + 3.5);
        const dx3 = Math.cos(da + dogStep * 0.8) * rDog;
        const dy3 = Math.sin(da + dogStep * 0.8) * rDog;
        ctx.beginPath();
        ctx.moveTo(dx1, dy1);
        ctx.lineTo(dx2, dy2);
        ctx.lineTo(dx3, dy3);
        ctx.closePath();
        ctx.fill();
      }
    }

    // 8. Theoretical Pitch Circle (Subtle dashed precision guide)
    ctx.save();
    ctx.strokeStyle = isEngaged ? "rgba(56, 189, 248, 0.35)" : "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(0, 0, rPitch, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  // Draw Tangential Contact Mesh Zone with Hertzian Stress & Force Vectors
  function drawMeshContactZone(ctx, x, pitchY, pair, isEngaged, state) {
    ctx.save();

    // 1. Tangent Pitch Line Segment
    ctx.strokeStyle = isEngaged ? "#38bdf8" : "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(x - 24, pitchY);
    ctx.lineTo(x + 24, pitchY);
    ctx.stroke();
    ctx.setLineDash([]);

    if (isEngaged && state.clutchEngagedFrac > 0.05) {
      // 2. Dynamic Hertzian Contact Stress Corona
      const pulse = 1.0 + 0.25 * Math.sin(performance.now() * 0.015);
      const coronaGrad = ctx.createRadialGradient(x, pitchY, 1, x, pitchY, 16 * pulse);
      coronaGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      coronaGrad.addColorStop(0.25, pair.color);
      coronaGrad.addColorStop(0.65, "rgba(245, 158, 11, 0.45)");
      coronaGrad.addColorStop(1, "rgba(245, 158, 11, 0)");

      ctx.fillStyle = coronaGrad;
      ctx.beginPath();
      ctx.arc(x, pitchY, 16 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // 3. Line of Action (20° Involute Pressure Angle)
      const pa = 20 * (Math.PI / 180);
      const lineLen = 28;
      const dx = Math.cos(pa) * lineLen;
      const dy = Math.sin(pa) * lineLen;

      ctx.strokeStyle = "#facc15"; // Gold pressure line
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - dx, pitchY - dy);
      ctx.lineTo(x + dx, pitchY + dy);
      ctx.stroke();

      // Normal Force Vector Arrow (Fn)
      const arrowX = x + dx * 0.8;
      const arrowY = pitchY + dy * 0.8;
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.arc(arrowX, arrowY, 3, 0, Math.PI * 2);
      ctx.fill();

      // Force magnitude text
      ctx.font = "bold 8px monospace";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      const normalForceKn = ((state.outputTorqueNm / (pair.upperR * 0.001)) / Math.cos(pa) / 1000).toFixed(1);
      ctx.fillText(`Fn: ${normalForceKn} kN`, x + dx + 4, pitchY + dy + 3);

      // Micro-sparks radiating from contact flank
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.2;
      for (let s = 0; s < 4; s++) {
        const sa = (performance.now() * 0.02 + s * 1.57) % (Math.PI * 2);
        const sr = 5 + (performance.now() * 0.05 + s * 3) % 9;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(sa) * 2, pitchY + Math.sin(sa) * 2);
        ctx.lineTo(x + Math.cos(sa) * sr, pitchY + Math.sin(sa) * sr);
        ctx.stroke();
      }
    } else {
      // Idle pure-rolling contact marker
      ctx.fillStyle = "rgba(16, 185, 129, 0.7)";
      ctx.beginPath();
      ctx.arc(x, pitchY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Draw 3D Synchronizer Assembly: Hub, Brass Blocker Rings, Sliding Sleeve, & Fork
  function draw3DSynchronizer(ctx, collarX, collarOffset, activeShift, label) {
    const sleeveX = collarX + collarOffset * 18;
    const mainShaftY = 185;

    // 1. Fixed Hub on Mainshaft (Splined core)
    const hubGrad = ctx.createLinearGradient(collarX - 7, 0, collarX + 7, 0);
    hubGrad.addColorStop(0, "#1e293b");
    hubGrad.addColorStop(0.5, "#475569");
    hubGrad.addColorStop(1, "#0f172a");
    ctx.fillStyle = hubGrad;
    ctx.fillRect(collarX - 7, mainShaftY - 20, 14, 40);

    // Hub longitudinal splines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(collarX - 3, mainShaftY - 18);
    ctx.lineTo(collarX - 3, mainShaftY + 18);
    ctx.moveTo(collarX + 3, mainShaftY - 18);
    ctx.lineTo(collarX + 3, mainShaftY + 18);
    ctx.stroke();

    // 2. Brass Blocker Rings (Conical Friction Rings with Machined Blocking Teeth)
    const brassGrad = ctx.createLinearGradient(0, mainShaftY - 16, 0, mainShaftY + 16);
    brassGrad.addColorStop(0, "#fde68a");
    brassGrad.addColorStop(0.5, "#d97706");
    brassGrad.addColorStop(1, "#78350f");

    // Left Brass Blocker Ring
    ctx.fillStyle = brassGrad;
    ctx.fillRect(collarX - 16, mainShaftY - 16, 5, 32);
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 1;
    ctx.strokeRect(collarX - 16, mainShaftY - 16, 5, 32);

    // Right Brass Blocker Ring
    ctx.fillStyle = brassGrad;
    ctx.fillRect(collarX + 11, mainShaftY - 16, 5, 32);
    ctx.strokeRect(collarX + 11, mainShaftY - 16, 5, 32);

    // 3. Sliding Selector Sleeve (Dog Collar)
    const sleeveGrad = ctx.createLinearGradient(sleeveX - 9, 0, sleeveX + 9, 0);
    if (activeShift) {
      sleeveGrad.addColorStop(0, "#0284c7");
      sleeveGrad.addColorStop(0.5, "#38bdf8");
      sleeveGrad.addColorStop(1, "#0369a1");
    } else {
      sleeveGrad.addColorStop(0, "#334155");
      sleeveGrad.addColorStop(0.5, "#64748b");
      sleeveGrad.addColorStop(1, "#1e293b");
    }

    ctx.fillStyle = sleeveGrad;
    ctx.strokeStyle = activeShift ? "#ffffff" : "#94a3b8";
    ctx.lineWidth = activeShift ? 2 : 1;
    ctx.beginPath();
    ctx.roundRect(sleeveX - 9, mainShaftY - 26, 18, 52, 4);
    ctx.fill();
    ctx.stroke();

    // External Shift Fork Circumferential Groove
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(sleeveX - 3, mainShaftY - 26, 6, 52);

    // Internal Dog Spline teeth visible at ends
    ctx.fillStyle = "#f8fafc";
    for (let sy = mainShaftY - 22; sy <= mainShaftY + 22; sy += 8) {
      ctx.fillRect(sleeveX - 8, sy, 2, 4);
      ctx.fillRect(sleeveX + 6, sy, 2, 4);
    }

    // Engagement Lock Sparkles when shifted
    if (activeShift && Math.abs(collarOffset) > 0.7) {
      ctx.save();
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 8;
      const engX = collarOffset > 0 ? sleeveX + 9 : sleeveX - 9;
      ctx.beginPath();
      ctx.arc(engX, mainShaftY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 4. Shift Selector Fork & Rail Linkage
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(sleeveX, mainShaftY - 26);
    ctx.lineTo(sleeveX, mainShaftY - 48);
    ctx.stroke();

    // Selector Rail Guide Bushing
    ctx.fillStyle = "#94a3b8";
    ctx.beginPath();
    ctx.arc(sleeveX, mainShaftY - 48, 5, 0, Math.PI * 2);
    ctx.fill();

    // Horizontal Selector Rail Bar
    ctx.strokeStyle = "rgba(100, 116, 139, 0.4)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(collarX - 25, mainShaftY - 48);
    ctx.lineTo(collarX + 25, mainShaftY - 48);
    ctx.stroke();

    // Collar Label
    ctx.fillStyle = activeShift ? "#38bdf8" : "#64748b";
    ctx.font = "bold 8px monospace";
    ctx.textAlign = "center";
    ctx.fillText(label, collarX, mainShaftY - 56);
  }

  // Draw 60 FPS Photorealistic Cutaway Transmission Canvas
  function drawTransmission(state) {
    if (!transCtx || !transCanvas) return;
    const w = transCanvas.clientWidth || 650;
    const h = transCanvas.clientHeight || 570;

    transCtx.clearRect(0, 0, w, h);

    // Coordinate Anchors & Mathematical Center Distance
    const mainShaftY = 185; // Upper coaxial shaft (Input & Output)
    const counterShaftY = 345; // Lower layshaft / countershaft
    const C = counterShaftY - mainShaftY; // Exactly 160 px center distance
    const baseW = 650;
    const scaleX = Math.max(0.85, (w - 70) / (baseW - 70));

    const flywheelX = 42;
    const clutchDiscX = 64 + (clutchDepressedPct / 100) * 14;
    const frontBulkheadX = 94;
    const shaftStartX = 100;
    const shaftEndX = w - 30;

    // Helper: Map station horizontal coordinates responsively
    const getX = (baseX) => frontBulkheadX + (baseX - frontBulkheadX) * scaleX;

    // 1. Blueprint Engineering Grid
    transCtx.strokeStyle = "rgba(255, 255, 255, 0.035)";
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

    // 2. Cutaway Aluminum Transaxle Bellhousing & Casing
    transCtx.save();
    // Heavy cast aluminum outer wall
    const caseGrad = transCtx.createLinearGradient(0, 70, 0, 480);
    caseGrad.addColorStop(0, "rgba(30, 41, 59, 0.95)");
    caseGrad.addColorStop(0.5, "rgba(15, 23, 42, 0.98)");
    caseGrad.addColorStop(1, "rgba(8, 14, 26, 0.98)");

    transCtx.fillStyle = caseGrad;
    transCtx.strokeStyle = "#475569";
    transCtx.lineWidth = 3;
    transCtx.beginPath();
    transCtx.moveTo(25, 75);
    transCtx.lineTo(105, 115);
    transCtx.lineTo(w - 22, 115);
    transCtx.lineTo(w - 22, 445);
    transCtx.lineTo(105, 445);
    transCtx.lineTo(25, 485);
    transCtx.closePath();
    transCtx.fill();
    transCtx.stroke();

    // Internal structural reinforcing ribs
    transCtx.strokeStyle = "rgba(100, 116, 139, 0.25)";
    transCtx.lineWidth = 2;
    [180, 310, 470].forEach(rx => {
      const ribX = getX(rx);
      transCtx.beginPath();
      transCtx.moveTo(ribX, 115);
      transCtx.lineTo(ribX, 135);
      transCtx.moveTo(ribX, 425);
      transCtx.lineTo(ribX, 445);
      transCtx.stroke();
    });

    // Casing perimeter mounting bolts
    transCtx.fillStyle = "#cbd5e1";
    transCtx.strokeStyle = "#334155";
    transCtx.lineWidth = 1;
    [
      [30, 85], [65, 100], [105, 115], [getX(220), 115], [getX(370), 115], [getX(520), 115], [w - 25, 118],
      [w - 25, 442], [getX(520), 445], [getX(370), 445], [getX(220), 445], [105, 445], [65, 460], [30, 475]
    ].forEach(([bx, by]) => {
      transCtx.beginPath();
      transCtx.arc(bx, by, 3.5, 0, Math.PI * 2);
      transCtx.fill();
      transCtx.stroke();
      transCtx.fillStyle = "#1e293b";
      transCtx.fillRect(bx - 1, by - 1, 2, 2);
      transCtx.fillStyle = "#cbd5e1";
    });
    transCtx.restore();

    // 3. Transmission Fluid Oil Sump (75W-90 Synthetic Oil Bath)
    const sumpTopY = 415;
    const sumpBottomY = 445;
    const oilGrad = transCtx.createLinearGradient(0, sumpTopY, 0, sumpBottomY);
    oilGrad.addColorStop(0, "rgba(245, 158, 11, 0.15)");
    oilGrad.addColorStop(0.5, "rgba(217, 119, 6, 0.35)");
    oilGrad.addColorStop(1, "rgba(180, 83, 9, 0.6)");

    transCtx.fillStyle = oilGrad;
    transCtx.beginPath();
    transCtx.moveTo(105, sumpTopY);
    // Subtle fluid wave agitation
    const tWave = performance.now() * 0.003;
    for (let wx = 105; wx <= w - 22; wx += 25) {
      const wy = sumpTopY + Math.sin(wx * 0.04 + tWave) * 2.5;
      transCtx.lineTo(wx, wy);
    }
    transCtx.lineTo(w - 22, sumpBottomY);
    transCtx.lineTo(105, sumpBottomY);
    transCtx.closePath();
    transCtx.fill();

    // Fluid level sight glass marker
    transCtx.fillStyle = "#f59e0b";
    transCtx.font = "bold 8px monospace";
    transCtx.textAlign = "right";
    transCtx.fillText("75W-90 GL-4 FLUID LEVEL", w - 30, sumpTopY - 4);

    // 4. Engine Flywheel & Clutch Assembly (3D Powertrain Coupling)
    // Starter Ring Gear & Cast Flywheel Body
    const flyGrad = transCtx.createLinearGradient(flywheelX - 12, 0, flywheelX + 12, 0);
    flyGrad.addColorStop(0, "#1e293b");
    flyGrad.addColorStop(0.3, "#475569");
    flyGrad.addColorStop(0.6, "#94a3b8");
    flyGrad.addColorStop(0.85, "#334155");
    flyGrad.addColorStop(1, "#0f172a");

    transCtx.fillStyle = flyGrad;
    transCtx.strokeStyle = "#cbd5e1";
    transCtx.lineWidth = 1.5;
    transCtx.beginPath();
    transCtx.roundRect(flywheelX - 14, mainShaftY - 95, 26, 190, 4);
    transCtx.fill();
    transCtx.stroke();

    // Starter Motor Ring Gear Teeth on Flywheel Perimeter
    transCtx.fillStyle = "#cbd5e1";
    for (let fy = mainShaftY - 93; fy <= mainShaftY + 93; fy += 6) {
      transCtx.fillRect(flywheelX - 17, fy, 4, 3);
    }

    // Crankshaft Hub Bolt Pattern
    transCtx.fillStyle = "#0f172a";
    transCtx.beginPath();
    transCtx.arc(flywheelX, mainShaftY, 18, 0, Math.PI * 2);
    transCtx.fill();
    for (let cb = 0; cb < 6; cb++) {
      const cba = cb * (Math.PI / 3);
      transCtx.fillStyle = "#e2e8f0";
      transCtx.beginPath();
      transCtx.arc(flywheelX + Math.cos(cba) * 11, mainShaftY + Math.sin(cba) * 11, 2, 0, Math.PI * 2);
      transCtx.fill();
    }

    transCtx.fillStyle = "#38bdf8";
    transCtx.font = "bold 9px monospace";
    transCtx.textAlign = "center";
    transCtx.fillText("FLYWHEEL", flywheelX, mainShaftY - 102);

    // Clutch Friction Disc & Torsional Damper Springs
    const clutchCoupled = clutchDepressedPct < 15;
    transCtx.fillStyle = clutchCoupled ? "#10b981" : "#ef4444";
    transCtx.strokeStyle = "#ffffff";
    transCtx.lineWidth = 1.5;
    transCtx.beginPath();
    transCtx.roundRect(clutchDiscX, mainShaftY - 75, 9, 150, 2);
    transCtx.fill();
    transCtx.stroke();

    // Damper Coil Springs in Clutch Hub
    transCtx.fillStyle = "#f59e0b";
    transCtx.fillRect(clutchDiscX + 1, mainShaftY - 32, 7, 14);
    transCtx.fillRect(clutchDiscX + 1, mainShaftY + 18, 7, 14);
    transCtx.strokeStyle = "#000000";
    transCtx.lineWidth = 1;
    transCtx.strokeRect(clutchDiscX + 1, mainShaftY - 32, 7, 14);
    transCtx.strokeRect(clutchDiscX + 1, mainShaftY + 18, 7, 14);

    // Diaphragm Spring Pressure Plate Fingers
    transCtx.strokeStyle = "#94a3b8";
    transCtx.lineWidth = 2.5;
    transCtx.beginPath();
    transCtx.moveTo(clutchDiscX + 12, mainShaftY - 70);
    transCtx.lineTo(clutchDiscX + 18, mainShaftY - 20);
    transCtx.moveTo(clutchDiscX + 12, mainShaftY + 70);
    transCtx.lineTo(clutchDiscX + 18, mainShaftY + 20);
    transCtx.stroke();

    transCtx.fillStyle = clutchCoupled ? "#10b981" : "#ef4444";
    transCtx.fillText("CLUTCH", clutchDiscX + 4, mainShaftY - 82);

    // 5. Hardened Alloy Steel Shafts & Bearings
    // Lower Countershaft (Layshaft cluster)
    const shaftGrad = transCtx.createLinearGradient(0, counterShaftY - 8, 0, counterShaftY + 8);
    shaftGrad.addColorStop(0, "#1e293b");
    shaftGrad.addColorStop(0.3, "#64748b");
    shaftGrad.addColorStop(0.5, "#f8fafc");
    shaftGrad.addColorStop(0.7, "#475569");
    shaftGrad.addColorStop(1, "#0f172a");

    transCtx.fillStyle = shaftGrad;
    transCtx.strokeStyle = "#334155";
    transCtx.lineWidth = 1;
    transCtx.beginPath();
    transCtx.roundRect(shaftStartX + 10, counterShaftY - 8, shaftEndX - shaftStartX - 25, 16, 3);
    transCtx.fill();
    transCtx.stroke();

    // Countershaft Tapered Roller Bearings (Front & Rear Bulkheads)
    [shaftStartX + 12, shaftEndX - 20].forEach(bx => {
      transCtx.fillStyle = "#b45309"; // Bronze roller cage
      transCtx.fillRect(bx - 6, counterShaftY - 14, 12, 28);
      transCtx.fillStyle = "#cbd5e1"; // Chrome rollers
      for (let ry = counterShaftY - 12; ry <= counterShaftY + 10; ry += 6) {
        transCtx.fillRect(bx - 4, ry, 8, 4);
      }
    });

    // Upper Input Shaft (From clutch to 4th gear)
    const inputShaftGrad = transCtx.createLinearGradient(0, mainShaftY - 7, 0, mainShaftY + 7);
    inputShaftGrad.addColorStop(0, "#0284c7");
    inputShaftGrad.addColorStop(0.4, "#38bdf8");
    inputShaftGrad.addColorStop(0.6, "#f0f9ff");
    inputShaftGrad.addColorStop(1, "#0369a1");

    transCtx.fillStyle = inputShaftGrad;
    transCtx.beginPath();
    transCtx.roundRect(clutchDiscX + 9, mainShaftY - 7, getX(165) - clutchDiscX - 9, 14, 2);
    transCtx.fill();

    // Input Shaft Longitudinal Splines
    transCtx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    transCtx.lineWidth = 1;
    transCtx.beginPath();
    transCtx.moveTo(clutchDiscX + 12, mainShaftY - 3);
    transCtx.lineTo(getX(130), mainShaftY - 3);
    transCtx.moveTo(clutchDiscX + 12, mainShaftY + 3);
    transCtx.lineTo(getX(130), mainShaftY + 3);
    transCtx.stroke();

    // Coaxial Pilot Bearing Journal Gap (Between Input and Output shafts)
    const pilotX = getX(166);
    transCtx.fillStyle = "#fbbf24";
    transCtx.beginPath();
    transCtx.arc(pilotX, mainShaftY, 6, 0, Math.PI * 2);
    transCtx.fill();
    transCtx.strokeStyle = "#78350f";
    transCtx.stroke();

    // Upper Output Mainshaft (Coaxial, carries synchronizers & free-wheeling gears)
    const outShaftGrad = transCtx.createLinearGradient(0, mainShaftY - 8, 0, mainShaftY + 8);
    outShaftGrad.addColorStop(0, "#1e293b");
    outShaftGrad.addColorStop(0.3, "#94a3b8");
    outShaftGrad.addColorStop(0.5, "#ffffff");
    outShaftGrad.addColorStop(0.7, "#64748b");
    outShaftGrad.addColorStop(1, "#0f172a");

    transCtx.fillStyle = outShaftGrad;
    transCtx.beginPath();
    transCtx.roundRect(pilotX + 4, mainShaftY - 8, shaftEndX - pilotX, 16, 2);
    transCtx.fill();

    // Driveshaft Output Companion Flange (Right Edge)
    transCtx.fillStyle = "#334155";
    transCtx.strokeStyle = "#38bdf8";
    transCtx.lineWidth = 2;
    transCtx.beginPath();
    transCtx.roundRect(shaftEndX - 6, mainShaftY - 30, 14, 60, 4);
    transCtx.fill();
    transCtx.stroke();

    // Flange Universal Joint Bolt Holes
    transCtx.fillStyle = "#0f172a";
    transCtx.beginPath();
    transCtx.arc(shaftEndX + 1, mainShaftY - 20, 3, 0, Math.PI * 2);
    transCtx.arc(shaftEndX + 1, mainShaftY + 20, 3, 0, Math.PI * 2);
    transCtx.fill();

    transCtx.fillStyle = "#38bdf8";
    transCtx.font = "bold 9px monospace";
    transCtx.textAlign = "center";
    transCtx.fillText("OUTPUT", shaftEndX + 1, mainShaftY - 36);

    // 6. Complete Gear Set Layout with Exact Mathematical Tangency
    // Pitch radii sum to exactly C = 160 px for every forward pair
    const GEAR_LAYOUT = [
      { id: "drive", name: "Drive", baseX: 138, upperR: 65.5, lowerR: 94.5, upperTeeth: 18, lowerTeeth: 26, color: "#64748b", hasDogRing: false },
      { id: "4", name: "4th", baseX: 196, upperR: 80.0, lowerR: 80.0, upperTeeth: 22, lowerTeeth: 22, color: "#f59e0b", hasDogRing: true },
      { id: "3", name: "3rd", baseX: 272, upperR: 94.5, lowerR: 65.5, upperTeeth: 26, lowerTeeth: 18, color: "#10b981", hasDogRing: true },
      { id: "2", name: "2nd", baseX: 352, upperR: 109.1, lowerR: 50.9, upperTeeth: 30, lowerTeeth: 14, color: "#06b6d4", hasDogRing: true },
      { id: "1", name: "1st", baseX: 428, upperR: 120.0, lowerR: 40.0, upperTeeth: 33, lowerTeeth: 11, color: "#38bdf8", hasDogRing: true },
      { id: "5", name: "5th", baseX: 484, upperR: 54.5, lowerR: 105.5, upperTeeth: 15, lowerTeeth: 29, color: "#a855f7", hasDogRing: true },
      { id: "R", name: "Rev", baseX: 558, upperR: 92.0, lowerR: 40.0, upperTeeth: 28, lowerTeeth: 12, color: "#ef4444", hasDogRing: true, isReverse: true, idlerR: 29.0, idlerTeeth: 16 }
    ];

    // Draw All Gear Pairs & Contact Meshes
    GEAR_LAYOUT.forEach(pair => {
      const isCurrent = currentGear === pair.id;
      const gx = getX(pair.baseX);
      const lowerRot = counterShaftAngle;

      let upperRot = 0.0;
      if (pair.id === "drive") {
        upperRot = inputShaftAngle;
      } else if (isCurrent && state.clutchEngagedFrac > 0.05) {
        upperRot = outputShaftAngle;
      } else {
        upperRot = freeGearAngles[pair.id] || 0.0;
      }

      if (pair.isReverse) {
        // Reverse Idler Gear Train (Countershaft -> Idler -> Output Mainshaft)
        const idlerX = gx + 48.5 * scaleX;
        const idlerY = 296;
        const idlerRot = freeGearAngles["Idler"] || 0.0;

        // Idler Heavy Forged Mounting Bracket
        transCtx.strokeStyle = "rgba(239, 68, 68, 0.4)";
        transCtx.lineWidth = 4;
        transCtx.beginPath();
        transCtx.moveTo(gx, counterShaftY);
        transCtx.lineTo(idlerX, idlerY);
        transCtx.lineTo(gx, mainShaftY);
        transCtx.stroke();

        // 1. Lower Countershaft Reverse Gear
        drawInvoluteGear(transCtx, gx, counterShaftY, pair.lowerR, pair.lowerTeeth, lowerRot, pair.color, isCurrent, false);

        // 2. Reverse Idler Gear
        drawInvoluteGear(transCtx, idlerX, idlerY, pair.idlerR, pair.idlerTeeth, idlerRot, "#f43f5e", isCurrent, false);

        // 3. Upper Mainshaft Reverse Gear
        drawInvoluteGear(transCtx, gx, mainShaftY, pair.upperR, pair.upperTeeth, upperRot, pair.color, isCurrent, true, { hasDogRing: true });

        // Reverse Mesh Contact Points
        // Contact 1: Countershaft -> Idler
        const c1x = (gx * pair.idlerR + idlerX * pair.lowerR) / (pair.lowerR + pair.idlerR);
        const c1y = (counterShaftY * pair.idlerR + idlerY * pair.lowerR) / (pair.lowerR + pair.idlerR);
        drawMeshContactZone(transCtx, c1x, c1y, pair, isCurrent, state);

        // Contact 2: Idler -> Output Reverse Gear
        const c2x = (gx * pair.idlerR + idlerX * pair.upperR) / (pair.upperR + pair.idlerR);
        const c2y = (mainShaftY * pair.idlerR + idlerY * pair.upperR) / (pair.upperR + pair.idlerR);
        drawMeshContactZone(transCtx, c2x, c2y, pair, isCurrent, state);

        // Reverse Direction Inversion Indicator
        if (isCurrent && state.clutchEngagedFrac > 0.05) {
          transCtx.fillStyle = "#ef4444";
          transCtx.font = "bold 9px monospace";
          transCtx.textAlign = "center";
          transCtx.fillText("⟲ REVERSE VECTOR", gx, mainShaftY - pair.upperR - 12);
        }
      } else {
        // Forward Gears: Continuous Constant-Mesh Pairs
        // 1. Lower Countershaft Driven Gear
        drawInvoluteGear(transCtx, gx, counterShaftY, pair.lowerR, pair.lowerTeeth, lowerRot, pair.color, isCurrent, false);

        // 2. Upper Mainshaft Gear
        drawInvoluteGear(transCtx, gx, mainShaftY, pair.upperR, pair.upperTeeth, upperRot, pair.color, isCurrent, true, { hasDogRing: pair.hasDogRing });

        // 3. Pitch Point Tangential Contact Mesh Zone (Zero Gap)
        const pitchContactY = mainShaftY + pair.upperR;
        drawMeshContactZone(transCtx, gx, pitchContactY, pair, isCurrent, state);
      }

      // Gear Telemetry Label
      transCtx.fillStyle = isCurrent ? "#ffffff" : "#94a3b8";
      transCtx.font = isCurrent ? "bold 11px monospace" : "9px monospace";
      transCtx.textAlign = "center";
      transCtx.fillText(`${pair.name} (${pair.lowerTeeth}T/${pair.upperTeeth}T)`, gx, counterShaftY + pair.lowerR + 15);
    });

    // 7. Sliding Synchronizers (Collars 3-4, 1-2, 5-R)
    // Synchro 3-4 (between 4th and 3rd gear)
    draw3DSynchronizer(transCtx, getX(234), collar34Pos, currentGear === "3" || currentGear === "4", "SYNCHRO 3-4");

    // Synchro 1-2 (between 2nd and 1st gear)
    draw3DSynchronizer(transCtx, getX(390), collar12Pos, currentGear === "1" || currentGear === "2", "SYNCHRO 1-2");

    // Synchro 5-R (between 5th and Reverse gear)
    draw3DSynchronizer(transCtx, getX(522), collar5RPos, currentGear === "5" || currentGear === "R", "SYNCHRO 5-R");

    // 8. Active Torque Flow Energy Conduit
    if (currentGear !== "N" && state.clutchEngagedFrac > 0.05) {
      transCtx.save();
      transCtx.shadowColor = state.spec.color;
      transCtx.shadowBlur = 16;
      transCtx.strokeStyle = state.spec.color;
      transCtx.lineWidth = 3.5;
      transCtx.beginPath();
      // Flywheel -> Clutch -> Input Shaft
      transCtx.moveTo(flywheelX, mainShaftY);
      transCtx.lineTo(getX(138), mainShaftY);

      if (currentGear === "4") {
        // Direct Drive locks straight through to output
        transCtx.lineTo(shaftEndX, mainShaftY);
      } else {
        // Drops down through drive pair to countershaft
        transCtx.lineTo(getX(138), counterShaftY);
        const activePair = GEAR_LAYOUT.find(p => p.id === currentGear);
        if (activePair) {
          const gx = getX(activePair.baseX);
          transCtx.lineTo(gx, counterShaftY);
          if (activePair.isReverse) {
            // Torque routes through reverse idler
            transCtx.lineTo(gx + 48.5 * scaleX, 296);
            transCtx.lineTo(gx, mainShaftY);
          } else {
            transCtx.lineTo(gx, mainShaftY);
          }
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
    const h = chartCanvas.clientHeight || 110;

    chartCtx.clearRect(0, 0, w, h);

    const padLeft = 70;
    const padRight = 30;
    const padTop = 12;
    const plotW = w - padLeft - padRight;
    const barHeight = 20;

    // Bar 1: Torque Comparison (Input Torque vs Output Torque)
    const maxTorque = 1200;
    const inTorqueW = Math.min(plotW, (engineTorqueNm / maxTorque) * plotW);
    const outTorqueW = Math.min(plotW, (state.outputTorqueNm / maxTorque) * plotW);

    chartCtx.font = "bold 9px monospace";
    chartCtx.fillStyle = "#94a3b8";
    chartCtx.textAlign = "right";
    chartCtx.fillText("Torque", padLeft - 8, padTop + 13);

    // Input Torque Bar (Amber)
    chartCtx.fillStyle = "rgba(245, 158, 11, 0.4)";
    chartCtx.fillRect(padLeft, padTop, inTorqueW, barHeight / 2);
    chartCtx.fillStyle = "#f59e0b";
    chartCtx.textAlign = "left";
    chartCtx.fillText(`In: ${engineTorqueNm} N·m`, padLeft + inTorqueW + 6, padTop + 8);

    // Output Torque Bar (Active Gear Color)
    chartCtx.fillStyle = state.spec.color;
    chartCtx.fillRect(padLeft, padTop + barHeight / 2 + 2, outTorqueW, barHeight / 2);
    chartCtx.fillText(`Out: ${state.outputTorqueNm.toFixed(0)} N·m (${state.mechanicalAdvantage.toFixed(2)}x)`, padLeft + outTorqueW + 6, padTop + barHeight);

    // Bar 2: Speed Comparison (Input RPM vs Output RPM)
    const speedY = padTop + barHeight + 22;
    const maxRpm = 6000;
    const inRpmW = Math.min(plotW, (state.inputShaftRpm / maxRpm) * plotW);
    const outRpmW = Math.min(plotW, (Math.abs(state.outputShaftRpm) / maxRpm) * plotW);

    chartCtx.fillStyle = "#94a3b8";
    chartCtx.textAlign = "right";
    chartCtx.fillText("Rot Speed", padLeft - 8, speedY + 13);

    // Input Speed Bar
    chartCtx.fillStyle = "rgba(245, 158, 11, 0.4)";
    chartCtx.fillRect(padLeft, speedY, inRpmW, barHeight / 2);
    chartCtx.fillStyle = "#f59e0b";
    chartCtx.textAlign = "left";
    chartCtx.fillText(`In: ${Math.round(state.inputShaftRpm)} RPM`, padLeft + inRpmW + 6, speedY + 8);

    // Output Speed Bar
    chartCtx.fillStyle = "#38bdf8";
    chartCtx.fillRect(padLeft, speedY + barHeight / 2 + 2, outRpmW, barHeight / 2);
    chartCtx.fillText(`Out: ${Math.round(state.outputShaftRpm)} RPM`, padLeft + outRpmW + 6, speedY + barHeight);
  }

  // Draw Live High-Magnification Involute Tooth Mesh Inspection Viewport
  function drawMeshZoomView(state) {
    if (!meshZoomCtx || !meshZoomCanvas) return;
    const w = meshZoomCanvas.clientWidth || 480;
    const h = meshZoomCanvas.clientHeight || 125;

    meshZoomCtx.clearRect(0, 0, w, h);

    // 1. Technical Blueprint Grid
    meshZoomCtx.strokeStyle = "rgba(56, 189, 248, 0.06)";
    meshZoomCtx.lineWidth = 1;
    for (let x = 0; x < w; x += 20) {
      meshZoomCtx.beginPath();
      meshZoomCtx.moveTo(x, 0);
      meshZoomCtx.lineTo(x, h);
      meshZoomCtx.stroke();
    }
    for (let y = 0; y < h; y += 20) {
      meshZoomCtx.beginPath();
      meshZoomCtx.moveTo(0, y);
      meshZoomCtx.lineTo(w, y);
      meshZoomCtx.stroke();
    }

    // Determine active gear pair to inspect
    const activePairId = currentGear === "N" ? "drive" : currentGear;
    const GEAR_INFO = {
      "drive": { name: "Drive Pair", drivenT: 26, driverT: 18, color: "#64748b", r: 65.5, ratio: 1.44 },
      "1": { name: "1st Gear", drivenT: 33, driverT: 11, color: "#38bdf8", r: 120.0, ratio: 3.82 },
      "2": { name: "2nd Gear", drivenT: 30, driverT: 14, color: "#06b6d4", r: 109.1, ratio: 2.15 },
      "3": { name: "3rd Gear", drivenT: 26, driverT: 18, color: "#10b981", r: 94.5, ratio: 1.45 },
      "4": { name: "4th Gear (Direct)", drivenT: 22, driverT: 22, color: "#f59e0b", r: 80.0, ratio: 1.00 },
      "5": { name: "5th Gear", drivenT: 15, driverT: 29, color: "#a855f7", r: 54.5, ratio: 0.72 },
      "R": { name: "Reverse Train", drivenT: 28, driverT: 12, color: "#ef4444", r: 92.0, ratio: -3.54 }
    };
    const pairInfo = GEAR_INFO[activePairId] || GEAR_INFO["1"];

    // Optical comparator center: Pitch Point P
    const zoomPitchX = 130;
    const zoomPitchY = 62;
    const paRad = 20 * (Math.PI / 180); // 20 deg pressure angle
    const isTransmitting = currentGear !== "N" && state.clutchEngagedFrac > 0.05;

    // Contact sweep along line of action
    const tSweep = (performance.now() * 0.002 * (Math.max(200, state.inputShaftRpm) / 1000)) % 1.0;
    const sweepOffset = (tSweep - 0.5) * 26; // -13 to +13 px
    const contactX = zoomPitchX + Math.cos(paRad) * sweepOffset;
    const contactY = zoomPitchY + Math.sin(paRad) * sweepOffset;

    // 2. Draw Line of Action & Pitch Tangent
    meshZoomCtx.save();

    // 20° Involute Line of Action (Pressure Line)
    meshZoomCtx.strokeStyle = "rgba(250, 204, 21, 0.45)";
    meshZoomCtx.lineWidth = 1.5;
    meshZoomCtx.setLineDash([4, 3]);
    meshZoomCtx.beginPath();
    meshZoomCtx.moveTo(zoomPitchX - Math.cos(paRad) * 60, zoomPitchY - Math.sin(paRad) * 60);
    meshZoomCtx.lineTo(zoomPitchX + Math.cos(paRad) * 60, zoomPitchY + Math.sin(paRad) * 60);
    meshZoomCtx.stroke();
    meshZoomCtx.setLineDash([]);

    // Tangent Pitch Line (Horizontal)
    meshZoomCtx.strokeStyle = "rgba(56, 189, 248, 0.35)";
    meshZoomCtx.lineWidth = 1;
    meshZoomCtx.setLineDash([2, 2]);
    meshZoomCtx.beginPath();
    meshZoomCtx.moveTo(zoomPitchX - 65, zoomPitchY);
    meshZoomCtx.lineTo(zoomPitchX + 65, zoomPitchY);
    meshZoomCtx.stroke();
    meshZoomCtx.setLineDash([]);

    // 3. Lower Driver Tooth (Countershaft Gear Flank)
    meshZoomCtx.fillStyle = "rgba(30, 41, 59, 0.9)";
    meshZoomCtx.strokeStyle = pairInfo.color;
    meshZoomCtx.lineWidth = 2.5;
    meshZoomCtx.beginPath();
    meshZoomCtx.moveTo(zoomPitchX - 42, zoomPitchY + 50);
    meshZoomCtx.quadraticCurveTo(zoomPitchX - 22, zoomPitchY + 18, contactX - 1, contactY);
    meshZoomCtx.lineTo(contactX + 11, contactY - 14); // Tooth tip crest
    meshZoomCtx.lineTo(zoomPitchX + 32, contactY - 14);
    meshZoomCtx.lineTo(zoomPitchX + 42, zoomPitchY + 50);
    meshZoomCtx.closePath();
    meshZoomCtx.fill();
    meshZoomCtx.stroke();

    // 4. Upper Driven Tooth (Mainshaft Gear Flank)
    meshZoomCtx.fillStyle = "rgba(15, 23, 42, 0.92)";
    meshZoomCtx.strokeStyle = isTransmitting ? "#ffffff" : "rgba(255, 255, 255, 0.7)";
    meshZoomCtx.lineWidth = 2.5;
    meshZoomCtx.beginPath();
    meshZoomCtx.moveTo(zoomPitchX - 45, zoomPitchY - 50);
    meshZoomCtx.lineTo(contactX - 12, zoomPitchY - 50);
    meshZoomCtx.lineTo(contactX - 8, contactY + 13); // Tooth tip entering space
    meshZoomCtx.quadraticCurveTo(zoomPitchX - 4, zoomPitchY - 7, contactX, contactY);
    meshZoomCtx.lineTo(zoomPitchX + 28, zoomPitchY - 50);
    meshZoomCtx.closePath();
    meshZoomCtx.fill();
    meshZoomCtx.stroke();

    // 5. Contact Stress & Normal Force Vector
    if (isTransmitting) {
      const pulse = 1.0 + 0.3 * Math.sin(performance.now() * 0.02);
      const contactGrad = meshZoomCtx.createRadialGradient(contactX, contactY, 1, contactX, contactY, 16 * pulse);
      contactGrad.addColorStop(0, "#ffffff");
      contactGrad.addColorStop(0.3, "#facc15");
      contactGrad.addColorStop(0.7, pairInfo.color);
      contactGrad.addColorStop(1, "rgba(245, 158, 11, 0)");

      meshZoomCtx.fillStyle = contactGrad;
      meshZoomCtx.beginPath();
      meshZoomCtx.arc(contactX, contactY, 16 * pulse, 0, Math.PI * 2);
      meshZoomCtx.fill();

      // Normal Force Vector Arrow
      const arrowLen = 30;
      const fnX = contactX + Math.cos(paRad) * arrowLen;
      const fnY = contactY + Math.sin(paRad) * arrowLen;
      meshZoomCtx.strokeStyle = "#facc15";
      meshZoomCtx.lineWidth = 2.5;
      meshZoomCtx.beginPath();
      meshZoomCtx.moveTo(contactX, contactY);
      meshZoomCtx.lineTo(fnX, fnY);
      meshZoomCtx.stroke();

      meshZoomCtx.fillStyle = "#facc15";
      meshZoomCtx.beginPath();
      meshZoomCtx.arc(fnX, fnY, 3.5, 0, Math.PI * 2);
      meshZoomCtx.fill();

      meshZoomCtx.font = "bold 8px monospace";
      meshZoomCtx.textAlign = "left";
      meshZoomCtx.fillText("Fn (Vector)", fnX + 5, fnY + 3);
    } else {
      meshZoomCtx.fillStyle = "#10b981";
      meshZoomCtx.beginPath();
      meshZoomCtx.arc(contactX, contactY, 3.5, 0, Math.PI * 2);
      meshZoomCtx.fill();
    }

    // Pitch Point P Crosshair
    meshZoomCtx.strokeStyle = "#38bdf8";
    meshZoomCtx.lineWidth = 1.5;
    meshZoomCtx.beginPath();
    meshZoomCtx.arc(zoomPitchX, zoomPitchY, 4, 0, Math.PI * 2);
    meshZoomCtx.stroke();
    meshZoomCtx.font = "bold 8px monospace";
    meshZoomCtx.fillStyle = "#38bdf8";
    meshZoomCtx.textAlign = "right";
    meshZoomCtx.fillText("Pitch Point P", zoomPitchX - 8, zoomPitchY - 3);

    meshZoomCtx.restore();

    // 6. Engineering Kinematics Telemetry (Right Side)
    const infoX = 230;
    meshZoomCtx.font = "bold 10px monospace";
    meshZoomCtx.fillStyle = "#ffffff";
    meshZoomCtx.textAlign = "left";
    meshZoomCtx.fillText(`ACTIVE MESH: ${pairInfo.name.toUpperCase()}`, infoX, 20);

    meshZoomCtx.font = "9px monospace";
    meshZoomCtx.fillStyle = "#94a3b8";
    meshZoomCtx.fillText(`Tooth Count: Driven ${pairInfo.drivenT}T / Driver ${pairInfo.driverT}T`, infoX, 35);
    meshZoomCtx.fillText(`Pressure Angle α = 20.0° (Pure Involute)`, infoX, 49);
    meshZoomCtx.fillText(`Root Clearance c = 0.25·m | hw = 2.0·m`, infoX, 63);

    const normalForce = isTransmitting
      ? ((state.outputTorqueNm / (pairInfo.r * 0.001)) / Math.cos(paRad) / 1000).toFixed(2)
      : "0.00";
    const vPitch = (Math.abs(state.inputShaftRpm) * (2 * Math.PI / 60) * (pairInfo.r * 0.001) / Math.abs(pairInfo.ratio || 1)).toFixed(2);

    meshZoomCtx.fillStyle = isTransmitting ? "#f59e0b" : "#10b981";
    meshZoomCtx.fillText(`Normal Contact Force: ${normalForce} kN`, infoX, 80);
    meshZoomCtx.fillStyle = "#38bdf8";
    meshZoomCtx.fillText(`Pitch Line Velocity: ${vPitch} m/s`, infoX, 95);
    meshZoomCtx.fillStyle = "#c084fc";
    meshZoomCtx.fillText(isTransmitting ? "STATUS: TORQUE TRANSMITTING" : "STATUS: ROLLING (UNLOADED)", infoX, 110);
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
      // Rotate Input Shaft & Engine Coupling
      const inputRadPerSec = (state.inputShaftRpm * 2 * Math.PI) / 60;
      inputShaftAngle = (inputShaftAngle + inputRadPerSec * dt) % (Math.PI * 2);

      // Countershaft driven by 18T/26T pair (ratio = 26/18)
      const counterRadPerSec = -inputRadPerSec * (18 / 26);
      counterShaftAngle = (counterShaftAngle + counterRadPerSec * dt) % (Math.PI * 2);

      // Output Shaft rotates according to gear ratio:
      if (currentGear !== "N" && Math.abs(state.spec.ratio) > 0.01) {
        const outRadPerSec = (state.outputShaftRpm * 2 * Math.PI) / 60;
        outputShaftAngle = (outputShaftAngle + outRadPerSec * dt) % (Math.PI * 2);
      }

      // Update continuous free-wheeling gear rotation angles
      // Forward gears: driven by countershaft at corresponding tooth ratio
      const forwardRatios = {
        "1": 11 / 33,
        "2": 14 / 30,
        "3": 18 / 26,
        "4": 22 / 22,
        "5": 29 / 15
      };
      Object.keys(forwardRatios).forEach(gid => {
        if (gid === currentGear && state.clutchEngagedFrac > 0.05) {
          freeGearAngles[gid] = outputShaftAngle;
        } else {
          const wGear = -counterRadPerSec * forwardRatios[gid];
          freeGearAngles[gid] = (freeGearAngles[gid] + wGear * dt) % (Math.PI * 2);
        }
      });

      // Reverse Idler & Reverse Gear:
      // Countershaft (12T, CCW) -> Idler (16T, CW) -> Output Rev (28T, CCW)
      const wIdler = -counterRadPerSec * (12 / 16);
      freeGearAngles["Idler"] = (freeGearAngles["Idler"] + wIdler * dt) % (Math.PI * 2);

      if (currentGear === "R" && state.clutchEngagedFrac > 0.05) {
        freeGearAngles["R"] = outputShaftAngle;
      } else {
        const wRev = -wIdler * (16 / 28);
        freeGearAngles["R"] = (freeGearAngles["R"] + wRev * dt) % (Math.PI * 2);
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

    // Render All Canvases
    drawTransmission(state);
    drawMultiplierChart(state);
    drawMeshZoomView(state);

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
