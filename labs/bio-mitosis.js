// Edugates-ClipSAT Science Labs - Biology: Cell Cycle & Mitosis Suite
// 60 FPS Precision Mitotic Cytogenetics & Histology Simulation:
// Cell Cycle Phases: Interphase (G₁, S, G₂), Prophase & Prometaphase, Metaphase, Anaphase, Telophase & Cytokinesis,
// Spindle Microtubules, Kinetochore Alignment, Sister Chromatid Disjunction,
// Allium cepa (Onion Root Tip) Meristem Histological Cell-Counting Grid,
// Mitotic Index: MI = (Mitotic Cells / Total Cells) × 100%,
// Phase Duration Calculation: t_phase = (N_phase / N_total) × 1440 min (24-hr cycle),
// Spindle Poison Chemotherapy Treatment (Colchicine Metaphase Arrest & Taxol Microtubule Freeze),
// Confocal Laser Scanning Multi-Channel Splitter (DAPI / GFP / CENP),
// Draggable Calibrated Ocular Micrometer (Graticule) & Real-Time Laser Line Profile Scanner.

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
    { key: "metaphase", name: "Metaphase (Equatorial Plate)", shortName: "Metaphase", color: "#818cf8", durationPct: 6 },
    { key: "anaphase", name: "Anaphase (A & B Disjunction)", shortName: "Anaphase", color: "#f43f5e", durationPct: 4 },
    { key: "telophase", name: "Telophase & Cytokinesis", shortName: "Telophase", color: "#10b981", durationPct: 3 }
  ];

  // State Variables
  let activeTab = "animator"; // "animator" or "histology"
  let specimenType = "plant"; // "plant" (Allium cepa) or "animal" (Mammalian somatic)
  let stainingMode = "acetocarmine"; // "acetocarmine" (Brightfield real micrograph slide, default) or "fluorescence" (Confocal DAPI/GFP)
  let activeChannel = "all"; // "all", "dapi", "gfp", "kineto"
  let currentPhaseIdx = 0; // 0..4
  let phaseProgress = 0.0; // 0.0 to 1.0 within phase
  let simTime = 0.0;
  let isPlaying = false; // STARTS PAUSED BY DEFAULT: Solves auto-mode confusion, enabling interactive manual study!
  let playMode = "step"; // "step" (pauses at ends of stages) or "cycle" (continuous loop)
  let animSpeed = 1.0;
  let fineFocus = 0.0; // Z-axis focal depth in µm (-3.0 to +3.0 µm, 0 is sharp)
  
  // Pharmacological Spindle Assay
  let drugCondition = "control"; // "control", "colchicine", "taxol"
  let hasColchicine = false; // Spindle poison halts at Metaphase SAC!
  let hasTaxol = false; // Spindle stabilizer freezes microtubule depolymerization!

  // Interactive Microscopy Tools
  let showGraticule = false;
  let graticulePos = { x: 340, y: 160, isDragging: false, dragStartX: 0, dragStartY: 0 };
  let showIntensityScan = false;

  // Interactive Inspection & Histology Diagnostics
  let canvasMouse = { x: -1, y: -1, isOver: false };
  let selectedHistoCell = null;
  let histoFilter = "all"; // "all" or phase key
  let studentScore = { correct: 0, total: 0 };
  let tallyCounts = { interphase: 0, prophase: 0, metaphase: 0, anaphase: 0, telophase: 0 };
  let tallyTotal = 0;

  // Cytoplasmic Streaming (Cyclosis) in Meristematic Cytoplasm
  const cyclosisGranules = [];
  for (let i = 0; i < 40; i++) {
    cyclosisGranules.push({
      ang: Math.random() * Math.PI * 2,
      radX: 110 + Math.random() * 50,
      radY: 80 + Math.random() * 40,
      speed: 0.35 + Math.random() * 0.5,
      size: 1.5 + Math.random() * 2,
      phaseOffset: Math.random() * Math.PI * 2
    });
  }

  // Histology Grid (Allium cepa meristem sample: 48 interactive histological cells)
  const histologyCells = [];
  const TOTAL_CELLS = 48;

  function initHistologyCells() {
    histologyCells.length = 0;
    // Representative biological distribution in onion root tip apical meristem
    const phaseDist = [
      { phase: "interphase", count: hasColchicine ? 14 : (hasTaxol ? 16 : 31) },
      { phase: "prophase", count: hasColchicine ? 4 : (hasTaxol ? 5 : 7) },
      { phase: "metaphase", count: hasColchicine ? 28 : (hasTaxol ? 24 : 5) },
      { phase: "anaphase", count: hasColchicine ? 1 : (hasTaxol ? 1 : 3) },
      { phase: "telophase", count: hasColchicine ? 1 : (hasTaxol ? 2 : 2) }
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
        nucleolusOffset: ((i * 7) % 6) - 3,
        cellWidthJitter: 98 + ((i * 13) % 15),
        chromatinSeed: ((i * 31) % 100) / 100
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

  // Real brightfield photomicrographs (Allium cepa root tip squash, aceto-orcein, 1000x).
  // All frames share the same cell framing so phases can crossfade in place.
  const MICROGRAPH_KEYS = ["interphase", "prophase", "metaphase", "anaphase", "telophase", "c_metaphase"];
  const micrographs = {};
  function loadMicrograph(name) {
    if (!micrographs[name] && typeof Image !== "undefined") {
      const img = new Image();
      img.decoding = "async";
      img.src = `assets/labs/mitosis/${name}.jpg`;
      micrographs[name] = img;
    }
    return micrographs[name];
  }
  // Plant (Allium cepa) set is needed immediately; animal (whitefish blastula) set loads shortly after.
  MICROGRAPH_KEYS.forEach((k) => loadMicrograph(k));
  setTimeout(() => MICROGRAPH_KEYS.forEach((k) => loadMicrograph(`animal_${k}`)), 1200);

  // spec: "plant" (Allium cepa root tip, aceto-orcein) or "animal" (whitefish blastula, haematoxylin & eosin)
  function getPhaseImage(phaseKey, spec = specimenType) {
    const base = phaseKey === "metaphase" && hasColchicine ? "c_metaphase" : phaseKey;
    const img = loadMicrograph(spec === "animal" ? `animal_${base}` : base);
    return img && img.complete && img.naturalWidth > 0 ? img : null;
  }

  // Calibration of the real micrographs: a ~9 µm nucleus spans ~180 screen px  =>  20 px per µm.
  const PX_PER_UM = 20;

  function smoothstep(e0, e1, x) {
    const t = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1);
    return t * t * (3 - 2 * t);
  }

  initHistologyCells();

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

      <!-- Secondary Biological Controls & Microscopy Optical Toolbar -->
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
            <button id="btn-stain-aceto" class="btn btn-sm active" style="padding: 3px 10px; font-size: 0.75rem; border: none; border-radius: 4px; background: #f43f5e; color: #ffffff; font-weight: 700;" title="Real brightfield photomicrographs of a stained onion root tip squash">
              🔬 Real Slide (Aceto-orcein)
            </button>
            <button id="btn-stain-fluor" class="btn btn-sm" style="padding: 3px 10px; font-size: 0.75rem; border: none; border-radius: 4px; background: transparent; color: #cbd5e1; font-weight: 600;" title="Schematic confocal model with separable DNA / tubulin / kinetochore channels">
              ✨ Confocal Model (DAPI / GFP)
            </button>
          </div>
        </div>

        <!-- Confocal Laser Channel Splitter (Visible when Confocal is selected) -->
        <div id="confocal-channels-wrapper" style="display: none; align-items: center; gap: 6px;">
          <span style="font-size: 0.75rem; font-weight: 700; color: #cbd5e1; text-transform: uppercase;">Channels:</span>
          <div class="btn-group" style="display: flex; background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border-color); border-radius: 6px; padding: 2px;">
            <button class="btn btn-sm channel-btn active" data-chan="all" style="padding: 3px 8px; font-size: 0.72rem; border: none; border-radius: 4px; background: rgba(56, 189, 248, 0.25); color: #38bdf8; font-weight: 700;">Merged RGB</button>
            <button class="btn btn-sm channel-btn" data-chan="dapi" style="padding: 3px 8px; font-size: 0.72rem; border: none; border-radius: 4px; background: transparent; color: #7dd3fc; font-weight: 600;">DAPI (DNA)</button>
            <button class="btn btn-sm channel-btn" data-chan="gfp" style="padding: 3px 8px; font-size: 0.72rem; border: none; border-radius: 4px; background: transparent; color: #34d399; font-weight: 600;">GFP (Tubulin)</button>
            <button class="btn btn-sm channel-btn" data-chan="kineto" style="padding: 3px 8px; font-size: 0.72rem; border: none; border-radius: 4px; background: transparent; color: #f43f5e; font-weight: 600;">CENP (Kineto)</button>
          </div>
        </div>

        <!-- Stage Measurement & Line Scan Tools -->
        <div style="display: flex; align-items: center; gap: 6px;">
          <button id="btn-toggle-graticule" class="btn btn-secondary btn-sm" style="padding: 4px 10px; font-size: 0.74rem;" title="Toggle draggable calibrated ocular micrometer ruler">
            📏 Ocular Micrometer
          </button>
          <button id="btn-toggle-profile" class="btn btn-secondary btn-sm" style="padding: 4px 10px; font-size: 0.74rem;" title="Toggle real-time confocal laser line intensity scan">
            📊 Line Scan (Densitometry)
          </button>
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
              <button id="btn-tab-histo" class="btn btn-sm" style="font-size: 0.75rem; background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); color: #cbd5e1; padding: 5px 12px; border-radius: 6px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
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
              <input type="range" id="slider-fine-focus" min="-3.0" max="3.0" step="0.1" value="0.0" style="width: 100%; accent-color: #10b981; cursor: ew-resize;" title="Adjust focal depth to simulate true microscope depth of field" />
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

          <!-- Pharmacological Spindle Poison & Chemotherapy Assay -->
          <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.78rem; font-weight: 700; color: #cbd5e1; text-transform: uppercase;">
                💊 Pharmacological Spindle Assay
              </span>
              <span id="drug-status-badge" class="badge" style="font-size: 0.68rem; background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3);">
                Untreated Control
              </span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-bottom: 8px;">
              <button class="btn btn-secondary btn-sm drug-pill-btn active" data-drug="control" style="font-size: 0.72rem; padding: 5px 6px; border: 1px solid #10b981; color: #10b981; font-weight: 700;">
                🟢 Control
              </button>
              <button class="btn btn-secondary btn-sm drug-pill-btn" data-drug="colchicine" style="font-size: 0.72rem; padding: 5px 6px; border: 1px solid var(--border-color); color: #cbd5e1; font-weight: 600;">
                🔴 Colchicine
              </button>
              <button class="btn btn-secondary btn-sm drug-pill-btn" data-drug="taxol" style="font-size: 0.72rem; padding: 5px 6px; border: 1px solid var(--border-color); color: #cbd5e1; font-weight: 600;">
                🟣 Taxol
              </button>
            </div>
            <div id="drug-mechanism-text" style="font-size: 0.72rem; color: #94a3b8; line-height: 1.4;">
              Normal microtubule dynamic instability; bi-oriented tension satisfies SAC and permits Anaphase APC/C activation.
            </div>
            <!-- Hidden compatibility checkbox for existing selectors and test scripts -->
            <input type="checkbox" id="check-colchicine" style="display: none;" />
            <span id="colchicine-toggle-span" style="display: none;"></span>
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

          <!-- Histology Identification Challenge & Clinical Tally Keypad -->
          <div id="histo-challenge-card" style="display: none; background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 8px; padding: 12px;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
              <span>🔬 Clinical Cytology Tally Keypad</span>
              <span id="histo-score-badge" style="color: #fbbf24; font-family: monospace; font-size: 0.72rem;">Score: 0/0 (0%)</span>
            </div>
            <div id="histo-prompt-text" style="font-size: 0.76rem; color: #e2e8f0; margin-bottom: 8px;">
              Click cells on the 48-cell meristem slide to classify or tally:
            </div>
            <div id="histo-classify-buttons" style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
              <button class="btn btn-sm btn-secondary btn-classify" data-phase="interphase" style="font-size: 0.7rem; justify-content: space-between;">
                <span>⚪ Interphase (1)</span> <span id="tally-interphase" style="color: #38bdf8; font-weight: 700;">0</span>
              </button>
              <button class="btn btn-sm btn-secondary btn-classify" data-phase="prophase" style="font-size: 0.7rem; justify-content: space-between;">
                <span>🟡 Prophase (2)</span> <span id="tally-prophase" style="color: #f59e0b; font-weight: 700;">0</span>
              </button>
              <button class="btn btn-sm btn-secondary btn-classify" data-phase="metaphase" style="font-size: 0.7rem; justify-content: space-between;">
                <span>🔵 Metaphase (3)</span> <span id="tally-metaphase" style="color: #818cf8; font-weight: 700;">0</span>
              </button>
              <button class="btn btn-sm btn-secondary btn-classify" data-phase="anaphase" style="font-size: 0.7rem; justify-content: space-between;">
                <span>🔴 Anaphase (4)</span> <span id="tally-anaphase" style="color: #f43f5e; font-weight: 700;">0</span>
              </button>
              <button class="btn btn-sm btn-secondary btn-classify" data-phase="telophase" style="grid-column: span 2; font-size: 0.7rem; justify-content: space-between;">
                <span>🟢 Telophase &amp; Cytokinesis (5)</span> <span id="tally-telophase" style="color: #10b981; font-weight: 700;">0</span>
              </button>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 0.72rem;">
              <span style="color: #94a3b8;">Total Counted: <b id="tally-total-display" style="color: #f8fafc;">0</b>/48</span>
              <span style="color: #94a3b8;">Student MI: <b id="student-mi-display" style="color: #10b981;">0.0%</b></span>
              <button id="btn-reset-tally" class="btn btn-secondary btn-sm" style="font-size: 0.68rem; padding: 2px 6px;">⟲ Reset Tally</button>
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
  const confocalChannelsWrapper = document.getElementById("confocal-channels-wrapper");
  const btnToggleGraticule = document.getElementById("btn-toggle-graticule");
  const btnToggleProfile = document.getElementById("btn-toggle-profile");

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
  const drugStatusBadge = document.getElementById("drug-status-badge");
  const drugMechanismText = document.getElementById("drug-mechanism-text");

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
  const tallyInterphase = document.getElementById("tally-interphase");
  const tallyProphase = document.getElementById("tally-prophase");
  const tallyMetaphase = document.getElementById("tally-metaphase");
  const tallyAnaphase = document.getElementById("tally-anaphase");
  const tallyTelophase = document.getElementById("tally-telophase");
  const tallyTotalDisplay = document.getElementById("tally-total-display");
  const studentMiDisplay = document.getElementById("student-mi-display");
  const btnResetTally = document.getElementById("btn-reset-tally");

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
      interphase: "Relaxed diffuse euchromatin network; nucleolus active; centrosome/polar MTOCs duplicate",
      prophase: "Condensin helical coiling into sister chromatids; phosphorylated lamin envelope vesiculation; spindle forms",
      metaphase: "8 bi-oriented paired chromosomes congressed at equator; K-fibers experience ~35 pN bipolar SAC tension",
      anaphase: "Separase cleaves cohesin rings; sister chromatids disjoin poleward (Anaphase A/B)",
      telophase: "Daughter nuclei reform from coalescing vesicles; chromatin decondenses; phragmoplast/cleavage furrow"
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
      if (drugCondition === "colchicine") {
        metricMiDesc.innerHTML = `<span style="color: #f43f5e; font-weight: 700;">Colchicine Metaphase Arrest:</span> Mitotic index spiked to ${mi.toFixed(1)}% due to irreversible spindle failure at the Spindle Assembly Checkpoint (SAC).`;
      } else if (drugCondition === "taxol") {
        metricMiDesc.innerHTML = `<span style="color: #c084fc; font-weight: 700;">Taxol (Paclitaxel) Freeze:</span> Mitotic index increased to ${mi.toFixed(1)}% due to hyper-stabilized microtubules blocking Anaphase A.`;
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
        specimenType === "plant" ? "• Polar organizer MTOCs prepare anastral spindle" : "• Centrosome duplicates with orthogonal centriole pairs",
        "• Intact double nuclear envelope with 24 octagonal nuclear pore complexes",
        "• Active spherical nucleolus transcribing 40S & 60S pre-ribosomes",
        "• Cyclosis cytoplasmic streaming circulates metabolic granules around nucleus"
      ],
      1: [
        "• Condensin I/II complexes coil diffuse chromatin into 8 thick chromosomes",
        "• CDK1-cyclin B phosphorylation triggers nuclear envelope vesiculation",
        "• Dense nucleolus disperses into karyolymph",
        specimenType === "plant" ? "• Anastral bipolar spindle assembles from polar organizer caps" : "• Centrosomes separate toward opposite poles nucleating asters"
      ],
      2: [
        "• Chromosomes congress along the equatorial Metaphase Plate",
        "• Bi-oriented sister kinetochores face opposite spindle poles",
        "• K-fibers establish ~35 pN mechanical tension at centromeres",
        drugCondition === "colchicine" 
          ? "⚠️ SAC ACTIVE: Colchicine depolymerizes tubulin -> Mad2/BubR1 recruitment!" 
          : (drugCondition === "taxol" 
              ? "⚠️ TAXOL ARREST: Microtubules hyper-stabilized; depolymerization blocked!"
              : "• Spindle Assembly Checkpoint (SAC) tension satisfied; APC/C poised")
      ],
      3: [
        "• APC/C activates separase protease, cleaving cohesin Scc1 rings",
        "• 16 daughter chromosomes disjoin poleward with leading kinetochore apexes",
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
  function drawAnatomicalChromosome(ctx, cx, cy, angle, len, armWidth, bend, colPrimary, colHighlight, kinetoColor, tensionOffset = 0, isColchicine = false) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // Apply focal depth blur / alpha
    const focusBlur = Math.abs(fineFocus);
    if (focusBlur > 0.3) {
      ctx.globalAlpha = Math.max(0.4, 1.0 - focusBlur * 0.25);
    }

    // Two parallel sister chromatids with coiled chromatin texture
    [-4.2, 4.2].forEach(offsetY => {
      // Chromatid backbone
      ctx.beginPath();
      ctx.moveTo(-len / 2, offsetY);
      ctx.quadraticCurveTo(0, offsetY + bend, len / 2, offsetY);
      ctx.strokeStyle = colPrimary;
      ctx.lineWidth = armWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      // Inner coil striations (condensin helical coiling)
      ctx.strokeStyle = colHighlight;
      ctx.lineWidth = armWidth * 0.42;
      ctx.beginPath();
      ctx.moveTo(-len / 2 + 2, offsetY);
      ctx.quadraticCurveTo(0, offsetY + bend, len / 2 - 2, offsetY);
      ctx.stroke();

      // Helical chromatin bead highlights
      const steps = 7;
      for (let s = 1; s < steps; s++) {
        const t = (s / steps) - 0.5;
        const px = t * len;
        const py = offsetY + bend * (1 - 4 * t * t);
        ctx.fillStyle = colHighlight;
        ctx.beginPath();
        ctx.arc(px, py, armWidth * 0.24, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Primary Constriction (Centromeric Waist)
    ctx.fillStyle = "#020617";
    ctx.beginPath();
    ctx.arc(0, bend * 0.5, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Trilaminar Kinetochores on both lateral faces
    if (activeChannel === "all" || activeChannel === "kineto") {
      const kDist = 5.5 + tensionOffset;
      [-kDist, kDist].forEach(ky => {
        // Outer kinetochore corona glow
        ctx.fillStyle = isColchicine ? "#ef4444" : kinetoColor;
        ctx.beginPath();
        ctx.arc(0, bend * 0.5 + ky, isColchicine ? 4.2 : 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Inner kinetochore CENP-A anchor core
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(0, bend * 0.5 + ky, 1.4, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    ctx.restore();
  }

  // Draw 60 FPS Cytogenetics Animator (Centered Viewport with High Biological Realism)
  function drawCellAnimator() {
    if (!ctx) return;
    const curPhase = PHASES[currentPhaseIdx];

    // True Center of Canvas Viewport
    const cx = 470;
    const cy = 245;
    const ocularR = 218;

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
    ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
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
      illumGrad.addColorStop(0, "#fffef5");
      illumGrad.addColorStop(0.7, "#fdf6e2");
      illumGrad.addColorStop(1, "#f3ecd8");
    }
    ctx.fillStyle = illumGrad;
    ctx.fillRect(cx - ocularR, cy - ocularR, ocularR * 2, ocularR * 2);

    // Apply Fine Focus optical blur / sharpness
    const focusBlur = Math.abs(fineFocus);
    if (focusBlur > 0.2) {
      ctx.filter = `blur(${Math.min(focusBlur * 1.4, 4.0).toFixed(1)}px)`;
    }

    // Real photomicrograph path (brightfield plant slide)
    if (!isFluor && getPhaseImage("interphase")) {
      drawMicrographView(cx, cy, ocularR, focusBlur);
      drawMicrographInspector(cx, cy, ocularR);
      ctx.restore(); // Restore clip
      drawAnimatorOverlays();
      return;
    }

    // 3. Meristematic Tissue Layer & Cell Boundary: Plant vs Animal Architecture
    if (specimenType === "plant") {
      // Plant Cell (Allium cepa apical meristem file)
      const pw = 350;
      const ph = 270;
      const rx = cx - pw / 2;
      const ry = cy - ph / 2;

      // Adjacent neighboring cells in the meristem file (subtle context walls)
      ctx.strokeStyle = isFluor ? "rgba(16, 185, 129, 0.25)" : "rgba(180, 83, 9, 0.25)";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(rx - 80, ry - 50); ctx.lineTo(rx + pw + 80, ry - 50); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rx - 80, ry + ph + 50); ctx.lineTo(rx + pw + 80, ry + ph + 50); ctx.stroke();
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

      // Dynamic Cytoplasmic Streaming (Cyclosis)
      ctx.fillStyle = isFluor ? "rgba(52, 211, 153, 0.45)" : "rgba(217, 119, 6, 0.45)";
      cyclosisGranules.forEach(g => {
        const curAng = g.ang + simTime * g.speed * 0.35;
        const gx = cx + Math.cos(curAng) * g.radX;
        const gy = cy + Math.sin(curAng) * g.radY;
        ctx.beginPath();
        ctx.arc(gx, gy, g.size, 0, Math.PI * 2);
        ctx.fill();
      });

    } else {
      // Animal Cell: Flexible Plasma Membrane with Cortical Actin Cytoskeleton
      let rX = 155;
      let rY = 155;

      if (currentPhaseIdx === 3) {
        rX = 155 + phaseProgress * 25;
        rY = 155 - phaseProgress * 18;
      } else if (currentPhaseIdx === 4) {
        rX = 180;
        rY = 138;
      }

      if (currentPhaseIdx === 4) {
        // Animal Telophase: Deep Actin-Myosin Cleavage Furrow pinching inward
        const pinch = 30 + phaseProgress * 48;
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

    // 4. Cytoplasmic Inclusions: Mitochondria
    if (activeChannel === "all" || activeChannel === "kineto") {
      const mitoCoords = [
        { x: cx - 120, y: cy - 95, ang: 0.4 },
        { x: cx + 120, y: cy - 85, ang: -0.5 },
        { x: cx - 115, y: cy + 90, ang: -0.3 },
        { x: cx + 115, y: cy + 90, ang: 0.6 }
      ];
      mitoCoords.forEach(m => {
        ctx.save();
        ctx.translate(m.x, m.y);
        ctx.rotate(m.ang);
        ctx.fillStyle = isFluor ? "rgba(245, 158, 11, 0.45)" : "rgba(217, 119, 6, 0.35)";
        ctx.strokeStyle = isFluor ? "#fbbf24" : "#d97706";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(-11, -6, 22, 12, 5);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });
    }

    // 5. Centrosomes / MTOCs & Spindle Apparatus
    const leftPoleX = cx - 135;
    const rightPoleX = cx + 135;

    if (currentPhaseIdx >= 1 && currentPhaseIdx <= 3) {
      if (activeChannel === "all" || activeChannel === "gfp") {
        if (specimenType === "animal") {
          // Animal Cell: Amphiastral Spindle with Centrosomes & Orthogonal Centrioles
          [leftPoleX, rightPoleX].forEach(posX => {
            const pcmGrad = ctx.createRadialGradient(posX, cy, 2, posX, cy, 18);
            pcmGrad.addColorStop(0, "rgba(250, 204, 21, 0.85)");
            pcmGrad.addColorStop(0.5, "rgba(245, 158, 11, 0.35)");
            pcmGrad.addColorStop(1, "transparent");
            ctx.fillStyle = pcmGrad;
            ctx.beginPath();
            ctx.arc(posX, cy, 18, 0, Math.PI * 2);
            ctx.fill();

            // Centriole pair
            ctx.strokeStyle = "#fef08a";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(posX - 2, cy - 7); ctx.lineTo(posX - 2, cy + 7);
            ctx.moveTo(posX - 7, cy + 2); ctx.lineTo(posX + 7, cy + 2);
            ctx.stroke();

            // Astral Microtubules radiating outward
            ctx.strokeStyle = isFluor ? "rgba(52, 211, 153, 0.45)" : "rgba(245, 158, 11, 0.35)";
            ctx.lineWidth = 1;
            for (let a = 0; a < 10; a++) {
              const ang = (a / 10) * Math.PI * 2;
              ctx.beginPath();
              ctx.moveTo(posX, cy);
              ctx.lineTo(posX + Math.cos(ang) * 28, cy + Math.sin(ang) * 28);
              ctx.stroke();
            }
          });
        } else {
          // Plant Cell (Allium cepa): Anastral Spindle! NO Centrioles!
          // Broad polar organizer caps (MTOCs) with gamma-tubulin ring complexes
          [leftPoleX, rightPoleX].forEach(posX => {
            ctx.strokeStyle = isFluor ? "rgba(52, 211, 153, 0.8)" : "rgba(217, 119, 6, 0.75)";
            ctx.lineWidth = 4.0;
            ctx.beginPath();
            ctx.arc(posX, cy, 22, posX < cx ? -Math.PI / 2 : Math.PI / 2, posX < cx ? Math.PI / 2 : 3 * Math.PI / 2);
            ctx.stroke();

            // Polar Organizer gamma-TuRC nucleating centers
            ctx.fillStyle = "#34d399";
            for (let g = -3; g <= 3; g++) {
              ctx.beginPath();
              ctx.arc(posX, cy + g * 7, 2.8, 0, Math.PI * 2);
              ctx.fill();
            }
          });
        }

        // Spindle Microtubules: Pharmacological Response
        if (drugCondition === "colchicine") {
          // Colchicine depolymerizes tubulin into diffuse heterodimers!
          ctx.fillStyle = isFluor ? "rgba(52, 211, 153, 0.75)" : "rgba(239, 68, 68, 0.75)";
          for (let t = 0; t < 65; t++) {
            const tx = cx - 130 + ((t * 31 + Math.sin(simTime * 2 + t) * 10) % 260);
            const ty = cy - 90 + ((t * 27 + Math.cos(simTime * 2 + t) * 10) % 180);
            ctx.fillRect(tx, ty, 3.5, 3.5);
          }
        } else if (drugCondition === "taxol") {
          // Taxol hyper-stabilizes microtubules into rigid, dense bundles!
          ctx.strokeStyle = isFluor ? "#10b981" : "#d97706";
          ctx.lineWidth = 2.4;
          for (let f = -6; f <= 6; f++) {
            ctx.beginPath();
            ctx.moveTo(leftPoleX, cy);
            ctx.quadraticCurveTo(cx, cy + f * 22, rightPoleX, cy);
            ctx.stroke();
          }
        } else {
          // Continuous healthy spindle fibers with dynamic curvature
          ctx.strokeStyle = isFluor ? "rgba(16, 185, 129, 0.55)" : "rgba(245, 158, 11, 0.5)";
          ctx.lineWidth = 1.5;
          for (let f = -5; f <= 5; f++) {
            ctx.beginPath();
            ctx.moveTo(leftPoleX, cy);
            ctx.quadraticCurveTo(cx, cy + f * 26, rightPoleX, cy);
            ctx.stroke();
          }
        }
      }
    }

    // 6. Chromatin / Chromosome Cytological Dynamics by Mitotic Phase
    if (activeChannel === "all" || activeChannel === "dapi") {
      if (currentPhaseIdx === 0) {
        // ==========================================
        // PHASE 0: INTERPHASE (G₁, S, G₂)
        // ==========================================
        const nucR = 88;

        // Double Nuclear Envelope (Inner + Outer Membrane Bilayers)
        ctx.strokeStyle = isFluor ? "#38bdf8" : "#831843";
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.arc(cx, cy, nucR, 0, Math.PI * 2);
        ctx.stroke();

        // Inner Nuclear Lamina meshwork
        ctx.strokeStyle = isFluor ? "rgba(56, 189, 248, 0.45)" : "rgba(131, 24, 67, 0.45)";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(cx, cy, nucR - 3.5, 0, Math.PI * 2);
        ctx.stroke();

        // 24 Octagonal Nuclear Pore Complexes (NPCs) with Central Transporters
        for (let n = 0; n < 24; n++) {
          const ang = (n / 24) * Math.PI * 2;
          const nx = cx + Math.cos(ang) * nucR;
          const ny = cy + Math.sin(ang) * nucR;
          ctx.fillStyle = isFluor ? "#7dd3fc" : "#be185d";
          ctx.beginPath();
          ctx.arc(nx, ny, 2.8, 0, Math.PI * 2);
          ctx.fill();
        }

        // Nucleoplasm Background Glow
        const nucGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, nucR);
        nucGrad.addColorStop(0, isFluor ? "rgba(56, 189, 248, 0.22)" : "rgba(190, 24, 93, 0.2)");
        nucGrad.addColorStop(1, isFluor ? "rgba(14, 165, 233, 0.06)" : "rgba(131, 24, 67, 0.06)");
        ctx.fillStyle = nucGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, nucR - 2, 0, Math.PI * 2);
        ctx.fill();

        // Dense Spherical Nucleolus (rRNA transcription & ribosome subunit assembly)
        const nucCore = ctx.createRadialGradient(cx - 28, cy - 20, 3, cx - 28, cy - 20, 22);
        nucCore.addColorStop(0, isFluor ? "#bae6fd" : "#f472b6");
        nucCore.addColorStop(0.5, isFluor ? "#0284c7" : "#be185d");
        nucCore.addColorStop(1, isFluor ? "#0369a1" : "#831843");
        ctx.fillStyle = nucCore;
        ctx.beginPath();
        ctx.arc(cx - 28, cy - 20, 22, 0, Math.PI * 2);
        ctx.fill();

        // Internal Fibrillar Center (FC) speckles
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.beginPath();
        ctx.arc(cx - 32, cy - 24, 2.5, 0, Math.PI * 2);
        ctx.arc(cx - 24, cy - 18, 2.0, 0, Math.PI * 2);
        ctx.fill();

        // Realistic Continuous Euchromatin Network (Hundreds of micro-threads)
        ctx.strokeStyle = isFluor ? "rgba(56, 189, 248, 0.7)" : "rgba(157, 23, 77, 0.7)";
        ctx.lineWidth = 1.6;
        for (let w = 0; w < 16; w++) {
          ctx.beginPath();
          const baseAng = (w / 16) * Math.PI * 2;
          for (let s = 0; s <= 24; s++) {
            const t = s / 24;
            const rad = 14 + t * 68;
            const drift = Math.sin(simTime * 0.9 + w * 2 + s * 0.4) * 4;
            const a = baseAng + t * 2.8 + drift * 0.05;
            const px = cx + Math.cos(a) * rad;
            const py = cy + Math.sin(a) * rad;
            if (s === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }

        // Dense Heterochromatin aggregates (28 constitutive centromeric/telomeric clusters)
        ctx.fillStyle = isFluor ? "rgba(14, 165, 233, 0.9)" : "rgba(131, 24, 67, 0.9)";
        for (let h = 0; h < 28; h++) {
          const hAng = (h / 28) * Math.PI * 2 + h * 0.35;
          const hR = 26 + ((h * 19) % 55);
          const hx = cx + Math.cos(hAng) * hR;
          const hy = cy + Math.sin(hAng) * hR;
          const dNuc = Math.hypot(hx - (cx - 28), hy - (cy - 20));
          if (dNuc > 24) {
            ctx.beginPath();
            ctx.arc(hx, hy, 3.0, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // S-Phase DNA Replication Activity luminescence
        ctx.fillStyle = isFluor ? "rgba(56, 189, 248, 0.1)" : "rgba(244, 63, 94, 0.1)";
        const repPulse = 0.5 + 0.5 * Math.sin(simTime * 2);
        ctx.beginPath();
        ctx.arc(cx, cy, 60 + repPulse * 15, 0, Math.PI * 2);
        ctx.fill();

      } else if (currentPhaseIdx === 1) {
        // ==========================================
        // PHASE 1: PROPHASE & PROMETAPHASE
        // ==========================================
        // Disintegrating Nuclear Envelope (Phosphorylated Lamin Fenestration)
        const fenestrationDash = 8 + phaseProgress * 14;
        ctx.strokeStyle = isFluor ? `rgba(56, 189, 248, ${0.45 - phaseProgress * 0.35})` : `rgba(131, 24, 67, ${0.45 - phaseProgress * 0.35})`;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, fenestrationDash]);
        ctx.beginPath();
        ctx.arc(cx, cy, 88, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Dissolving nuclear membrane vesicle remnants
        for (let v = 0; v < 16; v++) {
          const vang = (v / 16) * Math.PI * 2 + simTime * 0.1;
          const vR = 88 + phaseProgress * 30 * Math.sin(v);
          const vx = cx + Math.cos(vang) * vR;
          const vy = cy + Math.sin(vang) * vR;
          ctx.fillStyle = isFluor ? "#38bdf8" : "#831843";
          ctx.beginPath();
          ctx.arc(vx, vy, 3.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // 8 Condensed Chromosomes (2n = 8 Allium cepa representation)
        const armThickness = 4.8 + phaseProgress * 2.4;
        const chromCoords = [
          { x: cx - 48, y: cy - 45, ang: 0.35, len: 44, bend: 3 },
          { x: cx + 48, y: cy - 40, ang: -0.42, len: 42, bend: -3 },
          { x: cx - 42, y: cy + 46, ang: -0.25, len: 40, bend: 4 },
          { x: cx + 44, y: cy + 48, ang: 0.55, len: 38, bend: -2 },
          { x: cx - 22, y: cy - 15, ang: 0.75, len: 46, bend: -3 },
          { x: cx + 22, y: cy + 15, ang: -0.85, len: 44, bend: 3 },
          { x: cx - 60, y: cy + 10, ang: 0.15, len: 38, bend: 2 },
          { x: cx + 60, y: cy - 10, ang: -0.20, len: 40, bend: -2 }
        ];

        chromCoords.forEach(pos => {
          drawAnatomicalChromosome(ctx, pos.x, pos.y, pos.ang, pos.len, armThickness, pos.bend, dnaMain, dnaHighlight, kinetoColor, 0);
        });

      } else if (currentPhaseIdx === 2) {
        // ==========================================
        // PHASE 2: METAPHASE & SPINDLE ASSEMBLY CHECKPOINT (SAC)
        // ==========================================
        // Equatorial Metaphase Plate Reference Axis
        ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cx, cy - 130);
        ctx.lineTo(cx, cy + 130);
        ctx.stroke();
        ctx.setLineDash([]);

        // 8 Paired Chromosomes congressed along the equator
        const metaphaseYPositions = [cy - 85, cy - 60, cy - 35, cy - 12, cy + 12, cy + 35, cy + 60, cy + 85];
        const chromLengths = [38, 44, 48, 52, 50, 46, 42, 36];

        metaphaseYPositions.forEach((yPos, idx) => {
          // Bipolar mechanical tension breathing oscillation
          const isArrested = (drugCondition === "colchicine");
          const tensionOsc = isArrested ? (Math.sin(simTime * 1.5 + idx) * 8.0) : (Math.sin(simTime * 3.0 + idx) * 1.6);
          const xPos = cx + tensionOsc;

          const armLen = chromLengths[idx];
          drawAnatomicalChromosome(ctx, xPos, yPos, Math.PI / 2, armLen, 6.5, 0, dnaMain, dnaHighlight, kinetoColor, isArrested ? 0 : 1.2, isArrested);

          // Kinetochore coordinates
          const leftKinetoX = xPos - 5.5;
          const rightKinetoX = xPos + 5.5;

          // K-fiber tension tethers connecting to opposite spindle poles
          if (activeChannel === "all" || activeChannel === "gfp") {
            if (drugCondition === "control" || drugCondition === "taxol") {
              ctx.strokeStyle = isFluor ? "rgba(250, 204, 21, 0.75)" : "rgba(217, 119, 6, 0.65)";
              ctx.lineWidth = 2.0;
              ctx.beginPath();
              ctx.moveTo(leftPoleX, cy);
              ctx.lineTo(leftKinetoX, yPos);
              ctx.moveTo(rightPoleX, cy);
              ctx.lineTo(rightKinetoX, yPos);
              ctx.stroke();

              // Green mechanical tension satisfaction glow at kinetochores
              ctx.strokeStyle = "#10b981";
              ctx.lineWidth = 1.4;
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
          }
        });

        if (drugCondition === "colchicine") {
          ctx.fillStyle = "#ef4444";
          ctx.font = "bold 11px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("⚠️ SAC ARREST: LACK OF BIPOLAR TENSION (MAD2 RECRUITED)", cx, cy + 142);
        } else if (drugCondition === "taxol") {
          ctx.fillStyle = "#c084fc";
          ctx.font = "bold 11px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("⚠️ TAXOL FREEZE: MICROTUBULE DEPOLYMERIZATION BLOCKED", cx, cy + 142);
        }

      } else if (currentPhaseIdx === 3) {
        // ==========================================
        // PHASE 3: ANAPHASE (A & B DISJUNCTION)
        // ==========================================
        const sep = 28 + phaseProgress * 85;
        const anaphaseYPositions = [cy - 80, cy - 56, cy - 32, cy - 10, cy + 10, cy + 32, cy + 56, cy + 80];
        const armLengths = [34, 38, 42, 46, 44, 40, 36, 32];

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
          if (activeChannel === "all" || activeChannel === "kineto") {
            ctx.fillStyle = kinetoColor;
            ctx.beginPath();
            ctx.arc(leftApexX, yPos, 3.8, 0, Math.PI * 2);
            ctx.fill();
          }

          // Shortening K-fiber pulling poleward (Anaphase A)
          if (activeChannel === "all" || activeChannel === "gfp") {
            ctx.strokeStyle = isFluor ? "rgba(16, 185, 129, 0.65)" : "rgba(245, 158, 11, 0.55)";
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(leftPoleX, cy);
            ctx.lineTo(leftApexX, yPos);
            ctx.stroke();
          }
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
          if (activeChannel === "all" || activeChannel === "kineto") {
            ctx.fillStyle = kinetoColor;
            ctx.beginPath();
            ctx.arc(rightApexX, yPos, 3.8, 0, Math.PI * 2);
            ctx.fill();
          }

          // Shortening K-fiber pulling poleward (Anaphase A)
          if (activeChannel === "all" || activeChannel === "gfp") {
            ctx.strokeStyle = isFluor ? "rgba(16, 185, 129, 0.65)" : "rgba(245, 158, 11, 0.55)";
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(rightPoleX, cy);
            ctx.lineTo(rightApexX, yPos);
            ctx.stroke();
          }
          ctx.restore();
        });

        // Interpolar Microtubules sliding past each other (Anaphase B spindle elongation)
        if (activeChannel === "all" || activeChannel === "gfp") {
          ctx.strokeStyle = isFluor ? "rgba(52, 211, 153, 0.4)" : "rgba(245, 158, 11, 0.4)";
          ctx.lineWidth = 1.5;
          for (let s = -3; s <= 3; s++) {
            ctx.beginPath();
            ctx.moveTo(cx - 40, cy + s * 16);
            ctx.lineTo(cx + 40, cy + s * 16);
            ctx.stroke();
          }
        }

      } else if (currentPhaseIdx === 4) {
        // ==========================================
        // PHASE 4: TELOPHASE & CYTOKINESIS
        // ==========================================
        [-110, 110].forEach(dx => {
          const dNucX = cx + dx;
          const dNucR = 50;

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
          for (let c = 0; c < 12; c++) {
            const ang = (c / 12) * Math.PI * 2;
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
          if (activeChannel === "all" || activeChannel === "gfp") {
            ctx.strokeStyle = isFluor ? "rgba(52, 211, 153, 0.65)" : "rgba(245, 158, 11, 0.6)";
            ctx.lineWidth = 1.8;
            for (let p = -6; p <= 6; p++) {
              ctx.beginPath();
              ctx.moveTo(cx - 20, cy + p * 15);
              ctx.lineTo(cx + 20, cy + p * 15);
              ctx.stroke();
            }
          }

          // Golgi-derived pectin vesicles fusing centrifugal from center outward
          const plateHeight = 75 + phaseProgress * 115;
          ctx.strokeStyle = isFluor ? "#34d399" : "#fbbf24";
          ctx.lineWidth = 4.2;
          ctx.beginPath();
          ctx.moveTo(cx, cy - plateHeight / 2);
          ctx.lineTo(cx, cy + plateHeight / 2);
          ctx.stroke();

          // Pectin Vesicle beads fusing into the nascent plate
          ctx.fillStyle = "#fef08a";
          for (let v = -5; v <= 5; v++) {
            ctx.beginPath();
            ctx.arc(cx, cy + v * (plateHeight / 11), 3.0, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    // 7. Interactive Hover Cursor & Real-time Organelle Hit-Testing
    if (canvasMouse.isOver) {
      const mx = canvasMouse.x;
      const my = canvasMouse.y;
      const distFromCenter = Math.hypot(mx - cx, my - cy);

      let hitInfo = null;

      if (currentPhaseIdx === 0 && Math.hypot(mx - (cx - 28), my - (cy - 20)) < 26) {
        hitInfo = {
          title: "Dense Nucleolus",
          desc: "Site of pre-rRNA transcription (rDNA loops) and 40S/60S ribosome assembly.",
          tag: "Ribosome Factory"
        };
      } else if (currentPhaseIdx === 0 && distFromCenter < 88) {
        hitInfo = {
          title: "Diffuse Chromatin & Heterochromatin",
          desc: "Uncondensed nucleoprotein fibers (DNA wound around histone octamers); S-phase replication complete.",
          tag: "Genome (2n)"
        };
      } else if (currentPhaseIdx === 2 && Math.abs(mx - cx) < 26 && Math.abs(my - cy) < 100) {
        hitInfo = {
          title: "Metaphase Chromosome & Kinetochore",
          desc: drugCondition === "colchicine" 
            ? "Colchicine depolymerized tubulin; SAC active due to absence of mechanical tension." 
            : (drugCondition === "taxol" 
                ? "Taxol stabilized microtubules; kinetochores locked without dynamic tension."
                : "Cohesin rings hold sister chromatids; kinetochores experience ~35 pN bipolar spindle tension."),
          tag: drugCondition === "colchicine" ? "SAC Halted" : "Bi-Oriented Tension"
        };
      } else if (currentPhaseIdx === 3 && (Math.hypot(mx - (cx - 75), my - cy) < 45 || Math.hypot(mx - (cx + 75), my - cy) < 45)) {
        hitInfo = {
          title: "Disjoined Daughter Chromosomes",
          desc: "Separase cleaved cohesin rings; K-fibers depolymerize at plus-ends, pulling V-shaped chromatids poleward.",
          tag: "Anaphase Disjunction"
        };
      } else if (currentPhaseIdx === 4 && specimenType === "plant" && Math.abs(mx - cx) < 26) {
        hitInfo = {
          title: "Phragmoplast & Developing Cell Plate",
          desc: "Golgi-derived vesicles carry pectin and hemicellulose, fusing centrifugal-outward to build the new middle lamella.",
          tag: "Plant Cytokinesis"
        };
      } else if (Math.hypot(mx - leftPoleX, my - cy) < 30 || Math.hypot(mx - rightPoleX, my - cy) < 30) {
        hitInfo = {
          title: specimenType === "animal" ? "Centrosome & Centriole Pair" : "Polar Organizer MTOC",
          desc: specimenType === "animal" ? "Perpendicular centrioles nucleating astral and spindle microtubules." : "Plant anastral spindle pole containing γ-TuRC nucleating complexes.",
          tag: "Spindle Pole"
        };
      } else if (distFromCenter < ocularR - 10) {
        hitInfo = {
          title: specimenType === "plant" ? "Allium cepa Meristematic Cytoplasm" : "Eukaryotic Somatic Cytosol",
          desc: "Dense cytoplasm with active cyclosis (streaming), mitochondria, ribosomes, and cytoskeletal motor proteins.",
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
    drawAnimatorOverlays();
  }

  // Crossfade the real micrographs according to phase + progress.
  function getMicrographBlend() {
    const key = PHASES[currentPhaseIdx].key;
    const cur = getPhaseImage(key);
    if (currentPhaseIdx === 0) return { a: cur, b: null, t: 0, label: "Interphase" };
    const prev = getPhaseImage(PHASES[currentPhaseIdx - 1].key);
    const t = smoothstep(0.0, 0.35, phaseProgress);
    const name = key === "metaphase" && hasColchicine ? "C-metaphase (colchicine)" : PHASES[currentPhaseIdx].shortName;
    const label = t < 1 ? `Early ${name.toLowerCase()} (transition)` : name;
    return { a: prev || cur, b: cur, t, label };
  }

  function drawMicrographView(cx, cy, ocularR, focusBlur) {
    const blend = getMicrographBlend();
    const size = ocularR * 2 * 1.18;
    // Slow stage drift + slight vibration, like a live eyepiece view
    const driftX = Math.sin(simTime * 0.37) * 1.6 + Math.sin(simTime * 1.9) * 0.35;
    const driftY = Math.cos(simTime * 0.29) * 1.2 + Math.cos(simTime * 2.3) * 0.3;
    const x = cx - size / 2 + driftX;
    const y = cy - size / 2 + driftY;

    // Defocus: blur + loss of contrast, just like turning the fine focus knob
    const blurPx = focusBlur > 0.15 ? Math.min(focusBlur * 1.7, 5.5) : 0;
    const contrast = Math.max(0.6, 1 - focusBlur * 0.11);
    ctx.filter = `${blurPx ? `blur(${blurPx.toFixed(1)}px) ` : ""}contrast(${contrast.toFixed(2)})`;
    ctx.globalAlpha = 1;
    if (blend.a) ctx.drawImage(blend.a, x, y, size, size);
    if (blend.b && blend.b !== blend.a && blend.t > 0) {
      ctx.globalAlpha = blend.t;
      ctx.drawImage(blend.b, x, y, size, size);
    }
    ctx.globalAlpha = 1;
    ctx.filter = "none";

    // Eyepiece field vignette (real oculars darken toward the field stop)
    const vg = ctx.createRadialGradient(cx, cy, ocularR * 0.55, cx, cy, ocularR);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(0.82, "rgba(60,35,15,0.14)");
    vg.addColorStop(1, "rgba(15,8,2,0.62)");
    ctx.fillStyle = vg;
    ctx.fillRect(cx - ocularR, cy - ocularR, ocularR * 2, ocularR * 2);

    // Stage label
    ctx.font = "bold 11px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    const lw = ctx.measureText(blend.label).width + 18;
    ctx.fillStyle = "rgba(15, 23, 42, 0.72)";
    ctx.beginPath();
    ctx.roundRect(cx - lw / 2, cy - ocularR + 14, lw, 20, 10);
    ctx.fill();
    ctx.fillStyle = "#f8fafc";
    ctx.fillText(blend.label, cx, cy - ocularR + 28);
  }

  function drawMicrographInspector(cx, cy, ocularR) {
    if (!canvasMouse.isOver) return;
    const mx = canvasMouse.x;
    const my = canvasMouse.y;
    const dx = Math.abs(mx - cx);
    const dy = Math.abs(my - cy);
    if (Math.hypot(mx - cx, my - cy) > ocularR) return;
    const key = PHASES[currentPhaseIdx].key;
    const sx = mx - cx;
    const sy = my - cy;
    let hit = null;

    if (specimenType === "plant") {
      if (key === "telophase" && dx < 10 && dy < 190) {
        hit = { title: "Cell Plate", desc: "Golgi vesicles fuse in the middle of the cell to build a new wall. Plant cells can't pinch in like animal cells because of the rigid wall.", tag: "Plant Cytokinesis" };
      } else if ((dx > 160 && dx < 192) || (dy > 198 && dy < 216)) {
        hit = { title: "Cellulose Cell Wall", desc: "Rigid wall shared with the neighbouring meristem cells. It barely takes up the orcein stain, so it looks pale tan.", tag: "Cell Wall" };
      } else if (dx < 110 && dy < 110) {
        const info = {
          interphase: ["Interphase Nucleus", "Intact nuclear envelope with loose, granular chromatin. The dark spot is the nucleolus. DNA is copied during S phase.", "G₁ / S / G₂"],
          prophase: ["Condensing Chromosomes", "Chromatin coils into visible threads; the nucleolus fades and the nuclear envelope is about to break down.", "Prophase"],
          metaphase: hasColchicine
            ? ["C-metaphase Chromosomes", "Colchicine stops spindle formation, so chromosomes scatter instead of lining up. Sister chromatids splay into X shapes but stay joined at the centromere. Count them: 2n = 16.", "Colchicine Arrest"]
            : ["Metaphase Plate", "Chromosomes line up across the middle of the cell, each attached to spindle fibres from both poles.", "Metaphase"],
          anaphase: ["Separating Chromatids", "Sister chromatids are pulled to opposite poles. They form V shapes because the centromere leads and the arms trail behind.", "Anaphase"],
          telophase: ["Daughter Nuclei", "Chromosomes decondense at each pole and new nuclear envelopes form.", "Telophase"]
        }[key];
        hit = { title: info[0], desc: info[1], tag: info[2] };
      } else {
        hit = { title: "Cytoplasm", desc: "Dense meristem cytoplasm. Small vacuoles, no chloroplasts (root tip cells are non-photosynthetic).", tag: "Cytoplasm" };
      }
    } else {
      // Animal blastomere: centrosome positions (relative to field centre) differ by phase in the photos
      const CENTRO = {
        interphase: [[-101, 5]],
        prophase: [[0, -109], [0, 110]],
        metaphase: [[-109, -2], [112, 6]],
        anaphase: [[-126, -2], [125, 2]],
        telophase: [[-137, -6], [135, -10]]
      };
      const centros = key === "metaphase" && hasColchicine ? [[-101, 5], [99, -22]] : CENTRO[key];
      const onCentro = centros.some(([ox, oy]) => Math.hypot(sx - ox, sy - oy) < 22);
      if (key === "telophase" && dx < 16 && dy < 45) {
        hit = { title: "Cleavage Furrow", desc: "A contractile ring of actin and myosin II pinches the membrane inward until the cell splits. Animal cells have no wall, so they divide by pinching, not by building a cell plate.", tag: "Animal Cytokinesis" };
      } else if (onCentro) {
        hit = { title: "Centrosome", desc: "A pair of centrioles surrounded by material that nucleates microtubules. The starburst of fibres around it is the aster. Plant cells have no centrioles.", tag: "Spindle Pole" };
      } else if (key !== "telophase" && Math.abs(Math.hypot(sx, sy) - 187) < 9) {
        hit = { title: "Plasma Membrane", desc: "Only a thin membrane surrounds the cell: no cellulose wall, so the cell stays round and can pinch in two at the end of mitosis.", tag: "Cell Boundary" };
      } else if (dx < 115 && dy < 115) {
        const info = {
          interphase: ["Interphase Nucleus", "Intact nucleus with a nucleolus. The small dark pink dot beside it is the centrosome, duplicated during S phase.", "G₁ / S / G₂"],
          prophase: ["Condensing Chromosomes", "Chromatin coils into threads while the two centrosomes move to opposite sides of the nucleus, each growing an aster of microtubules.", "Prophase"],
          metaphase: hasColchicine
            ? ["C-metaphase Chromosomes", "Colchicine blocks tubulin from polymerising, so no spindle forms and the spindle checkpoint stays on. Chromosomes scatter; each X is one chromosome made of two sister chromatids.", "Colchicine Arrest"]
            : ["Metaphase Plate & Spindle", "Chromosomes align at the cell's equator. Spindle fibres from each centrosome attach to the kinetochores.", "Metaphase"],
          anaphase: ["Separating Chromatids", "Sister chromatids are pulled toward the poles as kinetochore fibres shorten, and the spindle poles move further apart.", "Anaphase"],
          telophase: ["Daughter Nuclei", "Chromosomes decondense and new nuclear envelopes form around each group while the furrow deepens.", "Telophase"]
        }[key];
        hit = { title: info[0], desc: info[1], tag: info[2] };
      } else {
        hit = { title: "Cytoplasm", desc: "Granular cytosol packed with mitochondria, ribosomes and membrane-bound organelles.", tag: "Cytoplasm" };
      }
    }

    if (hit && inspectTitle && inspectDesc && inspectTag) {
      inspectTitle.textContent = `🔬 ${hit.title}`;
      inspectDesc.textContent = hit.desc;
      inspectTag.textContent = hit.tag;
      inspectTag.style.background = "rgba(16, 185, 129, 0.2)";
      inspectTag.style.color = "#34d399";
    }
    // Eyepiece pointer
    ctx.strokeStyle = "rgba(15, 23, 42, 0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.lineTo(mx + 22, my + 22);
    ctx.stroke();
  }

  function drawAnimatorOverlays() {
    // 8. Draggable Ocular Micrometer (Graticule Ruler Tool)
    if (showGraticule) {
      drawOcularGraticule(ctx, graticulePos.x, graticulePos.y);
    }

    // 9. Laser Line Profile Scanner (Real-time Cross-Section Intensity)
    if (showIntensityScan) {
      drawLaserLineProfile(ctx);
    }

    // 10. Optical Scale Bar & Microscope Specification (Left Stage HUD - Unobstructed by Inspector)
    const hudX = 24;
    const hudY = 336;
    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(hudX, hudY, 192, 58, 6);
    ctx.fill();
    ctx.stroke();

    // Scale bar: real-slide mode is calibrated to the micrograph (20 px/µm), vector models keep the schematic bar
    const realScale = isRealSlide();
    const barPx = realScale ? 5 * PX_PER_UM : 40;
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hudX + 12, hudY + 18); ctx.lineTo(hudX + 12 + barPx, hudY + 18);
    ctx.moveTo(hudX + 12, hudY + 14); ctx.lineTo(hudX + 12, hudY + 22);
    ctx.moveTo(hudX + 12 + barPx, hudY + 14); ctx.lineTo(hudX + 12 + barPx, hudY + 22);
    ctx.stroke();

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "left";
    ctx.fillText(realScale ? "5 µm" : "10 µm", hudX + 20 + barPx, hudY + 21);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "9px monospace";
    ctx.fillText("100× Plan-Apo (N.A. 1.40 Oil)", hudX + 12, hudY + 36);
    ctx.fillStyle = fineFocus === 0 ? "#34d399" : "#fbbf24";
    ctx.fillText(`Z-Plane: ${fineFocus >= 0 ? "+" : ""}${fineFocus.toFixed(1)} µm ${fineFocus === 0 ? "(In Focus)" : ""}`, hudX + 12, hudY + 49);
    ctx.restore();
  }

  // Draw Draggable Calibrated Ocular Micrometer (Graticule Ruler)
  function drawOcularGraticule(ctx, gx, gy) {
    ctx.save();
    const real = isRealSlide();
    const rulerW = real ? 10 * PX_PER_UM + 30 : 240;
    const rulerH = 34;

    // Glass body
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.strokeStyle = "rgba(56, 189, 248, 0.75)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(gx - rulerW / 2, gy - rulerH / 2, rulerW, rulerH, 6);
    ctx.fill();
    ctx.stroke();

    // Micrometer Ticks: 0 to 50 µm (1 px = 0.25 µm scale)
    ctx.strokeStyle = "#38bdf8";
    ctx.fillStyle = "#38bdf8";
    ctx.font = "8px monospace";
    ctx.textAlign = "center";

    const totalMicrons = real ? 10 : 50;
    const pxPerMicron = (rulerW - 30) / totalMicrons;
    const startX = gx - rulerW / 2 + 15;
    const tickStep = real ? 1 : 2;
    const majorEvery = real ? 5 : 10;

    for (let u = 0; u <= totalMicrons; u += tickStep) {
      const tx = startX + u * pxPerMicron;
      const isMajor = (u % majorEvery === 0);
      const isMedium = (u % 5 === 0);
      const tickH = isMajor ? 12 : (isMedium ? 8 : 5);

      ctx.beginPath();
      ctx.moveTo(tx, gy + rulerH / 2 - 2);
      ctx.lineTo(tx, gy + rulerH / 2 - 2 - tickH);
      ctx.stroke();

      if (isMajor) {
        ctx.fillText(`${u}`, tx, gy - 2);
      }
    }

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 8px monospace";
    ctx.textAlign = "left";
    ctx.fillText("📏 GRATICULE (µm)", gx - rulerW / 2 + 15, gy + 10);
    ctx.restore();
  }

  // True when the brightfield micrograph view is on screen (calibration + densitometry apply)
  function isRealSlide() {
    return stainingMode !== "fluorescence" && activeTab === "animator" && !!getPhaseImage("interphase");
  }

  // Read the actual pixels of the displayed micrograph along a horizontal line and convert them to
  // stain absorbance: A = -log10(I / I0). Orcein (purple) absorbs green; haematoxylin (blue) absorbs red.
  let scanCanvas = null;
  let scanCtx = null;
  let scanBlocked = false;
  function sampleStainProfile(scanY, x0, x1, n) {
    if (scanBlocked) return null;
    const blend = getMicrographBlend();
    if (!blend.a) return null;
    const size = Math.round(218 * 2 * 1.18);
    const top = 245 - size / 2;
    const left = 470 - size / 2;
    try {
      if (!scanCanvas) {
        scanCanvas = document.createElement("canvas");
        scanCanvas.width = size;
        scanCanvas.height = size;
        scanCtx = scanCanvas.getContext("2d", { willReadFrequently: true });
      }
      const fb = Math.abs(fineFocus);
      scanCtx.filter = fb > 0.15 ? `blur(${Math.min(fb * 1.7, 5.5).toFixed(1)}px)` : "none";
      scanCtx.globalAlpha = 1;
      scanCtx.clearRect(0, 0, size, size);
      scanCtx.drawImage(blend.a, 0, 0, size, size);
      if (blend.b && blend.b !== blend.a && blend.t > 0) {
        scanCtx.globalAlpha = blend.t;
        scanCtx.drawImage(blend.b, 0, 0, size, size);
        scanCtx.globalAlpha = 1;
      }
      scanCtx.filter = "none";
      const row = Math.min(size - 2, Math.max(1, Math.round(scanY - top)));
      const sx0 = Math.max(0, Math.round(x0 - left));
      const w = Math.min(size - sx0, Math.round(x1 - x0));
      if (w < 10) return null;
      const d = scanCtx.getImageData(sx0, row - 1, w, 3).data;
      const ch = specimenType === "animal" ? 0 : 1;
      const out = [];
      for (let k = 0; k < n; k++) {
        const i = Math.round((k / (n - 1)) * (w - 1));
        let sum = 0;
        let cnt = 0;
        for (let r = 0; r < 3; r++) {
          for (let o = -1; o <= 1; o++) {
            const xi = Math.min(w - 1, Math.max(0, i + o));
            sum += d[(r * w + xi) * 4 + ch];
            cnt++;
          }
        }
        const v = Math.max(sum / cnt, 8);
        out.push(Math.min(Math.max(-Math.log10(v / 238), 0), 1.4));
      }
      return { od: out, widthPx: x1 - x0 };
    } catch (e) {
      scanBlocked = true; // e.g. opened from file:// (tainted canvas): fall back to the schematic profile
      return null;
    }
  }

  // Densitometry line scan on the real micrograph. The scan line follows the cursor.
  function drawLaserLineProfile(ctx) {
    if (!isRealSlide()) { drawLaserLineProfileSchematic(ctx); return; }
    const cx = 470;
    const cy = 245;
    const ocularR = 218;
    const over = canvasMouse.isOver && Math.hypot(canvasMouse.x - cx, canvasMouse.y - cy) < ocularR - 14;
    const scanY = over ? canvasMouse.y : cy;
    const half = Math.sqrt(Math.max(0, ocularR * ocularR - (scanY - cy) * (scanY - cy))) - 10;
    const x0 = cx - half;
    const x1 = cx + half;
    const N = 60;
    const res = sampleStainProfile(scanY, x0, x1, N);
    if (!res) { drawLaserLineProfileSchematic(ctx); return; }
    const od = res.od;
    const isAnimal = specimenType === "animal";
    const col = isAnimal ? "#60a5fa" : "#e879f9";
    const peak = Math.max(...od);

    ctx.save();
    const boxX = 705;
    const boxY = 55;
    const boxW = 215;
    const boxH = 128;
    ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
    ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "left";
    ctx.fillText("📊 STAIN DENSITOMETRY LINE SCAN", boxX + 10, boxY + 16);

    // Plot area
    const px0 = boxX + 30;
    const py0 = boxY + 98;
    const pw = boxW - 44;
    const ph = 62;
    const AMAX = 1.5;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#94a3b8";
    ctx.font = "7px monospace";
    ctx.textAlign = "right";
    [0, 0.5, 1.0, 1.5].forEach((a) => {
      const yy = py0 - (a / AMAX) * ph;
      ctx.beginPath();
      ctx.moveTo(px0, yy);
      ctx.lineTo(px0 + pw, yy);
      ctx.stroke();
      ctx.fillText(a.toFixed(1), px0 - 3, yy + 2);
    });

    // Absorbance curve with soft fill
    ctx.beginPath();
    od.forEach((v, i) => {
      const x = px0 + (i / (N - 1)) * pw;
      const y = py0 - (Math.min(v, AMAX) / AMAX) * ph;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(px0 + pw, py0);
    ctx.lineTo(px0, py0);
    ctx.closePath();
    ctx.fillStyle = isAnimal ? "rgba(96, 165, 250, 0.18)" : "rgba(232, 121, 249, 0.18)";
    ctx.fill();
    ctx.beginPath();
    od.forEach((v, i) => {
      const x = px0 + (i / (N - 1)) * pw;
      const y = py0 - (Math.min(v, AMAX) / AMAX) * ph;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = col;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Axes labels
    const lenUm = res.widthPx / PX_PER_UM;
    ctx.fillStyle = "#94a3b8";
    ctx.font = "7px monospace";
    ctx.textAlign = "left";
    ctx.fillText("0 µm", px0, py0 + 10);
    ctx.textAlign = "right";
    ctx.fillText(`${lenUm.toFixed(1)} µm`, px0 + pw, py0 + 10);
    ctx.textAlign = "left";
    ctx.fillStyle = col;
    ctx.font = "8px monospace";
    ctx.fillText(`A(${isAnimal ? "red" : "green"}) max ${peak.toFixed(2)} · follows cursor`, boxX + 10, boxY + 121);

    // Scan line across the slide in the main viewport
    ctx.strokeStyle = "rgba(239, 68, 68, 0.8)";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(x0, scanY);
    ctx.lineTo(x1, scanY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(x0, scanY - 5); ctx.lineTo(x0, scanY + 5);
    ctx.moveTo(x1, scanY - 5); ctx.lineTo(x1, scanY + 5);
    ctx.stroke();
    ctx.restore();
  }

  // Schematic profile used by the confocal model (not derived from an image)
  function drawLaserLineProfileSchematic(ctx) {
    ctx.save();
    const boxX = 705;
    const boxY = 55;
    const boxW = 215;
    const boxH = 110;

    // Background Panel
    ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
    ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 8);
    ctx.fill();
    ctx.stroke();

    // Title
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "left";
    ctx.fillText("📊 LASER INTENSITY LINE PROFILE", boxX + 10, boxY + 16);

    // Coordinate Axes
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(boxX + 25, boxY + 28);
    ctx.lineTo(boxX + 25, boxY + 95);
    ctx.lineTo(boxX + boxW - 12, boxY + 95);
    ctx.stroke();

    // DAPI (Blue) Profile Curve
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let p = 0; p < 35; p++) {
      const px = boxX + 26 + p * 5;
      let val = 10;
      if (currentPhaseIdx === 2) {
        // Metaphase tight central peak
        val = 10 + 65 * Math.exp(-Math.pow(p - 17, 2) / 12);
      } else if (currentPhaseIdx === 3) {
        // Anaphase twin peaks
        val = 10 + 55 * (Math.exp(-Math.pow(p - 9, 2) / 10) + Math.exp(-Math.pow(p - 25, 2) / 10));
      } else {
        val = 15 + 40 * Math.exp(-Math.pow(p - 17, 2) / 45);
      }
      const py = boxY + 95 - val;
      if (p === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // GFP Tubulin (Green) Profile Curve
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let p = 0; p < 35; p++) {
      const px = boxX + 26 + p * 5;
      let val = 12;
      if (currentPhaseIdx === 2) {
        val = (drugCondition === "colchicine") ? 14 : (14 + 48 * (Math.exp(-Math.pow(p - 6, 2) / 16) + Math.exp(-Math.pow(p - 28, 2) / 16)));
      } else {
        val = 14 + 30 * Math.sin((p / 35) * Math.PI);
      }
      const py = boxY + 95 - val;
      if (p === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Legend
    ctx.fillStyle = "#38bdf8"; ctx.fillRect(boxX + 28, boxY + 100, 8, 3);
    ctx.fillStyle = "#cbd5e1"; ctx.font = "8px monospace"; ctx.fillText("DAPI (DNA)", boxX + 40, boxY + 104);
    ctx.fillStyle = "#10b981"; ctx.fillRect(boxX + 115, boxY + 100, 8, 3);
    ctx.fillText("GFP (Tubulin)", boxX + 127, boxY + 104);

    // Laser Scan Reference Line across cell in main viewport
    ctx.strokeStyle = "rgba(239, 68, 68, 0.65)";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(320, 245);
    ctx.lineTo(620, 245);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // Draw 60 FPS Authentic Allium Cepa Meristem Histology Grid
  function drawHistologyGrid() {
    if (!ctx) return;
    const isFluor = stainingMode === "fluorescence";

    // Canvas background: Authentic brightfield vs fluorescent tissue slide
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

      // Real micrograph tile (same photo set as the animator, so each cell's true phase is correct)
      const tileImg = !isFluor ? getPhaseImage(c.actualPhase, "plant") : null;
      if (tileImg) {
        const tx = gx + 1 + c.wallJitterX * 0.5;
        const ty = gy + 1 + c.wallJitterY * 0.5;
        const tw = cellW - 2;
        const th = cellH - 2;
        const flipX = (c.id * 7) % 2 === 0;
        const flipY = (c.id * 13) % 3 === 0;
        ctx.save();
        ctx.beginPath();
        ctx.rect(tx, ty, tw, th);
        ctx.clip();
        ctx.translate(tx + tw / 2, ty + th / 2);
        ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
        const tone = 0.92 + ((c.id * 37) % 17) / 100;
        const sat = 0.88 + ((c.id * 11) % 22) / 100;
        ctx.filter = `brightness(${tone.toFixed(2)}) saturate(${sat.toFixed(2)})`;
        const sw = tileImg.naturalWidth;
        const sh = tileImg.naturalHeight;
        const zoom = 0.62 + ((c.id * 29) % 19) / 100; // 62-80% of the photo width; keeps all chromosomes in frame
        const cropW = sw * zoom;
        const cropH = cropW * (th / tw);
        const jx = ((((c.id * 53) % 21) - 10) / 10) * Math.min(60, (sw - cropW) / 2);
        const jy = ((((c.id * 31) % 21) - 10) / 10) * 15;
        ctx.drawImage(tileImg, (sw - cropW) / 2 + jx, (sh - cropH) / 2 + jy, cropW, cropH, -tw / 2, -th / 2, tw, th);
        ctx.restore();
        ctx.strokeStyle = "rgba(176, 120, 96, 0.9)";
        ctx.lineWidth = 2;
        ctx.strokeRect(tx, ty, tw, th);
        if (isSelected) {
          ctx.strokeStyle = "#0ea5e9";
          ctx.lineWidth = 3;
          ctx.strokeRect(tx + 1.5, ty + 1.5, tw - 3, th - 3);
        }
        ctx.restore();
        return;
      }

      // Authentic Plant Meristem Cell Wall (Cellulose file with subtle jitter)
      ctx.strokeStyle = isFluor ? "#065f46" : "#b45309";
      ctx.lineWidth = isSelected ? 3.5 : 2;
      ctx.fillStyle = isFluor 
        ? (isSelected ? "rgba(56, 189, 248, 0.18)" : "rgba(6, 78, 59, 0.15)") 
        : (isSelected ? "rgba(254, 215, 170, 0.55)" : "rgba(254, 240, 138, 0.25)");

      ctx.beginPath();
      ctx.roundRect(gx + 2 + c.wallJitterX, gy + 2 + c.wallJitterY, cellW - 4, cellH - 4, 4);
      ctx.fill();
      ctx.stroke();

      if (isSelected) {
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // Internal Cell Nucleus & Mitotic Figures
      const midX = gx + cellW / 2 + c.wallJitterX;
      const midY = gy + cellH / 2 + c.wallJitterY;

      if (c.actualPhase === "interphase") {
        // Intact nucleus with nucleolus
        ctx.fillStyle = isFluor ? "rgba(56, 189, 248, 0.55)" : "rgba(157, 23, 77, 0.6)";
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
        ctx.lineWidth = 2.2;
        for (let k = 0; k < 5; k++) {
          ctx.beginPath();
          ctx.arc(midX + (k - 2) * 5, midY + Math.sin(k) * 4, 9, 0, Math.PI);
          ctx.stroke();
        }

      } else if (c.actualPhase === "metaphase") {
        // Dense equatorial plate of chromosomes
        ctx.strokeStyle = isFluor ? "#818cf8" : "#831843";
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(midX, midY - 20);
        ctx.lineTo(midX, midY + 20);
        ctx.stroke();

      } else if (c.actualPhase === "anaphase") {
        // Two distinct migrating V-shaped daughter chromosome groups
        ctx.strokeStyle = isFluor ? "#f43f5e" : "#831843";
        ctx.lineWidth = 2.8;
        [-11, 11].forEach(ox => {
          ctx.beginPath();
          ctx.moveTo(midX + ox - 5, midY - 14);
          ctx.lineTo(midX + ox + 3, midY);
          ctx.lineTo(midX + ox - 5, midY + 14);
          ctx.stroke();
        });

      } else if (c.actualPhase === "telophase") {
        // Two reforming polar nuclei with central cell plate line
        ctx.fillStyle = isFluor ? "rgba(56, 189, 248, 0.45)" : "rgba(157, 23, 77, 0.45)";
        ctx.beginPath();
        ctx.arc(midX - 18, midY, 10, 0, Math.PI * 2);
        ctx.arc(midX + 18, midY, 10, 0, Math.PI * 2);
        ctx.fill();

        // Nascent Cell Plate (Phragmoplast)
        ctx.strokeStyle = isFluor ? "#10b981" : "#d97706";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(midX, midY - 15);
        ctx.lineTo(midX, midY + 15);
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
        const lRadius = 58;

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
        const loupeImg = !isFluor ? getPhaseImage(hCell.actualPhase, "plant") : null;
        if (loupeImg) {
          ctx.drawImage(loupeImg, lx - 30, ly - 30, 60, 60);
        } else {
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 2;
          ctx.strokeRect(lx - 25, ly - 18, 50, 36);
        }

        ctx.restore();

        // Loupe Brass Frame
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(lx, ly, lRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Mini Label
        ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
        ctx.fillRect(lx - 45, ly + lRadius - 6, 90, 20);
        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`1000× Cell #${hCell.id}`, lx, ly + lRadius + 8);
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
    if (photoSpindle) photoSpindle.textContent = hasColchicine ? "Colchicine Block" : (hasTaxol ? "Taxol Freeze" : "Normal");

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

    if (graticulePos.isDragging) {
      graticulePos.x = canvasMouse.x - graticulePos.dragStartX;
      graticulePos.y = canvasMouse.y - graticulePos.dragStartY;
    }
  });

  canvas?.addEventListener("mousedown", (e) => {
    if (showGraticule) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = logicalW / rect.width;
      const scaleY = logicalH / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;
      if (Math.abs(mx - graticulePos.x) < 120 && Math.abs(my - graticulePos.y) < 20) {
        graticulePos.isDragging = true;
        graticulePos.dragStartX = mx - graticulePos.x;
        graticulePos.dragStartY = my - graticulePos.y;
      }
    }
  });

  window.addEventListener("mouseup", () => {
    graticulePos.isDragging = false;
  });

  canvas?.addEventListener("mouseleave", () => {
    canvasMouse.isOver = false;
    graticulePos.isDragging = false;
  });

  canvas?.addEventListener("click", (e) => {
    if (activeTab === "histology") {
      const rect = canvas.getBoundingClientRect();
      const scaleX = logicalW / rect.width;
      const scaleY = logicalH / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;
      const cell = getHistologyCellAt(mx, my);
      if (cell) {
        selectedHistoCell = cell;
        if (histoPromptText) {
          histoPromptText.textContent = `Diagnose Phase for Cell #${cell.id} (Row ${cell.row + 1}, Col ${cell.col + 1}):`;
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

    if (confocalChannelsWrapper) confocalChannelsWrapper.style.display = "flex";
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

    if (confocalChannelsWrapper) confocalChannelsWrapper.style.display = "none";
    SoundFX.playClick();
  });

  // Confocal Channel Splitter Listeners
  document.querySelectorAll(".channel-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".channel-btn").forEach(b => {
        b.classList.remove("active");
        b.style.background = "transparent";
      });
      btn.classList.add("active");
      btn.style.background = "rgba(56, 189, 248, 0.25)";
      activeChannel = btn.getAttribute("data-chan") || "all";
      SoundFX.playClick();
    });
  });

  // Optical Tools Toggles (Graticule & Profile)
  btnToggleGraticule?.addEventListener("click", () => {
    showGraticule = !showGraticule;
    btnToggleGraticule.classList.toggle("active", showGraticule);
    btnToggleGraticule.style.background = showGraticule ? "rgba(56, 189, 248, 0.25)" : "";
    btnToggleGraticule.style.borderColor = showGraticule ? "#38bdf8" : "";
    btnToggleGraticule.style.color = showGraticule ? "#38bdf8" : "";
    SoundFX.playClick();
  });

  btnToggleProfile?.addEventListener("click", () => {
    showIntensityScan = !showIntensityScan;
    btnToggleProfile.classList.toggle("active", showIntensityScan);
    btnToggleProfile.style.background = showIntensityScan ? "rgba(56, 189, 248, 0.25)" : "";
    btnToggleProfile.style.borderColor = showIntensityScan ? "#38bdf8" : "";
    btnToggleProfile.style.color = showIntensityScan ? "#38bdf8" : "";
    SoundFX.playClick();
  });

  // Pharmacological Spindle Assay Listeners
  document.querySelectorAll(".drug-pill-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".drug-pill-btn").forEach(b => {
        b.classList.remove("active");
        b.style.borderColor = "var(--border-color)";
        b.style.color = "#cbd5e1";
        b.style.fontWeight = "600";
      });
      btn.classList.add("active");
      drugCondition = btn.getAttribute("data-drug") || "control";
      hasColchicine = (drugCondition === "colchicine");
      hasTaxol = (drugCondition === "taxol");

      if (drugCondition === "colchicine") {
        btn.style.borderColor = "#ef4444";
        btn.style.color = "#ef4444";
        btn.style.fontWeight = "700";
        if (drugStatusBadge) {
          drugStatusBadge.textContent = "Colchicine (0.1 µM)";
          drugStatusBadge.style.background = "rgba(239, 68, 68, 0.2)";
          drugStatusBadge.style.color = "#f87171";
          drugStatusBadge.style.borderColor = "rgba(239, 68, 68, 0.4)";
        }
        if (drugMechanismText) {
          drugMechanismText.textContent = "Binds β-tubulin, depolymerizes spindle fibers, recruits Mad2 checkpoint sensor, halts at Metaphase.";
        }
      } else if (drugCondition === "taxol") {
        btn.style.borderColor = "#c084fc";
        btn.style.color = "#c084fc";
        btn.style.fontWeight = "700";
        if (drugStatusBadge) {
          drugStatusBadge.textContent = "Taxol / Paclitaxel (10 nM)";
          drugStatusBadge.style.background = "rgba(192, 132, 252, 0.2)";
          drugStatusBadge.style.color = "#c084fc";
          drugStatusBadge.style.borderColor = "rgba(192, 132, 252, 0.4)";
        }
        if (drugMechanismText) {
          drugMechanismText.textContent = "Hyper-stabilizes GDP-microtubules into rigid bundles, blocks depolymerization, freezes Anaphase A.";
        }
      } else {
        btn.style.borderColor = "#10b981";
        btn.style.color = "#10b981";
        btn.style.fontWeight = "700";
        if (drugStatusBadge) {
          drugStatusBadge.textContent = "Untreated Control";
          drugStatusBadge.style.background = "rgba(16, 185, 129, 0.2)";
          drugStatusBadge.style.color = "#34d399";
          drugStatusBadge.style.borderColor = "rgba(16, 185, 129, 0.3)";
        }
        if (drugMechanismText) {
          drugMechanismText.textContent = "Normal microtubule dynamic instability; bi-oriented tension satisfies SAC and permits Anaphase APC/C activation.";
        }
      }

      initHistologyCells();
      updateTable();
      updateEventsCard();
      SoundFX.playBeep();
    });
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

  // Histology Diagnostic Quiz & Tally Counter Buttons
  document.querySelectorAll(".btn-classify").forEach(btn => {
    btn.addEventListener("click", () => {
      const chosenPhase = btn.getAttribute("data-phase");
      const targetCell = selectedHistoCell || histologyCells[0];

      if (targetCell) {
        studentScore.total++;
        const isCorrect = (chosenPhase === targetCell.actualPhase);
        if (isCorrect) studentScore.correct++;

        // Update Tally Keypad counts
        tallyCounts[chosenPhase] = (tallyCounts[chosenPhase] || 0) + 1;
        tallyTotal++;
        updateTallyKeypadUI();

        if (histoScoreBadge) {
          const pct = Math.round((studentScore.correct / studentScore.total) * 100);
          histoScoreBadge.textContent = `Score: ${studentScore.correct}/${studentScore.total} (${pct}%)`;
        }

        if (histoFeedbackBanner) {
          histoFeedbackBanner.style.display = "block";
          if (isCorrect) {
            histoFeedbackBanner.style.background = "rgba(16, 185, 129, 0.2)";
            histoFeedbackBanner.style.border = "1px solid #10b981";
            histoFeedbackBanner.style.color = "#34d399";
            histoFeedbackBanner.innerHTML = `✓ <b>Correct!</b> Cell #${targetCell.id} is in <b>${chosenPhase.toUpperCase()}</b>.`;
            SoundFX.playPing();
          } else {
            histoFeedbackBanner.style.background = "rgba(244, 63, 94, 0.2)";
            histoFeedbackBanner.style.border = "1px solid #f43f5e";
            histoFeedbackBanner.style.color = "#fda4af";
            histoFeedbackBanner.innerHTML = `✗ <b>Incorrect:</b> Cell #${targetCell.id} is actually in <b>${targetCell.actualPhase.toUpperCase()}</b>.`;
            SoundFX.playBeep();
          }
        }
      }
    });
  });

  function updateTallyKeypadUI() {
    if (tallyInterphase) tallyInterphase.textContent = tallyCounts.interphase || 0;
    if (tallyProphase) tallyProphase.textContent = tallyCounts.prophase || 0;
    if (tallyMetaphase) tallyMetaphase.textContent = tallyCounts.metaphase || 0;
    if (tallyAnaphase) tallyAnaphase.textContent = tallyCounts.anaphase || 0;
    if (tallyTelophase) tallyTelophase.textContent = tallyCounts.telophase || 0;
    if (tallyTotalDisplay) tallyTotalDisplay.textContent = tallyTotal;

    if (studentMiDisplay) {
      const mitoticSum = (tallyCounts.prophase || 0) + (tallyCounts.metaphase || 0) + (tallyCounts.anaphase || 0) + (tallyCounts.telophase || 0);
      const studentMI = tallyTotal > 0 ? ((mitoticSum / tallyTotal) * 100).toFixed(1) : "0.0";
      studentMiDisplay.textContent = `${studentMI}%`;
    }
  }

  btnResetTally?.addEventListener("click", () => {
    tallyCounts = { interphase: 0, prophase: 0, metaphase: 0, anaphase: 0, telophase: 0 };
    tallyTotal = 0;
    studentScore = { correct: 0, total: 0 };
    if (histoScoreBadge) histoScoreBadge.textContent = "Score: 0/0 (0%)";
    if (histoFeedbackBanner) histoFeedbackBanner.style.display = "none";
    updateTallyKeypadUI();
    SoundFX.playClick();
  });

  // Play / Pause Animation
  playBtn?.addEventListener("click", () => {
    isPlaying = !isPlaying;
    if (isPlaying) {
      playBtn.innerHTML = `<span>⏸</span> Pause Cycle`;
      playBtn.className = "btn btn-primary btn-sm";
      SoundFX.playClick();
    } else {
      playBtn.innerHTML = `<span>▶</span> Play Cell Cycle`;
      playBtn.className = "btn btn-secondary btn-sm";
      SoundFX.playClick();
    }
  });

  // Navigation Steps
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

  // Manual Phase Jump Buttons
  document.querySelectorAll(".phase-jump-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentPhaseIdx = parseInt(btn.getAttribute("data-phase"), 10);
      phaseProgress = 0.0;
      updatePhaseJumpPills();
      SoundFX.playClick();
    });
  });

  // Scrubber Input Listener
  sliderPhaseProgress?.addEventListener("input", (e) => {
    phaseProgress = parseInt(e.target.value, 10) / 100;
    if (lblPhaseProgress) lblPhaseProgress.textContent = `${Math.round(phaseProgress * 100)}%`;
    if (badgePhaseProgressPct) badgePhaseProgressPct.textContent = `${Math.round(phaseProgress * 100)}% Complete`;
  });

  // Fine Focus Z-Stack Slider
  sliderFineFocus?.addEventListener("input", (e) => {
    fineFocus = parseFloat(e.target.value);
    if (lblFineFocus) {
      if (Math.abs(fineFocus) < 0.1) {
        lblFineFocus.textContent = "0.0 µm (In Focus)";
        lblFineFocus.style.color = "#10b981";
      } else {
        const sign = fineFocus > 0 ? "+" : "";
        lblFineFocus.textContent = `${sign}${fineFocus.toFixed(1)} µm (Airy Defocus)`;
        lblFineFocus.style.color = "#fbbf24";
      }
    }
  });

  sliderSpeed?.addEventListener("input", (e) => {
    animSpeed = parseFloat(e.target.value);
    if (lblSpeed) lblSpeed.textContent = `${animSpeed.toFixed(1)}×`;
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
      treatment: drugCondition === "colchicine" ? "Colchicine (SAC Arrest)" : (drugCondition === "taxol" ? "Taxol (Spindle Freeze)" : "Control (Untreated)"),
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
      "Mitotic_Cells_Count",
      "Mitotic_Index_Percent",
      "Interphase_Count",
      "Prophase_Count",
      "Metaphase_Count",
      "Anaphase_Count",
      "Telophase_Count"
    ];

    if (trialLogs.length === 0) {
      const { mitoticCount, mi, phaseCounts } = calculateMitoticIndex();
      trialLogs.push({
        trial: 1,
        specimen: specimenType === "plant" ? "Allium cepa (Plant)" : "Mammalian (Animal)",
        stain: stainingMode,
        treatment: drugCondition === "colchicine" ? "Colchicine (SAC Arrest)" : (drugCondition === "taxol" ? "Taxol (Spindle Freeze)" : "Control (Untreated)"),
        totalCells: TOTAL_CELLS,
        mitoticCells: mitoticCount,
        mitoticIndexPct: mi.toFixed(1),
        interphase: phaseCounts.interphase,
        prophase: phaseCounts.prophase,
        metaphase: phaseCounts.metaphase,
        anaphase: phaseCounts.anaphase,
        telophase: phaseCounts.telophase
      });
    }

    const rows = trialLogs.map(r => [
      r.trial,
      `"${r.specimen}"`,
      `"${r.stain}"`,
      `"${r.treatment}"`,
      r.totalCells,
      r.mitoticCells,
      r.mitoticIndexPct,
      r.interphase,
      r.prophase,
      r.metaphase,
      r.anaphase,
      r.telophase
    ]);

    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `mitosis_cytogenetics_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    SoundFX.playPing();
  }

  exportBtn?.addEventListener("click", handleExport);

  // Keyboard Shortcuts: 'e'/'E' for CSV export, '1'-'5' for histology cytology tally
  function handleKeyDown(e) {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (e.key === "e" || e.key === "E") {
      e.preventDefault();
      handleExport();
    } else if (activeTab === "histology" && ["1", "2", "3", "4", "5"].includes(e.key)) {
      e.preventDefault();
      const phaseKeys = ["interphase", "prophase", "metaphase", "anaphase", "telophase"];
      const keyIdx = parseInt(e.key, 10) - 1;
      const chosenPhase = phaseKeys[keyIdx];
      const targetBtn = document.querySelector(`.btn-classify[data-phase="${chosenPhase}"]`);
      targetBtn?.click();
    }
  }
  window.addEventListener("keydown", handleKeyDown);

  // Mount Post-Lab Inquiry Checkpoint Assessment (Full Screen Width)
  mountLabCheckpoint("mitosis-checkpoint-mount", "bio-mitosis");

  // Initial State Rendering
  updatePhaseJumpPills();
  animId = requestAnimationFrame(loop);

  // Return Comprehensive Cleanup Function
  return () => {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("resize", setupHiDPICanvas);
  };
}
