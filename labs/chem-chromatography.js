// Edugates-ClipSAT Science Labs - Chemistry: Thin-Layer (TLC), Flash Column & HPLC Chromatography Suite
// Ultra-HD 60 FPS Analytical Separation Workbench:
// - Aspect-correct responsive HiDPI Canvas (zero stretching, dynamic getBoundingClientRect() projection)
// - 3D Borosilicate TLC Chamber with vapour saturation mist, UV-254nm/365nm hood cone, and optical laser densitometer
// - Pressurized Flash Chromatography Glass Column with PTFE stopcock, animated descending bands, and 6-tube fraction collector rack
// - Real-Time Diode-Array HPLC Chromatogram (mAU vs t_R) with shaded Gaussian integration, theoretical plates N, and resolution Rs
// - Atomic Force / Molecular Partitioning View with animated 3D ball-and-stick solutes & Si-OH hydrogen-bond bridges

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
      description: "Separates nonpolar polyene carotenes from xanthophyll alcohols and Mg-porphyrin chlorophylls a & b.",
      compounds: [
        {
          id: "carotene",
          name: "β-Carotene",
          shortName: "β-Carotene",
          formula: "C₄₀H₅₆",
          polarity: 0.08,
          mw: 536.87,
          lambdaMax: "450 nm",
          visColor: "#f97316",
          glowColor: "rgba(249, 115, 22, 0.55)",
          uv254Color: "#1e1b4b",
          uv365Color: "#fb923c",
          iodineColor: "#92400e",
          uvActive: true,
          imfType: "London Dispersion Only",
          fg: "Conjugated Polyene (No O/N)"
        },
        {
          id: "pheophytin",
          name: "Pheophytin a",
          shortName: "Pheophytin",
          formula: "C₅₅H₇₄N₄O₅",
          polarity: 0.30,
          mw: 871.20,
          lambdaMax: "409 nm",
          visColor: "#84cc16",
          glowColor: "rgba(132, 204, 22, 0.5)",
          uv254Color: "#312e81",
          uv365Color: "#e11d48",
          iodineColor: "#78350f",
          uvActive: true,
          imfType: "Weak Dipole + Phytyl Ester",
          fg: "Demetallated Porphyrin Ring"
        },
        {
          id: "chlorophylla",
          name: "Chlorophyll a",
          shortName: "Chl a",
          formula: "C₅₅H₇₂MgN₄O₅",
          polarity: 0.51,
          mw: 893.51,
          lambdaMax: "430 / 662 nm",
          visColor: "#10b981",
          glowColor: "rgba(16, 185, 129, 0.6)",
          uv254Color: "#1e1b4b",
          uv365Color: "#ff1744",
          iodineColor: "#451a03",
          uvActive: true,
          imfType: "Mg²⁺ Coordination + Ketone",
          fg: "Chlorin Ring + Methyl (-CH₃)"
        },
        {
          id: "chlorophyllb",
          name: "Chlorophyll b",
          shortName: "Chl b",
          formula: "C₅₅H₇₀MgN₄O₆",
          polarity: 0.67,
          mw: 907.49,
          lambdaMax: "453 / 642 nm",
          visColor: "#16a34a",
          glowColor: "rgba(22, 163, 74, 0.55)",
          uv254Color: "#1e1b4b",
          uv365Color: "#f43f5e",
          iodineColor: "#713f12",
          uvActive: true,
          imfType: "Polar Aldehyde (-CHO) H-Bond",
          fg: "Chlorin Ring + Formyl (-CHO)"
        },
        {
          id: "xanthophyll",
          name: "Lutein (Xanthophyll)",
          shortName: "Lutein",
          formula: "C₄₀H₅₆O₂",
          polarity: 0.82,
          mw: 568.87,
          lambdaMax: "445 nm",
          visColor: "#eab308",
          glowColor: "rgba(234, 179, 8, 0.6)",
          uv254Color: "#312e81",
          uv365Color: "#facc15",
          iodineColor: "#b45309",
          uvActive: true,
          imfType: "Dual Hydroxyl (-OH) H-Bond",
          fg: "Carotenoid Diol (2 × -OH)"
        }
      ]
    },
    analgesics: {
      name: "Pharmaceutical Analgesics (TLC Drug Panel)",
      category: "Forensic & Medicinal Chemistry",
      description: "Colorless aromatic analgesics requiring UV-254nm fluorescence quenching or I₂ vapor staining for detection.",
      compounds: [
        {
          id: "ibuprofen",
          name: "Ibuprofen",
          shortName: "Ibuprofen",
          formula: "C₁₃H₁₈O₂",
          polarity: 0.22,
          mw: 206.28,
          lambdaMax: "222 nm",
          visColor: "rgba(226, 232, 240, 0.16)",
          glowColor: "rgba(99, 102, 241, 0.55)",
          uv254Color: "#311042",
          uv365Color: "#6366f1",
          iodineColor: "#b45309",
          uvActive: true,
          imfType: "Hydrophobic Isobutyl + COOH",
          fg: "Isobutylphenylpropionic Acid"
        },
        {
          id: "aspirin",
          name: "Aspirin (Acetylsalicylic Acid)",
          shortName: "Aspirin",
          formula: "C₉H₈O₄",
          polarity: 0.44,
          mw: 180.16,
          lambdaMax: "276 nm",
          visColor: "rgba(226, 232, 240, 0.16)",
          glowColor: "rgba(56, 189, 248, 0.55)",
          uv254Color: "#2e1065",
          uv365Color: "#38bdf8",
          iodineColor: "#92400e",
          uvActive: true,
          imfType: "Ester + Carboxylic Acid H-Bond",
          fg: "Aromatic Ester + -COOH"
        },
        {
          id: "acetaminophen",
          name: "Acetaminophen (Paracetamol)",
          shortName: "Paracetamol",
          formula: "C₈H₉NO₂",
          polarity: 0.65,
          mw: 151.16,
          lambdaMax: "243 nm",
          visColor: "rgba(226, 232, 240, 0.16)",
          glowColor: "rgba(168, 85, 247, 0.55)",
          uv254Color: "#1e1b4b",
          uv365Color: "#818cf8",
          iodineColor: "#78350f",
          uvActive: true,
          imfType: "Phenol (-OH) + Amide H-Bond",
          fg: "para-Aminophenol Acetamide"
        },
        {
          id: "caffeine",
          name: "Caffeine",
          shortName: "Caffeine",
          formula: "C₈H₁₀N₄O₂",
          polarity: 0.85,
          mw: 194.19,
          lambdaMax: "273 nm",
          visColor: "rgba(226, 232, 240, 0.16)",
          glowColor: "rgba(236, 72, 153, 0.55)",
          uv254Color: "#170d36",
          uv365Color: "#ec4899",
          iodineColor: "#451a03",
          uvActive: true,
          imfType: "Poly-Nitrogen Xanthine Dione",
          fg: "Trimethylxanthine Alkaloid"
        }
      ]
    },
    dyes: {
      name: "Forensic Ink & Organic Azo Dyes",
      category: "Analytical Dye Separation",
      description: "Separates synthetic diazo chromophores, xanthene fluorophores, and thiazine salts by charge and dipole moment.",
      compounds: [
        {
          id: "sudan4",
          name: "Sudan IV (Lysochrome)",
          shortName: "Sudan IV",
          formula: "C₂₄H₂₀N₄O",
          polarity: 0.15,
          mw: 380.44,
          lambdaMax: "520 nm",
          visColor: "#ef4444",
          glowColor: "rgba(239, 68, 68, 0.55)",
          uv254Color: "#3b0764",
          uv365Color: "#f87171",
          iodineColor: "#7f1d1d",
          uvActive: true,
          imfType: "Nonpolar Naphthyl Diazo",
          fg: "Lipophilic Diazo Naphthol"
        },
        {
          id: "methylred",
          name: "Methyl Red",
          shortName: "Methyl Red",
          formula: "C₁₅H₁₅N₃O₂",
          polarity: 0.42,
          mw: 269.30,
          lambdaMax: "493 nm",
          visColor: "#f59e0b",
          glowColor: "rgba(245, 158, 11, 0.55)",
          uv254Color: "#1e1b4b",
          uv365Color: "#fbbf24",
          iodineColor: "#92400e",
          uvActive: true,
          imfType: "Carboxylic Acid + Tert-Amine",
          fg: "ortho-Carboxy Azo Dye"
        },
        {
          id: "fluorescein",
          name: "Fluorescein",
          shortName: "Fluorescein",
          formula: "C₂₀H₁₂O₅",
          polarity: 0.64,
          mw: 332.31,
          lambdaMax: "490 nm",
          visColor: "#a3e635",
          glowColor: "rgba(163, 230, 53, 0.7)",
          uv254Color: "#14532d",
          uv365Color: "#4ade80",
          iodineColor: "#854d0e",
          uvActive: true,
          imfType: "Phenolic Xanthene Lactone",
          fg: "Dihydroxyspiroisobenzofuran"
        },
        {
          id: "methyleneblue",
          name: "Methylene Blue",
          shortName: "Methylene Blue",
          formula: "C₁₆H₁₈ClN₃S",
          polarity: 0.88,
          mw: 319.85,
          lambdaMax: "668 nm",
          visColor: "#0ea5e9",
          glowColor: "rgba(14, 165, 233, 0.65)",
          uv254Color: "#0f172a",
          uv365Color: "#38bdf8",
          iodineColor: "#1e3a8a",
          uvActive: true,
          imfType: "Ionic Phenothiazinium Salt",
          fg: "Cationic Thiazine Chromophore"
        }
      ]
    }
  };

  // Simulation State
  let currentMixtureKey = "spinach";
  let ethylAcetatePct = 35; // 0% (Pure Hexane P'=0.1) to 100% (Pure Ethyl Acetate P'=4.4)
  let stationaryPhase = "silica"; // "silica" (Normal Phase Polar Si-OH) | "c18" (Reversed Phase Nonpolar C18)
  let lightMode = "visible"; // "visible" | "uv254" | "uv365" | "iodine"
  let apparatusMode = "tlc_column"; // "tlc_column" | "molecular"
  let plateLengthMm = 80; // 80 mm migration path
  let developmentProgress = 0.86; // Start pre-developed at 86% so all bands & peaks are immediately vivid
  let isDeveloping = false;
  let selectedCompoundIndex = 2; // Default Chlorophyll a
  let caliperActive = true;
  let animId = null;
  let timeTick = 0;

  // Vapor mist & solvent stream particles
  const vaporParticles = Array.from({ length: 28 }, (_, i) => ({
    x: (i * 37) % 100,
    y: (i * 53) % 100,
    r: 1.2 + (i % 3) * 0.7,
    vy: 0.18 + (i % 5) * 0.06,
    phase: i * 0.8
  }));

  // Dynamic Rf Calculation based on Mobile Phase Eluotropic Strength & Stationary Phase Polarity
  function computeCompoundRf(compound) {
    const eluentStrength = 0.06 + (ethylAcetatePct / 100) * 0.88;
    let rawRf;

    if (stationaryPhase === "silica") {
      // Normal Phase (Polar SiO2-OH): Nonpolar compounds have high Rf; polar compounds adsorb strongly (low Rf)
      const adsorptionAffinity = Math.pow(compound.polarity, 1.15);
      rawRf = Math.pow(eluentStrength, 0.75 * adsorptionAffinity + 0.15) * (1.02 - 0.72 * adsorptionAffinity * (1 - eluentStrength * 0.65));
    } else {
      // Reversed Phase (Nonpolar C18): Polar compounds elute fastest (high Rf); nonpolar compounds retain on C18 alkyl chains
      const hydrophobicRetention = Math.pow(1 - compound.polarity, 1.15);
      rawRf = (1 - 0.78 * hydrophobicRetention * (1 - eluentStrength * 0.5)) * (0.25 + 0.72 * compound.polarity);
    }

    return Math.max(0.05, Math.min(0.95, rawRf));
  }

  // Compute Column Retention Time t_R (min) from Rf: k' = (1 - Rf)/Rf, t_R = t_0 * (1 + k')
  function computeRetentionTime(compound) {
    const rf = computeCompoundRf(compound);
    const t0 = 1.20; // Dead time (min)
    const kPrime = (1 - rf) / Math.max(0.08, rf);
    return Math.min(14.2, t0 * (1 + kPrime * 0.82));
  }

  // Compute Resolution Rs between adjacent eluted peaks
  function computeAverageResolution() {
    const comps = SAMPLE_MIXTURES[currentMixtureKey].compounds;
    const sorted = [...comps].map(c => computeRetentionTime(c)).sort((a, b) => a - b);
    if (sorted.length < 2) return 1.5;
    let minRs = 99;
    for (let i = 1; i < sorted.length; i++) {
      const dt = sorted[i] - sorted[i - 1];
      const wAvg = 0.64;
      const rs = (2 * dt) / (wAvg + wAvg);
      if (rs < minRs) minRs = rs;
    }
    return minRs;
  }

  // Helper to get active visual color of a spot under current illumination
  function getSpotRenderColor(comp) {
    if (lightMode === "uv254") return comp.uv254Color;
    if (lightMode === "uv365") return comp.uv365Color;
    if (lightMode === "iodine") return comp.iodineColor;
    if (currentMixtureKey === "analgesics") return "rgba(148, 163, 184, 0.25)";
    return comp.visColor;
  }

  container.innerHTML = `
    <div class="lab-container" style="display: flex; flex-direction: column; gap: 16px;">
      <style>
        .chrom-workbench-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.55fr) minmax(340px, 1fr);
          gap: 18px;
          align-items: stretch;
        }
        @media (max-width: 1120px) {
          .chrom-workbench-grid {
            grid-template-columns: 1fr;
          }
        }
        .chrom-telemetry-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.96) 0%, rgba(7, 13, 25, 0.98) 100%);
          border: 1px solid rgba(6, 182, 212, 0.32);
          border-radius: 12px;
          padding: 10px 14px;
          box-shadow: 0 10px 25px -10px rgba(0, 0, 0, 0.7);
        }
        @media (max-width: 768px) {
          .chrom-telemetry-strip {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .chrom-metric-card {
          background: rgba(2, 6, 23, 0.75);
          border: 1px solid rgba(51, 65, 85, 0.65);
          border-radius: 8px;
          padding: 7px 11px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .chrom-row-item {
          transition: background 0.15s ease, transform 0.15s ease;
        }
        .chrom-row-item:hover {
          background: rgba(6, 182, 212, 0.14) !important;
        }
        [data-theme="day"] .chrom-telemetry-strip {
          background: #ffffff !important;
          border: 1.5px solid #cbd5e1 !important;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05) !important;
        }
        [data-theme="day"] .chrom-metric-card {
          background: #f8fafc !important;
          border: 1.5px solid #cbd5e1 !important;
        }
        [data-theme="day"] .chrom-row-item:hover {
          background: #f0f9ff !important;
        }
      </style>

      <!-- Top Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(8, 28, 48, 0.94) 100%); border: 1px solid rgba(6, 182, 212, 0.4); border-radius: 14px; padding: 12px 18px; flex-wrap: wrap; gap: 12px; box-shadow: 0 12px 32px -12px rgba(0, 0, 0, 0.75);">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <div style="width: 38px; height: 38px; border-radius: 10px; background: radial-gradient(circle at 30% 30%, rgba(6, 182, 212, 0.35), rgba(15, 23, 42, 0.9)); border: 1px solid rgba(6, 182, 212, 0.5); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 18px rgba(6, 182, 212, 0.3);">
            <span style="font-size: 1.2rem;">🧪</span>
          </div>
          <div>
            <div style="font-size: 0.92rem; font-weight: 800; color: #f8fafc; letter-spacing: 0.01em; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span>Thin-Layer (TLC), Flash Column &amp; HPLC Chromatography</span>
              <span class="badge" style="background: rgba(6, 182, 212, 0.18); border: 1px solid rgba(6, 182, 212, 0.45); color: #22d3ee; font-size: 0.72rem; padding: 2px 9px; border-radius: 9999px;">
                ${renderLatex("R_f = \\frac{d_{\\text{spot}}}{d_{\\text{solvent}}} \\;\\bullet\\; R_s = \\frac{2\\Delta t_R}{w_1 + w_2}")}
              </span>
            </div>
            <div style="font-size: 0.73rem; color: #94a3b8;">
              Inspire Chemistry M02/M07/M13 • Lucas-Washburn Capillary Kinetics, Silanol Partitioning &amp; Diode-Array Detection
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(2, 6, 23, 0.75); border-radius: 9px; padding: 3px; border: 1px solid rgba(6, 182, 212, 0.3);">
            <button id="view-mode-chrom-sim" class="btn btn-secondary active" style="padding: 6px 12px; font-size: 0.76rem; font-weight: 700; border-radius: 6px; border: none; background: linear-gradient(135deg, #0284c7, #06b6d4); color: #fff; box-shadow: 0 2px 10px rgba(6, 182, 212, 0.35);">
              🔬 TLC, Column &amp; HPLC
            </button>
            <button id="view-mode-chrom-mol" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.76rem; font-weight: 600; border-radius: 6px; background: transparent; border: none; color: #cbd5e1;">
              ⚛️ Si-OH Partitioning
            </button>
            <button id="view-mode-chrom-photo" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.76rem; font-weight: 600; border-radius: 6px; background: transparent; border: none; color: #cbd5e1;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-chrom-develop" style="padding: 6px 14px; font-size: 0.76rem; font-weight: 800; background: linear-gradient(135deg, #059669, #10b981); border: none; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);">
            ▶ Run Elution
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-chrom-record" style="padding: 6px 11px; font-size: 0.75rem; border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;">
            📌 Record Trial
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-chrom-report" style="padding: 6px 11px; font-size: 0.75rem; border-color: rgba(168, 85, 247, 0.4); color: #c084fc;">
            📋 Lab Dossier
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-chrom-export" style="padding: 6px 11px; font-size: 0.75rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export CSV (E)
          </button>
        </div>
      </div>

      <!-- Dedicated Digital Telemetry Ribbon (Never overlaps Canvas!) -->
      <div class="chrom-telemetry-strip">
        <div class="chrom-metric-card" style="border-left: 3px solid #22d3ee;">
          <span style="font-size: 0.64rem; color: #94a3b8; text-transform: uppercase; font-family: var(--font-mono); letter-spacing: 0.04em;">ACTIVE ANALYTE SPOT / PEAK</span>
          <div id="hud-chrom-compound" style="font-size: 0.96rem; font-weight: 800; color: #22d3ee; font-family: var(--font-mono); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            Chlorophyll a • Rf = 0.48
          </div>
        </div>
        <div class="chrom-metric-card" style="border-left: 3px solid #34d399;">
          <span style="font-size: 0.64rem; color: #94a3b8; text-transform: uppercase; font-family: var(--font-mono); letter-spacing: 0.04em;">SOLVENT FRONT &amp; RESOLUTION</span>
          <div id="hud-chrom-front" style="font-size: 0.96rem; font-weight: 800; color: #34d399; font-family: var(--font-mono);">
            zf = 68.8 mm • Rs = 1.92
          </div>
        </div>
        <div class="chrom-metric-card" style="border-left: 3px solid #fbbf24;">
          <span style="font-size: 0.64rem; color: #94a3b8; text-transform: uppercase; font-family: var(--font-mono); letter-spacing: 0.04em;">MOBILE PHASE ELUENT (P')</span>
          <div id="hud-chrom-eluent" style="font-size: 0.92rem; font-weight: 800; color: #fbbf24; font-family: var(--font-mono);">
            35% EtOAc : 65% Hexane (P' = 1.61)
          </div>
        </div>
        <div class="chrom-metric-card" style="border-left: 3px solid #c084fc;">
          <span style="font-size: 0.64rem; color: #94a3b8; text-transform: uppercase; font-family: var(--font-mono); letter-spacing: 0.04em;">STATIONARY PHASE &amp; OPTICS</span>
          <div id="hud-chrom-phase" style="font-size: 0.9rem; font-weight: 800; color: #e9d5ff; font-family: var(--font-mono);">
            Polar SiO₂-OH • White Light
          </div>
        </div>
      </div>

      <!-- Main Workbench Grid -->
      <div class="chrom-workbench-grid">
        <!-- Left Interactive 60 FPS Canvas & 4K Bench Viewport -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(6, 182, 212, 0.42); box-shadow: 0 24px 55px -15px rgba(0, 0, 0, 0.9), inset 0 0 40px rgba(6, 182, 212, 0.07); background: #030712; border-radius: 14px; overflow: hidden; min-height: 600px; display: flex; flex-direction: column;">
          <canvas id="chrom-canvas" width="920" height="600" style="width: 100%; height: 600px; display: block; cursor: pointer; flex: 1;"></canvas>

          <!-- 4K Real Laboratory Photograph Overlay -->
          <div id="chromatography-photo-overlay" style="display: none; position: absolute; inset: 0; background: #020617; z-index: 10;">
            <picture>
              <source srcset="assets/labs/chromatography_bench.webp" type="image/webp">
              <img src="assets/labs/chromatography_bench.jpg" decoding="async" loading="lazy" alt="4K Thin-Layer Chromatography Chamber, Silica Flash Column &amp; UV-254nm Analytical Workbench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.96;">
            </picture>

            <div style="position: absolute; top: 16px; left: 16px; background: rgba(2, 6, 23, 0.88); backdrop-filter: blur(12px); border: 1px solid rgba(6, 182, 212, 0.5); border-radius: 999px; padding: 6px 14px; display: flex; align-items: center; gap: 8px; box-shadow: 0 8px 25px rgba(0,0,0,0.7);">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #22d3ee; box-shadow: 0 0 8px #22d3ee;"></span>
              <span style="font-size: 0.74rem; font-weight: 800; color: #f8fafc; letter-spacing: 0.04em;">4K AUTHENTIC ANALYTICAL CHROMATOGRAPHY BENCH</span>
            </div>

            <div style="position: absolute; bottom: 18px; left: 18px; right: 18px; background: rgba(9, 15, 30, 0.92); backdrop-filter: blur(16px); border: 1px solid rgba(6, 182, 212, 0.45); border-radius: 12px; padding: 14px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 14px 35px rgba(0,0,0,0.88);">
              <div>
                <div style="font-size: 0.66rem; color: #94a3b8; text-transform: uppercase; font-weight: 700;">Stationary Phase Bed</div>
                <div style="color: #22d3ee; font-weight: 800; font-family: var(--font-mono); font-size: 0.86rem; margin-top: 2px;">Silica Gel 60 F₂₅₄ (SiO₂·xH₂O)</div>
                <div style="font-size: 0.68rem; color: #cbd5e1; margin-top: 2px;">Polar silanol (-Si-OH) H-bond donor sites</div>
              </div>
              <div>
                <div style="font-size: 0.66rem; color: #94a3b8; text-transform: uppercase; font-weight: 700;">Mobile Phase Eluent</div>
                <div style="color: #fbbf24; font-weight: 800; font-family: var(--font-mono); font-size: 0.86rem; margin-top: 2px;">n-Hexane : Ethyl Acetate</div>
                <div style="font-size: 0.68rem; color: #cbd5e1; margin-top: 2px;">Tunable Snyder polarity index P' (0.1 → 4.4)</div>
              </div>
              <div>
                <div style="font-size: 0.66rem; color: #94a3b8; text-transform: uppercase; font-weight: 700;">Detection Optics</div>
                <div style="color: #34d399; font-weight: 800; font-family: var(--font-mono); font-size: 0.86rem; margin-top: 2px;">UV 254/365 nm + DAD HPLC</div>
                <div style="font-size: 0.68rem; color: #cbd5e1; margin-top: 2px;">Fluorescence quenching &amp; Gaussian peak area</div>
              </div>
            </div>
          </div>

          <!-- Bottom Interactive Canvas Bar -->
          <div style="background: rgba(9, 14, 28, 0.96); border-top: 1px solid rgba(51, 65, 85, 0.65); padding: 8px 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <button class="btn btn-secondary btn-sm" id="btn-chrom-caliper" style="padding: 4px 10px; font-size: 0.72rem; font-weight: 700; border-color: rgba(6, 182, 212, 0.45); color: #22d3ee;">
                📏 Digital Rf Caliper: ON
              </button>
              <button class="btn btn-secondary btn-sm" id="btn-chrom-reset" style="padding: 4px 10px; font-size: 0.72rem; font-weight: 600;">
                ↺ Spot Fresh Plate (t = 0)
              </button>
            </div>
            <div style="font-size: 0.71rem; color: #94a3b8; font-family: var(--font-mono);">
              💡 Click any TLC spot, column band, or HPLC peak to lock the laser densitometer
            </div>
          </div>
        </div>

        <!-- Right Controls & Quantitative Rf / HPLC Telemetry Deck -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <!-- Mixture, Stationary Phase, Solvent Gradient & Illumination Controls -->
          <div style="background: linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(9, 14, 28, 0.95) 100%); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 14px; padding: 15px 16px; box-shadow: 0 12px 28px -12px rgba(0, 0, 0, 0.75);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div style="font-size: 0.75rem; font-weight: 800; color: #06b6d4; text-transform: uppercase; letter-spacing: 0.05em;">
                1. Sample Mixture &amp; Phase Parameters
              </div>
              <span id="chrom-polarity-badge" class="badge" style="background: rgba(6, 182, 212, 0.15); color: #22d3ee; font-size: 0.68rem; padding: 2px 8px; border-radius: 6px; font-family: var(--font-mono);">
                P' = 1.61
              </span>
            </div>

            <!-- Sample Mixture Selector -->
            <div class="control-group" style="margin-bottom: 11px;">
              <label for="chrom-mixture-select" class="control-label" style="display: block; font-size: 0.74rem; color: #cbd5e1; font-weight: 700; margin-bottom: 4px;">
                Analyte Mixture Spotted on Origin Line:
              </label>
              <select id="chrom-mixture-select" aria-label="Select Chromatography Sample Mixture" style="width: 100%; background: #020617; color: #f8fafc; border: 1px solid #334155; border-radius: 8px; padding: 8px 10px; font-size: 0.8rem; font-weight: 700;">
                <option value="spinach">🌿 Spinach Chloroplast Extracts (5 Photosynthetic Pigments)</option>
                <option value="analgesics">💊 Pharmaceutical Analgesics Panel (Ibuprofen, Aspirin, Paracetamol, Caffeine)</option>
                <option value="dyes">🎨 Forensic Ink &amp; Organic Azo Dyes (Sudan IV, Methyl Red, Fluorescein, Methylene Blue)</option>
              </select>
            </div>

            <!-- Mobile Phase Eluent Polarity Slider (% Ethyl Acetate in Hexane) -->
            <div class="control-slider-group" style="margin-bottom: 12px; background: rgba(2, 6, 23, 0.6); border: 1px solid rgba(51, 65, 85, 0.6); border-radius: 10px; padding: 9px 12px;">
              <div class="slider-header" style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 4px;">
                <span style="color: #e2e8f0; font-weight: 700;">Mobile Phase Eluent (% Ethyl Acetate)</span>
                <span id="val-eluent-pct" style="color: #22d3ee; font-family: var(--font-mono); font-weight: 800;">35% EtOAc : 65% Hexane</span>
              </div>
              <input type="range" id="slider-eluent-pct" min="0" max="100" step="5" value="35" style="width: 100%; accent-color: #06b6d4;">
              <div style="display: flex; justify-content: space-between; font-size: 0.65rem; color: #64748b; margin-top: 3px; font-family: var(--font-mono);">
                <span>0% (Pure n-Hexane • Nonpolar)</span>
                <span>50% (Medium Eluent)</span>
                <span>100% (Pure EtOAc • Polar)</span>
              </div>
            </div>

            <!-- Stationary Phase Matrix Toggle -->
            <div style="margin-bottom: 11px;">
              <div style="font-size: 0.73rem; color: #cbd5e1; font-weight: 700; margin-bottom: 5px;">Stationary Phase Chemistry (Adsorbent Matrix):</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 7px;">
                <button id="phase-silica" class="btn btn-secondary btn-sm active" style="font-size: 0.73rem; padding: 7px 8px; border-color: #06b6d4; background: rgba(6, 182, 212, 0.2); color: #f8fafc; font-weight: 700;">
                  🧪 Normal-Phase Polar SiO₂-OH
                </button>
                <button id="phase-c18" class="btn btn-secondary btn-sm" style="font-size: 0.73rem; padding: 7px 8px;">
                  🔄 Reversed-Phase Nonpolar C₁₈
                </button>
              </div>
            </div>

            <!-- Visualization & UV Lamp Cabinet Mode -->
            <div>
              <div style="font-size: 0.73rem; color: #cbd5e1; font-weight: 700; margin-bottom: 5px;">Plate Detection &amp; UV Cabinet Illumination:</div>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
                <button class="btn btn-secondary btn-sm chrom-light-btn active" data-light="visible" style="font-size: 0.71rem; padding: 6px 4px; border-color: #38bdf8; background: rgba(56, 189, 248, 0.2); color: #fff; font-weight: 700;">
                  ☀️ Visible
                </button>
                <button class="btn btn-secondary btn-sm chrom-light-btn" data-light="uv254" style="font-size: 0.71rem; padding: 6px 4px;">
                  🟢 UV-254nm
                </button>
                <button class="btn btn-secondary btn-sm chrom-light-btn" data-light="uv365" style="font-size: 0.71rem; padding: 6px 4px;">
                  🟣 UV-365nm
                </button>
                <button class="btn btn-secondary btn-sm chrom-light-btn" data-light="iodine" style="font-size: 0.71rem; padding: 6px 4px;">
                  🟤 I₂ Vapor
                </button>
              </div>
            </div>
          </div>

          <!-- Analytical Rf & Retention Time Telemetry Table -->
          <div style="background: linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(9, 14, 28, 0.95) 100%); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 14px; padding: 14px 16px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 12px 28px -12px rgba(0, 0, 0, 0.75);">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div style="font-size: 0.75rem; font-weight: 800; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em;">
                  2. Quantitative Rf &amp; HPLC Elution Telemetry
                </div>
                <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #34d399; font-size: 0.67rem; padding: 2px 8px; border-radius: 6px;">
                  Click Row to Inspect Band
                </span>
              </div>

              <div style="background: #020617; border: 1px solid #1e293b; border-radius: 10px; overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.72rem; text-align: left;">
                  <thead>
                    <tr style="background: rgba(15, 23, 42, 0.95); border-bottom: 1px solid #334155; color: #94a3b8; font-family: var(--font-mono); font-size: 0.67rem;">
                      <th style="padding: 7px 8px;">ANALYTE BAND</th>
                      <th style="padding: 7px 6px;">d_spot</th>
                      <th style="padding: 7px 6px;">Rf</th>
                      <th style="padding: 7px 6px;">HPLC t_R</th>
                      <th style="padding: 7px 8px;">DOMINANT IMF</th>
                    </tr>
                  </thead>
                  <tbody id="chrom-table-body">
                    <!-- Populated dynamically -->
                  </tbody>
                </table>
              </div>
            </div>

            <div id="chrom-chemical-insight" style="margin-top: 10px; font-size: 0.74rem; color: #e2e8f0; line-height: 1.48; background: linear-gradient(90deg, rgba(6, 182, 212, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%); border-left: 3px solid #06b6d4; border-radius: 8px; padding: 9px 12px;">
              <!-- Dynamic molecular partitioning explanation -->
            </div>
          </div>
        </div>
      </div>

      <!-- Post-Lab Competency Checkpoint Container -->
      <div id="chrom-checkpoint-container" style="margin-top: 8px; width: 100%;"></div>
    </div>
  `;

  // Mount Post-Lab Competency Checkpoint
  mountLabCheckpoint("chrom-checkpoint-container", "chromatography");

  // DOM References
  const canvas = document.getElementById("chrom-canvas");
  const ctx = canvas.getContext("2d");

  let logicalW = 920;
  let logicalH = 600;

  function syncCanvasSize() {
    if (!canvas) return;
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect ? canvas.getBoundingClientRect() : null;
    if (rect && rect.width > 300 && rect.height > 250) {
      logicalW = Math.round(rect.width);
      logicalH = Math.round(rect.height);
    } else {
      logicalW = 920;
      logicalH = 600;
    }
    const targetW = Math.round(logicalW * dpr);
    const targetH = Math.round(logicalH * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
  }
  syncCanvasSize();
  window.addEventListener("resize", syncCanvasSize);

  const viewSimBtn = document.getElementById("view-mode-chrom-sim");
  const viewMolBtn = document.getElementById("view-mode-chrom-mol");
  const viewPhotoBtn = document.getElementById("view-mode-chrom-photo");
  const photoOverlay = document.getElementById("chromatography-photo-overlay");

  const mixtureSelect = document.getElementById("chrom-mixture-select");
  const sliderEluent = document.getElementById("slider-eluent-pct");
  const valEluentPct = document.getElementById("val-eluent-pct");
  const polarityBadge = document.getElementById("chrom-polarity-badge");

  const btnPhaseSilica = document.getElementById("phase-silica");
  const btnPhaseC18 = document.getElementById("phase-c18");
  const lightBtns = container.querySelectorAll(".chrom-light-btn");

  const btnDevelop = document.getElementById("btn-chrom-develop");
  const btnReset = document.getElementById("btn-chrom-reset");
  const btnCaliper = document.getElementById("btn-chrom-caliper");
  const btnRecord = document.getElementById("btn-chrom-record");
  const btnReport = document.getElementById("btn-chrom-report");
  const btnExport = document.getElementById("btn-chrom-export");

  const hudCompound = document.getElementById("hud-chrom-compound");
  const hudFront = document.getElementById("hud-chrom-front");
  const hudEluent = document.getElementById("hud-chrom-eluent");
  const hudPhase = document.getElementById("hud-chrom-phase");
  const tableBody = document.getElementById("chrom-table-body");
  const insightBox = document.getElementById("chrom-chemical-insight");

  // Layout Geometry Helper (scales cleanly to any canvas width/height)
  function getStageGeometry(W, H) {
    const pad = 16;
    const gap = 14;
    const tlcW = Math.round(W * 0.30);
    const colW = Math.round(W * 0.25);
    const hplcW = W - pad * 2 - gap * 2 - tlcW - colW;

    const tlcBox = { x: pad, y: 14, w: tlcW, h: H - 28 };
    const colBox = { x: pad + tlcW + gap, y: 14, w: colW, h: H - 28 };
    const hplcBox = { x: pad + tlcW + colW + gap * 2, y: 14, w: hplcW, h: H - 28 };

    // Inside TLC Chamber
    const plateW = Math.min(182, tlcBox.w - 58);
    const plateX = tlcBox.x + Math.round((tlcBox.w - plateW) / 2);
    const plateY = tlcBox.y + 76;
    const plateH = tlcBox.h - 118;
    const originY = plateY + plateH - 36;
    const maxFrontRisePx = plateH - 68;

    return {
      tlcBox,
      colBox,
      hplcBox,
      plate: { x: plateX, y: plateY, w: plateW, h: plateH, originY, maxFrontRisePx }
    };
  }

  function setViewMode(mode) {
    if (mode === "photo") {
      photoOverlay.style.display = "block";
      viewPhotoBtn.classList.add("active");
      viewPhotoBtn.style.background = "linear-gradient(135deg, #0284c7, #06b6d4)";
      viewPhotoBtn.style.color = "#fff";
      viewSimBtn.classList.remove("active");
      viewSimBtn.style.background = "transparent";
      viewMolBtn.classList.remove("active");
      viewMolBtn.style.background = "transparent";
    } else {
      photoOverlay.style.display = "none";
      apparatusMode = mode;
      viewPhotoBtn.classList.remove("active");
      viewPhotoBtn.style.background = "transparent";
      if (mode === "tlc_column") {
        viewSimBtn.classList.add("active");
        viewSimBtn.style.background = "linear-gradient(135deg, #0284c7, #06b6d4)";
        viewSimBtn.style.color = "#fff";
        viewMolBtn.classList.remove("active");
        viewMolBtn.style.background = "transparent";
      } else {
        viewMolBtn.classList.add("active");
        viewMolBtn.style.background = "linear-gradient(135deg, #0284c7, #06b6d4)";
        viewMolBtn.style.color = "#fff";
        viewSimBtn.classList.remove("active");
        viewSimBtn.style.background = "transparent";
      }
    }
    SoundFX.click?.() || SoundFX.playClick?.();
  }

  viewSimBtn.addEventListener("click", () => setViewMode("tlc_column"));
  viewMolBtn.addEventListener("click", () => setViewMode("molecular"));
  viewPhotoBtn.addEventListener("click", () => setViewMode("photo"));

  // Update Table & HUD Telemetry
  function updateHUD() {
    const mixture = SAMPLE_MIXTURES[currentMixtureKey];
    const comps = mixture.compounds;
    if (selectedCompoundIndex >= comps.length) selectedCompoundIndex = 0;

    const pPrime = (0.1 + (ethylAcetatePct / 100) * 4.3).toFixed(2);
    if (polarityBadge) polarityBadge.textContent = `P' = ${pPrime}`;
    if (valEluentPct) valEluentPct.textContent = `${ethylAcetatePct}% EtOAc : ${100 - ethylAcetatePct}% Hexane`;
    if (hudEluent) hudEluent.textContent = `${ethylAcetatePct}% EtOAc : ${100 - ethylAcetatePct}% Hexane (P' = ${pPrime})`;

    const lightLabels = {
      visible: "White Light",
      uv254: "UV-254nm F₂₅₄",
      uv365: "UV-365nm Fluor",
      iodine: "I₂ Vapor Stain"
    };
    if (hudPhase) {
      hudPhase.textContent = `${stationaryPhase === "silica" ? "Polar SiO₂-OH" : "Nonpolar C₁₈"} • ${lightLabels[lightMode]}`;
    }

    const dSolventMm = plateLengthMm * developmentProgress;
    const rs = computeAverageResolution();
    const selComp = comps[selectedCompoundIndex];
    const selRf = computeCompoundRf(selComp);

    if (hudCompound) {
      hudCompound.textContent = `${selComp.name} • Rf = ${selRf.toFixed(2)}`;
    }
    if (hudFront) {
      hudFront.textContent = `zf = ${dSolventMm.toFixed(1)} mm • Rs = ${rs.toFixed(2)}`;
    }

    // Populate Table
    if (tableBody) {
      tableBody.innerHTML = comps.map((c, idx) => {
        const rf = computeCompoundRf(c);
        const dSpot = dSolventMm * rf;
        const tr = computeRetentionTime(c);
        const isSel = idx === selectedCompoundIndex;
        const swatch = c.visColor.startsWith("rgba") ? "#a855f7" : c.visColor;

        return `
          <tr data-comp-idx="${idx}" class="chrom-row-item" style="border-bottom: 1px solid #1e293b; background: ${isSel ? 'rgba(6, 182, 212, 0.2)' : 'transparent'}; cursor: pointer;">
            <td style="padding: 6px 8px; font-weight: 700; color: #f8fafc; display: flex; align-items: center; gap: 7px;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${swatch}; box-shadow: 0 0 8px ${swatch};"></span>
              <span>${c.shortName || c.name}</span>
            </td>
            <td style="padding: 6px 6px; font-family: var(--font-mono); color: #cbd5e1;">${dSpot.toFixed(1)} mm</td>
            <td style="padding: 6px 6px; font-family: var(--font-mono); font-weight: 800; color: #22d3ee;">${rf.toFixed(2)}</td>
            <td style="padding: 6px 6px; font-family: var(--font-mono); color: #34d399;">${tr.toFixed(2)} min</td>
            <td style="padding: 6px 8px; color: #94a3b8; font-size: 0.67rem;">${c.imfType}</td>
          </tr>
        `;
      }).join("");

      tableBody.querySelectorAll("tr[data-comp-idx]").forEach(row => {
        row.addEventListener("click", () => {
          selectedCompoundIndex = parseInt(row.dataset.compIdx, 10);
          SoundFX.click?.() || SoundFX.playClick?.();
          updateHUD();
        });
      });
    }

    const phaseDesc = stationaryPhase === "silica"
      ? `On <strong>Normal-Phase Polar Silica ($\\text{SiO}_2\\text{-OH}$)</strong>, polar solutes form strong hydrogen bonds with surface silanol groups (low $R_f$, longer column retention $t_R$), while nonpolar solutes partition into the mobile phase (high $R_f$).`
      : `On <strong>Reversed-Phase Nonpolar $\\text{C}_{18}$</strong>, hydrophobic solutes partition into the octadecyl hydrocarbon brush (low $R_f$, longer $t_R$), while polar solutes elute rapidly with the mobile phase (high $R_f$).`;

    if (insightBox) {
      insightBox.innerHTML = formatMathText(
        `<strong>${selComp.name} (${selComp.formula}):</strong> Exhibits <em>${selComp.imfType}</em> (${selComp.fg}), migrating with $R_f = ${selRf.toFixed(2)}$ and HPLC retention $t_R = ${computeRetentionTime(selComp).toFixed(2)}\\text{ min}$. ${phaseDesc}`
      );
    }
  }

  // Controls Event Listeners
  mixtureSelect.addEventListener("change", (e) => {
    currentMixtureKey = e.target.value;
    selectedCompoundIndex = 0;
    if (currentMixtureKey === "analgesics" && lightMode === "visible") {
      lightMode = "uv254";
      lightBtns.forEach(b => {
        const act = b.dataset.light === "uv254";
        b.classList.toggle("active", act);
        b.style.borderColor = act ? "#38bdf8" : "";
        b.style.background = act ? "rgba(56, 189, 248, 0.2)" : "";
      });
    }
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
    btnPhaseSilica.style.borderColor = "#06b6d4";
    btnPhaseSilica.style.background = "rgba(6, 182, 212, 0.2)";
    btnPhaseC18.classList.remove("active");
    btnPhaseC18.style.borderColor = "";
    btnPhaseC18.style.background = "";
    SoundFX.click?.() || SoundFX.playClick?.();
    updateHUD();
  });

  btnPhaseC18.addEventListener("click", () => {
    stationaryPhase = "c18";
    btnPhaseC18.classList.add("active");
    btnPhaseC18.style.borderColor = "#06b6d4";
    btnPhaseC18.style.background = "rgba(6, 182, 212, 0.2)";
    btnPhaseSilica.classList.remove("active");
    btnPhaseSilica.style.borderColor = "";
    btnPhaseSilica.style.background = "";
    SoundFX.click?.() || SoundFX.playClick?.();
    updateHUD();
  });

  lightBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      lightMode = btn.dataset.light;
      lightBtns.forEach(b => {
        const act = b === btn;
        b.classList.toggle("active", act);
        b.style.borderColor = act ? "#38bdf8" : "";
        b.style.background = act ? "rgba(56, 189, 248, 0.2)" : "";
      });
      SoundFX.click?.() || SoundFX.playClick?.();
      updateHUD();
    });
  });

  btnDevelop.addEventListener("click", () => {
    if (developmentProgress >= 0.96) {
      developmentProgress = 0.04;
    }
    isDeveloping = !isDeveloping;
    btnDevelop.textContent = isDeveloping ? "⏸ Pause Elution" : "▶ Run Elution";
    SoundFX.click?.() || SoundFX.playClick?.();
  });

  btnReset.addEventListener("click", () => {
    isDeveloping = false;
    developmentProgress = 0.05;
    btnDevelop.textContent = "▶ Run Elution";
    SoundFX.click?.() || SoundFX.playClick?.();
    updateHUD();
  });

  btnCaliper.addEventListener("click", () => {
    caliperActive = !caliperActive;
    btnCaliper.textContent = `📏 Digital Rf Caliper: ${caliperActive ? "ON" : "OFF"}`;
    btnCaliper.style.color = caliperActive ? "#22d3ee" : "#94a3b8";
    SoundFX.click?.() || SoundFX.playClick?.();
  });

  // Canvas Click/Touch Spot & Peak Selection
  canvas.addEventListener("pointerdown", (e) => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = (e.clientX - rect.left) * (logicalW / rect.width);
    const y = (e.clientY - rect.top) * (logicalH / rect.height);

    const geom = getStageGeometry(logicalW, logicalH);
    const comps = SAMPLE_MIXTURES[currentMixtureKey].compounds;

    if (apparatusMode === "tlc_column") {
      // Check TLC spots
      const frontRisePx = geom.plate.maxFrontRisePx * developmentProgress;
      let bestIdx = -1;
      let bestDist = 42;
      comps.forEach((c, idx) => {
        const rf = computeCompoundRf(c);
        const spotY = geom.plate.originY - frontRisePx * rf;
        const spotX = geom.plate.x + geom.plate.w * 0.5;
        const d = Math.hypot(x - spotX, y - spotY);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = idx;
        }
      });

      // Check HPLC peaks if clicked in right panel
      if (bestIdx < 0 && x >= geom.hplcBox.x) {
        const plotX = geom.hplcBox.x + 36;
        const plotW = geom.hplcBox.w - 52;
        const clickedTime = ((x - plotX) / Math.max(1, plotW)) * 15.0;
        let minTimeDiff = 2.0;
        comps.forEach((c, idx) => {
          const dt = Math.abs(computeRetentionTime(c) - clickedTime);
          if (dt < minTimeDiff) {
            minTimeDiff = dt;
            bestIdx = idx;
          }
        });
      }

      if (bestIdx >= 0) {
        selectedCompoundIndex = bestIdx;
        SoundFX.click?.() || SoundFX.playClick?.();
        updateHUD();
      }
    }
  });

  // 60 FPS Canvas Rendering Engine
  function renderChromatographyCanvas() {
    if (!container || !container.isConnected) return;
    syncCanvasSize();
    timeTick += 0.035;

    if (isDeveloping) {
      const step = Math.max(0.0022, 0.0075 * (1.12 - developmentProgress));
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

    // Rich Studio Dark Slate Background
    const bgGrad = ctx.createRadialGradient(logicalW * 0.5, logicalH * 0.35, 40, logicalW * 0.5, logicalH * 0.5, logicalW * 0.75);
    bgGrad.addColorStop(0, "#0b192e");
    bgGrad.addColorStop(0.6, "#060d1a");
    bgGrad.addColorStop(1, "#020617");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, logicalW, logicalH);

    // Subtle Precision Blueprint Grid
    ctx.strokeStyle = "rgba(34, 211, 238, 0.035)";
    ctx.lineWidth = 1;
    for (let gx = 24; gx < logicalW; gx += 32) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, logicalH);
      ctx.stroke();
    }
    for (let gy = 24; gy < logicalH; gy += 32) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(logicalW, gy);
      ctx.stroke();
    }

    if (apparatusMode === "molecular") {
      renderMolecularPartitionView(ctx, logicalW, logicalH);
    } else {
      renderThreeStationWorkbench(ctx, logicalW, logicalH);
    }

    ctx.restore();
    animId = requestAnimationFrame(renderChromatographyCanvas);
  }

  function renderThreeStationWorkbench(ctx, W, H) {
    const geom = getStageGeometry(W, H);
    const { tlcBox, colBox, hplcBox, plate } = geom;
    const mixture = SAMPLE_MIXTURES[currentMixtureKey];
    const comps = mixture.compounds;

    // =========================================================================
    // STATION 1: 3D BOROSILICATE GLASS TLC CHAMBER & UV INSPECTION CABINET
    // =========================================================================
    ctx.save();
    // Panel Card Backdrop
    ctx.fillStyle = "rgba(9, 15, 30, 0.78)";
    ctx.strokeStyle = lightMode === "uv254" ? "rgba(74, 222, 128, 0.45)" : (lightMode === "uv365" ? "rgba(192, 132, 252, 0.45)" : "rgba(56, 189, 248, 0.28)");
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(tlcBox.x, tlcBox.y, tlcBox.w, tlcBox.h, 12);
    ctx.fill();
    ctx.stroke();

    // Station Header
    ctx.fillStyle = "#22d3ee";
    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText("① TLC CHAMBER & DENSITOMETER", tlcBox.x + 12, tlcBox.y + 20);

    // Overhead UV Lamp Hood & Light Cone
    const hoodW = Math.min(180, tlcBox.w - 40);
    const hoodX = tlcBox.x + (tlcBox.w - hoodW) / 2;
    const hoodY = tlcBox.y + 30;
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(hoodX, hoodY, hoodW, 16, 5);
    ctx.fill();
    ctx.stroke();

    // UV / Visible Emitter Tube inside Hood
    const emitterColor = lightMode === "uv254" ? "#4ade80" : (lightMode === "uv365" ? "#c084fc" : (lightMode === "iodine" ? "#f59e0b" : "#e0f2fe"));
    ctx.fillStyle = emitterColor;
    ctx.fillRect(hoodX + 14, hoodY + 12, hoodW - 28, 4);

    // Volumetric Illumination Cone over TLC Chamber
    const coneGrad = ctx.createLinearGradient(0, hoodY + 16, 0, plate.y + plate.h);
    if (lightMode === "uv254") {
      coneGrad.addColorStop(0, "rgba(74, 222, 128, 0.22)");
      coneGrad.addColorStop(1, "rgba(74, 222, 128, 0.02)");
    } else if (lightMode === "uv365") {
      coneGrad.addColorStop(0, "rgba(168, 85, 247, 0.26)");
      coneGrad.addColorStop(1, "rgba(168, 85, 247, 0.03)");
    } else if (lightMode === "iodine") {
      coneGrad.addColorStop(0, "rgba(217, 119, 6, 0.22)");
      coneGrad.addColorStop(1, "rgba(180, 83, 9, 0.08)");
    } else {
      coneGrad.addColorStop(0, "rgba(224, 242, 254, 0.12)");
      coneGrad.addColorStop(1, "rgba(224, 242, 254, 0.01)");
    }
    ctx.fillStyle = coneGrad;
    ctx.beginPath();
    ctx.moveTo(hoodX + 10, hoodY + 16);
    ctx.lineTo(hoodX + hoodW - 10, hoodY + 16);
    ctx.lineTo(tlcBox.x + tlcBox.w - 14, plate.y + plate.h + 18);
    ctx.lineTo(tlcBox.x + 14, plate.y + plate.h + 18);
    ctx.closePath();
    ctx.fill();

    // Borosilicate Developing Jar (Outer Glass Tank)
    const jarX = plate.x - 18;
    const jarY = plate.y - 16;
    const jarW = plate.w + 36;
    const jarH = plate.h + 32;

    // Ground-Glass Watch Glass Lid
    ctx.fillStyle = "rgba(148, 163, 184, 0.32)";
    ctx.strokeStyle = "rgba(226, 232, 240, 0.7)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(jarX - 6, jarY - 8, jarW + 12, 8, 4);
    ctx.fill();
    ctx.stroke();

    // Glass Tank Body
    ctx.fillStyle = "rgba(15, 23, 42, 0.45)";
    ctx.strokeStyle = "rgba(186, 230, 253, 0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(jarX, jarY, jarW, jarH, 8);
    ctx.fill();
    ctx.stroke();

    // Animated Vapor Saturation Mist Particles inside Jar
    vaporParticles.forEach(p => {
      const py = jarY + 12 + ((p.y - timeTick * p.vy * 18) % (jarH - 30) + (jarH - 30)) % (jarH - 30);
      const px = jarX + 10 + ((p.x + Math.sin(timeTick + p.phase) * 6) / 100) * (jarW - 20);
      ctx.fillStyle = lightMode === "iodine" ? "rgba(217, 119, 6, 0.22)" : "rgba(186, 230, 253, 0.14)";
      ctx.beginPath();
      ctx.arc(px, py, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Developing Solvent Pool at Bottom of Jar (strictly below origin line!)
    const poolTopY = plate.originY + 14;
    const poolH = jarY + jarH - poolTopY - 2;
    const poolGrad = ctx.createLinearGradient(0, poolTopY, 0, poolTopY + poolH);
    poolGrad.addColorStop(0, "rgba(56, 189, 248, 0.42)");
    poolGrad.addColorStop(1, "rgba(6, 182, 212, 0.68)");
    ctx.fillStyle = poolGrad;
    ctx.fillRect(jarX + 2, poolTopY, jarW - 4, poolH);

    // Concave Meniscus Curve at Solvent Pool Surface
    ctx.strokeStyle = "rgba(224, 242, 254, 0.9)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(jarX + 2, poolTopY - 2);
    ctx.quadraticCurveTo(jarX + jarW / 2, poolTopY + 3, jarX + jarW - 2, poolTopY - 2);
    ctx.stroke();

    // 3D Silica Gel / C18 TLC Plate
    let plateGrad = ctx.createLinearGradient(plate.x, plate.y, plate.x + plate.w, plate.y + plate.h);
    if (lightMode === "uv254") {
      // Bright Neon Green F254 Zinc Silicate Phosphor Plate
      plateGrad.addColorStop(0, "#4ade80");
      plateGrad.addColorStop(0.5, "#22c55e");
      plateGrad.addColorStop(1, "#16a34a");
    } else if (lightMode === "uv365") {
      // Deep Dark Violet UV-365nm Excitation Background
      plateGrad.addColorStop(0, "#1e1b4b");
      plateGrad.addColorStop(1, "#0f172a");
    } else if (lightMode === "iodine") {
      // Warm Amber I2 Sublimation Tinted Silica
      plateGrad.addColorStop(0, "#fef3c7");
      plateGrad.addColorStop(1, "#fde68a");
    } else {
      // Crisp Matte White Silica Gel 60 / C18 Plate
      plateGrad.addColorStop(0, stationaryPhase === "silica" ? "#f8fafc" : "#e2e8f0");
      plateGrad.addColorStop(1, stationaryPhase === "silica" ? "#e2e8f0" : "#cbd5e1");
    }
    ctx.fillStyle = plateGrad;
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(plate.x, plate.y, plate.w, plate.h, 3);
    ctx.fill();
    ctx.stroke();

    // Wetted Capillary Solvent Front Shading on Plate
    const frontRisePx = plate.maxFrontRisePx * developmentProgress;
    const solventFrontY = plate.originY - frontRisePx;
    ctx.fillStyle = lightMode === "uv254"
      ? "rgba(21, 128, 61, 0.25)"
      : (lightMode === "uv365" ? "rgba(56, 189, 248, 0.08)" : "rgba(14, 165, 233, 0.12)");
    ctx.fillRect(plate.x + 1, solventFrontY, plate.w - 2, plate.y + plate.h - solventFrontY - 1);

    // Dashed Solvent Front Line (z_f)
    ctx.strokeStyle = lightMode === "uv365" ? "#38bdf8" : "#0284c7";
    ctx.lineWidth = 1.6;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(plate.x + 4, solventFrontY);
    ctx.lineTo(plate.x + plate.w - 4, solventFrontY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = lightMode === "uv365" ? "#38bdf8" : "#0369a1";
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText(`Front ${(plateLengthMm * developmentProgress).toFixed(0)}mm`, plate.x + plate.w - 6, solventFrontY - 4);

    // Graphite Pencil Baseline (Origin Line = 0.0 mm)
    ctx.strokeStyle = lightMode === "uv365" ? "#94a3b8" : "#334155";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(plate.x + 6, plate.originY);
    ctx.lineTo(plate.x + plate.w - 6, plate.originY);
    ctx.stroke();

    // Origin Crosshair Tick & Label
    const centerLaneX = plate.x + plate.w * 0.44;
    ctx.fillStyle = lightMode === "uv365" ? "#94a3b8" : "#475569";
    ctx.font = "bold 8.5px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText("Origin (Pencil)", plate.x + 6, plate.originY + 11);

    // Render Eluted Analyte Spots with Radial Diffusion Gradients
    comps.forEach((comp, idx) => {
      const rf = computeCompoundRf(comp);
      const spotY = plate.originY - frontRisePx * rf;
      const isSelected = idx === selectedCompoundIndex;
      const spotColor = getSpotRenderColor(comp);

      // Spot lateral & vertical diffusion grows slightly with migration distance
      const rx = 12 + rf * 4 * developmentProgress;
      const ry = 6.5 + rf * 3 * developmentProgress;

      // UV-365nm Fluorescence Halo
      if (lightMode === "uv365") {
        const halo = ctx.createRadialGradient(centerLaneX, spotY, 1, centerLaneX, spotY, rx * 2.1);
        halo.addColorStop(0, spotColor);
        halo.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.ellipse(centerLaneX, spotY, rx * 2.1, ry * 2.1, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Main Chromatographic Spot
      ctx.fillStyle = spotColor;
      ctx.beginPath();
      ctx.ellipse(centerLaneX, spotY, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();

      // Laser Densitometer Scan Reticle on Selected Spot
      if (isSelected) {
        ctx.strokeStyle = lightMode === "uv254" ? "#0f172a" : "#06b6d4";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(centerLaneX, spotY, rx + 4, ry + 3.5, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Laser Scanning Beam across Plate
        ctx.strokeStyle = "rgba(244, 63, 94, 0.65)";
        ctx.lineWidth = 1.2;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(plate.x + 4, spotY);
        ctx.lineTo(plate.x + plate.w - 4, spotY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Crisp Spot Callout Label on Right Side of Plate
      ctx.fillStyle = lightMode === "uv365" ? "#f8fafc" : "#0f172a";
      ctx.font = `${isSelected ? "bold " : ""}8.5px 'JetBrains Mono', monospace`;
      ctx.textAlign = "left";
      ctx.fillText(`${comp.shortName} (${rf.toFixed(2)})`, centerLaneX + rx + 5, spotY + 3);
    });

    // Digital Millimeter Ruler & Caliper along Left Edge of Plate
    if (caliperActive) {
      const rulerX = plate.x + 12;
      ctx.strokeStyle = lightMode === "uv365" ? "rgba(148, 163, 184, 0.65)" : "rgba(51, 65, 85, 0.65)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rulerX, plate.originY);
      ctx.lineTo(rulerX, plate.originY - plate.maxFrontRisePx);
      ctx.stroke();

      for (let mm = 0; mm <= 80; mm += 20) {
        const ty = plate.originY - (mm / 80) * plate.maxFrontRisePx;
        ctx.beginPath();
        ctx.moveTo(rulerX - 3, ty);
        ctx.lineTo(rulerX + 3, ty);
        ctx.stroke();
      }
    }

    // Specular Glass Reflection Streak on Jar
    const glassStreak = ctx.createLinearGradient(jarX + 5, jarY, jarX + 18, jarY);
    glassStreak.addColorStop(0, "rgba(255, 255, 255, 0.14)");
    glassStreak.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = glassStreak;
    ctx.fillRect(jarX + 5, jarY + 8, 12, jarH - 16);
    ctx.restore();

    // =========================================================================
    // STATION 2: FLASH SILICA COLUMN & 6-TUBE FRACTION COLLECTOR RACK
    // =========================================================================
    ctx.save();
    ctx.fillStyle = "rgba(9, 15, 30, 0.78)";
    ctx.strokeStyle = "rgba(16, 185, 129, 0.28)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(colBox.x, colBox.y, colBox.w, colBox.h, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#34d399";
    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText("② FLASH COLUMN ELUTION", colBox.x + 12, colBox.y + 20);

    const cx = colBox.x + Math.round(colBox.w * 0.5);
    const colW = 46;
    const colX = cx - colW / 2;
    const colY = colBox.y + 72;
    const colH = colBox.h - 210;

    // Top Solvent Reservoir Bulb & Pressure Adapter
    ctx.fillStyle = "rgba(56, 189, 248, 0.22)";
    ctx.strokeStyle = "rgba(186, 230, 253, 0.75)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(cx, colY - 18, 32, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Ground-Glass Joint Collar
    ctx.fillStyle = "rgba(148, 163, 184, 0.45)";
    ctx.fillRect(colX - 3, colY - 4, colW + 6, 8);

    // Cylindrical Glass Column Body
    ctx.fillStyle = "rgba(15, 23, 42, 0.6)";
    ctx.strokeStyle = "rgba(186, 230, 253, 0.75)";
    ctx.lineWidth = 2;
    ctx.fillRect(colX, colY, colW, colH);
    ctx.strokeRect(colX, colY, colW, colH);

    // Mobile Phase Eluent Head Layer above Silica Bed
    const eluentHeadH = 34;
    ctx.fillStyle = "rgba(56, 189, 248, 0.35)";
    ctx.fillRect(colX + 2, colY + 2, colW - 4, eluentHeadH);

    // Packed Silica Gel / C18 Stationary Phase Bed
    const bedY = colY + eluentHeadH + 2;
    const bedH = colH - eluentHeadH - 14;
    const bedGrad = ctx.createLinearGradient(colX, 0, colX + colW, 0);
    if (stationaryPhase === "silica") {
      bedGrad.addColorStop(0, "#e2e8f0");
      bedGrad.addColorStop(0.5, "#f8fafc");
      bedGrad.addColorStop(1, "#cbd5e1");
    } else {
      bedGrad.addColorStop(0, "#94a3b8");
      bedGrad.addColorStop(0.5, "#cbd5e1");
      bedGrad.addColorStop(1, "#64748b");
    }
    ctx.fillStyle = bedGrad;
    ctx.fillRect(colX + 2, bedY, colW - 4, bedH);

    // Descending Chromatographic Bands inside Packed Column
    // High Rf compounds travel down fastest toward the stopcock!
    comps.forEach((comp, idx) => {
      const rf = computeCompoundRf(comp);
      const bandProgress = Math.min(0.96, rf * developmentProgress * 1.04);
      const bandCenterY = bedY + 12 + bandProgress * (bedH - 22);
      const bandThickness = 11 + rf * 5;
      const bandColor = comp.visColor.startsWith("rgba") ? "#818cf8" : comp.visColor;

      const bGrad = ctx.createLinearGradient(0, bandCenterY - bandThickness / 2, 0, bandCenterY + bandThickness / 2);
      bGrad.addColorStop(0, "rgba(0,0,0,0)");
      bGrad.addColorStop(0.5, bandColor);
      bGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bGrad;
      ctx.fillRect(colX + 2, bandCenterY - bandThickness / 2, colW - 4, bandThickness);

      if (idx === selectedCompoundIndex) {
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(colX + 2, bandCenterY - bandThickness / 2, colW - 4, bandThickness);
      }

      // Band Tag Label next to Column
      ctx.fillStyle = bandColor;
      ctx.font = "bold 8.5px 'JetBrains Mono', monospace";
      ctx.textAlign = idx % 2 === 0 ? "left" : "right";
      const labelX = idx % 2 === 0 ? colX + colW + 6 : colX - 6;
      ctx.fillText(comp.shortName, labelX, bandCenterY + 3);
    });

    // Porous Fritted Glass Disc & Cotton Plug at Bottom of Column
    ctx.fillStyle = "#64748b";
    ctx.fillRect(colX + 2, bedY + bedH, colW - 4, 10);

    // Tapered Glass Tip & PTFE Stopcock Valve
    const tipBottomY = colY + colH + 30;
    ctx.fillStyle = "rgba(186, 230, 253, 0.35)";
    ctx.strokeStyle = "rgba(186, 230, 253, 0.75)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(colX, colY + colH);
    ctx.lineTo(cx - 4, tipBottomY);
    ctx.lineTo(cx + 4, tipBottomY);
    ctx.lineTo(colX + colW, colY + colH);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Blue PTFE Stopcock Handle
    ctx.fillStyle = "#0284c7";
    ctx.beginPath();
    ctx.roundRect(cx - 18, colY + colH + 10, 36, 7, 3);
    ctx.fill();

    // Specular Glass Reflection on Column
    ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
    ctx.fillRect(colX + 5, colY + 4, 5, colH - 8);

    // Falling Eluate Droplet into Active Fraction Tube
    const selComp = comps[selectedCompoundIndex];
    const dropColor = selComp.visColor.startsWith("rgba") ? "#38bdf8" : selComp.visColor;
    const dropOffset = ((timeTick * (isDeveloping ? 4.5 : 1.5)) % 1.0) * 32;
    ctx.fillStyle = dropColor;
    ctx.beginPath();
    ctx.arc(cx, tipBottomY + 6 + dropOffset, 3.8, 0, Math.PI * 2);
    ctx.fill();

    // 6-Tube Fraction Collector Rack at Bottom of Station 2
    const rackW = Math.min(184, colBox.w - 24);
    const rackX = cx - rackW / 2;
    const rackY = colBox.y + colBox.h - 76;
    const rackH = 62;

    // Metallic Tube Rack Frame
    ctx.fillStyle = "rgba(30, 41, 59, 0.85)";
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(rackX, rackY + 18, rackW, rackH - 18, 6);
    ctx.fill();
    ctx.stroke();

    // 5 Borosilicate Fraction Tubes (1 per compound + solvent blank)
    const numTubes = Math.min(5, comps.length);
    const tubeSpacing = rackW / (numTubes + 0.5);
    comps.slice(0, numTubes).forEach((c, tIdx) => {
      const tx = rackX + tubeSpacing * (tIdx + 0.75) - 9;
      const ty = rackY;
      const tw = 18;
      const th = 54;
      const fillH = Math.max(8, Math.min(34, 12 + computeCompoundRf(c) * developmentProgress * 24));
      const tColor = c.visColor.startsWith("rgba") ? "rgba(56, 189, 248, 0.55)" : c.visColor;

      // Collected Liquid Fraction inside Tube
      ctx.fillStyle = tColor;
      ctx.beginPath();
      ctx.roundRect(tx + 2, ty + th - fillH - 2, tw - 4, fillH, 5);
      ctx.fill();

      // Glass Test Tube Outline
      ctx.strokeStyle = tIdx === selectedCompoundIndex ? "#22d3ee" : "rgba(203, 213, 225, 0.65)";
      ctx.lineWidth = tIdx === selectedCompoundIndex ? 2 : 1.2;
      ctx.beginPath();
      ctx.roundRect(tx, ty, tw, th, [2, 2, 8, 8]);
      ctx.stroke();

      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 8px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(`F${tIdx + 1}`, tx + tw / 2, ty + th + 10);
    });
    ctx.restore();

    // =========================================================================
    // STATION 3: DUAL-CHANNEL HPLC DIODE-ARRAY CHROMATOGRAM & DENSITOGRAM
    // =========================================================================
    ctx.save();
    ctx.fillStyle = "rgba(9, 15, 30, 0.78)";
    ctx.strokeStyle = "rgba(168, 85, 247, 0.28)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(hplcBox.x, hplcBox.y, hplcBox.w, hplcBox.h, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#c084fc";
    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText("③ HPLC UV-VIS DIODE-ARRAY CHROMATOGRAM", hplcBox.x + 12, hplcBox.y + 20);

    // Top Plot: HPLC Absorbance (mAU) vs Retention Time t_R (0 - 15 min)
    const p1X = hplcBox.x + 38;
    const p1Y = hplcBox.y + 38;
    const p1W = hplcBox.w - 52;
    const p1H = Math.round((hplcBox.h - 96) * 0.56);

    ctx.fillStyle = "#020617";
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(p1X, p1Y, p1W, p1H, 8);
    ctx.fill();
    ctx.stroke();

    // Oscilloscope Grid Lines
    ctx.strokeStyle = "rgba(51, 65, 85, 0.4)";
    ctx.lineWidth = 1;
    for (let t = 0; t <= 15; t += 3) {
      const gx = p1X + (t / 15) * p1W;
      ctx.beginPath();
      ctx.moveTo(gx, p1Y);
      ctx.lineTo(gx, p1Y + p1H);
      ctx.stroke();

      ctx.fillStyle = "#64748b";
      ctx.font = "8.5px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${t}m`, gx, p1Y + p1H + 12);
    }

    const baseLineY = p1Y + p1H - 22;

    // Solvent Front Injection Spike at Dead Time t_0 = 1.20 min
    const t0X = p1X + (1.20 / 15) * p1W;
    ctx.strokeStyle = "rgba(148, 163, 184, 0.45)";
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(t0X, p1Y + 8);
    ctx.lineTo(t0X, baseLineY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#64748b";
    ctx.font = "8px 'JetBrains Mono', monospace";
    ctx.fillText("t₀", t0X, p1Y + 16);

    // Individual Shaded Gaussian Peaks for Each Compound
    const peakData = comps.map((c, idx) => ({
      comp: c,
      idx,
      tr: computeRetentionTime(c),
      rf: computeCompoundRf(c),
      sigma: 0.24 + (1 - computeCompoundRf(c)) * 0.14,
      height: (p1H - 52) * (0.68 + 0.26 * Math.sin(idx * 1.4 + 0.8))
    }));

    peakData.forEach(pk => {
      const pColor = pk.comp.visColor.startsWith("rgba") ? "#a855f7" : pk.comp.visColor;
      const pkGrad = ctx.createLinearGradient(0, baseLineY - pk.height, 0, baseLineY);
      pkGrad.addColorStop(0, pColor);
      pkGrad.addColorStop(1, "rgba(2, 6, 23, 0.0)");

      ctx.fillStyle = pkGrad;
      ctx.beginPath();
      ctx.moveTo(p1X, baseLineY);
      for (let px = 0; px <= p1W; px += 3) {
        const t = (px / p1W) * 15.0;
        const yVal = pk.height * Math.exp(-0.5 * Math.pow((t - pk.tr) / pk.sigma, 2));
        ctx.lineTo(p1X + px, baseLineY - yVal);
      }
      ctx.lineTo(p1X + p1W, baseLineY);
      ctx.closePath();
      ctx.fill();
    });

    // Composite HPLC Detector Trace
    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let px = 0; px <= p1W; px += 2) {
      const t = (px / p1W) * 15.0;
      // Small injection disturbance at t0 = 1.2m
      let sumY = 14 * Math.exp(-0.5 * Math.pow((t - 1.2) / 0.08, 2));
      peakData.forEach(pk => {
        sumY += pk.height * Math.exp(-0.5 * Math.pow((t - pk.tr) / pk.sigma, 2));
      });
      const py = Math.max(p1Y + 8, baseLineY - sumY);
      if (px === 0) ctx.moveTo(p1X + px, py);
      else ctx.lineTo(p1X + px, py);
    }
    ctx.stroke();

    // Peak Apex Labels & Selected Peak Marker
    peakData.forEach(pk => {
      const apexX = p1X + (pk.tr / 15.0) * p1W;
      const apexY = Math.max(p1Y + 16, baseLineY - pk.height);
      const isSel = pk.idx === selectedCompoundIndex;
      const pColor = pk.comp.visColor.startsWith("rgba") ? "#c084fc" : pk.comp.visColor;

      ctx.fillStyle = isSel ? "#ffffff" : pColor;
      ctx.beginPath();
      ctx.arc(apexX, apexY, isSel ? 4.5 : 3, 0, Math.PI * 2);
      ctx.fill();

      if (isSel) {
        ctx.fillStyle = "#22d3ee";
        ctx.font = "bold 9px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText(`${pk.comp.shortName} (${pk.tr.toFixed(1)}m)`, Math.min(p1X + p1W - 38, Math.max(p1X + 38, apexX)), apexY - 8);
      }
    });

    // Bottom Sub-Panel inside Station 3: Live Selected Analyte Partitioning Card & Theoretical Plates (N)
    const p2X = hplcBox.x + 14;
    const p2Y = p1Y + p1H + 26;
    const p2W = hplcBox.w - 28;
    const p2H = hplcBox.y + hplcBox.h - p2Y - 12;

    ctx.fillStyle = "rgba(2, 6, 23, 0.85)";
    ctx.strokeStyle = "rgba(6, 182, 212, 0.35)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(p2X, p2Y, p2W, p2H, 10);
    ctx.fill();
    ctx.stroke();

    const selResult = peakData[selectedCompoundIndex] || peakData[0];
    const kPrime = ((1 - selResult.rf) / Math.max(0.08, selResult.rf)).toFixed(2);
    const theoreticalPlates = Math.round(16 * Math.pow(selResult.tr / (4 * selResult.sigma), 2));

    ctx.fillStyle = "#22d3ee";
    ctx.font = "bold 10px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText(`LASER DENSITOMETER LOCK: ${selResult.comp.name.toUpperCase()}`, p2X + 12, p2Y + 18);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "9.5px 'JetBrains Mono', monospace";
    ctx.fillText(`Formula: ${selResult.comp.formula} (${selResult.comp.mw} g/mol) • λmax: ${selResult.comp.lambdaMax}`, p2X + 12, p2Y + 35);
    ctx.fillText(`Retention Factor Rf = ${selResult.rf.toFixed(2)} • Capacity k' = ${kPrime} • Plates N = ${theoreticalPlates}`, p2X + 12, p2Y + 51);

    // Visual Partition Equilibrium Bar (Adsorbed on Stationary vs Flowing in Mobile Phase)
    const barX = p2X + 12;
    const barY = p2Y + 64;
    const barW = p2W - 24;
    const barH = 14;
    const mobileFraction = selResult.rf;

    ctx.fillStyle = "rgba(30, 41, 59, 0.9)";
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 7);
    ctx.fill();

    const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    barGrad.addColorStop(0, "#06b6d4");
    barGrad.addColorStop(mobileFraction, "#10b981");
    barGrad.addColorStop(mobileFraction, "#6366f1");
    barGrad.addColorStop(1, "#a855f7");
    ctx.fillStyle = barGrad;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 7);
    ctx.fill();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "8.5px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText(`Mobile Phase: ${(mobileFraction * 100).toFixed(0)}%`, barX, barY + barH + 13);
    ctx.textAlign = "right";
    ctx.fillText(`Stationary Phase Adsorbed: ${((1 - mobileFraction) * 100).toFixed(0)}%`, barX + barW, barY + barH + 13);

    ctx.restore();
  }

  // =========================================================================
  // MICROSCOPIC Si-OH / C18 MOLECULAR PARTITIONING VIEW
  // =========================================================================
  function renderMolecularPartitionView(ctx, W, H) {
    const mixture = SAMPLE_MIXTURES[currentMixtureKey];
    const comps = mixture.compounds;
    const pad = 22;

    ctx.save();
    ctx.fillStyle = "rgba(9, 15, 30, 0.85)";
    ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(pad, 16, W - pad * 2, H - 32, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#22d3ee";
    ctx.font = "bold 12px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      stationaryPhase === "silica"
        ? "ATOMIC FORCE VIEW: POLAR SILANOL (Si-OH) HYDROGEN-BOND ADSORPTION VS MOBILE PHASE FLOW"
        : "ATOMIC FORCE VIEW: NONPOLAR OCTADECYL (C₁₈) VAN DER WAALS RETENTION VS POLAR ELUENT",
      pad + 18,
      40
    );

    // Left Adsorbent Wall (Silica Gel SiO2 Matrix)
    const wallX = pad + 18;
    const wallY = 58;
    const wallW = 148;
    const wallH = H - 88;

    const wallGrad = ctx.createLinearGradient(wallX, 0, wallX + wallW, 0);
    wallGrad.addColorStop(0, "#1e293b");
    wallGrad.addColorStop(1, "#334155");
    ctx.fillStyle = wallGrad;
    ctx.beginPath();
    ctx.roundRect(wallX, wallY, wallW, wallH, 10);
    ctx.fill();

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(stationaryPhase === "silica" ? "SILICA GEL (SiO₂)" : "C₁₈ BONDED SILICA", wallX + wallW / 2, wallY + 26);

    // Draw Surface Functional Groups (-Si-OH or -C18H37 chains)
    const numSites = 8;
    const siteStep = (wallH - 56) / numSites;
    for (let i = 0; i < numSites; i++) {
      const sy = wallY + 48 + i * siteStep;
      ctx.strokeStyle = stationaryPhase === "silica" ? "#38bdf8" : "#fbbf24";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(wallX + wallW, sy);
      if (stationaryPhase === "silica") {
        ctx.lineTo(wallX + wallW + 24, sy);
        ctx.stroke();
        ctx.fillStyle = "#0ea5e9";
        ctx.font = "bold 10px 'JetBrains Mono', monospace";
        ctx.textAlign = "left";
        ctx.fillText("-Si-O-H", wallX + wallW + 28, sy + 4);
      } else {
        // Zig-zag C18 hydrocarbon chain
        for (let z = 1; z <= 5; z++) {
          ctx.lineTo(wallX + wallW + z * 11, sy + (z % 2 === 0 ? -5 : 5));
        }
        ctx.stroke();
        ctx.fillStyle = "#fbbf24";
        ctx.font = "bold 9.5px 'JetBrains Mono', monospace";
        ctx.textAlign = "left";
        ctx.fillText("-C₁₈H₃₇", wallX + wallW + 60, sy + 4);
      }
    }

    // Flowing Mobile Phase Solvent Channel on the Right
    const chanX = wallX + wallW + 100;
    const chanW = W - chanX - pad - 24;

    // Animated Upward Solvent Streamlines
    ctx.strokeStyle = "rgba(34, 211, 238, 0.14)";
    ctx.lineWidth = 1.5;
    for (let s = 0; s < 7; s++) {
      const sx = chanX + (s + 0.5) * (chanW / 7);
      const offset = ((timeTick * 48 + s * 35) % wallH);
      ctx.beginPath();
      ctx.moveTo(sx, wallY + wallH - offset);
      ctx.lineTo(sx, Math.max(wallY, wallY + wallH - offset - 55));
      ctx.stroke();
    }

    // Render 3D Ball-and-Stick Solute Molecules Partitioning between Stationary Surface & Mobile Stream
    comps.forEach((comp, idx) => {
      const rf = computeCompoundRf(comp);
      // Low Rf stays close to surface (left); High Rf moves into fast mobile stream (right)
      const baseX = chanX + rf * (chanW - 95);
      const oscX = Math.sin(timeTick * 2.2 + idx * 1.5) * 10;
      const molX = baseX + oscX;
      const molY = wallY + wallH - 45 - ((rf * 0.78 + 0.12) * (wallH - 95));
      const color = comp.visColor.startsWith("rgba") ? "#a855f7" : comp.visColor;

      // Dashed H-Bond / Van der Waals tethers to surface when Rf < 0.68
      if (rf < 0.68) {
        ctx.strokeStyle = stationaryPhase === "silica" ? "rgba(56, 189, 248, 0.7)" : "rgba(251, 191, 36, 0.7)";
        ctx.lineWidth = 1.8;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(wallX + wallW + 82, molY);
        ctx.lineTo(molX - 20, molY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 3D Molecular Cluster (Central Ring + Peripheral Functional Group Atoms)
      const grad = ctx.createRadialGradient(molX - 5, molY - 5, 2, molX, molY, 20);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.35, color);
      grad.addColorStop(1, "#020617");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(molX, molY, 18, 0, Math.PI * 2);
      ctx.fill();

      // Satellite atoms
      for (let a = 0; a < 3; a++) {
        const ang = timeTick * 0.9 + idx + a * ((Math.PI * 2) / 3);
        const ax = molX + Math.cos(ang) * 20;
        const ay = molY + Math.sin(ang) * 12;
        ctx.fillStyle = a === 0 ? "#ef4444" : "#38bdf8";
        ctx.beginPath();
        ctx.arc(ax, ay, 5.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Molecule Info Tag
      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 11px 'JetBrains Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillText(`${comp.name} (Rf = ${rf.toFixed(2)})`, molX + 28, molY - 2);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "9.5px 'JetBrains Mono', monospace";
      ctx.fillText(`${comp.imfType} • v_mig = ${(rf * 100).toFixed(0)}% v_solvent`, molX + 28, molY + 13);
    });

    ctx.restore();
  }

  // Record Trial, Lab Dossier & CSV Export
  function getTrialSnapshot() {
    const mixture = SAMPLE_MIXTURES[currentMixtureKey];
    const selComp = mixture.compounds[selectedCompoundIndex] || mixture.compounds[0];
    const rf = computeCompoundRf(selComp);
    const dSolvent = plateLengthMm * developmentProgress;
    const dSpot = dSolvent * rf;
    const tr = computeRetentionTime(selComp);
    const rs = computeAverageResolution();

    return {
      "Mixture": mixture.name,
      "Analyte": selComp.name,
      "Formula": selComp.formula,
      "Stationary Phase": stationaryPhase === "silica" ? "Normal-Phase SiO2" : "Reversed-Phase C18",
      "Ethyl Acetate (%)": ethylAcetatePct,
      "Light Mode": lightMode.toUpperCase(),
      "d_solvent (mm)": dSolvent.toFixed(1),
      "d_substance (mm)": dSpot.toFixed(1),
      "Retention Factor (Rf)": rf.toFixed(3),
      "Column t_R (min)": tr.toFixed(2),
      "Resolution (Rs)": rs.toFixed(2)
    };
  }

  btnRecord?.addEventListener("click", () => {
    const snap = getTrialSnapshot();
    LabTrialStore.addTrial("chromatography", snap);
    SoundFX.success?.() || SoundFX.playBeep?.();
  });

  btnReport?.addEventListener("click", () => {
    const snap = getTrialSnapshot();
    openLabReportModal({
      labId: "chromatography",
      labTitle: "Thin-Layer (TLC), Flash Column & HPLC Chromatography",
      moduleCode: "CHEM-M02 / CHEM-M13",
      currentRow: snap
    });
  });

  function triggerCsvExport() {
    const mixture = SAMPLE_MIXTURES[currentMixtureKey];
    const dSolvent = plateLengthMm * developmentProgress;
    const rows = mixture.compounds.map(c => {
      const rf = computeCompoundRf(c);
      return {
        "Mixture": mixture.name,
        "Compound": c.name,
        "Formula": c.formula,
        "Stationary Phase": stationaryPhase === "silica" ? "Silica Gel SiO2" : "Reversed-Phase C18",
        "Ethyl Acetate (%)": ethylAcetatePct,
        "d_solvent (mm)": dSolvent.toFixed(1),
        "d_spot (mm)": (dSolvent * rf).toFixed(1),
        "Rf": rf.toFixed(3),
        "Column t_R (min)": computeRetentionTime(c).toFixed(2),
        "Dominant IMF": c.imfType
      };
    });

    exportLabDataCsv({
      labTitle: "TLC, Column & HPLC Chromatography",
      moduleCode: "CHEM-M02",
      headers: Object.keys(rows[0]),
      rows
    });
  }

  btnExport?.addEventListener("click", triggerCsvExport);

  function handleKeyDown(e) {
    if (!container || !container.isConnected) return;
    const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
    if (tag === "input" || tag === "textarea" || tag === "select" || e.target?.isContentEditable) return;
    if (e.key === "e" || e.key === "E") {
      e.preventDefault();
      triggerCsvExport();
    }
  }
  window.addEventListener("keydown", handleKeyDown);

  updateHUD();
  animId = requestAnimationFrame(renderChromatographyCanvas);

  return function cleanupChromatographyLab() {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("resize", syncCanvasSize);
  };
}
