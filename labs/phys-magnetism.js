// Edugates-ClipSAT Science Labs - Physics: Magnetic Fields & Lorentz Force Suite
// 60 FPS Fine-Beam Tube (e/m Ratio Determination) Simulation:
// Helmholtz Coils Magnetic Field B, Lorentz Force Centripetal Deflection F = q(v × B),
// Relativistic Electron Acceleration, Circular Orbital Radii, and J.J. Thomson Specific Charge Extraction.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initMagnetismLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Apparatus Constants (Leybold / PASCO Helmholtz geometry)
  const N_TURNS = 130; // turns per coil
  const R_COIL = 0.150; // coil radius in meters (15.0 cm)
  const MU_0 = 4 * Math.PI * 1e-7; // T·m/A
  const E_M_THEO = 1.75882e11; // C/kg (theoretical e/m)

  // Simulation State Variables
  let anodeVoltage = 200.0; // V (100 V to 300 V)
  let coilCurrent = 1.50; // A (0.50 A to 3.00 A)
  let bFieldReversed = false; // toggle field direction
  let showVectorHUD = true;
  let isRunning = true;
  let animId = null;
  let elapsedSeconds = 0;

  // Calculate Helmholtz Magnetic Field B (Tesla)
  function getMagneticField() {
    // B = (4/5)^(3/2) * (mu_0 * N * I) / R
    const factor = Math.pow(4 / 5, 1.5);
    const B = factor * (MU_0 * N_TURNS * coilCurrent) / R_COIL;
    return bFieldReversed ? -B : B;
  }

  // Calculate Electron Velocity v and Circular Orbit Radius r
  function getKinematics() {
    const B = Math.abs(getMagneticField());
    // v = sqrt(2 * (e/m) * V)
    const v = Math.sqrt(2 * E_M_THEO * anodeVoltage);
    // r = v / ((e/m) * B)
    const r = B > 1e-7 ? (v / (E_M_THEO * B)) : 999;
    // Experimental e/m from V, B, r
    const em_exp = (B > 1e-7 && r < 0.25) ? (2 * anodeVoltage) / (B * B * r * r) : E_M_THEO;

    return { v, B, r, em_exp };
  }

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #22c55e; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 10px #22c55e;"></span>
            Magnetic Lorentz Force &amp; e/m Ratio Workbench
          </span>
          <span class="badge" style="background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.3); color: #4ade80; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            ${renderLatex("\\vec{F} = q(\\vec{v} \\times \\vec{B}) \\quad \\bullet \\quad \\frac{e}{m} = \\frac{2V}{B^2 r^2}")}
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-mag-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Fine-Beam Tube
            </button>
            <button id="view-mode-mag-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Helmholtz Bench
            </button>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-mag-toggle-vec" style="padding: 5px 12px; font-size: 0.78rem;">
            🎯 Vectors: ON
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-mag-invert-b" style="padding: 5px 12px; font-size: 0.78rem;">
            🔄 Reverse B-Field
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-mag-export" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export Telemetry
          </button>
        </div>
      </div>

      <!-- Main Layout: Simulator Canvas on Left, Telemetry & Controls on Right -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="magnetism-layout">
        <!-- Fine-Beam Tube Canvas Area -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(34, 197, 94, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #06170d 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="magnetism-canvas" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
          <div id="magnetism-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <img src="assets/labs/magnetism_bench.jpg" alt="4K Helmholtz Coils & Fine-Beam Tube Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            
            <!-- Live Analytical Telemetry Callout on Photo -->
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(34, 197, 94, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Twin Helmholtz Coils</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">N = 130 Turns • R = 150 mm</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Helium Gas Discharge Tube</div>
                <div style="color: #4ade80; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">λ = 501.5 nm Green Circular Beam</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Precision Mirror Scale</div>
                <div style="color: #facc15; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Parallax-Free Diameter Ruler</div>
              </div>
            </div>
          </div>

          <!-- Top HUD Overlay (Organized & Compact with Generous Coil Clearance) -->
          <div style="position: absolute; top: 10px; left: 14px; right: 14px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <!-- Left Card: Orbital Radius & Magnetic Field -->
            <div style="background: rgba(15, 23, 42, 0.90); backdrop-filter: blur(12px); border: 1px solid rgba(34, 197, 94, 0.4); border-radius: 10px; padding: 7px 14px; pointer-events: auto; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
              <div style="font-size: 0.64rem; font-weight: 700; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.05em;">ORBITAL RADIUS &amp; DIAMETER</div>
              <div style="font-weight: 800; font-size: 1.18rem; color: #4ade80; font-family: var(--font-mono); line-height: 1.25;" id="disp-mag-radius">r = 4.08 cm (2r = 8.16 cm)</div>
              <div style="font-size: 0.72rem; color: #38bdf8; font-family: var(--font-mono); margin-top: 1px;" id="disp-mag-bfield">B = 1.17 mT • I = 1.50 A</div>
            </div>

            <!-- Center Badge: Vector Field Polarity Indicator -->
            <div style="background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(10px); border: 1px solid rgba(148, 163, 184, 0.25); border-radius: 20px; padding: 4px 12px; pointer-events: auto; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.4);" id="disp-mag-field-badge">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 8px #22c55e;"></span>
              <span style="font-size: 0.68rem; font-family: var(--font-mono); font-weight: 700; color: #e2e8f0;" id="disp-mag-field-dir">⊙ B-FIELD: +1.17 mT (OUT)</span>
            </div>

            <!-- Right Card: Measured Specific Charge e/m -->
            <div style="background: rgba(15, 23, 42, 0.90); backdrop-filter: blur(12px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 10px; padding: 7px 14px; text-align: right; pointer-events: auto; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
              <div style="font-size: 0.64rem; font-weight: 700; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.05em;">MEASURED SPECIFIC CHARGE (e/m)</div>
              <div style="font-weight: 800; font-size: 1.18rem; color: #38bdf8; font-family: var(--font-mono); line-height: 1.25;" id="disp-mag-em">1.759 × 10¹¹ C/kg</div>
              <div style="font-size: 0.72rem; color: #facc15; font-family: var(--font-mono); margin-top: 1px;" id="disp-mag-error">Error: 0.0% vs 1.759×10¹¹</div>
            </div>
          </div>

          <!-- Bottom Status Bar -->
          <div style="position: absolute; bottom: 10px; left: 14px; right: 14px; display: flex; justify-content: space-between; align-items: center; pointer-events: none; font-family: var(--font-mono); font-size: 0.72rem; z-index: 5;">
            <span style="background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(8px); border: 1px solid rgba(34, 197, 94, 0.3); padding: 5px 12px; border-radius: 8px; color: #e2e8f0;" id="disp-mag-status">
              ⚡ Lorentz Force Balance: F<sub>mag</sub> = 1.57 fN inward radial centripetal force
            </span>
            <span style="background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(8px); border: 1px solid rgba(56, 189, 248, 0.3); padding: 5px 12px; border-radius: 8px; color: #38bdf8;">
              v = <span id="disp-mag-velocity">8.39 × 10⁶ m/s</span>
            </span>
          </div>
        </div>

        <!-- Controls & Calibration Cards on Right -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <!-- Electrical Parameters Card -->
          <div class="lab-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px;">
            <label style="font-size: 0.8rem; font-weight: 700; color: #4ade80; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">
              Helmholtz &amp; Anode Accelerator Controls
            </label>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              <!-- Anode Accelerating Potential V_acc -->
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>Anode Voltage (V_acc)</span>
                  <span style="color: #38bdf8; font-weight: 700;" id="lbl-anode-voltage">${anodeVoltage.toFixed(0)} V</span>
                </div>
                <input type="range" id="slider-anode-voltage" min="100" max="300" step="5" value="${anodeVoltage}" style="width: 100%; accent-color: #38bdf8;">
              </div>

              <!-- Helmholtz Coil Current I -->
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>Helmholtz Coil Current (I)</span>
                  <span style="color: #facc15; font-weight: 700;" id="lbl-coil-current">${coilCurrent.toFixed(2)} A</span>
                </div>
                <input type="range" id="slider-coil-current" min="0.50" max="3.00" step="0.05" value="${coilCurrent}" style="width: 100%; accent-color: #facc15;">
              </div>
            </div>
          </div>

          <!-- Kinetic Derivation Card -->
          <div class="lab-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px; flex: 1;">
            <div style="font-size: 0.8rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
              Analytical Relativistic Dynamics
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px; font-family: var(--font-mono); font-size: 0.78rem;">
              <div style="background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 6px; border-left: 3px solid #4ade80;">
                <div style="color: #94a3b8; font-size: 0.7rem;">HELMHOLTZ MAGNETIC FIELD:</div>
                <div style="color: #e2e8f0; font-weight: 700;" id="disp-calc-b">B = (4/5)³/² (μ₀ N I) / R = 1.15 mT</div>
              </div>
              <div style="background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 6px; border-left: 3px solid #facc15;">
                <div style="color: #94a3b8; font-size: 0.7rem;">LORENTZ CENTRIPETAL EQUILIBRIUM:</div>
                <div style="color: #e2e8f0; font-weight: 700;">evB = mv²/r ➔ r = mv/(eB)</div>
              </div>
              <div style="background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 6px; border-left: 3px solid #38bdf8;">
                <div style="color: #94a3b8; font-size: 0.7rem;">THOMSON SPECIFIC CHARGE:</div>
                <div style="color: #e2e8f0; font-weight: 700;">e/m = 2V / (B² r²) = 1.76 × 10¹¹ C/kg</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Post-Lab Checkpoint Assessment -->
      <div id="mag-checkpoint-container" style="margin-top: 24px;"></div>
    </div>
  `;

  // Canvas References
  const canvas = container.querySelector("#magnetism-canvas");
  const ctx = canvas.getContext("2d");

  // DOM Elements
  const dispRadius = container.querySelector("#disp-mag-radius");
  const dispBfield = container.querySelector("#disp-mag-bfield");
  const dispFieldBadge = container.querySelector("#disp-mag-field-badge");
  const dispFieldDir = container.querySelector("#disp-mag-field-dir");
  const dispEM = container.querySelector("#disp-mag-em");
  const dispError = container.querySelector("#disp-mag-error");
  const dispVel = container.querySelector("#disp-mag-velocity");
  const dispStatus = container.querySelector("#disp-mag-status");
  const dispCalcB = container.querySelector("#disp-calc-b");
  const btnToggleVec = container.querySelector("#btn-mag-toggle-vec");

  function updateTelemetry() {
    const { v, B, r, em_exp } = getKinematics();
    const r_cm = r * 100;
    const B_mT = B * 1000;
    const errPct = Math.abs(em_exp - E_M_THEO) / E_M_THEO * 100;
    const F_mag_fN = (1.602176634e-19 * v * Math.abs(B) * 1e15).toFixed(2);

    dispRadius.innerText = `r = ${r_cm.toFixed(2)} cm (2r = ${(2 * r_cm).toFixed(2)} cm)`;
    dispBfield.innerText = `B = ${Math.abs(B_mT).toFixed(2)} mT • I = ${coilCurrent.toFixed(2)} A`;
    dispEM.innerText = `${em_exp.toExponential(3)} C/kg`;
    dispError.innerText = `Error: ${errPct.toFixed(1)}% vs 1.759×10¹¹`;
    dispVel.innerText = `${(v / 1e6).toFixed(2)} × 10⁶ m/s`;
    dispCalcB.innerText = `B = ${Math.abs(B_mT).toFixed(2)} mT (I = ${coilCurrent.toFixed(2)} A)`;

    dispStatus.innerHTML = `⚡ Lorentz Force Balance: F<sub>mag</sub> = ${F_mag_fN} fN inward radial centripetal force`;

    if (dispFieldDir) {
      const isOut = !bFieldReversed;
      dispFieldDir.innerText = isOut
        ? `⊙ B-FIELD: +${Math.abs(B_mT).toFixed(2)} mT (OUT)`
        : `⊗ B-FIELD: -${Math.abs(B_mT).toFixed(2)} mT (IN)`;
      dispFieldDir.style.color = isOut ? "#4ade80" : "#f59e0b";
      if (dispFieldBadge) {
        dispFieldBadge.style.borderColor = isOut ? "rgba(34, 197, 94, 0.4)" : "rgba(245, 158, 11, 0.4)";
        const dot = dispFieldBadge.querySelector("span");
        if (dot) {
          dot.style.background = isOut ? "#22c55e" : "#f59e0b";
          dot.style.boxShadow = isOut ? "0 0 8px #22c55e" : "0 0 8px #f59e0b";
        }
      }
    }
  }

  // Draw Arrow Helper
  function drawArrow(ctx, fromX, fromY, toX, toY, color, width = 2, headLen = 8) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  }

  // 60 FPS HTML5 Canvas Simulation
  function renderApparatus() {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
    const logicalW = 580;
    const logicalH = 530;

    if (canvas.width !== Math.round(logicalW * dpr) || canvas.height !== Math.round(logicalH * dpr)) {
      canvas.width = Math.round(logicalW * dpr);
      canvas.height = Math.round(logicalH * dpr);
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, logicalW, logicalH);

    const isSmart = (document.documentElement.getAttribute("data-mode") === "smartboard") ||
                    document.documentElement.classList.contains("fast-smartboard-mode") ||
                    /Android|MAXHUB/i.test(navigator.userAgent);

    // Apparatus Positioning Metrics
    const CX = 290;
    const CY = 238;
    const benchY = 452;

    // --- 1. LABORATORY WORKBENCH SURFACE ---
    const benchGrad = ctx.createLinearGradient(0, benchY, 0, logicalH);
    benchGrad.addColorStop(0, "#1e293b");
    benchGrad.addColorStop(0.12, "#0f172a");
    benchGrad.addColorStop(1, "#070c14");
    ctx.fillStyle = benchGrad;
    ctx.fillRect(0, benchY, logicalW, logicalH - benchY);

    // Bench Bevel & Reflection Line
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, benchY);
    ctx.lineTo(logicalW, benchY);
    ctx.stroke();

    ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, benchY + 2);
    ctx.lineTo(logicalW, benchY + 2);
    ctx.stroke();

    // --- 2. HEAVY CAST-ALUMINUM CHASSIS BASE ---
    // Stabilizing Table Outrigger Feet
    ctx.fillStyle = "#090d16";
    ctx.fillRect(174, benchY - 4, 34, 6);
    ctx.fillRect(372, benchY - 4, 34, 6);

    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(172, benchY - 14, 38, 12, [4, 4, 0, 0]);
    ctx.roundRect(370, benchY - 14, 38, 12, [4, 4, 0, 0]);
    ctx.fill();
    ctx.stroke();

    // Central Base Console
    const baseW = 196;
    const baseH = 42;
    const baseX = CX - baseW / 2;
    const baseY = benchY - baseH;

    const baseGrad = ctx.createLinearGradient(baseX, baseY, baseX, baseY + baseH);
    baseGrad.addColorStop(0, "#334155");
    baseGrad.addColorStop(0.15, "#1e293b");
    baseGrad.addColorStop(0.85, "#0f172a");
    baseGrad.addColorStop(1, "#090d16");
    ctx.fillStyle = baseGrad;
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(baseX, baseY, baseW, baseH, 6);
    ctx.fill();
    ctx.stroke();

    // Metallic Chamfer Highlight
    ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(baseX + 6, baseY + 2);
    ctx.lineTo(baseX + baseW - 6, baseY + 2);
    ctx.stroke();

    // Apparatus Nameplate
    ctx.fillStyle = "#020617";
    ctx.fillRect(CX - 72, baseY + 24, 144, 14);
    ctx.strokeStyle = "rgba(71, 85, 105, 0.7)";
    ctx.lineWidth = 1;
    ctx.strokeRect(CX - 72, baseY + 24, 144, 14);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "7.5px var(--font-mono, monospace)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("TELTRON 555 • HELMHOLTZ e/m BENCH", CX, baseY + 31);

    // Coil Current Binding Posts (Left Pair)
    // Positive Terminal (Red)
    ctx.fillStyle = bFieldReversed ? "#1e293b" : "#dc2626";
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(baseX + 24, baseY + 12, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Negative Terminal (Black)
    ctx.fillStyle = bFieldReversed ? "#dc2626" : "#0f172a";
    ctx.strokeStyle = "#475569";
    ctx.beginPath();
    ctx.arc(baseX + 40, baseY + 12, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Terminal Wire Leads (Curving Upward to Coil Bracket)
    ctx.strokeStyle = bFieldReversed ? "#64748b" : "#ef4444";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(baseX + 24, baseY + 7);
    ctx.quadraticCurveTo(baseX + 15, baseY - 16, 215, 360);
    ctx.stroke();

    ctx.strokeStyle = bFieldReversed ? "#ef4444" : "#334155";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(baseX + 40, baseY + 7);
    ctx.quadraticCurveTo(baseX + 32, baseY - 14, 218, 360);
    ctx.stroke();

    // Anode Voltage Binding Posts (Right Pair)
    ctx.fillStyle = "#eab308";
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(baseX + baseW - 40, baseY + 12, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#0f172a";
    ctx.strokeStyle = "#475569";
    ctx.beginPath();
    ctx.arc(baseX + baseW - 24, baseY + 12, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Central Stem Chuck / Collet
    ctx.fillStyle = "#334155";
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 1.5;
    ctx.fillRect(CX - 12, baseY - 14, 24, 15);
    ctx.strokeRect(CX - 12, baseY - 14, 24, 15);

    // Vertical Aluminum Coil Mounting Uprights
    ctx.fillStyle = "#334155";
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 1.5;
    ctx.fillRect(212, 345, 6, baseY - 345);
    ctx.strokeRect(212, 345, 6, baseY - 345);
    ctx.fillRect(362, 345, 6, baseY - 345);
    ctx.strokeRect(362, 345, 6, baseY - 345);

    // --- 3. REAR HELMHOLTZ COIL (Perspective Layering) ---
    const coilRx = 140;
    const coilRy = 124;
    const coilSep = 9; // half-separation in perspective (d = R)
    const rearCY = CY - coilSep;

    // Rear Coil Outer Channel Former
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.ellipse(CX, rearCY, coilRx, coilRy, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Rear Copper Winding Bundle
    ctx.strokeStyle = "#7c2d12";
    ctx.lineWidth = 10;
    ctx.stroke();

    ctx.strokeStyle = "#b45309";
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;
    ctx.stroke();

    // --- 4. COIL SPACER STRUTS & TIE-RODS ---
    // Horizontal Spacing Rods (Maintaining Helmholtz Condition d = R)
    const strutPositions = [
      { x: CX - coilRx + 6, y: CY },
      { x: CX + coilRx - 6, y: CY },
      { x: CX - 88, y: CY - 88 },
      { x: CX + 88, y: CY - 88 },
      { x: CX - 88, y: CY + 88 },
      { x: CX + 88, y: CY + 88 }
    ];

    strutPositions.forEach(pos => {
      ctx.fillStyle = "#94a3b8";
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1;
      ctx.fillRect(pos.x - 3, pos.y - 12, 6, 24);
      ctx.strokeRect(pos.x - 3, pos.y - 12, 6, 24);

      // Knurled Nut Highlights
      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(pos.x - 2, pos.y - 1, 4, 2);
    });

    // --- 5. SPHERICAL EVACUATED FINE-BEAM TUBE (GLASS BULB) ---
    const bulbR = 104;

    // Vertical Glass Neck Stem
    ctx.fillStyle = "rgba(16, 185, 129, 0.04)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.fillRect(CX - 9, CY + 90, 18, (baseY - 14) - (CY + 90));
    ctx.strokeRect(CX - 9, CY + 90, 18, (baseY - 14) - (CY + 90));

    // Internal Electrode Lead Wires in Stem
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(CX - 4, baseY - 12);
    ctx.lineTo(CX - 4, CY + 92);
    ctx.moveTo(CX + 4, baseY - 12);
    ctx.lineTo(CX + 4, CY + 92);
    ctx.stroke();

    // Top Evacuation Seal Tip
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(CX - 4, CY - bulbR);
    ctx.lineTo(CX, CY - bulbR - 6);
    ctx.lineTo(CX + 4, CY - bulbR);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Helium Gas Ionization Atmosphere inside Bulb
    const heGlow = ctx.createRadialGradient(CX, CY, 10, CX, CY, bulbR);
    heGlow.addColorStop(0, "rgba(34, 197, 94, 0.08)");
    heGlow.addColorStop(0.6, "rgba(34, 197, 94, 0.04)");
    heGlow.addColorStop(1, "rgba(6, 78, 59, 0.01)");
    ctx.fillStyle = heGlow;
    ctx.beginPath();
    ctx.arc(CX, CY, bulbR, 0, Math.PI * 2);
    ctx.fill();

    // Glass Sphere Rear Wall Stroke
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // --- 6. CALIBRATED PARALLAX-FREE MIRRORED MEASURING SCALE ---
    // Mirrored Glass Plate across Horizontal Diameter (Y = CY)
    const scaleHalfW = 88;
    const scaleH = 14;
    const scaleX = CX - scaleHalfW;
    const scaleY = CY - scaleH / 2;

    // Mirrored Plate Background
    const mirrorGrad = ctx.createLinearGradient(scaleX, scaleY, scaleX, scaleY + scaleH);
    mirrorGrad.addColorStop(0, "rgba(148, 163, 184, 0.45)");
    mirrorGrad.addColorStop(0.3, "rgba(226, 232, 240, 0.70)");
    mirrorGrad.addColorStop(0.7, "rgba(100, 116, 139, 0.40)");
    mirrorGrad.addColorStop(1, "rgba(51, 65, 85, 0.60)");
    ctx.fillStyle = mirrorGrad;
    ctx.strokeStyle = "rgba(203, 213, 225, 0.65)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(scaleX, scaleY, scaleHalfW * 2, scaleH, 2);
    ctx.fill();
    ctx.stroke();

    // Central Longitudinal Specular Glint
    ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    ctx.lineWidth = 0.75;
    ctx.beginPath();
    ctx.moveTo(scaleX + 4, CY - 1);
    ctx.lineTo(scaleX + scaleHalfW * 2 - 4, CY - 1);
    ctx.stroke();

    // Centimeter Scale Graduations (1 cm = 10.5 px)
    const pxPerCm = 10.5;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let cm = -8; cm <= 8; cm += 1) {
      const tx = CX + cm * pxPerCm;
      const isMajor = (cm % 2 === 0);

      ctx.strokeStyle = isMajor ? "rgba(15, 23, 42, 0.95)" : "rgba(30, 41, 59, 0.75)";
      ctx.lineWidth = isMajor ? 1.25 : 0.75;

      const tickTop = isMajor ? scaleY + 2 : scaleY + 4;
      const tickBot = isMajor ? scaleY + scaleH - 2 : scaleY + scaleH - 4;

      ctx.beginPath();
      ctx.moveTo(tx, tickTop);
      ctx.lineTo(tx, tickBot);
      ctx.stroke();

      // Major Numeric Labels
      if (isMajor && cm !== 0 && Math.abs(cm) <= 8) {
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 7px var(--font-mono, monospace)";
        ctx.fillText(`${cm > 0 ? "+" : ""}${cm}`, tx, scaleY - 6);
      }
    }

    // Zero Marker Callout
    ctx.fillStyle = "#047857";
    ctx.font = "bold 7.5px var(--font-mono, monospace)";
    ctx.fillText("0", CX, scaleY - 6);

    // Scale Units Tag
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 7.5px var(--font-mono, monospace)";
    ctx.textAlign = "left";
    ctx.fillText("cm", scaleX + scaleHalfW * 2 + 4, CY);

    // --- 7. ELECTRON GUN & CATHODE ASSEMBLY ---
    const gunY = CY + 80;

    // Ceramic Insulating Base
    ctx.fillStyle = "#cbd5e1";
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 1;
    ctx.fillRect(CX - 11, gunY + 8, 22, 10);
    ctx.strokeRect(CX - 11, gunY + 8, 22, 10);

    // Gunmetal Anode Cylinder & Slit
    const gunGrad = ctx.createLinearGradient(CX - 8, gunY - 14, CX + 8, gunY + 8);
    gunGrad.addColorStop(0, "#64748b");
    gunGrad.addColorStop(0.5, "#334155");
    gunGrad.addColorStop(1, "#1e293b");
    ctx.fillStyle = gunGrad;
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.2;
    ctx.fillRect(CX - 8, gunY - 12, 16, 20);
    ctx.strokeRect(CX - 8, gunY - 12, 16, 20);

    // Incandescent Tungsten Filament Glow (Cathode)
    const filGlow = ctx.createRadialGradient(CX, gunY + 2, 1, CX, gunY + 2, 7);
    filGlow.addColorStop(0, "#ffffff");
    filGlow.addColorStop(0.3, "#fef08a");
    filGlow.addColorStop(0.7, "#f59e0b");
    filGlow.addColorStop(1, "rgba(245, 158, 11, 0)");
    ctx.fillStyle = filGlow;
    ctx.beginPath();
    ctx.arc(CX, gunY + 2, 7, 0, Math.PI * 2);
    ctx.fill();

    // Collimated Anode Slit Nozzle
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(CX - 3, gunY - 14, 6, 3);

    // --- 8. LUMINOUS HELIUM CIRCULAR ELECTRON BEAM ---
    const { v, B, r } = getKinematics();
    // 1 cm = 10.5 px
    const pixelRadius = Math.max(18, Math.min(84, r * 100 * pxPerCm));

    // Tangential Beam Launch Curve from Anode Slit to Orbit
    ctx.strokeStyle = "rgba(74, 222, 128, 0.4)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(CX, gunY - 14);
    ctx.quadraticCurveTo(
      bFieldReversed ? CX - 10 : CX + 10,
      (gunY - 14 + (CY + pixelRadius)) / 2,
      CX,
      CY + pixelRadius
    );
    ctx.stroke();

    // Parallax Mirrored Reflection on Mirror Scale
    ctx.strokeStyle = "rgba(34, 197, 94, 0.35)";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(CX - pixelRadius, scaleY + 2);
    ctx.lineTo(CX - pixelRadius, scaleY + scaleH - 2);
    ctx.moveTo(CX + pixelRadius, scaleY + 2);
    ctx.lineTo(CX + pixelRadius, scaleY + scaleH - 2);
    ctx.stroke();

    // Multi-Layer Helium Luminescence Glow (Outer Diffuse)
    ctx.strokeStyle = "rgba(34, 197, 94, 0.15)";
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(CX, CY, pixelRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Mid Intense Luminescence
    ctx.strokeStyle = "rgba(74, 222, 128, 0.40)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(CX, CY, pixelRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Core Electron Beam (λ = 501.5 nm Emerald Discharge)
    ctx.strokeStyle = "#4ade80";
    ctx.lineWidth = 2.4;
    if (!isSmart) {
      ctx.shadowColor = "#22c55e";
      ctx.shadowBlur = 12;
    }
    ctx.beginPath();
    ctx.arc(CX, CY, pixelRadius, 0, Math.PI * 2);
    ctx.stroke();
    if (!isSmart) {
      ctx.shadowBlur = 0;
    }

    // Specular White Core Filament
    ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(CX, CY, pixelRadius, 0, Math.PI * 2);
    ctx.stroke();

    // --- 9. MEASUREMENT DIAMETER INDICATORS ON SCALE ---
    // Emerald Hairline Cursors at Left and Right Intersection
    const leftIntersectX = CX - pixelRadius;
    const rightIntersectX = CX + pixelRadius;

    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(leftIntersectX, scaleY - 3);
    ctx.lineTo(leftIntersectX, scaleY + scaleH + 3);
    ctx.moveTo(rightIntersectX, scaleY - 3);
    ctx.lineTo(rightIntersectX, scaleY + scaleH + 3);
    ctx.stroke();

    // Dimension Arrow between scale intersections
    ctx.strokeStyle = "rgba(74, 222, 128, 0.85)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(leftIntersectX + 3, scaleY + scaleH + 8);
    ctx.lineTo(rightIntersectX - 3, scaleY + scaleH + 8);
    ctx.stroke();

    // Arrow Heads
    ctx.fillStyle = "rgba(74, 222, 128, 0.85)";
    ctx.beginPath();
    ctx.moveTo(leftIntersectX, scaleY + scaleH + 8);
    ctx.lineTo(leftIntersectX + 4, scaleY + scaleH + 6);
    ctx.lineTo(leftIntersectX + 4, scaleY + scaleH + 10);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(rightIntersectX, scaleY + scaleH + 8);
    ctx.lineTo(rightIntersectX - 4, scaleY + scaleH + 6);
    ctx.lineTo(rightIntersectX - 4, scaleY + scaleH + 10);
    ctx.closePath();
    ctx.fill();

    // Measured Diameter Badge on Scale
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.fillRect(CX - 34, scaleY + scaleH + 2, 68, 12);
    ctx.strokeStyle = "rgba(74, 222, 128, 0.5)";
    ctx.strokeRect(CX - 34, scaleY + scaleH + 2, 68, 12);

    ctx.fillStyle = "#4ade80";
    ctx.font = "bold 8px var(--font-mono, monospace)";
    ctx.textAlign = "center";
    ctx.fillText(`2r = ${(2 * r * 100).toFixed(2)} cm`, CX, scaleY + scaleH + 8);

    // --- 10. ORBITING ELECTRON PACKET & DYNAMIC PHYSICAL VECTORS ---
    // Orbit circulation direction: Counter-clockwise if B > 0, Clockwise if B < 0
    const orbitAngle = bFieldReversed ? (elapsedSeconds * 5.5) : -(elapsedSeconds * 5.5);
    const elX = CX + Math.cos(orbitAngle) * pixelRadius;
    const elY = CY + Math.sin(orbitAngle) * pixelRadius;

    // Glowing Electron Packet
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(elX, elY, 3.2, 0, Math.PI * 2);
    ctx.fill();

    if (!isSmart) {
      ctx.fillStyle = "rgba(56, 189, 248, 0.4)";
      ctx.beginPath();
      ctx.arc(elX, elY, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Dynamic Tangential Velocity Vector (v) and Inward Centripetal Lorentz Vector (F_L)
    if (showVectorHUD) {
      // Tangent Angle
      const tangentAngle = orbitAngle + (bFieldReversed ? Math.PI / 2 : -Math.PI / 2);
      const vLen = 22;
      const vEndX = elX + Math.cos(tangentAngle) * vLen;
      const vEndY = elY + Math.sin(tangentAngle) * vLen;
      drawArrow(ctx, elX, elY, vEndX, vEndY, "#38bdf8", 1.8, 6);

      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 8px var(--font-mono, monospace)";
      ctx.fillText("v", vEndX + Math.cos(tangentAngle) * 6, vEndY + Math.sin(tangentAngle) * 6);

      // Centripetal Force Vector (Inward towards CX, CY)
      const fAngle = orbitAngle + Math.PI;
      const fLen = 20;
      const fEndX = elX + Math.cos(fAngle) * fLen;
      const fEndY = elY + Math.sin(fAngle) * fLen;
      drawArrow(ctx, elX, elY, fEndX, fEndY, "#facc15", 1.8, 6);

      ctx.fillStyle = "#facc15";
      ctx.font = "bold 8px var(--font-mono, monospace)";
      ctx.fillText("F_L", fEndX + Math.cos(fAngle) * 7, fEndY + Math.sin(fAngle) * 7);
    }

    // --- 11. SPHERICAL GLASS BULB (FOREGROUND HIGHLIGHTS) ---
    // Glass Outer Rim
    ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(CX, CY, bulbR, 0, Math.PI * 2);
    ctx.stroke();

    // Upper-Left Curved Specular Glint Arc
    ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(CX, CY, bulbR - 4, -Math.PI * 0.85, -Math.PI * 0.55);
    ctx.stroke();

    // Lower-Right Secondary Rim Glint
    ctx.strokeStyle = "rgba(56, 189, 248, 0.28)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(CX, CY, bulbR - 4, Math.PI * 0.15, Math.PI * 0.40);
    ctx.stroke();

    // --- 12. FRONT HELMHOLTZ COIL (FOREGROUND PERSPECTIVE OVERLAY) ---
    const frontCY = CY + coilSep;

    // Front Coil Channel Former Ring
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.ellipse(CX, frontCY, coilRx, coilRy, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Multi-Strand Wound Copper Coil Core
    ctx.strokeStyle = "#9a3412";
    ctx.lineWidth = 11;
    ctx.stroke();

    ctx.strokeStyle = "#d97706";
    ctx.lineWidth = 7;
    ctx.stroke();

    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Front Metallic Highlight Rim
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(CX, frontCY - 6, coilRx - 3, coilRy - 6, 0, Math.PI * 0.9, Math.PI * 2.1);
    ctx.stroke();

    // Front Terminal Lugs at Bottom of Coil
    ctx.fillStyle = "#334155";
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1;
    ctx.fillRect(CX - 18, frontCY + coilRy - 6, 10, 8);
    ctx.strokeRect(CX - 18, frontCY + coilRy - 6, 10, 8);
    ctx.fillRect(CX + 8, frontCY + coilRy - 6, 10, 8);
    ctx.strokeRect(CX + 8, frontCY + coilRy - 6, 10, 8);

    ctx.restore();
  }

  // Animation Loop
  let lastTime = performance.now();
  let lastFrameTime = 0;

  function loop(currentTime) {
    if (!container || !container.isConnected) {
      if (animId) cancelAnimationFrame(animId);
      return;
    }

    const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
    lastTime = currentTime;

    const isSmart = (document.documentElement.getAttribute("data-mode") === "smartboard") ||
                    document.documentElement.classList.contains("fast-smartboard-mode") ||
                    /Android|MAXHUB/i.test(navigator.userAgent);
    const interval = isSmart ? 33.3 : 16.0;

    const photoOverlay = container.querySelector("#magnetism-photo-overlay");
    const isPhotoOverlay = photoOverlay && photoOverlay.style.display === "block";

    if (!isPhotoOverlay) {
      if (!currentTime || currentTime - lastFrameTime >= interval) {
        lastFrameTime = currentTime;
        elapsedSeconds += dt;
        updateTelemetry();
        renderApparatus();
      }
    }

    animId = requestAnimationFrame(loop);
  }
  animId = requestAnimationFrame(loop);

  // --- EVENT LISTENERS ---
  const btnSim = container.querySelector("#view-mode-mag-sim");
  const btnPhoto = container.querySelector("#view-mode-mag-photo");
  const photoOverlay = container.querySelector("#magnetism-photo-overlay");

  btnSim?.addEventListener("click", () => {
    btnSim.classList.add("active");
    btnSim.style.background = "";
    btnPhoto.classList.remove("active");
    btnPhoto.style.background = "transparent";
    if (photoOverlay) photoOverlay.style.display = "none";
    SoundFX.playClick();
  });

  btnPhoto?.addEventListener("click", () => {
    btnPhoto.classList.add("active");
    btnPhoto.style.background = "";
    btnSim.classList.remove("active");
    btnSim.style.background = "transparent";
    if (photoOverlay) photoOverlay.style.display = "block";
    SoundFX.playClick();
  });

  btnToggleVec?.addEventListener("click", () => {
    showVectorHUD = !showVectorHUD;
    btnToggleVec.innerText = showVectorHUD ? "🎯 Vectors: ON" : "🎯 Vectors: OFF";
    btnToggleVec.classList.toggle("btn-primary", showVectorHUD);
    SoundFX.playClick();
  });

  container.querySelector("#btn-mag-invert-b")?.addEventListener("click", () => {
    bFieldReversed = !bFieldReversed;
    SoundFX.playSwitchSnap();
    updateTelemetry();
  });

  // Sliders
  container.querySelector("#slider-anode-voltage")?.addEventListener("input", (e) => {
    anodeVoltage = parseFloat(e.target.value);
    container.querySelector("#lbl-anode-voltage").innerText = `${anodeVoltage.toFixed(0)} V`;
    updateTelemetry();
  });

  container.querySelector("#slider-coil-current")?.addEventListener("input", (e) => {
    coilCurrent = parseFloat(e.target.value);
    container.querySelector("#lbl-coil-current").innerText = `${coilCurrent.toFixed(2)} A`;
    updateTelemetry();
  });

  // Export CSV
  container.querySelector("#btn-mag-export")?.addEventListener("click", () => {
    const { v, B, r, em_exp } = getKinematics();
    exportLabDataCsv({
      title: "Magnetic Fields & Thomson e/m Specific Charge Telemetry",
      labId: "magnetism",
      parameters: {
        "Anode Accelerating Voltage V (V)": anodeVoltage,
        "Helmholtz Coil Current I (A)": coilCurrent,
        "Magnetic Flux Density B (T)": B.toExponential(4),
        "Electron Orbit Radius r (m)": r.toFixed(4),
        "Electron Velocity v (m/s)": v.toExponential(4),
        "Measured Specific Charge e/m (C/kg)": em_exp.toExponential(4),
        "Theoretical e/m Ratio (C/kg)": E_M_THEO.toExponential(4)
      },
      headers: ["Parameter", "Value"],
      dataRows: [
        ["Anode Voltage V (V)", anodeVoltage],
        ["Coil Current I (A)", coilCurrent],
        ["Magnetic Field B (T)", B.toExponential(3)],
        ["Radius r (cm)", (r * 100).toFixed(2)],
        ["Velocity v (m/s)", v.toExponential(3)],
        ["Specific Charge e/m (C/kg)", em_exp.toExponential(3)]
      ]
    });
  });

  // Mount Post-Lab Checkpoint Assessment
  mountLabCheckpoint("mag-checkpoint-container", "magnetism");

  return () => {
    if (animId) cancelAnimationFrame(animId);
  };
}
