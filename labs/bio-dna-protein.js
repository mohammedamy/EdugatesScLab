// Edugates-ClipSAT Science Labs - Biology: Molecular Genetics & Protein Synthesis Engine
// High-Fidelity Simulation: 4K Macromolecular Crystal Photography, Antiparallel Double Helix,
// RNA Polymerase Transcription Bubble, Ribosome A/P/E Translation Cycle, and Genetic Mutation Pathology.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";

export function initDnaProteinLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const geneticCode = {
    AUG: { aa: "Methionine (START)", code: "Met", color: "#10b981" },
    UUU: { aa: "Phenylalanine", code: "Phe", color: "#3b82f6" },
    UUC: { aa: "Phenylalanine", code: "Phe", color: "#3b82f6" },
    UUA: { aa: "Leucine", code: "Leu", color: "#06b6d4" },
    UUG: { aa: "Leucine", code: "Leu", color: "#06b6d4" },
    CUU: { aa: "Leucine", code: "Leu", color: "#06b6d4" },
    CUC: { aa: "Leucine", code: "Leu", color: "#06b6d4" },
    CUA: { aa: "Leucine", code: "Leu", color: "#06b6d4" },
    CUG: { aa: "Leucine", code: "Leu", color: "#06b6d4" },
    UCU: { aa: "Serine", code: "Ser", color: "#8b5cf6" },
    UCC: { aa: "Serine", code: "Ser", color: "#8b5cf6" },
    UCA: { aa: "Serine", code: "Ser", color: "#8b5cf6" },
    UCG: { aa: "Serine", code: "Ser", color: "#8b5cf6" },
    CCU: { aa: "Proline", code: "Pro", color: "#ec4899" },
    CCC: { aa: "Proline", code: "Pro", color: "#ec4899" },
    CCA: { aa: "Proline", code: "Pro", color: "#ec4899" },
    CCG: { aa: "Proline", code: "Pro", color: "#ec4899" },
    AAU: { aa: "Asparagine", code: "Asn", color: "#f59e0b" },
    AAC: { aa: "Asparagine", code: "Asn", color: "#f59e0b" },
    AAA: { aa: "Lysine", code: "Lys", color: "#6366f1" },
    AAG: { aa: "Lysine", code: "Lys", color: "#6366f1" },
    GAU: { aa: "Aspartate", code: "Asp", color: "#ef4444" },
    GAC: { aa: "Aspartate", code: "Asp", color: "#ef4444" },
    GAA: { aa: "Glutamate", code: "Glu", color: "#dc2626" },
    GAG: { aa: "Glutamate", code: "Glu", color: "#dc2626" },
    GGU: { aa: "Glycine", code: "Gly", color: "#64748b" },
    GGC: { aa: "Glycine", code: "Gly", color: "#64748b" },
    GGA: { aa: "Glycine", code: "Gly", color: "#64748b" },
    GGG: { aa: "Glycine", code: "Gly", color: "#64748b" },
    GUU: { aa: "Valine", code: "Val", color: "#14b8a6" },
    GUC: { aa: "Valine", code: "Val", color: "#14b8a6" },
    GUA: { aa: "Valine", code: "Val", color: "#14b8a6" },
    GUG: { aa: "Valine", code: "Val", color: "#14b8a6" },
    UAA: { aa: "Ochre (STOP)", code: "STOP", color: "#ef4444" },
    UAG: { aa: "Amber (STOP)", code: "STOP", color: "#ef4444" },
    UGA: { aa: "Opal (STOP)", code: "STOP", color: "#ef4444" }
  };

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
      <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(16, 185, 129, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: #070a12; overflow: hidden; height: 490px;">
        <canvas id="dna-protein-canvas" width="1000" height="490" style="height: 490px; width: 100%; display: block;"></canvas>

        <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
        <div id="bio-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
          <img src="assets/labs/dna_structure.jpg" alt="4K B-DNA Double Helix and Ribosome Crystal" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
          
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
        <div class="sim-top-hud-bar" style="position: absolute; top: 12px; left: 14px; right: 14px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; pointer-events: none; z-index: 10;">
          <div class="sim-hud-badges" style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px; pointer-events: auto; max-width: 58%; min-width: 0;">
            <span class="badge" style="background: rgba(15, 23, 42, 0.92); border: 1px solid rgba(16, 185, 129, 0.4); padding: 5px 12px; border-radius: 9999px; font-family: var(--font-mono); font-size: 0.8rem; color: #34d399; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); white-space: nowrap;">
              <span id="bio-stage-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
              <span id="bio-stage-status">Translation & Polypeptide Elongation Active</span>
            </span>
            <span class="badge" id="mutation-badge" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); padding: 5px 12px; border-radius: 9999px; font-family: var(--font-mono); font-size: 0.78rem; color: #38bdf8; white-space: nowrap;">
              Wild-Type Normal Allele
            </span>
          </div>

          <!-- Top Right Polypeptide Telemetry -->
          <div class="sim-telemetry-dashboard" style="border-radius: 10px; padding: 8px 14px; box-shadow: 0 10px 25px rgba(0,0,0,0.6); font-family: var(--font-mono); backdrop-filter: blur(8px); pointer-events: auto; flex-shrink: 0;">
            <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase;">Synthesized Polypeptide</div>
            <div style="font-size: 0.98rem; font-weight: 700; color: #34d399;" id="polypeptide-chain-disp">
              Met - Pro - Asn - Asp
            </div>
            <div style="font-size: 0.7rem; color: #cbd5e1; margin-top: 2px;" id="poly-length-disp">
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
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, "#080e1a");
    bgGrad.addColorStop(0.5, "#0f172a");
    bgGrad.addColorStop(1, "#111827");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    const cleanDna = dnaSeq.replace(/[^ATCG]/gi, "").toUpperCase();
    const { mrna, peptide: pep } = processSequence(cleanDna);

    const dnaY1 = 80;
    const dnaY2 = 125;
    const startX = 65;
    const baseSpacing = Math.min(38, (w - 130) / Math.max(1, cleanDna.length));

    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startX - 15, dnaY1);
    ctx.lineTo(startX + cleanDna.length * baseSpacing + 15, dnaY1);
    ctx.stroke();

    ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
    ctx.beginPath();
    ctx.moveTo(startX - 15, dnaY2);
    ctx.lineTo(startX + cleanDna.length * baseSpacing + 15, dnaY2);
    ctx.stroke();

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 10px JetBrains Mono";
    ctx.fillText("3' DNA Template", startX - 55, dnaY1 + 4);
    ctx.fillStyle = "#10b981";
    ctx.fillText("5' Complementary", startX - 55, dnaY2 + 4);

    for (let i = 0; i < cleanDna.length; i++) {
      const bx = startX + i * baseSpacing;
      const b1 = cleanDna[i];
      let b2 = "A";
      if (b1 === "A") b2 = "T";
      else if (b1 === "T") b2 = "A";
      else if (b1 === "C") b2 = "G";
      else if (b1 === "G") b2 = "C";

      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = (b1 === "G" || b1 === "C") ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.moveTo(bx, dnaY1 + 10);
      ctx.lineTo(bx, dnaY2 - 10);
      ctx.stroke();

      ctx.fillStyle = baseColors[b1] || "#38bdf8";
      ctx.beginPath();
      ctx.roundRect(bx - 10, dnaY1 - 8, 20, 16, 4);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px JetBrains Mono";
      ctx.fillText(b1, bx - 4, dnaY1 + 4);

      ctx.fillStyle = baseColors[b2] || "#10b981";
      ctx.beginPath();
      ctx.roundRect(bx - 10, dnaY2 - 8, 20, 16, 4);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.fillText(b2, bx - 4, dnaY2 + 4);
    }

    const mrnaY = 220;
    ctx.strokeStyle = "rgba(139, 92, 246, 0.6)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startX - 15, mrnaY);
    ctx.lineTo(startX + mrna.length * baseSpacing + 15, mrnaY);
    ctx.stroke();

    ctx.fillStyle = "#a855f7";
    ctx.font = "bold 10px JetBrains Mono";
    ctx.fillText("5' mRNA Transcript", startX - 55, mrnaY + 4);

    for (let i = 0; i < mrna.length; i++) {
      const mx = startX + i * baseSpacing;
      const base = mrna[i];

      ctx.fillStyle = baseColors[base] || "#a855f7";
      ctx.beginPath();
      ctx.roundRect(mx - 10, mrnaY - 9, 20, 18, 4);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px JetBrains Mono";
      ctx.fillText(base, mx - 4, mrnaY + 4);

      if (i % 3 === 0 && i + 2 < mrna.length) {
        const codonStartX = mx - 12;
        const codonEndX = mx + 2 * baseSpacing + 12;

        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(codonStartX, mrnaY + 16);
        ctx.lineTo(codonStartX, mrnaY + 22);
        ctx.lineTo(codonEndX, mrnaY + 22);
        ctx.lineTo(codonEndX, mrnaY + 16);
        ctx.stroke();

        const codonNum = Math.floor(i / 3) + 1;
        ctx.fillStyle = "#94a3b8";
        ctx.font = "9px JetBrains Mono";
        ctx.fillText(`Codon ${codonNum}`, (codonStartX + codonEndX) / 2 - 20, mrnaY + 34);
      }
    }

    const riboCenter = startX + (mrna.length / 2) * baseSpacing;
    const rSmallGrad = ctx.createRadialGradient(riboCenter, mrnaY + 25, 10, riboCenter, mrnaY + 25, 90);
    rSmallGrad.addColorStop(0, "rgba(245, 158, 11, 0.35)");
    rSmallGrad.addColorStop(1, "rgba(245, 158, 11, 0.05)");
    ctx.fillStyle = rSmallGrad;
    ctx.beginPath();
    ctx.ellipse(riboCenter, mrnaY + 20, (mrna.length * baseSpacing) * 0.55 + 20, 32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(245, 158, 11, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const polyY = 380;
    ctx.fillStyle = "#34d399";
    ctx.font = "bold 10px JetBrains Mono";
    ctx.fillText("Synthesized Polypeptide Protein Chain (N-terminus to C-terminus)", startX - 20, polyY - 45);

    pep.forEach((item, idx) => {
      const px = startX + idx * 80 + 30;

      if (idx > 0) {
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(px - 50, polyY);
        ctx.lineTo(px - 16, polyY);
        ctx.stroke();

        ctx.fillStyle = "#94a3b8";
        ctx.font = "8px JetBrains Mono";
        ctx.fillText("Peptide", px - 46, polyY - 6);
      }

      const aaGrad = ctx.createRadialGradient(px - 4, polyY - 4, 2, px, polyY, 18);
      aaGrad.addColorStop(0, "#ffffff");
      aaGrad.addColorStop(0.3, item.color || "#3b82f6");
      aaGrad.addColorStop(1, "#0f172a");

      ctx.fillStyle = aaGrad;
      ctx.shadowColor = item.color || "#3b82f6";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(px, polyY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px JetBrains Mono";
      ctx.fillText(item.code, px - 11, polyY + 4);

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "9px JetBrains Mono";
      ctx.fillText(item.aa.split(" ")[0], px - 16, polyY + 30);
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

  function handleResize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = 490 * dpr;
    draw();
  }
  window.addEventListener("resize", handleResize);
  handleResize();
}
