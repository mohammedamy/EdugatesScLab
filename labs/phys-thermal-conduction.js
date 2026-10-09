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
            ${renderLatex("\\frac{dQ}{dt} = -k A \\frac{dT}{dx} = \\frac{k A (T_{\\text{hot}} - T_{\\text{cold}})}{L}")}
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
            <picture>
              <source srcset="assets/labs/conduction_bench.webp" type="image/webp">
              <img src="assets/labs/conduction_bench.jpg" decoding="async" loading="lazy" alt="4K Thermodynamics & Linear Heat Conduction Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            </picture>
            
            <!-- Live Analytical Telemetry Callout on Photo -->
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.94); backdrop-filter: blur(14px); border: 1.5px solid rgba(249, 115, 22, 0.45); border-radius: 12px; padding: 14px 20px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.76rem; font-weight: 700; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.04em;">Insulated Linear Test Bar</div>
                <div style="color: #fb923c; font-weight: 700; font-family: var(--font-mono); font-size: 0.96rem; margin-top: 2px;">Hot Heater (95°C) &amp; Cold Sink</div>
              </div>
              <div>
                <div style="font-size: 0.76rem; font-weight: 700; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.04em;">5-Point Thermocouple Array</div>
                <div style="color: #facc15; font-weight: 700; font-family: var(--font-mono); font-size: 0.96rem; margin-top: 2px;">PicoLog Multi-Channel Logger</div>
              </div>
              <div>
                <div style="font-size: 0.76rem; font-weight: 700; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.04em;">FLIR Thermal Imaging Camera</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.96rem; margin-top: 2px;">Infrared Gradient Verification</div>
              </div>
            </div>
          </div>

          <!-- Top HUD -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.94); backdrop-filter: blur(12px); border: 1.5px solid rgba(244, 63, 94, 0.45); border-radius: 10px; padding: 9px 16px; pointer-events: auto; box-shadow: 0 8px 24px rgba(0,0,0,0.5);">
              <div style="font-size: 0.78rem; font-weight: 700; color: #cbd5e1; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.04em;">HEAT TRANSFER RATE (POWER)</div>
              <div id="hud-cond-power" style="font-size: 1.35rem; font-weight: 800; color: #f43f5e; font-family: var(--font-mono); margin-top: 2px;">
                573.1 W (J/s)
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.94); backdrop-filter: blur(12px); border: 1.5px solid rgba(56, 189, 248, 0.45); border-radius: 10px; padding: 9px 16px; text-align: right; pointer-events: auto; box-shadow: 0 8px 24px rgba(0,0,0,0.5);">
              <div style="font-size: 0.78rem; font-weight: 700; color: #cbd5e1; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.04em;">THERMAL RESISTANCE R_th</div>
              <div id="hud-cond-rth" style="font-size: 1.25rem; font-weight: 800; color: #38bdf8; font-family: var(--font-mono); margin-top: 2px;">
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
    const { mat, deltaT, heatFluxWatts } = getCalculations();

    // Hot Thermal Reservoir on Left (Red immersion bath)
    const hotX = 32;
    const resW = 84;
    const resH = 268;
    const resY = 150;

    // Cold Thermal Reservoir on Right (Blue chiller bath)
    const coldX = canvas.width - 32 - resW; // 464

    // Conduction Rod connecting Left and Right
    const rodStartX = hotX + resW; // 116
    const rodEndX = coldX; // 464
    const rodWidthPx = rodEndX - rodStartX; // 348
    const rodHeightPx = Math.max(38, Math.min(68, 30 + rodAreaCm2 * 4.5));
    const rodY = 295 - rodHeightPx / 2;

    // 1. Material Specification Top Banner
    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.strokeStyle = "rgba(251, 146, 60, 0.35)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(canvas.width / 2 - 195, 96, 390, 28, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${mat.name} • k = ${mat.k} W/(m·K) • A = ${rodAreaCm2.toFixed(1)} cm² • L = ${rodLengthM.toFixed(2)} m`, canvas.width / 2, 110);
    ctx.restore();

    // 2. Hot Thermal Reservoir (Left)
    ctx.save();
    // Outer Insulated Brushed Metal Enclosure
    const hotBodyGrad = ctx.createLinearGradient(hotX, resY, hotX + resW, resY);
    hotBodyGrad.addColorStop(0, "#1e293b");
    hotBodyGrad.addColorStop(0.3, "#334155");
    hotBodyGrad.addColorStop(0.7, "#1e293b");
    hotBodyGrad.addColorStop(1, "#0f172a");
    ctx.fillStyle = hotBodyGrad;
    ctx.beginPath();
    ctx.roundRect(hotX, resY, resW, resH, 10);
    ctx.fill();
    ctx.strokeStyle = "rgba(239, 68, 68, 0.6)";
    ctx.lineWidth = 2.0;
    ctx.stroke();

    // Top Mounted Digital Temperature Controller Module
    ctx.beginPath();
    ctx.roundRect(hotX + 5, resY + 6, resW - 10, 52, 6);
    ctx.fillStyle = "#090d16";
    ctx.fill();
    ctx.strokeStyle = "rgba(244, 63, 94, 0.65)";
    ctx.lineWidth = 1.4;
    ctx.stroke();

    ctx.fillStyle = "#fca5a5";
    ctx.font = "bold 10px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("HOT BATH", hotX + resW / 2, resY + 23);

    ctx.fillStyle = "#f43f5e";
    ctx.font = "bold 16px var(--font-mono, monospace)";
    ctx.fillText(`${tHot.toFixed(1)}°C`, hotX + resW / 2, resY + 45);

    // Pulsing Heater Status Indicator
    const heatPulse = 0.6 + Math.sin(simClock * 4) * 0.4;
    ctx.fillStyle = `rgba(239, 68, 68, ${heatPulse.toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(hotX + 16, resY + 20, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Lower Thermal Fluid Chamber (Sight Glass)
    const hotChamberX = hotX + 7;
    const hotChamberY = resY + 66;
    const hotChamberW = resW - 14;
    const hotChamberH = resH - 74;

    ctx.beginPath();
    ctx.roundRect(hotChamberX, hotChamberY, hotChamberW, hotChamberH, 6);
    const hotFluidGrad = ctx.createLinearGradient(hotChamberX, hotChamberY, hotChamberX + hotChamberW, hotChamberY);
    hotFluidGrad.addColorStop(0, "#7f1d1d");
    hotFluidGrad.addColorStop(0.5, "#991b1b");
    hotFluidGrad.addColorStop(1, "#b91c1c");
    ctx.fillStyle = hotFluidGrad;
    ctx.fill();
    ctx.strokeStyle = "rgba(248, 113, 113, 0.4)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Immersed Electric Heating Coils
    ctx.strokeStyle = "rgba(253, 186, 116, 0.75)";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let cy = hotChamberY + 16; cy < hotChamberY + hotChamberH - 14; cy += 18) {
      ctx.moveTo(hotChamberX + 12, cy);
      ctx.bezierCurveTo(hotChamberX + 28, cy - 8, hotChamberX + 38, cy + 8, hotChamberX + hotChamberW - 12, cy);
    }
    ctx.stroke();

    // Rising Thermal Convection Bubbles in Hot Oil
    ctx.fillStyle = "rgba(254, 215, 170, 0.6)";
    for (let b = 0; b < 6; b++) {
      const bubbleProgress = (simClock * 28 + b * 26) % (hotChamberH - 16);
      const bx = hotChamberX + 14 + (b * 8) % (hotChamberW - 24);
      const by = hotChamberY + hotChamberH - 10 - bubbleProgress;
      ctx.beginPath();
      ctx.arc(bx, by, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 3. Cold Thermal Reservoir (Right)
    ctx.save();
    // Outer Insulated Brushed Metal Enclosure
    const coldBodyGrad = ctx.createLinearGradient(coldX, resY, coldX + resW, resY);
    coldBodyGrad.addColorStop(0, "#0f172a");
    coldBodyGrad.addColorStop(0.3, "#334155");
    coldBodyGrad.addColorStop(0.7, "#1e293b");
    coldBodyGrad.addColorStop(1, "#0f172a");
    ctx.fillStyle = coldBodyGrad;
    ctx.beginPath();
    ctx.roundRect(coldX, resY, resW, resH, 10);
    ctx.fill();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
    ctx.lineWidth = 2.0;
    ctx.stroke();

    // Top Mounted Digital Chiller Controller Module
    ctx.beginPath();
    ctx.roundRect(coldX + 5, resY + 6, resW - 10, 52, 6);
    ctx.fillStyle = "#090d16";
    ctx.fill();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.65)";
    ctx.lineWidth = 1.4;
    ctx.stroke();

    ctx.fillStyle = "#93c5fd";
    ctx.font = "bold 10px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("COLD BATH", coldX + resW / 2, resY + 23);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 16px var(--font-mono, monospace)";
    ctx.fillText(`${tCold.toFixed(1)}°C`, coldX + resW / 2, resY + 45);

    // Chiller Status Indicator
    const chillPulse = 0.6 + Math.sin(simClock * 3.5 + 1) * 0.4;
    ctx.fillStyle = `rgba(56, 189, 248, ${chillPulse.toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(coldX + 16, resY + 20, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Lower Chilled Fluid Chamber (Sight Glass)
    const coldChamberX = coldX + 7;
    const coldChamberY = resY + 66;
    const coldChamberW = resW - 14;
    const coldChamberH = resH - 74;

    ctx.beginPath();
    ctx.roundRect(coldChamberX, coldChamberY, coldChamberW, coldChamberH, 6);
    const coldFluidGrad = ctx.createLinearGradient(coldChamberX, coldChamberY, coldChamberX + coldChamberW, coldChamberY);
    coldFluidGrad.addColorStop(0, "#082f49");
    coldFluidGrad.addColorStop(0.5, "#0369a1");
    coldFluidGrad.addColorStop(1, "#0284c7");
    ctx.fillStyle = coldFluidGrad;
    ctx.fill();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Submerged Chiller Evaporator Cooling Coils
    ctx.strokeStyle = "rgba(186, 230, 253, 0.7)";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let cy = coldChamberY + 16; cy < coldChamberY + coldChamberH - 14; cy += 18) {
      ctx.moveTo(coldChamberX + 12, cy);
      ctx.bezierCurveTo(coldChamberX + 28, cy - 6, coldChamberX + 38, cy + 6, coldChamberX + coldChamberW - 12, cy);
    }
    ctx.stroke();

    // Falling Chilled Density Micro-Trails / Frost Crystals
    ctx.fillStyle = "rgba(224, 242, 254, 0.65)";
    for (let c = 0; c < 6; c++) {
      const chillProgress = (simClock * 22 + c * 24) % (coldChamberH - 16);
      const cx = coldChamberX + 14 + (c * 8) % (coldChamberW - 24);
      const cy = coldChamberY + 8 + chillProgress;
      ctx.beginPath();
      ctx.arc(cx, cy, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 4. Conduction Rod (3D Cylindrical Shader with Temperature Gradient)
    ctx.save();
    // Base Continuous Fourier Thermal Gradient
    const rodGrad = ctx.createLinearGradient(rodStartX, rodY, rodEndX, rodY);
    rodGrad.addColorStop(0.00, "#ef4444"); // Hot Crimson
    rodGrad.addColorStop(0.22, "#f97316"); // Warm Orange
    rodGrad.addColorStop(0.48, "#eab308"); // Golden Amber
    rodGrad.addColorStop(0.75, "#06b6d4"); // Cyan
    rodGrad.addColorStop(1.00, "#38bdf8"); // Chilled Sky Blue

    ctx.fillStyle = rodGrad;
    ctx.fillRect(rodStartX, rodY, rodWidthPx, rodHeightPx);

    // Cylindrical Metallic Top Specular Highlight
    const topSheen = ctx.createLinearGradient(0, rodY, 0, rodY + rodHeightPx * 0.45);
    topSheen.addColorStop(0, "rgba(255, 255, 255, 0.40)");
    topSheen.addColorStop(1, "rgba(255, 255, 255, 0.0)");
    ctx.fillStyle = topSheen;
    ctx.fillRect(rodStartX, rodY, rodWidthPx, rodHeightPx * 0.45);

    // Cylindrical Bottom Ambient Shadow
    const bottomShadow = ctx.createLinearGradient(0, rodY + rodHeightPx * 0.65, 0, rodY + rodHeightPx);
    bottomShadow.addColorStop(0, "rgba(0, 0, 0, 0.0)");
    bottomShadow.addColorStop(1, "rgba(0, 0, 0, 0.42)");
    ctx.fillStyle = bottomShadow;
    ctx.fillRect(rodStartX, rodY + rodHeightPx * 0.65, rodWidthPx, rodHeightPx * 0.35);

    // Rod Outer Precision Contour
    ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
    ctx.lineWidth = 1.8;
    ctx.strokeRect(rodStartX, rodY, rodWidthPx, rodHeightPx);

    // Insulated Teflon Thermal Flanges / Clamping Collars with Hex Bolts
    ctx.fillStyle = "#334155";
    ctx.fillRect(rodStartX - 4, rodY - 3, 7, rodHeightPx + 6);
    ctx.fillRect(rodEndX - 3, rodY - 3, 7, rodHeightPx + 6);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1.0;
    ctx.strokeRect(rodStartX - 4, rodY - 3, 7, rodHeightPx + 6);
    ctx.strokeRect(rodEndX - 3, rodY - 3, 7, rodHeightPx + 6);
    ctx.restore();

    // 5. Dynamic Heat Energy Flux Vectors (Scaled to Fourier Heat Power)
    const fluxSpeed = Math.min(110, Math.max(20, 24 + Math.sqrt(heatFluxWatts) * 3.2));
    const numArrows = 7;
    ctx.save();
    for (let i = 0; i < numArrows; i++) {
      const arrowX = rodStartX + 14 + ((i * 48 + simClock * fluxSpeed) % (rodWidthPx - 28));
      const arrowY = rodY + rodHeightPx / 2;

      // Glow tail
      const tailGrad = ctx.createLinearGradient(arrowX - 18, arrowY, arrowX + 4, arrowY);
      tailGrad.addColorStop(0, "rgba(255, 255, 255, 0.0)");
      tailGrad.addColorStop(1, "rgba(255, 255, 255, 0.85)");
      ctx.strokeStyle = tailGrad;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(arrowX - 18, arrowY);
      ctx.lineTo(arrowX + 2, arrowY);
      ctx.stroke();

      // Aerodynamic Double-Chevron Head
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(arrowX - 6, arrowY - 6);
      ctx.lineTo(arrowX + 4, arrowY);
      ctx.lineTo(arrowX - 6, arrowY + 6);
      ctx.lineTo(arrowX - 2, arrowY);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 6. 5 Precision Thermocouple Probes (T1 to T5)
    const badgeW = 52;
    const badgeH = 26;
    const badgeY = rodY - 56;

    const probeColors = ["#f43f5e", "#fb923c", "#eab308", "#06b6d4", "#38bdf8"];

    for (let i = 0; i < 5; i++) {
      const frac = i / 4;
      const px = rodStartX + frac * rodWidthPx;
      const probeTemp = tHot - frac * (tHot - tCold);
      const color = probeColors[i];

      // Smart horizontal badge anchoring (zero overlap with reservoirs)
      let badgeX;
      if (i === 0) badgeX = rodStartX + 4;
      else if (i === 4) badgeX = rodEndX - badgeW - 4;
      else badgeX = px - badgeW / 2;

      // Stainless Steel Immersion Probe Needle Sheath
      ctx.save();
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(badgeX + badgeW / 2, badgeY + badgeH);
      ctx.lineTo(px, rodY + 4);
      ctx.stroke();

      // Probe Thermowell Collar on Bar
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(px, rodY, 4.5, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Probe Sensor Head Pill
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6);
      ctx.fillStyle = "rgba(15, 23, 42, 0.94)";
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Temperature Readout Text
      ctx.fillStyle = color;
      ctx.font = "bold 11.5px var(--font-mono, monospace)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${probeTemp.toFixed(1)}°C`, badgeX + badgeW / 2, badgeY + badgeH / 2);
      ctx.restore();
    }

    // 7. Datum Position Rail beneath rod
    const railY = rodY + rodHeightPx + 14;
    const railH = 32;

    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
    ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(rodStartX, railY, rodWidthPx, railH, 6);
    ctx.fill();
    ctx.stroke();

    // Millimeter and Centimeter graduation ticks
    ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
    ctx.lineWidth = 1.0;
    for (let tx = rodStartX; tx <= rodEndX; tx += 10) {
      ctx.beginPath();
      ctx.moveTo(tx, railY);
      ctx.lineTo(tx, railY + 4);
      ctx.stroke();
    }

    // Prominent Station Ticks
    for (let i = 0; i < 5; i++) {
      const frac = i / 4;
      const px = rodStartX + frac * rodWidthPx;
      ctx.strokeStyle = probeColors[i];
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(px, railY);
      ctx.lineTo(px, railY + 7);
      ctx.stroke();
    }

    // High-Contrast Station Distance Labels (Increased text size, zero overlap)
    ctx.font = "bold 11px var(--font-mono, monospace)";
    ctx.fillStyle = "#cbd5e1";
    ctx.textBaseline = "middle";

    for (let i = 0; i < 5; i++) {
      const frac = i / 4;
      const px = rodStartX + frac * rodWidthPx;
      const distText = `x = ${(frac * rodLengthM).toFixed(2)}m`;

      if (i === 0) {
        ctx.textAlign = "left";
        ctx.fillText(distText, rodStartX + 6, railY + railH / 2 + 1);
      } else if (i === 4) {
        ctx.textAlign = "right";
        ctx.fillText(distText, rodEndX - 6, railY + railH / 2 + 1);
      } else {
        ctx.textAlign = "center";
        ctx.fillText(distText, px, railY + railH / 2 + 1);
      }
    }
    ctx.restore();
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
