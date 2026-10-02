// Edugates-ClipSAT Science Labs - Chemistry: Chemical Kinetics & Reaction Rates Suite
// 60 FPS Precision Reaction Kinetics Simulation:
// Rate = k·[A]^m·[B]^n, Arrhenius Equation k = A·exp(-Ea / RT),
// Collision Theory with Maxwell-Boltzmann Molecular Velocity Distribution,
// Activation Energy Ea, Catalyst Lowering, Concentration & Temperature Scans.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initReactionKineticsLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return () => {};

  // Standard Reaction Kinetics Systems
  const REACTION_SYSTEMS = {
    iodine_clock: {
      name: "Iodine Clock: S₂O₈²⁻ + 2I⁻ → 2SO₄²⁻ + I₂",
      reactantA: "Peroxydisulfate [S₂O₈²⁻]",
      reactantB: "Iodide [I⁻]",
      orderA: 1,
      orderB: 1,
      baseEa: 52.0, // kJ/mol
      catalyzedEa: 24.0,
      preExpA: 8.5e8,
      defaultConcA: 0.10,
      defaultConcB: 0.10,
      colorStart: "rgba(245, 158, 11, 0.15)",
      colorEnd: "#1e1b4b", // Deep Blue-Black
      catalystName: "Iron(II) Fe²⁺ / Iron(III) Fe³⁺ Ions"
    },
    h2o2_decomp: {
      name: "Peroxide Decomposition: 2H₂O₂ → 2H₂O + O₂↑",
      reactantA: "Hydrogen Peroxide [H₂O₂]",
      reactantB: "Aqueous Buffer [H⁺]",
      orderA: 1,
      orderB: 0,
      baseEa: 75.0, // kJ/mol
      catalyzedEa: 28.0,
      preExpA: 2.4e10,
      defaultConcA: 0.50,
      defaultConcB: 0.10,
      colorStart: "rgba(56, 189, 248, 0.15)",
      colorEnd: "rgba(16, 185, 129, 0.4)",
      catalystName: "Manganese Dioxide MnO₂ Powder"
    },
    thiosulfate_acid: {
      name: "Thiosulfate Turbidity: S₂O₃²⁻ + 2H⁺ → S↓ + SO₂ + H₂O",
      reactantA: "Sodium Thiosulfate [S₂O₃²⁻]",
      reactantB: "Hydrochloric Acid [H⁺]",
      orderA: 1,
      orderB: 1,
      baseEa: 62.0, // kJ/mol
      catalyzedEa: 32.0,
      preExpA: 1.2e9,
      defaultConcA: 0.20,
      defaultConcB: 0.20,
      colorStart: "rgba(255, 255, 255, 0.05)",
      colorEnd: "rgba(254, 240, 138, 0.85)", // Colloidal Sulfur precipitate
      catalystName: "Ammonium Molybdate Catalyst"
    }
  };

  // State Variables
  let currentSystemKey = "iodine_clock";
  let concA = 0.10; // M
  let concB = 0.10; // M
  let tempC = 25; // °C
  let hasCatalyst = false;
  let reactionProgress = 0; // 0.0 to 1.0
  let isRunning = false;
  let simTime = 0; // seconds
  let animId = null;

  // Particle Simulation Engine
  const GAS_CONSTANT = 8.314; // J/(mol·K)
  const particles = [];
  const MAX_PARTICLES = 70;

  function initParticles() {
    particles.length = 0;
    const numA = Math.round(concA * 35) + 10;
    const numB = Math.round(concB * 35) + 10;
    
    // Reactant A (Amber/Red)
    for (let i = 0; i < numA; i++) {
      particles.push({
        type: "A",
        x: 40 + Math.random() * 260,
        y: 120 + Math.random() * 280,
        vx: (Math.random() - 0.5) * 2.2,
        vy: (Math.random() - 0.5) * 2.2,
        radius: 6,
        color: "#f59e0b"
      });
    }
    // Reactant B (Cyan/Blue)
    for (let i = 0; i < numB; i++) {
      particles.push({
        type: "B",
        x: 40 + Math.random() * 260,
        y: 120 + Math.random() * 280,
        vx: (Math.random() - 0.5) * 2.2,
        vy: (Math.random() - 0.5) * 2.2,
        radius: 5,
        color: "#38bdf8"
      });
    }
  }

  // Kinetics Calculations
  function calculateKinetics() {
    const sys = REACTION_SYSTEMS[currentSystemKey];
    const tempK = tempC + 273.15;
    const activeEa = hasCatalyst ? sys.catalyzedEa : sys.baseEa; // kJ/mol
    const eaJoules = activeEa * 1000;
    
    // Arrhenius rate constant k = A * exp(-Ea / RT)
    // Scale rate constant for visual simulation (0.01 to 0.40 range)
    const exponent = -eaJoules / (GAS_CONSTANT * tempK);
    const kVisual = 0.04 * Math.exp(exponent + (hasCatalyst ? 11 : 22));
    
    // Differential Rate = k * [A]^m * [B]^n
    const currentA = Math.max(0.001, concA * (1 - reactionProgress));
    const currentB = Math.max(0.001, concB * (1 - reactionProgress));
    const rate = kVisual * Math.pow(currentA, sys.orderA) * Math.pow(currentB, sys.orderB);
    const halfLife = Math.log(2) / Math.max(1e-4, kVisual);

    return {
      tempK,
      activeEa,
      k: kVisual,
      rate,
      currentA,
      currentB,
      halfLife
    };
  }

  // Telemetry buffer for plotting
  const timeSeries = [];
  function recordTelemetryPoint() {
    const kin = calculateKinetics();
    timeSeries.push({
      time: parseFloat(simTime.toFixed(1)),
      concA: parseFloat(kin.currentA.toFixed(4)),
      productConc: parseFloat((concA - kin.currentA).toFixed(4)),
      rate: parseFloat(kin.rate.toFixed(5)),
      tempK: kin.tempK,
      ea: kin.activeEa
    });
    if (timeSeries.length > 50) timeSeries.shift();
  }

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #06b6d4; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #06b6d4; box-shadow: 0 0 10px #06b6d4;"></span>
            Chemical Kinetics &amp; Reaction Rates Suite
          </span>
          <span class="badge" style="background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.3); color: #38bdf8; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            Rate = k[A]^m[B]^n • k = A e^{-E_a/RT}
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-kinetics-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Dynamics Simulator
            </button>
            <button id="view-mode-kinetics-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-kinetics-play" style="padding: 5px 14px; font-size: 0.78rem;">
            ▶ Start Reaction
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-kinetics-reset" style="padding: 5px 12px; font-size: 0.78rem;">
            ⟲ Reset Flask
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-kinetics-export" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export Telemetry
          </button>
        </div>
      </div>

      <!-- Main Layout Grid -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="kinetics-layout">
        <!-- Canvas Viewport -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(6, 182, 212, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #082f49 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="kinetics-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Real Laboratory Photograph Overlay -->
          <div id="kinetics-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <img src="assets/labs/kinetics_bench.jpg" alt="4K Research Spectrophotometer & Reaction Kinetics Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(6, 182, 212, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">UV-Vis Kinetics Scanner</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">λ = 460 nm Absorbance</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Stirred Reactor Flask</div>
                <div style="color: #facc15; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">T = 298.15 K • 550 RPM</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Activation Energy Ea</div>
                <div id="photo-ea-val" style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">52.0 kJ/mol (Uncatalyzed)</div>
              </div>
            </div>
          </div>

          <!-- Top HUD -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(6, 182, 212, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">INSTANTANEOUS REACTION RATE</div>
              <div id="hud-kinetics-rate" style="font-size: 1.12rem; font-weight: 800; color: #38bdf8; font-family: var(--font-mono);">
                Rate = 0.0000 M/s
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">ELAPSED REACTION TIME</div>
              <div id="hud-kinetics-time" style="font-size: 1.12rem; font-weight: 800; color: #10b981; font-family: var(--font-mono);">
                t = 0.0 s • 0% Done
              </div>
            </div>
          </div>
        </div>

        <!-- Controls & Analytics Side -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Controls Panel -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; margin-bottom: 12px;">Reagents &amp; Thermal Parameters</div>
            
            <div style="margin-bottom: 12px;">
              <label style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Reaction System</label>
              <select id="select-kinetics-sys" class="form-control" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                ${Object.entries(REACTION_SYSTEMS).map(([k, s]) => `<option value="${k}">${s.name}</option>`).join("")}
              </select>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                  <span id="lbl-conc-a-name" style="color: #94a3b8;">[Reactant A]</span>
                  <span id="lbl-conc-a" style="color: #f59e0b; font-family: var(--font-mono); font-weight: 700;">0.10 M</span>
                </div>
                <input type="range" id="slider-conc-a" min="0.02" max="0.50" step="0.02" value="0.10" style="width: 100%;">
              </div>
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                  <span id="lbl-conc-b-name" style="color: #94a3b8;">[Reactant B]</span>
                  <span id="lbl-conc-b" style="color: #38bdf8; font-family: var(--font-mono); font-weight: 700;">0.10 M</span>
                </div>
                <input type="range" id="slider-conc-b" min="0.02" max="0.50" step="0.02" value="0.10" style="width: 100%;">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 12px; margin-bottom: 12px; align-items: center;">
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                  <span style="color: #94a3b8;">Temperature T</span>
                  <span id="lbl-temp" style="color: #f43f5e; font-family: var(--font-mono); font-weight: 700;">25 °C (298 K)</span>
                </div>
                <input type="range" id="slider-temp" min="0" max="80" step="1" value="25" style="width: 100%;">
              </div>
              <div style="padding-top: 14px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.78rem; color: #e2e8f0;">
                  <input type="checkbox" id="check-catalyst" style="width: 16px; height: 16px; accent-color: #10b981;">
                  <span style="font-weight: 700; color: #10b981;">⚡ Add Catalyst</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Analytical Telemetry Chart -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Real-Time Kinetics Curves [Concentration vs Time]</span>
              <span id="chart-ea-badge" style="font-size: 0.72rem; color: #10b981; font-family: var(--font-mono); font-weight: 700;">Ea = 52.0 kJ/mol</span>
            </div>
            <canvas id="kinetics-chart-canvas" width="460" height="150" style="width: 100%; height: 150px; background: rgba(0,0,0,0.3); border-radius: 8px;"></canvas>
          </div>

          <!-- Checkpoint Question Integration Mount -->
          <div id="kinetics-checkpoint-mount"></div>
        </div>
      </div>
    </div>
  `;

  // Canvas context setup
  const mainCanvas = document.getElementById("kinetics-canvas");
  const ctx = mainCanvas.getContext("2d");
  const chartCanvas = document.getElementById("kinetics-chart-canvas");
  const chartCtx = chartCanvas.getContext("2d");

  initParticles();

  // Draw Simulation Frame
  function renderSim() {
    ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    const kin = calculateKinetics();
    const sys = REACTION_SYSTEMS[currentSystemKey];

    // Background Reaction Beaker & Fluid
    const beakerX = 80;
    const beakerY = 90;
    const beakerW = 280;
    const beakerH = 340;

    // Beaker Glass Outline
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(beakerX, beakerY);
    ctx.lineTo(beakerX, beakerY + beakerH);
    ctx.arcTo(beakerX, beakerY + beakerH + 20, beakerX + 20, beakerY + beakerH + 20, 20);
    ctx.lineTo(beakerX + beakerW - 20, beakerY + beakerH + 20);
    ctx.arcTo(beakerX + beakerW, beakerY + beakerH + 20, beakerX + beakerW, beakerY + beakerH, 20);
    ctx.lineTo(beakerX + beakerW, beakerY);
    ctx.stroke();

    // Liquid Fill with Progressive Color Transition
    const fluidGrad = ctx.createLinearGradient(beakerX, beakerY + 60, beakerX, beakerY + beakerH);
    const alpha = Math.min(0.95, 0.2 + reactionProgress * 0.75);
    fluidGrad.addColorStop(0, hasCatalyst ? "rgba(16, 185, 129, 0.4)" : "rgba(8, 47, 73, 0.6)");
    fluidGrad.addColorStop(1, reactionProgress > 0.8 ? sys.colorEnd : sys.colorStart);

    ctx.fillStyle = fluidGrad;
    ctx.fillRect(beakerX + 4, beakerY + 60, beakerW - 8, beakerH - 42);

    // Magnetic Stirrer Bar at Bottom
    ctx.save();
    ctx.translate(beakerX + beakerW / 2, beakerY + beakerH - 12);
    ctx.rotate((simTime * 8) % (Math.PI * 2));
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-22, -5, 44, 10);
    ctx.restore();

    // Molecular Particles in Solution
    particles.forEach(p => {
      // Movement scaled with temperature
      const speedMult = Math.sqrt((tempC + 273.15) / 298.15);
      p.x += p.vx * speedMult;
      p.y += p.vy * speedMult;

      // Wall reflections inside beaker
      if (p.x < beakerX + 15 || p.x > beakerX + beakerW - 15) p.vx *= -1;
      if (p.y < beakerY + 70 || p.y > beakerY + beakerH - 20) p.vy *= -1;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Particle collision logic & reactive transformation
    if (isRunning && reactionProgress < 1.0) {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          if ((p1.type === "A" && p2.type === "B") || (p1.type === "B" && p2.type === "A")) {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.hypot(dx, dy);
            if (dist < p1.radius + p2.radius + 2) {
              // Collision occurs: Flash transition state
              ctx.fillStyle = "#facc15";
              ctx.beginPath();
              ctx.arc((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, 8, 0, Math.PI * 2);
              ctx.fill();

              // Chance of successful reaction depends on activation energy & temp
              if (Math.random() < kin.k * 3.5) {
                p1.type = "P";
                p1.color = "#10b981"; // Emerald product
                p2.type = "P";
                p2.color = "#10b981";
              }
            }
          }
        }
      }
    }

    // Right side instrument telemetry meters
    const meterX = 400;
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 11px var(--font-mono)";
    ctx.fillText("COLLISION FREQUENCY Z", meterX, 130);
    const zRate = Math.round(particles.length * Math.sqrt(kin.tempK) * 12);
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 15px var(--font-mono)";
    ctx.fillText(`${zRate.toLocaleString()} s⁻¹`, meterX, 150);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 11px var(--font-mono)";
    ctx.fillText("EFFECTIVE FRACTION exp(-Ea/RT)", meterX, 190);
    const fEff = Math.exp(-kin.activeEa * 1000 / (GAS_CONSTANT * kin.tempK));
    ctx.fillStyle = "#facc15";
    ctx.font = "bold 15px var(--font-mono)";
    ctx.fillText(fEff.toExponential(3), meterX, 210);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 11px var(--font-mono)";
    ctx.fillText("ACTIVATION ENERGY Ea", meterX, 250);
    ctx.fillStyle = hasCatalyst ? "#10b981" : "#f43f5e";
    ctx.font = "bold 15px var(--font-mono)";
    ctx.fillText(`${kin.activeEa.toFixed(1)} kJ/mol ${hasCatalyst ? "(Catalyzed)" : ""}`, meterX, 270);

    // Energy Profile Diagram (Mini thumbnail)
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(meterX, 310, 150, 100);
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(meterX, 310, 150, 100);

    // Uncatalyzed curve
    ctx.strokeStyle = "#f43f5e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(meterX + 10, 380);
    ctx.quadraticCurveTo(meterX + 75, 315, meterX + 140, 390);
    ctx.stroke();

    // Catalyzed curve
    if (hasCatalyst) {
      ctx.strokeStyle = "#10b981";
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(meterX + 10, 380);
      ctx.quadraticCurveTo(meterX + 75, 345, meterX + 140, 390);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "9px sans-serif";
    ctx.fillText("Reaction Coordinate →", meterX + 25, 400);

    // Update HTML HUD
    const hudRate = document.getElementById("hud-kinetics-rate");
    const hudTime = document.getElementById("hud-kinetics-time");
    if (hudRate) hudRate.textContent = `Rate = ${kin.rate.toFixed(5)} M/s • k = ${kin.k.toFixed(4)}`;
    if (hudTime) hudTime.textContent = `t = ${simTime.toFixed(1)} s • ${Math.round(reactionProgress * 100)}% Complete`;

    // Render Real-Time Analytical Chart
    renderChart();
  }

  function renderChart() {
    chartCtx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
    const w = chartCanvas.width;
    const h = chartCanvas.height;

    // Grid lines
    chartCtx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    chartCtx.lineWidth = 1;
    chartCtx.beginPath();
    for (let x = 40; x < w; x += 60) {
      chartCtx.moveTo(x, 10);
      chartCtx.lineTo(x, h - 25);
    }
    for (let y = 20; y < h - 20; y += 30) {
      chartCtx.moveTo(40, y);
      chartCtx.lineTo(w - 10, y);
    }
    chartCtx.stroke();

    // Axes
    chartCtx.strokeStyle = "#94a3b8";
    chartCtx.lineWidth = 1.5;
    chartCtx.beginPath();
    chartCtx.moveTo(40, 10);
    chartCtx.lineTo(40, h - 25);
    chartCtx.lineTo(w - 10, h - 25);
    chartCtx.stroke();

    // Axis Labels
    chartCtx.fillStyle = "#94a3b8";
    chartCtx.font = "10px var(--font-mono)";
    chartCtx.fillText("Time (s)", w / 2 - 20, h - 8);
    chartCtx.save();
    chartCtx.translate(14, h / 2 + 15);
    chartCtx.rotate(-Math.PI / 2);
    chartCtx.fillText("[Concentration] M", 0, 0);
    chartCtx.restore();

    if (timeSeries.length < 2) return;

    // Plot [Reactant A] (Amber)
    chartCtx.strokeStyle = "#f59e0b";
    chartCtx.lineWidth = 2.2;
    chartCtx.beginPath();
    const maxT = Math.max(10, timeSeries[timeSeries.length - 1].time);
    timeSeries.forEach((pt, idx) => {
      const px = 40 + (pt.time / maxT) * (w - 60);
      const py = (h - 25) - (pt.concA / Math.max(0.01, concA)) * (h - 45);
      if (idx === 0) chartCtx.moveTo(px, py);
      else chartCtx.lineTo(px, py);
    });
    chartCtx.stroke();

    // Plot [Product] (Emerald)
    chartCtx.strokeStyle = "#10b981";
    chartCtx.lineWidth = 2.2;
    chartCtx.beginPath();
    timeSeries.forEach((pt, idx) => {
      const px = 40 + (pt.time / maxT) * (w - 60);
      const py = (h - 25) - (pt.productConc / Math.max(0.01, concA)) * (h - 45);
      if (idx === 0) chartCtx.moveTo(px, py);
      else chartCtx.lineTo(px, py);
    });
    chartCtx.stroke();
  }

  // Animation Loop
  function loop() {
    if (!container || !container.isConnected) {
      isRunning = false;
      if (animId) cancelAnimationFrame(animId);
      return;
    }
    if (isRunning) {
      simTime += 0.05;
      const kin = calculateKinetics();
      reactionProgress = Math.min(1.0, reactionProgress + kin.rate * 0.4);
      if (Math.floor(simTime * 20) % 6 === 0) {
        recordTelemetryPoint();
      }
      if (reactionProgress >= 1.0) {
        isRunning = false;
        SoundFX.playSuccess();
        const playBtn = document.getElementById("btn-kinetics-play");
        if (playBtn) playBtn.textContent = "✔ Reaction Complete";
      }
    }
    renderSim();
    animId = requestAnimationFrame(loop);
  }

  // Wire Controls & DOM Events
  const playBtn = document.getElementById("btn-kinetics-play");
  const resetBtn = document.getElementById("btn-kinetics-reset");
  const exportBtn = document.getElementById("btn-kinetics-export");
  const selectSys = document.getElementById("select-kinetics-sys");
  const sliderConcA = document.getElementById("slider-conc-a");
  const sliderConcB = document.getElementById("slider-conc-b");
  const sliderTemp = document.getElementById("slider-temp");
  const checkCatalyst = document.getElementById("check-catalyst");
  const viewSim = document.getElementById("view-mode-kinetics-sim");
  const viewPhoto = document.getElementById("view-mode-kinetics-photo");
  const photoOverlay = document.getElementById("kinetics-photo-overlay");
  const photoEa = document.getElementById("photo-ea-val");
  const chartEaBadge = document.getElementById("chart-ea-badge");

  playBtn?.addEventListener("click", () => {
    SoundFX.playClick();
    if (reactionProgress >= 1.0) {
      reactionProgress = 0;
      simTime = 0;
      timeSeries.length = 0;
      initParticles();
    }
    isRunning = !isRunning;
    playBtn.textContent = isRunning ? "⏸ Pause Reaction" : "▶ Resume Reaction";
    playBtn.className = isRunning ? "btn btn-secondary btn-sm" : "btn btn-primary btn-sm";
  });

  resetBtn?.addEventListener("click", () => {
    SoundFX.playPop();
    isRunning = false;
    reactionProgress = 0;
    simTime = 0;
    timeSeries.length = 0;
    initParticles();
    if (playBtn) {
      playBtn.textContent = "▶ Start Reaction";
      playBtn.className = "btn btn-primary btn-sm";
    }
    renderSim();
  });

  selectSys?.addEventListener("change", (e) => {
    currentSystemKey = e.target.value;
    const sys = REACTION_SYSTEMS[currentSystemKey];
    concA = sys.defaultConcA;
    concB = sys.defaultConcB;
    if (sliderConcA) sliderConcA.value = concA;
    if (sliderConcB) sliderConcB.value = concB;
    const lblA = document.getElementById("lbl-conc-a-name");
    const lblB = document.getElementById("lbl-conc-b-name");
    if (lblA) lblA.textContent = sys.reactantA;
    if (lblB) lblB.textContent = sys.reactantB;
    document.getElementById("lbl-conc-a").textContent = `${concA.toFixed(2)} M`;
    document.getElementById("lbl-conc-b").textContent = `${concB.toFixed(2)} M`;
    resetBtn?.click();
  });

  sliderConcA?.addEventListener("input", (e) => {
    concA = parseFloat(e.target.value);
    document.getElementById("lbl-conc-a").textContent = `${concA.toFixed(2)} M`;
    initParticles();
    renderSim();
  });

  sliderConcB?.addEventListener("input", (e) => {
    concB = parseFloat(e.target.value);
    document.getElementById("lbl-conc-b").textContent = `${concB.toFixed(2)} M`;
    initParticles();
    renderSim();
  });

  sliderTemp?.addEventListener("input", (e) => {
    tempC = parseInt(e.target.value, 10);
    document.getElementById("lbl-temp").textContent = `${tempC} °C (${tempC + 273} K)`;
    renderSim();
  });

  checkCatalyst?.addEventListener("change", (e) => {
    hasCatalyst = e.target.checked;
    SoundFX.playBeep();
    const sys = REACTION_SYSTEMS[currentSystemKey];
    const activeEa = hasCatalyst ? sys.catalyzedEa : sys.baseEa;
    if (chartEaBadge) chartEaBadge.textContent = `Ea = ${activeEa.toFixed(1)} kJ/mol ${hasCatalyst ? "(Catalyzed)" : ""}`;
    if (photoEa) photoEa.textContent = `${activeEa.toFixed(1)} kJ/mol ${hasCatalyst ? "(Catalyzed)" : "(Uncatalyzed)"}`;
    renderSim();
  });

  // Switch between dynamics simulator and 4K real lab bench
  viewSim?.addEventListener("click", () => {
    viewSim.classList.add("active");
    viewPhoto.classList.remove("active");
    viewSim.style.background = "";
    viewPhoto.style.background = "transparent";
    if (photoOverlay) photoOverlay.style.display = "none";
  });

  viewPhoto?.addEventListener("click", () => {
    viewPhoto.classList.add("active");
    viewSim.classList.remove("active");
    viewPhoto.style.background = "";
    viewSim.style.background = "transparent";
    if (photoOverlay) photoOverlay.style.display = "block";
  });

  exportBtn?.addEventListener("click", () => {
    if (timeSeries.length === 0) recordTelemetryPoint();
    exportLabDataCsv("Chemical_Kinetics_Reaction_Rates", timeSeries);
  });

  // Checkpoint Assessment
  mountLabCheckpoint("kinetics-checkpoint-mount", "chem-kinetics");

  // Initial draw and run
  renderSim();
  animId = requestAnimationFrame(loop);

  // Return Cleanup function
  return () => {
    if (animId) cancelAnimationFrame(animId);
  };
}
