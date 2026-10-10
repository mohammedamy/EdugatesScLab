// Edugates-ClipSAT Science Labs - Chemistry: Organic Reaction Mechanisms Suite
// 60 FPS Precision Reaction Kinetics & Stereo-Mechanistic Simulation:
// SN1, SN2, E2 Elimination, and Fischer Esterification with Reaction Coordinate Diagrams,
// Transition State Enthalpy Profiles, Walden Inversion, and Molecular Collision Dynamics.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initOrganicReactionsLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const MECHANISMS = {
    sn2: {
      name: "S_N2: Bimolecular Nucleophilic Substitution",
      subtitle: "Concerted Backside Attack & Walden Inversion",
      substrate: "Bromomethane (CH₃Br)",
      nucleophile: "Hydroxide (OH⁻)",
      product: "Methanol (CH₃OH) + Br⁻",
      rateLaw: "Rate = k[Substrate][Nu⁻]",
      ea: 75.0, // kJ/mol
      deltaH: -45.0, // kJ/mol (Exothermic)
      hasIntermediate: false,
      color: "#06b6d4"
    },
    sn1: {
      name: "S_N1: Unimolecular Nucleophilic Substitution",
      subtitle: "Two-Step via Planar Carbocation Intermediate",
      substrate: "tert-Butyl Chloride ((CH₃)₃CCl)",
      nucleophile: "Water (H₂O)",
      product: "tert-Butanol ((CH₃)₃COH) + Cl⁻",
      rateLaw: "Rate = k[Substrate]",
      ea: 90.0,
      deltaH: -25.0,
      hasIntermediate: true,
      color: "#a855f7"
    },
    e2: {
      name: "E2: Bimolecular Elimination",
      subtitle: "Anti-Periplanar Elimination forming Alkene",
      substrate: "2-Bromobutane (CH₃CH(Br)CH₂CH₃)",
      nucleophile: "Ethoxide Base (CH₃CH₂O⁻)",
      product: "2-Butene (Zaitsev Major) + HBr",
      rateLaw: "Rate = k[Substrate][Base⁻]",
      ea: 82.0,
      deltaH: -38.0,
      hasIntermediate: false,
      color: "#f59e0b"
    },
    ester: {
      name: "Fischer Esterification",
      subtitle: "Acid-Catalyzed Carboxylic Condensation",
      substrate: "Acetic Acid (CH₃COOH) + Ethanol",
      nucleophile: "H⁺ Catalyst",
      product: "Ethyl Acetate (Ester) + H₂O",
      rateLaw: "Rate = k[Acid][Alcohol][H⁺]",
      ea: 68.0,
      deltaH: -8.0,
      hasIntermediate: true,
      color: "#10b981"
    }
  };

  // State
  let activeMechKey = "sn2";
  let tempKelvin = 298; // 25°C
  let substrateConc = 0.50; // M
  let nucleophileConc = 0.50; // M
  let reactionProgress = 0.0; // 0.0 (reactants) to 1.0 (products)
  let isAutoPlaying = true;
  let isRunning = true;
  let animId = null;
  let simClock = 0;

  // Canonical Reactor Flask Glassware Geometry
  const FLASK = {
    cx: 290,
    cy: 315,
    radius: 175,
    neckWidth: 68, // x: 256 to 324
    neckTopY: 112,
    meniscusY: 185,
    bottomY: 485
  };

  // Helper geometry paths for authentic Quickfit boiling/reactor flask
  function drawFlaskPath(targetCtx, inset = 0) {
    const r = FLASK.radius - inset;
    const hw = Math.max(10, (FLASK.neckWidth / 2) - inset);
    const dy = -Math.sqrt(Math.max(1, r * r - hw * hw));
    const meetY = FLASK.cy + dy;
    const aRight = Math.atan2(dy, hw);
    const aLeft = Math.atan2(dy, -hw);

    targetCtx.beginPath();
    // Ground-glass lip top flange
    targetCtx.moveTo(FLASK.cx - hw - 6, FLASK.neckTopY + inset);
    targetCtx.lineTo(FLASK.cx + hw + 6, FLASK.neckTopY + inset);
    targetCtx.lineTo(FLASK.cx + hw, FLASK.neckTopY + 8 + inset);
    // Right neck vertical wall
    targetCtx.lineTo(FLASK.cx + hw, meetY);
    // Spherical bulb contour around bottom (clockwise: right -> bottom -> left)
    targetCtx.arc(FLASK.cx, FLASK.cy, r, aRight, aLeft, false);
    // Left neck vertical wall
    targetCtx.lineTo(FLASK.cx - hw, FLASK.neckTopY + 8 + inset);
    targetCtx.lineTo(FLASK.cx - hw - 6, FLASK.neckTopY + inset);
    targetCtx.closePath();
  }

  function drawLiquidPath(targetCtx, inset = 3) {
    const r = FLASK.radius - inset;
    const dy = FLASK.meniscusY - FLASK.cy;
    const hw = Math.sqrt(Math.max(1, r * r - dy * dy));
    const aRight = Math.atan2(dy, hw);
    const aLeft = Math.atan2(dy, -hw);

    targetCtx.beginPath();
    targetCtx.arc(FLASK.cx, FLASK.cy, r, aRight, aLeft, false);
    targetCtx.ellipse(FLASK.cx, FLASK.meniscusY, hw, 7, 0, Math.PI, 0, true);
    targetCtx.closePath();
  }

  // Colliding particles in reactor flask - strictly bounded inside fluid
  const molecules = [];
  function initMolecules() {
    molecules.length = 0;
    for (let i = 0; i < 28; i++) {
      let x, y, dist;
      let attempts = 0;
      do {
        const r = Math.sqrt(Math.random()) * (FLASK.radius - 24);
        const theta = Math.random() * Math.PI * 2;
        x = FLASK.cx + Math.cos(theta) * r;
        y = FLASK.cy + Math.sin(theta) * r;
        dist = Math.hypot(x - FLASK.cx, y - FLASK.cy);
        attempts++;
      } while ((dist > FLASK.radius - 20 || y < FLASK.meniscusY + 16 || y > FLASK.bottomY - 18) && attempts < 100);

      const speed = 1.0 + Math.random() * 1.4;
      const angle = Math.random() * Math.PI * 2;
      molecules.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 5,
        type: i % 2 === 0 ? "substrate" : "nucleophile",
        phase: Math.random() * Math.PI * 2
      });
    }
  }
  initMolecules();

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #a855f7; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #a855f7; box-shadow: 0 0 10px #a855f7;"></span>
            Organic Reaction Mechanisms Suite
          </span>
          <span class="badge" style="background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.3); color: #c084fc; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            ${renderLatex("\\text{S}_\\text{N}1 \\cdot \\text{S}_\\text{N}2 \\cdot \\text{E}2 \\cdot \\text{Esterification} \\cdot \\Delta G^\\ddagger")}
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-org-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Kinetics Simulator
            </button>
            <button id="view-mode-org-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-org-playpause" style="padding: 5px 12px; font-size: 0.78rem;">
            ⏸ Pause Animation
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-org-reset" style="padding: 5px 12px; font-size: 0.78rem;">
            ⟲ Reset State
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-org-export" title="Export experimental telemetry to RFC-4180 CSV (Hotkey: E)" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export CSV (E)
          </button>
        </div>
      </div>

      <!-- Main Layout -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="org-layout">
        <!-- Canvas Viewport -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(168, 85, 247, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #1e1b4b 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="org-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
          <div id="org-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <picture>
              <source srcset="assets/labs/organic_bench.webp" type="image/webp">
              <img src="assets/labs/organic_bench.jpg" decoding="async" loading="lazy" alt="4K Organic Synthesis & Distillation Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            </picture>
            
            <!-- Live Analytical Telemetry Callout on Photo -->
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Quickfit Reflux Condenser</div>
                <div style="color: #c084fc; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Liebig Water-Cooled Column</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Digital Heating Mantle</div>
                <div style="color: #facc15; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">IKA RCT Magnetic Stirrer</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Pear Separatory Funnel</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Biphasic Phase Separation</div>
              </div>
            </div>
          </div>

          <!-- Top HUD -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">TRANSITION STATE &amp; COORDINATE</div>
              <div id="hud-org-status" style="font-size: 1.1rem; font-weight: 800; color: #c084fc; font-family: var(--font-mono);">
                Reactants Approaching
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">ACTIVATION BARRIER E_a</div>
              <div id="hud-org-ea" style="font-size: 1.15rem; font-weight: 800; color: #10b981; font-family: var(--font-mono);">
                E_a = 75.0 kJ/mol
              </div>
            </div>
          </div>
        </div>

        <!-- Controls & Energy Coordinate Diagram -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Controls Panel -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #c084fc; text-transform: uppercase; margin-bottom: 12px;">Mechanism &amp; Reagents</div>

            <div style="margin-bottom: 12px;">
              <label style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Reaction Pathway</label>
              <select id="select-org-mech" class="form-control" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                ${Object.entries(MECHANISMS).map(([k, m]) => `<option value="${k}">${m.name}</option>`).join("")}
              </select>
            </div>

            <!-- Reaction Progress Slider (Interactive manual scrub) -->
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                <span style="color: #94a3b8;">Reaction Coordinate ξ (Progress)</span>
                <span id="lbl-org-progress" style="font-weight: 700; color: #38bdf8; font-family: var(--font-mono);">0%</span>
              </div>
              <input type="range" id="slider-org-progress" min="0" max="100" step="1" value="0" style="width: 100%; accent-color: #38bdf8;">
            </div>

            <!-- Reaction Temperature -->
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                <span style="color: #94a3b8;">Reaction Temperature T</span>
                <span id="lbl-org-temp" style="font-weight: 700; color: #f43f5e; font-family: var(--font-mono);">298 K (25°C)</span>
              </div>
              <input type="range" id="slider-org-temp" min="273" max="373" step="1" value="298" style="width: 100%; accent-color: #f43f5e;">
            </div>

            <!-- Quick Specs -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: rgba(0,0,0,0.3); border-radius: 8px; padding: 8px 10px; font-size: 0.75rem;">
              <div>
                <span style="color: #64748b; display: block;">Rate Law</span>
                <span id="info-org-ratelaw" style="font-weight: 700; color: #facc15; font-family: var(--font-mono);">Rate = k[R-X][Nu]</span>
              </div>
              <div>
                <span style="color: #64748b; display: block;">Reaction Enthalpy ΔH°</span>
                <span id="info-org-deltah" style="font-weight: 700; color: #10b981; font-family: var(--font-mono);">-45.0 kJ/mol</span>
              </div>
            </div>
          </div>

          <!-- Energy Profile Chart -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; flex: 1; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">
                Gibbs Free Energy Reaction Coordinate Diagram
              </span>
              <span style="font-size: 0.72rem; color: #c084fc; font-family: var(--font-mono);">
                ΔG vs Reaction Coordinate
              </span>
            </div>
            <div style="position: relative; flex: 1; min-height: 180px;">
              <canvas id="org-chart-canvas" width="460" height="180" style="width: 100%; height: 180px; display: block; border-radius: 6px;"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Assessment Checkpoint Container -->
      <div id="organic-checkpoint-container" style="margin-top: 24px;"></div>
    </div>
  `;

  const canvas = container.querySelector("#org-canvas");
  const ctx = canvas.getContext("2d");
  const chartCanvas = container.querySelector("#org-chart-canvas");
  const chartCtx = chartCanvas.getContext("2d");

  function renderMolecularApparatus() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const mech = MECHANISMS[activeMechKey];

    // 1. Background Reaction Flask Glassware Body
    drawFlaskPath(ctx, 0);
    ctx.fillStyle = "rgba(15, 23, 42, 0.90)";
    ctx.fill();

    // Ground glass joint frosting lines on Quickfit neck
    ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
    ctx.lineWidth = 1;
    for (let y = FLASK.neckTopY + 12; y <= FLASK.neckTopY + 28; y += 4) {
      ctx.beginPath();
      ctx.moveTo(FLASK.cx - 28, y);
      ctx.lineTo(FLASK.cx + 28, y);
      ctx.stroke();
    }

    // 2. Liquid in Flask (Aqueous / Organic Reaction Medium)
    const flaskGrad = ctx.createRadialGradient(FLASK.cx, FLASK.cy + 20, 25, FLASK.cx, FLASK.cy + 30, FLASK.radius);
    flaskGrad.addColorStop(0, "rgba(168, 85, 247, 0.38)");
    flaskGrad.addColorStop(0.65, "rgba(88, 28, 135, 0.58)");
    flaskGrad.addColorStop(1, "rgba(30, 27, 75, 0.85)");
    drawLiquidPath(ctx, 3);
    ctx.fillStyle = flaskGrad;
    ctx.fill();

    // Meniscus illumination ring
    const dyM = FLASK.meniscusY - FLASK.cy;
    const hwM = Math.sqrt(Math.max(1, (FLASK.radius - 3) * (FLASK.radius - 3) - dyM * dyM));
    ctx.strokeStyle = "rgba(192, 132, 252, 0.75)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(FLASK.cx, FLASK.meniscusY, hwM, 6, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Magnetic stir bar spinning at bottom of flask
    const stirAngle = simClock * 7;
    ctx.save();
    ctx.translate(FLASK.cx, FLASK.bottomY - 14);
    ctx.rotate(Math.sin(stirAngle) * 0.12);
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(255, 255, 255, 0.7)";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.roundRect(-22, -4, 44, 8, 4);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

    // 3. Dynamic Microscopic Colliding Molecules (Strict Physical Reflection & Canvas Clipping)
    ctx.save();
    drawLiquidPath(ctx, 4);
    ctx.clip(); // <--- RIGID CANVAS CLIPPING MASK: ZERO PARTICLES CAN ESCAPE

    molecules.forEach(m => {
      // Thermal velocity scaling
      const tempMult = Math.sqrt(tempKelvin / 298.15);
      m.x += m.vx * tempMult;
      m.y += m.vy * tempMult;

      // Top liquid meniscus boundary
      const topLimit = FLASK.meniscusY + m.radius + 3;
      if (m.y < topLimit) {
        m.y = topLimit;
        m.vy = Math.abs(m.vy);
      }

      // Spherical glass wall elastic vector reflection
      const dx = m.x - FLASK.cx;
      const dy = m.y - FLASK.cy;
      const dist = Math.hypot(dx, dy);
      const maxR = FLASK.radius - m.radius - 5;

      if (dist > maxR && dist > 0.001) {
        const nx = dx / dist;
        const ny = dy / dist;
        m.x = FLASK.cx + nx * maxR;
        m.y = FLASK.cy + ny * maxR;

        const dot = m.vx * nx + m.vy * ny;
        if (dot > 0) {
          m.vx -= 2 * dot * nx;
          m.vy -= 2 * dot * ny;
        }
      }

      // Bottom glass boundary
      const bottomLimit = FLASK.bottomY - m.radius - 6;
      if (m.y > bottomLimit) {
        m.y = bottomLimit;
        m.vy = -Math.abs(m.vy);
      }

      // Render glowing molecule sphere
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
      if (m.type === "substrate") {
        ctx.fillStyle = "rgba(168, 85, 247, 0.85)";
        ctx.shadowColor = "#a855f7";
      } else {
        ctx.fillStyle = "rgba(6, 182, 212, 0.85)";
        ctx.shadowColor = "#06b6d4";
      }
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
    ctx.restore(); // Restore liquid clip

    // Molecular Mechanism Center Stage: Render the Central Reaction Complexes
    // Coordinate progression: 0.0 -> 0.5 (Transition State) -> 1.0 (Products)
    const cx = 290;
    const cy = 300;

    if (activeMechKey === "sn2") {
      // SN2: Nucleophile OH attacks from Left, Br leaves to Right.
      // At TS (0.5), central C is pentacoordinate with planar hydrogens.
      const nuDist = 120 * (1.0 - reactionProgress); // Nu distance from C
      const lgDist = 30 + 100 * reactionProgress; // LG distance from C

      // Central Carbon
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fillStyle = "#334155";
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("C", cx, cy);

      // Hydrogens (umbrella inversion)
      const hSpread = Math.PI * 0.45 * (reactionProgress < 0.5 ? (1 - reactionProgress * 2) : -(reactionProgress - 0.5) * 2);
      for (let angle of [-hSpread, 0, hSpread]) {
        const hx = cx + Math.sin(angle) * 35;
        const hy = cy - Math.cos(angle) * 35;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(hx, hy);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(hx, hy, 9, 0, Math.PI * 2);
        ctx.fillStyle = "#f8fafc";
        ctx.fill();
        ctx.fillStyle = "#0f172a";
        ctx.font = "9px system-ui";
        ctx.fillText("H", hx, hy);
      }

      // Attacking Nucleophile (OH⁻) from Left
      const nuX = cx - Math.max(32, nuDist);
      const nuY = cy;
      ctx.beginPath();
      ctx.arc(nuX, nuY, 20, 0, Math.PI * 2);
      ctx.fillStyle = "#06b6d4";
      ctx.shadowColor = "#06b6d4";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px system-ui";
      ctx.fillText("OH⁻", nuX, nuY);

      // Bond forming line (dashed green if forming)
      if (reactionProgress > 0.1 && reactionProgress < 0.9) {
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(nuX + 20, nuY);
        ctx.lineTo(cx - 18, cy);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Leaving Group (Br⁻) to Right
      const lgX = cx + Math.max(32, lgDist);
      const lgY = cy;
      ctx.beginPath();
      ctx.arc(lgX, lgY, 24, 0, Math.PI * 2);
      ctx.fillStyle = "#f43f5e";
      ctx.shadowColor = "#f43f5e";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px system-ui";
      ctx.fillText("Br", lgX, lgY);

      // Bond breaking line (dashed red)
      if (reactionProgress > 0.1 && reactionProgress < 0.9) {
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cx + 18, cy);
        ctx.lineTo(lgX - 24, lgY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Transition State Bracket & Double Dagger Symbol
      if (reactionProgress >= 0.40 && reactionProgress <= 0.60) {
        ctx.strokeStyle = "#c084fc";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx - 70, cy - 65);
        ctx.lineTo(cx - 85, cy - 65);
        ctx.lineTo(cx - 85, cy + 65);
        ctx.lineTo(cx - 70, cy + 65);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx + 70, cy - 65);
        ctx.lineTo(cx + 85, cy - 65);
        ctx.lineTo(cx + 85, cy + 65);
        ctx.lineTo(cx + 70, cy + 65);
        ctx.stroke();

        ctx.fillStyle = "#facc15";
        ctx.font = "bold 20px system-ui";
        ctx.fillText("‡", cx + 96, cy - 60);
      }
    } else {
      // SN1 / E2 / Esterification generic multi-state representation
      ctx.beginPath();
      ctx.arc(cx, cy, 26, 0, Math.PI * 2);
      ctx.fillStyle = mech.color;
      ctx.shadowColor = mech.color;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(reactionProgress < 0.4 ? "Substrate" : (reactionProgress < 0.7 ? "Carbocation C⁺" : "Product"), cx, cy);

      // Surrounding ligand spheres
      for (let i = 0; i < 3; i++) {
        const theta = (i * 2 * Math.PI) / 3 + simClock * 0.5;
        const dist = 60 + Math.sin(simClock + i) * 8;
        const lx = cx + Math.cos(theta) * dist;
        const ly = cy + Math.sin(theta) * dist;
        ctx.beginPath();
        ctx.arc(lx, ly, 14, 0, Math.PI * 2);
        ctx.fillStyle = "#64748b";
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "10px system-ui";
        ctx.fillText(i === 0 ? "CH₃" : (i === 1 ? "CH₃" : (reactionProgress > 0.6 ? "OH" : "LG")), lx, ly);
      }
    }

    // 5. Outer Glass Walls, Quickfit Joint Details, & Refraction Sheen
    drawFlaskPath(ctx, 0);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Sleek curved reflection sheen on upper-left bulb
    ctx.beginPath();
    ctx.arc(FLASK.cx, FLASK.cy, FLASK.radius - 8, Math.PI * 0.95, Math.PI * 1.35, false);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Quickfit joint specification text
    ctx.fillStyle = "rgba(148, 163, 184, 0.65)";
    ctx.font = "bold 8px var(--font-mono, monospace)";
    ctx.textAlign = "center";
    ctx.fillText("24/40 Quickfit", FLASK.cx, FLASK.neckTopY + 22);

    // Etched volume calibrations on flask wall
    ctx.fillStyle = "rgba(148, 163, 184, 0.45)";
    ctx.font = "bold 9px var(--font-mono, monospace)";
    ctx.textAlign = "left";
    ctx.fillText("— 500 mL", FLASK.cx + 70, 240);
    ctx.fillText("— 250 mL", FLASK.cx + 90, 315);
    ctx.fillText("— 100 mL", FLASK.cx + 70, 395);

    // Subtitle & Stage description (positioned cleanly above flask rim at y: 112)
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 14px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(mech.name, canvas.width / 2, 70);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px system-ui";
    ctx.fillText(mech.subtitle, canvas.width / 2, 90);
  }

  function renderEnergyChart() {
    chartCtx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
    const mech = MECHANISMS[activeMechKey];

    // Background
    chartCtx.fillStyle = "#030712";
    chartCtx.fillRect(0, 0, chartCanvas.width, chartCanvas.height);
    chartCtx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    chartCtx.lineWidth = 1;

    for (let x = 40; x < chartCanvas.width; x += 40) {
      chartCtx.beginPath();
      chartCtx.moveTo(x, 10);
      chartCtx.lineTo(x, chartCanvas.height - 25);
      chartCtx.stroke();
    }

    // Axes
    chartCtx.strokeStyle = "#475569";
    chartCtx.lineWidth = 1.5;
    chartCtx.beginPath();
    chartCtx.moveTo(40, 15);
    chartCtx.lineTo(40, chartCanvas.height - 25);
    chartCtx.lineTo(chartCanvas.width - 15, chartCanvas.height - 25);
    chartCtx.stroke();

    // Axis Labels
    chartCtx.fillStyle = "#94a3b8";
    chartCtx.font = "10px var(--font-mono, monospace)";
    chartCtx.textAlign = "center";
    chartCtx.fillText("Reaction Coordinate ξ", chartCanvas.width / 2, chartCanvas.height - 8);

    chartCtx.save();
    chartCtx.translate(18, chartCanvas.height / 2);
    chartCtx.rotate(-Math.PI / 2);
    chartCtx.fillText("Gibbs Energy ΔG (kJ/mol)", 0, 0);
    chartCtx.restore();

    // Energy Curve
    chartCtx.beginPath();
    chartCtx.strokeStyle = mech.color;
    chartCtx.lineWidth = 2.5;

    const startX = 50;
    const endX = chartCanvas.width - 30;
    const baseEnergyY = 120; // Reactants

    let currentCoordX = startX + reactionProgress * (endX - startX);
    let currentEnergyY = baseEnergyY;

    if (!mech.hasIntermediate) {
      // Single Activation Barrier TS (SN2, E2)
      for (let x = startX; x <= endX; x += 2) {
        const normX = (x - startX) / (endX - startX);
        // Gaussian bump for Ea, downward slope for exothermic
        const bump = Math.exp(-Math.pow((normX - 0.5) / 0.18, 2)) * (mech.ea * 0.9);
        const delta = normX * (mech.deltaH * 0.7);
        const y = baseEnergyY - bump - delta;
        if (x === startX) chartCtx.moveTo(x, y);
        else chartCtx.lineTo(x, y);

        if (Math.abs(x - currentCoordX) < 2) currentEnergyY = y;
      }
    } else {
      // Two-step with Intermediate Well (SN1, Esterification)
      for (let x = startX; x <= endX; x += 2) {
        const normX = (x - startX) / (endX - startX);
        const bump1 = Math.exp(-Math.pow((normX - 0.35) / 0.12, 2)) * (mech.ea * 0.95);
        const bump2 = Math.exp(-Math.pow((normX - 0.72) / 0.14, 2)) * (mech.ea * 0.55);
        const well = -Math.exp(-Math.pow((normX - 0.52) / 0.08, 2)) * 25;
        const delta = normX * (mech.deltaH * 0.7);
        const y = baseEnergyY - bump1 - bump2 - well - delta;
        if (x === startX) chartCtx.moveTo(x, y);
        else chartCtx.lineTo(x, y);

        if (Math.abs(x - currentCoordX) < 2) currentEnergyY = y;
      }
    }
    chartCtx.stroke();

    const isSmart = (document.documentElement.getAttribute("data-mode") === "smartboard") ||
                    document.documentElement.classList.contains("fast-smartboard-mode") ||
                    /Android|MAXHUB/i.test(navigator.userAgent);

    // Draw active reaction progress ball on curve
    chartCtx.beginPath();
    chartCtx.arc(currentCoordX, currentEnergyY, 6, 0, Math.PI * 2);
    chartCtx.fillStyle = "#facc15";
    if (!isSmart) {
      chartCtx.shadowColor = "#facc15";
      chartCtx.shadowBlur = 8;
    }
    chartCtx.fill();
    if (!isSmart) {
      chartCtx.shadowBlur = 0;
    }

    // Transition State Annotations
    chartCtx.fillStyle = "#ffffff";
    chartCtx.font = "9px system-ui";
    chartCtx.textAlign = "center";
    chartCtx.fillText("Reactants", 65, baseEnergyY + 15);
    chartCtx.fillText("Products", endX - 15, baseEnergyY - (mech.deltaH * 0.7) + 15);
  }

  function step() {
    simClock += 0.03;
    if (isAutoPlaying) {
      reactionProgress += 0.005;
      if (reactionProgress > 1.0) reactionProgress = 0.0;
      const slider = container.querySelector("#slider-org-progress");
      if (slider) slider.value = Math.round(reactionProgress * 100);
      const lbl = container.querySelector("#lbl-org-progress");
      if (lbl) lbl.innerText = `${Math.round(reactionProgress * 100)}%`;
    }

    const hudStatus = container.querySelector("#hud-org-status");
    if (hudStatus) {
      if (reactionProgress < 0.25) hudStatus.innerText = "Reactants Colliding";
      else if (reactionProgress <= 0.70) hudStatus.innerText = "Transition State [‡]";
      else hudStatus.innerText = "Products Formed";
    }
  }

  let lastFrameTime = 0;
  let needsRedraw = true;

  function loop(now) {
    if (!isRunning) return;
    if (!container || !container.isConnected) {
      isRunning = false;
      if (animId) cancelAnimationFrame(animId);
      return;
    }

    const isSmart = (document.documentElement.getAttribute("data-mode") === "smartboard") ||
                    document.documentElement.classList.contains("fast-smartboard-mode") ||
                    /Android|MAXHUB/i.test(navigator.userAgent);
    const interval = isSmart ? 33.3 : 16.0;

    const orgPhotoOverlay = container.querySelector("#org-photo-overlay");
    const isPhotoOverlay = orgPhotoOverlay && orgPhotoOverlay.style.display === "block";

    if (!isPhotoOverlay) {
      if (isAutoPlaying) {
        if (!now || now - lastFrameTime >= interval) {
          lastFrameTime = now || performance.now();
          step();
          renderMolecularApparatus();
          renderEnergyChart();
        }
      } else if (needsRedraw) {
        step();
        renderMolecularApparatus();
        renderEnergyChart();
        needsRedraw = false;
      }
    }

    animId = requestAnimationFrame(loop);
  }

  // Event Listeners
  container.querySelector("#select-org-mech")?.addEventListener("change", (e) => {
    activeMechKey = e.target.value;
    reactionProgress = 0.0;
    const m = MECHANISMS[activeMechKey];
    container.querySelector("#hud-org-ea").innerText = `E_a = ${m.ea.toFixed(1)} kJ/mol`;
    container.querySelector("#info-org-ratelaw").innerText = m.rateLaw;
    container.querySelector("#info-org-deltah").innerText = `${m.deltaH.toFixed(1)} kJ/mol`;
    needsRedraw = true;
    SoundFX.playClick();
  });

  container.querySelector("#slider-org-progress")?.addEventListener("input", (e) => {
    reactionProgress = parseFloat(e.target.value) / 100;
    container.querySelector("#lbl-org-progress").innerText = `${e.target.value}%`;
    isAutoPlaying = false;
    const btn = container.querySelector("#btn-org-playpause");
    if (btn) btn.innerText = "▶ Resume Animation";
    needsRedraw = true;
  });

  container.querySelector("#slider-org-temp")?.addEventListener("input", (e) => {
    tempKelvin = parseInt(e.target.value, 10);
    container.querySelector("#lbl-org-temp").innerText = `${tempKelvin} K (${tempKelvin - 273}°C)`;
    needsRedraw = true;
  });

  container.querySelector("#btn-org-playpause")?.addEventListener("click", () => {
    isAutoPlaying = !isAutoPlaying;
    const btn = container.querySelector("#btn-org-playpause");
    if (btn) btn.innerText = isAutoPlaying ? "⏸ Pause Animation" : "▶ Resume Animation";
    needsRedraw = true;
    SoundFX.playClick();
  });

  container.querySelector("#btn-org-reset")?.addEventListener("click", () => {
    reactionProgress = 0.0;
    isAutoPlaying = true;
    initMolecules();
    const btn = container.querySelector("#btn-org-playpause");
    if (btn) btn.innerText = "⏸ Pause Animation";
    needsRedraw = true;
    SoundFX.playClick();
  });

  container.querySelector("#btn-org-export")?.addEventListener("click", () => {
    const m = MECHANISMS[activeMechKey];
    exportLabDataCsv({
      title: "Organic Reaction Mechanism & Energy Profile Telemetry",
      labId: "organic",
      parameters: {
        "Mechanism": m.name,
        "Substrate": m.substrate,
        "Nucleophile / Base": m.nucleophile,
        "Activation Energy Ea (kJ/mol)": m.ea,
        "Reaction Enthalpy ΔH° (kJ/mol)": m.deltaH,
        "Temperature T (K)": tempKelvin
      },
      headers: ["Coordinate Step", "Reaction Progress ξ", "Activation Barrier (kJ/mol)", "Phase Description"],
      dataRows: [
        [1, "0.00", "0.0", "Ground State Reactants"],
        [2, "0.25", (m.ea * 0.4).toFixed(1), "Bond Lengthening / Approach"],
        [3, "0.50", m.ea.toFixed(1), "High-Energy Transition State [‡]"],
        [4, "0.75", (m.ea * 0.3 + m.deltaH * 0.5).toFixed(1), "Leaving Group Departure"],
        [5, "1.00", m.deltaH.toFixed(1), "Relaxed Ground State Products"]
      ]
    });
  });

  // 4K Photo View Switcher
  const btnOrgSim = container.querySelector("#view-mode-org-sim");
  const btnOrgPhoto = container.querySelector("#view-mode-org-photo");
  const orgPhotoOverlay = container.querySelector("#org-photo-overlay");

  btnOrgSim?.addEventListener("click", () => {
    btnOrgSim.classList.add("active");
    btnOrgSim.style.background = "";
    btnOrgPhoto.classList.remove("active");
    btnOrgPhoto.style.background = "transparent";
    if (orgPhotoOverlay) orgPhotoOverlay.style.display = "none";
    SoundFX.playClick();
  });

  btnOrgPhoto?.addEventListener("click", () => {
    btnOrgPhoto.classList.add("active");
    btnOrgPhoto.style.background = "";
    btnOrgSim.classList.remove("active");
    btnOrgSim.style.background = "transparent";
    if (orgPhotoOverlay) orgPhotoOverlay.style.display = "block";
    SoundFX.playClick();
  });

  // Standardized Hotkey: 'e' or 'E' triggers CSV telemetry export
  const handleKeyDown = (e) => {
    if ((e.key === "e" || e.key === "E") && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      container.querySelector("#btn-org-export")?.click();
    }
  };
  window.addEventListener("keydown", handleKeyDown);

  // Mount Assessment
  mountLabCheckpoint("organic-checkpoint-container", "organic");

  // Launch
  loop();

  return () => {
    isRunning = false;
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("keydown", handleKeyDown);
  };
}
