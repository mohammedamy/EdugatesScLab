// Edugates-ClipSAT Science Labs - Chemistry: Thin-Layer (TLC), Flash Column & HPLC Chromatography Suite
// 60 FPS Precision Analytical Separation Simulation:
// Lucas-Washburn capillary rise kinetics z_f(t) = sqrt(k·t), Snyder eluotropic solvent polarity index (P'),
// Normal-phase polar silica (Si-OH) vs Reversed-phase C18 octadecyl stationary phase partitioning,
// Retention factor Rf = d_substance / d_solvent, chromatographic resolution Rs = 2(t_R2 - t_R1)/(w1 + w2),
// Multi-wavelength UV-254nm fluorescence quenching, UV-365nm porphyrin red fluorescence, and I2 vapor staining.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initChromatographyLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return () => {};

  // Sample Mixture Profiles with Polarity Index (0 = Nonpolar Hydrocarbon, 1 = Highly Polar H-Bonding)
  const SAMPLE_MIXTURES = {
    spinach: {
      name: "Spinach Chloroplast Pigments",
      category: "Photosynthetic Natural Extracts",
      description: "Separates nonpolar carotenes from polar xanthophylls and porphyrin chlorophylls a & b.",
      compounds: [
        {
          id: "carotene",
          name: "β-Carotene",
          formula: "C₄₀H₅₆",
          polarity: 0.08, // Very nonpolar polyene hydrocarbon
          mw: 536.87,
          visColor: "#f97316",
          uv254Color: "#1e1b4b",
          uv365Color: "#fb923c",
          iodineColor: "#92400e",
          uvActive: true,
          imfType: "London Dispersion Only",
          lane: 0
        },
        {
          id: "pheophytin",
          name: "Pheophytin a",
          formula: "C₅₅H₇₄N₄O₅",
          polarity: 0.31,
          mw: 871.20,
          visColor: "#65a30d",
          uv254Color: "#312e81",
          uv365Color: "#e11d48",
          iodineColor: "#78350f",
          uvActive: true,
          imfType: "Weak Dipole-Dipole + Ester",
          lane: 0
        },
        {
          id: "chlorophylla",
          name: "Chlorophyll a",
          formula: "C₅₅H₇₂MgN₄O₅",
          polarity: 0.52, // Methyl (-CH3) substituent on chlorin ring
          mw: 893.51,
          visColor: "#059669",
          uv254Color: "#1e1b4b",
          uv365Color: "#ff1744", // Vivid ruby-crimson fluorescence under 365nm UV
          iodineColor: "#451a03",
          uvActive: true,
          imfType: "Mg²⁺ Coordination + Ketone Dipole",
          lane: 0
        },
        {
          id: "chlorophyllb",
          name: "Chlorophyll b",
          formula: "C₅₅H₇₀MgN₄O₆",
          polarity: 0.68, // Polar aldehyde (-CHO) group increases silica adsorption
          mw: 907.49,
          visColor: "#84cc16",
          uv254Color: "#1e1b4b",
          uv365Color: "#f43f5e",
          iodineColor: "#713f12",
          uvActive: true,
          imfType: "Polar Aldehyde (-CHO) H-Bonding",
          lane: 0
        },
        {
          id: "xanthophyll",
          name: "Lutein (Xanthophyll)",
          formula: "C₄₀H₅₆O₂",
          polarity: 0.81, // Two polar hydroxyl (-OH) groups bind strongly to Si-OH
          mw: 568.87,
          visColor: "#eab308",
          uv254Color: "#312e81",
          uv365Color: "#facc15",
          iodineColor: "#b45309",
          uvActive: true,
          imfType: "Dual Hydroxyl (-OH) H-Bonding",
          lane: 0
        }
      ]
    },
    analgesics: {
      name: "Pharmaceutical Analgesics (TLC Drug Panel)",
      category: "Forensic & Medicinal Chemistry",
      description: "Colorless aromatic analgesics requiring UV-254nm fluorescence quenching or I₂ staining for visualization.",
      compounds: [
        {
          id: "ibuprofen",
          name: "Ibuprofen",
          formula: "C₁₃H₁₈O₂",
          polarity: 0.24, // Nonpolar isobutyl phenylpropionic acid
          mw: 206.28,
          visColor: "rgba(226, 232, 240, 0.14)", // Nearly invisible under white light
          uv254Color: "#311042", // Dark purple quenched spot on green F254 plate
          uv365Color: "#6366f1",
          iodineColor: "#b45309",
          uvActive: true,
          imfType: "Hydrophobic Isobutyl + Carboxyl",
          lane: 0
        },
        {
          id: "aspirin",
          name: "Aspirin (Acetylsalicylic Acid)",
          formula: "C₉H₈O₄",
          polarity: 0.44,
          mw: 180.16,
          visColor: "rgba(226, 232, 240, 0.14)",
          uv254Color: "#2e1065",
          uv365Color: "#38bdf8",
          iodineColor: "#92400e",
          uvActive: true,
          imfType: "Ester + Carboxylic Acid H-Bonding",
          lane: 0
        },
        {
          id: "acetaminophen",
          name: "Acetaminophen (Paracetamol)",
          formula: "C₈H₉NO₂",
          polarity: 0.64,
          mw: 151.16,
          visColor: "rgba(226, 232, 240, 0.14)",
          uv254Color: "#1e1b4b",
          uv365Color: "#818cf8",
          iodineColor: "#78350f",
          uvActive: true,
          imfType: "Phenol (-OH) + Amide (-NHCO-) H-Bonding",
          lane: 0
        },
        {
          id: "caffeine",
          name: "Caffeine",
          formula: "C₈H₁₀N₄O₂",
          polarity: 0.84, // Strongly polar xanthine alkaloid
          mw: 194.19,
          visColor: "rgba(226, 232, 240, 0.14)",
          uv254Color: "#170d36",
          uv365Color: "#a855f7",
          iodineColor: "#451a03",
          uvActive: true,
          imfType: "Poly-Nitrogen Purine Dione Dipole",
          lane: 0
        }
      ]
    },
    dyes: {
      name: "Forensic Ink & Organic Azo Dyes",
      category: "Analytical Dye Separation",
      description: "High-contrast synthetic organic chromophores with distinct functional group polarities.",
      compounds: [
        {
          id: "azulene",
          name: "Azulene (Nonpolar Aromatic)",
          formula: "C₁₀H₈",
          polarity: 0.12,
          mw: 128.17,
          visColor: "#2563eb",
          uv254Color: "#1e1b4b",
          uv365Color: "#60a5fa",
          iodineColor: "#78350f",
          uvActive: true,
          imfType: "π-Stacking Dispersion",
          lane: 0
        },
        {
          id: "sudanred",
          name: "Sudan IV (Diazo Dye)",
          formula: "C₂₄H₂₀N₄O",
          polarity: 0.36,
          mw: 380.44,
          visColor: "#e11d48",
          uv254Color: "#311042",
          uv365Color: "#fb7185",
          iodineColor: "#9a3412",
          uvActive: true,
          imfType: "Weak Naphthol Dipole",
          lane: 0
        },
        {
          id: "fluorescein",
          name: "Fluorescein",
          formula: "C₂₀H₁₂O₅",
          polarity: 0.61,
          mw: 332.31,
          visColor: "#eab308",
          uv254Color: "#1e1b4b",
          uv365Color: "#4ade80", // Intense neon green fluorescence
          iodineColor: "#854d0e",
          uvActive: true,
          imfType: "Phenolic + Lactone H-Bonding",
          lane: 0
        },
        {
          id: "methyleneblue",
          name: "Methylene Blue+",
          formula: "C₁₆H₁₈ClN₃S",
          polarity: 0.86,
          mw: 319.85,
          visColor: "#0284c7",
          uv254Color: "#1e1b4b",
          uv365Color: "#38bdf8",
          iodineColor: "#451a03",
          uvActive: true,
          imfType: "Ionic Thiazine Cation Electrostatic",
          lane: 0
        }
      ]
    }
  };

  // Simulation State
  let currentMixtureKey = "spinach";
  let apparatusMode = "tlc"; // "tlc" (TLC Plate + Column Side-by-Side) or "molecular" (Microscopic Silica-Solute Partitioning)
  let viewMode = "sim"; // "sim" or "photo"
  let lightMode = "visible"; // "visible", "uv254", "uv365", "iodine"
  let stationaryPhase = "silica"; // "silica" (Normal Phase Polar Si-OH) or "c18" (Reversed Phase Nonpolar C18)
  let ethylAcetatePct = 35; // 0% (Pure Hexane, P'=0.1) to 100% (Pure Ethyl Acetate, P'=4.4)
  let plateLengthMm = 80; // 80 mm Migration Path (Baseline at 10mm, Top at 90mm)
  let developmentProgress = 0.85; // 0.0 to 1.0 (start pre-developed at 85% so user immediately sees rich bands, and can re-run animated elution!)
  let isDeveloping = false;
  let selectedCompoundIndex = 2; // Default Chlorophyll a
  let caliperActive = true;
  let animId = null;
  let timeTick = 0;

  // Dynamic Rf Calculation based on Mobile Phase Eluotropic Strength & Stationary Phase Polarity
  function computeCompoundRf(compound) {
    // Eluent polarity index (0.05 for pure hexane -> 0.95 for pure ethyl acetate)
    const eluentStrength = 0.06 + (ethylAcetatePct / 100) * 0.88;
    let rawRf;

    if (stationaryPhase === "silica") {
      // Normal Phase (Polar SiO2-OH): Nonpolar compounds have high Rf; polar compounds adsorb strongly (low Rf)
      // Increasing ethyl acetate competes for Si-OH sites and pushes all spots higher
      const adsorptionAffinity = Math.pow(compound.polarity, 1.15);
      rawRf = Math.pow(eluentStrength, 0.75 * adsorptionAffinity + 0.15) * (1.02 - 0.72 * adsorptionAffinity * (1 - eluentStrength * 0.65));
    } else {
      // Reversed Phase (Nonpolar C18): Polar compounds elute fastest (high Rf); nonpolar compounds retain on C18 alkyl chains
      const hydrophobicRetention = Math.pow(1 - compound.polarity, 1.15);
      rawRf = (1 - 0.78 * hydrophobicRetention * (1 - eluentStrength * 0.5)) * (0.25 + 0.72 * compound.polarity);
    }

    return Math.max(0.04, Math.min(0.96, rawRf));
  }

  // Compute Column Retention Time t_R (min) from Rf: k' = (1 - Rf)/Rf, t_R = t_0 * (1 + k')
  function computeRetentionTime(compound) {
    const rf = computeCompoundRf(compound);
    const t0 = 1.25; // Dead time (min)
    const kPrime = (1 - rf) / Math.max(0.08, rf);
    return Math.min(14.5, t0 * (1 + kPrime * 0.85));
  }

  // Compute Resolution Rs between adjacent eluted peaks
  function computeAverageResolution() {
    const comps = SAMPLE_MIXTURES[currentMixtureKey].compounds;
    const sorted = [...comps].map(c => computeRetentionTime(c)).sort((a, b) => a - b);
    if (sorted.length < 2) return 1.5;
    let minRs = 99;
    for (let i = 1; i < sorted.length; i++) {
      const dt = sorted[i] - sorted[i - 1];
      const wAvg = 0.65; // Peak baseline width (min)
      const rs = (2 * dt) / (wAvg + wAvg);
      if (rs < minRs) minRs = rs;
    }
    return minRs;
  }

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #06b6d4; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #06b6d4; box-shadow: 0 0 10px #06b6d4;"></span>
            Thin-Layer (TLC), Flash Column &amp; HPLC Chromatography
          </span>
          <span class="badge" style="background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.35); color: #22d3ee; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            ${renderLatex("R_f = \\frac{d_{\\text{substance}}}{d_{\\text{solvent}}} \\quad \\bullet \\quad R_s = \\frac{2\\Delta t_R}{w_1 + w_2}")}
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.45); border-radius: 8px; padding: 3px; border: 1px solid rgba(56, 189, 248, 0.2);">
            <button id="view-mode-chrom-sim" class="btn btn-secondary active" style="padding: 5px 11px; font-size: 0.76rem; font-weight: 700; border-radius: 6px; border: none; background: #0284c7; color: #fff;">
              🔬 TLC &amp; Column
            </button>
            <button id="view-mode-chrom-mol" class="btn btn-secondary" style="padding: 5px 11px; font-size: 0.76rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              ⚛️ Si-OH Partition
            </button>
            <button id="view-mode-chrom-photo" class="btn btn-secondary" style="padding: 5px 11px; font-size: 0.76rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-chrom-develop" style="padding: 5px 13px; font-size: 0.76rem; font-weight: 700;">
            ▶ Run Elution
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-chrom-record" style="padding: 5px 11px; font-size: 0.76rem; border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;">
            📌 Record Trial
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-chrom-report" style="padding: 5px 11px; font-size: 0.76rem; border-color: rgba(168, 85, 247, 0.4); color: #c084fc;">
            📋 Lab Dossier
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-chrom-export" style="padding: 5px 11px; font-size: 0.76rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export CSV (E)
          </button>
        </div>
      </div>

      <!-- Main Layout Grid -->
      <div style="display: grid; grid-template-columns: 1.25fr 1fr; gap: 20px;" class="chrom-layout">
        <!-- Left Interactive 60 FPS Canvas & 4K Bench Viewport -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(6, 182, 212, 0.38); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at 50% 35%, #0c1e35 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 560px;">
          <canvas id="chrom-canvas" width="640" height="560" style="height: 560px; width: 100%; display: block; cursor: pointer;"></canvas>

          <!-- 4K Real Laboratory Photograph Overlay -->
          <div id="chromatography-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <picture>
              <source srcset="assets/labs/chromatography_bench.webp" type="image/webp">
              <img src="assets/labs/chromatography_bench.jpg" decoding="async" loading="lazy" alt="4K Thin-Layer Chromatography Chamber, Silica Flash Column &amp; UV-254nm Analytical Workbench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.96;">
            </picture>

            <div style="position: absolute; bottom: 18px; left: 18px; right: 18px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(6, 182, 212, 0.45); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.85);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Stationary Phase</div>
                <div style="color: #22d3ee; font-weight: 700; font-family: var(--font-mono); font-size: 0.88rem;">Silica Gel 60 F₂₅₄ (SiO₂·xH₂O)</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Mobile Phase Eluent</div>
                <div style="color: #fbbf24; font-weight: 700; font-family: var(--font-mono); font-size: 0.88rem;">n-Hexane : Ethyl Acetate</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Detection Optics</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.88rem;">UV 254/365 nm + HPLC Diode Array</div>
              </div>
            </div>
          </div>

          <!-- Top Telemetry HUD Overlay -->
          <div style="position: absolute; top: 12px; left: 14px; right: 14px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5; gap: 10px;">
            <div style="background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(6, 182, 212, 0.4); border-radius: 10px; padding: 7px 13px; pointer-events: auto;">
              <div style="font-size: 0.65rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">SELECTED ANALYTE TELEMETRY</div>
              <div id="hud-chrom-compound" style="font-size: 1.02rem; font-weight: 800; color: #22d3ee; font-family: var(--font-mono);">
                Chlorophyll a • Rf = 0.48
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 10px; padding: 7px 13px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.65rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">SOLVENT FRONT &amp; RESOLUTION</div>
              <div id="hud-chrom-front" style="font-size: 1.02rem; font-weight: 800; color: #10b981; font-family: var(--font-mono);">
                d_solv = 68.0 mm • Rs = 1.82
              </div>
            </div>
          </div>
        </div>

        <!-- Right Controls, UV Lamp Selector & Analytical Rf Table -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <!-- Mixture, Stationary Phase & Eluent Polarity Controls -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div style="font-size: 0.75rem; font-weight: 700; color: #06b6d4; text-transform: uppercase;">Chromatographic System Parameters</div>
              <span id="chrom-phase-badge" class="badge" style="background: rgba(6, 182, 212, 0.15); color: #22d3ee; font-size: 0.68rem; padding: 2px 8px; border-radius: 6px;">
                Normal-Phase Silica
              </span>
            </div>

            <!-- Sample Mixture Dropdown -->
            <div class="control-group" style="margin-bottom: 10px;">
              <label for="chrom-mixture-select" class="control-label" style="display: block; font-size: 0.75rem; color: #cbd5e1; font-weight: 600; margin-bottom: 4px;">
                Analyte Mixture Spotted at Origin Line:
              </label>
              <select id="chrom-mixture-select" aria-label="Select Analyte Mixture" style="width: 100%; background: #030712; color: #f8fafc; border: 1px solid #334155; border-radius: 8px; padding: 7px 10px; font-size: 0.8rem; font-weight: 600;">
                <option value="spinach">🌿 Spinach Chloroplast Pigments (Carotene, Chl a/b, Lutein)</option>
                <option value="analgesics">💊 Pharmaceutical Analgesics Panel (Ibuprofen, Aspirin, Paracetamol, Caffeine)</option>
                <option value="dyes">🎨 Forensic Ink &amp; Organic Chromophores (Azulene, Sudan IV, Fluorescein, Methylene Blue)</option>
              </select>
            </div>

            <!-- Mobile Phase Eluent Polarity Slider -->
            <div class="control-slider-group" style="margin-bottom: 10px;">
              <div class="slider-header" style="display: flex; justify-content: space-between; font-size: 0.76rem; margin-bottom: 4px;">
                <span style="color: #cbd5e1; font-weight: 600;">Mobile Phase Eluent (% Ethyl Acetate in Hexane)</span>
                <span id="val-eluent-pct" style="color: #fbbf24; font-family: var(--font-mono); font-weight: 700;">35% EtOAc : 65% Hexane (P' = 1.61)</span>
              </div>
              <input type="range" id="slider-eluent-pct" min="0" max="100" step="5" value="35" style="width: 100%; accent-color: #06b6d4;">
              <div style="display: flex; justify-content: space-between; font-size: 0.66rem; color: #64748b; margin-top: 2px;">
                <span>0% (Pure Nonpolar Hexane)</span>
                <span>50% (Medium Polarity)</span>
                <span>100% (Polar Ethyl Acetate)</span>
              </div>
            </div>

            <!-- Stationary Phase & Visualization Lamp Mode Row -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div>
                <div style="font-size: 0.7rem; color: #94a3b8; font-weight: 600; margin-bottom: 4px;">Stationary Phase Bed:</div>
                <div style="display: flex; gap: 4px;">
                  <button id="btn-phase-silica" class="btn btn-secondary active" style="flex: 1; padding: 5px 6px; font-size: 0.72rem; font-weight: 700; background: rgba(6, 182, 212, 0.25); border-color: #06b6d4; color: #fff;">
                    Polar SiO₂
                  </button>
                  <button id="btn-phase-c18" class="btn btn-secondary" style="flex: 1; padding: 5px 6px; font-size: 0.72rem; font-weight: 600;">
                    Nonpolar C₁₈
                  </button>
                </div>
              </div>

              <div>
                <div style="font-size: 0.7rem; color: #94a3b8; font-weight: 600; margin-bottom: 4px;">Detection / Illumination:</div>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 3px;">
                  <button id="btn-light-vis" class="btn btn-secondary active" title="Visible White Light" style="padding: 5px 4px; font-size: 0.68rem; font-weight: 700; background: rgba(56, 189, 248, 0.25); border-color: #38bdf8; color: #fff;">Vis</button>
                  <button id="btn-light-uv254" class="btn btn-secondary" title="Shortwave UV-254nm Fluorescence Quenching (F254 Phosphor)" style="padding: 5px 4px; font-size: 0.68rem; font-weight: 600;">254nm</button>
                  <button id="btn-light-uv365" class="btn btn-secondary" title="Longwave UV-365nm Fluorescence Excitation" style="padding: 5px 4px; font-size: 0.68rem; font-weight: 600;">365nm</button>
                  <button id="btn-light-iodine" class="btn btn-secondary" title="Sublimed Iodine (I₂) Vapor Staining" style="padding: 5px 4px; font-size: 0.68rem; font-weight: 600;">I₂ Stain</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Analytical Rf & Retention Time Telemetry Table -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px 16px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #10b981; text-transform: uppercase;">Quantitative Rf &amp; Column Elution Table</div>
                <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; font-size: 0.68rem; padding: 2px 8px; border-radius: 6px;">
                  Click Row or Spot to Measure
                </span>
              </div>

              <div style="background: #030712; border: 1px solid #1e293b; border-radius: 8px; overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.72rem; text-align: left;">
                  <thead>
                    <tr style="background: rgba(15, 23, 42, 0.85); border-bottom: 1px solid #334155; color: #94a3b8;">
                      <th style="padding: 6px 8px;">Analyte Band</th>
                      <th style="padding: 6px 6px;">d_spot (mm)</th>
                      <th style="padding: 6px 6px;">Rf Value</th>
                      <th style="padding: 6px 6px;">Column t_R</th>
                      <th style="padding: 6px 8px;">Dominant IMF</th>
                    </tr>
                  </thead>
                  <tbody id="chrom-table-body">
                    <!-- Populated dynamically -->
                  </tbody>
                </table>
              </div>
            </div>

            <div id="chrom-chemical-insight" style="margin-top: 10px; font-size: 0.73rem; color: #cbd5e1; line-height: 1.42; background: rgba(6, 182, 212, 0.08); border-left: 3px solid #06b6d4; border-radius: 6px; padding: 8px 12px;">
              <!-- Dynamic molecular partitioning explanation -->
            </div>
          </div>
        </div>
      </div>

      <!-- Post-Lab Competency Checkpoint Container -->
      <div id="chrom-checkpoint-container" style="margin-top: 24px; width: 100%;"></div>
    </div>
  `;

  // Mount Post-Lab Competency Checkpoint
  mountLabCheckpoint("chrom-checkpoint-container", "chromatography");

  // DOM References
  const canvas = document.getElementById("chrom-canvas");
  const ctx = canvas.getContext("2d");

  const logicalW = 640;
  const logicalH = 560;
  function setupHiDPICanvas() {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : Math.min(window.devicePixelRatio || 1, 2);
    if (canvas) {
      canvas.width = Math.round(logicalW * dpr);
      canvas.height = Math.round(logicalH * dpr);
    }
  }
  setupHiDPICanvas();
  window.addEventListener("resize", setupHiDPICanvas);

  const viewSimBtn = document.getElementById("view-mode-chrom-sim");
  const viewMolBtn = document.getElementById("view-mode-chrom-mol");
  const viewPhotoBtn = document.getElementById("view-mode-chrom-photo");
  const photoOverlay = document.getElementById("chromatography-photo-overlay");

  const btnDevelop = document.getElementById("btn-chrom-develop");
  const btnRecord = document.getElementById("btn-chrom-record");
  const btnReport = document.getElementById("btn-chrom-report");
  const btnExport = document.getElementById("btn-chrom-export");

  const mixtureSelect = document.getElementById("chrom-mixture-select");
  const sliderEluent = document.getElementById("slider-eluent-pct");
  const valEluentPct = document.getElementById("val-eluent-pct");
  const phaseBadge = document.getElementById("chrom-phase-badge");

  const btnPhaseSilica = document.getElementById("btn-phase-silica");
  const btnPhaseC18 = document.getElementById("btn-phase-c18");

  const btnLightVis = document.getElementById("btn-light-vis");
  const btnLightUv254 = document.getElementById("btn-light-uv254");
  const btnLightUv365 = document.getElementById("btn-light-uv365");
  const btnLightIodine = document.getElementById("btn-light-iodine");

  const hudCompound = document.getElementById("hud-chrom-compound");
  const hudFront = document.getElementById("hud-chrom-front");
  const tableBody = document.getElementById("chrom-table-body");
  const insightBox = document.getElementById("chrom-chemical-insight");

  function getSpotColor(comp) {
    if (lightMode === "uv254") return comp.uv254Color;
    if (lightMode === "uv365") return comp.uv365Color;
    if (lightMode === "iodine") return comp.iodineColor;
    return comp.visColor;
  }

  function updateHUD() {
    const mixture = SAMPLE_MIXTURES[currentMixtureKey];
    const comps = mixture.compounds;
    if (selectedCompoundIndex >= comps.length) selectedCompoundIndex = 0;

    // Snyder Polarity Index P' of Hexane (0.1) + Ethyl Acetate (4.4)
    const pPrime = (0.1 * (100 - ethylAcetatePct) + 4.4 * ethylAcetatePct) / 100;
    valEluentPct.textContent = `${ethylAcetatePct}% EtOAc : ${100 - ethylAcetatePct}% Hexane (P' = ${pPrime.toFixed(2)})`;

    phaseBadge.textContent = stationaryPhase === "silica" ? "Normal-Phase Polar SiO₂" : "Reversed-Phase Nonpolar C₁₈";
    phaseBadge.style.color = stationaryPhase === "silica" ? "#22d3ee" : "#fbbf24";

    const dSolventMm = plateLengthMm * developmentProgress;
    const selComp = comps[selectedCompoundIndex];
    const selRf = computeCompoundRf(selComp);
    const selDistMm = dSolventMm * selRf;
    const rs = computeAverageResolution();

    hudCompound.textContent = `${selComp.name} • Rf = ${selRf.toFixed(2)} (${selDistMm.toFixed(1)} mm)`;
    hudFront.textContent = `d_solv = ${dSolventMm.toFixed(1)} mm • Rs = ${rs.toFixed(2)}`;

    // Populate Table sorted from highest Rf to lowest Rf
    tableBody.innerHTML = comps.map((c, idx) => {
      const rf = computeCompoundRf(c);
      const dSpot = dSolventMm * rf;
      const tR = computeRetentionTime(c);
      const isSel = idx === selectedCompoundIndex;
      const dotColor = c.visColor.startsWith("rgba") ? "#a855f7" : c.visColor;

      return `
        <tr data-cidx="${idx}" style="border-bottom: 1px solid #1e293b; background: ${isSel ? 'rgba(6, 182, 212, 0.16)' : 'transparent'}; cursor: pointer; transition: background 0.15s;">
          <td style="padding: 6px 8px; font-weight: 700; color: #f8fafc; display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 9px; height: 9px; border-radius: 50%; background: ${dotColor}; border: 1px solid rgba(255,255,255,0.4);"></span>
            <span>${c.name}</span>
          </td>
          <td style="padding: 6px 6px; color: #cbd5e1; font-family: var(--font-mono);">${dSpot.toFixed(1)}</td>
          <td style="padding: 6px 6px; color: #22d3ee; font-family: var(--font-mono); font-weight: 800;">${rf.toFixed(3)}</td>
          <td style="padding: 6px 6px; color: #fbbf24; font-family: var(--font-mono);">${tR.toFixed(2)} min</td>
          <td style="padding: 6px 8px; color: #94a3b8; font-size: 0.68rem;">${c.imfType}</td>
        </tr>
      `;
    }).join("");

    tableBody.querySelectorAll("tr[data-cidx]").forEach(row => {
      row.addEventListener("click", () => {
        selectedCompoundIndex = parseInt(row.dataset.cidx, 10);
        SoundFX.click?.() || SoundFX.playClick?.();
        updateHUD();
      });
    });

    const phaseMechanism = stationaryPhase === "silica"
      ? `On <strong>Normal-Phase Polar Silica ($\text{Si-OH}$)</strong>, <strong>${selComp.name}</strong> (${selComp.formula}) exhibits ${selComp.polarity > 0.5 ? 'strong hydrogen-bonding/dipole adsorption to silanol groups, slowing migration' : 'weak dispersion interactions with polar silanol groups, partitioning rapidly into the mobile phase'} ($R_f = ${selRf.toFixed(2)}$, $t_R = ${computeRetentionTime(selComp).toFixed(2)}\text{ min}$).`
      : `On <strong>Reversed-Phase Nonpolar $\text{C}_{18}$</strong>, elution order inverts: <strong>${selComp.name}</strong> experiences ${selComp.polarity < 0.5 ? 'strong hydrophobic van der Waals retention with octadecyl chains' : 'minimal hydrophobic retention, eluting rapidly with the polar mobile phase'} ($R_f = ${selRf.toFixed(2)}$).`;

    insightBox.innerHTML = formatMathText(phaseMechanism);
  }

  // Canvas Click / Drag Hit Detection for TLC Spots
  function handleCanvasPoint(clientX, clientY) {
    if (viewMode !== "sim") return;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (logicalW / rect.width);
    const y = (clientY - rect.top) * (logicalH / rect.height);

    // Check if user clicked near a spot on the TLC plate (x: 55..275, y: 115..455)
    const baselineY = 435;
    const maxMigrationPx = 280;
    const frontPx = maxMigrationPx * developmentProgress;
    const comps = SAMPLE_MIXTURES[currentMixtureKey].compounds;

    let bestIdx = -1;
    let bestDist = 42;
    comps.forEach((c, idx) => {
      const rf = computeCompoundRf(c);
      const spotY = baselineY - frontPx * rf;
      const dist = Math.abs(y - spotY);
      if (x >= 45 && x <= 300 && dist < bestDist) {
        bestDist = dist;
        bestIdx = idx;
      }
    });

    if (bestIdx !== -1) {
      selectedCompoundIndex = bestIdx;
      SoundFX.click?.() || SoundFX.playClick?.();
      updateHUD();
    }
  }

  canvas.addEventListener("pointerdown", (e) => {
    handleCanvasPoint(e.clientX, e.clientY);
  });

  // 60 FPS Canvas Rendering Engine
  function renderChromatographyCanvas() {
    if (!container || !container.isConnected) return;
    timeTick += 0.035;

    if (isDeveloping) {
      // Lucas-Washburn capillary rise velocity slows down as z_f increases
      const step = Math.max(0.0025, 0.0085 * (1.15 - developmentProgress));
      developmentProgress = Math.min(1.0, developmentProgress + step);
      if (developmentProgress >= 1.0) {
        isDeveloping = false;
        btnDevelop.textContent = "↻ Re-Run Elution";
        SoundFX.success?.() || SoundFX.playBeep?.();
      }
      updateHUD();
    }

    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : Math.min(window.devicePixelRatio || 1, 2);
    ctx.save();
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, logicalW, logicalH);

    // Lab Bench Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, logicalH);
    bgGrad.addColorStop(0, "#091526");
    bgGrad.addColorStop(1, "#030712");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, logicalW, logicalH);

    // Subtle Blueprint Grid
    ctx.strokeStyle = "rgba(6, 182, 212, 0.04)";
    ctx.lineWidth = 1;
    for (let gx = 20; gx < logicalW; gx += 35) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, logicalH);
      ctx.stroke();
    }
    for (let gy = 20; gy < logicalH; gy += 35) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(logicalW, gy);
      ctx.stroke();
    }

    if (apparatusMode === "molecular") {
      renderMolecularPartitionView(ctx);
    } else {
      renderTlcAndColumnApparatus(ctx);
    }

    ctx.restore();
    animId = requestAnimationFrame(renderChromatographyCanvas);
  }

  function renderTlcAndColumnApparatus(ctx) {
    const mixture = SAMPLE_MIXTURES[currentMixtureKey];
    const comps = mixture.compounds;

    // =========================================================================
    // 1. LEFT SIDE: BOROSILICATE GLASS TLC DEVELOPING CHAMBER & SILICA PLATE
    // =========================================================================
    const chamberX = 36;
    const chamberY = 92;
    const chamberW = 240;
    const chamberH = 408;

    // UV Ambient Glow if UV-254 or UV-365 active
    if (lightMode === "uv254" || lightMode === "uv365") {
      const uvGlow = ctx.createRadialGradient(chamberX + chamberW / 2, chamberY + chamberH / 2, 20, chamberX + chamberW / 2, chamberY + chamberH / 2, 210);
      uvGlow.addColorStop(0, lightMode === "uv254" ? "rgba(74, 222, 128, 0.16)" : "rgba(168, 85, 247, 0.22)");
      uvGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = uvGlow;
      ctx.fillRect(0, 50, 320, 490);
    }

    // Chamber Ground-Glass Watch Glass Lid
    ctx.fillStyle = "rgba(148, 163, 184, 0.22)";
    ctx.strokeStyle = "rgba(226, 232, 240, 0.65)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(chamberX - 10, chamberY - 12, chamberW + 20, 12, 5);
    ctx.fill();
    ctx.stroke();
    // Lid Knob
    ctx.beginPath();
    ctx.arc(chamberX + chamberW / 2, chamberY - 18, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Borosilicate Developing Jar Body
    ctx.fillStyle = lightMode === "iodine" ? "rgba(180, 83, 9, 0.16)" : "rgba(15, 23, 42, 0.55)";
    ctx.strokeStyle = "rgba(148, 163, 184, 0.6)";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(chamberX, chamberY, chamberW, chamberH, 8);
    ctx.fill();
    ctx.stroke();

    // Developing Solvent Pool at Bottom of Chamber (below baseline!)
    const poolTopY = 456;
    const poolH = chamberY + chamberH - poolTopY - 3;
    const poolGrad = ctx.createLinearGradient(0, poolTopY, 0, poolTopY + poolH);
    poolGrad.addColorStop(0, "rgba(56, 189, 248, 0.35)");
    poolGrad.addColorStop(1, "rgba(6, 182, 212, 0.55)");
    ctx.fillStyle = poolGrad;
    ctx.fillRect(chamberX + 3, poolTopY, chamberW - 6, poolH);

    // Meniscus line on solvent pool
    ctx.strokeStyle = "rgba(186, 230, 253, 0.8)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(chamberX + 3, poolTopY);
    ctx.lineTo(chamberX + chamberW - 3, poolTopY);
    ctx.stroke();

    // TLC Silica Plate inside Chamber
    const plateX = chamberX + 34;
    const plateY = 116;
    const plateW = 172;
    const plateH = 368;

    // Plate Color depends on Illumination Mode
    if (lightMode === "uv254") {
      // Green F254 zinc silicate phosphor emission
      const uvPlateGrad = ctx.createLinearGradient(plateX, plateY, plateX + plateW, plateY + plateH);
      uvPlateGrad.addColorStop(0, "#4ade80");
      uvPlateGrad.addColorStop(1, "#22c55e");
      ctx.fillStyle = uvPlateGrad;
    } else if (lightMode === "uv365") {
      ctx.fillStyle = "#1e1b4b"; // Dark violet background for longwave fluorescence
    } else if (lightMode === "iodine") {
      ctx.fillStyle = "#fef3c7"; // Warm amber-tinted silica plate in I2 vapor
    } else {
      ctx.fillStyle = stationaryPhase === "silica" ? "#f8fafc" : "#e2e8f0";
    }

    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(plateX, plateY, plateW, plateH, 3);
    ctx.fill();
    ctx.stroke();

    // Wetted Capillary Solvent Front Region on Plate
    const baselineY = 435; // Origin line (z = 0 mm)
    const maxMigrationPx = 280; // 80 mm scale = 280 px (3.5 px / mm)
    const currentFrontPx = maxMigrationPx * developmentProgress;
    const solventFrontY = baselineY - currentFrontPx;

    if (lightMode === "visible") {
      ctx.fillStyle = "rgba(148, 163, 184, 0.16)";
      ctx.fillRect(plateX + 1, solventFrontY, plateW - 2, plateY + plateH - solventFrontY - 1);
    }

    // Solvent Front Dashed Line
    ctx.save();
    ctx.strokeStyle = lightMode === "uv254" ? "#064e3b" : "#0284c7";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(plateX + 6, solventFrontY);
    ctx.lineTo(plateX + plateW - 6, solventFrontY);
    ctx.stroke();
    ctx.restore();

    // Solvent Front Label
    ctx.fillStyle = lightMode === "uv254" ? "#064e3b" : (lightMode === "uv365" ? "#38bdf8" : "#0369a1");
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText(`Solvent Front (${(plateLengthMm * developmentProgress).toFixed(1)}mm)`, plateX + plateW - 6, solventFrontY - 5);

    // Pencil Origin Baseline (z = 0 mm)
    ctx.strokeStyle = lightMode === "uv365" ? "#94a3b8" : "#475569";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(plateX + 8, baselineY);
    ctx.lineTo(plateX + plateW - 8, baselineY);
    ctx.stroke();

    ctx.fillStyle = lightMode === "uv365" ? "#cbd5e1" : "#475569";
    ctx.font = "bold 8.5px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText("Origin (0.0 mm)", plateX + 8, baselineY + 12);

    // Two Lanes on the TLC Plate:
    // Lane 1 (Left): Complete Mixture Co-Spot
    // Lane 2 (Right): Selected Pure Reference Standard
    const lane1X = plateX + 52;
    const lane2X = plateX + 124;

    ctx.fillStyle = lightMode === "uv365" ? "#94a3b8" : "#334155";
    ctx.font = "bold 8.5px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Mixture", lane1X, plateY + 14);
    ctx.fillText("Ref Std", lane2X, plateY + 14);

    // Origin tick marks
    ctx.beginPath();
    ctx.arc(lane1X, baselineY, 2.2, 0, Math.PI * 2);
    ctx.arc(lane2X, baselineY, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Draw Eluted Analyte Spots in Lane 1 (All Compounds) & Lane 2 (Selected Reference)
    comps.forEach((comp, idx) => {
      const rf = computeCompoundRf(comp);
      const spotY = baselineY - currentFrontPx * rf;
      const color = getSpotColor(comp);
      const isSelected = idx === selectedCompoundIndex;

      // Spot diffusion broadening increases slightly with migration distance
      const rX = 13 + developmentProgress * 4;
      const rY = 6.5 + developmentProgress * 2.5;

      // Draw Spot in Lane 1 (Mixture)
      ctx.save();
      if (lightMode === "uv365") {
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
      }
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(lane1X, spotY, rX, rY, 0, 0, Math.PI * 2);
      ctx.fill();

      // If Selected Compound, also draw in Lane 2 (Reference Standard) & highlight caliper
      if (isSelected) {
        ctx.beginPath();
        ctx.ellipse(lane2X, spotY, rX * 0.9, rY * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Selection Reticle & Digital Caliper Line from Origin to Spot Center
        ctx.save();
        ctx.strokeStyle = lightMode === "uv254" ? "#1e1b4b" : "#06b6d4";
        ctx.lineWidth = 1.6;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(lane1X - 18, spotY);
        ctx.lineTo(plateX + plateW + 24, spotY);
        ctx.stroke();
        ctx.restore();

        // Spot Tag Callout
        ctx.save();
        ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
        ctx.strokeStyle = "#22d3ee";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(lane2X - 24, spotY - 22, 54, 15, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#22d3ee";
        ctx.font = "bold 8.5px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText(`Rf=${rf.toFixed(2)}`, lane2X + 3, spotY - 12);
        ctx.restore();
      } else {
        ctx.restore();
      }
    });

    // External Vernier Metric Ruler on Right Edge of TLC Chamber (0 to 80 mm)
    const rulerX = chamberX + chamberW + 8;
    ctx.fillStyle = "rgba(30, 41, 59, 0.85)";
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1;
    ctx.fillRect(rulerX, baselineY - maxMigrationPx - 8, 22, maxMigrationPx + 16);
    ctx.strokeRect(rulerX, baselineY - maxMigrationPx - 8, 22, maxMigrationPx + 16);

    ctx.fillStyle = "#cbd5e1";
    ctx.strokeStyle = "#94a3b8";
    ctx.font = "8px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    for (let mm = 0; mm <= 80; mm += 10) {
      const ry = baselineY - (mm / 80) * maxMigrationPx;
      ctx.beginPath();
      ctx.moveTo(rulerX, ry);
      ctx.lineTo(rulerX + 6, ry);
      ctx.stroke();
      ctx.fillText(`${mm}`, rulerX + 7, ry + 3);
    }

    // Chamber Label
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SILICA TLC CHAMBER & METRIC CALIPER", chamberX + chamberW / 2, chamberY + chamberH + 20);

    // =========================================================================
    // 2. TOP RIGHT: FLASH COLUMN CHROMATOGRAPHY (PRESSURIZED SILICA COLUMN)
    // =========================================================================
    const colX = 352;
    const colY = 88;
    const colW = 54;
    const colH = 215;

    // Column Retort Clamp
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(colX + colW, colY + 60);
    ctx.lineTo(colX + colW + 25, colY + 60);
    ctx.stroke();

    // Packed Silica Bed inside Glass Column
    ctx.fillStyle = stationaryPhase === "silica" ? "#f1f5f9" : "#cbd5e1";
    ctx.fillRect(colX + 4, colY + 25, colW - 8, colH - 45);

    // Solvent Reservoir Head at Top of Column
    ctx.fillStyle = "rgba(56, 189, 248, 0.32)";
    ctx.fillRect(colX + 4, colY + 6, colW - 8, 19);

    // Descending Coloured Analyte Bands inside Flash Column
    // High-Rf compounds migrate faster DOWN the gravity/flash column!
    const bedTop = colY + 28;
    const bedHeight = colH - 52;
    comps.forEach((comp, idx) => {
      const rf = computeCompoundRf(comp);
      const bandProgress = Math.min(0.96, developmentProgress * rf * 1.05);
      const bandY = bedTop + bandProgress * bedHeight;
      const bandColor = comp.visColor.startsWith("rgba") ? "rgba(168, 85, 247, 0.65)" : comp.visColor;

      ctx.fillStyle = bandColor;
      ctx.fillRect(colX + 5, bandY - 5, colW - 10, 10);

      if (idx === selectedCompoundIndex) {
        ctx.strokeStyle = "#22d3ee";
        ctx.lineWidth = 1.8;
        ctx.strokeRect(colX + 3, bandY - 6, colW - 6, 12);
      }
    });

    // Glass Column Outer Walls & Tapered Fritted Tip
    ctx.strokeStyle = "rgba(226, 232, 240, 0.75)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(colX, colY);
    ctx.lineTo(colX, colY + colH - 20);
    ctx.lineTo(colX + colW / 2 - 4, colY + colH + 12);
    ctx.lineTo(colX + colW / 2 + 4, colY + colH + 12);
    ctx.lineTo(colX + colW, colY + colH - 20);
    ctx.lineTo(colX + colW, colY);
    ctx.stroke();

    // PTFE Stopcock Valve
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(colX + colW / 2 - 14, colY + colH - 6, 28, 6);

    // Animated Eluting Droplet falling into Fraction Collector Tube
    const dropY = colY + colH + 16 + ((timeTick * 40) % 24);
    const fastestComp = [...comps].sort((a, b) => computeCompoundRf(b) - computeCompoundRf(a))[0];
    ctx.fillStyle = fastestComp.visColor.startsWith("rgba") ? "#38bdf8" : fastestComp.visColor;
    ctx.beginPath();
    ctx.arc(colX + colW / 2, dropY, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // Collection Tube Below Column
    const tubeX = colX + colW / 2 - 10;
    const tubeY = colY + colH + 42;
    ctx.fillStyle = "rgba(56, 189, 248, 0.25)";
    ctx.fillRect(tubeX + 2, tubeY + 14, 16, 20);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(tubeX, tubeY, 20, 35);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("FLASH COLUMN", colX + colW / 2, colY - 8);

    // =========================================================================
    // 3. RIGHT PANEL: LIVE UV-VIS HPLC ELUTION CHROMATOGRAM (mAU vs t_R min)
    // =========================================================================
    const graphX = 435;
    const graphY = 92;
    const graphW = 185;
    const graphH = 220;

    ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
    ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(graphX, graphY, graphW, graphH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 9.5px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText("UV DETECTOR CHROMATOGRAM", graphX + 10, graphY + 16);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "8px 'JetBrains Mono', monospace";
    ctx.fillText("Absorbance (mAU) vs Retention t_R (min)", graphX + 10, graphY + 28);

    // Plot Area Axes
    const plotX = graphX + 24;
    const plotY = graphY + 42;
    const plotW = graphW - 34;
    const plotH = graphH - 66;

    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(plotX, plotY);
    ctx.lineTo(plotX, plotY + plotH);
    ctx.lineTo(plotX + plotW, plotY + plotH);
    ctx.stroke();

    // Plot Gaussian Elution Peaks for all compounds in mixture
    const maxTimeMin = 12.0;
    ctx.save();
    ctx.beginPath();
    for (let px = 0; px <= plotW; px += 2) {
      const t = (px / plotW) * maxTimeMin;
      let totalSignal = 0;
      comps.forEach((comp, idx) => {
        const tR = computeRetentionTime(comp);
        const sigma = 0.22 + (tR * 0.018); // Peak broadening over retention time
        const height = idx === selectedCompoundIndex ? 0.88 : 0.65;
        totalSignal += height * Math.exp(-Math.pow(t - tR, 2) / (2 * sigma * sigma));
      });
      const py = plotY + plotH - Math.min(plotH - 4, totalSignal * (plotH - 12));
      if (px === 0) ctx.moveTo(plotX + px, py);
      else ctx.lineTo(plotX + px, py);
    }
    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Highlight Peak Apex Markers
    comps.forEach((comp, idx) => {
      const tR = computeRetentionTime(comp);
      const px = plotX + Math.min(plotW, (tR / maxTimeMin) * plotW);
      const isSel = idx === selectedCompoundIndex;
      const dotCol = comp.visColor.startsWith("rgba") ? "#c084fc" : comp.visColor;

      ctx.fillStyle = dotCol;
      ctx.beginPath();
      ctx.arc(px, plotY + plotH - (isSel ? 0.88 : 0.65) * (plotH - 12), isSel ? 4.5 : 3, 0, Math.PI * 2);
      ctx.fill();

      if (isSel) {
        ctx.fillStyle = "#facc15";
        ctx.font = "bold 8px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText(`${tR.toFixed(1)}m`, px, plotY + plotH - 0.88 * (plotH - 12) - 7);
      }
    });

    // X-Axis Time Ticks (0, 4, 8, 12 min)
    ctx.fillStyle = "#94a3b8";
    ctx.font = "8px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    for (let tm = 0; tm <= 12; tm += 4) {
      const tx = plotX + (tm / 12) * plotW;
      ctx.fillText(`${tm}m`, tx, plotY + plotH + 12);
    }

    // =========================================================================
    // 4. BOTTOM RIGHT: ANALYTE POLARITY & SILICA ADSORPTION SUMMARY CARD
    // =========================================================================
    const cardX = 342;
    const cardY = 348;
    const cardW = 278;
    const cardH = 152;

    ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
    ctx.strokeStyle = "rgba(16, 185, 129, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 8);
    ctx.fill();
    ctx.stroke();

    const selComp = comps[selectedCompoundIndex];
    const selRf = computeCompoundRf(selComp);
    const selTr = computeRetentionTime(selComp);
    const kFactor = ((1 - selRf) / Math.max(0.05, selRf)).toFixed(2);

    ctx.fillStyle = "#10b981";
    ctx.font = "bold 10px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText(`SELECTED: ${selComp.name.toUpperCase()}`, cardX + 12, cardY + 20);

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "9.5px 'JetBrains Mono', monospace";
    ctx.fillText(`Formula: ${selComp.formula} • MW: ${selComp.mw} g/mol`, cardX + 12, cardY + 38);
    ctx.fillText(`Retention Factor (Rf): ${selRf.toFixed(3)}`, cardX + 12, cardY + 56);
    ctx.fillText(`Capacity Factor (k'):  ${kFactor}   (t_R = ${selTr.toFixed(2)} min)`, cardX + 12, cardY + 74);
    ctx.fillText(`Intermolecular Force:  ${selComp.imfType}`, cardX + 12, cardY + 92);

    // Polarity Bar Gauge
    ctx.fillStyle = "#94a3b8";
    ctx.font = "8.5px sans-serif";
    ctx.fillText("Relative Solute Polarity Index:", cardX + 12, cardY + 114);

    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.roundRect(cardX + 12, cardY + 122, cardW - 24, 10, 5);
    ctx.fill();

    const polGrad = ctx.createLinearGradient(cardX + 12, 0, cardX + cardW - 12, 0);
    polGrad.addColorStop(0, "#f97316");
    polGrad.addColorStop(0.5, "#10b981");
    polGrad.addColorStop(1, "#38bdf8");
    ctx.fillStyle = polGrad;
    ctx.beginPath();
    ctx.roundRect(cardX + 12, cardY + 122, (cardW - 24) * selComp.polarity, 10, 5);
    ctx.fill();
  }

  // Microscopic Molecular Partition View (Si-OH Hydrogen Bonding vs Mobile Phase Solvation)
  function renderMolecularPartitionView(ctx) {
    const comps = SAMPLE_MIXTURES[currentMixtureKey].compounds;
    const selComp = comps[selectedCompoundIndex];
    const selRf = computeCompoundRf(selComp);

    // Left Surface: Stationary Phase Silica Surface with Silanol (-Si-OH) Groups
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(40, 80, 120, 420);
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 80, 120, 420);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(stationaryPhase === "silica" ? "SILICA (SiO₂)" : "C₁₈ ALKYL", 100, 108);
    ctx.font = "9px monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("Stationary Phase", 100, 124);

    // Draw Surface Functional Groups (-Si-OH or -C18H37)
    for (let sy = 155; sy <= 465; sy += 52) {
      ctx.strokeStyle = stationaryPhase === "silica" ? "#22d3ee" : "#fbbf24";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(160, sy);
      ctx.lineTo(205, sy);
      ctx.stroke();

      ctx.fillStyle = stationaryPhase === "silica" ? "#0284c7" : "#d97706";
      ctx.beginPath();
      ctx.arc(215, sy, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#fff";
      ctx.font = "bold 9px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(stationaryPhase === "silica" ? "-OH" : "-C₁₈", 215, sy + 3);
    }

    // Animated Solute Molecules Partitioning between Stationary Surface and Flowing Mobile Phase
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(`DYNAMIC PARTITION EQUILIBRIUM: Kd = [Cs] / [Cm]  (Rf = ${selRf.toFixed(2)})`, 410, 102);

    for (let i = 0; i < 6; i++) {
      const baseY = 155 + i * 52;
      // Fraction of time spent bound to surface vs drifting in mobile phase
      const boundFraction = 1 - selRf;
      const osc = Math.sin(timeTick * 2.2 + i * 1.1);
      const isAdsorbed = osc < (boundFraction * 2 - 1);

      const molX = isAdsorbed ? 252 : 340 + ((timeTick * 55 + i * 40) % 210);
      const molY = isAdsorbed ? baseY : baseY - ((timeTick * 30 + i * 20) % 35);

      // Draw Hydrogen Bond / Dipole Tether when Adsorbed
      if (isAdsorbed) {
        ctx.save();
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(230, baseY);
        ctx.lineTo(molX - 14, molY);
        ctx.stroke();
        ctx.restore();
      }

      // Analyte Molecule Sphere
      ctx.fillStyle = selComp.visColor.startsWith("rgba") ? "#a855f7" : selComp.visColor;
      ctx.beginPath();
      ctx.arc(molX, molY, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#fff";
      ctx.font = "bold 8px monospace";
      ctx.fillText(selComp.name.slice(0, 6), molX, molY + 3);
    }
  }

  // Event Listeners
  btnDevelop.addEventListener("click", () => {
    developmentProgress = 0.02;
    isDeveloping = true;
    btnDevelop.textContent = "⏳ Developing...";
    SoundFX.droplet?.() || SoundFX.playClick?.();
    updateHUD();
  });

  mixtureSelect.addEventListener("change", (e) => {
    currentMixtureKey = e.target.value;
    selectedCompoundIndex = 0;
    SoundFX.click?.() || SoundFX.playClick?.();
    updateHUD();
  });

  sliderEluent.addEventListener("input", (e) => {
    ethylAcetatePct = parseInt(e.target.value, 10);
    updateHUD();
  });

  btnPhaseSilica.addEventListener("click", () => {
    stationaryPhase = "silica";
    btnPhaseSilica.classList.add("active");
    btnPhaseC18.classList.remove("active");
    btnPhaseSilica.style.background = "rgba(6, 182, 212, 0.25)";
    btnPhaseSilica.style.borderColor = "#06b6d4";
    btnPhaseC18.style.background = "transparent";
    btnPhaseC18.style.borderColor = "";
    SoundFX.click?.() || SoundFX.playClick?.();
    updateHUD();
  });

  btnPhaseC18.addEventListener("click", () => {
    stationaryPhase = "c18";
    btnPhaseC18.classList.add("active");
    btnPhaseSilica.classList.remove("active");
    btnPhaseC18.style.background = "rgba(245, 158, 11, 0.25)";
    btnPhaseC18.style.borderColor = "#f59e0b";
    btnPhaseSilica.style.background = "transparent";
    btnPhaseSilica.style.borderColor = "";
    SoundFX.click?.() || SoundFX.playClick?.();
    updateHUD();
  });

  function setLightMode(mode, activeBtn) {
    lightMode = mode;
    [btnLightVis, btnLightUv254, btnLightUv365, btnLightIodine].forEach(b => {
      b.classList.remove("active");
      b.style.background = "transparent";
      b.style.borderColor = "";
    });
    activeBtn.classList.add("active");
    activeBtn.style.background = "rgba(56, 189, 248, 0.25)";
    activeBtn.style.borderColor = "#38bdf8";
    SoundFX.click?.() || SoundFX.playClick?.();
    updateHUD();
  }

  btnLightVis.addEventListener("click", () => setLightMode("visible", btnLightVis));
  btnLightUv254.addEventListener("click", () => setLightMode("uv254", btnLightUv254));
  btnLightUv365.addEventListener("click", () => setLightMode("uv365", btnLightUv365));
  btnLightIodine.addEventListener("click", () => setLightMode("iodine", btnLightIodine));

  // View Switcher (TLC & Column Sim vs Molecular Partition vs 4K Real Bench)
  function updateViewButtons(activeBtn) {
    [viewSimBtn, viewMolBtn, viewPhotoBtn].forEach(b => {
      b.classList.remove("active");
      b.style.background = "transparent";
    });
    activeBtn.classList.add("active");
    activeBtn.style.background = "#0284c7";
  }

  viewSimBtn.addEventListener("click", () => {
    viewMode = "sim";
    apparatusMode = "tlc";
    updateViewButtons(viewSimBtn);
    photoOverlay.style.display = "none";
    canvas.style.display = "block";
    SoundFX.click?.() || SoundFX.playClick?.();
  });

  viewMolBtn.addEventListener("click", () => {
    viewMode = "sim";
    apparatusMode = "molecular";
    updateViewButtons(viewMolBtn);
    photoOverlay.style.display = "none";
    canvas.style.display = "block";
    SoundFX.click?.() || SoundFX.playClick?.();
  });

  viewPhotoBtn.addEventListener("click", () => {
    viewMode = "photo";
    updateViewButtons(viewPhotoBtn);
    photoOverlay.style.display = "block";
    canvas.style.display = "none";
    SoundFX.click?.() || SoundFX.playClick?.();
  });

  // Record Trial to LabTrialStore
  btnRecord.addEventListener("click", () => {
    const mixture = SAMPLE_MIXTURES[currentMixtureKey];
    const selComp = mixture.compounds[selectedCompoundIndex];
    const rf = computeCompoundRf(selComp);
    const tR = computeRetentionTime(selComp);
    LabTrialStore.addTrial("chromatography", {
      Mixture: mixture.name,
      Analyte: selComp.name,
      "Eluent (% EtOAc)": `${ethylAcetatePct}%`,
      "Stationary Phase": stationaryPhase === "silica" ? "Silica SiO2" : "Reversed C18",
      "Rf Value": rf.toFixed(3),
      "Column t_R (min)": tR.toFixed(2)
    });
    SoundFX.success?.() || SoundFX.playBeep?.();
  });

  // Open Official Lab Report Modal
  btnReport.addEventListener("click", () => {
    const mixture = SAMPLE_MIXTURES[currentMixtureKey];
    const dSolventMm = plateLengthMm * developmentProgress;
    openLabReportModal({
      title: "Thin-Layer (TLC) & Column Chromatography Separation",
      subject: "Chemistry",
      inquiryQuestion: "How do intermolecular forces and mobile-phase eluotropic polarity govern the retention factor (Rf) and chromatographic resolution of chemical mixtures?",
      canvasElement: canvas,
      parameters: {
        "Analyte Mixture": mixture.name,
        "Stationary Phase": stationaryPhase === "silica" ? "Normal-Phase Silica Gel 60 F254" : "Reversed-Phase C18 Octadecyl",
        "Mobile Phase Eluent": `${ethylAcetatePct}% Ethyl Acetate : ${100 - ethylAcetatePct}% n-Hexane`,
        "Solvent Front Migration": `${dSolventMm.toFixed(1)} mm`,
        "Visualization Optics": lightMode.toUpperCase()
      },
      formulas: [
        "R_f = \\frac{d_{\\text{substance}}}{d_{\\text{solvent}}}",
        "k' = \\frac{1 - R_f}{R_f} = \\frac{t_R - t_0}{t_0}",
        "R_s = \\frac{2(t_{R2} - t_{R1})}{w_1 + w_2}"
      ],
      trials: LabTrialStore.getTrials("chromatography")
    });
  });

  // CSV Telemetry Export
  btnExport.addEventListener("click", () => {
    const mixture = SAMPLE_MIXTURES[currentMixtureKey];
    const dSolventMm = plateLengthMm * developmentProgress;

    exportLabDataCsv({
      title: "Thin-Layer (TLC) & Column Chromatography Separation",
      labId: "chromatography",
      parameters: {
        "Sample Mixture": mixture.name,
        "Stationary Phase": stationaryPhase === "silica" ? "Normal-Phase Silica Gel (SiO2)" : "Reversed-Phase C18",
        "Mobile Phase Composition": `${ethylAcetatePct}% Ethyl Acetate / ${100 - ethylAcetatePct}% n-Hexane`,
        "Solvent Front Distance (mm)": dSolventMm.toFixed(2),
        "Detection Mode": lightMode
      },
      headers: ["Compound Name", "Formula", "Molecular Weight (g/mol)", "Spot Distance (mm)", "Retention Factor (Rf)", "Column Retention Time t_R (min)", "Dominant IMF"],
      dataRows: mixture.compounds.map(c => {
        const rf = computeCompoundRf(c);
        const dSpot = dSolventMm * rf;
        const tR = computeRetentionTime(c);
        return [
          c.name,
          c.formula,
          c.mw.toFixed(2),
          dSpot.toFixed(2),
          rf.toFixed(4),
          tR.toFixed(2),
          c.imfType
        ];
      })
    });
    SoundFX.success?.() || SoundFX.playBeep?.();
  });

  const handleKeyDown = (e) => {
    if ((e.key === "e" || e.key === "E") && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      btnExport.click();
    }
  };
  window.addEventListener("keydown", handleKeyDown);

  updateHUD();
  animId = requestAnimationFrame(renderChromatographyCanvas);

  return function cleanupChromatographyLab() {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("resize", setupHiDPICanvas);
  };
}
