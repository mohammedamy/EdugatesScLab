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
    c14: { name: "Carbon-14 (¹⁴C)", mode: "Beta (β⁻)", halfLife: 5.73, unit: "kyr", daughter: "Nitrogen-14 (¹⁴N)", color: "#38bdf8", rayColor: "#3b82f6" },
    i131: { name: "Iodine-131 (¹³¹I)", mode: "Beta / Gamma (β⁻/γ)", halfLife: 8.0, unit: "days", daughter: "Xenon-131 (¹³¹Xe)", color: "#c026d3", rayColor: "#ec4899" },
    co60: { name: "Cobalt-60 (⁶⁰Co)", mode: "Beta / Gamma (β⁻/γ)", halfLife: 5.27, unit: "years", daughter: "Nickel-60 (⁶⁰Ni)", color: "#f59e0b", rayColor: "#eab308" },
    ra226: { name: "Radium-226 (²²⁶Ra)", mode: "Alpha (α)", halfLife: 1.60, unit: "kyr", daughter: "Radon-222 (²²²Rn)", color: "#10b981", rayColor: "#22c55e" }
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

  // Discrete particles array
  let atoms = [];
  const emittedRays = [];
  const decayHistory = [];

  function resetAtoms() {
    atoms = [];
    remainingNuclei = initialNucleiCount;
    decayedNuclei = 0;
    elapsedTime = 0;
    decayHistory.length = 0;
    emittedRays.length = 0;

    for (let i = 0; i < initialNucleiCount; i++) {
      atoms.push({
        x: 60 + Math.random() * 240,
        y: 160 + Math.random() * 240,
        decayed: false,
        pulseOffset: Math.random() * Math.PI * 2
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
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(239, 68, 68, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #2a0b0b 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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

          // Emit radiation ray towards detector
          const angle = (Math.random() - 0.5) * 0.8;
          emittedRays.push({
            x: atom.x,
            y: atom.y,
            vx: Math.cos(angle) * 7.0,
            vy: Math.sin(angle) * 7.0,
            life: 1.0
          });
        }
      });

      // Update Geiger Counter CPM with Poisson and Shielding
      const shieldFactor = getShieldingEfficiency(iso.mode, shielding);
      const targetCpm = newlyDecayedThisFrame * 60 * 50 * shieldFactor;
      geigerCpm = geigerCpm * 0.92 + targetCpm * 0.08;

      if (newlyDecayedThisFrame > 0 && Math.random() < 0.3) {
        try { SoundFX.playClick(); } catch (e) {}
      }

      // Record History every ~0.1 half-lives
      if (decayHistory.length === 0 || elapsedTime - decayHistory[decayHistory.length - 1].t >= 0.08) {
        decayHistory.push({ t: elapsedTime, n: remainingNuclei });
      }
    }

    // 2. Draw Sample Chamber Area
    ctx.strokeStyle = "#475569";
    ctx.fillStyle = "rgba(15, 23, 42, 0.7)";
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 140, 280, 280);
    ctx.fillRect(40, 140, 280, 280);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(`Radioactive Sample Chamber: ${iso.name}`, 55, 130);

    // 3. Draw Atoms (Parent vs Daughter)
    atoms.forEach(atom => {
      ctx.beginPath();
      ctx.arc(atom.x, atom.y, 4, 0, Math.PI * 2);
      if (!atom.decayed) {
        ctx.fillStyle = iso.color;
        ctx.shadowColor = iso.color;
        ctx.shadowBlur = 6;
      } else {
        ctx.fillStyle = "#475569";
        ctx.shadowBlur = 0;
      }
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    // 4. Draw Shielding Barrier
    const shieldX = 350;
    const shieldY = 130;
    const shieldW = shielding === "none" ? 0 : (shielding === "paper" ? 4 : (shielding === "aluminum" ? 14 : 32));
    const shieldH = 300;

    if (shielding !== "none") {
      ctx.fillStyle = shielding === "paper" ? "#fef08a" : (shielding === "aluminum" ? "#94a3b8" : "#475569");
      ctx.strokeStyle = "#cbd5e1";
      ctx.fillRect(shieldX, shieldY, shieldW, shieldH);
      ctx.strokeRect(shieldX, shieldY, shieldW, shieldH);

      ctx.save();
      ctx.translate(shieldX - 10, shieldY + 150);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(shielding.toUpperCase() + " SHIELD", 0, 0);
      ctx.restore();
    }

    // 5. Draw Emitted Radiation Rays
    ctx.lineWidth = 2.5;
    for (let i = emittedRays.length - 1; i >= 0; i--) {
      const ray = emittedRays[i];
      ray.x += ray.vx;
      ray.y += ray.vy;
      ray.life -= 0.025;

      // Check collision with shield
      if (shielding !== "none" && ray.x >= shieldX && ray.x <= shieldX + shieldW) {
        if (Math.random() > getShieldingEfficiency(iso.mode, shielding)) {
          emittedRays.splice(i, 1);
          continue;
        }
      }

      ctx.strokeStyle = iso.rayColor;
      ctx.globalAlpha = Math.max(0, ray.life);
      ctx.beginPath();
      ctx.moveTo(ray.x, ray.y);
      ctx.lineTo(ray.x - ray.vx * 2, ray.y - ray.vy * 2);
      ctx.stroke();

      if (ray.life <= 0 || ray.x > 580) {
        emittedRays.splice(i, 1);
      }
    }
    ctx.globalAlpha = 1.0;

    // 6. Draw Geiger-Müller Sensor Tube
    const geigerX = 420;
    const geigerY = 220;
    ctx.fillStyle = "#0f172a";
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(geigerX, geigerY, 130, 110, 8);
    ctx.fill();
    ctx.stroke();

    // Mica Window
    ctx.fillStyle = "#334155";
    ctx.fillRect(geigerX, geigerY + 30, 14, 50);

    // Indicator Light
    const ledOn = geigerCpm > 300;
    ctx.fillStyle = ledOn ? "#ef4444" : "#450a0a";
    ctx.beginPath();
    ctx.arc(geigerX + 110, geigerY + 25, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Geiger Counter", geigerX + 22, geigerY + 28);
    ctx.fillStyle = "#10b981";
    ctx.font = "bold 15px monospace";
    ctx.fillText(`${Math.round(geigerCpm)} CPM`, geigerX + 25, geigerY + 65);

    // Update HUD Text
    const hudN = container.querySelector("#hud-decay-nuclei");
    const hudCpm = container.querySelector("#hud-decay-cpm");
    const lblHalf = container.querySelector("#lbl-half-life-counter");
    if (hudN) hudN.innerText = `${remainingNuclei} / ${initialNucleiCount} (${((remainingNuclei / initialNucleiCount) * 100).toFixed(1)}%)`;
    if (hudCpm) hudCpm.innerText = `${Math.round(geigerCpm)} CPM`;
    if (lblHalf) lblHalf.innerText = `${elapsedTime.toFixed(2)} t½ elapsed`;

    renderDecayPlot();
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
    plotCtx.clearRect(0, 0, plotCanvas.width, plotCanvas.height);
    const margin = { left: 45, right: 25, top: 20, bottom: 35 };
    const w = plotCanvas.width - margin.left - margin.right;
    const h = plotCanvas.height - margin.top - margin.bottom;

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

    // Theoretical Exponential Curve
    plotCtx.strokeStyle = "#f87171";
    plotCtx.lineWidth = 2.5;
    plotCtx.beginPath();
    for (let px = 0; px <= w; px++) {
      const t = (px / w) * 4; // up to 4 half-lives
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
    }
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
  };
}
