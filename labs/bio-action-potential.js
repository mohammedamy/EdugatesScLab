// Edugates-ClipSAT Science Labs - Biology: Neurobiology & Action Potential Patch Clamp Suite
// 60 FPS Precision Electrophysiology Simulation:
// Hodgkin-Huxley & GHK Membrane Voltage Vm, Voltage-Gated Na+/K+ Channel Kinetics,
// Fluid Mosaic Phospholipid Bilayer with Polar Inversion, Ball-and-Chain Inactivation,
// Ion Influx/Efflux Streams, Neurotoxins (TTX & TEA), and Dual-Trace Oscilloscope.

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
  let timeTick = 0;

  // Ion Particle System
  const naIons = [];
  const kIons = [];
  for (let i = 0; i < 40; i++) {
    naIons.push({
      x: Math.random() * 580,
      y: 40 + Math.random() * 140, // Extracellular
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      isTransiting: false
    });
    kIons.push({
      x: Math.random() * 580,
      y: 330 + Math.random() * 150, // Intracellular
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      isTransiting: false
    });
  }

  // Trace Buffer for Oscilloscope
  const oscilloscopeTrace = []; // { t, vm, gNa, gK }

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #a855f7; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #a855f7; box-shadow: 0 0 10px #a855f7;"></span>
            Neurobiology &amp; Action Potential Patch Clamp
          </span>
          <span class="badge" style="background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.3); color: #c084fc; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            ${renderLatex("V_m = -70\\text{ mV} \\rightarrow +35\\text{ mV} \\quad \\bullet \\quad g_{\\text{Na}} = \\bar{g}_{\\text{Na}}m^3h \\quad g_\\text{K} = \\bar{g}_\\text{K}n^4")}
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-neuro-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Patch Simulator
            </button>
            <button id="view-mode-neuro-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Rig
            </button>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-neuro-stim" style="padding: 5px 14px; font-size: 0.78rem; background: linear-gradient(135deg, #a855f7, #7e22ce); border: none; font-weight: 700; box-shadow: 0 4px 12px rgba(168, 85, 247, 0.35);">
            ⚡ Inject Stimulus Current
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-neuro-reset" style="padding: 5px 12px; font-size: 0.78rem;">
            ⟲ Clear Trace
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-neuro-export" title="Export experimental telemetry to RFC-4180 CSV (Hotkey: E)" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export CSV (E)
          </button>
        </div>
      </div>

      <!-- Main Layout -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="neuro-layout">
        <!-- Canvas Viewport: Axon Lipid Bilayer & Channel Conformation -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(168, 85, 247, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #17113a 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="neuro-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
          <div id="neuro-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <picture>
              <source srcset="assets/labs/action_potential_bench.webp" type="image/webp">
              <img src="assets/labs/action_potential_bench.jpg" decoding="async" loading="lazy" alt="4K Patch-Clamp Electrophysiology Rig" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            </picture>
            
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
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto; box-shadow: 0 6px 18px rgba(0,0,0,0.6);">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase; display: flex; align-items: center; gap: 6px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #c084fc; display: inline-block; box-shadow: 0 0 6px #c084fc;"></span>
                MEMBRANE VOLTAGE V_m
              </div>
              <div id="hud-neuro-vm" style="font-size: 1.3rem; font-weight: 800; color: #c084fc; font-family: var(--font-mono);">
                -70.0 mV
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto; box-shadow: 0 6px 18px rgba(0,0,0,0.6);">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase; display: flex; align-items: center; justify-content: flex-end; gap: 6px;">
                MEMBRANE PHASE
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #38bdf8; display: inline-block; box-shadow: 0 0 6px #38bdf8;"></span>
              </div>
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

  // HiDPI / Retina Canvas Setup
  const logicalW = 580;
  const logicalH = 530;
  const chartLogicalW = 460;
  const chartLogicalH = 180;
  let needsRedraw = true;

  function setupHiDPICanvas() {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (typeof window.getOptimizedDPR === "function" ? window.getOptimizedDPR() : (window.devicePixelRatio || 1));
    const rect = canvas.getBoundingClientRect();
    const w = rect.width > 0 ? rect.width : logicalW;
    const h = rect.height > 0 ? rect.height : logicalH;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.resetTransform();
    ctx.scale(dpr * (w / logicalW), dpr * (h / logicalH));

    const chartRect = chartCanvas.getBoundingClientRect();
    const cw = chartRect.width > 0 ? chartRect.width : chartLogicalW;
    const ch = chartRect.height > 0 ? chartRect.height : chartLogicalH;
    chartCanvas.width = Math.round(cw * dpr);
    chartCanvas.height = Math.round(ch * dpr);
    chartCtx.resetTransform();
    chartCtx.scale(dpr * (cw / chartLogicalW), dpr * (ch / chartLogicalH));

    needsRedraw = true;
  }
  setupHiDPICanvas();
  window.addEventListener("resize", setupHiDPICanvas);

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
      else if (vm > -55.0 && dVm > 0) hudPhase.innerText = "Depolarization Phase";
      else if (vm > -70.0 && dVm < 0) hudPhase.innerText = "Repolarization Phase";
      else if (vm < -70.5) hudPhase.innerText = "Hyperpolarization Afterpotential";
      else hudPhase.innerText = "Resting State (-70 mV)";
    }
  }

  // Draw High-Fidelity Axon Membrane & Gated Channel Proteins
  function drawNeuronMembrane() {
    ctx.clearRect(0, 0, logicalW, logicalH);
    timeTick += 0.03;

    // Extracellular fluid tint (Top)
    const extraGrad = ctx.createLinearGradient(0, 0, 0, 200);
    extraGrad.addColorStop(0, "rgba(56, 189, 248, 0.08)");
    extraGrad.addColorStop(1, "rgba(56, 189, 248, 0.02)");
    ctx.fillStyle = extraGrad;
    ctx.fillRect(0, 0, logicalW, 200);

    // Intracellular axoplasm tint (Bottom)
    const intraGrad = ctx.createLinearGradient(0, 320, 0, logicalH);
    intraGrad.addColorStop(0, "rgba(168, 85, 247, 0.02)");
    intraGrad.addColorStop(1, "rgba(168, 85, 247, 0.08)");
    ctx.fillStyle = intraGrad;
    ctx.fillRect(0, 320, logicalW, logicalH - 320);

    // Section Labels
    ctx.save();
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.fillText("EXTRACELLULAR FLUID (High Na⁺, Low K⁺)", 20, 35);

    ctx.fillStyle = "#c084fc";
    ctx.fillText("INTRACELLULAR AXOPLASM (High K⁺, Low Na⁺)", 20, 500);
    ctx.restore();

    // Phospholipid Bilayer Geometry
    const memY1 = 210;
    const memY2 = 310;
    const isDepolarized = vm > 0;

    // Outer & Inner Membrane Surface Potential Signs (+ / - charges)
    ctx.save();
    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    for (let cx = 15; cx < logicalW; cx += 28) {
      // Extracellular charge
      ctx.fillStyle = isDepolarized ? "#ef4444" : "#38bdf8";
      ctx.fillText(isDepolarized ? "−" : "+", cx, memY1 - 12);

      // Intracellular charge
      ctx.fillStyle = isDepolarized ? "#38bdf8" : "#ef4444";
      ctx.fillText(isDepolarized ? "+" : "−", cx, memY2 + 20);
    }
    ctx.restore();

    // Phospholipid heads and tails
    ctx.save();
    for (let x = 8; x < logicalW; x += 14) {
      // Exclude channel zones
      if ((x > 145 && x < 215) || (x > 365 && x < 435)) continue;

      const lipidWobble = Math.sin(timeTick * 4 + x * 0.1) * 1.5;

      // Outer leaflet head
      const headGrad1 = ctx.createRadialGradient(x - 1, memY1 - 1, 1, x, memY1, 5.5);
      headGrad1.addColorStop(0, "#cbd5e1");
      headGrad1.addColorStop(0.5, "#64748b");
      headGrad1.addColorStop(1, "#334155");
      ctx.fillStyle = headGrad1;
      ctx.beginPath();
      ctx.arc(x, memY1, 5.5, 0, Math.PI * 2);
      ctx.fill();

      // Inner leaflet head
      const headGrad2 = ctx.createRadialGradient(x - 1, memY2 - 1, 1, x, memY2, 5.5);
      headGrad2.addColorStop(0, "#cbd5e1");
      headGrad2.addColorStop(0.5, "#64748b");
      headGrad2.addColorStop(1, "#334155");
      ctx.fillStyle = headGrad2;
      ctx.beginPath();
      ctx.arc(x, memY2, 5.5, 0, Math.PI * 2);
      ctx.fill();

      // Hydrophobic fatty acid hydrocarbon tails
      ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
      ctx.lineWidth = 1.5;

      // Top tails
      ctx.beginPath();
      ctx.moveTo(x - 2, memY1 + 5);
      ctx.lineTo(x - 2 + lipidWobble, memY1 + 38);
      ctx.moveTo(x + 2, memY1 + 5);
      ctx.lineTo(x + 2 - lipidWobble, memY1 + 38);
      // Bottom tails
      ctx.moveTo(x - 2, memY2 - 5);
      ctx.lineTo(x - 2 + lipidWobble, memY2 - 38);
      ctx.moveTo(x + 2, memY2 - 5);
      ctx.lineTo(x + 2 - lipidWobble, memY2 - 38);
      ctx.stroke();
    }
    ctx.restore();

    // 1. Voltage-Gated Na+ Channel (Center-Left)
    const naChanX = 180;
    const isOpenNa = mGate > 0.4 && hGate > 0.2;
    const isBlockedTTX = activeToxinKey === "ttx";

    ctx.save();
    // Drop shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.beginPath();
    ctx.roundRect(naChanX - 28, memY1 - 12, 56, 126, 8);
    ctx.fill();

    // Protein Subunit Body
    const naBodyGrad = ctx.createLinearGradient(naChanX - 26, memY1, naChanX + 26, memY2);
    if (isOpenNa && !isBlockedTTX) {
      naBodyGrad.addColorStop(0, "#0284c7");
      naBodyGrad.addColorStop(0.5, "#06b6d4");
      naBodyGrad.addColorStop(1, "#0369a1");
    } else {
      naBodyGrad.addColorStop(0, "#1e293b");
      naBodyGrad.addColorStop(0.5, "#0f172a");
      naBodyGrad.addColorStop(1, "#020617");
    }

    ctx.fillStyle = naBodyGrad;
    ctx.strokeStyle = isOpenNa ? "#38bdf8" : "#475569";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.roundRect(naChanX - 26, memY1 - 10, 52, 122, 8);
    ctx.fill();
    ctx.stroke();

    // Central Pore Aperture
    const naPoreWidth = (isOpenNa && !isBlockedTTX) ? 14 : 3;
    ctx.fillStyle = (isOpenNa && !isBlockedTTX) ? "rgba(56, 189, 248, 0.45)" : "#020617";
    ctx.fillRect(naChanX - naPoreWidth / 2, memY1 - 8, naPoreWidth, 118);

    // Ball-and-Chain Inactivation Gate (h-gate)
    const ballX = naChanX + (hGate < 0.3 ? 0 : 22);
    const ballY = memY2 + (hGate < 0.3 ? 8 : 24);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(naChanX + 16, memY2 + 2);
    ctx.quadraticCurveTo(naChanX + 24, memY2 + 15, ballX, ballY);
    ctx.stroke();

    ctx.fillStyle = hGate < 0.3 ? "#ef4444" : "#f59e0b";
    ctx.beginPath();
    ctx.arc(ballX, ballY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.stroke();

    // TTX Toxin Block Plug on Na+ Channel Mouth
    if (isBlockedTTX) {
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(naChanX, memY1 - 12, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 8px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText("TTX", naChanX, memY1 - 9);
    }

    // Na+ Channel Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Na⁺ Channel", naChanX, memY1 + 50);
    ctx.fillStyle = isOpenNa && !isBlockedTTX ? "#34d399" : (isBlockedTTX ? "#ef4444" : "#94a3b8");
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    ctx.fillText(isBlockedTTX ? "TTX BLOCKED" : (isOpenNa ? "OPEN (INFLUX)" : "CLOSED"), naChanX, memY1 + 65);
    ctx.restore();

    // 2. Voltage-Gated K+ Channel (Center-Right)
    const kChanX = 400;
    const isOpenK = nGate > 0.5;
    const isBlockedTEA = activeToxinKey === "tea";

    ctx.save();
    // Drop shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.beginPath();
    ctx.roundRect(kChanX - 28, memY1 - 12, 56, 126, 8);
    ctx.fill();

    // Protein Body
    const kBodyGrad = ctx.createLinearGradient(kChanX - 26, memY1, kChanX + 26, memY2);
    if (isOpenK && !isBlockedTEA) {
      kBodyGrad.addColorStop(0, "#7e22ce");
      kBodyGrad.addColorStop(0.5, "#a855f7");
      kBodyGrad.addColorStop(1, "#581c87");
    } else {
      kBodyGrad.addColorStop(0, "#1e293b");
      kBodyGrad.addColorStop(0.5, "#0f172a");
      kBodyGrad.addColorStop(1, "#020617");
    }

    ctx.fillStyle = kBodyGrad;
    ctx.strokeStyle = isOpenK ? "#c084fc" : "#475569";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.roundRect(kChanX - 26, memY1 - 10, 52, 122, 8);
    ctx.fill();
    ctx.stroke();

    // K+ Central Pore Aperture
    const kPoreWidth = (isOpenK && !isBlockedTEA) ? 14 : 3;
    ctx.fillStyle = (isOpenK && !isBlockedTEA) ? "rgba(168, 85, 247, 0.45)" : "#020617";
    ctx.fillRect(kChanX - kPoreWidth / 2, memY1 - 8, kPoreWidth, 118);

    // TEA Toxin Block Plug
    if (isBlockedTEA) {
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(kChanX, memY2 + 10, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 8px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText("TEA", kChanX, memY2 + 13);
    }

    // K+ Channel Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("K⁺ Channel", kChanX, memY1 + 50);
    ctx.fillStyle = isOpenK && !isBlockedTEA ? "#34d399" : (isBlockedTEA ? "#f59e0b" : "#94a3b8");
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    ctx.fillText(isBlockedTEA ? "TEA BLOCKED" : (isOpenK ? "OPEN (EFFLUX)" : "CLOSED"), kChanX, memY1 + 65);
    ctx.restore();

    // 3. Dynamic Ion Influx & Efflux Streams
    ctx.save();
    // Na+ Ions (Cyan)
    naIons.forEach(ion => {
      // Brownian motion
      ion.x += ion.vx;
      ion.y += ion.vy;
      if (ion.x < 10) ion.x = logicalW - 10;
      if (ion.x > logicalW - 10) ion.x = 10;
      if (ion.y < 30) ion.vy = Math.abs(ion.vy);
      if (ion.y > memY1 - 12 && !ion.isTransiting) ion.vy = -Math.abs(ion.vy);

      // Influx through open Na+ channel
      if (isOpenNa && !isBlockedTTX && Math.abs(ion.x - naChanX) < 18 && ion.y < memY1) {
        ion.isTransiting = true;
      }
      if (ion.isTransiting) {
        ion.x += (naChanX - ion.x) * 0.15;
        ion.y += 3.2; // Move downward into axoplasm
        if (ion.y > memY2 + 25) {
          ion.isTransiting = false;
          ion.y = memY2 + 35 + Math.random() * 80;
        }
      }

      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(ion.x, ion.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Ion charge label
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 6px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("+", ion.x, ion.y);
    });

    // K+ Ions (Purple)
    kIons.forEach(ion => {
      ion.x += ion.vx;
      ion.y += ion.vy;
      if (ion.x < 10) ion.x = logicalW - 10;
      if (ion.x > logicalW - 10) ion.x = 10;
      if (ion.y > logicalH - 30) ion.vy = -Math.abs(ion.vy);
      if (ion.y < memY2 + 12 && !ion.isTransiting) ion.vy = Math.abs(ion.vy);

      // Efflux through open K+ channel
      if (isOpenK && !isBlockedTEA && Math.abs(ion.x - kChanX) < 18 && ion.y > memY2) {
        ion.isTransiting = true;
      }
      if (ion.isTransiting) {
        ion.x += (kChanX - ion.x) * 0.15;
        ion.y -= 3.2; // Move upward out of axoplasm
        if (ion.y < memY1 - 25) {
          ion.isTransiting = false;
          ion.y = memY1 - 35 - Math.random() * 80;
        }
      }

      ctx.fillStyle = "#c084fc";
      ctx.beginPath();
      ctx.arc(ion.x, ion.y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 6px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("+", ion.x, ion.y);
    });
    ctx.restore();
  }

  function drawOscilloscope() {
    chartCtx.clearRect(0, 0, chartLogicalW, chartLogicalH);

    // Phosphor Grid Background
    chartCtx.fillStyle = "#030712";
    chartCtx.fillRect(0, 0, chartLogicalW, chartLogicalH);
    chartCtx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    chartCtx.lineWidth = 1;

    for (let x = 40; x < chartLogicalW; x += 40) {
      chartCtx.beginPath();
      chartCtx.moveTo(x, 10);
      chartCtx.lineTo(x, chartLogicalH - 25);
      chartCtx.stroke();
    }
    for (let y = 15; y < chartLogicalH - 25; y += 30) {
      chartCtx.beginPath();
      chartCtx.moveTo(40, y);
      chartCtx.lineTo(chartLogicalW - 15, y);
      chartCtx.stroke();
    }

    // Axes
    chartCtx.strokeStyle = "#475569";
    chartCtx.lineWidth = 1.5;
    chartCtx.beginPath();
    chartCtx.moveTo(40, 10);
    chartCtx.lineTo(40, chartLogicalH - 25);
    chartCtx.lineTo(chartLogicalW - 15, chartLogicalH - 25);
    chartCtx.stroke();

    // Scale Labels
    chartCtx.fillStyle = "#94a3b8";
    chartCtx.font = "9px 'JetBrains Mono', monospace";
    chartCtx.textAlign = "right";
    chartCtx.fillText("+40mV", 36, 25);
    chartCtx.fillText("0mV", 36, 68);
    chartCtx.fillText("-70mV", 36, 138);

    // Threshold dashed line (-55 mV)
    const yThresh = 150 - ((-55 + 80) / 120) * 125;
    chartCtx.strokeStyle = "rgba(244, 63, 94, 0.6)";
    chartCtx.setLineDash([4, 4]);
    chartCtx.beginPath();
    chartCtx.moveTo(40, yThresh);
    chartCtx.lineTo(chartLogicalW - 15, yThresh);
    chartCtx.stroke();
    chartCtx.setLineDash([]);

    // Draw Vm Trace (Purple Glow)
    if (oscilloscopeTrace.length > 1) {
      chartCtx.strokeStyle = "#c084fc";
      chartCtx.lineWidth = 2.4;
      chartCtx.beginPath();

      oscilloscopeTrace.forEach((pt, idx) => {
        const px = 40 + (idx / (oscilloscopeTrace.length - 1)) * (chartLogicalW - 55);
        // Map Vm (-90 to +50) to y (155 to 20)
        const py = 150 - ((pt.vm + 80) / 130) * 125;
        if (idx === 0) chartCtx.moveTo(px, py);
        else chartCtx.lineTo(px, py);
      });
      chartCtx.stroke();
    }
  }

  let lastFrameTime = 0;

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

  // Standardized Hotkey: 'e' or 'E' triggers CSV telemetry export
  const handleKeyDown = (e) => {
    if ((e.key === "e" || e.key === "E") && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      container.querySelector("#btn-neuro-export")?.click();
    }
  };
  window.addEventListener("keydown", handleKeyDown);

  // Mount Assessment
  mountLabCheckpoint("actionpotential-checkpoint-container", "actionpotential");

  // Launch
  loop();

  return () => {
    isRunning = false;
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("resize", setupHiDPICanvas);
    window.removeEventListener("keydown", handleKeyDown);
  };
}
