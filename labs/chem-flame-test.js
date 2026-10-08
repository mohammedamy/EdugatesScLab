// Edugates-ClipSAT Science Labs - Chemistry: Flame Test & Atomic Emission Spectroscopy Suite
// 60 FPS Precision Simulation:
// Bohr atomic transition model, Planck-Einstein photon energy ΔE = hc / λ = hν,
// Multi-metal chloride salts (Li, Na, K, Cu, Sr, Ba, Ca), Bunsen burner flame chemistry,
// Cobalt blue glass filter, optical diffraction grating spectrometer with continuous vs line spectra.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initFlameTestLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return () => {};

  // Metal Salts Spectral & Physical Data
  const METAL_SALTS = {
    lithium: {
      name: "Lithium Chloride (LiCl)",
      ion: "Li⁺",
      flameColor: "#ff1744", // Carmine Red
      glowColor: "rgba(255, 23, 68, 0.7)",
      wavelength: 670.8, // nm
      transition: "2p → 2s",
      electronConfig: "[He] 2s¹",
      description: "Intense carmine crimson red flame emission. Characteristic alkali metal transition.",
      spectrumLines: [
        { lambda: 670.8, color: "#ff1744", intensity: 1.0, label: "670.8 nm" },
        { lambda: 610.4, color: "#ff6d00", intensity: 0.35, label: "610.4 nm" }
      ]
    },
    sodium: {
      name: "Sodium Chloride (NaCl)",
      ion: "Na⁺",
      flameColor: "#ffb300", // Brilliant Yellow-Orange (Sodium D-Line)
      glowColor: "rgba(255, 179, 0, 0.85)",
      wavelength: 589.0, // nm
      transition: "3p → 3s (D-doublet)",
      electronConfig: "[Ne] 3s¹",
      description: "Extremely luminous golden-yellow flame due to high-intensity unresolved D-line doublet (589.0 & 589.6 nm).",
      spectrumLines: [
        { lambda: 589.0, color: "#ffb300", intensity: 1.0, label: "589.0 nm (D₁)" },
        { lambda: 589.6, color: "#ffc107", intensity: 0.95, label: "589.6 nm (D₂)" }
      ]
    },
    potassium: {
      name: "Potassium Chloride (KCl)",
      ion: "K⁺",
      flameColor: "#c084fc", // Pale Lilac / Violet
      glowColor: "rgba(192, 132, 252, 0.65)",
      wavelength: 766.5, // nm
      transition: "4p → 4s",
      electronConfig: "[Ar] 4s¹",
      description: "Faint lilac/lavender flame. Easily obscured by sodium trace impurities unless viewed through cobalt glass.",
      spectrumLines: [
        { lambda: 766.5, color: "#b91c1c", intensity: 0.8, label: "766.5 nm" },
        { lambda: 769.9, color: "#991b1b", intensity: 0.5, label: "769.9 nm" },
        { lambda: 404.4, color: "#7c3aed", intensity: 0.9, label: "404.4 nm (Violet)" }
      ]
    },
    copper: {
      name: "Copper(II) Chloride (CuCl₂)",
      ion: "Cu²⁺",
      flameColor: "#10b981", // Emerald Blue-Green
      glowColor: "rgba(16, 185, 129, 0.75)",
      wavelength: 510.5, // nm
      transition: "4p → 4s / CuCl molecular bands",
      electronConfig: "[Ar] 3d⁹",
      description: "Vivid blue-green / emerald flame caused by both atomic copper lines and copper halide molecular emissions.",
      spectrumLines: [
        { lambda: 510.5, color: "#10b981", intensity: 0.85, label: "510.5 nm" },
        { lambda: 521.8, color: "#059669", intensity: 0.75, label: "521.8 nm" },
        { lambda: 435.8, color: "#3b82f6", intensity: 0.6, label: "435.8 nm (Cyan-Blue)" }
      ]
    },
    strontium: {
      name: "Strontium Chloride (SrCl₂)",
      ion: "Sr²⁺",
      flameColor: "#e11d48", // Crimson Scarlet Red
      glowColor: "rgba(225, 29, 72, 0.8)",
      wavelength: 640.8, // nm
      transition: "5p → 5s",
      electronConfig: "[Kr] 5s²",
      description: "Deep scarlet-red flame utilized in emergency flares and pyrotechnics.",
      spectrumLines: [
        { lambda: 687.8, color: "#b91c1c", intensity: 0.5, label: "687.8 nm" },
        { lambda: 640.8, color: "#e11d48", intensity: 1.0, label: "640.8 nm" },
        { lambda: 460.7, color: "#0284c7", intensity: 0.7, label: "460.7 nm (Blue)" }
      ]
    },
    barium: {
      name: "Barium Chloride (BaCl₂)",
      ion: "Ba²⁺",
      flameColor: "#a3e635", // Pale Apple Green
      glowColor: "rgba(163, 230, 53, 0.65)",
      wavelength: 553.5, // nm
      transition: "6p → 6s",
      electronConfig: "[Xe] 6s²",
      description: "Pale apple-yellow green flame with prominent green emission lines.",
      spectrumLines: [
        { lambda: 553.5, color: "#84cc16", intensity: 0.95, label: "553.5 nm" },
        { lambda: 513.7, color: "#10b981", intensity: 0.65, label: "513.7 nm" },
        { lambda: 455.4, color: "#38bdf8", intensity: 0.45, label: "455.4 nm" }
      ]
    },
    calcium: {
      name: "Calcium Chloride (CaCl₂)",
      ion: "Ca²⁺",
      flameColor: "#f97316", // Brick Red / Orange
      glowColor: "rgba(249, 115, 22, 0.75)",
      wavelength: 622.0, // nm
      transition: "4p → 4s / CaOH bands",
      electronConfig: "[Ar] 4s²",
      description: "Warm brick-red / orange flame characteristic of alkaline earth calcium.",
      spectrumLines: [
        { lambda: 622.0, color: "#ea580c", intensity: 0.9, label: "622.0 nm" },
        { lambda: 553.3, color: "#84cc16", intensity: 0.4, label: "553.3 nm" },
        { lambda: 422.7, color: "#6366f1", intensity: 0.7, label: "422.7 nm" }
      ]
    }
  };

  // State Variables
  let currentSaltKey = "sodium";
  let airVentRatio = 0.85; // 0.0 (Safety luminous yellow) to 1.0 (Roaring non-luminous blue)
  let isWireInFlame = false;
  let useCobaltGlass = false;
  let wireCleanliness = 1.0; // 1.0 = clean, drops as wire stays in flame
  let viewMode = "sim"; // "sim" or "photo"
  let animId = null;
  let timeTick = 0;

  // Physical Constants
  const PLANCK_H = 6.62607015e-34; // J·s
  const SPEED_C = 2.99792458e8; // m/s
  const EV_CONV = 1.602176634e-19; // J/eV

  function calculatePhotonEnergy(wavelengthNm) {
    const lambdaM = wavelengthNm * 1e-9;
    const energyJoules = (PLANCK_H * SPEED_C) / lambdaM;
    const energyEv = energyJoules / EV_CONV;
    const frequencyThz = (SPEED_C / lambdaM) / 1e12;
    return { energyJoules, energyEv, frequencyThz };
  }

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #f59e0b; box-shadow: 0 0 10px #f59e0b;"></span>
            Flame Test &amp; Atomic Emission Spectroscopy
          </span>
          <span class="badge" style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); color: #fbbf24; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            ${renderLatex("\\Delta E = \\frac{hc}{\\lambda} = h\\nu \\quad \\bullet \\quad \\text{Bohr Rydberg Transitions}")}
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-flame-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔥 Flame Simulation
            </button>
            <button id="view-mode-flame-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-flame-insert" style="padding: 5px 14px; font-size: 0.78rem;">
            🔥 Insert Wire into Flame
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-flame-clean" style="padding: 5px 12px; font-size: 0.78rem;">
            🧪 Clean Wire (HCl Dip)
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-flame-export" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export Spectrum CSV
          </button>
        </div>
      </div>

      <!-- Main Layout Grid -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="flame-layout">
        <!-- Canvas Viewport -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(245, 158, 11, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #1e1b4b 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="flame-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Real Laboratory Photograph Overlay -->
          <div id="flame-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <img src="assets/labs/flame_test_bench.jpg" alt="4K Research Bunsen Burner & Optical Spectroscope Workbench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Apparatus</div>
                <div style="color: #fbbf24; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Teclu / Bunsen Burner</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Excitation Zone</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Non-Luminous Cone (1500°C)</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Spectrometer Resolution</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Δλ &lt; 0.5 nm (Czerny-Turner)</div>
              </div>
            </div>
          </div>

          <!-- Top HUD -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">PRIMARY EMISSION WAVELENGTH</div>
              <div id="hud-flame-lambda" style="font-size: 1.12rem; font-weight: 800; color: #fbbf24; font-family: var(--font-mono);">
                λ = 589.0 nm (Sodium D-Line)
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">QUANTUM PHOTON ENERGY</div>
              <div id="hud-flame-energy" style="font-size: 1.12rem; font-weight: 800; color: #38bdf8; font-family: var(--font-mono);">
                ΔE = 2.105 eV • 509.0 THz
              </div>
            </div>
          </div>
        </div>

        <!-- Controls & Spectroscopy Analytics Side -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Controls Panel -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #fbbf24; text-transform: uppercase; margin-bottom: 12px;">Burner &amp; Salt Sample Controls</div>
            
            <div style="margin-bottom: 12px;">
              <label style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Metal Chloride Salt Sample</label>
              <select id="select-flame-salt" class="form-control" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                ${Object.entries(METAL_SALTS).map(([k, s]) => `<option value="${k}" ${k === currentSaltKey ? "selected" : ""}>${s.name} [${s.ion}]</option>`).join("")}
              </select>
            </div>

            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                <span style="color: #94a3b8;">Burner Air Collar (Oxygen Supply)</span>
                <span id="lbl-air-collar" style="color: #38bdf8; font-weight: 700;">85% (Roaring Blue Flame)</span>
              </div>
              <input id="slider-flame-collar" type="range" min="0" max="100" value="85" style="width: 100%; accent-color: #38bdf8;">
              <div style="display: flex; justify-content: space-between; font-size: 0.68rem; color: #64748b; margin-top: 2px;">
                <span>0% Luminous Yellow (Cool)</span>
                <span>100% Non-Luminous Roaring (Hot)</span>
              </div>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.3); border: 1px solid #334155; border-radius: 8px; padding: 8px 12px;">
              <div>
                <div style="font-size: 0.78rem; font-weight: 700; color: #cbd5e1;">Cobalt Blue Glass Filter</div>
                <div style="font-size: 0.68rem; color: #94a3b8;">Absorbs yellow sodium D-line to reveal faint lilac potassium</div>
              </div>
              <label style="position: relative; display: inline-block; width: 44px; height: 24px; margin: 0; cursor: pointer;">
                <input id="toggle-flame-cobalt" type="checkbox" style="opacity: 0; width: 0; height: 0;">
                <span style="position: absolute; cursor: pointer; inset: 0; background-color: #334155; transition: .3s; border-radius: 24px;" id="toggle-cobalt-slider"></span>
              </label>
            </div>
          </div>

          <!-- Spectroscopy Telemetry Card -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div style="font-size: 0.75rem; font-weight: 700; color: #38bdf8; text-transform: uppercase;">Diffraction Grating Emission Spectrum</div>
              <span id="spectro-active-tag" class="badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-size: 0.68rem; padding: 2px 8px; border-radius: 6px;">
                Optical Sensor Active
              </span>
            </div>
            
            <div style="background: #030712; border: 1px solid #1e293b; border-radius: 8px; padding: 10px;">
              <canvas id="flame-spectro-canvas" width="400" height="90" style="width: 100%; height: 90px; display: block; border-radius: 4px;"></canvas>
              <div style="display: flex; justify-content: space-between; font-size: 0.68rem; color: #64748b; font-family: var(--font-mono); margin-top: 4px;">
                <span>400 nm (Violet)</span>
                <span>500 nm (Cyan)</span>
                <span>600 nm (Amber)</span>
                <span>700 nm (Red)</span>
              </div>
            </div>

            <!-- Transition & Physics Specs -->
            <div id="flame-physics-info" style="margin-top: 12px; background: rgba(0,0,0,0.25); border-radius: 8px; padding: 10px; font-size: 0.76rem; color: #94a3b8; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <span style="color: #64748b;">Electron Config:</span>
                <strong id="info-electron-cfg" style="color: #f1f5f9; display: block; font-family: var(--font-mono);">[Ne] 3s¹</strong>
              </div>
              <div>
                <span style="color: #64748b;">Quantum Transition:</span>
                <strong id="info-transition" style="color: #f1f5f9; display: block; font-family: var(--font-mono);">3p → 3s</strong>
              </div>
              <div style="grid-column: span 2;">
                <span style="color: #64748b;">Spectral Phenomenon:</span>
                <div id="info-phenomenon" style="color: #e2e8f0; margin-top: 2px;">Extremely luminous yellow flame due to intense Na-D doublet lines.</div>
              </div>
            </div>
          </div>

          <!-- Post-Lab Checkpoint Container -->
          <div id="flame-checkpoint-container"></div>
        </div>
      </div>
    </div>
  `;

  // Attach Checkpoint
  mountLabCheckpoint("flame-checkpoint-container", "flametest");

  // DOM Elements
  const canvas = document.getElementById("flame-canvas");
  const ctx = canvas.getContext("2d");
  const spectroCanvas = document.getElementById("flame-spectro-canvas");
  const spectroCtx = spectroCanvas.getContext("2d");

  const viewSimBtn = document.getElementById("view-mode-flame-sim");
  const viewPhotoBtn = document.getElementById("view-mode-flame-photo");
  const photoOverlay = document.getElementById("flame-photo-overlay");

  const btnInsert = document.getElementById("btn-flame-insert");
  const btnClean = document.getElementById("btn-flame-clean");
  const btnExport = document.getElementById("btn-flame-export");

  const selectSalt = document.getElementById("select-flame-salt");
  const sliderCollar = document.getElementById("slider-flame-collar");
  const lblCollar = document.getElementById("lbl-air-collar");
  const toggleCobalt = document.getElementById("toggle-flame-cobalt");
  const toggleSlider = document.getElementById("toggle-cobalt-slider");

  const hudLambda = document.getElementById("hud-flame-lambda");
  const hudEnergy = document.getElementById("hud-flame-energy");

  const infoConfig = document.getElementById("info-electron-cfg");
  const infoTrans = document.getElementById("info-transition");
  const infoPhenom = document.getElementById("info-phenomenon");

  // Wire loop animation coordinates
  let wireX = 180;
  let wireY = 240;
  let targetWireX = 180;
  let targetWireY = 240;

  function updateHUD() {
    const salt = METAL_SALTS[currentSaltKey];
    const { energyEv, frequencyThz } = calculatePhotonEnergy(salt.wavelength);
    
    hudLambda.textContent = `λ = ${salt.wavelength.toFixed(1)} nm (${salt.name.split(" ")[0]})`;
    hudEnergy.textContent = `ΔE = ${energyEv.toFixed(3)} eV • ${frequencyThz.toFixed(1)} THz`;

    infoConfig.textContent = salt.electronConfig;
    infoTrans.textContent = salt.transition;
    infoPhenom.textContent = salt.description;
  }

  // Draw Optical Emission Spectrum
  function renderSpectrogram() {
    const w = spectroCanvas.width;
    const h = spectroCanvas.height;
    spectroCtx.clearRect(0, 0, w, h);

    // Draw background continuum dark or faint thermal blackbody
    const bgGrad = spectroCtx.createLinearGradient(0, 0, w, 0);
    bgGrad.addColorStop(0, "#09090b");
    bgGrad.addColorStop(1, "#09090b");
    spectroCtx.fillStyle = bgGrad;
    spectroCtx.fillRect(0, 0, w, h);

    // If air collar is luminous yellow, draw faint continuous blackbody background
    if (airVentRatio < 0.4 && isWireInFlame) {
      const contGrad = spectroCtx.createLinearGradient(0, 0, w, 0);
      contGrad.addColorStop(0.3, "rgba(56, 189, 248, 0.04)");
      contGrad.addColorStop(0.6, "rgba(250, 204, 21, 0.12)");
      contGrad.addColorStop(0.9, "rgba(239, 68, 68, 0.15)");
      spectroCtx.fillStyle = contGrad;
      spectroCtx.fillRect(0, 0, w, h);
    }

    if (!isWireInFlame) {
      spectroCtx.fillStyle = "#64748b";
      spectroCtx.font = "11px Inter, sans-serif";
      spectroCtx.textAlign = "center";
      spectroCtx.fillText("Insert wire loop into flame to measure spectral emission lines", w / 2, h / 2 + 4);
      return;
    }

    const salt = METAL_SALTS[currentSaltKey];
    
    // Map 380nm - 750nm to canvas width
    const minLambda = 380;
    const maxLambda = 750;

    salt.spectrumLines.forEach(line => {
      let activeColor = line.color;
      let activeIntensity = line.intensity * wireCleanliness;

      // Cobalt glass absorption: strongly suppresses sodium yellow (580-600nm)
      if (useCobaltGlass && line.lambda >= 580 && line.lambda <= 600) {
        activeIntensity *= 0.05; // 95% attenuation
      }

      if (activeIntensity <= 0.01) return;

      const normX = (line.lambda - minLambda) / (maxLambda - minLambda);
      const px = normX * w;

      // Draw spectral glow
      const glow = spectroCtx.createRadialGradient(px, h / 2, 1, px, h / 2, 18);
      glow.addColorStop(0, activeColor);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      spectroCtx.fillStyle = glow;
      spectroCtx.globalAlpha = activeIntensity * 0.8;
      spectroCtx.fillRect(px - 18, 0, 36, h);

      // Draw sharp spectral line
      spectroCtx.globalAlpha = activeIntensity;
      spectroCtx.strokeStyle = activeColor;
      spectroCtx.lineWidth = 2.5;
      spectroCtx.beginPath();
      spectroCtx.moveTo(px, 4);
      spectroCtx.lineTo(px, h - 4);
      spectroCtx.stroke();

      // Peak label
      spectroCtx.fillStyle = "#f8fafc";
      spectroCtx.font = "9px 'JetBrains Mono', monospace";
      spectroCtx.textAlign = "center";
      spectroCtx.fillText(line.label, px, 14);
    });

    spectroCtx.globalAlpha = 1.0;
  }

  // Main 60 FPS Canvas Animation
  function renderFlameCanvas() {
    if (!container || !container.isConnected) return;
    timeTick += 0.04;
    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);

    // Smooth wire transition
    wireX += (targetWireX - wireX) * 0.12;
    wireY += (targetWireY - wireY) * 0.12;

    // Slowly consume salt if wire is kept in flame
    if (isWireInFlame && wireCleanliness > 0.15) {
      wireCleanliness -= 0.0006;
    }

    // 1. Draw Lab Workbench Base
    const benchY = 440;
    const tableGrad = ctx.createLinearGradient(0, benchY, 0, ch);
    tableGrad.addColorStop(0, "#1e293b");
    tableGrad.addColorStop(0.2, "#0f172a");
    tableGrad.addColorStop(1, "#020617");
    ctx.fillStyle = tableGrad;
    ctx.fillRect(0, benchY, cw, ch - benchY);

    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, benchY);
    ctx.lineTo(cw, benchY);
    ctx.stroke();

    // 2. Draw Bunsen Burner Apparatus
    const burnerX = cw * 0.5;
    const burnerBaseY = benchY;
    const barrelH = 150;
    const barrelW = 24;
    const barrelTopY = burnerBaseY - barrelH;

    // Heavy Metal Cast Iron Base
    ctx.fillStyle = "#334155";
    ctx.beginPath();
    ctx.ellipse(burnerX, burnerBaseY, 65, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Natural Gas Rubber Inlet Tubing
    ctx.strokeStyle = "#ea580c";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(burnerX + 25, burnerBaseY - 6);
    ctx.bezierCurveTo(burnerX + 90, burnerBaseY - 2, burnerX + 150, burnerBaseY + 30, cw, burnerBaseY + 30);
    ctx.stroke();

    // Chrome Burner Barrel
    const barrelGrad = ctx.createLinearGradient(burnerX - barrelW / 2, 0, burnerX + barrelW / 2, 0);
    barrelGrad.addColorStop(0, "#475569");
    barrelGrad.addColorStop(0.3, "#94a3b8");
    barrelGrad.addColorStop(0.7, "#cbd5e1");
    barrelGrad.addColorStop(1, "#334155");
    ctx.fillStyle = barrelGrad;
    ctx.fillRect(burnerX - barrelW / 2, barrelTopY, barrelW, barrelH);

    // Air Collar Ring
    const collarY = burnerBaseY - 35;
    const collarH = 22;
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(burnerX - barrelW / 2 - 2, collarY, barrelW + 4, collarH);
    ctx.strokeStyle = "#64748b";
    ctx.strokeRect(burnerX - barrelW / 2 - 2, collarY, barrelW + 4, collarH);

    // Collar Vent Hole (shows open ratio)
    const holeW = (barrelW - 4) * airVentRatio;
    ctx.fillStyle = "#020617";
    ctx.fillRect(burnerX - holeW / 2, collarY + 4, holeW, collarH - 8);

    // 3. Draw Realistic Procedural Flame
    const flameBaseX = burnerX;
    const flameBaseY = barrelTopY + 2;
    const salt = METAL_SALTS[currentSaltKey];

    // Flicker physics
    const flicker1 = Math.sin(timeTick * 12) * 4;
    const flicker2 = Math.cos(timeTick * 18) * 3;
    const flameH = (airVentRatio > 0.5 ? 140 : 180) + flicker1;

    // Ambient Flame Glow
    let flameGlowColor = airVentRatio > 0.5 ? "rgba(56, 189, 248, 0.25)" : "rgba(245, 158, 11, 0.35)";
    if (isWireInFlame && wireCleanliness > 0.05) {
      flameGlowColor = salt.glowColor;
      if (useCobaltGlass && currentSaltKey === "potassium") {
        flameGlowColor = "rgba(168, 85, 247, 0.8)";
      } else if (useCobaltGlass && currentSaltKey === "sodium") {
        flameGlowColor = "rgba(71, 85, 105, 0.2)";
      }
    }

    const radGlow = ctx.createRadialGradient(flameBaseX, flameBaseY - flameH * 0.5, 10, flameBaseX, flameBaseY - flameH * 0.5, flameH * 1.3);
    radGlow.addColorStop(0, flameGlowColor);
    radGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = radGlow;
    ctx.beginPath();
    ctx.arc(flameBaseX, flameBaseY - flameH * 0.5, flameH * 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Base Outer Flame Envelope
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(flameBaseX - barrelW / 2 + 2, flameBaseY);
    ctx.quadraticCurveTo(flameBaseX - 35 + flicker2, flameBaseY - flameH * 0.5, flameBaseX + flicker1, flameBaseY - flameH);
    ctx.quadraticCurveTo(flameBaseX + 35 - flicker2, flameBaseY - flameH * 0.5, flameBaseX + barrelW / 2 - 2, flameBaseY);
    ctx.closePath();

    if (airVentRatio < 0.35) {
      // Safety / Luminous cool yellow flame
      const yellowGrad = ctx.createLinearGradient(0, flameBaseY, 0, flameBaseY - flameH);
      yellowGrad.addColorStop(0, "rgba(245, 158, 11, 0.8)");
      yellowGrad.addColorStop(0.5, "rgba(251, 191, 36, 0.9)");
      yellowGrad.addColorStop(1, "rgba(254, 240, 138, 0.4)");
      ctx.fillStyle = yellowGrad;
    } else {
      // Non-luminous roaring blue flame
      const blueGrad = ctx.createLinearGradient(0, flameBaseY, 0, flameBaseY - flameH);
      blueGrad.addColorStop(0, "rgba(30, 58, 138, 0.9)");
      blueGrad.addColorStop(0.3, "rgba(56, 189, 248, 0.8)");
      blueGrad.addColorStop(0.8, "rgba(125, 211, 252, 0.35)");
      blueGrad.addColorStop(1, "rgba(224, 242, 254, 0.1)");
      ctx.fillStyle = blueGrad;
    }
    ctx.fill();

    // Inner Cone (Hottest zone ~1500°C)
    if (airVentRatio > 0.4) {
      const coneH = 65 + flicker1 * 0.4;
      ctx.beginPath();
      ctx.moveTo(flameBaseX - barrelW / 2 + 4, flameBaseY);
      ctx.quadraticCurveTo(flameBaseX - 16, flameBaseY - coneH * 0.5, flameBaseX, flameBaseY - coneH);
      ctx.quadraticCurveTo(flameBaseX + 16, flameBaseY - coneH * 0.5, flameBaseX + barrelW / 2 - 4, flameBaseY);
      ctx.closePath();
      const innerGrad = ctx.createLinearGradient(0, flameBaseY, 0, flameBaseY - coneH);
      innerGrad.addColorStop(0, "rgba(6, 182, 212, 0.95)");
      innerGrad.addColorStop(0.8, "rgba(103, 232, 249, 0.85)");
      innerGrad.addColorStop(1, "rgba(255, 255, 255, 0.95)");
      ctx.fillStyle = innerGrad;
      ctx.fill();
    }

    // Metal Emission Color Flare (When wire is immersed)
    if (isWireInFlame && wireCleanliness > 0.05) {
      let flareColor = salt.flameColor;
      let alpha = wireCleanliness * 0.85;

      if (useCobaltGlass) {
        if (currentSaltKey === "sodium") {
          flareColor = "#64748b";
          alpha = 0.08; // absorbed!
        } else if (currentSaltKey === "potassium") {
          flareColor = "#a855f7"; // enhanced violet!
          alpha = 0.95;
        }
      }

      ctx.beginPath();
      ctx.moveTo(flameBaseX - 10, flameBaseY - 30);
      ctx.quadraticCurveTo(flameBaseX - 45 + flicker1, flameBaseY - flameH * 0.6, flameBaseX + flicker2, flameBaseY - flameH * 1.15);
      ctx.quadraticCurveTo(flameBaseX + 45 - flicker1, flameBaseY - flameH * 0.6, flameBaseX + 10, flameBaseY - 30);
      ctx.closePath();

      const flareGrad = ctx.createRadialGradient(flameBaseX, flameBaseY - flameH * 0.7, 5, flameBaseX, flameBaseY - flameH * 0.7, flameH * 0.8);
      flareGrad.addColorStop(0, flareColor);
      flareGrad.addColorStop(0.7, flareColor);
      flareGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = flareGrad;
      ctx.globalAlpha = alpha;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }
    ctx.restore();

    // 4. Draw Nichrome / Platinum Wire Loop Apparatus
    ctx.save();
    // Glass handle rod
    ctx.strokeStyle = "rgba(148, 163, 184, 0.85)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(wireX - 140, wireY + 70);
    ctx.lineTo(wireX - 60, wireY + 30);
    ctx.stroke();

    // Brass chuck collar
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(wireX - 62, wireY + 27, 8, 6);

    // Platinum needle wire
    ctx.strokeStyle = isWireInFlame ? "#fed7aa" : "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wireX - 54, wireY + 30);
    ctx.lineTo(wireX, wireY);
    ctx.stroke();

    // Platinum tip loop
    ctx.beginPath();
    ctx.arc(wireX + 5, wireY - 2, 5, 0, Math.PI * 2);
    ctx.strokeStyle = isWireInFlame ? "#ffedd5" : "#94a3b8";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Chemical Salt Crystal bead inside loop
    if (wireCleanliness > 0.05) {
      ctx.beginPath();
      ctx.arc(wireX + 5, wireY - 2, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = isWireInFlame ? salt.flameColor : "#f8fafc";
      ctx.fill();
    }
    ctx.restore();

    // 5. Cobalt Glass Filter Overlay (If Active)
    if (useCobaltGlass) {
      ctx.fillStyle = "rgba(30, 27, 75, 0.55)";
      ctx.fillRect(0, 0, cw, ch);
      
      // Glass border frame
      ctx.strokeStyle = "rgba(99, 102, 241, 0.7)";
      ctx.lineWidth = 6;
      ctx.strokeRect(6, 6, cw - 12, ch - 12);

      ctx.fillStyle = "#a5b4fc";
      ctx.font = "bold 11px Inter, sans-serif";
      ctx.fillText("COBALT BLUE GLASS FILTER ACTIVE (λ 589 nm ATTENUATED)", 20, ch - 20);
    }

    renderSpectrogram();
    animId = requestAnimationFrame(renderFlameCanvas);
  }

  // Event Listeners
  selectSalt.addEventListener("change", (e) => {
    currentSaltKey = e.target.value;
    wireCleanliness = 1.0;
    SoundFX.droplet();
    updateHUD();
  });

  sliderCollar.addEventListener("input", (e) => {
    airVentRatio = parseFloat(e.target.value) / 100;
    if (airVentRatio > 0.7) {
      lblCollar.textContent = `${Math.round(airVentRatio * 100)}% (Roaring Blue Flame)`;
      lblCollar.style.color = "#38bdf8";
    } else if (airVentRatio > 0.3) {
      lblCollar.textContent = `${Math.round(airVentRatio * 100)}% (Medium Flame)`;
      lblCollar.style.color = "#fbbf24";
    } else {
      lblCollar.textContent = `${Math.round(airVentRatio * 100)}% (Safety Yellow Flame)`;
      lblCollar.style.color = "#f97316";
    }
  });

  btnInsert.addEventListener("click", () => {
    isWireInFlame = !isWireInFlame;
    if (isWireInFlame) {
      targetWireX = canvas.width * 0.5 - 10;
      targetWireY = 240;
      btnInsert.textContent = "↩ Retract Wire Loop";
      btnInsert.classList.replace("btn-primary", "btn-secondary");
      SoundFX.snap();
    } else {
      targetWireX = 180;
      targetWireY = 240;
      btnInsert.textContent = "🔥 Insert Wire into Flame";
      btnInsert.classList.replace("btn-secondary", "btn-primary");
      SoundFX.click();
    }
  });

  btnClean.addEventListener("click", () => {
    wireCleanliness = 1.0;
    targetWireX = 120;
    targetWireY = 380;
    isWireInFlame = false;
    btnInsert.textContent = "🔥 Insert Wire into Flame";
    btnInsert.classList.replace("btn-secondary", "btn-primary");
    SoundFX.droplet();
    setTimeout(() => {
      targetWireX = 180;
      targetWireY = 240;
    }, 450);
  });

  toggleCobalt.addEventListener("change", (e) => {
    useCobaltGlass = e.target.checked;
    toggleSlider.style.backgroundColor = useCobaltGlass ? "#6366f1" : "#334155";
    SoundFX.click();
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
    const salt = METAL_SALTS[currentSaltKey];
    const { energyJoules, energyEv, frequencyThz } = calculatePhotonEnergy(salt.wavelength);

    exportLabDataCsv({
      title: "Flame Test & Atomic Emission Spectroscopy",
      labId: "flametest",
      parameters: {
        "Salt Analyte": salt.name,
        "Cation Ion": salt.ion,
        "Dominant Emission Wavelength": `${salt.wavelength} nm`,
        "Photon Energy (eV)": `${energyEv.toFixed(4)} eV`,
        "Photon Energy (Joules)": `${energyJoules.toExponential(4)} J`,
        "Frequency": `${frequencyThz.toFixed(2)} THz`,
        "Burner Air Collar Vent": `${Math.round(airVentRatio * 100)}%`,
        "Cobalt Filter Active": useCobaltGlass ? "Yes" : "No"
      },
      headers: ["Peak Label", "Wavelength (nm)", "Relative Intensity", "Color"],
      dataRows: salt.spectrumLines.map(l => [
        l.label,
        l.lambda,
        l.intensity,
        l.color
      ])
    });
    SoundFX.success();
  });

  // Start Animation Loop
  updateHUD();
  animId = requestAnimationFrame(renderFlameCanvas);

  return function cleanupFlameTestLab() {
    if (animId) cancelAnimationFrame(animId);
  };
}
