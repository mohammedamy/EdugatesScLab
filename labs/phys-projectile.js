// Edugates-ClipSAT Science Labs - Precision Kinematics & Projectile Laboratory
// Professional Physics Simulation: 4K Ballistics Bench Photography, Stroboscopic Multi-Flash,
// Vector Decomposition, Air Resistance Drag Physics, and Photogate Telemetry.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";

let _currentProjectileCleanup = null;

export function cleanupProjectileLab() {
  if (typeof _currentProjectileCleanup === "function") {
    try { _currentProjectileCleanup(); } catch (e) {}
    _currentProjectileCleanup = null;
  }
}

export function initProjectileLab(containerId) {
  cleanupProjectileLab();
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="lab-container">
      <!-- Mode & Visual Header Toolbar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #0284c7; box-shadow: 0 0 10px #0284c7;"></span>
            Precision Ballistics & Trajectory Range
          </span>
          <span class="badge" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            Laser Photogate Timing (±0.001 s)
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 12px;">
          <!-- View Switcher -->
          <div class="lab-view-switcher" style="display: flex; border-radius: 8px; padding: 3px;">
            <button id="proj-mode-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🎯 Kinematic Simulation
            </button>
            <button id="proj-mode-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Ballistics Bench
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
      <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(56, 189, 248, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: #070a12; overflow: hidden; height: 520px;">
        <canvas id="projectile-canvas" width="1000" height="520" style="height: 520px; width: 100%; display: block; touch-action: none; cursor: default;"></canvas>

        <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
        <div id="proj-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
          <img src="assets/labs/projectile_bench.jpg" alt="4K Ballistics Apparatus and Photogate Rail" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
          
          <!-- Live Analytical Telemetry Callout on Photo -->
          <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Ballistic Launcher</div>
              <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.95rem;">Spring-Loaded 3-Range Barrel</div>
            </div>
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Dual Laser Photogates</div>
              <div style="color: #10b981; font-weight: 700; font-family: var(--font-mono); font-size: 0.95rem;">Δt = 0.0028 s → v₀ = 35.0 m/s</div>
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

        <!-- Top HUD: Status & Environment (Left) & Precision Telemetry (Right) Unified to Prevent Overlap -->
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
            </div>

            <!-- Target Challenge Banner -->
            <div id="target-hit-banner" style="display: none; background: rgba(16, 185, 129, 0.25); border: 1px solid #10b981; padding: 5px 12px; border-radius: 8px; font-size: 0.8rem; color: #34d399; font-weight: 700; backdrop-filter: blur(8px);">
              🎯 DIRECT TARGET HIT! Accuracy: 99.8%
            </div>
          </div>

          <!-- Top Right High-Precision Telemetry Dashboard -->
          <div class="sim-telemetry-dashboard" style="display: flex; gap: 10px; font-family: var(--font-mono); font-size: 0.82rem; padding: 8px 14px; border-radius: 12px; backdrop-filter: blur(12px); box-shadow: 0 10px 25px rgba(0,0,0,0.6); pointer-events: auto; flex-shrink: 0;">
            <div style="border-right: 1px solid rgba(255,255,255,0.1); padding-right: 10px;">
              <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase;">Flight Time</div>
              <div style="color: #f59e0b; font-weight: 700; font-size: 0.98rem;" id="val-time">0.00 s</div>
            </div>
            <div style="border-right: 1px solid rgba(255,255,255,0.1); padding-right: 10px;">
              <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase;">Max Altitude (H)</div>
              <div style="color: #10b981; font-weight: 700; font-size: 0.98rem;" id="val-maxh">0.00 m</div>
            </div>
            <div style="border-right: 1px solid rgba(255,255,255,0.1); padding-right: 10px;">
              <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase;">Total Range (R)</div>
              <div style="color: #38bdf8; font-weight: 700; font-size: 0.98rem;" id="val-range">0.00 m</div>
            </div>
            <div>
              <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase;">Target Dist</div>
              <div style="color: #ec4899; font-weight: 700; font-size: 0.98rem;" id="val-target">120.0 m</div>
            </div>
          </div>
        </div>

        <!-- Floating Educational Formula Bar -->
        <div id="proj-formula-bar" class="sim-floating-formula-bar" style="position: absolute; bottom: 12px; left: 16px; right: 16px; backdrop-filter: blur(12px); border-radius: 12px; padding: 10px 18px; display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap; gap: 14px; font-size: 0.85rem; z-index: 10;">
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
      <div class="lab-controls-panel" style="margin-top: 18px;">
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
            <span>Launch Platform Elevation (y₀)</span>
            <span class="control-val" id="disp-height">0 m</span>
          </label>
          <input type="range" id="input-height" class="custom-slider" min="0" max="30" value="0">
          <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-dim);">
            <span>0 m (Ground)</span>
            <span>15 m (Hill)</span>
            <span>30 m (Cliff)</span>
          </div>
        </div>

        <!-- Target Distance Slider -->
        <div class="control-group">
          <label class="control-label">
            <span>🎯 Target Flag Position (x)</span>
            <span class="control-val" id="disp-target" style="color: #ec4899;">120 m</span>
          </label>
          <input type="range" id="input-target" class="custom-slider" min="30" max="250" value="120" style="accent-color: #ec4899;">
          <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-dim);">
            <span>30 m</span>
            <span>120 m</span>
            <span>250 m</span>
          </div>
        </div>

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

        <!-- Action Buttons -->
        <div class="lab-action-buttons">
          <button class="btn btn-primary" id="btn-launch-projectile" style="box-shadow: 0 0 15px rgba(56, 189, 248, 0.4);">
            🚀 Launch Projectile
          </button>

          <button class="btn btn-secondary" id="btn-clear-trajectories">
            ↺ Clear Traces
          </button>

          <button class="btn btn-secondary" id="btn-opt-45" style="border-color: rgba(16, 185, 129, 0.4); color: #34d399;">
            Inquiry: 45° Angle Range
          </button>

          <button class="btn btn-secondary" id="btn-opt-comp" style="border-color: rgba(245, 158, 11, 0.4); color: #fbbf24;">
            Inquiry: 30° vs 60° Complementary
          </button>

          <label class="lab-checkbox-label" style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer; user-select: none; margin-left: auto;">
            <input type="checkbox" id="chk-vectors" checked style="accent-color: #10b981; width: 16px; height: 16px;">
            <span>Velocity Vectors (vₓ, vᵧ)</span>
          </label>

          <label class="lab-checkbox-label" style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer; user-select: none; margin-left: 12px;">
            <input type="checkbox" id="chk-air-drag" style="accent-color: #38bdf8; width: 16px; height: 16px;">
            <span>Air Resistance Drag (C_d)</span>
          </label>

          <label class="lab-checkbox-label" style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer; user-select: none; margin-left: 12px;">
            <input type="checkbox" id="chk-slowmo" style="accent-color: #f59e0b; width: 16px; height: 16px;">
            <span>Slow Motion (0.3×)</span>
          </label>
        </div>

        <!-- Keyboard Shortcuts & Direct Canvas Manipulation Hint -->
        <div style="grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; padding: 10px 14px; background: rgba(15, 23, 42, 0.5); border: 1px dashed rgba(255,255,255,0.12); border-radius: 8px; font-size: 0.76rem; color: var(--text-dim); margin-top: 10px;">
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <span><kbd style="background: rgba(255,255,255,0.12); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); color: #38bdf8;">Space</kbd> / <kbd style="background: rgba(255,255,255,0.12); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); color: #38bdf8;">Enter</kbd> Launch</span>
            <span><kbd style="background: rgba(255,255,255,0.12); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); color: #38bdf8;">C</kbd> Clear Traces</span>
            <span><kbd style="background: rgba(255,255,255,0.12); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); color: #38bdf8;">↑/↓</kbd> Angle (±1°)</span>
            <span><kbd style="background: rgba(255,255,255,0.12); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); color: #38bdf8;">←/→</kbd> Velocity (±1 m/s)</span>
            <span><kbd style="background: rgba(255,255,255,0.12); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); color: #38bdf8;">T</kbd> Toggle Air Drag</span>
            <span><kbd style="background: rgba(255,255,255,0.12); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); color: #38bdf8;">V</kbd> Vectors</span>
          </div>
          <span style="color: #38bdf8; font-weight: 600; display: flex; align-items: center; gap: 5px;">
            <span>🎯</span> Drag the Cannon barrel or Target flag directly on the canvas!
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

  let isFlying = false;
  let t = 0;
  let currentTrajectory = [];
  let trajectoryHistory = [];
  let strobeFlashPoints = [];
  let particles = [];
  let animId = null;
  let compTimeout = null;
  let themeObserver = null;

  // Pointer dragging state for canvas interactive manipulation
  let isDraggingAngle = false;
  let isDraggingTarget = false;

  function getDragCoeff() {
    if (!enableAirDrag) return 0;
    if (g === 1.62) return 0; // The Moon has no atmosphere
    if (g === 3.71) return 0.0001; // Mars thin atmosphere
    if (g === 24.79) return 0.012; // Jupiter dense atmosphere
    return 0.0058; // Earth standard atmosphere (0.5 * rho * Cd * A / m)
  }

  function updateFormulaBar() {
    const eqnEl = document.getElementById("proj-formula-eqn");
    const dragBadge = document.getElementById("drag-badge");
    if (enableAirDrag) {
      if (eqnEl) eqnEl.innerHTML = renderLatex("F_d = \\frac{1}{2} C_d \\rho A v^2");
      if (dragBadge) {
        dragBadge.innerText = (g === 1.62) ? "Air Drag: N/A (Moon Vacuum)" : "Air Drag: Active (C_d=0.47)";
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
  }

  function playLaunchSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.18);
    } catch(e) {}
  }

  function playTargetHitSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587, audioCtx.currentTime);
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch(e) {}
  }

  function createExplosion(px, py, color) {
    for (let i = 0; i < 28; i++) {
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
    for (let i = 0; i < 18; i++) {
      const spread = (Math.random() - 0.5) * 0.5;
      const pSpeed = 4 + Math.random() * 6;
      particles.push({
        x: px,
        y: py,
        vx: Math.cos(rad + spread) * pSpeed,
        vy: Math.sin(rad + spread) * pSpeed,
        life: 1.0,
        decay: 0.04 + Math.random() * 0.05,
        color: Math.random() > 0.4 ? "#f59e0b" : "#38bdf8",
        size: 3 + Math.random() * 4
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

  function drawScene() {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
    const width = canvas.width / dpr;
    const heightPx = canvas.height / dpr;
    const isDay = document.documentElement.getAttribute("data-theme") === "day";

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

    // 3. Coordinate Grid Lines & Metric Graduations
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

    // 4. Ground Cross-Section
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

    // 5. Target Flag (Interactive Drag Handle)
    const targetPx = metersToPixels(targetX, 0);
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

    // 6. Draw Past Trajectories
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

    // 7. Draw Current Glowing Trajectory
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

    // 8. Launch Cliff / Platform
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

    // 9. Photorealistic Brushed-Steel Cannon Assembly
    ctx.save();
    ctx.translate(cannonOrigin.px, cannonOrigin.py);

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

    const barrelGrad = ctx.createLinearGradient(0, -12, 0, 12);
    barrelGrad.addColorStop(0, "#64748b");
    barrelGrad.addColorStop(0.3, "#cbd5e1");
    barrelGrad.addColorStop(0.6, "#334155");
    barrelGrad.addColorStop(1, "#0f172a");
    ctx.fillStyle = barrelGrad;
    ctx.fillRect(0, -11, 46, 22);

    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(44, -13, 6, 26);
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1;
    ctx.strokeRect(44, -13, 6, 26);

    ctx.restore();

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

    // 10. Update & Draw Particles
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

    // 11. Flying Projectile Ball & Vector Decomposition
    if (isFlying && currentTrajectory.length > 0) {
      const currentPt = currentTrajectory[currentTrajectory.length - 1];
      const p = metersToPixels(currentPt.x, currentPt.y);

      const ballGrad = ctx.createRadialGradient(p.px - 2, p.py - 2, 1, p.px, p.py, 9);
      ballGrad.addColorStop(0, "#ffffff");
      ballGrad.addColorStop(0.3, "#fef08a");
      ballGrad.addColorStop(0.7, "#f59e0b");
      ballGrad.addColorStop(1, "#b45309");

      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 16;
      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(p.px, p.py, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      const shadowX = p.px;
      const shadowY = heightPx - 75;
      const altitudeDelta = (shadowY - p.py);
      const shadowRadius = Math.max(3, 8 - altitudeDelta * 0.02);
      ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      ctx.beginPath();
      ctx.ellipse(shadowX, shadowY, shadowRadius * 1.5, shadowRadius * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();

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

    const rad = angle * Math.PI / 180;
    let simX = 0;
    let simY = height;
    let simVx = speed * Math.cos(rad);
    let simVy = speed * Math.sin(rad);

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

      if (kDrag > 0) {
        // High-precision sub-stepping Euler-Cromer integration for aerodynamic drag
        const subSteps = 8;
        const subDt = frameDt / subSteps;
        for (let s = 0; s < subSteps; s++) {
          const vMag = Math.sqrt(simVx * simVx + simVy * simVy);
          const dragAcc = kDrag * vMag;
          const ax = -dragAcc * simVx;
          const ay = -g - dragAcc * simVy;
          simVx += ax * subDt;
          simVy += ay * subDt;
          simX += simVx * subDt;
          simY += simVy * subDt;
          t += subDt;
          if (simY <= 0) break;
        }
      } else {
        // Pure vacuum analytical kinematics
        t += frameDt;
        simX = (speed * Math.cos(rad)) * t;
        simY = height + (speed * Math.sin(rad)) * t - 0.5 * g * t * t;
        simVx = speed * Math.cos(rad);
        simVy = speed * Math.sin(rad) - g * t;
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

      drawScene();

      if ((y <= 0 && t > 0.08) || (kDrag > 0 && simY <= 0 && t > 0.08)) {
        isFlying = false;
        const impactPx = metersToPixels(x, 0);
        createExplosion(impactPx.px, impactPx.py, "#f59e0b");

        if (Math.abs(x - targetX) <= 4.5) {
          playTargetHitSound();
          createExplosion(impactPx.px, impactPx.py, "#ec4899");
          document.getElementById("target-hit-banner").style.display = "block";
          document.getElementById("proj-status").innerText = "🎯 Direct Bullseye Hit!";
          document.getElementById("proj-status-dot").style.background = "#10b981";
        } else {
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
            "Air Drag": enableAirDrag ? "Enabled (Cd=0.47)" : "Disabled (Vacuum)"
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

  // Bind controls
  const inAngle = document.getElementById("input-angle");
  const inSpeed = document.getElementById("input-speed");
  const inHeight = document.getElementById("input-height");
  const inTarget = document.getElementById("input-target");
  const selGrav = document.getElementById("select-gravity");
  const chkVec = document.getElementById("chk-vectors");
  const chkDrag = document.getElementById("chk-air-drag");
  const chkSlow = document.getElementById("chk-slowmo");
  const chkStrobe = document.getElementById("chk-strobe");

  inAngle.addEventListener("input", (e) => {
    angle = parseFloat(e.target.value);
    document.getElementById("disp-angle").innerText = `${angle}°`;
    if (!isFlying) drawScene();
  });

  inSpeed.addEventListener("input", (e) => {
    speed = parseFloat(e.target.value);
    document.getElementById("disp-speed").innerText = `${speed} m/s`;
    if (!isFlying) drawScene();
  });

  inHeight.addEventListener("input", (e) => {
    height = parseFloat(e.target.value);
    document.getElementById("disp-height").innerText = `${height} m`;
    if (!isFlying) drawScene();
  });

  inTarget.addEventListener("input", (e) => {
    targetX = parseFloat(e.target.value);
    document.getElementById("disp-target").innerText = `${targetX} m`;
    document.getElementById("val-target").innerText = `${targetX.toFixed(1)} m`;
    if (!isFlying) drawScene();
  });

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
    launch();
  });

  document.getElementById("btn-opt-comp").addEventListener("click", () => {
    height = 0;
    inHeight.value = 0;
    document.getElementById("disp-height").innerText = "0 m";
    angle = 30;
    inAngle.value = 30;
    document.getElementById("disp-angle").innerText = "30°";
    launch();
    if (compTimeout) clearTimeout(compTimeout);
    compTimeout = setTimeout(() => {
      if (!container || !container.isConnected) return;
      angle = 60;
      inAngle.value = 60;
      document.getElementById("disp-angle").innerText = "60°";
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
    const inX = pos.x >= targetPx.px - 22 && pos.x <= targetPx.px + 36;
    const inY = pos.y >= heightPx - 145 && pos.y <= heightPx - 65;
    return inX && inY;
  }

  function isOverCannon(pos) {
    const cannonOrigin = metersToPixels(0, height);
    const dist = Math.hypot(pos.x - cannonOrigin.px, pos.y - cannonOrigin.py);
    return dist <= 85 && pos.x >= cannonOrigin.px - 20;
  }

  function onPointerDown(e) {
    if (isFlying) return;
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
      document.getElementById("val-target").innerText = `${targetX.toFixed(1)} m`;
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
      if (!isFlying) drawScene();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const stepVal = e.shiftKey ? 5 : 1;
      angle = Math.max(5, angle - stepVal);
      inAngle.value = angle;
      document.getElementById("disp-angle").innerText = `${angle}°`;
      if (!isFlying) drawScene();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const stepVal = e.shiftKey ? 5 : 1;
      speed = Math.min(75, speed + stepVal);
      inSpeed.value = speed;
      document.getElementById("disp-speed").innerText = `${speed} m/s`;
      if (!isFlying) drawScene();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const stepVal = e.shiftKey ? 5 : 1;
      speed = Math.max(10, speed - stepVal);
      inSpeed.value = speed;
      document.getElementById("disp-speed").innerText = `${speed} m/s`;
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

  // View Switcher
  const btnSim = document.getElementById("proj-mode-sim");
  const btnPhoto = document.getElementById("proj-mode-photo");

  btnSim.addEventListener("click", () => {
    photoOverlay.style.display = "none";
    const formulaBar = document.getElementById("proj-formula-bar");
    if (formulaBar) formulaBar.style.display = "flex";
    btnSim.style.background = "rgba(56, 189, 248, 0.25)";
    btnSim.style.color = "#38bdf8";
    btnPhoto.style.background = "transparent";
    btnPhoto.style.color = "#94a3b8";
  });

  btnPhoto.addEventListener("click", () => {
    photoOverlay.style.display = "block";
    const formulaBar = document.getElementById("proj-formula-bar");
    if (formulaBar) formulaBar.style.display = "none";
    btnPhoto.style.background = "rgba(56, 189, 248, 0.25)";
    btnPhoto.style.color = "#38bdf8";
    btnSim.style.background = "transparent";
    btnSim.style.color = "#94a3b8";
  });

  // Telemetry Suite: CSV Export Button
  document.getElementById("btn-export-proj-csv")?.addEventListener("click", () => {
    const trials = LabTrialStore.getTrials("projectile");
    const headers = ["Time (s)", "x (m)", "y (m)", "vx (m/s)", "vy (m/s)", "Speed v (m/s)"];
    const rows = currentTrajectory.map(pt => [
      pt.t !== undefined ? pt.t : 0,
      pt.x !== undefined ? pt.x : 0,
      pt.y !== undefined ? pt.y : 0,
      pt.vx !== undefined ? pt.vx : 0,
      pt.vy !== undefined ? pt.vy : 0,
      (pt.vx !== undefined && pt.vy !== undefined) ? parseFloat(Math.hypot(pt.vx, pt.vy).toFixed(2)) : 0
    ]);

    exportLabDataCsv({
      title: "Precision Ballistics & Projectile Motion",
      labId: "projectile",
      parameters: {
        "Elevation Angle (θ)": `${angle}°`,
        "Muzzle Velocity (v₀)": `${speed} m/s`,
        "Initial Height (y₀)": `${height} m`,
        "Gravitational Acceleration (g)": `${g} m/s²`,
        "Target Distance": `${targetX} m`,
        "Aerodynamic Drag": enableAirDrag ? "Enabled (Cd = 0.47, sphere)" : "Vacuum"
      },
      headers,
      dataRows: rows.length > 0 ? rows : [[0, 0, height, parseFloat((speed * Math.cos(angle * Math.PI / 180)).toFixed(2)), parseFloat((speed * Math.sin(angle * Math.PI / 180)).toFixed(2)), speed]]
    });
  });

  // Telemetry Suite: Lab Report Generator
  document.getElementById("btn-open-proj-report")?.addEventListener("click", () => {
    const trials = LabTrialStore.getTrials("projectile");
    openLabReportModal({
      title: "Precision Kinematics & Projectile Motion",
      subject: "Physics",
      inquiryQuestion: "How do elevation angle and initial velocity quantitatively govern 2D trajectory range and apex height?",
      parameters: {
        "Launch Angle (θ)": `${angle}°`,
        "Muzzle Speed (v₀)": `${speed} m/s`,
        "Initial Platform Height (y₀)": `${height} m`,
        "Gravity (g)": `${g} m/s²`,
        "Target Position": `${targetX} m`,
        "Aerodynamic Drag": enableAirDrag ? "Enabled (Cd = 0.47, sphere)" : "Vacuum"
      },
      trials,
      formulas: [
        "y(x) = y_0 + x\\tan\\theta - \\frac{g x^2}{2v_0^2 \\cos^2\\theta}",
        "R = \\frac{v_0^2 \\sin(2\\theta)}{g}",
        "t_{\\text{flight}} = \\frac{2v_0 \\sin\\theta}{g}",
        "H_{\\text{max}} = y_0 + \\frac{v_0^2 \\sin^2\\theta}{2g}",
        "F_{\\text{drag}} = \\frac{1}{2} C_d \\rho A v^2"
      ]
    });
  });

  // Mount Post-Lab Checkpoint Assessment
  mountLabCheckpoint("proj-checkpoint-container", "projectile");

  function handleResize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
    const cssWidth = rect.width || canvas.parentElement?.clientWidth || 1000;
    const cssHeight = rect.height || 520;
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);
    drawScene();
  }

  window.addEventListener("resize", handleResize);
  handleResize();

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
  };
  _currentProjectileCleanup = cleanup;
  return cleanup;
}
