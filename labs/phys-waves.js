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
              <button class="btn btn-secondary btn-sm ${setupMode === 'double_slit' ? 'active' : ''}" data-mode="double_slit" style="font-size: 0.76rem; padding: 6px 10px;">
                <span>Double Slit (Young)</span>
              </button>
              <button class="btn btn-secondary btn-sm ${setupMode === 'single_slit' ? 'active' : ''}" data-mode="single_slit" style="font-size: 0.76rem; padding: 6px 10px;">
                <span>Single Slit Diffraction</span>
              </button>
              <button class="btn btn-secondary btn-sm ${setupMode === 'dual_sources' ? 'active' : ''}" data-mode="dual_sources" style="font-size: 0.76rem; padding: 6px 10px;">
                <span>Dual Point Sources</span>
              </button>
              <button class="btn btn-secondary btn-sm ${setupMode === 'doppler' ? 'active' : ''}" data-mode="doppler" style="font-size: 0.76rem; padding: 6px 10px;">
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
  const imgData = ctx.createImageData(canvas.width, canvas.height);

  const intensityCanvas = document.getElementById("intensity-canvas");
  const ictx = intensityCanvas.getContext("2d");

  // Reset Grid
  function resetGrid() {
    u0.fill(0);
    u1.fill(0);
    u2.fill(0);
    simStep = 0;
  }

  function updateWavePhysics() {
    if (!isRunning) return;

    simStep++;
    const t = simStep * 0.1;
    const c2 = 0.22; // Courant stability constant < 0.5
    const lambda = (waveSpeed / frequency) * 0.25;

    // Source coordinates
    const sourceX = 20;
    const midY = Math.floor(GH / 2);

    // Continuous wave excitation based on mode
    if (setupMode === "double_slit" || setupMode === "single_slit") {
      // Plane wave driver on the left boundary
      const waveVal = Math.sin(simStep * (frequency * 0.12)) * 1.8;
      for (let y = 10; y < GH - 10; y++) {
        u1[y * GW + 4] = waveVal;
      }
    } else if (setupMode === "dual_sources") {
      // Two point sources
      const sep = Math.floor(slitSeparation * 0.4);
      const s1 = Math.sin(simStep * (frequency * 0.12)) * 2.2;
      const s2 = Math.sin(simStep * (frequency * 0.12) + (phaseShift * Math.PI) / 180) * 2.2;
      u1[(midY - sep) * GW + sourceX + 25] = s1;
      u1[(midY + sep) * GW + sourceX + 25] = s2;
    } else if (setupMode === "doppler") {
      // Moving point source from left to right
      const dopSpeed = sourceVelocity * 0.75;
      const posX = 20 + Math.floor((simStep * dopSpeed) % (GW - 40));
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
        u2[idx] = (2 * u1[idx] - u0[idx] + c2 * laplacian) * damping;
      }
    }

    // Swap buffers
    const temp = u0;
    u0 = u1;
    u1 = u2;
    u2 = temp;
  }

  function renderWaveCanvas() {
    const cw = canvas.width;
    const ch = canvas.height;
    const scaleX = cw / GW;
    const scaleY = ch / GH;

    // Draw wavefield to ImageData
    const data = imgData.data;
    const barrierX = Math.floor(65 * scaleX);

    for (let py = 0; py < ch; py++) {
      const gy = Math.floor(py / scaleY);
      const gyOffset = gy * GW;

      for (let px = 0; px < cw; px++) {
        const gx = Math.floor(px / scaleX);
        const val = u1[gyOffset + gx];
        const pidx = (py * cw + px) * 4;

        // Color mapping for wave elevation
        if (val > 0) {
          // Crest (Cyan / Bright Indigo)
          const intensity = Math.min(255, Math.floor(val * 140));
          data[pidx] = Math.floor(intensity * 0.35); // R
          data[pidx + 1] = Math.floor(intensity * 0.85); // G
          data[pidx + 2] = intensity; // B
          data[pidx + 3] = 255;
        } else {
          // Trough (Deep Indigo / Dark Void)
          const intensity = Math.min(255, Math.floor(-val * 130));
          data[pidx] = Math.floor(intensity * 0.15); // R
          data[pidx + 1] = Math.floor(intensity * 0.1);  // G
          data[pidx + 2] = Math.floor(intensity * 0.5);  // B
          data[pidx + 3] = 255;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

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
        // Barrier 1 (Top)
        ctx.fillRect(bx, 0, bWidth, midY - halfSep - halfWidth);
        // Barrier 2 (Middle)
        ctx.fillRect(bx, midY - halfSep + halfWidth, bWidth, (halfSep - halfWidth) * 2);
        // Barrier 3 (Bottom)
        ctx.fillRect(bx, midY + halfSep + halfWidth, bWidth, ch - (midY + halfSep + halfWidth));
      } else {
        // Single slit: Top and Bottom
        ctx.fillRect(bx, 0, bWidth, midY - halfWidth * 1.5);
        ctx.fillRect(bx, midY + halfWidth * 1.5, bWidth, ch - (midY + halfWidth * 1.5));
      }
      ctx.restore();
    }

    // Detector screen line at x = 165
    const detX = 165 * scaleX;
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
      const intensity = val * val * 25; // I ~ E^2
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
    const lambda = waveSpeed / frequency;
    const L = 350; // Distance to screen in mm
    const deltaY = setupMode === "double_slit" ? (lambda * L) / (slitSeparation * 10) : (lambda * L) / (slitWidth * 10);

    document.getElementById("hud-wave-eq").innerText = `v = f • λ = ${(frequency * lambda).toFixed(0)} mm/s`;
    document.getElementById("hud-wavelength").innerText = `λ = ${lambda.toFixed(1)} mm`;
    document.getElementById("hud-fringe-delta").innerText = `Δy = ${deltaY.toFixed(2)} mm`;

    const summary = document.getElementById("wave-math-summary");
    if (setupMode === "double_slit") {
      summary.innerHTML = `Young's double-slit interference: Fringe spacing $\\Delta y = \\frac{\\lambda L}{d} = ${deltaY.toFixed(2)}\\text{ mm}$. Narrower slit spacing $d$ widens fringes.`;
    } else if (setupMode === "single_slit") {
      summary.innerHTML = `Single-slit diffraction minima condition: $a \\sin\\theta = m\\lambda$. Central maximum width $= \\frac{2\\lambda L}{a}$.`;
    } else if (setupMode === "doppler") {
      summary.innerHTML = `Doppler effect wave crowding: Ahead of source $\\lambda' = \\lambda(1 - v/c)$, frequency shifts higher: $f' = \\frac{f}{1 - v/c}$.`;
    } else {
      summary.innerHTML = `Coherent wave interference from dual sources: Constructive nodes appear along hyperbolic loci where path difference $\\Delta r = m\\lambda$.`;
    }
    renderMathInElement(summary);
  }

  function loop() {
    updateWavePhysics();
    renderWaveCanvas();
    if (simStep % 3 === 0) {
      renderIntensityGraph();
    }
    animId = requestAnimationFrame(loop);
  }
  animId = requestAnimationFrame(loop);

  // --- EVENT LISTENERS ---
  document.querySelectorAll("[data-mode]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-mode]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      setupMode = btn.dataset.mode;

      document.getElementById("ctrl-slit-sep").style.display = setupMode === "double_slit" ? "block" : "none";
      document.getElementById("ctrl-slit-width").style.display = (setupMode === "double_slit" || setupMode === "single_slit") ? "block" : "none";
      document.getElementById("ctrl-doppler-vel").style.display = setupMode === "doppler" ? "block" : "none";

      const titles = {
        double_slit: "Young's Double-Slit Diffraction",
        single_slit: "Single-Slit Fraunhofer Diffraction",
        dual_sources: "Dual Point Coherent Sources",
        doppler: "Doppler Wavefront Shift"
      };
      document.getElementById("hud-setup-title").innerText = titles[setupMode] || "Wave Interference";

      SoundFX.playClick();
      resetGrid();
      updateHUD();
    });
  });

  const freqSlider = document.getElementById("slider-frequency");
  freqSlider.addEventListener("input", (e) => {
    frequency = parseFloat(e.target.value);
    document.getElementById("lbl-frequency").innerText = `${frequency.toFixed(1)} Hz`;
    updateHUD();
  });

  const sepSlider = document.getElementById("slider-slit-sep");
  sepSlider.addEventListener("input", (e) => {
    slitSeparation = parseInt(e.target.value, 10);
    document.getElementById("lbl-slit-sep").innerText = `${slitSeparation} mm`;
    updateHUD();
  });

  const widthSlider = document.getElementById("slider-slit-width");
  widthSlider.addEventListener("input", (e) => {
    slitWidth = parseInt(e.target.value, 10);
    document.getElementById("lbl-slit-width").innerText = `${slitWidth} mm`;
    updateHUD();
  });

  const machSlider = document.getElementById("slider-doppler-mach");
  machSlider.addEventListener("input", (e) => {
    sourceVelocity = parseFloat(e.target.value);
    document.getElementById("lbl-doppler-mach").innerText = `Mach ${sourceVelocity.toFixed(2)}`;
  });

  document.getElementById("btn-wave-toggle-run").addEventListener("click", (e) => {
    isRunning = !isRunning;
    e.currentTarget.innerText = isRunning ? "⏸ Pause Wave" : "▶ Resume Wave";
    SoundFX.playClick();
  });

  document.getElementById("btn-wave-clear").addEventListener("click", () => {
    resetGrid();
    SoundFX.playClick();
  });

  // Export Data CSV
  document.getElementById("btn-wave-export").addEventListener("click", () => {
    const lambda = waveSpeed / frequency;
    const L = 350;
    const deltaY = (lambda * L) / (slitSeparation * 10);

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
    if (animId) cancelAnimationFrame(animId);
  };
}
