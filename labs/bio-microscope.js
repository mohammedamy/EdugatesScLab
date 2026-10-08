// Edugates-ClipSAT Science Labs - Biology: Research-Grade Optical Microscope & Histology Laboratory
// Professional Microscopy Simulation: High-Definition Cellular Specimens, True Optical Depth-of-Field Blur,
// Substage Iris Diaphragm, Micrometer Scale Reticle, Cytoplasmic Streaming, and 4-Objective Turret.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

let _currentMicroscopeCleanup = null;

export function cleanupMicroscopeLab() {
  if (typeof _currentMicroscopeCleanup === "function") {
    try { _currentMicroscopeCleanup(); } catch (e) {}
    _currentMicroscopeCleanup = null;
  }
}

export function initMicroscopeLab(containerId) {
  cleanupMicroscopeLab();
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
          <span class="badge" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            Tactile Stage: Drag Eyepiece FOV Directly
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

      <!-- Real Workbench Photo View (Overlay) -->
      <div id="microscope-photo-overlay" class="lab-bench-photo-container" style="display: none;">
        <div class="bench-header">
          <div>
            <h3 style="margin: 0; font-size: 1.1rem; color: #f8fafc;">🔬 Olympus BX53 Clinical Research Microscope Station</h3>
            <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #94a3b8;">
              Infinity-corrected optical system with revolving quintuple nosepiece, plan-apochromat objectives, and Abbe condenser.
            </p>
          </div>
          <span class="badge" style="background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.4);">
            Active Lab Bench
          </span>
        </div>
        <div class="bench-photo-frame">
          <img src="assets/bench-photos/bio_microscope.jpg" alt="Research Microscope Setup" class="bench-img" loading="lazy">
          <div class="hotspot" style="top: 28%; left: 48%;" data-label="Binocular Eyepiece (10×)"></div>
          <div class="hotspot" style="top: 48%; left: 47%;" data-label="Revolving Objective Turret (4×, 10×, 40×, 100×)"></div>
          <div class="hotspot" style="top: 58%; left: 48%;" data-label="Mechanical Stage with Slide Clip"></div>
          <div class="hotspot" style="top: 66%; left: 47%;" data-label="Abbe Substage Condenser &amp; Iris"></div>
          <div class="hotspot" style="top: 75%; left: 32%;" data-label="Coaxial Coarse &amp; Fine Focus Knobs"></div>
          <div class="hotspot" style="top: 86%; left: 48%;" data-label="Field Diaphragm &amp; LED Light Source"></div>
        </div>
      </div>

      <!-- Primary Interactive Simulation View -->
      <div class="lab-grid" id="microscope-sim-view">
        <!-- Left: Microscope Optical Field of View (Canvas) -->
        <div class="lab-workspace" style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #030712; border-radius: var(--radius-md); padding: 16px; overflow: hidden; border: 1px solid var(--border-color);">
          
          <!-- Magnification & Status Badges -->
          <div style="position: absolute; top: 16px; left: 16px; z-index: 10; display: flex; flex-direction: column; gap: 6px;">
            <span class="badge" id="mag-badge" style="background: rgba(15, 23, 42, 0.85); border: 1px solid #38bdf8; color: #38bdf8; font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; backdrop-filter: blur(8px); padding: 4px 10px;">
              100× Total Magnification (10× Eyepiece × 10× Objective)
            </span>
            <span class="badge" id="oil-immersion-badge" style="display: none; background: rgba(245, 158, 11, 0.2); border: 1px solid #f59e0b; color: #fbbf24; font-size: 0.75rem; padding: 3px 8px;">
              ⚠️ Type A Immersion Oil Applied (n = 1.515)
            </span>
          </div>

          <!-- Focus Lock & Telemetry Indicator -->
          <div style="position: absolute; top: 16px; right: 16px; z-index: 10; display: flex; align-items: center; gap: 8px; background: rgba(15, 23, 42, 0.85); border: 1px solid var(--border-color); padding: 4px 12px; border-radius: 9999px; backdrop-filter: blur(8px);">
            <div id="focus-lock-dot" style="width: 9px; height: 9px; border-radius: 50%; background: #ef4444; transition: background 0.2s;"></div>
            <span id="focus-status" style="font-size: 0.78rem; font-weight: 600; color: #94a3b8;">Out of Focus</span>
          </div>

          <!-- Active Eyepiece Canvas -->
          <div style="position: relative; width: 100%; max-width: 530px; aspect-ratio: 1; display: flex; align-items: center; justify-content: center;">
            <canvas id="microscope-canvas" style="width: 100%; height: 100%; display: block; border-radius: 50%; box-shadow: 0 0 40px rgba(0,0,0,0.9), inset 0 0 20px rgba(0,0,0,0.8); cursor: grab;"></canvas>
          </div>

          <!-- Eyepiece Sub-Bar: Reticle Toggle & Micrometer Scale -->
          <div style="width: 100%; max-width: 530px; display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding: 6px 14px; background: rgba(15, 23, 42, 0.75); border-radius: 8px; border: 1px solid var(--border-color); font-size: 0.8rem;">
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; color: #cbd5e1;">
              <input type="checkbox" id="chk-reticle" checked style="accent-color: #10b981;">
              <span>Stage Micrometer Reticle</span>
            </label>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span id="scale-text" style="color: #94a3b8; font-family: 'JetBrains Mono', monospace;">Scale: 50 µm</span>
              <span id="res-disp" style="color: #38bdf8; font-family: 'JetBrains Mono', monospace;">d = 1.34 µm</span>
            </div>
          </div>

          <!-- Mechanical Stage Translation Controls (X/Y) -->
          <div style="width: 100%; max-width: 530px; margin-top: 8px; background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border-color); border-radius: 8px; padding: 8px 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 0.78rem; font-weight: 700; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.05em;">Mechanical Stage Position</span>
              <span style="font-size: 0.72rem; color: #94a3b8;">Or click and drag specimen directly in eyepiece</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <label class="control-label" style="font-size: 0.78rem;"><span>Stage X:</span> <span id="disp-stage-x">0 µm</span></label>
                <input type="range" id="input-stage-x" class="custom-slider" min="-150" max="150" value="0">
              </div>
              <div>
                <label class="control-label" style="font-size: 0.78rem;"><span>Stage Y:</span> <span id="disp-stage-y">0 µm</span></label>
                <input type="range" id="input-stage-y" class="custom-slider" min="-150" max="150" value="0">
              </div>
            </div>
          </div>
        </div>

        <!-- Controls: Turret Objectives, Coarse & Fine Focus, Diaphragm -->
        <div class="lab-controls-panel">
          <!-- Slide Selector (12 High-Definition Slides) -->
          <div class="control-group">
            <label class="control-label">
              <span>Prepared Microscope Slide (12 Research Slides)</span>
            </label>
            <select id="select-slide" class="select-input" style="font-weight: 600;">
              <optgroup label="🌱 Plant Biology &amp; Botany">
                <option value="onion_mitosis" selected>1. Allium Cepa (Onion Root Tip Mitosis &amp; Cell Cycle)</option>
                <option value="elodea_leaf">2. Elodea Canadensis (Cell Wall &amp; Active Chloroplast Cyclosis) ⚡</option>
                <option value="spirogyra_alga">3. Spirogyra Crassa (Spiral Chloroplast Ribbons &amp; Pyrenoids)</option>
                <option value="tilia_stem">4. Tilia Americana (Woody Dicot Stem Xylem &amp; Phloem)</option>
              </optgroup>
              <optgroup label="🔬 Living Protists &amp; Micro-Organisms">
                <option value="paramecium">5. Paramecium Caudatum (Metachronal Cilia &amp; Contractile Vacuoles) ⚡</option>
                <option value="amoeba_proteus">6. Amoeba Proteus (Pseudopodia &amp; Cytoplasmic Streaming) ⚡</option>
                <option value="euglena_gracilis">7. Euglena Gracilis (Flagellar Motion &amp; Photoreceptor Eyespot) ⚡</option>
                <option value="volvox_colony">8. Volvox Aureus (Coordinated Colonial Flagellates &amp; Gonidia) ⚡</option>
                <option value="daphnia_magna">9. Daphnia Magna (Water Flea Beating Heart &amp; Internal Anatomy) ⚡</option>
              </optgroup>
              <optgroup label="🩸 Human &amp; Mammalian Histology">
                <option value="human_blood">10. Human Blood Smear (Erythrocytes, Leukocytes &amp; Platelets)</option>
                <option value="human_cheek">11. Human Oral Cheek Epithelium (Methylene Blue Squamous Cells)</option>
                <option value="motor_neuron">12. Mammalian Motor Neuron Smear (Nissl Bodies &amp; Axon Hillock)</option>
              </optgroup>
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

          <!-- Contrast Staining & Illumination Filter Mode -->
          <div class="control-group">
            <label class="control-label">
              <span>Optical Illumination &amp; Contrast Mode</span>
              <span class="control-val" id="disp-filter" style="color: #38bdf8;">Brightfield</span>
            </label>
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-primary filter-btn active" data-filter="brightfield" style="flex: 1; padding: 7px 4px; font-size: 0.78rem;">☀️ Brightfield</button>
              <button class="btn btn-secondary filter-btn" data-filter="darkfield" style="flex: 1; padding: 7px 4px; font-size: 0.78rem;">🌘 Darkfield / Phase</button>
              <button class="btn btn-secondary filter-btn" data-filter="fluorescence" style="flex: 1; padding: 7px 4px; font-size: 0.78rem;">✨ Epi-Fluorescence</button>
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
          </div>

          <!-- Specimen Information Card -->
          <div class="telemetry-card" style="margin-top: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
              <span style="font-size: 0.85rem; font-weight: 700; color: #f8fafc;" id="slide-title">Allium Cepa (Onion Root Tip Mitosis)</span>
              <span class="badge" id="slide-stain-badge" style="background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4); font-size: 0.72rem;">
                Feulgen / Toluidine Blue
              </span>
            </div>
            <p id="slide-desc" style="margin: 0; font-size: 0.8rem; color: #94a3b8; line-height: 1.45;">
              Active apical meristematic tissue of Allium cepa. Observe mitotic stages: Interphase nuclei, Prophase chromosome condensation, Metaphase equatorial plate alignment, Anaphase polar separation, and Telophase cell plate formation.
            </p>
          </div>
        </div>
      </div>

      <!-- Live Optics Telemetry & Observation Suite -->
      <div class="telemetry-panel" style="margin-top: 14px; background: rgba(15, 23, 42, 0.85); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 12px 18px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
          <span style="font-size: 0.82rem; font-weight: 700; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.05em;">
            Optics Metrology &amp; Abbe Theoretical Telemetry
          </span>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary" id="btn-record-micro-trial" style="padding: 5px 12px; font-size: 0.78rem;">
              📸 Log Observation Measurement
            </button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
          <div style="background: rgba(0,0,0,0.3); border-radius: 6px; padding: 8px; border: 1px solid rgba(255,255,255,0.06);">
            <div style="font-size: 0.72rem; color: #94a3b8;">Numerical Aperture (NA)</div>
            <div id="na-disp" style="font-size: 1.05rem; font-weight: 700; color: #38bdf8; font-family: 'JetBrains Mono', monospace;">0.25</div>
          </div>
          <div style="background: rgba(0,0,0,0.3); border-radius: 6px; padding: 8px; border: 1px solid rgba(255,255,255,0.06);">
            <div style="font-size: 0.72rem; color: #94a3b8;">Abbe Limit (Resolution)</div>
            <div id="res-disp-panel" style="font-size: 1.05rem; font-weight: 700; color: #10b981; font-family: 'JetBrains Mono', monospace;">1.34 µm</div>
          </div>
          <div style="background: rgba(0,0,0,0.3); border-radius: 6px; padding: 8px; border: 1px solid rgba(255,255,255,0.06);">
            <div style="font-size: 0.72rem; color: #94a3b8;">Depth of Field (DOF)</div>
            <div id="dof-disp" style="font-size: 1.05rem; font-weight: 700; color: #f59e0b; font-family: 'JetBrains Mono', monospace;">8.5 µm</div>
          </div>
          <div style="background: rgba(0,0,0,0.3); border-radius: 6px; padding: 8px; border: 1px solid rgba(255,255,255,0.06);">
            <div style="font-size: 0.72rem; color: #94a3b8;">Working Distance</div>
            <div id="wd-disp" style="font-size: 1.05rem; font-weight: 700; color: #a855f7; font-family: 'JetBrains Mono', monospace;">10.5 mm</div>
          </div>
        </div>

        <!-- Export Data & Lab Report Buttons -->
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px;">
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
  let contrastMode = "brightfield"; // "brightfield", "darkfield", "fluorescence"
  let turretTransitionProgress = 0; // 0 to 1 for revolving nosepiece shutter effect
  let hasLockedFocus = false;
  let isDraggingStage = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let stageX0 = 0;
  let stageY0 = 0;
  let showReticle = true;
  let cyclosisAngle = 0;
  let animTime = 0;
  let animId = null;

  // Complete Encyclopedia of 12 Research-Grade Prepared Slides
  const slideData = {
    onion_mitosis: {
      title: "Allium Cepa (Onion Root Tip Mitosis)",
      stain: "Feulgen / Toluidine Blue",
      desc: "Active apical meristematic tissue of Allium cepa. Observe mitotic stages: Interphase chromatin, Prophase chromosome condensation, Metaphase equatorial plate alignment, Anaphase sister chromatid separation by mitotic spindle fibers, and Telophase phragmoplast cell plate formation."
    },
    elodea_leaf: {
      title: "Elodea Canadensis (Active Chloroplast Cyclosis)",
      stain: "Living Wet Mount (Unstained)",
      desc: "Living aquatic plant cells showcasing rigid cellulose cell walls, large central vacuoles, transvacuolar cytoplasmic strands, and vibrant photosynthetic chloroplast organelles undergoing continuous circular cyclosis driven by actin-myosin motor proteins."
    },
    spirogyra_alga: {
      title: "Spirogyra Crassa (Filamentous Green Algae)",
      stain: "Lugol's Iodine / Brightfield",
      desc: "Unbranched filamentous alga featuring stunning spiral ribbon-like chloroplasts winding through cylindrical cells. Prominent spherical pyrenoids with starch halos are spaced along chloroplast ribbons, with central nucleus suspended by delicate cytoplasmic web strands."
    },
    tilia_stem: {
      title: "Tilia Americana (Basswood 2-Year Dicot Stem)",
      stain: "Safranin & Fast Green Double Stain",
      desc: "Transverse anatomical cross-section of a woody dicotyledonous stem: central pith, lignified xylem vessels and tracheids (red Safranin) with annual rings, active vascular cambium, triangular wedge-shaped phloem fiber bundles (Fast Green), cortex, and protective periderm cork."
    },
    paramecium: {
      title: "Paramecium Caudatum (Freshwater Ciliate)",
      stain: "Phase Contrast / Methyl Green",
      desc: "Holotrichous freshwater ciliate featuring an elastic pellicle, thousands of beating cilia executing metachronal waves, deep oral groove leading to cytostome, drifting food vacuoles undergoing digestive cyclosis, and pulsating star-shaped contractile vacuoles maintaining osmoregulation."
    },
    amoeba_proteus: {
      title: "Amoeba Proteus (Pseudopodia & Phagocytosis)",
      stain: "Living Wet Mount / Phase Contrast",
      desc: "Single-celled sarcodine showcasing active amoeboid locomotion via lobose pseudopodia. Observe sol-gel cytoplasmic streaming (flowing central fluid endoplasm and viscous peripheral ectoplasm), hyaline caps at advancing tips, discoid granular nucleus, and pumping contractile vacuole."
    },
    euglena_gracilis: {
      title: "Euglena Gracilis (Flagellar Locomotion & Eyespot)",
      stain: "Living Wet Mount / Methyl Cellulose",
      desc: "Mixotrophic freshwater flagellate equipped with a flexible striated protein pellicle permitting euglenoid metaboly movement. Features a rapidly whipping emergent anterior flagellum, bright ruby-red photoreceptor eyespot (stigma), central spherical nucleus, and rod-shaped paramylon granules."
    },
    volvox_colony: {
      title: "Volvox Aureus (Motile Colonial Green Algae)",
      stain: "Vital Stained / Phase Contrast",
      desc: "Spherical motile coenobium composed of hundreds of biflagellated somatic cells connected by protoplasmic cytoplasmic bridges. Coordinated peripheral flagella produce fluid rotational swimming, while internal dark-green daughter colonies (gonidia) tumble within the hollow sphere."
    },
    daphnia_magna: {
      title: "Daphnia Magna (Planktonic Water Flea Anatomy)",
      stain: "Living Wet Mount (Transparent Carapace)",
      desc: "Translucent freshwater cladoceran micro-crustacean. Direct live visualization through the biconcave chitinous carapace reveals a rapidly beating myogenic heart (240 bpm), dark pigmented compound eye with rotating ommatidia, branching swimming antennae, green digestive tract, and brood chamber."
    },
    human_blood: {
      title: "Human Blood Smear (Wright-Giemsa Stained)",
      stain: "Wright-Giemsa Stain",
      desc: "Peripheral mammalian blood smear displaying abundant biconcave erythrocytes (red blood cells) with central pallor, multi-lobed neutrophils with lilac granules, large round-nucleus lymphocytes, pink-staining eosinophils, and tiny clustered thrombocytes (blood platelets)."
    },
    human_cheek: {
      title: "Human Oral Cheek Epithelial Cells",
      stain: "Methylene Blue Stain",
      desc: "Exfoliated stratified squamous epithelial cells harvested from oral buccal mucosa. Stained with methylene blue to reveal irregular polygonal cell margins, folded transparent cytoplasm, deep-blue prominent oval nuclei, and symbiotic oral commensal bacterial microflora."
    },
    motor_neuron: {
      title: "Multipolar Motor Neurons (Spinal Cord Smear)",
      stain: "Cresyl Violet / Silver Impregnation",
      desc: "High-magnification smear of ventral horn grey matter from mammalian spinal cord. Displays giant star-shaped multipolar motor neuron somas with extensive branching dendrites, pale clear axon hillock devoid of granules, dense purple Nissl bodies (rough ER), and surrounding neuroglial cells."
    }
  };

  // Preloaded Real Micrographs with graceful high-definition procedural fallbacks
  const slideImages = {
    onion_mitosis: new Image(),
    human_blood: new Image(),
    elodea_leaf: new Image(),
    paramecium: new Image(),
    amoeba_proteus: new Image(),
    euglena_gracilis: new Image(),
    daphnia_magna: new Image(),
    volvox_colony: new Image(),
    spirogyra_alga: new Image(),
    human_cheek: new Image(),
    tilia_stem: new Image(),
    motor_neuron: new Image()
  };
  slideImages.onion_mitosis.src = "assets/microscope/onion_mitosis.jpg";
  slideImages.human_blood.src = "assets/microscope/blood_smear.jpg";
  slideImages.elodea_leaf.src = "assets/microscope/elodea_cells.jpg";
  slideImages.paramecium.src = "assets/microscope/paramecium.jpg";
  slideImages.amoeba_proteus.src = "assets/microscope/amoeba.jpg";
  slideImages.euglena_gracilis.src = "assets/microscope/euglena.jpg";
  slideImages.daphnia_magna.src = "assets/microscope/daphnia.jpg";
  slideImages.volvox_colony.src = "assets/microscope/volvox.jpg";
  slideImages.spirogyra_alga.src = "assets/microscope/spirogyra.jpg";
  slideImages.human_cheek.src = "assets/microscope/cheek_cells.jpg";
  slideImages.tilia_stem.src = "assets/microscope/tilia_stem.jpg";
  slideImages.motor_neuron.src = "assets/microscope/motor_neuron.jpg";

  function calculateBlur() {
    const focusVal = coarseFocus + (fineFocus - 50) * 0.12;
    const diff = Math.abs(focusVal - optimalFocus);
    // NA-scaled depth of field: higher magnification & NA produces dramatically shallower focal depth
    const naMap = { 4: 0.10, 10: 0.25, 40: 0.65, 100: 1.25 };
    const na = naMap[objectivePower] || 0.25;
    const dofSensitivity = (Math.pow(na, 1.8) * (objectivePower / 10.0)) * 0.55 + 0.18;
    return Math.min(22, diff * dofSensitivity);
  }

  function drawSpecimen(centerX, centerY, radius) {
    const zoomScale = objectivePower / 10.0;
    ctx.save();
    ctx.translate(centerX + stageX * zoomScale * 0.8, centerY + stageY * zoomScale * 0.8);
    ctx.scale(zoomScale, zoomScale);

    const img = slideImages[currentSlide];
    const isImgLoaded = img && img.complete && img.naturalWidth > 0;

    if (isImgLoaded) {
      const imgSize = radius * 3.2;
      if (contrastMode === "darkfield") {
        ctx.save();
        ctx.filter = "invert(0.92) contrast(1.75) hue-rotate(180deg) brightness(1.1)";
        ctx.drawImage(img, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
        ctx.restore();
      } else if (contrastMode === "fluorescence") {
        ctx.save();
        ctx.filter = "invert(0.95) contrast(2.2) saturate(2.4) hue-rotate(240deg)";
        ctx.drawImage(img, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
        ctx.restore();
      } else {
        ctx.drawImage(img, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
      }
    }

    // Dynamic Live Overlays & Procedural Cell Rendering for all 12 Slides
    if (currentSlide === "onion_mitosis") {
      drawOnionMitosisOverlay(isImgLoaded);
    } else if (currentSlide === "human_blood") {
      drawHumanBloodOverlay(isImgLoaded);
    } else if (currentSlide === "elodea_leaf") {
      drawElodeaLeafOverlay(isImgLoaded);
    } else if (currentSlide === "paramecium") {
      drawParameciumOverlay(isImgLoaded);
    } else if (currentSlide === "amoeba_proteus") {
      drawAmoebaProteusOverlay(isImgLoaded);
    } else if (currentSlide === "euglena_gracilis") {
      drawEuglenaGracilisOverlay(isImgLoaded);
    } else if (currentSlide === "daphnia_magna") {
      drawDaphniaMagnaOverlay(isImgLoaded);
    } else if (currentSlide === "volvox_colony") {
      drawVolvoxColonyOverlay(isImgLoaded);
    } else if (currentSlide === "spirogyra_alga") {
      drawSpirogyraOverlay(isImgLoaded);
    } else if (currentSlide === "human_cheek") {
      drawHumanCheekOverlay(isImgLoaded);
    } else if (currentSlide === "tilia_stem") {
      drawTiliaStemOverlay(isImgLoaded);
    } else if (currentSlide === "motor_neuron") {
      drawMotorNeuronOverlay(isImgLoaded);
    }

    ctx.restore();
  }

  // ----------------------------------------------------
  // Slide 1: Allium Cepa (Onion Root Tip Mitosis)
  // ----------------------------------------------------
  function drawOnionMitosisOverlay(isImgLoaded) {
    if (!isImgLoaded) {
      drawOnionMitosis();
      return;
    }
    ctx.save();
    const markers = [
      { x: -75, y: -85, label: "Metaphase (Plate)", color: "#c084fc" },
      { x: 45, y: -30, label: "Anaphase (Poles)", color: "#f472b6" },
      { x: 70, y: 65, label: "Prophase (Condensing)", color: "#38bdf8" },
      { x: -65, y: 75, label: "Telophase (Cell Plate)", color: "#4ade80" },
      { x: 0, y: 5, label: "Interphase (Nucleolus)", color: "#fbbf24" }
    ];
    markers.forEach(m => {
      ctx.beginPath();
      ctx.arc(m.x, m.y, 8, 0, Math.PI * 2);
      ctx.strokeStyle = m.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      ctx.beginPath();
      ctx.roundRect(m.x + 12, m.y - 10, 135, 20, 4);
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

  function drawOnionMitosis() {
    const cellW = 85;
    const cellH = 52;
    for (let r = -4; r <= 4; r++) {
      for (let c = -4; c <= 4; c++) {
        const cx = c * cellW;
        const cy = r * cellH;

        ctx.fillStyle = (contrastMode === "darkfield") ? "rgba(15, 23, 42, 0.4)" : "rgba(240, 245, 255, 0.15)";
        ctx.fillRect(cx - cellW/2 + 2, cy - cellH/2 + 2, cellW - 4, cellH - 4);

        ctx.strokeStyle = (contrastMode === "darkfield") ? "#38bdf8" : "rgba(74, 222, 128, 0.55)";
        ctx.lineWidth = 2.5;
        ctx.strokeRect(cx - cellW/2 + 1, cy - cellH/2 + 1, cellW - 2, cellH - 2);

        const stage = Math.abs(r * 7 + c * 3) % 5;
        if (stage === 0) {
          ctx.fillStyle = (contrastMode === "fluorescence") ? "rgba(56, 189, 248, 0.9)" : "rgba(168, 85, 247, 0.65)";
          ctx.beginPath();
          ctx.arc(cx, cy, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = (contrastMode === "fluorescence") ? "#ffffff" : "#581c87";
          ctx.beginPath();
          ctx.arc(cx - 3, cy - 2, 4.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (stage === 1) {
          ctx.strokeStyle = (contrastMode === "fluorescence") ? "#60a5fa" : "#9333ea";
          ctx.lineWidth = 2.8;
          for (let k = 0; k < 7; k++) {
            ctx.beginPath();
            const ang = (k * Math.PI) / 3.5;
            ctx.moveTo(cx + Math.cos(ang) * 4, cy + Math.sin(ang) * 4);
            ctx.lineTo(cx + Math.cos(ang) * 12, cy + Math.sin(ang) * 12);
            ctx.stroke();
          }
        } else if (stage === 2) {
          ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
          ctx.lineWidth = 1;
          for (let f = -12; f <= 12; f += 4) {
            ctx.beginPath();
            ctx.moveTo(cx - 18, cy + f * 0.5);
            ctx.lineTo(cx + 18, cy);
            ctx.stroke();
          }
          ctx.fillStyle = (contrastMode === "fluorescence") ? "#c084fc" : "#6b21a8";
          for (let ch = -14; ch <= 14; ch += 5) {
            ctx.fillRect(cx - 3.5, cy + ch - 2, 7, 4.5);
          }
        } else if (stage === 3) {
          ctx.strokeStyle = (contrastMode === "fluorescence") ? "#f472b6" : "#581c87";
          ctx.lineWidth = 3;
          for (let ch = -10; ch <= 10; ch += 5) {
            ctx.beginPath();
            ctx.moveTo(cx - 16, cy + ch);
            ctx.lineTo(cx - 9, cy + ch);
            ctx.moveTo(cx + 16, cy + ch);
            ctx.lineTo(cx + 9, cy + ch);
            ctx.stroke();
          }
        } else {
          ctx.fillStyle = (contrastMode === "fluorescence") ? "#38bdf8" : "rgba(168, 85, 247, 0.75)";
          ctx.beginPath();
          ctx.arc(cx - 16, cy, 8, 0, Math.PI * 2);
          ctx.arc(cx + 16, cy, 8, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = "#4ade80";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(cx, cy - cellH/2 + 5);
          ctx.lineTo(cx, cy + cellH/2 - 5);
          ctx.stroke();
        }
      }
    }
  }

  // ----------------------------------------------------
  // Slide 2: Elodea Canadensis (Active Chloroplast Cyclosis) [ANIMATED]
  // ----------------------------------------------------
  function drawElodeaLeafOverlay(isImgLoaded) {
    if (!isImgLoaded) {
      drawElodeaLeaf();
      return;
    }
    ctx.save();
    const orbits = [
      { cx: -85, cy: -55, rx: 70, ry: 42, count: 12 },
      { cx: 75, cy: -35, rx: 75, ry: 45, count: 14 },
      { cx: -45, cy: 65, rx: 65, ry: 38, count: 11 },
      { cx: 95, cy: 75, rx: 70, ry: 40, count: 13 }
    ];

    orbits.forEach((orb, oIdx) => {
      const dir = (oIdx % 2 === 0) ? 1 : -1;
      for (let i = 0; i < orb.count; i++) {
        const ang = (cyclosisAngle * dir) + (i * Math.PI * 2) / orb.count;
        const px = orb.cx + Math.cos(ang) * orb.rx;
        const py = orb.cy + Math.sin(ang) * orb.ry;
        drawChloroplast(px, py, ang);
      }
    });
    ctx.restore();
  }

  function drawChloroplast(px, py, ang) {
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(ang + Math.PI / 2);

    if (contrastMode === "fluorescence") {
      const chGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, 7);
      chGrad.addColorStop(0, "#fca5a5");
      chGrad.addColorStop(0.5, "#ef4444");
      chGrad.addColorStop(1, "#991b1b");
      ctx.fillStyle = chGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 6.5, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (contrastMode === "darkfield") {
      ctx.fillStyle = "#86efac";
      ctx.beginPath();
      ctx.ellipse(0, 0, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#4ade80";
      ctx.lineWidth = 1;
      ctx.stroke();
    } else {
      const chGrad = ctx.createRadialGradient(-1, -1, 1, 0, 0, 7);
      chGrad.addColorStop(0, "#86efac");
      chGrad.addColorStop(0.5, "#22c55e");
      chGrad.addColorStop(1, "#15803d");
      ctx.fillStyle = chGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 6.5, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(21, 128, 61, 0.4)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-3, -1); ctx.lineTo(3, -1);
      ctx.moveTo(-3, 1); ctx.lineTo(3, 1);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawElodeaLeaf() {
    const cellW = 120;
    const cellH = 72;

    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        const cx = c * cellW;
        const cy = r * cellH;

        ctx.fillStyle = (contrastMode === "darkfield") ? "rgba(15, 23, 42, 0.5)" : "rgba(236, 253, 245, 0.12)";
        ctx.fillRect(cx - cellW/2, cy - cellH/2, cellW, cellH);

        ctx.strokeStyle = (contrastMode === "darkfield") ? "#22c55e" : "#15803d";
        ctx.lineWidth = 3.5;
        ctx.strokeRect(cx - cellW/2, cy - cellH/2, cellW, cellH);

        ctx.strokeStyle = (contrastMode === "darkfield") ? "#4ade80" : "rgba(34, 197, 94, 0.5)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx - cellW/2 + 3, cy - cellH/2 + 3, cellW - 6, cellH - 6);

        ctx.fillStyle = (contrastMode === "darkfield") ? "rgba(2, 6, 23, 0.4)" : "rgba(204, 251, 241, 0.08)";
        ctx.fillRect(cx - cellW/2 + 14, cy - cellH/2 + 12, cellW - 28, cellH - 24);
        ctx.strokeStyle = "rgba(74, 222, 128, 0.25)";
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - cellW/2 + 14, cy - cellH/2 + 12, cellW - 28, cellH - 24);

        ctx.strokeStyle = "rgba(74, 222, 128, 0.2)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx - cellW/2 + 14, cy);
        ctx.quadraticCurveTo(cx, cy + 8, cx + cellW/2 - 14, cy);
        ctx.stroke();

        const numC = 16;
        const a = cellW / 2 - 12;
        const b = cellH / 2 - 10;
        for (let i = 0; i < numC; i++) {
          const ang = cyclosisAngle + (i * Math.PI * 2) / numC;
          const chX = cx + Math.cos(ang) * a;
          const chY = cy + Math.sin(ang) * b;
          drawChloroplast(chX, chY, ang);
        }

        const bridgeT = (cyclosisAngle * 0.8 + (r + c)) % 1;
        const bX = (cx - cellW/2 + 18) + bridgeT * (cellW - 36);
        const bY = cy + Math.sin(bridgeT * Math.PI) * 8;
        drawChloroplast(bX, bY, 0);
      }
    }
  }

  // ----------------------------------------------------
  // Slide 3: Spirogyra Crassa (Spiral Chloroplast Ribbons)
  // ----------------------------------------------------
  function drawSpirogyraOverlay(isImgLoaded) {
    drawSpirogyra();
  }

  function drawSpirogyra() {
    ctx.save();
    [-70, 65].forEach(filamentY => {
      const filamentW = 380;
      const cellLen = 125;
      const cellHeight = 55;

      ctx.fillStyle = (contrastMode === "darkfield") ? "rgba(15, 23, 42, 0.4)" : "rgba(240, 253, 244, 0.15)";
      ctx.fillRect(-filamentW/2, filamentY - cellHeight/2, filamentW, cellHeight);
      ctx.strokeStyle = "#16a34a";
      ctx.lineWidth = 3;
      ctx.strokeRect(-filamentW/2, filamentY - cellHeight/2, filamentW, cellHeight);

      for (let x = -filamentW/2 + cellLen; x < filamentW/2; x += cellLen) {
        ctx.beginPath();
        ctx.moveTo(x, filamentY - cellHeight/2);
        ctx.lineTo(x, filamentY + cellHeight/2);
        ctx.stroke();

        const cellCenterX = x - cellLen / 2;
        ctx.fillStyle = (contrastMode === "fluorescence") ? "#c084fc" : "#4338ca";
        ctx.beginPath();
        ctx.arc(cellCenterX, filamentY, 8.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(74, 222, 128, 0.35)";
        ctx.lineWidth = 1;
        for (let a = 0; a < 6; a++) {
          const ang = (a * Math.PI) / 3;
          ctx.beginPath();
          ctx.moveTo(cellCenterX, filamentY);
          ctx.lineTo(cellCenterX + Math.cos(ang) * 26, filamentY + Math.sin(ang) * 22);
          ctx.stroke();
        }
      }

      ctx.strokeStyle = (contrastMode === "fluorescence") ? "#ef4444" : "#15803d";
      ctx.lineWidth = 8;
      ctx.beginPath();
      for (let px = -filamentW/2; px <= filamentW/2; px += 3) {
        const py = filamentY + Math.sin(px * 0.05) * 19;
        if (px === -filamentW/2) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      ctx.fillStyle = (contrastMode === "fluorescence") ? "#ffffff" : "#1e1b4b";
      for (let px = -filamentW/2 + 10; px <= filamentW/2; px += 24) {
        const py = filamentY + Math.sin(px * 0.05) * 19;
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#86efac";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
    ctx.restore();
  }

  // ----------------------------------------------------
  // Slide 4: Tilia Americana (Woody Dicot Stem Xylem & Phloem)
  // ----------------------------------------------------
  function drawTiliaStemOverlay(isImgLoaded) {
    drawTiliaStem();
  }

  function drawTiliaStem() {
    ctx.save();
    const centerX = 0;
    const centerY = 0;

    ctx.fillStyle = "rgba(254, 240, 138, 0.45)";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 38, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ca8a04";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.strokeStyle = "#dc2626";
    ctx.fillStyle = (contrastMode === "darkfield") ? "rgba(153, 27, 27, 0.4)" : "rgba(254, 202, 202, 0.35)";
    const vesselRadii = [55, 75, 95];
    vesselRadii.forEach(vr => {
      const count = Math.floor(vr * 0.28);
      for (let i = 0; i < count; i++) {
        const ang = (i * Math.PI * 2) / count;
        const vx = centerX + Math.cos(ang) * vr;
        const vy = centerY + Math.sin(ang) * vr;
        const vSize = (vr === 55) ? 6.5 : (vr === 75 ? 8.5 : 5.5);

        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(vx, vy, vSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    });

    ctx.strokeStyle = "rgba(185, 28, 28, 0.8)";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, 84, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 110, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = (contrastMode === "darkfield") ? "rgba(6, 78, 59, 0.6)" : "rgba(167, 243, 208, 0.5)";
    ctx.strokeStyle = "#059669";
    ctx.lineWidth = 1.5;
    for (let w = 0; w < 12; w++) {
      const wAng = (w * Math.PI) / 6;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 128, wAng - 0.12, wAng + 0.12);
      ctx.arc(centerX, centerY, 110, wAng + 0.08, wAng - 0.08, true);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.strokeStyle = "#78350f";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 134, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  // ----------------------------------------------------
  // Slide 5: Paramecium Caudatum (Freshwater Ciliate) [ANIMATED]
  // ----------------------------------------------------
  function drawParameciumOverlay(isImgLoaded) {
    if (!isImgLoaded) {
      drawParamecium();
      return;
    }
    ctx.save();
    const time = animTime * 4;
    ctx.strokeStyle = (contrastMode === "fluorescence") ? "rgba(56, 189, 248, 0.7)" : "rgba(56, 189, 248, 0.45)";
    ctx.lineWidth = 1.2;
    for (let deg = 0; deg < 360; deg += 5) {
      const rad = deg * Math.PI / 180;
      const wave = Math.sin(time * 3 + deg * 0.15) * 3.5;
      const px = Math.cos(rad) * (115 + wave);
      const py = Math.sin(rad) * (52 + wave * 0.6);
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + Math.cos(rad) * (10 + wave * 0.5), py + Math.sin(rad) * (10 + wave * 0.5));
      ctx.stroke();
    }

    drawPulsatingVacuole(-65, -10, time);
    drawPulsatingVacuole(65, 8, time + Math.PI);
    ctx.restore();
  }

  function drawPulsatingVacuole(vx, vy, phaseTime) {
    const cycle = (phaseTime % (Math.PI * 2));
    const ampullaLength = Math.max(0, Math.sin(cycle)) * 14 + 5;
    const vesicleRad = (cycle > Math.PI) ? Math.sin(cycle - Math.PI) * 7 + 4 : 4;

    ctx.save();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.5;
    for (let k = 0; k < 6; k++) {
      const vAng = (k * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(vx, vy);
      ctx.lineTo(vx + Math.cos(vAng) * ampullaLength, vy + Math.sin(vAng) * ampullaLength);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(224, 242, 254, 0.9)";
    ctx.beginPath();
    ctx.arc(vx, vy, vesicleRad, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  }

  function drawParamecium() {
    ctx.save();
    const time = animTime * 3.5;

    const bodyGrad = ctx.createRadialGradient(-15, 0, 10, 0, 0, 120);
    if (contrastMode === "darkfield") {
      bodyGrad.addColorStop(0, "rgba(30, 58, 138, 0.85)");
      bodyGrad.addColorStop(0.7, "rgba(15, 23, 42, 0.95)");
      bodyGrad.addColorStop(1, "#38bdf8");
    } else if (contrastMode === "fluorescence") {
      bodyGrad.addColorStop(0, "rgba(79, 70, 229, 0.75)");
      bodyGrad.addColorStop(0.8, "rgba(30, 27, 75, 0.9)");
      bodyGrad.addColorStop(1, "#818cf8");
    } else {
      bodyGrad.addColorStop(0, "rgba(224, 242, 254, 0.65)");
      bodyGrad.addColorStop(0.7, "rgba(186, 230, 253, 0.5)");
      bodyGrad.addColorStop(1, "rgba(56, 189, 248, 0.7)");
    }
    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.ellipse(0, 0, 118, 50, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = (contrastMode === "darkfield") ? "#7dd3fc" : "rgba(2, 132, 199, 0.6)";
    ctx.lineWidth = 1.2;
    for (let deg = 0; deg < 360; deg += 4) {
      const rad = deg * Math.PI / 180;
      const wave = Math.sin(time * 3 + deg * 0.15) * 3;
      const px = Math.cos(rad) * 118;
      const py = Math.sin(rad) * 50;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + Math.cos(rad) * (9 + wave), py + Math.sin(rad) * (9 + wave));
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(14, 165, 233, 0.45)";
    ctx.beginPath();
    ctx.ellipse(-12, 14, 38, 16, 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const fvCoords = [
      { x: -35, y: 15, col: "#22c55e", r: 6 },
      { x: -60, y: 5, col: "#ec4899", r: 5.5 },
      { x: -30, y: -18, col: "#a855f7", r: 6.5 },
      { x: 20, y: -20, col: "#f59e0b", r: 5 },
      { x: 55, y: -10, col: "#10b981", r: 6 }
    ];
    fvCoords.forEach((fv, i) => {
      const driftX = fv.x + Math.sin(time * 0.8 + i) * 3;
      const driftY = fv.y + Math.cos(time * 0.8 + i) * 2;
      ctx.fillStyle = fv.col;
      ctx.beginPath();
      ctx.arc(driftX, driftY, fv.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    ctx.fillStyle = (contrastMode === "fluorescence") ? "#c084fc" : "#4338ca";
    ctx.beginPath();
    ctx.ellipse(10, -6, 24, 13, -0.22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = (contrastMode === "fluorescence") ? "#f472b6" : "#312e81";
    ctx.beginPath();
    ctx.arc(28, -14, 4.5, 0, Math.PI * 2);
    ctx.fill();

    drawPulsatingVacuole(-68, -12, time);
    drawPulsatingVacuole(68, 10, time + Math.PI);

    ctx.restore();
  }

  // ----------------------------------------------------
  // Slide 6: Amoeba Proteus (Pseudopodia & Streaming) [ANIMATED]
  // ----------------------------------------------------
  function drawAmoebaProteusOverlay(isImgLoaded) {
    drawAmoebaProteus();
  }

  function drawAmoebaProteus() {
    ctx.save();
    const t = animTime * 1.5;

    ctx.beginPath();
    const numPoints = 64;
    for (let i = 0; i <= numPoints; i++) {
      const ang = (i / numPoints) * Math.PI * 2;
      const r1 = Math.sin(ang * 3 + t * 0.8) * 35;
      const r2 = Math.cos(ang * 5 - t * 0.5) * 18;
      const r3 = Math.sin(ang * 2 + t * 1.2) * 25;
      const rad = 100 + r1 + r2 + r3;
      const px = Math.cos(ang) * rad;
      const py = Math.sin(ang) * rad * 0.85;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    const ectoGrad = ctx.createRadialGradient(0, 0, 30, 0, 0, 140);
    if (contrastMode === "darkfield") {
      ectoGrad.addColorStop(0, "rgba(30, 58, 138, 0.4)");
      ectoGrad.addColorStop(0.8, "rgba(15, 23, 42, 0.7)");
      ectoGrad.addColorStop(1, "rgba(56, 189, 248, 0.85)");
    } else if (contrastMode === "fluorescence") {
      ectoGrad.addColorStop(0, "rgba(126, 34, 206, 0.3)");
      ectoGrad.addColorStop(0.85, "rgba(88, 28, 135, 0.6)");
      ectoGrad.addColorStop(1, "#c084fc");
    } else {
      ectoGrad.addColorStop(0, "rgba(224, 242, 254, 0.55)");
      ectoGrad.addColorStop(0.85, "rgba(186, 230, 253, 0.4)");
      ectoGrad.addColorStop(1, "rgba(56, 189, 248, 0.65)");
    }
    ctx.fillStyle = ectoGrad;
    ctx.fill();
    ctx.strokeStyle = (contrastMode === "darkfield") ? "#38bdf8" : "#0284c7";
    ctx.lineWidth = 2;
    ctx.stroke();

    const numGranules = 120;
    ctx.fillStyle = (contrastMode === "fluorescence") ? "#67e8f9" : "rgba(3, 105, 161, 0.75)";
    for (let k = 0; k < numGranules; k++) {
      const streamAngle = (k * 0.2) + Math.sin(t * 0.5 + k * 0.1) * 0.5;
      const streamDist = ((k * 3.7 + t * 40) % 110) + 10;
      const gx = Math.cos(streamAngle) * streamDist;
      const gy = Math.sin(streamAngle) * streamDist * 0.8;
      ctx.beginPath();
      ctx.arc(gx, gy, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    const nX = -25 + Math.sin(t * 0.4) * 6;
    const nY = -15 + Math.cos(t * 0.4) * 6;
    ctx.fillStyle = (contrastMode === "fluorescence") ? "#c084fc" : "#4338ca";
    ctx.beginPath();
    ctx.arc(nX, nY, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#312e81";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    for (let b = 0; b < 10; b++) {
      const bAng = (b * Math.PI) / 5;
      ctx.beginPath();
      ctx.arc(nX + Math.cos(bAng) * 11, nY + Math.sin(bAng) * 11, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    const cvPulse = Math.abs(Math.sin(t * 0.5)) * 12 + 6;
    const cvX = 35 + Math.cos(t * 0.3) * 5;
    const cvY = 20 + Math.sin(t * 0.3) * 5;
    ctx.fillStyle = "rgba(240, 249, 255, 0.85)";
    ctx.beginPath();
    ctx.arc(cvX, cvY, cvPulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const fvList = [
      { x: -50, y: 30, color: "#16a34a" },
      { x: 45, y: -40, color: "#ca8a04" },
      { x: -10, y: -60, color: "#059669" }
    ];
    fvList.forEach(fv => {
      ctx.fillStyle = "rgba(224, 231, 255, 0.6)";
      ctx.beginPath();
      ctx.arc(fv.x, fv.y, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(2, 132, 199, 0.4)";
      ctx.stroke();

      ctx.fillStyle = fv.color;
      ctx.beginPath();
      ctx.ellipse(fv.x, fv.y, 6, 3, 0.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  // ----------------------------------------------------
  // Slide 7: Euglena Gracilis (Flagellum & Eyespot) [ANIMATED]
  // ----------------------------------------------------
  function drawEuglenaGracilisOverlay(isImgLoaded) {
    drawEuglenaGracilis();
  }

  function drawEuglenaGracilis() {
    ctx.save();
    const t = animTime * 3;

    drawSingleEuglena(0, 0, 1.0, t);
    drawSingleEuglena(-120, 80, 0.65, t + 1.5);
    drawSingleEuglena(130, -70, 0.6, t + 2.8);

    ctx.restore();
  }

  function drawSingleEuglena(ox, oy, scale, t) {
    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(scale, scale);
    ctx.rotate(Math.sin(t * 0.4) * 0.15 - 0.2);

    const bodyW = 110;
    const bodyH = 34;

    const euGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 60);
    if (contrastMode === "fluorescence") {
      euGrad.addColorStop(0, "#22c55e");
      euGrad.addColorStop(0.7, "#15803d");
      euGrad.addColorStop(1, "#f43f5e");
    } else if (contrastMode === "darkfield") {
      euGrad.addColorStop(0, "rgba(34, 197, 94, 0.5)");
      euGrad.addColorStop(0.8, "rgba(15, 23, 42, 0.8)");
      euGrad.addColorStop(1, "#4ade80");
    } else {
      euGrad.addColorStop(0, "#bbf7d0");
      euGrad.addColorStop(0.5, "#4ade80");
      euGrad.addColorStop(1, "#16a34a");
    }

    ctx.fillStyle = euGrad;
    ctx.beginPath();
    ctx.moveTo(-bodyW/2, 0);
    ctx.bezierCurveTo(-bodyW/2 + 20, -bodyH/2 - 4, bodyW/2 - 25, -bodyH/2, bodyW/2, 0);
    ctx.bezierCurveTo(bodyW/2 - 25, bodyH/2, -bodyW/2 + 20, bodyH/2 + 4, -bodyW/2, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#15803d";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.strokeStyle = "rgba(21, 128, 61, 0.35)";
    ctx.lineWidth = 1;
    for (let s = -40; s <= 40; s += 10) {
      ctx.beginPath();
      ctx.moveTo(s - 12, -bodyH/2 + 4);
      ctx.quadraticCurveTo(s, 0, s + 12, bodyH/2 - 4);
      ctx.stroke();
    }

    ctx.strokeStyle = (contrastMode === "darkfield") ? "#7dd3fc" : "rgba(3, 105, 161, 0.75)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-bodyW/2, 0);
    for (let f = 1; f <= 16; f++) {
      const fx = -bodyW/2 - f * 4.5;
      const fy = Math.sin(t * 4 - f * 0.45) * (f * 1.8);
      ctx.lineTo(fx, fy);
    }
    ctx.stroke();

    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(-bodyW/2 + 16, -5, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-bodyW/2 + 15, -6, 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = (contrastMode === "fluorescence") ? "#c084fc" : "#4338ca";
    ctx.beginPath();
    ctx.arc(8, 0, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(8, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.strokeStyle = "#15803d";
    ctx.lineWidth = 1;
    const paramylons = [{ x: -14, y: 7 }, { x: 28, y: -4 }, { x: 34, y: 5 }, { x: -8, y: -7 }];
    paramylons.forEach(pm => {
      ctx.beginPath();
      ctx.ellipse(pm.x, pm.y, 7, 3.5, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    ctx.restore();
  }

  // ----------------------------------------------------
  // Slide 8: Volvox Aureus (Colonial Green Algae) [ANIMATED]
  // ----------------------------------------------------
  function drawVolvoxColonyOverlay(isImgLoaded) {
    drawVolvoxColony();
  }

  function drawVolvoxColony() {
    ctx.save();
    const t = animTime * 1.2;
    const colonyRad = 120;

    const sphGrad = ctx.createRadialGradient(-20, -20, 20, 0, 0, colonyRad);
    if (contrastMode === "fluorescence") {
      sphGrad.addColorStop(0, "rgba(22, 101, 52, 0.3)");
      sphGrad.addColorStop(0.85, "rgba(21, 128, 61, 0.6)");
      sphGrad.addColorStop(1, "#4ade80");
    } else if (contrastMode === "darkfield") {
      sphGrad.addColorStop(0, "rgba(15, 23, 42, 0.4)");
      sphGrad.addColorStop(0.85, "rgba(22, 101, 52, 0.7)");
      sphGrad.addColorStop(1, "#86efac");
    } else {
      sphGrad.addColorStop(0, "rgba(240, 253, 244, 0.3)");
      sphGrad.addColorStop(0.85, "rgba(187, 247, 208, 0.4)");
      sphGrad.addColorStop(1, "rgba(34, 197, 94, 0.7)");
    }
    ctx.fillStyle = sphGrad;
    ctx.beginPath();
    ctx.arc(0, 0, colonyRad, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#16a34a";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    const numCells = 90;
    for (let c = 0; c < numCells; c++) {
      const phi = Math.acos(-1 + (2 * c) / numCells);
      const theta = Math.sqrt(numCells * Math.PI) * phi + t * 0.4;
      const x = Math.sin(phi) * Math.cos(theta) * colonyRad * 0.95;
      const y = Math.sin(phi) * Math.sin(theta) * colonyRad * 0.95;
      const z = Math.cos(phi);

      const cellRad = 2.5 + z * 1.0;
      ctx.fillStyle = (contrastMode === "fluorescence") ? "#4ade80" : "#15803d";
      ctx.beginPath();
      ctx.arc(x, y, Math.max(1, cellRad), 0, Math.PI * 2);
      ctx.fill();

      const distFromCenter = Math.hypot(x, y);
      if (distFromCenter > colonyRad * 0.85) {
        ctx.strokeStyle = (contrastMode === "darkfield") ? "#86efac" : "rgba(34, 197, 94, 0.5)";
        ctx.lineWidth = 0.8;
        const outAng = Math.atan2(y, x);
        const fBeat = Math.sin(t * 6 + c * 0.5) * 3;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(outAng) * 10 + fBeat, y + Math.sin(outAng) * 10 - fBeat);
        ctx.stroke();
      }
    }

    const daughters = [
      { r: 24, dist: 45, angSpeed: 0.5, phase: 0 },
      { r: 30, dist: 50, angSpeed: 0.4, phase: 2.1 },
      { r: 22, dist: 55, angSpeed: 0.6, phase: 4.2 }
    ];
    daughters.forEach(d => {
      const dx = Math.cos(t * d.angSpeed + d.phase) * d.dist;
      const dy = Math.sin(t * d.angSpeed + d.phase) * d.dist;

      const dGrad = ctx.createRadialGradient(dx - 5, dy - 5, 4, dx, dy, d.r);
      dGrad.addColorStop(0, "#86efac");
      dGrad.addColorStop(0.6, "#16a34a");
      dGrad.addColorStop(1, "#14532d");
      ctx.fillStyle = dGrad;
      ctx.beginPath();
      ctx.arc(dx, dy, d.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#166534";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    ctx.restore();
  }

  // ----------------------------------------------------
  // Slide 9: Daphnia Magna (Water Flea Internal Anatomy) [ANIMATED]
  // ----------------------------------------------------
  function drawDaphniaMagnaOverlay(isImgLoaded) {
    drawDaphniaMagna();
  }

  function drawDaphniaMagna() {
    ctx.save();
    const t = animTime * 4;

    ctx.fillStyle = (contrastMode === "darkfield") ? "rgba(30, 58, 138, 0.35)" : "rgba(224, 242, 254, 0.3)";
    ctx.strokeStyle = (contrastMode === "darkfield") ? "#38bdf8" : "rgba(3, 105, 161, 0.7)";
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(-70, -35);
    ctx.bezierCurveTo(-40, -85, 60, -80, 100, -20);
    ctx.lineTo(135, 10);
    ctx.bezierCurveTo(90, 80, -20, 85, -55, 45);
    ctx.bezierCurveTo(-80, 30, -95, -10, -70, -35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(100, -20);
    ctx.lineTo(135, 10);
    ctx.lineTo(95, 25);
    ctx.stroke();

    const heartPulse = Math.sin(t * 6) * 4 + 11;
    const hX = 25;
    const hY = -52;
    ctx.fillStyle = "rgba(244, 114, 182, 0.75)";
    ctx.beginPath();
    ctx.ellipse(hX, hY, heartPulse, heartPulse * 0.75, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#db2777";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const eyeTwitch = Math.sin(t * 0.3) > 0.85 ? Math.sin(t * 8) * 2 : 0;
    const eyeX = -62 + eyeTwitch;
    const eyeY = -42;
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#38bdf8";
    for (let o = 0; o < 8; o++) {
      const oAng = (o * Math.PI) / 4;
      ctx.beginPath();
      ctx.arc(eyeX + Math.cos(oAng) * 9.5, eyeY + Math.sin(oAng) * 9.5, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = "#65a30d";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-50, -25);
    ctx.bezierCurveTo(-20, -35, 20, -30, 45, -10);
    ctx.bezierCurveTo(65, 10, 70, 40, 50, 55);
    ctx.stroke();

    ctx.strokeStyle = (contrastMode === "darkfield") ? "#93c5fd" : "#0284c7";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-55, -30);
    ctx.lineTo(-95, -70);
    ctx.lineTo(-135, -85);
    ctx.moveTo(-95, -70);
    ctx.lineTo(-130, -55);
    ctx.stroke();

    ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
    ctx.lineWidth = 1;
    for (let s = 0; s < 5; s++) {
      ctx.beginPath();
      ctx.moveTo(-100 - s * 7, -80);
      ctx.lineTo(-115 - s * 8, -95 + Math.sin(t + s) * 4);
      ctx.stroke();
    }

    const legFlutter = Math.sin(t * 3) * 6;
    ctx.strokeStyle = "rgba(2, 132, 199, 0.5)";
    ctx.lineWidth = 2;
    for (let l = 0; l < 4; l++) {
      ctx.beginPath();
      ctx.moveTo(-20 + l * 12, 10);
      ctx.lineTo(-30 + l * 12 + legFlutter, 35);
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(132, 204, 22, 0.8)";
    const eggs = [{ x: 45, y: -45 }, { x: 62, y: -38 }, { x: 50, y: -28 }];
    eggs.forEach(eg => {
      ctx.beginPath();
      ctx.arc(eg.x, eg.y, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#4d7c0f";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    ctx.restore();
  }

  // ----------------------------------------------------
  // Slide 10: Human Blood Smear (Wright-Giemsa)
  // ----------------------------------------------------
  function drawHumanBloodOverlay(isImgLoaded) {
    if (!isImgLoaded) {
      drawHumanBlood();
      return;
    }
    ctx.save();
    const markers = [
      { x: 35, y: -25, label: "Neutrophil (Multi-Lobed)", color: "#818cf8" },
      { x: -65, y: 45, label: "Lymphocyte (Agranulocyte)", color: "#c084fc" },
      { x: -10, y: -60, label: "Erythrocytes (Biconcave RBC)", color: "#f87171" },
      { x: 70, y: 60, label: "Thrombocytes (Platelets)", color: "#fbbf24" }
    ];
    markers.forEach(m => {
      ctx.beginPath();
      ctx.arc(m.x, m.y, 8, 0, Math.PI * 2);
      ctx.strokeStyle = m.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      ctx.beginPath();
      ctx.roundRect(m.x + 12, m.y - 10, 140, 20, 4);
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

  function drawHumanBlood() {
    for (let i = 0; i < 110; i++) {
      const bx = ((i * 47) % 380) - 190 + Math.sin(i * 1.7) * 8;
      const by = ((i * 73) % 380) - 190 + Math.cos(i * 2.3) * 8;
      const rad = 11.5;

      const rbcGrad = ctx.createRadialGradient(bx - 1, by - 1, 2.5, bx, by, rad);
      if (contrastMode === "fluorescence") {
        rbcGrad.addColorStop(0, "rgba(56, 189, 248, 0.2)");
        rbcGrad.addColorStop(0.6, "rgba(56, 189, 248, 0.5)");
        rbcGrad.addColorStop(1, "rgba(14, 165, 233, 0.8)");
      } else if (contrastMode === "darkfield") {
        rbcGrad.addColorStop(0, "rgba(15, 23, 42, 0.7)");
        rbcGrad.addColorStop(0.7, "rgba(30, 58, 138, 0.8)");
        rbcGrad.addColorStop(1, "#38bdf8");
      } else {
        rbcGrad.addColorStop(0, "rgba(254, 202, 202, 0.65)");
        rbcGrad.addColorStop(0.5, "rgba(239, 68, 68, 0.85)");
        rbcGrad.addColorStop(1, "rgba(185, 28, 28, 0.95)");
      }

      ctx.fillStyle = rbcGrad;
      ctx.beginPath();
      ctx.arc(bx, by, rad, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = (contrastMode === "darkfield") ? "rgba(56, 189, 248, 0.6)" : "rgba(153, 27, 27, 0.4)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    ctx.fillStyle = (contrastMode === "fluorescence") ? "#fbbf24" : "#9333ea";
    for (let p = 0; p < 24; p++) {
      const px = ((p * 37 + 15) % 340) - 170;
      const py = ((p * 61 + 25) % 340) - 170;
      ctx.beginPath();
      ctx.arc(px, py, 2.2, 0, Math.PI * 2);
      ctx.arc(px + 3, py + 2, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    const nX = 45;
    const nY = -35;
    ctx.fillStyle = (contrastMode === "darkfield") ? "rgba(30, 41, 59, 0.85)" : "rgba(224, 231, 255, 0.9)";
    ctx.beginPath();
    ctx.arc(nX, nY, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#818cf8";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = (contrastMode === "fluorescence") ? "#60a5fa" : "#3730a3";
    const lobes = [
      { x: nX - 7, y: nY - 6, r: 5.5 },
      { x: nX + 7, y: nY - 4, r: 5.2 },
      { x: nX + 3, y: nY + 7, r: 5.8 },
      { x: nX - 8, y: nY + 5, r: 4.8 }
    ];
    lobes.forEach(l => {
      ctx.beginPath();
      ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lobes[0].x, lobes[0].y);
    ctx.lineTo(lobes[1].x, lobes[1].y);
    ctx.lineTo(lobes[2].x, lobes[2].y);
    ctx.lineTo(lobes[3].x, lobes[3].y);
    ctx.stroke();

    const lX = -75;
    const lY = 55;
    ctx.fillStyle = "rgba(224, 231, 255, 0.85)";
    ctx.beginPath();
    ctx.arc(lX, lY, 17, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = (contrastMode === "fluorescence") ? "#38bdf8" : "#312e81";
    ctx.beginPath();
    ctx.arc(lX, lY, 14, 0, Math.PI * 2);
    ctx.fill();

    const eX = -40;
    const eY = -90;
    ctx.fillStyle = "rgba(254, 242, 242, 0.85)";
    ctx.beginPath();
    ctx.arc(eX, eY, 19, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f97316";
    for (let g = 0; g < 18; g++) {
      const gx = eX + Math.sin(g * 1.3) * 14;
      const gy = eY + Math.cos(g * 1.5) * 14;
      ctx.beginPath();
      ctx.arc(gx, gy, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#4338ca";
    ctx.beginPath();
    ctx.arc(eX - 6, eY, 6, 0, Math.PI * 2);
    ctx.arc(eX + 6, eY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(eX - 3, eY - 2, 6, 4);
  }

  // ----------------------------------------------------
  // Slide 11: Human Oral Cheek Squamous Epithelium
  // ----------------------------------------------------
  function drawHumanCheekOverlay(isImgLoaded) {
    drawHumanCheek();
  }

  function drawHumanCheek() {
    ctx.save();
    const cells = [
      { x: -30, y: -25, w: 140, h: 95, rot: 0.1 },
      { x: 50, y: 35, w: 150, h: 105, rot: -0.25 },
      { x: -75, y: 70, w: 130, h: 90, rot: 0.35 }
    ];

    cells.forEach(c => {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);

      ctx.beginPath();
      const pts = [
        { x: -c.w/2, y: -c.h/2 + 10 },
        { x: -c.w/4, y: -c.h/2 - 8 },
        { x: c.w/3, y: -c.h/2 + 5 },
        { x: c.w/2, y: -c.h/4 },
        { x: c.w/2 - 8, y: c.h/3 },
        { x: c.w/4, y: c.h/2 + 10 },
        { x: -c.w/3, y: c.h/2 - 4 },
        { x: -c.w/2 + 12, y: c.h/4 }
      ];
      pts.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();

      ctx.fillStyle = (contrastMode === "darkfield") ? "rgba(30, 58, 138, 0.45)" : "rgba(186, 230, 253, 0.45)";
      ctx.fill();
      ctx.strokeStyle = (contrastMode === "darkfield") ? "#38bdf8" : "#0284c7";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.strokeStyle = "rgba(2, 132, 199, 0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-c.w/3, -c.h/4);
      ctx.lineTo(c.w/4, c.h/5);
      ctx.stroke();

      ctx.fillStyle = (contrastMode === "fluorescence") ? "#60a5fa" : "#1e3a8a";
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 12, 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(2, -1, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#1e1b4b";
      for (let b = 0; b < 28; b++) {
        const bx = Math.sin(b * 2.3) * (c.w * 0.4);
        const by = Math.cos(b * 3.1) * (c.h * 0.4);
        ctx.beginPath();
        ctx.arc(bx, by, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
    ctx.restore();
  }

  // ----------------------------------------------------
  // Slide 12: Mammalian Motor Neuron Smear
  // ----------------------------------------------------
  function drawMotorNeuronOverlay(isImgLoaded) {
    drawMotorNeuron();
  }

  function drawMotorNeuron() {
    ctx.save();
    const sX = 0;
    const sY = 0;

    ctx.strokeStyle = (contrastMode === "fluorescence") ? "#818cf8" : "#4338ca";
    ctx.fillStyle = (contrastMode === "fluorescence") ? "rgba(99, 102, 241, 0.6)" : "rgba(224, 231, 255, 0.85)";
    ctx.lineWidth = 3;

    const branches = [
      { ang: 0.1, len: 140, isAxon: true },
      { ang: 1.1, len: 95, isAxon: false },
      { ang: 2.2, len: 110, isAxon: false },
      { ang: 3.3, len: 100, isAxon: false },
      { ang: 4.4, len: 115, isAxon: false },
      { ang: 5.4, len: 90, isAxon: false }
    ];

    ctx.beginPath();
    ctx.arc(sX, sY, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    branches.forEach(b => {
      const bx = Math.cos(b.ang) * b.len;
      const by = Math.sin(b.ang) * b.len;
      ctx.lineWidth = b.isAxon ? 2 : 4;
      ctx.beginPath();
      ctx.moveTo(sX + Math.cos(b.ang) * 28, sY + Math.sin(b.ang) * 28);
      ctx.lineTo(bx, by);
      ctx.stroke();

      if (!b.isAxon) {
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx * 0.6, by * 0.6);
        ctx.lineTo(bx * 0.6 + Math.cos(b.ang + 0.5) * 35, by * 0.6 + Math.sin(b.ang + 0.5) * 35);
        ctx.stroke();
      }
    });

    ctx.fillStyle = (contrastMode === "fluorescence") ? "#a5b4fc" : "#e0e7ff";
    ctx.beginPath();
    ctx.arc(sX + 22, sY + 2, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#312e81";
    for (let n = 0; n < 35; n++) {
      const nAng = (n * 1.7);
      const nDist = (n % 4) * 6 + 7;
      const nx = sX + Math.cos(nAng) * nDist;
      const ny = sY + Math.sin(nAng) * nDist;
      ctx.beginPath();
      ctx.arc(nx, ny, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = (contrastMode === "fluorescence") ? "#c084fc" : "#e0e7ff";
    ctx.beginPath();
    ctx.arc(sX - 4, sY - 2, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#3730a3";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#1e1b4b";
    ctx.beginPath();
    ctx.arc(sX - 3, sY - 2, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#4338ca";
    for (let g = 0; g < 22; g++) {
      const gx = Math.sin(g * 2.1) * 150;
      const gy = Math.cos(g * 3.3) * 150;
      ctx.beginPath();
      ctx.arc(gx, gy, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // ----------------------------------------------------
  // Circular Optical Field of View (FOV) Compositor
  // ----------------------------------------------------
  function drawView() {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = "#030712";
    ctx.fillRect(0, 0, w, h);

    const centerX = w / 2;
    const centerY = h / 2;
    const radius = Math.min(w, h) * 0.44;

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.clip();

    if (contrastMode === "darkfield") {
      ctx.fillStyle = "#02040a";
      ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
      const darkGrad = ctx.createRadialGradient(centerX, centerY, radius * 0.25, centerX, centerY, radius);
      darkGrad.addColorStop(0, "rgba(2, 6, 23, 0.95)");
      darkGrad.addColorStop(0.7, `rgba(15, 23, 42, ${irisAperture * 0.35})`);
      darkGrad.addColorStop(1, `rgba(56, 189, 248, ${irisAperture * 0.25})`);
      ctx.fillStyle = darkGrad;
      ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
    } else if (contrastMode === "fluorescence") {
      ctx.fillStyle = "#02020a";
      ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
      const uvGrad = ctx.createRadialGradient(centerX, centerY, 15, centerX, centerY, radius);
      uvGrad.addColorStop(0, `rgba(45, 27, 105, ${irisAperture * 0.55})`);
      uvGrad.addColorStop(0.7, `rgba(15, 23, 42, ${irisAperture * 0.45})`);
      uvGrad.addColorStop(1, "rgba(2, 4, 15, 0.95)");
      ctx.fillStyle = uvGrad;
      ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
    } else {
      const illGrad = ctx.createRadialGradient(centerX, centerY, 15, centerX, centerY, radius);
      illGrad.addColorStop(0, `rgba(255, 255, 248, ${irisAperture})`);
      illGrad.addColorStop(0.7, `rgba(235, 245, 255, ${irisAperture * 0.95})`);
      illGrad.addColorStop(1, `rgba(180, 205, 230, ${irisAperture * 0.7})`);
      ctx.fillStyle = illGrad;
      ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
    }

    const blurAmount = calculateBlur();
    ctx.filter = blurAmount > 0.4 ? `blur(${blurAmount.toFixed(1)}px)` : "none";

    drawSpecimen(centerX, centerY, radius);

    if (turretTransitionProgress > 0) {
      ctx.filter = "none";
      ctx.save();
      const sweepAngle = (1 - turretTransitionProgress) * Math.PI * 2;
      ctx.fillStyle = "rgba(2, 6, 23, 0.96)";
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius + 2, sweepAngle, sweepAngle + Math.PI * (1 + turretTransitionProgress * 0.5));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();

    const bezelGrad = ctx.createLinearGradient(0, centerY - radius, 0, centerY + radius);
    bezelGrad.addColorStop(0, "#475569");
    bezelGrad.addColorStop(0.5, "#1e293b");
    bezelGrad.addColorStop(1, "#090d16");

    ctx.lineWidth = 18;
    ctx.strokeStyle = bezelGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 9, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 2;
    ctx.strokeStyle = (contrastMode === "fluorescence") ? "rgba(168, 85, 247, 0.5)" : "rgba(56, 189, 248, 0.4)";
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    if (objectivePower === 100) {
      ctx.strokeStyle = "rgba(251, 191, 36, 0.45)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 2, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (showReticle) {
      ctx.strokeStyle = (contrastMode === "brightfield") ? "rgba(255, 255, 255, 0.35)" : "rgba(56, 189, 248, 0.45)";
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(centerX, centerY - radius);
      ctx.lineTo(centerX, centerY + radius);
      ctx.stroke();

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

    if (blur <= 0.45) {
      if (focusDot) focusDot.style.background = "#10b981";
      if (focusStatus) {
        focusStatus.innerText = "🎯 Focus Locked (Sub-Micron Sharpness)";
        focusStatus.style.color = "#34d399";
      }
      if (!hasLockedFocus) {
        try { SoundFX.playPop(); } catch(e) {}
        hasLockedFocus = true;
      }
    } else if (blur <= 2.8) {
      if (focusDot) focusDot.style.background = "#f59e0b";
      if (focusStatus) {
        focusStatus.innerText = "Fine Tuning Focus...";
        focusStatus.style.color = "#f59e0b";
      }
      hasLockedFocus = false;
    } else {
      if (focusDot) focusDot.style.background = "#ef4444";
      if (focusStatus) {
        focusStatus.innerText = "Out of Focus (Rotate Knobs)";
        focusStatus.style.color = "#ef4444";
      }
      hasLockedFocus = false;
    }

    const naMap = { 4: 0.10, 10: 0.25, 40: 0.65, 100: 1.25 };
    const na = naMap[objectivePower] || 0.25;
    const wavelength = 0.55;
    const res = (0.61 * wavelength) / na;

    const naDisp = document.getElementById("na-disp");
    if (naDisp) naDisp.innerText = `${na.toFixed(2)}`;
    const resDisp = document.getElementById("res-disp");
    if (resDisp) resDisp.innerText = `d = ${res.toFixed(2)} µm`;
    const resDispPanel = document.getElementById("res-disp-panel");
    if (resDispPanel) resDispPanel.innerText = `${res.toFixed(2)} µm`;

    const scaleMap = { 4: "200 µm", 10: "50 µm", 40: "12 µm", 100: "5 µm" };
    const scaleText = document.getElementById("scale-text");
    if (scaleText) scaleText.innerText = `Scale: ${scaleMap[objectivePower] || "50 µm"}`;

    const dofMap = { 4: "55 µm", 10: "8.5 µm", 40: "1.2 µm", 100: "0.4 µm" };
    const dofDisp = document.getElementById("dof-disp");
    if (dofDisp) dofDisp.innerText = dofMap[objectivePower] || "8.5 µm";

    const wdMap = { 4: "28 mm", 10: "10.5 mm", 40: "0.6 mm", 100: "0.15 mm" };
    const wdDisp = document.getElementById("wd-disp");
    if (wdDisp) wdDisp.innerText = wdMap[objectivePower] || "10.5 mm";

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
    if (turretTransitionProgress > 0) {
      turretTransitionProgress = Math.max(0, turretTransitionProgress - 0.08);
      needsRedraw = true;
    }
    // High-performance continuous animation for all 6 active organisms/cells
    const animatedSlides = [
      "elodea_leaf",
      "paramecium",
      "amoeba_proteus",
      "euglena_gracilis",
      "daphnia_magna",
      "volvox_colony"
    ];
    const hasDynamicMotion = animatedSlides.includes(currentSlide);
    if (!hasDynamicMotion && !needsRedraw && turretTransitionProgress === 0) {
      animId = requestAnimationFrame(renderLoop);
      return;
    }

    const isSmart = (document.documentElement.getAttribute("data-mode") === "smartboard") ||
                    document.documentElement.classList.contains("fast-smartboard-mode") ||
                    /Android|MAXHUB/i.test(navigator.userAgent);
    const interval = isSmart ? 33 : 16;
    if (!now || now - lastFrameTime >= interval) {
      const dt = lastFrameTime ? Math.min(0.05, (now - lastFrameTime) * 0.001) : 0.016;
      animTime += dt;
      cyclosisAngle += 0.035;
      lastFrameTime = now || performance.now();
      needsRedraw = false;
      drawView();
    }
    animId = requestAnimationFrame(renderLoop);
  }
  renderLoop();

  // Controls Binding Elements
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
    document.getElementById("disp-stage-x").innerText = `${Math.round(stageX)} µm`;
    requestRender();
  });

  inStageY.addEventListener("input", (e) => {
    stageY = parseFloat(e.target.value);
    document.getElementById("disp-stage-y").innerText = `${Math.round(stageY)} µm`;
    requestRender();
  });

  // ----------------------------------------------------
  // Direct Touch / Mouse Specimen Stage Dragging
  // ----------------------------------------------------
  function getEyepieceCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
    const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    const scaleX = (canvas.width / dpr) / rect.width;
    const scaleY = (canvas.height / dpr) / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  function isInsideFOV(x, y) {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const centerX = w / 2;
    const centerY = h / 2;
    const radius = Math.min(w, h) * 0.44;
    const dx = x - centerX;
    const dy = y - centerY;
    return (dx * dx + dy * dy) <= (radius * radius);
  }

  canvas.addEventListener("pointerdown", (e) => {
    const { x, y } = getEyepieceCoords(e);
    if (isInsideFOV(x, y)) {
      isDraggingStage = true;
      dragStartX = x;
      dragStartY = y;
      stageX0 = stageX;
      stageY0 = stageY;
      canvas.style.cursor = "grabbing";
      try { canvas.setPointerCapture(e.pointerId); } catch(err) {}
    }
  });

  canvas.addEventListener("pointermove", (e) => {
    const { x, y } = getEyepieceCoords(e);
    if (isDraggingStage) {
      const dx = x - dragStartX;
      const dy = y - dragStartY;
      const zoomScale = objectivePower / 10.0;
      const dStageX = dx / (zoomScale * 0.85);
      const dStageY = dy / (zoomScale * 0.85);
      stageX = Math.round(Math.max(-150, Math.min(150, stageX0 + dStageX)));
      stageY = Math.round(Math.max(-150, Math.min(150, stageY0 + dStageY)));

      if (inStageX) inStageX.value = stageX;
      if (inStageY) inStageY.value = stageY;
      const dispX = document.getElementById("disp-stage-x");
      const dispY = document.getElementById("disp-stage-y");
      if (dispX) dispX.innerText = `${stageX} µm`;
      if (dispY) dispY.innerText = `${stageY} µm`;

      requestRender();
      return;
    }

    if (isInsideFOV(x, y)) {
      canvas.style.cursor = "grab";
    } else {
      canvas.style.cursor = "default";
    }
  });

  canvas.addEventListener("pointerup", (e) => {
    if (isDraggingStage) {
      isDraggingStage = false;
      canvas.style.cursor = "grab";
      try { canvas.releasePointerCapture(e.pointerId); } catch(err) {}
    }
  });

  canvas.addEventListener("pointercancel", () => {
    isDraggingStage = false;
    canvas.style.cursor = "default";
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
      turretTransitionProgress = 1.0;
      try { SoundFX.playSwitchSnap(); } catch(e) {}

      const totalMag = objectivePower * 10;
      const dispObj = document.getElementById("disp-objective");
      if (dispObj) {
        dispObj.innerText = `${objectivePower}× (${objectivePower === 4 ? 'Scanning' : objectivePower === 10 ? 'Low Power' : objectivePower === 40 ? 'High Dry' : 'Oil Immersion'})`;
      }
      const magBadge = document.getElementById("mag-badge");
      if (magBadge) {
        magBadge.innerText = `${totalMag}× Total Magnification (10× Eyepiece × ${objectivePower}× Objective)`;
      }

      const oilBadge = document.getElementById("oil-immersion-badge");
      if (oilBadge) {
        oilBadge.style.display = (objectivePower === 100) ? "inline-flex" : "none";
      }

      updateTelemetry();
    });
  });

  // Contrast Filter Switcher Buttons
  container.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(".filter-btn").forEach(b => {
        b.classList.remove("btn-primary", "active");
        b.classList.add("btn-secondary");
      });
      btn.classList.remove("btn-secondary");
      btn.classList.add("btn-primary", "active");

      contrastMode = btn.dataset.filter;
      const dispFilter = document.getElementById("disp-filter");
      if (dispFilter) {
        dispFilter.innerText = contrastMode === "brightfield" ? "Brightfield" : (contrastMode === "darkfield" ? "Darkfield / Phase" : "Fluorescence");
      }
      try { SoundFX.playClick(); } catch(e) {}
      requestRender();
    });
  });

  // Slide Selection (12 Slides)
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
    try { SoundFX.playClick(); } catch(e) {}
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
    try { SoundFX.playClick(); } catch(e) {}
    requestRender();
  });

  // Reticle Toggle
  document.getElementById("chk-reticle").addEventListener("change", (e) => {
    showReticle = e.target.checked;
    requestRender();
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

  const cleanup = () => {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("resize", handleResize);
  };
  _currentMicroscopeCleanup = cleanup;
  return cleanup;
}
