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
          <button class="btn btn-secondary btn-sm" id="btn-eq-export" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export Telemetry
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
            <img src="assets/labs/equilibrium_bench.jpg" alt="4K Spectrophotometer & Equilibrium Laboratory Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            
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

  // Van 't Hoff Equation for K_c(T)
  function getEquilibriumConstant(T_celsius) {
    const T_kelvin = T_celsius + 273.15;
    const R = 8.314; // J/(mol·K)
    const T_ref = 298.15;
    // ln(K2/K1) = -(deltaH / R) * (1/T2 - 1/T1)
    const exponent = -(activeSys.deltaH * 1000 / R) * ((1 / T_kelvin) - (1 / T_ref));
    return activeSys.K_ref * Math.exp(exponent);
  }

  // Render Visual Reaction Cell & Gas Syringe
  function renderCell() {
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

    // Calculate Current Color Interpolation
    const totalConc = reactantConc + productConc;
    const fractionProd = Math.max(0, Math.min(1, productConc / Math.max(0.001, totalConc)));
    const c1 = activeSys.colorStart;
    const c2 = activeSys.colorEnd;
    const r = Math.round(c1[0] + fractionProd * (c2[0] - c1[0]));
    const g = Math.round(c1[1] + fractionProd * (c2[1] - c1[1]));
    const b = Math.round(c1[2] + fractionProd * (c2[2] - c1[2]));
    const fluidColor = `rgba(${r}, ${g}, ${b}, ${0.55 + fractionProd * 0.35})`;

    if (activeSys.phase === "gas") {
      // Draw Gas Syringe Apparatus
      const barrelW = 260;
      const barrelH = 90;
      const barrelX = CX - barrelW/2;
      const barrelY = CY - barrelH/2;

      // Outer Glass Barrel
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(barrelX, barrelY, barrelW, barrelH, 8);
      ctx.fill();
      ctx.stroke();

      // Plunger position based on syringeVolume (0.5 to 2.5)
      const plungerMaxTravel = barrelW - 40;
      const plungerX = barrelX + (syringeVolume / 2.5) * plungerMaxTravel;

      // Filled Gas Volume
      ctx.fillStyle = fluidColor;
      ctx.fillRect(barrelX + 4, barrelY + 4, plungerX - barrelX - 4, barrelH - 8);

      // Gas Molecules Particles Simulation
      const numParticles = Math.round(35 * (1 / syringeVolume));
      for (let i = 0; i < numParticles; i++) {
        const px = barrelX + 12 + Math.abs(Math.sin(elapsedSeconds * 2 + i * 13) * (plungerX - barrelX - 24));
        const py = barrelY + 12 + Math.abs(Math.cos(elapsedSeconds * 2.5 + i * 19) * (barrelH - 24));
        const isProduct = (i % 2 === 0);
        ctx.fillStyle = isProduct ? "#ea580c" : "#38bdf8";
        ctx.beginPath();
        ctx.arc(px, py, isProduct ? 3.5 : 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Plunger Stopper Head (Black Rubber Gasket)
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 2;
      ctx.fillRect(plungerX - 12, barrelY + 4, 16, barrelH - 8);

      // Plunger Rod & Handle
      ctx.fillStyle = "#cbd5e1";
      ctx.fillRect(plungerX + 4, CY - 10, barrelW + 30 - plungerX, 20);
      ctx.beginPath();
      ctx.roundRect(barrelX + barrelW + 20, CY - 25, 14, 50, 4);
      ctx.fill();

      // Graduation Ticks on Barrel
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;
      for (let x = barrelX + 20; x < barrelX + barrelW - 10; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, barrelY + 4);
        ctx.lineTo(x, barrelY + 16);
        ctx.stroke();
      }
    } else {
      // Aqueous Reaction Cuvette in Optical Chamber
      const cuvW = 140;
      const cuvH = 220;
      const cuvX = CX - cuvW/2;
      const cuvY = CY - cuvH/2 + 20;

      // Optical Spectrophotometer Light Beam
      const beamGrad = ctx.createLinearGradient(0, CY, W, CY);
      beamGrad.addColorStop(0, "rgba(250, 204, 21, 0.8)");
      beamGrad.addColorStop(0.35, "rgba(250, 204, 21, 0.8)");
      beamGrad.addColorStop(0.65, "rgba(250, 204, 21, 0.2)");
      beamGrad.addColorStop(1, "rgba(250, 204, 21, 0.1)");
      ctx.fillStyle = beamGrad;
      ctx.fillRect(0, CY - 12, W, 24);

      // Borosilicate Cuvette Body
      ctx.fillStyle = fluidColor;
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cuvX, cuvY, cuvW, cuvH, 8);
      ctx.fill();
      ctx.stroke();

      // Liquid Meniscus at top
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.beginPath();
      ctx.ellipse(CX, cuvY + 10, cuvW/2 - 4, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Photocell Detector Head on Right
      ctx.fillStyle = "#0f172a";
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(CX + cuvW/2 + 30, CY - 35, 60, 70, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#22c55e";
      ctx.font = "bold 9px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("DETECTOR", CX + cuvW/2 + 60, CY);
    }
  }

  // Render Distribution Bar Chart
  function renderChart() {
    const W = chartCanvas.width;
    const H = chartCanvas.height;
    chartCtx.clearRect(0, 0, W, H);

    const total = reactantConc + productConc;
    const fReag = reactantConc / total;
    const fProd = productConc / total;

    // Background Bar
    const barX = 50;
    const barY = 35;
    const barW = W - 100;
    const barH = 30;

    // Reactant segment
    chartCtx.fillStyle = "#38bdf8";
    chartCtx.fillRect(barX, barY, barW * fReag, barH);

    // Product segment
    chartCtx.fillStyle = "#f97316";
    chartCtx.fillRect(barX + barW * fReag, barY, barW * fProd, barH);

    // Outer border
    chartCtx.strokeStyle = "#cbd5e1";
    chartCtx.lineWidth = 1.5;
    chartCtx.strokeRect(barX, barY, barW, barH);

    // Labels
    chartCtx.fillStyle = "#cbd5e1";
    chartCtx.font = "bold 11px system-ui";
    chartCtx.textAlign = "left";
    chartCtx.fillText(`[Reactants]: ${(fReag * 100).toFixed(1)}%`, barX, 24);
    chartCtx.textAlign = "right";
    chartCtx.fillText(`[Products]: ${(fProd * 100).toFixed(1)}%`, barX + barW, 24);

    chartCtx.font = "10px monospace";
    chartCtx.fillStyle = "#94a3b8";
    chartCtx.textAlign = "center";
    chartCtx.fillText(`Current Reaction Ratio Q = ${(productConc / Math.max(0.001, reactantConc)).toFixed(3)}`, W / 2, barY + barH + 28);
  }

  // Dynamic Kinetics Update Loop
  let lastTime = performance.now();
  function loop(currentTime) {
    const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
    lastTime = currentTime;
    elapsedSeconds += dt;

    // Equilibrium constant K_c at current temperature
    const Kc = getEquilibriumConstant(temperature);

    // Target product concentration based on Kc and volume
    const volumeFactor = activeSys.phase === "gas" ? syringeVolume : 1.0;
    const effectiveKc = Kc * volumeFactor;

    // Dynamic shift toward equilibrium
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
      if (isRelaxing) {
        if (!currentTime || currentTime - lastFrameTime >= interval) {
          lastFrameTime = currentTime || performance.now();
          reactantConc += diffR * 0.08;
          productConc += diffP * 0.08;

          const currentQ = productConc / Math.max(0.001, reactantConc);
          const absVal = Math.min(1.8, productConc * 0.85);

          // Telemetry updates
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

          renderCell();
          renderChart();
        }
      } else if (needsRedraw) {
        const currentQ = productConc / Math.max(0.001, reactantConc);
        const absVal = Math.min(1.8, productConc * 0.85);

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

        renderCell();
        renderChart();
        needsRedraw = false;
      }
    }

    animId = requestAnimationFrame(loop);
  }
  let lastFrameTime = 0;
  let needsRedraw = true;
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

  // Mount Post-Lab Checkpoint Assessment
  mountLabCheckpoint("eq-checkpoint-container", "equilibrium");

  return () => {
    if (animId) cancelAnimationFrame(animId);
  };
}
