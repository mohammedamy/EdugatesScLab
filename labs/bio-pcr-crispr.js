// Edugates-ClipSAT Science Labs - Biology: PCR Thermal Cycler, Real-Time qPCR & CRISPR-Cas9 Gene Editing Suite
// Ultra-HD 60 FPS Molecular Genetics & Biotechnology Workbench:
// - Aspect-correct responsive HiDPI Canvas (zero stretching, dynamic getBoundingClientRect() projection)
// - 3D Helical DNA Denaturation (95°C), Primer Hybridization (Ta), and Bilobed Taq Polymerase Synthesis (72°C) with dNTP capture
// - Dual-Screen Peltier Thermal Cycling Staircase (T vs Time) & Real-Time SYBR Green qPCR Amplification Curve (ΔRn vs Cycle Ct)
// - 3D Bilobed CRISPR-SpCas9 Ribonucleoprotein (REC + HNH/RuvC/PI lobes), 20-nt sgRNA R-Loop + tracrRNA hairpins, 5'-NGG-3' PAM, and HDR vs NHEJ Repair

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initPcrCrisprLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return () => {};

  // Target Human Genomic Loci for PCR & CRISPR-Cas9 Editing
  const GENOMIC_LOCI = {
    hbb: {
      id: "hbb",
      name: "HBB β-Globin Locus (Sickle Cell Glu6Val GAG→GTG)",
      geneSymbol: "HBB (Chr 11p15.4)",
      ampliconBp: 420,
      optimalTm: 58,
      nonTarget5to3: "5'-CTGACTCCTGAGGAGAAGTCTGCCGTTACT-3'",
      target3to5:    "3'-GACTGAGGACTCCTCTTCAGACGGCAATGA-5'",
      sgRnaSpacer:   "5'-CUGACUCCUGAGGAGAAGUC-3'",
      pamSequence:   "AGG",
      pamMotif:      "5'-AGG-3' (Canonical SpCas9 NGG PAM)",
      cutSiteBp:     "3 bp upstream of PAM (Codon 6 β-globin)",
      hdrOutcome:    "HDR Precision Repair: Restores wild-type GAG (Glutamate) codon → Normal HbA Adult Hemoglobin",
      nhejOutcome:   "NHEJ Indel Frameshift: ±1–4 bp insertion/deletion → Premature stop codon (β⁰-thalassemia knockout)"
    },
    ccr5: {
      id: "ccr5",
      name: "CCR5 Chemokine Receptor (HIV-1 Resistance Δ32 Locus)",
      geneSymbol: "CCR5 (Chr 3p21.31)",
      ampliconBp: 512,
      optimalTm: 60,
      nonTarget5to3: "5'-ACAGTCAGTATCAATTCTGGAAGAATTTCC-3'",
      target3to5:    "3'-TGTCAGTCATAGTTAAGACCTTCTTAAAGG-5'",
      sgRnaSpacer:   "5'-ACAGUCAGUAUCAAUUCUGG-3'",
      pamSequence:   "AAG",
      pamMotif:      "5'-TGG-3' / 5'-AGG-3' PAM",
      cutSiteBp:     "3 bp upstream of PAM (Transmembrane Domain 4)",
      hdrOutcome:    "HDR Δ32 Insertion: Introduces protective 32-bp deletion allele → CD4+ T-cell HIV-1 co-receptor immunity",
      nhejOutcome:   "NHEJ Receptor Knockout: Biallelic frameshift truncates CCR5 surface expression on T-lymphocytes"
    },
    brca1: {
      id: "brca1",
      name: "BRCA1 Exon 11 Locus (Homologous Recombination Repair)",
      geneSymbol: "BRCA1 (Chr 17q21.31)",
      ampliconBp: 380,
      optimalTm: 56,
      nonTarget5to3: "5'-GCTauernGCGATCGATGCGTACGTAGCTAGG-3'".replace("auern", "AGT"),
      target3to5:    "3'-CGATCACGCTAGCTACGCATGCATCGATCC-5'",
      sgRnaSpacer:   "5'-GCUAGUGCGAUCGAUGCGUA-3'",
      pamSequence:   "AGG",
      pamMotif:      "5'-AGG-3' (Canonical SpCas9 NGG PAM)",
      cutSiteBp:     "3 bp upstream of PAM (RING-finger domain)",
      hdrOutcome:    "HDR Wild-Type Restoration: Repairs pathogenic frameshift back to functional BRCA1 tumor suppressor",
      nhejOutcome:   "NHEJ Loss-of-Function: Indel disrupts BRCA1 DNA double-strand break repair complex"
    }
  };

  // 3-Step Thermal Cycling Protocol Stages
  const PCR_STAGES = [
    {
      id: "denature",
      name: "1. Denaturation (95°C)",
      shortName: "Denaturation",
      tempC: 95,
      durationSec: 30,
      color: "#ef4444",
      mechanism: "Thermal agitation at 95°C overcomes base-stacking and breaks 2 H-bonds (A=T) and 3 H-bonds (G≡C), unzipping the dsDNA double helix into two single-stranded templates."
    },
    {
      id: "anneal",
      name: "2. Primer Annealing (58°C)",
      shortName: "Annealing",
      tempC: 58,
      durationSec: 30,
      color: "#38bdf8",
      mechanism: "Cooling to T_a (54–62°C) enables synthetic 20-nt Forward and Reverse oligonucleotide primers to hybridize specifically to complementary 3' flanking template regions."
    },
    {
      id: "extend",
      name: "3. Taq Extension (72°C)",
      shortName: "Taq Extension",
      tempC: 72,
      durationSec: 45,
      color: "#10b981",
      mechanism: "Thermostable Taq DNA Polymerase (from Thermus aquaticus) binds the 3'-OH primer terminus with Mg²⁺ cofactors and synthesizes new DNA strands in the 5' → 3' direction at ~60 nt/s."
    }
  ];

  // Simulation State
  let currentLocusKey = "hbb";
  let workbenchMode = "pcr"; // "pcr" | "crispr"
  let currentCycle = 25; // n = 1 to 35
  let initialTemplateN0 = 100;
  let annealTempC = 58;
  let currentStageIndex = 2; // Default 72°C Taq Extension so user sees active synthesis immediately
  let isAutoCycling = false;
  let repairPathway = "hdr"; // "hdr" | "nhej"
  let cas9Cleaved = true;
  let animId = null;
  let timeTick = 0;
  let stageTimer = 0;

  // Floating free dNTP particles for visual synthesis
  const dntpParticles = Array.from({ length: 18 }, (_, i) => ({
    base: ["A", "T", "G", "C"][i % 4],
    x: (i * 61) % 100,
    y: (i * 43) % 100,
    phase: i * 0.7
  }));

  // Compute Primer Annealing Efficiency E (0.0 to 0.99)
  function computeAmplificationEfficiency() {
    const optTm = GENOMIC_LOCI[currentLocusKey].optimalTm;
    const deltaT = Math.abs(annealTempC - optTm);
    const eff = 0.98 * Math.exp(-0.018 * deltaT * deltaT);
    return Math.max(0.25, Math.min(0.99, eff));
  }

  // Compute Amplicon Copy Number N(n) with realistic reagent depletion plateau above cycle 28
  function computeCopyYieldAtCycle(n) {
    const E = computeAmplificationEfficiency();
    let total = initialTemplateN0;
    const carryingCap = 4.8e11;
    for (let c = 1; c <= n; c++) {
      const satFactor = 1 / (1 + total / carryingCap);
      total = total * (1 + E * satFactor);
    }
    return Math.round(total);
  }

  // Compute SYBR Green Fluorescence ΔRn at Cycle c
  function computeFluorescenceRn(c) {
    const E = computeAmplificationEfficiency();
    const ctCenter = 18.5 + (0.98 - E) * 16;
    const maxRn = 4.6 * (0.65 + 0.35 * E);
    return maxRn / (1 + Math.exp(-0.46 * (c - ctCenter)));
  }

  // Compute Cycle Threshold Ct (where ΔRn crosses threshold = 0.50)
  function computeCtValue() {
    for (let c = 1; c <= 35; c += 0.1) {
      if (computeFluorescenceRn(c) >= 0.50) return c;
    }
    return 35.0;
  }

  function formatSciCopies(num) {
    if (num < 1e4) return num.toLocaleString();
    const exp = Math.floor(Math.log10(num));
    const mant = (num / Math.pow(10, exp)).toFixed(2);
    return `${mant} × 10^${exp}`;
  }

  container.innerHTML = `
    <div class="lab-container" style="display: flex; flex-direction: column; gap: 16px;">
      <style>
        .pcr-workbench-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.55fr) minmax(340px, 1fr);
          gap: 18px;
          align-items: stretch;
        }
        @media (max-width: 1120px) {
          .pcr-workbench-grid {
            grid-template-columns: 1fr;
          }
        }
        .pcr-telemetry-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          background: linear-gradient(180deg, rgba(6, 28, 22, 0.95) 0%, rgba(4, 15, 22, 0.98) 100%);
          border: 1px solid rgba(16, 185, 129, 0.35);
          border-radius: 12px;
          padding: 10px 14px;
          box-shadow: 0 10px 25px -10px rgba(0, 0, 0, 0.75);
        }
        @media (max-width: 768px) {
          .pcr-telemetry-strip {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .pcr-metric-card {
          background: rgba(2, 6, 23, 0.78);
          border: 1px solid rgba(51, 65, 85, 0.65);
          border-radius: 8px;
          padding: 7px 11px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .pcr-row-item {
          transition: background 0.15s ease;
        }
        .pcr-row-item:hover {
          background: rgba(16, 185, 129, 0.16) !important;
        }
        [data-theme="day"] .pcr-telemetry-strip {
          background: #ffffff !important;
          border: 1.5px solid #cbd5e1 !important;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05) !important;
        }
        [data-theme="day"] .pcr-metric-card {
          background: #f8fafc !important;
          border: 1.5px solid #cbd5e1 !important;
        }
        [data-theme="day"] .pcr-row-item:hover {
          background: #ecfdf5 !important;
        }
      </style>

      <!-- Top Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, rgba(6, 32, 26, 0.96) 0%, rgba(15, 23, 42, 0.96) 100%); border: 1px solid rgba(16, 185, 129, 0.42); border-radius: 14px; padding: 12px 18px; flex-wrap: wrap; gap: 12px; box-shadow: 0 12px 32px -12px rgba(0, 0, 0, 0.75);">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <div style="width: 38px; height: 38px; border-radius: 10px; background: radial-gradient(circle at 30% 30%, rgba(16, 185, 129, 0.4), rgba(15, 23, 42, 0.9)); border: 1px solid rgba(16, 185, 129, 0.55); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 18px rgba(16, 185, 129, 0.3);">
            <span style="font-size: 1.2rem;">🧬</span>
          </div>
          <div>
            <div style="font-size: 0.92rem; font-weight: 800; color: #f8fafc; letter-spacing: 0.01em; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span>PCR Thermal Cycler, Real-Time qPCR &amp; CRISPR-Cas9 Gene Editing</span>
              <span class="badge" style="background: rgba(16, 185, 129, 0.18); border: 1px solid rgba(16, 185, 129, 0.45); color: #34d399; font-size: 0.72rem; padding: 2px 9px; border-radius: 9999px;">
                ${renderLatex("N(n) = N_0 (1 + E)^n \\;\\bullet\\; 5'\\text{-NGG-}3'\\text{ PAM}")}
              </span>
            </div>
            <div style="font-size: 0.73rem; color: #94a3b8;">
              Inspire Biology M11/M12 • Peltier 3-Step Thermocycling, SYBR Green Ct Fluorometry &amp; SpCas9 R-Loop Cleavage
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(2, 6, 23, 0.75); border-radius: 9px; padding: 3px; border: 1px solid rgba(16, 185, 129, 0.32);">
            <button id="view-mode-pcr-sim" class="btn btn-secondary active" style="padding: 6px 12px; font-size: 0.76rem; font-weight: 700; border-radius: 6px; border: none; background: linear-gradient(135deg, #059669, #10b981); color: #fff; box-shadow: 0 2px 10px rgba(16, 185, 129, 0.35);">
              🌡️ PCR &amp; qPCR Cycler
            </button>
            <button id="view-mode-crispr-sim" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.76rem; font-weight: 600; border-radius: 6px; background: transparent; border: none; color: #cbd5e1;">
              ✂️ CRISPR-Cas9 Editor
            </button>
            <button id="view-mode-pcr-photo" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.76rem; font-weight: 600; border-radius: 6px; background: transparent; border: none; color: #cbd5e1;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-pcr-autocycle" style="padding: 6px 14px; font-size: 0.76rem; font-weight: 800; background: linear-gradient(135deg, #0284c7, #38bdf8); border: none; box-shadow: 0 4px 14px rgba(56, 189, 248, 0.35);">
            ▶ Auto-Cycle PCR
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-pcr-record" style="padding: 6px 11px; font-size: 0.75rem; border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;">
            📌 Record Trial
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-pcr-report" style="padding: 6px 11px; font-size: 0.75rem; border-color: rgba(168, 85, 247, 0.4); color: #c084fc;">
            📋 Lab Dossier
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-pcr-export" style="padding: 6px 11px; font-size: 0.75rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export CSV (E)
          </button>
        </div>
      </div>

      <!-- Dedicated Digital Telemetry Ribbon (Never overlaps Canvas!) -->
      <div class="pcr-telemetry-strip">
        <div class="pcr-metric-card" style="border-left: 3px solid #10b981;">
          <span style="font-size: 0.64rem; color: #94a3b8; text-transform: uppercase; font-family: var(--font-mono); letter-spacing: 0.04em;">PELTIER BLOCK &amp; STAGE</span>
          <div id="hud-pcr-stage" style="font-size: 0.95rem; font-weight: 800; color: #34d399; font-family: var(--font-mono); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            Cycle 25/35 • 72°C Taq Extension
          </div>
        </div>
        <div class="pcr-metric-card" style="border-left: 3px solid #38bdf8;">
          <span style="font-size: 0.64rem; color: #94a3b8; text-transform: uppercase; font-family: var(--font-mono); letter-spacing: 0.04em;">AMPLICON YIELD &amp; Ct THRESHOLD</span>
          <div id="hud-pcr-yield" style="font-size: 0.95rem; font-weight: 800; color: #38bdf8; font-family: var(--font-mono);">
            2.41 × 10^9 copies • Ct = 18.6
          </div>
        </div>
        <div class="pcr-metric-card" style="border-left: 3px solid #fbbf24;">
          <span style="font-size: 0.64rem; color: #94a3b8; text-transform: uppercase; font-family: var(--font-mono); letter-spacing: 0.04em;">TARGET HUMAN LOCUS</span>
          <div id="hud-pcr-locus" style="font-size: 0.92rem; font-weight: 800; color: #fbbf24; font-family: var(--font-mono);">
            HBB (Chr 11p15.4) • 420 bp
          </div>
        </div>
        <div class="pcr-metric-card" style="border-left: 3px solid #c084fc;">
          <span style="font-size: 0.64rem; color: #94a3b8; text-transform: uppercase; font-family: var(--font-mono); letter-spacing: 0.04em;">CRISPR PAM &amp; REPAIR PATHWAY</span>
          <div id="hud-pcr-crispr" style="font-size: 0.9rem; font-weight: 800; color: #e9d5ff; font-family: var(--font-mono);">
            5'-AGG-3' PAM • HDR Donor
          </div>
        </div>
      </div>

      <!-- Main Workbench Grid -->
      <div class="pcr-workbench-grid">
        <!-- Left Interactive 60 FPS Canvas & 4K Bench Viewport -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(16, 185, 129, 0.42); box-shadow: 0 24px 55px -15px rgba(0, 0, 0, 0.9), inset 0 0 40px rgba(16, 185, 129, 0.07); background: #020806; border-radius: 14px; overflow: hidden; min-height: 600px; display: flex; flex-direction: column;">
          <canvas id="pcr-canvas" width="920" height="600" style="width: 100%; height: 600px; display: block; cursor: pointer; flex: 1;"></canvas>

          <!-- 4K Real Laboratory Photograph Overlay -->
          <div id="pcr-crispr-photo-overlay" style="display: none; position: absolute; inset: 0; background: #020617; z-index: 10;">
            <picture>
              <source srcset="assets/labs/pcr_crispr_bench.webp" type="image/webp">
              <img src="assets/labs/pcr_crispr_bench.jpg" decoding="async" loading="lazy" alt="4K Real-Time qPCR Thermal Cycler, 96-Well Peltier Block &amp; CRISPR-Cas9 RNP Workbench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.96;">
            </picture>

            <div style="position: absolute; top: 16px; left: 16px; background: rgba(2, 6, 23, 0.88); backdrop-filter: blur(12px); border: 1px solid rgba(16, 185, 129, 0.5); border-radius: 999px; padding: 6px 14px; display: flex; align-items: center; gap: 8px; box-shadow: 0 8px 25px rgba(0,0,0,0.7);">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981;"></span>
              <span style="font-size: 0.74rem; font-weight: 800; color: #f8fafc; letter-spacing: 0.04em;">4K AUTHENTIC qPCR &amp; CRISPR-CAS9 BIOTECHNOLOGY BENCH</span>
            </div>

            <div style="position: absolute; bottom: 18px; left: 18px; right: 18px; background: rgba(9, 15, 30, 0.92); backdrop-filter: blur(16px); border: 1px solid rgba(16, 185, 129, 0.45); border-radius: 12px; padding: 14px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 14px 35px rgba(0,0,0,0.88);">
              <div>
                <div style="font-size: 0.66rem; color: #94a3b8; text-transform: uppercase; font-weight: 700;">Thermal Block Engine</div>
                <div style="color: #34d399; font-weight: 800; font-family: var(--font-mono); font-size: 0.86rem; margin-top: 2px;">96-Well Silver Peltier Block</div>
                <div style="font-size: 0.68rem; color: #cbd5e1; margin-top: 2px;">±0.1°C precision ramp (95°C → 58°C → 72°C)</div>
              </div>
              <div>
                <div style="font-size: 0.66rem; color: #94a3b8; text-transform: uppercase; font-weight: 700;">Polymerase &amp; Fluorophore</div>
                <div style="color: #38bdf8; font-weight: 800; font-family: var(--font-mono); font-size: 0.86rem; margin-top: 2px;">Thermostable Taq + SYBR Green I</div>
                <div style="font-size: 0.68rem; color: #cbd5e1; margin-top: 2px;">dsDNA minor-groove intercalation at 520 nm</div>
              </div>
              <div>
                <div style="font-size: 0.66rem; color: #94a3b8; text-transform: uppercase; font-weight: 700;">Endonuclease RNP Complex</div>
                <div style="color: #fbbf24; font-weight: 800; font-family: var(--font-mono); font-size: 0.86rem; margin-top: 2px;">SpCas9 + 20-nt sgRNA Chimera</div>
                <div style="font-size: 0.68rem; color: #cbd5e1; margin-top: 2px;">HNH/RuvC cleavage 3 bp upstream of 5'-NGG-3'</div>
              </div>
            </div>
          </div>

          <!-- Bottom Interactive Stage & Cleavage Bar -->
          <div style="background: rgba(6, 18, 15, 0.96); border-top: 1px solid rgba(51, 65, 85, 0.65); padding: 8px 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              <button class="btn btn-secondary btn-sm pcr-stage-btn" data-stage="0" style="font-size: 0.72rem; padding: 5px 10px;">
                🔥 1. Denature (95°C)
              </button>
              <button class="btn btn-secondary btn-sm pcr-stage-btn" data-stage="1" style="font-size: 0.72rem; padding: 5px 10px;">
                🧲 2. Anneal (${annealTempC}°C)
              </button>
              <button class="btn btn-secondary btn-sm pcr-stage-btn active" data-stage="2" style="font-size: 0.72rem; padding: 5px 10px; border-color: #10b981; background: rgba(16, 185, 129, 0.22); color: #fff; font-weight: 700;">
                ⚡ 3. Taq Extend (72°C)
              </button>
            </div>
            <div style="font-size: 0.71rem; color: #94a3b8; font-family: var(--font-mono);">
              💡 Switch between <strong>🌡️ PCR &amp; qPCR Cycler</strong> and <strong>✂️ CRISPR-Cas9 Editor</strong> above
            </div>
          </div>
        </div>

        <!-- Right Controls & Quantitative qPCR / CRISPR Telemetry Deck -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <!-- Genomic Target, Cycle Slider & Annealing Temp Controls -->
          <div style="background: linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(9, 14, 28, 0.95) 100%); border: 1px solid rgba(16, 185, 129, 0.32); border-radius: 14px; padding: 15px 16px; box-shadow: 0 12px 28px -12px rgba(0, 0, 0, 0.75);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div style="font-size: 0.75rem; font-weight: 800; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em;">
                1. Genomic Target &amp; Thermal Protocol
              </div>
              <span id="pcr-efficiency-badge" class="badge" style="background: rgba(16, 185, 129, 0.16); color: #34d399; font-size: 0.68rem; padding: 2px 8px; border-radius: 6px; font-family: var(--font-mono);">
                Efficiency E = 98.0%
              </span>
            </div>

            <!-- Target Gene Locus Selector -->
            <div class="control-group" style="margin-bottom: 11px;">
              <label for="pcr-locus-select" class="control-label" style="display: block; font-size: 0.74rem; color: #cbd5e1; font-weight: 700; margin-bottom: 4px;">
                Target Human Genomic Locus (Template DNA + sgRNA):
              </label>
              <select id="pcr-locus-select" aria-label="Select Genomic Target Locus" style="width: 100%; background: #020617; color: #f8fafc; border: 1px solid #334155; border-radius: 8px; padding: 8px 10px; font-size: 0.8rem; font-weight: 700;">
                <option value="hbb">🩸 HBB β-Globin Locus (Sickle Cell Glu6Val GAG→GTG Repair)</option>
                <option value="ccr5">🛡️ CCR5 Chemokine Receptor (HIV-1 Resistance Δ32 Knockout)</option>
                <option value="brca1">🧬 BRCA1 Exon 11 Locus (Hereditary Tumor Suppressor Restoration)</option>
              </select>
            </div>

            <!-- PCR Cycle Number Slider (n = 1 to 35) -->
            <div class="control-slider-group" style="margin-bottom: 11px; background: rgba(2, 6, 23, 0.6); border: 1px solid rgba(51, 65, 85, 0.6); border-radius: 10px; padding: 8px 12px;">
              <div class="slider-header" style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 3px;">
                <span style="color: #e2e8f0; font-weight: 700;">Thermal Cycle Number (n)</span>
                <span id="val-pcr-cycle" style="color: #38bdf8; font-family: var(--font-mono); font-weight: 800;">Cycle 25 / 35</span>
              </div>
              <input type="range" id="slider-pcr-cycle" min="1" max="35" step="1" value="25" style="width: 100%; accent-color: #10b981;">
            </div>

            <!-- Primer Annealing Temperature Slider (Ta = 48 to 70 °C) -->
            <div class="control-slider-group" style="margin-bottom: 11px; background: rgba(2, 6, 23, 0.6); border: 1px solid rgba(51, 65, 85, 0.6); border-radius: 10px; padding: 8px 12px;">
              <div class="slider-header" style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 3px;">
                <span style="color: #e2e8f0; font-weight: 700;">Primer Annealing Temp (T_a)</span>
                <span id="val-pcr-ta" style="color: #fbbf24; font-family: var(--font-mono); font-weight: 800;">58°C (Optimal Tm = 58°C)</span>
              </div>
              <input type="range" id="slider-pcr-ta" min="48" max="70" step="1" value="58" style="width: 100%; accent-color: #38bdf8;">
            </div>

            <!-- CRISPR-Cas9 Cellular DNA Repair Pathway Selector -->
            <div>
              <div style="font-size: 0.73rem; color: #cbd5e1; font-weight: 700; margin-bottom: 5px;">CRISPR-Cas9 Post-Cleavage DNA Repair Pathway:</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 7px;">
                <button id="btn-repair-hdr" class="btn btn-secondary btn-sm active" style="font-size: 0.72rem; padding: 7px 8px; border-color: #10b981; background: rgba(16, 185, 129, 0.22); color: #fff; font-weight: 700;">
                  ✨ HDR Donor Repair (Wild-Type)
                </button>
                <button id="btn-repair-nhej" class="btn btn-secondary btn-sm" style="font-size: 0.72rem; padding: 7px 8px;">
                  ⚡ NHEJ Indel (Gene Knockout)
                </button>
              </div>
            </div>
          </div>

          <!-- Cycle-by-Cycle Exponential Copy Table & Molecular Insight -->
          <div style="background: linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(9, 14, 28, 0.95) 100%); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 14px; padding: 14px 16px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 12px 28px -12px rgba(0, 0, 0, 0.75);">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div style="font-size: 0.75rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em;">
                  2. Exponential Amplification &amp; qPCR Telemetry
                </div>
                <span class="badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-size: 0.67rem; padding: 2px 8px; border-radius: 6px; font-family: var(--font-mono);">
                  N₀ = 100 Copies
                </span>
              </div>

              <div style="background: #020617; border: 1px solid #1e293b; border-radius: 10px; overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.72rem; text-align: left;">
                  <thead>
                    <tr style="background: rgba(15, 23, 42, 0.95); border-bottom: 1px solid #334155; color: #94a3b8; font-family: var(--font-mono); font-size: 0.67rem;">
                      <th style="padding: 6px 8px;">CYCLE (n)</th>
                      <th style="padding: 6px 6px;">IDEAL 2^n</th>
                      <th style="padding: 6px 6px;">ACTUAL COPIES</th>
                      <th style="padding: 6px 6px;">SYBR ΔRn</th>
                      <th style="padding: 6px 8px;">KINETIC PHASE</th>
                    </tr>
                  </thead>
                  <tbody id="pcr-table-body">
                    <!-- Populated dynamically -->
                  </tbody>
                </table>
              </div>
            </div>

            <div id="pcr-biological-insight" style="margin-top: 10px; font-size: 0.74rem; color: #e2e8f0; line-height: 1.48; background: linear-gradient(90deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%); border-left: 3px solid #10b981; border-radius: 8px; padding: 9px 12px;">
              <!-- Populated dynamically -->
            </div>
          </div>
        </div>
      </div>

      <!-- Post-Lab Competency Checkpoint Container -->
      <div id="pcr-checkpoint-container" style="margin-top: 8px; width: 100%;"></div>
    </div>
  `;

  // Mount Post-Lab Competency Checkpoint
  mountLabCheckpoint("pcr-checkpoint-container", "pcrcrispr");

  // DOM Elements
  const canvas = document.getElementById("pcr-canvas");
  const ctx = canvas.getContext("2d");

  let logicalW = 920;
  let logicalH = 600;

  function syncHiDPICanvas() {
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
  syncHiDPICanvas();
  window.addEventListener("resize", syncHiDPICanvas);

  const viewPcrBtn = document.getElementById("view-mode-pcr-sim");
  const viewCrisprBtn = document.getElementById("view-mode-crispr-sim");
  const viewPhotoBtn = document.getElementById("view-mode-pcr-photo");
  const photoOverlay = document.getElementById("pcr-crispr-photo-overlay");

  const locusSelect = document.getElementById("pcr-locus-select");
  const sliderCycle = document.getElementById("slider-pcr-cycle");
  const valCycle = document.getElementById("val-pcr-cycle");
  const sliderTa = document.getElementById("slider-pcr-ta");
  const valTa = document.getElementById("val-pcr-ta");
  const effBadge = document.getElementById("pcr-efficiency-badge");

  const stageBtns = container.querySelectorAll(".pcr-stage-btn");
  const btnRepairHdr = document.getElementById("btn-repair-hdr");
  const btnRepairNhej = document.getElementById("btn-repair-nhej");

  const btnAutoCycle = document.getElementById("btn-pcr-autocycle");
  const btnRecord = document.getElementById("btn-pcr-record");
  const btnReport = document.getElementById("btn-pcr-report");
  const btnExport = document.getElementById("btn-pcr-export");

  const hudStage = document.getElementById("hud-pcr-stage");
  const hudYield = document.getElementById("hud-pcr-yield");
  const hudLocus = document.getElementById("hud-pcr-locus");
  const hudCrispr = document.getElementById("hud-pcr-crispr");
  const tableBody = document.getElementById("pcr-table-body");
  const insightBox = document.getElementById("pcr-biological-insight");

  function setWorkbenchView(mode) {
    if (mode === "photo") {
      photoOverlay.style.display = "block";
      viewPhotoBtn.classList.add("active");
      viewPhotoBtn.style.background = "linear-gradient(135deg, #059669, #10b981)";
      viewPhotoBtn.style.color = "#fff";
      viewPcrBtn.classList.remove("active");
      viewPcrBtn.style.background = "transparent";
      viewCrisprBtn.classList.remove("active");
      viewCrisprBtn.style.background = "transparent";
    } else {
      photoOverlay.style.display = "none";
      workbenchMode = mode;
      viewPhotoBtn.classList.remove("active");
      viewPhotoBtn.style.background = "transparent";
      if (mode === "pcr") {
        viewPcrBtn.classList.add("active");
        viewPcrBtn.style.background = "linear-gradient(135deg, #059669, #10b981)";
        viewPcrBtn.style.color = "#fff";
        viewCrisprBtn.classList.remove("active");
        viewCrisprBtn.style.background = "transparent";
      } else {
        viewCrisprBtn.classList.add("active");
        viewCrisprBtn.style.background = "linear-gradient(135deg, #059669, #10b981)";
        viewCrisprBtn.style.color = "#fff";
        viewPcrBtn.classList.remove("active");
        viewPcrBtn.style.background = "transparent";
      }
    }
    SoundFX.click?.() || SoundFX.playClick?.();
    updateHUD();
  }

  viewPcrBtn.addEventListener("click", () => setWorkbenchView("pcr"));
  viewCrisprBtn.addEventListener("click", () => setWorkbenchView("crispr"));
  viewPhotoBtn.addEventListener("click", () => setWorkbenchView("photo"));

  function updateHUD() {
    const locus = GENOMIC_LOCI[currentLocusKey];
    PCR_STAGES[1].tempC = annealTempC;
    PCR_STAGES[1].name = `2. Primer Annealing (${annealTempC}°C)`;

    // Update Anneal button text
    if (stageBtns[1]) {
      stageBtns[1].textContent = `🧲 2. Anneal (${annealTempC}°C)`;
    }

    const E = computeAmplificationEfficiency();
    const copies = computeCopyYieldAtCycle(currentCycle);
    const ct = computeCtValue();
    const stage = PCR_STAGES[currentStageIndex];

    if (effBadge) effBadge.textContent = `Efficiency E = ${(E * 100).toFixed(1)}%`;
    if (valCycle) valCycle.textContent = `Cycle ${currentCycle} / 35`;
    if (valTa) valTa.textContent = `${annealTempC}°C (Optimal Tm = ${locus.optimalTm}°C)`;

    if (hudStage) {
      if (workbenchMode === "pcr") {
        hudStage.textContent = `Cycle ${currentCycle}/35 • ${stage.tempC}°C ${stage.shortName}`;
      } else {
        hudStage.textContent = `SpCas9 RNP • ${locus.geneSymbol}`;
      }
    }
    if (hudYield) {
      hudYield.textContent = `${formatSciCopies(copies)} copies • Ct = ${ct.toFixed(1)}`;
    }
    if (hudLocus) {
      hudLocus.textContent = `${locus.geneSymbol} • ${locus.ampliconBp} bp`;
    }
    if (hudCrispr) {
      hudCrispr.textContent = `5'-${locus.pamSequence}-3' PAM • ${repairPathway.toUpperCase()}`;
    }

    // Populate Milestone Cycle Table
    const milestoneCycles = [1, 5, 10, 15, 20, 25, 30, 35];
    if (!milestoneCycles.includes(currentCycle)) {
      milestoneCycles.push(currentCycle);
      milestoneCycles.sort((a, b) => a - b);
    }

    if (tableBody) {
      tableBody.innerHTML = milestoneCycles.slice(0, 7).map(c => {
        const cCopies = computeCopyYieldAtCycle(c);
        const rn = computeFluorescenceRn(c);
        const isCur = c === currentCycle;
        const phase = c < ct ? "Baseline" : (c <= 28 ? "Exponential (2^n)" : "Plateau");

        return `
          <tr data-cyc="${c}" class="pcr-row-item" style="border-bottom: 1px solid #1e293b; background: ${isCur ? 'rgba(16, 185, 129, 0.2)' : 'transparent'}; cursor: pointer;">
            <td style="padding: 5px 8px; font-weight: 700; color: #f8fafc; font-family: var(--font-mono);">Cycle ${c}</td>
            <td style="padding: 5px 6px; color: #94a3b8; font-family: var(--font-mono);">2^${c}</td>
            <td style="padding: 5px 6px; color: #34d399; font-family: var(--font-mono); font-weight: 800;">${formatSciCopies(cCopies)}</td>
            <td style="padding: 5px 6px; color: #38bdf8; font-family: var(--font-mono);">${rn.toFixed(2)}</td>
            <td style="padding: 5px 8px; color: ${c >= ct ? '#fbbf24' : '#64748b'}; font-weight: 700; font-size: 0.67rem;">${phase}</td>
          </tr>
        `;
      }).join("");

      tableBody.querySelectorAll("tr[data-cyc]").forEach(row => {
        row.addEventListener("click", () => {
          currentCycle = parseInt(row.dataset.cyc, 10);
          sliderCycle.value = String(currentCycle);
          SoundFX.click?.() || SoundFX.playClick?.();
          updateHUD();
        });
      });
    }

    if (insightBox) {
      if (workbenchMode === "pcr") {
        insightBox.innerHTML = formatMathText(
          `<strong>${stage.name}:</strong> ${stage.mechanism} At $T_a = ${annealTempC}^\\circ\\text{C}$, primer hybridization efficiency is $E = ${(E * 100).toFixed(1)}\\%$, crossing the SYBR Green fluorescence threshold at $C_t = ${ct.toFixed(1)}\\text{ cycles}$.`
        );
      } else {
        insightBox.innerHTML = formatMathText(
          `<strong>CRISPR-Cas9 Endonuclease (${locus.geneSymbol}):</strong> SpCas9 recognizes the $5'\\text{-${locus.pamSequence}-}3'$ PAM motif, unwinds the genomic duplex to form an RNA-DNA R-loop with the 20-nt sgRNA spacer, and cleaves both strands 3 bp upstream of PAM via its <strong>HNH</strong> and <strong>RuvC</strong> catalytic domains. <strong>${repairPathway === 'hdr' ? locus.hdrOutcome : locus.nhejOutcome}</strong>.`
        );
      }
    }
  }

  // Controls Event Listeners
  locusSelect.addEventListener("change", (e) => {
    currentLocusKey = e.target.value;
    annealTempC = GENOMIC_LOCI[currentLocusKey].optimalTm;
    sliderTa.value = String(annealTempC);
    SoundFX.click?.() || SoundFX.playClick?.();
    updateHUD();
  });

  sliderCycle.addEventListener("input", (e) => {
    currentCycle = parseInt(e.target.value, 10);
    updateHUD();
  });

  sliderTa.addEventListener("input", (e) => {
    annealTempC = parseInt(e.target.value, 10);
    updateHUD();
  });

  stageBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      currentStageIndex = parseInt(btn.dataset.stage, 10);
      stageBtns.forEach(b => {
        const act = b === btn;
        b.classList.toggle("active", act);
        b.style.borderColor = act ? "#10b981" : "";
        b.style.background = act ? "rgba(16, 185, 129, 0.22)" : "";
        b.style.color = act ? "#fff" : "";
      });
      SoundFX.click?.() || SoundFX.playClick?.();
      updateHUD();
    });
  });

  btnRepairHdr.addEventListener("click", () => {
    repairPathway = "hdr";
    btnRepairHdr.classList.add("active");
    btnRepairHdr.style.borderColor = "#10b981";
    btnRepairHdr.style.background = "rgba(16, 185, 129, 0.22)";
    btnRepairNhej.classList.remove("active");
    btnRepairNhej.style.borderColor = "";
    btnRepairNhej.style.background = "";
    if (workbenchMode !== "crispr") setWorkbenchView("crispr");
    else updateHUD();
  });

  btnRepairNhej.addEventListener("click", () => {
    repairPathway = "nhej";
    btnRepairNhej.classList.add("active");
    btnRepairNhej.style.borderColor = "#10b981";
    btnRepairNhej.style.background = "rgba(16, 185, 129, 0.22)";
    btnRepairHdr.classList.remove("active");
    btnRepairHdr.style.borderColor = "";
    btnRepairHdr.style.background = "";
    if (workbenchMode !== "crispr") setWorkbenchView("crispr");
    else updateHUD();
  });

  btnAutoCycle.addEventListener("click", () => {
    isAutoCycling = !isAutoCycling;
    if (isAutoCycling && currentCycle >= 35) {
      currentCycle = 1;
      sliderCycle.value = "1";
    }
    btnAutoCycle.textContent = isAutoCycling ? "⏸ Pause Thermocycler" : "▶ Auto-Cycle PCR";
    SoundFX.click?.() || SoundFX.playClick?.();
  });

  // Click on qPCR plot to jump to a cycle
  canvas.addEventListener("pointerdown", (e) => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = (e.clientX - rect.left) * (logicalW / rect.width);
    const y = (e.clientY - rect.top) * (logicalH / rect.height);

    if (workbenchMode === "pcr" && y > logicalH * 0.52 && x > logicalW * 0.48) {
      const rightX = Math.round(logicalW * 0.48) + 42;
      const rightW = logicalW - rightX - 28;
      const clickedCyc = Math.round(1 + ((x - rightX) / Math.max(1, rightW)) * 34);
      if (clickedCyc >= 1 && clickedCyc <= 35) {
        currentCycle = clickedCyc;
        sliderCycle.value = String(currentCycle);
        SoundFX.click?.() || SoundFX.playClick?.();
        updateHUD();
      }
    } else if (workbenchMode === "crispr") {
      cas9Cleaved = !cas9Cleaved;
      SoundFX.click?.() || SoundFX.playClick?.();
    }
  });

  // 60 FPS Canvas Rendering Loop
  function renderPcrCrisprCanvas() {
    if (!container || !container.isConnected) return;
    syncHiDPICanvas();
    timeTick += 0.035;

    if (isAutoCycling) {
      stageTimer += 0.035;
      if (stageTimer >= 0.85) {
        stageTimer = 0;
        currentStageIndex = (currentStageIndex + 1) % 3;
        stageBtns.forEach((b, idx) => {
          const act = idx === currentStageIndex;
          b.classList.toggle("active", act);
          b.style.borderColor = act ? "#10b981" : "";
          b.style.background = act ? "rgba(16, 185, 129, 0.22)" : "";
          b.style.color = act ? "#fff" : "";
        });
        if (currentStageIndex === 0) {
          currentCycle = Math.min(35, currentCycle + 1);
          sliderCycle.value = String(currentCycle);
          if (currentCycle >= 35) {
            isAutoCycling = false;
            btnAutoCycle.textContent = "↻ Re-Run 35 Cycles";
            SoundFX.success?.() || SoundFX.playBeep?.();
          }
        }
        updateHUD();
      }
    }

    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : Math.min(window.devicePixelRatio || 1, 2);
    ctx.save();
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, logicalW, logicalH);

    // Rich Studio Dark Bio-Genetics Background
    const bgGrad = ctx.createRadialGradient(logicalW * 0.5, logicalH * 0.3, 40, logicalW * 0.5, logicalH * 0.5, logicalW * 0.75);
    bgGrad.addColorStop(0, "#07221c");
    bgGrad.addColorStop(0.6, "#041118");
    bgGrad.addColorStop(1, "#020617");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, logicalW, logicalH);

    // Subtle Blueprint Grid
    ctx.strokeStyle = "rgba(16, 185, 129, 0.035)";
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

    if (workbenchMode === "crispr") {
      renderCrisprMolecularEditor(ctx, logicalW, logicalH);
    } else {
      renderPcrThermalAndQpcrView(ctx, logicalW, logicalH);
    }

    ctx.restore();
    animId = requestAnimationFrame(renderPcrCrisprCanvas);
  }

  // =========================================================================
  // MODE 1: 3D HELICAL PCR REPLICATION ENGINE + PELTIER & qPCR FLUOROMETER
  // =========================================================================
  function renderPcrThermalAndQpcrView(ctx, W, H) {
    const stage = PCR_STAGES[currentStageIndex];
    const locus = GENOMIC_LOCI[currentLocusKey];
    const pad = 16;
    const gap = 14;

    const topBox = { x: pad, y: 14, w: W - pad * 2, h: Math.round(H * 0.52) - 18 };
    const botY = topBox.y + topBox.h + gap;
    const botH = H - botY - 14;
    const leftBotW = Math.round((W - pad * 2 - gap) * 0.44);
    const rightBotW = W - pad * 2 - gap - leftBotW;

    const peltierBox = { x: pad, y: botY, w: leftBotW, h: botH };
    const qpcrBox = { x: pad + leftBotW + gap, y: botY, w: rightBotW, h: botH };

    // -------------------------------------------------------------------------
    // 1. TOP STATION: 3D HELICAL DNA STRAND SEPARATION, PRIMERS & TAQ POLYMERASE
    // -------------------------------------------------------------------------
    ctx.save();
    ctx.fillStyle = "rgba(9, 15, 30, 0.82)";
    ctx.strokeStyle = stage.color;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(topBox.x, topBox.y, topBox.w, topBox.h, 12);
    ctx.fill();
    ctx.stroke();

    // Ambient Thermal Glow inside Top Chamber
    const thermGlow = ctx.createRadialGradient(topBox.x + topBox.w * 0.5, topBox.y + topBox.h * 0.55, 20, topBox.x + topBox.w * 0.5, topBox.y + topBox.h * 0.55, topBox.w * 0.48);
    if (currentStageIndex === 0) {
      thermGlow.addColorStop(0, "rgba(239, 68, 68, 0.16)");
      thermGlow.addColorStop(1, "rgba(0,0,0,0)");
    } else if (currentStageIndex === 1) {
      thermGlow.addColorStop(0, "rgba(56, 189, 248, 0.15)");
      thermGlow.addColorStop(1, "rgba(0,0,0,0)");
    } else {
      thermGlow.addColorStop(0, "rgba(16, 185, 129, 0.16)");
      thermGlow.addColorStop(1, "rgba(0,0,0,0)");
    }
    ctx.fillStyle = thermGlow;
    ctx.fillRect(topBox.x + 2, topBox.y + 2, topBox.w - 4, topBox.h - 4);

    // Header Title & Stage Temperature Pill
    ctx.fillStyle = stage.color;
    ctx.font = "bold 11.5px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText(`① 3D MOLECULAR REPLICATION CHAMBER — ${stage.name.toUpperCase()}`, topBox.x + 14, topBox.y + 21);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText(`Target: ${locus.geneSymbol} (${locus.ampliconBp} bp) • Cycle ${currentCycle}/35`, topBox.x + topBox.w - 14, topBox.y + 21);

    // Floating Free dNTP Triphosphates in Buffer Solution
    const baseColors = { A: "#10b981", T: "#f43f5e", C: "#38bdf8", G: "#fbbf24" };
    const compMap = { A: "T", T: "A", C: "G", G: "C" };
    dntpParticles.forEach(p => {
      const px = topBox.x + 24 + ((p.x + Math.sin(timeTick * 1.3 + p.phase) * 4) / 100) * (topBox.w - 48);
      const py = topBox.y + 34 + ((p.y + Math.cos(timeTick * 1.1 + p.phase) * 4) / 100) * (topBox.h - 48);
      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      ctx.strokeStyle = baseColors[p.base];
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(px - 11, py - 6, 22, 12, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = baseColors[p.base];
      ctx.font = "bold 7.5px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(`d${p.base}TP`, px, py + 2.5);
    });

    // 3D DNA Double Helix / Unwound Replication Bubble Geometry
    const centerY = topBox.y + Math.round(topBox.h * 0.54);
    const startX = topBox.x + 48;
    const endX = topBox.x + topBox.w - 48;
    const spanW = endX - startX;
    const numBases = 26;
    const seqTop = "CTGACTCCTGAGGAGAAGTCTGCCGT".split("");

    // Separation Envelope Function along X (0 to 1)
    function getStrandY(normX, isTopStrand) {
      const helixWave = Math.sin(normX * Math.PI * 3.5 + timeTick * 1.4) * (currentStageIndex === 0 ? 5 : 8);
      const baseSep = currentStageIndex === 0
        ? 64 + Math.sin(timeTick * 3.5) * 4 // Fully melted at 95°C
        : (currentStageIndex === 1 ? 54 : 50);
      // Taper ends slightly into helical twists
      const bubbleEnv = 0.35 + 0.65 * Math.sin(normX * Math.PI);
      const offset = baseSep * bubbleEnv + helixWave;
      return isTopStrand ? centerY - offset : centerY + offset;
    }

    // Draw Nucleotide Base Rungs & Hydrogen Bonds
    const extProgress = (Math.sin(timeTick * 1.4) + 1) / 2; // 0 to 1 animated synthesis progress
    for (let i = 0; i < numBases; i++) {
      const normX = i / (numBases - 1);
      const bx = startX + normX * spanW;
      const topY = getStrandY(normX, true);
      const botYPos = getStrandY(normX, false);
      const bTop = seqTop[i % seqTop.length];
      const bBot = compMap[bTop];

      // Top Template Nucleotide Rung
      ctx.strokeStyle = baseColors[bTop];
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bx, topY);
      ctx.lineTo(bx, topY + 14);
      ctx.stroke();

      // Bottom Template Nucleotide Rung
      ctx.strokeStyle = baseColors[bBot];
      ctx.beginPath();
      ctx.moveTo(bx, botYPos);
      ctx.lineTo(bx, botYPos - 14);
      ctx.stroke();

      // Base Letter Pill Badges
      ctx.fillStyle = baseColors[bTop];
      ctx.font = "bold 8.5px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(bTop, bx, topY - 6);
      ctx.fillStyle = baseColors[bBot];
      ctx.fillText(bBot, bx, botYPos + 13);

      // Stage 0 (95°C Denaturation): Thermal H-bond breaking sparks!
      if (currentStageIndex === 0) {
        ctx.strokeStyle = "rgba(239, 68, 68, 0.35)";
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(bx, topY + 15);
        ctx.lineTo(bx, botYPos - 15);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Stage 1 (Annealing) or Stage 2 (Taq Extension): Draw Primers & Newly Synthesized Daughter Strands
      // Forward Primer binds Left of Bottom Strand (indices 1..6) and extends Right ->
      const fwdLimit = currentStageIndex === 1 ? 6 : 6 + Math.floor(extProgress * (numBases - 8));
      if (currentStageIndex >= 1 && i >= 1 && i <= fwdLimit) {
        const isPrimer = i <= 6;
        const dy = botYPos - 26;
        ctx.strokeStyle = isPrimer ? "#fbbf24" : "#34d399";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(bx, dy);
        ctx.lineTo(bx, botYPos - 15);
        ctx.stroke();
      }

      // Reverse Primer binds Right of Top Strand (indices 19..24) and extends Left <-
      const revLimit = currentStageIndex === 1 ? 19 : 19 - Math.floor(extProgress * (numBases - 8));
      if (currentStageIndex >= 1 && i <= 24 && i >= revLimit) {
        const isPrimer = i >= 19;
        const dy = topY + 26;
        ctx.strokeStyle = isPrimer ? "#f43f5e" : "#38bdf8";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(bx, dy);
        ctx.lineTo(bx, topY + 15);
        ctx.stroke();
      }
    }

    // Draw Continuous 3D Sugar-Phosphate Backbone Ribbons (Top 5'->3' and Bottom 3'->5')
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let px = 0; px <= spanW; px += 4) {
      const normX = px / spanW;
      const y = getStrandY(normX, true);
      if (px === 0) ctx.moveTo(startX + px, y);
      else ctx.lineTo(startX + px, y);
    }
    ctx.stroke();

    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let px = 0; px <= spanW; px += 4) {
      const normX = px / spanW;
      const y = getStrandY(normX, false);
      if (px === 0) ctx.moveTo(startX + px, y);
      else ctx.lineTo(startX + px, y);
    }
    ctx.stroke();

    // 5' and 3' Polarity End Caps
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 10px 'JetBrains Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText("5'", startX - 10, getStrandY(0, true) + 4);
    ctx.fillText("3'", startX - 10, getStrandY(0, false) + 4);
    ctx.textAlign = "left";
    ctx.fillText("3'", endX + 10, getStrandY(1, true) + 4);
    ctx.fillText("5'", endX + 10, getStrandY(1, false) + 4);

    // Draw Primers & Bilobed 3D Taq DNA Polymerase Holoenzyme in Stage 1 & 2
    if (currentStageIndex >= 1) {
      const stepX = spanW / (numBases - 1);
      // Forward Primer Ribbon (Bottom-Left)
      const fwdStartX = startX + 1 * stepX;
      const fwdPrimerEndX = startX + 6 * stepX;
      const fwdCurrEndX = currentStageIndex === 1
        ? fwdPrimerEndX
        : startX + (6 + extProgress * (numBases - 8)) * stepX;

      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(fwdStartX, getStrandY(1 / 25, false) - 26);
      ctx.lineTo(fwdPrimerEndX, getStrandY(6 / 25, false) - 26);
      ctx.stroke();

      // Reverse Primer Ribbon (Top-Right)
      const revStartX = startX + 24 * stepX;
      const revPrimerEndX = startX + 19 * stepX;
      const revCurrEndX = currentStageIndex === 1
        ? revPrimerEndX
        : startX + (19 - extProgress * (numBases - 8)) * stepX;

      ctx.strokeStyle = "#f43f5e";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(revStartX, getStrandY(24 / 25, true) + 26);
      ctx.lineTo(revPrimerEndX, getStrandY(19 / 25, true) + 26);
      ctx.stroke();

      if (currentStageIndex === 2) {
        // Daughter Strand Extension Lines
        ctx.strokeStyle = "#34d399";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(fwdPrimerEndX, getStrandY(6 / 25, false) - 26);
        ctx.lineTo(fwdCurrEndX, getStrandY((fwdCurrEndX - startX) / spanW, false) - 26);
        ctx.stroke();

        ctx.strokeStyle = "#38bdf8";
        ctx.beginPath();
        ctx.moveTo(revPrimerEndX, getStrandY(19 / 25, true) + 26);
        ctx.lineTo(revCurrEndX, getStrandY((revCurrEndX - startX) / spanW, true) + 26);
        ctx.stroke();

        // Draw 3D Bilobed Taq DNA Polymerase Holoenzyme at Both Synthesis Forks!
        const drawTaqEnzyme = (ex, ey, dirLabel) => {
          const taqGrad = ctx.createRadialGradient(ex - 4, ey - 4, 2, ex, ey, 20);
          taqGrad.addColorStop(0, "#6ee7b7");
          taqGrad.addColorStop(0.55, "#10b981");
          taqGrad.addColorStop(1, "#064e3b");
          ctx.fillStyle = taqGrad;
          ctx.strokeStyle = "#a7f3d0";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(ex, ey, 22, 13, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Mg2+ Cofactor Spark
          ctx.fillStyle = "#fde047";
          ctx.beginPath();
          ctx.arc(ex + 8, ey - 3, 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#022c22";
          ctx.font = "bold 8.5px 'JetBrains Mono', monospace";
          ctx.textAlign = "center";
          ctx.fillText(dirLabel, ex - 2, ey + 3);
        };

        drawTaqEnzyme(fwdCurrEndX, getStrandY((fwdCurrEndX - startX) / spanW, false) - 26, "Taq→");
        drawTaqEnzyme(revCurrEndX, getStrandY((revCurrEndX - startX) / spanW, true) + 26, "←Taq");
      } else {
        // Primer Labels in Stage 1
        ctx.fillStyle = "#fbbf24";
        ctx.font = "bold 9px 'JetBrains Mono', monospace";
        ctx.textAlign = "left";
        ctx.fillText("5' Forward Primer →", fwdStartX, getStrandY(3 / 25, false) - 34);

        ctx.fillStyle = "#f43f5e";
        ctx.textAlign = "right";
        ctx.fillText("← Reverse Primer 5'", revStartX, getStrandY(21 / 25, true) + 40);
      }
    } else {
      // Stage 0 (95°C Denaturation) Callout Banner
      ctx.fillStyle = "rgba(239, 68, 68, 0.18)";
      ctx.strokeStyle = "rgba(239, 68, 68, 0.55)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(topBox.x + topBox.w / 2 - 175, centerY - 13, 350, 26, 999);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#fca5a5";
      ctx.font = "bold 10px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText("🔥 95°C THERMAL MELTING: A=T & G≡C H-BONDS UNZIPPING", topBox.x + topBox.w / 2, centerY + 3.5);
    }
    ctx.restore();

    // -------------------------------------------------------------------------
    // 2. BOTTOM-LEFT: PELTIER THERMAL CYCLING PROFILE T(t) STAIRCASE
    // -------------------------------------------------------------------------
    ctx.save();
    ctx.fillStyle = "rgba(9, 15, 30, 0.82)";
    ctx.strokeStyle = "rgba(251, 191, 36, 0.32)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(peltierBox.x, peltierBox.y, peltierBox.w, peltierBox.h, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText("② PELTIER THERMAL PROFILE T(t)", peltierBox.x + 12, peltierBox.y + 20);

    const ptX = peltierBox.x + 36;
    const ptY = peltierBox.y + 34;
    const ptW = peltierBox.w - 50;
    const ptH = peltierBox.h - 60;

    ctx.fillStyle = "#020617";
    ctx.strokeStyle = "#1e293b";
    ctx.beginPath();
    ctx.roundRect(ptX, ptY, ptW, ptH, 8);
    ctx.fill();
    ctx.stroke();

    // Temp Y-Axis (40°C to 100°C)
    const tempToY = (T) => ptY + ptH - 14 - ((T - 40) / 65) * (ptH - 28);
    [95, 72, annealTempC].forEach((T, idx) => {
      const ty = tempToY(T);
      ctx.strokeStyle = "rgba(51, 65, 85, 0.45)";
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(ptX, ty);
      ctx.lineTo(ptX + ptW, ty);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = idx === 0 ? "#ef4444" : (idx === 1 ? "#10b981" : "#38bdf8");
      ctx.font = "bold 8.5px 'JetBrains Mono', monospace";
      ctx.textAlign = "right";
      ctx.fillText(`${T}°`, ptX - 4, ty + 3);
    });

    // 3-Stage Thermal Staircase Waveform
    const s1X = ptX + ptW * 0.30;
    const s2X = ptX + ptW * 0.62;
    const s3X = ptX + ptW * 0.95;

    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(ptX + 8, tempToY(95));
    ctx.lineTo(s1X, tempToY(95));
    ctx.lineTo(s1X + 14, tempToY(annealTempC));
    ctx.lineTo(s2X, tempToY(annealTempC));
    ctx.lineTo(s2X + 14, tempToY(72));
    ctx.lineTo(s3X, tempToY(72));
    ctx.stroke();

    // Active Stage Glowing Cursor on Staircase
    const stageCentersX = [ptX + ptW * 0.16, ptX + ptW * 0.48, ptX + ptW * 0.80];
    const activeX = stageCentersX[currentStageIndex];
    const activeY = tempToY(stage.tempC);

    ctx.fillStyle = stage.color;
    ctx.beginPath();
    ctx.arc(activeX, activeY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${stage.shortName} (${stage.tempC}°C)`, activeX, activeY - 10);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "8.5px 'JetBrains Mono', monospace";
    ctx.fillText("Single Cycle Ramp: 95°C (30s) → Ta (30s) → 72°C (45s)", ptX + ptW / 2, ptY + ptH + 14);
    ctx.restore();

    // -------------------------------------------------------------------------
    // 3. BOTTOM-RIGHT: REAL-TIME qPCR SYBR GREEN AMPLIFICATION CURVE (ΔRn)
    // -------------------------------------------------------------------------
    ctx.save();
    ctx.fillStyle = "rgba(9, 15, 30, 0.82)";
    ctx.strokeStyle = "rgba(56, 189, 248, 0.32)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(qpcrBox.x, qpcrBox.y, qpcrBox.w, qpcrBox.h, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText("③ REAL-TIME qPCR SYBR GREEN FLUORESCENCE (ΔRn vs CYCLE)", qpcrBox.x + 12, qpcrBox.y + 20);

    const qX = qpcrBox.x + 40;
    const qY = qpcrBox.y + 34;
    const qW = qpcrBox.w - 56;
    const qH = qpcrBox.h - 60;

    ctx.fillStyle = "#020617";
    ctx.strokeStyle = "#1e293b";
    ctx.beginPath();
    ctx.roundRect(qX, qY, qW, qH, 8);
    ctx.fill();
    ctx.stroke();

    // Cycle Grid (5 to 35)
    for (let c = 5; c <= 35; c += 5) {
      const gx = qX + ((c - 1) / 34) * qW;
      ctx.strokeStyle = "rgba(51, 65, 85, 0.4)";
      ctx.beginPath();
      ctx.moveTo(gx, qY);
      ctx.lineTo(gx, qY + qH);
      ctx.stroke();

      ctx.fillStyle = "#64748b";
      ctx.font = "8.5px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(`C${c}`, gx, qY + qH + 13);
    }

    const baseLineY = qY + qH - 14;
    const maxPlotH = qH - 28;

    // Ct Threshold Line (ΔRn = 0.50)
    const threshY = baseLineY - (0.50 / 5.0) * maxPlotH;
    ctx.strokeStyle = "rgba(251, 191, 36, 0.8)";
    ctx.lineWidth = 1.4;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(qX, threshY);
    ctx.lineTo(qX + qW, threshY);
    ctx.stroke();
    ctx.setLineDash([]);

    const ct = computeCtValue();
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 8.5px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText(`Ct Threshold = ${ct.toFixed(1)}`, qX + 6, threshY - 5);

    // Shaded Area under Sigmoidal qPCR Curve up to currentCycle
    const curCycX = qX + ((currentCycle - 1) / 34) * qW;
    const areaGrad = ctx.createLinearGradient(0, qY, 0, baseLineY);
    areaGrad.addColorStop(0, "rgba(16, 185, 129, 0.38)");
    areaGrad.addColorStop(1, "rgba(16, 185, 129, 0.02)");
    ctx.fillStyle = areaGrad;
    ctx.beginPath();
    ctx.moveTo(qX, baseLineY);
    for (let c = 1; c <= currentCycle; c += 0.5) {
      const cx = qX + ((c - 1) / 34) * qW;
      const cy = baseLineY - (computeFluorescenceRn(c) / 5.0) * maxPlotH;
      ctx.lineTo(cx, cy);
    }
    ctx.lineTo(curCycX, baseLineY);
    ctx.closePath();
    ctx.fill();

    // Full Sigmoidal Amplification Curve (1 to 35)
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let c = 1; c <= 35; c += 0.5) {
      const cx = qX + ((c - 1) / 34) * qW;
      const cy = baseLineY - (computeFluorescenceRn(c) / 5.0) * maxPlotH;
      if (c === 1) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    // Active Cycle Marker on Curve
    const curRn = computeFluorescenceRn(currentCycle);
    const curY = baseLineY - (curRn / 5.0) * maxPlotH;
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(curCycX, curY, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    const copies = computeCopyYieldAtCycle(currentCycle);
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    ctx.textAlign = currentCycle > 24 ? "right" : "left";
    ctx.fillText(
      `C${currentCycle}: ${formatSciCopies(copies)}`,
      currentCycle > 24 ? curCycX - 8 : curCycX + 8,
      Math.max(qY + 14, curY - 7)
    );

    ctx.restore();
  }

  // =========================================================================
  // MODE 2: 3D STRUCTURAL CRISPR-SpCas9 RIBONUCLEOPROTEIN (RNP) EDITOR
  // =========================================================================
  function renderCrisprMolecularEditor(ctx, W, H) {
    const locus = GENOMIC_LOCI[currentLocusKey];
    const pad = 16;
    const gap = 14;

    const rnpBox = { x: pad, y: 14, w: W - pad * 2, h: Math.round(H * 0.62) - 18 };
    const repBox = { x: pad, y: rnpBox.y + rnpBox.h + gap, w: W - pad * 2, h: H - (rnpBox.y + rnpBox.h + gap) - 14 };

    // -------------------------------------------------------------------------
    // 1. TOP PANEL: BILOBED SpCas9 ENDONUCLEASE + 20-nt sgRNA R-LOOP + PAM
    // -------------------------------------------------------------------------
    ctx.save();
    ctx.fillStyle = "rgba(9, 15, 30, 0.85)";
    ctx.strokeStyle = "rgba(168, 85, 247, 0.45)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(rnpBox.x, rnpBox.y, rnpBox.w, rnpBox.h, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#c084fc";
    ctx.font = "bold 11.5px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText(`① 3D CRISPR-SpCas9 ENDONUCLEASE R-LOOP & PAM RECOGNITION (${locus.geneSymbol})`, rnpBox.x + 14, rnpBox.y + 21);

    const cx = rnpBox.x + Math.round(rnpBox.w * 0.5);
    const cy = rnpBox.y + Math.round(rnpBox.h * 0.54);

    // Bilobed SpCas9 Protein Envelope (REC Lobe below + NUC Lobe above)
    // NUC Lobe (contains HNH, RuvC, and PAM-Interacting PI domains)
    const nucGrad = ctx.createRadialGradient(cx, cy - 38, 15, cx, cy - 20, 220);
    nucGrad.addColorStop(0, "rgba(139, 92, 246, 0.32)");
    nucGrad.addColorStop(0.65, "rgba(99, 102, 241, 0.16)");
    nucGrad.addColorStop(1, "rgba(15, 23, 42, 0.0)");
    ctx.fillStyle = nucGrad;
    ctx.strokeStyle = "rgba(167, 139, 250, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 18, Math.min(270, rnpBox.w * 0.36), Math.min(115, rnpBox.h * 0.36), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // REC Recognition Lobe
    const recGrad = ctx.createRadialGradient(cx - 25, cy + 38, 15, cx - 25, cy + 30, 210);
    recGrad.addColorStop(0, "rgba(16, 185, 129, 0.25)");
    recGrad.addColorStop(1, "rgba(15, 23, 42, 0.0)");
    ctx.fillStyle = recGrad;
    ctx.strokeStyle = "rgba(52, 211, 153, 0.4)";
    ctx.beginPath();
    ctx.ellipse(cx - 18, cy + 28, Math.min(250, rnpBox.w * 0.33), Math.min(95, rnpBox.h * 0.30), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#e9d5ff";
    ctx.font = "bold 9.5px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("SpCas9 NUCLEASE LOBE (RuvC + HNH + PAM-Interacting Domain)", cx, rnpBox.y + 42);
    ctx.fillStyle = "#6ee7b7";
    ctx.fillText("SpCas9 REC RECOGNITION LOBE (20-nt sgRNA Scaffold Anchor)", cx - 18, rnpBox.y + rnpBox.h - 12);

    // Unwound R-Loop DNA Duplex Coordinates
    const leftEdgeX = rnpBox.x + 28;
    const rightEdgeX = rnpBox.x + rnpBox.w - 28;
    const bubbleLeftX = cx - Math.min(190, rnpBox.w * 0.25);
    const bubbleRightX = cx + Math.min(140, rnpBox.w * 0.18);
    const pamX = bubbleRightX + 12;
    const cutX = bubbleRightX - 36; // 3 bp upstream of PAM!

    // 1) Non-Target DNA Strand (5' -> 3', Top Arching Displaced Loop)
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(leftEdgeX, cy - 10);
    ctx.lineTo(bubbleLeftX, cy - 10);
    ctx.bezierCurveTo(bubbleLeftX + 40, cy - 78, bubbleRightX - 40, cy - 78, cutX - 8, cy - 52);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cutX + 8, cy - 52);
    ctx.lineTo(bubbleRightX, cy - 10);
    ctx.lineTo(rightEdgeX, cy - 10);
    ctx.stroke();

    // 2) Target DNA Strand (3' -> 5', Bottom Hybridized to sgRNA)
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(leftEdgeX, cy + 10);
    ctx.lineTo(bubbleLeftX, cy + 10);
    ctx.lineTo(cutX - 8, cy + 28);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cutX + 8, cy + 28);
    ctx.lineTo(bubbleRightX, cy + 10);
    ctx.lineTo(rightEdgeX, cy + 10);
    ctx.stroke();

    // 3) 20-nt Single-Guide RNA (sgRNA) Spacer + tracrRNA Stem-Loop Hairpin
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(bubbleLeftX + 12, cy + 52);
    ctx.lineTo(bubbleRightX - 10, cy + 52);
    // tracrRNA 3D Hairpin Loops on the 3' end
    ctx.bezierCurveTo(bubbleRightX + 35, cy + 52, bubbleRightX + 35, cy + 90, bubbleRightX, cy + 82);
    ctx.bezierCurveTo(bubbleRightX - 25, cy + 75, bubbleRightX - 15, cy + 98, bubbleRightX + 20, cy + 95);
    ctx.stroke();

    // Draw 20 Base-Pair R-Loop Hybridization Bars between Target DNA & sgRNA Spacer
    const spacerChars = locus.sgRnaSpacer.replace(/^5'-|-3'$/g, "").split("");
    const numRloop = Math.min(20, spacerChars.length);
    const rLoopSpan = (bubbleRightX - 14) - (bubbleLeftX + 16);
    for (let i = 0; i < numRloop; i++) {
      const rx = bubbleLeftX + 16 + (i / (numRloop - 1)) * rLoopSpan;
      ctx.strokeStyle = "rgba(52, 211, 153, 0.78)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rx, cy + 29);
      ctx.lineTo(rx, cy + 50);
      ctx.stroke();

      ctx.fillStyle = "#a7f3d0";
      ctx.font = "bold 8px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(spacerChars[i], rx, cy + 64);
    }

    // 4) Glowing Gold 5'-NGG-3' PAM Recognition Box on Non-Target Strand
    ctx.fillStyle = "rgba(245, 158, 11, 0.28)";
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(pamX, cy - 26, 76, 32, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fde047";
    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${locus.pamSequence} PAM`, pamX + 38, cy - 6);

    // 5) HNH & RuvC Catalytic Endonuclease Cleavage Scissors (3 bp upstream of PAM)
    const pulse = 1 + Math.sin(timeTick * 4) * 0.12;
    ctx.strokeStyle = "#f43f5e";
    ctx.lineWidth = 2.2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(cutX, cy - 75);
    ctx.lineTo(cutX, cy + 48);
    ctx.stroke();
    ctx.setLineDash([]);

    // RuvC Domain Badge (cuts Non-Target strand)
    ctx.fillStyle = "#e11d48";
    ctx.beginPath();
    ctx.arc(cutX, cy - 52, 8 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fda4af";
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText("✂️ RuvC Cut", cutX - 12, cy - 49);

    // HNH Domain Badge (cuts Target strand)
    ctx.fillStyle = "#e11d48";
    ctx.beginPath();
    ctx.arc(cutX, cy + 28, 8 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fda4af";
    ctx.fillText("✂️ HNH Cut (-3 bp)", cutX - 12, cy + 31);
    ctx.restore();

    // -------------------------------------------------------------------------
    // 2. BOTTOM PANEL: CELLULAR DSB REPAIR OUTCOME (HDR vs NHEJ)
    // -------------------------------------------------------------------------
    ctx.save();
    const isHdr = repairPathway === "hdr";
    ctx.fillStyle = "rgba(9, 15, 30, 0.85)";
    ctx.strokeStyle = isHdr ? "rgba(16, 185, 129, 0.5)" : "rgba(244, 63, 94, 0.5)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(repBox.x, repBox.y, repBox.w, repBox.h, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isHdr ? "#34d399" : "#fb7185";
    ctx.font = "bold 11.5px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      isHdr
        ? "② HOMOLOGY-DIRECTED REPAIR (HDR WITH DONOR DNA TEMPLATE — PRECISION GENE CORRECTION)"
        : "② NON-HOMOLOGOUS END JOINING (NHEJ — ERROR-PRONE INDEL FRAMESHIFT KNOCKOUT)",
      repBox.x + 14,
      repBox.y + 22
    );

    // Edited DNA Duplex Visualization inside Bottom Panel
    const dY = repBox.y + Math.round(repBox.h * 0.48);
    const dLeft = repBox.x + 36;
    const dRight = repBox.x + repBox.w - 36;
    const editCenter = (dLeft + dRight) / 2;

    // Flanking Genomic Arms
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(dLeft, dY - 9);
    ctx.lineTo(editCenter - 95, dY - 9);
    ctx.moveTo(editCenter + 95, dY - 9);
    ctx.lineTo(dRight, dY - 9);
    ctx.stroke();

    ctx.strokeStyle = "#94a3b8";
    ctx.beginPath();
    ctx.moveTo(dLeft, dY + 9);
    ctx.lineTo(editCenter - 95, dY + 9);
    ctx.moveTo(editCenter + 95, dY + 9);
    ctx.lineTo(dRight, dY + 9);
    ctx.stroke();

    // Edited Patch Segment in Center
    ctx.fillStyle = isHdr ? "rgba(16, 185, 129, 0.22)" : "rgba(244, 63, 94, 0.22)";
    ctx.strokeStyle = isHdr ? "#10b981" : "#f43f5e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(editCenter - 95, dY - 20, 190, 40, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10.5px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(
      isHdr ? "✨ HDR DONOR INSERT: GAG (Glu6)" : "⚡ NHEJ INDEL: Δ4bp FRAMESHIFT",
      editCenter,
      dY + 4
    );

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillText(
      isHdr ? locus.hdrOutcome : locus.nhejOutcome,
      editCenter,
      repBox.y + repBox.h - 14
    );

    ctx.restore();
  }

  // Record Trial, Lab Dossier & CSV Export
  function getTrialSnapshot() {
    const locus = GENOMIC_LOCI[currentLocusKey];
    const E = computeAmplificationEfficiency();
    const copies = computeCopyYieldAtCycle(currentCycle);
    const ct = computeCtValue();
    const rn = computeFluorescenceRn(currentCycle);

    return {
      "Genomic Locus": locus.geneSymbol,
      "Amplicon Length (bp)": locus.ampliconBp,
      "Cycle (n)": currentCycle,
      "Annealing Temp Ta (°C)": annealTempC,
      "Amplification Efficiency (%)": (E * 100).toFixed(1),
      "Amplicon Yield (Copies)": formatSciCopies(copies),
      "SYBR Green ΔRn": rn.toFixed(2),
      "Cycle Threshold (Ct)": ct.toFixed(1),
      "CRISPR PAM": `5'-${locus.pamSequence}-3'`,
      "Repair Pathway": repairPathway.toUpperCase()
    };
  }

  btnRecord?.addEventListener("click", () => {
    const snap = getTrialSnapshot();
    LabTrialStore.addTrial("pcrcrispr", snap);
    SoundFX.success?.() || SoundFX.playBeep?.();
  });

  btnReport?.addEventListener("click", () => {
    const snap = getTrialSnapshot();
    openLabReportModal({
      labId: "pcrcrispr",
      labTitle: "PCR Thermal Cycler, Real-Time qPCR & CRISPR-Cas9 Gene Editing",
      moduleCode: "BIO-M12 / BIO-M11",
      currentRow: snap
    });
  });

  function triggerCsvExport() {
    const locus = GENOMIC_LOCI[currentLocusKey];
    const E = computeAmplificationEfficiency();
    const ct = computeCtValue();
    const cycles = [1, 5, 10, 15, 20, 25, 30, 35];
    const rows = cycles.map(c => ({
      "Target Locus": locus.geneSymbol,
      "Cycle (n)": c,
      "Annealing Temp (°C)": annealTempC,
      "Efficiency (%)": (E * 100).toFixed(1),
      "Ideal 2^n Factor": Math.pow(2, c),
      "Actual Amplicon Copies": computeCopyYieldAtCycle(c),
      "Fluorescence ΔRn": computeFluorescenceRn(c).toFixed(3),
      "Threshold Ct": ct.toFixed(1),
      "CRISPR PAM": `5'-${locus.pamSequence}-3'`,
      "Repair Mode": repairPathway.toUpperCase()
    }));

    exportLabDataCsv({
      labTitle: "PCR Thermal Cycler & CRISPR-Cas9 Gene Editing",
      moduleCode: "BIO-M12",
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
  animId = requestAnimationFrame(renderPcrCrisprCanvas);

  return function cleanupPcrCrisprLab() {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("resize", syncHiDPICanvas);
  };
}
