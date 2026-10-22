// Edugates-ClipSAT Science Labs - Physics: Comprehensive Automotive Transmission Mechanics Suite
// 60 FPS Precision Classical Mechanics, Kinematics & Mechatronics Simulation:
// 1. 5-Speed Manual Transmission (MT): Constant mesh, synchronizers, dry clutch, reverse idler
// 2. Dual-Clutch Transmission (DCT / DSG): Concentric input shafts (Odd/Even), twin wet clutches K1/K2, pre-selection TCU
// 3. Automatic Transmission (AT): Fluid torque converter (impeller, turbine, stator sprag, lockup TCC) + Planetary Epicyclic Gearset
// 4. Continuously Variable Transmission (CVT): Dual conical variable pulleys, hydraulic sheaves, Van Doorne steel push belt

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initManualGearboxLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Mechanical Constants & Automotive Specs
  const FINAL_DRIVE_RATIO = 3.73; // Differential ring & pinion ratio
  const TIRE_RADIUS_M = 0.315; // 315 mm tire radius (~205/55R16)
  const VEHICLE_MASS_KG = 1350; // 1350 kg vehicle
  const G = 9.81;

  // Transmission Type Mode State
  // "manual" (5-Speed MT) | "dsg" (Dual-Clutch) | "automatic" (Planetary + Torque Converter) | "cvt" (Continuous Variable)
  let transmissionMode = "manual";

  // Global Engine & Environment State
  let engineRpm = 2200; // 800 to 6000 RPM
  let engineTorqueNm = 240; // 100 to 450 N*m
  let roadGradePct = 0; // -10% to +20%
  let isRunning = true;
  let isPaused = true;
  let animId = null;
  let lastTimestamp = performance.now();

  // -------------------------------------------------------------
  // Mode 1: 5-Speed Manual Transmission (MT) Specifications
  // -------------------------------------------------------------
  const GEAR_SPECS_MT = {
    "N": { name: "Neutral", ratio: 0.0, eff: 0.0, color: "#94a3b8", collar: null, collarPos: 0, desc: "All synchronizer collars centered. Free-wheeling output shaft decoupled." },
    "1": { name: "1st Gear", ratio: 3.82, eff: 0.95, color: "#38bdf8", collar: "1-2", collarPos: 1, desc: "High torque multiplication for starting from rest & climbing steep inclines." },
    "2": { name: "2nd Gear", ratio: 2.15, eff: 0.96, color: "#06b6d4", collar: "1-2", collarPos: -1, desc: "Moderate torque multiplication for city acceleration and low-speed navigation." },
    "3": { name: "3rd Gear", ratio: 1.45, eff: 0.97, color: "#10b981", collar: "3-4", collarPos: 1, desc: "Mid-range passing gear balancing engine torque and road velocity." },
    "4": { name: "4th Gear", ratio: 1.00, eff: 0.99, color: "#f59e0b", collar: "3-4", collarPos: -1, desc: "Direct Drive: Output shaft locked 1:1 with input shaft. Minimal friction." },
    "5": { name: "5th Gear", ratio: 0.72, eff: 0.96, color: "#a855f7", collar: "5-R", collarPos: -1, desc: "Overdrive: Output shaft spins faster than engine for high-speed fuel economy." },
    "R": { name: "Reverse", ratio: -3.54, eff: 0.93, color: "#ef4444", collar: "5-R", collarPos: 1, desc: "Intermediate Reverse Idler gear inverts rotation direction vector." }
  };
  let currentGearMT = "1";
  let clutchDepressedPct = 0; // 0% = Engaged, 100% = Disengaged
  let gearGrindAlertTime = 0;
  let collar12Pos = 1.0;
  let collar34Pos = 0.0;
  let collar5RPos = 0.0;
  let inputShaftAngleMT = 0.0;
  let counterShaftAngleMT = 0.0;
  let outputShaftAngleMT = 0.0;
  const freeGearAnglesMT = { "1": 0.0, "2": 0.0, "3": 0.0, "4": 0.0, "5": 0.0, "R": 0.0, "Idler": 0.0 };

  // -------------------------------------------------------------
  // Mode 2: Dual-Clutch Transmission (DCT / DSG) Specifications
  // -------------------------------------------------------------
  const GEAR_SPECS_DSG = {
    "P": { name: "Park", ratio: 0.0, eff: 0.0, clutch: null, color: "#64748b", desc: "Mechanical parking pawl locks final drive." },
    "R": { name: "Reverse", ratio: -3.65, eff: 0.94, clutch: "K2", color: "#ef4444", desc: "Driven via Clutch K2 on outer hollow shaft." },
    "N": { name: "Neutral", ratio: 0.0, eff: 0.0, clutch: null, color: "#94a3b8", desc: "Both clutches K1 and K2 disengaged." },
    "1": { name: "1st Gear", ratio: 3.92, eff: 0.96, clutch: "K1", color: "#38bdf8", desc: "Driven via Clutch K1 (solid inner shaft)." },
    "2": { name: "2nd Gear", ratio: 2.45, eff: 0.96, clutch: "K2", color: "#06b6d4", desc: "Driven via Clutch K2 (hollow outer shaft)." },
    "3": { name: "3rd Gear", ratio: 1.62, eff: 0.97, clutch: "K1", color: "#10b981", desc: "Driven via Clutch K1 (solid inner shaft)." },
    "4": { name: "4th Gear", ratio: 1.15, eff: 0.98, clutch: "K2", color: "#f59e0b", desc: "Driven via Clutch K2 (hollow outer shaft)." },
    "5": { name: "5th Gear", ratio: 0.88, eff: 0.98, clutch: "K1", color: "#a855f7", desc: "Overdrive 1: Driven via Clutch K1." },
    "6": { name: "6th Gear", ratio: 0.68, eff: 0.97, clutch: "K2", color: "#ec4899", desc: "Overdrive 2: Driven via Clutch K2." }
  };
  let currentGearDSG = "1";
  let preselectedGearDSG = "2";
  let dsgDriveMode = "D"; // "D" (Auto Drive), "S" (Sport), "M" (Manual Paddle)
  let k1Pressure = 1.0; // 0.0 to 1.0
  let k2Pressure = 0.0; // 0.0 to 1.0
  let dsgShiftTimer = 0.0; // Cross-fade shift animation timer
  let dsgShiftDuration = 0.22; // 220ms visual cross-fade, 20ms mechanical handover
  let shaftAngleDSGInner = 0.0; // Solid inner shaft (Odd: 1, 3, 5)
  let shaftAngleDSGOuter = 0.0; // Hollow outer shaft (Even: 2, 4, 6, R)
  let shaftAngleDSGOutput = 0.0;

  // -------------------------------------------------------------
  // Mode 3: Automatic Transmission (AT - Planetary & Torque Converter)
  // -------------------------------------------------------------
  // Planetary epicyclic parameters: Sun Z_s = 30T, Ring Z_r = 70T, Planets Z_p = 20T
  // Geometric constraint: Z_r = Z_s + 2*Z_p (70 = 30 + 40)
  const AT_RATIOS = {
    "P": { name: "Park", ratio: 0.0, eff: 0.0, color: "#64748b", sun: "free", carrier: "locked", ring: "free", desc: "Parking pawl locks transmission output drum." },
    "R": { name: "Reverse", ratio: -2.33, eff: 0.93, color: "#ef4444", sun: "input", carrier: "held", ring: "output", desc: "Carrier locked by Band B2; Sun drives Ring backwards: i = -Z_r/Z_s = -2.33" },
    "N": { name: "Neutral", ratio: 0.0, eff: 0.0, color: "#94a3b8", sun: "free", carrier: "free", ring: "free", desc: "All clutches and brake bands released. Free fluid idle." },
    "D1": { name: "1st Gear", ratio: 3.33, eff: 0.94, color: "#38bdf8", sun: "input", carrier: "output", ring: "held", desc: "Ring held by Band B1; Sun drives Carrier: i = 1 + Z_r/Z_s = 3.33" },
    "D2": { name: "2nd Gear", ratio: 1.43, eff: 0.96, color: "#06b6d4", sun: "held", carrier: "output", ring: "input", desc: "Sun held by Band B1; Ring drives Carrier: i = 1 + Z_s/Z_r = 1.43" },
    "D3": { name: "3rd Gear", ratio: 1.00, eff: 0.99, color: "#10b981", sun: "locked", carrier: "locked", ring: "locked", desc: "Direct Drive: Clutch C3 locks Sun to Carrier; whole pack spins 1:1" },
    "D4": { name: "4th (OD)", ratio: 0.70, eff: 0.96, color: "#a855f7", sun: "held", carrier: "input", ring: "output", desc: "Overdrive: Sun held; Carrier drives Ring: i = Z_r / (Z_s + Z_r) = 0.70" }
  };
  let atSelector = "D"; // "P", "R", "N", "D", "2", "1"
  let atActiveGear = "D1"; // "D1", "D2", "D3", "D4"
  let tccLockupEnabled = true; // Torque Converter Lock-Up Clutch
  let tccIsLocked = false;
  let tcStallMultiplier = 2.15; // Up to 2.15x torque multiplication at stall
  let tcCurrentMultiplier = 1.0;
  let angleATImpeller = 0.0;
  let angleATTurbine = 0.0;
  let angleATStator = 0.0;
  let angleATSun = 0.0;
  let angleATCarrier = 0.0;
  let angleATRing = 0.0;
  let angleATPlanet = 0.0;

  // -------------------------------------------------------------
  // Mode 4: Continuously Variable Transmission (CVT) Specifications
  // -------------------------------------------------------------
  // Variable conical pulleys with Van Doorne steel push belt
  let cvtRatio = 2.50; // Continuous ratio from 0.55 (OD) to 2.60 (Low)
  let cvtMode = "auto"; // "auto" (Continuous stepless), "stepped" (7-speed simulated), "manual"
  let cvtStepIndex = 0; // 0 to 6 for simulated 7-speed
  const CVT_STEPS = [2.50, 1.85, 1.40, 1.05, 0.82, 0.66, 0.55];
  let angleCVTPrimary = 0.0;
  let angleCVTSecondary = 0.0;
  let cvtBeltAnimOffset = 0.0;
  let cvtPrimarySheaveClamping = 0.5; // 0 to 1 displacement

  // Assemble Master HTML Structure
  container.innerHTML = `
    <div class="lab-container">
      <!-- Top Navigation & Transmission Mode Selector Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <span style="font-size: 0.88rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #38bdf8; box-shadow: 0 0 12px #38bdf8;"></span>
            Automotive Transmission Mechanics Suite
          </span>
          <span class="badge" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            ${renderLatex("i = \\frac{\\omega_{\\text{in}}}{\\omega_{\\text{out}}} \\quad \\bullet \\quad \\tau_{\\text{out}} = \\tau_{\\text{in}} \\cdot i \\cdot \\eta \\quad \\bullet \\quad P = \\tau \\omega")}
          </span>
        </div>

        <!-- Transmission Mode Selector Pills -->
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <div class="trans-mode-switcher" style="display: flex; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 3px; gap: 3px;">
            <button class="btn btn-secondary trans-mode-btn active" data-mode="manual" style="padding: 5px 11px; font-size: 0.74rem; font-weight: 700; border-radius: 6px; border: none; background: #38bdf8; color: #0f172a;">
              🕹️ 5-Speed Manual
            </button>
            <button class="btn btn-secondary trans-mode-btn" data-mode="dsg" style="padding: 5px 11px; font-size: 0.74rem; font-weight: 600; border-radius: 6px; border: none; background: transparent; color: #94a3b8;">
              ⚡ Dual-Clutch (DSG)
            </button>
            <button class="btn btn-secondary trans-mode-btn" data-mode="automatic" style="padding: 5px 11px; font-size: 0.74rem; font-weight: 600; border-radius: 6px; border: none; background: transparent; color: #94a3b8;">
              ⚙️ Planetary Auto (AT)
            </button>
            <button class="btn btn-secondary trans-mode-btn" data-mode="cvt" style="padding: 5px 11px; font-size: 0.74rem; font-weight: 600; border-radius: 6px; border: none; background: transparent; color: #94a3b8;">
              ♾️ Stepless CVT
            </button>
          </div>

          <button class="btn btn-primary btn-sm" id="btn-gear-playpause" style="padding: 5px 14px; font-size: 0.78rem; background: linear-gradient(135deg, #10b981, #059669); border: none; font-weight: 700; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);">
            ▶ Run Gearbox
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-gear-step" title="Advance Gearbox Rotation by +15° (Hotkey: P/Space)" style="padding: 5px 12px; font-size: 0.78rem;">
            ↷ Step +15°
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-gear-export" title="Export transmission mechanical telemetry to CSV (Hotkey: E)" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export CSV (E)
          </button>
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.5); border-radius: 8px; padding: 3px; border: 1px solid rgba(255,255,255,0.1);">
            <button id="view-mode-gear-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.76rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Simulator
            </button>
            <button id="view-mode-gear-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.76rem; font-weight: 600; border-radius: 6px; background: transparent; border: none; color: #38bdf8;">
              📸 4K Bench
            </button>
          </div>
        </div>
      </div>

      <!-- Main Layout: 2-Column Split (Cutaway Transmission Canvas & Adaptive Telemetry / Shifter) -->
      <div style="display: grid; grid-template-columns: 1.25fr 1fr; gap: 20px;" class="gear-layout">
        <!-- Left Column: 60 FPS Cutaway Transmission Canvas -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(56, 189, 248, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #0c1a2e 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 570px;">
          <canvas id="gear-transmission-canvas" width="650" height="570" style="height: 570px; width: 100%; display: block;"></canvas>

          <!-- Top Gear & Clutch Status Badge -->
          <div style="position: absolute; top: 14px; left: 14px; right: 14px; display: flex; justify-content: space-between; align-items: center; pointer-events: none; z-index: 2;">
            <div id="gear-status-badge" style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(8px); border: 1.5px solid #38bdf8; padding: 6px 14px; border-radius: 8px; font-weight: 800; font-size: 0.85rem; color: #38bdf8; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.6);">
              <span id="gear-status-dot" style="width: 10px; height: 10px; border-radius: 50%; background: #38bdf8; display: inline-block;"></span>
              <span id="gear-status-name">ACTIVE GEAR: 1st (Ratio: 3.82 : 1)</span>
            </div>
            <div id="clutch-status-badge" style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(8px); border: 1px solid rgba(16, 185, 129, 0.4); padding: 6px 12px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.8rem; color: #10b981; display: flex; align-items: center; gap: 6px;">
              <span>Clutch:</span> <span id="clutch-status-text" style="font-weight: 700;">ENGAGED (0%)</span>
            </div>
          </div>

          <!-- Gear Grind Warning Alert Box -->
          <div id="gear-grind-alert" style="display: none; position: absolute; top: 60px; left: 50%; transform: translateX(-50%); background: rgba(239, 68, 68, 0.94); backdrop-filter: blur(8px); border: 1px solid #fca5a5; color: #ffffff; padding: 8px 18px; border-radius: 8px; font-weight: 800; font-size: 0.85rem; box-shadow: 0 10px 25px rgba(239, 68, 68, 0.5); z-index: 3;">
            ⚠️ SYNCHRONIZER STRESS: Disengage clutch before shifting!
          </div>

          <!-- Bottom Telemetry HUD Overlay -->
          <div style="position: absolute; bottom: 12px; left: 14px; right: 14px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 10px; padding: 10px 14px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; pointer-events: none; z-index: 2;">
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
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.88rem;">Cutaway Transaxle Test Bench</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Torque Telemetry</div>
                <div style="color: #10b981; font-weight: 700; font-family: var(--font-mono); font-size: 0.88rem;">Magtrol Dual In-Line Load Cells</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Coupling System</div>
                <div style="color: #f59e0b; font-weight: 700; font-family: var(--font-mono); font-size: 0.88rem;">Multi-Mode Mechanical Interlock</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Interactive Mode Console & Telemetry Charts -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <!-- Dynamic Mode-Specific Shifter Console Container -->
          <div id="trans-mode-interactive-panel" style="background: rgba(15, 23, 42, 0.88); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; padding: 14px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
            <!-- Content will be injected dynamically based on transmissionMode -->
          </div>

          <!-- Common Powertrain Engine & Grade Sliders -->
          <div style="background: rgba(15, 23, 42, 0.88); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 12px;">
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
          <div style="background: rgba(15, 23, 42, 0.88); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 0.78rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em;">
                📊 Torque Multiplication vs Road Speed
              </span>
              <span id="lbl-gear-ma" style="font-family: var(--font-mono); font-size: 0.76rem; color: #10b981; font-weight: 700;">
                MA = 3.63x
              </span>
            </div>
            <canvas id="gear-chart-canvas" width="480" height="135" style="width: 100%; height: 110px; display: block; border-radius: 6px; background: #030712;"></canvas>
          </div>

          <!-- Microscopic Zoom Inspection Viewport -->
          <div style="background: rgba(15, 23, 42, 0.88); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; padding: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 0.78rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
                <span>🔬</span> <span id="lbl-micro-title">Involute Tooth Mesh &amp; Contact Mechanics</span>
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

  // Canvas References & DPR Scaling
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

  // -------------------------------------------------------------
  // Comprehensive Transmission State Calculation
  // -------------------------------------------------------------
  function calculateTransmissionState() {
    let spec = { name: "1st", ratio: 3.82, eff: 0.95, color: "#38bdf8", desc: "" };
    let clutchEngagedFrac = 1.0;
    let inputShaftRpm = engineRpm;
    let outputShaftRpm = 0;
    let outputTorqueNm = 0;
    let mechanicalAdvantage = 0;
    let roadSpeedKmh = 0;
    let currentRatioVal = 1.0;

    if (transmissionMode === "manual") {
      spec = GEAR_SPECS_MT[currentGearMT] || GEAR_SPECS_MT["1"];
      clutchEngagedFrac = Math.max(0, 1.0 - clutchDepressedPct / 100);
      inputShaftRpm = engineRpm * clutchEngagedFrac;
      currentRatioVal = spec.ratio;

      if (currentGearMT !== "N" && Math.abs(spec.ratio) > 0.001) {
        outputShaftRpm = inputShaftRpm / spec.ratio;
        outputTorqueNm = engineTorqueNm * Math.abs(spec.ratio) * spec.eff * clutchEngagedFrac;
        mechanicalAdvantage = Math.abs(spec.ratio) * spec.eff;
      }
    } else if (transmissionMode === "dsg") {
      spec = GEAR_SPECS_DSG[currentGearDSG] || GEAR_SPECS_DSG["1"];
      currentRatioVal = spec.ratio;

      // Active clutch engagement
      const isOdd = ["1", "3", "5"].includes(currentGearDSG);
      const isEven = ["2", "4", "6", "R"].includes(currentGearDSG);
      const effectiveClutch = isOdd ? k1Pressure : (isEven ? k2Pressure : 0);
      clutchEngagedFrac = effectiveClutch;
      inputShaftRpm = engineRpm * clutchEngagedFrac;

      if (currentGearDSG !== "N" && currentGearDSG !== "P" && Math.abs(spec.ratio) > 0.001) {
        outputShaftRpm = inputShaftRpm / spec.ratio;
        outputTorqueNm = engineTorqueNm * Math.abs(spec.ratio) * spec.eff * clutchEngagedFrac;
        mechanicalAdvantage = Math.abs(spec.ratio) * spec.eff;
      }
    } else if (transmissionMode === "automatic") {
      // Automatic Planetary Transmission
      let gearKey = atActiveGear;
      if (atSelector === "P" || atSelector === "N" || atSelector === "R") {
        gearKey = atSelector;
      }
      spec = AT_RATIOS[gearKey] || AT_RATIOS["D1"];
      currentRatioVal = spec.ratio;

      // Torque converter slip & torque multiplication
      const turbineRpmEstimate = spec.ratio !== 0 ? Math.min(engineRpm, Math.abs(engineRpm / spec.ratio) * 0.85) : 0;
      const speedRatioSR = engineRpm > 10 ? Math.min(1.0, turbineRpmEstimate / engineRpm) : 0;

      if (tccIsLocked) {
        tcCurrentMultiplier = 1.0;
        clutchEngagedFrac = 1.0;
      } else {
        // Torque converter multiplication: 2.15 at stall down to 1.0 at SR=0.85
        tcCurrentMultiplier = speedRatioSR < 0.85 ? 1.0 + (1.0 - speedRatioSR / 0.85) * (tcStallMultiplier - 1.0) : 1.0;
        clutchEngagedFrac = 0.96; // Hydraulic fluid coupling
      }

      inputShaftRpm = engineRpm * (tccIsLocked ? 1.0 : Math.max(0.2, speedRatioSR));
      if (atSelector !== "P" && atSelector !== "N" && Math.abs(spec.ratio) > 0.001) {
        outputShaftRpm = inputShaftRpm / spec.ratio;
        outputTorqueNm = engineTorqueNm * tcCurrentMultiplier * Math.abs(spec.ratio) * spec.eff;
        mechanicalAdvantage = Math.abs(spec.ratio) * tcCurrentMultiplier * spec.eff;
      }
    } else if (transmissionMode === "cvt") {
      // Continuously Variable Transmission
      currentRatioVal = cvtRatio;
      spec = {
        name: `CVT (${cvtRatio.toFixed(2)}:1)`,
        ratio: cvtRatio,
        eff: 0.94,
        color: "#10b981",
        desc: "Van Doorne steel push-belt infinitely varying pitch radius between conical sheaves."
      };
      clutchEngagedFrac = 1.0;
      inputShaftRpm = engineRpm;
      outputShaftRpm = inputShaftRpm / cvtRatio;
      outputTorqueNm = engineTorqueNm * cvtRatio * spec.eff;
      mechanicalAdvantage = cvtRatio * spec.eff;
    }

    // Vehicle Road Velocity
    if (outputShaftRpm !== 0) {
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
      mode: transmissionMode,
      spec,
      clutchEngagedFrac,
      currentRatioVal,
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

  // -------------------------------------------------------------
  // Shared 3D Involute Spur & Helical Gear Rendering Function
  // -------------------------------------------------------------
  function drawInvoluteGear(ctx, cx, cy, rPitch, teeth, angle, color, isEngaged, isUpper, options = {}) {
    const m = (2 * rPitch) / teeth; // Module
    const ha = 0.82 * m; // Addendum
    const hd = 1.18 * m; // Dedendum
    const rTip = rPitch + ha;
    const rRoot = Math.max(8, rPitch - hd);
    const rRim = rRoot - 3;
    const rHub = Math.max(14, rPitch * 0.28);
    const step = (Math.PI * 2) / teeth;
    const halfThick = step * 0.25;
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

    const gearGrad = ctx.createRadialGradient(0, 0, rHub * 0.8, 0, 0, rTip);
    gearGrad.addColorStop(0, "#1e293b");
    gearGrad.addColorStop(0.35, "#334155");
    gearGrad.addColorStop(0.7, color);
    gearGrad.addColorStop(0.92, "#1e293b");
    gearGrad.addColorStop(1.0, "#0f172a");

    ctx.fillStyle = gearGrad;
    ctx.fill();

    ctx.strokeStyle = isEngaged ? "#ffffff" : "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = isEngaged ? 2 : 1;
    ctx.stroke();

    // 3. Helical Tooth Crest Facets
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

    // 4. Recessed Gear Web Pocket
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
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // 5. Machined Lightening Holes
    if (rRim - rHub > 22) {
      const numHoles = teeth >= 28 ? 5 : (teeth >= 18 ? 4 : 3);
      const rHoleCenter = (rRim + rHub) * 0.5;
      const rHole = (rRim - rHub) * 0.25;

      for (let k = 0; k < numHoles; k++) {
        const aHole = angle + k * ((Math.PI * 2) / numHoles);
        const hx = Math.cos(aHole) * rHoleCenter;
        const hy = Math.sin(aHole) * rHoleCenter;

        ctx.fillStyle = "#030712";
        ctx.beginPath();
        ctx.arc(hx, hy, rHole, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(0, 0, 0, 0.85)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(hx, hy, rHole - 0.5, Math.PI * 0.8, Math.PI * 1.8);
        ctx.stroke();

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

    const rBore = Math.max(7, rHub * 0.55);
    ctx.fillStyle = "#b45309"; // Bronze bearing
    ctx.beginPath();
    ctx.arc(0, 0, rBore, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(0, 0, rBore - 2, 0, Math.PI * 2);
    ctx.fill();

    // 7. Dog Teeth Ring for Synchronizer Sleeve
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

    ctx.restore();
  }

  // -------------------------------------------------------------
  // Mode 1: 5-Speed Manual Transmission Canvas Renderer
  // -------------------------------------------------------------
  function drawManualTransmission(ctx, state, w, h) {
    const mainShaftY = 185;
    const counterShaftY = 345;
    const baseW = 650;
    const scaleX = Math.max(0.85, (w - 70) / (baseW - 70));
    const frontBulkheadX = 94;
    const getX = (baseX) => frontBulkheadX + (baseX - frontBulkheadX) * scaleX;

    // Bellhousing Casing
    ctx.save();
    const caseGrad = ctx.createLinearGradient(0, 70, 0, 480);
    caseGrad.addColorStop(0, "rgba(30, 41, 59, 0.95)");
    caseGrad.addColorStop(0.5, "rgba(15, 23, 42, 0.98)");
    caseGrad.addColorStop(1, "rgba(8, 14, 26, 0.98)");
    ctx.fillStyle = caseGrad;
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(25, 75);
    ctx.lineTo(105, 115);
    ctx.lineTo(w - 22, 115);
    ctx.lineTo(w - 22, 445);
    ctx.lineTo(105, 445);
    ctx.lineTo(25, 485);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Flywheel & Friction Clutch
    const clutchDiscX = 64 + (clutchDepressedPct / 100) * 14;
    // Engine Flywheel
    const flyGrad = ctx.createLinearGradient(35, 0, 50, 0);
    flyGrad.addColorStop(0, "#334155");
    flyGrad.addColorStop(0.5, "#64748b");
    flyGrad.addColorStop(1, "#1e293b");
    ctx.fillStyle = flyGrad;
    ctx.fillRect(35, mainShaftY - 75, 14, 150);

    // Friction Clutch Disc
    const clutchGrad = ctx.createLinearGradient(clutchDiscX - 3, 0, clutchDiscX + 3, 0);
    clutchGrad.addColorStop(0, "#78350f");
    clutchGrad.addColorStop(0.5, "#d97706");
    clutchGrad.addColorStop(1, "#451a03");
    ctx.fillStyle = clutchGrad;
    ctx.fillRect(clutchDiscX - 3, mainShaftY - 65, 6, 130);

    // Steel Shafts
    // Upper Input / Output Coaxial Shaft
    const shaftGrad = ctx.createLinearGradient(0, mainShaftY - 7, 0, mainShaftY + 7);
    shaftGrad.addColorStop(0, "#94a3b8");
    shaftGrad.addColorStop(0.4, "#ffffff");
    shaftGrad.addColorStop(0.8, "#64748b");
    shaftGrad.addColorStop(1, "#1e293b");
    ctx.fillStyle = shaftGrad;
    ctx.fillRect(clutchDiscX, mainShaftY - 6, w - clutchDiscX - 25, 12);

    // Lower Countershaft
    ctx.fillStyle = shaftGrad;
    ctx.fillRect(getX(110), counterShaftY - 7, w - getX(110) - 45, 14);

    // Gear Stations Specs
    const pairs = [
      { name: "Drive", gearKey: null, x: getX(138), upperR: 44, lowerR: 64, upperT: 18, lowerT: 26, color: "#94a3b8" },
      { name: "1st", gearKey: "1", x: getX(208), upperR: 78, lowerR: 28, upperT: 33, lowerT: 11, color: "#38bdf8", collar: "1-2", pos: 1 },
      { name: "2nd", gearKey: "2", x: getX(282), upperR: 68, lowerR: 38, upperT: 30, lowerT: 14, color: "#06b6d4", collar: "1-2", pos: -1 },
      { name: "3rd", gearKey: "3", x: getX(360), upperR: 56, lowerR: 50, upperT: 26, lowerT: 18, color: "#10b981", collar: "3-4", pos: 1 },
      { name: "4th", gearKey: "4", x: getX(432), upperR: 46, lowerR: 60, upperT: 22, lowerT: 22, color: "#f59e0b", collar: "3-4", pos: -1 },
      { name: "5th", gearKey: "5", x: getX(506), upperR: 34, lowerR: 72, upperT: 15, lowerT: 29, color: "#a855f7", collar: "5-R", pos: -1 },
      { name: "Rev", gearKey: "R", x: getX(580), upperR: 64, lowerR: 30, upperT: 28, lowerT: 12, color: "#ef4444", collar: "5-R", pos: 1 }
    ];

    // Render Lower Countershaft Gears
    pairs.forEach(p => {
      drawInvoluteGear(ctx, p.x, counterShaftY, p.lowerR, p.lowerT, counterShaftAngleMT * (p.lowerT / 26), p.color, currentGearMT === p.gearKey, false);
    });

    // Render Upper Mainshaft Gears
    pairs.forEach(p => {
      const isEngaged = currentGearMT === p.gearKey;
      let angle = p.gearKey ? freeGearAnglesMT[p.gearKey] : inputShaftAngleMT;
      drawInvoluteGear(ctx, p.x, mainShaftY, p.upperR, p.upperT, angle, p.color, isEngaged, true, { hasDogRing: !!p.gearKey });
    });

    // Reverse Idler Gear
    const revX = getX(580);
    const idlerY = (mainShaftY + counterShaftY) * 0.5 + 4;
    drawInvoluteGear(ctx, revX + 16, idlerY, 24, 16, freeGearAnglesMT["Idler"], "#ef4444", currentGearMT === "R", false);

    // 3D Synchronizer Sleeves
    drawSynchronizer(ctx, (pairs[1].x + pairs[2].x) / 2, collar12Pos, currentGearMT === "1" || currentGearMT === "2", "1-2 SYNCHRO");
    drawSynchronizer(ctx, (pairs[3].x + pairs[4].x) / 2, collar34Pos, currentGearMT === "3" || currentGearMT === "4", "3-4 SYNCHRO");
    drawSynchronizer(ctx, (pairs[5].x + pairs[6].x) / 2, collar5RPos, currentGearMT === "5" || currentGearMT === "R", "5-R SYNCHRO");
  }

  function drawSynchronizer(ctx, collarX, collarOffset, activeShift, label) {
    const mainShaftY = 185;
    const sleeveX = collarX + collarOffset * 18;

    // Brass blocker rings
    const brassGrad = ctx.createLinearGradient(0, mainShaftY - 16, 0, mainShaftY + 16);
    brassGrad.addColorStop(0, "#fde68a");
    brassGrad.addColorStop(0.5, "#d97706");
    brassGrad.addColorStop(1, "#78350f");
    ctx.fillStyle = brassGrad;
    ctx.fillRect(collarX - 16, mainShaftY - 16, 5, 32);
    ctx.fillRect(collarX + 11, mainShaftY - 16, 5, 32);

    // Sliding selector sleeve
    const sleeveGrad = ctx.createLinearGradient(sleeveX - 9, 0, sleeveX + 9, 0);
    sleeveGrad.addColorStop(0, activeShift ? "#0284c7" : "#334155");
    sleeveGrad.addColorStop(0.5, activeShift ? "#38bdf8" : "#64748b");
    sleeveGrad.addColorStop(1, activeShift ? "#0369a1" : "#1e293b");

    ctx.fillStyle = sleeveGrad;
    ctx.strokeStyle = activeShift ? "#ffffff" : "#94a3b8";
    ctx.lineWidth = activeShift ? 2 : 1;
    ctx.beginPath();
    ctx.roundRect(sleeveX - 9, mainShaftY - 24, 18, 48, 3);
    ctx.fill();
    ctx.stroke();

    // Central selector fork groove
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(sleeveX - 3, mainShaftY - 24, 6, 48);

    // Shifter fork
    ctx.fillStyle = activeShift ? "#38bdf8" : "#64748b";
    ctx.fillRect(sleeveX - 2, mainShaftY - 48, 4, 24);
    ctx.beginPath();
    ctx.arc(sleeveX, mainShaftY - 48, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // -------------------------------------------------------------
  // Mode 2: Dual-Clutch Transmission (DCT / DSG) Canvas Renderer
  // -------------------------------------------------------------
  function drawDSGTransmission(ctx, state, w, h) {
    const centerY = 270;
    const upperShaftY = 165;
    const lowerShaftY = 385;

    // Transaxle Housing
    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.96)";
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(25, 95, w - 50, 400, 16);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Concentric Dual Input Shafts
    // 1. Inner Solid Shaft (Odd Gears 1, 3, 5 - Driven by Clutch K1)
    const innerShaftGrad = ctx.createLinearGradient(0, centerY - 6, 0, centerY + 6);
    innerShaftGrad.addColorStop(0, "#38bdf8");
    innerShaftGrad.addColorStop(0.5, "#ffffff");
    innerShaftGrad.addColorStop(1, "#0284c7");
    ctx.fillStyle = innerShaftGrad;
    ctx.fillRect(160, centerY - 5, w - 240, 10);

    // 2. Outer Hollow Shaft (Even Gears 2, 4, 6, R - Driven by Clutch K2)
    const outerShaftGrad = ctx.createLinearGradient(0, centerY - 11, 0, centerY + 11);
    outerShaftGrad.addColorStop(0, "#06b6d4");
    outerShaftGrad.addColorStop(0.5, "#a5f3fc");
    outerShaftGrad.addColorStop(1, "#0891b2");
    ctx.fillStyle = outerShaftGrad;
    ctx.fillRect(160, centerY - 11, 140, 22);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(160, centerY - 11, 140, 22);

    // Upper Output Shaft (1st, 2nd, 3rd, 4th)
    ctx.fillStyle = "#64748b";
    ctx.fillRect(160, upperShaftY - 6, w - 240, 12);

    // Lower Output Shaft (5th, 6th, Rev)
    ctx.fillRect(160, lowerShaftY - 6, w - 240, 12);

    // Dual Wet Clutch Pack (K1 and K2 on left)
    const clutchBoxX = 55;
    // Flywheel ring
    ctx.fillStyle = "#334155";
    ctx.fillRect(clutchBoxX, centerY - 75, 14, 150);

    // Clutch K1 (Outer multi-disc pack - drives solid inner shaft)
    const k1Active = ["1", "3", "5"].includes(currentGearDSG);
    ctx.save();
    ctx.fillStyle = k1Active ? "rgba(56, 189, 248, 0.25)" : "rgba(30, 41, 59, 0.6)";
    ctx.strokeStyle = k1Active ? "#38bdf8" : "#475569";
    ctx.lineWidth = k1Active ? 2 : 1;
    ctx.beginPath();
    ctx.roundRect(clutchBoxX + 16, centerY - 65, 42, 130, 6);
    ctx.fill();
    ctx.stroke();

    // Multi-plate friction discs in K1
    for (let d = 0; d < 5; d++) {
      ctx.fillStyle = k1Active ? "#fef08a" : "#94a3b8";
      ctx.fillRect(clutchBoxX + 20 + d * 7, centerY - 55, 3, 110);
    }
    ctx.fillStyle = k1Active ? "#38bdf8" : "#94a3b8";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.fillText("CLUTCH K1", clutchBoxX + 37, centerY - 72);
    ctx.fillText(`P: ${(k1Pressure * 100).toFixed(0)}%`, clutchBoxX + 37, centerY + 82);
    ctx.restore();

    // Clutch K2 (Inner multi-disc pack - drives hollow outer shaft)
    const k2Active = ["2", "4", "6", "R"].includes(currentGearDSG);
    ctx.save();
    ctx.fillStyle = k2Active ? "rgba(6, 182, 212, 0.25)" : "rgba(30, 41, 59, 0.6)";
    ctx.strokeStyle = k2Active ? "#06b6d4" : "#475569";
    ctx.lineWidth = k2Active ? 2 : 1;
    ctx.beginPath();
    ctx.roundRect(clutchBoxX + 62, centerY - 45, 36, 90, 6);
    ctx.fill();
    ctx.stroke();

    for (let d = 0; d < 4; d++) {
      ctx.fillStyle = k2Active ? "#fef08a" : "#94a3b8";
      ctx.fillRect(clutchBoxX + 66 + d * 7, centerY - 38, 3, 76);
    }
    ctx.fillStyle = k2Active ? "#06b6d4" : "#94a3b8";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.fillText("CLUTCH K2", clutchBoxX + 80, centerY - 52);
    ctx.fillText(`P: ${(k2Pressure * 100).toFixed(0)}%`, clutchBoxX + 80, centerY + 62);
    ctx.restore();

    // DSG Speed Gear Pairs
    const dsgGears = [
      { name: "2nd", gearKey: "2", x: 210, shaft: "upper", y: upperShaftY, r: 52, t: 26, clutch: "K2", color: "#06b6d4" },
      { name: "4th", gearKey: "4", x: 275, shaft: "upper", y: upperShaftY, r: 42, t: 22, clutch: "K2", color: "#f59e0b" },
      { name: "1st", gearKey: "1", x: 345, shaft: "upper", y: upperShaftY, r: 64, t: 32, clutch: "K1", color: "#38bdf8" },
      { name: "3rd", gearKey: "3", x: 415, shaft: "upper", y: upperShaftY, r: 48, t: 24, clutch: "K1", color: "#10b981" },
      { name: "6th", gearKey: "6", x: 240, shaft: "lower", y: lowerShaftY, r: 36, t: 18, clutch: "K2", color: "#ec4899" },
      { name: "5th", gearKey: "5", x: 380, shaft: "lower", y: lowerShaftY, r: 40, t: 20, clutch: "K1", color: "#a855f7" },
      { name: "Rev", gearKey: "R", x: 450, shaft: "lower", y: lowerShaftY, r: 58, t: 28, clutch: "K2", color: "#ef4444" }
    ];

    dsgGears.forEach(g => {
      const isDriven = currentGearDSG === g.gearKey;
      const isPre = preselectedGearDSG === g.gearKey;
      const angle = g.clutch === "K1" ? shaftAngleDSGInner : shaftAngleDSGOuter;

      drawInvoluteGear(ctx, g.x, g.y, g.r, g.t, angle, g.color, isDriven, true);

      // Status indicator on top of gear
      if (isDriven) {
        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.fillText("ACTIVE", g.x, g.y - g.r - 8);
      } else if (isPre) {
        ctx.fillStyle = "#f59e0b";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.fillText("PRE-SEL", g.x, g.y - g.r - 8);
      }
    });

    // Final Drive Crown Wheel Differential (Right side)
    const diffX = w - 65;
    const diffY = centerY;
    drawInvoluteGear(ctx, diffX, diffY, 68, 38, shaftAngleDSGOutput, "#e2e8f0", true, false);
    ctx.fillStyle = "#10b981";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.fillText("FINAL DRIVE", diffX, diffY + 84);
  }

  // -------------------------------------------------------------
  // Mode 3: Automatic Planetary Transmission & Torque Converter Renderer
  // -------------------------------------------------------------
  function drawAutomaticTransmission(ctx, state, w, h) {
    const centerY = 285;

    // Transaxle Housing
    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.96)";
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(25, 95, w - 50, 400, 16);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 1. Fluid Torque Converter Cutaway (Left side: x = 50 to 220)
    const tcCenterX = 135;
    const tcR = 95;

    // Impeller / Pump (Outer rotating bowl connected to engine)
    ctx.save();
    ctx.translate(tcCenterX, centerY);
    ctx.rotate(angleATImpeller);
    const impGrad = ctx.createRadialGradient(0, 0, 20, 0, 0, tcR);
    impGrad.addColorStop(0, "#1e293b");
    impGrad.addColorStop(0.6, "#ef4444");
    impGrad.addColorStop(1, "#991b1b");
    ctx.strokeStyle = impGrad;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(0, 0, tcR - 8, 0, Math.PI * 2);
    ctx.stroke();

    // Curved Impeller Vanes
    ctx.strokeStyle = "#fca5a5";
    ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * (tcR - 20), Math.sin(a) * (tcR - 20), 16, a - 0.4, a + 0.8);
      ctx.stroke();
    }
    ctx.restore();

    // Turbine (Inner driven rotor connected to input shaft)
    ctx.save();
    ctx.translate(tcCenterX, centerY);
    ctx.rotate(angleATTurbine);
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(0, 0, tcR - 28, 0, Math.PI * 2);
    ctx.stroke();

    // Turbine Counter-Vanes
    ctx.strokeStyle = "#bae6fd";
    ctx.lineWidth = 2;
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI) / 5;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * (tcR - 40), Math.sin(a) * (tcR - 40), 14, a + 0.4, a - 0.8, true);
      ctx.stroke();
    }
    ctx.restore();

    // Stator with One-Way Sprag Clutch (Center)
    ctx.save();
    ctx.translate(tcCenterX, centerY);
    ctx.rotate(angleATStator);
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#78350f";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Lock-up Clutch (TCC) Banner
    ctx.fillStyle = tccIsLocked ? "#10b981" : "#f59e0b";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.fillText("TORQUE CONVERTER", tcCenterX, centerY - tcR - 12);
    ctx.fillText(tccIsLocked ? "🔒 TCC LOCKED (0% SLIP)" : `⚡ STALL MULT: ${tcCurrentMultiplier.toFixed(2)}x`, tcCenterX, centerY + tcR + 18);

    // 2. Compound Planetary (Epicyclic) Gearset (Right side: x = 400, y = 285)
    const planX = 425;
    const planY = centerY;
    const rSun = 42;
    const rPlanet = 28;
    const rRing = rSun + 2 * rPlanet; // 98 px

    // Outer Internal Ring (Annulus) Gear
    ctx.save();
    ctx.translate(planX, planY);
    ctx.rotate(angleATRing);

    // Outer Drum
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(0, 0, rRing + 6, 0, Math.PI * 2);
    ctx.stroke();

    // Internal Involute Teeth
    const ringTeeth = 42;
    const ringStep = (Math.PI * 2) / ringTeeth;
    ctx.fillStyle = "#cbd5e1";
    for (let i = 0; i < ringTeeth; i++) {
      const th = i * ringStep;
      ctx.beginPath();
      ctx.moveTo(Math.cos(th - 0.03) * (rRing + 4), Math.sin(th - 0.03) * (rRing + 4));
      ctx.lineTo(Math.cos(th) * (rRing - 5), Math.sin(th) * (rRing - 5));
      ctx.lineTo(Math.cos(th + 0.03) * (rRing + 4), Math.sin(th + 0.03) * (rRing + 4));
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Brake Band B1 around Ring Gear
    const bandClamped = atActiveGear === "D1" || atActiveGear === "D2" || atActiveGear === "D4";
    ctx.strokeStyle = bandClamped ? "#ef4444" : "#64748b";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(planX, planY, rRing + 14, 0.4, Math.PI * 2 - 0.4);
    ctx.stroke();

    // Center Sun Gear
    drawInvoluteGear(ctx, planX, planY, rSun, 24, angleATSun, "#f59e0b", true, false);

    // Planet Carrier Spider & 4 Planet Pinions
    const numPlanets = 4;
    const rCarrierOrbit = rSun + rPlanet; // 70 px
    for (let p = 0; p < numPlanets; p++) {
      const orbitA = angleATCarrier + p * (Math.PI * 2 / numPlanets);
      const px = planX + Math.cos(orbitA) * rCarrierOrbit;
      const py = planY + Math.sin(orbitA) * rCarrierOrbit;

      drawInvoluteGear(ctx, px, py, rPlanet, 16, angleATPlanet + orbitA * 2, "#38bdf8", true, false);

      // Carrier Pin Needle Bearing
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Carrier Spider Web
    ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let p = 0; p < numPlanets; p++) {
      const orbitA = angleATCarrier + p * (Math.PI * 2 / numPlanets);
      const px = planX + Math.cos(orbitA) * rCarrierOrbit;
      const py = planY + Math.sin(orbitA) * rCarrierOrbit;
      if (p === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();

    // Planetary Callout Text
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.fillText("PLANETARY EPICYCLIC PACK", planX, planY - rRing - 22);
    ctx.fillText(`GEAR: ${state.spec.name} (${state.spec.desc.split(";")[0]})`, planX, planY + rRing + 28);
  }

  // -------------------------------------------------------------
  // Mode 4: Continuously Variable Transmission (CVT) Canvas Renderer
  // -------------------------------------------------------------
  function drawCVTTransmission(ctx, state, w, h) {
    const centerY = 285;
    const primX = 185;
    const secX = w - 195;

    // Outer Transaxle Casing
    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.96)";
    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(25, 95, w - 50, 400, 16);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Pulley Pitch Radii based on Continuous Ratio (0.55 to 2.60)
    // Low Ratio (2.60): Primary small (R1=32), Secondary large (R2=82)
    // Overdrive (0.55): Primary large (R1=82), Secondary small (R2=32)
    const ratioNorm = (cvtRatio - 0.55) / (2.60 - 0.55); // 0 (OD) to 1 (Low)
    const rPrim = 32 + (1.0 - ratioNorm) * 50;
    const rSec = 32 + ratioNorm * 50;

    // Primary Conical Pulley (Engine Drive Input)
    drawConicalPulley(ctx, primX, centerY, rPrim, angleCVTPrimary, "PRIMARY (INPUT)", "#38bdf8", 1.0 - ratioNorm);

    // Secondary Conical Pulley (Output to Differential)
    drawConicalPulley(ctx, secX, centerY, rSec, angleCVTSecondary, "SECONDARY (OUTPUT)", "#10b981", ratioNorm);

    // Van Doorne Steel Push Belt (Continuous Loop)
    drawVanDoornePushBelt(ctx, primX, centerY, rPrim, secX, centerY, rSec);

    // Telemetry Callouts
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`CVT RATIO: ${cvtRatio.toFixed(2)} : 1`, (primX + secX) / 2, centerY - 130);
    ctx.fillStyle = "#38bdf8";
    ctx.fillText(`R_prim: ${rPrim.toFixed(1)} mm`, primX, centerY + 130);
    ctx.fillStyle = "#10b981";
    ctx.fillText(`R_sec: ${rSec.toFixed(1)} mm`, secX, centerY + 130);
  }

  function drawConicalPulley(ctx, cx, cy, rPitch, angle, label, color, sheaveCloseFrac) {
    const maxR = 95;

    // Fixed Outer Sheave Disc (3D Conical Perspective)
    const coneGrad = ctx.createRadialGradient(cx, cy, 15, cx, cy, maxR);
    coneGrad.addColorStop(0, "#cbd5e1");
    coneGrad.addColorStop(0.4, "#64748b");
    coneGrad.addColorStop(0.85, "#1e293b");
    coneGrad.addColorStop(1, "#0f172a");

    ctx.fillStyle = coneGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rotating radial machined honing lines
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 20, Math.sin(a) * 20);
      ctx.lineTo(Math.cos(a) * (maxR - 2), Math.sin(a) * (maxR - 2));
      ctx.stroke();
    }
    ctx.restore();

    // Active Belt Pitch Diameter Circle
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, rPitch, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Hydraulic clamping piston arrows
    const arrowOffset = 8 + sheaveCloseFrac * 12;
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.moveTo(cx - 30, cy - maxR - 8);
    ctx.lineTo(cx - 18, cy - maxR - 8);
    ctx.lineTo(cx - 18, cy - maxR - 14);
    ctx.lineTo(cx - 6, cy - maxR - 4);
    ctx.lineTo(cx - 18, cy - maxR + 6);
    ctx.lineTo(cx - 18, cy - maxR);
    ctx.lineTo(cx - 30, cy - maxR);
    ctx.closePath();
    ctx.fill();

    // Pulley Label
    ctx.fillStyle = color;
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.fillText(label, cx, cy - maxR - 18);
  }

  function drawVanDoornePushBelt(ctx, x1, y1, r1, x2, y2, r2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const gamma = Math.asin(Math.max(-1, Math.min(1, (r2 - r1) / dist)));
    const baseAngle = Math.atan2(dy, dx);

    const a1 = baseAngle + Math.PI / 2 + gamma;
    const a2 = baseAngle - Math.PI / 2 - gamma;

    const p1Top = { x: x1 + Math.cos(a1) * r1, y: y1 + Math.sin(a1) * r1 };
    const p2Top = { x: x2 + Math.cos(a1) * r2, y: y2 + Math.sin(a1) * r2 };
    const p2Bot = { x: x2 + Math.cos(a2) * r2, y: y2 + Math.sin(a2) * r2 };
    const p1Bot = { x: x1 + Math.cos(a2) * r1, y: y1 + Math.sin(a2) * r1 };

    // Steel Push Belt Body (Laminated high-strength bands)
    ctx.save();
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 9;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(p1Top.x, p1Top.y);
    ctx.lineTo(p2Top.x, p2Top.y);
    ctx.arc(x2, y2, r2, a1, a2 + Math.PI * 2);
    ctx.lineTo(p1Bot.x, p1Bot.y);
    ctx.arc(x1, y1, r1, a2, a1);
    ctx.stroke();

    // Inner Metallic Specular Core
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Animated Steel Pushing Blocks (Hundreds of high-strength trapezoidal elements)
    ctx.strokeStyle = "rgba(15, 23, 42, 0.85)";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 4]);
    ctx.lineDashOffset = -cvtBeltAnimOffset;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // -------------------------------------------------------------
  // Master Canvas Drawing Router
  // -------------------------------------------------------------
  function drawTransmission(state) {
    if (!transCtx || !transCanvas) return;
    const w = transCanvas.clientWidth || 650;
    const h = transCanvas.clientHeight || 570;

    transCtx.clearRect(0, 0, w, h);

    // Subtle Engineering Blueprint Grid
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

    if (transmissionMode === "manual") {
      drawManualTransmission(transCtx, state, w, h);
    } else if (transmissionMode === "dsg") {
      drawDSGTransmission(transCtx, state, w, h);
    } else if (transmissionMode === "automatic") {
      drawAutomaticTransmission(transCtx, state, w, h);
    } else if (transmissionMode === "cvt") {
      drawCVTTransmission(transCtx, state, w, h);
    }
  }

  // -------------------------------------------------------------
  // Secondary Telemetry Canvases: Multiplier Chart & Micro-Inspection
  // -------------------------------------------------------------
  function drawMultiplierChart(state) {
    if (!chartCtx || !chartCanvas) return;
    const w = chartCanvas.clientWidth || 480;
    const h = chartCanvas.clientHeight || 110;

    chartCtx.clearRect(0, 0, w, h);

    // Chart Axes & Grid
    chartCtx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    chartCtx.lineWidth = 1;
    for (let v = 20; v <= 180; v += 40) {
      const vx = (v / 200) * w;
      chartCtx.beginPath();
      chartCtx.moveTo(vx, 0);
      chartCtx.lineTo(vx, h);
      chartCtx.stroke();
    }

    if (transmissionMode === "manual" || transmissionMode === "dsg") {
      const specs = transmissionMode === "manual" ? GEAR_SPECS_MT : GEAR_SPECS_DSG;
      Object.keys(specs).forEach(g => {
        if (g === "N" || g === "R" || g === "P") return;
        const sp = specs[g];
        const maxSpeed = 200 / sp.ratio;
        const xStart = 0;
        const xEnd = Math.min(w, (maxSpeed / 200) * w);

        chartCtx.strokeStyle = sp.color;
        chartCtx.lineWidth = (g === (transmissionMode === "manual" ? currentGearMT : currentGearDSG)) ? 3 : 1.2;
        chartCtx.beginPath();
        chartCtx.moveTo(xStart, h - (sp.ratio / 4.2) * (h - 15));
        chartCtx.lineTo(xEnd, h - (sp.ratio / 4.2) * (h - 15));
        chartCtx.stroke();
      });
    } else if (transmissionMode === "automatic") {
      Object.keys(AT_RATIOS).forEach(g => {
        if (g === "N" || g === "R" || g === "P") return;
        const sp = AT_RATIOS[g];
        chartCtx.strokeStyle = sp.color;
        chartCtx.lineWidth = (g === atActiveGear) ? 3 : 1.2;
        chartCtx.beginPath();
        chartCtx.moveTo(0, h - (sp.ratio / 3.8) * (h - 15));
        chartCtx.lineTo(w * 0.9, h - (sp.ratio / 3.8) * (h - 15));
        chartCtx.stroke();
      });
    } else if (transmissionMode === "cvt") {
      // Continuous hyperbolic envelope
      chartCtx.strokeStyle = "rgba(16, 185, 129, 0.35)";
      chartCtx.lineWidth = 1.5;
      chartCtx.beginPath();
      for (let x = 10; x < w; x += 10) {
        const v = (x / w) * 200;
        const y = h - Math.max(10, Math.min(h - 10, (1400 / Math.max(10, v))));
        if (x === 10) chartCtx.moveTo(x, y);
        else chartCtx.lineTo(x, y);
      }
      chartCtx.stroke();

      // Operating point dot
      const ptX = Math.min(w - 10, Math.max(10, (state.roadSpeedKmh / 200) * w));
      const ptY = h - (cvtRatio / 3.0) * (h - 15);
      chartCtx.fillStyle = "#10b981";
      chartCtx.beginPath();
      chartCtx.arc(ptX, ptY, 5, 0, Math.PI * 2);
      chartCtx.fill();
    }
  }

  function drawMeshZoomView(state) {
    if (!meshZoomCtx || !meshZoomCanvas) return;
    const w = meshZoomCanvas.clientWidth || 480;
    const h = meshZoomCanvas.clientHeight || 125;

    meshZoomCtx.clearRect(0, 0, w, h);

    if (transmissionMode === "manual") {
      // Involute tooth mesh with 20° line of action
      const midX = w / 2;
      const midY = h / 2;
      meshZoomCtx.strokeStyle = "#38bdf8";
      meshZoomCtx.lineWidth = 3;
      meshZoomCtx.beginPath();
      meshZoomCtx.arc(midX - 35, midY, 60, -0.4, 0.4);
      meshZoomCtx.stroke();
      meshZoomCtx.beginPath();
      meshZoomCtx.arc(midX + 35, midY, 60, Math.PI - 0.4, Math.PI + 0.4);
      meshZoomCtx.stroke();

      // Line of action
      meshZoomCtx.strokeStyle = "#facc15";
      meshZoomCtx.lineWidth = 1.8;
      meshZoomCtx.beginPath();
      meshZoomCtx.moveTo(midX - 50, midY - 25);
      meshZoomCtx.lineTo(midX + 50, midY + 25);
      meshZoomCtx.stroke();
      meshZoomCtx.fillStyle = "#ffffff";
      meshZoomCtx.font = "bold 9px monospace";
      meshZoomCtx.fillText("20° Pressure Angle (Line of Action)", 14, 18);
    } else if (transmissionMode === "dsg") {
      // Wet dual-clutch friction plate shearing
      meshZoomCtx.fillStyle = "#fef08a";
      meshZoomCtx.fillRect(w * 0.25, 25, 8, h - 50);
      meshZoomCtx.fillStyle = "#38bdf8";
      meshZoomCtx.fillRect(w * 0.35, 20, 8, h - 40);
      meshZoomCtx.fillStyle = "#06b6d4";
      meshZoomCtx.fillRect(w * 0.45, 25, 8, h - 50);

      // ATF fluid boundary layer
      meshZoomCtx.fillStyle = "rgba(56, 189, 248, 0.3)";
      meshZoomCtx.fillRect(w * 0.28, 20, w * 0.14, h - 40);
      meshZoomCtx.fillStyle = "#ffffff";
      meshZoomCtx.font = "bold 9px monospace";
      meshZoomCtx.fillText("Wet Clutch Micro-Grooves & ATF Film Shearing", 14, 18);
    } else if (transmissionMode === "automatic") {
      // Torque converter hydrodynamic vortex
      const cx = w / 2;
      const cy = h / 2;
      meshZoomCtx.strokeStyle = "#ef4444";
      meshZoomCtx.lineWidth = 3;
      meshZoomCtx.beginPath();
      meshZoomCtx.ellipse(cx, cy, 70, 35, 0, 0, Math.PI * 2);
      meshZoomCtx.stroke();
      meshZoomCtx.fillStyle = "#f59e0b";
      meshZoomCtx.beginPath();
      meshZoomCtx.arc(cx, cy, 14, 0, Math.PI * 2);
      meshZoomCtx.fill();
      meshZoomCtx.fillStyle = "#ffffff";
      meshZoomCtx.font = "bold 9px monospace";
      meshZoomCtx.fillText("Hydrodynamic Toroidal Vortex Circulation (Pump -> Turbine)", 14, 18);
    } else if (transmissionMode === "cvt") {
      // Van Doorne steel push-belt block contact
      const cx = w / 2;
      const cy = h / 2;
      // 11° Sheave Flank
      meshZoomCtx.strokeStyle = "#cbd5e1";
      meshZoomCtx.lineWidth = 4;
      meshZoomCtx.beginPath();
      meshZoomCtx.moveTo(cx - 60, cy - 40);
      meshZoomCtx.lineTo(cx - 20, cy + 40);
      meshZoomCtx.stroke();

      // Steel Element Block
      meshZoomCtx.fillStyle = "#38bdf8";
      meshZoomCtx.beginPath();
      meshZoomCtx.roundRect(cx - 15, cy - 20, 30, 40, 3);
      meshZoomCtx.fill();
      meshZoomCtx.fillStyle = "#ffffff";
      meshZoomCtx.font = "bold 9px monospace";
      meshZoomCtx.fillText("11° Conical Sheave Flank & Steel Push-Block Grip", 14, 18);
    }
  }

  // -------------------------------------------------------------
  // Master 60 FPS Animation & Kinematics Loop
  // -------------------------------------------------------------
  function tick(timestamp) {
    if (!container.isConnected) {
      isRunning = false;
      return;
    }

    const dt = Math.min(0.08, (timestamp - lastTimestamp) / 1000);
    lastTimestamp = timestamp;

    const state = calculateTransmissionState();

    if (isRunning && !isPaused) {
      const inputRadPerSec = (state.inputShaftRpm * 2 * Math.PI) / 60;

      if (transmissionMode === "manual") {
        inputShaftAngleMT = (inputShaftAngleMT + inputRadPerSec * dt) % (Math.PI * 2);
        const counterRadPerSec = -inputRadPerSec * (18 / 26);
        counterShaftAngleMT = (counterShaftAngleMT + counterRadPerSec * dt) % (Math.PI * 2);

        if (currentGearMT !== "N" && Math.abs(state.spec.ratio) > 0.01) {
          const outRadPerSec = (state.outputShaftRpm * 2 * Math.PI) / 60;
          outputShaftAngleMT = (outputShaftAngleMT + outRadPerSec * dt) % (Math.PI * 2);
        }

        const forwardRatios = { "1": 11 / 33, "2": 14 / 30, "3": 18 / 26, "4": 22 / 22, "5": 29 / 15 };
        Object.keys(forwardRatios).forEach(gid => {
          if (gid === currentGearMT && state.clutchEngagedFrac > 0.05) {
            freeGearAnglesMT[gid] = outputShaftAngleMT;
          } else {
            const wGear = -counterRadPerSec * forwardRatios[gid];
            freeGearAnglesMT[gid] = (freeGearAnglesMT[gid] + wGear * dt) % (Math.PI * 2);
          }
        });

        const wIdler = -counterRadPerSec * (12 / 16);
        freeGearAnglesMT["Idler"] = (freeGearAnglesMT["Idler"] + wIdler * dt) % (Math.PI * 2);
        if (currentGearMT === "R" && state.clutchEngagedFrac > 0.05) {
          freeGearAnglesMT["R"] = outputShaftAngleMT;
        } else {
          freeGearAnglesMT["R"] = (freeGearAnglesMT["R"] - wIdler * (16 / 28) * dt) % (Math.PI * 2);
        }

        updateManualCollars(dt);
      } else if (transmissionMode === "dsg") {
        shaftAngleDSGInner = (shaftAngleDSGInner + inputRadPerSec * k1Pressure * dt) % (Math.PI * 2);
        shaftAngleDSGOuter = (shaftAngleDSGOuter + inputRadPerSec * k2Pressure * dt) % (Math.PI * 2);
        if (state.outputShaftRpm !== 0) {
          const outRad = (state.outputShaftRpm * 2 * Math.PI) / 60;
          shaftAngleDSGOutput = (shaftAngleDSGOutput + outRad * dt) % (Math.PI * 2);
        }

        // DSG Shift Cross-fade update
        if (dsgShiftTimer > 0) {
          dsgShiftTimer -= dt;
          if (dsgShiftTimer <= 0) {
            dsgShiftTimer = 0;
            const isOdd = ["1", "3", "5"].includes(currentGearDSG);
            k1Pressure = isOdd ? 1.0 : 0.0;
            k2Pressure = isOdd ? 0.0 : 1.0;
          } else {
            const prog = 1.0 - (dsgShiftTimer / dsgShiftDuration);
            const isOdd = ["1", "3", "5"].includes(currentGearDSG);
            if (isOdd) {
              k1Pressure = prog;
              k2Pressure = 1.0 - prog;
            } else {
              k2Pressure = prog;
              k1Pressure = 1.0 - prog;
            }
          }
        }
      } else if (transmissionMode === "automatic") {
        angleATImpeller = (angleATImpeller + ((engineRpm * 2 * Math.PI) / 60) * dt) % (Math.PI * 2);
        angleATTurbine = (angleATTurbine + ((state.inputShaftRpm * 2 * Math.PI) / 60) * dt) % (Math.PI * 2);

        // Planetary Kinematics (Willis condition)
        const wSun = (state.inputShaftRpm * 2 * Math.PI) / 60;
        angleATSun = (angleATSun + wSun * dt) % (Math.PI * 2);

        if (atActiveGear === "D1") {
          // Ring fixed, Sun input, Carrier output: w_c = w_s / (1 + Z_r/Z_s)
          const wCarrier = wSun / 3.33;
          angleATCarrier = (angleATCarrier + wCarrier * dt) % (Math.PI * 2);
          angleATPlanet = (angleATPlanet - (wSun - wCarrier) * (30 / 20) * dt) % (Math.PI * 2);
        } else if (atActiveGear === "D2") {
          // Sun fixed, Ring input, Carrier output
          const wCarrier = wSun / 1.43;
          angleATCarrier = (angleATCarrier + wCarrier * dt) % (Math.PI * 2);
          angleATPlanet = (angleATPlanet + wCarrier * (70 / 20) * dt) % (Math.PI * 2);
        } else if (atActiveGear === "D3") {
          // Direct 1:1
          angleATCarrier = (angleATCarrier + wSun * dt) % (Math.PI * 2);
          angleATRing = (angleATRing + wSun * dt) % (Math.PI * 2);
        } else if (atActiveGear === "D4") {
          // Sun fixed, Carrier input, Ring output
          const wRing = wSun / 0.70;
          angleATRing = (angleATRing + wRing * dt) % (Math.PI * 2);
          angleATCarrier = (angleATCarrier + wSun * dt) % (Math.PI * 2);
        }
      } else if (transmissionMode === "cvt") {
        angleCVTPrimary = (angleCVTPrimary + inputRadPerSec * dt) % (Math.PI * 2);
        const secRadPerSec = inputRadPerSec / cvtRatio;
        angleCVTSecondary = (angleCVTSecondary + secRadPerSec * dt) % (Math.PI * 2);
        cvtBeltAnimOffset = (cvtBeltAnimOffset + inputRadPerSec * 45 * dt) % 100;

        // Auto mode smooth ratio adaptation with road speed
        if (cvtMode === "auto" && !isPaused) {
          const targetRatio = Math.max(0.55, Math.min(2.60, 2.60 - (state.roadSpeedKmh / 140) * 2.05));
          cvtRatio += (targetRatio - cvtRatio) * 0.025;
        }
      }
    }

    // Telemetry HUD DOM updates
    updateHUDTelemetry(state);

    // Render Canvas Visualizations
    drawTransmission(state);
    drawMultiplierChart(state);
    drawMeshZoomView(state);

    if (isRunning) {
      animId = requestAnimationFrame(tick);
    }
  }

  function updateManualCollars(dt) {
    const rate = 8.0 * dt;
    const target12 = currentGearMT === "1" ? 1.0 : (currentGearMT === "2" ? -1.0 : 0.0);
    const target34 = currentGearMT === "3" ? 1.0 : (currentGearMT === "4" ? -1.0 : 0.0);
    const target5R = currentGearMT === "5" ? -1.0 : (currentGearMT === "R" ? 1.0 : 0.0);
    collar12Pos += (target12 - collar12Pos) * rate;
    collar34Pos += (target34 - collar34Pos) * rate;
    collar5RPos += (target5R - collar5RPos) * rate;
  }

  function updateHUDTelemetry(state) {
    const gearBadge = container.querySelector("#gear-status-badge");
    const gearDot = container.querySelector("#gear-status-dot");
    const gearName = container.querySelector("#gear-status-name");
    const clutchText = container.querySelector("#clutch-status-text");

    if (gearBadge && gearDot && gearName) {
      gearBadge.style.borderColor = state.spec.color || "#38bdf8";
      gearDot.style.background = state.spec.color || "#38bdf8";
      gearName.innerText = `ACTIVE: ${state.spec.name} (Ratio: ${Math.abs(state.currentRatioVal).toFixed(2)} : 1)`;
    }

    if (clutchText) {
      if (transmissionMode === "manual") {
        clutchText.innerText = clutchDepressedPct === 0 ? "ENGAGED (0%)" : `${clutchDepressedPct}% (SLIP)`;
      } else if (transmissionMode === "dsg") {
        clutchText.innerText = `K1: ${(k1Pressure * 100).toFixed(0)}% | K2: ${(k2Pressure * 100).toFixed(0)}%`;
      } else if (transmissionMode === "automatic") {
        clutchText.innerText = tccIsLocked ? "TCC LOCKED (1:1)" : `SLIP (${tcCurrentMultiplier.toFixed(2)}x)`;
      } else if (transmissionMode === "cvt") {
        clutchText.innerText = "HYDRAULIC CLAMP";
      }
    }

    container.querySelector("#hud-gear-in-rpm").innerText = `${engineRpm} RPM`;
    container.querySelector("#hud-gear-out-rpm").innerText = `${Math.abs(Math.round(state.outputShaftRpm))} RPM`;
    container.querySelector("#hud-gear-out-torque").innerText = `${Math.round(state.outputTorqueNm)} N·m`;
    container.querySelector("#hud-gear-road-speed").innerText = `${state.roadSpeedKmh.toFixed(1)} km/h`;
    container.querySelector("#lbl-gear-ma").innerText = `MA = ${state.mechanicalAdvantage.toFixed(2)}x`;
  }

  // -------------------------------------------------------------
  // Dynamic Right-Column Panel Switcher
  // -------------------------------------------------------------
  function renderModeInteractivePanel() {
    const panel = container.querySelector("#trans-mode-interactive-panel");
    const microTitle = container.querySelector("#lbl-micro-title");
    if (!panel) return;

    if (transmissionMode === "manual") {
      if (microTitle) microTitle.innerText = "Involute Tooth Mesh & Contact Mechanics";
      panel.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="font-size: 0.82rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
            <span>🕹️</span> 5-Speed + Reverse H-Gate Shifter
          </span>
          <span style="font-family: var(--font-mono); font-size: 0.76rem; color: #f59e0b; font-weight: 700;">
            Ratio: ${GEAR_SPECS_MT[currentGearMT]?.ratio || 0} : 1
          </span>
        </div>

        <!-- H-Gate Shifter Graphic -->
        <div style="display: flex; justify-content: center; align-items: center; padding: 10px 0;">
          <div style="position: relative; width: 200px; height: 130px; background: rgba(0,0,0,0.5); border: 2px solid #334155; border-radius: 12px; padding: 10px;">
            <div style="position: absolute; top: 60px; left: 30px; right: 30px; height: 10px; background: #1e293b; border-radius: 5px;"></div>
            <div style="position: absolute; top: 20px; left: 30px; width: 10px; height: 90px; background: #1e293b; border-radius: 5px;"></div>
            <div style="position: absolute; top: 20px; left: 95px; width: 10px; height: 90px; background: #1e293b; border-radius: 5px;"></div>
            <div style="position: absolute; top: 20px; right: 30px; width: 10px; height: 90px; background: #1e293b; border-radius: 5px;"></div>

            <button class="shifter-gate-btn" data-gear="1" style="position: absolute; top: 12px; left: 18px; width: 34px; height: 34px; border-radius: 50%; background: #0f172a; border: 2px solid #38bdf8; color: #38bdf8; font-weight: 800; font-size: 0.85rem; cursor: pointer;">1</button>
            <button class="shifter-gate-btn" data-gear="2" style="position: absolute; bottom: 12px; left: 18px; width: 34px; height: 34px; border-radius: 50%; background: #0f172a; border: 2px solid #38bdf8; color: #38bdf8; font-weight: 800; font-size: 0.85rem; cursor: pointer;">2</button>
            <button class="shifter-gate-btn" data-gear="3" style="position: absolute; top: 12px; left: 83px; width: 34px; height: 34px; border-radius: 50%; background: #0f172a; border: 2px solid #10b981; color: #10b981; font-weight: 800; font-size: 0.85rem; cursor: pointer;">3</button>
            <button class="shifter-gate-btn" data-gear="4" style="position: absolute; bottom: 12px; left: 83px; width: 34px; height: 34px; border-radius: 50%; background: #0f172a; border: 2px solid #f59e0b; color: #f59e0b; font-weight: 800; font-size: 0.85rem; cursor: pointer;">4</button>
            <button class="shifter-gate-btn" data-gear="5" style="position: absolute; top: 12px; right: 18px; width: 34px; height: 34px; border-radius: 50%; background: #0f172a; border: 2px solid #a855f7; color: #a855f7; font-weight: 800; font-size: 0.85rem; cursor: pointer;">5</button>
            <button class="shifter-gate-btn" data-gear="R" style="position: absolute; bottom: 12px; right: 18px; width: 34px; height: 34px; border-radius: 50%; background: #0f172a; border: 2px solid #ef4444; color: #ef4444; font-weight: 800; font-size: 0.85rem; cursor: pointer;">R</button>
            <button class="shifter-gate-btn" data-gear="N" style="position: absolute; top: 48px; left: 83px; width: 34px; height: 34px; border-radius: 50%; background: #334155; border: 2px solid #94a3b8; color: #f1f5f9; font-weight: 800; font-size: 0.85rem; cursor: pointer;">N</button>
          </div>
        </div>

        <!-- Clutch Pedal Slider -->
        <div style="margin-top: 12px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.74rem; color: #94a3b8; margin-bottom: 4px;">
            <span>Clutch Pedal Position</span>
            <span id="lbl-clutch-pos" style="color: #10b981; font-weight: 700;">${clutchDepressedPct}% (${clutchDepressedPct === 0 ? "Engaged" : "Slip"})</span>
          </div>
          <input type="range" id="slider-gear-clutch" min="0" max="100" step="5" value="${clutchDepressedPct}" style="width: 100%; accent-color: #10b981;">
          <div style="display: flex; justify-content: space-between; margin-top: 8px;">
            <button class="btn btn-secondary btn-sm" id="btn-gear-clutch-toggle" style="padding: 4px 10px; font-size: 0.72rem; border-color: #0284c7; color: #38bdf8;">
              ${clutchDepressedPct === 0 ? "🦶 Depress Clutch" : "👟 Release Clutch"}
            </button>
            <span style="font-size: 0.70rem; color: #64748b; align-self: center;">Hotkey: Space / C</span>
          </div>
        </div>
      `;

      // Wire MT Shifter & Clutch
      panel.querySelectorAll(".shifter-gate-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const g = btn.dataset.gear;
          if (clutchDepressedPct < 30 && g !== "N" && g !== currentGearMT) {
            gearGrindAlertTime = performance.now();
            const alertEl = container.querySelector("#gear-grind-alert");
            if (alertEl) alertEl.style.display = "block";
            SoundFX.playGlassBreak?.() || SoundFX.playScorePip();
          } else {
            SoundFX.playClick();
          }
          currentGearMT = g;
          renderModeInteractivePanel();
        });
      });

      const clutchSlider = panel.querySelector("#slider-gear-clutch");
      clutchSlider?.addEventListener("input", (e) => {
        clutchDepressedPct = parseInt(e.target.value, 10);
        const lbl = panel.querySelector("#lbl-clutch-pos");
        if (lbl) lbl.innerText = `${clutchDepressedPct}% (${clutchDepressedPct === 0 ? "Engaged" : "Slip"})`;
      });

      panel.querySelector("#btn-gear-clutch-toggle")?.addEventListener("click", () => {
        clutchDepressedPct = clutchDepressedPct === 0 ? 100 : 0;
        renderModeInteractivePanel();
        SoundFX.playClick();
      });

    } else if (transmissionMode === "dsg") {
      if (microTitle) microTitle.innerText = "Wet Dual-Clutch Packs & Mechatronic TCU";
      panel.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="font-size: 0.82rem; font-weight: 700; color: #06b6d4; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
            <span>⚡</span> Dual-Clutch (DSG) Mechatronic Console
          </span>
          <span style="font-family: var(--font-mono); font-size: 0.76rem; color: #38bdf8; font-weight: 700;">
            6-Speed Direct-Shift
          </span>
        </div>

        <!-- Steering Wheel Paddle Shifters -->
        <div style="display: flex; justify-content: space-around; align-items: center; padding: 12px 6px; background: rgba(0,0,0,0.4); border-radius: 10px; margin-bottom: 12px;">
          <button id="btn-dsg-paddle-down" class="btn" style="background: linear-gradient(135deg, #0284c7, #0369a1); color: #fff; font-weight: 800; font-size: 0.82rem; padding: 10px 16px; border-radius: 8px; border: 1px solid #38bdf8; cursor: pointer;">
            ◀ Downshift [-]
          </button>
          <div style="text-align: center;">
            <div style="font-size: 1.4rem; font-weight: 900; color: #38bdf8; font-family: var(--font-mono);">${currentGearDSG}</div>
            <div style="font-size: 0.68rem; color: #94a3b8;">ACTIVE GEAR</div>
          </div>
          <button id="btn-dsg-paddle-up" class="btn" style="background: linear-gradient(135deg, #10b981, #059669); color: #fff; font-weight: 800; font-size: 0.82rem; padding: 10px 16px; border-radius: 8px; border: 1px solid #34d399; cursor: pointer;">
            Upshift [+] ▶
          </button>
        </div>

        <!-- Mechatronic Pre-Selection Status Card -->
        <div style="padding: 10px; background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 8px; display: flex; flex-direction: column; gap: 6px; font-size: 0.75rem;">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #94a3b8;">Active Clutch Pack:</span>
            <span style="color: ${['1','3','5'].includes(currentGearDSG) ? '#38bdf8' : '#06b6d4'}; font-weight: 800;">
              ${['1','3','5'].includes(currentGearDSG) ? 'Clutch K1 (Solid Inner Shaft)' : 'Clutch K2 (Hollow Outer Shaft)'}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #94a3b8;">Pre-Selected (Ready):</span>
            <span style="color: #f59e0b; font-weight: 800;">Gear ${preselectedGearDSG} (${['1','3','5'].includes(preselectedGearDSG) ? 'K1' : 'K2'})</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #94a3b8;">Shift Handover Duration:</span>
            <span style="color: #10b981; font-weight: 800;">20 ms (Seamless / No Torque Hole)</span>
          </div>
        </div>
      `;

      // Wire DSG Paddle Shifters
      panel.querySelector("#btn-dsg-paddle-up")?.addEventListener("click", () => {
        const order = ["1", "2", "3", "4", "5", "6"];
        const idx = order.indexOf(currentGearDSG);
        if (idx < order.length - 1) {
          triggerDSGShift(order[idx + 1]);
        }
      });
      panel.querySelector("#btn-dsg-paddle-down")?.addEventListener("click", () => {
        const order = ["1", "2", "3", "4", "5", "6"];
        const idx = order.indexOf(currentGearDSG);
        if (idx > 0) {
          triggerDSGShift(order[idx - 1]);
        }
      });

    } else if (transmissionMode === "automatic") {
      if (microTitle) microTitle.innerText = "Hydrodynamic Torque Converter & Epicyclic Willis Train";
      panel.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="font-size: 0.82rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
            <span>⚙️</span> Automatic (Planetary + Torque Converter)
          </span>
          <span style="font-family: var(--font-mono); font-size: 0.76rem; color: #f59e0b; font-weight: 700;">
            PRNDL Console
          </span>
        </div>

        <!-- PRND Shifter Selector -->
        <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; padding: 10px; background: rgba(0,0,0,0.4); border-radius: 8px; margin-bottom: 12px;">
          ${["P", "R", "N", "D", "2", "1"].map(sel => `
            <button class="btn btn-secondary btn-sm at-sel-btn ${atSelector === sel ? 'active' : ''}" data-sel="${sel}" style="padding: 6px 2px; font-weight: 800; font-size: 0.82rem; ${atSelector === sel ? 'background: #10b981; color: #0f172a;' : ''}">
              ${sel}
            </button>
          `).join('')}
        </div>

        <!-- Torque Converter Lockup Toggle -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px;">
          <div>
            <div style="font-size: 0.74rem; font-weight: 700; color: #10b981;">Torque Converter Lockup (TCC)</div>
            <div style="font-size: 0.66rem; color: #94a3b8;">Locks impeller directly to turbine at speed</div>
          </div>
          <button id="btn-tcc-toggle" class="btn btn-sm" style="padding: 4px 10px; font-size: 0.72rem; font-weight: 700; background: ${tccIsLocked ? '#10b981' : '#334155'}; color: #fff;">
            ${tccIsLocked ? "LOCKED (100% EFF)" : "SLIP (2.1x MULT)"}
          </button>
        </div>

        <!-- Willis Planetary Matrix Status -->
        <div style="margin-top: 10px; font-size: 0.72rem; color: #94a3b8; display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
          <div style="background: rgba(0,0,0,0.3); padding: 6px; border-radius: 6px;">
            <span>Sun Gear (Z=30):</span> <strong style="color: #f59e0b;">${AT_RATIOS[atActiveGear]?.sun || 'free'}</strong>
          </div>
          <div style="background: rgba(0,0,0,0.3); padding: 6px; border-radius: 6px;">
            <span>Planet Carrier:</span> <strong style="color: #38bdf8;">${AT_RATIOS[atActiveGear]?.carrier || 'output'}</strong>
          </div>
        </div>
      `;

      panel.querySelectorAll(".at-sel-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          atSelector = btn.dataset.sel;
          if (atSelector === "D") atActiveGear = "D1";
          else if (atSelector === "2") atActiveGear = "D2";
          else if (atSelector === "1") atActiveGear = "D1";
          renderModeInteractivePanel();
          SoundFX.playClick();
        });
      });

      panel.querySelector("#btn-tcc-toggle")?.addEventListener("click", () => {
        tccIsLocked = !tccIsLocked;
        renderModeInteractivePanel();
        SoundFX.playClick();
      });

    } else if (transmissionMode === "cvt") {
      if (microTitle) microTitle.innerText = "Conical Sheave Flank & Steel Push-Belt Friction";
      panel.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="font-size: 0.82rem; font-weight: 700; color: #a855f7; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
            <span>♾️</span> Continuously Variable (CVT) Console
          </span>
          <span style="font-family: var(--font-mono); font-size: 0.76rem; color: #a855f7; font-weight: 700;">
            Infinite Stepless Ratios
          </span>
        </div>

        <!-- Mode Toggle: Stepless vs 7-Speed Step-Shift -->
        <div style="display: flex; gap: 8px; margin-bottom: 12px;">
          <button id="btn-cvt-mode-auto" class="btn btn-sm ${cvtMode === 'auto' ? 'active' : ''}" style="flex: 1; padding: 6px 4px; font-size: 0.74rem; font-weight: 700; ${cvtMode === 'auto' ? 'background: #a855f7; color: #fff;' : 'background: rgba(0,0,0,0.4); color: #94a3b8;'}">
            ⚡ Infinite Stepless (Eco/Sport)
          </button>
          <button id="btn-cvt-mode-step" class="btn btn-sm ${cvtMode === 'stepped' ? 'active' : ''}" style="flex: 1; padding: 6px 4px; font-size: 0.74rem; font-weight: 700; ${cvtMode === 'stepped' ? 'background: #a855f7; color: #fff;' : 'background: rgba(0,0,0,0.4); color: #94a3b8;'}">
            🕹️ Simulated 7-Speed
          </button>
        </div>

        <!-- Continuous Ratio Sweep Slider -->
        <div style="padding: 10px; background: rgba(0,0,0,0.4); border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.74rem; color: #94a3b8; margin-bottom: 4px;">
            <span>Conical Pulley Drive Ratio (i)</span>
            <span id="lbl-cvt-ratio" style="color: #a855f7; font-weight: 700; font-family: var(--font-mono);">${cvtRatio.toFixed(2)} : 1</span>
          </div>
          <input type="range" id="slider-cvt-ratio" min="0.55" max="2.60" step="0.05" value="${cvtRatio}" style="width: 100%; accent-color: #a855f7;">
          <div style="display: flex; justify-content: space-between; font-size: 0.66rem; color: #64748b; margin-top: 4px;">
            <span>0.55 (Deep Overdrive)</span>
            <span>1.00 (Direct)</span>
            <span>2.60 (Low / Max Torque)</span>
          </div>
        </div>
      `;

      panel.querySelector("#slider-cvt-ratio")?.addEventListener("input", (e) => {
        cvtRatio = parseFloat(e.target.value);
        cvtMode = "manual";
        const lbl = panel.querySelector("#lbl-cvt-ratio");
        if (lbl) lbl.innerText = `${cvtRatio.toFixed(2)} : 1`;
      });

      panel.querySelector("#btn-cvt-mode-auto")?.addEventListener("click", () => {
        cvtMode = "auto";
        renderModeInteractivePanel();
        SoundFX.playClick();
      });

      panel.querySelector("#btn-cvt-mode-step")?.addEventListener("click", () => {
        cvtMode = "stepped";
        cvtStepIndex = (cvtStepIndex + 1) % CVT_STEPS.length;
        cvtRatio = CVT_STEPS[cvtStepIndex];
        renderModeInteractivePanel();
        SoundFX.playClick();
      });
    }
  }

  function triggerDSGShift(newGear) {
    if (newGear === currentGearDSG) return;
    SoundFX.playClick();

    // Trigger cross-fade
    dsgShiftTimer = dsgShiftDuration;
    const oldGear = currentGearDSG;
    currentGearDSG = newGear;

    // Determine next pre-selected gear on the opposing shaft
    const order = ["1", "2", "3", "4", "5", "6"];
    const idx = order.indexOf(newGear);
    if (idx < order.length - 1) {
      preselectedGearDSG = order[idx + 1];
    } else {
      preselectedGearDSG = order[idx - 1];
    }

    renderModeInteractivePanel();
  }

  // -------------------------------------------------------------
  // Transmission Mode Switcher Button Listeners
  // -------------------------------------------------------------
  container.querySelectorAll(".trans-mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(".trans-mode-btn").forEach(b => {
        b.classList.remove("active");
        b.style.background = "transparent";
        b.style.color = "#94a3b8";
      });
      btn.classList.add("active");
      btn.style.background = "#38bdf8";
      btn.style.color = "#0f172a";

      transmissionMode = btn.dataset.mode || "manual";
      renderModeInteractivePanel();
      SoundFX.playClick();
    });
  });

  // Common Slider Listeners
  container.querySelector("#slider-gear-rpm")?.addEventListener("input", (e) => {
    engineRpm = parseInt(e.target.value, 10);
    container.querySelector("#lbl-gear-in-rpm").innerText = `${engineRpm} RPM`;
  });

  container.querySelector("#slider-gear-torque")?.addEventListener("input", (e) => {
    engineTorqueNm = parseInt(e.target.value, 10);
    container.querySelector("#lbl-gear-in-torque").innerText = `${engineTorqueNm} N·m`;
  });

  container.querySelector("#slider-gear-grade")?.addEventListener("input", (e) => {
    roadGradePct = parseInt(e.target.value, 10);
    container.querySelector("#lbl-gear-grade").innerText = `${roadGradePct}% ${roadGradePct > 0 ? "(Uphill Incline)" : (roadGradePct < 0 ? "(Downhill)" : "(Flat)")}`;
  });

  // Play / Pause Toggle Button
  const btnPlayPause = container.querySelector("#btn-gear-playpause");
  btnPlayPause?.addEventListener("click", () => {
    isPaused = !isPaused;
    btnPlayPause.innerText = isPaused ? "▶ Run Gearbox" : "⏸ Pause Gearbox";
    btnPlayPause.style.background = isPaused ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #f59e0b, #d97706)";
    btnPlayPause.style.boxShadow = isPaused ? "0 4px 12px rgba(16, 185, 129, 0.35)" : "0 4px 12px rgba(245, 158, 11, 0.35)";
    SoundFX.playClick();
  });

  // Step +15° Rotation Angle Button
  container.querySelector("#btn-gear-step")?.addEventListener("click", () => {
    isPaused = true;
    if (btnPlayPause) {
      btnPlayPause.innerText = "▶ Run Gearbox";
      btnPlayPause.style.background = "linear-gradient(135deg, #10b981, #059669)";
      btnPlayPause.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.35)";
    }
    const stepRad = (15 * Math.PI) / 180;
    inputShaftAngleMT = (inputShaftAngleMT + stepRad) % (Math.PI * 2);
    counterShaftAngleMT = (counterShaftAngleMT - stepRad * (18 / 26)) % (Math.PI * 2);
    shaftAngleDSGInner = (shaftAngleDSGInner + stepRad) % (Math.PI * 2);
    shaftAngleDSGOuter = (shaftAngleDSGOuter + stepRad) % (Math.PI * 2);
    angleATImpeller = (angleATImpeller + stepRad) % (Math.PI * 2);
    angleCVTPrimary = (angleCVTPrimary + stepRad) % (Math.PI * 2);
    cvtBeltAnimOffset = (cvtBeltAnimOffset + 15) % 100;
    SoundFX.playClick();
  });

  // 4K Photo Viewport Switcher
  const btnSim = container.querySelector("#view-mode-gear-sim");
  const btnPhoto = container.querySelector("#view-mode-gear-photo");
  const photoOverlay = container.querySelector("#gear-photo-overlay");

  btnSim?.addEventListener("click", () => {
    btnSim.classList.add("active");
    btnSim.style.background = "";
    btnPhoto?.classList.remove("active");
    if (btnPhoto) {
      btnPhoto.style.background = "transparent";
      btnPhoto.style.color = "#38bdf8";
    }
    if (photoOverlay) photoOverlay.style.display = "none";
    SoundFX.playClick();
  });

  btnPhoto?.addEventListener("click", () => {
    btnPhoto.classList.add("active");
    btnPhoto.style.background = "";
    btnPhoto.style.color = "#ffffff";
    btnSim?.classList.remove("active");
    if (btnSim) btnSim.style.background = "transparent";
    if (photoOverlay) photoOverlay.style.display = "block";
    SoundFX.playClick();
  });

  // CSV Telemetry Exporter
  container.querySelector("#btn-gear-export")?.addEventListener("click", () => {
    const currentState = calculateTransmissionState();
    exportLabDataCsv({
      title: "Automotive Transmission Mechanics Telemetry",
      labId: "manual-gearbox",
      parameters: {
        "Transmission Mode": transmissionMode.toUpperCase(),
        "Engine RPM": engineRpm,
        "Engine Torque (N*m)": engineTorqueNm,
        "Active Gear / Ratio": `${currentState.spec.name} (${currentState.currentRatioVal.toFixed(2)})`,
        "Road Speed (km/h)": currentState.roadSpeedKmh.toFixed(1)
      },
      headers: ["Parameter", "Value", "Unit"],
      dataRows: [
        ["Mode", transmissionMode.toUpperCase(), "-"],
        ["Engine Input Speed", engineRpm, "RPM"],
        ["Transmission Output Speed", currentState.outputShaftRpm.toFixed(1), "RPM"],
        ["Input Torque", engineTorqueNm, "N*m"],
        ["Output Torque", currentState.outputTorqueNm.toFixed(1), "N*m"],
        ["Mechanical Advantage", currentState.mechanicalAdvantage.toFixed(2), "x"],
        ["Vehicle Road Speed", currentState.roadSpeedKmh.toFixed(1), "km/h"]
      ]
    });
  });

  // Keyboard Shortcuts
  const handleKeyDown = (e) => {
    if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;
    if (e.key === "e" || e.key === "E") {
      e.preventDefault();
      container.querySelector("#btn-gear-export")?.click();
    } else if (e.key === "p" || e.key === "P") {
      e.preventDefault();
      container.querySelector("#btn-gear-playpause")?.click();
    } else if (e.key === " ") {
      e.preventDefault();
      if (transmissionMode === "manual") {
        clutchDepressedPct = clutchDepressedPct === 0 ? 100 : 0;
        renderModeInteractivePanel();
      }
    } else if (e.key === "[" && transmissionMode === "dsg") {
      container.querySelector("#btn-dsg-paddle-down")?.click();
    } else if (e.key === "]" && transmissionMode === "dsg") {
      container.querySelector("#btn-dsg-paddle-up")?.click();
    }
  };
  window.addEventListener("keydown", handleKeyDown);

  // Initialize Right Column Console
  renderModeInteractivePanel();

  // Mount Assessment Checkpoint Questions
  mountLabCheckpoint("manual-gearbox-checkpoint-container", "manual-gearbox");

  // Launch Simulation Loop
  lastTimestamp = performance.now();
  animId = requestAnimationFrame(tick);

  // Cleanup Teardown Function
  return () => {
    isRunning = false;
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("resize", resizeCanvases);
    window.removeEventListener("keydown", handleKeyDown);
  };
}
