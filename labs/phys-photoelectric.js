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

  // Photoelectron particles array
  const photoelectrons = [];

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
            KE_{max} = hf - \\Phi = e V_{stop} • Einstein Photon Quantum
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
          <button class="btn btn-secondary btn-sm" id="btn-pe-export" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export Telemetry
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
            <img src="assets/labs/photoelectric_bench.jpg" alt="4K Photoelectric Effect Laboratory Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            
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
                Planck Relation: V_{stop} = \\frac{h}{e}f - \\frac{\\Phi}{e}
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
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Bench Surface
    const benchY = 460;
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, benchY, W, H - benchY);
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, benchY);
    ctx.lineTo(W, benchY);
    ctx.stroke();

    const CX = W * 0.48;
    const CY = 240;

    // --- QUARTZ VACUUM TUBE ENVELOPE (Spherical Bulge) ---
    ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
    ctx.lineWidth = 3;
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    ctx.beginPath();
    ctx.ellipse(CX, CY, 160, 110, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Specular Reflection Curve on Glass
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(CX, CY - 20, 140, 80, 0, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();

    // --- CATHODE PLATE (Target Metal on Left) ---
    const cathX = CX - 100;
    const cathY = CY;
    const cathH = 130;

    ctx.fillStyle = activeMetal.color;
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cathX - 8, cathY - cathH/2, 16, cathH, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(`${activeMetal.name} (Cathode -)`, cathX, cathY - cathH/2 - 10);

    // --- ANODE COLLECTOR RING (Right) ---
    const anodX = CX + 100;
    const anodY = CY;
    const anodH = 110;

    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(anodX, anodY, anodH/2, -Math.PI/2, Math.PI/2);
    ctx.stroke();

    ctx.fillStyle = "#38bdf8";
    ctx.fillText("Anode (+)", anodX, anodY - anodH/2 - 10);

    // --- INCIDENT MONOCHROMATIC LIGHT BEAM ---
    const beamColor = getWavelengthColor(wavelength);
    const lampX = 40;
    const lampY = 120;

    ctx.fillStyle = beamColor;
    ctx.beginPath();
    ctx.moveTo(lampX, lampY - 15);
    ctx.lineTo(cathX, cathY - cathH/2 + 20);
    ctx.lineTo(cathX, cathY + cathH/2 - 20);
    ctx.lineTo(lampX, lampY + 15);
    ctx.closePath();
    ctx.fill();

    // Monochromator Lamp Head
    ctx.fillStyle = "#0f172a";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(lampX - 25, lampY - 30, 45, 60, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 9px system-ui";
    ctx.fillText("LAMP", lampX - 2, lampY + 4);

    // --- PHOTOELECTRONS SIMULATION ---
    const E_photon = hc_eVnm / wavelength;
    const KE_max = E_photon - activeMetal.workFunction;
    const isEmitting = (KE_max > 0) && (lightIntensity > 0);

    if (isEmitting) {
      // Net force on electrons: accelerating voltage F = q * V / d
      // If batteryVoltage is negative, it opposes electron flow
      const netEffectiveKE = KE_max + batteryVoltage;

      // Spawn or animate electrons
      if (Math.random() < (lightIntensity / 100) * 0.4) {
        photoelectrons.push({
          x: cathX + 8,
          y: cathY + (Math.random() - 0.5) * (cathH - 40),
          vx: Math.sqrt(Math.max(0.1, KE_max)) * (2.0 + Math.random()),
          vy: (Math.random() - 0.5) * 1.2,
          alive: true
        });
      }

      ctx.fillStyle = "#00f0ff";
      for (let i = photoelectrons.length - 1; i >= 0; i--) {
        const p = photoelectrons[i];
        // Deceleration/acceleration from electric field
        const ax = batteryVoltage * 1.5;
        p.vx += ax * 0.016;
        p.x += p.vx;
        p.y += p.vy;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Check if reached collector or bounced back
        if (p.x >= anodX || p.x < cathX - 5 || p.y < CY - 100 || p.y > CY + 100) {
          photoelectrons.splice(i, 1);
        }
      }
    } else {
      photoelectrons.length = 0;
    }
  }

  // Render V_stop vs Frequency Plot
  function renderGraph() {
    const W = graphCanvas.width;
    const H = graphCanvas.height;
    graphCtx.clearRect(0, 0, W, H);

    // Axes
    const padL = 40;
    const padB = 25;
    const padT = 15;
    const padR = 20;

    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    graphCtx.strokeStyle = "rgba(255,255,255,0.15)";
    graphCtx.lineWidth = 1;
    graphCtx.beginPath();
    graphCtx.moveTo(padL, padT);
    graphCtx.lineTo(padL, H - padB);
    graphCtx.lineTo(W - padR, H - padB);
    graphCtx.stroke();

    // Plot Theoretical Straight Line: V_stop = (h/e) * f - (Phi/e)
    // Frequency range: 4.0e14 to 15.0e14 Hz
    const f_min = 4.0e14;
    const f_max = 15.0e14;
    const V_max_plot = 4.0;

    graphCtx.strokeStyle = "#a855f7";
    graphCtx.lineWidth = 2;
    graphCtx.beginPath();

    const f0 = (activeMetal.workFunction / h_eVs);
    const x0 = padL + Math.max(0, (f0 - f_min) / (f_max - f_min)) * plotW;
    const y0 = H - padB;

    const yEnd = (H - padB) - ((h_eVs * f_max - activeMetal.workFunction) / V_max_plot) * plotH;

    graphCtx.moveTo(x0, y0);
    graphCtx.lineTo(W - padR, yEnd);
    graphCtx.stroke();

    // Current Operating Point
    const currentF = c / (wavelength * 1e-9);
    const currentVstop = Math.max(0, (h_eVs * currentF - activeMetal.workFunction));
    const ptX = padL + ((currentF - f_min) / (f_max - f_min)) * plotW;
    const ptY = (H - padB) - (currentVstop / V_max_plot) * plotH;

    if (ptX >= padL && ptX <= W - padR && ptY <= H - padB && ptY >= padT) {
      graphCtx.fillStyle = "#00f0ff";
      graphCtx.beginPath();
      graphCtx.arc(ptX, ptY, 5, 0, Math.PI * 2);
      graphCtx.fill();
    }

    // Axis Labels
    graphCtx.fillStyle = "#94a3b8";
    graphCtx.font = "9px monospace";
    graphCtx.textAlign = "right";
    graphCtx.fillText("4V", padL - 4, padT + 8);
    graphCtx.fillText("0V", padL - 4, H - padB);
    graphCtx.textAlign = "center";
    graphCtx.fillText("Frequency f (Hz) ➔", W / 2, H - 6);
  }

  // Animation Step
  let lastTime = performance.now();
  function loop(currentTime) {
    const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
    lastTime = currentTime;
    elapsedSeconds += dt;

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
      SoundFX.playClick();
    });
  });

  // Sliders
  container.querySelector("#slider-pe-wavelength")?.addEventListener("input", (e) => {
    wavelength = parseInt(e.target.value, 10);
    container.querySelector("#lbl-pe-wavelength").innerText = `${wavelength} nm`;
  });

  container.querySelector("#slider-pe-intensity")?.addEventListener("input", (e) => {
    lightIntensity = parseInt(e.target.value, 10);
    container.querySelector("#lbl-pe-intensity").innerText = `${lightIntensity}%`;
  });

  container.querySelector("#slider-pe-voltage")?.addEventListener("input", (e) => {
    batteryVoltage = parseFloat(e.target.value);
    container.querySelector("#lbl-pe-voltage").innerText = `${batteryVoltage.toFixed(2)} V`;
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

  // Mount Post-Lab Checkpoint Assessment
  mountLabCheckpoint("pe-checkpoint-container", "photoelectric");

  return () => {
    if (animId) cancelAnimationFrame(animId);
  };
}
