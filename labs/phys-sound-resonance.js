// Edugates-ClipSAT Science Labs - Physics: Speed of Sound & Resonance Tube Suite
// 60 FPS Precision Acoustic Wave Simulation:
// Speed of Sound in Air v(T) = 331.3·√(1 + T/273.15) m/s,
// Closed-Open Resonance Cavity Harmonics L_n = (2n-1)·λ/4 - c, End Correction c = 0.61·r,
// Longitudinal Acoustic Compression & Rarefaction Particle Density Waves,
// Vibrating Tuning Fork with Spherical Acoustic Wavefronts, Web Audio API Synth Engine.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initSoundResonanceLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return () => {};

  // Standard Acoustic Tuning Fork Frequencies (Hz)
  const TUNING_FORKS = {
    c4: { name: "C₄ Middle C (261.6 Hz)", frequency: 261.63, note: "C4" },
    d4: { name: "D₄ (293.7 Hz)", frequency: 293.66, note: "D4" },
    e4: { name: "E₄ (329.6 Hz)", frequency: 329.63, note: "E4" },
    f4: { name: "F₄ (349.2 Hz)", frequency: 349.23, note: "F4" },
    g4: { name: "G₄ (392.0 Hz)", frequency: 392.00, note: "G4" },
    a4: { name: "A₄ Concert Pitch (440.0 Hz)", frequency: 440.00, note: "A4" },
    b4: { name: "B₄ (493.9 Hz)", frequency: 493.88, note: "B4" },
    c5: { name: "C₅ Treble C (523.3 Hz)", frequency: 523.25, note: "C5" }
  };

  // State Variables
  let currentForkKey = "a4"; // 440 Hz
  let waterLevelCm = 45.0; // cm (Reservoir height, 0 to 95 cm)
  let airTempC = 20.0; // degrees Celsius (-10 to 45 °C)
  let tubeRadiusCm = 2.0; // cm (4.0 cm bore diameter)
  let endCorrectionCm = 0.61 * tubeRadiusCm; // c = 0.61 · r ≈ 1.22 cm
  let isSoundActive = false;
  let viewMode = "sim"; // "sim" or "photo"
  let animId = null;
  let timeTick = 0;

  // Web Audio Context & Oscillator Nodes
  let audioCtx = null;
  let oscNode = null;
  let gainNode = null;

  // Longitudinal Acoustic Air Molecule Particles
  const airMolecules = [];
  const NUM_MOLECULES = 120;
  for (let i = 0; i < NUM_MOLECULES; i++) {
    airMolecules.push({
      yFrac: Math.random(), // 0 (top mouth) to 1 (water surface)
      xOffset: -16 + Math.random() * 32,
      baseSize: 1.2 + Math.random() * 1.0,
      phase: Math.random() * Math.PI * 2
    });
  }

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function setAudioPlayback(active) {
    if (!active) {
      if (gainNode && audioCtx) {
        gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
      }
      return;
    }

    const ctx = getAudioContext();
    if (!ctx) return;

    if (!oscNode) {
      oscNode = ctx.createOscillator();
      gainNode = ctx.createGain();

      oscNode.type = "sine";
      oscNode.frequency.setValueAtTime(TUNING_FORKS[currentForkKey].frequency, ctx.currentTime);

      gainNode.gain.setValueAtTime(0, ctx.currentTime);

      oscNode.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscNode.start();
    }

    oscNode.frequency.setValueAtTime(TUNING_FORKS[currentForkKey].frequency, ctx.currentTime);
    const ac = calculateAcoustics();
    // Loudness modulated by acoustic cavity resonance gain
    const targetGain = 0.04 + ac.resonanceGain * 0.28;
    gainNode.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.08);
  }

  // Physics Calculations: Speed of Sound & Resonant Wavelengths
  function calculateAcoustics() {
    const fork = TUNING_FORKS[currentForkKey];
    // v(T) = 331.3 · √(1 + T / 273.15)
    const speedOfSound = 331.3 * Math.sqrt(1 + airTempC / 273.15);
    const wavelengthM = speedOfSound / fork.frequency;
    const wavelengthCm = wavelengthM * 100;

    // Tube Total Length = 100 cm
    // Air Column Length L = 100 cm - waterLevelCm
    const airColumnLengthCm = 100 - waterLevelCm;

    // Theoretical resonant lengths for closed-open pipe:
    // L_n = (2n - 1)·λ/4 - c
    const resonantLengths = [
      (1 * wavelengthCm) / 4 - endCorrectionCm,
      (3 * wavelengthCm) / 4 - endCorrectionCm,
      (5 * wavelengthCm) / 4 - endCorrectionCm
    ].filter(l => l > 0 && l <= 100);

    // Calculate Resonance Gain Factor (Lorentzian acoustic Q-factor profile)
    let maxGain = 0;
    const Q = 18.0; // Cavity acoustic resonance sharpness
    resonantLengths.forEach(resL => {
      const deltaL = Math.abs(airColumnLengthCm - resL);
      const gain = 1 / (1 + Math.pow((2 * Q * deltaL) / wavelengthCm, 2));
      if (gain > maxGain) maxGain = gain;
    });

    return {
      speedOfSound,
      wavelengthCm,
      airColumnLengthCm,
      resonantLengths,
      resonanceGain: maxGain
    };
  }

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #818cf8; box-shadow: 0 0 10px #818cf8;"></span>
            Speed of Sound &amp; Acoustic Resonance Tube
          </span>
          <span class="badge" style="background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); color: #a5b4fc; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            ${renderLatex("v = f \\lambda \\quad \\bullet \\quad L_n = (2n-1)\\frac{\\lambda}{4} - c \\quad \\bullet \\quad v(T) = 331.3\\sqrt{1 + \\frac{T}{273.15}}")}
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-sound-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔊 Wave Simulator
            </button>
            <button id="view-mode-sound-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-strike-fork" style="padding: 5px 14px; font-size: 0.78rem; background: linear-gradient(135deg, #6366f1, #4f46e5); border: none; font-weight: 700; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);">
            🔔 Strike Tuning Fork
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-snap-resonance" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(99, 102, 241, 0.4); color: #a5b4fc;">
            🎯 Snap to 1st Node
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-sound-export" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export CSV (E)
          </button>
        </div>
      </div>

      <!-- Main Layout Grid -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="sound-layout">
        <!-- Canvas Viewport -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(99, 102, 241, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #12103a 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="sound-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Real Laboratory Photograph Overlay -->
          <div id="sound-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <picture>
              <source srcset="assets/labs/sound_resonance_bench.webp" type="image/webp">
              <img src="assets/labs/sound_resonance_bench.jpg" decoding="async" loading="lazy" alt="4K Research Acoustic Resonance Tube & Audio Oscilloscope Workbench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            </picture>
            
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Resonance Tube Bore</div>
                <div style="color: #818cf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">40 mm Borosilicate Glass</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Speed of Sound v(20°C)</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">343.2 m/s Standard Air</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">End Correction Factor</div>
                <div style="color: #facc15; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">c = 0.61 · r = 1.22 cm</div>
              </div>
            </div>
          </div>

          <!-- Top HUD -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto; box-shadow: 0 6px 18px rgba(0,0,0,0.6);">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase; display: flex; align-items: center; gap: 6px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #818cf8; display: inline-block; box-shadow: 0 0 6px #818cf8;"></span>
                ACOUSTIC SOUND SPEED v(T)
              </div>
              <div id="hud-sound-speed" style="font-size: 1.12rem; font-weight: 800; color: #818cf8; font-family: var(--font-mono);">
                v = 343.2 m/s (λ = 78.0 cm)
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto; box-shadow: 0 6px 18px rgba(0,0,0,0.6);">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase; display: flex; align-items: center; justify-content: flex-end; gap: 6px;">
                RESONANCE AMPLITUDE (VU)
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: inline-block; box-shadow: 0 0 6px #10b981;"></span>
              </div>
              <div id="hud-sound-gain" style="font-size: 1.12rem; font-weight: 800; color: #10b981; font-family: var(--font-mono);">
                Peak Resonance: 98% (+18 dB)
              </div>
            </div>
          </div>
        </div>

        <!-- Controls & Wave Mechanics Side -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Controls Panel -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #818cf8; text-transform: uppercase; margin-bottom: 12px;">Apparatus &amp; Thermal Parameters</div>
            
            <div style="margin-bottom: 12px;">
              <label style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Excitation Tuning Fork</label>
              <select id="select-tuning-fork" class="form-control" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                ${Object.entries(TUNING_FORKS).map(([k, f]) => `<option value="${k}" ${k === currentForkKey ? "selected" : ""}>${f.frequency} Hz • ${f.name}</option>`).join("")}
              </select>
            </div>

            <!-- Water Level Slider -->
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                <span style="color: #94a3b8;">Water Level (Reservoir Height)</span>
                <span id="lbl-water-level" style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono);">45.0 cm (Air Column L = 55.0 cm)</span>
              </div>
              <input id="slider-water-level" type="range" min="0" max="95" step="0.5" value="45.0" style="width: 100%; accent-color: #38bdf8;">
            </div>

            <!-- Air Temperature Slider -->
            <div style="margin-bottom: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                <span style="color: #94a3b8;">Air Temperature [v(T)]</span>
                <span id="lbl-sound-temp" style="color: #facc15; font-weight: 700; font-family: var(--font-mono);">20.0 °C</span>
              </div>
              <input id="slider-sound-temp" type="range" min="-10" max="45" step="1" value="20" style="width: 100%; accent-color: #facc15;">
            </div>
          </div>

          <!-- Standing Wave Diagnostics & Speed of Sound Calculation -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div style="font-size: 0.75rem; font-weight: 700; color: #10b981; text-transform: uppercase;">Harmonic Resonance Verification</div>
              <span id="badge-resonance-status" class="badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; font-size: 0.68rem; padding: 2px 8px; border-radius: 6px;">
                Resonance Matched
              </span>
            </div>
            
            <div style="background: #030712; border: 1px solid #1e293b; border-radius: 8px; padding: 12px; font-size: 0.76rem; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <span style="color: #64748b;">1st Resonance L₁ (λ/4 - c):</span>
                <strong id="val-res-l1" style="color: #f8fafc; display: block; font-family: var(--font-mono);">18.3 cm</strong>
              </div>
              <div>
                <span style="color: #64748b;">2nd Resonance L₂ (3λ/4 - c):</span>
                <strong id="val-res-l2" style="color: #f8fafc; display: block; font-family: var(--font-mono);">57.3 cm</strong>
              </div>
              <div style="grid-column: span 2; border-top: 1px dashed #334155; padding-top: 6px; margin-top: 2px;">
                <span style="color: #64748b;">Calculated Speed of Sound v = 2f·(L₂ - L₁):</span>
                <strong id="val-calc-speed" style="color: #818cf8; display: block; font-family: var(--font-mono); font-size: 0.88rem;">343.2 m/s (0.0% Error)</strong>
              </div>
            </div>

            <!-- Volume VU Meter Bar -->
            <div style="margin-top: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.74rem; margin-bottom: 4px;">
                <span style="color: #94a3b8;">Acoustic Cavity Loudness (VU)</span>
                <span id="lbl-vu-gain" style="color: #10b981; font-weight: 700; font-family: var(--font-mono);">85%</span>
              </div>
              <div style="height: 10px; background: #0f172a; border-radius: 5px; overflow: hidden; border: 1px solid #334155; position: relative;">
                <div id="bar-vu-gain" style="height: 100%; width: 85%; background: linear-gradient(90deg, #38bdf8, #10b981, #f59e0b); border-radius: 4px; transition: width 0.1s ease;"></div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Post-Lab Checkpoint Container (Full Screen Width) -->
      <div id="sound-checkpoint-container" style="margin-top: 24px; width: 100%;"></div>
    </div>
  `;

  // Attach Checkpoint
  mountLabCheckpoint("sound-checkpoint-container", "resonance");

  // DOM Elements
  const canvas = document.getElementById("sound-canvas");
  const ctx = canvas.getContext("2d");
  const selectFork = document.getElementById("select-tuning-fork");
  const sliderWater = document.getElementById("slider-water-level");
  const sliderTemp = document.getElementById("slider-sound-temp");
  const btnStrike = document.getElementById("btn-strike-fork");
  const btnSnap = document.getElementById("btn-snap-resonance");
  const btnExport = document.getElementById("btn-sound-export");
  const viewSimBtn = document.getElementById("view-mode-sound-sim");
  const viewPhotoBtn = document.getElementById("view-mode-sound-photo");
  const photoOverlay = document.getElementById("sound-photo-overlay");

  // HUD Elements
  const hudSpeed = document.getElementById("hud-sound-speed");
  const hudGain = document.getElementById("hud-sound-gain");
  const lblWater = document.getElementById("lbl-water-level");
  const lblTemp = document.getElementById("lbl-sound-temp");
  const valL1 = document.getElementById("val-res-l1");
  const valL2 = document.getElementById("val-res-l2");
  const valCalcSpeed = document.getElementById("val-calc-speed");
  const barVu = document.getElementById("bar-vu-gain");
  const lblVu = document.getElementById("lbl-vu-gain");
  const badgeRes = document.getElementById("badge-resonance-status");

  // HiDPI / Retina Canvas Setup
  const logicalW = 580;
  const logicalH = 530;

  function setupHiDPICanvas() {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (typeof window.getOptimizedDPR === "function" ? window.getOptimizedDPR() : (window.devicePixelRatio || 1));
    const rect = canvas.getBoundingClientRect();
    const w = rect.width > 0 ? rect.width : logicalW;
    const h = rect.height > 0 ? rect.height : logicalH;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.resetTransform();
    ctx.scale(dpr * (w / logicalW), dpr * (h / logicalH));
  }
  setupHiDPICanvas();
  window.addEventListener("resize", setupHiDPICanvas);

  function updateHUD() {
    const ac = calculateAcoustics();
    const fork = TUNING_FORKS[currentForkKey];

    hudSpeed.textContent = `v = ${ac.speedOfSound.toFixed(1)} m/s (λ = ${ac.wavelengthCm.toFixed(1)} cm)`;
    const gainPct = Math.round(ac.resonanceGain * 100);
    hudGain.textContent = `Resonance Intensity: ${gainPct}%`;
    hudGain.style.color = gainPct > 60 ? "#10b981" : "#818cf8";

    lblWater.textContent = `${waterLevelCm.toFixed(1)} cm (Air Column L = ${ac.airColumnLengthCm.toFixed(1)} cm)`;
    lblTemp.textContent = `${airTempC.toFixed(1)} °C`;

    const l1 = ac.resonantLengths[0] || 0;
    const l2 = ac.resonantLengths[1] || 0;
    valL1.textContent = `${l1.toFixed(1)} cm`;
    valL2.textContent = l2 > 0 ? `${l2.toFixed(1)} cm` : "Out of Tube Range";

    if (l2 > 0 && l1 > 0) {
      const expSpeed = 2 * fork.frequency * ((l2 - l1) / 100);
      const errPct = Math.abs((expSpeed - ac.speedOfSound) / ac.speedOfSound) * 100;
      valCalcSpeed.textContent = `${expSpeed.toFixed(1)} m/s (${errPct.toFixed(1)}% Error)`;
    } else {
      valCalcSpeed.textContent = `${ac.speedOfSound.toFixed(1)} m/s (Theoretical)`;
    }

    barVu.style.width = `${gainPct}%`;
    lblVu.textContent = `${gainPct}%`;

    if (gainPct > 70) {
      badgeRes.textContent = "Acoustic Resonance Peak";
      badgeRes.style.background = "rgba(16, 185, 129, 0.15)";
      badgeRes.style.color = "#10b981";
    } else {
      badgeRes.textContent = "Off Resonance";
      badgeRes.style.background = "rgba(100, 116, 139, 0.15)";
      badgeRes.style.color = "#94a3b8";
    }

    if (isSoundActive && gainNode && audioCtx) {
      const targetGain = 0.04 + ac.resonanceGain * 0.28;
      gainNode.gain.setTargetAtTime(targetGain, audioCtx.currentTime, 0.05);
    }
  }

  // 60 FPS Sound Tube Render Loop
  function renderSoundCanvas() {
    if (!container || !container.isConnected) return;
    timeTick += 0.04;

    ctx.clearRect(0, 0, logicalW, logicalH);

    const ac = calculateAcoustics();
    const fork = TUNING_FORKS[currentForkKey];

    // 1. Lab Workbench Base with Cast Iron Heavy Base
    const benchY = 460;
    ctx.save();
    const benchGrad = ctx.createLinearGradient(0, benchY, 0, logicalH);
    benchGrad.addColorStop(0, "#334155");
    benchGrad.addColorStop(0.2, "#1e293b");
    benchGrad.addColorStop(1, "#0f172a");

    ctx.fillStyle = benchGrad;
    ctx.fillRect(0, benchY, logicalW, logicalH - benchY);
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, benchY, logicalW, logicalH - benchY);

    // Beveled bench trim
    ctx.fillStyle = "#64748b";
    ctx.fillRect(0, benchY, logicalW, 3);
    ctx.restore();

    // 2. Vertical Glass Resonance Tube
    const tubeX = logicalW * 0.5 - 45;
    const tubeTopY = 110;
    const tubeH = 340; // Represents 100 cm tube (scale: 3.4 px/cm)
    const pxPerCm = tubeH / 100;
    const tubeW = 46;

    // Water level position inside tube
    const waterHeightPx = waterLevelCm * pxPerCm;
    const waterSurfaceY = (tubeTopY + tubeH) - waterHeightPx;

    // Cast-Iron Retort Stand Clamp Arm holding the tube
    ctx.save();
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.fillRect(tubeX - tubeW / 2 - 28, tubeTopY + 40, 28, 12);
    ctx.strokeRect(tubeX - tubeW / 2 - 28, tubeTopY + 40, 28, 12);
    ctx.fillRect(tubeX - tubeW / 2 - 28, tubeTopY + 240, 28, 12);
    ctx.strokeRect(tubeX - tubeW / 2 - 28, tubeTopY + 240, 28, 12);

    // Vertical Steel Stand Rod
    ctx.fillStyle = "#64748b";
    ctx.fillRect(tubeX - tubeW / 2 - 36, 60, 8, benchY - 60);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1;
    ctx.strokeRect(tubeX - tubeW / 2 - 36, 60, 8, benchY - 60);

    // Brass Knurled Thumbscrews on clamps
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(tubeX - tubeW / 2 - 20, tubeTopY + 46, 5, 0, Math.PI * 2);
    ctx.arc(tubeX - tubeW / 2 - 20, tubeTopY + 246, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Water Column Reservoir inside Tube
    ctx.save();
    // Water gradient with depth shading
    const waterGrad = ctx.createLinearGradient(tubeX - tubeW / 2, 0, tubeX + tubeW / 2, 0);
    waterGrad.addColorStop(0, "rgba(2, 132, 199, 0.45)");
    waterGrad.addColorStop(0.4, "rgba(56, 189, 248, 0.35)");
    waterGrad.addColorStop(1, "rgba(3, 105, 161, 0.55)");

    ctx.fillStyle = waterGrad;
    ctx.fillRect(tubeX - tubeW / 2 + 2, waterSurfaceY, tubeW - 4, waterHeightPx);

    // Water column surface meniscus (Elliptic displacement node)
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.ellipse(tubeX, waterSurfaceY, tubeW / 2 - 3, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Water surface specular highlight
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(tubeX, waterSurfaceY, tubeW / 2 - 5, 3.5, 0, Math.PI, Math.PI * 2);
    ctx.stroke();

    // Subtle fluid micro-bubbles in water
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    for (let b = 0; b < 6; b++) {
      const bx = tubeX - tubeW / 4 + (b * 7) % (tubeW / 2);
      const by = waterSurfaceY + 15 + ((b * 45 + timeTick * 15) % Math.max(10, waterHeightPx - 20));
      ctx.beginPath();
      ctx.arc(bx, by, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 4. Longitudinal Acoustic Compression & Rarefaction Air Molecules
    if (isSoundActive) {
      ctx.save();
      const airH = waterSurfaceY - tubeTopY;
      const waveFreq = (Math.PI * 2) / (ac.wavelengthCm * pxPerCm);
      const ampMax = 12 * ac.resonanceGain;

      // Draw Air Molecule Particles
      airMolecules.forEach(mol => {
        // y0 in equilibrium
        const y0 = tubeTopY + mol.yFrac * airH;
        const distFromWater = waterSurfaceY - y0;

        // Longitudinal displacement: 0 at water surface (Node), max at tube mouth (Antinode)
        const longitudinalDisplacement = Math.sin(distFromWater * waveFreq) * ampMax * Math.sin(timeTick * 25);
        const curY = y0 + longitudinalDisplacement;
        const curX = tubeX + mol.xOffset;

        // Density color modulation
        const isCompressed = Math.abs(longitudinalDisplacement) < 2.0;
        ctx.fillStyle = isCompressed ? "rgba(165, 180, 252, 0.85)" : "rgba(129, 140, 248, 0.45)";
        ctx.beginPath();
        ctx.arc(curX, curY, mol.baseSize, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    // 5. Standing Wave Envelope Overlay inside Air Column
    if (isSoundActive) {
      ctx.save();
      const airH = waterSurfaceY - tubeTopY;
      const waveFreq = (Math.PI * 2) / (ac.wavelengthCm * pxPerCm);
      const envelopeAmp = (tubeW / 2 - 5) * (0.35 + ac.resonanceGain * 0.65);

      // Standing wave envelope gradient
      ctx.strokeStyle = `rgba(129, 140, 248, ${0.45 + ac.resonanceGain * 0.55})`;
      ctx.lineWidth = 2.2;

      // Positive side
      ctx.beginPath();
      for (let y = tubeTopY; y <= waterSurfaceY; y += 2) {
        const distFromNode = waterSurfaceY - y;
        const amp = Math.sin(distFromNode * waveFreq) * envelopeAmp * Math.sin(timeTick * 25);
        const wx = tubeX + amp;
        if (y === tubeTopY) ctx.moveTo(wx, y);
        else ctx.lineTo(wx, y);
      }
      ctx.stroke();

      // Mirror side
      ctx.beginPath();
      for (let y = tubeTopY; y <= waterSurfaceY; y += 2) {
        const distFromNode = waterSurfaceY - y;
        const amp = -Math.sin(distFromNode * waveFreq) * envelopeAmp * Math.sin(timeTick * 25);
        const wx = tubeX + amp;
        if (y === tubeTopY) ctx.moveTo(wx, y);
        else ctx.lineTo(wx, y);
      }
      ctx.stroke();

      // Displacement Node (N) and Antinode (A) Markers
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 9px 'JetBrains Mono', monospace";
      ctx.textAlign = "right";
      ctx.fillText("NODE (N)", tubeX - tubeW / 2 - 8, waterSurfaceY + 3);

      ctx.fillStyle = "#f43f5e";
      ctx.fillText("ANTINODE (A)", tubeX - tubeW / 2 - 8, tubeTopY + 3);
      ctx.restore();
    }

    // 6. Borosilicate Glass Tube Walls & Optical Glare
    ctx.save();
    // Glass cylinder reflection
    const glassReflect = ctx.createLinearGradient(tubeX - tubeW / 2, 0, tubeX + tubeW / 2, 0);
    glassReflect.addColorStop(0, "rgba(255, 255, 255, 0.45)");
    glassReflect.addColorStop(0.15, "rgba(255, 255, 255, 0.08)");
    glassReflect.addColorStop(0.85, "rgba(255, 255, 255, 0.05)");
    glassReflect.addColorStop(1, "rgba(255, 255, 255, 0.35)");

    ctx.fillStyle = glassReflect;
    ctx.fillRect(tubeX - tubeW / 2, tubeTopY, tubeW, tubeH);

    // Glass wall outer strokes
    ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(tubeX - tubeW / 2, tubeTopY, tubeW, tubeH);

    // Graduated Centimeter Scale on Right Side
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#94a3b8";
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";

    for (let cm = 0; cm <= 100; cm += 5) {
      const my = tubeTopY + cm * pxPerCm;
      const isMajor = cm % 10 === 0;
      ctx.beginPath();
      ctx.moveTo(tubeX + tubeW / 2, my);
      ctx.lineTo(tubeX + tubeW / 2 + (isMajor ? 10 : 5), my);
      ctx.stroke();
      if (isMajor) {
        ctx.fillText(`${cm}`, tubeX + tubeW / 2 + 14, my + 3);
      }
    }

    // Mark Theoretical Resonance Positions (L₁, L₂, L₃)
    ac.resonantLengths.forEach((resL, idx) => {
      const resY = tubeTopY + resL * pxPerCm;
      if (resY <= tubeTopY + tubeH) {
        ctx.fillStyle = "#f43f5e";
        ctx.beginPath();
        ctx.arc(tubeX - tubeW / 2 - 8, resY, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "#f87171";
        ctx.font = "bold 9px 'JetBrains Mono', monospace";
        ctx.textAlign = "right";
        ctx.fillText(`L${idx + 1}=${resL.toFixed(1)}cm`, tubeX - tubeW / 2 - 16, resY + 3);
      }
    });
    ctx.restore();

    // 7. Vibrating Nickel-Chrome Tuning Fork Apparatus
    const forkX = tubeX;
    const forkY = tubeTopY - 48;
    const prongVibe = isSoundActive ? Math.sin(timeTick * 35) * (2 + ac.resonanceGain * 2) : 0;

    ctx.save();
    // Stainless steel metallic gradient for tuning fork
    const forkGrad = ctx.createLinearGradient(forkX - 20, 0, forkX + 20, 0);
    forkGrad.addColorStop(0, "#94a3b8");
    forkGrad.addColorStop(0.5, "#f1f5f9");
    forkGrad.addColorStop(1, "#64748b");

    ctx.strokeStyle = forkGrad;
    ctx.lineWidth = 5.0;
    ctx.lineCap = "round";

    // Stem Handle
    ctx.beginPath();
    ctx.moveTo(forkX, forkY);
    ctx.lineTo(forkX, forkY - 24);
    ctx.stroke();

    // Center base block
    ctx.fillStyle = "#475569";
    ctx.beginPath();
    ctx.arc(forkX, forkY - 24, 4, 0, Math.PI * 2);
    ctx.fill();

    // U-shaped Prongs
    ctx.beginPath();
    // Left prong
    ctx.moveTo(forkX, forkY);
    ctx.lineTo(forkX - 12 - prongVibe, forkY);
    ctx.lineTo(forkX - 12 - prongVibe, forkY + 36);
    // Right prong
    ctx.moveTo(forkX, forkY);
    ctx.lineTo(forkX + 12 + prongVibe, forkY);
    ctx.lineTo(forkX + 12 + prongVibe, forkY + 36);
    ctx.stroke();

    // Frequency Stamp on Fork Stem
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "bold 8px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${fork.frequency.toFixed(0)}Hz`, forkX, forkY - 8);

    // Expanding Acoustic Wavefront Ripples
    if (isSoundActive) {
      for (let w = 1; w <= 4; w++) {
        const ringR = ((timeTick * 45 + w * 22) % 75);
        const ringAlpha = Math.max(0, 1 - ringR / 75) * (0.35 + ac.resonanceGain * 0.65);
        ctx.strokeStyle = `rgba(129, 140, 248, ${ringAlpha})`;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(forkX, forkY + 34, ringR, 0, Math.PI);
        ctx.stroke();
      }

      // Resonance Aura Flash at peak resonance
      if (ac.resonanceGain > 0.7) {
        const auraPulse = (ac.resonanceGain - 0.7) / 0.3;
        const auraGrad = ctx.createRadialGradient(forkX, tubeTopY, 5, forkX, tubeTopY, 45);
        auraGrad.addColorStop(0, `rgba(52, 211, 153, ${0.4 * auraPulse})`);
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(forkX, tubeTopY, 45, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // 8. Leveling Reservoir Bulb on Right Side
    ctx.save();
    const resX = tubeX + 120;
    const resY = waterSurfaceY - 10;

    // Flexible rubber tube connecting bottom of tube to reservoir bulb
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(tubeX, tubeTopY + tubeH);
    ctx.bezierCurveTo(tubeX + 30, tubeTopY + tubeH + 30, resX - 30, benchY - 10, resX, resY + 45);
    ctx.stroke();

    // Reservoir Bulb Body
    ctx.fillStyle = "rgba(56, 189, 248, 0.4)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(resX, resY + 20, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Glass funnel neck
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fillRect(resX - 6, resY - 15, 12, 18);
    ctx.strokeRect(resX - 6, resY - 15, 12, 18);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "8px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("RESERVOIR", resX, resY + 54);
    ctx.restore();

    animId = requestAnimationFrame(renderSoundCanvas);
  }

  // Event Listeners
  selectFork.addEventListener("change", (e) => {
    currentForkKey = e.target.value;
    if (isSoundActive && oscNode && audioCtx) {
      oscNode.frequency.setValueAtTime(TUNING_FORKS[currentForkKey].frequency, audioCtx.currentTime);
    }
    SoundFX.droplet();
    updateHUD();
  });

  sliderWater.addEventListener("input", (e) => {
    waterLevelCm = parseFloat(e.target.value);
    updateHUD();
  });

  sliderTemp.addEventListener("input", (e) => {
    airTempC = parseFloat(e.target.value);
    updateHUD();
  });

  btnStrike.addEventListener("click", () => {
    isSoundActive = !isSoundActive;
    setAudioPlayback(isSoundActive);
    if (isSoundActive) {
      btnStrike.textContent = "🔇 Mute Tuning Fork";
      btnStrike.classList.replace("btn-primary", "btn-secondary");
      SoundFX.snap();
    } else {
      btnStrike.textContent = "🔔 Strike Tuning Fork";
      btnStrike.classList.replace("btn-secondary", "btn-primary");
      SoundFX.click();
    }
    updateHUD();
  });

  btnSnap.addEventListener("click", () => {
    const ac = calculateAcoustics();
    if (ac.resonantLengths.length > 0) {
      // Find closest resonant length and set water level = 100 - resL
      let closestRes = ac.resonantLengths[0];
      let minD = 999;
      ac.resonantLengths.forEach(l => {
        const d = Math.abs(ac.airColumnLengthCm - l);
        if (d < minD) {
          minD = d;
          closestRes = l;
        }
      });
      waterLevelCm = Math.max(0, Math.min(95, 100 - closestRes));
      sliderWater.value = waterLevelCm;
      SoundFX.success();
      updateHUD();
    }
  });

  // View Switcher (Sim vs 4K Photo)
  viewSimBtn.addEventListener("click", () => {
    viewMode = "sim";
    viewSimBtn.classList.add("active");
    viewPhotoBtn.classList.remove("active");
    viewSimBtn.style.background = "#0284c7";
    viewPhotoBtn.style.background = "transparent";
    photoOverlay.style.display = "none";
    canvas.style.display = "block";
    SoundFX.click();
  });

  viewPhotoBtn.addEventListener("click", () => {
    viewMode = "photo";
    viewPhotoBtn.classList.add("active");
    viewSimBtn.classList.remove("active");
    viewPhotoBtn.style.background = "#0284c7";
    viewPhotoBtn.style.background = "transparent";
    photoOverlay.style.display = "block";
    canvas.style.display = "none";
    SoundFX.click();
  });

  // Telemetry CSV Export
  btnExport.addEventListener("click", () => {
    const ac = calculateAcoustics();
    const fork = TUNING_FORKS[currentForkKey];

    exportLabDataCsv({
      title: "Acoustic Resonance Tube & Speed of Sound Lab",
      labId: "resonance",
      parameters: {
        "Tuning Fork Frequency": `${fork.frequency} Hz (${fork.note})`,
        "Air Temperature": `${airTempC} °C`,
        "Theoretical Speed of Sound": `${ac.speedOfSound.toFixed(2)} m/s`,
        "Acoustic Wavelength": `${ac.wavelengthCm.toFixed(2)} cm`,
        "Tube Bore Radius": `${tubeRadiusCm} cm`,
        "End Correction (c)": `${endCorrectionCm.toFixed(2)} cm`
      },
      headers: ["Resonance Harmonic", "Formula", "Theoretical Length (cm)", "Measured Speed (m/s)"],
      dataRows: [
        ["1st Harmonic L1", "λ/4 - c", (ac.resonantLengths[0] || 0).toFixed(2), ac.speedOfSound.toFixed(2)],
        ["2nd Harmonic L2", "3λ/4 - c", (ac.resonantLengths[1] || 0).toFixed(2), ac.speedOfSound.toFixed(2)],
        ["Harmonic Difference", "2f·(L2 - L1)", ((ac.resonantLengths[1] || 0) - (ac.resonantLengths[0] || 0)).toFixed(2), ac.speedOfSound.toFixed(2)]
      ]
    });
    SoundFX.success();
  });

  // Standardized Hotkey: 'e' or 'E' triggers CSV telemetry export
  const handleKeyDown = (e) => {
    if ((e.key === "e" || e.key === "E") && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      btnExport.click();
    }
  };
  window.addEventListener("keydown", handleKeyDown);

  // Start Animation Loop
  updateHUD();
  animId = requestAnimationFrame(renderSoundCanvas);

  return function cleanupSoundResonanceLab() {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("resize", setupHiDPICanvas);
    window.removeEventListener("keydown", handleKeyDown);
    setAudioPlayback(false);
    if (audioCtx && typeof audioCtx.close === "function") {
      try { audioCtx.close(); } catch (e) {}
      audioCtx = null;
    }
  };
}
