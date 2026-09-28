// Edugates-ClipSAT Science Labs - Biology: Mendelian Genetics & Punnett Square Laboratory
// High-Fidelity Simulation: Monohybrid (2×2) & Dihybrid (4×4) Crosses, Meiotic Chromosome Segregation,
// Photorealistic 3D Specimen Rendering (Pea Shapes, Colors, Flower Petals), and Monte-Carlo Chi-Square Engine.

import { renderLatex, formatMathText, upgradeAllMath } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";

export function initPunnettLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="lab-container">
      <!-- Top Dual Viewports: Interactive Punnett Matrix & Phenotypic Telemetry / Monte-Carlo Engine -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="punnett-layout">
        <!-- Left: Punnett Square Canvas -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(16, 185, 129, 0.35); border-radius: var(--radius-md); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: #070b14; overflow: hidden;">
          <canvas id="punnett-canvas" style="display: block; width: 100%; height: 540px;"></canvas>

          <!-- Top Status HUD -->
          <div style="position: absolute; top: 14px; left: 14px; right: 14px; display: flex; align-items: center; justify-content: space-between; z-index: 5; pointer-events: none;">
            <span class="badge" style="background: rgba(10, 15, 30, 0.92); backdrop-filter: blur(8px); border: 1.5px solid rgba(16, 185, 129, 0.45); padding: 6px 14px; border-radius: 9999px; font-family: var(--font-mono); font-size: 0.82rem; color: #34d399; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
              <span id="punnett-status-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981; display: inline-block;"></span>
              <span id="cross-mode-display" style="font-weight: 700;">Monohybrid (2×2) Cross</span>
            </span>
            <span id="hud-trait-pill" style="background: rgba(10, 15, 30, 0.88); backdrop-filter: blur(8px); border: 1.5px solid rgba(56, 189, 248, 0.35); padding: 5px 14px; border-radius: 9999px; font-family: var(--font-mono); font-size: 0.78rem; color: #38bdf8; font-weight: 700; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
              Pea Seed Shape (R/r)
            </span>
          </div>

          <!-- Active Hover / Selection Tooltip HUD -->
          <div id="cell-hud" style="position: absolute; bottom: 14px; left: 14px; right: 14px; background: rgba(10, 15, 30, 0.94); backdrop-filter: blur(12px); border: 1.5px solid rgba(56, 189, 248, 0.35); border-radius: 12px; padding: 8px 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px 14px; z-index: 5; font-family: var(--font-mono); font-size: 0.82rem; box-shadow: 0 8px 24px rgba(0,0,0,0.6);">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #94a3b8; font-weight: 600;">Genotype:</span>
              <span id="hud-genotype" style="font-weight: 800; color: #38bdf8; font-size: 1.15rem; background: rgba(56, 189, 248, 0.12); padding: 2px 10px; border-radius: 6px; border: 1px solid rgba(56, 189, 248, 0.25);">--</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #94a3b8; font-weight: 600;">Phenotype:</span>
              <span id="hud-phenotype" style="font-weight: 700; color: #f59e0b; font-size: 0.88rem;">Hover or tap any cell in grid</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #94a3b8; font-weight: 600;">Ratio:</span>
              <span id="hud-probability" style="font-weight: 700; color: #34d399; font-size: 0.88rem;">--</span>
            </div>
          </div>
        </div>

        <!-- Right: Theoretical Analysis & Monte-Carlo Probability Distribution -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <!-- 4K Botanical Specimen Inspection Card -->
          <div class="sim-telemetry-card" style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px; display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.78rem; color: #10b981; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
                <span>🌿</span> Botanical Macro Lens (4K Specimen)
              </span>
              <span id="specimen-label" style="font-size: 0.72rem; color: #38bdf8; font-family: var(--font-mono); background: rgba(56,189,248,0.12); padding: 2px 8px; border-radius: 4px;">Pisum sativum L.</span>
            </div>
            <div style="position: relative; height: 135px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); background: #000;">
              <img id="macro-specimen-img" src="assets/genetics/pea_seeds.jpg" alt="Botanical Pea Specimen" style="width: 100%; height: 100%; object-fit: cover; transition: all 0.3s ease;">
              <div id="macro-specimen-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.85)); padding: 6px 12px; font-size: 0.75rem; color: #cbd5e1; font-weight: 600;">
                Mendel's F2 Generation: Round vs Wrinkled Alleles
              </div>
            </div>
          </div>

          <!-- Theoretical Mendelian Ratios Card -->
          <div class="sim-telemetry-card" style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px 20px; display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="font-size: 0.8rem; color: #10b981; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
                <span>🧬</span> Theoretical Mendelian Expectation
              </div>
              <span id="law-badge" style="font-size: 0.72rem; color: #38bdf8; background: rgba(56, 189, 248, 0.12); padding: 3px 8px; border-radius: 4px; font-weight: 600;">
                Law of Segregation
              </span>
            </div>

            <!-- Genotype Breakdown -->
            <div class="sim-sub-card" style="border-radius: 8px; padding: 10px 14px;">
              <div style="font-size: 0.75rem; color: var(--text-dim); margin-bottom: 4px; font-weight: 600;">GENOTYPIC RATIO:</div>
              <div id="readout-genotype" style="font-family: var(--font-mono); color: #38bdf8; font-weight: 700; font-size: 0.95rem;">
                1 RR : 2 Rr : 1 rr
              </div>
            </div>

            <!-- Phenotype Breakdown with Visual Specimen Chips -->
            <div class="sim-sub-card" style="border-radius: 8px; padding: 10px 14px;">
              <div style="font-size: 0.75rem; color: var(--text-dim); margin-bottom: 6px; font-weight: 600;">PHENOTYPIC RATIO & PROBABILITY:</div>
              <div id="phenotype-chips-container" style="display: flex; flex-direction: column; gap: 6px;">
                <!-- Filled dynamically with visual chips -->
              </div>
            </div>
          </div>

          <!-- Monte Carlo Stochastic Simulation & Chi-Square Analysis -->
          <div class="sim-telemetry-card" style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px 20px; display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="font-size: 0.8rem; color: #f59e0b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
                <span>🎲</span> Monte-Carlo Empirical Trials & Chi-Square (χ²)
              </div>
              <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-dim);">
                Sample Size: <strong id="disp-trials-count" style="color: #38bdf8;">1,000</strong>
              </div>
            </div>

            <!-- Live Empirical Chart Canvas -->
            <div style="position: relative; background: #070b14; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); padding: 6px;">
              <canvas id="stochastic-chart" style="display: block; height: 150px; width: 100%;"></canvas>
            </div>

            <!-- Controls for Monte Carlo -->
            <div style="display: grid; grid-template-columns: 1fr auto auto; gap: 10px; align-items: center;">
              <button class="btn btn-primary" id="btn-simulate-offspring" style="display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 700; height: 38px;">
                <span>⚡ Fertilize & Sample Offspring</span>
              </button>
              <select id="select-trials-n" class="select-input" style="height: 38px; width: 105px; padding: 4px 8px; font-size: 0.85rem;">
                <option value="100">N = 100</option>
                <option value="500">N = 500</option>
                <option value="1000" selected>N = 1,000</option>
                <option value="5000">N = 5,000</option>
              </select>
              <button class="btn btn-secondary" id="btn-reset-sim" title="Reset Empirical Trial Counter" style="height: 38px; padding: 0 12px;">
                ↺
              </button>
            </div>

            <!-- Statistical Goodness of Fit Readout -->
            <div id="chi-square-readout" class="sim-sub-card" style="display: flex; justify-content: space-between; align-items: center; border-radius: 6px; padding: 8px 12px; font-family: var(--font-mono); font-size: 0.78rem;">
              <div>Chi-Square: <span id="stat-chisq" style="color: #38bdf8; font-weight: 700;">--</span></div>
              <div>p-value: <span id="stat-pval" style="color: #10b981; font-weight: 700;">--</span></div>
              <div id="stat-verdict" style="color: var(--text-dim);">Awaiting fertilization sample</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Presets & Genetics Inquiry Tasks Bar -->
      <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
            <span>🔬</span> Classical Mendelian Genetics Presets:
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-preset active" data-preset="f1-mono">F1 Monohybrid (Rr × Rr)</button>
            <button class="btn btn-secondary btn-preset" data-preset="test-mono">Mendel Testcross (Rr × rr)</button>
            <button class="btn btn-secondary btn-preset" data-preset="true-mono">True-Breeding P1 (RR × rr)</button>
            <button class="btn btn-secondary btn-preset" data-preset="f2-dihybrid">Classic Dihybrid (RrYy × RrYy)</button>
            <button class="btn btn-secondary btn-preset" data-preset="test-dihybrid">Dihybrid Testcross (RrYy × rryy)</button>
          </div>
        </div>

        <!-- Guided Inquiry Formula & Principle Banner -->
        <div class="sim-telemetry-card" style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 12px 18px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 1.4rem;">📜</span>
            <div>
              <div id="inquiry-title" style="font-weight: 700; color: var(--text-main); font-size: 0.9rem;">
                Mendel's First Law: Principle of Segregation
              </div>
              <div id="inquiry-desc" style="color: var(--text-muted); font-size: 0.82rem; margin-top: 2px;">
                Allele pairs separate equally into gametes during anaphase I of meiosis, resulting in predictable 3:1 phenotypic ratios in heterozygous monohybrid crosses.
              </div>
            </div>
          </div>
          <div id="inquiry-math" class="sim-sub-card" style="padding: 6px 14px; border-radius: 8px; font-size: 0.85rem; color: #38bdf8;">
            ${renderLatex("P(\\text{dominant}) = \\frac{3}{4} = 75\\%,\\quad P(\\text{recessive}) = \\frac{1}{4} = 25\\%", false)}
          </div>
        </div>
      </div>

      <!-- Laboratory Configuration Controls -->
      <div class="lab-controls-panel" style="margin-top: 16px;">
        <div class="control-group">
          <label class="control-label"><span>Cross Architecture</span></label>
          <select id="select-cross-mode" class="select-input">
            <option value="monohybrid" selected>Monohybrid (Single Locus, 2×2 Grid)</option>
            <option value="dihybrid">Dihybrid (Two Unlinked Loci, 4×4 Grid)</option>
          </select>
        </div>

        <div class="control-group">
          <label class="control-label"><span>Biological Trait & Alleles</span></label>
          <select id="select-trait" class="select-input">
            <option value="pea_shape" selected>Pea Seed Shape: Round (R) vs Wrinkled (r)</option>
            <option value="pea_color">Pea Seed Color: Yellow (Y) vs Green (y)</option>
            <option value="flower_color">Pea Flower Color: Purple (P) vs White (p)</option>
          </select>
        </div>

        <div class="control-group">
          <label class="control-label"><span id="lbl-p1">Parent 1 Genotype (Maternal ♀)</span></label>
          <select id="select-p1" class="select-input">
            <!-- Dynamically populated -->
          </select>
        </div>

        <div class="control-group">
          <label class="control-label"><span id="lbl-p2">Parent 2 Genotype (Paternal ♂)</span></label>
          <select id="select-p2" class="select-input">
            <!-- Dynamically populated -->
          </select>
        </div>
      </div>

      <!-- Telemetry Suite & Multi-Trial Bar -->
      <div class="lab-telemetry-suite-bar">
        <div class="lab-trials-badge-group" id="punnett-trials-badge-group">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">Mendelian Pedigree Cross Log:</span>
          <span class="lab-trial-pill trial-1" id="punnett-pill-trial-1" style="opacity: 0.5;">Cross 1 (Cyan)</span>
          <span class="lab-trial-pill trial-2" id="punnett-pill-trial-2" style="opacity: 0.5;">Cross 2 (Amber)</span>
          <span class="lab-trial-pill trial-3" id="punnett-pill-trial-3" style="opacity: 0.5;">Cross 3 (Emerald)</span>
        </div>

        <div class="lab-export-buttons-group">
          <button class="btn btn-secondary" id="btn-record-punnett-trial" style="padding: 6px 12px; font-size: 0.8rem; gap: 6px; border-color: rgba(16,185,129,0.4); color: #10b981;">
            <span>📸 Log Cross Results</span>
          </button>
          <button class="btn btn-secondary" id="btn-export-punnett-csv" style="padding: 6px 12px; font-size: 0.8rem; gap: 6px;">
            <span>📥 Export CSV Data</span>
          </button>
          <button class="btn btn-primary" id="btn-open-punnett-report" style="padding: 6px 14px; font-size: 0.8rem; gap: 6px; background: linear-gradient(135deg, #059669, #047857); border: none;">
            <span>📑 Generate Lab Report</span>
          </button>
        </div>
      </div>

      <!-- Post-Lab Checkpoint Assessment Mount -->
      <div id="punnett-checkpoint-container"></div>
    </div>
  `;

  // --- TRAIT SPECIFICATIONS ---
  const traits = {
    pea_shape: {
      name: "Pea Seed Shape",
      domLetter: "R",
      recLetter: "r",
      domName: "Round",
      recName: "Wrinkled",
      domColor: "#22c55e",
      recColor: "#15803d",
      renderSpecimen: (ctx, x, y, size, isDom) => drawPeaSeed(ctx, x, y, size, isDom, "#22c55e", "#16a34a")
    },
    pea_color: {
      name: "Pea Seed Color",
      domLetter: "Y",
      recLetter: "y",
      domName: "Yellow",
      recName: "Green",
      domColor: "#facc15",
      recColor: "#22c55e",
      renderSpecimen: (ctx, x, y, size, isDom) => drawPeaSeed(ctx, x, y, size, true, isDom ? "#facc15" : "#22c55e", isDom ? "#eab308" : "#16a34a")
    },
    flower_color: {
      name: "Pea Flower Color",
      domLetter: "P",
      recLetter: "p",
      domName: "Purple",
      recName: "White",
      domColor: "#a855f7",
      recColor: "#f8fafc",
      renderSpecimen: (ctx, x, y, size, isDom) => drawPeaFlower(ctx, x, y, size, isDom)
    }
  };

  // State
  let crossMode = "monohybrid"; // "monohybrid" or "dihybrid"
  let currentTrait = "pea_shape";
  let p1Geno = "Rr";
  let p2Geno = "Rr";
  let hoveredCell = null;
  let simulatedResults = null;
  let trialsCount = 1000;

  // DOM Elements
  const canvas = document.getElementById("punnett-canvas");
  const ctx = canvas.getContext("2d");
  const chartCanvas = document.getElementById("stochastic-chart");
  const chartCtx = chartCanvas.getContext("2d");

  const crossModeSelect = document.getElementById("select-cross-mode");
  const traitSelect = document.getElementById("select-trait");
  const p1Select = document.getElementById("select-p1");
  const p2Select = document.getElementById("select-p2");
  const trialsSelect = document.getElementById("select-trials-n");
  const btnSimulate = document.getElementById("btn-simulate-offspring");
  const btnResetSim = document.getElementById("btn-reset-sim");

  // Populate genotype dropdowns based on crossMode
  function populateGenotypeSelects() {
    if (crossMode === "monohybrid") {
      const trait = traits[currentTrait];
      const D = trait.domLetter;
      const r = trait.recLetter;

      const opts = [
        { val: `${D}${r}`, text: `${D}${r} (Heterozygous Dominant)` },
        { val: `${D}${D}`, text: `${D}${D} (Homozygous Dominant)` },
        { val: `${r}${r}`, text: `${r}${r} (Homozygous Recessive)` }
      ];

      p1Select.innerHTML = opts.map(o => `<option value="${o.val}">${o.text}</option>`).join("");
      p2Select.innerHTML = opts.map(o => `<option value="${o.val}">${o.text}</option>`).join("");

      p1Select.value = p1Geno.length === 2 ? p1Geno : `${D}${r}`;
      p2Select.value = p2Geno.length === 2 ? p2Geno : `${D}${r}`;
    } else {
      // Dihybrid: RrYy
      const opts = [
        { val: "RrYy", text: "RrYy (Double Heterozygote)" },
        { val: "RRYY", text: "RRYY (Pure Dominant)" },
        { val: "rryy", text: "rryy (Pure Recessive)" },
        { val: "RrYY", text: "RrYY (Hetero Shape, Homo Yellow)" },
        { val: "RRYy", text: "RRYy (Homo Round, Hetero Yellow)" },
        { val: "Rryy", text: "Rryy (Hetero Round, Homo Green)" },
        { val: "rrYy", text: "rrYy (Homo Wrinkled, Hetero Yellow)" }
      ];

      p1Select.innerHTML = opts.map(o => `<option value="${o.val}">${o.text}</option>`).join("");
      p2Select.innerHTML = opts.map(o => `<option value="${o.val}">${o.text}</option>`).join("");

      p1Select.value = p1Geno.length === 4 ? p1Geno : "RrYy";
      p2Select.value = p2Geno.length === 4 ? p2Geno : "RrYy";
    }

    p1Geno = p1Select.value;
    p2Geno = p2Select.value;
  }

  // --- SCIENTIFIC RENDERING OF SPECIMENS ---
  function drawPeaSeed(ctx, x, y, radius, isRound, mainCol, darkCol) {
    ctx.save();
    ctx.translate(x, y);

    if (isRound) {
      // Smooth spherical pea with 3D glossy gradient
      const grad = ctx.createRadialGradient(-radius * 0.35, -radius * 0.35, radius * 0.1, 0, 0, radius);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.25, mainCol);
      grad.addColorStop(0.85, darkCol);
      grad.addColorStop(1, "#0f2f18");

      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
      ctx.fill();

      // Specular highlight gleam
      ctx.shadowColor = "transparent";
      ctx.beginPath();
      ctx.ellipse(-radius * 0.38, -radius * 0.38, radius * 0.35, radius * 0.2, Math.PI / 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
      ctx.fill();

      // Hilum scar
      ctx.beginPath();
      ctx.arc(radius * 0.6, 0, radius * 0.12, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      ctx.fill();
    } else {
      // Wrinkled pea seed: irregular perimeter with deep clefts & creases
      ctx.beginPath();
      const numPoints = 14;
      for (let i = 0; i <= numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const indent = (i % 2 === 0 ? 0.78 : (i % 3 === 0 ? 0.92 : 0.85));
        const r = radius * indent;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      const grad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, radius * 0.1, 0, 0, radius);
      grad.addColorStop(0, "#e2f9d8");
      grad.addColorStop(0.3, mainCol);
      grad.addColorStop(0.9, darkCol);
      grad.addColorStop(1, "#092010");

      ctx.fillStyle = grad;
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;
      ctx.fill();

      // Wrinkle crease shadows
      ctx.shadowColor = "transparent";
      ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
      ctx.lineWidth = Math.max(1.5, radius * 0.08);
      ctx.beginPath();
      ctx.moveTo(-radius * 0.4, -radius * 0.2);
      ctx.quadraticCurveTo(0, 0, radius * 0.3, -radius * 0.3);
      ctx.moveTo(-radius * 0.2, radius * 0.3);
      ctx.quadraticCurveTo(0, 0, radius * 0.4, radius * 0.2);
      ctx.stroke();

      // Subtle highlight ridges
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = Math.max(1, radius * 0.05);
      ctx.beginPath();
      ctx.moveTo(-radius * 0.4, -radius * 0.25);
      ctx.quadraticCurveTo(0, -0.05, radius * 0.3, -radius * 0.35);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawPeaFlower(ctx, x, y, size, isPurple) {
    ctx.save();
    ctx.translate(x, y);

    const mainColor = isPurple ? "#a855f7" : "#f8fafc";
    const darkColor = isPurple ? "#6b21a8" : "#cbd5e1";
    const highlightColor = isPurple ? "#f472b6" : "#ffffff";

    // Standard (Banner) Petal (large top petal)
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.4, size * 0.7, size * 0.55, 0, 0, Math.PI * 2);
    const gradBanner = ctx.createLinearGradient(0, -size * 0.9, 0, 0);
    gradBanner.addColorStop(0, highlightColor);
    gradBanner.addColorStop(0.6, mainColor);
    gradBanner.addColorStop(1, darkColor);
    ctx.fillStyle = gradBanner;
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 8;
    ctx.fill();

    // Veins on banner
    ctx.shadowColor = "transparent";
    ctx.strokeStyle = isPurple ? "rgba(255,255,255,0.22)" : "rgba(148,163,184,0.35)";
    ctx.lineWidth = 1;
    for (let angle = -0.4; angle <= 0.4; angle += 0.2) {
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.1);
      ctx.lineTo(Math.sin(angle) * size * 0.6, -size * 0.4 + Math.cos(angle) * -size * 0.4);
      ctx.stroke();
    }

    // Two Lateral Wing Petals
    const drawWing = (side) => {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(side * size * 0.45, size * 0.1, size * 0.4, size * 0.3, side * 0.35, 0, Math.PI * 2);
      const gradWing = ctx.createRadialGradient(side * size * 0.4, size * 0.05, 2, side * size * 0.45, size * 0.1, size * 0.4);
      gradWing.addColorStop(0, highlightColor);
      gradWing.addColorStop(0.7, mainColor);
      gradWing.addColorStop(1, darkColor);
      ctx.fillStyle = gradWing;
      ctx.fill();
      ctx.restore();
    };
    drawWing(-1);
    drawWing(1);

    // Keel Petal (Center bottom)
    ctx.beginPath();
    ctx.ellipse(0, size * 0.25, size * 0.25, size * 0.35, 0, 0, Math.PI * 2);
    ctx.fillStyle = isPurple ? "#581c87" : "#94a3b8";
    ctx.fill();

    // Yellow stamen center
    ctx.beginPath();
    ctx.arc(0, size * 0.05, size * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = "#facc15";
    ctx.shadowColor = "rgba(250, 204, 21, 0.7)";
    ctx.shadowBlur = 6;
    ctx.fill();

    ctx.restore();
  }

  // --- DRAWING CHROMOSOME GAMETE ICON ---
  function drawChromosome(ctx, x, y, length, color, letter) {
    ctx.save();
    ctx.translate(x, y);

    // Left and right chromatids
    const width = 6;
    const halfLen = length / 2;

    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;

    // Centromere constriction
    ctx.beginPath();
    ctx.ellipse(-width, -halfLen * 0.5, width, halfLen * 0.4, 0, 0, Math.PI * 2);
    ctx.ellipse(-width, halfLen * 0.5, width, halfLen * 0.4, 0, 0, Math.PI * 2);
    ctx.ellipse(width, -halfLen * 0.5, width, halfLen * 0.4, 0, 0, Math.PI * 2);
    ctx.ellipse(width, halfLen * 0.5, width, halfLen * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Centromere bead
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "transparent";
    ctx.fill();

    // Fluorescent Gene Band
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(-width * 1.8, -halfLen * 0.6, width * 3.6, 3);

    // Letter Tag
    ctx.font = "800 16px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 4;
    ctx.fillText(letter, 0, halfLen + 14);

    ctx.restore();
  }

  // --- LOGIC CALCULATIONS ---
  function getGametes(geno) {
    if (crossMode === "monohybrid") {
      // 2 alleles: e.g. Rr -> [R, r]
      return [geno[0], geno[1]];
    } else {
      // 4 alleles: RrYy -> [RY, Ry, rY, ry]
      const A1 = geno[0];
      const A2 = geno[1];
      const B1 = geno[2];
      const B2 = geno[3];
      return [
        A1 + B1,
        A1 + B2,
        A2 + B1,
        A2 + B2
      ];
    }
  }

  function combineGametes(g1, g2) {
    if (crossMode === "monohybrid") {
      // g1 = 'R', g2 = 'r' -> "Rr"
      const trait = traits[currentTrait];
      const D = trait.domLetter;
      const r = trait.recLetter;
      if ((g1 === D && g2 === r) || (g1 === r && g2 === D)) return `${D}${r}`;
      if (g1 === D && g2 === D) return `${D}${D}`;
      return `${r}${r}`;
    } else {
      // Dihybrid: g1='RY', g2='ry' -> Shape (R/r) + Color (Y/y)
      const shapeAlleles = [g1[0], g2[0]].sort((a,b) => (a === 'R' ? -1 : 1)).join("");
      const colorAlleles = [g1[1], g2[1]].sort((a,b) => (a === 'Y' ? -1 : 1)).join("");
      return shapeAlleles + colorAlleles;
    }
  }

  function getPhenotype(combo) {
    if (crossMode === "monohybrid") {
      const trait = traits[currentTrait];
      const isDom = combo.includes(trait.domLetter);
      return {
        name: isDom ? `${trait.domName} (Dominant)` : `${trait.recName} (Recessive)`,
        shortName: isDom ? trait.domName : trait.recName,
        isDominant: isDom,
        color: isDom ? trait.domColor : trait.recColor,
        render: (ctx, x, y, size) => trait.renderSpecimen(ctx, x, y, size, isDom)
      };
    } else {
      // Dihybrid: R & Y
      const isRound = combo.includes('R');
      const isYellow = combo.includes('Y');

      let name = "";
      if (isRound && isYellow) name = "Round Yellow";
      else if (isRound && !isYellow) name = "Round Green";
      else if (!isRound && isYellow) name = "Wrinkled Yellow";
      else name = "Wrinkled Green";

      const col = (isRound && isYellow) ? "#facc15" :
                  (isRound && !isYellow) ? "#22c55e" :
                  (!isRound && isYellow) ? "#eab308" : "#16a34a";

      return {
        name: name,
        shortName: name,
        isRound,
        isYellow,
        color: col,
        render: (ctx, x, y, size) => drawPeaSeed(ctx, x, y, size, isRound, isYellow ? "#facc15" : "#22c55e", isYellow ? "#ca8a04" : "#15803d")
      };
    }
  }

  // --- DRAW PUNNETT GRID ---
  function drawGrid() {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    // Deep dark laboratory background
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, Math.max(w, h) * 0.75);
    bgGrad.addColorStop(0, "#0c1527");
    bgGrad.addColorStop(0.65, "#070b15");
    bgGrad.addColorStop(1, "#03060c");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle isometric scientific grid pattern
    ctx.strokeStyle = "rgba(56, 189, 248, 0.035)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 28) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 28) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const mGametes = getGametes(p1Geno);
    const pGametes = getGametes(p2Geno);
    const gridSize = mGametes.length;
    const isMono = crossMode === "monohybrid";

    // Responsive cell size & centered positioning
    const leftMargin = isMono ? 135 : 115;
    const maxCellW = isMono
      ? Math.min(142, Math.floor((w - leftMargin - 30) / gridSize))
      : Math.min(76, Math.floor((w - leftMargin - 30) / gridSize));
    const maxCellH = isMono ? 142 : 76;
    const cellSize = Math.min(maxCellW, maxCellH);

    const gridTotalW = gridSize * cellSize;
    const gridTotalH = gridSize * cellSize;
    const gridStartX = Math.max(leftMargin, Math.round((w - gridTotalW + (leftMargin - 50)) / 2));
    const gridStartY = isMono ? 112 : 104;

    // --- MATERNAL HEADER (TOP) ---
    ctx.save();
    ctx.fillStyle = "#f43f5e";
    ctx.font = "800 13px 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("♀ MATERNAL GAMETES (Parent 1: " + p1Geno + ")", gridStartX + gridTotalW / 2, gridStartY - 54);

    // Maternal gametes
    for (let c = 0; c < gridSize; c++) {
      const cx = gridStartX + c * cellSize + cellSize / 2;
      const cy = gridStartY - 27;
      const isColHovered = hoveredCell && hoveredCell.c === c;

      // Segregation guide / fusion line
      ctx.strokeStyle = isColHovered ? "rgba(244, 63, 94, 0.85)" : "rgba(244, 63, 94, 0.35)";
      ctx.lineWidth = isColHovered ? 2 : 1.5;
      if (isColHovered) {
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cx, cy + 13);
        ctx.lineTo(cx, gridStartY + (hoveredCell.r + 0.5) * cellSize);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        ctx.beginPath();
        ctx.moveTo(cx, cy + 12);
        ctx.lineTo(cx, gridStartY - 4);
        ctx.stroke();
      }

      // Allele badge
      ctx.save();
      const badgeW = isMono ? 48 : 42;
      const badgeH = 26;
      ctx.beginPath();
      ctx.roundRect(cx - badgeW / 2, cy - badgeH / 2, badgeW, badgeH, 6);
      if (isColHovered) {
        ctx.fillStyle = "rgba(244, 63, 94, 0.35)";
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#f43f5e";
        ctx.shadowBlur = 12;
      } else {
        ctx.fillStyle = "rgba(244, 63, 94, 0.14)";
        ctx.strokeStyle = "rgba(244, 63, 94, 0.7)";
        ctx.lineWidth = 1.2;
      }
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = "#ffffff";
      ctx.font = isMono ? "800 16px 'JetBrains Mono', monospace" : "800 13px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(mGametes[c], cx, cy);
    }
    ctx.restore();

    // --- PATERNAL HEADER (LEFT) ---
    ctx.save();
    ctx.translate(gridStartX - (isMono ? 78 : 68), gridStartY + gridTotalH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = "#38bdf8";
    ctx.font = "800 13px 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("♂ PATERNAL GAMETES (Parent 2: " + p2Geno + ")", 0, 0);
    ctx.restore();

    for (let r = 0; r < gridSize; r++) {
      const cx = gridStartX - (isMono ? 38 : 32);
      const cy = gridStartY + r * cellSize + cellSize / 2;
      const isRowHovered = hoveredCell && hoveredCell.r === r;

      // Rightward segregation / fusion guide line
      ctx.save();
      ctx.strokeStyle = isRowHovered ? "rgba(56, 189, 248, 0.85)" : "rgba(56, 189, 248, 0.35)";
      ctx.lineWidth = isRowHovered ? 2 : 1.5;
      if (isRowHovered) {
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cx + (isMono ? 24 : 20), cy);
        ctx.lineTo(gridStartX + (hoveredCell.c + 0.5) * cellSize, cy);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        ctx.beginPath();
        ctx.moveTo(cx + (isMono ? 22 : 18), cy);
        ctx.lineTo(gridStartX - 4, cy);
        ctx.stroke();
      }
      ctx.restore();

      // Allele badge
      ctx.save();
      const badgeW = isMono ? 48 : 42;
      const badgeH = 26;
      ctx.beginPath();
      ctx.roundRect(cx - badgeW / 2, cy - badgeH / 2, badgeW, badgeH, 6);
      if (isRowHovered) {
        ctx.fillStyle = "rgba(56, 189, 248, 0.35)";
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 12;
      } else {
        ctx.fillStyle = "rgba(56, 189, 248, 0.14)";
        ctx.strokeStyle = "rgba(56, 189, 248, 0.7)";
        ctx.lineWidth = 1.2;
      }
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = "#ffffff";
      ctx.font = isMono ? "800 16px 'JetBrains Mono', monospace" : "800 13px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(pGametes[r], cx, cy);
    }

    // Store cells for hit testing
    const cellRects = [];

    // --- GRID CELLS ---
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const x = gridStartX + c * cellSize;
        const y = gridStartY + r * cellSize;
        const combo = combineGametes(mGametes[c], pGametes[r]);
        const pheno = getPhenotype(combo);

        const isHovered = hoveredCell && hoveredCell.r === r && hoveredCell.c === c;
        const isMatchedPheno = hoveredCell && hoveredCell.phenoName === pheno.name;

        cellRects.push({ r, c, x, y, size: cellSize, combo, pheno });

        // Glass cell card background
        ctx.save();
        const pad = isMono ? 4 : 3;
        const radius = isMono ? 12 : 8;
        ctx.beginPath();
        ctx.roundRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2, radius);

        if (isHovered) {
          ctx.fillStyle = "rgba(56, 189, 248, 0.28)";
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 2.5;
          ctx.shadowColor = "#38bdf8";
          ctx.shadowBlur = 16;
        } else if (isMatchedPheno) {
          ctx.fillStyle = "rgba(245, 158, 11, 0.2)";
          ctx.strokeStyle = "#f59e0b";
          ctx.lineWidth = 2;
          ctx.shadowColor = "#f59e0b";
          ctx.shadowBlur = 10;
        } else {
          ctx.fillStyle = "rgba(18, 28, 48, 0.75)";
          ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
          ctx.lineWidth = 1.2;
          ctx.shadowColor = "transparent";
        }
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Content rendering based on mode
        if (isMono) {
          // Large 2x2 view: 3D Specimen in center top, Genotype in center bottom
          const specimenY = y + cellSize * 0.40;
          const specimenRadius = 34;
          pheno.render(ctx, x + cellSize / 2, specimenY, specimenRadius);

          // Genotype Tag
          ctx.save();
          ctx.font = "800 24px 'JetBrains Mono', monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = "rgba(0,0,0,0.8)";
          ctx.shadowBlur = 6;
          ctx.fillText(combo, x + cellSize / 2, y + cellSize * 0.77);
          ctx.restore();

          // Phenotype Name Pill
          ctx.font = "700 11px 'Outfit', sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = pheno.color;
          ctx.fillText(pheno.shortName, x + cellSize / 2, y + cellSize * 0.90);
        } else {
          // Dihybrid 4x4: compact tile with mini-specimen & 4-letter genotype
          const miniRadius = 15;
          pheno.render(ctx, x + cellSize / 2, y + cellSize * 0.34, miniRadius);

          // Genotype text
          ctx.font = "800 12px 'JetBrains Mono', monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#ffffff";
          ctx.fillText(combo, x + cellSize / 2, y + cellSize * 0.69);

          // Tiny Phenotype dot & indicator
          ctx.beginPath();
          ctx.arc(x + cellSize / 2, y + cellSize * 0.86, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = pheno.color;
          ctx.fill();
        }
      }
    }

    ctx.restore();

    // Attach cellRects for hit testing
    canvas._cellRects = cellRects;
  }

  // --- THEORETICAL ANALYSIS & TELEMETRY ---
  function updateTheoreticalAnalysis() {
    const mGametes = getGametes(p1Geno);
    const pGametes = getGametes(p2Geno);
    const totalCells = mGametes.length * pGametes.length;

    const genotypeCounts = {};
    const phenotypeCounts = {};

    for (let r = 0; r < pGametes.length; r++) {
      for (let c = 0; c < mGametes.length; c++) {
        const combo = combineGametes(mGametes[c], pGametes[r]);
        genotypeCounts[combo] = (genotypeCounts[combo] || 0) + 1;

        const pheno = getPhenotype(combo);
        const pKey = pheno.name;
        if (!phenotypeCounts[pKey]) {
          phenotypeCounts[pKey] = {
            name: pheno.name,
            color: pheno.color,
            count: 0,
            render: pheno.render
          };
        }
        phenotypeCounts[pKey].count++;
      }
    }

    // Format Genotype Ratio with stylish badges
    const genoKeys = Object.keys(genotypeCounts);
    const genoStr = genoKeys.map(k => `
      <span class="genotype-pill" style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 6px; font-weight: 800; font-size: 0.9rem;">
        <strong class="genotype-count">${genotypeCounts[k]}</strong> <span class="genotype-letters">${k}</span>
      </span>
    `).join(" <span class='genotype-separator' style='font-weight: 700;'>:</span> ");
    const readoutGeno = document.getElementById("readout-genotype");
    if (readoutGeno) readoutGeno.innerHTML = genoStr;

    // Render Phenotype Chips
    const chipsContainer = document.getElementById("phenotype-chips-container");
    const phenoKeys = Object.keys(phenotypeCounts);

    if (chipsContainer) {
      chipsContainer.innerHTML = phenoKeys.map(k => {
        const p = phenotypeCounts[k];
        const pct = ((p.count / totalCells) * 100).toFixed(1);
        return `
          <div class="pheno-chip-row" style="display: flex; align-items: center; justify-content: space-between; border-radius: 8px; padding: 8px 14px; border-left: 4px solid ${p.color}; transition: all 0.2s ease;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${p.color}; box-shadow: 0 0 8px ${p.color};"></span>
              <span class="pheno-chip-title" style="font-size: 0.85rem; font-weight: 700;">${p.name}</span>
            </div>
            <div class="pheno-chip-ratio" style="font-family: var(--font-mono); font-size: 0.82rem;">
              <strong class="pheno-chip-count" style="font-weight: 800; font-size: 0.95rem;">${p.count}/${totalCells}</strong> (${pct}%)
            </div>
          </div>
        `;
      }).join("");
    }

    // Draw stochastic chart if simulation exists or theoretical baseline
    drawStochasticChart(phenotypeCounts, totalCells);
  }

  // --- MONTE CARLO STOCHASTIC SIMULATION ---
  function runMonteCarlo() {
    const mGametes = getGametes(p1Geno);
    const pGametes = getGametes(p2Geno);
    const totalCells = mGametes.length * pGametes.length;

    // Possible offspring combinations
    const combos = [];
    for (let r = 0; r < pGametes.length; r++) {
      for (let c = 0; c < mGametes.length; c++) {
        combos.push(combineGametes(mGametes[c], pGametes[r]));
      }
    }

    const empiricalCounts = {};
    for (let i = 0; i < trialsCount; i++) {
      const pick = combos[Math.floor(Math.random() * combos.length)];
      const pheno = getPhenotype(pick);
      empiricalCounts[pheno.name] = (empiricalCounts[pheno.name] || 0) + 1;
    }

    // Theoretical distribution
    const theoreticalCounts = {};
    combos.forEach(c => {
      const pheno = getPhenotype(c);
      theoreticalCounts[pheno.name] = (theoreticalCounts[pheno.name] || 0) + (trialsCount / totalCells);
    });

    // Chi-Square Calculation: sum((O - E)^2 / E)
    let chiSq = 0;
    const phenoKeys = Object.keys(theoreticalCounts);
    phenoKeys.forEach(k => {
      const O = empiricalCounts[k] || 0;
      const E = theoreticalCounts[k];
      chiSq += Math.pow(O - E, 2) / E;
    });

    const df = phenoKeys.length - 1;
    // Critical value at alpha = 0.05: df=1 -> 3.84, df=3 -> 7.81
    const critVal = df === 1 ? 3.841 : (df === 3 ? 7.815 : 5.991);
    const passesMendel = chiSq < critVal;

    simulatedResults = {
      trials: trialsCount,
      empirical: empiricalCounts,
      theoretical: theoreticalCounts,
      chiSq: chiSq.toFixed(2),
      df: df,
      passesMendel: passesMendel
    };

    // Update Chi-Square HUD
    const chisqEl = document.getElementById("stat-chisq");
    const pvalEl = document.getElementById("stat-pval");
    const verdictEl = document.getElementById("stat-verdict");
    if (chisqEl) chisqEl.innerText = chiSq.toFixed(3);
    if (pvalEl) pvalEl.innerText = passesMendel ? "> 0.05 (H₀ Accepted)" : "< 0.05 (Significant Dev.)";
    if (verdictEl) {
      verdictEl.innerHTML = passesMendel
        ? `<span style="color: #10b981; font-weight: 700;">✓ Conforms to Mendel's Law</span>`
        : `<span style="color: #ef4444; font-weight: 700;">⚠ Statistical Drift</span>`;
    }

    updateTheoreticalAnalysis();
  }

  // --- STOCHASTIC DISTRIBUTION BAR CHART ---
  function drawStochasticChart(phenotypeCounts, totalCells) {
    if (!chartCanvas || !chartCtx) return;
    const dpr = window.devicePixelRatio || 1;
    const cw = chartCanvas.width / dpr;
    const ch = chartCanvas.height / dpr;

    chartCtx.save();
    chartCtx.scale(dpr, dpr);
    chartCtx.clearRect(0, 0, cw, ch);

    // Dark chart surface
    chartCtx.fillStyle = "#070b14";
    chartCtx.fillRect(0, 0, cw, ch);

    const phenoKeys = Object.keys(phenotypeCounts);
    const numClasses = phenoKeys.length;
    if (numClasses === 0) {
      chartCtx.restore();
      return;
    }

    const paddingX = 40;
    const chartW = cw - paddingX * 2;
    const chartH = ch - 50;
    const slotW = chartW / numClasses;

    // Draw grid baseline
    chartCtx.strokeStyle = "rgba(255,255,255,0.12)";
    chartCtx.lineWidth = 1;
    chartCtx.beginPath();
    chartCtx.moveTo(paddingX, ch - 30);
    chartCtx.lineTo(cw - paddingX, ch - 30);
    chartCtx.stroke();

    const maxPct = crossMode === "monohybrid" ? 85 : 65;

    // Subtle horizontal reference lines
    chartCtx.strokeStyle = "rgba(255,255,255,0.06)";
    chartCtx.lineWidth = 1;
    for (let p = 25; p <= (crossMode === "monohybrid" ? 75 : 50); p += 25) {
      const gy = ch - 30 - (p / maxPct) * chartH;
      chartCtx.beginPath();
      chartCtx.moveTo(paddingX, gy);
      chartCtx.lineTo(cw - paddingX, gy);
      chartCtx.stroke();

      chartCtx.font = "600 8px 'JetBrains Mono', monospace";
      chartCtx.fillStyle = "#64748b";
      chartCtx.textAlign = "right";
      chartCtx.fillText(`${p}%`, paddingX - 4, gy + 3);
    }

    phenoKeys.forEach((key, idx) => {
      const p = phenotypeCounts[key];
      const theoPct = (p.count / totalCells) * 100;
      const theoBarH = (theoPct / maxPct) * chartH;

      const slotX = paddingX + idx * slotW;
      const barW = Math.min(36, slotW * 0.35);

      // 1. Theoretical Bar (Dashed cyan outline)
      const theoX = slotX + slotW * 0.25;
      const theoY = ch - 30 - theoBarH;

      chartCtx.fillStyle = "rgba(56, 189, 248, 0.15)";
      chartCtx.strokeStyle = "#38bdf8";
      chartCtx.lineWidth = 1.5;
      chartCtx.setLineDash([3, 3]);
      chartCtx.beginPath();
      chartCtx.roundRect(theoX, theoY, barW, theoBarH, [4, 4, 0, 0]);
      chartCtx.fill();
      chartCtx.stroke();
      chartCtx.setLineDash([]);

      // Theoretical label
      chartCtx.font = "700 9px 'JetBrains Mono', monospace";
      chartCtx.fillStyle = "#38bdf8";
      chartCtx.textAlign = "center";
      chartCtx.fillText(`${theoPct.toFixed(0)}%`, theoX + barW / 2, theoY - 6);

      // 2. Empirical Bar (if simulated)
      if (simulatedResults && simulatedResults.empirical) {
        const empCount = simulatedResults.empirical[key] || 0;
        const empPct = (empCount / simulatedResults.trials) * 100;
        const empBarH = (empPct / maxPct) * chartH;

        const empX = slotX + slotW * 0.55;
        const empY = ch - 30 - empBarH;

        const empGrad = chartCtx.createLinearGradient(0, empY, 0, ch - 30);
        empGrad.addColorStop(0, p.color);
        empGrad.addColorStop(1, "rgba(0,0,0,0.5)");

        chartCtx.fillStyle = empGrad;
        chartCtx.strokeStyle = p.color;
        chartCtx.lineWidth = 1.5;
        chartCtx.beginPath();
        chartCtx.roundRect(empX, empY, barW, empBarH, [4, 4, 0, 0]);
        chartCtx.fill();
        chartCtx.stroke();

        // Empirical label
        chartCtx.font = "800 10px 'JetBrains Mono', monospace";
        chartCtx.fillStyle = "#ffffff";
        chartCtx.textAlign = "center";
        chartCtx.fillText(`${empPct.toFixed(1)}%`, empX + barW / 2, empY - 6);
      }

      // Category bottom label
      chartCtx.font = "600 10px 'Outfit', sans-serif";
      chartCtx.fillStyle = "#94a3b8";
      chartCtx.textAlign = "center";
      const shortLabel = key.replace(" (Dominant)", "").replace(" (Recessive)", "");
      chartCtx.fillText(shortLabel, slotX + slotW / 2, ch - 12);
    });

    // Legend
    chartCtx.font = "600 9px 'Outfit', sans-serif";
    chartCtx.textAlign = "left";
    chartCtx.fillStyle = "#38bdf8";
    chartCtx.fillText("-- Theoretical", paddingX, 16);
    if (simulatedResults) {
      chartCtx.fillStyle = "#f59e0b";
      chartCtx.fillText("■ Empirical (Observed)", paddingX + 90, 16);
    }

    chartCtx.restore();
  }

  // --- PRESET HANDLERS ---
  const presets = {
    "f1-mono": {
      title: "Mendel's First Law: Principle of Segregation",
      desc: "Heterozygous monohybrid cross (Rr × Rr) demonstrates the classic 3:1 phenotypic and 1:2:1 genotypic ratios.",
      math: "P(\\text{Round}) = \\frac{3}{4},\\quad P(\\text{Wrinkled}) = \\frac{1}{4}",
      mode: "monohybrid",
      trait: "pea_shape",
      p1: "Rr",
      p2: "Rr"
    },
    "test-mono": {
      title: "Mendel's Testcross (Heterozygote × Homozygous Recessive)",
      desc: "Cross of an unknown dominant phenotype with a homozygous recessive tester yields a 1:1 ratio, proving heterozygosity.",
      math: "Rr \\times rr \\implies 1\\text{ Round (50\\%)} : 1\\text{ Wrinkled (50\\%)}",
      mode: "monohybrid",
      trait: "pea_shape",
      p1: "Rr",
      p2: "rr"
    },
    "true-mono": {
      title: "P-Generation True-Breeding Parental Cross",
      desc: "Homozygous dominant crossed with homozygous recessive produces 100% uniform heterozygous F1 progeny.",
      math: "RR \\times rr \\implies 100\\%\\ Rr\\text{ (Round)}",
      mode: "monohybrid",
      trait: "pea_shape",
      p1: "RR",
      p2: "rr"
    },
    "f2-dihybrid": {
      title: "Mendel's Second Law: Independent Assortment",
      desc: "Dihybrid cross (RrYy × RrYy) of two unlinked traits yields the classic 9:3:3:1 phenotypic distribution in a 16-cell matrix.",
      math: "9\\text{ R\\_Y\\_} : 3\\text{ R\\_yy} : 3\\text{ rrY\\_} : 1\\text{ rryy}",
      mode: "dihybrid",
      trait: "pea_shape",
      p1: "RrYy",
      p2: "RrYy"
    },
    "test-dihybrid": {
      title: "Dihybrid Testcross for Linkage Verification",
      desc: "Double heterozygote crossed with double recessive tester yields a 1:1:1:1 ratio if alleles assort independently without genetic linkage.",
      math: "RrYy \\times rryy \\implies 1 : 1 : 1 : 1\\text{ (25\\% each)}",
      mode: "dihybrid",
      trait: "pea_shape",
      p1: "RrYy",
      p2: "rryy"
    }
  };

  function applyPreset(presetKey) {
    const p = presets[presetKey];
    if (!p) return;

    crossMode = p.mode;
    currentTrait = p.trait;
    p1Geno = p.p1;
    p2Geno = p.p2;

    crossModeSelect.value = crossMode;
    traitSelect.value = currentTrait;
    const modeDisp = document.getElementById("cross-mode-display");
    if (modeDisp) {
      modeDisp.innerText = crossMode === "monohybrid" ? "Monohybrid (2×2) Cross" : "Dihybrid (4×4) Cross";
    }
    const lawBadge = document.getElementById("law-badge");
    if (lawBadge) {
      lawBadge.innerText = crossMode === "monohybrid" ? "Law of Segregation" : "Independent Assortment";
    }
    const traitPill = document.getElementById("hud-trait-pill");
    if (traitPill) {
      traitPill.innerText = currentTrait === "pea_shape" ? "Pea Shape (R/r)" :
                            currentTrait === "pea_color" ? "Seed Color (Y/y)" : "Flower Color (P/p)";
    }

    populateGenotypeSelects();
    p1Select.value = p1Geno;
    p2Select.value = p2Geno;

    // Update Guided Inquiry Banner
    const inqTitle = document.getElementById("inquiry-title");
    const inqDesc = document.getElementById("inquiry-desc");
    const mathEl = document.getElementById("inquiry-math");
    if (inqTitle) inqTitle.innerText = p.title;
    if (inqDesc) inqDesc.innerText = p.desc;
    if (mathEl) {
      mathEl.innerHTML = renderLatex(p.math, false);
      upgradeAllMath(mathEl);
    }

    // Update active preset button style
    document.querySelectorAll(".btn-preset").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.preset === presetKey);
    });

    simulatedResults = null;
    const chisqEl = document.getElementById("stat-chisq");
    const pvalEl = document.getElementById("stat-pval");
    const verdictEl = document.getElementById("stat-verdict");
    if (chisqEl) chisqEl.innerText = "--";
    if (pvalEl) pvalEl.innerText = "--";
    if (verdictEl) verdictEl.innerText = "Awaiting fertilization sample";

    updateMacroSpecimenCard();
    handleResize();
  }

  // --- INTERACTION & HOVER EVENTS ---
  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (!canvas._cellRects) return;

    let found = null;
    for (const cell of canvas._cellRects) {
      if (mouseX >= cell.x && mouseX <= cell.x + cell.size &&
          mouseY >= cell.y && mouseY <= cell.y + cell.size) {
        found = cell;
        break;
      }
    }

    if (found) {
      hoveredCell = { r: found.r, c: found.c, phenoName: found.pheno.name };
      const totalCells = crossMode === "monohybrid" ? 4 : 16;
      const count = canvas._cellRects.filter(c => c.pheno.name === found.pheno.name).length;
      const pct = ((count / totalCells) * 100).toFixed(1);

      const hudGeno = document.getElementById("hud-genotype");
      const hudPheno = document.getElementById("hud-phenotype");
      const hudProb = document.getElementById("hud-probability");
      if (hudGeno) hudGeno.innerText = found.combo;
      if (hudPheno) {
        hudPheno.innerText = found.pheno.name;
        hudPheno.style.color = found.pheno.color;
      }
      if (hudProb) {
        hudProb.innerHTML = `<strong class="hud-count-val">${count}/${totalCells}</strong> (${pct}%)`;
      }
    } else {
      hoveredCell = null;
      const hudGeno = document.getElementById("hud-genotype");
      const hudPheno = document.getElementById("hud-phenotype");
      const hudProb = document.getElementById("hud-probability");
      if (hudGeno) hudGeno.innerText = "--";
      if (hudPheno) {
        hudPheno.innerText = "Hover or tap any cell in grid";
        hudPheno.style.color = "#f59e0b";
      }
      if (hudProb) hudProb.innerText = "--";
    }
    drawGrid();
  });

  canvas.addEventListener("mouseleave", () => {
    hoveredCell = null;
    const hudGeno = document.getElementById("hud-genotype");
    const hudPheno = document.getElementById("hud-phenotype");
    const hudProb = document.getElementById("hud-probability");
    if (hudGeno) hudGeno.innerText = "--";
    if (hudPheno) {
      hudPheno.innerText = "Hover or tap any cell in grid";
      hudPheno.style.color = "#f59e0b";
    }
    if (hudProb) hudProb.innerText = "--";
    drawGrid();
  });

  // Touch support for smartboards & mobile
  canvas.addEventListener("touchstart", (e) => {
    if (e.touches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;
      const touchY = e.touches[0].clientY - rect.top;

      if (!canvas._cellRects) return;
      for (const cell of canvas._cellRects) {
        if (touchX >= cell.x && touchX <= cell.x + cell.size &&
            touchY >= cell.y && touchY <= cell.y + cell.size) {
          hoveredCell = { r: cell.r, c: cell.c, phenoName: cell.pheno.name };
          const totalCells = crossMode === "monohybrid" ? 4 : 16;
          const count = canvas._cellRects.filter(c => c.pheno.name === cell.pheno.name).length;
          const pct = ((count / totalCells) * 100).toFixed(1);

          const hudGeno = document.getElementById("hud-genotype");
          const hudPheno = document.getElementById("hud-phenotype");
          const hudProb = document.getElementById("hud-probability");
          if (hudGeno) hudGeno.innerText = cell.combo;
          if (hudPheno) {
            hudPheno.innerText = cell.pheno.name;
            hudPheno.style.color = cell.pheno.color;
          }
          if (hudProb) {
            hudProb.innerHTML = `<strong class="hud-count-val">${count}/${totalCells}</strong> (${pct}%)`;
          }
          drawGrid();
          break;
        }
      }
    }
  }, { passive: true });

  // Event Listeners for UI
  crossModeSelect.addEventListener("change", (e) => {
    crossMode = e.target.value;
    const modeDisp = document.getElementById("cross-mode-display");
    if (modeDisp) {
      modeDisp.innerText = crossMode === "monohybrid" ? "Monohybrid (2×2) Cross" : "Dihybrid (4×4) Cross";
    }
    const lawBadge = document.getElementById("law-badge");
    if (lawBadge) {
      lawBadge.innerText = crossMode === "monohybrid" ? "Law of Segregation" : "Independent Assortment";
    }

    populateGenotypeSelects();
    simulatedResults = null;
    handleResize();
  });

  function updateMacroSpecimenCard() {
    const imgEl = document.getElementById("macro-specimen-img");
    const overlayEl = document.getElementById("macro-specimen-overlay");
    const labelEl = document.getElementById("specimen-label");
    if (!imgEl || !overlayEl) return;

    if (currentTrait === "flower_color") {
      imgEl.src = "assets/genetics/pea_flowers.jpg";
      overlayEl.innerHTML = "Pisum sativum Corolla: Purple Dominant (P) vs White Recessive (p) Petals";
      if (labelEl) labelEl.innerText = "Pisum sativum (Blossoms)";
    } else {
      imgEl.src = "assets/genetics/pea_seeds.jpg";
      overlayEl.innerHTML = "Mendel's F2 Seed Generation: Round (R) vs Wrinkled (r) &amp; Yellow (Y) vs Green (y)";
      if (labelEl) labelEl.innerText = "Pisum sativum (Seeds)";
    }
  }

  traitSelect.addEventListener("change", (e) => {
    currentTrait = e.target.value;
    const traitPill = document.getElementById("hud-trait-pill");
    if (traitPill) {
      traitPill.innerText = currentTrait === "pea_shape" ? "Pea Shape (R/r)" :
                            currentTrait === "pea_color" ? "Seed Color (Y/y)" : "Flower Color (P/p)";
    }
    updateMacroSpecimenCard();
    populateGenotypeSelects();
    simulatedResults = null;
    handleResize();
  });

  p1Select.addEventListener("change", (e) => {
    p1Geno = e.target.value;
    simulatedResults = null;
    drawGrid();
    updateTheoreticalAnalysis();
  });

  p2Select.addEventListener("change", (e) => {
    p2Geno = e.target.value;
    simulatedResults = null;
    drawGrid();
    updateTheoreticalAnalysis();
  });

  trialsSelect.addEventListener("change", (e) => {
    trialsCount = parseInt(e.target.value, 10);
    const dispEl = document.getElementById("disp-trials-count");
    if (dispEl) dispEl.innerText = trialsCount.toLocaleString();
  });

  btnSimulate.addEventListener("click", () => {
    runMonteCarlo();
  });

  btnResetSim.addEventListener("click", () => {
    simulatedResults = null;
    const chisqEl = document.getElementById("stat-chisq");
    const pvalEl = document.getElementById("stat-pval");
    const verdictEl = document.getElementById("stat-verdict");
    if (chisqEl) chisqEl.innerText = "--";
    if (pvalEl) pvalEl.innerText = "--";
    if (verdictEl) verdictEl.innerText = "Awaiting fertilization sample";
    drawStochasticChart(
      {},
      crossMode === "monohybrid" ? 4 : 16
    );
    updateTheoreticalAnalysis();
  });

  document.querySelectorAll(".btn-preset").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const preset = e.target.closest(".btn-preset").dataset.preset;
      applyPreset(preset);
    });
  });

  // Dynamic High-DPI (Retina) Resize Handler
  function handleResize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const canvasW = rect.width > 0 ? rect.width : 600;
    const canvasH = 540;
    canvas.width = Math.round(canvasW * dpr);
    canvas.height = Math.round(canvasH * dpr);

    if (chartCanvas) {
      const chartRect = chartCanvas.getBoundingClientRect();
      const chartW = chartRect.width > 0 ? chartRect.width : 480;
      const chartH = 150;
      chartCanvas.width = Math.round(chartW * dpr);
      chartCanvas.height = Math.round(chartH * dpr);
    }

    drawGrid();
    updateTheoreticalAnalysis();
  }

  // Setup ResizeObserver for seamless responsiveness
  const canvasArea = container.querySelector(".lab-canvas-area");
  if (canvasArea && window.ResizeObserver) {
    const ro = new ResizeObserver(() => {
      handleResize();
    });
    ro.observe(canvasArea);
  }
  window.addEventListener("resize", handleResize);

  // Initial Setup
  populateGenotypeSelects();
  applyPreset("f1-mono");

  // Telemetry Suite: Record Current State as Trial
  document.getElementById("btn-record-punnett-trial")?.addEventListener("click", () => {
    const traitObj = traits[currentTrait] || {};
    const traitLabel = crossMode === "monohybrid" ? (traitObj.name || "Monohybrid") : "Dihybrid (Shape & Color)";

    LabTrialStore.addTrial("punnett", {
      measurements: {
        "Cross Mode": crossMode.toUpperCase(),
        "Investigated Trait": traitLabel,
        "Parent 1 (Maternal)": p1Geno,
        "Parent 2 (Paternal)": p2Geno,
        "Offspring Sample (N)": simulatedResults ? trialsCount : "Theoretical",
        "Chi-Square (χ²)": simulatedResults ? parseFloat(simulatedResults.chiSq) : "Theoretical Match",
        "Null Hypothesis": simulatedResults ? (simulatedResults.passesMendel ? "Accepted (p > 0.05)" : "Rejected (p < 0.05)") : "Expected 1:1 / 3:1"
      }
    });

    const trials = LabTrialStore.getTrials("punnett");
    trials.forEach((tr, i) => {
      const pill = document.getElementById(`punnett-pill-trial-${i + 1}`);
      if (pill) {
        pill.style.opacity = "1";
        pill.innerText = `Cross ${tr.trialNumber}: ${tr.measurements["Parent 1 (Maternal)"]} × ${tr.measurements["Parent 2 (Paternal)"]} (${tr.measurements["Cross Mode"]}, N=${tr.measurements["Offspring Sample (N)"]})`;
      }
    });
  });

  // Telemetry Suite: Export CSV
  document.getElementById("btn-export-punnett-csv")?.addEventListener("click", () => {
    const traitObj = traits[currentTrait] || {};
    const traitLabel = crossMode === "monohybrid" ? (traitObj.name || "Monohybrid") : "Dihybrid (Shape & Color)";
    const headers = ["Phenotypic Class", "Theoretical Expected (E)", "Monte Carlo Observed (O)", "Deviation (O - E)", "(O - E)^2 / E"];
    const rows = [];

    if (simulatedResults && simulatedResults.theoretical) {
      Object.keys(simulatedResults.theoretical).forEach(pheno => {
        const E = simulatedResults.theoretical[pheno];
        const O = simulatedResults.empirical[pheno] || 0;
        const dev = O - E;
        const term = E > 0 ? (Math.pow(dev, 2) / E) : 0;
        rows.push([pheno, parseFloat(E.toFixed(1)), O, parseFloat(dev.toFixed(1)), parseFloat(term.toFixed(3))]);
      });
    } else {
      rows.push(["Theoretical Cross", "Awaiting Simulation", "Run Monte-Carlo", "0", "0"]);
    }

    exportLabDataCsv({
      title: "Mendelian Genetics & Stochastic Chi-Square Goodness-of-Fit",
      labId: "punnett",
      parameters: {
        "Cross Architecture": crossMode.toUpperCase(),
        "Inherited Trait": traitLabel,
        "Parent 1 (♀)": p1Geno,
        "Parent 2 (♂)": p2Geno,
        "Monte Carlo Sample Size": simulatedResults ? `${trialsCount} Offspring` : "Theoretical Only"
      },
      headers,
      dataRows: rows
    });
  });

  // Telemetry Suite: Generate Lab Report
  document.getElementById("btn-open-punnett-report")?.addEventListener("click", () => {
    const trials = LabTrialStore.getTrials("punnett");
    const traitObj = traits[currentTrait] || {};
    const traitLabel = crossMode === "monohybrid" ? (traitObj.name || "Monohybrid") : "Dihybrid (Shape & Color)";

    openLabReportModal({
      title: "Mendelian Genetics, Meiotic Allelic Segregation & Chi-Square Analysis",
      subject: "Biology",
      inquiryQuestion: "How do Mendel's Laws of Segregation and Independent Assortment govern phenotypic ratios in monohybrid and dihybrid crosses?",
      parameters: {
        "Cross Mode": crossMode.toUpperCase(),
        "Investigated Trait": traitLabel,
        "Maternal Genotype (♀)": p1Geno,
        "Paternal Genotype (♂)": p2Geno,
        "Fertilization Sample Size": simulatedResults ? `${trialsCount} Seedlings` : "Theoretical Ratio Model",
        "Chi-Square Goodness-of-Fit": simulatedResults ? `${simulatedResults.chiSq} (df=${simulatedResults.df})` : "Exact Mendelian Ratios"
      },
      trials,
      formulas: [
        "\\chi^2 = \\sum \\frac{(O - E)^2}{E} \\quad (\\text{Chi-Square Goodness of Fit})",
        "P(A \\cap B) = P(A) \\times P(B) \\quad (\\text{Multiplication Rule})",
        "\\text{Monohybrid F2} \\to 3:1 \\text{ (Phenotypic)}, \\quad 1:2:1 \\text{ (Genotypic)}",
        "\\text{Dihybrid F2} \\to 9:3:3:1 \\quad (\\text{Independent Assortment})"
      ]
    });
  });

  // Mount Post-Lab Checkpoint Assessment
  mountLabCheckpoint("punnett-checkpoint-container", "punnett");

  setTimeout(handleResize, 50);
}
