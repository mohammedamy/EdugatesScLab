// Edugates-ClipSAT Science Labs - Biology: Molecular Genetics & Protein Synthesis Engine
// High-Fidelity Simulation: 4K Macromolecular Crystal Photography, Antiparallel Double Helix,
// RNA Polymerase Transcription Bubble, Ribosome A/P/E Translation Cycle, and Genetic Mutation Pathology.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";

export function initDnaProteinLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const geneticCode = {
    // Complete Universal Genetic Code (All 64 Triplet Codons)
    AUG: { aa: "Methionine (START)", code: "Met", color: "#10b981" },
    UUU: { aa: "Phenylalanine", code: "Phe", color: "#3b82f6" },
    UUC: { aa: "Phenylalanine", code: "Phe", color: "#3b82f6" },
    UUA: { aa: "Leucine", code: "Leu", color: "#06b6d4" },
    UUG: { aa: "Leucine", code: "Leu", color: "#06b6d4" },
    CUU: { aa: "Leucine", code: "Leu", color: "#06b6d4" },
    CUC: { aa: "Leucine", code: "Leu", color: "#06b6d4" },
    CUA: { aa: "Leucine", code: "Leu", color: "#06b6d4" },
    CUG: { aa: "Leucine", code: "Leu", color: "#06b6d4" },
    AUU: { aa: "Isoleucine", code: "Ile", color: "#0284c7" },
    AUC: { aa: "Isoleucine", code: "Ile", color: "#0284c7" },
    AUA: { aa: "Isoleucine", code: "Ile", color: "#0284c7" },
    GUU: { aa: "Valine", code: "Val", color: "#14b8a6" },
    GUC: { aa: "Valine", code: "Val", color: "#14b8a6" },
    GUA: { aa: "Valine", code: "Val", color: "#14b8a6" },
    GUG: { aa: "Valine", code: "Val", color: "#14b8a6" },
    UCU: { aa: "Serine", code: "Ser", color: "#8b5cf6" },
    UCC: { aa: "Serine", code: "Ser", color: "#8b5cf6" },
    UCA: { aa: "Serine", code: "Ser", color: "#8b5cf6" },
    UCG: { aa: "Serine", code: "Ser", color: "#8b5cf6" },
    AGU: { aa: "Serine", code: "Ser", color: "#8b5cf6" },
    AGC: { aa: "Serine", code: "Ser", color: "#8b5cf6" },
    CCU: { aa: "Proline", code: "Pro", color: "#ec4899" },
    CCC: { aa: "Proline", code: "Pro", color: "#ec4899" },
    CCA: { aa: "Proline", code: "Pro", color: "#ec4899" },
    CCG: { aa: "Proline", code: "Pro", color: "#ec4899" },
    ACU: { aa: "Threonine", code: "Thr", color: "#f97316" },
    ACC: { aa: "Threonine", code: "Thr", color: "#f97316" },
    ACA: { aa: "Threonine", code: "Thr", color: "#f97316" },
    ACG: { aa: "Threonine", code: "Thr", color: "#f97316" },
    GCU: { aa: "Alanine", code: "Ala", color: "#22c55e" },
    GCC: { aa: "Alanine", code: "Ala", color: "#22c55e" },
    GCA: { aa: "Alanine", code: "Ala", color: "#22c55e" },
    GCG: { aa: "Alanine", code: "Ala", color: "#22c55e" },
    UAU: { aa: "Tyrosine", code: "Tyr", color: "#a855f7" },
    UAC: { aa: "Tyrosine", code: "Tyr", color: "#a855f7" },
    CAU: { aa: "Histidine", code: "His", color: "#6366f1" },
    CAC: { aa: "Histidine", code: "His", color: "#6366f1" },
    CAA: { aa: "Glutamine", code: "Gln", color: "#06b6d4" },
    CAG: { aa: "Glutamine", code: "Gln", color: "#06b6d4" },
    AAU: { aa: "Asparagine", code: "Asn", color: "#f59e0b" },
    AAC: { aa: "Asparagine", code: "Asn", color: "#f59e0b" },
    AAA: { aa: "Lysine", code: "Lys", color: "#6366f1" },
    AAG: { aa: "Lysine", code: "Lys", color: "#6366f1" },
    GAU: { aa: "Aspartate", code: "Asp", color: "#ef4444" },
    GAC: { aa: "Aspartate", code: "Asp", color: "#ef4444" },
    GAA: { aa: "Glutamate", code: "Glu", color: "#dc2626" },
    GAG: { aa: "Glutamate", code: "Glu", color: "#dc2626" },
    UGU: { aa: "Cysteine", code: "Cys", color: "#eab308" },
    UGC: { aa: "Cysteine", code: "Cys", color: "#eab308" },
    UGG: { aa: "Tryptophan", code: "Trp", color: "#8b5cf6" },
    CGU: { aa: "Arginine", code: "Arg", color: "#3b82f6" },
    CGC: { aa: "Arginine", code: "Arg", color: "#3b82f6" },
    CGA: { aa: "Arginine", code: "Arg", color: "#3b82f6" },
    CGG: { aa: "Arginine", code: "Arg", color: "#3b82f6" },
    AGA: { aa: "Arginine", code: "Arg", color: "#3b82f6" },
    AGG: { aa: "Arginine", code: "Arg", color: "#3b82f6" },
    GGU: { aa: "Glycine", code: "Gly", color: "#64748b" },
    GGC: { aa: "Glycine", code: "Gly", color: "#64748b" },
    GGA: { aa: "Glycine", code: "Gly", color: "#64748b" },
    GGG: { aa: "Glycine", code: "Gly", color: "#64748b" },
    UAA: { aa: "Ochre (STOP)", code: "STOP", color: "#ef4444" },
    UAG: { aa: "Amber (STOP)", code: "STOP", color: "#ef4444" },
    UGA: { aa: "Opal (STOP)", code: "STOP", color: "#ef4444" }
  };

  const aminoAcidProps = {
    Met: { name: "Methionine", type: "Start • Nonpolar", color: "#10b981" },
    Phe: { name: "Phenylalanine", type: "Aromatic Nonpolar", color: "#3b82f6" },
    Leu: { name: "Leucine", type: "Aliphatic Nonpolar", color: "#06b6d4" },
    Ile: { name: "Isoleucine", type: "Aliphatic Nonpolar", color: "#0284c7" },
    Val: { name: "Valine", type: "Aliphatic Nonpolar", color: "#14b8a6" },
    Ser: { name: "Serine", type: "Polar Hydroxyl", color: "#8b5cf6" },
    Pro: { name: "Proline", type: "Imino Nonpolar", color: "#ec4899" },
    Thr: { name: "Threonine", type: "Polar Hydroxyl", color: "#f97316" },
    Ala: { name: "Alanine", type: "Aliphatic Nonpolar", color: "#22c55e" },
    Tyr: { name: "Tyrosine", type: "Aromatic Polar", color: "#a855f7" },
    His: { name: "Histidine", type: "Basic Positive (+)", color: "#6366f1" },
    Gln: { name: "Glutamine", type: "Polar Amide", color: "#06b6d4" },
    Asn: { name: "Asparagine", type: "Polar Amide", color: "#f59e0b" },
    Lys: { name: "Lysine", type: "Basic Positive (+)", color: "#6366f1" },
    Asp: { name: "Aspartate", type: "Acidic Negative (-)", color: "#ef4444" },
    Glu: { name: "Glutamate", type: "Acidic Negative (-)", color: "#dc2626" },
    Cys: { name: "Cysteine", type: "Polar Thiol (-SH)", color: "#eab308" },
    Trp: { name: "Tryptophan", type: "Aromatic Nonpolar", color: "#8b5cf6" },
    Arg: { name: "Arginine", type: "Basic Positive (+)", color: "#3b82f6" },
    Gly: { name: "Glycine", type: "Achiral Flexible", color: "#64748b" },
    STOP: { name: "Terminator", type: "Translation STOP", color: "#dc2626" }
  };

  function getAnticodon(codon) {
    if (!codon || codon.length !== 3) return "???";
    let anti = "";
    for (let char of codon) {
      if (char === "A") anti += "U";
      else if (char === "U") anti += "A";
      else if (char === "C") anti += "G";
      else if (char === "G") anti += "C";
      else anti += "N";
    }
    return anti;
  }

  container.innerHTML = `
    <div class="lab-container">
      <!-- Mode & Visual Header Toolbar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding: 10px 18px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #34d399; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #10b981; box-shadow: 0 0 10px #10b981;"></span>
            Molecular Genetics & Translation Studio
          </span>
          <span class="badge" style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            Central Dogma of Molecular Biology (DNA → RNA → Protein)
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 12px;">
          <!-- View Switcher -->
          <div class="lab-view-switcher" style="display: flex; border-radius: 8px; padding: 3px;">
            <button id="bio-mode-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🧬 Transcription & Translation
            </button>
            <button id="bio-mode-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Macromolecular Crystal
            </button>
          </div>
        </div>
      </div>

      <!-- Main Visual Molecular Canvas -->
      <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(16, 185, 129, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: #070a12; overflow: hidden; height: 520px;">
        <canvas id="dna-protein-canvas" width="1000" height="520" style="height: 520px; width: 100%; display: block;"></canvas>

        <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
        <div id="bio-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
          <picture>
              <source srcset="assets/labs/dna_structure.webp" type="image/webp">
              <img src="assets/labs/dna_structure.jpg" decoding="async" loading="lazy" alt="4K B-DNA Double Helix and Ribosome Crystal" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            </picture>
          
          <!-- Live Analytical Telemetry Callout on Photo -->
          <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">B-DNA Double Helix</div>
              <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.95rem;">3.4 nm Pitch • 10.5 bp/Turn</div>
            </div>
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Watson-Crick Base-Pairing</div>
              <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.95rem;">A=T (2 H-Bonds) • G≡C (3 H-Bonds)</div>
            </div>
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">50S Ribosomal Subunit</div>
              <div style="color: #fbbf24; font-weight: 700; font-family: var(--font-mono); font-size: 0.95rem;">Peptidyl Transferase Center</div>
            </div>
          </div>
        </div>

        <!-- Top HUD: Stage Status (Left) & Polypeptide Telemetry (Right) Unified to Prevent Overlap -->
        <div class="sim-top-hud-bar" style="position: absolute; top: 10px; left: 14px; right: 14px; display: flex; justify-content: space-between; align-items: center; gap: 12px; pointer-events: none; z-index: 10;">
          <div class="sim-hud-badges" style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px; pointer-events: auto;">
            <span class="badge" style="background: rgba(15, 23, 42, 0.92); border: 1px solid rgba(16, 185, 129, 0.4); padding: 5px 12px; border-radius: 9999px; font-family: var(--font-mono); font-size: 0.78rem; color: #34d399; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); white-space: nowrap;">
              <span id="bio-stage-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
              <span id="bio-stage-status">Translation & Polypeptide Elongation Active</span>
            </span>
            <span class="badge" id="mutation-badge" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); padding: 5px 12px; border-radius: 9999px; font-family: var(--font-mono); font-size: 0.78rem; color: #38bdf8; white-space: nowrap;">
              Wild-Type Normal Allele
            </span>
          </div>

          <!-- Top Right Polypeptide Telemetry -->
          <div class="sim-telemetry-dashboard" style="background: rgba(15, 23, 42, 0.92); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 10px; padding: 6px 14px; box-shadow: 0 10px 25px rgba(0,0,0,0.6); font-family: var(--font-mono); backdrop-filter: blur(12px); pointer-events: auto; flex-shrink: 0; max-width: 360px;">
            <div style="font-size: 0.62rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Synthesized Polypeptide</div>
            <div style="font-size: 0.92rem; font-weight: 700; color: #34d399; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" id="polypeptide-chain-disp">
              Met - Pro - Asn - Asp
            </div>
            <div style="font-size: 0.68rem; color: #cbd5e1; margin-top: 2px;" id="poly-length-disp">
              Length: 4 Amino Acids • Peptide Bonds: 3
            </div>
          </div>
        </div>

        <!-- Bottom Base Legend -->
        <div id="bio-formula-bar" class="sim-floating-formula-bar" style="position: absolute; bottom: 12px; left: 16px; right: 16px; backdrop-filter: blur(12px); border-radius: 12px; padding: 8px 18px; display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap; gap: 12px; font-size: 0.82rem; z-index: 10;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 3px; background: #ef4444;"></span>
            <span style="font-weight: 600;">Adenine (A)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 3px; background: #3b82f6;"></span>
            <span style="font-weight: 600;">Thymine (T)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 3px; background: #8b5cf6;"></span>
            <span style="font-weight: 600;">Uracil (U - RNA)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 3px; background: #f59e0b;"></span>
            <span style="font-weight: 600;">Cytosine (C)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 3px; background: #10b981;"></span>
            <span style="font-weight: 600;">Guanine (G)</span>
          </div>
        </div>
      </div>

      <!-- Controls Panel & Mutation Pathology Testing -->
      <div class="lab-controls-panel" style="margin-top: 18px;">
        <!-- DNA Template Sequence Input -->
        <div class="control-group" style="grid-column: 1 / -1;">
          <label class="control-label">
            <span>Template DNA Sequence (3' to 5') — Direct Editable Codon Input</span>
          </label>
          <input type="text" id="input-dna-seq" class="select-input" value="TAC GGC TTA CTG ACT" style="font-family: var(--font-mono); letter-spacing: 0.15em; font-weight: 800; font-size: 1.05rem; color: #38bdf8; text-transform: uppercase;">
        </div>

        <!-- Targeted Mutation Presets -->
        <div class="control-group">
          <label class="control-label">
            <span>Introduce Molecular Mutation Preset</span>
          </label>
          <select id="select-mutation-preset" class="select-input" style="font-weight: 600;">
            <option value="none" selected>Normal Wild-Type (TAC GGC TTA CTG ACT → Met-Pro-Asn-Asp)</option>
            <option value="silent">Silent Mutation (TAC GGT TTA CTG ACT → CCA still codes for Proline)</option>
            <option value="missense">Missense Mutation (TAC GTC TTA CTG ACT → Proline replaced by Valine)</option>
            <option value="nonsense">Nonsense Mutation (TAC GGC ACT CTG ACT → Codon 3 becomes premature STOP)</option>
            <option value="frameshift">Frameshift Insertion (TAC AGG CTT ACT GAC → Ruined downstream reading frame)</option>
          </select>
        </div>

        <!-- Translation Speed -->
        <div class="control-group">
          <label class="control-label">
            <span>Ribosome Elongation Rate</span>
            <span class="control-val" id="disp-trans-speed">Normal (1.0×)</span>
          </label>
          <input type="range" id="input-speed" class="custom-slider" min="0.5" max="2.0" value="1.0" step="0.25">
        </div>

        <!-- Action Buttons -->
        <div class="lab-action-buttons">
          <button class="btn btn-primary" id="btn-transcribe-translate" style="box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);">
            ⚡ Synthesize & Translate
          </button>
          <button class="btn btn-secondary" id="btn-reset-dna">
            ↺ Reset to Standard Wild-Type
          </button>
          <div style="margin-left: auto; font-family: var(--font-mono); font-size: 0.82rem; color: var(--text-muted);" id="mutation-desc-text">
            No amino acid sequence alteration (Normal functional protein).
          </div>
        </div>
      </div>

      <!-- Telemetry Suite & Multi-Trial Bar -->
      <div class="lab-telemetry-suite-bar">
        <div class="lab-trials-badge-group" id="dna-trials-badge-group">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">Genetic Synthesis Log:</span>
          <span class="lab-trial-pill trial-1" id="dna-pill-trial-1" style="opacity: 0.5;">Seq 1 (Cyan)</span>
          <span class="lab-trial-pill trial-2" id="dna-pill-trial-2" style="opacity: 0.5;">Seq 2 (Amber)</span>
          <span class="lab-trial-pill trial-3" id="dna-pill-trial-3" style="opacity: 0.5;">Seq 3 (Emerald)</span>
        </div>

        <div class="lab-export-buttons-group">
          <button class="btn btn-secondary" id="btn-record-dna-trial" style="padding: 6px 12px; font-size: 0.8rem; gap: 6px; border-color: rgba(16,185,129,0.4); color: #10b981;">
            <span>📸 Log Genetic Variant</span>
          </button>
          <button class="btn btn-secondary" id="btn-export-dna-csv" style="padding: 6px 12px; font-size: 0.8rem; gap: 6px;" title="Export complete codon transcription & translation dataset as RFC-4180 CSV (Shortcut: E)" aria-label="Export CSV Data (Shortcut: E)">
            <span>📥 Export CSV (E)</span>
          </button>
          <button class="btn btn-primary" id="btn-open-dna-report" style="padding: 6px 14px; font-size: 0.8rem; gap: 6px; background: linear-gradient(135deg, #059669, #047857); border: none;">
            <span>📑 Generate Lab Report</span>
          </button>
        </div>
      </div>

      <!-- Post-Lab Checkpoint Assessment Mount -->
      <div id="dna-checkpoint-container"></div>
    </div>
  `;

  const canvas = document.getElementById("dna-protein-canvas");
  const ctx = canvas.getContext("2d");
  const photoOverlay = document.getElementById("bio-photo-overlay");

  // State
  let dnaSeq = "TAC GGC TTA CTG ACT";
  let animId = null;

  const baseColors = {
    A: "#ef4444",
    T: "#3b82f6",
    U: "#8b5cf6",
    C: "#f59e0b",
    G: "#10b981"
  };

  function processSequence(seq) {
    const cleanDna = seq.replace(/[^ATCG]/gi, "").toUpperCase();
    let mrna = "";

    for (let char of cleanDna) {
      if (char === "A") mrna += "U";
      else if (char === "T") mrna += "A";
      else if (char === "C") mrna += "G";
      else if (char === "G") mrna += "C";
    }

    const pep = [];
    for (let i = 0; i < mrna.length; i += 3) {
      const codon = mrna.substr(i, 3);
      if (codon.length === 3) {
        const match = geneticCode[codon] || { aa: "Unknown", code: "???", color: "#64748b" };
        pep.push({ codon, ...match });
        if (match.code === "STOP") break;
      }
    }

    return { mrna, peptide: pep };
  }

  function draw() {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    // Deep obsidian laboratory viewport gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, "#080e1a");
    bgGrad.addColorStop(0.45, "#0b1325");
    bgGrad.addColorStop(1, "#0f172a");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    const cleanDna = dnaSeq.replace(/[^ATCG]/gi, "").toUpperCase();
    const { mrna, peptide: pep } = processSequence(cleanDna);

    // Horizontal Layout Metrics & Column Anchors
    const labelX = 14;
    const labelWidth = 142;
    const labelRight = labelX + labelWidth; // 156
    // Guaranteed safety gutter between left badges and strands (exceeds labelRight + 26)
    const terminalX = labelRight + 18;      // 174 (3' / 5' terminal markers)
    const startX = labelRight + 42;         // 198 (labelRight + 26 safety margin + padding)
    const availableW = w - startX - 44;
    const baseSpacing = Math.min(46, Math.max(26, availableW / Math.max(1, cleanDna.length)));
    const endX = startX + Math.max(0, cleanDna.length - 1) * baseSpacing;
    const rightTerminalX = endX + 24;

    // Vertical Layer Bands (Spaced with perfect visual rhythm and zero overlap)
    const dnaY1 = 76;      // Stage 1: 3' Template Strand
    const dnaY2 = 120;     // Stage 1: 5' Coding Strand
    const transY = 153;    // RNA Polymerase II Transcription Transition
    const mrnaY = 188;     // Stage 2: 5' mRNA Transcript Strand
    const codonY = 224;    // Stage 2: Codon Brackets & Triplet Calling
    const trnaY = 280;     // Stage 3: Ribosomal Decoding Center & tRNA Anticodons
    const polyY = 388;     // Stage 4: Synthesized Polypeptide Protein Chain

    // Helper: Draw stylized row category badge on the left
    function drawStrandBadge(x, y, title, subtitle, color, borderColor) {
      const bh = 30;
      const by = y - bh / 2;
      ctx.save();
      ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
      ctx.strokeStyle = borderColor || color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(x, by, labelWidth, bh, 6);
      ctx.fill();
      ctx.stroke();

      // Colored bullet indicator
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x + 12, y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Title & Directional subtitle
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.font = "bold 9.5px JetBrains Mono, monospace";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(title, x + 22, y - 5);

      ctx.font = "8px JetBrains Mono, monospace";
      ctx.fillStyle = color;
      ctx.fillText(subtitle, x + 22, y + 7);
      ctx.restore();
    }

    // 1. Stage 1: DNA Double Helix Section
    drawStrandBadge(labelX, dnaY1, "DNA Template", "3' ────────► 5'", "#38bdf8", "rgba(56, 189, 248, 0.4)");
    drawStrandBadge(labelX, dnaY2, "Coding Strand", "5' ────────► 3'", "#10b981", "rgba(16, 185, 129, 0.4)");

    // Template Backbone (3' to 5')
    ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(terminalX + 10, dnaY1);
    ctx.lineTo(endX + 12, dnaY1);
    ctx.stroke();

    // Coding Strand Backbone (5' to 3')
    ctx.strokeStyle = "rgba(16, 185, 129, 0.45)";
    ctx.beginPath();
    ctx.moveTo(terminalX + 10, dnaY2);
    ctx.lineTo(endX + 12, dnaY2);
    ctx.stroke();

    // Strand Terminal Markers
    ctx.font = "bold 10px JetBrains Mono, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#38bdf8";
    ctx.fillText("3'", terminalX, dnaY1);
    ctx.fillText("5'", rightTerminalX, dnaY1);

    ctx.fillStyle = "#10b981";
    ctx.fillText("5'", terminalX, dnaY2);
    ctx.fillText("3'", rightTerminalX, dnaY2);

    // Render DNA Bases & Watson-Crick Hydrogen Bonds
    for (let i = 0; i < cleanDna.length; i++) {
      const bx = startX + i * baseSpacing;
      const b1 = cleanDna[i];
      let b2 = "A";
      if (b1 === "A") b2 = "T";
      else if (b1 === "T") b2 = "A";
      else if (b1 === "C") b2 = "G";
      else if (b1 === "G") b2 = "C";

      // Hydrogen Bonds (Exact Watson-Crick: A=T double, G≡C triple)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 1.5;
      if (b1 === "A" || b1 === "T") {
        // 2 H-Bonds (A=T)
        ctx.beginPath();
        ctx.moveTo(bx - 3, dnaY1 + 12);
        ctx.lineTo(bx - 3, dnaY2 - 12);
        ctx.moveTo(bx + 3, dnaY1 + 12);
        ctx.lineTo(bx + 3, dnaY2 - 12);
        ctx.stroke();
      } else {
        // 3 H-Bonds (G≡C)
        ctx.beginPath();
        ctx.moveTo(bx - 5, dnaY1 + 12);
        ctx.lineTo(bx - 5, dnaY2 - 12);
        ctx.moveTo(bx, dnaY1 + 12);
        ctx.lineTo(bx, dnaY2 - 12);
        ctx.moveTo(bx + 5, dnaY1 + 12);
        ctx.lineTo(bx + 5, dnaY2 - 12);
        ctx.stroke();
      }

      // Template Base Tile
      ctx.fillStyle = baseColors[b1] || "#38bdf8";
      ctx.beginPath();
      ctx.roundRect(bx - 11, dnaY1 - 10, 22, 20, 5);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px JetBrains Mono, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(b1, bx, dnaY1);

      // Coding Base Tile
      ctx.fillStyle = baseColors[b2] || "#10b981";
      ctx.beginPath();
      ctx.roundRect(bx - 11, dnaY2 - 10, 22, 20, 5);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.fillText(b2, bx, dnaY2);
    }

    // 2. Transcription Process Banner (Connecting DNA to mRNA)
    const midX = (startX + endX) / 2;
    ctx.save();
    ctx.strokeStyle = "rgba(168, 85, 247, 0.4)";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(midX, dnaY2 + 13);
    ctx.lineTo(midX, mrnaY - 13);
    ctx.stroke();
    ctx.setLineDash([]);

    // Transcription badge
    ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
    ctx.strokeStyle = "rgba(168, 85, 247, 0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(midX - 165, transY - 10, 330, 20, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#c084fc";
    ctx.font = "bold 8.5px JetBrains Mono, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("▼ RNA Polymerase II Transcription (Complementary Base Pairing)", midX, transY);
    ctx.restore();

    // 3. Stage 2: mRNA Transcript Strand & Nucleotides
    drawStrandBadge(labelX, mrnaY, "mRNA Transcript", "5' ────────► 3'", "#c084fc", "rgba(168, 85, 247, 0.4)");

    ctx.strokeStyle = "rgba(168, 85, 247, 0.6)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(terminalX + 10, mrnaY);
    ctx.lineTo(endX + 12, mrnaY);
    ctx.stroke();

    ctx.fillStyle = "#c084fc";
    ctx.font = "bold 10px JetBrains Mono, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("5'", terminalX, mrnaY);
    ctx.fillText("3'", rightTerminalX, mrnaY);

    for (let i = 0; i < mrna.length; i++) {
      const mx = startX + i * baseSpacing;
      const base = mrna[i];

      ctx.fillStyle = baseColors[base] || "#a855f7";
      ctx.beginPath();
      ctx.roundRect(mx - 11, mrnaY - 10, 22, 20, 5);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px JetBrains Mono, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(base, mx, mrnaY);
    }

    // 4. Codon Brackets & Triplet Calling
    const codonCount = Math.floor(mrna.length / 3);
    for (let c = 0; c < codonCount; c++) {
      const c0 = startX + (3 * c) * baseSpacing;
      const c2 = startX + (3 * c + 2) * baseSpacing;
      const codonStartX = c0 - 11;
      const codonEndX = c2 + 11;
      const codonCenterX = startX + (3 * c + 1) * baseSpacing;
      const codon = mrna.substr(3 * c, 3);
      const isStart = c === 0 && codon === "AUG";
      const isStop = codon === "UAA" || codon === "UAG" || codon === "UGA";

      // Bracket Path with center pointing notch
      ctx.strokeStyle = isStart ? "rgba(16, 185, 129, 0.7)" : (isStop ? "rgba(239, 68, 68, 0.7)" : "rgba(255, 255, 255, 0.35)");
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(codonStartX, mrnaY + 12);
      ctx.lineTo(codonStartX, mrnaY + 19);
      ctx.lineTo(codonCenterX - 6, mrnaY + 19);
      ctx.lineTo(codonCenterX, mrnaY + 23);
      ctx.lineTo(codonCenterX + 6, mrnaY + 19);
      ctx.lineTo(codonEndX, mrnaY + 19);
      ctx.lineTo(codonEndX, mrnaY + 12);
      ctx.stroke();

      // Codon Capsule Badge
      const badgeW = isStart || isStop ? 88 : 76;
      const badgeH = 18;
      ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
      ctx.strokeStyle = isStart ? "#10b981" : (isStop ? "#ef4444" : "rgba(148, 163, 184, 0.45)");
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(codonCenterX - badgeW / 2, codonY - badgeH / 2, badgeW, badgeH, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isStart ? "#34d399" : (isStop ? "#f87171" : "#cbd5e1");
      ctx.font = "bold 8.5px JetBrains Mono, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const codonText = isStart ? `Codon ${c+1}: START` : (isStop ? `Codon ${c+1}: STOP` : `Codon ${c+1}: ${codon}`);
      ctx.fillText(codonText, codonCenterX, codonY);
    }

    // 5. Stage 3: Ribosomal Translation Machinery & tRNA Anticodon Adapters
    drawStrandBadge(labelX, trnaY, "tRNA Adapters", "Anticodons (3'→5')", "#fbbf24", "rgba(245, 158, 11, 0.4)");

    // Ribosomal Peptidyl Transferase Background Zone
    if (codonCount > 0) {
      const riboStart = startX - 16;
      const riboEnd = startX + Math.min(mrna.length, codonCount * 3) * baseSpacing + 6;
      const riboW = Math.max(140, riboEnd - riboStart);
      const riboH = 46;

      ctx.save();
      const riboGrad = ctx.createLinearGradient(riboStart, trnaY - 23, riboEnd, trnaY + 23);
      riboGrad.addColorStop(0, "rgba(245, 158, 11, 0.09)");
      riboGrad.addColorStop(0.5, "rgba(245, 158, 11, 0.04)");
      riboGrad.addColorStop(1, "rgba(245, 158, 11, 0.09)");
      ctx.fillStyle = riboGrad;
      ctx.strokeStyle = "rgba(245, 158, 11, 0.3)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(riboStart, trnaY - 23, riboW, riboH, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 8px JetBrains Mono, monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText("⬡ 70S Ribosomal Complex • Decoding Center (E | P | A Sites)", riboStart + 12, trnaY - 14);
      ctx.restore();
    }

    // Render individual tRNA / Release Factor cards for each codon
    for (let c = 0; c < codonCount; c++) {
      const codonCenterX = startX + (3 * c + 1) * baseSpacing;
      const codon = mrna.substr(3 * c, 3);
      const isStop = codon === "UAA" || codon === "UAG" || codon === "UGA";
      const anti = getAnticodon(codon);

      // Connecting guide ray from codon bracket down to tRNA
      ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(codonCenterX, codonY + 10);
      ctx.lineTo(codonCenterX, trnaY - 12);
      ctx.stroke();

      if (!isStop) {
        // tRNA Anticodon Card
        const cardW = 68;
        const cardH = 26;
        ctx.fillStyle = "rgba(30, 41, 59, 0.95)";
        ctx.strokeStyle = "rgba(245, 158, 11, 0.5)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(codonCenterX - cardW / 2, trnaY - cardH / 2 + 3, cardW, cardH, 5);
        ctx.fill();
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 8.5px JetBrains Mono, monospace";
        ctx.fillStyle = "#fbbf24";
        ctx.fillText(`tRNA: ${anti}`, codonCenterX, trnaY - 1);

        ctx.font = "7px JetBrains Mono, monospace";
        ctx.fillStyle = "#94a3b8";
        ctx.fillText("Peptidyl Transfer", codonCenterX, trnaY + 9);
      } else {
        // Release Factor Card
        const cardW = 76;
        const cardH = 26;
        ctx.fillStyle = "rgba(69, 10, 10, 0.9)";
        ctx.strokeStyle = "rgba(239, 68, 68, 0.6)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(codonCenterX - cardW / 2, trnaY - cardH / 2 + 3, cardW, cardH, 5);
        ctx.fill();
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 8px JetBrains Mono, monospace";
        ctx.fillStyle = "#f87171";
        ctx.fillText("Release Factor", codonCenterX, trnaY - 1);

        ctx.font = "7px JetBrains Mono, monospace";
        ctx.fillStyle = "#fca5a5";
        ctx.fillText("STOP / Terminate", codonCenterX, trnaY + 9);
      }
    }

    // 6. Stage 4: Nascent Polypeptide Protein Chain (N-Terminus to C-Terminus)
    drawStrandBadge(labelX, polyY, "Polypeptide", "N-term ────► C-term", "#34d399", "rgba(52, 211, 153, 0.4)");

    // Chain Section Title Header
    if (pep.length > 0) {
      const firstPx = startX + 1 * baseSpacing;
      const lastPx = startX + (3 * (pep.length - 1) + 1) * baseSpacing;
      const chainMidX = (firstPx + lastPx) / 2;

      ctx.save();
      ctx.fillStyle = "#34d399";
      ctx.font = "bold 9px JetBrains Mono, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("⬡ Nascent Polypeptide Chain: Primary Amino Acid Structure (N-Terminus to C-Terminus)", chainMidX, polyY - 44);
      ctx.restore();
    }

    const isSmartboard = document.documentElement.getAttribute("data-mode") === "smartboard" ||
                         document.documentElement.classList.contains("fast-smartboard-mode") ||
                         /Android|MAXHUB/i.test(navigator.userAgent);

    pep.forEach((item, idx) => {
      // EXACT ALIGNMENT: Amino acid sits directly beneath its codon center!
      const px = startX + (3 * idx + 1) * baseSpacing;

      // Vertical Translation Connector Ray (tRNA -> Amino Acid Bead)
      ctx.strokeStyle = "rgba(52, 211, 153, 0.28)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(px, trnaY + 16);
      ctx.lineTo(px, polyY - 20);
      ctx.stroke();
      ctx.setLineDash([]);

      // N-Terminal Marker for First Residue
      if (idx === 0) {
        ctx.fillStyle = "#34d399";
        ctx.font = "bold 9px JetBrains Mono, monospace";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText("H₂N ──", px - 22, polyY);
      }

      // Covalent Peptide Bond Linking to Previous Residue
      if (idx > 0) {
        const prevPx = startX + (3 * (idx - 1) + 1) * baseSpacing;
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(prevPx + 18, polyY);
        ctx.lineTo(px - 18, polyY);
        ctx.stroke();

        // Centered Peptide Bond Label Badge with Guaranteed Zero Overlap
        const bondMidX = (prevPx + px) / 2;
        const span = px - prevPx;
        const availSpace = span - 38;

        if (availSpace >= 24) {
          const bondW = Math.min(68, availSpace);
          const bondH = 15;
          ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
          ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(bondMidX - bondW / 2, polyY - bondH / 2, bondW, bondH, 4);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#cbd5e1";
          ctx.font = "bold 7.5px JetBrains Mono, monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const bondText = bondW >= 56 ? "Peptide Bond" : "CO-NH";
          ctx.fillText(bondText, bondMidX, polyY);
        }
      }

      // C-Terminal Marker for Last Residue
      if (idx === pep.length - 1) {
        ctx.fillStyle = "#f87171";
        ctx.font = "bold 9px JetBrains Mono, monospace";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText("── COOH", px + 22, polyY);
      }

      // Amino Acid Spherical Bead
      const aaGrad = ctx.createRadialGradient(px - 4, polyY - 4, 2, px, polyY, 18);
      aaGrad.addColorStop(0, "#ffffff");
      aaGrad.addColorStop(0.3, item.color || "#3b82f6");
      aaGrad.addColorStop(1, "#0f172a");

      ctx.fillStyle = aaGrad;
      if (!isSmartboard) {
        ctx.shadowColor = item.color || "#3b82f6";
        ctx.shadowBlur = 12;
      }
      ctx.beginPath();
      ctx.arc(px, polyY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // 3-Letter Code inside Sphere
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px JetBrains Mono, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(item.code, px, polyY);

      // Centered Amino Acid Name beneath Sphere
      const propInfo = aminoAcidProps[item.code] || { name: item.aa.split(" ")[0], type: "Residue" };
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 9px JetBrains Mono, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(propInfo.name, px, polyY + 27);

      // Chemical Property Tag beneath Name
      ctx.fillStyle = "#94a3b8";
      ctx.font = "7.5px JetBrains Mono, monospace";
      ctx.fillText(propInfo.type, px, polyY + 41);
    });

    ctx.restore();
  }

  function updateTelemetry() {
    const cleanDna = dnaSeq.replace(/[^ATCG]/gi, "").toUpperCase();
    const { mrna, peptide: pep } = processSequence(cleanDna);

    const polyString = pep.map(p => p.code).join(" - ") || "No translation";
    document.getElementById("polypeptide-chain-disp").innerText = polyString;
    document.getElementById("poly-length-disp").innerText = `Length: ${pep.length} Amino Acids • Peptide Bonds: ${Math.max(0, pep.length - 1)}`;
  }

  draw();
  updateTelemetry();

  // Control Handlers
  const inDna = document.getElementById("input-dna-seq");
  const selMut = document.getElementById("select-mutation-preset");

  inDna.addEventListener("input", (e) => {
    dnaSeq = e.target.value.toUpperCase();
    updateTelemetry();
    draw();
  });

  selMut.addEventListener("change", (e) => {
    const val = e.target.value;
    const badge = document.getElementById("mutation-badge");
    const desc = document.getElementById("mutation-desc-text");

    if (val === "none") {
      dnaSeq = "TAC GGC TTA CTG ACT";
      badge.innerText = "Wild-Type Normal Allele";
      badge.style.color = "#38bdf8";
      badge.style.background = "rgba(56, 189, 248, 0.15)";
      desc.innerText = "No amino acid sequence alteration (Normal functional protein).";
    } else if (val === "silent") {
      dnaSeq = "TAC GGT TTA CTG ACT";
      badge.innerText = "Silent Mutation (GGC → GGT)";
      badge.style.color = "#10b981";
      badge.style.background = "rgba(16, 185, 129, 0.15)";
      desc.innerText = "Codon 2 mutated to CCA: Degenerate code preserves Proline residue.";
    } else if (val === "missense") {
      dnaSeq = "TAC GTC TTA CTG ACT";
      badge.innerText = "Missense Mutation (GGC → GTC)";
      badge.style.color = "#f59e0b";
      badge.style.background = "rgba(245, 158, 11, 0.15)";
      desc.innerText = "Proline residue replaced with Valine: Potential enzyme active-site deformation.";
    } else if (val === "nonsense") {
      dnaSeq = "TAC GGC ACT CTG ACT";
      badge.innerText = "Nonsense Mutation (TTA → ACT)";
      badge.style.color = "#ef4444";
      badge.style.background = "rgba(239, 68, 68, 0.15)";
      desc.innerText = "Codon 3 converted into premature STOP codon (UGA): Truncated non-functional protein.";
    } else if (val === "frameshift") {
      dnaSeq = "TAC AGG CTT ACT GAC";
      badge.innerText = "Frameshift Insertion (+A)";
      badge.style.color = "#ec4899";
      badge.style.background = "rgba(236, 72, 153, 0.15)";
      desc.innerText = "Single nucleotide insertion shifts reading frame: Catastrophic nonsense translation.";
    }

    inDna.value = dnaSeq;
    updateTelemetry();
    draw();
  });

  document.getElementById("btn-transcribe-translate").addEventListener("click", () => {
    updateTelemetry();
    draw();
  });

  document.getElementById("btn-reset-dna").addEventListener("click", () => {
    dnaSeq = "TAC GGC TTA CTG ACT";
    inDna.value = dnaSeq;
    selMut.value = "none";
    document.getElementById("mutation-badge").innerText = "Wild-Type Normal Allele";
    document.getElementById("mutation-badge").style.color = "#38bdf8";
    document.getElementById("mutation-badge").style.background = "rgba(56, 189, 248, 0.15)";
    document.getElementById("mutation-desc-text").innerText = "No amino acid sequence alteration (Normal functional protein).";
    updateTelemetry();
    draw();
  });

  // View Switcher
  const btnSim = document.getElementById("bio-mode-sim");
  const btnPhoto = document.getElementById("bio-mode-photo");

  btnSim.addEventListener("click", () => {
    photoOverlay.style.display = "none";
    const formulaBar = document.getElementById("bio-formula-bar");
    if (formulaBar) formulaBar.style.display = "flex";
    btnSim.style.background = "rgba(16, 185, 129, 0.25)";
    btnSim.style.color = "#34d399";
    btnPhoto.style.background = "transparent";
    btnPhoto.style.color = "#94a3b8";
  });

  btnPhoto.addEventListener("click", () => {
    photoOverlay.style.display = "block";
    const formulaBar = document.getElementById("bio-formula-bar");
    if (formulaBar) formulaBar.style.display = "none";
    btnPhoto.style.background = "rgba(16, 185, 129, 0.25)";
    btnPhoto.style.color = "#34d399";
    btnSim.style.background = "transparent";
    btnSim.style.color = "#94a3b8";
  });

  // Telemetry Suite: Record Current State as Trial
  document.getElementById("btn-record-dna-trial")?.addEventListener("click", () => {
    const cleanDna = dnaSeq.replace(/[^ATCG]/gi, "").toUpperCase();
    const { mrna, peptide: pep } = processSequence(cleanDna);
    const polyString = pep.map(p => p.code).join("-") || "None";
    const mutLabel = selMut.options[selMut.selectedIndex].text.split("(")[0].trim();

    LabTrialStore.addTrial("dnaprotein", {
      measurements: {
        "Allele State": mutLabel,
        "DNA Template (3'→5')": cleanDna,
        "mRNA Transcript (5'→3')": mrna,
        "Polypeptide": polyString,
        "Residue Count": pep.length
      }
    });

    const trials = LabTrialStore.getTrials("dnaprotein");
    trials.forEach((tr, i) => {
      const pill = document.getElementById(`dna-pill-trial-${i + 1}`);
      if (pill) {
        pill.style.opacity = "1";
        pill.innerText = `Var ${tr.trialNumber}: ${tr.measurements["Allele State"]} (${tr.measurements["Polypeptide"]})`;
      }
    });
  });

  // Telemetry Suite: Export CSV
  document.getElementById("btn-export-dna-csv")?.addEventListener("click", () => {
    const cleanDna = dnaSeq.replace(/[^ATCG]/gi, "").toUpperCase();
    const { mrna, peptide: pep } = processSequence(cleanDna);
    const mutLabel = selMut.options[selMut.selectedIndex].text.split("(")[0].trim();

    const headers = ["Codon #", "DNA Triplet", "mRNA Codon", "Residue Code", "Amino Acid Name"];
    const rows = [];
    const codonCount = Math.floor(cleanDna.length / 3);

    for (let c = 0; c < codonCount; c++) {
      const dTrip = cleanDna.slice(c * 3, c * 3 + 3);
      const mTrip = mrna.slice(c * 3, c * 3 + 3);
      const amino = pep[c] || { code: "N/A", aa: "Non-translated / Post-STOP" };
      rows.push([c + 1, dTrip, mTrip, amino.code, amino.aa]);
    }

    exportLabDataCsv({
      title: "Molecular Genetics & Protein Translation Engine",
      labId: "dnaprotein",
      parameters: {
        "Template DNA (3'→5')": cleanDna,
        "mRNA Transcript (5'→3')": mrna,
        "Mutation Model": mutLabel,
        "Peptide Length": `${pep.length} Amino Acids`
      },
      headers,
      dataRows: rows.length > 0 ? rows : [[1, cleanDna, mrna, "None", "No translation"]]
    });
  });

  // Telemetry Suite: Generate Lab Report
  document.getElementById("btn-open-dna-report")?.addEventListener("click", () => {
    const trials = LabTrialStore.getTrials("dnaprotein");
    const cleanDna = dnaSeq.replace(/[^ATCG]/gi, "").toUpperCase();
    const { mrna, peptide: pep } = processSequence(cleanDna);
    const polyString = pep.map(p => p.code).join("-") || "None";
    const mutLabel = selMut.options[selMut.selectedIndex].text.split("(")[0].trim();

    openLabReportModal({
      title: "Central Dogma of Molecular Biology: Transcription & Translation Fidelity",
      subject: "Biology",
      inquiryQuestion: "How do point mutations and indel frame disruptions quantitatively alter mRNA transcription and primary polypeptide elongation?",
      parameters: {
        "DNA Template Sequence": cleanDna,
        "Synthesized mRNA Transcript": mrna,
        "Translated Polypeptide": polyString,
        "Residue Chain Length": `${pep.length} Amino Acids`,
        "Allele Mutation Status": mutLabel
      },
      trials,
      formulas: [
        "3'-\\text{DNA Template}-5' \\xrightarrow{\\text{RNA Pol II}} 5'-\\text{mRNA Transcript}-3'",
        "\\text{Codon Number} = \\left\\lfloor \\frac{\\text{Nucleotides}}{3} \\right\\rfloor",
        "\\text{Peptide Bonds} = n_{\\text{amino acids}} - 1"
      ]
    });
  });

  // Mount Post-Lab Checkpoint Assessment
  mountLabCheckpoint("dna-checkpoint-container", "dnaprotein");

  // Keyboard Shortcuts (E for CSV export)
  function handleKeyDown(e) {
    if (!container || !container.isConnected) {
      window.removeEventListener("keydown", handleKeyDown);
      return;
    }
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable) {
      return;
    }
    if (e.key === "e" || e.key === "E") {
      e.preventDefault();
      document.getElementById("btn-export-dna-csv")?.click();
      return;
    }
  }
  window.addEventListener("keydown", handleKeyDown);

  function handleResize() {
    if (!container || !container.isConnected) {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
    canvas.width = rect.width * dpr;
    canvas.height = 520 * dpr;
    draw();
  }
  window.addEventListener("resize", handleResize);
  handleResize();

  return () => {
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("keydown", handleKeyDown);
  };
}
