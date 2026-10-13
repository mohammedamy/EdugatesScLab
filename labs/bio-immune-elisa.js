// Edugates-ClipSAT Science Labs - Biology: ELISA Antigen-Antibody Immunoassay & Diagnostics Suite
// 60 FPS Precision Immunodiagnostics Simulation:
// 96-well microplate spectrophotometry at OD450 nm,
// 7-step analytical workflow (Coating → Blocking → Patient Serum → Wash → HRP Conjugate → TMB Substrate → Stop Acid),
// Standard calibration curve fitting, diagnostic cutoff threshold OD = Mean(Neg) + 3·SD,
// Patient antibody titer quantification (ng/mL) and clinical serodiagnosis.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initElisaLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return () => {};

  // ELISA Protocol Steps
  const PROTOCOL_STEPS = [
    { id: 1, name: "Antigen Coating", reagent: "Viral Capsid Antigen (2 µg/mL)", action: "Adsorb viral antigen proteins onto polystyrene microplate wells", color: "rgba(56, 189, 248, 0.15)" },
    { id: 2, name: "Blocking", reagent: "1% Bovine Serum Albumin (BSA)", action: "Block non-specific hydrophobic binding sites on plastic", color: "rgba(255, 255, 255, 0.1)" },
    { id: 3, name: "Patient Serum", reagent: "Diluted Serum & Standards (1:100)", action: "Primary antibody (anti-viral IgG) binds immobilized antigen", color: "rgba(245, 158, 11, 0.15)" },
    { id: 4, name: "PBST Wash", reagent: "Phosphate Buffered Saline + 0.05% Tween-20", action: "Wash 3× to eliminate all non-specifically bound antibodies", color: "rgba(56, 189, 248, 0.08)" },
    { id: 5, name: "Secondary HRP Conjugate", reagent: "Anti-Human IgG-HRP Enzyme", action: "Enzyme-linked secondary antibody binds human Fc domain", color: "rgba(168, 85, 247, 0.15)" },
    { id: 6, name: "TMB Substrate", reagent: "3,3',5,5'-Tetramethylbenzidine + H₂O₂", action: "Peroxidase catalyzes oxidation, producing vibrant blue diimine", color: "rgba(37, 99, 235, 0.85)" },
    { id: 7, name: "Stop Acid (1M H₂SO₄)", reagent: "1.0 M Sulfuric Acid Stop Solution", action: "Quenches HRP enzyme; converts blue to intense yellow for OD₄₅₀", color: "#facc15" }
  ];

  // 8 Wells in Active Diagnostic Column (Standards & Clinical Patients)
  const MICROPLATE_WELLS = [
    { id: "A1", role: "Reagent Blank", trueConc: 0.0, description: "Buffer only (Zero Ab)" },
    { id: "B1", role: "Calibrator Std 1", trueConc: 10.0, description: "10 ng/mL Reference IgG" },
    { id: "C1", role: "Calibrator Std 2", trueConc: 25.0, description: "25 ng/mL Reference IgG" },
    { id: "D1", role: "Calibrator Std 3", trueConc: 50.0, description: "50 ng/mL Reference IgG" },
    { id: "E1", role: "Calibrator Std 4", trueConc: 100.0, description: "100 ng/mL Reference IgG" },
    { id: "F1", role: "Negative Control", trueConc: 2.1, description: "Healthy unexposed serum" },
    { id: "G1", role: "Patient A Serum", trueConc: 84.5, description: "Acute symptomatic individual" },
    { id: "H1", role: "Patient B Serum", trueConc: 4.2, description: "Convalescent / asymptomatic" }
  ];

  // State Variables
  let currentStepIndex = 0; // 0 to 6 (steps 1 to 7)
  let isPlateRead = false;
  let selectedWellIndex = 6; // Default Patient A
  let incubationMinutes = 30;
  let viewMode = "sim"; // "sim" or "photo"
  let animId = null;
  let timeTick = 0;

  // Optical Density OD450 Calculation using standard Michaelis-Menten / Hill 4PL sigmoidal model:
  // OD = OD_min + (OD_max - OD_min) / (1 + (Conc / EC50)^-Hill)
  function calculateWellOD(well) {
    if (currentStepIndex < 5) return 0.04; // Blank / pre-substrate
    const conc = well.trueConc;
    const maxOD = 2.45;
    const minOD = 0.052;
    const ec50 = 38.0;
    const hill = 1.25;

    // Substrate blue stage vs Stop yellow stage
    const baseOD = minOD + (maxOD - minOD) / (1 + Math.pow(Math.max(0.1, conc) / ec50, -hill));
    if (currentStepIndex === 5) {
      // TMB Blue intermediate (scaled)
      return baseOD * 0.75;
    }
    // Step 7: Quenched Stop Acid (Full OD450)
    return baseOD;
  }

  function getDiagnosticCutoff() {
    const negWell = MICROPLATE_WELLS[5]; // F1
    const negOD = calculateWellOD(negWell);
    const sd = 0.025;
    return negOD + 3 * sd; // Mean(Neg) + 3*SD
  }

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #38bdf8; box-shadow: 0 0 10px #38bdf8;"></span>
            ELISA Antigen-Antibody Immunoassay &amp; Diagnostics
          </span>
          <span class="badge" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            ${renderLatex("\\text{Spectrophotometry } \\lambda = 450\\text{ nm} \\quad \\bullet \\quad \\text{4PL Calibration}")}
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-elisa-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Immunoassay Plate
            </button>
            <button id="view-mode-elisa-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-elisa-next-step" style="padding: 5px 14px; font-size: 0.78rem;">
            ▶ Execute Next Step
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-elisa-read-plate" style="padding: 5px 12px; font-size: 0.78rem;">
            📊 Read Plate (OD₄₅₀)
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-elisa-export" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export CSV (E)
          </button>
        </div>
      </div>

      <!-- Main Layout Grid -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="elisa-layout">
        <!-- Canvas Viewport -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(56, 189, 248, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #082f49 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="elisa-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Real Laboratory Photograph Overlay -->
          <div id="elisa-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <picture>
              <source srcset="assets/labs/elisa_bench.webp" type="image/webp">
              <img src="assets/labs/elisa_bench.jpg" decoding="async" loading="lazy" alt="4K Research Microplate Spectrophotometer & ELISA Immunoassay Workbench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            </picture>
            
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Microplate Reader</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Monochromator λ = 450 nm</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Enzyme-Substrate System</div>
                <div style="color: #facc15; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">HRP Conjugate + TMB Chromogen</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Assay Sensitivity</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">LOD &lt; 0.5 ng/mL Specific IgG</div>
              </div>
            </div>
          </div>

          <!-- Top HUD -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">SELECTED CLINICAL WELL OD₄₅₀</div>
              <div id="hud-elisa-od" style="font-size: 1.12rem; font-weight: 800; color: #facc15; font-family: var(--font-mono);">
                Well G1: OD = 1.842 (Positive)
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">DIAGNOSTIC THRESHOLD CUTOFF</div>
              <div id="hud-elisa-cutoff" style="font-size: 1.12rem; font-weight: 800; color: #10b981; font-family: var(--font-mono);">
                Cutoff OD = 0.165
              </div>
            </div>
          </div>
        </div>

        <!-- Controls & Calibration Curve Analytics Side -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Workflow Pipeline Tracker -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div style="font-size: 0.75rem; font-weight: 700; color: #38bdf8; text-transform: uppercase;">7-Step ELISA Workflow Protocol</div>
              <span id="workflow-step-tag" class="badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-size: 0.68rem; padding: 2px 8px; border-radius: 6px;">
                Step 1 of 7
              </span>
            </div>

            <div id="elisa-protocol-card" style="background: #030712; border: 1px solid #1e293b; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
              <div id="step-name" style="font-weight: 700; color: #38bdf8; font-size: 0.88rem; margin-bottom: 4px;">1. Antigen Coating</div>
              <div id="step-reagent" style="font-size: 0.74rem; color: #fbbf24; font-family: var(--font-mono); margin-bottom: 6px;">Viral Capsid Antigen (2 µg/mL)</div>
              <div id="step-desc" style="font-size: 0.76rem; color: #94a3b8; line-height: 1.4;">Adsorb viral antigen proteins onto polystyrene microplate wells.</div>
            </div>

            <div style="display: flex; gap: 4px; overflow-x: auto; padding-bottom: 4px;">
              ${PROTOCOL_STEPS.map((s, idx) => `
                <div style="flex: 1; min-width: 32px; height: 6px; border-radius: 3px; background: ${idx === 0 ? '#38bdf8' : '#334155'}; transition: background 0.3s;" id="step-pip-${idx}"></div>
              `).join("")}
            </div>
          </div>

          <!-- Microplate Wells Table & Diagnostic Interpretations -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div style="font-size: 0.75rem; font-weight: 700; color: #10b981; text-transform: uppercase;">Microplate Readout &amp; Serodiagnosis</div>
              <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; font-size: 0.68rem; padding: 2px 8px; border-radius: 6px;">
                λ = 450 nm
              </span>
            </div>
            
            <div style="background: #030712; border: 1px solid #1e293b; border-radius: 8px; overflow: hidden;">
              <table style="width: 100%; border-collapse: collapse; font-size: 0.72rem; text-align: left;">
                <thead>
                  <tr style="background: rgba(15, 23, 42, 0.8); border-bottom: 1px solid #334155; color: #94a3b8;">
                    <th style="padding: 5px 8px;">Well</th>
                    <th style="padding: 5px 8px;">Role</th>
                    <th style="padding: 5px 6px;">OD₄₅₀</th>
                    <th style="padding: 5px 8px;">Calculated Titer</th>
                    <th style="padding: 5px 8px;">Clinical Result</th>
                  </tr>
                </thead>
                <tbody id="elisa-table-body">
                  <!-- Dynamically rendered -->
                </tbody>
              </table>
            </div>

            <div id="patient-diagnosis-summary" style="margin-top: 10px; font-size: 0.74rem; color: #94a3b8; line-height: 1.4; background: rgba(0,0,0,0.25); border-radius: 6px; padding: 8px 12px;">
              Patient A: Strong positive antibody titer (84.5 ng/mL &gt; Cutoff), indicating active viral seroconversion.
            </div>
          </div>

          <!-- Post-Lab Checkpoint Container -->
          <div id="elisa-checkpoint-container"></div>
        </div>
      </div>
    </div>
  `;

  // Attach Checkpoint
  mountLabCheckpoint("elisa-checkpoint-container", "elisa");

  // DOM Elements
  const canvas = document.getElementById("elisa-canvas");
  const ctx = canvas.getContext("2d");

  // HiDPI Canvas Scaling
  const logicalW = 580;
  const logicalH = 530;
  function setupHiDPICanvas() {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : Math.min(window.devicePixelRatio || 1, 2);
    if (canvas) {
      canvas.width = Math.round(logicalW * dpr);
      canvas.height = Math.round(logicalH * dpr);
    }
  }
  setupHiDPICanvas();
  window.addEventListener("resize", setupHiDPICanvas);

  const viewSimBtn = document.getElementById("view-mode-elisa-sim");
  const viewPhotoBtn = document.getElementById("view-mode-elisa-photo");
  const photoOverlay = document.getElementById("elisa-photo-overlay");

  const btnNextStep = document.getElementById("btn-elisa-next-step");
  const btnReadPlate = document.getElementById("btn-elisa-read-plate");
  const btnExport = document.getElementById("btn-elisa-export");

  const stepTag = document.getElementById("workflow-step-tag");
  const stepName = document.getElementById("step-name");
  const stepReagent = document.getElementById("step-reagent");
  const stepDesc = document.getElementById("step-desc");
  const tableBody = document.getElementById("elisa-table-body");
  const summaryBox = document.getElementById("patient-diagnosis-summary");

  const hudOd = document.getElementById("hud-elisa-od");
  const hudCutoff = document.getElementById("hud-elisa-cutoff");

  // Multichannel pipette animation state
  let pipetteY = 60;
  let targetPipetteY = 60;
  let isDispensing = false;

  function updateHUD() {
    const curStep = PROTOCOL_STEPS[currentStepIndex];
    stepTag.textContent = `Step ${curStep.id} of 7`;
    stepName.textContent = `${curStep.id}. ${curStep.name}`;
    stepReagent.textContent = curStep.reagent;
    stepDesc.textContent = curStep.action;

    // Highlight step progress indicators
    for (let i = 0; i < 7; i++) {
      const pip = document.getElementById(`step-pip-${i}`);
      if (pip) {
        pip.style.background = i <= currentStepIndex ? "#38bdf8" : "#334155";
      }
    }

    const cutoff = getDiagnosticCutoff();
    hudCutoff.textContent = `Cutoff OD = ${cutoff.toFixed(3)}`;

    const selWell = MICROPLATE_WELLS[selectedWellIndex];
    const selOD = calculateWellOD(selWell);
    let diag = "Non-Reactive";
    if (selOD > cutoff) diag = "Positive Reactive";

    hudOd.textContent = `${selWell.id} (${selWell.role}): OD = ${selOD.toFixed(3)} • ${diag}`;
    hudOd.style.color = selOD > cutoff ? "#facc15" : "#38bdf8";

    // Update Table
    tableBody.innerHTML = MICROPLATE_WELLS.map((w, idx) => {
      const od = calculateWellOD(w);
      const isSelected = idx === selectedWellIndex;
      let resText = "Negative";
      let badgeBg = "rgba(100, 116, 139, 0.2)";
      let badgeCol = "#94a3b8";

      if (w.role.includes("Calibrator")) {
        resText = "Standard";
        badgeBg = "rgba(56, 189, 248, 0.15)";
        badgeCol = "#38bdf8";
      } else if (w.role.includes("Blank")) {
        resText = "Baseline";
      } else if (od > cutoff) {
        resText = "POSITIVE";
        badgeBg = "rgba(245, 158, 11, 0.15)";
        badgeCol = "#fbbf24";
      }

      return `
        <tr style="border-bottom: 1px solid #1e293b; background: ${isSelected ? 'rgba(56, 189, 248, 0.1)' : 'transparent'}; cursor: pointer;" onclick="document.dispatchEvent(new CustomEvent('select-well', { detail: ${idx} }))">
          <td style="padding: 5px 8px; font-weight: 700; color: #f8fafc; font-family: var(--font-mono);">${w.id}</td>
          <td style="padding: 5px 8px; color: #94a3b8;">${w.role}</td>
          <td style="padding: 5px 6px; color: #facc15; font-family: var(--font-mono); font-weight: 700;">${od.toFixed(3)}</td>
          <td style="padding: 5px 8px; color: #38bdf8; font-family: var(--font-mono);">${w.trueConc.toFixed(1)} ng/mL</td>
          <td style="padding: 5px 8px;">
            <span style="background: ${badgeBg}; color: ${badgeCol}; padding: 2px 6px; border-radius: 4px; font-weight: 600; font-size: 0.66rem;">
              ${resText}
            </span>
          </td>
        </tr>
      `;
    }).join("");

    const ptA_OD = calculateWellOD(MICROPLATE_WELLS[6]);
    const ptB_OD = calculateWellOD(MICROPLATE_WELLS[7]);
    summaryBox.innerHTML = `
      <div><strong>Patient A (Well G1):</strong> OD ${ptA_OD.toFixed(3)} &gt; Cutoff (${cutoff.toFixed(3)}) ⟶ <span style="color: #fbbf24; font-weight: 700;">SEROPOSITIVE</span> (84.5 ng/mL specific IgG).</div>
      <div style="margin-top: 4px;"><strong>Patient B (Well H1):</strong> OD ${ptB_OD.toFixed(3)} &le; Cutoff (${cutoff.toFixed(3)}) ⟶ <span style="color: #38bdf8; font-weight: 700;">SERONEGATIVE</span> (4.2 ng/mL non-reactive).</div>
    `;
  }

  document.addEventListener("select-well", (e) => {
    selectedWellIndex = e.detail;
    SoundFX.click?.() || SoundFX.playClick?.();
    updateHUD();
  });

  // 60 FPS Canvas Render Loop
  function renderElisaCanvas() {
    if (!container || !container.isConnected) return;
    timeTick += 0.035;

    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : Math.min(window.devicePixelRatio || 1, 2);
    ctx.save();
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, logicalW, logicalH);

    pipetteY += (targetPipetteY - pipetteY) * 0.12;

    // Workbench Mat Background
    ctx.fillStyle = "#0c1322";
    ctx.fillRect(0, 0, logicalW, logicalH);

    // Bench Grid Lines
    ctx.strokeStyle = "rgba(56, 189, 248, 0.03)";
    ctx.lineWidth = 1;
    for (let gx = 30; gx < logicalW; gx += 40) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, logicalH);
      ctx.stroke();
    }
    for (let gy = 30; gy < logicalH; gy += 40) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(logicalW, gy);
      ctx.stroke();
    }

    // 1. Microplate Spectrophotometer Bay
    const plateX = logicalW * 0.5 - 195;
    const plateY = 210;
    const plateW = 390;
    const plateH = 270;

    // Reader Carrier Tray Shadow
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.shadowColor = "rgba(0,0,0,0.75)";
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.roundRect(plateX - 18, plateY - 18, plateW + 36, plateH + 36, 12);
    ctx.fill();
    ctx.restore();

    // Dark Aluminum Spectrophotometer Tray
    const trayGrad = ctx.createLinearGradient(plateX - 16, plateY - 16, plateX + plateW + 16, plateY + plateH + 16);
    trayGrad.addColorStop(0, "#1e293b");
    trayGrad.addColorStop(0.5, "#0f172a");
    trayGrad.addColorStop(1, "#020617");
    ctx.fillStyle = trayGrad;
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(plateX - 16, plateY - 16, plateW + 32, plateH + 32, 10);
    ctx.fill();
    ctx.stroke();

    // 96-Well Microplate (White Polystyrene ANSI/SLAS Base with Chamfered A1 Corner)
    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(plateX, plateY, plateW, plateH, 6);
    ctx.fill();
    ctx.stroke();

    // Chamfer notch at top left corner (A1 indexing marker)
    ctx.fillStyle = "#cbd5e1";
    ctx.beginPath();
    ctx.moveTo(plateX, plateY + 14);
    ctx.lineTo(plateX + 14, plateY);
    ctx.lineTo(plateX, plateY);
    ctx.closePath();
    ctx.fill();

    // 2. Render 8 Wells of Column 1 (A1 to H1) and Background Ghost Wells
    const cols = 12;
    const rows = 8;
    const wellSpacingX = plateW / (cols + 1);
    const wellSpacingY = plateH / (rows + 1);
    const wellRadius = 14;

    // Column Headers (1 to 12)
    ctx.fillStyle = "#64748b";
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    for (let c = 1; c <= cols; c++) {
      ctx.fillText(`${c}`, plateX + c * wellSpacingX, plateY + 12);
    }

    // Row Headers (A to H)
    const rowLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];
    for (let r = 0; r < rows; r++) {
      ctx.fillText(rowLabels[r], plateX + 11, plateY + (r + 1) * wellSpacingY + 3);
    }

    // Render Wells
    for (let r = 0; r < rows; r++) {
      for (let c = 1; c <= cols; c++) {
        const wx = plateX + c * wellSpacingX;
        const wy = plateY + (r + 1) * wellSpacingY;

        ctx.save();
        // Cylindrical well recessed cavity (concentric bevel shading)
        const cavityGrad = ctx.createRadialGradient(wx - 4, wy - 4, 3, wx, wy, wellRadius);
        cavityGrad.addColorStop(0, "#f1f5f9");
        cavityGrad.addColorStop(0.7, "#e2e8f0");
        cavityGrad.addColorStop(1, "#94a3b8");
        ctx.fillStyle = cavityGrad;
        ctx.beginPath();
        ctx.arc(wx, wy, wellRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#64748b";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Liquid inside well
        if (c === 1) {
          // Active Diagnostic Column 1 with reagents!
          const wellData = MICROPLATE_WELLS[r];
          const od = calculateWellOD(wellData);
          const isSelected = r === selectedWellIndex;

          ctx.beginPath();
          ctx.arc(wx, wy, wellRadius - 1.5, 0, Math.PI * 2);

          if (currentStepIndex === 5) {
            // TMB Blue Stage (scaled with OD)
            const blueIntensity = Math.min(1.0, od / 2.2);
            const blueGrad = ctx.createRadialGradient(wx - 3, wy - 3, 2, wx, wy, wellRadius - 2);
            blueGrad.addColorStop(0, `rgba(96, 165, 250, ${0.4 + blueIntensity * 0.6})`);
            blueGrad.addColorStop(1, `rgba(29, 78, 216, ${0.3 + blueIntensity * 0.7})`);
            ctx.fillStyle = blueGrad;
          } else if (currentStepIndex === 6) {
            // Stopped Yellow Stage (OD450)
            const yellowIntensity = Math.min(1.0, od / 2.2);
            const yelGrad = ctx.createRadialGradient(wx - 3, wy - 3, 2, wx, wy, wellRadius - 2);
            yelGrad.addColorStop(0, `rgba(254, 240, 138, ${0.4 + yellowIntensity * 0.6})`);
            yelGrad.addColorStop(0.7, `rgba(234, 179, 8, ${0.3 + yellowIntensity * 0.7})`);
            yelGrad.addColorStop(1, `rgba(161, 98, 7, ${0.2 + yellowIntensity * 0.8})`);
            ctx.fillStyle = yelGrad;
          } else {
            // Pre-substrate reagent buffer
            ctx.fillStyle = PROTOCOL_STEPS[currentStepIndex].color;
          }
          ctx.fill();

          // Liquid meniscus crescent highlight
          ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(wx, wy, wellRadius - 3, Math.PI * 1.1, Math.PI * 1.6);
          ctx.stroke();

          // Selection Halo
          if (isSelected) {
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(wx, wy, wellRadius + 2, 0, Math.PI * 2);
            ctx.stroke();
          }
        } else {
          // Empty inactive wells (clear optical polystyrene bottom)
          ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
          ctx.beginPath();
          ctx.arc(wx, wy, wellRadius - 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // 3. Multichannel 8-Tip Pipette Animation (Hovering above Column 1)
    const pipColX = plateX + 1 * wellSpacingX;
    ctx.save();
    
    // Pipette Body Bar
    const barW = 36;
    const barH = plateH - 24;
    const pipBarY = pipetteY;

    // Drop shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 6;

    const pipBodyGrad = ctx.createLinearGradient(pipColX - barW / 2, 0, pipColX + barW / 2, 0);
    pipBodyGrad.addColorStop(0, "#475569");
    pipBodyGrad.addColorStop(0.4, "#64748b");
    pipBodyGrad.addColorStop(1, "#334155");
    ctx.fillStyle = pipBodyGrad;
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(pipColX - barW / 2, pipBarY, barW, barH, 6);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Pipette Digital Volume Dial
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(pipColX - 12, pipBarY + 20, 24, 18);
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 8px monospace";
    ctx.textAlign = "center";
    ctx.fillText("100µL", pipColX, pipBarY + 32);

    // 8 Pipette Translucent Polypropylene Tips
    for (let r = 0; r < rows; r++) {
      const tipY = pipBarY + (r + 1) * wellSpacingY;
      ctx.fillStyle = "rgba(56, 189, 248, 0.75)";
      ctx.beginPath();
      ctx.moveTo(pipColX - 3.5, tipY - 4);
      ctx.lineTo(pipColX + 3.5, tipY - 4);
      ctx.lineTo(pipColX + 1.8, tipY + 14);
      ctx.lineTo(pipColX - 1.8, tipY + 14);
      ctx.closePath();
      ctx.fill();

      // Fluid droplet when dispensing
      if (isDispensing) {
        ctx.beginPath();
        ctx.arc(pipColX, tipY + 18, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "#38bdf8";
        ctx.fill();
      }
    }

    // Pipette Top Handle & Plunger Button
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(pipColX - 10, pipBarY - 28, 20, 28);
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.roundRect(pipColX - 14, pipBarY - 36, 28, 8, 3);
    ctx.fill();
    ctx.restore();

    // 4. Optical Monochromator 450nm Scan Beam (When Reading Plate)
    if (isPlateRead) {
      ctx.save();
      const beamX = plateX + 1 * wellSpacingX;
      
      // Vertical Collimated Laser Beam
      const beamGrad = ctx.createLinearGradient(beamX - 16, 0, beamX + 16, 0);
      beamGrad.addColorStop(0, "rgba(56, 189, 248, 0.05)");
      beamGrad.addColorStop(0.5, "rgba(56, 189, 248, 0.75)");
      beamGrad.addColorStop(1, "rgba(56, 189, 248, 0.05)");
      ctx.fillStyle = beamGrad;
      ctx.fillRect(beamX - 16, plateY - 10, 32, plateH + 20);

      // Core Monochromator Line
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(beamX, plateY - 10);
      ctx.lineTo(beamX, plateY + plateH + 10);
      ctx.stroke();

      // Optical Sensor Detector Read Head
      ctx.fillStyle = "#facc15";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.fillText("λ = 450 nm SCAN", beamX, plateY - 16);
      ctx.restore();
    }

    ctx.restore();

    animId = requestAnimationFrame(renderElisaCanvas);
  }

  // Event Listeners
  btnNextStep.addEventListener("click", () => {
    if (currentStepIndex < PROTOCOL_STEPS.length - 1) {
      currentStepIndex++;
      isDispensing = true;
      targetPipetteY = 190;
      SoundFX.droplet?.() || SoundFX.playClick?.();

      setTimeout(() => {
        isDispensing = false;
        targetPipetteY = 60;
        updateHUD();
      }, 350);
    } else {
      currentStepIndex = 0; // Reset workflow loop
      isPlateRead = false;
      SoundFX.click?.() || SoundFX.playClick?.();
      updateHUD();
    }
  });

  btnReadPlate.addEventListener("click", () => {
    isPlateRead = true;
    currentStepIndex = 6; // Stop acid final readout
    SoundFX.success?.() || SoundFX.playBeep?.();
    updateHUD();
    setTimeout(() => {
      isPlateRead = false;
    }, 1200);
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
    SoundFX.click?.() || SoundFX.playClick?.();
  });

  viewPhotoBtn.addEventListener("click", () => {
    viewMode = "photo";
    viewPhotoBtn.classList.add("active");
    viewSimBtn.classList.remove("active");
    viewPhotoBtn.style.background = "#0284c7";
    viewSimBtn.style.background = "transparent";
    photoOverlay.style.display = "block";
    canvas.style.display = "none";
    SoundFX.click?.() || SoundFX.playClick?.();
  });

  // Telemetry CSV Export
  btnExport.addEventListener("click", () => {
    const cutoff = getDiagnosticCutoff();

    exportLabDataCsv({
      title: "ELISA Immunoassay Spectrophotometry & Serodiagnosis",
      labId: "elisa",
      parameters: {
        "Assay Format": "Indirect Antigen-Down IgG ELISA",
        "Spectrophotometer Wavelength": "450 nm (OD450)",
        "Chromogen / Substrate": "TMB (3,3',5,5'-tetramethylbenzidine) + H2O2",
        "Stop Solution": "1.0 M Sulfuric Acid (H2SO4)",
        "Calculated Diagnostic Cutoff OD": cutoff.toFixed(4)
      },
      headers: ["Well ID", "Sample Role", "True IgG Conc (ng/mL)", "Optical Density (OD450)", "Clinical Interpretation"],
      dataRows: MICROPLATE_WELLS.map(w => {
        const od = calculateWellOD(w);
        let interp = "Negative";
        if (w.role.includes("Calibrator")) interp = "Calibration Standard";
        else if (w.role.includes("Blank")) interp = "Reagent Baseline";
        else if (od > cutoff) interp = "SEROPOSITIVE (Reactive)";
        return [
          w.id,
          w.role,
          w.trueConc.toFixed(2),
          od.toFixed(4),
          interp
        ];
      })
    });
    SoundFX.success?.() || SoundFX.playBeep?.();
  });

  // Standardized Hotkey: 'e' or 'E' triggers CSV telemetry export
  const handleKeyDown = (e) => {
    if ((e.key === "e" || e.key === "E") && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      btnExport.click();
    }
  };
  window.addEventListener("keydown", handleKeyDown);

  // Start Animation Loop
  updateHUD();
  animId = requestAnimationFrame(renderElisaCanvas);

  return function cleanupElisaLab() {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("resize", setupHiDPICanvas);
  };
}

export const initImmuneElisaLab = initElisaLab;

