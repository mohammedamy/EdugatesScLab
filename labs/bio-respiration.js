// Edugates-ClipSAT Science Labs - Biology: Cellular Respiration & Micro-Respirometer Suite
// 60 FPS Biological Metabolic Simulation:
// Dual-Chamber Micro-Respirometer, Potassium Hydroxide (KOH) CO₂ Absorption,
// Manometric Liquid Column Fluid Shift, Respiratory Quotient (RQ = CO₂/O₂), and Yeast Fermentation Durham Tubes.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initRespirationLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const SPECIMENS = {
    germinating_peas: {
      name: "Germinating Peas (Pisum sativum)",
      type: "aerobic",
      baseRate: 0.14, // mL O2 / min
      rq: 1.00,
      hasKOH: true,
      desc: "Actively metabolizing germinating seeds undergoing aerobic cellular respiration."
    },
    dormant_peas: {
      name: "Dormant (Dry) Peas",
      type: "aerobic",
      baseRate: 0.015, // near zero
      rq: 1.00,
      hasKOH: true,
      desc: "Metabolically quiescent dry seeds with minimal cellular respiration."
    },
    glass_beads: {
      name: "Glass Beads (Inert Control)",
      type: "control",
      baseRate: 0.000,
      rq: 0.00,
      hasKOH: true,
      desc: "Negative control used to correct for ambient atmospheric pressure and temperature variations."
    },
    yeast_fermentation: {
      name: "Yeast (Saccharomyces cerevisiae) + Sucrose",
      type: "anaerobic",
      baseRate: 0.22, // CO2 evolution
      rq: 99.0, // anaerobic alcoholic fermentation
      hasKOH: false,
      desc: "Anaerobic alcoholic fermentation evolving CO₂ gas bubbles in inverted Durham tube."
    }
  };

  // State Variables
  let currentSpecimenKey = "germinating_peas";
  let activeSpecimen = SPECIMENS[currentSpecimenKey];
  let temperature = 22; // °C (10 to 45°C)
  let kohActive = true;
  let isRunning = true;
  let elapsedMinutes = 0.0;
  let o2ConsumedTotal = 0.0; // mL
  let manometerShift = 0.0; // mm
  let animId = null;
  let simClock = 0;

  // Time-series recording
  const timeSeries = [];

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #f97316; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #f97316; box-shadow: 0 0 10px #f97316;"></span>
            Cellular Respiration &amp; Micro-Respirometer Suite
          </span>
          <span class="badge" style="background: rgba(249, 115, 22, 0.15); border: 1px solid rgba(249, 115, 22, 0.3); color: #fb923c; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            ${renderLatex("\\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2 \\to 6\\text{CO}_2 + 6\\text{H}_2\\text{O} \\quad \\bullet \\quad \\text{KOH CO}_2\\text{ Absorption}")}
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-resp-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Dual Respirometer
            </button>
            <button id="view-mode-resp-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Lab Bench
            </button>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-resp-toggle-run" style="padding: 5px 14px; font-size: 0.78rem;">
            ${isRunning ? "⏸ Pause" : "▶ Resume"}
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-resp-reset" style="padding: 5px 12px; font-size: 0.78rem;">
            ⟲ Reset Manometer
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-resp-export" title="Export experimental telemetry to RFC-4180 CSV (Hotkey: E)" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export CSV (E)
          </button>
        </div>
      </div>

      <!-- Main Layout: Visual Respirometer on Left, Controls & Graphs on Right -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="respiration-layout">
        <!-- Visual Respirometer Canvas -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(249, 115, 22, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #1c0e04 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="respiration-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
          <div id="respiration-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <picture>
              <source srcset="assets/labs/respiration_bench.webp" type="image/webp">
              <img src="assets/labs/respiration_bench.jpg" decoding="async" loading="lazy" alt="4K Cellular Respiration & Respirometer Laboratory Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            </picture>
            
            <!-- Live Analytical Telemetry Callout on Photo -->
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(249, 115, 22, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Vernier LabQuest Gas Logger</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">O₂ Sensor: 19.8% • CO₂: 480 ppm</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Dual-Chamber Respirometer</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">15% KOH Pellets + Glass U-Tube</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Thermostatic Water Bath</div>
                <div style="color: #fb923c; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">22.1°C Constant Baseline</div>
              </div>
            </div>
          </div>

          <!-- Top HUD Overlay -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(249, 115, 22, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">NET O₂ CONSUMPTION RATE</div>
              <div style="font-weight: 800; font-size: 1.3rem; color: #fb923c; font-family: var(--font-mono);" id="disp-resp-rate">0.140 mL O₂ / min</div>
              <div style="font-size: 0.74rem; color: #38bdf8; font-family: var(--font-mono);" id="disp-resp-accum">Total: 0.000 mL O₂ consumed</div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">MANOMETER FLUID DISPLACEMENT</div>
              <div style="font-weight: 800; font-size: 1.25rem; color: #38bdf8; font-family: var(--font-mono);" id="disp-resp-shift">Δh = 0.0 mm</div>
              <div style="font-size: 0.74rem; color: #34d399; font-family: var(--font-mono);" id="disp-resp-rq">Respiratory Quotient RQ ≈ 1.00</div>
            </div>
          </div>

          <!-- Bottom Status Pill -->
          <div style="position: absolute; bottom: 12px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: center; pointer-events: none; font-family: var(--font-mono); font-size: 0.74rem; color: #94a3b8;">
            <span style="background: rgba(0,0,0,0.65); padding: 4px 10px; border-radius: 6px;" id="disp-resp-status">
              ⚡ Aerobic Cellular Respiration: KOH absorbs CO₂, creating net gas volume contraction
            </span>
            <span style="background: rgba(0,0,0,0.65); padding: 4px 10px; border-radius: 6px;">
              Bath Temp: <span id="disp-resp-temp">22.0 °C</span>
            </span>
          </div>
        </div>

        <!-- Controls & Rate Graph on Right -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <!-- Specimen Selection Card -->
          <div class="lab-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px;">
            <label style="font-size: 0.8rem; font-weight: 700; color: #fb923c; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">
              Biological Specimen &amp; Metabolic State
            </label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              <button class="btn btn-secondary btn-sm ${currentSpecimenKey === 'germinating_peas' ? 'active' : ''}" data-spec="germinating_peas" style="font-size: 0.72rem; padding: 7px; text-align: left;">
                🌱 Germinating Peas
              </button>
              <button class="btn btn-secondary btn-sm ${currentSpecimenKey === 'dormant_peas' ? 'active' : ''}" data-spec="dormant_peas" style="font-size: 0.72rem; padding: 7px; text-align: left;">
                🌰 Dormant (Dry) Peas
              </button>
              <button class="btn btn-secondary btn-sm ${currentSpecimenKey === 'glass_beads' ? 'active' : ''}" data-spec="glass_beads" style="font-size: 0.72rem; padding: 7px; text-align: left;">
                ⚪ Glass Beads (Control)
              </button>
              <button class="btn btn-secondary btn-sm ${currentSpecimenKey === 'yeast_fermentation' ? 'active' : ''}" data-spec="yeast_fermentation" style="font-size: 0.72rem; padding: 7px; text-align: left;">
                🧫 Yeast Fermentation
              </button>
            </div>
            <div style="margin-top: 8px; font-size: 0.76rem; color: #cbd5e1; background: rgba(0,0,0,0.25); padding: 6px 10px; border-radius: 6px;" id="disp-spec-desc">
              ${activeSpecimen.desc}
            </div>
          </div>

          <!-- Environmental Sliders -->
          <div class="lab-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px;">
            <label style="font-size: 0.8rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">
              Water Bath Temperature &amp; Chemical Scrubber
            </label>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              <!-- Temperature Slider -->
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>Water Bath Temperature</span>
                  <span style="color: #ec4899; font-weight: 700;" id="lbl-resp-temp">${temperature} °C</span>
                </div>
                <input type="range" id="slider-resp-temp" min="10" max="45" step="1" value="${temperature}" style="width: 100%; accent-color: #ec4899;">
              </div>

              <!-- KOH Scrubber Toggle -->
              <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.25); padding: 8px 12px; border-radius: 6px;">
                <div>
                  <div style="font-size: 0.78rem; font-weight: 700; color: #facc15;">15% KOH Pellets (CO₂ Absorber)</div>
                  <div style="font-size: 0.7rem; color: #94a3b8;">Absorbs CO₂: 2 KOH + CO₂ ➔ K₂CO₃(s) + H₂O</div>
                </div>
                <label style="cursor: pointer;">
                  <input type="checkbox" id="chk-koh-active" ${kohActive ? "checked" : ""} style="accent-color: #22c55e; width: 18px; height: 18px;">
                </label>
              </div>
            </div>
          </div>

          <!-- O2 Consumption vs Time Graph -->
          <div class="lab-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px; flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 0.8rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em;">
                Cumulative O₂ Consumption (mL vs Time)
              </span>
              <span style="font-size: 0.72rem; color: #94a3b8; font-family: var(--font-mono);">ΔV = Δh • π r²</span>
            </div>
            <canvas id="resp-graph-canvas" width="420" height="120" style="width: 100%; height: 120px; display: block; border-radius: 6px; background: #030712; border: 1px solid rgba(255,255,255,0.08);"></canvas>
          </div>
        </div>
      </div>

      <!-- Post-Lab Checkpoint Assessment -->
      <div id="resp-checkpoint-container" style="margin-top: 24px;"></div>
    </div>
  `;

  // Canvas References
  const canvas = container.querySelector("#respiration-canvas");
  const ctx = canvas.getContext("2d");
  const graphCanvas = container.querySelector("#resp-graph-canvas");
  const graphCtx = graphCanvas.getContext("2d");

  const logicalW = 580;
  const logicalH = 530;
  const graphLogicalW = 420;
  const graphLogicalH = 120;

  function setupHiDPICanvas() {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : Math.min(window.devicePixelRatio || 1, 2);
    if (canvas) {
      canvas.width = Math.round(logicalW * dpr);
      canvas.height = Math.round(logicalH * dpr);
    }
    if (graphCanvas) {
      graphCanvas.width = Math.round(graphLogicalW * dpr);
      graphCanvas.height = Math.round(graphLogicalH * dpr);
    }
  }

  setupHiDPICanvas();
  window.addEventListener("resize", setupHiDPICanvas);

  // DOM Elements
  const dispRate = container.querySelector("#disp-resp-rate");
  const dispAccum = container.querySelector("#disp-resp-accum");
  const dispShift = container.querySelector("#disp-resp-shift");
  const dispStatus = container.querySelector("#disp-resp-status");
  const dispTemp = container.querySelector("#disp-resp-temp");

  function resetAssay() {
    elapsedMinutes = 0.0;
    o2ConsumedTotal = 0.0;
    manometerShift = 0.0;
    timeSeries.length = 0;
    timeSeries.push({ t: 0, val: 0 });
  }
  resetAssay();

  // Kinetic rate calculation (Q10 temperature coefficient ~ 2.0 for cellular respiration)
  function getRate() {
    if (!kohActive && activeSpecimen.type === "aerobic") {
      // Without KOH, CO2 produced equals O2 consumed (RQ = 1.0), so net volume change is ZERO!
      return 0.0;
    }
    const tempCoeff = Math.pow(2.0, (temperature - 22) / 10);
    return activeSpecimen.baseRate * tempCoeff;
  }

  // 60 FPS HTML5 Simulation of Respirometer Chamber & Manometer
  function renderApparatus() {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : Math.min(window.devicePixelRatio || 1, 2);
    ctx.save();
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, logicalW, logicalH);

    simClock += 0.03;

    // 1. Heavy Laboratory Benchtop
    const benchY = 460;
    const benchGrad = ctx.createLinearGradient(0, benchY, 0, logicalH);
    benchGrad.addColorStop(0, "#334155");
    benchGrad.addColorStop(0.1, "#1e293b");
    benchGrad.addColorStop(1, "#0f172a");
    ctx.fillStyle = benchGrad;
    ctx.fillRect(0, benchY, logicalW, logicalH - benchY);

    ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, benchY);
    ctx.lineTo(logicalW, benchY);
    ctx.stroke();

    const CX = logicalW * 0.48;
    const CY = 270;

    // 2. Thermostatic Water Bath Tank (Polished Acrylic Container)
    const tankW = 340;
    const tankH = 230;
    const tankX = CX - tankW / 2;
    const tankY = CY - tankH / 2 + 25;

    // Shadow under water bath
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.beginPath();
    ctx.roundRect(tankX, tankY, tankW, tankH, 12);
    ctx.fill();
    ctx.restore();

    // Water fluid fill with caustics and thermal gradient
    const waterGrad = ctx.createLinearGradient(0, tankY, 0, tankY + tankH);
    waterGrad.addColorStop(0, "rgba(56, 189, 248, 0.22)");
    waterGrad.addColorStop(0.5, "rgba(14, 165, 233, 0.28)");
    waterGrad.addColorStop(1, "rgba(3, 105, 161, 0.38)");
    ctx.fillStyle = waterGrad;
    ctx.beginPath();
    ctx.roundRect(tankX, tankY + 15, tankW, tankH - 15, [0, 0, 10, 10]);
    ctx.fill();

    // Water Surface Meniscus with gentle thermal ripple
    const ripple = Math.sin(simClock * 2) * 2;
    ctx.strokeStyle = "rgba(186, 230, 253, 0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tankX + 4, tankY + 15 + ripple);
    ctx.bezierCurveTo(tankX + tankW * 0.33, tankY + 13 - ripple, tankX + tankW * 0.66, tankY + 17 + ripple, tankX + tankW - 4, tankY + 15 - ripple);
    ctx.stroke();

    // Tank Acrylic Walls & Bevels
    ctx.strokeStyle = "rgba(56, 189, 248, 0.65)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(tankX, tankY, tankW, tankH, 12);
    ctx.stroke();

    // Thermostatic Circulator Head on Tank Left Rim (x: tankX + 10, y: tankY - 30)
    const circX = tankX + 12;
    const circY = tankY - 35;
    ctx.fillStyle = "#334155";
    ctx.fillRect(circX, circY, 36, 45);
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(circX, circY, 36, 45);

    // Digital readout on circulator
    ctx.fillStyle = "#020617";
    ctx.fillRect(circX + 4, circY + 6, 28, 14);
    ctx.fillStyle = "#ec4899";
    ctx.font = "bold 8px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${temperature}°C`, circX + 18, circY + 16);

    // Submersible heating rod extending into water
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(circX + 14, circY + 45, 8, 90);

    // Tank Title Plaque
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`THERMOSTATIC WATER BATH (${temperature.toFixed(1)}°C CONSTANT)`, CX, tankY + tankH - 12);

    // 3. Experimental Respirometer Vial (Left)
    const vialW = 76;
    const vialH = 165;
    const vial1X = CX - 95;
    const vial1Y = CY - 48;

    // Glass body
    ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(vial1X - vialW / 2, vial1Y, vialW, vialH, [0, 0, 10, 10]);
    ctx.fill();
    ctx.stroke();

    // Neoprene Rubber Stopper
    const stopperGrad = ctx.createLinearGradient(vial1X - vialW / 2, 0, vial1X + vialW / 2, 0);
    stopperGrad.addColorStop(0, "#1e293b");
    stopperGrad.addColorStop(0.5, "#475569");
    stopperGrad.addColorStop(1, "#0f172a");
    ctx.fillStyle = stopperGrad;
    ctx.beginPath();
    ctx.roundRect(vial1X - vialW / 2 - 4, vial1Y - 14, vialW + 8, 16, 3);
    ctx.fill();

    // Brass capillary fitting through stopper
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(vial1X - 4, vial1Y - 20, 8, 8);

    // Vial Label Top
    ctx.fillStyle = "#fb923c";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.fillText("EXPERIMENTAL", vial1X, vial1Y + 18);

    // KOH Pellets at bottom of vial
    if (kohActive) {
      // Base layer of crystalline KOH pellets
      for (let i = 0; i < 8; i++) {
        const kx = vial1X - 24 + (i % 4) * 16;
        const ky = vial1Y + vialH - 10 - Math.floor(i / 4) * 12;
        ctx.beginPath();
        ctx.arc(kx, ky, 5.5, 0, Math.PI * 2);
        const kGrad = ctx.createRadialGradient(kx - 1, ky - 1, 1, kx, ky, 5.5);
        kGrad.addColorStop(0, "#ffffff");
        kGrad.addColorStop(0.7, "#f1f5f9");
        kGrad.addColorStop(1, "#94a3b8");
        ctx.fillStyle = kGrad;
        ctx.fill();
        ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.fillStyle = "#facc15";
      ctx.font = "bold 8px monospace";
      ctx.fillText("15% KOH PELLETS", vial1X, vial1Y + vialH - 2);
    }

    // Absorbent Cotton Barrier Cushion
    const cottonY = vial1Y + vialH - 46;
    ctx.fillStyle = "rgba(248, 250, 252, 0.85)";
    ctx.beginPath();
    ctx.roundRect(vial1X - vialW / 2 + 6, cottonY, vialW - 12, 14, 4);
    ctx.fill();
    ctx.fillStyle = "#64748b";
    ctx.font = "bold 7px sans-serif";
    ctx.fillText("NON-ABSORBENT COTTON", vial1X, cottonY + 10);

    // Living Specimen inside Experimental Vial
    if (activeSpecimen.type === "aerobic") {
      // Germinating Peas with radicles
      for (let i = 0; i < 9; i++) {
        const px = vial1X - 22 + (i % 3) * 22;
        const py = vial1Y + vialH - 68 - Math.floor(i / 3) * 20;

        // Cotyledon body
        ctx.beginPath();
        ctx.arc(px, py, 7.5, 0, Math.PI * 2);
        const pGrad = ctx.createRadialGradient(px - 2, py - 2, 1, px, py, 7.5);
        if (currentSpecimenKey === "germinating_peas") {
          pGrad.addColorStop(0, "#86efac");
          pGrad.addColorStop(0.6, "#22c55e");
          pGrad.addColorStop(1, "#15803d");
        } else {
          // Dormant dry peas
          pGrad.addColorStop(0, "#fde68a");
          pGrad.addColorStop(0.7, "#d97706");
          pGrad.addColorStop(1, "#78350f");
        }
        ctx.fillStyle = pGrad;
        ctx.fill();

        // Emerging germ rootlet
        if (currentSpecimenKey === "germinating_peas") {
          ctx.strokeStyle = "#f8fafc";
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(px, py + 2);
          ctx.quadraticCurveTo(px + 4, py + 10, px + 8, py + 14);
          ctx.stroke();

          // Metabolic O2 uptake glow
          if (isRunning) {
            ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(px, py, 11, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }
    } else if (activeSpecimen.type === "control") {
      // Glass beads: optical refractive spheres
      for (let i = 0; i < 9; i++) {
        const px = vial1X - 22 + (i % 3) * 22;
        const py = vial1Y + vialH - 68 - Math.floor(i / 3) * 20;
        ctx.beginPath();
        ctx.arc(px, py, 7.5, 0, Math.PI * 2);
        const bGrad = ctx.createRadialGradient(px - 2, py - 2, 1, px, py, 7.5);
        bGrad.addColorStop(0, "#ffffff");
        bGrad.addColorStop(0.5, "rgba(224, 242, 254, 0.8)");
        bGrad.addColorStop(1, "rgba(56, 189, 248, 0.4)");
        ctx.fillStyle = bGrad;
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    } else {
      // Yeast suspension with CO2 bubbles
      const yGrad = ctx.createLinearGradient(0, vial1Y + 35, 0, vial1Y + vialH - 20);
      yGrad.addColorStop(0, "rgba(251, 146, 60, 0.3)");
      yGrad.addColorStop(1, "rgba(217, 119, 6, 0.6)");
      ctx.fillStyle = yGrad;
      ctx.fillRect(vial1X - vialW / 2 + 5, vial1Y + 35, vialW - 10, vialH - 55);

      // Bubbles rising
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 8; i++) {
        const bx = vial1X - 22 + Math.sin(simClock * 3 + i * 2) * 22;
        const by = vial1Y + vialH - 30 - ((simClock * 35 + i * 20) % 95);
        ctx.beginPath();
        ctx.arc(bx, by, 2.5 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 4. Control Thermobarometer Vial (Right)
    const vial2X = CX + 95;
    ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(vial2X - vialW / 2, vial1Y, vialW, vialH, [0, 0, 10, 10]);
    ctx.fill();
    ctx.stroke();

    // Stopper
    ctx.fillStyle = stopperGrad;
    ctx.beginPath();
    ctx.roundRect(vial2X - vialW / 2 - 4, vial1Y - 14, vialW + 8, 16, 3);
    ctx.fill();

    // Brass capillary fitting
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(vial2X - 4, vial1Y - 20, 8, 8);

    // Control Label
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.fillText("THERMOBAROMETER", vial2X, vial1Y + 18);

    // Control glass beads in right vial
    for (let i = 0; i < 9; i++) {
      const px = vial2X - 22 + (i % 3) * 22;
      const py = vial1Y + vialH - 68 - Math.floor(i / 3) * 20;
      ctx.beginPath();
      ctx.arc(px, py, 7.5, 0, Math.PI * 2);
      const bGrad = ctx.createRadialGradient(px - 2, py - 2, 1, px, py, 7.5);
      bGrad.addColorStop(0, "#ffffff");
      bGrad.addColorStop(0.5, "rgba(224, 242, 254, 0.7)");
      bGrad.addColorStop(1, "rgba(56, 189, 248, 0.35)");
      ctx.fillStyle = bGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 5. Calibrated U-Tube Differential Manometer
    const tubeY = vial1Y - 55;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(vial1X, vial1Y - 14);
    ctx.lineTo(vial1X, tubeY);
    ctx.lineTo(vial2X, tubeY);
    ctx.lineTo(vial2X, vial1Y - 14);
    ctx.stroke();

    // Inner bore highlight
    ctx.strokeStyle = "rgba(15, 23, 42, 0.6)";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(vial1X, vial1Y - 14);
    ctx.lineTo(vial1X, tubeY);
    ctx.lineTo(vial2X, tubeY);
    ctx.lineTo(vial2X, vial1Y - 14);
    ctx.stroke();

    // Indicator Liquid Droplet inside Manometer
    const dropletMaxShift = 65; // pixels
    const dropPixelShift = Math.min(dropletMaxShift, (manometerShift / 20) * dropletMaxShift);
    const dropX = CX - dropPixelShift;

    // Red Brodie's Solution indicator dye slug
    ctx.fillStyle = "#ef4444";
    ctx.shadowColor = "#ef4444";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.roundRect(dropX - 12, tubeY - 3, 24, 6, 3);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Manometer mm scale graduations along top horizontal arm
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1;
    for (let gx = CX - 70; gx <= CX + 70; gx += 10) {
      ctx.beginPath();
      ctx.moveTo(gx, tubeY - 9);
      ctx.lineTo(gx, tubeY - 5);
      ctx.stroke();
    }

    // Fluid shift direction arrow
    ctx.fillStyle = "#facc15";
    ctx.font = "bold 10px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("FLUID SHIFT ⬅ (NET O₂ CONSUMPTION)", CX, tubeY - 14);

    ctx.restore();
  }

  // Render Time-Series Chart
  function renderChart() {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : Math.min(window.devicePixelRatio || 1, 2);
    graphCtx.save();
    graphCtx.resetTransform();
    graphCtx.scale(dpr, dpr);
    graphCtx.clearRect(0, 0, graphLogicalW, graphLogicalH);

    const padL = 40;
    const padB = 25;
    const padT = 15;
    const padR = 20;
    const plotW = graphLogicalW - padL - padR;
    const plotH = graphLogicalH - padT - padB;

    // Grid lines & Axes
    graphCtx.strokeStyle = "rgba(255,255,255,0.08)";
    graphCtx.lineWidth = 1;
    for (let f = 0.25; f <= 1.0; f += 0.25) {
      const gy = (graphLogicalH - padB) - f * plotH;
      graphCtx.beginPath();
      graphCtx.moveTo(padL, gy);
      graphCtx.lineTo(graphLogicalW - padR, gy);
      graphCtx.stroke();
    }

    graphCtx.strokeStyle = "rgba(255,255,255,0.2)";
    graphCtx.lineWidth = 1.5;
    graphCtx.beginPath();
    graphCtx.moveTo(padL, padT);
    graphCtx.lineTo(padL, graphLogicalH - padB);
    graphCtx.lineTo(graphLogicalW - padR, graphLogicalH - padB);
    graphCtx.stroke();

    if (timeSeries.length < 2) {
      graphCtx.restore();
      return;
    }

    const maxVal = Math.max(0.5, Math.max(...timeSeries.map(p => p.val)) * 1.15);
    const maxT = Math.max(5.0, timeSeries[timeSeries.length - 1].t);

    // Gradient fill under curve
    const fillGrad = graphCtx.createLinearGradient(0, padT, 0, graphLogicalH - padB);
    fillGrad.addColorStop(0, "rgba(251, 146, 60, 0.35)");
    fillGrad.addColorStop(1, "rgba(251, 146, 60, 0.0)");

    graphCtx.beginPath();
    graphCtx.moveTo(padL, graphLogicalH - padB);
    timeSeries.forEach((pt) => {
      const px = padL + (pt.t / maxT) * plotW;
      const py = (graphLogicalH - padB) - (pt.val / maxVal) * plotH;
      graphCtx.lineTo(px, py);
    });
    const lastPt = timeSeries[timeSeries.length - 1];
    const lastPx = padL + (lastPt.t / maxT) * plotW;
    graphCtx.lineTo(lastPx, graphLogicalH - padB);
    graphCtx.closePath();
    graphCtx.fillStyle = fillGrad;
    graphCtx.fill();

    // Plot stroke line
    graphCtx.strokeStyle = "#fb923c";
    graphCtx.lineWidth = 2.5;
    graphCtx.beginPath();
    timeSeries.forEach((pt, idx) => {
      const px = padL + (pt.t / maxT) * plotW;
      const py = (graphLogicalH - padB) - (pt.val / maxVal) * plotH;
      if (idx === 0) graphCtx.moveTo(px, py);
      else graphCtx.lineTo(px, py);
    });
    graphCtx.stroke();

    // Axis values
    graphCtx.fillStyle = "#94a3b8";
    graphCtx.font = "9px monospace";
    graphCtx.textAlign = "right";
    graphCtx.fillText(`${maxVal.toFixed(2)}mL`, padL - 4, padT + 8);
    graphCtx.fillText("0", padL - 4, graphLogicalH - padB);
    graphCtx.textAlign = "center";
    graphCtx.fillText("Time (minutes) ➔", graphLogicalW / 2, graphLogicalH - 6);

    graphCtx.restore();
  }

  // Animation Loop
  let lastTime = performance.now();
  let lastFrameTime = 0;
  let needsRedraw = true;

  function loop(currentTime) {
    if (!container || !container.isConnected) {
      if (animId) cancelAnimationFrame(animId);
      return;
    }

    const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
    lastTime = currentTime;

    const isSmart = (document.documentElement.getAttribute("data-mode") === "smartboard") ||
                    document.documentElement.classList.contains("fast-smartboard-mode") ||
                    /Android|MAXHUB/i.test(navigator.userAgent);
    const interval = isSmart ? 33.3 : 16.0;

    const photoOverlay = container.querySelector("#respiration-photo-overlay");
    const isPhotoOverlay = photoOverlay && photoOverlay.style.display === "block";

    if (!isPhotoOverlay) {
      if (isRunning) {
        if (!currentTime || currentTime - lastFrameTime >= interval) {
          lastFrameTime = currentTime;

          // Speed up clock so 1 real second = 0.2 experimental minutes
          const deltaMinutes = dt * 0.2;
          elapsedMinutes += deltaMinutes;

          const rate = getRate();
          const deltaO2 = rate * deltaMinutes;
          o2ConsumedTotal += deltaO2;
          manometerShift += deltaO2 * 28.5; // mm of fluid

          if (timeSeries.length === 0 || elapsedMinutes - timeSeries[timeSeries.length - 1].t >= 0.1) {
            timeSeries.push({ t: elapsedMinutes, val: o2ConsumedTotal });
            if (timeSeries.length > 180) timeSeries.shift();
          }

          dispRate.innerText = `${rate.toFixed(3)} mL O₂ / min`;
          dispAccum.innerText = `Total: ${o2ConsumedTotal.toFixed(3)} mL O₂ consumed`;
          dispShift.innerText = `Δh = ${manometerShift.toFixed(1)} mm`;
          dispTemp.innerText = `${temperature.toFixed(1)} °C`;

          if (!kohActive && activeSpecimen.type === "aerobic") {
            dispStatus.innerText = "⚠️ Zero Net Volume Change: KOH absent! CO₂ released equals O₂ consumed (RQ = 1.0).";
          } else if (activeSpecimen.type === "control") {
            dispStatus.innerText = "⚪ Inert Control: Zero metabolism, zero fluid displacement.";
          } else {
            dispStatus.innerText = `⚡ Active Respiration: Gas contraction rate = ${rate.toFixed(3)} mL/min.`;
          }

          renderApparatus();
          renderChart();
        }
      } else if (needsRedraw) {
        renderApparatus();
        renderChart();
        needsRedraw = false;
      }
    }

    animId = requestAnimationFrame(loop);
  }
  animId = requestAnimationFrame(loop);

  // --- EVENT LISTENERS ---
  const btnSim = container.querySelector("#view-mode-resp-sim");
  const btnPhoto = container.querySelector("#view-mode-resp-photo");
  const photoOverlay = container.querySelector("#respiration-photo-overlay");

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

  container.querySelector("#btn-resp-toggle-run")?.addEventListener("click", (e) => {
    isRunning = !isRunning;
    e.currentTarget.innerText = isRunning ? "⏸ Pause" : "▶ Resume";
    needsRedraw = true;
    SoundFX.playClick();
  });

  container.querySelector("#btn-resp-reset")?.addEventListener("click", () => {
    resetAssay();
    needsRedraw = true;
    SoundFX.playClick();
  });

  // Switch Specimen
  container.querySelectorAll("[data-spec]").forEach(btn => {
    btn.addEventListener("click", () => {
      container.querySelectorAll("[data-spec]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentSpecimenKey = btn.dataset.spec;
      activeSpecimen = SPECIMENS[currentSpecimenKey];
      container.querySelector("#disp-spec-desc").innerText = activeSpecimen.desc;
      resetAssay();
      SoundFX.playClick();
    });
  });

  // Sliders
  container.querySelector("#slider-resp-temp")?.addEventListener("input", (e) => {
    temperature = parseInt(e.target.value, 10);
    container.querySelector("#lbl-resp-temp").innerText = `${temperature} °C`;
    needsRedraw = true;
  });

  container.querySelector("#chk-koh-active")?.addEventListener("change", (e) => {
    kohActive = e.target.checked;
    needsRedraw = true;
    SoundFX.playSwitchSnap();
  });

  // Export CSV
  container.querySelector("#btn-resp-export")?.addEventListener("click", () => {
    const rate = getRate();
    exportLabDataCsv({
      title: "Cellular Respiration & Micro-Respirometer Telemetry",
      labId: "respiration",
      parameters: {
        "Biological Specimen": activeSpecimen.name,
        "Metabolic Type": activeSpecimen.type.toUpperCase(),
        "Water Bath Temperature (°C)": temperature,
        "KOH Present": kohActive ? "Yes" : "No",
        "Respiration Rate (mL O2/min)": rate.toFixed(4),
        "Total O2 Consumed (mL)": o2ConsumedTotal.toFixed(3),
        "Elapsed Time (min)": elapsedMinutes.toFixed(2)
      },
      headers: ["Time (min)", "Cumulative O2 (mL)"],
      dataRows: timeSeries.map(p => [p.t.toFixed(2), p.val.toFixed(4)])
    });
  });

  // Standardized Hotkey: 'e' or 'E' triggers CSV telemetry export
  const handleKeyDown = (e) => {
    if ((e.key === "e" || e.key === "E") && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      container.querySelector("#btn-resp-export")?.click();
    }
  };
  window.addEventListener("keydown", handleKeyDown);

  // Mount Post-Lab Checkpoint Assessment
  mountLabCheckpoint("resp-checkpoint-container", "respiration");

  return () => {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("resize", setupHiDPICanvas);
  };
}
