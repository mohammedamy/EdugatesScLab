// Edugates-ClipSAT Science Labs - Physics: DC Circuits & Ohm's Law Laboratory
// Photorealistic Electronics Workbench: Siglent DC Bench Supply, 4-Band Axial Resistors,
// Dynamic Incandescent Tungsten Bulb, Brass Knife Switch with Spark, and 4K Workbench Photography.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";

let _currentCircuitsCleanup = null;

export function cleanupCircuitsLab() {
  if (typeof _currentCircuitsCleanup === "function") {
    try { _currentCircuitsCleanup(); } catch (e) {}
    _currentCircuitsCleanup = null;
  }
}

export function initCircuitsLab(containerId) {
  cleanupCircuitsLab();
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="lab-container">
      <!-- Mode & Visual Header Toolbar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding: 10px 18px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #f59e0b; box-shadow: 0 0 10px #f59e0b;"></span>
            Precision DC Circuits Workbench
          </span>
          <span class="badge" style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); color: #fbbf24; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            NIST Traceable Instrumentation (±0.5%)
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 12px;">
          <!-- View Switcher -->
          <div class="lab-view-switcher" style="display: flex; border-radius: 8px; padding: 3px;">
            <button id="circuit-mode-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              ⚡ Interactive Circuit
            </button>
            <button id="circuit-mode-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Electronics Bench
            </button>
          </div>

          <!-- Multimeter Probe Mode -->
          <label class="lab-checkbox-label" style="display: flex; align-items: center; gap: 6px; font-size: 0.78rem; cursor: pointer; user-select: none;">
            <input type="checkbox" id="chk-probes" style="accent-color: #ef4444; width: 15px; height: 15px;">
            <span style="color: #f87171; font-weight: 600;">Fluke DMM Probes</span>
          </label>
        </div>
      </div>

      <!-- Main Electronics Bench Canvas Area -->
      <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(245, 158, 11, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: #070a12; overflow: hidden; height: 500px;">
        <canvas id="circuit-canvas" width="1000" height="500" style="height: 500px; width: 100%; display: block;"></canvas>

        <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
        <div id="circuit-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
          <picture>
              <source srcset="assets/labs/circuits_bench.webp" type="image/webp">
              <img src="assets/labs/circuits_bench.jpg" decoding="async" loading="lazy" alt="4K Electronics Laboratory Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            </picture>
          
          <!-- Live Analytical Telemetry Callout on Photo -->
          <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Siglent DC Supply</div>
              <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.95rem;">3.30V • 0.150A Precision</div>
            </div>
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Solderless Breadboard</div>
              <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.95rem;">830-Tie Point Matrix</div>
            </div>
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Edison Incandescent Bulb</div>
              <div style="color: #fbbf24; font-weight: 700; font-family: var(--font-mono); font-size: 0.95rem;">Coiled Tungsten Filament</div>
            </div>
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Brass Knife Switch</div>
              <div style="color: #ec4899; font-weight: 700; font-family: var(--font-mono); font-size: 0.95rem;">Single Pole Single Throw (SPST)</div>
            </div>
          </div>
        </div>

        <!-- Top HUD: Status & Badges (Left) & Digital Telemetry (Right) Unified to Prevent Overlap -->
        <div class="sim-top-hud-bar" style="position: absolute; top: 12px; left: 14px; right: 14px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; pointer-events: none; z-index: 10;">
          <div class="sim-hud-badges" style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px; pointer-events: auto; max-width: 58%; min-width: 0;">
            <span class="badge" style="background: rgba(15, 23, 42, 0.92); border: 1px solid rgba(245, 158, 11, 0.4); padding: 5px 12px; border-radius: 9999px; font-family: var(--font-mono); font-size: 0.8rem; color: #fbbf24; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); white-space: nowrap;">
              <span id="circuit-status-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
              <span id="circuit-status">Circuit Closed • Current Flowing</span>
            </span>
            <span class="badge" id="topo-badge" style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 9999px; font-family: var(--font-mono); font-size: 0.78rem; color: #38bdf8; white-space: nowrap;">
              Series Circuit Topology
            </span>
          </div>

          <!-- Top Right Precision Digital Multimeter Telemetry -->
          <div class="sim-telemetry-dashboard" style="display: flex; gap: 10px; font-family: var(--font-mono); font-size: 0.82rem; padding: 8px 14px; border-radius: 12px; backdrop-filter: blur(12px); box-shadow: 0 10px 25px rgba(0,0,0,0.6); pointer-events: auto; flex-shrink: 0;">
            <div style="border-right: 1px solid rgba(255,255,255,0.1); padding-right: 10px;">
              <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase;">Total Voltage (V)</div>
              <div style="color: #38bdf8; font-weight: 700; font-size: 0.98rem;" id="val-v">12.0 V</div>
            </div>
            <div style="border-right: 1px solid rgba(255,255,255,0.1); padding-right: 10px;">
              <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase;">Current (I)</div>
              <div style="color: #10b981; font-weight: 700; font-size: 0.98rem;" id="val-i">0.60 A</div>
            </div>
            <div style="border-right: 1px solid rgba(255,255,255,0.1); padding-right: 10px;">
              <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase;">Equiv Res (R_eq)</div>
              <div style="color: #f59e0b; font-weight: 700; font-size: 0.98rem;" id="val-req">20.0 Ω</div>
            </div>
            <div>
              <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase;">Bulb Power (P)</div>
              <div style="color: #ec4899; font-weight: 700; font-size: 0.98rem;" id="val-power">3.60 W</div>
            </div>
          </div>
        </div>

        <!-- Floating Educational Formulation Bar -->
        <div id="circuit-formula-bar" class="sim-floating-formula-bar" style="position: absolute; bottom: 12px; left: 16px; right: 16px; backdrop-filter: blur(12px); border-radius: 12px; padding: 8px 18px; display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap; gap: 14px; font-size: 0.82rem; z-index: 10;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="color: #94a3b8; font-weight: 600;">Ohm's Law:</span>
            <span style="color: #38bdf8;">${renderLatex("V = I \\cdot R")}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="color: #94a3b8; font-weight: 600;">Joule Thermal Power:</span>
            <span style="color: #f59e0b;">${renderLatex("P = I^2 R = \\frac{V^2}{R}")}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="color: #94a3b8; font-weight: 600;">Topology Equivalent:</span>
            <span style="color: #10b981;" id="formula-req">${renderLatex("R_{\\text{series}} = R_1 + R_2")}</span>
          </div>
        </div>
      </div>

      <!-- Controls Panel & Circuit Customization -->
      <div class="lab-controls-panel" style="margin-top: 18px;">
        <!-- Voltage Source Slider -->
        <div class="control-group">
          <label class="control-label">
            <span>DC Voltage Power Supply (V)</span>
            <span class="control-val" id="disp-voltage">12.0 V</span>
          </label>
          <input type="range" id="input-voltage" class="custom-slider" min="1.5" max="36" value="12" step="0.5">
          <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-dim);">
            <span>1.5 V (AA Cell)</span>
            <span>12 V (Car Battery)</span>
            <span>36 V (Bench Supply)</span>
          </div>
        </div>

        <!-- Resistor R1 Slider -->
        <div class="control-group">
          <label class="control-label">
            <span>Resistor R₁ (Color-Coded)</span>
            <span class="control-val" id="disp-r1">10.0 Ω</span>
          </label>
          <input type="range" id="input-r1" class="custom-slider" min="2" max="50" value="10" step="1">
          <div style="font-size: 0.72rem; color: #94a3b8;" id="r1-bands-text">
            Bands: Brown - Black - Black - Gold (10 Ω ±5%)
          </div>
        </div>

        <!-- Bulb Filament Resistance -->
        <div class="control-group">
          <label class="control-label">
            <span>Incandescent Bulb Resistance (R₂)</span>
            <span class="control-val" id="disp-r2">10.0 Ω</span>
          </label>
          <input type="range" id="input-r2" class="custom-slider" min="2" max="40" value="10" step="1">
        </div>

        <!-- Circuit Topology Selector -->
        <div class="control-group">
          <label class="control-label">
            <span>Circuit Branching Architecture</span>
          </label>
          <select id="select-topology" class="select-input" style="font-weight: 600;">
            <option value="series" selected>Series Circuit (Battery → R₁ → Bulb in Loop)</option>
            <option value="parallel">Parallel Circuit (R₁ and Bulb in Independent Branches)</option>
          </select>
        </div>

        <!-- Action Buttons -->
        <div class="lab-action-buttons">
          <button class="btn btn-primary" id="btn-toggle-switch" style="box-shadow: 0 0 15px rgba(245, 158, 11, 0.4);">
            ⚡ Toggle Knife Switch (Open / Close)
          </button>

          <button class="btn btn-secondary" id="btn-preset-series">
            Series Divider Preset
          </button>

          <button class="btn btn-secondary" id="btn-preset-parallel">
            Parallel Current Preset
          </button>

          <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #f8fafc; cursor: pointer; user-select: none; margin-left: auto;">
            <input type="checkbox" id="chk-flow-dir" checked style="accent-color: #38bdf8; width: 16px; height: 16px;">
            <span>Electron Flow (- to +)</span>
          </label>
        </div>
      </div>

      <!-- Telemetry Suite & Multi-Trial Bar -->
      <div class="lab-telemetry-suite-bar">
        <div class="lab-trials-badge-group" id="circuits-trials-badge-group">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">Multi-Trial Circuit Logging:</span>
          <span class="lab-trial-pill trial-1" id="circ-pill-trial-1" style="opacity: 0.5;">Trial 1 (Cyan)</span>
          <span class="lab-trial-pill trial-2" id="circ-pill-trial-2" style="opacity: 0.5;">Trial 2 (Amber)</span>
          <span class="lab-trial-pill trial-3" id="circ-pill-trial-3" style="opacity: 0.5;">Trial 3 (Emerald)</span>
        </div>

        <div class="lab-export-buttons-group">
          <button class="btn btn-secondary" id="btn-record-circ-trial" style="padding: 6px 12px; font-size: 0.8rem; gap: 6px; border-color: rgba(245,158,11,0.4); color: #fbbf24;">
            <span>📸 Log Current State</span>
          </button>
          <button class="btn btn-secondary" id="btn-export-circ-csv" style="padding: 6px 12px; font-size: 0.8rem; gap: 6px;">
            <span>📥 Export CSV Data</span>
          </button>
          <button class="btn btn-primary" id="btn-open-circ-report" style="padding: 6px 14px; font-size: 0.8rem; gap: 6px; background: linear-gradient(135deg, #d97706, #b45309); border: none;">
            <span>📑 Generate Lab Report</span>
          </button>
        </div>
      </div>

      <!-- Post-Lab Checkpoint Assessment Mount -->
      <div id="circuits-checkpoint-container"></div>
    </div>
  `;

  const canvas = document.getElementById("circuit-canvas");
  const ctx = canvas.getContext("2d");
  const photoOverlay = document.getElementById("circuit-photo-overlay");

  // State
  let voltage = 12.0;
  let r1 = 10.0;
  let r2 = 10.0;
  let topology = "series";
  let switchClosed = true;
  let electronOffset = 0;
  let sparks = [];
  let animId = null;
  let showProbes = false;

  // Audio synthesis
  function playClickSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(320, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch(e) {}
  }

  // 4-Band Resistor Color Codes
  const colorBands = {
    0: { name: "Black", color: "#0f172a" },
    1: { name: "Brown", color: "#854d0e" },
    2: { name: "Red", color: "#ef4444" },
    3: { name: "Orange", color: "#f97316" },
    4: { name: "Yellow", color: "#eab308" },
    5: { name: "Green", color: "#22c55e" },
    6: { name: "Blue", color: "#3b82f6" },
    7: { name: "Violet", color: "#a855f7" },
    8: { name: "Gray", color: "#64748b" },
    9: { name: "White", color: "#f8fafc" }
  };

  function getResistorBands(ohms) {
    const s = Math.round(ohms).toString();
    const b1 = parseInt(s[0], 10);
    const b2 = s.length > 1 ? parseInt(s[1], 10) : 0;
    const mult = Math.max(0, s.length - 2);
    return [colorBands[b1], colorBands[b2], colorBands[mult]];
  }

  function calculateCircuit() {
    if (!switchClosed) {
      return { req: Infinity, current: 0, power: 0, i1: 0, i2: 0, v1: 0, v2: 0 };
    }

    if (topology === "series") {
      const req = r1 + r2;
      const current = voltage / req;
      const v1 = current * r1;
      const v2 = current * r2;
      const power = current * current * r2;
      return { req, current, power, i1: current, i2: current, v1, v2 };
    } else {
      const req = (r1 * r2) / (r1 + r2);
      const i1 = voltage / r1;
      const i2 = voltage / r2;
      const current = i1 + i2;
      const power = i2 * i2 * r2;
      return { req, current, power, i1, i2, v1: voltage, v2: voltage };
    }
  }

  function drawCircuit(dtFactor = 1.0) {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    // 1. Electronics Workbench Surface
    const benchGrad = ctx.createLinearGradient(0, 0, 0, h);
    benchGrad.addColorStop(0, "#080d1a");
    benchGrad.addColorStop(0.5, "#0f172a");
    benchGrad.addColorStop(1, "#111c30");
    ctx.fillStyle = benchGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle Grounding Grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.035)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const { req, current, power, i1, i2, v1, v2 } = calculateCircuit();

    // Circuit Layout Coordinates
    const cLeft = 140;
    const cRight = w - 140;
    const cTop = 90;
    const cBottom = h - 90;

    // 2. Thick Insulated Copper Connecting Wires
    ctx.strokeStyle = switchClosed ? "#f59e0b" : "#475569";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";

    // Main Outer Loop Path
    ctx.beginPath();
    const switchX = (cLeft + cRight) / 2;
    ctx.moveTo(cLeft, cTop);
    ctx.lineTo(switchX - 35, cTop);

    ctx.moveTo(switchX + 35, cTop);
    ctx.lineTo(cRight, cTop);

    if (topology === "series") {
      ctx.lineTo(cRight, cBottom);
      ctx.lineTo(cLeft, cBottom);
      ctx.lineTo(cLeft, cTop);
    } else {
      const midBranchX = cLeft + (cRight - cLeft) * 0.55;
      ctx.moveTo(midBranchX, cTop);
      ctx.lineTo(midBranchX, cBottom);
      ctx.moveTo(cRight, cTop);
      ctx.lineTo(cRight, cBottom);
      ctx.moveTo(cRight, cBottom);
      ctx.lineTo(cLeft, cBottom);
      ctx.lineTo(cLeft, cTop);
    }
    ctx.stroke();

    // 3. DC Power Source / Cylindrical Battery (Left Side)
    const batX = cLeft;
    const batY = (cTop + cBottom) / 2;
    const batH = 90;
    const batW = 34;

    const bGrad = ctx.createLinearGradient(batX - batW/2, 0, batX + batW/2, 0);
    bGrad.addColorStop(0, "#1e293b");
    bGrad.addColorStop(0.3, "#0284c7");
    bGrad.addColorStop(0.7, "#0369a1");
    bGrad.addColorStop(1, "#082f49");
    ctx.fillStyle = bGrad;
    ctx.fillRect(batX - batW/2, batY - batH/2, batW, batH);
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(batX - batW/2, batY - batH/2, batW, batH);

    // Brass Positive Terminal Knob (+) at Top
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(batX - 7, batY - batH/2 - 8, 14, 8);

    // Polarity Labels
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px JetBrains Mono";
    ctx.fillText("+", batX - 4, batY - batH/2 + 18);
    ctx.fillText("-", batX - 4, batY + batH/2 - 8);

    ctx.font = "bold 10px JetBrains Mono";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText(`${voltage.toFixed(1)}V`, batX - 14, batY + 4);

    // 4. Heavy Brass Knife Switch
    ctx.fillStyle = "#94a3b8";
    ctx.beginPath();
    ctx.arc(switchX - 35, cTop, 7, 0, Math.PI * 2);
    ctx.arc(switchX + 35, cTop, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(switchX - 35, cTop);
    ctx.rotate(switchClosed ? 0 : -Math.PI / 4);
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(70, 0);
    ctx.stroke();

    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(70, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Spark Particles
    for (let i = sparks.length - 1; i >= 0; i--) {
      const sp = sparks[i];
      sp.x += sp.vx * dtFactor;
      sp.y += sp.vy * dtFactor;
      sp.life -= 0.05 * dtFactor;
      if (sp.life <= 0) {
        sparks.splice(i, 1);
        continue;
      }
      ctx.fillStyle = "#38bdf8";
      const isSmart = (document.documentElement.getAttribute("data-mode") === "smartboard") ||
                      document.documentElement.classList.contains("fast-smartboard-mode") ||
                      /Android|MAXHUB/i.test(navigator.userAgent);
      if (!isSmart) {
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 8;
      }
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 2.5 * sp.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // 5. Ceramic Carbon-Film Axial Resistor R1
    const r1X = (topology === "series") ? cRight : (cLeft + (cRight - cLeft) * 0.55);
    const r1Y = (cTop + cBottom) / 2;
    const resH = 50;
    const resW = 20;

    const rGrad = ctx.createLinearGradient(r1X - resW/2, 0, r1X + resW/2, 0);
    rGrad.addColorStop(0, "#fed7aa");
    rGrad.addColorStop(0.5, "#ffedd5");
    rGrad.addColorStop(1, "#fdba74");
    ctx.fillStyle = rGrad;
    ctx.beginPath();
    ctx.roundRect(r1X - resW/2, r1Y - resH/2, resW, resH, 6);
    ctx.fill();
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1;
    ctx.stroke();

    const bands = getResistorBands(r1);
    const bandPositions = [-14, -5, 4, 15];
    bands.forEach((b, idx) => {
      ctx.fillStyle = b.color;
      ctx.fillRect(r1X - resW/2, r1Y + bandPositions[idx] - 2, resW, 4);
    });
    ctx.fillStyle = "#eab308";
    ctx.fillRect(r1X - resW/2, r1Y + bandPositions[3] - 2, resW, 4);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 11px JetBrains Mono";
    ctx.fillText(`R₁ = ${r1.toFixed(1)}Ω`, r1X - 35, r1Y + resH/2 + 18);

    // 6. Edison Incandescent Tungsten Light Bulb (R2)
    const bulbX = (topology === "series") ? ((cLeft + cRight) / 2) : cRight;
    const bulbY = (topology === "series") ? cBottom : ((cTop + cBottom) / 2);

    if (power > 0.05) {
      const glowRad = Math.min(120, 20 + Math.sqrt(power) * 25);
      const radGrad = ctx.createRadialGradient(bulbX, bulbY - 14, 5, bulbX, bulbY - 14, glowRad);
      radGrad.addColorStop(0, "rgba(254, 240, 138, 0.75)");
      radGrad.addColorStop(0.4, "rgba(245, 158, 11, 0.4)");
      radGrad.addColorStop(1, "rgba(245, 158, 11, 0)");

      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(bulbX, bulbY - 14, glowRad, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#d97706";
    ctx.fillRect(bulbX - 10, bulbY + 6, 20, 14);
    ctx.strokeStyle = "#92400e";
    ctx.lineWidth = 1;
    ctx.strokeRect(bulbX - 10, bulbY + 6, 20, 14);

    const bulbGlassGrad = ctx.createRadialGradient(bulbX - 4, bulbY - 18, 4, bulbX, bulbY - 14, 22);
    bulbGlassGrad.addColorStop(0, "rgba(255, 255, 255, 0.45)");
    bulbGlassGrad.addColorStop(0.6, "rgba(255, 255, 255, 0.12)");
    bulbGlassGrad.addColorStop(1, "rgba(255, 255, 255, 0.25)");
    ctx.fillStyle = bulbGlassGrad;
    ctx.beginPath();
    ctx.arc(bulbX, bulbY - 14, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const filamentColor = (power > 0.05) ? "#ffffff" : "#64748b";
    ctx.strokeStyle = filamentColor;
    ctx.lineWidth = 2.5;
    const isSmart = (document.documentElement.getAttribute("data-mode") === "smartboard") ||
                    document.documentElement.classList.contains("fast-smartboard-mode") ||
                    /Android|MAXHUB/i.test(navigator.userAgent);
    if (power > 0.05 && !isSmart) {
      ctx.shadowColor = "#fef08a";
      ctx.shadowBlur = 10;
    }
    ctx.beginPath();
    ctx.moveTo(bulbX - 6, bulbY + 6);
    ctx.lineTo(bulbX - 4, bulbY - 14);
    ctx.lineTo(bulbX, bulbY - 18);
    ctx.lineTo(bulbX + 4, bulbY - 14);
    ctx.lineTo(bulbX + 6, bulbY + 6);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 11px JetBrains Mono";
    ctx.fillText(`Bulb = ${r2.toFixed(1)}Ω`, bulbX - 35, bulbY + 36);

    // 7. Animated Glowing Electron Dots
    if (switchClosed && current > 0) {
      electronOffset = (electronOffset + current * 1.8 * dtFactor) % 40;
      ctx.fillStyle = "#38bdf8";
      if (!isSmart) {
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 6;
      }

      function drawElectron(x, y) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let x = cLeft + 15; x < cRight - 15; x += 35) {
        const ex = (x + electronOffset) % (cRight - cLeft) + cLeft;
        if (Math.abs(ex - switchX) > 20) drawElectron(ex, cTop);
      }

      for (let x = cLeft + 15; x < cRight - 15; x += 35) {
        const ex = cRight - ((x + electronOffset) % (cRight - cLeft));
        drawElectron(ex, cBottom);
      }

      for (let y = cTop + 15; y < cBottom - 15; y += 35) {
        const ey = cBottom - ((y + electronOffset) % (cBottom - cTop));
        drawElectron(cLeft, ey);
        drawElectron(cRight, (y + electronOffset) % (cBottom - cTop) + cTop);
      }
      ctx.shadowBlur = 0;
    }

    // 8. Fluke Digital Multimeter Probes Overlay (if enabled)
    if (showProbes) {
      // Red Probe (+) at top of R1
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(r1X - 3, r1Y - resH/2 - 25, 6, 25);
      ctx.fillStyle = "#94a3b8"; // needle tip
      ctx.fillRect(r1X - 1, r1Y - resH/2 - 5, 2, 8);

      // Black Probe (-) at bottom of R1
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(r1X - 3, r1Y + resH/2 + 2, 6, 25);
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(r1X - 1, r1Y + resH/2 - 3, 2, 8);

      // Probe HUD Pill
      ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(r1X + 20, r1Y - 15, 95, 30, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 11px JetBrains Mono";
      ctx.fillText(`V_R1: ${v1.toFixed(2)} V`, r1X + 28, r1Y + 4);
    }

    ctx.restore();
  }

  function updateTelemetry() {
    const { req, current, power } = calculateCircuit();

    document.getElementById("val-v").innerText = `${voltage.toFixed(1)} V`;
    document.getElementById("val-i").innerText = `${current.toFixed(2)} A`;
    document.getElementById("val-req").innerText = isFinite(req) ? `${req.toFixed(1)} Ω` : "∞ (Open)";
    document.getElementById("val-power").innerText = `${power.toFixed(2)} W`;

    document.getElementById("disp-voltage").innerText = `${voltage.toFixed(1)} V`;
    document.getElementById("disp-r1").innerText = `${r1.toFixed(1)} Ω`;
    document.getElementById("disp-r2").innerText = `${r2.toFixed(1)} Ω`;

    const statusBadge = document.getElementById("circuit-status");
    const statusDot = document.getElementById("circuit-status-dot");
    if (!switchClosed) {
      statusBadge.innerText = "Circuit Open • Zero Current";
      statusDot.style.background = "#ef4444";
    } else {
      statusBadge.innerText = `Active Current Flow (${current.toFixed(2)} A)`;
      statusDot.style.background = "#10b981";
    }

    const bands = getResistorBands(r1);
    document.getElementById("r1-bands-text").innerText = `Bands: ${bands[0].name} - ${bands[1].name} - ${bands[2].name} - Gold (${Math.round(r1)} Ω)`;
    requestRender();
  }

  let lastFrameTime = 0;
  let needsRedraw = true;
  function requestRender() {
    needsRedraw = true;
  }
  function renderLoop(now) {
    if (!container.isConnected) {
      if (animId) cancelAnimationFrame(animId);
      return;
    }
    const { current } = calculateCircuit();
    const isCircuitActive = (switchClosed && current > 0) || (sparks && sparks.length > 0);
    if (!isCircuitActive && !needsRedraw) {
      animId = requestAnimationFrame(renderLoop);
      return;
    }
    const isSmart = (document.documentElement.getAttribute("data-mode") === "smartboard") ||
                    document.documentElement.classList.contains("fast-smartboard-mode") ||
                    /Android|MAXHUB/i.test(navigator.userAgent);
    const interval = isSmart ? 33 : 16;
    const currentTime = now || performance.now();
    if (!lastFrameTime || currentTime - lastFrameTime >= interval) {
      const elapsed = lastFrameTime ? Math.min((currentTime - lastFrameTime) / 1000, 0.1) : (interval / 1000);
      lastFrameTime = currentTime;
      const dtFactor = Math.min(Math.max(elapsed * 60, 0.5), 3.0);
      needsRedraw = false;
      const photoEl = container.querySelector("#circuit-photo-overlay");
      if (!photoEl || photoEl.style.display !== "block") {
        drawCircuit(dtFactor);
      }
    }
    animId = requestAnimationFrame(renderLoop);
  }
  renderLoop();

  // Control Handlers
  const inV = document.getElementById("input-voltage");
  const inR1 = document.getElementById("input-r1");
  const inR2 = document.getElementById("input-r2");
  const selTopo = document.getElementById("select-topology");

  inV.addEventListener("input", (e) => {
    voltage = parseFloat(e.target.value);
    updateTelemetry();
  });

  inR1.addEventListener("input", (e) => {
    r1 = parseFloat(e.target.value);
    updateTelemetry();
  });

  inR2.addEventListener("input", (e) => {
    r2 = parseFloat(e.target.value);
    updateTelemetry();
  });

  selTopo.addEventListener("change", (e) => {
    topology = e.target.value;
    document.getElementById("topo-badge").innerText = (topology === "series") ? "Series Circuit Topology" : "Parallel Circuit Architecture";
    document.getElementById("formula-req").innerHTML = (topology === "series") ? renderLatex("R_{\\text{series}} = R_1 + R_2") : renderLatex("\\frac{1}{R_{\\text{eq}}} = \\frac{1}{R_1} + \\frac{1}{R_2}");
    updateTelemetry();
  });

  document.getElementById("btn-toggle-switch").addEventListener("click", () => {
    switchClosed = !switchClosed;
    playClickSound();

    if (switchClosed) {
      const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
      const w = canvas.width / dpr;
      const switchX = w / 2;
      for (let k = 0; k < 12; k++) {
        sparks.push({
          x: switchX + 35,
          y: 90,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5,
          life: 1.0
        });
      }
    }
    updateTelemetry();
  });

  document.getElementById("btn-preset-series").addEventListener("click", () => {
    topology = "series";
    selTopo.value = "series";
    voltage = 12;
    inV.value = 12;
    r1 = 10;
    inR1.value = 10;
    r2 = 10;
    inR2.value = 10;
    switchClosed = true;
    updateTelemetry();
  });

  document.getElementById("btn-preset-parallel").addEventListener("click", () => {
    topology = "parallel";
    selTopo.value = "parallel";
    voltage = 12;
    inV.value = 12;
    r1 = 10;
    inR1.value = 10;
    r2 = 10;
    inR2.value = 10;
    switchClosed = true;
    updateTelemetry();
  });

  document.getElementById("chk-probes").addEventListener("change", (e) => {
    showProbes = e.target.checked;
  });

  // View Mode Switcher
  const btnSim = document.getElementById("circuit-mode-sim");
  const btnPhoto = document.getElementById("circuit-mode-photo");

  btnSim.addEventListener("click", () => {
    photoOverlay.style.display = "none";
    const formulaBar = document.getElementById("circuit-formula-bar");
    if (formulaBar) formulaBar.style.display = "flex";
    btnSim.style.background = "rgba(245, 158, 11, 0.25)";
    btnSim.style.color = "#fbbf24";
    btnPhoto.style.background = "transparent";
    btnPhoto.style.color = "#94a3b8";
  });

  btnPhoto.addEventListener("click", () => {
    photoOverlay.style.display = "block";
    const formulaBar = document.getElementById("circuit-formula-bar");
    if (formulaBar) formulaBar.style.display = "none";
    btnPhoto.style.background = "rgba(245, 158, 11, 0.25)";
    btnPhoto.style.color = "#fbbf24";
    btnSim.style.background = "transparent";
    btnSim.style.color = "#94a3b8";
  });

  // Telemetry Suite: Record Current Trial
  document.getElementById("btn-record-circ-trial")?.addEventListener("click", () => {
    let rEq = topology === "series" ? (r1 + r2) : ((r1 * r2) / (r1 + r2));
    let iTotal = switchClosed ? (voltage / rEq) : 0;
    let pTotal = voltage * iTotal;

    const trialEntry = LabTrialStore.addTrial("circuits", {
      measurements: {
        "Voltage (V)": parseFloat(voltage.toFixed(1)),
        "R1 (Ω)": parseFloat(r1.toFixed(1)),
        "R2 (Ω)": parseFloat(r2.toFixed(1)),
        "Req (Ω)": parseFloat(rEq.toFixed(2)),
        "Current (A)": parseFloat(iTotal.toFixed(3)),
        "Power (W)": parseFloat(pTotal.toFixed(2))
      }
    });

    const trials = LabTrialStore.getTrials("circuits");
    trials.forEach((tr, i) => {
      const pill = document.getElementById(`circ-pill-trial-${i + 1}`);
      if (pill) {
        pill.style.opacity = "1";
        pill.innerText = `Trial ${tr.trialNumber}: V=${tr.measurements["Voltage (V)"]}V, I=${tr.measurements["Current (A)"]}A (Req=${tr.measurements["Req (Ω)"]}Ω)`;
      }
    });
  });

  // Telemetry Suite: Export CSV
  document.getElementById("btn-export-circ-csv")?.addEventListener("click", () => {
    let rEq = topology === "series" ? (r1 + r2) : ((r1 * r2) / (r1 + r2));
    let iTotal = switchClosed ? (voltage / rEq) : 0;
    let pTotal = voltage * iTotal;

    exportLabDataCsv({
      title: "DC Circuits & Ohm's Law Laboratory",
      labId: "circuits",
      parameters: {
        "Source Voltage": `${voltage} V`,
        "Resistor R1": `${r1} Ω`,
        "Resistor R2 (Bulb)": `${r2} Ω`,
        "Topology": topology.toUpperCase(),
        "Switch State": switchClosed ? "CLOSED (Active)" : "OPEN (Halted)"
      },
      headers: ["Voltage (V)", "Topology", "Req (Ω)", "Current (A)", "Total Power (W)", "R1 Voltage (V)", "R2 Voltage (V)"],
      dataRows: [
        [
          voltage,
          topology,
          rEq,
          iTotal,
          pTotal,
          topology === "series" ? (iTotal * r1) : voltage,
          topology === "series" ? (iTotal * r2) : voltage
        ]
      ]
    });
  });

  // Telemetry Suite: Generate Lab Report
  document.getElementById("btn-open-circ-report")?.addEventListener("click", () => {
    const trials = LabTrialStore.getTrials("circuits");
    let rEq = topology === "series" ? (r1 + r2) : ((r1 * r2) / (r1 + r2));
    let iTotal = switchClosed ? (voltage / rEq) : 0;

    openLabReportModal({
      title: "DC Circuits, Ohm's Law & Kirchhoff's Circuit Rules",
      subject: "Physics",
      inquiryQuestion: "How do series vs parallel circuit topologies govern equivalent resistance, voltage distribution, and total branch current?",
      parameters: {
        "DC Supply Voltage": `${voltage.toFixed(1)} V`,
        "Resistor R1": `${r1.toFixed(1)} Ω`,
        "Load Resistor R2 (Bulb)": `${r2.toFixed(1)} Ω`,
        "Branch Architecture": topology.toUpperCase(),
        "Equivalent Resistance": `${rEq.toFixed(2)} Ω`,
        "Loop Current": `${iTotal.toFixed(3)} A`
      },
      trials,
      formulas: [
        "V = I \\cdot R",
        "R_{\\text{series}} = R_1 + R_2",
        "\\frac{1}{R_{\\text{parallel}}} = \\frac{1}{R_1} + \\frac{1}{R_2}",
        "P = V \\cdot I = I^2 R = \\frac{V^2}{R}"
      ]
    });
  });

  // Mount Post-Lab Checkpoint Assessment
  mountLabCheckpoint("circuits-checkpoint-container", "circuits");

  function handleResize() {
    if (!container || !container.isConnected) {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
    canvas.width = rect.width * dpr;
    canvas.height = 500 * dpr;
    requestRender();
  }
  window.addEventListener("resize", handleResize);
  handleResize();

  const cleanup = () => {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("resize", handleResize);
  };
  _currentCircuitsCleanup = cleanup;
  return cleanup;
}

