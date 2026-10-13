// Edugates-ClipSAT Science Labs - Physics: Photoelectric Effect & Quantum Physics Suite
// High-Precision Quantum Mechanics Simulation:
// Einstein's Photoelectric Equation (KE_max = hf - Φ), Stopping Potential (V_stop vs f),
// Work Function Determination, Planck's Constant Extraction (h = 6.626×10⁻³⁴ J·s),
// Photocurrent (I vs V) Characteristics, and Dual Wave-Particle Photon Interaction.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initPhotoelectricLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Metal Target Work Functions (eV)
  const METALS = {
    cesium: { name: "Cesium (Cs)", workFunction: 2.14, color: "#facc15", desc: "Alkali metal with low work function (2.14 eV), emits in visible spectrum." },
    potassium: { name: "Potassium (K)", workFunction: 2.30, color: "#a855f7", desc: "Alkali metal (2.30 eV), threshold at green light (539 nm)." },
    sodium: { name: "Sodium (Na)", workFunction: 2.36, color: "#fb923c", desc: "Standard cathode target (2.36 eV), threshold at 525 nm." },
    zinc: { name: "Zinc (Zn)", workFunction: 4.31, color: "#94a3b8", desc: "Transition metal (4.31 eV), requires ultraviolet radiation (<288 nm)." },
    platinum: { name: "Platinum (Pt)", workFunction: 5.65, color: "#cbd5e1", desc: "Noble metal with high work function (5.65 eV), requires deep UV (<219 nm)." }
  };

  // State Variables
  let currentMetalKey = "sodium";
  let activeMetal = METALS[currentMetalKey];
  let wavelength = 400; // nm (200 nm to 750 nm)
  let lightIntensity = 100; // % (0 to 100%)
  let batteryVoltage = 0.0; // V (-4.0 V to +4.0 V, positive accelerates, negative stops)
  let animId = null;
  let elapsedSeconds = 0;

  // Physical Constants
  const h_eVs = 4.135667696e-15; // eV·s
  const c = 2.99792458e8; // m/s
  const hc_eVnm = 1239.84; // eV·nm

  // HiDPI Logical Dimensions
  const logicalW = 580;
  const logicalH = 530;
  const graphLogicalW = 420;
  const graphLogicalH = 130;

  // Photoelectron particles, photon wave-packets, and collection sparks
  const photoelectrons = [];
  const incomingPhotons = [];
  const anodeSparks = [];

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #a855f7; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #a855f7; box-shadow: 0 0 10px #a855f7;"></span>
            Photoelectric Effect &amp; Quantum Physics Workbench
          </span>
          <span class="badge" style="background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.3); color: #c084fc; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            ${renderLatex("KE_{\\text{max}} = hf - \\Phi = e V_{\\text{stop}} \\quad \\bullet \\quad \\text{Einstein Photon Quantum}")}
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-pe-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Vacuum Phototube
            </button>
            <button id="view-mode-pe-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-pe-find-vstop" style="padding: 5px 14px; font-size: 0.78rem; background: #6b21a8; color: #fff; border: none; font-weight: 700;">
            🎯 Auto-Find V_stop
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-pe-export" title="Export experimental telemetry to RFC-4180 CSV (Hotkey: E)" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export CSV (E)
          </button>
        </div>
      </div>

      <!-- Main Layout: Phototube Canvas on Left, Controls & V_stop plot on Right -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="photoelectric-layout">
        <!-- Vacuum Phototube Canvas -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(168, 85, 247, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #150826 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="photoelectric-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
          <div id="photoelectric-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <picture>
              <source srcset="assets/labs/photoelectric_bench.webp" type="image/webp">
              <img src="assets/labs/photoelectric_bench.jpg" decoding="async" loading="lazy" alt="4K Photoelectric Effect Laboratory Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            </picture>
            
            <!-- Live Analytical Telemetry Callout on Photo -->
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Quartz Vacuum Phototube</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Sodium Cathode • 10⁻⁷ Torr</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Keithley 6485 Picoammeter</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Photocurrent: 2.47 nA</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Spectral Monochromator</div>
                <div style="color: #c084fc; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">λ = 400 nm (E = 3.10 eV)</div>
              </div>
            </div>
          </div>

          <!-- Top HUD Overlay -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">PHOTON ENERGY &amp; FREQUENCY</div>
              <div style="font-weight: 800; font-size: 1.3rem; color: #c084fc; font-family: var(--font-mono);" id="disp-pe-energy">E = 3.100 eV</div>
              <div style="font-size: 0.74rem; color: #38bdf8; font-family: var(--font-mono);" id="disp-pe-freq">f = 7.50 × 10¹⁴ Hz</div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">MAX ELECTRON KINETIC ENERGY</div>
              <div style="font-weight: 800; font-size: 1.25rem; color: #38bdf8; font-family: var(--font-mono);" id="disp-pe-kemax">KE_max = 0.740 eV</div>
              <div style="font-size: 0.74rem; color: #f59e0b; font-family: var(--font-mono);" id="disp-pe-vstop">Stopping V_stop = 0.740 V</div>
            </div>
          </div>

          <!-- Bottom Status Pill -->
          <div style="position: absolute; bottom: 12px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: center; pointer-events: none; font-family: var(--font-mono); font-size: 0.74rem; color: #94a3b8;">
            <span style="background: rgba(0,0,0,0.65); padding: 4px 10px; border-radius: 6px;" id="disp-pe-status">
              ⚡ Photoemission Active: Incident photons exceed target work function Φ
            </span>
            <span style="background: rgba(0,0,0,0.65); padding: 4px 10px; border-radius: 6px;">
              Photocurrent: <span id="disp-pe-current" style="color: #34d399; font-weight: 700;">2.45 nA</span>
            </span>
          </div>
        </div>

        <!-- Controls & Planck V_stop Graph on Right -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <!-- Cathode Metal Selection Card -->
          <div class="lab-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px;">
            <label style="font-size: 0.8rem; font-weight: 700; color: #c084fc; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">
              Cathode Emitter Metal Target (Work Function Φ)
            </label>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
              <button class="btn btn-secondary btn-sm ${currentMetalKey === 'cesium' ? 'active' : ''}" data-metal="cesium" style="font-size: 0.72rem; padding: 6px;">
                Cs (2.14 eV)
              </button>
              <button class="btn btn-secondary btn-sm ${currentMetalKey === 'potassium' ? 'active' : ''}" data-metal="potassium" style="font-size: 0.72rem; padding: 6px;">
                K (2.30 eV)
              </button>
              <button class="btn btn-secondary btn-sm ${currentMetalKey === 'sodium' ? 'active' : ''}" data-metal="sodium" style="font-size: 0.72rem; padding: 6px;">
                Na (2.36 eV)
              </button>
              <button class="btn btn-secondary btn-sm ${currentMetalKey === 'zinc' ? 'active' : ''}" data-metal="zinc" style="font-size: 0.72rem; padding: 6px;">
                Zn (4.31 eV)
              </button>
              <button class="btn btn-secondary btn-sm ${currentMetalKey === 'platinum' ? 'active' : ''}" data-metal="platinum" style="font-size: 0.72rem; padding: 6px;">
                Pt (5.65 eV)
              </button>
            </div>
            <div style="margin-top: 8px; font-size: 0.76rem; color: #cbd5e1; background: rgba(0,0,0,0.25); padding: 6px 10px; border-radius: 6px;" id="disp-metal-desc">
              ${activeMetal.desc}
            </div>
          </div>

          <!-- Parameter Sliders -->
          <div class="lab-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px;">
            <label style="font-size: 0.8rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">
              Light Source &amp; Retarding Voltage
            </label>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              <!-- Wavelength Slider -->
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>Incident Wavelength (λ)</span>
                  <span style="color: #a855f7; font-weight: 700;" id="lbl-pe-wavelength">${wavelength} nm</span>
                </div>
                <input type="range" id="slider-pe-wavelength" min="200" max="750" step="5" value="${wavelength}" style="width: 100%; accent-color: #a855f7;">
              </div>

              <!-- Light Intensity Slider -->
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>Lamp Intensity (Brightness)</span>
                  <span style="color: #facc15; font-weight: 700;" id="lbl-pe-intensity">${lightIntensity}%</span>
                </div>
                <input type="range" id="slider-pe-intensity" min="0" max="100" step="5" value="${lightIntensity}" style="width: 100%; accent-color: #facc15;">
              </div>

              <!-- Retarding Voltage Slider -->
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>External Retarding Voltage (V)</span>
                  <span style="color: #38bdf8; font-weight: 700;" id="lbl-pe-voltage">${batteryVoltage.toFixed(2)} V</span>
                </div>
                <input type="range" id="slider-pe-voltage" min="-4.0" max="4.0" step="0.05" value="${batteryVoltage}" style="width: 100%; accent-color: #38bdf8;">
              </div>
            </div>
          </div>

          <!-- Planck's Constant V_stop vs Frequency Plot -->
          <div class="lab-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px; flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 0.8rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em;">
                Planck Relation: ${renderLatex("V_{\\text{stop}} = \\frac{h}{e}f - \\frac{\\Phi}{e}")}
              </span>
              <span style="font-size: 0.72rem; color: #94a3b8; font-family: var(--font-mono);">Slope h/e</span>
            </div>
            <canvas id="pe-graph-canvas" width="420" height="130" style="width: 100%; height: 130px; display: block; border-radius: 6px; background: #030712; border: 1px solid rgba(255,255,255,0.08);"></canvas>
          </div>
        </div>
      </div>

      <!-- Post-Lab Checkpoint Assessment -->
      <div id="pe-checkpoint-container" style="margin-top: 24px;"></div>
    </div>
  `;

  // Canvas References
  const canvas = container.querySelector("#photoelectric-canvas");
  const ctx = canvas.getContext("2d");
  const graphCanvas = container.querySelector("#pe-graph-canvas");
  const graphCtx = graphCanvas.getContext("2d");

  let needsRedraw = true;
  let graphNeedsRedraw = true;

  // HiDPI / Retina Canvas Setup
  function setupHiDPICanvas() {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (typeof window.getOptimizedDPR === "function" ? window.getOptimizedDPR() : (window.devicePixelRatio || 1));
    if (canvas && ctx) {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width > 0 ? rect.width : logicalW;
      const h = rect.height > 0 ? rect.height : logicalH;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.resetTransform();
      ctx.scale(dpr * (w / logicalW), dpr * (h / logicalH));
    }
    if (graphCanvas && graphCtx) {
      const gRect = graphCanvas.getBoundingClientRect();
      const gw = gRect.width > 0 ? gRect.width : graphLogicalW;
      const gh = gRect.height > 0 ? gRect.height : graphLogicalH;
      graphCanvas.width = Math.round(gw * dpr);
      graphCanvas.height = Math.round(gh * dpr);
      graphCtx.resetTransform();
      graphCtx.scale(dpr * (gw / graphLogicalW), dpr * (gh / graphLogicalH));
    }
    needsRedraw = true;
    graphNeedsRedraw = true;
  }
  setupHiDPICanvas();
  window.addEventListener("resize", setupHiDPICanvas);

  // DOM Elements
  const dispEnergy = container.querySelector("#disp-pe-energy");
  const dispFreq = container.querySelector("#disp-pe-freq");
  const dispKE = container.querySelector("#disp-pe-kemax");
  const dispVstop = container.querySelector("#disp-pe-vstop");
  const dispStatus = container.querySelector("#disp-pe-status");
  const dispCurrent = container.querySelector("#disp-pe-current");

  // Physics Calculations
  function getWavelengthColor(wl) {
    if (wl < 380) return "rgba(168, 85, 247, 0.85)"; // UV purple
    if (wl < 450) return "rgba(59, 130, 246, 0.85)"; // Blue
    if (wl < 495) return "rgba(6, 182, 212, 0.85)"; // Cyan
    if (wl < 570) return "rgba(34, 197, 94, 0.85)"; // Green
    if (wl < 590) return "rgba(250, 204, 21, 0.85)"; // Yellow
    if (wl < 620) return "rgba(249, 115, 22, 0.85)"; // Orange
    return "rgba(239, 68, 68, 0.85)"; // Red
  }

  // 60 FPS HTML5 Canvas Simulation
  function renderApparatus() {
    const W = logicalW;
    const H = logicalH;
    ctx.clearRect(0, 0, W, H);

    // Bench Surface with M6 optical rail mounting sockets
    const benchY = 460;
    const railGrad = ctx.createLinearGradient(0, benchY, 0, H);
    railGrad.addColorStop(0, "#334155");
    railGrad.addColorStop(0.2, "#1e293b");
    railGrad.addColorStop(1, "#0f172a");
    ctx.fillStyle = railGrad;
    ctx.fillRect(0, benchY, W, H - benchY);

    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, benchY);
    ctx.lineTo(W, benchY);
    ctx.stroke();

    // M6 threaded optical table mounting holes
    ctx.fillStyle = "#090d16";
    for (let bx = 30; bx < W; bx += 40) {
      ctx.beginPath();
      ctx.arc(bx, benchY + 18, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    const CX = W * 0.48;
    const CY = 240;

    // Tube Pedestal Stand
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(CX - 24, CY + 110, 48, benchY - (CY + 110));
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(CX - 24, CY + 110, 48, benchY - (CY + 110));

    // Pedestal adjustment collar
    ctx.fillStyle = "#334155";
    ctx.fillRect(CX - 28, benchY - 14, 56, 14);

    // --- FUSED SILICA QUARTZ VACUUM TUBE ENVELOPE ---
    // Outer glow aura
    const tubeAura = ctx.createRadialGradient(CX, CY, 80, CX, CY, 180);
    tubeAura.addColorStop(0, "rgba(56, 189, 248, 0.05)");
    tubeAura.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = tubeAura;
    ctx.beginPath();
    ctx.ellipse(CX, CY, 175, 125, 0, 0, Math.PI * 2);
    ctx.fill();

    // Quartz Glass Bulb Wall
    ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
    ctx.lineWidth = 3.5;
    ctx.fillStyle = "rgba(15, 23, 42, 0.25)";
    ctx.beginPath();
    ctx.ellipse(CX, CY, 160, 110, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner Glass Refraction Boundary
    ctx.strokeStyle = "rgba(56, 189, 248, 0.15)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(CX, CY, 154, 104, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Top Evacuation Seal Tip (Quartz glass pull-off tip)
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.beginPath();
    ctx.moveTo(CX - 8, CY - 110);
    ctx.lineTo(CX, CY - 128);
    ctx.lineTo(CX + 8, CY - 110);
    ctx.closePath();
    ctx.fill();

    // Specular Reflection Curves on Quartz Bulb
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(CX, CY - 24, 138, 76, 0, Math.PI * 1.12, Math.PI * 1.88);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(CX, CY + 24, 138, 76, 0, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();

    // --- ELECTRIC FIELD GRADIENT & FORCE VECTOR VISUALIZATION ---
    if (Math.abs(batteryVoltage) > 0.05) {
      const isRetarding = batteryVoltage < 0;
      ctx.strokeStyle = isRetarding ? "rgba(244, 63, 94, 0.25)" : "rgba(56, 189, 248, 0.25)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      for (let ey = CY - 50; ey <= CY + 50; ey += 25) {
        ctx.beginPath();
        ctx.moveTo(CX - 75, ey);
        ctx.lineTo(CX + 75, ey);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Electric field text badge
      ctx.font = "bold 9px monospace";
      ctx.fillStyle = isRetarding ? "#f43f5e" : "#38bdf8";
      ctx.textAlign = "center";
      ctx.fillText(isRetarding ? "RETARDING FIELD (← FORCE)" : "ACCELERATING FIELD (FORCE →)", CX, CY - 75);
    }

    // --- CATHODE PLATE (Target Metal on Left) ---
    const cathX = CX - 100;
    const cathY = CY;
    const cathH = 130;

    // Metal Base Slab with Material-Specific Shading
    const metalGrad = ctx.createLinearGradient(cathX - 10, cathY, cathX + 10, cathY);
    if (currentMetalKey === "cesium") {
      metalGrad.addColorStop(0, "#d97706");
      metalGrad.addColorStop(0.3, "#fde68a");
      metalGrad.addColorStop(0.7, "#b45309");
      metalGrad.addColorStop(1, "#78350f");
    } else if (currentMetalKey === "potassium") {
      metalGrad.addColorStop(0, "#818cf8");
      metalGrad.addColorStop(0.4, "#e0e7ff");
      metalGrad.addColorStop(0.8, "#6366f1");
      metalGrad.addColorStop(1, "#3730a3");
    } else if (currentMetalKey === "sodium") {
      metalGrad.addColorStop(0, "#94a3b8");
      metalGrad.addColorStop(0.3, "#f8fafc");
      metalGrad.addColorStop(0.7, "#cbd5e1");
      metalGrad.addColorStop(1, "#64748b");
    } else if (currentMetalKey === "zinc") {
      metalGrad.addColorStop(0, "#475569");
      metalGrad.addColorStop(0.3, "#94a3b8");
      metalGrad.addColorStop(0.7, "#64748b");
      metalGrad.addColorStop(1, "#334155");
    } else { // platinum
      metalGrad.addColorStop(0, "#cbd5e1");
      metalGrad.addColorStop(0.3, "#ffffff");
      metalGrad.addColorStop(0.7, "#e2e8f0");
      metalGrad.addColorStop(1, "#94a3b8");
    }

    ctx.fillStyle = metalGrad;
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(cathX - 8, cathY - cathH / 2, 16, cathH, 3);
    ctx.fill();
    ctx.stroke();

    // Cathode Mounting Bracket & Negative Terminal Wire
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cathX - 8, cathY);
    ctx.lineTo(cathX - 35, cathY);
    ctx.lineTo(cathX - 35, CY + 100);
    ctx.stroke();

    // Negative Terminal Badge
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(cathX - 35, CY + 100, 5, 0, Math.PI * 2);
    ctx.fill();

    // Cathode Target Text Label
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(`${activeMetal.name}`, cathX, cathY - cathH / 2 - 14);
    ctx.font = "9px monospace";
    ctx.fillStyle = "#c084fc";
    ctx.fillText(`Φ = ${activeMetal.workFunction.toFixed(2)} eV (Cathode -)`, cathX, cathY - cathH / 2 - 4);

    // --- ANODE COLLECTOR RING (Right) ---
    const anodX = CX + 100;
    const anodY = CY;
    const anodH = 110;

    // Toroidal Ring (Chrome/copper circular collector ring with center opening)
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 4;
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(anodX, anodY, anodH / 2, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Anode Collector Lead Wire to Positive Terminal
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(anodX, anodY);
    ctx.lineTo(anodX + 35, anodY);
    ctx.lineTo(anodX + 35, CY + 100);
    ctx.stroke();

    // Positive Terminal Badge
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(anodX + 35, CY + 100, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 11px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Anode Ring (+)", anodX, anodY - anodH / 2 - 8);

    // --- MONOCHROMATOR LIGHT SOURCE & VOLUMETRIC BEAM ---
    const beamColor = getWavelengthColor(wavelength);
    const lampX = 40;
    const lampY = 120;

    // Monochromator Lamp Housing
    const lampGrad = ctx.createLinearGradient(lampX - 25, lampY - 30, lampX + 25, lampY + 30);
    lampGrad.addColorStop(0, "#1e293b");
    lampGrad.addColorStop(0.5, "#334155");
    lampGrad.addColorStop(1, "#0f172a");
    ctx.fillStyle = lampGrad;
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(lampX - 25, lampY - 30, 48, 60, 6);
    ctx.fill();
    ctx.stroke();

    // Lamp Collimator Lens Barrel
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(lampX + 23, lampY - 18, 12, 36);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.2;
    ctx.strokeRect(lampX + 23, lampY - 18, 12, 36);

    // Emission Lens Face
    ctx.fillStyle = beamColor;
    ctx.beginPath();
    ctx.arc(lampX + 35, lampY, 14, -Math.PI / 2, Math.PI / 2);
    ctx.fill();

    // Lamp Label & Wavelength Indicator
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 9px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("MONO-LAMP", lampX - 1, lampY - 4);
    ctx.font = "8px monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText(`${wavelength} nm`, lampX - 1, lampY + 10);

    // Volumetric Incident Light Beam (if intensity > 0)
    if (lightIntensity > 0) {
      const beamAlpha = (lightIntensity / 100) * 0.75;
      const beamGrad = ctx.createLinearGradient(lampX + 35, lampY, cathX, cathY);
      beamGrad.addColorStop(0, beamColor.replace("0.85", (beamAlpha * 0.9).toFixed(2)));
      beamGrad.addColorStop(0.7, beamColor.replace("0.85", (beamAlpha * 0.6).toFixed(2)));
      beamGrad.addColorStop(1, beamColor.replace("0.85", (beamAlpha * 0.3).toFixed(2)));

      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(lampX + 35, lampY - 14);
      ctx.lineTo(cathX, cathY - cathH / 2 + 18);
      ctx.lineTo(cathX, cathY + cathH / 2 - 18);
      ctx.lineTo(lampX + 35, lampY + 14);
      ctx.closePath();
      ctx.fill();

      // Spawn incoming photon wave-packets
      if (Math.random() < (lightIntensity / 100) * 0.35) {
        incomingPhotons.push({
          progress: 0,
          speed: 0.022 + Math.random() * 0.008,
          offsetY: (Math.random() - 0.5) * (cathH - 40)
        });
      }

      // Draw photon wave packets traveling along beam
      ctx.save();
      for (let i = incomingPhotons.length - 1; i >= 0; i--) {
        const pk = incomingPhotons[i];
        pk.progress += pk.speed;
        if (pk.progress >= 1.0) {
          incomingPhotons.splice(i, 1);
          continue;
        }

        const px = (lampX + 35) + pk.progress * (cathX - (lampX + 35));
        const py = lampY + pk.progress * (cathY + pk.offsetY - lampY);

        // Sinusoidal wave packet
        ctx.strokeStyle = beamColor;
        ctx.lineWidth = 1.8;
        ctx.shadowColor = beamColor;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        const waveLen = 16;
        const cycles = 2.5;
        for (let w = -waveLen; w <= waveLen; w += 2) {
          const envelope = Math.cos((w / waveLen) * (Math.PI / 2));
          const waveY = Math.sin((w / waveLen) * cycles * Math.PI * 2) * 5 * envelope;
          if (w === -waveLen) ctx.moveTo(px + w, py + waveY);
          else ctx.lineTo(px + w, py + waveY);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    // --- PHOTOELECTRONS SIMULATION ---
    const E_photon = hc_eVnm / wavelength;
    const KE_max = E_photon - activeMetal.workFunction;
    const isEmitting = (KE_max > 0) && (lightIntensity > 0);

    if (isEmitting) {
      // Spawn new photoelectrons
      if (Math.random() < (lightIntensity / 100) * 0.45) {
        photoelectrons.push({
          x: cathX + 8,
          y: cathY + (Math.random() - 0.5) * (cathH - 40),
          vx: Math.sqrt(Math.max(0.1, KE_max)) * (1.8 + Math.random() * 0.8),
          vy: (Math.random() - 0.5) * 1.0,
          trail: []
        });
      }

      // Update and render photoelectrons
      for (let i = photoelectrons.length - 1; i >= 0; i--) {
        const p = photoelectrons[i];

        // Electric field acceleration/deceleration: F = q * V / d
        const ax = batteryVoltage * 1.4;
        p.vx += ax * 0.016;
        p.x += p.vx;
        p.y += p.vy;

        // Keep trail
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 5) p.trail.shift();

        // Render trail
        ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let t = 0; t < p.trail.length; t++) {
          const pt = p.trail[t];
          if (t === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();

        // Render glowing electron particle
        ctx.save();
        ctx.fillStyle = "#38bdf8";
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Check if reached anode ring
        if (p.x >= anodX) {
          // Charge collection spark at anode
          anodeSparks.push({
            x: anodX,
            y: p.y,
            alpha: 1.0,
            radius: 3
          });
          photoelectrons.splice(i, 1);
          continue;
        }

        // Check if turned around and bounced back to cathode or out of bulb bounds
        if (p.x < cathX - 4 || p.y < CY - 95 || p.y > CY + 95) {
          photoelectrons.splice(i, 1);
        }
      }
    } else {
      photoelectrons.length = 0;
    }

    // Render Anode Collection Sparks
    for (let i = anodeSparks.length - 1; i >= 0; i--) {
      const sp = anodeSparks[i];
      sp.radius += 0.8;
      sp.alpha -= 0.08;
      if (sp.alpha <= 0) {
        anodeSparks.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.strokeStyle = `rgba(56, 189, 248, ${sp.alpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // Render V_stop vs Frequency Plot
  function renderGraph() {
    const W = graphLogicalW;
    const H = graphLogicalH;
    graphCtx.clearRect(0, 0, W, H);

    // Padding
    const padL = 44;
    const padB = 28;
    const padT = 16;
    const padR = 24;

    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    // Background Grid
    graphCtx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    graphCtx.lineWidth = 1;
    for (let gx = padL; gx <= W - padR; gx += plotW / 5) {
      graphCtx.beginPath();
      graphCtx.moveTo(gx, padT);
      graphCtx.lineTo(gx, H - padB);
      graphCtx.stroke();
    }
    for (let gy = padT; gy <= H - padB; gy += plotH / 4) {
      graphCtx.beginPath();
      graphCtx.moveTo(padL, gy);
      graphCtx.lineTo(W - padR, gy);
      graphCtx.stroke();
    }

    // Axes
    graphCtx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    graphCtx.lineWidth = 1.5;
    graphCtx.beginPath();
    graphCtx.moveTo(padL, padT);
    graphCtx.lineTo(padL, H - padB);
    graphCtx.lineTo(W - padR, H - padB);
    graphCtx.stroke();

    // Plot Theoretical Straight Line: V_stop = (h/e) * f - (Phi/e)
    const f_min = 4.0e14;
    const f_max = 15.0e14;
    const V_max_plot = 4.0;

    const f0 = (activeMetal.workFunction / h_eVs);
    const x0 = padL + Math.max(0, (f0 - f_min) / (f_max - f_min)) * plotW;
    const y0 = H - padB;

    const yEnd = (H - padB) - ((h_eVs * f_max - activeMetal.workFunction) / V_max_plot) * plotH;

    // Threshold frequency cutoff guideline
    if (x0 >= padL && x0 <= W - padR) {
      graphCtx.strokeStyle = "rgba(234, 179, 8, 0.4)";
      graphCtx.lineWidth = 1;
      graphCtx.setLineDash([3, 3]);
      graphCtx.beginPath();
      graphCtx.moveTo(x0, H - padB);
      graphCtx.lineTo(x0, padT + 10);
      graphCtx.stroke();
      graphCtx.setLineDash([]);

      graphCtx.fillStyle = "#facc15";
      graphCtx.font = "8px monospace";
      graphCtx.textAlign = "center";
      graphCtx.fillText("f₀", x0, H - padB + 10);
    }

    // Theoretical Linear Fit: V_stop vs f
    graphCtx.strokeStyle = "#c084fc";
    graphCtx.lineWidth = 2.2;
    graphCtx.beginPath();
    graphCtx.moveTo(x0, y0);
    graphCtx.lineTo(W - padR, yEnd);
    graphCtx.stroke();

    // Current Operating Point
    const currentF = c / (wavelength * 1e-9);
    const currentVstop = Math.max(0, (h_eVs * currentF - activeMetal.workFunction));
    const ptX = padL + ((currentF - f_min) / (f_max - f_min)) * plotW;
    const ptY = (H - padB) - (currentVstop / V_max_plot) * plotH;

    if (ptX >= padL && ptX <= W - padR && ptY <= H - padB && ptY >= padT) {
      // Glow halo
      graphCtx.fillStyle = "rgba(56, 189, 248, 0.3)";
      graphCtx.beginPath();
      graphCtx.arc(ptX, ptY, 8, 0, Math.PI * 2);
      graphCtx.fill();

      // Core point
      graphCtx.fillStyle = "#38bdf8";
      graphCtx.beginPath();
      graphCtx.arc(ptX, ptY, 4.5, 0, Math.PI * 2);
      graphCtx.fill();

      // Operating Point Tooltip Coordinates
      graphCtx.fillStyle = "#38bdf8";
      graphCtx.font = "bold 9px monospace";
      graphCtx.textAlign = "left";
      graphCtx.fillText(`(${ (currentF / 1e14).toFixed(1) }×10¹⁴, ${currentVstop.toFixed(2)}V)`, Math.min(ptX + 6, W - padR - 70), ptY - 6);
    }

    // Axis Labels
    graphCtx.fillStyle = "#94a3b8";
    graphCtx.font = "9px monospace";
    graphCtx.textAlign = "right";
    graphCtx.fillText("4.0V", padL - 4, padT + 8);
    graphCtx.fillText("0.0V", padL - 4, H - padB);
    graphCtx.textAlign = "center";
    graphCtx.fillText("Frequency f (×10¹⁴ Hz) ➔", W / 2, H - 8);
    graphCtx.save();
    graphCtx.translate(12, H / 2);
    graphCtx.rotate(-Math.PI / 2);
    graphCtx.fillText("V_stop (V)", 0, 0);
    graphCtx.restore();
  }

  // Animation Step
  let lastTime = performance.now();
  let lastFrameTime = 0;

  function loop(currentTime) {
    if (!container || !container.isConnected) {
      if (animId) cancelAnimationFrame(animId);
      return;
    }

    const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
    lastTime = currentTime;

    const isSmart = (document.documentElement.getAttribute("data-mode") === "smartboard") ||
                    document.documentElement.classList.contains("fast-smartboard-mode") ||
                    /Android|MAXHUB/i.test(navigator.userAgent);
    const interval = isSmart ? 33.3 : 16.0;

    const photoOverlay = container.querySelector("#photoelectric-photo-overlay");
    const isPhotoOverlay = photoOverlay && photoOverlay.style.display === "block";

    if (!isPhotoOverlay) {
      // Physics calculations
      const E_photon = hc_eVnm / wavelength;
      const freq_Hz = c / (wavelength * 1e-9);
      const KE_max = Math.max(0, E_photon - activeMetal.workFunction);
      const V_stop = KE_max; // since e * V_stop = KE_max (in eV and V)
      const isEmitting = E_photon >= activeMetal.workFunction && lightIntensity > 0;

      let current_nA = 0;
      if (isEmitting) {
        if (batteryVoltage >= -V_stop) {
          // Current increases with accelerating voltage up to saturation
          const satCurrent = (lightIntensity / 100) * 3.5;
          const normV = (batteryVoltage + V_stop) / Math.max(0.1, V_stop + 1.0);
          current_nA = Math.min(satCurrent, satCurrent * Math.sqrt(Math.max(0, normV)));
        }
      }

      const isCurrentFlowing = isEmitting && batteryVoltage > -V_stop;
      const hasActiveAnimation = (lightIntensity > 0) || (photoelectrons.length > 0) || (incomingPhotons.length > 0) || (anodeSparks.length > 0);

      if (isCurrentFlowing || hasActiveAnimation) {
        if (!currentTime || currentTime - lastFrameTime >= interval) {
          lastFrameTime = currentTime;
          elapsedSeconds += dt;

          dispEnergy.innerText = `E = ${E_photon.toFixed(3)} eV`;
          dispFreq.innerText = `f = ${(freq_Hz / 1e14).toFixed(2)} × 10¹⁴ Hz`;
          dispKE.innerText = `KE_max = ${KE_max.toFixed(3)} eV`;
          dispVstop.innerText = `Stopping V_stop = ${V_stop.toFixed(3)} V`;
          dispCurrent.innerText = `${current_nA.toFixed(2)} nA`;
          if (!isEmitting) {
            dispStatus.innerText = "🛑 No Emission: Photon energy hf is below work function Φ. Zero electrons ejected.";
          } else if (batteryVoltage <= -V_stop) {
            dispStatus.innerText = "⛔ Stopping Potential Reached: Retarding field halts all ejected photoelectrons.";
          } else {
            dispStatus.innerText = `⚡ Photoemission Active: Ejected electrons bridge cathode to anode (I = ${current_nA.toFixed(2)} nA).`;
          }

          renderApparatus();
          if (graphNeedsRedraw) {
            renderGraph();
            graphNeedsRedraw = false;
          }
        }
      } else if (needsRedraw) {
        dispEnergy.innerText = `E = ${E_photon.toFixed(3)} eV`;
        dispFreq.innerText = `f = ${(freq_Hz / 1e14).toFixed(2)} × 10¹⁴ Hz`;
        dispKE.innerText = `KE_max = ${KE_max.toFixed(3)} eV`;
        dispVstop.innerText = `Stopping V_stop = ${V_stop.toFixed(3)} V`;
        dispCurrent.innerText = `${current_nA.toFixed(2)} nA`;

        if (!isEmitting) {
          dispStatus.innerText = "🛑 No Emission: Photon energy hf is below work function Φ. Zero electrons ejected.";
        } else if (batteryVoltage <= -V_stop) {
          dispStatus.innerText = "⛔ Stopping Potential Reached: Retarding field halts all ejected photoelectrons.";
        } else {
          dispStatus.innerText = `⚡ Photoemission Active: Ejected electrons bridge cathode to anode (I = ${current_nA.toFixed(2)} nA).`;
        }

        renderApparatus();
        renderGraph();
        needsRedraw = false;
        graphNeedsRedraw = false;
      }
    }

    animId = requestAnimationFrame(loop);
  }
  animId = requestAnimationFrame(loop);

  // --- EVENT LISTENERS ---
  const btnSim = container.querySelector("#view-mode-pe-sim");
  const btnPhoto = container.querySelector("#view-mode-pe-photo");
  const photoOverlay = container.querySelector("#photoelectric-photo-overlay");

  btnSim?.addEventListener("click", () => {
    btnSim.classList.add("active");
    btnSim.style.background = "";
    btnPhoto.classList.remove("active");
    btnPhoto.style.background = "transparent";
    if (photoOverlay) photoOverlay.style.display = "none";
    needsRedraw = true;
    graphNeedsRedraw = true;
    SoundFX.playClick();
  });

  btnPhoto?.addEventListener("click", () => {
    btnPhoto.classList.add("active");
    btnPhoto.style.background = "";
    btnSim.classList.remove("active");
    btnSim.style.background = "transparent";
    if (photoOverlay) photoOverlay.style.display = "block";
    SoundFX.playClick();
  });

  // Auto-find V_stop button
  container.querySelector("#btn-pe-find-vstop")?.addEventListener("click", () => {
    const E_photon = hc_eVnm / wavelength;
    const KE_max = Math.max(0, E_photon - activeMetal.workFunction);
    batteryVoltage = -KE_max;
    container.querySelector("#slider-pe-voltage").value = batteryVoltage;
    container.querySelector("#lbl-pe-voltage").innerText = `${batteryVoltage.toFixed(2)} V`;
    needsRedraw = true;
    graphNeedsRedraw = true;
    SoundFX.playSwitchSnap();
  });

  // Switch Metals
  container.querySelectorAll("[data-metal]").forEach(btn => {
    btn.addEventListener("click", () => {
      container.querySelectorAll("[data-metal]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentMetalKey = btn.dataset.metal;
      activeMetal = METALS[currentMetalKey];
      container.querySelector("#disp-metal-desc").innerText = activeMetal.desc;
      needsRedraw = true;
      graphNeedsRedraw = true;
      SoundFX.playClick();
    });
  });

  // Sliders
  container.querySelector("#slider-pe-wavelength")?.addEventListener("input", (e) => {
    wavelength = parseInt(e.target.value, 10);
    container.querySelector("#lbl-pe-wavelength").innerText = `${wavelength} nm`;
    needsRedraw = true;
    graphNeedsRedraw = true;
  });

  container.querySelector("#slider-pe-intensity")?.addEventListener("input", (e) => {
    lightIntensity = parseInt(e.target.value, 10);
    container.querySelector("#lbl-pe-intensity").innerText = `${lightIntensity}%`;
    needsRedraw = true;
  });

  container.querySelector("#slider-pe-voltage")?.addEventListener("input", (e) => {
    batteryVoltage = parseFloat(e.target.value);
    container.querySelector("#lbl-pe-voltage").innerText = `${batteryVoltage.toFixed(2)} V`;
    needsRedraw = true;
    graphNeedsRedraw = true;
  });

  // Export CSV
  container.querySelector("#btn-pe-export")?.addEventListener("click", () => {
    const E_photon = hc_eVnm / wavelength;
    const freq_Hz = c / (wavelength * 1e-9);
    const KE_max = Math.max(0, E_photon - activeMetal.workFunction);

    exportLabDataCsv({
      title: "Photoelectric Effect & Planck Relation Telemetry",
      labId: "photoelectric",
      parameters: {
        "Target Cathode Metal": activeMetal.name,
        "Work Function Phi (eV)": activeMetal.workFunction,
        "Wavelength lambda (nm)": wavelength,
        "Frequency f (Hz)": freq_Hz.toExponential(4),
        "Photon Energy hf (eV)": E_photon.toFixed(3),
        "Max Kinetic Energy KE_max (eV)": KE_max.toFixed(3),
        "Stopping Potential V_stop (V)": KE_max.toFixed(3),
        "Light Intensity (%)": lightIntensity
      },
      headers: ["Parameter", "Value"],
      dataRows: [
        ["Target Metal", activeMetal.name],
        ["Wavelength (nm)", wavelength],
        ["Frequency (Hz)", freq_Hz.toExponential(3)],
        ["Photon Energy (eV)", E_photon.toFixed(3)],
        ["Work Function (eV)", activeMetal.workFunction.toFixed(3)],
        ["KE_max (eV)", KE_max.toFixed(3)],
        ["Stopping V_stop (V)", KE_max.toFixed(3)]
      ]
    });
  });

  // Standardized Hotkey: 'e' or 'E' triggers CSV telemetry export
  const handleKeyDown = (e) => {
    if ((e.key === "e" || e.key === "E") && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      container.querySelector("#btn-pe-export")?.click();
    }
  };
  window.addEventListener("keydown", handleKeyDown);

  // Mount Post-Lab Checkpoint Assessment
  mountLabCheckpoint("pe-checkpoint-container", "photoelectric");

  const cleanup = () => {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("resize", setupHiDPICanvas);
    window.removeEventListener("keydown", handleKeyDown);
  };
  activePhotoelectricCleanup = cleanup;
  return cleanup;
}

let activePhotoelectricCleanup = null;

export function cleanupPhotoelectricLab() {
  if (typeof activePhotoelectricCleanup === "function") {
    activePhotoelectricCleanup();
    activePhotoelectricCleanup = null;
  }
}

