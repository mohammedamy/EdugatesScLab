// Edugates-ClipSAT Science Labs - Physics: Linear Momentum & Collisions Suite
// 60 FPS Precision Air Track Workbench:
// Momentum Conservation Σp = m₁v₁ + m₂v₂ = const,
// Coefficient of Restitution e = (v₂' - v₁') / (v₁ - v₂),
// Kinetic Energy Partition KE = ½mv², Impulse J = Δp = ∫F dt,
// Dual Dual-Beam Photogate Precision Optoelectronic Timers.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initCollisionsLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return () => {};

  // Track & Glider Physical Constants
  const TRACK_LENGTH_M = 2.0; // 2.00 meter PASCO precision air track
  const FLAG_WIDTH_M = 0.05; // 5.0 cm optical flag for photogates
  const AIR_RESISTANCE = 0.0002; // ultra-low friction air cushion

  // State Variables
  let m1 = 0.25; // kg (Glider 1 mass)
  let m2 = 0.50; // kg (Glider 2 mass)
  let v1_init = 1.20; // m/s
  let v2_init = -0.60; // m/s
  let elasticity = 1.0; // e = 1.0 (elastic) to e = 0.0 (perfectly inelastic)
  let airBlowerOn = true;

  // Glider runtime coordinates (normalized 0 to 1 along track)
  let g1_x = 0.22; // 0..1
  let g2_x = 0.68;
  let g1_v = v1_init;
  let g2_v = v2_init;
  let g1_width = 0.12; // visual width fraction
  let g2_width = 0.14;

  let isRunning = false;
  let animId = null;
  let lastTime = performance.now();
  let simTime = 0;

  // Photogates setup (Positions along track)
  const photogate1 = { x: 0.32, active: false, timer: 0, lastSpeed: 0, beamBroken: false };
  const photogate2 = { x: 0.68, active: false, timer: 0, lastSpeed: 0, beamBroken: false };

  // Telemetry Log Store
  const collisionHistory = [];

  function calculateKinematics() {
    const p1 = m1 * g1_v;
    const p2 = m2 * g2_v;
    const p_total = p1 + p2;
    const ke1 = 0.5 * m1 * g1_v * g1_v;
    const ke2 = 0.5 * m2 * g2_v * g2_v;
    const ke_total = ke1 + ke2;
    return { p1, p2, p_total, ke1, ke2, ke_total };
  }

  function handleGliderCollision() {
    // 1D Collision with Coefficient of Restitution e
    // v1' = (m1*v1 + m2*v2 - m2*e*(v1 - v2)) / (m1 + m2)
    // v2' = (m1*v1 + m2*v2 + m1*e*(v1 - v2)) / (m1 + m2)
    const p_before = m1 * g1_v + m2 * g2_v;
    const ke_before = 0.5 * m1 * g1_v * g1_v + 0.5 * m2 * g2_v * g2_v;
    const u1 = g1_v;
    const u2 = g2_v;

    const totalMass = m1 + m2;
    const v1_new = (m1 * u1 + m2 * u2 - m2 * elasticity * (u1 - u2)) / totalMass;
    const v2_new = (m1 * u1 + m2 * u2 + m1 * elasticity * (u1 - u2)) / totalMass;

    g1_v = v1_new;
    g2_v = v2_new;

    const p_after = m1 * g1_v + m2 * g2_v;
    const ke_after = 0.5 * m1 * g1_v * g1_v + 0.5 * m2 * g2_v * g2_v;
    const deltaKePct = ke_before > 0 ? ((ke_before - ke_after) / ke_before) * 100 : 0;

    // Separate overlapping gliders
    const minCenterDist = (g1_width + g2_width) / 2;
    const currentDist = Math.abs(g2_x - g1_x);
    if (currentDist < minCenterDist) {
      const overlap = (minCenterDist - currentDist) / 2;
      g1_x -= overlap;
      g2_x += overlap;
    }

    // Audio chirp
    SoundFX.playBeep();

    // Log to collision history
    collisionHistory.unshift({
      time: simTime.toFixed(2),
      m1: m1.toFixed(2),
      m2: m2.toFixed(2),
      u1: u1.toFixed(2),
      u2: u2.toFixed(2),
      v1: v1_new.toFixed(2),
      v2: v2_new.toFixed(2),
      pTotal: p_before.toFixed(3),
      pAfter: p_after.toFixed(3),
      keLoss: deltaKePct.toFixed(1),
      elasticity: elasticity.toFixed(2)
    });

    if (collisionHistory.length > 8) collisionHistory.pop();
    updateTelemetryTable();
  }

  container.innerHTML = `
    <div class="lab-container" style="max-width: 1400px; margin: 0 auto; padding: 12px 16px;">
      <!-- Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #38bdf8; box-shadow: 0 0 10px #38bdf8;"></span>
            Linear Momentum &amp; Air Track Collisions Workbench
          </span>
          <span class="badge" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #7dd3fc; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            ${renderLatex("\\vec{p}_{\\text{sys}} = m_1\\vec{v}_1 + m_2\\vec{v}_2 = \\text{const} \\quad \\bullet \\quad e = -\\frac{v_{2f}-v_{1f}}{v_{2i}-v_{1i}}")}
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div class="btn-group" style="display: flex; border: 1px solid var(--border-color); border-radius: 6px; overflow: hidden;">
            <button id="btn-view-sim" class="btn btn-sm active" style="padding: 5px 12px; font-size: 0.8rem; border: none; border-radius: 0;">🔬 Air Track Simulator</button>
            <button id="btn-view-photo" class="btn btn-sm" style="padding: 5px 12px; font-size: 0.8rem; border: none; border-radius: 0; background: transparent;">📸 4K Real Bench</button>
          </div>
          <button id="btn-export-csv" class="btn btn-secondary btn-sm" style="padding: 5px 12px; font-size: 0.8rem;">📥 Export CSV (E)</button>
        </div>
      </div>

      <!-- Main Grid -->
      <div style="display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 16px; align-items: start;">
        
        <!-- Left: Simulation Canvas / 4K Photo Viewport -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div id="viewport-wrapper" style="position: relative; width: 100%; height: 490px; background: #090d16; border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; box-shadow: inset 0 0 40px rgba(0,0,0,0.8);">
            
            <!-- Canvas -->
            <canvas id="airtrack-canvas" width="940" height="490" style="display: block; width: 100%; height: 100%;"></canvas>

            <!-- 4K Real Lab Bench Photo Overlay (Hidden by default) -->
            <div id="photo-overlay" style="display: none; position: absolute; inset: 0; background: #020617;">
              <picture>
              <source srcset="assets/labs/collisions_bench.webp" type="image/webp">
              <img src="assets/labs/collisions_bench.jpg" decoding="async" loading="lazy" alt="Linear Momentum Air Track 4K Bench" style="width: 100%; height: 100%; object-fit: cover;" />
            </picture>
              <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(2,6,23,0.3) 0%, rgba(2,6,23,0.85) 100%); pointer-events: none;"></div>
              
              <!-- Bench Callout Badges -->
              <div style="position: absolute; top: 20px; left: 24px; background: rgba(15, 23, 42, 0.9); border: 1px solid #38bdf8; border-radius: 8px; padding: 12px 16px; backdrop-filter: blur(8px); max-width: 320px;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #38bdf8; letter-spacing: 0.05em; text-transform: uppercase;">Real Apparatus Specifications</div>
                <div style="font-size: 0.95rem; font-weight: 600; color: #f8fafc; margin-top: 4px;">PASCO 2.0m Precision Air Track &amp; Photogates</div>
                <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 6px; line-height: 1.4;">
                  Frictionless compressed air cushion with 1-millisecond infrared dual-beam photogate timer flags.
                </div>
              </div>

              <!-- Live Bench Telemetry Overlay -->
              <div style="position: absolute; bottom: 20px; left: 24px; right: 24px; background: rgba(15, 23, 42, 0.88); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px 20px; backdrop-filter: blur(10px); display: flex; justify-content: space-around; flex-wrap: wrap; gap: 16px;">
                <div>
                  <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase;">System Momentum Σp</div>
                  <div id="photo-p-sys" style="font-size: 1.15rem; font-weight: 700; color: #38bdf8; font-family: monospace;">+0.000 kg·m/s</div>
                </div>
                <div>
                  <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase;">Kinetic Energy KE</div>
                  <div id="photo-ke-sys" style="font-size: 1.15rem; font-weight: 700; color: #facc15; font-family: monospace;">0.000 J</div>
                </div>
                <div>
                  <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase;">Restitution e</div>
                  <div id="photo-restitution" style="font-size: 1.15rem; font-weight: 700; color: #10b981; font-family: monospace;">1.00 (Elastic)</div>
                </div>
                <div>
                  <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase;">Gate 1 Speed</div>
                  <div id="photo-g1-speed" style="font-size: 1.15rem; font-weight: 700; color: #38bdf8; font-family: monospace;">0.00 m/s</div>
                </div>
                <div>
                  <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase;">Gate 2 Speed</div>
                  <div id="photo-g2-speed" style="font-size: 1.15rem; font-weight: 700; color: #f43f5e; font-family: monospace;">0.00 m/s</div>
                </div>
              </div>
            </div>

            <!-- Photogate LCD Readouts floating on canvas top -->
            <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; pointer-events: none;">
              <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 6px; padding: 6px 12px; backdrop-filter: blur(4px); display: flex; align-items: center; gap: 8px;">
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #38bdf8; box-shadow: 0 0 6px #38bdf8;"></span>
                <span style="font-size: 0.75rem; color: #94a3b8; font-weight: 600;">PHOTOGATE 1 (x=0.64m):</span>
                <span id="lcd-gate-1" style="font-family: monospace; font-size: 0.85rem; font-weight: 700; color: #38bdf8;">READY (0.000 s)</span>
              </div>
              <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(244, 63, 94, 0.4); border-radius: 6px; padding: 6px 12px; backdrop-filter: blur(4px); display: flex; align-items: center; gap: 8px;">
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #f43f5e; box-shadow: 0 0 6px #f43f5e;"></span>
                <span style="font-size: 0.75rem; color: #94a3b8; font-weight: 600;">PHOTOGATE 2 (x=1.36m):</span>
                <span id="lcd-gate-2" style="font-family: monospace; font-size: 0.85rem; font-weight: 700; color: #f43f5e;">READY (0.000 s)</span>
              </div>
            </div>
          </div>

          <!-- Real-Time Collision Telemetry Log Table -->
          <div style="background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-size: 0.85rem; font-weight: 700; color: #f8fafc; text-transform: uppercase; letter-spacing: 0.05em;">
                📊 Impact Telemetry &amp; Vector Conservation Log
              </span>
              <span style="font-size: 0.75rem; color: #94a3b8;">Automatic Photogate Flag Recording</span>
            </div>
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; text-align: left; font-family: monospace;">
                <thead>
                  <tr style="border-bottom: 1px solid var(--border-color); color: #94a3b8;">
                    <th style="padding: 6px 8px;">Time</th>
                    <th style="padding: 6px 8px;">m₁ (kg)</th>
                    <th style="padding: 6px 8px;">m₂ (kg)</th>
                    <th style="padding: 6px 8px;">u₁ (m/s)</th>
                    <th style="padding: 6px 8px;">u₂ (m/s)</th>
                    <th style="padding: 6px 8px;">v₁ (m/s)</th>
                    <th style="padding: 6px 8px;">v₂ (m/s)</th>
                    <th style="padding: 6px 8px;">Σp_i (kg·m/s)</th>
                    <th style="padding: 6px 8px;">Σp_f (kg·m/s)</th>
                    <th style="padding: 6px 8px;">ΔKE (%)</th>
                  </tr>
                </thead>
                <tbody id="telemetry-table-body">
                  <tr>
                    <td colspan="10" style="padding: 12px; text-align: center; color: #64748b;">No collisions logged yet. Press ▶ Launch Gliders to initiate impact.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right: Physics Control Panel -->
        <div style="background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px; display: flex; flex-direction: column; gap: 18px;">
          
          <!-- Simulation Playback -->
          <div>
            <div style="display: flex; gap: 8px;">
              <button id="btn-play-pause" class="btn btn-primary btn-sm" style="flex: 1; padding: 8px 12px; font-weight: 600;">
                ▶ Launch Gliders
              </button>
              <button id="btn-reset" class="btn btn-secondary btn-sm" style="padding: 8px 12px;">
                🔄 Reset
              </button>
            </div>
          </div>

          <!-- Collision Elasticity Presets -->
          <div>
            <label style="font-size: 0.8rem; font-weight: 700; color: #cbd5e1; display: block; margin-bottom: 6px;">
              Collision Regime &amp; Restitution (e)
            </label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px;">
              <button id="preset-elastic" class="btn btn-sm" style="font-size: 0.75rem; background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; color: #38bdf8;">
                ⚡ Perfectly Elastic (e=1.0)
              </button>
              <button id="preset-inelastic" class="btn btn-sm" style="font-size: 0.75rem; background: rgba(100, 116, 139, 0.2); border: 1px solid var(--border-color); color: #94a3b8;">
                🧲 Inelastic Velcro (e=0.0)
              </button>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #94a3b8; margin-bottom: 2px;">
              <span>Restitution Coefficient e</span>
              <span id="lbl-elasticity" style="color: #38bdf8; font-weight: 700;">1.00</span>
            </div>
            <input type="range" id="slider-elasticity" min="0" max="1.0" step="0.05" value="1.0" style="width: 100%; accent-color: #38bdf8;" />
          </div>

          <!-- Glider 1 Controls (Blue) -->
          <div style="background: rgba(56, 189, 248, 0.05); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 8px; padding: 12px;">
            <div style="font-size: 0.8rem; font-weight: 700; color: #38bdf8; display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>🟦 Glider 1 (Left Cart)</span>
              <span id="badge-p1" style="font-family: monospace; font-size: 0.75rem;">p₁ = +0.30 kg·m/s</span>
            </div>
            <div style="margin-bottom: 10px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #94a3b8;">
                <span>Mass (m₁)</span>
                <span id="lbl-m1" style="color: #f8fafc; font-weight: 600;">0.25 kg</span>
              </div>
              <input type="range" id="slider-m1" min="0.10" max="1.00" step="0.05" value="0.25" style="width: 100%; accent-color: #38bdf8;" />
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #94a3b8;">
                <span>Initial Velocity (v₁)</span>
                <span id="lbl-v1" style="color: #f8fafc; font-weight: 600;">+1.20 m/s</span>
              </div>
              <input type="range" id="slider-v1" min="-2.00" max="2.00" step="0.10" value="1.20" style="width: 100%; accent-color: #38bdf8;" />
            </div>
          </div>

          <!-- Glider 2 Controls (Pink) -->
          <div style="background: rgba(244, 63, 94, 0.05); border: 1px solid rgba(244, 63, 94, 0.2); border-radius: 8px; padding: 12px;">
            <div style="font-size: 0.8rem; font-weight: 700; color: #f43f5e; display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>🟥 Glider 2 (Right Cart)</span>
              <span id="badge-p2" style="font-family: monospace; font-size: 0.75rem;">p₂ = -0.30 kg·m/s</span>
            </div>
            <div style="margin-bottom: 10px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #94a3b8;">
                <span>Mass (m₂)</span>
                <span id="lbl-m2" style="color: #f8fafc; font-weight: 600;">0.50 kg</span>
              </div>
              <input type="range" id="slider-m2" min="0.10" max="1.00" step="0.05" value="0.50" style="width: 100%; accent-color: #f43f5e;" />
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #94a3b8;">
                <span>Initial Velocity (v₂)</span>
                <span id="lbl-v2" style="color: #f8fafc; font-weight: 600;">-0.60 m/s</span>
              </div>
              <input type="range" id="slider-v2" min="-2.00" max="2.00" step="0.10" value="-0.60" style="width: 100%; accent-color: #f43f5e;" />
            </div>
          </div>

          <!-- Air Compressor Blower Toggle -->
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 14px;">
            <div>
              <div style="font-size: 0.8rem; font-weight: 600; color: #f8fafc;">Air Track Compressor</div>
              <div style="font-size: 0.72rem; color: #94a3b8;">Eliminates kinetic friction</div>
            </div>
            <label style="position: relative; display: inline-block; width: 40px; height: 22px;">
              <input type="checkbox" id="check-blower" checked style="opacity: 0; width: 0; height: 0;" />
              <span style="position: absolute; cursor: pointer; inset: 0; background: #38bdf8; border-radius: 22px; transition: 0.2s;" id="blower-track-span"></span>
            </label>
          </div>

          <!-- Lab Assessment Checkpoint Mount -->
          <div id="collisions-checkpoint-mount" style="margin-top: 6px;"></div>

        </div>
      </div>
    </div>
  `;

  // Elements
  const canvas = document.getElementById("airtrack-canvas");
  const ctx = canvas?.getContext("2d");
  const playBtn = document.getElementById("btn-play-pause");
  const resetBtn = document.getElementById("btn-reset");
  const exportBtn = document.getElementById("btn-export-csv");
  const viewSim = document.getElementById("btn-view-sim");
  const viewPhoto = document.getElementById("btn-view-photo");
  const photoOverlay = document.getElementById("photo-overlay");

  const sliderElasticity = document.getElementById("slider-elasticity");
  const sliderM1 = document.getElementById("slider-m1");
  const sliderM2 = document.getElementById("slider-m2");
  const sliderV1 = document.getElementById("slider-v1");
  const sliderV2 = document.getElementById("slider-v2");
  const checkBlower = document.getElementById("check-blower");

  const presetElastic = document.getElementById("preset-elastic");
  const presetInelastic = document.getElementById("preset-inelastic");

  const lblElasticity = document.getElementById("lbl-elasticity");
  const lblM1 = document.getElementById("lbl-m1");
  const lblM2 = document.getElementById("lbl-m2");
  const lblV1 = document.getElementById("lbl-v1");
  const lblV2 = document.getElementById("lbl-v2");

  const lcdGate1 = document.getElementById("lcd-gate-1");
  const lcdGate2 = document.getElementById("lcd-gate-2");
  const photoPSys = document.getElementById("photo-p-sys");
  const photoKeSys = document.getElementById("photo-ke-sys");
  const photoRestitution = document.getElementById("photo-restitution");
  const photoG1Speed = document.getElementById("photo-g1-speed");
  const photoG2Speed = document.getElementById("photo-g2-speed");
  const tableBody = document.getElementById("telemetry-table-body");

  function resetPositions() {
    g1_x = 0.22;
    g2_x = 0.68;
    g1_v = v1_init;
    g2_v = v2_init;
    simTime = 0;
    photogate1.timer = 0;
    photogate2.timer = 0;
    photogate1.beamBroken = false;
    photogate2.beamBroken = false;
    if (lcdGate1) lcdGate1.textContent = "READY (0.000 s)";
    if (lcdGate2) lcdGate2.textContent = "READY (0.000 s)";
  }

  function updateTelemetryTable() {
    if (!tableBody) return;
    if (collisionHistory.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="10" style="padding: 12px; text-align: center; color: #64748b;">No collisions logged yet. Press ▶ Launch Gliders to initiate impact.</td></tr>`;
      return;
    }
    tableBody.innerHTML = collisionHistory.map(row => `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); color: #e2e8f0;">
        <td style="padding: 6px 8px; color: #94a3b8;">${row.time}s</td>
        <td style="padding: 6px 8px; color: #38bdf8;">${row.m1}</td>
        <td style="padding: 6px 8px; color: #f43f5e;">${row.m2}</td>
        <td style="padding: 6px 8px;">${row.u1}</td>
        <td style="padding: 6px 8px;">${row.u2}</td>
        <td style="padding: 6px 8px; font-weight: 700; color: #38bdf8;">${row.v1}</td>
        <td style="padding: 6px 8px; font-weight: 700; color: #f43f5e;">${row.v2}</td>
        <td style="padding: 6px 8px; color: #facc15;">${row.pTotal}</td>
        <td style="padding: 6px 8px; color: #10b981; font-weight: 700;">${row.pAfter}</td>
        <td style="padding: 6px 8px; color: ${parseFloat(row.keLoss) > 5 ? '#f43f5e' : '#10b981'};">-${row.keLoss}%</td>
      </tr>
    `).join("");
  }

  function drawAirTrack() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Track Geometry
    const trackY = 220;
    const trackHeight = 44;
    const trackLeft = 50;
    const trackRight = canvas.width - 50;
    const trackWidth = trackRight - trackLeft;

    // 1. Background Grid & Lab Bench Top
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Heavy Aluminum Extrusion Air Track Bed
    const trackGrad = ctx.createLinearGradient(0, trackY, 0, trackY + trackHeight);
    trackGrad.addColorStop(0, "#475569");
    trackGrad.addColorStop(0.3, "#94a3b8");
    trackGrad.addColorStop(0.7, "#64748b");
    trackGrad.addColorStop(1, "#1e293b");

    ctx.fillStyle = trackGrad;
    ctx.fillRect(trackLeft, trackY, trackWidth, trackHeight);

    // Track Supports (Legs)
    ctx.fillStyle = "#334155";
    ctx.fillRect(trackLeft + 80, trackY + trackHeight, 24, 60);
    ctx.fillRect(trackRight - 104, trackY + trackHeight, 24, 60);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(trackLeft + 70, trackY + trackHeight + 50, 44, 10);
    ctx.fillRect(trackRight - 114, trackY + trackHeight + 50, 44, 10);

    // Air Holes & Millimeter Ruler on Track
    ctx.fillStyle = "#0f172a";
    ctx.strokeStyle = "#cbd5e1";
    for (let i = 0; i <= 40; i++) {
      const rx = trackLeft + (i / 40) * trackWidth;
      // Air hole
      ctx.beginPath();
      ctx.arc(rx, trackY + 12, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Air jet micro-eddies if blower is ON
      if (airBlowerOn && isRunning && Math.random() > 0.4) {
        ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
        ctx.beginPath();
        ctx.moveTo(rx, trackY + 8);
        ctx.lineTo(rx, trackY - 4 - Math.random() * 8);
        ctx.stroke();
      }

      // Metric ruler marks
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1;
      const isMajor = i % 5 === 0;
      ctx.beginPath();
      ctx.moveTo(rx, trackY + trackHeight);
      ctx.lineTo(rx, trackY + trackHeight - (isMajor ? 12 : 6));
      ctx.stroke();

      if (isMajor) {
        ctx.fillStyle = "#94a3b8";
        ctx.font = "9px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`${(i * 5)}cm`, rx, trackY + trackHeight - 14);
      }
    }

    // End Rebound Bumpers
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(trackLeft - 10, trackY - 14, 12, trackHeight + 20);
    ctx.fillRect(trackRight - 2, trackY - 14, 12, trackHeight + 20);

    // End Springs
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(trackLeft + 2, trackY + 16);
    ctx.lineTo(trackLeft + 12, trackY + 16);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(trackRight - 2, trackY + 16);
    ctx.lineTo(trackRight - 12, trackY + 16);
    ctx.stroke();

    // 2. Photogates (U-shaped optical sensors)
    const renderPhotogate = (gate, label, color) => {
      const gx = trackLeft + gate.x * trackWidth;
      // Photogate Post
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(gx - 6, trackY - 90, 12, 90);
      // Photogate Arch
      ctx.fillStyle = "#334155";
      ctx.fillRect(gx - 18, trackY - 90, 36, 14);
      ctx.fillRect(gx - 18, trackY - 90, 10, 48);
      ctx.fillRect(gx + 8, trackY - 90, 10, 48);

      // Laser Beam (infrared optical detection line)
      ctx.strokeStyle = gate.beamBroken ? "#ef4444" : "rgba(239, 68, 68, 0.4)";
      ctx.lineWidth = gate.beamBroken ? 2.5 : 1.2;
      ctx.beginPath();
      ctx.moveTo(gx - 8, trackY - 54);
      ctx.lineTo(gx + 8, trackY - 54);
      ctx.stroke();

      // Optical Sensor indicator LED
      ctx.fillStyle = gate.beamBroken ? "#ef4444" : "#22c55e";
      ctx.beginPath();
      ctx.arc(gx, trackY - 82, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = color;
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.fillText(label, gx, trackY - 98);
    };

    renderPhotogate(photogate1, "PHOTOGATE 1", "#38bdf8");
    renderPhotogate(photogate2, "PHOTOGATE 2", "#f43f5e");

    // 3. Gliders
    const g1_pixel_x = trackLeft + g1_x * trackWidth;
    const g2_pixel_x = trackLeft + g2_x * trackWidth;
    const g1_pixel_w = g1_width * trackWidth;
    const g2_pixel_w = g2_width * trackWidth;

    const renderGlider = (gx, gw, mass, vel, color, label) => {
      const topY = trackY - 32;
      const height = 30;

      // Cart Body (aerodynamic inverted V-shaped slider)
      const cartGrad = ctx.createLinearGradient(gx - gw / 2, topY, gx + gw / 2, topY + height);
      cartGrad.addColorStop(0, color);
      cartGrad.addColorStop(0.7, "#0f172a");

      ctx.fillStyle = cartGrad;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(gx - gw / 2, topY, gw, height, 4);
      ctx.fill();
      ctx.stroke();

      // Optical Timer Flag (black aluminium fin on top)
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(gx - 15, topY - 32, 30, 32);
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1;
      ctx.strokeRect(gx - 15, topY - 32, 30, 32);

      // Mass weights plates loaded on cart
      const plates = Math.round(mass / 0.1);
      ctx.fillStyle = "#e2e8f0";
      for (let p = 0; p < Math.min(plates, 5); p++) {
        ctx.fillRect(gx - gw / 2 + 8 + p * 8, topY + 6, 5, 18);
      }

      // Glider Bumper Springs / Velcro
      ctx.strokeStyle = elasticity > 0.5 ? "#facc15" : "#64748b";
      ctx.lineWidth = 2;
      // Front & rear bumper loops
      ctx.beginPath();
      ctx.arc(gx + gw / 2 + 4, topY + 16, 5, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(gx - gw / 2 - 4, topY + 16, 5, Math.PI / 2, (3 * Math.PI) / 2);
      ctx.stroke();

      // Velocity Vector Arrow
      if (Math.abs(vel) > 0.05) {
        const arrowLen = vel * 36;
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(gx, topY - 42);
        ctx.lineTo(gx + arrowLen, topY - 42);
        ctx.stroke();
        // Arrow head
        ctx.fillStyle = "#38bdf8";
        const sign = Math.sign(arrowLen);
        ctx.beginPath();
        ctx.moveTo(gx + arrowLen + sign * 6, topY - 42);
        ctx.lineTo(gx + arrowLen, topY - 46);
        ctx.lineTo(gx + arrowLen, topY - 38);
        ctx.closePath();
        ctx.fill();

        ctx.font = "bold 10px monospace";
        ctx.fillStyle = "#f8fafc";
        ctx.textAlign = "center";
        ctx.fillText(`v = ${vel > 0 ? "+" : ""}${vel.toFixed(2)} m/s`, gx, topY - 50);
      }

      // Mass Label
      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${label} (${mass.toFixed(2)}kg)`, gx, topY + 20);
    };

    renderGlider(g1_pixel_x, g1_pixel_w, m1, g1_v, "#38bdf8", "m₁");
    renderGlider(g2_pixel_x, g2_pixel_w, m2, g2_v, "#f43f5e", "m₂");

    // 4. Vector Momentum & Kinetic Energy HUD Bar Charts
    const hudY = 360;
    ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(trackLeft, hudY, trackWidth, 110, 8);
    ctx.fill();
    ctx.stroke();

    const { p1, p2, p_total, ke1, ke2, ke_total } = calculateKinematics();

    // Momentum Vectors
    ctx.font = "bold 11px sans-serif";
    ctx.fillStyle = "#cbd5e1";
    ctx.textAlign = "left";
    ctx.fillText("MOMENTUM CONSERVATION MONITOR (kg·m/s)", trackLeft + 16, hudY + 22);

    const midX = trackLeft + trackWidth * 0.32;
    const barScale = 120; // pixels per kg·m/s

    // Center Zero line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.beginPath();
    ctx.moveTo(midX, hudY + 30);
    ctx.lineTo(midX, hudY + 95);
    ctx.stroke();

    // p1 bar
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(p1 >= 0 ? midX : midX + p1 * barScale, hudY + 34, Math.abs(p1) * barScale, 12);
    ctx.font = "10px monospace";
    ctx.fillText(`p₁: ${p1 > 0 ? "+" : ""}${p1.toFixed(3)}`, trackLeft + 16, hudY + 44);

    // p2 bar
    ctx.fillStyle = "#f43f5e";
    ctx.fillRect(p2 >= 0 ? midX : midX + p2 * barScale, hudY + 54, Math.abs(p2) * barScale, 12);
    ctx.fillText(`p₂: ${p2 > 0 ? "+" : ""}${p2.toFixed(3)}`, trackLeft + 16, hudY + 64);

    // p_total bar
    ctx.fillStyle = "#10b981";
    ctx.fillRect(p_total >= 0 ? midX : midX + p_total * barScale, hudY + 74, Math.abs(p_total) * barScale, 14);
    ctx.font = "bold 10px monospace";
    ctx.fillText(`Σp: ${p_total > 0 ? "+" : ""}${p_total.toFixed(3)}`, trackLeft + 16, hudY + 86);

    // Right side: Kinetic Energy Breakdown
    const keLeft = trackLeft + trackWidth * 0.65;
    ctx.font = "bold 11px sans-serif";
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText("KINETIC ENERGY (JOULES)", keLeft, hudY + 22);

    ctx.font = "10px monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText(`KE₁: ${ke1.toFixed(3)} J`, keLeft, hudY + 44);
    ctx.fillStyle = "#f43f5e";
    ctx.fillText(`KE₂: ${ke2.toFixed(3)} J`, keLeft, hudY + 64);
    ctx.fillStyle = "#facc15";
    ctx.font = "bold 11px monospace";
    ctx.fillText(`Total KE: ${ke_total.toFixed(3)} J`, keLeft, hudY + 86);
  }

  function checkPhotogates(dt) {
    const trackWidth = canvas.width - 100;
    const flagWidthNorm = FLAG_WIDTH_M / TRACK_LENGTH_M;

    // Check Gate 1
    const g1InGate1 = Math.abs(g1_x - photogate1.x) < flagWidthNorm / 2;
    const g2InGate1 = Math.abs(g2_x - photogate1.x) < flagWidthNorm / 2;
    if (g1InGate1 || g2InGate1) {
      photogate1.beamBroken = true;
      photogate1.timer += dt;
      const speed = Math.abs(g1InGate1 ? g1_v : g2_v);
      photogate1.lastSpeed = speed;
      if (lcdGate1) {
        lcdGate1.textContent = `BLOCK (${photogate1.timer.toFixed(3)} s | ${speed.toFixed(2)} m/s)`;
        lcdGate1.style.color = "#facc15";
      }
    } else if (photogate1.beamBroken) {
      photogate1.beamBroken = false;
      if (lcdGate1) {
        lcdGate1.textContent = `Δt = ${photogate1.timer.toFixed(3)} s (${photogate1.lastSpeed.toFixed(2)} m/s)`;
        lcdGate1.style.color = "#38bdf8";
      }
    }

    // Check Gate 2
    const g1InGate2 = Math.abs(g1_x - photogate2.x) < flagWidthNorm / 2;
    const g2InGate2 = Math.abs(g2_x - photogate2.x) < flagWidthNorm / 2;
    if (g1InGate2 || g2InGate2) {
      photogate2.beamBroken = true;
      photogate2.timer += dt;
      const speed = Math.abs(g1InGate2 ? g1_v : g2_v);
      photogate2.lastSpeed = speed;
      if (lcdGate2) {
        lcdGate2.textContent = `BLOCK (${photogate2.timer.toFixed(3)} s | ${speed.toFixed(2)} m/s)`;
        lcdGate2.style.color = "#facc15";
      }
    } else if (photogate2.beamBroken) {
      photogate2.beamBroken = false;
      if (lcdGate2) {
        lcdGate2.textContent = `Δt = ${photogate2.timer.toFixed(3)} s (${photogate2.lastSpeed.toFixed(2)} m/s)`;
        lcdGate2.style.color = "#f43f5e";
      }
    }
  }

  function loop(timestamp) {
    if (!container || !container.isConnected) {
      isRunning = false;
      if (animId) cancelAnimationFrame(animId);
      return;
    }
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;

    if (isRunning) {
      simTime += dt;

      // Friction
      const frictionDecel = airBlowerOn ? AIR_RESISTANCE : 0.08;
      g1_v -= Math.sign(g1_v) * frictionDecel * dt;
      g2_v -= Math.sign(g2_v) * frictionDecel * dt;
      if (Math.abs(g1_v) < 0.005) g1_v = 0;
      if (Math.abs(g2_v) < 0.005) g2_v = 0;

      // Update positions along normalized 0..1 track
      const dx1 = (g1_v / TRACK_LENGTH_M) * dt;
      const dx2 = (g2_v / TRACK_LENGTH_M) * dt;
      g1_x += dx1;
      g2_x += dx2;

      // End bumper rebound (Elastic bounce off ends)
      const leftBound1 = g1_width / 2;
      const rightBound2 = 1.0 - g2_width / 2;

      if (g1_x <= leftBound1 && g1_v < 0) {
        g1_x = leftBound1;
        g1_v = -g1_v * 0.98; // slight restitution loss on track end
        SoundFX.playClick();
      }
      if (g2_x >= rightBound2 && g2_v > 0) {
        g2_x = rightBound2;
        g2_v = -g2_v * 0.98;
        SoundFX.playClick();
      }

      // Check collision between gliders
      const centerDist = g2_x - g1_x;
      const minDist = (g1_width + g2_width) / 2;

      if (centerDist <= minDist) {
        // Impact occurs if moving toward each other
        if (g1_v > g2_v) {
          handleGliderCollision();
        }
      }

      checkPhotogates(dt);

      // Update Real Bench photo HUD
      const { p_total, ke_total } = calculateKinematics();
      if (photoPSys) photoPSys.textContent = `${p_total >= 0 ? "+" : ""}${p_total.toFixed(3)} kg·m/s`;
      if (photoKeSys) photoKeSys.textContent = `${ke_total.toFixed(3)} J`;
      if (photoG1Speed) photoG1Speed.textContent = `${Math.abs(g1_v).toFixed(2)} m/s`;
      if (photoG2Speed) photoG2Speed.textContent = `${Math.abs(g2_v).toFixed(2)} m/s`;
    }

    drawAirTrack();
    animId = requestAnimationFrame(loop);
  }

  // Event Listeners
  playBtn?.addEventListener("click", () => {
    isRunning = !isRunning;
    if (isRunning) {
      lastTime = performance.now();
      playBtn.textContent = "⏸ Pause";
      playBtn.className = "btn btn-secondary btn-sm";
    } else {
      playBtn.textContent = "▶ Resume";
      playBtn.className = "btn btn-primary btn-sm";
    }
  });

  resetBtn?.addEventListener("click", () => {
    isRunning = false;
    resetPositions();
    if (playBtn) {
      playBtn.textContent = "▶ Launch Gliders";
      playBtn.className = "btn btn-primary btn-sm";
    }
    drawAirTrack();
  });

  sliderM1?.addEventListener("input", (e) => {
    m1 = parseFloat(e.target.value);
    if (lblM1) lblM1.textContent = `${m1.toFixed(2)} kg`;
    const b1 = document.getElementById("badge-p1");
    if (b1) b1.textContent = `p₁ = ${(m1 * g1_v >= 0 ? "+" : "")}${(m1 * g1_v).toFixed(2)} kg·m/s`;
    drawAirTrack();
  });

  sliderM2?.addEventListener("input", (e) => {
    m2 = parseFloat(e.target.value);
    if (lblM2) lblM2.textContent = `${m2.toFixed(2)} kg`;
    const b2 = document.getElementById("badge-p2");
    if (b2) b2.textContent = `p₂ = ${(m2 * g2_v >= 0 ? "+" : "")}${(m2 * g2_v).toFixed(2)} kg·m/s`;
    drawAirTrack();
  });

  sliderV1?.addEventListener("input", (e) => {
    v1_init = parseFloat(e.target.value);
    if (lblV1) lblV1.textContent = `${v1_init >= 0 ? "+" : ""}${v1_init.toFixed(2)} m/s`;
    if (!isRunning) g1_v = v1_init;
    drawAirTrack();
  });

  sliderV2?.addEventListener("input", (e) => {
    v2_init = parseFloat(e.target.value);
    if (lblV2) lblV2.textContent = `${v2_init >= 0 ? "+" : ""}${v2_init.toFixed(2)} m/s`;
    if (!isRunning) g2_v = v2_init;
    drawAirTrack();
  });

  sliderElasticity?.addEventListener("input", (e) => {
    elasticity = parseFloat(e.target.value);
    if (lblElasticity) lblElasticity.textContent = elasticity.toFixed(2);
    if (photoRestitution) {
      photoRestitution.textContent = elasticity >= 0.99 ? "1.00 (Elastic)" : (elasticity <= 0.01 ? "0.00 (Inelastic)" : `${elasticity.toFixed(2)} (Partial)`);
    }
  });

  presetElastic?.addEventListener("click", () => {
    elasticity = 1.0;
    if (sliderElasticity) sliderElasticity.value = 1.0;
    if (lblElasticity) lblElasticity.textContent = "1.00";
    if (photoRestitution) photoRestitution.textContent = "1.00 (Elastic)";
    presetElastic.style.background = "rgba(56, 189, 248, 0.15)";
    presetElastic.style.borderColor = "#38bdf8";
    presetElastic.style.color = "#38bdf8";
    presetInelastic.style.background = "rgba(100, 116, 139, 0.2)";
    presetInelastic.style.borderColor = "var(--border-color)";
    presetInelastic.style.color = "#94a3b8";
  });

  presetInelastic?.addEventListener("click", () => {
    elasticity = 0.0;
    if (sliderElasticity) sliderElasticity.value = 0.0;
    if (lblElasticity) lblElasticity.textContent = "0.00";
    if (photoRestitution) photoRestitution.textContent = "0.00 (Inelastic)";
    presetInelastic.style.background = "rgba(244, 63, 94, 0.15)";
    presetInelastic.style.borderColor = "#f43f5e";
    presetInelastic.style.color = "#f43f5e";
    presetElastic.style.background = "rgba(100, 116, 139, 0.2)";
    presetElastic.style.borderColor = "var(--border-color)";
    presetElastic.style.color = "#94a3b8";
  });

  checkBlower?.addEventListener("change", (e) => {
    airBlowerOn = e.target.checked;
    const span = document.getElementById("blower-track-span");
    if (span) span.style.background = airBlowerOn ? "#38bdf8" : "#475569";
    SoundFX.playClick();
  });

  // Dual View Mode Switcher
  viewSim?.addEventListener("click", () => {
    viewSim.classList.add("active");
    viewPhoto.classList.remove("active");
    viewSim.style.background = "";
    viewPhoto.style.background = "transparent";
    if (photoOverlay) photoOverlay.style.display = "none";
  });

  viewPhoto?.addEventListener("click", () => {
    viewPhoto.classList.add("active");
    viewSim.classList.remove("active");
    viewPhoto.style.background = "";
    viewSim.style.background = "transparent";
    if (photoOverlay) photoOverlay.style.display = "block";
  });

  exportBtn?.addEventListener("click", () => {
    const dataRows = collisionHistory.length > 0
      ? collisionHistory.map(row => [
          row.time,
          row.m1,
          row.m2,
          row.u1,
          row.u2,
          row.v1,
          row.v2,
          row.pTotal,
          row.pAfter,
          row.keLoss,
          row.elasticity
        ])
      : [
          [simTime.toFixed(2), m1.toFixed(2), m2.toFixed(2), g1_v.toFixed(2), g2_v.toFixed(2), g1_v.toFixed(2), g2_v.toFixed(2), (m1 * g1_v + m2 * g2_v).toFixed(3), (m1 * g1_v + m2 * g2_v).toFixed(3), "0.0", elasticity.toFixed(2)]
        ];

    exportLabDataCsv({
      title: "Linear Momentum and Air Track Collisions",
      labId: "collisions",
      parameters: {
        "Glider 1 Mass (kg)": `${m1.toFixed(2)} kg`,
        "Glider 2 Mass (kg)": `${m2.toFixed(2)} kg`,
        "Coefficient of Restitution (e)": elasticity.toFixed(2),
        "Air Cushion State": airBlowerOn ? "Air Cushion Active (Zero Friction)" : "Blower Off (High Friction)"
      },
      headers: [
        "Time (s)",
        "Mass 1 (kg)",
        "Mass 2 (kg)",
        "Initial Velocity 1 (m/s)",
        "Initial Velocity 2 (m/s)",
        "Final Velocity 1 (m/s)",
        "Final Velocity 2 (m/s)",
        "Total Initial Momentum (kg·m/s)",
        "Total Final Momentum (kg·m/s)",
        "Kinetic Energy Loss (%)",
        "Coefficient of Restitution (e)"
      ],
      dataRows
    });
  });

  // Standardized Hotkey: 'e' or 'E' triggers CSV telemetry export
  const handleKeyDown = (e) => {
    if ((e.key === "e" || e.key === "E") && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      exportBtn?.click();
    }
  };
  window.addEventListener("keydown", handleKeyDown);

  // Checkpoint Quiz
  mountLabCheckpoint("collisions-checkpoint-mount", "phys-collisions");

  // Initial draw and run loop
  resetPositions();
  drawAirTrack();
  animId = requestAnimationFrame(loop);

  return () => {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("keydown", handleKeyDown);
  };
}
