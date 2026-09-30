// Edugates-ClipSAT Science Labs - Biology: Neurobiology & Action Potential Patch Clamp Suite
// 60 FPS Precision Electrophysiology Simulation:
// Hodgkin-Huxley & GHK Membrane Voltage Vm, Voltage-Gated Na+/K+ Channel Kinetics,
// Threshold Stimulus, Absolute/Relative Refractory Periods, Neurotoxins (TTX & TEA), and Dual-Trace Oscilloscope.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initActionPotentialLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Electrophysiological Constants
  const E_NA = 55.0; // mV Nernst potential Na+
  const E_K = -90.0; // mV Nernst potential K+
  const E_LEAK = -65.0; // mV Leak potential
  const G_LEAK = 0.3; // mS/cm²

  // Neurotoxins
  const TOXINS = {
    none: { name: "Control (Ringer's Buffer)", desc: "Standard physiological extracellular ions", blockNa: 0, blockK: 0 },
    ttx: { name: "Tetrodotoxin (TTX - Pufferfish)", desc: "Selectively blocks voltage-gated Na⁺ channels", blockNa: 1.0, blockK: 0 },
    tea: { name: "Tetraethylammonium (TEA)", desc: "Selectively blocks voltage-gated K⁺ channels", blockNa: 0, blockK: 1.0 }
  };

  // State
  let activeToxinKey = "none";
  let stimCurrent = 20.0; // μA/cm² (0 to 50)
  let stimDuration = 2.0; // ms
  let isStimulating = false;
  let stimTimer = 0;

  // Hodgkin-Huxley Gating Variables
  let vm = -70.0; // Resting membrane potential (mV)
  let mGate = 0.05; // Na+ activation
  let hGate = 0.60; // Na+ inactivation
  let nGate = 0.32; // K+ activation

  let simTimeMs = 0.0;
  let isRunning = true;
  let animId = null;

  // Trace Buffer for Oscilloscope
  const oscilloscopeTrace = []; // { t, vm, gNa, gK }

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #a855f7; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #a855f7; box-shadow: 0 0 10px #a855f7;"></span>
            Neurobiology &amp; Action Potential Patch Clamp
          </span>
          <span class="badge" style="background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.3); color: #c084fc; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            V_m = -70 \\text{ mV} \\rightarrow +35 \\text{ mV} \\quad g_{Na} = \\bar{g}_{Na}m^3h \\quad g_K = \\bar{g}_Kn^4
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-neuro-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Patch Simulator
            </button>
            <button id="view-mode-neuro-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Rig
            </button>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-neuro-stim" style="padding: 5px 14px; font-size: 0.78rem;">
            ⚡ Inject Stimulus Current
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-neuro-reset" style="padding: 5px 12px; font-size: 0.78rem;">
            ⟲ Clear Trace
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-neuro-export" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export Telemetry
          </button>
        </div>
      </div>

      <!-- Main Layout -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="neuro-layout">
        <!-- Canvas Viewport: Axon Lipid Bilayer & Channel Conformation -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(168, 85, 247, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #1e1b4b 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="neuro-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
          <div id="neuro-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <img src="assets/labs/action_potential_bench.jpg" alt="4K Patch-Clamp Electrophysiology Rig" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            
            <!-- Live Analytical Telemetry Callout on Photo -->
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Faraday Isolation Cage Rig</div>
                <div style="color: #c084fc; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Inverted Scope &amp; Micromanipulators</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Axon Clamp Amplifier</div>
                <div style="color: #facc15; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Axopatch 200B + Digidata 1550B</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Tektronix Real-Time Scope</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">V_peak = +35 mV • V_rest = -70 mV</div>
              </div>
            </div>
          </div>

          <!-- Top HUD -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">MEMBRANE VOLTAGE V_m</div>
              <div id="hud-neuro-vm" style="font-size: 1.3rem; font-weight: 800; color: #c084fc; font-family: var(--font-mono);">
                -70.0 mV
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">MEMBRANE PHASE</div>
              <div id="hud-neuro-phase" style="font-size: 1.05rem; font-weight: 800; color: #38bdf8; font-family: var(--font-mono);">
                Resting (-70 mV)
              </div>
            </div>
          </div>
        </div>

        <!-- Controls & Dual Oscilloscope -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Controls Panel -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #c084fc; text-transform: uppercase; margin-bottom: 12px;">Electrode &amp; Pharmacology Controls</div>

            <div style="margin-bottom: 12px;">
              <label style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Neurotoxin Pharmacological Perfusion</label>
              <select id="select-neuro-toxin" class="form-control" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                ${Object.entries(TOXINS).map(([k, t]) => `<option value="${k}">${t.name}</option>`).join("")}
              </select>
            </div>

            <!-- Stimulus Intensity Slider -->
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                <span style="color: #94a3b8;">Stimulus Current Pulse (I_stim)</span>
                <span id="lbl-neuro-stim" style="font-weight: 700; color: #38bdf8; font-family: var(--font-mono);">20.0 μA/cm²</span>
              </div>
              <input type="range" id="slider-neuro-stim" min="0" max="50" step="1" value="20" style="width: 100%; accent-color: #38bdf8;">
            </div>

            <!-- Quick Specs -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; background: rgba(0,0,0,0.3); border-radius: 8px; padding: 8px 10px; font-size: 0.75rem; text-align: center;">
              <div>
                <span style="color: #64748b; display: block;">Threshold</span>
                <span style="font-weight: 700; color: #f43f5e; font-family: var(--font-mono);">-55.0 mV</span>
              </div>
              <div>
                <span style="color: #64748b; display: block;">E_Na⁺</span>
                <span style="font-weight: 700; color: #38bdf8; font-family: var(--font-mono);">+55.0 mV</span>
              </div>
              <div>
                <span style="color: #64748b; display: block;">E_K⁺</span>
                <span style="font-weight: 700; color: #a855f7; font-family: var(--font-mono);">-90.0 mV</span>
              </div>
            </div>
          </div>

          <!-- Dual-Trace Oscilloscope Canvas -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; flex: 1; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">
                Oscilloscope Trace (Purple: V_m, Cyan: g_Na, Amber: g_K)
              </span>
              <span style="font-size: 0.72rem; color: #c084fc; font-family: var(--font-mono);">
                Sweep (ms)
              </span>
            </div>
            <div style="position: relative; flex: 1; min-height: 180px;">
              <canvas id="neuro-chart-canvas" width="460" height="180" style="width: 100%; height: 180px; display: block; border-radius: 6px;"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Assessment Checkpoint Container -->
      <div id="actionpotential-checkpoint-container" style="margin-top: 24px;"></div>
    </div>
  `;

  const canvas = container.querySelector("#neuro-canvas");
  const ctx = canvas.getContext("2d");
  const chartCanvas = container.querySelector("#neuro-chart-canvas");
  const chartCtx = chartCanvas.getContext("2d");

  // Hodgkin-Huxley Step Functions
  function alphaM(v) { return 0.1 * (v + 40.0) / (1.0 - Math.exp(-(v + 40.0) / 10.0)); }
  function betaM(v) { return 4.0 * Math.exp(-(v + 65.0) / 18.0); }
  function alphaH(v) { return 0.07 * Math.exp(-(v + 65.0) / 20.0); }
  function betaH(v) { return 1.0 / (1.0 + Math.exp(-(v + 35.0) / 10.0)); }
  function alphaN(v) { return 0.01 * (v + 55.0) / (1.0 - Math.exp(-(v + 55.0) / 10.0)); }
  function betaN(v) { return 0.125 * Math.exp(-(v + 65.0) / 80.0); }

  function stepNeuron() {
    const dt = 0.05; // ms
    simTimeMs += dt;

    const toxin = TOXINS[activeToxinKey];
    let iApp = 0.0;
    if (isStimulating) {
      iApp = stimCurrent;
      stimTimer -= dt;
      if (stimTimer <= 0) isStimulating = false;
    }

    // HH Gating updates
    const aM = alphaM(vm); const bM = betaM(vm);
    const aH = alphaH(vm); const bH = betaH(vm);
    const aN = alphaN(vm); const bN = betaN(vm);

    mGate += (aM * (1.0 - mGate) - bM * mGate) * dt;
    hGate += (aH * (1.0 - hGate) - bH * hGate) * dt;
    nGate += (aN * (1.0 - nGate) - bN * nGate) * dt;

    // Conductances
    const maxGNa = 120.0 * (1.0 - toxin.blockNa);
    const maxGK = 36.0 * (1.0 - toxin.blockK);

    const gNa = maxGNa * Math.pow(mGate, 3) * hGate;
    const gK = maxGK * Math.pow(nGate, 4);

    // Currents
    const iNa = gNa * (vm - E_NA);
    const iK = gK * (vm - E_K);
    const iLeak = G_LEAK * (vm - E_LEAK);

    // dVm/dt = (I_app - I_Na - I_K - I_leak) / C_m
    const dVm = (iApp - iNa - iK - iLeak) * dt;
    vm += dVm;

    // Buffer for oscilloscope
    oscilloscopeTrace.push({ t: simTimeMs, vm, gNa, gK });
    if (oscilloscopeTrace.length > 250) oscilloscopeTrace.shift();

    // HUD Update
    const hudVm = container.querySelector("#hud-neuro-vm");
    const hudPhase = container.querySelector("#hud-neuro-phase");
    if (hudVm) hudVm.innerText = `${vm.toFixed(1)} mV`;
    if (hudPhase) {
      if (vm > 20.0) hudPhase.innerText = "Peak Overshoot (+35 mV)";
      else if (vm > -55.0 && dVm > 0.5) hudPhase.innerText = "Rapid Depolarization (Na⁺ Influx)";
      else if (vm > -60.0 && dVm < -0.5) hudPhase.innerText = "Repolarization (K⁺ Efflux)";
      else if (vm < -72.0) hudPhase.innerText = "Hyperpolarization / Refractory";
      else hudPhase.innerText = "Resting Potential (-70 mV)";
    }
  }

  function drawNeuronMembrane() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Extracellular fluid top (dark blue)
    ctx.fillStyle = "rgba(14, 165, 233, 0.08)";
    ctx.fillRect(0, 0, canvas.width, 210);

    // Intracellular cytoplasm bottom (dark purple)
    ctx.fillStyle = "rgba(168, 85, 247, 0.08)";
    ctx.fillRect(0, 310, canvas.width, 220);

    // Labels
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 11px system-ui";
    ctx.fillText("EXTRACELLULAR FLUID (High Na⁺, Low K⁺)", 20, 35);

    ctx.fillStyle = "#c084fc";
    ctx.fillText("INTRACELLULAR AXOPLASM (High K⁺, Low Na⁺)", 20, 500);

    // Phospholipid Bilayer
    const memY1 = 210;
    const memY2 = 310;

    // Outer leaflet heads
    ctx.fillStyle = "#64748b";
    for (let x = 10; x < canvas.width; x += 14) {
      ctx.beginPath();
      ctx.arc(x, memY1, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, memY2, 5, 0, Math.PI * 2);
      ctx.fill();

      // Hydrophobic fatty acid tails
      ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, memY1 + 5);
      ctx.lineTo(x + (Math.sin(x) * 2), memY1 + 35);
      ctx.moveTo(x, memY2 - 5);
      ctx.lineTo(x + (Math.cos(x) * 2), memY2 - 35);
      ctx.stroke();
    }

    // Voltage-Gated Na+ Channel (Center-Left)
    const naChanX = 180;
    const isOpenNa = mGate > 0.4 && hGate > 0.2;
    ctx.fillStyle = isOpenNa ? "#06b6d4" : "#1e293b";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(naChanX - 25, memY1 - 10, 50, 120, 8);
    ctx.fill();
    ctx.stroke();

    // Pore Channel Pore
    ctx.fillStyle = isOpenNa ? "rgba(6, 182, 212, 0.4)" : "#0f172a";
    ctx.fillRect(naChanX - 6, memY1 - 5, 12, 110);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Na⁺ Channel", naChanX, memY1 + 55);
    ctx.font = "9px system-ui";
    ctx.fillText(isOpenNa ? "OPEN" : "CLOSED", naChanX, memY1 + 70);

    // Voltage-Gated K+ Channel (Center-Right)
    const kChanX = 400;
    const isOpenK = nGate > 0.5;
    ctx.fillStyle = isOpenK ? "#a855f7" : "#1e293b";
    ctx.strokeStyle = "#c084fc";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(kChanX - 25, memY1 - 10, 50, 120, 8);
    ctx.fill();
    ctx.stroke();

    // Pore
    ctx.fillStyle = isOpenK ? "rgba(168, 85, 247, 0.4)" : "#0f172a";
    ctx.fillRect(kChanX - 6, memY1 - 5, 12, 110);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px system-ui";
    ctx.fillText("K⁺ Channel", kChanX, memY1 + 55);
    ctx.font = "9px system-ui";
    ctx.fillText(isOpenK ? "OPEN" : "CLOSED", kChanX, memY1 + 70);

    // Ions floating around
    // Na+ (Cyan)
    for (let i = 0; i < 24; i++) {
      const ix = (i * 24 + simTimeMs * 10) % canvas.width;
      const iy = 60 + (i * 17) % 130;
      ctx.beginPath();
      ctx.arc(ix, iy, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#38bdf8";
      ctx.fill();
    }

    // K+ (Purple)
    for (let i = 0; i < 24; i++) {
      const ix = (i * 24 + simTimeMs * 8) % canvas.width;
      const iy = 340 + (i * 19) % 130;
      ctx.beginPath();
      ctx.arc(ix, iy, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#c084fc";
      ctx.fill();
    }
  }

  function drawOscilloscope() {
    chartCtx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);

    // Background
    chartCtx.fillStyle = "#030712";
    chartCtx.fillRect(0, 0, chartCanvas.width, chartCanvas.height);
    chartCtx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    chartCtx.lineWidth = 1;

    for (let x = 40; x < chartCanvas.width; x += 40) {
      chartCtx.beginPath();
      chartCtx.moveTo(x, 10);
      chartCtx.lineTo(x, chartCanvas.height - 25);
      chartCtx.stroke();
    }
    for (let y = 15; y < chartCanvas.height - 25; y += 30) {
      chartCtx.beginPath();
      chartCtx.moveTo(40, y);
      chartCtx.lineTo(chartCanvas.width - 15, y);
      chartCtx.stroke();
    }

    // Axes
    chartCtx.strokeStyle = "#475569";
    chartCtx.lineWidth = 1.5;
    chartCtx.beginPath();
    chartCtx.moveTo(40, 10);
    chartCtx.lineTo(40, chartCanvas.height - 25);
    chartCtx.lineTo(chartCanvas.width - 15, chartCanvas.height - 25);
    chartCtx.stroke();

    // Scale Labels
    chartCtx.fillStyle = "#94a3b8";
    chartCtx.font = "9px var(--font-mono, monospace)";
    chartCtx.textAlign = "right";
    chartCtx.fillText("+40mV", 36, 25);
    chartCtx.fillText("0mV", 36, 68);
    chartCtx.fillText("-70mV", 36, 138);

    // Threshold dashed line (-55 mV)
    const yThresh = 150 - ((-55 + 80) / 120) * 125;
    chartCtx.strokeStyle = "rgba(244, 63, 94, 0.5)";
    chartCtx.setLineDash([4, 4]);
    chartCtx.beginPath();
    chartCtx.moveTo(40, yThresh);
    chartCtx.lineTo(chartCanvas.width - 15, yThresh);
    chartCtx.stroke();
    chartCtx.setLineDash([]);

    // Draw Vm Trace (Purple)
    if (oscilloscopeTrace.length > 1) {
      chartCtx.strokeStyle = "#c084fc";
      chartCtx.lineWidth = 2.4;
      chartCtx.beginPath();

      oscilloscopeTrace.forEach((pt, idx) => {
        const px = 40 + (idx / (oscilloscopeTrace.length - 1)) * (chartCanvas.width - 55);
        // Map Vm (-90 to +50) to y (155 to 20)
        const py = 150 - ((pt.vm + 80) / 130) * 125;
        if (idx === 0) chartCtx.moveTo(px, py);
        else chartCtx.lineTo(px, py);
      });
      chartCtx.stroke();
    }
  }

  let lastFrameTime = 0;
  let needsRedraw = true;

  function loop(now) {
    if (!isRunning) return;
    if (!container || !container.isConnected) {
      isRunning = false;
      if (animId) cancelAnimationFrame(animId);
      return;
    }

    const isSmart = (document.documentElement.getAttribute("data-mode") === "smartboard") ||
                    document.documentElement.classList.contains("fast-smartboard-mode") ||
                    /Android|MAXHUB/i.test(navigator.userAgent);
    const interval = isSmart ? 33.3 : 16.0;

    const neuroPhotoOverlay = container.querySelector("#neuro-photo-overlay");
    const isPhotoOverlay = neuroPhotoOverlay && neuroPhotoOverlay.style.display === "block";

    if (!isPhotoOverlay) {
      if (!now || now - lastFrameTime >= interval) {
        lastFrameTime = now || performance.now();
        stepNeuron();
        drawNeuronMembrane();
        drawOscilloscope();
      }
    }

    animId = requestAnimationFrame(loop);
  }

  // Event Listeners
  container.querySelector("#btn-neuro-stim")?.addEventListener("click", () => {
    isStimulating = true;
    stimTimer = stimDuration;
    needsRedraw = true;
    SoundFX.playScorePip();
  });

  container.querySelector("#btn-neuro-reset")?.addEventListener("click", () => {
    vm = -70.0;
    mGate = 0.05;
    hGate = 0.60;
    nGate = 0.32;
    oscilloscopeTrace.length = 0;
    simTimeMs = 0.0;
    needsRedraw = true;
    SoundFX.playClick();
  });

  container.querySelector("#select-neuro-toxin")?.addEventListener("change", (e) => {
    activeToxinKey = e.target.value;
    needsRedraw = true;
    SoundFX.playClick();
  });

  container.querySelector("#slider-neuro-stim")?.addEventListener("input", (e) => {
    stimCurrent = parseFloat(e.target.value);
    container.querySelector("#lbl-neuro-stim").innerText = `${stimCurrent.toFixed(1)} μA/cm²`;
    needsRedraw = true;
  });

  container.querySelector("#btn-neuro-export")?.addEventListener("click", () => {
    exportLabDataCsv({
      title: "Action Potential Electrophysiology Telemetry",
      labId: "actionpotential",
      parameters: {
        "Perfusion Toxin": TOXINS[activeToxinKey].name,
        "Stimulus Current (μA/cm²)": stimCurrent,
        "Stimulus Duration (ms)": stimDuration
      },
      headers: ["Sample #", "Time (ms)", "Membrane Voltage Vm (mV)", "g_Na (mS/cm²)", "g_K (mS/cm²)"],
      dataRows: oscilloscopeTrace.map((pt, idx) => [
        idx + 1,
        pt.t.toFixed(2),
        pt.vm.toFixed(2),
        pt.gNa.toFixed(2),
        pt.gK.toFixed(2)
      ])
    });
  });

  // 4K Photo View Switcher
  const btnNeuroSim = container.querySelector("#view-mode-neuro-sim");
  const btnNeuroPhoto = container.querySelector("#view-mode-neuro-photo");
  const neuroPhotoOverlay = container.querySelector("#neuro-photo-overlay");

  btnNeuroSim?.addEventListener("click", () => {
    btnNeuroSim.classList.add("active");
    btnNeuroSim.style.background = "";
    btnNeuroPhoto.classList.remove("active");
    btnNeuroPhoto.style.background = "transparent";
    if (neuroPhotoOverlay) neuroPhotoOverlay.style.display = "none";
    SoundFX.playClick();
  });

  btnNeuroPhoto?.addEventListener("click", () => {
    btnNeuroPhoto.classList.add("active");
    btnNeuroPhoto.style.background = "";
    btnNeuroSim.classList.remove("active");
    btnNeuroSim.style.background = "transparent";
    if (neuroPhotoOverlay) neuroPhotoOverlay.style.display = "block";
    SoundFX.playClick();
  });

  // Mount Assessment
  mountLabCheckpoint("actionpotential-checkpoint-container", "actionpotential");

  // Launch
  loop();

  return () => {
    isRunning = false;
    if (animId) cancelAnimationFrame(animId);
  };
}
