// Edugates-ClipSAT Science Labs - Chemistry: Precipitation & Solubility Rules Suite
// 60 FPS Precision Analytical Chemistry Simulation:
// Dynamic ionic equilibrium Q vs Ksp, Net Ionic Equations,
// Solubility product constants (Ksp), dynamic precipitation cloud nucleation,
// Centrifugation & sediment settling, thermal recrystallization (Golden Rain effect).

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initPrecipitationLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return () => {};

  // Analytical Reagents & Solubility Rules Matrix
  const CATIONS = {
    silver: { name: "Silver Nitrate [Ag⁺]", symbol: "Ag⁺", charge: 1, baseColor: "rgba(255, 255, 255, 0.05)" },
    lead: { name: "Lead(II) Nitrate [Pb²⁺]", symbol: "Pb²⁺", charge: 2, baseColor: "rgba(255, 255, 255, 0.05)" },
    barium: { name: "Barium Chloride [Ba²⁺]", symbol: "Ba²⁺", charge: 2, baseColor: "rgba(255, 255, 255, 0.05)" },
    copper: { name: "Copper(II) Sulfate [Cu²⁺]", symbol: "Cu²⁺", charge: 2, baseColor: "rgba(56, 189, 248, 0.35)" },
    iron: { name: "Iron(III) Chloride [Fe³⁺]", symbol: "Fe³⁺", charge: 3, baseColor: "rgba(245, 158, 11, 0.35)" },
    calcium: { name: "Calcium Nitrate [Ca²⁺]", symbol: "Ca²⁺", charge: 2, baseColor: "rgba(255, 255, 255, 0.05)" }
  };

  const ANIONS = {
    chloride: { name: "Sodium Chloride [Cl⁻]", symbol: "Cl⁻", charge: 1 },
    iodide: { name: "Potassium Iodide [I⁻]", symbol: "I⁻", charge: 1 },
    sulfate: { name: "Sodium Sulfate [SO₄²⁻]", symbol: "SO₄²⁻", charge: 2 },
    hydroxide: { name: "Sodium Hydroxide [OH⁻]", symbol: "OH⁻", charge: 1 },
    carbonate: { name: "Sodium Carbonate [CO₃²⁻]", symbol: "CO₃²⁻", charge: 2 },
    sulfide: { name: "Sodium Sulfide [S²⁻]", symbol: "S²⁻", charge: 2 }
  };

  // Precipitation Reactions Database (Pairings, Ksp, color, formula, net ionic equation)
  const REACTIONS = {
    "silver-chloride": {
      precipitate: true,
      formula: "AgCl",
      name: "Silver Chloride",
      ksp: 1.77e-10,
      color: "#f8fafc", // Curdy white
      sedimentColor: "#e2e8f0",
      description: "Dense, curdy white precipitate. Photolytic sensitive (slowly greys in UV light). Insoluble in dilute HNO₃.",
      netIonic: "Ag⁺(aq) + Cl⁻(aq) ⟶ AgCl(s)↓"
    },
    "silver-iodide": {
      precipitate: true,
      formula: "AgI",
      name: "Silver Iodide",
      ksp: 8.52e-17,
      color: "#fef08a", // Pale Primrose Yellow
      sedimentColor: "#fde047",
      description: "Extremely insoluble pale primrose yellow precipitate. Does not dissolve in dilute ammonia.",
      netIonic: "Ag⁺(aq) + I⁻(aq) ⟶ AgI(s)↓"
    },
    "silver-carbonate": {
      precipitate: true,
      formula: "Ag₂CO₃",
      name: "Silver Carbonate",
      ksp: 8.46e-12,
      color: "#facc15", // Pale Yellowish Tan
      sedimentColor: "#eab308",
      description: "Pale yellowish-white precipitate that dissolves readily in dilute acids.",
      netIonic: "2Ag⁺(aq) + CO₃²⁻(aq) ⟶ Ag₂CO₃(s)↓"
    },
    "silver-sulfide": {
      precipitate: true,
      formula: "Ag₂S",
      name: "Silver Sulfide",
      ksp: 6.0e-51,
      color: "#1e293b", // Pitch Black tarnish
      sedimentColor: "#0f172a",
      description: "Jet-black insoluble sulfide precipitate (the classic chemical compound responsible for silver tarnish).",
      netIonic: "2Ag⁺(aq) + S²⁻(aq) ⟶ Ag₂S(s)↓"
    },
    "lead-iodide": {
      precipitate: true,
      formula: "PbI₂",
      name: "Lead(II) Iodide",
      ksp: 9.8e-9,
      color: "#fbbf24", // Brilliant Golden Yellow ("Golden Rain")
      sedimentColor: "#f59e0b",
      description: "Brilliant golden yellow crystalline precipitate. Dissolves upon boiling; upon slow cooling forms sparkling golden hexagonal platelets ('Golden Rain').",
      netIonic: "Pb²⁺(aq) + 2I⁻(aq) ⟶ PbI₂(s)↓",
      isGoldenRain: true
    },
    "lead-chloride": {
      precipitate: true,
      formula: "PbCl₂",
      name: "Lead(II) Chloride",
      ksp: 1.7e-5,
      color: "#f1f5f9", // White needle crystals
      sedimentColor: "#cbd5e1",
      description: "White crystalline precipitate, moderately soluble in hot boiling water.",
      netIonic: "Pb²⁺(aq) + 2Cl⁻(aq) ⟶ PbCl₂(s)↓"
    },
    "lead-sulfate": {
      precipitate: true,
      formula: "PbSO₄",
      name: "Lead(II) Sulfate",
      ksp: 2.53e-8,
      color: "#f8fafc",
      sedimentColor: "#e2e8f0",
      description: "Dense, heavy white precipitate.",
      netIonic: "Pb²⁺(aq) + SO₄²⁻(aq) ⟶ PbSO₄(s)↓"
    },
    "lead-hydroxide": {
      precipitate: true,
      formula: "Pb(OH)₂",
      name: "Lead(II) Hydroxide",
      ksp: 1.43e-20,
      color: "#f8fafc",
      sedimentColor: "#e2e8f0",
      description: "White gelatinous precipitate. Amphoteric: dissolves in excess hydroxide to form plumbite ions.",
      netIonic: "Pb²⁺(aq) + 2OH⁻(aq) ⟶ Pb(OH)₂(s)↓"
    },
    "barium-sulfate": {
      precipitate: true,
      formula: "BaSO₄",
      name: "Barium Sulfate",
      ksp: 1.08e-10,
      color: "#ffffff",
      sedimentColor: "#f1f5f9",
      description: "Extremely fine, dense milky white precipitate. Completely insoluble in concentrated hydrochloric or nitric acids.",
      netIonic: "Ba²⁺(aq) + SO₄²⁻(aq) ⟶ BaSO₄(s)↓"
    },
    "barium-carbonate": {
      precipitate: true,
      formula: "BaCO₃",
      name: "Barium Carbonate",
      ksp: 2.58e-9,
      color: "#f8fafc",
      sedimentColor: "#e2e8f0",
      description: "White precipitate. Dissolves vigorously in acids with effervescence of CO₂ gas.",
      netIonic: "Ba²⁺(aq) + CO₃²⁻(aq) ⟶ BaCO₃(s)↓"
    },
    "copper-hydroxide": {
      precipitate: true,
      formula: "Cu(OH)₂",
      name: "Copper(II) Hydroxide",
      ksp: 2.2e-20,
      color: "#06b6d4", // Pale Turquoise Blue
      sedimentColor: "#0891b2",
      description: "Pale turquoise blue flocculent gelatinous precipitate. Dehydrates to black CuO when heated.",
      netIonic: "Cu²⁺(aq) + 2OH⁻(aq) ⟶ Cu(OH)₂(s)↓"
    },
    "copper-carbonate": {
      precipitate: true,
      formula: "CuCO₃",
      name: "Basic Copper Carbonate",
      ksp: 1.4e-10,
      color: "#10b981", // Malachite Green
      sedimentColor: "#059669",
      description: "Malachite green precipitate.",
      netIonic: "Cu²⁺(aq) + CO₃²⁻(aq) ⟶ CuCO₃(s)↓"
    },
    "iron-hydroxide": {
      precipitate: true,
      formula: "Fe(OH)₃",
      name: "Iron(III) Hydroxide",
      ksp: 2.79e-39,
      color: "#b45309", // Rust Red-Brown
      sedimentColor: "#92400e",
      description: "Distinctive rust reddish-brown gelatinous precipitate.",
      netIonic: "Fe³⁺(aq) + 3OH⁻(aq) ⟶ Fe(OH)₃(s)↓"
    },
    "calcium-carbonate": {
      precipitate: true,
      formula: "CaCO₃",
      name: "Calcium Carbonate",
      ksp: 3.36e-9,
      color: "#ffffff",
      sedimentColor: "#f1f5f9",
      description: "Chalky white precipitate forming turbidity (limewater test for CO₂).",
      netIonic: "Ca²⁺(aq) + CO₃²⁻(aq) ⟶ CaCO₃(s)↓"
    },
    "calcium-sulfate": {
      precipitate: true,
      formula: "CaSO₄",
      name: "Calcium Sulfate",
      ksp: 4.93e-5,
      color: "#f8fafc",
      sedimentColor: "#e2e8f0",
      description: "White crystalline precipitate (sparingly soluble gypsum).",
      netIonic: "Ca²⁺(aq) + SO₄²⁻(aq) ⟶ CaSO₄(s)↓"
    }
  };

  // State Variables
  let currentCationKey = "lead";
  let currentAnionKey = "iodide";
  let cationConc = 0.05; // M
  let anionConc = 0.05; // M
  let solutionTempC = 25; // °C
  let turbidityProgress = 0; // 0.0 (clear) to 1.0 (fully precipitated)
  let sedimentLevel = 0; // 0.0 to 1.0 (settled at bottom)
  let isCentrifuging = false;
  let viewMode = "sim"; // "sim" or "photo"
  let animId = null;
  let timeTick = 0;

  // Particle cloud system for precipitate simulation
  const particles = [];
  function initPrecipitateParticles(color, count = 80) {
    particles.length = 0;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: 252 + Math.random() * 76,
        y: 195 + Math.random() * 165,
        vx: (Math.random() - 0.5) * 0.8,
        vy: 0.15 + Math.random() * 0.45,
        radius: 1.5 + Math.random() * 2.5,
        color: color,
        sparkle: Math.random() > 0.5
      });
    }
  }

  function getReactionData() {
    const key = `${currentCationKey}-${currentAnionKey}`;
    return REACTIONS[key] || {
      precipitate: false,
      formula: "No Precipitate",
      name: "Soluble Electrolyte Mixture",
      ksp: 1.0,
      color: "transparent",
      sedimentColor: "transparent",
      description: "Both ions remain completely dissociated in aqueous solution (Q < Ksp). No insoluble precipitate forms.",
      netIonic: "All ions remain spectator ions: No Net Reaction."
    };
  }

  function calculateQsp() {
    const rxn = getReactionData();
    if (!rxn.precipitate) return { qsp: 0, ratio: 0, status: "Unsaturated (Soluble)" };

    // Standard ion product Q = [Cation]^m * [Anion]^n
    let qsp = 0;
    if (rxn.formula === "AgCl" || rxn.formula === "AgI") {
      qsp = cationConc * anionConc;
    } else if (rxn.formula === "PbI₂" || rxn.formula === "PbCl₂" || rxn.formula === "Cu(OH)₂" || rxn.formula === "Pb(OH)₂") {
      qsp = cationConc * Math.pow(anionConc, 2);
    } else if (rxn.formula === "BaSO₄" || rxn.formula === "BaCO₃" || rxn.formula === "CaCO₃" || rxn.formula === "CaSO₄" || rxn.formula === "CuCO₃") {
      qsp = cationConc * anionConc;
    } else if (rxn.formula === "Ag₂CO₃" || rxn.formula === "Ag₂S") {
      qsp = Math.pow(cationConc, 2) * anionConc;
    } else if (rxn.formula === "Fe(OH)₃") {
      qsp = cationConc * Math.pow(anionConc, 3);
    } else {
      qsp = cationConc * anionConc;
    }

    // Temperature dependence for Ksp (van 't Hoff approximation)
    // For PbI2, solubility increases drastically from 25C to 90C
    let activeKsp = rxn.ksp;
    if (rxn.isGoldenRain) {
      activeKsp = rxn.ksp * Math.exp(0.065 * (solutionTempC - 25));
    }

    const ratio = qsp / activeKsp;
    let status = "Q < Ksp (Unsaturated)";
    if (ratio >= 1.0) status = "Q > Ksp (Supersaturated — Precipitation)";
    else if (ratio >= 0.9) status = "Q ≈ Ksp (Equilibrium Saturation)";

    return { qsp, activeKsp, ratio, status };
  }

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #38bdf8; box-shadow: 0 0 10px #38bdf8;"></span>
            Precipitation &amp; Solubility Rules Suite
          </span>
          <span class="badge" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            Ion Product Q vs K_{sp} • Net Ionic Precipitation
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-precip-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🧪 Test Tube View
            </button>
            <button id="view-mode-precip-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-precip-mix" style="padding: 5px 14px; font-size: 0.78rem;">
            💧 Dispense &amp; Mix Reagents
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-precip-centrifuge" style="padding: 5px 12px; font-size: 0.78rem;">
            🌀 Centrifuge / Settle
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-precip-export" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export Ksp Dossier
          </button>
        </div>
      </div>

      <!-- Main Layout Grid -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="precip-layout">
        <!-- Canvas Viewport -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(56, 189, 248, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #0f172a 0%, #020617 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="precip-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Real Laboratory Photograph Overlay -->
          <div id="precip-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <img src="assets/labs/precipitation_bench.jpg" alt="4K Research Analytical Chemistry Precipitation Workbench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Glassware Rack</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Borosilicate Culture Tubes</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Volumetric Precision</div>
                <div style="color: #facc15; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">±0.02 mL Micro-Pipettes</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Turbidity Sensor</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Nephelometric Turbidity (NTU)</div>
              </div>
            </div>
          </div>

          <!-- Top HUD -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">EQUILIBRIUM ION PRODUCT (Q)</div>
              <div id="hud-precip-q" style="font-size: 1.12rem; font-weight: 800; color: #38bdf8; font-family: var(--font-mono);">
                Q = 2.50 × 10⁻³
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">SOLUBILITY PRODUCT CONSTANT (Ksp)</div>
              <div id="hud-precip-ksp" style="font-size: 1.12rem; font-weight: 800; color: #fbbf24; font-family: var(--font-mono);">
                Ksp = 9.80 × 10⁻⁹
              </div>
            </div>
          </div>
        </div>

        <!-- Controls & Analytical Chemistry Side -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Controls Panel -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; margin-bottom: 12px;">Solution Reagents &amp; Thermal Control</div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div>
                <label style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Cation Reagent (Test Tube)</label>
                <select id="select-precip-cation" class="form-control" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                  ${Object.entries(CATIONS).map(([k, c]) => `<option value="${k}" ${k === currentCationKey ? "selected" : ""}>${c.name}</option>`).join("")}
                </select>
              </div>

              <div>
                <label style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Anion Reagent (Dropper)</label>
                <select id="select-precip-anion" class="form-control" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                  ${Object.entries(ANIONS).map(([k, a]) => `<option value="${k}" ${k === currentAnionKey ? "selected" : ""}>${a.name}</option>`).join("")}
                </select>
              </div>
            </div>

            <!-- Concentrations -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                  <span style="color: #94a3b8;">[Cation] Conc</span>
                  <span id="lbl-cation-conc" style="color: #38bdf8; font-weight: 700;">0.050 M</span>
                </div>
                <input id="slider-cation-conc" type="range" min="0.005" max="0.200" step="0.005" value="0.05" style="width: 100%; accent-color: #38bdf8;">
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                  <span style="color: #94a3b8;">[Anion] Conc</span>
                  <span id="lbl-anion-conc" style="color: #fbbf24; font-weight: 700;">0.050 M</span>
                </div>
                <input id="slider-anion-conc" type="range" min="0.005" max="0.200" step="0.005" value="0.05" style="width: 100%; accent-color: #fbbf24;">
              </div>
            </div>

            <!-- Temperature Slider -->
            <div style="margin-bottom: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                <span style="color: #94a3b8;">Water Bath Temperature</span>
                <span id="lbl-precip-temp" style="color: #10b981; font-weight: 700;">25.0 °C (Room Temp)</span>
              </div>
              <input id="slider-precip-temp" type="range" min="10" max="95" step="1" value="25" style="width: 100%; accent-color: #10b981;">
              <div style="display: flex; justify-content: space-between; font-size: 0.68rem; color: #64748b; margin-top: 2px;">
                <span>10°C (Chilled Ice Bath)</span>
                <span>95°C (Boiling Water Bath)</span>
              </div>
            </div>
          </div>

          <!-- Analytical Telemetry Card -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div style="font-size: 0.75rem; font-weight: 700; color: #10b981; text-transform: uppercase;">Net Ionic Precipitation Reaction</div>
              <span id="precip-status-badge" class="badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; font-size: 0.68rem; padding: 2px 8px; border-radius: 6px;">
                Precipitation Predicted
              </span>
            </div>
            
            <div style="background: #030712; border: 1px solid #1e293b; border-radius: 8px; padding: 12px;">
              <div id="txt-net-ionic" style="font-family: var(--font-mono); font-size: 0.92rem; font-weight: 700; color: #38bdf8; text-align: center; margin-bottom: 6px;">
                Pb²⁺(aq) + 2I⁻(aq) ⟶ PbI₂(s)↓
              </div>
              <div id="txt-rxn-desc" style="font-size: 0.78rem; color: #94a3b8; line-height: 1.4; text-align: center;">
                Brilliant golden yellow crystalline precipitate. Dissolves upon boiling; upon slow cooling forms sparkling golden hexagonal platelets.
              </div>
            </div>

            <!-- Q vs Ksp Comparison Bar -->
            <div style="margin-top: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.74rem; margin-bottom: 4px;">
                <span style="color: #94a3b8;">Thermodynamic Driving Force: log₁₀(Q / Ksp)</span>
                <span id="lbl-driving-force" style="color: #38bdf8; font-weight: 700;">+5.41 (Supersaturated)</span>
              </div>
              <div style="height: 10px; background: #0f172a; border-radius: 5px; overflow: hidden; border: 1px solid #334155; position: relative;">
                <div id="bar-driving-force" style="height: 100%; width: 85%; background: linear-gradient(90deg, #3b82f6, #10b981, #f59e0b); border-radius: 4px; transition: width 0.3s ease;"></div>
              </div>
            </div>
          </div>

          <!-- Post-Lab Checkpoint Container -->
          <div id="precip-checkpoint-container"></div>
        </div>
      </div>
    </div>
  `;

  // Attach Checkpoint
  mountLabCheckpoint("precip-checkpoint-container", "precipitation");

  // DOM Elements
  const canvas = document.getElementById("precip-canvas");
  const ctx = canvas.getContext("2d");

  const viewSimBtn = document.getElementById("view-mode-precip-sim");
  const viewPhotoBtn = document.getElementById("view-mode-precip-photo");
  const photoOverlay = document.getElementById("precip-photo-overlay");

  const btnMix = document.getElementById("btn-precip-mix");
  const btnCentrifuge = document.getElementById("btn-precip-centrifuge");
  const btnExport = document.getElementById("btn-precip-export");

  const selectCation = document.getElementById("select-precip-cation");
  const selectAnion = document.getElementById("select-precip-anion");
  const sliderCation = document.getElementById("slider-cation-conc");
  const sliderAnion = document.getElementById("slider-anion-conc");
  const sliderTemp = document.getElementById("slider-precip-temp");

  const lblCation = document.getElementById("lbl-cation-conc");
  const lblAnion = document.getElementById("lbl-anion-conc");
  const lblTemp = document.getElementById("lbl-precip-temp");

  const hudQ = document.getElementById("hud-precip-q");
  const hudKsp = document.getElementById("hud-precip-ksp");
  const txtNetIonic = document.getElementById("txt-net-ionic");
  const txtRxnDesc = document.getElementById("txt-rxn-desc");
  const statusBadge = document.getElementById("precip-status-badge");
  const lblDriving = document.getElementById("lbl-driving-force");
  const barDriving = document.getElementById("bar-driving-force");

  // Dropper animation state
  let isDropping = false;
  let dropY = 120;

  function updateHUD() {
    const rxn = getReactionData();
    const { qsp, activeKsp, ratio, status } = calculateQsp();

    hudQ.textContent = `Q = ${qsp > 0 ? qsp.toExponential(2) : "0.00"}`;
    hudKsp.textContent = `Ksp = ${rxn.precipitate ? activeKsp.toExponential(2) : "N/A"}`;

    txtNetIonic.textContent = rxn.netIonic;
    txtRxnDesc.textContent = rxn.description;

    if (rxn.precipitate && ratio >= 1.0) {
      statusBadge.textContent = "Precipitate Forms (Q > Ksp)";
      statusBadge.style.background = "rgba(16, 185, 129, 0.15)";
      statusBadge.style.color = "#10b981";

      const logRatio = Math.min(10, Math.max(0, Math.log10(Math.max(1, ratio))));
      lblDriving.textContent = `+${logRatio.toFixed(2)} (Supersaturated)`;
      barDriving.style.width = `${Math.min(100, (logRatio / 10) * 100)}%`;
      barDriving.style.background = "linear-gradient(90deg, #38bdf8, #10b981)";
    } else {
      statusBadge.textContent = "Clear / Soluble Solution";
      statusBadge.style.background = "rgba(245, 158, 11, 0.15)";
      statusBadge.style.color = "#fbbf24";
      lblDriving.textContent = "Unsaturated (No precipitate)";
      barDriving.style.width = "10%";
      barDriving.style.background = "#64748b";
    }
  }

  // Canvas 60 FPS Render Loop
  function renderPrecipCanvas() {
    if (!container || !container.isConnected) return;
    timeTick += 0.03;
    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);

    const rxn = getReactionData();
    const { ratio } = calculateQsp();
    const willPrecipitate = rxn.precipitate && ratio >= 1.0;

    // Handle Centrifugation settling
    if (isCentrifuging) {
      if (sedimentLevel < 0.9) sedimentLevel += 0.015;
      if (turbidityProgress > 0.15) turbidityProgress -= 0.015;
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

    // 2. Test Tube Rack
    const rackX = cw * 0.5 - 120;
    const rackW = 240;
    ctx.fillStyle = "#334155";
    ctx.fillRect(rackX, benchY - 80, rackW, 14); // Upper shelf
    ctx.fillRect(rackX, benchY - 10, rackW, 14); // Lower base
    ctx.fillRect(rackX + 10, benchY - 80, 16, 70); // Left pillar
    ctx.fillRect(rackX + rackW - 26, benchY - 80, 16, 70); // Right pillar

    // 3. Central Test Tube
    const tubeX = cw * 0.5;
    const tubeTopY = 130;
    const tubeH = 290;
    const tubeW = 60;
    const tubeBottomY = tubeTopY + tubeH;
    const meniscusY = tubeTopY + 110;

    // Fluid inside test tube
    const cation = CATIONS[currentCationKey];
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(tubeX - tubeW / 2 + 3, meniscusY);
    ctx.lineTo(tubeX - tubeW / 2 + 3, tubeBottomY - tubeW / 2);
    ctx.arc(tubeX, tubeBottomY - tubeW / 2, tubeW / 2 - 3, Math.PI, 0, true);
    ctx.lineTo(tubeX + tubeW / 2 - 3, meniscusY);
    ctx.closePath();

    // Base solution color
    ctx.fillStyle = cation.baseColor;
    ctx.fill();

    // Dynamic Precipitate Cloud (Turbidity)
    if (willPrecipitate && turbidityProgress > 0.05) {
      const cloudGrad = ctx.createRadialGradient(tubeX, meniscusY + 80, 10, tubeX, meniscusY + 80, 75);
      cloudGrad.addColorStop(0, rxn.color);
      cloudGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = cloudGrad;
      ctx.globalAlpha = turbidityProgress * 0.85;
      ctx.fill();

      // Golden Rain Sparkling Platelets / Settling Particles
      particles.forEach(p => {
        p.y += p.vy * (isCentrifuging ? 3.0 : 1.0);
        p.x += Math.sin(timeTick * 4 + p.y * 0.1) * 0.4;
        const minTx = tubeX - tubeW / 2 + 7 + p.radius;
        const maxTx = tubeX + tubeW / 2 - 7 - p.radius;
        if (p.x < minTx) p.x = minTx;
        if (p.x > maxTx) p.x = maxTx;
        if (p.y > tubeBottomY - 15) {
          p.y = meniscusY + 10;
          p.x = tubeX - 20 + Math.random() * 40;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.sparkle && rxn.isGoldenRain ? "#ffffff" : rxn.color;
        ctx.globalAlpha = turbidityProgress * (p.sparkle ? 0.95 : 0.7);
        ctx.fill();
      });
    }

    // Settled Sediment Layer at Bottom
    if (willPrecipitate && sedimentLevel > 0.05) {
      const sedH = 30 * sedimentLevel;
      ctx.beginPath();
      ctx.moveTo(tubeX - tubeW / 2 + 4, tubeBottomY - sedH);
      ctx.arc(tubeX, tubeBottomY - tubeW / 2, tubeW / 2 - 4, Math.PI * 0.8, Math.PI * 0.2, true);
      ctx.closePath();
      ctx.fillStyle = rxn.sedimentColor;
      ctx.globalAlpha = 0.95;
      ctx.fill();
    }
    ctx.restore();

    // Glass Tube Walls & Highlights
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    // Outturned lip
    ctx.ellipse(tubeX, tubeTopY, tubeW / 2 + 5, 6, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Tube cylindrical body & hemispherical bottom
    ctx.beginPath();
    ctx.moveTo(tubeX - tubeW / 2, tubeTopY);
    ctx.lineTo(tubeX - tubeW / 2, tubeBottomY - tubeW / 2);
    ctx.arc(tubeX, tubeBottomY - tubeW / 2, tubeW / 2, Math.PI, 0, true);
    ctx.lineTo(tubeX + tubeW / 2, tubeTopY);
    ctx.stroke();

    // Glass specular reflection stripe
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(tubeX - tubeW / 2 + 7, tubeTopY + 15);
    ctx.lineTo(tubeX - tubeW / 2 + 7, tubeBottomY - tubeW / 2);
    ctx.stroke();
    ctx.restore();

    // 4. Pipette Dropper Animation
    const dropperX = tubeX;
    const dropperY = 30;
    ctx.save();
    // Rubber bulb
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(dropperX, dropperY + 12, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#991b1b";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Glass pipette stem
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(dropperX - 5, dropperY + 26);
    ctx.lineTo(dropperX - 3, dropperY + 70);
    ctx.lineTo(dropperX - 1.5, dropperY + 85);
    ctx.lineTo(dropperX + 1.5, dropperY + 85);
    ctx.lineTo(dropperX + 3, dropperY + 70);
    ctx.lineTo(dropperX + 5, dropperY + 26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Reagent fluid inside pipette tip
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(dropperX - 2, dropperY + 50, 4, 34);

    // Falling Drop Animation
    if (isDropping) {
      dropY += 8;
      ctx.beginPath();
      ctx.arc(dropperX, dropY, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#38bdf8";
      ctx.fill();

      if (dropY >= meniscusY) {
        isDropping = false;
        dropY = dropperY + 86;
        if (willPrecipitate) {
          turbidityProgress = Math.min(1.0, turbidityProgress + 0.35);
          initPrecipitateParticles(rxn.color, 70);
        }
      }
    }
    ctx.restore();

    animId = requestAnimationFrame(renderPrecipCanvas);
  }

  // Event Listeners
  selectCation.addEventListener("change", (e) => {
    currentCationKey = e.target.value;
    turbidityProgress = 0;
    sedimentLevel = 0;
    isCentrifuging = false;
    SoundFX.droplet();
    updateHUD();
  });

  selectAnion.addEventListener("change", (e) => {
    currentAnionKey = e.target.value;
    turbidityProgress = 0;
    sedimentLevel = 0;
    isCentrifuging = false;
    SoundFX.droplet();
    updateHUD();
  });

  sliderCation.addEventListener("input", (e) => {
    cationConc = parseFloat(e.target.value);
    lblCation.textContent = `${cationConc.toFixed(3)} M`;
    updateHUD();
  });

  sliderAnion.addEventListener("input", (e) => {
    anionConc = parseFloat(e.target.value);
    lblAnion.textContent = `${anionConc.toFixed(3)} M`;
    updateHUD();
  });

  sliderTemp.addEventListener("input", (e) => {
    solutionTempC = parseFloat(e.target.value);
    lblTemp.textContent = `${solutionTempC.toFixed(1)} °C`;
    
    // Golden Rain dynamic dissolution / recrystallization
    const rxn = getReactionData();
    if (rxn.isGoldenRain && turbidityProgress > 0) {
      if (solutionTempC > 75) {
        // High temp: dissolves precipitate
        turbidityProgress = Math.max(0.05, 1.0 - (solutionTempC - 75) / 20);
      } else {
        // Cools: sparkling recrystallization
        turbidityProgress = 1.0;
      }
    }
    updateHUD();
  });

  btnMix.addEventListener("click", () => {
    isDropping = true;
    dropY = 115;
    isCentrifuging = false;
    SoundFX.droplet();
    setTimeout(() => {
      const rxn = getReactionData();
      const { ratio } = calculateQsp();
      if (rxn.precipitate && ratio >= 1.0) {
        SoundFX.snap();
      }
    }, 200);
  });

  btnCentrifuge.addEventListener("click", () => {
    isCentrifuging = true;
    SoundFX.success();
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
    const rxn = getReactionData();
    const { qsp, activeKsp, ratio, status } = calculateQsp();

    exportLabDataCsv({
      title: "Precipitation & Solubility Rules Analytical Lab",
      labId: "precipitation",
      parameters: {
        "Cation Reagent": CATIONS[currentCationKey].name,
        "Anion Reagent": ANIONS[currentAnionKey].name,
        "Cation Molarity": `${cationConc.toFixed(4)} M`,
        "Anion Molarity": `${anionConc.toFixed(4)} M`,
        "Temperature": `${solutionTempC} °C`,
        "Precipitate Formula": rxn.formula,
        "Solubility Product Ksp": activeKsp.toExponential(4),
        "Reaction Quotient Q": qsp.toExponential(4),
        "Thermodynamic Status": status
      },
      headers: ["Property", "Value", "Unit"],
      dataRows: [
        ["Net Ionic Equation", rxn.netIonic, "Reaction"],
        ["Precipitate Name", rxn.name, "Nomenclature"],
        ["Color & Morphology", rxn.description, "Observation"],
        ["Solubility Product Constant Ksp", activeKsp.toExponential(4), "Constant"],
        ["Ion Product Quotient Q", qsp.toExponential(4), "Activity Quotient"],
        ["log10(Q / Ksp)", (Math.log10(Math.max(1e-30, ratio))).toFixed(3), "Dimensionless Driving Force"]
      ]
    });
    SoundFX.success();
  });

  // Start Animation Loop
  updateHUD();
  animId = requestAnimationFrame(renderPrecipCanvas);

  return function cleanupPrecipitationLab() {
    if (animId) cancelAnimationFrame(animId);
  };
}
