// Edugates-ClipSAT Science Labs - Precision Geometric & Physical Optics Laboratory
// Photorealistic Optical Rail, Anti-Reflective Coated Lenses, Spherical Curved Mirrors,
// Snell's Law & Total Internal Reflection (TIR), Cauchy Chromatic Dispersion Prism,
// Compound Multi-Lens Systems (Keplerian Telescope, Compound Microscope, Achromatic Doublet),
// Transmission Diffraction Grating & Wave Interference, ABCD Ray Matrix Telemetry,
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
          <div class="lab-view-switcher" style="display: flex; border-radius: 8px; padding: 3px; background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(255,255,255,0.08); gap: 2px;">
            <button id="optics-tab-lens" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none; background: rgba(99, 102, 241, 0.25); color: #818cf8;">
              🔍 Thin Lenses
            </button>
            <button id="optics-tab-mirror" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none; color: #94a3b8;">
              🪞 Curved Mirrors
            </button>
            <button id="optics-tab-snell" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none; color: #94a3b8;">
              🌈 Snell / TIR / Grating
            </button>
            <button id="optics-tab-compound" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none; color: #94a3b8;">
              🔭 Compound Multi-Lens
            </button>
            <button id="optics-tab-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none; color: #94a3b8;">
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
          <picture>
            <source srcset="assets/labs/optics_bench.webp" type="image/webp">
            <img src="assets/labs/optics_bench.jpg" decoding="async" loading="lazy" alt="4K Geometric Optics Precision Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
          </picture>
          
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
              <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase;" id="lbl-telem-1">Object Dist (d_o)</div>
              <div style="color: #f59e0b; font-weight: 700; font-size: 0.98rem;" id="val-do">30.0 cm</div>
            </div>
            <div style="border-right: 1px solid rgba(255,255,255,0.1); padding-right: 10px;" id="telem-col-2">
              <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase;" id="lbl-telem-2">Image Dist (d_i)</div>
              <div style="color: #10b981; font-weight: 700; font-size: 0.98rem;" id="val-di">30.0 cm</div>
            </div>
            <div style="border-right: 1px solid rgba(255,255,255,0.1); padding-right: 10px;" id="telem-col-3">
              <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase;" id="lbl-telem-3">Focal Length (f)</div>
              <div style="color: #818cf8; font-weight: 700; font-size: 0.98rem;" id="val-f">15.0 cm</div>
            </div>
            <div id="telem-col-4">
              <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase;" id="lbl-telem-4">Magnification (m)</div>
              <div style="color: #38bdf8; font-weight: 700; font-size: 0.98rem;" id="val-mag">-1.00×</div>
            </div>
          </div>
        </div>

        <!-- Tactile Drag Instruction Banner -->
        <div id="optics-drag-hint" style="position: absolute; top: 72px; left: 16px; background: rgba(30, 41, 59, 0.85); backdrop-filter: blur(8px); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 8px; padding: 4px 10px; font-size: 0.73rem; color: #cbd5e1; display: flex; align-items: center; gap: 6px; pointer-events: none; z-index: 5;">
          <span>💡 Direct Touch: Drag candle base along rail (d_o) • Drag flame tip (h_o) • Drag lens carriage</span>
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
        <!-- Lens / Mirror Specific Controls -->
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

        <!-- Snell / Prism / Grating Controls -->
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
              <option value="grating">Diffraction Grating (Wave Interference & Orders)</option>
            </select>
          </div>
        </div>

        <!-- Compound Multi-Lens Controls -->
        <div id="controls-compound-mode" style="display: none; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 14px;">
          <!-- Compound Preset Selector -->
          <div class="control-group">
            <label class="control-label"><span>Optical System Configuration</span></label>
            <select id="select-compound-preset" class="select-input" style="font-weight: 600; width: 100%;">
              <option value="telescope" selected>🔭 Keplerian Telescope (M = -3.0×, Afocal)</option>
              <option value="microscope">🔬 Compound Microscope (M = -8.0×)</option>
              <option value="achromatic">💎 Achromatic Doublet (Zero Chromatic Split)</option>
              <option value="custom">⚙️ Custom Dual-Lens Bench (Free Drag & Adjust)</option>
            </select>
          </div>

          <!-- Objective Lens Focal Length -->
          <div class="control-group">
            <label class="control-label">
              <span>Objective Lens (f₁)</span>
              <span class="control-val" id="disp-f1" style="color: #38bdf8;">30.0 cm</span>
            </label>
            <input type="range" id="input-f1" class="custom-slider" min="5" max="35" value="30" step="0.5" style="accent-color: #38bdf8;">
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-dim);">
              <span>5 cm</span>
              <span>20 cm</span>
              <span>35 cm</span>
            </div>
          </div>

          <!-- Eyepiece Focal Length -->
          <div class="control-group">
            <label class="control-label">
              <span>Eyepiece Lens (f₂)</span>
              <span class="control-val" id="disp-f2" style="color: #818cf8;">10.0 cm</span>
            </label>
            <input type="range" id="input-f2" class="custom-slider" min="5" max="25" value="10" step="0.5" style="accent-color: #818cf8;">
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-dim);">
              <span>5 cm</span>
              <span>15 cm</span>
              <span>25 cm</span>
            </div>
          </div>

          <!-- Tube Separation Length -->
          <div class="control-group">
            <label class="control-label">
              <span>Tube Length (L = x₂ - x₁)</span>
              <span class="control-val" id="disp-tube-len" style="color: #10b981;">40.0 cm</span>
            </label>
            <input type="range" id="input-tube-len" class="custom-slider" min="15" max="60" value="40" step="0.5" style="accent-color: #10b981;">
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-dim);">
              <span>15 cm</span>
              <span>40 cm (Confocal)</span>
              <span>60 cm</span>
            </div>
          </div>

          <!-- Object Distance for Lens 1 -->
          <div class="control-group">
            <label class="control-label">
              <span>Object Distance (d_o1)</span>
              <span class="control-val" id="disp-do1" style="color: #f59e0b;">∞ (Collimated Star)</span>
            </label>
            <input type="range" id="input-do1" class="custom-slider" min="6" max="65" value="65" step="0.5">
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-dim);">
              <span>6 cm (Specimen)</span>
              <span>30 cm</span>
              <span>65 cm (Infinity)</span>
            </div>
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
            <button class="btn btn-secondary" id="preset-grating" style="border-color: rgba(16, 185, 129, 0.4); color: #34d399; font-size: 0.78rem;">
              Diffraction Grating (600 lines/mm)
            </button>
          </div>

          <div id="presets-compound-group" style="display: none; flex-wrap: wrap; gap: 8px;">
            <button class="btn btn-secondary" id="preset-telescope" style="border-color: rgba(99, 102, 241, 0.4); color: #818cf8; font-size: 0.78rem;">
              🔭 Keplerian Telescope
            </button>
            <button class="btn btn-secondary" id="preset-microscope" style="border-color: rgba(16, 185, 129, 0.4); color: #34d399; font-size: 0.78rem;">
              🔬 Compound Microscope
            </button>
            <button class="btn btn-secondary" id="preset-achromatic" style="border-color: rgba(245, 158, 11, 0.4); color: #fbbf24; font-size: 0.78rem;">
              💎 Achromatic Doublet
            </button>
            <button class="btn btn-secondary" id="preset-confocal" style="border-color: rgba(56, 189, 248, 0.4); color: #38bdf8; font-size: 0.78rem;">
              📐 Confocal Afocal System
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
  let currentTab = "lens"; // 'lens' | 'mirror' | 'snell' | 'compound' | 'photo'
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
  let interfaceShape = "semicircle"; // 'semicircle' | 'prism' | 'grating'

  // Compound Multi-Lens State
  let compoundPreset = "telescope"; // 'telescope' | 'microscope' | 'achromatic' | 'custom'
  let f1Val = 30.0; // cm
  let f2Val = 10.0; // cm
  let tubeLen = 40.0; // cm
  let do1Val = 65.0; // cm (infinity for telescope)

  // Drag interaction state
  let dragTarget = null; // 'object_pos' | 'object_height' | 'screen' | 'snell_source' | 'lens1_pos' | 'lens2_pos'
  let dragStartX = 0;
  let dragStartY = 0;

  const scale = 7.5; // pixels per cm

  // Calculate Single Lens/Mirror Image position & magnification
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

  // Calculate Compound Multi-Lens System
  function calculateCompoundOptics() {
    const f1 = f1Val;
    const f2 = f2Val;
    const L = tubeLen;

    // Intermediate Image after Lens 1
    let di1 = 0;
    let m1 = 0;
    if (compoundPreset === "telescope" && do1Val >= 60) {
      di1 = f1;
      m1 = 0; // Collimated star source
    } else {
      di1 = (f1 * do1Val) / (do1Val - f1);
      m1 = -di1 / do1Val;
    }

    // Secondary Object Distance into Lens 2
    const do2 = L - di1;

    // Final Image after Lens 2
    let di2 = 0;
    let m2 = 0;
    if (Math.abs(do2 - f2) < 0.05) {
      di2 = Infinity;
      m2 = Infinity;
    } else {
      di2 = (f2 * do2) / (do2 - f2);
      m2 = -di2 / do2;
    }

    const mTotal = (compoundPreset === "telescope") ? (-f1 / f2) : (m1 * m2);

    // Ray Transfer Matrix ABCD
    const A = 1 - L / f1;
    const B = L;
    const C = -1 / f1 - 1 / f2 + L / (f1 * f2);
    const D = 1 - L / f2;
    const fSys = Math.abs(C) > 1e-5 ? -1 / C : Infinity;

    return {
      f1, f2, L, do1: do1Val, di1, do2, di2, m1, m2, mTotal,
      A, B, C, D, fSys,
      isAfocal: Math.abs(L - (f1 + f2)) < 0.2
    };
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
    } else if (currentTab === "compound") {
      drawCompoundView(w, h, isSmart);
    } else {
      drawBenchView(w, h, isSmart);
    }

    ctx.restore();
  }

  // -------------------------------------------------------------------
  // Draw Compound Multi-Lens System (Microscope, Telescope, Doublet)
  // -------------------------------------------------------------------
  function drawCompoundView(w, h, isSmart) {
    const centerX = w / 2;
    const centerY = h / 2 - 20;
    const railY = centerY + 130;

    // 1. Optical Rail Bench (Anodized Aluminum)
    const railGrad = ctx.createLinearGradient(0, railY, 0, railY + 35);
    railGrad.addColorStop(0, "#475569");
    railGrad.addColorStop(0.3, "#64748b");
    railGrad.addColorStop(0.7, "#334155");
    railGrad.addColorStop(1, "#1e293b");
    ctx.fillStyle = railGrad;
    ctx.fillRect(40, railY, w - 80, 32);

    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(40, railY, w - 80, 32);

    // Metric Rail Graduations
    if (showGraduations) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "9px JetBrains Mono, sans-serif";
      for (let cm = 0; cm <= 80; cm += 5) {
        const xPos = 60 + cm * (scale * 1.35);
        if (xPos > w - 60) break;
        ctx.fillRect(xPos - 0.5, railY, 1, (cm % 10 === 0) ? 9 : 5);
        if (cm % 10 === 0) {
          ctx.fillText(`${cm}`, xPos - 5, railY + 22);
        }
      }
    }

    // 2. Optical Centerline Axis
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(30, centerY);
    ctx.lineTo(w - 30, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Positions of Lens 1 and Lens 2
    const L1_x = centerX - (tubeLen * 0.5) * scale;
    const L2_x = centerX + (tubeLen * 0.5) * scale;

    const comp = calculateCompoundOptics();

    // 3. Draw Lens 1 (Objective)
    ctx.save();
    ctx.fillStyle = "#334155";
    ctx.fillRect(L1_x - 14, centerY + 105, 28, railY - (centerY + 105));
    ctx.fillStyle = "#64748b";
    ctx.fillRect(L1_x - 18, centerY + 95, 36, 10);

    const l1Grad = ctx.createLinearGradient(L1_x - 12, 0, L1_x + 12, 0);
    l1Grad.addColorStop(0, "rgba(56, 189, 248, 0.5)");
    l1Grad.addColorStop(0.5, "rgba(255, 255, 255, 0.2)");
    l1Grad.addColorStop(1, "rgba(56, 189, 248, 0.6)");
    ctx.fillStyle = l1Grad;
    ctx.beginPath();
    ctx.ellipse(L1_x, centerY, 13, 105, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.85)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Focal Points for Lens 1
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 9px JetBrains Mono, sans-serif";
    ctx.fillRect(L1_x - f1Val * scale - 1.5, centerY - 4, 3, 8);
    ctx.fillText("F₁", L1_x - f1Val * scale - 6, centerY + 16);
    ctx.fillRect(L1_x + f1Val * scale - 1.5, centerY - 4, 3, 8);
    ctx.fillText("F₁'", L1_x + f1Val * scale - 6, centerY + 16);
    ctx.fillText(`L₁ Objective (f₁=${f1Val}cm)`, L1_x - 45, centerY - 115);
    ctx.restore();

    // 4. Draw Lens 2 (Eyepiece)
    ctx.save();
    ctx.fillStyle = "#334155";
    ctx.fillRect(L2_x - 14, centerY + 105, 28, railY - (centerY + 105));
    ctx.fillStyle = "#64748b";
    ctx.fillRect(L2_x - 18, centerY + 95, 36, 10);

    const l2Grad = ctx.createLinearGradient(L2_x - 10, 0, L2_x + 10, 0);
    l2Grad.addColorStop(0, "rgba(129, 140, 248, 0.5)");
    l2Grad.addColorStop(0.5, "rgba(255, 255, 255, 0.2)");
    l2Grad.addColorStop(1, "rgba(129, 140, 248, 0.6)");
    ctx.fillStyle = l2Grad;
    ctx.beginPath();
    ctx.ellipse(L2_x, centerY, 10, 90, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(129, 140, 248, 0.85)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Focal Points for Lens 2
    ctx.fillStyle = "#818cf8";
    ctx.font = "bold 9px JetBrains Mono, sans-serif";
    ctx.fillRect(L2_x - f2Val * scale - 1.5, centerY - 4, 3, 8);
    ctx.fillText("F₂", L2_x - f2Val * scale - 6, centerY + 16);
    ctx.fillRect(L2_x + f2Val * scale - 1.5, centerY - 4, 3, 8);
    ctx.fillText("F₂'", L2_x + f2Val * scale - 6, centerY + 16);
    ctx.fillText(`L₂ Eyepiece (f₂=${f2Val}cm)`, L2_x - 45, centerY - 100);
    ctx.restore();

    // 5. Tube Length Bracket (Dimension Line)
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(L1_x, railY - 15);
    ctx.lineTo(L2_x, railY - 15);
    ctx.moveTo(L1_x, railY - 22);
    ctx.lineTo(L1_x, railY - 8);
    ctx.moveTo(L2_x, railY - 22);
    ctx.lineTo(L2_x, railY - 8);
    ctx.stroke();

    ctx.fillStyle = "#34d399";
    ctx.font = "bold 10px JetBrains Mono, sans-serif";
    ctx.fillText(`Tube Length L = ${tubeLen.toFixed(1)} cm`, (L1_x + L2_x) / 2 - 50, railY - 20);

    // 6. Ray Tracing for Selected Configuration
    if (compoundPreset === "telescope") {
      // Keplerian Astronomical Telescope: Parallel incoming starlight at angle alpha
      const alpha = 0.055; // radians (~3.1 degrees)
      const yIntermediate = -f1Val * scale * Math.tan(alpha);

      // Incoming Parallel Starlight
      [-40, 0, 40].forEach(dy => {
        const startX = 50;
        const startY = (centerY + dy) - (L1_x - startX) * Math.tan(alpha);
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(L1_x, centerY + dy);
        // Refract through Objective L1 to intermediate focal plane F1'
        const intX = L1_x + f1Val * scale;
        const intY = centerY + yIntermediate;
        ctx.lineTo(intX, intY);
        // Continue to Eyepiece L2
        const atL2_Y = intY + (L2_x - intX) * ((intY - (centerY + dy)) / (intX - L1_x));
        ctx.lineTo(L2_x, atL2_Y);
        // Emerge as parallel rays at angle beta = -(f1/f2) * alpha
        const beta = -(f1Val / f2Val) * alpha;
        const endX = w - 40;
        const endY = atL2_Y + (endX - L2_x) * Math.tan(beta);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      });

      // Intermediate Image Marker at F1'
      const intX = L1_x + f1Val * scale;
      ctx.strokeStyle = "#ec4899";
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(intX, centerY);
      ctx.lineTo(intX, centerY + yIntermediate);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#ec4899";
      ctx.font = "bold 9px JetBrains Mono, sans-serif";
      ctx.fillText("I₁ (Real, Inverted)", intX - 25, centerY + yIntermediate + 14);

    } else if (compoundPreset === "achromatic") {
      // Achromatic Doublet Demo: Shows Chromatic Correction
      const rayY1 = centerY - 45;
      const rayY2 = centerY + 45;

      // Uncorrected Red ray (656nm) vs Blue ray (486nm)
      [rayY1, rayY2].forEach(ry => {
        // Red Ray
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(50, ry);
        ctx.lineTo(L1_x, ry);
        ctx.lineTo(L1_x + 30.0 * scale, centerY);
        ctx.stroke();

        // Blue Ray (Cemented Doublet converges to identical 30.0 cm point!)
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(50, ry);
        ctx.lineTo(L1_x, ry);
        ctx.lineTo(L1_x + 30.0 * scale, centerY);
        ctx.stroke();
      });

      // Doublet Achromatic Focus
      ctx.fillStyle = "#10b981";
      ctx.beginPath();
      ctx.arc(L1_x + 30.0 * scale, centerY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "bold 10px JetBrains Mono, sans-serif";
      ctx.fillText("Achromatic Focal Plane (f_red = f_blue = 30.0 cm)", L1_x + 30.0 * scale - 75, centerY + 24);

    } else {
      // Compound Microscope / Custom Bench:
      // Object Candle at L1_x - do1Val * scale
      const objX = L1_x - do1Val * scale;
      const objY = centerY;
      const objH = hoVal * scale;

      // Draw Object Candle
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(objX - 4, objY - objH, 8, objH);
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(objX, objY - objH - 6, 5, 0, Math.PI * 2);
      ctx.fill();

      // Object Label
      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 9px JetBrains Mono, sans-serif";
      ctx.fillText(`Object (d_o1=${do1Val.toFixed(1)}cm)`, objX - 30, objY - objH - 14);

      // Ray Tracing through Lens 1
      if (do1Val > f1Val) {
        const di1 = (f1Val * do1Val) / (do1Val - f1Val);
        const m1 = -di1 / do1Val;
        const intX = L1_x + di1 * scale;
        const intY = centerY + m1 * objH;

        // 1. Parallel ray from tip to L1 -> through F1' to I1
        ctx.strokeStyle = "#06b6d4";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(objX, objY - objH);
        ctx.lineTo(L1_x, objY - objH);
        ctx.lineTo(intX, intY);
        ctx.stroke();

        // 2. Chief ray through center of L1 to I1
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(objX, objY - objH);
        ctx.lineTo(L1_x, centerY);
        ctx.lineTo(intX, intY);
        ctx.stroke();

        // Intermediate Candle Image I1
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(intX, centerY);
        ctx.lineTo(intX, intY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillText(`I₁ (m₁=${m1.toFixed(1)}×)`, intX - 25, intY + (m1 < 0 ? 14 : -6));

        // Rays continuing to Lens 2 (Eyepiece)
        const do2 = tubeLen - di1;
        if (do2 > 0) {
          ctx.strokeStyle = "#a855f7";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(intX, intY);
          ctx.lineTo(L2_x, intY);
          // Lens 2 refraction
          const di2 = (f2Val * do2) / (do2 - f2Val);
          if (do2 < f2Val) {
            // Virtual Magnified Image (Microscope!)
            const finalX = L2_x + di2 * scale; // Negative di2
            const finalY = centerY + (m1 * (-di2 / do2)) * objH;

            // Diverging rays to right
            ctx.lineTo(w - 40, intY + (w - 40 - L2_x) * ((intY - centerY) / (L2_x - intX)));
            ctx.stroke();

            // Dashed Virtual Sightlines backwards to final virtual image
            ctx.strokeStyle = "rgba(168, 85, 247, 0.4)";
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(L2_x, intY);
            ctx.lineTo(finalX, finalY);
            ctx.stroke();
            ctx.setLineDash([]);

            // Huge Virtual Image Arrow
            ctx.strokeStyle = "#c084fc";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(finalX, centerY);
            ctx.lineTo(finalX, finalY);
            ctx.stroke();
            ctx.fillStyle = "#c084fc";
            ctx.fillText(`Final Virtual Image (M_tot = ${(m1 * (-di2 / do2)).toFixed(1)}×)`, finalX - 40, finalY - 8);
          }
        }
      }
    }

    // 7. Top Right Scientific ABCD Matrix Card
    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
    ctx.strokeStyle = "rgba(99, 102, 241, 0.4)";
    ctx.lineWidth = 1;
    ctx.fillRect(w - 230, 65, 215, 105);
    ctx.strokeRect(w - 230, 65, 215, 105);

    ctx.fillStyle = "#818cf8";
    ctx.font = "bold 10px JetBrains Mono, sans-serif";
    ctx.fillText("ABCD TRANSFER RAY MATRIX", w - 218, 82);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "9px JetBrains Mono, sans-serif";
    ctx.fillText(`[ A = ${comp.A.toFixed(2)}    B = ${comp.B.toFixed(1)} cm ]`, w - 215, 102);
    ctx.fillText(`[ C = ${comp.C.toFixed(4)} cm⁻¹  D = ${comp.D.toFixed(2)} ]`, w - 215, 120);

    ctx.fillStyle = comp.isAfocal ? "#34d399" : "#38bdf8";
    ctx.font = "bold 9px JetBrains Mono, sans-serif";
    if (comp.isAfocal) {
      ctx.fillText(`Afocal System: C ≈ 0 (Telescope)`, w - 215, 142);
      ctx.fillText(`Angular Mag: M = ${comp.mTotal.toFixed(2)}×`, w - 215, 158);
    } else {
      ctx.fillText(`Effective f_sys: ${isFinite(comp.fSys) ? comp.fSys.toFixed(1) + " cm" : "Afocal"}`, w - 215, 142);
      ctx.fillText(`Linear Mag: M_tot = ${comp.mTotal.toFixed(2)}×`, w - 215, 158);
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
    ctx.fillRect(40, railY, w - 80, 32);

    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(40, railY, w - 80, 32);

    // Metric Rail Graduations
    if (showGraduations) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "9px JetBrains Mono, sans-serif";
      for (let cm = 0; cm <= 80; cm += 5) {
        const xPos = 60 + cm * (scale * 1.35);
        if (xPos > w - 60) break;
        ctx.fillRect(xPos - 0.5, railY, 1, (cm % 10 === 0) ? 9 : 5);
        if (cm % 10 === 0) {
          ctx.fillText(`${cm}`, xPos - 5, railY + 22);
        }
      }
    }

    // 2. Optical Centerline Axis
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(30, centerY);
    ctx.lineTo(w - 30, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Focal Points (F and 2F)
    function drawFocalPoint(xPos, label, color) {
      ctx.fillStyle = color;
      ctx.fillRect(xPos - 1.5, centerY - 5, 3, 10);
      ctx.font = "bold 10px JetBrains Mono, sans-serif";
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

        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(objX, centerY + dy);
        ctx.lineTo(centerX, centerY + dy);
        ctx.stroke();
      });
    } else {
      // Photorealistic Wax Candle Object
      ctx.save();
      const candleGrad = ctx.createLinearGradient(objX - 6, 0, objX + 6, 0);
      candleGrad.addColorStop(0, "#f8fafc");
      candleGrad.addColorStop(0.5, "#fef08a");
      candleGrad.addColorStop(1, "#cbd5e1");
      ctx.fillStyle = candleGrad;
      ctx.fillRect(objX - 6, objY - objH, 12, objH);

      // Carriage Base Clamped to Rail
      ctx.fillStyle = "#334155";
      ctx.fillRect(objX - 12, railY - 18, 24, 18);
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(objX, railY - 9, 3, 0, Math.PI * 2);
      ctx.fill();

      // Flickering Luminous Flame
      const flameH = 14 + Math.sin(Date.now() * 0.015) * 2;
      const flameGrad = ctx.createRadialGradient(objX, objY - objH - flameH / 2, 2, objX, objY - objH - flameH / 2, 10);
      flameGrad.addColorStop(0, "#ffffff");
      flameGrad.addColorStop(0.3, "#fef08a");
      flameGrad.addColorStop(0.7, "#f59e0b");
      flameGrad.addColorStop(1, "rgba(239, 68, 68, 0)");
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.ellipse(objX, objY - objH - flameH / 2, 5, flameH / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Flame Drag Tip Indicator
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(objX, objY - objH, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 6. Ray Tracing Engine (3 Principal Gaussian Rays)
    const img = calculateImage();
    const effF = (opticType === "convex_lens" || opticType === "concave_mirror") ? fVal : -fVal;

    if (!laserMode && isFinite(img.di)) {
      ctx.save();
      const tipX = objX;
      const tipY = objY - objH;
      const imgX = (opticType.includes("lens")) ? (centerX + img.di * scale) : (centerX - img.di * scale);
      const imgY = centerY - img.hi * scale;

      // Ray 1: Parallel to Axis -> Refracts/Reflects through Focus
      ctx.strokeStyle = "#06b6d4";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(centerX, tipY);

      if (opticType === "convex_lens") {
        ctx.lineTo(imgX, imgY);
        if (img.di < 0) {
          // Virtual Image Sightline
          ctx.stroke();
          ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(centerX, tipY);
          ctx.lineTo(imgX, imgY);
        }
      } else if (opticType === "concave_lens") {
        ctx.lineTo(centerX + 120, tipY + (120 / effF) * tipY);
        ctx.stroke();
        ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(centerX, tipY);
        ctx.lineTo(imgX, imgY);
      } else if (opticType === "concave_mirror") {
        ctx.lineTo(imgX, imgY);
      } else if (opticType === "convex_mirror") {
        ctx.lineTo(centerX - 100, tipY - (100 / effF) * tipY);
        ctx.stroke();
        ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(centerX, tipY);
        ctx.lineTo(imgX, imgY);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Ray 2: Chief Ray (Through Center / Vertex)
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(centerX, centerY);
      if (opticType.includes("lens")) {
        ctx.lineTo(imgX, imgY);
        if (img.di < 0) {
          ctx.stroke();
          ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(imgX, imgY);
        }
      } else {
        // Mirror reflection at vertex: angle of reflection = angle of incidence
        ctx.lineTo(imgX, imgY);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Ray 3: Focal Ray
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      if (opticType === "convex_lens" && doVal > effF) {
        ctx.lineTo(centerX, imgY);
        ctx.lineTo(imgX, imgY);
      } else if (opticType === "concave_mirror" && doVal > effF) {
        ctx.lineTo(centerX, imgY);
        ctx.lineTo(imgX, imgY);
      }
      ctx.stroke();
      ctx.restore();

      // 7. Render Formed Image (Candle or Ghost)
      ctx.save();
      const isVirtual = !img.isReal;
      ctx.globalAlpha = isVirtual ? 0.6 : 0.95;

      // Image Candle Body
      ctx.fillStyle = isVirtual ? "#c084fc" : "#10b981";
      ctx.fillRect(imgX - 5, centerY, 10, -img.hi * scale);

      // Image Flame
      ctx.fillStyle = isVirtual ? "#e879f9" : "#fbbf24";
      ctx.beginPath();
      ctx.arc(imgX, centerY - img.hi * scale, Math.abs(img.hi * scale * 0.15) + 3, 0, Math.PI * 2);
      ctx.fill();

      // Image Label
      ctx.font = "bold 9px JetBrains Mono, sans-serif";
      ctx.fillStyle = isVirtual ? "#c084fc" : "#10b981";
      ctx.fillText(isVirtual ? "Virtual Image" : "Real Image", imgX - 25, centerY - img.hi * scale + (img.isUpright ? -10 : 18));
      ctx.restore();
    }

    // 8. Frosted Observation Screen on Rail
    if (showScreen && !isMirror) {
      const scrX = centerX + screenDist * scale;
      ctx.save();

      // Screen Glass Plate
      const screenGrad = ctx.createLinearGradient(scrX - 3, 0, scrX + 3, 0);
      screenGrad.addColorStop(0, "rgba(255, 255, 255, 0.25)");
      screenGrad.addColorStop(0.5, "rgba(251, 191, 36, 0.15)");
      screenGrad.addColorStop(1, "rgba(255, 255, 255, 0.35)");
      ctx.fillStyle = screenGrad;
      ctx.fillRect(scrX - 4, centerY - 110, 8, 220);
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(scrX - 4, centerY - 110, 8, 220);

      // Screen Carriage
      ctx.fillStyle = "#475569";
      ctx.fillRect(scrX - 10, railY - 18, 20, 18);

      // Circle of Confusion (Defocus Blur on Screen)
      if (isFinite(img.di) && img.isReal) {
        const deltaDist = Math.abs(screenDist - img.di);
        const blurRadius = Math.min(28, deltaDist * 1.2 + 2);
        const spotY = centerY - img.hi * scale;

        ctx.fillStyle = "rgba(251, 191, 36, 0.4)";
        ctx.beginPath();
        ctx.arc(scrX, spotY, blurRadius, 0, Math.PI * 2);
        ctx.fill();

        if (deltaDist < 0.8) {
          ctx.fillStyle = "#34d399";
          ctx.font = "bold 9px JetBrains Mono";
          ctx.fillText("SHARP FOCUS", scrX - 28, centerY - 118);
        } else {
          ctx.fillStyle = "#fbbf24";
          ctx.font = "8px JetBrains Mono";
          ctx.fillText(`BLUR (r=${blurRadius.toFixed(0)}px)`, scrX - 25, centerY - 118);
        }
      }
      ctx.restore();
    }
  }

  // -------------------------------------------------------------------
  // Draw Snell's Law & Cauchy Chromatic Dispersion Prism / Grating
  // -------------------------------------------------------------------
  function drawSnellView(w, h, isSmart) {
    const centerX = w / 2;
    const centerY = h / 2;

    const snellRadius = 170;

    // Protractor Disc (Circular Medium 2 Boundary)
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, snellRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Degree Ticks
    for (let deg = 0; deg < 360; deg += 10) {
      const rad = (deg * Math.PI) / 180;
      const rInner = (deg % 30 === 0) ? snellRadius - 12 : snellRadius - 6;
      ctx.beginPath();
      ctx.moveTo(centerX + Math.sin(rad) * rInner, centerY - Math.cos(rad) * rInner);
      ctx.lineTo(centerX + Math.sin(rad) * snellRadius, centerY - Math.cos(rad) * snellRadius);
      ctx.stroke();
    }

    if (interfaceShape === "semicircle") {
      // Semi-circular D-Block (Normal Exit)
      const dGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, snellRadius);
      dGrad.addColorStop(0, "rgba(56, 189, 248, 0.15)");
      dGrad.addColorStop(1, "rgba(56, 189, 248, 0.45)");
      ctx.fillStyle = dGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, snellRadius, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Normal Axis
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - snellRadius - 20);
      ctx.lineTo(centerX, centerY + snellRadius + 20);
      ctx.stroke();
      ctx.setLineDash([]);

      // Incoming Incident Laser Beam
      const theta1Rad = (theta1Deg * Math.PI) / 180;
      const srcX = centerX - snellRadius * Math.sin(theta1Rad);
      const srcY = centerY - snellRadius * Math.cos(theta1Rad);

      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 3;
      if (!isSmart) {
        ctx.shadowColor = "#10b981";
        ctx.shadowBlur = 10;
      }
      ctx.beginPath();
      ctx.moveTo(srcX, srcY);
      ctx.lineTo(centerX, centerY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Laser Diode Pointer
      ctx.fillStyle = "#334155";
      ctx.fillRect(srcX - 12, srcY - 8, 24, 16);
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(srcX - 12, srcY - 8, 24, 16);

      // Snell Refraction Calculation
      const snell = calculateSnell();

      if (snell.tir) {
        // Total Internal Reflection
        const reflX = centerX + snellRadius * Math.sin(theta1Rad);
        const reflY = centerY - snellRadius * Math.cos(theta1Rad);
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(reflX, reflY);
        ctx.stroke();
      } else {
        // Refracted Beam in Medium 2
        const theta2Rad = (snell.theta2Deg * Math.PI) / 180;
        const outX = centerX + snellRadius * Math.sin(theta2Rad);
        const outY = centerY + snellRadius * Math.cos(theta2Rad);

        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(outX, outY);
        ctx.stroke();

        // Weak reflected ray
        if (snell.reflectance > 0.02) {
          const reflX = centerX + snellRadius * Math.sin(theta1Rad);
          const reflY = centerY - snellRadius * Math.cos(theta1Rad);
          ctx.strokeStyle = `rgba(16, 185, 129, ${Math.min(0.8, snell.reflectance * 1.5)})`;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(reflX, reflY);
          ctx.stroke();
        }
      }
    } else if (interfaceShape === "grating") {
      // Transmission Diffraction Grating Plate & Orders
      const gratingW = 8;
      const gratingH = 180;
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(centerX - gratingW / 2, centerY - gratingH / 2, gratingW, gratingH);
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX - gratingW / 2, centerY - gratingH / 2, gratingW, gratingH);

      // Micro-slit rulings
      ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
      ctx.lineWidth = 1;
      for (let y = centerY - gratingH / 2 + 6; y <= centerY + gratingH / 2 - 6; y += 8) {
        ctx.beginPath();
        ctx.moveTo(centerX - gratingW / 2, y);
        ctx.lineTo(centerX + gratingW / 2, y);
        ctx.stroke();
      }

      ctx.fillStyle = "#34d399";
      ctx.font = "bold 9px JetBrains Mono";
      ctx.fillText("GRATING (600 l/mm)", centerX - 45, centerY - gratingH / 2 - 10);

      // Incident Beam
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(centerX - 240, centerY);
      ctx.lineTo(centerX, centerY);
      ctx.stroke();

      // Screen on Right
      const scrX = centerX + 260;
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      ctx.fillRect(scrX, centerY - 140, 6, 280);
      ctx.strokeStyle = "#fbbf24";
      ctx.strokeRect(scrX, centerY - 140, 6, 280);

      // Diffraction Orders m = 0, +1, -1, +2, -2
      const gratingD = 1e-3 / 600; // 600 lines/mm
      const lambdaGreen = 532e-9;
      const lambdaRed = 650e-9;

      [0, 1, -1].forEach(m => {
        const sinTh = (m * lambdaGreen) / gratingD;
        if (Math.abs(sinTh) <= 1.0) {
          const th = Math.asin(sinTh);
          const spotY = centerY + Math.tan(th) * 260;
          ctx.strokeStyle = "#10b981";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(scrX, spotY);
          ctx.stroke();

          ctx.fillStyle = "#10b981";
          ctx.beginPath();
          ctx.arc(scrX + 3, spotY, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#34d399";
          ctx.font = "9px JetBrains Mono";
          ctx.fillText(`m = ${m > 0 ? "+" : ""}${m} (${(th * 180 / Math.PI).toFixed(1)}°)`, scrX + 12, spotY + 3);
        }
      });

    } else {
      // Triangular Cauchy Dispersion Prism
      const pSize = 130;
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - pSize * 0.7);
      ctx.lineTo(centerX - pSize * 0.6, centerY + pSize * 0.4);
      ctx.lineTo(centerX + pSize * 0.6, centerY + pSize * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Incident White Light Beam
      const inX = centerX - 220;
      const inY = centerY + 15;
      const hitX = centerX - pSize * 0.3;
      const hitY = centerY + 5;

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(inX, inY);
      ctx.lineTo(hitX, hitY);
      ctx.stroke();

      // Cauchy dispersion spectrum bands
      const bands = [
        { color: "#ef4444", n: 1.514, label: "Red (656nm)" },
        { color: "#f59e0b", n: 1.517, label: "Orange" },
        { color: "#fbbf24", n: 1.520, label: "Yellow (589nm)" },
        { color: "#10b981", n: 1.524, label: "Green" },
        { color: "#06b6d4", n: 1.528, label: "Cyan" },
        { color: "#3b82f6", n: 1.532, label: "Blue (486nm)" },
        { color: "#8b5cf6", n: 1.538, label: "Violet (404nm)" }
      ];

      bands.forEach((band, bIdx) => {
        const devInside = (band.n - 1) * 0.35 + (bIdx * 0.015);
        const exitX = centerX + pSize * 0.25;
        const exitY = centerY - 15 + bIdx * 3;

        ctx.strokeStyle = band.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(hitX, hitY);
        ctx.lineTo(exitX, exitY);
        ctx.stroke();

        const outX = centerX + 240;
        const outY = exitY + (outX - exitX) * (0.28 + bIdx * 0.05);

        ctx.beginPath();
        ctx.moveTo(exitX, exitY);
        ctx.lineTo(outX, outY);
        ctx.stroke();
      });
      ctx.restore();
    }
    ctx.restore();
  }

  // Update Numerical HUD Telemetry
  function updateTelemetry() {
    if (currentTab === "snell") {
      const snell = calculateSnell();
      document.getElementById("disp-theta1").innerText = `${theta1Deg.toFixed(1)}°`;

      // Repurpose HUD for Snell mode
      document.getElementById("lbl-telem-1").innerText = "Medium 1 (n₁)";
      document.getElementById("val-do").innerText = `${medium1Index.toFixed(3)}`;
      document.getElementById("lbl-telem-2").innerText = "Refracted (θ₂)";
      document.getElementById("val-di").innerText = snell.tir ? "TIR" : `${snell.theta2Deg.toFixed(1)}°`;
      document.getElementById("lbl-telem-3").innerText = "Critical (θ_c)";
      document.getElementById("val-f").innerText = snell.critAngleDeg ? `${snell.critAngleDeg.toFixed(1)}°` : "None";
      document.getElementById("lbl-telem-4").innerText = "Reflectance";
      document.getElementById("val-mag").innerText = `${(snell.reflectance * 100).toFixed(1)}%`;

      const badge = document.getElementById("image-nature-badge");
      if (interfaceShape === "grating") {
        badge.innerText = "Diffraction Grating: d·sin(θ) = m·λ (Wave Dispersion)";
        badge.style.color = "#34d399";
        badge.style.background = "rgba(16, 185, 129, 0.18)";
        badge.style.borderColor = "rgba(16, 185, 129, 0.4)";
      } else if (snell.tir) {
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

    if (currentTab === "compound") {
      const comp = calculateCompoundOptics();
      document.getElementById("lbl-telem-1").innerText = "Objective (f₁)";
      document.getElementById("val-do").innerText = `${f1Val.toFixed(1)} cm`;
      document.getElementById("lbl-telem-2").innerText = "Eyepiece (f₂)";
      document.getElementById("val-di").innerText = `${f2Val.toFixed(1)} cm`;
      document.getElementById("lbl-telem-3").innerText = "Tube Length (L)";
      document.getElementById("val-f").innerText = `${tubeLen.toFixed(1)} cm`;
      document.getElementById("lbl-telem-4").innerText = "System Mag (M)";
      document.getElementById("val-mag").innerText = `${comp.mTotal.toFixed(2)}×`;

      document.getElementById("disp-f1").innerText = `${f1Val.toFixed(1)} cm`;
      document.getElementById("disp-f2").innerText = `${f2Val.toFixed(1)} cm`;
      document.getElementById("disp-tube-len").innerText = `${tubeLen.toFixed(1)} cm`;
      document.getElementById("disp-do1").innerText = (compoundPreset === "telescope") ? "∞ (Collimated)" : `${do1Val.toFixed(1)} cm`;

      const badge = document.getElementById("image-nature-badge");
      if (compoundPreset === "telescope") {
        badge.innerText = `Keplerian Telescope: M_ang = -${(f1Val / f2Val).toFixed(1)}× (Afocal, L = f₁+f₂)`;
        badge.style.color = "#818cf8";
        badge.style.background = "rgba(99, 102, 241, 0.2)";
      } else if (compoundPreset === "microscope") {
        badge.innerText = `Compound Microscope: M_tot = ${comp.mTotal.toFixed(1)}× (Inverted Virtual Image)`;
        badge.style.color = "#34d399";
        badge.style.background = "rgba(16, 185, 129, 0.18)";
      } else if (compoundPreset === "achromatic") {
        badge.innerText = "Achromatic Doublet: Zero Longitudinal Chromatic Aberration";
        badge.style.color = "#fbbf24";
        badge.style.background = "rgba(245, 158, 11, 0.2)";
      } else {
        badge.innerText = `Dual-Lens System: M_tot = ${comp.mTotal.toFixed(2)}×`;
        badge.style.color = "#38bdf8";
        badge.style.background = "rgba(56, 189, 248, 0.2)";
      }
      requestRender();
      return;
    }

    // Lens & Mirror Telemetry
    document.getElementById("lbl-telem-1").innerText = "Object Dist (d_o)";
    document.getElementById("lbl-telem-2").innerText = "Image Dist (d_i)";
    document.getElementById("lbl-telem-3").innerText = "Focal Length (f)";
    document.getElementById("lbl-telem-4").innerText = "Magnification (m)";

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
    } else if (currentTab === "compound") {
      // Compound Optics Carriages
      const L1_x = centerX - (tubeLen * 0.5) * scale;
      const L2_x = centerX + (tubeLen * 0.5) * scale;
      const objX = L1_x - do1Val * scale;

      // Check Lens 1 Carriage
      if (Math.abs(coords.x - L1_x) < 20 && coords.y >= centerY - 80 && coords.y <= railY + 15) {
        dragTarget = "lens1_pos";
        canvas.setPointerCapture(e.pointerId);
        return;
      }
      // Check Lens 2 Carriage
      if (Math.abs(coords.x - L2_x) < 20 && coords.y >= centerY - 80 && coords.y <= railY + 15) {
        dragTarget = "lens2_pos";
        canvas.setPointerCapture(e.pointerId);
        return;
      }
      // Check Object Candle
      if (Math.abs(coords.x - objX) < 25 && coords.y >= centerY - 50 && coords.y <= railY + 15) {
        dragTarget = "compound_obj";
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
      } else if (currentTab === "compound") {
        const L1_x = centerX - (tubeLen * 0.5) * scale;
        const L2_x = centerX + (tubeLen * 0.5) * scale;
        if (Math.abs(coords.x - L1_x) < 20 || Math.abs(coords.x - L2_x) < 20) {
          canvas.style.cursor = "ew-resize";
        } else {
          canvas.style.cursor = "crosshair";
        }
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
    } else if (dragTarget === "lens2_pos" || dragTarget === "lens1_pos") {
      const deltaX = Math.abs(coords.x - centerX) * 2;
      tubeLen = Math.max(15, Math.min(60, deltaX / scale));
      const inTube = document.getElementById("input-tube-len");
      if (inTube) inTube.value = tubeLen;
      updateTelemetry();
    } else if (dragTarget === "compound_obj") {
      const L1_x = centerX - (tubeLen * 0.5) * scale;
      const newDo1 = (L1_x - coords.x) / scale;
      do1Val = Math.max(6, Math.min(65, newDo1));
      const inDo1 = document.getElementById("input-do1");
      if (inDo1) inDo1.value = do1Val;
      updateTelemetry();
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

  // Compound Controls
  const selComp = document.getElementById("select-compound-preset");
  const inF1 = document.getElementById("input-f1");
  const inF2 = document.getElementById("input-f2");
  const inTube = document.getElementById("input-tube-len");
  const inDo1 = document.getElementById("input-do1");

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

  // Compound Optics Handlers
  selComp?.addEventListener("change", (e) => {
    compoundPreset = e.target.value;
    if (compoundPreset === "telescope") {
      f1Val = 30.0;
      f2Val = 10.0;
      tubeLen = 40.0;
      do1Val = 65.0;
    } else if (compoundPreset === "microscope") {
      f1Val = 8.0;
      f2Val = 12.0;
      tubeLen = 46.0;
      do1Val = 10.0;
    } else if (compoundPreset === "achromatic") {
      f1Val = 30.0;
      f2Val = 15.0;
      tubeLen = 35.0;
      do1Val = 60.0;
    }
    if (inF1) inF1.value = f1Val;
    if (inF2) inF2.value = f2Val;
    if (inTube) inTube.value = tubeLen;
    if (inDo1) inDo1.value = do1Val;
    updateTelemetry();
  });

  inF1?.addEventListener("input", (e) => {
    f1Val = parseFloat(e.target.value);
    updateTelemetry();
  });

  inF2?.addEventListener("input", (e) => {
    f2Val = parseFloat(e.target.value);
    updateTelemetry();
  });

  inTube?.addEventListener("input", (e) => {
    tubeLen = parseFloat(e.target.value);
    updateTelemetry();
  });

  inDo1?.addEventListener("input", (e) => {
    do1Val = parseFloat(e.target.value);
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
  const tabCompound = document.getElementById("optics-tab-compound");
  const tabPhoto = document.getElementById("optics-tab-photo");

  const benchControls = document.getElementById("controls-bench-mode");
  const snellControls = document.getElementById("controls-snell-mode");
  const compoundControls = document.getElementById("controls-compound-mode");
  const lensPresets = document.getElementById("presets-lens-group");
  const snellPresets = document.getElementById("presets-snell-group");
  const compoundPresets = document.getElementById("presets-compound-group");
  const formulaBar = document.getElementById("optics-formula-bar");
  const chkScreenLabel = document.getElementById("label-chk-screen");

  function setActiveTab(tab) {
    currentTab = tab;
    [tabLens, tabMirror, tabSnell, tabCompound, tabPhoto].forEach(t => {
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
      compoundControls.style.display = "none";
      lensPresets.style.display = "flex";
      snellPresets.style.display = "none";
      compoundPresets.style.display = "none";
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
      compoundControls.style.display = "none";
      lensPresets.style.display = "flex";
      snellPresets.style.display = "none";
      compoundPresets.style.display = "none";
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
      compoundControls.style.display = "none";
      lensPresets.style.display = "none";
      snellPresets.style.display = "flex";
      compoundPresets.style.display = "none";
      formulaBar.style.display = "none";
    } else if (tab === "compound") {
      tabCompound.classList.add("active");
      tabCompound.style.background = "rgba(99, 102, 241, 0.25)";
      tabCompound.style.color = "#818cf8";
      tabCompound.style.fontWeight = "700";

      benchControls.style.display = "none";
      snellControls.style.display = "none";
      compoundControls.style.display = "grid";
      lensPresets.style.display = "none";
      snellPresets.style.display = "none";
      compoundPresets.style.display = "flex";
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
  tabCompound?.addEventListener("click", () => setActiveTab("compound"));
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

  document.getElementById("preset-grating")?.addEventListener("click", () => {
    medium1Index = 1.000;
    medium2Index = 1.000;
    interfaceShape = "grating";
    document.getElementById("select-interface-shape").value = "grating";
    updateTelemetry();
  });

  // Compound Presets
  document.getElementById("preset-telescope")?.addEventListener("click", () => {
    compoundPreset = "telescope";
    selComp.value = "telescope";
    f1Val = 30.0;
    f2Val = 10.0;
    tubeLen = 40.0;
    do1Val = 65.0;
    if (inF1) inF1.value = 30;
    if (inF2) inF2.value = 10;
    if (inTube) inTube.value = 40;
    if (inDo1) inDo1.value = 65;
    updateTelemetry();
  });

  document.getElementById("preset-microscope")?.addEventListener("click", () => {
    compoundPreset = "microscope";
    selComp.value = "microscope";
    f1Val = 8.0;
    f2Val = 12.0;
    tubeLen = 46.0;
    do1Val = 10.0;
    if (inF1) inF1.value = 8;
    if (inF2) inF2.value = 12;
    if (inTube) inTube.value = 46;
    if (inDo1) inDo1.value = 10;
    updateTelemetry();
  });

  document.getElementById("preset-achromatic")?.addEventListener("click", () => {
    compoundPreset = "achromatic";
    selComp.value = "achromatic";
    f1Val = 30.0;
    f2Val = 15.0;
    tubeLen = 35.0;
    do1Val = 60.0;
    if (inF1) inF1.value = 30;
    if (inF2) inF2.value = 15;
    if (inTube) inTube.value = 35;
    if (inDo1) inDo1.value = 60;
    updateTelemetry();
  });

  document.getElementById("preset-confocal")?.addEventListener("click", () => {
    compoundPreset = "custom";
    selComp.value = "custom";
    f1Val = 20.0;
    f2Val = 15.0;
    tubeLen = 35.0; // Confocal L = f1 + f2
    do1Val = 30.0;
    if (inF1) inF1.value = 20;
    if (inF2) inF2.value = 15;
    if (inTube) inTube.value = 35;
    if (inDo1) inDo1.value = 30;
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
          "Phenomenon": snell.tir ? "Total Internal Reflection" : (interfaceShape === "grating" ? "Diffraction Grating" : "Refraction")
        }
      });
    } else if (currentTab === "compound") {
      const comp = calculateCompoundOptics();
      LabTrialStore.addTrial("optics", {
        measurements: {
          "Apparatus Mode": `Compound System (${compoundPreset})`,
          "Objective (f₁)": `${f1Val.toFixed(1)} cm`,
          "Eyepiece (f₂)": `${f2Val.toFixed(1)} cm`,
          "Tube Length (L)": `${tubeLen.toFixed(1)} cm`,
          "Intermediate Image (di1)": `${comp.di1.toFixed(1)} cm`,
          "Final Image (di2)": isFinite(comp.di2) ? `${comp.di2.toFixed(1)} cm` : "Infinity",
          "System Magnification (M)": `${comp.mTotal.toFixed(2)}×`,
          "Matrix A, B, C, D": `${comp.A.toFixed(2)}, ${comp.B.toFixed(1)}, ${comp.C.toFixed(4)}, ${comp.D.toFixed(2)}`
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
        const d_o = tr.measurements["Object Distance (do)"] || tr.measurements["Objective (f₁)"] || tr.measurements["Incidence Angle (θ₁)"];
        const d_i = tr.measurements["Image Distance (di)"] || tr.measurements["System Magnification (M)"] || tr.measurements["Refracted Angle (θ₂)"];
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
        "Compound System": currentTab === "compound" ? compoundPreset : "N/A",
        "Tube Length": currentTab === "compound" ? `${tubeLen.toFixed(1)} cm` : "N/A",
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
      title: "Geometric, Wave & Compound Multi-Lens Optics",
      subject: "Physics",
      inquiryQuestion: "How do refractive index contrasts, boundary geometry, and multi-element lens cascades govern optical magnification, diffraction orders, and aberration correction?",
      parameters: {
        "Optical System": currentTab === "compound" ? `Compound Multi-Lens (${compoundPreset})` : opticType,
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
        "M_{\\text{telescope}} = -\\frac{f_{\\text{objective}}}{f_{\\text{eyepiece}}} \\quad (\\text{Angular Magnification})",
        "M_{\\text{microscope}} = m_1 \\times m_2 = \\left(-\\frac{d_{i1}}{d_{o1}}\\right) \\left(-\\frac{d_{i2}}{d_{o2}}\\right)",
        "\\mathbf{M} = \\begin{pmatrix} 1 & 0 \\\\ -1/f_2 & 1 \\end{pmatrix} \\begin{pmatrix} 1 & L \\\\ 0 & 1 \\end{pmatrix} \\begin{pmatrix} 1 & 0 \\\\ -1/f_1 & 1 \\end{pmatrix} \\quad (\\text{ABCD Ray Matrix})",
        "d \\sin \\theta_m = m \\lambda \\quad (\\text{Diffraction Grating})",
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
