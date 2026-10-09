// Edugates-ClipSAT Science Labs - Chemistry: Electrochemistry & Voltaic Cells
// 60 FPS Electrochemical Cell Simulation:
// Galvanic & Electrolytic Half-Cells, Nernst Equation (E = E° - (RT/nF)lnQ),
// Salt Bridge Ion Migration (K⁺/NO₃⁻), Electron Current Animation, Electrode Plating/Dissolution, and Precision Digital Multimeter.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initElectrochemLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const HALF_CELL_PAIRS = {
    daniell: {
      name: "Daniell Cell (Zn | Zn²⁺ || Cu²⁺ | Cu)",
      anodeMetal: "Zinc (Zn)",
      anodeIon: "Zn²⁺",
      cathodeMetal: "Copper (Cu)",
      cathodeIon: "Cu²⁺",
      anodeE0: -0.763, // V
      cathodeE0: +0.337, // V
      n: 2, // electrons transferred
      anodeColor: "#94a3b8", // zinc gray
      cathodeColor: "#f97316", // copper orange
      anodeSolColor: "rgba(56, 189, 248, 0.25)", // clear/pale cyan
      cathodeSolColor: "rgba(37, 99, 235, 0.65)", // deep blue CuSO4
      equation: "Zn(s) + Cu^{2+}(aq) \\to Zn^{2+}(aq) + Cu(s)",
      desc: "Standard textbook Daniell galvanic cell with standard potential E° = +1.100 V."
    },
    copper_silver: {
      name: "Copper-Silver Cell (Cu | Cu²⁺ || Ag⁺ | Ag)",
      anodeMetal: "Copper (Cu)",
      anodeIon: "Cu²⁺",
      cathodeMetal: "Silver (Ag)",
      cathodeIon: "Ag⁺",
      anodeE0: +0.337,
      cathodeE0: +0.799,
      n: 2,
      anodeColor: "#f97316",
      cathodeColor: "#e2e8f0",
      anodeSolColor: "rgba(37, 99, 235, 0.45)",
      cathodeSolColor: "rgba(241, 245, 249, 0.2)",
      equation: "Cu(s) + 2 Ag^+(aq) \\to Cu^{2+}(aq) + 2 Ag(s)",
      desc: "Copper oxidation coupled to silver reduction with standard potential E° = +0.462 V."
    },
    zinc_lead: {
      name: "Zinc-Lead Cell (Zn | Zn²⁺ || Pb²⁺ | Pb)",
      anodeMetal: "Zinc (Zn)",
      anodeIon: "Zn²⁺",
      cathodeMetal: "Lead (Pb)",
      cathodeIon: "Pb²⁺",
      anodeE0: -0.763,
      cathodeE0: -0.126,
      n: 2,
      anodeColor: "#94a3b8",
      cathodeColor: "#64748b",
      anodeSolColor: "rgba(56, 189, 248, 0.2)",
      cathodeSolColor: "rgba(148, 163, 184, 0.3)",
      equation: "Zn(s) + Pb^{2+}(aq) \\to Zn^{2+}(aq) + Pb(s)",
      desc: "Zinc-Lead voltaic cell with standard cell potential E° = +0.637 V."
    }
  };

  // State Variables
  let currentPairKey = "daniell";
  let activePair = HALF_CELL_PAIRS[currentPairKey];
  let anodeConc = 1.00; // M
  let cathodeConc = 1.00; // M
  let temperature = 25.0; // °C
  let isClosedCircuit = true;
  let animId = null;
  let elapsedSeconds = 0;

  // Particle tracking
  const electrons = [];
  for (let i = 0; i < 16; i++) {
    electrons.push({ pos: i / 16 });
  }

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #38bdf8; box-shadow: 0 0 10px #38bdf8;"></span>
            Electrochemistry &amp; Voltaic Cell Bench
          </span>
          <span class="badge" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #7dd3fc; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            ${renderLatex("E_{\\text{cell}} = E^\\circ - \\frac{0.0592}{n} \\log Q \\quad \\bullet \\quad \\text{Nernst Potential}")}
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-ec-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Half-Cell Apparatus
            </button>
            <button id="view-mode-ec-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-ec-switch-circuit" style="padding: 5px 14px; font-size: 0.78rem;">
            ${isClosedCircuit ? "⚡ Open Switch" : "🔌 Close Switch"}
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-ec-export" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export Telemetry
          </button>
        </div>
      </div>

      <!-- Main Layout: Electrochemical Cell Canvas on Left, Controls on Right -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="electrochem-layout">
        <!-- Visual Cell Canvas -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(56, 189, 248, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #0b1528 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="electrochem-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
          <div id="electrochem-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <picture>
              <source srcset="assets/labs/electrochem_bench.webp" type="image/webp">
              <img src="assets/labs/electrochem_bench.jpg" decoding="async" loading="lazy" alt="4K Voltaic Cell & Digital Multimeter Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            </picture>
            
            <!-- Live Analytical Telemetry Callout on Photo -->
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Keysight 34465A 6½ Digit DMM</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">1.10024 V DC • 10 GΩ Impedance</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Porous Fritted Salt Bridge</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Agarose / 1.0 M KNO₃ Electrolyte</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Electrode Strips</div>
                <div style="color: #f97316; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Polished 99.9% Pure Zn &amp; Cu</div>
              </div>
            </div>
          </div>

          <!-- Top HUD: Digital Voltmeter -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">CELL POTENTIAL (E_cell)</div>
              <div style="font-weight: 800; font-size: 1.35rem; color: #38bdf8; font-family: var(--font-mono);" id="disp-voltage-val">+1.100 V</div>
              <div style="font-size: 0.74rem; color: #34d399; font-family: var(--font-mono);" id="disp-e0-val">E°_cell = +1.100 V (Q = 1.00)</div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(34, 197, 94, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">THERMODYNAMIC DRIVING FORCE</div>
              <div style="font-weight: 800; font-size: 1.25rem; color: #34d399; font-family: var(--font-mono);" id="disp-delta-g">ΔG° = -212.3 kJ</div>
              <div style="font-size: 0.74rem; color: #f59e0b; font-family: var(--font-mono);" id="disp-current-flow">Current: 28.5 mA</div>
            </div>
          </div>

          <!-- Bottom Status Pill -->
          <div style="position: absolute; bottom: 12px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: center; pointer-events: none; font-family: var(--font-mono); font-size: 0.74rem; color: #94a3b8;">
            <span style="background: rgba(0,0,0,0.65); padding: 4px 10px; border-radius: 6px;" id="disp-status-bottom">
              ⚡ Electrons stream from Zn Anode (-) to Cu Cathode (+)
            </span>
            <span style="background: rgba(0,0,0,0.65); padding: 4px 10px; border-radius: 6px;">
              🧂 Salt Bridge: K⁺ ➔ Cathode, NO₃⁻ ➔ Anode
            </span>
          </div>
        </div>

        <!-- Controls & Concentration Sliders on Right -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <!-- Half-Cell Selection Card -->
          <div class="lab-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px;">
            <label style="font-size: 0.8rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">
              Half-Cell Electrochemical Couple
            </label>
            <div style="display: grid; grid-template-columns: 1fr; gap: 6px;">
              <button class="btn btn-secondary btn-sm ${currentPairKey === 'daniell' ? 'active' : ''}" data-couple="daniell" style="font-size: 0.74rem; padding: 7px; text-align: left;">
                ⚡ Zn | Zn²⁺ || Cu²⁺ | Cu (Daniell Standard, E° = 1.100 V)
              </button>
              <button class="btn btn-secondary btn-sm ${currentPairKey === 'copper_silver' ? 'active' : ''}" data-couple="copper_silver" style="font-size: 0.74rem; padding: 7px; text-align: left;">
                ⚡ Cu | Cu²⁺ || Ag⁺ | Ag (Copper-Silver, E° = 0.462 V)
              </button>
              <button class="btn btn-secondary btn-sm ${currentPairKey === 'zinc_lead' ? 'active' : ''}" data-couple="zinc_lead" style="font-size: 0.74rem; padding: 7px; text-align: left;">
                ⚡ Zn | Zn²⁺ || Pb²⁺ | Pb (Zinc-Lead, E° = 0.637 V)
              </button>
            </div>
            <div style="margin-top: 8px; font-size: 0.78rem; color: #cbd5e1; background: rgba(0,0,0,0.25); padding: 8px 12px; border-radius: 6px;" id="disp-couple-desc">
              ${activePair.desc}
            </div>
          </div>

          <!-- Nernst Concentration Controls -->
          <div class="lab-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px;">
            <label style="font-size: 0.8rem; font-weight: 700; color: #34d399; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">
              Nernst Half-Cell Concentrations
            </label>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              <!-- Anode Ion Concentration -->
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>Anode Ion [${activePair.anodeIon}]</span>
                  <span style="color: #38bdf8; font-weight: 700;" id="lbl-anode-conc">${anodeConc.toFixed(2)} M</span>
                </div>
                <input type="range" id="slider-anode-conc" min="0.01" max="2.00" step="0.05" value="${anodeConc}" style="width: 100%; accent-color: #38bdf8;">
              </div>

              <!-- Cathode Ion Concentration -->
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>Cathode Ion [${activePair.cathodeIon}]</span>
                  <span style="color: #f97316; font-weight: 700;" id="lbl-cathode-conc">${cathodeConc.toFixed(2)} M</span>
                </div>
                <input type="range" id="slider-cathode-conc" min="0.01" max="2.00" step="0.05" value="${cathodeConc}" style="width: 100%; accent-color: #f97316;">
              </div>

              <!-- Quick Presets -->
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 4px;">
                <button class="btn btn-secondary btn-sm" id="btn-standard-state" style="font-size: 0.72rem; padding: 5px;">Standard (1M / 1M)</button>
                <button class="btn btn-secondary btn-sm" id="btn-high-voltage" style="font-size: 0.72rem; padding: 5px; color: #34d399;">Boost (0.01M / 2M)</button>
                <button class="btn btn-secondary btn-sm" id="btn-depleted" style="font-size: 0.72rem; padding: 5px; color: #f87171;">Dead Cell (2M / 0.01M)</button>
              </div>
            </div>
          </div>

          <!-- Half-Cell Electrochemistry Readout Card -->
          <div class="lab-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px; flex: 1;">
            <div style="font-size: 0.8rem; font-weight: 700; color: #facc15; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
              Half-Cell Standard Reduction Potentials
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px; font-family: var(--font-mono); font-size: 0.78rem;">
              <div style="background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 6px; border-left: 3px solid #38bdf8;">
                <div style="color: #94a3b8; font-size: 0.7rem;">ANODE OXIDATION (An Ox):</div>
                <div style="color: #e2e8f0; font-weight: 700;" id="disp-anode-rxn">${activePair.anodeMetal} → ${activePair.anodeIon} + 2e⁻ (E° = ${activePair.anodeE0.toFixed(3)} V)</div>
              </div>
              <div style="background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 6px; border-left: 3px solid #f97316;">
                <div style="color: #94a3b8; font-size: 0.7rem;">CATHODE REDUCTION (Red Cat):</div>
                <div style="color: #e2e8f0; font-weight: 700;" id="disp-cathode-rxn">${activePair.cathodeIon} + 2e⁻ → ${activePair.cathodeMetal} (E° = ${activePair.cathodeE0.toFixed(3)} V)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Post-Lab Checkpoint Assessment -->
      <div id="ec-checkpoint-container" style="margin-top: 24px;"></div>
    </div>
  `;

  // Canvas References
  const canvas = container.querySelector("#electrochem-canvas");
  const ctx = canvas.getContext("2d");

  // Telemetry DOM elements
  const dispVoltage = container.querySelector("#disp-voltage-val");
  const dispE0 = container.querySelector("#disp-e0-val");
  const dispDeltaG = container.querySelector("#disp-delta-g");
  const dispCurrent = container.querySelector("#disp-current-flow");

  // Nernst Equation: E = E0 - (RT/nF) ln(Q) = E0 - (0.05916/n) log10(Q) at 298.15K
  function calculateCellPotential() {
    if (!isClosedCircuit) return 0;
    const E0_cell = activePair.cathodeE0 - activePair.anodeE0;
    const Q = anodeConc / Math.max(0.001, cathodeConc);
    const n = activePair.n;
    const E_cell = E0_cell - (0.05916 / n) * Math.log10(Q);
    return Math.max(0, E_cell);
  }

  function updateTelemetry() {
    const E0_cell = activePair.cathodeE0 - activePair.anodeE0;
    const E_cell = calculateCellPotential();
    const Q = anodeConc / Math.max(0.001, cathodeConc);
    const F = 96485; // C/mol e-
    const deltaG_kJ = -(activePair.n * F * E_cell) / 1000;
    const current_mA = isClosedCircuit ? Math.max(0, E_cell * 25.5) : 0;

    dispVoltage.innerText = `${isClosedCircuit ? "+" : ""}${E_cell.toFixed(3)} V`;
    dispE0.innerText = `E°_cell = +${E0_cell.toFixed(3)} V (Q = ${Q.toFixed(3)})`;
    dispDeltaG.innerText = `ΔG = ${deltaG_kJ.toFixed(1)} kJ/mol`;
    dispCurrent.innerText = `Current: ${current_mA.toFixed(1)} mA`;
  }

  // 60 FPS HTML5 Canvas Simulation
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
    const beakerW = 160;
    const beakerH = 210;
    const beakerY = 240;
    const leftBX = CX - 170;
    const rightBX = CX + 10;

    // --- LEFT BEAKER: ANODE (Oxidation) ---
    // Beaker Solution (Anode)
    ctx.fillStyle = activePair.anodeSolColor;
    ctx.fillRect(leftBX + 5, beakerY + 30, beakerW - 10, beakerH - 35);

    // Left Borosilicate Glass Outline
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(leftBX, beakerY, beakerW, beakerH, [0, 0, 12, 12]);
    ctx.stroke();

    // Anode Metallic Strip
    const anodeW = 28;
    const anodeH = 200;
    const anodeX = leftBX + 40;
    const anodeY = beakerY - 40;
    ctx.fillStyle = activePair.anodeColor;
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.5;
    ctx.fillRect(anodeX, anodeY, anodeW, anodeH);
    ctx.strokeRect(anodeX, anodeY, anodeW, anodeH);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(`${activePair.anodeMetal} Anode (-)`, anodeX + anodeW/2, anodeY - 8);

    // --- RIGHT BEAKER: CATHODE (Reduction) ---
    // Beaker Solution (Cathode)
    ctx.fillStyle = activePair.cathodeSolColor;
    ctx.fillRect(rightBX + 5, beakerY + 30, beakerW - 10, beakerH - 35);

    // Right Borosilicate Glass Outline
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(rightBX, beakerY, beakerW, beakerH, [0, 0, 12, 12]);
    ctx.stroke();

    // Cathode Metallic Strip
    const cathW = 28;
    const cathH = 200;
    const cathX = rightBX + beakerW - 68;
    const cathY = beakerY - 40;
    ctx.fillStyle = activePair.cathodeColor;
    ctx.strokeStyle = "#fdba74";
    ctx.lineWidth = 1.5;
    ctx.fillRect(cathX, cathY, cathW, cathH);
    ctx.strokeRect(cathX, cathY, cathW, cathH);

    ctx.fillStyle = "#ffffff";
    ctx.fillText(`${activePair.cathodeMetal} Cathode (+)`, cathX + cathW/2, cathY - 8);

    // --- INVERTED U-TUBE SALT BRIDGE ---
    const bridgeX1 = leftBX + beakerW - 35;
    const bridgeX2 = rightBX + 35;
    const bridgeTopY = beakerY + 10;
    const bridgeBotY = beakerY + 160;

    // Salt Bridge Tube Outline
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 16;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(bridgeX1, bridgeBotY);
    ctx.lineTo(bridgeX1, bridgeTopY);
    ctx.lineTo(bridgeX2, bridgeTopY);
    ctx.lineTo(bridgeX2, bridgeBotY);
    ctx.stroke();

    // Salt Bridge Inner Electrolyte (Agarose Gel with KNO3)
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 10;
    ctx.stroke();

    // Migrating Ions in Salt Bridge
    if (isClosedCircuit) {
      const ionShift = (elapsedSeconds * 20) % 40;
      ctx.fillStyle = "#facc15"; // K+ to Cathode
      ctx.font = "bold 9px monospace";
      ctx.fillText("K⁺ ➔", CX + ionShift, bridgeTopY + 3);
      ctx.fillStyle = "#a855f7"; // NO3- to Anode
      ctx.fillText("⬅ NO₃⁻", CX - 40 - ionShift, bridgeTopY + 3);
    }

    // --- EXTERNAL CIRCUIT & DIGITAL MULTIMETER ---
    const wireY = 85;
    const meterCX = CX;
    const meterCY = wireY;

    // Connecting Lead Wires
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 2.5;

    // Left wire: Anode to DMM (-)
    ctx.beginPath();
    ctx.moveTo(anodeX + anodeW/2, anodeY);
    ctx.lineTo(anodeX + anodeW/2, wireY);
    ctx.lineTo(meterCX - 45, wireY);
    ctx.stroke();

    // Right wire: DMM (+) to Cathode
    ctx.beginPath();
    ctx.moveTo(meterCX + 45, wireY);
    ctx.lineTo(cathX + cathW/2, wireY);
    ctx.lineTo(cathX + cathW/2, cathY);
    ctx.stroke();

    // Streaming Electrons Animation (From Anode - to Cathode +)
    if (isClosedCircuit) {
      ctx.fillStyle = "#00f0ff";
      electrons.forEach(el => {
        el.pos = (el.pos + 0.006) % 1.0;
        let ex, ey;
        if (el.pos < 0.3) {
          const t = el.pos / 0.3;
          ex = anodeX + anodeW/2;
          ey = anodeY - t * (anodeY - wireY);
        } else if (el.pos < 0.7) {
          const t = (el.pos - 0.3) / 0.4;
          ex = (anodeX + anodeW/2) + t * (cathX + cathW/2 - (anodeX + anodeW/2));
          ey = wireY;
        } else {
          const t = (el.pos - 0.7) / 0.3;
          ex = cathX + cathW/2;
          ey = wireY + t * (cathY - wireY);
        }
        ctx.beginPath();
        ctx.arc(ex, ey, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Digital Multimeter Box
    ctx.fillStyle = "#0f172a";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(meterCX - 50, meterCY - 35, 100, 70, 8);
    ctx.fill();
    ctx.stroke();

    // Multimeter Screen
    ctx.fillStyle = "#020617";
    ctx.fillRect(meterCX - 40, meterCY - 25, 80, 32);
    ctx.fillStyle = "#00f0ff";
    ctx.font = "bold 13px monospace";
    ctx.textAlign = "center";
    const E_cell = calculateCellPotential();
    ctx.fillText(`${isClosedCircuit ? E_cell.toFixed(3) : "OPEN"} V`, meterCX, meterCY - 5);

    // Multimeter Jacks (-) and (+)
    ctx.fillStyle = "#ef4444"; // red +
    ctx.beginPath();
    ctx.arc(meterCX + 25, meterCY + 20, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#000000"; // black -
    ctx.beginPath();
    ctx.arc(meterCX - 25, meterCY + 20, 5, 0, Math.PI * 2);
    ctx.fill();
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

    const photoOverlay = container.querySelector("#electrochem-photo-overlay");
    const isPhotoOverlay = photoOverlay && photoOverlay.style.display === "block";

    if (!isPhotoOverlay) {
      if (isClosedCircuit) {
        if (!currentTime || currentTime - lastFrameTime >= interval) {
          lastFrameTime = currentTime;
          elapsedSeconds += dt;
          updateTelemetry();
          renderApparatus();
        }
      } else if (needsRedraw) {
        updateTelemetry();
        renderApparatus();
        needsRedraw = false;
      }
    }

    animId = requestAnimationFrame(loop);
  }
  animId = requestAnimationFrame(loop);

  // --- EVENT LISTENERS ---
  const btnSim = container.querySelector("#view-mode-ec-sim");
  const btnPhoto = container.querySelector("#view-mode-ec-photo");
  const photoOverlay = container.querySelector("#electrochem-photo-overlay");

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

  container.querySelector("#btn-ec-switch-circuit")?.addEventListener("click", (e) => {
    isClosedCircuit = !isClosedCircuit;
    e.currentTarget.innerText = isClosedCircuit ? "⚡ Open Switch" : "🔌 Close Switch";
    needsRedraw = true;
    SoundFX.playSwitchSnap();
  });

  // Switch Half-Cell Couples
  container.querySelectorAll("[data-couple]").forEach(btn => {
    btn.addEventListener("click", () => {
      container.querySelectorAll("[data-couple]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentPairKey = btn.dataset.couple;
      activePair = HALF_CELL_PAIRS[currentPairKey];
      container.querySelector("#disp-couple-desc").innerText = activePair.desc;
      container.querySelector("#disp-anode-rxn").innerText = `${activePair.anodeMetal} → ${activePair.anodeIon} + 2e⁻ (E° = ${activePair.anodeE0.toFixed(3)} V)`;
      container.querySelector("#disp-cathode-rxn").innerText = `${activePair.cathodeIon} + 2e⁻ → ${activePair.cathodeMetal} (E° = ${activePair.cathodeE0.toFixed(3)} V)`;
      anodeConc = 1.0;
      cathodeConc = 1.0;
      container.querySelector("#slider-anode-conc").value = 1.0;
      container.querySelector("#slider-cathode-conc").value = 1.0;
      container.querySelector("#lbl-anode-conc").innerText = "1.00 M";
      container.querySelector("#lbl-cathode-conc").innerText = "1.00 M";
      needsRedraw = true;
      SoundFX.playClick();
    });
  });

  // Sliders
  container.querySelector("#slider-anode-conc")?.addEventListener("input", (e) => {
    anodeConc = parseFloat(e.target.value);
    container.querySelector("#lbl-anode-conc").innerText = `${anodeConc.toFixed(2)} M`;
    needsRedraw = true;
  });

  container.querySelector("#slider-cathode-conc")?.addEventListener("input", (e) => {
    cathodeConc = parseFloat(e.target.value);
    container.querySelector("#lbl-cathode-conc").innerText = `${cathodeConc.toFixed(2)} M`;
    needsRedraw = true;
  });

  // Presets
  container.querySelector("#btn-standard-state")?.addEventListener("click", () => {
    anodeConc = 1.0;
    cathodeConc = 1.0;
    container.querySelector("#slider-anode-conc").value = 1.0;
    container.querySelector("#slider-cathode-conc").value = 1.0;
    container.querySelector("#lbl-anode-conc").innerText = "1.00 M";
    container.querySelector("#lbl-cathode-conc").innerText = "1.00 M";
    needsRedraw = true;
    SoundFX.playClick();
  });

  container.querySelector("#btn-high-voltage")?.addEventListener("click", () => {
    anodeConc = 0.01;
    cathodeConc = 2.0;
    container.querySelector("#slider-anode-conc").value = 0.01;
    container.querySelector("#slider-cathode-conc").value = 2.0;
    container.querySelector("#lbl-anode-conc").innerText = "0.01 M";
    container.querySelector("#lbl-cathode-conc").innerText = "2.00 M";
    needsRedraw = true;
    SoundFX.playClick();
  });

  container.querySelector("#btn-depleted")?.addEventListener("click", () => {
    anodeConc = 2.0;
    cathodeConc = 0.01;
    container.querySelector("#slider-anode-conc").value = 2.0;
    container.querySelector("#slider-cathode-conc").value = 0.01;
    container.querySelector("#lbl-anode-conc").innerText = "2.00 M";
    container.querySelector("#lbl-cathode-conc").innerText = "0.01 M";
    needsRedraw = true;
    SoundFX.playClick();
  });

  // Export CSV
  container.querySelector("#btn-ec-export")?.addEventListener("click", () => {
    const E_cell = calculateCellPotential();
    exportLabDataCsv({
      title: "Voltaic Cell & Nernst Equation Telemetry",
      labId: "electrochem",
      parameters: {
        "Cell Couple": activePair.name,
        "Anode Reaction": `${activePair.anodeMetal} → ${activePair.anodeIon} + 2e⁻`,
        "Cathode Reaction": `${activePair.cathodeIon} + 2e⁻ → ${activePair.cathodeMetal}`,
        "Anode Concentration [M]": anodeConc,
        "Cathode Concentration [M]": cathodeConc,
        "Circuit State": isClosedCircuit ? "Closed" : "Open",
        "Cell Voltage E_cell [V]": E_cell.toFixed(3)
      },
      headers: ["Parameter", "Value"],
      dataRows: [
        ["Couple", activePair.name],
        ["Anode Conc (M)", anodeConc],
        ["Cathode Conc (M)", cathodeConc],
        ["E_cell (V)", E_cell.toFixed(3)],
        ["E0_cell (V)", (activePair.cathodeE0 - activePair.anodeE0).toFixed(3)],
        ["Q", (anodeConc / cathodeConc).toFixed(4)]
      ]
    });
  });

  // Mount Post-Lab Checkpoint Assessment
  mountLabCheckpoint("ec-checkpoint-container", "electrochem");

  return () => {
    if (animId) cancelAnimationFrame(animId);
  };
}
