// Edugates-ClipSAT Science Labs - Chemistry: Colligative Properties Suite
// 60 FPS Precision Thermal Phase Equilibrium Simulation:
// Freezing Point Depression (ΔT_f = i · K_f · m), Boiling Point Elevation (ΔT_b = i · K_b · m),
// Particle Van 't Hoff Factor i, Solute Dissociation, and Cooling Curve Kinetics.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initColligativeLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Solvents Library
  const SOLVENTS = {
    water: { name: "Pure Water (H₂O)", kf: 1.86, kb: 0.512, tf0: 0.0, tb0: 100.0, color: "rgba(56, 189, 248, 0.45)", liquidColor: "#0284c7" },
    cyclohexane: { name: "Cyclohexane (C₆H₁₂)", kf: 20.0, kb: 2.79, tf0: 6.5, tb0: 80.7, color: "rgba(168, 85, 247, 0.35)", liquidColor: "#9333ea" },
    ethanol: { name: "Ethanol (C₂H₅OH)", kf: 1.99, kb: 1.22, tf0: -114.1, tb0: 78.4, color: "rgba(16, 185, 129, 0.35)", liquidColor: "#059669" }
  };

  // Solutes Library with van 't Hoff factor i
  const SOLUTES = {
    nacl: { name: "Sodium Chloride (NaCl)", iTheo: 2, iExp: 1.90, molarMass: 58.44, cation: "Na⁺", anion: "Cl⁻", colorCat: "#a855f7", colorAn: "#10b981" },
    cacl2: { name: "Calcium Chloride (CaCl₂)", iTheo: 3, iExp: 2.70, molarMass: 110.98, cation: "Ca²⁺", anion: "Cl⁻", colorCat: "#f59e0b", colorAn: "#10b981" },
    glucose: { name: "Glucose (C₆H₁₂O₆)", iTheo: 1, iExp: 1.00, molarMass: 180.16, cation: "Molecule", anion: "", colorCat: "#38bdf8", colorAn: "" },
    sucrose: { name: "Sucrose (C₁₂H₂₂O₁₁)", iTheo: 1, iExp: 1.00, molarMass: 342.30, cation: "Molecule", anion: "", colorCat: "#f43f5e", colorAn: "" },
    alcl3: { name: "Aluminum Chloride (AlCl₃)", iTheo: 4, iExp: 3.40, molarMass: 133.34, cation: "Al³⁺", anion: "Cl⁻", colorCat: "#ec4899", colorAn: "#10b981" }
  };

  // State
  let solventKey = "water";
  let soluteKey = "nacl";
  let molality = 1.00; // mol/kg
  let bathMode = "cooling"; // "cooling" or "heating"
  let bathTemp = -15.0; // °C
  let solutionTemp = 20.0; // °C
  let isSimulating = true;
  let isRunning = true;
  let animId = null;

  // Particle Simulation
  const particles = [];
  const NUM_SOLVENT_PARTICLES = 75;
  for (let i = 0; i < NUM_SOLVENT_PARTICLES; i++) {
    particles.push({
      x: 100 + Math.random() * 240,
      y: 180 + Math.random() * 220,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      type: "solvent"
    });
  }

  // Telemetry buffer
  const coolingHistory = []; // { time, temp }
  const recordedTrials = [];
  let simTime = 0;

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #38bdf8; box-shadow: 0 0 10px #38bdf8;"></span>
            Colligative Properties &amp; Phase Transition Suite
          </span>
          <span class="badge" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            \\Delta T_f = i \\cdot K_f \\cdot m \\quad \\Delta T_b = i \\cdot K_b \\cdot m
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-collig-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Cryo Simulator
            </button>
            <button id="view-mode-collig-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-collig-record" style="padding: 5px 14px; font-size: 0.78rem; border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;">
            📍 Record Data Point
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-collig-reset" style="padding: 5px 12px; font-size: 0.78rem;">
            ⟲ Reset Curve
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-collig-export" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export Telemetry
          </button>
        </div>
      </div>

      <!-- Main Layout -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="collig-layout">
        <!-- Canvas Viewport -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(56, 189, 248, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #0c4a6e 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="collig-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
          <div id="collig-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <img src="assets/labs/colligative_bench.jpg" alt="4K Colligative Properties & Cryoscopy Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            
            <!-- Live Analytical Telemetry Callout on Photo -->
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Cryoscopic Freezing Cell</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Insulated Vacuum Dewared Bath</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Beckmann Thermometer &amp; RTD</div>
                <div style="color: #facc15; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Resolution ±0.001 °C Differential</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Analytical Balance &amp; Solutes</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Precision 0.0001 g Mass Meter</div>
              </div>
            </div>
          </div>

          <!-- Top HUD -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">THERMOMETER TELEMETRY</div>
              <div id="hud-collig-temp" style="font-size: 1.25rem; font-weight: 800; color: #38bdf8; font-family: var(--font-mono);">
                20.00 °C
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">CALCULATED FREEZING POINT</div>
              <div id="hud-collig-tf" style="font-size: 1.25rem; font-weight: 800; color: #c084fc; font-family: var(--font-mono);">
                T_f = -3.53 °C
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: Controls & Analysis -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Controls -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; margin-bottom: 12px;">Solution &amp; Thermal Bath Controls</div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div>
                <label style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Solvent</label>
                <select id="select-collig-solvent" class="form-control" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                  ${Object.entries(SOLVENTS).map(([k, s]) => `<option value="${k}">${s.name}</option>`).join("")}
                </select>
              </div>

              <div>
                <label style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Solute</label>
                <select id="select-collig-solute" class="form-control" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                  ${Object.entries(SOLUTES).map(([k, s]) => `<option value="${k}">${s.name}</option>`).join("")}
                </select>
              </div>
            </div>

            <!-- Molality Slider -->
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                <span style="color: #94a3b8;">Molality (m = mol solute / kg solvent)</span>
                <span id="lbl-collig-molality" style="font-weight: 700; color: #38bdf8; font-family: var(--font-mono);">1.00 mol/kg</span>
              </div>
              <input type="range" id="slider-collig-molality" min="0.0" max="3.0" step="0.05" value="1.00" style="width: 100%; accent-color: #38bdf8;">
            </div>

            <!-- Thermal Bath Temperature Slider -->
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                <span style="color: #94a3b8;">Cryogenic Cooling Bath Temp</span>
                <span id="lbl-collig-bath" style="font-weight: 700; color: #f43f5e; font-family: var(--font-mono);">-15.0 °C</span>
              </div>
              <input type="range" id="slider-collig-bath" min="-30.0" max="10.0" step="0.5" value="-15.0" style="width: 100%; accent-color: #f43f5e;">
            </div>

            <!-- Quick Info Badges -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; background: rgba(0,0,0,0.3); border-radius: 8px; padding: 8px 10px; font-size: 0.75rem; text-align: center;">
              <div>
                <span style="color: #64748b; display: block;">van 't Hoff (i)</span>
                <span id="info-collig-i" style="font-weight: 700; color: #a855f7; font-family: var(--font-mono);">1.90</span>
              </div>
              <div>
                <span style="color: #64748b; display: block;">K_f Constant</span>
                <span id="info-collig-kf" style="font-weight: 700; color: #38bdf8; font-family: var(--font-mono);">1.86 °C·kg/mol</span>
              </div>
              <div>
                <span style="color: #64748b; display: block;">ΔT_f Depression</span>
                <span id="info-collig-dtf" style="font-weight: 700; color: #10b981; font-family: var(--font-mono);">3.53 °C</span>
              </div>
            </div>
          </div>

          <!-- Analytical Live Curve Canvas -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; flex: 1; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">
                Real-Time Cooling Curve &amp; Phase Transition Plateau
              </span>
              <span style="font-size: 0.72rem; color: #38bdf8; font-family: var(--font-mono);">
                T vs Time (s)
              </span>
            </div>
            <div style="position: relative; flex: 1; min-height: 180px;">
              <canvas id="collig-chart-canvas" width="460" height="180" style="width: 100%; height: 180px; display: block; border-radius: 6px;"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Assessment Checkpoint Container -->
      <div id="colligative-checkpoint-container" style="margin-top: 24px;"></div>
    </div>
  `;

  // Canvas context
  const canvas = container.querySelector("#collig-canvas");
  const ctx = canvas.getContext("2d");
  const chartCanvas = container.querySelector("#collig-chart-canvas");
  const chartCtx = chartCanvas.getContext("2d");

  // Calculations
  function getParameters() {
    const s = SOLVENTS[solventKey];
    const sol = SOLUTES[soluteKey];
    const i = sol.iExp;
    const dtf = i * s.kf * molality;
    const tf = s.tf0 - dtf;
    const dtb = i * s.kb * molality;
    const tb = s.tb0 + dtb;
    return { s, sol, i, dtf, tf, dtb, tb };
  }

  function updateHUD() {
    const { s, sol, i, dtf, tf } = getParameters();
    const hudTemp = container.querySelector("#hud-collig-temp");
    const hudTf = container.querySelector("#hud-collig-tf");
    const infoI = container.querySelector("#info-collig-i");
    const infoKf = container.querySelector("#info-collig-kf");
    const infoDtf = container.querySelector("#info-collig-dtf");

    if (hudTemp) hudTemp.innerText = `${solutionTemp.toFixed(2)} °C`;
    if (hudTf) hudTf.innerText = `T_f = ${tf.toFixed(2)} °C`;
    if (infoI) infoI.innerText = i.toFixed(2);
    if (infoKf) infoKf.innerText = `${s.kf.toFixed(2)} °C·kg/mol`;
    if (infoDtf) infoDtf.innerText = `${dtf.toFixed(2)} °C`;
  }

  // Render Simulation Viewport
  function drawBeakerAndApparatus() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const { s, sol, tf } = getParameters();

    // Background Laboratory Bench
    ctx.fillStyle = "#0a0f1d";
    ctx.fillRect(0, 470, canvas.width, 60);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 470, canvas.width, 60);

    // Thermal Bath Chamber (Outer Insulated Cryostat)
    ctx.fillStyle = "rgba(30, 41, 59, 0.7)";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(80, 140, 420, 320, [0, 0, 16, 16]);
    ctx.fill();
    ctx.stroke();

    // Cooling bath liquid
    const bathGrad = ctx.createLinearGradient(80, 180, 80, 460);
    bathGrad.addColorStop(0, "rgba(56, 189, 248, 0.15)");
    bathGrad.addColorStop(1, "rgba(14, 165, 233, 0.45)");
    ctx.fillStyle = bathGrad;
    ctx.fillRect(85, 200, 410, 255);

    // Beaker (Inner Vessel)
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(160, 170, 260, 270, [0, 0, 18, 18]);
    ctx.fill();
    ctx.stroke();

    // Solution Liquid in Beaker
    const liquidGrad = ctx.createLinearGradient(165, 210, 165, 435);
    liquidGrad.addColorStop(0, s.color);
    liquidGrad.addColorStop(1, s.liquidColor);
    ctx.fillStyle = liquidGrad;
    ctx.beginPath();
    ctx.roundRect(165, 220, 250, 215, [0, 0, 14, 14]);
    ctx.fill();

    // Draw Ice Crystal lattice if solution temperature is at or below freezing point
    const isFrozen = solutionTemp <= tf;
    if (isFrozen) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 2;
      for (let x = 180; x < 400; x += 40) {
        for (let y = 240; y < 420; y += 40) {
          ctx.beginPath();
          ctx.moveTo(x - 8, y);
          ctx.lineTo(x + 8, y);
          ctx.moveTo(x, y - 8);
          ctx.lineTo(x, y + 8);
          ctx.stroke();
        }
      }
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.font = "bold 13px system-ui";
      ctx.fillText("❄️ Solid Crystal Lattice Forming", 195, 330);
    }

    // Draw Particles (Solvent + Dissociated Ions)
    particles.forEach(p => {
      p.x += p.vx * (solutionTemp > tf ? 1 : 0.15);
      p.y += p.vy * (solutionTemp > tf ? 1 : 0.15);
      if (p.x < 175) { p.x = 175; p.vx *= -1; }
      if (p.x > 405) { p.x = 405; p.vx *= -1; }
      if (p.y < 230) { p.y = 230; p.vy *= -1; }
      if (p.y > 425) { p.y = 425; p.vy *= -1; }

      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fill();
    });

    // Draw Solute Dissociated Ions based on molality
    const numSoluteIons = Math.min(60, Math.floor(molality * 18));
    for (let i = 0; i < numSoluteIons; i++) {
      const angle = (simTime * 0.05 + i * 1.618) % (Math.PI * 2);
      const px = 290 + Math.cos(angle + i) * (60 + (i % 5) * 16);
      const py = 325 + Math.sin(angle * 1.5 + i) * (40 + (i % 4) * 14);

      const isCation = i % 2 === 0;
      ctx.beginPath();
      ctx.arc(px, py, isCation ? 5 : 6, 0, Math.PI * 2);
      ctx.fillStyle = isCation ? sol.colorCat : (sol.colorAn || sol.colorCat);
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Symbol
      ctx.fillStyle = "#ffffff";
      ctx.font = "8px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(isCation ? sol.cation.substring(0, 3) : (sol.anion.substring(0, 3) || "Sol"), px, py);
    }

    // Digital Immersion Thermometer
    ctx.fillStyle = "#334155";
    ctx.fillRect(280, 60, 16, 260);
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(288, 320, 12, 0, Math.PI * 2);
    ctx.fill();

    // Thermometer mercury column
    const mercuryHeight = Math.max(10, Math.min(220, (solutionTemp + 30) * 3));
    ctx.fillStyle = "#f43f5e";
    ctx.fillRect(284, 320 - mercuryHeight, 8, mercuryHeight);

    // Magnetic Stirrer in beaker bottom
    const stirAngle = simTime * 0.2;
    ctx.save();
    ctx.translate(290, 420);
    ctx.rotate(stirAngle);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-22, -4, 44, 8);
    ctx.restore();

    // Labels
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px system-ui";
    ctx.textAlign = "left";
    ctx.fillText("Insulated Thermal Bath", 90, 160);
    ctx.fillText(`Bath Temp: ${bathTemp.toFixed(1)} °C`, 90, 175);
    ctx.fillText(`Solvent: ${s.name}`, 175, 205);
  }

  // Draw Real-time Chart
  function drawChart() {
    chartCtx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
    const { s, tf } = getParameters();

    // Background Grid
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
    chartCtx.textAlign = "right";
    chartCtx.fillText("25°C", 35, 25);
    chartCtx.fillText("0°C", 35, 95);
    chartCtx.fillText("-20°C", 35, 145);

    chartCtx.textAlign = "center";
    chartCtx.fillText("Time elapsed (s)", chartCanvas.width / 2, chartCanvas.height - 6);

    // Draw Freezing Point Reference Line
    const yTf = 95 - (tf / 25) * 55;
    chartCtx.strokeStyle = "rgba(192, 132, 252, 0.6)";
    chartCtx.setLineDash([4, 4]);
    chartCtx.beginPath();
    chartCtx.moveTo(40, yTf);
    chartCtx.lineTo(chartCanvas.width - 15, yTf);
    chartCtx.stroke();
    chartCtx.setLineDash([]);
    chartCtx.fillStyle = "#c084fc";
    chartCtx.textAlign = "left";
    chartCtx.fillText(`T_f = ${tf.toFixed(1)}°C`, 45, yTf - 4);

    // Plot Temperature Curve
    if (coolingHistory.length > 1) {
      chartCtx.strokeStyle = "#38bdf8";
      chartCtx.lineWidth = 2.5;
      chartCtx.beginPath();

      coolingHistory.forEach((pt, idx) => {
        const px = 40 + (pt.time / Math.max(60, simTime)) * (chartCanvas.width - 60);
        const py = 95 - (pt.temp / 25) * 55;
        if (idx === 0) chartCtx.moveTo(px, py);
        else chartCtx.lineTo(px, py);
      });
      chartCtx.stroke();
    }
  }

  // Physics Step
  function stepPhysics() {
    simTime += 0.05;
    const { tf } = getParameters();

    // Cooling kinetics: Newton's Law of Cooling towards bathTemp,
    // with latent heat plateau at T_f
    const kCool = 0.04;
    const tempDiff = bathTemp - solutionTemp;

    if (solutionTemp > tf + 0.1) {
      // Liquid cooling
      solutionTemp += tempDiff * kCool * 0.15;
    } else if (solutionTemp >= tf - 0.2) {
      // Latent heat plateau during freezing phase transition
      solutionTemp = tf + (Math.random() - 0.5) * 0.05;
    } else {
      // Solid ice cooling towards bath temp
      solutionTemp += tempDiff * kCool * 0.10;
    }

    // Keep history point every ~0.5s
    if (coolingHistory.length === 0 || simTime - coolingHistory[coolingHistory.length - 1].time > 0.4) {
      coolingHistory.push({ time: simTime, temp: solutionTemp });
      if (coolingHistory.length > 150) coolingHistory.shift();
    }
  }

  // Animation Loop
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

    const photoOverlay = container.querySelector("#collig-photo-overlay");
    const isPhotoOverlay = photoOverlay && photoOverlay.style.display === "block";

    if (!isPhotoOverlay) {
      if (!now || now - lastFrameTime >= interval) {
        lastFrameTime = now || performance.now();
        stepPhysics();
        updateHUD();
        drawBeakerAndApparatus();
        drawChart();
      }
    }

    animId = requestAnimationFrame(loop);
  }

  // UI Event Listeners
  container.querySelector("#select-collig-solvent")?.addEventListener("change", (e) => {
    solventKey = e.target.value;
    coolingHistory.length = 0;
    simTime = 0;
    solutionTemp = 20.0;
    needsRedraw = true;
    SoundFX.playClick();
  });

  container.querySelector("#select-collig-solute")?.addEventListener("change", (e) => {
    soluteKey = e.target.value;
    coolingHistory.length = 0;
    simTime = 0;
    solutionTemp = 20.0;
    needsRedraw = true;
    SoundFX.playClick();
  });

  container.querySelector("#slider-collig-molality")?.addEventListener("input", (e) => {
    molality = parseFloat(e.target.value);
    container.querySelector("#lbl-collig-molality").innerText = `${molality.toFixed(2)} mol/kg`;
    needsRedraw = true;
  });

  container.querySelector("#slider-collig-bath")?.addEventListener("input", (e) => {
    bathTemp = parseFloat(e.target.value);
    container.querySelector("#lbl-collig-bath").innerText = `${bathTemp.toFixed(1)} °C`;
    needsRedraw = true;
  });

  container.querySelector("#btn-collig-reset")?.addEventListener("click", () => {
    coolingHistory.length = 0;
    simTime = 0;
    solutionTemp = 20.0;
    needsRedraw = true;
    SoundFX.playClick();
  });

  container.querySelector("#btn-collig-record")?.addEventListener("click", () => {
    const { s, sol, i, dtf, tf } = getParameters();
    recordedTrials.push({
      solvent: s.name,
      solute: sol.name,
      molality,
      vanTHoff: i,
      dtf,
      freezingPoint: tf,
      currentTemp: solutionTemp
    });
    LabTrialStore.addTrial("colligative", { molality, dtf, tf, solute: sol.name });
    SoundFX.playScorePip();
  });

  container.querySelector("#btn-collig-export")?.addEventListener("click", () => {
    const { s, sol, i, dtf, tf } = getParameters();
    exportLabDataCsv({
      title: "Colligative Properties & Freezing Point Depression Telemetry",
      labId: "colligative",
      parameters: {
        "Solvent": s.name,
        "Solute": sol.name,
        "Kf Constant (°C·kg/mol)": s.kf,
        "Van 't Hoff Factor i": i,
        "Molality m (mol/kg)": molality
      },
      headers: ["Trial #", "Time (s)", "Temperature (°C)", "T_f Theoretical (°C)", "ΔT_f Depression (°C)"],
      dataRows: coolingHistory.map((pt, idx) => [
        idx + 1,
        pt.time.toFixed(1),
        pt.temp.toFixed(2),
        tf.toFixed(2),
        dtf.toFixed(2)
      ])
    });
  });

  // 4K Photo View Switcher
  const btnColligSim = container.querySelector("#view-mode-collig-sim");
  const btnColligPhoto = container.querySelector("#view-mode-collig-photo");
  const colligPhotoOverlay = container.querySelector("#collig-photo-overlay");

  btnColligSim?.addEventListener("click", () => {
    btnColligSim.classList.add("active");
    btnColligSim.style.background = "";
    btnColligPhoto.classList.remove("active");
    btnColligPhoto.style.background = "transparent";
    if (colligPhotoOverlay) colligPhotoOverlay.style.display = "none";
    SoundFX.playClick();
  });

  btnColligPhoto?.addEventListener("click", () => {
    btnColligPhoto.classList.add("active");
    btnColligPhoto.style.background = "";
    btnColligSim.classList.remove("active");
    btnColligSim.style.background = "transparent";
    if (colligPhotoOverlay) colligPhotoOverlay.style.display = "block";
    SoundFX.playClick();
  });

  // Mount Assessment
  mountLabCheckpoint("colligative-checkpoint-container", "colligative");

  // Launch
  loop();

  return () => {
    isRunning = false;
    if (animId) cancelAnimationFrame(animId);
  };
}
