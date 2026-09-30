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
            C_6H_{12}O_6 + 6 O_2 \\to 6 CO_2 + 6 H_2O • KOH CO₂ Absorption
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
          <button class="btn btn-secondary btn-sm" id="btn-resp-export" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export Telemetry
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
            <img src="assets/labs/respiration_bench.jpg" alt="4K Cellular Respiration & Respirometer Laboratory Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            
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
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Bench Surface
    const benchY = 460;
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, benchY, W, H - benchY);
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, benchY);
    ctx.lineTo(W, benchY);
    ctx.stroke();

    const CX = W * 0.48;
    const CY = 270;

    // --- WATER BATH CHAMBER (Outer Glass Tank) ---
    const tankW = 320;
    const tankH = 220;
    const tankX = CX - tankW/2;
    const tankY = CY - tankH/2 + 30;

    ctx.fillStyle = "rgba(56, 189, 248, 0.18)";
    ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(tankX, tankY, tankW, tankH, [0, 0, 10, 10]);
    ctx.fill();
    ctx.stroke();

    // Water Bath Label
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`THERMOSTATIC WATER BATH (${temperature}°C)`, CX, tankY + tankH - 12);

    // --- EXPERIMENTAL RESPIROMETER VIAL (Left) ---
    const vialW = 75;
    const vialH = 160;
    const vial1X = CX - 100;
    const vial1Y = CY - 50;

    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(vial1X - vialW/2, vial1Y, vialW, vialH, [0, 0, 10, 10]);
    ctx.fill();
    ctx.stroke();

    // Rubber Stopper
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(vial1X - vialW/2 - 4, vial1Y - 14, vialW + 8, 14);

    // KOH Pellets at bottom of vial
    if (kohActive) {
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(vial1X - 20 + (i % 3) * 20, vial1Y + vialH - 12 - Math.floor(i / 3) * 12, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#facc15";
      ctx.font = "8px monospace";
      ctx.fillText("KOH", vial1X, vial1Y + vialH - 2);
    }

    // Absorbent Cotton Barrier
    ctx.fillStyle = "rgba(241, 245, 249, 0.75)";
    ctx.fillRect(vial1X - vialW/2 + 6, vial1Y + vialH - 45, vialW - 12, 14);

    // Living Specimen (Germinating Peas or Beads)
    if (activeSpecimen.type === "aerobic") {
      ctx.fillStyle = "#4ade80"; // pea green
      for (let i = 0; i < 8; i++) {
        const px = vial1X - 22 + (i % 3) * 20;
        const py = vial1Y + vialH - 65 - Math.floor(i / 3) * 18;
        ctx.beginPath();
        ctx.arc(px, py, 7, 0, Math.PI * 2);
        ctx.fill();
        // Sprout rootlet
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + 4, py - 6);
        ctx.stroke();
      }
    } else if (activeSpecimen.type === "control") {
      ctx.fillStyle = "rgba(255,255,255,0.7)"; // glass beads
      for (let i = 0; i < 8; i++) {
        const px = vial1X - 22 + (i % 3) * 20;
        const py = vial1Y + vialH - 65 - Math.floor(i / 3) * 18;
        ctx.beginPath();
        ctx.arc(px, py, 7, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Yeast suspension with CO2 bubbles
      ctx.fillStyle = "rgba(251, 146, 60, 0.4)";
      ctx.fillRect(vial1X - vialW/2 + 6, vial1Y + 40, vialW - 12, vialH - 50);
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 6; i++) {
        const bx = vial1X - 20 + Math.sin(elapsedMinutes * 50 + i * 2) * 20;
        const by = vial1Y + vialH - 40 - ((elapsedMinutes * 120 + i * 25) % 80);
        ctx.beginPath();
        ctx.arc(bx, by, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // --- CONTROL VIAL (Right) ---
    const vial2X = CX + 100;
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(vial2X - vialW/2, vial1Y, vialW, vialH, [0, 0, 10, 10]);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#1e293b";
    ctx.fillRect(vial2X - vialW/2 - 4, vial1Y - 14, vialW + 8, 14);

    // Control glass beads in right vial
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    for (let i = 0; i < 8; i++) {
      const px = vial2X - 22 + (i % 3) * 20;
      const py = vial1Y + vialH - 65 - Math.floor(i / 3) * 18;
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- CONNECTING U-TUBE MANOMETER ---
    const tubeY = vial1Y - 45;
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(vial1X, vial1Y);
    ctx.lineTo(vial1X, tubeY);
    ctx.lineTo(vial2X, tubeY);
    ctx.lineTo(vial2X, vial1Y);
    ctx.stroke();

    // Indicator Liquid Droplet inside Manometer
    // Moves towards the experimental vial (left) as pressure inside vial 1 drops
    const dropletMaxShift = 50; // pixels
    const dropPixelShift = Math.min(dropletMaxShift, (manometerShift / 20) * dropletMaxShift);
    const dropX = CX - dropPixelShift;

    ctx.fillStyle = "#ef4444"; // Red indicator dye
    ctx.beginPath();
    ctx.roundRect(dropX - 10, tubeY - 4, 20, 8, 4);
    ctx.fill();

    // Direction arrow on tube
    ctx.fillStyle = "#facc15";
    ctx.font = "bold 9px system-ui";
    ctx.fillText("FLUID SHIFT ⬅", CX, tubeY - 8);
  }

  // Render Time-Series Chart
  function renderChart() {
    const W = graphCanvas.width;
    const H = graphCanvas.height;
    graphCtx.clearRect(0, 0, W, H);

    const padL = 40;
    const padB = 25;
    const padT = 15;
    const padR = 20;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    graphCtx.strokeStyle = "rgba(255,255,255,0.15)";
    graphCtx.lineWidth = 1;
    graphCtx.beginPath();
    graphCtx.moveTo(padL, padT);
    graphCtx.lineTo(padL, H - padB);
    graphCtx.lineTo(W - padR, H - padB);
    graphCtx.stroke();

    if (timeSeries.length < 2) return;

    const maxVal = Math.max(0.5, Math.max(...timeSeries.map(p => p.val)) * 1.15);
    const maxT = Math.max(5.0, timeSeries[timeSeries.length - 1].t);

    graphCtx.strokeStyle = "#fb923c";
    graphCtx.lineWidth = 2.5;
    graphCtx.beginPath();

    timeSeries.forEach((pt, idx) => {
      const px = padL + (pt.t / maxT) * plotW;
      const py = (H - padB) - (pt.val / maxVal) * plotH;
      if (idx === 0) graphCtx.moveTo(px, py);
      else graphCtx.lineTo(px, py);
    });
    graphCtx.stroke();

    graphCtx.fillStyle = "#94a3b8";
    graphCtx.font = "9px monospace";
    graphCtx.textAlign = "right";
    graphCtx.fillText(`${maxVal.toFixed(2)}mL`, padL - 4, padT + 8);
    graphCtx.fillText("0", padL - 4, H - padB);
    graphCtx.textAlign = "center";
    graphCtx.fillText("Time (minutes) ➔", W / 2, H - 6);
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

  // Mount Post-Lab Checkpoint Assessment
  mountLabCheckpoint("resp-checkpoint-container", "respiration");

  return () => {
    if (animId) cancelAnimationFrame(animId);
  };
}
