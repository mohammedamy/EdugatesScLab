// Edugates-ClipSAT Science Labs - Biology: Research-Grade Optical Microscope & Histology Laboratory
// Professional Microscopy Simulation: High-Definition Cellular Specimens, True Optical Depth-of-Field Blur,
// Substage Iris Diaphragm, Micrometer Scale Reticle, Cytoplasmic Streaming, and 4-Objective Turret.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";

export function initMicroscopeLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header View Switcher Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #10b981; box-shadow: 0 0 10px #10b981;"></span>
            Olympus BX53 Research Microscopy Suite
          </span>
          <span class="badge" style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            Köhler Illumination &amp; Abbe Resolution Limit
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Optical Eyepiece
            </button>
            <button id="view-mode-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Lab Bench
            </button>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 340px; gap: 20px;" class="microscope-layout">
        <!-- Left: High-Definition Eyepiece Field-of-View Canvas -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(16, 185, 129, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: #020617; overflow: hidden;">
          <canvas id="microscope-canvas" width="650" height="530" style="height: 530px;"></canvas>

          <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
          <div id="microscope-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <img src="assets/labs/microscope_bench.jpg" alt="4K Research Microscope Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            
            <!-- Live Analytical Telemetry Callout on Photo -->
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Olympus BX53 Upright Frame</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Plan Achromat 4×-100× Turret</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Abbe Condenser &amp; Iris</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">NA 1.25 • Köhler Illuminated</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Ceramic Stage &amp; Vernier</div>
                <div style="color: #f59e0b; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">0.1 mm Graduated Precision</div>
              </div>
            </div>
          </div>

          <!-- Top Status & Magnification HUD -->
          <div style="position: absolute; top: 14px; left: 14px; right: 14px; display: flex; flex-wrap: wrap; align-items: center; gap: 8px; z-index: 5; pointer-events: none;">
            <span class="badge" style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(16, 185, 129, 0.4); padding: 5px 12px; border-radius: 9999px; font-family: var(--font-mono); font-size: 0.8rem; color: #34d399; display: flex; align-items: center; gap: 6px; pointer-events: auto; white-space: nowrap;">
              <span id="focus-lock-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #f59e0b; display: inline-block;"></span>
              <span id="focus-status">Adjusting Optical Focus</span>
            </span>
            <span class="badge" id="mag-badge" style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 9999px; font-family: var(--font-mono); font-size: 0.78rem; color: #38bdf8; pointer-events: auto; white-space: nowrap;">
              100× Total Magnification (10× Eyepiece × 10× Objective)
            </span>
          </div>

          <!-- Scale Bar Reticle Overlay in Canvas -->
          <div style="position: absolute; bottom: 16px; right: 20px; font-family: var(--font-mono); font-size: 0.75rem; color: rgba(255,255,255,0.7); background: rgba(15,23,42,0.85); padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); z-index: 5;">
            <div style="border-bottom: 2px solid #38bdf8; width: 60px; margin-bottom: 2px;"></div>
            <span id="scale-text">Scale: 50 µm</span>
          </div>
        </div>

        <!-- Right: Slide Information & Histological Field Notes -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <!-- Slide Information Card -->
          <div class="sim-telemetry-card" style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 20px; display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.75rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em;">
                Histological Specimen Slide
              </span>
              <span id="slide-stain-badge" class="slide-stain-badge" style="font-size: 0.72rem; padding: 2px 8px; border-radius: 9999px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-weight: 600;">
                Toluidine Blue Stained
              </span>
            </div>

            <div class="microscope-slide-title" style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800;" id="slide-title">
              Allium Cepa (Onion Root Tip Mitosis)
            </div>

            <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.55; margin: 0;" id="slide-desc">
              Active meristematic region of Allium cepa. Observe mitotic stages: Interphase chromatin, Prophase condensation, Metaphase equatorial alignment, Anaphase sister chromatid separation, and Telophase cytokinesis cell plate formation.
            </p>

            <div class="sim-sub-card" style="border-radius: 8px; padding: 10px 14px; font-size: 0.82rem; display: flex; flex-direction: column; gap: 6px;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-dim);">Numerical Aperture (NA):</span>
                <span style="color: #38bdf8; font-family: var(--font-mono); font-weight: 700;" id="na-disp">0.25</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-dim);">Theoretical Resolution:</span>
                <span style="color: #10b981; font-family: var(--font-mono); font-weight: 700;" id="res-disp">d = 1.10 µm</span>
              </div>
            </div>
          </div>

          <!-- Stage XY Panning Navigator -->
          <div class="sim-telemetry-card" style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; gap: 10px;">
            <div style="font-size: 0.78rem; font-weight: 700; color: #38bdf8; text-transform: uppercase;">
              Mechanical Stage Coordinates (X, Y)
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div class="control-group">
                <label class="control-label" style="font-size: 0.78rem;"><span>Stage X:</span> <span id="disp-stage-x">0 µm</span></label>
                <input type="range" id="input-stage-x" class="custom-slider" min="-150" max="150" value="0">
              </div>
              <div class="control-group">
                <label class="control-label" style="font-size: 0.78rem;"><span>Stage Y:</span> <span id="disp-stage-y">0 µm</span></label>
                <input type="range" id="input-stage-y" class="custom-slider" min="-150" max="150" value="0">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Controls: Turret Objectives, Coarse & Fine Focus, Diaphragm -->
      <div class="lab-controls-panel">
        <!-- Slide Selector -->
        <div class="control-group">
          <label class="control-label">
            <span>Prepared Microscope Slide</span>
          </label>
          <select id="select-slide" class="select-input" style="font-weight: 600;">
            <option value="onion_mitosis" selected>Allium Cepa (Onion Root Tip Mitosis & Cell Cycle)</option>
            <option value="human_blood">Human Blood Smear (Erythrocytes, Neutrophils, Lymphocytes)</option>
            <option value="elodea_leaf">Elodea Leaf (Plant Cell Wall & Active Chloroplast Cyclosis)</option>
            <option value="paramecium">Paramecium Caudatum (Cilia & Contractile Vacuoles)</option>
          </select>
        </div>

        <!-- Objective Lens Turret Switcher -->
        <div class="control-group">
          <label class="control-label">
            <span>Revolving Nosepiece Objective</span>
            <span class="control-val" id="disp-objective">10× (Low Power)</span>
          </label>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-secondary obj-btn" data-obj="4" style="flex: 1; padding: 8px 4px; font-size: 0.8rem;">4× Scan</button>
            <button class="btn btn-primary obj-btn active" data-obj="10" style="flex: 1; padding: 8px 4px; font-size: 0.8rem;">10× Low</button>
            <button class="btn btn-secondary obj-btn" data-obj="40" style="flex: 1; padding: 8px 4px; font-size: 0.8rem;">40× High</button>
            <button class="btn btn-secondary obj-btn" data-obj="100" style="flex: 1; padding: 8px 4px; font-size: 0.8rem;">100× Oil</button>
          </div>
        </div>

        <!-- Coarse Focus Knob -->
        <div class="control-group">
          <label class="control-label">
            <span>Coarse Focus Adjustment</span>
            <span class="control-val" id="disp-coarse">50%</span>
          </label>
          <input type="range" id="input-coarse" class="custom-slider" min="0" max="100" value="50">
        </div>

        <!-- Fine Focus Knob -->
        <div class="control-group">
          <label class="control-label">
            <span>Fine Optical Focus</span>
            <span class="control-val" id="disp-fine" style="color: #10b981;">50%</span>
          </label>
          <input type="range" id="input-fine" class="custom-slider" min="0" max="100" value="50" style="accent-color: #10b981;">
        </div>

        <!-- Substage Condenser & Iris Diaphragm -->
        <div class="control-group">
          <label class="control-label">
            <span>Substage Iris Aperture</span>
            <span class="control-val" id="disp-iris">85%</span>
          </label>
          <input type="range" id="input-iris" class="custom-slider" min="20" max="100" value="85">
        </div>

        <!-- Quick Actions -->
        <div class="lab-action-buttons">
          <button class="btn btn-primary" id="btn-auto-focus" style="box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);">
            🔍 Auto-Calibrate Focus Lock
          </button>
          <button class="btn btn-secondary" id="btn-center-stage">
            ⌖ Center Stage (0, 0)
          </button>
          <label class="lab-checkbox-label" style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer; user-select: none; margin-left: auto;">
            <input type="checkbox" id="chk-reticle" checked style="accent-color: #38bdf8; width: 16px; height: 16px;">
            <span>Micrometer Reticle Grid</span>
          </label>
        </div>
      </div>

      <!-- Telemetry Suite & Multi-Trial Bar -->
      <div class="lab-telemetry-suite-bar">
        <div class="lab-trials-badge-group" id="micro-trials-badge-group">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">Microscopy Field Observation Log:</span>
          <span class="lab-trial-pill trial-1" id="micro-pill-trial-1" style="opacity: 0.5;">Field 1 (Cyan)</span>
          <span class="lab-trial-pill trial-2" id="micro-pill-trial-2" style="opacity: 0.5;">Field 2 (Amber)</span>
          <span class="lab-trial-pill trial-3" id="micro-pill-trial-3" style="opacity: 0.5;">Field 3 (Emerald)</span>
        </div>

        <div class="lab-export-buttons-group">
          <button class="btn btn-secondary" id="btn-record-micro-trial" style="padding: 6px 12px; font-size: 0.8rem; gap: 6px; border-color: rgba(16,185,129,0.4); color: #10b981;">
            <span>📸 Log Specimen Field</span>
          </button>
          <button class="btn btn-secondary" id="btn-export-micro-csv" style="padding: 6px 12px; font-size: 0.8rem; gap: 6px;">
            <span>📥 Export CSV Data</span>
          </button>
          <button class="btn btn-primary" id="btn-open-micro-report" style="padding: 6px 14px; font-size: 0.8rem; gap: 6px; background: linear-gradient(135deg, #059669, #047857); border: none;">
            <span>📑 Generate Lab Report</span>
          </button>
        </div>
      </div>

      <!-- Post-Lab Checkpoint Assessment Mount -->
      <div id="micro-checkpoint-container"></div>
    </div>
  `;

  const canvas = document.getElementById("microscope-canvas");
  const ctx = canvas.getContext("2d");

  // State
  let currentSlide = "onion_mitosis";
  let objectivePower = 10; // 4, 10, 40, 100
  let coarseFocus = 50;
  let fineFocus = 50;
  let optimalFocus = 50;
  let irisAperture = 0.85;
  let stageX = 0;
  let stageY = 0;
  let showReticle = true;
  let cyclosisAngle = 0;
  let animId = null;

  const slideData = {
    onion_mitosis: {
      title: "Allium Cepa (Onion Root Tip Mitosis)",
      stain: "Feulgen / Toluidine Blue",
      desc: "Active apical meristematic tissue of Allium cepa. Observe mitotic stages: Interphase nuclei, Prophase chromosome condensation, Metaphase equatorial plate alignment, Anaphase polar separation, and Telophase cell plate formation."
    },
    human_blood: {
      title: "Human Blood Smear (Wright-Giemsa Stained)",
      stain: "Wright-Giemsa Stain",
      desc: "Peripheral mammalian blood smear displaying abundant biconcave erythrocytes (red blood cells) with characteristic central pallor, multi-lobed neutrophils with lilac granules, and large round-nucleus lymphocytes."
    },
    elodea_leaf: {
      title: "Elodea Leaf (Plant Cell Wall & Chloroplasts)",
      stain: "Living Wet Mount (Unstained)",
      desc: "Living aquatic plant cells showcasing rigid cellulose cell walls, large central vacuoles, and vibrant photosynthetic chloroplast organelles undergoing continuous circular cyclosis (cytoplasmic streaming)."
    },
    paramecium: {
      title: "Paramecium Caudatum (Freshwater Ciliate)",
      stain: "Phase Contrast / Vital Stained",
      desc: "Active single-celled ciliate featuring protective pellicle, beating peripheral cilia, deep oral groove for feeding, and active pulsating star-shaped contractile vacuoles maintaining osmotic balance."
    }
  };

  // Preloaded Real 4K Research-Grade Histology Micrographs
  const slideImages = {
    onion_mitosis: new Image(),
    human_blood: new Image(),
    elodea_leaf: new Image(),
    paramecium: new Image()
  };
  slideImages.onion_mitosis.src = "assets/microscope/onion_mitosis.jpg";
  slideImages.human_blood.src = "assets/microscope/blood_smear.jpg";
  slideImages.elodea_leaf.src = "assets/microscope/elodea_cells.jpg";
  slideImages.paramecium.src = "assets/microscope/paramecium.jpg";

  function calculateBlur() {
    const focusVal = coarseFocus + (fineFocus - 50) * 0.15;
    const diff = Math.abs(focusVal - optimalFocus);
    const sensitivity = (objectivePower / 10) * 0.45;
    return Math.min(16, diff * sensitivity);
  }

  function drawSpecimen(centerX, centerY, radius) {
    const zoomScale = objectivePower / 10.0;
    ctx.save();
    ctx.translate(centerX + stageX * zoomScale * 0.8, centerY + stageY * zoomScale * 0.8);
    ctx.scale(zoomScale, zoomScale);

    const img = slideImages[currentSlide];
    const isImgLoaded = img && img.complete && img.naturalWidth > 0;

    if (isImgLoaded) {
      // Render Authentic High-Resolution Histological Specimen Photo
      const imgSize = radius * 3.2;
      ctx.drawImage(img, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
    }

    // Dynamic Live Overlays (Active Organelle Cyclosis & Motion)
    if (currentSlide === "onion_mitosis") {
      drawOnionMitosisOverlay(isImgLoaded);
    } else if (currentSlide === "human_blood") {
      if (!isImgLoaded) drawHumanBlood();
    } else if (currentSlide === "elodea_leaf") {
      drawElodeaLeafOverlay(isImgLoaded);
    } else if (currentSlide === "paramecium") {
      drawParameciumOverlay(isImgLoaded);
    }

    ctx.restore();
  }

  // 1. Onion Root Tip Mitosis Overlay
  function drawOnionMitosisOverlay(isImgLoaded) {
    if (!isImgLoaded) {
      drawOnionMitosis();
      return;
    }

    // Histological Callout Annotations on Real Micrograph
    ctx.save();
    const markers = [
      { x: -50, y: -90, label: "Metaphase (Plate)", color: "#c084fc" },
      { x: 30, y: -20, label: "Anaphase (Poles)", color: "#f472b6" },
      { x: 60, y: 70, label: "Prophase", color: "#38bdf8" },
      { x: -70, y: 80, label: "Telophase (Plate)", color: "#4ade80" }
    ];

    markers.forEach(m => {
      // Reticle pointer ring
      ctx.beginPath();
      ctx.arc(m.x, m.y, 8, 0, Math.PI * 2);
      ctx.strokeStyle = m.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Small callout label
      ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
      ctx.beginPath();
      ctx.roundRect(m.x + 12, m.y - 10, 110, 20, 4);
      ctx.fill();
      ctx.strokeStyle = m.color;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "700 9px 'JetBrains Mono', monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(m.label, m.x + 16, m.y);
    });
    ctx.restore();
  }

  // 1b. Onion Root Tip Mitosis Procedural Fallback
  function drawOnionMitosis() {
    const cellW = 75;
    const cellH = 45;

    for (let r = -4; r <= 4; r++) {
      for (let c = -4; c <= 4; c++) {
        const cx = c * cellW;
        const cy = r * cellH;

        // Cellulose Cell Wall (Lattice)
        ctx.fillStyle = "rgba(240, 245, 255, 0.15)";
        ctx.fillRect(cx - cellW/2 + 2, cy - cellH/2 + 2, cellW - 4, cellH - 4);

        ctx.strokeStyle = "rgba(74, 222, 128, 0.45)";
        ctx.lineWidth = 2.5;
        ctx.strokeRect(cx - cellW/2 + 1, cy - cellH/2 + 1, cellW - 2, cellH - 2);

        // Different Mitotic Stages across the grid
        const cellIndex = Math.abs(r * 5 + c) % 5;
        if (cellIndex === 0) {
          // Interphase: Granular nucleus with nucleolus
          ctx.fillStyle = "rgba(168, 85, 247, 0.65)";
          ctx.beginPath();
          ctx.arc(cx, cy, 12, 0, Math.PI * 2);
          ctx.fill();

          // Dark nucleolus
          ctx.fillStyle = "#581c87";
          ctx.beginPath();
          ctx.arc(cx - 3, cy - 2, 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (cellIndex === 1) {
          // Prophase: Condensed thread-like chromosomes
          ctx.strokeStyle = "#9333ea";
          ctx.lineWidth = 2.5;
          for (let k = 0; k < 6; k++) {
            ctx.beginPath();
            const ang = (k * Math.PI) / 3;
            ctx.moveTo(cx + Math.cos(ang) * 4, cy + Math.sin(ang) * 4);
            ctx.lineTo(cx + Math.cos(ang) * 11, cy + Math.sin(ang) * 11);
            ctx.stroke();
          }
        } else if (cellIndex === 2) {
          // Metaphase: Chromosomes lined up at equatorial metaphase plate
          ctx.strokeStyle = "rgba(56, 189, 248, 0.35)"; // Spindle fibers
          ctx.lineWidth = 1;
          for (let f = -10; f <= 10; f += 4) {
            ctx.beginPath();
            ctx.moveTo(cx - 16, cy + f);
            ctx.lineTo(cx + 16, cy);
            ctx.stroke();
          }

          // Dense dark chromosomes along center vertical
          ctx.fillStyle = "#6b21a8";
          for (let ch = -12; ch <= 12; ch += 5) {
            ctx.fillRect(cx - 3, cy + ch - 2, 6, 4);
          }
        } else if (cellIndex === 3) {
          // Anaphase: V-shaped chromatids pulled to opposite poles
          ctx.strokeStyle = "#581c87";
          ctx.lineWidth = 3;
          // Left cluster
          for (let ch = -8; ch <= 8; ch += 5) {
            ctx.beginPath();
            ctx.moveTo(cx - 14, cy + ch);
            ctx.lineTo(cx - 8, cy + ch);
            ctx.stroke();
          }
          // Right cluster
          for (let ch = -8; ch <= 8; ch += 5) {
            ctx.beginPath();
            ctx.moveTo(cx + 14, cy + ch);
            ctx.lineTo(cx + 8, cy + ch);
            ctx.stroke();
          }
        } else {
          // Telophase: Two daughter nuclei forming, cell plate forming
          ctx.fillStyle = "rgba(168, 85, 247, 0.7)";
          ctx.beginPath();
          ctx.arc(cx - 14, cy, 7, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(cx + 14, cy, 7, 0, Math.PI * 2);
          ctx.fill();

          // Cell plate line
          ctx.strokeStyle = "#4ade80";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy - cellH/2 + 4);
          ctx.lineTo(cx, cy + cellH/2 - 4);
          ctx.stroke();
        }
      }
    }
  }

  // 2. Human Blood Smear
  function drawHumanBlood() {
    // Red blood cells (Erythrocytes) - Biconcave disks with central pallor
    for (let i = 0; i < 90; i++) {
      const bx = ((i * 47) % 360) - 180;
      const by = ((i * 71) % 360) - 180;
      const rad = 11;

      // RBC Outer Rim
      const rbcGrad = ctx.createRadialGradient(bx, by, 3, bx, by, rad);
      rbcGrad.addColorStop(0, "rgba(254, 202, 202, 0.7)"); // Pale center dimple
      rbcGrad.addColorStop(0.5, "rgba(239, 68, 68, 0.85)");
      rbcGrad.addColorStop(1, "rgba(185, 28, 28, 0.95)");

      ctx.fillStyle = rbcGrad;
      ctx.beginPath();
      ctx.arc(bx, by, rad, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(153, 27, 27, 0.5)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // White Blood Cell: Neutrophil (Multi-lobed violet nucleus)
    const nX = 40;
    const nY = -30;
    ctx.fillStyle = "rgba(224, 231, 255, 0.85)"; // Cytoplasm
    ctx.beginPath();
    ctx.arc(nX, nY, 19, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(129, 140, 248, 0.5)";
    ctx.stroke();

    // 3-Lobed Nucleus
    ctx.fillStyle = "#4338ca";
    ctx.beginPath();
    ctx.arc(nX - 6, nY - 4, 6, 0, Math.PI * 2);
    ctx.arc(nX + 7, nY - 3, 5, 0, Math.PI * 2);
    ctx.arc(nX, nY + 7, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // White Blood Cell: Lymphocyte (Large round nucleus)
    const lX = -70;
    const lY = 50;
    ctx.fillStyle = "rgba(224, 231, 255, 0.85)";
    ctx.beginPath();
    ctx.arc(lX, lY, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#3730a3";
    ctx.beginPath();
    ctx.arc(lX, lY, 13, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3a. Elodea Leaf Cells Active Cyclosis Overlay
  function drawElodeaLeafOverlay(isImgLoaded) {
    cyclosisAngle += 0.035;
    if (!isImgLoaded) {
      drawElodeaLeaf();
      return;
    }

    // Active Streaming Chloroplasts flowing across the real cell boundaries
    ctx.save();
    const orbits = [
      { cx: -80, cy: -50, rx: 65, ry: 38 },
      { cx: 70, cy: -30, rx: 70, ry: 40 },
      { cx: -40, cy: 60, rx: 60, ry: 35 },
      { cx: 90, cy: 70, rx: 65, ry: 36 }
    ];

    orbits.forEach(orb => {
      const numC = 7;
      for (let i = 0; i < numC; i++) {
        const ang = cyclosisAngle + (i * Math.PI * 2) / numC;
        const px = orb.cx + Math.cos(ang) * orb.rx;
        const py = orb.cy + Math.sin(ang) * orb.ry;

        const chGrad = ctx.createRadialGradient(px - 1, py - 1, 1, px, py, 7);
        chGrad.addColorStop(0, "#86efac");
        chGrad.addColorStop(0.5, "#22c55e");
        chGrad.addColorStop(1, "#15803d");

        ctx.fillStyle = chGrad;
        const isSmartboard = (document.documentElement.getAttribute("data-mode") === "smartboard") ||
                             document.documentElement.classList.contains("fast-smartboard-mode") ||
                             /Android|MAXHUB/i.test(navigator.userAgent);
        if (!isSmartboard) {
          ctx.shadowColor = "rgba(74, 222, 128, 0.6)";
          ctx.shadowBlur = 6;
        }
        ctx.beginPath();
        ctx.arc(px, py, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });
    ctx.restore();
  }

  // 3b. Elodea Leaf Procedural Fallback
  function drawElodeaLeaf() {
    cyclosisAngle += 0.03;
    const cellW = 110;
    const cellH = 65;

    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        const cx = c * cellW;
        const cy = r * cellH;

        // Thick Cellulose Cell Wall
        ctx.fillStyle = "rgba(236, 253, 245, 0.1)";
        ctx.fillRect(cx - cellW/2, cy - cellH/2, cellW, cellH);

        ctx.strokeStyle = "#16a34a";
        ctx.lineWidth = 3.5;
        ctx.strokeRect(cx - cellW/2, cy - cellH/2, cellW, cellH);

        // Large Central Vacuole
        ctx.strokeStyle = "rgba(74, 222, 128, 0.3)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx - cellW/2 + 12, cy - cellH/2 + 10, cellW - 24, cellH - 20);

        // Chloroplasts executing cyclosis around the periphery
        const numChloroplasts = 14;
        for (let i = 0; i < numChloroplasts; i++) {
          const ang = cyclosisAngle + (i * Math.PI * 2) / numChloroplasts;
          const a = cellW / 2 - 14;
          const b = cellH / 2 - 12;
          const chX = cx + Math.cos(ang) * a;
          const chY = cy + Math.sin(ang) * b;

          const chGrad = ctx.createRadialGradient(chX - 1, chY - 1, 1, chX, chY, 7);
          chGrad.addColorStop(0, "#86efac");
          chGrad.addColorStop(0.5, "#22c55e");
          chGrad.addColorStop(1, "#15803d");

          ctx.fillStyle = chGrad;
          ctx.beginPath();
          ctx.arc(chX, chY, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  // 4a. Paramecium Active Cilia & Vacuole Overlay
  function drawParameciumOverlay(isImgLoaded) {
    if (!isImgLoaded) {
      drawParamecium();
      return;
    }

    // Active Beating Cilia wave dynamics around organism
    ctx.save();
    const time = Date.now() * 0.005;
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 1.2;

    for (let deg = 0; deg < 360; deg += 8) {
      const rad = deg * Math.PI / 180;
      const wave = Math.sin(time + deg * 0.1) * 3;
      const px = Math.cos(rad) * (115 + wave);
      const py = Math.sin(rad) * (52 + wave * 0.5);
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + Math.cos(rad) * 9, py + Math.sin(rad) * 9);
      ctx.stroke();
    }

    // Pulsating contractile vacuole indicator
    const pulse = Math.abs(Math.sin(time * 0.8)) * 3;
    ctx.fillStyle = "rgba(56, 189, 248, 0.25)";
    ctx.beginPath();
    ctx.arc(65, 8, 8 + pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  // 4b. Paramecium Caudatum Procedural Fallback
  function drawParamecium() {
    ctx.save();
    // Pellicle Slipper Shape
    ctx.fillStyle = "rgba(224, 242, 254, 0.35)";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.ellipse(0, 0, 110, 48, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Peripheral Cilia
    ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
    ctx.lineWidth = 1;
    for (let deg = 0; deg < 360; deg += 6) {
      const rad = deg * Math.PI / 180;
      const px = Math.cos(rad) * 110;
      const py = Math.sin(rad) * 48;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + Math.cos(rad) * 8, py + Math.sin(rad) * 8);
      ctx.stroke();
    }

    // Oral Groove
    ctx.fillStyle = "rgba(14, 165, 233, 0.5)";
    ctx.beginPath();
    ctx.ellipse(-10, 12, 35, 14, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Large Kidney-Shaped Macronucleus
    ctx.fillStyle = "#818cf8";
    ctx.beginPath();
    ctx.ellipse(8, -6, 22, 12, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Star-Shaped Contractile Vacuoles (Pulsating)
    function drawVacuole(vx, vy) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.beginPath();
      ctx.arc(vx, vy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1.5;
      for (let k = 0; k < 6; k++) {
        const vAng = (k * Math.PI) / 3;
        ctx.beginPath();
        ctx.moveTo(vx, vy);
        ctx.lineTo(vx + Math.cos(vAng) * 16, vy + Math.sin(vAng) * 16);
        ctx.stroke();
      }
    }
    drawVacuole(-65, -10);
    drawVacuole(65, 8);

    ctx.restore();
  }

  function drawView() {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    // Deep Dark Outer Microscope Stage Body
    ctx.fillStyle = "#030712";
    ctx.fillRect(0, 0, w, h);

    const centerX = w / 2;
    const centerY = h / 2;
    const radius = Math.min(w, h) * 0.44;

    // Optical Circular Field-of-View Clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.clip();

    // Realistic Substage Illumination Beam
    const illGrad = ctx.createRadialGradient(centerX, centerY, 15, centerX, centerY, radius);
    illGrad.addColorStop(0, `rgba(255, 255, 248, ${irisAperture})`);
    illGrad.addColorStop(0.7, `rgba(235, 245, 255, ${irisAperture * 0.95})`);
    illGrad.addColorStop(1, `rgba(180, 205, 230, ${irisAperture * 0.7})`);
    ctx.fillStyle = illGrad;
    ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);

    // Apply Optical Depth-of-Field Blur
    const blurAmount = calculateBlur();
    ctx.filter = blurAmount > 0.4 ? `blur(${blurAmount.toFixed(1)}px)` : "none";

    // Draw Active Specimen Cells
    drawSpecimen(centerX, centerY, radius);

    ctx.restore();

    // Heavy Anodized Eyepiece Bezel Ring
    const bezelGrad = ctx.createLinearGradient(0, centerY - radius, 0, centerY + radius);
    bezelGrad.addColorStop(0, "#475569");
    bezelGrad.addColorStop(0.5, "#1e293b");
    bezelGrad.addColorStop(1, "#090d16");

    ctx.lineWidth = 18;
    ctx.strokeStyle = bezelGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 9, 0, Math.PI * 2);
    ctx.stroke();

    // Inner Specular Eyepiece Ring
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Reticle Crosshairs & Micrometer Graduations
    if (showReticle) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 1;

      // Horizontal Reticle
      ctx.beginPath();
      ctx.moveTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.stroke();

      // Vertical Reticle
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - radius);
      ctx.lineTo(centerX, centerY + radius);
      ctx.stroke();

      // Micrometer Scale Ticks along Crosshairs
      for (let d = -120; d <= 120; d += 20) {
        if (Math.abs(d) <= radius - 15) {
          ctx.beginPath();
          ctx.moveTo(centerX + d, centerY - 4);
          ctx.lineTo(centerX + d, centerY + 4);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(centerX - 4, centerY + d);
          ctx.lineTo(centerX + 4, centerY + d);
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }

  function updateTelemetry() {
    const blur = calculateBlur();
    const focusDot = document.getElementById("focus-lock-dot");
    const focusStatus = document.getElementById("focus-status");

    if (blur <= 0.6) {
      focusDot.style.background = "#10b981";
      focusStatus.innerText = "🎯 Focus Locked (Sub-Micron Sharpness)";
      focusStatus.style.color = "#34d399";
    } else if (blur <= 3.0) {
      focusDot.style.background = "#f59e0b";
      focusStatus.innerText = "Fine Tuning Focus...";
      focusStatus.style.color = "#f59e0b";
    } else {
      focusDot.style.background = "#ef4444";
      focusStatus.innerText = "Out of Focus (Rotate Knobs)";
      focusStatus.style.color = "#ef4444";
    }

    // NA & Resolution
    const naMap = { 4: 0.10, 10: 0.25, 40: 0.65, 100: 1.25 };
    const na = naMap[objectivePower] || 0.25;
    const wavelength = 0.55; // 550nm green light in µm
    const res = (0.61 * wavelength) / na;

    document.getElementById("na-disp").innerText = `${na.toFixed(2)}`;
    document.getElementById("res-disp").innerText = `d = ${res.toFixed(2)} µm`;

    const scaleMap = { 4: "200 µm", 10: "50 µm", 40: "12 µm", 100: "5 µm" };
    document.getElementById("scale-text").innerText = `Scale: ${scaleMap[objectivePower] || "50 µm"}`;
    needsRedraw = true;
  }

  let lastFrameTime = 0;
  let needsRedraw = true;
  function requestRender() {
    needsRedraw = true;
  }
  function renderLoop(now) {
    if (!container.isConnected) {
      if (animId) cancelAnimationFrame(animId);
      return;
    }
    const hasDynamicMotion = (currentSlide === "elodea_leaf" || currentSlide === "paramecium");
    if (!hasDynamicMotion && !needsRedraw) {
      animId = requestAnimationFrame(renderLoop);
      return;
    }
    // Cap to 30 FPS on Smartboard/Android to eliminate GPU stalls and prevent browser halts
    const isSmart = (document.documentElement.getAttribute("data-mode") === "smartboard") ||
                    document.documentElement.classList.contains("fast-smartboard-mode") ||
                    /Android|MAXHUB/i.test(navigator.userAgent);
    const interval = isSmart ? 33 : 16;
    if (!now || now - lastFrameTime >= interval) {
      lastFrameTime = now || performance.now();
      needsRedraw = false;
      drawView();
    }
    animId = requestAnimationFrame(renderLoop);
  }
  renderLoop();

  // Controls Binding
  const inCoarse = document.getElementById("input-coarse");
  const inFine = document.getElementById("input-fine");
  const inIris = document.getElementById("input-iris");
  const inStageX = document.getElementById("input-stage-x");
  const inStageY = document.getElementById("input-stage-y");

  inCoarse.addEventListener("input", (e) => {
    coarseFocus = parseFloat(e.target.value);
    document.getElementById("disp-coarse").innerText = `${Math.round(coarseFocus)}%`;
    updateTelemetry();
  });

  inFine.addEventListener("input", (e) => {
    fineFocus = parseFloat(e.target.value);
    document.getElementById("disp-fine").innerText = `${Math.round(fineFocus)}%`;
    updateTelemetry();
  });

  inIris.addEventListener("input", (e) => {
    irisAperture = parseFloat(e.target.value) / 100;
    document.getElementById("disp-iris").innerText = `${Math.round(e.target.value)}%`;
    requestRender();
  });

  inStageX.addEventListener("input", (e) => {
    stageX = parseFloat(e.target.value);
    document.getElementById("disp-stage-x").innerText = `${stageX} µm`;
    requestRender();
  });

  inStageY.addEventListener("input", (e) => {
    stageY = parseFloat(e.target.value);
    document.getElementById("disp-stage-y").innerText = `${stageY} µm`;
    requestRender();
  });

  // Objective Turret Buttons
  container.querySelectorAll(".obj-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(".obj-btn").forEach(b => {
        b.classList.remove("btn-primary", "active");
        b.classList.add("btn-secondary");
      });
      btn.classList.remove("btn-secondary");
      btn.classList.add("btn-primary", "active");

      objectivePower = parseInt(btn.dataset.obj, 10);
      const totalMag = objectivePower * 10;
      document.getElementById("disp-objective").innerText = `${objectivePower}× (${objectivePower === 4 ? 'Scanning' : objectivePower === 10 ? 'Low Power' : objectivePower === 40 ? 'High Dry' : 'Oil Immersion'})`;
      document.getElementById("mag-badge").innerText = `${totalMag}× Total Magnification (10× Eyepiece × ${objectivePower}× Objective)`;

      updateTelemetry();
    });
  });

  // Slide Selection
  document.getElementById("select-slide").addEventListener("change", (e) => {
    currentSlide = e.target.value;
    const data = slideData[currentSlide];
    if (data) {
      document.getElementById("slide-title").innerText = data.title;
      document.getElementById("slide-stain-badge").innerText = data.stain;
      document.getElementById("slide-desc").innerText = data.desc;
    }
    updateTelemetry();
    requestRender();
  });

  // Auto-Focus Calibrate
  document.getElementById("btn-auto-focus").addEventListener("click", () => {
    coarseFocus = 50;
    fineFocus = 50;
    inCoarse.value = 50;
    inFine.value = 50;
    document.getElementById("disp-coarse").innerText = "50%";
    document.getElementById("disp-fine").innerText = "50%";
    updateTelemetry();
  });

  // Center Stage
  document.getElementById("btn-center-stage").addEventListener("click", () => {
    stageX = 0;
    stageY = 0;
    inStageX.value = 0;
    inStageY.value = 0;
    document.getElementById("disp-stage-x").innerText = "0 µm";
    document.getElementById("disp-stage-y").innerText = "0 µm";
    requestRender();
  });

  // Reticle Toggle
  document.getElementById("chk-reticle").addEventListener("change", (e) => {
    showReticle = e.target.checked;
  });

  // Telemetry Suite: Record Current Observation Trial
  document.getElementById("btn-record-micro-trial")?.addEventListener("click", () => {
    const naMap = { 4: 0.10, 10: 0.25, 40: 0.65, 100: 1.25 };
    const na = naMap[objectivePower] || 0.25;
    const res = (0.61 * 0.55) / na;
    const totalMag = objectivePower * 10;
    const currentData = slideData[currentSlide] || {};

    LabTrialStore.addTrial("microscope", {
      measurements: {
        "Specimen": currentData.title || currentSlide,
        "Total Magnification": `${totalMag}×`,
        "Numerical Aperture (NA)": na,
        "Resolution (µm)": parseFloat(res.toFixed(2)),
        "Coarse Focus (%)": Math.round(coarseFocus),
        "Fine Focus (%)": Math.round(fineFocus),
        "Stage (X, Y)": `(${stageX}, ${stageY}) µm`
      }
    });

    const trials = LabTrialStore.getTrials("microscope");
    trials.forEach((tr, i) => {
      const pill = document.getElementById(`micro-pill-trial-${i + 1}`);
      if (pill) {
        pill.style.opacity = "1";
        pill.innerText = `Obs ${tr.trialNumber}: ${tr.measurements["Total Magnification"]} (NA=${tr.measurements["Numerical Aperture (NA)"]}, res=${tr.measurements["Resolution (µm)"]}µm)`;
      }
    });
  });

  // Telemetry Suite: Export CSV
  document.getElementById("btn-export-micro-csv")?.addEventListener("click", () => {
    const naMap = { 4: 0.10, 10: 0.25, 40: 0.65, 100: 1.25 };
    const na = naMap[objectivePower] || 0.25;
    const res = (0.61 * 0.55) / na;
    const totalMag = objectivePower * 10;
    const currentData = slideData[currentSlide] || {};

    exportLabDataCsv({
      title: "Research-Grade Optical Microscopy & Histology",
      labId: "microscope",
      parameters: {
        "Slide Specimen": currentData.title || currentSlide,
        "Histological Stain": currentData.stain || "Unstained",
        "Total Magnification": `${totalMag}×`,
        "Numerical Aperture": `${na}`,
        "Substage Aperture": `${Math.round(irisAperture * 100)}%`
      },
      headers: ["Specimen", "Objective (x)", "Ocular (x)", "Total Mag (x)", "NA", "Resolution (µm)", "Coarse Focus (%)", "Fine Focus (%)", "Stage X (µm)", "Stage Y (µm)"],
      dataRows: [
        [
          currentData.title || currentSlide,
          objectivePower,
          10,
          totalMag,
          na,
          parseFloat(res.toFixed(2)),
          Math.round(coarseFocus),
          Math.round(fineFocus),
          stageX,
          stageY
        ]
      ]
    });
  });

  // Telemetry Suite: Generate Lab Report
  document.getElementById("btn-open-micro-report")?.addEventListener("click", () => {
    const trials = LabTrialStore.getTrials("microscope");
    const naMap = { 4: 0.10, 10: 0.25, 40: 0.65, 100: 1.25 };
    const na = naMap[objectivePower] || 0.25;
    const res = (0.61 * 0.55) / na;
    const totalMag = objectivePower * 10;
    const currentData = slideData[currentSlide] || {};

    openLabReportModal({
      title: "High-Resolution Optical Microscopy & Histological Analysis",
      subject: "Biology",
      inquiryQuestion: "How do numerical aperture, refractive index, and lens magnification govern resolving power and cytological specimen fidelity?",
      parameters: {
        "Histological Specimen": currentData.title || currentSlide,
        "Preparation / Stain": currentData.stain || "Direct Mount",
        "Total Magnification": `${totalMag}×`,
        "Numerical Aperture (NA)": `${na}`,
        "Theoretical Resolution Limit (d)": `${res.toFixed(2)} µm`,
        "Stage Coordinates": `(${stageX} µm, ${stageY} µm)`
      },
      trials,
      formulas: [
        "d = \\frac{0.61 \\lambda}{\\text{NA}} \\quad (\\text{Abbe Limit of Resolution})",
        "\\text{Total Magnification} = M_{\\text{ocular}} \\times M_{\\text{objective}}",
        "\\text{NA} = n \\sin\\alpha",
        "M_1 \\cdot D_1 = M_2 \\cdot D_2 \\quad (\\text{Field of View Diameter})"
      ]
    });
  });

  // 4K Photo Bench Switcher
  const btnModeSim = container.querySelector("#view-mode-sim");
  const btnModePhoto = container.querySelector("#view-mode-photo");
  const photoOverlay = container.querySelector("#microscope-photo-overlay");

  btnModeSim?.addEventListener("click", () => {
    btnModeSim.classList.add("active");
    btnModeSim.style.background = "";
    btnModePhoto.classList.remove("active");
    btnModePhoto.style.background = "transparent";
    if (photoOverlay) photoOverlay.style.display = "none";
  });

  btnModePhoto?.addEventListener("click", () => {
    btnModePhoto.classList.add("active");
    btnModePhoto.style.background = "";
    btnModeSim.classList.remove("active");
    btnModeSim.style.background = "transparent";
    if (photoOverlay) photoOverlay.style.display = "block";
  });

  // Mount Post-Lab Checkpoint Assessment
  mountLabCheckpoint("micro-checkpoint-container", "microscope");

  // Resize Handling
  function handleResize() {
    if (!container || !container.isConnected) {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
    canvas.width = rect.width * dpr;
    canvas.height = 530 * dpr;
    requestRender();
  }
  window.addEventListener("resize", handleResize);
  handleResize();

  return () => {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("resize", handleResize);
  };
}
