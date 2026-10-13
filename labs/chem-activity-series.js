// Edugates-ClipSAT Science Labs - Chemistry: Metal Activity Series & Single Displacement Redox Suite
// 60 FPS Precision Electrochemical Redox Simulation:
// Standard Reduction Potentials E°, Galvanic EMF ΔE°cell = E°cat - E°an > 0,
// Spontaneous single-displacement crystal plating (dendrite growth),
// Acid effervescence hydrogen gas evolution (2H⁺ + 2e⁻ → H₂↑),
// High-impedance digital electrometer voltage telemetry.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initActivitySeriesLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return () => {};

  // Standard Reduction Potentials E° (V vs SHE at 25°C)
  const METALS = {
    magnesium: {
      name: "Magnesium (Mg)",
      symbol: "Mg",
      e0: -2.37, // V
      stripColor: "#cbd5e1",
      platedColor: "#94a3b8",
      activityRank: 1,
      description: "Highly active alkaline earth metal. Vigorously displaces hydrogen gas from acids and reduces all lower metals."
    },
    zinc: {
      name: "Zinc (Zn)",
      symbol: "Zn",
      e0: -0.76, // V
      stripColor: "#94a3b8",
      platedColor: "#64748b",
      activityRank: 2,
      description: "Active transition metal. Readily displaces Fe, Cu, Ag and acids."
    },
    iron: {
      name: "Iron (Fe)",
      symbol: "Fe",
      e0: -0.44, // V
      stripColor: "#64748b",
      platedColor: "#475569",
      activityRank: 3,
      description: "Moderately active metal. Displaces Cu and Ag, slowly reacts with acids."
    },
    copper: {
      name: "Copper (Cu)",
      symbol: "Cu",
      e0: +0.34, // V
      stripColor: "#ea580c",
      platedColor: "#c2410c",
      activityRank: 4,
      description: "Noble transition metal with positive E°. Does not react with non-oxidizing acids. Readily reduces Ag⁺ ions."
    },
    silver: {
      name: "Silver (Ag)",
      symbol: "Ag",
      e0: +0.80, // V
      stripColor: "#f1f5f9",
      platedColor: "#e2e8f0",
      activityRank: 5,
      description: "Unreactive noble precious metal. Highly resistant to oxidation."
    }
  };

  const SOLUTIONS = {
    hcl: {
      name: "0.50 M Hydrochloric Acid (HCl)",
      ion: "H⁺",
      ionE0: 0.00,
      color: "rgba(255, 255, 255, 0.05)",
      isAcid: true,
      description: "Protons (H⁺) act as electron acceptors. Generates H₂ gas effervescence with active metals."
    },
    copper_sulfate: {
      name: "0.50 M Copper(II) Sulfate (CuSO₄)",
      ion: "Cu²⁺",
      ionE0: +0.34,
      color: "rgba(56, 189, 248, 0.4)",
      isAcid: false,
      productColor: "#b45309", // Red-brown copper deposit
      description: "Bright blue aqueous Cu²⁺ ions. Displaced by Mg, Zn, Fe to plate metallic reddish-brown copper."
    },
    silver_nitrate: {
      name: "0.50 M Silver Nitrate (AgNO₃)",
      ion: "Ag⁺",
      ionE0: +0.80,
      color: "rgba(255, 255, 255, 0.05)",
      isAcid: false,
      productColor: "#f8fafc", // Lustrous silver crystals
      description: "Clear aqueous Ag⁺ ions. Displaced by Mg, Zn, Fe, Cu to grow glistening dendritic silver crystals."
    },
    iron_sulfate: {
      name: "0.50 M Iron(II) Sulfate (FeSO₄)",
      ion: "Fe²⁺",
      ionE0: -0.44,
      color: "rgba(16, 185, 129, 0.2)", // Pale green
      isAcid: false,
      productColor: "#475569",
      description: "Pale green aqueous Fe²⁺ ions. Displaced only by more active Mg and Zn."
    },
    zinc_nitrate: {
      name: "0.50 M Zinc Nitrate (Zn(NO₃)₂)",
      ion: "Zn²⁺",
      ionE0: -0.76,
      color: "rgba(255, 255, 255, 0.05)",
      isAcid: false,
      productColor: "#94a3b8",
      description: "Colorless aqueous Zn²⁺ ions. Displaced only by more active magnesium."
    },
    magnesium_nitrate: {
      name: "0.50 M Magnesium Nitrate (Mg(NO₃)₂)",
      ion: "Mg²⁺",
      ionE0: -2.37,
      color: "rgba(255, 255, 255, 0.05)",
      isAcid: false,
      productColor: "#cbd5e1",
      description: "Colorless aqueous Mg²⁺ ions. Extremely stable; no test metal can displace magnesium."
    }
  };

  // State Variables
  let currentMetalKey = "zinc";
  let currentSolutionKey = "copper_sulfate";
  let immersionDepth = 0.75; // 0.0 (retracted) to 1.0 (fully submerged)
  let reactionProgress = 0; // 0.0 to 1.0 (crystal growth / oxidation)
  let isSubmerged = false;
  let viewMode = "sim"; // "sim" or "photo"
  let animId = null;
  let timeTick = 0;

  // Effervescence bubbles, dendrite crystals, and meniscus ripples
  const bubbles = [];
  const dendrites = [];
  const ripples = [];

  function initDendrites() {
    dendrites.length = 0;
    for (let i = 0; i < 55; i++) {
      const subBranches = [];
      const branchCount = 2 + Math.floor(Math.random() * 4);
      for (let b = 0; b < branchCount; b++) {
        subBranches.push({
          pos: 0.3 + Math.random() * 0.55,
          side: Math.random() > 0.5 ? 1 : -1,
          angle: (Math.random() - 0.5) * 0.9 + (Math.random() > 0.5 ? 0.45 : -0.45),
          lenRatio: 0.3 + Math.random() * 0.45
        });
      }
      dendrites.push({
        y: 220 + Math.random() * 135,
        side: Math.random() > 0.5 ? 1 : -1,
        length: 8 + Math.random() * 22,
        angle: (Math.random() - 0.5) * 0.85,
        subBranches,
        sparklePhase: Math.random() * Math.PI * 2,
        sparkleSpeed: 2 + Math.random() * 3
      });
    }
  }

  function calculateRedox() {
    const metal = METALS[currentMetalKey];
    const solution = SOLUTIONS[currentSolutionKey];

    // ΔE° = E°(reduction / cathode) - E°(oxidation / anode)
    // Solution cation gets reduced: E°red = solution.ionE0
    // Solid metal gets oxidized: E°ox = metal.e0
    const deltaE0 = solution.ionE0 - metal.e0;
    const isSpontaneous = deltaE0 > 0.001;

    let oxidationHalf = `${metal.symbol}(s) ⟶ ${metal.symbol}²⁺(aq) + 2e⁻`;
    if (metal.symbol === "Ag") oxidationHalf = `Ag(s) ⟶ Ag⁺(aq) + e⁻`;

    let reductionHalf = `${solution.ion} + 2e⁻ ⟶ ${solution.ion.replace(/[⁺²]/g, "")}(s)`;
    if (solution.isAcid) reductionHalf = `2H⁺(aq) + 2e⁻ ⟶ H₂(g)↑`;
    else if (solution.ion === "Ag⁺") reductionHalf = `Ag⁺(aq) + e⁻ ⟶ Ag(s)↓`;

    return {
      deltaE0,
      isSpontaneous,
      oxidationHalf,
      reductionHalf,
      status: isSpontaneous ? "Spontaneous Single Displacement (ΔE° > 0)" : "No Reaction / Non-Spontaneous (ΔE° ≤ 0)"
    };
  }

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #f59e0b; box-shadow: 0 0 10px #f59e0b;"></span>
            Metal Activity Series &amp; Single Displacement Suite
          </span>
          <span class="badge" style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); color: #fbbf24; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            ${renderLatex("\\text{Standard EMF } \\Delta E^\\circ = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}} > 0")}
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-activity-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              ⚡ Redox Reactor
            </button>
            <button id="view-mode-activity-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-activity-submerge" style="padding: 5px 14px; font-size: 0.78rem;">
            ⬇ Submerge Metal Strip
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-activity-polish" style="padding: 5px 12px; font-size: 0.78rem;">
            ✨ Polish / Fresh Strip
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-activity-export" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export CSV (E)
          </button>
        </div>
      </div>

      <!-- Main Layout Grid -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="activity-layout">
        <!-- Canvas Viewport -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(245, 158, 11, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #172554 0%, #020617 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="activity-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Real Laboratory Photograph Overlay -->
          <div id="activity-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <picture>
              <source srcset="assets/labs/activity_series_bench.webp" type="image/webp">
              <img src="assets/labs/activity_series_bench.jpg" decoding="async" loading="lazy" alt="4K Research Metal Activity Series Electrochemistry Workbench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            </picture>
            
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Electrode Material</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">High Purity Metal Ribbon</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Electrometer Impedance</div>
                <div style="color: #fbbf24; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">10 GΩ Input (Zero Draw)</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Redox Temperature</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">298.15 K (Standard State)</div>
              </div>
            </div>
          </div>

          <!-- Top HUD -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">STANDARD CELL POTENTIAL (ΔE°)</div>
              <div id="hud-activity-emf" style="font-size: 1.12rem; font-weight: 800; color: #fbbf24; font-family: var(--font-mono);">
                ΔE° = +1.10 V (Spontaneous)
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">REDOX SPONTANEITY STATUS</div>
              <div id="hud-activity-status" style="font-size: 1.12rem; font-weight: 800; color: #38bdf8; font-family: var(--font-mono);">
                Plating Active • ΔG° &lt; 0
              </div>
            </div>
          </div>
        </div>

        <!-- Controls & Electrochemistry Analytics Side -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Controls Panel -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #fbbf24; text-transform: uppercase; margin-bottom: 12px;">Metal Strip &amp; Electrolyte Solution</div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div>
                <label style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Solid Metal Strip (Anode Candidate)</label>
                <select id="select-activity-metal" class="form-control" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                  ${Object.entries(METALS).map(([k, m]) => `<option value="${k}" ${k === currentMetalKey ? "selected" : ""}>${m.name} [E° = ${m.e0 > 0 ? "+" : ""}${m.e0.toFixed(2)}V]</option>`).join("")}
                </select>
              </div>

              <div>
                <label style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Electrolyte Solution (Cathode Candidate)</label>
                <select id="select-activity-solution" class="form-control" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                  ${Object.entries(SOLUTIONS).map(([k, s]) => `<option value="${k}" ${k === currentSolutionKey ? "selected" : ""}>${s.name}</option>`).join("")}
                </select>
              </div>
            </div>

            <!-- Immersion Slider -->
            <div style="margin-bottom: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                <span style="color: #94a3b8;">Strip Submersion Depth</span>
                <span id="lbl-immersion" style="color: #38bdf8; font-weight: 700;">75% Submerged</span>
              </div>
              <input id="slider-immersion" type="range" min="10" max="95" step="5" value="75" style="width: 100%; accent-color: #38bdf8;">
            </div>
          </div>

          <!-- Half-Reactions & Thermodynamic Driving Force -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; margin-bottom: 10px;">Redox Half-Reactions &amp; Net Equation</div>
            
            <div style="background: #030712; border: 1px solid #1e293b; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 6px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem;">
                <span style="color: #ef4444; font-weight: 700;">Oxidation (Anode):</span>
                <span id="txt-ox-half" style="color: #f8fafc; font-family: var(--font-mono);">Zn(s) ⟶ Zn²⁺(aq) + 2e⁻</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem;">
                <span style="color: #3b82f6; font-weight: 700;">Reduction (Cathode):</span>
                <span id="txt-red-half" style="color: #f8fafc; font-family: var(--font-mono);">Cu²⁺(aq) + 2e⁻ ⟶ Cu(s)↓</span>
              </div>
              <hr style="border: 0; border-top: 1px dashed #334155; margin: 4px 0;">
              <div style="display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 700;">
                <span style="color: #10b981;">Net Displacement:</span>
                <span id="txt-net-equation" style="color: #10b981; font-family: var(--font-mono);">Zn + Cu²⁺ ⟶ Zn²⁺ + Cu↓</span>
              </div>
            </div>

            <!-- Activity Series Ranking Hierarchy Strip -->
            <div style="margin-top: 14px;">
              <div style="font-size: 0.72rem; color: #94a3b8; margin-bottom: 6px; text-transform: uppercase;">Activity Series Hierarchy (Most Reactive ⟶ Least Reactive)</div>
              <div style="display: flex; gap: 6px; font-size: 0.72rem; font-family: var(--font-mono); text-align: center;">
                <span style="flex: 1; padding: 4px; background: rgba(56, 189, 248, 0.2); border: 1px solid #0284c7; border-radius: 4px; color: #38bdf8;">Mg</span>
                <span style="color: #64748b; align-self: center;">&gt;</span>
                <span style="flex: 1; padding: 4px; background: rgba(56, 189, 248, 0.2); border: 1px solid #0284c7; border-radius: 4px; color: #38bdf8;">Zn</span>
                <span style="color: #64748b; align-self: center;">&gt;</span>
                <span style="flex: 1; padding: 4px; background: rgba(56, 189, 248, 0.2); border: 1px solid #0284c7; border-radius: 4px; color: #38bdf8;">Fe</span>
                <span style="color: #64748b; align-self: center;">&gt;</span>
                <span style="flex: 1; padding: 4px; background: rgba(234, 88, 12, 0.2); border: 1px solid #ea580c; border-radius: 4px; color: #fb923c;">Cu</span>
                <span style="color: #64748b; align-self: center;">&gt;</span>
                <span style="flex: 1; padding: 4px; background: rgba(241, 245, 249, 0.1); border: 1px solid #cbd5e1; border-radius: 4px; color: #f1f5f9;">Ag</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Post-Lab Checkpoint Container (Full Screen Width) -->
      <div id="activity-checkpoint-container" style="margin-top: 24px; width: 100%;"></div>
    </div>
  `;

  // Attach Checkpoint
  mountLabCheckpoint("activity-checkpoint-container", "activityseries");

  // DOM Elements
  const canvas = document.getElementById("activity-canvas");
  const ctx = canvas.getContext("2d");

  const logicalW = 580;
  const logicalH = 530;

  function setupHiDPICanvas() {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const w = rect.width > 0 ? rect.width : logicalW;
    const h = rect.height > 0 ? rect.height : logicalH;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }

  setupHiDPICanvas();
  window.addEventListener("resize", setupHiDPICanvas);

  const viewSimBtn = document.getElementById("view-mode-activity-sim");
  const viewPhotoBtn = document.getElementById("view-mode-activity-photo");
  const photoOverlay = document.getElementById("activity-photo-overlay");

  const btnSubmerge = document.getElementById("btn-activity-submerge");
  const btnPolish = document.getElementById("btn-activity-polish");
  const btnExport = document.getElementById("btn-activity-export");

  const selectMetal = document.getElementById("select-activity-metal");
  const selectSolution = document.getElementById("select-activity-solution");
  const sliderImmersion = document.getElementById("slider-immersion");
  const lblImmersion = document.getElementById("lbl-immersion");

  const hudEmf = document.getElementById("hud-activity-emf");
  const hudStatus = document.getElementById("hud-activity-status");
  const txtOxHalf = document.getElementById("txt-ox-half");
  const txtRedHalf = document.getElementById("txt-red-half");
  const txtNet = document.getElementById("txt-net-equation");

  // Target and current strip Y coordinate
  let stripY = 80;
  let targetStripY = 80;

  function updateHUD() {
    const { deltaE0, isSpontaneous, oxidationHalf, reductionHalf } = calculateRedox();
    const metal = METALS[currentMetalKey];
    const solution = SOLUTIONS[currentSolutionKey];

    hudEmf.textContent = `ΔE° = ${deltaE0 > 0 ? "+" : ""}${deltaE0.toFixed(2)} V (${isSpontaneous ? "Spontaneous" : "Non-Spontaneous"})`;
    hudEmf.style.color = isSpontaneous ? "#10b981" : "#ef4444";

    if (isSpontaneous && isSubmerged) {
      hudStatus.textContent = solution.isAcid ? "H₂ Gas Effervescence Active" : "Crystal Plating Active (ΔG° < 0)";
      hudStatus.style.color = "#38bdf8";
    } else if (isSpontaneous) {
      hudStatus.textContent = "Ready: Submerge Strip into Solution";
      hudStatus.style.color = "#fbbf24";
    } else {
      hudStatus.textContent = "No Reaction (Metal Less Active)";
      hudStatus.style.color = "#94a3b8";
    }

    txtOxHalf.textContent = oxidationHalf;
    txtRedHalf.textContent = reductionHalf;

    if (isSpontaneous) {
      txtNet.textContent = `${metal.symbol} + ${solution.ion} ⟶ ${metal.symbol}²⁺ + ${solution.isAcid ? "H₂↑" : solution.ion.replace(/[⁺²]/g, "") + "↓"}`;
      txtNet.style.color = "#10b981";
    } else {
      txtNet.textContent = "No Spontaneous Displacement Occurs";
      txtNet.style.color = "#ef4444";
    }
  }

  // 60 FPS Precision Canvas Render Loop
  function renderActivityCanvas() {
    if (!container || !container.isConnected) return;
    timeTick += 0.035;

    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const w = rect.width > 0 ? rect.width : logicalW;
    const h = rect.height > 0 ? rect.height : logicalH;

    ctx.save();
    ctx.resetTransform();
    ctx.scale(dpr * (w / logicalW), dpr * (h / logicalH));
    ctx.clearRect(0, 0, logicalW, logicalH);

    // Smooth strip vertical motion
    stripY += (targetStripY - stripY) * 0.12;

    const { deltaE0, isSpontaneous } = calculateRedox();
    const metal = METALS[currentMetalKey];
    const solution = SOLUTIONS[currentSolutionKey];

    // Grow reaction progress if submerged & spontaneous
    if (isSubmerged && isSpontaneous && reactionProgress < 1.0) {
      reactionProgress += 0.0016;
    }

    // Geometry layout constants
    const benchY = 430;
    const beakerX = 350;
    const beakerBottomY = benchY;
    const beakerW = 210;
    const beakerH = 230;
    const beakerTopY = beakerBottomY - beakerH;
    const liquidMeniscusY = beakerTopY + 70;

    // 1. Lab Workbench & Surface Reflections
    const benchGrad = ctx.createLinearGradient(0, benchY, 0, logicalH);
    benchGrad.addColorStop(0, "#1e293b");
    benchGrad.addColorStop(0.04, "#0f172a");
    benchGrad.addColorStop(1, "#020617");
    ctx.fillStyle = benchGrad;
    ctx.fillRect(0, benchY, logicalW, logicalH - benchY);

    // Top specular chamfer / bevel on bench
    ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, benchY);
    ctx.lineTo(logicalW, benchY);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, benchY + 2);
    ctx.lineTo(logicalW, benchY + 2);
    ctx.stroke();

    // Solution Caustic Glow on Bench
    ctx.save();
    const causticGrad = ctx.createRadialGradient(beakerX, benchY + 5, 8, beakerX, benchY + 12, 105);
    if (currentSolutionKey === "copper_sulfate") {
      causticGrad.addColorStop(0, "rgba(56, 189, 248, 0.45)");
      causticGrad.addColorStop(0.5, "rgba(14, 165, 233, 0.18)");
      causticGrad.addColorStop(1, "rgba(14, 165, 233, 0)");
    } else if (currentSolutionKey === "iron_sulfate") {
      causticGrad.addColorStop(0, "rgba(16, 185, 129, 0.35)");
      causticGrad.addColorStop(0.5, "rgba(5, 150, 105, 0.12)");
      causticGrad.addColorStop(1, "rgba(5, 150, 105, 0)");
    } else {
      causticGrad.addColorStop(0, "rgba(224, 242, 254, 0.22)");
      causticGrad.addColorStop(0.5, "rgba(186, 230, 253, 0.06)");
      causticGrad.addColorStop(1, "rgba(186, 230, 253, 0)");
    }
    ctx.fillStyle = causticGrad;
    ctx.fillRect(beakerX - 110, benchY, 220, 24);

    // Beaker Base Contact Shadow
    const shadowGrad = ctx.createRadialGradient(beakerX, beakerBottomY, 30, beakerX, beakerBottomY, 115);
    shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.65)");
    shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = shadowGrad;
    ctx.fillRect(beakerX - 115, beakerBottomY - 4, 230, 16);
    ctx.restore();

    // 2. Liquid Solution inside Beaker
    ctx.save();
    // Solution body gradient
    const solGrad = ctx.createLinearGradient(0, liquidMeniscusY, 0, beakerBottomY);
    if (currentSolutionKey === "copper_sulfate") {
      solGrad.addColorStop(0, "rgba(56, 189, 248, 0.4)");
      solGrad.addColorStop(0.65, "rgba(14, 165, 233, 0.6)");
      solGrad.addColorStop(1, "rgba(2, 132, 199, 0.75)");
    } else if (currentSolutionKey === "iron_sulfate") {
      solGrad.addColorStop(0, "rgba(52, 211, 153, 0.22)");
      solGrad.addColorStop(0.65, "rgba(16, 185, 129, 0.38)");
      solGrad.addColorStop(1, "rgba(5, 150, 105, 0.52)");
    } else {
      solGrad.addColorStop(0, "rgba(241, 245, 249, 0.08)");
      solGrad.addColorStop(0.65, "rgba(226, 232, 240, 0.14)");
      solGrad.addColorStop(1, "rgba(203, 213, 225, 0.22)");
    }

    ctx.fillStyle = solGrad;
    ctx.beginPath();
    ctx.moveTo(beakerX - beakerW / 2 + 5, liquidMeniscusY);
    ctx.lineTo(beakerX + beakerW / 2 - 5, liquidMeniscusY);
    ctx.lineTo(beakerX + beakerW / 2 - 5, beakerBottomY - 8);
    ctx.arcTo(beakerX + beakerW / 2 - 5, beakerBottomY - 4, beakerX + beakerW / 2 - 14, beakerBottomY - 4, 10);
    ctx.lineTo(beakerX - beakerW / 2 + 14, beakerBottomY - 4);
    ctx.arcTo(beakerX - beakerW / 2 + 5, beakerBottomY - 4, beakerX - beakerW / 2 + 5, beakerBottomY - 8, 10);
    ctx.closePath();
    ctx.fill();

    // Internal meniscus background ellipse
    ctx.fillStyle = currentSolutionKey === "copper_sulfate" ? "rgba(14, 165, 233, 0.35)" : (currentSolutionKey === "iron_sulfate" ? "rgba(16, 185, 129, 0.22)" : "rgba(255, 255, 255, 0.08)");
    ctx.beginPath();
    ctx.ellipse(beakerX, liquidMeniscusY, beakerW / 2 - 7, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Solid Metal Strip (Anode)
    const stripW = 34;
    const stripH = 220;
    const stripX = beakerX - stripW / 2 - 15;

    ctx.save();
    // Metal Strip Texture & Chamfer
    const stripGrad = ctx.createLinearGradient(stripX, 0, stripX + stripW, 0);
    stripGrad.addColorStop(0, metal.stripColor);
    stripGrad.addColorStop(0.2, "#ffffff");
    stripGrad.addColorStop(0.55, metal.stripColor);
    stripGrad.addColorStop(0.85, metal.platedColor);
    stripGrad.addColorStop(1, "#334155");

    ctx.fillStyle = stripGrad;
    ctx.fillRect(stripX, stripY, stripW, stripH);

    // Micro brushed texture lines on the metal surface
    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.lineWidth = 1;
    for (let gy = stripY + 6; gy < stripY + stripH - 4; gy += 14) {
      ctx.beginPath();
      ctx.moveTo(stripX + 2, gy);
      ctx.lineTo(stripX + stripW - 2, gy + (Math.sin(gy * 0.1) * 2));
      ctx.stroke();
    }

    // Bevel edges of metal strip
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(stripX, stripY);
    ctx.lineTo(stripX, stripY + stripH);
    ctx.stroke();

    ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
    ctx.beginPath();
    ctx.moveTo(stripX + stripW, stripY);
    ctx.lineTo(stripX + stripW, stripY + stripH);
    ctx.stroke();

    // Submerged portion refraction shimmer
    const subTop = Math.max(stripY, liquidMeniscusY);
    const subBottom = Math.min(stripY + stripH, beakerBottomY - 6);

    if (subBottom > subTop) {
      ctx.fillStyle = currentSolutionKey === "copper_sulfate" ? "rgba(14, 165, 233, 0.18)" : "rgba(255, 255, 255, 0.08)";
      ctx.fillRect(stripX, subTop, stripW, subBottom - subTop);
    }

    // Spontaneous Plating & Dendrite Branching Crystals
    if (isSpontaneous && reactionProgress > 0.03 && subBottom > subTop) {
      // Base plating deposit layer
      const platingColor = solution.isAcid ? "rgba(255,255,255,0.22)" : (solution.productColor || "#ea580c");
      ctx.fillStyle = platingColor;
      ctx.globalAlpha = Math.min(0.92, reactionProgress * 1.4);
      ctx.fillRect(stripX - 2, subTop, stripW + 4, subBottom - subTop);

      // Micro-texture stippling on deposit
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      for (let sy = subTop + 4; sy < subBottom - 4; sy += 7) {
        ctx.fillRect(stripX + 4 + (sy % 19), sy, 3, 2);
      }

      // Branching fractal dendrite needle crystals (Diana's tree for Ag, nodular needles for Cu)
      if (!solution.isAcid) {
        dendrites.forEach((d) => {
          if (d.y >= subTop + 8 && d.y <= subBottom - 6) {
            const startX = d.side === 1 ? stripX + stripW : stripX;
            const curLen = d.length * Math.min(1, reactionProgress * 1.6);
            const endX = startX + d.side * (curLen * Math.cos(d.angle));
            const endY = d.y + curLen * Math.sin(d.angle);

            // Primary needle trunk
            ctx.strokeStyle = solution.productColor || "#f8fafc";
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(startX, d.y);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            // Secondary fractal sub-branches
            if (reactionProgress > 0.35 && d.subBranches) {
              ctx.lineWidth = 1.1;
              d.subBranches.forEach(sb => {
                const bx = startX + (endX - startX) * sb.pos;
                const by = d.y + (endY - d.y) * sb.pos;
                const sbLen = curLen * sb.lenRatio;
                const sbEndX = bx + d.side * sb.side * sbLen * Math.cos(sb.angle);
                const sbEndY = by + sbLen * Math.sin(sb.angle);
                ctx.beginPath();
                ctx.moveTo(bx, by);
                ctx.lineTo(sbEndX, sbEndY);
                ctx.stroke();
              });
            }

            // Glistening specular glints on silver crystals (Diana's tree)
            if (currentSolutionKey === "silver_nitrate" && reactionProgress > 0.2) {
              const glint = Math.sin(timeTick * d.sparkleSpeed + d.sparklePhase);
              if (glint > 0.6) {
                const glintAlpha = (glint - 0.6) / 0.4;
                ctx.save();
                ctx.fillStyle = `rgba(255, 255, 255, ${glintAlpha.toFixed(2)})`;
                ctx.shadowColor = "#ffffff";
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.arc(endX, endY, 2, 0, Math.PI * 2);
                ctx.fill();

                // 4-point starlet sparkle
                ctx.strokeStyle = `rgba(255, 255, 255, ${(glintAlpha * 0.8).toFixed(2)})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(endX - 4, endY);
                ctx.lineTo(endX + 4, endY);
                ctx.moveTo(endX, endY - 4);
                ctx.lineTo(endX, endY + 4);
                ctx.stroke();
                ctx.restore();
              }
            }
          }
        });
      }
    }
    ctx.restore();

    // 4. Acid Reaction Effervescence (H2 Gas Bubble Streams)
    if (isSubmerged && isSpontaneous && solution.isAcid) {
      if (Math.random() > 0.2) {
        bubbles.push({
          x: stripX + 3 + Math.random() * (stripW - 6),
          y: Math.min(stripY + stripH - 10, beakerBottomY - 12),
          vy: 1.6 + Math.random() * 2.6,
          radius: 1.2 + Math.random() * 2.4,
          phase: Math.random() * Math.PI * 2
        });
      }

      ctx.save();
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.y -= b.vy;
        b.x += Math.sin(timeTick * 4 + b.phase + b.y * 0.08) * 0.7;

        // Slight bubble expansion as hydrostatic pressure decreases
        const curR = b.radius * (1 + (beakerBottomY - b.y) / 400);

        // Bubble sphere with refractive gradient
        const bGrad = ctx.createRadialGradient(b.x - curR * 0.35, b.y - curR * 0.35, 0.4, b.x, b.y, curR);
        bGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
        bGrad.addColorStop(0.6, "rgba(224, 242, 254, 0.5)");
        bGrad.addColorStop(1, "rgba(186, 230, 253, 0.2)");

        ctx.fillStyle = bGrad;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(b.x, b.y, curR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Popping at meniscus
        if (b.y <= liquidMeniscusY) {
          ripples.push({ x: b.x, y: liquidMeniscusY, r: 1.5, maxR: 7 + Math.random() * 6, alpha: 0.7 });
          bubbles.splice(i, 1);
        }
      }

      // Render surface capillary ripples from burst bubbles
      for (let r = ripples.length - 1; r >= 0; r--) {
        const rip = ripples[r];
        rip.r += 0.55;
        rip.alpha *= 0.91;
        ctx.strokeStyle = `rgba(255, 255, 255, ${rip.alpha.toFixed(2)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(rip.x, rip.y, rip.r, rip.r * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();

        if (rip.alpha < 0.04 || rip.r > rip.maxR) {
          ripples.splice(r, 1);
        }
      }
      ctx.restore();
    }

    // 5. Reference Electrode (Cathode Probe in Solution)
    const refProbeX = beakerX + 65;
    const refProbeY = liquidMeniscusY + 60;
    ctx.save();
    // Glass sheath of reference electrode
    const refSheathGrad = ctx.createLinearGradient(refProbeX - 4, 0, refProbeX + 4, 0);
    refSheathGrad.addColorStop(0, "rgba(255, 255, 255, 0.3)");
    refSheathGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.8)");
    refSheathGrad.addColorStop(1, "rgba(100, 116, 139, 0.4)");
    ctx.fillStyle = refSheathGrad;
    ctx.fillRect(refProbeX - 4, 140, 8, refProbeY - 140);

    // Porous ceramic junction tip
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(refProbeX - 3.5, refProbeY, 7, 12);
    ctx.strokeStyle = "#d97706";
    ctx.lineWidth = 1;
    ctx.strokeRect(refProbeX - 3.5, refProbeY, 7, 12);

    // Reference electrode top cap
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(refProbeX - 6, 132, 12, 10);
    ctx.strokeStyle = "#475569";
    ctx.strokeRect(refProbeX - 6, 132, 12, 10);
    ctx.restore();

    // 6. High-Precision Griffin Borosilicate Beaker (Glass Optics)
    ctx.save();
    // Spout at top-left
    ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    // Spout lip
    ctx.moveTo(beakerX - beakerW / 2 - 14, beakerTopY - 4);
    ctx.quadraticCurveTo(beakerX - beakerW / 2 - 6, beakerTopY, beakerX - beakerW / 2, beakerTopY);
    // Left outer wall
    ctx.lineTo(beakerX - beakerW / 2, beakerBottomY - 12);
    ctx.arcTo(beakerX - beakerW / 2, beakerBottomY, beakerX - beakerW / 2 + 14, beakerBottomY, 12);
    // Beaker bottom
    ctx.lineTo(beakerX + beakerW / 2 - 14, beakerBottomY);
    ctx.arcTo(beakerX + beakerW / 2, beakerBottomY, beakerX + beakerW / 2, beakerBottomY - 12, 12);
    // Right outer wall
    ctx.lineTo(beakerX + beakerW / 2, beakerTopY);
    // Top rim lip
    ctx.arcTo(beakerX + beakerW / 2 + 4, beakerTopY, beakerX + beakerW / 2 + 4, beakerTopY + 4, 3);
    ctx.stroke();

    // Inner heavy glass base line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(beakerX - beakerW / 2 + 6, beakerBottomY - 6);
    ctx.lineTo(beakerX + beakerW / 2 - 6, beakerBottomY - 6);
    ctx.stroke();

    // Cylinder specular reflection down left wall
    const leftSpec = ctx.createLinearGradient(beakerX - beakerW / 2 + 8, 0, beakerX - beakerW / 2 + 24, 0);
    leftSpec.addColorStop(0, "rgba(255, 255, 255, 0.35)");
    leftSpec.addColorStop(0.5, "rgba(255, 255, 255, 0.15)");
    leftSpec.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = leftSpec;
    ctx.fillRect(beakerX - beakerW / 2 + 8, beakerTopY + 10, 16, beakerH - 20);

    // Cylinder reflection down right wall
    const rightSpec = ctx.createLinearGradient(beakerX + beakerW / 2 - 20, 0, beakerX + beakerW / 2 - 6, 0);
    rightSpec.addColorStop(0, "rgba(255, 255, 255, 0)");
    rightSpec.addColorStop(1, "rgba(255, 255, 255, 0.25)");
    ctx.fillStyle = rightSpec;
    ctx.fillRect(beakerX + beakerW / 2 - 20, beakerTopY + 10, 14, beakerH - 20);

    // Front liquid meniscus curved rim highlight
    ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(beakerX, liquidMeniscusY, beakerW / 2 - 7, 7, 0, 0, Math.PI);
    ctx.stroke();

    // Ceramic white enamel graduations (50, 100, 150, 200, 250 mL)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.font = "8px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    const graduations = [
      { yOffset: 35, ml: "50" },
      { yOffset: 70, ml: "100" },
      { yOffset: 105, ml: "150" },
      { yOffset: 140, ml: "200" },
      { yOffset: 175, ml: "250" }
    ];
    graduations.forEach((g) => {
      const markY = beakerBottomY - g.yOffset;
      // Main graduation line
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(beakerX - beakerW / 2 + 6, markY);
      ctx.lineTo(beakerX - beakerW / 2 + 30, markY);
      ctx.stroke();
      ctx.fillText(`${g.ml} mL`, beakerX - beakerW / 2 + 35, markY + 3);

      // Intermediate 25 mL tick mark
      if (g.ml !== "250") {
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(beakerX - beakerW / 2 + 6, markY - 17.5);
        ctx.lineTo(beakerX - beakerW / 2 + 18, markY - 17.5);
        ctx.stroke();
      }
    });

    // Beaker Laboratory Branding
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "7.5px 'JetBrains Mono', monospace";
    ctx.fillText("BORO 3.3", beakerX - beakerW / 2 + 35, beakerBottomY - 195);
    ctx.fillText("APPROX. VOL.", beakerX - beakerW / 2 + 35, beakerBottomY - 205);
    ctx.restore();

    // 7. Alligator Clip Clamped to Strip Top
    ctx.save();
    const clipX = stripX + 3;
    const clipY = stripY - 18;
    const clipW = stripW - 6;

    // Steel jaws
    ctx.fillStyle = "#94a3b8";
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.2;
    ctx.fillRect(clipX + 2, stripY - 6, clipW - 4, 8);
    ctx.strokeRect(clipX + 2, stripY - 6, clipW - 4, 8);

    // Grip teeth serrations
    ctx.fillStyle = "#334155";
    for (let t = clipX + 4; t < clipX + clipW - 6; t += 4) {
      ctx.fillRect(t, stripY, 2, 3);
    }

    // Crimson red rubber insulated boot
    const bootGrad = ctx.createLinearGradient(clipX, clipY, clipX + clipW, clipY);
    bootGrad.addColorStop(0, "#b91c1c");
    bootGrad.addColorStop(0.4, "#ef4444");
    bootGrad.addColorStop(1, "#991b1b");
    ctx.fillStyle = bootGrad;
    ctx.strokeStyle = "#7f1d1d";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(clipX, clipY, clipW, 14, [4, 4, 2, 2]);
    ctx.fill();
    ctx.stroke();

    // Pivot rivet
    ctx.fillStyle = "#e2e8f0";
    ctx.beginPath();
    ctx.arc(clipX + clipW / 2, clipY + 7, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 8. Digital Electrometer Voltmeter Display Unit
    ctx.save();
    const meterX = 32;
    const meterY = 160;
    const meterW = 165;
    const meterH = 175;

    // Soft drop shadow under electrometer
    const mShadowGrad = ctx.createRadialGradient(meterX + meterW / 2, meterY + meterH + 4, 20, meterX + meterW / 2, meterY + meterH + 4, 85);
    mShadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.7)");
    mShadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = mShadowGrad;
    ctx.fillRect(meterX - 10, meterY + meterH - 4, meterW + 20, 16);

    // Heavy-duty electrometer chassis with protective bumper corners
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(meterX, meterY, meterW, meterH, 10);
    ctx.fill();
    ctx.stroke();

    // Yellow rubberized corner bumpers
    ctx.fillStyle = "#f59e0b";
    const bSize = 12;
    // Top-left
    ctx.beginPath();
    ctx.roundRect(meterX - 2, meterY - 2, bSize, bSize, [8, 2, 2, 2]);
    ctx.fill();
    // Top-right
    ctx.beginPath();
    ctx.roundRect(meterX + meterW - bSize + 2, meterY - 2, bSize, bSize, [2, 8, 2, 2]);
    ctx.fill();
    // Bottom-left
    ctx.beginPath();
    ctx.roundRect(meterX - 2, meterY + meterH - bSize + 2, bSize, bSize, [2, 2, 2, 8]);
    ctx.fill();
    // Bottom-right
    ctx.beginPath();
    ctx.roundRect(meterX + meterW - bSize + 2, meterY + meterH - bSize + 2, bSize, bSize, [2, 2, 8, 2]);
    ctx.fill();

    // Recessed LCD Bezel
    ctx.fillStyle = "#090d16";
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(meterX + 12, meterY + 14, meterW - 24, 76, 6);
    ctx.fill();
    ctx.stroke();

    // High-contrast backlit LCD screen
    const lcdGrad = ctx.createLinearGradient(0, meterY + 16, 0, meterY + 86);
    lcdGrad.addColorStop(0, "#042f2e");
    lcdGrad.addColorStop(1, "#021d1d");
    ctx.fillStyle = lcdGrad;
    ctx.fillRect(meterX + 14, meterY + 16, meterW - 28, 72);

    // LCD Status Annunciators
    ctx.fillStyle = "rgba(45, 212, 191, 0.75)";
    ctx.font = "bold 7.5px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText("AUTO", meterX + 18, meterY + 28);
    ctx.fillText("HIGH-Z", meterX + 50, meterY + 28);
    ctx.textAlign = "right";
    ctx.fillText("V DC", meterX + meterW - 18, meterY + 28);

    // Primary Digital Readout
    const displayVoltage = isSubmerged ? (deltaE0 > 0 ? `+${deltaE0.toFixed(2)}` : deltaE0.toFixed(2)) : " 0.00";
    ctx.fillStyle = isSubmerged ? (isSpontaneous ? "#38bdf8" : "#f87171") : "#94a3b8";
    ctx.font = "800 24px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.shadowColor = isSubmerged && isSpontaneous ? "rgba(56, 189, 248, 0.45)" : "transparent";
    ctx.shadowBlur = 8;
    ctx.fillText(`${displayVoltage} V`, meterX + meterW / 2, meterY + 58);
    ctx.shadowBlur = 0;

    // Dynamic analog segmented bargraph at bottom of LCD
    const barW = meterW - 36;
    const barX = meterX + 18;
    const barY = meterY + 74;
    ctx.fillStyle = "rgba(15, 23, 42, 0.6)";
    ctx.fillRect(barX, barY, barW, 6);

    const deflection = isSubmerged ? Math.max(-1, Math.min(1, deltaE0 / 3.0)) : 0;
    const zeroX = barX + barW / 2;
    const defW = (barW / 2) * deflection;
    ctx.fillStyle = isSpontaneous ? "#34d399" : "#f87171";
    ctx.fillRect(zeroX, barY + 1, defW, 4);

    // Center zero tick
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(zeroX - 0.5, barY - 1, 1, 8);

    // Electrometer Model & Spec
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "bold 8px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("ELECTROMETER 6517B", meterX + meterW / 2, meterY + 104);
    ctx.fillStyle = "#64748b";
    ctx.font = "7px 'JetBrains Mono', monospace";
    ctx.fillText("INPUT Z > 10 GΩ • 0.01% ACCURACY", meterX + meterW / 2, meterY + 115);

    // Rotary Function Knob
    const knobX = meterX + meterW / 2;
    const knobY = meterY + 138;
    const knobR = 12;
    ctx.fillStyle = "#0f172a";
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(knobX, knobY, knobR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Aluminum knob cap with indicator notch
    ctx.fillStyle = "#334155";
    ctx.beginPath();
    ctx.arc(knobX, knobY, knobR - 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(knobX, knobY - knobR + 3);
    ctx.lineTo(knobX, knobY - 2);
    ctx.stroke();

    // Binding Post Terminals: Red (+) and Black (COM)
    const redPostX = meterX + 32;
    const blackPostX = meterX + meterW - 32;
    const postY = meterY + 144;

    // Red Positive Terminal
    ctx.fillStyle = "#ef4444";
    ctx.strokeStyle = "#991b1b";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(redPostX, postY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 7px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("+", redPostX, postY + 2.5);

    // Black COM Terminal
    ctx.fillStyle = "#0f172a";
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(blackPostX, postY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("-", blackPostX, postY + 2.5);

    ctx.restore();

    // 9. Flexible Silicone Wires (Red Test Lead & Black Reference Lead)
    ctx.save();
    // Red Lead (from Red Terminal to Alligator Clip)
    const redTermX = redPostX;
    const redTermY = postY;
    const clipTermX = clipX + clipW / 2;
    const clipTermY = clipY;

    ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(redTermX, redTermY);
    ctx.bezierCurveTo(redTermX - 40, redTermY - 70, clipTermX - 50, clipTermY - 50, clipTermX, clipTermY);
    ctx.stroke();

    // 3D Red silicone wire core
    ctx.strokeStyle = "#dc2626";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(redTermX, redTermY);
    ctx.bezierCurveTo(redTermX - 40, redTermY - 70, clipTermX - 50, clipTermY - 50, clipTermX, clipTermY);
    ctx.stroke();

    // Specular highlight along wire
    ctx.strokeStyle = "rgba(254, 202, 202, 0.65)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(redTermX, redTermY);
    ctx.bezierCurveTo(redTermX - 40, redTermY - 70, clipTermX - 50, clipTermY - 50, clipTermX, clipTermY);
    ctx.stroke();

    // Black Reference Lead (from COM Terminal to Reference Electrode)
    const blackTermX = blackPostX;
    const blackTermY = postY;
    const refTermX = refProbeX;
    const refTermY = 132;

    ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(blackTermX, blackTermY);
    ctx.bezierCurveTo(blackTermX + 50, blackTermY - 40, refTermX - 30, refTermY + 60, refTermX, refTermY);
    ctx.stroke();

    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(blackTermX, blackTermY);
    ctx.bezierCurveTo(blackTermX + 50, blackTermY - 40, refTermX - 30, refTermY + 60, refTermX, refTermY);
    ctx.stroke();

    ctx.strokeStyle = "rgba(148, 163, 184, 0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(blackTermX, blackTermY);
    ctx.bezierCurveTo(blackTermX + 50, blackTermY - 40, refTermX - 30, refTermY + 60, refTermX, refTermY);
    ctx.stroke();
    ctx.restore();

    animId = requestAnimationFrame(renderActivityCanvas);
  }

  // Event Listeners
  selectMetal.addEventListener("change", (e) => {
    currentMetalKey = e.target.value;
    reactionProgress = 0;
    initDendrites();
    SoundFX.droplet();
    updateHUD();
  });

  selectSolution.addEventListener("change", (e) => {
    currentSolutionKey = e.target.value;
    reactionProgress = 0;
    initDendrites();
    SoundFX.droplet();
    updateHUD();
  });

  sliderImmersion.addEventListener("input", (e) => {
    immersionDepth = parseFloat(e.target.value) / 100;
    lblImmersion.textContent = `${Math.round(immersionDepth * 100)}% Submerged`;
    if (isSubmerged) {
      targetStripY = 80 + immersionDepth * 130;
    }
  });

  btnSubmerge.addEventListener("click", () => {
    isSubmerged = !isSubmerged;
    if (isSubmerged) {
      targetStripY = 80 + immersionDepth * 130;
      btnSubmerge.textContent = "⬆ Retract Metal Strip";
      btnSubmerge.classList.replace("btn-primary", "btn-secondary");
      SoundFX.snap();
    } else {
      targetStripY = 80;
      btnSubmerge.textContent = "⬇ Submerge Metal Strip";
      btnSubmerge.classList.replace("btn-secondary", "btn-primary");
      SoundFX.click();
    }
    updateHUD();
  });

  btnPolish.addEventListener("click", () => {
    reactionProgress = 0;
    initDendrites();
    SoundFX.success();
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
  const handleExportCsv = () => {
    const metal = METALS[currentMetalKey];
    const solution = SOLUTIONS[currentSolutionKey];
    const { deltaE0, isSpontaneous, oxidationHalf, reductionHalf, status } = calculateRedox();

    exportLabDataCsv({
      title: "Metal Activity Series & Single Displacement Lab",
      labId: "activityseries",
      parameters: {
        "Solid Metal Anode": metal.name,
        "Metal Standard E°": `${metal.e0.toFixed(2)} V`,
        "Electrolyte Solution": solution.name,
        "Cation Standard E°": `${solution.ionE0.toFixed(2)} V`,
        "Calculated Cell EMF ΔE°": `${deltaE0.toFixed(2)} V`,
        "Spontaneity (ΔG° < 0)": isSpontaneous ? "Yes" : "No",
        "Reaction Classification": status
      },
      headers: ["Parameter", "Formula / Specification", "Thermodynamic Note"],
      dataRows: [
        ["Oxidation Half-Reaction", oxidationHalf, "Anode Oxidation"],
        ["Reduction Half-Reaction", reductionHalf, "Cathode Reduction"],
        ["Standard Cell Potential ΔE°", `${deltaE0.toFixed(2)} V`, isSpontaneous ? "Spontaneous Galvanic" : "Electrolytic / Non-spontaneous"],
        ["Gibbs Free Energy ΔG°", isSpontaneous ? "-nFΔE° < 0 (Exergonic)" : "> 0 (Endergonic)", "Thermodynamic Criterion"],
        ["Observed Physical Phenomenon", solution.isAcid ? "Effervescence of H₂ gas bubbles" : "Crystal dendrite plating on strip", "Visual Telemetry"]
      ]
    });
    SoundFX.success();
  };
  btnExport.addEventListener("click", handleExportCsv);

  const handleKeyDown = (e) => {
    if (e.key === "e" || e.key === "E") {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;
      e.preventDefault();
      handleExportCsv();
    }
  };
  window.addEventListener("keydown", handleKeyDown);

  // Start Animation Loop
  initDendrites();
  updateHUD();
  animId = requestAnimationFrame(renderActivityCanvas);

  return function cleanupActivitySeriesLab() {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("resize", setupHiDPICanvas);
  };
}
