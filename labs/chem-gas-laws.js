// Edugates-ClipSAT Science Labs - Chemistry: Kinetic Molecular Theory & Gas Laws Laboratory
// Photorealistic Pressure Chamber: 4K Thermodynamics Bench Photography, Pneumatic Piston,
// Bunsen Flame & Cryo-Cooling, 3D Kinetic Particles, Analog Bourdon Gauge, and Maxwell-Boltzmann Speed Metrology.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";

export function initGasLawsLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="lab-container">
      <!-- Mode & Visual Header Toolbar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #06b6d4; box-shadow: 0 0 10px #06b6d4;"></span>
            Kinetic Molecular Theory & Gas Metrology
          </span>
          <span class="badge" style="background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.3); color: #38bdf8; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            Calibrated Bourdon Gauge & Compression Chamber
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 12px;">
          <!-- View Switcher -->
          <div class="lab-view-switcher" style="display: flex; border-radius: 8px; padding: 3px;">
            <button id="gas-mode-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Kinetic Chamber
            </button>
            <button id="gas-mode-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Lab Apparatus
            </button>
          </div>
        </div>
      </div>

      <!-- Top Dual Viewports: Pressure Chamber & Maxwell-Boltzmann Curve -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="gas-layout">
        <!-- Left: Gas Chamber Cylinder Canvas -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(6, 182, 212, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: #070a12; overflow: hidden; height: 520px;">
          <canvas id="gas-chamber-canvas" width="560" height="520" style="height: 520px; width: 100%; display: block;"></canvas>

          <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
          <div id="gas-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <img src="assets/labs/gas_laws_bench.jpg" alt="4K Thermodynamics Gas Laws Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            
            <!-- Live Analytical Telemetry Callout on Photo -->
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(6, 182, 212, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Bourdon Dial Gauge</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.95rem;">1.00 atm • 101.3 kPa</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Brass Piston Cylinder</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.95rem;">Precision Ground Bore</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Bunsen Heat Source</div>
                <div style="color: #fbbf24; font-weight: 700; font-family: var(--font-mono); font-size: 0.95rem;">Thermodynamic Flux</div>
              </div>
            </div>
          </div>

          <!-- Top HUD: Status & Pressure Gauge Unified to Prevent Overlap -->
          <div class="sim-top-hud-bar" style="position: absolute; top: 12px; left: 14px; right: 14px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; pointer-events: none; z-index: 10;">
            <div class="sim-hud-badges" style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px; pointer-events: auto; max-width: 58%; min-width: 0;">
              <span class="badge" style="background: rgba(15, 23, 42, 0.92); border: 1px solid rgba(6, 182, 212, 0.4); padding: 5px 12px; border-radius: 9999px; font-family: var(--font-mono); font-size: 0.8rem; color: #38bdf8; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); white-space: nowrap;">
                <span id="gas-status-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
                <span id="gas-status">Gas Equilibrium Stable</span>
              </span>
            </div>

            <!-- Digital Pressure & State Gauge -->
            <div style="background: rgba(10, 15, 30, 0.95); border: 2px solid #334155; border-radius: 10px; padding: 8px 14px; box-shadow: inset 0 2px 6px rgba(0,0,0,0.8), 0 8px 25px rgba(0,0,0,0.7); backdrop-filter: blur(8px); pointer-events: auto; flex-shrink: 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.65rem; color: #94a3b8; font-family: var(--font-mono); margin-bottom: 2px; gap: 8px;">
                <span>CHAMBER PRESSURE</span>
                <span style="color: #38bdf8; font-weight: 700;">PV = nRT</span>
              </div>
              <div style="font-family: var(--font-mono); font-size: 1.6rem; font-weight: 800; color: #38bdf8; text-shadow: 0 0 12px rgba(56, 189, 248, 0.45); line-height: 1;" id="disp-digital-pressure">
                1.00 atm
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: #cbd5e1; font-family: var(--font-mono); margin-top: 4px; gap: 10px;">
                <span>101.3 kPa</span>
                <span id="disp-temp-kelvin" style="color: #f59e0b; font-weight: 700;">298.15 K</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Maxwell-Boltzmann Molecular Speed Distribution -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(245, 158, 11, 0.3); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: #070a12;">
            <canvas id="boltzmann-canvas" width="520" height="330" style="height: 330px; width: 100%; display: block;"></canvas>

            <!-- Speed Curve Legend -->
            <div class="canvas-hud-legend" style="position: absolute; top: 12px; left: 16px; font-family: var(--font-mono); font-size: 0.76rem; background: rgba(15, 23, 42, 0.9); padding: 6px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); display: flex; gap: 14px; z-index: 5;">
              <span style="color: #f59e0b; display: flex; align-items: center; gap: 4px;">
                <span style="display: inline-block; width: 10px; height: 3px; background: #f59e0b;"></span> Speed Distribution f(v)
              </span>
              <span style="color: #10b981; display: flex; align-items: center; gap: 4px;">
                <span style="display: inline-block; width: 10px; height: 2px; border-top: 2px dashed #10b981;"></span> v_rms
              </span>
            </div>
          </div>

          <!-- Kinetic Molecular Theory Formula Banner -->
          <div class="sim-telemetry-card" style="background: rgba(15, 23, 42, 0.88); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px 20px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.4);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.78rem; font-weight: 700; color: #38bdf8; text-transform: uppercase;">
                Kinetic Molecular Parameters
              </span>
              <span id="rms-badge" style="font-size: 0.75rem; font-weight: 700; padding: 2px 8px; border-radius: 9999px; background: rgba(16, 185, 129, 0.15); color: #10b981;">
                v_rms = 482 m/s (N₂)
              </span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.85rem;">
              <div>
                <span style="color: var(--text-muted); font-size: 0.78rem;">Average Kinetic Energy:</span>
                <div style="color: #f59e0b; font-weight: 700; font-family: var(--font-mono);" id="val-ke">6.17 × 10⁻²¹ J</div>
              </div>
              <div>
                <span style="color: var(--text-muted); font-size: 0.78rem;">Particle Collision Freq:</span>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono);" id="val-freq">1,420 coll/s</div>
              </div>
            </div>

            <!-- Mathematical Formulation -->
            <div class="sim-sub-card" style="border-radius: 8px; padding: 8px 12px; font-size: 0.82rem; display: flex; justify-content: space-between; align-items: center;">
              <span>Root-Mean-Square Velocity:</span>
              <span style="color: #10b981;">${renderLatex("v_{\\text{rms}} = \\sqrt{\\frac{3RT}{M}}")}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Controls Panel & Gas Law Inquiries -->
      <div class="lab-controls-panel" style="margin-top: 18px;">
        <!-- Volume / Piston Height Slider -->
        <div class="control-group">
          <label class="control-label">
            <span>Chamber Volume (V)</span>
            <span class="control-val" id="disp-volume">22.4 L</span>
          </label>
          <input type="range" id="input-volume" class="custom-slider" min="5" max="45" value="22.4" step="0.2">
          <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-dim);">
            <span>5.0 L (Compressed)</span>
            <span style="color: #38bdf8;">22.4 L (STP)</span>
            <span>45.0 L (Expanded)</span>
          </div>
        </div>

        <!-- Temperature Slider -->
        <div class="control-group">
          <label class="control-label">
            <span>Absolute Temperature (T)</span>
            <span class="control-val" id="disp-temp" style="color: #f59e0b;">298 K (25°C)</span>
          </label>
          <input type="range" id="input-temp" class="custom-slider" min="100" max="600" value="298" step="2" style="accent-color: #f59e0b;">
          <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-dim);">
            <span>100 K (-173°C)</span>
            <span>273 K (0°C)</span>
            <span>600 K (327°C)</span>
          </div>
        </div>

        <!-- Molar Quantity (n) -->
        <div class="control-group">
          <label class="control-label">
            <span>Amount of Gas (n)</span>
            <span class="control-val" id="disp-moles">1.00 mol</span>
          </label>
          <input type="range" id="input-moles" class="custom-slider" min="0.2" max="2.5" value="1.0" step="0.05">
        </div>

        <!-- Thermal Action Buttons & Gas Law Presets -->
        <div class="lab-action-buttons">
          <button class="btn btn-secondary" id="btn-heat-burner" style="border-color: rgba(245, 158, 11, 0.4); color: #fbbf24;">
            🔥 Ignite Bunsen Burner (+50 K)
          </button>

          <button class="btn btn-secondary" id="btn-cool-ice" style="border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;">
            ❄️ Ice Bath Cooling (-50 K)
          </button>

          <button class="btn btn-secondary" id="btn-law-boyle" style="border-color: rgba(16, 185, 129, 0.4); color: #34d399;">
            Boyle's Law (P ∝ 1/V)
          </button>

          <button class="btn btn-secondary" id="btn-law-charles" style="border-color: rgba(139, 92, 246, 0.4); color: #c084fc;">
            Charles's Law (V ∝ T)
          </button>

          <button class="btn btn-secondary" id="btn-reset-gas" style="margin-left: auto;">
            ↺ Reset Chamber
          </button>
        </div>
      </div>

      <!-- Telemetry Suite & Multi-Trial Bar -->
      <div class="lab-telemetry-suite-bar">
        <div class="lab-trials-badge-group" id="gas-trials-badge-group">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">Multi-Trial Gas State Logging:</span>
          <span class="lab-trial-pill trial-1" id="gas-pill-trial-1" style="opacity: 0.5;">Trial 1 (Cyan)</span>
          <span class="lab-trial-pill trial-2" id="gas-pill-trial-2" style="opacity: 0.5;">Trial 2 (Amber)</span>
          <span class="lab-trial-pill trial-3" id="gas-pill-trial-3" style="opacity: 0.5;">Trial 3 (Emerald)</span>
        </div>

        <div class="lab-export-buttons-group">
          <button class="btn btn-secondary" id="btn-record-gas-trial" style="padding: 6px 12px; font-size: 0.8rem; gap: 6px; border-color: rgba(6,182,212,0.4); color: #06b6d4;">
            <span>📸 Log Current State</span>
          </button>
          <button class="btn btn-secondary" id="btn-export-gas-csv" style="padding: 6px 12px; font-size: 0.8rem; gap: 6px;">
            <span>📥 Export CSV Data</span>
          </button>
          <button class="btn btn-primary" id="btn-open-gas-report" style="padding: 6px 14px; font-size: 0.8rem; gap: 6px; background: linear-gradient(135deg, #0284c7, #0369a1); border: none;">
            <span>📑 Generate Lab Report</span>
          </button>
        </div>
      </div>

      <!-- Post-Lab Checkpoint Assessment Mount -->
      <div id="gas-checkpoint-container"></div>
    </div>
  `;

  const chamberCanvas = document.getElementById("gas-chamber-canvas");
  const chamberCtx = chamberCanvas.getContext("2d");
  const bzCanvas = document.getElementById("boltzmann-canvas");
  const bzCtx = bzCanvas.getContext("2d");
  const photoOverlay = document.getElementById("gas-photo-overlay");

  // State
  let volume = 22.4; // Liters
  let temperature = 298.15; // Kelvin
  let moles = 1.0; // mol
  let isHeating = false;
  let isCooling = false;
  let animId = null;

  class GasParticle {
    constructor(w, h, topY) {
      this.radius = 4;
      this.reposition(w, h, topY);
      this.recomputeVelocity();
    }

    reposition(w, h, topY) {
      const cLeft = 85;
      const cRight = w - 85;
      const cBottom = h - 75;
      this.x = cLeft + Math.random() * (cRight - cLeft);
      this.y = topY + 10 + Math.random() * (cBottom - topY - 20);
    }

    recomputeVelocity() {
      const baseSpeed = Math.sqrt(temperature / 298.15) * 3.2;
      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * baseSpeed;
      this.vy = Math.sin(angle) * baseSpeed;
    }

    update(w, h, topY) {
      this.x += this.vx;
      this.y += this.vy;

      const cLeft = 85;
      const cRight = w - 85;
      const cBottom = h - 75;

      if (this.x - this.radius < cLeft) {
        this.x = cLeft + this.radius;
        this.vx *= -1;
      } else if (this.x + this.radius > cRight) {
        this.x = cRight - this.radius;
        this.vx *= -1;
      }

      if (this.y - this.radius < topY) {
        this.y = topY + this.radius;
        this.vy *= -1;
      } else if (this.y + this.radius > cBottom) {
        this.y = cBottom - this.radius;
        this.vy *= -1;
      }
    }
  }

  let particles = [];
  function initParticles() {
    const dpr = window.devicePixelRatio || 1;
    const w = chamberCanvas.width / dpr;
    const h = chamberCanvas.height / dpr;
    const topY = getPistonY(h);

    const count = Math.round(moles * 40);
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(new GasParticle(w, h, topY));
    }
  }

  function getPistonY(h) {
    const minY = 65;
    const maxY = h - 145;
    const frac = (volume - 5.0) / (45.0 - 5.0);
    return maxY - frac * (maxY - minY);
  }

  function drawChamber() {
    const dpr = window.devicePixelRatio || 1;
    const w = chamberCanvas.width / dpr;
    const h = chamberCanvas.height / dpr;

    chamberCtx.save();
    chamberCtx.scale(dpr, dpr);
    chamberCtx.clearRect(0, 0, w, h);

    // 1. Dark Laboratory Ambient Chamber Background
    const bgGrad = chamberCtx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, "#080e1e");
    bgGrad.addColorStop(0.5, "#0f172a");
    bgGrad.addColorStop(1, "#182234");
    chamberCtx.fillStyle = bgGrad;
    chamberCtx.fillRect(0, 0, w, h);

    const topY = getPistonY(h);
    const cLeft = 75;
    const cRight = w - 75;
    const cWidth = cRight - cLeft;
    const cBottom = h - 65;

    // 2. Heat / Flame or Ice Bath
    if (isHeating) {
      const flameX = w / 2;
      const flameY = cBottom + 45;
      const flicker = Math.sin(Date.now() / 80) * 4;

      const fGrad = chamberCtx.createRadialGradient(flameX, flameY - 15, 4, flameX, flameY - 20, 36);
      fGrad.addColorStop(0, "#fef08a");
      fGrad.addColorStop(0.4, "#f59e0b");
      fGrad.addColorStop(0.8, "#ef4444");
      fGrad.addColorStop(1, "rgba(239, 68, 68, 0)");

      chamberCtx.fillStyle = fGrad;
      chamberCtx.shadowColor = "#f59e0b";
      chamberCtx.shadowBlur = 20;
      chamberCtx.beginPath();
      chamberCtx.ellipse(flameX, flameY - 20, 22 + flicker, 36, 0, 0, Math.PI * 2);
      chamberCtx.fill();
      chamberCtx.shadowBlur = 0;

      // Inner Blue Cone Flame
      chamberCtx.fillStyle = "rgba(56, 189, 248, 0.85)";
      chamberCtx.beginPath();
      chamberCtx.ellipse(flameX, flameY - 10, 10, 18, 0, 0, Math.PI * 2);
      chamberCtx.fill();
    } else if (isCooling) {
      chamberCtx.fillStyle = "rgba(56, 189, 248, 0.25)";
      chamberCtx.shadowColor = "#38bdf8";
      chamberCtx.shadowBlur = 16;
      chamberCtx.fillRect(cLeft - 8, cBottom, cWidth + 16, 35);
      chamberCtx.shadowBlur = 0;

      chamberCtx.fillStyle = "#38bdf8";
      chamberCtx.font = "bold 10px JetBrains Mono";
      chamberCtx.fillText("❄️ CRYO-JACKET ACTIVE", w/2 - 65, cBottom + 22);
    }

    // 3. Thick Borosilicate Glass Pressure Cylinder
    const glassGrad = chamberCtx.createLinearGradient(cLeft, 0, cRight, 0);
    glassGrad.addColorStop(0, "rgba(255, 255, 255, 0.12)");
    glassGrad.addColorStop(0.25, "rgba(255, 255, 255, 0.02)");
    glassGrad.addColorStop(0.75, "rgba(255, 255, 255, 0.04)");
    glassGrad.addColorStop(1, "rgba(255, 255, 255, 0.16)");
    chamberCtx.fillStyle = glassGrad;
    chamberCtx.fillRect(cLeft, 45, cWidth, cBottom - 45);

    // Graduation Ticks on Cylinder Wall
    chamberCtx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    chamberCtx.fillStyle = "rgba(255, 255, 255, 0.6)";
    chamberCtx.font = "8px JetBrains Mono";
    for (let vTick = 5; vTick <= 45; vTick += 5) {
      const tickFrac = (vTick - 5.0) / (45.0 - 5.0);
      const ty = (cBottom - 75) - tickFrac * ((cBottom - 75) - 65);
      chamberCtx.beginPath();
      chamberCtx.moveTo(cRight - 12, ty);
      chamberCtx.lineTo(cRight, ty);
      chamberCtx.stroke();
      chamberCtx.fillText(`${vTick}L`, cRight - 32, ty + 3);
    }

    // Heavy Metal Top & Bottom Flanges
    chamberCtx.fillStyle = "#334155";
    chamberCtx.fillRect(cLeft - 14, 40, cWidth + 28, 14);
    chamberCtx.fillRect(cLeft - 14, cBottom, cWidth + 28, 16);
    chamberCtx.strokeStyle = "rgba(56, 189, 248, 0.35)";
    chamberCtx.lineWidth = 1.5;
    chamberCtx.strokeRect(cLeft - 14, 40, cWidth + 28, 14);
    chamberCtx.strokeRect(cLeft - 14, cBottom, cWidth + 28, 16);

    // 4. Update & Draw 3D Gas Particles
    particles.forEach(p => {
      p.update(w, h, topY);

      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      let pColor = "#38bdf8";
      if (speed > 4.5) pColor = "#ef4444";
      else if (speed > 2.5) pColor = "#f59e0b";

      const pGrad = chamberCtx.createRadialGradient(p.x - 1.5, p.y - 1.5, 0.8, p.x, p.y, p.radius);
      pGrad.addColorStop(0, "#ffffff");
      pGrad.addColorStop(0.3, pColor);
      pGrad.addColorStop(1, "#0f172a");

      chamberCtx.fillStyle = pGrad;
      chamberCtx.beginPath();
      chamberCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      chamberCtx.fill();
    });

    // 5. Movable Weighted Pneumatic Piston Assembly
    const rodGrad = chamberCtx.createLinearGradient(w/2 - 8, 0, w/2 + 8, 0);
    rodGrad.addColorStop(0, "#94a3b8");
    rodGrad.addColorStop(0.5, "#ffffff");
    rodGrad.addColorStop(1, "#475569");
    chamberCtx.fillStyle = rodGrad;
    chamberCtx.fillRect(w/2 - 8, 10, 16, topY - 10);

    const pistonGrad = chamberCtx.createLinearGradient(cLeft, topY - 18, cRight, topY);
    pistonGrad.addColorStop(0, "#475569");
    pistonGrad.addColorStop(0.5, "#64748b");
    pistonGrad.addColorStop(1, "#1e293b");
    chamberCtx.fillStyle = pistonGrad;
    chamberCtx.fillRect(cLeft + 1, topY - 18, cWidth - 2, 18);
    chamberCtx.strokeStyle = "#38bdf8";
    chamberCtx.lineWidth = 1.5;
    chamberCtx.strokeRect(cLeft + 1, topY - 18, cWidth - 2, 18);

    chamberCtx.fillStyle = "#0f172a";
    chamberCtx.fillRect(cLeft + 1, topY - 6, cWidth - 2, 6);

    // 6. Cylinder Outer Glass Wall Highlights
    chamberCtx.strokeStyle = "rgba(255, 255, 255, 0.55)";
    chamberCtx.lineWidth = 2.5;
    chamberCtx.beginPath();
    chamberCtx.moveTo(cLeft, 45);
    chamberCtx.lineTo(cLeft, cBottom);
    chamberCtx.moveTo(cRight, 45);
    chamberCtx.lineTo(cRight, cBottom);
    chamberCtx.stroke();

    chamberCtx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    chamberCtx.lineWidth = 1.5;
    chamberCtx.beginPath();
    chamberCtx.moveTo(cLeft + 6, 50);
    chamberCtx.lineTo(cLeft + 6, cBottom - 5);
    chamberCtx.stroke();

    // 7. Analog Bourdon Gauge Callout Dial
    const gaugeX = cLeft - 30;
    const gaugeY = 120;
    const gaugeR = 26;

    // Brass Bezel
    chamberCtx.fillStyle = "#d97706";
    chamberCtx.beginPath();
    chamberCtx.arc(gaugeX, gaugeY, gaugeR + 3, 0, Math.PI * 2);
    chamberCtx.fill();

    // White dial face
    chamberCtx.fillStyle = "#f8fafc";
    chamberCtx.beginPath();
    chamberCtx.arc(gaugeX, gaugeY, gaugeR, 0, Math.PI * 2);
    chamberCtx.fill();

    // Pressure Needle
    const P_atm = (moles * 0.08206 * temperature) / volume;
    const needleAngle = -Math.PI * 0.75 + (Math.min(5.0, P_atm) / 5.0) * (Math.PI * 1.5);
    const jitter = (Math.random() - 0.5) * 0.04;

    chamberCtx.strokeStyle = "#ef4444";
    chamberCtx.lineWidth = 2;
    chamberCtx.beginPath();
    chamberCtx.moveTo(gaugeX, gaugeY);
    chamberCtx.lineTo(gaugeX + Math.cos(needleAngle + jitter) * (gaugeR - 5), gaugeY + Math.sin(needleAngle + jitter) * (gaugeR - 5));
    chamberCtx.stroke();

    chamberCtx.fillStyle = "#0f172a";
    chamberCtx.beginPath();
    chamberCtx.arc(gaugeX, gaugeY, 3, 0, Math.PI * 2);
    chamberCtx.fill();

    chamberCtx.restore();
  }

  // Draw Maxwell-Boltzmann Distribution Curve
  function drawBoltzmann() {
    const dpr = window.devicePixelRatio || 1;
    const w = bzCanvas.width / dpr;
    const h = bzCanvas.height / dpr;

    bzCtx.save();
    bzCtx.scale(dpr, dpr);
    bzCtx.clearRect(0, 0, w, h);

    bzCtx.fillStyle = "#090d16";
    bzCtx.fillRect(0, 0, w, h);

    const padLeft = 45;
    const padRight = 20;
    const padTop = 30;
    const padBottom = 35;
    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    bzCtx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    bzCtx.lineWidth = 1;
    for (let v = 0; v <= 1200; v += 200) {
      const x = padLeft + (v / 1200.0) * plotW;
      bzCtx.beginPath();
      bzCtx.moveTo(x, padTop);
      bzCtx.lineTo(x, padTop + plotH);
      bzCtx.stroke();

      bzCtx.fillStyle = "rgba(255, 255, 255, 0.4)";
      bzCtx.font = "9px JetBrains Mono";
      bzCtx.fillText(`${v}`, x - 10, padTop + plotH + 16);
    }

    bzCtx.fillStyle = "#94a3b8";
    bzCtx.font = "bold 10px JetBrains Mono";
    bzCtx.fillText("Molecular Speed v (m/s) [Nitrogen N₂]", padLeft + plotW/2 - 110, h - 8);

    const R = 8.314;
    const M = 0.028;
    const vRMS = Math.sqrt((3 * R * temperature) / M);
    const vMP = Math.sqrt((2 * R * temperature) / M);

    bzCtx.strokeStyle = "#f59e0b";
    bzCtx.lineWidth = 2.5;
    bzCtx.shadowColor = "#f59e0b";
    bzCtx.shadowBlur = 8;
    bzCtx.beginPath();

    const aConst = M / (2 * R * temperature);
    const maxVal = Math.pow(aConst, 1.5) * Math.pow(vMP, 2) * Math.exp(-aConst * vMP * vMP);

    for (let v = 0; v <= 1200; v += 10) {
      const val = Math.pow(aConst, 1.5) * Math.pow(v, 2) * Math.exp(-aConst * v * v);
      const normY = val / (maxVal * 1.15);
      const x = padLeft + (v / 1200.0) * plotW;
      const y = padTop + plotH - normY * plotH;
      if (v === 0) bzCtx.moveTo(x, y);
      else bzCtx.lineTo(x, y);
    }
    bzCtx.stroke();
    bzCtx.shadowBlur = 0;

    const rmsX = padLeft + (vRMS / 1200.0) * plotW;
    if (rmsX <= padLeft + plotW) {
      bzCtx.strokeStyle = "#10b981";
      bzCtx.lineWidth = 2;
      bzCtx.setLineDash([4, 4]);
      bzCtx.beginPath();
      bzCtx.moveTo(rmsX, padTop);
      bzCtx.lineTo(rmsX, padTop + plotH);
      bzCtx.stroke();
      bzCtx.setLineDash([]);

      bzCtx.fillStyle = "#10b981";
      bzCtx.font = "bold 10px JetBrains Mono";
      bzCtx.fillText(`v_rms=${Math.round(vRMS)}m/s`, rmsX + 4, padTop + 24);
    }

    bzCtx.restore();
  }

  function updateTelemetry() {
    const R_atm = 0.08206;
    const P_atm = (moles * R_atm * temperature) / volume;

    document.getElementById("disp-digital-pressure").innerText = `${P_atm.toFixed(2)} atm`;
    document.getElementById("disp-temp-kelvin").innerText = `${temperature.toFixed(1)} K`;
    document.getElementById("disp-volume").innerText = `${volume.toFixed(1)} L`;
    document.getElementById("disp-temp").innerText = `${Math.round(temperature)} K (${Math.round(temperature - 273.15)}°C)`;
    document.getElementById("disp-moles").innerText = `${moles.toFixed(2)} mol`;

    const vRMS = Math.sqrt((3 * 8.314 * temperature) / 0.028);
    document.getElementById("rms-badge").innerText = `v_rms = ${Math.round(vRMS)} m/s (N₂)`;

    const avgKE = 1.5 * 1.3806e-23 * temperature;
    document.getElementById("val-ke").innerText = `${(avgKE * 1e21).toFixed(2)} × 10⁻²¹ J`;

    const collFreq = Math.round(P_atm * 1420);
    document.getElementById("val-freq").innerText = `${collFreq.toLocaleString()} coll/s`;

    const statusBadge = document.getElementById("gas-status");
    const statusDot = document.getElementById("gas-status-dot");
    if (P_atm > 3.0) {
      statusBadge.innerText = "⚠️ High Pressure Warning";
      statusDot.style.background = "#ef4444";
    } else {
      statusBadge.innerText = "Gas Equilibrium Stable";
      statusDot.style.background = "#10b981";
    }
  }

  function renderLoop() {
    drawChamber();
    drawBoltzmann();
    animId = requestAnimationFrame(renderLoop);
  }

  initParticles();
  updateTelemetry();
  renderLoop();

  // Control Handlers
  const inVol = document.getElementById("input-volume");
  const inTemp = document.getElementById("input-temp");
  const inMoles = document.getElementById("input-moles");

  inVol.addEventListener("input", (e) => {
    volume = parseFloat(e.target.value);
    updateTelemetry();
  });

  inTemp.addEventListener("input", (e) => {
    temperature = parseFloat(e.target.value);
    particles.forEach(p => p.recomputeVelocity());
    updateTelemetry();
  });

  inMoles.addEventListener("input", (e) => {
    moles = parseFloat(e.target.value);
    initParticles();
    updateTelemetry();
  });

  document.getElementById("btn-heat-burner").addEventListener("click", () => {
    isHeating = true;
    isCooling = false;
    temperature = Math.min(600, temperature + 50);
    inTemp.value = temperature;
    particles.forEach(p => p.recomputeVelocity());
    updateTelemetry();
    setTimeout(() => { isHeating = false; }, 1800);
  });

  document.getElementById("btn-cool-ice").addEventListener("click", () => {
    isCooling = true;
    isHeating = false;
    temperature = Math.max(100, temperature - 50);
    inTemp.value = temperature;
    particles.forEach(p => p.recomputeVelocity());
    updateTelemetry();
    setTimeout(() => { isCooling = false; }, 1800);
  });

  document.getElementById("btn-law-boyle").addEventListener("click", () => {
    temperature = 298.15;
    inTemp.value = 298;
    moles = 1.0;
    inMoles.value = 1.0;
    volume = 11.2;
    inVol.value = 11.2;
    particles.forEach(p => p.recomputeVelocity());
    updateTelemetry();
  });

  document.getElementById("btn-law-charles").addEventListener("click", () => {
    temperature = 546.3;
    inTemp.value = 546;
    moles = 1.0;
    inMoles.value = 1.0;
    volume = 44.8;
    inVol.value = 44.8;
    particles.forEach(p => p.recomputeVelocity());
    updateTelemetry();
  });

  document.getElementById("btn-reset-gas").addEventListener("click", () => {
    volume = 22.4;
    temperature = 298.15;
    moles = 1.0;
    inVol.value = 22.4;
    inTemp.value = 298;
    inMoles.value = 1.0;
    isHeating = false;
    isCooling = false;
    initParticles();
    updateTelemetry();
  });

  // View Switcher
  const btnSim = document.getElementById("gas-mode-sim");
  const btnPhoto = document.getElementById("gas-mode-photo");

  btnSim.addEventListener("click", () => {
    photoOverlay.style.display = "none";
    btnSim.style.background = "rgba(6, 182, 212, 0.25)";
    btnSim.style.color = "#38bdf8";
    btnPhoto.style.background = "transparent";
    btnPhoto.style.color = "#94a3b8";
  });

  btnPhoto.addEventListener("click", () => {
    photoOverlay.style.display = "block";
    btnPhoto.style.background = "rgba(6, 182, 212, 0.25)";
    btnPhoto.style.color = "#38bdf8";
    btnSim.style.background = "transparent";
    btnSim.style.color = "#94a3b8";
  });

  // Telemetry Suite: Record Current State as Trial
  document.getElementById("btn-record-gas-trial")?.addEventListener("click", () => {
    const R_atm = 0.08206;
    const P_atm = (moles * R_atm * temperature) / volume;
    const vRMS = Math.sqrt((3 * 8.314 * temperature) / 0.028);

    LabTrialStore.addTrial("gaslaws", {
      measurements: {
        "Pressure (atm)": parseFloat(P_atm.toFixed(2)),
        "Volume (L)": parseFloat(volume.toFixed(1)),
        "Temperature (K)": parseFloat(temperature.toFixed(1)),
        "Amount (mol)": parseFloat(moles.toFixed(2)),
        "v_rms (m/s)": Math.round(vRMS)
      }
    });

    const trials = LabTrialStore.getTrials("gaslaws");
    trials.forEach((tr, i) => {
      const pill = document.getElementById(`gas-pill-trial-${i + 1}`);
      if (pill) {
        pill.style.opacity = "1";
        pill.innerText = `Trial ${tr.trialNumber}: P=${tr.measurements["Pressure (atm)"]} atm, V=${tr.measurements["Volume (L)"]} L, T=${tr.measurements["Temperature (K)"]} K`;
      }
    });
  });

  // Telemetry Suite: Export CSV
  document.getElementById("btn-export-gas-csv")?.addEventListener("click", () => {
    const R_atm = 0.08206;
    const P_atm = (moles * R_atm * temperature) / volume;
    const vRMS = Math.sqrt((3 * 8.314 * temperature) / 0.028);

    exportLabDataCsv({
      title: "Kinetic Molecular Theory & Ideal Gas Metrology",
      labId: "gaslaws",
      parameters: {
        "Enclosed Volume (V)": `${volume.toFixed(1)} L`,
        "Thermal Energy (T)": `${temperature.toFixed(1)} K`,
        "Gas Substance (n)": `${moles.toFixed(2)} mol`,
        "Gas Constant (R)": "0.08206 L·atm/(mol·K)"
      },
      headers: ["Pressure (atm)", "Volume (L)", "Temperature (K)", "Moles (mol)", "v_rms (m/s)", "Kinetic Energy (J)"],
      dataRows: [
        [
          parseFloat(P_atm.toFixed(3)),
          volume,
          temperature,
          moles,
          Math.round(vRMS),
          parseFloat((1.5 * 1.3806e-23 * temperature).toExponential(3))
        ]
      ]
    });
  });

  // Telemetry Suite: Generate Lab Report
  document.getElementById("btn-open-gas-report")?.addEventListener("click", () => {
    const trials = LabTrialStore.getTrials("gaslaws");
    const R_atm = 0.08206;
    const P_atm = (moles * R_atm * temperature) / volume;
    const vRMS = Math.sqrt((3 * 8.314 * temperature) / 0.028);

    openLabReportModal({
      title: "Gas Laws, Pressure-Volume Thermodynamics & Molecular Velocities",
      subject: "Chemistry",
      inquiryQuestion: "How do temperature, volume, and molar quantity quantitatively govern macroscopic gas pressure and Maxwell-Boltzmann molecular velocity?",
      parameters: {
        "Chamber Volume (V)": `${volume.toFixed(1)} L`,
        "Absolute Temperature (T)": `${temperature.toFixed(1)} K`,
        "Molar Quantity (n)": `${moles.toFixed(2)} mol`,
        "Instantaneous Pressure (P)": `${P_atm.toFixed(2)} atm`,
        "RMS Molecular Velocity": `${Math.round(vRMS)} m/s (N₂)`
      },
      trials,
      formulas: [
        "P \\cdot V = n R T",
        "P_1 V_1 = P_2 V_2 \\quad (\\text{Boyle's Law, const. } T, n)",
        "\\frac{V_1}{T_1} = \\frac{V_2}{T_2} \\quad (\\text{Charles's Law, const. } P, n)",
        "v_{\\text{rms}} = \\sqrt{\\frac{3RT}{M}}"
      ]
    });
  });

  // Mount Post-Lab Checkpoint Assessment
  mountLabCheckpoint("gas-checkpoint-container", "gaslaws");

  function handleResize() {
    const rect1 = chamberCanvas.getBoundingClientRect();
    const rect2 = bzCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    chamberCanvas.width = rect1.width * dpr;
    chamberCanvas.height = 520 * dpr;
    bzCanvas.width = rect2.width * dpr;
    bzCanvas.height = 330 * dpr;
  }
  window.addEventListener("resize", handleResize);
  handleResize();

  return () => {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("resize", handleResize);
  };
}
