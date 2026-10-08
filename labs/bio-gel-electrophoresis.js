// Edugates-ClipSAT Science Labs - Biology: Agarose Gel Electrophoresis Suite
// 60 FPS Precision Nucleic Acid Molecular Sieving Simulation:
// Electric Field E = V/d, DNA Anode Migration, Agarose Sieve Concentration (0.7% - 2.0%),
// 1 kb Molecular Weight Ladder, Restriction Fragment Digests, UV Transillumination, and Semilog Calibration Curve.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initGelElectrophoresisLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Standard DNA Ladder (base pairs and reference migration weights)
  const LADDER_BANDS = [
    { bp: 10000, label: "10 kb", bright: false },
    { bp: 8000, label: "8 kb", bright: false },
    { bp: 6000, label: "6 kb", bright: false },
    { bp: 5000, label: "5 kb", bright: true }, // reference intensity band
    { bp: 4000, label: "4 kb", bright: false },
    { bp: 3000, label: "3 kb", bright: false },
    { bp: 2000, label: "2 kb", bright: false },
    { bp: 1500, label: "1.5 kb", bright: false },
    { bp: 1000, label: "1.0 kb", bright: true }, // reference intensity band
    { bp: 500, label: "500 bp", bright: false },
    { bp: 250, label: "250 bp", bright: false }
  ];

  // Lanes Definition
  const LANES = [
    { id: 1, name: "1 kb DNA Ladder", bands: [10000, 8000, 6000, 5000, 4000, 3000, 2000, 1500, 1000, 500, 250] },
    { id: 2, name: "Undigested Plasmid", bands: [8500, 4500] }, // nicked circular & supercoiled
    { id: 3, name: "EcoRI Digest", bands: [4800, 2200] },
    { id: 4, name: "HindIII Digest", bands: [5200, 1800] },
    { id: 5, name: "PCR Amplicon", bands: [750] }
  ];

  // State
  let voltage = 100; // Volts (50 to 150V)
  let agarosePercent = 1.0; // % (0.7, 1.0, 1.5, 2.0)
  let isElectrophoresisRunning = false;
  let runTimeMinutes = 0.0;
  let uvLightEnabled = false;
  let isRunning = true;
  let animId = null;

  // Dye Front tracking particles (Bromophenol Blue & Xylene Cyanol)
  let dyeFrontDistance = 0.0; // mm

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #10b981; box-shadow: 0 0 10px #10b981;"></span>
            Agarose Gel Electrophoresis Suite
          </span>
          <span class="badge" style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            ${renderLatex("D \\propto \\frac{1}{\\log_{10}(\\text{bp})} \\quad \\bullet \\quad E = V/d \\quad \\bullet \\quad \\text{Anode (+)}")}
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-gel-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🔬 Gel Simulator
            </button>
            <button id="view-mode-gel-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-gel-power" style="padding: 5px 14px; font-size: 0.78rem;">
            ⚡ Start Power Supply
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-gel-uv" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(168, 85, 247, 0.4); color: #c084fc;">
            💡 UV Transilluminator
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-gel-reset" style="padding: 5px 12px; font-size: 0.78rem;">
            ⟲ Cast Fresh Gel
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-gel-export" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export Telemetry
          </button>
        </div>
      </div>

      <!-- Main Layout -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="gel-layout">
        <!-- Canvas Viewport -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(16, 185, 129, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: #030712; border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="gel-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
          <div id="gel-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <img src="assets/labs/electrophoresis_bench.jpg" alt="4K Agarose Gel Electrophoresis Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            
            <!-- Live Analytical Telemetry Callout on Photo -->
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Submarine Agarose Tank</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">1X TAE Buffer with Platinum Leads</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">High-Voltage Power Supply</div>
                <div style="color: #facc15; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Bio-Rad Constant 100V / 85mA</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Blue LED Transilluminator</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Fluorescent GelGreen DNA Ladder</div>
              </div>
            </div>
          </div>

          <!-- Top HUD -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">POWER SUPPLY &amp; TIMER</div>
              <div id="hud-gel-timer" style="font-size: 1.15rem; font-weight: 800; color: #34d399; font-family: var(--font-mono);">
                0.0 min • 100 V (0 mA)
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">OPTICAL MODE</div>
              <div id="hud-gel-mode" style="font-size: 1.15rem; font-weight: 800; color: #c084fc; font-family: var(--font-mono);">
                Visible Light (Dye Front)
              </div>
            </div>
          </div>
        </div>

        <!-- Controls & Calibration Curve -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Controls Panel -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #34d399; text-transform: uppercase; margin-bottom: 12px;">Electrophoresis Rig Controls</div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div>
                <label style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Agarose Gel Concentration</label>
                <select id="select-gel-agarose" class="form-control" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                  <option value="0.7">0.7% (1 kb - 20 kb Large DNA)</option>
                  <option value="1.0" selected>1.0% (500 bp - 10 kb Standard)</option>
                  <option value="1.5">1.5% (200 bp - 4 kb Small DNA)</option>
                  <option value="2.0">2.0% (100 bp - 1 kb Resolution)</option>
                </select>
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                  <span style="color: #94a3b8;">DC Voltage (V)</span>
                  <span id="lbl-gel-voltage" style="font-weight: 700; color: #38bdf8; font-family: var(--font-mono);">100 V</span>
                </div>
                <input type="range" id="slider-gel-voltage" min="50" max="150" step="5" value="100" style="width: 100%; accent-color: #38bdf8;">
              </div>
            </div>

            <!-- Buffer & Electrodes Info -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; background: rgba(0,0,0,0.3); border-radius: 8px; padding: 8px 10px; font-size: 0.75rem; text-align: center;">
              <div>
                <span style="color: #64748b; display: block;">Running Buffer</span>
                <span style="font-weight: 700; color: #38bdf8; font-family: var(--font-mono);">1× TAE (pH 8.3)</span>
              </div>
              <div>
                <span style="color: #64748b; display: block;">Cathode (-)</span>
                <span style="font-weight: 700; color: #f43f5e; font-family: var(--font-mono);">Top (Wells)</span>
              </div>
              <div>
                <span style="color: #64748b; display: block;">Anode (+)</span>
                <span style="font-weight: 700; color: #10b981; font-family: var(--font-mono);">Bottom</span>
              </div>
            </div>
          </div>

          <!-- Semilog Standard Curve -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; flex: 1; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">
                Semilog Standard Calibration Curve
              </span>
              <span style="font-size: 0.72rem; color: #34d399; font-family: var(--font-mono);">
                log₁₀(bp) vs Migration Distance
              </span>
            </div>
            <div style="position: relative; flex: 1; min-height: 180px;">
              <canvas id="gel-chart-canvas" width="460" height="180" style="width: 100%; height: 180px; display: block; border-radius: 6px;"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Assessment Checkpoint Container -->
      <div id="electrophoresis-checkpoint-container" style="margin-top: 24px;"></div>
    </div>
  `;

  const canvas = container.querySelector("#gel-canvas");
  const ctx = canvas.getContext("2d");
  const chartCanvas = container.querySelector("#gel-chart-canvas");
  const chartCtx = chartCanvas.getContext("2d");

  // Calculate migration distance for a given base pair size
  function getBandDistance(bp) {
    // Distance inversely proportional to log10(bp), scaled by voltage, time, and agarose pore size
    const logVal = Math.log10(bp); // 2.0 to 4.0
    // At log=4.0 (10 kb), slow migration. At log=2.4 (250 bp), fast migration.
    const poreFactor = 1.0 / (agarosePercent * 0.85);
    const speed = (voltage / 100.0) * poreFactor * (4.4 - logVal);
    return Math.max(0, speed * runTimeMinutes * 3.5);
  }

  function drawElectrophoresisRig() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (uvLightEnabled) {
      // Dark UV transilluminator background
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const uvGlow = ctx.createRadialGradient(290, 270, 50, 290, 270, 260);
      uvGlow.addColorStop(0, "rgba(168, 85, 247, 0.22)");
      uvGlow.addColorStop(1, "rgba(2, 6, 23, 0.95)");
      ctx.fillStyle = uvGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      // Normal laboratory rig with buffer tank
      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Buffer Tank Body
      ctx.fillStyle = "rgba(30, 41, 59, 0.6)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(70, 80, 440, 410, 12);
      ctx.fill();
      ctx.stroke();

      // Buffer solution (TAE)
      ctx.fillStyle = "rgba(56, 189, 248, 0.12)";
      ctx.fillRect(75, 85, 430, 400);

      // Platinum wire electrodes: Cathode (-) Black top, Anode (+) Red bottom
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(85, 95);
      ctx.lineTo(495, 95);
      ctx.stroke();

      ctx.strokeStyle = "#f43f5e";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(85, 475);
      ctx.lineTo(495, 475);
      ctx.stroke();

      // Bubbles at electrodes when running (H2 at cathode, O2 at anode)
      if (isElectrophoresisRunning) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        for (let i = 0; i < 15; i++) {
          const bx1 = 100 + i * 26 + (Math.random() - 0.5) * 6;
          const by1 = 95 - Math.random() * 8;
          ctx.beginPath();
          ctx.arc(bx1, by1, 1.5 + Math.random(), 0, Math.PI * 2);
          ctx.fill();

          const bx2 = 100 + i * 26 + (Math.random() - 0.5) * 6;
          const by2 = 475 - Math.random() * 8;
          ctx.beginPath();
          ctx.arc(bx2, by2, 1.5 + Math.random(), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Agarose Gel Slab (Translucent polymer matrix)
    const gelX = 110;
    const gelY = 120;
    const gelW = 360;
    const gelH = 330;

    ctx.fillStyle = uvLightEnabled ? "rgba(15, 23, 42, 0.95)" : "rgba(241, 245, 249, 0.12)";
    ctx.strokeStyle = uvLightEnabled ? "rgba(168, 85, 247, 0.5)" : "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(gelX, gelY, gelW, gelH, 6);
    ctx.fill();
    ctx.stroke();

    // 5 Loading Wells
    const wellWidth = 42;
    const wellHeight = 12;
    const wellY = gelY + 20;

    LANES.forEach((lane, idx) => {
      const wellX = gelX + 35 + idx * 62;

      // Draw Well indentation
      ctx.fillStyle = uvLightEnabled ? "#030712" : "#0f172a";
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(wellX, wellY, wellWidth, wellHeight, 3);
      ctx.fill();
      ctx.stroke();

      // Lane Label above
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 9px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(`Lane ${lane.id}`, wellX + wellWidth / 2, wellY - 6);

      // Draw Migrating DNA Bands in this lane
      lane.bands.forEach(bp => {
        const dist = getBandDistance(bp);
        const bandY = wellY + wellHeight + dist;

        if (bandY < gelY + gelH - 10) {
          if (uvLightEnabled) {
            // Fluorescent glowing Ethidium Bromide / GelGreen bands!
            const isRef = bp === 5000 || bp === 1000;
            ctx.shadowColor = "#34d399";
            ctx.shadowBlur = isRef ? 14 : 9;
            ctx.fillStyle = isRef ? "#ecfdf5" : "#34d399";
            ctx.fillRect(wellX + 2, bandY, wellWidth - 4, 3.5);
            ctx.shadowBlur = 0;

            // Base pair size label if ladder
            if (lane.id === 1 && dist > 15) {
              ctx.fillStyle = "#a7f3d0";
              ctx.font = "8px var(--font-mono, monospace)";
              ctx.textAlign = "right";
              ctx.fillText(`${bp >= 1000 ? (bp / 1000).toFixed(1) + "k" : bp}`, wellX - 4, bandY + 3);
            }
          } else {
            // Invisible under normal light, but tracking dye visible
          }
        }
      });

      // If Visible Light Mode, draw Bromophenol Blue / Xylene Cyanol tracking dye fronts
      if (!uvLightEnabled && isElectrophoresisRunning) {
        const dyeY1 = wellY + wellHeight + dyeFrontDistance * 0.9;
        const dyeY2 = wellY + wellHeight + dyeFrontDistance * 0.45;

        if (dyeY1 < gelY + gelH - 10) {
          // Bromophenol Blue (Fast front ~300 bp equivalent)
          ctx.fillStyle = "rgba(37, 99, 235, 0.45)";
          ctx.fillRect(wellX + 2, dyeY1, wellWidth - 4, 8);
        }
        if (dyeY2 < gelY + gelH - 10) {
          // Xylene Cyanol (Slow front ~4000 bp equivalent)
          ctx.fillStyle = "rgba(6, 182, 212, 0.35)";
          ctx.fillRect(wellX + 2, dyeY2, wellWidth - 4, 8);
        }
      }
    });

    // Anode and Cathode Indicator Marks
    ctx.fillStyle = "#f43f5e";
    ctx.font = "bold 13px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("(-) Cathode", canvas.width / 2, 60);

    ctx.fillStyle = "#10b981";
    ctx.fillText("(+) Anode", canvas.width / 2, 510);
  }

  function drawSemilogChart() {
    chartCtx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);

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
    for (let y = 15; y < chartCanvas.height - 25; y += 30) {
      chartCtx.beginPath();
      chartCtx.moveTo(40, y);
      chartCtx.lineTo(chartCanvas.width - 15, y);
      chartCtx.stroke();
    }

    // Axes
    chartCtx.strokeStyle = "#475569";
    chartCtx.lineWidth = 1.5;
    chartCtx.beginPath();
    chartCtx.moveTo(40, 10);
    chartCtx.lineTo(40, chartCanvas.height - 25);
    chartCtx.lineTo(chartCanvas.width - 15, chartCanvas.height - 25);
    chartCtx.stroke();

    // Axis Labels
    chartCtx.fillStyle = "#94a3b8";
    chartCtx.font = "10px var(--font-mono, monospace)";
    chartCtx.textAlign = "center";
    chartCtx.fillText("Migration Distance (mm)", chartCanvas.width / 2, chartCanvas.height - 6);

    chartCtx.save();
    chartCtx.translate(18, chartCanvas.height / 2);
    chartCtx.rotate(-Math.PI / 2);
    chartCtx.fillText("log₁₀(bp)", 0, 0);
    chartCtx.restore();

    // Calibration Line
    chartCtx.beginPath();
    chartCtx.strokeStyle = "#34d399";
    chartCtx.lineWidth = 2;

    const ladderLane = LANES[0];
    const points = ladderLane.bands.map(bp => {
      const dist = getBandDistance(bp);
      const logBp = Math.log10(bp);
      // Map dist (0 to 280) to x (50 to chartCanvas.width - 30)
      const px = 50 + (dist / 280) * (chartCanvas.width - 80);
      // Map logBp (2.3 to 4.1) to y (chartCanvas.height - 35 to 20)
      const py = (chartCanvas.height - 35) - ((logBp - 2.2) / 2.0) * (chartCanvas.height - 60);
      return { px, py, bp, dist };
    });

    if (points.length > 1) {
      chartCtx.moveTo(points[0].px, points[0].py);
      points.forEach(pt => chartCtx.lineTo(pt.px, pt.py));
      chartCtx.stroke();

      // Draw points
      points.forEach(pt => {
        chartCtx.beginPath();
        chartCtx.arc(pt.px, pt.py, 3.5, 0, Math.PI * 2);
        chartCtx.fillStyle = "#10b981";
        chartCtx.fill();
      });
    }
  }

  function step() {
    if (isElectrophoresisRunning) {
      runTimeMinutes += 0.04;
      dyeFrontDistance = (voltage / 100.0) * runTimeMinutes * 12.0;

      const hudTimer = container.querySelector("#hud-gel-timer");
      if (hudTimer) {
        const currentmA = Math.round(voltage * (agarosePercent * 0.45));
        hudTimer.innerText = `${runTimeMinutes.toFixed(1)} min • ${voltage} V (${currentmA} mA)`;
      }
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

    const gelPhotoOverlay = container.querySelector("#gel-photo-overlay");
    const isPhotoOverlay = gelPhotoOverlay && gelPhotoOverlay.style.display === "block";

    if (!isPhotoOverlay) {
      if (isElectrophoresisRunning) {
        if (!now || now - lastFrameTime >= interval) {
          lastFrameTime = now || performance.now();
          step();
          drawElectrophoresisRig();
          drawSemilogChart();
        }
      } else if (needsRedraw) {
        drawElectrophoresisRig();
        drawSemilogChart();
        needsRedraw = false;
      }
    }

    animId = requestAnimationFrame(loop);
  }

  // Event Listeners
  container.querySelector("#btn-gel-power")?.addEventListener("click", () => {
    isElectrophoresisRunning = !isElectrophoresisRunning;
    const btn = container.querySelector("#btn-gel-power");
    if (btn) {
      btn.innerText = isElectrophoresisRunning ? "⏹ Stop Power Supply" : "⚡ Start Power Supply";
      btn.classList.toggle("btn-primary", !isElectrophoresisRunning);
      btn.classList.toggle("btn-danger", isElectrophoresisRunning);
    }
    needsRedraw = true;
    SoundFX.playClick();
  });

  container.querySelector("#btn-gel-uv")?.addEventListener("click", () => {
    uvLightEnabled = !uvLightEnabled;
    const btn = container.querySelector("#btn-gel-uv");
    const hudMode = container.querySelector("#hud-gel-mode");
    if (btn) {
      btn.innerText = uvLightEnabled ? "💡 Visible Light Mode" : "💡 UV Transilluminator";
    }
    if (hudMode) {
      hudMode.innerText = uvLightEnabled ? "UV Fluorescence (GelGreen)" : "Visible Light (Dye Front)";
    }
    needsRedraw = true;
    SoundFX.playScorePip();
  });

  container.querySelector("#btn-gel-reset")?.addEventListener("click", () => {
    runTimeMinutes = 0.0;
    dyeFrontDistance = 0.0;
    isElectrophoresisRunning = false;
    const btn = container.querySelector("#btn-gel-power");
    if (btn) {
      btn.innerText = "⚡ Start Power Supply";
      btn.className = "btn btn-primary btn-sm";
    }
    needsRedraw = true;
    SoundFX.playClick();
  });

  container.querySelector("#select-gel-agarose")?.addEventListener("change", (e) => {
    agarosePercent = parseFloat(e.target.value);
    needsRedraw = true;
    SoundFX.playClick();
  });

  container.querySelector("#slider-gel-voltage")?.addEventListener("input", (e) => {
    voltage = parseInt(e.target.value, 10);
    container.querySelector("#lbl-gel-voltage").innerText = `${voltage} V`;
    needsRedraw = true;
  });

  container.querySelector("#btn-gel-export")?.addEventListener("click", () => {
    exportLabDataCsv({
      title: "Agarose Gel Electrophoresis DNA Migration Telemetry",
      labId: "electrophoresis",
      parameters: {
        "Agarose Concentration (%)": `${agarosePercent}%`,
        "Applied DC Voltage (V)": `${voltage} V`,
        "Run Duration (min)": runTimeMinutes.toFixed(1),
        "Buffer": "1X TAE"
      },
      headers: ["Band Label", "Base Pairs (bp)", "log10(bp)", "Migration Distance (mm)"],
      dataRows: LADDER_BANDS.map(band => [
        band.label,
        band.bp,
        Math.log10(band.bp).toFixed(3),
        getBandDistance(band.bp).toFixed(2)
      ])
    });
  });

  // 4K Photo View Switcher
  const btnGelSim = container.querySelector("#view-mode-gel-sim");
  const btnGelPhoto = container.querySelector("#view-mode-gel-photo");
  const gelPhotoOverlay = container.querySelector("#gel-photo-overlay");

  btnGelSim?.addEventListener("click", () => {
    btnGelSim.classList.add("active");
    btnGelSim.style.background = "";
    btnGelPhoto.classList.remove("active");
    btnGelPhoto.style.background = "transparent";
    if (gelPhotoOverlay) gelPhotoOverlay.style.display = "none";
    SoundFX.playClick();
  });

  btnGelPhoto?.addEventListener("click", () => {
    btnGelPhoto.classList.add("active");
    btnGelPhoto.style.background = "";
    btnGelSim.classList.remove("active");
    btnGelSim.style.background = "transparent";
    if (gelPhotoOverlay) gelPhotoOverlay.style.display = "block";
    SoundFX.playClick();
  });

  // Mount Assessment
  mountLabCheckpoint("electrophoresis-checkpoint-container", "electrophoresis");

  // Launch
  loop();

  return () => {
    isRunning = false;
    if (animId) cancelAnimationFrame(animId);
  };
}
