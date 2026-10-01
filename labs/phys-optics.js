// Edugates-ClipSAT Science Labs - Precision Geometric & Physical Optics Laboratory
// Photorealistic Optical Rail, Anti-Reflective Coated Lenses, Spherical Curved Mirrors,
// Snell's Law & Total Internal Reflection (TIR), Cauchy Chromatic Dispersion Prism,
// Tactile Direct Dragging, Circle of Confusion Defocus Screen, and Research-Grade Telemetry.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";

let activeCleanup = null;

export function cleanupOpticsLab(containerId) {
  if (typeof activeCleanup === "function") {
    activeCleanup();
    activeCleanup = null;
  }
}

export function initOpticsLab(containerId) {
  cleanupOpticsLab(containerId);

  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="lab-container optics-layout">
      <!-- Mode & Visual Header Toolbar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding: 10px 18px; flex-wrap: wrap; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <span style="font-size: 0.88rem; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #6366f1; box-shadow: 0 0 10px #6366f1;"></span>
            Precision Geometric & Physical Optics Bench
          </span>
          <span class="badge" style="background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); color: #818cf8; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            Thorlabs Metrology Standard • Ray Tracing Suite
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <!-- Primary Apparatus Switcher -->
          <div class="lab-view-switcher" style="display: flex; border-radius: 8px; padding: 3px; background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(255,255,255,0.08);">
            <button id="optics-tab-lens" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔍 Thin Lenses
            </button>
            <button id="optics-tab-mirror" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              🪞 Curved Mirrors
            </button>
            <button id="optics-tab-snell" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              🌈 Snell / TIR / Prism
            </button>
            <button id="optics-tab-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Optical Rail
            </button>
          </div>

          <!-- Laser Collimator Toggle -->
          <label class="lab-checkbox-label" style="display: flex; align-items: center; gap: 6px; font-size: 0.78rem; cursor: pointer; user-select: none; background: rgba(16, 185, 129, 0.12); padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(16, 185, 129, 0.3);">
            <input type="checkbox" id="chk-laser" style="accent-color: #10b981; width: 14px; height: 14px;">
            <span style="color: #34d399; font-weight: 600;">Laser Collimator</span>
          </label>
        </div>
      </div>

      <!-- Main Optical Bench Canvas Viewport -->
      <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(99, 102, 241, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: #070a12; overflow: hidden; height: 500px; border-radius: 12px;">
        <canvas id="optics-bench-canvas" width="1000" height="500" style="height: 500px; width: 100%; display: block; touch-action: none; cursor: crosshair;"></canvas>

        <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
        <div id="optics-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
          <img src="assets/labs/optics_bench.jpg" alt="4K Geometric Optics Precision Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
          
          <!-- Live Analytical Telemetry Callout on Photo -->
          <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 12px; padding: 14px 20px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Calibrated Rail Base</div>
              <div style="color: #818cf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.95rem;">Extruded Anodized Aluminum Rail</div>
              <div style="font-size: 0.72rem; color: #64748b; margin-top: 2px;">Laser-etched millimeter scale</div>
            </div>
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Coated Optical Glass</div>
              <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.95rem;">Crown Glass • MgF₂ Anti-Reflection</div>
              <div style="font-size: 0.72rem; color: #64748b; margin-top: 2px;">Refractive index n = 1.520</div>
            </div>
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Observation Screen</div>
              <div style="color: #fbbf24; font-weight: 700; font-family: var(--font-mono); font-size: 0.95rem;">Frosted Glass Focal Plane</div>
              <div style="font-size: 0.72rem; color: #64748b; margin-top: 2px;">Real-time depth-of-field capture</div>
            </div>
          </div>
        </div>

        <!-- Top HUD: Status & Badges (Left) & Digital Telemetry (Right) -->
        <div class="sim-top-hud-bar" style="position: absolute; top: 12px; left: 14px; right: 14px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; pointer-events: none; z-index: 10;">
          <div class="sim-hud-badges" style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px; pointer-events: auto; max-width: 58%; min-width: 0;">
            <span class="badge" style="background: rgba(15, 23, 42, 0.92); border: 1px solid rgba(99, 102, 241, 0.4); padding: 5px 12px; border-radius: 9999px; font-family: var(--font-mono); font-size: 0.8rem; color: #818cf8; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); white-space: nowrap;">
              <span id="optics-type-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #6366f1; display: inline-block;"></span>
              <span id="optics-type-label">Converging Biconvex Lens (f = +15.0 cm)</span>
            </span>
            <span class="badge" id="image-nature-badge" style="background: rgba(16, 185, 129, 0.18); border: 1px solid rgba(16, 185, 129, 0.4); padding: 5px 12px; border-radius: 9999px; font-family: var(--font-mono); font-size: 0.8rem; color: #34d399; font-weight: 700; white-space: nowrap;">
              Real, Inverted Image (m = -1.00)
            </span>
            <span class="badge" id="focus-screen-badge" style="display: none; background: rgba(245, 158, 11, 0.2); border: 1px solid rgba(245, 158, 11, 0.5); padding: 5px 12px; border-radius: 9999px; font-family: var(--font-mono); font-size: 0.8rem; color: #fbbf24; font-weight: 700; white-space: nowrap;">
              Screen Defocused
            </span>
          </div>

          <!-- Top Right Digital Optical Telemetry -->
          <div class="sim-telemetry-dashboard" style="display: flex; gap: 10px; font-family: var(--font-mono); font-size: 0.82rem; padding: 8px 14px; border-radius: 12px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(12px); box-shadow: 0 10px 25px rgba(0,0,0,0.6); pointer-events: auto; flex-shrink: 0;">
            <div style="border-right: 1px solid rgba(255,255,255,0.1); padding-right: 10px;" id="telem-col-1">
              <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase;">Object Dist (d_o)</div>
              <div style="color: #f59e0b; font-weight: 700; font-size: 0.98rem;" id="val-do">30.0 cm</div>
            </div>
            <div style="border-right: 1px solid rgba(255,255,255,0.1); padding-right: 10px;" id="telem-col-2">
              <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase;">Image Dist (d_i)</div>
              <div style="color: #10b981; font-weight: 700; font-size: 0.98rem;" id="val-di">30.0 cm</div>
            </div>
            <div style="border-right: 1px solid rgba(255,255,255,0.1); padding-right: 10px;" id="telem-col-3">
              <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase;">Focal Length (f)</div>
              <div style="color: #818cf8; font-weight: 700; font-size: 0.98rem;" id="val-f">15.0 cm</div>
            </div>
            <div id="telem-col-4">
              <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase;">Magnification (m)</div>
              <div style="color: #38bdf8; font-weight: 700; font-size: 0.98rem;" id="val-mag">-1.00×</div>
            </div>
          </div>
        </div>

        <!-- Tactile Drag Instruction Banner -->
        <div id="optics-drag-hint" style="position: absolute; top: 72px; left: 16px; background: rgba(30, 41, 59, 0.85); backdrop-filter: blur(8px); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 8px; padding: 4px 10px; font-size: 0.73rem; color: #cbd5e1; display: flex; align-items: center; gap: 6px; pointer-events: none; z-index: 5;">
          <span>💡 Direct Touch: Drag candle base along rail (d_o) • Drag flame tip (h_o) • Drag screen</span>
        </div>

        <!-- Bottom Ray Tracing Legend Bar -->
        <div id="optics-formula-bar" class="sim-floating-formula-bar" style="position: absolute; bottom: 12px; left: 16px; right: 16px; background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 8px 18px; display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap; gap: 14px; font-size: 0.8rem; z-index: 10;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 14px; height: 3px; background: #06b6d4; border-radius: 2px;"></span>
            <span style="color: #06b6d4; font-weight: 600;">Parallel Ray:</span> Parallel to axis → Refracts through principal focus F'
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 14px; height: 3px; background: #f59e0b; border-radius: 2px;"></span>
            <span style="color: #f59e0b; font-weight: 600;">Focal Ray:</span> Passes through front focus F → Refracts parallel to axis
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 14px; height: 3px; background: #10b981; border-radius: 2px;"></span>
            <span style="color: #10b981; font-weight: 600;">Chief Central Ray:</span> Passes straight through optical vertex C undeviated
          </div>
        </div>
      </div>

      <!-- Controls Panel & Presets -->
      <div class="lab-controls-panel" style="margin-top: 18px;">
        <!-- Lens / Mirror / Snell Specific Controls -->
        <div id="controls-bench-mode" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 14px;">
          <!-- Optical Element Type -->
          <div class="control-group">
            <label class="control-label">
              <span id="label-optic-element">Optical Element</span>
            </label>
            <select id="select-optic-type" class="select-input" style="font-weight: 600; width: 100%;">
              <option value="convex_lens" selected>Convex Lens (Converging, f > 0)</option>
              <option value="concave_lens">Concave Lens (Diverging, f < 0)</option>
            </select>
          </div>

          <!-- Object Distance Slider -->
          <div class="control-group">
            <label class="control-label">
              <span id="label-slider-1">Object Distance (d_o)</span>
              <span class="control-val" id="disp-do">30.0 cm</span>
            </label>
            <input type="range" id="input-do" class="custom-slider" min="5" max="65" value="30" step="0.5">
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-dim);">
              <span>5 cm</span>
              <span style="color: #38bdf8;">F (15cm)</span>
              <span style="color: #10b981;">2F (30cm)</span>
              <span>65 cm</span>
            </div>
          </div>

          <!-- Focal Length Slider -->
          <div class="control-group" id="group-focal">
            <label class="control-label">
              <span>Focal Length (|f|)</span>
              <span class="control-val" id="disp-f" style="color: #818cf8;">15.0 cm</span>
            </label>
            <input type="range" id="input-f" class="custom-slider" min="8" max="25" value="15" step="0.5" style="accent-color: #818cf8;">
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-dim);">
              <span>8 cm</span>
              <span>15 cm</span>
              <span>25 cm</span>
            </div>
          </div>

          <!-- Object Height Slider -->
          <div class="control-group" id="group-ho">
            <label class="control-label">
              <span>Object Height (h_o)</span>
              <span class="control-val" id="disp-ho">10.0 cm</span>
            </label>
            <input type="range" id="input-ho" class="custom-slider" min="4" max="18" value="10" step="0.5">
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-dim);">
              <span>4 cm</span>
              <span>10 cm</span>
              <span>18 cm</span>
            </div>
          </div>
        </div>

        <!-- Snell / Prism Controls (Toggled in Snell Tab) -->
        <div id="controls-snell-mode" style="display: none; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 14px;">
          <!-- Medium 1 -->
          <div class="control-group">
            <label class="control-label"><span>Medium 1 (Incidence)</span></label>
            <select id="select-medium-1" class="select-input" style="font-weight: 600;">
              <option value="1.000" selected>Air (n = 1.000)</option>
              <option value="1.333">Water (n = 1.333)</option>
              <option value="1.520">Crown Glass (n = 1.520)</option>
              <option value="1.660">Flint Glass (n = 1.660)</option>
            </select>
          </div>

          <!-- Medium 2 -->
          <div class="control-group">
            <label class="control-label"><span>Medium 2 (Transmission)</span></label>
            <select id="select-medium-2" class="select-input" style="font-weight: 600;">
              <option value="1.520" selected>Crown Glass (n = 1.520)</option>
              <option value="1.333">Water (n = 1.333)</option>
              <option value="1.000">Air (n = 1.000)</option>
              <option value="1.660">Flint Glass (n = 1.660)</option>
              <option value="2.417">Diamond (n = 2.417)</option>
            </select>
          </div>

          <!-- Angle of Incidence Slider -->
          <div class="control-group">
            <label class="control-label">
              <span>Incidence Angle (θ₁)</span>
              <span class="control-val" id="disp-theta1" style="color: #10b981;">30.0°</span>
            </label>
            <input type="range" id="input-theta1" class="custom-slider" min="0" max="85" value="30" step="0.5" style="accent-color: #10b981;">
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-dim);">
              <span>0° (Normal)</span>
              <span>45°</span>
              <span>85° (Grazing)</span>
            </div>
          </div>

          <!-- Optical Shape -->
          <div class="control-group">
            <label class="control-label"><span>Interface Shape</span></label>
            <select id="select-interface-shape" class="select-input" style="font-weight: 600;">
              <option value="semicircle" selected>Semi-Circular D-Block (Normal Exit)</option>
              <option value="prism">Triangular Prism (Cauchy Rainbow Dispersion)</option>
            </select>
          </div>
        </div>

        <!-- Guided Inquiry Case Presets -->
        <div class="lab-action-buttons" style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
          <div id="presets-lens-group" style="display: flex; flex-wrap: wrap; gap: 8px;">
            <button class="btn btn-secondary" id="preset-2f" style="border-color: rgba(16, 185, 129, 0.4); color: #34d399; font-size: 0.78rem;">
              Case 1: At 2F (m = -1.0)
            </button>
            <button class="btn btn-secondary" id="preset-f-2f" style="border-color: rgba(56, 189, 248, 0.4); color: #38bdf8; font-size: 0.78rem;">
              Case 2: F to 2F (Projector)
            </button>
            <button class="btn btn-secondary" id="preset-mag-glass" style="border-color: rgba(245, 158, 11, 0.4); color: #fbbf24; font-size: 0.78rem;">
              Case 3: Inside F (Magnifier)
            </button>
            <button class="btn btn-secondary" id="preset-concave" style="border-color: rgba(139, 92, 246, 0.4); color: #c084fc; font-size: 0.78rem;">
              Case 4: Diverging Lens
            </button>
          </div>

          <div id="presets-snell-group" style="display: none; flex-wrap: wrap; gap: 8px;">
            <button class="btn btn-secondary" id="preset-refract-normal" style="border-color: rgba(56, 189, 248, 0.4); color: #38bdf8; font-size: 0.78rem;">
              Normal Refraction (Air → Glass)
            </button>
            <button class="btn btn-secondary" id="preset-tir" style="border-color: rgba(239, 68, 68, 0.4); color: #f87171; font-size: 0.78rem;">
              Total Internal Reflection (Glass → Air)
            </button>
            <button class="btn btn-secondary" id="preset-rainbow" style="border-color: rgba(245, 158, 11, 0.4); color: #fbbf24; font-size: 0.78rem;">
              Prism Rainbow Dispersion
            </button>
          </div>

          <!-- Frosted Screen Toggle & Grid Checkbox -->
          <div style="display: flex; align-items: center; gap: 14px; margin-left: auto;">
            <label id="label-chk-screen" style="display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: #f8fafc; cursor: pointer; user-select: none;">
              <input type="checkbox" id="chk-screen" checked style="accent-color: #fbbf24; width: 15px; height: 15px;">
              <span>Frosted Glass Screen</span>
            </label>

            <label style="display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: #f8fafc; cursor: pointer; user-select: none;">
              <input type="checkbox" id="chk-grid" checked style="accent-color: #38bdf8; width: 15px; height: 15px;">
              <span>Metric Ticks</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Telemetry Suite & Multi-Trial Bar -->
      <div class="lab-telemetry-suite-bar" style="margin-top: 16px;">
        <div class="lab-trials-badge-group" id="optics-trials-badge-group">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">Ray Tracing Bench Log:</span>
          <span class="lab-trial-pill trial-1" id="optics-pill-trial-1" style="opacity: 0.5;">Bench 1 (Cyan)</span>
          <span class="lab-trial-pill trial-2" id="optics-pill-trial-2" style="opacity: 0.5;">Bench 2 (Amber)</span>
          <span class="lab-trial-pill trial-3" id="optics-pill-trial-3" style="opacity: 0.5;">Bench 3 (Emerald)</span>
        </div>

        <div class="lab-export-buttons-group">
          <button class="btn btn-secondary" id="btn-record-optics-trial" style="padding: 6px 12px; font-size: 0.8rem; gap: 6px; border-color: rgba(99,102,241,0.4); color: #818cf8;">
            <span>📸 Log Optical State</span>
          </button>
          <button class="btn btn-secondary" id="btn-export-optics-csv" style="padding: 6px 12px; font-size: 0.8rem; gap: 6px;">
            <span>📥 Export CSV Data</span>
          </button>
          <button class="btn btn-primary" id="btn-open-optics-report" style="padding: 6px 14px; font-size: 0.8rem; gap: 6px; background: linear-gradient(135deg, #4f46e5, #4338ca); border: none;">
            <span>📑 Generate Lab Dossier</span>
          </button>
        </div>
      </div>

      <!-- Post-Lab Checkpoint Assessment Mount -->
      <div id="optics-checkpoint-container" style="margin-top: 20px;"></div>
    </div>
  `;

  const canvas = document.getElementById("optics-bench-canvas");
  const ctx = canvas.getContext("2d");
  const photoOverlay = document.getElementById("optics-photo-overlay");

  // State Variables
  let currentTab = "lens"; // 'lens' | 'mirror' | 'snell' | 'photo'
  let doVal = 30.0; // cm
  let fVal = 15.0; // cm
  let hoVal = 10.0; // cm
  let opticType = "convex_lens"; // 'convex_lens' | 'concave_lens' | 'concave_mirror' | 'convex_mirror'
  let showGraduations = true;
  let showScreen = true;
  let screenDist = 30.0; // cm from lens
  let laserMode = false;
  let animId = null;

  // Snell / TIR State
  let medium1Index = 1.000;
  let medium2Index = 1.520;
  let theta1Deg = 30.0;
  let interfaceShape = "semicircle"; // 'semicircle' | 'prism'

  // Drag interaction state
  let dragTarget = null; // 'object_pos' | 'object_height' | 'screen' | 'snell_source'
  let dragStartX = 0;
  let dragStartY = 0;

  const scale = 7.5; // pixels per cm

  // Calculate Image position & magnification
  function calculateImage() {
    let f = fVal;
    if (opticType === "concave_lens" || opticType === "convex_mirror") {
      f = -fVal;
    }

    if (Math.abs(doVal - f) < 0.05) {
      return { di: Infinity, m: Infinity, hi: Infinity, isReal: false, isUpright: true };
    }

    const di = (f * doVal) / (doVal - f);
    const m = -di / doVal;
    const hi = m * hoVal;
    const isReal = (opticType.includes("lens") ? di > 0 : di > 0);
    const isUpright = m > 0;

    return { di, m, hi, isReal, isUpright };
  }

  // Calculate Snell's law & TIR
  function calculateSnell() {
    const n1 = medium1Index;
    const n2 = medium2Index;
    const theta1Rad = (theta1Deg * Math.PI) / 180;
    const sinTheta2 = (n1 / n2) * Math.sin(theta1Rad);
    const tir = sinTheta2 > 1.0;
    const theta2Rad = tir ? null : Math.asin(sinTheta2);
    const theta2Deg = tir ? null : (theta2Rad * 180) / Math.PI;

    // Critical Angle
    const critAngleDeg = (n1 > n2) ? (Math.asin(n2 / n1) * 180) / Math.PI : null;

    // Fresnel reflectance estimation for normal unpolarized light
    let reflectance = 0;
    if (tir) {
      reflectance = 1.0;
    } else {
      const cos1 = Math.cos(theta1Rad);
      const cos2 = Math.cos(theta2Rad);
      const rs = Math.pow((n1 * cos1 - n2 * cos2) / (n1 * cos1 + n2 * cos2), 2);
      const rp = Math.pow((n1 * cos2 - n2 * cos1) / (n1 * cos2 + n2 * cos1), 2);
      reflectance = (rs + rp) / 2;
    }

    return { tir, theta2Deg, critAngleDeg, reflectance };
  }

  // Draw Primary Render Loop
  function draw() {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    // Dark Laboratory Ambient Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, "#070a14");
    bgGrad.addColorStop(0.5, "#0b1220");
    bgGrad.addColorStop(1, "#0f172a");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    const isSmart = (document.documentElement.getAttribute("data-mode") === "smartboard") ||
                    document.documentElement.classList.contains("fast-smartboard-mode") ||
                    /Android|MAXHUB/i.test(navigator.userAgent);

    if (currentTab === "snell") {
      drawSnellView(w, h, isSmart);
    } else {
      drawBenchView(w, h, isSmart);
    }

    ctx.restore();
  }

  // Draw Lens / Mirror Optical Rail Bench
  function drawBenchView(w, h, isSmart) {
    const centerX = w / 2;
    const centerY = h / 2 - 25;
    const railY = centerY + 130;

    // 1. Optical Rail Bench (Anodized Aluminum)
    const railGrad = ctx.createLinearGradient(0, railY, 0, railY + 35);
    railGrad.addColorStop(0, "#475569");
    railGrad.addColorStop(0.3, "#64748b");
    railGrad.addColorStop(0.7, "#334155");
    railGrad.addColorStop(1, "#1e293b");
    ctx.fillStyle = railGrad;
    ctx.fillRect(40, railY, w - 80, 28);
    ctx.strokeStyle = "rgba(99, 102, 241, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(40, railY, w - 80, 28);

    // Millimeter Metric Ticks
    if (showGraduations) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
      ctx.font = "8px JetBrains Mono, monospace";
      for (let cm = -50; cm <= 50; cm += 2) {
        const rx = centerX + cm * scale;
        if (rx >= 50 && rx <= w - 50) {
          const isMajor = (cm % 10 === 0);
          ctx.beginPath();
          ctx.moveTo(rx, railY);
          ctx.lineTo(rx, railY + (isMajor ? 10 : 5));
          ctx.stroke();

          if (isMajor) {
            ctx.fillText(`${cm > 0 ? '+' : ''}${cm}`, rx - 8, railY + 22);
          }
        }
      }
    }

    // 2. Principal Optical Axis
    ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(30, centerY);
    ctx.lineTo(w - 30, centerY);
    ctx.stroke();

    // 3. Focal Point Markers
    function drawFocalPoint(xPos, label, color = "#818cf8") {
      ctx.fillStyle = color;
      if (!isSmart) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
      }
      ctx.beginPath();
      ctx.arc(xPos, centerY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.font = "bold 11px JetBrains Mono, monospace";
      ctx.fillStyle = color;
      ctx.fillText(label, xPos - 8, centerY + 18);
    }

    const isMirror = opticType.includes("mirror");
    const fSign = (opticType === "convex_lens" || opticType === "concave_mirror") ? 1 : -1;

    if (!isMirror) {
      drawFocalPoint(centerX - fVal * scale, (fSign > 0 ? "F" : "F'"), "#818cf8");
      drawFocalPoint(centerX - 2 * fVal * scale, (fSign > 0 ? "2F" : "2F'"), "#6366f1");
      drawFocalPoint(centerX + fVal * scale, (fSign > 0 ? "F'" : "F"), "#818cf8");
      drawFocalPoint(centerX + 2 * fVal * scale, (fSign > 0 ? "2F'" : "2F"), "#6366f1");
    } else {
      // Mirror: Focal points are on the front/reflective side
      if (opticType === "concave_mirror") {
        drawFocalPoint(centerX - fVal * scale, "F", "#fbbf24");
        drawFocalPoint(centerX - 2 * fVal * scale, "C (2F)", "#f59e0b");
      } else {
        drawFocalPoint(centerX + fVal * scale, "F (Virtual)", "#c084fc");
        drawFocalPoint(centerX + 2 * fVal * scale, "C (Virtual)", "#a855f7");
      }
    }

    // 4. Optical Stand & Element
    ctx.fillStyle = "#334155";
    ctx.fillRect(centerX - 16, centerY + 105, 32, railY - (centerY + 105));
    ctx.fillStyle = "#64748b";
    ctx.fillRect(centerX - 20, centerY + 95, 40, 10);
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(centerX + 18, centerY + 100, 5, 0, Math.PI * 2);
    ctx.fill();

    // Render Optical Element (Lens or Mirror)
    ctx.save();
    if (opticType === "convex_lens") {
      const lensGrad = ctx.createLinearGradient(centerX - 14, 0, centerX + 14, 0);
      lensGrad.addColorStop(0, "rgba(56, 189, 248, 0.45)");
      lensGrad.addColorStop(0.3, "rgba(255, 255, 255, 0.2)");
      lensGrad.addColorStop(0.7, "rgba(16, 185, 129, 0.15)");
      lensGrad.addColorStop(1, "rgba(56, 189, 248, 0.55)");

      ctx.fillStyle = lensGrad;
      if (!isSmart) {
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 12;
      }
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 15, 115, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else if (opticType === "concave_lens") {
      const cGrad = ctx.createLinearGradient(centerX - 12, 0, centerX + 12, 0);
      cGrad.addColorStop(0, "rgba(139, 92, 246, 0.45)");
      cGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.15)");
      cGrad.addColorStop(1, "rgba(139, 92, 246, 0.55)");

      ctx.fillStyle = cGrad;
      ctx.beginPath();
      ctx.moveTo(centerX - 14, centerY - 115);
      ctx.lineTo(centerX + 14, centerY - 115);
      ctx.quadraticCurveTo(centerX + 3, centerY, centerX + 14, centerY + 115);
      ctx.lineTo(centerX - 14, centerY + 115);
      ctx.quadraticCurveTo(centerX - 3, centerY, centerX - 14, centerY - 115);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (opticType === "concave_mirror") {
      // Curved Concave Mirror
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 5;
      if (!isSmart) {
        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = 10;
      }
      ctx.beginPath();
      ctx.arc(centerX + 80, centerY, 90, Math.PI * 0.72, Math.PI * 1.28);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Silver backing hatch lines
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 1.5;
      for (let a = 0.75; a <= 1.25; a += 0.05) {
        const mx = (centerX + 80) + 90 * Math.cos(Math.PI * a);
        const my = centerY + 90 * Math.sin(Math.PI * a);
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(mx + 6, my - 4);
        ctx.stroke();
      }
    } else if (opticType === "convex_mirror") {
      // Curved Convex Mirror
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 5;
      if (!isSmart) {
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 10;
      }
      ctx.beginPath();
      ctx.arc(centerX - 80, centerY, 90, -Math.PI * 0.28, Math.PI * 0.28);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Silver backing hatch lines
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 1.5;
      for (let a = -0.25; a <= 0.25; a += 0.05) {
        const mx = (centerX - 80) + 90 * Math.cos(Math.PI * a);
        const my = centerY + 90 * Math.sin(Math.PI * a);
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(mx - 6, my - 4);
        ctx.stroke();
      }
    }
    ctx.restore();

    // 5. Object (Candle or Collimated Laser Array)
    const objX = centerX - doVal * scale;
    const objY = centerY;
    const objH = hoVal * scale;

    // Highlight / Drag Halo around Object Base
    ctx.save();
    ctx.strokeStyle = "rgba(245, 158, 11, 0.45)";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(objX - 16, railY - 22, 32, 26);
    ctx.setLineDash([]);
    ctx.restore();

    if (laserMode) {
      // Laser Diode Array
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(objX - 25, centerY - 45, 25, 90);
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(objX - 25, centerY - 45, 25, 90);

      // Apertures and beams
      [-30, 0, 30].forEach(dy => {
        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.arc(objX, centerY + dy, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(52, 211, 153, 0.9)";
        ctx.lineWidth = 2.5;
        if (!isSmart) {
          ctx.shadowColor = "#34d399";
          ctx.shadowBlur = 10;
        }
        ctx.beginPath();
        ctx.moveTo(objX, centerY + dy);
        ctx.lineTo(centerX, centerY + dy);

        if (!isMirror) {
          const fR = (opticType === "convex_lens") ? (centerX + fVal * scale) : (centerX - fVal * scale);
          const slope = (centerY - (centerY + dy)) / (fR - centerX);
          ctx.lineTo(w - 40, (centerY + dy) + slope * (w - 40 - centerX));
        } else {
          // Mirror reflections
          const fM = (opticType === "concave_mirror") ? (centerX - fVal * scale) : (centerX + fVal * scale);
          const slope = (centerY - (centerY + dy)) / (fM - centerX);
          ctx.lineTo(40, (centerY + dy) - slope * (centerX - 40));
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      });
    } else {
      // Candle Stand & Body
      ctx.fillStyle = "#334155";
      ctx.fillRect(objX - 10, railY - 15, 20, 15);
      ctx.fillStyle = "#fef08a";
      ctx.fillRect(objX - 6, objY - objH * 0.75, 12, objH * 0.75);
      ctx.strokeStyle = "#eab308";
      ctx.lineWidth = 1;
      ctx.strokeRect(objX - 6, objY - objH * 0.75, 12, objH * 0.75);

      // Wick
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(objX, objY - objH * 0.75);
      ctx.lineTo(objX, objY - objH * 0.75 - 4);
      ctx.stroke();

      // Flame with flicker
      const flameFlicker = isSmart ? 0 : (Math.sin(Date.now() / 120) * 1.5);
      const flameY = objY - objH - flameFlicker;

      const flameGrad = ctx.createRadialGradient(objX, flameY + 6, 2, objX, flameY + 4, 14);
      flameGrad.addColorStop(0, "#ffffff");
      flameGrad.addColorStop(0.3, "#fef08a");
      flameGrad.addColorStop(0.7, "#f59e0b");
      flameGrad.addColorStop(1, "rgba(239, 68, 68, 0)");

      ctx.fillStyle = flameGrad;
      if (!isSmart) {
        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = 18;
      }
      ctx.beginPath();
      ctx.ellipse(objX, flameY + 4, 6, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Flame Tip Tactile Handle
      ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(objX, flameY, 8, 0, Math.PI * 2);
      ctx.stroke();

      // 6. Principal Ray Tracing
      const img = calculateImage();
      const tipX = objX;
      const tipY = objY - objH;

      if (Math.abs(doVal - fVal) > 0.05 && isFinite(img.di)) {
        const imgX = !isMirror ? (centerX + img.di * scale) : (centerX - img.di * scale);
        const imgY = centerY - img.hi * scale;

        // RAY 1: Parallel Ray (Cyan)
        ctx.strokeStyle = "#06b6d4";
        ctx.lineWidth = 2.5;
        if (!isSmart) {
          ctx.shadowColor = "#06b6d4";
          ctx.shadowBlur = 8;
        }
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(centerX, tipY);

        if (!isMirror) {
          if (opticType === "convex_lens") {
            if (img.isReal) {
              ctx.lineTo(imgX, imgY);
            } else {
              const slope = (tipY - centerY) / (-fVal * scale);
              ctx.lineTo(w - 40, tipY + slope * (w - 40 - centerX));
            }
          } else {
            const slope = (tipY - centerY) / (fVal * scale);
            ctx.lineTo(w - 40, tipY + slope * (w - 40 - centerX));
          }
        } else {
          // Mirror Parallel Ray: Reflects through focus F
          if (opticType === "concave_mirror") {
            ctx.lineTo(imgX, imgY);
            ctx.lineTo(40, imgY);
          } else {
            const slope = (tipY - centerY) / (fVal * scale);
            ctx.lineTo(40, tipY + slope * (40 - centerX));
          }
        }
        ctx.stroke();

        // RAY 2: Focal Ray (Amber)
        ctx.strokeStyle = "#f59e0b";
        ctx.shadowColor = "#f59e0b";
        ctx.beginPath();
        if (!isMirror) {
          if (opticType === "convex_lens" && img.isReal) {
            const fLeftX = centerX - fVal * scale;
            const slope = (centerY - tipY) / (fLeftX - tipX);
            const lensY = tipY + slope * (centerX - tipX);
            ctx.moveTo(tipX, tipY);
            ctx.lineTo(centerX, lensY);
            ctx.lineTo(imgX, imgY);
            ctx.lineTo(w - 40, imgY);
          }
        } else if (opticType === "concave_mirror" && img.isReal) {
          const fX = centerX - fVal * scale;
          const slope = (centerY - tipY) / (fX - tipX);
          const mirrorY = tipY + slope * (centerX - tipX);
          ctx.moveTo(tipX, tipY);
          ctx.lineTo(centerX, mirrorY);
          ctx.lineTo(imgX, imgY);
          ctx.lineTo(40, imgY);
        }
        ctx.stroke();

        // RAY 3: Central / Vertex Chief Ray (Emerald)
        ctx.strokeStyle = "#10b981";
        ctx.shadowColor = "#10b981";
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(centerX, centerY);
        if (!isMirror) {
          if (img.isReal) {
            ctx.lineTo(imgX, imgY);
          } else {
            const cSlope = (centerY - tipY) / (centerX - tipX);
            ctx.lineTo(w - 40, centerY + cSlope * (w - 40 - centerX));
          }
        } else {
          // Reflects symmetrically at vertex (angle of incidence = angle of reflection)
          const angle = Math.atan2(centerY - tipY, centerX - tipX);
          ctx.lineTo(40, centerY + Math.tan(angle) * (centerX - 40));
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Dashed Virtual Back-Projections
        if (!img.isReal) {
          ctx.strokeStyle = "rgba(56, 189, 248, 0.7)";
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(centerX, tipY);
          ctx.lineTo(imgX, imgY);
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(imgX, imgY);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // 7. Formed Image Rendering
        if (imgX >= 40 && imgX <= w - 40) {
          const isVirtual = !img.isReal;
          ctx.save();
          ctx.globalAlpha = isVirtual ? 0.65 : 0.95;

          // Image Wax
          ctx.fillStyle = isVirtual ? "rgba(139, 92, 246, 0.6)" : "#fef08a";
          const waxH = Math.abs(img.hi * scale) * 0.75;
          const waxY = img.isUpright ? (centerY - waxH) : centerY;
          ctx.fillRect(imgX - 5, waxY, 10, waxH);

          // Image Flame
          const imFlameY = img.isUpright ? (centerY - Math.abs(img.hi * scale)) : (centerY + Math.abs(img.hi * scale));
          ctx.fillStyle = isVirtual ? "#c084fc" : "#f59e0b";
          if (!isSmart) {
            ctx.shadowColor = isVirtual ? "#c084fc" : "#f59e0b";
            ctx.shadowBlur = 14;
          }
          ctx.beginPath();
          ctx.ellipse(imgX, imFlameY, 5, 10, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.restore();

          // Label
          ctx.fillStyle = isVirtual ? "#c084fc" : "#10b981";
          ctx.font = "bold 10px JetBrains Mono, monospace";
          ctx.fillText(isVirtual ? "Virtual Image" : "Real Image", imgX - 30, (img.isUpright ? imFlameY - 14 : imFlameY + 22));
        }

        // 8. Frosted Glass Projection Screen (Draggable)
        if (showScreen && img.isReal && !isMirror) {
          const scrX = centerX + screenDist * scale;
          const delta = Math.abs(screenDist - img.di);
          const isSharp = delta < 0.8;

          // Screen holder on rail
          ctx.fillStyle = "#475569";
          ctx.fillRect(scrX - 10, railY - 14, 20, 14);

          // Frosted glass plate
          ctx.fillStyle = isSharp ? "rgba(52, 211, 153, 0.25)" : "rgba(255, 255, 255, 0.15)";
          ctx.fillRect(scrX - 4, centerY - 120, 8, 240);
          ctx.strokeStyle = isSharp ? "#10b981" : "rgba(255, 255, 255, 0.4)";
          ctx.lineWidth = isSharp ? 2.5 : 1.5;
          ctx.strokeRect(scrX - 4, centerY - 120, 8, 240);

          // Defocus blur bokeh simulation on screen
          if (!isSharp && scrX >= 40 && scrX <= w - 40) {
            const blurRadius = Math.min(25, delta * 2.5);
            ctx.fillStyle = "rgba(245, 158, 11, 0.25)";
            ctx.beginPath();
            ctx.ellipse(scrX, centerY - img.hi * scale * 0.5, blurRadius, blurRadius * 1.5, 0, 0, Math.PI * 2);
            ctx.fill();
          }

          // Screen text badge
          ctx.font = "bold 9px JetBrains Mono, monospace";
          ctx.fillStyle = isSharp ? "#34d399" : "#fbbf24";
          ctx.fillText(isSharp ? "FOCUS SHARP" : `DEFOCUSED (${delta.toFixed(1)}cm)`, scrX - 35, centerY - 128);
        }
      }
    }
  }

  // Draw Snell's Law, TIR & Prism Dispersion View
  function drawSnellView(w, h, isSmart) {
    const centerX = w / 2;
    const centerY = h / 2;
    const radius = 170;

    const snell = calculateSnell();

    // 1. Semi-Circular Block or Triangular Prism
    if (interfaceShape === "semicircle") {
      // Protractor Arc Graduations
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 25, 0, Math.PI * 2);
      ctx.stroke();

      for (let deg = 0; deg < 360; deg += 10) {
        const rad = (deg * Math.PI) / 180;
        const x1 = centerX + (radius + 20) * Math.cos(rad);
        const y1 = centerY + (radius + 20) * Math.sin(rad);
        const x2 = centerX + (radius + 25) * Math.cos(rad);
        const y2 = centerY + (radius + 25) * Math.sin(rad);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Upper Half Medium 1 (air / water)
      ctx.fillStyle = "rgba(15, 23, 42, 0.6)";
      ctx.fillRect(centerX - radius - 30, centerY - radius - 30, (radius + 30) * 2, radius + 30);

      // Lower D-Block (Medium 2 Glass / Acrylic)
      const glassGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, radius);
      glassGrad.addColorStop(0, "rgba(56, 189, 248, 0.35)");
      glassGrad.addColorStop(0.7, "rgba(56, 189, 248, 0.2)");
      glassGrad.addColorStop(1, "rgba(56, 189, 248, 0.45)");

      ctx.fillStyle = glassGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Normal Line (Vertical dashed)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - radius - 20);
      ctx.lineTo(centerX, centerY + radius + 20);
      ctx.stroke();
      ctx.setLineDash([]);

      // Surface Normal Label
      ctx.font = "10px JetBrains Mono, monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.fillText("Surface Normal (N)", centerX + 8, centerY - radius - 6);

      // Interface Line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - radius - 20, centerY);
      ctx.lineTo(centerX + radius + 20, centerY);
      ctx.stroke();

      // 2. Incident Laser Ray
      const theta1Rad = (theta1Deg * Math.PI) / 180;
      const srcLen = radius + 15;
      const srcX = centerX - srcLen * Math.sin(theta1Rad);
      const srcY = centerY - srcLen * Math.cos(theta1Rad);

      // Laser Housing
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(srcX, srcY, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Incident Beam
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 3;
      if (!isSmart) {
        ctx.shadowColor = "#10b981";
        ctx.shadowBlur = 12;
      }
      ctx.beginPath();
      ctx.moveTo(srcX, srcY);
      ctx.lineTo(centerX, centerY);
      ctx.stroke();

      // Reflected Ray (Fresnel Reflection)
      const refX = centerX + srcLen * Math.sin(theta1Rad);
      const refY = centerY - srcLen * Math.cos(theta1Rad);
      ctx.strokeStyle = `rgba(52, 211, 153, ${Math.max(0.2, snell.reflectance)})`;
      ctx.lineWidth = snell.tir ? 3 : 1.8;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(refX, refY);
      ctx.stroke();

      // Refracted Ray (Inside Medium 2)
      if (!snell.tir && snell.theta2Deg !== null) {
        const theta2Rad = (snell.theta2Deg * Math.PI) / 180;
        const refrX = centerX + radius * Math.sin(theta2Rad);
        const refrY = centerY + radius * Math.cos(theta2Rad);

        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#38bdf8";
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(refrX, refrY);
        // Exits normal to circular boundary undeviated
        const outLen = 45;
        ctx.lineTo(refrX + outLen * Math.sin(theta2Rad), refrY + outLen * Math.cos(theta2Rad));
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // Critical Angle Sector (if n1 > n2)
      if (snell.critAngleDeg) {
        const critRad = (snell.critAngleDeg * Math.PI) / 180;
        ctx.fillStyle = "rgba(239, 68, 68, 0.15)";
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, 55, -Math.PI / 2 - critRad, -Math.PI / 2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#f87171";
        ctx.font = "bold 9px JetBrains Mono, monospace";
        ctx.fillText(`θ_c = ${snell.critAngleDeg.toFixed(1)}°`, centerX - 90, centerY - 65);
      }
    } else {
      // Triangular Dispersion Prism
      const pSide = 220;
      const pHeight = (Math.sqrt(3) / 2) * pSide;
      const pTopX = centerX;
      const pTopY = centerY - pHeight * 0.55;
      const pLeftX = centerX - pSide / 2;
      const pLeftY = centerY + pHeight * 0.45;
      const pRightX = centerX + pSide / 2;
      const pRightY = centerY + pHeight * 0.45;

      // Prism Body
      const pGrad = ctx.createLinearGradient(pLeftX, pTopY, pRightX, pRightY);
      pGrad.addColorStop(0, "rgba(255, 255, 255, 0.35)");
      pGrad.addColorStop(0.5, "rgba(56, 189, 248, 0.2)");
      pGrad.addColorStop(1, "rgba(168, 85, 247, 0.35)");

      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.moveTo(pTopX, pTopY);
      ctx.lineTo(pRightX, pRightY);
      ctx.lineTo(pLeftX, pLeftY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Incident White Light Beam
      const inX = centerX - 180;
      const inY = centerY + 10;
      const hitX = centerX - 45;
      const hitY = centerY - 10;

      ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
      ctx.lineWidth = 4;
      if (!isSmart) {
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 10;
      }
      ctx.beginPath();
      ctx.moveTo(inX, inY);
      ctx.lineTo(hitX, hitY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Rainbow Dispersion Spectral Rays
      const spectrum = [
        { color: "#ef4444", n: 1.514, label: "Red (700nm)" },
        { color: "#f59e0b", n: 1.517, label: "Orange (600nm)" },
        { color: "#eab308", n: 1.520, label: "Yellow (580nm)" },
        { color: "#10b981", n: 1.523, label: "Green (530nm)" },
        { color: "#06b6d4", n: 1.528, label: "Cyan (490nm)" },
        { color: "#3b82f6", n: 1.532, label: "Blue (450nm)" },
        { color: "#8b5cf6", n: 1.538, label: "Violet (400nm)" }
      ];

      spectrum.forEach((band, idx) => {
        const exitX = centerX + 40;
        const exitY = centerY - 25 + idx * 7;
        const outX = w - 40;
        const outY = centerY - 50 + idx * 24;

        // Inside prism refraction
        ctx.strokeStyle = band.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(hitX, hitY);
        ctx.lineTo(exitX, exitY);
        ctx.stroke();

        // Dispersed exit beam
        ctx.lineWidth = 2.5;
        if (!isSmart) {
          ctx.shadowColor = band.color;
          ctx.shadowBlur = 6;
        }
        ctx.beginPath();
        ctx.moveTo(exitX, exitY);
        ctx.lineTo(outX, outY);
        ctx.stroke();
        ctx.shadowBlur = 0;
      });
    }
  }

  // Update Numerical HUD Telemetry
  function updateTelemetry() {
    if (currentTab === "snell") {
      const snell = calculateSnell();
      document.getElementById("disp-theta1").innerText = `${theta1Deg.toFixed(1)}°`;

      // Repurpose HUD for Snell mode
      document.getElementById("val-do").innerText = `${medium1Index.toFixed(3)}`;
      document.getElementById("val-di").innerText = snell.tir ? "TIR" : `${snell.theta2Deg.toFixed(1)}°`;
      document.getElementById("val-f").innerText = snell.critAngleDeg ? `${snell.critAngleDeg.toFixed(1)}°` : "None";
      document.getElementById("val-mag").innerText = `${(snell.reflectance * 100).toFixed(1)}%`;

      const badge = document.getElementById("image-nature-badge");
      if (snell.tir) {
        badge.innerText = "Total Internal Reflection (TIR)";
        badge.style.color = "#f87171";
        badge.style.background = "rgba(239, 68, 68, 0.2)";
        badge.style.borderColor = "rgba(239, 68, 68, 0.4)";
      } else {
        badge.innerText = `Snell Refraction: θ₂ = ${snell.theta2Deg.toFixed(1)}°`;
        badge.style.color = "#34d399";
        badge.style.background = "rgba(16, 185, 129, 0.18)";
        badge.style.borderColor = "rgba(16, 185, 129, 0.4)";
      }
      requestRender();
      return;
    }

    // Lens & Mirror Telemetry
    const img = calculateImage();
    document.getElementById("val-do").innerText = `${doVal.toFixed(1)} cm`;
    document.getElementById("disp-do").innerText = `${doVal.toFixed(1)} cm`;
    document.getElementById("val-f").innerText = `${fVal.toFixed(1)} cm`;
    document.getElementById("disp-f").innerText = `${fVal.toFixed(1)} cm`;
    document.getElementById("disp-ho").innerText = `${hoVal.toFixed(1)} cm`;

    const badge = document.getElementById("image-nature-badge");
    const screenBadge = document.getElementById("focus-screen-badge");

    if (!isFinite(img.di)) {
      document.getElementById("val-di").innerText = "Infinity (Parallel)";
      document.getElementById("val-mag").innerText = "N/A";
      badge.innerText = "No Image Formed (Rays Parallel at Focus)";
      badge.style.color = "#f59e0b";
      badge.style.background = "rgba(245, 158, 11, 0.2)";
      if (screenBadge) screenBadge.style.display = "none";
    } else {
      document.getElementById("val-di").innerText = `${img.di.toFixed(1)} cm`;
      document.getElementById("val-mag").innerText = `${img.m.toFixed(2)}×`;

      if (img.isReal) {
        badge.innerText = `Real, Inverted Image (m = ${img.m.toFixed(2)})`;
        badge.style.color = "#34d399";
        badge.style.background = "rgba(16, 185, 129, 0.18)";

        // Screen Focus check
        if (showScreen && !opticType.includes("mirror")) {
          const delta = Math.abs(screenDist - img.di);
          screenBadge.style.display = "inline-block";
          if (delta < 0.8) {
            screenBadge.innerText = "Screen: In Sharp Focus";
            screenBadge.style.color = "#34d399";
            screenBadge.style.background = "rgba(16, 185, 129, 0.2)";
            screenBadge.style.borderColor = "rgba(16, 185, 129, 0.5)";
          } else {
            screenBadge.innerText = `Screen: Defocused (Δ=${delta.toFixed(1)}cm)`;
            screenBadge.style.color = "#fbbf24";
            screenBadge.style.background = "rgba(245, 158, 11, 0.2)";
            screenBadge.style.borderColor = "rgba(245, 158, 11, 0.5)";
          }
        } else {
          screenBadge.style.display = "none";
        }
      } else {
        badge.innerText = `Virtual, Upright Image (m = +${Math.abs(img.m).toFixed(2)})`;
        badge.style.color = "#c084fc";
        badge.style.background = "rgba(139, 92, 246, 0.2)";
        if (screenBadge) screenBadge.style.display = "none";
      }
    }
    requestRender();
  }

  // Animation & Throttled Rendering
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
    const isSmart = (document.documentElement.getAttribute("data-mode") === "smartboard") ||
                    document.documentElement.classList.contains("fast-smartboard-mode") ||
                    /Android|MAXHUB/i.test(navigator.userAgent);

    if ((isSmart || laserMode) && !needsRedraw) {
      animId = requestAnimationFrame(renderLoop);
      return;
    }

    const interval = isSmart ? 33 : 16;
    if (!now || now - lastFrameTime >= interval) {
      lastFrameTime = now || performance.now();
      needsRedraw = false;
      const photoEl = container.querySelector("#optics-photo-overlay");
      if (!photoEl || photoEl.style.display !== "block") {
        draw();
      }
    }
    animId = requestAnimationFrame(renderLoop);
  }
  renderLoop();

  // Pointer & Tactile Dragging Engine
  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function handlePointerDown(e) {
    const coords = getCanvasCoords(e);
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const centerX = w / 2;
    const centerY = h / 2 - 25;
    const railY = centerY + 130;

    dragStartX = coords.x;
    dragStartY = coords.y;

    if (currentTab === "snell") {
      // Snell Laser Source Dragger
      const snellRadius = 170 + 15;
      const theta1Rad = (theta1Deg * Math.PI) / 180;
      const srcX = centerX - snellRadius * Math.sin(theta1Rad);
      const srcY = h / 2 - snellRadius * Math.cos(theta1Rad);

      const dist = Math.hypot(coords.x - srcX, coords.y - srcY);
      if (dist < 30) {
        dragTarget = "snell_source";
        canvas.setPointerCapture(e.pointerId);
        return;
      }
    } else {
      // Lens / Mirror Bench Draggers
      const objX = centerX - doVal * scale;
      const objY = centerY;
      const objH = hoVal * scale;
      const tipY = objY - objH;

      // 1. Check Flame / Tip Dragger (Height h_o)
      if (Math.hypot(coords.x - objX, coords.y - tipY) < 22) {
        dragTarget = "object_height";
        canvas.setPointerCapture(e.pointerId);
        return;
      }

      // 2. Check Object Base Dragger (Distance d_o)
      if (Math.abs(coords.x - objX) < 25 && coords.y >= centerY - 40 && coords.y <= railY + 15) {
        dragTarget = "object_pos";
        canvas.setPointerCapture(e.pointerId);
        return;
      }

      // 3. Check Screen Dragger
      if (showScreen && !opticType.includes("mirror")) {
        const scrX = centerX + screenDist * scale;
        if (Math.abs(coords.x - scrX) < 20 && coords.y >= centerY - 130 && coords.y <= railY + 10) {
          dragTarget = "screen";
          canvas.setPointerCapture(e.pointerId);
          return;
        }
      }
    }
  }

  function handlePointerMove(e) {
    const coords = getCanvasCoords(e);
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const centerX = w / 2;
    const centerY = h / 2 - 25;

    if (!dragTarget) {
      // Cursor hover feedback
      if (currentTab === "snell") {
        const snellRadius = 185;
        const theta1Rad = (theta1Deg * Math.PI) / 180;
        const srcX = centerX - snellRadius * Math.sin(theta1Rad);
        const srcY = h / 2 - snellRadius * Math.cos(theta1Rad);
        canvas.style.cursor = (Math.hypot(coords.x - srcX, coords.y - srcY) < 30) ? "grab" : "crosshair";
      } else {
        const objX = centerX - doVal * scale;
        const tipY = centerY - hoVal * scale;
        const scrX = centerX + screenDist * scale;

        if (Math.hypot(coords.x - objX, coords.y - tipY) < 22) {
          canvas.style.cursor = "ns-resize";
        } else if (Math.abs(coords.x - objX) < 25 && coords.y >= centerY - 40) {
          canvas.style.cursor = "ew-resize";
        } else if (showScreen && Math.abs(coords.x - scrX) < 20) {
          canvas.style.cursor = "ew-resize";
        } else {
          canvas.style.cursor = "crosshair";
        }
      }
      return;
    }

    if (dragTarget === "object_pos") {
      const newDo = (centerX - coords.x) / scale;
      doVal = Math.max(5, Math.min(65, newDo));
      const inDo = document.getElementById("input-do");
      if (inDo) inDo.value = doVal;
      updateTelemetry();
    } else if (dragTarget === "object_height") {
      const newHo = (centerY - coords.y) / scale;
      hoVal = Math.max(4, Math.min(18, newHo));
      const inHo = document.getElementById("input-ho");
      if (inHo) inHo.value = hoVal;
      updateTelemetry();
    } else if (dragTarget === "screen") {
      const newScr = (coords.x - centerX) / scale;
      screenDist = Math.max(5, Math.min(65, newScr));
      updateTelemetry();
    } else if (dragTarget === "snell_source") {
      const dx = centerX - coords.x;
      const dy = (h / 2) - coords.y;
      if (dy > 0) {
        let deg = (Math.atan2(dx, dy) * 180) / Math.PI;
        theta1Deg = Math.max(0, Math.min(85, deg));
        const inTh = document.getElementById("input-theta1");
        if (inTh) inTh.value = theta1Deg;
        updateTelemetry();
      }
    }
  }

  function handlePointerUp(e) {
    if (dragTarget) {
      dragTarget = null;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  }

  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerup", handlePointerUp);
  canvas.addEventListener("pointercancel", handlePointerUp);

  // Control Handlers
  const inDo = document.getElementById("input-do");
  const inF = document.getElementById("input-f");
  const inHo = document.getElementById("input-ho");
  const selOptic = document.getElementById("select-optic-type");
  const inTh1 = document.getElementById("input-theta1");

  inDo?.addEventListener("input", (e) => {
    doVal = parseFloat(e.target.value);
    updateTelemetry();
  });

  inF?.addEventListener("input", (e) => {
    fVal = parseFloat(e.target.value);
    updateTelemetry();
  });

  inHo?.addEventListener("input", (e) => {
    hoVal = parseFloat(e.target.value);
    updateTelemetry();
  });

  selOptic?.addEventListener("change", (e) => {
    opticType = e.target.value;
    const label = document.getElementById("optics-type-label");
    const dot = document.getElementById("optics-type-dot");

    if (opticType === "convex_lens") {
      label.innerText = `Converging Biconvex Lens (f = +${fVal.toFixed(1)} cm)`;
      dot.style.background = "#6366f1";
    } else if (opticType === "concave_lens") {
      label.innerText = `Diverging Biconcave Lens (f = -${fVal.toFixed(1)} cm)`;
      dot.style.background = "#8b5cf6";
    } else if (opticType === "concave_mirror") {
      label.innerText = `Concave Spherical Mirror (f = +${fVal.toFixed(1)} cm)`;
      dot.style.background = "#fbbf24";
    } else if (opticType === "convex_mirror") {
      label.innerText = `Convex Spherical Mirror (f = -${fVal.toFixed(1)} cm)`;
      dot.style.background = "#38bdf8";
    }
    updateTelemetry();
  });

  inTh1?.addEventListener("input", (e) => {
    theta1Deg = parseFloat(e.target.value);
    updateTelemetry();
  });

  document.getElementById("select-medium-1")?.addEventListener("change", (e) => {
    medium1Index = parseFloat(e.target.value);
    updateTelemetry();
  });

  document.getElementById("select-medium-2")?.addEventListener("change", (e) => {
    medium2Index = parseFloat(e.target.value);
    updateTelemetry();
  });

  document.getElementById("select-interface-shape")?.addEventListener("change", (e) => {
    interfaceShape = e.target.value;
    updateTelemetry();
  });

  // Checkboxes
  document.getElementById("chk-grid")?.addEventListener("change", (e) => {
    showGraduations = e.target.checked;
    requestRender();
  });

  document.getElementById("chk-screen")?.addEventListener("change", (e) => {
    showScreen = e.target.checked;
    requestRender();
  });

  document.getElementById("chk-laser")?.addEventListener("change", (e) => {
    laserMode = e.target.checked;
    requestRender();
  });

  // Tab View Switchers
  const tabLens = document.getElementById("optics-tab-lens");
  const tabMirror = document.getElementById("optics-tab-mirror");
  const tabSnell = document.getElementById("optics-tab-snell");
  const tabPhoto = document.getElementById("optics-tab-photo");

  const benchControls = document.getElementById("controls-bench-mode");
  const snellControls = document.getElementById("controls-snell-mode");
  const lensPresets = document.getElementById("presets-lens-group");
  const snellPresets = document.getElementById("presets-snell-group");
  const formulaBar = document.getElementById("optics-formula-bar");
  const chkScreenLabel = document.getElementById("label-chk-screen");

  function setActiveTab(tab) {
    currentTab = tab;
    [tabLens, tabMirror, tabSnell, tabPhoto].forEach(t => {
      if (t) {
        t.classList.remove("active");
        t.style.background = "transparent";
        t.style.color = "#94a3b8";
        t.style.fontWeight = "600";
      }
    });

    photoOverlay.style.display = (tab === "photo") ? "block" : "none";

    if (tab === "lens") {
      tabLens.classList.add("active");
      tabLens.style.background = "rgba(99, 102, 241, 0.25)";
      tabLens.style.color = "#818cf8";
      tabLens.style.fontWeight = "700";

      benchControls.style.display = "grid";
      snellControls.style.display = "none";
      lensPresets.style.display = "flex";
      snellPresets.style.display = "none";
      formulaBar.style.display = "flex";
      if (chkScreenLabel) chkScreenLabel.style.display = "flex";

      selOptic.innerHTML = `
        <option value="convex_lens" ${opticType === "convex_lens" ? "selected" : ""}>Convex Lens (Converging, f > 0)</option>
        <option value="concave_lens" ${opticType === "concave_lens" ? "selected" : ""}>Concave Lens (Diverging, f < 0)</option>
      `;
      if (opticType.includes("mirror")) opticType = "convex_lens";
    } else if (tab === "mirror") {
      tabMirror.classList.add("active");
      tabMirror.style.background = "rgba(99, 102, 241, 0.25)";
      tabMirror.style.color = "#818cf8";
      tabMirror.style.fontWeight = "700";

      benchControls.style.display = "grid";
      snellControls.style.display = "none";
      lensPresets.style.display = "flex";
      snellPresets.style.display = "none";
      formulaBar.style.display = "flex";
      if (chkScreenLabel) chkScreenLabel.style.display = "none";

      selOptic.innerHTML = `
        <option value="concave_mirror" ${opticType === "concave_mirror" ? "selected" : ""}>Concave Mirror (Converging Reflector)</option>
        <option value="convex_mirror" ${opticType === "convex_mirror" ? "selected" : ""}>Convex Mirror (Diverging Reflector)</option>
      `;
      if (!opticType.includes("mirror")) opticType = "concave_mirror";
    } else if (tab === "snell") {
      tabSnell.classList.add("active");
      tabSnell.style.background = "rgba(99, 102, 241, 0.25)";
      tabSnell.style.color = "#818cf8";
      tabSnell.style.fontWeight = "700";

      benchControls.style.display = "none";
      snellControls.style.display = "grid";
      lensPresets.style.display = "none";
      snellPresets.style.display = "flex";
      formulaBar.style.display = "none";
    } else if (tab === "photo") {
      tabPhoto.classList.add("active");
      tabPhoto.style.background = "rgba(99, 102, 241, 0.25)";
      tabPhoto.style.color = "#818cf8";
      tabPhoto.style.fontWeight = "700";
    }

    updateTelemetry();
  }

  tabLens?.addEventListener("click", () => setActiveTab("lens"));
  tabMirror?.addEventListener("click", () => setActiveTab("mirror"));
  tabSnell?.addEventListener("click", () => setActiveTab("snell"));
  tabPhoto?.addEventListener("click", () => setActiveTab("photo"));

  // Presets
  document.getElementById("preset-2f")?.addEventListener("click", () => {
    opticType = "convex_lens";
    selOptic.value = "convex_lens";
    fVal = 15;
    inF.value = 15;
    doVal = 30;
    inDo.value = 30;
    screenDist = 30;
    updateTelemetry();
  });

  document.getElementById("preset-f-2f")?.addEventListener("click", () => {
    opticType = "convex_lens";
    selOptic.value = "convex_lens";
    fVal = 15;
    inF.value = 15;
    doVal = 22.5;
    inDo.value = 22.5;
    screenDist = 45;
    updateTelemetry();
  });

  document.getElementById("preset-mag-glass")?.addEventListener("click", () => {
    opticType = "convex_lens";
    selOptic.value = "convex_lens";
    fVal = 18;
    inF.value = 18;
    doVal = 9;
    inDo.value = 9;
    updateTelemetry();
  });

  document.getElementById("preset-concave")?.addEventListener("click", () => {
    opticType = "concave_lens";
    selOptic.value = "concave_lens";
    fVal = 15;
    inF.value = 15;
    doVal = 25;
    inDo.value = 25;
    updateTelemetry();
  });

  document.getElementById("preset-refract-normal")?.addEventListener("click", () => {
    medium1Index = 1.000;
    medium2Index = 1.520;
    theta1Deg = 30.0;
    interfaceShape = "semicircle";
    document.getElementById("select-medium-1").value = "1.000";
    document.getElementById("select-medium-2").value = "1.520";
    document.getElementById("input-theta1").value = 30;
    document.getElementById("select-interface-shape").value = "semicircle";
    updateTelemetry();
  });

  document.getElementById("preset-tir")?.addEventListener("click", () => {
    medium1Index = 1.520;
    medium2Index = 1.000;
    theta1Deg = 48.0;
    interfaceShape = "semicircle";
    document.getElementById("select-medium-1").value = "1.520";
    document.getElementById("select-medium-2").value = "1.000";
    document.getElementById("input-theta1").value = 48;
    document.getElementById("select-interface-shape").value = "semicircle";
    updateTelemetry();
  });

  document.getElementById("preset-rainbow")?.addEventListener("click", () => {
    medium1Index = 1.000;
    medium2Index = 1.520;
    interfaceShape = "prism";
    document.getElementById("select-interface-shape").value = "prism";
    updateTelemetry();
  });

  // Telemetry Suite: Record Trial
  document.getElementById("btn-record-optics-trial")?.addEventListener("click", () => {
    if (currentTab === "snell") {
      const snell = calculateSnell();
      LabTrialStore.addTrial("optics", {
        measurements: {
          "Apparatus Mode": "Snell's Law & Refraction",
          "Medium 1": `${medium1Index.toFixed(3)}`,
          "Medium 2": `${medium2Index.toFixed(3)}`,
          "Incidence Angle (θ₁)": `${theta1Deg.toFixed(1)}°`,
          "Refracted Angle (θ₂)": snell.tir ? "TIR (No Refraction)" : `${snell.theta2Deg.toFixed(1)}°`,
          "Critical Angle (θ_c)": snell.critAngleDeg ? `${snell.critAngleDeg.toFixed(1)}°` : "N/A",
          "Phenomenon": snell.tir ? "Total Internal Reflection" : "Refraction"
        }
      });
    } else {
      const img = calculateImage();
      const effF = (opticType === "convex_lens" || opticType === "concave_mirror") ? fVal : -fVal;
      LabTrialStore.addTrial("optics", {
        measurements: {
          "Lens Type": opticType,
          "Focal Length (f)": `${effF.toFixed(1)} cm`,
          "Object Distance (do)": `${doVal.toFixed(1)} cm`,
          "Image Distance (di)": isFinite(img.di) ? `${img.di.toFixed(1)} cm` : "Infinity",
          "Magnification (m)": isFinite(img.m) ? `${img.m.toFixed(2)}×` : "N/A",
          "Image Nature": img.isReal ? "Real, Inverted" : "Virtual, Upright"
        }
      });
    }

    const trials = LabTrialStore.getTrials("optics");
    trials.forEach((tr, i) => {
      const pill = document.getElementById(`optics-pill-trial-${i + 1}`);
      if (pill) {
        pill.style.opacity = "1";
        const d_o = tr.measurements["Object Distance (do)"] || tr.measurements["Incidence Angle (θ₁)"];
        const d_i = tr.measurements["Image Distance (di)"] || tr.measurements["Refracted Angle (θ₂)"];
        pill.innerText = `Bench ${tr.trialNumber}: ${d_o} → ${d_i}`;
      }
    });
  });

  // Telemetry Suite: Export CSV
  document.getElementById("btn-export-optics-csv")?.addEventListener("click", () => {
    const img = calculateImage();
    const effF = (opticType === "convex_lens" || opticType === "concave_mirror") ? fVal : -fVal;

    exportLabDataCsv({
      title: "Precision Geometric & Physical Optics Laboratory",
      labId: "optics",
      parameters: {
        "Active Apparatus": currentTab,
        "Optical Element": opticType,
        "Focal Length (|f|)": `${fVal.toFixed(1)} cm`,
        "Object Distance (d_o)": `${doVal.toFixed(1)} cm`,
        "Object Height (h_o)": `${hoVal.toFixed(1)} cm`,
        "Laser Collimator": laserMode ? "Active" : "Standard Multi-Ray"
      },
      headers: ["Element Type", "Focal Length f (cm)", "Object Distance do (cm)", "Image Distance di (cm)", "Object Height ho (cm)", "Image Height hi (cm)", "Magnification m", "Image Nature"],
      dataRows: [
        [
          opticType,
          effF,
          doVal,
          isFinite(img.di) ? parseFloat(img.di.toFixed(2)) : "Infinity",
          hoVal,
          isFinite(img.hi) ? parseFloat(img.hi.toFixed(2)) : "Infinity",
          isFinite(img.m) ? parseFloat(img.m.toFixed(2)) : "Infinity",
          img.isReal ? "Real, Inverted" : "Virtual, Upright"
        ]
      ]
    });
  });

  // Telemetry Suite: Generate Lab Dossier
  document.getElementById("btn-open-optics-report")?.addEventListener("click", () => {
    const trials = LabTrialStore.getTrials("optics");
    const img = calculateImage();
    const effF = (opticType === "convex_lens" || opticType === "concave_mirror") ? fVal : -fVal;

    openLabReportModal({
      title: "Geometric & Physical Optics: Thin Lenses, Curved Mirrors & Snell's Law",
      subject: "Physics",
      inquiryQuestion: "How do refractive index contrasts, boundary geometry, and focal distance quantitatively govern image formation, magnification, and total internal reflection?",
      parameters: {
        "Optical System": opticType,
        "Signed Focal Length (f)": `${effF.toFixed(1)} cm`,
        "Object Distance (d_o)": `${doVal.toFixed(1)} cm`,
        "Image Distance (d_i)": isFinite(img.di) ? `${img.di.toFixed(1)} cm` : "Infinity (Collimated)",
        "Lateral Magnification (m)": isFinite(img.m) ? `${img.m.toFixed(2)}×` : "N/A",
        "Image Character": img.isReal ? "Real & Inverted" : "Virtual & Upright"
      },
      trials,
      formulas: [
        "\\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i} \\quad (\\text{Gaussian Thin Lens Formula})",
        "m = -\\frac{d_i}{d_o} = \\frac{h_i}{h_o} \\quad (\\text{Transverse Magnification})",
        "n_1 \\sin \\theta_1 = n_2 \\sin \\theta_2 \\quad (\\text{Snell's Law of Refraction})",
        "\\theta_c = \\arcsin\\left(\\frac{n_2}{n_1}\\right) \\quad (\\text{Critical Angle for TIR})"
      ]
    });
  });

  // Mount Post-Lab Checkpoint Assessment
  mountLabCheckpoint("optics-checkpoint-container", "optics");

  // Keyboard Shortcuts
  function handleKeyDown(e) {
    if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.tagName === "TEXTAREA") return;
    if (e.code === "Space") {
      e.preventDefault();
      laserMode = !laserMode;
      const chk = document.getElementById("chk-laser");
      if (chk) chk.checked = laserMode;
      requestRender();
    } else if (e.key === "1") {
      document.getElementById("preset-2f")?.click();
    } else if (e.key === "2") {
      document.getElementById("preset-f-2f")?.click();
    } else if (e.key === "3") {
      document.getElementById("preset-mag-glass")?.click();
    } else if (e.key === "4") {
      document.getElementById("preset-concave")?.click();
    } else if (e.key.toLowerCase() === "r") {
      document.getElementById("preset-2f")?.click();
    }
  }
  window.addEventListener("keydown", handleKeyDown);

  // HiDPI Canvas Resize Handler
  function handleResize() {
    if (!container || !container.isConnected) {
      cleanup();
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
    canvas.width = rect.width * dpr;
    canvas.height = 500 * dpr;
    requestRender();
  }
  window.addEventListener("resize", handleResize);
  handleResize();

  // Cleanup handler
  function cleanup() {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("keydown", handleKeyDown);
    canvas.removeEventListener("pointerdown", handlePointerDown);
    canvas.removeEventListener("pointermove", handlePointerMove);
    canvas.removeEventListener("pointerup", handlePointerUp);
    canvas.removeEventListener("pointercancel", handlePointerUp);
  }

  activeCleanup = cleanup;
  return cleanup;
}
