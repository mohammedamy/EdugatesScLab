// Edugates-ClipSAT Science Labs - Physics: Electromagnetic Induction & Faraday's Law Suite
// 60 FPS Precision Solenoid & Magnetic Flux Simulation:
// Faraday's Law: E = -N · (dΦ_B / dt),
// Magnetic Flux: Φ_B = B · A · cos(θ),
// Lenz's Law: Direction of Induced Current opposes ΔΦ_B,
// Moving Bar Magnet, AC Harmonic Oscillator, Soft-Iron Core Permeability,
// Analog Galvanometer Center-Zero Deflection & Digital Storage Oscilloscope (DSO).

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initInductionLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return () => {};

  // Coil & Magnet Constants
  const COIL_RADIUS_M = 0.04; // 4.0 cm radius
  const COIL_AREA = Math.PI * COIL_RADIUS_M * COIL_RADIUS_M; // m²

  // State Variables
  let coilTurns = 200; // 50 to 500 turns
  let magnetStrength = 1.0; // Tesla (0.2 to 2.0 T)
  let hasIronCore = false; // permeability boost
  let isOscillating = false;
  let oscFreq = 1.5; // Hz
  let oscAmp = 0.35; // amplitude
  let isRunning = true;
  let animId = null;

  // Magnet Position & Kinematics
  // Position x is normalized along horizontal axis (-1.0 to 1.0, 0.0 is center of coil)
  let magnetX = -0.65;
  let magnetVx = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartMagnetX = 0;

  // Oscilloscope Trace Buffer
  const dsoBuffer = [];
  const MAX_DSO_POINTS = 160;

  // Telemetry Log
  const telemetryHistory = [];
  let simTime = 0;
  let lastTime = performance.now();
  let prevFlux = 0;

  // Calculate Magnetic Field B at distance x along solenoid axis
  function calculateBFieldAt(xDist) {
    // Dipole / Solenoid field approximation along axis:
    // B(x) = (mu_0 * M) / (2 * pi * (x^2 + R^2)^(3/2))
    const effMu = hasIronCore ? 8.5 : 1.0;
    const distM = xDist * 0.3; // scale to ~0.3m span
    const denom = Math.pow(distM * distM + COIL_RADIUS_M * COIL_RADIUS_M, 1.5);
    const B = (effMu * magnetStrength * 0.0004) / denom;
    return B;
  }

  function getFluxAndEmf(dt) {
    const B = calculateBFieldAt(magnetX);
    // Flux is positive when N-pole faces into coil
    const flux = B * COIL_AREA;
    
    // dPhi / dt
    let dPhi_dt = 0;
    if (dt > 0.001) {
      dPhi_dt = (flux - prevFlux) / dt;
    }
    prevFlux = flux;

    // Faraday's Law: E = -N * (dPhi / dt)
    const emf = -coilTurns * dPhi_dt; // Volts
    // Galvanometer deflection current (approx I = E / R_coil)
    const coilResistance = (coilTurns * 0.02) + 5.0; // Ohms
    const currentMicroAmps = (emf / coilResistance) * 1e6; // uA

    return { flux, dPhi_dt, emf, currentMicroAmps };
  }

  container.innerHTML = `
    <div class="lab-container" style="max-width: 1400px; margin: 0 auto; padding: 12px 16px;">
      <!-- Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #fbbf24; box-shadow: 0 0 10px #fbbf24;"></span>
            Faraday's Law &amp; Electromagnetic Induction Workbench
          </span>
          <span class="badge" style="background: rgba(251, 191, 36, 0.15); border: 1px solid rgba(251, 191, 36, 0.3); color: #fde047; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            ${renderLatex("\\mathcal{E} = -N \\frac{d\\Phi_B}{dt} \\quad \\bullet \\quad \\Phi_B = \\vec{B} \\cdot \\vec{A} \\quad \\bullet \\quad \\text{Lenz's Law}")}
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div class="btn-group" style="display: flex; border: 1px solid var(--border-color); border-radius: 6px; overflow: hidden;">
            <button id="btn-view-sim" class="btn btn-sm active" style="padding: 5px 12px; font-size: 0.8rem; border: none; border-radius: 0;">🔬 Induction Simulator</button>
            <button id="btn-view-photo" class="btn btn-sm" style="padding: 5px 12px; font-size: 0.8rem; border: none; border-radius: 0; background: transparent;">📸 4K Real Bench</button>
          </div>
          <button id="btn-export-csv" class="btn btn-secondary btn-sm" style="padding: 5px 12px; font-size: 0.8rem;">📥 Export CSV (E)</button>
        </div>
      </div>

      <!-- Main Layout -->
      <div style="display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 16px; align-items: start;">
        
        <!-- Left Column: Simulation Canvas & DSO -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div id="viewport-wrapper" style="position: relative; width: 100%; height: 500px; background: #080c14; border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; box-shadow: inset 0 0 40px rgba(0,0,0,0.85); user-select: none;">
            
            <!-- Canvas -->
            <canvas id="induction-canvas" width="940" height="500" style="display: block; width: 100%; height: 100%; cursor: grab;"></canvas>

            <!-- 4K Real Lab Bench Photo Overlay (Hidden by default) -->
            <div id="photo-overlay" style="display: none; position: absolute; inset: 0; background: #020617;">
              <picture>
              <source srcset="assets/labs/induction_bench.webp" type="image/webp">
              <img src="assets/labs/induction_bench.jpg" decoding="async" loading="lazy" alt="Faraday Electromagnetic Induction 4K Bench" style="width: 100%; height: 100%; object-fit: cover;" />
            </picture>
              <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(2,6,23,0.3) 0%, rgba(2,6,23,0.85) 100%); pointer-events: none;"></div>
              
              <!-- Bench Callout Badges -->
              <div style="position: absolute; top: 20px; left: 24px; background: rgba(15, 23, 42, 0.9); border: 1px solid #fbbf24; border-radius: 8px; padding: 12px 16px; backdrop-filter: blur(8px); max-width: 340px;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #fbbf24; letter-spacing: 0.05em; text-transform: uppercase;">Real Apparatus Specifications</div>
                <div style="font-size: 0.95rem; font-weight: 600; color: #f8fafc; margin-top: 4px;">Copper Solenoid, Galvanometer &amp; Digital Storage Scope</div>
                <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 6px; line-height: 1.4;">
                  Multi-turn induction coil with heavy gauge enameled copper winding, high-sensitivity center-zero galvanometer, and Rigol DSO waveform capture.
                </div>
              </div>

              <!-- Live Bench Telemetry Overlay -->
              <div style="position: absolute; bottom: 20px; left: 24px; right: 24px; background: rgba(15, 23, 42, 0.88); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px 20px; backdrop-filter: blur(10px); display: flex; justify-content: space-around; flex-wrap: wrap; gap: 16px;">
                <div>
                  <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase;">Coil Turns (N)</div>
                  <div id="photo-turns" style="font-size: 1.15rem; font-weight: 700; color: #fbbf24; font-family: monospace;">200 turns</div>
                </div>
                <div>
                  <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase;">Induced EMF (E)</div>
                  <div id="photo-emf" style="font-size: 1.15rem; font-weight: 700; color: #38bdf8; font-family: monospace;">0.00 mV</div>
                </div>
                <div>
                  <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase;">Galvanometer Current</div>
                  <div id="photo-current" style="font-size: 1.15rem; font-weight: 700; color: #10b981; font-family: monospace;">0.0 μA</div>
                </div>
                <div>
                  <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase;">Magnetic Flux (Φ)</div>
                  <div id="photo-flux" style="font-size: 1.15rem; font-weight: 700; color: #c084fc; font-family: monospace;">0.00 μWb</div>
                </div>
                <div>
                  <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase;">Core Material</div>
                  <div id="photo-core" style="font-size: 1.15rem; font-weight: 700; color: #f8fafc; font-family: monospace;">Air Core</div>
                </div>
              </div>
            </div>

            <!-- Drag Prompt Overlay -->
            <div style="position: absolute; bottom: 12px; left: 16px; pointer-events: none; background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 4px 10px; font-size: 0.72rem; color: #94a3b8;">
              👆 Drag bar magnet horizontally through coil or turn on AC Oscillator
            </div>
          </div>

          <!-- Telemetry Points Logger -->
          <div style="background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-size: 0.85rem; font-weight: 700; color: #f8fafc; text-transform: uppercase; letter-spacing: 0.05em;">
                📈 Induced Voltage Waveform Log
              </span>
              <button id="btn-record-point" class="btn btn-sm" style="font-size: 0.75rem; background: rgba(251, 191, 36, 0.15); border: 1px solid #fbbf24; color: #fbbf24; padding: 3px 10px;">
                ➕ Capture Point
              </button>
            </div>
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; text-align: left; font-family: monospace;">
                <thead>
                  <tr style="border-bottom: 1px solid var(--border-color); color: #94a3b8;">
                    <th style="padding: 6px 8px;">Time (s)</th>
                    <th style="padding: 6px 8px;">Magnet Pos (x)</th>
                    <th style="padding: 6px 8px;">Turns (N)</th>
                    <th style="padding: 6px 8px;">Flux Φ (μWb)</th>
                    <th style="padding: 6px 8px;">dΦ/dt (μWb/s)</th>
                    <th style="padding: 6px 8px;">Induced EMF (mV)</th>
                    <th style="padding: 6px 8px;">Current (μA)</th>
                  </tr>
                </thead>
                <tbody id="telemetry-table-body">
                  <tr>
                    <td colspan="7" style="padding: 10px; text-align: center; color: #64748b;">No capture points yet. Click "Capture Point" or oscillate magnet to log.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right Column: Control Dashboard -->
        <div style="background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px; display: flex; flex-direction: column; gap: 18px;">
          
          <!-- Plunge / Oscillation Controls -->
          <div>
            <label style="font-size: 0.8rem; font-weight: 700; color: #cbd5e1; display: block; margin-bottom: 6px;">
              Motion Mode
            </label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <button id="btn-mode-manual" class="btn btn-sm active" style="font-size: 0.75rem; background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; color: #38bdf8;">
                🖐️ Interactive Drag
              </button>
              <button id="btn-mode-osc" class="btn btn-sm" style="font-size: 0.75rem; background: rgba(100, 116, 139, 0.2); border: 1px solid var(--border-color); color: #94a3b8;">
                🔄 AC Harmonic Drive
              </button>
            </div>
          </div>

          <!-- AC Drive Options (when oscillating) -->
          <div id="osc-controls" style="display: none; background: rgba(251, 191, 36, 0.05); border: 1px solid rgba(251, 191, 36, 0.2); border-radius: 8px; padding: 12px;">
            <div style="font-size: 0.78rem; font-weight: 700; color: #fbbf24; margin-bottom: 8px;">
              AC Drive Generator
            </div>
            <div style="margin-bottom: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: #94a3b8;">
                <span>Frequency (f)</span>
                <span id="lbl-freq" style="color: #f8fafc; font-weight: 600;">1.5 Hz</span>
              </div>
              <input type="range" id="slider-freq" min="0.5" max="4.0" step="0.1" value="1.5" style="width: 100%; accent-color: #fbbf24;" />
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: #94a3b8;">
                <span>Plunge Amplitude (A)</span>
                <span id="lbl-amp" style="color: #f8fafc; font-weight: 600;">0.35 m</span>
              </div>
              <input type="range" id="slider-amp" min="0.15" max="0.55" step="0.05" value="0.35" style="width: 100%; accent-color: #fbbf24;" />
            </div>
          </div>

          <!-- Coil Turns Slider (N) -->
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; margin-bottom: 4px;">
              <span>Solenoid Coil Turns (N)</span>
              <span id="lbl-turns" style="color: #fbbf24; font-weight: 700;">200 turns</span>
            </div>
            <input type="range" id="slider-turns" min="50" max="500" step="25" value="200" style="width: 100%; accent-color: #fbbf24;" />
            <div style="font-size: 0.72rem; color: #64748b; margin-top: 4px;">
              Faraday EMF scales linearly with turn count N
            </div>
          </div>

          <!-- Magnet Strength Slider -->
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; margin-bottom: 4px;">
              <span>Magnet Dipole Field (B₀)</span>
              <span id="lbl-strength" style="color: #38bdf8; font-weight: 700;">1.00 T</span>
            </div>
            <input type="range" id="slider-strength" min="0.2" max="2.0" step="0.1" value="1.0" style="width: 100%; accent-color: #38bdf8;" />
          </div>

          <!-- Soft Iron Core Insertion Toggle -->
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 14px;">
            <div>
              <div style="font-size: 0.8rem; font-weight: 600; color: #f8fafc;">Soft-Iron Core</div>
              <div style="font-size: 0.72rem; color: #94a3b8;">High permeability (μᵣ = 8.5× boost)</div>
            </div>
            <label style="position: relative; display: inline-block; width: 40px; height: 22px;">
              <input type="checkbox" id="check-iron" style="opacity: 0; width: 0; height: 0;" />
              <span id="iron-toggle-span" style="position: absolute; cursor: pointer; inset: 0; background: #475569; border-radius: 22px; transition: 0.2s;"></span>
            </label>
          </div>

          <!-- Fast Preset Buttons -->
          <div>
            <label style="font-size: 0.75rem; font-weight: 600; color: #94a3b8; display: block; margin-bottom: 6px;">
              Curriculum Demonstrations
            </label>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <button id="btn-demo-lenz" class="btn btn-secondary btn-sm" style="font-size: 0.75rem; text-align: left; padding: 6px 10px;">
                ⚡ Lenz's Law Plunge Test
              </button>
              <button id="btn-demo-ac" class="btn btn-secondary btn-sm" style="font-size: 0.75rem; text-align: left; padding: 6px 10px;">
                🌊 AC Sine Wave Generator
              </button>
            </div>
          </div>

          <!-- Checkpoint Quiz Mount -->
          <div id="induction-checkpoint-mount" style="margin-top: 6px;"></div>

        </div>
      </div>
    </div>
  `;

  // Canvas & Control Bindings
  const canvas = document.getElementById("induction-canvas");
  const ctx = canvas?.getContext("2d");
  const viewSim = document.getElementById("btn-view-sim");
  const viewPhoto = document.getElementById("btn-view-photo");
  const photoOverlay = document.getElementById("photo-overlay");
  const exportBtn = document.getElementById("btn-export-csv");
  const recordBtn = document.getElementById("btn-record-point");

  const btnModeManual = document.getElementById("btn-mode-manual");
  const btnModeOsc = document.getElementById("btn-mode-osc");
  const oscControls = document.getElementById("osc-controls");
  const sliderFreq = document.getElementById("slider-freq");
  const sliderAmp = document.getElementById("slider-amp");
  const sliderTurns = document.getElementById("slider-turns");
  const sliderStrength = document.getElementById("slider-strength");
  const checkIron = document.getElementById("check-iron");
  const ironToggleSpan = document.getElementById("iron-toggle-span");

  const lblFreq = document.getElementById("lbl-freq");
  const lblAmp = document.getElementById("lbl-amp");
  const lblTurns = document.getElementById("lbl-turns");
  const lblStrength = document.getElementById("lbl-strength");

  const photoTurns = document.getElementById("photo-turns");
  const photoEmf = document.getElementById("photo-emf");
  const photoCurrent = document.getElementById("photo-current");
  const photoFlux = document.getElementById("photo-flux");
  const photoCore = document.getElementById("photo-core");
  const tableBody = document.getElementById("telemetry-table-body");

  // Interaction handlers for dragging magnet
  function getCanvasCoord(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    return (clientX - rect.left) / rect.width; // 0..1
  }

  canvas?.addEventListener("mousedown", (e) => {
    isDragging = true;
    dragStartX = getCanvasCoord(e);
    dragStartMagnetX = magnetX;
    canvas.style.cursor = "grabbing";
  });

  const onMouseMove = (e) => {
    if (!isDragging || isOscillating) return;
    const currentCoord = getCanvasCoord(e);
    const delta = (currentCoord - dragStartX) * 2.0; // scale
    const newX = Math.max(-0.95, Math.min(0.95, dragStartMagnetX + delta));
    magnetVx = (newX - magnetX) * 60; // instantaneous speed
    magnetX = newX;
  };
  window.addEventListener("mousemove", onMouseMove);

  const onMouseUp = () => {
    if (isDragging) {
      isDragging = false;
      if (canvas) canvas.style.cursor = "grab";
      magnetVx = 0;
    }
  };
  window.addEventListener("mouseup", onMouseUp);

  // Touch support for Smartboards & Tablets
  canvas?.addEventListener("touchstart", (e) => {
    isDragging = true;
    dragStartX = getCanvasCoord(e);
    dragStartMagnetX = magnetX;
  }, { passive: true });

  const onTouchMove = (e) => {
    if (!isDragging || isOscillating) return;
    const currentCoord = getCanvasCoord(e);
    const delta = (currentCoord - dragStartX) * 2.0;
    const newX = Math.max(-0.95, Math.min(0.95, dragStartMagnetX + delta));
    magnetVx = (newX - magnetX) * 60;
    magnetX = newX;
  };
  window.addEventListener("touchmove", onTouchMove, { passive: true });

  const onTouchEnd = () => {
    isDragging = false;
    magnetVx = 0;
  };
  window.addEventListener("touchend", onTouchEnd);

  function recordPoint(data) {
    telemetryHistory.unshift({
      time: simTime.toFixed(2),
      x: magnetX.toFixed(2),
      turns: coilTurns,
      flux: (data.flux * 1e6).toFixed(2),
      dPhi: (data.dPhi_dt * 1e6).toFixed(2),
      emf: (data.emf * 1e3).toFixed(2),
      current: data.currentMicroAmps.toFixed(1)
    });
    if (telemetryHistory.length > 8) telemetryHistory.pop();
    updateTable();
  }

  function updateTable() {
    if (!tableBody) return;
    if (telemetryHistory.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="padding: 10px; text-align: center; color: #64748b;">No capture points yet.</td></tr>`;
      return;
    }
    tableBody.innerHTML = telemetryHistory.map(row => `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); color: #e2e8f0;">
        <td style="padding: 6px 8px; color: #94a3b8;">${row.time}s</td>
        <td style="padding: 6px 8px;">${row.x}</td>
        <td style="padding: 6px 8px; color: #fbbf24;">${row.turns}</td>
        <td style="padding: 6px 8px; color: #c084fc;">${row.flux}</td>
        <td style="padding: 6px 8px;">${row.dPhi}</td>
        <td style="padding: 6px 8px; font-weight: 700; color: #38bdf8;">${row.emf}</td>
        <td style="padding: 6px 8px; font-weight: 700; color: #10b981;">${row.current}</td>
      </tr>
    `).join("");
  }

  function drawApparatus(data) {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apparatus dimensions
    const midX = canvas.width * 0.44; // Solenoid center
    const midY = 190;
    const coilW = 160;
    const coilH = 130;

    // 1. Background Grid & Magnetic Flux Lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Render Magnetic B-field Flux Loops around Magnet
    const magPx = midX + magnetX * 280;
    const magPy = midY;
    const magW = 140;
    const magH = 46;

    // Flux lines
    ctx.save();
    const fluxAlpha = Math.min(0.8, 0.2 + Math.abs(data.dPhi_dt) * 2000);
    ctx.strokeStyle = `rgba(56, 189, 248, ${fluxAlpha})`;
    ctx.lineWidth = 1.2;
    for (let loop = 1; loop <= 5; loop++) {
      const rx = 80 + loop * 40;
      const ry = 40 + loop * 22;
      ctx.beginPath();
      ctx.ellipse(magPx, magPy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Solenoid Core (Soft Iron if enabled)
    if (hasIronCore) {
      ctx.fillStyle = "#64748b";
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(midX - coilW / 2 + 10, midY - coilH / 2 + 15, coilW - 20, coilH - 30, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("SOFT IRON CORE", midX, midY + 4);
    }

    // 3. Copper Wire Solenoid Loops
    const loopsCount = Math.round(coilTurns / 15);
    const loopSpacing = coilW / loopsCount;
    for (let i = 0; i < loopsCount; i++) {
      const lx = midX - coilW / 2 + i * loopSpacing + 5;
      
      // Wire loop gradient
      const wireGrad = ctx.createLinearGradient(lx, midY - coilH / 2, lx, midY + coilH / 2);
      wireGrad.addColorStop(0, "#fbbf24");
      wireGrad.addColorStop(0.3, "#d97706");
      wireGrad.addColorStop(0.7, "#f59e0b");
      wireGrad.addColorStop(1, "#78350f");

      ctx.strokeStyle = wireGrad;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.ellipse(lx, midY, 6, coilH / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Solenoid Mounting Base Frame
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(midX - coilW / 2 - 12, midY + coilH / 2 - 4, coilW + 24, 20);
    ctx.fillStyle = "#334155";
    ctx.fillRect(midX - 40, midY + coilH / 2 + 16, 80, 40);

    // Coil Lead Wires connected to Galvanometer
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(midX - coilW / 2 + 10, midY + coilH / 2);
    ctx.bezierCurveTo(midX - 100, midY + 120, 200, 240, 160, 360);
    ctx.stroke();

    ctx.strokeStyle = "#38bdf8";
    ctx.beginPath();
    ctx.moveTo(midX + coilW / 2 - 10, midY + coilH / 2);
    ctx.bezierCurveTo(midX + 60, midY + 140, 220, 260, 180, 360);
    ctx.stroke();

    // 4. Bar Magnet (Draggable / Oscillating)
    // North Pole (Red) & South Pole (Blue)
    const nWidth = magW / 2;
    const sWidth = magW / 2;

    // North half
    const nGrad = ctx.createLinearGradient(magPx - nWidth, magPy, magPx, magPy);
    nGrad.addColorStop(0, "#dc2626");
    nGrad.addColorStop(1, "#ef4444");
    ctx.fillStyle = nGrad;
    ctx.beginPath();
    ctx.roundRect(magPx - magW / 2, magPy - magH / 2, nWidth, magH, [6, 0, 0, 6]);
    ctx.fill();

    // South half
    const sGrad = ctx.createLinearGradient(magPx, magPy, magPx + sWidth, magPy);
    sGrad.addColorStop(0, "#2563eb");
    sGrad.addColorStop(1, "#3b82f6");
    ctx.fillStyle = sGrad;
    ctx.beginPath();
    ctx.roundRect(magPx, magPy - magH / 2, sWidth, magH, [0, 6, 6, 0]);
    ctx.fill();

    // Pole labels
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("N", magPx - magW / 4, magPy);
    ctx.fillText("S", magPx + magW / 4, magPy);

    // Magnet Outline & Highlights
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(magPx - magW / 2, magPy - magH / 2, magW, magH);

    // 5. Analog Galvanometer (Center Zero Instrument on Bottom Left)
    const galvX = 140;
    const galvY = 410;
    const galvR = 64;

    // Housing
    ctx.fillStyle = "#0f172a";
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(galvX, galvY, galvR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Scale face
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.arc(galvX, galvY, galvR - 8, Math.PI, 2 * Math.PI);
    ctx.fill();

    // Scale ticks (-50 to +50 uA)
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    for (let a = -45; a <= 45; a += 15) {
      const rad = (a - 90) * (Math.PI / 180);
      const x1 = galvX + Math.cos(rad) * (galvR - 12);
      const y1 = galvY + Math.sin(rad) * (galvR - 12);
      const x2 = galvX + Math.cos(rad) * (galvR - 22);
      const y2 = galvY + Math.sin(rad) * (galvR - 22);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.fillText("0", galvX, galvY - galvR + 28);
    ctx.fillText("-50", galvX - 35, galvY - 14);
    ctx.fillText("+50", galvX + 35, galvY - 14);
    ctx.fillText("μA", galvX, galvY - 8);

    // Galvanometer Needle (Deflection proportional to current)
    const maxI = 50; // uA max scale
    const clampedI = Math.max(-maxI, Math.min(maxI, data.currentMicroAmps));
    const needleAngle = (clampedI / maxI) * 45 - 90; // degrees
    const needleRad = needleAngle * (Math.PI / 180);

    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(galvX, galvY);
    ctx.lineTo(galvX + Math.cos(needleRad) * (galvR - 14), galvY + Math.sin(needleRad) * (galvR - 14));
    ctx.stroke();

    // Center pivot
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(galvX, galvY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText("GALVANOMETER", galvX, galvY + 18);

    // 6. Digital Storage Oscilloscope (DSO Screen on Bottom Right)
    const dsoX = 340;
    const dsoY = 340;
    const dsoW = canvas.width - dsoX - 30;
    const dsoH = 140;

    // DSO Bezel
    ctx.fillStyle = "#020617";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(dsoX, dsoY, dsoW, dsoH, 8);
    ctx.fill();
    ctx.stroke();

    // Oscilloscope Grid Lines (green phosphor style)
    ctx.strokeStyle = "rgba(34, 197, 94, 0.15)";
    ctx.lineWidth = 1;
    for (let gx = dsoX + 20; gx < dsoX + dsoW; gx += 30) {
      ctx.beginPath();
      ctx.moveTo(gx, dsoY);
      ctx.lineTo(gx, dsoY + dsoH);
      ctx.stroke();
    }
    for (let gy = dsoY + 20; gy < dsoY + dsoH; gy += 25) {
      ctx.beginPath();
      ctx.moveTo(dsoX, gy);
      ctx.lineTo(dsoX + dsoW, gy);
      ctx.stroke();
    }

    // DSO Center Ground Line
    const dsoMidY = dsoY + dsoH / 2;
    ctx.strokeStyle = "rgba(34, 197, 94, 0.4)";
    ctx.beginPath();
    ctx.moveTo(dsoX, dsoMidY);
    ctx.lineTo(dsoX + dsoW, dsoMidY);
    ctx.stroke();

    // Render DSO Waveform Trace
    if (dsoBuffer.length > 1) {
      ctx.strokeStyle = "#4ade80";
      ctx.lineWidth = 2.2;
      ctx.shadowColor = "#22c55e";
      ctx.shadowBlur = 6;
      ctx.beginPath();

      const stepX = dsoW / MAX_DSO_POINTS;
      for (let p = 0; p < dsoBuffer.length; p++) {
        const px = dsoX + p * stepX;
        // Scale emf (mV) to screen
        const py = dsoMidY - dsoBuffer[p] * 0.4;
        if (p === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // DSO HUD Info
    ctx.fillStyle = "#4ade80";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "left";
    ctx.fillText("CH1: 20 mV/DIV   TIME: 50 ms/DIV", dsoX + 12, dsoY + 16);
    ctx.textAlign = "right";
    ctx.fillText(`EMF = ${(data.emf * 1e3).toFixed(1)} mV`, dsoX + dsoW - 12, dsoY + 16);
  }

  function loop(timestamp) {
    if (!container || !container.isConnected) {
      isRunning = false;
      if (animId) cancelAnimationFrame(animId);
      return;
    }
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;

    if (isRunning) {
      simTime += dt;

      // Harmonic AC oscillator drive
      if (isOscillating) {
        const omega = 2 * Math.PI * oscFreq;
        magnetX = oscAmp * Math.sin(omega * simTime);
        magnetVx = oscAmp * omega * Math.cos(omega * simTime);
      }

      const data = getFluxAndEmf(dt);

      // Push to DSO buffer (mV)
      dsoBuffer.push(data.emf * 1e3);
      if (dsoBuffer.length > MAX_DSO_POINTS) dsoBuffer.shift();

      // Update Real Bench Photo HUD
      if (photoTurns) photoTurns.textContent = `${coilTurns} turns`;
      if (photoEmf) photoEmf.textContent = `${(data.emf * 1e3).toFixed(2)} mV`;
      if (photoCurrent) photoCurrent.textContent = `${data.currentMicroAmps.toFixed(1)} μA`;
      if (photoFlux) photoFlux.textContent = `${(data.flux * 1e6).toFixed(2)} μWb`;
      if (photoCore) photoCore.textContent = hasIronCore ? "Soft Iron (μᵣ=8.5)" : "Air Core (μᵣ=1.0)";

      drawApparatus(data);
    }

    animId = requestAnimationFrame(loop);
  }

  // Event Listeners
  btnModeManual?.addEventListener("click", () => {
    isOscillating = false;
    btnModeManual.className = "btn btn-sm active";
    btnModeManual.style.background = "rgba(56, 189, 248, 0.15)";
    btnModeManual.style.borderColor = "#38bdf8";
    btnModeManual.style.color = "#38bdf8";
    btnModeOsc.className = "btn btn-sm";
    btnModeOsc.style.background = "rgba(100, 116, 139, 0.2)";
    btnModeOsc.style.borderColor = "var(--border-color)";
    btnModeOsc.style.color = "#94a3b8";
    if (oscControls) oscControls.style.display = "none";
  });

  btnModeOsc?.addEventListener("click", () => {
    isOscillating = true;
    btnModeOsc.className = "btn btn-sm active";
    btnModeOsc.style.background = "rgba(251, 191, 36, 0.15)";
    btnModeOsc.style.borderColor = "#fbbf24";
    btnModeOsc.style.color = "#fbbf24";
    btnModeManual.className = "btn btn-sm";
    btnModeManual.style.background = "rgba(100, 116, 139, 0.2)";
    btnModeManual.style.borderColor = "var(--border-color)";
    btnModeManual.style.color = "#94a3b8";
    if (oscControls) oscControls.style.display = "block";
  });

  sliderTurns?.addEventListener("input", (e) => {
    coilTurns = parseInt(e.target.value, 10);
    if (lblTurns) lblTurns.textContent = `${coilTurns} turns`;
  });

  sliderStrength?.addEventListener("input", (e) => {
    magnetStrength = parseFloat(e.target.value);
    if (lblStrength) lblStrength.textContent = `${magnetStrength.toFixed(2)} T`;
  });

  sliderFreq?.addEventListener("input", (e) => {
    oscFreq = parseFloat(e.target.value);
    if (lblFreq) lblFreq.textContent = `${oscFreq.toFixed(1)} Hz`;
  });

  sliderAmp?.addEventListener("input", (e) => {
    oscAmp = parseFloat(e.target.value);
    if (lblAmp) lblAmp.textContent = `${oscAmp.toFixed(2)} m`;
  });

  checkIron?.addEventListener("change", (e) => {
    hasIronCore = e.target.checked;
    if (ironToggleSpan) ironToggleSpan.style.background = hasIronCore ? "#fbbf24" : "#475569";
    SoundFX.playBeep();
  });

  recordBtn?.addEventListener("click", () => {
    const data = getFluxAndEmf(0.016);
    recordPoint(data);
    SoundFX.playClick();
  });

  document.getElementById("btn-demo-lenz")?.addEventListener("click", () => {
    btnModeManual?.click();
    magnetX = -0.75;
    // Rapid thrust into coil
    let step = 0;
    const thrustInterval = setInterval(() => {
      step++;
      magnetX += 0.08;
      if (step > 18) clearInterval(thrustInterval);
    }, 16);
  });

  document.getElementById("btn-demo-ac")?.addEventListener("click", () => {
    btnModeOsc?.click();
    oscFreq = 2.0;
    if (sliderFreq) sliderFreq.value = 2.0;
    if (lblFreq) lblFreq.textContent = "2.0 Hz";
  });

  // Dual View Mode Switcher
  viewSim?.addEventListener("click", () => {
    viewSim.classList.add("active");
    viewPhoto.classList.remove("active");
    viewSim.style.background = "";
    viewPhoto.style.background = "transparent";
    if (photoOverlay) photoOverlay.style.display = "none";
  });

  viewPhoto?.addEventListener("click", () => {
    viewPhoto.classList.add("active");
    viewSim.classList.remove("active");
    viewPhoto.style.background = "";
    viewSim.style.background = "transparent";
    if (photoOverlay) photoOverlay.style.display = "block";
  });

  exportBtn?.addEventListener("click", () => {
    if (telemetryHistory.length === 0) {
      const data = getFluxAndEmf(0.016);
      recordPoint(data);
    }
    exportLabDataCsv({
      title: "Electromagnetic Induction & Faraday-Lenz Dynamo Telemetry",
      labId: "induction",
      parameters: {
        "Coil Turns (N)": `${coilTurns}`,
        "Coil Resistance (Ω)": `${COIL_RESISTANCE_OHMS} Ω`,
        "Solenoid Loop Radius (m)": `${COIL_RADIUS_M} m`,
        "Magnet Remanence B0 (T)": `${B0_TESLA} T`,
        "Ferromagnetic Core": hasIronCore ? "High-Permeability Soft Iron" : "Air Core"
      },
      headers: [
        "Time (s)",
        "Magnet Position x (m)",
        "Coil Turns (N)",
        "Magnetic Flux Φ (µWb)",
        "dΦ/dt (µWb/s)",
        "Induced EMF (mV)",
        "Induced Current (µA)"
      ],
      dataRows: telemetryHistory.map(row => [
        row.time,
        row.x,
        row.turns,
        row.flux,
        row.dPhi,
        row.emf,
        row.current
      ])
    });
  });

  // Standardized Hotkey: 'e' or 'E' triggers CSV telemetry export
  const handleKeyDown = (e) => {
    if ((e.key === "e" || e.key === "E") && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      exportBtn?.click();
    }
  };
  window.addEventListener("keydown", handleKeyDown);

  // Mount Assessment Checkpoint
  mountLabCheckpoint("induction-checkpoint-mount", "phys-induction");

  // Initial render loop
  animId = requestAnimationFrame(loop);

  return () => {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onTouchEnd);
    window.removeEventListener("keydown", handleKeyDown);
  };
}
