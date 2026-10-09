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
  const ARENA_W = 580;
  const ARENA_H = 530;

  // Mathematical Parametric River Spline Model
  // Evaluates exact position (x, y), tangent vector (tx, ty), normal vector (nx, ny),
  // and channel width along the dual-segment cubic Bézier stream bed
  function getRiverPoint(u, isWinter = false) {
    let t, p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y;
    const splitU = 390 / ARENA_H;
    if (u <= splitU) {
      t = Math.max(0, Math.min(1, u / splitU));
      p0x = 280; p0y = 0;
      p1x = 325; p1y = 120;
      p2x = 220; p2y = 260;
      p3x = 290; p3y = 390;
    } else {
      t = Math.max(0, Math.min(1, (u - splitU) / (1 - splitU)));
      p0x = 290; p0y = 390;
      p1x = 320; p1y = 440;
      p2x = 250; p2y = 490;
      p3x = 235; p3y = ARENA_H;
    }
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const t2 = t * t;
    const t3 = t2 * t;

    const x = mt3 * p0x + 3 * mt2 * t * p1x + 3 * mt * t2 * p2x + t3 * p3x;
    const y = mt3 * p0y + 3 * mt2 * t * p1y + 3 * mt * t2 * p2y + t3 * p3y;

    const dx = 3 * mt2 * (p1x - p0x) + 6 * mt * t * (p2x - p1x) + 3 * t2 * (p3x - p2x);
    const dy = 3 * mt2 * (p1y - p0y) + 6 * mt * t * (p2y - p1y) + 3 * t2 * (p3y - p2y);
    const len = Math.hypot(dx, dy) || 1;
    const tx = dx / len;
    const ty = dy / len;
    const nx = -ty;
    const ny = tx;

    const baseW = isWinter ? 22 : 30;
    const width = baseW + Math.sin(u * Math.PI * 2.8) * 3.5;
    const angle = Math.atan2(ty, tx);

    return { x, y, tx, ty, nx, ny, width, angle, u };
  }

  const TREES = [
    { x: 55, y: 85, r: 26, layers: 4, type: "spruce" },
    { x: 520, y: 90, r: 28, layers: 4, type: "fir" },
    { x: 70, y: 445, r: 30, layers: 4, type: "spruce" },
    { x: 510, y: 435, r: 27, layers: 4, type: "spruce" },
    { x: 290, y: 60, r: 24, layers: 3, type: "fir" },
    { x: 42, y: 260, r: 25, layers: 4, type: "spruce" },
    { x: 538, y: 268, r: 25, layers: 4, type: "fir" }
  ];

  const BOULDERS = [
    { x: 140, y: 150, rx: 16, ry: 11, rot: 0.35, facets: [[-14, -4], [-8, -10], [6, -9], [15, -2], [12, 8], [-3, 10], [-13, 5]] },
    { x: 420, y: 170, rx: 20, ry: 13, rot: -0.4, facets: [[-17, -5], [-10, -12], [8, -11], [18, -3], [14, 9], [-4, 12], [-16, 6]] },
    { x: 190, y: 395, rx: 17, ry: 12, rot: 0.55, facets: [[-15, -4], [-7, -11], [7, -10], [16, -2], [11, 9], [-5, 11], [-14, 5]] },
    { x: 380, y: 360, rx: 18, ry: 13, rot: 0.15, facets: [[-16, -5], [-9, -11], [8, -10], [17, -3], [13, 9], [-3, 11], [-15, 6]] }
  ];

  // Weathered Fallen Deadfall Logs (Iconic Boreal Forest deadfall)
  const DEADFALL_LOGS = [
    { x1: 105, y1: 305, x2: 175, y2: 328, r: 5.5, moss: true },
    { x1: 390, y1: 235, x2: 460, y2: 218, r: 5.0, moss: true }
  ];

  // Riverbed Submerged Stones (Anchored with mathematical precision to true riverbed)
  const PEBBLE_SPECS = [
    { u: 0.08, offset: -0.22, rx: 4.0, ry: 2.5, rot: 0.4, color: "#64748b" },
    { u: 0.16, offset:  0.26, rx: 5.0, ry: 3.2, rot: -0.3, color: "#475569" },
    { u: 0.25, offset: -0.32, rx: 4.5, ry: 2.8, rot: 0.2, color: "#78716c" },
    { u: 0.35, offset:  0.18, rx: 5.5, ry: 3.5, rot: 0.6, color: "#57534e" },
    { u: 0.44, offset: -0.20, rx: 4.0, ry: 2.6, rot: -0.5, color: "#64748b" },
    { u: 0.53, offset:  0.28, rx: 5.0, ry: 3.0, rot: 0.1, color: "#475569" },
    { u: 0.62, offset: -0.16, rx: 4.5, ry: 2.7, rot: -0.2, color: "#78716c" },
    { u: 0.71, offset:  0.22, rx: 6.0, ry: 3.8, rot: 0.4, color: "#57534e" },
    { u: 0.80, offset: -0.28, rx: 4.5, ry: 2.8, rot: -0.4, color: "#64748b" },
    { u: 0.88, offset:  0.19, rx: 5.0, ry: 3.2, rot: 0.3, color: "#475569" },
    { u: 0.95, offset: -0.12, rx: 4.5, ry: 2.6, rot: -0.2, color: "#78716c" }
  ];

  // Naturally Scattered Fallen Pine Straw / Needles (Organic Jitter, Zero Grid)
  const PINE_NEEDLES = [];
  for (let i = 0; i < 90; i++) {
    const seedX = (i * 137.5) % 550 + 15;
    const seedY = (i * 224.7) % 490 + 25;
    const len = 5.0 + (i % 5) * 1.0;
    const angle = ((i * 47) % 360) * (Math.PI / 180);
    PINE_NEEDLES.push({
      x: seedX,
      y: seedY,
      len: len,
      angle: angle,
      color: i % 3 === 0 ? "rgba(180, 83, 9, 0.45)" : (i % 3 === 1 ? "rgba(146, 64, 14, 0.40)" : "rgba(120, 53, 15, 0.32)")
    });
  }

  const SHRUBS = [];
  for (let i = 0; i < 22; i++) {
    SHRUBS.push({
      x: 70 + (i * 73) % 440,
      y: 90 + (i * 59) % 360,
      r: 7 + (i % 3) * 2.2,
      berries: i % 2 === 0
    });
  }

  // Atmospheric fog canopy mist
  const fogMist = [];
  for (let i = 0; i < 14; i++) {
    fogMist.push({
      x: Math.random() * 580,
      y: Math.random() * 530,
      r: 55 + Math.random() * 50,
      vx: 0.12 + Math.random() * 0.22,
      alpha: 0.04 + Math.random() * 0.04
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

  const CHART_W = 460;
  const CHART_H = 180;

  function initHiDPI() {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
    canvas.width = Math.round(ARENA_W * dpr);
    canvas.height = Math.round(ARENA_H * dpr);
    chartCanvas.width = Math.round(CHART_W * dpr);
    chartCanvas.height = Math.round(CHART_H * dpr);
  }
  initHiDPI();

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
      const bgGrad = ctx.createRadialGradient(ARENA_W / 2, ARENA_H / 2, 40, ARENA_W / 2, ARENA_H / 2, 380);
      bgGrad.addColorStop(0, "#0b2e1d");
      bgGrad.addColorStop(0.55, "#062215");
      bgGrad.addColorStop(1, "#02150d");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, ARENA_W, ARENA_H);

      // Layered organic moss carpets (rich hummocks of cushion moss)
      const mossMounds = [
        { x: 175, y: 155, rx: 110, ry: 70, rot: 0.35, color: "rgba(45, 106, 79, 0.45)" },
        { x: 175, y: 155, rx: 80, ry: 48, rot: 0.35, color: "rgba(64, 145, 108, 0.35)" },
        { x: 420, y: 375, rx: 130, ry: 80, rot: -0.28, color: "rgba(45, 106, 79, 0.42)" },
        { x: 420, y: 375, rx: 95, ry: 55, rot: -0.28, color: "rgba(82, 183, 136, 0.30)" },
        { x: 365, y: 135, rx: 85, ry: 52, rot: 0.18, color: "rgba(45, 106, 79, 0.40)" },
        { x: 135, y: 415, rx: 90, ry: 58, rot: -0.22, color: "rgba(45, 106, 79, 0.38)" }
      ];
      mossMounds.forEach(m => {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(m.x, m.y, m.rx, m.ry, m.rot, 0, Math.PI * 2);
        ctx.fillStyle = m.color;
        ctx.fill();
        ctx.restore();
      });

      // Naturally scattered pine needles / spruce straw (natural forest detritus, organic non-repeating)
      PINE_NEEDLES.forEach(n => {
        ctx.save();
        ctx.strokeStyle = n.color;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(n.x + Math.cos(n.angle) * n.len, n.y + Math.sin(n.angle) * n.len);
        ctx.stroke();
        ctx.restore();
      });

      // Weathered Deadfall Birch & Spruce Logs with bark and moss
      DEADFALL_LOGS.forEach(log => {
        ctx.save();
        const dx = log.x2 - log.x1;
        const dy = log.y2 - log.y1;
        const len = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);

        ctx.translate(log.x1, log.y1);
        ctx.rotate(angle);

        // Cast shadow beneath log
        ctx.fillStyle = "rgba(0, 0, 0, 0.42)";
        ctx.beginPath();
        ctx.ellipse(len / 2 + 2, log.r + 3, len / 2 + 3, log.r * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Log timber cylinder body
        ctx.fillStyle = "#3e2723";
        ctx.fillRect(0, -log.r, len, log.r * 2);

        // Dark bark fissures and grain
        ctx.strokeStyle = "#1b100c";
        ctx.lineWidth = 0.9;
        for (let g = 8; g < len - 6; g += 14) {
          ctx.beginPath();
          ctx.moveTo(g, -log.r + 1);
          ctx.lineTo(g + 4, log.r - 1);
          ctx.stroke();
        }

        // Exposed wood grain / stump end rings
        ctx.beginPath();
        ctx.ellipse(0, 0, 2.5, log.r, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#8d6e63";
        ctx.fill();
        ctx.strokeStyle = "#5d4037";
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Velvet green moss on upper log ridge
        if (log.moss) {
          ctx.fillStyle = "rgba(34, 197, 94, 0.75)";
          ctx.beginPath();
          ctx.ellipse(len * 0.45, -log.r + 0.5, len * 0.38, 2.2, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });
    } else {
      // Winter Boreal Snowpack: crisp windswept subnivean snow
      const snowGrad = ctx.createRadialGradient(ARENA_W / 2, ARENA_H / 2, 40, ARENA_W / 2, ARENA_H / 2, 400);
      snowGrad.addColorStop(0, "#f8fafc");
      snowGrad.addColorStop(0.55, "#e2e8f0");
      snowGrad.addColorStop(1, "#cbd5e1");
      ctx.fillStyle = snowGrad;
      ctx.fillRect(0, 0, ARENA_W, ARENA_H);

      // Cold ambient periwinkle/glacial blue snow drifts & subtle subnivean hollows
      const drifts = [
        { x: 170, y: 150, rx: 120, ry: 72, rot: 0.35, color: "rgba(147, 197, 253, 0.28)" },
        { x: 420, y: 360, rx: 140, ry: 85, rot: -0.30, color: "rgba(147, 197, 253, 0.25)" },
        { x: 350, y: 130, rx: 95, ry: 55, rot: 0.12, color: "rgba(191, 219, 254, 0.22)" },
        { x: 150, y: 420, rx: 100, ry: 64, rot: -0.25, color: "rgba(147, 197, 253, 0.24)" }
      ];
      drifts.forEach(d => {
        ctx.beginPath();
        ctx.ellipse(d.x, d.y, d.rx, d.ry, d.rot, 0, Math.PI * 2);
        ctx.fillStyle = d.color;
        ctx.fill();
      });

      // Windswept snow ridges / sastrugi
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 1.6;
      for (let i = 0; i < 7; i++) {
        const ry = 70 + i * 65;
        ctx.beginPath();
        ctx.moveTo(30, ry);
        ctx.bezierCurveTo(180, ry - 12, 380, ry + 16, 550, ry - 6);
        ctx.stroke();
      }

      // Snow-covered deadfall logs
      DEADFALL_LOGS.forEach(log => {
        ctx.save();
        const dx = log.x2 - log.x1;
        const dy = log.y2 - log.y1;
        const len = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);

        ctx.translate(log.x1, log.y1);
        ctx.rotate(angle);

        // Soft snow shadow beneath log
        ctx.fillStyle = "rgba(71, 85, 105, 0.30)";
        ctx.beginPath();
        ctx.ellipse(len / 2 + 2, log.r + 3, len / 2 + 2, log.r * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dark log edge peek
        ctx.fillStyle = "#334155";
        ctx.fillRect(0, -log.r * 0.5, len, log.r * 1.2);

        // Heavy blanket of pure white snow
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(len / 2, -log.r - 0.5, len * 0.52, log.r * 1.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    // 2. Meandering Boreal Meltwater Creek / Stream (Photorealistic Multi-Tier River Physics)
    ctx.save();

    // A. Wet Silt Gravel Riverbed / Shoreline
    ctx.beginPath();
    ctx.moveTo(280, 0);
    ctx.bezierCurveTo(325, 120, 220, 260, 290, 390);
    ctx.bezierCurveTo(320, 440, 250, 490, 235, ARENA_H);
    ctx.lineWidth = isWinterSeason ? 28 : 38;
    ctx.strokeStyle = isWinterSeason ? "rgba(71, 85, 105, 0.45)" : "rgba(30, 41, 59, 0.48)";
    ctx.stroke();

    // B. Clear Mountain Meltwater River Bed Channel
    ctx.beginPath();
    ctx.moveTo(280, 0);
    ctx.bezierCurveTo(325, 120, 220, 260, 290, 390);
    ctx.bezierCurveTo(320, 440, 250, 490, 235, ARENA_H);
    ctx.lineWidth = isWinterSeason ? 20 : 28;
    ctx.strokeStyle = isWinterSeason ? "rgba(14, 165, 233, 0.46)" : "rgba(2, 132, 199, 0.60)";
    ctx.stroke();

    // C. Deep River Thalweg Center Stream (Fast-flowing central channel)
    ctx.beginPath();
    ctx.moveTo(280, 0);
    ctx.bezierCurveTo(325, 120, 220, 260, 290, 390);
    ctx.bezierCurveTo(320, 440, 250, 490, 235, ARENA_H);
    ctx.lineWidth = isWinterSeason ? 11 : 16;
    ctx.strokeStyle = isWinterSeason ? "rgba(3, 105, 161, 0.42)" : "rgba(3, 105, 161, 0.52)";
    ctx.stroke();

    // D. Submerged Riverbed Pebbles (Anchored directly on the stream bed)
    PEBBLE_SPECS.forEach(p => {
      const pt = getRiverPoint(p.u, isWinterSeason);
      const px = pt.x + pt.nx * (p.offset * pt.width * 0.45);
      const py = pt.y + pt.ny * (p.offset * pt.width * 0.45);

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(p.rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.rx, p.ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.58;
      ctx.fill();

      // Subtle water wake behind submerged stone
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(-pt.tx * 2, -pt.ty * 2, Math.max(p.rx, p.ry) + 1.5, pt.angle + Math.PI * 0.65, pt.angle + Math.PI * 1.35);
      ctx.stroke();
      ctx.restore();
    });

    // E. Flowing Laminar Streamlines (Animated Current Ribbons)
    const streamOffsets = [-0.38, -0.12, 0.12, 0.38];
    streamOffsets.forEach(offset => {
      ctx.save();
      ctx.beginPath();
      const speedMult = 1.0 - Math.abs(offset) * 0.35;
      const dashOffset = -(simTime * 36 * speedMult) % 36;
      ctx.setLineDash([12, 24]);
      ctx.lineDashOffset = dashOffset;
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = isWinterSeason ? "rgba(224, 242, 254, 0.40)" : "rgba(186, 230, 253, 0.48)";

      const steps = 30;
      for (let s = 0; s <= steps; s++) {
        const u = s / steps;
        const pt = getRiverPoint(u, isWinterSeason);
        const sx = pt.x + pt.nx * (offset * pt.width * 0.45);
        const sy = pt.y + pt.ny * (offset * pt.width * 0.45);
        if (s === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
      ctx.restore();
    });

    // F. Realistic Curved Wave Crests & Ripples (Mathematically Locked Inside River Water)
    const rippleCount = 14;
    const flowProgress = (simTime * 0.08) % 1.0;
    for (let i = 0; i < rippleCount; i++) {
      const station = (i / rippleCount + flowProgress) % 1.0;
      const pt = getRiverPoint(station, isWinterSeason);

      // Smooth fade at entrance and exit so waves flow seamlessly without popping
      const fade = Math.sin(station * Math.PI);
      if (fade < 0.05) continue;

      const waveHalfW = pt.width * 0.38;
      const bulge = 4.2 * fade;

      // Downstream curved ripple arc along river tangent and normal
      const x1 = pt.x - pt.nx * waveHalfW;
      const y1 = pt.y - pt.ny * waveHalfW;
      const x2 = pt.x + pt.nx * waveHalfW;
      const y2 = pt.y + pt.ny * waveHalfW;
      const cx = pt.x + pt.tx * bulge;
      const cy = pt.y + pt.ty * bulge;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(cx, cy, x2, y2);
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = isWinterSeason 
        ? `rgba(255, 255, 255, ${(0.72 * fade).toFixed(3)})` 
        : `rgba(224, 242, 254, ${(0.80 * fade).toFixed(3)})`;
      ctx.stroke();

      // Echo micro-ripple
      ctx.beginPath();
      ctx.moveTo(x1 - pt.tx * 2.5, y1 - pt.ty * 2.5);
      ctx.quadraticCurveTo(cx - pt.tx * 1.8, cy - pt.ty * 1.8, x2 - pt.tx * 2.5, y2 - pt.ty * 2.5);
      ctx.lineWidth = 1.0;
      ctx.strokeStyle = `rgba(255, 255, 255, ${(0.42 * fade).toFixed(3)})`;
      ctx.stroke();
      ctx.restore();
    }

    // G. Shimmering Surface Caustics Flecks (Sunlight sparkling on moving water)
    for (let c = 1; c <= 8; c++) {
      const u = (c * 0.115 + simTime * 0.04) % 1.0;
      const pt = getRiverPoint(u, isWinterSeason);
      const lateralJitter = Math.sin(c * 3.7 + simTime * 2.2) * 0.30;
      const cx = pt.x + pt.nx * (lateralJitter * pt.width * 0.45);
      const cy = pt.y + pt.ny * (lateralJitter * pt.width * 0.45);
      const sparkle = (Math.sin(simTime * 4.5 + c * 2.1) + 1) * 0.5;

      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 255, ${(0.65 * sparkle * Math.sin(u * Math.PI)).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(cx, cy, 1.3 + sparkle * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // H. Winter semi-frozen ice shelf edges along creek
    if (isWinterSeason) {
      ctx.save();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = "rgba(241, 245, 249, 0.92)";

      // Left Ice Rim
      ctx.beginPath();
      for (let s = 0; s <= 35; s++) {
        const u = s / 35;
        const pt = getRiverPoint(u, true);
        const ix = pt.x - pt.nx * (pt.width * 0.52);
        const iy = pt.y - pt.ny * (pt.width * 0.52);
        if (s === 0) ctx.moveTo(ix, iy);
        else ctx.lineTo(ix, iy);
      }
      ctx.stroke();

      // Right Ice Rim
      ctx.beginPath();
      for (let s = 0; s <= 35; s++) {
        const u = s / 35;
        const pt = getRiverPoint(u, true);
        const ix = pt.x + pt.nx * (pt.width * 0.52);
        const iy = pt.y + pt.ny * (pt.width * 0.52);
        if (s === 0) ctx.moveTo(ix, iy);
        else ctx.lineTo(ix, iy);
      }
      ctx.stroke();

      // Delicate crystalline ice needle fracture lines branching from the banks
      ctx.strokeStyle = "rgba(186, 230, 253, 0.85)";
      ctx.lineWidth = 1.2;
      for (let s = 25; s < ARENA_H - 20; s += 55) {
        const u = s / ARENA_H;
        const pt = getRiverPoint(u, true);
        const leftX = pt.x - pt.nx * (pt.width * 0.52);
        const leftY = pt.y - pt.ny * (pt.width * 0.52);
        const rightX = pt.x + pt.nx * (pt.width * 0.52);
        const rightY = pt.y + pt.ny * (pt.width * 0.52);

        // Branching needles on left ice shelf
        ctx.beginPath();
        ctx.moveTo(leftX, leftY);
        ctx.lineTo(leftX + pt.nx * 6 + pt.tx * 4, leftY + pt.ny * 6 + pt.ty * 4);
        ctx.lineTo(leftX + pt.nx * 10 - pt.tx * 2, leftY + pt.ny * 10 - pt.ty * 2);

        // Branching needles on right ice shelf
        ctx.moveTo(rightX, rightY);
        ctx.lineTo(rightX - pt.nx * 6 + pt.tx * 4, rightY - pt.ny * 6 + pt.ty * 4);
        ctx.lineTo(rightX - pt.nx * 10 - pt.tx * 2, rightY - pt.ny * 10 - pt.ty * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();

    // 3. Glacial Granite Boulders (Chiseled 3D Rock Facets)
    BOULDERS.forEach(b => {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);

      // Directional drop shadow
      ctx.beginPath();
      ctx.ellipse(4, 6, b.rx + 2, b.ry + 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.40)";
      ctx.fill();

      // Chiseled polygon rock base
      ctx.beginPath();
      if (b.facets) {
        ctx.moveTo(b.facets[0][0], b.facets[0][1]);
        for (let fi = 1; fi < b.facets.length; fi++) {
          ctx.lineTo(b.facets[fi][0], b.facets[fi][1]);
        }
        ctx.closePath();
      } else {
        ctx.ellipse(0, 0, b.rx, b.ry, 0, 0, Math.PI * 2);
      }
      ctx.fillStyle = isWinterSeason ? "#334155" : "#1e293b";
      ctx.fill();

      // Top-lit facet highlight
      ctx.beginPath();
      ctx.ellipse(-2, -2.5, b.rx * 0.72, b.ry * 0.65, 0, 0, Math.PI * 2);
      ctx.fillStyle = isWinterSeason ? "#64748b" : "#475569";
      ctx.fill();

      // Lichen cushion or Sculpted Snow Cap
      if (isWinterSeason) {
        ctx.beginPath();
        ctx.ellipse(-1, -4, b.rx * 0.88, b.ry * 0.52, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 1.0;
        ctx.stroke();
      } else {
        // Organic velvet moss crest
        ctx.beginPath();
        ctx.ellipse(-2, -3, b.rx * 0.58, b.ry * 0.42, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(34, 197, 94, 0.78)";
        ctx.fill();
      }
      ctx.restore();
    });

    // 4. Understory Shrubs & Lingonberry Bushes
    SHRUBS.forEach(shrub => {
      ctx.save();
      // Shrub shadow
      ctx.beginPath();
      ctx.ellipse(shrub.x + 2, shrub.y + 3, shrub.r * 0.9, shrub.r * 0.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
      ctx.fill();

      // Branching twigs
      ctx.strokeStyle = isWinterSeason ? "#475569" : "#3f2c20";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(shrub.x, shrub.y + 2);
      ctx.lineTo(shrub.x - 3, shrub.y - 4);
      ctx.moveTo(shrub.x, shrub.y + 2);
      ctx.lineTo(shrub.x + 4, shrub.y - 3);
      ctx.stroke();

      // Shrub leafy foliage or snow rime
      ctx.beginPath();
      ctx.arc(shrub.x, shrub.y - 1, shrub.r, 0, Math.PI * 2);
      ctx.fillStyle = isWinterSeason ? "rgba(148, 163, 184, 0.45)" : "rgba(4, 120, 87, 0.85)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(shrub.x - 2, shrub.y - 3, shrub.r * 0.68, 0, Math.PI * 2);
      ctx.fillStyle = isWinterSeason ? "#f8fafc" : "rgba(16, 185, 129, 0.85)";
      ctx.fill();

      // Wild Boreal Lingonberries / Highbush Berries
      if (shrub.berries) {
        ctx.fillStyle = isWinterSeason ? "#dc2626" : "#ef4444";
        ctx.beginPath();
        ctx.arc(shrub.x - 3, shrub.y - 2, 2.0, 0, Math.PI * 2);
        ctx.arc(shrub.x + 3, shrub.y + 1, 2.0, 0, Math.PI * 2);
        ctx.arc(shrub.x + 1, shrub.y - 5, 1.8, 0, Math.PI * 2);
        ctx.fill();
        // Berry specular shine
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(shrub.x - 3.4, shrub.y - 2.5, 0.6, 0, Math.PI * 2);
        ctx.arc(shrub.x + 2.6, shrub.y + 0.5, 0.6, 0, Math.PI * 2);
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
      ctx.arc(0, 0, 14 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(52, 211, 153, 0.22)";
      ctx.fill();
      ctx.strokeStyle = "#34d399";
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Tender browse twigs and green leaves
      ctx.strokeStyle = "#15803d";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-8, 5);
      ctx.lineTo(0, -7);
      ctx.lineTo(8, 4);
      ctx.moveTo(0, -7);
      ctx.lineTo(0, 8);
      ctx.stroke();

      ctx.fillStyle = "#86efac";
      ctx.beginPath();
      ctx.arc(-5, -2, 3.2, 0, Math.PI * 2);
      ctx.arc(5, -2, 3.2, 0, Math.PI * 2);
      ctx.arc(0, 6, 2.8, 0, Math.PI * 2);
      ctx.fill();

      // Food counter pill
      ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
      ctx.fillRect(-13, -20, 26, 12);
      ctx.fillStyle = "#34d399";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${fc.food}x`, 0, -11);

      ctx.restore();
    }
  }

  // --- Coniferous White Spruce & Balsam Fir Trees (2.5D Canopy Layer) ---
  function drawTrees() {
    TREES.forEach(tree => {
      ctx.save();
      // 2.5D Soft Directional Cast Shadow on ground
      ctx.beginPath();
      ctx.ellipse(tree.x + 16, tree.y + 20, tree.r * 1.15, tree.r * 0.75, 0.32, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.42)";
      ctx.fill();

      // Conifer Needle Tiers (Top-Down 2.5D perspective)
      for (let layer = 0; layer < tree.layers; layer++) {
        const lr = tree.r * (1.0 - layer * 0.23);
        ctx.beginPath();
        // Scalloped conifer boughs
        const pts = 9;
        for (let p = 0; p < pts; p++) {
          const a1 = (p / pts) * Math.PI * 2;
          const a2 = ((p + 0.5) / pts) * Math.PI * 2;
          const rOut = lr;
          const rIn = lr * 0.70;
          if (p === 0) ctx.moveTo(tree.x + Math.cos(a1) * rOut, tree.y + Math.sin(a1) * rOut);
          else ctx.lineTo(tree.x + Math.cos(a1) * rOut, tree.y + Math.sin(a1) * rOut);
          ctx.lineTo(tree.x + Math.cos(a2) * rIn, tree.y + Math.sin(a2) * rIn);
        }
        ctx.closePath();

        if (!isWinterSeason) {
          if (layer === 0) ctx.fillStyle = "#02261b";
          else if (layer === 1) ctx.fillStyle = "#03432b";
          else if (layer === 2) ctx.fillStyle = "#046a44";
          else ctx.fillStyle = "#059669";
        } else {
          if (layer === 0) ctx.fillStyle = "#1e293b";
          else if (layer === 1) ctx.fillStyle = "#334155";
          else if (layer === 2) ctx.fillStyle = "#e2e8f0";
          else ctx.fillStyle = "#ffffff";
        }
        ctx.fill();

        // Snow blankets on upper bough surfaces
        if (isWinterSeason) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
          ctx.lineWidth = 2.4;
          ctx.stroke();
        }
      }

      // Apex crown tip
      ctx.beginPath();
      ctx.arc(tree.x, tree.y, 4.0, 0, Math.PI * 2);
      ctx.fillStyle = isWinterSeason ? "#ffffff" : "#10b981";
      ctx.fill();

      ctx.restore();
    });
  }

  // --- Anatomical Snowshoe Hare (Lepus americanus) Vector Rendering ---
  function drawSnowshoeHare(ctx, p) {
    ctx.save();

    // Saltatorial bounding hop kinematics (stretch & squash)
    const isLeaping = p.isFleeing || Math.abs(p.vx) + Math.abs(p.vy) > 0.4;
    const bounceHeight = isLeaping ? (p.isFleeing ? 7.5 : 4.5) : 1.2;
    const bounceY = -Math.abs(Math.sin(p.hopPhase)) * bounceHeight;
    const stretchX = 1.0 + (p.isFleeing ? 0.24 : 0.14) * Math.cos(p.hopPhase);
    const stretchY = 1.0 - (p.isFleeing ? 0.20 : 0.10) * Math.cos(p.hopPhase);

    // 1. Ground Cast Shadow (contracts & separates at peak leap height)
    const shadowScale = Math.max(0.4, 1.0 - Math.abs(bounceY) / 11);
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 5, 11 * shadowScale, 5.5 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fillStyle = isWinterSeason ? "rgba(71, 85, 105, 0.35)" : "rgba(0, 0, 0, 0.42)";
    ctx.fill();

    // 2. Body transform with leaping elevation and orientation
    ctx.translate(p.x, p.y + bounceY);
    ctx.rotate(p.angle);
    ctx.scale(stretchX, stretchY);

    // Anatomical Coat Coloration (Lepus americanus)
    // Summer: Rich agouti russet brown dorsum, warm tawny flanks, creamy belly
    // Winter: Pure snow camouflage with soft periwinkle/slate undertones
    const coatDorsal = isWinterSeason ? "#ffffff" : "#854d0e"; // agouti russet
    const coatSpine = isWinterSeason ? "#f8fafc" : "#713f12";  // dark spine
    const coatFlank = isWinterSeason ? "#f1f5f9" : "#b45309";  // tawny ochre
    const coatBelly = isWinterSeason ? "#e2e8f0" : "#fef3c7";  // creamy underside
    const pawColor = isWinterSeason ? "#f8fafc" : "#b45309";
    const pawPad = isWinterSeason ? "#cbd5e1" : "#78350f";

    // 3. Signature Oversized "Snowshoe" Hind Feet (diagnostic hallmark)
    // Splayed backward during hop propulsion
    ctx.fillStyle = pawColor;
    ctx.strokeStyle = pawPad;
    ctx.lineWidth = 0.8;
    // Left hind snowshoe paw
    ctx.beginPath();
    ctx.ellipse(-11, -7.5, 5.5, 2.8, -0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Right hind snowshoe paw
    ctx.beginPath();
    ctx.ellipse(-11, 7.5, 5.5, 2.8, 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Toe pad cleft lines on hind snowshoes
    ctx.strokeStyle = pawPad;
    ctx.beginPath();
    ctx.moveTo(-13, -8); ctx.lineTo(-10, -8);
    ctx.moveTo(-13, 8);  ctx.lineTo(-10, 8);
    ctx.stroke();

    // 4. White Fluffy Cotton Scut / Tail
    ctx.beginPath();
    ctx.arc(-14, 0, 3.8, 0, Math.PI * 2);
    ctx.fillStyle = isWinterSeason ? "#ffffff" : "#fef9c3";
    ctx.fill();
    ctx.fillStyle = isWinterSeason ? "rgba(148, 163, 184, 0.4)" : "rgba(180, 83, 9, 0.3)";
    ctx.beginPath();
    ctx.arc(-14.5, 0.5, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // 5. Muscular Arched Pelvis & Haunches
    ctx.beginPath();
    ctx.ellipse(-3, 0, 12, 7.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = coatDorsal;
    ctx.fill();

    // Dorsal spine shading
    ctx.beginPath();
    ctx.ellipse(-4, 0, 10, 4.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = coatSpine;
    ctx.fill();

    // Flank contour gradient layer
    ctx.beginPath();
    ctx.ellipse(-1, 0, 9.5, 5.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = coatFlank;
    ctx.fill();

    // 6. Forepaws (tucked neatly under chest during leap)
    ctx.fillStyle = coatBelly;
    ctx.beginPath();
    ctx.ellipse(5, -5.2, 3.4, 2.1, 0.15, 0, Math.PI * 2);
    ctx.ellipse(5, 5.2, 3.4, 2.1, -0.15, 0, Math.PI * 2);
    ctx.fill();

    // 7. Head & Lagomorph Muzzle
    ctx.beginPath();
    ctx.ellipse(11, 0, 6.8, 5.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = coatDorsal;
    ctx.fill();

    // Snout / Cleft Philtrum & Pink Nose
    ctx.beginPath();
    ctx.ellipse(16.5, 0, 2.8, 2.4, 0, 0, Math.PI * 2);
    ctx.fillStyle = coatBelly;
    ctx.fill();

    // Delicate pink nose cleft
    ctx.beginPath();
    ctx.arc(17.8, 0, 1.4, 0, Math.PI * 2);
    ctx.fillStyle = "#f472b6";
    ctx.fill();

    // Fine twitching sensory whiskers
    ctx.strokeStyle = isWinterSeason ? "#94a3b8" : "#fef08a";
    ctx.lineWidth = 0.7;
    const whiskerWiggle = Math.sin(simTime * 18 + p.x) * 1.2;
    ctx.beginPath();
    ctx.moveTo(16, -1); ctx.lineTo(24, -4.5 + whiskerWiggle);
    ctx.moveTo(16, 0);  ctx.lineTo(25, 0);
    ctx.moveTo(16, 1);  ctx.lineTo(24, 4.5 - whiskerWiggle);
    ctx.stroke();

    // Lateral Eyes with Amber Rim, Deep Pupil & Specular Catchlight
    // Left eye
    ctx.fillStyle = "#78350f"; // warm amber outer iris
    ctx.beginPath();
    ctx.arc(11, -3.8, 2.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#09090b"; // deep pupil
    ctx.beginPath();
    ctx.arc(11, -3.8, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff"; // corneal catchlight
    ctx.beginPath();
    ctx.arc(11.5, -4.1, 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Right eye
    ctx.fillStyle = "#78350f";
    ctx.beginPath();
    ctx.arc(11, 3.8, 2.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#09090b";
    ctx.beginPath();
    ctx.arc(11, 3.8, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(11.5, 3.5, 0.7, 0, Math.PI * 2);
    ctx.fill();

    // 8. Long Upright Ears with Solid Jet-Black Tips (KEY BIOLOGICAL DIAGNOSTIC)
    const earTilt = p.isFleeing ? -0.45 : -0.25;
    // Left Ear
    ctx.save();
    ctx.translate(7.5, -3.0);
    ctx.rotate(earTilt);
    ctx.beginPath();
    ctx.ellipse(-8, -4.5, 9.0, 2.8, -0.38, 0, Math.PI * 2);
    ctx.fillStyle = coatDorsal;
    ctx.fill();
    // Inner pink ear fold
    ctx.beginPath();
    ctx.ellipse(-7.5, -4.5, 6.8, 1.6, -0.38, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(244, 114, 182, 0.58)";
    ctx.fill();
    // Solid Jet-Black Ear Tip (hallmark of Lepus americanus)
    ctx.beginPath();
    ctx.ellipse(-14.2, -7.2, 3.5, 2.2, -0.38, 0, Math.PI * 2);
    ctx.fillStyle = "#09090b";
    ctx.fill();
    ctx.restore();

    // Right Ear
    ctx.save();
    ctx.translate(7.5, 3.0);
    ctx.rotate(-earTilt);
    ctx.beginPath();
    ctx.ellipse(-8, 4.5, 9.0, 2.8, 0.38, 0, Math.PI * 2);
    ctx.fillStyle = coatDorsal;
    ctx.fill();
    // Inner pink ear fold
    ctx.beginPath();
    ctx.ellipse(-7.5, 4.5, 6.8, 1.6, 0.38, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(244, 114, 182, 0.58)";
    ctx.fill();
    // Solid Jet-Black Ear Tip
    ctx.beginPath();
    ctx.ellipse(-14.2, 7.2, 3.5, 2.2, 0.38, 0, Math.PI * 2);
    ctx.fillStyle = "#09090b";
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  // --- Anatomical Canada Lynx (Lynx canadensis) Vector Rendering ---
  function drawCanadaLynx(ctx, pred) {
    ctx.save();

    // Fluid Quadruped Locomotion & Shoulder Sway
    const stride = Math.sin(pred.walkPhase) * (pred.isChasing ? 5.5 : 3.2);
    const shoulderSway = Math.cos(pred.walkPhase) * (pred.isChasing ? 1.8 : 1.2);

    // 1. Cast Ground Shadow (broad muscular predator silhouette)
    ctx.beginPath();
    ctx.ellipse(pred.x, pred.y + 6, 17, 8.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = isWinterSeason ? "rgba(51, 65, 85, 0.42)" : "rgba(0, 0, 0, 0.48)";
    ctx.fill();

    // 2. Body transform
    ctx.translate(pred.x, pred.y);
    ctx.rotate(pred.angle);

    // Color definitions (Lynx canadensis dense winter pelage)
    // Silvery-grey to taupe-buff dense fur with darker spinal guard hairs
    const lynxBase = "#a8a29e";   // warm silvery grey
    const lynxDorsal = "#78716c"; // darker spinal ridge
    const lynxFlank = "#d6d3d1";  // soft buff undercoat
    const lynxWhite = "#f8fafc";  // pure white ruff, bib & chin
    const lynxSpot = "rgba(87, 83, 78, 0.35)"; // subtle ghost rosettes

    // 3. Signature Short Bobbed Tail with SOLID ALL-AROUND JET-BLACK TIP
    // Tail extends backward from pelvis
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(-28, 0);
    ctx.lineWidth = 5.2;
    ctx.lineCap = "round";
    ctx.strokeStyle = lynxBase;
    ctx.stroke();

    // Complete solid jet-black tail tip (definitive species hallmark separating lynx from bobcat)
    ctx.beginPath();
    ctx.moveTo(-24, 0);
    ctx.lineTo(-29, 0);
    ctx.lineWidth = 5.5;
    ctx.strokeStyle = "#000000";
    ctx.stroke();

    // 4. Massive Heavily Furred Stealth Snow-Paws with Paw Pads
    ctx.fillStyle = lynxFlank;
    ctx.strokeStyle = "#57534e";
    ctx.lineWidth = 0.8;

    // Rear left snow-paw (alternating stride)
    ctx.beginPath();
    ctx.ellipse(-13, -11 + stride, 5.8, 4.4, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Rear right snow-paw
    ctx.beginPath();
    ctx.ellipse(-13, 11 - stride, 5.8, 4.4, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Front left snow-paw
    ctx.beginPath();
    ctx.ellipse(9, -10 - stride, 6.0, 4.6, 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Front right snow-paw
    ctx.beginPath();
    ctx.ellipse(9, 10 + stride, 6.0, 4.6, -0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 5. Muscular Torso: Elevated Pelvis / Hindquarters & Deep Chest
    // Canada lynx has distinct high-rumped posture (hind legs longer than front)
    ctx.beginPath();
    ctx.ellipse(-7, 0, 13.5, 9.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = lynxBase;
    ctx.fill();

    // Dorsal spine & shoulder blade ridge (swaying with gait)
    ctx.beginPath();
    ctx.ellipse(5, shoulderSway, 11.5, 8.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = lynxDorsal;
    ctx.fill();

    // Flank overlay with subtle ghost spots / rosettes
    ctx.beginPath();
    ctx.ellipse(-1, 0, 11.0, 6.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = lynxFlank;
    ctx.fill();

    // Subtle broken flank spots
    ctx.fillStyle = lynxSpot;
    ctx.beginPath();
    ctx.arc(-8, -4, 1.4, 0, Math.PI * 2);
    ctx.arc(-4, -5, 1.6, 0, Math.PI * 2);
    ctx.arc(0, -4.5, 1.4, 0, Math.PI * 2);
    ctx.arc(-8, 4, 1.4, 0, Math.PI * 2);
    ctx.arc(-4, 5, 1.6, 0, Math.PI * 2);
    ctx.arc(0, 4.5, 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Throat & Chest White Bib
    ctx.beginPath();
    ctx.ellipse(7, 0, 6.8, 5.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = lynxWhite;
    ctx.fill();

    // 6. Broad Feline Skull & Signature Flared Facial Cheek Ruffs (Beard)
    ctx.beginPath();
    ctx.arc(16, 0, 8.8, 0, Math.PI * 2);
    ctx.fillStyle = lynxBase;
    ctx.fill();

    // Flared Double-Pointed Facial Cheek Ruffs (Beard framing the jaw)
    ctx.fillStyle = lynxWhite;
    ctx.strokeStyle = "#44403c";
    ctx.lineWidth = 1.1;

    // Left cheek ruff
    ctx.beginPath();
    ctx.moveTo(13, -6);
    ctx.lineTo(15, -15); // sharp flared outer tip
    ctx.lineTo(19, -12); // secondary lower notch
    ctx.lineTo(19, -7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right cheek ruff
    ctx.beginPath();
    ctx.moveTo(13, 6);
    ctx.lineTo(15, 15);  // sharp flared outer tip
    ctx.lineTo(19, 12);  // secondary lower notch
    ctx.lineTo(19, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Muzzle & Chin Pad
    ctx.beginPath();
    ctx.ellipse(20.5, 0, 3.8, 3.4, 0, 0, Math.PI * 2);
    ctx.fillStyle = lynxWhite;
    ctx.fill();

    // Dark nose leather
    ctx.beginPath();
    ctx.arc(23.2, 0, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = "#1c1917";
    ctx.fill();

    // White tactile whiskers
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(21, -1.2); ctx.lineTo(29, -5.5);
    ctx.moveTo(21, 0);    ctx.lineTo(31, 0);
    ctx.moveTo(21, 1.2);  ctx.lineTo(29, 5.5);
    ctx.stroke();

    // Piercing Hypnotic Golden Amber Predator Eyes with Vertical Slits
    // Left eye
    ctx.fillStyle = "#f59e0b"; // amber iris
    ctx.beginPath();
    ctx.ellipse(17.5, -3.8, 2.2, 1.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000000"; // vertical slit pupil
    ctx.beginPath();
    ctx.ellipse(17.5, -3.8, 0.7, 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff"; // wet corneal highlight
    ctx.beginPath();
    ctx.arc(17.9, -4.2, 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Right eye
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.ellipse(17.5, 3.8, 2.2, 1.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.ellipse(17.5, 3.8, 0.7, 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(17.9, 3.4, 0.6, 0, Math.PI * 2);
    ctx.fill();

    // 7. Signature Pointed Ears with Long Black Tassels / Tufts (Plumes)
    // Left Ear
    ctx.save();
    ctx.translate(13.5, -7.2);
    ctx.beginPath();
    ctx.moveTo(-2.5, 0);
    ctx.lineTo(4.0, -6.5);
    ctx.lineTo(5.5, 2.2);
    ctx.closePath();
    ctx.fillStyle = lynxBase;
    ctx.fill();
    // White ocelli spot on rear of ear
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(1.2, -2.5, 1.5, 0, Math.PI * 2);
    ctx.fill();
    // Signature Long Black Ear Tassel / Plume / Ear Tuft (8.5px tall)
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(4.0, -6.5);
    ctx.lineTo(6.5, -15.5);
    ctx.stroke();
    // Secondary wispy plume hair
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(4.0, -6.5);
    ctx.lineTo(8.0, -14.5);
    ctx.stroke();
    ctx.restore();

    // Right Ear
    ctx.save();
    ctx.translate(13.5, 7.2);
    ctx.beginPath();
    ctx.moveTo(-2.5, 0);
    ctx.lineTo(4.0, 6.5);
    ctx.lineTo(5.5, -2.2);
    ctx.closePath();
    ctx.fillStyle = lynxBase;
    ctx.fill();
    // White ocelli spot
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(1.2, 2.5, 1.5, 0, Math.PI * 2);
    ctx.fill();
    // Signature Long Black Ear Tassel / Plume / Ear Tuft
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(4.0, 6.5);
    ctx.lineTo(6.5, 15.5);
    ctx.stroke();
    // Secondary wispy plume hair
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(4.0, 6.5);
    ctx.lineTo(8.0, 14.5);
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
      if (p.x > ARENA_W - pad) targetVx -= (p.x - (ARENA_W - pad)) * 0.12;
      if (p.y < pad + 20) targetVy += ((pad + 20) - p.y) * 0.12;
      if (p.y > ARENA_H - pad) targetVy -= (p.y - (ARENA_H - pad)) * 0.12;

      // Obstacle avoidance (boulders & deadfall logs)
      BOULDERS.forEach(b => {
        const d = Math.hypot(p.x - b.x, p.y - b.y);
        if (d < b.rx + 10) {
          const pushAngle = Math.atan2(p.y - b.y, p.x - b.x);
          targetVx += Math.cos(pushAngle) * 0.4;
          targetVy += Math.sin(pushAngle) * 0.4;
        }
      });

      DEADFALL_LOGS.forEach(log => {
        const midX = (log.x1 + log.x2) / 2;
        const midY = (log.y1 + log.y2) / 2;
        const d = Math.hypot(p.x - midX, p.y - midY);
        if (d < 30) {
          const pushAngle = Math.atan2(p.y - midY, p.x - midX);
          targetVx += Math.cos(pushAngle) * 0.35;
          targetVy += Math.sin(pushAngle) * 0.35;
        }
      });

      // Smooth velocity blend
      p.vx += (targetVx - p.vx) * 0.15;
      p.vy += (targetVy - p.vy) * 0.15;

      p.x += p.vx;
      p.y += p.vy;

      // Keep within arena bounds
      p.x = Math.max(25, Math.min(ARENA_W - 25, p.x));
      p.y = Math.max(45, Math.min(ARENA_H - 25, p.y));

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
      if (pred.x > ARENA_W - pad) targetVx -= (pred.x - (ARENA_W - pad)) * 0.12;
      if (pred.y < pad + 20) targetVy += ((pad + 20) - pred.y) * 0.12;
      if (pred.y > ARENA_H - pad) targetVy -= (pred.y - (ARENA_H - pad)) * 0.12;

      // Obstacle avoidance (boulders & deadfall logs)
      BOULDERS.forEach(b => {
        const d = Math.hypot(pred.x - b.x, pred.y - b.y);
        if (d < b.rx + 12) {
          const pushAngle = Math.atan2(pred.y - b.y, pred.x - b.x);
          targetVx += Math.cos(pushAngle) * 0.45;
          targetVy += Math.sin(pushAngle) * 0.45;
        }
      });

      DEADFALL_LOGS.forEach(log => {
        const midX = (log.x1 + log.x2) / 2;
        const midY = (log.y1 + log.y2) / 2;
        const d = Math.hypot(pred.x - midX, pred.y - midY);
        if (d < 32) {
          const pushAngle = Math.atan2(pred.y - midY, pred.x - midX);
          targetVx += Math.cos(pushAngle) * 0.4;
          targetVy += Math.sin(pushAngle) * 0.4;
        }
      });

      // Smooth blend
      pred.vx += (targetVx - pred.vx) * 0.14;
      pred.vy += (targetVy - pred.vy) * 0.14;

      pred.x += pred.vx;
      pred.y += pred.vy;

      pred.x = Math.max(25, Math.min(ARENA_W - 25, pred.x));
      pred.y = Math.max(45, Math.min(ARENA_H - 25, pred.y));

      pred.angle = Math.atan2(pred.vy, pred.vx);
    });

    // 3. Update Atmospheric Canopy Mist
    fogMist.forEach(m => {
      m.x += m.vx;
      if (m.x - m.r > ARENA_W) {
        m.x = -m.r;
        m.y = Math.random() * ARENA_H;
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
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, ARENA_W, ARENA_H);

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
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
    chartCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    chartCtx.clearRect(0, 0, CHART_W, CHART_H);

    // Background
    chartCtx.fillStyle = "#030712";
    chartCtx.fillRect(0, 0, CHART_W, CHART_H);
    chartCtx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    chartCtx.lineWidth = 1;

    for (let x = 40; x < CHART_W; x += 40) {
      chartCtx.beginPath();
      chartCtx.moveTo(x, 10);
      chartCtx.lineTo(x, CHART_H - 25);
      chartCtx.stroke();
    }
    for (let y = 15; y < CHART_H - 25; y += 30) {
      chartCtx.beginPath();
      chartCtx.moveTo(40, y);
      chartCtx.lineTo(CHART_W - 15, y);
      chartCtx.stroke();
    }

    // Axes
    chartCtx.strokeStyle = "#475569";
    chartCtx.lineWidth = 1.5;
    chartCtx.beginPath();
    chartCtx.moveTo(40, 10);
    chartCtx.lineTo(40, CHART_H - 25);
    chartCtx.lineTo(CHART_W - 15, CHART_H - 25);
    chartCtx.stroke();

    // Axis Labels
    chartCtx.fillStyle = "#94a3b8";
    chartCtx.font = "10px var(--font-mono, monospace)";
    chartCtx.textAlign = "center";
    chartCtx.fillText("Time (years)", CHART_W / 2, CHART_H - 6);

    // Max scale
    const maxPop = Math.max(250, carryingCapacityK * 1.1);

    // Plot Prey Curve (Green)
    if (timeSeriesHistory.length > 1) {
      chartCtx.strokeStyle = "#10b981";
      chartCtx.lineWidth = 2.2;
      chartCtx.beginPath();
      timeSeriesHistory.forEach((pt, idx) => {
        const px = 40 + (idx / (timeSeriesHistory.length - 1)) * (CHART_W - 55);
        const py = (CHART_H - 25) - (pt.prey / maxPop) * (CHART_H - 40);
        if (idx === 0) chartCtx.moveTo(px, py);
        else chartCtx.lineTo(px, py);
      });
      chartCtx.stroke();

      // Plot Predator Curve (Amber)
      chartCtx.strokeStyle = "#f59e0b";
      chartCtx.lineWidth = 2.2;
      chartCtx.beginPath();
      timeSeriesHistory.forEach((pt, idx) => {
        const px = 40 + (idx / (timeSeriesHistory.length - 1)) * (CHART_W - 55);
        const py = (CHART_H - 25) - ((pt.pred * 4.0) / maxPop) * (CHART_H - 40);
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
    const clickX = (e.clientX - rect.left) * (ARENA_W / rect.width);
    const clickY = (e.clientY - rect.top) * (ARENA_H / rect.height);

    // Drop forage cluster of willow/birch shoots
    forageClusters.push({
      x: Math.max(30, Math.min(ARENA_W - 30, clickX)),
      y: Math.max(50, Math.min(ARENA_H - 30, clickY)),
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
