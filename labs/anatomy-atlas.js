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
  ANATOMICAL_PLATES,
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
  let activePlate = "full_anterior"; // 11 High-Res Plates: 'full_anterior' | 'full_posterior' | 'skeletal' | 'muscular' | 'heart' | 'brain' | 'lungs' | 'digestive' | 'urinary' | 'cranial' | 'histology_slide'
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

  // Helper to determine active opacity of any anatomical structure based on its layer & system
  function getStructureOpacity(s) {
    if (!s) return 1.0;
    if (s.layer === 1) return layerOpacities.skin;
    if (s.layer === 2) return layerOpacities.muscular;
    if (s.layer === 3) return layerOpacities.skeletal;
    if (s.layer === 4) return layerOpacities.visceral;
    if (s.layer === 5) return layerOpacities.circulatory;
    if (s.layer === 6) return layerOpacities.nervous;

    if (s.system === "integumentary") return layerOpacities.skin;
    if (s.system === "muscular") return layerOpacities.muscular;
    if (s.system === "skeletal") return layerOpacities.skeletal;
    if (s.system === "circulatory") return layerOpacities.circulatory;
    if (s.system === "nervous") return layerOpacities.nervous;
    if (s.system === "digestive" || s.system === "respiratory" || s.system === "urinary" || s.system === "endocrine" || s.system === "lymphatic") {
      return layerOpacities.visceral;
    }
    return 1.0;
  }

  // 4K Pan & Zoom viewport transform
  let zoom = 1.0;
  let panX = 0;
  let panY = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let hoveredStructure = null;

  // 8K Imaging Modes ('photo' | 'xray' | 'angiogram')
  let imagingMode = "photo";

  // Preload Museum-Grade 8K Anatomical Dissection & Microscopic Plates
  const plateImages = {};
  if (ANATOMICAL_PLATES) {
    Object.keys(ANATOMICAL_PLATES).forEach(key => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = ANATOMICAL_PLATES[key].src;
      plateImages[key] = img;
    });
  }

  const imgAnterior = plateImages.full_anterior || new Image();
  const imgPosterior = plateImages.full_posterior || new Image();
  if (!imgAnterior.src) imgAnterior.src = "./assets/labs/human_anatomy_anterior_8k.jpg";
  if (!imgPosterior.src) imgPosterior.src = "./assets/labs/human_anatomy_posterior_8k.jpg";

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

  // Synthesized Vesicular Pulmonary Breath Sounds Generator
  function playBreathSound() {
    try {
      const audioCtx = SoundFX.getAudioContext?.() || (window.AudioContext ? new window.AudioContext() : null);
      if (!audioCtx || audioCtx.state === "suspended") return;
      const bufferSize = Math.floor(audioCtx.sampleRate * 1.6);
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.12;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 260;
      filter.Q.value = 1.6;
      const gain = audioCtx.createGain();
      const now = audioCtx.currentTime;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.7); // Inspiration
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5); // Expiration
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start(now);
    } catch (e) {}
  }

  // Visible structures helper for active plate & view
  function getVisibleStructures(plateId, view) {
    return ANATOMICAL_STRUCTURES.filter(s => {
      if (s.plate) {
        return s.plate === plateId;
      }
      if (plateId === "full_anterior") {
        return s.view === "anterior";
      }
      if (plateId === "full_posterior") {
        return s.view === "posterior";
      }
      const plateConf = ANATOMICAL_PLATES ? ANATOMICAL_PLATES[plateId] : null;
      if (plateConf && plateConf.system !== "all") {
        return s.system === plateConf.system;
      }
      return s.view === view;
    });
  }

  // Pick new quiz target
  function selectNewQuizTarget() {
    const visible = getVisibleStructures(activePlate, activeView).filter(s => getStructureOpacity(s) >= 0.15);
    const candidates = visible.length > 0 ? visible : ANATOMICAL_STRUCTURES;
    quizState.targetStructure = candidates[Math.floor(Math.random() * candidates.length)];
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

      <!-- Interactive 11-Plate Anatomical & Histological System Selector -->
      <div class="atlas-plate-strip-wrapper" style="background: var(--surface-bg); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 12px 16px; display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 0.8rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em;">
              🏛️ High-Resolution Scientific Anatomical Plates (8K UHD)
            </span>
            <span style="font-size: 0.72rem; padding: 2px 8px; border-radius: 9999px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-weight: 700; border: 1px solid rgba(56, 189, 248, 0.3);">
              11 Dedicated Medical Systems
            </span>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-dim);">
            Tap any organ plate for instant high-definition cross-sections, pinpoint coordinates, &amp; telemetry
          </div>
        </div>
        <div id="plate-selector-strip" style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: thin;">
          ${Object.keys(ANATOMICAL_PLATES || {}).map(key => {
            const p = ANATOMICAL_PLATES[key];
            const isAct = activePlate === key;
            return `
              <button class="btn btn-sm btn-plate-select ${isAct ? 'btn-primary' : 'btn-secondary'}" data-plate="${key}" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; font-weight: 700; white-space: nowrap; border-radius: 8px; font-size: 0.78rem;">
                <span>${p.icon}</span>
                <span>${p.shortName || p.name}</span>
              </button>
            `;
          }).join("")}
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

            <!-- 8K Contrast & Imaging Shaders -->
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-dim); text-transform: uppercase;">Plate:</span>
              <button id="btn-imaging-photo" class="btn btn-sm ${imagingMode === 'photo' ? 'btn-primary' : 'btn-secondary'}" style="padding: 4px 10px; font-size: 0.78rem;" title="Photorealistic 8K TrueColor Dissection">
                📸 8K TrueColor
              </button>
              <button id="btn-imaging-xray" class="btn btn-sm ${imagingMode === 'xray' ? 'btn-primary' : 'btn-secondary'}" style="padding: 4px 10px; font-size: 0.78rem;" title="Radiographic X-Ray Contrast">
                ☢️ Radiographic
              </button>
              <button id="btn-imaging-angio" class="btn btn-sm ${imagingMode === 'angiogram' ? 'btn-primary' : 'btn-secondary'}" style="padding: 4px 10px; font-size: 0.78rem;" title="Fluorescent Angiogram Contrast">
                ⚡ Angiogram
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
          <div id="atlas-canvas-container" data-no-touch-zoom="true" style="position: relative; width: 100%; height: 640px; background: radial-gradient(circle at center, #0f172a 0%, #020617 100%); border-radius: 12px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.08); touch-action: none; cursor: grab;">
            <canvas id="atlas-canvas" style="display: block; width: 100%; height: 100%; touch-action: none; -webkit-user-select: none; user-select: none;"></canvas>

            <!-- Floating Overlay Badge for Active Mode -->
            <div id="canvas-overlay-banner" style="position: absolute; top: 14px; left: 14px; pointer-events: none; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 8px; padding: 6px 14px; display: flex; align-items: center; gap: 8px; font-size: 0.82rem; font-weight: 700; color: #38bdf8; box-shadow: 0 4px 12px rgba(0,0,0,0.4);">
              <span>🔍</span>
              <span id="canvas-mode-text">4K UHD Anatomical Matrix • Drag to Pan • Wheel/Pinch to Zoom • Double-Tap to Reset</span>
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
          <div id="dissection-control-panel" style="display: flex; flex-direction: column; gap: 10px; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(12px); padding: 14px 18px; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 0.8rem; font-weight: 800; color: #f1f5f9; text-transform: uppercase; letter-spacing: 0.05em;">
                  🔬 Layer Dissection &amp; Opacity Blending
                </span>
                <span style="font-size: 0.72rem; color: #64748b; font-style: italic;">(Drag sliders to peel anatomical strata)</span>
              </div>
              <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                <button id="btn-isolate-skeletal" class="btn btn-outline btn-sm" style="font-size: 0.72rem; padding: 4px 10px; font-weight: 700;" title="Isolate 206-Bone Skeleton">
                  💀 Isolate Skeleton
                </button>
                <button id="btn-isolate-muscular" class="btn btn-outline btn-sm" style="font-size: 0.72rem; padding: 4px 10px; font-weight: 700;" title="Isolate Muscular System">
                  💪 Isolate Muscular
                </button>
                <button id="btn-isolate-viscera" class="btn btn-outline btn-sm" style="font-size: 0.72rem; padding: 4px 10px; font-weight: 700;" title="Isolate Splanchnic Viscera">
                  🍽️ Isolate Viscera
                </button>
                <button id="btn-isolate-neuro" class="btn btn-outline btn-sm" style="font-size: 0.72rem; padding: 4px 10px; font-weight: 700;" title="Isolate Neurovascular Tree">
                  ⚡ Isolate Neuro
                </button>
                <button id="btn-reset-layers" class="btn btn-secondary btn-sm" style="font-size: 0.72rem; padding: 4px 10px; font-weight: 700;" title="Reset All Layer Strata">
                  🔄 Reset All Layers
                </button>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; font-size: 0.78rem;">
              <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 8px; padding: 8px 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; color: #94a3b8; margin-bottom: 4px; font-weight: 600;">
                  <span style="white-space: nowrap;">✨ Integument</span>
                  <span id="val-skin" style="font-family: var(--font-mono); font-size: 0.75rem; color: #cbd5e1;">25%</span>
                </div>
                <input id="rng-skin" type="range" min="0" max="100" value="25" class="range-slider" style="width: 100%; cursor: pointer; accent-color: #fb923c;">
              </div>
              <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 8px; padding: 8px 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; color: #f87171; margin-bottom: 4px; font-weight: 600;">
                  <span style="white-space: nowrap;">💪 Muscular</span>
                  <span id="val-muscular" style="font-family: var(--font-mono); font-size: 0.75rem; color: #f87171;">85%</span>
                </div>
                <input id="rng-muscular" type="range" min="0" max="100" value="85" class="range-slider" style="width: 100%; cursor: pointer; accent-color: #f87171;">
              </div>
              <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 8px; padding: 8px 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; color: #e2e8f0; margin-bottom: 4px; font-weight: 600;">
                  <span style="white-space: nowrap;">💀 Skeletal</span>
                  <span id="val-skeletal" style="font-family: var(--font-mono); font-size: 0.75rem; color: #e2e8f0;">95%</span>
                </div>
                <input id="rng-skeletal" type="range" min="0" max="100" value="95" class="range-slider" style="width: 100%; cursor: pointer; accent-color: #e2e8f0;">
              </div>
              <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 8px; padding: 8px 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; color: #fbbf24; margin-bottom: 4px; font-weight: 600;">
                  <span style="white-space: nowrap;" title="Splanchnic Internal Viscera">🍽️ Splanchnic/Viscera</span>
                  <span id="val-visceral" style="font-family: var(--font-mono); font-size: 0.75rem; color: #fbbf24;">100%</span>
                </div>
                <input id="rng-visceral" type="range" min="0" max="100" value="100" class="range-slider" style="width: 100%; cursor: pointer; accent-color: #fbbf24;">
              </div>
              <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 8px; padding: 8px 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; color: #ef4444; margin-bottom: 4px; font-weight: 600;">
                  <span style="white-space: nowrap;">🫀 Vasculature</span>
                  <span id="val-circulatory" style="font-family: var(--font-mono); font-size: 0.75rem; color: #ef4444;">100%</span>
                </div>
                <input id="rng-circulatory" type="range" min="0" max="100" value="100" class="range-slider" style="width: 100%; cursor: pointer; accent-color: #ef4444;">
              </div>
              <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 8px; padding: 8px 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; color: #38bdf8; margin-bottom: 4px; font-weight: 600;">
                  <span style="white-space: nowrap;">🧠 Nervous</span>
                  <span id="val-nervous" style="font-family: var(--font-mono); font-size: 0.75rem; color: #38bdf8;">90%</span>
                </div>
                <input id="rng-nervous" type="range" min="0" max="100" value="90" class="range-slider" style="width: 100%; cursor: pointer; accent-color: #38bdf8;">
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

            <!-- Interactive Stethoscope & Acoustic Bio-Telemetry Auscultator -->
            <div id="inspect-interactive-actions" style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button id="btn-inspect-auscultate" class="btn btn-outline btn-sm" style="flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-weight: 700; font-size: 0.78rem; padding: 8px 12px;">
                <span id="btn-inspect-auscultate-icon">🫀</span>
                <span id="btn-inspect-auscultate-label">Auscultate Cardiac Sounds (S1/S2)</span>
              </button>
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
  const btnImagingPhoto = document.getElementById("btn-imaging-photo");
  const btnImagingXray = document.getElementById("btn-imaging-xray");
  const btnImagingAngio = document.getElementById("btn-imaging-angio");
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
  const ensureFullBodyMacro = () => {
    if (activePlate !== "full_anterior" && activePlate !== "full_posterior") {
      switchAnatomicalPlate(activeView === "posterior" ? "full_posterior" : "full_anterior");
    }
  };

  document.getElementById("btn-isolate-skeletal")?.addEventListener("click", () => {
    SoundFX.playPop();
    ensureFullBodyMacro();
    layerOpacities.skin = 0.0;
    layerOpacities.muscular = 0.0;
    layerOpacities.skeletal = 1.0;
    layerOpacities.visceral = 0.0;
    layerOpacities.circulatory = 0.0;
    layerOpacities.nervous = 0.0;
    syncSliders();
    if (canvasModeText) {
      canvasModeText.innerText = "💀 Skeletal System Isolated • Pure 206-Bone Osteology Dissection";
    }
  });

  document.getElementById("btn-isolate-muscular")?.addEventListener("click", () => {
    SoundFX.playPop();
    ensureFullBodyMacro();
    layerOpacities.skin = 0.0;
    layerOpacities.muscular = 1.0;
    layerOpacities.skeletal = 0.25;
    layerOpacities.visceral = 0.0;
    layerOpacities.circulatory = 0.0;
    layerOpacities.nervous = 0.0;
    syncSliders();
    if (canvasModeText) {
      canvasModeText.innerText = "💪 Muscular System Isolated • Superficial & Deep Skeletal Myology";
    }
  });

  document.getElementById("btn-isolate-viscera")?.addEventListener("click", () => {
    SoundFX.playPop();
    ensureFullBodyMacro();
    layerOpacities.skin = 0.0;
    layerOpacities.muscular = 0.0;
    layerOpacities.skeletal = 0.15;
    layerOpacities.visceral = 1.0;
    layerOpacities.circulatory = 0.25;
    layerOpacities.nervous = 0.0;
    syncSliders();
    if (canvasModeText) {
      canvasModeText.innerText = "🍽️ Splanchnic Viscera Isolated • Thoracic & Abdominal Internal Organs";
    }
  });

  document.getElementById("btn-isolate-neuro")?.addEventListener("click", () => {
    SoundFX.playPop();
    ensureFullBodyMacro();
    layerOpacities.skin = 0.0;
    layerOpacities.muscular = 0.0;
    layerOpacities.skeletal = 0.2;
    layerOpacities.visceral = 0.0;
    layerOpacities.circulatory = 1.0;
    layerOpacities.nervous = 1.0;
    syncSliders();
    if (canvasModeText) {
      canvasModeText.innerText = "⚡ Neurovascular Matrix Isolated • Angiology & Neural Conduction Networks";
    }
  });

  document.getElementById("btn-reset-layers")?.addEventListener("click", () => {
    SoundFX.playPop();
    ensureFullBodyMacro();
    layerOpacities.skin = 0.25;
    layerOpacities.muscular = 0.85;
    layerOpacities.skeletal = 0.95;
    layerOpacities.visceral = 1.0;
    layerOpacities.circulatory = 1.0;
    layerOpacities.nervous = 0.90;
    syncSliders();
    if (canvasModeText) {
      canvasModeText.innerText = "All Anatomical Strata Balanced • 6-Layer Multi-System Composite";
    }
  });

  function syncSliders() {
    if (rngSkin) { rngSkin.value = Math.round(layerOpacities.skin * 100); document.getElementById("val-skin").innerText = `${Math.round(layerOpacities.skin * 100)}%`; }
    if (rngMuscular) { rngMuscular.value = Math.round(layerOpacities.muscular * 100); document.getElementById("val-muscular").innerText = `${Math.round(layerOpacities.muscular * 100)}%`; }
    if (rngSkeletal) { rngSkeletal.value = Math.round(layerOpacities.skeletal * 100); document.getElementById("val-skeletal").innerText = `${Math.round(layerOpacities.skeletal * 100)}%`; }
    if (rngVisceral) { rngVisceral.value = Math.round(layerOpacities.visceral * 100); document.getElementById("val-visceral").innerText = `${Math.round(layerOpacities.visceral * 100)}%`; }
    if (rngCirculatory) { rngCirculatory.value = Math.round(layerOpacities.circulatory * 100); document.getElementById("val-circulatory").innerText = `${Math.round(layerOpacities.circulatory * 100)}%`; }
    if (rngNervous) { rngNervous.value = Math.round(layerOpacities.nervous * 100); document.getElementById("val-nervous").innerText = `${Math.round(layerOpacities.nervous * 100)}%`; }
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

    const auscBtn = document.getElementById("btn-inspect-auscultate");
    const auscIcon = document.getElementById("btn-inspect-auscultate-icon");
    const auscLabel = document.getElementById("btn-inspect-auscultate-label");
    if (auscBtn && auscLabel) {
      if (structure.system === "circulatory") {
        if (auscIcon) auscIcon.innerText = "🫀";
        auscLabel.innerText = "Auscultate Cardiac Sounds (S1/S2)";
      } else if (structure.system === "respiratory") {
        if (auscIcon) auscIcon.innerText = "🫁";
        auscLabel.innerText = "Auscultate Vesicular Breath Sounds";
      } else if (structure.system === "nervous") {
        if (auscIcon) auscIcon.innerText = "⚡";
        auscLabel.innerText = "Stimulate Bioelectric Action Potential";
      } else {
        if (auscIcon) auscIcon.innerText = "🔬";
        auscLabel.innerText = "Inspect Microscopic Histology Model";
      }
    }
  }

  // Auscultate / Bio-telemetry action trigger
  document.getElementById("btn-inspect-auscultate")?.addEventListener("click", () => {
    if (!selectedStructure) return;
    if (selectedStructure.system === "circulatory") {
      playHeartSound(true);
      setTimeout(() => playHeartSound(false), 260);
    } else if (selectedStructure.system === "respiratory") {
      playBreathSound();
    } else if (selectedStructure.system === "nervous") {
      SoundFX.playPop();
    } else {
      switchTab("histology");
    }
  });

  // Dedicated 11-Plate Anatomical Switcher
  function switchAnatomicalPlate(plateKey) {
    if (!ANATOMICAL_PLATES || !ANATOMICAL_PLATES[plateKey]) return;
    activePlate = plateKey;
    const p = ANATOMICAL_PLATES[plateKey];
    if (p.view) {
      activeView = p.view;
      btnViewAnt?.classList.toggle("btn-primary", activeView === "anterior");
      btnViewAnt?.classList.toggle("btn-secondary", activeView !== "anterior");
      btnViewPost?.classList.toggle("btn-primary", activeView === "posterior");
      btnViewPost?.classList.toggle("btn-secondary", activeView !== "posterior");
    }
    SoundFX.playPop();

    // Reset viewport zoom/pan to centered view
    focusCameraOnCoords(500, 900, 1.0);
    if (zoomBadge) zoomBadge.innerText = "1.0×";

    // Intelligent layer opacity adaptation for dedicated plates
    if (plateKey === "skeletal") {
      layerOpacities.skeletal = 1.0;
      layerOpacities.skin = 0.0;
      layerOpacities.muscular = 0.05;
      layerOpacities.visceral = 0.0;
      syncSliders();
    } else if (plateKey === "muscular") {
      layerOpacities.muscular = 1.0;
      layerOpacities.skin = 0.0;
      layerOpacities.skeletal = 0.35;
      layerOpacities.visceral = 0.0;
      syncSliders();
    } else if (plateKey === "digestive") {
      layerOpacities.visceral = 1.0;
      layerOpacities.skeletal = 0.2;
      layerOpacities.skin = 0.0;
      layerOpacities.muscular = 0.0;
      syncSliders();
    } else if (plateKey === "heart") {
      layerOpacities.circulatory = 1.0;
      layerOpacities.visceral = 1.0;
      layerOpacities.skin = 0.0;
      syncSliders();
    } else if (plateKey === "brain") {
      layerOpacities.nervous = 1.0;
      layerOpacities.skin = 0.0;
      syncSliders();
    } else if (plateKey === "lungs") {
      layerOpacities.visceral = 1.0;
      layerOpacities.skin = 0.0;
      syncSliders();
    } else if (plateKey === "full_anterior" || plateKey === "full_posterior") {
      layerOpacities.skin = 0.25;
      layerOpacities.muscular = 0.85;
      layerOpacities.skeletal = 0.95;
      layerOpacities.visceral = 1.0;
      layerOpacities.circulatory = 1.0;
      layerOpacities.nervous = 0.90;
      syncSliders();
    }

    // Auto-select relevant structure
    const candidate = ANATOMICAL_STRUCTURES.find(s => s.plate === plateKey) ||
                      ANATOMICAL_STRUCTURES.find(s => p.system !== "all" && s.system === p.system) ||
                      ANATOMICAL_STRUCTURES.find(s => s.view === activeView);
    if (candidate) {
      updateInspectorCard(candidate);
    }

    // Update buttons in plate strip
    container.querySelectorAll(".btn-plate-select").forEach(b => {
      const match = b.dataset.plate === plateKey;
      b.classList.toggle("btn-primary", match);
      b.classList.toggle("btn-secondary", !match);
    });

    // Update banner text
    if (canvasModeText) {
      canvasModeText.innerText = `${p.name} • 8K UHD Medical Plate • Drag to Pan • Wheel/Pinch to Zoom`;
    }
  }

  container.querySelectorAll(".btn-plate-select").forEach(b => {
    b.addEventListener("click", () => {
      switchAnatomicalPlate(b.dataset.plate);
    });
  });

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
      if (match.plate && match.plate !== activePlate) {
        switchAnatomicalPlate(match.plate);
      } else if (activeView !== match.view) {
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
      const p = ANATOMICAL_PLATES ? ANATOMICAL_PLATES[activePlate] : null;
      canvasModeText.innerText = p ? `${p.name} • 8K UHD Medical Plate • Drag to Pan • Wheel/Pinch to Zoom` : "4K UHD Anatomical Matrix • Drag to Pan • Wheel/Pinch to Zoom";
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
    if (activePlate === "full_posterior") {
      switchAnatomicalPlate("full_anterior");
    }
    SoundFX.playClick();
  });
  btnViewPost?.addEventListener("click", () => {
    activeView = "posterior";
    btnViewPost.classList.add("btn-primary");
    btnViewPost.classList.remove("btn-secondary");
    btnViewAnt.classList.remove("btn-primary");
    btnViewAnt.classList.add("btn-secondary");
    switchAnatomicalPlate("full_posterior");
    SoundFX.playClick();
  });

  // Imaging Mode Switcher
  function updateImagingButtons() {
    btnImagingPhoto?.classList.toggle("btn-primary", imagingMode === "photo");
    btnImagingPhoto?.classList.toggle("btn-secondary", imagingMode !== "photo");
    btnImagingXray?.classList.toggle("btn-primary", imagingMode === "xray");
    btnImagingXray?.classList.toggle("btn-secondary", imagingMode !== "xray");
    btnImagingAngio?.classList.toggle("btn-primary", imagingMode === "angiogram");
    btnImagingAngio?.classList.toggle("btn-secondary", imagingMode !== "angiogram");
  }

  btnImagingPhoto?.addEventListener("click", () => {
    imagingMode = "photo";
    updateImagingButtons();
    SoundFX.playClick();
  });
  btnImagingXray?.addEventListener("click", () => {
    imagingMode = "xray";
    updateImagingButtons();
    SoundFX.playClick();
  });
  btnImagingAngio?.addEventListener("click", () => {
    imagingMode = "angiogram";
    updateImagingButtons();
    SoundFX.playClick();
  });

  // Regional Jump
  selRegionJump?.addEventListener("change", (e) => {
    const reg = e.target.value;
    activeRegion = reg;
    SoundFX.playClick();
    if (reg === "all") {
      focusCameraOnCoords(500, 900, 1.0);
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

  // Zoom buttons (Smooth & centered on viewport midpoint)
  btnZoomIn?.addEventListener("click", () => {
    const rect = canvas.getBoundingClientRect();
    const cx = (rect.width || 600) / 2;
    const cy = (rect.height || 640) / 2;
    const newZoom = Math.min(12.0, zoom * 1.35);
    panX = cx - (cx - panX) * (newZoom / zoom);
    panY = cy - (cy - panY) * (newZoom / zoom);
    zoom = newZoom;
    if (zoomBadge) zoomBadge.innerText = `${zoom.toFixed(1)}×`;
    SoundFX.playClick();
  });
  btnZoomOut?.addEventListener("click", () => {
    const rect = canvas.getBoundingClientRect();
    const cx = (rect.width || 600) / 2;
    const cy = (rect.height || 640) / 2;
    const newZoom = Math.max(0.4, zoom / 1.35);
    panX = cx - (cx - panX) * (newZoom / zoom);
    panY = cy - (cy - panY) * (newZoom / zoom);
    zoom = newZoom;
    if (zoomBadge) zoomBadge.innerText = `${zoom.toFixed(1)}×`;
    SoundFX.playClick();
  });
  btnZoomReset?.addEventListener("click", () => {
    focusCameraOnCoords(500, 900, 1.0);
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

  // Pointer & Touch Interaction State
  let touchStartDist = 0;
  let touchStartZoom = 1.0;
  let isPinching = false;
  let pinchAnchorModelX = 500;
  let pinchAnchorModelY = 900;
  let totalDragDistance = 0;
  let lastTouchTapTime = 0;
  let lastTouchTapPos = { x: 0, y: 0 };
  let hasCenteredInitialView = false;

  // Safe canvas coordinate extractor (handles mouse, pointer, touch, and touchend)
  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const touch = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
    const clientX = touch ? touch.clientX : (e.clientX !== undefined ? e.clientX : rect.left);
    const clientY = touch ? touch.clientY : (e.clientY !== undefined ? e.clientY : rect.top);
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
      width: rect.width || 600,
      height: rect.height || 640
    };
  }

  function canvasToNormalizedCoords(cx, cy, width, height) {
    const scale = (height / 1800) * zoom;
    const nx = (cx - panX) / scale;
    const ny = (cy - panY) / scale;
    return { x: nx, y: ny };
  }

  // Mouse / Stylus Pointer Handlers (explicitly ignore 'touch' pointers to prevent dual-firing with touchstart)
  function handlePointerDown(e) {
    if (e.pointerType === "touch") return;
    isDragging = true;
    totalDragDistance = 0;
    dragStartX = e.clientX - panX;
    dragStartY = e.clientY - panY;
    canvas.style.cursor = "grabbing";
  }

  function handlePointerMove(e) {
    if (e.pointerType === "touch") return;
    if (isDragging) {
      const nextPanX = e.clientX - dragStartX;
      const nextPanY = e.clientY - dragStartY;
      totalDragDistance += Math.hypot(nextPanX - panX, nextPanY - panY);
      panX = nextPanX;
      panY = nextPanY;
    } else {
      // Hover detection on active plate pins
      const coords = getCanvasCoords(e);
      const norm = canvasToNormalizedCoords(coords.x, coords.y, coords.width, coords.height);
      const hitRadius = 36 / zoom; // Screen pixel normalized radius
      const visible = getVisibleStructures(activePlate, activeView).filter(s => getStructureOpacity(s) >= 0.12);
      const found = visible.find(s => {
        const dx = s.coords.x - norm.x;
        const dy = s.coords.y - norm.y;
        return Math.hypot(dx, dy) <= hitRadius;
      });
      hoveredStructure = found || null;
      canvas.style.cursor = hoveredStructure ? "pointer" : "grab";
    }
  }

  function handlePointerUp(e) {
    if (e.pointerType === "touch") return;
    if (isDragging) {
      isDragging = false;
      canvas.style.cursor = "grab";
    }
  }

  canvas.addEventListener("pointerdown", handlePointerDown);
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);

  // Multi-Touch Two-Finger Pinch-to-Zoom & Anchored Panning Engine
  canvas.addEventListener("touchstart", (e) => {
    e.stopPropagation();

    if (e.touches.length === 2) {
      if (e.cancelable) e.preventDefault();
      isDragging = false;
      isPinching = true;

      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      touchStartDist = Math.max(dist, 10);
      touchStartZoom = zoom;

      const rect = canvas.getBoundingClientRect();
      const midCanvasX = ((t1.clientX + t2.clientX) / 2) - rect.left;
      const midCanvasY = ((t1.clientY + t2.clientY) / 2) - rect.top;

      // Calculate model coordinates beneath midpoint of fingers:
      const scale = (rect.height / 1800) * zoom;
      pinchAnchorModelX = (midCanvasX - panX) / scale;
      pinchAnchorModelY = (midCanvasY - panY) / scale;

    } else if (e.touches.length === 1 && !isPinching) {
      const t = e.touches[0];
      isDragging = true;
      totalDragDistance = 0;
      dragStartX = t.clientX - panX;
      dragStartY = t.clientY - panY;

      // Double-Tap gesture to zoom in or reset
      const now = performance.now();
      const dt = now - lastTouchTapTime;
      const distFromLastTap = Math.hypot(t.clientX - lastTouchTapPos.x, t.clientY - lastTouchTapPos.y);

      if (dt < 320 && distFromLastTap < 32) {
        if (e.cancelable) e.preventDefault();
        SoundFX.playPop();
        const rect = canvas.getBoundingClientRect();
        const tapCanvasX = t.clientX - rect.left;
        const tapCanvasY = t.clientY - rect.top;

        if (zoom > 1.35) {
          // Reset to 1.0x centered
          focusCameraOnCoords(500, 900, 1.0);
        } else {
          // Zoom in 2.8x centered at tap point
          const scale = (rect.height / 1800) * zoom;
          const targetModelX = (tapCanvasX - panX) / scale;
          const targetModelY = (tapCanvasY - panY) / scale;
          focusCameraOnCoords(targetModelX, targetModelY, 2.8);
        }
        isDragging = false;
        lastTouchTapTime = 0;
        return;
      }
      lastTouchTapTime = now;
      lastTouchTapPos = { x: t.clientX, y: t.clientY };
    }
  }, { passive: false });

  canvas.addEventListener("touchmove", (e) => {
    e.stopPropagation();

    if (e.touches.length === 2 && isPinching && touchStartDist > 0) {
      if (e.cancelable) e.preventDefault();

      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const ratio = dist / touchStartDist;

      // Clamped continuous zoom factor
      const newZoom = Math.max(0.4, Math.min(12.0, touchStartZoom * ratio));

      const rect = canvas.getBoundingClientRect();
      const midCanvasX = ((t1.clientX + t2.clientX) / 2) - rect.left;
      const midCanvasY = ((t1.clientY + t2.clientY) / 2) - rect.top;

      // Mathematically anchored transform keeps anatomical point pinned under fingers
      const newScale = (rect.height / 1800) * newZoom;
      panX = midCanvasX - (pinchAnchorModelX * newScale);
      panY = midCanvasY - (pinchAnchorModelY * newScale);
      zoom = newZoom;

      totalDragDistance += 20;
      if (zoomBadge) zoomBadge.innerText = `${zoom.toFixed(1)}×`;

    } else if (e.touches.length === 1 && isDragging && !isPinching) {
      if (e.cancelable) e.preventDefault();
      const nextPanX = e.touches[0].clientX - dragStartX;
      const nextPanY = e.touches[0].clientY - dragStartY;
      totalDragDistance += Math.hypot(nextPanX - panX, nextPanY - panY);
      panX = nextPanX;
      panY = nextPanY;
    }
  }, { passive: false });

  canvas.addEventListener("touchend", (e) => {
    e.stopPropagation();

    if (e.touches.length === 1) {
      // Seamless finger transition: 1 finger lifted while pinching, transfer to 1-finger drag
      isPinching = false;
      touchStartDist = 0;
      isDragging = true;
      dragStartX = e.touches[0].clientX - panX;
      dragStartY = e.touches[0].clientY - panY;
    } else if (e.touches.length === 0) {
      isPinching = false;
      touchStartDist = 0;
      isDragging = false;
    }
  });

  canvas.addEventListener("touchcancel", (e) => {
    isPinching = false;
    touchStartDist = 0;
    isDragging = false;
  });

  // Click on pin with drag guard (ignores click if user was panning/pinching)
  canvas.addEventListener("click", (e) => {
    if (totalDragDistance > 8) {
      totalDragDistance = 0;
      return;
    }

    const coords = getCanvasCoords(e);
    const norm = canvasToNormalizedCoords(coords.x, coords.y, coords.width, coords.height);
    const hitRadius = 40 / zoom;
    const visible = getVisibleStructures(activePlate, activeView).filter(s => getStructureOpacity(s) >= 0.12);
    const clicked = visible.find(s => {
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

  // Trackpad Pinch (Ctrl+Wheel) & Mouse Wheel Zoom
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    e.stopPropagation();

    let newZoom;
    if (e.ctrlKey) {
      // Continuous smooth trackpad pinch gesture
      const factor = Math.exp(-e.deltaY * 0.012);
      newZoom = Math.max(0.4, Math.min(12.0, zoom * factor));
    } else {
      // Discrete mouse wheel stepped zoom
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      newZoom = Math.max(0.4, Math.min(12.0, zoom * zoomFactor));
    }

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
    const activePlateConf = ANATOMICAL_PLATES ? ANATOMICAL_PLATES[activePlate] : null;
    const plateTitle = activePlateConf ? `${activePlateConf.name.toUpperCase()} (4K UHD)` : "HUMAN ANATOMY ATLAS & SYSTEMIC MATRIX (4K UHD)";
    offCtx.fillStyle = "#ffffff";
    offCtx.font = "bold 60px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    offCtx.fillText(plateTitle, 120, 140);
    offCtx.fillStyle = "#38bdf8";
    offCtx.font = "600 30px 'JetBrains Mono', monospace";
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
    offCtx.fillText(`Plate: ${activePlateConf?.shortName || activePlate} • Rendered at ${new Date().toISOString()} • Native 3840×2160 Vector Metrology`, 120, 2100);

    // Download PNG
    const link = document.createElement("a");
    link.download = `human_anatomy_4k_${activePlate}_${selectedStructure ? selectedStructure.id : 'matrix'}.png`;
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
  // 8K ULTRA-HD MEDICAL DISSECTION & COMPOSITING ENGINE
  // ----------------------------------------------------
  function drawPlateImageLayer(targetCtx, img, alpha, filterMode = null) {
    if (!img || !img.complete || img.naturalWidth <= 0 || alpha <= 0.005) return;
    targetCtx.save();
    targetCtx.globalAlpha = Math.min(1.0, Math.max(0, alpha));
    targetCtx.imageSmoothingEnabled = true;
    targetCtx.imageSmoothingQuality = "high";

    if (filterMode === "xray") {
      targetCtx.filter = "contrast(190%) invert(95%) hue-rotate(180deg) brightness(88%)";
    } else if (filterMode === "angiogram") {
      targetCtx.filter = "contrast(220%) saturate(160%) hue-rotate(145deg) brightness(115%)";
    } else {
      targetCtx.filter = "none";
    }

    const aspect = img.naturalWidth / img.naturalHeight;
    let drawX, drawY, drawW, drawH;

    // Full Body coronal dissection plate (768x1376, aspect ~0.558)
    if (Math.abs(aspect - (768 / 1376)) < 0.03) {
      drawH = 1680;
      drawW = drawH * aspect; // 937.67
      drawX = 500 - (drawW / 2); // 31.16
      drawY = 55;
    } else {
      const maxW = 920;
      const maxH = 1600;
      if (aspect > (maxW / maxH)) {
        drawW = maxW;
        drawH = drawW / aspect;
      } else {
        drawH = maxH;
        drawW = drawH * aspect;
      }
      drawX = 500 - (drawW / 2);
      drawY = 900 - (drawH / 2);
    }

    targetCtx.drawImage(img, drawX, drawY, drawW, drawH);
    targetCtx.restore();
  }

  // Master Anatomical Human Body Silhouette Contour (Vitruvian Proportions & Smooth Bézier Anatomy)
  function buildHumanBodyPath(targetCtx) {
    targetCtx.beginPath();
    // Start at Crown / Vertex of head
    targetCtx.moveTo(500, 65);
    // Left Cranial Vault (Parietal curvature & temporal dip)
    targetCtx.bezierCurveTo(450, 65, 435, 95, 435, 135);
    // Left Temple, Zygomatic flare, and Mandibular Angle (Ear/Jaw corner)
    targetCtx.bezierCurveTo(435, 160, 442, 180, 452, 195);
    // Left Neck (Sternocleidomastoid & Cervical contour)
    targetCtx.bezierCurveTo(458, 208, 465, 222, 465, 245);
    // Left Trapezius slope out to Acromion shoulder tip
    targetCtx.bezierCurveTo(455, 260, 410, 272, 375, 278);
    // Left Deltoid cap (Muscular rounded shoulder sweep)
    targetCtx.bezierCurveTo(345, 285, 325, 315, 322, 355);
    // Left Upper Arm (Biceps / Brachialis lateral contour)
    targetCtx.bezierCurveTo(320, 395, 305, 435, 292, 465);
    // Left Lateral Elbow (Lateral epicondyle & cubital region)
    targetCtx.bezierCurveTo(282, 485, 275, 510, 268, 545);
    // Left Forearm (Brachioradialis swell tapering to wrist)
    targetCtx.bezierCurveTo(255, 595, 230, 655, 215, 715);
    // Left Hand (Anatomical snuffbox, thenar eminence & abducted pollex/thumb)
    targetCtx.bezierCurveTo(205, 735, 175, 742, 165, 755);
    targetCtx.bezierCurveTo(158, 765, 162, 775, 175, 775); // Thumb tip
    targetCtx.bezierCurveTo(185, 775, 195, 765, 202, 755); // First web space
    // Left Digits (Index, middle, ring, little fingers extending distally)
    targetCtx.bezierCurveTo(200, 785, 195, 835, 205, 890); // Finger extension
    targetCtx.bezierCurveTo(212, 910, 225, 910, 232, 895); // Fingertip curvature
    targetCtx.bezierCurveTo(242, 870, 252, 825, 258, 775); // Medial hand margin
    // Left Medial Wrist & Forearm (Flexor carpi ulnaris rising to elbow)
    targetCtx.bezierCurveTo(262, 745, 275, 690, 292, 620);
    targetCtx.bezierCurveTo(305, 565, 322, 510, 332, 475); // Cubital fossa / medial elbow
    // Left Medial Upper Arm to Axilla (Anterior axillary fold)
    targetCtx.bezierCurveTo(342, 440, 360, 400, 375, 378);
    // Left Lateral Thoracic Ribcage (Latissimus dorsi & serratus curve)
    targetCtx.bezierCurveTo(390, 415, 405, 470, 412, 530);
    // Left Waist Indentation (Narrowing at L2/L3 flank)
    targetCtx.bezierCurveTo(415, 565, 416, 610, 422, 660);
    // Left Iliac Crest & Hip (Greater trochanter flare)
    targetCtx.bezierCurveTo(428, 710, 435, 760, 435, 810);
    // Left Lateral Thigh (Vastus lateralis sweeping down to knee)
    targetCtx.bezierCurveTo(435, 870, 422, 970, 418, 1070);
    targetCtx.bezierCurveTo(415, 1130, 420, 1185, 424, 1220); // Lateral knee
    // Left Lateral Knee to Calf (Gastrocnemius lateral head)
    targetCtx.bezierCurveTo(426, 1250, 415, 1310, 412, 1370);
    // Left Lateral Soleus & Achilles Tendon tapering to ankle
    targetCtx.bezierCurveTo(410, 1430, 416, 1530, 420, 1610);
    // Left Lateral Malleolus (Lower outer ankle) & Heel (Calcaneus)
    targetCtx.bezierCurveTo(422, 1635, 416, 1675, 420, 1705);
    targetCtx.bezierCurveTo(424, 1720, 435, 1722, 445, 1720); // Plantar heel & sole
    // Left Metatarsals & Toes (Distal foot curvature)
    targetCtx.bezierCurveTo(455, 1722, 468, 1720, 475, 1708);
    // Left Medial Arch & Instep
    targetCtx.bezierCurveTo(472, 1690, 465, 1665, 462, 1635);
    // Left Medial Malleolus (Higher inner ankle bone)
    targetCtx.bezierCurveTo(460, 1610, 458, 1560, 458, 1510);
    // Left Medial Calf (Gastrocnemius medial head - fuller & lower curve)
    targetCtx.bezierCurveTo(458, 1440, 468, 1370, 468, 1300);
    // Left Medial Knee (Medial femoral/tibial condyle)
    targetCtx.bezierCurveTo(468, 1250, 470, 1215, 470, 1175);
    // Left Medial Thigh (Gracilis, sartorius & adductor curve)
    targetCtx.bezierCurveTo(472, 1110, 478, 1010, 485, 940);
    targetCtx.bezierCurveTo(490, 895, 496, 870, 500, 860); // Inguinal crease / Perineum

    // --- SYMMETRICAL RIGHT SIDE ---
    // Right Medial Thigh (Adductor longus & gracilis)
    targetCtx.bezierCurveTo(504, 870, 510, 895, 515, 940);
    targetCtx.bezierCurveTo(522, 1010, 528, 1110, 530, 1175);
    // Right Medial Knee (Medial condyle)
    targetCtx.bezierCurveTo(530, 1215, 532, 1250, 532, 1300);
    // Right Medial Calf (Gastrocnemius medial head - fuller & lower curve)
    targetCtx.bezierCurveTo(532, 1370, 542, 1440, 542, 1510);
    // Right Medial Malleolus & Instep
    targetCtx.bezierCurveTo(542, 1560, 540, 1610, 538, 1635);
    targetCtx.bezierCurveTo(535, 1665, 528, 1690, 525, 1708);
    // Right Toes & Plantar Sole
    targetCtx.bezierCurveTo(532, 1720, 545, 1722, 555, 1720);
    targetCtx.bezierCurveTo(565, 1722, 576, 1720, 580, 1705); // Plantar heel
    // Right Lateral Malleolus & Achilles tendon
    targetCtx.bezierCurveTo(584, 1675, 578, 1635, 580, 1610);
    targetCtx.bezierCurveTo(584, 1530, 590, 1430, 588, 1370);
    // Right Lateral Calf to Knee
    targetCtx.bezierCurveTo(585, 1310, 574, 1250, 576, 1220);
    // Right Lateral Thigh (Vastus lateralis sweep)
    targetCtx.bezierCurveTo(580, 1185, 585, 1130, 582, 1070);
    targetCtx.bezierCurveTo(578, 970, 565, 870, 565, 810);
    // Right Hip & Iliac Crest
    targetCtx.bezierCurveTo(565, 760, 572, 710, 578, 660);
    // Right Waist Indentation
    targetCtx.bezierCurveTo(584, 610, 585, 565, 588, 530);
    // Right Lateral Ribcage to Axilla
    targetCtx.bezierCurveTo(595, 470, 610, 415, 625, 378);
    // Right Medial Arm to Cubital Fossa
    targetCtx.bezierCurveTo(640, 400, 658, 440, 668, 475);
    targetCtx.bezierCurveTo(678, 510, 695, 565, 708, 620);
    // Right Medial Wrist & Hand
    targetCtx.bezierCurveTo(725, 690, 738, 745, 742, 775);
    targetCtx.bezierCurveTo(748, 825, 758, 870, 768, 895); // Medial digits
    targetCtx.bezierCurveTo(775, 910, 788, 910, 795, 890); // Fingertip curvature
    // Right Digits to Thumb
    targetCtx.bezierCurveTo(805, 835, 800, 785, 798, 755); // First web space
    targetCtx.bezierCurveTo(805, 765, 815, 775, 825, 775); // Thumb tip
    targetCtx.bezierCurveTo(838, 775, 842, 765, 835, 755); // Thenar eminence
    targetCtx.bezierCurveTo(825, 742, 795, 735, 785, 715); // Lateral wrist
    // Right Lateral Forearm (Brachioradialis swell)
    targetCtx.bezierCurveTo(770, 655, 745, 595, 732, 545);
    // Right Lateral Elbow
    targetCtx.bezierCurveTo(725, 510, 718, 485, 708, 465);
    // Right Upper Arm
    targetCtx.bezierCurveTo(695, 435, 680, 395, 678, 355);
    // Right Deltoid Cap
    targetCtx.bezierCurveTo(675, 315, 655, 285, 625, 278);
    // Right Trapezius slope to neck
    targetCtx.bezierCurveTo(590, 272, 545, 260, 535, 245);
    // Right Neck (Sternocleidomastoid)
    targetCtx.bezierCurveTo(535, 222, 542, 208, 548, 195);
    // Right Mandibular Angle & Temple
    targetCtx.bezierCurveTo(558, 180, 565, 160, 565, 135);
    // Right Cranial Vault back to Vertex
    targetCtx.bezierCurveTo(565, 95, 550, 65, 500, 65);
    targetCtx.closePath();
  }

  // STRATUM 1: Skeletal System (206-Bone Osteology & Radiographic Framework)
  function drawSkeletalVector(targetCtx, view, alpha, mode = "photo") {
    if (alpha <= 0.005) return;
    targetCtx.save();
    targetCtx.globalAlpha = Math.min(1.0, alpha);

    const isXray = (mode === "xray");
    const boneFill = isXray ? "#e0f2fe" : "#fbf9f4";
    const boneStroke = isXray ? "#38bdf8" : "#94a3b8";
    const boneShade = isXray ? "#0284c7" : "#cbd5e1";
    const discColor = isXray ? "#7dd3fc" : "#93c5fd";
    const cartilageColor = isXray ? "rgba(125, 211, 252, 0.7)" : "rgba(147, 197, 253, 0.75)";
    const shadowColor = isXray ? "#38bdf8" : "rgba(0,0,0,0.3)";

    targetCtx.fillStyle = boneFill;
    targetCtx.strokeStyle = boneStroke;
    targetCtx.shadowColor = shadowColor;
    targetCtx.shadowBlur = isXray ? 14 : 3;
    targetCtx.lineWidth = 2;

    // 1. CRANIUM & FACIAL OSTEOLOGY
    targetCtx.beginPath();
    // Calvaria / Cranial Vault
    targetCtx.moveTo(500, 75);
    targetCtx.bezierCurveTo(452, 75, 440, 105, 440, 135);
    targetCtx.bezierCurveTo(440, 155, 446, 170, 455, 180);
    // Zygomatic arches flare
    targetCtx.bezierCurveTo(455, 185, 460, 195, 470, 205);
    // Mandible / Chin (Mental protuberance)
    targetCtx.bezierCurveTo(482, 215, 492, 218, 500, 218);
    targetCtx.bezierCurveTo(508, 218, 518, 215, 530, 205);
    targetCtx.bezierCurveTo(540, 195, 545, 185, 545, 180);
    targetCtx.bezierCurveTo(554, 170, 560, 155, 560, 135);
    targetCtx.bezierCurveTo(560, 105, 548, 75, 500, 75);
    targetCtx.closePath();
    targetCtx.fill();
    targetCtx.stroke();

    if (view === "anterior") {
      // Bilateral Orbits (Anatomical eye sockets with supraorbital margins)
      targetCtx.fillStyle = isXray ? "#0369a1" : "#1e293b";
      targetCtx.strokeStyle = boneStroke;
      targetCtx.lineWidth = 2;
      // Left Orbit
      targetCtx.beginPath();
      targetCtx.moveTo(462, 120);
      targetCtx.bezierCurveTo(476, 118, 488, 122, 488, 134);
      targetCtx.bezierCurveTo(488, 146, 474, 150, 464, 146);
      targetCtx.bezierCurveTo(456, 142, 454, 126, 462, 120);
      targetCtx.closePath();
      targetCtx.fill(); targetCtx.stroke();
      // Right Orbit
      targetCtx.beginPath();
      targetCtx.moveTo(538, 120);
      targetCtx.bezierCurveTo(524, 118, 512, 122, 512, 134);
      targetCtx.bezierCurveTo(512, 146, 526, 150, 536, 146);
      targetCtx.bezierCurveTo(544, 142, 546, 126, 538, 120);
      targetCtx.closePath();
      targetCtx.fill(); targetCtx.stroke();

      // Piriform Aperture (Nasal cavity with perpendicular ethmoid/vomer septum)
      targetCtx.fillStyle = isXray ? "#0369a1" : "#1e293b";
      targetCtx.beginPath();
      targetCtx.moveTo(500, 138);
      targetCtx.bezierCurveTo(492, 150, 490, 165, 495, 170);
      targetCtx.bezierCurveTo(498, 172, 502, 172, 505, 170);
      targetCtx.bezierCurveTo(510, 165, 508, 150, 500, 138);
      targetCtx.closePath();
      targetCtx.fill();
      // Nasal Septum
      targetCtx.strokeStyle = boneFill;
      targetCtx.lineWidth = 1.5;
      targetCtx.beginPath();
      targetCtx.moveTo(500, 140); targetCtx.lineTo(500, 169);
      targetCtx.stroke();

      // Maxillary & Mandibular Alveolar Arches (Teeth rows)
      targetCtx.strokeStyle = boneStroke;
      targetCtx.fillStyle = boneFill;
      targetCtx.lineWidth = 1.5;
      targetCtx.beginPath();
      // Maxillary dental arch
      targetCtx.moveTo(480, 185); targetCtx.quadraticCurveTo(500, 188, 520, 185);
      // Mandibular dental arch
      targetCtx.moveTo(482, 193); targetCtx.quadraticCurveTo(500, 195, 518, 193);
      targetCtx.stroke();
      // Individual vertical tooth separator hints
      for (let t = -3; t <= 3; t++) {
        const tx = 500 + t * 5.5;
        targetCtx.beginPath();
        targetCtx.moveTo(tx, 184); targetCtx.lineTo(tx, 194);
        targetCtx.stroke();
      }

      // Mental Foramina & Mandible Angle contours
      targetCtx.fillStyle = isXray ? "#0284c7" : "#64748b";
      targetCtx.beginPath();
      targetCtx.arc(482, 202, 1.8, 0, Math.PI * 2);
      targetCtx.arc(518, 202, 1.8, 0, Math.PI * 2);
      targetCtx.fill();
    } else {
      // Posterior Cranium: Occiput, Lambdoid Suture, Inion, Nuchal lines
      targetCtx.strokeStyle = boneStroke;
      targetCtx.lineWidth = 1.8;
      // Lambdoid suture inverted V
      targetCtx.beginPath();
      targetCtx.moveTo(500, 115);
      targetCtx.lineTo(470, 145);
      targetCtx.moveTo(500, 115);
      targetCtx.lineTo(530, 145);
      targetCtx.stroke();
      // Superior nuchal line
      targetCtx.beginPath();
      targetCtx.moveTo(465, 160); targetCtx.quadraticCurveTo(500, 150, 535, 160);
      targetCtx.stroke();
      // External occipital protuberance (inion)
      targetCtx.fillStyle = boneShade;
      targetCtx.beginPath();
      targetCtx.arc(500, 152, 3, 0, Math.PI * 2);
      targetCtx.fill();
    }

    // 2. VERTEBRAL COLUMN (C1-C7, T1-T12, L1-L5, Sacrum, Coccyx)
    targetCtx.fillStyle = boneFill;
    targetCtx.strokeStyle = boneStroke;
    targetCtx.lineWidth = 1.5;
    for (let v = 0; v < 24; v++) {
      const vy = 218 + (v * 24);
      const isCervical = (v < 7);
      const isThoracic = (v >= 7 && v < 19);
      const vw = isCervical ? (16 + v * 0.6) : (isThoracic ? (20 + (v - 7) * 0.8) : (29 + (v - 19) * 1.2));
      const vh = isCervical ? 12 : (isThoracic ? 14 : 16);

      // Intervertebral Disc
      if (v > 0) {
        targetCtx.fillStyle = discColor;
        targetCtx.beginPath();
        targetCtx.roundRect(500 - (vw / 2) + 2, vy - 4, vw - 4, 4, 1.5);
        targetCtx.fill();
      }

      // Vertebral Body
      targetCtx.fillStyle = boneFill;
      targetCtx.beginPath();
      targetCtx.roundRect(500 - (vw / 2), vy, vw, vh, 3.5);
      targetCtx.fill();
      targetCtx.stroke();

      // Transverse processes & Spinous process
      if (view === "posterior") {
        targetCtx.fillStyle = boneShade;
        targetCtx.beginPath();
        targetCtx.arc(500, vy + vh / 2, 2.5, 0, Math.PI * 2);
        targetCtx.fill();
      }
    }

    // Sacrum & Coccyx
    targetCtx.fillStyle = boneFill;
    targetCtx.strokeStyle = boneStroke;
    targetCtx.lineWidth = 2;
    targetCtx.beginPath();
    targetCtx.moveTo(478, 775);
    targetCtx.bezierCurveTo(478, 770, 522, 770, 522, 775);
    targetCtx.lineTo(512, 835);
    targetCtx.lineTo(504, 855); // Coccyx tip
    targetCtx.lineTo(496, 855);
    targetCtx.lineTo(488, 835);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Sacral Foramina (4 pairs)
    targetCtx.fillStyle = isXray ? "#0284c7" : "#475569";
    for (let sf = 0; sf < 4; sf++) {
      const sfy = 785 + sf * 12;
      const sfx = 6 + sf * 1.2;
      targetCtx.beginPath();
      targetCtx.arc(500 - sfx, sfy, 2, 0, Math.PI * 2);
      targetCtx.arc(500 + sfx, sfy, 2, 0, Math.PI * 2);
      targetCtx.fill();
    }

    // 3. CLAVICLES (Collarbones - Authentic Double S-Curve)
    targetCtx.lineWidth = 4.5;
    targetCtx.strokeStyle = boneFill;
    targetCtx.beginPath();
    // Left Clavicle
    targetCtx.moveTo(492, 260);
    targetCtx.bezierCurveTo(465, 252, 425, 268, 375, 276);
    // Right Clavicle
    targetCtx.moveTo(508, 260);
    targetCtx.bezierCurveTo(535, 252, 575, 268, 625, 276);
    targetCtx.stroke();
    targetCtx.lineWidth = 2;
    targetCtx.strokeStyle = boneStroke;
    targetCtx.stroke();

    // 4. STERNUM & THORACIC CAGE (12 Rib Pairs & Costal Cartilages)
    if (view === "anterior") {
      // Manubrium with suprasternal notch
      targetCtx.fillStyle = boneFill;
      targetCtx.strokeStyle = boneStroke;
      targetCtx.lineWidth = 2;
      targetCtx.beginPath();
      targetCtx.moveTo(486, 262);
      targetCtx.quadraticCurveTo(500, 265, 514, 262); // Suprasternal notch
      targetCtx.lineTo(518, 290);
      targetCtx.lineTo(508, 298); // Sternal angle (Angle of Louis)
      targetCtx.lineTo(492, 298);
      targetCtx.lineTo(482, 290);
      targetCtx.closePath();
      targetCtx.fill(); targetCtx.stroke();

      // Sternal Body (Gladiolus)
      targetCtx.beginPath();
      targetCtx.moveTo(492, 298); targetCtx.lineTo(508, 298);
      targetCtx.lineTo(506, 420); targetCtx.lineTo(494, 420);
      targetCtx.closePath();
      targetCtx.fill(); targetCtx.stroke();

      // Costal facet segments on sternal body
      for (let s = 1; s <= 4; s++) {
        const sy = 298 + s * 24;
        targetCtx.beginPath();
        targetCtx.moveTo(493, sy); targetCtx.lineTo(507, sy);
        targetCtx.stroke();
      }

      // Xiphoid Process with sternal foramen
      targetCtx.beginPath();
      targetCtx.moveTo(496, 420); targetCtx.lineTo(504, 420);
      targetCtx.lineTo(502, 442); targetCtx.lineTo(498, 442);
      targetCtx.closePath();
      targetCtx.fill(); targetCtx.stroke();
    }

    // 12 Paired Ribs & Costal Cartilages
    targetCtx.lineWidth = 3;
    for (let r = 0; r < 12; r++) {
      const ry = 275 + (r * 15.5);
      const rxw = 46 + (r < 7 ? r * 10 : (60 - (r - 7) * 8));
      const rDrop = 14 + r * 2.5;

      // Osseous Rib Shaft
      targetCtx.strokeStyle = boneFill;
      targetCtx.beginPath();
      // Left Rib
      targetCtx.moveTo(492, ry - 6);
      targetCtx.bezierCurveTo(492 - rxw, ry + 2, 492 - rxw, ry + rDrop + 8, 465, ry + rDrop);
      // Right Rib
      targetCtx.moveTo(508, ry - 6);
      targetCtx.bezierCurveTo(508 + rxw, ry + 2, 508 + rxw, ry + rDrop + 8, 535, ry + rDrop);
      targetCtx.stroke();

      targetCtx.lineWidth = 1.5;
      targetCtx.strokeStyle = boneStroke;
      targetCtx.stroke();

      // Hyaline Costal Cartilage (Ribs 1-7 connecting to sternum, 8-10 to costal margin)
      if (view === "anterior" && r < 10) {
        targetCtx.strokeStyle = cartilageColor;
        targetCtx.lineWidth = 2.5;
        targetCtx.beginPath();
        if (r < 7) {
          // True ribs connect to sternum
          const sternY = 280 + r * 20;
          targetCtx.moveTo(465, ry + rDrop); targetCtx.quadraticCurveTo(480, ry + rDrop - 2, 492, sternY);
          targetCtx.moveTo(535, ry + rDrop); targetCtx.quadraticCurveTo(520, ry + rDrop - 2, 508, sternY);
        } else {
          // False ribs connect to costal arch
          targetCtx.moveTo(465, ry + rDrop); targetCtx.lineTo(480, 425);
          targetCtx.moveTo(535, ry + rDrop); targetCtx.lineTo(520, 425);
        }
        targetCtx.stroke();
      }
    }

    // 5. SCAPULAE (Shoulder Blades)
    targetCtx.fillStyle = boneFill;
    targetCtx.strokeStyle = boneStroke;
    targetCtx.lineWidth = 2;
    // Left Scapula
    targetCtx.beginPath();
    targetCtx.moveTo(375, 278); // Acromion
    targetCtx.lineTo(355, 345); // Glenoid / lateral border
    targetCtx.lineTo(395, 385); // Inferior angle
    targetCtx.lineTo(425, 310); // Medial / vertebral border
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();
    // Right Scapula
    targetCtx.beginPath();
    targetCtx.moveTo(625, 278); // Acromion
    targetCtx.lineTo(645, 345); // Glenoid
    targetCtx.lineTo(605, 385); // Inferior angle
    targetCtx.lineTo(575, 310); // Medial border
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // 6. PELVIS / OS COXAE (Ilium, Ischium, Pubis, Acetabulum, Obturator Foramina)
    targetCtx.lineWidth = 2.5;
    // Left Iliac Blade
    targetCtx.beginPath();
    targetCtx.moveTo(480, 770);
    targetCtx.bezierCurveTo(460, 715, 415, 718, 418, 755); // Iliac crest & ASIS
    targetCtx.bezierCurveTo(418, 785, 432, 820, 455, 835); // Acetabulum region
    targetCtx.lineTo(485, 850); // Pubic ramus
    targetCtx.lineTo(495, 845); // Pubic symphysis
    targetCtx.bezierCurveTo(480, 810, 478, 785, 480, 770);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Right Iliac Blade
    targetCtx.beginPath();
    targetCtx.moveTo(520, 770);
    targetCtx.bezierCurveTo(540, 715, 585, 718, 582, 755); // Iliac crest & ASIS
    targetCtx.bezierCurveTo(582, 785, 568, 820, 545, 835); // Acetabulum
    targetCtx.lineTo(515, 850); // Pubic ramus
    targetCtx.lineTo(505, 845); // Pubic symphysis
    targetCtx.bezierCurveTo(520, 810, 522, 785, 520, 770);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Pubic Symphysis (Fibrocartilage joint)
    targetCtx.fillStyle = discColor;
    targetCtx.beginPath();
    targetCtx.rect(496, 838, 8, 12);
    targetCtx.fill();

    // Obturator Foramina (Paired apertures)
    targetCtx.fillStyle = isXray ? "#0369a1" : "#0f172a";
    targetCtx.beginPath();
    targetCtx.ellipse(470, 838, 9, 13, -0.2, 0, Math.PI * 2);
    targetCtx.ellipse(530, 838, 9, 13, 0.2, 0, Math.PI * 2);
    targetCtx.fill();

    // 7. UPPER LIMBS (Humerus, Radius, Ulna, Carpus, Metacarpus, Phalanges)
    targetCtx.fillStyle = boneFill;
    targetCtx.strokeStyle = boneStroke;
    targetCtx.lineWidth = 2;

    // Left Humerus (Spherical head, shaft, epicondyles)
    targetCtx.beginPath();
    targetCtx.arc(365, 290, 11, 0, Math.PI * 2); // Head
    targetCtx.moveTo(360, 300);
    targetCtx.bezierCurveTo(342, 360, 320, 420, 298, 472); // Shaft diaphysis
    targetCtx.lineTo(312, 476); // Distal epicondyle
    targetCtx.bezierCurveTo(330, 420, 354, 360, 372, 300);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Right Humerus
    targetCtx.beginPath();
    targetCtx.arc(635, 290, 11, 0, Math.PI * 2);
    targetCtx.moveTo(640, 300);
    targetCtx.bezierCurveTo(658, 360, 680, 420, 702, 472);
    targetCtx.lineTo(688, 476);
    targetCtx.bezierCurveTo(670, 420, 646, 360, 628, 300);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Left Radius (Lateral) & Ulna (Medial with olecranon)
    targetCtx.beginPath();
    // Radius
    targetCtx.moveTo(292, 482); targetCtx.bezierCurveTo(270, 545, 245, 625, 225, 715);
    targetCtx.lineTo(233, 716); targetCtx.bezierCurveTo(252, 625, 278, 545, 300, 482);
    targetCtx.closePath();
    // Ulna
    targetCtx.moveTo(304, 478); targetCtx.bezierCurveTo(286, 545, 268, 625, 248, 715);
    targetCtx.lineTo(256, 716); targetCtx.bezierCurveTo(276, 625, 294, 545, 312, 478);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Right Radius & Ulna
    targetCtx.beginPath();
    // Radius
    targetCtx.moveTo(708, 482); targetCtx.bezierCurveTo(730, 545, 755, 625, 775, 715);
    targetCtx.lineTo(767, 716); targetCtx.bezierCurveTo(748, 625, 722, 545, 700, 482);
    targetCtx.closePath();
    // Ulna
    targetCtx.moveTo(696, 478); targetCtx.bezierCurveTo(714, 545, 732, 625, 752, 715);
    targetCtx.lineTo(744, 716); targetCtx.bezierCurveTo(724, 625, 706, 545, 688, 478);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Hand Bones (Carpals, Metacarpals, Phalanges)
    // Left Hand
    targetCtx.beginPath();
    // Carpal mass
    targetCtx.roundRect(228, 718, 22, 14, 4);
    // 5 Metacarpals & Phalanges
    for (let f = 0; f < 5; f++) {
      const fx = 212 + f * 7.5;
      const fy = 734 + Math.abs(f - 2) * 4;
      const fl = 55 - Math.abs(f - 2) * 8;
      targetCtx.moveTo(fx, fy); targetCtx.lineTo(fx - 4, fy + fl);
    }
    targetCtx.fill(); targetCtx.stroke();

    // Right Hand
    targetCtx.beginPath();
    targetCtx.roundRect(750, 718, 22, 14, 4);
    for (let f = 0; f < 5; f++) {
      const fx = 752 + f * 7.5;
      const fy = 734 + Math.abs(f - 2) * 4;
      const fl = 55 - Math.abs(f - 2) * 8;
      targetCtx.moveTo(fx, fy); targetCtx.lineTo(fx + 4, fy + fl);
    }
    targetCtx.fill(); targetCtx.stroke();

    // 8. LOWER LIMBS (Femur, Patella, Tibia, Fibula, Tarsus, Metatarsus, Phalanges)
    // Left Femur (Spherical head, neck, trochanters, bowed shaft, condyles)
    targetCtx.beginPath();
    targetCtx.arc(460, 830, 14, 0, Math.PI * 2); // Femoral head in acetabulum
    targetCtx.moveTo(452, 835);
    targetCtx.lineTo(432, 842); // Femoral neck
    targetCtx.lineTo(426, 848); // Greater trochanter
    targetCtx.bezierCurveTo(424, 950, 420, 1070, 430, 1195); // Bowed diaphysis
    targetCtx.lineTo(444, 1205); // Medial condyle
    targetCtx.lineTo(422, 1205); // Lateral condyle
    targetCtx.bezierCurveTo(434, 1070, 438, 950, 442, 845);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Right Femur
    targetCtx.beginPath();
    targetCtx.arc(540, 830, 14, 0, Math.PI * 2);
    targetCtx.moveTo(548, 835);
    targetCtx.lineTo(568, 842);
    targetCtx.lineTo(574, 848); // Greater trochanter
    targetCtx.bezierCurveTo(576, 950, 580, 1070, 570, 1195);
    targetCtx.lineTo(556, 1205);
    targetCtx.lineTo(578, 1205);
    targetCtx.bezierCurveTo(566, 1070, 562, 950, 558, 845);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Patellae (Triangular sesamoid bones)
    if (view === "anterior") {
      targetCtx.fillStyle = boneFill;
      targetCtx.beginPath();
      // Left Patella
      targetCtx.moveTo(427, 1205); targetCtx.lineTo(441, 1205); targetCtx.lineTo(434, 1222);
      targetCtx.closePath();
      // Right Patella
      targetCtx.moveTo(559, 1205); targetCtx.lineTo(573, 1205); targetCtx.lineTo(566, 1222);
      targetCtx.closePath();
      targetCtx.fill(); targetCtx.stroke();
    }

    // Tibia (Broad plateau, tuberosity, shin crest, medial malleolus) & Fibula
    // Left Tibia
    targetCtx.beginPath();
    targetCtx.moveTo(425, 1215); targetCtx.lineTo(445, 1215); // Plateau
    targetCtx.bezierCurveTo(442, 1340, 440, 1470, 448, 1608); // Medial malleolus
    targetCtx.lineTo(438, 1608);
    targetCtx.bezierCurveTo(432, 1470, 430, 1340, 428, 1215);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Left Fibula (Slender lateral bone with lower lateral malleolus)
    targetCtx.beginPath();
    targetCtx.arc(420, 1225, 4, 0, Math.PI * 2); // Head of fibula
    targetCtx.moveTo(420, 1229); targetCtx.lineTo(423, 1622); // Shaft to lateral malleolus
    targetCtx.stroke();

    // Right Tibia
    targetCtx.beginPath();
    targetCtx.moveTo(555, 1215); targetCtx.lineTo(575, 1215);
    targetCtx.bezierCurveTo(558, 1340, 560, 1470, 552, 1608); // Medial malleolus
    targetCtx.lineTo(562, 1608);
    targetCtx.bezierCurveTo(568, 1470, 570, 1340, 572, 1215);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Right Fibula
    targetCtx.beginPath();
    targetCtx.arc(580, 1225, 4, 0, Math.PI * 2);
    targetCtx.moveTo(580, 1229); targetCtx.lineTo(577, 1622);
    targetCtx.stroke();

    // Foot Bones (Tarsus, Metatarsus, Phalanges)
    // Left Foot
    targetCtx.beginPath();
    targetCtx.moveTo(436, 1612); // Talus
    targetCtx.lineTo(425, 1650); // Calcaneus heel
    targetCtx.lineTo(432, 1712); // Lateral sole
    targetCtx.lineTo(468, 1712); // Metatarsals & Toes
    targetCtx.lineTo(452, 1612); // Navicular / cuneiforms
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Right Foot
    targetCtx.beginPath();
    targetCtx.moveTo(564, 1612);
    targetCtx.lineTo(575, 1650);
    targetCtx.lineTo(568, 1712);
    targetCtx.lineTo(532, 1712);
    targetCtx.lineTo(548, 1612);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    targetCtx.restore();
  }

  // STRATUM 2: Splanchnic Viscera (Thoracic & Abdominal Internal Organs)
  function drawVisceralVector(targetCtx, view, alpha) {
    if (alpha <= 0.005) return;
    targetCtx.save();
    targetCtx.globalAlpha = Math.min(1.0, alpha);

    // 1. TRACHEA & PRIMARY BRONCHIAL ARBORIZATION
    targetCtx.strokeStyle = "#38bdf8";
    targetCtx.lineWidth = 6;
    targetCtx.beginPath();
    targetCtx.moveTo(500, 225); targetCtx.lineTo(500, 318); // Trachea to Carina at T4/T5
    // Right Main Bronchus (Wider, shorter, more vertical at ~25°)
    targetCtx.lineTo(472, 348);
    // Left Main Bronchus (Longer, more horizontal at ~45°)
    targetCtx.moveTo(500, 318); targetCtx.lineTo(535, 345);
    targetCtx.stroke();

    // C-shaped hyaline cartilage rings
    targetCtx.strokeStyle = "#bae6fd";
    targetCtx.lineWidth = 2;
    for (let i = 0; i < 7; i++) {
      const cy = 232 + (i * 12);
      targetCtx.beginPath();
      targetCtx.moveTo(493, cy); targetCtx.lineTo(507, cy);
      targetCtx.stroke();
    }

    // 2. PULMONARY LUNGS (With authentic lobar morphology & respiratory expansion)
    const breath = 1.0 + 0.035 * Math.sin(simTime * 2.4);

    // Right Lung (3 Lobes: Superior, Middle, Inferior)
    targetCtx.save();
    targetCtx.translate(440, 385);
    targetCtx.scale(breath, breath);
    targetCtx.fillStyle = "rgba(52, 211, 153, 0.88)";
    targetCtx.strokeStyle = "#059669";
    targetCtx.lineWidth = 2.5;
    targetCtx.beginPath();
    targetCtx.moveTo(0, -95); // Apex
    targetCtx.bezierCurveTo(35, -90, 48, -40, 48, 10);
    targetCtx.bezierCurveTo(48, 60, 35, 88, 0, 92); // Base
    targetCtx.bezierCurveTo(-38, 92, -45, 60, -45, 10);
    targetCtx.bezierCurveTo(-45, -40, -32, -90, 0, -95);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Fissures (Horizontal & Oblique)
    targetCtx.strokeStyle = "#047857";
    targetCtx.lineWidth = 1.8;
    // Horizontal fissure
    targetCtx.beginPath();
    targetCtx.moveTo(-35, -10); targetCtx.quadraticCurveTo(5, -15, 45, -5);
    targetCtx.stroke();
    // Oblique fissure
    targetCtx.beginPath();
    targetCtx.moveTo(-20, -55); targetCtx.quadraticCurveTo(10, 15, 35, 75);
    targetCtx.stroke();
    targetCtx.restore();

    // Left Lung (2 Lobes: Superior & Inferior with prominent Cardiac Notch & Lingula)
    targetCtx.save();
    targetCtx.translate(560, 385);
    targetCtx.scale(breath, breath);
    targetCtx.fillStyle = "rgba(52, 211, 153, 0.88)";
    targetCtx.strokeStyle = "#059669";
    targetCtx.lineWidth = 2.5;
    targetCtx.beginPath();
    targetCtx.moveTo(0, -95); // Apex
    targetCtx.bezierCurveTo(32, -90, 45, -40, 45, 10);
    targetCtx.bezierCurveTo(45, 60, 38, 92, 0, 92); // Base
    targetCtx.bezierCurveTo(-15, 88, -25, 75, -28, 55); // Lingula
    targetCtx.bezierCurveTo(-48, 25, -48, -15, -25, -45); // Deep Cardiac Notch
    targetCtx.bezierCurveTo(-32, -65, -25, -90, 0, -95);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Left Oblique fissure
    targetCtx.strokeStyle = "#047857";
    targetCtx.lineWidth = 1.8;
    targetCtx.beginPath();
    targetCtx.moveTo(25, -55); targetCtx.quadraticCurveTo(-5, 15, -25, 75);
    targetCtx.stroke();
    targetCtx.restore();

    // 3. FOUR-CHAMBERED HEART & GREAT VESSELS (Conical pump shifted left with LAD & Aorta)
    const hPulse = 1.0 + 0.065 * Math.sin(simTime * 8);
    targetCtx.save();
    targetCtx.translate(515, 395);
    targetCtx.scale(hPulse, hPulse);

    // Aortic Arch (Carmine with 3 branch arteries)
    targetCtx.fillStyle = "#dc2626";
    targetCtx.strokeStyle = "#991b1b";
    targetCtx.lineWidth = 2.5;
    targetCtx.beginPath();
    targetCtx.arc(-8, -48, 16, Math.PI * 0.9, 0); // Arch curve
    targetCtx.lineTo(6, -20);
    targetCtx.lineTo(-6, -20);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // 3 Great Branches off Arch
    targetCtx.strokeStyle = "#dc2626";
    targetCtx.lineWidth = 3.5;
    targetCtx.beginPath();
    targetCtx.moveTo(-20, -56); targetCtx.lineTo(-24, -72); // Brachiocephalic
    targetCtx.moveTo(-10, -64); targetCtx.lineTo(-10, -75); // Left common carotid
    targetCtx.moveTo(0, -60); targetCtx.lineTo(4, -72); // Left subclavian
    targetCtx.stroke();

    // Pulmonary Trunk crossing anteriorly
    targetCtx.fillStyle = "#38bdf8";
    targetCtx.strokeStyle = "#0284c7";
    targetCtx.lineWidth = 2;
    targetCtx.beginPath();
    targetCtx.moveTo(-18, -25);
    targetCtx.bezierCurveTo(-14, -45, -4, -48, 10, -42);
    targetCtx.lineTo(8, -32);
    targetCtx.bezierCurveTo(0, -36, -8, -32, -12, -20);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Superior Vena Cava (SVC)
    targetCtx.fillStyle = "#0284c7";
    targetCtx.beginPath();
    targetCtx.rect(-34, -58, 10, 35);
    targetCtx.fill();

    // Ventricular Myocardium (Left-shifted conical muscle mass with apex at left 5th ICS)
    targetCtx.fillStyle = "#ef4444";
    targetCtx.strokeStyle = "#991b1b";
    targetCtx.lineWidth = 3;
    targetCtx.shadowColor = "rgba(239, 68, 68, 0.45)";
    targetCtx.shadowBlur = 10;
    targetCtx.beginPath();
    targetCtx.moveTo(-35, -15); // Right atrium border
    targetCtx.bezierCurveTo(-42, 10, -35, 30, -20, 38); // Right ventricle inferior margin
    targetCtx.bezierCurveTo(-5, 45, 12, 48, 22, 44); // Apex pointing inferolaterally
    targetCtx.bezierCurveTo(38, 25, 42, -5, 25, -20); // Left ventricle lateral margin
    targetCtx.bezierCurveTo(15, -28, -20, -25, -35, -15);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Anterior Interventricular Sulcus (LAD Coronary & Great Cardiac Vein)
    targetCtx.strokeStyle = "#7f1d1d";
    targetCtx.lineWidth = 2.5;
    targetCtx.beginPath();
    targetCtx.moveTo(-5, -15);
    targetCtx.bezierCurveTo(2, 5, 8, 25, 20, 42); // Descending to apex
    targetCtx.stroke();
    // Coronary artery branchlets
    targetCtx.strokeStyle = "#fca5a5";
    targetCtx.lineWidth = 1.2;
    targetCtx.beginPath();
    targetCtx.moveTo(0, 0); targetCtx.lineTo(-12, 12);
    targetCtx.moveTo(5, 15); targetCtx.lineTo(15, 22);
    targetCtx.stroke();

    targetCtx.restore();

    // 4. LIVER (Hepar: Asymmetric wedge with Right/Left lobes & Falciform Ligament)
    targetCtx.fillStyle = "rgba(217, 119, 6, 0.92)";
    targetCtx.strokeStyle = "#92400e";
    targetCtx.lineWidth = 3;
    targetCtx.beginPath();
    targetCtx.moveTo(422, 475); // Superior dome right lobe
    targetCtx.bezierCurveTo(465, 468, 515, 475, 545, 492); // Sweeping over left lobe
    targetCtx.bezierCurveTo(535, 520, 510, 525, 485, 535); // Inferior margin
    targetCtx.bezierCurveTo(450, 550, 415, 545, 412, 520); // Right lateral margin
    targetCtx.bezierCurveTo(410, 495, 415, 480, 422, 475);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Falciform Ligament & Ligamentum Teres Hepatis
    targetCtx.strokeStyle = "#fef3c7";
    targetCtx.lineWidth = 2;
    targetCtx.beginPath();
    targetCtx.moveTo(475, 472); targetCtx.bezierCurveTo(478, 500, 472, 525, 468, 542);
    targetCtx.stroke();

    // 5. GALLBLADDER (Pear-shaped emerald bile reservoir with cystic/bile ducts)
    targetCtx.fillStyle = "#10b981";
    targetCtx.strokeStyle = "#047857";
    targetCtx.lineWidth = 2;
    targetCtx.beginPath();
    targetCtx.ellipse(455, 546, 10, 16, 0.35, 0, Math.PI * 2);
    targetCtx.fill(); targetCtx.stroke();
    // Common Bile Duct (CBD)
    targetCtx.strokeStyle = "#059669";
    targetCtx.lineWidth = 2;
    targetCtx.beginPath();
    targetCtx.moveTo(458, 538); targetCtx.quadraticCurveTo(470, 530, 482, 545);
    targetCtx.stroke();

    // 6. STOMACH (Gaster: J-shaped hollow organ with high fundus, curvatures & rugae)
    targetCtx.fillStyle = "rgba(251, 191, 36, 0.92)";
    targetCtx.strokeStyle = "#b45309";
    targetCtx.lineWidth = 3;
    targetCtx.beginPath();
    targetCtx.moveTo(518, 488); // Cardia / Esophageal entry
    targetCtx.bezierCurveTo(535, 470, 565, 472, 572, 492); // Dome-like Fundus
    targetCtx.bezierCurveTo(582, 515, 575, 545, 550, 555); // Greater Curvature
    targetCtx.bezierCurveTo(535, 560, 515, 555, 502, 542); // Pyloric Antrum
    targetCtx.bezierCurveTo(512, 530, 525, 520, 522, 505); // Lesser Curvature & Incisura
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Gastric Rugal Folds (Longitudinal undulating mucosal folds)
    targetCtx.strokeStyle = "rgba(180, 83, 9, 0.55)";
    targetCtx.lineWidth = 1.8;
    targetCtx.beginPath();
    targetCtx.moveTo(535, 490); targetCtx.quadraticCurveTo(555, 515, 545, 545);
    targetCtx.moveTo(548, 488); targetCtx.quadraticCurveTo(568, 518, 558, 542);
    targetCtx.stroke();

    // 7. PANCREAS & SPLEEN
    // Pancreas (Nestled in duodenal curve)
    targetCtx.fillStyle = "#fde047";
    targetCtx.strokeStyle = "#ca8a04";
    targetCtx.lineWidth = 2;
    targetCtx.beginPath();
    targetCtx.moveTo(492, 538);
    targetCtx.bezierCurveTo(520, 532, 550, 528, 570, 515); // Tail to splenic hilum
    targetCtx.lineTo(568, 524);
    targetCtx.bezierCurveTo(545, 538, 515, 544, 490, 548); // Body & Head
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Spleen (Left hypochondrium purplish lymphoid organ)
    targetCtx.fillStyle = "#8b5cf6";
    targetCtx.strokeStyle = "#5b21b6";
    targetCtx.lineWidth = 2;
    targetCtx.beginPath();
    targetCtx.ellipse(585, 502, 14, 24, 0.25, 0, Math.PI * 2);
    targetCtx.fill(); targetCtx.stroke();

    // 8. BILATERAL KIDNEYS (Reniform beans with Hilum, Cortex, Pyramids & Ureters)
    // Right Kidney (Lower at T12-L3)
    targetCtx.fillStyle = "#a855f7";
    targetCtx.strokeStyle = "#6b21a8";
    targetCtx.lineWidth = 2.5;
    targetCtx.beginPath();
    targetCtx.moveTo(435, 580);
    targetCtx.bezierCurveTo(452, 580, 455, 600, 448, 615); // Medial Hilum indentation
    targetCtx.bezierCurveTo(442, 630, 432, 635, 420, 625); // Lower pole
    targetCtx.bezierCurveTo(410, 610, 412, 595, 420, 582); // Convex lateral border
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Left Kidney (Higher at T11-L2)
    targetCtx.beginPath();
    targetCtx.moveTo(565, 572);
    targetCtx.bezierCurveTo(548, 572, 545, 592, 552, 607); // Medial Hilum
    targetCtx.bezierCurveTo(558, 622, 568, 627, 580, 617);
    targetCtx.bezierCurveTo(590, 602, 588, 587, 580, 574);
    targetCtx.closePath();
    targetCtx.fill(); targetCtx.stroke();

    // Bilateral Muscular Ureters descending to bladder trigone
    targetCtx.strokeStyle = "#c084fc";
    targetCtx.lineWidth = 2.5;
    targetCtx.beginPath();
    targetCtx.moveTo(446, 610); targetCtx.bezierCurveTo(458, 680, 465, 750, 492, 828);
    targetCtx.moveTo(554, 602); targetCtx.bezierCurveTo(542, 680, 535, 750, 508, 828);
    targetCtx.stroke();

    // 9. INTESTINES (Framing Large Intestine / Colon & Convoluted Small Bowel)
    // Large Intestine (Colon with Haustra pouches & Taeniae Coli)
    targetCtx.fillStyle = "rgba(245, 158, 11, 0.85)";
    targetCtx.strokeStyle = "#92400e";
    targetCtx.lineWidth = 2.5;

    // Cecum & Appendix in Right Iliac Fossa
    targetCtx.beginPath();
    targetCtx.ellipse(436, 735, 16, 20, 0, 0, Math.PI * 2);
    targetCtx.fill(); targetCtx.stroke();
    // Vermiform Appendix
    targetCtx.strokeStyle = "#b45309";
    targetCtx.lineWidth = 3;
    targetCtx.beginPath();
    targetCtx.moveTo(436, 750); targetCtx.bezierCurveTo(428, 765, 435, 775, 442, 772);
    targetCtx.stroke();

    // Ascending Colon -> Hepatic Flexure -> Transverse Colon -> Splenic Flexure -> Descending -> Sigmoid
    targetCtx.strokeStyle = "#b45309";
    targetCtx.lineWidth = 15;
    targetCtx.lineCap = "round";
    targetCtx.lineJoin = "round";
    targetCtx.beginPath();
    targetCtx.moveTo(436, 725);
    targetCtx.lineTo(436, 630); // Ascending colon
    targetCtx.bezierCurveTo(438, 615, 460, 612, 500, 615); // Hepatic flexure to Transverse colon
    targetCtx.bezierCurveTo(540, 612, 562, 615, 564, 630); // Splenic flexure
    targetCtx.lineTo(564, 725); // Descending colon
    targetCtx.bezierCurveTo(564, 750, 545, 765, 525, 778); // Sigmoid colon
    targetCtx.stroke();

    // Small Intestine (Central convoluted loops with plicae circulares)
    targetCtx.fillStyle = "#f59e0b";
    targetCtx.strokeStyle = "#d97706";
    targetCtx.lineWidth = 2;
    targetCtx.beginPath();
    targetCtx.ellipse(500, 685, 46, 42, 0, 0, Math.PI * 2);
    targetCtx.fill(); targetCtx.stroke();
    // Convoluted intestinal loops
    targetCtx.strokeStyle = "#b45309";
    targetCtx.lineWidth = 2;
    for (let c = 0; c < 5; c++) {
      targetCtx.beginPath();
      targetCtx.arc(478 + (c * 11), 675 + ((c % 2) * 16), 14, 0, Math.PI * 2);
      targetCtx.stroke();
    }

    // 10. URINARY BLADDER (Detrusor muscle reservoir)
    targetCtx.fillStyle = "#c084fc";
    targetCtx.strokeStyle = "#7e22ce";
    targetCtx.lineWidth = 2.5;
    targetCtx.beginPath();
    targetCtx.ellipse(500, 835, 24, 20, 0, 0, Math.PI * 2);
    targetCtx.fill(); targetCtx.stroke();

    targetCtx.restore();
  }

  // STRATUM 3: Skeletal Muscular System (Superficial & Deep Myology)
  function drawMuscularVector(targetCtx, view, alpha) {
    if (alpha <= 0.005) return;
    targetCtx.save();
    targetCtx.globalAlpha = Math.min(1.0, alpha);

    const muscleRed = "#dc2626";
    const muscleDark = "#991b1b";
    const fasciaWhite = "rgba(254, 226, 226, 0.75)";
    const tendonWhite = "#f8fafc";

    targetCtx.fillStyle = muscleRed;
    targetCtx.strokeStyle = muscleDark;
    targetCtx.lineWidth = 2;

    if (view === "anterior") {
      // 1. STERNOCLEIDOMASTOID (Neck strap muscles)
      targetCtx.beginPath();
      // Left SCM
      targetCtx.moveTo(462, 205); targetCtx.lineTo(470, 205); targetCtx.lineTo(494, 258); targetCtx.lineTo(486, 258);
      targetCtx.closePath();
      // Right SCM
      targetCtx.moveTo(538, 205); targetCtx.lineTo(530, 205); targetCtx.lineTo(506, 258); targetCtx.lineTo(514, 258);
      targetCtx.closePath();
      targetCtx.fill(); targetCtx.stroke();

      // 2. PECTORALIS MAJOR (Fan-shaped chest muscles with clavicular & sternocostal fiber heads)
      // Left Pectoralis Major
      targetCtx.beginPath();
      targetCtx.moveTo(492, 264); // Clavicular origin
      targetCtx.bezierCurveTo(450, 266, 400, 290, 360, 318); // Insertion into humerus
      targetCtx.bezierCurveTo(370, 345, 410, 365, 460, 365); // Inferior border
      targetCtx.bezierCurveTo(482, 365, 492, 340, 492, 264); // Sternal margin
      targetCtx.closePath();
      targetCtx.fill(); targetCtx.stroke();

      // Right Pectoralis Major
      targetCtx.beginPath();
      targetCtx.moveTo(508, 264);
      targetCtx.bezierCurveTo(550, 266, 600, 290, 640, 318);
      targetCtx.bezierCurveTo(630, 345, 590, 365, 540, 365);
      targetCtx.bezierCurveTo(518, 365, 508, 340, 508, 264);
      targetCtx.closePath();
      targetCtx.fill(); targetCtx.stroke();

      // Radiating Pectoral Muscle Fascicles
      targetCtx.strokeStyle = fasciaWhite;
      targetCtx.lineWidth = 1.2;
      targetCtx.beginPath();
      targetCtx.moveTo(490, 275); targetCtx.lineTo(375, 315);
      targetCtx.moveTo(490, 305); targetCtx.lineTo(380, 328);
      targetCtx.moveTo(485, 340); targetCtx.lineTo(390, 338);
      targetCtx.moveTo(510, 275); targetCtx.lineTo(625, 315);
      targetCtx.moveTo(510, 305); targetCtx.lineTo(620, 328);
      targetCtx.moveTo(515, 340); targetCtx.lineTo(610, 338);
      targetCtx.stroke();

      // 3. SERRATUS ANTERIOR (Sawtooth digitations on lateral ribcage)
      targetCtx.fillStyle = muscleRed;
      targetCtx.strokeStyle = muscleDark;
      targetCtx.lineWidth = 1.5;
      for (let s = 0; s < 4; s++) {
        const sy = 370 + s * 18;
        // Left slips
        targetCtx.beginPath();
        targetCtx.moveTo(395, sy); targetCtx.lineTo(418, sy + 6); targetCtx.lineTo(415, sy + 14); targetCtx.lineTo(392, sy + 8);
        targetCtx.closePath();
        targetCtx.fill(); targetCtx.stroke();
        // Right slips
        targetCtx.beginPath();
        targetCtx.moveTo(605, sy); targetCtx.lineTo(582, sy + 6); targetCtx.lineTo(585, sy + 14); targetCtx.lineTo(608, sy + 8);
        targetCtx.closePath();
        targetCtx.fill(); targetCtx.stroke();
      }

      // 4. RECTUS ABDOMINIS (Linea Alba & 4 Tendinous Intersections creating 6-pack)
      targetCtx.fillStyle = "#b91c1c";
      targetCtx.strokeStyle = muscleDark;
      targetCtx.lineWidth = 2;
      for (let ab = 0; ab < 4; ab++) {
        const aby = 465 + (ab * 48);
        // Left belly
        targetCtx.beginPath();
        targetCtx.roundRect(474, aby, 22, 42, 5);
        targetCtx.fill(); targetCtx.stroke();
        // Right belly
        targetCtx.beginPath();
        targetCtx.roundRect(504, aby, 22, 42, 5);
        targetCtx.fill(); targetCtx.stroke();
      }

      // Linea Alba (Midline fibrous tendon)
      targetCtx.strokeStyle = tendonWhite;
      targetCtx.lineWidth = 3;
      targetCtx.beginPath();
      targetCtx.moveTo(500, 445); targetCtx.lineTo(500, 675);
      targetCtx.stroke();

      // 5. EXTERNAL OBLIQUES (Flank wall with downward-sloping fibers)
      targetCtx.fillStyle = muscleRed;
      targetCtx.strokeStyle = muscleDark;
      targetCtx.lineWidth = 2;
      // Left Oblique
      targetCtx.beginPath();
      targetCtx.moveTo(418, 460); targetCtx.bezierCurveTo(405, 540, 415, 620, 435, 690);
      targetCtx.lineTo(468, 660); targetCtx.bezierCurveTo(460, 580, 458, 500, 468, 460);
      targetCtx.closePath();
      targetCtx.fill(); targetCtx.stroke();
      // Right Oblique
      targetCtx.beginPath();
      targetCtx.moveTo(582, 460); targetCtx.bezierCurveTo(595, 540, 585, 620, 565, 690);
      targetCtx.lineTo(532, 660); targetCtx.bezierCurveTo(540, 580, 542, 500, 532, 460);
      targetCtx.closePath();
      targetCtx.fill(); targetCtx.stroke();

      // 6. QUADRICEPS FEMORIS (Rectus Femoris, Vastus Lateralis, & Teardrop Vastus Medialis Oblique)
      // Left Thigh
      targetCtx.beginPath();
      // Vastus Lateralis (Sweeping lateral bulk)
      targetCtx.ellipse(432, 1030, 24, 115, -0.05, 0, Math.PI * 2);
      // Rectus Femoris (Central bipennate mass)
      targetCtx.ellipse(452, 1020, 22, 105, 0, 0, Math.PI * 2);
      // Vastus Medialis Oblique (VMO: Teardrop bulge just above medial knee)
      targetCtx.ellipse(464, 1130, 16, 38, 0.15, 0, Math.PI * 2);
      targetCtx.fill(); targetCtx.stroke();

      // Right Thigh
      targetCtx.beginPath();
      // Vastus Lateralis
      targetCtx.ellipse(568, 1030, 24, 115, 0.05, 0, Math.PI * 2);
      // Rectus Femoris
      targetCtx.ellipse(548, 1020, 22, 105, 0, 0, Math.PI * 2);
      // Vastus Medialis Oblique (VMO)
      targetCtx.ellipse(536, 1130, 16, 38, -0.15, 0, Math.PI * 2);
      targetCtx.fill(); targetCtx.stroke();

      // Patellar Tendon / Ligament
      targetCtx.fillStyle = tendonWhite;
      targetCtx.strokeStyle = "#cbd5e1";
      targetCtx.lineWidth = 2;
      targetCtx.beginPath();
      targetCtx.roundRect(432, 1205, 12, 28, 3);
      targetCtx.roundRect(556, 1205, 12, 28, 3);
      targetCtx.fill(); targetCtx.stroke();

      // 7. SARTORIUS (Longest muscle: Diagonal ribbon crossing thigh)
      targetCtx.fillStyle = "#ef4444";
      targetCtx.strokeStyle = "#b91c1c";
      targetCtx.lineWidth = 1.8;
      targetCtx.beginPath();
      targetCtx.moveTo(432, 785); targetCtx.quadraticCurveTo(450, 950, 470, 1215);
      targetCtx.lineTo(465, 1220); targetCtx.quadraticCurveTo(442, 950, 426, 785);
      targetCtx.closePath();
      targetCtx.moveTo(568, 785); targetCtx.quadraticCurveTo(550, 950, 530, 1215);
      targetCtx.lineTo(535, 1220); targetCtx.quadraticCurveTo(558, 950, 574, 785);
      targetCtx.closePath();
      targetCtx.fill(); targetCtx.stroke();

      // 8. TIBIALIS ANTERIOR (Shin muscle lateral to tibial crest)
      targetCtx.fillStyle = muscleRed;
      targetCtx.strokeStyle = muscleDark;
      targetCtx.lineWidth = 2;
      targetCtx.beginPath();
      targetCtx.ellipse(436, 1380, 14, 85, 0.02, 0, Math.PI * 2);
      targetCtx.ellipse(564, 1380, 14, 85, -0.02, 0, Math.PI * 2);
      targetCtx.fill(); targetCtx.stroke();

      // Extensor tendons over ankles to toes
      targetCtx.strokeStyle = tendonWhite;
      targetCtx.lineWidth = 2;
      targetCtx.beginPath();
      targetCtx.moveTo(436, 1470); targetCtx.lineTo(452, 1680);
      targetCtx.moveTo(564, 1470); targetCtx.lineTo(548, 1680);
      targetCtx.stroke();
    } else {
      // POSTERIOR MYOLOGY (Trapezius, Latissimus Dorsi, Gluteus Maximus, Hamstrings, Gastrocnemius)
      // 1. TRAPEZIUS (Diamond kite muscle covering neck and upper back)
      targetCtx.beginPath();
      targetCtx.moveTo(500, 155); // External occipital protuberance
      targetCtx.lineTo(410, 278); // Left acromion / spine of scapula
      targetCtx.lineTo(450, 435); // Left scapula inferior angle
      targetCtx.lineTo(500, 520); // T12 spinous process
      targetCtx.lineTo(550, 435);
      targetCtx.lineTo(590, 278);
      targetCtx.closePath();
      targetCtx.fill(); targetCtx.stroke();

      // 2. LATISSIMUS DORSI (Vast triangular muscle of lower back)
      targetCtx.beginPath();
      targetCtx.moveTo(450, 435); targetCtx.lineTo(380, 360); targetCtx.lineTo(425, 680); targetCtx.lineTo(496, 680); targetCtx.lineTo(496, 520);
      targetCtx.closePath();
      targetCtx.moveTo(550, 435); targetCtx.lineTo(620, 360); targetCtx.lineTo(575, 680); targetCtx.lineTo(504, 680); targetCtx.lineTo(504, 520);
      targetCtx.closePath();
      targetCtx.fill(); targetCtx.stroke();

      // 3. GLUTEUS MAXIMUS & MEDIUS (Most powerful muscle in human body)
      targetCtx.beginPath();
      targetCtx.ellipse(456, 815, 44, 55, -0.22, 0, Math.PI * 2);
      targetCtx.ellipse(544, 815, 44, 55, 0.22, 0, Math.PI * 2);
      targetCtx.fill(); targetCtx.stroke();

      // Coarse diagonal gluteal fiber striations
      targetCtx.strokeStyle = fasciaWhite;
      targetCtx.lineWidth = 1.5;
      targetCtx.beginPath();
      targetCtx.moveTo(492, 785); targetCtx.lineTo(435, 835);
      targetCtx.moveTo(492, 815); targetCtx.lineTo(440, 855);
      targetCtx.moveTo(508, 785); targetCtx.lineTo(565, 835);
      targetCtx.moveTo(508, 815); targetCtx.lineTo(560, 855);
      targetCtx.stroke();

      // 4. HAMSTRINGS (Biceps femoris laterally, Semitendinosus/Semimembranosus medially)
      targetCtx.fillStyle = muscleRed;
      targetCtx.strokeStyle = muscleDark;
      targetCtx.lineWidth = 2;
      targetCtx.beginPath();
      // Left Hamstring
      targetCtx.ellipse(448, 1040, 28, 115, 0, 0, Math.PI * 2);
      // Right Hamstring
      targetCtx.ellipse(552, 1040, 28, 115, 0, 0, Math.PI * 2);
      targetCtx.fill(); targetCtx.stroke();

      // Popliteal Fossa (Diamond space behind knee)
      targetCtx.fillStyle = "#7f1d1d";
      targetCtx.beginPath();
      targetCtx.ellipse(442, 1195, 12, 22, 0, 0, Math.PI * 2);
      targetCtx.ellipse(558, 1195, 12, 22, 0, 0, Math.PI * 2);
      targetCtx.fill();

      // 5. GASTROCNEMIUS & ACHILLES TENDON (Dual calf heads with asymmetric medial fullness)
      targetCtx.fillStyle = muscleRed;
      targetCtx.strokeStyle = muscleDark;
      targetCtx.lineWidth = 2;
      targetCtx.beginPath();
      // Left Calf (Medial head larger & extending lower)
      targetCtx.ellipse(432, 1345, 18, 65, -0.05, 0, Math.PI * 2); // Lateral head
      targetCtx.ellipse(452, 1370, 20, 72, 0.05, 0, Math.PI * 2); // Medial head
      // Right Calf
      targetCtx.ellipse(568, 1345, 18, 65, 0.05, 0, Math.PI * 2); // Lateral head
      targetCtx.ellipse(548, 1370, 20, 72, -0.05, 0, Math.PI * 2); // Medial head
      targetCtx.fill(); targetCtx.stroke();

      // Achilles Tendon (Tendo Calcaneus: Thickest tendon in human body)
      targetCtx.fillStyle = tendonWhite;
      targetCtx.strokeStyle = "#cbd5e1";
      targetCtx.lineWidth = 2;
      targetCtx.beginPath();
      targetCtx.roundRect(436, 1445, 14, 145, 4);
      targetCtx.roundRect(550, 1445, 14, 145, 4);
      targetCtx.fill(); targetCtx.stroke();
    }

    // DELTOIDS & UPPER LIMBS (Bilateral)
    targetCtx.fillStyle = muscleRed;
    targetCtx.strokeStyle = muscleDark;
    targetCtx.lineWidth = 2;
    // Deltoids (Wrapping shoulder cap)
    targetCtx.beginPath();
    targetCtx.ellipse(360, 310, 24, 40, -0.38, 0, Math.PI * 2);
    targetCtx.ellipse(640, 310, 24, 40, 0.38, 0, Math.PI * 2);
    targetCtx.fill(); targetCtx.stroke();

    // Biceps Brachii / Triceps (Upper arm)
    targetCtx.beginPath();
    targetCtx.ellipse(328, 410, 20, 55, -0.15, 0, Math.PI * 2);
    targetCtx.ellipse(672, 410, 20, 55, 0.15, 0, Math.PI * 2);
    targetCtx.fill(); targetCtx.stroke();

    // Forearm (Brachioradialis & Flexor/Extensor groups)
    targetCtx.beginPath();
    targetCtx.ellipse(282, 550, 18, 70, -0.22, 0, Math.PI * 2);
    targetCtx.ellipse(718, 550, 18, 70, 0.22, 0, Math.PI * 2);
    targetCtx.fill(); targetCtx.stroke();

    // Hand Muscle Bellies (Thenar & Hypothenar eminences)
    targetCtx.beginPath();
    targetCtx.ellipse(225, 745, 12, 18, -0.35, 0, Math.PI * 2);
    targetCtx.ellipse(775, 745, 12, 18, 0.35, 0, Math.PI * 2);
    targetCtx.fill(); targetCtx.stroke();

    targetCtx.restore();
  }

  // STRATUM 4: Superficial Integument & 8K Photo Skin Blending
  function drawSkinVector(targetCtx, view, alpha, skinImg, mode = "photo") {
    if (alpha <= 0.005) return;
    targetCtx.save();
    targetCtx.globalAlpha = Math.min(1.0, alpha);

    if (skinImg && skinImg.complete && skinImg.naturalWidth > 0) {
      drawPlateImageLayer(targetCtx, skinImg, alpha, mode);
    } else {
      // Dermal subsurface skin fill when photo is disabled
      const skinGrad = targetCtx.createLinearGradient(500, 65, 500, 1720);
      skinGrad.addColorStop(0, "#f3d5ba");
      skinGrad.addColorStop(0.3, "#eac2a5");
      skinGrad.addColorStop(0.6, "#dfb394");
      skinGrad.addColorStop(1.0, "#d5a585");
      targetCtx.fillStyle = skinGrad;
      buildHumanBodyPath(targetCtx);
      targetCtx.fill();
    }

    targetCtx.restore();
  }

  // STRATUM 5: Vasculature (Angiology - Pulsating Arterial & Venous Trees)
  function drawVascularVector(targetCtx, view, alpha, mode = "photo") {
    if (alpha <= 0.005 && mode !== "angiogram") return;
    targetCtx.save();
    const circAlpha = Math.min(1.0, alpha * (mode === "angiogram" ? 1.0 : 0.95));
    targetCtx.globalAlpha = circAlpha;
    const pulse = 1.0 + 0.16 * Math.sin(simTime * 8);

    // Glowing Aorta & Systemic Arteries (Vermilion Red with systolic pulse)
    targetCtx.shadowColor = "#ef4444";
    targetCtx.shadowBlur = 12 * pulse;
    targetCtx.strokeStyle = "#ef4444";
    targetCtx.lineWidth = 4 * pulse;
    targetCtx.beginPath();
    if (view === "anterior") {
      // Aortic Arch & Descending Thoracic / Abdominal Aorta
      targetCtx.arc(518, 295, 18, Math.PI * 0.95, 0);
      targetCtx.lineTo(518, 720); // Aorta to L4 bifurcation
      // Iliac Bifurcation & Femoral Arteries
      targetCtx.lineTo(475, 835); targetCtx.lineTo(440, 1050); targetCtx.lineTo(434, 1205); // Left Femoral to Popliteal
      targetCtx.lineTo(430, 1400); targetCtx.lineTo(442, 1610); targetCtx.lineTo(458, 1690); // Anterior Tibial to Dorsalis Pedis
      targetCtx.moveTo(518, 720);
      targetCtx.lineTo(561, 835); targetCtx.lineTo(560, 1050); targetCtx.lineTo(566, 1205); // Right Femoral to Popliteal
      targetCtx.lineTo(570, 1400); targetCtx.lineTo(558, 1610); targetCtx.lineTo(542, 1690);

      // Carotid Arteries & Cranial Supply
      targetCtx.moveTo(506, 290); targetCtx.lineTo(488, 195); targetCtx.lineTo(476, 145); // Left common & internal carotid
      targetCtx.moveTo(526, 290); targetCtx.lineTo(538, 195); targetCtx.lineTo(548, 145); // Right common & internal carotid

      // Subclavian, Axillary, Brachial & Radial/Ulnar Arteries to Hands
      targetCtx.moveTo(502, 292); targetCtx.lineTo(380, 310); targetCtx.lineTo(332, 450); // Left Brachial
      targetCtx.lineTo(290, 560); targetCtx.lineTo(228, 720); targetCtx.lineTo(215, 820); // Radial / Palmar arch
      targetCtx.moveTo(534, 292); targetCtx.lineTo(620, 310); targetCtx.lineTo(668, 450); // Right Brachial
      targetCtx.lineTo(710, 560); targetCtx.lineTo(772, 720); targetCtx.lineTo(785, 820); // Radial / Palmar arch

      // Celiac, Renal & Mesenteric arterial branches
      targetCtx.moveTo(518, 500); targetCtx.lineTo(475, 520); // Hepatic / Gastric
      targetCtx.moveTo(518, 500); targetCtx.lineTo(565, 505); // Splenic
      targetCtx.moveTo(518, 590); targetCtx.lineTo(452, 602); // Left Renal artery
      targetCtx.moveTo(518, 590); targetCtx.lineTo(575, 595); // Right Renal artery
    } else {
      // Posterior Vasculature
      targetCtx.moveTo(500, 310); targetCtx.lineTo(500, 720);
      targetCtx.lineTo(470, 835); targetCtx.lineTo(440, 1205); targetCtx.lineTo(430, 1580);
      targetCtx.moveTo(500, 720); targetCtx.lineTo(530, 835); targetCtx.lineTo(560, 1205); targetCtx.lineTo(570, 1580);
    }
    targetCtx.stroke();

    // Traveling Arterial Systolic Wave Packet
    const pWave = (simTime * 400) % 900;
    targetCtx.beginPath();
    targetCtx.arc(518, 295 + (pWave * 0.45), 6 * pulse, 0, Math.PI * 2);
    targetCtx.fillStyle = "#ffffff";
    targetCtx.shadowColor = "#f43f5e";
    targetCtx.shadowBlur = 18;
    targetCtx.fill();

    // Glowing Vena Cava & Major Systemic Veins (Cyan / Azure Blue)
    targetCtx.shadowColor = "#38bdf8";
    targetCtx.shadowBlur = 10;
    targetCtx.strokeStyle = "#38bdf8";
    targetCtx.lineWidth = 4;
    targetCtx.beginPath();
    if (view === "anterior") {
      // Superior Vena Cava (SVC) & Jugular veins
      targetCtx.moveTo(482, 195); targetCtx.lineTo(530, 260); // Left internal jugular
      targetCtx.moveTo(544, 195); targetCtx.lineTo(534, 260); // Right internal jugular
      targetCtx.moveTo(532, 260); targetCtx.lineTo(532, 340); // SVC to Right Atrium

      // Inferior Vena Cava (IVC) ascending alongside aorta
      targetCtx.moveTo(532, 420); targetCtx.lineTo(532, 720);
      targetCtx.lineTo(490, 835); targetCtx.lineTo(456, 1050); targetCtx.lineTo(450, 1205); // Left Common Iliac & Femoral vein
      targetCtx.moveTo(532, 720); targetCtx.lineTo(574, 835); targetCtx.lineTo(544, 1050); targetCtx.lineTo(550, 1205);

      // Great Saphenous Vein (Longest vein in human body ascending medially)
      targetCtx.moveTo(458, 1680); targetCtx.lineTo(462, 1400); targetCtx.lineTo(468, 1205); targetCtx.lineTo(476, 1000); targetCtx.lineTo(485, 850);
      targetCtx.moveTo(542, 1680); targetCtx.lineTo(538, 1400); targetCtx.lineTo(532, 1205); targetCtx.lineTo(524, 1000); targetCtx.lineTo(515, 850);

      // Cephalic & Basilic Veins of Arms
      targetCtx.moveTo(380, 315); targetCtx.lineTo(315, 480); targetCtx.lineTo(260, 680);
      targetCtx.moveTo(620, 315); targetCtx.lineTo(685, 480); targetCtx.lineTo(740, 680);
    } else {
      targetCtx.moveTo(515, 200); targetCtx.lineTo(515, 720);
      targetCtx.lineTo(485, 835); targetCtx.lineTo(455, 1205);
      targetCtx.moveTo(515, 720); targetCtx.lineTo(545, 835); targetCtx.lineTo(545, 1205);
    }
    targetCtx.stroke();
    targetCtx.restore();
  }

  // STRATUM 6: Bioelectric Nervous System Axis (Central & Peripheral Neuroaxis)
  function drawNervousVector(targetCtx, view, alpha) {
    if (alpha <= 0.005) return;
    targetCtx.save();
    targetCtx.globalAlpha = Math.min(1.0, alpha);
    targetCtx.shadowColor = "#00f0ff";
    targetCtx.shadowBlur = 14;
    targetCtx.strokeStyle = "#38bdf8";
    targetCtx.lineWidth = 3.5;

    targetCtx.beginPath();
    // 1. CEREBRUM & ENCEPHALON (Cerebral hemispheres with gyri and sulci)
    targetCtx.ellipse(500, 125, 46, 52, 0, 0, Math.PI * 2);

    // Cerebral sulci convolutions
    targetCtx.moveTo(480, 105); targetCtx.quadraticCurveTo(500, 115, 520, 105);
    targetCtx.moveTo(472, 125); targetCtx.quadraticCurveTo(500, 135, 528, 125);
    targetCtx.moveTo(475, 145); targetCtx.quadraticCurveTo(500, 155, 525, 145);

    // Cerebellum & Brainstem exiting through foramen magnum
    targetCtx.moveTo(492, 165); targetCtx.lineTo(492, 185);
    targetCtx.moveTo(508, 165); targetCtx.lineTo(508, 185);

    // 2. SPINAL CORD (With Cervical & Lumbar enlargements, conus medullaris & cauda equina)
    targetCtx.moveTo(500, 185);
    targetCtx.lineTo(500, 250); // Cervical cord
    targetCtx.lineTo(500, 715); // Thoracic & Lumbar cord to Conus Medullaris (L1/L2)
    // Cauda Equina ("Horse's tail" nerve roots streaming down dural sac)
    targetCtx.lineTo(494, 785);
    targetCtx.moveTo(500, 715); targetCtx.lineTo(506, 785);
    targetCtx.moveTo(500, 715); targetCtx.lineTo(500, 810); // Filum terminale

    // 3. BRACHIAL PLEXUS (C5-T1 roots branching to axillary, musculocutaneous, radial, median, ulnar)
    // Left Upper Limb
    targetCtx.moveTo(500, 255);
    targetCtx.bezierCurveTo(450, 270, 390, 310, 350, 345); // Roots to trunks in neck
    targetCtx.bezierCurveTo(325, 410, 305, 480, 280, 560); // Arm to forearm
    targetCtx.bezierCurveTo(260, 640, 235, 710, 218, 820); // Wrist to digital nerves
    // Right Upper Limb
    targetCtx.moveTo(500, 255);
    targetCtx.bezierCurveTo(550, 270, 610, 310, 650, 345);
    targetCtx.bezierCurveTo(675, 410, 695, 480, 720, 560);
    targetCtx.bezierCurveTo(740, 640, 765, 710, 782, 820);

    // 4. THORACIC INTERCOSTAL NERVES (Segmented subcostal nerves)
    for (let n = 0; n < 6; n++) {
      const ny = 310 + (n * 30);
      targetCtx.moveTo(500, ny); targetCtx.bezierCurveTo(475, ny + 8, 445, ny + 12, 420, ny + 20);
      targetCtx.moveTo(500, ny); targetCtx.bezierCurveTo(525, ny + 8, 555, ny + 12, 580, ny + 20);
    }

    // 5. LUMBOSACRAL PLEXUS & SCIATIC NERVES (Thickest nerve in human body)
    if (view === "anterior") {
      // Femoral & Obturator Nerves
      targetCtx.moveTo(500, 710); targetCtx.bezierCurveTo(470, 760, 448, 860, 442, 1020); targetCtx.lineTo(438, 1205);
      targetCtx.moveTo(500, 710); targetCtx.bezierCurveTo(530, 760, 552, 860, 558, 1020); targetCtx.lineTo(562, 1205);
      // Tibial & Peroneal Nerves down legs
      targetCtx.moveTo(438, 1205); targetCtx.lineTo(434, 1420); targetCtx.lineTo(445, 1640);
      targetCtx.moveTo(562, 1205); targetCtx.lineTo(566, 1420); targetCtx.lineTo(555, 1640);
    } else {
      // Massive Posterior Sciatic Nerves descending from greater sciatic foramen
      targetCtx.moveTo(492, 750);
      targetCtx.bezierCurveTo(465, 790, 452, 900, 448, 1050); // Sciatic trunk
      targetCtx.lineTo(444, 1190); // Popliteal bifurcation into Tibial & Common Fibular
      targetCtx.lineTo(438, 1420); targetCtx.lineTo(442, 1620);
      targetCtx.moveTo(444, 1190); targetCtx.lineTo(426, 1260); // Fibular branch

      targetCtx.moveTo(508, 750);
      targetCtx.bezierCurveTo(535, 790, 548, 900, 552, 1050);
      targetCtx.lineTo(556, 1190);
      targetCtx.lineTo(562, 1420); targetCtx.lineTo(558, 1620);
      targetCtx.moveTo(556, 1190); targetCtx.lineTo(574, 1260);
    }
    targetCtx.stroke();

    // Dynamic Traveling Action-Potential Bioelectric Pulse
    const apPos = (simTime * 500) % 650;
    targetCtx.beginPath();
    targetCtx.arc(500, 120 + apPos, 5, 0, Math.PI * 2);
    targetCtx.fillStyle = "#ffffff";
    targetCtx.shadowColor = "#38bdf8";
    targetCtx.shadowBlur = 20;
    targetCtx.fill();

    targetCtx.restore();
  }

  function drawHumanBodyVector(targetCtx, renderScale = 1.0, view = "anterior") {
    targetCtx.save();
    targetCtx.scale(renderScale, renderScale);

    const isFullBody = (activePlate === "full_anterior" || activePlate === "full_posterior");

    if (isFullBody) {
      // 0. MULTI-LAYER 8K ANATOMICAL DISSECTION MATRIX (Full Body Macro Studio)
      const skinImg = (view === "anterior") ? imgAnterior : imgPosterior;
      const isImgReady = skinImg && skinImg.complete && skinImg.naturalWidth > 0;

      if (isImgReady) {
        // Multi-Layer Cross-Fade & Photorealistic Medical Dissection Matrix
        const isSkeletalIsolated = (layerOpacities.skeletal > 0.6 && layerOpacities.muscular < 0.2 && layerOpacities.skin < 0.2);
        const isMuscularIsolated = (layerOpacities.muscular > 0.6 && layerOpacities.skeletal < 0.3 && layerOpacities.skin < 0.2);

        if (isSkeletalIsolated && plateImages.skeletal && plateImages.skeletal.complete) {
          drawPlateImageLayer(targetCtx, plateImages.skeletal, layerOpacities.skeletal, imagingMode);
        } else if (isMuscularIsolated && plateImages.muscular && plateImages.muscular.complete) {
          drawPlateImageLayer(targetCtx, plateImages.muscular, layerOpacities.muscular, imagingMode);
        } else {
          // Master Coronal Dissection Plate (Uncompromised 8K Clarity)
          drawPlateImageLayer(targetCtx, skinImg, 1.0, imagingMode);

          // Dynamic cross-fade blending when user emphasizes specific anatomical layers
          if (layerOpacities.skeletal > 0.35 && plateImages.skeletal && plateImages.skeletal.complete && !isMuscularIsolated) {
            targetCtx.save();
            targetCtx.globalCompositeOperation = (imagingMode === "xray") ? "screen" : "source-over";
            drawPlateImageLayer(targetCtx, plateImages.skeletal, layerOpacities.skeletal * 0.45, imagingMode);
            targetCtx.restore();
          }
          if (layerOpacities.muscular > 0.5 && plateImages.muscular && plateImages.muscular.complete && !isSkeletalIsolated) {
            targetCtx.save();
            drawPlateImageLayer(targetCtx, plateImages.muscular, layerOpacities.muscular * 0.45, imagingMode);
            targetCtx.restore();
          }
        }

        // Physiological Dynamics (Realistic cardiac systole pulse & neuroaxis signal)
        if (layerOpacities.circulatory > 0.1 && view === "anterior") {
          targetCtx.save();
          const pulse = 1.0 + 0.12 * Math.sin(simTime * 8);
          const cGrad = targetCtx.createRadialGradient(544, 507, 6, 544, 507, 50 * pulse);
          cGrad.addColorStop(0, `rgba(239, 68, 68, ${0.42 * layerOpacities.circulatory})`);
          cGrad.addColorStop(1, "rgba(239, 68, 68, 0)");
          targetCtx.fillStyle = cGrad;
          targetCtx.beginPath();
          targetCtx.arc(544, 507, 50 * pulse, 0, Math.PI * 2);
          targetCtx.fill();
          targetCtx.restore();
        }

        if (layerOpacities.nervous > 0.1) {
          targetCtx.save();
          const apPos = (simTime * 350) % 550;
          const nGrad = targetCtx.createRadialGradient(500, 260 + apPos, 2, 500, 260 + apPos, 16);
          nGrad.addColorStop(0, `rgba(56, 189, 248, ${0.65 * layerOpacities.nervous})`);
          nGrad.addColorStop(1, "rgba(56, 189, 248, 0)");
          targetCtx.fillStyle = nGrad;
          targetCtx.beginPath();
          targetCtx.arc(500, 260 + apPos, 16, 0, Math.PI * 2);
          targetCtx.fill();
          targetCtx.restore();
        }
      } else {
        targetCtx.save();
        targetCtx.fillStyle = "rgba(15, 23, 42, 0.75)";
        targetCtx.roundRect(80, 80, 840, 1640, 16);
        targetCtx.fill();
        targetCtx.fillStyle = "#38bdf8";
        targetCtx.font = "bold 26px -apple-system, sans-serif";
        targetCtx.textAlign = "center";
        targetCtx.fillText("Loading 8K Ultra-HD Anatomical Plate...", 500, 880);
        targetCtx.restore();
      }
    } else {
      // FOCUSED ORGAN / SYSTEM PLATE RENDERING
      const activeImg = plateImages[activePlate] || ((view === "anterior") ? imgAnterior : imgPosterior);
      const isImgReady = activeImg && activeImg.complete && activeImg.naturalWidth > 0;

      if (isImgReady) {
        let plateAlpha = 1.0;
        if (activePlate === "skeletal") plateAlpha = layerOpacities.skeletal;
        else if (activePlate === "muscular") plateAlpha = layerOpacities.muscular;
        else if (activePlate === "heart") plateAlpha = Math.max(layerOpacities.circulatory, layerOpacities.visceral);
        else if (activePlate === "brain") plateAlpha = layerOpacities.nervous;
        else if (activePlate === "lungs") plateAlpha = layerOpacities.visceral;
        else if (activePlate === "digestive" || activePlate === "urinary") plateAlpha = layerOpacities.visceral;
        else if (activePlate === "cranial") plateAlpha = Math.max(layerOpacities.nervous, layerOpacities.skeletal);

        // If muscular is selected, blend skeletal foundation underneath if desired
        if (activePlate === "muscular" && layerOpacities.skeletal > 0.05) {
          drawPlateImageLayer(targetCtx, plateImages.skeletal, layerOpacities.skeletal * 0.35, imagingMode);
        }

        drawPlateImageLayer(targetCtx, activeImg, plateAlpha, imagingMode);
      } else {
        targetCtx.save();
        targetCtx.fillStyle = "rgba(15, 23, 42, 0.75)";
        targetCtx.roundRect(80, 80, 840, 1640, 16);
        targetCtx.fill();
        targetCtx.fillStyle = "#38bdf8";
        targetCtx.font = "bold 26px -apple-system, sans-serif";
        targetCtx.textAlign = "center";
        const plateName = ANATOMICAL_PLATES?.[activePlate]?.name || "8K Ultra-HD Medical Anatomy Plate";
        targetCtx.fillText(`Loading ${plateName}...`, 500, 880);
        targetCtx.restore();
      }

      // Dynamic Physiological Plate Overlays:
      if (activePlate === "heart" && layerOpacities.circulatory > 0.05) {
        targetCtx.save();
        const pulse = 1.0 + 0.15 * Math.sin(simTime * 8);
        targetCtx.shadowColor = "#ef4444";
        targetCtx.shadowBlur = 24 * pulse;
        targetCtx.strokeStyle = `rgba(239, 68, 68, ${0.45 * layerOpacities.circulatory})`;
        targetCtx.lineWidth = 3 * pulse;
        targetCtx.beginPath();
        targetCtx.arc(505, 645, 50 * pulse, 0, Math.PI * 2);
        targetCtx.stroke();
        targetCtx.restore();
      }

      if (activePlate === "lungs" && layerOpacities.visceral > 0.05) {
        targetCtx.save();
        const breath = 1.0 + 0.08 * Math.sin(simTime * 2.4);
        targetCtx.shadowColor = "#34d399";
        targetCtx.shadowBlur = 20 * breath;
        targetCtx.strokeStyle = `rgba(52, 211, 153, ${0.4 * layerOpacities.visceral})`;
        targetCtx.lineWidth = 2.5 * breath;
        targetCtx.beginPath();
        targetCtx.arc(500, 630, 45 * breath, 0, Math.PI * 2);
        targetCtx.stroke();
        targetCtx.restore();
      }

      if (activePlate === "brain" && layerOpacities.nervous > 0.05) {
        targetCtx.save();
        const brainPulse = 1.0 + 0.12 * Math.sin(simTime * 5);
        targetCtx.shadowColor = "#38bdf8";
        targetCtx.shadowBlur = 18 * brainPulse;
        targetCtx.strokeStyle = `rgba(56, 189, 248, ${0.4 * layerOpacities.nervous})`;
        targetCtx.lineWidth = 2.5;
        targetCtx.beginPath();
        targetCtx.arc(310, 550, 40 * brainPulse, 0, Math.PI * 2);
        targetCtx.stroke();
        targetCtx.restore();
      }
    }

    // 4. ACTIVE STRUCTURE HIGH-PRECISION HUD RETICLE & SPOTLIGHT
    const visibleStructures = getVisibleStructures(activePlate, view);
    const structAlpha = selectedStructure ? getStructureOpacity(selectedStructure) : 0;
    const isStructureVisible = selectedStructure && visibleStructures.some(s => s.id === selectedStructure.id) && structAlpha >= 0.08;
    if (selectedStructure && isStructureVisible) {
      targetCtx.save();
      targetCtx.globalAlpha = Math.min(1.0, structAlpha);
      const sx = selectedStructure.coords.x;
      const sy = selectedStructure.coords.y;
      const now = performance.now();
      const pulse = 1.0 + 0.15 * Math.sin(now * 0.006);

      // Glowing targeting halo
      targetCtx.beginPath();
      targetCtx.arc(sx, sy, 32 * pulse, 0, Math.PI * 2);
      targetCtx.strokeStyle = "rgba(56, 189, 248, 0.75)";
      targetCtx.lineWidth = 2;
      targetCtx.setLineDash([4, 4]);
      targetCtx.stroke();

      // Corner brackets (HUD Reticle)
      targetCtx.setLineDash([]);
      targetCtx.strokeStyle = "#38bdf8";
      targetCtx.lineWidth = 2.5;
      const r = 24 * pulse;
      // Top-Left
      targetCtx.beginPath();
      targetCtx.moveTo(sx - r, sy - r + 8); targetCtx.lineTo(sx - r, sy - r); targetCtx.lineTo(sx - r + 8, sy - r);
      // Top-Right
      targetCtx.moveTo(sx + r - 8, sy - r); targetCtx.lineTo(sx + r, sy - r); targetCtx.lineTo(sx + r, sy - r + 8);
      // Bottom-Left
      targetCtx.beginPath();
      targetCtx.moveTo(sx - r, sy + r - 8); targetCtx.lineTo(sx - r, sy + r); targetCtx.lineTo(sx - r + 8, sy + r);
      // Bottom-Right
      targetCtx.moveTo(sx + r - 8, sy + r); targetCtx.lineTo(sx + r, sy + r); targetCtx.lineTo(sx + r, sy + r - 8);
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

    const visible = getVisibleStructures(activePlate, view);
    visible.forEach(s => {
      const structAlpha = getStructureOpacity(s);
      if (structAlpha < 0.08) return; // Layer is peeled/dissected away!

      const isSelected = selectedStructure && selectedStructure.id === s.id;
      const isHovered = hoveredStructure && hoveredStructure.id === s.id;
      const sys = ANATOMICAL_SYSTEMS[s.system] || { color: "#38bdf8" };

      const px = s.coords.x;
      const py = s.coords.y;

      targetCtx.save();
      targetCtx.globalAlpha = Math.min(1.0, structAlpha);

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

      targetCtx.restore();
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

    if (!hasCenteredInitialView && rect.width > 0 && rect.height > 0) {
      focusCameraOnCoords(500, 900, 1.0);
      hasCenteredInitialView = true;
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
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  };

  return _currentAtlasCleanup;
}
