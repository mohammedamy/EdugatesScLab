// Edugates-ClipSAT Science Labs - Biology: Photosynthesis & Cellular Respiration Respirometer
// Photorealistic Dual-Mode Biological Metabolic Chamber:
// Elodea Oxygen Bubble Evolution, Variable Light Spectrum & Absorption Action Spectra,
// Manometer Micro-Respirometer, Temperature Kinetics, and Real-Time Biochemical Telemetry.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initPhotosynthesisLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Chamber State
  let apparatusMode = "photosynthesis"; // 'photosynthesis' or 'respiration'
  let lightIntensity = 1200; // lux (0 - 2000)
  let wavelengthFilter = "white"; // 'white', 'blue', 'red', 'green'
  let co2Concentration = 600; // ppm (0 - 1500)
  let temperature = 25; // °C (5 - 50)
  let peaState = "germinating"; // 'germinating', 'dormant', 'glass_beads'
  let isRunning = true;
  let elapsedSeconds = 0;
  let o2ProducedTotal = 0; // mL
  let bubblesPerMin = 0;
  let bubbles = [];
  let animId = null;

  // Rolling history for graph
  const historyData = [];

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #22c55e; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 10px #22c55e;"></span>
            Cellular Energetics &amp; Respirometry Workbench
          </span>
          <span class="badge" style="background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.3); color: #4ade80; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            Action Spectra &amp; Manometric Respiration
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="mode-btn-photo" class="btn btn-secondary ${apparatusMode === 'photosynthesis' ? 'active' : ''}" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border: none;">
              🌿 Photosynthesis Chamber
            </button>
            <button id="mode-btn-resp" class="btn btn-secondary ${apparatusMode === 'respiration' ? 'active' : ''}" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border: none;">
              🧫 Pea Respirometer
            </button>
            <button id="mode-btn-real-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border: none; background: transparent;">
              📸 4K Real Lab Bench
            </button>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-photo-toggle-run" style="padding: 5px 12px; font-size: 0.78rem;">
            ${isRunning ? "⏸ Pause" : "▶ Resume"}
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-photo-export" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export Telemetry
          </button>
        </div>
      </div>

      <!-- Main Layout: Visual Chamber on Left, Controls & Graphs on Right -->
      <div style="display: grid; grid-template-columns: 1.25fr 1fr; gap: 20px;" class="photo-layout">
        <!-- Chamber Canvas -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(34, 197, 94, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #07130b 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="photo-chamber-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
          <div id="photosynthesis-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <img src="assets/labs/photosynthesis_bench.jpg" alt="4K Photosynthesis & Photobiology Laboratory Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            
            <!-- Live Analytical Telemetry Callout on Photo -->
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(34, 197, 94, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Aquatic Chamber Workstation</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Elodea Densa • NaHCO₃ Buffered</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Vernier Optical DO Probe</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Dissolved O₂: 8.42 mg/L</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Tunable Spectral Illuminator</div>
                <div style="color: #f59e0b; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">430nm Blue / 660nm Red Peak</div>
              </div>
            </div>
          </div>

          <!-- Top HUD Overlay -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;" id="hud-chamber-type">OXYGEN EVOLUTION RATE</div>
              <div style="font-weight: 800; font-size: 1.25rem; color: #4ade80;" id="hud-bubble-rate">32 Bubbles / min</div>
              <div style="font-size: 0.76rem; color: #cbd5e1; font-family: var(--font-mono);" id="hud-sub-rate">Net Rate: 1.42 mL O₂ / hr</div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">METABOLIC ACCUMULATION</div>
              <div style="font-weight: 800; font-size: 1.2rem; color: #38bdf8;" id="hud-o2-total">0.28 mL Total</div>
              <div style="font-size: 0.74rem; color: #f59e0b; font-family: var(--font-mono);" id="hud-elapsed-time">Elapsed: 0s</div>
            </div>
          </div>

          <!-- Bottom Chamber Status Bar -->
          <div style="position: absolute; bottom: 12px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: center; pointer-events: none; font-family: var(--font-mono); font-size: 0.74rem; color: #94a3b8;">
            <span style="background: rgba(0,0,0,0.6); padding: 4px 10px; border-radius: 6px;" id="hud-status-bottom">
              🌿 Elodea canadensis Submerged in 0.5% NaHCO₃
            </span>
            <span style="background: rgba(0,0,0,0.6); padding: 4px 10px; border-radius: 6px;" id="hud-light-status">
              💡 1200 Lux • White Spectrum
            </span>
          </div>
        </div>

        <!-- Controls & Action Spectrum Graph on Right -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <!-- Environmental Variables Card -->
          <div class="lab-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px;">
            <label style="font-size: 0.8rem; font-weight: 700; color: #4ade80; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">
              Environmental &amp; Metabolic Controls
            </label>

            <!-- Photosynthesis Specific Controls -->
            <div id="photo-controls-block" style="display: flex; flex-direction: column; gap: 10px;">
              <!-- Wavelength Filter Chips -->
              <div>
                <div style="font-size: 0.74rem; color: #94a3b8; margin-bottom: 4px; font-family: var(--font-mono);">LIGHT SPECTRUM FILTER</div>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
                  <button class="btn btn-secondary btn-sm ${wavelengthFilter === 'white' ? 'active' : ''}" data-filter="white" style="font-size: 0.72rem; padding: 5px;">White</button>
                  <button class="btn btn-secondary btn-sm ${wavelengthFilter === 'blue' ? 'active' : ''}" data-filter="blue" style="font-size: 0.72rem; padding: 5px; color: #60a5fa;">Blue 430nm</button>
                  <button class="btn btn-secondary btn-sm ${wavelengthFilter === 'red' ? 'active' : ''}" data-filter="red" style="font-size: 0.72rem; padding: 5px; color: #f87171;">Red 660nm</button>
                  <button class="btn btn-secondary btn-sm ${wavelengthFilter === 'green' ? 'active' : ''}" data-filter="green" style="font-size: 0.72rem; padding: 5px; color: #4ade80;">Green 550nm</button>
                </div>
              </div>

              <!-- Light Intensity Slider -->
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>Lamp Irradiance (Intensity)</span>
                  <span style="color: #fbbf24; font-weight: 700;" id="lbl-light-intensity">${lightIntensity} lux</span>
                </div>
                <input type="range" id="slider-light" min="0" max="2000" step="100" value="${lightIntensity}" style="width: 100%; accent-color: #fbbf24;">
              </div>

              <!-- CO2 Concentration -->
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>Dissolved CO₂ (NaHCO₃)</span>
                  <span style="color: #38bdf8; font-weight: 700;" id="lbl-co2-conc">${co2Concentration} ppm</span>
                </div>
                <input type="range" id="slider-co2" min="0" max="1500" step="50" value="${co2Concentration}" style="width: 100%; accent-color: #38bdf8;">
              </div>
            </div>

            <!-- Respiration Specific Controls (Shown when in Respiration mode) -->
            <div id="resp-controls-block" style="display: none; flex-direction: column; gap: 10px;">
              <div>
                <div style="font-size: 0.74rem; color: #94a3b8; margin-bottom: 4px; font-family: var(--font-mono);">RESPIRATION SPECIMEN</div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
                  <button class="btn btn-secondary btn-sm ${peaState === 'germinating' ? 'active' : ''}" data-pea="germinating" style="font-size: 0.72rem; padding: 6px 4px;">🌱 Germinating</button>
                  <button class="btn btn-secondary btn-sm ${peaState === 'dormant' ? 'active' : ''}" data-pea="dormant" style="font-size: 0.72rem; padding: 6px 4px;">🌰 Dormant Peas</button>
                  <button class="btn btn-secondary btn-sm ${peaState === 'glass_beads' ? 'active' : ''}" data-pea="glass_beads" style="font-size: 0.72rem; padding: 6px 4px;">⚪ Glass Beads</button>
                </div>
              </div>
            </div>

            <!-- Temperature Slider (Common to both) -->
            <div style="margin-top: 10px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-family: var(--font-mono); margin-bottom: 4px;">
                <span>Bath Temperature (Enzyme Kinetics)</span>
                <span style="color: #ec4899; font-weight: 700;" id="lbl-temp">${temperature} °C</span>
              </div>
              <input type="range" id="slider-temp" min="5" max="50" step="1" value="${temperature}" style="width: 100%; accent-color: #ec4899;">
            </div>
          </div>

          <!-- Chlorophyll Absorption Spectrum & Respirometer Chart -->
          <div class="lab-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; flex: 1;">
            <div style="font-size: 0.8rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; display: flex; justify-content: space-between;">
              <span id="chart-title">Chlorophyll a &amp; b Absorption Spectrum</span>
              <span style="font-family: var(--font-mono); font-size: 0.72rem; color: #94a3b8;">400 - 700 nm</span>
            </div>
            <div style="height: 135px; width: 100%; position: relative; background: #030712; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
              <canvas id="spectrum-canvas" width="460" height="135" style="width: 100%; height: 135px; display: block;"></canvas>
            </div>

            <div style="margin-top: 8px; background: rgba(34, 197, 94, 0.08); border-left: 3px solid #22c55e; padding: 8px 12px; border-radius: 6px; font-size: 0.8rem; color: var(--text-main);" id="photo-biochem-summary">
              $6\\text{CO}_2 + 6\\text{H}_2\\text{O} \\xrightarrow{h\\nu} \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2$. Blue and red photons drive peak electron excitation.
            </div>
          </div>
        </div>
      </div>

      <!-- CER Checkpoint -->
      <div id="photo-checkpoint-mount" style="margin-top: 20px;"></div>
    </div>
  `;

  // --- CANVASES SETUP ---
  const canvas = document.getElementById("photo-chamber-canvas");
  const ctx = canvas.getContext("2d");

  const spectrumCanvas = document.getElementById("spectrum-canvas");
  const sctx = spectrumCanvas.getContext("2d");

  // Calculate Photosynthetic Rate
  function calculateRates() {
    if (apparatusMode === "photosynthesis") {
      // Wavelength efficiency factor
      let wavelengthFactor = 1.0;
      if (wavelengthFilter === "blue") wavelengthFactor = 0.95;
      else if (wavelengthFilter === "red") wavelengthFactor = 0.88;
      else if (wavelengthFilter === "green") wavelengthFactor = 0.08; // Green light reflected!
      else wavelengthFactor = 1.0;

      // Light saturation curve: I / (I + Ks)
      const lightFactor = lightIntensity / (lightIntensity + 400);

      // CO2 saturation curve
      const co2Factor = co2Concentration / (co2Concentration + 300);

      // Temperature enzyme kinetics (Q10 = 2 up to 35°C, denaturation above 40°C)
      let tempFactor = 1.0;
      if (temperature < 35) {
        tempFactor = Math.pow(1.8, (temperature - 20) / 10);
      } else {
        tempFactor = Math.max(0.05, 1.8 * Math.exp(-0.25 * (temperature - 35)));
      }

      // Net oxygen evolution rate in bubbles/min
      bubblesPerMin = Math.round(55 * wavelengthFactor * lightFactor * co2Factor * tempFactor);
    } else {
      // Cellular respiration mode
      let baseRate = 0;
      if (peaState === "germinating") baseRate = 24;
      else if (peaState === "dormant") baseRate = 4;
      else baseRate = 0; // Glass beads

      // Temperature dependency of cellular respiration
      const tempFactor = Math.pow(1.7, (temperature - 20) / 10);
      bubblesPerMin = Math.round(baseRate * tempFactor);
    }
  }

  function renderPhotosynthesisChamber() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2 - 20;

    // 1. Lamp illumination cone on the left
    if (lightIntensity > 0) {
      ctx.save();
      let coneColor = "rgba(254, 240, 138, 0.15)";
      if (wavelengthFilter === "blue") coneColor = "rgba(96, 165, 250, 0.22)";
      else if (wavelengthFilter === "red") coneColor = "rgba(248, 113, 113, 0.22)";
      else if (wavelengthFilter === "green") coneColor = "rgba(74, 222, 128, 0.22)";

      const intensityOpacity = (lightIntensity / 2000) * 0.4;
      const grad = ctx.createRadialGradient(80, 260, 20, 300, 260, 320);
      grad.addColorStop(0, coneColor);
      grad.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(80, 200);
      ctx.lineTo(w, 80);
      ctx.lineTo(w, 460);
      ctx.lineTo(80, 320);
      ctx.closePath();
      ctx.fill();

      // Lamp apparatus drawing on left
      ctx.fillStyle = "#334155";
      ctx.fillRect(20, 230, 60, 60);
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(80, 260, 24, -Math.PI / 2, Math.PI / 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. Beaker / Glass Cylinder
    ctx.save();
    ctx.fillStyle = "rgba(30, 58, 138, 0.2)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 3;

    // Beaker body
    ctx.fillRect(cx - 75, 120, 150, 340);
    ctx.strokeRect(cx - 75, 120, 150, 340);

    // Water level
    ctx.fillStyle = "rgba(14, 165, 233, 0.25)";
    ctx.fillRect(cx - 73, 140, 146, 318);

    // Inverted Test Tube / Funnel for collecting O2
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx - 24, 70);
    ctx.lineTo(cx - 24, 320);
    ctx.lineTo(cx - 65, 380);
    ctx.lineTo(cx + 65, 380);
    ctx.lineTo(cx + 24, 320);
    ctx.lineTo(cx + 24, 70);
    ctx.arc(cx, 70, 24, 0, Math.PI, true);
    ctx.stroke();

    // Gas pocket accumulated at top of test tube
    const gasHeight = Math.min(60, 12 + o2ProducedTotal * 8);
    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
    ctx.fillRect(cx - 23, 70, 46, gasHeight);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px var(--font-mono, monospace)";
    ctx.textAlign = "center";
    ctx.fillText(`${o2ProducedTotal.toFixed(2)} mL O₂`, cx, 62);

    // 3. Elodea Plant Sprig with cut stem pointing up
    ctx.strokeStyle = "#15803d";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx, 440);
    ctx.quadraticCurveTo(cx - 15, 390, cx, 340);
    ctx.stroke();

    // Leaves
    ctx.fillStyle = "#22c55e";
    for (let ly = 430; ly > 350; ly -= 18) {
      ctx.beginPath();
      ctx.ellipse(cx - 14, ly, 14, 5, -0.4, 0, Math.PI * 2);
      ctx.ellipse(cx + 14, ly, 14, 5, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cut stem nozzle where bubbles emerge
    ctx.fillStyle = "#86efac";
    ctx.beginPath();
    ctx.arc(cx, 340, 4, 0, Math.PI * 2);
    ctx.fill();

    // 4. Oxygen Bubbles Animation
    if (isRunning && bubblesPerMin > 0 && Math.random() < bubblesPerMin / 250) {
      bubbles.push({
        x: cx + (Math.random() * 6 - 3),
        y: 338,
        radius: 2 + Math.random() * 3,
        speed: 1.5 + Math.random() * 1.5,
        wobble: Math.random() * 10
      });
    }

    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.strokeStyle = "rgba(56, 189, 248, 0.9)";
    ctx.lineWidth = 1;

    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      b.y -= b.speed;
      b.x += Math.sin(b.wobble + b.y * 0.08) * 0.4;

      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Check if reached top of inverted tube
      if (b.y <= 70 + gasHeight) {
        o2ProducedTotal += 0.002;
        bubbles.splice(i, 1);
      }
    }
    ctx.restore();
  }

  function renderRespirationChamber() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;

    // Respirometer Vials & Manometer Tube
    ctx.save();
    // Glass vial
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 3;
    ctx.fillRect(cx - 100, 160, 90, 260);
    ctx.strokeRect(cx - 100, 160, 90, 260);

    // KOH absorbent cotton pellet at bottom
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(cx - 96, 380, 82, 35);
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 10px var(--font-mono, monospace)";
    ctx.textAlign = "center";
    ctx.fillText("KOH Cotton", cx - 55, 402);

    // Specimen in vial (Germinating peas / Dormant peas / Glass beads)
    const peaColor = peaState === "germinating" ? "#4ade80" : peaState === "dormant" ? "#a16207" : "#cbd5e1";
    ctx.fillStyle = peaColor;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 3; col++) {
        ctx.beginPath();
        ctx.arc(cx - 82 + col * 26, 260 + row * 22, 10, 0, Math.PI * 2);
        ctx.fill();
        if (peaState === "germinating") {
          // Little radical sprout
          ctx.strokeStyle = "#bef264";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx - 82 + col * 26, 252 + row * 22);
          ctx.lineTo(cx - 78 + col * 26, 246 + row * 22);
          ctx.stroke();
        }
      }
    }

    // U-tube Manometer with dyed fluid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx - 55, 160);
    ctx.lineTo(cx - 55, 100);
    ctx.lineTo(cx + 80, 100);
    ctx.lineTo(cx + 80, 360);
    ctx.arc(cx + 105, 360, 25, Math.PI, 0, true);
    ctx.lineTo(cx + 130, 140);
    ctx.stroke();

    // Red dyed fluid in manometer displaced by O2 consumption
    const displacement = Math.min(120, o2ProducedTotal * 40);
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx + 80, 260 + displacement);
    ctx.lineTo(cx + 80, 360);
    ctx.arc(cx + 105, 360, 25, Math.PI, 0, true);
    ctx.lineTo(cx + 130, 360 - displacement);
    ctx.stroke();

    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 11px var(--font-mono, monospace)";
    ctx.fillText(`Δh = ${displacement.toFixed(1)} mm`, cx + 160, 260);
    ctx.restore();
  }

  function renderSpectrumGraph() {
    const sw = spectrumCanvas.width;
    const sh = spectrumCanvas.height;
    sctx.clearRect(0, 0, sw, sh);

    // Spectrum Color Gradient along the bottom axis
    const grad = sctx.createLinearGradient(40, 0, sw - 10, 0);
    grad.addColorStop(0, "#7c3aed");    // 400nm Violet
    grad.addColorStop(0.2, "#2563eb");  // 450nm Blue
    grad.addColorStop(0.4, "#059669");  // 520nm Green
    grad.addColorStop(0.65, "#eab308"); // 580nm Yellow
    grad.addColorStop(0.85, "#ea580c"); // 640nm Orange
    grad.addColorStop(1, "#dc2626");    // 700nm Red

    sctx.fillStyle = grad;
    sctx.fillRect(40, sh - 14, sw - 50, 10);

    // Chlorophyll a Absorption Curve (Peaks at 430nm and 660nm)
    sctx.strokeStyle = "#38bdf8";
    sctx.lineWidth = 2.5;
    sctx.beginPath();
    for (let x = 40; x < sw - 10; x++) {
      const lambda = 400 + ((x - 40) / (sw - 50)) * 300; // 400 to 700 nm
      // Gaussian peaks at 430 and 660, dip at 550
      const peak1 = Math.exp(-Math.pow((lambda - 430) / 25, 2)) * 85;
      const peak2 = Math.exp(-Math.pow((lambda - 662) / 22, 2)) * 70;
      const dip = 8;
      const absorption = peak1 + peak2 + dip;
      const y = sh - 20 - absorption;

      if (x === 40) sctx.moveTo(x, y);
      else sctx.lineTo(x, y);
    }
    sctx.stroke();

    // Chlorophyll b Absorption Curve (Peaks at 450nm and 640nm)
    sctx.strokeStyle = "#4ade80";
    sctx.lineWidth = 2;
    sctx.setLineDash([3, 3]);
    sctx.beginPath();
    for (let x = 40; x < sw - 10; x++) {
      const lambda = 400 + ((x - 40) / (sw - 50)) * 300;
      const peak1 = Math.exp(-Math.pow((lambda - 455) / 24, 2)) * 75;
      const peak2 = Math.exp(-Math.pow((lambda - 642) / 22, 2)) * 60;
      const absorption = peak1 + peak2 + 5;
      const y = sh - 20 - absorption;

      if (x === 40) sctx.moveTo(x, y);
      else sctx.lineTo(x, y);
    }
    sctx.stroke();
    sctx.setLineDash([]);

    // Active wavelength indicator needle
    let activeWl = 0;
    if (wavelengthFilter === "blue") activeWl = 430;
    else if (wavelengthFilter === "green") activeWl = 550;
    else if (wavelengthFilter === "red") activeWl = 660;

    if (activeWl > 0) {
      const needleX = 40 + ((activeWl - 400) / 300) * (sw - 50);
      sctx.strokeStyle = "#ffffff";
      sctx.lineWidth = 2;
      sctx.beginPath();
      sctx.moveTo(needleX, 0);
      sctx.lineTo(needleX, sh - 14);
      sctx.stroke();

      sctx.fillStyle = "#ffffff";
      sctx.font = "bold 9px var(--font-mono, monospace)";
      sctx.textAlign = "center";
      sctx.fillText(`${activeWl}nm`, needleX, 12);
    }

    // Legend
    sctx.font = "10px var(--font-mono, monospace)";
    sctx.fillStyle = "#38bdf8";
    sctx.fillText("— Chl a", 55, 26);
    sctx.fillStyle = "#4ade80";
    sctx.fillText("-- Chl b", 125, 26);
  }

  function updateHUD() {
    calculateRates();
    const rateMlHr = (bubblesPerMin * 0.05).toFixed(2);

    if (apparatusMode === "photosynthesis") {
      document.getElementById("hud-chamber-type").innerText = "OXYGEN EVOLUTION RATE";
      document.getElementById("hud-bubble-rate").innerText = `${bubblesPerMin} Bubbles / min`;
      document.getElementById("hud-sub-rate").innerText = `Net O₂ Evolution: ${rateMlHr} mL/hr`;
      document.getElementById("hud-status-bottom").innerText = "🌿 Elodea canadensis Submerged in 0.5% NaHCO₃";
      document.getElementById("hud-light-status").innerText = `💡 ${lightIntensity} Lux • ${wavelengthFilter.toUpperCase()}`;
    } else {
      document.getElementById("hud-chamber-type").innerText = "OXYGEN CONSUMPTION RATE";
      document.getElementById("hud-bubble-rate").innerText = `${bubblesPerMin} mm H₂O / min`;
      document.getElementById("hud-sub-rate").innerText = `Respiration Rate: ${rateMlHr} mL O₂/hr`;
      document.getElementById("hud-status-bottom").innerText = `🧫 Respirometer: ${peaState.toUpperCase().replace('_', ' ')}`;
      document.getElementById("hud-light-status").innerText = `🌡 Bath Temp: ${temperature} °C`;
    }

    document.getElementById("hud-o2-total").innerText = `${o2ProducedTotal.toFixed(2)} mL Total`;
  }

  function loop() {
    if (isRunning) {
      elapsedSeconds += 0.016;
      if (Math.floor(elapsedSeconds * 60) % 30 === 0) {
        document.getElementById("hud-elapsed-time").innerText = `Elapsed: ${Math.floor(elapsedSeconds)}s`;
      }
    }

    if (apparatusMode === "photosynthesis") {
      renderPhotosynthesisChamber();
    } else {
      renderRespirationChamber();
    }
    renderSpectrumGraph();

    animId = requestAnimationFrame(loop);
  }
  animId = requestAnimationFrame(loop);

  // --- EVENT LISTENERS ---
  const photoOverlay = document.getElementById("photosynthesis-photo-overlay");
  const btnRealPhoto = document.getElementById("mode-btn-real-photo");

  document.getElementById("mode-btn-photo").addEventListener("click", () => {
    apparatusMode = "photosynthesis";
    document.getElementById("mode-btn-photo").classList.add("active");
    document.getElementById("mode-btn-photo").style.background = "";
    document.getElementById("mode-btn-resp").classList.remove("active");
    document.getElementById("mode-btn-resp").style.background = "";
    if (btnRealPhoto) {
      btnRealPhoto.classList.remove("active");
      btnRealPhoto.style.background = "transparent";
    }
    if (photoOverlay) photoOverlay.style.display = "none";
    document.getElementById("photo-controls-block").style.display = "flex";
    document.getElementById("resp-controls-block").style.display = "none";
    document.getElementById("chart-title").innerText = "Chlorophyll a & b Absorption Spectrum";
    SoundFX.playClick();
    updateHUD();
  });

  document.getElementById("mode-btn-resp").addEventListener("click", () => {
    apparatusMode = "respiration";
    document.getElementById("mode-btn-resp").classList.add("active");
    document.getElementById("mode-btn-resp").style.background = "";
    document.getElementById("mode-btn-photo").classList.remove("active");
    document.getElementById("mode-btn-photo").style.background = "";
    if (btnRealPhoto) {
      btnRealPhoto.classList.remove("active");
      btnRealPhoto.style.background = "transparent";
    }
    if (photoOverlay) photoOverlay.style.display = "none";
    document.getElementById("photo-controls-block").style.display = "none";
    document.getElementById("resp-controls-block").style.display = "flex";
    document.getElementById("chart-title").innerText = "Manometric Respiration Kinetics";
    SoundFX.playClick();
    updateHUD();
  });

  btnRealPhoto?.addEventListener("click", () => {
    btnRealPhoto.classList.add("active");
    btnRealPhoto.style.background = "";
    document.getElementById("mode-btn-photo").classList.remove("active");
    document.getElementById("mode-btn-photo").style.background = "transparent";
    document.getElementById("mode-btn-resp").classList.remove("active");
    document.getElementById("mode-btn-resp").style.background = "transparent";
    if (photoOverlay) photoOverlay.style.display = "block";
    SoundFX.playClick();
  });

  // Wavelength filter buttons
  document.querySelectorAll("[data-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-filter]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      wavelengthFilter = btn.dataset.filter;
      SoundFX.playSwitchSnap();
      updateHUD();
    });
  });

  // Pea specimen buttons
  document.querySelectorAll("[data-pea]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-pea]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      peaState = btn.dataset.pea;
      SoundFX.playSwitchSnap();
      updateHUD();
    });
  });

  // Sliders
  document.getElementById("slider-light").addEventListener("input", (e) => {
    lightIntensity = parseInt(e.target.value, 10);
    document.getElementById("lbl-light-intensity").innerText = `${lightIntensity} lux`;
    updateHUD();
  });

  document.getElementById("slider-co2").addEventListener("input", (e) => {
    co2Concentration = parseInt(e.target.value, 10);
    document.getElementById("lbl-co2-conc").innerText = `${co2Concentration} ppm`;
    updateHUD();
  });

  document.getElementById("slider-temp").addEventListener("input", (e) => {
    temperature = parseInt(e.target.value, 10);
    document.getElementById("lbl-temp").innerText = `${temperature} °C`;
    updateHUD();
  });

  document.getElementById("btn-photo-toggle-run").addEventListener("click", (e) => {
    isRunning = !isRunning;
    e.currentTarget.innerText = isRunning ? "⏸ Pause" : "▶ Resume";
    SoundFX.playClick();
  });

  // Export Telemetry
  document.getElementById("btn-photo-export").addEventListener("click", () => {
    const rows = [
      { Parameter: "Apparatus Mode", Value: apparatusMode },
      { Parameter: "Light Intensity (lux)", Value: lightIntensity },
      { Parameter: "Light Spectrum Filter", Value: wavelengthFilter },
      { Parameter: "CO2 Concentration (ppm)", Value: co2Concentration },
      { Parameter: "Temperature (°C)", Value: temperature },
      { Parameter: "Specimen State", Value: peaState },
      { Parameter: "Elapsed Time (s)", Value: Math.floor(elapsedSeconds) },
      { Parameter: "Oxygen Rate (bubbles/min)", Value: bubblesPerMin },
      { Parameter: "Total Accumulated O2 (mL)", Value: o2ProducedTotal.toFixed(3) }
    ];
    exportLabDataCsv("photosynthesis_respirometry_telemetry.csv", rows);
  });

  // Mount CER Checkpoint
  mountLabCheckpoint("photo-checkpoint-mount", {
    id: "photosynthesis-checkpoint",
    labTitle: "Biology: Photosynthetic Action Spectra & Limiting Factors",
    prompt: "Investigate why green light (550 nm) produces the lowest oxygen bubble rate compared to blue (430 nm) and red (660 nm) light at equal illuminance. Formulate your Claim, provide Evidence from the spectrophotometer absorption curves of Chlorophyll a and b, and present your biochemical Reasoning.",
    claimStarter: "Green light produces the lowest oxygen evolution rate in Elodea because...",
    sampleClaim: "Green light yields the lowest photosynthetic rate because plant pigments reflect rather than absorb green wavelengths, starving the light-dependent reactions of photons.",
    evidenceStarters: [
      "Switching from white to green light (550 nm) dropped the oxygen bubble production from 32 bubbles/min to 3 bubbles/min.",
      "The spectrophotometer absorption spectrum shows deep troughs at 500-600 nm for both Chlorophyll a and Chlorophyll b.",
      "Blue (430 nm) and red (660 nm) wavelengths showed maximum absorbance peaks corresponding to high bubble evolution."
    ],
    reasoningKey: "Photosynthesis is initiated by photon absorption by antenna complex pigments in Thylakoid membranes (Photosystems II and I). Photons in the blue (430 nm) and red (660 nm) bands have quantum energy states matching electron transitions in the porphyrin ring of chlorophyll molecules. In contrast, green wavelengths (520-560 nm) are largely reflected or transmitted rather than absorbed, causing minimal photolysis of water ($2\\text{H}_2\\text{O} \\to 4\\text{H}^+ + 4e^- + \\text{O}_2$) and drastically reducing oxygen bubble formation."
  });

  updateHUD();

  return () => {
    if (animId) cancelAnimationFrame(animId);
  };
}
