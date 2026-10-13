// Edugates-ClipSAT Science Labs - Biology: Cell Cycle & Mitosis Suite
// 60 FPS Precision Mitotic Cytogenetics & Histology Simulation:
// Cell Cycle Phases: Interphase (G₁, S, G₂), Prophase & Prometaphase, Metaphase, Anaphase, Telophase & Cytokinesis,
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
    { key: "interphase", name: "Interphase (G₁, S, G₂)", shortName: "Interphase", color: "#38bdf8", durationPct: 75 },
    { key: "prophase", name: "Prophase & Prometaphase", shortName: "Prophase", color: "#f59e0b", durationPct: 12 },
    { key: "metaphase", name: "Metaphase (Equator)", shortName: "Metaphase", color: "#818cf8", durationPct: 6 },
    { key: "anaphase", name: "Anaphase (A & B Disjunction)", shortName: "Anaphase", color: "#f43f5e", durationPct: 4 },
    { key: "telophase", name: "Telophase & Cytokinesis", shortName: "Telophase", color: "#10b981", durationPct: 3 }
  ];

  // State Variables
  let activeTab = "animator"; // "animator" or "histology"
  let specimenType = "plant"; // "plant" (Allium cepa) or "animal" (Mammalian somatic)
  let stainingMode = "fluorescence"; // "fluorescence" (Confocal DAPI/GFP) or "acetocarmine" (Brightfield Feulgen)
  let currentPhaseIdx = 0; // 0..4
  let phaseProgress = 0.0; // 0.0 to 1.0 within phase
  let simTime = 0.0;
  let isPlaying = false; // STARTS PAUSED BY DEFAULT: Solves auto-mode confusion, enabling interactive manual study!
  let playMode = "step"; // "step" (pauses at ends of stages) or "cycle" (continuous loop)
  let animSpeed = 1.0;
  let fineFocus = 0.0; // Z-axis focal depth in µm (-2.0 to +2.0 µm, 0 is sharp)
  let hasColchicine = false; // Spindle poison halts at Metaphase SAC!

  // Interactive Inspection & Histology Diagnostics
  let canvasMouse = { x: -1, y: -1, isOver: false };
  let selectedHistoCell = null;
  let histoFilter = "all"; // "all" or phase key
  let studentScore = { correct: 0, total: 0 };

  // Histology Grid (Allium cepa meristem sample: 48 interactive histological cells)
  const histologyCells = [];
  const TOTAL_CELLS = 48;

  function initHistologyCells() {
    histologyCells.length = 0;
    // Representative biological distribution in onion root tip apical meristem
    const phaseDist = [
      { phase: "interphase", count: hasColchicine ? 14 : 31 },
      { phase: "prophase", count: hasColchicine ? 4 : 7 },
      { phase: "metaphase", count: hasColchicine ? 28 : 5 }, // Colchicine blocks at metaphase!
      { phase: "anaphase", count: hasColchicine ? 1 : 3 },
      { phase: "telophase", count: hasColchicine ? 1 : 2 }
    ];

    let cellList = [];
    phaseDist.forEach(p => {
      for (let i = 0; i < p.count; i++) cellList.push(p.phase);
    });

    // Seeded-shuffle for consistency and natural distribution
    let seed = 42;
    function pseudoRandom() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    }
    cellList = cellList.sort(() => pseudoRandom() - 0.5);

    for (let i = 0; i < TOTAL_CELLS; i++) {
      histologyCells.push({
        id: i + 1,
        actualPhase: cellList[i] || "interphase",
        userClassified: null,
        col: i % 8,
        row: Math.floor(i / 8),
        wallJitterX: ((i * 17) % 5) - 2,
        wallJitterY: ((i * 23) % 5) - 2,
        nucleolusOffset: ((i * 7) % 6) - 3
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
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; background: rgba(15, 23, 42, 0.95); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.4);">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <span style="font-size: 0.88rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #10b981; box-shadow: 0 0 10px #10b981;"></span>
            Cell Cycle &amp; Mitosis Cytogenetics Workbench
          </span>
          <span class="badge" style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            ${renderLatex("\\text{MI} = \\frac{\\sum \\text{Mitotic Cells}}{N_{\\text{total}}} \\times 100\\% \\quad \\bullet \\quad t_{\\text{phase}} = \\frac{N_p}{N_t} \\times 1440\\text{ min}")}
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <div class="lab-view-switcher bio-switcher">
            <button id="btn-view-sim" class="btn btn-sm active">🔬 Mitosis Simulator</button>
            <button id="btn-view-photo" class="btn btn-sm">📸 4K Real Bench</button>
          </div>
          <button id="btn-export-csv" class="btn btn-secondary btn-sm" style="padding: 5px 12px; font-size: 0.8rem; color: #f8fafc; font-weight: 600;">📥 Export CSV (E)</button>
        </div>
      </div>

      <!-- Secondary Biological Controls Toolbar -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 8px 14px; flex-wrap: wrap; gap: 10px;">
        <!-- Specimen Architecture Switcher -->
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 0.75rem; font-weight: 700; color: #cbd5e1; text-transform: uppercase;">Specimen Model:</span>
          <div class="btn-group" style="display: flex; background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border-color); border-radius: 6px; padding: 2px;">
            <button id="btn-specimen-plant" class="btn btn-sm active" style="padding: 3px 10px; font-size: 0.75rem; border: none; border-radius: 4px; background: #10b981; color: #022c22; font-weight: 700;">
              🌱 Plant Cell (Allium cepa)
            </button>
            <button id="btn-specimen-animal" class="btn btn-sm" style="padding: 3px 10px; font-size: 0.75rem; border: none; border-radius: 4px; background: transparent; color: #cbd5e1; font-weight: 600;">
              🐾 Animal Cell (Mammalian)
            </button>
          </div>
        </div>

        <!-- Optical Staining Filter Switcher -->
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 0.75rem; font-weight: 700; color: #cbd5e1; text-transform: uppercase;">Microscopy Stain:</span>
          <div class="btn-group" style="display: flex; background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border-color); border-radius: 6px; padding: 2px;">
            <button id="btn-stain-fluor" class="btn btn-sm active" style="padding: 3px 10px; font-size: 0.75rem; border: none; border-radius: 4px; background: #38bdf8; color: #082f49; font-weight: 700;">
              ✨ Confocal (DAPI / GFP)
            </button>
            <button id="btn-stain-aceto" class="btn btn-sm" style="padding: 3px 10px; font-size: 0.75rem; border: none; border-radius: 4px; background: transparent; color: #cbd5e1; font-weight: 600;">
              🧪 Acetocarmine / Feulgen
            </button>
          </div>
        </div>

        <!-- Mode Indicator / Live Biological Status -->
        <div id="bio-live-indicator" style="font-size: 0.75rem; font-family: monospace; color: #34d399; display: flex; align-items: center; gap: 6px;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: inline-block; animation: pulse 2s infinite;"></span>
          <span id="bio-status-text">Anastral Spindle • Phragmoplast Active</span>
        </div>
      </div>

      <!-- Main Layout Grid -->
      <div style="display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 16px; align-items: start;">
        
        <!-- Left Column: Canvas Viewport & Cytogenetics Counts -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div id="viewport-wrapper" style="position: relative; width: 100%; height: 500px; background: #020617; border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.85);">
            
            <!-- Canvas -->
            <canvas id="mitosis-canvas" width="940" height="500" style="display: block; width: 100%; height: 100%; cursor: crosshair;"></canvas>

            <!-- 4K Real Lab Bench Photo Overlay (Hidden by default) -->
            <div id="photo-overlay" style="display: none; position: absolute; inset: 0; background: #020617; z-index: 5;">
              <picture>
                <source srcset="assets/labs/mitosis_bench.webp" type="image/webp">
                <img src="assets/labs/mitosis_bench.jpg" decoding="async" loading="lazy" alt="Cytogenetics Allium Cepa Microscope 4K Bench" style="width: 100%; height: 100%; object-fit: cover;" />
              </picture>
              <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(2,6,23,0.3) 0%, rgba(2,6,23,0.88) 100%); pointer-events: none;"></div>
              
              <!-- Bench Callout Badges -->
              <div style="position: absolute; top: 20px; left: 24px; background: rgba(15, 23, 42, 0.92); border: 1px solid #10b981; border-radius: 8px; padding: 12px 16px; backdrop-filter: blur(8px); max-width: 360px; box-shadow: 0 10px 25px rgba(0,0,0,0.6);">
                <div style="font-size: 0.75rem; font-weight: 700; color: #10b981; letter-spacing: 0.05em; text-transform: uppercase;">Real Apparatus Specifications</div>
                <div style="font-size: 0.95rem; font-weight: 600; color: #f8fafc; margin-top: 4px;">Cytogenetics Compound Microscope &amp; Allium cepa Slide</div>
                <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 6px; line-height: 1.4;">
                  Feulgen/Acetocarmine stained onion root tip meristem with oil immersion 100× Plan-Apochromat objective lens (N.A. 1.40).
                </div>
              </div>

              <!-- Live Bench Telemetry Overlay -->
              <div style="position: absolute; bottom: 20px; left: 24px; right: 24px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px 20px; backdrop-filter: blur(10px); display: flex; justify-content: space-around; flex-wrap: wrap; gap: 16px;">
                <div>
                  <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase;">Mitotic Index (MI)</div>
                  <div id="photo-mi" style="font-size: 1.15rem; font-weight: 700; color: #10b981; font-family: monospace;">35.4%</div>
                </div>
                <div>
                  <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase;">Active Mitotic Phase</div>
                  <div id="photo-phase" style="font-size: 1.15rem; font-weight: 700; color: #38bdf8; font-family: monospace;">Interphase</div>
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

            <!-- Mode Switcher Tabs inside Viewport Top Left -->
            <div id="viewport-mode-tabs" style="position: absolute; top: 12px; left: 16px; display: flex; gap: 8px; z-index: 10;">
              <button id="btn-tab-anim" class="btn btn-sm active" style="font-size: 0.75rem; background: rgba(15, 23, 42, 0.9); border: 1px solid #10b981; color: #10b981; padding: 5px 12px; border-radius: 6px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
                🧬 Mitosis Phase Animator
              </button>
              <button id="btn-tab-histo" class="btn btn-sm" style="font-size: 0.75rem; background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); color: #94a3b8; padding: 5px 12px; border-radius: 6px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
                🔬 Onion Root Tip Histology Grid
              </button>
            </div>

            <!-- Live Mitotic State Overlay Badge Top Right -->
            <div id="live-phase-badge" style="position: absolute; top: 12px; right: 16px; z-index: 10; background: rgba(15, 23, 42, 0.92); border: 1px solid rgba(56, 189, 248, 0.35); border-radius: 6px; padding: 5px 12px; font-size: 0.72rem; color: #f8fafc; font-family: monospace; backdrop-filter: blur(8px); display: flex; align-items: center; gap: 8px;">
              <span id="badge-phase-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #38bdf8; display: inline-block;"></span>
              <span id="badge-phase-text" style="font-weight: 700; color: #38bdf8;">INTERPHASE</span>
              <span style="color: #64748b;">|</span>
              <span id="badge-phase-progress-pct" style="color: #cbd5e1;">0% Complete</span>
            </div>

            <!-- Interactive Organelle Inspector Callout (Animator Mode) -->
            <div id="organelle-inspector-box" style="position: absolute; bottom: 12px; left: 16px; right: 16px; background: rgba(15, 23, 42, 0.94); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 8px; padding: 8px 14px; backdrop-filter: blur(10px); pointer-events: none; z-index: 10; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
              <div>
                <span id="inspect-title" style="font-size: 0.78rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em;">🔬 Cytological Landmark Inspector</span>
                <span id="inspect-desc" style="font-size: 0.75rem; color: #cbd5e1; margin-left: 8px;">Move cursor / tap over chromosomes, kinetochores, or organelles to probe biomolecular structures.</span>
              </div>
              <span id="inspect-tag" class="badge" style="font-size: 0.7rem; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; white-space: nowrap;">Optical Scan</span>
            </div>

            <!-- Histology Filter Toolbar (Visible only in Histology Mode) -->
            <div id="histo-toolbar" style="display: none; position: absolute; top: 12px; right: 16px; z-index: 10; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: 6px; padding: 4px; gap: 4px;">
              <button class="btn btn-sm histo-filter-btn active" data-filter="all" style="font-size: 0.7rem; padding: 2px 8px; background: #10b981; color: #022c22; border: none; font-weight: 700;">All (48)</button>
              <button class="btn btn-sm histo-filter-btn" data-filter="interphase" style="font-size: 0.7rem; padding: 2px 8px; background: transparent; color: #94a3b8; border: none;">Interphase</button>
              <button class="btn btn-sm histo-filter-btn" data-filter="prophase" style="font-size: 0.7rem; padding: 2px 8px; background: transparent; color: #f59e0b; border: none;">Prophase</button>
              <button class="btn btn-sm histo-filter-btn" data-filter="metaphase" style="font-size: 0.7rem; padding: 2px 8px; background: transparent; color: #818cf8; border: none;">Metaphase</button>
              <button class="btn btn-sm histo-filter-btn" data-filter="anaphase" style="font-size: 0.7rem; padding: 2px 8px; background: transparent; color: #f43f5e; border: none;">Anaphase</button>
              <button class="btn btn-sm histo-filter-btn" data-filter="telophase" style="font-size: 0.7rem; padding: 2px 8px; background: transparent; color: #10b981; border: none;">Telophase</button>
            </div>
          </div>

          <!-- Histological Phase Counts & Mitotic Index Table -->
          <div style="background: rgba(15, 23, 42, 0.95); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
              <span style="font-size: 0.85rem; font-weight: 700; color: #f8fafc; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
                <span>📊</span> Cytogenetics Phase Distribution &amp; Duration Table (Allium cepa Meristem)
              </span>
              <button id="btn-log-counts" class="btn btn-sm" style="font-size: 0.75rem; background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #10b981; padding: 3px 10px; border-radius: 6px; font-weight: 600;">
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

        <!-- Right Column: Interactive Biological Control Panel -->
        <div style="background: rgba(15, 23, 42, 0.95); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.4);">
          
          <!-- Animation & Playback Mode Controls -->
          <div id="anim-controls" style="display: flex; flex-direction: column; gap: 10px;">
            
            <!-- Play / Pause & Step Navigation -->
            <div style="display: flex; gap: 8px;">
              <button id="btn-play-pause" class="btn btn-secondary btn-sm" style="flex: 1; padding: 8px 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 6px;">
                <span>▶</span> Play Cell Cycle
              </button>
              <button id="btn-step-prev" class="btn btn-secondary btn-sm" style="padding: 8px 10px;" title="Previous Mitotic Stage">
                ⏮
              </button>
              <button id="btn-step-next" class="btn btn-secondary btn-sm" style="padding: 8px 12px; font-weight: 600;" title="Next Mitotic Stage">
                ⏭ Next Phase
              </button>
            </div>

            <!-- Manual Phase Selector Pills -->
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label style="font-size: 0.74rem; font-weight: 700; color: #cbd5e1; text-transform: uppercase;">
                  Mitotic Stage Selection
                </label>
                <span style="font-size: 0.68rem; color: #94a3b8;">Click stage to inspect</span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                <button class="btn btn-secondary btn-sm phase-jump-btn active" data-phase="0" style="font-size: 0.72rem; text-align: left; border-left: 3px solid #38bdf8; background: rgba(56, 189, 248, 0.15);">⚪ Interphase</button>
                <button class="btn btn-secondary btn-sm phase-jump-btn" data-phase="1" style="font-size: 0.72rem; text-align: left; border-left: 3px solid #f59e0b;">🟡 Prophase</button>
                <button class="btn btn-secondary btn-sm phase-jump-btn" data-phase="2" style="font-size: 0.72rem; text-align: left; border-left: 3px solid #818cf8;">🔵 Metaphase</button>
                <button class="btn btn-secondary btn-sm phase-jump-btn" data-phase="3" style="font-size: 0.72rem; text-align: left; border-left: 3px solid #f43f5e;">🔴 Anaphase</button>
                <button class="btn btn-secondary btn-sm phase-jump-btn" data-phase="4" style="grid-column: span 2; font-size: 0.72rem; text-align: left; border-left: 3px solid #10b981;">🟢 Telophase &amp; Cytokinesis</button>
              </div>
            </div>

            <!-- Interactive Stage Progress Scrubber (Scrub continuously through the current phase!) -->
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 8px 10px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.74rem; font-weight: 600; color: #cbd5e1; margin-bottom: 4px;">
                <span>Stage Progress Scrubber:</span>
                <span id="lbl-phase-progress" style="color: #38bdf8; font-weight: 700; font-family: monospace;">0%</span>
              </div>
              <input type="range" id="slider-phase-progress" min="0" max="100" step="1" value="0" style="width: 100%; accent-color: #38bdf8; cursor: ew-resize;" title="Drag to manually scrub through the phase dynamics" />
              <div style="display: flex; justify-content: space-between; font-size: 0.65rem; color: #64748b; margin-top: 2px;">
                <span>Start of Phase</span>
                <span>Scrub Transitions</span>
                <span>End of Phase</span>
              </div>
            </div>

            <!-- Microscopy Fine Focus (Z-Stack Optical Depth) -->
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 8px 10px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.74rem; font-weight: 600; color: #cbd5e1; margin-bottom: 4px;">
                <span>🔬 Fine Focus (Z-Stack Plane):</span>
                <span id="lbl-fine-focus" style="color: #10b981; font-weight: 700; font-family: monospace;">0.0 µm (In Focus)</span>
              </div>
              <input type="range" id="slider-fine-focus" min="-2.0" max="2.0" step="0.1" value="0.0" style="width: 100%; accent-color: #10b981; cursor: ew-resize;" title="Adjust focal depth to simulate true microscope depth of field" />
            </div>

            <!-- Cycle Speed Slider -->
            <div style="padding: 0 4px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.74rem; font-weight: 600; color: #cbd5e1; margin-bottom: 4px;">
                <span>Auto-Cycle Playback Speed</span>
                <span id="lbl-speed" style="color: #10b981; font-weight: 700; font-family: monospace;">1.0×</span>
              </div>
              <input type="range" id="slider-speed" min="0.2" max="3.0" step="0.2" value="1.0" style="width: 100%; accent-color: #10b981;" />
            </div>
          </div>

          <!-- Chemotherapy / Spindle Poison (Colchicine Treatment) -->
          <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 0.8rem; font-weight: 600; color: #f8fafc; display: flex; align-items: center; gap: 6px;">
                  <span>🧪 Colchicine Treatment</span>
                </div>
                <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 2px;">Depolymerizes tubulin (Arrests at Metaphase SAC)</div>
              </div>
              <label style="position: relative; display: inline-block; width: 40px; height: 22px; margin-left: 8px;">
                <input type="checkbox" id="check-colchicine" style="opacity: 0; width: 0; height: 0;" />
                <span id="colchicine-toggle-span" style="position: absolute; cursor: pointer; inset: 0; background: #475569; border-radius: 22px; transition: 0.2s;"></span>
              </label>
            </div>
          </div>

          <!-- Mitotic Index Summary Metric Card -->
          <div style="background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 8px; padding: 12px 14px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <div style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; font-weight: 700; letter-spacing: 0.05em;">Mitotic Index (MI)</div>
              <span class="badge" style="font-size: 0.7rem; background: rgba(16, 185, 129, 0.2); color: #34d399; padding: 2px 6px; border-radius: 4px;">Active Proliferation</span>
            </div>
            <div id="metric-mi-val" style="font-size: 1.7rem; font-weight: 800; color: #10b981; font-family: monospace; margin: 4px 0;">35.4%</div>
            <div id="metric-mi-desc" style="font-size: 0.74rem; color: #cbd5e1; line-height: 1.4;">
              Active mitotic proliferation in onion apical meristem. High index indicates rapid root tip elongation.
            </div>
          </div>

          <!-- Real-Time Cytological Events Card -->
          <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px;">
            <div id="events-card-title" style="font-size: 0.75rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; margin-bottom: 6px;">
              Key Biological Landmarks:
            </div>
            <div id="events-card-list" style="font-size: 0.72rem; color: #cbd5e1; line-height: 1.5; display: flex; flex-direction: column; gap: 4px;">
              <!-- Populated by updateEventsCard() -->
            </div>
          </div>

          <!-- Histology Identification Challenge (Shown in Histology Mode) -->
          <div id="histo-challenge-card" style="display: none; background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 8px; padding: 12px;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; margin-bottom: 6px; display: flex; justify-content: space-between;">
              <span>🔬 Histology Diagnostic Quiz</span>
              <span id="histo-score-badge" style="color: #fbbf24; font-family: monospace;">Score: 0/0 (0%)</span>
            </div>
            <div id="histo-prompt-text" style="font-size: 0.78rem; color: #e2e8f0; margin-bottom: 8px;">
              Click any cell in the 48-cell meristem grid to diagnose its mitotic phase:
            </div>
            <div id="histo-classify-buttons" style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
              <button class="btn btn-sm btn-secondary btn-classify" data-phase="interphase" style="font-size: 0.7rem;">Interphase</button>
              <button class="btn btn-sm btn-secondary btn-classify" data-phase="prophase" style="font-size: 0.7rem;">Prophase</button>
              <button class="btn btn-sm btn-secondary btn-classify" data-phase="metaphase" style="font-size: 0.7rem;">Metaphase</button>
              <button class="btn btn-sm btn-secondary btn-classify" data-phase="anaphase" style="font-size: 0.7rem;">Anaphase</button>
              <button class="btn btn-sm btn-secondary btn-classify" data-phase="telophase" style="grid-column: span 2; font-size: 0.7rem;">Telophase &amp; Cytokinesis</button>
            </div>
            <div id="histo-feedback-banner" style="display: none; margin-top: 8px; padding: 6px 10px; border-radius: 6px; font-size: 0.75rem; line-height: 1.3;"></div>
          </div>

        </div>
      </div>

      <!-- Post-Lab Inquiry Checkpoint Assessment (Full Screen Width) -->
      <div id="mitosis-checkpoint-mount" style="margin-top: 24px; width: 100%;"></div>
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

  const btnSpecimenPlant = document.getElementById("btn-specimen-plant");
  const btnSpecimenAnimal = document.getElementById("btn-specimen-animal");
  const btnStainFluor = document.getElementById("btn-stain-fluor");
  const btnStainAceto = document.getElementById("btn-stain-aceto");
  const bioStatusText = document.getElementById("bio-status-text");

  const viewportModeTabs = document.getElementById("viewport-mode-tabs");
  const livePhaseBadge = document.getElementById("live-phase-badge");
  const btnTabAnim = document.getElementById("btn-tab-anim");
  const btnTabHisto = document.getElementById("btn-tab-histo");
  const histoToolbar = document.getElementById("histo-toolbar");
  const organelleInspectorBox = document.getElementById("organelle-inspector-box");
  const inspectTitle = document.getElementById("inspect-title");
  const inspectDesc = document.getElementById("inspect-desc");
  const inspectTag = document.getElementById("inspect-tag");

  const playBtn = document.getElementById("btn-play-pause");
  const stepPrevBtn = document.getElementById("btn-step-prev");
  const stepNextBtn = document.getElementById("btn-step-next");
  const sliderSpeed = document.getElementById("slider-speed");
  const lblSpeed = document.getElementById("lbl-speed");
  const sliderPhaseProgress = document.getElementById("slider-phase-progress");
  const lblPhaseProgress = document.getElementById("lbl-phase-progress");
  const sliderFineFocus = document.getElementById("slider-fine-focus");
  const lblFineFocus = document.getElementById("lbl-fine-focus");
  const checkColchicine = document.getElementById("check-colchicine");
  const colchicineToggleSpan = document.getElementById("colchicine-toggle-span");

  const badgePhaseDot = document.getElementById("badge-phase-dot");
  const badgePhaseText = document.getElementById("badge-phase-text");
  const badgePhaseProgressPct = document.getElementById("badge-phase-progress-pct");
  const eventsCardTitle = document.getElementById("events-card-title");
  const eventsCardList = document.getElementById("events-card-list");

  const photoMi = document.getElementById("photo-mi");
  const photoPhase = document.getElementById("photo-phase");
  const photoSpindle = document.getElementById("photo-spindle");
  const metricMiVal = document.getElementById("metric-mi-val");
  const metricMiDesc = document.getElementById("metric-mi-desc");
  const tableBody = document.getElementById("telemetry-table-body");

  const histoChallengeCard = document.getElementById("histo-challenge-card");
  const histoScoreBadge = document.getElementById("histo-score-badge");
  const histoPromptText = document.getElementById("histo-prompt-text");
  const histoFeedbackBanner = document.getElementById("histo-feedback-banner");

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
      interphase: "Relaxed diffuse chromatin; nucleolus visible; centrosome / MTOC duplicated",
      prophase: "Chromosomes condense into sister chromatids; nuclear envelope breakdown; spindle begins",
      metaphase: "Chromosomes aligned single-file at equatorial plate; kinetochores attached under SAC tension",
      anaphase: "Cohesin cleaved; sister chromatids disjoin and migrate toward opposite spindle poles",
      telophase: "Daughter nuclei reform; chromosomes decondense; cell plate (plant) or cleavage furrow (animal)"
    };

    tableBody.innerHTML = PHASES.map(p => {
      const count = phaseCounts[p.key] || 0;
      const pct = ((count / TOTAL_CELLS) * 100).toFixed(1);
      const mins = phaseTimes[p.key] || 0;
      return `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); ${p.key === PHASES[currentPhaseIdx].key ? "background: rgba(56, 189, 248, 0.08);" : ""}">
          <td style="padding: 6px 8px; font-weight: 700; color: ${p.color};">${p.name}</td>
          <td style="padding: 6px 8px; color: #f8fafc;">${count}</td>
          <td style="padding: 6px 8px; color: #94a3b8;">${pct}%</td>
          <td style="padding: 6px 8px; color: #fbbf24;">${mins} min</td>
          <td style="padding: 6px 8px; color: #94a3b8; font-size: 0.72rem; font-family: sans-serif;">${descriptions[p.key]}</td>
        </tr>
      `;
    }).join("");

    if (metricMiVal) {
      metricMiVal.textContent = `${mi.toFixed(1)}%`;
      if (photoMi) photoMi.textContent = `${mi.toFixed(1)}%`;
    }
    if (metricMiDesc) {
      if (hasColchicine) {
        metricMiDesc.innerHTML = `<span style="color: #f43f5e; font-weight: 700;">Colchicine Metaphase Arrest:</span> Mitotic index spiked to ${mi.toFixed(1)}% due to irreversible spindle failure at the Spindle Assembly Checkpoint (SAC).`;
      } else {
        metricMiDesc.textContent = "Active mitotic proliferation in onion apical meristem. High index indicates rapid root tip elongation.";
      }
    }
  }

  function updateEventsCard() {
    if (!eventsCardTitle || !eventsCardList) return;
    const curPhase = PHASES[currentPhaseIdx];
    eventsCardTitle.textContent = `Landmarks: ${curPhase.name}`;
    eventsCardTitle.style.color = curPhase.color;

    const eventsByPhase = {
      0: [
        "• DNA replication completes during S-phase (2n → 4C genome)",
        specimenType === "plant" ? "• Polar organizer MTOCs prepare spindle assembly" : "• Centrosome duplicates with orthogonal centriole pairs",
        "• Intact double nuclear envelope with 8-fold nuclear pore complexes",
        "• Active dense nucleolus transcribing 40S & 60S pre-ribosomes"
      ],
      1: [
        "• Condensin coils diffuse chromatin into distinct sister chromatids",
        "• Lamin phosphorylation causes nuclear envelope vesiculation",
        "• Nucleolus disperses into karyolymph",
        specimenType === "plant" ? "• Anastral bipolar spindle assembles from polar organizer caps" : "• Centrosomes separate toward opposite poles nucleating asters"
      ],
      2: [
        "• Chromosomes congress along the equatorial Metaphase Plate",
        "• Bi-oriented sister kinetochores face opposite spindle poles",
        "• K-fibers establish ~35 pN mechanical tension at centromeres",
        hasColchicine ? "⚠️ SAC ACTIVE: Colchicine depolymerizes tubulin -> Mitotic arrest!" : "• Spindle Assembly Checkpoint (SAC) tension satisfied"
      ],
      3: [
        "• APC/C activates separase protease, cleaving cohesin Scc1 rings",
        "• Sister chromatids disjoin into V/J-shaped daughter chromosomes",
        "• Kinetochore microtubules depolymerize poleward (Anaphase A)",
        "• Interpolar non-kinetochore microtubules slide apart (Anaphase B)"
      ],
      4: [
        "• Dephosphorylated lamins reform nuclear envelopes around polar chromatin",
        "• Chromosomes uncoil and decondense back into euchromatin",
        specimenType === "plant" ? "• Phragmoplast guides Golgi pectin vesicles -> Cell Plate forms" : "• Actin-myosin II contractile ring pinches cleavage furrow",
        "• Nucleoli re-emerge at Nucleolar Organizer Regions (NORs)"
      ]
    }[currentPhaseIdx] || [];

    eventsCardList.innerHTML = eventsByPhase.map(ev => `<div>${ev}</div>`).join("");
  }

  // Draw Realistic Multi-Strand Coiled Chromosome
  function drawAnatomicalChromosome(ctx, cx, cy, angle, len, armWidth, bend, colPrimary, colHighlight, kinetoColor, tensionOffset = 0) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // Apply focal depth blur / alpha
    const focusBlur = Math.abs(fineFocus);
    if (focusBlur > 0.3) {
      ctx.globalAlpha = Math.max(0.45, 1.0 - focusBlur * 0.28);
    }

    // Two parallel sister chromatids with coiled chromatin texture
    [-3.8, 3.8].forEach(offsetY => {
      // Chromatid backbone
      ctx.beginPath();
      ctx.moveTo(-len / 2, offsetY);
      ctx.quadraticCurveTo(0, offsetY + bend, len / 2, offsetY);
      ctx.strokeStyle = colPrimary;
      ctx.lineWidth = armWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      // Inner coil striations (simulating condensin helical coiling)
      ctx.strokeStyle = colHighlight;
      ctx.lineWidth = armWidth * 0.38;
      ctx.beginPath();
      ctx.moveTo(-len / 2 + 2, offsetY);
      ctx.quadraticCurveTo(0, offsetY + bend, len / 2 - 2, offsetY);
      ctx.stroke();

      // Helical chromatin bead highlights
      const steps = 6;
      for (let s = 1; s < steps; s++) {
        const t = (s / steps) - 0.5;
        const px = t * len;
        const py = offsetY + bend * (1 - 4 * t * t);
        ctx.fillStyle = colHighlight;
        ctx.beginPath();
        ctx.arc(px, py, armWidth * 0.22, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Primary Constriction (Centromeric Waist)
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(0, bend * 0.5, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Trilaminar Kinetochores on both lateral faces
    const kDist = 5.2 + tensionOffset;
    [-kDist, kDist].forEach(ky => {
      // Outer kinetochore corona glow
      ctx.fillStyle = kinetoColor;
      ctx.beginPath();
      ctx.arc(0, bend * 0.5 + ky, 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Inner kinetochore CENP-A anchor core
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(0, bend * 0.5 + ky, 1.2, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  // Draw 60 FPS Cytogenetics Animator (Centered Viewport with High Biological Realism)
  function drawCellAnimator() {
    if (!ctx) return;
    const curPhase = PHASES[currentPhaseIdx];

    // True Center of Canvas Viewport
    const cx = 470;
    const cy = 245;
    const ocularR = 215;

    // Palette depending on Staining Mode
    const isFluor = stainingMode === "fluorescence";
    const bgIllum = isFluor ? "#020617" : "#fdfbf7";
    const cytosolColor = isFluor ? "rgba(16, 185, 129, 0.12)" : "rgba(253, 230, 138, 0.18)";
    const dnaMain = isFluor ? "#38bdf8" : "#831843";
    const dnaHighlight = isFluor ? "#bae6fd" : "#db2777";
    const tubulinColor = isFluor ? "#10b981" : "#d97706";
    const kinetoColor = isFluor ? "#fbbf24" : "#e11d48";

    // 1. Microscope Field of View Outer Mask
    ctx.fillStyle = "#030712";
    ctx.fillRect(0, 0, logicalW, logicalH);

    // Knurled Metallic Microscope Bezel with Specular Highlights
    const brassGrad = ctx.createRadialGradient(cx, cy, ocularR + 2, cx, cy, ocularR + 24);
    brassGrad.addColorStop(0, "#1e293b");
    brassGrad.addColorStop(0.3, "#475569");
    brassGrad.addColorStop(0.7, "#0f172a");
    brassGrad.addColorStop(1, "#020617");
    ctx.strokeStyle = brassGrad;
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.arc(cx, cy, ocularR + 10, 0, Math.PI * 2);
    ctx.stroke();

    // Specular lens reflection highlight arc
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, ocularR + 2, Math.PI * 1.15, Math.PI * 1.6);
    ctx.stroke();

    // 2. Microscope Kohler Illumination Gradient inside Ocular Circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, ocularR, 0, Math.PI * 2);
    ctx.clip();

    const illumGrad = ctx.createRadialGradient(cx, cy, 25, cx, cy, ocularR);
    if (isFluor) {
      illumGrad.addColorStop(0, "#081b2a");
      illumGrad.addColorStop(0.7, "#030c18");
      illumGrad.addColorStop(1, "#01040a");
    } else {
      illumGrad.addColorStop(0, "#fffbeb");
      illumGrad.addColorStop(0.7, "#fef3c7");
      illumGrad.addColorStop(1, "#f1f5f9");
    }
    ctx.fillStyle = illumGrad;
    ctx.fillRect(cx - ocularR, cy - ocularR, ocularR * 2, ocularR * 2);

    // Apply Fine Focus optical blur / sharpness
    const focusBlur = Math.abs(fineFocus);
    if (focusBlur > 0.2) {
      ctx.filter = `blur(${Math.min(focusBlur * 1.5, 3.5).toFixed(1)}px)`;
    }

    // 3. Meristematic Tissue Layer & Cell Boundary: Plant vs Animal Architecture
    if (specimenType === "plant") {
      // Plant Cell (Allium cepa apical meristem file)
      const pw = 340;
      const ph = 270;
      const rx = cx - pw / 2;
      const ry = cy - ph / 2;

      // Adjacent neighboring cells in the meristem file (subtle context walls)
      ctx.strokeStyle = isFluor ? "rgba(16, 185, 129, 0.25)" : "rgba(180, 83, 9, 0.25)";
      ctx.lineWidth = 3;
      // Top neighboring wall
      ctx.beginPath(); ctx.moveTo(rx - 80, ry - 50); ctx.lineTo(rx + pw + 80, ry - 50); ctx.stroke();
      // Bottom neighboring wall
      ctx.beginPath(); ctx.moveTo(rx - 80, ry + ph + 50); ctx.lineTo(rx + pw + 80, ry + ph + 50); ctx.stroke();
      // Left/Right longitudinal walls
      ctx.beginPath(); ctx.moveTo(rx - 50, cy - ocularR); ctx.lineTo(rx - 50, cy + ocularR); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rx + pw + 50, cy - ocularR); ctx.lineTo(rx + pw + 50, cy + ocularR); ctx.stroke();

      // Middle Lamella (Pectin-rich cement)
      ctx.strokeStyle = isFluor ? "#065f46" : "#92400e";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.roundRect(rx - 5, ry - 5, pw + 10, ph + 10, 16);
      ctx.stroke();

      // Primary Cellulose Cell Wall
      ctx.strokeStyle = isFluor ? "#10b981" : "#b45309";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(rx, ry, pw, ph, 14);
      ctx.stroke();

      // Cytosol background
      ctx.fillStyle = cytosolColor;
      ctx.beginPath();
      ctx.roundRect(rx + 3, ry + 3, pw - 6, ph - 6, 12);
      ctx.fill();

      // Plasma Membrane (Plasmalemma)
      ctx.strokeStyle = isFluor ? "rgba(52, 211, 153, 0.75)" : "rgba(217, 119, 6, 0.75)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(rx + 4, ry + 4, pw - 8, ph - 8, 11);
      ctx.stroke();

      // Plasmodesmata pit canals in cell wall
      ctx.fillStyle = isFluor ? "#34d399" : "#d97706";
      [-1, 1].forEach(side => {
        const wallX = side === -1 ? rx : rx + pw;
        for (let p = -3; p <= 3; p++) {
          ctx.fillRect(wallX - 3, cy + p * 30 - 2, 6, 4);
        }
      });

      // Micro-vacuoles in meristematic corners
      ctx.strokeStyle = isFluor ? "rgba(56, 189, 248, 0.25)" : "rgba(180, 83, 9, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(rx + 40, ry + 40, 24, 0, Math.PI * 2);
      ctx.arc(rx + pw - 40, ry + 40, 26, 0, Math.PI * 2);
      ctx.arc(rx + 40, ry + ph - 40, 25, 0, Math.PI * 2);
      ctx.arc(rx + pw - 40, ry + ph - 40, 28, 0, Math.PI * 2);
      ctx.stroke();

    } else {
      // Animal Cell: Flexible Plasma Membrane with Cortical Actin Cytoskeleton
      let rX = 155;
      let rY = 155;

      // Cell elongation in Anaphase/Telophase
      if (currentPhaseIdx === 3) {
        rX = 155 + phaseProgress * 22;
        rY = 155 - phaseProgress * 15;
      } else if (currentPhaseIdx === 4) {
        rX = 175;
        rY = 140;
      }

      if (currentPhaseIdx === 4) {
        // Animal Telophase: Deep Actin-Myosin Cleavage Furrow pinching inward
        const pinch = 30 + phaseProgress * 45;
        ctx.fillStyle = cytosolColor;
        ctx.strokeStyle = isFluor ? "#38bdf8" : "#ec4899";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx - 130, cy - 105);
        ctx.bezierCurveTo(cx - 50, cy - 105, cx - pinch, cy - 20, cx - pinch, cy);
        ctx.bezierCurveTo(cx - pinch, cy + 20, cx - 50, cy + 105, cx - 130, cy + 105);
        ctx.bezierCurveTo(cx - 210, cy + 95, cx - 210, cy - 95, cx - 130, cy - 105);
        ctx.moveTo(cx + 130, cy - 105);
        ctx.bezierCurveTo(cx + 50, cy - 105, cx + pinch, cy - 20, cx + pinch, cy);
        ctx.bezierCurveTo(cx + pinch, cy + 20, cx + 50, cy + 105, cx + 130, cy + 105);
        ctx.bezierCurveTo(cx + 210, cy + 95, cx + 210, cy - 95, cx + 130, cy - 105);
        ctx.fill();
        ctx.stroke();

        // Contractile Ring (Actin-Myosin II midbody constriction)
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 3.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cx, cy - 110);
        ctx.lineTo(cx, cy + 110);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        ctx.fillStyle = cytosolColor;
        ctx.strokeStyle = isFluor ? "#38bdf8" : "#ec4899";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rX, rY, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cortical Actin Microfilament Meshwork
        ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rX - 4, rY - 4, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // 4. Cytoplasmic Inclusions: Mitochondria & Dictyosomes (Ultra-realism)
    const mitoCoords = [
      { x: cx - 115, y: cy - 90, ang: 0.4 },
      { x: cx + 115, y: cy - 80, ang: -0.5 },
      { x: cx - 105, y: cy + 85, ang: -0.3 },
      { x: cx + 110, y: cy + 85, ang: 0.6 }
    ];
    mitoCoords.forEach(m => {
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(m.ang);
      ctx.fillStyle = isFluor ? "rgba(245, 158, 11, 0.45)" : "rgba(217, 119, 6, 0.35)";
      ctx.strokeStyle = isFluor ? "#fbbf24" : "#d97706";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(-10, -5, 20, 10, 5);
      ctx.fill();
      ctx.stroke();
      // Inner cristae folds
      ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-5, -3); ctx.lineTo(-5, 3);
      ctx.moveTo(0, -3); ctx.lineTo(0, 3);
      ctx.moveTo(5, -3); ctx.lineTo(5, 3);
      ctx.stroke();
      ctx.restore();
    });

    // 5. Centrosomes / MTOCs & Spindle Apparatus
    const leftPoleX = cx - 130;
    const rightPoleX = cx + 130;

    if (currentPhaseIdx >= 1 && currentPhaseIdx <= 3) {
      if (specimenType === "animal") {
        // Animal Cell: Amphiastral Spindle with Centrosomes & Orthogonal Centriole Pairs
        [leftPoleX, rightPoleX].forEach(posX => {
          // PCM Pericentriolar Material Glow
          const pcmGrad = ctx.createRadialGradient(posX, cy, 2, posX, cy, 16);
          pcmGrad.addColorStop(0, "rgba(250, 204, 21, 0.85)");
          pcmGrad.addColorStop(0.5, "rgba(245, 158, 11, 0.35)");
          pcmGrad.addColorStop(1, "transparent");
          ctx.fillStyle = pcmGrad;
          ctx.beginPath();
          ctx.arc(posX, cy, 16, 0, Math.PI * 2);
          ctx.fill();

          // Centriole pair (vertical mother, horizontal daughter)
          ctx.strokeStyle = "#fef08a";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(posX - 2, cy - 7); ctx.lineTo(posX - 2, cy + 7);
          ctx.moveTo(posX - 7, cy + 2); ctx.lineTo(posX + 7, cy + 2);
          ctx.stroke();

          // Astral Microtubules radiating outward
          ctx.strokeStyle = isFluor ? "rgba(52, 211, 153, 0.45)" : "rgba(245, 158, 11, 0.35)";
          ctx.lineWidth = 1;
          for (let a = 0; a < 8; a++) {
            const ang = (a / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(posX, cy);
            ctx.lineTo(posX + Math.cos(ang) * 26, cy + Math.sin(ang) * 26);
            ctx.stroke();
          }
        });
      } else {
        // Plant Cell (Allium cepa): Anastral Spindle! NO Centrioles!
        // Broad polar organizer caps (MTOCs) with gamma-tubulin ring complexes
        [leftPoleX, rightPoleX].forEach(posX => {
          ctx.strokeStyle = isFluor ? "rgba(52, 211, 153, 0.75)" : "rgba(217, 119, 6, 0.65)";
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.arc(posX, cy, 20, posX < cx ? -Math.PI / 2 : Math.PI / 2, posX < cx ? Math.PI / 2 : 3 * Math.PI / 2);
          ctx.stroke();

          // Polar Organizer gamma-TuRC nucleating centers
          ctx.fillStyle = "#34d399";
          for (let g = -3; g <= 3; g++) {
            ctx.beginPath();
            ctx.arc(posX, cy + g * 6, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      // Spindle Microtubules (K-fibers and Interpolar overlapping fibers)
      if (hasColchicine && currentPhaseIdx === 2) {
        // Colchicine depolymerizes tubulin into soluble heterodimers!
        ctx.fillStyle = isFluor ? "rgba(52, 211, 153, 0.7)" : "rgba(239, 68, 68, 0.7)";
        for (let t = 0; t < 55; t++) {
          const tx = cx - 120 + ((t * 29 + Math.sin(simTime + t) * 8) % 240);
          const ty = cy - 85 + ((t * 23 + Math.cos(simTime + t) * 8) % 170);
          ctx.fillRect(tx, ty, 3, 3);
        }
      } else {
        // Continuous healthy spindle fibers
        ctx.strokeStyle = isFluor ? "rgba(16, 185, 129, 0.5)" : "rgba(245, 158, 11, 0.45)";
        ctx.lineWidth = 1.4;
        for (let f = -5; f <= 5; f++) {
          ctx.beginPath();
          ctx.moveTo(leftPoleX, cy);
          ctx.quadraticCurveTo(cx, cy + f * 26, rightPoleX, cy);
          ctx.stroke();
        }
      }
    }

    // 6. Chromatin / Chromosome Cytological Dynamics by Mitotic Phase
    if (currentPhaseIdx === 0) {
      // ==========================================
      // PHASE 0: INTERPHASE (G₁, S, G₂)
      // ==========================================
      const nucR = 86;

      // Double Nuclear Envelope (Outer & Inner Membraneous Bilayers)
      ctx.strokeStyle = isFluor ? "#38bdf8" : "#831843";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, nucR, 0, Math.PI * 2);
      ctx.stroke();

      // Inner Nuclear Lamina meshwork
      ctx.strokeStyle = isFluor ? "rgba(56, 189, 248, 0.4)" : "rgba(131, 24, 67, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, nucR - 3, 0, Math.PI * 2);
      ctx.stroke();

      // 16 Octagonal Nuclear Pore Complexes (NPCs) with Central Transporters
      for (let n = 0; n < 16; n++) {
        const ang = (n / 16) * Math.PI * 2;
        const nx = cx + Math.cos(ang) * nucR;
        const ny = cy + Math.sin(ang) * nucR;
        ctx.fillStyle = isFluor ? "#7dd3fc" : "#be185d";
        ctx.beginPath();
        ctx.arc(nx, ny, 2.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Nucleoplasm Background Glow
      const nucGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, nucR);
      nucGrad.addColorStop(0, isFluor ? "rgba(56, 189, 248, 0.18)" : "rgba(190, 24, 93, 0.16)");
      nucGrad.addColorStop(1, isFluor ? "rgba(14, 165, 233, 0.05)" : "rgba(131, 24, 67, 0.05)");
      ctx.fillStyle = nucGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, nucR - 2, 0, Math.PI * 2);
      ctx.fill();

      // Dense Spherical Nucleolus (rRNA transcription & ribosome subunit assembly)
      const nucCore = ctx.createRadialGradient(cx - 24, cy - 18, 3, cx - 24, cy - 18, 19);
      nucCore.addColorStop(0, isFluor ? "#bae6fd" : "#f472b6");
      nucCore.addColorStop(0.5, isFluor ? "#0284c7" : "#be185d");
      nucCore.addColorStop(1, isFluor ? "#0369a1" : "#831843");
      ctx.fillStyle = nucCore;
      ctx.beginPath();
      ctx.arc(cx - 24, cy - 18, 19, 0, Math.PI * 2);
      ctx.fill();

      // Internal Fibrillar Center (FC) speckles
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.beginPath();
      ctx.arc(cx - 28, cy - 22, 2.5, 0, Math.PI * 2);
      ctx.arc(cx - 20, cy - 16, 2, 0, Math.PI * 2);
      ctx.fill();

      // Realistic Diffuse Chromatin Network (Euchromatin threads + Heterochromatin condensations)
      ctx.strokeStyle = isFluor ? "rgba(56, 189, 248, 0.65)" : "rgba(157, 23, 77, 0.65)";
      ctx.lineWidth = 1.8;
      for (let w = 0; w < 7; w++) {
        ctx.beginPath();
        const baseAng = (w / 7) * Math.PI * 2;
        for (let s = 0; s <= 24; s++) {
          const t = s / 24;
          const rad = 15 + t * 62;
          const drift = Math.sin(simTime * 0.8 + w * 2 + s * 0.4) * 4;
          const a = baseAng + t * 3.2 + drift * 0.05;
          const px = cx + Math.cos(a) * rad;
          const py = cy + Math.sin(a) * rad;
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Dense Heterochromatin aggregates (Constitutive centromeric/telomeric clusters)
      ctx.fillStyle = isFluor ? "rgba(14, 165, 233, 0.85)" : "rgba(131, 24, 67, 0.85)";
      for (let h = 0; h < 24; h++) {
        const hAng = (h / 24) * Math.PI * 2 + h * 0.3;
        const hR = 25 + ((h * 17) % 52);
        const hx = cx + Math.cos(hAng) * hR;
        const hy = cy + Math.sin(hAng) * hR;
        const dNuc = Math.hypot(hx - (cx - 24), hy - (cy - 18));
        if (dNuc > 22) {
          ctx.beginPath();
          ctx.arc(hx, hy, 2.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // S-Phase DNA Replication Activity luminescence
      ctx.fillStyle = "rgba(56, 189, 248, 0.08)";
      const repPulse = 0.5 + 0.5 * Math.sin(simTime * 2);
      ctx.beginPath();
      ctx.arc(cx, cy, 55 + repPulse * 12, 0, Math.PI * 2);
      ctx.fill();

    } else if (currentPhaseIdx === 1) {
      // ==========================================
      // PHASE 1: PROPHASE & PROMETAPHASE
      // ==========================================
      // Disintegrating Nuclear Envelope (Phosphorylated Lamin Fenestration)
      const fenestrationDash = 8 + phaseProgress * 12;
      ctx.strokeStyle = isFluor ? `rgba(56, 189, 248, ${0.45 - phaseProgress * 0.35})` : `rgba(131, 24, 67, ${0.45 - phaseProgress * 0.35})`;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, fenestrationDash]);
      ctx.beginPath();
      ctx.arc(cx, cy, 86, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Dissolving nuclear membrane vesicle remnants
      for (let v = 0; v < 14; v++) {
        const vang = (v / 14) * Math.PI * 2 + simTime * 0.1;
        const vR = 86 + phaseProgress * 25 * Math.sin(v);
        const vx = cx + Math.cos(vang) * vR;
        const vy = cy + Math.sin(vang) * vR;
        ctx.fillStyle = isFluor ? "#38bdf8" : "#831843";
        ctx.beginPath();
        ctx.arc(vx, vy, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4 Pairs of Homologous Condensed Chromosomes (2n = 4 demonstrated)
      // Progressively condensing and coiling as phaseProgress advances
      const armThickness = 4.5 + phaseProgress * 2.2;
      const chromCoords = [
        { x: cx - 44, y: cy - 42, ang: 0.35, len: 44, bend: 3 },
        { x: cx + 46, y: cy - 38, ang: -0.42, len: 40, bend: -3 },
        { x: cx - 40, y: cy + 44, ang: -0.25, len: 42, bend: 4 },
        { x: cx + 42, y: cy + 46, ang: 0.55, len: 36, bend: -2 }
      ];

      chromCoords.forEach(pos => {
        drawAnatomicalChromosome(ctx, pos.x, pos.y, pos.ang, pos.len, armThickness, pos.bend, dnaMain, dnaHighlight, kinetoColor, 0);
      });

    } else if (currentPhaseIdx === 2) {
      // ==========================================
      // PHASE 2: METAPHASE & SPINDLE ASSEMBLY CHECKPOINT (SAC)
      // ==========================================
      // Equatorial Metaphase Plate Reference Axis
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, cy - 125);
      ctx.lineTo(cx, cy + 125);
      ctx.stroke();
      ctx.setLineDash([]);

      // 4 Anatomical Homologous Chromosomes congressed single-file along the equator
      const metaphaseYPositions = [cy - 68, cy - 23, cy + 23, cy + 68];
      const chromLengths = [44, 50, 46, 40];

      metaphaseYPositions.forEach((yPos, idx) => {
        // Microscopic bipolar tension breathing oscillation
        const tensionOsc = Math.sin(simTime * 3.0 + idx) * 1.8;
        const xPos = cx + (hasColchicine ? tensionOsc * 4 : tensionOsc);

        // Draw chromosome with paired sister chromatids aligned along metaphase plate
        const armLen = chromLengths[idx];
        drawAnatomicalChromosome(ctx, xPos, yPos, Math.PI / 2, armLen, 6.5, 0, dnaMain, dnaHighlight, kinetoColor, hasColchicine ? 0 : 1.2);

        // Kinetochore coordinates
        const leftKinetoX = xPos - 5.5;
        const rightKinetoX = xPos + 5.5;

        // K-fiber tension tethers connecting to opposite spindle poles
        if (!hasColchicine) {
          ctx.strokeStyle = isFluor ? "rgba(250, 204, 21, 0.75)" : "rgba(217, 119, 6, 0.65)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(leftPoleX, cy);
          ctx.lineTo(leftKinetoX, yPos);
          ctx.moveTo(rightPoleX, cy);
          ctx.lineTo(rightKinetoX, yPos);
          ctx.stroke();

          // Green mechanical tension satisfaction glow at kinetochores
          ctx.strokeStyle = "#10b981";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(leftKinetoX, yPos, 6, 0, Math.PI * 2);
          ctx.arc(rightKinetoX, yPos, 6, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          // Under Colchicine: Mad2/BubR1 checkpoint sensor recruitment (pulsing red)
          const sacPulse = 0.5 + 0.5 * Math.sin(simTime * 6);
          ctx.strokeStyle = `rgba(239, 68, 68, ${sacPulse})`;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(leftKinetoX, yPos, 7.5, 0, Math.PI * 2);
          ctx.arc(rightKinetoX, yPos, 7.5, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      if (hasColchicine) {
        ctx.fillStyle = "#ef4444";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("⚠️ SPINDLE ASSEMBLY CHECKPOINT (SAC) ARREST: LACK OF TENSION", cx, cy + 138);
      }

    } else if (currentPhaseIdx === 3) {
      // ==========================================
      // PHASE 3: ANAPHASE (A & B DISJUNCTION)
      // ==========================================
      // Separation distance increases continuously with phaseProgress
      const sep = 26 + phaseProgress * 82;
      const anaphaseYPositions = [cy - 64, cy - 21, cy + 21, cy + 64];
      const armLengths = [38, 44, 40, 34];

      anaphaseYPositions.forEach((yPos, idx) => {
        const len = armLengths[idx];

        // Left migrating daughter chromosome (V-shape with apex leading toward left pole)
        const leftApexX = cx - sep;
        ctx.save();
        ctx.strokeStyle = dnaMain;
        ctx.lineWidth = 6.2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(leftApexX + len * 0.45, yPos - len * 0.35);
        ctx.lineTo(leftApexX, yPos);
        ctx.lineTo(leftApexX + len * 0.45, yPos + len * 0.35);
        ctx.stroke();

        // Highlight inner core
        ctx.strokeStyle = dnaHighlight;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(leftApexX + len * 0.45 - 2, yPos - len * 0.35 + 2);
        ctx.lineTo(leftApexX, yPos);
        ctx.lineTo(leftApexX + len * 0.45 - 2, yPos + len * 0.35 - 2);
        ctx.stroke();

        // Kinetochore at the apex leading the poleward charge
        ctx.fillStyle = kinetoColor;
        ctx.beginPath();
        ctx.arc(leftApexX, yPos, 3.8, 0, Math.PI * 2);
        ctx.fill();

        // Shortening K-fiber pulling poleward (Anaphase A)
        ctx.strokeStyle = isFluor ? "rgba(16, 185, 129, 0.65)" : "rgba(245, 158, 11, 0.55)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(leftPoleX, cy);
        ctx.lineTo(leftApexX, yPos);
        ctx.stroke();
        ctx.restore();

        // Right migrating daughter chromosome (V-shape with apex leading toward right pole)
        const rightApexX = cx + sep;
        ctx.save();
        ctx.strokeStyle = dnaMain;
        ctx.lineWidth = 6.2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(rightApexX - len * 0.45, yPos - len * 0.35);
        ctx.lineTo(rightApexX, yPos);
        ctx.lineTo(rightApexX - len * 0.45, yPos + len * 0.35);
        ctx.stroke();

        // Highlight inner core
        ctx.strokeStyle = dnaHighlight;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(rightApexX - len * 0.45 + 2, yPos - len * 0.35 + 2);
        ctx.lineTo(rightApexX, yPos);
        ctx.lineTo(rightApexX - len * 0.45 + 2, yPos + len * 0.35 - 2);
        ctx.stroke();

        // Kinetochore at the apex
        ctx.fillStyle = kinetoColor;
        ctx.beginPath();
        ctx.arc(rightApexX, yPos, 3.8, 0, Math.PI * 2);
        ctx.fill();

        // Shortening K-fiber pulling poleward (Anaphase A)
        ctx.strokeStyle = isFluor ? "rgba(16, 185, 129, 0.65)" : "rgba(245, 158, 11, 0.55)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(rightPoleX, cy);
        ctx.lineTo(rightApexX, yPos);
        ctx.stroke();
        ctx.restore();
      });

      // Interpolar Microtubules sliding past each other (Anaphase B spindle elongation)
      ctx.strokeStyle = isFluor ? "rgba(52, 211, 153, 0.4)" : "rgba(245, 158, 11, 0.4)";
      ctx.lineWidth = 1.4;
      for (let s = -2; s <= 2; s++) {
        ctx.beginPath();
        ctx.moveTo(cx - 35, cy + s * 18);
        ctx.lineTo(cx + 35, cy + s * 18);
        ctx.stroke();
      }

    } else if (currentPhaseIdx === 4) {
      // ==========================================
      // PHASE 4: TELOPHASE & CYTOKINESIS
      // ==========================================
      [-105, 105].forEach(dx => {
        const dNucX = cx + dx;
        const dNucR = 48;

        // Reforming Nuclear Envelopes (Vesicle coalescence)
        ctx.strokeStyle = isFluor ? "#38bdf8" : "#831843";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(dNucX, cy, dNucR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Internal Decondensing Chromatin Network
        ctx.strokeStyle = isFluor ? "rgba(56, 189, 248, 0.65)" : "rgba(157, 23, 77, 0.65)";
        ctx.lineWidth = 1.8;
        for (let c = 0; c < 10; c++) {
          const ang = (c / 10) * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(dNucX + Math.cos(ang) * 18, cy + Math.sin(ang) * 18, 5, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Emerging Nucleolus in each daughter nucleus
        ctx.fillStyle = isFluor ? "#0284c7" : "#be185d";
        ctx.beginPath();
        ctx.arc(dNucX - 8, cy - 8, 9, 0, Math.PI * 2);
        ctx.fill();
      });

      // Cytokinesis Mechanism:
      if (specimenType === "plant") {
        // Plant Cytokinesis: Phragmoplast & Cell Plate Formation
        // Barrel-shaped phragmoplast microtubules at the equator
        ctx.strokeStyle = isFluor ? "rgba(52, 211, 153, 0.6)" : "rgba(245, 158, 11, 0.55)";
        ctx.lineWidth = 1.6;
        for (let p = -5; p <= 5; p++) {
          ctx.beginPath();
          ctx.moveTo(cx - 18, cy + p * 16);
          ctx.lineTo(cx + 18, cy + p * 16);
          ctx.stroke();
        }

        // Golgi-derived pectin vesicles fusing centrifugal from center outward
        const plateHeight = 70 + phaseProgress * 110;
        ctx.strokeStyle = isFluor ? "#34d399" : "#fbbf24";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx, cy - plateHeight / 2);
        ctx.lineTo(cx, cy + plateHeight / 2);
        ctx.stroke();

        // Pectin Vesicle beads fusing into the nascent plate
        ctx.fillStyle = "#fef08a";
        for (let v = -4; v <= 4; v++) {
          ctx.beginPath();
          ctx.arc(cx, cy + v * (plateHeight / 9), 2.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 7. Interactive Hover Cursor & Real-time Organelle Hit-Testing
    if (canvasMouse.isOver) {
      const mx = canvasMouse.x;
      const my = canvasMouse.y;
      const distFromCenter = Math.hypot(mx - cx, my - cy);

      let hitInfo = null;

      if (currentPhaseIdx === 0 && Math.hypot(mx - (cx - 24), my - (cy - 18)) < 24) {
        hitInfo = {
          title: "Dense Nucleolus",
          desc: "Site of pre-rRNA transcription (rDNA loops) and 40S/60S ribosome assembly.",
          tag: "Ribosome Factory"
        };
      } else if (currentPhaseIdx === 0 && distFromCenter < 86) {
        hitInfo = {
          title: "Diffuse Chromatin & Heterochromatin",
          desc: "Uncondensed nucleoprotein fibers (DNA wound around histone octamers); S-phase replication complete.",
          tag: "Genome (2n)"
        };
      } else if (currentPhaseIdx === 2 && Math.abs(mx - cx) < 24 && Math.abs(my - cy) < 95) {
        hitInfo = {
          title: "Metaphase Chromosome & Kinetochore",
          desc: hasColchicine ? "Colchicine depolymerized tubulin; SAC active due to absence of mechanical tension." : "Cohesin rings hold sister chromatids; kinetochores experience ~35 pN bipolar spindle tension.",
          tag: hasColchicine ? "SAC Halted" : "Bi-Oriented Tension"
        };
      } else if (currentPhaseIdx === 3 && (Math.hypot(mx - (cx - 75), my - cy) < 45 || Math.hypot(mx - (cx + 75), my - cy) < 45)) {
        hitInfo = {
          title: "Disjoined Daughter Chromosomes",
          desc: "Separase cleaved cohesin rings; K-fibers depolymerize at plus-ends, pulling V-shaped chromatids poleward.",
          tag: "Anaphase Disjunction"
        };
      } else if (currentPhaseIdx === 4 && specimenType === "plant" && Math.abs(mx - cx) < 24) {
        hitInfo = {
          title: "Phragmoplast & Developing Cell Plate",
          desc: "Golgi-derived vesicles carry pectin and hemicellulose, fusing centrifugal-outward to build the new middle lamella.",
          tag: "Plant Cytokinesis"
        };
      } else if (Math.hypot(mx - leftPoleX, my - cy) < 28 || Math.hypot(mx - rightPoleX, my - cy) < 28) {
        hitInfo = {
          title: specimenType === "animal" ? "Centrosome & Centriole Pair" : "Polar Organizer MTOC",
          desc: specimenType === "animal" ? "Perpendicular centrioles nucleating astral and spindle microtubules." : "Plant anastral spindle pole containing γ-TuRC nucleating complexes.",
          tag: "Spindle Pole"
        };
      } else if (distFromCenter < ocularR - 10) {
        hitInfo = {
          title: specimenType === "plant" ? "Allium cepa Meristematic Cytoplasm" : "Eukaryotic Somatic Cytosol",
          desc: "High metabolic density with mitochondria, ribosomes, and cytoskeletal motor proteins.",
          tag: "Cytosol"
        };
      }

      if (hitInfo && inspectTitle && inspectDesc && inspectTag) {
        inspectTitle.textContent = `🔬 ${hitInfo.title}`;
        inspectDesc.textContent = hitInfo.desc;
        inspectTag.textContent = hitInfo.tag;
        inspectTag.style.background = "rgba(16, 185, 129, 0.2)";
        inspectTag.style.color = "#34d399";

        // Draw reticle target circle on canvas
        ctx.strokeStyle = "rgba(56, 189, 248, 0.85)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(mx, my, 12, 0, Math.PI * 2);
        ctx.moveTo(mx - 16, my); ctx.lineTo(mx + 16, my);
        ctx.moveTo(mx, my - 16); ctx.lineTo(mx, my + 16);
        ctx.stroke();
      }
    }

    ctx.restore(); // Restore clip

    // 8. Optical Scale Bar & Microscope Specification (Left Stage HUD - Unobstructed by Inspector)
    const hudX = 24;
    const hudY = 370;
    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(hudX, hudY, 192, 58, 6);
    ctx.fill();
    ctx.stroke();

    // Scale bar (10 µm)
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hudX + 12, hudY + 18); ctx.lineTo(hudX + 52, hudY + 18);
    ctx.moveTo(hudX + 12, hudY + 14); ctx.lineTo(hudX + 12, hudY + 22);
    ctx.moveTo(hudX + 52, hudY + 14); ctx.lineTo(hudX + 52, hudY + 22);
    ctx.stroke();

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "left";
    ctx.fillText("10 µm", hudX + 60, hudY + 21);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "9px monospace";
    ctx.fillText("100× Plan-Apo (N.A. 1.40 Oil)", hudX + 12, hudY + 36);
    ctx.fillStyle = fineFocus === 0 ? "#34d399" : "#fbbf24";
    ctx.fillText(`Z-Plane: ${fineFocus >= 0 ? "+" : ""}${fineFocus.toFixed(1)} µm ${fineFocus === 0 ? "(In Focus)" : ""}`, hudX + 12, hudY + 49);
    ctx.restore();
  }

  // Draw 60 FPS Authentic Allium Cepa Meristem Histology Grid
  function drawHistologyGrid() {
    if (!ctx) return;
    const isFluor = stainingMode === "fluorescence";

    // Canvas background
    ctx.fillStyle = isFluor ? "#030712" : "#fefce8";
    ctx.fillRect(0, 0, logicalW, logicalH);

    // Grid Metrics (6 rows × 8 cols = 48 cells)
    const marginX = 40;
    const marginY = 50;
    const cellW = 105;
    const cellH = 68;

    histologyCells.forEach((c) => {
      const gx = marginX + c.col * cellW;
      const gy = marginY + c.row * cellH;

      const isFilteredOut = histoFilter !== "all" && c.actualPhase !== histoFilter;
      const isSelected = selectedHistoCell?.id === c.id;

      ctx.save();
      if (isFilteredOut) {
        ctx.globalAlpha = 0.2;
      }

      // Cell Wall (Allium Cepa rectangular meristem with biological morphology)
      ctx.strokeStyle = isFluor ? "#047857" : "#b45309";
      ctx.lineWidth = 3;
      ctx.fillStyle = isFluor ? "rgba(6, 78, 59, 0.15)" : "rgba(254, 243, 199, 0.7)";
      ctx.beginPath();
      ctx.roundRect(gx + 2 + c.wallJitterX, gy + 2 + c.wallJitterY, cellW - 4, cellH - 4, 6);
      ctx.fill();
      ctx.stroke();

      // Selected cell highlight aura
      if (isSelected) {
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(gx - 1, gy - 1, cellW + 2, cellH + 2, 8);
        ctx.stroke();
      }

      // Cell Number
      ctx.fillStyle = isFluor ? "#6ee7b7" : "#78350f";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`#${c.id}`, gx + 6, gy + 14);

      // Phase-specific Cytological Feature
      const midX = gx + cellW / 2;
      const midY = gy + cellH / 2 + 2;

      if (c.actualPhase === "interphase") {
        // Intact nucleus with nucleolus
        ctx.fillStyle = isFluor ? "rgba(56, 189, 248, 0.45)" : "rgba(157, 23, 77, 0.5)";
        ctx.beginPath();
        ctx.arc(midX, midY, 18, 0, Math.PI * 2);
        ctx.fill();

        // Dense nucleolus
        ctx.fillStyle = isFluor ? "#38bdf8" : "#831843";
        ctx.beginPath();
        ctx.arc(midX + c.nucleolusOffset, midY + c.nucleolusOffset, 5, 0, Math.PI * 2);
        ctx.fill();

      } else if (c.actualPhase === "prophase") {
        // Condensed coiled chromosomes inside fading nuclear envelope
        ctx.strokeStyle = isFluor ? "#f59e0b" : "#9d174d";
        ctx.lineWidth = 2;
        for (let k = 0; k < 4; k++) {
          ctx.beginPath();
          ctx.arc(midX + (k - 1.5) * 6, midY + Math.sin(k) * 4, 8, 0, Math.PI);
          ctx.stroke();
        }

      } else if (c.actualPhase === "metaphase") {
        // Dense equatorial plate of chromosomes
        ctx.strokeStyle = isFluor ? "#818cf8" : "#831843";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(midX, midY - 18);
        ctx.lineTo(midX, midY + 18);
        ctx.stroke();

      } else if (c.actualPhase === "anaphase") {
        // Two distinct migrating V-shaped daughter chromosome groups
        ctx.strokeStyle = isFluor ? "#f43f5e" : "#831843";
        ctx.lineWidth = 2.5;
        [-10, 10].forEach(ox => {
          ctx.beginPath();
          ctx.moveTo(midX + ox - 4, midY - 12);
          ctx.lineTo(midX + ox + 3, midY);
          ctx.lineTo(midX + ox - 4, midY + 12);
          ctx.stroke();
        });

      } else if (c.actualPhase === "telophase") {
        // Two reforming polar nuclei with central cell plate line
        ctx.fillStyle = isFluor ? "rgba(56, 189, 248, 0.4)" : "rgba(157, 23, 77, 0.4)";
        ctx.beginPath();
        ctx.arc(midX - 16, midY, 10, 0, Math.PI * 2);
        ctx.arc(midX + 16, midY, 10, 0, Math.PI * 2);
        ctx.fill();

        // Nascent Cell Plate (Phragmoplast)
        ctx.strokeStyle = isFluor ? "#10b981" : "#d97706";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(midX, midY - 14);
        ctx.lineTo(midX, midY + 14);
        ctx.stroke();
      }

      ctx.restore();
    });

    // 1000× Oil Immersion Loupe over Hovered Histological Cell
    if (canvasMouse.isOver) {
      const hCell = getHistologyCellAt(canvasMouse.x, canvasMouse.y);
      if (hCell) {
        const lx = canvasMouse.x;
        const ly = canvasMouse.y;
        const lRadius = 55;

        ctx.save();
        ctx.beginPath();
        ctx.arc(lx, ly, lRadius, 0, Math.PI * 2);
        ctx.clip();

        // Loupe Background
        ctx.fillStyle = isFluor ? "#020617" : "#fffbeb";
        ctx.fill();

        // Magnified view of cell
        ctx.translate(lx, ly);
        ctx.scale(2.2, 2.2);
        ctx.translate(-lx, -ly);

        // Render high-mag cell detail
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.strokeRect(lx - 25, ly - 18, 50, 36);

        ctx.restore();

        // Loupe Brass Frame
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(lx, ly, lRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Mini Label
        ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
        ctx.fillRect(lx - 40, ly + lRadius - 6, 80, 18);
        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`1000× Cell #${hCell.id}`, lx, ly + lRadius + 7);
      }
    }
  }

  function getHistologyCellAt(mx, my) {
    const marginX = 40;
    const marginY = 50;
    const cellW = 105;
    const cellH = 68;

    const col = Math.floor((mx - marginX) / cellW);
    const row = Math.floor((my - marginY) / cellH);

    if (col >= 0 && col < 8 && row >= 0 && row < 6) {
      const idx = row * 8 + col;
      return histologyCells[idx] || null;
    }
    return null;
  }

  // Animation Loop
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
        phaseProgress += (dt * animSpeed * 0.35);
        if (phaseProgress >= 1.0) {
          if (playMode === "step") {
            phaseProgress = 1.0;
            isPlaying = false;
            if (playBtn) {
              playBtn.innerHTML = `<span>▶</span> Play Cell Cycle`;
              playBtn.className = "btn btn-secondary btn-sm";
            }
          } else {
            phaseProgress = 0.0;
            currentPhaseIdx = (currentPhaseIdx + 1) % PHASES.length;
            updatePhaseJumpPills();
            SoundFX.playClick();
          }
        }
        updateScrubberUI();
      }
    }

    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : Math.min(window.devicePixelRatio || 1, 2);
    ctx.save();
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, logicalW, logicalH);

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

  function updateScrubberUI() {
    if (sliderPhaseProgress) {
      sliderPhaseProgress.value = Math.round(phaseProgress * 100);
    }
    if (lblPhaseProgress) {
      lblPhaseProgress.textContent = `${Math.round(phaseProgress * 100)}%`;
    }
    if (badgePhaseProgressPct) {
      badgePhaseProgressPct.textContent = `${Math.round(phaseProgress * 100)}% Complete`;
    }
  }

  function updatePhaseJumpPills() {
    document.querySelectorAll(".phase-jump-btn").forEach(btn => {
      const idx = parseInt(btn.getAttribute("data-phase"), 10);
      if (idx === currentPhaseIdx) {
        btn.classList.add("active");
        btn.style.background = "rgba(56, 189, 248, 0.25)";
        btn.style.borderColor = "#38bdf8";
        btn.style.color = "#ffffff";
        btn.style.fontWeight = "700";
      } else {
        btn.classList.remove("active");
        btn.style.background = "rgba(30, 41, 59, 0.6)";
        btn.style.borderColor = "rgba(255, 255, 255, 0.12)";
        btn.style.color = "#cbd5e1";
        btn.style.fontWeight = "600";
      }
    });

    const curPhase = PHASES[currentPhaseIdx];
    if (badgePhaseDot) badgePhaseDot.style.background = curPhase.color;
    if (badgePhaseText) {
      badgePhaseText.textContent = curPhase.shortName.toUpperCase();
      badgePhaseText.style.color = curPhase.color;
    }

    updateScrubberUI();
    updateEventsCard();
    updateTable();
  }

  // Mouse / Touch Event Listeners on Canvas
  canvas?.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = logicalW / rect.width;
    const scaleY = logicalH / rect.height;
    canvasMouse.x = (e.clientX - rect.left) * scaleX;
    canvasMouse.y = (e.clientY - rect.top) * scaleY;
    canvasMouse.isOver = true;
  });

  canvas?.addEventListener("mouseleave", () => {
    canvasMouse.isOver = false;
  });

  canvas?.addEventListener("click", (e) => {
    if (activeTab === "histology") {
      const rect = canvas.getBoundingClientRect();
      const scaleX = logicalW / rect.width;
      const scaleY = logicalH / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;

      const clicked = getHistologyCellAt(mx, my);
      if (clicked) {
        selectedHistoCell = clicked;
        if (histoPromptText) {
          histoPromptText.innerHTML = `Diagnosing <strong>Cell #${clicked.id}</strong> (Row ${clicked.row + 1}, Col ${clicked.col + 1}): Select its mitotic phase:`;
        }
        if (histoFeedbackBanner) histoFeedbackBanner.style.display = "none";
        SoundFX.playClick();
      }
    }
  });

  // Mode Tabs Switching
  btnTabAnim?.addEventListener("click", () => {
    activeTab = "animator";
    btnTabAnim.classList.add("active");
    btnTabAnim.style.border = "1px solid #10b981";
    btnTabAnim.style.color = "#10b981";
    btnTabHisto.classList.remove("active");
    btnTabHisto.style.border = "1px solid var(--border-color)";
    btnTabHisto.style.color = "#cbd5e1";

    if (livePhaseBadge) livePhaseBadge.style.display = "flex";
    if (histoToolbar) histoToolbar.style.display = "none";
    if (histoChallengeCard) histoChallengeCard.style.display = "none";
    if (organelleInspectorBox) organelleInspectorBox.style.display = "flex";
    SoundFX.playClick();
  });

  btnTabHisto?.addEventListener("click", () => {
    activeTab = "histology";
    btnTabHisto.classList.add("active");
    btnTabHisto.style.border = "1px solid #10b981";
    btnTabHisto.style.color = "#10b981";
    btnTabAnim.classList.remove("active");
    btnTabAnim.style.border = "1px solid var(--border-color)";
    btnTabAnim.style.color = "#cbd5e1";

    if (livePhaseBadge) livePhaseBadge.style.display = "none";
    if (histoToolbar) histoToolbar.style.display = "flex";
    if (histoChallengeCard) histoChallengeCard.style.display = "block";
    if (organelleInspectorBox) organelleInspectorBox.style.display = "none";
    SoundFX.playClick();
  });

  // Specimen Architecture Switcher (Plant vs Animal)
  btnSpecimenPlant?.addEventListener("click", () => {
    specimenType = "plant";
    btnSpecimenPlant.classList.add("active");
    btnSpecimenPlant.style.background = "#10b981";
    btnSpecimenPlant.style.color = "#022c22";
    btnSpecimenPlant.style.fontWeight = "700";

    btnSpecimenAnimal.classList.remove("active");
    btnSpecimenAnimal.style.background = "transparent";
    btnSpecimenAnimal.style.color = "#cbd5e1";
    btnSpecimenAnimal.style.fontWeight = "600";

    if (bioStatusText) bioStatusText.textContent = "Anastral Spindle • Phragmoplast Active";
    updateEventsCard();
    SoundFX.playClick();
  });

  btnSpecimenAnimal?.addEventListener("click", () => {
    specimenType = "animal";
    btnSpecimenAnimal.classList.add("active");
    btnSpecimenAnimal.style.background = "#38bdf8";
    btnSpecimenAnimal.style.color = "#082f49";
    btnSpecimenAnimal.style.fontWeight = "700";

    btnSpecimenPlant.classList.remove("active");
    btnSpecimenPlant.style.background = "transparent";
    btnSpecimenPlant.style.color = "#cbd5e1";
    btnSpecimenPlant.style.fontWeight = "600";

    if (bioStatusText) bioStatusText.textContent = "Amphiastral Spindle • Cleavage Furrow Active";
    updateEventsCard();
    SoundFX.playClick();
  });

  // Optical Staining Switcher (Confocal vs Acetocarmine)
  btnStainFluor?.addEventListener("click", () => {
    stainingMode = "fluorescence";
    btnStainFluor.classList.add("active");
    btnStainFluor.style.background = "#38bdf8";
    btnStainFluor.style.color = "#082f49";
    btnStainFluor.style.fontWeight = "700";

    btnStainAceto.classList.remove("active");
    btnStainAceto.style.background = "transparent";
    btnStainAceto.style.color = "#cbd5e1";
    btnStainAceto.style.fontWeight = "600";
    SoundFX.playClick();
  });

  btnStainAceto?.addEventListener("click", () => {
    stainingMode = "acetocarmine";
    btnStainAceto.classList.add("active");
    btnStainAceto.style.background = "#f43f5e";
    btnStainAceto.style.color = "#ffffff";
    btnStainAceto.style.fontWeight = "700";

    btnStainFluor.classList.remove("active");
    btnStainFluor.style.background = "transparent";
    btnStainFluor.style.color = "#cbd5e1";
    btnStainFluor.style.fontWeight = "600";
    SoundFX.playClick();
  });

  // Histology Filter Toolbar Buttons
  const histoFilterColors = {
    all: "#10b981",
    interphase: "#94a3b8",
    prophase: "#f59e0b",
    metaphase: "#818cf8",
    anaphase: "#f43f5e",
    telophase: "#10b981"
  };

  document.querySelectorAll(".histo-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".histo-filter-btn").forEach(b => {
        b.classList.remove("active");
        b.style.background = "transparent";
        b.style.fontWeight = "normal";
        const filterKey = b.getAttribute("data-filter") || "all";
        b.style.color = filterKey === "all" ? "#cbd5e1" : (histoFilterColors[filterKey] || "#cbd5e1");
      });
      btn.classList.add("active");
      btn.style.background = "#10b981";
      btn.style.color = "#022c22";
      btn.style.fontWeight = "700";

      histoFilter = btn.getAttribute("data-filter") || "all";
      SoundFX.playClick();
    });
  });

  // Histology Diagnostic Quiz Classification Buttons
  document.querySelectorAll(".btn-classify").forEach(btn => {
    btn.addEventListener("click", () => {
      const chosenPhase = btn.getAttribute("data-phase");
      const targetCell = selectedHistoCell || histologyCells[0];

      if (targetCell && histoFeedbackBanner) {
        studentScore.total++;
        const isCorrect = targetCell.actualPhase === chosenPhase;
        if (isCorrect) studentScore.correct++;

        if (histoScoreBadge) {
          const pct = Math.round((studentScore.correct / studentScore.total) * 100);
          histoScoreBadge.textContent = `Score: ${studentScore.correct}/${studentScore.total} (${pct}%)`;
        }

        histoFeedbackBanner.style.display = "block";
        if (isCorrect) {
          histoFeedbackBanner.style.background = "rgba(16, 185, 129, 0.15)";
          histoFeedbackBanner.style.border = "1px solid #10b981";
          histoFeedbackBanner.style.color = "#34d399";
          histoFeedbackBanner.innerHTML = `✓ <strong>Correct!</strong> Cell #${targetCell.id} is in <em>${chosenPhase.toUpperCase()}</em>.`;
          SoundFX.playPing();
        } else {
          histoFeedbackBanner.style.background = "rgba(244, 63, 94, 0.15)";
          histoFeedbackBanner.style.border = "1px solid #f43f5e";
          histoFeedbackBanner.style.color = "#fca5a5";
          histoFeedbackBanner.innerHTML = `✕ <strong>Incorrect:</strong> You selected ${chosenPhase}, but Cell #${targetCell.id} is in <em>${targetCell.actualPhase.toUpperCase()}</em>.`;
          SoundFX.playBeep();
        }
      }
    });
  });

  // Playback Controls (Auto-Mode vs Manual Step Mode)
  playBtn?.addEventListener("click", () => {
    isPlaying = !isPlaying;
    if (isPlaying) {
      playMode = "cycle";
      playBtn.innerHTML = `<span>⏸</span> Pause Cycle`;
      playBtn.className = "btn btn-primary btn-sm";
    } else {
      playBtn.innerHTML = `<span>▶</span> Play Cell Cycle`;
      playBtn.className = "btn btn-secondary btn-sm";
    }
    SoundFX.playClick();
  });

  stepPrevBtn?.addEventListener("click", () => {
    isPlaying = false;
    playBtn.innerHTML = `<span>▶</span> Play Cell Cycle`;
    playBtn.className = "btn btn-secondary btn-sm";
    currentPhaseIdx = (currentPhaseIdx - 1 + PHASES.length) % PHASES.length;
    phaseProgress = 0.0;
    updatePhaseJumpPills();
    SoundFX.playClick();
  });

  stepNextBtn?.addEventListener("click", () => {
    isPlaying = false;
    playBtn.innerHTML = `<span>▶</span> Play Cell Cycle`;
    playBtn.className = "btn btn-secondary btn-sm";
    currentPhaseIdx = (currentPhaseIdx + 1) % PHASES.length;
    phaseProgress = 0.0;
    updatePhaseJumpPills();
    SoundFX.playClick();
  });

  // Phase Jump Pills: Pauses cycle so teachers and students can inspect that phase!
  document.querySelectorAll(".phase-jump-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-phase"), 10);
      currentPhaseIdx = idx;
      phaseProgress = 0.0;
      isPlaying = false; // Pauses on manual stage selection so it doesn't rush away!
      if (playBtn) {
        playBtn.innerHTML = `<span>▶</span> Play Cell Cycle`;
        playBtn.className = "btn btn-secondary btn-sm";
      }
      updatePhaseJumpPills();
      SoundFX.playBeep();
    });
  });

  // Manual Phase Progress Scrubber: Drag to scrub transitions in real time!
  sliderPhaseProgress?.addEventListener("input", (e) => {
    phaseProgress = parseFloat(e.target.value) / 100;
    isPlaying = false; // Pauses auto-cycle so scrubbing is stable
    if (playBtn) {
      playBtn.innerHTML = `<span>▶</span> Play Cell Cycle`;
      playBtn.className = "btn btn-secondary btn-sm";
    }
    if (lblPhaseProgress) lblPhaseProgress.textContent = `${Math.round(phaseProgress * 100)}%`;
    if (badgePhaseProgressPct) badgePhaseProgressPct.textContent = `${Math.round(phaseProgress * 100)}% Complete`;
  });

  // Fine Focus Z-Stack Slider
  sliderFineFocus?.addEventListener("input", (e) => {
    fineFocus = parseFloat(e.target.value);
    if (lblFineFocus) {
      if (Math.abs(fineFocus) < 0.1) {
        lblFineFocus.textContent = `0.0 µm (In Focus)`;
        lblFineFocus.style.color = "#10b981";
      } else {
        lblFineFocus.textContent = `${fineFocus > 0 ? "+" : ""}${fineFocus.toFixed(1)} µm (${Math.abs(fineFocus) < 0.8 ? "Slight Aberration" : "Out of Focus"})`;
        lblFineFocus.style.color = Math.abs(fineFocus) < 0.8 ? "#f59e0b" : "#f43f5e";
      }
    }
  });

  sliderSpeed?.addEventListener("input", (e) => {
    animSpeed = parseFloat(e.target.value);
    if (lblSpeed) lblSpeed.textContent = `${animSpeed.toFixed(1)}×`;
  });

  // Colchicine Spindle Poison Checkbox
  checkColchicine?.addEventListener("change", (e) => {
    hasColchicine = e.target.checked;
    if (colchicineToggleSpan) {
      colchicineToggleSpan.style.background = hasColchicine ? "#ef4444" : "#475569";
    }
    initHistologyCells();
    updateTable();
    updateEventsCard();
    SoundFX.playBeep();
  });

  // View Switcher (Simulator vs 4K Bench Photo)
  viewSim?.addEventListener("click", () => {
    viewSim.classList.add("active");
    viewPhoto.classList.remove("active");
    viewSim.style.background = "";
    viewSim.style.color = "";
    viewPhoto.style.background = "";
    viewPhoto.style.color = "";

    if (photoOverlay) photoOverlay.style.display = "none";
    if (viewportModeTabs) viewportModeTabs.style.display = "flex";
    if (activeTab === "animator") {
      if (livePhaseBadge) livePhaseBadge.style.display = "flex";
      if (organelleInspectorBox) organelleInspectorBox.style.display = "flex";
      if (histoToolbar) histoToolbar.style.display = "none";
    } else {
      if (livePhaseBadge) livePhaseBadge.style.display = "none";
      if (organelleInspectorBox) organelleInspectorBox.style.display = "none";
      if (histoToolbar) histoToolbar.style.display = "flex";
    }
    SoundFX.playClick();
  });

  viewPhoto?.addEventListener("click", () => {
    viewPhoto.classList.add("active");
    viewSim.classList.remove("active");
    viewPhoto.style.background = "";
    viewPhoto.style.color = "";
    viewSim.style.background = "";
    viewSim.style.color = "";

    if (photoOverlay) photoOverlay.style.display = "block";
    if (viewportModeTabs) viewportModeTabs.style.display = "none";
    if (livePhaseBadge) livePhaseBadge.style.display = "none";
    if (organelleInspectorBox) organelleInspectorBox.style.display = "none";
    if (histoToolbar) histoToolbar.style.display = "none";
    SoundFX.playClick();
  });

  // Log Cell Count Trial
  logBtn?.addEventListener("click", () => {
    const { mitoticCount, mi, phaseCounts } = calculateMitoticIndex();
    const trialNum = trialLogs.length + 1;
    trialLogs.push({
      trial: trialNum,
      specimen: specimenType === "plant" ? "Allium cepa (Plant)" : "Mammalian (Animal)",
      stain: stainingMode,
      treatment: hasColchicine ? "Colchicine (Spindle Poison)" : "Control (Untreated)",
      totalCells: TOTAL_CELLS,
      mitoticCells: mitoticCount,
      mitoticIndexPct: mi.toFixed(1),
      interphase: phaseCounts.interphase,
      prophase: phaseCounts.prophase,
      metaphase: phaseCounts.metaphase,
      anaphase: phaseCounts.anaphase,
      telophase: phaseCounts.telophase
    });

    logBtn.textContent = `✓ Logged Trial #${trialNum}`;
    logBtn.style.background = "#10b981";
    logBtn.style.color = "#022c22";
    setTimeout(() => {
      logBtn.textContent = "➕ Log Cell Count Trial";
      logBtn.style.background = "rgba(16, 185, 129, 0.15)";
      logBtn.style.color = "#10b981";
    }, 1500);

    SoundFX.playPing();
  });

  // CSV Telemetry Export (Hotkey: E)
  function handleExport() {
    const headers = [
      "Trial",
      "Specimen_Model",
      "Stain_Type",
      "Treatment_Condition",
      "Total_Cells_Counted",
      "Mitotic_Cells_Counted",
      "Mitotic_Index_Percent",
      "Interphase_Cells",
      "Prophase_Cells",
      "Metaphase_Cells",
      "Anaphase_Cells",
      "Telophase_Cells"
    ];

    let data = trialLogs.map(t => [
      t.trial,
      t.specimen,
      t.stain,
      t.treatment,
      t.totalCells,
      t.mitoticCells,
      t.mitoticIndexPct,
      t.interphase,
      t.prophase,
      t.metaphase,
      t.anaphase,
      t.telophase
    ]);

    if (data.length === 0) {
      const { mitoticCount, mi, phaseCounts } = calculateMitoticIndex();
      data = [[
        1,
        specimenType === "plant" ? "Allium cepa (Plant)" : "Mammalian (Animal)",
        stainingMode,
        hasColchicine ? "Colchicine (Spindle Poison)" : "Control (Untreated)",
        TOTAL_CELLS,
        mitoticCount,
        mi.toFixed(1),
        phaseCounts.interphase,
        phaseCounts.prophase,
        phaseCounts.metaphase,
        phaseCounts.anaphase,
        phaseCounts.telophase
      ]];
    }

    exportLabDataCsv("Cytogenetics_Cell_Cycle_Mitosis_Trial_Data", headers, data);
    SoundFX.playPing();
  }

  exportBtn?.addEventListener("click", handleExport);

  function handleKeyDown(e) {
    if (e.key === "e" || e.key === "E") {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
      if (activeTag === "input" || activeTag === "textarea") return;
      e.preventDefault();
      handleExport();
    }
  }
  window.addEventListener("keydown", handleKeyDown);

  // Initialize
  initHistologyCells();
  updateTable();
  updateEventsCard();
  updateScrubberUI();
  animId = requestAnimationFrame(loop);

  // Mount Assessment Checkpoint Quiz
  mountLabCheckpoint("mitosis-checkpoint-mount", "bio-mitosis");

  // Cleanup Function
  return () => {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("resize", setupHiDPICanvas);
    window.removeEventListener("keydown", handleKeyDown);
  };
}
