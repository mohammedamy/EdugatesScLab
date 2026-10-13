// Edugates-ClipSAT Science Labs - Biology: Cell Cycle & Mitosis Suite
// 60 FPS Precision Mitotic Cytogenetics & Histology Simulation:
// Cell Cycle Phases: Interphase (G₁, S, G₂), Prophase, Metaphase, Anaphase, Telophase & Cytokinesis,
// Spindle Microtubules, Kinetochore Alignment, Sister Chromatid Disjunction,
// Allium cepa (Onion Root Tip) Meristem Histological Cell-Counting Grid,
// Mitotic Index: MI = (Mitotic Cells / Total Cells) × 100%,
// Phase Duration Calculation: t_phase = (N_phase / N_total) × 1440 min (24-hr cycle),
// Spindle Poison Chemotherapy Treatment (Colchicine Metaphase Arrest).

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initMitosisLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return () => {};

  // Cell Cycle Configuration
  const PHASES = [
    { key: "interphase", name: "Interphase (G₁, S, G₂)", color: "#94a3b8", durationPct: 75 },
    { key: "prophase", name: "Prophase", color: "#f59e0b", durationPct: 12 },
    { key: "metaphase", name: "Metaphase", color: "#38bdf8", durationPct: 6 },
    { key: "anaphase", name: "Anaphase", color: "#f43f5e", durationPct: 4 },
    { key: "telophase", name: "Telophase & Cytokinesis", color: "#10b981", durationPct: 3 }
  ];

  // State Variables
  let activeTab = "animator"; // "animator" or "histology"
  let currentPhaseIdx = 0; // 0..4
  let phaseProgress = 0.0; // 0.0 to 1.0 within phase
  let simTime = 0.0;
  let isPlaying = true;
  let animSpeed = 1.0;
  let hasColchicine = false; // spindle poison stops cells at Metaphase!

  // Histology Grid (Allium cepa meristem sample: 48 interactive histological cells)
  const histologyCells = [];
  const TOTAL_CELLS = 48;

  function initHistologyCells() {
    histologyCells.length = 0;
    // Representative distribution of onion root tip meristem
    const phaseDist = [
      { phase: "interphase", count: hasColchicine ? 14 : 31 },
      { phase: "prophase", count: hasColchicine ? 4 : 7 },
      { phase: "metaphase", count: hasColchicine ? 28 : 5 }, // Colchicine blocks at metaphase!
      { phase: "anaphase", count: hasColchicine ? 1 : 3 },
      { phase: "telophase", count: hasColchicine ? 1 : 2 }
    ];

    let cellList = [];
    phaseDist.forEach(d => {
      for (let i = 0; i < d.count; i++) cellList.push(d.phase);
    });

    // Shuffle
    cellList = cellList.sort(() => Math.random() - 0.5);

    for (let i = 0; i < TOTAL_CELLS; i++) {
      histologyCells.push({
        id: i + 1,
        actualPhase: cellList[i] || "interphase",
        userClassified: null,
        col: i % 8,
        row: Math.floor(i / 8)
      });
    }
  }

  function calculateMitoticIndex() {
    let mitoticCount = 0;
    const phaseCounts = { interphase: 0, prophase: 0, metaphase: 0, anaphase: 0, telophase: 0 };

    histologyCells.forEach(c => {
      phaseCounts[c.actualPhase]++;
      if (c.actualPhase !== "interphase") mitoticCount++;
    });

    const mi = (mitoticCount / TOTAL_CELLS) * 100;
    // Phase minutes in a 24-hr (1440 min) cell cycle
    const phaseTimes = {
      interphase: Math.round((phaseCounts.interphase / TOTAL_CELLS) * 1440),
      prophase: Math.round((phaseCounts.prophase / TOTAL_CELLS) * 1440),
      metaphase: Math.round((phaseCounts.metaphase / TOTAL_CELLS) * 1440),
      anaphase: Math.round((phaseCounts.anaphase / TOTAL_CELLS) * 1440),
      telophase: Math.round((phaseCounts.telophase / TOTAL_CELLS) * 1440)
    };

    return { mitoticCount, mi, phaseCounts, phaseTimes };
  }

  // Telemetry Log Store
  const trialLogs = [];
  let animId = null;
  let lastTime = performance.now();

  container.innerHTML = `
    <div class="lab-container" style="max-width: 1400px; margin: 0 auto; padding: 12px 16px;">
      <!-- Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #10b981; box-shadow: 0 0 10px #10b981;"></span>
            Cell Cycle &amp; Mitosis Cytogenetics Workbench
          </span>
          <span class="badge" style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            ${renderLatex("\\text{MI} = \\frac{\\sum \\text{Mitotic Cells}}{N_{\\text{total}}} \\times 100\\% \\quad \\bullet \\quad t_{\\text{phase}} = \\frac{N_p}{N_t} \\times 1440\\text{ min}")}
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div class="btn-group" style="display: flex; border: 1px solid var(--border-color); border-radius: 6px; overflow: hidden;">
            <button id="btn-view-sim" class="btn btn-sm active" style="padding: 5px 12px; font-size: 0.8rem; border: none; border-radius: 0;">🔬 Mitosis Simulator</button>
            <button id="btn-view-photo" class="btn btn-sm" style="padding: 5px 12px; font-size: 0.8rem; border: none; border-radius: 0; background: transparent;">📸 4K Real Bench</button>
          </div>
          <button id="btn-export-csv" class="btn btn-secondary btn-sm" style="padding: 5px 12px; font-size: 0.8rem;">📥 Export CSV (E)</button>
        </div>
      </div>

      <!-- Main Layout -->
      <div style="display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 16px; align-items: start;">
        
        <!-- Left Column: Canvas Viewport & Cytogenetics Counts -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div id="viewport-wrapper" style="position: relative; width: 100%; height: 500px; background: #080d18; border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; box-shadow: inset 0 0 40px rgba(0,0,0,0.85);">
            
            <!-- Canvas -->
            <canvas id="mitosis-canvas" width="940" height="500" style="display: block; width: 100%; height: 100%;"></canvas>

            <!-- 4K Real Lab Bench Photo Overlay (Hidden by default) -->
            <div id="photo-overlay" style="display: none; position: absolute; inset: 0; background: #020617;">
              <picture>
              <source srcset="assets/labs/mitosis_bench.webp" type="image/webp">
              <img src="assets/labs/mitosis_bench.jpg" decoding="async" loading="lazy" alt="Cytogenetics Allium Cepa Microscope 4K Bench" style="width: 100%; height: 100%; object-fit: cover;" />
            </picture>
              <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(2,6,23,0.3) 0%, rgba(2,6,23,0.85) 100%); pointer-events: none;"></div>
              
              <!-- Bench Callout Badges -->
              <div style="position: absolute; top: 20px; left: 24px; background: rgba(15, 23, 42, 0.9); border: 1px solid #10b981; border-radius: 8px; padding: 12px 16px; backdrop-filter: blur(8px); max-width: 340px;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #10b981; letter-spacing: 0.05em; text-transform: uppercase;">Real Apparatus Specifications</div>
                <div style="font-size: 0.95rem; font-weight: 600; color: #f8fafc; margin-top: 4px;">Cytogenetics Compound Microscope &amp; Allium cepa Slide</div>
                <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 6px; line-height: 1.4;">
                  Feulgen/Acetocarmine stained onion root tip meristem with oil immersion 100× Plan-Apochromat objective lens.
                </div>
              </div>

              <!-- Live Bench Telemetry Overlay -->
              <div style="position: absolute; bottom: 20px; left: 24px; right: 24px; background: rgba(15, 23, 42, 0.88); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px 20px; backdrop-filter: blur(10px); display: flex; justify-content: space-around; flex-wrap: wrap; gap: 16px;">
                <div>
                  <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase;">Mitotic Index (MI)</div>
                  <div id="photo-mi" style="font-size: 1.15rem; font-weight: 700; color: #10b981; font-family: monospace;">35.4%</div>
                </div>
                <div>
                  <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase;">Active Mitotic Phase</div>
                  <div id="photo-phase" style="font-size: 1.15rem; font-weight: 700; color: #38bdf8; font-family: monospace;">Metaphase</div>
                </div>
                <div>
                  <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase;">Total Meristem Cells</div>
                  <div id="photo-cells-total" style="font-size: 1.15rem; font-weight: 700; color: #f8fafc; font-family: monospace;">48 Cells</div>
                </div>
                <div>
                  <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase;">Spindle Checkpoint</div>
                  <div id="photo-spindle" style="font-size: 1.15rem; font-weight: 700; color: #facc15; font-family: monospace;">Normal (Active)</div>
                </div>
              </div>
            </div>

            <!-- Mode Switcher Tabs inside Viewport -->
            <div style="position: absolute; top: 14px; left: 16px; display: flex; gap: 8px; z-index: 10;">
              <button id="btn-tab-anim" class="btn btn-sm active" style="font-size: 0.75rem; background: rgba(15, 23, 42, 0.88); border: 1px solid #10b981; color: #10b981; padding: 4px 10px; border-radius: 6px;">
                🧬 Mitosis Phase Animator
              </button>
              <button id="btn-tab-histo" class="btn btn-sm" style="font-size: 0.75rem; background: rgba(15, 23, 42, 0.88); border: 1px solid var(--border-color); color: #94a3b8; padding: 4px 10px; border-radius: 6px;">
                🔬 Onion Root Tip Histology Grid
              </button>
            </div>
          </div>

          <!-- Histological Phase Counts & Mitotic Index Table -->
          <div style="background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-size: 0.85rem; font-weight: 700; color: #f8fafc; text-transform: uppercase; letter-spacing: 0.05em;">
                📊 Cytogenetics Phase Distribution &amp; Duration Table
              </span>
              <button id="btn-log-counts" class="btn btn-sm" style="font-size: 0.75rem; background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #10b981; padding: 3px 10px;">
                ➕ Log Cell Count Trial
              </button>
            </div>
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; text-align: left; font-family: monospace;">
                <thead>
                  <tr style="border-bottom: 1px solid var(--border-color); color: #94a3b8;">
                    <th style="padding: 6px 8px;">Phase</th>
                    <th style="padding: 6px 8px;">Cell Count</th>
                    <th style="padding: 6px 8px;">Percentage (%)</th>
                    <th style="padding: 6px 8px;">Duration (min / 24h)</th>
                    <th style="padding: 6px 8px;">Cytological Distinctive Landmark</th>
                  </tr>
                </thead>
                <tbody id="telemetry-table-body">
                  <!-- Populated by JS -->
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right Column: Control Panel -->
        <div style="background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px; display: flex; flex-direction: column; gap: 18px;">
          
          <!-- Animation Playback Controls -->
          <div id="anim-controls">
            <div style="display: flex; gap: 8px; margin-bottom: 10px;">
              <button id="btn-play-pause" class="btn btn-primary btn-sm" style="flex: 1; padding: 8px 12px; font-weight: 600;">
                ⏸ Pause Cycle
              </button>
              <button id="btn-step-next" class="btn btn-secondary btn-sm" style="padding: 8px 12px;">
                ⏭ Next Phase
              </button>
            </div>

            <!-- Manual Phase Selector Pills -->
            <label style="font-size: 0.75rem; font-weight: 700; color: #cbd5e1; display: block; margin-bottom: 6px;">
              Jump to Mitotic Stage
            </label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              <button class="btn btn-secondary btn-sm phase-jump-btn" data-phase="0" style="font-size: 0.72rem; text-align: left;">⚪ Interphase</button>
              <button class="btn btn-secondary btn-sm phase-jump-btn" data-phase="1" style="font-size: 0.72rem; text-align: left;">🟡 Prophase</button>
              <button class="btn btn-secondary btn-sm phase-jump-btn" data-phase="2" style="font-size: 0.72rem; text-align: left;">🔵 Metaphase</button>
              <button class="btn btn-secondary btn-sm phase-jump-btn" data-phase="3" style="font-size: 0.72rem; text-align: left;">🔴 Anaphase</button>
              <button class="btn btn-secondary btn-sm phase-jump-btn" data-phase="4" style="grid-column: span 2; font-size: 0.72rem; text-align: left;">🟢 Telophase &amp; Cytokinesis</button>
            </div>
          </div>

          <!-- Speed Slider -->
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 600; color: #cbd5e1; margin-bottom: 4px;">
              <span>Cell Cycle Speed</span>
              <span id="lbl-speed" style="color: #10b981; font-weight: 700;">1.0×</span>
            </div>
            <input type="range" id="slider-speed" min="0.2" max="3.0" step="0.2" value="1.0" style="width: 100%; accent-color: #10b981;" />
          </div>

          <!-- Chemotherapy / Spindle Poison (Colchicine Treatment) -->
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 14px;">
            <div>
              <div style="font-size: 0.8rem; font-weight: 600; color: #f8fafc;">Colchicine Treatment</div>
              <div style="font-size: 0.72rem; color: #94a3b8;">Depolymerizes tubulin (Arrests in Metaphase)</div>
            </div>
            <label style="position: relative; display: inline-block; width: 40px; height: 22px;">
              <input type="checkbox" id="check-colchicine" style="opacity: 0; width: 0; height: 0;" />
              <span id="colchicine-toggle-span" style="position: absolute; cursor: pointer; inset: 0; background: #475569; border-radius: 22px; transition: 0.2s;"></span>
            </label>
          </div>

          <!-- Mitotic Index Summary Metric Card -->
          <div style="background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 8px; padding: 14px;">
            <div style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; font-weight: 700; letter-spacing: 0.05em;">Calculated Mitotic Index (MI)</div>
            <div id="metric-mi-val" style="font-size: 1.8rem; font-weight: 800; color: #10b981; font-family: monospace; margin: 4px 0;">35.4%</div>
            <div style="font-size: 0.75rem; color: #cbd5e1; line-height: 1.4;">
              Active mitotic proliferation in meristematic zone. High index indicates rapid root tip elongation.
            </div>
          </div>

          <!-- Checkpoint Quiz Mount -->
          <div id="mitosis-checkpoint-mount" style="margin-top: 6px;"></div>

        </div>
      </div>
    </div>
  `;

  // Selectors
  const canvas = document.getElementById("mitosis-canvas");
  const ctx = canvas?.getContext("2d");
  const viewSim = document.getElementById("btn-view-sim");
  const viewPhoto = document.getElementById("btn-view-photo");
  const photoOverlay = document.getElementById("photo-overlay");
  const exportBtn = document.getElementById("btn-export-csv");
  const logBtn = document.getElementById("btn-log-counts");

  const btnTabAnim = document.getElementById("btn-tab-anim");
  const btnTabHisto = document.getElementById("btn-tab-histo");
  const playBtn = document.getElementById("btn-play-pause");
  const stepNextBtn = document.getElementById("btn-step-next");
  const sliderSpeed = document.getElementById("slider-speed");
  const lblSpeed = document.getElementById("lbl-speed");
  const checkColchicine = document.getElementById("check-colchicine");
  const colchicineToggleSpan = document.getElementById("colchicine-toggle-span");

  const photoMi = document.getElementById("photo-mi");
  const photoPhase = document.getElementById("photo-phase");
  const photoSpindle = document.getElementById("photo-spindle");
  const metricMiVal = document.getElementById("metric-mi-val");
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

  function updateTable() {
    if (!tableBody) return;
    const { mitoticCount, mi, phaseCounts, phaseTimes } = calculateMitoticIndex();

    const descriptions = {
      interphase: "Relaxed diffuse chromatin; nucleolus visible; centrosome duplicated",
      prophase: "Chromosomes condense into sister chromatids; early bipolar spindle forms",
      metaphase: "Chromosomes aligned single-file at equatorial plate; kinetochores attached",
      anaphase: "Sister chromatids disjoin and migrate toward opposite spindle poles",
      telophase: "Daughter nuclei reform; chromosomes decondense; cytokinesis furrow"
    };

    tableBody.innerHTML = PHASES.map(p => {
      const count = phaseCounts[p.key] || 0;
      const pct = ((count / TOTAL_CELLS) * 100).toFixed(1);
      const mins = phaseTimes[p.key] || 0;
      return `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); color: #e2e8f0;">
          <td style="padding: 6px 8px; font-weight: 700; color: ${p.color};">${p.name}</td>
          <td style="padding: 6px 8px; font-family: monospace; font-size: 0.9rem;">${count}</td>
          <td style="padding: 6px 8px; font-family: monospace;">${pct}%</td>
          <td style="padding: 6px 8px; font-family: monospace; color: #fbbf24;">${mins} min</td>
          <td style="padding: 6px 8px; color: #94a3b8; font-size: 0.75rem;">${descriptions[p.key]}</td>
        </tr>
      `;
    }).join("") + `
      <tr style="border-top: 2px solid #10b981; font-weight: 700; color: #10b981;">
        <td style="padding: 8px;">TOTAL MITOTIC (P+M+A+T)</td>
        <td style="padding: 8px;">${mitoticCount} / ${TOTAL_CELLS}</td>
        <td style="padding: 8px;">MI = ${mi.toFixed(1)}%</td>
        <td style="padding: 8px;">${1440 - phaseTimes.interphase} min in mitosis</td>
        <td style="padding: 8px; color: #34d399;">Calculated Mitotic Index</td>
      </tr>
    `;

    if (metricMiVal) metricMiVal.textContent = `${mi.toFixed(1)}%`;
    if (photoMi) photoMi.textContent = `${mi.toFixed(1)}%`;
  }

  function drawCellAnimator() {
    if (!ctx) return;
    const curPhase = PHASES[currentPhaseIdx];

    const cx = 310;
    const cy = 250;
    const cellR = 160;

    // Microscope Field of View Circle with Dark Outer Shell
    ctx.fillStyle = "#030712";
    ctx.fillRect(30, 30, 540, 440);

    // Knurled Brass Microscope Bezel
    const brassGrad = ctx.createRadialGradient(cx, cy, cellR + 25, cx, cy, cellR + 45);
    brassGrad.addColorStop(0, "#475569");
    brassGrad.addColorStop(0.3, "#94a3b8");
    brassGrad.addColorStop(0.7, "#334155");
    brassGrad.addColorStop(1, "#0f172a");
    ctx.strokeStyle = brassGrad;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(cx, cy, cellR + 32, 0, Math.PI * 2);
    ctx.stroke();

    // Microscope Illumination Background
    const illumGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, cellR + 24);
    illumGrad.addColorStop(0, "#1e293b");
    illumGrad.addColorStop(0.7, "#0f172a");
    illumGrad.addColorStop(1, "#020617");
    ctx.fillStyle = illumGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, cellR + 24, 0, Math.PI * 2);
    ctx.fill();

    // Cytoplasm Glow Tint (Emerald/Cyan)
    const cytoGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, cellR);
    cytoGrad.addColorStop(0, "rgba(16, 185, 129, 0.22)");
    cytoGrad.addColorStop(0.8, "rgba(16, 185, 129, 0.12)");
    cytoGrad.addColorStop(1, "rgba(6, 78, 59, 0.28)");
    ctx.fillStyle = cytoGrad;

    // 1. Cell Membrane (Outer Circle or Cleavage Furrow)
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 4;

    if (currentPhaseIdx === 4) {
      // Telophase Cleavage Furrow (pinch in middle)
      const pinch = 25 + phaseProgress * 35;
      ctx.beginPath();
      ctx.moveTo(cx - 130, cy - 100);
      ctx.bezierCurveTo(cx - 50, cy - 100, cx - pinch, cy - 20, cx - pinch, cy);
      ctx.bezierCurveTo(cx - pinch, cy + 20, cx - 50, cy + 100, cx - 130, cy + 100);
      ctx.bezierCurveTo(cx - 200, cy + 90, cx - 200, cy - 90, cx - 130, cy - 100);
      ctx.moveTo(cx + 130, cy - 100);
      ctx.bezierCurveTo(cx + 50, cy - 100, cx + pinch, cy - 20, cx + pinch, cy);
      ctx.bezierCurveTo(cx + pinch, cy + 20, cx + 50, cy + 100, cx + 130, cy + 100);
      ctx.bezierCurveTo(cx + 200, cy + 90, cx + 200, cy - 90, cx + 130, cy - 100);
      ctx.fill();
      ctx.stroke();

      // Actin-myosin contractile ring dashed line
      ctx.strokeStyle = "#f43f5e";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, cy - 110);
      ctx.lineTo(cx, cy + 110);
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      ctx.beginPath();
      ctx.arc(cx, cy, cellR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Specular highlight arc on cell boundary
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, cellR - 4, Math.PI * 1.1, Math.PI * 1.6);
    ctx.stroke();

    // 2. Centrosomes / Aster Rays & Bipolar Spindle
    const leftCentX = cx - 115;
    const rightCentX = cx + 115;

    if (currentPhaseIdx >= 1 && currentPhaseIdx <= 3) {
      // Centrosomes (Bipolar MTOCs)
      [leftCentX, rightCentX].forEach(posX => {
        const centGrad = ctx.createRadialGradient(posX, cy, 2, posX, cy, 8);
        centGrad.addColorStop(0, "#fde68a");
        centGrad.addColorStop(0.6, "#f59e0b");
        centGrad.addColorStop(1, "#b45309");
        ctx.fillStyle = centGrad;
        ctx.beginPath();
        ctx.arc(posX, cy, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Astral Microtubules (Stars radiating away from poles)
        ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
        ctx.lineWidth = 1;
        for (let a = 0; a < 8; a++) {
          const ang = (a / 8) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(posX, cy);
          ctx.lineTo(posX + Math.cos(ang) * 18, cy + Math.sin(ang) * 18);
          ctx.stroke();
        }
      });

      // Spindle Microtubules
      if (hasColchicine && currentPhaseIdx === 2) {
        // Colchicine depolymerizes microtubules into fragmented soluble tubulin dimers!
        ctx.fillStyle = "rgba(245, 158, 11, 0.6)";
        for (let t = 0; t < 36; t++) {
          const tx = cx - 90 + ((t * 23) % 180);
          const ty = cy - 70 + ((t * 19) % 140);
          ctx.fillRect(tx, ty, 3, 3);
        }
      } else {
        // Healthy bipolar spindle fibers
        ctx.strokeStyle = "rgba(245, 158, 11, 0.45)";
        ctx.lineWidth = 1.5;
        for (let f = -5; f <= 5; f++) {
          ctx.beginPath();
          ctx.moveTo(leftCentX, cy);
          ctx.quadraticCurveTo(cx, cy + f * 26, rightCentX, cy);
          ctx.stroke();
        }
      }
    }

    // 3. Chromatin / Chromosome rendering based on Phase
    if (currentPhaseIdx === 0) {
      // Interphase: Intact nuclear membrane with diffuse granular chromatin
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(cx, cy, 85, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Nucleoplasm
      const nucGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 85);
      nucGrad.addColorStop(0, "rgba(56, 189, 248, 0.2)");
      nucGrad.addColorStop(1, "rgba(14, 165, 233, 0.05)");
      ctx.fillStyle = nucGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 85, 0, Math.PI * 2);
      ctx.fill();

      // Dense Nucleolus
      const nucCore = ctx.createRadialGradient(cx - 25, cy - 18, 3, cx - 25, cy - 18, 16);
      nucCore.addColorStop(0, "#7dd3fc");
      nucCore.addColorStop(1, "#0369a1");
      ctx.fillStyle = nucCore;
      ctx.beginPath();
      ctx.arc(cx - 25, cy - 18, 16, 0, Math.PI * 2);
      ctx.fill();

      // Diffuse granular chromatin threads with dynamic microscopic drift
      ctx.strokeStyle = "rgba(244, 63, 94, 0.75)";
      ctx.lineWidth = 2;
      for (let c = 0; c < 28; c++) {
        const ang = (c / 28) * Math.PI * 2 + simTime * 0.1;
        const r = 25 + (c % 6) * 9;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, 5, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("NUCLEOLUS", cx - 25, cy - 40);
      ctx.fillStyle = "#f43f5e";
      ctx.fillText("DIFFUSE CHROMATIN (DNA REPLICATED IN S-PHASE)", cx, cy + 60);

    } else if (currentPhaseIdx === 1) {
      // Prophase: Disintegrating nuclear membrane + condensed X-shaped chromosomes
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 10]);
      ctx.beginPath();
      ctx.arc(cx, cy, 85, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 4 Pairs of X-shaped Sister Chromatids
      const chromCoords = [
        { x: cx - 45, y: cy - 40, ang: 0.3 },
        { x: cx + 45, y: cy - 35, ang: -0.4 },
        { x: cx - 35, y: cy + 40, ang: -0.2 },
        { x: cx + 40, y: cy + 45, ang: 0.5 }
      ];

      chromCoords.forEach(pos => {
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(pos.ang);

        // Sister chromatid arms
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(-14, -14);
        ctx.lineTo(14, 14);
        ctx.moveTo(14, -14);
        ctx.lineTo(-14, 14);
        ctx.stroke();

        // Centromeric constriction
        ctx.fillStyle = "#facc15";
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("NUCLEAR ENVELOPE BREAKDOWN & CHROMOSOME CONDENSATION", cx, cy - 95);

    } else if (currentPhaseIdx === 2) {
      // Metaphase: Chromosomes lined up at equatorial metaphase plate
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, cy - 120);
      ctx.lineTo(cx, cy + 120);
      ctx.stroke();
      ctx.setLineDash([]);

      // Chromosomes aligned along vertical axis
      for (let k = -2; k <= 2; k++) {
        const yPos = cy + k * 38;
        
        // Sister chromatid arms (Cyan / Rose gradient)
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 5.5;
        ctx.beginPath();
        ctx.moveTo(cx - 12, yPos - 12);
        ctx.lineTo(cx + 12, yPos + 12);
        ctx.moveTo(cx + 12, yPos - 12);
        ctx.lineTo(cx - 12, yPos + 12);
        ctx.stroke();

        // Kinetochore plates (dual orientation)
        ctx.fillStyle = "#facc15";
        ctx.beginPath();
        ctx.arc(cx - 4, yPos, 3, 0, Math.PI * 2);
        ctx.arc(cx + 4, yPos, 3, 0, Math.PI * 2);
        ctx.fill();

        // Kinetochore microtubule tension tether
        if (!hasColchicine) {
          ctx.strokeStyle = "rgba(250, 204, 21, 0.6)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(leftCentX, cy);
          ctx.lineTo(cx - 4, yPos);
          ctx.moveTo(rightCentX, cy);
          ctx.lineTo(cx + 4, yPos);
          ctx.stroke();
        }
      }

      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("EQUATORIAL METAPHASE PLATE (CONGRESSION COMPLETE)", cx, cy - 125);

      if (hasColchicine) {
        ctx.fillStyle = "#ef4444";
        ctx.font = "bold 12px sans-serif";
        ctx.fillText("⚠️ SPINDLE ASSEMBLY CHECKPOINT (SAC) HALT", cx, cy + 130);
      }

    } else if (currentPhaseIdx === 3) {
      // Anaphase: V-shaped daughter chromosomes pulled apart
      const separation = 35 + phaseProgress * 55;

      for (let k = -2; k <= 2; k++) {
        const yPos = cy + k * 34;

        // Left migrating daughter chromosomes (V-shape pointing left <)
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(cx - separation + 14, yPos - 12);
        ctx.lineTo(cx - separation, yPos);
        ctx.lineTo(cx - separation + 14, yPos + 12);
        ctx.stroke();

        // Kinetochore apex lead
        ctx.fillStyle = "#facc15";
        ctx.beginPath();
        ctx.arc(cx - separation, yPos, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Right migrating daughter chromosomes (V-shape pointing right >)
        ctx.beginPath();
        ctx.moveTo(cx + separation - 14, yPos - 12);
        ctx.lineTo(cx + separation, yPos);
        ctx.lineTo(cx + separation - 14, yPos + 12);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx + separation, yPos, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Kinetochore pulling fibers
        ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(leftCentX, cy);
        ctx.lineTo(cx - separation, yPos);
        ctx.moveTo(rightCentX, cy);
        ctx.lineTo(cx + separation, yPos);
        ctx.stroke();
      }

      ctx.fillStyle = "#f43f5e";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("DISJUNCTION: SISTER CHROMATIDS PULLED TO OPPOSITE POLES", cx, cy - 125);

    } else if (currentPhaseIdx === 4) {
      // Telophase & Cytokinesis: Two new daughter nuclei reforming
      [-95, 95].forEach(dx => {
        // Reforming nuclear envelopes
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2.2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(cx + dx, cy, 48, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Internal decondensing chromatin loops
        ctx.strokeStyle = "rgba(244, 63, 94, 0.75)";
        ctx.lineWidth = 2;
        for (let c = 0; c < 12; c++) {
          const ang = (c / 12) * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(cx + dx + Math.cos(ang) * 18, cy + Math.sin(ang) * 18, 5, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Emerging nucleolus
        ctx.fillStyle = "#0284c7";
        ctx.beginPath();
        ctx.arc(cx + dx - 8, cy - 8, 8, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = "#10b981";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("DAUGHTER NUCLEI REFORM & CYTOKINESIS COMPLETES", cx, cy - 125);
    }

    // 4. Right Side Phase HUD
    const hudX = 590;
    const hudY = 50;
    const hudW = 320;
    const hudH = 410;

    ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
    ctx.strokeStyle = "rgba(16, 185, 129, 0.25)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(hudX, hudY, hudW, hudH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = curPhase.color;
    ctx.font = "bold 15px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(curPhase.name.toUpperCase(), hudX + 18, hudY + 28);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px sans-serif";
    ctx.fillText(`Stage ${currentPhaseIdx + 1} of 5 in Cell Cycle | ${curPhase.durationPct}% of typical cycle`, hudX + 18, hudY + 46);

    // Progress Bar within Phase
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.fillRect(hudX + 18, hudY + 58, hudW - 36, 8);
    ctx.fillStyle = curPhase.color;
    ctx.fillRect(hudX + 18, hudY + 58, (hudW - 36) * phaseProgress, 8);

    // Molecular Events Checklist
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("KEY CYTOLOGICAL EVENTS:", hudX + 18, hudY + 86);

    const eventList = {
      0: ["• DNA replication occurs in S-phase", "• Centrosomes duplicate into pair", "• Intact nuclear envelope & prominent nucleolus", "• High protein synthesis & cell growth"],
      1: ["• Chromatin condenses into X-shaped sister chromatids", "• Nuclear envelope & nucleolus break down", "• Bipolar mitotic spindle begins assembling", "• Centrosomes migrate toward opposite poles"],
      2: ["• Chromosomes align along equatorial metaphase plate", "• Kinetochores establish bi-orientation to poles", "• Spindle Assembly Checkpoint (SAC) validates tension", "• Cohesin rings maintain sister chromatid pairing"],
      3: ["• Separase enzyme cleaves cohesin protein complexes", "• Sister chromatids disjoin into daughter chromosomes", "• Kinetochore microtubules depolymerize (Anaphase A)", "• Spindle poles push further apart (Anaphase B)"],
      4: ["• Two new nuclear envelopes reform around chromosomes", "• Chromosomes decondense back into loose chromatin", "• Nucleoli reappear in both daughter nuclei", "• Actin-myosin cleavage furrow / plant cell plate forms"]
    }[currentPhaseIdx];

    ctx.font = "10px sans-serif";
    ctx.fillStyle = "#e2e8f0";
    eventList?.forEach((ev, idx) => {
      ctx.fillText(ev, hudX + 18, hudY + 108 + idx * 22);
    });

    // Checkpoint Status Box
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(hudX + 14, hudY + 210, hudW - 28, 96, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 11px monospace";
    ctx.fillText("CELL CYCLE REGULATION & CHECKPOINTS:", hudX + 22, hudY + 230);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px sans-serif";
    if (currentPhaseIdx === 0) {
      ctx.fillText("G₁/S Checkpoint: Evaluates DNA integrity and nutrients.", hudX + 22, hudY + 250);
      ctx.fillText("G₂/M Checkpoint: Verifies 100% genome replication before M-phase.", hudX + 22, hudY + 268);
    } else if (currentPhaseIdx === 2) {
      ctx.fillText("Spindle Assembly Checkpoint (SAC): Validates that all", hudX + 22, hudY + 250);
      ctx.fillText("kinetochores are under tension before enabling separase.", hudX + 22, hudY + 268);
    } else {
      ctx.fillText("Cyclin B / CDK1 (MPF) triggers mitosis entry and exit.", hudX + 22, hudY + 250);
      ctx.fillText("Degradation of cyclin B by APC/C promotes telophase.", hudX + 22, hudY + 268);
    }

    // Checkpoint Warning if Colchicine is ON
    if (hasColchicine) {
      ctx.fillStyle = "rgba(244, 63, 94, 0.12)";
      ctx.strokeStyle = "#f43f5e";
      ctx.beginPath();
      ctx.roundRect(hudX + 14, hudY + 316, hudW - 28, 80, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#f43f5e";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText("⚠️ COLCHICINE SPINDLE POISON ACTIVE:", hudX + 22, hudY + 336);
      ctx.font = "9px sans-serif";
      ctx.fillStyle = "#fca5a5";
      ctx.fillText("Binds tubulin dimers, preventing microtubule polymerisation.", hudX + 22, hudY + 354);
      ctx.fillText("Kinetochores fail tension test -> Permanent Metaphase Arrest!", hudX + 22, hudY + 370);
    } else {
      ctx.fillStyle = "rgba(16, 185, 129, 0.1)";
      ctx.strokeStyle = "#10b981";
      ctx.beginPath();
      ctx.roundRect(hudX + 14, hudY + 316, hudW - 28, 80, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#10b981";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText("✓ NORMAL PROLIFERATION ACTIVE:", hudX + 22, hudY + 336);
      ctx.font = "9px sans-serif";
      ctx.fillStyle = "#a7f3d0";
      ctx.fillText("Microtubules dynamically polymerise and depolymerise.", hudX + 22, hudY + 354);
      ctx.fillText("Continuous balanced mitotic progression through all 5 phases.", hudX + 22, hudY + 370);
    }
  }

  function drawHistologyGrid() {
    if (!ctx) return;
    const gridLeft = 52;
    const gridTop = 64;
    const cellW = 58;
    const cellH = 58;

    // Outer dark stage plate
    ctx.fillStyle = "#030712";
    ctx.fillRect(30, 30, 540, 440);

    // Microscope Field of View Circle with brass rim
    ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(285, 250, 205, 0, Math.PI * 2);
    ctx.stroke();

    // Histological Tissue Specimen Stained Acetocarmine Background
    ctx.fillStyle = "rgba(136, 19, 55, 0.15)";
    ctx.beginPath();
    ctx.arc(285, 250, 203, 0, Math.PI * 2);
    ctx.fill();

    // Render cells in grid
    histologyCells.forEach(c => {
      const px = gridLeft + c.col * (cellW + 6);
      const py = gridTop + c.row * (cellH + 6);

      // Cell boundary (Allium cepa rectangular cellulose box)
      ctx.fillStyle = "rgba(16, 185, 129, 0.08)";
      ctx.strokeStyle = "#15803d";
      ctx.lineWidth = 2;
      ctx.fillRect(px, py, cellW, cellH);
      ctx.strokeRect(px, py, cellW, cellH);

      // Inner cell wall double line
      ctx.strokeStyle = "rgba(16, 185, 129, 0.3)";
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 2, py + 2, cellW - 4, cellH - 4);

      // Phase representation inside cell (Acetocarmine dark purple stained chromatin)
      const cx = px + cellW / 2;
      const cy = py + cellH / 2;

      if (c.actualPhase === "interphase") {
        // Round stained nucleus with nucleolus
        const nucGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 14);
        nucGrad.addColorStop(0, "#be185d");
        nucGrad.addColorStop(1, "#831843");
        ctx.fillStyle = nucGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 13, 0, Math.PI * 2);
        ctx.fill();

        // Dark nucleolus dot
        ctx.fillStyle = "#500724";
        ctx.beginPath();
        ctx.arc(cx - 3, cy - 3, 3.5, 0, Math.PI * 2);
        ctx.fill();

      } else if (c.actualPhase === "prophase") {
        // Clustered dark condensed chromatin threads
        ctx.fillStyle = "#f59e0b";
        for (let i = 0; i < 5; i++) {
          ctx.fillRect(cx - 10 + i * 4, cy - 10 + (i % 2) * 8, 3.5, 12);
        }
      } else if (c.actualPhase === "metaphase") {
        // Dense dark bar aligned at equatorial plate
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(cx - 2.5, cy - 18, 5, 36);
        // Lateral chromatid arm fuzz
        ctx.fillStyle = "rgba(56, 189, 248, 0.4)";
        ctx.fillRect(cx - 7, cy - 14, 14, 28);
      } else if (c.actualPhase === "anaphase") {
        // Two distinctly split daughter chromosome bands
        ctx.fillStyle = "#f43f5e";
        ctx.fillRect(cx - 12, cy - 14, 4, 28);
        ctx.fillRect(cx + 8, cy - 14, 4, 28);
      } else if (c.actualPhase === "telophase") {
        // Two faint round nuclei + central cell plate
        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.arc(cx - 11, cy, 8, 0, Math.PI * 2);
        ctx.arc(cx + 11, cy, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Emerging cell plate
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 16);
        ctx.lineTo(cx, cy + 16);
        ctx.stroke();
      }

      // Cell Number Badge
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "8px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`${c.id}`, px + 3, py + 10);
    });

    // Right Side Info Panel
    const hudX = 590;
    const hudY = 50;
    const hudW = 320;
    const hudH = 410;

    ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
    ctx.strokeStyle = "rgba(16, 185, 129, 0.25)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(hudX, hudY, hudW, hudH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#10b981";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("ALLIUM CEPA MERISTEM HISTOLOGY", hudX + 18, hudY + 28);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px sans-serif";
    ctx.fillText("48 Cells Sampled at 1000× Oil Immersion (Acetocarmine)", hudX + 18, hudY + 46);

    const { mitoticCount, mi, phaseCounts } = calculateMitoticIndex();

    // Summary Score Card
    ctx.fillStyle = "rgba(16, 185, 129, 0.08)";
    ctx.strokeStyle = "rgba(16, 185, 129, 0.3)";
    ctx.beginPath();
    ctx.roundRect(hudX + 14, hudY + 60, hudW - 28, 88, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 10px monospace";
    ctx.fillText("CALCULATED MITOTIC INDEX (MI):", hudX + 24, hudY + 80);

    ctx.fillStyle = "#10b981";
    ctx.font = "bold 26px monospace";
    ctx.fillText(`${mi.toFixed(1)}%`, hudX + 24, hudY + 112);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "10px sans-serif";
    ctx.fillText(`${mitoticCount} Dividing Cells / ${TOTAL_CELLS} Total Meristematic Cells`, hudX + 24, hudY + 134);

    // Phase Breakdown Bars
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 11px monospace";
    ctx.fillText("PHASE CELL COUNTS:", hudX + 18, hudY + 168);

    const barY = hudY + 180;
    PHASES.forEach((p, idx) => {
      const y = barY + idx * 26;
      const cnt = phaseCounts[p.key] || 0;
      const barLen = Math.max(4, (cnt / TOTAL_CELLS) * (hudW - 130));

      ctx.fillStyle = p.color;
      ctx.font = "bold 10px sans-serif";
      ctx.fillText(`${p.name.split(" ")[0]}:`, hudX + 18, y + 10);

      // Bar track
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(hudX + 90, y, hudW - 130, 12);
      ctx.fillStyle = p.color;
      ctx.fillRect(hudX + 90, y, barLen, 12);

      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 10px monospace";
      ctx.fillText(`${cnt}`, hudX + hudW - 32, y + 10);
    });

    // Colchicine Alert
    if (hasColchicine) {
      ctx.fillStyle = "rgba(244, 63, 94, 0.12)";
      ctx.strokeStyle = "#f43f5e";
      ctx.beginPath();
      ctx.roundRect(hudX + 14, hudY + 322, hudW - 28, 76, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#f43f5e";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText("COLCHICINE ARREST OBSERVED:", hudX + 22, hudY + 342);
      ctx.font = "9px sans-serif";
      ctx.fillStyle = "#fca5a5";
      ctx.fillText("Metaphase cell proportion jumped drastically to >50%.", hudX + 22, hudY + 360);
      ctx.fillText("Anaphase & telophase depleted due to spindle failure.", hudX + 22, hudY + 376);
    } else {
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.beginPath();
      ctx.roundRect(hudX + 14, hudY + 322, hudW - 28, 76, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#cbd5e1";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText("PHYSIOLOGICAL MERISTEM DYNAMICS:", hudX + 22, hudY + 342);
      ctx.font = "9px sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("Onion root apical meristem exhibits high cell turnover.", hudX + 22, hudY + 360);
      ctx.fillText("Formula: t_phase = (N_phase / N_total) × 1440 min.", hudX + 22, hudY + 376);
    }
  }

  function loop(timestamp) {
    if (!container || !container.isConnected) {
      isPlaying = false;
      if (animId) cancelAnimationFrame(animId);
      return;
    }
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;
    simTime += dt;

    if (isPlaying && activeTab === "animator") {
      // If colchicine is active and we are in metaphase, freeze progression
      if (!(hasColchicine && currentPhaseIdx === 2)) {
        phaseProgress += (dt * animSpeed * 0.4);
        if (phaseProgress >= 1.0) {
          phaseProgress = 0.0;
          currentPhaseIdx = (currentPhaseIdx + 1) % PHASES.length;
          SoundFX.playClick();
        }
      }
    }

    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : Math.min(window.devicePixelRatio || 1, 2);
    ctx.save();
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, logicalW, logicalH);

    // Background grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    for (let x = 0; x < logicalW; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, logicalH);
      ctx.stroke();
    }

    if (activeTab === "animator") {
      drawCellAnimator();
    } else {
      drawHistologyGrid();
    }

    ctx.restore();

    // Update Real Bench Photo HUD
    const curPhase = PHASES[currentPhaseIdx];
    if (photoPhase) photoPhase.textContent = curPhase.name;
    if (photoSpindle) photoSpindle.textContent = hasColchicine ? "Colchicine Block" : "Normal";

    animId = requestAnimationFrame(loop);
  }

  // Event Listeners
  btnTabAnim?.addEventListener("click", () => {
    activeTab = "animator";
    btnTabAnim.className = "btn btn-sm active";
    btnTabAnim.style.borderColor = "#10b981";
    btnTabAnim.style.color = "#10b981";
    btnTabHisto.className = "btn btn-sm";
    btnTabHisto.style.borderColor = "var(--border-color)";
    btnTabHisto.style.color = "#94a3b8";
    const ctrl = document.getElementById("anim-controls");
    if (ctrl) ctrl.style.display = "block";
  });

  btnTabHisto?.addEventListener("click", () => {
    activeTab = "histology";
    btnTabHisto.className = "btn btn-sm active";
    btnTabHisto.style.borderColor = "#10b981";
    btnTabHisto.style.color = "#10b981";
    btnTabAnim.className = "btn btn-sm";
    btnTabAnim.style.borderColor = "var(--border-color)";
    btnTabAnim.style.color = "#94a3b8";
    const ctrl = document.getElementById("anim-controls");
    if (ctrl) ctrl.style.display = "none";
  });

  playBtn?.addEventListener("click", () => {
    isPlaying = !isPlaying;
    if (isPlaying) {
      playBtn.textContent = "⏸ Pause Cycle";
      playBtn.className = "btn btn-primary btn-sm";
    } else {
      playBtn.textContent = "▶ Resume Cycle";
      playBtn.className = "btn btn-secondary btn-sm";
    }
  });

  stepNextBtn?.addEventListener("click", () => {
    currentPhaseIdx = (currentPhaseIdx + 1) % PHASES.length;
    phaseProgress = 0.0;
    SoundFX.playClick();
  });

  document.querySelectorAll(".phase-jump-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(btn.getAttribute("data-phase"), 10);
      currentPhaseIdx = idx;
      phaseProgress = 0.0;
      SoundFX.playBeep();
    });
  });

  sliderSpeed?.addEventListener("input", (e) => {
    animSpeed = parseFloat(e.target.value);
    if (lblSpeed) lblSpeed.textContent = `${animSpeed.toFixed(1)}×`;
  });

  checkColchicine?.addEventListener("change", (e) => {
    hasColchicine = e.target.checked;
    if (colchicineToggleSpan) colchicineToggleSpan.style.background = hasColchicine ? "#f43f5e" : "#475569";
    initHistologyCells();
    updateTable();
    SoundFX.playBeep();
  });

  logBtn?.addEventListener("click", () => {
    const { mi, phaseCounts } = calculateMitoticIndex();
    trialLogs.unshift({
      treatment: hasColchicine ? "Colchicine Treated" : "Untreated Control",
      mitoticIndex: `${mi.toFixed(1)}%`,
      interphase: phaseCounts.interphase,
      prophase: phaseCounts.prophase,
      metaphase: phaseCounts.metaphase,
      anaphase: phaseCounts.anaphase,
      telophase: phaseCounts.telophase
    });
    if (trialLogs.length > 8) trialLogs.pop();
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
    const { mi, phaseCounts } = calculateMitoticIndex();
    exportLabDataCsv({
      title: "Cell Cycle & Mitotic Index Cytogenetics Telemetry",
      labId: "mitosis",
      parameters: {
        "Specimen Tissue": "Allium Cepa (Onion Root Tip Meristem)",
        "Spindle Toxin": hasColchicine ? "Colchicine (Metaphase Arrest Active)" : "None (Normal Mitotic Spindle)",
        "Mitotic Index (MI)": `${mi.toFixed(1)}%`
      },
      headers: [
        "Treatment Group",
        "Interphase Cells",
        "Prophase Cells",
        "Metaphase Cells",
        "Anaphase Cells",
        "Telophase Cells",
        "Total Counted Cells",
        "Mitotic Index (%)"
      ],
      dataRows: [
        [
          hasColchicine ? "Colchicine (Arrest)" : "Untreated Control",
          phaseCounts.interphase,
          phaseCounts.prophase,
          phaseCounts.metaphase,
          phaseCounts.anaphase,
          phaseCounts.telophase,
          TOTAL_CELLS,
          mi.toFixed(1)
        ]
      ]
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
  mountLabCheckpoint("mitosis-checkpoint-mount", "bio-mitosis");

  // Initial draw and run
  initHistologyCells();
  updateTable();
  animId = requestAnimationFrame(loop);

  return () => {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("resize", setupHiDPICanvas);
  };
}

