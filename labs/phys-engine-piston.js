// Edugates-ClipSAT Science Labs - Physics: Four-Stroke Engine Piston & Otto Cycle Suite
// High-Precision 60 FPS Thermodynamics & Mechanical Kinematics Simulation:
// Piston Slider-Crank Kinematics x(θ), Thermodynamic PV Indicator Diagram,
// Four Stroke Stages (Intake, Compression, Combustion/Power, Exhaust),
// Otto Cycle Thermal Efficiency η = 1 - (1/r^(γ-1)), Indicated Work W_net = ∮ P dV, Engine Torque,
// and Photorealistic Dual-Overhead-Cam (DOHC) Cutaway with Responsive Multi-Harmonic Exhaust Acoustics.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initEnginePistonLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Engine Geometry & Physical Constants (Bore x Stroke = 85mm x 88mm, ~499 cc displacement)
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

  // Fuel Chemistry & Combustion Characteristics
  const FUELS = {
    regular: { name: "Regular Gasoline (87 Octane)", qLhv: 44.0e6, flameSpeed: 0.42, color: "#38bdf8", maxSafeComp: 10.5 },
    premium: { name: "Premium Gasoline (93 Octane)", qLhv: 44.5e6, flameSpeed: 0.45, color: "#a855f7", maxSafeComp: 12.0 },
    e85: { name: "E85 Bio-Ethanol (105 Octane)", qLhv: 29.2e6, flameSpeed: 0.52, color: "#10b981", maxSafeComp: 13.5 },
    racing: { name: "Methanol Racing Fuel", qLhv: 20.0e6, flameSpeed: 0.65, color: "#f59e0b", maxSafeComp: 14.5 }
  };

  // State Variables
  let baseRpm = 1800; // User target RPM on slider
  let currentRpm = 1800; // Physically smoothed RPM with flywheel inertia
  let compRatio = 9.5; // Compression ratio r = V_max / V_min (7.0 to 14.0)
  let throttlePct = 85; // Throttle percentage (20% to 100%)
  let baseThrottlePct = 85;
  let isRevving = false; // Whether user is holding down gas pedal
  let selectedFuelKey = "regular";
  let soundProfileKey = "inline4"; // "inline4", "thumper", "v8"
  let isRunning = true;
  let isPaused = false;
  let isEngineStarted = true; // Ignition switch state
  let timeScale = 1.0; // Playback speed multiplier (0.2, 0.5, 1.0)
  let crankAngleDeg = 0.0; // 0° to 720° for 4-stroke cycle
  let animId = null;
  let lastTimestamp = performance.now();
  let sparkIntensity = 0.0; // Visual spark plug plasma flash (0.0 to 1.0)
  let prevStrokeId = 1;
  let overrunTimer = 0; // Deceleration exhaust pops

  // Audio Engine State
  let audioEngineActive = false;
  let audioMasterGainVal = 0.25;
  let audioCtx = null;
  let masterGain = null;
  let limiter = null;
  let exhaustFilter = null;
  let waveShaper = null;
  let oscCrank = null;
  let oscFire = null;
  let oscSub = null;
  let oscRasp = null;
  let gainExhaust = null;
  let gainRasp = null;
  let noiseNode = null;
  let noiseFilter = null;
  let gainInduction = null;
  let valvetrainOsc = null;
  let valvetrainGain = null;
  let compressor = null;
  let isRevLimiterActive = false;

  // Real Multi-Phase Fluid & Gas Simulation State:
  // 1. Liquids:
  //    - High-Pressure Fuel Spray Micro-Droplets & Wall Wetting
  //    - Active Crankcase Oil Sump Wave Surface (Multi-Harmonic Fourier Heightfield)
  //    - Crankshaft Splash Lubrication Droplets
  //    - Pressurized Internal Oil Gallery Beads
  //    - Cylinder Wall Lubricating Oil Film Sheen & Ring Scraping
  //    - Circulating Liquid Coolant Convection Streamlines & Micro-Bubbles
  // 2. Smoke & Gas:
  //    - Volumetric Billowing Exhaust Vortex Clouds (Expansion, Swirl, Soot Dissipation)
  //    - High-RPM & Overrun Exhaust Manifold Flame Tongues & Glowing Embers
  //    - Crankcase Blow-by Oil Vapor Mist & Tumble Swirl
  const chamberParticles = [];
  const exhaustSmokePuffs = [];
  const exhaustFlameSparks = [];
  const fuelSprayDroplets = [];
  const oilSplashDroplets = [];
  const oilGalleryBeads = [];
  const coolantParticles = [];
  const crankcaseMistPuffs = [];

  // Oil Sump Dynamic Wave Field (30 discrete fluid surface height points)
  const oilWaveCount = 30;
  const oilWaveHeights = new Float32Array(oilWaveCount);
  const oilWaveVelocities = new Float32Array(oilWaveCount);

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.94); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.4);">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <span style="font-size: 0.88rem; font-weight: 800; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.06em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #f59e0b; box-shadow: 0 0 12px #f59e0b; animation: pulseGlow 1.5s infinite alternate;"></span>
            Internal Combustion Engine &amp; Otto Thermodynamics
          </span>
          <span class="badge" style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.35); color: #fbbf24; font-size: 0.76rem; padding: 4px 10px; border-radius: 9999px;">
            ${renderLatex("\\eta_{\\text{Otto}} = 1 - \\frac{1}{r^{\\gamma-1}} \\quad \\bullet \\quad W_{\\text{net}} = \\oint P\\,dV \\quad \\bullet \\quad P_{\\text{ind}} = \\frac{W_{\\text{net}} \\cdot \\text{RPM}}{120}")}
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.5); border-radius: 8px; padding: 3px; border: 1px solid rgba(255,255,255,0.1);">
            <button id="view-mode-piston-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Engine Cutaway
            </button>
            <button id="view-mode-piston-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-piston-ignition" title="Turn Engine Ignition On / Off" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-color: rgba(239, 68, 68, 0.4); color: #ef4444;">
            🔑 Key: ON
          </button>
          <button class="btn btn-primary btn-sm" id="btn-piston-playpause" style="padding: 5px 14px; font-size: 0.78rem; background: linear-gradient(135deg, #f59e0b, #d97706); border: none; font-weight: 700; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.35);">
            ⏸ Pause Engine
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-piston-step" title="Advance Crankshaft by +15°" style="padding: 5px 12px; font-size: 0.78rem;">
            ↷ Step +15°
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-piston-audio" title="Toggle High-Fidelity Synthesized Exhaust Acoustics" style="padding: 5px 12px; font-size: 0.78rem; color: #38bdf8; border-color: rgba(56, 189, 248, 0.4);">
            🔊 Audio: Off
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-piston-export" title="Export thermodynamic PV telemetry to CSV (Hotkey: E)" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export CSV (E)
          </button>
        </div>
      </div>

      <!-- Main Layout: 2-Column Split (Engine Cylinder Cross-Section & PV Indicator Diagram) -->
      <div style="display: grid; grid-template-columns: 1.18fr 1fr; gap: 20px;" class="piston-layout">
        <!-- Left Column: 60 FPS Photorealistic Animated Cutaway Engine Canvas -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(245, 158, 11, 0.4); box-shadow: 0 20px 50px -15px rgba(0,0,0,0.9); background: radial-gradient(circle at center, #1a160d 0%, #030712 100%); border-radius: 14px; overflow: hidden; height: 580px;">
          <canvas id="piston-engine-canvas" width="640" height="580" style="height: 580px; width: 100%; display: block;"></canvas>

          <!-- Top Stroke Stage & Crank Angle HUD Overlay -->
          <div style="position: absolute; top: 14px; left: 14px; right: 14px; display: flex; justify-content: space-between; align-items: center; pointer-events: none; z-index: 2;">
            <div id="piston-stroke-badge" style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(8px); border: 1.5px solid #38bdf8; padding: 6px 14px; border-radius: 8px; font-weight: 800; font-size: 0.85rem; color: #38bdf8; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.6);">
              <span id="piston-stroke-dot" style="width: 10px; height: 10px; border-radius: 50%; background: #38bdf8; display: inline-block;"></span>
              <span id="piston-stroke-name">1. INTAKE STROKE (0° - 180°)</span>
            </div>
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.15); padding: 6px 12px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.82rem; color: #94a3b8; display: flex; align-items: center; gap: 8px;">
              <span>Crank:</span>
              <span id="piston-crank-angle-text" style="color: #38bdf8; font-weight: 700;">0.0°</span> / 720°
            </div>
          </div>

          <!-- Interactive Rev Pedal (On-Screen Touch & Click Trigger) -->
          <div style="position: absolute; bottom: 84px; right: 16px; z-index: 3;">
            <button id="btn-piston-gas-pedal" class="btn" style="background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); color: #fff; font-weight: 900; font-size: 0.82rem; padding: 12px 18px; border-radius: 12px; border: 2px solid #fca5a5; box-shadow: 0 8px 24px rgba(239, 68, 68, 0.5); display: flex; flex-direction: column; align-items: center; gap: 2px; cursor: pointer; user-select: none; transition: transform 0.08s ease, box-shadow 0.08s ease;">
              <span style="font-size: 1.15rem; line-height: 1;">🏎️ GAS PEDAL</span>
              <span style="font-size: 0.65rem; opacity: 0.9; font-weight: 600; letter-spacing: 0.04em;">[HOLD / SPACE / R]</span>
            </button>
          </div>

          <!-- Bottom Engine Status Telemetry HUD Overlay -->
          <div style="position: absolute; bottom: 12px; left: 14px; right: 14px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(12px); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 10px; padding: 10px 14px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; pointer-events: none; z-index: 2;">
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Chamber Pressure (P)</div>
              <div id="hud-pressure" style="font-size: 0.95rem; font-weight: 800; color: #f59e0b; font-family: var(--font-mono);">101.3 kPa</div>
            </div>
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Gas Temperature (T)</div>
              <div id="hud-temperature" style="font-size: 0.95rem; font-weight: 800; color: #ef4444; font-family: var(--font-mono);">25.0 °C</div>
            </div>
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Cylinder Volume (V)</div>
              <div id="hud-volume" style="font-size: 0.95rem; font-weight: 800; color: #38bdf8; font-family: var(--font-mono);">557 cc</div>
            </div>
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Piston Linear Speed</div>
              <div id="hud-piston-speed" style="font-size: 0.95rem; font-weight: 800; color: #10b981; font-family: var(--font-mono);">0.0 m/s</div>
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
          <div style="background: rgba(15, 23, 42, 0.88); border: 1px solid rgba(56, 189, 248, 0.35); border-radius: 12px; padding: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.82rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
                <span>📈</span> PV Indicator Diagram (Otto Cycle)
              </span>
              <span id="lbl-pv-loop-work" style="font-family: var(--font-mono); font-size: 0.76rem; color: #10b981; font-weight: 700;">
                W_net = 0.0 J
              </span>
            </div>
            <canvas id="piston-pv-canvas" width="480" height="215" style="width: 100%; height: 205px; display: block; border-radius: 8px; background: #030712;"></canvas>
          </div>

          <!-- Stroke Navigation Quick-Jump Pills -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
            <button class="btn btn-secondary btn-sm stroke-jump-btn" data-target-angle="90" style="padding: 6px 4px; font-size: 0.72rem; font-weight: 700; border-color: rgba(56, 189, 248, 0.35); color: #38bdf8;">
              1. Intake
            </button>
            <button class="btn btn-secondary btn-sm stroke-jump-btn" data-target-angle="270" style="padding: 6px 4px; font-size: 0.72rem; font-weight: 700; border-color: rgba(245, 158, 11, 0.35); color: #f59e0b;">
              2. Compression
            </button>
            <button class="btn btn-secondary btn-sm stroke-jump-btn" data-target-angle="400" style="padding: 6px 4px; font-size: 0.72rem; font-weight: 700; border-color: rgba(239, 68, 68, 0.35); color: #ef4444;">
              3. Power
            </button>
            <button class="btn btn-secondary btn-sm stroke-jump-btn" data-target-angle="630" style="padding: 6px 4px; font-size: 0.72rem; font-weight: 700; border-color: rgba(148, 163, 184, 0.35); color: #94a3b8;">
              4. Exhaust
            </button>
          </div>

          <!-- Interactive Controls Dashboard -->
          <div style="background: rgba(15, 23, 42, 0.88); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 12px;">
            <!-- Engine RPM & Playback Speed -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #94a3b8; margin-bottom: 4px;">
                  <span>Engine Speed (RPM)</span>
                  <span id="lbl-piston-rpm" style="color: #f59e0b; font-weight: 700; font-family: var(--font-mono);">1800 RPM</span>
                </div>
                <input type="range" id="slider-piston-rpm" min="600" max="6800" step="100" value="1800" style="width: 100%; accent-color: #f59e0b;">
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
                <input type="range" id="slider-piston-throttle" min="15" max="100" step="5" value="85" style="width: 100%; accent-color: #ef4444;">
              </div>
            </div>

            <!-- Fuel Selection & Audio Acoustic Profile -->
            <div style="display: grid; grid-template-columns: 1.1fr 1fr; gap: 12px;">
              <div>
                <label for="select-piston-fuel" style="font-size: 0.73rem; color: #94a3b8; display: block; margin-bottom: 4px;">Fuel Mixture &amp; Octane</label>
                <select id="select-piston-fuel" style="width: 100%; background: #0f172a; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #f1f5f9; padding: 6px 8px; font-size: 0.76rem;">
                  <option value="regular">Regular 87 Octane - Economy</option>
                  <option value="premium">Premium 93 Octane - High Comp</option>
                  <option value="e85">E85 Bio-Ethanol - High Cooling</option>
                  <option value="racing">Methanol Racing - Extreme Boost</option>
                </select>
              </div>

              <div>
                <label for="select-piston-sound" style="font-size: 0.73rem; color: #94a3b8; display: block; margin-bottom: 4px;">Exhaust Sound Engine</label>
                <select id="select-piston-sound" style="width: 100%; background: #0f172a; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #f1f5f9; padding: 6px 8px; font-size: 0.76rem;">
                  <option value="inline4">🏎️ Inline-4 Sport DOHC</option>
                  <option value="thumper">🏍️ Single-Cylinder Thumper</option>
                  <option value="v8">🏁 V8 Crossplane Muscle</option>
                  <option value="v10">⚡ High-Rev V10 Supercar</option>
                </select>
              </div>
            </div>

            <!-- Volume Control Slider -->
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 0.72rem; color: #94a3b8; white-space: nowrap;">🔊 Volume:</span>
              <input type="range" id="slider-piston-volume" min="0" max="100" step="5" value="65" style="width: 100%; accent-color: #38bdf8;">
              <span id="lbl-piston-volume" style="font-size: 0.75rem; color: #38bdf8; font-family: var(--font-mono); width: 36px; text-align: right;">65%</span>
            </div>
          </div>

          <!-- Analytical Performance Telemetry Cards -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
            <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 8px; padding: 8px 10px; text-align: center;">
              <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase;">Otto Efficiency (η)</div>
              <div id="calc-otto-eff" style="font-size: 1.05rem; font-weight: 800; color: #f59e0b; font-family: var(--font-mono);">59.4%</div>
            </div>
            <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 8px; padding: 8px 10px; text-align: center;">
              <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase;">Indicated Power</div>
              <div id="calc-power" style="font-size: 1.05rem; font-weight: 800; color: #10b981; font-family: var(--font-mono);">18.2 kW</div>
            </div>
            <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 8px; padding: 8px 10px; text-align: center;">
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
    const wEng = engineCanvas.clientWidth || 640;
    const hEng = engineCanvas.clientHeight || 580;
    engineCanvas.width = Math.round(wEng * dpr);
    engineCanvas.height = Math.round(hEng * dpr);
    if (engineCtx && engineCtx.setTransform) {
      engineCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const wPv = pvCanvas.clientWidth || 480;
    const hPv = pvCanvas.clientHeight || 215;
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
    const omegaCrank = (2 * Math.PI * currentRpm) / 60; // rad/s
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

      // Trigger spark at ~356° - 374°
      if (angleDeg >= 356 && angleDeg <= 374) {
        sparkIntensity = 1.0 - Math.abs(angleDeg - 360) / 14;
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
    const powerKw = (wNetJ * (currentRpm / 120)) / 1000;
    // Torque (N*m) = Power (W) / omega_crank
    const torqueNm = omegaCrank > 0 ? (powerKw * 1000) / omegaCrank : 0;

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

  // Draw 60 FPS Photorealistic Cutaway Cylinder Engine
  function drawEngine(state) {
    if (!engineCtx || !engineCanvas) return;
    const w = engineCanvas.clientWidth || 640;
    const h = engineCanvas.clientHeight || 580;

    engineCtx.clearRect(0, 0, w, h);

    // Coordinate Centerings
    const centerX = w * 0.48;
    const cylinderTopY = 105;
    const cylinderBottomY = 330;
    const cylinderWidth = 180;
    const crankCenterY = 470;

    // 1. Subtle Precision Engineering Grid in Background
    engineCtx.save();
    engineCtx.strokeStyle = "rgba(255, 255, 255, 0.035)";
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
    engineCtx.restore();

    // 2. Heavy Engine Block Outer Casting (Cast Aluminum Dark Metallic)
    engineCtx.save();
    engineCtx.fillStyle = "#1e293b";
    engineCtx.strokeStyle = "#334155";
    engineCtx.lineWidth = 2;
    engineCtx.beginPath();
    engineCtx.moveTo(centerX - cylinderWidth / 2 - 45, cylinderTopY - 70);
    engineCtx.lineTo(centerX + cylinderWidth / 2 + 45, cylinderTopY - 70);
    engineCtx.lineTo(centerX + cylinderWidth / 2 + 45, cylinderBottomY + 130);
    engineCtx.lineTo(centerX - cylinderWidth / 2 - 45, cylinderBottomY + 130);
    engineCtx.closePath();
    engineCtx.fill();
    engineCtx.stroke();

    // 2b. High-Performance Liquid Coolant Passages (Active Convection Streamlines & Thermal Dissipation)
    const coolantY = cylinderTopY + 16;
    const coolantH = cylinderBottomY - cylinderTopY - 32;
    const coolantTime = performance.now() * 0.0025;
    const pumpSpeed = 0.8 + (currentRpm / 6000) * 3.2; // Mechanical water pump impeller rate
    const thermalLoad = Math.min(1.0, Math.max(0, (state.tempK - 300) / 1200));

    // Left & Right Coolant Water Jacket Channels
    const jacketChannels = [
      { x: centerX - cylinderWidth / 2 - 29, w: 20, dir: -1 }, // Left channel (flow upward near bore)
      { x: centerX + cylinderWidth / 2 + 9, w: 20, dir: 1 }    // Right channel
    ];

    jacketChannels.forEach((jk) => {
      engineCtx.save();
      // Fluid base gradient: neon cyan (cool inlet) to radiant turquoise/emerald-gold (heated outlet)
      const jkGrad = engineCtx.createLinearGradient(0, coolantY + coolantH, 0, coolantY);
      jkGrad.addColorStop(0, "rgba(6, 182, 212, 0.65)");
      jkGrad.addColorStop(0.55, `rgba(14, 165, 233, ${0.7 + 0.15 * thermalLoad})`);
      jkGrad.addColorStop(1, `rgba(${Math.round(20 + 200 * thermalLoad)}, ${Math.round(220 - 40 * thermalLoad)}, ${Math.round(200 - 80 * thermalLoad)}, 0.85)`);

      engineCtx.fillStyle = jkGrad;
      engineCtx.beginPath();
      engineCtx.roundRect(jk.x, coolantY, jk.w, coolantH, 4);
      engineCtx.fill();
      engineCtx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      engineCtx.lineWidth = 1.2;
      engineCtx.stroke();

      // Liquid Convection Streamlines (Smooth undulating fluid flow paths)
      engineCtx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      engineCtx.lineWidth = 1.2;
      engineCtx.beginPath();
      const wavePhase = coolantTime * pumpSpeed * 4 * jk.dir;
      const midX = jk.x + jk.w / 2;
      for (let sy = 0; sy <= coolantH; sy += 8) {
        const py = coolantY + sy;
        const px = midX + Math.sin(sy * 0.08 + wavePhase) * 4;
        if (sy === 0) engineCtx.moveTo(px, py);
        else engineCtx.lineTo(px, py);
      }
      engineCtx.stroke();

      // Fluid Flow Velocity Arrows (Spigots)
      const arrowY = coolantY + ((coolantTime * 45 * pumpSpeed) % coolantH);
      engineCtx.fillStyle = "rgba(255, 255, 255, 0.85)";
      engineCtx.beginPath();
      engineCtx.moveTo(midX, arrowY - 4 * jk.dir);
      engineCtx.lineTo(midX - 3.5, arrowY + 3 * jk.dir);
      engineCtx.lineTo(midX + 3.5, arrowY + 3 * jk.dir);
      engineCtx.closePath();
      engineCtx.fill();
      engineCtx.restore();
    });

    // Circulating Coolant Micro-Bubbles (Spawn & Animate in Water Jacket)
    if (coolantParticles.length < 18 && Math.random() < 0.35) {
      const isLeft = Math.random() < 0.5;
      const baseChannel = isLeft ? jacketChannels[0] : jacketChannels[1];
      coolantParticles.push({
        x: baseChannel.x + 3 + Math.random() * (baseChannel.w - 6),
        y: isLeft ? (coolantY + coolantH - 2) : (coolantY + 2),
        vy: isLeft ? (-Math.random() * 1.6 - 0.8) * pumpSpeed : (Math.random() * 1.6 + 0.8) * pumpSpeed,
        radius: Math.random() * 1.8 + 1.0,
        alpha: Math.random() * 0.5 + 0.4
      });
    }
    for (let i = coolantParticles.length - 1; i >= 0; i--) {
      const cb = coolantParticles[i];
      cb.y += cb.vy;
      if (cb.y < coolantY || cb.y > coolantY + coolantH) {
        coolantParticles.splice(i, 1);
        continue;
      }
      engineCtx.save();
      engineCtx.fillStyle = `rgba(255, 255, 255, ${cb.alpha})`;
      engineCtx.beginPath();
      engineCtx.arc(cb.x, cb.y, cb.radius, 0, Math.PI * 2);
      engineCtx.fill();
      engineCtx.restore();
    }

    // 3. Cast Iron Cylinder Sleeve with Honed Mirror Cross-Hatch & Wet Lubricating Oil Film
    engineCtx.save();
    const sleeveGrad = engineCtx.createLinearGradient(centerX - cylinderWidth / 2, 0, centerX + cylinderWidth / 2, 0);
    sleeveGrad.addColorStop(0, "#334155");
    sleeveGrad.addColorStop(0.08, "#64748b");
    sleeveGrad.addColorStop(0.18, "#cbd5e1");
    sleeveGrad.addColorStop(0.50, "#0f172a");
    sleeveGrad.addColorStop(0.82, "#cbd5e1");
    sleeveGrad.addColorStop(0.92, "#64748b");
    sleeveGrad.addColorStop(1, "#334155");

    engineCtx.fillStyle = sleeveGrad;
    engineCtx.fillRect(centerX - cylinderWidth / 2, cylinderTopY, cylinderWidth, cylinderBottomY - cylinderTopY);

    // Cylinder Wall Honing Cross-Hatch Texture (45° microscopic abrasive diamond finish)
    engineCtx.strokeStyle = "rgba(255, 255, 255, 0.045)";
    engineCtx.lineWidth = 1;
    for (let y = cylinderTopY; y < cylinderBottomY; y += 14) {
      engineCtx.beginPath();
      engineCtx.moveTo(centerX - cylinderWidth / 2, y);
      engineCtx.lineTo(centerX - cylinderWidth / 2 + 45, y + 20);
      engineCtx.stroke();

      engineCtx.beginPath();
      engineCtx.moveTo(centerX + cylinderWidth / 2, y);
      engineCtx.lineTo(centerX + cylinderWidth / 2 - 45, y + 20);
      engineCtx.stroke();
    }

    // Dynamic Glistening Boundary Lubrication Oil Film along the Cylinder Sleeve
    const sleeveLeft = centerX - cylinderWidth / 2;
    const sleeveRight = centerX + cylinderWidth / 2;
    const oilFilmGradLeft = engineCtx.createLinearGradient(sleeveLeft, 0, sleeveLeft + 18, 0);
    oilFilmGradLeft.addColorStop(0, "rgba(245, 158, 11, 0.28)");
    oilFilmGradLeft.addColorStop(0.5, "rgba(251, 191, 36, 0.16)");
    oilFilmGradLeft.addColorStop(1, "rgba(245, 158, 11, 0)");
    engineCtx.fillStyle = oilFilmGradLeft;
    engineCtx.fillRect(sleeveLeft, cylinderTopY, 18, cylinderBottomY - cylinderTopY);

    const oilFilmGradRight = engineCtx.createLinearGradient(sleeveRight, 0, sleeveRight - 18, 0);
    oilFilmGradRight.addColorStop(0, "rgba(245, 158, 11, 0.28)");
    oilFilmGradRight.addColorStop(0.5, "rgba(251, 191, 36, 0.16)");
    oilFilmGradRight.addColorStop(1, "rgba(245, 158, 11, 0)");
    engineCtx.fillStyle = oilFilmGradRight;
    engineCtx.fillRect(sleeveRight - 18, cylinderTopY, 18, cylinderBottomY - cylinderTopY);
    engineCtx.restore();

    // 4. Piston Kinematics Positions
    const strokePixels = 100;
    const tdcPistonY = cylinderTopY + 38;
    const pistonY = tdcPistonY + (state.pistonDispM / (2 * CRANK_RADIUS_M)) * strokePixels;
    const pistonHeight = 68;

    // 5. Dynamic Gas Glow Inside Cylinder Chamber
    const chamberHeight = Math.max(10, pistonY - cylinderTopY);
    let gasFillGrad = engineCtx.createLinearGradient(centerX, cylinderTopY, centerX, pistonY);

    if (state.strokeId === 1) {
      // Intake: Cool atomized cyan air-fuel vapor
      gasFillGrad.addColorStop(0, "rgba(56, 189, 248, 0.55)");
      gasFillGrad.addColorStop(0.6, "rgba(14, 165, 233, 0.3)");
      gasFillGrad.addColorStop(1, "rgba(2, 132, 199, 0.15)");
    } else if (state.strokeId === 2) {
      // Compression: Heating amber / orange high-pressure gas
      const compRatioFrac = Math.min(1.0, (state.pressureKpa - 100) / 1400);
      gasFillGrad.addColorStop(0, `rgba(245, 158, 11, ${0.4 + 0.5 * compRatioFrac})`);
      gasFillGrad.addColorStop(0.7, `rgba(217, 119, 6, ${0.25 + 0.4 * compRatioFrac})`);
      gasFillGrad.addColorStop(1, "rgba(180, 83, 9, 0.2)");
    } else if (state.strokeId === 3) {
      // Combustion: Blinding incandescent core & violent flame front
      const flameP = Math.min(1.0, (state.pressureKpa - 100) / 3800);
      gasFillGrad.addColorStop(0, "rgba(255, 255, 255, 0.98)");
      gasFillGrad.addColorStop(0.25, `rgba(254, 240, 138, ${0.85 + 0.15 * flameP})`);
      gasFillGrad.addColorStop(0.60, `rgba(249, 115, 22, ${0.75 + 0.2 * flameP})`);
      gasFillGrad.addColorStop(1, "rgba(220, 38, 38, 0.55)");
    } else {
      // Exhaust: Turbulent dark carbon smoke & incandescent embers
      gasFillGrad.addColorStop(0, "rgba(148, 163, 184, 0.6)");
      gasFillGrad.addColorStop(0.5, "rgba(71, 85, 105, 0.45)");
      gasFillGrad.addColorStop(1, "rgba(30, 41, 59, 0.3)");
    }

    engineCtx.fillStyle = gasFillGrad;
    engineCtx.fillRect(centerX - cylinderWidth / 2 + 2, cylinderTopY, cylinderWidth - 4, chamberHeight);

    // In-Cylinder Fluid Aerodynamics & Combustion Flame Front
    if (chamberParticles.length < 50 && Math.random() < 0.7) {
      const isCombustion = state.strokeId === 3;
      chamberParticles.push({
        x: centerX + (Math.random() - 0.5) * (cylinderWidth - 20),
        y: cylinderTopY + Math.random() * chamberHeight,
        vx: (Math.random() - 0.5) * (isCombustion ? 5 : 2.5),
        vy: (Math.random() - 0.5) * (isCombustion ? 5 : 2.5),
        radius: Math.random() * (isCombustion ? 3.0 : 1.8) + 0.8,
        life: 1.0,
        color: isCombustion ? (Math.random() < 0.6 ? "#fef08a" : "#f97316") : (state.strokeId === 1 ? "#38bdf8" : "#94a3b8")
      });
    }
    for (let i = chamberParticles.length - 1; i >= 0; i--) {
      const p = chamberParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.035;
      if (p.life <= 0 || p.y > pistonY || p.y < cylinderTopY) {
        chamberParticles.splice(i, 1);
        continue;
      }
      engineCtx.save();
      engineCtx.fillStyle = p.color;
      engineCtx.globalAlpha = p.life;
      engineCtx.beginPath();
      engineCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      engineCtx.fill();
      engineCtx.restore();
    }

    // 6. Cylinder Head Top, Intake Port (Left), Exhaust Port (Right)
    // Angled Pent-Roof Combustion Chamber Ceiling
    engineCtx.save();
    engineCtx.fillStyle = "#334155";
    engineCtx.beginPath();
    engineCtx.moveTo(centerX - cylinderWidth / 2, cylinderTopY);
    engineCtx.lineTo(centerX - 45, cylinderTopY - 28);
    engineCtx.lineTo(centerX, cylinderTopY - 14);
    engineCtx.lineTo(centerX + 45, cylinderTopY - 28);
    engineCtx.lineTo(centerX + cylinderWidth / 2, cylinderTopY);
    engineCtx.closePath();
    engineCtx.fill();
    engineCtx.strokeStyle = "#64748b";
    engineCtx.lineWidth = 2;
    engineCtx.stroke();

    // Intake Port Runner (Left: Blue charge entrance with laminar flow lines)
    const intakeGrad = engineCtx.createLinearGradient(centerX - cylinderWidth / 2 - 45, cylinderTopY - 50, centerX - 30, cylinderTopY - 10);
    intakeGrad.addColorStop(0, "rgba(56, 189, 248, 0.45)");
    intakeGrad.addColorStop(0.7, "rgba(14, 165, 233, 0.25)");
    intakeGrad.addColorStop(1, "rgba(2, 132, 199, 0.1)");
    engineCtx.fillStyle = intakeGrad;
    engineCtx.beginPath();
    engineCtx.moveTo(centerX - cylinderWidth / 2 - 45, cylinderTopY - 50);
    engineCtx.quadraticCurveTo(centerX - 55, cylinderTopY - 50, centerX - 50, cylinderTopY - 12);
    engineCtx.lineTo(centerX - 26, cylinderTopY - 10);
    engineCtx.quadraticCurveTo(centerX - 42, cylinderTopY - 32, centerX - cylinderWidth / 2 - 45, cylinderTopY - 32);
    engineCtx.closePath();
    engineCtx.fill();
    engineCtx.strokeStyle = "#475569";
    engineCtx.stroke();

    // High-Pressure Fuel Injector mounted in Intake Runner
    const injBodyX = centerX - cylinderWidth / 2 - 25;
    const injTipX = centerX - cylinderWidth / 2 - 19;
    const injTipY = cylinderTopY - 32;

    engineCtx.fillStyle = "#475569";
    engineCtx.fillRect(injBodyX, cylinderTopY - 62, 13, 24);
    // Solenoid Connector Clip
    engineCtx.fillStyle = "#0284c7";
    engineCtx.fillRect(injBodyX + 2, cylinderTopY - 67, 9, 6);
    // Stainless Steel Injector Nozzle Tip
    engineCtx.fillStyle = "#e2e8f0";
    engineCtx.beginPath();
    engineCtx.moveTo(injTipX - 4, injTipY - 6);
    engineCtx.lineTo(injTipX + 4, injTipY - 6);
    engineCtx.lineTo(injTipX, injTipY);
    engineCtx.closePath();
    engineCtx.fill();

    // REAL LIQUIDS ANIMATION: High-Pressure Fuel Spray Atomization & Wall Wetting
    const isInjecting = state.strokeId === 1 && state.intakeValveOpen > 0.08;
    if (isInjecting) {
      // 1. Conical Vapor Fog Fan (Dense aerosol cloud core)
      const sprayGrad = engineCtx.createRadialGradient(
        injTipX, injTipY, 2,
        centerX - 38, cylinderTopY - 8, 48
      );
      sprayGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      sprayGrad.addColorStop(0.3, "rgba(125, 211, 252, 0.75)");
      sprayGrad.addColorStop(0.7, "rgba(56, 189, 248, 0.35)");
      sprayGrad.addColorStop(1, "rgba(56, 189, 248, 0)");
      engineCtx.fillStyle = sprayGrad;
      engineCtx.beginPath();
      engineCtx.moveTo(injTipX, injTipY);
      engineCtx.lineTo(centerX - 52, cylinderTopY - 5);
      engineCtx.lineTo(centerX - 24, cylinderTopY - 14);
      engineCtx.closePath();
      engineCtx.fill();

      // 2. Liquid Fuel Wall Wetting (Glistening fuel film along runner floor)
      engineCtx.strokeStyle = "rgba(125, 211, 252, 0.7)";
      engineCtx.lineWidth = 2.5;
      engineCtx.beginPath();
      engineCtx.moveTo(injTipX + 2, cylinderTopY - 22);
      engineCtx.quadraticCurveTo(centerX - 48, cylinderTopY - 26, centerX - 26, cylinderTopY - 10);
      engineCtx.stroke();

      // 3. High-Velocity Liquid Micro-Droplets (Atomized Spray Cone)
      const sprayAngle = 0.28; // ~16° downward angle toward valve
      for (let s = 0; s < 5; s++) {
        if (fuelSprayDroplets.length < 40) {
          const spread = (Math.random() - 0.5) * 0.45;
          const speed = 7.5 + Math.random() * 8.0;
          fuelSprayDroplets.push({
            x: injTipX,
            y: injTipY,
            vx: Math.cos(sprayAngle + spread) * speed,
            vy: Math.sin(sprayAngle + spread) * speed,
            radius: Math.random() * 1.5 + 0.8,
            life: 1.0,
            hasEnteredChamber: false
          });
        }
      }
    }

    // Animate & Render Liquid Fuel Spray Droplets
    for (let i = fuelSprayDroplets.length - 1; i >= 0; i--) {
      const fd = fuelSprayDroplets[i];
      fd.x += fd.vx;
      fd.y += fd.vy;
      fd.vx *= 0.96; // Air resistance drag
      fd.vy += 0.12; // Gravity + downward intake suction

      // Check if droplet enters cylinder chamber past the open valve
      if (fd.x > centerX - 42 && fd.y > cylinderTopY - 10) {
        fd.hasEnteredChamber = true;
        fd.vx *= 0.6; // Chamber tumble curl
        fd.vy += 0.4;
      }

      fd.life -= 0.045; // Evaporates into fuel-air mixture
      if (fd.life <= 0 || fd.y > pistonY || fd.x > centerX + cylinderWidth / 2) {
        fuelSprayDroplets.splice(i, 1);
        continue;
      }

      engineCtx.save();
      engineCtx.fillStyle = `rgba(186, 230, 253, ${fd.life * 0.9})`;
      engineCtx.beginPath();
      engineCtx.arc(fd.x, fd.y, fd.radius, 0, Math.PI * 2);
      engineCtx.fill();
      engineCtx.restore();
    }

    // Exhaust Port Runner (Right: Red hot exhaust outlet with thermal radiation)
    const exhaustHeat = (state.strokeId === 4 || state.strokeId === 3) ? 0.75 : 0.35;
    const exhaustGrad = engineCtx.createLinearGradient(centerX + 30, cylinderTopY - 10, centerX + cylinderWidth / 2 + 45, cylinderTopY - 50);
    exhaustGrad.addColorStop(0, `rgba(239, 68, 68, ${exhaustHeat * 0.6})`);
    exhaustGrad.addColorStop(0.6, `rgba(220, 38, 38, ${exhaustHeat * 0.85})`);
    exhaustGrad.addColorStop(1, `rgba(153, 27, 27, ${exhaustHeat})`);
    engineCtx.fillStyle = exhaustGrad;
    engineCtx.beginPath();
    engineCtx.moveTo(centerX + cylinderWidth / 2 + 45, cylinderTopY - 50);
    engineCtx.quadraticCurveTo(centerX + 55, cylinderTopY - 50, centerX + 50, cylinderTopY - 12);
    engineCtx.lineTo(centerX + 26, cylinderTopY - 10);
    engineCtx.quadraticCurveTo(centerX + 42, cylinderTopY - 32, centerX + cylinderWidth / 2 + 45, cylinderTopY - 32);
    engineCtx.closePath();
    engineCtx.fill();
    engineCtx.strokeStyle = "#475569";
    engineCtx.stroke();

    // REAL SMOKE ANIMATION: Volumetric Billowing Exhaust Vortex Clouds & Hot Embers
    const isExhausting = state.strokeId === 4 && state.exhaustValveOpen > 0.08;
    if (isExhausting) {
      // Spawn Rolling Vortex Smoke Billows
      if (exhaustSmokePuffs.length < 45 && Math.random() < 0.85) {
        const valveLipX = centerX + 36 + Math.random() * 16;
        const valveLipY = cylinderTopY - 14 + (state.exhaustValveOpen * 16);
        const blowSpeed = 3.2 + (currentRpm / 6000) * 4.5;
        exhaustSmokePuffs.push({
          x: valveLipX,
          y: valveLipY,
          vx: (Math.random() * 2.2 + 2.8) * (blowSpeed / 4),
          vy: (-Math.random() * 2.0 - 1.2) * (blowSpeed / 4),
          radius: Math.random() * 3.5 + 4.0,
          growthRate: 0.55 + Math.random() * 0.45,
          angle: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.09, // Vortex eddy spin
          density: 1.0,
          heat: Math.min(1.0, (state.tempK - 300) / 700) // Initial thermal incandescence
        });
      }

      // Spawn Exhaust Flame Licks & Sparks during High RPM / Overrun
      if ((currentRpm > 3800 || isRevving) && exhaustFlameSparks.length < 24 && Math.random() < 0.6) {
        exhaustFlameSparks.push({
          x: centerX + 40 + Math.random() * 12,
          y: cylinderTopY - 14,
          vx: Math.random() * 4.5 + 4.0,
          vy: -Math.random() * 3.5 - 1.0,
          radius: Math.random() * 2.2 + 1.2,
          life: 1.0,
          color: Math.random() < 0.75 ? "#f97316" : "#38bdf8" // Orange carbon spark or blue fuel lick
        });
      }
    }

    // Animate & Render Rolling Vortex Smoke Clouds
    for (let i = exhaustSmokePuffs.length - 1; i >= 0; i--) {
      const sp = exhaustSmokePuffs[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.vx *= 0.97; // Drag in exhaust manifold runner
      sp.vy -= 0.04; // Thermal buoyancy upward
      sp.radius += sp.growthRate;
      sp.angle += sp.spin;
      sp.density -= 0.024;
      sp.heat = Math.max(0, sp.heat - 0.04);

      if (sp.density <= 0 || sp.radius > 45) {
        exhaustSmokePuffs.splice(i, 1);
        continue;
      }

      engineCtx.save();
      engineCtx.translate(sp.x, sp.y);
      engineCtx.rotate(sp.angle);

      // Volumetric multi-stop smoke gradient: incandescent core -> charcoal soot -> translucent billow
      const smokeGrad = engineCtx.createRadialGradient(0, 0, sp.radius * 0.15, 0, 0, sp.radius);
      if (sp.heat > 0.25) {
        // Hot glowing gas puff
        smokeGrad.addColorStop(0, `rgba(251, 146, 60, ${sp.density * 0.85})`);
        smokeGrad.addColorStop(0.4, `rgba(100, 116, 139, ${sp.density * 0.65})`);
        smokeGrad.addColorStop(1, "rgba(71, 85, 105, 0)");
      } else {
        // Dense charcoal / grey billowing smoke
        smokeGrad.addColorStop(0, `rgba(71, 85, 105, ${sp.density * 0.75})`);
        smokeGrad.addColorStop(0.55, `rgba(148, 163, 184, ${sp.density * 0.45})`);
        smokeGrad.addColorStop(1, "rgba(148, 163, 184, 0)");
      }

      engineCtx.fillStyle = smokeGrad;
      engineCtx.beginPath();
      engineCtx.arc(0, 0, sp.radius, 0, Math.PI * 2);
      engineCtx.fill();
      engineCtx.restore();
    }

    // Animate & Render Exhaust Flame Sparks & Embers
    for (let i = exhaustFlameSparks.length - 1; i >= 0; i--) {
      const fs = exhaustFlameSparks[i];
      fs.x += fs.vx;
      fs.y += fs.vy;
      fs.life -= 0.055;
      if (fs.life <= 0) {
        exhaustFlameSparks.splice(i, 1);
        continue;
      }
      engineCtx.save();
      engineCtx.fillStyle = fs.color;
      engineCtx.shadowColor = fs.color;
      engineCtx.shadowBlur = 10;
      engineCtx.globalAlpha = fs.life;
      engineCtx.beginPath();
      engineCtx.arc(fs.x, fs.y, fs.radius, 0, Math.PI * 2);
      engineCtx.fill();
      engineCtx.restore();
    }
    engineCtx.restore();

    // 7. DOHC Dual Overhead Camshafts & Active Valve Springs
    // Camshaft speed = 1/2 of Crankshaft speed
    const camAngleRad = (state.angleDeg * 0.5 * Math.PI) / 180;

    // Intake Cam & Valve (Left)
    const intakeValveLift = state.intakeValveOpen * 16;
    const intakeValveX = centerX - 42;
    const intakeValveY = cylinderTopY - 14 + intakeValveLift;

    // Intake Cam Lobe
    engineCtx.save();
    engineCtx.translate(intakeValveX, cylinderTopY - 55);
    engineCtx.rotate(camAngleRad);
    engineCtx.fillStyle = "#64748b";
    engineCtx.beginPath();
    engineCtx.arc(0, 0, 11, 0, Math.PI * 2);
    engineCtx.fill();
    // Teardrop cam profile
    engineCtx.beginPath();
    engineCtx.moveTo(-10, 0);
    engineCtx.lineTo(0, 18);
    engineCtx.lineTo(10, 0);
    engineCtx.closePath();
    engineCtx.fill();
    engineCtx.strokeStyle = "#cbd5e1";
    engineCtx.lineWidth = 1.5;
    engineCtx.stroke();
    // Cam center shaft
    engineCtx.fillStyle = "#0f172a";
    engineCtx.beginPath();
    engineCtx.arc(0, 0, 5, 0, Math.PI * 2);
    engineCtx.fill();
    engineCtx.restore();

    // Exhaust Cam & Valve (Right)
    const exhaustValveLift = state.exhaustValveOpen * 16;
    const exhaustValveX = centerX + 42;
    const exhaustValveY = cylinderTopY - 14 + exhaustValveLift;

    // Exhaust Cam Lobe
    engineCtx.save();
    engineCtx.translate(exhaustValveX, cylinderTopY - 55);
    engineCtx.rotate(camAngleRad + Math.PI * 0.5);
    engineCtx.fillStyle = "#64748b";
    engineCtx.beginPath();
    engineCtx.arc(0, 0, 11, 0, Math.PI * 2);
    engineCtx.fill();
    // Teardrop cam profile
    engineCtx.beginPath();
    engineCtx.moveTo(-10, 0);
    engineCtx.lineTo(0, 18);
    engineCtx.lineTo(10, 0);
    engineCtx.closePath();
    engineCtx.fill();
    engineCtx.strokeStyle = "#cbd5e1";
    engineCtx.lineWidth = 1.5;
    engineCtx.stroke();
    // Cam center shaft
    engineCtx.fillStyle = "#0f172a";
    engineCtx.beginPath();
    engineCtx.arc(0, 0, 5, 0, Math.PI * 2);
    engineCtx.fill();
    engineCtx.restore();

    // Active Compressing Helical Valve Springs
    function drawValveSpring(x, topY, bottomY) {
      engineCtx.save();
      engineCtx.strokeStyle = "#94a3b8";
      engineCtx.lineWidth = 2.5;
      engineCtx.beginPath();
      const coils = 6;
      const h = bottomY - topY;
      for (let i = 0; i <= coils; i++) {
        const sy = topY + (i / coils) * h;
        const sx = x + (i % 2 === 0 ? -9 : 9);
        if (i === 0) engineCtx.moveTo(x, sy);
        else engineCtx.lineTo(sx, sy);
      }
      engineCtx.lineTo(x, bottomY);
      engineCtx.stroke();
      engineCtx.restore();
    }

    drawValveSpring(intakeValveX, cylinderTopY - 50, intakeValveY - 6);
    drawValveSpring(exhaustValveX, cylinderTopY - 50, exhaustValveY - 6);

    // Poppet Valve Discs & Stems
    // Left Intake Valve
    engineCtx.save();
    engineCtx.translate(intakeValveX, intakeValveY);
    engineCtx.fillStyle = state.intakeValveOpen > 0.05 ? "#38bdf8" : "#94a3b8";
    engineCtx.beginPath();
    engineCtx.ellipse(0, 0, 19, 4.5, 0, 0, Math.PI * 2);
    engineCtx.fill();
    engineCtx.fillStyle = "#e2e8f0";
    engineCtx.fillRect(-2.5, -42, 5, 42); // Stem
    engineCtx.restore();

    // Right Exhaust Valve
    engineCtx.save();
    engineCtx.translate(exhaustValveX, exhaustValveY);
    engineCtx.fillStyle = state.exhaustValveOpen > 0.05 ? "#ef4444" : "#94a3b8";
    engineCtx.beginPath();
    engineCtx.ellipse(0, 0, 19, 4.5, 0, 0, Math.PI * 2);
    engineCtx.fill();
    engineCtx.fillStyle = "#e2e8f0";
    engineCtx.fillRect(-2.5, -42, 5, 42); // Stem
    engineCtx.restore();

    // 8. Spark Plug with High-Voltage Plasma Arc
    engineCtx.save();
    // Ceramic Insulator
    engineCtx.fillStyle = "#f8fafc";
    engineCtx.fillRect(centerX - 5.5, cylinderTopY - 65, 11, 46);
    // Threaded steel hex body
    engineCtx.strokeStyle = "#64748b";
    engineCtx.lineWidth = 1.5;
    engineCtx.strokeRect(centerX - 7.5, cylinderTopY - 28, 15, 18);
    // Brass terminal nut
    engineCtx.fillStyle = "#eab308";
    engineCtx.fillRect(centerX - 4, cylinderTopY - 73, 8, 8);

    // Nickel Electrodes
    engineCtx.strokeStyle = "#f1f5f9";
    engineCtx.lineWidth = 1.8;
    engineCtx.beginPath();
    engineCtx.moveTo(centerX, cylinderTopY - 10);
    engineCtx.lineTo(centerX, cylinderTopY + 3); // Center electrode
    engineCtx.moveTo(centerX - 6, cylinderTopY - 2);
    engineCtx.lineTo(centerX - 6, cylinderTopY + 5);
    engineCtx.lineTo(centerX - 1.5, cylinderTopY + 5); // Ground electrode
    engineCtx.stroke();

    // High-Voltage Ignition Spark Flash
    if (sparkIntensity > 0.05) {
      engineCtx.shadowColor = "#38bdf8";
      engineCtx.shadowBlur = 30 * sparkIntensity;
      engineCtx.strokeStyle = "#ffffff";
      engineCtx.lineWidth = 3;
      engineCtx.beginPath();
      engineCtx.moveTo(centerX, cylinderTopY + 3);
      // Zigzag plasma lightning
      engineCtx.lineTo(centerX - 3, cylinderTopY + 4);
      engineCtx.lineTo(centerX - 1.5, cylinderTopY + 4.5);
      engineCtx.lineTo(centerX - 2.5, cylinderTopY + 5);
      engineCtx.stroke();

      // Expanding explosion burst
      const burstGrad = engineCtx.createRadialGradient(centerX, cylinderTopY + 4, 3, centerX, cylinderTopY + 4, 55 * sparkIntensity);
      burstGrad.addColorStop(0, "rgba(255, 255, 255, 0.98)");
      burstGrad.addColorStop(0.3, "rgba(253, 224, 71, 0.85)");
      burstGrad.addColorStop(0.7, "rgba(239, 68, 68, 0.5)");
      burstGrad.addColorStop(1, "rgba(239, 68, 68, 0)");
      engineCtx.fillStyle = burstGrad;
      engineCtx.beginPath();
      engineCtx.arc(centerX, cylinderTopY + 4, 55 * sparkIntensity, 0, Math.PI * 2);
      engineCtx.fill();
    }
    engineCtx.restore();

    // 9. Photorealistic Machined Aluminum Piston Assembly
    const pistonW = cylinderWidth - 6;
    const pistonLeft = centerX - pistonW / 2;

    engineCtx.save();
    // Piston Body Metallic Gradient
    const pistonGrad = engineCtx.createLinearGradient(pistonLeft, 0, pistonLeft + pistonW, 0);
    pistonGrad.addColorStop(0, "#64748b");
    pistonGrad.addColorStop(0.12, "#cbd5e1");
    pistonGrad.addColorStop(0.50, "#f8fafc");
    pistonGrad.addColorStop(0.88, "#cbd5e1");
    pistonGrad.addColorStop(1, "#64748b");

    engineCtx.fillStyle = pistonGrad;
    engineCtx.beginPath();
    engineCtx.roundRect(pistonLeft, pistonY, pistonW, pistonHeight, 4);
    engineCtx.fill();
    engineCtx.strokeStyle = "#475569";
    engineCtx.lineWidth = 1.5;
    engineCtx.strokeRect(pistonLeft, pistonY, pistonW, pistonHeight);

    // Three Piston Rings: Top Fire Ring, Scraper Ring, Oil Control Ring
    const ringColors = ["#1e293b", "#334155", "#0f172a"];
    [9, 18, 27].forEach((dy, idx) => {
      engineCtx.fillStyle = ringColors[idx];
      engineCtx.fillRect(pistonLeft, pistonY + dy, 4.5, 3.5);
      engineCtx.fillRect(pistonLeft + pistonW - 4.5, pistonY + dy, 4.5, 3.5);
    });

    // Piston Crown Valve Pockets (Recesses for high-lift valves)
    engineCtx.strokeStyle = "rgba(0,0,0,0.3)";
    engineCtx.lineWidth = 2.5;
    engineCtx.beginPath();
    engineCtx.arc(pistonLeft + 38, pistonY + 6, 14, 0, Math.PI);
    engineCtx.arc(pistonLeft + pistonW - 38, pistonY + 6, 14, 0, Math.PI);
    engineCtx.stroke();

    // Graphite Anti-Friction Skirt Coating Patches
    engineCtx.fillStyle = "rgba(15, 23, 42, 0.4)";
    engineCtx.fillRect(pistonLeft + 15, pistonY + 36, 30, 26);
    engineCtx.fillRect(pistonLeft + pistonW - 45, pistonY + 36, 30, 26);

    // Gudgeon / Wrist Pin (Pivot for connecting rod small end)
    const wristPinX = centerX;
    const wristPinY = pistonY + 40;
    engineCtx.fillStyle = "#334155";
    engineCtx.beginPath();
    engineCtx.arc(wristPinX, wristPinY, 14, 0, Math.PI * 2);
    engineCtx.fill();
    engineCtx.strokeStyle = "#e2e8f0";
    engineCtx.lineWidth = 2;
    engineCtx.stroke();
    // Hollow inner pin hole
    engineCtx.fillStyle = "#0f172a";
    engineCtx.beginPath();
    engineCtx.arc(wristPinX, wristPinY, 7, 0, Math.PI * 2);
    engineCtx.fill();
    engineCtx.restore();

    // 10. Forged Steel H-Beam Connecting Rod & Kinematics with Pressurized Internal Oil Galleries
    const crankRadiusPx = (CRANK_RADIUS_M / STROKE_M) * strokePixels; // ~50 px
    const crankAngleRad = (state.angleDeg * Math.PI) / 180;
    const crankPinX = centerX + crankRadiusPx * Math.sin(crankAngleRad);
    const crankPinY = crankCenterY - crankRadiusPx * Math.cos(crankAngleRad);

    // Connecting Rod Beam
    engineCtx.save();
    const conRodGrad = engineCtx.createLinearGradient(wristPinX - 9, 0, wristPinX + 9, 0);
    conRodGrad.addColorStop(0, "#475569");
    conRodGrad.addColorStop(0.35, "#cbd5e1");
    conRodGrad.addColorStop(0.70, "#94a3b8");
    conRodGrad.addColorStop(1, "#334155");

    engineCtx.strokeStyle = conRodGrad;
    engineCtx.lineWidth = 15;
    engineCtx.lineCap = "round";
    engineCtx.beginPath();
    engineCtx.moveTo(wristPinX, wristPinY);
    engineCtx.lineTo(crankPinX, crankPinY);
    engineCtx.stroke();

    // H-Beam Center Recess Channel
    engineCtx.strokeStyle = "#1e293b";
    engineCtx.lineWidth = 5.5;
    engineCtx.beginPath();
    engineCtx.moveTo(wristPinX, wristPinY);
    engineCtx.lineTo(crankPinX, crankPinY);
    engineCtx.stroke();

    // REAL LIQUIDS ANIMATION: Pressurized Internal Oil Gallery (Rifle-Drilled Channel)
    // Golden lubricating oil flowing from big-end crank journal to small-end wrist pin
    engineCtx.strokeStyle = "rgba(245, 158, 11, 0.75)";
    engineCtx.lineWidth = 2.0;
    engineCtx.setLineDash([4, 4]);
    const oilPhase = (performance.now() * 0.025 * (currentRpm / 2000)) % 8;
    engineCtx.lineDashOffset = -oilPhase;
    engineCtx.beginPath();
    engineCtx.moveTo(crankPinX, crankPinY);
    engineCtx.lineTo(wristPinX, wristPinY);
    engineCtx.stroke();
    engineCtx.setLineDash([]);
    engineCtx.restore();

    // Big-End Crank Journal Cap & High-Strength Rod Bolts
    engineCtx.save();
    engineCtx.fillStyle = "#cbd5e1";
    engineCtx.beginPath();
    engineCtx.arc(crankPinX, crankPinY, 16, 0, Math.PI * 2);
    engineCtx.fill();
    engineCtx.strokeStyle = "#1e293b";
    engineCtx.lineWidth = 2;
    engineCtx.stroke();

    // Rod Cap Bolts
    engineCtx.fillStyle = "#0f172a";
    engineCtx.beginPath();
    engineCtx.arc(crankPinX - 9, crankPinY + 8, 2.5, 0, Math.PI * 2);
    engineCtx.arc(crankPinX + 9, crankPinY + 8, 2.5, 0, Math.PI * 2);
    engineCtx.fill();
    engineCtx.restore();

    // Under-Piston Oil Squirter Jet (High-Performance Crown Cooling)
    const squirterX = centerX - 38;
    const squirterY = cylinderBottomY + 30;
    engineCtx.save();
    engineCtx.fillStyle = "#64748b";
    engineCtx.fillRect(squirterX - 3, squirterY, 6, 12);
    // Brass nozzle pointing up at piston underside
    engineCtx.fillStyle = "#eab308";
    engineCtx.beginPath();
    engineCtx.moveTo(squirterX - 2, squirterY);
    engineCtx.lineTo(squirterX + 2, squirterY);
    engineCtx.lineTo(squirterX, squirterY - 5);
    engineCtx.closePath();
    engineCtx.fill();

    // Pressurized oil cooling stream spraying up toward piston crown
    if (isEngineStarted && currentRpm > 200) {
      const jetTargetY = Math.min(squirterY - 10, pistonY + 55);
      const jetGrad = engineCtx.createLinearGradient(squirterX, squirterY - 5, squirterX, jetTargetY);
      jetGrad.addColorStop(0, "rgba(245, 158, 11, 0.85)");
      jetGrad.addColorStop(0.7, "rgba(251, 191, 36, 0.6)");
      jetGrad.addColorStop(1, "rgba(245, 158, 11, 0.2)");
      engineCtx.strokeStyle = jetGrad;
      engineCtx.lineWidth = 2.2;
      engineCtx.beginPath();
      engineCtx.moveTo(squirterX, squirterY - 5);
      engineCtx.lineTo(squirterX + Math.sin(performance.now() * 0.05) * 2, jetTargetY);
      engineCtx.stroke();
    }
    engineCtx.restore();

    // 11. Rotating Crankshaft Counterweight & Active Dynamic Oil Sump Bath
    engineCtx.save();
    const sumpY = crankCenterY + 55;
    const sumpLeft = centerX - cylinderWidth / 2 - 35;
    const sumpRight = centerX + cylinderWidth / 2 + 35;
    const sumpWidth = sumpRight - sumpLeft;
    const sumpH = 45;
    const nowTime = performance.now() * 0.003;

    // Counterweight Immersion Kinematics (Lobe enters oil at bottom TDC: crankAngle ~ 320° to 40°)
    const normAngle = state.angleDeg % 360;
    const isCounterweightDipping = normAngle > 310 || normAngle < 50;
    const dipFraction = isCounterweightDipping ? (1 - Math.abs((normAngle > 180 ? normAngle - 360 : normAngle) / 50)) : 0;
    const dipCenterX = centerX - Math.sin(crankAngleRad) * 45;

    // REAL LIQUIDS ANIMATION: Multi-Harmonic Dynamic Oil Wave Surface
    engineCtx.beginPath();
    engineCtx.moveTo(sumpLeft, sumpY + sumpH);
    engineCtx.lineTo(sumpLeft, sumpY);

    const waveSegments = 28;
    for (let j = 0; j <= waveSegments; j++) {
      const frac = j / waveSegments;
      const wx = sumpLeft + frac * sumpWidth;
      // Ambient fluid ripples
      let wy = sumpY + 6 + Math.sin(frac * 12 + nowTime * 4) * 1.8 + Math.cos(frac * 8 - nowTime * 3) * 1.2;
      // Counterweight dip displacement bow wave
      if (dipFraction > 0.05) {
        const distFromDip = Math.abs(wx - dipCenterX);
        const splashWave = Math.exp(- (distFromDip * distFromDip) / 350) * (dipFraction * 7.5);
        wy += splashWave * Math.sin(nowTime * 15);
      }
      engineCtx.lineTo(wx, wy);
    }
    engineCtx.lineTo(sumpRight, sumpY);
    engineCtx.lineTo(sumpRight, sumpY + sumpH);
    engineCtx.closePath();

    // Golden Viscous Oil Sump Gradient
    const oilSumpGrad = engineCtx.createLinearGradient(0, sumpY, 0, sumpY + sumpH);
    oilSumpGrad.addColorStop(0, "rgba(245, 158, 11, 0.55)");
    oilSumpGrad.addColorStop(0.35, "rgba(217, 119, 6, 0.75)");
    oilSumpGrad.addColorStop(1, "rgba(146, 64, 14, 0.92)");
    engineCtx.fillStyle = oilSumpGrad;
    engineCtx.fill();

    // Liquid Oil Surface Meniscus Specular Highlight
    engineCtx.strokeStyle = "rgba(253, 224, 71, 0.85)";
    engineCtx.lineWidth = 2.0;
    engineCtx.beginPath();
    for (let j = 0; j <= waveSegments; j++) {
      const frac = j / waveSegments;
      const wx = sumpLeft + frac * sumpWidth;
      let wy = sumpY + 6 + Math.sin(frac * 12 + nowTime * 4) * 1.8 + Math.cos(frac * 8 - nowTime * 3) * 1.2;
      if (dipFraction > 0.05) {
        const distFromDip = Math.abs(wx - dipCenterX);
        wy += Math.exp(- (distFromDip * distFromDip) / 350) * (dipFraction * 7.5) * Math.sin(nowTime * 15);
      }
      if (j === 0) engineCtx.moveTo(wx, wy);
      else engineCtx.lineTo(wx, wy);
    }
    engineCtx.stroke();

    // Submerged Oil Pump Pickup Tube with Screen Strainer Bell
    const pickupX = sumpLeft + 35;
    engineCtx.fillStyle = "#475569";
    engineCtx.fillRect(pickupX - 4, sumpY - 18, 8, 38);
    // Wire mesh pickup bell
    engineCtx.fillStyle = "#94a3b8";
    engineCtx.beginPath();
    engineCtx.moveTo(pickupX - 14, sumpY + 34);
    engineCtx.lineTo(pickupX + 14, sumpY + 34);
    engineCtx.lineTo(pickupX + 7, sumpY + 20);
    engineCtx.lineTo(pickupX - 7, sumpY + 20);
    engineCtx.closePath();
    engineCtx.fill();
    engineCtx.strokeStyle = "#334155";
    engineCtx.lineWidth = 1;
    engineCtx.stroke();

    // REAL LIQUIDS ANIMATION: Crankshaft Splash Lubrication Droplets
    if (dipFraction > 0.15 && oilSplashDroplets.length < 35 && Math.random() < 0.8) {
      const flingSpeed = 4.0 + (currentRpm / 6000) * 8.0;
      const flingAngle = -Math.PI * 0.5 + (Math.random() - 0.5) * 1.2;
      oilSplashDroplets.push({
        x: dipCenterX + (Math.random() - 0.5) * 16,
        y: sumpY + 8,
        vx: Math.cos(flingAngle) * flingSpeed,
        vy: Math.sin(flingAngle) * flingSpeed,
        radius: Math.random() * 1.8 + 1.0,
        life: 1.0
      });
    }

    // Animate & Render Splash Lubrication Droplets
    for (let i = oilSplashDroplets.length - 1; i >= 0; i--) {
      const od = oilSplashDroplets[i];
      od.x += od.vx;
      od.y += od.vy;
      od.vy += 0.24; // Gravity downward
      od.life -= 0.035;

      if (od.life <= 0 || od.y > sumpY + sumpH) {
        oilSplashDroplets.splice(i, 1);
        continue;
      }

      engineCtx.save();
      engineCtx.fillStyle = `rgba(251, 191, 36, ${od.life * 0.9})`;
      engineCtx.shadowColor = "#f59e0b";
      engineCtx.shadowBlur = 6;
      engineCtx.beginPath();
      engineCtx.arc(od.x, od.y, od.radius, 0, Math.PI * 2);
      engineCtx.fill();
      engineCtx.restore();
    }

    // Crankcase Blow-by Oil Vapor Mist (PCV Cavity Mist)
    if (crankcaseMistPuffs.length < 20 && Math.random() < 0.25) {
      crankcaseMistPuffs.push({
        x: centerX + (Math.random() - 0.5) * (cylinderWidth - 30),
        y: crankCenterY - 30 + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -Math.random() * 0.8 - 0.2,
        radius: Math.random() * 8 + 6,
        density: 0.35
      });
    }
    for (let i = crankcaseMistPuffs.length - 1; i >= 0; i--) {
      const cm = crankcaseMistPuffs[i];
      cm.x += cm.vx;
      cm.y += cm.vy;
      cm.radius += 0.15;
      cm.density -= 0.008;
      if (cm.density <= 0 || cm.y < cylinderBottomY) {
        crankcaseMistPuffs.splice(i, 1);
        continue;
      }
      engineCtx.save();
      engineCtx.fillStyle = `rgba(203, 213, 225, ${cm.density * 0.4})`;
      engineCtx.beginPath();
      engineCtx.arc(cm.x, cm.y, cm.radius, 0, Math.PI * 2);
      engineCtx.fill();
      engineCtx.restore();
    }

    // Rotating Counterweight Assembly
    engineCtx.translate(centerX, crankCenterY);
    engineCtx.rotate(crankAngleRad);

    // Counterweight Web (Heavy lobed counterbalance with metallic bevel)
    engineCtx.fillStyle = "#334155";
    engineCtx.beginPath();
    engineCtx.arc(0, 0, 54, Math.PI * 0.12, Math.PI * 0.88, false);
    engineCtx.lineTo(0, 0);
    engineCtx.closePath();
    engineCtx.fill();
    engineCtx.strokeStyle = "#94a3b8";
    engineCtx.lineWidth = 2;
    engineCtx.stroke();

    // Oil Sheen on Rotating Counterweight
    engineCtx.strokeStyle = "rgba(245, 158, 11, 0.4)";
    engineCtx.lineWidth = 2.5;
    engineCtx.beginPath();
    engineCtx.arc(0, 0, 52, Math.PI * 0.16, Math.PI * 0.84, false);
    engineCtx.stroke();

    // Balance Drilling Chamfers (CNC lightened holes)
    engineCtx.fillStyle = "#1e293b";
    [-24, 0, 24].forEach(dx => {
      engineCtx.beginPath();
      engineCtx.arc(dx, 36, 6, 0, Math.PI * 2);
      engineCtx.fill();
    });

    // Flywheel Outer Rim
    engineCtx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    engineCtx.lineWidth = 2;
    engineCtx.beginPath();
    engineCtx.arc(0, 0, 60, 0, Math.PI * 2);
    engineCtx.stroke();

    // Main Journal Center Hub
    engineCtx.fillStyle = "#0f172a";
    engineCtx.beginPath();
    engineCtx.arc(0, 0, 18, 0, Math.PI * 2);
    engineCtx.fill();
    engineCtx.strokeStyle = "#f59e0b";
    engineCtx.lineWidth = 2.5;
    engineCtx.stroke();
    engineCtx.restore();

    // 12. TDC & BDC Reference Markers
    engineCtx.save();
    engineCtx.fillStyle = "#fbbf24";
    engineCtx.font = "bold 10px monospace";
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
    engineCtx.restore();

    // 13. Sleek Analog Sport Tachometer Gauge (Top-Right of Canvas)
    drawTachometer(engineCtx, w - 85, 75, 55, currentRpm);
  }

  // Draw High-Performance Circular Sport Tachometer on Canvas
  function drawTachometer(ctx, cx, cy, radius, rpmVal) {
    ctx.save();
    // Bezel & Dial Face
    const dialGrad = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius);
    dialGrad.addColorStop(0, "#0f172a");
    dialGrad.addColorStop(0.85, "#020617");
    dialGrad.addColorStop(1, "#1e293b");

    ctx.fillStyle = dialGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Redline Zone Arc (6,000 to 7,500 RPM)
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 2.25;
    const totalAngle = endAngle - startAngle;

    const redlineStartAngle = startAngle + (6000 / 7500) * totalAngle;
    ctx.strokeStyle = "rgba(239, 68, 68, 0.75)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 6, redlineStartAngle, endAngle);
    ctx.stroke();

    // RPM Tick Marks
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.5;
    for (let i = 0; i <= 7.5; i += 0.5) {
      const a = startAngle + (i / 7.5) * totalAngle;
      const isMajor = i % 1 === 0;
      const innerR = isMajor ? radius - 12 : radius - 8;
      const outerR = radius - 4;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * innerR, cy + Math.sin(a) * innerR);
      ctx.lineTo(cx + Math.cos(a) * outerR, cy + Math.sin(a) * outerR);
      ctx.stroke();
    }

    // Label: "RPM x1000"
    ctx.fillStyle = "#94a3b8";
    ctx.font = "8px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("RPM x1000", cx, cy + 22);

    // Digital RPM Readout
    ctx.fillStyle = rpmVal > 6000 ? "#ef4444" : "#f59e0b";
    ctx.font = "bold 11px monospace";
    ctx.fillText(Math.round(rpmVal), cx, cy - 8);

    // Sweeping Needle
    const needleRpm = Math.min(7500, Math.max(0, rpmVal));
    const needleAngle = startAngle + (needleRpm / 7500) * totalAngle;
    ctx.strokeStyle = rpmVal > 6000 ? "#ef4444" : "#f59e0b";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(needleAngle) * (radius - 12), cy + Math.sin(needleAngle) * (radius - 12));
    ctx.stroke();

    // Center Hub Cap
    ctx.fillStyle = "#e2e8f0";
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();

    // Shift Light Flash (if at or above redline 6,200+ RPM)
    if (rpmVal >= 6200) {
      ctx.fillStyle = Math.floor(performance.now() / 80) % 2 === 0 ? "#ef4444" : "#ffffff";
      ctx.beginPath();
      ctx.arc(cx, cy - radius + 12, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Draw Thermodynamic PV Indicator Diagram on Canvas
  function drawPVDiagram(state) {
    if (!pvCtx || !pvCanvas) return;
    const w = pvCanvas.clientWidth || 480;
    const h = pvCanvas.clientHeight || 215;

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
      pvCtx.fillStyle = "#94a3b8";
      pvCtx.font = "9px monospace";
      pvCtx.fillText(`${pStep}`, 8, y + 3);
    }
    for (let vFrac = 0; vFrac <= 1; vFrac += 0.25) {
      const vol = vMin + vFrac * (vMax - vMin);
      const x = xFromV(vol);
      pvCtx.beginPath();
      pvCtx.moveTo(x, padTop);
      pvCtx.lineTo(x, padTop + plotH);
      pvCtx.stroke();
      pvCtx.fillStyle = "#94a3b8";
      pvCtx.font = "9px monospace";
      pvCtx.fillText(`${(vol * 1e6).toFixed(0)}`, x - 12, padTop + plotH + 16);
    }

    // Axes Labels
    pvCtx.fillStyle = "#38bdf8";
    pvCtx.font = "bold 10px sans-serif";
    pvCtx.fillText("P (kPa)", padLeft - 35, padTop - 6);
    pvCtx.fillText("V (cc)", padLeft + plotW - 15, padTop + plotH + 28);

    // Theoretical Closed Otto Loop Curve
    const fuel = FUELS[selectedFuelKey] || FUELS.regular;
    const qIn = (fuel.qLhv * 1e-4) * (throttlePct / 100);
    const p1 = P_ATM_KPA;
    const p2 = p1 * Math.pow(compRatio, GAMMA);
    const p3 = p2 + ((GAMMA - 1) * qIn * 1e-3) / (vMin * 1e3);
    const p4 = p3 * Math.pow(1 / compRatio, GAMMA);

    // 1. Shaded Work Loop Area (Net Work Output W_net)
    pvCtx.save();
    pvCtx.fillStyle = "rgba(245, 158, 11, 0.12)";
    pvCtx.beginPath();
    // 1 -> 2: Compression (Isentropic curve from V_max to V_c)
    for (let a = 180; a <= 360; a += 5) {
      const s = calculateEngineState(a);
      const x = xFromV(s.vClearanceM3 + PISTON_AREA * s.pistonDispM);
      const y = yFromP(s.pressureKpa);
      if (a === 180) pvCtx.moveTo(x, y);
      else pvCtx.lineTo(x, y);
    }
    // 2 -> 3: Constant Volume Heat Addition (Vertical at V_c)
    pvCtx.lineTo(xFromV(vMin), yFromP(p3));
    // 3 -> 4: Power Stroke Expansion (Isentropic curve from V_c to V_max)
    for (let a = 360; a <= 540; a += 5) {
      const s = calculateEngineState(a);
      const x = xFromV(s.vClearanceM3 + PISTON_AREA * s.pistonDispM);
      const y = yFromP(s.pressureKpa);
      pvCtx.lineTo(x, y);
    }
    // 4 -> 1: Constant Volume Heat Rejection (Vertical at V_max)
    pvCtx.closePath();
    pvCtx.fill();
    pvCtx.restore();

    // 2. Stroke Path Curves
    // Compression curve (Orange)
    pvCtx.strokeStyle = "#f59e0b";
    pvCtx.lineWidth = 2;
    pvCtx.beginPath();
    for (let a = 180; a <= 360; a += 5) {
      const s = calculateEngineState(a);
      const x = xFromV(s.vClearanceM3 + PISTON_AREA * s.pistonDispM);
      const y = yFromP(s.pressureKpa);
      if (a === 180) pvCtx.moveTo(x, y);
      else pvCtx.lineTo(x, y);
    }
    pvCtx.stroke();

    // Power expansion curve (Red)
    pvCtx.strokeStyle = "#ef4444";
    pvCtx.lineWidth = 2.5;
    pvCtx.beginPath();
    for (let a = 360; a <= 540; a += 5) {
      const s = calculateEngineState(a);
      const x = xFromV(s.vClearanceM3 + PISTON_AREA * s.pistonDispM);
      const y = yFromP(s.pressureKpa);
      if (a === 360) pvCtx.moveTo(x, y);
      else pvCtx.lineTo(x, y);
    }
    pvCtx.stroke();

    // Intake/Exhaust pumping loop (Blue/Grey)
    pvCtx.strokeStyle = "#38bdf8";
    pvCtx.lineWidth = 1.5;
    pvCtx.beginPath();
    pvCtx.moveTo(xFromV(vMin), yFromP(P_ATM_KPA * 0.95));
    pvCtx.lineTo(xFromV(vMax), yFromP(P_ATM_KPA * 0.95));
    pvCtx.stroke();

    // 3. Instantaneous Dynamic Working Point Marker (Glowing Pip)
    const currentVol = vMin + PISTON_AREA * state.pistonDispM;
    const curX = xFromV(currentVol);
    const curY = yFromP(state.pressureKpa);

    pvCtx.save();
    pvCtx.shadowColor = state.strokeColor;
    pvCtx.shadowBlur = 14;
    pvCtx.fillStyle = "#ffffff";
    pvCtx.beginPath();
    pvCtx.arc(curX, curY, 6, 0, Math.PI * 2);
    pvCtx.fill();
    pvCtx.strokeStyle = state.strokeColor;
    pvCtx.lineWidth = 2.5;
    pvCtx.stroke();
    pvCtx.restore();
  }

  // Advanced Asymmetric Tube Overdrive & Cylinder Pressure WaveShaper
  function makeDistortionCurve(amount) {
    const k = typeof amount === "number" ? amount : 55;
    const n = 2048;
    const curve = new Float32Array(n);
    for (let i = 0; i < n; ++i) {
      const x = (i * 2) / n - 1;
      // Asymmetric saturation adding rich 2nd and 3rd order acoustic harmonics
      curve[i] = Math.tanh(x * (1 + k * 0.045)) + 0.18 * Math.pow(Math.abs(x), 2) * Math.sign(x);
    }
    return curve;
  }

  // Web Audio Synthesizer: Multi-Harmonic Visceral Acoustic Engine
  function initAudioNodes() {
    if (audioCtx) return;
    try {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return;
      audioCtx = new AudioCtor();
      if (audioCtx.state === "suspended") {
        audioCtx.resume().catch(() => {});
      }

      // Master Punch Compressor & Brickwall Limiter
      compressor = audioCtx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-14, audioCtx.currentTime);
      compressor.knee.setValueAtTime(6, audioCtx.currentTime);
      compressor.ratio.setValueAtTime(8, audioCtx.currentTime);
      compressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
      compressor.release.setValueAtTime(0.075, audioCtx.currentTime);

      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(audioMasterGainVal, audioCtx.currentTime);

      masterGain.connect(compressor);
      compressor.connect(audioCtx.destination);

      // 1. Resonant Exhaust Header Acoustic Filter
      if (typeof audioCtx.createBiquadFilter === "function") {
        exhaustFilter = audioCtx.createBiquadFilter();
        exhaustFilter.type = "lowpass";
        exhaustFilter.frequency.setValueAtTime(320, audioCtx.currentTime);
        exhaustFilter.Q.setValueAtTime(3.2, audioCtx.currentTime);
      }

      // 2. Non-Linear WaveShaper Overdrive (throatiness and cylinder rasp)
      if (typeof audioCtx.createWaveShaper === "function") {
        waveShaper = audioCtx.createWaveShaper();
        waveShaper.curve = makeDistortionCurve(58);
        waveShaper.oversample = "2x";
      }

      // Primary Cylinder Firing Oscillator (Sawtooth - Firing Frequency)
      oscFire = audioCtx.createOscillator();
      oscFire.type = "sawtooth";
      oscFire.frequency.setValueAtTime(30, audioCtx.currentTime);

      // Crankshaft Rotational Harmonic Oscillator (Triangle - Deep Rotational Rumble)
      oscCrank = audioCtx.createOscillator();
      oscCrank.type = "triangle";
      oscCrank.frequency.setValueAtTime(35, audioCtx.currentTime);

      // Deep Sub-Bass Detonation Oscillator (Sine - Chest-Thumping Bass)
      oscSub = audioCtx.createOscillator();
      oscSub.type = "sine";
      oscSub.frequency.setValueAtTime(18, audioCtx.currentTime);

      // High-Order Metallic Mechanical Rasp Oscillator (Sawtooth)
      oscRasp = audioCtx.createOscillator();
      oscRasp.type = "sawtooth";
      oscRasp.frequency.setValueAtTime(90, audioCtx.currentTime);

      gainExhaust = audioCtx.createGain();
      gainExhaust.gain.setValueAtTime(0.09, audioCtx.currentTime);

      gainRasp = audioCtx.createGain();
      gainRasp.gain.setValueAtTime(0.025, audioCtx.currentTime);

      // Connect oscillators through WaveShaper & Filter to Master
      let currentOut = gainExhaust;
      if (waveShaper) {
        currentOut.connect(waveShaper);
        currentOut = waveShaper;
      }
      if (exhaustFilter) {
        currentOut.connect(exhaustFilter);
        currentOut = exhaustFilter;
      }
      currentOut.connect(masterGain);

      oscFire.connect(gainExhaust);
      oscCrank.connect(gainExhaust);
      oscSub.connect(gainExhaust);

      // Route high-order metallic rasp through dedicated bandpass to master
      let raspFilter = null;
      if (typeof audioCtx.createBiquadFilter === "function") {
        raspFilter = audioCtx.createBiquadFilter();
        raspFilter.type = "bandpass";
        raspFilter.frequency.setValueAtTime(750, audioCtx.currentTime);
        raspFilter.Q.setValueAtTime(3.0, audioCtx.currentTime);
        oscRasp.connect(raspFilter);
        raspFilter.connect(gainRasp);
      } else {
        oscRasp.connect(gainRasp);
      }
      gainRasp.connect(masterGain);

      oscFire.start();
      oscCrank.start();
      oscSub.start();
      oscRasp.start();

      // 3. Induction Velocity Stack Roar (Filtered Noise generator)
      if (typeof audioCtx.createBuffer === "function" && typeof audioCtx.createBufferSource === "function") {
        const bufferSize = audioCtx.sampleRate * 2;
        const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        noiseNode = audioCtx.createBufferSource();
        noiseNode.buffer = noiseBuffer;
        noiseNode.loop = true;

        if (typeof audioCtx.createBiquadFilter === "function") {
          noiseFilter = audioCtx.createBiquadFilter();
          noiseFilter.type = "bandpass";
          noiseFilter.frequency.setValueAtTime(360, audioCtx.currentTime);
          noiseFilter.Q.setValueAtTime(3.4, audioCtx.currentTime);
        }

        gainInduction = audioCtx.createGain();
        gainInduction.gain.setValueAtTime(0.025, audioCtx.currentTime);

        if (noiseFilter) {
          noiseNode.connect(noiseFilter);
          noiseFilter.connect(gainInduction);
        } else {
          noiseNode.connect(gainInduction);
        }
        gainInduction.connect(masterGain);
        noiseNode.start();
      }

      // 4. Mechanical Valvetrain Ticking & Cam Lobe Chatter
      valvetrainOsc = audioCtx.createOscillator();
      valvetrainOsc.type = "square";
      valvetrainOsc.frequency.setValueAtTime(140, audioCtx.currentTime);

      valvetrainGain = audioCtx.createGain();
      valvetrainGain.gain.setValueAtTime(0.009, audioCtx.currentTime);

      valvetrainOsc.connect(valvetrainGain);
      valvetrainGain.connect(masterGain);
      valvetrainOsc.start();

    } catch (e) {
      audioEngineActive = false;
    }
  }

  // Play per-cycle explosive combustion thump & sub-bass detonation kick
  function playCombustionDetonation(rpmVal, throttleVal) {
    if (!audioEngineActive || !audioCtx || !isEngineStarted || isPaused) return;
    try {
      const now = audioCtx.currentTime;
      const punchOsc = audioCtx.createOscillator();
      const punchGain = audioCtx.createGain();
      punchOsc.type = "sine";

      // Chest-thumping pitch sweep from 160 Hz down to 32 Hz for deep pressure punch
      punchOsc.frequency.setValueAtTime(160 + (rpmVal / 6000) * 90, now);
      if (punchOsc.frequency.exponentialRampToValueAtTime) {
        punchOsc.frequency.exponentialRampToValueAtTime(32, now + 0.055);
      }

      // Punch volume scales dynamically with throttle and compression ratio
      const punchVol = 0.08 + (throttleVal / 100) * 0.12 * (compRatio / 9.5);
      punchGain.gain.setValueAtTime(punchVol, now);
      if (punchGain.gain.exponentialRampToValueAtTime) {
        punchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
      }

      punchOsc.connect(punchGain);
      punchGain.connect(masterGain || audioCtx.destination);
      punchOsc.start(now);
      punchOsc.stop(now + 0.07);

      // High-Frequency Cylinder Ignition Snap Click
      const snapOsc = audioCtx.createOscillator();
      const snapGain = audioCtx.createGain();
      snapOsc.type = "triangle";
      snapOsc.frequency.setValueAtTime(280 + Math.random() * 80, now);
      snapGain.gain.setValueAtTime(0.05 * (throttleVal / 100), now);
      if (snapGain.gain.exponentialRampToValueAtTime) {
        snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
      }
      snapOsc.connect(snapGain);
      snapGain.connect(masterGain || audioCtx.destination);
      snapOsc.start(now);
      snapOsc.stop(now + 0.018);
    } catch (e) {}
  }

  // Play overrun exhaust burble & gunshot backfire pops when decelerating
  function triggerOverrunPop() {
    if (!audioEngineActive || !audioCtx || !isEngineStarted || isPaused) return;
    try {
      const now = audioCtx.currentTime;
      // 1. Resonant Pipe Boom
      const popOsc = audioCtx.createOscillator();
      const popGain = audioCtx.createGain();
      popOsc.type = "triangle";
      popOsc.frequency.setValueAtTime(80 + Math.random() * 110, now);
      if (popOsc.frequency.exponentialRampToValueAtTime) {
        popOsc.frequency.exponentialRampToValueAtTime(28, now + 0.045);
      }

      const popVol = 0.12 + Math.random() * 0.10;
      popGain.gain.setValueAtTime(popVol, now);
      if (popGain.gain.exponentialRampToValueAtTime) {
        popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      }

      popOsc.connect(popGain);
      popGain.connect(masterGain || audioCtx.destination);
      popOsc.start(now);
      popOsc.stop(now + 0.055);

      // 2. High-Frequency Gunshot Snap Transient
      const crackOsc = audioCtx.createOscillator();
      const crackGain = audioCtx.createGain();
      crackOsc.type = "square";
      crackOsc.frequency.setValueAtTime(420 + Math.random() * 260, now);
      crackGain.gain.setValueAtTime(0.07, now);
      if (crackGain.gain.exponentialRampToValueAtTime) {
        crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);
      }
      crackOsc.connect(crackGain);
      crackGain.connect(masterGain || audioCtx.destination);
      crackOsc.start(now);
      crackOsc.stop(now + 0.015);

      // Spawn on-screen exhaust flame sparks with the backfire pop
      if (exhaustFlameSparks.length < 20) {
        exhaustFlameSparks.push({
          x: centerX + 42 + Math.random() * 15,
          y: cylinderTopY - 14,
          vx: Math.random() * 5.0 + 5.0,
          vy: -Math.random() * 4.0 - 1.5,
          radius: Math.random() * 2.5 + 1.5,
          life: 1.0,
          color: Math.random() < 0.7 ? "#f97316" : "#38bdf8"
        });
      }
    } catch (e) {}
  }

  // Update Dynamic Sound Parameters based on RPM, Throttle, and Stroke
  function updateAudio(state) {
    if (!audioEngineActive) return;
    if (!audioCtx) initAudioNodes();
    if (!audioCtx) return;

    if (!isEngineStarted || isPaused || !isRunning) {
      if (gainExhaust && gainExhaust.gain.setTargetAtTime) {
        gainExhaust.gain.setTargetAtTime(0, audioCtx.currentTime, 0.04);
      }
      if (gainInduction && gainInduction.gain.setTargetAtTime) {
        gainInduction.gain.setTargetAtTime(0, audioCtx.currentTime, 0.04);
      }
      if (gainRasp && gainRasp.gain.setTargetAtTime) {
        gainRasp.gain.setTargetAtTime(0, audioCtx.currentTime, 0.04);
      }
      return;
    }

    const now = audioCtx.currentTime;
    const rpmFrac = Math.min(1.0, currentRpm / 6800);
    const thrFrac = throttlePct / 100;

    // Firing frequency based on engine sound preset
    let mult = 1.0;
    let raspMult = 2.0;
    if (soundProfileKey === "thumper") {
      mult = 0.5; // Single-cylinder big-bore thumper
      raspMult = 1.0;
    } else if (soundProfileKey === "v8") {
      mult = 2.0; // Crossplane V8 rumble
      raspMult = 3.0;
    } else if (soundProfileKey === "v10") {
      mult = 2.5; // High-revving V10 supercar scream
      raspMult = 5.0;
    }

    // Rev Limiter Ignition-Cut Stutter Check
    const limiterCut = isRevLimiterActive ? 0.0 : 1.0;

    const fireFreq = Math.max(14, (currentRpm / 120) * 2.0 * mult);
    const crankFreq = Math.max(18, (currentRpm / 60) * mult);
    const subFreq = Math.max(10, fireFreq * 0.5);
    const raspFreq = Math.max(25, (currentRpm / 60) * raspMult);

    // Smoothly update oscillator frequencies
    if (oscFire && oscFire.frequency.setTargetAtTime) {
      oscFire.frequency.setTargetAtTime(fireFreq, now, 0.025);
    }
    if (oscCrank && oscCrank.frequency.setTargetAtTime) {
      oscCrank.frequency.setTargetAtTime(crankFreq, now, 0.025);
    }
    if (oscSub && oscSub.frequency.setTargetAtTime) {
      oscSub.frequency.setTargetAtTime(subFreq, now, 0.03);
    }
    if (oscRasp && oscRasp.frequency.setTargetAtTime) {
      oscRasp.frequency.setTargetAtTime(raspFreq, now, 0.025);
    }

    // Exhaust resonance filter opens dynamically with RPM and throttle roar
    if (exhaustFilter && exhaustFilter.frequency.setTargetAtTime) {
      const v10Bonus = soundProfileKey === "v10" ? 600 : 0;
      const baseCutoff = 220 + rpmFrac * 1650 + thrFrac * 950 + v10Bonus;
      exhaustFilter.frequency.setTargetAtTime(baseCutoff, now, 0.025);
    }

    // Exhaust volume modulation (power stroke gives punchier growl)
    if (gainExhaust && gainExhaust.gain.setTargetAtTime) {
      const strokeBonus = state.strokeId === 3 ? 0.045 : 0.0;
      const targetGain = (0.07 + 0.09 * thrFrac + 0.06 * rpmFrac + strokeBonus) * limiterCut;
      gainExhaust.gain.setTargetAtTime(targetGain, now, 0.015);
    }

    // Mechanical valvetrain & metallic rasp gain
    if (gainRasp && gainRasp.gain.setTargetAtTime) {
      const raspGain = (0.015 + 0.045 * thrFrac * rpmFrac) * limiterCut;
      gainRasp.gain.setTargetAtTime(raspGain, now, 0.02);
    }

    // Induction manifold roar (intake trumpet suction through throttle body)
    if (gainInduction && gainInduction.gain.setTargetAtTime) {
      const inductionTarget = (0.015 + 0.09 * thrFrac) * (0.35 + 0.65 * rpmFrac) * limiterCut;
      gainInduction.gain.setTargetAtTime(inductionTarget, now, 0.025);
    }
    if (noiseFilter && noiseFilter.frequency.setTargetAtTime) {
      noiseFilter.frequency.setTargetAtTime(280 + thrFrac * 750 + rpmFrac * 350, now, 0.025);
    }

    // Valvetrain mechanical whir and cam tick
    if (valvetrainOsc && valvetrainOsc.frequency.setTargetAtTime) {
      valvetrainOsc.frequency.setTargetAtTime(Math.max(70, currentRpm * 0.18), now, 0.03);
    }

    // Trigger explosive combustion pop on power stroke ignition
    if (state.strokeId === 3 && prevStrokeId !== 3 && !isRevLimiterActive) {
      playCombustionDetonation(currentRpm, throttlePct);
    }

    // Overrun crackle & pop bursts when letting off throttle from high RPM
    if (!isRevving && currentRpm > 3000 && Math.random() < 0.35) {
      triggerOverrunPop();
    }

    // Rev limiter violent backfire pop
    if (isRevLimiterActive && Math.random() < 0.45) {
      triggerOverrunPop();
    }

    prevStrokeId = state.strokeId;
  }

  function stopAudio() {
    if (masterGain && audioCtx && masterGain.gain.setTargetAtTime) {
      masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.04);
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

    // Smooth RPM & Flywheel Rotational Inertia
    const targetRpm = isRevving ? 6650 : (isEngineStarted ? baseRpm : 0);
    const targetThrottle = isRevving ? 100 : (isEngineStarted ? baseThrottlePct : 0);
    
    // Inertia: Faster rev-up, realistic drag coast-down
    const accelRate = isRevving ? 0.14 : 0.055;
    currentRpm += (targetRpm - currentRpm) * accelRate;
    throttlePct += (targetThrottle - throttlePct) * (isRevving ? 0.28 : 0.12);

    // Dynamic Rev-Limiter Hard Cut & Stutter (2-Step Racing Ignition Cut)
    if (currentRpm >= 6450) {
      isRevLimiterActive = Math.floor(timestamp / 36) % 2 === 0;
      if (isRevLimiterActive) {
        currentRpm -= 65; // Ignition bounce
      }
    } else {
      isRevLimiterActive = false;
    }

    if (isRunning && !isPaused && isEngineStarted && currentRpm > 80) {
      // 4-Stroke Cycle completes 720° in 2 crank revolutions
      // Degrees per second = (RPM / 60) * 360°
      const degPerSec = (currentRpm / 60) * 360 * timeScale;
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
    container.querySelector("#hud-temperature").innerText = `${(state.tempK - 273.15).toFixed(1)} °C (${((state.tempK - 273.15) * 1.8 + 32).toFixed(0)} °F)`;
    container.querySelector("#hud-volume").innerText = `${state.vCurrentCc.toFixed(1)} cc`;
    container.querySelector("#hud-piston-speed").innerText = `${Math.abs(state.pistonSpeedMps).toFixed(2)} m/s`;

    container.querySelector("#calc-otto-eff").innerText = `${(state.ottoEff * 100).toFixed(1)}%`;
    container.querySelector("#calc-power").innerText = `${state.powerKw.toFixed(1)} kW (${(state.powerKw * 1.341).toFixed(1)} hp)`;
    container.querySelector("#calc-torque").innerText = `${state.torqueNm.toFixed(1)} N·m`;
    container.querySelector("#lbl-pv-loop-work").innerText = `W_net = ${state.wNetJ.toFixed(1)} J/cycle`;

    // Render Canvas Visualizations & Acoustics
    drawEngine(state);
    drawPVDiagram(state);
    updateAudio(state);

    if (isRunning) {
      animId = requestAnimationFrame(tick);
    }
  }

  // Interactive Gas / Rev Pedal Logic (Spring-Loaded Revving)
  const btnRevPedal = container.querySelector("#btn-piston-gas-pedal");
  function startRevving(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!isEngineStarted) return;
    isRevving = true;
    if (btnRevPedal) {
      btnRevPedal.style.transform = "scale(0.94) translateY(4px)";
      btnRevPedal.style.boxShadow = "0 2px 10px rgba(239, 68, 68, 0.7)";
      btnRevPedal.style.background = "linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)";
    }
    // Haptic vibration feedback on supported touch devices
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(30);
    }
  }

  function stopRevving(e) {
    if (e && e.preventDefault) e.preventDefault();
    isRevving = false;
    if (btnRevPedal) {
      btnRevPedal.style.transform = "none";
      btnRevPedal.style.boxShadow = "0 8px 24px rgba(239, 68, 68, 0.5)";
      btnRevPedal.style.background = "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)";
    }
  }

  if (btnRevPedal) {
    btnRevPedal.addEventListener("mousedown", startRevving);
    window.addEventListener("mouseup", stopRevving);
    btnRevPedal.addEventListener("touchstart", startRevving, { passive: false });
    window.addEventListener("touchend", stopRevving);
    window.addEventListener("touchcancel", stopRevving);
  }

  // Event Listeners & Interactive Handlers
  container.querySelector("#slider-piston-rpm")?.addEventListener("input", (e) => {
    baseRpm = parseInt(e.target.value, 10);
    container.querySelector("#lbl-piston-rpm").innerText = `${baseRpm} RPM`;
  });

  container.querySelector("#slider-piston-comp")?.addEventListener("input", (e) => {
    compRatio = parseFloat(e.target.value);
    container.querySelector("#lbl-piston-comp").innerText = `${compRatio.toFixed(1)} : 1`;
  });

  container.querySelector("#slider-piston-throttle")?.addEventListener("input", (e) => {
    baseThrottlePct = parseInt(e.target.value, 10);
    throttlePct = baseThrottlePct;
    container.querySelector("#lbl-piston-throttle").innerText = `${baseThrottlePct}%`;
  });

  container.querySelector("#select-piston-fuel")?.addEventListener("change", (e) => {
    selectedFuelKey = e.target.value;
    SoundFX.playClick();
  });

  container.querySelector("#select-piston-sound")?.addEventListener("change", (e) => {
    soundProfileKey = e.target.value;
    SoundFX.playClick();
  });

  container.querySelector("#slider-piston-volume")?.addEventListener("input", (e) => {
    const vol = parseInt(e.target.value, 10);
    audioMasterGainVal = (vol / 100) * 0.45;
    container.querySelector("#lbl-piston-volume").innerText = `${vol}%`;
    if (masterGain && audioCtx && masterGain.gain.setValueAtTime) {
      masterGain.gain.setValueAtTime(audioMasterGainVal, audioCtx.currentTime);
    }
  });

  // Ignition Key Switch Toggle
  const btnIgnition = container.querySelector("#btn-piston-ignition");
  btnIgnition?.addEventListener("click", () => {
    isEngineStarted = !isEngineStarted;
    btnIgnition.innerText = isEngineStarted ? "🔑 Key: ON" : "🔒 Key: OFF";
    btnIgnition.style.color = isEngineStarted ? "#ef4444" : "#94a3b8";
    btnIgnition.style.borderColor = isEngineStarted ? "rgba(239, 68, 68, 0.4)" : "rgba(148, 163, 184, 0.3)";
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

  // Audio Acoustics Toggle
  const btnAudio = container.querySelector("#btn-piston-audio");
  btnAudio?.addEventListener("click", () => {
    audioEngineActive = !audioEngineActive;
    if (btnAudio) {
      btnAudio.innerText = audioEngineActive ? "🔊 Audio: On" : "🔇 Audio: Off";
      btnAudio.style.color = audioEngineActive ? "#10b981" : "#94a3b8";
    }
    if (audioEngineActive) {
      initAudioNodes();
    } else {
      stopAudio();
    }
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
        "Engine RPM": Math.round(currentRpm),
        "Compression Ratio (r)": compRatio,
        "Throttle Position (%)": throttlePct,
        "Fuel Mixture": FUELS[selectedFuelKey].name,
        "Acoustic Profile": soundProfileKey,
        "Theoretical Otto Efficiency (%)": (currentState.ottoEff * 100).toFixed(2),
        "Indicated Power (kW)": currentState.powerKw.toFixed(2),
        "Engine Torque (N*m)": currentState.torqueNm.toFixed(2)
      },
      headers: ["Crank Angle (deg)", "Stroke Stage", "Pressure (kPa)", "Temperature (C)", "Cylinder Vol (cc)", "Piston Speed (m/s)", "Intake Valve Lift", "Exhaust Valve Lift"],
      dataRows: rows
    });
  });

  // Standardized Hotkeys:
  // 'e' or 'E' triggers CSV export
  // ' ' (Space) or 'r' / 'R' revs engine while pressed down
  const handleKeyDown = (e) => {
    if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;
    if (e.key === "e" || e.key === "E") {
      e.preventDefault();
      container.querySelector("#btn-piston-export")?.click();
    } else if (e.key === " " || e.key === "r" || e.key === "R") {
      e.preventDefault();
      if (!isRevving) startRevving();
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === " " || e.key === "r" || e.key === "R") {
      e.preventDefault();
      stopRevving();
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

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
    window.removeEventListener("keyup", handleKeyUp);
    window.removeEventListener("mouseup", stopRevving);
    window.removeEventListener("touchend", stopRevving);
    window.removeEventListener("touchcancel", stopRevving);
    stopAudio();
  };
}
