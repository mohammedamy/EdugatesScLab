// Edugates-ClipSAT Science Labs - Chemistry: Calorimetry & Thermochemistry Suite
// High-Precision Thermodynamics Simulation:
// Solution & Bomb Calorimetry, Specific Heat Capacity Determination, Enthalpy of Neutralization (ΔH_neut),
// Heats of Solution (Exo/Endothermic), Heat Capacity Calibration (C_cal), and Live Thermal Cooling Correction Curves.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initCalorimetryLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Calorimetry Modes and Chemical Systems
  const SYSTEMS = {
    neutralization: {
      name: "Acid-Base Neutralization (HCl + NaOH)",
      type: "solution",
      reaction: "HCl(aq) + NaOH(aq) \\to NaCl(aq) + H_2O(l)",
      deltaH_theo: -57.1, // kJ/mol
      defaultMass: 100, // g solution (50mL 1M + 50mL 1M)
      c_spec: 4.184, // J/(g·°C)
      moles: 0.050, // mol H2O formed
      isExo: true,
      desc: "Strong acid / strong base exothermic neutralization releasing 57.1 kJ/mol of water formed."
    },
    dissolution_exo: {
      name: "Dissolution of Calcium Chloride (CaCl₂)",
      type: "solution",
      reaction: "CaCl_2(s) \\xrightarrow{H_2O} Ca^{2+}(aq) + 2Cl^-(aq)",
      deltaH_theo: -82.8, // kJ/mol
      defaultMass: 105, // 100g water + 5g CaCl2
      c_spec: 4.184,
      moles: 0.045, // 5g / 110.98 g/mol
      isExo: true,
      desc: "Highly exothermic lattice disruption and hydration enthalpy of divalent calcium ions."
    },
    dissolution_endo: {
      name: "Dissolution of Ammonium Nitrate (NH₄NO₃)",
      type: "solution",
      reaction: "NH_4NO_3(s) \\xrightarrow{H_2O} NH_4^+(aq) + NO_3^-(aq)",
      deltaH_theo: +25.7, // kJ/mol (Instant cold pack)
      defaultMass: 108, // 100g water + 8g NH4NO3
      c_spec: 4.184,
      moles: 0.100, // 8g / 80.04 g/mol
      isExo: false,
      desc: "Endothermic cold pack reaction where crystal lattice energy exceeds hydration enthalpy."
    },
    bomb_combustion: {
      name: "Bomb Combustion of Benzoic Acid (C₇H₆O₂)",
      type: "bomb",
      reaction: "2 C_7H_6O_2(s) + 15 O_2(g) \\to 14 CO_2(g) + 6 H_2O(l)",
      deltaH_theo: -3227.0, // kJ/mol
      defaultMass: 1000, // 1000g water jacket
      c_spec: 4.184,
      moles: 0.00819, // 1.000g / 122.12 g/mol
      isExo: true,
      desc: "High-precision Parr oxygen bomb combustion used for primary calorimeter heat capacity calibration."
    }
  };

  // State Variables
  let currentSystemKey = "neutralization";
  let activeSystem = SYSTEMS[currentSystemKey];
  let c_calorimeter = 45; // J/°C (calorimeter constant)
  let stirrerSpeed = 420; // RPM
  let initialTemp = 22.0; // °C
  let currentTemp = 22.0;
  let maxTemp = 22.0;
  let reactionTriggered = false;
  let reactionProgress = 0; // 0 to 1
  let isRunning = true;
  let elapsedSeconds = 0;
  let coolingConstant = 0.00045; // Newton's Law of cooling to ambient
  let animId = null;

  // Temperature Time-Series History
  const timeSeries = []; // { t, temp }

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #f43f5e; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #f43f5e; box-shadow: 0 0 10px #f43f5e;"></span>
            Precision Calorimetry &amp; Enthalpy Suite
          </span>
          <span class="badge" style="background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.3); color: #fb7185; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            ${renderLatex("q = mc\\Delta T + C_{\\text{cal}}\\Delta T \\quad \\bullet \\quad \\text{First Law of Thermodynamics}")}
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-cal-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Dewar Apparatus
            </button>
            <button id="view-mode-cal-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Parr Bench
            </button>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-cal-start-rxn" style="padding: 5px 14px; font-size: 0.78rem; background: #dc2626; color: #fff; border: none; font-weight: 700;">
            🔥 Ignite / Mix Reagents
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-cal-reset" style="padding: 5px 12px; font-size: 0.78rem;">
            ⟲ Reset Cell
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-cal-export" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;" title="Export thermal calorimetry reaction telemetry as RFC-4180 CSV (Shortcut: E)" aria-label="Export Telemetry as CSV (Shortcut: E)">
            📥 Export Telemetry (E)
          </button>
        </div>
      </div>

      <!-- Main Workstation Layout: Calorimeter Apparatus on Left, Live Thermal Graph on Right -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="calorimetry-layout">
        <!-- Left: Apparatus Canvas Viewport -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(244, 63, 94, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #111827 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="calorimetry-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
          <div id="calorimetry-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <picture>
              <source srcset="assets/labs/calorimetry_bench.webp" type="image/webp">
              <img src="assets/labs/calorimetry_bench.jpg" decoding="async" loading="lazy" alt="4K Parr Bomb Calorimeter Laboratory Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            </picture>
            
            <!-- Live Analytical Telemetry Callout on Photo -->
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(244, 63, 94, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Parr 6200 Isoperibol Calorimeter</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">0.0001°C Quartz Thermistor</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Heavy Alloy Bomb Reactor</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">30 atm Pure O₂ Sealed Vessel</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Circulating Water Jacket</div>
                <div style="color: #fb7185; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">C_cal = 45.0 J/°C Calibrated</div>
              </div>
            </div>
          </div>

          <!-- Top HUD: Digital Thermometer & Energy Readouts -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(244, 63, 94, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">PRECISION TEMPERATURE</div>
              <div style="font-weight: 800; font-size: 1.35rem; color: #fb7185; font-family: var(--font-mono);" id="disp-temp-val">22.000 °C</div>
              <div style="font-size: 0.74rem; color: #94a3b8; font-family: var(--font-mono);" id="disp-delta-t">ΔT = +0.000 °C</div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">HEAT EXCHANGED (q_rxn)</div>
              <div style="font-weight: 800; font-size: 1.25rem; color: #38bdf8; font-family: var(--font-mono);" id="disp-heat-val">0.00 kJ</div>
              <div style="font-size: 0.74rem; color: #34d399; font-family: var(--font-mono);" id="disp-deltah-val">ΔH = -- kJ/mol</div>
            </div>
          </div>

          <!-- Bottom Status Pill -->
          <div style="position: absolute; bottom: 12px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: center; pointer-events: none; font-family: var(--font-mono); font-size: 0.74rem; color: #94a3b8;">
            <span style="background: rgba(0,0,0,0.65); padding: 4px 10px; border-radius: 6px;" id="disp-status-bottom">
              ⚡ Status: Thermal Equilibrium at 22.0°C
            </span>
            <span style="background: rgba(0,0,0,0.65); padding: 4px 10px; border-radius: 6px;">
              🔄 Stirrer: <span id="disp-stirrer-val">420 RPM</span>
            </span>
          </div>
        </div>

        <!-- Right: Temperature Curve Graph & Experimental Controls -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <!-- System Selection Card -->
          <div class="lab-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px;">
            <label style="font-size: 0.8rem; font-weight: 700; color: #fb7185; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">
              Thermodynamic System Selection
            </label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <button class="btn btn-secondary btn-sm ${currentSystemKey === 'neutralization' ? 'active' : ''}" data-system="neutralization" style="font-size: 0.74rem; padding: 7px;">
                HCl + NaOH (Neutralization)
              </button>
              <button class="btn btn-secondary btn-sm ${currentSystemKey === 'dissolution_exo' ? 'active' : ''}" data-system="dissolution_exo" style="font-size: 0.74rem; padding: 7px;">
                CaCl₂ Dissolution (Exothermic)
              </button>
              <button class="btn btn-secondary btn-sm ${currentSystemKey === 'dissolution_endo' ? 'active' : ''}" data-system="dissolution_endo" style="font-size: 0.74rem; padding: 7px;">
                NH₄NO₃ Cold Pack (Endo)
              </button>
              <button class="btn btn-secondary btn-sm ${currentSystemKey === 'bomb_combustion' ? 'active' : ''}" data-system="bomb_combustion" style="font-size: 0.74rem; padding: 7px;">
                Benzoic Acid (Bomb)
              </button>
            </div>
            <div style="margin-top: 8px; font-size: 0.78rem; color: #cbd5e1; background: rgba(0,0,0,0.25); padding: 8px 12px; border-radius: 6px;" id="disp-rxn-desc">
              ${activeSystem.desc}
            </div>
          </div>

          <!-- Parameter Sliders -->
          <div class="lab-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px;">
            <label style="font-size: 0.8rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">
              Apparatus Parameters
            </label>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>Calorimeter Heat Capacity (C_cal)</span>
                  <span style="color: #38bdf8; font-weight: 700;" id="lbl-c-cal">${c_calorimeter} J/°C</span>
                </div>
                <input type="range" id="slider-c-cal" min="10" max="150" step="5" value="${c_calorimeter}" style="width: 100%; accent-color: #38bdf8;">
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>Magnetic Stirrer Velocity</span>
                  <span style="color: #facc15; font-weight: 700;" id="lbl-stirrer">${stirrerSpeed} RPM</span>
                </div>
                <input type="range" id="slider-stirrer" min="100" max="900" step="50" value="${stirrerSpeed}" style="width: 100%; accent-color: #facc15;">
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>Initial Baseline Water Bath Temp</span>
                  <span style="color: #fb7185; font-weight: 700;" id="lbl-init-temp">${initialTemp.toFixed(1)} °C</span>
                </div>
                <input type="range" id="slider-init-temp" min="15.0" max="30.0" step="0.5" value="${initialTemp}" style="width: 100%; accent-color: #fb7185;">
              </div>
            </div>
          </div>

          <!-- Real-Time Temperature vs Time Graph -->
          <div class="lab-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px; flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 0.8rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em;">
                Isoperibol Thermogram: T(t) with Extrapolation
              </span>
              <span style="font-size: 0.72rem; color: #94a3b8; font-family: var(--font-mono);">Sampling: 10 Hz</span>
            </div>
            <canvas id="cal-graph-canvas" width="420" height="150" style="width: 100%; height: 150px; display: block; border-radius: 6px; background: #030712; border: 1px solid rgba(255,255,255,0.08);"></canvas>
          </div>
        </div>
      </div>

      <!-- Post-Lab CER Checkpoint Assessment -->
      <div id="cal-checkpoint-container" style="margin-top: 24px;"></div>
    </div>
  `;

  // Canvas References
  const canvas = container.querySelector("#calorimetry-canvas");
  const ctx = canvas.getContext("2d");
  const graphCanvas = container.querySelector("#cal-graph-canvas");
  const graphCtx = graphCanvas.getContext("2d");

  // Telemetry DOM elements
  const dispTemp = container.querySelector("#disp-temp-val");
  const dispDeltaT = container.querySelector("#disp-delta-t");
  const dispHeat = container.querySelector("#disp-heat-val");
  const dispDeltaH = container.querySelector("#disp-deltah-val");
  const dispStatus = container.querySelector("#disp-status-bottom");
  const dispStirrer = container.querySelector("#disp-stirrer-val");

  // Reset Simulation Function
  function resetCell() {
    currentTemp = initialTemp;
    maxTemp = initialTemp;
    reactionTriggered = false;
    reactionProgress = 0;
    elapsedSeconds = 0;
    timeSeries.length = 0;
    for (let i = 0; i < 15; i++) {
      timeSeries.push({ t: i * 0.5, temp: initialTemp });
    }
    updateTelemetry();
  }
  resetCell();

  // Reaction Trigger
  function triggerReaction() {
    if (reactionTriggered) return;
    reactionTriggered = true;
    reactionProgress = 0;
    SoundFX.playPop();
  }

  // Update Calculation
  function updateTelemetry() {
    const deltaT = currentTemp - initialTemp;
    // q_solution = m * c * deltaT + C_cal * deltaT
    const q_total_J = (activeSystem.defaultMass * activeSystem.c_spec * deltaT) + (c_calorimeter * deltaT);
    const q_rxn_kJ = -q_total_J / 1000;
    const deltaH_exp = activeSystem.moles > 0 ? (q_rxn_kJ / activeSystem.moles) : 0;

    dispTemp.innerText = `${currentTemp.toFixed(3)} °C`;
    dispDeltaT.innerText = `ΔT = ${deltaT >= 0 ? "+" : ""}${deltaT.toFixed(3)} °C`;
    dispHeat.innerText = `${q_rxn_kJ.toFixed(2)} kJ`;
    dispDeltaH.innerText = `ΔH_exp = ${deltaH_exp.toFixed(1)} kJ/mol (Theo: ${activeSystem.deltaH_theo} kJ/mol)`;

    if (!reactionTriggered) {
      dispStatus.innerText = "⚡ Status: Baseline Steady-State";
    } else if (reactionProgress < 1.0) {
      dispStatus.innerText = `🔥 Status: Active Reaction in Progress (${Math.round(reactionProgress * 100)}%)`;
    } else {
      dispStatus.innerText = "❄️ Status: Post-Peak Newton Cooling Phase";
    }
  }

  // Render 60 FPS HTML5 Canvas Simulation
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

    // Center Calorimeter Base at (CX, CY)
    const CX = W * 0.48;
    const CY = 290;
    const dewarW = 210;
    const dewarH = 260;

    // Outer Insulated Shell (Double-Walled Silver/Steel Dewar)
    const shellGrad = ctx.createLinearGradient(CX - dewarW/2, 0, CX + dewarW/2, 0);
    shellGrad.addColorStop(0, "#475569");
    shellGrad.addColorStop(0.3, "#94a3b8");
    shellGrad.addColorStop(0.7, "#64748b");
    shellGrad.addColorStop(1, "#1e293b");

    ctx.fillStyle = shellGrad;
    ctx.beginPath();
    ctx.roundRect(CX - dewarW/2, CY - dewarH/2 + 20, dewarW, dewarH, 16);
    ctx.fill();
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Vacuum Insulation Gap Line
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(CX - dewarW/2 + 8, CY - dewarH/2 + 26, dewarW - 16, dewarH - 12);
    ctx.setLineDash([]);

    // Insulated Calorimeter Lid (Polyurethane / Polystyrene)
    ctx.fillStyle = "#334155";
    ctx.beginPath();
    ctx.roundRect(CX - dewarW/2 - 10, CY - dewarH/2 + 10, dewarW + 20, 26, 6);
    ctx.fill();
    ctx.stroke();

    // Inner Solution Chamber
    const innerW = dewarW - 40;
    const innerH = dewarH - 50;
    const innerX = CX - innerW/2;
    const innerY = CY - dewarH/2 + 36;

    // Solution Fluid Color depending on reaction
    let fluidColor = "rgba(56, 189, 248, 0.55)";
    if (activeSystem.isExo && reactionTriggered) {
      const heatFactor = Math.min(1, (currentTemp - initialTemp) / 8);
      fluidColor = `rgba(${Math.round(56 + heatFactor * 180)}, ${Math.round(189 - heatFactor * 100)}, ${Math.round(248 - heatFactor * 150)}, 0.65)`;
    } else if (!activeSystem.isExo && reactionTriggered) {
      fluidColor = "rgba(147, 197, 253, 0.7)";
    }

    ctx.fillStyle = fluidColor;
    ctx.beginPath();
    ctx.roundRect(innerX, innerY + 30, innerW, innerH - 30, 8);
    ctx.fill();

    // Stirrer Vortex Depression
    if (stirrerSpeed > 0) {
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.beginPath();
      ctx.ellipse(CX, innerY + 30, 30, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Stirrer Central Shaft & Rotating Impeller Blades
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(CX, CY - dewarH/2 - 40);
    ctx.lineTo(CX, CY + dewarH/2 - 25);
    ctx.stroke();

    // Rotating Impeller Blade
    const bladeAngle = (elapsedSeconds * (stirrerSpeed / 60) * Math.PI * 2) % (Math.PI * 2);
    const bladeW = Math.cos(bladeAngle) * 35;
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(CX - bladeW, CY + dewarH/2 - 30);
    ctx.lineTo(CX + bladeW, CY + dewarH/2 - 30);
    ctx.stroke();

    // Top Stirrer Motor Housing
    ctx.fillStyle = "#0f172a";
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(CX - 28, CY - dewarH/2 - 75, 56, 40, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 9px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("STIR MOTOR", CX, CY - dewarH/2 - 50);

    // Digital Thermometer Glass Shaft with Thermistor Probe
    const thermX = CX - 50;
    const thermY1 = CY - dewarH/2 - 110;
    const thermY2 = CY + dewarH/2 - 30;

    // Glass Stem
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;
    ctx.fillRect(thermX - 3, thermY1, 6, thermY2 - thermY1);
    ctx.strokeRect(thermX - 3, thermY1, 6, thermY2 - thermY1);

    // Red Mercury / Alcohol Column
    const tempHeightRatio = Math.max(0.1, Math.min(0.95, (currentTemp - 15) / 25));
    const colHeight = (thermY2 - thermY1) * tempHeightRatio;
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(thermX - 1.5, thermY2 - colHeight, 3, colHeight);

    // Bottom Bulb
    ctx.beginPath();
    ctx.arc(thermX, thermY2, 7, 0, Math.PI * 2);
    ctx.fill();

    // Top Digital Display Head
    ctx.fillStyle = "#0f172a";
    ctx.strokeStyle = "#f43f5e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(thermX - 35, thermY1 - 25, 70, 32, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fb7185";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${currentTemp.toFixed(1)}°C`, thermX, thermY1 - 5);

    // Thermal Exchange Sparkles / Reaction Glow
    if (reactionTriggered && reactionProgress < 0.95) {
      const pColor = activeSystem.isExo ? "rgba(239, 68, 68, " : "rgba(56, 189, 248, ";
      for (let i = 0; i < 8; i++) {
        const px = CX + (Math.sin(elapsedSeconds * 4 + i) * (innerW/2 - 15));
        const py = CY + 20 + (Math.cos(elapsedSeconds * 3 + i * 1.5) * (innerH/3));
        ctx.fillStyle = `${pColor}${0.4 + Math.sin(elapsedSeconds * 6 + i) * 0.4})`;
        ctx.beginPath();
        ctx.arc(px, py, 3 + Math.sin(i) * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Render Time-Series Chart
  function renderChart() {
    const W = graphCanvas.width;
    const H = graphCanvas.height;
    graphCtx.clearRect(0, 0, W, H);

    // Grid lines
    graphCtx.strokeStyle = "rgba(255,255,255,0.06)";
    graphCtx.lineWidth = 1;
    for (let x = 30; x < W; x += 50) {
      graphCtx.beginPath();
      graphCtx.moveTo(x, 10);
      graphCtx.lineTo(x, H - 25);
      graphCtx.stroke();
    }
    for (let y = 15; y < H - 25; y += 30) {
      graphCtx.beginPath();
      graphCtx.moveTo(30, y);
      graphCtx.lineTo(W - 10, y);
      graphCtx.stroke();
    }

    if (timeSeries.length < 2) return;

    // Y Axis scaling (auto-range)
    const temps = timeSeries.map(p => p.temp);
    const minT = Math.min(15, Math.min(...temps) - 1);
    const maxT = Math.max(35, Math.max(...temps) + 1);

    const padL = 40;
    const padR = 15;
    const padT = 15;
    const padB = 25;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    // Plot Data Line
    graphCtx.strokeStyle = "#fb7185";
    graphCtx.lineWidth = 2.5;
    graphCtx.beginPath();

    timeSeries.forEach((pt, idx) => {
      const px = padL + (idx / Math.max(1, timeSeries.length - 1)) * plotW;
      const py = padT + (1 - (pt.temp - minT) / (maxT - minT)) * plotH;
      if (idx === 0) graphCtx.moveTo(px, py);
      else graphCtx.lineTo(px, py);
    });
    graphCtx.stroke();

    // Axis Labels
    graphCtx.fillStyle = "#94a3b8";
    graphCtx.font = "9px monospace";
    graphCtx.textAlign = "right";
    graphCtx.fillText(`${maxT.toFixed(1)}°`, padL - 4, padT + 10);
    graphCtx.fillText(`${minT.toFixed(1)}°`, padL - 4, H - padB);

    graphCtx.textAlign = "center";
    graphCtx.fillText("Time (s) ➔", W / 2, H - 8);
  }

  // Physics Simulation Step
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

    const photoOverlay = container.querySelector("#calorimetry-photo-overlay");
    const isPhotoOverlay = photoOverlay && photoOverlay.style.display === "block";

    if (!isPhotoOverlay) {
      const isDynamic = reactionTriggered && (reactionProgress < 1.0 || Math.abs(currentTemp - initialTemp) > 0.05);
      if (isRunning && (isDynamic || stirrerSpeed > 0)) {
        if (!currentTime || currentTime - lastFrameTime >= interval) {
          lastFrameTime = currentTime;
          elapsedSeconds += dt;

          if (reactionTriggered && reactionProgress < 1.0) {
            reactionProgress = Math.min(1.0, reactionProgress + dt * 0.15);
            // Target temp based on theoretical deltaH
            const totalHeatCap = (activeSystem.defaultMass * activeSystem.c_spec) + c_calorimeter;
            const totalQ_kJ = -activeSystem.deltaH_theo * activeSystem.moles;
            const expectedDeltaT = (totalQ_kJ * 1000) / totalHeatCap;

            currentTemp = initialTemp + expectedDeltaT * (1 - Math.exp(-reactionProgress * 4));
            if (currentTemp > maxTemp) maxTemp = currentTemp;
          } else if (reactionProgress >= 1.0) {
            // Newton's Law of Cooling
            currentTemp += (initialTemp - currentTemp) * coolingConstant;
          }

          // Record History (10Hz)
          if (timeSeries.length === 0 || elapsedSeconds - timeSeries[timeSeries.length - 1].t >= 0.25) {
            timeSeries.push({ t: elapsedSeconds, temp: currentTemp });
            if (timeSeries.length > 200) timeSeries.shift();
          }

          updateTelemetry();
          renderApparatus();
          renderChart();
        }
      } else if (needsRedraw) {
        updateTelemetry();
        renderApparatus();
        renderChart();
        needsRedraw = false;
      }
    }

    animId = requestAnimationFrame(loop);
  }
  animId = requestAnimationFrame(loop);

  // --- EVENT LISTENERS ---
  const btnSim = container.querySelector("#view-mode-cal-sim");
  const btnPhoto = container.querySelector("#view-mode-cal-photo");
  const photoOverlay = container.querySelector("#calorimetry-photo-overlay");

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

  container.querySelector("#btn-cal-start-rxn")?.addEventListener("click", () => {
    triggerReaction();
    needsRedraw = true;
  });

  container.querySelector("#btn-cal-reset")?.addEventListener("click", () => {
    resetCell();
    needsRedraw = true;
    SoundFX.playClick();
  });

  // System selection buttons
  container.querySelectorAll("[data-system]").forEach(btn => {
    btn.addEventListener("click", () => {
      container.querySelectorAll("[data-system]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentSystemKey = btn.dataset.system;
      activeSystem = SYSTEMS[currentSystemKey];
      container.querySelector("#disp-rxn-desc").innerText = activeSystem.desc;
      resetCell();
      needsRedraw = true;
      SoundFX.playClick();
    });
  });

  // Sliders
  container.querySelector("#slider-c-cal")?.addEventListener("input", (e) => {
    c_calorimeter = parseFloat(e.target.value);
    container.querySelector("#lbl-c-cal").innerText = `${c_calorimeter} J/°C`;
    needsRedraw = true;
    updateTelemetry();
  });

  container.querySelector("#slider-stirrer")?.addEventListener("input", (e) => {
    stirrerSpeed = parseInt(e.target.value, 10);
    container.querySelector("#lbl-stirrer").innerText = `${stirrerSpeed} RPM`;
    dispStirrer.innerText = `${stirrerSpeed} RPM`;
    needsRedraw = true;
  });

  container.querySelector("#slider-init-temp")?.addEventListener("input", (e) => {
    initialTemp = parseFloat(e.target.value);
    container.querySelector("#lbl-init-temp").innerText = `${initialTemp.toFixed(1)} °C`;
    if (!reactionTriggered) {
      currentTemp = initialTemp;
      updateTelemetry();
    }
    needsRedraw = true;
  });

  // Export CSV
  container.querySelector("#btn-cal-export")?.addEventListener("click", () => {
    const deltaT = currentTemp - initialTemp;
    const q_total_J = (activeSystem.defaultMass * activeSystem.c_spec * deltaT) + (c_calorimeter * deltaT);
    const q_rxn_kJ = -q_total_J / 1000;
    const deltaH_exp = activeSystem.moles > 0 ? (q_rxn_kJ / activeSystem.moles) : 0;

    exportLabDataCsv({
      title: "Calorimetry & Enthalpy of Reaction",
      labId: "calorimetry",
      parameters: {
        "Chemical System": activeSystem.name,
        "Reaction": activeSystem.reaction,
        "Solution Mass (g)": activeSystem.defaultMass,
        "Specific Heat c (J/g·°C)": activeSystem.c_spec,
        "Calorimeter Constant C_cal (J/°C)": c_calorimeter,
        "Initial Temperature (°C)": initialTemp.toFixed(3),
        "Final Temperature (°C)": currentTemp.toFixed(3),
        "Temperature Change ΔT (°C)": deltaT.toFixed(3),
        "Experimental Enthalpy ΔH (kJ/mol)": deltaH_exp.toFixed(1),
        "Theoretical Enthalpy ΔH (kJ/mol)": activeSystem.deltaH_theo
      },
      headers: ["Time (s)", "Temperature (°C)"],
      dataRows: timeSeries.map(pt => [pt.t.toFixed(2), pt.temp.toFixed(3)])
    });
  });

  // Keyboard Shortcuts (E for CSV export)
  function handleKeyDown(e) {
    if (!container || !container.isConnected) {
      window.removeEventListener("keydown", handleKeyDown);
      return;
    }
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable) {
      return;
    }
    if (e.key === "e" || e.key === "E") {
      e.preventDefault();
      container.querySelector("#btn-cal-export")?.click();
      return;
    }
  }
  window.addEventListener("keydown", handleKeyDown);

  // Mount Post-Lab Assessment Checkpoint
  mountLabCheckpoint("cal-checkpoint-container", "calorimetry");

  return () => {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("keydown", handleKeyDown);
  };
}
