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
            \\text{MI} = \\frac{\\sum \\text{Mitotic Cells}}{N_{\\text{total}}} \\times 100\\% • t_{\\text{phase}} = \\frac{N_p}{N_t} \\times 1440\\text{ min}
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div class="btn-group" style="display: flex; border: 1px solid var(--border-color); border-radius: 6px; overflow: hidden;">
            <button id="btn-view-sim" class="btn btn-sm active" style="padding: 5px 12px; font-size: 0.8rem; border: none; border-radius: 0;">🔬 Mitosis Simulator</button>
            <button id="btn-view-photo" class="btn btn-sm" style="padding: 5px 12px; font-size: 0.8rem; border: none; border-radius: 0; background: transparent;">📸 4K Real Bench</button>
          </div>
          <button id="btn-export-csv" class="btn btn-secondary btn-sm" style="padding: 5px 12px; font-size: 0.8rem;">📥 Export CSV</button>
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
              <img src="assets/labs/mitosis_bench.jpg" alt="Cytogenetics Allium Cepa Microscope 4K Bench" style="width: 100%; height: 100%; object-fit: cover;" />
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

    const cx = canvas.width * 0.40;
    const cy = 250;
    const cellR = 150;

    // 1. Cell Membrane (Outer Circle)
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 4;
    ctx.fillStyle = "rgba(16, 185, 129, 0.08)";

    if (currentPhaseIdx === 4) {
      // Telophase Cleavage Furrow (pinch in middle)
      ctx.beginPath();
      ctx.arc(cx - 50, cy, cellR * 0.8, 0.5, Math.PI * 2 - 0.5);
      ctx.arc(cx + 50, cy, cellR * 0.8, Math.PI + 0.5, Math.PI - 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(cx, cy, cellR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // 2. Centrosomes / Aster Rays
    const leftCentX = cx - 110;
    const rightCentX = cx + 110;

    if (currentPhaseIdx >= 1) {
      // Centrosomes (yellow spheres)
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(leftCentX, cy, 6, 0, Math.PI * 2);
      ctx.arc(rightCentX, cy, 6, 0, Math.PI * 2);
      ctx.fill();

      // Spindle Fibers (Microtubules)
      ctx.strokeStyle = "rgba(245, 158, 11, 0.35)";
      ctx.lineWidth = 1.2;
      for (let f = -5; f <= 5; f++) {
        ctx.beginPath();
        ctx.moveTo(leftCentX, cy);
        ctx.quadraticCurveTo(cx, cy + f * 24, rightCentX, cy);
        ctx.stroke();
      }
    }

    // 3. Chromatin / Chromosome rendering based on Phase
    if (currentPhaseIdx === 0) {
      // Interphase: Intact nuclear membrane with diffuse granular chromatin
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(cx, cy, 75, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Nucleolus
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(cx - 20, cy - 15, 14, 0, Math.PI * 2);
      ctx.fill();

      // Granular chromatin thread loop
      ctx.strokeStyle = "rgba(244, 63, 94, 0.7)";
      ctx.lineWidth = 1.5;
      for (let c = 0; c < 24; c++) {
        const ang = (c / 24) * Math.PI * 2;
        const r = 25 + (c % 5) * 8;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, 6, 0, Math.PI * 2);
        ctx.stroke();
      }

    } else if (currentPhaseIdx === 1) {
      // Prophase: Disintegrating nuclear membrane + condensed X-shaped chromosomes
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 8]);
      ctx.beginPath();
      ctx.arc(cx, cy, 75, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 4 Pairs of X-shaped Chromosomes
      const chromCoords = [
        { x: cx - 35, y: cy - 30 },
        { x: cx + 35, y: cy - 25 },
        { x: cx - 25, y: cy + 30 },
        { x: cx + 30, y: cy + 35 }
      ];

      chromCoords.forEach(pos => {
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(pos.x - 12, pos.y - 12);
        ctx.lineTo(pos.x + 12, pos.y + 12);
        ctx.moveTo(pos.x + 12, pos.y - 12);
        ctx.lineTo(pos.x - 12, pos.y + 12);
        ctx.stroke();
      });

    } else if (currentPhaseIdx === 2) {
      // Metaphase: Chromosomes lined up at vertical equatorial plate (x = cx)
      ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, cy - 100);
      ctx.lineTo(cx, cy + 100);
      ctx.stroke();
      ctx.setLineDash([]);

      // Chromosomes aligned along vertical axis
      for (let k = -2; k <= 2; k++) {
        const yPos = cy + k * 34;
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 4.5;
        // Sister chromatid arms
        ctx.beginPath();
        ctx.moveTo(cx - 10, yPos - 10);
        ctx.lineTo(cx + 10, yPos + 10);
        ctx.moveTo(cx + 10, yPos - 10);
        ctx.lineTo(cx - 10, yPos + 10);
        ctx.stroke();

        // Kinetochore attachment point
        ctx.fillStyle = "#facc15";
        ctx.beginPath();
        ctx.arc(cx, yPos, 4, 0, Math.PI * 2);
        ctx.fill();
      }

    } else if (currentPhaseIdx === 3) {
      // Anaphase: V-shaped daughter chromosomes pulled apart
      const separation = 40 + phaseProgress * 50;

      for (let k = -2; k <= 2; k++) {
        const yPos = cy + k * 32;

        // Left migrating chromatids (pointed left <)
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx - separation + 12, yPos - 10);
        ctx.lineTo(cx - separation, yPos);
        ctx.lineTo(cx - separation + 12, yPos + 10);
        ctx.stroke();

        // Right migrating chromatids (pointed right >)
        ctx.beginPath();
        ctx.moveTo(cx + separation - 12, yPos - 10);
        ctx.lineTo(cx + separation, yPos);
        ctx.lineTo(cx + separation - 12, yPos + 10);
        ctx.stroke();
      }

    } else if (currentPhaseIdx === 4) {
      // Telophase & Cytokinesis: Two new nuclei reforming
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx - 50, cy, 40, 0, Math.PI * 2);
      ctx.arc(cx + 50, cy, 40, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "rgba(244, 63, 94, 0.6)";
      ctx.font = "9px sans-serif";
      ctx.fillText("Decondensing Chromatin", cx - 50, cy);
      ctx.fillText("Decondensing Chromatin", cx + 50, cy);
    }

    // 4. Right Side Phase HUD
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

    ctx.fillStyle = curPhase.color;
    ctx.font = "bold 15px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(curPhase.name.toUpperCase(), hudX + 18, hudY + 32);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px sans-serif";
    ctx.fillText(`Stage ${currentPhaseIdx + 1} of 5 in Cell Cycle`, hudX + 18, hudY + 52);

    // Progress Bar within Phase
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.fillRect(hudX + 18, hudY + 65, hudW - 36, 6);
    ctx.fillStyle = curPhase.color;
    ctx.fillRect(hudX + 18, hudY + 65, (hudW - 36) * phaseProgress, 6);

    // Molecular Events Checklist
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("KEY CYTOLOGICAL EVENTS:", hudX + 18, hudY + 105);

    const eventList = {
      0: ["• DNA replication in S phase", "• Histone synthesis & centrosome duplicate", "• Intact nuclear envelope & nucleolus"],
      1: ["• Condensation of chromatin fibers", "• Disintegration of nuclear lamina & envelope", "• Early mitotic spindle aster assembly"],
      2: ["• Alignment on equatorial metaphase plate", "• Kinetochore microtubule bi-orientation", "• SAC (Spindle Assembly Checkpoint) validation"],
      3: ["• Cleavage of cohesin protein rings", "• Sister chromatid separation into daughter chromosomes", "• Depolymerization of kinetochore microtubules"],
      4: ["• Reformation of two nuclear envelopes", "• Chromosome decondensation into chromatin", "• Actin-myosin cleavage furrow / cell plate synthesis"]
    }[currentPhaseIdx];

    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#e2e8f0";
    eventList?.forEach((ev, idx) => {
      ctx.fillText(ev, hudX + 18, hudY + 130 + idx * 22);
    });

    // Checkpoint Warning if Colchicine is ON
    if (hasColchicine && currentPhaseIdx === 2) {
      ctx.fillStyle = "#f43f5e";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText("⚠️ ARRESTED BY COLCHICINE:", hudX + 18, hudY + 230);
      ctx.font = "10px sans-serif";
      ctx.fillStyle = "#fca5a5";
      ctx.fillText("Microtubule poison prevents anaphase transition.", hudX + 18, hudY + 248);
      ctx.fillText("Cells accumulate indefinitely at Metaphase plate!", hudX + 18, hudY + 264);
    }
  }

  function drawHistologyGrid() {
    if (!ctx) return;
    const gridLeft = 60;
    const gridTop = 80;
    const cellW = 56;
    const cellH = 56;

    // Microscope Field of View Circle
    ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(285, 250, 195, 0, Math.PI * 2);
    ctx.stroke();

    // Render cells in grid
    histologyCells.forEach(c => {
      const px = gridLeft + c.col * (cellW + 6);
      const py = gridTop + c.row * (cellH + 6);

      // Cell boundary (rectangular plant cell box)
      ctx.fillStyle = "rgba(16, 185, 129, 0.12)";
      ctx.strokeStyle = "#15803d";
      ctx.lineWidth = 1.5;
      ctx.fillRect(px, py, cellW, cellH);
      ctx.strokeRect(px, py, cellW, cellH);

      // Phase representation inside cell
      const cx = px + cellW / 2;
      const cy = py + cellH / 2;

      if (c.actualPhase === "interphase") {
        // Round nucleus
        ctx.fillStyle = "rgba(148, 163, 184, 0.6)";
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fill();
      } else if (c.actualPhase === "prophase") {
        // Clustered dark chromatin
        ctx.fillStyle = "#f59e0b";
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(cx - 8 + i * 4, cy - 8 + (i % 2) * 6, 3, 10);
        }
      } else if (c.actualPhase === "metaphase") {
        // Dense dark line in center
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(cx - 2, cy - 14, 4, 28);
      } else if (c.actualPhase === "anaphase") {
        // Two split bands
        ctx.fillStyle = "#f43f5e";
        ctx.fillRect(cx - 10, cy - 12, 3, 24);
        ctx.fillRect(cx + 7, cy - 12, 3, 24);
      } else if (c.actualPhase === "telophase") {
        // Two faint round nuclei + cell plate
        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.arc(cx - 10, cy, 8, 0, Math.PI * 2);
        ctx.arc(cx + 10, cy, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fbbf24";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 14);
        ctx.lineTo(cx, cy + 14);
        ctx.stroke();
      }
    });

    // Right Side Info Panel
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

    ctx.fillStyle = "#10b981";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("ALLIUM CEPA (ONION ROOT TIP) MERISTEM", hudX + 18, hudY + 30);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px sans-serif";
    ctx.fillText("48 Meristematic Cells Sampled at 1000× Oil Immersion", hudX + 18, hudY + 50);

    const { mitoticCount, mi } = calculateMitoticIndex();

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("MERISTEMATIC SUMMARY METRICS:", hudX + 18, hudY + 85);

    ctx.font = "11px monospace";
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText(`Total Meristem Cells Counted: 48`, hudX + 18, hudY + 115);
    ctx.fillText(`Mitotic Dividing Cells: ${mitoticCount}`, hudX + 18, hudY + 135);
    ctx.fillStyle = "#10b981";
    ctx.font = "bold 14px monospace";
    ctx.fillText(`MITOTIC INDEX: ${mi.toFixed(1)}%`, hudX + 18, hudY + 165);

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "11px sans-serif";
    ctx.fillText("Formula: MI = (Mitotic Cells / Total) × 100", hudX + 18, hudY + 195);
    ctx.fillText("High index signifies actively dividing apical meristem zone.", hudX + 18, hudY + 215);

    if (hasColchicine) {
      ctx.fillStyle = "#f43f5e";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText("Colchicine Arrest active: Metaphase count surged!", hudX + 18, hudY + 250);
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

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    if (activeTab === "animator") {
      drawCellAnimator();
    } else {
      drawHistologyGrid();
    }

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
    const rows = [
      { treatment: hasColchicine ? "Colchicine Treated" : "Untreated Control", mitoticIndex: `${mi.toFixed(1)}%`, ...phaseCounts }
    ];
    exportLabDataCsv("Cell_Cycle_Mitosis_Cytogenetics", rows);
  });

  // Mount Assessment Checkpoint
  mountLabCheckpoint("mitosis-checkpoint-mount", "bio-mitosis");

  // Initial draw and run
  initHistologyCells();
  updateTable();
  animId = requestAnimationFrame(loop);

  return () => {
    if (animId) cancelAnimationFrame(animId);
  };
}
