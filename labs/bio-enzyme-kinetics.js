// Edugates-ClipSAT Science Labs - Biology: Enzyme Kinetics & Catalysis Suite
// 60 FPS Biochemical Simulation:
// Michaelis-Menten Kinetics (V_0 vs [S]), Lineweaver-Burk Double Reciprocal Plots (1/V vs 1/[S]),
// Temperature & pH Denaturation Curves, Competitive & Non-Competitive Inhibition, and Active Site Molecular Binding.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initEnzymeLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const ENZYMES = {
    catalase: {
      name: "Catalase (Liver/Potato)",
      substrate: "Hydrogen Peroxide (H₂O₂)",
      products: "2 H₂O + O₂",
      Km_base: 2.5, // mM
      Vmax_base: 85.0, // µmol/(min·mg)
      optTemp: 37,
      optPH: 7.0,
      desc: "Peroxisomal antioxidant enzyme with ultra-high catalytic efficiency (k_cat ~ 4×10⁷ s⁻¹)."
    },
    lactase: {
      name: "Lactase (β-Galactosidase)",
      substrate: "Lactose",
      products: "Glucose + Galactose",
      Km_base: 4.0, // mM
      Vmax_base: 45.0,
      optTemp: 38,
      optPH: 6.0,
      desc: "Intestinal brush border disaccharidase essential for dairy lactose hydrolysis."
    },
    amylase: {
      name: "Salivary Amylase",
      substrate: "Starch (Amylose)",
      products: "Maltose + Dextrins",
      Km_base: 1.8, // mM
      Vmax_base: 60.0,
      optTemp: 37,
      optPH: 6.8,
      desc: "Endoamylase cleaving internal α-(1,4)-glucosidic bonds in dietary carbohydrates."
    }
  };

  // State Variables
  let currentEnzymeKey = "catalase";
  let activeEnzyme = ENZYMES[currentEnzymeKey];
  let substrateConc = 2.5; // mM (0.2 to 10.0 mM)
  let temperature = 37; // °C (10 to 70°C)
  let pH = 7.0; // pH (2.0 to 11.0)
  let inhibitorType = "none"; // 'none', 'competitive', 'noncompetitive'
  let inhibitorConc = 0.0; // mM (0 to 5 mM)
  let plotMode = "mm"; // 'mm' (Michaelis-Menten) or 'lb' (Lineweaver-Burk)
  let animId = null;
  let elapsedSeconds = 0;

  // Visual active site enzyme particles
  const substrateParticles = [];
  for (let i = 0; i < 28; i++) {
    substrateParticles.push({
      x: 100 + Math.random() * 380,
      y: 100 + Math.random() * 300,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      isBound: false
    });
  }

  // Calculate Apparent Km and Vmax
  function getKineticParameters() {
    let Km = activeEnzyme.Km_base;
    let Vmax = activeEnzyme.Vmax_base;

    // Temperature kinetics factor (Arrhenius rise up to optTemp, thermal denaturation above)
    let tempFactor = 1.0;
    if (temperature <= activeEnzyme.optTemp) {
      tempFactor = Math.pow(1.8, (temperature - 20) / 10);
    } else {
      const excess = temperature - activeEnzyme.optTemp;
      tempFactor = Math.max(0, Math.pow(1.8, (activeEnzyme.optTemp - 20) / 10) * Math.exp(-excess * 0.18));
    }

    // pH Bell-shaped ionization curve
    const deltaPH = pH - activeEnzyme.optPH;
    const phFactor = Math.max(0.01, Math.exp(-0.6 * deltaPH * deltaPH));

    Vmax = Vmax * tempFactor * phFactor;

    // Inhibitor adjustments
    if (inhibitorType === "competitive") {
      // Km increases by (1 + [I]/Ki), Vmax unchanged
      Km = Km * (1 + inhibitorConc / 1.2);
    } else if (inhibitorType === "noncompetitive") {
      // Vmax decreases by 1 / (1 + [I]/Ki), Km unchanged
      Vmax = Vmax / (1 + inhibitorConc / 1.2);
    }

    // Initial reaction velocity V_0
    const V0 = (Vmax * substrateConc) / (Km + substrateConc);

    return { Km, Vmax, V0, tempFactor, phFactor };
  }

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #6366f1; box-shadow: 0 0 10px #6366f1;"></span>
            Enzyme Kinetics &amp; Biocatalysis Suite
          </span>
          <span class="badge" style="background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); color: #818cf8; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            V_0 = \\frac{V_{max}[S]}{K_m + [S]} • Michaelis-Menten &amp; Lineweaver-Burk
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-enz-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Active Site Cleft
            </button>
            <button id="view-mode-enz-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Lab Bench
            </button>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-enz-reset" style="padding: 5px 12px; font-size: 0.78rem;">
            ⟲ Reset Assay
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-enz-export" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export Telemetry
          </button>
        </div>
      </div>

      <!-- Main Layout: Active Site Canvas on Left, Kinematic Plots on Right -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="enzyme-layout">
        <!-- Active Site Canvas -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(99, 102, 241, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #100f2e 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="enzyme-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
          <div id="enzyme-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <img src="assets/labs/enzymes_bench.jpg" alt="4K Biochemistry & Enzyme Kinetics Laboratory Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            
            <!-- Live Analytical Telemetry Callout on Photo -->
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">UV-Vis Spectrophotometer</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">A = 0.428 AU • λ = 340 nm</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Eppendorf Dry Bath Incubator</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">37.0°C ± 0.1°C Thermostated</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Multi-Channel Micropipettes</div>
                <div style="color: #facc15; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Substrate Gradient 0.2 - 10 mM</div>
              </div>
            </div>
          </div>

          <!-- Top HUD Overlay -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">INITIAL VELOCITY (V_0)</div>
              <div style="font-weight: 800; font-size: 1.3rem; color: #818cf8; font-family: var(--font-mono);" id="disp-enz-v0">42.5 µmol/(min·mg)</div>
              <div style="font-size: 0.74rem; color: #38bdf8; font-family: var(--font-mono);" id="disp-enz-vmax">V_max = 85.0 • K_m = 2.50 mM</div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">CATALYTIC EFFICIENCY</div>
              <div style="font-weight: 800; font-size: 1.25rem; color: #34d399; font-family: var(--font-mono);" id="disp-enz-eff">34.0 s⁻¹·mM⁻¹</div>
              <div style="font-size: 0.74rem; color: #facc15; font-family: var(--font-mono);" id="disp-enz-sat">Active Site Saturation: 50.0%</div>
            </div>
          </div>

          <!-- Bottom Status Pill -->
          <div style="position: absolute; bottom: 12px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: center; pointer-events: none; font-family: var(--font-mono); font-size: 0.74rem; color: #94a3b8;">
            <span style="background: rgba(0,0,0,0.65); padding: 4px 10px; border-radius: 6px;" id="disp-enz-status">
              ⚡ Catalysis Active: Optimal ionization &amp; kinetic collision rate
            </span>
            <span style="background: rgba(0,0,0,0.65); padding: 4px 10px; border-radius: 6px;">
              T = <span id="disp-enz-temp">37°C</span> • pH = <span id="disp-enz-ph">7.0</span>
            </span>
          </div>
        </div>

        <!-- Controls & Michaelis-Menten Plot on Right -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <!-- Enzyme Selection & Plot Mode -->
          <div class="lab-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <label style="font-size: 0.8rem; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">
                Biocatalytic Enzyme System
              </label>
              <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 6px; padding: 2px;">
                <button id="btn-plot-mm" class="btn btn-secondary btn-sm active" style="font-size: 0.72rem; padding: 3px 8px; border: none;">V vs [S]</button>
                <button id="btn-plot-lb" class="btn btn-secondary btn-sm" style="font-size: 0.72rem; padding: 3px 8px; border: none;">1/V vs 1/[S]</button>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
              <button class="btn btn-secondary btn-sm ${currentEnzymeKey === 'catalase' ? 'active' : ''}" data-enz="catalase" style="font-size: 0.72rem; padding: 6px;">
                Catalase
              </button>
              <button class="btn btn-secondary btn-sm ${currentEnzymeKey === 'lactase' ? 'active' : ''}" data-enz="lactase" style="font-size: 0.72rem; padding: 6px;">
                Lactase
              </button>
              <button class="btn btn-secondary btn-sm ${currentEnzymeKey === 'amylase' ? 'active' : ''}" data-enz="amylase" style="font-size: 0.72rem; padding: 6px;">
                Amylase
              </button>
            </div>
          </div>

          <!-- Parameter Sliders -->
          <div class="lab-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px;">
            <label style="font-size: 0.8rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">
              Assay Conditions &amp; Substrate Concentration
            </label>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              <!-- Substrate Concentration [S] -->
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>Substrate [S]</span>
                  <span style="color: #facc15; font-weight: 700;" id="lbl-enz-substrate">${substrateConc.toFixed(2)} mM</span>
                </div>
                <input type="range" id="slider-enz-substrate" min="0.2" max="10.0" step="0.2" value="${substrateConc}" style="width: 100%; accent-color: #facc15;">
              </div>

              <!-- Temperature Slider -->
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>Reaction Bath Temperature</span>
                  <span style="color: #ec4899; font-weight: 700;" id="lbl-enz-temp">${temperature} °C</span>
                </div>
                <input type="range" id="slider-enz-temp" min="10" max="70" step="1" value="${temperature}" style="width: 100%; accent-color: #ec4899;">
              </div>

              <!-- pH Slider -->
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>Buffer pH</span>
                  <span style="color: #34d399; font-weight: 700;" id="lbl-enz-ph">${pH.toFixed(1)}</span>
                </div>
                <input type="range" id="slider-enz-ph" min="2.0" max="11.0" step="0.2" value="${pH}" style="width: 100%; accent-color: #34d399;">
              </div>

              <!-- Inhibitor Selection -->
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>Inhibitor Mode</span>
                  <span style="color: #f87171; font-weight: 700;" id="lbl-enz-inhibitor">None</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
                  <button class="btn btn-secondary btn-sm ${inhibitorType === 'none' ? 'active' : ''}" data-inhib="none" style="font-size: 0.72rem; padding: 5px;">None</button>
                  <button class="btn btn-secondary btn-sm ${inhibitorType === 'competitive' ? 'active' : ''}" data-inhib="competitive" style="font-size: 0.72rem; padding: 5px; color: #facc15;">Competitive</button>
                  <button class="btn btn-secondary btn-sm ${inhibitorType === 'noncompetitive' ? 'active' : ''}" data-inhib="noncompetitive" style="font-size: 0.72rem; padding: 5px; color: #f87171;">Non-Comp</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Real-Time Kinetic Graph (Michaelis-Menten or Lineweaver-Burk) -->
          <div class="lab-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px; flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 0.8rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em;" id="lbl-chart-title">
                Michaelis-Menten: V_0 vs [S]
              </span>
            </div>
            <canvas id="enz-graph-canvas" width="420" height="120" style="width: 100%; height: 120px; display: block; border-radius: 6px; background: #030712; border: 1px solid rgba(255,255,255,0.08);"></canvas>
          </div>
        </div>
      </div>

      <!-- Post-Lab Checkpoint Assessment -->
      <div id="enz-checkpoint-container" style="margin-top: 24px;"></div>
    </div>
  `;

  // Canvas References
  const canvas = container.querySelector("#enzyme-canvas");
  const ctx = canvas.getContext("2d");
  const graphCanvas = container.querySelector("#enz-graph-canvas");
  const graphCtx = graphCanvas.getContext("2d");

  // DOM Elements
  const dispV0 = container.querySelector("#disp-enz-v0");
  const dispVmax = container.querySelector("#disp-enz-vmax");
  const dispEff = container.querySelector("#disp-enz-eff");
  const dispSat = container.querySelector("#disp-enz-sat");
  const dispStatus = container.querySelector("#disp-enz-status");
  const dispTemp = container.querySelector("#disp-enz-temp");
  const dispPH = container.querySelector("#disp-enz-ph");

  function updateTelemetry() {
    const { Km, Vmax, V0, tempFactor, phFactor } = getKineticParameters();
    const satPct = (substrateConc / (Km + substrateConc)) * 100;
    const efficiency = Km > 0 ? (Vmax / Km) : 0;

    dispV0.innerText = `${V0.toFixed(1)} µmol/(min·mg)`;
    dispVmax.innerText = `V_max = ${Vmax.toFixed(1)} • K_m = ${Km.toFixed(2)} mM`;
    dispEff.innerText = `${efficiency.toFixed(1)} s⁻¹·mM⁻¹`;
    dispSat.innerText = `Active Site Saturation: ${satPct.toFixed(1)}%`;
    dispTemp.innerText = `${temperature}°C`;
    dispPH.innerText = `${pH.toFixed(1)}`;

    if (temperature > 55) {
      dispStatus.innerText = "🛑 Thermal Denaturation: Hydrogen bonds disrupted, tertiary structure destroyed!";
    } else if (Math.abs(pH - activeEnzyme.optPH) > 2.5) {
      dispStatus.innerText = "⚠️ Severe pH Inactivation: Active site catalytic residues inappropriately protonated.";
    } else if (inhibitorType === "competitive") {
      dispStatus.innerText = "⚡ Competitive Inhibition: Km increased, active sites blocked by structural analogs.";
    } else if (inhibitorType === "noncompetitive") {
      dispStatus.innerText = "⚡ Non-Competitive Inhibition: Allosteric site bound, Vmax reduced.";
    } else {
      dispStatus.innerText = "⚡ Catalysis Active: High-speed substrate turnover at active site clefts.";
    }
  }

  // 60 FPS HTML5 Simulation of Globular Enzyme with Active Site Cleft
  function renderApparatus() {
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const CX = W * 0.48;
    const CY = 260;

    // Outer Cytoplasmic Solution Glow
    const bgGrad = ctx.createRadialGradient(CX, CY, 40, CX, CY, 220);
    bgGrad.addColorStop(0, "rgba(99, 102, 241, 0.15)");
    bgGrad.addColorStop(1, "transparent");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Large Globular Enzyme Protein
    const isDenatured = temperature > 55;
    ctx.fillStyle = isDenatured ? "#475569" : "#4f46e5";
    ctx.strokeStyle = isDenatured ? "#64748b" : "#818cf8";
    ctx.lineWidth = 3;

    ctx.beginPath();
    if (!isDenatured) {
      // Intact globular structure with active site cleft at top-center
      ctx.moveTo(CX - 120, CY);
      ctx.bezierCurveTo(CX - 130, CY - 90, CX - 60, CY - 110, CX - 30, CY - 80);
      // Active Site Cleft Indentation
      ctx.bezierCurveTo(CX - 25, CY - 40, CX - 15, CY - 20, CX, CY - 20);
      ctx.bezierCurveTo(CX + 15, CY - 20, CX + 25, CY - 40, CX + 30, CY - 80);
      // Right Lobe
      ctx.bezierCurveTo(CX + 60, CY - 110, CX + 130, CY - 90, CX + 120, CY);
      // Bottom Curve
      ctx.bezierCurveTo(CX + 110, CY + 100, CX - 110, CY + 100, CX - 120, CY);
    } else {
      // Unfolded denatured tangled polypeptide strand
      ctx.moveTo(CX - 120, CY);
      ctx.lineTo(CX - 80, CY - 60);
      ctx.lineTo(CX - 30, CY + 40);
      ctx.lineTo(CX + 40, CY - 70);
      ctx.lineTo(CX + 110, CY + 20);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Enzyme Name Label
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(activeEnzyme.name, CX, CY + 40);
    ctx.font = "10px monospace";
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText(isDenatured ? "DENATURED POLYPEPTIDE" : "ACTIVE SITE CLEFT (Top)", CX, CY + 58);

    // Substrate Particles [S] Floating & Colliding
    const { V0 } = getKineticParameters();
    const particleSpeed = Math.min(4, 0.8 + V0 * 0.05);

    ctx.fillStyle = "#facc15"; // Substrate yellow
    substrateParticles.forEach(p => {
      p.x += p.vx * particleSpeed;
      p.y += p.vy * particleSpeed;

      // Bounce within bounds
      if (p.x < 30 || p.x > W - 30) p.vx = -p.vx;
      if (p.y < 30 || p.y > H - 30) p.vy = -p.vy;

      // Draw Substrate Key
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Bound Substrate in Active Site
    if (!isDenatured && substrateConc > 0.5) {
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.arc(CX, CY - 30, 8, 0, Math.PI * 2);
      ctx.fill();

      // Product Formation Sparkles
      ctx.fillStyle = "#22c55e";
      ctx.font = "bold 11px system-ui";
      ctx.fillText("+ PRODUCT", CX, CY - 50);
    }
  }

  // Render Kinetic Graph (Michaelis-Menten or Lineweaver-Burk)
  function renderGraph() {
    const W = graphCanvas.width;
    const H = graphCanvas.height;
    graphCtx.clearRect(0, 0, W, H);

    const padL = 40;
    const padB = 25;
    const padT = 15;
    const padR = 20;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    graphCtx.strokeStyle = "rgba(255,255,255,0.15)";
    graphCtx.lineWidth = 1;
    graphCtx.beginPath();
    graphCtx.moveTo(padL, padT);
    graphCtx.lineTo(padL, H - padB);
    graphCtx.lineTo(W - padR, H - padB);
    graphCtx.stroke();

    const { Km, Vmax, V0 } = getKineticParameters();

    if (plotMode === "mm") {
      // Hyperbolic Michaelis-Menten Plot V_0 vs [S]
      const maxS = 10.0; // mM
      const maxV = Math.max(10, Vmax * 1.15);

      graphCtx.strokeStyle = "#818cf8";
      graphCtx.lineWidth = 2.5;
      graphCtx.beginPath();

      for (let s = 0; s <= maxS; s += 0.2) {
        const v = (Vmax * s) / (Km + s);
        const px = padL + (s / maxS) * plotW;
        const py = (H - padB) - (v / maxV) * plotH;
        if (s === 0) graphCtx.moveTo(px, py);
        else graphCtx.lineTo(px, py);
      }
      graphCtx.stroke();

      // Vmax Dotted Asymptote
      const vmaxY = (H - padB) - (Vmax / maxV) * plotH;
      graphCtx.strokeStyle = "rgba(244, 63, 94, 0.5)";
      graphCtx.setLineDash([3, 3]);
      graphCtx.beginPath();
      graphCtx.moveTo(padL, vmaxY);
      graphCtx.lineTo(W - padR, vmaxY);
      graphCtx.stroke();
      graphCtx.setLineDash([]);

      // Current Point
      const curX = padL + (substrateConc / maxS) * plotW;
      const curY = (H - padB) - (V0 / maxV) * plotH;
      graphCtx.fillStyle = "#facc15";
      graphCtx.beginPath();
      graphCtx.arc(curX, curY, 5, 0, Math.PI * 2);
      graphCtx.fill();

      // Labels
      graphCtx.fillStyle = "#94a3b8";
      graphCtx.font = "9px monospace";
      graphCtx.textAlign = "right";
      graphCtx.fillText("Vmax", padL - 4, vmaxY + 3);
      graphCtx.fillText("0", padL - 4, H - padB);
      graphCtx.textAlign = "center";
      graphCtx.fillText("Substrate [S] (mM) ➔", W / 2, H - 6);
    } else {
      // Lineweaver-Burk Double Reciprocal: 1/V vs 1/[S]
      // 1/V = (Km/Vmax) * (1/S) + (1/Vmax)
      const invV_intercept = 1 / Math.max(0.1, Vmax);
      const invS_max = 2.5; // (1 / 0.4 mM)
      const invV_max = invV_intercept + (Km / Vmax) * invS_max;

      graphCtx.strokeStyle = "#22c55e";
      graphCtx.lineWidth = 2.2;
      graphCtx.beginPath();

      const x0 = padL;
      const y0 = (H - padB) - (invV_intercept / (invV_max * 1.2)) * plotH;
      const xEnd = W - padR;
      const yEnd = (H - padB) - (invV_max / (invV_max * 1.2)) * plotH;

      graphCtx.moveTo(x0, y0);
      graphCtx.lineTo(xEnd, yEnd);
      graphCtx.stroke();

      graphCtx.fillStyle = "#94a3b8";
      graphCtx.font = "9px monospace";
      graphCtx.textAlign = "right";
      graphCtx.fillText("1/Vmax", padL - 4, y0 + 3);
      graphCtx.textAlign = "center";
      graphCtx.fillText("1 / [S] (mM⁻¹) ➔", W / 2, H - 6);
    }
  }

  // Animation Loop
  let lastTime = performance.now();
  let lastFrameTime = 0;
  let graphNeedsRedraw = true;

  function loop(currentTime) {
    if (!container || !container.isConnected) {
      if (animId) cancelAnimationFrame(animId);
      return;
    }

    const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
    lastTime = currentTime;

    const isSmart = (document.documentElement.getAttribute("data-mode") === "smartboard") ||
                    document.documentElement.classList.contains("fast-smartboard-mode") ||
                    /Android|MAXHUB/i.test(navigator.userAgent);
    const interval = isSmart ? 33.3 : 16.0;

    const photoOverlay = container.querySelector("#enzyme-photo-overlay");
    const isPhotoOverlay = photoOverlay && photoOverlay.style.display === "block";

    if (!isPhotoOverlay) {
      if (!currentTime || currentTime - lastFrameTime >= interval) {
        lastFrameTime = currentTime;
        elapsedSeconds += dt;
        renderApparatus();

        if (graphNeedsRedraw) {
          updateTelemetry();
          renderGraph();
          graphNeedsRedraw = false;
        }
      }
    }

    animId = requestAnimationFrame(loop);
  }
  animId = requestAnimationFrame(loop);

  // --- EVENT LISTENERS ---
  const btnSim = container.querySelector("#view-mode-enz-sim");
  const btnPhoto = container.querySelector("#view-mode-enz-photo");
  const photoOverlay = container.querySelector("#enzyme-photo-overlay");

  btnSim?.addEventListener("click", () => {
    btnSim.classList.add("active");
    btnSim.style.background = "";
    btnPhoto.classList.remove("active");
    btnPhoto.style.background = "transparent";
    if (photoOverlay) photoOverlay.style.display = "none";
    graphNeedsRedraw = true;
    SoundFX.playClick();
  });

  btnPhoto?.addEventListener("click", () => {
    btnPhoto.classList.add("active");
    btnPhoto.style.background = "";
    btnSim.classList.remove("active");
    btnSim.style.background = "transparent";
    if (photoOverlay) photoOverlay.style.display = "block";
    SoundFX.playClick();
  });

  // Switch Enzyme
  container.querySelectorAll("[data-enz]").forEach(btn => {
    btn.addEventListener("click", () => {
      container.querySelectorAll("[data-enz]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentEnzymeKey = btn.dataset.enz;
      activeEnzyme = ENZYMES[currentEnzymeKey];
      temperature = activeEnzyme.optTemp;
      pH = activeEnzyme.optPH;
      container.querySelector("#slider-enz-temp").value = temperature;
      container.querySelector("#slider-enz-ph").value = pH;
      container.querySelector("#lbl-enz-temp").innerText = `${temperature} °C`;
      container.querySelector("#lbl-enz-ph").innerText = `${pH.toFixed(1)}`;
      graphNeedsRedraw = true;
      SoundFX.playClick();
    });
  });

  // Plot Mode Switcher
  container.querySelector("#btn-plot-mm")?.addEventListener("click", (e) => {
    plotMode = "mm";
    container.querySelector("#btn-plot-mm").classList.add("active");
    container.querySelector("#btn-plot-lb").classList.remove("active");
    container.querySelector("#lbl-chart-title").innerText = "Michaelis-Menten: V_0 vs [S]";
    graphNeedsRedraw = true;
    SoundFX.playClick();
  });

  container.querySelector("#btn-plot-lb")?.addEventListener("click", (e) => {
    plotMode = "lb";
    container.querySelector("#btn-plot-lb").classList.add("active");
    container.querySelector("#btn-plot-mm").classList.remove("active");
    container.querySelector("#lbl-chart-title").innerText = "Lineweaver-Burk: 1/V_0 vs 1/[S]";
    graphNeedsRedraw = true;
    SoundFX.playClick();
  });

  // Sliders
  container.querySelector("#slider-enz-substrate")?.addEventListener("input", (e) => {
    substrateConc = parseFloat(e.target.value);
    container.querySelector("#lbl-enz-substrate").innerText = `${substrateConc.toFixed(2)} mM`;
    graphNeedsRedraw = true;
  });

  container.querySelector("#slider-enz-temp")?.addEventListener("input", (e) => {
    temperature = parseInt(e.target.value, 10);
    container.querySelector("#lbl-enz-temp").innerText = `${temperature} °C`;
    graphNeedsRedraw = true;
  });

  container.querySelector("#slider-enz-ph")?.addEventListener("input", (e) => {
    pH = parseFloat(e.target.value);
    container.querySelector("#lbl-enz-ph").innerText = `${pH.toFixed(1)}`;
    graphNeedsRedraw = true;
  });

  // Inhibitors
  container.querySelectorAll("[data-inhib]").forEach(btn => {
    btn.addEventListener("click", () => {
      container.querySelectorAll("[data-inhib]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      inhibitorType = btn.dataset.inhib;
      inhibitorConc = inhibitorType === "none" ? 0.0 : 2.0;
      container.querySelector("#lbl-enz-inhibitor").innerText = inhibitorType.toUpperCase();
      graphNeedsRedraw = true;
      SoundFX.playClick();
    });
  });

  // Export CSV
  container.querySelector("#btn-enz-export")?.addEventListener("click", () => {
    const { Km, Vmax, V0 } = getKineticParameters();
    exportLabDataCsv({
      title: "Enzyme Kinetics & Michaelis-Menten Telemetry",
      labId: "enzymes",
      parameters: {
        "Enzyme": activeEnzyme.name,
        "Substrate": activeEnzyme.substrate,
        "Substrate Concentration [mM]": substrateConc,
        "Reaction Temperature (°C)": temperature,
        "Buffer pH": pH,
        "Inhibitor Type": inhibitorType,
        "Apparent Vmax": Vmax.toFixed(2),
        "Apparent Km": Km.toFixed(2),
        "Initial Velocity V0": V0.toFixed(2)
      },
      headers: ["Parameter", "Value"],
      dataRows: [
        ["Enzyme", activeEnzyme.name],
        ["Substrate [S] (mM)", substrateConc],
        ["Velocity V0", V0.toFixed(2)],
        ["Vmax", Vmax.toFixed(2)],
        ["Km", Km.toFixed(2)],
        ["Temperature (C)", temperature],
        ["pH", pH]
      ]
    });
  });

  // Mount Post-Lab Checkpoint Assessment
  mountLabCheckpoint("enz-checkpoint-container", "enzymes");

  return () => {
    if (animId) cancelAnimationFrame(animId);
  };
}
