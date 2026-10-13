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

  // Contact Dust & Spark Micro-Particles
  const dustParticles = [];

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #f59e0b; box-shadow: 0 0 10px #f59e0b;"></span>
            Rotational Dynamics &amp; Moment of Inertia
          </span>
          <span class="badge" style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); color: #fbbf24; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            ${renderLatex("a = \\frac{g \\sin\\theta}{1 + I/(MR^2)} \\quad \\bullet \\quad KE_{\\text{tot}} = \\frac{1}{2}mv^2 + \\frac{1}{2}I\\omega^2")}
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-rot-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Track Simulator
            </button>
            <button id="view-mode-rot-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-rot-release" style="padding: 5px 14px; font-size: 0.78rem; background: linear-gradient(135deg, #f59e0b, #d97706); border: none; font-weight: 700; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.35);">
            🏁 Release Gate (Race!)
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-rot-reset" style="padding: 5px 12px; font-size: 0.78rem;">
            ⟲ Reset Track
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-rot-export" title="Export experimental telemetry to RFC-4180 CSV (Hotkey: E)" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export CSV (E)
          </button>
        </div>
      </div>

      <!-- Main Layout -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="rot-layout">
        <!-- Canvas Viewport: Incline Plane & Laser Photogates -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(245, 158, 11, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #1e1708 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="rot-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
          <div id="rot-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <picture>
              <source srcset="assets/labs/rotational_bench.webp" type="image/webp">
              <img src="assets/labs/rotational_bench.jpg" decoding="async" loading="lazy" alt="4K Classical Mechanics & Rotational Dynamics Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            </picture>
            
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
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto; box-shadow: 0 6px 18px rgba(0,0,0,0.6);">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase; display: flex; align-items: center; gap: 6px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #38bdf8; display: inline-block; box-shadow: 0 0 6px #38bdf8;"></span>
                LANE A: TIME &amp; VELOCITY
              </div>
              <div id="hud-rot-lane-a" style="font-size: 1.15rem; font-weight: 800; color: #38bdf8; font-family: var(--font-mono);">
                0.000 s • 0.00 m/s
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto; box-shadow: 0 6px 18px rgba(0,0,0,0.6);">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase; display: flex; align-items: center; justify-content: flex-end; gap: 6px;">
                LANE B: TIME &amp; VELOCITY
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #fbbf24; display: inline-block; box-shadow: 0 0 6px #fbbf24;"></span>
              </div>
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
                <label style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Competitor A (Cyan Lane)</label>
                <select id="select-rot-shape-a" class="form-control" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                  ${Object.entries(SHAPES).map(([k, s]) => `<option value="${k}" ${k === 'sphere' ? 'selected' : ''}>${s.name}</option>`).join("")}
                </select>
              </div>

              <div>
                <label style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Competitor B (Amber Lane)</label>
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

  // HiDPI / Retina Canvas Initialization
  const logicalW = 580;
  const logicalH = 530;
  const chartLogicalW = 460;
  const chartLogicalH = 180;
  let needsRedraw = true;

  function setupHiDPICanvas() {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (typeof window.getOptimizedDPR === "function" ? window.getOptimizedDPR() : (window.devicePixelRatio || 1));
    const rect = canvas.getBoundingClientRect();
    const w = rect.width > 0 ? rect.width : logicalW;
    const h = rect.height > 0 ? rect.height : logicalH;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.resetTransform();
    ctx.scale(dpr * (w / logicalW), dpr * (h / logicalH));

    const chartRect = chartCanvas.getBoundingClientRect();
    const cw = chartRect.width > 0 ? chartRect.width : chartLogicalW;
    const ch = chartRect.height > 0 ? chartRect.height : chartLogicalH;
    chartCanvas.width = Math.round(cw * dpr);
    chartCanvas.height = Math.round(ch * dpr);
    chartCtx.resetTransform();
    chartCtx.scale(dpr * (cw / chartLogicalW), dpr * (ch / chartLogicalH));

    needsRedraw = true;
  }
  setupHiDPICanvas();
  window.addEventListener("resize", setupHiDPICanvas);

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

    // Spawn rolling friction / dust particles at contact points
    const thetaRad = (inclineAngleDeg * Math.PI) / 180.0;
    const rampStartX = 65;
    const rampEndX = 515;
    const rampBaseY = 445;
    const rampHeightPx = (rampEndX - rampStartX) * Math.tan(thetaRad);
    const rampTopY = rampBaseY - rampHeightPx;

    if (distA < trackLengthM && velA > 0.3) {
      const fracA = distA / trackLengthM;
      const xA = rampStartX + fracA * (rampEndX - rampStartX);
      const yA = rampTopY + fracA * rampHeightPx - 10;
      dustParticles.push({
        x: xA - Math.cos(thetaRad) * 6,
        y: yA - Math.sin(thetaRad) * 6,
        vx: -Math.cos(thetaRad) * (0.8 + Math.random() * 1.2),
        vy: -Math.sin(thetaRad) * (0.8 + Math.random() * 1.2) - (0.5 + Math.random() * 0.8),
        size: 1.5 + Math.random() * 2.2,
        alpha: 0.8,
        color: "#38bdf8"
      });
    }

    if (distB < trackLengthM && velB > 0.3) {
      const fracB = distB / trackLengthM;
      const xB = rampStartX + fracB * (rampEndX - rampStartX);
      const yB = rampTopY + fracB * rampHeightPx - 38;
      dustParticles.push({
        x: xB - Math.cos(thetaRad) * 6,
        y: yB - Math.sin(thetaRad) * 6,
        vx: -Math.cos(thetaRad) * (0.8 + Math.random() * 1.2),
        vy: -Math.sin(thetaRad) * (0.8 + Math.random() * 1.2) - (0.5 + Math.random() * 0.8),
        size: 1.5 + Math.random() * 2.2,
        alpha: 0.8,
        color: "#fbbf24"
      });
    }

    const hudA = container.querySelector("#hud-rot-lane-a");
    const hudB = container.querySelector("#hud-rot-lane-b");
    if (hudA) hudA.innerText = `${(finishTimeA || raceTime).toFixed(3)} s • ${velA.toFixed(2)} m/s`;
    if (hudB) hudB.innerText = `${(finishTimeB || raceTime).toFixed(3)} s • ${velB.toFixed(2)} m/s`;

    if (distA >= trackLengthM && distB >= trackLengthM) {
      isRacing = false;
      SoundFX.playSuccessFanfare();
    }
  }

  // High-Fidelity 3D Shaded Rotational Geometry Renderer
  function drawRotationalBody(ctx, shapeKey, radius, baseColor, rotAngle, thetaRad) {
    ctx.save();
    // Tilt body coordinate system parallel to incline slope
    ctx.rotate(thetaRad);

    if (shapeKey === "sphere") {
      // 1. SOLID SPHERE (3D Spherical Shading & Rolling Meridians)
      // Sphere ambient shadow underneath
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      ctx.beginPath();
      ctx.ellipse(0, radius + 2, radius * 0.9, radius * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Spherical 3D gradient body
      const sphereGrad = ctx.createRadialGradient(
        -radius * 0.35, -radius * 0.35, radius * 0.08,
        0, 0, radius
      );
      sphereGrad.addColorStop(0, "#ffffff");
      sphereGrad.addColorStop(0.25, baseColor);
      sphereGrad.addColorStop(0.75, "#0369a1");
      sphereGrad.addColorStop(1, "#082f49");

      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      // Outer rim edge
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Rolling 3D Longitude Meridian Lines (rotate in 3D around sphere)
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.clip();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
      ctx.lineWidth = 1.4;

      // 3 longitude rings at 60 degree offsets
      for (let offset = 0; offset < Math.PI; offset += Math.PI / 3) {
        const currentRot = rotAngle + offset;
        const cosR = Math.cos(currentRot);
        const sinR = Math.sin(currentRot);
        
        ctx.beginPath();
        // Ellipse representing tilted rolling meridian ring
        ctx.ellipse(0, 0, Math.abs(cosR) * radius, radius, Math.PI / 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Equator Ring
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, radius, radius * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Specular shine hotspot
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.beginPath();
      ctx.arc(-radius * 0.35, -radius * 0.35, radius * 0.22, 0, Math.PI * 2);
      ctx.fill();

    } else if (shapeKey === "disk") {
      // 2. SOLID CYLINDER / DISK (Brushed Aluminum Rim, Center Hub & Machined Spokes)
      // Rim drop shadow
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      ctx.beginPath();
      ctx.ellipse(0, radius + 2, radius * 0.9, radius * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Outer machined rim
      const diskGrad = ctx.createLinearGradient(-radius, -radius, radius, radius);
      diskGrad.addColorStop(0, "#059669");
      diskGrad.addColorStop(0.3, "#34d399");
      diskGrad.addColorStop(0.7, "#047857");
      diskGrad.addColorStop(1, "#064e3b");

      ctx.fillStyle = diskGrad;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      // Outer bevel chamfer
      ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // Concentric machined ring track
      ctx.strokeStyle = "rgba(16, 185, 129, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.72, 0, Math.PI * 2);
      ctx.stroke();

      // 6 Rotating Radial Spokes
      ctx.save();
      ctx.rotate(rotAngle);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.0;
      for (let s = 0; s < 6; s++) {
        const spAngle = (s * Math.PI) / 3;
        ctx.beginPath();
        ctx.moveTo(Math.cos(spAngle) * (radius * 0.25), Math.sin(spAngle) * (radius * 0.25));
        ctx.lineTo(Math.cos(spAngle) * (radius * 0.88), Math.sin(spAngle) * (radius * 0.88));
        ctx.stroke();
      }

      // Center Hub with Bearing Ball
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.32, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#34d399";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#f8fafc";
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

    } else if (shapeKey === "shell") {
      // 3. SPHERICAL SHELL (Translucent Polycarbonate Outer Wall & Hollow Interior)
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.beginPath();
      ctx.ellipse(0, radius + 2, radius * 0.9, radius * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Outer translucent shell
      const shellGrad = ctx.createRadialGradient(
        -radius * 0.3, -radius * 0.3, radius * 0.1,
        0, 0, radius
      );
      shellGrad.addColorStop(0, "rgba(216, 180, 254, 0.85)");
      shellGrad.addColorStop(0.6, "rgba(168, 85, 247, 0.7)");
      shellGrad.addColorStop(1, "rgba(88, 28, 135, 0.95)");

      ctx.fillStyle = shellGrad;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#c084fc";
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Inner hollow cavity boundary (visible through shell)
      ctx.save();
      ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.68, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(192, 132, 252, 0.45)";
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Rotating internal wireframe ribs
      ctx.rotate(rotAngle);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 0.68, radius * 0.25, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 0.25, radius * 0.68, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

    } else if (shapeKey === "hoop") {
      // 4. HOOP / RING (True Hollow Cutout Hole & Rotating Cross-Struts)
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      ctx.beginPath();
      ctx.ellipse(0, radius + 2, radius * 0.9, radius * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const rInner = radius * 0.70;

      // Outer Hoop Rim Ring with metallic gold gradient
      const hoopGrad = ctx.createLinearGradient(-radius, -radius, radius, radius);
      hoopGrad.addColorStop(0, "#fbbf24");
      hoopGrad.addColorStop(0.3, "#f59e0b");
      hoopGrad.addColorStop(0.7, "#b45309");
      hoopGrad.addColorStop(1, "#78350f");

      // Draw compound path with inner cutout (evenodd fill rule)
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2, false);
      ctx.arc(0, 0, rInner, 0, Math.PI * 2, true);
      ctx.fillStyle = hoopGrad;
      ctx.fill();

      // Rim edge highlights
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Inner rim inner boundary stroke
      ctx.strokeStyle = "#451a03";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, rInner, 0, Math.PI * 2);
      ctx.stroke();

      // 4 Rotating Lightweight Tension Struts
      ctx.save();
      ctx.rotate(rotAngle);
      ctx.strokeStyle = "#fef08a";
      ctx.lineWidth = 1.8;
      for (let i = 0; i < 4; i++) {
        const strutAng = (i * Math.PI) / 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(strutAng) * (radius * 0.2), Math.sin(strutAng) * (radius * 0.2));
        ctx.lineTo(Math.cos(strutAng) * rInner, Math.sin(strutAng) * rInner);
        ctx.stroke();
      }

      // Small central axle nub
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

    } else {
      // 5. FRICTIONLESS SLIDER (Point Mass on Aerodynamic Air Cushion)
      ctx.save();
      // Air-bearing glow underneath slider
      ctx.fillStyle = "rgba(244, 63, 94, 0.4)";
      ctx.beginPath();
      ctx.ellipse(0, radius * 0.85, radius * 1.1, radius * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();

      // Chamfered Aerodynamic Block
      const blockW = radius * 2.0;
      const blockH = radius * 1.5;
      const bGrad = ctx.createLinearGradient(-blockW / 2, -blockH / 2, blockW / 2, blockH / 2);
      bGrad.addColorStop(0, "#fb7185");
      bGrad.addColorStop(0.5, "#e11d48");
      bGrad.addColorStop(1, "#9f1239");

      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.roundRect(-blockW / 2, -blockH / 2, blockW, blockH, 4);
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Directional aero arrows
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(4, 0);
      ctx.lineTo(-4, -5);
      ctx.lineTo(-4, 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  function drawRampAndRacers() {
    ctx.clearRect(0, 0, logicalW, logicalH);

    // Coordinate Ramp Geometry
    const thetaRad = (inclineAngleDeg * Math.PI) / 180.0;
    const rampStartX = 65;
    const rampEndX = 515;
    const rampBaseY = 445;
    const rampHeightPx = (rampEndX - rampStartX) * Math.tan(thetaRad);
    const rampTopY = rampBaseY - rampHeightPx;

    // 1. Incline Wedge Background & Structural Truss
    ctx.save();
    // Drop shadow under ramp
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.beginPath();
    ctx.moveTo(rampStartX, rampBaseY + 8);
    ctx.lineTo(rampEndX + 16, rampBaseY + 8);
    ctx.lineTo(rampEndX + 6, rampBaseY - 6);
    ctx.lineTo(rampStartX - 8, rampBaseY - 6);
    ctx.closePath();
    ctx.fill();

    // Solid wedge block
    const wedgeGrad = ctx.createLinearGradient(rampStartX, rampTopY, rampEndX, rampBaseY);
    wedgeGrad.addColorStop(0, "#1e293b");
    wedgeGrad.addColorStop(0.6, "#0f172a");
    wedgeGrad.addColorStop(1, "#020617");

    ctx.fillStyle = wedgeGrad;
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(rampStartX, rampBaseY);
    ctx.lineTo(rampEndX, rampBaseY);
    ctx.lineTo(rampStartX, rampTopY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Structural Cross-Truss Ribs
    ctx.strokeStyle = "rgba(71, 85, 105, 0.25)";
    ctx.lineWidth = 1.5;
    const ribs = 6;
    for (let r = 1; r < ribs; r++) {
      const rx = rampStartX + (r / ribs) * (rampEndX - rampStartX);
      const ry = rampTopY + (r / ribs) * rampHeightPx;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx, rampBaseY);
      ctx.stroke();
    }

    // Heavy Rubber Stop Buffer at Finish Bottom
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(rampEndX, rampBaseY - 32, 14, 32);
    ctx.fillStyle = "#1e293b";
    for (let s = 0; s < 3; s++) {
      ctx.fillRect(rampEndX, rampBaseY - 30 + s * 10, 14, 5);
    }
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(rampEndX, rampBaseY - 32, 14, 32);

    // 2. Dual Aluminum Guide Tracks (Extruded Anodized Rails)
    // Lane B Rail (Upper Track, Amber)
    ctx.save();
    ctx.strokeStyle = "rgba(245, 158, 11, 0.55)";
    ctx.lineWidth = 4.0;
    ctx.beginPath();
    ctx.moveTo(rampStartX, rampTopY - 26);
    ctx.lineTo(rampEndX, rampBaseY - 26);
    ctx.stroke();

    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(rampStartX, rampTopY - 26);
    ctx.lineTo(rampEndX, rampBaseY - 26);
    ctx.stroke();

    // Lane A Rail (Lower Track, Cyan)
    ctx.strokeStyle = "rgba(56, 189, 248, 0.55)";
    ctx.lineWidth = 4.0;
    ctx.beginPath();
    ctx.moveTo(rampStartX, rampTopY + 2);
    ctx.lineTo(rampEndX, rampBaseY + 2);
    ctx.stroke();

    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(rampStartX, rampTopY + 2);
    ctx.lineTo(rampEndX, rampBaseY + 2);
    ctx.stroke();
    ctx.restore();

    // Metric Graduation Rulers along the ramp
    ctx.save();
    ctx.fillStyle = "#94a3b8";
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    const totalDistM = trackLengthM;
    const numTicks = Math.floor(totalDistM * 2); // every 0.5m
    for (let t = 0; t <= numTicks; t++) {
      const frac = t / numTicks;
      const tx = rampStartX + frac * (rampEndX - rampStartX);
      const ty = rampTopY + frac * rampHeightPx;
      const dM = (frac * totalDistM).toFixed(1);

      // Normal to ramp
      const nx = -Math.sin(thetaRad) * 6;
      const ny = Math.cos(thetaRad) * 6;

      ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(tx - nx, ty - ny + 8);
      ctx.lineTo(tx + nx, ty + ny + 8);
      ctx.stroke();

      if (t % 2 === 0) {
        ctx.fillText(`${dM}m`, tx + nx * 2, ty + ny * 2 + 18);
      }
    }
    ctx.restore();

    // 3. Active Laser Photogates
    // Start Photogate (x = 0)
    ctx.save();
    const gateStartTopX = rampStartX + 12;
    const gateStartTopY = rampTopY - 45;
    ctx.fillStyle = "#0f172a";
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.roundRect(gateStartTopX - 6, gateStartTopY, 12, 60, 4);
    ctx.fill();
    ctx.stroke();

    // Photogate Emitter LED
    ctx.fillStyle = isRacing ? "#ef4444" : "#22c55e";
    ctx.beginPath();
    ctx.arc(gateStartTopX, gateStartTopY + 8, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Red Laser Tripwire Beam
    ctx.strokeStyle = "rgba(239, 68, 68, 0.75)";
    ctx.lineWidth = 2.0;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(gateStartTopX, gateStartTopY + 12);
    ctx.lineTo(gateStartTopX, gateStartTopY + 56);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Finish Photogate (x = L)
    ctx.save();
    const gateEndTopX = rampEndX - 8;
    const gateEndTopY = rampBaseY - 60;
    ctx.fillStyle = "#0f172a";
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.roundRect(gateEndTopX - 6, gateEndTopY, 12, 65, 4);
    ctx.fill();
    ctx.stroke();

    // Finish Photogate Status LED
    const finishReached = (finishTimeA !== null && finishTimeB !== null);
    ctx.fillStyle = finishReached ? "#fbbf24" : "#10b981";
    ctx.beginPath();
    ctx.arc(gateEndTopX, gateEndTopY + 8, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Emerald Laser Tripwire Beam
    ctx.strokeStyle = finishReached ? "rgba(251, 191, 36, 0.9)" : "rgba(16, 185, 129, 0.85)";
    ctx.lineWidth = finishReached ? 3.0 : 2.0;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.moveTo(gateEndTopX, gateEndTopY + 14);
    ctx.lineTo(gateEndTopX, gateEndTopY + 62);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // 4. Contact Friction / Dust Micro-Particles
    ctx.save();
    for (let i = dustParticles.length - 1; i >= 0; i--) {
      const p = dustParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.035;
      if (p.alpha <= 0) {
        dustParticles.splice(i, 1);
        continue;
      }
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
    ctx.restore();

    // 5. Calculate Competitor Positions & Rotation
    const bodyRadius = 18; // px
    const fracA = Math.min(1.0, distA / trackLengthM);
    const curXA = rampStartX + fracA * (rampEndX - rampStartX);
    const curYA = rampTopY + fracA * rampHeightPx - 10;

    const fracB = Math.min(1.0, distB / trackLengthM);
    const curXB = rampStartX + fracB * (rampEndX - rampStartX);
    const curYB = rampTopY + fracB * rampHeightPx - 38;

    const rotAngleA = (distA / radiusM) % (Math.PI * 2);
    const rotAngleB = (distB / radiusM) % (Math.PI * 2);

    // Draw Competitor B (Amber Lane, Upper)
    ctx.save();
    ctx.translate(curXB, curYB);
    drawRotationalBody(ctx, shapeBKey, bodyRadius, SHAPES[shapeBKey].color, rotAngleB, thetaRad);
    ctx.restore();

    // Competitor B Tag
    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(curXB - 24, curYB - 34, 48, 15, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("LANE B", curXB, curYB - 26);
    ctx.restore();

    // Draw Competitor A (Cyan Lane, Lower)
    ctx.save();
    ctx.translate(curXA, curYA);
    drawRotationalBody(ctx, shapeAKey, bodyRadius, SHAPES[shapeAKey].color, rotAngleA, thetaRad);
    ctx.restore();

    // Competitor A Tag
    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(curXA - 24, curYA - 34, 48, 15, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("LANE A", curXA, curYA - 26);
    ctx.restore();

    // Incline Annotations
    ctx.save();
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`Incline θ = ${inclineAngleDeg.toFixed(1)}°`, rampStartX + 85, rampBaseY - 15);
    ctx.fillText(`Track Length L = ${trackLengthM.toFixed(2)} m`, rampStartX + 85, rampBaseY - 32);

    // Protractor Arc at Incline Base
    ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(rampStartX, rampBaseY, 35, 0, -thetaRad, true);
    ctx.stroke();
    ctx.restore();
  }

  function drawEnergyChart() {
    chartCtx.clearRect(0, 0, chartLogicalW, chartLogicalH);

    // Background Glassmorphic Panel
    chartCtx.fillStyle = "#030712";
    chartCtx.fillRect(0, 0, chartLogicalW, chartLogicalH);

    const cA = SHAPES[shapeAKey].c;
    const cB = SHAPES[shapeBKey].c;

    // Percent Translational KE = 1 / (1 + c)
    const transPctA = (1.0 / (1.0 + cA)) * 100;
    const rotPctA = 100 - transPctA;

    const transPctB = (1.0 / (1.0 + cB)) * 100;
    const rotPctB = 100 - transPctB;

    const barW = 340;
    const barX = 45;

    // Bar 1: Competitor A
    chartCtx.fillStyle = "#38bdf8";
    chartCtx.font = "bold 11px system-ui, sans-serif";
    chartCtx.textAlign = "left";
    chartCtx.fillText(`Lane A: ${SHAPES[shapeAKey].name} (${SHAPES[shapeAKey].formula})`, barX, 32);

    const transWA = (transPctA / 100) * barW;
    const rotWA = barW - transWA;

    // Translational Gradient
    const transGradA = chartCtx.createLinearGradient(barX, 42, barX + transWA, 42);
    transGradA.addColorStop(0, "#0284c7");
    transGradA.addColorStop(1, "#38bdf8");
    chartCtx.fillStyle = transGradA;
    chartCtx.beginPath();
    chartCtx.roundRect(barX, 42, transWA, 28, [6, rotWA > 0 ? 0 : 6, rotWA > 0 ? 0 : 6, 6]);
    chartCtx.fill();

    // Rotational Gradient
    if (rotWA > 0) {
      const rotGradA = chartCtx.createLinearGradient(barX + transWA, 42, barX + barW, 42);
      rotGradA.addColorStop(0, "#f97316");
      rotGradA.addColorStop(1, "#fb923c");
      chartCtx.fillStyle = rotGradA;
      chartCtx.beginPath();
      chartCtx.roundRect(barX + transWA, 42, rotWA, 28, [0, 6, 6, 0]);
      chartCtx.fill();
    }

    chartCtx.fillStyle = "#ffffff";
    chartCtx.font = "bold 10px 'JetBrains Mono', monospace";
    chartCtx.fillText(`${transPctA.toFixed(1)}% Trans`, barX + 10, 60);
    if (rotWA > 45) {
      chartCtx.fillText(`${rotPctA.toFixed(1)}% Rot`, barX + transWA + 10, 60);
    }

    // Bar 2: Competitor B
    chartCtx.fillStyle = "#fbbf24";
    chartCtx.font = "bold 11px system-ui, sans-serif";
    chartCtx.textAlign = "left";
    chartCtx.fillText(`Lane B: ${SHAPES[shapeBKey].name} (${SHAPES[shapeBKey].formula})`, barX, 108);

    const transWB = (transPctB / 100) * barW;
    const rotWB = barW - transWB;

    const transGradB = chartCtx.createLinearGradient(barX, 118, barX + transWB, 118);
    transGradB.addColorStop(0, "#0284c7");
    transGradB.addColorStop(1, "#38bdf8");
    chartCtx.fillStyle = transGradB;
    chartCtx.beginPath();
    chartCtx.roundRect(barX, 118, transWB, 28, [6, rotWB > 0 ? 0 : 6, rotWB > 0 ? 0 : 6, 6]);
    chartCtx.fill();

    if (rotWB > 0) {
      const rotGradB = chartCtx.createLinearGradient(barX + transWB, 118, barX + barW, 118);
      rotGradB.addColorStop(0, "#f97316");
      rotGradB.addColorStop(1, "#fb923c");
      chartCtx.fillStyle = rotGradB;
      chartCtx.beginPath();
      chartCtx.roundRect(barX + transWB, 118, rotWB, 28, [0, 6, 6, 0]);
      chartCtx.fill();
    }

    chartCtx.fillStyle = "#ffffff";
    chartCtx.font = "bold 10px 'JetBrains Mono', monospace";
    chartCtx.fillText(`${transPctB.toFixed(1)}% Trans`, barX + 10, 136);
    if (rotWB > 45) {
      chartCtx.fillText(`${rotPctB.toFixed(1)}% Rot`, barX + transWB + 10, 136);
    }

    // Legend
    chartCtx.fillStyle = "#64748b";
    chartCtx.font = "9px 'JetBrains Mono', monospace";
    chartCtx.fillText("Translational Fraction: 1/(1+c)  •  Rotational Fraction: c/(1+c)", barX, 168);
  }

  let lastRotTime = 0;

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
      if (isRacing || dustParticles.length > 0) {
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
    dustParticles.length = 0;
    SoundFX.playScorePip();
  });

  container.querySelector("#btn-rot-reset")?.addEventListener("click", () => {
    isRacing = false;
    raceTime = 0.0;
    distA = 0.0;
    distB = 0.0;
    finishTimeA = null;
    finishTimeB = null;
    dustParticles.length = 0;
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
    needsRedraw = true;
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

  // Standardized Hotkey: 'e' or 'E' triggers CSV telemetry export
  const handleKeyDown = (e) => {
    if ((e.key === "e" || e.key === "E") && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      container.querySelector("#btn-rot-export")?.click();
    }
  };
  window.addEventListener("keydown", handleKeyDown);

  // Mount Assessment
  mountLabCheckpoint("rotational-checkpoint-container", "rotational");

  // Launch
  loop();

  return () => {
    isRunning = false;
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("resize", setupHiDPICanvas);
    window.removeEventListener("keydown", handleKeyDown);
  };
}
