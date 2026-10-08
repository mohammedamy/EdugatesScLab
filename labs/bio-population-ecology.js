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

  // Season / Coat Molt State (Summer Taiga vs Winter Snowpack)
  let isWinterSeason = false;

  // Natural Boreal Forest / Taiga Environment
  const TREES = [
    { x: 55, y: 85, r: 24, layers: 3 },
    { x: 520, y: 90, r: 26, layers: 3 },
    { x: 75, y: 440, r: 28, layers: 3 },
    { x: 505, y: 430, r: 25, layers: 3 },
    { x: 290, y: 65, r: 22, layers: 3 },
    { x: 45, y: 260, r: 24, layers: 3 },
    { x: 535, y: 270, r: 23, layers: 3 }
  ];

  const BOULDERS = [
    { x: 140, y: 150, rx: 14, ry: 10, rot: 0.3 },
    { x: 420, y: 170, rx: 18, ry: 12, rot: -0.4 },
    { x: 190, y: 390, rx: 15, ry: 11, rot: 0.6 },
    { x: 380, y: 360, rx: 16, ry: 12, rot: 0.1 }
  ];

  const SHRUBS = [];
  for (let i = 0; i < 22; i++) {
    SHRUBS.push({
      x: 70 + (i * 73) % 440,
      y: 90 + (i * 59) % 360,
      r: 6 + (i % 3) * 2,
      berries: i % 2 === 0
    });
  }

  // Atmospheric fog canopy mist
  const fogMist = [];
  for (let i = 0; i < 12; i++) {
    fogMist.push({
      x: Math.random() * 580,
      y: Math.random() * 530,
      r: 50 + Math.random() * 45,
      vx: 0.15 + Math.random() * 0.25,
      alpha: 0.035 + Math.random() * 0.04
    });
  }

  // Interactive forage patches dropped on click
  const forageClusters = [];

  // Pounce / Capture particles
  const capturePuffs = [];

  // 2D Canvas visual agents
  const visualPrey = [];
  const visualPredators = [];

  function syncVisualAgents() {
    // Keep visual count proportional to populations (capped for 60 FPS performance)
    const targetPreyCount = Math.min(75, Math.max(6, Math.round(preyPop / 4)));
    const targetPredCount = Math.min(28, Math.max(2, Math.round(predPop / 2)));

    while (visualPrey.length < targetPreyCount) {
      const angle = Math.random() * Math.PI * 2;
      visualPrey.push({
        x: 60 + Math.random() * 460,
        y: 80 + Math.random() * 380,
        vx: Math.cos(angle) * (0.8 + Math.random() * 0.5),
        vy: Math.sin(angle) * (0.8 + Math.random() * 0.5),
        angle: angle,
        hopPhase: Math.random() * Math.PI * 2,
        isFleeing: false,
        pauseTimer: Math.random() * 40
      });
    }
    while (visualPrey.length > targetPreyCount) visualPrey.pop();

    while (visualPredators.length < targetPredCount) {
      const angle = Math.random() * Math.PI * 2;
      visualPredators.push({
        x: 60 + Math.random() * 460,
        y: 80 + Math.random() * 380,
        vx: Math.cos(angle) * (1.1 + Math.random() * 0.4),
        vy: Math.sin(angle) * (1.1 + Math.random() * 0.4),
        angle: angle,
        walkPhase: Math.random() * Math.PI * 2,
        isChasing: false,
        satiatedTimer: 0
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
            ${renderLatex("\\frac{dx}{dt} = \\alpha x(1 - x/K) - \\beta xy \\quad \\bullet \\quad \\frac{dy}{dt} = \\delta xy - \\gamma y")}
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-eco-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Field Simulator
            </button>
            <button id="view-mode-eco-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Station
            </button>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-eco-season" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;">
            ❄️ Season: Winter Snow
          </button>
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
          <canvas id="eco-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block; cursor: crosshair;"></canvas>

          <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
          <div id="eco-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <img src="assets/labs/ecology_bench.jpg" alt="4K Population Ecology & Field Research Station" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            
            <!-- Live Analytical Telemetry Callout on Photo -->
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Field Telemetry &amp; GPS Station</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Wildlife Demographics Monitor</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Stereomicroscope &amp; Quadrat Grid</div>
                <div style="color: #fbbf24; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Benthic Macroinvertebrate Survey</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Lotka-Volterra Demographics</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Real-Time Oscillations &amp; Phase</div>
              </div>
            </div>
          </div>

          <!-- Top HUD -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">PREY (SNOWSHOE HARES)</div>
              <div id="hud-eco-prey" style="font-size: 1.25rem; font-weight: 800; color: #34d399; font-family: var(--font-mono);">
                120 Hares
              </div>
              <div id="hud-eco-prey-status" style="font-size: 0.68rem; color: #a7f3d0; font-family: var(--font-mono); margin-top: 2px;">
                🌿 Active Foraging &amp; Grazing
              </div>
            </div>

            <!-- Center Biome / Weather Indicator -->
            <div style="background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 20px; padding: 5px 14px; text-align: center; pointer-events: auto; display: flex; align-items: center; gap: 8px;">
              <span id="hud-eco-biome-tag" style="font-size: 0.72rem; color: #38bdf8; font-weight: 700; font-family: var(--font-mono);">
                🌲 Boreal Taiga (Tap field to scatter forage)
              </span>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">PREDATORS (CANADA LYNX)</div>
              <div id="hud-eco-pred" style="font-size: 1.25rem; font-weight: 800; color: #fbbf24; font-family: var(--font-mono);">
                25 Lynxes
              </div>
              <div id="hud-eco-pred-status" style="font-size: 0.68rem; color: #fde68a; font-family: var(--font-mono); margin-top: 2px;">
                🐾 Boreal Stealth Patrol
              </div>
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

  // --- Boreal Ecosystem Terrain Drawing ---
  function drawTerrain() {
    // 1. Forest Ground / Snowpack Layer
    if (!isWinterSeason) {
      // Summer Boreal Taiga floor: rich mossy spruce loam
      const bgGrad = ctx.createRadialGradient(290, 265, 50, 290, 265, 380);
      bgGrad.addColorStop(0, "#083321");
      bgGrad.addColorStop(0.6, "#052618");
      bgGrad.addColorStop(1, "#02170f");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Organic moss patches
      ctx.fillStyle = "rgba(16, 185, 129, 0.08)";
      ctx.beginPath();
      ctx.ellipse(180, 160, 95, 60, 0.4, 0, Math.PI * 2);
      ctx.ellipse(410, 370, 120, 75, -0.3, 0, Math.PI * 2);
      ctx.ellipse(360, 140, 80, 50, 0.2, 0, Math.PI * 2);
      ctx.ellipse(140, 410, 85, 55, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Scattered needle detritus / lichen tufts
      ctx.strokeStyle = "rgba(52, 211, 153, 0.18)";
      ctx.lineWidth = 1.2;
      for (let x = 35; x < canvas.width; x += 48) {
        for (let y = 50; y < canvas.height - 20; y += 46) {
          const ox = ((x * 17 + y * 23) % 20) - 10;
          const oy = ((x * 13 + y * 31) % 18) - 9;
          ctx.beginPath();
          ctx.moveTo(x + ox, y + oy);
          ctx.lineTo(x + ox - 3, y + oy - 6);
          ctx.moveTo(x + ox, y + oy);
          ctx.lineTo(x + ox + 3, y + oy - 5);
          ctx.stroke();
        }
      }
    } else {
      // Winter Boreal Snowpack: crisp windswept subnivean snow
      const snowGrad = ctx.createRadialGradient(290, 265, 40, 290, 265, 400);
      snowGrad.addColorStop(0, "#f8fafc");
      snowGrad.addColorStop(0.55, "#e2e8f0");
      snowGrad.addColorStop(1, "#cbd5e1");
      ctx.fillStyle = snowGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cold ambient blue snow drifts & subtle shadows
      ctx.fillStyle = "rgba(147, 197, 253, 0.22)";
      ctx.beginPath();
      ctx.ellipse(170, 150, 110, 65, 0.35, 0, Math.PI * 2);
      ctx.ellipse(420, 360, 130, 80, -0.3, 0, Math.PI * 2);
      ctx.ellipse(350, 130, 90, 50, 0.1, 0, Math.PI * 2);
      ctx.ellipse(150, 420, 95, 60, -0.25, 0, Math.PI * 2);
      ctx.fill();

      // Windswept snow ridges
      ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 7; i++) {
        const ry = 70 + i * 65;
        ctx.beginPath();
        ctx.moveTo(30, ry);
        ctx.bezierCurveTo(180, ry - 12, 380, ry + 16, 550, ry - 6);
        ctx.stroke();
      }
    }

    // 2. Meandering Boreal Meltwater Creek / Stream
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(275, 0);
    ctx.bezierCurveTo(310, 140, 215, 270, 270, 390);
    ctx.bezierCurveTo(295, 440, 240, 490, 230, 530);
    ctx.lineWidth = isWinterSeason ? 18 : 24;
    ctx.strokeStyle = isWinterSeason ? "rgba(56, 189, 248, 0.32)" : "rgba(14, 165, 233, 0.45)";
    ctx.stroke();

    // Stream animated water shimmer ripples
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = isWinterSeason ? "rgba(255, 255, 255, 0.55)" : "rgba(186, 230, 253, 0.65)";
    const streamFlowOffset = (simTime * 25) % 40;
    for (let s = 20; s < 510; s += 40) {
      const sy = s + streamFlowOffset;
      if (sy < 520) {
        const t = sy / 530;
        const sx = 275 + Math.sin(t * Math.PI * 2.2) * 35;
        ctx.beginPath();
        ctx.moveTo(sx - 5, sy);
        ctx.lineTo(sx + 5, sy + 3);
        ctx.stroke();
      }
    }

    // Winter semi-frozen ice shelf edges along creek
    if (isWinterSeason) {
      ctx.strokeStyle = "rgba(241, 245, 249, 0.85)";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(264, 0);
      ctx.bezierCurveTo(299, 140, 204, 270, 259, 390);
      ctx.bezierCurveTo(284, 440, 229, 490, 219, 530);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(286, 0);
      ctx.bezierCurveTo(321, 140, 226, 270, 281, 390);
      ctx.bezierCurveTo(306, 440, 251, 490, 241, 530);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Granite Boulders
    BOULDERS.forEach(b => {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);

      // Cast shadow
      ctx.beginPath();
      ctx.ellipse(3, 5, b.rx + 1, b.ry + 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.fill();

      // Rock base
      ctx.beginPath();
      ctx.ellipse(0, 0, b.rx, b.ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = isWinterSeason ? "#475569" : "#334155";
      ctx.fill();

      // Facet shading
      ctx.beginPath();
      ctx.ellipse(-2, -2, b.rx * 0.75, b.ry * 0.7, 0, 0, Math.PI * 2);
      ctx.fillStyle = isWinterSeason ? "#64748b" : "#475569";
      ctx.fill();

      // Lichen or Snow cap
      if (isWinterSeason) {
        ctx.beginPath();
        ctx.ellipse(-1, -3, b.rx * 0.85, b.ry * 0.48, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#f8fafc";
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.ellipse(-1, -2, b.rx * 0.55, b.ry * 0.38, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(16, 185, 129, 0.65)";
        ctx.fill();
      }
      ctx.restore();
    });

    // 4. Understory Shrubs & Forage Bushes
    SHRUBS.forEach(shrub => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(shrub.x, shrub.y, shrub.r, 0, Math.PI * 2);
      ctx.fillStyle = isWinterSeason ? "rgba(100, 116, 139, 0.55)" : "rgba(5, 150, 105, 0.65)";
      ctx.fill();

      // Shrub leafy foliage or snow frost
      ctx.beginPath();
      ctx.arc(shrub.x - 2, shrub.y - 2, shrub.r * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = isWinterSeason ? "#e2e8f0" : "rgba(52, 211, 153, 0.75)";
      ctx.fill();

      // Wild Boreal Berries (Lingonberries / Blueberries)
      if (shrub.berries) {
        ctx.fillStyle = isWinterSeason ? "#ef4444" : "#f43f5e";
        ctx.beginPath();
        ctx.arc(shrub.x - 2, shrub.y - 1, 1.8, 0, Math.PI * 2);
        ctx.arc(shrub.x + 3, shrub.y + 2, 1.8, 0, Math.PI * 2);
        ctx.arc(shrub.x + 1, shrub.y - 3, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // 5. Interactive Forage Clusters (dropped by user)
    for (let i = forageClusters.length - 1; i >= 0; i--) {
      const fc = forageClusters[i];
      if (fc.food <= 0) {
        forageClusters.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.translate(fc.x, fc.y);

      // Glowing edible forage ring
      const pulse = 1.0 + Math.sin(simTime * 6) * 0.15;
      ctx.beginPath();
      ctx.arc(0, 0, 13 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(52, 211, 153, 0.18)";
      ctx.fill();
      ctx.strokeStyle = "#34d399";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Tender browse twigs and green leaves
      ctx.strokeStyle = "#15803d";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-7, 4);
      ctx.lineTo(0, -6);
      ctx.lineTo(7, 3);
      ctx.moveTo(0, -6);
      ctx.lineTo(0, 7);
      ctx.stroke();

      ctx.fillStyle = "#86efac";
      ctx.beginPath();
      ctx.arc(-4, -1, 3, 0, Math.PI * 2);
      ctx.arc(4, -1, 3, 0, Math.PI * 2);
      ctx.arc(0, 5, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Food counter pill
      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      ctx.fillRect(-12, -18, 24, 11);
      ctx.fillStyle = "#34d399";
      ctx.font = "bold 8px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${fc.food}x`, 0, -10);

      ctx.restore();
    }
  }

  // --- Coniferous Spruce Trees (Top-Down Canopy Layer) ---
  function drawTrees() {
    TREES.forEach(tree => {
      ctx.save();
      // 2.5D Cast drop shadow on ground
      ctx.beginPath();
      ctx.ellipse(tree.x + 15, tree.y + 18, tree.r * 1.05, tree.r * 0.7, 0.3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.38)";
      ctx.fill();

      // Conifer Needle Tiers (Top-Down perspective)
      for (let layer = 0; layer < tree.layers; layer++) {
        const lr = tree.r * (1.0 - layer * 0.26);
        ctx.beginPath();
        // Scalloped conifer boughs
        const pts = 8;
        for (let p = 0; p < pts; p++) {
          const a1 = (p / pts) * Math.PI * 2;
          const a2 = ((p + 0.5) / pts) * Math.PI * 2;
          const rOut = lr;
          const rIn = lr * 0.72;
          if (p === 0) ctx.moveTo(tree.x + Math.cos(a1) * rOut, tree.y + Math.sin(a1) * rOut);
          else ctx.lineTo(tree.x + Math.cos(a1) * rOut, tree.y + Math.sin(a1) * rOut);
          ctx.lineTo(tree.x + Math.cos(a2) * rIn, tree.y + Math.sin(a2) * rIn);
        }
        ctx.closePath();

        if (!isWinterSeason) {
          if (layer === 0) ctx.fillStyle = "#032e22";
          else if (layer === 1) ctx.fillStyle = "#04563a";
          else ctx.fillStyle = "#059669";
        } else {
          if (layer === 0) ctx.fillStyle = "#1e293b";
          else if (layer === 1) ctx.fillStyle = "#334155";
          else ctx.fillStyle = "#f8fafc";
        }
        ctx.fill();

        // Snow dusting on boughs
        if (isWinterSeason) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
          ctx.lineWidth = 2.0;
          ctx.stroke();
        }
      }

      // Apex crown tip
      ctx.beginPath();
      ctx.arc(tree.x, tree.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = isWinterSeason ? "#ffffff" : "#10b981";
      ctx.fill();

      ctx.restore();
    });
  }

  // --- Anatomical Snowshoe Hare (Lepus americanus) Vector Rendering ---
  function drawSnowshoeHare(ctx, p) {
    ctx.save();

    // Locomotion bounce and squash-and-stretch
    const bounceY = -Math.abs(Math.sin(p.hopPhase)) * (p.isFleeing ? 6.5 : 3.8);
    const stretchX = 1.0 + (p.isFleeing ? 0.22 : 0.12) * Math.cos(p.hopPhase);
    const stretchY = 1.0 - (p.isFleeing ? 0.18 : 0.09) * Math.cos(p.hopPhase);

    // 1. Cast shadow (detaches and contracts at peak leap)
    const shadowScale = Math.max(0.45, 1.0 - Math.abs(bounceY) / 10);
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 4, 9 * shadowScale, 4.5 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fillStyle = isWinterSeason ? "rgba(100, 116, 139, 0.35)" : "rgba(0, 0, 0, 0.4)";
    ctx.fill();

    // 2. Body transform
    ctx.translate(p.x, p.y + bounceY);
    ctx.rotate(p.angle);
    ctx.scale(stretchX, stretchY);

    // Color definitions
    // Winter coat: Pure snow camouflage with cool slate shading
    // Summer coat: Russet agouti brown dorsum with tawny ochre flanks & white underside
    const bodyColor = isWinterSeason ? "#ffffff" : "#92400e";
    const flankColor = isWinterSeason ? "#f1f5f9" : "#b45309";
    const bellyColor = isWinterSeason ? "#e2e8f0" : "#fef3c7";
    const eyeColor = isWinterSeason ? "#09090b" : "#451a03";

    // 3. Signature Oversized Furry Hind "Snowshoe" Paws (Splayed back)
    ctx.fillStyle = flankColor;
    // Left hind paw
    ctx.beginPath();
    ctx.ellipse(-9, -6.5, 4.2, 2.2, -0.2, 0, Math.PI * 2);
    ctx.fill();
    // Right hind paw
    ctx.beginPath();
    ctx.ellipse(-9, 6.5, 4.2, 2.2, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 4. White Puffy Scut / Cotton Tail
    ctx.beginPath();
    ctx.arc(-12, 0, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = isWinterSeason ? "#ffffff" : "#fef08a";
    ctx.fill();

    // 5. Muscular Torso & Arched Rump
    ctx.beginPath();
    ctx.ellipse(-2, 0, 10.5, 6.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = bodyColor;
    ctx.fill();

    // Flank overlay contour
    ctx.beginPath();
    ctx.ellipse(-1, 0, 8.5, 4.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = flankColor;
    ctx.fill();

    // 6. Front Forepaws
    ctx.fillStyle = bellyColor;
    ctx.beginPath();
    ctx.ellipse(4, -4.5, 2.8, 1.8, 0.1, 0, Math.PI * 2);
    ctx.ellipse(4, 4.5, 2.8, 1.8, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // 7. Head & Muzzle
    ctx.beginPath();
    ctx.ellipse(9, 0, 5.8, 4.4, 0, 0, Math.PI * 2);
    ctx.fillStyle = bodyColor;
    ctx.fill();

    // Snout / Pink Nose Cleft
    ctx.beginPath();
    ctx.arc(14.5, 0, 1.6, 0, Math.PI * 2);
    ctx.fillStyle = "#f472b6";
    ctx.fill();

    // Twitching Whiskers
    ctx.strokeStyle = isWinterSeason ? "#94a3b8" : "#fde68a";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(13, -1);
    ctx.lineTo(19, -4);
    ctx.moveTo(13, 1);
    ctx.lineTo(19, 4);
    ctx.stroke();

    // Lateral Eyes with Specular Corneal Glint
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(9, -3.2, 1.6, 0, Math.PI * 2);
    ctx.arc(9, 3.2, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(9.4, -3.4, 0.6, 0, Math.PI * 2);
    ctx.arc(9.4, 3.0, 0.6, 0, Math.PI * 2);
    ctx.fill();

    // 8. Signature Long Snowshoe Ears with Solid Black Tips
    // Left ear
    ctx.save();
    ctx.translate(6, -2.5);
    ctx.rotate(p.isFleeing ? -0.4 : -0.25);
    ctx.beginPath();
    ctx.ellipse(-7, -4, 7.5, 2.4, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = bodyColor;
    ctx.fill();
    // Inner ear canal (soft pink)
    ctx.beginPath();
    ctx.ellipse(-6.5, -4, 5.5, 1.4, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(244, 114, 182, 0.55)";
    ctx.fill();
    // Distinct solid jet-black ear tip (key biological diagnostic)
    ctx.beginPath();
    ctx.ellipse(-12.5, -6.5, 2.8, 1.8, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = "#09090b";
    ctx.fill();
    ctx.restore();

    // Right ear
    ctx.save();
    ctx.translate(6, 2.5);
    ctx.rotate(p.isFleeing ? 0.4 : 0.25);
    ctx.beginPath();
    ctx.ellipse(-7, 4, 7.5, 2.4, 0.4, 0, Math.PI * 2);
    ctx.fillStyle = bodyColor;
    ctx.fill();
    // Inner ear canal
    ctx.beginPath();
    ctx.ellipse(-6.5, 4, 5.5, 1.4, 0.4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(244, 114, 182, 0.55)";
    ctx.fill();
    // Distinct solid jet-black ear tip
    ctx.beginPath();
    ctx.ellipse(-12.5, 6.5, 2.8, 1.8, 0.4, 0, Math.PI * 2);
    ctx.fillStyle = "#09090b";
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  // --- Anatomical Canada Lynx (Lynx canadensis) Vector Rendering ---
  function drawCanadaLynx(ctx, pred) {
    ctx.save();

    // Stalking gait lateral shoulder swaying and leg strides
    const stride = Math.sin(pred.walkPhase) * (pred.isChasing ? 4.5 : 2.5);
    const shoulderSway = Math.cos(pred.walkPhase) * 1.2;

    // 1. Cast shadow
    ctx.beginPath();
    ctx.ellipse(pred.x, pred.y + 5, 14, 6.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = isWinterSeason ? "rgba(71, 85, 105, 0.38)" : "rgba(0, 0, 0, 0.45)";
    ctx.fill();

    // 2. Body transform
    ctx.translate(pred.x, pred.y);
    ctx.rotate(pred.angle);

    // Color definitions
    // Canada Lynx dense silvery-grey with buff/tawny undertone
    const lynxBase = "#a8a29e"; // silvery grey
    const lynxFlank = "#d6d3d1"; // soft buff
    const lynxDorsal = "#78716c"; // darker spine
    const lynxWhite = "#f8fafc";

    // 3. Signature Short Bobbed Tail with ALL-AROUND SOLID JET-BLACK TIP
    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.lineTo(-24, 0);
    ctx.lineWidth = 4.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = lynxBase;
    ctx.stroke();

    // Tail solid jet-black tip (textbook hallmark separating lynx from bobcat)
    ctx.beginPath();
    ctx.moveTo(-21, 0);
    ctx.lineTo(-25, 0);
    ctx.lineWidth = 4.8;
    ctx.strokeStyle = "#000000";
    ctx.stroke();

    // 4. Large Heavily Furred Stealth Snow-Paws
    ctx.fillStyle = lynxFlank;
    // Rear left paw
    ctx.beginPath();
    ctx.ellipse(-11, -9 + stride, 4.5, 3.5, -0.1, 0, Math.PI * 2);
    ctx.fill();
    // Rear right paw
    ctx.beginPath();
    ctx.ellipse(-11, 9 - stride, 4.5, 3.5, 0.1, 0, Math.PI * 2);
    ctx.fill();
    // Front left paw
    ctx.beginPath();
    ctx.ellipse(7, -8 - stride, 4.6, 3.6, 0.1, 0, Math.PI * 2);
    ctx.fill();
    // Front right paw
    ctx.beginPath();
    ctx.ellipse(7, 8 + stride, 4.6, 3.6, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // 5. Muscular Torso (Elevated Pelvis & Deep Chest)
    // Hindquarters
    ctx.beginPath();
    ctx.ellipse(-6, 0, 11, 7.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = lynxBase;
    ctx.fill();

    // Forequarters / Shoulders (slight sway)
    ctx.beginPath();
    ctx.ellipse(4, shoulderSway, 9.5, 6.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = lynxDorsal;
    ctx.fill();

    // Throat & Chest White Bib
    ctx.beginPath();
    ctx.ellipse(6, 0, 5.5, 4.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = lynxWhite;
    ctx.fill();

    // 6. Broad Feline Skull & Signature Flared Facial Cheek Ruffs (Beard)
    ctx.beginPath();
    ctx.arc(13, 0, 7.2, 0, Math.PI * 2);
    ctx.fillStyle = lynxBase;
    ctx.fill();

    // Flared Triangular Facial Ruffs (Beard on both sides of face)
    ctx.fillStyle = lynxWhite;
    // Left ruff
    ctx.beginPath();
    ctx.moveTo(11, -5);
    ctx.lineTo(13, -12);
    ctx.lineTo(16, -6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#57534e";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Right ruff
    ctx.beginPath();
    ctx.moveTo(11, 5);
    ctx.lineTo(13, 12);
    ctx.lineTo(16, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Muzzle & Whiskers
    ctx.beginPath();
    ctx.ellipse(17, 0, 3.2, 2.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = lynxWhite;
    ctx.fill();

    // Dark nose leather
    ctx.beginPath();
    ctx.arc(19.2, 0, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = "#1c1917";
    ctx.fill();

    // White whiskers
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(17, -1);
    ctx.lineTo(24, -4);
    ctx.moveTo(17, 1);
    ctx.lineTo(24, 4);
    ctx.stroke();

    // Piercing Golden Amber Predator Eyes with Vertical Slits
    ctx.fillStyle = "#f59e0b"; // amber iris
    ctx.beginPath();
    ctx.ellipse(14.5, -3.2, 1.8, 1.4, 0, 0, Math.PI * 2);
    ctx.ellipse(14.5, 3.2, 1.8, 1.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Vertical slit pupils
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.ellipse(14.5, -3.2, 0.6, 1.3, 0, 0, Math.PI * 2);
    ctx.ellipse(14.5, 3.2, 0.6, 1.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // White corneal specular glints
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(14.8, -3.5, 0.5, 0, Math.PI * 2);
    ctx.arc(14.8, 2.9, 0.5, 0, Math.PI * 2);
    ctx.fill();

    // 7. Signature Pointed Ears with Long Black Tassels / Tufts
    // Left ear
    ctx.save();
    ctx.translate(11, -6);
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.lineTo(3, -5);
    ctx.lineTo(4, 2);
    ctx.closePath();
    ctx.fillStyle = lynxBase;
    ctx.fill();
    // White spot (ocelli) on back of ear
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(1, -2, 1.2, 0, Math.PI * 2);
    ctx.fill();
    // Signature long black feather plume / ear tassel (7px tall)
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(3, -5);
    ctx.lineTo(5, -12);
    ctx.stroke();
    ctx.restore();

    // Right ear
    ctx.save();
    ctx.translate(11, 6);
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.lineTo(3, 5);
    ctx.lineTo(4, -2);
    ctx.closePath();
    ctx.fillStyle = lynxBase;
    ctx.fill();
    // White spot on back of ear
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(1, 2, 1.2, 0, Math.PI * 2);
    ctx.fill();
    // Signature long black plume / ear tassel
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(3, 5);
    ctx.lineTo(5, 12);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  // --- Predator-Prey Vector Steering & Behavior Simulation ---
  function updateVisualAgents() {
    let fleeingCount = 0;
    let chasingCount = 0;

    // 1. Update Prey (Snowshoe Hares)
    visualPrey.forEach((p, idx) => {
      // Find nearest predator
      let nearestPred = null;
      let minPredDist = 9999;
      visualPredators.forEach(pred => {
        const dx = pred.x - p.x;
        const dy = pred.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < minPredDist) {
          minPredDist = dist;
          nearestPred = pred;
        }
      });

      let targetVx = p.vx;
      let targetVy = p.vy;

      // Evasion behavior: if predator is within 95px, hare panics and flees!
      if (nearestPred && minPredDist < 95) {
        p.isFleeing = true;
        fleeingCount++;
        // Direct flee angle away from predator
        let fleeAngle = Math.atan2(p.y - nearestPred.y, p.x - nearestPred.x);
        // Signature lagomorph evasive zig-zag burst!
        fleeAngle += Math.sin(simTime * 12 + idx * 2) * 0.65;
        const fleeSpeed = 2.8 + (idx % 3) * 0.3;
        targetVx = Math.cos(fleeAngle) * fleeSpeed;
        targetVy = Math.sin(fleeAngle) * fleeSpeed;
        p.hopPhase += 0.38; // rapid hopping
      } else {
        p.isFleeing = false;
        // Check for nearest interactive forage cluster
        let targetForage = null;
        let minForageDist = 140;
        forageClusters.forEach(fc => {
          if (fc.food > 0) {
            const d = Math.hypot(fc.x - p.x, fc.y - p.y);
            if (d < minForageDist) {
              minForageDist = d;
              targetForage = fc;
            }
          }
        });

        if (targetForage) {
          if (minForageDist > 12) {
            // Hop towards food
            const toFoodAngle = Math.atan2(targetForage.y - p.y, targetForage.x - p.x);
            targetVx = Math.cos(toFoodAngle) * 1.3;
            targetVy = Math.sin(toFoodAngle) * 1.3;
            p.hopPhase += 0.16;
          } else {
            // Nibble food!
            targetVx *= 0.5;
            targetVy *= 0.5;
            p.hopPhase += 0.08;
            if (Math.random() < 0.04) {
              targetForage.food -= 1;
              // Tiny nibble particle
              capturePuffs.push({
                x: p.x + 8,
                y: p.y,
                vx: (Math.random() - 0.5) * 0.8,
                vy: -Math.random() * 0.8,
                r: 1.5,
                alpha: 0.9,
                color: "#86efac"
              });
            }
          }
        } else {
          // Normal grazing wander
          if (p.pauseTimer > 0) {
            p.pauseTimer--;
            targetVx *= 0.8;
            targetVy *= 0.8;
          } else {
            if (Math.random() < 0.02) p.pauseTimer = 20 + Math.random() * 30;
            const grazeSpeed = 0.9 + (idx % 4) * 0.15;
            if (Math.random() < 0.03) {
              p.angle += (Math.random() - 0.5) * 0.9;
            }
            targetVx = Math.cos(p.angle) * grazeSpeed;
            targetVy = Math.sin(p.angle) * grazeSpeed;
            p.hopPhase += 0.14;
          }
        }
      }

      // Soft boundary repulsion
      const pad = 38;
      if (p.x < pad) targetVx += (pad - p.x) * 0.12;
      if (p.x > canvas.width - pad) targetVx -= (p.x - (canvas.width - pad)) * 0.12;
      if (p.y < pad + 20) targetVy += ((pad + 20) - p.y) * 0.12;
      if (p.y > canvas.height - pad) targetVy -= (p.y - (canvas.height - pad)) * 0.12;

      // Obstacle avoidance (boulders)
      BOULDERS.forEach(b => {
        const d = Math.hypot(p.x - b.x, p.y - b.y);
        if (d < b.rx + 10) {
          const pushAngle = Math.atan2(p.y - b.y, p.x - b.x);
          targetVx += Math.cos(pushAngle) * 0.4;
          targetVy += Math.sin(pushAngle) * 0.4;
        }
      });

      // Smooth velocity blend
      p.vx += (targetVx - p.vx) * 0.15;
      p.vy += (targetVy - p.vy) * 0.15;

      p.x += p.vx;
      p.y += p.vy;

      // Keep within canvas
      p.x = Math.max(25, Math.min(canvas.width - 25, p.x));
      p.y = Math.max(45, Math.min(canvas.height - 25, p.y));

      p.angle = Math.atan2(p.vy, p.vx);
    });

    // 2. Update Predators (Canada Lynxes)
    visualPredators.forEach((pred, idx) => {
      if (pred.satiatedTimer > 0) {
        // Post-capture resting & grooming
        pred.satiatedTimer--;
        pred.vx *= 0.85;
        pred.vy *= 0.85;
        pred.x += pred.vx;
        pred.y += pred.vy;
        pred.walkPhase += 0.04;
        return;
      }

      // Find nearest prey
      let nearestHare = null;
      let minHareDist = 9999;
      visualPrey.forEach(hare => {
        const d = Math.hypot(hare.x - pred.x, hare.y - pred.y);
        if (d < minHareDist) {
          minHareDist = d;
          nearestHare = hare;
        }
      });

      let targetVx = pred.vx;
      let targetVy = pred.vy;

      // Hunting AI: stalk and pounce!
      if (nearestHare && minHareDist < 145) {
        const huntAngle = Math.atan2(nearestHare.y - pred.y, nearestHare.x - pred.x);

        if (minHareDist > 65) {
          // Stalking prowl: low stealth speed, aligned trajectory
          pred.isChasing = false;
          const stalkSpeed = 1.4;
          targetVx = Math.cos(huntAngle) * stalkSpeed;
          targetVy = Math.sin(huntAngle) * stalkSpeed;
          pred.walkPhase += 0.14;
        } else {
          // Explosive pounce sprint!
          pred.isChasing = true;
          chasingCount++;
          const pounceSpeed = 3.1 + (idx % 3) * 0.3;
          targetVx = Math.cos(huntAngle) * pounceSpeed;
          targetVy = Math.sin(huntAngle) * pounceSpeed;
          pred.walkPhase += 0.35;

          // Ambush capture!
          if (minHareDist < 14) {
            // Trigger capture particle burst
            for (let k = 0; k < 10; k++) {
              const ang = Math.random() * Math.PI * 2;
              const spd = 0.8 + Math.random() * 2.2;
              capturePuffs.push({
                x: nearestHare.x,
                y: nearestHare.y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                r: 2.0 + Math.random() * 2.5,
                alpha: 1.0,
                color: isWinterSeason ? "#ffffff" : "#fef08a"
              });
            }
            // Reposition captured hare to arena outskirts (simulating mortality & immigration)
            nearestHare.x = Math.random() < 0.5 ? 40 : canvas.width - 40;
            nearestHare.y = 60 + Math.random() * (canvas.height - 120);
            nearestHare.hopPhase = 0;
            nearestHare.isFleeing = false;

            // Lynx pauses to feed
            pred.satiatedTimer = 35;
            pred.isChasing = false;
          }
        }
      } else {
        // Leisurely stealth patrol
        pred.isChasing = false;
        const patrolSpeed = 1.1 + (idx % 3) * 0.15;
        if (Math.random() < 0.02) {
          pred.angle += (Math.random() - 0.5) * 0.8;
        }
        targetVx = Math.cos(pred.angle) * patrolSpeed;
        targetVy = Math.sin(pred.angle) * patrolSpeed;
        pred.walkPhase += 0.12;
      }

      // Soft boundary repulsion
      const pad = 42;
      if (pred.x < pad) targetVx += (pad - pred.x) * 0.12;
      if (pred.x > canvas.width - pad) targetVx -= (pred.x - (canvas.width - pad)) * 0.12;
      if (pred.y < pad + 20) targetVy += ((pad + 20) - pred.y) * 0.12;
      if (pred.y > canvas.height - pad) targetVy -= (pred.y - (canvas.height - pad)) * 0.12;

      // Obstacle avoidance
      BOULDERS.forEach(b => {
        const d = Math.hypot(pred.x - b.x, pred.y - b.y);
        if (d < b.rx + 12) {
          const pushAngle = Math.atan2(pred.y - b.y, pred.x - b.x);
          targetVx += Math.cos(pushAngle) * 0.45;
          targetVy += Math.sin(pushAngle) * 0.45;
        }
      });

      // Smooth blend
      pred.vx += (targetVx - pred.vx) * 0.14;
      pred.vy += (targetVy - pred.vy) * 0.14;

      pred.x += pred.vx;
      pred.y += pred.vy;

      pred.x = Math.max(25, Math.min(canvas.width - 25, pred.x));
      pred.y = Math.max(45, Math.min(canvas.height - 25, pred.y));

      pred.angle = Math.atan2(pred.vy, pred.vx);
    });

    // 3. Update Atmospheric Canopy Mist
    fogMist.forEach(m => {
      m.x += m.vx;
      if (m.x - m.r > canvas.width) {
        m.x = -m.r;
        m.y = Math.random() * canvas.height;
      }
    });

    // 4. Update Capture Puffs
    for (let i = capturePuffs.length - 1; i >= 0; i--) {
      const puff = capturePuffs[i];
      puff.x += puff.vx;
      puff.y += puff.vy;
      puff.vx *= 0.92;
      puff.vy *= 0.92;
      puff.alpha -= 0.035;
      if (puff.alpha <= 0) {
        capturePuffs.splice(i, 1);
      }
    }

    // 5. Update Real-Time Behavioral HUD Status
    const preyStatus = container.querySelector("#hud-eco-prey-status");
    const predStatus = container.querySelector("#hud-eco-pred-status");
    if (preyStatus) {
      if (fleeingCount > 0) {
        preyStatus.innerText = "⚡ Evasive Zig-Zag Sprints";
        preyStatus.style.color = "#f43f5e";
      } else {
        preyStatus.innerText = isWinterSeason ? "❄️ Browsing Subnivean Twigs" : "🌿 Browsing Boreal Willow & Pine";
        preyStatus.style.color = "#a7f3d0";
      }
    }
    if (predStatus) {
      if (chasingCount > 0) {
        predStatus.innerText = "🐾 Ambush Sprint & Pounce";
        predStatus.style.color = "#f59e0b";
      } else {
        predStatus.innerText = "🌲 Boreal Stealth Patrol";
        predStatus.style.color = "#fde68a";
      }
    }
  }

  function drawEcosystemArena() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Biome Terrain (Ground, Snowpack, Creek, Boulders, Shrubs, Forage)
    drawTerrain();

    // 2. Physics & AI Updates
    updateVisualAgents();

    // 3. Draw Snowshoe Hares (Understory layer)
    visualPrey.forEach(p => drawSnowshoeHare(ctx, p));

    // 4. Draw Canada Lynxes (Predator layer)
    visualPredators.forEach(pred => drawCanadaLynx(ctx, pred));

    // 5. Draw Capture / Ambush Dust Puffs
    capturePuffs.forEach(puff => {
      ctx.beginPath();
      ctx.arc(puff.x, puff.y, puff.r, 0, Math.PI * 2);
      ctx.fillStyle = puff.color;
      ctx.globalAlpha = Math.max(0, puff.alpha);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });

    // 6. Draw Conifer Trees (Canopy layer with cast shadows)
    drawTrees();

    // 7. Atmospheric Canopy Mist (Foreground ambient depth)
    fogMist.forEach(m => {
      const mistGrad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r);
      const mistColor = isWinterSeason ? "255, 255, 255" : "186, 230, 253";
      mistGrad.addColorStop(0, `rgba(${mistColor}, ${m.alpha})`);
      mistGrad.addColorStop(1, `rgba(${mistColor}, 0)`);
      ctx.fillStyle = mistGrad;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
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

    const ecoPhotoOverlay = container.querySelector("#eco-photo-overlay");
    const isPhotoOverlay = ecoPhotoOverlay && ecoPhotoOverlay.style.display === "block";

    if (!isPhotoOverlay) {
      if (!isPaused) {
        if (!now || now - lastFrameTime >= interval) {
          lastFrameTime = now || performance.now();
          stepEcosystem();
          drawEcosystemArena();
          drawTimeSeriesChart();
        }
      } else if (needsRedraw) {
        drawEcosystemArena();
        drawTimeSeriesChart();
        needsRedraw = false;
      }
    }

    animId = requestAnimationFrame(loop);
  }

  // Event Listeners
  container.querySelector("#btn-eco-pause")?.addEventListener("click", () => {
    isPaused = !isPaused;
    const btn = container.querySelector("#btn-eco-pause");
    if (btn) btn.innerText = isPaused ? "▶ Resume" : "⏸ Pause";
    needsRedraw = true;
    SoundFX.playClick();
  });

  container.querySelector("#btn-eco-shock")?.addEventListener("click", () => {
    carryingCapacityK = Math.max(100, Math.round(carryingCapacityK * 0.5));
    preyPop = Math.max(10, preyPop * 0.5);
    container.querySelector("#slider-eco-k").value = carryingCapacityK;
    container.querySelector("#lbl-eco-k").innerText = carryingCapacityK;
    needsRedraw = true;
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
    needsRedraw = true;
    SoundFX.playClick();
  });

  container.querySelector("#slider-eco-alpha")?.addEventListener("input", (e) => {
    alphaPreyBirth = parseFloat(e.target.value);
    container.querySelector("#lbl-eco-alpha").innerText = alphaPreyBirth.toFixed(2);
    needsRedraw = true;
  });

  container.querySelector("#slider-eco-beta")?.addEventListener("input", (e) => {
    betaPredation = parseFloat(e.target.value);
    container.querySelector("#lbl-eco-beta").innerText = betaPredation.toFixed(3);
    needsRedraw = true;
  });

  container.querySelector("#slider-eco-gamma")?.addEventListener("input", (e) => {
    gammaPredDeath = parseFloat(e.target.value);
    container.querySelector("#lbl-eco-gamma").innerText = gammaPredDeath.toFixed(2);
    needsRedraw = true;
  });

  container.querySelector("#slider-eco-k")?.addEventListener("input", (e) => {
    carryingCapacityK = parseInt(e.target.value, 10);
    container.querySelector("#lbl-eco-k").innerText = carryingCapacityK;
    needsRedraw = true;
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

  // Season / Coat Molt Toggle
  const btnEcoSeason = container.querySelector("#btn-eco-season");
  btnEcoSeason?.addEventListener("click", () => {
    isWinterSeason = !isWinterSeason;
    if (btnEcoSeason) {
      btnEcoSeason.innerText = isWinterSeason ? "❄️ Season: Winter Snow" : "🌲 Season: Summer Taiga";
      btnEcoSeason.style.borderColor = isWinterSeason ? "rgba(56, 189, 248, 0.6)" : "rgba(16, 185, 129, 0.6)";
      btnEcoSeason.style.color = isWinterSeason ? "#38bdf8" : "#34d399";
    }
    const biomeTag = container.querySelector("#hud-eco-biome-tag");
    if (biomeTag) {
      biomeTag.innerText = isWinterSeason
        ? "❄️ Subnivean Snowpack (Winter Coat Camouflage)"
        : "🌲 Boreal Taiga (Tap field to scatter forage)";
      biomeTag.style.color = isWinterSeason ? "#38bdf8" : "#34d399";
    }
    needsRedraw = true;
    SoundFX.playClick();
  });

  // Interactive Forage Scatter on Canvas Pointerdown / Click
  canvas?.addEventListener("pointerdown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Drop forage cluster of willow/birch shoots
    forageClusters.push({
      x: clickX,
      y: clickY,
      food: 16,
      maxFood: 16
    });

    SoundFX.playBubblePop();
    needsRedraw = true;
  });

  // 4K Photo View Switcher
  const btnEcoSim = container.querySelector("#view-mode-eco-sim");
  const btnEcoPhoto = container.querySelector("#view-mode-eco-photo");
  const ecoPhotoOverlay = container.querySelector("#eco-photo-overlay");

  btnEcoSim?.addEventListener("click", () => {
    btnEcoSim.classList.add("active");
    btnEcoSim.style.background = "";
    btnEcoPhoto.classList.remove("active");
    btnEcoPhoto.style.background = "transparent";
    if (ecoPhotoOverlay) ecoPhotoOverlay.style.display = "none";
    SoundFX.playClick();
  });

  btnEcoPhoto?.addEventListener("click", () => {
    btnEcoPhoto.classList.add("active");
    btnEcoPhoto.style.background = "";
    btnEcoSim.classList.remove("active");
    btnEcoSim.style.background = "transparent";
    if (ecoPhotoOverlay) ecoPhotoOverlay.style.display = "block";
    SoundFX.playClick();
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
