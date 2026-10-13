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
    { key: "interphase", name: "Interphase (G₁, S, G₂)", shortName: "Interphase", color: "#38bdf8", durationPct: 75, mins: 1080 },
    { key: "prophase", name: "Prophase", shortName: "Prophase", color: "#f59e0b", durationPct: 12, mins: 173 },
    { key: "metaphase", name: "Metaphase", shortName: "Metaphase", color: "#818cf8", durationPct: 6, mins: 86 },
    { key: "anaphase", name: "Anaphase", shortName: "Anaphase", color: "#f43f5e", durationPct: 4, mins: 58 },
    { key: "telophase", name: "Telophase & Cytokinesis", shortName: "Telophase", color: "#10b981", durationPct: 3, mins: 43 }
  ];

  // State Variables
  let activeTab = "animator"; // "animator" or "histology"
  let specimenType = "plant"; // "plant" (Allium cepa) or "animal" (Mammalian somatic)
  let stainingMode = "fluorescence"; // "fluorescence" (Confocal DAPI/GFP) or "acetocarmine" (Brightfield Feulgen)
  let currentPhaseIdx = 0; // 0..4
  let phaseProgress = 0.0; // 0.0 to 1.0 within phase
  let simTime = 0.0;
  let isPlaying = true;
  let animSpeed = 1.0;
  let hasColchicine = false; // Spindle poison halts at Metaphase SAC!

  // Interactive Inspection & Histology Diagnostics
  let hoveredOrganelle = null;
  let canvasMouse = { x: -1, y: -1, isOver: false };
  let selectedHistoCell = null;
  let histoFilter = "all"; // "all" or phase key
  let studentScore = { correct: 0, total: 0 };
  let diagnosticFeedback = null;

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
    phaseDist.forEach(d => {
      for (let i = 0; i < d.count; i++) cellList.push(d.phase);
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
        // Slight natural cell wall morphological jitter
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
          <div class="btn-group" style="display: flex; border: 1px solid var(--border-color); border-radius: 6px; overflow: hidden;">
            <button id="btn-view-sim" class="btn btn-sm active" style="padding: 5px 12px; font-size: 0.8rem; border: none; border-radius: 0;">🔬 Mitosis Simulator</button>
            <button id="btn-view-photo" class="btn btn-sm" style="padding: 5px 12px; font-size: 0.8rem; border: none; border-radius: 0; background: transparent;">📸 4K Real Bench</button>
          </div>
          <button id="btn-export-csv" class="btn btn-secondary btn-sm" style="padding: 5px 12px; font-size: 0.8rem;">📥 Export CSV (E)</button>
        </div>
      </div>

      <!-- Secondary Biological Controls Toolbar -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 6px 14px; flex-wrap: wrap; gap: 10px;">
        <!-- Specimen Architecture Switcher -->
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Specimen Model:</span>
          <div class="btn-group" style="display: flex; background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border-color); border-radius: 6px; padding: 2px;">
            <button id="btn-specimen-plant" class="btn btn-sm active" style="padding: 3px 10px; font-size: 0.75rem; border: none; border-radius: 4px; background: #10b981; color: #022c22; font-weight: 700;">
              🌱 Plant Cell (Allium cepa)
            </button>
            <button id="btn-specimen-animal" class="btn btn-sm" style="padding: 3px 10px; font-size: 0.75rem; border: none; border-radius: 4px; background: transparent; color: #94a3b8;">
              🐾 Animal Cell (Mammalian)
            </button>
          </div>
        </div>

        <!-- Optical Staining Filter Switcher -->
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Microscopy Stain:</span>
          <div class="btn-group" style="display: flex; background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border-color); border-radius: 6px; padding: 2px;">
            <button id="btn-stain-fluor" class="btn btn-sm active" style="padding: 3px 10px; font-size: 0.75rem; border: none; border-radius: 4px; background: #38bdf8; color: #082f49; font-weight: 700;">
              ✨ Confocal (DAPI / GFP)
            </button>
            <button id="btn-stain-aceto" class="btn btn-sm" style="padding: 3px 10px; font-size: 0.75rem; border: none; border-radius: 4px; background: transparent; color: #94a3b8;">
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
      <div style="display: grid; grid-template-columns: minmax(0, 1fr) 350px; gap: 16px; align-items: start;">
        
        <!-- Left Column: Canvas Viewport & Cytogenetics Counts -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div id="viewport-wrapper" style="position: relative; width: 100%; height: 500px; background: #030712; border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.85);">
            
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
            <div style="position: absolute; top: 12px; left: 16px; display: flex; gap: 8px; z-index: 10;">
              <button id="btn-tab-anim" class="btn btn-sm active" style="font-size: 0.75rem; background: rgba(15, 23, 42, 0.9); border: 1px solid #10b981; color: #10b981; padding: 5px 12px; border-radius: 6px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
                🧬 Mitosis Phase Animator
              </button>
              <button id="btn-tab-histo" class="btn btn-sm" style="font-size: 0.75rem; background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); color: #94a3b8; padding: 5px 12px; border-radius: 6px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
                🔬 Onion Root Tip Histology Grid
              </button>
            </div>

            <!-- Interactive Organelle Inspector Callout (Animator Mode) -->
            <div id="organelle-inspector-box" style="position: absolute; bottom: 12px; left: 16px; right: 350px; background: rgba(15, 23, 42, 0.92); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 8px; padding: 8px 14px; backdrop-filter: blur(10px); pointer-events: none; z-index: 10; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
              <div>
                <span id="inspect-title" style="font-size: 0.78rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em;">🔬 Cytological Landmark Inspector</span>
                <span id="inspect-desc" style="font-size: 0.75rem; color: #cbd5e1; margin-left: 8px;">Hover cursor over organelles or chromosomes to probe biomolecular structures.</span>
              </div>
              <span id="inspect-tag" class="badge" style="font-size: 0.7rem; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8;">Optical Scan</span>
            </div>

            <!-- Histology Filter Toolbar (Visible only in Histology Mode) -->
            <div id="histo-toolbar" style="display: none; position: absolute; top: 12px; right: 16px; z-index: 10; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: 6px; padding: 4px; display: none; gap: 4px;">
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

        <!-- Right Column: Control Panel -->
        <div style="background: rgba(15, 23, 42, 0.95); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px; display: flex; flex-direction: column; gap: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.4);">
          
          <!-- Animation Playback Controls -->
          <div id="anim-controls">
            <div style="display: flex; gap: 8px; margin-bottom: 10px;">
              <button id="btn-play-pause" class="btn btn-primary btn-sm" style="flex: 1; padding: 8px 12px; font-weight: 600;">
                ⏸ Pause Cycle
              </button>
              <button id="btn-step-prev" class="btn btn-secondary btn-sm" style="padding: 8px 10px;" title="Previous Phase">
                ⏮
              </button>
              <button id="btn-step-next" class="btn btn-secondary btn-sm" style="padding: 8px 12px; font-weight: 600;">
                ⏭ Next Phase
              </button>
            </div>

            <!-- Manual Phase Selector Pills -->
            <label style="font-size: 0.75rem; font-weight: 700; color: #cbd5e1; display: block; margin-bottom: 6px;">
              Jump to Mitotic Stage
            </label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              <button class="btn btn-secondary btn-sm phase-jump-btn active" data-phase="0" style="font-size: 0.72rem; text-align: left; border-left: 3px solid #38bdf8;">⚪ Interphase</button>
              <button class="btn btn-secondary btn-sm phase-jump-btn" data-phase="1" style="font-size: 0.72rem; text-align: left; border-left: 3px solid #f59e0b;">🟡 Prophase</button>
              <button class="btn btn-secondary btn-sm phase-jump-btn" data-phase="2" style="font-size: 0.72rem; text-align: left; border-left: 3px solid #818cf8;">🔵 Metaphase</button>
              <button class="btn btn-secondary btn-sm phase-jump-btn" data-phase="3" style="font-size: 0.72rem; text-align: left; border-left: 3px solid #f43f5e;">🔴 Anaphase</button>
              <button class="btn btn-secondary btn-sm phase-jump-btn" data-phase="4" style="grid-column: span 2; font-size: 0.72rem; text-align: left; border-left: 3px solid #10b981;">🟢 Telophase &amp; Cytokinesis</button>
            </div>
          </div>

          <!-- Speed Slider -->
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 600; color: #cbd5e1; margin-bottom: 4px;">
              <span>Cell Cycle Speed</span>
              <span id="lbl-speed" style="color: #10b981; font-weight: 700; font-family: monospace;">1.0×</span>
            </div>
            <input type="range" id="slider-speed" min="0.2" max="3.0" step="0.2" value="1.0" style="width: 100%; accent-color: #10b981;" />
          </div>

          <!-- Chemotherapy / Spindle Poison (Colchicine Treatment) -->
          <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 0.8rem; font-weight: 600; color: #f8fafc; display: flex; align-items: center; gap: 6px;">
                  <span>🧪 Colchicine Treatment</span>
                </div>
                <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 2px;">Depolymerizes tubulin (Arrests in Metaphase SAC)</div>
              </div>
              <label style="position: relative; display: inline-block; width: 40px; height: 22px; margin-left: 8px;">
                <input type="checkbox" id="check-colchicine" style="opacity: 0; width: 0; height: 0;" />
                <span id="colchicine-toggle-span" style="position: absolute; cursor: pointer; inset: 0; background: #475569; border-radius: 22px; transition: 0.2s;"></span>
              </label>
            </div>
          </div>

          <!-- Mitotic Index Summary Metric Card -->
          <div style="background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 8px; padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <div style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; font-weight: 700; letter-spacing: 0.05em;">Mitotic Index (MI)</div>
              <span class="badge" style="font-size: 0.7rem; background: rgba(16, 185, 129, 0.2); color: #34d399; padding: 2px 6px; border-radius: 4px;">Active Proliferation</span>
            </div>
            <div id="metric-mi-val" style="font-size: 1.8rem; font-weight: 800; color: #10b981; font-family: monospace; margin: 4px 0;">35.4%</div>
            <div id="metric-mi-desc" style="font-size: 0.75rem; color: #cbd5e1; line-height: 1.4;">
              Active mitotic proliferation in onion apical meristem. High index indicates rapid root tip elongation.
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

          <!-- Checkpoint Quiz Mount -->
          <div id="mitosis-checkpoint-mount" style="margin-top: 4px;"></div>

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

  const btnSpecimenPlant = document.getElementById("btn-specimen-plant");
  const btnSpecimenAnimal = document.getElementById("btn-specimen-animal");
  const btnStainFluor = document.getElementById("btn-stain-fluor");
  const btnStainAceto = document.getElementById("btn-stain-aceto");
  const bioStatusText = document.getElementById("bio-status-text");

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
  const checkColchicine = document.getElementById("check-colchicine");
  const colchicineToggleSpan = document.getElementById("colchicine-toggle-span");

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

    if (metricMiDesc) {
      if (hasColchicine) {
        metricMiDesc.innerHTML = `<span style="color: #f43f5e; font-weight: 700;">Colchicine Metaphase Arrest:</span> Mitotic index spiked to ${mi.toFixed(1)}% due to irreversible spindle failure at the Spindle Assembly Checkpoint (SAC).`;
      } else {
        metricMiDesc.textContent = "Active mitotic proliferation in onion apical meristem. High index indicates rapid root tip elongation.";
      }
    }
  }

  // Helper: Draw smooth chromosome chromatid arm
  function drawChromatidArm(ctx, x1, y1, x2, y2, width, color, outlineColor) {
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = width + 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Helper: Draw realistic curved condensed chromosome
  function drawCurvedChromosome(ctx, cx, cy, angle, len, armWidth, bend, colPrimary, colHighlight) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // Two co-aligned sister chromatids
    [-3.2, 3.2].forEach(offsetY => {
      ctx.beginPath();
      ctx.moveTo(-len / 2, offsetY);
      ctx.quadraticCurveTo(0, offsetY + bend, len / 2, offsetY);

      ctx.strokeStyle = colPrimary;
      ctx.lineWidth = armWidth;
      ctx.lineCap = "round";
      ctx.stroke();

      // Highlight inner core
      ctx.beginPath();
      ctx.moveTo(-len / 2 + 3, offsetY);
      ctx.quadraticCurveTo(0, offsetY + bend, len / 2 - 3, offsetY);
      ctx.strokeStyle = colHighlight;
      ctx.lineWidth = armWidth * 0.4;
      ctx.stroke();
    });

    // Primary constriction (Centromere)
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(0, bend * 0.5, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Draw 60 FPS Cytogenetics Animator
  function drawCellAnimator() {
    if (!ctx) return;
    const curPhase = PHASES[currentPhaseIdx];

    const cx = 295;
    const cy = 250;
    const cellR = 175;

    // Palette depending on Staining Mode
    const isFluor = stainingMode === "fluorescence";
    const bgIllum = isFluor ? "#030712" : "#0d1527";
    const cytosolColor = isFluor ? "rgba(16, 185, 129, 0.12)" : "rgba(244, 114, 182, 0.08)";
    const dnaMain = isFluor ? "#38bdf8" : "#9d174d";
    const dnaHighlight = isFluor ? "#e0f2fe" : "#be185d";
    const tubulinColor = isFluor ? "#10b981" : "#f59e0b";
    const kinetoColor = isFluor ? "#fbbf24" : "#e11d48";

    // 1. Microscope Field of View Circle with Dark Outer Shell
    ctx.fillStyle = bgIllum;
    ctx.fillRect(20, 20, 550, 460);

    // Knurled Metallic Microscope Bezel with Specular Highlights
    const brassGrad = ctx.createRadialGradient(cx, cy, cellR + 25, cx, cy, cellR + 45);
    brassGrad.addColorStop(0, "#334155");
    brassGrad.addColorStop(0.3, "#64748b");
    brassGrad.addColorStop(0.7, "#1e293b");
    brassGrad.addColorStop(1, "#090d16");
    ctx.strokeStyle = brassGrad;
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(cx, cy, cellR + 32, 0, Math.PI * 2);
    ctx.stroke();

    // Subtle lens reflection arc
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, cellR + 24, Math.PI * 1.15, Math.PI * 1.65);
    ctx.stroke();

    // Microscope Kohler Illumination Gradient
    const illumGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, cellR + 24);
    if (isFluor) {
      illumGrad.addColorStop(0, "#081b2a");
      illumGrad.addColorStop(0.7, "#030c17");
      illumGrad.addColorStop(1, "#010409");
    } else {
      illumGrad.addColorStop(0, "rgba(254, 240, 138, 0.08)");
      illumGrad.addColorStop(0.7, "#0d1b2a");
      illumGrad.addColorStop(1, "#030712");
    }
    ctx.fillStyle = illumGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, cellR + 24, 0, Math.PI * 2);
    ctx.fill();

    // 2. Cell Boundary: Plant Cell Wall (Allium Cepa) vs Animal Plasma Membrane
    ctx.save();
    if (specimenType === "plant") {
      // Rigid Rectangular-Prismatic Plant Cell Wall with Middle Lamella
      const pw = 300;
      const ph = 300;
      const rx = cx - pw / 2;
      const ry = cy - ph / 2;

      // Outer Middle Lamella (Pectin Layer)
      ctx.strokeStyle = isFluor ? "#065f46" : "#78350f";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.roundRect(rx - 4, ry - 4, pw + 8, ph + 8, 22);
      ctx.stroke();

      // Primary Cellulose Cell Wall
      ctx.strokeStyle = isFluor ? "#10b981" : "#b45309";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(rx, ry, pw, ph, 18);
      ctx.stroke();

      // Cytosol background
      ctx.fillStyle = cytosolColor;
      ctx.beginPath();
      ctx.roundRect(rx + 3, ry + 3, pw - 6, ph - 6, 16);
      ctx.fill();

      // Plasma Membrane
      ctx.strokeStyle = isFluor ? "rgba(52, 211, 153, 0.7)" : "rgba(251, 191, 36, 0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(rx + 4, ry + 4, pw - 8, ph - 8, 15);
      ctx.stroke();

      // Subtle Plant Vacuole Shimmer (Peripheral vacuolar membrane)
      ctx.strokeStyle = "rgba(56, 189, 248, 0.12)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(rx + 45, ry + 45, 30, 0, Math.PI * 2);
      ctx.arc(rx + pw - 45, ry + ph - 45, 32, 0, Math.PI * 2);
      ctx.stroke();

    } else {
      // Animal Cell: Flexible Plasma Membrane with Cortical Actin Cytoskeleton
      let rX = cellR - 15;
      let rY = cellR - 15;

      // Cell elongation in Anaphase/Telophase
      if (currentPhaseIdx === 3) {
        rX = cellR + phaseProgress * 15;
        rY = cellR - phaseProgress * 10;
      } else if (currentPhaseIdx === 4) {
        rX = cellR + 15;
        rY = cellR - 10;
      }

      if (currentPhaseIdx === 4) {
        // Animal Telophase: Deep Actin-Myosin Cleavage Furrow (pinching inward)
        const pinch = 25 + phaseProgress * 38;
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
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cx, cy - 110);
        ctx.lineTo(cx, cy + 110);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        ctx.fillStyle = cytosolColor;
        ctx.strokeStyle = isFluor ? "#38bdf8" : "#ec4899";
        ctx.lineWidth = 3.5;
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
    ctx.restore();

    // 3. Cytoplasmic Inclusions (Mitochondria & Ribosome Granules for ultra-realism)
    ctx.save();
    const mitoCoords = [
      { x: cx - 105, y: cy - 95, ang: 0.4 },
      { x: cx + 105, y: cy - 85, ang: -0.5 },
      { x: cx - 95, y: cy + 100, ang: -0.3 },
      { x: cx + 100, y: cy + 95, ang: 0.6 }
    ];
    mitoCoords.forEach(m => {
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(m.ang);
      // Outer mitochondrial membrane
      ctx.fillStyle = isFluor ? "rgba(245, 158, 11, 0.45)" : "rgba(217, 119, 6, 0.35)";
      ctx.strokeStyle = isFluor ? "#fbbf24" : "#d97706";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(-10, -5, 20, 10, 5);
      ctx.fill();
      ctx.stroke();
      // Inner cristae folds
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-5, -3); ctx.lineTo(-5, 3);
      ctx.moveTo(0, -3); ctx.lineTo(0, 3);
      ctx.moveTo(5, -3); ctx.lineTo(5, 3);
      ctx.stroke();
      ctx.restore();
    });
    ctx.restore();

    // 4. Centrosomes / MTOCs & Bipolar Mitotic Spindle Apparatus
    const leftCentX = cx - 118;
    const rightCentX = cx + 118;

    if (currentPhaseIdx >= 1 && currentPhaseIdx <= 3) {
      if (specimenType === "animal") {
        // Animal Cell: Amphiastral Spindle with Centrosomes & Orthogonal Centriole Pairs
        [leftCentX, rightCentX].forEach(posX => {
          // Pericentriolar Material (PCM) Glow
          const pcmGrad = ctx.createRadialGradient(posX, cy, 2, posX, cy, 14);
          pcmGrad.addColorStop(0, "rgba(250, 204, 21, 0.8)");
          pcmGrad.addColorStop(0.5, "rgba(245, 158, 11, 0.3)");
          pcmGrad.addColorStop(1, "transparent");
          ctx.fillStyle = pcmGrad;
          ctx.beginPath();
          ctx.arc(posX, cy, 14, 0, Math.PI * 2);
          ctx.fill();

          // Perpendicular Centriole Pair (9 Triplet Microtubule Barrels)
          ctx.strokeStyle = "#fef08a";
          ctx.lineWidth = 3;
          ctx.beginPath();
          // Mother centriole (vertical)
          ctx.moveTo(posX - 2, cy - 6); ctx.lineTo(posX - 2, cy + 6);
          // Daughter centriole (horizontal)
          ctx.moveTo(posX - 6, cy + 2); ctx.lineTo(posX + 6, cy + 2);
          ctx.stroke();

          // Astral Microtubules (Anchoring to cell cortex)
          ctx.strokeStyle = isFluor ? "rgba(52, 211, 153, 0.45)" : "rgba(245, 158, 11, 0.35)";
          ctx.lineWidth = 1;
          for (let a = 0; a < 8; a++) {
            const ang = (a / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(posX, cy);
            ctx.lineTo(posX + Math.cos(ang) * 24, cy + Math.sin(ang) * 24);
            ctx.stroke();
          }
        });
      } else {
        // Plant Cell (Allium cepa): Anastral Spindle! NO Centrioles!
        // Broad polar organizer microtubule caps (MTOCs)
        [leftCentX, rightCentX].forEach(posX => {
          ctx.strokeStyle = isFluor ? "rgba(52, 211, 153, 0.7)" : "rgba(217, 119, 6, 0.6)";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(posX, cy, 16, posX < cx ? -Math.PI / 2 : Math.PI / 2, posX < cx ? Math.PI / 2 : 3 * Math.PI / 2);
          ctx.stroke();

          // Polar Organizer γ-TuRC nucleating centers
          ctx.fillStyle = "#34d399";
          for (let g = -3; g <= 3; g++) {
            ctx.beginPath();
            ctx.arc(posX, cy + g * 5, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      // Spindle Microtubules (K-fibers and Interpolar overlapping fibers)
      if (hasColchicine && currentPhaseIdx === 2) {
        // Colchicine binds tubulin dimers, preventing polymerisation!
        // Show fragmented, soluble tubulin heterodimer dots floating randomly
        ctx.fillStyle = isFluor ? "rgba(52, 211, 153, 0.7)" : "rgba(239, 68, 68, 0.7)";
        for (let t = 0; t < 50; t++) {
          const tx = cx - 110 + ((t * 29 + Math.sin(simTime + t) * 6) % 220);
          const ty = cy - 80 + ((t * 23 + Math.cos(simTime + t) * 6) % 160);
          ctx.fillRect(tx, ty, 3, 3);
        }
      } else {
        // Healthy bipolar spindle fibers
        ctx.strokeStyle = isFluor ? "rgba(16, 185, 129, 0.45)" : "rgba(245, 158, 11, 0.45)";
        ctx.lineWidth = 1.4;
        for (let f = -5; f <= 5; f++) {
          ctx.beginPath();
          ctx.moveTo(leftCentX, cy);
          ctx.quadraticCurveTo(cx, cy + f * 24, rightCentX, cy);
          ctx.stroke();
        }
      }
    }

    // 5. Chromatin / Chromosome Cytological Dynamics by Mitotic Phase
    if (currentPhaseIdx === 0) {
      // ==========================================
      // PHASE 0: INTERPHASE (G₁, S, G₂)
      // ==========================================
      // Intact Nuclear Envelope (Double lipid bilayer)
      const nucR = 86;
      ctx.strokeStyle = isFluor ? "#38bdf8" : "#831843";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, nucR, 0, Math.PI * 2);
      ctx.stroke();

      // Inner nuclear lamina layer
      ctx.strokeStyle = isFluor ? "rgba(56, 189, 248, 0.4)" : "rgba(131, 24, 67, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, nucR - 3, 0, Math.PI * 2);
      ctx.stroke();

      // 16 Nuclear Pore Complexes (NPCs) periodically spaced
      for (let n = 0; n < 16; n++) {
        const ang = (n / 16) * Math.PI * 2;
        const nx = cx + Math.cos(ang) * nucR;
        const ny = cy + Math.sin(ang) * nucR;
        ctx.fillStyle = isFluor ? "#7dd3fc" : "#be185d";
        ctx.beginPath();
        ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Nucleoplasm Background Glow
      const nucGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, nucR);
      nucGrad.addColorStop(0, isFluor ? "rgba(56, 189, 248, 0.16)" : "rgba(190, 24, 93, 0.14)");
      nucGrad.addColorStop(1, isFluor ? "rgba(14, 165, 233, 0.04)" : "rgba(131, 24, 67, 0.04)");
      ctx.fillStyle = nucGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, nucR - 2, 0, Math.PI * 2);
      ctx.fill();

      // Dense Spherical Nucleolus (rRNA transcription & ribosome subunit assembly)
      const nucCore = ctx.createRadialGradient(cx - 24, cy - 18, 3, cx - 24, cy - 18, 18);
      nucCore.addColorStop(0, isFluor ? "#bae6fd" : "#f472b6");
      nucCore.addColorStop(0.5, isFluor ? "#0284c7" : "#be185d");
      nucCore.addColorStop(1, isFluor ? "#0369a1" : "#831843");
      ctx.fillStyle = nucCore;
      ctx.beginPath();
      ctx.arc(cx - 24, cy - 18, 18, 0, Math.PI * 2);
      ctx.fill();

      // Internal Fibrillar Center (FC) speckles
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.beginPath();
      ctx.arc(cx - 28, cy - 22, 2.5, 0, Math.PI * 2);
      ctx.arc(cx - 20, cy - 16, 2, 0, Math.PI * 2);
      ctx.fill();

      // Realistic Diffuse Chromatin Network (Euchromatin threads + Heterochromatin condensations)
      // Multi-frequency harmonic filaments with microscopic thermal Brownian motion
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

      // Dense Heterochromatin aggregates (Centromeric/telomeric heterochromatin clusters)
      ctx.fillStyle = isFluor ? "rgba(14, 165, 233, 0.85)" : "rgba(131, 24, 67, 0.85)";
      for (let h = 0; h < 22; h++) {
        const hAng = (h / 22) * Math.PI * 2 + h * 0.3;
        const hR = 25 + ((h * 17) % 52);
        const hx = cx + Math.cos(hAng) * hR;
        const hy = cy + Math.sin(hAng) * hR;
        // Don't draw over nucleolus
        const dNuc = Math.hypot(hx - (cx - 24), hy - (cy - 18));
        if (dNuc > 20) {
          ctx.beginPath();
          ctx.arc(hx, hy, 2.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // S-Phase DNA Replication Activity luminescence
      ctx.fillStyle = "rgba(56, 189, 248, 0.08)";
      const repPulse = 0.5 + 0.5 * Math.sin(simTime * 2);
      ctx.beginPath();
      ctx.arc(cx, cy, 55 + repPulse * 10, 0, Math.PI * 2);
      ctx.fill();

    } else if (currentPhaseIdx === 1) {
      // ==========================================
      // PHASE 1: PROPHASE & PROMETAPHASE
      // ==========================================
      // Disintegrating Nuclear Envelope (Phosphorylated Lamin B Fenestration)
      ctx.strokeStyle = isFluor ? "rgba(56, 189, 248, 0.35)" : "rgba(131, 24, 67, 0.35)";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 14]);
      ctx.beginPath();
      ctx.arc(cx, cy, 85, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Dissolving nuclear membrane vesicle remnants
      for (let v = 0; v < 12; v++) {
        const vang = (v / 12) * Math.PI * 2;
        const vx = cx + Math.cos(vang) * 85;
        const vy = cy + Math.sin(vang) * 85;
        ctx.fillStyle = isFluor ? "#38bdf8" : "#831843";
        ctx.beginPath();
        ctx.arc(vx, vy, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4 Pairs of Homologous Condensed Chromosomes (2n = 4)
      const chromCoords = [
        { x: cx - 42, y: cy - 40, ang: 0.35, len: 44, bend: 3 },
        { x: cx + 45, y: cy - 36, ang: -0.42, len: 38, bend: -3 },
        { x: cx - 38, y: cy + 42, ang: -0.25, len: 42, bend: 4 },
        { x: cx + 40, y: cy + 45, ang: 0.55, len: 34, bend: -2 }
      ];

      chromCoords.forEach(pos => {
        drawCurvedChromosome(ctx, pos.x, pos.y, pos.ang, pos.len, 5.5, pos.bend, dnaMain, dnaHighlight);
      });

    } else if (currentPhaseIdx === 2) {
      // ==========================================
      // PHASE 2: METAPHASE & SPINDLE ASSEMBLY CHECKPOINT (SAC)
      // ==========================================
      // Equatorial Metaphase Plate Reference Axis
      ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, cy - 125);
      ctx.lineTo(cx, cy + 125);
      ctx.stroke();
      ctx.setLineDash([]);

      // 4 Anatomical Homologous Chromosomes congressed single-file along the equator
      const metaphaseYPositions = [cy - 65, cy - 22, cy + 22, cy + 65];
      const chromLengths = [42, 48, 44, 38];

      metaphaseYPositions.forEach((yPos, idx) => {
        // Slight microscopic tension breathing oscillation
        const tensionOsc = Math.sin(simTime * 2.5 + idx) * 2;
        const xPos = cx + (hasColchicine ? tensionOsc * 4 : tensionOsc);

        // Sister chromatid arms (Left chromatid facing left pole, Right chromatid facing right pole)
        const armLen = chromLengths[idx];
        drawCurvedChromosome(ctx, xPos, yPos, Math.PI / 2, armLen, 6, 0, dnaMain, dnaHighlight);

        // Kinetochore Plates on both lateral faces of Centromere
        const leftKinetoX = xPos - 5;
        const rightKinetoX = xPos + 5;

        // SAC status glow
        ctx.fillStyle = hasColchicine ? "#ef4444" : kinetoColor;
        ctx.beginPath();
        ctx.arc(leftKinetoX, yPos, 3.5, 0, Math.PI * 2);
        ctx.arc(rightKinetoX, yPos, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Kinetochore Microtubule (K-fiber) tension tethers
        if (!hasColchicine) {
          ctx.strokeStyle = isFluor ? "rgba(250, 204, 21, 0.75)" : "rgba(217, 119, 6, 0.65)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(leftCentX, cy);
          ctx.lineTo(leftKinetoX, yPos);
          ctx.moveTo(rightCentX, cy);
          ctx.lineTo(rightKinetoX, yPos);
          ctx.stroke();

          // Green mechanical tension satisfaction glow at kinetochores
          ctx.strokeStyle = "#10b981";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(leftKinetoX, yPos, 6, 0, Math.PI * 2);
          ctx.arc(rightKinetoX, yPos, 6, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          // Under Colchicine: Mad2/BubR1 checkpoint sensor recruitment (pulsing red)
          const sacPulse = 0.5 + 0.5 * Math.sin(simTime * 6);
          ctx.strokeStyle = `rgba(239, 68, 68, ${sacPulse})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(leftKinetoX, yPos, 7, 0, Math.PI * 2);
          ctx.arc(rightKinetoX, yPos, 7, 0, Math.PI * 2);
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
      // Separation distance increases with phase progress
      const sep = 32 + phaseProgress * 58;
      const anaphaseYPositions = [cy - 60, cy - 20, cy + 20, cy + 60];
      const armLengths = [36, 42, 38, 32];

      anaphaseYPositions.forEach((yPos, idx) => {
        const len = armLengths[idx];

        // Left migrating daughter chromosome (V-shape with apex leading left toward left pole)
        const leftApexX = cx - sep;
        ctx.save();
        ctx.strokeStyle = dnaMain;
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(leftApexX + len * 0.45, yPos - len * 0.35);
        ctx.lineTo(leftApexX, yPos);
        ctx.lineTo(leftApexX + len * 0.45, yPos + len * 0.35);
        ctx.stroke();

        // Highlight core
        ctx.strokeStyle = dnaHighlight;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(leftApexX + len * 0.45 - 2, yPos - len * 0.35 + 2);
        ctx.lineTo(leftApexX, yPos);
        ctx.lineTo(leftApexX + len * 0.45 - 2, yPos + len * 0.35 - 2);
        ctx.stroke();

        // Kinetochore at the apex
        ctx.fillStyle = kinetoColor;
        ctx.beginPath();
        ctx.arc(leftApexX, yPos, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Shortening K-fiber pulling poleward
        ctx.strokeStyle = isFluor ? "rgba(16, 185, 129, 0.6)" : "rgba(245, 158, 11, 0.5)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(leftCentX, cy);
        ctx.lineTo(leftApexX, yPos);
        ctx.stroke();
        ctx.restore();

        // Right migrating daughter chromosome (V-shape with apex leading right toward right pole)
        const rightApexX = cx + sep;
        ctx.save();
        ctx.strokeStyle = dnaMain;
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(rightApexX - len * 0.45, yPos - len * 0.35);
        ctx.lineTo(rightApexX, yPos);
        ctx.lineTo(rightApexX - len * 0.45, yPos + len * 0.35);
        ctx.stroke();

        // Highlight core
        ctx.strokeStyle = dnaHighlight;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(rightApexX - len * 0.45 + 2, yPos - len * 0.35 + 2);
        ctx.lineTo(rightApexX, yPos);
        ctx.lineTo(rightApexX - len * 0.45 + 2, yPos + len * 0.35 - 2);
        ctx.stroke();

        // Kinetochore at the apex
        ctx.fillStyle = kinetoColor;
        ctx.beginPath();
        ctx.arc(rightApexX, yPos, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Shortening K-fiber pulling poleward
        ctx.strokeStyle = isFluor ? "rgba(16, 185, 129, 0.6)" : "rgba(245, 158, 11, 0.5)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(rightCentX, cy);
        ctx.lineTo(rightApexX, yPos);
        ctx.stroke();
        ctx.restore();
      });

      // Interpolar Microtubules sliding past each other (Anaphase B spindle elongation)
      ctx.strokeStyle = isFluor ? "rgba(52, 211, 153, 0.35)" : "rgba(245, 158, 11, 0.35)";
      ctx.lineWidth = 1.2;
      for (let s = -2; s <= 2; s++) {
        ctx.beginPath();
        ctx.moveTo(cx - 30, cy + s * 18);
        ctx.lineTo(cx + 30, cy + s * 18);
        ctx.stroke();
      }

    } else if (currentPhaseIdx === 4) {
      // ==========================================
      // PHASE 4: TELOPHASE & CYTOKINESIS
      // ==========================================
      [-95, 95].forEach(dx => {
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
        ctx.strokeStyle = isFluor ? "rgba(52, 211, 153, 0.55)" : "rgba(245, 158, 11, 0.55)";
        ctx.lineWidth = 1.5;
        for (let p = -5; p <= 5; p++) {
          ctx.beginPath();
          ctx.moveTo(cx - 16, cy + p * 16);
          ctx.lineTo(cx + 16, cy + p * 16);
          ctx.stroke();
        }

        // Golgi-derived pectin vesicles fusing from center outward to form Cell Plate
        const plateHeight = 80 + phaseProgress * 90;
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
          ctx.arc(cx, cy + v * (plateHeight / 9), 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 6. Optical Scale Bar & Objective Badge (Bottom Left of Canvas)
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 460);
    ctx.lineTo(90, 460);
    ctx.moveTo(40, 456);
    ctx.lineTo(40, 464);
    ctx.moveTo(90, 456);
    ctx.lineTo(90, 464);
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "left";
    ctx.fillText("20 µm", 48, 454);
    ctx.fillText("100× Plan-Apo (N.A. 1.40 Oil)", 40, 474);

    // 7. Interactive Hover Cursor & Real-time Organelle Hit-Testing
    if (canvasMouse.isOver) {
      const mx = canvasMouse.x;
      const my = canvasMouse.y;
      const distFromCenter = Math.hypot(mx - cx, my - cy);

      // Hit-testing cytological structures
      let hitInfo = null;

      if (currentPhaseIdx === 0 && Math.hypot(mx - (cx - 24), my - (cy - 18)) < 22) {
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
      } else if (currentPhaseIdx === 2 && Math.abs(mx - cx) < 20 && Math.abs(my - cy) < 90) {
        hitInfo = {
          title: "Metaphase Chromosome & Kinetochore",
          desc: hasColchicine ? "Colchicine depolymerized tubulin; SAC active due to absence of mechanical tension." : "Cohesin rings hold sister chromatids; kinetochores experience ~35 pN bipolar spindle tension.",
          tag: hasColchicine ? "SAC Halted" : "Bi-Oriented Tension"
        };
      } else if (currentPhaseIdx === 3 && (Math.hypot(mx - (cx - 70), my - cy) < 40 || Math.hypot(mx - (cx + 70), my - cy) < 40)) {
        hitInfo = {
          title: "Disjoined Daughter Chromosomes",
          desc: "Separase cleaved cohesin rings; K-fibers depolymerize at plus-ends, pulling V-shaped chromatids poleward.",
          tag: "Anaphase Disjunction"
        };
      } else if (currentPhaseIdx === 4 && specimenType === "plant" && Math.abs(mx - cx) < 20) {
        hitInfo = {
          title: "Phragmoplast & Developing Cell Plate",
          desc: "Golgi-derived vesicles carry pectin and hemicellulose, fusing centrifugal-outward to build the new middle lamella.",
          tag: "Plant Cytokinesis"
        };
      } else if (Math.hypot(mx - leftCentX, my - cy) < 25 || Math.hypot(mx - rightCentX, my - cy) < 25) {
        hitInfo = {
          title: specimenType === "animal" ? "Centrosome & Centriole Pair" : "Polar Organizer MTOC",
          desc: specimenType === "animal" ? "Perpendicular centrioles nucleating astral and spindle microtubules." : "Plant anastral spindle pole containing γ-TuRC nucleating complexes.",
          tag: "Spindle Pole"
        };
      } else if (distFromCenter < cellR) {
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
        ctx.strokeStyle = "rgba(56, 189, 248, 0.75)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(mx, my, 12, 0, Math.PI * 2);
        ctx.moveTo(mx - 16, my); ctx.lineTo(mx + 16, my);
        ctx.moveTo(mx, my - 16); ctx.lineTo(mx, my + 16);
        ctx.stroke();
      }
    }

    // 8. Right Side Phase HUD Card
    const hudX = 590;
    const hudY = 46;
    const hudW = 325;
    const hudH = 416;

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
      0: [
        "• DNA replication occurs during S-phase (2n → 4C DNA)",
        specimenType === "plant" ? "• Polar organizer MTOCs prepare spindle assembly" : "• Centrosomes duplicate into pair with centrioles",
        "• Intact nuclear envelope & prominent dense nucleolus",
        "• High protein synthesis, histone transcription & cell growth"
      ],
      1: [
        "• Chromatin condenses into distinct X-shaped sister chromatids",
        "• Nuclear lamina phosphorylates -> envelope & nucleolus dissolve",
        specimenType === "plant" ? "• Anastral bipolar spindle assembles from polar caps" : "• Centrosomes migrate to opposite poles with astral rays",
        "• Kinetochore search-and-capture binds microtubule plus-ends"
      ],
      2: [
        "• Chromosomes align along equatorial Metaphase Plate",
        "• Bi-orientation: sister kinetochores face opposite poles",
        "• Spindle Assembly Checkpoint (SAC) validates ~35 pN tension",
        "• Cohesin protein complexes clamp chromatids together"
      ],
      3: [
        "• APC/C degrades securin, unleashing separase protease",
        "• Cohesin cleaved -> sister chromatids disjoin to daughter chromosomes",
        "• Kinetochore microtubules depolymerize poleward (Anaphase A)",
        "• Interpolar microtubules slide apart, elongating cell (Anaphase B)"
      ],
      4: [
        "• Nuclear envelopes reassemble around polar chromosome sets",
        "• Chromosomes decondense back into diffuse euchromatin",
        "• Nucleoli reappear via nucleolar organizer regions (NORs)",
        specimenType === "plant" ? "• Phragmoplast guides pectin vesicles -> Cell Plate forms" : "• Actin-myosin II contractile ring pinches cleavage furrow"
      ]
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

    // Colchicine Warning or Normal Proliferation Banner
    if (hasColchicine) {
      ctx.fillStyle = "rgba(244, 63, 94, 0.12)";
      ctx.strokeStyle = "#f43f5e";
      ctx.beginPath();
      ctx.roundRect(hudX + 14, hudY + 316, hudW - 28, 86, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#f43f5e";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText("⚠️ COLCHICINE SPINDLE POISON ACTIVE:", hudX + 22, hudY + 336);
      ctx.font = "9px sans-serif";
      ctx.fillStyle = "#fca5a5";
      ctx.fillText("Binds tubulin dimers, preventing microtubule polymerisation.", hudX + 22, hudY + 354);
      ctx.fillText("Kinetochores fail tension test -> Permanent Metaphase Arrest!", hudX + 22, hudY + 370);
      ctx.fillText("Mitotic index rises steeply as cells accumulate at metaphase.", hudX + 22, hudY + 386);
    } else {
      ctx.fillStyle = "rgba(16, 185, 129, 0.1)";
      ctx.strokeStyle = "#10b981";
      ctx.beginPath();
      ctx.roundRect(hudX + 14, hudY + 316, hudW - 28, 86, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#10b981";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText("✓ NORMAL PROLIFERATION ACTIVE:", hudX + 22, hudY + 336);
      ctx.font = "9px sans-serif";
      ctx.fillStyle = "#a7f3d0";
      ctx.fillText("Microtubules dynamically polymerise and depolymerise.", hudX + 22, hudY + 354);
      ctx.fillText("Continuous balanced mitotic progression through all 5 phases.", hudX + 22, hudY + 370);
      ctx.fillText(`Specimen: ${specimenType === "plant" ? "Plant (Anastral + Phragmoplast)" : "Animal (Amphiastral + Cleavage Furrow)"}`, hudX + 22, hudY + 386);
    }
  }

  // Draw 60 FPS Authentic Allium Cepa Meristem Histology Grid
  function drawHistologyGrid() {
    if (!ctx) return;
    const gridLeft = 44;
    const gridTop = 60;
    const cellW = 60;
    const cellH = 58;

    // Outer dark stage plate
    ctx.fillStyle = "#030712";
    ctx.fillRect(20, 20, 550, 460);

    // Feulgen / Acetocarmine stained tissue field background
    ctx.fillStyle = "rgba(136, 19, 55, 0.15)";
    ctx.fillRect(gridLeft - 6, gridTop - 6, 8 * (cellW + 4) + 8, 6 * (cellH + 4) + 8);

    // Border around tissue section
    ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
    ctx.lineWidth = 2;
    ctx.strokeRect(gridLeft - 6, gridTop - 6, 8 * (cellW + 4) + 8, 6 * (cellH + 4) + 8);

    // Track hovered cell for loupe
    let hoveredCellObj = null;

    // Render cells in 8x6 grid
    histologyCells.forEach(c => {
      const px = gridLeft + c.col * (cellW + 4);
      const py = gridTop + c.row * (cellH + 4);

      // Hit-test mouse
      const isHovered = canvasMouse.isOver && canvasMouse.x >= px && canvasMouse.x <= px + cellW && canvasMouse.y >= py && canvasMouse.y <= py + cellH;
      if (isHovered) hoveredCellObj = c;

      const isSelected = selectedHistoCell === c.id;
      const matchesFilter = histoFilter === "all" || c.actualPhase === histoFilter;

      // Dim non-matching cells if filter active
      ctx.save();
      if (!matchesFilter) {
        ctx.globalAlpha = 0.25;
      }

      // Cell boundary: Plant cellulose wall with middle lamella
      ctx.fillStyle = isHovered ? "rgba(56, 189, 248, 0.18)" : "rgba(16, 185, 129, 0.08)";
      ctx.strokeStyle = isSelected ? "#38bdf8" : (isHovered ? "#34d399" : "#15803d");
      ctx.lineWidth = isSelected ? 2.5 : (isHovered ? 2 : 1.5);
      ctx.fillRect(px, py, cellW, cellH);
      ctx.strokeRect(px, py, cellW, cellH);

      // Inner cell wall double line
      ctx.strokeStyle = "rgba(16, 185, 129, 0.25)";
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 2, py + 2, cellW - 4, cellH - 4);

      // Cytological Stain Appearance (Acetocarmine deep purple-magenta)
      const cx = px + cellW / 2;
      const cy = py + cellH / 2;

      if (c.actualPhase === "interphase") {
        // Interphase: Granular round nucleus with visible dark nucleolus
        const nucGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 14);
        nucGrad.addColorStop(0, "#be185d");
        nucGrad.addColorStop(0.8, "#831843");
        nucGrad.addColorStop(1, "#500724");
        ctx.fillStyle = nucGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 13, 0, Math.PI * 2);
        ctx.fill();

        // Dark nucleolus dot
        ctx.fillStyle = "#2e0215";
        ctx.beginPath();
        ctx.arc(cx + c.nucleolusOffset, cy - 2, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Subtle granular chromatin stippling
        ctx.fillStyle = "rgba(244, 114, 182, 0.4)";
        ctx.fillRect(cx - 6, cy + 4, 2, 2);
        ctx.fillRect(cx + 4, cy + 5, 2, 2);

      } else if (c.actualPhase === "prophase") {
        // Prophase: Tangled mass of dark coiled chromatin cords filling nucleus
        ctx.fillStyle = "#9d174d";
        ctx.strokeStyle = "#be185d";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.stroke();

        // Coiled chromosomes
        for (let i = 0; i < 5; i++) {
          ctx.strokeStyle = i % 2 === 0 ? "#f43f5e" : "#fbbf24";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx - 9 + i * 4, cy - 9 + (i % 2) * 5);
          ctx.lineTo(cx - 6 + i * 3, cy + 7 - (i % 2) * 4);
          ctx.stroke();
        }

      } else if (c.actualPhase === "metaphase") {
        // Metaphase: Dense, dark magenta compressed equatorial chromosome plate
        ctx.fillStyle = "#831843";
        ctx.fillRect(cx - 3, cy - 18, 6, 36);

        // Projecting chromatid arm tips
        ctx.strokeStyle = "#be185d";
        ctx.lineWidth = 2;
        for (let k = -2; k <= 2; k++) {
          ctx.beginPath();
          ctx.moveTo(cx - 8, cy + k * 7);
          ctx.lineTo(cx + 8, cy + k * 7);
          ctx.stroke();
        }

      } else if (c.actualPhase === "anaphase") {
        // Anaphase: Two distinctly separated parallel dark magenta chromosome bands
        ctx.fillStyle = "#9d174d";
        ctx.fillRect(cx - 13, cy - 15, 4.5, 30);
        ctx.fillRect(cx + 9, cy - 15, 4.5, 30);

        // V-shaped trailing arms
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 1.5;
        for (let k = -2; k <= 2; k++) {
          ctx.beginPath();
          ctx.moveTo(cx - 8, cy + k * 7);
          ctx.lineTo(cx - 13, cy + k * 6);
          ctx.moveTo(cx + 8, cy + k * 7);
          ctx.lineTo(cx + 13, cy + k * 6);
          ctx.stroke();
        }

      } else if (c.actualPhase === "telophase") {
        // Telophase: Two compact polar chromatin masses + pale nascent cell plate
        ctx.fillStyle = "#831843";
        ctx.beginPath();
        ctx.arc(cx - 12, cy, 8, 0, Math.PI * 2);
        ctx.arc(cx + 12, cy, 8, 0, Math.PI * 2);
        ctx.fill();

        // Emerging cell plate line
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 18);
        ctx.lineTo(cx, cy + 18);
        ctx.stroke();
      }

      // Cell Number Badge
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "8px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`${c.id}`, px + 3, py + 9);

      // Student Classification Marker (if already diagnosed by user)
      if (c.userClassified) {
        const isCorrect = c.userClassified === c.actualPhase;
        ctx.fillStyle = isCorrect ? "#10b981" : "#ef4444";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "right";
        ctx.fillText(c.userClassified.charAt(0).toUpperCase(), px + cellW - 3, py + 9);
      }

      ctx.restore();
    });

    // 1000x High-Power Optical Loupe (Follows cursor over the histology grid)
    if (hoveredCellObj && canvasMouse.isOver) {
      const loupeR = 52;
      let loupeX = canvasMouse.x + 65;
      let loupeY = canvasMouse.y - 15;
      if (loupeX + loupeR > 540) loupeX = canvasMouse.x - 65;
      if (loupeY - loupeR < 25) loupeY = canvasMouse.y + 60;

      ctx.save();
      // Outer brass loupe bezel
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 3;
      ctx.fillStyle = "#020617";
      ctx.beginPath();
      ctx.arc(loupeX, loupeY, loupeR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Optical crosshairs
      ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(loupeX - loupeR + 6, loupeY); ctx.lineTo(loupeX + loupeR - 6, loupeY);
      ctx.moveTo(loupeX, loupeY - loupeR + 6); ctx.lineTo(loupeX, loupeY + loupeR - 6);
      ctx.stroke();

      // Scaled up cytological figure
      const p = hoveredCellObj.actualPhase;
      if (p === "interphase") {
        ctx.fillStyle = "#be185d";
        ctx.beginPath(); ctx.arc(loupeX, loupeY, 24, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#2e0215";
        ctx.beginPath(); ctx.arc(loupeX - 5, loupeY - 4, 6, 0, Math.PI * 2); ctx.fill();
      } else if (p === "prophase") {
        ctx.strokeStyle = "#f43f5e"; ctx.lineWidth = 3;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(loupeX - 16 + i * 8, loupeY - 14);
          ctx.lineTo(loupeX - 12 + i * 7, loupeY + 14);
          ctx.stroke();
        }
      } else if (p === "metaphase") {
        ctx.fillStyle = "#831843";
        ctx.fillRect(loupeX - 4, loupeY - 30, 8, 60);
        ctx.strokeStyle = "#f43f5e"; ctx.lineWidth = 2.5;
        for (let k = -3; k <= 3; k++) {
          ctx.beginPath(); ctx.moveTo(loupeX - 15, loupeY + k * 8); ctx.lineTo(loupeX + 15, loupeY + k * 8); ctx.stroke();
        }
      } else if (p === "anaphase") {
        ctx.fillStyle = "#9d174d";
        ctx.fillRect(loupeX - 22, loupeY - 26, 7, 52);
        ctx.fillRect(loupeX + 15, loupeY - 26, 7, 52);
      } else if (p === "telophase") {
        ctx.fillStyle = "#831843";
        ctx.beginPath(); ctx.arc(loupeX - 20, loupeY, 14, 0, Math.PI * 2); ctx.arc(loupeX + 20, loupeY, 14, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(loupeX, loupeY - 28); ctx.lineTo(loupeX, loupeY + 28); ctx.stroke();
      }

      // Badge over Loupe
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`Cell #${hoveredCellObj.id}: 1000× Loupe`, loupeX, loupeY + loupeR + 14);
      ctx.restore();
    }

    // Right Side Histology Analytics Panel
    const hudX = 590;
    const hudY = 46;
    const hudW = 325;
    const hudH = 416;

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
    ctx.roundRect(hudX + 14, hudY + 58, hudW - 28, 86, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 10px monospace";
    ctx.fillText("CALCULATED MITOTIC INDEX (MI):", hudX + 24, hudY + 76);

    ctx.fillStyle = "#10b981";
    ctx.font = "bold 26px monospace";
    ctx.fillText(`${mi.toFixed(1)}%`, hudX + 24, hudY + 108);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "10px sans-serif";
    ctx.fillText(`${mitoticCount} Dividing Cells / ${TOTAL_CELLS} Total Meristematic Cells`, hudX + 24, hudY + 130);

    // Phase Breakdown Bars
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 11px monospace";
    ctx.fillText("PHASE CELL COUNTS:", hudX + 18, hudY + 164);

    const barY = hudY + 176;
    PHASES.forEach((p, idx) => {
      const y = barY + idx * 26;
      const cnt = phaseCounts[p.key] || 0;
      const barLen = Math.max(4, (cnt / TOTAL_CELLS) * (hudW - 130));

      ctx.fillStyle = p.color;
      ctx.font = "bold 10px sans-serif";
      ctx.fillText(`${p.shortName}:`, hudX + 18, y + 10);

      // Bar track
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(hudX + 90, y, hudW - 130, 12);
      ctx.fillStyle = p.color;
      ctx.fillRect(hudX + 90, y, barLen, 12);

      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 10px monospace";
      ctx.fillText(`${cnt}`, hudX + hudW - 32, y + 10);
    });

    // Colchicine Alert or Physiological Meristem Notice
    if (hasColchicine) {
      ctx.fillStyle = "rgba(244, 63, 94, 0.12)";
      ctx.strokeStyle = "#f43f5e";
      ctx.beginPath();
      ctx.roundRect(hudX + 14, hudY + 316, hudW - 28, 86, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#f43f5e";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText("COLCHICINE ARREST OBSERVED:", hudX + 22, hudY + 336);
      ctx.font = "9px sans-serif";
      ctx.fillStyle = "#fca5a5";
      ctx.fillText("Metaphase cell proportion jumped drastically to >50%.", hudX + 22, hudY + 354);
      ctx.fillText("Anaphase & telophase depleted due to spindle failure.", hudX + 22, hudY + 370);
      ctx.fillText("Used clinically as antimitotic chemotherapy / gout drug.", hudX + 22, hudY + 386);
    } else {
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.beginPath();
      ctx.roundRect(hudX + 14, hudY + 316, hudW - 28, 86, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#cbd5e1";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText("PHYSIOLOGICAL MERISTEM DYNAMICS:", hudX + 22, hudY + 336);
      ctx.font = "9px sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("Onion root apical meristem exhibits high cell turnover.", hudX + 22, hudY + 354);
      ctx.fillText("Formula: t_phase = (N_phase / N_total) × 1440 min.", hudX + 22, hudY + 370);
      ctx.fillText("Interphase represents ~75% of total cell population.", hudX + 22, hudY + 386);
    }
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
          phaseProgress = 0.0;
          currentPhaseIdx = (currentPhaseIdx + 1) % PHASES.length;
          updatePhaseJumpPills();
          SoundFX.playClick();
        }
      }
    }

    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : Math.min(window.devicePixelRatio || 1, 2);
    ctx.save();
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, logicalW, logicalH);

    // Subtle background grid
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

  function updatePhaseJumpPills() {
    document.querySelectorAll(".phase-jump-btn").forEach(btn => {
      const idx = parseInt(btn.getAttribute("data-phase"), 10);
      if (idx === currentPhaseIdx) {
        btn.classList.add("active");
        btn.style.background = "rgba(56, 189, 248, 0.2)";
        btn.style.borderColor = PHASES[idx].color;
      } else {
        btn.classList.remove("active");
        btn.style.background = "";
        btn.style.borderColor = "var(--border-color)";
      }
    });
  }

  // Mouse tracking for canvas inspection & loupe
  const handleMouseMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = logicalW / rect.width;
    const scaleY = logicalH / rect.height;
    canvasMouse.x = (e.clientX - rect.left) * scaleX;
    canvasMouse.y = (e.clientY - rect.top) * scaleY;
    canvasMouse.isOver = true;
  };

  const handleMouseLeave = () => {
    canvasMouse.isOver = false;
  };

  const handleCanvasClick = () => {
    if (activeTab === "histology") {
      const gridLeft = 44;
      const gridTop = 60;
      const cellW = 60;
      const cellH = 58;

      histologyCells.forEach(c => {
        const px = gridLeft + c.col * (cellW + 4);
        const py = gridTop + c.row * (cellH + 4);
        if (canvasMouse.x >= px && canvasMouse.x <= px + cellW && canvasMouse.y >= py && canvasMouse.y <= py + cellH) {
          selectedHistoCell = c.id;
          SoundFX.playBeep();
          if (histoPromptText) {
            histoPromptText.innerHTML = `Selected <strong style="color: #38bdf8;">Cell #${c.id}</strong>. What is its mitotic stage?`;
          }
          if (histoFeedbackBanner) {
            histoFeedbackBanner.style.display = "none";
          }
        }
      });
    }
  };

  canvas?.addEventListener("mousemove", handleMouseMove);
  canvas?.addEventListener("mouseleave", handleMouseLeave);
  canvas?.addEventListener("click", handleCanvasClick);

  // Event Listeners for Specimen Architecture
  btnSpecimenPlant?.addEventListener("click", () => {
    specimenType = "plant";
    btnSpecimenPlant.className = "btn btn-sm active";
    btnSpecimenPlant.style.background = "#10b981";
    btnSpecimenPlant.style.color = "#022c22";
    btnSpecimenPlant.style.fontWeight = "700";

    btnSpecimenAnimal.className = "btn btn-sm";
    btnSpecimenAnimal.style.background = "transparent";
    btnSpecimenAnimal.style.color = "#94a3b8";
    btnSpecimenAnimal.style.fontWeight = "normal";

    if (bioStatusText) bioStatusText.textContent = "Anastral Spindle • Phragmoplast Active";
    SoundFX.playClick();
  });

  btnSpecimenAnimal?.addEventListener("click", () => {
    specimenType = "animal";
    btnSpecimenAnimal.className = "btn btn-sm active";
    btnSpecimenAnimal.style.background = "#38bdf8";
    btnSpecimenAnimal.style.color = "#082f49";
    btnSpecimenAnimal.style.fontWeight = "700";

    btnSpecimenPlant.className = "btn btn-sm";
    btnSpecimenPlant.style.background = "transparent";
    btnSpecimenPlant.style.color = "#94a3b8";
    btnSpecimenPlant.style.fontWeight = "normal";

    if (bioStatusText) bioStatusText.textContent = "Amphiastral Spindle (Centrioles) • Cleavage Furrow";
    SoundFX.playClick();
  });

  // Staining Mode Toggle
  btnStainFluor?.addEventListener("click", () => {
    stainingMode = "fluorescence";
    btnStainFluor.className = "btn btn-sm active";
    btnStainFluor.style.background = "#38bdf8";
    btnStainFluor.style.color = "#082f49";
    btnStainFluor.style.fontWeight = "700";

    btnStainAceto.className = "btn btn-sm";
    btnStainAceto.style.background = "transparent";
    btnStainAceto.style.color = "#94a3b8";
    btnStainAceto.style.fontWeight = "normal";
    SoundFX.playClick();
  });

  btnStainAceto?.addEventListener("click", () => {
    stainingMode = "acetocarmine";
    btnStainAceto.className = "btn btn-sm active";
    btnStainAceto.style.background = "#ec4899";
    btnStainAceto.style.color = "#500724";
    btnStainAceto.style.fontWeight = "700";

    btnStainFluor.className = "btn btn-sm";
    btnStainFluor.style.background = "transparent";
    btnStainFluor.style.color = "#94a3b8";
    btnStainFluor.style.fontWeight = "normal";
    SoundFX.playClick();
  });

  // Tab View Switcher
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
    if (histoToolbar) histoToolbar.style.display = "none";
    if (organelleInspectorBox) organelleInspectorBox.style.display = "flex";
    if (histoChallengeCard) histoChallengeCard.style.display = "none";
    SoundFX.playClick();
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
    if (histoToolbar) histoToolbar.style.display = "flex";
    if (organelleInspectorBox) organelleInspectorBox.style.display = "none";
    if (histoChallengeCard) histoChallengeCard.style.display = "block";
    SoundFX.playClick();
  });

  // Histology Filter Buttons
  document.querySelectorAll(".histo-filter-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".histo-filter-btn").forEach(b => {
        b.classList.remove("active");
        b.style.background = "transparent";
      });
      btn.classList.add("active");
      btn.style.background = "#10b981";
      btn.style.color = "#022c22";
      histoFilter = btn.getAttribute("data-filter");
      SoundFX.playClick();
    });
  });

  // Student Classification Challenge Buttons
  document.querySelectorAll(".btn-classify").forEach(btn => {
    btn.addEventListener("click", (e) => {
      if (!selectedHistoCell) {
        if (histoPromptText) {
          histoPromptText.innerHTML = `<span style="color: #fbbf24;">⚠️ Please click a cell on the grid first!</span>`;
        }
        return;
      }
      const chosenPhase = btn.getAttribute("data-phase");
      const targetCell = histologyCells.find(c => c.id === selectedHistoCell);
      if (!targetCell) return;

      targetCell.userClassified = chosenPhase;
      studentScore.total++;
      const isCorrect = chosenPhase === targetCell.actualPhase;
      if (isCorrect) studentScore.correct++;

      const pct = Math.round((studentScore.correct / studentScore.total) * 100);
      if (histoScoreBadge) {
        histoScoreBadge.textContent = `Score: ${studentScore.correct}/${studentScore.total} (${pct}%)`;
      }

      if (histoFeedbackBanner) {
        histoFeedbackBanner.style.display = "block";
        if (isCorrect) {
          histoFeedbackBanner.style.background = "rgba(16, 185, 129, 0.15)";
          histoFeedbackBanner.style.border = "1px solid #10b981";
          histoFeedbackBanner.style.color = "#34d399";
          histoFeedbackBanner.innerHTML = `✓ <strong>Correct!</strong> Cell #${targetCell.id} is in <em>${targetCell.actualPhase.toUpperCase()}</em>.`;
          SoundFX.playClick();
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

  // Playback Controls
  playBtn?.addEventListener("click", () => {
    isPlaying = !isPlaying;
    if (isPlaying) {
      playBtn.textContent = "⏸ Pause Cycle";
      playBtn.className = "btn btn-primary btn-sm";
    } else {
      playBtn.textContent = "▶ Resume Cycle";
      playBtn.className = "btn btn-secondary btn-sm";
    }
    SoundFX.playClick();
  });

  stepPrevBtn?.addEventListener("click", () => {
    currentPhaseIdx = (currentPhaseIdx - 1 + PHASES.length) % PHASES.length;
    phaseProgress = 0.0;
    updatePhaseJumpPills();
    SoundFX.playClick();
  });

  stepNextBtn?.addEventListener("click", () => {
    currentPhaseIdx = (currentPhaseIdx + 1) % PHASES.length;
    phaseProgress = 0.0;
    updatePhaseJumpPills();
    SoundFX.playClick();
  });

  document.querySelectorAll(".phase-jump-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(btn.getAttribute("data-phase"), 10);
      currentPhaseIdx = idx;
      phaseProgress = 0.0;
      updatePhaseJumpPills();
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
    SoundFX.playClick();
  });

  viewPhoto?.addEventListener("click", () => {
    viewPhoto.classList.add("active");
    viewSim.classList.remove("active");
    viewPhoto.style.background = "";
    viewSim.style.background = "transparent";
    if (photoOverlay) photoOverlay.style.display = "block";
    SoundFX.playClick();
  });

  exportBtn?.addEventListener("click", () => {
    const { mi, phaseCounts } = calculateMitoticIndex();
    exportLabDataCsv({
      title: "Cell Cycle & Mitotic Index Cytogenetics Telemetry",
      labId: "mitosis",
      parameters: {
        "Specimen Tissue": `Allium Cepa (${specimenType === "plant" ? "Plant Meristem" : "Animal Somatic Model"})`,
        "Microscopy Staining": stainingMode === "fluorescence" ? "Confocal DAPI/GFP-Tubulin" : "Brightfield Acetocarmine/Feulgen",
        "Spindle Toxin": hasColchicine ? "Colchicine (Metaphase SAC Arrest Active)" : "None (Normal Mitotic Spindle)",
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
  updatePhaseJumpPills();
  animId = requestAnimationFrame(loop);

  return () => {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("resize", setupHiDPICanvas);
    canvas?.removeEventListener("mousemove", handleMouseMove);
    canvas?.removeEventListener("mouseleave", handleMouseLeave);
    canvas?.removeEventListener("click", handleCanvasClick);
  };
}
