// Edugates-ClipSAT Science Labs - Chemistry: Chemical Equilibrium & Le Chatelier's Principle
// 60 FPS Reversible Chemical Kinetics Simulation:
// Dynamic Equilibrium (Q vs K_c), Le Chatelier Shifts (Temperature, Concentration, Pressure/Volume),
// Gas Syringe NO₂/N₂O₄ Chromatic Transition, Cobalt Hexaaqua/Tetrachloro Complex, and Fe(SCN)²⁺ Colorimetry.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initEquilibriumLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const EQUILIBRIUM_SYSTEMS = {
    no2_n2o4: {
      name: "Dinitrogen Tetroxide ⇌ Nitrogen Dioxide",
      equation: "N_2O_4(g) \\text{ [Colorless]} + 57.2\\text{ kJ} \\rightleftharpoons 2 NO_2(g) \\text{ [Dark Red-Brown]}",
      phase: "gas",
      forwardIsEndo: true,
      deltaH: +57.2, // kJ/mol
      K_ref: 0.0046, // at 298K
      reactants: "N₂O₄",
      products: "NO₂",
      colorStart: [230, 245, 255], // Clear
      colorEnd: [180, 50, 10], // Brown
      desc: "Endothermic gaseous dissociation. Heating shifts equilibrium forward (dark brown). Compression shifts toward fewer moles (N₂O₄ colorless)."
    },
    cobalt_complex: {
      name: "Cobalt(II) Hexaaqua / Tetrachloro Complex",
      equation: "[Co(H_2O)_6]^{2+}(aq) \\text{ [Pink]} + 4 Cl^-(aq) + \\text{Heat} \\rightleftharpoons [CoCl_4]^{2-}(aq) \\text{ [Deep Blue]} + 6 H_2O(l)",
      phase: "aqueous",
      forwardIsEndo: true,
      deltaH: +50.0,
      K_ref: 0.12,
      reactants: "[Co(H₂O)₆]²⁺",
      products: "[CoCl₄]²⁻",
      colorStart: [244, 114, 182], // Pink
      colorEnd: [37, 99, 235], // Deep Blue
      desc: "Endothermic coordination complex. Adding Cl⁻ or heating shifts to blue [CoCl₄]²⁻. Adding water or chilling shifts to pink [Co(H₂O)₆]²⁺."
    },
    iron_thiocyanate: {
      name: "Iron(III) Thiocyanate Colorimetry",
      equation: "Fe^{3+}(aq) \\text{ [Pale Yellow]} + SCN^-(aq) \\text{ [Colorless]} \\rightleftharpoons [Fe(SCN)]^{2+}(aq) \\text{ [Blood Red]}",
      phase: "aqueous",
      forwardIsEndo: false, // Exothermic forward
      deltaH: -24.0,
      K_ref: 138.0,
      reactants: "Fe³⁺ + SCN⁻",
      products: "[Fe(SCN)]²⁺",
      colorStart: [254, 240, 138], // Pale yellow
      colorEnd: [153, 27, 27], // Blood red
      desc: "Exothermic aqueous coordination. Adding Fe³⁺ or SCN⁻ deepens red hue. Adding Ag⁺ precipitates AgSCN, shifting reverse toward yellow."
    }
  };

  // State Variables
  let currentKey = "no2_n2o4";
  let activeSys = EQUILIBRIUM_SYSTEMS[currentKey];
  let temperature = 25; // °C (0 to 80)
  let syringeVolume = 1.0; // 0.5x to 2.5x volume
  let stressPerturbation = 0; // perturbation slider
  let reactantConc = 1.0; // normalized
  let productConc = 0.2;
  let animId = null;
  let elapsedSeconds = 0;

  // History for plotting
  const historyQ = [];

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #22c55e; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 10px #22c55e;"></span>
            Chemical Equilibrium &amp; Le Chatelier Chamber
          </span>
          <span class="badge" style="background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.3); color: #4ade80; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            ${renderLatex("Q \\text{ vs } K_c \\quad \\bullet \\quad \\text{Dynamic Equilibrium & Van 't Hoff Shift}")}
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-eq-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Reaction Cell
            </button>
            <button id="view-mode-eq-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Shimadzu Bench
            </button>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-eq-reset" style="padding: 5px 12px; font-size: 0.78rem;">
            ⟲ Equilibrate
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-eq-export" title="Export experimental telemetry to RFC-4180 CSV (Hotkey: E)" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export CSV (E)
          </button>
        </div>
      </div>

      <!-- Main Layout: Visual Cell on Left, Spectrophotometry & Controls on Right -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="equilibrium-layout">
        <!-- Visual Cell Canvas -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(34, 197, 94, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #06180e 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="equilibrium-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
          <div id="equilibrium-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <picture>
              <source srcset="assets/labs/equilibrium_bench.webp" type="image/webp">
              <img src="assets/labs/equilibrium_bench.jpg" decoding="async" loading="lazy" alt="4K Spectrophotometer & Equilibrium Laboratory Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            </picture>
            
            <!-- Live Analytical Telemetry Callout on Photo -->
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(34, 197, 94, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Shimadzu UV-1800 Spectrophotometer</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Absorbance: 0.482 AU • λ = 450nm</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Lauda Thermostatic Water Bath</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Precision ±0.05°C Circulation</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Gas Manifold &amp; Syringe</div>
                <div style="color: #f59e0b; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Borosilicate Precision Calibrated</div>
              </div>
            </div>
          </div>

          <!-- Top HUD Overlay -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(34, 197, 94, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">REACTION QUOTIENT (Q) vs K_c</div>
              <div style="font-weight: 800; font-size: 1.25rem; color: #4ade80; font-family: var(--font-mono);" id="disp-q-val">Q = 0.0400 • K_c = 0.0400</div>
              <div style="font-size: 0.74rem; color: #38bdf8; font-family: var(--font-mono);" id="disp-eq-status">⚖️ Dynamic Equilibrium Reached</div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">SPECTROPHOTOMETRIC ABSORBANCE</div>
              <div style="font-weight: 800; font-size: 1.25rem; color: #38bdf8; font-family: var(--font-mono);" id="disp-absorbance">0.420 AU</div>
              <div style="font-size: 0.74rem; color: #f59e0b; font-family: var(--font-mono);" id="disp-cell-color">Transmittance: 38.0%</div>
            </div>
          </div>

          <!-- Bottom Status Pill -->
          <div style="position: absolute; bottom: 12px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: center; pointer-events: none; font-family: var(--font-mono); font-size: 0.74rem; color: #94a3b8;">
            <span style="background: rgba(0,0,0,0.65); padding: 4px 10px; border-radius: 6px;" id="disp-shift-direction">
              ➡️ Equilibrium Shift: Stationary (Forward Rate = Reverse Rate)
            </span>
            <span style="background: rgba(0,0,0,0.65); padding: 4px 10px; border-radius: 6px;">
              🌡️ T = <span id="disp-temp-val">25.0 °C</span>
            </span>
          </div>
        </div>

        <!-- Controls & Equilibrium Composition on Right -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <!-- System Selection Card -->
          <div class="lab-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px;">
            <label style="font-size: 0.8rem; font-weight: 700; color: #4ade80; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">
              Reversible System Selection
            </label>
            <div style="display: grid; grid-template-columns: 1fr; gap: 6px;">
              <button class="btn btn-secondary btn-sm ${currentKey === 'no2_n2o4' ? 'active' : ''}" data-sys="no2_n2o4" style="font-size: 0.74rem; padding: 7px; text-align: left;">
                💨 N₂O₄ (Colorless) ⇌ 2 NO₂ (Dark Red-Brown)
              </button>
              <button class="btn btn-secondary btn-sm ${currentKey === 'cobalt_complex' ? 'active' : ''}" data-sys="cobalt_complex" style="font-size: 0.74rem; padding: 7px; text-align: left;">
                🧪 [Co(H₂O)₆]²⁺ (Pink) + 4Cl⁻ ⇌ [CoCl₄]²⁻ (Deep Blue)
              </button>
              <button class="btn btn-secondary btn-sm ${currentKey === 'iron_thiocyanate' ? 'active' : ''}" data-sys="iron_thiocyanate" style="font-size: 0.74rem; padding: 7px; text-align: left;">
                🩸 Fe³⁺ (Yellow) + SCN⁻ ⇌ [Fe(SCN)]²⁺ (Blood Red)
              </button>
            </div>
          </div>

          <!-- Stresses: Temperature, Pressure/Volume, Concentration -->
          <div class="lab-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px;">
            <label style="font-size: 0.8rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">
              Le Chatelier External Stresses
            </label>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              <!-- Temperature Slider (Ice Bath to Hot Bath) -->
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>Thermostatic Bath Temp</span>
                  <span style="color: #ec4899; font-weight: 700;" id="lbl-temp">${temperature} °C</span>
                </div>
                <input type="range" id="slider-eq-temp" min="0" max="80" step="1" value="${temperature}" style="width: 100%; accent-color: #ec4899;">
              </div>

              <!-- Syringe Volume Slider (Gas phase only) -->
              <div id="block-volume-slider">
                <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>Gas Syringe Volume (Pressure = 1/V)</span>
                  <span style="color: #facc15; font-weight: 700;" id="lbl-volume">${syringeVolume.toFixed(2)}× (P = ${(1/syringeVolume).toFixed(2)} atm)</span>
                </div>
                <input type="range" id="slider-eq-volume" min="0.5" max="2.5" step="0.05" value="${syringeVolume}" style="width: 100%; accent-color: #facc15;">
              </div>

              <!-- Reagent Concentration Perturbation -->
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>Stress Reactant [Reactants]</span>
                  <span style="color: #34d399; font-weight: 700;" id="lbl-stress-reag">Normal</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
                  <button class="btn btn-secondary btn-sm" id="btn-add-reactant" style="font-size: 0.72rem; padding: 5px;">+ Add Reactant</button>
                  <button class="btn btn-secondary btn-sm" id="btn-add-product" style="font-size: 0.72rem; padding: 5px;">+ Add Product</button>
                  <button class="btn btn-secondary btn-sm" id="btn-remove-stress" style="font-size: 0.72rem; padding: 5px; color: #f87171;">Remove Stress</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Dynamic Equilibrium Bar Chart -->
          <div class="lab-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px; flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 0.8rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em;">
                Equilibrium Mole Fraction Distribution
              </span>
            </div>
            <canvas id="eq-chart-canvas" width="420" height="130" style="width: 100%; height: 130px; display: block; border-radius: 6px; background: #030712; border: 1px solid rgba(255,255,255,0.08);"></canvas>
          </div>
        </div>
      </div>

      <!-- Post-Lab Checkpoint Assessment -->
      <div id="eq-checkpoint-container" style="margin-top: 24px;"></div>
    </div>
  `;

  // Canvas References
  const canvas = container.querySelector("#equilibrium-canvas");
  const ctx = canvas.getContext("2d");
  const chartCanvas = container.querySelector("#eq-chart-canvas");
  const chartCtx = chartCanvas.getContext("2d");

  // DOM Elements
  const dispQ = container.querySelector("#disp-q-val");
  const dispEqStatus = container.querySelector("#disp-eq-status");
  const dispAbs = container.querySelector("#disp-absorbance");
  const dispColor = container.querySelector("#disp-cell-color");
  const dispShift = container.querySelector("#disp-shift-direction");
  const dispTemp = container.querySelector("#disp-temp-val");

  // HiDPI / Retina DPR Scaling Setup
  const logicalW = 580;
  const logicalH = 530;
  const chartLogicalW = 420;
  const chartLogicalH = 130;
  let needsRedraw = true;
  let lastFrameTime = 0;

  function setupHiDPICanvas() {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (typeof window.getOptimizedDPR === "function" ? window.getOptimizedDPR() : (window.devicePixelRatio || 1));
    if (canvas && ctx) {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width > 0 ? rect.width : logicalW;
      const h = rect.height > 0 ? rect.height : logicalH;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.resetTransform();
      ctx.scale(dpr * (w / logicalW), dpr * (h / logicalH));
    }
    if (chartCanvas && chartCtx) {
      const crect = chartCanvas.getBoundingClientRect();
      const cw = crect.width > 0 ? crect.width : chartLogicalW;
      const ch = crect.height > 0 ? crect.height : chartLogicalH;
      chartCanvas.width = Math.round(cw * dpr);
      chartCanvas.height = Math.round(ch * dpr);
      chartCtx.resetTransform();
      chartCtx.scale(dpr * (cw / chartLogicalW), dpr * (ch / chartLogicalH));
    }
    needsRedraw = true;
  }
  setupHiDPICanvas();
  window.addEventListener("resize", setupHiDPICanvas);

  // Physical Gas Molecule Kinetics Pool (Brownian motion & molecular geometry)
  const GAS_PARTICLE_COUNT = 44;
  const gasParticles = [];
  function initGasParticles() {
    gasParticles.length = 0;
    const barrelX = 145;
    const barrelY = 205;
    const barrelH = 110;
    const plungerX = barrelX + (syringeVolume / 2.5) * 230;
    for (let i = 0; i < GAS_PARTICLE_COUNT; i++) {
      gasParticles.push({
        x: barrelX + 16 + Math.random() * Math.max(16, plungerX - barrelX - 36),
        y: barrelY + 14 + Math.random() * (barrelH - 28),
        vx: (Math.random() - 0.5) * 75,
        vy: (Math.random() - 0.5) * 75,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 3.5,
        type: i % 2 === 0 ? "NO2" : "N2O4"
      });
    }
  }
  initGasParticles();

  // Colloidal Tyndall Scatter Particles for Aqueous Cuvette
  const tyndallParticles = [];
  for (let i = 0; i < 28; i++) {
    tyndallParticles.push({
      x: 265 + Math.random() * 90,
      y: 195 + Math.random() * 155,
      vx: (Math.random() - 0.5) * 8,
      vy: -3 - Math.random() * 10,
      size: 1.0 + Math.random() * 1.8,
      alpha: 0.2 + Math.random() * 0.6
    });
  }

  // Van 't Hoff Equation for K_c(T)
  function getEquilibriumConstant(T_celsius) {
    const T_kelvin = T_celsius + 273.15;
    const R = 8.314; // J/(mol·K)
    const T_ref = 298.15;
    const exponent = -(activeSys.deltaH * 1000 / R) * ((1 / T_kelvin) - (1 / T_ref));
    return activeSys.K_ref * Math.exp(exponent);
  }

  // Render Visual Reaction Cell & Gas Syringe
  function renderCell(dt = 0.016) {
    const W = logicalW;
    const H = logicalH;
    ctx.clearRect(0, 0, W, H);

    // 1. Granite Laboratory Optical Bench Surface
    const benchY = 445;
    const benchGrad = ctx.createLinearGradient(0, benchY, 0, H);
    benchGrad.addColorStop(0, "#1e293b");
    benchGrad.addColorStop(0.2, "#0f172a");
    benchGrad.addColorStop(1, "#020617");
    ctx.fillStyle = benchGrad;
    ctx.fillRect(0, benchY, W, H - benchY);

    // Benchtop Polished Chamfer Bevel Highlight
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, benchY);
    ctx.lineTo(W, benchY);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, benchY + 1.5);
    ctx.lineTo(W, benchY + 1.5);
    ctx.stroke();

    // Extruded Aluminum Equipment Track on Bench
    ctx.fillStyle = "#090d16";
    ctx.fillRect(40, benchY + 14, W - 80, 14);
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.strokeRect(40, benchY + 14, W - 80, 14);
    ctx.strokeStyle = "rgba(148,163,184,0.3)";
    ctx.lineWidth = 1;
    for (let rx = 50; rx < W - 50; rx += 15) {
      ctx.beginPath();
      ctx.moveTo(rx, benchY + 14);
      ctx.lineTo(rx, benchY + 20);
      ctx.stroke();
    }

    // Heavy Retort Stand with Bosshead Clamp
    const standX = 85;
    // Cast iron base
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(standX - 35, benchY - 10, 70, 14, [4, 4, 0, 0]);
    ctx.fill();
    ctx.stroke();

    // Chrome vertical rod
    const rodGrad = ctx.createLinearGradient(standX - 5, 0, standX + 5, 0);
    rodGrad.addColorStop(0, "#64748b");
    rodGrad.addColorStop(0.35, "#f8fafc");
    rodGrad.addColorStop(0.7, "#94a3b8");
    rodGrad.addColorStop(1, "#334155");
    ctx.fillStyle = rodGrad;
    ctx.fillRect(standX - 4.5, 75, 9, benchY - 85);

    // Bosshead clamp holding reaction apparatus
    const clampY = 260;
    ctx.fillStyle = "#334155";
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(standX - 8, clampY - 14, 16, 28, 3);
    ctx.fill();
    ctx.stroke();

    // Clamp adjustment thumbscrew
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(standX - 16, clampY - 4, 8, 8);

    // Horizontal clamp arm extending to apparatus
    ctx.fillStyle = rodGrad;
    ctx.fillRect(standX + 8, clampY - 4, 38, 8);

    // Apparatus Grip Prongs
    ctx.fillStyle = "#0f172a";
    ctx.strokeStyle = "#475569";
    ctx.fillRect(standX + 44, clampY - 18, 8, 36);

    const CX = W * 0.51;
    const CY = 260;

    // Fluid and Gas Color Interpolation
    const totalConc = reactantConc + productConc;
    const fractionProd = Math.max(0, Math.min(1, productConc / Math.max(0.001, totalConc)));
    const c1 = activeSys.colorStart;
    const c2 = activeSys.colorEnd;
    const r = Math.round(c1[0] + fractionProd * (c2[0] - c1[0]));
    const g = Math.round(c1[1] + fractionProd * (c2[1] - c1[1]));
    const b = Math.round(c1[2] + fractionProd * (c2[2] - c1[2]));
    const fluidAlpha = Math.min(0.92, 0.40 + fractionProd * 0.45);
    const fluidColor = `rgba(${r}, ${g}, ${b}, ${fluidAlpha})`;

    if (activeSys.phase === "gas") {
      // ==========================================
      // GAS SYRINGE APPARATUS (N2O4 ⇌ 2 NO2)
      // ==========================================
      const barrelX = 135;
      const barrelW = 285;
      const barrelH = 110;
      const barrelY = CY - barrelH / 2;

      // Soft shadow under syringe
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.beginPath();
      ctx.ellipse(barrelX + barrelW / 2, barrelY + barrelH + 24, barrelW / 2 + 20, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Plunger position based on syringeVolume (0.5 to 2.5)
      const plungerTravel = 230;
      const plungerX = barrelX + 10 + (syringeVolume / 2.5) * plungerTravel;

      // 1. Gas Volume Fill (Density increases with compression)
      const gasAlpha = Math.min(0.95, (0.30 + fractionProd * 0.55) * Math.sqrt(1 / syringeVolume));
      const gasFillGrad = ctx.createLinearGradient(0, barrelY, 0, barrelY + barrelH);
      gasFillGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${gasAlpha * 0.65})`);
      gasFillGrad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${gasAlpha})`);
      gasFillGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${gasAlpha * 0.85})`);
      ctx.fillStyle = gasFillGrad;
      ctx.fillRect(barrelX + 4, barrelY + 5, Math.max(10, plungerX - barrelX - 18), barrelH - 10);

      // 2. Gas Molecule Particle Simulation (Maxwell-Boltzmann root-mean-square thermal scaling)
      const speedFactor = Math.sqrt((temperature + 273.15) / 298.15);
      const activeRightWall = plungerX - 20;

      gasParticles.forEach((p, idx) => {
        // Dynamic molecular reaction based on equilibrium state
        p.type = (idx / GAS_PARTICLE_COUNT < fractionProd) ? "NO2" : "N2O4";

        p.x += p.vx * dt * speedFactor;
        p.y += p.vy * dt * speedFactor;
        p.angle += p.rotSpeed * dt;

        // Wall collisions
        const minX = barrelX + 14;
        const maxX = activeRightWall;
        const minY = barrelY + 14;
        const maxY = barrelY + barrelH - 14;

        if (p.x < minX) { p.x = minX; p.vx = Math.abs(p.vx); }
        if (p.x > maxX) { p.x = maxX; p.vx = -Math.abs(p.vx); }
        if (p.y < minY) { p.y = minY; p.vy = Math.abs(p.vy); }
        if (p.y > maxY) { p.y = maxY; p.vy = -Math.abs(p.vy); }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        if (p.type === "NO2") {
          // Triatomic NO2 Molecule: Amber/Reddish bent configuration (134° angle)
          ctx.fillStyle = "rgba(234, 88, 12, 0.35)";
          ctx.beginPath();
          ctx.arc(0, 0, 9, 0, Math.PI * 2);
          ctx.fill();

          // Central Nitrogen
          ctx.fillStyle = "#ea580c";
          ctx.beginPath();
          ctx.arc(0, -1, 3.8, 0, Math.PI * 2);
          ctx.fill();

          // Two Oxygen satellites
          ctx.fillStyle = "#fb923c";
          ctx.beginPath();
          ctx.arc(-4.5, 4, 3.0, 0, Math.PI * 2);
          ctx.arc(4.5, 4, 3.0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Planar N2O4 Molecule: Translucent Ice-Blue / Colorless complex
          ctx.fillStyle = "rgba(56, 189, 248, 0.22)";
          ctx.beginPath();
          ctx.arc(0, 0, 11, 0, Math.PI * 2);
          ctx.fill();

          // Two Nitrogen atoms
          ctx.fillStyle = "#38bdf8";
          ctx.beginPath();
          ctx.arc(-3.5, 0, 3.2, 0, Math.PI * 2);
          ctx.arc(3.5, 0, 3.2, 0, Math.PI * 2);
          ctx.fill();

          // Four Oxygen satellites
          ctx.fillStyle = "#bae6fd";
          ctx.beginPath();
          ctx.arc(-7, -4.5, 2.4, 0, Math.PI * 2);
          ctx.arc(-7, 4.5, 2.4, 0, Math.PI * 2);
          ctx.arc(7, -4.5, 2.4, 0, Math.PI * 2);
          ctx.arc(7, 4.5, 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // 3. Luer-Lock Glass Nozzle & Stopcock Valve at Left
      const nozzleGrad = ctx.createLinearGradient(0, CY - 14, 0, CY + 14);
      nozzleGrad.addColorStop(0, "rgba(255,255,255,0.45)");
      nozzleGrad.addColorStop(0.5, "rgba(255,255,255,0.12)");
      nozzleGrad.addColorStop(1, "rgba(148,163,184,0.3)");
      ctx.fillStyle = nozzleGrad;
      ctx.fillRect(barrelX - 35, CY - 12, 35, 24);
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(barrelX - 35, CY - 12, 35, 24);

      // Stopcock valve body
      ctx.fillStyle = "#10b981";
      ctx.beginPath();
      ctx.roundRect(barrelX - 24, CY - 20, 12, 40, 3);
      ctx.fill();
      ctx.strokeStyle = "#047857";
      ctx.stroke();

      // 4. Plunger Rubber Stopper Head (Dual O-Rings)
      const stopperW = 20;
      const stopperX = plungerX - stopperW;
      const stopperGrad = ctx.createLinearGradient(0, barrelY + 5, 0, barrelY + barrelH - 5);
      stopperGrad.addColorStop(0, "#334155");
      stopperGrad.addColorStop(0.5, "#0f172a");
      stopperGrad.addColorStop(1, "#020617");
      ctx.fillStyle = stopperGrad;
      ctx.fillRect(stopperX, barrelY + 5, stopperW, barrelH - 10);

      // Dual Sealing O-Ring Ribs with Glint
      ctx.fillStyle = "#475569";
      ctx.fillRect(stopperX + 3, barrelY + 5, 4, barrelH - 10);
      ctx.fillRect(stopperX + 13, barrelY + 5, 4, barrelH - 10);
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 1;
      ctx.strokeRect(stopperX, barrelY + 5, stopperW, barrelH - 10);

      // 5. Stainless Steel Plunger Shaft
      const shaftLen = barrelX + barrelW + 40 - plungerX;
      const shaftGrad = ctx.createLinearGradient(0, CY - 10, 0, CY + 10);
      shaftGrad.addColorStop(0, "#475569");
      shaftGrad.addColorStop(0.35, "#f1f5f9");
      shaftGrad.addColorStop(0.7, "#94a3b8");
      shaftGrad.addColorStop(1, "#334155");
      ctx.fillStyle = shaftGrad;
      ctx.fillRect(plungerX, CY - 9, shaftLen, 18);
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 1;
      ctx.strokeRect(plungerX, CY - 9, shaftLen, 18);

      // Knurled Thumb Grip Flange
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(plungerX + shaftLen, CY - 28, 14, 56, 5);
      ctx.fill();
      ctx.stroke();

      // Knurling grooves
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 1;
      for (let ky = CY - 22; ky <= CY + 22; ky += 6) {
        ctx.beginPath();
        ctx.moveTo(plungerX + shaftLen + 2, ky);
        ctx.lineTo(plungerX + shaftLen + 12, ky);
        ctx.stroke();
      }

      // 6. Outer Borosilicate Glass Cylinder Body
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(barrelX, barrelY, barrelW, barrelH, 8);
      ctx.fill();
      ctx.stroke();

      // Specular Reflection Glare along Top Glass Surface
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fillRect(barrelX + 10, barrelY + 4, barrelW - 20, 3.5);
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.fillRect(barrelX + 10, barrelY + 8, barrelW - 20, 2);

      // Etched Milliliter Measurement Graduations
      ctx.fillStyle = "#e2e8f0";
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1.2;
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";

      const markStart = barrelX + 22;
      const markRange = barrelW - 45;
      for (let i = 0; i <= 6; i++) {
        const mx = markStart + (i / 6) * markRange;
        ctx.beginPath();
        ctx.moveTo(mx, barrelY + 5);
        ctx.lineTo(mx, barrelY + 20);
        ctx.stroke();

        ctx.fillText(`${i * 10}`, mx, barrelY + 32);

        // Sub-ticks
        if (i < 6) {
          for (let s = 1; s < 5; s++) {
            const sx = mx + (s / 5) * (markRange / 6);
            ctx.beginPath();
            ctx.moveTo(sx, barrelY + 5);
            ctx.lineTo(sx, barrelY + 12);
            ctx.stroke();
          }
        }
      }

      // Technical Apparatus Label
      ctx.font = "bold 8px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#94a3b8";
      ctx.textAlign = "left";
      ctx.fillText("BOROSILICATE 3.3 • 60 mL GAS SYRINGE • ±0.5 mL", barrelX + 20, barrelY + barrelH - 12);

    } else {
      // ==========================================
      // AQUEOUS COLORIMETRIC CUVETTE & WATER BATH
      // ==========================================
      const cuvW = 100;
      const cuvH = 200;
      const cuvX = CX - cuvW / 2;
      const cuvY = CY - cuvH / 2 + 10;

      // Outer Thermostatic Jacketed Glass Chamber
      const jacketW = 180;
      const jacketH = 230;
      const jacketX = CX - jacketW / 2;
      const jacketY = CY - jacketH / 2 + 15;

      // Soft shadow
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.beginPath();
      ctx.ellipse(CX, jacketY + jacketH + 12, jacketW / 2 + 15, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Jacketed circulating water
      const waterGrad = ctx.createLinearGradient(0, jacketY, 0, jacketY + jacketH);
      waterGrad.addColorStop(0, "rgba(56, 189, 248, 0.12)");
      waterGrad.addColorStop(1, "rgba(14, 165, 233, 0.22)");
      ctx.fillStyle = waterGrad;
      ctx.beginPath();
      ctx.roundRect(jacketX, jacketY, jacketW, jacketH, [0, 0, 16, 16]);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Water inlet & outlet circulation hose barbs
      ctx.fillStyle = "#f59e0b"; // brass barbs
      ctx.fillRect(jacketX - 16, jacketY + 30, 16, 12);
      ctx.fillRect(jacketX + jacketW, jacketY + jacketH - 45, 16, 12);

      // Spectrophotometer Monochromatic Gaussian Light Beam
      const beamY = CY + 10;
      const beamH = 28;
      const absVal = Math.min(1.8, productConc * 0.85);
      const transmit = Math.pow(10, -absVal);

      // Light beam from left lamp to cuvette
      const beamInGrad = ctx.createLinearGradient(0, beamY - beamH/2, 0, beamY + beamH/2);
      beamInGrad.addColorStop(0, "rgba(250, 204, 21, 0.05)");
      beamInGrad.addColorStop(0.5, "rgba(250, 204, 21, 0.85)");
      beamInGrad.addColorStop(1, "rgba(250, 204, 21, 0.05)");
      ctx.fillStyle = beamInGrad;
      ctx.fillRect(40, beamY - beamH/2, cuvX - 40, beamH);

      // Light beam through and exiting cuvette to detector (attenuated)
      const beamOutGrad = ctx.createLinearGradient(0, beamY - beamH/2, 0, beamY + beamH/2);
      beamOutGrad.addColorStop(0, `rgba(250, 204, 21, ${0.05 * transmit})`);
      beamOutGrad.addColorStop(0.5, `rgba(250, 204, 21, ${0.85 * transmit})`);
      beamOutGrad.addColorStop(1, `rgba(250, 204, 21, ${0.05 * transmit})`);
      ctx.fillStyle = beamOutGrad;
      ctx.fillRect(cuvX + cuvW, beamY - beamH/2, W - (cuvX + cuvW) - 70, beamH);

      // Fused Silica Quartz Cuvette Fluid
      const fluidGrad = ctx.createLinearGradient(cuvX, 0, cuvX + cuvW, 0);
      fluidGrad.addColorStop(0, fluidColor);
      fluidGrad.addColorStop(0.5, fluidColor);
      fluidGrad.addColorStop(1, fluidColor);
      ctx.fillStyle = fluidGrad;
      ctx.beginPath();
      ctx.roundRect(cuvX + 4, cuvY + 25, cuvW - 8, cuvH - 30, [0, 0, 4, 4]);
      ctx.fill();

      // Tyndall Scattering Particles drifting in the light path
      tyndallParticles.forEach(tp => {
        tp.x += tp.vx * dt;
        tp.y += tp.vy * dt;
        if (tp.y < cuvY + 30) tp.y = cuvY + cuvH - 15;
        if (tp.x < cuvX + 8) tp.x = cuvX + cuvW - 12;
        if (tp.x > cuvX + cuvW - 12) tp.x = cuvX + 8;

        const inBeam = Math.abs(tp.y - beamY) < beamH / 2;
        ctx.fillStyle = inBeam ? `rgba(254, 240, 138, ${tp.alpha * 0.95})` : `rgba(255, 255, 255, ${tp.alpha * 0.25})`;
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, inBeam ? tp.size * 1.3 : tp.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Liquid Meniscus at top
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.beginPath();
      ctx.ellipse(CX, cuvY + 25, (cuvW - 8) / 2, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Quartz Cuvette Walls with Refraction Edges
      ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(cuvX, cuvY, cuvW, cuvH, 4);
      ctx.stroke();

      // Frosted vertical grip lines on sides
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1;
      for (let gy = cuvY + 15; gy < cuvY + cuvH - 15; gy += 10) {
        ctx.beginPath();
        ctx.moveTo(cuvX + 2, gy);
        ctx.lineTo(cuvX + 8, gy);
        ctx.moveTo(cuvX + cuvW - 8, gy);
        ctx.lineTo(cuvX + cuvW - 2, gy);
        ctx.stroke();
      }

      // Optical Monochromator Light Housing (Left)
      ctx.fillStyle = "#0f172a";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(35, beamY - 32, 65, 64, 8);
      ctx.fill();
      ctx.stroke();

      // Optical lens barrel
      ctx.fillStyle = "#334155";
      ctx.fillRect(100, beamY - 18, 14, 36);
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 8px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText("COLLIMATOR", 67, beamY - 6);
      ctx.fillText("λ = 450nm", 67, beamY + 10);

      // Digital PIN Photodiode Detector (Right)
      const detX = W - 100;
      ctx.fillStyle = "#0f172a";
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(detX, beamY - 32, 65, 64, 8);
      ctx.fill();
      ctx.stroke();

      // Sensor aperture slit
      ctx.fillStyle = "#334155";
      ctx.fillRect(detX - 12, beamY - 18, 12, 36);

      // Active locked LED indicator
      ctx.fillStyle = "#10b981";
      ctx.shadowColor = "#10b981";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(detX + 16, beamY - 12, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.font = "bold 8px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText("DETECTOR", detX + 38, beamY - 8);
      ctx.fillStyle = "#6ee7b7";
      ctx.fillText(`${(transmit * 100).toFixed(1)}% T`, detX + 38, beamY + 8);
    }
  }

  // Render High-Resolution Vector Mole Fraction Distribution Bar Chart
  function renderChart() {
    const W = chartLogicalW;
    const H = chartLogicalH;
    chartCtx.clearRect(0, 0, W, H);

    const total = Math.max(0.001, reactantConc + productConc);
    const fReag = reactantConc / total;
    const fProd = productConc / total;

    // Outer card boundary
    chartCtx.fillStyle = "rgba(15, 23, 42, 0.6)";
    chartCtx.fillRect(0, 0, W, H);

    // Percentage Labels
    chartCtx.font = "bold 10px 'JetBrains Mono', monospace";
    chartCtx.textAlign = "left";
    chartCtx.fillStyle = "#38bdf8";
    chartCtx.fillText(`■ [Reactants]: ${(fReag * 100).toFixed(1)}%`, 35, 20);

    chartCtx.textAlign = "right";
    chartCtx.fillStyle = "#fb923c";
    chartCtx.fillText(`■ [Products]: ${(fProd * 100).toFixed(1)}%`, W - 35, 20);

    // Mole Fraction Progress Bar
    const barX = 35;
    const barY = 28;
    const barW = W - 70;
    const barH = 26;
    const reagW = barW * fReag;

    // Reactant Fill (Sky Blue)
    const reagGrad = chartCtx.createLinearGradient(barX, 0, barX + reagW, 0);
    reagGrad.addColorStop(0, "#0284c7");
    reagGrad.addColorStop(1, "#38bdf8");
    chartCtx.fillStyle = reagGrad;
    chartCtx.beginPath();
    chartCtx.roundRect(barX, barY, Math.max(4, reagW), barH, [6, 0, 0, 6]);
    chartCtx.fill();

    // Product Fill (Vibrant Amber/Orange)
    const prodGrad = chartCtx.createLinearGradient(barX + reagW, 0, barX + barW, 0);
    prodGrad.addColorStop(0, "#ea580c");
    prodGrad.addColorStop(1, "#f97316");
    chartCtx.fillStyle = prodGrad;
    chartCtx.beginPath();
    chartCtx.roundRect(barX + reagW, barY, Math.max(4, barW - reagW), barH, [0, 6, 6, 0]);
    chartCtx.fill();

    // Metallic Bevel Frame
    chartCtx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    chartCtx.lineWidth = 1.5;
    chartCtx.beginPath();
    chartCtx.roundRect(barX, barY, barW, barH, 6);
    chartCtx.stroke();

    // Dividing Line & Equilibrium Needle Diamond
    const splitX = barX + reagW;
    chartCtx.strokeStyle = "#ffffff";
    chartCtx.lineWidth = 2.5;
    chartCtx.beginPath();
    chartCtx.moveTo(splitX, barY - 2);
    chartCtx.lineTo(splitX, barY + barH + 2);
    chartCtx.stroke();

    // Glowing Diamond Indicator
    chartCtx.fillStyle = "#ffffff";
    chartCtx.shadowColor = "#38bdf8";
    chartCtx.shadowBlur = 6;
    chartCtx.beginPath();
    chartCtx.moveTo(splitX, barY - 4);
    chartCtx.lineTo(splitX + 4, barY);
    chartCtx.lineTo(splitX, barY + 4);
    chartCtx.lineTo(splitX - 4, barY);
    chartCtx.closePath();
    chartCtx.fill();
    chartCtx.shadowBlur = 0;

    // Le Chatelier Dynamic Equilibrium Gauge Panel
    const Kc = getEquilibriumConstant(temperature);
    const currentQ = productConc / Math.max(0.001, reactantConc);
    const isEquilibrium = Math.abs(currentQ - Kc) / Kc < 0.08;
    const isForward = currentQ < Kc;

    const gaugeY = 74;
    chartCtx.fillStyle = "rgba(2, 6, 23, 0.75)";
    chartCtx.strokeStyle = isEquilibrium ? "rgba(16, 185, 129, 0.4)" : (isForward ? "rgba(56, 189, 248, 0.4)" : "rgba(249, 115, 22, 0.4)");
    chartCtx.lineWidth = 1;
    chartCtx.beginPath();
    chartCtx.roundRect(barX, gaugeY, barW, 44, 6);
    chartCtx.fill();
    chartCtx.stroke();

    // Reaction Quotient & Constant Readout
    chartCtx.font = "bold 10px 'JetBrains Mono', monospace";
    chartCtx.fillStyle = "#cbd5e1";
    chartCtx.textAlign = "left";
    chartCtx.fillText(`Reaction Quotient Q = ${currentQ.toFixed(4)}`, barX + 12, gaugeY + 18);

    chartCtx.textAlign = "right";
    chartCtx.fillStyle = "#a7f3d0";
    chartCtx.fillText(`Constant Kc = ${Kc.toFixed(4)}`, barX + barW - 12, gaugeY + 18);

    // Directional Le Chatelier Indicator Badge
    chartCtx.font = "bold 9.5px 'JetBrains Mono', monospace";
    chartCtx.textAlign = "center";
    if (isEquilibrium) {
      chartCtx.fillStyle = "#10b981";
      chartCtx.fillText("⚖️ DYNAMIC EQUILIBRIUM: Rates Balanced (Q ≈ Kc)", barX + barW / 2, gaugeY + 34);
    } else if (isForward) {
      chartCtx.fillStyle = "#38bdf8";
      chartCtx.fillText("➡️ LE CHATELIER SHIFT: Driving Forward → Products (Q < Kc)", barX + barW / 2, gaugeY + 34);
    } else {
      chartCtx.fillStyle = "#f97316";
      chartCtx.fillText("⬅️ LE CHATELIER SHIFT: Driving Reverse ← Reactants (Q > Kc)", barX + barW / 2, gaugeY + 34);
    }
  }

  // Dynamic Kinetics & Brownian Simulation Loop
  let lastTime = performance.now();
  function loop(currentTime) {
    const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
    lastTime = currentTime;
    elapsedSeconds += dt;

    const Kc = getEquilibriumConstant(temperature);
    const volumeFactor = activeSys.phase === "gas" ? syringeVolume : 1.0;
    const effectiveKc = Kc * volumeFactor;

    const targetProduct = (effectiveKc / (1 + effectiveKc)) * 1.5;
    const targetReactant = 1.5 - targetProduct;

    const diffR = targetReactant - reactantConc;
    const diffP = targetProduct - productConc;
    const isRelaxing = Math.abs(diffR) > 0.0005 || Math.abs(diffP) > 0.0005;

    if (!container || !container.isConnected) {
      if (animId) cancelAnimationFrame(animId);
      return;
    }

    const isSmart = (document.documentElement.getAttribute("data-mode") === "smartboard") ||
                    document.documentElement.classList.contains("fast-smartboard-mode") ||
                    /Android|MAXHUB/i.test(navigator.userAgent);
    const interval = isSmart ? 33.3 : 16.0;

    const photoOverlay = container.querySelector("#equilibrium-photo-overlay");
    const isPhotoOverlay = photoOverlay && photoOverlay.style.display === "block";

    if (!isPhotoOverlay) {
      if (!currentTime || currentTime - lastFrameTime >= interval) {
        lastFrameTime = currentTime || performance.now();

        if (isRelaxing) {
          reactantConc += diffR * 0.08;
          productConc += diffP * 0.08;
        }

        const currentQ = productConc / Math.max(0.001, reactantConc);
        const absVal = Math.min(1.8, productConc * 0.85);

        // Update Live DOM Telemetry
        dispQ.innerText = `Q = ${currentQ.toFixed(4)} • K_c = ${Kc.toFixed(4)}`;
        dispAbs.innerText = `${absVal.toFixed(3)} AU`;
        dispTemp.innerText = `${temperature.toFixed(1)} °C`;

        if (Math.abs(currentQ - Kc) / Kc < 0.08) {
          dispEqStatus.innerText = "⚖️ Dynamic Equilibrium Reached (Q ≈ K_c)";
          dispShift.innerText = "➡️ Equilibrium Shift: Stationary (Forward Rate = Reverse Rate)";
        } else if (currentQ < Kc) {
          dispEqStatus.innerText = "➡️ Forward Reaction Driving (Q < K_c)";
          dispShift.innerText = "➡️ Shifting Right toward Products (Producing Color)";
        } else {
          dispEqStatus.innerText = "⬅️ Reverse Reaction Driving (Q > K_c)";
          dispShift.innerText = "⬅️ Shifting Left toward Reactants (Reversing Color)";
        }

        renderCell(dt);
        if (isRelaxing || needsRedraw) {
          renderChart();
          needsRedraw = false;
        }
      }
    }

    animId = requestAnimationFrame(loop);
  }
  animId = requestAnimationFrame(loop);

  // --- EVENT LISTENERS ---
  const btnSim = container.querySelector("#view-mode-eq-sim");
  const btnPhoto = container.querySelector("#view-mode-eq-photo");
  const photoOverlay = container.querySelector("#equilibrium-photo-overlay");

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

  container.querySelector("#btn-eq-reset")?.addEventListener("click", () => {
    temperature = 25;
    syringeVolume = 1.0;
    container.querySelector("#slider-eq-temp").value = 25;
    container.querySelector("#lbl-temp").innerText = "25 °C";
    if (container.querySelector("#slider-eq-volume")) {
      container.querySelector("#slider-eq-volume").value = 1.0;
      container.querySelector("#lbl-volume").innerText = "1.00× (P = 1.00 atm)";
    }
    needsRedraw = true;
    SoundFX.playClick();
  });

  // Switch systems
  container.querySelectorAll("[data-sys]").forEach(btn => {
    btn.addEventListener("click", () => {
      container.querySelectorAll("[data-sys]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentKey = btn.dataset.sys;
      activeSys = EQUILIBRIUM_SYSTEMS[currentKey];
      container.querySelector("#block-volume-slider").style.display = activeSys.phase === "gas" ? "block" : "none";
      reactantConc = 1.0;
      productConc = 0.2;
      needsRedraw = true;
      SoundFX.playClick();
    });
  });

  // Sliders
  container.querySelector("#slider-eq-temp")?.addEventListener("input", (e) => {
    temperature = parseFloat(e.target.value);
    container.querySelector("#lbl-temp").innerText = `${temperature} °C`;
    needsRedraw = true;
  });

  container.querySelector("#slider-eq-volume")?.addEventListener("input", (e) => {
    syringeVolume = parseFloat(e.target.value);
    container.querySelector("#lbl-volume").innerText = `${syringeVolume.toFixed(2)}× (P = ${(1/syringeVolume).toFixed(2)} atm)`;
    needsRedraw = true;
  });

  // Stress Buttons
  container.querySelector("#btn-add-reactant")?.addEventListener("click", () => {
    reactantConc += 0.8;
    needsRedraw = true;
    SoundFX.playSwitchSnap();
  });

  container.querySelector("#btn-add-product")?.addEventListener("click", () => {
    productConc += 0.8;
    needsRedraw = true;
    SoundFX.playSwitchSnap();
  });

  container.querySelector("#btn-remove-stress")?.addEventListener("click", () => {
    reactantConc = 1.0;
    productConc = 0.5;
    needsRedraw = true;
    SoundFX.playClick();
  });

  // Export CSV
  container.querySelector("#btn-eq-export")?.addEventListener("click", () => {
    const Kc = getEquilibriumConstant(temperature);
    exportLabDataCsv({
      title: "Chemical Equilibrium & Le Chatelier Telemetry",
      labId: "equilibrium",
      parameters: {
        "Reaction System": activeSys.name,
        "Chemical Equation": activeSys.equation,
        "Temperature (°C)": temperature,
        "Equilibrium Constant Kc": Kc.toFixed(4),
        "Gas Volume Ratio": syringeVolume,
        "Pressure (atm)": (1 / syringeVolume).toFixed(2),
        "Reactant Concentration": reactantConc.toFixed(3),
        "Product Concentration": productConc.toFixed(3)
      },
      headers: ["Parameter", "Value"],
      dataRows: [
        ["System", activeSys.name],
        ["Temperature (C)", temperature],
        ["Equilibrium Constant Kc", Kc.toFixed(4)],
        ["Current Q", (productConc / reactantConc).toFixed(4)],
        ["Absorbance (AU)", (productConc * 0.85).toFixed(3)]
      ]
    });
  });

  // Standardized Hotkey: 'e' or 'E' triggers CSV telemetry export
  const handleKeyDown = (e) => {
    if ((e.key === "e" || e.key === "E") && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      container.querySelector("#btn-eq-export")?.click();
    }
  };
  window.addEventListener("keydown", handleKeyDown);

  // Mount Post-Lab Checkpoint Assessment
  mountLabCheckpoint("eq-checkpoint-container", "equilibrium");

  return () => {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("keydown", handleKeyDown);
  };
}
