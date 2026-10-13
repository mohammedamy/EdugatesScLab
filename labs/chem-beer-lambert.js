// Edugates-ClipSAT Science Labs - Chemistry: Spectrophotometry & Beer-Lambert Law Suite
// 60 FPS Precision Optical Absorption Simulation:
// Absorbance A = ε·b·c, Transmittance T = I/I₀ = 10^(-A), Wavelength λ Scan,
// Volumetric Gaussian Light Beam, Tyndall Scattering in Quartz Cuvette,
// Cuvette Path Length b, Solution Concentration c, and Calibration Curve Fitting.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initBeerLambertLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Reagent Solute Library
  const SOLUTES = {
    cuso4: { name: "Copper(II) Sulfate (CuSO₄)", color: "#06b6d4", peakWavelength: 635, molarAbs: 55.0, maxC: 0.5, unit: "M" },
    kmno4: { name: "Potassium Permanganate (KMnO₄)", color: "#c026d3", peakWavelength: 525, molarAbs: 2200.0, maxC: 0.001, unit: "M" },
    cocl2: { name: "Cobalt(II) Chloride (CoCl₂)", color: "#f43f5e", peakWavelength: 510, molarAbs: 18.5, maxC: 1.0, unit: "M" },
    k2cr2o7: { name: "Potassium Dichromate (K₂Cr₂O₇)", color: "#f97316", peakWavelength: 440, molarAbs: 380.0, maxC: 0.01, unit: "M" }
  };

  // State Variables
  let currentSoluteKey = "cuso4";
  let concentration = 0.20; // in unit
  let pathLengthCm = 1.0; // cm (0.5 to 2.5)
  let wavelengthNm = 635; // nm (380 to 750)
  let incidentIntensityI0 = 100.0; // mW/cm²
  let isRunning = true;
  let animId = null;
  let timeTick = 0;

  // Colloidal Scatter Particles in Cuvette
  const scatterParticles = [];
  for (let i = 0; i < 35; i++) {
    scatterParticles.push({
      xFrac: Math.random(),
      yFrac: 0.15 + Math.random() * 0.7,
      size: 0.8 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2
    });
  }

  // History Buffer
  const calibrationPoints = [];

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #06b6d4; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #06b6d4; box-shadow: 0 0 10px #06b6d4;"></span>
            Spectrophotometry &amp; Beer-Lambert Law Suite
          </span>
          <span class="badge" style="background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.3); color: #38bdf8; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            ${renderLatex("A = \\epsilon b c \\quad \\bullet \\quad T = I/I_0 = 10^{-A}")}
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-beer-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Dynamics Simulator
            </button>
            <button id="view-mode-beer-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-beer-record-point" style="padding: 5px 14px; font-size: 0.78rem; background: linear-gradient(135deg, #0284c7, #0369a1); border: none; font-weight: 700; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);">
            📍 Record Calibration Point
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-beer-reset" style="padding: 5px 12px; font-size: 0.78rem;">
            ⟲ Clear Data
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-beer-export" title="Export experimental telemetry to RFC-4180 CSV (Hotkey: E)" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export CSV (E)
          </button>
        </div>
      </div>

      <!-- Main Layout -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="beer-layout">
        <!-- Canvas Viewport -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(6, 182, 212, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #0c233c 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="beer-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
          <div id="beer-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <picture>
              <source srcset="assets/labs/beer_lambert_bench.webp" type="image/webp">
              <img src="assets/labs/beer_lambert_bench.jpg" decoding="async" loading="lazy" alt="4K Research Spectrophotometer & Optics Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            </picture>
            
            <!-- Live Analytical Telemetry Callout on Photo -->
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(6, 182, 212, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">UV-Vis Spectrophotometer</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Monochromator λ = 190–1100 nm</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Precision Quartz Cuvette</div>
                <div style="color: #facc15; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Optical Path b = 1.000 cm ± 0.005</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Silicon Photodiode Array</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Dynamic Range: 0.000 to 4.000 Abs</div>
              </div>
            </div>
          </div>

          <!-- Top HUD -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(6, 182, 212, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto; box-shadow: 0 6px 18px rgba(0,0,0,0.6);">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase; display: flex; align-items: center; gap: 6px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #38bdf8; display: inline-block; box-shadow: 0 0 6px #38bdf8;"></span>
                OPTICAL ABSORBANCE &amp; TRANSMITTANCE
              </div>
              <div id="hud-beer-absorbance" style="font-size: 1.15rem; font-weight: 800; color: #38bdf8; font-family: var(--font-mono);">
                A = 0.000 • %T = 100.0%
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto; box-shadow: 0 6px 18px rgba(0,0,0,0.6);">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase; display: flex; align-items: center; justify-content: flex-end; gap: 6px;">
                TRANSMITTED FLUX I
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: inline-block; box-shadow: 0 0 6px #10b981;"></span>
              </div>
              <div id="hud-beer-intensity" style="font-size: 1.15rem; font-weight: 800; color: #10b981; font-family: var(--font-mono);">
                I = 100.0 mW/cm²
              </div>
            </div>
          </div>
        </div>

        <!-- Analytical Charts & Controls -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Controls Panel -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; margin-bottom: 12px;">Apparatus &amp; Solution Controls</div>
            
            <div style="margin-bottom: 12px;">
              <label style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Chemical Solute</label>
              <select id="select-beer-solute" class="form-control" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                ${Object.entries(SOLUTES).map(([k, s]) => `<option value="${k}">${s.name}</option>`).join("")}
              </select>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                  <span style="color: #94a3b8;">Concentration c</span>
                  <span id="lbl-beer-conc" style="color: #38bdf8; font-family: var(--font-mono); font-weight: 700;">0.200 M</span>
                </div>
                <input type="range" id="slider-beer-conc" min="0" max="0.5" step="0.01" value="0.20" style="width: 100%; accent-color: #38bdf8;">
              </div>
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                  <span style="color: #94a3b8;">Path Length b</span>
                  <span id="lbl-beer-path" style="color: #38bdf8; font-family: var(--font-mono); font-weight: 700;">1.00 cm</span>
                </div>
                <input type="range" id="slider-beer-path" min="0.5" max="2.5" step="0.1" value="1.0" style="width: 100%; accent-color: #38bdf8;">
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                <span style="color: #94a3b8;">Incident Wavelength λ</span>
                <span id="lbl-beer-wave" style="color: #f59e0b; font-family: var(--font-mono); font-weight: 700;">635 nm (Peak)</span>
              </div>
              <input type="range" id="slider-beer-wave" min="380" max="750" step="5" value="635" style="width: 100%; accent-color: #f59e0b;">
            </div>
          </div>

          <!-- Calibration Graph Canvas -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; flex: 1; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.75rem; font-weight: 700; color: #10b981; text-transform: uppercase;">Beer's Law Calibration Plot (A vs c)</span>
              <span id="beer-linear-fit" style="font-size: 0.72rem; color: #94a3b8; font-family: var(--font-mono);">R² = 1.000</span>
            </div>
            <canvas id="beer-plot-canvas" width="450" height="210" style="width: 100%; height: 210px; background: #090d16; border-radius: 8px; border: 1px solid #1e293b;"></canvas>
          </div>
        </div>
      </div>

      <!-- Post-Lab Checkpoint Assessment -->
      <div id="beer-checkpoint-container" style="margin-top: 24px;"></div>
    </div>
  `;

  const canvas = container.querySelector("#beer-canvas");
  const ctx = canvas.getContext("2d");
  const plotCanvas = container.querySelector("#beer-plot-canvas");
  const plotCtx = plotCanvas.getContext("2d");

  // HiDPI / Retina Canvas Setup
  const logicalW = 580;
  const logicalH = 530;
  const plotLogicalW = 450;
  const plotLogicalH = 210;

  function setupHiDPICanvas() {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (typeof window.getOptimizedDPR === "function" ? window.getOptimizedDPR() : (window.devicePixelRatio || 1));
    const rect = canvas.getBoundingClientRect();
    const w = rect.width > 0 ? rect.width : logicalW;
    const h = rect.height > 0 ? rect.height : logicalH;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.resetTransform();
    ctx.scale(dpr * (w / logicalW), dpr * (h / logicalH));

    const plotRect = plotCanvas.getBoundingClientRect();
    const pw = plotRect.width > 0 ? plotRect.width : plotLogicalW;
    const ph = plotRect.height > 0 ? plotRect.height : plotLogicalH;
    plotCanvas.width = Math.round(pw * dpr);
    plotCanvas.height = Math.round(ph * dpr);
    plotCtx.resetTransform();
    plotCtx.scale(dpr * (pw / plotLogicalW), dpr * (ph / plotLogicalH));
  }
  setupHiDPICanvas();
  window.addEventListener("resize", setupHiDPICanvas);

  function getCalculatedAbsorbance() {
    const solute = SOLUTES[currentSoluteKey];
    // Wavelength Gaussian shape around peak wavelength
    const deltaLambda = wavelengthNm - solute.peakWavelength;
    const peakSigma = 35.0; // nm bandwidth
    const waveEfficiency = Math.exp(-(deltaLambda * deltaLambda) / (2 * peakSigma * peakSigma));
    const effectiveEpsilon = solute.molarAbs * waveEfficiency;
    const A = effectiveEpsilon * pathLengthCm * concentration;
    const T = Math.pow(10, -A);
    const I = incidentIntensityI0 * T;
    return { A, T, I, effectiveEpsilon };
  }

  function renderSimulation() {
    if (!container || !container.isConnected) {
      isRunning = false;
      if (animId) cancelAnimationFrame(animId);
      return;
    }

    const photoOverlay = container.querySelector("#beer-photo-overlay");
    if (photoOverlay && photoOverlay.style.display === "block") {
      return;
    }

    timeTick += 0.03;
    ctx.clearRect(0, 0, logicalW, logicalH);
    const { A, T, I } = getCalculatedAbsorbance();

    // 1. High-Precision Optical Rail & Workbench
    ctx.save();
    // Workbench surface shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(30, 420, 520, 20);

    // Aluminum Dovetail Optical Rail Base
    const railGrad = ctx.createLinearGradient(30, 370, 30, 420);
    railGrad.addColorStop(0, "#334155");
    railGrad.addColorStop(0.3, "#475569");
    railGrad.addColorStop(0.7, "#1e293b");
    railGrad.addColorStop(1, "#0f172a");

    ctx.fillStyle = railGrad;
    ctx.fillRect(35, 370, 510, 45);
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(35, 370, 510, 45);

    // Center extruded guide channel
    ctx.fillStyle = "#090d16";
    ctx.fillRect(45, 390, 490, 8);

    // Millimeter vernier ruler along rail
    ctx.fillStyle = "#94a3b8";
    ctx.font = "8px 'JetBrains Mono', monospace";
    for (let cm = 0; cm <= 48; cm++) {
      const rx = 55 + cm * 10;
      ctx.strokeStyle = cm % 5 === 0 ? "#cbd5e1" : "#475569";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rx, 370);
      ctx.lineTo(rx, 370 + (cm % 5 === 0 ? 8 : 4));
      ctx.stroke();
      if (cm % 10 === 0) {
        ctx.fillText(`${cm}`, rx - 4, 386);
      }
    }

    // Heavy Vibration-Isolation Bench Support Pillars
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 2;
    ctx.fillRect(55, 415, 30, 65);
    ctx.strokeRect(55, 415, 30, 65);
    ctx.fillRect(495, 415, 30, 65);
    ctx.strokeRect(495, 415, 30, 65);
    ctx.restore();

    // Beam Color
    const beamColor = wavelengthToColor(wavelengthNm);

    // 2. Monochromator & Tungsten-Halogen Light Source Housing (Left)
    ctx.save();
    // Drop shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.beginPath();
    ctx.roundRect(48, 172, 94, 202, 10);
    ctx.fill();

    // Instrument Housing Body
    const lampBodyGrad = ctx.createLinearGradient(50, 170, 140, 370);
    lampBodyGrad.addColorStop(0, "#1e293b");
    lampBodyGrad.addColorStop(0.5, "#0f172a");
    lampBodyGrad.addColorStop(1, "#020617");

    ctx.fillStyle = lampBodyGrad;
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(50, 170, 90, 200, 10);
    ctx.fill();
    ctx.stroke();

    // Heat sink cooling vents on top
    ctx.fillStyle = "#090d16";
    for (let v = 0; v < 4; v++) {
      ctx.fillRect(65 + v * 16, 178, 8, 18);
    }

    // Collimator Optical Barrel (Aperture output)
    const barrelGrad = ctx.createLinearGradient(140, 240, 160, 270);
    barrelGrad.addColorStop(0, "#475569");
    barrelGrad.addColorStop(1, "#1e293b");
    ctx.fillStyle = barrelGrad;
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(140, 244, 20, 24, 4);
    ctx.fill();
    ctx.stroke();

    // Internal Lamp Glow (Halogen Filament)
    const filamentPulse = 0.95 + Math.sin(timeTick * 12) * 0.05;
    const lampGlow = ctx.createRadialGradient(95, 256, 4, 95, 256, 48 * filamentPulse);
    lampGlow.addColorStop(0, "#ffffff");
    lampGlow.addColorStop(0.25, beamColor);
    lampGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = lampGlow;
    ctx.beginPath();
    ctx.arc(95, 256, 48 * filamentPulse, 0, Math.PI * 2);
    ctx.fill();

    // Bulb glass capsule
    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(95, 256, 18, 0, Math.PI * 2);
    ctx.stroke();

    // Filament coil
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(90, 256);
    ctx.lineTo(100, 256);
    ctx.stroke();

    // Lamp Status Labels
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 10px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("TUNGSTEN LAMP", 95, 335);
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    ctx.fillText(`λ = ${wavelengthNm} nm`, 95, 350);
    ctx.restore();

    // 3. Precision Quartz Cuvette Assembly (Center)
    const cuvetteW = 34 + pathLengthCm * 46;
    const cuvetteX = 270 - cuvetteW / 2;
    const cuvetteH = 175;
    const cuvetteY = 175;

    ctx.save();
    // Cuvette metal mounting bracket on rail
    ctx.fillStyle = "#334155";
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 1.5;
    ctx.fillRect(cuvetteX - 6, 350, cuvetteW + 12, 22);
    ctx.strokeRect(cuvetteX - 6, 350, cuvetteW + 12, 22);

    // Cuvette Glass Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(cuvetteX + 4, cuvetteY + 4, cuvetteW, cuvetteH);

    // Cuvette Liquid Solution Fill
    const solute = SOLUTES[currentSoluteKey];
    const concFrac = Math.min(1.0, concentration / solute.maxC);
    const alphaFrac = Math.min(0.94, 0.12 + concFrac * 0.82);

    ctx.fillStyle = solute.color;
    ctx.globalAlpha = alphaFrac;
    ctx.fillRect(cuvetteX + 5, cuvetteY + 18, cuvetteW - 10, cuvetteH - 24);
    ctx.globalAlpha = 1.0;

    // Curved Liquid Meniscus at top
    ctx.strokeStyle = solute.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(270, cuvetteY + 18, (cuvetteW - 10) / 2, 4.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Quartz Glass Outer Walls with Optical Refraction Reflections
    ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(cuvetteX, cuvetteY, cuvetteW, cuvetteH);

    // Glass wall thickness highlight
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 4;
    ctx.strokeRect(cuvetteX + 2, cuvetteY + 2, cuvetteW - 4, cuvetteH - 4);

    // Specular diagonal glare across quartz window
    const glassGlare = ctx.createLinearGradient(cuvetteX, cuvetteY, cuvetteX + cuvetteW, cuvetteY + cuvetteH);
    glassGlare.addColorStop(0, "rgba(255, 255, 255, 0.35)");
    glassGlare.addColorStop(0.2, "rgba(255, 255, 255, 0.08)");
    glassGlare.addColorStop(0.5, "rgba(255, 255, 255, 0)");
    glassGlare.addColorStop(0.8, "rgba(255, 255, 255, 0.18)");
    glassGlare.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = glassGlare;
    ctx.fillRect(cuvetteX, cuvetteY, cuvetteW, cuvetteH);

    // Optical Path Length Measurement Callout
    ctx.fillStyle = "#facc15";
    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(`b = ${pathLengthCm.toFixed(2)} cm`, 270, 366);

    // Path bracket
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cuvetteX, cuvetteY - 8);
    ctx.lineTo(cuvetteX, cuvetteY - 14);
    ctx.lineTo(cuvetteX + cuvetteW, cuvetteY - 14);
    ctx.lineTo(cuvetteX + cuvetteW, cuvetteY - 8);
    ctx.stroke();
    ctx.restore();

    // 4. Volumetric Gaussian Light Beam Propagation
    const beamY = 256;
    const incidentStartX = 160;
    const incidentEndX = cuvetteX;
    const transmittedStartX = cuvetteX + cuvetteW;
    const detectorX = 425;

    // A. Incident Beam (I₀): High Intensity Volumetric Beam
    ctx.save();
    // Multi-pass volumetric glow (Gaussian cross-section)
    const incHaloGrad = ctx.createLinearGradient(0, beamY - 16, 0, beamY + 16);
    incHaloGrad.addColorStop(0, "rgba(0,0,0,0)");
    incHaloGrad.addColorStop(0.3, beamColor);
    incHaloGrad.addColorStop(0.5, "#ffffff");
    incHaloGrad.addColorStop(0.7, beamColor);
    incHaloGrad.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = incHaloGrad;
    ctx.globalAlpha = 0.55;
    ctx.fillRect(incidentStartX, beamY - 14, incidentEndX - incidentStartX, 28);

    // Sharp central core
    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = 0.95;
    ctx.fillRect(incidentStartX, beamY - 2, incidentEndX - incidentStartX, 4);
    ctx.globalAlpha = 1.0;

    // Animated Flying Photons on Incident Beam
    for (let p = 0; p < 8; p++) {
      const pFrac = ((timeTick * 2.5 + p / 8) % 1.0);
      const px = incidentStartX + pFrac * (incidentEndX - incidentStartX);
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(px, beamY, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // B. Inside Cuvette: Tyndall Colloidal Light Scattering & Exponential Absorption
    ctx.save();
    ctx.beginPath();
    ctx.rect(cuvetteX + 5, cuvetteY + 18, cuvetteW - 10, cuvetteH - 24);
    ctx.clip();

    // Attenuated beam inside cuvette
    const internalGrad = ctx.createLinearGradient(cuvetteX + 5, 0, cuvetteX + cuvetteW - 5, 0);
    internalGrad.addColorStop(0, beamColor);
    internalGrad.addColorStop(1, `rgba(${parseInt(beamColor.slice(1, 3), 16)}, ${parseInt(beamColor.slice(3, 5), 16)}, ${parseInt(beamColor.slice(5, 7), 16)}, ${Math.max(0.08, T)})`);

    ctx.fillStyle = internalGrad;
    ctx.globalAlpha = 0.65;
    ctx.fillRect(cuvetteX + 5, beamY - 10, cuvetteW - 10, 20);

    // Core
    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = Math.max(0.15, Math.sqrt(T));
    ctx.fillRect(cuvetteX + 5, beamY - 1.5, cuvetteW - 10, 3);

    // Tyndall Scatter Micro-Particles
    scatterParticles.forEach(sp => {
      const sx = cuvetteX + 6 + sp.xFrac * (cuvetteW - 12);
      const sy = cuvetteY + 20 + sp.yFrac * (cuvetteH - 30);
      const distFromBeam = Math.abs(sy - beamY);
      const isInBeam = distFromBeam < 16;
      
      const pAlpha = isInBeam ? (0.4 + Math.sin(timeTick * 6 + sp.phase) * 0.4) : 0.15;
      ctx.fillStyle = isInBeam ? "#ffffff" : solute.color;
      ctx.globalAlpha = pAlpha;
      ctx.beginPath();
      ctx.arc(sx, sy, sp.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // C. Transmitted Beam (I = I₀ · 10^-A)
    ctx.save();
    if (T > 0.005) {
      const transWidth = Math.max(2, 24 * Math.sqrt(T));
      const transHalo = ctx.createLinearGradient(0, beamY - transWidth / 2, 0, beamY + transWidth / 2);
      transHalo.addColorStop(0, "rgba(0,0,0,0)");
      transHalo.addColorStop(0.3, beamColor);
      transHalo.addColorStop(0.5, "#ffffff");
      transHalo.addColorStop(0.7, beamColor);
      transHalo.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = transHalo;
      ctx.globalAlpha = Math.min(0.85, Math.max(0.1, T));
      ctx.fillRect(transmittedStartX, beamY - transWidth / 2, detectorX - transmittedStartX, transWidth);

      // Core
      ctx.fillStyle = "#ffffff";
      ctx.globalAlpha = Math.min(0.9, Math.max(0.08, T * 1.2));
      ctx.fillRect(transmittedStartX, beamY - 1.5, detectorX - transmittedStartX, 3);

      // Transmitted Photons
      const numTransPhotons = Math.max(1, Math.round(8 * T));
      for (let p = 0; p < numTransPhotons; p++) {
        const pFrac = ((timeTick * 2.5 + p / numTransPhotons) % 1.0);
        const px = transmittedStartX + pFrac * (detectorX - transmittedStartX);
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(px, beamY, 1.8 * Math.sqrt(T), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // 5. Silicon Photodiode Array Sensor & Instrument HUD (Right)
    ctx.save();
    // Drop shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.beginPath();
    ctx.roundRect(detectorX, 172, 110, 202, 10);
    ctx.fill();

    // Detector Chassis
    const detGrad = ctx.createLinearGradient(detectorX, 170, detectorX + 110, 370);
    detGrad.addColorStop(0, "#1e293b");
    detGrad.addColorStop(0.5, "#0f172a");
    detGrad.addColorStop(1, "#020617");

    ctx.fillStyle = detGrad;
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(detectorX, 170, 110, 200, 10);
    ctx.fill();
    ctx.stroke();

    // Optical Input Slit / Aperture Barrel
    ctx.fillStyle = "#090d16";
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1.5;
    ctx.fillRect(detectorX - 10, beamY - 14, 12, 28);
    ctx.strokeRect(detectorX - 10, beamY - 14, 12, 28);

    // Active Sensor LED Indicator
    ctx.fillStyle = T > 0.05 ? "#10b981" : "#ef4444";
    ctx.beginPath();
    ctx.arc(detectorX + 22, 195, 4, 0, Math.PI * 2);
    ctx.fill();

    // Sensor Status Header
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 10px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("PHOTOMETER", detectorX + 32, 198);

    // Digital LED Display Screen on detector
    ctx.fillStyle = "#030712";
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(detectorX + 12, 218, 86, 120, 6);
    ctx.fill();
    ctx.stroke();

    // Transmittance Display
    ctx.fillStyle = "#64748b";
    ctx.font = "8px 'JetBrains Mono', monospace";
    ctx.fillText("TRANSMITTANCE", detectorX + 18, 234);

    ctx.fillStyle = "#34d399";
    ctx.font = "bold 14px 'JetBrains Mono', monospace";
    ctx.fillText(`${(T * 100).toFixed(1)}%`, detectorX + 18, 254);

    // Absorbance Display
    ctx.fillStyle = "#64748b";
    ctx.font = "8px 'JetBrains Mono', monospace";
    ctx.fillText("ABSORBANCE (A)", detectorX + 18, 276);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 14px 'JetBrains Mono', monospace";
    ctx.fillText(`${A.toFixed(3)}`, detectorX + 18, 296);

    // Transmitted Intensity
    ctx.fillStyle = "#64748b";
    ctx.font = "8px 'JetBrains Mono', monospace";
    ctx.fillText("FLUX I (mW/cm²)", detectorX + 18, 316);

    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    ctx.fillText(`${I.toFixed(1)}`, detectorX + 18, 330);
    ctx.restore();

    // HUD Updates
    const hudA = container.querySelector("#hud-beer-absorbance");
    const hudI = container.querySelector("#hud-beer-intensity");
    if (hudA) hudA.innerText = `A = ${A.toFixed(3)} • %T = ${(T * 100).toFixed(1)}%`;
    if (hudI) hudI.innerText = `I = ${I.toFixed(2)} mW/cm²`;

    renderCalibrationPlot();
  }

  function renderCalibrationPlot() {
    plotCtx.clearRect(0, 0, plotLogicalW, plotLogicalH);
    const solute = SOLUTES[currentSoluteKey];
    const margin = { left: 45, right: 25, top: 20, bottom: 35 };
    const w = plotLogicalW - margin.left - margin.right;
    const h = plotLogicalH - margin.top - margin.bottom;

    // Background
    plotCtx.fillStyle = "#030712";
    plotCtx.fillRect(0, 0, plotLogicalW, plotLogicalH);

    // Grid lines
    plotCtx.strokeStyle = "#1e293b";
    plotCtx.setLineDash([3, 3]);
    for (let i = 1; i <= 4; i++) {
      const y = margin.top + h - (h / 4) * i;
      plotCtx.beginPath();
      plotCtx.moveTo(margin.left, y);
      plotCtx.lineTo(margin.left + w, y);
      plotCtx.stroke();
    }
    for (let j = 1; j <= 4; j++) {
      const x = margin.left + (w / 4) * j;
      plotCtx.beginPath();
      plotCtx.moveTo(x, margin.top);
      plotCtx.lineTo(x, margin.top + h);
      plotCtx.stroke();
    }
    plotCtx.setLineDash([]);

    // Axes
    plotCtx.strokeStyle = "#475569";
    plotCtx.lineWidth = 1.5;
    plotCtx.beginPath();
    plotCtx.moveTo(margin.left, margin.top);
    plotCtx.lineTo(margin.left, margin.top + h);
    plotCtx.lineTo(margin.left + w, margin.top + h);
    plotCtx.stroke();

    // Axis Labels
    plotCtx.fillStyle = "#94a3b8";
    plotCtx.font = "10px system-ui, sans-serif";
    plotCtx.textAlign = "center";
    plotCtx.fillText(`Concentration c (${solute.unit})`, margin.left + w / 2, margin.top + h + 28);
    plotCtx.save();
    plotCtx.translate(14, margin.top + h / 2);
    plotCtx.rotate(-Math.PI / 2);
    plotCtx.fillText("Absorbance A", 0, 0);
    plotCtx.restore();

    // Max display bounds
    const maxPlotC = solute.maxC;
    const maxPlotA = 2.0;

    // Linear Beer's Law Line
    const effectiveEpsilon = solute.molarAbs * (wavelengthNm === solute.peakWavelength ? 1.0 : Math.exp(-Math.pow(wavelengthNm - solute.peakWavelength, 2) / (2 * 35 * 35)));
    const slope = effectiveEpsilon * pathLengthCm;
    
    plotCtx.strokeStyle = "#0284c7";
    plotCtx.lineWidth = 2.5;
    plotCtx.beginPath();
    plotCtx.moveTo(margin.left, margin.top + h);
    const endX = margin.left + w;
    const endA = slope * maxPlotC;
    const endY = margin.top + h - Math.min(1.0, endA / maxPlotA) * h;
    plotCtx.lineTo(endX, endY);
    plotCtx.stroke();

    // Recorded Calibration Points
    calibrationPoints.forEach((pt, idx) => {
      const px = margin.left + (pt.c / maxPlotC) * w;
      const py = margin.top + h - Math.min(1.0, pt.a / maxPlotA) * h;
      plotCtx.fillStyle = "#10b981";
      plotCtx.beginPath();
      plotCtx.arc(px, py, 4.5, 0, Math.PI * 2);
      plotCtx.fill();
      plotCtx.strokeStyle = "#ffffff";
      plotCtx.lineWidth = 1;
      plotCtx.stroke();
    });

    // Current Operating Dot with pulsating ring
    const { A } = getCalculatedAbsorbance();
    const curX = margin.left + (concentration / maxPlotC) * w;
    const curY = margin.top + h - Math.min(1.0, A / maxPlotA) * h;

    const ringPulse = 6 + Math.sin(timeTick * 8) * 3;
    plotCtx.strokeStyle = "rgba(245, 158, 11, 0.5)";
    plotCtx.lineWidth = 1.5;
    plotCtx.beginPath();
    plotCtx.arc(curX, curY, ringPulse, 0, Math.PI * 2);
    plotCtx.stroke();

    plotCtx.fillStyle = "#f59e0b";
    plotCtx.beginPath();
    plotCtx.arc(curX, curY, 6, 0, Math.PI * 2);
    plotCtx.fill();
    plotCtx.strokeStyle = "#ffffff";
    plotCtx.lineWidth = 1.8;
    plotCtx.stroke();
  }

  function wavelengthToColor(wavelength) {
    if (wavelength >= 380 && wavelength < 440) return "#7c3aed"; // violet
    if (wavelength >= 440 && wavelength < 490) return "#2563eb"; // blue
    if (wavelength >= 490 && wavelength < 510) return "#06b6d4"; // cyan
    if (wavelength >= 510 && wavelength < 580) return "#10b981"; // green
    if (wavelength >= 580 && wavelength < 645) return "#f59e0b"; // yellow-orange
    if (wavelength >= 645 && wavelength <= 750) return "#ef4444"; // red
    return "#38bdf8";
  }

  function loop() {
    if (!isRunning) return;
    renderSimulation();
    animId = requestAnimationFrame(loop);
  }

  function requestRender() {
    // Kept for backward compatibility
  }

  // Event Listeners
  container.querySelector("#select-beer-solute")?.addEventListener("change", (e) => {
    currentSoluteKey = e.target.value;
    const s = SOLUTES[currentSoluteKey];
    wavelengthNm = s.peakWavelength;
    container.querySelector("#slider-beer-wave").value = wavelengthNm;
    container.querySelector("#lbl-beer-wave").innerText = `${wavelengthNm} nm (Peak)`;
    concentration = s.maxC * 0.4;
    const sliderC = container.querySelector("#slider-beer-conc");
    sliderC.max = s.maxC;
    sliderC.step = s.maxC / 50;
    sliderC.value = concentration;
    container.querySelector("#lbl-beer-conc").innerText = `${concentration.toFixed(3)} ${s.unit}`;
    SoundFX.playClick();
  });

  container.querySelector("#slider-beer-conc")?.addEventListener("input", (e) => {
    concentration = parseFloat(e.target.value);
    const s = SOLUTES[currentSoluteKey];
    container.querySelector("#lbl-beer-conc").innerText = `${concentration.toFixed(3)} ${s.unit}`;
  });

  container.querySelector("#slider-beer-path")?.addEventListener("input", (e) => {
    pathLengthCm = parseFloat(e.target.value);
    container.querySelector("#lbl-beer-path").innerText = `${pathLengthCm.toFixed(2)} cm`;
  });

  container.querySelector("#slider-beer-wave")?.addEventListener("input", (e) => {
    wavelengthNm = parseInt(e.target.value, 10);
    const s = SOLUTES[currentSoluteKey];
    const isPeak = wavelengthNm === s.peakWavelength;
    container.querySelector("#lbl-beer-wave").innerText = `${wavelengthNm} nm${isPeak ? " (Peak)" : ""}`;
  });

  container.querySelector("#btn-beer-record-point")?.addEventListener("click", () => {
    const { A } = getCalculatedAbsorbance();
    calibrationPoints.push({ c: concentration, a: A });
    LabTrialStore.addTrial("beerlambert", { concentration, absorbance: A, pathLengthCm, wavelengthNm });
    SoundFX.playScorePip();
  });

  container.querySelector("#btn-beer-reset")?.addEventListener("click", () => {
    calibrationPoints.length = 0;
    LabTrialStore.clearTrials("beerlambert");
    SoundFX.playClick();
  });

  container.querySelector("#btn-beer-export")?.addEventListener("click", () => {
    exportLabDataCsv({
      title: "Beer-Lambert Law Spectrophotometry Telemetry",
      labId: "beerlambert",
      parameters: {
        "Solute": SOLUTES[currentSoluteKey].name,
        "Peak Wavelength λ_max (nm)": SOLUTES[currentSoluteKey].peakWavelength,
        "Measurement Wavelength λ (nm)": wavelengthNm,
        "Cuvette Path Length b (cm)": pathLengthCm
      },
      headers: ["Trial Index", "Concentration (M)", "Absorbance A", "Transmittance %T"],
      dataRows: calibrationPoints.map((pt, idx) => [
        idx + 1,
        pt.c.toFixed(4),
        pt.a.toFixed(4),
        (Math.pow(10, -pt.a) * 100).toFixed(2)
      ])
    });
  });

  // 4K Photo View Switcher
  const btnBeerSim = container.querySelector("#view-mode-beer-sim");
  const btnBeerPhoto = container.querySelector("#view-mode-beer-photo");
  const beerPhotoOverlay = container.querySelector("#beer-photo-overlay");

  btnBeerSim?.addEventListener("click", () => {
    btnBeerSim.classList.add("active");
    btnBeerSim.style.background = "";
    btnBeerPhoto.classList.remove("active");
    btnBeerPhoto.style.background = "transparent";
    if (beerPhotoOverlay) beerPhotoOverlay.style.display = "none";
    SoundFX.playClick();
  });

  btnBeerPhoto?.addEventListener("click", () => {
    btnBeerPhoto.classList.add("active");
    btnBeerPhoto.style.background = "";
    btnBeerSim.classList.remove("active");
    btnBeerSim.style.background = "transparent";
    if (beerPhotoOverlay) beerPhotoOverlay.style.display = "block";
    SoundFX.playClick();
  });

  // Standardized Hotkey: 'e' or 'E' triggers CSV telemetry export
  const handleKeyDown = (e) => {
    if ((e.key === "e" || e.key === "E") && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      container.querySelector("#btn-beer-export")?.click();
    }
  };
  window.addEventListener("keydown", handleKeyDown);

  // Mount Assessment
  mountLabCheckpoint("beer-checkpoint-container", "beerlambert");

  // Kickoff simulation loop
  loop();

  return () => {
    isRunning = false;
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("resize", setupHiDPICanvas);
    window.removeEventListener("keydown", handleKeyDown);
  };
}
