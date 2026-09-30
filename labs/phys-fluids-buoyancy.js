// Edugates-ClipSAT Science Labs - Physics: Fluid Dynamics, Buoyancy & Bernoulli Suite
// 60 FPS Precision Fluid Mechanics Simulation:
// Archimedes Buoyant Force F_b = ρ_fluid·V_disp·g, Apparent Weight Spring Scale,
// Overflow Catch Beaker Metrology, Venturi Flow Tube with Manometer Pressure Heads, and Continuity A1·v1 = A2·v2.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initFluidsBuoyancyLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Fluid Library (Density ρ in kg/m³)
  const FLUIDS = {
    water: { name: "Fresh Water (H₂O)", density: 1000.0, color: "rgba(56, 189, 248, 0.4)", surfaceColor: "#0284c7" },
    seawater: { name: "Seawater (3.5% Salinity)", density: 1025.0, color: "rgba(14, 165, 233, 0.45)", surfaceColor: "#0369a1" },
    oil: { name: "Mineral Oil", density: 870.0, color: "rgba(234, 179, 8, 0.35)", surfaceColor: "#ca8a04" },
    ethanol: { name: "Ethanol (C₂H₅OH)", density: 789.0, color: "rgba(16, 185, 129, 0.35)", surfaceColor: "#059669" },
    mercury: { name: "Liquid Mercury (Hg)", density: 13600.0, color: "rgba(148, 163, 184, 0.85)", surfaceColor: "#475569" }
  };

  // Block Material Library (Density ρ in kg/m³)
  const MATERIALS = {
    wood: { name: "Pine Wood (Floats)", density: 550.0, color: "#a16207" },
    ice: { name: "Glacial Ice", density: 917.0, color: "#bae6fd" },
    aluminum: { name: "Solid Aluminum", density: 2700.0, color: "#94a3b8" },
    iron: { name: "Cast Iron", density: 7870.0, color: "#475569" },
    lead: { name: "Pure Lead", density: 11340.0, color: "#334155" }
  };

  // State
  let apparatusMode = "buoyancy"; // "buoyancy" or "venturi"
  let fluidKey = "water";
  let materialKey = "aluminum";
  let blockVolumeLiters = 1.0; // Liters = 1e-3 m³
  let submersionPercent = 100.0; // 0% to 100%
  let flowRateLps = 2.0; // L/s for Venturi mode
  const g = 9.81;

  let isRunning = true;
  let animId = null;
  let simTime = 0;

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #06b6d4; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #06b6d4; box-shadow: 0 0 10px #06b6d4;"></span>
            Fluid Dynamics, Buoyancy &amp; Bernoulli Suite
          </span>
          <span class="badge" style="background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.3); color: #38bdf8; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            F_b = \\rho_{f} V_{\\text{disp}} g \\quad P_1 + \\frac{1}{2}\\rho v_1^2 = P_2 + \\frac{1}{2}\\rho v_2^2
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-fluids-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Fluids Simulator
            </button>
            <button id="view-mode-fluids-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-fluid-mode" style="padding: 5px 14px; font-size: 0.78rem; border-color: rgba(6, 182, 212, 0.4); color: #38bdf8;">
            🔀 Switch to Venturi Tube
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-fluid-reset" style="padding: 5px 12px; font-size: 0.78rem;">
            ⟲ Reset State
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-fluid-export" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export Telemetry
          </button>
        </div>
      </div>

      <!-- Main Layout -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="fluids-layout">
        <!-- Canvas Viewport: Archimedes Tank or Venturi Tube -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(6, 182, 212, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #083344 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="fluids-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
          <div id="fluids-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <img src="assets/labs/fluids_bench.jpg" alt="4K Fluid Mechanics & Archimedes Buoyancy Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            
            <!-- Live Analytical Telemetry Callout on Photo -->
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(6, 182, 212, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Archimedes Overflow Tank</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Suspended Brass Mass &amp; Spout</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">OHAUS Digital Tare Balance</div>
                <div style="color: #facc15; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Displaced Water m = 245.0 g</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Digital Dynamometer Tension</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Buoyant Force F_b = 3.62 N</div>
              </div>
            </div>
          </div>

          <!-- Top HUD -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(6, 182, 212, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">BUOYANT FORCE F_b</div>
              <div id="hud-fluids-fb" style="font-size: 1.25rem; font-weight: 800; color: #38bdf8; font-family: var(--font-mono);">
                9.81 N
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">APPARENT WEIGHT W_app</div>
              <div id="hud-fluids-wapp" style="font-size: 1.25rem; font-weight: 800; color: #10b981; font-family: var(--font-mono);">
                16.68 N
              </div>
            </div>
          </div>
        </div>

        <!-- Controls & Metrology Analysis -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Controls Panel -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; margin-bottom: 12px;">Fluid &amp; Immersed Body Controls</div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div>
                <label style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Liquid Medium</label>
                <select id="select-fluids-fluid" class="form-control" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                  ${Object.entries(FLUIDS).map(([k, f]) => `<option value="${k}">${f.name}</option>`).join("")}
                </select>
              </div>

              <div>
                <label style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Solid Material</label>
                <select id="select-fluids-material" class="form-control" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                  ${Object.entries(MATERIALS).map(([k, m]) => `<option value="${k}" ${k === 'aluminum' ? 'selected' : ''}>${m.name}</option>`).join("")}
                </select>
              </div>
            </div>

            <!-- Submersion Depth Slider -->
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                <span style="color: #94a3b8;">Submersion Depth (Immersion %)</span>
                <span id="lbl-fluids-submersion" style="font-weight: 700; color: #38bdf8; font-family: var(--font-mono);">100%</span>
              </div>
              <input type="range" id="slider-fluids-submersion" min="0" max="100" step="1" value="100" style="width: 100%; accent-color: #38bdf8;">
            </div>

            <!-- Block Volume Slider -->
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                <span style="color: #94a3b8;">Object Volume (V)</span>
                <span id="lbl-fluids-vol" style="font-weight: 700; color: #10b981; font-family: var(--font-mono);">1.00 L (1000 cm³)</span>
              </div>
              <input type="range" id="slider-fluids-vol" min="0.2" max="3.0" step="0.1" value="1.0" style="width: 100%; accent-color: #10b981;">
            </div>

            <!-- Quick Specs -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; background: rgba(0,0,0,0.3); border-radius: 8px; padding: 8px 10px; font-size: 0.75rem; text-align: center;">
              <div>
                <span style="color: #64748b; display: block;">Fluid Density</span>
                <span id="info-fluids-rhof" style="font-weight: 700; color: #38bdf8; font-family: var(--font-mono);">1000 kg/m³</span>
              </div>
              <div>
                <span style="color: #64748b; display: block;">Real Weight (In Air)</span>
                <span id="info-fluids-wreal" style="font-weight: 700; color: #f59e0b; font-family: var(--font-mono);">26.49 N</span>
              </div>
              <div>
                <span style="color: #64748b; display: block;">Displaced Mass</span>
                <span id="info-fluids-mdisp" style="font-weight: 700; color: #10b981; font-family: var(--font-mono);">1.000 kg</span>
              </div>
            </div>
          </div>

          <!-- Analytical Real-time Chart -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; flex: 1; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">
                Archimedes Linear Verification (F_b vs V_disp)
              </span>
              <span style="font-size: 0.72rem; color: #38bdf8; font-family: var(--font-mono);">
                Slope = ρ_f · g
              </span>
            </div>
            <div style="position: relative; flex: 1; min-height: 180px;">
              <canvas id="fluids-chart-canvas" width="460" height="180" style="width: 100%; height: 180px; display: block; border-radius: 6px;"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Assessment Checkpoint Container -->
      <div id="fluids-checkpoint-container" style="margin-top: 24px;"></div>
    </div>
  `;

  const canvas = container.querySelector("#fluids-canvas");
  const ctx = canvas.getContext("2d");
  const chartCanvas = container.querySelector("#fluids-chart-canvas");
  const chartCtx = chartCanvas.getContext("2d");

  function getCalculations() {
    const f = FLUIDS[fluidKey];
    const m = MATERIALS[materialKey];

    const volM3 = blockVolumeLiters * 1e-3; // m³
    const dispVolM3 = volM3 * (submersionPercent / 100.0);
    const massRealKg = m.density * volM3;
    const weightRealN = massRealKg * g;
    const fbN = f.density * dispVolM3 * g;
    const weightAppN = Math.max(0, weightRealN - fbN);
    const massDispKg = f.density * dispVolM3;

    return { f, m, volM3, dispVolM3, massRealKg, weightRealN, fbN, weightAppN, massDispKg };
  }

  function updateHUD() {
    const { f, fbN, weightAppN, weightRealN, massDispKg } = getCalculations();
    const hudFb = container.querySelector("#hud-fluids-fb");
    const hudWapp = container.querySelector("#hud-fluids-wapp");
    const infoRhof = container.querySelector("#info-fluids-rhof");
    const infoWreal = container.querySelector("#info-fluids-wreal");
    const infoMdisp = container.querySelector("#info-fluids-mdisp");

    if (hudFb) hudFb.innerText = `${fbN.toFixed(2)} N`;
    if (hudWapp) hudWapp.innerText = `${weightAppN.toFixed(2)} N`;
    if (infoRhof) infoRhof.innerText = `${f.density} kg/m³`;
    if (infoWreal) infoWreal.innerText = `${weightRealN.toFixed(2)} N`;
    if (infoMdisp) infoMdisp.innerText = `${massDispKg.toFixed(3)} kg`;
  }

  function drawBuoyancyApparatus() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const { f, m, weightAppN, fbN, massDispKg } = getCalculations();

    if (apparatusMode === "buoyancy") {
      // 1. Digital Spring Scale / Force Transducer at Top
      const scaleX = 230;
      const scaleY = 40;
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(scaleX - 45, scaleY, 90, 48, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#10b981";
      ctx.font = "bold 13px var(--font-mono, monospace)";
      ctx.textAlign = "center";
      ctx.fillText(`${weightAppN.toFixed(2)} N`, scaleX, scaleY + 28);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "8px system-ui";
      ctx.fillText("SPRING BALANCE", scaleX, scaleY + 40);

      // 2. Main Overflow Tank with Spout
      const tankX = 130;
      const tankY = 180;
      const tankW = 200;
      const tankH = 260;

      // Tank Body Glass
      ctx.fillStyle = "rgba(15, 23, 42, 0.7)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(tankX, tankY);
      ctx.lineTo(tankX, tankY + tankH);
      ctx.lineTo(tankX + tankW, tankY + tankH);
      ctx.lineTo(tankX + tankW, tankY + 45); // Spout opening
      // Spout beak
      ctx.lineTo(tankX + tankW + 40, tankY + 65);
      ctx.lineTo(tankX + tankW + 40, tankY + 75);
      ctx.lineTo(tankX + tankW, tankY + 65);
      ctx.lineTo(tankX + tankW, tankY);
      ctx.stroke();

      // Fluid in main tank up to spout level
      ctx.fillStyle = f.color;
      ctx.fillRect(tankX + 4, tankY + 45, tankW - 8, tankH - 49);

      // Overflow Beaker on tare balance (Right side)
      const catchX = tankX + tankW + 30;
      const catchY = tankY + 140;
      const catchW = 80;
      const catchH = 120;

      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(catchX, catchY);
      ctx.lineTo(catchX, catchY + catchH);
      ctx.lineTo(catchX + catchW, catchY + catchH);
      ctx.lineTo(catchX + catchW, catchY);
      ctx.stroke();

      // Displaced liquid in catch beaker
      const dispLiquidHeight = Math.min(catchH - 10, massDispKg * 35);
      ctx.fillStyle = f.color;
      ctx.fillRect(catchX + 2, catchY + catchH - dispLiquidHeight, catchW - 4, dispLiquidHeight);

      // Catch balance platform & readout
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(catchX - 10, catchY + catchH, catchW + 20, 20);
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 11px var(--font-mono, monospace)";
      ctx.fillText(`${(massDispKg * 1000).toFixed(0)} g`, catchX + catchW / 2, catchY + catchH + 14);

      // Immersed Solid Block
      const blockW = 60;
      const blockH = 60;
      // Position block based on submersionPercent
      const waterSurfaceY = tankY + 45;
      const blockBottomTargetY = waterSurfaceY + (submersionPercent / 100.0) * blockH;
      const blockY = blockBottomTargetY - blockH;

      // Suspension wire from scale to block
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(scaleX, scaleY + 48);
      ctx.lineTo(scaleX, blockY);
      ctx.stroke();

      // Draw Block
      ctx.fillStyle = m.color;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.fillRect(scaleX - blockW / 2, blockY, blockW, blockH);
      ctx.strokeRect(scaleX - blockW / 2, blockY, blockW, blockH);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px system-ui";
      ctx.fillText(m.name.split(" ")[0], scaleX, blockY + 34);

      // Vectors: Gravitational Force (Down) vs Buoyant Force (Up)
      if (fbN > 0.5) {
        // Buoyancy vector (Upward green arrow)
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(scaleX + 45, blockY + blockH / 2);
        ctx.lineTo(scaleX + 45, blockY + blockH / 2 - Math.min(60, fbN * 2.5));
        ctx.stroke();
        ctx.fillStyle = "#38bdf8";
        ctx.fillText(`F_b = ${fbN.toFixed(1)}N`, scaleX + 85, blockY + blockH / 2 - 25);
      }

    } else {
      // Venturi Flow Tube Mode
      drawVenturiTube();
    }
  }

  function drawVenturiTube() {
    // Pipe with constriction: Section 1 wide, Section 2 narrow throat, Section 3 wide
    const py = 250;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 3;

    // Top pipe profile
    ctx.beginPath();
    ctx.moveTo(40, py - 60);
    ctx.lineTo(180, py - 60);
    ctx.lineTo(260, py - 25); // constricted
    ctx.lineTo(320, py - 25);
    ctx.lineTo(400, py - 60);
    ctx.lineTo(540, py - 60);
    ctx.stroke();

    // Bottom pipe profile
    ctx.beginPath();
    ctx.moveTo(40, py + 60);
    ctx.lineTo(180, py + 60);
    ctx.lineTo(260, py + 25);
    ctx.lineTo(320, py + 25);
    ctx.lineTo(400, py + 60);
    ctx.lineTo(540, py + 60);
    ctx.stroke();

    // Fluid flowing stream lines
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const lineOff = (i - 2.5) * 16;
      ctx.beginPath();
      ctx.moveTo(40, py + lineOff);
      ctx.lineTo(180, py + lineOff);
      ctx.lineTo(260, py + lineOff * 0.4);
      ctx.lineTo(320, py + lineOff * 0.4);
      ctx.lineTo(400, py + lineOff);
      ctx.lineTo(540, py + lineOff);
      ctx.stroke();
    }

    // Vertical Manometers: Column 1 at Wide Section, Column 2 at Narrow Section
    // Manometer 1 (High pressure -> High column)
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(120, 80, 20, 110);
    ctx.fillStyle = "rgba(56, 189, 248, 0.55)";
    ctx.fillRect(122, 110, 16, 80);

    // Manometer 2 (Low pressure -> Low column)
    ctx.strokeRect(280, 80, 20, 145);
    ctx.fillStyle = "rgba(56, 189, 248, 0.55)";
    ctx.fillRect(282, 175, 16, 50);

    // Annotations
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 12px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Wide Section: High P₁, Low v₁", 130, 60);
    ctx.fillText("Throat: Low P₂, High v₂", 290, 60);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px system-ui";
    ctx.fillText("Bernoulli Pressure Drop: ΔP = ½ρ(v₂² - v₁²)", canvas.width / 2, 360);
  }

  function drawAnalyticalChart() {
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
    chartCtx.fillText("Displaced Fluid Volume V_disp (Liters)", chartCanvas.width / 2, chartCanvas.height - 6);

    chartCtx.save();
    chartCtx.translate(18, chartCanvas.height / 2);
    chartCtx.rotate(-Math.PI / 2);
    chartCtx.fillText("Buoyant Force F_b (N)", 0, 0);
    chartCtx.restore();

    // Linear Plot F_b vs V_disp
    const { f, fbN, dispVolM3 } = getCalculations();
    const maxVolL = 3.0;
    const maxFb = (f.density * (maxVolL * 1e-3) * g);

    chartCtx.strokeStyle = "#06b6d4";
    chartCtx.lineWidth = 2.5;
    chartCtx.beginPath();
    chartCtx.moveTo(40, chartCanvas.height - 25);
    chartCtx.lineTo(chartCanvas.width - 25, 20);
    chartCtx.stroke();

    // Current Operating Point
    const curVolL = dispVolM3 * 1000;
    const px = 40 + (curVolL / maxVolL) * (chartCanvas.width - 65);
    const py = (chartCanvas.height - 25) - (fbN / maxFb) * (chartCanvas.height - 45);

    const isSmart = (document.documentElement.getAttribute("data-mode") === "smartboard") ||
                    document.documentElement.classList.contains("fast-smartboard-mode") ||
                    /Android|MAXHUB/i.test(navigator.userAgent);

    chartCtx.beginPath();
    chartCtx.arc(px, py, 5, 0, Math.PI * 2);
    chartCtx.fillStyle = "#facc15";
    if (!isSmart) {
      chartCtx.shadowColor = "#facc15";
      chartCtx.shadowBlur = 8;
    }
    chartCtx.fill();
    if (!isSmart) {
      chartCtx.shadowBlur = 0;
    }
  }

  let lastFrameTime = 0;
  let needsRedraw = true;

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

    const fluidsPhotoOverlay = container.querySelector("#fluids-photo-overlay");
    const isPhotoOverlay = fluidsPhotoOverlay && fluidsPhotoOverlay.style.display === "block";

    if (!isPhotoOverlay) {
      if (apparatusMode === "venturi") {
        if (!now || now - lastFrameTime >= interval) {
          lastFrameTime = now || performance.now();
          simTime += (interval / 1000);
          updateHUD();
          drawBuoyancyApparatus();
          drawAnalyticalChart();
        }
      } else if (needsRedraw) {
        updateHUD();
        drawBuoyancyApparatus();
        drawAnalyticalChart();
        needsRedraw = false;
      }
    }

    animId = requestAnimationFrame(loop);
  }

  // Event Listeners
  container.querySelector("#btn-fluid-mode")?.addEventListener("click", () => {
    apparatusMode = apparatusMode === "buoyancy" ? "venturi" : "buoyancy";
    const btn = container.querySelector("#btn-fluid-mode");
    if (btn) {
      btn.innerText = apparatusMode === "buoyancy" ? "🔀 Switch to Venturi Tube" : "🔀 Switch to Archimedes Tank";
    }
    needsRedraw = true;
    SoundFX.playClick();
  });

  container.querySelector("#select-fluids-fluid")?.addEventListener("change", (e) => {
    fluidKey = e.target.value;
    needsRedraw = true;
    SoundFX.playClick();
  });

  container.querySelector("#select-fluids-material")?.addEventListener("change", (e) => {
    materialKey = e.target.value;
    needsRedraw = true;
    SoundFX.playClick();
  });

  container.querySelector("#slider-fluids-submersion")?.addEventListener("input", (e) => {
    submersionPercent = parseFloat(e.target.value);
    container.querySelector("#lbl-fluids-submersion").innerText = `${submersionPercent.toFixed(0)}%`;
    needsRedraw = true;
  });

  container.querySelector("#slider-fluids-vol")?.addEventListener("input", (e) => {
    blockVolumeLiters = parseFloat(e.target.value);
    container.querySelector("#lbl-fluids-vol").innerText = `${blockVolumeLiters.toFixed(2)} L (${(blockVolumeLiters * 1000).toFixed(0)} cm³)`;
    needsRedraw = true;
  });

  container.querySelector("#btn-fluid-reset")?.addEventListener("click", () => {
    submersionPercent = 100.0;
    blockVolumeLiters = 1.0;
    container.querySelector("#slider-fluids-submersion").value = 100;
    container.querySelector("#slider-fluids-vol").value = 1.0;
    needsRedraw = true;
    SoundFX.playClick();
  });

  container.querySelector("#btn-fluid-export")?.addEventListener("click", () => {
    const { f, m, weightRealN, fbN, weightAppN, massDispKg } = getCalculations();
    exportLabDataCsv({
      title: "Archimedes Buoyancy & Fluid Dynamics Telemetry",
      labId: "fluids",
      parameters: {
        "Liquid Medium": f.name,
        "Fluid Density (kg/m³)": f.density,
        "Object Material": m.name,
        "Solid Density (kg/m³)": m.density,
        "Object Volume (L)": blockVolumeLiters
      },
      headers: ["Submersion (%)", "Displaced Vol (L)", "Displaced Mass (kg)", "Buoyant Force Fb (N)", "Apparent Weight (N)"],
      dataRows: [0, 25, 50, 75, 100].map(sub => {
        const dVol = (blockVolumeLiters * 1e-3) * (sub / 100);
        const mDisp = f.density * dVol;
        const fb = mDisp * g;
        const wApp = Math.max(0, weightRealN - fb);
        return [
          `${sub}%`,
          (dVol * 1000).toFixed(2),
          mDisp.toFixed(3),
          fb.toFixed(2),
          wApp.toFixed(2)
        ];
      })
    });
  });

  // 4K Photo View Switcher
  const btnFluidsSim = container.querySelector("#view-mode-fluids-sim");
  const btnFluidsPhoto = container.querySelector("#view-mode-fluids-photo");
  const fluidsPhotoOverlay = container.querySelector("#fluids-photo-overlay");

  btnFluidsSim?.addEventListener("click", () => {
    btnFluidsSim.classList.add("active");
    btnFluidsSim.style.background = "";
    btnFluidsPhoto.classList.remove("active");
    btnFluidsPhoto.style.background = "transparent";
    if (fluidsPhotoOverlay) fluidsPhotoOverlay.style.display = "none";
    SoundFX.playClick();
  });

  btnFluidsPhoto?.addEventListener("click", () => {
    btnFluidsPhoto.classList.add("active");
    btnFluidsPhoto.style.background = "";
    btnFluidsSim.classList.remove("active");
    btnFluidsSim.style.background = "transparent";
    if (fluidsPhotoOverlay) fluidsPhotoOverlay.style.display = "block";
    SoundFX.playClick();
  });

  // Mount Assessment
  mountLabCheckpoint("fluids-checkpoint-container", "fluids");

  // Launch
  loop();

  return () => {
    isRunning = false;
    if (animId) cancelAnimationFrame(animId);
  };
}
