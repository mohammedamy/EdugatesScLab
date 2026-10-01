// Edugates-ClipSAT Science Labs - Biology: 4K Ultra-HD Interactive Human Anatomy Atlas & Histology Suite
// Authentic 4K Vector/Canvas Multilayer Dissection (Skeletal, Muscular, Visceral, Circulatory, Nervous),
// Interactive Pan & Zoom Engine (1x to 10x), 6 Histological Simulation Workbenches,
// Live Beating Heart & ECG Synchronizer, Nephron Countercurrent Simulator, 4K UHD Diagram Export,
// and Anatomical Pin Identification Challenge.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";
import {
  ANATOMICAL_SYSTEMS,
  ANATOMICAL_STRUCTURES,
  HISTOLOGY_SIMULATION_MODELS,
  ANATOMY_CHECKPOINTS
} from "../data/human-anatomy-atlas-data.js";

let _currentAtlasCleanup = null;

export function cleanupAnatomyAtlasLab() {
  if (typeof _currentAtlasCleanup === "function") {
    try { _currentAtlasCleanup(); } catch (e) {}
    _currentAtlasCleanup = null;
  }
}

export function initAnatomyAtlasLab(containerId) {
  cleanupAnatomyAtlasLab();
  const container = document.getElementById(containerId);
  if (!container) return;

  // Active laboratory state
  let activeTab = "macro"; // 'macro' | 'histology' | 'quiz'
  let activeSystemFilter = "all"; // 'all' | systemId
  let activeRegion = "all"; // 'all' | 'head' | 'thorax' | 'abdomen' | 'pelvis' | 'upper_limb' | 'lower_limb'
  let activeView = "anterior"; // 'anterior' | 'posterior'
  let activeHistologyModel = "cardiac_cycle";
  let selectedStructure = ANATOMICAL_STRUCTURES.find(s => s.id === "heart") || ANATOMICAL_STRUCTURES[0];
  let searchQuery = "";

  // Layer opacities (0.0 to 1.0)
  const layerOpacities = {
    skin: 0.25,
    muscular: 0.85,
    skeletal: 0.95,
    visceral: 1.0,
    circulatory: 1.0,
    nervous: 0.90
  };

  // 4K Pan & Zoom viewport transform
  let zoom = 1.0;
  let panX = 0;
  let panY = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let hoveredStructure = null;

  // Animation and simulation handles
  let animId = null;
  let simTime = 0;
  let lastTimestamp = performance.now();

  // Histology interactive parameters
  const histoState = {
    heartRate: 72,
    ecgData: [],
    ecgScanIndex: 0,
    lastBeatTime: 0,
    adhLevel: 50, // 0 to 100%
    fio2: 21, // 21% room air
    sarcomereLength: 2.2, // 1.6 to 2.4 um
    actionPotentialStim: false,
    apPhaseProgress: 0
  };

  // Pin Quiz State
  const quizState = {
    targetStructure: null,
    score: 0,
    totalQuestions: 0,
    streak: 0,
    feedbackMsg: "",
    feedbackType: "neutral" // 'correct' | 'wrong' | 'neutral'
  };

  // Synthesized Cardiac Acoustic Generator (S1 / S2)
  function playHeartSound(isS1) {
    try {
      const audioCtx = SoundFX.getAudioContext?.() || (window.AudioContext ? new window.AudioContext() : null);
      if (!audioCtx || audioCtx.state === "suspended") return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const now = audioCtx.currentTime;

      // S1: 40-70 Hz lower pitch longer duration; S2: 70-110 Hz crisper shorter
      osc.type = "sine";
      osc.frequency.setValueAtTime(isS1 ? 55 : 85, now);
      osc.frequency.exponentialRampToValueAtTime(isS1 ? 30 : 50, now + (isS1 ? 0.12 : 0.08));

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(isS1 ? 0.35 : 0.28, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isS1 ? 0.14 : 0.09));

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + (isS1 ? 0.15 : 0.10));
    } catch (e) {}
  }

  // Pick new quiz target
  function selectNewQuizTarget() {
    const candidates = ANATOMICAL_STRUCTURES.filter(s => s.view === activeView);
    if (candidates.length === 0) {
      quizState.targetStructure = ANATOMICAL_STRUCTURES[0];
    } else {
      quizState.targetStructure = candidates[Math.floor(Math.random() * candidates.length)];
    }
    quizState.feedbackMsg = `Tap or click the pin for: "${quizState.targetStructure.name}" (${quizState.targetStructure.latinName})`;
    quizState.feedbackType = "neutral";
  }

  // Initial HTML mount
  container.innerHTML = `
    <div class="atlas-workbench" style="display: flex; flex-direction: column; gap: 16px; width: 100%; max-width: 1560px; margin: 0 auto; color: var(--text-color);">
      <!-- Lab Header -->
      <div class="sim-telemetry-card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; padding: 18px 24px; border: 1px solid var(--border-color); border-radius: var(--radius-lg); background: var(--surface-bg);">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="font-size: 2.2rem; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); padding: 8px 14px; border-radius: 12px;" aria-hidden="true">
            🏛️
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
              <h2 style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 800; margin: 0; color: var(--text-color);">
                4K Ultra-HD Human Anatomy Atlas &amp; Histology Suite
              </h2>
              <span style="font-size: 0.72rem; padding: 2px 10px; border-radius: 9999px; background: rgba(16, 185, 129, 0.15); color: #10b981; font-weight: 700; border: 1px solid rgba(16, 185, 129, 0.3);">
                4K UHD 60 FPS
              </span>
              <span style="font-size: 0.72rem; padding: 2px 10px; border-radius: 9999px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-weight: 700; border: 1px solid rgba(56, 189, 248, 0.3);">
                Terminologia Anatomica
              </span>
            </div>
            <p style="font-size: 0.86rem; color: var(--text-muted); margin: 0;">
              High-resolution anatomical matrix with multi-layer dissection, physiological electro-mechanical synchronizers, and clinical pathology.
            </p>
          </div>
        </div>

        <!-- Mode Switcher & Lab Actions -->
        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <div style="display: inline-flex; background: rgba(15, 23, 42, 0.6); padding: 4px; border-radius: 10px; border: 1px solid var(--border-color);">
            <button id="btn-tab-macro" class="btn btn-sm ${activeTab === 'macro' ? 'btn-primary' : 'btn-secondary'}" style="padding: 6px 14px; font-weight: 700;">
              🔬 Macro Atlas (4K)
            </button>
            <button id="btn-tab-histology" class="btn btn-sm ${activeTab === 'histology' ? 'btn-primary' : 'btn-secondary'}" style="padding: 6px 14px; font-weight: 700;">
              ⚡ Histology Simulator
            </button>
            <button id="btn-tab-quiz" class="btn btn-sm ${activeTab === 'quiz' ? 'btn-primary' : 'btn-secondary'}" style="padding: 6px 14px; font-weight: 700;">
              🎯 Pin Challenge Quiz
            </button>
          </div>

          <button id="btn-export-4k" class="btn btn-outline btn-sm" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700;" title="Export pristine 3840x2160 UHD diagram">
            <span>📸</span>
            <span>4K PNG Export</span>
          </button>

          <button id="btn-open-dossier" class="btn btn-outline btn-sm" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700;">
            <span>📋</span>
            <span>Lab Dossier</span>
          </button>
        </div>
      </div>

      <!-- Main Dual-Pane Studio -->
      <div style="display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(360px, 1fr); gap: 16px; align-items: start;">
        
        <!-- LEFT: Primary Interactive 4K Canvas Workbench -->
        <div class="sim-telemetry-card" style="border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 16px; background: var(--surface-bg); display: flex; flex-direction: column; gap: 12px; position: relative;">
          
          <!-- Top Toolstrip: Orientation, System Filters, Zoom Controls -->
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
            <!-- View Angles -->
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-dim); text-transform: uppercase;">View:</span>
              <button id="btn-view-anterior" class="btn btn-sm ${activeView === 'anterior' ? 'btn-primary' : 'btn-secondary'}" style="padding: 4px 10px; font-size: 0.78rem;">
                Coronal Anterior
              </button>
              <button id="btn-view-posterior" class="btn btn-sm ${activeView === 'posterior' ? 'btn-primary' : 'btn-secondary'}" style="padding: 4px 10px; font-size: 0.78rem;">
                Coronal Posterior
              </button>
            </div>

            <!-- Regional Zoom Shortcuts -->
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-dim); text-transform: uppercase;">Region:</span>
              <select id="sel-region-jump" class="sim-select" style="padding: 4px 10px; font-size: 0.8rem; border-radius: 6px; background: rgba(15, 23, 42, 0.8); color: var(--text-color); border: 1px solid var(--border-color);">
                <option value="all">Whole Body (1x)</option>
                <option value="head">Head &amp; Neck (3.0x)</option>
                <option value="thorax">Thorax &amp; Heart (3.5x)</option>
                <option value="abdomen">Abdomen &amp; Kidneys (3.2x)</option>
                <option value="pelvis">Pelvis (3.0x)</option>
                <option value="upper_limb">Upper Extremity (2.8x)</option>
                <option value="lower_limb">Lower Extremity (2.2x)</option>
              </select>
            </div>

            <!-- Zoom / Pan Controls -->
            <div style="display: flex; align-items: center; gap: 6px;">
              <button id="btn-zoom-in" class="btn btn-secondary btn-sm" style="padding: 4px 9px;" title="Zoom In (+)">➕</button>
              <button id="btn-zoom-out" class="btn btn-secondary btn-sm" style="padding: 4px 9px;" title="Zoom Out (-)">➖</button>
              <button id="btn-zoom-reset" class="btn btn-secondary btn-sm" style="padding: 4px 10px; font-size: 0.78rem;" title="Reset 1.0x View">Reset 1× View</button>
              <span id="zoom-badge" style="font-family: var(--font-mono); font-size: 0.78rem; color: #38bdf8; font-weight: 700; min-width: 44px; text-align: right;">1.0×</span>
            </div>
          </div>

          <!-- Canvas Display Mount -->
          <div id="atlas-canvas-container" style="position: relative; width: 100%; height: 640px; background: radial-gradient(circle at center, #0f172a 0%, #020617 100%); border-radius: 12px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.08); touch-action: none; cursor: grab;">
            <canvas id="atlas-canvas" style="display: block; width: 100%; height: 100%;"></canvas>

            <!-- Floating Overlay Badge for Active Mode -->
            <div id="canvas-overlay-banner" style="position: absolute; top: 14px; left: 14px; pointer-events: none; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 8px; padding: 6px 14px; display: flex; align-items: center; gap: 8px; font-size: 0.82rem; font-weight: 700; color: #38bdf8; box-shadow: 0 4px 12px rgba(0,0,0,0.4);">
              <span>🔍</span>
              <span id="canvas-mode-text">4K UHD Anatomical Matrix • Drag to Pan • Wheel/Pinch to Zoom</span>
            </div>

            <!-- Quiz Target Banner (Visible in Quiz Mode) -->
            <div id="quiz-prompt-banner" style="display: none; position: absolute; bottom: 16px; left: 16px; right: 16px; background: rgba(15, 23, 42, 0.92); border: 1.5px solid #38bdf8; border-radius: 10px; padding: 12px 18px; box-shadow: 0 10px 25px rgba(0,0,0,0.7); display: none; justify-content: space-between; align-items: center; gap: 12px;">
              <div>
                <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 800; color: #38bdf8;">Locate Target Structure:</div>
                <div id="quiz-target-text" style="font-size: 1.05rem; font-weight: 800; color: #ffffff;">...</div>
              </div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <span id="quiz-score-badge" style="font-family: var(--font-mono); font-size: 0.9rem; font-weight: 800; color: #10b981; background: rgba(16, 185, 129, 0.15); padding: 4px 10px; border-radius: 6px;">Score: 0 / 0</span>
                <button id="btn-quiz-skip" class="btn btn-secondary btn-sm" style="font-size: 0.78rem;">Skip</button>
              </div>
            </div>
          </div>

          <!-- Bottom Layer Opacity & Dissection Strip (Macro Mode) -->
          <div id="dissection-control-panel" style="display: flex; flex-direction: column; gap: 8px; background: rgba(15, 23, 42, 0.5); padding: 12px 16px; border-radius: 10px; border: 1px solid var(--border-color);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-color); text-transform: uppercase; letter-spacing: 0.05em;">
                Layer Dissection &amp; Opacity Blending
              </span>
              <button id="btn-isolate-skeletal" class="btn btn-outline btn-sm" style="font-size: 0.72rem; padding: 2px 8px;">
                Isolate Skeleton
              </button>
              <button id="btn-isolate-viscera" class="btn btn-outline btn-sm" style="font-size: 0.72rem; padding: 2px 8px;">
                Isolate Viscera
              </button>
              <button id="btn-reset-layers" class="btn btn-secondary btn-sm" style="font-size: 0.72rem; padding: 2px 8px;">
                Reset All Layers
              </button>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; font-size: 0.78rem;">
              <div>
                <div style="display: flex; justify-content: space-between; color: var(--text-dim); margin-bottom: 2px;">
                  <span>✨ Integument</span>
                  <span id="val-skin">25%</span>
                </div>
                <input id="rng-skin" type="range" min="0" max="100" value="25" class="range-slider" style="width: 100%;">
              </div>
              <div>
                <div style="display: flex; justify-content: space-between; color: #f87171; margin-bottom: 2px;">
                  <span>💪 Muscular</span>
                  <span id="val-muscular">85%</span>
                </div>
                <input id="rng-muscular" type="range" min="0" max="100" value="85" class="range-slider" style="width: 100%;">
              </div>
              <div>
                <div style="display: flex; justify-content: space-between; color: #e2e8f0; margin-bottom: 2px;">
                  <span>💀 Skeletal</span>
                  <span id="val-skeletal">95%</span>
                </div>
                <input id="rng-skeletal" type="range" min="0" max="100" value="95" class="range-slider" style="width: 100%;">
              </div>
              <div>
                <div style="display: flex; justify-content: space-between; color: #fbbf24; margin-bottom: 2px;">
                  <span>🍽️ Splanchnic/Viscera</span>
                  <span id="val-visceral">100%</span>
                </div>
                <input id="rng-visceral" type="range" min="0" max="100" value="100" class="range-slider" style="width: 100%;">
              </div>
              <div>
                <div style="display: flex; justify-content: space-between; color: #ef4444; margin-bottom: 2px;">
                  <span>🫀 Vasculature</span>
                  <span id="val-circulatory">100%</span>
                </div>
                <input id="rng-circulatory" type="range" min="0" max="100" value="100" class="range-slider" style="width: 100%;">
              </div>
              <div>
                <div style="display: flex; justify-content: space-between; color: #38bdf8; margin-bottom: 2px;">
                  <span>🧠 Nervous</span>
                  <span id="val-nervous">90%</span>
                </div>
                <input id="rng-nervous" type="range" min="0" max="100" value="90" class="range-slider" style="width: 100%;">
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT: Telemetry Inspector / Histology Controller -->
        <div style="display: flex; flex-direction: column; gap: 14px;">

          <!-- SEARCH & QUICK LOCATOR -->
          <div class="sim-telemetry-card" style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px; background: var(--surface-bg); display: flex; flex-direction: column; gap: 8px;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #38bdf8; text-transform: uppercase;">
              🔍 Anatomical Index Search
            </div>
            <div style="position: relative;">
              <input id="input-anatomy-search" type="text" placeholder="Search bone, organ, vessel, nerve (English or Latin)..." class="search-input" style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border-color); background: rgba(15, 23, 42, 0.8); color: var(--text-color); font-size: 0.88rem;">
            </div>
          </div>

          <!-- MACRO MODE: SELECTED STRUCTURE DOSSIER -->
          <div id="panel-macro-inspector" class="sim-telemetry-card" style="border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; background: var(--surface-bg); display: flex; flex-direction: column; gap: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
              <div>
                <span id="inspect-system-badge" style="font-size: 0.72rem; padding: 3px 10px; border-radius: 9999px; font-weight: 700; text-transform: uppercase; background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3);">
                  Cardiovascular System
                </span>
                <h3 id="inspect-title" style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; margin: 8px 0 2px 0; color: var(--text-color);">
                  Four-Chambered Heart
                </h3>
                <div id="inspect-latin" style="font-size: 0.9rem; color: #38bdf8; font-style: italic; font-weight: 600;">
                  Cor / Myocardium
                </div>
              </div>
              <button id="btn-focus-structure" class="btn btn-primary btn-sm" style="font-size: 0.78rem; padding: 6px 12px; font-weight: 700; white-space: nowrap;">
                🎯 Focus 4K
              </button>
            </div>

            <!-- Morphology Description -->
            <p id="inspect-desc" style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.6; margin: 0;">
              Conical hollow muscular organ nestled in middle mediastinum, tilted 2/3 to the left of sternal midline. Enclosed in fibroserous pericardial sac with pericardial cavity containing serous lubricating fluid.
            </p>

            <!-- Physiological Function -->
            <div class="sim-sub-card" style="border-radius: 10px; padding: 12px 14px; background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border-color);">
              <div style="font-size: 0.75rem; font-weight: 700; color: #10b981; text-transform: uppercase; margin-bottom: 4px;">
                ⚡ Physiological Mechanism &amp; Role
              </div>
              <div id="inspect-function" style="font-size: 0.84rem; color: var(--text-color); line-height: 1.5;">
                Pumps 70 mL stroke volume per beat at 60-100 bpm (~7,200 L daily). Right heart pumps deoxygenated blood to pulmonary circuit; left heart pumps oxygenated blood through aorta into high-resistance systemic circuit.
              </div>
            </div>

            <!-- Vascularization & Innervation Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div class="sim-sub-card" style="border-radius: 8px; padding: 10px; background: rgba(15, 23, 42, 0.4); border: 1px solid var(--border-color);">
                <div style="font-size: 0.72rem; font-weight: 700; color: #ef4444; text-transform: uppercase; margin-bottom: 2px;">
                  🩸 Blood Supply
                </div>
                <div id="inspect-vascular" style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.4;">
                  Coronary arteries (LAD, LCx, RCA); drains via great cardiac vein into coronary sinus.
                </div>
              </div>
              <div class="sim-sub-card" style="border-radius: 8px; padding: 10px; background: rgba(15, 23, 42, 0.4); border: 1px solid var(--border-color);">
                <div style="font-size: 0.72rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; margin-bottom: 2px;">
                  ⚡ Innervation
                </div>
                <div id="inspect-nerve" style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.4;">
                  Cardiac plexus: T1-T4 sympathetic accelerator vs Vagus nerve (CN X) parasympathetic brake.
                </div>
              </div>
            </div>

            <!-- Clinical Pathology Correlation -->
            <div class="sim-sub-card" style="border-radius: 10px; padding: 12px 14px; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25);">
              <div style="font-size: 0.75rem; font-weight: 700; color: #f87171; text-transform: uppercase; margin-bottom: 4px;">
                🩺 Clinical Pathology Correlation
              </div>
              <div id="inspect-pathology" style="font-size: 0.82rem; color: #fca5a5; line-height: 1.45;">
                Coronary artery disease, acute myocardial infarction (STEMI/NSTEMI with cardiac troponin release), congestive heart failure.
              </div>
            </div>
          </div>

          <!-- HISTOLOGY SIMULATION CONTROLLER (Visible when in Histology Tab) -->
          <div id="panel-histology-controller" class="sim-telemetry-card" style="display: none; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; background: var(--surface-bg); flex-direction: column; gap: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.75rem; font-weight: 700; color: #10b981; text-transform: uppercase;">
                Microscopic Model Selector
              </span>
              <span class="slide-stain-badge" style="font-size: 0.72rem; padding: 2px 8px; border-radius: 9999px; background: rgba(16, 185, 129, 0.15); color: #10b981; font-weight: 700;">
                60 FPS Real-Time
              </span>
            </div>

            <select id="sel-histology-model" class="sim-select" style="padding: 8px 12px; border-radius: 8px; font-weight: 700; background: rgba(15, 23, 42, 0.8); color: var(--text-color); border: 1px solid var(--border-color); font-size: 0.9rem;">
              <option value="cardiac_cycle">🫀 Cardiac Cycle &amp; ECG Conduction System</option>
              <option value="nephron_countercurrent">🧪 Nephron &amp; Countercurrent Multiplier</option>
              <option value="neuron_synapse">🧠 Neuron Action Potential &amp; Synapse</option>
              <option value="alveolar_gas_exchange">🫁 Alveolar Blood-Air Diffusion Barrier</option>
              <option value="osteon_haversian">💀 Compact Bone Osteon &amp; Haversian System</option>
              <option value="sarcomere_sliding">💪 Sarcomere Sliding Filament Contraction</option>
            </select>

            <!-- Dynamic Model Parameters & Sliders -->
            <div id="histology-dynamic-controls" style="display: flex; flex-direction: column; gap: 12px;">
              <!-- Injected dynamically based on selected model -->
            </div>

            <!-- Quantitative Telemetry Table -->
            <div id="histology-telemetry-table" style="background: rgba(15, 23, 42, 0.5); border-radius: 8px; padding: 12px; border: 1px solid var(--border-color); font-size: 0.8rem; display: flex; flex-direction: column; gap: 6px;">
              <!-- Key parameters injected dynamically -->
            </div>
          </div>

          <!-- CHECKPOINT ASSESSMENT PROMPT -->
          <div id="atlas-checkpoint-mount" style="margin-top: 4px;"></div>
        </div>
      </div>
    </div>
  `;

  // Grab DOM Elements
  const canvas = document.getElementById("atlas-canvas");
  const ctx = canvas.getContext("2d");
  const btnTabMacro = document.getElementById("btn-tab-macro");
  const btnTabHistology = document.getElementById("btn-tab-histology");
  const btnTabQuiz = document.getElementById("btn-tab-quiz");
  const btnExport4k = document.getElementById("btn-export-4k");
  const btnOpenDossier = document.getElementById("btn-open-dossier");
  const btnViewAnt = document.getElementById("btn-view-anterior");
  const btnViewPost = document.getElementById("btn-view-posterior");
  const selRegionJump = document.getElementById("sel-region-jump");
  const btnZoomIn = document.getElementById("btn-zoom-in");
  const btnZoomOut = document.getElementById("btn-zoom-out");
  const btnZoomReset = document.getElementById("btn-zoom-reset");
  const zoomBadge = document.getElementById("zoom-badge");
  const canvasOverlayBanner = document.getElementById("canvas-overlay-banner");
  const canvasModeText = document.getElementById("canvas-mode-text");
  const quizPromptBanner = document.getElementById("quiz-prompt-banner");
  const quizTargetText = document.getElementById("quiz-target-text");
  const quizScoreBadge = document.getElementById("quiz-score-badge");
  const btnQuizSkip = document.getElementById("btn-quiz-skip");
  const inputSearch = document.getElementById("input-anatomy-search");
  const panelMacroInspector = document.getElementById("panel-macro-inspector");
  const panelHistologyController = document.getElementById("panel-histology-controller");
  const selHistologyModel = document.getElementById("sel-histology-model");
  const histologyDynamicControls = document.getElementById("histology-dynamic-controls");
  const histologyTelemetryTable = document.getElementById("histology-telemetry-table");
  const dissectionControlPanel = document.getElementById("dissection-control-panel");
  const btnFocusStructure = document.getElementById("btn-focus-structure");

  // Layer sliders
  const rngSkin = document.getElementById("rng-skin");
  const rngMuscular = document.getElementById("rng-muscular");
  const rngSkeletal = document.getElementById("rng-skeletal");
  const rngVisceral = document.getElementById("rng-visceral");
  const rngCirculatory = document.getElementById("rng-circulatory");
  const rngNervous = document.getElementById("rng-nervous");

  // Mount post-lab checkpoint
  mountLabCheckpoint("atlas-checkpoint-mount", "anatomy", (score, total) => {
    SoundFX.playSuccess();
    LabTrialStore.addTrial("anatomy", {
      type: "Anatomy Competency Checkpoint",
      score: `${score}/${total}`,
      accuracy: `${Math.round((score / total) * 100)}%`
    });
  });

  // Layer Slider Listeners
  const bindSlider = (slider, key, valDisp) => {
    slider?.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      layerOpacities[key] = val / 100;
      document.getElementById(valDisp).innerText = `${Math.round(val)}%`;
    });
  };
  bindSlider(rngSkin, "skin", "val-skin");
  bindSlider(rngMuscular, "muscular", "val-muscular");
  bindSlider(rngSkeletal, "skeletal", "val-skeletal");
  bindSlider(rngVisceral, "visceral", "val-visceral");
  bindSlider(rngCirculatory, "circulatory", "val-circulatory");
  bindSlider(rngNervous, "nervous", "val-nervous");

  // Quick Layer Isolators
  document.getElementById("btn-isolate-skeletal")?.addEventListener("click", () => {
    layerOpacities.skin = 0.05;
    layerOpacities.muscular = 0.1;
    layerOpacities.skeletal = 1.0;
    layerOpacities.visceral = 0.05;
    layerOpacities.circulatory = 0.1;
    layerOpacities.nervous = 0.1;
    syncSliders();
  });
  document.getElementById("btn-isolate-viscera")?.addEventListener("click", () => {
    layerOpacities.skin = 0.05;
    layerOpacities.muscular = 0.1;
    layerOpacities.skeletal = 0.2;
    layerOpacities.visceral = 1.0;
    layerOpacities.circulatory = 0.7;
    layerOpacities.nervous = 0.3;
    syncSliders();
  });
  document.getElementById("btn-reset-layers")?.addEventListener("click", () => {
    layerOpacities.skin = 0.25;
    layerOpacities.muscular = 0.85;
    layerOpacities.skeletal = 0.95;
    layerOpacities.visceral = 1.0;
    layerOpacities.circulatory = 1.0;
    layerOpacities.nervous = 0.90;
    syncSliders();
  });

  function syncSliders() {
    if (rngSkin) { rngSkin.value = layerOpacities.skin * 100; document.getElementById("val-skin").innerText = `${Math.round(layerOpacities.skin * 100)}%`; }
    if (rngMuscular) { rngMuscular.value = layerOpacities.muscular * 100; document.getElementById("val-muscular").innerText = `${Math.round(layerOpacities.muscular * 100)}%`; }
    if (rngSkeletal) { rngSkeletal.value = layerOpacities.skeletal * 100; document.getElementById("val-skeletal").innerText = `${Math.round(layerOpacities.skeletal * 100)}%`; }
    if (rngVisceral) { rngVisceral.value = layerOpacities.visceral * 100; document.getElementById("val-visceral").innerText = `${Math.round(layerOpacities.visceral * 100)}%`; }
    if (rngCirculatory) { rngCirculatory.value = layerOpacities.circulatory * 100; document.getElementById("val-circulatory").innerText = `${Math.round(layerOpacities.circulatory * 100)}%`; }
    if (rngNervous) { rngNervous.value = layerOpacities.nervous * 100; document.getElementById("val-nervous").innerText = `${Math.round(layerOpacities.nervous * 100)}%`; }
  }

  // Focus camera directly on selected structure
  btnFocusStructure?.addEventListener("click", () => {
    if (!selectedStructure) return;
    SoundFX.playPop();
    focusCameraOnCoords(selectedStructure.coords.x, selectedStructure.coords.y, 3.2);
  });

  function focusCameraOnCoords(targetX, targetY, targetZoom = 3.0) {
    zoom = targetZoom;
    if (zoomBadge) zoomBadge.innerText = `${zoom.toFixed(1)}×`;
    // Center of canvas is (width/2, height/2). In normalized 1000x1800 coordinate space:
    const canvasRect = canvas.getBoundingClientRect();
    const w = canvasRect.width || 600;
    const h = canvasRect.height || 640;
    const scale = (h / 1800) * zoom;
    panX = (w / 2) - (targetX * scale);
    panY = (h / 2) - (targetY * scale);
  }

  // Update Inspector Card
  function updateInspectorCard(structure) {
    if (!structure) return;
    selectedStructure = structure;
    const sys = ANATOMICAL_SYSTEMS[structure.system] || { name: structure.system, color: "#38bdf8", badgeBg: "rgba(56, 189, 248, 0.15)", badgeBorder: "rgba(56, 189, 248, 0.3)" };

    const badge = document.getElementById("inspect-system-badge");
    if (badge) {
      badge.innerText = sys.name;
      badge.style.color = sys.color;
      badge.style.background = sys.badgeBg;
      badge.style.borderColor = sys.badgeBorder;
    }
    const title = document.getElementById("inspect-title");
    if (title) title.innerText = structure.name;
    const latin = document.getElementById("inspect-latin");
    if (latin) latin.innerText = structure.latinName;
    const desc = document.getElementById("inspect-desc");
    if (desc) desc.innerText = structure.description;
    const fn = document.getElementById("inspect-function");
    if (fn) fn.innerText = structure.function;
    const vasc = document.getElementById("inspect-vascular");
    if (vasc) vasc.innerText = structure.vascularization;
    const nerve = document.getElementById("inspect-nerve");
    if (nerve) nerve.innerText = structure.innervation;
    const path = document.getElementById("inspect-pathology");
    if (path) path.innerText = structure.pathology;
  }

  // Search input filter
  inputSearch?.addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    if (!searchQuery) return;
    const match = ANATOMICAL_STRUCTURES.find(s => 
      s.name.toLowerCase().includes(searchQuery) ||
      s.latinName.toLowerCase().includes(searchQuery) ||
      s.system.toLowerCase().includes(searchQuery) ||
      s.description.toLowerCase().includes(searchQuery)
    );
    if (match) {
      if (activeView !== match.view) {
        activeView = match.view;
        btnViewAnt.classList.toggle("btn-primary", activeView === "anterior");
        btnViewAnt.classList.toggle("btn-secondary", activeView !== "anterior");
        btnViewPost.classList.toggle("btn-primary", activeView === "posterior");
        btnViewPost.classList.toggle("btn-secondary", activeView !== "posterior");
      }
      updateInspectorCard(match);
      focusCameraOnCoords(match.coords.x, match.coords.y, 2.8);
    }
  });

  // Tab Switching
  function switchTab(newTab) {
    activeTab = newTab;
    btnTabMacro.classList.toggle("btn-primary", activeTab === "macro");
    btnTabMacro.classList.toggle("btn-secondary", activeTab !== "macro");
    btnTabHistology.classList.toggle("btn-primary", activeTab === "histology");
    btnTabHistology.classList.toggle("btn-secondary", activeTab !== "histology");
    btnTabQuiz.classList.toggle("btn-primary", activeTab === "quiz");
    btnTabQuiz.classList.toggle("btn-secondary", activeTab !== "quiz");

    panelMacroInspector.style.display = (activeTab === "macro" || activeTab === "quiz") ? "flex" : "none";
    panelHistologyController.style.display = (activeTab === "histology") ? "flex" : "none";
    dissectionControlPanel.style.display = (activeTab === "macro") ? "flex" : "none";
    quizPromptBanner.style.display = (activeTab === "quiz") ? "flex" : "none";

    if (activeTab === "macro") {
      canvasModeText.innerText = "4K UHD Anatomical Matrix • Drag to Pan • Wheel/Pinch to Zoom";
    } else if (activeTab === "histology") {
      canvasModeText.innerText = "60 FPS Microscopic Simulation Workbench • Interactive Physiological Parameters";
      renderHistologyControls();
    } else if (activeTab === "quiz") {
      canvasModeText.innerText = "🎯 Pin Challenge Mode: Click the correct anatomical landmark!";
      selectNewQuizTarget();
      updateQuizBanner();
    }
    SoundFX.playClick();
  }

  btnTabMacro?.addEventListener("click", () => switchTab("macro"));
  btnTabHistology?.addEventListener("click", () => switchTab("histology"));
  btnTabQuiz?.addEventListener("click", () => switchTab("quiz"));

  // View Angle Toggle
  btnViewAnt?.addEventListener("click", () => {
    activeView = "anterior";
    btnViewAnt.classList.add("btn-primary");
    btnViewAnt.classList.remove("btn-secondary");
    btnViewPost.classList.remove("btn-primary");
    btnViewPost.classList.add("btn-secondary");
    SoundFX.playClick();
  });
  btnViewPost?.addEventListener("click", () => {
    activeView = "posterior";
    btnViewPost.classList.add("btn-primary");
    btnViewPost.classList.remove("btn-secondary");
    btnViewAnt.classList.remove("btn-primary");
    btnViewAnt.classList.add("btn-secondary");
    SoundFX.playClick();
  });

  // Regional Jump
  selRegionJump?.addEventListener("change", (e) => {
    const reg = e.target.value;
    activeRegion = reg;
    SoundFX.playClick();
    if (reg === "all") {
      zoom = 1.0;
      panX = 0;
      panY = 0;
    } else if (reg === "head") {
      focusCameraOnCoords(500, 150, 3.2);
    } else if (reg === "thorax") {
      focusCameraOnCoords(500, 380, 3.2);
    } else if (reg === "abdomen") {
      focusCameraOnCoords(500, 620, 3.0);
    } else if (reg === "pelvis") {
      focusCameraOnCoords(500, 820, 3.0);
    } else if (reg === "upper_limb") {
      focusCameraOnCoords(330, 450, 2.6);
    } else if (reg === "lower_limb") {
      focusCameraOnCoords(440, 1200, 2.2);
    }
    if (zoomBadge) zoomBadge.innerText = `${zoom.toFixed(1)}×`;
  });

  // Zoom buttons
  btnZoomIn?.addEventListener("click", () => {
    zoom = Math.min(10.0, zoom * 1.35);
    if (zoomBadge) zoomBadge.innerText = `${zoom.toFixed(1)}×`;
    SoundFX.playClick();
  });
  btnZoomOut?.addEventListener("click", () => {
    zoom = Math.max(0.6, zoom / 1.35);
    if (zoomBadge) zoomBadge.innerText = `${zoom.toFixed(1)}×`;
    SoundFX.playClick();
  });
  btnZoomReset?.addEventListener("click", () => {
    zoom = 1.0;
    panX = 0;
    panY = 0;
    if (zoomBadge) zoomBadge.innerText = "1.0×";
    SoundFX.playClick();
  });

  // Skip Quiz Question
  btnQuizSkip?.addEventListener("click", () => {
    quizState.totalQuestions++;
    quizState.streak = 0;
    selectNewQuizTarget();
    updateQuizBanner();
  });

  function updateQuizBanner() {
    if (!quizState.targetStructure) return;
    if (quizTargetText) {
      quizTargetText.innerHTML = `
        <span style="color: #38bdf8;">${quizState.targetStructure.name}</span>
        <span style="font-size: 0.85rem; color: var(--text-dim); font-style: italic;"> (${quizState.targetStructure.latinName})</span>
      `;
    }
    if (quizScoreBadge) {
      const pct = quizState.totalQuestions > 0 ? Math.round((quizState.score / quizState.totalQuestions) * 100) : 0;
      quizScoreBadge.innerText = `Score: ${quizState.score} / ${quizState.totalQuestions} (${pct}%) • Streak: ${quizState.streak}`;
    }
  }

  // Pointer interaction on canvas (Pan & Click Pins)
  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
      width: rect.width,
      height: rect.height
    };
  }

  function canvasToNormalizedCoords(cx, cy, width, height) {
    const scale = (height / 1800) * zoom;
    const nx = (cx - panX) / scale;
    const ny = (cy - panY) / scale;
    return { x: nx, y: ny };
  }

  canvas.addEventListener("pointerdown", (e) => {
    isDragging = true;
    dragStartX = e.clientX - panX;
    dragStartY = e.clientY - panY;
    canvas.style.cursor = "grabbing";
  });

  window.addEventListener("pointermove", (e) => {
    if (isDragging) {
      panX = e.clientX - dragStartX;
      panY = e.clientY - dragStartY;
    } else {
      // Hover detection on pins
      const coords = getCanvasCoords(e);
      const norm = canvasToNormalizedCoords(coords.x, coords.y, coords.width, coords.height);
      const hitRadius = 36 / zoom; // Screen pixel normalized radius
      const found = ANATOMICAL_STRUCTURES.find(s => {
        if (s.view !== activeView) return false;
        const dx = s.coords.x - norm.x;
        const dy = s.coords.y - norm.y;
        return Math.hypot(dx, dy) <= hitRadius;
      });
      hoveredStructure = found || null;
      canvas.style.cursor = hoveredStructure ? "pointer" : "grab";
    }
  });

  window.addEventListener("pointerup", (e) => {
    if (isDragging) {
      isDragging = false;
      canvas.style.cursor = "grab";
    }
  });

  // Click on pin
  canvas.addEventListener("click", (e) => {
    const coords = getCanvasCoords(e);
    const norm = canvasToNormalizedCoords(coords.x, coords.y, coords.width, coords.height);
    const hitRadius = 40 / zoom;
    const clicked = ANATOMICAL_STRUCTURES.find(s => {
      if (s.view !== activeView) return false;
      const dx = s.coords.x - norm.x;
      const dy = s.coords.y - norm.y;
      return Math.hypot(dx, dy) <= hitRadius;
    });

    if (clicked) {
      SoundFX.playPop();
      if (activeTab === "quiz") {
        quizState.totalQuestions++;
        if (quizState.targetStructure && clicked.id === quizState.targetStructure.id) {
          quizState.score++;
          quizState.streak++;
          SoundFX.playSuccess();
          quizState.feedbackMsg = `✅ Correct! You successfully located ${clicked.name}.`;
          selectNewQuizTarget();
        } else {
          quizState.streak = 0;
          quizState.feedbackMsg = `❌ Incorrect. You clicked ${clicked.name}. Try locating ${quizState.targetStructure.name}.`;
        }
        updateQuizBanner();
      } else {
        updateInspectorCard(clicked);
      }
    }
  });

  // Wheel Zoom
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const newZoom = Math.max(0.6, Math.min(10.0, zoom * zoomFactor));

    // Zoom centered on cursor
    const coords = getCanvasCoords(e);
    const mouseX = coords.x;
    const mouseY = coords.y;

    panX = mouseX - (mouseX - panX) * (newZoom / zoom);
    panY = mouseY - (mouseY - panY) * (newZoom / zoom);
    zoom = newZoom;

    if (zoomBadge) zoomBadge.innerText = `${zoom.toFixed(1)}×`;
  }, { passive: false });

  // Histology Model Dropdown Change
  selHistologyModel?.addEventListener("change", (e) => {
    activeHistologyModel = e.target.value;
    SoundFX.playClick();
    renderHistologyControls();
  });

  function renderHistologyControls() {
    const model = HISTOLOGY_SIMULATION_MODELS[activeHistologyModel];
    if (!model) return;

    if (activeHistologyModel === "cardiac_cycle") {
      histologyDynamicControls.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 700;">
            <span>Pacemaker Heart Rate (SA Node):</span>
            <span id="disp-hr" style="color: #ef4444; font-family: var(--font-mono);">${histoState.heartRate} bpm</span>
          </div>
          <input id="rng-hr" type="range" min="40" max="180" value="${histoState.heartRate}" class="range-slider" style="width: 100%;">
          <div style="display: flex; justify-content: space-between; font-size: 0.74rem; color: var(--text-dim);">
            <span>Bradycardia (&lt;60)</span>
            <span>Normal (60-100)</span>
            <span>Tachycardia (&gt;100)</span>
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button id="btn-sound-heart" class="btn btn-secondary btn-sm" style="flex: 1; font-weight: 700; font-size: 0.78rem;">
            🔊 Heart Valve Acoustics: Active
          </button>
        </div>
      `;
      document.getElementById("rng-hr")?.addEventListener("input", (e) => {
        histoState.heartRate = parseInt(e.target.value);
        document.getElementById("disp-hr").innerText = `${histoState.heartRate} bpm`;
      });
    } else if (activeHistologyModel === "nephron_countercurrent") {
      histologyDynamicControls.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 700;">
            <span>Antidiuretic Hormone (ADH / Vasopressin):</span>
            <span id="disp-adh" style="color: #a78bfa; font-family: var(--font-mono);">${histoState.adhLevel}%</span>
          </div>
          <input id="rng-adh" type="range" min="0" max="100" value="${histoState.adhLevel}" class="range-slider" style="width: 100%;">
          <div style="display: flex; justify-content: space-between; font-size: 0.74rem; color: var(--text-dim);">
            <span>Dilute Urine (Diabetes Insipidus)</span>
            <span>Concentrated Urine (1200 mOsm)</span>
          </div>
        </div>
      `;
      document.getElementById("rng-adh")?.addEventListener("input", (e) => {
        histoState.adhLevel = parseInt(e.target.value);
        document.getElementById("disp-adh").innerText = `${histoState.adhLevel}%`;
      });
    } else if (activeHistologyModel === "sarcomere_sliding") {
      histologyDynamicControls.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 700;">
            <span>Sarcomere Length (Z-Disc Distance):</span>
            <span id="disp-sarc" style="color: #f87171; font-family: var(--font-mono);">${histoState.sarcomereLength.toFixed(2)} µm</span>
          </div>
          <input id="rng-sarc" type="range" min="160" max="240" value="${Math.round(histoState.sarcomereLength * 100)}" class="range-slider" style="width: 100%;">
          <div style="display: flex; justify-content: space-between; font-size: 0.74rem; color: var(--text-dim);">
            <span>Fully Contracted (1.6 µm)</span>
            <span>Resting Optimum (2.2 µm)</span>
            <span>Overstretched (2.4 µm)</span>
          </div>
        </div>
      `;
      document.getElementById("rng-sarc")?.addEventListener("input", (e) => {
        histoState.sarcomereLength = parseInt(e.target.value) / 100;
        document.getElementById("disp-sarc").innerText = `${histoState.sarcomereLength.toFixed(2)} µm`;
      });
    } else if (activeHistologyModel === "neuron_synapse") {
      histologyDynamicControls.innerHTML = `
        <button id="btn-fire-ap" class="btn btn-primary" style="padding: 10px 16px; font-weight: 800; font-size: 0.9rem; border-radius: 8px;">
          ⚡ Fire Threshold Action Potential (+30 mV)
        </button>
      `;
      document.getElementById("btn-fire-ap")?.addEventListener("click", () => {
        histoState.actionPotentialStim = true;
        histoState.apPhaseProgress = 0;
        SoundFX.playPop();
      });
    } else if (activeHistologyModel === "alveolar_gas_exchange") {
      histologyDynamicControls.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 700;">
            <span>Fraction of Inspired O2 (FiO2):</span>
            <span id="disp-fio2" style="color: #34d399; font-family: var(--font-mono);">${histoState.fio2}%</span>
          </div>
          <input id="rng-fio2" type="range" min="12" max="100" value="${histoState.fio2}" class="range-slider" style="width: 100%;">
          <div style="display: flex; justify-content: space-between; font-size: 0.74rem; color: var(--text-dim);">
            <span>High Altitude (Hypoxia)</span>
            <span>Room Air (21%)</span>
            <span>Hyperoxia (100%)</span>
          </div>
        </div>
      `;
      document.getElementById("rng-fio2")?.addEventListener("input", (e) => {
        histoState.fio2 = parseInt(e.target.value);
        document.getElementById("disp-fio2").innerText = `${histoState.fio2}%`;
      });
    } else {
      histologyDynamicControls.innerHTML = `
        <div style="font-size: 0.82rem; color: var(--text-muted);">
          Standard histological architecture viewer. Inspect concentric lamellae, osteocytes, and canalicular tunnels under polarized magnification.
        </div>
      `;
    }

    // Update telemetry table
    let tableHtml = `<div style="font-weight: 700; color: #f1f5f9; margin-bottom: 4px;">${model.title}</div>`;
    tableHtml += `<div style="font-size: 0.78rem; color: #94a3b8; line-height: 1.4; margin-bottom: 8px;">${model.summary}</div>`;
    tableHtml += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">`;
    model.keyParameters.forEach(p => {
      tableHtml += `
        <div style="background: rgba(0,0,0,0.3); padding: 6px 8px; border-radius: 6px;">
          <div style="color: var(--text-dim); font-size: 0.72rem;">${p.name}</div>
          <div style="color: #38bdf8; font-family: var(--font-mono); font-weight: 700;">${p.value}</div>
        </div>
      `;
    });
    tableHtml += `</div>`;
    histologyTelemetryTable.innerHTML = tableHtml;
  }

  // 4K PNG Diagram Exporter
  btnExport4k?.addEventListener("click", () => {
    SoundFX.playSuccess();
    export4kHighResDiagram();
  });

  function export4kHighResDiagram() {
    const offCanvas = document.createElement("canvas");
    offCanvas.width = 3840;
    offCanvas.height = 2160;
    const offCtx = offCanvas.getContext("2d");

    // Render 4K background
    const bgGrad = offCtx.createLinearGradient(0, 0, 3840, 2160);
    bgGrad.addColorStop(0, "#090d16");
    bgGrad.addColorStop(0.5, "#0f172a");
    bgGrad.addColorStop(1, "#020617");
    offCtx.fillStyle = bgGrad;
    offCtx.fillRect(0, 0, 3840, 2160);

    // Grid markings
    offCtx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    offCtx.lineWidth = 1;
    for (let x = 0; x < 3840; x += 80) {
      offCtx.beginPath(); offCtx.moveTo(x, 0); offCtx.lineTo(x, 2160); offCtx.stroke();
    }
    for (let y = 0; y < 2160; y += 80) {
      offCtx.beginPath(); offCtx.moveTo(0, y); offCtx.lineTo(3840, y); offCtx.stroke();
    }

    // Header banner
    offCtx.fillStyle = "#ffffff";
    offCtx.font = "bold 64px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    offCtx.fillText("HUMAN ANATOMY ATLAS & SYSTEMIC MATRIX (4K UHD)", 120, 140);
    offCtx.fillStyle = "#38bdf8";
    offCtx.font = "600 32px 'JetBrains Mono', monospace";
    offCtx.fillText("EDUGATES-CLIPSAT RESEARCH-GRADE STEM LABORATORIES • TERMINOLOGIA ANATOMICA", 120, 190);

    // Draw anatomy figure onto 4K canvas
    offCtx.save();
    offCtx.translate(1420, 240);
    const offScale = 1.0;
    drawHumanBodyVector(offCtx, offScale, activeView);
    drawAnatomicalPins(offCtx, offScale, activeView, false);
    offCtx.restore();

    // Left info card
    offCtx.fillStyle = "rgba(15, 23, 42, 0.85)";
    offCtx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    offCtx.lineWidth = 3;
    offCtx.roundRect(120, 280, 800, 1600, 24);
    offCtx.fill();
    offCtx.stroke();

    if (selectedStructure) {
      offCtx.fillStyle = "#10b981";
      offCtx.font = "bold 26px 'JetBrains Mono', monospace";
      offCtx.fillText(selectedStructure.system.toUpperCase() + " SYSTEM", 160, 360);

      offCtx.fillStyle = "#ffffff";
      offCtx.font = "bold 48px sans-serif";
      offCtx.fillText(selectedStructure.name, 160, 425);

      offCtx.fillStyle = "#38bdf8";
      offCtx.font = "italic 32px sans-serif";
      offCtx.fillText(selectedStructure.latinName, 160, 475);

      offCtx.fillStyle = "#cbd5e1";
      offCtx.font = "26px sans-serif";
      wrapText(offCtx, selectedStructure.description, 160, 540, 720, 38);

      offCtx.fillStyle = "#34d399";
      offCtx.font = "bold 28px sans-serif";
      offCtx.fillText("PHYSIOLOGICAL FUNCTION:", 160, 780);
      offCtx.fillStyle = "#e2e8f0";
      offCtx.font = "24px sans-serif";
      wrapText(offCtx, selectedStructure.function, 160, 830, 720, 36);

      offCtx.fillStyle = "#f87171";
      offCtx.font = "bold 28px sans-serif";
      offCtx.fillText("CLINICAL PATHOLOGY:", 160, 1100);
      offCtx.fillStyle = "#fca5a5";
      offCtx.font = "24px sans-serif";
      wrapText(offCtx, selectedStructure.pathology, 160, 1150, 720, 36);
    }

    // Timestamp & Watermark
    offCtx.fillStyle = "rgba(255, 255, 255, 0.4)";
    offCtx.font = "20px 'JetBrains Mono', monospace";
    offCtx.fillText(`Rendered at ${new Date().toISOString()} • Native 3840×2160 Vector Metrology`, 120, 2100);

    // Download PNG
    const link = document.createElement("a");
    link.download = `human_anatomy_4k_atlas_${selectedStructure ? selectedStructure.id : 'matrix'}.png`;
    link.href = offCanvas.toDataURL("image/png");
    link.click();
  }

  function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line, x, y);
        line = words[n] + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, y);
  }

  // Open Lab Dossier
  btnOpenDossier?.addEventListener("click", () => {
    SoundFX.playClick();
    openLabReportModal({
      title: "Human Anatomy & Histology Lab Dossier",
      labId: "anatomy",
      apparatusConfig: {
        "View Angle": activeView === "anterior" ? "Coronal Anterior (Ventral)" : "Coronal Posterior (Dorsal)",
        "Selected Structure": selectedStructure ? `${selectedStructure.name} (${selectedStructure.latinName})` : "General",
        "Active System": selectedStructure ? selectedStructure.system : "All",
        "Magnification Zoom": `${zoom.toFixed(1)}x`,
        "Histology Model": activeHistologyModel
      },
      measurements: ANATOMICAL_STRUCTURES.slice(0, 15).map((s, idx) => ({
        "Index": idx + 1,
        "Structure": s.name,
        "Latin Nomenclature": s.latinName,
        "System": s.system,
        "Region": s.region,
        "Coordinates (X, Y)": `(${s.coords.x}, ${s.coords.y})`
      }))
    });
  });

  // ----------------------------------------------------
  // VECTOR RENDERING ENGINE (Body Silhouette & Organs)
  // ----------------------------------------------------
  function drawHumanBodyVector(targetCtx, renderScale = 1.0, view = "anterior") {
    targetCtx.save();
    targetCtx.scale(renderScale, renderScale);

    // 1. SKIN / INTEGUMENTARY LAYER
    if (layerOpacities.skin > 0.02) {
      targetCtx.save();
      targetCtx.globalAlpha = layerOpacities.skin;
      targetCtx.fillStyle = "rgba(226, 178, 142, 0.4)";
      targetCtx.strokeStyle = "rgba(240, 195, 160, 0.8)";
      targetCtx.lineWidth = 3;

      // Full body contour outline
      targetCtx.beginPath();
      // Head
      targetCtx.ellipse(500, 130, 75, 95, 0, 0, Math.PI * 2);
      // Neck
      targetCtx.moveTo(470, 220); targetCtx.lineTo(465, 260);
      targetCtx.lineTo(390, 280); // Shoulders
      targetCtx.lineTo(340, 360); // Arms
      targetCtx.lineTo(300, 520);
      targetCtx.lineTo(240, 680); // Hands
      targetCtx.lineTo(270, 680);
      targetCtx.lineTo(330, 520);
      targetCtx.lineTo(370, 370);
      targetCtx.lineTo(420, 480); // Torso side
      targetCtx.lineTo(430, 780); // Hip
      targetCtx.lineTo(400, 1100); // Thigh
      targetCtx.lineTo(410, 1380); // Knee
      targetCtx.lineTo(400, 1680); // Ankle
      targetCtx.lineTo(440, 1720); // Foot
      targetCtx.lineTo(460, 1680);
      targetCtx.lineTo(470, 1380);
      targetCtx.lineTo(485, 1050);
      targetCtx.lineTo(500, 880); // Inguinal crease
      // Symmetrical right side
      targetCtx.lineTo(515, 1050);
      targetCtx.lineTo(530, 1380);
      targetCtx.lineTo(540, 1680);
      targetCtx.lineTo(560, 1720);
      targetCtx.lineTo(600, 1680);
      targetCtx.lineTo(590, 1380);
      targetCtx.lineTo(600, 1100);
      targetCtx.lineTo(570, 780);
      targetCtx.lineTo(580, 480);
      targetCtx.lineTo(630, 370);
      targetCtx.lineTo(670, 520);
      targetCtx.lineTo(730, 680);
      targetCtx.lineTo(760, 680);
      targetCtx.lineTo(700, 520);
      targetCtx.lineTo(660, 360);
      targetCtx.lineTo(610, 280);
      targetCtx.lineTo(535, 260);
      targetCtx.lineTo(530, 220);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.stroke();
      targetCtx.restore();
    }

    // 2. MUSCULAR LAYER
    if (layerOpacities.muscular > 0.02) {
      targetCtx.save();
      targetCtx.globalAlpha = layerOpacities.muscular;
      targetCtx.fillStyle = "#ef4444";
      targetCtx.strokeStyle = "#b91c1c";
      targetCtx.lineWidth = 2;

      // Pectoralis Major (Anterior)
      if (view === "anterior") {
        targetCtx.beginPath();
        targetCtx.ellipse(450, 330, 45, 30, -0.2, 0, Math.PI * 2);
        targetCtx.ellipse(550, 330, 45, 30, 0.2, 0, Math.PI * 2);
        targetCtx.fill(); targetCtx.stroke();

        // Rectus Abdominis
        targetCtx.beginPath();
        targetCtx.roundRect(475, 520, 22, 160, 6);
        targetCtx.roundRect(503, 520, 22, 160, 6);
        targetCtx.fill(); targetCtx.stroke();

        // Quadriceps
        targetCtx.beginPath();
        targetCtx.ellipse(450, 1050, 32, 120, -0.05, 0, Math.PI * 2);
        targetCtx.ellipse(550, 1050, 32, 120, 0.05, 0, Math.PI * 2);
        targetCtx.fill(); targetCtx.stroke();
      } else {
        // Trapezius & Latissimus Dorsi (Posterior)
        targetCtx.beginPath();
        targetCtx.moveTo(500, 240);
        targetCtx.lineTo(410, 300);
        targetCtx.lineTo(440, 460);
        targetCtx.lineTo(500, 580);
        targetCtx.lineTo(560, 460);
        targetCtx.lineTo(590, 300);
        targetCtx.closePath();
        targetCtx.fill(); targetCtx.stroke();

        // Gluteus Maximus
        targetCtx.beginPath();
        targetCtx.ellipse(460, 840, 42, 50, -0.2, 0, Math.PI * 2);
        targetCtx.ellipse(540, 840, 42, 50, 0.2, 0, Math.PI * 2);
        targetCtx.fill(); targetCtx.stroke();

        // Hamstrings & Gastrocnemius
        targetCtx.beginPath();
        targetCtx.ellipse(450, 1060, 28, 110, 0, 0, Math.PI * 2);
        targetCtx.ellipse(550, 1060, 28, 110, 0, 0, Math.PI * 2);
        targetCtx.ellipse(440, 1380, 24, 75, 0, 0, Math.PI * 2);
        targetCtx.ellipse(560, 1380, 24, 75, 0, 0, Math.PI * 2);
        targetCtx.fill(); targetCtx.stroke();
      }

      // Deltoids & Biceps (Bilateral)
      targetCtx.beginPath();
      targetCtx.ellipse(375, 310, 25, 40, -0.4, 0, Math.PI * 2);
      targetCtx.ellipse(625, 310, 25, 40, 0.4, 0, Math.PI * 2);
      targetCtx.ellipse(345, 410, 18, 50, -0.15, 0, Math.PI * 2);
      targetCtx.ellipse(655, 410, 18, 50, 0.15, 0, Math.PI * 2);
      targetCtx.fill(); targetCtx.stroke();
      targetCtx.restore();
    }

    // 3. SKELETAL SYSTEM LAYER
    if (layerOpacities.skeletal > 0.02) {
      targetCtx.save();
      targetCtx.globalAlpha = layerOpacities.skeletal;
      targetCtx.fillStyle = "#f8fafc";
      targetCtx.strokeStyle = "#cbd5e1";
      targetCtx.lineWidth = 3;

      // Cranium / Skull
      targetCtx.beginPath();
      targetCtx.ellipse(500, 125, 62, 75, 0, 0, Math.PI * 2);
      targetCtx.fill(); targetCtx.stroke();

      // Facial orbits and nasal cavity (anterior)
      if (view === "anterior") {
        targetCtx.fillStyle = "#0f172a";
        targetCtx.beginPath();
        targetCtx.ellipse(475, 125, 12, 14, 0, 0, Math.PI * 2);
        targetCtx.ellipse(525, 125, 12, 14, 0, 0, Math.PI * 2);
        targetCtx.moveTo(500, 140); targetCtx.lineTo(495, 160); targetCtx.lineTo(505, 160); targetCtx.closePath();
        targetCtx.fill();
        targetCtx.fillStyle = "#f8fafc";
      }

      // Vertebral Column (Cervical, Thoracic, Lumbar, Sacrum)
      targetCtx.strokeStyle = "#94a3b8";
      targetCtx.lineWidth = 14;
      targetCtx.beginPath();
      targetCtx.moveTo(500, 200);
      targetCtx.lineTo(500, 840);
      targetCtx.stroke();

      // Clavicles
      targetCtx.lineWidth = 5;
      targetCtx.strokeStyle = "#f8fafc";
      targetCtx.beginPath();
      targetCtx.moveTo(500, 260); targetCtx.lineTo(400, 275);
      targetCtx.moveTo(500, 260); targetCtx.lineTo(600, 275);
      targetCtx.stroke();

      // Sternum & Rib Cage (12 Rib pairs)
      targetCtx.lineWidth = 3;
      for (let r = 0; r < 8; r++) {
        const ry = 300 + (r * 18);
        const rw = 55 + (r * 6);
        targetCtx.beginPath();
        targetCtx.ellipse(500, ry, rw, 16, 0, 0, Math.PI);
        targetCtx.stroke();
      }

      // Pelvis / Os Coxae
      targetCtx.beginPath();
      targetCtx.ellipse(460, 810, 48, 55, -0.3, 0, Math.PI * 2);
      targetCtx.ellipse(540, 810, 48, 55, 0.3, 0, Math.PI * 2);
      targetCtx.fill(); targetCtx.stroke();

      // Humerus, Radius, Ulna
      targetCtx.lineWidth = 7;
      targetCtx.beginPath();
      targetCtx.moveTo(390, 280); targetCtx.lineTo(340, 460); // Left humerus
      targetCtx.moveTo(610, 280); targetCtx.lineTo(660, 460); // Right humerus
      targetCtx.moveTo(340, 460); targetCtx.lineTo(290, 620); // Left radius/ulna
      targetCtx.moveTo(660, 460); targetCtx.lineTo(710, 620); // Right radius/ulna
      targetCtx.stroke();

      // Femur (Thigh) & Tibia/Fibula (Leg)
      targetCtx.lineWidth = 10;
      targetCtx.beginPath();
      targetCtx.moveTo(460, 840); targetCtx.lineTo(440, 1220); // Left femur
      targetCtx.moveTo(540, 840); targetCtx.lineTo(560, 1220); // Right femur
      targetCtx.stroke();

      // Patellae
      targetCtx.fillStyle = "#ffffff";
      targetCtx.beginPath();
      targetCtx.arc(440, 1220, 10, 0, Math.PI * 2);
      targetCtx.arc(560, 1220, 10, 0, Math.PI * 2);
      targetCtx.fill(); targetCtx.stroke();

      // Tibia / Fibula
      targetCtx.lineWidth = 7;
      targetCtx.beginPath();
      targetCtx.moveTo(440, 1230); targetCtx.lineTo(430, 1580);
      targetCtx.moveTo(560, 1230); targetCtx.lineTo(570, 1580);
      targetCtx.stroke();
      targetCtx.restore();
    }

    // 4. VISCERAL / INTERNAL ORGANS LAYER
    if (layerOpacities.visceral > 0.02) {
      targetCtx.save();
      targetCtx.globalAlpha = layerOpacities.visceral;

      // Trachea & Bronchi
      targetCtx.strokeStyle = "#38bdf8";
      targetCtx.lineWidth = 6;
      targetCtx.beginPath();
      targetCtx.moveTo(500, 220); targetCtx.lineTo(500, 320);
      targetCtx.lineTo(470, 360);
      targetCtx.moveTo(500, 320); targetCtx.lineTo(530, 360);
      targetCtx.stroke();

      // Lungs (Left & Right)
      targetCtx.fillStyle = "rgba(52, 211, 153, 0.75)";
      targetCtx.strokeStyle = "#10b981";
      targetCtx.lineWidth = 2;
      targetCtx.beginPath();
      targetCtx.ellipse(440, 380, 46, 75, -0.1, 0, Math.PI * 2);
      targetCtx.ellipse(560, 380, 42, 75, 0.1, 0, Math.PI * 2);
      targetCtx.fill(); targetCtx.stroke();

      // Heart
      targetCtx.fillStyle = "#ef4444";
      targetCtx.strokeStyle = "#991b1b";
      targetCtx.lineWidth = 3;
      targetCtx.beginPath();
      targetCtx.ellipse(512, 395, 34, 42, -0.3, 0, Math.PI * 2);
      targetCtx.fill(); targetCtx.stroke();

      // Liver (Large right lobe)
      targetCtx.fillStyle = "rgba(245, 158, 11, 0.85)";
      targetCtx.strokeStyle = "#b45309";
      targetCtx.beginPath();
      targetCtx.ellipse(465, 510, 52, 38, -0.15, 0, Math.PI * 2);
      targetCtx.fill(); targetCtx.stroke();

      // Stomach (J-shaped left upper quadrant)
      targetCtx.fillStyle = "rgba(251, 191, 36, 0.85)";
      targetCtx.strokeStyle = "#d97706";
      targetCtx.beginPath();
      targetCtx.ellipse(535, 520, 38, 32, 0.35, 0, Math.PI * 2);
      targetCtx.fill(); targetCtx.stroke();

      // Kidneys (Retroperitoneal)
      targetCtx.fillStyle = "#8b5cf6";
      targetCtx.strokeStyle = "#6d28d9";
      targetCtx.beginPath();
      targetCtx.ellipse(440, 600, 18, 30, -0.1, 0, Math.PI * 2);
      targetCtx.ellipse(560, 600, 18, 30, 0.1, 0, Math.PI * 2);
      targetCtx.fill(); targetCtx.stroke();

      // Small & Large Intestines
      targetCtx.fillStyle = "#d97706";
      targetCtx.strokeStyle = "#b45309";
      targetCtx.beginPath();
      targetCtx.ellipse(500, 690, 60, 50, 0, 0, Math.PI * 2);
      targetCtx.fill(); targetCtx.stroke();

      // Urinary Bladder
      targetCtx.fillStyle = "#c084fc";
      targetCtx.strokeStyle = "#9333ea";
      targetCtx.beginPath();
      targetCtx.ellipse(500, 835, 24, 20, 0, 0, Math.PI * 2);
      targetCtx.fill(); targetCtx.stroke();
      targetCtx.restore();
    }

    // 5. CARDIOVASCULAR VASCULATURE LAYER
    if (layerOpacities.circulatory > 0.02) {
      targetCtx.save();
      targetCtx.globalAlpha = layerOpacities.circulatory;

      // Aorta & Major Arteries (Red)
      targetCtx.strokeStyle = "#ef4444";
      targetCtx.lineWidth = 5;
      targetCtx.beginPath();
      // Ascending aorta & Arch
      targetCtx.arc(505, 340, 18, Math.PI, 0);
      targetCtx.lineTo(505, 780); // Descending abdominal aorta
      targetCtx.lineTo(465, 870); // Left common iliac
      targetCtx.moveTo(505, 780); targetCtx.lineTo(545, 870); // Right common iliac
      // Carotid arteries
      targetCtx.moveTo(495, 330); targetCtx.lineTo(480, 210);
      targetCtx.moveTo(515, 330); targetCtx.lineTo(530, 210);
      targetCtx.stroke();

      // Vena Cava & Major Veins (Blue)
      targetCtx.strokeStyle = "#38bdf8";
      targetCtx.lineWidth = 5;
      targetCtx.beginPath();
      targetCtx.moveTo(525, 210); targetCtx.lineTo(520, 360); // SVC
      targetCtx.moveTo(520, 430); targetCtx.lineTo(520, 780); // IVC
      targetCtx.lineTo(480, 870);
      targetCtx.moveTo(520, 780); targetCtx.lineTo(560, 870);
      targetCtx.stroke();
      targetCtx.restore();
    }

    // 6. NERVOUS SYSTEM LAYER
    if (layerOpacities.nervous > 0.02) {
      targetCtx.save();
      targetCtx.globalAlpha = layerOpacities.nervous;
      targetCtx.fillStyle = "#38bdf8";
      targetCtx.strokeStyle = "#0284c7";
      targetCtx.lineWidth = 2;

      // Brain
      targetCtx.beginPath();
      targetCtx.ellipse(500, 125, 48, 55, 0, 0, Math.PI * 2);
      targetCtx.fill(); targetCtx.stroke();

      // Spinal Cord & Sciatic Nerves
      targetCtx.strokeStyle = "#38bdf8";
      targetCtx.lineWidth = 4;
      targetCtx.beginPath();
      targetCtx.moveTo(500, 180);
      targetCtx.lineTo(500, 740);
      // Sciatic nerves branching to legs
      targetCtx.moveTo(500, 740); targetCtx.lineTo(450, 1380);
      targetCtx.moveTo(500, 740); targetCtx.lineTo(550, 1380);
      targetCtx.stroke();
      targetCtx.restore();
    }

    targetCtx.restore();
  }

  // Draw Interactive Pins
  function drawAnatomicalPins(targetCtx, renderScale = 1.0, view = "anterior", interactive = true) {
    targetCtx.save();
    targetCtx.scale(renderScale, renderScale);

    const now = performance.now();
    const pulseScale = 1.0 + 0.18 * Math.sin(now * 0.005);

    ANATOMICAL_STRUCTURES.forEach(s => {
      if (s.view !== view) return;
      const isSelected = selectedStructure && selectedStructure.id === s.id;
      const isHovered = hoveredStructure && hoveredStructure.id === s.id;
      const sys = ANATOMICAL_SYSTEMS[s.system] || { color: "#38bdf8" };

      const px = s.coords.x;
      const py = s.coords.y;

      // Pulsing outer beacon ring
      targetCtx.beginPath();
      targetCtx.arc(px, py, (isSelected ? 16 : (isHovered ? 12 : 8)) * pulseScale, 0, Math.PI * 2);
      targetCtx.fillStyle = isSelected ? "rgba(56, 189, 248, 0.4)" : (isHovered ? "rgba(16, 185, 129, 0.4)" : sys.color + "33");
      targetCtx.fill();

      // Solid pin center
      targetCtx.beginPath();
      targetCtx.arc(px, py, isSelected ? 8 : (isHovered ? 6 : 4.5), 0, Math.PI * 2);
      targetCtx.fillStyle = isSelected ? "#38bdf8" : (isHovered ? "#10b981" : sys.color);
      targetCtx.strokeStyle = "#ffffff";
      targetCtx.lineWidth = 1.5;
      targetCtx.fill();
      targetCtx.stroke();

      // Label when hovered or selected or at high zoom
      if (isSelected || isHovered || zoom >= 2.8) {
        targetCtx.font = "bold 13px -apple-system, sans-serif";
        const label = s.name;
        const textWidth = targetCtx.measureText(label).width;

        targetCtx.fillStyle = "rgba(15, 23, 42, 0.9)";
        targetCtx.strokeStyle = isSelected ? "#38bdf8" : "rgba(255,255,255,0.2)";
        targetCtx.lineWidth = 1;
        targetCtx.roundRect(px + 12, py - 14, textWidth + 16, 26, 6);
        targetCtx.fill();
        targetCtx.stroke();

        targetCtx.fillStyle = isSelected ? "#38bdf8" : "#ffffff";
        targetCtx.fillText(label, px + 20, py + 4);
      }
    });

    targetCtx.restore();
  }

  // ----------------------------------------------------
  // HISTOLOGY SIMULATOR RENDERERS (6 Models)
  // ----------------------------------------------------
  function renderHistologyCanvas(targetCtx, width, height, dt) {
    targetCtx.save();
    targetCtx.clearRect(0, 0, width, height);

    // Dark sleek stage background
    targetCtx.fillStyle = "#090d16";
    targetCtx.fillRect(0, 0, width, height);

    if (activeHistologyModel === "cardiac_cycle") {
      renderCardiacCycleSimulation(targetCtx, width, height, dt);
    } else if (activeHistologyModel === "nephron_countercurrent") {
      renderNephronSimulation(targetCtx, width, height, dt);
    } else if (activeHistologyModel === "neuron_synapse") {
      renderNeuronSynapseSimulation(targetCtx, width, height, dt);
    } else if (activeHistologyModel === "alveolar_gas_exchange") {
      renderAlveolarGasSimulation(targetCtx, width, height, dt);
    } else if (activeHistologyModel === "sarcomere_sliding") {
      renderSarcomereSimulation(targetCtx, width, height, dt);
    } else if (activeHistologyModel === "osteon_haversian") {
      renderOsteonSimulation(targetCtx, width, height, dt);
    }

    targetCtx.restore();
  }

  // 1. CARDIAC CYCLE & ECG CONDUCTION RENDERER
  function renderCardiacCycleSimulation(targetCtx, width, height, dt) {
    const cycleDuration = 60 / histoState.heartRate; // seconds per cardiac beat
    simTime += dt;
    const beatPhase = (simTime % cycleDuration) / cycleDuration; // 0.0 to 1.0

    // Trigger acoustic heart sounds (S1 lub around 0.15, S2 dub around 0.55)
    if (simTime - histoState.lastBeatTime >= cycleDuration) {
      histoState.lastBeatTime = simTime;
      playHeartSound(true); // S1
      setTimeout(() => playHeartSound(false), cycleDuration * 350); // S2
    }

    // Split view: Left 4-Chamber Beating Heart; Right Live ECG Trace
    const heartCenterX = width * 0.32;
    const heartCenterY = height * 0.48;

    // Heart beating pulsation scale (systole contraction)
    const isSystole = beatPhase >= 0.15 && beatPhase <= 0.45;
    const heartScale = isSystole ? 0.92 : 1.02 + 0.05 * Math.sin(beatPhase * Math.PI * 2);

    targetCtx.save();
    targetCtx.translate(heartCenterX, heartCenterY);
    targetCtx.scale(heartScale, heartScale);

    // Heart outer muscular myocardium
    targetCtx.fillStyle = "#ef4444";
    targetCtx.strokeStyle = "#991b1b";
    targetCtx.lineWidth = 6;
    targetCtx.beginPath();
    targetCtx.moveTo(0, 80);
    targetCtx.bezierCurveTo(-140, 20, -150, -110, -50, -130);
    targetCtx.bezierCurveTo(0, -120, 0, -80, 0, -80);
    targetCtx.bezierCurveTo(0, -80, 0, -120, 50, -130);
    targetCtx.bezierCurveTo(150, -110, 140, 20, 0, 80);
    targetCtx.fill(); targetCtx.stroke();

    // 4 Chambers Dividers & Interventricular Septum
    targetCtx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    targetCtx.lineWidth = 4;
    targetCtx.beginPath();
    targetCtx.moveTo(0, -90); targetCtx.lineTo(0, 75); // Septum
    targetCtx.moveTo(-110, -30); targetCtx.lineTo(110, -30); // Atrioventricular plane
    targetCtx.stroke();

    // Chambers text labels
    targetCtx.fillStyle = "#ffffff";
    targetCtx.font = "bold 13px 'JetBrains Mono', monospace";
    targetCtx.fillText("RA", -65, -55);
    targetCtx.fillText("LA", 45, -55);
    targetCtx.fillText("RV", -65, 25);
    targetCtx.fillText("LV", 45, 25);

    // Conduction pathway glowing lines (SA node -> AV node -> Bundle of His -> Purkinje)
    targetCtx.strokeStyle = "#fef08a";
    targetCtx.lineWidth = 3;
    targetCtx.beginPath();
    targetCtx.arc(-70, -75, 7, 0, Math.PI * 2); // SA Node
    targetCtx.fillStyle = beatPhase < 0.15 ? "#ffffff" : "#eab308";
    targetCtx.fill();

    targetCtx.moveTo(-70, -75);
    targetCtx.lineTo(-10, -30); // AV Node
    targetCtx.arc(-10, -30, 6, 0, Math.PI * 2);

    targetCtx.lineTo(0, -10); // Bundle of His
    targetCtx.lineTo(0, 40);
    targetCtx.lineTo(-45, 60); // Left Purkinje
    targetCtx.moveTo(0, 40); targetCtx.lineTo(45, 60); // Right Purkinje
    targetCtx.stroke();
    targetCtx.restore();

    // Right Side: Live Continuous ECG Monitor Strip
    const ecgLeft = width * 0.58;
    const ecgTop = 40;
    const ecgWidth = width * 0.38;
    const ecgHeight = height - 80;

    targetCtx.fillStyle = "rgba(15, 23, 42, 0.85)";
    targetCtx.strokeStyle = "rgba(56, 189, 248, 0.3)";
    targetCtx.lineWidth = 1.5;
    targetCtx.roundRect(ecgLeft, ecgTop, ecgWidth, ecgHeight, 12);
    targetCtx.fill(); targetCtx.stroke();

    // ECG grid paper
    targetCtx.strokeStyle = "rgba(56, 189, 248, 0.08)";
    targetCtx.lineWidth = 1;
    for (let x = ecgLeft; x < ecgLeft + ecgWidth; x += 20) {
      targetCtx.beginPath(); targetCtx.moveTo(x, ecgTop); targetCtx.lineTo(x, ecgTop + ecgHeight); targetCtx.stroke();
    }
    for (let y = ecgTop; y < ecgTop + ecgHeight; y += 20) {
      targetCtx.beginPath(); targetCtx.moveTo(ecgLeft, y); targetCtx.lineTo(ecgLeft + ecgWidth, y); targetCtx.stroke();
    }

    // Header on ECG
    targetCtx.fillStyle = "#38bdf8";
    targetCtx.font = "bold 13px 'JetBrains Mono', monospace";
    targetCtx.fillText("LEAD II TELEMETRY • 25 mm/s • 10 mm/mV", ecgLeft + 16, ecgTop + 24);

    // Compute live ECG waveform point
    const ecgMidY = ecgTop + ecgHeight / 2;
    let waveY = ecgMidY;

    if (beatPhase >= 0.05 && beatPhase < 0.14) {
      // P wave (Atrial depolarization)
      waveY -= Math.sin(((beatPhase - 0.05) / 0.09) * Math.PI) * 22;
    } else if (beatPhase >= 0.18 && beatPhase < 0.20) {
      // Q wave (Septal depolarization)
      waveY += 12;
    } else if (beatPhase >= 0.20 && beatPhase < 0.24) {
      // R wave (Ventricular peak)
      waveY -= 88;
    } else if (beatPhase >= 0.24 && beatPhase < 0.27) {
      // S wave
      waveY += 28;
    } else if (beatPhase >= 0.36 && beatPhase < 0.54) {
      // T wave (Ventricular repolarization)
      waveY -= Math.sin(((beatPhase - 0.36) / 0.18) * Math.PI) * 32;
    }

    histoState.ecgData.push(waveY);
    if (histoState.ecgData.length > 240) {
      histoState.ecgData.shift();
    }

    // Draw ECG Green Phosphor Line
    targetCtx.strokeStyle = "#10b981";
    targetCtx.lineWidth = 2.5;
    targetCtx.shadowColor = "#10b981";
    targetCtx.shadowBlur = 8;
    targetCtx.beginPath();
    const dx = ecgWidth / 240;
    histoState.ecgData.forEach((val, idx) => {
      const px = ecgLeft + idx * dx;
      if (idx === 0) targetCtx.moveTo(px, val);
      else targetCtx.lineTo(px, val);
    });
    targetCtx.stroke();
    targetCtx.shadowBlur = 0; // reset
  }

  // 2. NEPHRON COUNTERCURRENT MULTIPLIER RENDERER
  function renderNephronSimulation(targetCtx, width, height, dt) {
    simTime += dt;
    const nephronX = width * 0.18;
    const nephronY = height * 0.12;

    targetCtx.fillStyle = "#ffffff";
    targetCtx.font = "bold 15px 'JetBrains Mono', monospace";
    targetCtx.fillText("RENAL CORTICOMEDULLARY OSMOLARITY GRADIENT (300 -> 1200 mOsm/L)", nephronX, nephronY);

    // Draw Corticomedullary Gradient Background
    const grad = targetCtx.createLinearGradient(0, nephronY + 30, 0, height - 60);
    grad.addColorStop(0, "rgba(56, 189, 248, 0.1)");
    grad.addColorStop(0.3, "rgba(168, 85, 247, 0.2)");
    grad.addColorStop(1, "rgba(239, 68, 68, 0.35)");
    targetCtx.fillStyle = grad;
    targetCtx.roundRect(nephronX, nephronY + 25, width * 0.65, height - 120, 12);
    targetCtx.fill();

    // Osmolarity labels on left
    targetCtx.fillStyle = "#38bdf8";
    targetCtx.font = "12px 'JetBrains Mono', monospace";
    targetCtx.fillText("Cortex: 300 mOsm/L", nephronX + 16, nephronY + 60);
    targetCtx.fillStyle = "#c084fc";
    targetCtx.fillText("Outer Medulla: 600 mOsm/L", nephronX + 16, nephronY + 200);
    targetCtx.fillStyle = "#f87171";
    targetCtx.fillText("Inner Medullary Tip: 1200 mOsm/L", nephronX + 16, nephronY + 340);

    // Bowman's Capsule & Hairpin Loop of Henle
    targetCtx.strokeStyle = "#fef08a";
    targetCtx.lineWidth = 12;
    targetCtx.lineCap = "round";
    targetCtx.lineJoin = "round";
    targetCtx.beginPath();
    // Bowman capsule
    targetCtx.arc(nephronX + 220, nephronY + 80, 24, 0, Math.PI * 2);
    // PCT
    targetCtx.moveTo(nephronX + 244, nephronY + 80);
    targetCtx.lineTo(nephronX + 300, nephronY + 110);
    // Descending limb (Thin)
    targetCtx.lineTo(nephronX + 300, nephronY + 360);
    // Hairpin bend
    targetCtx.arc(nephronX + 330, nephronY + 360, 30, Math.PI, 0, true);
    // Ascending limb (Thick)
    targetCtx.lineTo(nephronX + 360, nephronY + 110);
    // DCT
    targetCtx.lineTo(nephronX + 420, nephronY + 80);
    // Collecting duct
    targetCtx.lineTo(nephronX + 420, nephronY + 380);
    targetCtx.stroke();

    // Water reabsorption arrows (H2O escaping descending limb & collecting duct)
    const arrowOffset = (simTime * 40) % 20;
    targetCtx.fillStyle = "#38bdf8";
    targetCtx.font = "bold 13px sans-serif";
    for (let y = nephronY + 140; y < nephronY + 340; y += 45) {
      targetCtx.fillText("💧 H₂O →", nephronX + 225, y + arrowOffset);
    }

    // Active solute transport out of ascending limb (NaCl via NKCC2)
    targetCtx.fillStyle = "#fbbf24";
    for (let y = nephronY + 160; y < nephronY + 340; y += 45) {
      targetCtx.fillText("← Na⁺/K⁺/2Cl⁻", nephronX + 375, y - arrowOffset);
    }
  }

  // 3. NEURON SYNAPSE & ACTION POTENTIAL RENDERER
  function renderNeuronSynapseSimulation(targetCtx, width, height, dt) {
    simTime += dt;
    const synX = width * 0.5;
    const synY = height * 0.45;

    // Presynaptic Axon Terminal Button
    targetCtx.fillStyle = "rgba(56, 189, 248, 0.25)";
    targetCtx.strokeStyle = "#38bdf8";
    targetCtx.lineWidth = 4;
    targetCtx.beginPath();
    targetCtx.arc(synX, synY - 120, 110, 0, Math.PI);
    targetCtx.fill(); targetCtx.stroke();

    // Postsynaptic Dendritic Spine
    targetCtx.fillStyle = "rgba(168, 85, 247, 0.25)";
    targetCtx.strokeStyle = "#a855f7";
    targetCtx.beginPath();
    targetCtx.arc(synX, synY + 130, 110, Math.PI, 0);
    targetCtx.fill(); targetCtx.stroke();

    // Synaptic Cleft Label
    targetCtx.fillStyle = "#e2e8f0";
    targetCtx.font = "bold 13px 'JetBrains Mono', monospace";
    targetCtx.fillText("SYNAPTIC CLEFT (20 nm)", synX - 90, synY);

    // Neurotransmitter Vesicles
    const vesicleCount = 14;
    for (let i = 0; i < vesicleCount; i++) {
      const angle = (i / vesicleCount) * Math.PI;
      const r = 60 + 20 * Math.sin(simTime * 2 + i);
      const vx = synX + r * Math.cos(angle);
      const vy = synY - 120 + r * Math.sin(angle) * 0.5;

      targetCtx.beginPath();
      targetCtx.arc(vx, vy, 7, 0, Math.PI * 2);
      targetCtx.fillStyle = "#fef08a";
      targetCtx.fill();
    }

    // Exocytosis into cleft if stimulated
    if (histoState.actionPotentialStim) {
      histoState.apPhaseProgress += dt * 1.5;
      if (histoState.apPhaseProgress > 1.0) {
        histoState.actionPotentialStim = false;
      }
      targetCtx.fillStyle = "#ef4444";
      targetCtx.font = "bold 16px sans-serif";
      targetCtx.fillText("⚡ +30 mV Action Potential Influx → Ca²⁺ Triggers SNARE Vesicle Fusion!", synX - 250, 40);
    }
  }

  // 4. ALVEOLAR-CAPILLARY GAS EXCHANGE RENDERER
  function renderAlveolarGasSimulation(targetCtx, width, height, dt) {
    simTime += dt;
    const ax = width * 0.35;
    const ay = height * 0.5;

    // Alveolar Air Space
    targetCtx.fillStyle = "rgba(52, 211, 153, 0.18)";
    targetCtx.strokeStyle = "#10b981";
    targetCtx.lineWidth = 5;
    targetCtx.beginPath();
    targetCtx.arc(ax, ay, 140, 0, Math.PI * 2);
    targetCtx.fill(); targetCtx.stroke();

    targetCtx.fillStyle = "#ffffff";
    targetCtx.font = "bold 16px sans-serif";
    targetCtx.fillText("ALVEOLUS AIR SPACE", ax - 80, ay - 20);
    targetCtx.fillStyle = "#34d399";
    targetCtx.font = "bold 14px 'JetBrains Mono', monospace";
    const pao2 = Math.round(histoState.fio2 * 4.8);
    targetCtx.fillText(`PAO₂ = ${pao2} mmHg • PACO₂ = 40 mmHg`, ax - 110, ay + 15);

    // Surfactant sheen
    targetCtx.strokeStyle = "rgba(254, 240, 138, 0.7)";
    targetCtx.lineWidth = 3;
    targetCtx.stroke();

    // Pulmonary Capillary Arch
    const capX = width * 0.72;
    targetCtx.strokeStyle = "rgba(239, 68, 68, 0.5)";
    targetCtx.lineWidth = 70;
    targetCtx.beginPath();
    targetCtx.arc(capX, ay, 120, 0, Math.PI * 2);
    targetCtx.stroke();

    // Erythrocytes (RBCs) circulating in capillary
    for (let r = 0; r < 8; r++) {
      const angle = (simTime * 0.8 + (r / 8) * Math.PI * 2) % (Math.PI * 2);
      const rx = capX + 120 * Math.cos(angle);
      const ry = ay + 120 * Math.sin(angle);

      targetCtx.fillStyle = angle < Math.PI ? "#ef4444" : "#3b82f6"; // Red (oxygenated) vs Blue (deoxygenated)
      targetCtx.beginPath();
      targetCtx.ellipse(rx, ry, 14, 9, angle, 0, Math.PI * 2);
      targetCtx.fill();
    }

    // Diffusion arrows
    targetCtx.fillStyle = "#34d399";
    targetCtx.font = "bold 16px sans-serif";
    targetCtx.fillText("O₂ Diffusion (64 mmHg Gradient) ➔", ax + 90, ay - 30);
    targetCtx.fillStyle = "#38bdf8";
    targetCtx.fillText("⬅ CO₂ Diffusion (6 mmHg Gradient)", ax + 90, ay + 30);
  }

  // 5. SARCOMERE SLIDING FILAMENT RENDERER
  function renderSarcomereSimulation(targetCtx, width, height, dt) {
    const sarcWidth = (histoState.sarcomereLength / 2.2) * (width * 0.55);
    const midX = width * 0.5;
    const midY = height * 0.5;

    targetCtx.fillStyle = "#ffffff";
    targetCtx.font = "bold 16px 'JetBrains Mono', monospace";
    targetCtx.fillText(`SARCOMERE CONTRACTILE UNIT: Length = ${histoState.sarcomereLength.toFixed(2)} µm`, midX - 220, midY - 140);

    // Z-Discs (Left and Right borders)
    targetCtx.strokeStyle = "#38bdf8";
    targetCtx.lineWidth = 8;
    targetCtx.beginPath();
    // Left Z-Disc
    targetCtx.moveTo(midX - sarcWidth / 2, midY - 90);
    targetCtx.lineTo(midX - sarcWidth / 2, midY + 90);
    // Right Z-Disc
    targetCtx.moveTo(midX + sarcWidth / 2, midY - 90);
    targetCtx.lineTo(midX + sarcWidth / 2, midY + 90);
    targetCtx.stroke();

    // M-Line (Center)
    targetCtx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    targetCtx.lineWidth = 3;
    targetCtx.setLineDash([6, 6]);
    targetCtx.beginPath();
    targetCtx.moveTo(midX, midY - 90); targetCtx.lineTo(midX, midY + 90);
    targetCtx.stroke();
    targetCtx.setLineDash([]);

    // Thin Filaments (Actin) anchored to Z-discs
    targetCtx.strokeStyle = "#f87171";
    targetCtx.lineWidth = 5;
    const actinLength = width * 0.22;
    for (let y = midY - 60; y <= midY + 60; y += 40) {
      targetCtx.beginPath();
      // Left actin
      targetCtx.moveTo(midX - sarcWidth / 2, y);
      targetCtx.lineTo(midX - sarcWidth / 2 + actinLength, y);
      // Right actin
      targetCtx.moveTo(midX + sarcWidth / 2, y);
      targetCtx.lineTo(midX + sarcWidth / 2 - actinLength, y);
      targetCtx.stroke();
    }

    // Thick Filaments (Myosin with Cross-Bridge Heads) centered at M-line
    targetCtx.strokeStyle = "#a855f7";
    targetCtx.lineWidth = 9;
    const myosinLength = width * 0.28;
    for (let y = midY - 40; y <= midY + 40; y += 40) {
      targetCtx.beginPath();
      targetCtx.moveTo(midX - myosinLength / 2, y);
      targetCtx.lineTo(midX + myosinLength / 2, y);
      targetCtx.stroke();
    }
  }

  // 6. COMPACT BONE OSTEON RENDERER
  function renderOsteonSimulation(targetCtx, width, height, dt) {
    const ox = width * 0.5;
    const oy = height * 0.5;

    targetCtx.fillStyle = "#ffffff";
    targetCtx.font = "bold 15px 'JetBrains Mono', monospace";
    targetCtx.fillText("COMPACT BONE OSTEON (HAVERSIAN SYSTEM)", ox - 180, oy - 180);

    // Concentric Lamellae rings
    targetCtx.lineWidth = 3;
    for (let r = 50; r <= 160; r += 28) {
      targetCtx.strokeStyle = "rgba(226, 232, 240, 0.4)";
      targetCtx.beginPath();
      targetCtx.arc(ox, oy, r, 0, Math.PI * 2);
      targetCtx.stroke();

      // Osteocytes in Lacunae along rings
      const osteoCount = Math.floor(r / 10);
      for (let i = 0; i < osteoCount; i++) {
        const theta = (i / osteoCount) * Math.PI * 2;
        const lx = ox + r * Math.cos(theta);
        const ly = oy + r * Math.sin(theta);
        targetCtx.fillStyle = "#38bdf8";
        targetCtx.beginPath();
        targetCtx.ellipse(lx, ly, 5, 3, theta, 0, Math.PI * 2);
        targetCtx.fill();
      }
    }

    // Central Haversian Canal (Neurovascular bundle)
    targetCtx.fillStyle = "#0f172a";
    targetCtx.beginPath();
    targetCtx.arc(ox, oy, 26, 0, Math.PI * 2);
    targetCtx.fill();

    // Arteriole (Red) & Venule (Blue)
    targetCtx.fillStyle = "#ef4444";
    targetCtx.beginPath(); targetCtx.arc(ox - 8, oy - 4, 7, 0, Math.PI * 2); targetCtx.fill();
    targetCtx.fillStyle = "#38bdf8";
    targetCtx.beginPath(); targetCtx.arc(ox + 8, oy + 4, 7, 0, Math.PI * 2); targetCtx.fill();
  }

  // ----------------------------------------------------
  // ANIMATION LOOP (60 FPS Safe Disconnect Guarded)
  // ----------------------------------------------------
  function renderFrame(timestamp) {
    // Unmount Disconnect Guard
    if (!container || !container.isConnected) {
      if (animId) cancelAnimationFrame(animId);
      return;
    }

    const dt = Math.min(0.1, (timestamp - lastTimestamp) / 1000);
    lastTimestamp = timestamp;

    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();
    const displayWidth = Math.round(rect.width * dpr);
    const displayHeight = Math.round(rect.height * dpr);

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    if (activeTab === "histology") {
      renderHistologyCanvas(ctx, rect.width, rect.height, dt);
    } else {
      // Macro or Quiz Mode: Render Full-Body 4K Vector Anatomy
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Deep space grid background
      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, rect.width, rect.height);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      for (let x = 0; x < rect.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, rect.height); ctx.stroke();
      }
      for (let y = 0; y < rect.height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(rect.width, y); ctx.stroke();
      }

      // Apply Pan & Zoom Transform
      ctx.save();
      ctx.translate(panX, panY);

      // Default scaling maps the 1000x1800 coordinate space to fit canvas height
      const baseScale = (rect.height / 1800) * zoom;
      drawHumanBodyVector(ctx, baseScale, activeView);
      drawAnatomicalPins(ctx, baseScale, activeView, true);
      ctx.restore();
    }

    ctx.restore();
    animId = requestAnimationFrame(renderFrame);
  }

  // Kickoff 60 FPS loop
  animId = requestAnimationFrame(renderFrame);

  // Return unmount cleanup hook
  _currentAtlasCleanup = function cleanup() {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  };

  return _currentAtlasCleanup;
}
