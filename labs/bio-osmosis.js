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
          <button id="btn-export-csv" class="btn btn-secondary btn-sm" style="padding: 5px 12px; font-size: 0.8rem;">📥 Export CSV</button>
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
              <img src="assets/labs/osmosis_bench.jpg" alt="Cell Membrane Osmosis U-Tube 4K Bench" style="width: 100%; height: 100%; object-fit: cover;" />
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

          <!-- Checkpoint Quiz Mount -->
          <div id="osmosis-checkpoint-mount" style="margin-top: 6px;"></div>

        </div>
      </div>
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

    const uLeftX = 220;
    const uRightX = 420;
    const uWidth = 80;
    const uBottomY = 380;
    const uTopY = 80;
    const baseHeight = 220;

    // Smooth approach to targetDeltaH
    currentDeltaH += (targetDeltaH - currentDeltaH) * 0.05;

    const leftLevelY = baseHeight - currentDeltaH / 2;
    const rightLevelY = baseHeight + currentDeltaH / 2;

    // 1. Draw Liquid in U-Tube
    // Left arm liquid
    const leftLiqGrad = ctx.createLinearGradient(0, leftLevelY, 0, uBottomY);
    leftLiqGrad.addColorStop(0, "rgba(56, 189, 248, 0.4)");
    leftLiqGrad.addColorStop(1, "rgba(14, 165, 233, 0.65)");
    ctx.fillStyle = leftLiqGrad;
    ctx.fillRect(uLeftX, leftLevelY, uWidth, uBottomY - leftLevelY);

    // Right arm liquid
    const rightLiqGrad = ctx.createLinearGradient(0, rightLevelY, 0, uBottomY);
    rightLiqGrad.addColorStop(0, "rgba(244, 63, 94, 0.4)");
    rightLiqGrad.addColorStop(1, "rgba(225, 29, 72, 0.65)");
    ctx.fillStyle = rightLiqGrad;
    ctx.fillRect(uRightX, rightLevelY, uWidth, uBottomY - rightLevelY);

    // Horizontal bottom connecting channel liquid
    ctx.fillStyle = "rgba(14, 165, 233, 0.65)";
    ctx.fillRect(uLeftX, uBottomY - 50, uRightX - uLeftX + uWidth, 50);

    // 2. Glass Tube Walls
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    // Outer glass boundary
    ctx.moveTo(uLeftX, uTopY);
    ctx.lineTo(uLeftX, uBottomY);
    ctx.lineTo(uRightX + uWidth, uBottomY);
    ctx.lineTo(uRightX + uWidth, uTopY);
    // Inner glass boundary
    ctx.moveTo(uLeftX + uWidth, uTopY);
    ctx.lineTo(uLeftX + uWidth, uBottomY - 50);
    ctx.lineTo(uRightX, uBottomY - 50);
    ctx.lineTo(uRightX, uTopY);
    ctx.stroke();

    // 3. Semipermeable Dialysis Membrane Disc in Center Channel
    const memX = (uLeftX + uWidth + uRightX) / 2;
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 6;
    ctx.setLineDash([4, 4]); // dashed line representing pores
    ctx.beginPath();
    ctx.moveTo(memX, uBottomY - 50);
    ctx.lineTo(memX, uBottomY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.fillText("SEMIPERMEABLE", memX, uBottomY - 56);
    ctx.fillText("MEMBRANE", memX, uBottomY + 16);

    // 4. Liquid Meniscus Lines & Height Measurement Guideline
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(uLeftX + uWidth / 2, leftLevelY, uWidth / 2, 8, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "#f43f5e";
    ctx.beginPath();
    ctx.ellipse(uRightX + uWidth / 2, rightLevelY, uWidth / 2, 8, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Water level height difference guideline (Δh)
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(uLeftX + uWidth, leftLevelY);
    ctx.lineTo(uRightX, leftLevelY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(uRightX, rightLevelY);
    ctx.lineTo(uRightX + uWidth + 30, rightLevelY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Δh arrow indicator
    const dhPx = Math.abs(rightLevelY - leftLevelY);
    if (dhPx > 8) {
      const arrowX = uRightX + uWidth + 24;
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(arrowX, leftLevelY);
      ctx.lineTo(arrowX, rightLevelY);
      ctx.stroke();

      ctx.fillStyle = "#facc15";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`Δh = ${(currentDeltaH * 0.1).toFixed(1)} cm`, arrowX + 8, (leftLevelY + rightLevelY) / 2 + 4);
    }

    // 5. Render Animated Particles
    // Water molecules (cyan dots)
    ctx.fillStyle = "#38bdf8";
    waterParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      // Bounce within liquid boundary
      if (p.x < uLeftX + 6) p.x = uLeftX + 6, p.vx = -p.vx;
      if (p.x > uRightX + uWidth - 6) p.x = uRightX + uWidth - 6, p.vx = -p.vx;
      if (p.y > uBottomY - 6) p.y = uBottomY - 6, p.vy = -p.vy;
      if (p.y < (p.x < uLeftX + uWidth ? leftLevelY : rightLevelY)) {
        p.vy = Math.abs(p.vy);
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Solute molecules (large purple/pink discs blocked by membrane)
    ctx.fillStyle = "#e879f9";
    soluteParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      // Solute cannot cross membrane at memX!
      if (p.chamber === "left") {
        if (p.x > memX - 10) p.x = memX - 10, p.vx = -p.vx;
        if (p.x < uLeftX + 10) p.x = uLeftX + 10, p.vx = -p.vx;
        if (p.y < leftLevelY + 10) p.y = leftLevelY + 10, p.vy = Math.abs(p.vy);
        if (p.y > uBottomY - 10) p.y = uBottomY - 10, p.vy = -p.vy;
      } else {
        if (p.x < memX + 10) p.x = memX + 10, p.vx = -p.vx;
        if (p.x > uRightX + uWidth - 10) p.x = uRightX + uWidth - 10, p.vx = -p.vx;
        if (p.y < rightLevelY + 10) p.y = rightLevelY + 10, p.vy = Math.abs(p.vy);
        if (p.y > uBottomY - 10) p.y = uBottomY - 10, p.vy = -p.vy;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // 6. Right Side Thermodynamic HUD
    const hudX = 580;
    const hudY = 70;
    const hudW = 330;
    const hudH = 390;

    ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(hudX, hudY, hudW, hudH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("WATER POTENTIAL DYNAMICS (Ψ)", hudX + 18, hudY + 30);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px sans-serif";
    ctx.fillText("Ψ = Ψ_s (Solute) + Ψ_p (Pressure)", hudX + 18, hudY + 50);

    // Left Arm Breakdown
    ctx.fillStyle = "#c084fc";
    ctx.font = "bold 11px monospace";
    ctx.fillText(`LEFT ARM (C₁ = ${soluteLeft.toFixed(2)} M):`, hudX + 18, hudY + 85);
    ctx.fillStyle = "#f8fafc";
    ctx.font = "11px monospace";
    ctx.fillText(`Ψ_s = -iCRT = ${data.psi_s_left.toFixed(2)} bar`, hudX + 18, hudY + 105);

    // Right Arm Breakdown
    ctx.fillStyle = "#f43f5e";
    ctx.font = "bold 11px monospace";
    ctx.fillText(`RIGHT ARM (C₂ = ${soluteRight.toFixed(2)} M):`, hudX + 18, hudY + 140);
    ctx.fillStyle = "#f8fafc";
    ctx.font = "11px monospace";
    ctx.fillText(`Ψ_s = -iCRT = ${data.psi_s_right.toFixed(2)} bar`, hudX + 18, hudY + 160);

    // Net Potential Difference
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.beginPath();
    ctx.moveTo(hudX + 18, hudY + 185);
    ctx.lineTo(hudX + hudW - 18, hudY + 185);
    ctx.stroke();

    ctx.fillStyle = "#facc15";
    ctx.font = "bold 12px monospace";
    ctx.fillText(`ΔΨ = Ψ_right - Ψ_left = ${data.deltaPsi_s.toFixed(2)} bar`, hudX + 18, hudY + 210);

    ctx.fillStyle = "#10b981";
    ctx.font = "11px sans-serif";
    const netFlowDir = data.deltaPsi_s < 0 ? "LEFT ➔ RIGHT (Right rises)" : (data.deltaPsi_s > 0 ? "RIGHT ➔ LEFT (Left rises)" : "EQUILIBRIUM (Δh = 0)");
    ctx.fillText(`Osmotic Driving Force: ${netFlowDir}`, hudX + 18, hudY + 235);

    // Hydrostatic Balancing Equation
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(`Hydrostatic Head: ΔP = ρ·g·Δh`, hudX + 18, hudY + 270);
    ctx.fillText(`At equilibrium, ΔP exactly balances ΔΠ.`, hudX + 18, hudY + 290);
  }

  function drawCellTonicity(data) {
    if (!ctx) return;

    const cellX = 300;
    const cellY = 250;

    // 1. Petri Dish / Microscope Stage Ring
    ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
    ctx.lineWidth = 4;
    ctx.fillStyle = "rgba(8, 20, 36, 0.7)";
    ctx.beginPath();
    ctx.arc(cellX, cellY, 180, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Extracellular fluid tint based on osmolarity
    const fluidAlpha = Math.min(0.45, 0.1 + extOsmolarity * 0.6);
    ctx.fillStyle = `rgba(168, 85, 247, ${fluidAlpha})`;
    ctx.beginPath();
    ctx.arc(cellX, cellY, 178, 0, Math.PI * 2);
    ctx.fill();

    // 2. Render Cell Specimen
    if (cellType === "rbc") {
      // Animal Erythrocyte (Red Blood Cell)
      if (extOsmolarity < 0.10) {
        // Hypotonic Lysis (Ghost Cell)
        ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(cellX, cellY, 110, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ruptured hemoglobin leakage
        ctx.fillStyle = "rgba(239, 68, 68, 0.2)";
        for (let i = 0; i < 16; i++) {
          const ang = (i / 16) * Math.PI * 2;
          const r = 110 + Math.random() * 30;
          ctx.beginPath();
          ctx.arc(cellX + Math.cos(ang) * r, cellY + Math.sin(ang) * r, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = "#ef4444";
        ctx.font = "bold 13px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("HEMOLYSIS (CELL LYSIS)", cellX, cellY);
        ctx.font = "10px sans-serif";
        ctx.fillText("Plasma membrane ruptured under extreme osmotic influx", cellX, cellY + 20);

      } else if (extOsmolarity > 0.22) {
        // Hypertonic Crenation (Spiculated / Shrivelled)
        ctx.fillStyle = "#dc2626";
        ctx.strokeStyle = "#991b1b";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        // Star-like notched boundary
        const spikes = 14;
        for (let s = 0; s < spikes; s++) {
          const a = (s / spikes) * Math.PI * 2;
          const rOuter = 58;
          const rInner = 40;
          ctx.lineTo(cellX + Math.cos(a) * rOuter, cellY + Math.sin(a) * rOuter);
          const aMid = a + Math.PI / spikes;
          ctx.lineTo(cellX + Math.cos(aMid) * rInner, cellY + Math.sin(aMid) * rInner);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("CRENATED RBC", cellX, cellY + 80);
      } else {
        // Isotonic (Normal Biconcave Disc)
        const rbcGrad = ctx.createRadialGradient(cellX, cellY, 15, cellX, cellY, 75);
        rbcGrad.addColorStop(0, "#fca5a5");
        rbcGrad.addColorStop(0.5, "#ef4444");
        rbcGrad.addColorStop(1, "#b91c1c");

        ctx.fillStyle = rbcGrad;
        ctx.strokeStyle = "#991b1b";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cellX, cellY, 75, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Central Biconcave indentation
        ctx.fillStyle = "rgba(185, 28, 28, 0.4)";
        ctx.beginPath();
        ctx.arc(cellX, cellY, 32, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("ISOTONIC RBC", cellX, cellY + 100);
      }

    } else {
      // Plant Cell (Elodea with Cellulose Cell Wall)
      const boxW = 200;
      const boxH = 140;

      // 1. Rigid Cellulose Cell Wall (Green rectangular perimeter)
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 7;
      ctx.strokeRect(cellX - boxW / 2, cellY - boxH / 2, boxW, boxH);

      // 2. Plasma membrane & Central Vacuole
      if (extOsmolarity < 0.12) {
        // Turgid: Membrane firmly pressed against cell wall
        ctx.fillStyle = "rgba(34, 197, 94, 0.35)";
        ctx.fillRect(cellX - boxW / 2 + 5, cellY - boxH / 2 + 5, boxW - 10, boxH - 10);

        // Huge Central Vacuole
        ctx.fillStyle = "rgba(56, 189, 248, 0.5)";
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(cellX - boxW / 2 + 18, cellY - boxH / 2 + 18, boxW - 36, boxH - 36, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("TURGID PLANT CELL", cellX, cellY);
        ctx.fillText("(High Turgor Pressure Ψ_p)", cellX, cellY + 16);

      } else if (extOsmolarity > 0.20) {
        // Plasmolysis: Protoplast shrivels away from wall!
        ctx.fillStyle = "rgba(100, 116, 139, 0.15)";
        ctx.fillRect(cellX - boxW / 2 + 5, cellY - boxH / 2 + 5, boxW - 10, boxH - 10);

        // Shrivelled protoplast inside
        const shrivelW = boxW * 0.55;
        const shrivelH = boxH * 0.55;
        ctx.fillStyle = "rgba(34, 197, 94, 0.6)";
        ctx.strokeStyle = "#15803d";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(cellX - shrivelW / 2, cellY - shrivelH / 2, shrivelW, shrivelH, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#facc15";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("PLASMOLYSIS", cellX, cellY - 6);
        ctx.font = "9px sans-serif";
        ctx.fillText("Plasma membrane detached from cell wall", cellX, cellY + 12);

      } else {
        // Isotonic (Flaccid)
        ctx.fillStyle = "rgba(34, 197, 94, 0.25)";
        ctx.fillRect(cellX - boxW / 2 + 5, cellY - boxH / 2 + 5, boxW - 10, boxH - 10);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("FLACCID PLANT CELL (Ψ_p = 0)", cellX, cellY);
      }
    }

    // 3. Right Side Cytology HUD
    const hudX = 580;
    const hudY = 70;
    const hudW = 330;
    const hudH = 390;

    ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(hudX, hudY, hudW, hudH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("CYTOLOGICAL TONICITY HUD", hudX + 18, hudY + 30);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px sans-serif";
    ctx.fillText(`Specimen: ${cellType === "rbc" ? "Human Erythrocyte" : "Elodea Epidermal Cell"}`, hudX + 18, hudY + 50);

    // Status Pill
    const pillColor = data.tonicityLabel === "Isotonic" ? "#10b981" : (data.tonicityLabel === "Hypotonic" ? "#38bdf8" : "#f43f5e");
    ctx.fillStyle = pillColor;
    ctx.font = "bold 14px monospace";
    ctx.fillText(`TONICITY: ${data.tonicityLabel.toUpperCase()}`, hudX + 18, hudY + 85);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "11px sans-serif";
    ctx.fillText(`External Solution: ${extOsmolarity.toFixed(2)} M`, hudX + 18, hudY + 115);
    ctx.fillText(`Intracellular Fluid: 0.15 M`, hudX + 18, hudY + 135);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.beginPath();
    ctx.moveTo(hudX + 18, hudY + 155);
    ctx.lineTo(hudX + hudW - 18, hudY + 155);
    ctx.stroke();

    // Water Potential Values
    ctx.fillStyle = "#c084fc";
    ctx.font = "bold 11px monospace";
    ctx.fillText(`Ψ_external = ${data.psi_ext.toFixed(2)} bar`, hudX + 18, hudY + 180);
    ctx.fillText(`Ψ_internal = ${data.psi_cell_internal.toFixed(2)} bar`, hudX + 18, hudY + 200);

    ctx.fillStyle = "#fbbf24";
    ctx.fillText(`Turgor Pressure Ψ_p = ${data.turgorPsi_p.toFixed(2)} bar`, hudX + 18, hudY + 225);

    // Physiological Outcome Summary
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "11px sans-serif";
    ctx.fillText("Physiological Response:", hudX + 18, hudY + 265);
    ctx.fillStyle = pillColor;
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(data.cellStatus, hudX + 18, hudY + 285);
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

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grid background
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      if (activeMode === "utube") {
        drawUtube(data);
      } else {
        drawCellTonicity(data);
      }

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
    exportLabDataCsv("Cell_Membrane_Osmosis_Tonicity", trialLogs);
  });

  // Mount Assessment Checkpoint
  mountLabCheckpoint("osmosis-checkpoint-mount", "bio-osmosis");

  // Initial draw and run
  initParticles();
  animId = requestAnimationFrame(loop);

  return () => {
    if (animId) cancelAnimationFrame(animId);
  };
}
