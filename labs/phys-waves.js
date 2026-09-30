// Edugates-ClipSAT Science Labs - Physics: Wave Interference & Ripple Tank Laboratory
// 60 FPS 2D Wavefield Physics Simulator:
// Young's Double-Slit Interference, Single-Slit Diffraction, Coherent Wave Superposition,
// Doppler Effect from Subsonic/Supersonic Sources, and Live Intensity Cross-Section Graphing.

import { renderLatex, formatMathText, renderMathInElement } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initWaveLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Wave Simulation Parameters
  let setupMode = "double_slit"; // 'double_slit', 'single_slit', 'dual_sources', 'doppler', 'refraction'
  let frequency = 4.0; // Hz
  let waveSpeed = 160; // m/s equivalent
  let slitSeparation = 40; // mm (d)
  let slitWidth = 14; // mm (a)
  let phaseShift = 0; // degrees
  let sourceVelocity = 0.5; // Mach ratio for Doppler
  let isRunning = true;
  let colorTheme = "ocean"; // 'ocean', 'ultraviolet', 'thermal'
  let animId = null;

  // Simulation Grid (Width x Height)
  const GW = 180;
  const GH = 140;
  let u0 = new Float32Array(GW * GH);
  let u1 = new Float32Array(GW * GH);
  let u2 = new Float32Array(GW * GH);
  let damping = 0.992;
  let simStep = 0;

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #6366f1; box-shadow: 0 0 10px #6366f1;"></span>
            Wave Interference &amp; Ripple Tank Simulator
          </span>
          <span class="badge" style="background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); color: #818cf8; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            60 FPS Finite-Difference Wave Engine
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-waves-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🌊 Ripple Tank
            </button>
            <button id="view-mode-waves-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Lab Bench
            </button>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-wave-toggle-run" style="padding: 5px 14px; font-size: 0.78rem;">
            ${isRunning ? "⏸ Pause Wave" : "▶ Resume Wave"}
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-wave-clear" style="padding: 5px 12px; font-size: 0.78rem;">
            ✕ Clear Tank
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-wave-export" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export Telemetry
          </button>
        </div>
      </div>

      <!-- Main Layout: 2D Ripple Tank on Left, Telemetry & Controls on Right -->
      <div style="display: grid; grid-template-columns: 1.25fr 1fr; gap: 20px;" class="wave-layout">
        <!-- 2D Ripple Tank Canvas -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(99, 102, 241, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: #030712; border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="ripple-tank-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
          <div id="waves-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <img src="assets/labs/waves_bench.jpg" alt="4K Wave Interference & Ripple Tank Laboratory Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            
            <!-- Live Analytical Telemetry Callout on Photo -->
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">PASCO Ripple Tank Bench</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">LED Strobe • Synchronized Motor</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Aperture &amp; Slit System</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">d = 0.25 mm Precision Slits</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Optical Screen Detector</div>
                <div style="color: #f59e0b; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Interference Fringes Δy = mλL/d</div>
              </div>
            </div>
          </div>

          <!-- Top HUD Overlay -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">OPTICAL APPARATUS</div>
              <div style="font-weight: 800; font-size: 1.05rem; color: #ffffff;" id="hud-setup-title">Young's Double-Slit Diffraction</div>
              <div style="font-size: 0.76rem; color: #818cf8; font-family: var(--font-mono);" id="hud-wave-eq">v = f • λ = 160 m/s</div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">FRINGE SEPARATION</div>
              <div style="font-weight: 800; font-size: 1.15rem; color: #10b981;" id="hud-fringe-delta">Δy = 8.00 mm</div>
              <div style="font-size: 0.74rem; color: #cbd5e1; font-family: var(--font-mono);" id="hud-wavelength">λ = 40.0 mm</div>
            </div>
          </div>

          <!-- Bottom Canvas Color Indicator & Detector Line Callout -->
          <div style="position: absolute; bottom: 12px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: center; pointer-events: none; font-family: var(--font-mono); font-size: 0.72rem; color: #94a3b8;">
            <span style="background: rgba(0,0,0,0.6); padding: 4px 10px; border-radius: 6px;">
              ⚡ Dashed Yellow Line: Detector Screen Plane
            </span>
            <span style="background: rgba(0,0,0,0.6); padding: 4px 10px; border-radius: 6px;">
              Crests (Bright) • Troughs (Dark)
            </span>
          </div>
        </div>

        <!-- Controls & Analytical Graphs on Right -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <!-- Setup Selection & Mode Chips -->
          <div class="lab-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px;">
            <label style="font-size: 0.8rem; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">
              Wave Phenomenon Configuration
            </label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
              <button class="btn btn-secondary btn-sm ${setupMode === 'double_slit' ? 'active' : ''}" data-wave-mode="double_slit" style="font-size: 0.76rem; padding: 6px 10px;">
                <span>Double Slit (Young)</span>
              </button>
              <button class="btn btn-secondary btn-sm ${setupMode === 'single_slit' ? 'active' : ''}" data-wave-mode="single_slit" style="font-size: 0.76rem; padding: 6px 10px;">
                <span>Single Slit Diffraction</span>
              </button>
              <button class="btn btn-secondary btn-sm ${setupMode === 'dual_sources' ? 'active' : ''}" data-wave-mode="dual_sources" style="font-size: 0.76rem; padding: 6px 10px;">
                <span>Dual Point Sources</span>
              </button>
              <button class="btn btn-secondary btn-sm ${setupMode === 'doppler' ? 'active' : ''}" data-wave-mode="doppler" style="font-size: 0.76rem; padding: 6px 10px;">
                <span>Doppler Effect (Mach)</span>
              </button>
            </div>

            <!-- Dynamic Sliders -->
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <!-- Frequency -->
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>Oscillation Frequency (f)</span>
                  <span style="color: #818cf8; font-weight: 700;" id="lbl-frequency">${frequency.toFixed(1)} Hz</span>
                </div>
                <input type="range" id="slider-frequency" min="1.0" max="8.0" step="0.5" value="${frequency}" style="width: 100%; accent-color: #6366f1;">
              </div>

              <!-- Slit Separation (d) -->
              <div id="ctrl-slit-sep">
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>Slit Separation (d)</span>
                  <span style="color: #10b981; font-weight: 700;" id="lbl-slit-sep">${slitSeparation} mm</span>
                </div>
                <input type="range" id="slider-slit-sep" min="20" max="70" step="5" value="${slitSeparation}" style="width: 100%; accent-color: #10b981;">
              </div>

              <!-- Slit Width (a) -->
              <div id="ctrl-slit-width">
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>Slit Aperture Width (a)</span>
                  <span style="color: #f59e0b; font-weight: 700;" id="lbl-slit-width">${slitWidth} mm</span>
                </div>
                <input type="range" id="slider-slit-width" min="6" max="28" step="2" value="${slitWidth}" style="width: 100%; accent-color: #f59e0b;">
              </div>

              <!-- Doppler Velocity (if in Doppler mode) -->
              <div id="ctrl-doppler-vel" style="display: none;">
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>Source Speed (Mach Number)</span>
                  <span style="color: #ec4899; font-weight: 700;" id="lbl-doppler-mach">Mach ${sourceVelocity.toFixed(2)}</span>
                </div>
                <input type="range" id="slider-doppler-mach" min="0.1" max="1.5" step="0.1" value="${sourceVelocity}" style="width: 100%; accent-color: #ec4899;">
              </div>
            </div>
          </div>

          <!-- Diffraction Intensity Profile Graph Canvas -->
          <div class="lab-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; flex: 1;">
            <div style="font-size: 0.8rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; display: flex; justify-content: space-between;">
              <span>Detector Screen Intensity Profile I(θ)</span>
              <span style="font-family: var(--font-mono); font-size: 0.72rem; color: #94a3b8;">cos²(β) • sinc²(α)</span>
            </div>
            <div style="height: 140px; width: 100%; position: relative; background: #030712; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
              <canvas id="intensity-canvas" width="460" height="140" style="width: 100%; height: 140px; display: block;"></canvas>
            </div>

            <!-- Mathematical Synthesis -->
            <div style="margin-top: 10px; background: rgba(99, 102, 241, 0.08); border-left: 3px solid #6366f1; padding: 8px 12px; border-radius: 6px; font-size: 0.8rem; color: var(--text-main);" id="wave-math-summary">
              Bright fringes occur when path difference $\\Delta L = d \\sin\\theta = m\\lambda$ ($m = 0, \\pm 1, \\pm 2$).
            </div>
          </div>
        </div>
      </div>

      <!-- CER Checkpoint -->
      <div id="wave-checkpoint-mount" style="margin-top: 20px;"></div>
    </div>
  `;

  // --- 2D WAVE ENGINE SETUP ---
  const canvas = document.getElementById("ripple-tank-canvas");
  const ctx = canvas.getContext("2d");

  // High-performance offscreen render buffer (180x140 matches simulation grid)
  const offscreenCanvas = document.createElement("canvas");
  offscreenCanvas.width = GW;
  offscreenCanvas.height = GH;
  const offscreenCtx = offscreenCanvas.getContext("2d");
  const offscreenImgData = offscreenCtx.createImageData(GW, GH);
  const offscreenBuf = new ArrayBuffer(offscreenImgData.data.length);
  const offscreenBuf8 = new Uint8ClampedArray(offscreenBuf);
  const offscreenData32 = new Uint32Array(offscreenBuf);

  const intensityCanvas = document.getElementById("intensity-canvas");
  const ictx = intensityCanvas.getContext("2d");

  // Precompute boundary sponge layer (PML) to prevent resonant wall reflections
  const dampingMap = new Float32Array(GW * GH);
  const spongeDepth = 14;
  for (let y = 0; y < GH; y++) {
    for (let x = 0; x < GW; x++) {
      const idx = y * GW + x;
      const distRight = (GW - 1) - x;
      const distTop = y;
      const distBottom = (GH - 1) - y;
      const distLeft = x;
      const minDist = Math.min(distRight, distTop, distBottom, distLeft < 5 ? 999 : distLeft);
      if (minDist < spongeDepth) {
        const factor = minDist / spongeDepth;
        dampingMap[idx] = damping * (0.84 + 0.16 * factor);
      } else {
        dampingMap[idx] = damping;
      }
    }
  }

  // Reset Grid
  function resetGrid() {
    u0.fill(0);
    u1.fill(0);
    u2.fill(0);
    simStep = 0;
    needsRedraw = true;
  }

  function updateWavePhysics() {
    if (!isRunning) return;

    simStep++;
    const c2 = 0.22; // Courant stability condition (c² < 0.5)

    // Source coordinates
    const sourceX = 20;
    const midY = Math.floor(GH / 2);

    // Continuous wave excitation with smooth boundary tapers
    if (setupMode === "double_slit" || setupMode === "single_slit") {
      const waveVal = Math.sin(simStep * (frequency * 0.12)) * 1.8;
      const taperDepth = 12;
      for (let y = 8; y < GH - 8; y++) {
        let taper = 1.0;
        if (y < 8 + taperDepth) {
          taper = 0.5 * (1 - Math.cos(Math.PI * (y - 8) / taperDepth));
        } else if (y > GH - 8 - taperDepth) {
          taper = 0.5 * (1 - Math.cos(Math.PI * (GH - 8 - y) / taperDepth));
        }
        u1[y * GW + 4] = waveVal * taper;
      }
    } else if (setupMode === "dual_sources") {
      const sep = Math.floor(slitSeparation * 0.4);
      const s1 = Math.sin(simStep * (frequency * 0.12)) * 2.2;
      const s2 = Math.sin(simStep * (frequency * 0.12) + (phaseShift * Math.PI) / 180) * 2.2;
      const y1 = Math.max(3, Math.min(GH - 4, midY - sep));
      const y2 = Math.max(3, Math.min(GH - 4, midY + sep));
      const sx = sourceX + 25;
      u1[y1 * GW + sx] = s1;
      u1[y2 * GW + sx] = s2;
    } else if (setupMode === "doppler") {
      const dopSpeed = sourceVelocity * 0.75;
      const posX = 16 + Math.floor((simStep * dopSpeed) % (GW - 36));
      const sVal = Math.sin(simStep * (frequency * 0.15)) * 2.5;
      u1[midY * GW + posX] = sVal;
    }

    // Barrier / Slit Mask calculation
    const barrierX = 65;
    const halfSep = Math.floor(slitSeparation * 0.35);
    const halfWidth = Math.max(2, Math.floor(slitWidth * 0.3));

    // Finite difference wave equation 2D: u2 = 2*u1 - u0 + c^2 * (u1_xx + u1_yy)
    for (let y = 1; y < GH - 1; y++) {
      const yOffset = y * GW;
      const yUp = (y - 1) * GW;
      const yDown = (y + 1) * GW;

      for (let x = 1; x < GW - 1; x++) {
        const idx = yOffset + x;

        // Impassable Barrier check
        if (setupMode === "double_slit" && x === barrierX) {
          const inSlit1 = Math.abs(y - (midY - halfSep)) <= halfWidth;
          const inSlit2 = Math.abs(y - (midY + halfSep)) <= halfWidth;
          if (!inSlit1 && !inSlit2) {
            u2[idx] = 0;
            continue;
          }
        } else if (setupMode === "single_slit" && x === barrierX) {
          const inSlit = Math.abs(y - midY) <= halfWidth * 1.5;
          if (!inSlit) {
            u2[idx] = 0;
            continue;
          }
        }

        const laplacian = u1[idx + 1] + u1[idx - 1] + u1[yUp + x] + u1[yDown + x] - 4 * u1[idx];
        let nextVal = (2 * u1[idx] - u0[idx] + c2 * laplacian) * dampingMap[idx];

        // Guard against NaN or numerical oscillation divergence
        if (!Number.isFinite(nextVal)) nextVal = 0;
        else if (nextVal > 4.0) nextVal = 4.0;
        else if (nextVal < -4.0) nextVal = -4.0;

        u2[idx] = nextVal;
      }
    }

    // Swap buffers
    const temp = u0;
    u0 = u1;
    u1 = u2;
    u2 = temp;
  }

  function renderWaveCanvas() {
    const len = GW * GH;

    for (let i = 0; i < len; i++) {
      const val = u1[i];
      if (val > 0) {
        // Crest (Cyan / Bright Indigo)
        const intensity = Math.min(255, (val * 140) | 0);
        const r = (intensity * 0.35) | 0;
        const g = (intensity * 0.85) | 0;
        const b = intensity;
        offscreenData32[i] = (255 << 24) | (b << 16) | (g << 8) | r;
      } else {
        // Trough (Deep Indigo / Dark Void)
        const intensity = Math.min(255, (-val * 130) | 0);
        const r = (intensity * 0.15) | 0;
        const g = (intensity * 0.10) | 0;
        const b = (intensity * 0.50) | 0;
        offscreenData32[i] = (255 << 24) | (b << 16) | (g << 8) | r;
      }
    }

    offscreenImgData.data.set(offscreenBuf8);
    offscreenCtx.putImageData(offscreenImgData, 0, 0);

    const cw = canvas.width;
    const ch = canvas.height;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(offscreenCanvas, 0, 0, cw, ch);

    const scaleX = cw / GW;
    const scaleY = ch / GH;

    // Overlay Slit Barriers
    if (setupMode === "double_slit" || setupMode === "single_slit") {
      ctx.save();
      ctx.fillStyle = "#334155";
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 2;

      const bx = 65 * scaleX;
      const bWidth = 8;
      const midY = (GH / 2) * scaleY;
      const halfSep = slitSeparation * 0.35 * scaleY;
      const halfWidth = Math.max(6, slitWidth * 0.3 * scaleY);

      if (setupMode === "double_slit") {
        ctx.fillRect(bx, 0, bWidth, Math.max(0, midY - halfSep - halfWidth));
        ctx.fillRect(bx, midY - halfSep + halfWidth, bWidth, Math.max(0, (halfSep - halfWidth) * 2));
        ctx.fillRect(bx, midY + halfSep + halfWidth, bWidth, Math.max(0, ch - (midY + halfSep + halfWidth)));
      } else {
        ctx.fillRect(bx, 0, bWidth, Math.max(0, midY - halfWidth * 1.5));
        ctx.fillRect(bx, midY + halfWidth * 1.5, bWidth, Math.max(0, ch - (midY + halfWidth * 1.5)));
      }
      ctx.restore();
    }

    // Detector screen line at x = 165
    const detX = (165 / GW) * cw;
    ctx.save();
    ctx.strokeStyle = "rgba(245, 158, 11, 0.85)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(detX, 0);
    ctx.lineTo(detX, ch);
    ctx.stroke();
    ctx.restore();
  }

  function renderIntensityGraph() {
    const iw = intensityCanvas.width;
    const ih = intensityCanvas.height;
    ictx.clearRect(0, 0, iw, ih);

    // Grid lines
    ictx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ictx.lineWidth = 1;
    for (let x = 40; x < iw; x += 60) {
      ictx.beginPath();
      ictx.moveTo(x, 0);
      ictx.lineTo(x, ih);
      ictx.stroke();
    }

    // Sample detector slice from u1 along detector X = 165
    const detGx = 165;
    ictx.beginPath();
    ictx.strokeStyle = "#10b981";
    ictx.lineWidth = 2.5;

    for (let gy = 0; gy < GH; gy++) {
      const val = u1[gy * GW + detGx];
      const safeVal = Number.isFinite(val) ? val : 0;
      const intensity = Math.min(iw - 15, safeVal * safeVal * 35);
      const py = (gy / GH) * ih;
      const px = Math.min(iw - 10, 15 + intensity);

      if (gy === 0) ictx.moveTo(px, py);
      else ictx.lineTo(px, py);
    }
    ictx.stroke();

    // Central line indicator
    ictx.strokeStyle = "rgba(245, 158, 11, 0.5)";
    ictx.setLineDash([3, 3]);
    ictx.beginPath();
    ictx.moveTo(0, ih / 2);
    ictx.lineTo(iw, ih / 2);
    ictx.stroke();
  }

  function updateHUD() {
    const lambda = waveSpeed / Math.max(0.1, frequency);
    const L = 350; // Distance to screen in mm
    const deltaY = setupMode === "double_slit" 
      ? (lambda * L) / (Math.max(1, slitSeparation) * 10) 
      : (lambda * L) / (Math.max(1, slitWidth) * 10);

    const elEq = container.querySelector("#hud-wave-eq");
    const elWave = container.querySelector("#hud-wavelength");
    const elDelta = container.querySelector("#hud-fringe-delta");
    if (elEq) elEq.innerText = `v = f • λ = ${(frequency * lambda).toFixed(0)} mm/s`;
    if (elWave) elWave.innerText = `λ = ${lambda.toFixed(1)} mm`;
    if (elDelta) elDelta.innerText = `Δy = ${deltaY.toFixed(2)} mm`;

    const summary = container.querySelector("#wave-math-summary");
    if (summary) {
      if (setupMode === "double_slit") {
        summary.innerHTML = `Young's double-slit interference: Fringe spacing $\\Delta y = \\frac{\\lambda L}{d} = ${deltaY.toFixed(2)}\\text{ mm}$. Narrower slit spacing $d$ widens fringes.`;
      } else if (setupMode === "single_slit") {
        summary.innerHTML = `Single-slit diffraction minima condition: $a \\sin\\theta = m\\lambda$. Central maximum width $= \\frac{2\\lambda L}{a}$.`;
      } else if (setupMode === "doppler") {
        summary.innerHTML = `Doppler effect wave crowding: Ahead of source $\\lambda' = \\lambda(1 - v/c)$, frequency shifts higher: $f' = \\frac{f}{1 - v/c}$.`;
      } else {
        summary.innerHTML = `Coherent wave interference from dual sources: Constructive nodes appear along hyperbolic loci where path difference $\\Delta r = m\\lambda$.`;
      }
      try {
        renderMathInElement(summary);
      } catch (e) {}
    }
    needsRedraw = true;
  }

  let isDestroyed = false;
  let lastFrameTime = 0;
  let needsRedraw = true;

  function loop(now) {
    if (isDestroyed) return;
    if (!container || !container.isConnected) {
      if (animId) cancelAnimationFrame(animId);
      return;
    }

    const isSmart = (document.documentElement.getAttribute("data-mode") === "smartboard") ||
                    document.documentElement.classList.contains("fast-smartboard-mode") ||
                    /Android|MAXHUB/i.test(navigator.userAgent);
    const interval = isSmart ? 33.3 : 16.0;

    try {
      const photoEl = container.querySelector("#waves-photo-overlay");
      const isPhotoOverlay = photoEl && photoEl.style.display === "block";

      if (!isPhotoOverlay) {
        if (isRunning) {
          if (!now || now - lastFrameTime >= interval) {
            lastFrameTime = now || performance.now();
            updateWavePhysics();
            renderWaveCanvas();
            if (simStep % 3 === 0) {
              renderIntensityGraph();
            }
          }
        } else if (needsRedraw) {
          renderWaveCanvas();
          renderIntensityGraph();
          needsRedraw = false;
        }
      }
    } catch (err) {
      console.warn("Wave simulation loop recovered:", err);
    }
    animId = requestAnimationFrame(loop);
  }
  animId = requestAnimationFrame(loop);

  // --- EVENT LISTENERS (SCOPED TO CONTAINER) ---
  const modeButtons = container.querySelectorAll("[data-wave-mode]");
  modeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      modeButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      setupMode = btn.dataset.waveMode;

      const ctrlSlitSep = container.querySelector("#ctrl-slit-sep");
      const ctrlSlitWidth = container.querySelector("#ctrl-slit-width");
      const ctrlDopplerVel = container.querySelector("#ctrl-doppler-vel");
      if (ctrlSlitSep) {
        ctrlSlitSep.style.display = (setupMode === "double_slit" || setupMode === "dual_sources") ? "block" : "none";
        const titleSpan = ctrlSlitSep.querySelector("span:first-child");
        if (titleSpan) titleSpan.innerText = setupMode === "dual_sources" ? "Source Separation (d)" : "Slit Separation (d)";
      }
      if (ctrlSlitWidth) ctrlSlitWidth.style.display = (setupMode === "double_slit" || setupMode === "single_slit") ? "block" : "none";
      if (ctrlDopplerVel) ctrlDopplerVel.style.display = setupMode === "doppler" ? "block" : "none";

      const titles = {
        double_slit: "Young's Double-Slit Diffraction",
        single_slit: "Single-Slit Fraunhofer Diffraction",
        dual_sources: "Dual Point Coherent Sources",
        doppler: "Doppler Wavefront Shift"
      };
      const titleEl = container.querySelector("#hud-setup-title");
      if (titleEl) titleEl.innerText = titles[setupMode] || "Wave Interference";

      if (typeof SoundFX !== "undefined" && SoundFX.playClick) {
        SoundFX.playClick();
      }
      resetGrid();
      updateHUD();
    });
  });

  const freqSlider = container.querySelector("#slider-frequency");
  if (freqSlider) {
    freqSlider.addEventListener("input", (e) => {
      frequency = parseFloat(e.target.value);
      const lbl = container.querySelector("#lbl-frequency");
      if (lbl) lbl.innerText = `${frequency.toFixed(1)} Hz`;
      updateHUD();
    });
  }

  const sepSlider = container.querySelector("#slider-slit-sep");
  if (sepSlider) {
    sepSlider.addEventListener("input", (e) => {
      slitSeparation = parseInt(e.target.value, 10);
      const lbl = container.querySelector("#lbl-slit-sep");
      if (lbl) lbl.innerText = `${slitSeparation} mm`;
      updateHUD();
    });
  }

  const widthSlider = container.querySelector("#slider-slit-width");
  if (widthSlider) {
    widthSlider.addEventListener("input", (e) => {
      slitWidth = parseInt(e.target.value, 10);
      const lbl = container.querySelector("#lbl-slit-width");
      if (lbl) lbl.innerText = `${slitWidth} mm`;
      updateHUD();
    });
  }

  const machSlider = container.querySelector("#slider-doppler-mach");
  if (machSlider) {
    machSlider.addEventListener("input", (e) => {
      sourceVelocity = parseFloat(e.target.value);
      const lbl = container.querySelector("#lbl-doppler-mach");
      if (lbl) lbl.innerText = `Mach ${sourceVelocity.toFixed(2)}`;
    });
  }

  const toggleBtn = container.querySelector("#btn-wave-toggle-run");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", (e) => {
      isRunning = !isRunning;
      e.currentTarget.innerText = isRunning ? "⏸ Pause Wave" : "▶ Resume Wave";
      needsRedraw = true;
      if (typeof SoundFX !== "undefined" && SoundFX.playClick) SoundFX.playClick();
    });
  }

  const clearBtn = container.querySelector("#btn-wave-clear");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      resetGrid();
      if (typeof SoundFX !== "undefined" && SoundFX.playClick) SoundFX.playClick();
    });
  }

  // Export Data CSV
  const exportBtn = container.querySelector("#btn-wave-export");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const lambda = waveSpeed / Math.max(0.1, frequency);
      const L = 350;
      const deltaY = (lambda * L) / (Math.max(1, slitSeparation) * 10);

      const rows = [
        { Parameter: "Apparatus Mode", Value: setupMode },
        { Parameter: "Frequency (Hz)", Value: frequency },
        { Parameter: "Wave Speed (mm/s)", Value: waveSpeed },
        { Parameter: "Wavelength (mm)", Value: lambda.toFixed(2) },
        { Parameter: "Slit Separation d (mm)", Value: slitSeparation },
        { Parameter: "Slit Width a (mm)", Value: slitWidth },
        { Parameter: "Screen Distance L (mm)", Value: L },
        { Parameter: "Fringe Spacing Delta_y (mm)", Value: deltaY.toFixed(3) }
      ];
      exportLabDataCsv("wave_interference_fringe_telemetry.csv", rows);
    });
  }

  // 4K Photo Bench Switcher
  const btnModeSim = container.querySelector("#view-mode-waves-sim");
  const btnModePhoto = container.querySelector("#view-mode-waves-photo");
  const photoOverlay = container.querySelector("#waves-photo-overlay");

  btnModeSim?.addEventListener("click", () => {
    btnModeSim.classList.add("active");
    btnModeSim.style.background = "";
    btnModePhoto.classList.remove("active");
    btnModePhoto.style.background = "transparent";
    if (photoOverlay) photoOverlay.style.display = "none";
    needsRedraw = true;
    SoundFX.playClick();
  });

  btnModePhoto?.addEventListener("click", () => {
    btnModePhoto.classList.add("active");
    btnModePhoto.style.background = "";
    btnModeSim.classList.remove("active");
    btnModeSim.style.background = "transparent";
    if (photoOverlay) photoOverlay.style.display = "block";
    SoundFX.playClick();
  });

  // Mount CER Checkpoint
  mountLabCheckpoint("wave-checkpoint-mount", {
    id: "wave-checkpoint",
    labTitle: "Physics: Young's Double-Slit Wave-Particle Duality & Interference",
    prompt: "Investigate what occurs to the spacing between bright interference fringes (Δy) when you decrease the slit separation distance (d). Formulate your scientific Claim, state your mathematical and observational Evidence, and provide your physical Reasoning based on wave superposition and path length difference.",
    claimStarter: "As the slit separation d decreases, the spacing between consecutive interference fringes Δy...",
    sampleClaim: "Decreasing the slit separation d causes the fringe spacing Δy on the detector screen to spread farther apart (increase).",
    evidenceStarters: [
      "When d was reduced from 60 mm to 30 mm, the measured fringe spacing Δy doubled from 4.0 mm to 8.0 mm.",
      "The equation for double-slit fringe spacing is Δy = (λ • L) / d, showing an inverse relationship between Δy and d.",
      "The wave intensity detector confirmed wider constructive interference nodal bands."
    ],
    reasoningKey: "Interference maxima occur when the path difference between waves from both slits equals an integer multiple of the wavelength (d • sin θ = mλ). Because sin θ ≈ y/L for small angles, y = mλL / d. Decreasing the distance d between the two wave sources requires a larger angular displacement θ to achieve the same path difference of one full wavelength λ. Consequently, the constructive interference maxima spread further apart on the detection screen."
  });

  updateHUD();

  return () => {
    isDestroyed = true;
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  };
}
