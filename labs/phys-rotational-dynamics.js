// Edugates-ClipSAT Science Labs - Physics: Rotational Dynamics & Moment of Inertia Suite
// 60 FPS Precision Classical Mechanics Simulation:
// Torque τ = I·α, Incline Rolling Race (Rolling without Slipping v = ωR),
// Moment of Inertia Geometric Shapes, Kinetic Energy Partition (Translational vs Rotational), and Laser Photogates.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initRotationalDynamicsLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Geometric Shapes with Inertia Coefficient c where I = c * M * R^2
  const SHAPES = {
    sphere: { name: "Solid Sphere", formula: "I = \\frac{2}{5}MR^2", c: 0.40, color: "#38bdf8", strokeColor: "#0284c7" },
    disk: { name: "Solid Cylinder / Disk", formula: "I = \\frac{1}{2}MR^2", c: 0.50, color: "#10b981", strokeColor: "#059669" },
    shell: { name: "Spherical Shell (Hollow)", formula: "I = \\frac{2}{3}MR^2", c: 0.67, color: "#a855f7", strokeColor: "#7e22ce" },
    hoop: { name: "Hoop / Ring (Cylindrical)", formula: "I = 1.0MR^2", c: 1.00, color: "#f59e0b", strokeColor: "#d97706" },
    block: { name: "Frictionless Slider (Point Mass)", formula: "I = 0", c: 0.00, color: "#f43f5e", strokeColor: "#e11d48" }
  };

  // State
  let shapeAKey = "sphere";
  let shapeBKey = "hoop";
  let inclineAngleDeg = 20.0; // degrees
  let trackLengthM = 3.0; // meters
  let massKg = 1.0;
  let radiusM = 0.15;
  const g = 9.81;

  // Race Dynamics
  let isRacing = false;
  let raceTime = 0.0;
  let distA = 0.0; // meters
  let distB = 0.0;
  let finishTimeA = null;
  let finishTimeB = null;

  let isRunning = true;
  let animId = null;

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #f59e0b; box-shadow: 0 0 10px #f59e0b;"></span>
            Rotational Dynamics &amp; Moment of Inertia
          </span>
          <span class="badge" style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); color: #fbbf24; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            a = \\frac{g \\sin\\theta}{1 + I/(MR^2)} \\quad KE_{\\text{tot}} = \\frac{1}{2}mv^2 + \\frac{1}{2}I\\omega^2
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-rot-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Track Simulator
            </button>
            <button id="view-mode-rot-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-rot-release" style="padding: 5px 14px; font-size: 0.78rem;">
            🏁 Release Gate (Race!)
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-rot-reset" style="padding: 5px 12px; font-size: 0.78rem;">
            ⟲ Reset Track
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-rot-export" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export Telemetry
          </button>
        </div>
      </div>

      <!-- Main Layout -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="rot-layout">
        <!-- Canvas Viewport: Incline Plane & Laser Photogates -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(245, 158, 11, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #291e0a 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="rot-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
          <div id="rot-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <img src="assets/labs/rotational_bench.jpg" alt="4K Classical Mechanics & Rotational Dynamics Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            
            <!-- Live Analytical Telemetry Callout on Photo -->
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Incline Track &amp; Photogates</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Dual PASCO Smart Timing Gates</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Geometric Rolling Bodies</div>
                <div style="color: #facc15; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Solid Disk • Hoop • Steel Sphere</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">PASCO Smart Digital Timer</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Elapsed Millisecond Precision</div>
              </div>
            </div>
          </div>

          <!-- Top HUD -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">LANE A: TIME &amp; VELOCITY</div>
              <div id="hud-rot-lane-a" style="font-size: 1.15rem; font-weight: 800; color: #38bdf8; font-family: var(--font-mono);">
                0.000 s • 0.00 m/s
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">LANE B: TIME &amp; VELOCITY</div>
              <div id="hud-rot-lane-b" style="font-size: 1.15rem; font-weight: 800; color: #fbbf24; font-family: var(--font-mono);">
                0.000 s • 0.00 m/s
              </div>
            </div>
          </div>
        </div>

        <!-- Controls & Energy Distribution Analysis -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Controls Panel -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #fbbf24; text-transform: uppercase; margin-bottom: 12px;">Competitor Shapes &amp; Incline Ramp</div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div>
                <label style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Competitor A (Blue)</label>
                <select id="select-rot-shape-a" class="form-control" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                  ${Object.entries(SHAPES).map(([k, s]) => `<option value="${k}" ${k === 'sphere' ? 'selected' : ''}>${s.name}</option>`).join("")}
                </select>
              </div>

              <div>
                <label style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Competitor B (Amber)</label>
                <select id="select-rot-shape-b" class="form-control" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                  ${Object.entries(SHAPES).map(([k, s]) => `<option value="${k}" ${k === 'hoop' ? 'selected' : ''}>${s.name}</option>`).join("")}
                </select>
              </div>
            </div>

            <!-- Incline Angle Slider -->
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                <span style="color: #94a3b8;">Ramp Incline Angle (θ)</span>
                <span id="lbl-rot-angle" style="font-weight: 700; color: #38bdf8; font-family: var(--font-mono);">20.0°</span>
              </div>
              <input type="range" id="slider-rot-angle" min="5.0" max="45.0" step="0.5" value="20.0" style="width: 100%; accent-color: #38bdf8;">
            </div>

            <!-- Track Length Slider -->
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                <span style="color: #94a3b8;">Ramp Length (L)</span>
                <span id="lbl-rot-length" style="font-weight: 700; color: #fbbf24; font-family: var(--font-mono);">3.00 m</span>
              </div>
              <input type="range" id="slider-rot-length" min="1.0" max="5.0" step="0.25" value="3.00" style="width: 100%; accent-color: #fbbf24;">
            </div>
          </div>

          <!-- Energy Partition Bar Charts -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; flex: 1; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">
                Kinetic Energy Partition (Cyan: Translational, Orange: Rotational)
              </span>
              <span style="font-size: 0.72rem; color: #fbbf24; font-family: var(--font-mono);">
                KE Breakdown (%)
              </span>
            </div>
            <div style="position: relative; flex: 1; min-height: 180px;">
              <canvas id="rot-chart-canvas" width="460" height="180" style="width: 100%; height: 180px; display: block; border-radius: 6px;"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Assessment Checkpoint Container -->
      <div id="rotational-checkpoint-container" style="margin-top: 24px;"></div>
    </div>
  `;

  const canvas = container.querySelector("#rot-canvas");
  const ctx = canvas.getContext("2d");
  const chartCanvas = container.querySelector("#rot-chart-canvas");
  const chartCtx = chartCanvas.getContext("2d");

  // Physics Calculations
  function getLinearAcceleration(shapeKey) {
    const c = SHAPES[shapeKey].c;
    const thetaRad = (inclineAngleDeg * Math.PI) / 180.0;
    return (g * Math.sin(thetaRad)) / (1.0 + c);
  }

  function stepRace() {
    if (!isRacing) return;

    const dt = 0.02; // seconds
    raceTime += dt;

    const accA = getLinearAcceleration(shapeAKey);
    const accB = getLinearAcceleration(shapeBKey);

    if (distA < trackLengthM) {
      distA = 0.5 * accA * raceTime * raceTime;
      if (distA >= trackLengthM) {
        distA = trackLengthM;
        finishTimeA = raceTime;
      }
    }

    if (distB < trackLengthM) {
      distB = 0.5 * accB * raceTime * raceTime;
      if (distB >= trackLengthM) {
        distB = trackLengthM;
        finishTimeB = raceTime;
      }
    }

    const velA = accA * (finishTimeA || raceTime);
    const velB = accB * (finishTimeB || raceTime);

    const hudA = container.querySelector("#hud-rot-lane-a");
    const hudB = container.querySelector("#hud-rot-lane-b");
    if (hudA) hudA.innerText = `${(finishTimeA || raceTime).toFixed(3)} s • ${velA.toFixed(2)} m/s`;
    if (hudB) hudB.innerText = `${(finishTimeB || raceTime).toFixed(3)} s • ${velB.toFixed(2)} m/s`;

    if (distA >= trackLengthM && distB >= trackLengthM) {
      isRacing = false;
      SoundFX.playSuccessFanfare();
    }
  }

  function drawRampAndRacers() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Coordinate Ramp Geometry
    const thetaRad = (inclineAngleDeg * Math.PI) / 180.0;
    const rampStartX = 60;
    const rampEndX = 520;
    const rampBaseY = 440;
    const rampHeightPx = (rampEndX - rampStartX) * Math.tan(thetaRad);
    const rampTopY = rampBaseY - rampHeightPx;

    // Draw Incline Wedge
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rampStartX, rampBaseY);
    ctx.lineTo(rampEndX, rampBaseY);
    ctx.lineTo(rampStartX, rampTopY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Laser Photogate at Start
    ctx.strokeStyle = "rgba(244, 63, 94, 0.8)";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(rampStartX + 20, rampTopY - 30);
    ctx.lineTo(rampStartX + 20, rampTopY + 30);
    ctx.stroke();
    ctx.setLineDash([]);

    // Laser Photogate at Finish
    ctx.strokeStyle = "rgba(16, 185, 129, 0.8)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(rampEndX - 10, rampBaseY - 40);
    ctx.lineTo(rampEndX - 10, rampBaseY + 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // Competitor A Position along incline
    const fracA = Math.min(1.0, distA / trackLengthM);
    const curXA = rampStartX + fracA * (rampEndX - rampStartX);
    const curYA = rampTopY + fracA * rampHeightPx - 18;

    // Competitor B Position along incline
    const fracB = Math.min(1.0, distB / trackLengthM);
    const curXB = rampStartX + fracB * (rampEndX - rampStartX);
    const curYB = rampTopY + fracB * rampHeightPx - 42; // offset higher

    const rotAngleA = (distA / radiusM) % (Math.PI * 2);
    const rotAngleB = (distB / radiusM) % (Math.PI * 2);

    // Draw Competitor A
    ctx.save();
    ctx.translate(curXA, curYA);
    ctx.rotate(rotAngleA);
    ctx.fillStyle = SHAPES[shapeAKey].color;
    ctx.strokeStyle = SHAPES[shapeAKey].strokeColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Spoke mark to see rotation
    ctx.strokeStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(16, 0);
    ctx.stroke();
    ctx.restore();

    // Draw Competitor B
    ctx.save();
    ctx.translate(curXB, curYB);
    ctx.rotate(rotAngleB);
    ctx.fillStyle = SHAPES[shapeBKey].color;
    ctx.strokeStyle = SHAPES[shapeBKey].strokeColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(16, 0);
    ctx.stroke();
    ctx.restore();

    // Labels
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px system-ui";
    ctx.textAlign = "left";
    ctx.fillText(`Incline θ = ${inclineAngleDeg.toFixed(1)}°`, rampStartX + 80, rampBaseY - 15);
    ctx.fillText(`Track Length L = ${trackLengthM.toFixed(2)} m`, rampStartX + 80, rampBaseY - 30);
  }

  function drawEnergyChart() {
    chartCtx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);

    // Background
    chartCtx.fillStyle = "#030712";
    chartCtx.fillRect(0, 0, chartCanvas.width, chartCanvas.height);

    const cA = SHAPES[shapeAKey].c;
    const cB = SHAPES[shapeBKey].c;

    // Percent Translational KE = 1 / (1 + c)
    const transPctA = (1.0 / (1.0 + cA)) * 100;
    const rotPctA = 100 - transPctA;

    const transPctB = (1.0 / (1.0 + cB)) * 100;
    const rotPctB = 100 - transPctB;

    // Bar 1: Competitor A
    chartCtx.fillStyle = "#94a3b8";
    chartCtx.font = "11px system-ui";
    chartCtx.textAlign = "left";
    chartCtx.fillText(`Competitor A: ${SHAPES[shapeAKey].name}`, 40, 35);

    const barW = 340;
    const transWA = (transPctA / 100) * barW;
    const rotWA = barW - transWA;

    chartCtx.fillStyle = "#06b6d4"; // Translational
    chartCtx.fillRect(40, 45, transWA, 28);
    chartCtx.fillStyle = "#f97316"; // Rotational
    chartCtx.fillRect(40 + transWA, 45, rotWA, 28);

    chartCtx.fillStyle = "#ffffff";
    chartCtx.font = "bold 10px system-ui";
    chartCtx.fillText(`${transPctA.toFixed(1)}% Trans`, 50, 63);
    if (rotWA > 40) chartCtx.fillText(`${rotPctA.toFixed(1)}% Rot`, 40 + transWA + 10, 63);

    // Bar 2: Competitor B
    chartCtx.fillStyle = "#94a3b8";
    chartCtx.font = "11px system-ui";
    chartCtx.fillText(`Competitor B: ${SHAPES[shapeBKey].name}`, 40, 110);

    const transWB = (transPctB / 100) * barW;
    const rotWB = barW - transWB;

    chartCtx.fillStyle = "#06b6d4";
    chartCtx.fillRect(40, 120, transWB, 28);
    chartCtx.fillStyle = "#f97316";
    chartCtx.fillRect(40 + transWB, 120, rotWB, 28);

    chartCtx.fillStyle = "#ffffff";
    chartCtx.font = "bold 10px system-ui";
    chartCtx.fillText(`${transPctB.toFixed(1)}% Trans`, 50, 138);
    if (rotWB > 40) chartCtx.fillText(`${rotPctB.toFixed(1)}% Rot`, 40 + transWB + 10, 138);
  }

  let lastRotTime = 0;
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

    const photoEl = container.querySelector("#rot-photo-overlay");
    const isPhotoOverlay = photoEl && photoEl.style.display === "block";

    if (!isPhotoOverlay) {
      if (isRacing) {
        if (!now || now - lastRotTime >= interval) {
          lastRotTime = now || performance.now();
          stepRace();
          drawRampAndRacers();
          drawEnergyChart();
        }
      } else if (needsRedraw) {
        drawRampAndRacers();
        drawEnergyChart();
        needsRedraw = false;
      }
    }
    animId = requestAnimationFrame(loop);
  }

  // Event Listeners
  container.querySelector("#btn-rot-release")?.addEventListener("click", () => {
    isRacing = true;
    raceTime = 0.0;
    distA = 0.0;
    distB = 0.0;
    finishTimeA = null;
    finishTimeB = null;
    SoundFX.playScorePip();
  });

  container.querySelector("#btn-rot-reset")?.addEventListener("click", () => {
    isRacing = false;
    raceTime = 0.0;
    distA = 0.0;
    distB = 0.0;
    finishTimeA = null;
    finishTimeB = null;
    needsRedraw = true;
    SoundFX.playClick();
  });

  container.querySelector("#select-rot-shape-a")?.addEventListener("change", (e) => {
    shapeAKey = e.target.value;
    needsRedraw = true;
    SoundFX.playClick();
  });

  container.querySelector("#select-rot-shape-b")?.addEventListener("change", (e) => {
    shapeBKey = e.target.value;
    needsRedraw = true;
    SoundFX.playClick();
  });

  container.querySelector("#slider-rot-angle")?.addEventListener("input", (e) => {
    inclineAngleDeg = parseFloat(e.target.value);
    container.querySelector("#lbl-rot-angle").innerText = `${inclineAngleDeg.toFixed(1)}°`;
    needsRedraw = true;
  });

  container.querySelector("#slider-rot-length")?.addEventListener("input", (e) => {
    trackLengthM = parseFloat(e.target.value);
    container.querySelector("#lbl-rot-length").innerText = `${trackLengthM.toFixed(2)} m`;
    needsRedraw = true;
  });

  container.querySelector("#btn-rot-export")?.addEventListener("click", () => {
    const accA = getLinearAcceleration(shapeAKey);
    const accB = getLinearAcceleration(shapeBKey);
    exportLabDataCsv({
      title: "Rotational Dynamics & Incline Rolling Race Telemetry",
      labId: "rotational",
      parameters: {
        "Competitor A": SHAPES[shapeAKey].name,
        "Competitor B": SHAPES[shapeBKey].name,
        "Incline Angle (deg)": inclineAngleDeg,
        "Track Length (m)": trackLengthM
      },
      headers: ["Competitor", "Shape Name", "Inertia Formula", "Inertia Coeff c", "Acceleration (m/s²)", "Finish Time (s)"],
      dataRows: [
        ["A", SHAPES[shapeAKey].name, SHAPES[shapeAKey].formula, SHAPES[shapeAKey].c, accA.toFixed(3), (finishTimeA || 0).toFixed(3)],
        ["B", SHAPES[shapeBKey].name, SHAPES[shapeBKey].formula, SHAPES[shapeBKey].c, accB.toFixed(3), (finishTimeB || 0).toFixed(3)]
      ]
    });
  });

  // 4K Photo View Switcher
  const btnRotSim = container.querySelector("#view-mode-rot-sim");
  const btnRotPhoto = container.querySelector("#view-mode-rot-photo");
  const rotPhotoOverlay = container.querySelector("#rot-photo-overlay");

  btnRotSim?.addEventListener("click", () => {
    btnRotSim.classList.add("active");
    btnRotSim.style.background = "";
    btnRotPhoto.classList.remove("active");
    btnRotPhoto.style.background = "transparent";
    if (rotPhotoOverlay) rotPhotoOverlay.style.display = "none";
    SoundFX.playClick();
  });

  btnRotPhoto?.addEventListener("click", () => {
    btnRotPhoto.classList.add("active");
    btnRotPhoto.style.background = "";
    btnRotSim.classList.remove("active");
    btnRotSim.style.background = "transparent";
    if (rotPhotoOverlay) rotPhotoOverlay.style.display = "block";
    SoundFX.playClick();
  });

  // Mount Assessment
  mountLabCheckpoint("rotational-checkpoint-container", "rotational");

  // Launch
  loop();

  return () => {
    isRunning = false;
    if (animId) cancelAnimationFrame(animId);
  };
}
