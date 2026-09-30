// Edugates-ClipSAT Science Labs - Physics: Simple Harmonic Motion & Hooke's Law Suite
// 60 FPS Precision Classical Mechanics Simulation:
// Mass-Spring Oscillator, Simple Gravity Pendulum, Hooke's Restoring Force (F = -kx),
// Mechanical Energy Conservation (KE + PE = E_tot), Damped Harmonic Oscillation, 
// Interactive Touch/Drag Displacement, Multi-Mode Phase Space & Energy Graphing,
// and Comprehensive NGSS 2-Page Lab Report Dossier Generator.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";
import { showToast } from "../utils/toast.js";

let _currentHarmonicCleanup = null;

export function cleanupHarmonicLab() {
  if (typeof _currentHarmonicCleanup === "function") {
    try { _currentHarmonicCleanup(); } catch (e) {}
    _currentHarmonicCleanup = null;
  }
}

export function initHarmonicLab(containerId) {
  cleanupHarmonicLab();
  const container = document.getElementById(containerId);
  if (!container) return;

  // Simulation Parameters
  let oscillatorType = "spring"; // 'spring' or 'pendulum'
  let mass = 1.0; // kg (0.2 to 5.0 kg)
  let springK = 50.0; // N/m (10 to 200 N/m)
  let lengthL = 1.0; // m (for pendulum: 0.2 to 2.5 m)
  let gravity = 9.80665; // m/s² (Earth standard)
  let gravityName = "Earth";
  let dampingB = 0.04; // N·s/m (damping)
  let initialAmplitude = 0.35; // m (or rad for pendulum)
  let isRunning = true;
  let isDragging = false;
  let animId = null;

  // Kinematic State
  let x = initialAmplitude; // displacement (m) or angle (rad)
  let v = 0.0; // velocity (m/s) or angular velocity (rad/s)
  let a = 0.0; // acceleration (m/s²) or angular acceleration (rad/s²)
  let elapsedSeconds = 0;

  // Graph View Mode: 'waveform', 'phase', 'energy'
  let graphMode = "waveform";

  // History Buffers for Kinematic Graphs
  const historyX = []; // position vs time
  const historyV = []; // velocity vs time
  const historyKE = []; // kinetic energy vs time
  const historyPE = []; // potential energy vs time

  // Celestial Gravity Presets
  const GRAVITY_PRESETS = [
    { name: "Earth", g: 9.81, label: "🌍 Earth (9.81 m/s²)" },
    { name: "Moon", g: 1.62, label: "🌕 Moon (1.62 m/s²)" },
    { name: "Mars", g: 3.72, label: "🔴 Mars (3.72 m/s²)" },
    { name: "Jupiter", g: 24.79, label: "🪐 Jupiter (24.79 m/s²)" },
    { name: "Zero-G", g: 0.00, label: "🚀 Deep Space (0.00 m/s²)" }
  ];

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #f59e0b; box-shadow: 0 0 10px #f59e0b;"></span>
            Simple Harmonic Motion &amp; Hooke's Law Suite
          </span>
          <span class="badge" style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); color: #fbbf24; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            F = -kx • T = 2\\pi\\sqrt{m/k} • Energy Conservation
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-shm-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Dynamics Simulator
            </button>
            <button id="view-mode-shm-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real PASCO Bench
            </button>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-shm-toggle-run" style="padding: 5px 14px; font-size: 0.78rem;" title="Pause or resume physical integration (Spacebar)">
            ${isRunning ? "⏸ Pause" : "▶ Resume"}
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-shm-reset" style="padding: 5px 12px; font-size: 0.78rem;" title="Reset displacement to initial amplitude and release from rest">
            ⟲ Release from Rest
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-shm-record-trial" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(245, 158, 11, 0.4); color: #facc15;" title="Snapshot current kinematic telemetry into empirical comparison store">
            📝 Record Trial
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-shm-open-report" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;" title="Generate 2-Page NGSS Lab Report Dossier with Canvas snapshot and CER rubric">
            📋 Lab Report Dossier
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-shm-export" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;" title="Export continuous trajectory data as RFC-4180 CSV">
            📥 Export CSV
          </button>
        </div>
      </div>

      <!-- Main Layout: Simulator Canvas on Left, Kinematic Plots on Right -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="harmonic-layout">
        <!-- Oscillator Canvas Viewport -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(245, 158, 11, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #171104 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 550px;">
          <canvas id="harmonic-canvas" width="580" height="550" style="height: 550px; width: 100%; display: block; cursor: grab;"></canvas>

          <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
          <div id="harmonic-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <img src="assets/labs/harmonic_bench.jpg" alt="4K PASCO Harmonic Motion & Photogate Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            
            <!-- Live Analytical Telemetry Callout on Photo -->
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">PASCO Smart Photogate System</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;" id="photo-disp-period">Period T = 0.8886 s ± 0.1 ms</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Slotted Brass Masses &amp; Spring</div>
                <div style="color: #facc15; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;" id="photo-disp-params">k = 50.0 N/m • m = 1.000 kg</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">High-Speed Sonic Ranging Sensor</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">100 Hz Position/Velocity Profiler</div>
              </div>
            </div>
          </div>

          <!-- Top HUD: Kinematic Readouts -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">OSCILLATION PERIOD &amp; FREQUENCY</div>
              <div style="font-weight: 800; font-size: 1.3rem; color: #facc15; font-family: var(--font-mono);" id="disp-shm-period">T = 0.889 s</div>
              <div style="font-size: 0.74rem; color: #38bdf8; font-family: var(--font-mono);" id="disp-shm-freq">f = 1.125 Hz • ω = 7.07 rad/s</div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">INSTANTANEOUS KINEMATICS</div>
              <div style="font-weight: 800; font-size: 1.25rem; color: #38bdf8; font-family: var(--font-mono);" id="disp-shm-pos">x = +0.350 m</div>
              <div style="font-size: 0.74rem; color: #fb7185; font-family: var(--font-mono);" id="disp-shm-vel">v = 0.00 m/s • a = -17.5 m/s²</div>
            </div>
          </div>

          <!-- Bottom Drag Prompt & Energy Status Bar -->
          <div style="position: absolute; bottom: 12px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: center; pointer-events: none; font-family: var(--font-mono); font-size: 0.74rem; color: #94a3b8; z-index: 5;">
            <span style="background: rgba(0,0,0,0.7); padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08);" id="disp-shm-status">
              ⚡ Turning Point: v = 0, PE = Max, Restoring Force Max
            </span>
            <span style="background: rgba(0,0,0,0.7); padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08);">
              Total E = <span id="disp-shm-energy" style="color: #34d399; font-weight: 700;">3.06 J</span>
            </span>
          </div>

          <!-- Drag Hint Badge -->
          <div style="position: absolute; bottom: 44px; left: 16px; pointer-events: none; z-index: 5;">
            <span style="background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(245, 158, 11, 0.3); color: #fbbf24; font-size: 0.7rem; padding: 2px 8px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px;">
              <span>👆</span> Drag mass or bob to displace
            </span>
          </div>
        </div>

        <!-- Controls & Kinematic Graphs on Right -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <!-- Oscillator Model Switcher -->
          <div class="lab-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px;">
            <label style="font-size: 0.8rem; font-weight: 700; color: #facc15; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">
              Harmonic Oscillator Architecture
            </label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;" role="group" aria-label="Oscillator Architecture">
              <button class="btn btn-secondary btn-sm ${oscillatorType === 'spring' ? 'active' : ''}" data-osc="spring" style="font-size: 0.74rem; padding: 8px;" aria-pressed="${oscillatorType === 'spring'}">
                🌀 Hooke's Mass-Spring (T = 2π√m/k)
              </button>
              <button class="btn btn-secondary btn-sm ${oscillatorType === 'pendulum' ? 'active' : ''}" data-osc="pendulum" style="font-size: 0.74rem; padding: 8px;" aria-pressed="${oscillatorType === 'pendulum'}">
                ⏱ Gravity Pendulum (T = 2π√L/g)
              </button>
            </div>
          </div>

          <!-- System Parameter Sliders -->
          <div class="lab-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <label style="font-size: 0.8rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em;">
                Physical Parameters &amp; Environment
              </label>
              <span id="trials-count-badge" class="badge" style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); color: #facc15; font-size: 0.72rem; padding: 2px 8px; border-radius: 9999px;">
                Trials: 0
              </span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              <!-- Mass Slider -->
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>Oscillator Mass (m)</span>
                  <span style="color: #facc15; font-weight: 700;" id="lbl-shm-mass">${mass.toFixed(2)} kg</span>
                </div>
                <input type="range" id="slider-shm-mass" min="0.2" max="5.0" step="0.1" value="${mass}" style="width: 100%; accent-color: #facc15;" role="slider" aria-label="Oscillator Mass" aria-valuemin="0.2" aria-valuemax="5.0" aria-valuenow="${mass}">
              </div>

              <!-- Spring Constant k (Visible in spring mode) -->
              <div id="block-spring-k" style="display: ${oscillatorType === 'spring' ? 'block' : 'none'};">
                <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>Spring Constant (k)</span>
                  <span style="color: #38bdf8; font-weight: 700;" id="lbl-shm-k">${springK.toFixed(1)} N/m</span>
                </div>
                <input type="range" id="slider-shm-k" min="10" max="200" step="5" value="${springK}" style="width: 100%; accent-color: #38bdf8;" role="slider" aria-label="Spring Constant" aria-valuemin="10" aria-valuemax="200" aria-valuenow="${springK}">
              </div>

              <!-- Pendulum String Length L (Visible in pendulum mode) -->
              <div id="block-pendulum-l" style="display: ${oscillatorType === 'pendulum' ? 'block' : 'none'};">
                <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>Suspension Length (L)</span>
                  <span style="color: #38bdf8; font-weight: 700;" id="lbl-shm-l">${lengthL.toFixed(2)} m</span>
                </div>
                <input type="range" id="slider-shm-l" min="0.2" max="2.5" step="0.05" value="${lengthL}" style="width: 100%; accent-color: #38bdf8;" role="slider" aria-label="Pendulum Length" aria-valuemin="0.2" aria-valuemax="2.5" aria-valuenow="${lengthL}">
              </div>

              <!-- Celestial Gravity Presets (Visible in pendulum mode) -->
              <div id="block-celestial-gravity" style="display: ${oscillatorType === 'pendulum' ? 'block' : 'none'};">
                <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>Celestial Gravity Field (g)</span>
                  <span style="color: #34d399; font-weight: 700;" id="lbl-shm-gravity">${gravity.toFixed(2)} m/s² (${gravityName})</span>
                </div>
                <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                  ${GRAVITY_PRESETS.map(p => `
                    <button class="btn btn-secondary btn-sm btn-gravity-preset ${p.name === gravityName ? 'active' : ''}" data-g="${p.g}" data-name="${p.name}" style="padding: 3px 8px; font-size: 0.72rem; flex: 1; min-width: 60px;">
                      ${p.name}
                    </button>
                  `).join("")}
                </div>
              </div>

              <!-- Viscous Damping Coefficient b -->
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>Viscous Damping Drag (b)</span>
                  <span style="color: #fb7185; font-weight: 700;" id="lbl-shm-damping">${dampingB.toFixed(2)} N·s/m</span>
                </div>
                <input type="range" id="slider-shm-damping" min="0.0" max="0.5" step="0.01" value="${dampingB}" style="width: 100%; accent-color: #fb7185;" role="slider" aria-label="Viscous Damping" aria-valuemin="0.0" aria-valuemax="0.5" aria-valuenow="${dampingB}">
              </div>
            </div>
          </div>

          <!-- Multi-Mode Kinematic & Phase Space Graph Viewport -->
          <div class="lab-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px; flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
              <span style="font-size: 0.8rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em;" id="lbl-graph-title">
                Waveform Profile: x(t) = A·e^{-γt} cos(ωt)
              </span>
              <!-- Graph Mode Switcher -->
              <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 6px; padding: 2px;" role="group" aria-label="Kinematic Graph Mode">
                <button class="btn btn-secondary ${graphMode === 'waveform' ? 'active' : ''}" id="btn-graph-waveform" style="padding: 3px 8px; font-size: 0.72rem; border: none;" title="Plot displacement waveform over time">
                  📈 Wave
                </button>
                <button class="btn btn-secondary ${graphMode === 'phase' ? 'active' : ''}" id="btn-graph-phase" style="padding: 3px 8px; font-size: 0.72rem; border: none; background: transparent;" title="Plot phase space orbit (v vs x)">
                  🌀 Phase Space
                </button>
                <button class="btn btn-secondary ${graphMode === 'energy' ? 'active' : ''}" id="btn-graph-energy" style="padding: 3px 8px; font-size: 0.72rem; border: none; background: transparent;" title="Plot kinetic, potential, and total energy">
                  ⚡ Energy
                </button>
              </div>
            </div>
            <canvas id="shm-graph-canvas" width="450" height="150" style="width: 100%; height: 150px; display: block; border-radius: 6px; background: #030712; border: 1px solid rgba(255,255,255,0.08);"></canvas>
          </div>
        </div>
      </div>

      <!-- Post-Lab Checkpoint Assessment -->
      <div id="shm-checkpoint-container" style="margin-top: 24px;"></div>
    </div>
  `;

  // Canvas References
  const canvas = container.querySelector("#harmonic-canvas");
  const ctx = canvas.getContext("2d");
  const graphCanvas = container.querySelector("#shm-graph-canvas");
  const graphCtx = graphCanvas.getContext("2d");

  // DOM Elements
  const dispPeriod = container.querySelector("#disp-shm-period");
  const dispFreq = container.querySelector("#disp-shm-freq");
  const dispPos = container.querySelector("#disp-shm-pos");
  const dispVel = container.querySelector("#disp-shm-vel");
  const dispStatus = container.querySelector("#disp-shm-status");
  const dispEnergy = container.querySelector("#disp-shm-energy");
  const lblGraphTitle = container.querySelector("#lbl-graph-title");
  const trialsBadge = container.querySelector("#trials-count-badge");
  const photoPeriod = container.querySelector("#photo-disp-period");
  const photoParams = container.querySelector("#photo-disp-params");

  let needsRedraw = true;

  // HiDPI / Retina Canvas Initialization
  function setupHiDPICanvas() {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (typeof window.getOptimizedDPR === "function" ? window.getOptimizedDPR() : (window.devicePixelRatio || 1));
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0) {
      canvas.width = rect.width * dpr;
      canvas.height = 550 * dpr;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    }
    const graphRect = graphCanvas.getBoundingClientRect();
    if (graphRect.width > 0) {
      graphCanvas.width = graphRect.width * dpr;
      graphCanvas.height = 150 * dpr;
      graphCtx.resetTransform();
      graphCtx.scale(dpr, dpr);
    }
    needsRedraw = true;
  }
  setupHiDPICanvas();
  window.addEventListener("resize", setupHiDPICanvas);

  // Reset Function
  function resetOscillator() {
    x = initialAmplitude;
    v = 0.0;
    a = 0.0;
    elapsedSeconds = 0;
    historyX.length = 0;
    historyV.length = 0;
    historyKE.length = 0;
    historyPE.length = 0;
    needsRedraw = true;
    updateDisplayMetrics();
  }

  // Theoretical Period & Freq
  function getPeriod() {
    if (oscillatorType === "spring") {
      return 2 * Math.PI * Math.sqrt(mass / springK);
    } else {
      if (gravity <= 0) return Infinity;
      return 2 * Math.PI * Math.sqrt(lengthL / gravity);
    }
  }

  // Energy Calculation Function
  function calculateEnergy() {
    if (oscillatorType === "spring") {
      const pe = 0.5 * springK * x * x;
      const ke = 0.5 * mass * v * v;
      return { pe, ke, total: pe + ke };
    } else {
      // Pendulum: PE = m * g * L * (1 - cos(theta)), KE = 0.5 * m * (L * v)^2
      const pe = mass * gravity * lengthL * (1 - Math.cos(x));
      const tangentialV = lengthL * v;
      const ke = 0.5 * mass * tangentialV * tangentialV;
      return { pe, ke, total: pe + ke };
    }
  }

  function updateDisplayMetrics() {
    const { pe, ke, total } = calculateEnergy();
    const T = getPeriod();
    const f = T === Infinity ? 0 : 1 / T;
    const omega = 2 * Math.PI * f;

    if (dispPeriod) dispPeriod.innerText = T === Infinity ? "T = ∞ (Zero-G)" : `T = ${T.toFixed(3)} s`;
    if (dispFreq) dispFreq.innerText = `f = ${f.toFixed(3)} Hz • ω = ${omega.toFixed(2)} rad/s`;
    
    if (dispPos) {
      if (oscillatorType === "spring") {
        dispPos.innerText = `x = ${x >= 0 ? "+" : ""}${x.toFixed(3)} m`;
      } else {
        const deg = (x * 180 / Math.PI).toFixed(1);
        dispPos.innerText = `θ = ${x >= 0 ? "+" : ""}${deg}° (${x.toFixed(3)} rad)`;
      }
    }

    if (dispVel) {
      if (oscillatorType === "spring") {
        dispVel.innerText = `v = ${v.toFixed(2)} m/s • a = ${a.toFixed(1)} m/s²`;
      } else {
        const tangV = lengthL * v;
        dispVel.innerText = `v_t = ${tangV.toFixed(2)} m/s • ω = ${v.toFixed(2)} rad/s`;
      }
    }

    if (dispEnergy) {
      dispEnergy.innerText = `${total.toFixed(2)} J (KE: ${ke.toFixed(2)}J, PE: ${pe.toFixed(2)}J)`;
    }

    if (dispStatus) {
      if (Math.abs(v) < 0.08) {
        dispStatus.innerText = "⚡ Extreme Turning Point: Speed ≈ 0, PE = Max, Restoring Force Max";
      } else if (Math.abs(x) < 0.04) {
        dispStatus.innerText = "⚡ Equilibrium Center: Speed v = Max, KE = Max, Potential Energy Min";
      } else {
        dispStatus.innerText = "🔄 Dynamic Oscillation: Harmonic Exchange between KE and PE";
      }
    }

    if (photoPeriod) {
      photoPeriod.innerText = T === Infinity ? "Period T = ∞ (Zero-G)" : `Period T = ${T.toFixed(4)} s ± 0.1 ms`;
    }
    if (photoParams) {
      if (oscillatorType === "spring") {
        photoParams.innerText = `k = ${springK.toFixed(1)} N/m • m = ${mass.toFixed(3)} kg`;
      } else {
        photoParams.innerText = `L = ${lengthL.toFixed(2)} m • g = ${gravity.toFixed(2)} m/s²`;
      }
    }
  }
  resetOscillator();

  // 60 FPS HTML5 Simulation Apparatus Renderer
  function renderApparatus() {
    const rect = canvas.getBoundingClientRect();
    const W = rect.width || 580;
    const H = 550;
    ctx.clearRect(0, 0, W, H);

    // Ceiling Mount
    const topY = 55;
    const CX = W * 0.44;

    // Structural Crossbeam Support
    ctx.fillStyle = "#334155";
    ctx.fillRect(CX - 85, topY - 16, 170, 16);
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 2;
    ctx.strokeRect(CX - 85, topY - 16, 170, 16);

    // Hatching lines on ceiling mount
    for (let hx = CX - 80; hx < CX + 80; hx += 12) {
      ctx.beginPath();
      ctx.moveTo(hx, topY - 16);
      ctx.lineTo(hx - 8, topY - 26);
      ctx.stroke();
    }

    if (oscillatorType === "spring") {
      // Mass-Spring Simulation
      const eqY = 275; // equilibrium center
      const pixelScale = 220; // pixels per meter
      const massY = eqY + x * pixelScale;

      // Draw Precision Coiled Steel Spring
      const coils = 20;
      const springTop = topY;
      const springBottom = massY - 26;
      const springLength = springBottom - springTop;
      const coilPitch = springLength / coils;

      // Outer spring glow
      ctx.shadowColor = "rgba(245, 158, 11, 0.35)";
      ctx.shadowBlur = 8;
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(CX, springTop);

      for (let i = 0; i <= coils; i++) {
        const cy = springTop + i * coilPitch;
        const cx = (i % 2 === 0) ? CX - 24 : CX + 24;
        if (i === 0 || i === coils) {
          ctx.lineTo(CX, cy);
        } else {
          ctx.lineTo(cx, cy);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Hook Linkages
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(CX, massY - 26, 7, 0, Math.PI * 2);
      ctx.stroke();

      // Suspended Brass Mass Block
      const massW = 64 + mass * 6;
      const massH = 54;
      const massX = CX - massW / 2;
      const massBlockY = massY - 20;

      // Drop Shadow for 3D realism
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.beginPath();
      ctx.roundRect(massX + 4, massBlockY + 6, massW, massH, 10);
      ctx.fill();

      // Slotted Brass Gradient
      const grad = ctx.createLinearGradient(massX, massBlockY, massX + massW, massBlockY + massH);
      grad.addColorStop(0, "#f59e0b");
      grad.addColorStop(0.5, "#facc15");
      grad.addColorStop(1, "#d97706");
      ctx.fillStyle = grad;
      ctx.strokeStyle = "#fef08a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(massX, massBlockY, massW, massH, 10);
      ctx.fill();
      ctx.stroke();

      // Brass mass label
      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${mass.toFixed(1)} kg`, CX, massBlockY + massH / 2 + 5);

      // Equilibrium Dotted Line (x = 0)
      ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(CX - 130, eqY);
      ctx.lineTo(CX + 130, eqY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#38bdf8";
      ctx.font = "11px monospace";
      ctx.textAlign = "left";
      ctx.fillText("Equilibrium (x = 0)", CX + 135, eqY + 4);

      // Measurement Ruler on the Left
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      const rulerX = CX - 130;
      ctx.moveTo(rulerX, eqY - 140);
      ctx.lineTo(rulerX, eqY + 140);
      ctx.stroke();

      for (let markM = -0.6; markM <= 0.6; markM += 0.1) {
        const my = eqY + markM * pixelScale;
        if (my >= 70 && my <= H - 30) {
          const isMajor = Math.abs(markM % 0.2) < 0.01;
          ctx.beginPath();
          ctx.moveTo(rulerX - (isMajor ? 8 : 4), my);
          ctx.lineTo(rulerX, my);
          ctx.stroke();
          if (isMajor) {
            ctx.fillStyle = "#64748b";
            ctx.font = "9px monospace";
            ctx.textAlign = "right";
            ctx.fillText(`${(-markM).toFixed(1)}m`, rulerX - 10, my + 3);
          }
        }
      }

      // Restoring Force Vector Arrow (F = -kx) in Vivid Red
      const forceMag = -springK * x;
      if (Math.abs(forceMag) > 1.5) {
        const arrowLen = Math.max(-85, Math.min(85, forceMag * 1.8));
        const arrX = CX + massW / 2 + 25;
        const arrStartY = massY;
        const arrEndY = massY - arrowLen;

        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(arrX, arrStartY);
        ctx.lineTo(arrX, arrEndY);
        ctx.stroke();

        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        const dir = arrowLen > 0 ? -1 : 1;
        ctx.moveTo(arrX, arrEndY);
        ctx.lineTo(arrX - 5, arrEndY + dir * 8);
        ctx.lineTo(arrX + 5, arrEndY + dir * 8);
        ctx.fill();

        ctx.font = "bold 10px monospace";
        ctx.textAlign = "left";
        ctx.fillText(`F_rest = ${forceMag.toFixed(1)} N`, arrX + 8, arrEndY + 3);
      }

      // Velocity Vector Arrow (v) in Emerald Green
      if (Math.abs(v) > 0.08) {
        const vLen = Math.max(-65, Math.min(65, v * 30));
        const vX = CX - massW / 2 - 25;
        const vStartY = massY;
        const vEndY = massY + vLen;

        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(vX, vStartY);
        ctx.lineTo(vX, vEndY);
        ctx.stroke();

        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        const vDir = vLen > 0 ? 1 : -1;
        ctx.moveTo(vX, vEndY);
        ctx.lineTo(vX - 5, vEndY - vDir * 8);
        ctx.lineTo(vX + 5, vEndY - vDir * 8);
        ctx.fill();

        ctx.font = "bold 10px monospace";
        ctx.textAlign = "right";
        ctx.fillText(`v = ${v.toFixed(2)} m/s`, vX - 8, vEndY + 3);
      }

    } else {
      // Pendulum Simulation
      const pivotX = CX;
      const pivotY = topY;
      const rodPixelLen = Math.min(320, 100 + lengthL * 90);
      const bobX = pivotX + Math.sin(x) * rodPixelLen;
      const bobY = pivotY + Math.cos(x) * rodPixelLen;

      // Angular Arc & Center Reference
      ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(pivotX, pivotY + rodPixelLen + 20);
      ctx.stroke();

      // Angular Arc Indicator
      if (Math.abs(x) > 0.04) {
        ctx.strokeStyle = "rgba(250, 204, 21, 0.4)";
        ctx.beginPath();
        const startA = Math.PI / 2;
        const endA = Math.PI / 2 + x;
        ctx.arc(pivotX, pivotY, 65, Math.min(startA, endA), Math.max(startA, endA));
        ctx.stroke();

        ctx.fillStyle = "#facc15";
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        const deg = (x * 180 / Math.PI).toFixed(1);
        ctx.fillText(`θ = ${deg}°`, pivotX + Math.sin(x/2) * 82, pivotY + Math.cos(x/2) * 82);
      }
      ctx.setLineDash([]);

      // Suspension Carbon-Fiber/Steel Rod
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();

      // Pivot Low-Friction Bearing
      ctx.fillStyle = "#0284c7";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Brass Bob with 3D Radial Highlight
      const bobR = 20 + mass * 3.5;
      
      // Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
      ctx.beginPath();
      ctx.arc(bobX + 4, bobY + 5, bobR, 0, Math.PI * 2);
      ctx.fill();

      const bobGrad = ctx.createRadialGradient(bobX - bobR * 0.3, bobY - bobR * 0.3, bobR * 0.1, bobX, bobY, bobR);
      bobGrad.addColorStop(0, "#fef08a");
      bobGrad.addColorStop(0.4, "#facc15");
      bobGrad.addColorStop(1, "#b45309");

      ctx.fillStyle = bobGrad;
      ctx.strokeStyle = "#fef9c3";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bobX, bobY, bobR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Bob mass text
      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 11px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(`${mass.toFixed(1)}kg`, bobX, bobY + 4);

      // Tangential Restoring Force Vector (F_t = -mg sin(theta))
      const fRestore = -mass * gravity * Math.sin(x);
      if (Math.abs(fRestore) > 0.5) {
        const arrLen = Math.max(-65, Math.min(65, fRestore * 4));
        const tangAngle = x + Math.PI / 2;
        const arrEndX = bobX + Math.cos(tangAngle) * arrLen;
        const arrEndY = bobY - Math.sin(tangAngle) * arrLen;

        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(bobX, bobY);
        ctx.lineTo(arrEndX, arrEndY);
        ctx.stroke();

        ctx.fillStyle = "#ef4444";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`F_t = ${fRestore.toFixed(1)}N`, arrEndX, arrEndY - 6);
      }
    }
  }

  // Render Kinematic Graph based on selected mode
  function renderGraph() {
    const rect = graphCanvas.getBoundingClientRect();
    const W = rect.width || 450;
    const H = 150;
    graphCtx.clearRect(0, 0, W, H);

    if (graphMode === "waveform") {
      // 1. WAVEFORM: x(t) or θ(t)
      const midY = H / 2;
      graphCtx.strokeStyle = "rgba(255,255,255,0.12)";
      graphCtx.lineWidth = 1;
      graphCtx.beginPath();
      graphCtx.moveTo(35, midY);
      graphCtx.lineTo(W - 10, midY);
      graphCtx.stroke();

      if (historyX.length < 2) return;

      const padL = 35;
      const plotW = W - padL - 10;
      const maxA = Math.max(0.1, initialAmplitude);
      const ampScale = (H * 0.40) / maxA;

      // Draw Dotted Envelope Boundary
      graphCtx.strokeStyle = "rgba(255,255,255,0.06)";
      graphCtx.setLineDash([3, 3]);
      graphCtx.beginPath();
      graphCtx.moveTo(padL, midY - maxA * ampScale);
      graphCtx.lineTo(W - 10, midY - maxA * ampScale);
      graphCtx.moveTo(padL, midY + maxA * ampScale);
      graphCtx.lineTo(W - 10, midY + maxA * ampScale);
      graphCtx.stroke();
      graphCtx.setLineDash([]);

      // Plot x(t) wave
      graphCtx.strokeStyle = "#38bdf8";
      graphCtx.lineWidth = 2.2;
      graphCtx.beginPath();

      historyX.forEach((pt, idx) => {
        const px = padL + (idx / Math.max(1, historyX.length - 1)) * plotW;
        const py = midY - pt * ampScale;
        if (idx === 0) graphCtx.moveTo(px, py);
        else graphCtx.lineTo(px, py);
      });
      graphCtx.stroke();

      // Axis Labels
      graphCtx.fillStyle = "#94a3b8";
      graphCtx.font = "9px monospace";
      graphCtx.textAlign = "right";
      const unit = oscillatorType === "spring" ? "m" : "rad";
      graphCtx.fillText(`+${maxA.toFixed(2)}${unit}`, padL - 4, midY - maxA * ampScale + 4);
      graphCtx.fillText(`-${maxA.toFixed(2)}${unit}`, padL - 4, midY + maxA * ampScale + 4);
      graphCtx.fillText("0", padL - 4, midY + 3);

    } else if (graphMode === "phase") {
      // 2. PHASE SPACE: Velocity vs Position (v vs x)
      const midX = W / 2;
      const midY = H / 2;

      // Coordinate Crosshair
      graphCtx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      graphCtx.lineWidth = 1;
      graphCtx.beginPath();
      graphCtx.moveTo(20, midY);
      graphCtx.lineTo(W - 20, midY);
      graphCtx.moveTo(midX, 10);
      graphCtx.lineTo(midX, H - 10);
      graphCtx.stroke();

      graphCtx.fillStyle = "#64748b";
      graphCtx.font = "9px monospace";
      graphCtx.textAlign = "right";
      graphCtx.fillText("x →", W - 15, midY - 6);
      graphCtx.fillText("↑ v", midX - 6, 18);

      if (historyX.length < 2) return;

      const maxA = Math.max(0.1, initialAmplitude);
      const scaleX = (W * 0.38) / maxA;
      const scaleY = (H * 0.38) / (maxA * 5);

      // Trajectory Path with trailing fade
      for (let i = 1; i < historyX.length; i++) {
        const alpha = Math.min(1.0, (i / historyX.length) * 1.2);
        graphCtx.strokeStyle = `rgba(56, 189, 248, ${alpha.toFixed(2)})`;
        graphCtx.lineWidth = 1.8;
        graphCtx.beginPath();
        const px1 = midX + historyX[i - 1] * scaleX;
        const py1 = midY - historyV[i - 1] * scaleY;
        const px2 = midX + historyX[i] * scaleX;
        const py2 = midY - historyV[i] * scaleY;
        graphCtx.moveTo(px1, py1);
        graphCtx.lineTo(px2, py2);
        graphCtx.stroke();
      }

      // Current Phase State Point
      const curX = midX + x * scaleX;
      const curY = midY - v * scaleY;
      graphCtx.fillStyle = "#facc15";
      graphCtx.beginPath();
      graphCtx.arc(curX, curY, 4.5, 0, Math.PI * 2);
      graphCtx.fill();

    } else if (graphMode === "energy") {
      // 3. MECHANICAL ENERGY CONSERVATION: KE, PE, E_tot
      const padL = 40;
      const plotW = W - padL - 80;
      const plotH = H - 30;

      // Draw Energy Level Bar Gauges on Right
      const { pe, ke, total } = calculateEnergy();
      const maxE = Math.max(0.5, total * 1.15);
      const barX = W - 65;
      const barW = 20;

      // Background Track
      graphCtx.fillStyle = "rgba(255, 255, 255, 0.05)";
      graphCtx.fillRect(barX, 15, barW, plotH);
      graphCtx.fillRect(barX + 28, 15, barW, plotH);

      // PE Bar (Cyan)
      const peH = (pe / maxE) * plotH;
      graphCtx.fillStyle = "#38bdf8";
      graphCtx.fillRect(barX, 15 + plotH - peH, barW, peH);

      // KE Bar (Amber)
      const keH = (ke / maxE) * plotH;
      graphCtx.fillStyle = "#f59e0b";
      graphCtx.fillRect(barX + 28, 15 + plotH - keH, barW, keH);

      // Labels under bars
      graphCtx.fillStyle = "#94a3b8";
      graphCtx.font = "8px monospace";
      graphCtx.textAlign = "center";
      graphCtx.fillText("PE", barX + barW / 2, H - 4);
      graphCtx.fillText("KE", barX + 28 + barW / 2, H - 4);

      // History Plot on Left
      if (historyKE.length >= 2) {
        // Draw Total Energy baseline
        const totalY = 15 + plotH - (total / maxE) * plotH;
        graphCtx.strokeStyle = "rgba(52, 211, 153, 0.6)";
        graphCtx.setLineDash([4, 4]);
        graphCtx.lineWidth = 1.5;
        graphCtx.beginPath();
        graphCtx.moveTo(padL, totalY);
        graphCtx.lineTo(padL + plotW, totalY);
        graphCtx.stroke();
        graphCtx.setLineDash([]);

        // Plot PE curve (Cyan)
        graphCtx.strokeStyle = "#38bdf8";
        graphCtx.lineWidth = 1.8;
        graphCtx.beginPath();
        historyPE.forEach((pt, idx) => {
          const px = padL + (idx / Math.max(1, historyPE.length - 1)) * plotW;
          const py = 15 + plotH - (pt / maxE) * plotH;
          if (idx === 0) graphCtx.moveTo(px, py);
          else graphCtx.lineTo(px, py);
        });
        graphCtx.stroke();

        // Plot KE curve (Amber)
        graphCtx.strokeStyle = "#f59e0b";
        graphCtx.lineWidth = 1.8;
        graphCtx.beginPath();
        historyKE.forEach((pt, idx) => {
          const px = padL + (idx / Math.max(1, historyKE.length - 1)) * plotW;
          const py = 15 + plotH - (pt / maxE) * plotH;
          if (idx === 0) graphCtx.moveTo(px, py);
          else graphCtx.lineTo(px, py);
        });
        graphCtx.stroke();
      }

      // Legend
      graphCtx.font = "9px monospace";
      graphCtx.textAlign = "left";
      graphCtx.fillStyle = "#38bdf8";
      graphCtx.fillText(`■ PE: ${pe.toFixed(2)}J`, padL, 16);
      graphCtx.fillStyle = "#f59e0b";
      graphCtx.fillText(`■ KE: ${ke.toFixed(2)}J`, padL + 75, 16);
      graphCtx.fillStyle = "#34d399";
      graphCtx.fillText(`-- E_tot: ${total.toFixed(2)}J`, padL + 150, 16);
    }
  }

  // Physics Euler-Cromer Integration Loop (60/30 FPS Paced with DOM Throttle & Disconnect Protection)
  let lastPhysicsTime = performance.now();
  let lastDrawTime = 0;
  let frameCount = 0;

  function loop(currentTime) {
    if (!container.isConnected) {
      if (animId) cancelAnimationFrame(animId);
      return;
    }

    const isSmart = (document.documentElement.getAttribute("data-mode") === "smartboard") ||
                    document.documentElement.classList.contains("fast-smartboard-mode") ||
                    /Android|MAXHUB/i.test(navigator.userAgent);
    const targetDrawInterval = isSmart ? 33.3 : 16.0; // 30 FPS pacing on MAXHUB / Smartboard

    if (isRunning && !isDragging) {
      const dt = Math.min(0.04, (currentTime - lastPhysicsTime) / 1000);
      lastPhysicsTime = currentTime;
      elapsedSeconds += dt;

      // Integration: F = -kx - bv => a = (-kx - bv) / m
      if (oscillatorType === "spring") {
        const F_spring = -springK * x;
        const F_damp = -dampingB * v;
        a = (F_spring + F_damp) / mass;
        v += a * dt;
        x += v * dt;
      } else {
        // Simple Pendulum: d²θ/dt² = -(g/L) sin(θ) - (b/m) (dθ/dt)
        const F_grav = -(gravity / Math.max(0.1, lengthL)) * Math.sin(x);
        const F_damp = -(dampingB / mass) * v;
        a = F_grav + F_damp;
        v += a * dt;
        x += v * dt;
      }

      // Record History Buffers
      historyX.push(x);
      historyV.push(v);
      const { pe, ke } = calculateEnergy();
      historyPE.push(pe);
      historyKE.push(ke);

      if (historyX.length > 200) {
        historyX.shift();
        historyV.shift();
        historyPE.shift();
        historyKE.shift();
      }

      frameCount++;
      // Throttle DOM text updates to ~15 Hz (every 4th frame at 60fps, every 2nd frame at 30fps) to prevent layout thrashing on Android MAXHUB
      const domThrottle = isSmart ? 2 : 4;
      if (frameCount % domThrottle === 0) {
        updateDisplayMetrics();
      }
      needsRedraw = true;
    } else {
      // Synchronize physics time clock while paused/dragging so unpausing doesn't jump
      lastPhysicsTime = currentTime;
    }

    // Render Canvas Views with Smartboard Pacing & Zero-Cost Idle Protection
    const photoEl = container.querySelector("#harmonic-photo-overlay");
    const isPhotoOverlay = photoEl && photoEl.style.display === "block";

    if (!isPhotoOverlay && (needsRedraw || isDragging)) {
      if (!currentTime || currentTime - lastDrawTime >= targetDrawInterval) {
        lastDrawTime = currentTime || performance.now();
        renderApparatus();
        renderGraph();
        if (!isRunning && !isDragging) {
          needsRedraw = false;
        }
      }
    }
    animId = requestAnimationFrame(loop);
  }
  animId = requestAnimationFrame(loop);

  // --- TOUCH / POINTER DRAG-AND-DROP DISPLACEMENT INTERACTION ---
  function getCanvasCoords(evt) {
    const rect = canvas.getBoundingClientRect();
    const clientX = evt.clientX ?? evt.touches?.[0]?.clientX ?? 0;
    const clientY = evt.clientY ?? evt.touches?.[0]?.clientY ?? 0;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
      width: rect.width
    };
  }

  function handlePointerDown(evt) {
    const coords = getCanvasCoords(evt);
    const CX = coords.width * 0.44;

    if (oscillatorType === "spring") {
      const eqY = 275;
      const pixelScale = 220;
      const massY = eqY + x * pixelScale;
      // Check if clicked near the mass block
      if (Math.abs(coords.x - CX) < 60 && Math.abs(coords.y - massY) < 50) {
        isDragging = true;
        canvas.style.cursor = "grabbing";
        SoundFX.playClick();
      }
    } else {
      const topY = 55;
      const rodPixelLen = Math.min(320, 100 + lengthL * 90);
      const bobX = CX + Math.sin(x) * rodPixelLen;
      const bobY = topY + Math.cos(x) * rodPixelLen;
      if (Math.hypot(coords.x - bobX, coords.y - bobY) < 45) {
        isDragging = true;
        canvas.style.cursor = "grabbing";
        SoundFX.playClick();
      }
    }
  }

  function handlePointerMove(evt) {
    if (!container || !container.isConnected) {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      return;
    }
    const coords = getCanvasCoords(evt);
    const CX = coords.width * 0.44;

    if (!isDragging) {
      // Hover test for cursor styling
      if (oscillatorType === "spring") {
        const eqY = 275;
        const massY = eqY + x * 220;
        canvas.style.cursor = (Math.abs(coords.x - CX) < 60 && Math.abs(coords.y - massY) < 50) ? "grab" : "default";
      } else {
        const topY = 55;
        const rodPixelLen = Math.min(320, 100 + lengthL * 90);
        const bobX = CX + Math.sin(x) * rodPixelLen;
        const bobY = topY + Math.cos(x) * rodPixelLen;
        canvas.style.cursor = Math.hypot(coords.x - bobX, coords.y - bobY) < 45 ? "grab" : "default";
      }
      return;
    }

    if (oscillatorType === "spring") {
      const eqY = 275;
      const pixelScale = 220;
      x = (coords.y - eqY) / pixelScale;
      x = Math.max(-0.55, Math.min(0.55, x));
      v = 0;
    } else {
      const topY = 55;
      const angle = Math.atan2(coords.x - CX, coords.y - topY);
      x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, angle));
      v = 0;
    }
    needsRedraw = true;
    updateDisplayMetrics();
  }

  function handlePointerUp() {
    if (!container || !container.isConnected) {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      return;
    }
    if (isDragging) {
      isDragging = false;
      canvas.style.cursor = "grab";
      v = 0; // Release from rest at new displacement
      needsRedraw = true;
      updateDisplayMetrics();
      SoundFX.playPop();
    }
  }

  canvas.addEventListener("pointerdown", handlePointerDown);
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);

  // --- EVENT LISTENERS ---
  const btnSim = container.querySelector("#view-mode-shm-sim");
  const btnPhoto = container.querySelector("#view-mode-shm-photo");
  const photoOverlay = container.querySelector("#harmonic-photo-overlay");

  btnSim?.addEventListener("click", () => {
    btnSim.classList.add("active");
    btnSim.style.background = "";
    btnPhoto.classList.remove("active");
    btnPhoto.style.background = "transparent";
    if (photoOverlay) photoOverlay.style.display = "none";
    needsRedraw = true;
    SoundFX.playClick();
  });

  btnPhoto?.addEventListener("click", () => {
    btnPhoto.classList.add("active");
    btnPhoto.style.background = "";
    btnSim.classList.remove("active");
    btnSim.style.background = "transparent";
    if (photoOverlay) photoOverlay.style.display = "block";
    SoundFX.playClick();
  });

  container.querySelector("#btn-shm-toggle-run")?.addEventListener("click", (e) => {
    isRunning = !isRunning;
    e.currentTarget.innerText = isRunning ? "⏸ Pause" : "▶ Resume";
    needsRedraw = true;
    SoundFX.playClick();
  });

  container.querySelector("#btn-shm-reset")?.addEventListener("click", () => {
    resetOscillator();
    SoundFX.playClick();
  });

  // Switch Oscillator Type (Spring vs Pendulum)
  container.querySelectorAll("[data-osc]").forEach(btn => {
    btn.addEventListener("click", () => {
      container.querySelectorAll("[data-osc]").forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
      oscillatorType = btn.dataset.osc;

      // Toggle relevant parameter controls
      const blockSpring = container.querySelector("#block-spring-k");
      const blockPendulum = container.querySelector("#block-pendulum-l");
      const blockGravity = container.querySelector("#block-celestial-gravity");

      if (blockSpring) blockSpring.style.display = oscillatorType === "spring" ? "block" : "none";
      if (blockPendulum) blockPendulum.style.display = oscillatorType === "pendulum" ? "block" : "none";
      if (blockGravity) blockGravity.style.display = oscillatorType === "pendulum" ? "block" : "none";

      initialAmplitude = oscillatorType === "spring" ? 0.35 : 0.35;
      resetOscillator();
      SoundFX.playClick();
    });
  });

  // Celestial Gravity Preset Buttons
  container.querySelectorAll(".btn-gravity-preset").forEach(btn => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(".btn-gravity-preset").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      gravity = parseFloat(btn.dataset.g);
      gravityName = btn.dataset.name;
      const lbl = container.querySelector("#lbl-shm-gravity");
      if (lbl) lbl.innerText = `${gravity.toFixed(2)} m/s² (${gravityName})`;
      needsRedraw = true;
      updateDisplayMetrics();
      SoundFX.playClick();
    });
  });

  // Graph Mode Switcher (Waveform, Phase Space, Energy)
  const btnWaveform = container.querySelector("#btn-graph-waveform");
  const btnPhase = container.querySelector("#btn-graph-phase");
  const btnEnergy = container.querySelector("#btn-graph-energy");

  function setGraphMode(mode) {
    graphMode = mode;
    [btnWaveform, btnPhase, btnEnergy].forEach(b => {
      if (b) {
        b.classList.remove("active");
        b.style.background = "transparent";
      }
    });

    if (mode === "waveform" && btnWaveform) {
      btnWaveform.classList.add("active");
      btnWaveform.style.background = "";
      if (lblGraphTitle) lblGraphTitle.innerText = "Waveform Profile: x(t) = A·e^{-γt} cos(ωt)";
    } else if (mode === "phase" && btnPhase) {
      btnPhase.classList.add("active");
      btnPhase.style.background = "";
      if (lblGraphTitle) lblGraphTitle.innerText = "Phase Space Portrait: Velocity v vs Displacement x";
    } else if (mode === "energy" && btnEnergy) {
      btnEnergy.classList.add("active");
      btnEnergy.style.background = "";
      if (lblGraphTitle) lblGraphTitle.innerText = "Mechanical Energy Conservation: KE + PE = E_tot";
    }
    needsRedraw = true;
    SoundFX.playClick();
  }

  btnWaveform?.addEventListener("click", () => setGraphMode("waveform"));
  btnPhase?.addEventListener("click", () => setGraphMode("phase"));
  btnEnergy?.addEventListener("click", () => setGraphMode("energy"));

  // Sliders
  container.querySelector("#slider-shm-mass")?.addEventListener("input", (e) => {
    mass = parseFloat(e.target.value);
    e.target.setAttribute("aria-valuenow", mass);
    container.querySelector("#lbl-shm-mass").innerText = `${mass.toFixed(2)} kg`;
    needsRedraw = true;
    updateDisplayMetrics();
  });

  container.querySelector("#slider-shm-k")?.addEventListener("input", (e) => {
    springK = parseFloat(e.target.value);
    e.target.setAttribute("aria-valuenow", springK);
    container.querySelector("#lbl-shm-k").innerText = `${springK.toFixed(1)} N/m`;
    needsRedraw = true;
    updateDisplayMetrics();
  });

  container.querySelector("#slider-shm-l")?.addEventListener("input", (e) => {
    lengthL = parseFloat(e.target.value);
    e.target.setAttribute("aria-valuenow", lengthL);
    container.querySelector("#lbl-shm-l").innerText = `${lengthL.toFixed(2)} m`;
    needsRedraw = true;
    updateDisplayMetrics();
  });

  container.querySelector("#slider-shm-damping")?.addEventListener("input", (e) => {
    dampingB = parseFloat(e.target.value);
    e.target.setAttribute("aria-valuenow", dampingB);
    container.querySelector("#lbl-shm-damping").innerText = `${dampingB.toFixed(2)} N·s/m`;
    needsRedraw = true;
    updateDisplayMetrics();
  });

  // Record Trial
  container.querySelector("#btn-shm-record-trial")?.addEventListener("click", () => {
    const T = getPeriod();
    const { pe, ke, total } = calculateEnergy();
    const trialData = {
      summary: `${oscillatorType === 'spring' ? `Spring (k=${springK.toFixed(0)}N/m)` : `Pendulum (L=${lengthL.toFixed(2)}m, ${gravityName})`}, m=${mass.toFixed(2)}kg`,
      metrics: {
        "Oscillator Architecture": oscillatorType === "spring" ? "Hooke's Spring" : `Pendulum (${gravityName})`,
        "Mass m (kg)": mass.toFixed(2),
        "Stiffness k or Length L": oscillatorType === "spring" ? `${springK.toFixed(1)} N/m` : `${lengthL.toFixed(2)} m`,
        "Theoretical Period T (s)": T === Infinity ? "Infinity" : T.toFixed(3),
        "Frequency f (Hz)": T === Infinity ? "0" : (1 / T).toFixed(3),
        "Current Displacement": oscillatorType === "spring" ? `${x.toFixed(3)} m` : `${(x * 180 / Math.PI).toFixed(1)}°`,
        "Total Energy E (J)": total.toFixed(3)
      }
    };

    LabTrialStore.addTrial("harmonic", trialData);
    const count = LabTrialStore.getTrials("harmonic").length;
    if (trialsBadge) {
      trialsBadge.innerText = `Trials: ${count}`;
      trialsBadge.style.color = "#34d399";
      trialsBadge.style.borderColor = "rgba(16, 185, 129, 0.4)";
    }
    SoundFX.playLevelUp();
    showToast("Trial Recorded", `Trial #${count}: ${trialData.summary} (T = ${T.toFixed(3)} s)`, "success");
  });

  // Open Lab Report Dossier Modal
  container.querySelector("#btn-shm-open-report")?.addEventListener("click", () => {
    const T = getPeriod();
    const { pe, ke, total } = calculateEnergy();
    const trials = LabTrialStore.getTrials("harmonic");

    openLabReportModal({
      title: "Simple Harmonic Motion & Hooke's Law Restoring Dynamics",
      subject: "Physics",
      inquiryQuestion: "How do mass, spring stiffness, and pendulum length quantitatively dictate the natural period T, oscillation frequency, and mechanical energy conservation?",
      parameters: {
        "Oscillator System": oscillatorType === "spring" ? "Hooke's Mass-Spring Apparatus" : `Simple Gravity Pendulum (${gravityName})`,
        "Oscillator Mass (m)": `${mass.toFixed(2)} kg`,
        "System Parameter": oscillatorType === "spring" ? `Spring Constant k = ${springK.toFixed(1)} N/m` : `String Length L = ${lengthL.toFixed(2)} m`,
        "Gravitational Field (g)": `${gravity.toFixed(2)} m/s²`,
        "Viscous Damping (b)": `${dampingB.toFixed(2)} N·s/m`,
        "Theoretical Period (T)": T === Infinity ? "Infinity" : `${T.toFixed(3)} s`,
        "Theoretical Frequency (f)": T === Infinity ? "0 Hz" : `${(1 / T).toFixed(3)} Hz`,
        "Mechanical Energy": `${total.toFixed(2)} J (KE: ${ke.toFixed(2)}J, PE: ${pe.toFixed(2)}J)`
      },
      trials,
      canvasId: "harmonic-canvas",
      formulas: [
        "F_{\\text{restoring}} = -k x \\quad \\text{(Hooke's Law for Spring)}",
        "T_{\\text{spring}} = 2\\pi \\sqrt{\\frac{m}{k}} \\qquad f_{\\text{spring}} = \\frac{1}{2\\pi}\\sqrt{\\frac{k}{m}}",
        "T_{\\text{pendulum}} = 2\\pi \\sqrt{\\frac{L}{g}} \\qquad f_{\\text{pendulum}} = \\frac{1}{2\\pi}\\sqrt{\\frac{g}{L}}",
        "E_{\\text{total}} = \\frac{1}{2}m v^2 + \\frac{1}{2}k x^2 = \\text{Constant} \\quad (b = 0)"
      ],
      observations: `Continuous phase-space and mechanical energy monitoring demonstrates seamless kinetic-to-potential interchange. At maximum displacement (x = ±A), velocity drops to zero while restoring force peaks. At equilibrium (x = 0), velocity reaches maximum v_max = Aω and potential energy drops to minimum.`,
      conclusionNotes: `Experimental periods conform strictly to Newtonian second-order differential mechanics. For mass-spring systems, period scales with sqrt(m); for pendulums, period is strictly independent of bob mass and governed exclusively by length L and gravitational field g.`
    });
    SoundFX.playPop();
  });

  // Export CSV
  container.querySelector("#btn-shm-export")?.addEventListener("click", () => {
    const T = getPeriod();
    const rows = historyX.map((val, idx) => [
      idx,
      (idx * 0.0167).toFixed(4),
      val.toFixed(4),
      (historyV[idx] ?? 0).toFixed(4),
      (historyPE[idx] ?? 0).toFixed(4),
      (historyKE[idx] ?? 0).toFixed(4),
      ((historyPE[idx] ?? 0) + (historyKE[idx] ?? 0)).toFixed(4)
    ]);

    exportLabDataCsv({
      title: "Simple Harmonic Motion Telemetry",
      labId: "harmonic",
      parameters: {
        "Oscillator Architecture": oscillatorType.toUpperCase(),
        "Mass m (kg)": mass,
        "Spring Constant k (N/m)": springK,
        "Pendulum Length L (m)": lengthL,
        "Gravity g (m/s²)": gravity,
        "Damping b (N·s/m)": dampingB,
        "Theoretical Period T (s)": T === Infinity ? "Infinity" : T.toFixed(3),
        "Frequency f (Hz)": T === Infinity ? 0 : (1 / T).toFixed(3)
      },
      headers: ["Step", "Time t (s)", "Displacement x", "Velocity v", "PE (J)", "KE (J)", "Total E (J)"],
      dataRows: rows
    });
  });

  // Mount Post-Lab Checkpoint Assessment
  mountLabCheckpoint("shm-checkpoint-container", "harmonic");

  const cleanup = () => {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("resize", setupHiDPICanvas);
    canvas.removeEventListener("pointerdown", handlePointerDown);
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  };
  _currentHarmonicCleanup = cleanup;
  return cleanup;
}
