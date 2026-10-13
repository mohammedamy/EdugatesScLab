// Edugates-ClipSAT Science Labs - Biology: Cell Membrane & Osmosis Suite
// 60 FPS Precision Cellular Transport & Osmotic Equilibrium Simulation:
// Water Potential: Ψ = Ψ_s + Ψ_p,
// Solute Potential: Ψ_s = -i·C·R·T (van 't Hoff equation),
// Hydrostatic Osmometer: Δh = ΔΠ / (ρ·g),
// Tonicity Micro-Cytology: Hypotonic (Lysis / Turgor), Isotonic (Equilibrium), Hypertonic (Crenation / Plasmolysis),
// Dual-Chamber U-Tube Semipermeable Dialysis Membrane & Live Particle Flow.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initOsmosisLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return () => {};

  // Biophysical Constants
  const R_GAS = 0.0831; // L·bar / (mol·K)
  const TEMP_K = 293.15; // 20 °C room temperature
  const VAN_T_HOFF_SUCROSE = 1.0;
  const VAN_T_HOFF_NACL = 2.0;

  // State Variables
  let activeMode = "utube"; // "utube" or "cell"
  let cellType = "rbc"; // "rbc" (Animal / Red Blood Cell) or "plant" (Elodea Cell)

  // U-Tube Concentrations (Molar)
  let soluteLeft = 0.05; // M
  let soluteRight = 0.40; // M
  let selectedSolute = "sucrose"; // "sucrose" (i=1) or "nacl" (i=2)
  let membranePoreSize = 2.0; // nm

  // Cell Tonicity External Osmolarity
  let extOsmolarity = 0.15; // 0.15 M is physiological isotonic saline (~300 mOsm/L)

  // Simulation Time & Levels
  let simTime = 0;
  let isRunning = true;
  let animId = null;
  let lastTime = performance.now();

  // U-Tube Dynamic Liquid Levels (normalized height difference in pixels)
  let currentDeltaH = 0;
  let targetDeltaH = 0;

  // Particle Engine for U-Tube water molecules & solute
  const waterParticles = [];
  const soluteParticles = [];

  function initParticles() {
    waterParticles.length = 0;
    soluteParticles.length = 0;

    // 80 water molecules circulating
    for (let i = 0; i < 80; i++) {
      waterParticles.push({
        x: 160 + Math.random() * 320,
        y: 180 + Math.random() * 140,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: 3.5,
        chamber: Math.random() > 0.5 ? "left" : "right"
      });
    }

    // Solute molecules (large sucrose circles)
    const numSoluteL = Math.round(soluteLeft * 30);
    const numSoluteR = Math.round(soluteRight * 30);

    for (let i = 0; i < numSoluteL; i++) {
      soluteParticles.push({
        chamber: "left",
        x: 170 + Math.random() * 90,
        y: 180 + Math.random() * 120,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: 7
      });
    }

    for (let i = 0; i < numSoluteR; i++) {
      soluteParticles.push({
        chamber: "right",
        x: 380 + Math.random() * 90,
        y: 180 + Math.random() * 120,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: 7
      });
    }
  }

  function calculateWaterPotentials() {
    const i = selectedSolute === "sucrose" ? VAN_T_HOFF_SUCROSE : VAN_T_HOFF_NACL;
    // Solute Potential: Psi_s = -i * C * R * T (in bars, 1 bar = 0.1 MPa)
    const psi_s_left = -i * soluteLeft * R_GAS * TEMP_K;
    const psi_s_right = -i * soluteRight * R_GAS * TEMP_K;
    
    // Net Osmotic Gradient
    const deltaPsi_s = psi_s_right - psi_s_left;
    // Target equilibrium height delta in px (proportional to delta Psi)
    targetDeltaH = Math.min(100, Math.max(-100, -deltaPsi_s * 6.5));

    // Cell tonicity calculations
    const intracellularM = 0.15; // 0.15 M internal cell osmolarity
    const psi_cell_internal = -i * intracellularM * R_GAS * TEMP_K;
    const psi_ext = -i * extOsmolarity * R_GAS * TEMP_K;
    const deltaPsiCell = psi_ext - psi_cell_internal;

    let tonicityLabel = "Isotonic";
    let cellStatus = "Normal Biconcave Disc";
    let turgorPsi_p = 0;

    if (extOsmolarity < 0.12) {
      tonicityLabel = "Hypotonic";
      cellStatus = cellType === "rbc" ? "Cell Swelling & Hemolytic Lysis (Ghost Membrane)" : "Turgid (Full Vacuole & High Wall Pressure)";
      turgorPsi_p = Math.abs(deltaPsiCell);
    } else if (extOsmolarity > 0.18) {
      tonicityLabel = "Hypertonic";
      cellStatus = cellType === "rbc" ? "Crenation (Spiculated / Dehydrated)" : "Plasmolysis (Protoplast Detached from Cell Wall)";
      turgorPsi_p = 0;
    }

    return {
      psi_s_left,
      psi_s_right,
      deltaPsi_s,
      psi_cell_internal,
      psi_ext,
      deltaPsiCell,
      tonicityLabel,
      cellStatus,
      turgorPsi_p
    };
  }

  // Telemetry log history
  const trialLogs = [];

  container.innerHTML = `
    <div class="lab-container" style="max-width: 1400px; margin: 0 auto; padding: 12px 16px;">
      <!-- Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #38bdf8; box-shadow: 0 0 10px #38bdf8;"></span>
            Cell Membrane Transport &amp; Osmosis Suite
          </span>
          <span class="badge" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #7dd3fc; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            ${renderLatex("\\Psi = \\Psi_s + \\Psi_p \\quad \\bullet \\quad \\Psi_s = -iCRT \\quad \\bullet \\quad \\Delta h = \\frac{\\Delta\\Pi}{\\rho g}")}
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div class="btn-group" style="display: flex; border: 1px solid var(--border-color); border-radius: 6px; overflow: hidden;">
            <button id="btn-view-sim" class="btn btn-sm active" style="padding: 5px 12px; font-size: 0.8rem; border: none; border-radius: 0;">🔬 Osmosis Simulator</button>
            <button id="btn-view-photo" class="btn btn-sm" style="padding: 5px 12px; font-size: 0.8rem; border: none; border-radius: 0; background: transparent;">📸 4K Real Bench</button>
          </div>
          <button id="btn-export-csv" class="btn btn-secondary btn-sm" style="padding: 5px 12px; font-size: 0.8rem;">📥 Export CSV (E)</button>
        </div>
      </div>

      <!-- Main Layout -->
      <div style="display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 16px; align-items: start;">
        
        <!-- Left Column: Canvas Viewport & Telemetry -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div id="viewport-wrapper" style="position: relative; width: 100%; height: 500px; background: #080d1a; border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; box-shadow: inset 0 0 40px rgba(0,0,0,0.85);">
            
            <!-- Canvas -->
            <canvas id="osmosis-canvas" width="940" height="500" style="display: block; width: 100%; height: 100%;"></canvas>

            <!-- 4K Real Lab Bench Photo Overlay (Hidden by default) -->
            <div id="photo-overlay" style="display: none; position: absolute; inset: 0; background: #020617;">
              <picture>
              <source srcset="assets/labs/osmosis_bench.webp" type="image/webp">
              <img src="assets/labs/osmosis_bench.jpg" decoding="async" loading="lazy" alt="Cell Membrane Osmosis U-Tube 4K Bench" style="width: 100%; height: 100%; object-fit: cover;" />
            </picture>
              <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(2,6,23,0.3) 0%, rgba(2,6,23,0.85) 100%); pointer-events: none;"></div>
              
              <!-- Bench Callout Badges -->
              <div style="position: absolute; top: 20px; left: 24px; background: rgba(15, 23, 42, 0.9); border: 1px solid #38bdf8; border-radius: 8px; padding: 12px 16px; backdrop-filter: blur(8px); max-width: 340px;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #38bdf8; letter-spacing: 0.05em; text-transform: uppercase;">Real Apparatus Specifications</div>
                <div style="font-size: 0.95rem; font-weight: 600; color: #f8fafc; margin-top: 4px;">U-Tube Osmometer &amp; Dialysis Tubing Bench</div>
                <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 6px; line-height: 1.4;">
                  Spectra/Por regenerated cellulose semipermeable dialysis membrane (MWCO 3,500 Da) with capillary liquid column height readouts.
                </div>
              </div>

              <!-- Live Bench Telemetry Overlay -->
              <div style="position: absolute; bottom: 20px; left: 24px; right: 24px; background: rgba(15, 23, 42, 0.88); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px 20px; backdrop-filter: blur(10px); display: flex; justify-content: space-around; flex-wrap: wrap; gap: 16px;">
                <div>
                  <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase;">Water Column Δh</div>
                  <div id="photo-dh" style="font-size: 1.15rem; font-weight: 700; color: #38bdf8; font-family: monospace;">+0.0 cm</div>
                </div>
                <div>
                  <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase;">Left Arm (Ψ_s)</div>
                  <div id="photo-psi-l" style="font-size: 1.15rem; font-weight: 700; color: #a855f7; font-family: monospace;">-1.22 bar</div>
                </div>
                <div>
                  <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase;">Right Arm (Ψ_s)</div>
                  <div id="photo-psi-r" style="font-size: 1.15rem; font-weight: 700; color: #f43f5e; font-family: monospace;">-9.74 bar</div>
                </div>
                <div>
                  <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase;">Tonicity State</div>
                  <div id="photo-tonicity" style="font-size: 1.15rem; font-weight: 700; color: #10b981; font-family: monospace;">Hypertonic</div>
                </div>
              </div>
            </div>

            <!-- Experiment System Switcher Ribbon (top left inside viewport) -->
            <div style="position: absolute; top: 14px; left: 16px; display: flex; gap: 8px; z-index: 10;">
              <button id="btn-mode-utube" class="btn btn-sm active" style="font-size: 0.75rem; background: rgba(15, 23, 42, 0.88); border: 1px solid #38bdf8; color: #38bdf8; padding: 4px 10px; border-radius: 6px;">
                🧪 U-Tube Dialysis Osmometer
              </button>
              <button id="btn-mode-cell" class="btn btn-sm" style="font-size: 0.75rem; background: rgba(15, 23, 42, 0.88); border: 1px solid var(--border-color); color: #94a3b8; padding: 4px 10px; border-radius: 6px;">
                🔬 Cellular Tonicity &amp; Plasmolysis
              </button>
            </div>
          </div>

          <!-- Telemetry Table -->
          <div style="background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-size: 0.85rem; font-weight: 700; color: #f8fafc; text-transform: uppercase; letter-spacing: 0.05em;">
                📊 Osmotic Pressure &amp; Tonicity Trial Log
              </span>
              <button id="btn-log-trial" class="btn btn-sm" style="font-size: 0.75rem; background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; color: #38bdf8; padding: 3px 10px;">
                ➕ Log Equilibrium Trial
              </button>
            </div>
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; text-align: left; font-family: monospace;">
                <thead>
                  <tr style="border-bottom: 1px solid var(--border-color); color: #94a3b8;">
                    <th style="padding: 6px 8px;">System</th>
                    <th style="padding: 6px 8px;">Solute</th>
                    <th style="padding: 6px 8px;">C_left (M)</th>
                    <th style="padding: 6px 8px;">C_right (M)</th>
                    <th style="padding: 6px 8px;">Ψ_s Left (bar)</th>
                    <th style="padding: 6px 8px;">Ψ_s Right (bar)</th>
                    <th style="padding: 6px 8px;">Δh (cm)</th>
                    <th style="padding: 6px 8px;">Tonicity / Cellular State</th>
                  </tr>
                </thead>
                <tbody id="telemetry-table-body">
                  <tr>
                    <td colspan="8" style="padding: 10px; text-align: center; color: #64748b;">No logged trials. Click "Log Equilibrium Trial" to record.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right Column: Control Panel -->
        <div style="background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px; display: flex; flex-direction: column; gap: 18px;">
          
          <!-- Solute Selection -->
          <div>
            <label style="font-size: 0.8rem; font-weight: 700; color: #cbd5e1; display: block; margin-bottom: 6px;">
              Solute &amp; van 't Hoff Factor (i)
            </label>
            <select id="select-solute" class="form-select" style="width: 100%; background: #0f172a; border: 1px solid var(--border-color); color: #f8fafc; padding: 7px 10px; border-radius: 6px; font-size: 0.8rem;">
              <option value="sucrose">Sucrose C₁₂H₂₂O₁₁ (Non-ionizing, i = 1.0)</option>
              <option value="nacl">Sodium Chloride NaCl (Ionizing Na⁺ + Cl⁻, i = 2.0)</option>
            </select>
          </div>

          <!-- U-Tube Controls (Visible when in utube mode) -->
          <div id="utube-controls" style="display: flex; flex-direction: column; gap: 14px;">
            <div style="background: rgba(168, 85, 247, 0.05); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 8px; padding: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 700; color: #c084fc; margin-bottom: 6px;">
                <span>Left Arm Concentration (C₁)</span>
                <span id="lbl-solute-l">0.05 M</span>
              </div>
              <input type="range" id="slider-solute-l" min="0.00" max="0.80" step="0.05" value="0.05" style="width: 100%; accent-color: #a855f7;" />
            </div>

            <div style="background: rgba(244, 63, 94, 0.05); border: 1px solid rgba(244, 63, 94, 0.2); border-radius: 8px; padding: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 700; color: #f43f5e; margin-bottom: 6px;">
                <span>Right Arm Concentration (C₂)</span>
                <span id="lbl-solute-r">0.40 M</span>
              </div>
              <input type="range" id="slider-solute-r" min="0.00" max="0.80" step="0.05" value="0.40" style="width: 100%; accent-color: #f43f5e;" />
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: #cbd5e1; margin-bottom: 4px;">
                <span>Dialysis Membrane Pore Cutoff</span>
                <span id="lbl-pore" style="color: #38bdf8; font-weight: 600;">2.0 nm (Water only)</span>
              </div>
              <div style="font-size: 0.72rem; color: #64748b;">
                H₂O molecules (0.28 nm) pass freely; Solutes (>1.0 nm) are blocked.
              </div>
            </div>
          </div>

          <!-- Cell Tonicity Controls (Visible when in cell mode) -->
          <div id="cell-controls" style="display: none; flex-direction: column; gap: 14px;">
            <div>
              <label style="font-size: 0.78rem; font-weight: 700; color: #cbd5e1; display: block; margin-bottom: 6px;">
                Cell Specimen Model
              </label>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                <button id="btn-cell-rbc" class="btn btn-sm active" style="font-size: 0.75rem; background: rgba(244, 63, 94, 0.15); border: 1px solid #f43f5e; color: #f43f5e;">
                  🩸 Animal RBC (No Wall)
                </button>
                <button id="btn-cell-plant" class="btn btn-sm" style="font-size: 0.75rem; background: rgba(100, 116, 139, 0.2); border: 1px solid var(--border-color); color: #94a3b8;">
                  🌿 Elodea Plant Cell (Wall)
                </button>
              </div>
            </div>

            <div style="background: rgba(56, 189, 248, 0.05); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 8px; padding: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 700; color: #38bdf8; margin-bottom: 6px;">
                <span>Extracellular Tonicity (Molar)</span>
                <span id="lbl-ext-osm">0.15 M</span>
              </div>
              <input type="range" id="slider-ext-osm" min="0.00" max="0.60" step="0.02" value="0.15" style="width: 100%; accent-color: #38bdf8;" />
              <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: #64748b; margin-top: 4px;">
                <span>0.0M Pure H₂O</span>
                <span>0.15M Isotonic</span>
                <span>0.60M Hypertonic</span>
              </div>
            </div>

            <!-- Fast Tonicity Presets -->
            <div style="display: flex; gap: 6px;">
              <button id="preset-hypo" class="btn btn-secondary btn-sm" style="flex: 1; font-size: 0.72rem; padding: 5px 4px;">💧 Hypotonic</button>
              <button id="preset-iso" class="btn btn-secondary btn-sm" style="flex: 1; font-size: 0.72rem; padding: 5px 4px;">⚖️ Isotonic</button>
              <button id="preset-hyper" class="btn btn-secondary btn-sm" style="flex: 1; font-size: 0.72rem; padding: 5px 4px;">🧂 Hypertonic</button>
            </div>
          </div>

          <!-- Reset / Equalize Button -->
          <button id="btn-equalize" class="btn btn-secondary btn-sm" style="padding: 8px 12px; font-weight: 600;">
            🔄 Reset &amp; Equalize Chambers
          </button>

        </div>
      </div>

      <!-- Post-Lab Inquiry Checkpoint Assessment (Full Screen Width) -->
      <div id="osmosis-checkpoint-mount" style="margin-top: 24px; width: 100%;"></div>
    </div>
  `;

  // Element Selectors
  const canvas = document.getElementById("osmosis-canvas");
  const ctx = canvas?.getContext("2d");
  const viewSim = document.getElementById("btn-view-sim");
  const viewPhoto = document.getElementById("btn-view-photo");
  const photoOverlay = document.getElementById("photo-overlay");
  const exportBtn = document.getElementById("btn-export-csv");
  const logBtn = document.getElementById("btn-log-trial");
  const equalizeBtn = document.getElementById("btn-equalize");

  const btnModeUtube = document.getElementById("btn-mode-utube");
  const btnModeCell = document.getElementById("btn-mode-cell");
  const utubeControls = document.getElementById("utube-controls");
  const cellControls = document.getElementById("cell-controls");

  const btnCellRbc = document.getElementById("btn-cell-rbc");
  const btnCellPlant = document.getElementById("btn-cell-plant");
  const selectSolute = document.getElementById("select-solute");

  const sliderSoluteL = document.getElementById("slider-solute-l");
  const sliderSoluteR = document.getElementById("slider-solute-r");
  const sliderExtOsm = document.getElementById("slider-ext-osm");

  const lblSoluteL = document.getElementById("lbl-solute-l");
  const lblSoluteR = document.getElementById("lbl-solute-r");
  const lblExtOsm = document.getElementById("lbl-ext-osm");
  const presetHypo = document.getElementById("preset-hypo");
  const presetIso = document.getElementById("preset-iso");
  const presetHyper = document.getElementById("preset-hyper");

  const photoDh = document.getElementById("photo-dh");
  const photoPsiL = document.getElementById("photo-psi-l");
  const photoPsiR = document.getElementById("photo-psi-r");
  const photoTonicity = document.getElementById("photo-tonicity");
  const tableBody = document.getElementById("telemetry-table-body");

  // Canvas Setup & HiDPI Scaling
  const logicalW = 940;
  const logicalH = 500;
  function setupHiDPICanvas() {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : Math.min(window.devicePixelRatio || 1, 2);
    if (canvas) {
      canvas.width = Math.round(logicalW * dpr);
      canvas.height = Math.round(logicalH * dpr);
    }
  }
  setupHiDPICanvas();
  window.addEventListener("resize", setupHiDPICanvas);

  function logTrial() {
    const data = calculateWaterPotentials();
    trialLogs.unshift({
      mode: activeMode === "utube" ? "U-Tube Dialysis" : `Cell Tonicity (${cellType.toUpperCase()})`,
      solute: selectedSolute.toUpperCase(),
      cL: activeMode === "utube" ? soluteLeft.toFixed(2) : "0.15",
      cR: activeMode === "utube" ? soluteRight.toFixed(2) : extOsmolarity.toFixed(2),
      psiL: activeMode === "utube" ? data.psi_s_left.toFixed(2) : data.psi_cell_internal.toFixed(2),
      psiR: activeMode === "utube" ? data.psi_s_right.toFixed(2) : data.psi_ext.toFixed(2),
      dh: activeMode === "utube" ? (currentDeltaH * 0.1).toFixed(1) : "N/A",
      status: activeMode === "utube" ? `Net flux -> Right (ΔΨ = ${data.deltaPsi_s.toFixed(2)} bar)` : `${data.tonicityLabel}: ${data.cellStatus}`
    });
    if (trialLogs.length > 8) trialLogs.pop();
    updateTable();
  }

  function updateTable() {
    if (!tableBody) return;
    if (trialLogs.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" style="padding: 10px; text-align: center; color: #64748b;">No logged trials. Click "Log Equilibrium Trial" to record.</td></tr>`;
      return;
    }
    tableBody.innerHTML = trialLogs.map(row => `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); color: #e2e8f0;">
        <td style="padding: 6px 8px; color: #38bdf8;">${row.mode}</td>
        <td style="padding: 6px 8px; color: #fbbf24;">${row.solute}</td>
        <td style="padding: 6px 8px;">${row.cL}</td>
        <td style="padding: 6px 8px;">${row.cR}</td>
        <td style="padding: 6px 8px; color: #a855f7;">${row.psiL}</td>
        <td style="padding: 6px 8px; color: #f43f5e;">${row.psiR}</td>
        <td style="padding: 6px 8px; font-weight: 700; color: #38bdf8;">${row.dh}</td>
        <td style="padding: 6px 8px; color: #10b981;">${row.status}</td>
      </tr>
    `).join("");
  }

  function drawUtube(data) {
    if (!ctx) return;

    // Workbench Stand & Floor Background
    const floorY = 460;
    ctx.fillStyle = "#0c1322";
    ctx.fillRect(40, 40, 520, 420);

    // Grid lines on bench backing
    ctx.strokeStyle = "rgba(56, 189, 248, 0.04)";
    ctx.lineWidth = 1;
    for (let gx = 60; gx <= 540; gx += 30) {
      ctx.beginPath();
      ctx.moveTo(gx, 50);
      ctx.lineTo(gx, floorY);
      ctx.stroke();
    }
    for (let gy = 60; gy <= floorY; gy += 30) {
      ctx.beginPath();
      ctx.moveTo(50, gy);
      ctx.lineTo(550, gy);
      ctx.stroke();
    }

    // Cast Iron Stand Base & Rod
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(140, floorY - 14, 300, 16, 4);
    ctx.fill();
    ctx.stroke();

    // Chrome upright support rod behind center
    const rodGrad = ctx.createLinearGradient(285, 60, 295, 60);
    rodGrad.addColorStop(0, "#475569");
    rodGrad.addColorStop(0.5, "#94a3b8");
    rodGrad.addColorStop(1, "#334155");
    ctx.fillStyle = rodGrad;
    ctx.fillRect(286, 60, 8, floorY - 74);

    // Clamps holding the U-tube
    [160, 310].forEach(clampY => {
      ctx.fillStyle = "#0f172a";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1.5;
      ctx.fillRect(282, clampY, 16, 12);
      ctx.strokeRect(282, clampY, 16, 12);

      // Clamp arms reaching out
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(282, clampY + 6);
      ctx.lineTo(210, clampY + 6);
      ctx.moveTo(298, clampY + 6);
      ctx.lineTo(370, clampY + 6);
      ctx.stroke();

      // Red rubber jaws
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(206, clampY + 1, 6, 10);
      ctx.fillRect(368, clampY + 1, 6, 10);
    });

    const uLeftX = 140;
    const uRightX = 360;
    const uWidth = 80;
    const uBottomY = 410;
    const uTopY = 90;
    const baseHeight = 250;

    // Smooth approach to targetDeltaH
    currentDeltaH += (targetDeltaH - currentDeltaH) * 0.05;

    const leftLevelY = Math.max(uTopY + 20, Math.min(uBottomY - 70, baseHeight - currentDeltaH / 2));
    const rightLevelY = Math.max(uTopY + 20, Math.min(uBottomY - 70, baseHeight + currentDeltaH / 2));

    // 1. Draw Liquid in U-Tube
    // Left arm liquid (dilute, tranquil cyan)
    const leftLiqGrad = ctx.createLinearGradient(uLeftX, 0, uLeftX + uWidth, 0);
    leftLiqGrad.addColorStop(0, "rgba(56, 189, 248, 0.45)");
    leftLiqGrad.addColorStop(0.2, "rgba(56, 189, 248, 0.65)");
    leftLiqGrad.addColorStop(0.8, "rgba(14, 165, 233, 0.7)");
    leftLiqGrad.addColorStop(1, "rgba(2, 132, 199, 0.5)");
    ctx.fillStyle = leftLiqGrad;
    ctx.fillRect(uLeftX, leftLevelY, uWidth, uBottomY - leftLevelY);

    // Right arm liquid (solute-tinted rose/magenta)
    const rightLiqGrad = ctx.createLinearGradient(uRightX, 0, uRightX + uWidth, 0);
    rightLiqGrad.addColorStop(0, "rgba(244, 63, 94, 0.45)");
    rightLiqGrad.addColorStop(0.2, "rgba(244, 63, 94, 0.65)");
    rightLiqGrad.addColorStop(0.8, "rgba(225, 29, 72, 0.7)");
    rightLiqGrad.addColorStop(1, "rgba(190, 18, 60, 0.5)");
    ctx.fillStyle = rightLiqGrad;
    ctx.fillRect(uRightX, rightLevelY, uWidth, uBottomY - rightLevelY);

    // Horizontal bottom connecting channel liquid
    const horizGrad = ctx.createLinearGradient(uLeftX, 0, uRightX + uWidth, 0);
    horizGrad.addColorStop(0, "rgba(14, 165, 233, 0.7)");
    horizGrad.addColorStop(0.48, "rgba(56, 189, 248, 0.65)");
    horizGrad.addColorStop(0.52, "rgba(244, 63, 94, 0.65)");
    horizGrad.addColorStop(1, "rgba(225, 29, 72, 0.7)");
    ctx.fillStyle = horizGrad;
    ctx.fillRect(uLeftX, uBottomY - 54, uRightX - uLeftX + uWidth, 54);

    // 2. Glass Tube Walls & Specular Highlights
    ctx.strokeStyle = "rgba(255, 255, 255, 0.38)";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    // Outer glass boundary
    ctx.moveTo(uLeftX, uTopY);
    ctx.lineTo(uLeftX, uBottomY);
    ctx.lineTo(uRightX + uWidth, uBottomY);
    ctx.lineTo(uRightX + uWidth, uTopY);
    // Inner glass boundary
    ctx.moveTo(uLeftX + uWidth, uTopY);
    ctx.lineTo(uLeftX + uWidth, uBottomY - 54);
    ctx.lineTo(uRightX, uBottomY - 54);
    ctx.lineTo(uRightX, uTopY);
    ctx.stroke();

    // Specular reflections along glass walls
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(uLeftX + 5, uTopY + 10);
    ctx.lineTo(uLeftX + 5, uBottomY - 5);
    ctx.lineTo(uRightX + uWidth - 5, uBottomY - 5);
    ctx.lineTo(uRightX + uWidth - 5, uTopY + 10);
    ctx.stroke();

    // 3. Precision Graduated Capillary Tick Marks (-10 to +10 cm)
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "8px monospace";
    ctx.textAlign = "right";
    for (let cm = -10; cm <= 10; cm += 2) {
      const markY = baseHeight - cm * 10;
      if (markY >= uTopY + 15 && markY <= uBottomY - 65) {
        // Left arm ticks
        ctx.strokeStyle = cm === 0 ? "#38bdf8" : "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = cm === 0 ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(uLeftX, markY);
        ctx.lineTo(uLeftX + (cm % 5 === 0 ? 12 : 7), markY);
        ctx.stroke();
        if (cm % 5 === 0) {
          ctx.fillText(`${cm > 0 ? "+" : ""}${cm}`, uLeftX - 3, markY + 3);
        }

        // Right arm ticks
        ctx.textAlign = "left";
        ctx.strokeStyle = cm === 0 ? "#f43f5e" : "rgba(255, 255, 255, 0.4)";
        ctx.beginPath();
        ctx.moveTo(uRightX + uWidth, markY);
        ctx.lineTo(uRightX + uWidth - (cm % 5 === 0 ? 12 : 7), markY);
        ctx.stroke();
        if (cm % 5 === 0) {
          ctx.fillText(`${cm > 0 ? "+" : ""}${cm}`, uRightX + uWidth + 4, markY + 3);
        }
        ctx.textAlign = "right";
      }
    }

    // 4. Semipermeable Dialysis Membrane Joint in Center Channel
    const memX = (uLeftX + uWidth + uRightX) / 2;
    
    // Metal/PTFE Flange Joint Collar
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(memX - 8, uBottomY - 58, 16, 62, 3);
    ctx.fill();
    ctx.stroke();

    // Semipermeable Membrane Porous Core
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(memX, uBottomY - 54);
    ctx.lineTo(memX, uBottomY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Dialysis Membrane Callout
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.fillText("DIALYSIS MEMBRANE", memX, uBottomY - 64);
    ctx.font = "8px sans-serif";
    ctx.fillStyle = "#fde68a";
    ctx.fillText("Pores: 2.0 nm (MWCO 3.5 kDa)", memX, uBottomY + 18);

    // 5. Liquid Meniscus Curves with High-Luster Ellipse
    // Left meniscus
    ctx.fillStyle = "rgba(56, 189, 248, 0.85)";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(uLeftX + uWidth / 2, leftLevelY, uWidth / 2, 7, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Right meniscus
    ctx.fillStyle = "rgba(244, 63, 94, 0.85)";
    ctx.strokeStyle = "#f43f5e";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(uRightX + uWidth / 2, rightLevelY, uWidth / 2, 7, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Height differential (Δh) guidelines & Bracket
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(uLeftX + uWidth, leftLevelY);
    ctx.lineTo(uRightX, leftLevelY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(uRightX, rightLevelY);
    ctx.lineTo(uRightX + uWidth + 36, rightLevelY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Δh arrow & value indicator
    const dhPx = Math.abs(rightLevelY - leftLevelY);
    if (dhPx > 4) {
      const arrowX = uRightX + uWidth + 28;
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(arrowX, leftLevelY);
      ctx.lineTo(arrowX, rightLevelY);
      ctx.stroke();

      // Top & bottom ticks on arrow
      ctx.beginPath();
      ctx.moveTo(arrowX - 5, leftLevelY);
      ctx.lineTo(arrowX + 5, leftLevelY);
      ctx.moveTo(arrowX - 5, rightLevelY);
      ctx.lineTo(arrowX + 5, rightLevelY);
      ctx.stroke();

      ctx.fillStyle = "#facc15";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`Δh = ${(currentDeltaH * 0.1).toFixed(1)} cm`, arrowX + 8, (leftLevelY + rightLevelY) / 2 + 4);
    }

    // 6. Net Osmotic Flux Vector Across Membrane
    if (Math.abs(data.deltaPsi_s) > 0.2) {
      const arrowDir = data.deltaPsi_s < 0 ? 1 : -1;
      const arrowY = uBottomY - 27;
      const flowPulse = Math.sin(simTime * 6) * 4;
      ctx.strokeStyle = "#38bdf8";
      ctx.fillStyle = "#38bdf8";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(memX - 25 * arrowDir, arrowY);
      ctx.lineTo(memX + (25 + flowPulse) * arrowDir, arrowY);
      ctx.stroke();

      // Arrow head
      ctx.beginPath();
      ctx.moveTo(memX + (25 + flowPulse) * arrowDir, arrowY);
      ctx.lineTo(memX + (17 + flowPulse) * arrowDir, arrowY - 5);
      ctx.lineTo(memX + (17 + flowPulse) * arrowDir, arrowY + 5);
      ctx.closePath();
      ctx.fill();

      ctx.font = "bold 8px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("NET H₂O FLUX", memX, arrowY - 9);
    }

    // 7. Render Animated Particles with Rigid U-Tube Liquid Clipping
    ctx.save();
    ctx.beginPath();
    // Left arm fluid
    ctx.rect(uLeftX + 2, leftLevelY, uWidth - 4, uBottomY - leftLevelY);
    // Right arm fluid
    ctx.rect(uRightX + 2, rightLevelY, uWidth - 4, uBottomY - rightLevelY);
    // Bottom connecting channel
    ctx.rect(uLeftX + 2, uBottomY - 54, uRightX - uLeftX + uWidth - 4, 52);
    ctx.clip();

    // Water molecules (cyan dots with micro-dipole aura)
    ctx.fillStyle = "#38bdf8";
    waterParticles.forEach(p => {
      // Net osmotic drift bias toward right arm if deltaPsi_s < 0
      const drift = (data.deltaPsi_s < 0 ? 0.35 : -0.35) * Math.min(1, Math.abs(data.deltaPsi_s) / 5);
      p.x += p.vx + drift;
      p.y += p.vy;

      // Bounce within outer liquid boundary
      if (p.x < uLeftX + 6) { p.x = uLeftX + 6; p.vx = Math.abs(p.vx); }
      if (p.x > uRightX + uWidth - 6) { p.x = uRightX + uWidth - 6; p.vx = -Math.abs(p.vx); }
      if (p.y > uBottomY - 6) { p.y = uBottomY - 6; p.vy = -Math.abs(p.vy); }
      if (p.y < (p.x < uLeftX + uWidth ? leftLevelY : rightLevelY) + 6) {
        p.vy = Math.abs(p.vy);
      }

      // Keep within the U-tube arms or bottom channel (prevent floating in inner air gap)
      if (p.x > uLeftX + uWidth - 6 && p.x < uRightX + 6) {
        if (p.y < uBottomY - 54 + 6) {
          p.y = uBottomY - 54 + 6;
          p.vy = Math.abs(p.vy);
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      // Hydrogen lobes (dipole appearance)
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.beginPath();
      ctx.arc(p.x - 2, p.y - 1.5, 1.2, 0, Math.PI * 2);
      ctx.arc(p.x + 2, p.y - 1.5, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#38bdf8";
    });

    // Solute molecules (large purple/pink discs blocked by membrane)
    soluteParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      // Solute cannot cross membrane at memX!
      if (p.chamber === "left") {
        if (p.x > memX - 12) { p.x = memX - 12; p.vx = -Math.abs(p.vx); }
        if (p.x < uLeftX + 10) { p.x = uLeftX + 10; p.vx = Math.abs(p.vx); }
        if (p.y < leftLevelY + 10) { p.y = leftLevelY + 10; p.vy = Math.abs(p.vy); }
        if (p.y > uBottomY - 10) { p.y = uBottomY - 10; p.vy = -Math.abs(p.vy); }
      } else {
        if (p.x < memX + 12) { p.x = memX + 12; p.vx = Math.abs(p.vx); }
        if (p.x > uRightX + uWidth - 10) { p.x = uRightX + uWidth - 10; p.vx = -Math.abs(p.vx); }
        if (p.y < rightLevelY + 10) { p.y = rightLevelY + 10; p.vy = Math.abs(p.vy); }
        if (p.y > uBottomY - 10) { p.y = uBottomY - 10; p.vy = -Math.abs(p.vy); }
      }

      // Solute sphere with 3D radial gradient
      const solGrad = ctx.createRadialGradient(p.x - 2, p.y - 2, 1, p.x, p.y, p.size);
      if (selectedSolute === "sucrose") {
        solGrad.addColorStop(0, "#f5d0fe");
        solGrad.addColorStop(0.6, "#c084fc");
        solGrad.addColorStop(1, "#7e22ce");
      } else {
        solGrad.addColorStop(0, "#fed7aa");
        solGrad.addColorStop(0.6, "#f97316");
        solGrad.addColorStop(1, "#c2410c");
      }
      ctx.fillStyle = solGrad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      // Hydration shell ring
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    ctx.restore();

    // 8. Right Side Thermodynamic HUD
    const hudX = 590;
    const hudY = 50;
    const hudW = 320;
    const hudH = 410;

    ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
    ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(hudX, hudY, hudW, hudH, 10);
    ctx.fill();
    ctx.stroke();

    // HUD Header
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("WATER POTENTIAL DYNAMICS (Ψ)", hudX + 18, hudY + 28);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px sans-serif";
    ctx.fillText("van 't Hoff: Ψ_s = -i·C·R·T | Hydrostatic: ΔP = ρgΔh", hudX + 18, hudY + 46);

    // Left Arm Breakdown Box
    ctx.fillStyle = "rgba(168, 85, 247, 0.08)";
    ctx.strokeStyle = "rgba(168, 85, 247, 0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(hudX + 14, hudY + 60, hudW - 28, 64, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#c084fc";
    ctx.font = "bold 11px monospace";
    ctx.fillText(`LEFT ARM (C₁ = ${soluteLeft.toFixed(2)} M):`, hudX + 24, hudY + 80);
    ctx.fillStyle = "#f8fafc";
    ctx.font = "11px monospace";
    ctx.fillText(`Ψ_s = -iCRT = ${data.psi_s_left.toFixed(2)} bar`, hudX + 24, hudY + 100);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px sans-serif";
    ctx.fillText(`Solute Particles: ~${Math.round(soluteLeft * 30)} | High Free H₂O Energy`, hudX + 24, hudY + 116);

    // Right Arm Breakdown Box
    ctx.fillStyle = "rgba(244, 63, 94, 0.08)";
    ctx.strokeStyle = "rgba(244, 63, 94, 0.3)";
    ctx.beginPath();
    ctx.roundRect(hudX + 14, hudY + 134, hudW - 28, 64, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#f43f5e";
    ctx.font = "bold 11px monospace";
    ctx.fillText(`RIGHT ARM (C₂ = ${soluteRight.toFixed(2)} M):`, hudX + 24, hudY + 154);
    ctx.fillStyle = "#f8fafc";
    ctx.font = "11px monospace";
    ctx.fillText(`Ψ_s = -iCRT = ${data.psi_s_right.toFixed(2)} bar`, hudX + 24, hudY + 174);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px sans-serif";
    ctx.fillText(`Solute Particles: ~${Math.round(soluteRight * 30)} | Lower Free H₂O Energy`, hudX + 24, hudY + 190);

    // Net Potential Difference Card
    ctx.fillStyle = "rgba(250, 204, 21, 0.08)";
    ctx.strokeStyle = "rgba(250, 204, 21, 0.3)";
    ctx.beginPath();
    ctx.roundRect(hudX + 14, hudY + 208, hudW - 28, 86, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#facc15";
    ctx.font = "bold 12px monospace";
    ctx.fillText(`ΔΨ = Ψ_right - Ψ_left`, hudX + 24, hudY + 230);
    ctx.font = "bold 14px monospace";
    ctx.fillText(`= ${data.deltaPsi_s.toFixed(2)} bar`, hudX + 24, hudY + 252);

    ctx.fillStyle = "#10b981";
    ctx.font = "bold 11px sans-serif";
    const netFlowDir = data.deltaPsi_s < -0.05 ? "LEFT ➔ RIGHT (Right arm rises)" : (data.deltaPsi_s > 0.05 ? "RIGHT ➔ LEFT (Left arm rises)" : "EQUILIBRIUM (Δh = 0)");
    ctx.fillText(`Net Flux: ${netFlowDir}`, hudX + 24, hudY + 276);

    // Dynamic Osmotic vs Hydrostatic Bar
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "10px sans-serif";
    ctx.fillText("EQUILIBRIUM BALANCE:", hudX + 18, hudY + 316);

    const barW = hudW - 36;
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(hudX + 18, hudY + 326, barW, 14);

    // Fill ratio
    const eqRatio = Math.min(1, Math.abs(currentDeltaH) / (Math.abs(targetDeltaH) + 0.001));
    ctx.fillStyle = eqRatio > 0.95 ? "#10b981" : "#38bdf8";
    ctx.fillRect(hudX + 18, hudY + 326, barW * eqRatio, 14);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${(eqRatio * 100).toFixed(0)}% Osmotic Head Equilibrated`, hudX + 18 + barW / 2, hudY + 337);

    // Hydrostatic Balancing Note
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("At equilibrium: ΔP_hydrostatic = ΔΠ_osmotic", hudX + 18, hudY + 365);
    ctx.fillText("Δh = ΔΠ / (ρ · g) = (target reached)", hudX + 18, hudY + 382);
  }

  function drawCellTonicity(data) {
    if (!ctx) return;

    // Viewport Center
    const cellX = 300;
    const cellY = 250;

    // 1. Photorealistic Microscope Stage & Brass Bezel
    const scopeR = 195;
    
    // Outer dark stage plate
    ctx.fillStyle = "#030712";
    ctx.fillRect(30, 30, 540, 440);

    // Concentric knurled brass / metallic ring
    const brassGrad = ctx.createRadialGradient(cellX, cellY, scopeR - 15, cellX, cellY, scopeR + 10);
    brassGrad.addColorStop(0, "#475569");
    brassGrad.addColorStop(0.3, "#94a3b8");
    brassGrad.addColorStop(0.7, "#334155");
    brassGrad.addColorStop(1, "#0f172a");
    ctx.strokeStyle = brassGrad;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(cellX, cellY, scopeR, 0, Math.PI * 2);
    ctx.stroke();

    // Microscope illumination field
    const fieldGrad = ctx.createRadialGradient(cellX, cellY, 20, cellX, cellY, scopeR - 8);
    const fluidHue = extOsmolarity < 0.12 ? "rgba(14, 165, 233, 0.25)" : (extOsmolarity > 0.18 ? "rgba(244, 63, 94, 0.22)" : "rgba(16, 185, 129, 0.2)");
    fieldGrad.addColorStop(0, "#1e293b");
    fieldGrad.addColorStop(0.7, "#0f172a");
    fieldGrad.addColorStop(1, "#020617");
    ctx.fillStyle = fieldGrad;
    ctx.beginPath();
    ctx.arc(cellX, cellY, scopeR - 8, 0, Math.PI * 2);
    ctx.fill();

    // Extracellular fluid tint
    ctx.fillStyle = fluidHue;
    ctx.beginPath();
    ctx.arc(cellX, cellY, scopeR - 8, 0, Math.PI * 2);
    ctx.fill();

    // Reticle crosshair & micrometer scale
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cellX - scopeR + 12, cellY);
    ctx.lineTo(cellX + scopeR - 12, cellY);
    ctx.moveTo(cellX, cellY - scopeR + 12);
    ctx.lineTo(cellX, cellY + scopeR - 12);
    ctx.stroke();

    // Calibrated concentric circles
    [50, 100, 150].forEach(r => {
      ctx.beginPath();
      ctx.arc(cellX, cellY, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // 2. Render Cell Specimen with High-Fidelity Cytology
    if (cellType === "rbc") {
      // Animal Erythrocyte (Red Blood Cell)
      if (extOsmolarity < 0.10) {
        // Hypotonic Lysis (Ghost Membrane & Hemoglobin Leakage)
        const pulse = Math.sin(simTime * 4) * 2;
        
        // Dissipated Hemoglobin Cloud
        const hemoGrad = ctx.createRadialGradient(cellX, cellY, 30, cellX, cellY, 150);
        hemoGrad.addColorStop(0, "rgba(239, 68, 68, 0.45)");
        hemoGrad.addColorStop(0.5, "rgba(220, 38, 38, 0.2)");
        hemoGrad.addColorStop(1, "rgba(185, 28, 28, 0)");
        ctx.fillStyle = hemoGrad;
        ctx.beginPath();
        ctx.arc(cellX, cellY, 150, 0, Math.PI * 2);
        ctx.fill();

        // Escaped Hemoglobin clusters
        for (let i = 0; i < 28; i++) {
          const ang = (i / 28) * Math.PI * 2 + simTime * 0.1;
          const rDist = 90 + ((i * 19) % 65);
          ctx.fillStyle = "rgba(239, 68, 68, 0.55)";
          ctx.beginPath();
          ctx.arc(cellX + Math.cos(ang) * rDist, cellY + Math.sin(ang) * rDist, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Ruptured Ghost Membrane (Transparent pale lipid bilayer with gaps)
        ctx.strokeStyle = "rgba(252, 165, 165, 0.45)";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([12, 8]);
        ctx.beginPath();
        ctx.arc(cellX, cellY, 105 + pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Rupture site tear
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(cellX, cellY, 105 + pulse, 0.2, 0.8);
        ctx.stroke();

        ctx.fillStyle = "#ef4444";
        ctx.font = "bold 13px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("HEMOLYTIC LYSIS (ERYTHROCYTE GHOST)", cellX, cellY - 10);
        ctx.fillStyle = "#fca5a5";
        ctx.font = "10px sans-serif";
        ctx.fillText("Critical hydrostatic turgor exceeded membrane yield limit", cellX, cellY + 12);
        ctx.fillText("Hemoglobin completely released into extracellular supernatant", cellX, cellY + 28);

      } else if (extOsmolarity > 0.20) {
        // Hypertonic Crenation (Echinocyte Spiculated Morphology)
        const spikes = 16;
        ctx.fillStyle = "#991b1b";
        ctx.strokeStyle = "#dc2626";
        ctx.lineWidth = 2.5;

        // 3D Shaded Echinocyte Body
        const crenGrad = ctx.createRadialGradient(cellX - 10, cellY - 10, 8, cellX, cellY, 62);
        crenGrad.addColorStop(0, "#ef4444");
        crenGrad.addColorStop(0.5, "#991b1b");
        crenGrad.addColorStop(1, "#450a0a");
        ctx.fillStyle = crenGrad;

        ctx.beginPath();
        for (let s = 0; s < spikes; s++) {
          const a = (s / spikes) * Math.PI * 2;
          const rOuter = 58 + Math.sin(s * 3) * 4;
          const rInner = 40;
          ctx.lineTo(cellX + Math.cos(a) * rOuter, cellY + Math.sin(a) * rOuter);
          const aMid = a + Math.PI / spikes;
          ctx.lineTo(cellX + Math.cos(aMid) * rInner, cellY + Math.sin(aMid) * rInner);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 3D Spicule bumps shading
        for (let s = 0; s < spikes; s++) {
          const a = (s / spikes) * Math.PI * 2;
          const rOuter = 58 + Math.sin(s * 3) * 4;
          ctx.fillStyle = "rgba(254, 202, 202, 0.4)";
          ctx.beginPath();
          ctx.arc(cellX + Math.cos(a) * (rOuter - 4), cellY + Math.sin(a) * (rOuter - 4), 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("CRENATED RBC (ECHINOCYTE)", cellX, cellY + 95);
        ctx.font = "10px sans-serif";
        ctx.fillStyle = "#f87171";
        ctx.fillText("Osmotic water efflux -> Dehydrated condensed stroma", cellX, cellY + 112);

      } else {
        // Isotonic (Normal Biconcave Disc with 3D Spherical/Toroid Lighting)
        const rbcGrad = ctx.createRadialGradient(cellX - 18, cellY - 18, 12, cellX, cellY, 78);
        rbcGrad.addColorStop(0, "#f87171");
        rbcGrad.addColorStop(0.3, "#dc2626");
        rbcGrad.addColorStop(0.8, "#991b1b");
        rbcGrad.addColorStop(1, "#450a0a");

        ctx.fillStyle = rbcGrad;
        ctx.strokeStyle = "#7f1d1d";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cellX, cellY, 76, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Central Biconcave Indentation with Dimple Radial Gradient
        const dimpleGrad = ctx.createRadialGradient(cellX, cellY, 5, cellX, cellY, 34);
        dimpleGrad.addColorStop(0, "#450a0a");
        dimpleGrad.addColorStop(0.7, "#7f1d1d");
        dimpleGrad.addColorStop(1, "rgba(220, 38, 38, 0)");
        ctx.fillStyle = dimpleGrad;
        ctx.beginPath();
        ctx.arc(cellX, cellY, 34, 0, Math.PI * 2);
        ctx.fill();

        // Specular Torus Arc Highlight
        ctx.strokeStyle = "rgba(254, 202, 202, 0.4)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cellX, cellY, 52, Math.PI * 0.8, Math.PI * 1.5);
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("ISOTONIC ERYTHROCYTE", cellX, cellY + 105);
        ctx.font = "10px sans-serif";
        ctx.fillStyle = "#86efac";
        ctx.fillText("Physiological Equilibrium (Dynamic 1:1 H₂O flux)", cellX, cellY + 122);
      }

    } else {
      // Plant Cell (Elodea Epidermal Cell with Rigid Cellulose Wall)
      const boxW = 220;
      const boxH = 150;

      // 1. Rigid Cellulose Cell Wall (Green thick rectangular framework)
      ctx.fillStyle = "#064e3b";
      ctx.fillRect(cellX - boxW / 2 - 4, cellY - boxH / 2 - 4, boxW + 8, boxH + 8);

      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 8;
      ctx.strokeRect(cellX - boxW / 2, cellY - boxH / 2, boxW, boxH);

      // Pectin Middle Lamella & Corner pits
      ctx.strokeStyle = "#047857";
      ctx.lineWidth = 2;
      ctx.strokeRect(cellX - boxW / 2 + 5, cellY - boxH / 2 + 5, boxW - 10, boxH - 10);

      // 2. Plasma Membrane, Vacuole & Chloroplasts
      if (extOsmolarity < 0.12) {
        // Turgid Plant Cell: Plasma membrane firmly pressed against wall
        ctx.fillStyle = "rgba(16, 185, 129, 0.4)";
        ctx.fillRect(cellX - boxW / 2 + 6, cellY - boxH / 2 + 6, boxW - 12, boxH - 12);

        // Huge Central Vacuole (Crystalline blue-green hydrostatic reservoir)
        const vacGrad = ctx.createLinearGradient(cellX - boxW / 2 + 20, 0, cellX + boxW / 2 - 20, 0);
        vacGrad.addColorStop(0, "rgba(56, 189, 248, 0.6)");
        vacGrad.addColorStop(0.5, "rgba(14, 165, 233, 0.75)");
        vacGrad.addColorStop(1, "rgba(2, 132, 199, 0.6)");
        ctx.fillStyle = vacGrad;
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(cellX - boxW / 2 + 20, cellY - boxH / 2 + 20, boxW - 40, boxH - 40, 12);
        ctx.fill();
        ctx.stroke();

        // Chloroplasts squeezed along periphery (cyclosis streaming)
        const numChloroplasts = 14;
        for (let c = 0; c < numChloroplasts; c++) {
          const ang = (c / numChloroplasts) * Math.PI * 2 + simTime * 0.2;
          const cx = cellX + Math.cos(ang) * (boxW / 2 - 14);
          const cy = cellY + Math.sin(ang) * (boxH / 2 - 14);
          ctx.fillStyle = "#15803d";
          ctx.beginPath();
          ctx.ellipse(cx, cy, 7, 4, ang, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#86efac";
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Turgor Pressure outward vector arrows
        ctx.strokeStyle = "#facc15";
        ctx.lineWidth = 2;
        [
          [cellX, cellY - boxH / 2 + 24, cellX, cellY - boxH / 2 + 8],
          [cellX, cellY + boxH / 2 - 24, cellX, cellY + boxH / 2 - 8],
          [cellX - boxW / 2 + 24, cellY, cellX - boxW / 2 + 8, cellY],
          [cellX + boxW / 2 - 24, cellY, cellX + boxW / 2 - 8, cellY]
        ].forEach(([x1, y1, x2, y2]) => {
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        });

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("TURGID PLANT CELL", cellX, cellY - 4);
        ctx.fillStyle = "#facc15";
        ctx.font = "bold 10px monospace";
        ctx.fillText(`High Wall Turgor Pressure (Ψ_p = ${data.turgorPsi_p.toFixed(2)} bar)`, cellX, cellY + 12);

      } else if (extOsmolarity > 0.18) {
        // Plasmolysis: Protoplast violently shrivelled away from wall
        // Hypertonic saline filling periplasmic space
        ctx.fillStyle = "rgba(244, 63, 94, 0.18)";
        ctx.fillRect(cellX - boxW / 2 + 6, cellY - boxH / 2 + 6, boxW - 12, boxH - 12);

        // Hechtian strands (thin membranous threads anchoring to cell wall corners)
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 1.5;
        const shrivelW = boxW * 0.52;
        const shrivelH = boxH * 0.52;
        [
          [cellX - shrivelW / 2, cellY - shrivelH / 2, cellX - boxW / 2 + 6, cellY - boxH / 2 + 6],
          [cellX + shrivelW / 2, cellY - shrivelH / 2, cellX + boxW / 2 - 6, cellY - boxH / 2 + 6],
          [cellX - shrivelW / 2, cellY + shrivelH / 2, cellX - boxW / 2 + 6, cellY + boxH / 2 - 6],
          [cellX + shrivelW / 2, cellY + shrivelH / 2, cellX + boxW / 2 - 6, cellY + boxH / 2 - 6]
        ].forEach(([x1, y1, x2, y2]) => {
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        });

        // Shrivelled protoplast inside
        const protoGrad = ctx.createLinearGradient(cellX - shrivelW / 2, 0, cellX + shrivelW / 2, 0);
        protoGrad.addColorStop(0, "rgba(21, 128, 61, 0.9)");
        protoGrad.addColorStop(1, "rgba(22, 101, 52, 0.95)");
        ctx.fillStyle = protoGrad;
        ctx.strokeStyle = "#86efac";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(cellX - shrivelW / 2, cellY - shrivelH / 2, shrivelW, shrivelH, 16);
        ctx.fill();
        ctx.stroke();

        // Shrunken internal vacuole
        ctx.fillStyle = "rgba(56, 189, 248, 0.4)";
        ctx.beginPath();
        ctx.roundRect(cellX - 25, cellY - 18, 50, 36, 6);
        ctx.fill();

        ctx.fillStyle = "#facc15";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("SEVERE PLASMOLYSIS", cellX, cellY - 4);
        ctx.font = "9px sans-serif";
        ctx.fillStyle = "#f8fafc";
        ctx.fillText("Protoplast detached from rigid cell wall", cellX, cellY + 12);
        ctx.fillStyle = "#fca5a5";
        ctx.fillText("Periplasmic space filled with hypertonic fluid", cellX, cellY + 24);

      } else {
        // Isotonic (Flaccid Equilibrium, Ψ_p = 0)
        ctx.fillStyle = "rgba(16, 185, 129, 0.3)";
        ctx.fillRect(cellX - boxW / 2 + 6, cellY - boxH / 2 + 6, boxW - 12, boxH - 12);

        // Moderate resting vacuole
        ctx.fillStyle = "rgba(56, 189, 248, 0.45)";
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(cellX - boxW / 2 + 28, cellY - boxH / 2 + 24, boxW - 56, boxH - 48, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("FLACCID PLANT CELL (Ψ_p = 0)", cellX, cellY);
        ctx.font = "10px sans-serif";
        ctx.fillStyle = "#86efac";
        ctx.fillText("Zero wall turgor pressure; plant wilts without support", cellX, cellY + 16);
      }
    }

    // 3. Right Side Cytology HUD
    const hudX = 590;
    const hudY = 50;
    const hudW = 320;
    const hudH = 410;

    ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
    ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(hudX, hudY, hudW, hudH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("CYTOLOGICAL TONICITY HUD", hudX + 18, hudY + 28);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px sans-serif";
    ctx.fillText(`Specimen: ${cellType === "rbc" ? "Mammalian Erythrocyte (No Wall)" : "Elodea Epidermal (Rigid Wall)"}`, hudX + 18, hudY + 46);

    // Status Banner Box
    const pillColor = data.tonicityLabel === "Isotonic" ? "#10b981" : (data.tonicityLabel === "Hypotonic" ? "#38bdf8" : "#f43f5e");
    ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
    ctx.strokeStyle = pillColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(hudX + 14, hudY + 60, hudW - 28, 54, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = pillColor;
    ctx.font = "bold 13px monospace";
    ctx.fillText(`TONICITY: ${data.tonicityLabel.toUpperCase()}`, hudX + 24, hudY + 82);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "11px sans-serif";
    ctx.fillText(`Extracellular: ${extOsmolarity.toFixed(2)} M | Cytosol: 0.15 M`, hudX + 24, hudY + 101);

    // Water Potential Analysis
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(hudX + 14, hudY + 124, hudW - 28, 140, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 11px monospace";
    ctx.fillText("WATER POTENTIAL ANALYSIS (Ψ = Ψs + Ψp):", hudX + 24, hudY + 144);

    ctx.fillStyle = "#c084fc";
    ctx.font = "11px monospace";
    ctx.fillText(`Ψ_ext = ${data.psi_ext.toFixed(2)} bar`, hudX + 24, hudY + 168);
    ctx.fillText(`Ψ_cell = ${data.psi_cell_internal.toFixed(2)} bar`, hudX + 24, hudY + 188);

    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 11px monospace";
    ctx.fillText(`Turgor Pressure Ψ_p = ${data.turgorPsi_p.toFixed(2)} bar`, hudX + 24, hudY + 212);

    ctx.fillStyle = "#facc15";
    ctx.font = "10px sans-serif";
    ctx.fillText(`Gradient ΔΨ = ${(data.psi_ext - data.psi_cell_internal).toFixed(2)} bar`, hudX + 24, hudY + 234);

    const fluxDesc = data.deltaPsiCell < -0.1 ? "Efflux: Water leaves cell -> Shrivels" : (data.deltaPsiCell > 0.1 ? "Influx: Water enters cell -> Swells" : "Equilibrium: Equal bidirectional flux");
    ctx.fillStyle = pillColor;
    ctx.font = "bold 10px sans-serif";
    ctx.fillText(fluxDesc, hudX + 24, hudY + 252);

    // Physiological Outcome Card
    ctx.fillStyle = "rgba(56, 189, 248, 0.06)";
    ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
    ctx.beginPath();
    ctx.roundRect(hudX + 14, hudY + 274, hudW - 28, 116, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("Physiological Cytopathology:", hudX + 24, hudY + 296);

    ctx.fillStyle = pillColor;
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(data.cellStatus, hudX + 24, hudY + 318);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px sans-serif";
    if (cellType === "rbc") {
      ctx.fillText("Animal cells lack rigid peptidoglycan/cellulose walls", hudX + 24, hudY + 342);
      ctx.fillText("making them vulnerable to osmotic hemolysis in pure water.", hudX + 24, hudY + 358);
    } else {
      ctx.fillText("Plant cell walls resist internal turgor up to ~15 bar,", hudX + 24, hudY + 342);
      ctx.fillText("enabling mechanical rigidity and standing upright.", hudX + 24, hudY + 358);
    }
  }

  function loop(timestamp) {
    if (!container || !container.isConnected) {
      isRunning = false;
      if (animId) cancelAnimationFrame(animId);
      return;
    }
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;

    if (isRunning) {
      simTime += dt;
      const data = calculateWaterPotentials();

      const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : Math.min(window.devicePixelRatio || 1, 2);
      ctx.save();
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, logicalW, logicalH);

      // Deep space grid background
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      for (let x = 0; x < logicalW; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, logicalH);
        ctx.stroke();
      }

      if (activeMode === "utube") {
        drawUtube(data);
      } else {
        drawCellTonicity(data);
      }

      ctx.restore();

      // Update Real Bench Photo HUD
      if (photoDh) photoDh.textContent = `${currentDeltaH > 0 ? "+" : ""}${(currentDeltaH * 0.1).toFixed(1)} cm`;
      if (photoPsiL) photoPsiL.textContent = `${data.psi_s_left.toFixed(2)} bar`;
      if (photoPsiR) photoPsiR.textContent = `${data.psi_s_right.toFixed(2)} bar`;
      if (photoTonicity) photoTonicity.textContent = data.tonicityLabel;
    }

    animId = requestAnimationFrame(loop);
  }

  // Event Listeners
  btnModeUtube?.addEventListener("click", () => {
    activeMode = "utube";
    btnModeUtube.className = "btn btn-sm active";
    btnModeUtube.style.borderColor = "#38bdf8";
    btnModeUtube.style.color = "#38bdf8";
    btnModeCell.className = "btn btn-sm";
    btnModeCell.style.borderColor = "var(--border-color)";
    btnModeCell.style.color = "#94a3b8";
    if (utubeControls) utubeControls.style.display = "flex";
    if (cellControls) cellControls.style.display = "none";
    initParticles();
  });

  btnModeCell?.addEventListener("click", () => {
    activeMode = "cell";
    btnModeCell.className = "btn btn-sm active";
    btnModeCell.style.borderColor = "#38bdf8";
    btnModeCell.style.color = "#38bdf8";
    btnModeUtube.className = "btn btn-sm";
    btnModeUtube.style.borderColor = "var(--border-color)";
    btnModeUtube.style.color = "#94a3b8";
    if (utubeControls) utubeControls.style.display = "none";
    if (cellControls) cellControls.style.display = "flex";
  });

  btnCellRbc?.addEventListener("click", () => {
    cellType = "rbc";
    btnCellRbc.className = "btn btn-sm active";
    btnCellRbc.style.background = "rgba(244, 63, 94, 0.15)";
    btnCellRbc.style.borderColor = "#f43f5e";
    btnCellRbc.style.color = "#f43f5e";
    btnCellPlant.className = "btn btn-sm";
    btnCellPlant.style.background = "rgba(100, 116, 139, 0.2)";
    btnCellPlant.style.borderColor = "var(--border-color)";
    btnCellPlant.style.color = "#94a3b8";
  });

  btnCellPlant?.addEventListener("click", () => {
    cellType = "plant";
    btnCellPlant.className = "btn btn-sm active";
    btnCellPlant.style.background = "rgba(34, 197, 94, 0.15)";
    btnCellPlant.style.borderColor = "#22c55e";
    btnCellPlant.style.color = "#22c55e";
    btnCellRbc.className = "btn btn-sm";
    btnCellRbc.style.background = "rgba(100, 116, 139, 0.2)";
    btnCellRbc.style.borderColor = "var(--border-color)";
    btnCellRbc.style.color = "#94a3b8";
  });

  selectSolute?.addEventListener("change", (e) => {
    selectedSolute = e.target.value;
    initParticles();
    SoundFX.playClick();
  });

  sliderSoluteL?.addEventListener("input", (e) => {
    soluteLeft = parseFloat(e.target.value);
    if (lblSoluteL) lblSoluteL.textContent = `${soluteLeft.toFixed(2)} M`;
    initParticles();
  });

  sliderSoluteR?.addEventListener("input", (e) => {
    soluteRight = parseFloat(e.target.value);
    if (lblSoluteR) lblSoluteR.textContent = `${soluteRight.toFixed(2)} M`;
    initParticles();
  });

  sliderExtOsm?.addEventListener("input", (e) => {
    extOsmolarity = parseFloat(e.target.value);
    if (lblExtOsm) lblExtOsm.textContent = `${extOsmolarity.toFixed(2)} M`;
  });

  presetHypo?.addEventListener("click", () => {
    extOsmolarity = 0.02;
    if (sliderExtOsm) sliderExtOsm.value = 0.02;
    if (lblExtOsm) lblExtOsm.textContent = "0.02 M";
  });

  presetIso?.addEventListener("click", () => {
    extOsmolarity = 0.15;
    if (sliderExtOsm) sliderExtOsm.value = 0.15;
    if (lblExtOsm) lblExtOsm.textContent = "0.15 M";
  });

  presetHyper?.addEventListener("click", () => {
    extOsmolarity = 0.45;
    if (sliderExtOsm) sliderExtOsm.value = 0.45;
    if (lblExtOsm) lblExtOsm.textContent = "0.45 M";
  });

  equalizeBtn?.addEventListener("click", () => {
    soluteLeft = 0.20;
    soluteRight = 0.20;
    extOsmolarity = 0.15;
    if (sliderSoluteL) sliderSoluteL.value = 0.20;
    if (sliderSoluteR) sliderSoluteR.value = 0.20;
    if (sliderExtOsm) sliderExtOsm.value = 0.15;
    if (lblSoluteL) lblSoluteL.textContent = "0.20 M";
    if (lblSoluteR) lblSoluteR.textContent = "0.20 M";
    if (lblExtOsm) lblExtOsm.textContent = "0.15 M";
    currentDeltaH = 0;
    initParticles();
    SoundFX.playBeep();
  });

  logBtn?.addEventListener("click", () => {
    logTrial();
    SoundFX.playClick();
  });

  // Dual View Mode Switcher
  viewSim?.addEventListener("click", () => {
    viewSim.classList.add("active");
    viewPhoto.classList.remove("active");
    viewSim.style.background = "";
    viewPhoto.style.background = "transparent";
    if (photoOverlay) photoOverlay.style.display = "none";
  });

  viewPhoto?.addEventListener("click", () => {
    viewPhoto.classList.add("active");
    viewSim.classList.remove("active");
    viewPhoto.style.background = "";
    viewSim.style.background = "transparent";
    if (photoOverlay) photoOverlay.style.display = "block";
  });

  exportBtn?.addEventListener("click", () => {
    if (trialLogs.length === 0) logTrial();
    const tempC = (TEMP_K - 273.15).toFixed(1);
    exportLabDataCsv({
      title: "Cell Membrane Osmosis & Tonicity Water Potential Telemetry",
      labId: "osmosis",
      parameters: {
        "Assay Mode": activeMode === "utube" ? "U-Tube Dialysis Membrane" : `Cell Tonicity (${cellType.toUpperCase()})`,
        "Solute Tested": selectedSolute.toUpperCase(),
        "Temperature": `${tempC} °C`,
        "Gas Constant R": "0.08314 L·bar/(mol·K)"
      },
      headers: [
        "Mode / Model",
        "Solute",
        "Left/Internal Conc (M)",
        "Right/External Conc (M)",
        "Left/Internal Ψs (bar)",
        "Right/External Ψs (bar)",
        "Height Diff Δh (cm)",
        "Osmotic Equilibrium Status"
      ],
      dataRows: trialLogs.map(row => [
        row.mode,
        row.solute,
        row.cL,
        row.cR,
        row.psiL,
        row.psiR,
        row.dh,
        row.status
      ])
    });
  });

  // Standardized Hotkey: 'e' or 'E' triggers CSV telemetry export
  const handleKeyDown = (e) => {
    if ((e.key === "e" || e.key === "E") && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      exportBtn?.click();
    }
  };
  window.addEventListener("keydown", handleKeyDown);

  // Mount Assessment Checkpoint
  mountLabCheckpoint("osmosis-checkpoint-mount", "bio-osmosis");

  // Initial draw and run
  initParticles();
  animId = requestAnimationFrame(loop);

  return () => {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("resize", setupHiDPICanvas);
  };
}

