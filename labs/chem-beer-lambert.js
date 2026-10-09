// Edugates-ClipSAT Science Labs - Chemistry: Spectrophotometry & Beer-Lambert Law Suite
// 60 FPS Precision Optical Absorption Simulation:
// Absorbance A = ε·b·c, Transmittance T = I/I₀ = 10^(-A), Wavelength λ Scan,
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

  // History Buffer
  const calibrationPoints = [];

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #06b6d4; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #06b6d4; box-shadow: 0 0 10px #06b6d4;"></span>
            Spectrophotometry &amp; Beer-Lambert Law Suite
          </span>
          <span class="badge" style="background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.3); color: #38bdf8; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            ${renderLatex("A = \\epsilon b c \\quad \\bullet \\quad T = I/I_0 = 10^{-A}")}
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-beer-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Dynamics Simulator
            </button>
            <button id="view-mode-beer-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-beer-record-point" style="padding: 5px 14px; font-size: 0.78rem; border-color: rgba(6, 182, 212, 0.4); color: #38bdf8;">
            📍 Record Calibration Point
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-beer-reset" style="padding: 5px 12px; font-size: 0.78rem;">
            ⟲ Clear Data
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-beer-export" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export Telemetry
          </button>
        </div>
      </div>

      <!-- Main Layout -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="beer-layout">
        <!-- Canvas Viewport -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(6, 182, 212, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #082f49 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
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
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(6, 182, 212, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">OPTICAL ABSORBANCE &amp; TRANSMITTANCE</div>
              <div id="hud-beer-absorbance" style="font-size: 1.15rem; font-weight: 800; color: #38bdf8; font-family: var(--font-mono);">
                A = 0.000 • %T = 100.0%
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">TRANSMITTED FLUX I</div>
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
                  <span id="lbl-beer-conc" style="color: #38bdf8; font-family: var(--font-mono); font-weight: 700;">0.20 M</span>
                </div>
                <input type="range" id="slider-beer-conc" min="0" max="0.5" step="0.01" value="0.20" style="width: 100%;">
              </div>
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                  <span style="color: #94a3b8;">Path Length b</span>
                  <span id="lbl-beer-path" style="color: #38bdf8; font-family: var(--font-mono); font-weight: 700;">1.00 cm</span>
                </div>
                <input type="range" id="slider-beer-path" min="0.5" max="2.5" step="0.1" value="1.0" style="width: 100%;">
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                <span style="color: #94a3b8;">Incident Wavelength λ</span>
                <span id="lbl-beer-wave" style="color: #f59e0b; font-family: var(--font-mono); font-weight: 700;">635 nm (Peak)</span>
              </div>
              <input type="range" id="slider-beer-wave" min="380" max="750" step="5" value="635" style="width: 100%;">
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

  let needsRedraw = false;
  function requestRender() {
    if (!needsRedraw) {
      needsRedraw = true;
      animId = requestAnimationFrame(renderSimulation);
    }
  }

  function renderSimulation() {
    needsRedraw = false;
    if (!container || !container.isConnected) {
      isRunning = false;
      if (animId) cancelAnimationFrame(animId);
      return;
    }

    const photoOverlay = container.querySelector("#beer-photo-overlay");
    if (photoOverlay && photoOverlay.style.display === "block") {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const { A, T, I } = getCalculatedAbsorbance();

    // 1. Draw Optical Bench Table
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(40, 360, 500, 18);
    ctx.fillStyle = "#334155";
    ctx.fillRect(50, 378, 20, 90);
    ctx.fillRect(510, 378, 20, 90);

    // 2. Light Source Assembly (Left)
    ctx.fillStyle = "#0f172a";
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(50, 190, 80, 120, 8);
    ctx.fill();
    ctx.stroke();

    // Lamp Bulb Glow
    const lampGrad = ctx.createRadialGradient(90, 250, 5, 90, 250, 40);
    lampGrad.addColorStop(0, "#ffffff");
    lampGrad.addColorStop(0.3, wavelengthToColor(wavelengthNm));
    lampGrad.addColorStop(1, "transparent");
    ctx.fillStyle = lampGrad;
    ctx.beginPath();
    ctx.arc(90, 250, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Tungsten Lamp", 90, 325);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px monospace";
    ctx.fillText(`${wavelengthNm} nm`, 90, 338);

    // 3. Cuvette Assembly (Center)
    const cuvetteW = 30 + pathLengthCm * 40;
    const cuvetteX = 270 - cuvetteW / 2;
    const cuvetteH = 160;
    const cuvetteY = 180;

    // Cuvette Body
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.strokeRect(cuvetteX, cuvetteY, cuvetteW, cuvetteH);
    ctx.fillRect(cuvetteX, cuvetteY, cuvetteW, cuvetteH);

    // Solution Fluid inside Cuvette
    const solute = SOLUTES[currentSoluteKey];
    ctx.fillStyle = solute.color;
    ctx.globalAlpha = Math.min(0.92, 0.08 + (concentration / solute.maxC) * 0.84);
    ctx.fillRect(cuvetteX + 3, cuvetteY + 15, cuvetteW - 6, cuvetteH - 18);
    ctx.globalAlpha = 1.0;

    // Meniscus
    ctx.strokeStyle = solute.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(270, cuvetteY + 15, (cuvetteW - 6) / 2, 4, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(`Cuvette b = ${pathLengthCm.toFixed(1)} cm`, 270, 355);

    // 4. Photodiode Sensor Assembly (Right)
    ctx.fillStyle = "#0f172a";
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(430, 200, 90, 100, 8);
    ctx.fill();
    ctx.stroke();

    // Sensor Window
    ctx.fillStyle = "#090d16";
    ctx.fillRect(430, 235, 12, 30);
    ctx.fillStyle = "#10b981";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("Photodetector", 475, 230);
    ctx.fillStyle = "#34d399";
    ctx.font = "bold 12px monospace";
    ctx.fillText(`${(T * 100).toFixed(1)}% T`, 475, 255);
    ctx.font = "10px monospace";
    ctx.fillText(`${I.toFixed(1)} mW`, 475, 272);

    // 5. Incident & Transmitted Light Beams
    const beamColor = wavelengthToColor(wavelengthNm);
    
    // Incident Beam (I₀)
    ctx.strokeStyle = beamColor;
    ctx.lineWidth = 8;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(130, 250);
    ctx.lineTo(cuvetteX, 250);
    ctx.stroke();

    // Transmitted Beam (I = I₀ · 10^-A)
    ctx.lineWidth = Math.max(1, 8 * Math.sqrt(T));
    ctx.globalAlpha = Math.max(0.1, T);
    ctx.beginPath();
    ctx.moveTo(cuvetteX + cuvetteW, 250);
    ctx.lineTo(430, 250);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // HUD Updates
    const hudA = container.querySelector("#hud-beer-absorbance");
    const hudI = container.querySelector("#hud-beer-intensity");
    if (hudA) hudA.innerText = `A = ${A.toFixed(3)} • %T = ${(T * 100).toFixed(1)}%`;
    if (hudI) hudI.innerText = `I = ${I.toFixed(2)} mW/cm²`;

    renderCalibrationPlot();
  }

  function renderCalibrationPlot() {
    plotCtx.clearRect(0, 0, plotCanvas.width, plotCanvas.height);
    const solute = SOLUTES[currentSoluteKey];
    const margin = { left: 45, right: 25, top: 20, bottom: 35 };
    const w = plotCanvas.width - margin.left - margin.right;
    const h = plotCanvas.height - margin.top - margin.bottom;

    // Axes
    plotCtx.strokeStyle = "#334155";
    plotCtx.lineWidth = 1.5;
    plotCtx.beginPath();
    plotCtx.moveTo(margin.left, margin.top);
    plotCtx.lineTo(margin.left, margin.top + h);
    plotCtx.lineTo(margin.left + w, margin.top + h);
    plotCtx.stroke();

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
    plotCtx.setLineDash([]);

    // Axis Labels
    plotCtx.fillStyle = "#94a3b8";
    plotCtx.font = "10px sans-serif";
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
    plotCtx.lineWidth = 2;
    plotCtx.beginPath();
    plotCtx.moveTo(margin.left, margin.top + h);
    const endX = margin.left + w;
    const endA = slope * maxPlotC;
    const endY = margin.top + h - Math.min(1.0, endA / maxPlotA) * h;
    plotCtx.lineTo(endX, endY);
    plotCtx.stroke();

    // Recorded Calibration Points
    calibrationPoints.forEach(pt => {
      const px = margin.left + (pt.c / maxPlotC) * w;
      const py = margin.top + h - Math.min(1.0, pt.a / maxPlotA) * h;
      plotCtx.fillStyle = "#10b981";
      plotCtx.beginPath();
      plotCtx.arc(px, py, 4.5, 0, Math.PI * 2);
      plotCtx.fill();
    });

    // Current Operating Dot
    const { A } = getCalculatedAbsorbance();
    const curX = margin.left + (concentration / maxPlotC) * w;
    const curY = margin.top + h - Math.min(1.0, A / maxPlotA) * h;
    plotCtx.fillStyle = "#f59e0b";
    plotCtx.beginPath();
    plotCtx.arc(curX, curY, 6, 0, Math.PI * 2);
    plotCtx.fill();
    plotCtx.strokeStyle = "#ffffff";
    plotCtx.lineWidth = 1.5;
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
    requestRender();
    SoundFX.playClick();
  });

  container.querySelector("#slider-beer-conc")?.addEventListener("input", (e) => {
    concentration = parseFloat(e.target.value);
    const s = SOLUTES[currentSoluteKey];
    container.querySelector("#lbl-beer-conc").innerText = `${concentration.toFixed(3)} ${s.unit}`;
    requestRender();
  });

  container.querySelector("#slider-beer-path")?.addEventListener("input", (e) => {
    pathLengthCm = parseFloat(e.target.value);
    container.querySelector("#lbl-beer-path").innerText = `${pathLengthCm.toFixed(2)} cm`;
    requestRender();
  });

  container.querySelector("#slider-beer-wave")?.addEventListener("input", (e) => {
    wavelengthNm = parseInt(e.target.value, 10);
    const s = SOLUTES[currentSoluteKey];
    const isPeak = wavelengthNm === s.peakWavelength;
    container.querySelector("#lbl-beer-wave").innerText = `${wavelengthNm} nm${isPeak ? " (Peak)" : ""}`;
    requestRender();
  });

  container.querySelector("#btn-beer-record-point")?.addEventListener("click", () => {
    const { A } = getCalculatedAbsorbance();
    calibrationPoints.push({ c: concentration, a: A });
    LabTrialStore.addTrial("beerlambert", { concentration, absorbance: A, pathLengthCm, wavelengthNm });
    requestRender();
    SoundFX.playScorePip();
  });

  container.querySelector("#btn-beer-reset")?.addEventListener("click", () => {
    calibrationPoints.length = 0;
    LabTrialStore.clearTrials("beerlambert");
    requestRender();
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
    requestRender();
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

  // Mount Assessment
  mountLabCheckpoint("beer-checkpoint-container", "beerlambert");

  // Kickoff simulation
  requestRender();

  return () => {
    isRunning = false;
    if (animId) cancelAnimationFrame(animId);
  };
}
