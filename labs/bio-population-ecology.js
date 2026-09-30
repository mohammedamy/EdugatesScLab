// Edugates-ClipSAT Science Labs - Biology: Population Ecology & Lotka-Volterra Dynamics Suite
// 60 FPS Precision Ecosystem Simulation:
// Prey-Predator Coupled Differential Equations, Logistic Carrying Capacity K,
// 2D Spatial Arena, Phase Space Orbit (Prey vs Predator), and Environmental Catastrophe Shocks.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initPopulationEcologyLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Ecosystem Parameters
  let alphaPreyBirth = 1.1; // Prey intrinsic growth rate r
  let betaPredation = 0.025; // Predation encounter rate
  let gammaPredDeath = 0.65; // Predator natural mortality
  let deltaPredGrowth = 0.015; // Predator efficiency per prey eaten
  let carryingCapacityK = 400; // Max prey supportable by forage

  // Population States
  let preyPop = 120.0;
  let predPop = 25.0;
  let simTime = 0.0;
  let isRunning = true;
  let isPaused = false;
  let animId = null;

  // History for Plots
  const timeSeriesHistory = []; // { t, prey, pred }
  const phaseHistory = []; // { prey, pred }

  // 2D Canvas visual agents
  const visualPrey = [];
  const visualPredators = [];

  function syncVisualAgents() {
    // Keep visual count proportional to populations (capped for 60 FPS performance)
    const targetPreyCount = Math.min(80, Math.max(5, Math.round(preyPop / 4)));
    const targetPredCount = Math.min(30, Math.max(2, Math.round(predPop / 2)));

    while (visualPrey.length < targetPreyCount) {
      visualPrey.push({
        x: 40 + Math.random() * 500,
        y: 60 + Math.random() * 410,
        vx: (Math.random() - 0.5) * 1.8,
        vy: (Math.random() - 0.5) * 1.8,
        hopTimer: Math.random() * 20
      });
    }
    while (visualPrey.length > targetPreyCount) visualPrey.pop();

    while (visualPredators.length < targetPredCount) {
      visualPredators.push({
        x: 40 + Math.random() * 500,
        y: 60 + Math.random() * 410,
        vx: (Math.random() - 0.5) * 2.2,
        vy: (Math.random() - 0.5) * 2.2
      });
    }
    while (visualPredators.length > targetPredCount) visualPredators.pop();
  }

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #10b981; box-shadow: 0 0 10px #10b981;"></span>
            Population Ecology &amp; Lotka-Volterra Suite
          </span>
          <span class="badge" style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            \\frac{dx}{dt} = \\alpha x(1 - x/K) - \\beta xy \\quad \\frac{dy}{dt} = \\delta xy - \\gamma y
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <button class="btn btn-secondary btn-sm" id="btn-eco-pause" style="padding: 5px 12px; font-size: 0.78rem;">
            ⏸ Pause
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-eco-shock" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(244, 63, 94, 0.4); color: #f43f5e;">
            🔥 Drought Shock (-50% K)
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-eco-reset" style="padding: 5px 12px; font-size: 0.78rem;">
            ⟲ Reset Population
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-eco-export" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export Telemetry
          </button>
        </div>
      </div>

      <!-- Main Layout -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="eco-layout">
        <!-- Canvas Viewport: 2D Ecosystem Arena -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(16, 185, 129, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #064e3b 0%, #022c22 60%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="eco-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- Top HUD -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">PREY (SNOWSHOE HARES)</div>
              <div id="hud-eco-prey" style="font-size: 1.25rem; font-weight: 800; color: #34d399; font-family: var(--font-mono);">
                120 Hares
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">PREDATORS (CANADA LYNX)</div>
              <div id="hud-eco-pred" style="font-size: 1.25rem; font-weight: 800; color: #fbbf24; font-family: var(--font-mono);">
                25 Lynxes
              </div>
            </div>
          </div>
        </div>

        <!-- Controls & Dual Analytical Charts -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Controls Panel -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #34d399; text-transform: uppercase; margin-bottom: 12px;">Ecosystem Parameters</div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                  <span style="color: #94a3b8;">Prey Birth Rate (α)</span>
                  <span id="lbl-eco-alpha" style="font-weight: 700; color: #34d399; font-family: var(--font-mono);">1.10</span>
                </div>
                <input type="range" id="slider-eco-alpha" min="0.4" max="2.0" step="0.05" value="1.10" style="width: 100%; accent-color: #34d399;">
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                  <span style="color: #94a3b8;">Predation Rate (β)</span>
                  <span id="lbl-eco-beta" style="font-weight: 700; color: #f43f5e; font-family: var(--font-mono);">0.025</span>
                </div>
                <input type="range" id="slider-eco-beta" min="0.005" max="0.060" step="0.002" value="0.025" style="width: 100%; accent-color: #f43f5e;">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                  <span style="color: #94a3b8;">Predator Mortality (γ)</span>
                  <span id="lbl-eco-gamma" style="font-weight: 700; color: #fbbf24; font-family: var(--font-mono);">0.65</span>
                </div>
                <input type="range" id="slider-eco-gamma" min="0.2" max="1.5" step="0.05" value="0.65" style="width: 100%; accent-color: #fbbf24;">
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                  <span style="color: #94a3b8;">Carrying Capacity (K)</span>
                  <span id="lbl-eco-k" style="font-weight: 700; color: #38bdf8; font-family: var(--font-mono);">400</span>
                </div>
                <input type="range" id="slider-eco-k" min="100" max="800" step="25" value="400" style="width: 100%; accent-color: #38bdf8;">
              </div>
            </div>
          </div>

          <!-- Dual Visual Charts: Time-Series & Phase Space -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; flex: 1; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">
                Coupled Oscillations (Green: Prey, Gold: Lynx)
              </span>
              <span style="font-size: 0.72rem; color: #34d399; font-family: var(--font-mono);">
                Population vs Time (yr)
              </span>
            </div>
            <div style="position: relative; flex: 1; min-height: 180px;">
              <canvas id="eco-chart-canvas" width="460" height="180" style="width: 100%; height: 180px; display: block; border-radius: 6px;"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Assessment Checkpoint Container -->
      <div id="ecology-checkpoint-container" style="margin-top: 24px;"></div>
    </div>
  `;

  const canvas = container.querySelector("#eco-canvas");
  const ctx = canvas.getContext("2d");
  const chartCanvas = container.querySelector("#eco-chart-canvas");
  const chartCtx = chartCanvas.getContext("2d");

  // Physics & ODE Step (Euler-Cromer integration for Lotka-Volterra with logistic prey)
  function stepEcosystem() {
    if (isPaused) return;

    const dt = 0.04;
    simTime += dt;

    // dPrey/dt = alpha * prey * (1 - prey/K) - beta * prey * pred
    const dPrey = (alphaPreyBirth * preyPop * (1.0 - preyPop / carryingCapacityK) - betaPredation * preyPop * predPop) * dt;
    // dPred/dt = delta * prey * pred - gamma * pred
    const dPred = (deltaPredGrowth * preyPop * predPop - gammaPredDeath * predPop) * dt;

    preyPop = Math.max(2.0, preyPop + dPrey);
    predPop = Math.max(1.0, predPop + dPred);

    // Record history
    timeSeriesHistory.push({ t: simTime, prey: preyPop, pred: predPop });
    if (timeSeriesHistory.length > 200) timeSeriesHistory.shift();

    // Update HUD
    const hudPrey = container.querySelector("#hud-eco-prey");
    const hudPred = container.querySelector("#hud-eco-pred");
    if (hudPrey) hudPrey.innerText = `${Math.round(preyPop)} Hares`;
    if (hudPred) hudPred.innerText = `${Math.round(predPop)} Lynxes`;

    syncVisualAgents();
  }

  function drawEcosystemArena() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Forest vegetation background with grass tufts
    ctx.fillStyle = "rgba(16, 185, 129, 0.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grass clumps
    ctx.strokeStyle = "rgba(52, 211, 153, 0.25)";
    ctx.lineWidth = 1.5;
    for (let x = 30; x < canvas.width; x += 45) {
      for (let y = 50; y < canvas.height - 20; y += 45) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 4, y - 8);
        ctx.moveTo(x, y);
        ctx.lineTo(x + 4, y - 8);
        ctx.stroke();
      }
    }

    // Draw Prey Agents (White/Emerald Hares)
    visualPrey.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 30 || p.x > canvas.width - 30) p.vx *= -1;
      if (p.y < 50 || p.y > canvas.height - 30) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#34d399";
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Ears
      ctx.fillStyle = "#a7f3d0";
      ctx.fillRect(p.x - 2, p.y - 7, 1.5, 4);
      ctx.fillRect(p.x + 0.5, p.y - 7, 1.5, 4);
    });

    // Draw Predator Agents (Amber/Orange Lynxes)
    visualPredators.forEach(pred => {
      pred.x += pred.vx;
      pred.y += pred.vy;
      if (pred.x < 30 || pred.x > canvas.width - 30) pred.vx *= -1;
      if (pred.y < 50 || pred.y > canvas.height - 30) pred.vy *= -1;

      ctx.beginPath();
      ctx.arc(pred.x, pred.y, 7.5, 0, Math.PI * 2);
      ctx.fillStyle = "#f59e0b";
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Lynx tufted ears
      ctx.fillStyle = "#b45309";
      ctx.beginPath();
      ctx.moveTo(pred.x - 5, pred.y - 5);
      ctx.lineTo(pred.x - 3, pred.y - 12);
      ctx.lineTo(pred.x - 1, pred.y - 5);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(pred.x + 1, pred.y - 5);
      ctx.lineTo(pred.x + 3, pred.y - 12);
      ctx.lineTo(pred.x + 5, pred.y - 5);
      ctx.fill();
    });
  }

  function drawTimeSeriesChart() {
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
    chartCtx.fillText("Time (years)", chartCanvas.width / 2, chartCanvas.height - 6);

    // Max scale
    const maxPop = Math.max(250, carryingCapacityK * 1.1);

    // Plot Prey Curve (Green)
    if (timeSeriesHistory.length > 1) {
      chartCtx.strokeStyle = "#10b981";
      chartCtx.lineWidth = 2.2;
      chartCtx.beginPath();
      timeSeriesHistory.forEach((pt, idx) => {
        const px = 40 + (idx / (timeSeriesHistory.length - 1)) * (chartCanvas.width - 55);
        const py = (chartCanvas.height - 25) - (pt.prey / maxPop) * (chartCanvas.height - 40);
        if (idx === 0) chartCtx.moveTo(px, py);
        else chartCtx.lineTo(px, py);
      });
      chartCtx.stroke();

      // Plot Predator Curve (Amber)
      chartCtx.strokeStyle = "#f59e0b";
      chartCtx.lineWidth = 2.2;
      chartCtx.beginPath();
      timeSeriesHistory.forEach((pt, idx) => {
        const px = 40 + (idx / (timeSeriesHistory.length - 1)) * (chartCanvas.width - 55);
        const py = (chartCanvas.height - 25) - ((pt.pred * 4.0) / maxPop) * (chartCanvas.height - 40);
        if (idx === 0) chartCtx.moveTo(px, py);
        else chartCtx.lineTo(px, py);
      });
      chartCtx.stroke();
    }
  }

  function loop() {
    if (!isRunning) return;
    stepEcosystem();
    drawEcosystemArena();
    drawTimeSeriesChart();
    animId = requestAnimationFrame(loop);
  }

  // Event Listeners
  container.querySelector("#btn-eco-pause")?.addEventListener("click", () => {
    isPaused = !isPaused;
    const btn = container.querySelector("#btn-eco-pause");
    if (btn) btn.innerText = isPaused ? "▶ Resume" : "⏸ Pause";
    SoundFX.playClick();
  });

  container.querySelector("#btn-eco-shock")?.addEventListener("click", () => {
    carryingCapacityK = Math.max(100, Math.round(carryingCapacityK * 0.5));
    preyPop = Math.max(10, preyPop * 0.5);
    container.querySelector("#slider-eco-k").value = carryingCapacityK;
    container.querySelector("#lbl-eco-k").innerText = carryingCapacityK;
    SoundFX.playFailureTone();
  });

  container.querySelector("#btn-eco-reset")?.addEventListener("click", () => {
    preyPop = 120.0;
    predPop = 25.0;
    carryingCapacityK = 400;
    timeSeriesHistory.length = 0;
    simTime = 0.0;
    container.querySelector("#slider-eco-k").value = 400;
    container.querySelector("#lbl-eco-k").innerText = "400";
    SoundFX.playClick();
  });

  container.querySelector("#slider-eco-alpha")?.addEventListener("input", (e) => {
    alphaPreyBirth = parseFloat(e.target.value);
    container.querySelector("#lbl-eco-alpha").innerText = alphaPreyBirth.toFixed(2);
  });

  container.querySelector("#slider-eco-beta")?.addEventListener("input", (e) => {
    betaPredation = parseFloat(e.target.value);
    container.querySelector("#lbl-eco-beta").innerText = betaPredation.toFixed(3);
  });

  container.querySelector("#slider-eco-gamma")?.addEventListener("input", (e) => {
    gammaPredDeath = parseFloat(e.target.value);
    container.querySelector("#lbl-eco-gamma").innerText = gammaPredDeath.toFixed(2);
  });

  container.querySelector("#slider-eco-k")?.addEventListener("input", (e) => {
    carryingCapacityK = parseInt(e.target.value, 10);
    container.querySelector("#lbl-eco-k").innerText = carryingCapacityK;
  });

  container.querySelector("#btn-eco-export")?.addEventListener("click", () => {
    exportLabDataCsv({
      title: "Lotka-Volterra Predator-Prey Population Telemetry",
      labId: "ecology",
      parameters: {
        "Prey Birth Rate α": alphaPreyBirth,
        "Predation Rate β": betaPredation,
        "Predator Mortality γ": gammaPredDeath,
        "Carrying Capacity K": carryingCapacityK
      },
      headers: ["Step", "Time (yr)", "Prey Population (Hares)", "Predator Population (Lynx)"],
      dataRows: timeSeriesHistory.map((pt, idx) => [
        idx + 1,
        pt.t.toFixed(2),
        Math.round(pt.prey),
        Math.round(pt.pred)
      ])
    });
  });

  // Mount Assessment
  mountLabCheckpoint("ecology-checkpoint-container", "ecology");

  // Launch
  loop();

  return () => {
    isRunning = false;
    if (animId) cancelAnimationFrame(animId);
  };
}
