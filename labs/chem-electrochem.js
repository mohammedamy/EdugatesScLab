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
  for (let i = 0; i < 20; i++) {
    electrons.push({ pos: i / 20 });
  }
  const bridgeIons = [];
  for (let i = 0; i < 18; i++) {
    bridgeIons.push({
      type: i % 2 === 0 ? "k" : "no3",
      pos: i / 18
    });
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
          <button class="btn btn-secondary btn-sm" id="btn-ec-export" title="Export experimental telemetry to RFC-4180 CSV (Hotkey: E)" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export CSV (E)
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

  const logicalW = 580;
  const logicalH = 530;

  function setupHiDPICanvas() {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const w = rect.width > 0 ? rect.width : logicalW;
    const h = rect.height > 0 ? rect.height : logicalH;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }

  setupHiDPICanvas();
  window.addEventListener("resize", setupHiDPICanvas);

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
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const w = rect.width > 0 ? rect.width : logicalW;
    const h = rect.height > 0 ? rect.height : logicalH;

    ctx.save();
    ctx.resetTransform();
    ctx.scale(dpr * (w / logicalW), dpr * (h / logicalH));
    ctx.clearRect(0, 0, logicalW, logicalH);

    // Bench Surface
    const benchY = 460;
    const benchGrad = ctx.createLinearGradient(0, benchY, 0, logicalH);
    benchGrad.addColorStop(0, "#1e293b");
    benchGrad.addColorStop(0.05, "#0f172a");
    benchGrad.addColorStop(1, "#020617");
    ctx.fillStyle = benchGrad;
    ctx.fillRect(0, benchY, logicalW, logicalH - benchY);

    // Bench bevel edge
    ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, benchY);
    ctx.lineTo(logicalW, benchY);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, benchY + 2);
    ctx.lineTo(logicalW, benchY + 2);
    ctx.stroke();

    const CX = logicalW * 0.48;
    const beakerW = 160;
    const beakerH = 210;
    const beakerY = 240;
    const leftBX = CX - 170;
    const rightBX = CX + 10;

    // Contact shadows under both beakers
    const lShadow = ctx.createRadialGradient(leftBX + beakerW/2, benchY, 20, leftBX + beakerW/2, benchY, 90);
    lShadow.addColorStop(0, "rgba(0,0,0,0.6)");
    lShadow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = lShadow;
    ctx.fillRect(leftBX - 20, benchY - 4, beakerW + 40, 16);

    const rShadow = ctx.createRadialGradient(rightBX + beakerW/2, benchY, 20, rightBX + beakerW/2, benchY, 90);
    rShadow.addColorStop(0, "rgba(0,0,0,0.6)");
    rShadow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rShadow;
    ctx.fillRect(rightBX - 20, benchY - 4, beakerW + 40, 16);

    // Caustics on bench top from colored solutions
    ctx.save();
    const lCaustic = ctx.createRadialGradient(leftBX + beakerW/2, benchY + 4, 5, leftBX + beakerW/2, benchY + 10, 80);
    lCaustic.addColorStop(0, "rgba(56, 189, 248, 0.35)");
    lCaustic.addColorStop(1, "rgba(56, 189, 248, 0)");
    ctx.fillStyle = lCaustic;
    ctx.fillRect(leftBX, benchY, beakerW, 20);

    const rCaustic = ctx.createRadialGradient(rightBX + beakerW/2, benchY + 4, 5, rightBX + beakerW/2, benchY + 10, 80);
    rCaustic.addColorStop(0, activePair.cathodeIon.includes("Cu") ? "rgba(37, 99, 235, 0.45)" : "rgba(224, 242, 254, 0.2)");
    rCaustic.addColorStop(1, "rgba(37, 99, 235, 0)");
    ctx.fillStyle = rCaustic;
    ctx.fillRect(rightBX, benchY, beakerW, 20);
    ctx.restore();

    // Helper: draw realistic borosilicate beaker
    function drawBeaker(bx, by, bw, bh, solColor, meniscusTint) {
      const liquidY = by + 35;
      const bBottom = by + bh;

      // Solution Liquid Body
      ctx.save();
      const solGrad = ctx.createLinearGradient(0, liquidY, 0, bBottom);
      solGrad.addColorStop(0, solColor);
      solGrad.addColorStop(1, "rgba(0,0,0,0.2)");
      ctx.fillStyle = solColor;
      ctx.beginPath();
      ctx.moveTo(bx + 5, liquidY);
      ctx.lineTo(bx + bw - 5, liquidY);
      ctx.lineTo(bx + bw - 5, bBottom - 8);
      ctx.arcTo(bx + bw - 5, bBottom - 3, bx + bw - 14, bBottom - 3, 10);
      ctx.lineTo(bx + 14, bBottom - 3);
      ctx.arcTo(bx + 5, bBottom - 3, bx + 5, bBottom - 8, 10);
      ctx.closePath();
      ctx.fill();

      // Liquid Meniscus Ellipse
      ctx.fillStyle = meniscusTint || "rgba(255,255,255,0.15)";
      ctx.beginPath();
      ctx.ellipse(bx + bw/2, liquidY, bw/2 - 6, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Glass Wall Outline
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      // Lip spout at top-left
      ctx.moveTo(bx - 6, by - 2);
      ctx.quadraticCurveTo(bx - 2, by, bx, by);
      ctx.lineTo(bx, bBottom - 10);
      ctx.arcTo(bx, bBottom, bx + 12, bBottom, 10);
      ctx.lineTo(bx + bw - 12, bBottom);
      ctx.arcTo(bx + bw, bBottom, bx + bw, bBottom - 10, 10);
      ctx.lineTo(bx + bw, by);
      ctx.stroke();

      // Cylinder specular highlights
      const leftGlow = ctx.createLinearGradient(bx + 6, 0, bx + 18, 0);
      leftGlow.addColorStop(0, "rgba(255,255,255,0.3)");
      leftGlow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = leftGlow;
      ctx.fillRect(bx + 6, by + 8, 12, bh - 16);

      const rightGlow = ctx.createLinearGradient(bx + bw - 18, 0, bx + bw - 6, 0);
      rightGlow.addColorStop(0, "rgba(255,255,255,0)");
      rightGlow.addColorStop(1, "rgba(255,255,255,0.2)");
      ctx.fillStyle = rightGlow;
      ctx.fillRect(bx + bw - 18, by + 8, 12, bh - 16);

      // Volume Graduations (50, 100, 150 mL)
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.fillStyle = "rgba(255,255,255,0.65)";
      ctx.font = "7.5px monospace";
      ctx.textAlign = "left";
      [
        { y: bBottom - 45, ml: "50" },
        { y: bBottom - 85, ml: "100" },
        { y: bBottom - 125, ml: "150" }
      ].forEach(g => {
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(bx + 6, g.y);
        ctx.lineTo(bx + 22, g.y);
        ctx.stroke();
        ctx.fillText(`${g.ml}`, bx + 25, g.y + 2.5);
      });
      ctx.restore();
    }

    // Draw Left Beaker (Anode) & Right Beaker (Cathode)
    drawBeaker(leftBX, beakerY, beakerW, beakerH, activePair.anodeSolColor, "rgba(56, 189, 248, 0.3)");
    drawBeaker(rightBX, beakerY, beakerW, beakerH, activePair.cathodeSolColor, "rgba(37, 99, 235, 0.35)");

    // --- ANODE METALLIC STRIP ---
    const anodeW = 28;
    const anodeH = 200;
    const anodeX = leftBX + 35;
    const anodeY = beakerY - 40;

    ctx.save();
    const anodeGrad = ctx.createLinearGradient(anodeX, 0, anodeX + anodeW, 0);
    anodeGrad.addColorStop(0, activePair.anodeColor);
    anodeGrad.addColorStop(0.3, "#ffffff");
    anodeGrad.addColorStop(0.7, activePair.anodeColor);
    anodeGrad.addColorStop(1, "#334155");
    ctx.fillStyle = anodeGrad;
    ctx.fillRect(anodeX, anodeY, anodeW, anodeH);

    // Micro brushed lines on anode
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    for (let gy = anodeY + 6; gy < anodeY + anodeH - 6; gy += 12) {
      ctx.beginPath();
      ctx.moveTo(anodeX + 2, gy);
      ctx.lineTo(anodeX + anodeW - 2, gy);
      ctx.stroke();
    }
    ctx.strokeStyle = "#475569";
    ctx.strokeRect(anodeX, anodeY, anodeW, anodeH);

    // Label with glow badge
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${activePair.anodeMetal} Anode (-)`, anodeX + anodeW/2, anodeY - 14);
    ctx.restore();

    // --- CATHODE METALLIC STRIP ---
    const cathW = 28;
    const cathH = 200;
    const cathX = rightBX + beakerW - 63;
    const cathY = beakerY - 40;

    ctx.save();
    const cathGrad = ctx.createLinearGradient(cathX, 0, cathX + cathW, 0);
    cathGrad.addColorStop(0, activePair.cathodeColor);
    cathGrad.addColorStop(0.3, "#ffffff");
    cathGrad.addColorStop(0.7, activePair.cathodeColor);
    cathGrad.addColorStop(1, "#451a03");
    ctx.fillStyle = cathGrad;
    ctx.fillRect(cathX, cathY, cathW, cathH);

    // Micro brushed lines on cathode
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    for (let gy = cathY + 6; gy < cathY + cathH - 6; gy += 12) {
      ctx.beginPath();
      ctx.moveTo(cathX + 2, gy);
      ctx.lineTo(cathX + cathW - 2, gy);
      ctx.stroke();
    }
    ctx.strokeStyle = "#475569";
    ctx.strokeRect(cathX, cathY, cathW, cathH);

    // Cathode Label
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${activePair.cathodeMetal} Cathode (+)`, cathX + cathW/2, cathY - 14);
    ctx.restore();

    // --- INVERTED U-TUBE SALT BRIDGE ---
    const bridgeX1 = leftBX + beakerW - 32;
    const bridgeX2 = rightBX + 32;
    const bridgeTopY = beakerY + 12;
    const bridgeBotY = beakerY + 165;

    ctx.save();
    // Glass Tube Shadow
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 18;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(bridgeX1, bridgeBotY + 2);
    ctx.lineTo(bridgeX1, bridgeTopY + 2);
    ctx.lineTo(bridgeX2, bridgeTopY + 2);
    ctx.lineTo(bridgeX2, bridgeBotY + 2);
    ctx.stroke();

    // Outer Glass Sheath
    ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(bridgeX1, bridgeBotY);
    ctx.lineTo(bridgeX1, bridgeTopY);
    ctx.lineTo(bridgeX2, bridgeTopY);
    ctx.lineTo(bridgeX2, bridgeBotY);
    ctx.stroke();

    // Inner Agarose Gel Matrix (1.0 M KNO3)
    const gelGrad = ctx.createLinearGradient(bridgeX1, 0, bridgeX2, 0);
    gelGrad.addColorStop(0, "rgba(56, 189, 248, 0.4)");
    gelGrad.addColorStop(0.5, "rgba(186, 230, 253, 0.65)");
    gelGrad.addColorStop(1, "rgba(56, 189, 248, 0.4)");
    ctx.strokeStyle = gelGrad;
    ctx.lineWidth = 11;
    ctx.stroke();

    // Porous Cotton/Fritted Plugs at bottom tips
    ctx.fillStyle = "#fef08a";
    ctx.strokeStyle = "#ca8a04";
    ctx.lineWidth = 1;
    ctx.fillRect(bridgeX1 - 5, bridgeBotY - 4, 10, 8);
    ctx.strokeRect(bridgeX1 - 5, bridgeBotY - 4, 10, 8);
    ctx.fillRect(bridgeX2 - 5, bridgeBotY - 4, 10, 8);
    ctx.strokeRect(bridgeX2 - 5, bridgeBotY - 4, 10, 8);

    // Salt Bridge Glass Specular Highlight
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bridgeX1 + 4, bridgeBotY - 4);
    ctx.lineTo(bridgeX1 + 4, bridgeTopY + 4);
    ctx.lineTo(bridgeX2 - 4, bridgeTopY + 4);
    ctx.lineTo(bridgeX2 - 4, bridgeBotY - 4);
    ctx.stroke();

    // Migrating Ions in Salt Bridge (K+ to Cathode, NO3- to Anode)
    if (isClosedCircuit) {
      bridgeIons.forEach(ion => {
        ion.pos = (ion.pos + 0.005) % 1.0;
        let ix, iy;
        if (ion.type === "k") {
          // Drifts toward Cathode (left-to-right along top)
          ix = bridgeX1 + ion.pos * (bridgeX2 - bridgeX1);
          iy = bridgeTopY;
          ctx.fillStyle = "#facc15";
          ctx.shadowColor = "#facc15";
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(ix, iy, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // NO3- Drifts toward Anode (right-to-left along top)
          ix = bridgeX2 - ion.pos * (bridgeX2 - bridgeX1);
          iy = bridgeTopY + 1.5;
          ctx.fillStyle = "#c084fc";
          ctx.shadowColor = "#c084fc";
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(ix, iy, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.shadowBlur = 0;

      // Salt bridge labels
      ctx.font = "bold 8.5px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#facc15";
      ctx.fillText("K⁺ ➔", CX + 16, bridgeTopY - 10);
      ctx.fillStyle = "#c084fc";
      ctx.fillText("⬅ NO₃⁻", CX - 38, bridgeTopY - 10);
    }
    ctx.restore();

    // --- EXTERNAL CIRCUIT & BENCHTOP MULTIMETER ---
    const wireY = 85;
    const meterCX = CX;
    const meterCY = wireY;

    // Multimeter Chassis
    ctx.save();
    const meterW = 124;
    const meterH = 80;

    // Contact shadow
    const mShadow = ctx.createRadialGradient(meterCX, meterCY + meterH/2, 10, meterCX, meterCY + meterH/2, 60);
    mShadow.addColorStop(0, "rgba(0,0,0,0.5)");
    mShadow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = mShadow;
    ctx.fillRect(meterCX - 65, meterCY + meterH/2 - 5, 130, 15);

    // Chassis Box
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(meterCX - meterW/2, meterCY - meterH/2, meterW, meterH, 8);
    ctx.fill();
    ctx.stroke();

    // Corner yellow bumpers
    ctx.fillStyle = "#f59e0b";
    const bSize = 8;
    ctx.fillRect(meterCX - meterW/2, meterCY - meterH/2, bSize, bSize);
    ctx.fillRect(meterCX + meterW/2 - bSize, meterCY - meterH/2, bSize, bSize);
    ctx.fillRect(meterCX - meterW/2, meterCY + meterH/2 - bSize, bSize, bSize);
    ctx.fillRect(meterCX + meterW/2 - bSize, meterCY + meterH/2 - bSize, bSize, bSize);

    // Recessed Screen Bezel
    ctx.fillStyle = "#020617";
    ctx.fillRect(meterCX - 48, meterCY - 30, 96, 36);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 1;
    ctx.strokeRect(meterCX - 48, meterCY - 30, 96, 36);

    // Backlit LCD Display
    const E_cell = calculateCellPotential();
    ctx.fillStyle = isClosedCircuit ? "#38bdf8" : "#94a3b8";
    ctx.font = "800 15px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.shadowColor = isClosedCircuit ? "rgba(56, 189, 248, 0.4)" : "transparent";
    ctx.shadowBlur = 6;
    ctx.fillText(`${isClosedCircuit ? "+" + E_cell.toFixed(3) : "OPEN"} V`, meterCX, meterCY - 12);
    ctx.shadowBlur = 0;

    // Annunciators on LCD
    ctx.font = "bold 6.5px 'JetBrains Mono', monospace";
    ctx.fillStyle = "rgba(45, 212, 191, 0.75)";
    ctx.textAlign = "left";
    ctx.fillText("AUTO", meterCX - 44, meterCY - 22);
    ctx.textAlign = "right";
    ctx.fillText("V DC", meterCX + 44, meterCY - 22);

    // Binding Post Terminals: Red (+) and Black (COM)
    const redJackX = meterCX + 26;
    const blackJackX = meterCX - 26;
    const jackY = meterCY + 22;

    // Black (-) Jack
    ctx.fillStyle = "#0f172a";
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(blackJackX, jackY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Red (+) Jack
    ctx.fillStyle = "#ef4444";
    ctx.strokeStyle = "#991b1b";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(redJackX, jackY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // --- CONNECTING TEST LEAD WIRES ---
    ctx.save();
    // Left Lead (Black): Anode (-) to Multimeter COM Jack
    const aLeadX = anodeX + anodeW/2;
    const aLeadY = anodeY;

    // Lead shadow
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(aLeadX, aLeadY + 2);
    ctx.bezierCurveTo(aLeadX - 30, aLeadY - 45, blackJackX - 20, jackY + 20, blackJackX, jackY + 2);
    ctx.stroke();

    // Black lead core
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(aLeadX, aLeadY);
    ctx.bezierCurveTo(aLeadX - 30, aLeadY - 45, blackJackX - 20, jackY + 20, blackJackX, jackY);
    ctx.stroke();

    // Right Lead (Red): Cathode (+) to Multimeter Red Jack
    const cLeadX = cathX + cathW/2;
    const cLeadY = cathY;

    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(cLeadX, cLeadY + 2);
    ctx.bezierCurveTo(cLeadX + 30, cLeadY - 45, redJackX + 20, jackY + 20, redJackX, jackY + 2);
    ctx.stroke();

    // Red lead core
    ctx.strokeStyle = "#dc2626";
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(cLeadX, cLeadY);
    ctx.bezierCurveTo(cLeadX + 30, cLeadY - 45, redJackX + 20, jackY + 20, redJackX, jackY);
    ctx.stroke();

    // Alligator clip at anode
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#475569";
    ctx.fillRect(aLeadX - 6, aLeadY - 6, 12, 10);
    ctx.strokeRect(aLeadX - 6, aLeadY - 6, 12, 10);

    // Alligator clip at cathode
    ctx.fillStyle = "#b91c1c";
    ctx.strokeStyle = "#7f1d1d";
    ctx.fillRect(cLeadX - 6, cLeadY - 6, 12, 10);
    ctx.strokeRect(cLeadX - 6, cLeadY - 6, 12, 10);

    // Streaming Electrons Animation (From Anode - through DMM to Cathode +)
    if (isClosedCircuit) {
      electrons.forEach(el => {
        el.pos = (el.pos + 0.007) % 1.0;
        let ex, ey;
        if (el.pos < 0.45) {
          // Along Left Wire: Anode to DMM COM
          const t = el.pos / 0.45;
          const p0 = { x: aLeadX, y: aLeadY };
          const p1 = { x: aLeadX - 30, y: aLeadY - 45 };
          const p2 = { x: blackJackX - 20, y: jackY + 20 };
          const p3 = { x: blackJackX, y: jackY };
          ex = (1-t)**3 * p0.x + 3*(1-t)**2 * t * p1.x + 3*(1-t)*t**2 * p2.x + t**3 * p3.x;
          ey = (1-t)**3 * p0.y + 3*(1-t)**2 * t * p1.y + 3*(1-t)*t**2 * p2.y + t**3 * p3.y;
        } else if (el.pos < 0.55) {
          // Inside DMM from Black Jack to Red Jack
          const t = (el.pos - 0.45) / 0.10;
          ex = blackJackX + t * (redJackX - blackJackX);
          ey = jackY;
        } else {
          // Along Right Wire: Red Jack to Cathode
          const t = (el.pos - 0.55) / 0.45;
          const p0 = { x: redJackX, y: jackY };
          const p1 = { x: redJackX + 20, y: jackY + 20 };
          const p2 = { x: cLeadX + 30, y: cLeadY - 45 };
          const p3 = { x: cLeadX, y: cLeadY };
          ex = (1-t)**3 * p0.x + 3*(1-t)**2 * t * p1.x + 3*(1-t)*t**2 * p2.x + t**3 * p3.x;
          ey = (1-t)**3 * p0.y + 3*(1-t)**2 * t * p1.y + 3*(1-t)*t**2 * p2.y + t**3 * p3.y;
        }

        ctx.fillStyle = "#00f0ff";
        ctx.shadowColor = "#00f0ff";
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;
    }
    ctx.restore();

    ctx.restore();
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

  // Standardized Hotkey: 'e' or 'E' triggers CSV telemetry export
  const handleKeyDown = (e) => {
    if ((e.key === "e" || e.key === "E") && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      container.querySelector("#btn-ec-export")?.click();
    }
  };
  window.addEventListener("keydown", handleKeyDown);

  // Mount Post-Lab Checkpoint Assessment
  mountLabCheckpoint("ec-checkpoint-container", "electrochem");

  return () => {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("resize", setupHiDPICanvas);
  };
}
