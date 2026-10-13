// Edugates-ClipSAT Science Labs - Chemistry: Colligative Properties Suite
// 60 FPS Precision Thermal Phase Equilibrium Simulation:
// Freezing Point Depression (ΔT_f = i · K_f · m), Boiling Point Elevation (ΔT_b = i · K_b · m),
// Particle Van 't Hoff Factor i, Solute Dissociation, and Cooling Curve Kinetics.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initColligativeLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Solvents Library
  const SOLVENTS = {
    water: { name: "Pure Water (H₂O)", kf: 1.86, kb: 0.512, tf0: 0.0, tb0: 100.0, color: "rgba(56, 189, 248, 0.45)", liquidColor: "#0284c7" },
    cyclohexane: { name: "Cyclohexane (C₆H₁₂)", kf: 20.0, kb: 2.79, tf0: 6.5, tb0: 80.7, color: "rgba(168, 85, 247, 0.35)", liquidColor: "#9333ea" },
    ethanol: { name: "Ethanol (C₂H₅OH)", kf: 1.99, kb: 1.22, tf0: -114.1, tb0: 78.4, color: "rgba(16, 185, 129, 0.35)", liquidColor: "#059669" }
  };

  // Solutes Library with van 't Hoff factor i
  const SOLUTES = {
    nacl: { name: "Sodium Chloride (NaCl)", iTheo: 2, iExp: 1.90, molarMass: 58.44, cation: "Na⁺", anion: "Cl⁻", colorCat: "#a855f7", colorAn: "#10b981" },
    cacl2: { name: "Calcium Chloride (CaCl₂)", iTheo: 3, iExp: 2.70, molarMass: 110.98, cation: "Ca²⁺", anion: "Cl⁻", colorCat: "#f59e0b", colorAn: "#10b981" },
    glucose: { name: "Glucose (C₆H₁₂O₆)", iTheo: 1, iExp: 1.00, molarMass: 180.16, cation: "Molecule", anion: "", colorCat: "#38bdf8", colorAn: "" },
    sucrose: { name: "Sucrose (C₁₂H₂₂O₁₁)", iTheo: 1, iExp: 1.00, molarMass: 342.30, cation: "Molecule", anion: "", colorCat: "#f43f5e", colorAn: "" },
    alcl3: { name: "Aluminum Chloride (AlCl₃)", iTheo: 4, iExp: 3.40, molarMass: 133.34, cation: "Al³⁺", anion: "Cl⁻", colorCat: "#ec4899", colorAn: "#10b981" }
  };

  // State
  let solventKey = "water";
  let soluteKey = "nacl";
  let molality = 1.00; // mol/kg
  let bathMode = "cooling"; // "cooling" or "heating"
  let bathTemp = -15.0; // °C
  let solutionTemp = 20.0; // °C
  let isSimulating = true;
  let isRunning = true;
  let animId = null;

  // Particle Simulation
  const particles = [];
  const NUM_SOLVENT_PARTICLES = 75;
  for (let i = 0; i < NUM_SOLVENT_PARTICLES; i++) {
    particles.push({
      x: 185 + Math.random() * 210,
      y: 240 + Math.random() * 175,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      type: "solvent"
    });
  }

  // Telemetry buffer
  const coolingHistory = []; // { time, temp }
  const recordedTrials = [];
  let simTime = 0;

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #38bdf8; box-shadow: 0 0 10px #38bdf8;"></span>
            Colligative Properties &amp; Phase Transition Suite
          </span>
          <span class="badge" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            ${renderLatex("\\Delta T_f = i \\cdot K_f \\cdot m \\quad \\bullet \\quad \\Delta T_b = i \\cdot K_b \\cdot m")}
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-collig-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Cryo Simulator
            </button>
            <button id="view-mode-collig-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-collig-record" style="padding: 5px 14px; font-size: 0.78rem; border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;">
            📍 Record Data Point
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-collig-reset" style="padding: 5px 12px; font-size: 0.78rem;">
            ⟲ Reset Curve
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-collig-export" title="Export experimental telemetry to RFC-4180 CSV (Hotkey: E)" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export CSV (E)
          </button>
        </div>
      </div>

      <!-- Main Layout -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="collig-layout">
        <!-- Canvas Viewport -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(56, 189, 248, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #0c4a6e 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="collig-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
          <div id="collig-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <picture>
              <source srcset="assets/labs/colligative_bench.webp" type="image/webp">
              <img src="assets/labs/colligative_bench.jpg" decoding="async" loading="lazy" alt="4K Colligative Properties & Cryoscopy Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            </picture>
            
            <!-- Live Analytical Telemetry Callout on Photo -->
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Cryoscopic Freezing Cell</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Insulated Vacuum Dewared Bath</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Beckmann Thermometer &amp; RTD</div>
                <div style="color: #facc15; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Resolution ±0.001 °C Differential</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Analytical Balance &amp; Solutes</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Precision 0.0001 g Mass Meter</div>
              </div>
            </div>
          </div>

          <!-- Top HUD -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">THERMOMETER TELEMETRY</div>
              <div id="hud-collig-temp" style="font-size: 1.25rem; font-weight: 800; color: #38bdf8; font-family: var(--font-mono);">
                20.00 °C
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">CALCULATED FREEZING POINT</div>
              <div id="hud-collig-tf" style="font-size: 1.25rem; font-weight: 800; color: #c084fc; font-family: var(--font-mono);">
                T_f = -3.53 °C
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: Controls & Analysis -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Controls -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; margin-bottom: 12px;">Solution &amp; Thermal Bath Controls</div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div>
                <label style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Solvent</label>
                <select id="select-collig-solvent" class="form-control" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                  ${Object.entries(SOLVENTS).map(([k, s]) => `<option value="${k}">${s.name}</option>`).join("")}
                </select>
              </div>

              <div>
                <label style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Solute</label>
                <select id="select-collig-solute" class="form-control" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                  ${Object.entries(SOLUTES).map(([k, s]) => `<option value="${k}">${s.name}</option>`).join("")}
                </select>
              </div>
            </div>

            <!-- Molality Slider -->
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                <span style="color: #94a3b8;">Molality (m = mol solute / kg solvent)</span>
                <span id="lbl-collig-molality" style="font-weight: 700; color: #38bdf8; font-family: var(--font-mono);">1.00 mol/kg</span>
              </div>
              <input type="range" id="slider-collig-molality" min="0.0" max="3.0" step="0.05" value="1.00" style="width: 100%; accent-color: #38bdf8;">
            </div>

            <!-- Thermal Bath Temperature Slider -->
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                <span style="color: #94a3b8;">Cryogenic Cooling Bath Temp</span>
                <span id="lbl-collig-bath" style="font-weight: 700; color: #f43f5e; font-family: var(--font-mono);">-15.0 °C</span>
              </div>
              <input type="range" id="slider-collig-bath" min="-30.0" max="10.0" step="0.5" value="-15.0" style="width: 100%; accent-color: #f43f5e;">
            </div>

            <!-- Quick Info Badges -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; background: rgba(0,0,0,0.3); border-radius: 8px; padding: 8px 10px; font-size: 0.75rem; text-align: center;">
              <div>
                <span style="color: #64748b; display: block;">van 't Hoff (i)</span>
                <span id="info-collig-i" style="font-weight: 700; color: #a855f7; font-family: var(--font-mono);">1.90</span>
              </div>
              <div>
                <span style="color: #64748b; display: block;">K_f Constant</span>
                <span id="info-collig-kf" style="font-weight: 700; color: #38bdf8; font-family: var(--font-mono);">1.86 °C·kg/mol</span>
              </div>
              <div>
                <span style="color: #64748b; display: block;">ΔT_f Depression</span>
                <span id="info-collig-dtf" style="font-weight: 700; color: #10b981; font-family: var(--font-mono);">3.53 °C</span>
              </div>
            </div>
          </div>

          <!-- Analytical Live Curve Canvas -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; flex: 1; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">
                Real-Time Cooling Curve &amp; Phase Transition Plateau
              </span>
              <span style="font-size: 0.72rem; color: #38bdf8; font-family: var(--font-mono);">
                T vs Time (s)
              </span>
            </div>
            <div style="position: relative; flex: 1; min-height: 180px;">
              <canvas id="collig-chart-canvas" width="460" height="180" style="width: 100%; height: 180px; display: block; border-radius: 6px;"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Assessment Checkpoint Container -->
      <div id="colligative-checkpoint-container" style="margin-top: 24px;"></div>
    </div>
  `;

  // Canvas context
  const canvas = container.querySelector("#collig-canvas");
  const ctx = canvas.getContext("2d");
  const chartCanvas = container.querySelector("#collig-chart-canvas");
  const chartCtx = chartCanvas.getContext("2d");

  const logicalW = 580;
  const logicalH = 530;
  const chartLogicalW = 460;
  const chartLogicalH = 180;

  function setupHiDPICanvas() {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const w = rect.width > 0 ? rect.width : logicalW;
    const h = rect.height > 0 ? rect.height : logicalH;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);

    const cRect = chartCanvas.getBoundingClientRect();
    const cw = cRect.width > 0 ? cRect.width : chartLogicalW;
    const ch = cRect.height > 0 ? cRect.height : chartLogicalH;
    chartCanvas.width = Math.round(cw * dpr);
    chartCanvas.height = Math.round(ch * dpr);
  }

  setupHiDPICanvas();
  window.addEventListener("resize", setupHiDPICanvas);

  // Calculations
  function getParameters() {
    const s = SOLVENTS[solventKey];
    const sol = SOLUTES[soluteKey];
    const i = sol.iExp;
    const dtf = i * s.kf * molality;
    const tf = s.tf0 - dtf;
    const dtb = i * s.kb * molality;
    const tb = s.tb0 + dtb;
    return { s, sol, i, dtf, tf, dtb, tb };
  }

  function updateHUD() {
    const { s, sol, i, dtf, tf } = getParameters();
    const hudTemp = container.querySelector("#hud-collig-temp");
    const hudTf = container.querySelector("#hud-collig-tf");
    const infoI = container.querySelector("#info-collig-i");
    const infoKf = container.querySelector("#info-collig-kf");
    const infoDtf = container.querySelector("#info-collig-dtf");

    if (hudTemp) hudTemp.innerText = `${solutionTemp.toFixed(2)} °C`;
    if (hudTf) hudTf.innerText = `T_f = ${tf.toFixed(2)} °C`;
    if (infoI) infoI.innerText = i.toFixed(2);
    if (infoKf) infoKf.innerText = `${s.kf.toFixed(2)} °C·kg/mol`;
    if (infoDtf) infoDtf.innerText = `${dtf.toFixed(2)} °C`;
  }

  // Render Simulation Viewport
  function drawBeakerAndApparatus() {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const w = rect.width > 0 ? rect.width : logicalW;
    const h = rect.height > 0 ? rect.height : logicalH;

    ctx.save();
    ctx.resetTransform();
    ctx.scale(dpr * (w / logicalW), dpr * (h / logicalH));
    ctx.clearRect(0, 0, logicalW, logicalH);
    const { s, sol, tf } = getParameters();

    // 1. Background Laboratory Bench
    const benchY = 460;
    const benchGrad = ctx.createLinearGradient(0, benchY, 0, logicalH);
    benchGrad.addColorStop(0, "#1e293b");
    benchGrad.addColorStop(0.04, "#0f172a");
    benchGrad.addColorStop(1, "#020617");
    ctx.fillStyle = benchGrad;
    ctx.fillRect(0, benchY, logicalW, logicalH - benchY);

    ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, benchY);
    ctx.lineTo(logicalW, benchY);
    ctx.stroke();

    // Contact shadow under the cryostat
    const cryoShadow = ctx.createRadialGradient(logicalW / 2, benchY, 40, logicalW / 2, benchY, 210);
    cryoShadow.addColorStop(0, "rgba(0,0,0,0.65)");
    cryoShadow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = cryoShadow;
    ctx.fillRect(60, benchY - 4, 460, 20);

    // 2. Thermal Bath Chamber (Outer Insulated Cryostat / Dewar Flask)
    const cryoX = 80;
    const cryoY = 140;
    const cryoW = 420;
    const cryoH = 315;

    ctx.save();
    // Double-walled vacuum Dewar outer body
    const dewarGrad = ctx.createLinearGradient(cryoX, 0, cryoX + cryoW, 0);
    dewarGrad.addColorStop(0, "#1e293b");
    dewarGrad.addColorStop(0.2, "#334155");
    dewarGrad.addColorStop(0.5, "#1e293b");
    dewarGrad.addColorStop(0.8, "#334155");
    dewarGrad.addColorStop(1, "#0f172a");
    ctx.fillStyle = dewarGrad;
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(cryoX, cryoY, cryoW, cryoH, [8, 8, 18, 18]);
    ctx.fill();
    ctx.stroke();

    // Brushed stainless steel rim collar at top
    const rimGrad = ctx.createLinearGradient(cryoX, 0, cryoX + cryoW, 0);
    rimGrad.addColorStop(0, "#64748b");
    rimGrad.addColorStop(0.5, "#cbd5e1");
    rimGrad.addColorStop(1, "#475569");
    ctx.fillStyle = rimGrad;
    ctx.fillRect(cryoX, cryoY - 6, cryoW, 14);
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    ctx.strokeRect(cryoX, cryoY - 6, cryoW, 14);

    // Acrylic Inspection Window
    const winX = cryoX + 16;
    const winY = cryoY + 20;
    const winW = cryoW - 32;
    const winH = cryoH - 32;

    ctx.fillStyle = "#030712";
    ctx.fillRect(winX, winY, winW, winH);

    // Cryogenic bath liquid (slush ice/water or heating oil)
    const bathGrad = ctx.createLinearGradient(winX, winY + 20, winX, winY + winH);
    if (bathMode === "cooling") {
      bathGrad.addColorStop(0, "rgba(56, 189, 248, 0.25)");
      bathGrad.addColorStop(0.6, "rgba(14, 165, 233, 0.45)");
      bathGrad.addColorStop(1, "rgba(2, 132, 199, 0.7)");
    } else {
      bathGrad.addColorStop(0, "rgba(245, 158, 11, 0.25)");
      bathGrad.addColorStop(0.6, "rgba(217, 119, 6, 0.45)");
      bathGrad.addColorStop(1, "rgba(180, 83, 9, 0.7)");
    }
    ctx.fillStyle = bathGrad;
    ctx.fillRect(winX, winY + 30, winW, winH - 30);

    // Floating micro ice chunks in cryo bath when cold
    if (bathTemp < 2) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
      for (let ic = 0; ic < 16; ic++) {
        const ix = winX + 15 + (ic * 23) % (winW - 30);
        const iy = winY + 35 + ((ic * 37) % (winH - 55));
        ctx.fillRect(ix, iy, 8, 5);
      }
    }

    // Outer acrylic window frame & frost condensation mist
    ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
    ctx.lineWidth = 2;
    ctx.strokeRect(winX, winY, winW, winH);

    if (solutionTemp < 5) {
      // Frost vignette
      const frostGrad = ctx.createLinearGradient(winX, 0, winX + 30, 0);
      frostGrad.addColorStop(0, "rgba(224, 242, 254, 0.4)");
      frostGrad.addColorStop(1, "rgba(224, 242, 254, 0)");
      ctx.fillStyle = frostGrad;
      ctx.fillRect(winX, winY, 30, winH);

      const rFrost = ctx.createLinearGradient(winX + winW - 30, 0, winX + winW, 0);
      rFrost.addColorStop(0, "rgba(224, 242, 254, 0)");
      rFrost.addColorStop(1, "rgba(224, 242, 254, 0.4)");
      ctx.fillStyle = rFrost;
      ctx.fillRect(winX + winW - 30, winY, 30, winH);
    }
    ctx.restore();

    // 3. Inner Borosilicate Reaction Beaker (Griffin Beaker)
    const beakerX = 160;
    const beakerY = 175;
    const beakerW = 260;
    const beakerH = 265;
    const liquidMeniscusY = beakerY + 45;

    ctx.save();
    // Solution Liquid in Beaker
    const liquidGrad = ctx.createLinearGradient(beakerX, liquidMeniscusY, beakerX, beakerY + beakerH);
    liquidGrad.addColorStop(0, s.color);
    liquidGrad.addColorStop(0.7, s.liquidColor);
    liquidGrad.addColorStop(1, "rgba(2, 6, 23, 0.7)");
    ctx.fillStyle = liquidGrad;
    ctx.beginPath();
    ctx.roundRect(beakerX + 5, liquidMeniscusY, beakerW - 10, beakerH - 50, [0, 0, 16, 16]);
    ctx.fill();

    // Liquid Meniscus Surface
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.beginPath();
    ctx.ellipse(beakerX + beakerW / 2, liquidMeniscusY, beakerW / 2 - 8, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Borosilicate Glass Outer Outline
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    // Lip spout at left
    ctx.moveTo(beakerX - 8, beakerY - 3);
    ctx.quadraticCurveTo(beakerX - 2, beakerY, beakerX, beakerY);
    ctx.lineTo(beakerX, beakerY + beakerH - 14);
    ctx.arcTo(beakerX, beakerY + beakerH, beakerX + 16, beakerY + beakerH, 16);
    ctx.lineTo(beakerX + beakerW - 16, beakerY + beakerH);
    ctx.arcTo(beakerX + beakerW, beakerY + beakerH, beakerX + beakerW, beakerY + beakerH - 14, 16);
    ctx.lineTo(beakerX + beakerW, beakerY);
    ctx.stroke();

    // Dual Cylinder Specular Reflections
    const leftSpec = ctx.createLinearGradient(beakerX + 6, 0, beakerX + 22, 0);
    leftSpec.addColorStop(0, "rgba(255, 255, 255, 0.35)");
    leftSpec.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = leftSpec;
    ctx.fillRect(beakerX + 6, beakerY + 6, 16, beakerH - 16);

    const rightSpec = ctx.createLinearGradient(beakerX + beakerW - 22, 0, beakerX + beakerW - 6, 0);
    rightSpec.addColorStop(0, "rgba(255, 255, 255, 0)");
    rightSpec.addColorStop(1, "rgba(255, 255, 255, 0.25)");
    ctx.fillStyle = rightSpec;
    ctx.fillRect(beakerX + beakerW - 22, beakerY + 6, 16, beakerH - 16);

    // Beaker volume graduations (50, 100, 150, 200 mL)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
    ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
    ctx.font = "8px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    [
      { yOff: 40, ml: "50" },
      { yOff: 80, ml: "100" },
      { yOff: 120, ml: "150" },
      { yOff: 160, ml: "200" }
    ].forEach(g => {
      const markY = beakerY + beakerH - g.yOff;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(beakerX + 6, markY);
      ctx.lineTo(beakerX + 26, markY);
      ctx.stroke();
      ctx.fillText(`${g.ml} mL`, beakerX + 30, markY + 2.5);
    });
    ctx.restore();

    // 4. Dendritic Ice Crystal Nucleation Lattice (When T <= Tf)
    const isFrozen = solutionTemp <= tf;
    if (isFrozen) {
      ctx.save();
      // Frosting glow overlay
      ctx.fillStyle = "rgba(224, 242, 254, 0.2)";
      ctx.fillRect(beakerX + 6, liquidMeniscusY, beakerW - 12, beakerH - 52);

      // Branching Ice Dendrite Needles
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 1.8;
      for (let x = beakerX + 25; x < beakerX + beakerW - 20; x += 38) {
        for (let y = liquidMeniscusY + 25; y < beakerY + beakerH - 25; y += 38) {
          ctx.beginPath();
          // Hexagonal 6-point ice snowflake platelet
          for (let arm = 0; arm < 6; arm++) {
            const rad = (arm * Math.PI) / 3;
            const ax = x + Math.cos(rad) * 11;
            const ay = y + Math.sin(rad) * 11;
            ctx.moveTo(x, y);
            ctx.lineTo(ax, ay);

            // Sub-twigs
            const tax = x + Math.cos(rad) * 7;
            const tay = y + Math.sin(rad) * 7;
            ctx.moveTo(tax, tay);
            ctx.lineTo(tax + Math.cos(rad + 0.6) * 4, tay + Math.sin(rad + 0.6) * 4);
            ctx.moveTo(tax, tay);
            ctx.lineTo(tax + Math.cos(rad - 0.6) * 4, tay + Math.sin(rad - 0.6) * 4);
          }
          ctx.stroke();
        }
      }

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 8;
      ctx.fillText("❄️ SOLID CRYSTALLINE LATTICE (PHASE EQUILIBRIUM)", beakerX + beakerW / 2, liquidMeniscusY + 85);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // 5. Draw Particles (Solvent Molecules & Dissociated Solute Ions)
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(beakerX + 6, liquidMeniscusY + 5, beakerW - 12, beakerH - 56, [0, 0, 14, 14]);
    ctx.clip();

    // Solvent particles
    const particleMobility = solutionTemp > tf ? 1.0 : 0.15;
    particles.forEach(p => {
      p.x += p.vx * particleMobility;
      p.y += p.vy * particleMobility;
      if (p.x <= beakerX + 16) { p.x = beakerX + 16; p.vx = Math.abs(p.vx); }
      if (p.x >= beakerX + beakerW - 16) { p.x = beakerX + beakerW - 16; p.vx = -Math.abs(p.vx); }
      if (p.y <= liquidMeniscusY + 12) { p.y = liquidMeniscusY + 12; p.vy = Math.abs(p.vy); }
      if (p.y >= beakerY + beakerH - 16) { p.y = beakerY + beakerH - 16; p.vy = -Math.abs(p.vy); }

      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      ctx.fill();
    });

    // Dissociated Solute Ions (van 't Hoff particles i · m)
    const numSoluteIons = Math.min(65, Math.floor(molality * 18));
    for (let i = 0; i < numSoluteIons; i++) {
      const angle = (simTime * 0.05 + i * 1.618) % (Math.PI * 2);
      const px = beakerX + beakerW / 2 + Math.cos(angle + i) * (65 + (i % 5) * 15);
      const py = liquidMeniscusY + 100 + Math.sin(angle * 1.5 + i) * (45 + (i % 4) * 14);

      const isCation = i % 2 === 0;
      ctx.beginPath();
      ctx.arc(px, py, isCation ? 5 : 6, 0, Math.PI * 2);
      ctx.fillStyle = isCation ? sol.colorCat : (sol.colorAn || sol.colorCat);
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Symbol
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 7.5px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(isCation ? sol.cation.substring(0, 3) : (sol.anion.substring(0, 3) || "Sol"), px, py);
    }
    ctx.restore();

    // 6. Precision Digital Immersion RTD Thermometer Probe
    const probeX = beakerX + beakerW / 2;
    const probeY = 50;
    const probeLen = 270;

    ctx.save();
    // Stainless steel probe shaft
    const shaftGrad = ctx.createLinearGradient(probeX - 5, 0, probeX + 5, 0);
    shaftGrad.addColorStop(0, "#64748b");
    shaftGrad.addColorStop(0.4, "#f8fafc");
    shaftGrad.addColorStop(0.8, "#94a3b8");
    shaftGrad.addColorStop(1, "#334155");
    ctx.fillStyle = shaftGrad;
    ctx.fillRect(probeX - 5, probeY + 45, 10, probeLen);

    // Platinum RTD sensor tip
    ctx.fillStyle = "#cbd5e1";
    ctx.beginPath();
    ctx.arc(probeX, probeY + 45 + probeLen, 6, 0, Math.PI * 2);
    ctx.fill();

    // Digital Display Head at top of probe
    const headW = 90;
    const headH = 46;
    ctx.fillStyle = "#0f172a";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(probeX - headW / 2, probeY, headW, headH, 6);
    ctx.fill();
    ctx.stroke();

    // Backlit OLED Screen
    ctx.fillStyle = "#020617";
    ctx.fillRect(probeX - headW / 2 + 6, probeY + 6, headW - 12, headH - 12);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "800 13px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(`${solutionTemp.toFixed(2)} °C`, probeX, probeY + 26);
    ctx.font = "bold 6.5px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#34d399";
    ctx.fillText("RTD PT100 CALIBRATED", probeX, probeY + 36);
    ctx.restore();

    // 7. Magnetic Stirrer & Rotating PTFE Stir Bar
    const stirAngle = simTime * 0.2;
    ctx.save();
    ctx.translate(beakerX + beakerW / 2, beakerY + beakerH - 20);
    ctx.rotate(stirAngle);
    // PTFE white magnetic flea with center pivot ring
    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(-24, -5, 48, 10, 4);
    ctx.fill();
    ctx.stroke();
    // Center ring
    ctx.fillStyle = "#cbd5e1";
    ctx.fillRect(-3, -6, 6, 12);
    ctx.restore();

    // Labels
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Insulated Thermal Bath Chamber", cryoX + 12, cryoY + 16);
    ctx.fillText(`Bath Temp: ${bathTemp.toFixed(1)} °C`, cryoX + 12, cryoY + 30);
    ctx.fillText(`Solvent: ${s.name}`, beakerX + 12, beakerY + 18);

    ctx.restore();
  }

  // Draw Real-time Chart
  function drawChart() {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : Math.min(window.devicePixelRatio || 1, 2);
    const cRect = chartCanvas.getBoundingClientRect();
    const cw = cRect.width > 0 ? cRect.width : chartLogicalW;
    const ch = cRect.height > 0 ? cRect.height : chartLogicalH;

    chartCtx.save();
    chartCtx.resetTransform();
    chartCtx.scale(dpr * (cw / chartLogicalW), dpr * (ch / chartLogicalH));
    chartCtx.clearRect(0, 0, chartLogicalW, chartLogicalH);

    const W = chartLogicalW;
    const H = chartLogicalH;
    const { s, tf } = getParameters();

    // Background Grid
    chartCtx.fillStyle = "#030712";
    chartCtx.fillRect(0, 0, W, H);
    chartCtx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    chartCtx.lineWidth = 1;

    for (let x = 40; x < W; x += 40) {
      chartCtx.beginPath();
      chartCtx.moveTo(x, 10);
      chartCtx.lineTo(x, H - 25);
      chartCtx.stroke();
    }
    for (let y = 15; y < H - 25; y += 30) {
      chartCtx.beginPath();
      chartCtx.moveTo(40, y);
      chartCtx.lineTo(W - 15, y);
      chartCtx.stroke();
    }

    // Axes
    chartCtx.strokeStyle = "#475569";
    chartCtx.lineWidth = 1.5;
    chartCtx.beginPath();
    chartCtx.moveTo(40, 10);
    chartCtx.lineTo(40, H - 25);
    chartCtx.lineTo(W - 15, H - 25);
    chartCtx.stroke();

    // Axis Labels
    chartCtx.fillStyle = "#94a3b8";
    chartCtx.font = "9.5px 'JetBrains Mono', monospace";
    chartCtx.textAlign = "right";
    chartCtx.fillText("25°C", 35, 25);
    chartCtx.fillText("0°C", 35, 95);
    chartCtx.fillText("-20°C", 35, 145);

    chartCtx.textAlign = "center";
    chartCtx.fillText("Time elapsed (s) ➔", W / 2, H - 6);

    // Draw Freezing Point Reference Line (Plateau)
    const yTf = 95 - (tf / 25) * 55;
    chartCtx.strokeStyle = "rgba(192, 132, 252, 0.75)";
    chartCtx.setLineDash([4, 4]);
    chartCtx.beginPath();
    chartCtx.moveTo(40, yTf);
    chartCtx.lineTo(W - 15, yTf);
    chartCtx.stroke();
    chartCtx.setLineDash([]);
    chartCtx.fillStyle = "#c084fc";
    chartCtx.textAlign = "left";
    chartCtx.fillText(`T_f = ${tf.toFixed(2)} °C (Plateau)`, 45, yTf - 4);

    // Plot Temperature Curve
    if (coolingHistory.length > 1) {
      chartCtx.strokeStyle = "#38bdf8";
      chartCtx.lineWidth = 2.5;
      chartCtx.beginPath();

      coolingHistory.forEach((pt, idx) => {
        const px = 40 + (pt.time / Math.max(60, simTime)) * (W - 60);
        const py = 95 - (pt.temp / 25) * 55;
        if (idx === 0) chartCtx.moveTo(px, py);
        else chartCtx.lineTo(px, py);
      });
      chartCtx.stroke();

      // Current operating point on curve
      const lastPt = coolingHistory[coolingHistory.length - 1];
      const curX = 40 + (lastPt.time / Math.max(60, simTime)) * (W - 60);
      const curY = 95 - (lastPt.temp / 25) * 55;
      chartCtx.fillStyle = "#facc15";
      chartCtx.shadowColor = "#facc15";
      chartCtx.shadowBlur = 6;
      chartCtx.beginPath();
      chartCtx.arc(curX, curY, 4.5, 0, Math.PI * 2);
      chartCtx.fill();
      chartCtx.shadowBlur = 0;
    }
    chartCtx.restore();
  }

  // Physics Step
  function stepPhysics() {
    simTime += 0.05;
    const { tf } = getParameters();

    // Cooling kinetics: Newton's Law of Cooling towards bathTemp,
    // with latent heat plateau at T_f
    const kCool = 0.04;
    const tempDiff = bathTemp - solutionTemp;

    if (solutionTemp > tf + 0.1) {
      // Liquid cooling
      solutionTemp += tempDiff * kCool * 0.15;
    } else if (solutionTemp >= tf - 0.2) {
      // Latent heat plateau during freezing phase transition
      solutionTemp = tf + (Math.random() - 0.5) * 0.05;
    } else {
      // Solid ice cooling towards bath temp
      solutionTemp += tempDiff * kCool * 0.10;
    }

    // Keep history point every ~0.5s
    if (coolingHistory.length === 0 || simTime - coolingHistory[coolingHistory.length - 1].time > 0.4) {
      coolingHistory.push({ time: simTime, temp: solutionTemp });
      if (coolingHistory.length > 150) coolingHistory.shift();
    }
  }

  // Animation Loop
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

    const photoOverlay = container.querySelector("#collig-photo-overlay");
    const isPhotoOverlay = photoOverlay && photoOverlay.style.display === "block";

    if (!isPhotoOverlay) {
      if (!now || now - lastFrameTime >= interval) {
        lastFrameTime = now || performance.now();
        stepPhysics();
        updateHUD();
        drawBeakerAndApparatus();
        drawChart();
      }
    }

    animId = requestAnimationFrame(loop);
  }

  // UI Event Listeners
  container.querySelector("#select-collig-solvent")?.addEventListener("change", (e) => {
    solventKey = e.target.value;
    coolingHistory.length = 0;
    simTime = 0;
    solutionTemp = 20.0;
    needsRedraw = true;
    SoundFX.playClick();
  });

  container.querySelector("#select-collig-solute")?.addEventListener("change", (e) => {
    soluteKey = e.target.value;
    coolingHistory.length = 0;
    simTime = 0;
    solutionTemp = 20.0;
    needsRedraw = true;
    SoundFX.playClick();
  });

  container.querySelector("#slider-collig-molality")?.addEventListener("input", (e) => {
    molality = parseFloat(e.target.value);
    container.querySelector("#lbl-collig-molality").innerText = `${molality.toFixed(2)} mol/kg`;
    needsRedraw = true;
  });

  container.querySelector("#slider-collig-bath")?.addEventListener("input", (e) => {
    bathTemp = parseFloat(e.target.value);
    container.querySelector("#lbl-collig-bath").innerText = `${bathTemp.toFixed(1)} °C`;
    needsRedraw = true;
  });

  container.querySelector("#btn-collig-reset")?.addEventListener("click", () => {
    coolingHistory.length = 0;
    simTime = 0;
    solutionTemp = 20.0;
    needsRedraw = true;
    SoundFX.playClick();
  });

  container.querySelector("#btn-collig-record")?.addEventListener("click", () => {
    const { s, sol, i, dtf, tf } = getParameters();
    recordedTrials.push({
      solvent: s.name,
      solute: sol.name,
      molality,
      vanTHoff: i,
      dtf,
      freezingPoint: tf,
      currentTemp: solutionTemp
    });
    LabTrialStore.addTrial("colligative", { molality, dtf, tf, solute: sol.name });
    SoundFX.playScorePip();
  });

  container.querySelector("#btn-collig-export")?.addEventListener("click", () => {
    const { s, sol, i, dtf, tf } = getParameters();
    exportLabDataCsv({
      title: "Colligative Properties & Freezing Point Depression Telemetry",
      labId: "colligative",
      parameters: {
        "Solvent": s.name,
        "Solute": sol.name,
        "Kf Constant (°C·kg/mol)": s.kf,
        "Van 't Hoff Factor i": i,
        "Molality m (mol/kg)": molality
      },
      headers: ["Trial #", "Time (s)", "Temperature (°C)", "T_f Theoretical (°C)", "ΔT_f Depression (°C)"],
      dataRows: coolingHistory.map((pt, idx) => [
        idx + 1,
        pt.time.toFixed(1),
        pt.temp.toFixed(2),
        tf.toFixed(2),
        dtf.toFixed(2)
      ])
    });
  });

  // 4K Photo View Switcher
  const btnColligSim = container.querySelector("#view-mode-collig-sim");
  const btnColligPhoto = container.querySelector("#view-mode-collig-photo");
  const colligPhotoOverlay = container.querySelector("#collig-photo-overlay");

  btnColligSim?.addEventListener("click", () => {
    btnColligSim.classList.add("active");
    btnColligSim.style.background = "";
    btnColligPhoto.classList.remove("active");
    btnColligPhoto.style.background = "transparent";
    if (colligPhotoOverlay) colligPhotoOverlay.style.display = "none";
    SoundFX.playClick();
  });

  btnColligPhoto?.addEventListener("click", () => {
    btnColligPhoto.classList.add("active");
    btnColligPhoto.style.background = "";
    btnColligSim.classList.remove("active");
    btnColligSim.style.background = "transparent";
    if (colligPhotoOverlay) colligPhotoOverlay.style.display = "block";
    SoundFX.playClick();
  });

  // Standardized Hotkey: 'e' or 'E' triggers CSV telemetry export
  const handleKeyDown = (e) => {
    if ((e.key === "e" || e.key === "E") && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      container.querySelector("#btn-collig-export")?.click();
    }
  };
  window.addEventListener("keydown", handleKeyDown);

  // Mount Assessment
  mountLabCheckpoint("colligative-checkpoint-container", "colligative");

  // Launch
  loop();

  return () => {
    isRunning = false;
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("resize", setupHiDPICanvas);
  };
}
