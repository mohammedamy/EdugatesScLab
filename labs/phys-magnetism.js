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
            \\vec{F} = q(\\vec{v} \\times \\vec{B}) • e/m = \\frac{2V}{B^2 r^2}
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
        <!-- Fine-Beam Tube Canvas -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(34, 197, 94, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #061f10 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="magnetism-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

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

          <!-- Top HUD Overlay -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(34, 197, 94, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">ORBITAL RADIUS &amp; DIAMETER</div>
              <div style="font-weight: 800; font-size: 1.3rem; color: #4ade80; font-family: var(--font-mono);" id="disp-mag-radius">r = 4.25 cm (2r = 8.50 cm)</div>
              <div style="font-size: 0.74rem; color: #38bdf8; font-family: var(--font-mono);" id="disp-mag-bfield">B = 1.15 mT • I = 1.50 A</div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">MEASURED SPECIFIC CHARGE (e/m)</div>
              <div style="font-weight: 800; font-size: 1.25rem; color: #38bdf8; font-family: var(--font-mono);" id="disp-mag-em">1.76 × 10¹¹ C/kg</div>
              <div style="font-size: 0.74rem; color: #facc15; font-family: var(--font-mono);" id="disp-mag-error">Error: 0.2% vs 1.759×10¹¹</div>
            </div>
          </div>

          <!-- Bottom Status Pill -->
          <div style="position: absolute; bottom: 12px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: center; pointer-events: none; font-family: var(--font-mono); font-size: 0.74rem; color: #94a3b8;">
            <span style="background: rgba(0,0,0,0.65); padding: 4px 10px; border-radius: 6px;" id="disp-mag-status">
              ⚡ Centripetal Balance: Lorentz force acts perpendicular to velocity vector
            </span>
            <span style="background: rgba(0,0,0,0.65); padding: 4px 10px; border-radius: 6px;">
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
  const dispEM = container.querySelector("#disp-mag-em");
  const dispError = container.querySelector("#disp-mag-error");
  const dispVel = container.querySelector("#disp-mag-velocity");
  const dispStatus = container.querySelector("#disp-mag-status");
  const dispCalcB = container.querySelector("#disp-calc-b");

  function updateTelemetry() {
    const { v, B, r, em_exp } = getKinematics();
    const r_cm = r * 100;
    const B_mT = B * 1000;
    const errPct = Math.abs(em_exp - E_M_THEO) / E_M_THEO * 100;

    dispRadius.innerText = `r = ${r_cm.toFixed(2)} cm (2r = ${(2 * r_cm).toFixed(2)} cm)`;
    dispBfield.innerText = `B = ${B_mT.toFixed(2)} mT • I = ${coilCurrent.toFixed(2)} A`;
    dispEM.innerText = `${em_exp.toExponential(3)} C/kg`;
    dispError.innerText = `Error: ${errPct.toFixed(1)}% vs 1.759×10¹¹`;
    dispVel.innerText = `${(v / 1e6).toFixed(2)} × 10⁶ m/s`;
    dispCalcB.innerText = `B = ${B_mT.toFixed(2)} mT (I = ${coilCurrent.toFixed(2)} A)`;

    dispStatus.innerText = `⚡ Lorentz Force Balance: F_mag = ${(1.602e-19 * v * B * 1e15).toFixed(2)} fN inward radial centripetal force`;
  }

  // 60 FPS HTML5 Canvas Simulation
  function renderApparatus() {
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Bench Surface
    const benchY = 460;
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, benchY, W, H - benchY);
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, benchY);
    ctx.lineTo(W, benchY);
    ctx.stroke();

    const CX = W * 0.48;
    const CY = 240;

    // --- REAR HELMHOLTZ COIL RING (Perspective) ---
    ctx.strokeStyle = "#b45309";
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.ellipse(CX, CY - 15, 175, 155, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 6;
    ctx.stroke();

    // --- SPHERICAL GLASS FINE-BEAM TUBE ---
    ctx.fillStyle = "rgba(16, 185, 129, 0.03)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(CX, CY, 130, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Mirror ruler glass scale behind the tube
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1;
    for (let cm = -10; cm <= 10; cm += 1) {
      const rx = CX + cm * 11;
      ctx.beginPath();
      ctx.moveTo(rx, CY - 12);
      ctx.lineTo(rx, CY + 12);
      ctx.stroke();
    }

    // Electron Gun Anode Assembly (Bottom of Bulb)
    const gunX = CX;
    const gunY = CY + 110;
    ctx.fillStyle = "#334155";
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.fillRect(gunX - 16, gunY - 20, 32, 20);
    ctx.strokeRect(gunX - 16, gunY - 20, 32, 20);

    // Green Circular Electron Beam Glow
    const { r } = getKinematics();
    // Scale: 1 cm = 11 pixels (tube radius 130px approx 12 cm)
    const pixelRadius = Math.max(15, Math.min(115, r * 100 * 11));

    // Determine circular center based on electron initial tangent velocity (upward) and magnetic force (left or right)
    const circleCenterX = bFieldReversed ? (gunX - pixelRadius) : (gunX + pixelRadius);
    const circleCenterY = gunY - 20;

    // Outer Beam Glow
    ctx.strokeStyle = "rgba(34, 197, 94, 0.25)";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(circleCenterX, circleCenterY, pixelRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Core Electron Beam (Sharp Neon Green Helium Discharge)
    const isSmart = (document.documentElement.getAttribute("data-mode") === "smartboard") ||
                    document.documentElement.classList.contains("fast-smartboard-mode") ||
                    /Android|MAXHUB/i.test(navigator.userAgent);

    ctx.strokeStyle = "#4ade80";
    ctx.lineWidth = 3;
    if (!isSmart) {
      ctx.shadowColor = "#22c55e";
      ctx.shadowBlur = 12;
    }
    ctx.beginPath();
    ctx.arc(circleCenterX, circleCenterY, pixelRadius, 0, Math.PI * 2);
    ctx.stroke();
    if (!isSmart) {
      ctx.shadowBlur = 0; // reset
    }

    // Animated Electron Packet circulating around beam
    const orbitAngle = -(elapsedSeconds * 6) % (Math.PI * 2);
    const elX = circleCenterX + Math.cos(orbitAngle) * pixelRadius;
    const elY = circleCenterY + Math.sin(orbitAngle) * pixelRadius;

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(elX, elY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // --- FRONT HELMHOLTZ COIL RING (Perspective Overlay) ---
    ctx.strokeStyle = "#b45309";
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.ellipse(CX, CY + 15, 175, 155, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 6;
    ctx.stroke();

    // Base Stand Support
    ctx.fillStyle = "#0f172a";
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(CX - 80, benchY - 40, 160, 40, 6);
    ctx.fill();
    ctx.stroke();
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

  container.querySelector("#btn-mag-invert-b")?.addEventListener("click", () => {
    bFieldReversed = !bFieldReversed;
    SoundFX.playSwitchSnap();
  });

  // Sliders
  container.querySelector("#slider-anode-voltage")?.addEventListener("input", (e) => {
    anodeVoltage = parseFloat(e.target.value);
    container.querySelector("#lbl-anode-voltage").innerText = `${anodeVoltage.toFixed(0)} V`;
  });

  container.querySelector("#slider-coil-current")?.addEventListener("input", (e) => {
    coilCurrent = parseFloat(e.target.value);
    container.querySelector("#lbl-coil-current").innerText = `${coilCurrent.toFixed(2)} A`;
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
