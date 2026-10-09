// Edugates-ClipSAT Science Labs - Physics: Acoustic Resonance Tube & Speed of Sound Suite
// 60 FPS Precision Wave Acoustics Simulation:
// Variable water column closed-open tube standing waves,
// Speed of sound temperature dependence v(T) = 331.3·√(1 + T/273.15),
// Harmonic resonances L₁ = λ/4 - c, L₂ = 3λ/4 - c, L₃ = 5λ/4 - c,
// End correction c = 0.61·r, experimental sound speed v = 2f·(L₂ - L₁),
// Web Audio API real-time acoustic resonance amplification synthesizer.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initSoundResonanceLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return () => {};

  // Standard Lab Tuning Forks
  const TUNING_FORKS = {
    "512": { name: "High C (C₅)", frequency: 512, note: "C₅", color: "#38bdf8" },
    "440": { name: "Concert Pitch (A₄)", frequency: 440, note: "A₄", color: "#818cf8" },
    "384": { name: "Musical G (G₄)", frequency: 384, note: "G₄", color: "#34d399" },
    "256": { name: "Middle C (C₄)", frequency: 256, note: "C₄", color: "#fbbf24" }
  };

  // State Variables
  let currentForkKey = "440";
  let waterLevelCm = 45.0; // Water column height from bottom (0 to 100 cm)
  let airTempC = 20.0; // °C (-10 to 45)
  let tubeRadiusCm = 2.0; // Internal bore radius cm
  let endCorrectionCm = 0.61 * tubeRadiusCm; // ~1.22 cm
  let isSoundActive = false;
  let viewMode = "sim"; // "sim" or "photo"
  let animId = null;
  let timeTick = 0;

  // Web Audio API Synth Engine for realistic acoustic resonance
  let audioCtx = null;
  let oscNode = null;
  let gainNode = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
        gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.connect(audioCtx.destination);
      }
    }
  }

  function setAudioPlayback(active) {
    initAudio();
    if (!audioCtx) return;

    if (active) {
      if (audioCtx.state === "suspended") audioCtx.resume();
      if (!oscNode) {
        oscNode = audioCtx.createOscillator();
        oscNode.type = "sine";
        oscNode.frequency.setValueAtTime(TUNING_FORKS[currentForkKey].frequency, audioCtx.currentTime);
        oscNode.connect(gainNode);
        oscNode.start();
      }
    } else {
      if (gainNode?.gain) {
        if (typeof gainNode.gain.setTargetAtTime === "function") {
          gainNode.gain.setTargetAtTime(0, audioCtx.currentTime || 0, 0.05);
        } else if (typeof gainNode.gain.setValueAtTime === "function") {
          gainNode.gain.setValueAtTime(0, audioCtx.currentTime || 0);
        } else {
          gainNode.gain.value = 0;
        }
      }
      if (oscNode) {
        try { oscNode.stop(); } catch (err) {}
        oscNode = null;
      }
    }
  }

  // Physics Calculations
  function calculateAcoustics() {
    const fork = TUNING_FORKS[currentForkKey];
    // True speed of sound in air at temp T: v = 331.3 * sqrt(1 + T / 273.15)
    const speedOfSound = 331.3 * Math.sqrt(1 + airTempC / 273.15); // m/s
    // Wavelength λ = v / f
    const wavelengthM = speedOfSound / fork.frequency;
    const wavelengthCm = wavelengthM * 100;

    // Tube total length = 100 cm
    // Air column length L = 100 - waterLevelCm
    const airColumnLengthCm = 100 - waterLevelCm;

    // Resonant harmonic lengths for closed-open tube:
    // L1 = λ/4 - c
    // L2 = 3λ/4 - c
    // L3 = 5λ/4 - c
    const res1 = wavelengthCm * 0.25 - endCorrectionCm;
    const res2 = wavelengthCm * 0.75 - endCorrectionCm;
    const res3 = wavelengthCm * 1.25 - endCorrectionCm;

    const resonantLengths = [res1, res2, res3].filter(l => l > 0 && l <= 100);

    // Calculate proximity to closest resonance (for sound volume & VU meter)
    let minDelta = 999;
    resonantLengths.forEach(resL => {
      const delta = Math.abs(airColumnLengthCm - resL);
      if (delta < minDelta) minDelta = delta;
    });

    // Q-factor resonance sharpness (half-width ~1.8 cm)
    const resonanceSharpness = 1.8;
    const resonanceGain = Math.exp(-Math.pow(minDelta / resonanceSharpness, 2));

    // Update real audio gain if sound active
    if (audioCtx && gainNode && isSoundActive) {
      const targetGain = 0.02 + resonanceGain * 0.28;
      if (typeof gainNode.gain.setTargetAtTime === "function") {
        gainNode.gain.setTargetAtTime(targetGain, audioCtx.currentTime || 0, 0.03);
      } else if (typeof gainNode.gain.setValueAtTime === "function") {
        gainNode.gain.setValueAtTime(targetGain, audioCtx.currentTime || 0);
      } else {
        gainNode.gain.value = targetGain;
      }
    }

    return {
      speedOfSound,
      wavelengthCm,
      airColumnLengthCm,
      resonantLengths,
      minDelta,
      resonanceGain
    };
  }

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #818cf8; box-shadow: 0 0 10px #818cf8;"></span>
            Acoustic Resonance Tube &amp; Speed of Sound
          </span>
          <span class="badge" style="background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); color: #a5b4fc; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            ${renderLatex("v = 2f(L_2 - L_1) \\quad \\bullet \\quad \\text{Standing Waves } \\lambda/4")}
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-sound-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔊 Resonance Apparatus
            </button>
            <button id="view-mode-sound-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-sound-strike-fork" style="padding: 5px 14px; font-size: 0.78rem;">
            🔔 Strike Tuning Fork
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-sound-snap-resonance" style="padding: 5px 12px; font-size: 0.78rem;">
            🎯 Snap to Nearest Resonance
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-sound-export" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export Acoustics CSV
          </button>
        </div>
      </div>

      <!-- Main Layout Grid -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="sound-layout">
        <!-- Canvas Viewport -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(99, 102, 241, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #1e1b4b 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
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
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">ACOUSTIC SOUND SPEED v(T)</div>
              <div id="hud-sound-speed" style="font-size: 1.12rem; font-weight: 800; color: #818cf8; font-family: var(--font-mono);">
                v = 343.2 m/s (λ = 78.0 cm)
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">RESONANCE AMPLITUDE (VU)</div>
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
                <span id="lbl-water-level" style="color: #38bdf8; font-weight: 700;">45.0 cm (Air Column L = 55.0 cm)</span>
              </div>
              <input id="slider-water-level" type="range" min="0" max="95" step="0.5" value="45.0" style="width: 100%; accent-color: #38bdf8;">
            </div>

            <!-- Air Temperature Slider -->
            <div style="margin-bottom: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                <span style="color: #94a3b8;">Air Temperature [v(T)]</span>
                <span id="lbl-sound-temp" style="color: #facc15; font-weight: 700;">20.0 °C</span>
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
                <span id="lbl-vu-gain" style="color: #10b981; font-weight: 700;">85%</span>
              </div>
              <div style="height: 10px; background: #0f172a; border-radius: 5px; overflow: hidden; border: 1px solid #334155; position: relative;">
                <div id="bar-vu-gain" style="height: 100%; width: 85%; background: linear-gradient(90deg, #38bdf8, #10b981, #f59e0b); border-radius: 4px; transition: width 0.1s ease;"></div>
              </div>
            </div>
          </div>

          <!-- Post-Lab Checkpoint Container -->
          <div id="sound-checkpoint-container"></div>
        </div>
      </div>
    </div>
  `;

  // Attach Checkpoint
  mountLabCheckpoint("sound-checkpoint-container", "resonance");

  // DOM Elements
  const canvas = document.getElementById("sound-canvas");
  const ctx = canvas.getContext("2d");

  const viewSimBtn = document.getElementById("view-mode-sound-sim");
  const viewPhotoBtn = document.getElementById("view-mode-sound-photo");
  const photoOverlay = document.getElementById("sound-photo-overlay");

  const btnStrike = document.getElementById("btn-sound-strike-fork");
  const btnSnap = document.getElementById("btn-sound-snap-resonance");
  const btnExport = document.getElementById("btn-sound-export");

  const selectFork = document.getElementById("select-tuning-fork");
  const sliderWater = document.getElementById("slider-water-level");
  const sliderTemp = document.getElementById("slider-sound-temp");

  const lblWater = document.getElementById("lbl-water-level");
  const lblTemp = document.getElementById("lbl-sound-temp");

  const hudSpeed = document.getElementById("hud-sound-speed");
  const hudGain = document.getElementById("hud-sound-gain");
  const valL1 = document.getElementById("val-res-l1");
  const valL2 = document.getElementById("val-res-l2");
  const valCalcSpeed = document.getElementById("val-calc-speed");
  const barVu = document.getElementById("bar-vu-gain");
  const lblVu = document.getElementById("lbl-vu-gain");
  const badgeRes = document.getElementById("badge-resonance-status");

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
  }

  // 60 FPS Sound Tube Render Loop
  function renderSoundCanvas() {
    if (!container || !container.isConnected) return;
    timeTick += 0.04;
    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);

    const ac = calculateAcoustics();
    const fork = TUNING_FORKS[currentForkKey];

    // 1. Lab Workbench Base
    const benchY = 460;
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, benchY, cw, ch - benchY);
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, benchY, cw, ch - benchY);

    // 2. Vertical Glass Resonance Tube
    const tubeX = cw * 0.5 - 40;
    const tubeTopY = 110;
    const tubeH = 340; // Represents 100 cm tube (scale: 3.4 px/cm)
    const pxPerCm = tubeH / 100;
    const tubeW = 44;

    // Water level position inside tube
    const waterHeightPx = waterLevelCm * pxPerCm;
    const waterSurfaceY = (tubeTopY + tubeH) - waterHeightPx;

    // Draw Water Reservoir
    ctx.save();
    ctx.fillStyle = "rgba(56, 189, 248, 0.35)";
    ctx.fillRect(tubeX - tubeW / 2 + 2, waterSurfaceY, tubeW - 4, waterHeightPx);

    // Meniscus Ellipse at Water Surface (Displacement Node!)
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.ellipse(tubeX, waterSurfaceY, tubeW / 2 - 3, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Standing Longitudinal Wave Envelope Overlay inside Air Column
    if (isSoundActive) {
      ctx.save();
      const airH = waterSurfaceY - tubeTopY;
      ctx.strokeStyle = `rgba(129, 140, 248, ${0.4 + ac.resonanceGain * 0.55})`;
      ctx.lineWidth = 2;

      // Draw sinusoidal wave envelope
      const waveFreq = (Math.PI * 2) / (ac.wavelengthCm * pxPerCm);
      ctx.beginPath();
      for (let y = tubeTopY; y <= waterSurfaceY; y += 3) {
        // Distance from water surface (node at waterSurfaceY)
        const distFromNode = waterSurfaceY - y;
        const amp = Math.sin(distFromNode * waveFreq) * (tubeW / 2 - 4) * Math.sin(timeTick * 18);
        const wx = tubeX + amp;
        if (y === tubeTopY) ctx.moveTo(wx, y);
        else ctx.lineTo(wx, y);
      }
      ctx.stroke();

      // Mirror Envelope
      ctx.beginPath();
      for (let y = tubeTopY; y <= waterSurfaceY; y += 3) {
        const distFromNode = waterSurfaceY - y;
        const amp = -Math.sin(distFromNode * waveFreq) * (tubeW / 2 - 4) * Math.sin(timeTick * 18);
        const wx = tubeX + amp;
        if (y === tubeTopY) ctx.moveTo(wx, y);
        else ctx.lineTo(wx, y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 4. Glass Resonance Tube Walls & Metric Scale
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(tubeX - tubeW / 2, tubeTopY, tubeW, tubeH);

    // Graduated Centimeter Scale on Side
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#64748b";
    ctx.font = "8px 'JetBrains Mono', monospace";
    for (let cm = 0; cm <= 100; cm += 10) {
      const my = tubeTopY + cm * pxPerCm;
      ctx.beginPath();
      ctx.moveTo(tubeX + tubeW / 2, my);
      ctx.lineTo(tubeX + tubeW / 2 + (cm % 20 === 0 ? 8 : 4), my);
      ctx.stroke();
      if (cm % 20 === 0) {
        ctx.fillText(`${cm}`, tubeX + tubeW / 2 + 12, my + 3);
      }
    }

    // Mark Theoretical Resonance Positions (Red markers)
    ac.resonantLengths.forEach((resL, idx) => {
      const resY = tubeTopY + resL * pxPerCm;
      ctx.fillStyle = "#f43f5e";
      ctx.beginPath();
      ctx.arc(tubeX - tubeW / 2 - 6, resY, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "bold 8px 'JetBrains Mono', monospace";
      ctx.fillText(`L${idx + 1}`, tubeX - tubeW / 2 - 22, resY + 3);
    });
    ctx.restore();

    // 5. Vibrating Tuning Fork Apparatus (Mounted above open tube top)
    const forkX = tubeX;
    const forkY = tubeTopY - 45;
    const prongVibe = isSoundActive ? Math.sin(timeTick * 35) * 3 : 0;

    ctx.save();
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";

    // Stem Handle
    ctx.beginPath();
    ctx.moveTo(forkX, forkY);
    ctx.lineTo(forkX, forkY - 20);
    ctx.stroke();

    // U-shaped Prongs
    ctx.beginPath();
    // Left prong
    ctx.moveTo(forkX, forkY);
    ctx.lineTo(forkX - 10 - prongVibe, forkY);
    ctx.lineTo(forkX - 10 - prongVibe, forkY + 32);
    // Right prong
    ctx.moveTo(forkX, forkY);
    ctx.lineTo(forkX + 10 + prongVibe, forkY);
    ctx.lineTo(forkX + 10 + prongVibe, forkY + 32);
    ctx.stroke();

    // Sound Wave Emanation Rings
    if (isSoundActive) {
      for (let w = 1; w <= 3; w++) {
        const ringR = ((timeTick * 40 + w * 25) % 65);
        ctx.strokeStyle = `rgba(129, 140, 248, ${Math.max(0, 1 - ringR / 65) * ac.resonanceGain})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(forkX, forkY + 30, ringR, 0, Math.PI);
        ctx.stroke();
      }
    }
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
    viewSimBtn.style.background = "transparent";
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

  // Start Animation Loop
  updateHUD();
  animId = requestAnimationFrame(renderSoundCanvas);

  return function cleanupSoundResonanceLab() {
    if (animId) cancelAnimationFrame(animId);
    setAudioPlayback(false);
  };
}
