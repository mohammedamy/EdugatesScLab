// Edugates-ClipSAT Science Labs - Biology: PCR Thermal Cycler, Real-Time qPCR & CRISPR-Cas9 Gene Editing Suite
// 60 FPS Precision Molecular Biotechnology Simulation:
// 3-stage Peltier PCR thermal cycling (95°C Denaturation, 54-64°C Primer Annealing, 72°C Taq Extension),
// Exponential amplification N = N0 · (1 + E)^n, primer melting temperature Tm = 4(G+C) + 2(A+T),
// Real-time qPCR SYBR/TaqMan fluorescence sigmoid kinetics & Ct threshold quantification,
// CRISPR-Cas9 sgRNA R-loop formation, 5'-NGG-3' PAM recognition, HNH/RuvC double-strand break (DSB), and HDR vs NHEJ repair.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initPcrCrisprLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return () => {};

  // Target Genomic Loci & CRISPR-Cas9 Guide RNA Profiles
  const GENOMIC_LOCI = {
    hbb: {
      name: "HBB β-Globin (Sickle Cell Glu6Val)",
      geneSymbol: "HBB (Chr 11p15.4)",
      clinicalContext: "Autosomal recessive point mutation (GAG → GTG) replacing hydrophilic Glutamate with hydrophobic Valine.",
      ampliconBp: 248,
      initialCopiesN0: 100,
      primerForward: "5'-ACATTTGCTTCTGACACAAC-3'",
      primerReverse: "5'-TCTCCTTAAACCTGTCTTGT-3'",
      primerGcPct: 45,
      optimalTm: 58.0,
      targetStrand3to5: "3'-GACTCCTkCTCCTGTGACCAACCC-5'", // k highlights mutant A/T base
      nonTarget5to3:    "5'-CTGAGGAGTGAGGACACTGGTTGGG-3'",
      sgRnaSpacer:      "5'-CUGAGGAGUGAGGACACUGG-3'",
      pamSequence:      "5'-TGG-3' (Matches 5'-NGG-3')",
      hdrDonorSeq:      "5'-CTGACTCCTGAGGAGAAGTCTGCC-3' (Restores Wild-Type GAG Glu6)",
      nhejOutcome:      "4-bp deletion frameshift (β⁰-thalassemia null allele)",
      hdrOutcome:       "Wild-Type HbA β-globin restored (Glu6 GAG codon corrected)"
    },
    ccr5: {
      name: "CCR5 Co-Receptor (HIV-1 Resistance Locus)",
      geneSymbol: "CCR5 (Chr 3p21.31)",
      clinicalContext: "Chemokine receptor used by R5-tropic HIV-1 to enter CD4+ T lymphocytes; Δ32 knockout confers viral resistance.",
      ampliconBp: 312,
      initialCopiesN0: 250,
      primerForward: "5'-CAAAAAGAAGGTCTTCATTACACC-3'",
      primerReverse: "5'-CCTGTGCCTCTTCTTCTCATTTCG-3'",
      primerGcPct: 50,
      optimalTm: 60.0,
      targetStrand3to5: "3'-GTCAGTAGTCTACGTCCGAACCCA-5'",
      nonTarget5to3:    "5'-CAGTCATCAGATGCAGGCTTGGGT-3'",
      sgRnaSpacer:      "5'-CAGUCAUCAGAUGCAGGCUU-3'",
      pamSequence:      "5'-GGG-3' (Matches 5'-NGG-3')",
      hdrDonorSeq:      "5'-CAGTCATCA---Δ32---TTGGGT-3' (Precision Δ32 Deletion Cassette)",
      nhejOutcome:      "Biallelic Indel Frame-Shift → Truncated non-functional CCR5 receptor",
      hdrOutcome:       "Homozygous CCR5-Δ32 protective allele engineered with 98.4% fidelity"
    },
    brca1: {
      name: "BRCA1 Exon 11 (Tumor Suppressor Repair)",
      geneSymbol: "BRCA1 (Chr 17q21.31)",
      clinicalContext: "Homologous recombination DNA repair enzyme; pathogenic frameshift mutations predispose to hereditary cancer.",
      ampliconBp: 420,
      initialCopiesN0: 50,
      primerForward: "5'-GGAAAIRPCTGAAATCAGGA-3'".replace("IRP", "GC"),
      primerReverse: "5'-GTCCAGCTCCTGGCACTGG-3'",
      primerGcPct: 55,
      optimalTm: 62.0,
      targetStrand3to5: "3'-CCTTTCGAGACTTTAGTCCTACCC-5'",
      nonTarget5to3:    "5'-GGAAAGCTCTGAAATCAGGATGGG-3'",
      sgRnaSpacer:      "5'-GGAAAGCUCUGAAAUCAGGA-3'",
      pamSequence:      "5'-AGG-3' (Matches 5'-NGG-3')",
      hdrDonorSeq:      "5'-GGAAAGCTCTGAAATCAGGATGGG-3' (Restores Canonical Reading Frame)",
      nhejOutcome:      "Stochastic ±1–5 bp Indel → Loss of BRCA1 RING/BRCT domain function",
      hdrOutcome:       "Full-length functional BRCA1 reading frame restored via HDR template"
    }
  };

  // Thermal Cycling Stages
  const PCR_STAGES = [
    {
      id: "denature",
      name: "1. Denaturation (95°C)",
      tempC: 95,
      durationSec: 15,
      color: "#ef4444",
      mechanism: "Thermal agitation breaks hydrogen bonds (2 in A=T, 3 in G≡C), separating dsDNA into single-stranded templates."
    },
    {
      id: "anneal",
      name: "2. Primer Annealing",
      tempC: 58,
      durationSec: 20,
      color: "#38bdf8",
      mechanism: "Forward & Reverse primers hybridize to complementary 3' flanking regions on each template strand."
    },
    {
      id: "extend",
      name: "3. Taq Extension (72°C)",
      tempC: 72,
      durationSec: 30,
      color: "#10b981",
      mechanism: "Thermostable Taq DNA Polymerase synthesizes complementary DNA strands (5' → 3') using Mg²⁺ and dNTPs."
    }
  ];

  // State Variables
  let currentLocusKey = "hbb";
  let workbenchMode = "pcr"; // "pcr" (PCR & Real-Time qPCR) or "crispr" (CRISPR-Cas9 RNP Cleavage & HDR/NHEJ)
  let viewMode = "sim"; // "sim" or "photo"
  let currentStageIndex = 2; // Default show Taq Extension (index 2)
  let currentCycle = 25; // 1 to 35 cycles
  let annealTempC = 58; // 48 to 70 °C
  let crisprState = "cleaved"; // "scanning", "bound", "cleaved", "repaired"
  let repairPathway = "hdr"; // "hdr" (Homology-Directed Repair) or "nhej" (Non-Homologous End Joining)
  let isAutoCycling = false;
  let animId = null;
  let timeTick = 0;

  // Compute Primer Amplification Efficiency E (0.0 to 1.0) based on Annealing Temperature vs Optimal Tm
  function computeAmplificationEfficiency() {
    const locus = GENOMIC_LOCI[currentLocusKey];
    const deltaT = Math.abs(annealTempC - locus.optimalTm);
    // Peak efficiency ~0.96 when Ta is within 1-2°C of optimal Tm; drops sharply if Ta >> Tm (no annealing) or Ta << Tm (mispriming)
    if (annealTempC > locus.optimalTm + 2) {
      return Math.max(0.15, 0.96 * Math.exp(-Math.pow(deltaT - 1, 2) / 28));
    }
    return Math.max(0.35, 0.96 - 0.0045 * Math.pow(deltaT, 1.8));
  }

  // Compute Amplicon Copy Number N(c) = N0 * (1 + E)^c with plateau phase saturation
  function computeCopyNumber(cycleNum) {
    const locus = GENOMIC_LOCI[currentLocusKey];
    const E = computeAmplificationEfficiency();
    const rawExponential = locus.initialCopiesN0 * Math.pow(1 + E, cycleNum);
    // Primer/dNTP depletion plateau around 2.5e11 copies
    const Kmax = 2.8e11;
    return (Kmax * rawExponential) / (Kmax + rawExponential);
  }

  // Compute qPCR Normalized Fluorescence ΔRn (0.0 to 4.5) and Threshold Cycle Ct
  function computeFluorescenceRn(cycleNum) {
    const copies = computeCopyNumber(cycleNum);
    const baselineCopies = 1.2e7; // Fluorescence detection threshold
    return 4.2 / (1 + Math.pow(baselineCopies / Math.max(1, copies), 0.55));
  }

  function computeThresholdCycleCt() {
    const locus = GENOMIC_LOCI[currentLocusKey];
    const E = computeAmplificationEfficiency();
    const thresholdCopies = 4.5e6;
    const ct = Math.log(thresholdCopies / locus.initialCopiesN0) / Math.log(1 + E);
    return Math.max(8.0, Math.min(34.5, ct));
  }

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #10b981; box-shadow: 0 0 10px #10b981;"></span>
            PCR Thermal Cycler, qPCR &amp; CRISPR-Cas9 Gene Editing
          </span>
          <span class="badge" style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35); color: #34d399; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            ${renderLatex("N(n) = N_0 (1 + E)^n \\quad \\bullet \\quad \\text{PAM: } 5'\\text{-NGG-}3'")}
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.45); border-radius: 8px; padding: 3px; border: 1px solid rgba(16, 185, 129, 0.25);">
            <button id="view-mode-pcr-sim" class="btn btn-secondary active" style="padding: 5px 11px; font-size: 0.76rem; font-weight: 700; border-radius: 6px; border: none; background: #059669; color: #fff;">
              🧬 PCR Thermal Cycler
            </button>
            <button id="view-mode-crispr-sim" class="btn btn-secondary" style="padding: 5px 11px; font-size: 0.76rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              ✂️ CRISPR-Cas9 Editor
            </button>
            <button id="view-mode-pcr-photo" class="btn btn-secondary" style="padding: 5px 11px; font-size: 0.76rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-pcr-step" style="padding: 5px 13px; font-size: 0.76rem; font-weight: 700;">
            ▶ Cycle Thermal Stage
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-pcr-record" style="padding: 5px 11px; font-size: 0.76rem; border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;">
            📌 Record Trial
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-pcr-report" style="padding: 5px 11px; font-size: 0.76rem; border-color: rgba(168, 85, 247, 0.4); color: #c084fc;">
            📋 Lab Dossier
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-pcr-export" style="padding: 5px 11px; font-size: 0.76rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export CSV (E)
          </button>
        </div>
      </div>

      <!-- Main Layout Grid -->
      <div style="display: grid; grid-template-columns: 1.25fr 1fr; gap: 20px;" class="pcr-layout">
        <!-- Left Interactive 60 FPS Canvas & 4K Bench Viewport -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(16, 185, 129, 0.38); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at 50% 35%, #06281e 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 560px;">
          <canvas id="pcr-canvas" width="640" height="560" style="height: 560px; width: 100%; display: block; cursor: pointer;"></canvas>

          <!-- 4K Real Laboratory Photograph Overlay -->
          <div id="pcr-crispr-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <picture>
              <source srcset="assets/labs/pcr_crispr_bench.webp" type="image/webp">
              <img src="assets/labs/pcr_crispr_bench.jpg" decoding="async" loading="lazy" alt="4K Real-Time qPCR Thermal Cycler &amp; CRISPR-Cas9 Molecular Genetics Workbench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.96;">
            </picture>

            <div style="position: absolute; bottom: 18px; left: 18px; right: 18px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(16, 185, 129, 0.45); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.85);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Peltier Thermal Cycler</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.88rem;">96-Well Real-Time qPCR Fluorometer</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Polymerase &amp; Nuclease</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.88rem;">Taq DNA Pol + SpCas9-sgRNA RNP</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Target Specificity</div>
                <div style="color: #fbbf24; font-weight: 700; font-family: var(--font-mono); font-size: 0.88rem;">20-nt Spacer + 5'-NGG-3' PAM</div>
              </div>
            </div>
          </div>

          <!-- Top Telemetry HUD Overlay -->
          <div style="position: absolute; top: 12px; left: 14px; right: 14px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5; gap: 10px;">
            <div style="background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 10px; padding: 7px 13px; pointer-events: auto;">
              <div style="font-size: 0.65rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">PELTIER BLOCK &amp; STAGE</div>
              <div id="hud-pcr-stage" style="font-size: 1.02rem; font-weight: 800; color: #34d399; font-family: var(--font-mono);">
                72.0°C • Taq Extension (Cycle 25)
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 10px; padding: 7px 13px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.65rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">AMPLICON YIELD &amp; THRESHOLD Ct</div>
              <div id="hud-pcr-yield" style="font-size: 1.02rem; font-weight: 800; color: #38bdf8; font-family: var(--font-mono);">
                2.14 × 10⁹ Copies • Ct = 16.4
              </div>
            </div>
          </div>
        </div>

        <!-- Right Controls, Thermal Stage Selector & CRISPR-Cas9 Telemetry -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <!-- Genomic Target, Cycle Slider & Annealing Temp Controls -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div style="font-size: 0.75rem; font-weight: 700; color: #10b981; text-transform: uppercase;">Genomic Target &amp; Thermal Protocol</div>
              <span id="pcr-efficiency-badge" class="badge" style="background: rgba(16, 185, 129, 0.15); color: #34d399; font-size: 0.68rem; padding: 2px 8px; border-radius: 6px;">
                Efficiency E = 96.0%
              </span>
            </div>

            <!-- Target Gene Locus Selector -->
            <div class="control-group" style="margin-bottom: 10px;">
              <label for="pcr-locus-select" class="control-label" style="display: block; font-size: 0.75rem; color: #cbd5e1; font-weight: 600; margin-bottom: 4px;">
                Target Human Genomic Locus (Template DNA + sgRNA):
              </label>
              <select id="pcr-locus-select" aria-label="Select Genomic Target Locus" style="width: 100%; background: #030712; color: #f8fafc; border: 1px solid #334155; border-radius: 8px; padding: 7px 10px; font-size: 0.8rem; font-weight: 600;">
                <option value="hbb">🩸 HBB β-Globin Locus (Sickle Cell Glu6Val GAG→GTG Repair)</option>
                <option value="ccr5">🛡️ CCR5 Chemokine Receptor (HIV-1 Resistance Δ32 Knockout)</option>
                <option value="brca1">🧬 BRCA1 Exon 11 Locus (Hereditary Tumor Suppressor Restoration)</option>
              </select>
            </div>

            <!-- PCR Cycle Number Slider (n = 1 to 35) -->
            <div class="control-slider-group" style="margin-bottom: 10px;">
              <div class="slider-header" style="display: flex; justify-content: space-between; font-size: 0.76rem; margin-bottom: 3px;">
                <span style="color: #cbd5e1; font-weight: 600;">Thermal Cycle Number (n)</span>
                <span id="val-pcr-cycle" style="color: #38bdf8; font-family: var(--font-mono); font-weight: 700;">Cycle 25 / 35</span>
              </div>
              <input type="range" id="slider-pcr-cycle" min="1" max="35" step="1" value="25" style="width: 100%; accent-color: #10b981;">
            </div>

            <!-- Primer Annealing Temperature Slider (Ta = 48 to 70 °C) -->
            <div class="control-slider-group" style="margin-bottom: 10px;">
              <div class="slider-header" style="display: flex; justify-content: space-between; font-size: 0.76rem; margin-bottom: 3px;">
                <span style="color: #cbd5e1; font-weight: 600;">Primer Annealing Temp (T_a)</span>
                <span id="val-pcr-ta" style="color: #fbbf24; font-family: var(--font-mono); font-weight: 700;">58°C (Optimal Tm = 58°C)</span>
              </div>
              <input type="range" id="slider-pcr-ta" min="48" max="70" step="1" value="58" style="width: 100%; accent-color: #38bdf8;">
            </div>

            <!-- 3-Step PCR Stage & CRISPR Repair Pathway Quick Buttons -->
            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 10px;">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; font-weight: 600; margin-bottom: 4px;">Peltier Thermal Stage:</div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px;">
                  <button id="btn-stage-denature" class="btn btn-secondary" style="padding: 5px 4px; font-size: 0.68rem; font-weight: 600;">95°C Denat</button>
                  <button id="btn-stage-anneal" class="btn btn-secondary" style="padding: 5px 4px; font-size: 0.68rem; font-weight: 600;">58°C Anneal</button>
                  <button id="btn-stage-extend" class="btn btn-secondary active" style="padding: 5px 4px; font-size: 0.68rem; font-weight: 700; background: rgba(16, 185, 129, 0.25); border-color: #10b981; color: #fff;">72°C Extend</button>
                </div>
              </div>

              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; font-weight: 600; margin-bottom: 4px;">CRISPR DSB Repair Pathway:</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                  <button id="btn-repair-hdr" class="btn btn-secondary active" style="padding: 5px 6px; font-size: 0.68rem; font-weight: 700; background: rgba(56, 189, 248, 0.25); border-color: #38bdf8; color: #fff;">HDR Donor</button>
                  <button id="btn-repair-nhej" class="btn btn-secondary" style="padding: 5px 6px; font-size: 0.68rem; font-weight: 600;">NHEJ Indel</button>
                </div>
              </div>
            </div>
          </div>

          <!-- CRISPR-Cas9 Sequence Alignment & qPCR Telemetry Readout Card -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px 16px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #38bdf8; text-transform: uppercase;">CRISPR-Cas9 sgRNA &amp; qPCR Sequence Telemetry</div>
                <span id="crispr-pam-badge" class="badge" style="background: rgba(244, 63, 94, 0.15); color: #fb7185; font-size: 0.68rem; padding: 2px 8px; border-radius: 6px;">
                  PAM: 5'-TGG-3' Verified
                </span>
              </div>

              <!-- Sequence Alignment Box -->
              <div id="pcr-sequence-box" style="background: #030712; border: 1px solid #1e293b; border-radius: 8px; padding: 10px 12px; font-family: var(--font-mono); font-size: 0.72rem; line-height: 1.55; margin-bottom: 10px; overflow-x: auto;">
                <!-- Populated dynamically -->
              </div>

              <!-- Cycle Progression Table -->
              <div style="background: #030712; border: 1px solid #1e293b; border-radius: 8px; overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.71rem; text-align: left;">
                  <thead>
                    <tr style="background: rgba(15, 23, 42, 0.85); border-bottom: 1px solid #334155; color: #94a3b8;">
                      <th style="padding: 5px 8px;">Cycle (n)</th>
                      <th style="padding: 5px 8px;">Theoretical 2ⁿ</th>
                      <th style="padding: 5px 8px;">Actual Amplicons</th>
                      <th style="padding: 5px 8px;">SYBR ΔRn</th>
                      <th style="padding: 5px 8px;">Phase Status</th>
                    </tr>
                  </thead>
                  <tbody id="pcr-table-body">
                    <!-- Populated dynamically -->
                  </tbody>
                </table>
              </div>
            </div>

            <div id="pcr-biological-insight" style="margin-top: 10px; font-size: 0.73rem; color: #cbd5e1; line-height: 1.42; background: rgba(16, 185, 129, 0.08); border-left: 3px solid #10b981; border-radius: 6px; padding: 8px 12px;">
              <!-- Populated dynamically -->
            </div>
          </div>
        </div>
      </div>

      <!-- Post-Lab Competency Checkpoint Container -->
      <div id="pcr-checkpoint-container" style="margin-top: 24px; width: 100%;"></div>
    </div>
  `;

  // Mount Post-Lab Competency Checkpoint
  mountLabCheckpoint("pcr-checkpoint-container", "pcrcrispr");

  // DOM Elements
  const canvas = document.getElementById("pcr-canvas");
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

  const viewPcrBtn = document.getElementById("view-mode-pcr-sim");
  const viewCrisprBtn = document.getElementById("view-mode-crispr-sim");
  const viewPhotoBtn = document.getElementById("view-mode-pcr-photo");
  const photoOverlay = document.getElementById("pcr-crispr-photo-overlay");

  const btnStep = document.getElementById("btn-pcr-step");
  const btnRecord = document.getElementById("btn-pcr-record");
  const btnReport = document.getElementById("btn-pcr-report");
  const btnExport = document.getElementById("btn-pcr-export");

  const locusSelect = document.getElementById("pcr-locus-select");
  const sliderCycle = document.getElementById("slider-pcr-cycle");
  const valCycle = document.getElementById("val-pcr-cycle");
  const sliderTa = document.getElementById("slider-pcr-ta");
  const valTa = document.getElementById("val-pcr-ta");
  const effBadge = document.getElementById("pcr-efficiency-badge");
  const pamBadge = document.getElementById("crispr-pam-badge");

  const btnStageDenature = document.getElementById("btn-stage-denature");
  const btnStageAnneal = document.getElementById("btn-stage-anneal");
  const btnStageExtend = document.getElementById("btn-stage-extend");

  const btnRepairHdr = document.getElementById("btn-repair-hdr");
  const btnRepairNhej = document.getElementById("btn-repair-nhej");

  const hudStage = document.getElementById("hud-pcr-stage");
  const hudYield = document.getElementById("hud-pcr-yield");
  const seqBox = document.getElementById("pcr-sequence-box");
  const tableBody = document.getElementById("pcr-table-body");
  const insightBox = document.getElementById("pcr-biological-insight");

  function formatSciCopies(num) {
    if (num < 1e4) return Math.round(num).toLocaleString();
    const exp = Math.floor(Math.log10(num));
    const mant = (num / Math.pow(10, exp)).toFixed(2);
    return `${mant} × 10^${exp}`;
  }

  function updateHUD() {
    const locus = GENOMIC_LOCI[currentLocusKey];
    PCR_STAGES[1].tempC = annealTempC;
    const stage = PCR_STAGES[currentStageIndex];
    const E = computeAmplificationEfficiency();
    const copies = computeCopyNumber(currentCycle);
    const ct = computeThresholdCycleCt();

    valCycle.textContent = `Cycle ${currentCycle} / 35`;
    valTa.textContent = `${annealTempC}°C (Optimal Tm = ${locus.optimalTm}°C)`;
    btnStageAnneal.textContent = `${annealTempC}°C Anneal`;

    effBadge.textContent = `Efficiency E = ${(E * 100).toFixed(1)}%`;
    effBadge.style.color = E > 0.85 ? "#34d399" : (E > 0.6 ? "#fbbf24" : "#f87171");

    pamBadge.textContent = `PAM: ${locus.pamSequence.split(" ")[0]} Verified`;

    if (workbenchMode === "pcr") {
      hudStage.textContent = `${stage.tempC}.0°C • ${stage.name.slice(3)} (Cycle ${currentCycle})`;
      hudStage.style.color = stage.color;
    } else {
      hudStage.textContent = `SpCas9-sgRNA RNP • ${repairPathway.toUpperCase()} Editing`;
      hudStage.style.color = "#f43f5e";
    }

    hudYield.textContent = `${formatSciCopies(copies)} Copies • Ct = ${ct.toFixed(1)}`;

    // Sequence Alignment Box
    seqBox.innerHTML = `
      <div style="color: #94a3b8;">Target Locus: <strong style="color: #f8fafc;">${locus.geneSymbol}</strong> (${locus.ampliconBp} bp Amplicon)</div>
      <div style="color: #38bdf8;">sgRNA Spacer: <span style="color: #facc15;">${locus.sgRnaSpacer}</span> <span style="color: #fb7185; font-weight: 700;">[PAM: ${locus.pamSequence.split(" ")[0]}]</span></div>
      <div style="color: #34d399;">${repairPathway === "hdr" ? `HDR Donor:    ${locus.hdrDonorSeq}` : `NHEJ Outcome: ${locus.nhejOutcome}`}</div>
    `;

    // Populate Cycle Benchmarks Table (Cycles 5, 15, 20, currentCycle, 35)
    const sampleCycles = Array.from(new Set([5, 15, 20, currentCycle, 35])).sort((a, b) => a - b);
    tableBody.innerHTML = sampleCycles.map(c => {
      const theoFactor = Math.pow(2, c);
      const cCopies = computeCopyNumber(c);
      const rn = computeFluorescenceRn(c);
      const isCur = c === currentCycle;
      let phase = "Baseline";
      if (c >= ct && c < 28) phase = "Exponential (Log)";
      else if (c >= 28) phase = "Plateau Saturation";

      return `
        <tr data-cyc="${c}" style="border-bottom: 1px solid #1e293b; background: ${isCur ? 'rgba(16, 185, 129, 0.18)' : 'transparent'}; cursor: pointer;">
          <td style="padding: 5px 8px; font-weight: 700; color: #f8fafc; font-family: var(--font-mono);">Cycle ${c}</td>
          <td style="padding: 5px 8px; color: #94a3b8; font-family: var(--font-mono);">2^${c}</td>
          <td style="padding: 5px 8px; color: #34d399; font-family: var(--font-mono); font-weight: 700;">${formatSciCopies(cCopies)}</td>
          <td style="padding: 5px 8px; color: #38bdf8; font-family: var(--font-mono);">${rn.toFixed(2)}</td>
          <td style="padding: 5px 8px; color: ${c >= ct ? '#fbbf24' : '#64748b'}; font-weight: 600; font-size: 0.66rem;">${phase}</td>
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

    if (workbenchMode === "pcr") {
      insightBox.innerHTML = formatMathText(
        `<strong>${stage.name}:</strong> ${stage.mechanism} At $T_a = ${annealTempC}^\\circ\\text{C}$, primer hybridization efficiency is $E = ${(E * 100).toFixed(1)}\\%$, crossing the fluorescence threshold at $C_t = ${ct.toFixed(1)}\\text{ cycles}$.`
      );
    } else {
      insightBox.innerHTML = formatMathText(
        `<strong>CRISPR-Cas9 Endonuclease (${locus.geneSymbol}):</strong> Cas9 locates the $5'\\text{-NGG-}3'$ PAM motif, unwinds the DNA duplex to form an RNA-DNA R-loop with the 20-nt sgRNA spacer, and cleaves both strands 3 bp upstream of PAM via its <strong>HNH</strong> and <strong>RuvC</strong> catalytic domains. <strong>${repairPathway === 'hdr' ? locus.hdrOutcome : locus.nhejOutcome}</strong>.`
      );
    }
  }

  // 60 FPS Canvas Rendering Loop
  function renderPcrCrisprCanvas() {
    if (!container || !container.isConnected) return;
    timeTick += 0.035;

    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : Math.min(window.devicePixelRatio || 1, 2);
    ctx.save();
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, logicalW, logicalH);

    // Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, logicalH);
    bgGrad.addColorStop(0, "#061e18");
    bgGrad.addColorStop(1, "#030712");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, logicalW, logicalH);

    // Subtle Grid
    ctx.strokeStyle = "rgba(16, 185, 129, 0.04)";
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

    if (workbenchMode === "crispr") {
      renderCrisprMolecularEditor(ctx);
    } else {
      renderPcrThermalAndQpcrView(ctx);
    }

    ctx.restore();
    animId = requestAnimationFrame(renderPcrCrisprCanvas);
  }

  function renderPcrThermalAndQpcrView(ctx) {
    const stage = PCR_STAGES[currentStageIndex];
    const locus = GENOMIC_LOCI[currentLocusKey];

    // =========================================================================
    // 1. TOP PANEL: MOLECULAR DNA STRAND SEPARATION, PRIMER ANNEALING & TAQ
    // =========================================================================
    const molBoxX = 24;
    const molBoxY = 74;
    const molBoxW = 592;
    const molBoxH = 228;

    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.strokeStyle = stage.color;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(molBoxX, molBoxY, molBoxW, molBoxH, 10);
    ctx.fill();
    ctx.stroke();

    // Stage Banner Header inside Molecular Viewport
    ctx.fillStyle = stage.color;
    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText(`MOLECULAR VIEWPORT — ${stage.name.toUpperCase()}`, molBoxX + 14, molBoxY + 20);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "9.5px 'JetBrains Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText(`Template: ${locus.geneSymbol} (${locus.ampliconBp} bp)`, molBoxX + molBoxW - 14, molBoxY + 20);

    // Calculate Dynamic Strand Separation Distance based on Stage
    // Stage 0 (95°C Denature): wide separation (66 px)
    // Stage 1 (58°C Anneal): medium separation (52 px) with primers annealed
    // Stage 2 (72°C Extend): Taq Polymerase actively synthesizing new daughter strands!
    const centerY = molBoxY + 125;
    const sepHalf = currentStageIndex === 0 ? 56 + Math.sin(timeTick * 3) * 4 : (currentStageIndex === 1 ? 48 : 46);
    const topStrandY = centerY - sepHalf;
    const botStrandY = centerY + sepHalf;
    const startX = molBoxX + 46;
    const endX = molBoxX + molBoxW - 46;
    const numBases = 22;
    const baseStep = (endX - startX) / (numBases - 1);
    const basesTop = ["C","T","G","A","G","G","A","G","T","G","A","G","G","A","C","A","C","T","G","G","T","T"];
    const compMap = { A: "T", T: "A", C: "G", G: "C" };
    const baseColor = { A: "#10b981", T: "#f43f5e", C: "#38bdf8", G: "#fbbf24" };

    // Draw Top Template Strand (5' -> 3') and Bottom Template Strand (3' -> 5')
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(startX - 15, topStrandY);
    ctx.lineTo(endX + 15, topStrandY);
    ctx.stroke();

    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(startX - 15, botStrandY);
    ctx.lineTo(endX + 15, botStrandY);
    ctx.stroke();

    // 5' and 3' Polarity Labels
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("5'", startX - 24, topStrandY + 3);
    ctx.fillText("3'", endX + 24, topStrandY + 3);
    ctx.fillText("3'", startX - 24, botStrandY + 3);
    ctx.fillText("5'", endX + 24, botStrandY + 3);

    // Draw Nucleotide Rungs on Both Template Strands
    for (let i = 0; i < numBases; i++) {
      const bx = startX + i * baseStep;
      const bTop = basesTop[i % basesTop.length];
      const bBot = compMap[bTop];

      // Top base peg
      ctx.strokeStyle = baseColor[bTop];
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(bx, topStrandY);
      ctx.lineTo(bx, topStrandY + 14);
      ctx.stroke();

      // Bottom base peg
      ctx.strokeStyle = baseColor[bBot];
      ctx.beginPath();
      ctx.moveTo(bx, botStrandY);
      ctx.lineTo(bx, botStrandY - 14);
      ctx.stroke();

      // In Denaturation (95°C), show cleaved thermal H-bond sparks
      if (currentStageIndex === 0 && i % 2 === 0) {
        ctx.fillStyle = "rgba(239, 68, 68, 0.55)";
        ctx.beginPath();
        ctx.arc(bx, centerY + Math.sin(timeTick * 5 + i) * 8, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // In Stage 1 (Annealing) and Stage 2 (Extension), draw Forward & Reverse Primers + Taq Polymerase!
    if (currentStageIndex >= 1) {
      // Reverse Primer annealed to 3' end of Top Strand (right side, extending leftward)
      const revStartIdx = 15;
      const extendCount = currentStageIndex === 2 ? Math.floor(((timeTick * 4) % 15)) : 0;
      const activeLeftIdx = Math.max(1, revStartIdx - extendCount);

      // Top Daughter Strand Backbone (synthesized 5'<-3' right-to-left)
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(startX + activeLeftIdx * baseStep, topStrandY + 24);
      ctx.lineTo(startX + (numBases - 1) * baseStep, topStrandY + 24);
      ctx.stroke();

      // Forward Primer annealed to 3' end of Bottom Strand (left side, extending rightward)
      const fwdEndIdx = 6 + extendCount;
      const activeRightIdx = Math.min(numBases - 2, fwdEndIdx);

      ctx.strokeStyle = "#f43f5e";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(startX, botStrandY - 24);
      ctx.lineTo(startX + activeRightIdx * baseStep, botStrandY - 24);
      ctx.stroke();

      // Draw Taq DNA Polymerase Enzyme Globules at the 3'-OH Extension Forks in Stage 2!
      if (currentStageIndex === 2) {
        const taqTopX = startX + activeLeftIdx * baseStep;
        const taqBotX = startX + activeRightIdx * baseStep;

        // Top Taq Enzyme
        ctx.save();
        ctx.fillStyle = "rgba(16, 185, 129, 0.9)";
        ctx.strokeStyle = "#a7f3d0";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(taqTopX, topStrandY + 20, 18, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#022c22";
        ctx.font = "bold 8px 'JetBrains Mono', monospace";
        ctx.fillText("Taq", taqTopX, topStrandY + 23);

        // Bottom Taq Enzyme
        ctx.fillStyle = "rgba(16, 185, 129, 0.9)";
        ctx.beginPath();
        ctx.ellipse(taqBotX, botStrandY - 20, 18, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#022c22";
        ctx.fillText("Taq", taqBotX, botStrandY - 17);
        ctx.restore();
      }
    }

    // =========================================================================
    // 2. BOTTOM LEFT: PELTIER THERMAL CYCLING PROFILE (TEMP °C vs TIME)
    // =========================================================================
    const profX = 24;
    const profY = 318;
    const profW = 275;
    const profH = 222;

    ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
    ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(profX, profY, profW, profH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 9.5px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText("PELTIER THERMAL CYCLER BLOCK", profX + 12, profY + 18);

    // Draw 3-Step Temperature Staircase Curve (95°C -> Anneal°C -> 72°C)
    const pPlotX = profX + 32;
    const pPlotY = profY + 38;
    const pPlotW = profW - 48;
    const pPlotH = profH - 64;

    const y95 = pPlotY + 18;
    const y72 = pPlotY + pPlotH * 0.48;
    const yTa = pPlotY + pPlotH * (1 - (annealTempC - 40) / 65);

    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    ctx.strokeRect(pPlotX, pPlotY, pPlotW, pPlotH);

    // Step Path
    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(pPlotX, y95);
    ctx.lineTo(pPlotX + pPlotW * 0.3, y95);
    ctx.lineTo(pPlotX + pPlotW * 0.35, yTa);
    ctx.lineTo(pPlotX + pPlotW * 0.65, yTa);
    ctx.lineTo(pPlotX + pPlotW * 0.7, y72);
    ctx.lineTo(pPlotX + pPlotW, y72);
    ctx.stroke();

    // Active Stage Glowing Indicator Dot
    const stageCenters = [
      { x: pPlotX + pPlotW * 0.15, y: y95, label: "95°C", col: "#ef4444" },
      { x: pPlotX + pPlotW * 0.50, y: yTa, label: `${annealTempC}°C`, col: "#38bdf8" },
      { x: pPlotX + pPlotW * 0.85, y: y72, label: "72°C", col: "#10b981" }
    ];

    stageCenters.forEach((sc, idx) => {
      const isAct = idx === currentStageIndex;
      ctx.fillStyle = sc.col;
      ctx.beginPath();
      ctx.arc(sc.x, sc.y, isAct ? 6 : 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isAct ? "#fff" : "#94a3b8";
      ctx.font = isAct ? "bold 9.5px 'JetBrains Mono', monospace" : "8.5px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(sc.label, sc.x, sc.y - 10);
    });

    // =========================================================================
    // 3. BOTTOM RIGHT: REAL-TIME qPCR AMPLIFICATION PLOT (ΔRn vs CYCLE 1..35)
    // =========================================================================
    const qpcrX = 315;
    const qpcrY = 318;
    const qpcrW = 301;
    const qpcrH = 222;

    ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
    ctx.strokeStyle = "rgba(16, 185, 129, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(qpcrX, qpcrY, qpcrW, qpcrH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#10b981";
    ctx.font = "bold 9.5px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText("REAL-TIME qPCR AMPLIFICATION (ΔRn)", qpcrX + 12, qpcrY + 18);

    const qPlotX = qpcrX + 34;
    const qPlotY = qpcrY + 34;
    const qPlotW = qpcrW - 48;
    const qPlotH = qpcrH - 58;

    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    ctx.strokeRect(qPlotX, qPlotY, qPlotW, qPlotH);

    // Horizontal Ct Threshold Line (ΔRn = 1.0)
    const threshY = qPlotY + qPlotH * (1 - 1.0 / 4.5);
    ctx.save();
    ctx.strokeStyle = "#f43f5e";
    ctx.lineWidth = 1.3;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(qPlotX, threshY);
    ctx.lineTo(qPlotX + qPlotW, threshY);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "#fb7185";
    ctx.font = "bold 8px 'JetBrains Mono', monospace";
    ctx.textAlign = "right";
    const ct = computeThresholdCycleCt();
    ctx.fillText(`Threshold Ct = ${ct.toFixed(1)}`, qPlotX + qPlotW - 4, threshY - 4);

    // Sigmoidal SYBR Green Fluorescence Curve across Cycles 1..35
    ctx.strokeStyle = "#34d399";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let c = 1; c <= 35; c++) {
      const cx = qPlotX + ((c - 1) / 34) * qPlotW;
      const rn = computeFluorescenceRn(c);
      const cy = qPlotY + qPlotH * (1 - rn / 4.5);
      if (c === 1) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    // Active Cycle Marker on Curve
    const curX = qPlotX + ((currentCycle - 1) / 34) * qPlotW;
    const curRn = computeFluorescenceRn(currentCycle);
    const curY = qPlotY + qPlotH * (1 - curRn / 4.5);

    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(curX, curY, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // X-axis cycle ticks
    ctx.fillStyle = "#94a3b8";
    ctx.font = "8px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    for (let c = 5; c <= 35; c += 10) {
      const tx = qPlotX + ((c - 1) / 34) * qPlotW;
      ctx.fillText(`C${c}`, tx, qPlotY + qPlotH + 12);
    }
  }

  // CRISPR-Cas9 Endonuclease R-Loop, PAM Recognition & Double-Strand Break (DSB) Canvas View
  function renderCrisprMolecularEditor(ctx) {
    const locus = GENOMIC_LOCI[currentLocusKey];

    // Title Banner
    ctx.fillStyle = "#34d399";
    ctx.font = "bold 11.5px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(`CRISPR-SpCas9 RIBONUCLEOPROTEIN (RNP) COMPLEX — ${locus.geneSymbol}`, logicalW / 2, 92);

    // 1. Draw SpCas9 Bilobed Endonuclease Halo (REC Lobe + NUC Lobe)
    const casX = logicalW / 2;
    const casY = 255;

    const casGrad = ctx.createRadialGradient(casX, casY, 20, casX, casY, 155);
    casGrad.addColorStop(0, "rgba(16, 185, 129, 0.25)");
    casGrad.addColorStop(0.6, "rgba(6, 182, 212, 0.14)");
    casGrad.addColorStop(1, "rgba(15, 23, 42, 0)");
    ctx.fillStyle = casGrad;
    ctx.beginPath();
    ctx.ellipse(casX, casY, 195, 125, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(52, 211, 153, 0.45)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(casX, casY, 185, 112, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Unwound DNA R-Loop Bubble inside Cas9 Complex
    // Target Strand (3' -> 5', top) & Non-Target Strand (5' -> 3', bottom with 5'-NGG-3' PAM)
    const cutX = casX + 42; // 3 bp upstream of PAM!
    const pamX = casX + 88;

    // Target DNA Strand (Blue) with R-Loop Displacement
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(55, casY - 12);
    ctx.lineTo(155, casY - 12);
    ctx.bezierCurveTo(200, casY - 68, 360, casY - 68, cutX - 6, casY - 52);
    ctx.stroke();

    // Cleaved right segment of Target Strand
    ctx.beginPath();
    ctx.moveTo(cutX + 8, casY - 50);
    ctx.bezierCurveTo(435, casY - 35, 465, casY - 12, 585, casY - 12);
    ctx.stroke();

    // Non-Target DNA Strand (Emerald) containing 5'-NGG-3' PAM
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(55, casY + 12);
    ctx.lineTo(155, casY + 12);
    ctx.bezierCurveTo(200, casY + 62, 360, casY + 62, cutX - 6, casY + 48);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cutX + 8, casY + 48);
    ctx.bezierCurveTo(435, casY + 35, 465, casY + 12, 585, casY + 12);
    ctx.stroke();

    // 3. Single-Guide RNA (sgRNA) 20-nt Spacer Hybridized to Target DNA Strand + Hairpin Scaffold
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(195, casY - 36);
    ctx.lineTo(cutX - 4, casY - 36);
    // tracrRNA scaffold loops
    ctx.bezierCurveTo(cutX + 25, casY - 36, cutX + 35, casY + 5, cutX - 15, casY + 8);
    ctx.stroke();

    ctx.fillStyle = "#facc15";
    ctx.font = "bold 9.5px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(`20-nt sgRNA Spacer: ${locus.sgRnaSpacer}`, casX - 25, casY - 20);

    // 4. Highlight 5'-NGG-3' PAM Motif Box on Non-Target Strand
    ctx.fillStyle = "rgba(244, 63, 94, 0.25)";
    ctx.strokeStyle = "#f43f5e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(pamX - 26, casY - 2, 62, 30, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fda4af";
    ctx.font = "bold 9.5px 'JetBrains Mono', monospace";
    ctx.fillText("PAM (NGG)", pamX + 5, casY + 17);

    // 5. HNH and RuvC Nuclease Cleavage Scissors at Double-Strand Break (3 bp upstream of PAM)
    const pulse = Math.sin(timeTick * 4) * 3;
    ctx.fillStyle = "#f43f5e";
    ctx.beginPath();
    ctx.arc(cutX, casY - 52 - pulse, 8, 0, Math.PI * 2);
    ctx.arc(cutX, casY + 48 + pulse, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 8.5px 'JetBrains Mono', monospace";
    ctx.fillText("HNH Cut", cutX, casY - 66);
    ctx.fillText("RuvC Cut", cutX, casY + 68);

    // 6. Bottom Repair Pathway Card (HDR Precision Donor vs NHEJ Knockout)
    const repX = 48;
    const repY = 415;
    const repW = 544;
    const repH = 118;

    ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
    ctx.strokeStyle = repairPathway === "hdr" ? "#38bdf8" : "#f59e0b";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(repX, repY, repW, repH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = repairPathway === "hdr" ? "#38bdf8" : "#fbbf24";
    ctx.font = "bold 10.5px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      repairPathway === "hdr"
        ? "ACTIVE PATHWAY: HOMOLOGY-DIRECTED REPAIR (HDR WITH DONOR TEMPLATE)"
        : "ACTIVE PATHWAY: NON-HOMOLOGOUS END JOINING (NHEJ INDEL KNOCKOUT)",
      repX + 16,
      repY + 24
    );

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "9.5px 'JetBrains Mono', monospace";
    ctx.fillText(
      repairPathway === "hdr" ? `Donor Template: ${locus.hdrDonorSeq}` : `Mutational Effect: ${locus.nhejOutcome}`,
      repX + 16,
      repY + 48
    );
    ctx.fillStyle = "#34d399";
    ctx.fillText(
      `Phenotypic Result: ${repairPathway === "hdr" ? locus.hdrOutcome : locus.nhejOutcome}`,
      repX + 16,
      repY + 72
    );
    ctx.fillStyle = "#94a3b8";
    ctx.font = "8.5px sans-serif";
    ctx.fillText(
      "Tip: Click the 95°C / 58°C / 72°C buttons or switch between PCR Thermal Cycler and CRISPR-Cas9 Editor.",
      repX + 16,
      repY + 98
    );
  }

  // Stage Selection Helper
  function selectPcrStage(idx) {
    currentStageIndex = idx;
    [btnStageDenature, btnStageAnneal, btnStageExtend].forEach((b, i) => {
      const isAct = i === idx;
      b.classList.toggle("active", isAct);
      b.style.background = isAct ? "rgba(16, 185, 129, 0.25)" : "transparent";
      b.style.borderColor = isAct ? "#10b981" : "";
      b.style.color = isAct ? "#fff" : "";
    });
    SoundFX.click?.() || SoundFX.playClick?.();
    updateHUD();
  }

  btnStageDenature.addEventListener("click", () => selectPcrStage(0));
  btnStageAnneal.addEventListener("click", () => selectPcrStage(1));
  btnStageExtend.addEventListener("click", () => selectPcrStage(2));

  btnStep.addEventListener("click", () => {
    const nextStage = (currentStageIndex + 1) % 3;
    if (nextStage === 0 && currentCycle < 35) {
      currentCycle++;
      sliderCycle.value = String(currentCycle);
    }
    selectPcrStage(nextStage);
  });

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

  btnRepairHdr.addEventListener("click", () => {
    repairPathway = "hdr";
    btnRepairHdr.classList.add("active");
    btnRepairNhej.classList.remove("active");
    btnRepairHdr.style.background = "rgba(56, 189, 248, 0.25)";
    btnRepairHdr.style.borderColor = "#38bdf8";
    btnRepairNhej.style.background = "transparent";
    btnRepairNhej.style.borderColor = "";
    SoundFX.click?.() || SoundFX.playClick?.();
    updateHUD();
  });

  btnRepairNhej.addEventListener("click", () => {
    repairPathway = "nhej";
    btnRepairNhej.classList.add("active");
    btnRepairHdr.classList.remove("active");
    btnRepairNhej.style.background = "rgba(245, 158, 11, 0.25)";
    btnRepairNhej.style.borderColor = "#f59e0b";
    btnRepairHdr.style.background = "transparent";
    btnRepairHdr.style.borderColor = "";
    SoundFX.click?.() || SoundFX.playClick?.();
    updateHUD();
  });

  // View Switcher (PCR Thermal Cycler vs CRISPR-Cas9 Editor vs 4K Real Bench)
  function updateViewTabs(activeBtn) {
    [viewPcrBtn, viewCrisprBtn, viewPhotoBtn].forEach(b => {
      b.classList.remove("active");
      b.style.background = "transparent";
    });
    activeBtn.classList.add("active");
    activeBtn.style.background = "#059669";
  }

  viewPcrBtn.addEventListener("click", () => {
    viewMode = "sim";
    workbenchMode = "pcr";
    updateViewTabs(viewPcrBtn);
    photoOverlay.style.display = "none";
    canvas.style.display = "block";
    SoundFX.click?.() || SoundFX.playClick?.();
    updateHUD();
  });

  viewCrisprBtn.addEventListener("click", () => {
    viewMode = "sim";
    workbenchMode = "crispr";
    updateViewTabs(viewCrisprBtn);
    photoOverlay.style.display = "none";
    canvas.style.display = "block";
    SoundFX.click?.() || SoundFX.playClick?.();
    updateHUD();
  });

  viewPhotoBtn.addEventListener("click", () => {
    viewMode = "photo";
    updateViewTabs(viewPhotoBtn);
    photoOverlay.style.display = "block";
    canvas.style.display = "none";
    SoundFX.click?.() || SoundFX.playClick?.();
  });

  // Record Trial
  btnRecord.addEventListener("click", () => {
    const locus = GENOMIC_LOCI[currentLocusKey];
    const E = computeAmplificationEfficiency();
    const copies = computeCopyNumber(currentCycle);
    const ct = computeThresholdCycleCt();
    LabTrialStore.addTrial("pcrcrispr", {
      Locus: locus.geneSymbol,
      "Cycle (n)": currentCycle,
      "Anneal T_a (°C)": `${annealTempC}°C`,
      "Efficiency E": `${(E * 100).toFixed(1)}%`,
      "Threshold Ct": ct.toFixed(2),
      "Amplicon Copies": formatSciCopies(copies),
      "CRISPR Pathway": repairPathway.toUpperCase()
    });
    SoundFX.success?.() || SoundFX.playBeep?.();
  });

  // Lab Report Dossier
  btnReport.addEventListener("click", () => {
    const locus = GENOMIC_LOCI[currentLocusKey];
    const E = computeAmplificationEfficiency();
    const ct = computeThresholdCycleCt();
    openLabReportModal({
      title: "PCR Thermal Cycling, Real-Time qPCR & CRISPR-Cas9 Gene Editing",
      subject: "Biology",
      inquiryQuestion: "How do primer annealing kinetics govern exponential PCR amplification (N = N0·(1+E)^n), and how does Cas9-sgRNA achieve site-specific genomic repair via PAM recognition?",
      canvasElement: canvas,
      parameters: {
        "Genomic Target Locus": `${locus.name} (${locus.geneSymbol})`,
        "Amplicon Length": `${locus.ampliconBp} bp`,
        "Annealing Temperature": `${annealTempC}°C (Optimal Tm = ${locus.optimalTm}°C)`,
        "Amplification Efficiency (E)": `${(E * 100).toFixed(1)}%`,
        "Threshold Cycle (Ct)": `${ct.toFixed(2)} cycles`,
        "CRISPR PAM & Repair Mode": `${locus.pamSequence} • ${repairPathway.toUpperCase()}`
      },
      formulas: [
        "N(n) = N_0 (1 + E)^n",
        "T_m = 4(\\text{G} + \\text{C}) + 2(\\text{A} + \\text{T})",
        "\\text{Fold Change} = 2^{-\\Delta\\Delta C_t}"
      ],
      trials: LabTrialStore.getTrials("pcrcrispr")
    });
  });

  // CSV Telemetry Export
  btnExport.addEventListener("click", () => {
    const locus = GENOMIC_LOCI[currentLocusKey];
    const E = computeAmplificationEfficiency();
    const ct = computeThresholdCycleCt();
    const exportCycles = [1, 5, 10, 15, 20, 25, 30, 35];

    exportLabDataCsv({
      title: "PCR Thermal Cycler, qPCR & CRISPR-Cas9 Gene Editing",
      labId: "pcrcrispr",
      parameters: {
        "Target Gene Locus": locus.name,
        "Amplicon Size (bp)": locus.ampliconBp,
        "Initial Template Copies (N0)": locus.initialCopiesN0,
        "Annealing Temp Ta (C)": annealTempC,
        "Amplification Efficiency (%)": (E * 100).toFixed(2),
        "Threshold Cycle (Ct)": ct.toFixed(2),
        "CRISPR sgRNA Spacer": locus.sgRnaSpacer,
        "CRISPR Repair Pathway": repairPathway.toUpperCase()
      },
      headers: ["Cycle Number (n)", "Theoretical Ideal Factor (2^n)", "Actual Amplicon Yield (Copies)", "Normalized Fluorescence (dRn)", "Amplification Phase"],
      dataRows: exportCycles.map(c => {
        const copies = computeCopyNumber(c);
        const rn = computeFluorescenceRn(c);
        const phase = c < ct ? "Baseline" : (c < 28 ? "Exponential" : "Plateau");
        return [
          c,
          Math.pow(2, c),
          Math.round(copies),
          rn.toFixed(4),
          phase
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
  animId = requestAnimationFrame(renderPcrCrisprCanvas);

  return function cleanupPcrCrisprLab() {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("resize", setupHiDPICanvas);
  };
}
