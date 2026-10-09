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

  // Effervescence bubbles and dendrite crystal growth structures
  const bubbles = [];
  const dendrites = [];

  function initDendrites() {
    dendrites.length = 0;
    for (let i = 0; i < 40; i++) {
      dendrites.push({
        y: 200 + Math.random() * 140,
        side: Math.random() > 0.5 ? 1 : -1,
        length: 2 + Math.random() * 18,
        angle: (Math.random() - 0.5) * 0.8
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
            📥 Export Redox Data
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

          <!-- Post-Lab Checkpoint Container -->
          <div id="activity-checkpoint-container"></div>
        </div>
      </div>
    </div>
  `;

  // Attach Checkpoint
  mountLabCheckpoint("activity-checkpoint-container", "activityseries");

  // DOM Elements
  const canvas = document.getElementById("activity-canvas");
  const ctx = canvas.getContext("2d");

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

  // 60 FPS Canvas Render Loop
  function renderActivityCanvas() {
    if (!container || !container.isConnected) return;
    timeTick += 0.035;
    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);

    // Smooth strip motion
    stripY += (targetStripY - stripY) * 0.12;

    const { deltaE0, isSpontaneous } = calculateRedox();
    const metal = METALS[currentMetalKey];
    const solution = SOLUTIONS[currentSolutionKey];

    // Grow reaction progress if submerged & spontaneous
    if (isSubmerged && isSpontaneous && reactionProgress < 1.0) {
      reactionProgress += 0.0015;
    }

    // 1. Lab Workbench
    const benchY = 440;
    const benchGrad = ctx.createLinearGradient(0, benchY, 0, ch);
    benchGrad.addColorStop(0, "#1e293b");
    benchGrad.addColorStop(1, "#020617");
    ctx.fillStyle = benchGrad;
    ctx.fillRect(0, benchY, cw, ch - benchY);

    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, benchY);
    ctx.lineTo(cw, benchY);
    ctx.stroke();

    // 2. Beaker Apparatus
    const beakerX = cw * 0.5;
    const beakerBottomY = benchY;
    const beakerW = 200;
    const beakerH = 220;
    const beakerTopY = beakerBottomY - beakerH;
    const liquidMeniscusY = beakerTopY + 70;

    // Solution Liquid in Beaker
    ctx.save();
    ctx.fillStyle = solution.color;
    ctx.fillRect(beakerX - beakerW / 2 + 5, liquidMeniscusY, beakerW - 10, beakerBottomY - liquidMeniscusY - 4);
    ctx.restore();

    // 3. Solid Metal Strip
    const stripW = 34;
    const stripH = 220;
    const stripX = beakerX - stripW / 2;

    ctx.save();
    // Strip body
    const stripGrad = ctx.createLinearGradient(stripX, 0, stripX + stripW, 0);
    stripGrad.addColorStop(0, metal.stripColor);
    stripGrad.addColorStop(0.5, "#ffffff");
    stripGrad.addColorStop(1, metal.platedColor);
    ctx.fillStyle = stripGrad;
    ctx.fillRect(stripX, stripY, stripW, stripH);

    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(stripX, stripY, stripW, stripH);

    // Crocodile Clip at Top of Strip
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(stripX + 4, stripY - 14, stripW - 8, 14);
    ctx.strokeStyle = "#991b1b";
    ctx.strokeRect(stripX + 4, stripY - 14, stripW - 8, 14);

    // Wire to Multimeter
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(stripX + stripW / 2, stripY - 14);
    ctx.bezierCurveTo(stripX - 60, stripY - 80, 80, 100, 110, 150);
    ctx.stroke();

    // Spontaneous Plating / Dendrite Crystals on Submerged Portion
    if (isSpontaneous && reactionProgress > 0.05) {
      const subTop = Math.max(stripY, liquidMeniscusY);
      const subBottom = Math.min(stripY + stripH, beakerBottomY - 6);

      if (subBottom > subTop) {
        // Plating coating
        ctx.fillStyle = solution.isAcid ? "rgba(255,255,255,0.2)" : (solution.productColor || "#ea580c");
        ctx.globalAlpha = Math.min(0.9, reactionProgress * 1.5);
        ctx.fillRect(stripX - 2, subTop, stripW + 4, subBottom - subTop);

        // Branching dendrite needle crystals (e.g. silver needles or copper plating)
        if (!solution.isAcid) {
          ctx.strokeStyle = solution.productColor || "#f8fafc";
          ctx.lineWidth = 1.8;
          dendrites.forEach(d => {
            if (d.y >= subTop && d.y <= subBottom) {
              const startX = d.side === 1 ? stripX + stripW : stripX;
              const endX = startX + d.side * (d.length * reactionProgress);
              const endY = d.y + Math.sin(d.angle) * d.length * reactionProgress;

              ctx.beginPath();
              ctx.moveTo(startX, d.y);
              ctx.lineTo(endX, endY);
              ctx.stroke();
            }
          });
        }
      }
    }
    ctx.restore();

    // 4. Acid Reaction Effervescence (H2 gas bubble stream)
    if (isSubmerged && isSpontaneous && solution.isAcid) {
      // Spawn new bubbles
      if (Math.random() > 0.3) {
        bubbles.push({
          x: stripX + Math.random() * stripW,
          y: Math.min(stripY + stripH - 10, beakerBottomY - 10),
          vy: 1.5 + Math.random() * 2.5,
          radius: 1.5 + Math.random() * 3
        });
      }

      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.y -= b.vy;
        b.x += Math.sin(timeTick * 5 + b.y * 0.1) * 0.6;

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (b.y < liquidMeniscusY) {
          bubbles.splice(i, 1);
        }
      }
      ctx.restore();
    }

    // 5. Beaker Glass Outline & Meniscus
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(beakerX - beakerW / 2 - 10, beakerTopY);
    ctx.lineTo(beakerX - beakerW / 2, beakerTopY);
    ctx.lineTo(beakerX - beakerW / 2, beakerBottomY - 8);
    ctx.arcTo(beakerX - beakerW / 2, beakerBottomY, beakerX - beakerW / 2 + 8, beakerBottomY, 8);
    ctx.lineTo(beakerX + beakerW / 2 - 8, beakerBottomY);
    ctx.arcTo(beakerX + beakerW / 2, beakerBottomY, beakerX + beakerW / 2, beakerBottomY - 8, 8);
    ctx.lineTo(beakerX + beakerW / 2, beakerTopY);
    ctx.stroke();

    // Graduated volume lines on beaker
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1.5;
    for (let h = 0; h < 4; h++) {
      const lineY = beakerBottomY - 35 - h * 35;
      ctx.beginPath();
      ctx.moveTo(beakerX - beakerW / 2 + 5, lineY);
      ctx.lineTo(beakerX - beakerW / 2 + 25, lineY);
      ctx.stroke();
    }

    // Liquid Meniscus Ellipse
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(beakerX, liquidMeniscusY, beakerW / 2 - 6, 8, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 6. Digital Electrometer Voltmeter Display Unit
    ctx.save();
    const meterX = 40;
    const meterY = 150;
    const meterW = 140;
    const meterH = 110;

    // Chassis
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(meterX, meterY, meterW, meterH, 8);
    ctx.fill();
    ctx.stroke();

    // LCD Screen
    ctx.fillStyle = "#030712";
    ctx.fillRect(meterX + 12, meterY + 14, meterW - 24, 45);
    ctx.strokeStyle = "#334155";
    ctx.strokeRect(meterX + 12, meterY + 14, meterW - 24, 45);

    // LCD Value
    ctx.fillStyle = isSubmerged ? (isSpontaneous ? "#38bdf8" : "#94a3b8") : "#475569";
    ctx.font = "bold 18px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    const displayVoltage = isSubmerged ? deltaE0.toFixed(2) : "0.00";
    ctx.fillText(`${displayVoltage} V`, meterX + meterW / 2, meterY + 44);

    // Label
    ctx.fillStyle = "#94a3b8";
    ctx.font = "9px Inter, sans-serif";
    ctx.fillText("DIGITAL ELECTROMETER", meterX + meterW / 2, meterY + 76);
    ctx.fillText("HIGH-Z INPUT", meterX + meterW / 2, meterY + 92);
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
  btnExport.addEventListener("click", () => {
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
  });

  // Start Animation Loop
  initDendrites();
  updateHUD();
  animId = requestAnimationFrame(renderActivityCanvas);

  return function cleanupActivitySeriesLab() {
    if (animId) cancelAnimationFrame(animId);
  };
}
