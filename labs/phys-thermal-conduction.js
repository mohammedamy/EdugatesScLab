// Edugates-ClipSAT Science Labs - Physics: Thermal Conduction & Fourier's Law Suite
// 60 FPS Precision Thermodynamics Simulation:
// Fourier's Law of Heat Conduction (dQ/dt = -k·A·dT/dx), Thermal Resistance R_th,
// Multi-Material Rods (Copper, Aluminum, Brass, Steel, Glass, Wood),
// Real-Time Thermocouple Gradients, Heat Flux Calorimetry, and Linear Temperature Profiles.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initThermalConductionLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Materials Library (Thermal Conductivity k in W/(m·K))
  const MATERIALS = {
    copper: { name: "Pure Copper (Cu)", k: 398.0, density: 8960, baseColor: "#f97316", desc: "Top-tier electrical and thermal conductor" },
    aluminum: { name: "Aluminum (Al)", k: 237.0, density: 2700, baseColor: "#94a3b8", desc: "Lightweight high-efficiency thermal conductor" },
    brass: { name: "Brass (Cu-Zn Alloy)", k: 109.0, density: 8500, baseColor: "#eab308", desc: "Medium thermal conductivity alloy" },
    steel: { name: "Carbon Steel", k: 50.0, density: 7850, baseColor: "#64748b", desc: "Structural metal with moderate thermal resistance" },
    glass: { name: "Pyrex Borosilicate Glass", k: 1.1, density: 2230, baseColor: "#06b6d4", desc: "Thermal insulator / laboratory glassware" },
    wood: { name: "Oak Hardwood", k: 0.17, density: 700, baseColor: "#a16207", desc: "Natural organic insulator with porous cellulose" }
  };

  // State
  let materialKey = "copper";
  let tHot = 95.0; // °C
  let tCold = 5.0; // °C
  let rodLengthM = 0.25; // meters (0.10 to 0.50)
  let rodAreaCm2 = 4.0; // cm² (1.0 to 10.0)
  let isRunning = true;
  let animId = null;
  let simClock = 0;

  // 1D Finite Difference Temperature Array across 20 nodes
  const NUM_NODES = 21;
  const temperatures = new Array(NUM_NODES).fill(20.0);

  function resetTemperatures() {
    for (let i = 0; i < NUM_NODES; i++) {
      const frac = i / (NUM_NODES - 1);
      temperatures[i] = tHot - frac * (tHot - tCold);
    }
  }
  resetTemperatures();

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #f97316; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #f97316; box-shadow: 0 0 10px #f97316;"></span>
            Thermal Conduction &amp; Fourier's Law Suite
          </span>
          <span class="badge" style="background: rgba(249, 115, 22, 0.15); border: 1px solid rgba(249, 115, 22, 0.3); color: #fb923c; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            \\frac{dQ}{dt} = -k A \\frac{dT}{dx} = \\frac{k A (T_{\\text{hot}} - T_{\\text{cold}})}{L}
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-cond-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Thermal Simulator
            </button>
            <button id="view-mode-cond-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-cond-reset" style="padding: 5px 12px; font-size: 0.78rem;">
            ⟲ Equilibrate State
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-cond-export" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export Telemetry
          </button>
        </div>
      </div>

      <!-- Main Layout -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="cond-layout">
        <!-- Canvas Viewport: Thermal Bar & Thermocouples -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(249, 115, 22, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #2e1005 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="cond-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
          <div id="cond-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <img src="assets/labs/conduction_bench.jpg" alt="4K Thermodynamics & Linear Heat Conduction Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            
            <!-- Live Analytical Telemetry Callout on Photo -->
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(249, 115, 22, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Insulated Linear Test Bar</div>
                <div style="color: #fb923c; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Hot Heater (95°C) &amp; Cold Sink</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">5-Point Thermocouple Array</div>
                <div style="color: #facc15; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">PicoLog Multi-Channel Logger</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">FLIR Thermal Imaging Camera</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Infrared Gradient Verification</div>
              </div>
            </div>
          </div>

          <!-- Top HUD -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(244, 63, 94, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">HEAT TRANSFER RATE (POWER)</div>
              <div id="hud-cond-power" style="font-size: 1.25rem; font-weight: 800; color: #f43f5e; font-family: var(--font-mono);">
                573.1 W (J/s)
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">THERMAL RESISTANCE R_th</div>
              <div id="hud-cond-rth" style="font-size: 1.15rem; font-weight: 800; color: #38bdf8; font-family: var(--font-mono);">
                0.157 K/W
              </div>
            </div>
          </div>
        </div>

        <!-- Controls & Temperature Profile Plot -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Controls Panel -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #fb923c; text-transform: uppercase; margin-bottom: 12px;">Apparatus &amp; Material Properties</div>

            <div style="margin-bottom: 12px;">
              <label style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Thermal Conductor Material</label>
              <select id="select-cond-material" class="form-control" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                ${Object.entries(MATERIALS).map(([k, m]) => `<option value="${k}">${m.name} (k = ${m.k} W/m·K)</option>`).join("")}
              </select>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                  <span style="color: #94a3b8;">Hot Reservoir (T_hot)</span>
                  <span id="lbl-cond-thot" style="font-weight: 700; color: #f43f5e; font-family: var(--font-mono);">95.0 °C</span>
                </div>
                <input type="range" id="slider-cond-thot" min="40.0" max="150.0" step="1.0" value="95.0" style="width: 100%; accent-color: #f43f5e;">
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                  <span style="color: #94a3b8;">Cold Reservoir (T_cold)</span>
                  <span id="lbl-cond-tcold" style="font-weight: 700; color: #38bdf8; font-family: var(--font-mono);">5.0 °C</span>
                </div>
                <input type="range" id="slider-cond-tcold" min="-10.0" max="30.0" step="1.0" value="5.0" style="width: 100%; accent-color: #38bdf8;">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                  <span style="color: #94a3b8;">Rod Length (L)</span>
                  <span id="lbl-cond-length" style="font-weight: 700; color: #a855f7; font-family: var(--font-mono);">0.25 m</span>
                </div>
                <input type="range" id="slider-cond-length" min="0.10" max="0.50" step="0.01" value="0.25" style="width: 100%; accent-color: #a855f7;">
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                  <span style="color: #94a3b8;">Cross Section (A)</span>
                  <span id="lbl-cond-area" style="font-weight: 700; color: #10b981; font-family: var(--font-mono);">4.0 cm²</span>
                </div>
                <input type="range" id="slider-cond-area" min="1.0" max="10.0" step="0.5" value="4.0" style="width: 100%; accent-color: #10b981;">
              </div>
            </div>
          </div>

          <!-- Linear Temperature Gradient Chart -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; flex: 1; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">
                Steady-State Temperature Profile T(x)
              </span>
              <span style="font-size: 0.72rem; color: #fb923c; font-family: var(--font-mono);">
                dT/dx = Constant (°C/m)
              </span>
            </div>
            <div style="position: relative; flex: 1; min-height: 180px;">
              <canvas id="cond-chart-canvas" width="460" height="180" style="width: 100%; height: 180px; display: block; border-radius: 6px;"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Assessment Checkpoint Container -->
      <div id="conduction-checkpoint-container" style="margin-top: 24px;"></div>
    </div>
  `;

  const canvas = container.querySelector("#cond-canvas");
  const ctx = canvas.getContext("2d");
  const chartCanvas = container.querySelector("#cond-chart-canvas");
  const chartCtx = chartCanvas.getContext("2d");

  function getCalculations() {
    const mat = MATERIALS[materialKey];
    const areaM2 = rodAreaCm2 * 1e-4; // m²
    const deltaT = tHot - tCold;
    const rTh = rodLengthM / (mat.k * areaM2); // K/W
    const heatFluxWatts = deltaT / rTh; // W (J/s)
    const tempGradient = deltaT / rodLengthM; // K/m
    return { mat, areaM2, deltaT, rTh, heatFluxWatts, tempGradient };
  }

  function updateHUD() {
    const { heatFluxWatts, rTh } = getCalculations();
    const hudPower = container.querySelector("#hud-cond-power");
    const hudRth = container.querySelector("#hud-cond-rth");
    if (hudPower) hudPower.innerText = `${heatFluxWatts.toFixed(1)} W (J/s)`;
    if (hudRth) hudRth.innerText = `${rTh.toFixed(3)} K/W`;
  }

  function drawApparatus() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const { mat, deltaT } = getCalculations();

    // Hot Thermal Reservoir on Left (Red boiling bath)
    const hotX = 50;
    const resW = 80;
    const resH = 260;
    const resY = 170;

    const hotGrad = ctx.createLinearGradient(hotX, resY, hotX + resW, resY);
    hotGrad.addColorStop(0, "#b91c1c");
    hotGrad.addColorStop(1, "#ef4444");
    ctx.fillStyle = hotGrad;
    ctx.beginPath();
    ctx.roundRect(hotX, resY, resW, resH, 8);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("HOT BATH", hotX + resW / 2, resY + 40);
    ctx.font = "bold 16px var(--font-mono, monospace)";
    ctx.fillText(`${tHot.toFixed(1)}°C`, hotX + resW / 2, resY + 70);

    // Cold Thermal Reservoir on Right (Blue ice bath)
    const coldX = canvas.width - 50 - resW;
    const coldGrad = ctx.createLinearGradient(coldX, resY, coldX + resW, resY);
    coldGrad.addColorStop(0, "#0284c7");
    coldGrad.addColorStop(1, "#0369a1");
    ctx.fillStyle = coldGrad;
    ctx.beginPath();
    ctx.roundRect(coldX, resY, resW, resH, 8);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("COLD BATH", coldX + resW / 2, resY + 40);
    ctx.font = "bold 16px var(--font-mono, monospace)";
    ctx.fillText(`${tCold.toFixed(1)}°C`, coldX + resW / 2, resY + 70);

    // Conduction Rod connecting Left and Right
    const rodStartX = hotX + resW;
    const rodEndX = coldX;
    const rodWidthPx = rodEndX - rodStartX;
    const rodHeightPx = Math.max(30, Math.min(90, rodAreaCm2 * 9));
    const rodY = resY + (resH - rodHeightPx) / 2;

    // Thermal colormap along the rod!
    const rodGrad = ctx.createLinearGradient(rodStartX, rodY, rodEndX, rodY);
    rodGrad.addColorStop(0.0, "#ef4444"); // Crimson Hot
    rodGrad.addColorStop(0.3, "#f97316"); // Orange
    rodGrad.addColorStop(0.6, "#eab308"); // Yellow
    rodGrad.addColorStop(0.85, "#06b6d4"); // Cyan
    rodGrad.addColorStop(1.0, "#38bdf8"); // Frosty Cold

    ctx.fillStyle = rodGrad;
    ctx.fillRect(rodStartX, rodY, rodWidthPx, rodHeightPx);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 2;
    ctx.strokeRect(rodStartX, rodY, rodWidthPx, rodHeightPx);

    // Dynamic Heat Energy Flux Arrows flowing through rod
    const numArrows = 6;
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    for (let i = 0; i < numArrows; i++) {
      const arrowX = rodStartX + ((i * 55 + simClock * 60) % rodWidthPx);
      const arrowY = rodY + rodHeightPx / 2;
      ctx.beginPath();
      ctx.moveTo(arrowX - 8, arrowY - 6);
      ctx.lineTo(arrowX + 4, arrowY);
      ctx.lineTo(arrowX - 8, arrowY + 6);
      ctx.closePath();
      ctx.fill();
    }

    // 5 Digital Thermocouple Temperature Probes
    for (let i = 0; i < 5; i++) {
      const frac = i / 4;
      const px = rodStartX + frac * rodWidthPx;
      const probeTemp = tHot - frac * (tHot - tCold);

      // Probe needle into rod
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, rodY - 35);
      ctx.lineTo(px, rodY + 5);
      ctx.stroke();

      // Probe Sensor Head
      ctx.fillStyle = "#0f172a";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(px - 26, rodY - 65, 52, 26, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 10px var(--font-mono, monospace)";
      ctx.textAlign = "center";
      ctx.fillText(`${probeTemp.toFixed(1)}°C`, px, rodY - 48);

      // Distance tag
      ctx.fillStyle = "#64748b";
      ctx.font = "9px system-ui";
      ctx.fillText(`x = ${(frac * rodLengthM).toFixed(2)}m`, px, rodY + rodHeightPx + 20);
    }

    // Material Tag
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(`${mat.name} • k = ${mat.k} W/(m·K)`, canvas.width / 2, rodY - 78);
  }

  function drawProfileChart() {
    chartCtx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);

    // Background
    chartCtx.fillStyle = "#030712";
    chartCtx.fillRect(0, 0, chartCanvas.width, chartCanvas.height);
    chartCtx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    chartCtx.lineWidth = 1;

    for (let x = 40; x < chartCanvas.width; x += 40) {
      chartCtx.beginPath();
      chartCtx.moveTo(x, 10);
      chartCtx.lineTo(x, chartCanvas.height - 25);
      chartCtx.stroke();
    }
    for (let y = 15; y < chartCanvas.height - 25; y += 30) {
      chartCtx.beginPath();
      chartCtx.moveTo(40, y);
      chartCtx.lineTo(chartCanvas.width - 15, y);
      chartCtx.stroke();
    }

    // Axes
    chartCtx.strokeStyle = "#475569";
    chartCtx.lineWidth = 1.5;
    chartCtx.beginPath();
    chartCtx.moveTo(40, 10);
    chartCtx.lineTo(40, chartCanvas.height - 25);
    chartCtx.lineTo(chartCanvas.width - 15, chartCanvas.height - 25);
    chartCtx.stroke();

    // Axis Labels
    chartCtx.fillStyle = "#94a3b8";
    chartCtx.font = "10px var(--font-mono, monospace)";
    chartCtx.textAlign = "center";
    chartCtx.fillText("Distance along rod x (m)", chartCanvas.width / 2, chartCanvas.height - 6);

    chartCtx.save();
    chartCtx.translate(18, chartCanvas.height / 2);
    chartCtx.rotate(-Math.PI / 2);
    chartCtx.fillText("Temperature T (°C)", 0, 0);
    chartCtx.restore();

    // Linear Steady State Plot T(x) = Thot - (x/L)*(Thot - Tcold)
    chartCtx.strokeStyle = "#f97316";
    chartCtx.lineWidth = 2.8;
    chartCtx.beginPath();

    const startX = 45;
    const endX = chartCanvas.width - 25;
    const maxT = Math.max(120, tHot + 10);

    const startY = (chartCanvas.height - 25) - (tHot / maxT) * (chartCanvas.height - 40);
    const endY = (chartCanvas.height - 25) - (tCold / maxT) * (chartCanvas.height - 40);

    chartCtx.moveTo(startX, startY);
    chartCtx.lineTo(endX, endY);
    chartCtx.stroke();

    // Draw End Points
    chartCtx.beginPath();
    chartCtx.arc(startX, startY, 4, 0, Math.PI * 2);
    chartCtx.fillStyle = "#ef4444";
    chartCtx.fill();

    chartCtx.beginPath();
    chartCtx.arc(endX, endY, 4, 0, Math.PI * 2);
    chartCtx.fillStyle = "#38bdf8";
    chartCtx.fill();
  }

  let lastFrameTime = 0;
  let chartNeedsRedraw = true;

  function loop(now) {
    if (!isRunning) return;
    if (!container || !container.isConnected) {
      isRunning = false;
      if (animId) cancelAnimationFrame(animId);
      return;
    }

    const isSmart = (document.documentElement.getAttribute("data-mode") === "smartboard") ||
                    document.documentElement.classList.contains("fast-smartboard-mode") ||
                    /Android|MAXHUB/i.test(navigator.userAgent);
    const interval = isSmart ? 33.3 : 16.0;

    const condPhotoOverlay = container.querySelector("#cond-photo-overlay");
    const isPhotoOverlay = condPhotoOverlay && condPhotoOverlay.style.display === "block";

    if (!isPhotoOverlay) {
      if (!now || now - lastFrameTime >= interval) {
        lastFrameTime = now || performance.now();
        simClock += (interval / 1000);
        updateHUD();
        drawApparatus();
        if (chartNeedsRedraw) {
          drawProfileChart();
          chartNeedsRedraw = false;
        }
      }
    }

    animId = requestAnimationFrame(loop);
  }

  // Event Listeners
  container.querySelector("#select-cond-material")?.addEventListener("change", (e) => {
    materialKey = e.target.value;
    chartNeedsRedraw = true;
    SoundFX.playClick();
  });

  container.querySelector("#slider-cond-thot")?.addEventListener("input", (e) => {
    tHot = parseFloat(e.target.value);
    container.querySelector("#lbl-cond-thot").innerText = `${tHot.toFixed(1)} °C`;
    chartNeedsRedraw = true;
  });

  container.querySelector("#slider-cond-tcold")?.addEventListener("input", (e) => {
    tCold = parseFloat(e.target.value);
    container.querySelector("#lbl-cond-tcold").innerText = `${tCold.toFixed(1)} °C`;
    chartNeedsRedraw = true;
  });

  container.querySelector("#slider-cond-length")?.addEventListener("input", (e) => {
    rodLengthM = parseFloat(e.target.value);
    container.querySelector("#lbl-cond-length").innerText = `${rodLengthM.toFixed(2)} m`;
    chartNeedsRedraw = true;
  });

  container.querySelector("#slider-cond-area")?.addEventListener("input", (e) => {
    rodAreaCm2 = parseFloat(e.target.value);
    container.querySelector("#lbl-cond-area").innerText = `${rodAreaCm2.toFixed(1)} cm²`;
    chartNeedsRedraw = true;
  });

  container.querySelector("#btn-cond-reset")?.addEventListener("click", () => {
    resetTemperatures();
    chartNeedsRedraw = true;
    SoundFX.playClick();
  });

  container.querySelector("#btn-cond-export")?.addEventListener("click", () => {
    const { mat, heatFluxWatts, rTh, tempGradient } = getCalculations();
    exportLabDataCsv({
      title: "Thermal Conduction & Fourier's Law Telemetry",
      labId: "conduction",
      parameters: {
        "Material": mat.name,
        "Conductivity k (W/m·K)": mat.k,
        "Hot Temp T_hot (°C)": tHot,
        "Cold Temp T_cold (°C)": tCold,
        "Length L (m)": rodLengthM,
        "Area A (cm²)": rodAreaCm2
      },
      headers: ["Probe Index", "Position x (m)", "Local Temperature (°C)", "Temperature Gradient (°C/m)", "Heat Flux Q_dot (W)"],
      dataRows: [0, 0.25, 0.50, 0.75, 1.0].map((frac, idx) => [
        idx + 1,
        (frac * rodLengthM).toFixed(3),
        (tHot - frac * (tHot - tCold)).toFixed(2),
        tempGradient.toFixed(2),
        heatFluxWatts.toFixed(2)
      ])
    });
  });

  // 4K Photo View Switcher
  const btnCondSim = container.querySelector("#view-mode-cond-sim");
  const btnCondPhoto = container.querySelector("#view-mode-cond-photo");
  const condPhotoOverlay = container.querySelector("#cond-photo-overlay");

  btnCondSim?.addEventListener("click", () => {
    btnCondSim.classList.add("active");
    btnCondSim.style.background = "";
    btnCondPhoto.classList.remove("active");
    btnCondPhoto.style.background = "transparent";
    if (condPhotoOverlay) condPhotoOverlay.style.display = "none";
    SoundFX.playClick();
  });

  btnCondPhoto?.addEventListener("click", () => {
    btnCondPhoto.classList.add("active");
    btnCondPhoto.style.background = "";
    btnCondSim.classList.remove("active");
    btnCondSim.style.background = "transparent";
    if (condPhotoOverlay) condPhotoOverlay.style.display = "block";
    SoundFX.playClick();
  });

  // Mount Assessment
  mountLabCheckpoint("conduction-checkpoint-container", "conduction");

  // Launch
  loop();

  return () => {
    isRunning = false;
    if (animId) cancelAnimationFrame(animId);
  };
}
