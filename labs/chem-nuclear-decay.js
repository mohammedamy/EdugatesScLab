// Edugates-ClipSAT Science Labs - Chemistry: Radioactive Decay & Nuclear Kinetics Suite
// 60 FPS Precision Nuclear Physics Simulation:
// N(t) = N₀ e^(-λt) = N₀ (1/2)^(t / t₁/₂), Half-Life t₁/₂ = ln(2)/λ,
// Geiger-Müller Counter CPM, Alpha (α) / Beta (β) / Gamma (γ) Particle Radiation, and Shielding Attenuation.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initNuclearDecayLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const ISOTOPES = {
    c14: { name: "Carbon-14 (¹⁴C)", mode: "Beta (β⁻)", halfLife: 5.73, unit: "kyr", daughter: "Nitrogen-14 (¹⁴N)", color: "#38bdf8", rayColor: "#38bdf8", type: "beta" },
    i131: { name: "Iodine-131 (¹³¹I)", mode: "Beta / Gamma (β⁻/γ)", halfLife: 8.0, unit: "days", daughter: "Xenon-131 (¹³¹Xe)", color: "#c026d3", rayColor: "#ec4899", type: "mixed" },
    co60: { name: "Cobalt-60 (⁶⁰Co)", mode: "Beta / Gamma (β⁻/γ)", halfLife: 5.27, unit: "years", daughter: "Nickel-60 (⁶⁰Ni)", color: "#f59e0b", rayColor: "#facc15", type: "gamma" },
    ra226: { name: "Radium-226 (²²⁶Ra)", mode: "Alpha (α)", halfLife: 1.60, unit: "kyr", daughter: "Radon-222 (²²²Rn)", color: "#10b981", rayColor: "#34d399", type: "alpha" }
  };

  let currentIsoKey = "i131";
  let initialNucleiCount = 400;
  let remainingNuclei = initialNucleiCount;
  let decayedNuclei = 0;
  let elapsedTime = 0; // in half-life units
  let timeScale = 1.0;
  let shielding = "none"; // 'none', 'paper', 'aluminum', 'lead'
  let isRunning = true;
  let animId = null;

  // Discrete particles & shockwave animations
  let atoms = [];
  const emittedRays = [];
  const decayHistory = [];
  const decayFlashes = [];
  let tubeDischargeIntensity = 0;
  let meterNeedleValue = 0;

  function resetAtoms() {
    atoms = [];
    remainingNuclei = initialNucleiCount;
    decayedNuclei = 0;
    elapsedTime = 0;
    decayHistory.length = 0;
    emittedRays.length = 0;
    decayFlashes.length = 0;

    for (let i = 0; i < initialNucleiCount; i++) {
      atoms.push({
        x: 65 + Math.random() * 220,
        y: 165 + Math.random() * 230,
        decayed: false,
        pulseOffset: Math.random() * Math.PI * 2,
        coreRadius: 3.2 + Math.random() * 1.0,
        daughterAngle: Math.random() * Math.PI * 2
      });
    }
    decayHistory.push({ t: 0, n: remainingNuclei });
  }

  resetAtoms();

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #ef4444; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #ef4444; box-shadow: 0 0 10px #ef4444;"></span>
            Radioactive Decay &amp; Nuclear Kinetics Suite
          </span>
          <span class="badge" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            ${renderLatex("N(t) = N_0 e^{-\\lambda t} \\quad \\bullet \\quad t_{1/2} = \\frac{\\ln 2}{\\lambda}")}
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-decay-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Kinetics Simulator
            </button>
            <button id="view-mode-decay-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-decay-toggle" style="padding: 5px 14px; font-size: 0.78rem;">
            ${isRunning ? "⏸ Pause" : "▶ Resume"}
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-decay-reset" style="padding: 5px 12px; font-size: 0.78rem;">
            ⟲ Reset Sample
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-decay-export" title="Export experimental telemetry to RFC-4180 CSV (Hotkey: E)" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export CSV (E)
          </button>
        </div>
      </div>

      <!-- Main Grid -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="decay-layout">
        <!-- Canvas Viewport -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(239, 68, 68, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #1e0b0b 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="decay-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
          <div id="decay-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <picture>
              <source srcset="assets/labs/nuclear_decay_bench.webp" type="image/webp">
              <img src="assets/labs/nuclear_decay_bench.jpg" decoding="async" loading="lazy" alt="4K Nuclear Physics & Radiochemistry Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            </picture>
            
            <!-- Live Analytical Telemetry Callout on Photo -->
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Geiger-Müller Scintillation Unit</div>
                <div style="color: #f87171; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Halogen-Quenched BNC Probe</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Lead Attenuation Shield Stand</div>
                <div style="color: #facc15; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">μ = 0.77 cm⁻¹ (γ-Shielding)</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Digital Scaler Ratemeter</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">High-Precision Nuclear Counts</div>
              </div>
            </div>
          </div>

          <!-- Top HUD -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">NUCLEI REMAINING N(t)</div>
              <div id="hud-decay-nuclei" style="font-size: 1.15rem; font-weight: 800; color: #f87171; font-family: var(--font-mono);">
                ${remainingNuclei} / ${initialNucleiCount} (100.0%)
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">GEIGER COUNTER CPM</div>
              <div id="hud-decay-cpm" style="font-size: 1.15rem; font-weight: 800; color: #10b981; font-family: var(--font-mono);">
                0 CPM
              </div>
            </div>
          </div>
        </div>

        <!-- Controls & Plot -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Controls Panel -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #f87171; text-transform: uppercase; margin-bottom: 12px;">Nuclear Sample Parameters</div>
            
            <div style="margin-bottom: 12px;">
              <label style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Radioactive Isotope</label>
              <select id="select-decay-iso" class="form-control" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                ${Object.entries(ISOTOPES).map(([k, iso]) => `<option value="${k}" ${k === currentIsoKey ? "selected" : ""}>${iso.name} [${iso.mode}] - t½ = ${iso.halfLife} ${iso.unit}</option>`).join("")}
              </select>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div>
                <label style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Radiation Shielding</label>
                <select id="select-decay-shield" class="form-control" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                  <option value="none">None (Air Barrier)</option>
                  <option value="paper">Paper Sheet (0.1 mm)</option>
                  <option value="aluminum">Aluminum Plate (2.0 mm)</option>
                  <option value="lead">Lead Brick (20.0 mm)</option>
                </select>
              </div>
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                  <span style="color: #94a3b8;">Initial Atoms N₀</span>
                  <span id="lbl-decay-n0" style="color: #f87171; font-family: var(--font-mono); font-weight: 700;">400</span>
                </div>
                <input type="range" id="slider-decay-n0" min="100" max="600" step="50" value="400" style="width: 100%;">
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                <span style="color: #94a3b8;">Simulation Time Multiplier</span>
                <span id="lbl-decay-speed" style="color: #f59e0b; font-family: var(--font-mono); font-weight: 700;">1.0×</span>
              </div>
              <input type="range" id="slider-decay-speed" min="0.2" max="3.0" step="0.2" value="1.0" style="width: 100%;">
            </div>
          </div>

          <!-- Exponential Decay Plot -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; flex: 1; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.75rem; font-weight: 700; color: #f87171; text-transform: uppercase;">Decay Kinematics: N(t) vs Half-Lives</span>
              <span id="lbl-half-life-counter" style="font-size: 0.72rem; color: #f59e0b; font-family: var(--font-mono);">0.00 t½ elapsed</span>
            </div>
            <canvas id="decay-plot-canvas" width="450" height="210" style="width: 100%; height: 210px; background: #090d16; border-radius: 8px; border: 1px solid #1e293b;"></canvas>
          </div>
        </div>
      </div>

      <!-- Post-Lab Checkpoint Assessment -->
      <div id="decay-checkpoint-container" style="margin-top: 24px;"></div>
    </div>
  `;

  const canvas = container.querySelector("#decay-canvas");
  const ctx = canvas.getContext("2d");
  const plotCanvas = container.querySelector("#decay-plot-canvas");
  const plotCtx = plotCanvas.getContext("2d");

  const logicalW = 580;
  const logicalH = 530;
  const plotLogicalW = 450;
  const plotLogicalH = 210;

  function setupHiDPICanvas() {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : Math.min(window.devicePixelRatio || 1, 2);
    if (canvas) {
      canvas.width = Math.round(logicalW * dpr);
      canvas.height = Math.round(logicalH * dpr);
    }
    if (plotCanvas) {
      plotCanvas.width = Math.round(plotLogicalW * dpr);
      plotCanvas.height = Math.round(plotLogicalH * dpr);
    }
  }

  setupHiDPICanvas();
  window.addEventListener("resize", setupHiDPICanvas);

  let geigerCpm = 0;
  let decayLambda = Math.log(2) / 1.0; // in half-lives

  function getShieldingEfficiency(mode, shield) {
    if (shield === "none") return 1.0;
    if (mode.includes("Alpha")) {
      return 0.0; // Alpha stopped by paper
    }
    if (mode.includes("Beta")) {
      if (shield === "paper") return 0.85; // Beta penetrates paper
      return 0.02; // Aluminum stops Beta
    }
    // Gamma
    if (shield === "paper") return 0.98;
    if (shield === "aluminum") return 0.85;
    if (shield === "lead") return 0.15; // Lead attenuates Gamma significantly
    return 1.0;
  }

  function renderFrame() {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : Math.min(window.devicePixelRatio || 1, 2);
    ctx.save();
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, logicalW, logicalH);

    const iso = ISOTOPES[currentIsoKey];

    // 1. Advance Decay Kinetics
    if (isRunning) {
      const dt = (0.016 * timeScale) / 3.0; // half-lives per step
      elapsedTime += dt;
      const decayProb = 1 - Math.exp(-decayLambda * dt);

      let newlyDecayedThisFrame = 0;
      atoms.forEach(atom => {
        if (!atom.decayed && Math.random() < decayProb) {
          atom.decayed = true;
          decayedNuclei++;
          remainingNuclei--;
          newlyDecayedThisFrame++;

          // Create expanding shockwave flash
          decayFlashes.push({
            x: atom.x,
            y: atom.y,
            r: 4,
            maxR: 24,
            alpha: 1.0,
            color: iso.color
          });

          // Emit radiation ray towards detector aperture
          const targetY = 240 + (Math.random() - 0.5) * 60;
          const dx = 430 - atom.x;
          const dy = targetY - atom.y;
          const dist = Math.hypot(dx, dy);
          const speed = 7.5;

          emittedRays.push({
            x: atom.x,
            y: atom.y,
            vx: (dx / dist) * speed,
            vy: (dy / dist) * speed,
            startX: atom.x,
            startY: atom.y,
            life: 1.0,
            type: iso.type,
            wavePhase: Math.random() * Math.PI * 2
          });
        }
      });

      // Update Geiger Counter CPM with Poisson and Shielding
      const shieldFactor = getShieldingEfficiency(iso.mode, shielding);
      const targetCpm = newlyDecayedThisFrame * 60 * 50 * shieldFactor;
      geigerCpm = geigerCpm * 0.92 + targetCpm * 0.08;

      if (newlyDecayedThisFrame > 0 && Math.random() < 0.3) {
        tubeDischargeIntensity = Math.min(1.0, tubeDischargeIntensity + 0.6);
        try { SoundFX.playClick(); } catch (e) {}
      }

      // Record History every ~0.08 half-lives
      if (decayHistory.length === 0 || elapsedTime - decayHistory[decayHistory.length - 1].t >= 0.08) {
        decayHistory.push({ t: elapsedTime, n: remainingNuclei });
      }
    }

    tubeDischargeIntensity = Math.max(0, tubeDischargeIntensity - 0.08);
    meterNeedleValue = meterNeedleValue * 0.90 + geigerCpm * 0.10;

    // 2. Draw Radiochemistry Cleanroom Environment & Benchtop
    drawWorkbenchEnclosure(ctx);

    // 3. Draw Heavy Lead Shielded Castle Chamber
    drawLeadChamber(ctx, iso);

    // 4. Draw Nuclei & Energetic Shockwave Bursts
    drawNuclei(ctx, iso);

    // 5. Draw Shielding Station & Guides
    drawShieldingAssembly(ctx);

    // 6. Draw Emitted Particle Rays with Mode Physics
    drawRays(ctx, iso);

    // 7. Draw Geiger-Müller Scintillation Probe & Scaler Ratemeter
    drawGeigerApparatus(ctx);

    // Update HUD Text
    const hudN = container.querySelector("#hud-decay-nuclei");
    const hudCpm = container.querySelector("#hud-decay-cpm");
    const lblHalf = container.querySelector("#lbl-half-life-counter");
    if (hudN) hudN.innerText = `${remainingNuclei} / ${initialNucleiCount} (${((remainingNuclei / initialNucleiCount) * 100).toFixed(1)}%)`;
    if (hudCpm) hudCpm.innerText = `${Math.round(geigerCpm)} CPM`;
    if (lblHalf) lblHalf.innerText = `${elapsedTime.toFixed(2)} t½ elapsed`;

    ctx.restore();
    renderDecayPlot();
  }

  function drawWorkbenchEnclosure(ctx) {
    // Cleanroom background grid
    ctx.strokeStyle = "rgba(239, 68, 68, 0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < logicalW; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, logicalH);
      ctx.stroke();
    }
    for (let y = 0; y < logicalH; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(logicalW, y);
      ctx.stroke();
    }

    // Heavy stainless steel workbench surface (y: 470 to 530)
    const benchGrad = ctx.createLinearGradient(0, 465, 0, 530);
    benchGrad.addColorStop(0, "#334155");
    benchGrad.addColorStop(0.08, "#1e293b");
    benchGrad.addColorStop(0.3, "#0f172a");
    benchGrad.addColorStop(1, "#020617");
    ctx.fillStyle = benchGrad;
    ctx.fillRect(0, 465, logicalW, 65);

    // Brushed benchtop chamfer line
    ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 465);
    ctx.lineTo(logicalW, 465);
    ctx.stroke();

    // Laser optical alignment beamline along y=240
    ctx.strokeStyle = "rgba(239, 68, 68, 0.15)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(40, 240);
    ctx.lineTo(540, 240);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawLeadChamber(ctx, iso) {
    const chX = 40;
    const chY = 110;
    const chW = 275;
    const chH = 340;

    // Chamber drop shadow
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.85)";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 12;
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.roundRect(chX, chY, chW, chH, 12);
    ctx.fill();
    ctx.restore();

    // Heavy Interlocking Lead Castle Wall
    const leadGrad = ctx.createLinearGradient(chX, chY, chX + chW, chY + chH);
    leadGrad.addColorStop(0, "#475569");
    leadGrad.addColorStop(0.5, "#334155");
    leadGrad.addColorStop(1, "#1e293b");
    ctx.fillStyle = leadGrad;
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(chX, chY, chW, chH, 12);
    ctx.fill();
    ctx.stroke();

    // Lead Brick Interlocking Seams
    ctx.strokeStyle = "rgba(15, 23, 42, 0.6)";
    ctx.lineWidth = 1.5;
    for (let by = chY + 50; by < chY + chH; by += 55) {
      ctx.beginPath();
      ctx.moveTo(chX, by);
      ctx.lineTo(chX + chW, by);
      ctx.stroke();
    }
    for (let bx = chX + 60; bx < chX + chW; bx += 70) {
      ctx.beginPath();
      ctx.moveTo(bx, chY);
      ctx.lineTo(bx, chY + 50);
      ctx.stroke();
    }

    // Inner Radioprotective Specimen Cavity
    const cavX = chX + 16;
    const cavY = chY + 45;
    const cavW = chW - 32;
    const cavH = chH - 60;
    const cavGrad = ctx.createRadialGradient(cavX + cavW / 2, cavY + cavH / 2, 20, cavX + cavW / 2, cavY + cavH / 2, cavW);
    cavGrad.addColorStop(0, "#1c0b0b");
    cavGrad.addColorStop(0.8, "#0a0303");
    cavGrad.addColorStop(1, "#020101");
    ctx.fillStyle = cavGrad;
    ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cavX, cavY, cavW, cavH, 8);
    ctx.fill();
    ctx.stroke();

    // Collimator Exit Port on Right Wall
    const portY = 215;
    const portH = 50;
    ctx.fillStyle = "#020101";
    ctx.fillRect(chX + chW - 16, portY, 16, portH);
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(chX + chW - 16, portY, 16, portH);

    // Chamber Header Bar & Radioactive Warning Trefoil
    ctx.fillStyle = "#facc15";
    ctx.font = "900 13px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("☢ HOT CELL", chX + 16, chY + 28);

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.fillText(iso.name, chX + 115, chY + 28);

    // Specimen Elevator Stage at Chamber Bottom
    const stageY = chY + chH - 35;
    ctx.fillStyle = "#64748b";
    ctx.fillRect(cavX + 35, stageY, cavW - 70, 10);
    // Knurled elevator screw
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(cavX + cavW / 2 - 8, stageY + 10, 16, 15);
  }

  function drawNuclei(ctx, iso) {
    // 1. Draw Shockwave Rings
    for (let i = decayFlashes.length - 1; i >= 0; i--) {
      const f = decayFlashes[i];
      f.r += 1.2;
      f.alpha -= 0.045;
      if (f.alpha <= 0 || f.r >= f.maxR) {
        decayFlashes.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.strokeStyle = f.color;
      ctx.globalAlpha = Math.max(0, f.alpha);
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Draw Atoms
    atoms.forEach(atom => {
      ctx.beginPath();
      ctx.arc(atom.x, atom.y, atom.coreRadius, 0, Math.PI * 2);

      if (!atom.decayed) {
        // Undecayed parent isotope: glowing 3D sphere with orbital quantum sheen
        const grad = ctx.createRadialGradient(atom.x - 1, atom.y - 1, 0.5, atom.x, atom.y, atom.coreRadius + 2);
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.3, iso.color);
        grad.addColorStop(0.9, iso.color);
        grad.addColorStop(1, "rgba(0,0,0,0.4)");
        ctx.fillStyle = grad;
        ctx.shadowColor = iso.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        // Decayed daughter isotope: stable metallic slate / inert noble gas
        const dGrad = ctx.createRadialGradient(atom.x - 0.8, atom.y - 0.8, 0.5, atom.x, atom.y, atom.coreRadius);
        dGrad.addColorStop(0, "#94a3b8");
        dGrad.addColorStop(0.6, "#475569");
        dGrad.addColorStop(1, "#1e293b");
        ctx.fillStyle = dGrad;
        ctx.shadowBlur = 0;
        ctx.fill();
        ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    });
  }

  function drawShieldingAssembly(ctx) {
    const rackX = 345;
    const rackY = 120;
    const rackH = 320;

    // Optical guide rails top and bottom
    ctx.fillStyle = "#334155";
    ctx.fillRect(rackX - 10, rackY - 14, 46, 12);
    ctx.fillRect(rackX - 10, rackY + rackH + 2, 46, 12);
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 1;
    ctx.strokeRect(rackX - 10, rackY - 14, 46, 12);
    ctx.strokeRect(rackX - 10, rackY + rackH + 2, 46, 12);

    if (shielding === "none") {
      // Empty slot with guide channel lines
      ctx.strokeStyle = "rgba(71, 85, 105, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(rackX, rackY, 26, rackH);
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(148, 163, 184, 0.5)";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.save();
      ctx.translate(rackX + 13, rackY + rackH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("AIR GAP", 0, 0);
      ctx.restore();
      return;
    }

    let shieldW = 8;
    let sColor1 = "#fef08a";
    let sColor2 = "#fde047";
    let sBorder = "#facc15";
    let sLabel = "PAPER (0.1 mm)";

    if (shielding === "aluminum") {
      shieldW = 16;
      sColor1 = "#cbd5e1";
      sColor2 = "#64748b";
      sBorder = "#94a3b8";
      sLabel = "ALUMINUM (2.0 mm)";
    } else if (shielding === "lead") {
      shieldW = 32;
      sColor1 = "#475569";
      sColor2 = "#0f172a";
      sBorder = "#64748b";
      sLabel = "LEAD (20.0 mm)";
    }

    const sx = rackX + (26 - shieldW) / 2;
    const grad = ctx.createLinearGradient(sx, rackY, sx + shieldW, rackY);
    grad.addColorStop(0, sColor1);
    grad.addColorStop(0.3, sColor1);
    grad.addColorStop(0.8, sColor2);
    grad.addColorStop(1, "#0f172a");

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 10;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(sx, rackY, shieldW, rackH, 3);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = sBorder;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(sx, rackY, shieldW, rackH);

    // Vertical label on shield plate
    ctx.save();
    ctx.translate(sx + shieldW / 2, rackY + rackH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = shielding === "paper" ? "#713f12" : "#f8fafc";
    ctx.font = "900 10px monospace";
    ctx.textAlign = "center";
    ctx.fillText(sLabel, 0, 3);
    ctx.restore();
  }

  function drawRays(ctx, iso) {
    const shieldX = 345;
    const shieldW = shielding === "none" ? 0 : (shielding === "paper" ? 8 : (shielding === "aluminum" ? 16 : 32));
    const sx = shieldX + (26 - shieldW) / 2;

    for (let i = emittedRays.length - 1; i >= 0; i--) {
      const ray = emittedRays[i];
      ray.x += ray.vx;
      ray.y += ray.vy;
      ray.life -= 0.022;
      ray.wavePhase += 0.45;

      // Shield collision check
      if (shielding !== "none" && ray.x >= sx && ray.x <= sx + shieldW) {
        if (Math.random() > getShieldingEfficiency(iso.mode, shielding)) {
          // Ray absorbed by shield! Create tiny impact spark
          decayFlashes.push({
            x: sx,
            y: ray.y,
            r: 2,
            maxR: 8,
            alpha: 0.8,
            color: "#ffffff"
          });
          emittedRays.splice(i, 1);
          continue;
        }
      }

      // Check arrival at Geiger-Müller Mica Window (x: 420, y: 220-270)
      if (ray.x >= 420 && ray.x <= 435 && ray.y >= 215 && ray.y <= 270) {
        tubeDischargeIntensity = 1.0;
        emittedRays.splice(i, 1);
        continue;
      }

      if (ray.life <= 0 || ray.x > 570) {
        emittedRays.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, ray.life);

      if (ray.type === "alpha") {
        // Alpha particle: Heavy Helium-4 nucleus (charge +2), thick dual-filament emerald ionization track
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 3.8;
        ctx.shadowColor = "#34d399";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(ray.x, ray.y);
        ctx.lineTo(ray.x - ray.vx * 2.2, ray.y - ray.vy * 2.2);
        ctx.stroke();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ray.x, ray.y);
        ctx.lineTo(ray.x - ray.vx * 1.2, ray.y - ray.vy * 1.2);
        ctx.stroke();
      } else if (ray.type === "gamma") {
        // Gamma radiation: Transverse oscillating sinusoidal electromagnetic wave packet
        ctx.strokeStyle = "#facc15";
        ctx.lineWidth = 2.2;
        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        for (let s = 0; s < 18; s += 2) {
          const px = ray.x - ray.vx * (s / 7.5);
          const wave = Math.sin(ray.wavePhase - s * 0.6) * 4.5;
          const py = ray.y - ray.vy * (s / 7.5) + wave;
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      } else {
        // Beta particle: High-velocity electron, zigzagging electric cyan trajectory
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2.2;
        ctx.shadowColor = "#0284c7";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(ray.x, ray.y);
        ctx.lineTo(ray.x - ray.vx * 1.2 + (Math.sin(ray.wavePhase) * 2), ray.y - ray.vy * 1.2);
        ctx.lineTo(ray.x - ray.vx * 2.5, ray.y - ray.vy * 2.5);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  function drawGeigerApparatus(ctx) {
    const probeX = 415;
    const probeY = 215;
    const probeW = 145;
    const probeH = 50;

    // 1. GM Cylindrical Probe Housing (Optical Rail Mounted)
    const probeGrad = ctx.createLinearGradient(probeX, probeY, probeX, probeY + probeH);
    probeGrad.addColorStop(0, "#94a3b8");
    probeGrad.addColorStop(0.2, "#f1f5f9");
    probeGrad.addColorStop(0.5, "#64748b");
    probeGrad.addColorStop(0.85, "#334155");
    probeGrad.addColorStop(1, "#1e293b");

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 14;
    ctx.fillStyle = probeGrad;
    ctx.beginPath();
    ctx.roundRect(probeX + 12, probeY, probeW - 12, probeH, 8);
    ctx.fill();
    ctx.restore();

    // Chrome body highlight line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(probeX + 18, probeY + 8);
    ctx.lineTo(probeX + probeW - 10, probeY + 8);
    ctx.stroke();

    // Thin Mica End-Window (left entrance face)
    const micaGrad = ctx.createLinearGradient(probeX, probeY + 6, probeX + 12, probeY + probeH - 6);
    micaGrad.addColorStop(0, "#38bdf8");
    micaGrad.addColorStop(0.5, "#ec4899");
    micaGrad.addColorStop(1, "#facc15");
    ctx.fillStyle = micaGrad;
    ctx.fillRect(probeX, probeY + 6, 12, probeH - 12);
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(probeX, probeY + 6, 12, probeH - 12);

    // Viewing Cutaway Slot showing internal Townsend Avalanche discharge
    const slotX = probeX + 30;
    const slotY = probeY + 12;
    const slotW = 75;
    const slotH = 26;
    ctx.fillStyle = "#020617";
    ctx.fillRect(slotX, slotY, slotW, slotH);
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1;
    ctx.strokeRect(slotX, slotY, slotW, slotH);

    // Central Tungsten Anode Wire (+900 V)
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(slotX, slotY + slotH / 2);
    ctx.lineTo(slotX + slotW, slotY + slotH / 2);
    ctx.stroke();

    // Townsend Avalanche Ionization Discharge Flash inside tube
    if (tubeDischargeIntensity > 0.05) {
      ctx.save();
      ctx.fillStyle = `rgba(239, 68, 68, ${tubeDischargeIntensity * 0.85})`;
      ctx.shadowColor = "#ef4444";
      ctx.shadowBlur = 16;
      ctx.fillRect(slotX, slotY, slotW, slotH);

      // Core plasma glow
      ctx.fillStyle = `rgba(255, 255, 255, ${tubeDischargeIntensity * 0.95})`;
      ctx.fillRect(slotX + 10, slotY + slotH / 2 - 2, slotW - 20, 4);
      ctx.restore();
    }

    // Probe Label
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "left";
    ctx.fillText("GM PROBE +900V", probeX + 32, probeY + probeH - 3);

    // 2. Benchtop Scaler Ratemeter Instrumentation Unit (x: 400, y: 300, w: 165, h: 145)
    const meterX = 400;
    const meterY = 300;
    const meterW = 165;
    const meterH = 145;

    // Safety-yellow and slate rugged enclosure
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.7)";
    ctx.shadowBlur = 18;
    ctx.fillStyle = "#f59e0b"; // Yellow rugged instrumentation trim
    ctx.beginPath();
    ctx.roundRect(meterX, meterY, meterW, meterH, 12);
    ctx.fill();

    ctx.fillStyle = "#0f172a"; // Dark slate faceplate
    ctx.beginPath();
    ctx.roundRect(meterX + 6, meterY + 6, meterW - 12, meterH - 12, 8);
    ctx.fill();
    ctx.restore();

    // Digital Backlit LCD Panel
    const lcdX = meterX + 14;
    const lcdY = meterY + 16;
    const lcdW = meterW - 28;
    const lcdH = 50;

    const lcdGrad = ctx.createLinearGradient(lcdX, lcdY, lcdX, lcdY + lcdH);
    lcdGrad.addColorStop(0, "#052e16");
    lcdGrad.addColorStop(1, "#021c0e");
    ctx.fillStyle = lcdGrad;
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(lcdX, lcdY, lcdW, lcdH, 6);
    ctx.fill();
    ctx.stroke();

    // LCD Text Readouts
    ctx.fillStyle = "#34d399";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "left";
    ctx.fillText("DIGITAL SCALER RATEMETER", lcdX + 8, lcdY + 14);

    ctx.font = "900 20px monospace";
    ctx.fillText(`${Math.round(geigerCpm)}`, lcdX + 8, lcdY + 38);

    ctx.font = "bold 10px monospace";
    ctx.fillText("CPM", lcdX + 90, lcdY + 38);

    // Micro-Sieverts dose conversion: ~0.005 uSv/h per CPM for I-131/Cs-137
    const uSv = (geigerCpm * 0.005).toFixed(2);
    ctx.font = "bold 8px monospace";
    ctx.fillStyle = "#a7f3d0";
    ctx.textAlign = "right";
    ctx.fillText(`${uSv} μSv/h`, lcdX + lcdW - 8, lcdY + 38);

    // Analog Deflection Bargraph Meter below LCD
    const barX = meterX + 16;
    const barY = meterY + 76;
    const barW = meterW - 32;
    const barH = 12;

    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeRect(barX, barY, barW, barH);

    // Active Bargraph Fill
    const fillFraction = Math.min(1.0, meterNeedleValue / 1800);
    const fillGrad = ctx.createLinearGradient(barX, barY, barX + barW, barY);
    fillGrad.addColorStop(0, "#10b981");
    fillGrad.addColorStop(0.6, "#f59e0b");
    fillGrad.addColorStop(1, "#ef4444");
    ctx.fillStyle = fillGrad;
    ctx.fillRect(barX, barY, barW * fillFraction, barH);

    // Scale tick marks
    ctx.fillStyle = "#64748b";
    ctx.font = "8px monospace";
    ctx.textAlign = "left";
    ctx.fillText("0", barX, barY + 22);
    ctx.textAlign = "center";
    ctx.fillText("1k", barX + barW / 2, barY + 22);
    ctx.textAlign = "right";
    ctx.fillText("2k CPM", barX + barW, barY + 22);

    // BNC Coaxial Signal Cable between GM Tube and Scaler Unit
    ctx.strokeStyle = "#020617";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(probeX + probeW - 20, probeY + probeH);
    ctx.bezierCurveTo(probeX + probeW, probeY + probeH + 40, meterX + meterW - 20, meterY + 40, meterX + meterW - 30, meterY + meterH - 20);
    ctx.stroke();

    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(probeX + probeW - 20, probeY + probeH);
    ctx.bezierCurveTo(probeX + probeW, probeY + probeH + 40, meterX + meterW - 20, meterY + 40, meterX + meterW - 30, meterY + meterH - 20);
    ctx.stroke();
  }

  let lastFrameTime = 0;
  function renderSimulation(now) {
    if (!container || !container.isConnected) {
      isRunning = false;
      if (animId) cancelAnimationFrame(animId);
      return;
    }

    const isSmart = (document.documentElement.getAttribute("data-mode") === "smartboard") ||
                    document.documentElement.classList.contains("fast-smartboard-mode") ||
                    /Android|MAXHUB/i.test(navigator.userAgent);
    const interval = isSmart ? 33.3 : 16.0;

    const decayPhotoOverlay = container.querySelector("#decay-photo-overlay");
    const isPhotoOverlay = decayPhotoOverlay && decayPhotoOverlay.style.display === "block";

    if (!isPhotoOverlay) {
      if (isRunning) {
        if (!now || now - lastFrameTime >= interval) {
          lastFrameTime = now || performance.now();
          renderFrame();
        }
      } else {
        renderFrame();
      }
    }

    if (isRunning) animId = requestAnimationFrame(renderSimulation);
  }

  function renderDecayPlot() {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : Math.min(window.devicePixelRatio || 1, 2);
    plotCtx.save();
    plotCtx.resetTransform();
    plotCtx.scale(dpr, dpr);
    plotCtx.clearRect(0, 0, plotLogicalW, plotLogicalH);

    const margin = { left: 45, right: 25, top: 20, bottom: 35 };
    const w = plotLogicalW - margin.left - margin.right;
    const h = plotLogicalH - margin.top - margin.bottom;

    // Grid lines & Axes
    plotCtx.strokeStyle = "#1e293b";
    plotCtx.lineWidth = 1;
    for (let y = 0.25; y <= 1.0; y += 0.25) {
      const gy = margin.top + h - y * h;
      plotCtx.beginPath();
      plotCtx.moveTo(margin.left, gy);
      plotCtx.lineTo(margin.left + w, gy);
      plotCtx.stroke();

      plotCtx.fillStyle = "#475569";
      plotCtx.font = "8px monospace";
      plotCtx.textAlign = "right";
      plotCtx.fillText(`${Math.round(y * 100)}%`, margin.left - 6, gy + 3);
    }

    // Axes
    plotCtx.strokeStyle = "#334155";
    plotCtx.lineWidth = 1.5;
    plotCtx.beginPath();
    plotCtx.moveTo(margin.left, margin.top);
    plotCtx.lineTo(margin.left, margin.top + h);
    plotCtx.lineTo(margin.left + w, margin.top + h);
    plotCtx.stroke();

    // Half-Life Dashed Milestones (t = 1, 2, 3, 4)
    plotCtx.strokeStyle = "#334155";
    plotCtx.setLineDash([3, 3]);
    for (let tStep = 1; tStep <= 4; tStep++) {
      const gx = margin.left + (tStep / 4) * w;
      plotCtx.beginPath();
      plotCtx.moveTo(gx, margin.top);
      plotCtx.lineTo(gx, margin.top + h);
      plotCtx.stroke();

      plotCtx.fillStyle = "#64748b";
      plotCtx.font = "9px monospace";
      plotCtx.textAlign = "center";
      plotCtx.fillText(`${tStep} t½`, gx, margin.top + h + 14);
    }
    plotCtx.setLineDash([]);

    // Axis Labels
    plotCtx.fillStyle = "#94a3b8";
    plotCtx.font = "10px sans-serif";
    plotCtx.textAlign = "center";
    plotCtx.fillText("Elapsed Time (Half-Lives t₁/₂)", margin.left + w / 2, margin.top + h + 28);

    // Theoretical Exponential Curve with Gradient Fill
    const fillGrad = plotCtx.createLinearGradient(0, margin.top, 0, margin.top + h);
    fillGrad.addColorStop(0, "rgba(248, 113, 113, 0.25)");
    fillGrad.addColorStop(1, "rgba(248, 113, 113, 0.0)");

    plotCtx.beginPath();
    plotCtx.moveTo(margin.left, margin.top + h);
    for (let px = 0; px <= w; px++) {
      const t = (px / w) * 4;
      const nFraction = Math.pow(0.5, t);
      const py = margin.top + h - nFraction * h;
      plotCtx.lineTo(margin.left + px, py);
    }
    plotCtx.lineTo(margin.left + w, margin.top + h);
    plotCtx.closePath();
    plotCtx.fillStyle = fillGrad;
    plotCtx.fill();

    // Theoretical Curve Line
    plotCtx.strokeStyle = "#f87171";
    plotCtx.lineWidth = 2.5;
    plotCtx.beginPath();
    for (let px = 0; px <= w; px++) {
      const t = (px / w) * 4;
      const nFraction = Math.pow(0.5, t);
      const py = margin.top + h - nFraction * h;
      if (px === 0) plotCtx.moveTo(margin.left + px, py);
      else plotCtx.lineTo(margin.left + px, py);
    }
    plotCtx.stroke();

    // Actual Simulated Data Curve
    if (decayHistory.length > 1) {
      plotCtx.strokeStyle = "#38bdf8";
      plotCtx.lineWidth = 2;
      plotCtx.beginPath();
      decayHistory.forEach((pt, i) => {
        const px = margin.left + Math.min(1.0, pt.t / 4.0) * w;
        const py = margin.top + h - (pt.n / initialNucleiCount) * h;
        if (i === 0) plotCtx.moveTo(px, py);
        else plotCtx.lineTo(px, py);
      });
      plotCtx.stroke();

      // Current point pulse
      const latest = decayHistory[decayHistory.length - 1];
      const curX = margin.left + Math.min(1.0, latest.t / 4.0) * w;
      const curY = margin.top + h - (latest.n / initialNucleiCount) * h;
      plotCtx.fillStyle = "#38bdf8";
      plotCtx.beginPath();
      plotCtx.arc(curX, curY, 4, 0, Math.PI * 2);
      plotCtx.fill();
    }

    plotCtx.restore();
  }

  // Event Handlers
  container.querySelector("#btn-decay-toggle")?.addEventListener("click", (e) => {
    isRunning = !isRunning;
    e.currentTarget.innerText = isRunning ? "⏸ Pause" : "▶ Resume";
    SoundFX.playClick();
  });

  container.querySelector("#btn-decay-reset")?.addEventListener("click", () => {
    resetAtoms();
    SoundFX.playClick();
  });

  container.querySelector("#select-decay-iso")?.addEventListener("change", (e) => {
    currentIsoKey = e.target.value;
    resetAtoms();
    SoundFX.playClick();
  });

  container.querySelector("#select-decay-shield")?.addEventListener("change", (e) => {
    shielding = e.target.value;
    SoundFX.playClick();
  });

  container.querySelector("#slider-decay-n0")?.addEventListener("input", (e) => {
    initialNucleiCount = parseInt(e.target.value, 10);
    container.querySelector("#lbl-decay-n0").innerText = initialNucleiCount;
    resetAtoms();
  });

  container.querySelector("#slider-decay-speed")?.addEventListener("input", (e) => {
    timeScale = parseFloat(e.target.value);
    container.querySelector("#lbl-decay-speed").innerText = `${timeScale.toFixed(1)}×`;
  });

  container.querySelector("#btn-decay-export")?.addEventListener("click", () => {
    const iso = ISOTOPES[currentIsoKey];
    exportLabDataCsv({
      title: "Radioactive Decay & Nuclear Kinetics Telemetry",
      labId: "decay",
      parameters: {
        "Radioactive Isotope": iso.name,
        "Decay Mode": iso.mode,
        "Half-Life t_1/2": `${iso.halfLife} ${iso.unit}`,
        "Initial Nuclei N0": initialNucleiCount,
        "Radiation Shielding": shielding.toUpperCase()
      },
      headers: ["Step", "Elapsed (Half-Lives)", "Remaining Nuclei N(t)", "Decayed Nuclei", "Fraction Remaining (%)"],
      dataRows: decayHistory.map((pt, idx) => [
        idx + 1,
        pt.t.toFixed(3),
        pt.n,
        initialNucleiCount - pt.n,
        ((pt.n / initialNucleiCount) * 100).toFixed(2)
      ])
    });
  });

  // 4K Photo View Switcher
  const btnDecaySim = container.querySelector("#view-mode-decay-sim");
  const btnDecayPhoto = container.querySelector("#view-mode-decay-photo");
  const decayPhotoOverlay = container.querySelector("#decay-photo-overlay");

  btnDecaySim?.addEventListener("click", () => {
    btnDecaySim.classList.add("active");
    btnDecaySim.style.background = "";
    btnDecayPhoto.classList.remove("active");
    btnDecayPhoto.style.background = "transparent";
    if (decayPhotoOverlay) decayPhotoOverlay.style.display = "none";
    SoundFX.playClick();
  });

  btnDecayPhoto?.addEventListener("click", () => {
    btnDecayPhoto.classList.add("active");
    btnDecayPhoto.style.background = "";
    btnDecaySim.classList.remove("active");
    btnDecaySim.style.background = "transparent";
    if (decayPhotoOverlay) decayPhotoOverlay.style.display = "block";
    SoundFX.playClick();
  });

  // Standardized Hotkey: 'e' or 'E' triggers CSV telemetry export
  const handleKeyDown = (e) => {
    if ((e.key === "e" || e.key === "E") && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      container.querySelector("#btn-decay-export")?.click();
    }
  };
  window.addEventListener("keydown", handleKeyDown);

  // Mount Assessment
  mountLabCheckpoint("decay-checkpoint-container", "decay");

  renderSimulation();

  return () => {
    isRunning = false;
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("resize", setupHiDPICanvas);
  };
}
