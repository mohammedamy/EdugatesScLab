// Edugates-ClipSAT Science Labs - Physics: Simple Harmonic Motion & Hooke's Law Suite
// 60 FPS Precision Classical Mechanics Simulation:
// Mass-Spring Oscillator, Simple Gravity Pendulum, Hooke's Restoring Force (F = -kx),
// Mechanical Energy Conservation (KE + PE_s = E_tot), Damped Harmonic Oscillation, and Phase Space (v vs x) Orbit.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initHarmonicLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Simulation Parameters
  let oscillatorType = "spring"; // 'spring' or 'pendulum'
  let mass = 1.0; // kg (0.2 to 5.0 kg)
  let springK = 50.0; // N/m (10 to 200 N/m)
  let lengthL = 1.0; // m (for pendulum)
  let gravity = 9.80665; // m/s²
  let dampingB = 0.05; // N·s/m (damping)
  let initialAmplitude = 0.35; // m (or rad for pendulum)
  let isRunning = true;
  let animId = null;

  // Kinematic State
  let x = initialAmplitude; // displacement (m)
  let v = 0.0; // velocity (m/s)
  let a = 0.0; // acceleration (m/s²)
  let elapsedSeconds = 0;

  // History Buffers for Kinematic Graphs
  const historyX = []; // position vs time
  const historyE = []; // energy vs time

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

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-shm-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Dynamics Simulator
            </button>
            <button id="view-mode-shm-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real PASCO Bench
            </button>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-shm-toggle-run" style="padding: 5px 14px; font-size: 0.78rem;">
            ${isRunning ? "⏸ Pause" : "▶ Resume"}
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-shm-reset" style="padding: 5px 12px; font-size: 0.78rem;">
            ⟲ Release from Rest
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-shm-export" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export Telemetry
          </button>
        </div>
      </div>

      <!-- Main Layout: Simulator Canvas on Left, Kinematic Plots on Right -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="harmonic-layout">
        <!-- Oscillator Canvas Viewport -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(245, 158, 11, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #171104 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="harmonic-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
          <div id="harmonic-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <img src="assets/labs/harmonic_bench.jpg" alt="4K PASCO Harmonic Motion & Photogate Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            
            <!-- Live Analytical Telemetry Callout on Photo -->
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">PASCO Smart Photogate System</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Period T = 0.8886 s ± 0.1 ms</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Slotted Brass Masses &amp; Spring</div>
                <div style="color: #facc15; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">k = 50.0 N/m • m = 1.000 kg</div>
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

          <!-- Bottom Status Pill -->
          <div style="position: absolute; bottom: 12px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: center; pointer-events: none; font-family: var(--font-mono); font-size: 0.74rem; color: #94a3b8;">
            <span style="background: rgba(0,0,0,0.65); padding: 4px 10px; border-radius: 6px;" id="disp-shm-status">
              ⚡ Turning Point: v = 0, PE_s = Max, Restoring Force F = -kx Max
            </span>
            <span style="background: rgba(0,0,0,0.65); padding: 4px 10px; border-radius: 6px;">
              Total E = <span id="disp-shm-energy">3.06 J</span>
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
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <button class="btn btn-secondary btn-sm ${oscillatorType === 'spring' ? 'active' : ''}" data-osc="spring" style="font-size: 0.74rem; padding: 7px;">
                🌀 Hooke's Mass-Spring (T = 2π√m/k)
              </button>
              <button class="btn btn-secondary btn-sm ${oscillatorType === 'pendulum' ? 'active' : ''}" data-osc="pendulum" style="font-size: 0.74rem; padding: 7px;">
                ⏱ Gravity Pendulum (T = 2π√L/g)
              </button>
            </div>
          </div>

          <!-- Sliders: Mass, Spring Constant / Length, Damping -->
          <div class="lab-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px;">
            <label style="font-size: 0.8rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">
              Physical System Parameters
            </label>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              <!-- Mass Slider -->
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>Oscillator Mass (m)</span>
                  <span style="color: #facc15; font-weight: 700;" id="lbl-shm-mass">${mass.toFixed(2)} kg</span>
                </div>
                <input type="range" id="slider-shm-mass" min="0.2" max="5.0" step="0.1" value="${mass}" style="width: 100%; accent-color: #facc15;">
              </div>

              <!-- Spring Constant k or String Length L -->
              <div id="block-spring-k">
                <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>Spring Constant (k)</span>
                  <span style="color: #38bdf8; font-weight: 700;" id="lbl-shm-k">${springK.toFixed(1)} N/m</span>
                </div>
                <input type="range" id="slider-shm-k" min="10" max="150" step="5" value="${springK}" style="width: 100%; accent-color: #38bdf8;">
              </div>

              <!-- Damping Coefficient b -->
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>Viscous Air Damping (b)</span>
                  <span style="color: #fb7185; font-weight: 700;" id="lbl-shm-damping">${dampingB.toFixed(2)} N·s/m</span>
                </div>
                <input type="range" id="slider-shm-damping" min="0.0" max="0.5" step="0.02" value="${dampingB}" style="width: 100%; accent-color: #fb7185;">
              </div>
            </div>
          </div>

          <!-- Position vs Time Sinusoidal Graph -->
          <div class="lab-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px; flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 0.8rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em;">
                Position Profile: x(t) = A·e^{-γt} cos(ωt)
              </span>
              <span style="font-size: 0.72rem; color: #94a3b8; font-family: var(--font-mono);">60 Hz Waveform</span>
            </div>
            <canvas id="shm-graph-canvas" width="420" height="130" style="width: 100%; height: 130px; display: block; border-radius: 6px; background: #030712; border: 1px solid rgba(255,255,255,0.08);"></canvas>
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

  // Reset Function
  function resetOscillator() {
    x = initialAmplitude;
    v = 0.0;
    a = 0.0;
    elapsedSeconds = 0;
    historyX.length = 0;
  }
  resetOscillator();

  // Theoretical Period & Freq
  function getPeriod() {
    if (oscillatorType === "spring") {
      return 2 * Math.PI * Math.sqrt(mass / springK);
    } else {
      return 2 * Math.PI * Math.sqrt(lengthL / gravity);
    }
  }

  // 60 FPS HTML5 Simulation of Hooke's Coiled Spring & Mass
  function renderApparatus() {
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Ceiling Mount
    const topY = 50;
    const CX = W * 0.45;
    ctx.fillStyle = "#334155";
    ctx.fillRect(CX - 70, topY - 14, 140, 14);
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 2;
    ctx.strokeRect(CX - 70, topY - 14, 140, 14);

    // Hatching lines on ceiling
    for (let hx = CX - 65; hx < CX + 65; hx += 12) {
      ctx.beginPath();
      ctx.moveTo(hx, topY - 14);
      ctx.lineTo(hx - 8, topY - 24);
      ctx.stroke();
    }

    if (oscillatorType === "spring") {
      // Mass-Spring Simulation
      const eqY = 260; // equilibrium center
      const pixelScale = 220; // pixels per meter
      const massY = eqY + x * pixelScale;

      // Draw Coiled Spring
      const coils = 18;
      const springTop = topY;
      const springBottom = massY - 25;
      const springLength = springBottom - springTop;
      const coilPitch = springLength / coils;

      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(CX, springTop);

      for (let i = 0; i <= coils; i++) {
        const cy = springTop + i * coilPitch;
        const cx = (i % 2 === 0) ? CX - 22 : CX + 22;
        if (i === 0 || i === coils) {
          ctx.lineTo(CX, cy);
        } else {
          ctx.lineTo(cx, cy);
        }
      }
      ctx.stroke();

      // Suspended Mass Block
      const massW = 60 + mass * 6;
      const massH = 50;
      ctx.fillStyle = "#f59e0b";
      ctx.strokeStyle = "#fde68a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(CX - massW/2, massY - 25, massW, massH, 8);
      ctx.fill();
      ctx.stroke();

      // Hook Ring
      ctx.beginPath();
      ctx.arc(CX, massY - 25, 6, 0, Math.PI * 2);
      ctx.stroke();

      // Mass Label
      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 12px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(`${mass.toFixed(1)} kg`, CX, massY + 6);

      // Equilibrium Dotted Line
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(CX - 120, eqY);
      ctx.lineTo(CX + 120, eqY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#38bdf8";
      ctx.font = "10px monospace";
      ctx.textAlign = "left";
      ctx.fillText("Equilibrium (x = 0)", CX + 125, eqY + 3);

      // Restoring Force Vector Arrow (F = -kx)
      const forceMag = -springK * x;
      if (Math.abs(forceMag) > 2) {
        const arrowLen = Math.max(-80, Math.min(80, forceMag * 2));
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(CX + massW/2 + 25, massY);
        ctx.lineTo(CX + massW/2 + 25, massY - arrowLen);
        ctx.stroke();

        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        const tipY = massY - arrowLen;
        const dir = arrowLen > 0 ? -1 : 1;
        ctx.moveTo(CX + massW/2 + 25, tipY);
        ctx.lineTo(CX + massW/2 + 20, tipY + dir * 8);
        ctx.lineTo(CX + massW/2 + 30, tipY + dir * 8);
        ctx.fill();

        ctx.font = "bold 10px monospace";
        ctx.fillText(`F = ${forceMag.toFixed(1)} N`, CX + massW/2 + 35, tipY + 4);
      }
    } else {
      // Pendulum Simulation
      const pivotX = CX;
      const pivotY = topY;
      const rodPixelLen = 300;
      const bobX = pivotX + Math.sin(x) * rodPixelLen;
      const bobY = pivotY + Math.cos(x) * rodPixelLen;

      // Suspension Rod
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();

      // Pivot Bearing
      ctx.fillStyle = "#0284c7";
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Brass Bob
      const bobR = 18 + mass * 3;
      ctx.fillStyle = "#f59e0b";
      ctx.strokeStyle = "#fde68a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bobX, bobY, bobR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 10px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(`${mass.toFixed(1)}kg`, bobX, bobY + 3);
    }
  }

  // Render Kinematic Graph
  function renderGraph() {
    const W = graphCanvas.width;
    const H = graphCanvas.height;
    graphCtx.clearRect(0, 0, W, H);

    // Center Baseline (x = 0)
    const midY = H / 2;
    graphCtx.strokeStyle = "rgba(255,255,255,0.12)";
    graphCtx.lineWidth = 1;
    graphCtx.beginPath();
    graphCtx.moveTo(30, midY);
    graphCtx.lineTo(W - 10, midY);
    graphCtx.stroke();

    if (historyX.length < 2) return;

    // Plot x(t) wave
    const padL = 30;
    const plotW = W - padL - 10;
    const ampScale = (H * 0.42) / initialAmplitude;

    graphCtx.strokeStyle = "#00f0ff";
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
    graphCtx.fillText(`+${initialAmplitude.toFixed(2)}m`, padL - 4, 15);
    graphCtx.fillText(`-${initialAmplitude.toFixed(2)}m`, padL - 4, H - 8);
    graphCtx.fillText("0", padL - 4, midY + 3);
  }

  // Physics Euler-Cromer Integration Loop (60 FPS with DOM Throttle & Disconnect Protection)
  let lastTime = performance.now();
  let frameCount = 0;
  function loop(currentTime) {
    if (!container.isConnected) {
      if (animId) cancelAnimationFrame(animId);
      return;
    }
    const dt = Math.min(0.033, (currentTime - lastTime) / 1000);
    lastTime = currentTime;

    if (isRunning) {
      elapsedSeconds += dt;

      // Integration: F = -kx - bv => a = (-kx - bv) / m
      if (oscillatorType === "spring") {
        const F_spring = -springK * x;
        const F_damp = -dampingB * v;
        a = (F_spring + F_damp) / mass;
        v += a * dt;
        x += v * dt;
      } else {
        // Simple Pendulum: a = -(g/L) sin(x) - (b/m) v
        const F_grav = -(gravity / lengthL) * Math.sin(x);
        const F_damp = -(dampingB / mass) * v;
        a = F_grav + F_damp;
        v += a * dt;
        x += v * dt;
      }

      // Record History Buffer
      historyX.push(x);
      if (historyX.length > 180) historyX.shift();

      // Energy Calculations
      const PE = 0.5 * springK * x * x;
      const KE = 0.5 * mass * v * v;
      const E_tot = PE + KE;

      const T = getPeriod();
      const f = 1 / T;
      const omega = 2 * Math.PI * f;

      frameCount++;
      // Throttle DOM text updates to ~15 Hz (every 4th frame) to prevent main-thread layout thrashing on Android MAXHUB
      if (frameCount % 4 === 0) {
        if (dispPeriod) dispPeriod.innerText = `T = ${T.toFixed(3)} s`;
        if (dispFreq) dispFreq.innerText = `f = ${f.toFixed(3)} Hz • ω = ${omega.toFixed(2)} rad/s`;
        if (dispPos) dispPos.innerText = `x = ${x >= 0 ? "+" : ""}${x.toFixed(3)} m`;
        if (dispVel) dispVel.innerText = `v = ${v.toFixed(2)} m/s • a = ${a.toFixed(1)} m/s²`;
        if (dispEnergy) dispEnergy.innerText = `${E_tot.toFixed(2)} J (KE: ${KE.toFixed(2)}J, PE: ${PE.toFixed(2)}J)`;

        if (dispStatus) {
          if (Math.abs(v) < 0.08) {
            dispStatus.innerText = "⚡ Extreme Turning Point: v ≈ 0, PE = Max, Restoring Force Max";
          } else if (Math.abs(x) < 0.04) {
            dispStatus.innerText = "⚡ Equilibrium Point (x ≈ 0): PE = 0, Speed v = Max, KE = Max";
          } else {
            dispStatus.innerText = "🔄 Dynamic Oscillation: Harmonic Exchange between KE and PE";
          }
        }
      }
    }

    // Only render canvas when simulator is active (skip wasteful GPU overdraw if photo overlay is open)
    const photoEl = container.querySelector("#harmonic-photo-overlay");
    if (!photoEl || photoEl.style.display !== "block") {
      renderApparatus();
      renderGraph();
    }
    animId = requestAnimationFrame(loop);
  }
  animId = requestAnimationFrame(loop);

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
    SoundFX.playClick();
  });

  container.querySelector("#btn-shm-reset")?.addEventListener("click", () => {
    resetOscillator();
    SoundFX.playClick();
  });

  // Switch Oscillator Type
  container.querySelectorAll("[data-osc]").forEach(btn => {
    btn.addEventListener("click", () => {
      container.querySelectorAll("[data-osc]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      oscillatorType = btn.dataset.osc;
      container.querySelector("#block-spring-k").style.display = oscillatorType === "spring" ? "block" : "none";
      resetOscillator();
      SoundFX.playClick();
    });
  });

  // Sliders
  container.querySelector("#slider-shm-mass")?.addEventListener("input", (e) => {
    mass = parseFloat(e.target.value);
    container.querySelector("#lbl-shm-mass").innerText = `${mass.toFixed(2)} kg`;
  });

  container.querySelector("#slider-shm-k")?.addEventListener("input", (e) => {
    springK = parseFloat(e.target.value);
    container.querySelector("#lbl-shm-k").innerText = `${springK.toFixed(1)} N/m`;
  });

  container.querySelector("#slider-shm-damping")?.addEventListener("input", (e) => {
    dampingB = parseFloat(e.target.value);
    container.querySelector("#lbl-shm-damping").innerText = `${dampingB.toFixed(2)} N·s/m`;
  });

  // Export CSV
  container.querySelector("#btn-shm-export")?.addEventListener("click", () => {
    const T = getPeriod();
    exportLabDataCsv({
      title: "Simple Harmonic Motion Telemetry",
      labId: "harmonic",
      parameters: {
        "Oscillator Architecture": oscillatorType.toUpperCase(),
        "Mass m (kg)": mass,
        "Spring Constant k (N/m)": springK,
        "Damping b (N·s/m)": dampingB,
        "Period T (s)": T.toFixed(3),
        "Frequency f (Hz)": (1 / T).toFixed(3)
      },
      headers: ["Sample Step", "Displacement x (m)"],
      dataRows: historyX.map((val, idx) => [idx, val.toFixed(4)])
    });
  });

  // Mount Post-Lab Checkpoint Assessment
  mountLabCheckpoint("shm-checkpoint-container", "harmonic");

  return () => {
    if (animId) cancelAnimationFrame(animId);
  };
}
