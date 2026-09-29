// Edugates-ClipSAT Science Labs - Precision Geometric Optics & Ray Tracing Laboratory
// Photorealistic Optical Rail, Anti-Reflective Coated Lenses, Multi-Beam Laser Collimator,
// 4K Optical Bench Photography, Dynamic Frosted Glass Screen, and Real-Time Lens Telemetry.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";

export function initOpticsLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="lab-container">
      <!-- Mode & Visual Header Toolbar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding: 10px 18px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #6366f1; box-shadow: 0 0 10px #6366f1;"></span>
            Precision Geometric Optics Bench
          </span>
          <span class="badge" style="background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); color: #818cf8; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            Thorlabs Grade Optical Rail Metrology
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 12px;">
          <!-- View Switcher -->
          <div class="lab-view-switcher" style="display: flex; border-radius: 8px; padding: 3px;">
            <button id="optics-mode-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Ray Tracing & Laser
            </button>
            <button id="optics-mode-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Optical Rail
            </button>
          </div>

          <!-- Laser Collimator Toggle -->
          <label class="lab-checkbox-label" style="display: flex; align-items: center; gap: 6px; font-size: 0.78rem; cursor: pointer; user-select: none;">
            <input type="checkbox" id="chk-laser" style="accent-color: #10b981; width: 15px; height: 15px;">
            <span style="color: #34d399; font-weight: 600;">532nm Green Laser Mode</span>
          </label>
        </div>
      </div>

      <!-- Main Optical Bench Canvas Viewport -->
      <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(99, 102, 241, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: #070a12; overflow: hidden; height: 490px;">
        <canvas id="optics-bench-canvas" width="1000" height="490" style="height: 490px; width: 100%; display: block;"></canvas>

        <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
        <div id="optics-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
          <img src="assets/labs/optics_bench.jpg" alt="4K Geometric Optics Precision Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
          
          <!-- Live Analytical Telemetry Callout on Photo -->
          <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Calibrated Rail Base</div>
              <div style="color: #818cf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.95rem;">Extruded Anodized Aluminum Rail</div>
            </div>
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Coated Double Convex Lens</div>
              <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.95rem;">Crown Glass • MgF₂ Anti-Reflection</div>
            </div>
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Projection Screen</div>
              <div style="color: #fbbf24; font-weight: 700; font-family: var(--font-mono); font-size: 0.95rem;">Frosted Glass Real Image Capture</div>
            </div>
          </div>
        </div>

        <!-- Top HUD: Status & Badges (Left) & Digital Telemetry (Right) Unified to Prevent Overlap -->
        <div class="sim-top-hud-bar" style="position: absolute; top: 12px; left: 14px; right: 14px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; pointer-events: none; z-index: 10;">
          <div class="sim-hud-badges" style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px; pointer-events: auto; max-width: 58%; min-width: 0;">
            <span class="badge" style="background: rgba(15, 23, 42, 0.92); border: 1px solid rgba(99, 102, 241, 0.4); padding: 5px 12px; border-radius: 9999px; font-family: var(--font-mono); font-size: 0.8rem; color: #818cf8; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); white-space: nowrap;">
              <span id="optics-type-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #6366f1; display: inline-block;"></span>
              <span id="optics-type-label">Converging Biconvex Lens (f = +15.0 cm)</span>
            </span>
            <span class="badge" id="image-nature-badge" style="background: rgba(16, 185, 129, 0.18); border: 1px solid rgba(16, 185, 129, 0.4); padding: 5px 12px; border-radius: 9999px; font-family: var(--font-mono); font-size: 0.8rem; color: #34d399; font-weight: 700; white-space: nowrap;">
              Real, Inverted Image (m = -1.00)
            </span>
          </div>

          <!-- Top Right Digital Optical Telemetry -->
          <div class="sim-telemetry-dashboard" style="display: flex; gap: 10px; font-family: var(--font-mono); font-size: 0.82rem; padding: 8px 14px; border-radius: 12px; backdrop-filter: blur(12px); box-shadow: 0 10px 25px rgba(0,0,0,0.6); pointer-events: auto; flex-shrink: 0;">
            <div style="border-right: 1px solid rgba(255,255,255,0.1); padding-right: 10px;">
              <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase;">Object Dist (d_o)</div>
              <div style="color: #f59e0b; font-weight: 700; font-size: 0.98rem;" id="val-do">30.0 cm</div>
            </div>
            <div style="border-right: 1px solid rgba(255,255,255,0.1); padding-right: 10px;">
              <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase;">Image Dist (d_i)</div>
              <div style="color: #10b981; font-weight: 700; font-size: 0.98rem;" id="val-di">30.0 cm</div>
            </div>
            <div style="border-right: 1px solid rgba(255,255,255,0.1); padding-right: 10px;">
              <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase;">Focal Length (f)</div>
              <div style="color: #818cf8; font-weight: 700; font-size: 0.98rem;" id="val-f">15.0 cm</div>
            </div>
            <div>
              <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase;">Magnification (m)</div>
              <div style="color: #38bdf8; font-weight: 700; font-size: 0.98rem;" id="val-mag">-1.00×</div>
            </div>
          </div>
        </div>

        <!-- Bottom Ray Tracing Legend Bar -->
        <div id="optics-formula-bar" class="sim-floating-formula-bar" style="position: absolute; bottom: 12px; left: 16px; right: 16px; backdrop-filter: blur(12px); border-radius: 12px; padding: 8px 18px; display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap; gap: 14px; font-size: 0.82rem; z-index: 10;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 14px; height: 3px; background: #06b6d4; border-radius: 2px;"></span>
            <span style="color: #06b6d4; font-weight: 600;">Parallel Ray:</span> Parallel to axis → Refracts through focus F'
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 14px; height: 3px; background: #f59e0b; border-radius: 2px;"></span>
            <span style="color: #f59e0b; font-weight: 600;">Focal Ray:</span> Passes through focus F → Refracts parallel to axis
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 14px; height: 3px; background: #10b981; border-radius: 2px;"></span>
            <span style="color: #10b981; font-weight: 600;">Chief Central Ray:</span> Undeviated straight through optical center C
        </div>
      </div>
      </div>

      <!-- Controls Panel & Presets -->
      <div class="lab-controls-panel" style="margin-top: 18px;">
        <!-- Lens Type Selector -->
        <div class="control-group">
          <label class="control-label">
            <span>Optical Element Type</span>
          </label>
          <select id="select-optic-type" class="select-input" style="font-weight: 600;">
            <option value="convex_lens" selected>Convex Lens (Converging, f > 0)</option>
            <option value="concave_lens">Concave Lens (Diverging, f < 0)</option>
          </select>
        </div>

        <!-- Object Distance Slider -->
        <div class="control-group">
          <label class="control-label">
            <span>Object Distance (d_o)</span>
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
        <div class="control-group">
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
        <div class="control-group">
          <label class="control-label">
            <span>Light Source Height (h_o)</span>
            <span class="control-val" id="disp-ho">10.0 cm</span>
          </label>
          <input type="range" id="input-ho" class="custom-slider" min="4" max="18" value="10" step="0.5">
        </div>

        <!-- Guided Inquiry Case Presets -->
        <div class="lab-action-buttons">
          <button class="btn btn-secondary" id="preset-2f" style="border-color: rgba(16, 185, 129, 0.4); color: #34d399;">
            Case 1: Object at 2F (m = -1, Same Size)
          </button>
          <button class="btn btn-secondary" id="preset-f-2f" style="border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;">
            Case 2: Between F and 2F (Projector Mode)
          </button>
          <button class="btn btn-secondary" id="preset-mag-glass" style="border-color: rgba(245, 158, 11, 0.4); color: #fbbf24;">
            Case 3: Inside F (Magnifying Glass)
          </button>
          <button class="btn btn-secondary" id="preset-concave" style="border-color: rgba(139, 92, 246, 0.4); color: #c084fc;">
            Case 4: Diverging Lens (Virtual Image)
          </button>

          <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #f8fafc; cursor: pointer; user-select: none; margin-left: auto;">
            <input type="checkbox" id="chk-grid" checked style="accent-color: #38bdf8; width: 16px; height: 16px;">
            <span>Show Metric Graduations</span>
          </label>
        </div>
      </div>

      <!-- Telemetry Suite & Multi-Trial Bar -->
      <div class="lab-telemetry-suite-bar">
        <div class="lab-trials-badge-group" id="optics-trials-badge-group">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">Ray Tracing Lens Bench Log:</span>
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
            <span>📑 Generate Lab Report</span>
          </button>
        </div>
      </div>

      <!-- Post-Lab Checkpoint Assessment Mount -->
      <div id="optics-checkpoint-container"></div>
    </div>
  `;

  const canvas = document.getElementById("optics-bench-canvas");
  const ctx = canvas.getContext("2d");
  const photoOverlay = document.getElementById("optics-photo-overlay");

  // State
  let doVal = 30.0; // cm
  let fVal = 15.0; // cm
  let hoVal = 10.0; // cm
  let opticType = "convex_lens";
  let showGraduations = true;
  let laserMode = false;
  let flameFlicker = 0;
  let animId = null;

  const scale = 7.5; // pixels per cm

  function calculateImage() {
    let f = fVal;
    if (opticType === "concave_lens") f = -fVal;

    if (Math.abs(doVal - f) < 0.05) {
      return { di: Infinity, m: Infinity, hi: Infinity, isReal: false, isUpright: true };
    }

    const di = (f * doVal) / (doVal - f);
    const m = -di / doVal;
    const hi = m * hoVal;
    const isReal = di > 0;
    const isUpright = m > 0;

    return { di, m, hi, isReal, isUpright };
  }

  function draw() {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    // 1. Dark Laboratory Ambient Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, "#070a14");
    bgGrad.addColorStop(0.5, "#0b1220");
    bgGrad.addColorStop(1, "#0f172a");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    const centerX = w / 2;
    const centerY = h / 2 - 25;
    const railY = centerY + 130;

    // 2. Optical Rail Bench (Anodized Aluminum with Metric Scale)
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

    // Millimeter Metric Ticks on Optical Rail
    if (showGraduations) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "8px JetBrains Mono";
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

    // 3. Principal Optical Axis (Horizontal Guideline)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(30, centerY);
    ctx.lineTo(w - 30, centerY);
    ctx.stroke();

    // 4. Focal Point Markers (F, 2F, F', 2F')
    function drawFocalPoint(xPos, label, color = "#818cf8") {
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(xPos, centerY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.font = "bold 11px JetBrains Mono";
      ctx.fillStyle = color;
      ctx.fillText(label, xPos - 8, centerY + 18);
    }

    const fSign = (opticType === "convex_lens") ? 1 : -1;
    drawFocalPoint(centerX - fVal * scale, (fSign > 0 ? "F" : "F'"), "#818cf8");
    drawFocalPoint(centerX - 2 * fVal * scale, (fSign > 0 ? "2F" : "2F'"), "#6366f1");
    drawFocalPoint(centerX + fVal * scale, (fSign > 0 ? "F'" : "F"), "#818cf8");
    drawFocalPoint(centerX + 2 * fVal * scale, (fSign > 0 ? "2F'" : "2F"), "#6366f1");

    // 5. Optical Lens Holder Stand & Glass Lens
    ctx.fillStyle = "#334155";
    ctx.fillRect(centerX - 16, centerY + 105, 32, railY - (centerY + 105));
    ctx.fillStyle = "#64748b";
    ctx.fillRect(centerX - 20, centerY + 95, 40, 10);
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(centerX + 18, centerY + 100, 5, 0, Math.PI * 2);
    ctx.fill();

    // Photorealistic Glass Lens
    ctx.save();
    if (opticType === "convex_lens") {
      const lensGrad = ctx.createLinearGradient(centerX - 14, 0, centerX + 14, 0);
      lensGrad.addColorStop(0, "rgba(56, 189, 248, 0.45)");
      lensGrad.addColorStop(0.3, "rgba(255, 255, 255, 0.2)");
      lensGrad.addColorStop(0.7, "rgba(16, 185, 129, 0.15)");
      lensGrad.addColorStop(1, "rgba(56, 189, 248, 0.55)");

      ctx.fillStyle = lensGrad;
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 15, 115, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else {
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
    }
    ctx.restore();

    // 6. Object (Candle or Laser Diode Array)
    const objX = centerX - doVal * scale;
    const objY = centerY;
    const objH = hoVal * scale;

    if (laserMode) {
      // 532nm Green Laser Diode Emitter Box
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(objX - 25, centerY - 45, 25, 90);
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(objX - 25, centerY - 45, 25, 90);

      // Laser apertures
      [-30, 0, 30].forEach(dy => {
        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.arc(objX, centerY + dy, 3, 0, Math.PI * 2);
        ctx.fill();

        // High-Intensity Green Laser Beams
        ctx.strokeStyle = "rgba(52, 211, 153, 0.9)";
        ctx.lineWidth = 2.5;
        ctx.shadowColor = "#34d399";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(objX, centerY + dy);
        ctx.lineTo(centerX, centerY + dy);

        // Refract through lens
        const fR = (opticType === "convex_lens") ? (centerX + fVal * scale) : (centerX - fVal * scale);
        const slope = (centerY - (centerY + dy)) / (fR - centerX);
        ctx.lineTo(w - 40, (centerY + dy) + slope * (w - 40 - centerX));
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

      // Flame
      flameFlicker = (Math.sin(Date.now() / 120) * 1.5);
      const flameY = objY - objH - flameFlicker;

      const flameGrad = ctx.createRadialGradient(objX, flameY + 6, 2, objX, flameY + 4, 14);
      flameGrad.addColorStop(0, "#ffffff");
      flameGrad.addColorStop(0.3, "#fef08a");
      flameGrad.addColorStop(0.7, "#f59e0b");
      flameGrad.addColorStop(1, "rgba(239, 68, 68, 0)");

      ctx.fillStyle = flameGrad;
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.ellipse(objX, flameY + 4, 6, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // 7. Calculate Image & Principal Rays
      const img = calculateImage();
      const tipX = objX;
      const tipY = objY - objH;

      if (Math.abs(doVal - fVal) > 0.05 && isFinite(img.di)) {
        const imgX = centerX + img.di * scale;
        const imgY = centerY - img.hi * scale;

        // RAY 1: Parallel Ray (Cyan)
        ctx.strokeStyle = "#06b6d4";
        ctx.lineWidth = 2.5;
        ctx.shadowColor = "#06b6d4";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(centerX, tipY);

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
        ctx.stroke();

        // RAY 2: Focal Ray (Amber)
        ctx.strokeStyle = "#f59e0b";
        ctx.shadowColor = "#f59e0b";
        ctx.beginPath();
        if (opticType === "convex_lens") {
          if (img.isReal) {
            const fLeftX = centerX - fVal * scale;
            const slope = (centerY - tipY) / (fLeftX - tipX);
            const lensY = tipY + slope * (centerX - tipX);
            ctx.moveTo(tipX, tipY);
            ctx.lineTo(centerX, lensY);
            ctx.lineTo(imgX, imgY);
            ctx.lineTo(w - 40, imgY);
          }
        }
        ctx.stroke();

        // RAY 3: Central Chief Ray (Emerald)
        ctx.strokeStyle = "#10b981";
        ctx.shadowColor = "#10b981";
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(centerX, centerY);
        if (img.isReal) {
          ctx.lineTo(imgX, imgY);
        } else {
          const cSlope = (centerY - tipY) / (centerX - tipX);
          ctx.lineTo(w - 40, centerY + cSlope * (w - 40 - centerX));
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

        // Formed Image
        if (imgX >= 40 && imgX <= w - 40) {
          const isVirtual = !img.isReal;
          ctx.save();
          ctx.globalAlpha = isVirtual ? 0.65 : 0.95;

          // Frosted Glass Screen at Real Image Plane
          if (img.isReal) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
            ctx.fillRect(imgX - 4, centerY - 120, 8, 240);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
            ctx.strokeRect(imgX - 4, centerY - 120, 8, 240);
          }

          // Image Candle Wax
          ctx.fillStyle = isVirtual ? "rgba(139, 92, 246, 0.6)" : "#fef08a";
          const waxH = Math.abs(img.hi * scale) * 0.75;
          const waxY = img.isUpright ? (centerY - waxH) : centerY;
          ctx.fillRect(imgX - 5, waxY, 10, waxH);

          // Image Flame
          const imFlameY = img.isUpright ? (centerY - Math.abs(img.hi * scale)) : (centerY + Math.abs(img.hi * scale));
          ctx.fillStyle = isVirtual ? "#c084fc" : "#f59e0b";
          ctx.shadowColor = isVirtual ? "#c084fc" : "#f59e0b";
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.ellipse(imgX, imFlameY, 5, 10, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.restore();

          // Label
          ctx.fillStyle = isVirtual ? "#c084fc" : "#10b981";
          ctx.font = "bold 10px JetBrains Mono";
          ctx.fillText(isVirtual ? "Virtual Image" : "Real Projected Image", imgX - 35, (img.isUpright ? imFlameY - 14 : imFlameY + 22));
        }
      }
    }

    ctx.restore();
  }

  function updateTelemetry() {
    const img = calculateImage();

    document.getElementById("val-do").innerText = `${doVal.toFixed(1)} cm`;
    document.getElementById("disp-do").innerText = `${doVal.toFixed(1)} cm`;
    document.getElementById("val-f").innerText = `${fVal.toFixed(1)} cm`;
    document.getElementById("disp-f").innerText = `${fVal.toFixed(1)} cm`;
    document.getElementById("disp-ho").innerText = `${hoVal.toFixed(1)} cm`;

    const badge = document.getElementById("image-nature-badge");

    if (!isFinite(img.di)) {
      document.getElementById("val-di").innerText = "Infinity (Parallel)";
      document.getElementById("val-mag").innerText = "N/A";
      badge.innerText = "No Image Formed (Rays Parallel at Focus)";
      badge.style.color = "#f59e0b";
      badge.style.background = "rgba(245, 158, 11, 0.2)";
    } else {
      document.getElementById("val-di").innerText = `${img.di.toFixed(1)} cm`;
      document.getElementById("val-mag").innerText = `${img.m.toFixed(2)}×`;

      if (img.isReal) {
        badge.innerText = `Real, Inverted Image (m = ${img.m.toFixed(2)})`;
        badge.style.color = "#34d399";
        badge.style.background = "rgba(16, 185, 129, 0.18)";
      } else {
        badge.innerText = `Virtual, Upright Image (m = +${Math.abs(img.m).toFixed(2)})`;
        badge.style.color = "#c084fc";
        badge.style.background = "rgba(139, 92, 246, 0.2)";
      }
    }
  }

  function renderLoop() {
    draw();
    animId = requestAnimationFrame(renderLoop);
  }
  renderLoop();

  // Control Handlers
  const inDo = document.getElementById("input-do");
  const inF = document.getElementById("input-f");
  const inHo = document.getElementById("input-ho");
  const selOptic = document.getElementById("select-optic-type");

  inDo.addEventListener("input", (e) => {
    doVal = parseFloat(e.target.value);
    updateTelemetry();
  });

  inF.addEventListener("input", (e) => {
    fVal = parseFloat(e.target.value);
    updateTelemetry();
  });

  inHo.addEventListener("input", (e) => {
    hoVal = parseFloat(e.target.value);
    updateTelemetry();
  });

  selOptic.addEventListener("change", (e) => {
    opticType = e.target.value;
    const label = document.getElementById("optics-type-label");
    const dot = document.getElementById("optics-type-dot");
    if (opticType === "convex_lens") {
      label.innerText = `Converging Biconvex Lens (f = +${fVal.toFixed(1)} cm)`;
      dot.style.background = "#6366f1";
    } else {
      label.innerText = `Diverging Biconcave Lens (f = -${fVal.toFixed(1)} cm)`;
      dot.style.background = "#8b5cf6";
    }
    updateTelemetry();
  });

  // Presets
  document.getElementById("preset-2f").addEventListener("click", () => {
    opticType = "convex_lens";
    selOptic.value = "convex_lens";
    fVal = 15;
    inF.value = 15;
    doVal = 30;
    inDo.value = 30;
    updateTelemetry();
  });

  document.getElementById("preset-f-2f").addEventListener("click", () => {
    opticType = "convex_lens";
    selOptic.value = "convex_lens";
    fVal = 15;
    inF.value = 15;
    doVal = 22.5;
    inDo.value = 22.5;
    updateTelemetry();
  });

  document.getElementById("preset-mag-glass").addEventListener("click", () => {
    opticType = "convex_lens";
    selOptic.value = "convex_lens";
    fVal = 18;
    inF.value = 18;
    doVal = 9;
    inDo.value = 9;
    updateTelemetry();
  });

  document.getElementById("preset-concave").addEventListener("click", () => {
    opticType = "concave_lens";
    selOptic.value = "concave_lens";
    fVal = 15;
    inF.value = 15;
    doVal = 25;
    inDo.value = 25;
    updateTelemetry();
  });

  document.getElementById("chk-grid").addEventListener("change", (e) => {
    showGraduations = e.target.checked;
  });

  document.getElementById("chk-laser").addEventListener("change", (e) => {
    laserMode = e.target.checked;
  });

  // View Switcher
  const btnSim = document.getElementById("optics-mode-sim");
  const btnPhoto = document.getElementById("optics-mode-photo");

  btnSim.addEventListener("click", () => {
    photoOverlay.style.display = "none";
    const formulaBar = document.getElementById("optics-formula-bar");
    if (formulaBar) formulaBar.style.display = "flex";
    btnSim.style.background = "rgba(99, 102, 241, 0.25)";
    btnSim.style.color = "#818cf8";
    btnPhoto.style.background = "transparent";
    btnPhoto.style.color = "#94a3b8";
  });

  btnPhoto.addEventListener("click", () => {
    photoOverlay.style.display = "block";
    const formulaBar = document.getElementById("optics-formula-bar");
    if (formulaBar) formulaBar.style.display = "none";
    btnPhoto.style.background = "rgba(99, 102, 241, 0.25)";
    btnPhoto.style.color = "#818cf8";
    btnSim.style.background = "transparent";
    btnSim.style.color = "#94a3b8";
  });

  // Telemetry Suite: Record Current State as Trial
  document.getElementById("btn-record-optics-trial")?.addEventListener("click", () => {
    const img = calculateImage();
    const effF = opticType === "convex_lens" ? fVal : -fVal;

    LabTrialStore.addTrial("optics", {
      measurements: {
        "Lens Architecture": opticType === "convex_lens" ? "Convex (+f)" : "Concave (-f)",
        "Focal Length (f)": `${effF.toFixed(1)} cm`,
        "Object Distance (do)": `${doVal.toFixed(1)} cm`,
        "Image Distance (di)": isFinite(img.di) ? `${img.di.toFixed(1)} cm` : "Infinity",
        "Magnification (m)": isFinite(img.m) ? `${img.m.toFixed(2)}×` : "N/A",
        "Image Character": img.isReal ? "Real, Inverted" : "Virtual, Upright"
      }
    });

    const trials = LabTrialStore.getTrials("optics");
    trials.forEach((tr, i) => {
      const pill = document.getElementById(`optics-pill-trial-${i + 1}`);
      if (pill) {
        pill.style.opacity = "1";
        pill.innerText = `Bench ${tr.trialNumber}: do=${tr.measurements["Object Distance (do)"]}, di=${tr.measurements["Image Distance (di)"]} (m=${tr.measurements["Magnification (m)"]})`;
      }
    });
  });

  // Telemetry Suite: Export CSV
  document.getElementById("btn-export-optics-csv")?.addEventListener("click", () => {
    const img = calculateImage();
    const effF = opticType === "convex_lens" ? fVal : -fVal;

    exportLabDataCsv({
      title: "Precision Geometric Optics & Ray Tracing Laboratory",
      labId: "optics",
      parameters: {
        "Lens System": opticType === "convex_lens" ? "Double Convex (Converging)" : "Double Concave (Diverging)",
        "Focal Length (|f|)": `${fVal.toFixed(1)} cm`,
        "Object Distance (d_o)": `${doVal.toFixed(1)} cm`,
        "Object Height (h_o)": `${hoVal.toFixed(1)} cm`,
        "532nm Laser Mode": laserMode ? "Active" : "Standard Multi-Ray"
      },
      headers: ["Lens Type", "Focal Length f (cm)", "Object Distance do (cm)", "Image Distance di (cm)", "Object Height ho (cm)", "Image Height hi (cm)", "Magnification m", "Image Nature"],
      dataRows: [
        [
          opticType === "convex_lens" ? "Convex (+f)" : "Concave (-f)",
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

  // Telemetry Suite: Generate Lab Report
  document.getElementById("btn-open-optics-report")?.addEventListener("click", () => {
    const trials = LabTrialStore.getTrials("optics");
    const img = calculateImage();
    const effF = opticType === "convex_lens" ? fVal : -fVal;

    openLabReportModal({
      title: "Geometric Optics, Thin Lens Formulations & Image Formation",
      subject: "Physics",
      inquiryQuestion: "How do object distance and lens focal length quantitatively determine real vs virtual image position, orientation, and lateral magnification?",
      parameters: {
        "Lens Architecture": opticType === "convex_lens" ? "Biconvex Converging Lens" : "Biconcave Diverging Lens",
        "Signed Focal Length (f)": `${effF.toFixed(1)} cm`,
        "Object Distance (d_o)": `${doVal.toFixed(1)} cm`,
        "Calculated Image Distance (d_i)": isFinite(img.di) ? `${img.di.toFixed(1)} cm` : "Infinity (Parallel Ray Collimation)",
        "Transverse Magnification (m)": isFinite(img.m) ? `${img.m.toFixed(2)}×` : "N/A",
        "Image Classification": img.isReal ? "Real & Inverted" : "Virtual & Upright"
      },
      trials,
      formulas: [
        "\\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i} \\quad (\\text{Gaussian Thin Lens Formula})",
        "m = -\\frac{d_i}{d_o} = \\frac{h_i}{h_o} \\quad (\\text{Transverse Magnification})",
        "P = \\frac{1}{f} \\quad (\\text{Optical Power in Diopters, } m^{-1})"
      ]
    });
  });

  // Mount Post-Lab Checkpoint Assessment
  mountLabCheckpoint("optics-checkpoint-container", "optics");

  function handleResize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = 490 * dpr;
  }
  window.addEventListener("resize", handleResize);
  handleResize();

  return () => {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("resize", handleResize);
  };
}
