// Edugates-ClipSAT Science Labs - Physics: Coulomb's Law & Electrostatic Field Mapping Suite
// 60 FPS Precision Classical Electromagnetism Simulation:
// Coulomb's Law F = ke·|q1·q2|/r², Electric field vector superposition E = ∑ ke·qi/ri² · r̂i,
// Electric potential V(r) = ∑ ke·qi/ri, Equipotential contour lines,
// Preset configurations (Dipole, Quadrupole, Point Charges, Parallel Plates),
// Movable high-impedance digital electrometer / test charge probe.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initElectrostaticsLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return () => {};

  // Physical Constants
  const COULOMB_KE = 8.9875517923e9; // N·m²/C²
  const EPSILON_0 = 8.8541878128e-12; // F/m

  // Active Charges Array
  const charges = [];

  // Preset Configurations
  const PRESETS = {
    dipole: {
      name: "Electric Dipole (+q and -q)",
      description: "Equal and opposite point charges separated by distance d. Generates classic dipole field lines and planar V=0 equipotential.",
      init: (cw, ch) => [
        { id: 1, q: 2.0, x: cw * 0.5 - 90, y: ch * 0.5, radius: 14, color: "#ef4444" },
        { id: 2, q: -2.0, x: cw * 0.5 + 90, y: ch * 0.5, radius: 14, color: "#3b82f6" }
      ]
    },
    like_charges: {
      name: "Repelling Like Charges (+q and +q)",
      description: "Two identical positive charges demonstrating mutual repulsion and a central saddle point where E = 0.",
      init: (cw, ch) => [
        { id: 1, q: 2.5, x: cw * 0.5 - 90, y: ch * 0.5, radius: 15, color: "#ef4444" },
        { id: 2, q: 2.5, x: cw * 0.5 + 90, y: ch * 0.5, radius: 15, color: "#ef4444" }
      ]
    },
    quadrupole: {
      name: "Electric Quadrupole (+ - / - +)",
      description: "Four alternating point charges forming a symmetric quadrupole field with high angular dependence.",
      init: (cw, ch) => [
        { id: 1, q: 2.0, x: cw * 0.5 - 80, y: ch * 0.5 - 80, radius: 14, color: "#ef4444" },
        { id: 2, q: -2.0, x: cw * 0.5 + 80, y: ch * 0.5 - 80, radius: 14, color: "#3b82f6" },
        { id: 3, q: -2.0, x: cw * 0.5 - 80, y: ch * 0.5 + 80, radius: 14, color: "#3b82f6" },
        { id: 4, q: 2.0, x: cw * 0.5 + 80, y: ch * 0.5 + 80, radius: 14, color: "#ef4444" }
      ]
    },
    parallel_plates: {
      name: "Parallel Capacitor Plates",
      description: "Oppositely charged parallel plates demonstrating a uniform electric field E = σ / ε₀ between plates with fringing fields at edges.",
      init: (cw, ch) => {
        const arr = [];
        for (let i = -3; i <= 3; i++) {
          arr.push({ id: 10 + i, q: 0.6, x: cw * 0.5 - 80, y: ch * 0.5 + i * 26, radius: 8, color: "#ef4444" });
          arr.push({ id: 20 + i, q: -0.6, x: cw * 0.5 + 80, y: ch * 0.5 + i * 26, radius: 8, color: "#3b82f6" });
        }
        return arr;
      }
    }
  };

  // State Variables
  let currentPresetKey = "dipole";
  let probeX = 290;
  let probeY = 180;
  let isDraggingProbe = false;
  let showVectors = true;
  let showEquipotentials = true;
  let viewMode = "sim"; // "sim" or "photo"
  let animId = null;

  function loadPreset(key) {
    currentPresetKey = key;
    charges.length = 0;
    const cw = 580;
    const ch = 530;
    charges.push(...PRESETS[key].init(cw, ch));
    SoundFX.droplet();
  }

  // Calculate Field E and Potential V at arbitrary point (x, y)
  // Scale: 100 pixels = 0.50 meters (1 px = 0.005 m = 5 mm)
  const METERS_PER_PX = 0.005;

  function calculateFieldAt(px, py) {
    let Ex = 0;
    let Ey = 0;
    let V = 0;

    charges.forEach(ch => {
      const dxMeters = (px - ch.x) * METERS_PER_PX;
      const dyMeters = (py - ch.y) * METERS_PER_PX;
      const rMeters = Math.sqrt(dxMeters * dxMeters + dyMeters * dyMeters);

      if (rMeters > 0.015) {
        // Potential V = ke * q / r (where q is in nanoCoulombs 1e-9)
        const qC = ch.q * 1e-9;
        V += (COULOMB_KE * qC) / rMeters;

        // Field E = ke * q / r² · r̂
        const eMag = (COULOMB_KE * qC) / (rMeters * rMeters);
        Ex += eMag * (dxMeters / rMeters);
        Ey += eMag * (dyMeters / rMeters);
      }
    });

    const eTotal = Math.sqrt(Ex * Ex + Ey * Ey);
    return { Ex, Ey, eTotal, V };
  }

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #818cf8; box-shadow: 0 0 10px #818cf8;"></span>
            Coulomb's Law &amp; Electrostatic Field Mapping
          </span>
          <span class="badge" style="background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); color: #a5b4fc; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            F = k_e q₁q₂ / r² • E = -∇V • Equipotential Contours
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-electro-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              ⚡ Field Visualizer
            </button>
            <button id="view-mode-electro-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-electro-reset-probe" style="padding: 5px 14px; font-size: 0.78rem;">
            📍 Center Probe
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-electro-export" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export Field Data
          </button>
        </div>
      </div>

      <!-- Main Layout Grid -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="electro-layout">
        <!-- Canvas Viewport -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(99, 102, 241, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #1e1b4b 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px; cursor: crosshair;">
          <canvas id="electro-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Real Laboratory Photograph Overlay -->
          <div id="electro-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <img src="assets/labs/electrostatics_bench.jpg" alt="4K Research High-Voltage Van de Graaff & Electrostatics Field Mapping Workbench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Field Tank Apparatus</div>
                <div style="color: #818cf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Conductive Electrolytic Tank</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Voltmeter Probe</div>
                <div style="color: #facc15; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Silver Needle Electrode (10 GΩ)</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Electric Potential Precision</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">ΔV = ±0.01 Volts Resolution</div>
              </div>
            </div>
          </div>

          <!-- Top HUD -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">ELECTRIC POTENTIAL AT PROBE (V)</div>
              <div id="hud-electro-v" style="font-size: 1.12rem; font-weight: 800; color: #facc15; font-family: var(--font-mono);">
                V = +24.80 Volts
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">ELECTRIC FIELD INTENSITY |E|</div>
              <div id="hud-electro-e" style="font-size: 1.12rem; font-weight: 800; color: #38bdf8; font-family: var(--font-mono);">
                |E| = 142.5 V/m (N/C)
              </div>
            </div>
          </div>
        </div>

        <!-- Controls & Field Analytics Side -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Controls Panel -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #818cf8; text-transform: uppercase; margin-bottom: 12px;">Charge Topologies &amp; Visual Overlays</div>
            
            <div style="margin-bottom: 12px;">
              <label style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Electrode Configuration Preset</label>
              <select id="select-electro-preset" class="form-control" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                ${Object.entries(PRESETS).map(([k, p]) => `<option value="${k}" ${k === currentPresetKey ? "selected" : ""}>${p.name}</option>`).join("")}
              </select>
            </div>

            <!-- Toggles for Field Vectors & Equipotentials -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <label style="display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.3); border: 1px solid #334155; border-radius: 8px; padding: 8px 10px; cursor: pointer; font-size: 0.76rem; color: #cbd5e1;">
                <input id="toggle-field-vectors" type="checkbox" checked style="accent-color: #38bdf8; width: 16px; height: 16px;">
                <span>E-Field Vector Grid</span>
              </label>

              <label style="display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.3); border: 1px solid #334155; border-radius: 8px; padding: 8px 10px; cursor: pointer; font-size: 0.76rem; color: #cbd5e1;">
                <input id="toggle-equipotentials" type="checkbox" checked style="accent-color: #facc15; width: 16px; height: 16px;">
                <span>Equipotential Lines</span>
              </label>
            </div>
          </div>

          <!-- Voltmeter Probe Telemetry -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div style="font-size: 0.75rem; font-weight: 700; color: #38bdf8; text-transform: uppercase;">Electrometer Probe Sensor</div>
              <span class="badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-size: 0.68rem; padding: 2px 8px; border-radius: 6px;">
                Drag Probe Anywhere on Canvas
              </span>
            </div>
            
            <div style="background: #030712; border: 1px solid #1e293b; border-radius: 8px; padding: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.76rem;">
              <div>
                <span style="color: #64748b;">Probe Coordinates:</span>
                <strong id="val-probe-pos" style="color: #f8fafc; display: block; font-family: var(--font-mono);">x = 0.00 m, y = -0.15 m</strong>
              </div>
              <div>
                <span style="color: #64748b;">Field Vector Angle:</span>
                <strong id="val-field-theta" style="color: #38bdf8; display: block; font-family: var(--font-mono);">θ = -34.2°</strong>
              </div>
              <div>
                <span style="color: #64748b;">E_x Component:</span>
                <strong id="val-ex" style="color: #f8fafc; display: block; font-family: var(--font-mono);">+117.8 V/m</strong>
              </div>
              <div>
                <span style="color: #64748b;">E_y Component:</span>
                <strong id="val-ey" style="color: #f8fafc; display: block; font-family: var(--font-mono);">-80.4 V/m</strong>
              </div>
            </div>

            <div id="electro-preset-desc" style="margin-top: 10px; font-size: 0.74rem; color: #94a3b8; line-height: 1.4; background: rgba(0,0,0,0.25); border-radius: 6px; padding: 8px 12px;">
              Equal and opposite point charges separated by distance d. Generates classic dipole field lines.
            </div>
          </div>

          <!-- Post-Lab Checkpoint Container -->
          <div id="electro-checkpoint-container"></div>
        </div>
      </div>
    </div>
  `;

  // Attach Checkpoint
  mountLabCheckpoint("electro-checkpoint-container", "electrostatics");

  // DOM Elements
  const canvas = document.getElementById("electro-canvas");
  const ctx = canvas.getContext("2d");

  const viewSimBtn = document.getElementById("view-mode-electro-sim");
  const viewPhotoBtn = document.getElementById("view-mode-electro-photo");
  const photoOverlay = document.getElementById("electro-photo-overlay");

  const btnResetProbe = document.getElementById("btn-electro-reset-probe");
  const btnExport = document.getElementById("btn-electro-export");

  const selectPreset = document.getElementById("select-electro-preset");
  const toggleVectors = document.getElementById("toggle-field-vectors");
  const togglePotentials = document.getElementById("toggle-equipotentials");

  const hudV = document.getElementById("hud-electro-v");
  const hudE = document.getElementById("hud-electro-e");
  const valPos = document.getElementById("val-probe-pos");
  const valTheta = document.getElementById("val-field-theta");
  const valEx = document.getElementById("val-ex");
  const valEy = document.getElementById("val-ey");
  const presetDesc = document.getElementById("electro-preset-desc");

  function updateHUD() {
    const { Ex, Ey, eTotal, V } = calculateFieldAt(probeX, probeY);
    hudV.textContent = `V = ${V >= 0 ? "+" : ""}${V.toFixed(2)} Volts`;
    hudV.style.color = V >= 0 ? "#facc15" : "#38bdf8";

    hudE.textContent = `|E| = ${eTotal.toFixed(1)} V/m`;

    const xMeters = (probeX - canvas.width * 0.5) * METERS_PER_PX;
    const yMeters = -(probeY - canvas.height * 0.5) * METERS_PER_PX;
    valPos.textContent = `x = ${xMeters.toFixed(2)} m, y = ${yMeters.toFixed(2)} m`;

    const angleDeg = (Math.atan2(Ey, Ex) * 180) / Math.PI;
    valTheta.textContent = `θ = ${angleDeg.toFixed(1)}°`;
    valEx.textContent = `${Ex >= 0 ? "+" : ""}${Ex.toFixed(1)} V/m`;
    valEy.textContent = `${Ey >= 0 ? "+" : ""}${Ey.toFixed(1)} V/m`;

    presetDesc.textContent = PRESETS[currentPresetKey].description;
  }

  // 60 FPS Electrostatic Canvas Render Loop
  function renderElectroCanvas() {
    if (!container || !container.isConnected) return;
    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);

    // 1. Equipotential Contour Lines (Iso-potential curves)
    if (showEquipotentials) {
      ctx.save();
      const contourVoltages = [-50, -30, -15, -5, 0, 5, 15, 30, 50];
      // Grid sampling for contour lines
      const step = 20;
      for (let x = 10; x < cw; x += step) {
        for (let y = 10; y < ch; y += step) {
          const { V } = calculateFieldAt(x, y);
          // Highlight near zero line
          if (Math.abs(V) < 2.5) {
            ctx.fillStyle = "rgba(148, 163, 184, 0.4)";
            ctx.fillRect(x - 1, y - 1, 2, 2);
          } else if (Math.abs(V - 20) < 3.0 || Math.abs(V + 20) < 3.0) {
            ctx.fillStyle = V > 0 ? "rgba(245, 158, 11, 0.35)" : "rgba(56, 189, 248, 0.35)";
            ctx.fillRect(x - 1, y - 1, 2, 2);
          }
        }
      }
      ctx.restore();
    }

    // 2. Electric Field Vector Grid Arrows (E = -∇V)
    if (showVectors) {
      ctx.save();
      const gridSpacing = 32;
      for (let x = gridSpacing / 2; x < cw; x += gridSpacing) {
        for (let y = gridSpacing / 2; y < ch; y += gridSpacing) {
          const { Ex, Ey, eTotal } = calculateFieldAt(x, y);
          if (eTotal > 2.0) {
            const angle = Math.atan2(Ey, Ex);
            const arrowLen = Math.min(18, 4 + Math.log10(eTotal) * 4);
            const alpha = Math.min(0.85, 0.15 + (arrowLen / 18) * 0.7);

            ctx.strokeStyle = `rgba(129, 140, 248, ${alpha})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(angle) * arrowLen, y + Math.sin(angle) * arrowLen);
            ctx.stroke();

            // Arrowhead
            const tipX = x + Math.cos(angle) * arrowLen;
            const tipY = y + Math.sin(angle) * arrowLen;
            ctx.fillStyle = `rgba(129, 140, 248, ${alpha})`;
            ctx.beginPath();
            ctx.arc(tipX, tipY, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.restore();
    }

    // 3. Render Point Charges
    charges.forEach(chg => {
      ctx.save();
      // Charge glow
      const glowGrad = ctx.createRadialGradient(chg.x, chg.y, 2, chg.x, chg.y, chg.radius * 2.2);
      glowGrad.addColorStop(0, chg.q > 0 ? "rgba(239, 68, 68, 0.8)" : "rgba(59, 130, 246, 0.8)");
      glowGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(chg.x, chg.y, chg.radius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Solid charge body
      ctx.fillStyle = chg.color;
      ctx.beginPath();
      ctx.arc(chg.x, chg.y, chg.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Charge sign (+ or -)
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${Math.max(10, chg.radius)}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(chg.q > 0 ? "+" : "−", chg.x, chg.y + (chg.q > 0 ? 1 : -1));
      ctx.restore();
    });

    // 4. Movable Digital Voltmeter Probe Target
    ctx.save();
    // Concentric probe reticle
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(probeX, probeY, 12, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(probeX - 16, probeY);
    ctx.lineTo(probeX + 16, probeY);
    ctx.moveTo(probeX, probeY - 16);
    ctx.lineTo(probeX, probeY + 16);
    ctx.stroke();

    // Center needle dot
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(probeX, probeY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Probe readout tag
    const { V } = calculateFieldAt(probeX, probeY);
    ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(probeX + 18, probeY - 14, 65, 22, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#facc15";
    ctx.font = "bold 10px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${V >= 0 ? "+" : ""}${V.toFixed(1)} V`, probeX + 50, probeY - 3);
    ctx.restore();

    updateHUD();
    animId = requestAnimationFrame(renderElectroCanvas);
  }

  // Pointer Dragging for Voltmeter Probe
  function handlePointerMove(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    probeX = (e.clientX - rect.left) * scaleX;
    probeY = (e.clientY - rect.top) * scaleY;
  }

  canvas.addEventListener("pointerdown", (e) => {
    isDraggingProbe = true;
    handlePointerMove(e);
    canvas.setPointerCapture(e.pointerId);
    SoundFX.click();
  });

  canvas.addEventListener("pointermove", (e) => {
    if (isDraggingProbe) {
      handlePointerMove(e);
    }
  });

  canvas.addEventListener("pointerup", (e) => {
    isDraggingProbe = false;
    canvas.releasePointerCapture(e.pointerId);
  });

  // Event Listeners
  selectPreset.addEventListener("change", (e) => {
    loadPreset(e.target.value);
    updateHUD();
  });

  toggleVectors.addEventListener("change", (e) => {
    showVectors = e.target.checked;
    SoundFX.click();
  });

  togglePotentials.addEventListener("change", (e) => {
    showEquipotentials = e.target.checked;
    SoundFX.click();
  });

  btnResetProbe.addEventListener("click", () => {
    probeX = canvas.width * 0.5;
    probeY = canvas.height * 0.5 - 40;
    SoundFX.snap();
    updateHUD();
  });

  // View Switcher (Sim vs 4K Photo)
  viewSimBtn.addEventListener("click", () => {
    viewMode = "sim";
    viewSimBtn.classList.add("active");
    viewPhotoBtn.classList.remove("active");
    viewSimBtn.style.background = "#0284c7";
    viewPhotoBtn.style.background = "transparent";
    photoOverlay.style.display = "none";
    canvas.style.display = "block";
    SoundFX.click();
  });

  viewPhotoBtn.addEventListener("click", () => {
    viewMode = "photo";
    viewPhotoBtn.classList.add("active");
    viewSimBtn.classList.remove("active");
    viewPhotoBtn.style.background = "#0284c7";
    viewSimBtn.style.background = "transparent";
    photoOverlay.style.display = "block";
    canvas.style.display = "none";
    SoundFX.click();
  });

  // Telemetry CSV Export
  btnExport.addEventListener("click", () => {
    const { Ex, Ey, eTotal, V } = calculateFieldAt(probeX, probeY);

    exportLabDataCsv({
      title: "Coulomb's Law & Electrostatic Field Mapping Lab",
      labId: "electrostatics",
      parameters: {
        "Charge Topology": PRESETS[currentPresetKey].name,
        "Total Point Charges": charges.length,
        "Probe Coordinates": `(${((probeX - canvas.width * 0.5) * METERS_PER_PX).toFixed(3)} m, ${(-(probeY - canvas.height * 0.5) * METERS_PER_PX).toFixed(3)} m)`,
        "Potential V at Probe": `${V.toFixed(2)} Volts`,
        "Electric Field |E| at Probe": `${eTotal.toFixed(2)} V/m`,
        "Coulomb Constant ke": "8.988 × 10⁹ N·m²/C²"
      },
      headers: ["Grid X (m)", "Grid Y (m)", "Potential V (Volts)", "Ex (V/m)", "Ey (V/m)", "|E| Field (V/m)"],
      dataRows: [-0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3].map(xM => {
        const px = canvas.width * 0.5 + xM / METERS_PER_PX;
        const py = probeY;
        const f = calculateFieldAt(px, py);
        return [
          xM.toFixed(2),
          (-(py - canvas.height * 0.5) * METERS_PER_PX).toFixed(2),
          f.V.toFixed(2),
          f.Ex.toFixed(2),
          f.Ey.toFixed(2),
          f.eTotal.toFixed(2)
        ];
      })
    });
    SoundFX.success();
  });

  // Start Animation Loop
  loadPreset(currentPresetKey);
  updateHUD();
  animId = requestAnimationFrame(renderElectroCanvas);

  return function cleanupElectrostaticsLab() {
    if (animId) cancelAnimationFrame(animId);
  };
}
