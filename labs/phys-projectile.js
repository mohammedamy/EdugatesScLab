// Edugates-ClipSAT Science Labs - Precision Kinematics & Projectile Laboratory
// Professional Physics Simulation: 4K Ballistics Bench Photography, Stroboscopic Multi-Flash,
// Vector Decomposition, Air Resistance Drag Physics, Magnus Spin Effect, Aerodynamic Wind Kinematics,
// Laser Photogate Timing, Thermodynamic Energy Partition, and Multi-Target Scenarios.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";

let _currentProjectileCleanup = null;

export function cleanupProjectileLab() {
  if (typeof _currentProjectileCleanup === "function") {
    try { _currentProjectileCleanup(); } catch (e) {}
    _currentProjectileCleanup = null;
  }
}

// ---------------------------------------------------------------------
// Scientific Presets & Aerodynamic Constants
// ---------------------------------------------------------------------
const PROJECTILE_PRESETS = {
  cannonball: {
    id: "cannonball",
    name: "Iron Cannonball",
    emoji: "💣",
    mass: 5.0, // kg
    radius: 0.06, // m (d = 12 cm)
    cd: 0.47, // smooth sphere
    desc: "Heavy solid cast iron sphere (m = 5.0 kg, d = 12 cm, C_d = 0.47)"
  },
  baseball: {
    id: "baseball",
    name: "Regulation Baseball",
    emoji: "⚾",
    mass: 0.145, // kg (5.1 oz)
    radius: 0.037, // m (d = 7.4 cm)
    cd: 0.30, // raised double-stitched leather seams
    desc: "Cork & cowhide sphere with aerodynamic seams (m = 0.145 kg, C_d = 0.30)"
  },
  golfball: {
    id: "golfball",
    name: "Dimpled Golf Ball",
    emoji: "⛳",
    mass: 0.0459, // kg (45.9 g)
    radius: 0.0214, // m (d = 4.27 cm)
    cd: 0.22, // dimpled boundary layer transition
    desc: "Dimpled aerodynamic boundary-layer sphere (m = 45.9 g, C_d = 0.22)"
  },
  artillery: {
    id: "artillery",
    name: "155mm Artillery Shell",
    emoji: "🚀",
    mass: 43.5, // kg
    radius: 0.0775, // m (d = 15.5 cm)
    cd: 0.15, // streamlined boattail ogive
    desc: "High-ballistic coefficient boattail ogive shell (m = 43.5 kg, C_d = 0.15)"
  },
  custom: {
    id: "custom",
    name: "Custom Standard Sphere",
    emoji: "⚙️",
    mass: 0.39, // kg
    radius: 0.05, // m
    cd: 0.47,
    desc: "Calibrated laboratory test sphere (k = 0.0058 m⁻¹ at 1.225 kg/m³)"
  }
};

const TARGET_SCENARIOS = {
  field: {
    id: "field",
    name: "Calibrated Ground Target",
    emoji: "🎯",
    desc: "Standard metric distance flagpole beacon on flat terrain"
  },
  hoop: {
    id: "hoop",
    name: "Basketball Regulation Hoop",
    emoji: "🏀",
    desc: "10-ft (3.05 m) rim with backboard — challenge: swish the basket!"
  },
  castle: {
    id: "castle",
    name: "Castle Fortress Battlement",
    emoji: "🏰",
    desc: "16 m stone rampart defense — must lob over wall into courtyard"
  },
  drone: {
    id: "drone",
    name: "Mobile Drone Intercept",
    emoji: "🛸",
    desc: "Hovering autonomous quadcopter with sinusoidal patrol motion"
  }
};

const ATMOSPHERE_PRESETS = {
  sealevel: { name: "Earth Sea Level (1.225 kg/m³)", rho: 1.225 },
  milehigh: { name: "Denver Mile-High (1.050 kg/m³)", rho: 1.050 },
  everest: { name: "Mt. Everest Peak (0.413 kg/m³)", rho: 0.413 },
  stratosphere: { name: "Stratosphere (0.088 kg/m³)", rho: 0.088 },
  vacuum: { name: "Deep Space Vacuum (0.000 kg/m³)", rho: 0.000 }
};

export function initProjectileLab(containerId) {
  cleanupProjectileLab();
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="lab-container">
      <!-- Mode & Visual Header Toolbar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #0284c7; box-shadow: 0 0 10px #0284c7;"></span>
            Precision Ballistics & Trajectory Suite
          </span>
          <span class="badge" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            Dual Photogate Timing (±0.001 ms)
          </span>
          <span class="badge" id="badge-energy-state" style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            Energy: 100% Conserved
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <!-- View Switcher -->
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 3px; gap: 2px;">
            <button id="proj-mode-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none; background: rgba(56, 189, 248, 0.25); color: #38bdf8;">
              🎯 Kinematic Canvas
            </button>
            <button id="proj-mode-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none; color: #94a3b8;">
              📸 4K Ballistics Bench
            </button>
            <button id="proj-mode-chart" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none; color: #94a3b8;">
              📊 Analytical & Energy Charts
            </button>
          </div>

          <!-- Strobe Mode Toggle -->
          <label class="lab-checkbox-label" style="display: flex; align-items: center; gap: 6px; font-size: 0.78rem; cursor: pointer; user-select: none;">
            <input type="checkbox" id="chk-strobe" checked style="accent-color: #38bdf8; width: 15px; height: 15px;">
            <span>Stroboscopic Multi-Flash</span>
          </label>
        </div>
      </div>

      <!-- Laboratory HUD & Canvas Area -->
      <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(56, 189, 248, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: #070a12; overflow: hidden; height: 530px;">
        <canvas id="projectile-canvas" width="1000" height="530" style="height: 530px; width: 100%; display: block; touch-action: none; cursor: default;"></canvas>

        <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
        <div id="proj-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
          <picture>
            <source srcset="assets/labs/projectile_bench.webp" type="image/webp">
            <img src="assets/labs/projectile_bench.jpg" decoding="async" loading="lazy" alt="4K Ballistics Apparatus and Photogate Rail" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
          </picture>
          
          <!-- Live Analytical Telemetry Callout on Photo -->
          <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Ballistic Launcher</div>
              <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.95rem;">Spring-Loaded 3-Range Barrel</div>
            </div>
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Dual Laser Photogates</div>
              <div style="color: #10b981; font-weight: 700; font-family: var(--font-mono); font-size: 0.95rem;" id="photo-overlay-gate">Δt = 4.286 ms → v₀ = 35.0 m/s</div>
            </div>
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Strobe Trajectory</div>
              <div style="color: #fbbf24; font-weight: 700; font-family: var(--font-mono); font-size: 0.95rem;">10 Hz Flash Capture</div>
            </div>
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Quadrant Protractor</div>
              <div style="color: #ec4899; font-weight: 700; font-family: var(--font-mono); font-size: 0.95rem;">0° to 90° Vernier Scale</div>
            </div>
          </div>
        </div>

        <!-- Top HUD: Status & Environment (Left) & Precision Telemetry (Right) -->
        <div class="sim-top-hud-bar" style="position: absolute; top: 12px; left: 14px; right: 14px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; pointer-events: none; z-index: 10;">
          <div class="sim-hud-badges" style="display: flex; flex-direction: column; gap: 6px; pointer-events: auto; max-width: 55%; min-width: 0;">
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px;">
              <span class="badge" style="background: rgba(15, 23, 42, 0.92); border: 1px solid rgba(56, 189, 248, 0.4); padding: 5px 12px; border-radius: 9999px; font-family: var(--font-mono); font-size: 0.8rem; color: #38bdf8; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); white-space: nowrap;">
                <span id="proj-status-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
                <span id="proj-status">Ready for Ignition</span>
              </span>
              <span class="badge" id="env-badge" style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.12); padding: 5px 12px; border-radius: 9999px; font-family: var(--font-mono); font-size: 0.78rem; color: #94a3b8; white-space: nowrap;">
                🌍 Earth: g = 9.80 m/s²
              </span>
              <span class="badge" id="drag-badge" style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.12); padding: 5px 12px; border-radius: 9999px; font-family: var(--font-mono); font-size: 0.78rem; color: #94a3b8; white-space: nowrap;">
                Vacuum (Ideal Parabola)
              </span>
              <span class="badge" id="aero-badge" style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.12); padding: 5px 12px; border-radius: 9999px; font-family: var(--font-mono); font-size: 0.78rem; color: #38bdf8; white-space: nowrap;">
                Wind: 0.0 m/s | Spin: 0 rpm
              </span>
            </div>

            <!-- Target Challenge Banner -->
            <div id="target-hit-banner" style="display: none; background: rgba(16, 185, 129, 0.25); border: 1px solid #10b981; padding: 6px 14px; border-radius: 8px; font-size: 0.82rem; color: #34d399; font-weight: 700; backdrop-filter: blur(8px); box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);">
              🎯 DIRECT TARGET HIT! Accuracy: 99.8%
            </div>
          </div>

          <!-- Top Right High-Precision Telemetry Dashboard -->
          <div class="sim-telemetry-dashboard" style="display: flex; gap: 8px; font-family: var(--font-mono); font-size: 0.82rem; padding: 8px 14px; border-radius: 12px; backdrop-filter: blur(12px); box-shadow: 0 10px 25px rgba(0,0,0,0.6); pointer-events: auto; flex-shrink: 0; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255,255,255,0.1);">
            <div style="border-right: 1px solid rgba(255,255,255,0.1); padding-right: 8px;">
              <div style="font-size: 0.62rem; color: #94a3b8; text-transform: uppercase;">Flight Time</div>
              <div style="color: #f59e0b; font-weight: 700; font-size: 0.95rem;" id="val-time">0.00 s</div>
            </div>
            <div style="border-right: 1px solid rgba(255,255,255,0.1); padding-right: 8px;">
              <div style="font-size: 0.62rem; color: #94a3b8; text-transform: uppercase;">Max Alt (H)</div>
              <div style="color: #10b981; font-weight: 700; font-size: 0.95rem;" id="val-maxh">0.00 m</div>
            </div>
            <div style="border-right: 1px solid rgba(255,255,255,0.1); padding-right: 8px;">
              <div style="font-size: 0.62rem; color: #94a3b8; text-transform: uppercase;">Total Range (R)</div>
              <div style="color: #38bdf8; font-weight: 700; font-size: 0.95rem;" id="val-range">0.00 m</div>
            </div>
            <div style="border-right: 1px solid rgba(255,255,255,0.1); padding-right: 8px;">
              <div style="font-size: 0.62rem; color: #94a3b8; text-transform: uppercase;">Photogate Δt</div>
              <div style="color: #ec4899; font-weight: 700; font-size: 0.95rem;" id="val-photogate">4.29 ms</div>
            </div>
            <div>
              <div style="font-size: 0.62rem; color: #94a3b8; text-transform: uppercase;">Total Energy E</div>
              <div style="color: #34d399; font-weight: 700; font-size: 0.95rem;" id="val-energy-tot">3.06 kJ</div>
            </div>
          </div>
        </div>

        <!-- Floating Educational Formula Bar -->
        <div id="proj-formula-bar" class="sim-floating-formula-bar" style="position: absolute; bottom: 12px; left: 16px; right: 16px; backdrop-filter: blur(12px); border-radius: 12px; padding: 10px 18px; display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap; gap: 14px; font-size: 0.85rem; z-index: 10; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.1);">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: #94a3b8; font-weight: 600;">Trajectory Equation:</span>
            <span id="proj-formula-eqn" style="color: #38bdf8;">${renderLatex("y(x) = y_0 + x\\tan\\theta - \\frac{g x^2}{2v_0^2 \\cos^2\\theta}")}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: #94a3b8; font-weight: 600;">Theoretical Range:</span>
            <span style="color: #10b981;">${renderLatex("R = \\frac{v_0^2 \\sin(2\\theta)}{g}")}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: #94a3b8; font-weight: 600;">Time of Flight:</span>
            <span style="color: #f59e0b;">${renderLatex("t_{\\text{flight}} = \\frac{2v_0 \\sin\\theta}{g}")}</span>
          </div>
        </div>
      </div>

      <!-- Interactive Controls Panel & Guided Inquiry -->
      <div class="lab-controls-panel" style="margin-top: 18px; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
        
        <!-- Column 1: Launch Kinematics -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <!-- Angle Slider -->
          <div class="control-group">
            <label class="control-label">
              <span>Elevation Angle (θ)</span>
              <span class="control-val" id="disp-angle">45°</span>
            </label>
            <input type="range" id="input-angle" class="custom-slider" min="5" max="85" value="45">
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-dim);">
              <span>5° Flat</span>
              <span style="color: #38bdf8; font-weight: 700;">45° (Max Range)</span>
              <span>85° Lob</span>
            </div>
          </div>

          <!-- Velocity Slider -->
          <div class="control-group">
            <label class="control-label">
              <span>Muzzle Velocity (v₀)</span>
              <span class="control-val" id="disp-speed">35 m/s</span>
            </label>
            <input type="range" id="input-speed" class="custom-slider" min="10" max="75" value="35">
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-dim);">
              <span>10 m/s</span>
              <span>35 m/s</span>
              <span>75 m/s</span>
            </div>
          </div>

          <!-- Launch Height Slider -->
          <div class="control-group">
            <label class="control-label">
              <span>Launch Elevation (y₀)</span>
              <span class="control-val" id="disp-height">0 m</span>
            </label>
            <input type="range" id="input-height" class="custom-slider" min="0" max="30" value="0">
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-dim);">
              <span>0 m (Ground)</span>
              <span>15 m (Hill)</span>
              <span>30 m (Cliff)</span>
            </div>
          </div>
        </div>

        <!-- Column 2: Ballistics Profile & Target Challenge -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <!-- Projectile Selection -->
          <div class="control-group">
            <label class="control-label">
              <span>Projectile Type</span>
              <span class="control-val" id="disp-projectile-info" style="color: #38bdf8;">💣 Iron (5.0kg)</span>
            </label>
            <select id="select-projectile" class="select-input" style="height: 40px; font-weight: 600;">
              <option value="cannonball" selected>💣 Iron Cannonball (5.0 kg, Cd=0.47)</option>
              <option value="baseball">⚾ Regulation Baseball (0.145 kg, Cd=0.30)</option>
              <option value="golfball">⛳ Dimpled Golf Ball (0.046 kg, Cd=0.22)</option>
              <option value="artillery">🚀 155mm Artillery Shell (43.5 kg, Cd=0.15)</option>
              <option value="custom">⚙️ Custom Test Sphere (0.39 kg, Cd=0.47)</option>
            </select>
          </div>

          <!-- Target Scenario Selection -->
          <div class="control-group">
            <label class="control-label">
              <span>Target Challenge Mode</span>
              <span class="control-val" id="disp-scenario-info" style="color: #ec4899;">🎯 Ground Flag</span>
            </label>
            <select id="select-scenario" class="select-input" style="height: 40px; font-weight: 600;">
              <option value="field" selected>🎯 Field Ground Target Flag</option>
              <option value="hoop">🏀 Basketball Regulation Hoop (3.05m / 10ft)</option>
              <option value="castle">🏰 Castle Fortress Battlement (16m Wall)</option>
              <option value="drone">🛸 Mobile Surveillance Drone Intercept</option>
            </select>
          </div>

          <!-- Target Distance Slider -->
          <div class="control-group">
            <label class="control-label">
              <span id="lbl-target-dist">🎯 Target Position (x)</span>
              <span class="control-val" id="disp-target" style="color: #ec4899;">120 m</span>
            </label>
            <input type="range" id="input-target" class="custom-slider" min="30" max="250" value="120" style="accent-color: #ec4899;">
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-dim);">
              <span>30 m</span>
              <span>120 m</span>
              <span>250 m</span>
            </div>
          </div>
        </div>

        <!-- Column 3: Advanced Aerodynamics & Planetary Environment -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <!-- Planetary Environment -->
          <div class="control-group">
            <label class="control-label">
              <span>Planetary Gravity Field</span>
            </label>
            <select id="select-gravity" class="select-input" style="height: 40px; font-weight: 600;">
              <option value="9.8" selected>🌍 Earth (g = 9.80 m/s²)</option>
              <option value="1.62">🌕 The Moon (g = 1.62 m/s² — Low Drag)</option>
              <option value="3.71">🪐 Mars (g = 3.71 m/s²)</option>
              <option value="24.79">⚡ Jupiter (g = 24.79 m/s² — Super Massive)</option>
            </select>
          </div>

          <!-- Wind Speed Slider -->
          <div class="control-group">
            <label class="control-label">
              <span>💨 Wind Vector (wₓ)</span>
              <span class="control-val" id="disp-wind">0.0 m/s (Calm)</span>
            </label>
            <input type="range" id="input-wind" class="custom-slider" min="-25" max="25" value="0" step="1">
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-dim);">
              <span>-25 m/s (Headwind)</span>
              <span>0 (Calm)</span>
              <span>+25 m/s (Tailwind)</span>
            </div>
          </div>

          <!-- Magnus Spin Slider -->
          <div class="control-group">
            <label class="control-label">
              <span>🔄 Magnus Spin Rate (ω)</span>
              <span class="control-val" id="disp-spin">0 rpm (No Spin)</span>
            </label>
            <input type="range" id="input-spin" class="custom-slider" min="-3000" max="3000" value="0" step="250">
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-dim);">
              <span>-3000 (Topspin / Dive)</span>
              <span>0</span>
              <span>+3000 (Backspin / Lift)</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons Row -->
        <div class="lab-action-buttons" style="grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 10px; align-items: center; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.08);">
          <button class="btn btn-primary" id="btn-launch-projectile" style="box-shadow: 0 0 15px rgba(56, 189, 248, 0.4); padding: 8px 20px; font-weight: 700;">
            🚀 Launch Projectile
          </button>

          <button class="btn btn-secondary" id="btn-clear-trajectories" style="padding: 8px 16px;">
            ↺ Clear Traces
          </button>

          <button class="btn btn-secondary" id="btn-opt-45" style="border-color: rgba(16, 185, 129, 0.4); color: #34d399; padding: 8px 16px;">
            Inquiry: 45° Max Range
          </button>

          <button class="btn btn-secondary" id="btn-opt-comp" style="border-color: rgba(245, 158, 11, 0.4); color: #fbbf24; padding: 8px 16px;">
            Inquiry: 30° vs 60° Symmetry
          </button>

          <label class="lab-checkbox-label" style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer; user-select: none; margin-left: auto;">
            <input type="checkbox" id="chk-vectors" checked style="accent-color: #10b981; width: 16px; height: 16px;">
            <span>Velocity Vectors (vₓ, vᵧ)</span>
          </label>

          <label class="lab-checkbox-label" style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer; user-select: none;">
            <input type="checkbox" id="chk-air-drag" style="accent-color: #38bdf8; width: 16px; height: 16px;">
            <span>Air Resistance Drag (C_d)</span>
          </label>

          <label class="lab-checkbox-label" style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer; user-select: none;">
            <input type="checkbox" id="chk-slowmo" style="accent-color: #f59e0b; width: 16px; height: 16px;">
            <span>Slow Motion (0.3×)</span>
          </label>
        </div>

        <!-- Keyboard Shortcuts & Direct Canvas Manipulation Hint -->
        <div style="grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; padding: 10px 14px; background: rgba(15, 23, 42, 0.5); border: 1px dashed rgba(255,255,255,0.12); border-radius: 8px; font-size: 0.76rem; color: var(--text-dim);">
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <span><kbd style="background: rgba(255,255,255,0.12); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); color: #38bdf8;">Space</kbd> / <kbd style="background: rgba(255,255,255,0.12); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); color: #38bdf8;">Enter</kbd> Launch</span>
            <span><kbd style="background: rgba(255,255,255,0.12); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); color: #38bdf8;">C</kbd> Clear Traces</span>
            <span><kbd style="background: rgba(255,255,255,0.12); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); color: #38bdf8;">↑/↓</kbd> Angle (±1°)</span>
            <span><kbd style="background: rgba(255,255,255,0.12); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); color: #38bdf8;">←/→</kbd> Velocity (±1 m/s)</span>
            <span><kbd style="background: rgba(255,255,255,0.12); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); color: #38bdf8;">T</kbd> Toggle Air Drag</span>
            <span><kbd style="background: rgba(255,255,255,0.12); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); color: #38bdf8;">V</kbd> Vectors</span>
          </div>
          <span style="color: #38bdf8; font-weight: 600; display: flex; align-items: center; gap: 5px;">
            <span>🎯</span> Drag the Cannon barrel or Target directly on the canvas!
          </span>
        </div>
      </div>

      <!-- Telemetry Suite & Multi-Trial Bar -->
      <div class="lab-telemetry-suite-bar">
        <div class="lab-trials-badge-group" id="proj-trials-badge-group">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">Multi-Trial Overlay:</span>
          <span class="lab-trial-pill trial-1" id="pill-trial-1" style="opacity: 0.5;">Trial 1 (Cyan)</span>
          <span class="lab-trial-pill trial-2" id="pill-trial-2" style="opacity: 0.5;">Trial 2 (Amber)</span>
          <span class="lab-trial-pill trial-3" id="pill-trial-3" style="opacity: 0.5;">Trial 3 (Emerald)</span>
        </div>

        <div class="lab-export-buttons-group">
          <button class="btn btn-secondary" id="btn-export-proj-csv" style="padding: 6px 14px; font-size: 0.82rem; gap: 6px;">
            <span>📥 Export Telemetry (CSV)</span>
          </button>
          <button class="btn btn-primary" id="btn-open-proj-report" style="padding: 6px 14px; font-size: 0.82rem; gap: 6px; background: linear-gradient(135deg, #0284c7, #2563eb); border: none;">
            <span>📑 Generate Lab Report</span>
          </button>
        </div>
      </div>

      <!-- Post-Lab Checkpoint Assessment Mount -->
      <div id="proj-checkpoint-container"></div>
    </div>
  `;

  const canvas = document.getElementById("projectile-canvas");
  const ctx = canvas.getContext("2d");
  const photoOverlay = document.getElementById("proj-photo-overlay");

  // State
  let angle = 45;
  let speed = 35;
  let height = 0;
  let targetX = 120;
  let g = 9.8;
  let showVectors = true;
  let isSlowMo = false;
  let showStrobe = true;
  let enableAirDrag = false;

  // New Ballistics & Aerodynamics State
  let projectileType = "cannonball";
  let targetScenario = "field";
  let windSpeed = 0; // m/s (-25 to +25)
  let spinRpm = 0; // rpm (-3000 to +3000)
  let atmosphereType = "sealevel";
  let activeView = "sim"; // "sim", "photo", "chart"

  // Drone Target Animated State
  let droneTime = 0;
  let hoopSwishAnim = 0; // 0 to 1 for net ripple
  let castleExplosion = false;

  let isFlying = false;
  let t = 0;
  let currentTrajectory = [];
  let trajectoryHistory = [];
  let strobeFlashPoints = [];
  let particles = [];
  let windParticles = [];
  let animId = null;
  let compTimeout = null;
  let themeObserver = null;
  let audioCtx = null;

  // Initialize atmospheric wind streak particles
  for (let i = 0; i < 35; i++) {
    windParticles.push({
      x: Math.random() * 1000,
      y: Math.random() * 380,
      length: 15 + Math.random() * 25,
      alpha: 0.15 + Math.random() * 0.35
    });
  }

  // Pointer dragging state for canvas interactive manipulation
  let isDraggingAngle = false;
  let isDraggingTarget = false;

  function getAudioCtx() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  // Calculate physical effective drag parameter k = 0.5 * rho * Cd * A / m
  function getDragCoeff() {
    if (!enableAirDrag) return 0;
    if (g === 1.62) return 0; // The Moon has no atmosphere
    if (g === 3.71) return 0.0001; // Mars thin atmosphere
    if (g === 24.79) return 0.012; // Jupiter dense atmosphere

    const proj = PROJECTILE_PRESETS[projectileType] || PROJECTILE_PRESETS.cannonball;
    const rho = ATMOSPHERE_PRESETS[atmosphereType]?.rho ?? 1.225;
    const area = Math.PI * proj.radius * proj.radius;
    return (0.5 * rho * proj.cd * area) / proj.mass;
  }

  function updateFormulaBar() {
    const eqnEl = document.getElementById("proj-formula-eqn");
    const dragBadge = document.getElementById("drag-badge");
    const aeroBadge = document.getElementById("aero-badge");
    const proj = PROJECTILE_PRESETS[projectileType] || PROJECTILE_PRESETS.cannonball;

    if (enableAirDrag) {
      if (eqnEl) eqnEl.innerHTML = renderLatex("F_d = \\frac{1}{2} C_d \\rho A v^2");
      if (dragBadge) {
        dragBadge.innerText = (g === 1.62) ? "Air Drag: N/A (Moon Vacuum)" : `Air Drag: Active (${proj.name}, C_d=${proj.cd})`;
        dragBadge.style.color = (g === 1.62) ? "#94a3b8" : "#38bdf8";
        dragBadge.style.borderColor = (g === 1.62) ? "rgba(255,255,255,0.12)" : "rgba(56, 189, 248, 0.4)";
      }
    } else {
      if (eqnEl) eqnEl.innerHTML = renderLatex("y(x) = y_0 + x\\tan\\theta - \\frac{g x^2}{2v_0^2 \\cos^2\\theta}");
      if (dragBadge) {
        dragBadge.innerText = "Vacuum (Ideal Parabola)";
        dragBadge.style.color = "#94a3b8";
        dragBadge.style.borderColor = "rgba(255,255,255,0.12)";
      }
    }

    if (aeroBadge) {
      const windLabel = windSpeed === 0 ? "Calm" : (windSpeed > 0 ? `Tailwind +${windSpeed} m/s` : `Headwind ${windSpeed} m/s`);
      const spinLabel = spinRpm === 0 ? "0 rpm" : (spinRpm > 0 ? `+${spinRpm} rpm (Lift)` : `${spinRpm} rpm (Dive)`);
      aeroBadge.innerText = `💨 ${windLabel} | 🔄 ${spinLabel}`;
    }

    // Update Photogate Muzzle LED
    const photogateDtMs = (0.15 / speed) * 1000;
    const initialKE = 0.5 * proj.mass * speed * speed;
    const valPhoto = document.getElementById("val-photogate");
    const valEnergy = document.getElementById("val-energy-tot");
    const photoOverlayEl = document.getElementById("photo-overlay-gate");

    if (valPhoto) valPhoto.innerText = `${photogateDtMs.toFixed(2)} ms`;
    if (valEnergy) valEnergy.innerText = `${(initialKE / 1000).toFixed(2)} kJ`;
    if (photoOverlayEl) photoOverlayEl.innerText = `Δt = ${(photogateDtMs / 1000).toFixed(4)} s → v₀ = ${speed.toFixed(1)} m/s`;
  }

  function playLaunchSound() {
    try {
      const ctxA = getAudioCtx();
      if (!ctxA) return;
      const osc = ctxA.createOscillator();
      const gain = ctxA.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, ctxA.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctxA.currentTime + 0.18);
      gain.gain.setValueAtTime(0.35, ctxA.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctxA.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctxA.destination);
      osc.start();
      osc.stop(ctxA.currentTime + 0.18);
    } catch(e) {}
  }

  function playTargetHitSound() {
    try {
      const ctxA = getAudioCtx();
      if (!ctxA) return;
      const osc = ctxA.createOscillator();
      const gain = ctxA.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587, ctxA.currentTime);
      osc.frequency.setValueAtTime(880, ctxA.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctxA.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctxA.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctxA.destination);
      osc.start();
      osc.stop(ctxA.currentTime + 0.35);
    } catch(e) {}
  }

  function playBasketballSwishSound() {
    try {
      const ctxA = getAudioCtx();
      if (!ctxA) return;
      // White noise burst for nylon net swish
      const bufferSize = ctxA.sampleRate * 0.18;
      const buffer = ctxA.createBuffer(1, bufferSize, ctxA.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = ctxA.createBufferSource();
      noise.buffer = buffer;
      const filter = ctxA.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1800;
      const gain = ctxA.createGain();
      gain.gain.setValueAtTime(0.4, ctxA.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctxA.currentTime + 0.18);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctxA.destination);
      noise.start();
    } catch(e) {}
  }

  function playWallImpactSound() {
    try {
      const ctxA = getAudioCtx();
      if (!ctxA) return;
      const osc = ctxA.createOscillator();
      const gain = ctxA.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(90, ctxA.currentTime);
      osc.frequency.exponentialRampToValueAtTime(25, ctxA.currentTime + 0.25);
      gain.gain.setValueAtTime(0.5, ctxA.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctxA.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctxA.destination);
      osc.start();
      osc.stop(ctxA.currentTime + 0.25);
    } catch(e) {}
  }

  function playDroneInterceptSound() {
    try {
      const ctxA = getAudioCtx();
      if (!ctxA) return;
      const osc = ctxA.createOscillator();
      const gain = ctxA.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(650, ctxA.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctxA.currentTime + 0.35);
      gain.gain.setValueAtTime(0.4, ctxA.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctxA.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctxA.destination);
      osc.start();
      osc.stop(ctxA.currentTime + 0.35);
    } catch(e) {}
  }

  function createExplosion(px, py, color, count = 28) {
    for (let i = 0; i < count; i++) {
      const angleP = Math.random() * Math.PI * 2;
      const speedP = 2 + Math.random() * 7;
      particles.push({
        x: px,
        y: py,
        vx: Math.cos(angleP) * speedP,
        vy: Math.sin(angleP) * speedP,
        life: 1.0,
        decay: 0.03 + Math.random() * 0.04,
        color: color,
        size: 3 + Math.random() * 4
      });
    }
  }

  function createMuzzleFlash(px, py, angDeg) {
    const rad = -angDeg * Math.PI / 180;
    for (let i = 0; i < 22; i++) {
      const spread = (Math.random() - 0.5) * 0.5;
      const pSpeed = 4 + Math.random() * 7;
      particles.push({
        x: px,
        y: py,
        vx: Math.cos(rad + spread) * pSpeed,
        vy: Math.sin(rad + spread) * pSpeed,
        life: 1.0,
        decay: 0.04 + Math.random() * 0.05,
        color: Math.random() > 0.4 ? "#f59e0b" : "#38bdf8",
        size: 3 + Math.random() * 5
      });
    }
  }

  function metersToPixels(x, y) {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const scale = (w - 120) / 280;
    const originX = 70;
    const originY = h - 75;
    return {
      px: originX + x * scale,
      py: originY - y * scale,
      scale
    };
  }

  // -------------------------------------------------------------------
  // Dedicated Analytical Trajectory & Thermodynamic Energy Chart View
  // -------------------------------------------------------------------
  function drawAnalyticalCharts(ctx2d, width, heightPx, isDay) {
    ctx2d.save();

    // Chart Canvas Background
    ctx2d.fillStyle = isDay ? "#f8fafc" : "#080e1e";
    ctx2d.fillRect(0, 0, width, heightPx);

    // Title & Header Bar
    ctx2d.fillStyle = isDay ? "#0f172a" : "#f8fafc";
    ctx2d.font = "bold 13px JetBrains Mono, sans-serif";
    ctx2d.fillText("📊 BALLISTIC PHASE-SPACE & THERMODYNAMIC ENERGY PARTITION", 24, 28);

    ctx2d.fillStyle = "#38bdf8";
    ctx2d.font = "11px JetBrains Mono, sans-serif";
    const proj = PROJECTILE_PRESETS[projectileType] || PROJECTILE_PRESETS.cannonball;
    ctx2d.fillText(`Projectile: ${proj.name} | Mass: ${proj.mass} kg | Angle: ${angle}° | Speed: ${speed} m/s | Drag: ${enableAirDrag ? "ACTIVE" : "VACUUM"}`, 24, 46);

    const leftWidth = width * 0.58;
    const rightLeft = leftWidth + 24;
    const rightWidth = width - rightLeft - 24;

    // ---------------------------------------------------------------
    // 1. LEFT PANEL: Trajectory Envelope Comparison (y vs x)
    // ---------------------------------------------------------------
    const plotMargin = { top: 75, left: 60, bottom: heightPx - 45, right: leftWidth - 10 };
    const plotW = plotMargin.right - plotMargin.left;
    const plotH = plotMargin.bottom - plotMargin.top;

    // Background Panel
    ctx2d.fillStyle = isDay ? "rgba(226, 232, 240, 0.4)" : "rgba(15, 23, 42, 0.65)";
    ctx2d.fillRect(plotMargin.left, plotMargin.top, plotW, plotH);
    ctx2d.strokeStyle = isDay ? "rgba(15, 23, 42, 0.15)" : "rgba(255, 255, 255, 0.12)";
    ctx2d.lineWidth = 1;
    ctx2d.strokeRect(plotMargin.left, plotMargin.top, plotW, plotH);

    // Axis Scales: X [0 to 280 m], Y [0 to 90 m]
    const maxX = 280;
    const maxY = 90;
    const xToPx = (xVal) => plotMargin.left + (xVal / maxX) * plotW;
    const yToPx = (yVal) => plotMargin.bottom - (yVal / maxY) * plotH;

    // Grid lines & labels
    ctx2d.fillStyle = isDay ? "rgba(15, 23, 42, 0.5)" : "rgba(255, 255, 255, 0.35)";
    ctx2d.font = "9px JetBrains Mono, sans-serif";
    for (let gx = 0; gx <= maxX; gx += 40) {
      const gpx = xToPx(gx);
      ctx2d.strokeStyle = isDay ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.05)";
      ctx2d.beginPath();
      ctx2d.moveTo(gpx, plotMargin.top);
      ctx2d.lineTo(gpx, plotMargin.bottom);
      ctx2d.stroke();
      ctx2d.fillText(`${gx}m`, gpx - 10, plotMargin.bottom + 15);
    }
    for (let gy = 0; gy <= maxY; gy += 15) {
      const gpy = yToPx(gy);
      ctx2d.strokeStyle = isDay ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.05)";
      ctx2d.beginPath();
      ctx2d.moveTo(plotMargin.left, gpy);
      ctx2d.lineTo(plotMargin.right, gpy);
      ctx2d.stroke();
      ctx2d.fillText(`${gy}m`, plotMargin.left - 30, gpy + 3);
    }

    // A. Theoretical Vacuum Parabola (Dashed Cyan Curve)
    const rad = angle * Math.PI / 180;
    const rVac = (speed * speed * Math.sin(2 * rad)) / g;
    ctx2d.strokeStyle = "#38bdf8";
    ctx2d.lineWidth = 2;
    ctx2d.setLineDash([4, 4]);
    ctx2d.beginPath();
    for (let xM = 0; xM <= maxX; xM += 2) {
      const yM = height + xM * Math.tan(rad) - (g * xM * xM) / (2 * speed * speed * Math.cos(rad) * Math.cos(rad));
      if (yM < 0) break;
      const cpx = xToPx(xM);
      const cpy = yToPx(yM);
      if (xM === 0) ctx2d.moveTo(cpx, cpy);
      else ctx2d.lineTo(cpx, cpy);
    }
    ctx2d.stroke();
    ctx2d.setLineDash([]);

    // B. Actual Trajectory (With Drag / Wind / Magnus)
    if (currentTrajectory.length > 1) {
      ctx2d.strokeStyle = "#10b981";
      ctx2d.lineWidth = 3;
      ctx2d.beginPath();
      currentTrajectory.forEach((pt, idx) => {
        const cpx = xToPx(pt.x);
        const cpy = yToPx(pt.y);
        if (idx === 0) ctx2d.moveTo(cpx, cpy);
        else ctx2d.lineTo(cpx, cpy);
      });
      ctx2d.stroke();
    }

    // C. Target Crosshair
    const tXpx = xToPx(targetX);
    ctx2d.strokeStyle = "#ec4899";
    ctx2d.lineWidth = 1.5;
    ctx2d.setLineDash([3, 3]);
    ctx2d.beginPath();
    ctx2d.moveTo(tXpx, plotMargin.top);
    ctx2d.lineTo(tXpx, plotMargin.bottom);
    ctx2d.stroke();
    ctx2d.setLineDash([]);
    ctx2d.fillStyle = "#ec4899";
    ctx2d.font = "bold 9px JetBrains Mono, sans-serif";
    ctx2d.fillText(`TARGET ${targetX}m`, tXpx - 26, plotMargin.top + 16);

    // D. Trajectory Legend Card
    ctx2d.fillStyle = isDay ? "rgba(255, 255, 255, 0.85)" : "rgba(15, 23, 42, 0.88)";
    ctx2d.strokeStyle = "rgba(56, 189, 248, 0.3)";
    ctx2d.fillRect(plotMargin.left + 15, plotMargin.top + 15, 175, 70);
    ctx2d.strokeRect(plotMargin.left + 15, plotMargin.top + 15, 175, 70);

    ctx2d.fillStyle = "#38bdf8";
    ctx2d.fillText(`-- Vacuum Parabola: ${rVac.toFixed(1)} m`, plotMargin.left + 25, plotMargin.top + 34);
    ctx2d.fillStyle = "#10b981";
    const lastTraj = currentTrajectory[currentTrajectory.length - 1];
    const actualR = lastTraj ? lastTraj.x : 0;
    ctx2d.fillText(`— Actual Flight: ${actualR.toFixed(1)} m`, plotMargin.left + 25, plotMargin.top + 52);
    ctx2d.fillStyle = "#f59e0b";
    const diffR = rVac - actualR;
    ctx2d.fillText(`ΔR Attenuation: -${diffR.toFixed(1)} m`, plotMargin.left + 25, plotMargin.top + 70);

    // ---------------------------------------------------------------
    // 2. RIGHT TOP PANEL: Velocity Decomposition Decay (v vs t)
    // ---------------------------------------------------------------
    const rightTopH = (plotH - 20) * 0.5;
    ctx2d.fillStyle = isDay ? "rgba(226, 232, 240, 0.4)" : "rgba(15, 23, 42, 0.65)";
    ctx2d.fillRect(rightLeft, plotMargin.top, rightWidth, rightTopH);
    ctx2d.strokeStyle = isDay ? "rgba(15, 23, 42, 0.15)" : "rgba(255, 255, 255, 0.12)";
    ctx2d.strokeRect(rightLeft, plotMargin.top, rightWidth, rightTopH);

    ctx2d.fillStyle = isDay ? "#0f172a" : "#94a3b8";
    ctx2d.font = "bold 10px JetBrains Mono, sans-serif";
    ctx2d.fillText("VELOCITY COMPONENT DECAY v(t)", rightLeft + 12, plotMargin.top + 18);

    if (currentTrajectory.length > 2) {
      const maxT = currentTrajectory[currentTrajectory.length - 1].t || 5.0;
      const maxV = Math.max(speed * 1.1, 40);

      const tToPx = (tVal) => rightLeft + 20 + (tVal / maxT) * (rightWidth - 40);
      const vToPx = (vVal) => (plotMargin.top + rightTopH - 15) - (vVal / maxV) * (rightTopH - 40);

      // vx(t) Line [Cyan]
      ctx2d.strokeStyle = "#06b6d4";
      ctx2d.lineWidth = 2;
      ctx2d.beginPath();
      currentTrajectory.forEach((pt, i) => {
        const cpx = tToPx(pt.t);
        const cpy = vToPx(pt.vx || 0);
        if (i === 0) ctx2d.moveTo(cpx, cpy);
        else ctx2d.lineTo(cpx, cpy);
      });
      ctx2d.stroke();

      // vy(t) Line [Amber]
      ctx2d.strokeStyle = "#f59e0b";
      ctx2d.lineWidth = 2;
      ctx2d.beginPath();
      currentTrajectory.forEach((pt, i) => {
        const cpx = tToPx(pt.t);
        const cpy = vToPx(Math.abs(pt.vy || 0));
        if (i === 0) ctx2d.moveTo(cpx, cpy);
        else ctx2d.lineTo(cpx, cpy);
      });
      ctx2d.stroke();

      // Legend
      ctx2d.fillStyle = "#06b6d4";
      ctx2d.font = "9px JetBrains Mono, sans-serif";
      ctx2d.fillText("v_x(t) Horizontal", rightLeft + rightWidth - 110, plotMargin.top + 18);
      ctx2d.fillStyle = "#f59e0b";
      ctx2d.fillText("|v_y(t)| Vertical", rightLeft + rightWidth - 110, plotMargin.top + 32);
    } else {
      ctx2d.fillStyle = "#94a3b8";
      ctx2d.font = "italic 10px JetBrains Mono, sans-serif";
      ctx2d.fillText("Launch projectile to stream dynamic velocity decay", rightLeft + 20, plotMargin.top + rightTopH / 2);
    }

    // ---------------------------------------------------------------
    // 3. RIGHT BOTTOM PANEL: Thermodynamic Energy Conservation Bar
    // ---------------------------------------------------------------
    const rightBotTop = plotMargin.top + rightTopH + 16;
    const rightBotH = plotMargin.bottom - rightBotTop;

    ctx2d.fillStyle = isDay ? "rgba(226, 232, 240, 0.4)" : "rgba(15, 23, 42, 0.65)";
    ctx2d.fillRect(rightLeft, rightBotTop, rightWidth, rightBotH);
    ctx2d.strokeStyle = isDay ? "rgba(15, 23, 42, 0.15)" : "rgba(255, 255, 255, 0.12)";
    ctx2d.strokeRect(rightLeft, rightBotTop, rightWidth, rightBotH);

    ctx2d.fillStyle = isDay ? "#0f172a" : "#94a3b8";
    ctx2d.font = "bold 10px JetBrains Mono, sans-serif";
    ctx2d.fillText("THERMODYNAMIC ENERGY CONSERVATION (FIRST LAW)", rightLeft + 12, rightBotTop + 18);

    const m = proj.mass;
    const e0 = 0.5 * m * speed * speed + m * g * height;
    let currKE = 0;
    let currPE = 0;
    let currWdrag = 0;

    if (currentTrajectory.length > 0) {
      const pt = currentTrajectory[currentTrajectory.length - 1];
      const vx = pt.vx || 0;
      const vy = pt.vy || 0;
      currKE = 0.5 * m * (vx * vx + vy * vy);
      currPE = m * g * Math.max(0, pt.y || 0);
      currWdrag = Math.max(0, e0 - (currKE + currPE));
    } else {
      currKE = 0.5 * m * speed * speed;
      currPE = m * g * height;
    }

    const barX = rightLeft + 16;
    const barY = rightBotTop + 36;
    const barW = rightWidth - 32;
    const barH = 24;

    const fracKE = Math.max(0, Math.min(1, currKE / e0));
    const fracPE = Math.max(0, Math.min(1, currPE / e0));
    const fracDrag = Math.max(0, Math.min(1, currWdrag / e0));

    const wKE = barW * fracKE;
    const wPE = barW * fracPE;
    const wDrag = barW * fracDrag;

    // Stacked Energy Bar
    ctx2d.fillStyle = "#10b981"; // Kinetic
    ctx2d.fillRect(barX, barY, wKE, barH);

    ctx2d.fillStyle = "#f59e0b"; // Potential
    ctx2d.fillRect(barX + wKE, barY, wPE, barH);

    ctx2d.fillStyle = "#ef4444"; // Dissipated Drag Heat
    ctx2d.fillRect(barX + wKE + wPE, barY, wDrag, barH);

    ctx2d.strokeStyle = isDay ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.2)";
    ctx2d.strokeRect(barX, barY, barW, barH);

    // Energy Values Breakdown
    ctx2d.font = "9px JetBrains Mono, sans-serif";
    ctx2d.fillStyle = "#10b981";
    ctx2d.fillText(`Kinetic (KE): ${(currKE / 1000).toFixed(2)} kJ (${(fracKE * 100).toFixed(1)}%)`, barX, barY + barH + 18);

    ctx2d.fillStyle = "#f59e0b";
    ctx2d.fillText(`Potential (PE): ${(currPE / 1000).toFixed(2)} kJ (${(fracPE * 100).toFixed(1)}%)`, barX, barY + barH + 32);

    ctx2d.fillStyle = "#ef4444";
    ctx2d.fillText(`Drag Heat (W_drag): ${(currWdrag / 1000).toFixed(2)} kJ (${(fracDrag * 100).toFixed(1)}%)`, barX, barY + barH + 46);

    ctx2d.fillStyle = isDay ? "#334155" : "#38bdf8";
    ctx2d.font = "bold 9px JetBrains Mono, sans-serif";
    ctx2d.fillText(`Initial Mechanical Energy E₀: ${(e0 / 1000).toFixed(2)} kJ (100.0%)`, barX, barY + barH + 62);

    ctx2d.restore();
  }

  // -------------------------------------------------------------------
  // Main Canvas Rendering: Physical Apparatus & Kinematic Scenarios
  // -------------------------------------------------------------------
  function drawScene() {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
    const width = canvas.width / dpr;
    const heightPx = canvas.height / dpr;
    const isDay = document.documentElement.getAttribute("data-theme") === "day";

    if (activeView === "chart") {
      drawAnalyticalCharts(ctx, width, heightPx, isDay);
      return;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, heightPx);

    // 1. Atmosphere Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, heightPx - 75);
    if (isDay) {
      skyGrad.addColorStop(0, "#bae6fd");
      skyGrad.addColorStop(0.6, "#e0f2fe");
      skyGrad.addColorStop(1, "#f8fafc");
    } else {
      skyGrad.addColorStop(0, "#080e1e");
      skyGrad.addColorStop(0.5, "#0f172a");
      skyGrad.addColorStop(1, "#1e293b");
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, heightPx - 75);

    // Stars (Night theme only)
    if (!isDay) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      for (let i = 1; i <= 25; i++) {
        const sx = (i * 97) % width;
        const sy = (i * 43) % (heightPx * 0.35);
        ctx.fillRect(sx, sy, (i % 3 === 0) ? 2 : 1, (i % 3 === 0) ? 2 : 1);
      }
    }

    // Dynamic Atmospheric Wind Streaks
    if (Math.abs(windSpeed) > 1) {
      ctx.strokeStyle = isDay ? "rgba(56, 189, 248, 0.25)" : "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 1;
      windParticles.forEach(wp => {
        wp.x += (windSpeed * 0.4);
        if (wp.x > width + 40) wp.x = -40;
        if (wp.x < -40) wp.x = width + 40;
        ctx.beginPath();
        ctx.moveTo(wp.x, wp.y);
        ctx.lineTo(wp.x + (windSpeed > 0 ? wp.length : -wp.length), wp.y);
        ctx.stroke();
      });
    }

    // 2. Parallax Distant Mountains
    ctx.fillStyle = isDay ? "rgba(148, 163, 184, 0.45)" : "rgba(15, 23, 42, 0.75)";
    ctx.beginPath();
    ctx.moveTo(0, heightPx - 75);
    ctx.lineTo(0, heightPx - 180);
    ctx.lineTo(width * 0.15, heightPx - 230);
    ctx.lineTo(width * 0.35, heightPx - 160);
    ctx.lineTo(width * 0.55, heightPx - 210);
    ctx.lineTo(width * 0.8, heightPx - 150);
    ctx.lineTo(width, heightPx - 190);
    ctx.lineTo(width, heightPx - 75);
    ctx.closePath();
    ctx.fill();

    // 3. Wind Sock on Left Boundary
    const sockBaseX = 35;
    const sockBaseY = heightPx - 220;
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(sockBaseX, heightPx - 75);
    ctx.lineTo(sockBaseX, sockBaseY);
    ctx.stroke();

    // Swivel ring & sock cone
    const sockTilt = Math.max(-0.85, Math.min(0.85, windSpeed * 0.04));
    const sockLen = 32;
    const sockTipX = sockBaseX + Math.sin(sockTilt) * sockLen + (windSpeed >= 0 ? 1 : -1) * (Math.abs(windSpeed) > 1 ? 16 : 4);
    const sockTipY = sockBaseY + Math.cos(sockTilt) * 12 + 10;

    ctx.save();
    ctx.translate(sockBaseX, sockBaseY);
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(sockTipX - sockBaseX, sockTipY - sockBaseY);
    ctx.lineTo(0, 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = isDay ? "#0284c7" : "#38bdf8";
    ctx.font = "bold 9px JetBrains Mono, sans-serif";
    ctx.fillText(`${windSpeed > 0 ? "+" : ""}${windSpeed}m/s`, sockBaseX - 16, sockBaseY - 10);

    // 4. Coordinate Grid Lines & Metric Graduations
    ctx.strokeStyle = isDay ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= 280; x += 20) {
      const p = metersToPixels(x, 0);
      ctx.beginPath();
      ctx.moveTo(p.px, 0);
      ctx.lineTo(p.px, heightPx - 75);
      ctx.stroke();

      ctx.fillStyle = (x % 40 === 0) 
        ? (isDay ? "#0284c7" : "#38bdf8") 
        : (isDay ? "rgba(15, 23, 42, 0.5)" : "rgba(255, 255, 255, 0.35)");
      ctx.font = (x % 40 === 0) ? "bold 11px JetBrains Mono" : "10px JetBrains Mono";
      ctx.fillText(`${x}m`, p.px - 10, heightPx - 55);

      ctx.fillStyle = (x % 40 === 0) ? "#38bdf8" : (isDay ? "rgba(15, 23, 42, 0.2)" : "rgba(255, 255, 255, 0.2)");
      ctx.fillRect(p.px - 1, heightPx - 75, 2, 8);
    }

    // Horizontal Altitude Grid Lines
    for (let y = 10; y <= 100; y += 10) {
      const p = metersToPixels(0, y);
      if (p.py > 20) {
        ctx.beginPath();
        ctx.moveTo(70, p.py);
        ctx.lineTo(width, p.py);
        ctx.stroke();

        ctx.fillStyle = isDay ? "rgba(15, 23, 42, 0.4)" : "rgba(255, 255, 255, 0.25)";
        ctx.font = "9px JetBrains Mono";
        ctx.fillText(`${y}m`, 38, p.py + 3);
      }
    }

    // 5. Ground Cross-Section
    const groundGrad = ctx.createLinearGradient(0, heightPx - 75, 0, heightPx);
    if (isDay) {
      groundGrad.addColorStop(0, "#475569");
      groundGrad.addColorStop(0.3, "#334155");
      groundGrad.addColorStop(1, "#1e293b");
    } else {
      groundGrad.addColorStop(0, "#1e293b");
      groundGrad.addColorStop(0.3, "#0f172a");
      groundGrad.addColorStop(1, "#070a12");
    }
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, heightPx - 75, width, 75);

    // Glowing Neon Turf Boundary
    ctx.strokeStyle = isDay ? "#059669" : "#10b981";
    ctx.lineWidth = 2.5;
    ctx.shadowColor = "#10b981";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(0, heightPx - 75);
    ctx.lineTo(width, heightPx - 75);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 6. Draw Targets based on Active Scenario
    const targetPx = metersToPixels(targetX, 0);

    if (targetScenario === "field") {
      // Standard Flag Target
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(targetPx.px, heightPx - 75);
      ctx.lineTo(targetPx.px, heightPx - 135);
      ctx.stroke();

      ctx.fillStyle = "#ec4899";
      ctx.shadowColor = "#ec4899";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(targetPx.px, heightPx - 135);
      ctx.lineTo(targetPx.px + 28, heightPx - 120);
      ctx.lineTo(targetPx.px, heightPx - 105);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = "#ec4899";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(targetPx.px, heightPx - 75, 12, 4, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#f472b6";
      ctx.font = "bold 10px JetBrains Mono";
      ctx.fillText("TARGET ↔", targetPx.px - 24, heightPx - 142);
    } else if (targetScenario === "hoop") {
      // Basketball Regulation Hoop (y = 3.05 m rim)
      const rimYm = 3.05;
      const rimPos = metersToPixels(targetX, rimYm);
      const groundPos = metersToPixels(targetX, 0);

      // Support post
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(rimPos.px + 18, groundPos.py);
      ctx.lineTo(rimPos.px + 18, rimPos.py - 15);
      ctx.stroke();

      // Backboard (plexiglass with border)
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.strokeStyle = "#f8fafc";
      ctx.lineWidth = 2;
      ctx.fillRect(rimPos.px + 14, rimPos.py - 30, 4, 35);
      ctx.strokeRect(rimPos.px + 14, rimPos.py - 30, 4, 35);

      // Inner target square
      ctx.strokeStyle = "#ef4444";
      ctx.strokeRect(rimPos.px + 14, rimPos.py - 18, 2, 14);

      // Orange Iron Rim
      ctx.strokeStyle = "#f97316";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(rimPos.px - 14, rimPos.py);
      ctx.lineTo(rimPos.px + 14, rimPos.py);
      ctx.stroke();

      // Net (nylon white cords)
      const netWave = hoopSwishAnim > 0 ? Math.sin(Date.now() * 0.05) * 8 * hoopSwishAnim : 0;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(rimPos.px - 12, rimPos.py);
      ctx.lineTo(rimPos.px - 6 + netWave, rimPos.py + 18);
      ctx.lineTo(rimPos.px + 6 + netWave, rimPos.py + 18);
      ctx.lineTo(rimPos.px + 12, rimPos.py);
      ctx.stroke();

      ctx.fillStyle = "#fb923c";
      ctx.font = "bold 9px JetBrains Mono";
      ctx.fillText("HOOP (3.05m)", rimPos.px - 28, rimPos.py - 35);
    } else if (targetScenario === "castle") {
      // 16m Stone Fortress Wall at x = 75m, Courtyard flag at targetX
      const wallXm = 75;
      const wallYm = 16;
      const wallP = metersToPixels(wallXm, wallYm);
      const wallBaseP = metersToPixels(wallXm, 0);

      // Stone Wall Block
      const wallWidthPx = 18;
      ctx.fillStyle = "#334155";
      ctx.fillRect(wallP.px - wallWidthPx / 2, wallP.py, wallWidthPx, wallBaseP.py - wallP.py);
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 2;
      ctx.strokeRect(wallP.px - wallWidthPx / 2, wallP.py, wallWidthPx, wallBaseP.py - wallP.py);

      // Battlements (crenellations)
      ctx.fillStyle = "#475569";
      for (let c = -1; c <= 1; c++) {
        if (c % 2 === 0) {
          ctx.fillRect(wallP.px - 6, wallP.py - 8, 12, 8);
        }
      }

      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 9px JetBrains Mono";
      ctx.fillText("WALL (16m)", wallP.px - 22, wallP.py - 12);

      // Courtyard flag at targetX
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(targetPx.px, heightPx - 75);
      ctx.lineTo(targetPx.px, heightPx - 115);
      ctx.stroke();

      ctx.fillStyle = "#10b981";
      ctx.beginPath();
      ctx.moveTo(targetPx.px, heightPx - 115);
      ctx.lineTo(targetPx.px + 20, heightPx - 105);
      ctx.lineTo(targetPx.px, heightPx - 95);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#34d399";
      ctx.font = "bold 9px JetBrains Mono";
      ctx.fillText("KEEP ↔", targetPx.px - 14, heightPx - 122);
    } else if (targetScenario === "drone") {
      // Drone hovering & gliding
      droneTime += 0.03;
      const droneXm = targetX + 25 * Math.sin(droneTime * 0.7);
      const droneYm = 26 + 5 * Math.cos(droneTime * 0.5);
      const droneP = metersToPixels(droneXm, droneYm);

      // Quadcopter body
      ctx.save();
      ctx.translate(droneP.px, droneP.py);

      // Drone arms
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-16, -6);
      ctx.lineTo(16, 6);
      ctx.moveTo(-16, 6);
      ctx.lineTo(16, -6);
      ctx.stroke();

      // Center fuselage
      ctx.fillStyle = "#0284c7";
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Spinning rotor discs
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1;
      [-16, 16].forEach(rx => {
        [-6, 6].forEach(ry => {
          ctx.beginPath();
          ctx.ellipse(rx, ry, 7, 2, 0, 0, Math.PI * 2);
          ctx.stroke();
        });
      });

      // Flashing navigation LED
      ctx.fillStyle = (Math.floor(Date.now() / 250) % 2 === 0) ? "#ef4444" : "#10b981";
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 9px JetBrains Mono";
      ctx.fillText(`DRONE (${droneYm.toFixed(0)}m)`, droneP.px - 26, droneP.py - 16);
    }

    // 7. Draw Past Trajectories
    trajectoryHistory.forEach((traj) => {
      if (traj.points.length < 2) return;
      ctx.strokeStyle = traj.color || "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      traj.points.forEach((pt, pIdx) => {
        const p = metersToPixels(pt.x, pt.y);
        if (pIdx === 0) ctx.moveTo(p.px, p.py);
        else ctx.lineTo(p.px, p.py);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      if (traj.apex) {
        const aPx = metersToPixels(traj.apex.x, traj.apex.y);
        ctx.fillStyle = traj.color || "rgba(255, 255, 255, 0.4)";
        ctx.beginPath();
        ctx.arc(aPx.px, aPx.py, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Stroboscopic Multi-Flash Afterimages
    if (showStrobe) {
      strobeFlashPoints.forEach((sPt) => {
        const sp = metersToPixels(sPt.x, sPt.y);
        ctx.fillStyle = "rgba(251, 191, 36, 0.35)";
        ctx.shadowColor = "#fbbf24";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(sp.px, sp.py, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    }

    // 8. Draw Current Glowing Trajectory
    if (currentTrajectory.length > 1) {
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 3.5;
      ctx.shadowColor = "#0284c7";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      currentTrajectory.forEach((pt, pIdx) => {
        const p = metersToPixels(pt.x, pt.y);
        if (pIdx === 0) ctx.moveTo(p.px, p.py);
        else ctx.lineTo(p.px, p.py);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // 9. Launch Cliff / Platform
    const cannonOrigin = metersToPixels(0, height);
    if (height > 0) {
      const cliffGrad = ctx.createLinearGradient(cannonOrigin.px - 35, 0, cannonOrigin.px + 20, 0);
      cliffGrad.addColorStop(0, "#334155");
      cliffGrad.addColorStop(0.5, "#475569");
      cliffGrad.addColorStop(1, "#1e293b");
      ctx.fillStyle = cliffGrad;
      ctx.fillRect(cannonOrigin.px - 40, cannonOrigin.py, 50, (heightPx - 75) - cannonOrigin.py);

      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cannonOrigin.px - 40, cannonOrigin.py);
      ctx.lineTo(cannonOrigin.px + 10, cannonOrigin.py);
      ctx.lineTo(cannonOrigin.px + 10, heightPx - 75);
      ctx.stroke();
    }

    // 10. Photorealistic Brushed-Steel Cannon Assembly & Laser Photogates
    ctx.save();
    ctx.translate(cannonOrigin.px, cannonOrigin.py);

    // Quadrant Protractor arc
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 42, -Math.PI / 2, 0);
    ctx.stroke();

    for (let deg = 0; deg <= 90; deg += 15) {
      const rad = -deg * Math.PI / 180;
      const rInner = 36;
      const rOuter = (deg % 45 === 0) ? 46 : 42;
      ctx.beginPath();
      ctx.moveTo(Math.cos(rad) * rInner, Math.sin(rad) * rInner);
      ctx.lineTo(Math.cos(rad) * rOuter, Math.sin(rad) * rOuter);
      ctx.stroke();
    }

    ctx.rotate(-angle * Math.PI / 180);

    // Steel Barrel
    const barrelGrad = ctx.createLinearGradient(0, -12, 0, 12);
    barrelGrad.addColorStop(0, "#64748b");
    barrelGrad.addColorStop(0.3, "#cbd5e1");
    barrelGrad.addColorStop(0.6, "#334155");
    barrelGrad.addColorStop(1, "#0f172a");
    ctx.fillStyle = barrelGrad;
    ctx.fillRect(0, -11, 46, 22);

    // Muzzle Collar
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(44, -13, 6, 26);
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1;
    ctx.strokeRect(44, -13, 6, 26);

    // Laser Photogate Muzzle Sensor Mount (Ruby Beams)
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(48, -17, 10, 34);
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 1;
    ctx.strokeRect(48, -17, 10, 34);

    // Laser Beams
    ctx.strokeStyle = "rgba(239, 68, 68, 0.75)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(51, -16);
    ctx.lineTo(51, 16);
    ctx.moveTo(56, -16);
    ctx.lineTo(56, 16);
    ctx.stroke();

    ctx.restore();

    // Cannon Carriage Mount
    const carriageGrad = ctx.createRadialGradient(cannonOrigin.px, cannonOrigin.py, 3, cannonOrigin.px, cannonOrigin.py, 18);
    carriageGrad.addColorStop(0, "#94a3b8");
    carriageGrad.addColorStop(0.5, "#475569");
    carriageGrad.addColorStop(1, "#0f172a");
    ctx.fillStyle = carriageGrad;
    ctx.beginPath();
    ctx.arc(cannonOrigin.px, cannonOrigin.py, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(cannonOrigin.px, cannonOrigin.py, 6, 0, Math.PI * 2);
    ctx.fill();

    // 11. Update & Draw Animated Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Decay hoop swish ripple
    if (hoopSwishAnim > 0) hoopSwishAnim = Math.max(0, hoopSwishAnim - 0.03);

    // 12. Flying Projectile Ball with Specialized Graphics & Vector Decomposition
    if (isFlying && currentTrajectory.length > 0) {
      const currentPt = currentTrajectory[currentTrajectory.length - 1];
      const p = metersToPixels(currentPt.x, currentPt.y);

      // Trailing condensation smoke
      if (Math.random() > 0.3) {
        particles.push({
          x: p.px,
          y: p.py,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          life: 0.6,
          decay: 0.05,
          color: "rgba(255, 255, 255, 0.4)",
          size: 4
        });
      }

      // Draw projectile sphere tailored to type
      const proj = PROJECTILE_PRESETS[projectileType] || PROJECTILE_PRESETS.cannonball;
      ctx.save();
      ctx.translate(p.px, p.py);

      if (proj.id === "baseball") {
        // Baseball: White sphere with red curve stitches
        ctx.fillStyle = "#f8fafc";
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(-2, 0, 5, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
      } else if (proj.id === "golfball") {
        // Golf ball: Dimpled white
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(100, 116, 139, 0.4)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
      } else if (proj.id === "artillery") {
        // Artillery: Aerodynamic shell
        const flightAngle = Math.atan2(currentPt.vy, currentPt.vx);
        ctx.rotate(-flightAngle);
        ctx.fillStyle = "#15803d";
        ctx.fillRect(-8, -4, 16, 8);
        ctx.fillStyle = "#b45309";
        ctx.beginPath();
        ctx.moveTo(8, -4);
        ctx.lineTo(14, 0);
        ctx.lineTo(8, 4);
        ctx.closePath();
        ctx.fill();
      } else {
        // Iron Cannonball
        const ballGrad = ctx.createRadialGradient(-2, -2, 1, 0, 0, 9);
        ballGrad.addColorStop(0, "#ffffff");
        ballGrad.addColorStop(0.3, "#fef08a");
        ballGrad.addColorStop(0.7, "#f59e0b");
        ballGrad.addColorStop(1, "#b45309");

        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = 14;
        ctx.fillStyle = ballGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.restore();

      // Ground Shadow
      const shadowX = p.px;
      const shadowY = heightPx - 75;
      const altitudeDelta = (shadowY - p.py);
      const shadowRadius = Math.max(3, 8 - altitudeDelta * 0.02);
      ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      ctx.beginPath();
      ctx.ellipse(shadowX, shadowY, shadowRadius * 1.5, shadowRadius * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Vector Decomposition
      if (showVectors) {
        const vx = currentPt.vx !== undefined ? currentPt.vx : (speed * Math.cos(angle * Math.PI / 180));
        const vy = currentPt.vy !== undefined ? currentPt.vy : (speed * Math.sin(angle * Math.PI / 180) - g * t);
        const scaleV = 0.85;

        // Horizontal Vector
        ctx.strokeStyle = "#06b6d4";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.px + vx * scaleV, p.py);
        ctx.stroke();

        ctx.fillStyle = "#06b6d4";
        ctx.font = "bold 10px JetBrains Mono";
        ctx.fillText(`vₓ=${vx.toFixed(1)}m/s`, p.px + vx * scaleV + 6, p.py + 4);

        // Vertical Vector
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.px, p.py - vy * scaleV);
        ctx.stroke();

        ctx.fillStyle = "#f59e0b";
        ctx.font = "bold 10px JetBrains Mono";
        ctx.fillText(`vᵧ=${vy.toFixed(1)}m/s`, p.px - 58, p.py - vy * scaleV);

        // Resultant Vector
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#10b981";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.px + vx * scaleV, p.py - vy * scaleV);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    ctx.restore();
  }

  // -------------------------------------------------------------------
  // Physics Flight Step & Integration Engine
  // -------------------------------------------------------------------
  function launch() {
    if (isFlying) return;

    isFlying = true;
    t = 0;
    currentTrajectory = [];
    strobeFlashPoints = [];
    document.getElementById("target-hit-banner").style.display = "none";
    document.getElementById("proj-status").innerText = "Projectile In Flight";
    document.getElementById("proj-status-dot").style.background = "#f59e0b";

    const cannonOrigin = metersToPixels(0, height);
    playLaunchSound();
    createMuzzleFlash(cannonOrigin.px + Math.cos(-angle*Math.PI/180)*46, cannonOrigin.py + Math.sin(-angle*Math.PI/180)*46, angle);

    let maxRecordedH = height;
    let apexPoint = null;
    let lastStrobeT = 0;
    let lastStepTime = 0;
    let targetChecked = false;

    const rad = angle * Math.PI / 180;
    let simX = 0;
    let simY = height;
    let simVx = speed * Math.cos(rad);
    let simVy = speed * Math.sin(rad);
    let accumulatedDragWork = 0;

    const proj = PROJECTILE_PRESETS[projectileType] || PROJECTILE_PRESETS.cannonball;
    const m = proj.mass;
    const r = proj.radius;
    const area = Math.PI * r * r;
    const cd = proj.cd;
    const rhoBase = ATMOSPHERE_PRESETS[atmosphereType]?.rho ?? 1.225;
    const omegaRad = spinRpm * 2 * Math.PI / 60;

    function step(now) {
      if (!container || !container.isConnected) {
        isFlying = false;
        if (animId) cancelAnimationFrame(animId);
        return;
      }

      const isSmart = (document.documentElement.getAttribute("data-mode") === "smartboard") ||
                      document.documentElement.classList.contains("fast-smartboard-mode") ||
                      /Android|MAXHUB/i.test(navigator.userAgent);
      const interval = isSmart ? 33.3 : 16.0;

      const currentTime = now || performance.now();
      if (lastStepTime && currentTime - lastStepTime < interval) {
        if (isFlying) animId = requestAnimationFrame(step);
        return;
      }
      const elapsed = lastStepTime ? Math.min((currentTime - lastStepTime) / 1000, 0.1) : (interval / 1000);
      lastStepTime = currentTime;

      const dtFactor = Math.min(Math.max(elapsed * 60, 0.5), 3.0);
      const frameDt = (isSlowMo ? 0.016 : 0.045) * dtFactor;
      const kDrag = getDragCoeff();

      let hitDetected = false;
      let hitMessage = "";
      let wallDeflected = false;

      if (kDrag > 0 || Math.abs(windSpeed) > 0 || Math.abs(spinRpm) > 0) {
        // High-precision sub-stepping Euler-Cromer integration for aerodynamic drag, wind & spin
        const subSteps = 8;
        const subDt = frameDt / subSteps;
        for (let s = 0; s < subSteps; s++) {
          // Barometric air density: rho(y) = rho0 * exp(-y / 8500)
          const rhoAlt = rhoBase * Math.exp(-Math.max(0, simY) / 8500);

          // Relative airspeed vector to wind: v_rel = (vx - wx, vy)
          const vrelX = simVx - windSpeed;
          const vrelY = simVy;
          const vrel = Math.sqrt(vrelX * vrelX + vrelY * vrelY);

          // Aerodynamic Drag Force
          const fDragMag = 0.5 * cd * rhoAlt * area * vrel * vrel;
          const fDragX = -0.5 * cd * rhoAlt * area * vrel * vrelX;
          const fDragY = -0.5 * cd * rhoAlt * area * vrel * vrelY;

          // Magnus Spin Lift / Dive Force
          const spinRatio = (r * Math.abs(omegaRad)) / Math.max(0.5, vrel);
          const cLift = Math.sign(spinRpm) * Math.min(0.40, 0.5 * spinRatio);
          const fMagnusX = -0.5 * cLift * rhoAlt * area * vrel * vrelY;
          const fMagnusY = 0.5 * cLift * rhoAlt * area * vrel * vrelX;

          // Thermal Drag Dissipation
          const powerDrag = Math.abs(fDragX * vrelX + fDragY * vrelY);
          accumulatedDragWork += powerDrag * subDt;

          const ax = (fDragX + fMagnusX) / m;
          const ay = -g + (fDragY + fMagnusY) / m;

          simVx += ax * subDt;
          simVy += ay * subDt;
          simX += simVx * subDt;
          simY += simVy * subDt;
          t += subDt;

          // Castle Wall Collision Check (at x = 75m, height 16m)
          if (targetScenario === "castle" && simX >= 73 && simX <= 77 && simY <= 16) {
            wallDeflected = true;
            break;
          }

          if (simY <= 0) break;
        }
      } else {
        // Pure vacuum analytical kinematics
        t += frameDt;
        simX = (speed * Math.cos(rad)) * t;
        simY = height + (speed * Math.sin(rad)) * t - 0.5 * g * t * t;
        simVx = speed * Math.cos(rad);
        simVy = speed * Math.sin(rad) - g * t;

        // Castle Wall in vacuum
        if (targetScenario === "castle" && simX >= 73 && simX <= 77 && simY <= 16) {
          wallDeflected = true;
        }
      }

      const x = simX;
      const y = Math.max(0, simY);

      if (y > maxRecordedH) {
        maxRecordedH = y;
        apexPoint = { x, y };
      }

      currentTrajectory.push({
        x: parseFloat(x.toFixed(3)),
        y: parseFloat(y.toFixed(3)),
        t: parseFloat(t.toFixed(3)),
        vx: parseFloat(simVx.toFixed(2)),
        vy: parseFloat(simVy.toFixed(2))
      });

      // Stroboscopic Capture at intervals
      if (t - lastStrobeT >= 0.22) {
        strobeFlashPoints.push({ x, y });
        lastStrobeT = t;
      }

      document.getElementById("val-time").innerText = `${t.toFixed(2)} s`;
      document.getElementById("val-maxh").innerText = `${maxRecordedH.toFixed(2)} m`;
      document.getElementById("val-range").innerText = `${x.toFixed(2)} m`;

      // Live Mid-Air Scenario Checks
      if (targetScenario === "hoop" && !targetChecked) {
        // Hoop at targetX, y = 3.05m, falling downwards (simVy < 0)
        if (Math.abs(x - targetX) <= 0.65 && Math.abs(y - 3.05) <= 0.45 && simVy < 0) {
          hitDetected = true;
          targetChecked = true;
          hoopSwishAnim = 1.0;
          playBasketballSwishSound();
          hitMessage = "🏀 SWOOSH! 3-POINTER SCORED! Perfect Arc & Entry Angle!";
        }
      } else if (targetScenario === "drone" && !targetChecked) {
        // Drone position
        const droneXm = targetX + 25 * Math.sin(droneTime * 0.7);
        const droneYm = 26 + 5 * Math.cos(droneTime * 0.5);
        const distToDrone = Math.hypot(x - droneXm, y - droneYm);
        if (distToDrone <= 5.5) {
          hitDetected = true;
          targetChecked = true;
          playDroneInterceptSound();
          const dP = metersToPixels(droneXm, droneYm);
          createExplosion(dP.px, dP.py, "#38bdf8", 40);
          hitMessage = "🛸 TACTICAL INTERCEPT! Drone neutralized in mid-air!";
        }
      }

      drawScene();

      // Check Flight Termination
      const hasLanded = (y <= 0 && t > 0.08) || (kDrag > 0 && simY <= 0 && t > 0.08) || wallDeflected || (hitDetected && targetScenario === "drone");

      if (hasLanded) {
        isFlying = false;
        const impactPx = metersToPixels(x, y);

        if (wallDeflected) {
          playWallImpactSound();
          createExplosion(impactPx.px, impactPx.py, "#94a3b8", 30);
          document.getElementById("target-hit-banner").style.display = "block";
          document.getElementById("target-hit-banner").innerText = "💥 DEFLECTED BY FORTRESS WALL! Lob trajectory higher to clear 16m battlement!";
          document.getElementById("proj-status").innerText = "Impact with Castle Wall";
          document.getElementById("proj-status-dot").style.background = "#ef4444";
        } else if (hitDetected) {
          createExplosion(impactPx.px, impactPx.py, "#ec4899", 35);
          document.getElementById("target-hit-banner").style.display = "block";
          document.getElementById("target-hit-banner").innerText = hitMessage;
          document.getElementById("proj-status").innerText = "🎯 Direct Bullseye Hit!";
          document.getElementById("proj-status-dot").style.background = "#10b981";
        } else if (targetScenario === "field" && Math.abs(x - targetX) <= 4.5) {
          playTargetHitSound();
          createExplosion(impactPx.px, impactPx.py, "#ec4899", 35);
          document.getElementById("target-hit-banner").style.display = "block";
          document.getElementById("target-hit-banner").innerText = "🎯 DIRECT TARGET HIT! Accuracy: 99.8%";
          document.getElementById("proj-status").innerText = "🎯 Direct Bullseye Hit!";
          document.getElementById("proj-status-dot").style.background = "#10b981";
        } else if (targetScenario === "castle" && x >= 85 && Math.abs(x - targetX) <= 8.0) {
          playTargetHitSound();
          createExplosion(impactPx.px, impactPx.py, "#10b981", 35);
          document.getElementById("target-hit-banner").style.display = "block";
          document.getElementById("target-hit-banner").innerText = "🏰 FORTRESS CLEARED! Courtyard Keep Hit!";
          document.getElementById("proj-status").innerText = "Courtyard Keep Hit";
          document.getElementById("proj-status-dot").style.background = "#10b981";
        } else {
          createExplosion(impactPx.px, impactPx.py, "#f59e0b", 22);
          document.getElementById("proj-status").innerText = `Landed at ${x.toFixed(1)}m`;
          document.getElementById("proj-status-dot").style.background = "#38bdf8";
        }

        const trialEntry = LabTrialStore.addTrial("projectile", {
          measurements: {
            "Range (m)": parseFloat(x.toFixed(2)),
            "Flight Time (s)": parseFloat(t.toFixed(2)),
            "Max Altitude (m)": parseFloat(maxRecordedH.toFixed(2)),
            "Angle (°)": angle,
            "Speed (m/s)": speed,
            "Platform Height (m)": height,
            "Air Drag": enableAirDrag ? `Enabled (${proj.name}, Cd=${proj.cd})` : "Disabled (Vacuum)",
            "Wind (m/s)": windSpeed,
            "Spin (rpm)": spinRpm,
            "Target Scenario": TARGET_SCENARIOS[targetScenario]?.name || "Field Target"
          }
        });

        // Update trial pills in HUD
        const currentTrials = LabTrialStore.getTrials("projectile");
        currentTrials.forEach((tr, i) => {
          const pill = document.getElementById(`pill-trial-${i + 1}`);
          if (pill) {
            pill.style.opacity = "1";
            pill.innerText = `Trial ${tr.trialNumber}: R=${tr.measurements["Range (m)"]}m (${enableAirDrag ? "Drag" : "Vac"}, θ=${tr.measurements["Angle (°)"]}°)`;
          }
        });

        trajectoryHistory.push({
          points: [...currentTrajectory],
          apex: apexPoint,
          color: trialEntry.color || ((Math.abs(x - targetX) <= 4.5) ? "#ec4899" : "#38bdf8")
        });

        drawScene();
        return;
      }

      if (isFlying) {
        animId = requestAnimationFrame(step);
      }
    }

    animId = requestAnimationFrame(step);
  }

  // -------------------------------------------------------------------
  // Bind Controls & Event Listeners
  // -------------------------------------------------------------------
  const inAngle = document.getElementById("input-angle");
  const inSpeed = document.getElementById("input-speed");
  const inHeight = document.getElementById("input-height");
  const inTarget = document.getElementById("input-target");
  const inWind = document.getElementById("input-wind");
  const inSpin = document.getElementById("input-spin");
  const selGrav = document.getElementById("select-gravity");
  const selProj = document.getElementById("select-projectile");
  const selScen = document.getElementById("select-scenario");
  const chkVec = document.getElementById("chk-vectors");
  const chkDrag = document.getElementById("chk-air-drag");
  const chkSlow = document.getElementById("chk-slowmo");
  const chkStrobe = document.getElementById("chk-strobe");

  inAngle.addEventListener("input", (e) => {
    angle = parseFloat(e.target.value);
    document.getElementById("disp-angle").innerText = `${angle}°`;
    updateFormulaBar();
    if (!isFlying) drawScene();
  });

  inSpeed.addEventListener("input", (e) => {
    speed = parseFloat(e.target.value);
    document.getElementById("disp-speed").innerText = `${speed} m/s`;
    updateFormulaBar();
    if (!isFlying) drawScene();
  });

  inHeight.addEventListener("input", (e) => {
    height = parseFloat(e.target.value);
    document.getElementById("disp-height").innerText = `${height} m`;
    updateFormulaBar();
    if (!isFlying) drawScene();
  });

  inTarget.addEventListener("input", (e) => {
    targetX = parseFloat(e.target.value);
    document.getElementById("disp-target").innerText = `${targetX} m`;
    if (!isFlying) drawScene();
  });

  if (inWind) {
    inWind.addEventListener("input", (e) => {
      windSpeed = parseFloat(e.target.value);
      const windTxt = windSpeed === 0 ? "0.0 m/s (Calm)" : (windSpeed > 0 ? `+${windSpeed} m/s (Tailwind)` : `${windSpeed} m/s (Headwind)`);
      document.getElementById("disp-wind").innerText = windTxt;
      updateFormulaBar();
      if (!isFlying) drawScene();
    });
  }

  if (inSpin) {
    inSpin.addEventListener("input", (e) => {
      spinRpm = parseFloat(e.target.value);
      const spinTxt = spinRpm === 0 ? "0 rpm (No Spin)" : (spinRpm > 0 ? `+${spinRpm} rpm (Lift)` : `${spinRpm} rpm (Dive)`);
      document.getElementById("disp-spin").innerText = spinTxt;
      updateFormulaBar();
      if (!isFlying) drawScene();
    });
  }

  if (selProj) {
    selProj.addEventListener("change", (e) => {
      projectileType = e.target.value;
      const pInfo = PROJECTILE_PRESETS[projectileType] || PROJECTILE_PRESETS.cannonball;
      document.getElementById("disp-projectile-info").innerText = `${pInfo.emoji} ${pInfo.name.split(" ")[0]} (${pInfo.mass}kg)`;
      updateFormulaBar();
      if (!isFlying) drawScene();
    });
  }

  if (selScen) {
    selScen.addEventListener("change", (e) => {
      targetScenario = e.target.value;
      const sInfo = TARGET_SCENARIOS[targetScenario] || TARGET_SCENARIOS.field;
      document.getElementById("disp-scenario-info").innerText = `${sInfo.emoji} ${sInfo.name.split(" ")[0]}`;
      if (targetScenario === "hoop") {
        inTarget.value = 25;
        targetX = 25;
        document.getElementById("disp-target").innerText = "25 m";
      } else if (targetScenario === "castle") {
        inTarget.value = 110;
        targetX = 110;
        document.getElementById("disp-target").innerText = "110 m";
      }
      if (!isFlying) drawScene();
    });
  }

  selGrav.addEventListener("change", (e) => {
    g = parseFloat(e.target.value);
    const envTexts = {
      "9.8": "🌍 Earth: g = 9.80 m/s²",
      "1.62": "🌕 The Moon: g = 1.62 m/s²",
      "3.71": "🪐 Mars: g = 3.71 m/s²",
      "24.79": "⚡ Jupiter: g = 24.79 m/s²"
    };
    document.getElementById("env-badge").innerText = envTexts[e.target.value] || `g = ${g} m/s²`;
    updateFormulaBar();
    if (!isFlying) drawScene();
  });

  chkVec.addEventListener("change", (e) => {
    showVectors = e.target.checked;
    if (!isFlying) drawScene();
  });

  chkDrag.addEventListener("change", (e) => {
    enableAirDrag = e.target.checked;
    updateFormulaBar();
    if (!isFlying) drawScene();
  });

  chkSlow.addEventListener("change", (e) => {
    isSlowMo = e.target.checked;
  });

  chkStrobe.addEventListener("change", (e) => {
    showStrobe = e.target.checked;
    if (!isFlying) drawScene();
  });

  document.getElementById("btn-launch-projectile").addEventListener("click", launch);

  document.getElementById("btn-clear-trajectories").addEventListener("click", () => {
    trajectoryHistory = [];
    currentTrajectory = [];
    strobeFlashPoints = [];
    particles = [];
    document.getElementById("val-time").innerText = "0.00 s";
    document.getElementById("val-maxh").innerText = "0.00 m";
    document.getElementById("val-range").innerText = "0.00 m";
    document.getElementById("target-hit-banner").style.display = "none";
    document.getElementById("proj-status").innerText = "Ready for Ignition";
    document.getElementById("proj-status-dot").style.background = "#10b981";
    drawScene();
  });

  document.getElementById("btn-opt-45").addEventListener("click", () => {
    angle = 45;
    inAngle.value = 45;
    document.getElementById("disp-angle").innerText = "45°";
    height = 0;
    inHeight.value = 0;
    document.getElementById("disp-height").innerText = "0 m";
    updateFormulaBar();
    launch();
  });

  document.getElementById("btn-opt-comp").addEventListener("click", () => {
    height = 0;
    inHeight.value = 0;
    document.getElementById("disp-height").innerText = "0 m";
    angle = 30;
    inAngle.value = 30;
    document.getElementById("disp-angle").innerText = "30°";
    updateFormulaBar();
    launch();
    if (compTimeout) clearTimeout(compTimeout);
    compTimeout = setTimeout(() => {
      if (!container || !container.isConnected) return;
      angle = 60;
      inAngle.value = 60;
      document.getElementById("disp-angle").innerText = "60°";
      updateFormulaBar();
      launch();
    }, 2800);
  });

  // Direct Canvas Pointer Drag Interaction
  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function isOverTarget(pos) {
    const targetPx = metersToPixels(targetX, 0);
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
    const heightPx = canvas.height / dpr;
    const inX = pos.x >= targetPx.px - 25 && pos.x <= targetPx.px + 40;
    const inY = pos.y >= heightPx - 150 && pos.y <= heightPx - 60;
    return inX && inY;
  }

  function isOverCannon(pos) {
    const cannonOrigin = metersToPixels(0, height);
    const dist = Math.hypot(pos.x - cannonOrigin.px, pos.y - cannonOrigin.py);
    return dist <= 85 && pos.x >= cannonOrigin.px - 20;
  }

  function onPointerDown(e) {
    if (isFlying || activeView === "chart") return;
    const pos = getCanvasCoords(e);
    if (isOverTarget(pos)) {
      isDraggingTarget = true;
      try { canvas.setPointerCapture(e.pointerId); } catch(err) {}
      canvas.style.cursor = "ew-resize";
      e.preventDefault();
    } else if (isOverCannon(pos)) {
      isDraggingAngle = true;
      try { canvas.setPointerCapture(e.pointerId); } catch(err) {}
      canvas.style.cursor = "crosshair";
      e.preventDefault();
    }
  }

  function onPointerMove(e) {
    if (activeView === "chart") return;
    const pos = getCanvasCoords(e);
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
    const width = canvas.width / dpr;

    if (isDraggingTarget) {
      const scale = (width - 120) / 280;
      const originX = 70;
      let newTargetX = Math.round((pos.x - originX) / scale);
      newTargetX = Math.max(30, Math.min(250, newTargetX));
      targetX = newTargetX;
      inTarget.value = targetX;
      document.getElementById("disp-target").innerText = `${targetX} m`;
      drawScene();
      return;
    }

    if (isDraggingAngle) {
      const cannonOrigin = metersToPixels(0, height);
      const dx = pos.x - cannonOrigin.px;
      const dy = pos.y - cannonOrigin.py;
      let deg = Math.round(-Math.atan2(dy, dx) * 180 / Math.PI);
      deg = Math.max(5, Math.min(85, deg));
      angle = deg;
      inAngle.value = angle;
      document.getElementById("disp-angle").innerText = `${angle}°`;
      updateFormulaBar();
      drawScene();
      return;
    }

    if (!isFlying) {
      if (isOverTarget(pos)) {
        canvas.style.cursor = "ew-resize";
      } else if (isOverCannon(pos)) {
        canvas.style.cursor = "crosshair";
      } else {
        canvas.style.cursor = "default";
      }
    }
  }

  function onPointerUp(e) {
    if (isDraggingTarget || isDraggingAngle) {
      isDraggingTarget = false;
      isDraggingAngle = false;
      try { canvas.releasePointerCapture(e.pointerId); } catch(err) {}
      canvas.style.cursor = "default";
    }
  }

  canvas.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);

  // Global Keyboard Shortcuts
  function handleKeydown(e) {
    const tag = e.target ? e.target.tagName : "";
    if (tag === "TEXTAREA" || (tag === "INPUT" && e.target.type !== "range")) {
      return;
    }

    if (e.code === "Space" || e.key === "Enter") {
      e.preventDefault();
      launch();
    } else if (e.key === "c" || e.key === "C") {
      e.preventDefault();
      document.getElementById("btn-clear-trajectories")?.click();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const stepVal = e.shiftKey ? 5 : 1;
      angle = Math.min(85, angle + stepVal);
      inAngle.value = angle;
      document.getElementById("disp-angle").innerText = `${angle}°`;
      updateFormulaBar();
      if (!isFlying) drawScene();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const stepVal = e.shiftKey ? 5 : 1;
      angle = Math.max(5, angle - stepVal);
      inAngle.value = angle;
      document.getElementById("disp-angle").innerText = `${angle}°`;
      updateFormulaBar();
      if (!isFlying) drawScene();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const stepVal = e.shiftKey ? 5 : 1;
      speed = Math.min(75, speed + stepVal);
      inSpeed.value = speed;
      document.getElementById("disp-speed").innerText = `${speed} m/s`;
      updateFormulaBar();
      if (!isFlying) drawScene();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const stepVal = e.shiftKey ? 5 : 1;
      speed = Math.max(10, speed - stepVal);
      inSpeed.value = speed;
      document.getElementById("disp-speed").innerText = `${speed} m/s`;
      updateFormulaBar();
      if (!isFlying) drawScene();
    } else if (e.key === "t" || e.key === "T") {
      e.preventDefault();
      const chk = document.getElementById("chk-air-drag");
      if (chk) {
        chk.checked = !chk.checked;
        enableAirDrag = chk.checked;
        updateFormulaBar();
        if (!isFlying) drawScene();
      }
    } else if (e.key === "v" || e.key === "V") {
      e.preventDefault();
      const chk = document.getElementById("chk-vectors");
      if (chk) {
        chk.checked = !chk.checked;
        showVectors = chk.checked;
        if (!isFlying) drawScene();
      }
    } else if (e.key === "s" || e.key === "S") {
      e.preventDefault();
      const chk = document.getElementById("chk-slowmo");
      if (chk) {
        chk.checked = !chk.checked;
        isSlowMo = chk.checked;
      }
    }
  }

  window.addEventListener("keydown", handleKeydown);

  // View Switchers: Kinematic Canvas vs 4K Bench vs Analytical Charts
  const btnSim = document.getElementById("proj-mode-sim");
  const btnPhoto = document.getElementById("proj-mode-photo");
  const btnChart = document.getElementById("proj-mode-chart");

  btnSim.addEventListener("click", () => {
    activeView = "sim";
    photoOverlay.style.display = "none";
    const formulaBar = document.getElementById("proj-formula-bar");
    if (formulaBar) formulaBar.style.display = "flex";
    btnSim.style.background = "rgba(56, 189, 248, 0.25)";
    btnSim.style.color = "#38bdf8";
    btnPhoto.style.background = "transparent";
    btnPhoto.style.color = "#94a3b8";
    btnChart.style.background = "transparent";
    btnChart.style.color = "#94a3b8";
    drawScene();
  });

  btnPhoto.addEventListener("click", () => {
    activeView = "photo";
    photoOverlay.style.display = "block";
    const formulaBar = document.getElementById("proj-formula-bar");
    if (formulaBar) formulaBar.style.display = "none";
    btnPhoto.style.background = "rgba(56, 189, 248, 0.25)";
    btnPhoto.style.color = "#38bdf8";
    btnSim.style.background = "transparent";
    btnSim.style.color = "#94a3b8";
    btnChart.style.background = "transparent";
    btnChart.style.color = "#94a3b8";
  });

  btnChart.addEventListener("click", () => {
    activeView = "chart";
    photoOverlay.style.display = "none";
    const formulaBar = document.getElementById("proj-formula-bar");
    if (formulaBar) formulaBar.style.display = "none";
    btnChart.style.background = "rgba(56, 189, 248, 0.25)";
    btnChart.style.color = "#38bdf8";
    btnSim.style.background = "transparent";
    btnSim.style.color = "#94a3b8";
    btnPhoto.style.background = "transparent";
    btnPhoto.style.color = "#94a3b8";
    drawScene();
  });

  // Telemetry Suite: CSV Export Button
  document.getElementById("btn-export-proj-csv")?.addEventListener("click", () => {
    const trials = LabTrialStore.getTrials("projectile");
    const headers = ["Time (s)", "x (m)", "y (m)", "vx (m/s)", "vy (m/s)", "Speed v (m/s)", "Kinetic Energy (J)", "Potential Energy (J)", "Drag Work (J)"];
    const proj = PROJECTILE_PRESETS[projectileType] || PROJECTILE_PRESETS.cannonball;
    const m = proj.mass;

    const rows = currentTrajectory.map(pt => {
      const vx = pt.vx || 0;
      const vy = pt.vy || 0;
      const speedV = Math.hypot(vx, vy);
      const ke = 0.5 * m * speedV * speedV;
      const pe = m * g * Math.max(0, pt.y || 0);
      const e0 = 0.5 * m * speed * speed + m * g * height;
      const wdrag = Math.max(0, e0 - (ke + pe));
      return [
        pt.t !== undefined ? pt.t : 0,
        pt.x !== undefined ? pt.x : 0,
        pt.y !== undefined ? pt.y : 0,
        parseFloat(vx.toFixed(2)),
        parseFloat(vy.toFixed(2)),
        parseFloat(speedV.toFixed(2)),
        parseFloat(ke.toFixed(1)),
        parseFloat(pe.toFixed(1)),
        parseFloat(wdrag.toFixed(1))
      ];
    });

    exportLabDataCsv({
      title: "Precision Ballistics & Projectile Motion",
      labId: "projectile",
      parameters: {
        "Elevation Angle (θ)": `${angle}°`,
        "Muzzle Velocity (v₀)": `${speed} m/s`,
        "Initial Height (y₀)": `${height} m`,
        "Gravitational Acceleration (g)": `${g} m/s²`,
        "Target Distance": `${targetX} m`,
        "Projectile Preset": `${proj.name} (m=${proj.mass}kg, Cd=${proj.cd})`,
        "Target Scenario": TARGET_SCENARIOS[targetScenario]?.name || "Field Target",
        "Wind Speed": `${windSpeed} m/s`,
        "Magnus Spin": `${spinRpm} rpm`,
        "Aerodynamic Drag": enableAirDrag ? `Enabled (${proj.name})` : "Vacuum"
      },
      headers,
      dataRows: rows.length > 0 ? rows : [[0, 0, height, parseFloat((speed * Math.cos(angle * Math.PI / 180)).toFixed(2)), parseFloat((speed * Math.sin(angle * Math.PI / 180)).toFixed(2)), speed, 0.5 * m * speed * speed, m * g * height, 0]]
    });
  });

  // Telemetry Suite: Lab Report Generator
  document.getElementById("btn-open-proj-report")?.addEventListener("click", () => {
    const trials = LabTrialStore.getTrials("projectile");
    const proj = PROJECTILE_PRESETS[projectileType] || PROJECTILE_PRESETS.cannonball;
    openLabReportModal({
      title: "Precision Kinematics & Ballistic Aerodynamics",
      subject: "Physics",
      inquiryQuestion: "How do projectile aerodynamics, atmospheric drag, wind vectors, and Magnus spin alter classical parabolic kinematics?",
      parameters: {
        "Launch Angle (θ)": `${angle}°`,
        "Muzzle Speed (v₀)": `${speed} m/s`,
        "Initial Platform Height (y₀)": `${height} m`,
        "Gravity (g)": `${g} m/s²`,
        "Target Scenario": TARGET_SCENARIOS[targetScenario]?.name || "Field Target",
        "Target Position": `${targetX} m`,
        "Projectile": `${proj.name} (m=${proj.mass}kg, r=${proj.radius}m, Cd=${proj.cd})`,
        "Wind Vector (wx)": `${windSpeed} m/s`,
        "Magnus Spin (ω)": `${spinRpm} rpm`,
        "Atmosphere": ATMOSPHERE_PRESETS[atmosphereType]?.name || "Sea Level",
        "Aerodynamic Drag": enableAirDrag ? `Active (${proj.name})` : "Vacuum"
      },
      trials,
      formulas: [
        "y(x) = y_0 + x\\tan\\theta - \\frac{g x^2}{2v_0^2 \\cos^2\\theta}",
        "R = \\frac{v_0^2 \\sin(2\\theta)}{g}",
        "t_{\\text{flight}} = \\frac{2v_0 \\sin\\theta}{g}",
        "H_{\\text{max}} = y_0 + \\frac{v_0^2 \\sin^2\\theta}{2g}",
        "\\vec{F}_d = -\\frac{1}{2} C_d \\rho(y) A \\|\\vec{v} - \\vec{w}\\| (\\vec{v} - \\vec{w})",
        "\\vec{F}_M = \\frac{1}{2} C_L \\rho(y) A \\|\\vec{v} - \\vec{w}\\|^2 \\hat{u}_M",
        "\\Delta t_{\\text{photogate}} = \\frac{\\Delta x_{\\text{gate}}}{v_0} \\quad (\\Delta x = 0.15\\text{ m})",
        "E_0 = \\frac{1}{2} m v_0^2 + mgy_0 = KE(t) + PE(t) + W_{\\text{drag}}(t)"
      ]
    });
  });

  // Mount Post-Lab Checkpoint Assessment
  mountLabCheckpoint("proj-checkpoint-container", "projectile");

  function handleResize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
    const cssWidth = rect.width || canvas.parentElement?.clientWidth || 1000;
    const cssHeight = rect.height || 530;
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);
    drawScene();
  }

  window.addEventListener("resize", handleResize);
  handleResize();
  updateFormulaBar();

  // Day/Night Theme Observer
  if (typeof MutationObserver !== "undefined") {
    themeObserver = new MutationObserver(() => {
      drawScene();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });
  }

  const cleanup = () => {
    if (animId) cancelAnimationFrame(animId);
    if (compTimeout) clearTimeout(compTimeout);
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("keydown", handleKeydown);
    canvas.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerUp);
    if (themeObserver) themeObserver.disconnect();
    if (audioCtx) {
      try { audioCtx.close(); } catch(e) {}
      audioCtx = null;
    }
  };
  _currentProjectileCleanup = cleanup;
  return cleanup;
}
