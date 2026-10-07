// Edugates-ClipSAT Science Labs - Biology: Plant Transpiration, Potometer & Stomatal Dynamics Suite
// 60 FPS Precision Plant Physiology Simulation:
// Ganong capillary potometer water uptake rate (µL/min),
// Stomatal aperture dynamics & guard cell osmotic turgor pressure (ΔΨp),
// Fick's law of vapor diffusion E = gs · VPD,
// Environmental chamber controls: PAR light intensity, Relative Humidity (RH%), Wind boundary layer, Temperature.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initPlantTranspirationLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return () => {};

  // Plant Species Database
  const PLANT_SPECIES = {
    bean: {
      name: "Common Bean (Phaseolus vulgaris)",
      type: "C3 Mesophyte",
      leafAreaCm2: 120.0,
      maxStomatalConductance: 0.35, // mol/(m²·s)
      description: "Typical temperate C3 dicot. High stomatal sensitivity to atmospheric vapor pressure deficit (VPD)."
    },
    maize: {
      name: "Corn / Maize (Zea mays)",
      type: "C4 Monocot",
      leafAreaCm2: 180.0,
      maxStomatalConductance: 0.22,
      description: "High water-use efficiency C4 grass. Stomata partially close at high light without sacrificing CO₂ assimilation."
    },
    cam: {
      name: "Jade Plant (Crassula ovata)",
      type: "CAM Succulent",
      leafAreaCm2: 65.0,
      maxStomatalConductance: 0.06,
      description: "Inverted CAM stomatal rhythm. Stomata remain tightly closed during daylight to conserve water in arid habitats."
    }
  };

  // State Variables
  let currentPlantKey = "bean";
  let lightPAR = 1200; // µmol/(m²·s) (0 to 2000)
  let relativeHumidity = 45; // % (20 to 95)
  let ambientTempC = 25; // °C (10 to 40)
  let windSpeedMs = 2.0; // m/s (0 to 8.0)
  let bubblePositionMm = 15; // 0 to 100 mm along capillary
  let isSimRunning = true;
  let viewMode = "sim"; // "sim" or "photo"
  let animId = null;
  let timeTick = 0;

  // Stomatal aperture and transpiration calculations
  // Saturated vapor pressure (Tetens equation)
  function calculateTranspiration() {
    const plant = PLANT_SPECIES[currentPlantKey];

    // Saturation vapor pressure es in kPa
    const es = 0.61078 * Math.exp((17.27 * ambientTempC) / (ambientTempC + 237.3));
    // Actual vapor pressure ea
    const ea = es * (relativeHumidity / 100);
    // Vapor Pressure Deficit VPD = es - ea
    const vpd = Math.max(0.1, es - ea);

    // Stomatal aperture fraction (0.05 closed to 1.0 wide open)
    let stomatalOpenFrac = 0.1;
    if (currentPlantKey === "cam") {
      // In daylight, CAM closes stomata
      stomatalOpenFrac = 0.05 + 0.1 * (1 - lightPAR / 2000);
    } else {
      // C3 / C4: Light opens stomata; extreme VPD or heat causes hydroactive closure
      const lightFactor = Math.min(1.0, lightPAR / 800);
      const vpdFactor = Math.max(0.2, 1.0 - Math.max(0, vpd - 2.0) * 0.25);
      stomatalOpenFrac = 0.08 + 0.92 * lightFactor * vpdFactor;
    }

    // Boundary layer conductance gb increases with wind speed sqrt(wind)
    const gb = 0.15 + 0.45 * Math.sqrt(Math.max(0.1, windSpeedMs));
    // Stomatal conductance gs
    const gs = plant.maxStomatalConductance * stomatalOpenFrac;
    // Total leaf conductance g_tot = (1/gs + 1/gb)^-1
    const gTot = 1 / (1 / Math.max(1e-4, gs) + 1 / Math.max(1e-4, gb));

    // Transpiration Rate E (mmol / (m²·s)) = g_tot * (VPD / Patm)
    // Scaled for potometer capillary uptake in µL/min
    const transpirationRateUlMin = Math.max(0.05, gTot * vpd * (plant.leafAreaCm2 / 100) * 8.5);

    return {
      vpd,
      stomatalOpenFrac,
      gs,
      transpirationRateUlMin,
      bubbleVelocityMmSec: transpirationRateUlMin * 0.18
    };
  }

  // Telemetry buffer
  const timeSeries = [];
  function recordTelemetry() {
    const { vpd, stomatalOpenFrac, transpirationRateUlMin } = calculateTranspiration();
    timeSeries.push({
      time: parseFloat((timeTick * 2).toFixed(1)),
      transpiration: parseFloat(transpirationRateUlMin.toFixed(2)),
      stomatalOpen: parseFloat((stomatalOpenFrac * 100).toFixed(1)),
      vpd: parseFloat(vpd.toFixed(2))
    });
    if (timeSeries.length > 50) timeSeries.shift();
  }

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #10b981; box-shadow: 0 0 10px #10b981;"></span>
            Plant Transpiration, Potometer &amp; Stomatal Dynamics
          </span>
          <span class="badge" style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            E = g_s · VPD • Capillary Meniscus Tracker
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-transp-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🌿 Potometer Rig
            </button>
            <button id="view-mode-transp-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-transp-reset-bubble" style="padding: 5px 14px; font-size: 0.78rem;">
            🫧 Reset Air Bubble (Zero)
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-transp-export" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export Transpiration CSV
          </button>
        </div>
      </div>

      <!-- Main Layout Grid -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="transp-layout">
        <!-- Canvas Viewport -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(16, 185, 129, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #064e3b 0%, #022c22 45%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="transp-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Real Laboratory Photograph Overlay -->
          <div id="transp-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <img src="assets/labs/transpiration_bench.jpg" alt="4K Research Ganong Potometer & Plant Transpiration Chamber" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Capillary Tube Bore</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">0.8 mm Precision Glass</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Environmental Sensor</div>
                <div style="color: #facc15; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">VPD Hygrometer &amp; PAR Meter</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Microscopic Monitor</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">In Situ Epidermal Porometer</div>
              </div>
            </div>
          </div>

          <!-- Top HUD -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">TRANSPIRATION WATER UPTAKE RATE</div>
              <div id="hud-transp-rate" style="font-size: 1.12rem; font-weight: 800; color: #34d399; font-family: var(--font-mono);">
                3.42 µL/min (0.61 mm/s)
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">STOMATAL APERTURE &amp; VPD</div>
              <div id="hud-transp-vpd" style="font-size: 1.12rem; font-weight: 800; color: #38bdf8; font-family: var(--font-mono);">
                Aperture: 82% • VPD: 1.74 kPa
              </div>
            </div>
          </div>
        </div>

        <!-- Controls & Environmental Chamber Side -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Controls Panel -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #34d399; text-transform: uppercase; margin-bottom: 12px;">Plant Sample &amp; Microclimate Chamber</div>
            
            <div style="margin-bottom: 12px;">
              <label style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Shoot Plant Species</label>
              <select id="select-plant-species" class="form-control" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                ${Object.entries(PLANT_SPECIES).map(([k, p]) => `<option value="${k}" ${k === currentPlantKey ? "selected" : ""}>${p.name} (${p.type})</option>`).join("")}
              </select>
            </div>

            <!-- Light & Humidity Sliders -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                  <span style="color: #94a3b8;">Light (PAR)</span>
                  <span id="lbl-light-par" style="color: #fbbf24; font-weight: 700;">1200 µmol</span>
                </div>
                <input id="slider-light-par" type="range" min="0" max="2000" step="50" value="1200" style="width: 100%; accent-color: #fbbf24;">
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                  <span style="color: #94a3b8;">Relative Humidity</span>
                  <span id="lbl-rel-humidity" style="color: #38bdf8; font-weight: 700;">45% RH</span>
                </div>
                <input id="slider-rel-humidity" type="range" min="20" max="95" step="1" value="45" style="width: 100%; accent-color: #38bdf8;">
              </div>
            </div>

            <!-- Wind & Temperature Sliders -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 8px;">
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                  <span style="color: #94a3b8;">Fan Wind Speed</span>
                  <span id="lbl-wind-speed" style="color: #34d399; font-weight: 700;">2.0 m/s</span>
                </div>
                <input id="slider-wind-speed" type="range" min="0" max="8.0" step="0.5" value="2.0" style="width: 100%; accent-color: #34d399;">
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                  <span style="color: #94a3b8;">Ambient Temp</span>
                  <span id="lbl-ambient-temp" style="color: #f43f5e; font-weight: 700;">25.0 °C</span>
                </div>
                <input id="slider-ambient-temp" type="range" min="10" max="40" step="1" value="25" style="width: 100%; accent-color: #f43f5e;">
              </div>
            </div>
          </div>

          <!-- Stomatal Aperture Microscopic Inset & Chart -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div style="font-size: 0.75rem; font-weight: 700; color: #38bdf8; text-transform: uppercase;">Real-Time Transpiration Telemetry</div>
              <span id="transp-status-badge" class="badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; font-size: 0.68rem; padding: 2px 8px; border-radius: 6px;">
                Active Transpiration
              </span>
            </div>
            
            <div style="background: #030712; border: 1px solid #1e293b; border-radius: 8px; padding: 10px;">
              <canvas id="transp-chart-canvas" width="400" height="90" style="width: 100%; height: 90px; display: block; border-radius: 4px;"></canvas>
            </div>

            <!-- Stoma Botanical Anatomy Note -->
            <div id="plant-botany-note" style="margin-top: 10px; font-size: 0.74rem; color: #94a3b8; line-height: 1.4; background: rgba(0,0,0,0.25); border-radius: 6px; padding: 8px 12px;">
              Guard cells accumulate K⁺ and malate²⁻ ions, driving osmotic endosmosis and increasing turgor pressure to bow open the stomatal aperture.
            </div>
          </div>

          <!-- Post-Lab Checkpoint Container -->
          <div id="transp-checkpoint-container"></div>
        </div>
      </div>
    </div>
  `;

  // Attach Checkpoint
  mountLabCheckpoint("transp-checkpoint-container", "transpiration");

  // DOM Elements
  const canvas = document.getElementById("transp-canvas");
  const ctx = canvas.getContext("2d");
  const chartCanvas = document.getElementById("transp-chart-canvas");
  const chartCtx = chartCanvas.getContext("2d");

  const viewSimBtn = document.getElementById("view-mode-transp-sim");
  const viewPhotoBtn = document.getElementById("view-mode-transp-photo");
  const photoOverlay = document.getElementById("transp-photo-overlay");

  const btnResetBubble = document.getElementById("btn-transp-reset-bubble");
  const btnExport = document.getElementById("btn-transp-export");

  const selectPlant = document.getElementById("select-plant-species");
  const sliderLight = document.getElementById("slider-light-par");
  const sliderRH = document.getElementById("slider-rel-humidity");
  const sliderWind = document.getElementById("slider-wind-speed");
  const sliderTemp = document.getElementById("slider-ambient-temp");

  const lblLight = document.getElementById("lbl-light-par");
  const lblRH = document.getElementById("lbl-rel-humidity");
  const lblWind = document.getElementById("lbl-wind-speed");
  const lblTemp = document.getElementById("lbl-ambient-temp");

  const hudRate = document.getElementById("hud-transp-rate");
  const hudVpd = document.getElementById("hud-transp-vpd");
  const botanyNote = document.getElementById("plant-botany-note");

  function updateHUD() {
    const { vpd, stomatalOpenFrac, transpirationRateUlMin, bubbleVelocityMmSec } = calculateTranspiration();
    const plant = PLANT_SPECIES[currentPlantKey];

    hudRate.textContent = `${transpirationRateUlMin.toFixed(2)} µL/min (${bubbleVelocityMmSec.toFixed(2)} mm/s)`;
    hudVpd.textContent = `Aperture: ${Math.round(stomatalOpenFrac * 100)}% • VPD: ${vpd.toFixed(2)} kPa`;

    botanyNote.textContent = plant.description;
  }

  // Draw Real-Time Telemetry Graph
  function renderChart() {
    const w = chartCanvas.width;
    const h = chartCanvas.height;
    chartCtx.clearRect(0, 0, w, h);

    chartCtx.fillStyle = "#09090b";
    chartCtx.fillRect(0, 0, w, h);

    // Grid lines
    chartCtx.strokeStyle = "#1e293b";
    chartCtx.lineWidth = 1;
    for (let y = 20; y < h; y += 25) {
      chartCtx.beginPath();
      chartCtx.moveTo(0, y);
      chartCtx.lineTo(w, y);
      chartCtx.stroke();
    }

    if (timeSeries.length < 2) return;

    // Plot Transpiration Curve (Green)
    chartCtx.strokeStyle = "#10b981";
    chartCtx.lineWidth = 2;
    chartCtx.beginPath();
    const maxRate = 8.0;
    timeSeries.forEach((pt, idx) => {
      const px = (idx / (timeSeries.length - 1)) * (w - 20) + 10;
      const py = h - 10 - (pt.transpiration / maxRate) * (h - 20);
      if (idx === 0) chartCtx.moveTo(px, py);
      else chartCtx.lineTo(px, py);
    });
    chartCtx.stroke();

    // Latest value label
    const last = timeSeries[timeSeries.length - 1];
    chartCtx.fillStyle = "#34d399";
    chartCtx.font = "bold 9px 'JetBrains Mono', monospace";
    chartCtx.textAlign = "right";
    chartCtx.fillText(`Water Uptake: ${last.transpiration} µL/min`, w - 10, 16);
  }

  // 60 FPS Canvas Render Loop
  function renderPotometerCanvas() {
    if (!container || !container.isConnected) return;
    timeTick += 0.035;
    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);

    const { bubbleVelocityMmSec, stomatalOpenFrac } = calculateTranspiration();

    // Advance bubble along capillary
    bubblePositionMm += bubbleVelocityMmSec * 0.035;
    if (bubblePositionMm > 95) bubblePositionMm = 5; // loop

    if (Math.floor(timeTick * 30) % 15 === 0) {
      recordTelemetry();
    }

    // 1. Lab Workbench
    const benchY = 440;
    const benchGrad = ctx.createLinearGradient(0, benchY, 0, ch);
    benchGrad.addColorStop(0, "#1e293b");
    benchGrad.addColorStop(1, "#020617");
    ctx.fillStyle = benchGrad;
    ctx.fillRect(0, benchY, cw, ch - benchY);

    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, benchY);
    ctx.lineTo(cw, benchY);
    ctx.stroke();

    // 2. Ganong Potometer Apparatus
    // Vertical water reservoir tube holding leafy shoot
    const tubeX = 140;
    const tubeY = 220;
    const tubeW = 32;
    const tubeH = 180;

    // Glass Vertical Tube
    ctx.save();
    ctx.fillStyle = "rgba(56, 189, 248, 0.25)";
    ctx.fillRect(tubeX - tubeW / 2, tubeY, tubeW, tubeH);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 2;
    ctx.strokeRect(tubeX - tubeW / 2, tubeY, tubeW, tubeH);

    // Rubber Bung Seal at Top
    ctx.fillStyle = "#334155";
    ctx.beginPath();
    ctx.ellipse(tubeX, tubeY, tubeW / 2 + 2, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#475569";
    ctx.stroke();

    // 3. Cut Leafy Shoot Stem emerging from bung
    ctx.strokeStyle = "#16a34a";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(tubeX, tubeY + 40);
    ctx.bezierCurveTo(tubeX - 5, tubeY - 40, tubeX + 15, tubeY - 90, tubeX + 10, tubeY - 150);
    ctx.stroke();

    // Foliage Leaves
    const leafCount = 7;
    for (let l = 0; l < leafCount; l++) {
      const lx = tubeX + (l % 2 === 0 ? -30 : 35);
      const ly = tubeY - 60 - l * 15;
      ctx.save();
      ctx.fillStyle = "#22c55e";
      ctx.beginPath();
      ctx.ellipse(lx, ly, 22, 10, (l % 2 === 0 ? -0.5 : 0.5), 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#15803d";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    // 4. Horizontal Graduated Capillary Tube with Moving Air Bubble
    const capX = tubeX + tubeW / 2;
    const capY = tubeY + tubeH - 20;
    const capLen = 340;
    const capH = 10;

    // Water column in capillary
    ctx.fillStyle = "rgba(56, 189, 248, 0.35)";
    ctx.fillRect(capX, capY, capLen, capH);

    // Glass Capillary Walls
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 2;
    ctx.strokeRect(capX, capY, capLen, capH);

    // Millimeter Calibration Marks
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#64748b";
    ctx.font = "8px 'JetBrains Mono', monospace";
    for (let mm = 0; mm <= 100; mm += 10) {
      const markX = capX + (mm / 100) * capLen;
      ctx.beginPath();
      ctx.moveTo(markX, capY + capH);
      ctx.lineTo(markX, capY + capH + (mm % 20 === 0 ? 8 : 4));
      ctx.stroke();
      if (mm % 20 === 0) {
        ctx.fillText(`${mm}`, markX - 5, capY + capH + 18);
      }
    }

    // Meniscus Air Bubble
    const bubblePx = capX + (bubblePositionMm / 100) * capLen;
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(bubblePx, capY + capH / 2, 7, capH / 2 - 1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bubble Tracking Pointer Tag
    ctx.fillStyle = "#facc15";
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(`▼ Meniscus (${bubblePositionMm.toFixed(1)} mm)`, bubblePx, capY - 6);
    ctx.restore();

    // 5. Microscopic Inset: Stomatal Pore & Guard Cell Anatomy
    const stomaX = cw - 120;
    const stomaY = 120;
    const stomaR = 65;

    ctx.save();
    // Microscope circular lens bezel
    ctx.beginPath();
    ctx.arc(stomaX, stomaY, stomaR, 0, Math.PI * 2);
    ctx.fillStyle = "#022c22";
    ctx.fill();
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Lens reticle grid
    ctx.strokeStyle = "rgba(16, 185, 129, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(stomaX - stomaR, stomaY);
    ctx.lineTo(stomaX + stomaR, stomaY);
    ctx.moveTo(stomaX, stomaY - stomaR);
    ctx.lineTo(stomaX, stomaY + stomaR);
    ctx.stroke();

    // Two Kidney-Shaped Guard Cells bowing open
    const apertureW = 2 + stomatalOpenFrac * 16;
    ctx.fillStyle = "#22c55e";
    ctx.strokeStyle = "#15803d";
    ctx.lineWidth = 2;

    // Left Guard Cell
    ctx.beginPath();
    ctx.ellipse(stomaX - apertureW / 2 - 8, stomaY, 12, 32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right Guard Cell
    ctx.beginPath();
    ctx.ellipse(stomaX + apertureW / 2 + 8, stomaY, 12, 32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Stomatal Aperture Hole (Dark opening)
    ctx.fillStyle = "#020617";
    ctx.beginPath();
    ctx.ellipse(stomaX, stomaY, apertureW / 2, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Microscope Label
    ctx.fillStyle = "#34d399";
    ctx.font = "bold 8px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("STOMATA 400×", stomaX, stomaY + stomaR - 10);
    ctx.restore();

    renderChart();
    animId = requestAnimationFrame(renderPotometerCanvas);
  }

  // Event Listeners
  selectPlant.addEventListener("change", (e) => {
    currentPlantKey = e.target.value;
    SoundFX.droplet();
    updateHUD();
  });

  sliderLight.addEventListener("input", (e) => {
    lightPAR = parseFloat(e.target.value);
    lblLight.textContent = `${lightPAR} µmol`;
    updateHUD();
  });

  sliderRH.addEventListener("input", (e) => {
    relativeHumidity = parseFloat(e.target.value);
    lblRH.textContent = `${relativeHumidity}% RH`;
    updateHUD();
  });

  sliderWind.addEventListener("input", (e) => {
    windSpeedMs = parseFloat(e.target.value);
    lblWind.textContent = `${windSpeedMs.toFixed(1)} m/s`;
    updateHUD();
  });

  sliderTemp.addEventListener("input", (e) => {
    ambientTempC = parseFloat(e.target.value);
    lblTemp.textContent = `${ambientTempC.toFixed(1)} °C`;
    updateHUD();
  });

  btnResetBubble.addEventListener("click", () => {
    bubblePositionMm = 5;
    SoundFX.snap();
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
    const { vpd, stomatalOpenFrac, gs, transpirationRateUlMin } = calculateTranspiration();
    const plant = PLANT_SPECIES[currentPlantKey];

    exportLabDataCsv({
      title: "Plant Transpiration & Stomatal Dynamics Lab",
      labId: "transpiration",
      parameters: {
        "Plant Species": plant.name,
        "Photosynthetic Pathway": plant.type,
        "Leaf Surface Area": `${plant.leafAreaCm2} cm²`,
        "Light Intensity (PAR)": `${lightPAR} µmol/(m²·s)`,
        "Relative Humidity": `${relativeHumidity}%`,
        "Ambient Temperature": `${ambientTempC} °C`,
        "Wind Boundary Speed": `${windSpeedMs} m/s`,
        "Vapor Pressure Deficit (VPD)": `${vpd.toFixed(3)} kPa`,
        "Stomatal Aperture": `${(stomatalOpenFrac * 100).toFixed(1)}%`
      },
      headers: ["Elapsed Time (s)", "Transpiration Rate (µL/min)", "Stomatal Aperture (%)", "VPD (kPa)"],
      dataRows: timeSeries.map(pt => [
        pt.time,
        pt.transpiration,
        pt.stomatalOpen,
        pt.vpd
      ])
    });
    SoundFX.success();
  });

  // Start Animation Loop
  updateHUD();
  animId = requestAnimationFrame(renderPotometerCanvas);

  return function cleanupPlantTranspirationLab() {
    if (animId) cancelAnimationFrame(animId);
  };
}

export const initTranspirationLab = initPlantTranspirationLab;
