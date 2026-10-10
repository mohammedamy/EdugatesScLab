// Edugates-ClipSAT Science Labs - Physics: Precision DC & AC Circuit Analysis Suite
// Photorealistic Electronics Workbench: DC Ohm & Kirchhoff, AC Series RLC Resonant Dynamics,
// Dual-Trace Digital Oscilloscope & Phasor Rotation, Wheatstone Bridge Null Detector,
// 4-Band Axial Resistors, Incandescent Bulb Filament, Heavy Brass Knife Switch, and 4K Workbench Photography.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";

let _currentCircuitsCleanup = null;

export function cleanupCircuitsLab() {
  if (typeof _currentCircuitsCleanup === "function") {
    try { _currentCircuitsCleanup(); } catch (e) {}
    _currentCircuitsCleanup = null;
  }
}

export function initCircuitsLab(containerId) {
  cleanupCircuitsLab();
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="lab-container circuits-layout">
      <!-- Mode & Visual Header Toolbar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding: 10px 18px; flex-wrap: wrap; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #f59e0b; box-shadow: 0 0 10px #f59e0b;"></span>
            Precision DC & AC Circuit Analysis Suite
          </span>
          <span class="badge" style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); color: #fbbf24; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            NIST Traceable Instrumentation (±0.25%)
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <!-- Mode Switcher Tabs -->
          <div class="lab-view-switcher" style="display: flex; border-radius: 8px; padding: 3px; gap: 4px; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.1);">
            <button id="circuit-tab-dc" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              ⚡ DC Ohm / Kirchhoff
            </button>
            <button id="circuit-tab-ac" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              🌊 AC RLC Resonance & Scope
            </button>
            <button id="circuit-tab-bridge" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              ⚖️ Wheatstone Bridge
            </button>
            <button id="circuit-tab-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>

          <!-- Multimeter Probe Mode Toggle -->
          <label class="lab-checkbox-label" style="display: flex; align-items: center; gap: 6px; font-size: 0.78rem; cursor: pointer; user-select: none;">
            <input type="checkbox" id="chk-probes" style="accent-color: #ef4444; width: 15px; height: 15px;">
            <span style="color: #f87171; font-weight: 600;">Fluke DMM Probes</span>
          </label>
        </div>
      </div>

      <!-- Main Electronics Bench Canvas Area -->
      <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(245, 158, 11, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: #070a12; overflow: hidden; height: 530px; border-radius: 12px;">
        <canvas id="circuit-canvas" width="1000" height="530" style="height: 530px; width: 100%; display: block; touch-action: none; cursor: crosshair;"></canvas>

        <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
        <div id="circuit-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
          <picture>
            <source srcset="assets/labs/circuits_bench.webp" type="image/webp">
            <img src="assets/labs/circuits_bench.jpg" decoding="async" loading="lazy" alt="4K Electronics Laboratory Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
          </picture>
          
          <!-- Live Analytical Telemetry Callout on Photo -->
          <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Siglent DC Supply</div>
              <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.95rem;">3.30V • 0.150A Precision</div>
            </div>
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Solderless Breadboard</div>
              <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.95rem;">830-Tie Point Matrix</div>
            </div>
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Edison Incandescent Bulb</div>
              <div style="color: #fbbf24; font-weight: 700; font-family: var(--font-mono); font-size: 0.95rem;">Coiled Tungsten Filament</div>
            </div>
            <div>
              <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Brass Knife Switch</div>
              <div style="color: #ec4899; font-weight: 700; font-family: var(--font-mono); font-size: 0.95rem;">Single Pole Single Throw (SPST)</div>
            </div>
          </div>
        </div>

        <!-- Top HUD: Badges & Live Precision Multimeter Dashboard -->
        <div class="sim-top-hud-bar" style="position: absolute; top: 12px; left: 14px; right: 14px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; pointer-events: none; z-index: 10;">
          <div class="sim-hud-badges" style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px; pointer-events: auto; max-width: 50%; min-width: 0;">
            <span class="badge" style="background: rgba(15, 23, 42, 0.92); border: 1px solid rgba(245, 158, 11, 0.4); padding: 5px 12px; border-radius: 9999px; font-family: var(--font-mono); font-size: 0.8rem; color: #fbbf24; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); white-space: nowrap;">
              <span id="circuit-status-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
              <span id="circuit-status">Circuit Closed • Active Current</span>
            </span>
            <span class="badge" id="topo-badge" style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 9999px; font-family: var(--font-mono); font-size: 0.78rem; color: #38bdf8; white-space: nowrap;">
              Series DC Circuit
            </span>
          </div>

          <!-- Precision DMM Telemetry Cards -->
          <div class="sim-telemetry-dashboard" id="circuits-telemetry-grid" style="display: flex; gap: 10px; font-family: var(--font-mono); font-size: 0.82rem; padding: 8px 14px; border-radius: 12px; backdrop-filter: blur(12px); background: rgba(15, 23, 42, 0.88); border: 1px solid rgba(245, 158, 11, 0.3); box-shadow: 0 10px 25px rgba(0,0,0,0.6); pointer-events: auto; flex-shrink: 0;">
            <div style="border-right: 1px solid rgba(255,255,255,0.1); padding-right: 10px;" id="telem-col-1">
              <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase;" id="lbl-telem-1">Total Voltage (V)</div>
              <div style="color: #38bdf8; font-weight: 700; font-size: 0.98rem;" id="val-v">12.0 V</div>
            </div>
            <div style="border-right: 1px solid rgba(255,255,255,0.1); padding-right: 10px;" id="telem-col-2">
              <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase;" id="lbl-telem-2">Current (I)</div>
              <div style="color: #10b981; font-weight: 700; font-size: 0.98rem;" id="val-i">0.60 A</div>
            </div>
            <div style="border-right: 1px solid rgba(255,255,255,0.1); padding-right: 10px;" id="telem-col-3">
              <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase;" id="lbl-telem-3">Equiv Res (R_eq)</div>
              <div style="color: #f59e0b; font-weight: 700; font-size: 0.98rem;" id="val-req">20.0 Ω</div>
            </div>
            <div id="telem-col-4">
              <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase;" id="lbl-telem-4">Bulb Power (P)</div>
              <div style="color: #ec4899; font-weight: 700; font-size: 0.98rem;" id="val-power">3.60 W</div>
            </div>
          </div>
        </div>

        <!-- Floating Educational Formulation Bar -->
        <div id="circuit-formula-bar" class="sim-floating-formula-bar" style="position: absolute; bottom: 12px; left: 16px; right: 16px; backdrop-filter: blur(14px); background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 12px; padding: 8px 18px; display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap; gap: 14px; font-size: 0.82rem; z-index: 10;">
          <div style="display: flex; align-items: center; gap: 6px;" id="formula-box-1">
            <span style="color: #94a3b8; font-weight: 600;">Ohm's Law:</span>
            <span style="color: #38bdf8;" id="eq-ohm">${renderLatex("V = I \\cdot R")}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;" id="formula-box-2">
            <span style="color: #94a3b8; font-weight: 600;">Power:</span>
            <span style="color: #f59e0b;" id="eq-power">${renderLatex("P = I^2 R = \\frac{V^2}{R}")}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;" id="formula-box-3">
            <span style="color: #94a3b8; font-weight: 600;">Topology:</span>
            <span style="color: #10b981;" id="formula-req">${renderLatex("R_{\\text{series}} = R_1 + R_2")}</span>
          </div>
        </div>
      </div>

      <!-- Controls Panel & Circuit Customization -->
      <div class="lab-controls-panel" style="margin-top: 18px; background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 18px;">
        
        <!-- DC Mode Controls Subpanel -->
        <div id="controls-dc-mode">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
            <!-- Voltage Source Slider -->
            <div class="control-group">
              <label class="control-label">
                <span>DC Power Supply (V)</span>
                <span class="control-val" id="disp-voltage" style="color: #38bdf8;">12.0 V</span>
              </label>
              <input type="range" id="input-voltage" class="custom-slider" min="1.5" max="36" value="12" step="0.5" style="accent-color: #38bdf8;">
              <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-dim);">
                <span>1.5 V (AA)</span>
                <span>12 V (Battery)</span>
                <span>36 V (Bench)</span>
              </div>
            </div>

            <!-- Resistor R1 Slider -->
            <div class="control-group">
              <label class="control-label">
                <span>Resistor R₁ (Color-Coded)</span>
                <span class="control-val" id="disp-r1" style="color: #f59e0b;">10.0 Ω</span>
              </label>
              <input type="range" id="input-r1" class="custom-slider" min="2" max="50" value="10" step="1" style="accent-color: #f59e0b;">
              <div style="font-size: 0.72rem; color: #94a3b8;" id="r1-bands-text">
                Bands: Brown - Black - Black - Gold (10 Ω ±5%)
              </div>
            </div>

            <!-- Bulb Filament Resistance -->
            <div class="control-group">
              <label class="control-label">
                <span>Bulb Resistance (R₂)</span>
                <span class="control-val" id="disp-r2" style="color: #ec4899;">10.0 Ω</span>
              </label>
              <input type="range" id="input-r2" class="custom-slider" min="2" max="40" value="10" step="1" style="accent-color: #ec4899;">
              <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-dim);">
                <span>2 Ω</span>
                <span>20 Ω</span>
                <span>40 Ω</span>
              </div>
            </div>

            <!-- Circuit Topology Selector -->
            <div class="control-group">
              <label class="control-label">
                <span>Circuit Topology</span>
              </label>
              <select id="select-topology" class="select-input" style="font-weight: 600; width: 100%;">
                <option value="series" selected>Series Circuit (Battery → R₁ → Bulb in Loop)</option>
                <option value="parallel">Parallel Circuit (R₁ and Bulb in Independent Branches)</option>
              </select>
            </div>
          </div>

          <div style="display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap;">
            <button class="btn btn-secondary" id="btn-preset-series" style="font-size: 0.8rem;">
              Series Divider (12V, 10Ω+10Ω)
            </button>
            <button class="btn btn-secondary" id="btn-preset-parallel" style="font-size: 0.8rem;">
              Parallel Current (12V, 10Ω||10Ω)
            </button>
          </div>
        </div>

        <!-- AC RLC Mode Controls Subpanel -->
        <div id="controls-ac-mode" style="display: none;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px;">
            <!-- AC Voltage Source -->
            <div class="control-group">
              <label class="control-label">
                <span>AC Amplitude (V₀ Peak)</span>
                <span class="control-val" id="disp-ac-v0" style="color: #38bdf8;">10.0 V</span>
              </label>
              <input type="range" id="input-ac-v0" class="custom-slider" min="2" max="30" value="10" step="0.5" style="accent-color: #38bdf8;">
              <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-dim);">
                <span>2 V</span>
                <span>15 V</span>
                <span>30 V</span>
              </div>
            </div>

            <!-- Generator Frequency Slider -->
            <div class="control-group">
              <label class="control-label">
                <span>AC Frequency (f)</span>
                <span class="control-val" id="disp-ac-freq" style="color: #a855f7;">159 Hz</span>
              </label>
              <input type="range" id="input-ac-freq" class="custom-slider" min="20" max="1000" value="159" step="1" style="accent-color: #a855f7;">
              <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-dim);">
                <span>20 Hz</span>
                <span>f₀ = 159 Hz</span>
                <span>1000 Hz</span>
              </div>
            </div>

            <!-- Inductor L -->
            <div class="control-group">
              <label class="control-label">
                <span>Inductance (L)</span>
                <span class="control-val" id="disp-ac-l" style="color: #34d399;">100 mH</span>
              </label>
              <input type="range" id="input-ac-l" class="custom-slider" min="10" max="500" value="100" step="5" style="accent-color: #34d399;">
              <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-dim);">
                <span>10 mH</span>
                <span>250 mH</span>
                <span>500 mH</span>
              </div>
            </div>

            <!-- Capacitor C -->
            <div class="control-group">
              <label class="control-label">
                <span>Capacitance (C)</span>
                <span class="control-val" id="disp-ac-c" style="color: #38bdf8;">10.0 µF</span>
              </label>
              <input type="range" id="input-ac-c" class="custom-slider" min="1" max="50" value="10" step="0.5" style="accent-color: #38bdf8;">
              <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-dim);">
                <span>1 µF</span>
                <span>25 µF</span>
                <span>50 µF</span>
              </div>
            </div>

            <!-- Resistor R -->
            <div class="control-group">
              <label class="control-label">
                <span>Damping Resistor (R)</span>
                <span class="control-val" id="disp-ac-r" style="color: #f59e0b;">20.0 Ω</span>
              </label>
              <input type="range" id="input-ac-r" class="custom-slider" min="5" max="100" value="20" step="1" style="accent-color: #f59e0b;">
              <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-dim);">
                <span>5 Ω (High Q)</span>
                <span>50 Ω</span>
                <span>100 Ω</span>
              </div>
            </div>
          </div>

          <!-- AC Presets -->
          <div style="display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap;">
            <button class="btn btn-secondary" id="btn-preset-resonance" style="font-size: 0.8rem; border-color: rgba(52, 211, 153, 0.4); color: #34d399;">
              🎯 Peak Resonance (f = f₀, XL = XC)
            </button>
            <button class="btn btn-secondary" id="btn-preset-inductive" style="font-size: 0.8rem;">
              ⚡ Inductive Lag (f = 2·f₀)
            </button>
            <button class="btn btn-secondary" id="btn-preset-capacitive" style="font-size: 0.8rem;">
              🔋 Capacitive Lead (f = 0.5·f₀)
            </button>
            <button class="btn btn-secondary" id="btn-preset-high-q" style="font-size: 0.8rem;">
              💎 High-Q Bandpass Filter (Q ≈ 10)
            </button>
          </div>
        </div>

        <!-- Wheatstone Bridge Controls Subpanel -->
        <div id="controls-bridge-mode" style="display: none;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px;">
            <!-- Bridge Source Voltage -->
            <div class="control-group">
              <label class="control-label">
                <span>Bridge Input Voltage (V_in)</span>
                <span class="control-val" id="disp-bridge-v" style="color: #38bdf8;">10.0 V</span>
              </label>
              <input type="range" id="input-bridge-v" class="custom-slider" min="2" max="20" value="10" step="0.5" style="accent-color: #38bdf8;">
            </div>

            <!-- Ratio Arm R1 -->
            <div class="control-group">
              <label class="control-label">
                <span>Ratio Arm (R₁)</span>
                <span class="control-val" id="disp-bridge-r1" style="color: #f59e0b;">100 Ω</span>
              </label>
              <input type="range" id="input-bridge-r1" class="custom-slider" min="20" max="500" value="100" step="5" style="accent-color: #f59e0b;">
            </div>

            <!-- Ratio Arm R2 -->
            <div class="control-group">
              <label class="control-label">
                <span>Ratio Arm (R₂)</span>
                <span class="control-val" id="disp-bridge-r2" style="color: #38bdf8;">100 Ω</span>
              </label>
              <input type="range" id="input-bridge-r2" class="custom-slider" min="20" max="500" value="100" step="5" style="accent-color: #38bdf8;">
            </div>

            <!-- Precision Decade Box R3 -->
            <div class="control-group">
              <label class="control-label">
                <span>Decade Standard Box (R₃)</span>
                <span class="control-val" id="disp-bridge-r3" style="color: #10b981; font-weight: 700;">80.0 Ω</span>
              </label>
              <input type="range" id="input-bridge-r3" class="custom-slider" min="10" max="500" value="80" step="1" style="accent-color: #10b981;">
              <div style="display: flex; gap: 6px; margin-top: 4px;">
                <button class="btn btn-secondary" id="btn-nudge-r3-down" style="padding: 2px 8px; font-size: 0.72rem;">-1 Ω</button>
                <button class="btn btn-secondary" id="btn-nudge-r3-up" style="padding: 2px 8px; font-size: 0.72rem;">+1 Ω</button>
                <button class="btn btn-secondary" id="btn-auto-null" style="padding: 2px 8px; font-size: 0.72rem; color: #34d399; margin-left: auto;">Auto-Balance</button>
              </div>
            </div>

            <!-- Unknown DUT Selection -->
            <div class="control-group">
              <label class="control-label">
                <span>Unknown DUT Resistor (R_x)</span>
              </label>
              <select id="select-unknown-dut" class="select-input" style="font-weight: 600; width: 100%;">
                <option value="68">Mystery Resistor A (Specimen #1)</option>
                <option value="120" selected>Mystery Resistor B (Specimen #2)</option>
                <option value="270">Mystery Resistor C (Specimen #3)</option>
                <option value="390">Mystery Resistor D (Specimen #4)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Universal Action Controls -->
        <div class="lab-action-buttons" style="margin-top: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 14px;">
          <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <button class="btn btn-primary" id="btn-toggle-switch" style="box-shadow: 0 0 15px rgba(245, 158, 11, 0.4);">
              ⚡ Toggle Knife Switch (Open / Close)
            </button>
            <button class="btn btn-secondary" id="btn-reset-bench" style="font-size: 0.8rem;">
              🔄 Reset Circuit Parameters
            </button>
          </div>

          <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #f8fafc; cursor: pointer; user-select: none;">
            <input type="checkbox" id="chk-flow-dir" checked style="accent-color: #38bdf8; width: 16px; height: 16px;">
            <span>Electron Flow (- to +)</span>
          </label>
        </div>
      </div>

      <!-- Telemetry Suite & Multi-Trial Bar -->
      <div class="lab-telemetry-suite-bar" style="margin-top: 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div class="lab-trials-badge-group" id="circuits-trials-badge-group" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">Multi-Trial Circuit Logging:</span>
          <span class="lab-trial-pill trial-1" id="circ-pill-trial-1" style="opacity: 0.5;">Trial 1 (Cyan)</span>
          <span class="lab-trial-pill trial-2" id="circ-pill-trial-2" style="opacity: 0.5;">Trial 2 (Amber)</span>
          <span class="lab-trial-pill trial-3" id="circ-pill-trial-3" style="opacity: 0.5;">Trial 3 (Emerald)</span>
        </div>

        <div class="lab-export-buttons-group" style="display: flex; gap: 10px; align-items: center;">
          <button class="btn btn-secondary" id="btn-record-circ-trial" style="padding: 6px 12px; font-size: 0.8rem; gap: 6px; border-color: rgba(245,158,11,0.4); color: #fbbf24;">
            <span>📸 Log Current State</span>
          </button>
          <button class="btn btn-secondary" id="btn-export-circ-csv" style="padding: 6px 12px; font-size: 0.8rem; gap: 6px;">
            <span>📥 Export CSV (E)</span>
          </button>
          <button class="btn btn-primary" id="btn-open-circ-report" style="padding: 6px 14px; font-size: 0.8rem; gap: 6px; background: linear-gradient(135deg, #d97706, #b45309); border: none;">
            <span>📑 Generate Lab Dossier</span>
          </button>
        </div>
      </div>

      <!-- Post-Lab Checkpoint Assessment Mount -->
      <div id="circuits-checkpoint-container" style="margin-top: 20px;"></div>
    </div>
  `;

  const canvas = document.getElementById("circuit-canvas");
  const ctx = canvas.getContext("2d");
  const photoOverlay = document.getElementById("circuit-photo-overlay");

  // State Management
  let currentTab = "dc"; // 'dc' | 'ac' | 'bridge' | 'photo'
  let switchClosed = true;
  let showProbes = false;
  let electronFlow = true;
  let electronOffset = 0;
  let sparks = [];
  let animId = null;
  let timeSeconds = 0;

  // DC Parameters
  let voltage = 12.0;
  let r1 = 10.0;
  let r2 = 10.0;
  let topology = "series"; // 'series' | 'parallel'

  // AC RLC Parameters
  let acV0 = 10.0;       // Peak Volts
  let acFreq = 159.0;    // Hz
  let acL = 0.100;       // Henry (100 mH)
  let acC = 10.0e-6;     // Farad (10 µF)
  let acR = 20.0;        // Ohms

  // Wheatstone Bridge Parameters
  let bridgeVin = 10.0;  // V
  let bridgeR1 = 100.0;  // Ω
  let bridgeR2 = 100.0;  // Ω
  let bridgeR3 = 80.0;   // Ω
  let bridgeRx = 120.0;  // Ω (Actual DUT)

  // Dragging State
  let dragTarget = null; // 'switch' | 'probe_red' | 'probe_black'
  let probeRedPos = { x: 500, y: 150 };
  let probeBlackPos = { x: 500, y: 350 };

  // Audio Synthesis for Tactile Workbench Clicks & Sparks
  function playClickSound(pitch = 320) {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(pitch, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.25, audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch(e) {}
  }

  // 4-Band Resistor Color Codes
  const colorBands = {
    0: { name: "Black", color: "#0f172a" },
    1: { name: "Brown", color: "#854d0e" },
    2: { name: "Red", color: "#ef4444" },
    3: { name: "Orange", color: "#f97316" },
    4: { name: "Yellow", color: "#eab308" },
    5: { name: "Green", color: "#22c55e" },
    6: { name: "Blue", color: "#3b82f6" },
    7: { name: "Violet", color: "#a855f7" },
    8: { name: "Gray", color: "#64748b" },
    9: { name: "White", color: "#f8fafc" }
  };

  function getResistorBands(ohms) {
    const s = Math.round(ohms).toString();
    const b1 = parseInt(s[0], 10) || 1;
    const b2 = s.length > 1 ? parseInt(s[1], 10) : 0;
    const mult = Math.max(0, s.length - 2);
    return [colorBands[b1] || colorBands[1], colorBands[b2] || colorBands[0], colorBands[mult] || colorBands[0]];
  }

  // --- Analytical Calculations ---

  // DC Circuit Calculations
  function calculateDCCircuit() {
    if (!switchClosed) {
      return { req: Infinity, current: 0, power: 0, i1: 0, i2: 0, v1: 0, v2: 0 };
    }
    if (topology === "series") {
      const req = r1 + r2;
      const current = voltage / req;
      const v1 = current * r1;
      const v2 = current * r2;
      const power = current * current * r2;
      return { req, current, power, i1: current, i2: current, v1, v2 };
    } else {
      const req = (r1 * r2) / (r1 + r2);
      const i1 = voltage / r1;
      const i2 = voltage / r2;
      const current = i1 + i2;
      const power = i2 * i2 * r2;
      return { req, current, power, i1, i2, v1: voltage, v2: voltage };
    }
  }

  // AC RLC Resonant Calculations
  function calculateACCircuit() {
    const omega = 2 * Math.PI * acFreq;
    const XL = omega * acL;
    const XC = 1 / (omega * acC);
    const Xnet = XL - XC;
    const Z = Math.sqrt(acR * acR + Xnet * Xnet);
    const phiRad = Math.atan2(Xnet, acR);
    const phiDeg = (phiRad * 180) / Math.PI;

    const I0 = switchClosed ? (acV0 / Z) : 0;
    const Irms = I0 / Math.SQRT2;
    const Vrms = acV0 / Math.SQRT2;

    const VR0 = I0 * acR;
    const VL0 = I0 * XL;
    const VC0 = I0 * XC;

    // Resonant parameters
    const f0 = 1 / (2 * Math.PI * Math.sqrt(acL * acC));
    const omega0 = 2 * Math.PI * f0;
    const Q = (omega0 * acL) / acR;
    const deltaF = f0 / Q;
    const powerReal = Vrms * Irms * Math.cos(phiRad);
    const powerFactor = Math.cos(phiRad);

    return {
      omega, XL, XC, Xnet, Z, phiRad, phiDeg,
      I0, Irms, Vrms, VR0, VL0, VC0,
      f0, omega0, Q, deltaF, powerReal, powerFactor,
      isResonant: Math.abs(acFreq - f0) < (0.05 * f0)
    };
  }

  // Wheatstone Bridge Calculations
  function calculateBridge() {
    if (!switchClosed) {
      return { vb: 0, vd: 0, vg: 0, ig: 0, rxCalc: 0, isBalanced: false };
    }
    const vb = bridgeVin * (bridgeR2 / (bridgeR1 + bridgeR2));
    const vd = bridgeVin * (bridgeRx / (bridgeR3 + bridgeRx));
    const vg = vb - vd; // Galvanometer voltage difference
    const rth = (bridgeR1 * bridgeR2) / (bridgeR1 + bridgeR2) + (bridgeR3 * bridgeRx) / (bridgeR3 + bridgeRx);
    const rg = 50.0; // Galvanometer coil resistance
    const ig = vg / (rth + rg); // Microamperes
    const rxCalc = (bridgeR2 * bridgeR3) / bridgeR1;
    const isBalanced = Math.abs(vg) < 0.005; // Less than 5 mV

    return { vb, vd, vg, ig, rxCalc, isBalanced };
  }

  // --- Rendering Pipeline ---

  function drawDCView(w, h, isSmart, dtFactor) {
    const { req, current, power, i1, i2, v1, v2 } = calculateDCCircuit();

    const cLeft = 140;
    const cRight = w - 140;
    const cTop = 100;
    const cBottom = h - 90;

    // 1. Thick Insulated Copper Connecting Wires
    ctx.strokeStyle = switchClosed ? "#f59e0b" : "#475569";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";

    ctx.beginPath();
    const switchX = (cLeft + cRight) / 2;
    ctx.moveTo(cLeft, cTop);
    ctx.lineTo(switchX - 35, cTop);
    ctx.moveTo(switchX + 35, cTop);
    ctx.lineTo(cRight, cTop);

    if (topology === "series") {
      ctx.lineTo(cRight, cBottom);
      ctx.lineTo(cLeft, cBottom);
      ctx.lineTo(cLeft, cTop);
    } else {
      const midBranchX = cLeft + (cRight - cLeft) * 0.55;
      ctx.moveTo(midBranchX, cTop);
      ctx.lineTo(midBranchX, cBottom);
      ctx.moveTo(cRight, cTop);
      ctx.lineTo(cRight, cBottom);
      ctx.moveTo(cRight, cBottom);
      ctx.lineTo(cLeft, cBottom);
      ctx.lineTo(cLeft, cTop);
    }
    ctx.stroke();

    // 2. DC Cylindrical Power Source
    const batX = cLeft;
    const batY = (cTop + cBottom) / 2;
    const batH = 90;
    const batW = 34;

    const bGrad = ctx.createLinearGradient(batX - batW/2, 0, batX + batW/2, 0);
    bGrad.addColorStop(0, "#1e293b");
    bGrad.addColorStop(0.3, "#0284c7");
    bGrad.addColorStop(0.7, "#0369a1");
    bGrad.addColorStop(1, "#082f49");
    ctx.fillStyle = bGrad;
    ctx.fillRect(batX - batW/2, batY - batH/2, batW, batH);
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(batX - batW/2, batY - batH/2, batW, batH);

    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(batX - 7, batY - batH/2 - 8, 14, 8);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px JetBrains Mono, monospace";
    ctx.fillText("+", batX - 4, batY - batH/2 + 18);
    ctx.fillText("-", batX - 4, batY + batH/2 - 8);
    ctx.font = "bold 10px JetBrains Mono, monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText(`${voltage.toFixed(1)}V`, batX - 14, batY + 4);

    // 3. Knife Switch
    drawKnifeSwitch(switchX, cTop);

    // 4. Ceramic Resistor R1
    const r1X = (topology === "series") ? cRight : (cLeft + (cRight - cLeft) * 0.55);
    const r1Y = (cTop + cBottom) / 2;
    drawAxialResistor(r1X, r1Y, r1, "R₁");

    // 5. Edison Incandescent Bulb (R2)
    const bulbX = (topology === "series") ? ((cLeft + cRight) / 2) : cRight;
    const bulbY = (topology === "series") ? cBottom : ((cTop + cBottom) / 2);
    drawIncandescentBulb(bulbX, bulbY, r2, power, isSmart);

    // 6. Flowing Electron Dots
    if (switchClosed && current > 0) {
      electronOffset = (electronOffset + current * 1.8 * dtFactor) % 40;
      ctx.fillStyle = "#38bdf8";
      if (!isSmart) {
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 6;
      }
      function drawDot(x, y) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let x = cLeft + 15; x < cRight - 15; x += 35) {
        const ex = (x + electronOffset) % (cRight - cLeft) + cLeft;
        if (Math.abs(ex - switchX) > 20) drawDot(ex, cTop);
      }
      for (let x = cLeft + 15; x < cRight - 15; x += 35) {
        const ex = cRight - ((x + electronOffset) % (cRight - cLeft));
        drawDot(ex, cBottom);
      }
      for (let y = cTop + 15; y < cBottom - 15; y += 35) {
        const ey = cBottom - ((y + electronOffset) % (cBottom - cTop));
        drawDot(cLeft, ey);
        drawDot(cRight, (y + electronOffset) % (cBottom - cTop) + cTop);
      }
      ctx.shadowBlur = 0;
    }
  }

  function drawACView(w, h, isSmart, dtFactor) {
    const ac = calculateACCircuit();

    const cLeft = 90;
    const cRight = w - 420; // Leave right room for Dual-Trace Oscilloscope & Phasor
    const cTop = 100;
    const cBottom = h - 90;

    // AC Circuit Main Wire Loop
    ctx.strokeStyle = switchClosed ? "#a855f7" : "#475569";
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";

    ctx.beginPath();
    const switchX = (cLeft + cRight) / 2;
    ctx.moveTo(cLeft, cTop);
    ctx.lineTo(switchX - 35, cTop);
    ctx.moveTo(switchX + 35, cTop);
    ctx.lineTo(cRight, cTop);
    ctx.lineTo(cRight, cBottom);
    ctx.lineTo(cLeft, cBottom);
    ctx.lineTo(cLeft, cTop);
    ctx.stroke();

    // 1. AC Sine Generator Source (Left)
    const genX = cLeft;
    const genY = (cTop + cBottom) / 2;
    const genR = 26;

    ctx.fillStyle = "#1e1b4b";
    ctx.beginPath();
    ctx.arc(genX, genY, genR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Sine Symbol inside Source
    ctx.strokeStyle = "#c084fc";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(genX - 14, genY);
    ctx.bezierCurveTo(genX - 7, genY - 14, genX - 7, genY - 14, genX, genY);
    ctx.bezierCurveTo(genX + 7, genY + 14, genX + 7, genY + 14, genX + 14, genY);
    ctx.stroke();

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 11px JetBrains Mono, monospace";
    ctx.fillText(`${acV0.toFixed(0)}V~`, genX - 12, genY + genR + 15);
    ctx.fillStyle = "#c084fc";
    ctx.fillText(`${acFreq.toFixed(0)}Hz`, genX - 16, genY + genR + 28);

    // 2. Knife Switch
    drawKnifeSwitch(switchX, cTop);

    // 3. Damping Resistor R (Top Right side)
    const rX = cRight;
    const rY = cTop + 65;
    drawAxialResistor(rX, rY, acR, "R");

    // 4. Helical Copper Inductor L (Middle Right)
    const lX = cRight;
    const lY = cTop + 175;
    drawHelicalInductor(lX, lY, acL, ac.XL, isSmart);

    // 5. Parallel Plate Capacitor C (Bottom Wire)
    const cX = (cLeft + cRight) / 2;
    const cY = cBottom;
    drawParallelPlateCapacitor(cX, cY, acC, ac.XC);

    // 6. Inset Dual-Trace Digital Oscilloscope (Right Panel)
    drawDualTraceOscilloscope(w - 390, 80, 360, 240, ac);

    // 7. Rotating Phasor Diagram (Bottom Right Inset)
    drawPhasorDiagram(w - 390, 335, 360, 165, ac);
  }

  function drawBridgeView(w, h, isSmart) {
    const br = calculateBridge();

    const centerX = w / 2;
    const centerY = (h - 70) / 2 + 30;
    const dX = 160;
    const dY = 120;

    // Diamond Bridge Nodes:
    // Node A (Top, + Vin), Node B (Right), Node C (Bottom, Ground), Node D (Left)
    const nodeA = { x: centerX, y: centerY - dY };
    const nodeB = { x: centerX + dX, y: centerY };
    const nodeC = { x: centerX, y: centerY + dY };
    const nodeD = { x: centerX - dX, y: centerY };

    // DC Power Supply Rails to Node A and C
    ctx.strokeStyle = switchClosed ? "#f59e0b" : "#475569";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(nodeA.x - 220, nodeA.y);
    ctx.lineTo(nodeA.x, nodeA.y);
    ctx.moveTo(nodeC.x - 220, nodeC.y);
    ctx.lineTo(nodeC.x, nodeC.y);
    ctx.lineTo(nodeC.x - 220, nodeC.y);
    ctx.stroke();

    // DC Source Box on Left
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(nodeA.x - 240, centerY - 35, 40, 70);
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.strokeRect(nodeA.x - 240, centerY - 35, 40, 70);
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 11px JetBrains Mono, monospace";
    ctx.fillText(`${bridgeVin.toFixed(1)}V`, nodeA.x - 236, centerY + 4);
    ctx.fillText("+", nodeA.x - 224, centerY - 18);
    ctx.fillText("-", nodeA.x - 224, centerY + 25);

    // Connecting wires to Diamond Nodes
    ctx.beginPath();
    ctx.moveTo(nodeA.x - 220, nodeA.y);
    ctx.lineTo(nodeA.x - 220, centerY - 35);
    ctx.moveTo(nodeC.x - 220, nodeC.y);
    ctx.lineTo(nodeC.x - 220, centerY + 35);
    ctx.stroke();

    // Bridge Diamond Arms:
    // Arm 1: A -> D (R1)
    // Arm 2: D -> C (R2)
    // Arm 3: A -> B (R3 Decade Box)
    // Arm 4: B -> C (Rx DUT)
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(nodeA.x, nodeA.y);
    ctx.lineTo(nodeD.x, nodeD.y);
    ctx.lineTo(nodeC.x, nodeC.y);
    ctx.lineTo(nodeB.x, nodeB.y);
    ctx.lineTo(nodeA.x, nodeA.y);
    ctx.stroke();

    // Draw Resistors on the 4 Arms
    drawBridgeArmResistor((nodeA.x + nodeD.x) / 2, (nodeA.y + nodeD.y) / 2, `R₁ = ${bridgeR1}Ω`);
    drawBridgeArmResistor((nodeD.x + nodeC.x) / 2, (nodeD.y + nodeC.y) / 2, `R₂ = ${bridgeR2}Ω`);
    drawBridgeArmResistor((nodeA.x + nodeB.x) / 2, (nodeA.y + nodeB.y) / 2, `R₃ = ${bridgeR3.toFixed(0)}Ω (Decade)`);
    drawBridgeArmResistor((nodeB.x + nodeC.x) / 2, (nodeB.y + nodeC.y) / 2, `R_x = ? (${bridgeRx}Ω DUT)`, "#ec4899");

    // Center Cross-Arm with Sensitive Center-Zero Galvanometer
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(nodeD.x, nodeD.y);
    ctx.lineTo(nodeB.x, nodeB.y);
    ctx.stroke();

    // Galvanometer Meter Dial
    drawGalvanometer(centerX, centerY, br.vg, br.isBalanced);

    // Node Callouts
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px JetBrains Mono, monospace";
    ctx.fillText("Node A (+Vin)", nodeA.x - 45, nodeA.y - 12);
    ctx.fillText("Node C (GND)", nodeC.x - 45, nodeC.y + 24);
    ctx.fillText(`Node D (V_D = ${br.vd.toFixed(2)}V)`, nodeD.x - 130, nodeD.y - 8);
    ctx.fillText(`Node B (V_B = ${br.vb.toFixed(2)}V)`, nodeB.x + 12, nodeB.y - 8);
  }

  // --- Sub-Component Renderers ---

  function drawKnifeSwitch(x, y) {
    ctx.fillStyle = "#94a3b8";
    ctx.beginPath();
    ctx.arc(x - 35, y, 7, 0, Math.PI * 2);
    ctx.arc(x + 35, y, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(x - 35, y);
    ctx.rotate(switchClosed ? 0 : -Math.PI / 4);
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(70, 0);
    ctx.stroke();

    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(70, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Spark Particles
    for (let i = sparks.length - 1; i >= 0; i--) {
      const sp = sparks[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.life -= 0.05;
      if (sp.life <= 0) {
        sparks.splice(i, 1);
        continue;
      }
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 2.5 * sp.life, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawAxialResistor(x, y, ohms, label) {
    const resH = 46;
    const resW = 20;

    const rGrad = ctx.createLinearGradient(x - resW/2, 0, x + resW/2, 0);
    rGrad.addColorStop(0, "#fed7aa");
    rGrad.addColorStop(0.5, "#ffedd5");
    rGrad.addColorStop(1, "#fdba74");
    ctx.fillStyle = rGrad;
    ctx.beginPath();
    ctx.roundRect(x - resW/2, y - resH/2, resW, resH, 5);
    ctx.fill();
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1;
    ctx.stroke();

    const bands = getResistorBands(ohms);
    const bandPositions = [-12, -4, 4, 14];
    bands.forEach((b, idx) => {
      ctx.fillStyle = b.color;
      ctx.fillRect(x - resW/2, y + bandPositions[idx] - 2, resW, 4);
    });
    ctx.fillStyle = "#eab308";
    ctx.fillRect(x - resW/2, y + bandPositions[3] - 2, resW, 4);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 11px JetBrains Mono, monospace";
    ctx.fillText(`${label} = ${ohms.toFixed(1)}Ω`, x - 35, y + resH/2 + 18);
  }

  function drawIncandescentBulb(x, y, rVal, power, isSmart) {
    if (power > 0.05) {
      const glowRad = Math.min(120, 20 + Math.sqrt(power) * 25);
      const radGrad = ctx.createRadialGradient(x, y - 14, 5, x, y - 14, glowRad);
      radGrad.addColorStop(0, "rgba(254, 240, 138, 0.75)");
      radGrad.addColorStop(0.4, "rgba(245, 158, 11, 0.4)");
      radGrad.addColorStop(1, "rgba(245, 158, 11, 0)");

      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(x, y - 14, glowRad, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#d97706";
    ctx.fillRect(x - 10, y + 6, 20, 14);
    ctx.strokeStyle = "#92400e";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 10, y + 6, 20, 14);

    const bulbGlassGrad = ctx.createRadialGradient(x - 4, y - 18, 4, x, y - 14, 22);
    bulbGlassGrad.addColorStop(0, "rgba(255, 255, 255, 0.45)");
    bulbGlassGrad.addColorStop(0.6, "rgba(255, 255, 255, 0.12)");
    bulbGlassGrad.addColorStop(1, "rgba(255, 255, 255, 0.25)");
    ctx.fillStyle = bulbGlassGrad;
    ctx.beginPath();
    ctx.arc(x, y - 14, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const filamentColor = (power > 0.05) ? "#ffffff" : "#64748b";
    ctx.strokeStyle = filamentColor;
    ctx.lineWidth = 2.5;
    if (power > 0.05 && !isSmart) {
      ctx.shadowColor = "#fef08a";
      ctx.shadowBlur = 10;
    }
    ctx.beginPath();
    ctx.moveTo(x - 6, y + 6);
    ctx.lineTo(x - 4, y - 14);
    ctx.lineTo(x, y - 18);
    ctx.lineTo(x + 4, y - 14);
    ctx.lineTo(x + 6, y + 6);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 11px JetBrains Mono, monospace";
    ctx.fillText(`Bulb = ${rVal.toFixed(1)}Ω`, x - 35, y + 36);
  }

  function drawHelicalInductor(x, y, L, XL, isSmart) {
    const coils = 5;
    const coilR = 12;
    const coilStep = 10;
    const startY = y - (coils * coilStep) / 2;

    ctx.strokeStyle = "#34d399";
    ctx.lineWidth = 2.5;

    for (let i = 0; i < coils; i++) {
      ctx.beginPath();
      ctx.arc(x + 4, startY + i * coilStep, coilR, -Math.PI / 2, Math.PI / 2, false);
      ctx.stroke();
    }

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 11px JetBrains Mono, monospace";
    ctx.fillText(`L = ${(L * 1000).toFixed(0)}mH`, x - 35, y + 42);
    ctx.fillStyle = "#34d399";
    ctx.fillText(`X_L = ${XL.toFixed(1)}Ω`, x - 35, y + 54);
  }

  function drawParallelPlateCapacitor(x, y, C, XC) {
    const plateH = 34;
    const plateGap = 12;

    // Left Plate
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(x - plateGap / 2, y - plateH / 2);
    ctx.lineTo(x - plateGap / 2, y + plateH / 2);
    ctx.stroke();

    // Right Plate
    ctx.beginPath();
    ctx.moveTo(x + plateGap / 2, y - plateH / 2);
    ctx.lineTo(x + plateGap / 2, y + plateH / 2);
    ctx.stroke();

    // Dielectric Field Lines
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 1;
    for (let py = y - plateH / 2 + 5; py <= y + plateH / 2 - 5; py += 7) {
      ctx.beginPath();
      ctx.moveTo(x - plateGap / 2, py);
      ctx.lineTo(x + plateGap / 2, py);
      ctx.stroke();
    }

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 11px JetBrains Mono, monospace";
    ctx.fillText(`C = ${(C * 1e6).toFixed(1)}µF`, x - 35, y + 30);
    ctx.fillStyle = "#38bdf8";
    ctx.fillText(`X_C = ${XC.toFixed(1)}Ω`, x - 35, y + 42);
  }

  function drawBridgeArmResistor(x, y, text, color = "#f59e0b") {
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(x - 22, y - 10, 44, 20);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 22, y - 10, 44, 20);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 10px JetBrains Mono, monospace";
    ctx.fillText(text, x - 30, y - 14);
  }

  function drawGalvanometer(x, y, vg, isBalanced) {
    const r = 45;
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isBalanced ? "#10b981" : "#f59e0b";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Center Zero Graticule Arc
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, r - 10, -Math.PI * 0.75, -Math.PI * 0.25);
    ctx.stroke();

    // Center Mark
    ctx.beginPath();
    ctx.moveTo(x, y - r + 10);
    ctx.lineTo(x, y - r + 16);
    ctx.stroke();

    // Deflecting Needle (-45 deg to +45 deg max)
    const maxV = 2.0; // Volts full scale
    const normDeflect = Math.max(-1, Math.min(1, vg / maxV));
    const needleAngle = -Math.PI / 2 + normDeflect * (Math.PI / 4);

    ctx.strokeStyle = isBalanced ? "#10b981" : "#ef4444";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(needleAngle) * (r - 12), y + Math.sin(needleAngle) * (r - 12));
    ctx.stroke();

    // Pivot Cap
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isBalanced ? "#10b981" : "#f59e0b";
    ctx.font = "bold 9px JetBrains Mono, monospace";
    ctx.fillText(isBalanced ? "NULL (BALANCED)" : `ΔV = ${vg.toFixed(3)}V`, x - 42, y + r + 16);
  }

  // Dual-Trace Digital Oscilloscope Screen
  function drawDualTraceOscilloscope(x, y, w, h, ac) {
    // Scope Chassis
    ctx.fillStyle = "#090d16";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Phosphor Green Scope Grid
    ctx.strokeStyle = "rgba(34, 197, 94, 0.12)";
    ctx.lineWidth = 1;
    const gridCols = 8;
    const gridRows = 6;
    for (let c = 1; c < gridCols; c++) {
      ctx.beginPath();
      ctx.moveTo(x + (c * w) / gridCols, y);
      ctx.lineTo(x + (c * w) / gridCols, y + h);
      ctx.stroke();
    }
    for (let r = 1; r < gridRows; r++) {
      ctx.beginPath();
      ctx.moveTo(x, y + (r * h) / gridRows);
      ctx.lineTo(x + w, y + (r * h) / gridRows);
      ctx.stroke();
    }

    // Center Crosshairs
    ctx.strokeStyle = "rgba(34, 197, 94, 0.25)";
    ctx.beginPath();
    ctx.moveTo(x, y + h / 2);
    ctx.lineTo(x + w, y + h / 2);
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w / 2, y + h);
    ctx.stroke();

    // Scope Header Labels
    ctx.font = "bold 10px JetBrains Mono, monospace";
    ctx.fillStyle = "#eab308"; // Ch1 Yellow
    ctx.fillText("CH1: V_source (Yellow)", x + 10, y + 16);
    ctx.fillStyle = "#38bdf8"; // Ch2 Cyan
    ctx.fillText("CH2: I_loop (Cyan)", x + 175, y + 16);

    const midY = y + h / 2;
    const cycles = 2.5;
    const scaleV = (h * 0.35) / Math.max(ac.Vrms * 1.5, 5);
    const scaleI = (h * 0.35) / Math.max(ac.Irms * 1.5, 0.2);

    // Waveform 1: Source Voltage V(t) = V0 sin(omega*t)
    ctx.strokeStyle = "#eab308";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let px = 0; px <= w; px += 2) {
      const theta = (px / w) * cycles * 2 * Math.PI - timeSeconds * 8;
      const vY = midY - Math.sin(theta) * acV0 * scaleV * 0.25;
      if (px === 0) ctx.moveTo(x + px, vY);
      else ctx.lineTo(x + px, vY);
    }
    ctx.stroke();

    // Waveform 2: Current I(t) = I0 sin(omega*t - phi)
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let px = 0; px <= w; px += 2) {
      const theta = (px / w) * cycles * 2 * Math.PI - timeSeconds * 8;
      const iY = midY - Math.sin(theta - ac.phiRad) * ac.I0 * scaleI * 0.25;
      if (px === 0) ctx.moveTo(x + px, iY);
      else ctx.lineTo(x + px, iY);
    }
    ctx.stroke();

    // Phase Difference Readout
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 9px JetBrains Mono, monospace";
    ctx.fillText(`Phase φ = ${ac.phiDeg >= 0 ? "+" : ""}${ac.phiDeg.toFixed(1)}° (${ac.phiDeg > 0 ? "V leads I" : "I leads V"})`, x + 10, y + h - 8);
  }

  // Rotating Phasor Diagram Inset
  function drawPhasorDiagram(x, y, w, h, ac) {
    ctx.fillStyle = "#0b1222";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);

    const cx = x + 75;
    const cy = y + h / 2;
    const maxR = 55;

    // Complex Plane Axes
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - maxR - 10, cy);
    ctx.lineTo(cx + maxR + 10, cy);
    ctx.moveTo(cx, cy - maxR - 10);
    ctx.lineTo(cx, cy + maxR + 10);
    ctx.stroke();

    // Axis Labels
    ctx.font = "9px JetBrains Mono, monospace";
    ctx.fillStyle = "#64748b";
    ctx.fillText("Re", cx + maxR + 2, cy - 4);
    ctx.fillText("Im", cx + 4, cy - maxR - 2);

    const normScale = maxR / Math.max(acV0, 10);

    // Vector 1: Current I along Real Axis
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + maxR * 0.7, cy);
    ctx.stroke();

    // Vector 2: V_R (along Real Axis)
    const vrLen = ac.VR0 * normScale;
    ctx.strokeStyle = "#f59e0b";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + vrLen, cy);
    ctx.stroke();

    // Vector 3: V_L (+90 deg along +Im axis, pointing up)
    const vlLen = ac.VL0 * normScale;
    ctx.strokeStyle = "#34d399";
    ctx.beginPath();
    ctx.moveTo(cx + vrLen, cy);
    ctx.lineTo(cx + vrLen, cy - vlLen);
    ctx.stroke();

    // Vector 4: V_C (-90 deg along -Im axis, pointing down)
    const vcLen = ac.VC0 * normScale;
    ctx.strokeStyle = "#38bdf8";
    ctx.beginPath();
    ctx.moveTo(cx + vrLen, cy - vlLen);
    ctx.lineTo(cx + vrLen, cy - vlLen + vcLen);
    ctx.stroke();

    // Vector 5: V_source Resultant Vector
    ctx.strokeStyle = "#eab308";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + vrLen, cy - (vlLen - vcLen));
    ctx.stroke();

    // Phasor Key & Values (Right of circle)
    const tx = x + 160;
    ctx.font = "bold 9px JetBrains Mono, monospace";
    ctx.fillStyle = "#eab308";
    ctx.fillText(`V_tot = ${acV0.toFixed(1)}V`, tx, y + 20);
    ctx.fillStyle = "#f59e0b";
    ctx.fillText(`V_R  = ${ac.VR0.toFixed(1)}V`, tx, y + 36);
    ctx.fillStyle = "#34d399";
    ctx.fillText(`V_L  = ${ac.VL0.toFixed(1)}V`, tx, y + 52);
    ctx.fillStyle = "#38bdf8";
    ctx.fillText(`V_C  = ${ac.VC0.toFixed(1)}V`, tx, y + 68);

    ctx.fillStyle = "#a855f7";
    ctx.fillText(`Z = ${ac.Z.toFixed(1)}Ω`, tx, y + 90);
    ctx.fillStyle = "#34d399";
    ctx.fillText(`f₀ = ${ac.f0.toFixed(0)}Hz (Q=${ac.Q.toFixed(1)})`, tx, y + 106);
    ctx.fillStyle = "#f8fafc";
    ctx.fillText(`PF = ${ac.powerFactor.toFixed(3)}`, tx, y + 122);
  }

  // Primary Drawing Routine
  function drawCircuit(dtFactor = 1.0) {
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    // Electronics Workbench Ambient Gradient
    const benchGrad = ctx.createLinearGradient(0, 0, 0, h);
    benchGrad.addColorStop(0, "#080d1a");
    benchGrad.addColorStop(0.5, "#0f172a");
    benchGrad.addColorStop(1, "#111c30");
    ctx.fillStyle = benchGrad;
    ctx.fillRect(0, 0, w, h);

    // Anti-Static Grounding Grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.035)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const isSmart = (document.documentElement.getAttribute("data-mode") === "smartboard") ||
                    document.documentElement.classList.contains("fast-smartboard-mode") ||
                    /Android|MAXHUB/i.test(navigator.userAgent);

    if (currentTab === "dc") {
      drawDCView(w, h, isSmart, dtFactor);
    } else if (currentTab === "ac") {
      drawACView(w, h, isSmart, dtFactor);
    } else if (currentTab === "bridge") {
      drawBridgeView(w, h, isSmart);
    }

    // Multimeter Probes Overlay
    if (showProbes) {
      drawMultimeterProbes(w, h);
    }

    ctx.restore();
  }

  function drawMultimeterProbes(w, h) {
    // Red Probe (+)
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(probeRedPos.x - 4, probeRedPos.y - 25, 8, 25);
    ctx.fillStyle = "#94a3b8"; // needle
    ctx.fillRect(probeRedPos.x - 1, probeRedPos.y, 2, 10);

    // Black Probe (-)
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(probeBlackPos.x - 4, probeBlackPos.y - 25, 8, 25);
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(probeBlackPos.x - 1, probeBlackPos.y, 2, 10);

    // Floating DMM Probe Voltage HUD
    let vMeasured = 0;
    if (currentTab === "dc") {
      const dc = calculateDCCircuit();
      vMeasured = dc.v1;
    } else if (currentTab === "ac") {
      const ac = calculateACCircuit();
      vMeasured = ac.Vrms;
    } else {
      const br = calculateBridge();
      vMeasured = Math.abs(br.vg);
    }

    ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(probeRedPos.x + 12, probeRedPos.y - 18, 120, 36, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 11px JetBrains Mono, monospace";
    ctx.fillText(`DMM: ${vMeasured.toFixed(2)} V`, probeRedPos.x + 20, probeRedPos.y + 4);
  }

  // --- Telemetry Updates ---

  function updateTelemetry() {
    const statusBadge = document.getElementById("circuit-status");
    const statusDot = document.getElementById("circuit-status-dot");
    const topoBadge = document.getElementById("topo-badge");

    if (currentTab === "dc") {
      const dc = calculateDCCircuit();
      document.getElementById("lbl-telem-1").innerText = "Total Voltage (V)";
      document.getElementById("val-v").innerText = `${voltage.toFixed(1)} V`;

      document.getElementById("lbl-telem-2").innerText = "Current (I)";
      document.getElementById("val-i").innerText = `${dc.current.toFixed(2)} A`;

      document.getElementById("lbl-telem-3").innerText = "Equiv Res (R_eq)";
      document.getElementById("val-req").innerText = isFinite(dc.req) ? `${dc.req.toFixed(1)} Ω` : "∞ (Open)";

      document.getElementById("lbl-telem-4").innerText = "Bulb Power (P)";
      document.getElementById("val-power").innerText = `${dc.power.toFixed(2)} W`;

      document.getElementById("disp-voltage").innerText = `${voltage.toFixed(1)} V`;
      document.getElementById("disp-r1").innerText = `${r1.toFixed(1)} Ω`;
      document.getElementById("disp-r2").innerText = `${r2.toFixed(1)} Ω`;

      const bands = getResistorBands(r1);
      document.getElementById("r1-bands-text").innerText = `Bands: ${bands[0].name} - ${bands[1].name} - ${bands[2].name} - Gold (${Math.round(r1)} Ω)`;

      topoBadge.innerText = (topology === "series") ? "Series DC Circuit" : "Parallel DC Circuit";
      if (!switchClosed) {
        statusBadge.innerText = "Circuit Open • Zero Current";
        statusDot.style.background = "#ef4444";
      } else {
        statusBadge.innerText = `Active DC Flow (${dc.current.toFixed(2)} A)`;
        statusDot.style.background = "#10b981";
      }

      document.getElementById("eq-ohm").innerHTML = renderLatex("V = I \\cdot R");
      document.getElementById("eq-power").innerHTML = renderLatex("P = I^2 R = \\frac{V^2}{R}");
      document.getElementById("formula-req").innerHTML = (topology === "series") ? renderLatex("R_{\\text{series}} = R_1 + R_2") : renderLatex("\\frac{1}{R_{\\text{eq}}} = \\frac{1}{R_1} + \\frac{1}{R_2}");

    } else if (currentTab === "ac") {
      const ac = calculateACCircuit();
      document.getElementById("lbl-telem-1").innerText = "AC Amplitude / RMS";
      document.getElementById("val-v").innerText = `${acV0.toFixed(1)}V (${ac.Vrms.toFixed(1)}V)`;

      document.getElementById("lbl-telem-2").innerText = "Current I_rms (Peak)";
      document.getElementById("val-i").innerText = `${ac.Irms.toFixed(2)}A (${ac.I0.toFixed(2)}A)`;

      document.getElementById("lbl-telem-3").innerText = "Impedance (Z)";
      document.getElementById("val-req").innerText = `${ac.Z.toFixed(1)} Ω`;

      document.getElementById("lbl-telem-4").innerText = "Resonant f₀ (Q)";
      document.getElementById("val-power").innerText = `${ac.f0.toFixed(0)}Hz (Q=${ac.Q.toFixed(1)})`;

      document.getElementById("disp-ac-v0").innerText = `${acV0.toFixed(1)} V`;
      document.getElementById("disp-ac-freq").innerText = `${acFreq.toFixed(0)} Hz`;
      document.getElementById("disp-ac-l").innerText = `${(acL * 1000).toFixed(0)} mH`;
      document.getElementById("disp-ac-c").innerText = `${(acC * 1e6).toFixed(1)} µF`;
      document.getElementById("disp-ac-r").innerText = `${acR.toFixed(1)} Ω`;

      topoBadge.innerText = ac.isResonant ? "🎯 RLC Resonant Mode" : (ac.phiDeg > 0 ? "⚡ Inductive Dominant" : "🔋 Capacitive Dominant");
      if (!switchClosed) {
        statusBadge.innerText = "AC Generator Disconnected";
        statusDot.style.background = "#ef4444";
      } else {
        statusBadge.innerText = `AC Flow (φ=${ac.phiDeg.toFixed(1)}°, PF=${ac.powerFactor.toFixed(2)})`;
        statusDot.style.background = ac.isResonant ? "#34d399" : "#a855f7";
      }

      document.getElementById("eq-ohm").innerHTML = renderLatex("Z = \\sqrt{R^2 + (X_L - X_C)^2}");
      document.getElementById("eq-power").innerHTML = renderLatex("f_0 = \\frac{1}{2\\pi \\sqrt{LC}}");
      document.getElementById("formula-req").innerHTML = renderLatex("\\tan\\phi = \\frac{\\omega L - \\frac{1}{\\omega C}}{R}");

    } else if (currentTab === "bridge") {
      const br = calculateBridge();
      document.getElementById("lbl-telem-1").innerText = "Bridge Input (V_in)";
      document.getElementById("val-v").innerText = `${bridgeVin.toFixed(1)} V`;

      document.getElementById("lbl-telem-2").innerText = "Galvanometer (V_G)";
      document.getElementById("val-i").innerText = `${(br.vg * 1000).toFixed(1)} mV`;

      document.getElementById("lbl-telem-3").innerText = "DUT Measured (R_x)";
      document.getElementById("val-req").innerText = `${br.rxCalc.toFixed(1)} Ω`;

      document.getElementById("lbl-telem-4").innerText = "Balance State";
      document.getElementById("val-power").innerText = br.isBalanced ? "BALANCED (NULL)" : "OFF-BALANCE";

      document.getElementById("disp-bridge-v").innerText = `${bridgeVin.toFixed(1)} V`;
      document.getElementById("disp-bridge-r1").innerText = `${bridgeR1.toFixed(0)} Ω`;
      document.getElementById("disp-bridge-r2").innerText = `${bridgeR2.toFixed(0)} Ω`;
      document.getElementById("disp-bridge-r3").innerText = `${bridgeR3.toFixed(0)} Ω`;

      topoBadge.innerText = br.isBalanced ? "⚖️ Bridge Balanced (Null)" : "⚖️ Wheatstone Bridge";
      statusBadge.innerText = br.isBalanced ? "Galvanometer at Null (0.00 V)" : `Galvanometer Deflected (ΔV = ${br.vg.toFixed(3)}V)`;
      statusDot.style.background = br.isBalanced ? "#10b981" : "#f59e0b";

      document.getElementById("eq-ohm").innerHTML = renderLatex("R_x = \\frac{R_2 \\cdot R_3}{R_1}");
      document.getElementById("eq-power").innerHTML = renderLatex("V_G = V_B - V_D = 0");
      document.getElementById("formula-req").innerHTML = renderLatex("\\frac{R_1}{R_2} = \\frac{R_3}{R_x}");
    }

    requestRender();
  }

  // --- Animation & Render Loop ---

  let lastFrameTime = 0;
  let needsRedraw = true;
  function requestRender() {
    needsRedraw = true;
  }

  function renderLoop(now) {
    if (!container.isConnected) {
      if (animId) cancelAnimationFrame(animId);
      return;
    }
    const isSmart = (document.documentElement.getAttribute("data-mode") === "smartboard") ||
                    document.documentElement.classList.contains("fast-smartboard-mode") ||
                    /Android|MAXHUB/i.test(navigator.userAgent);
    const interval = isSmart ? 33 : 16;
    const currentTime = now || performance.now();

    if (!lastFrameTime || currentTime - lastFrameTime >= interval) {
      const elapsed = lastFrameTime ? Math.min((currentTime - lastFrameTime) / 1000, 0.1) : (interval / 1000);
      lastFrameTime = currentTime;
      timeSeconds += elapsed;
      const dtFactor = Math.min(Math.max(elapsed * 60, 0.5), 3.0);
      needsRedraw = false;
      const photoEl = container.querySelector("#circuit-photo-overlay");
      if (!photoEl || photoEl.style.display !== "block") {
        drawCircuit(dtFactor);
      }
    }
    animId = requestAnimationFrame(renderLoop);
  }
  renderLoop();

  // --- Mode Switching Handlers ---

  const tabDC = document.getElementById("circuit-tab-dc");
  const tabAC = document.getElementById("circuit-tab-ac");
  const tabBridge = document.getElementById("circuit-tab-bridge");
  const tabPhoto = document.getElementById("circuit-tab-photo");

  const ctrlDC = document.getElementById("controls-dc-mode");
  const ctrlAC = document.getElementById("controls-ac-mode");
  const ctrlBridge = document.getElementById("controls-bridge-mode");

  function switchTab(tab) {
    currentTab = tab;
    [tabDC, tabAC, tabBridge, tabPhoto].forEach(btn => {
      if (btn) {
        btn.classList.remove("active");
        btn.style.background = "transparent";
        btn.style.color = "#94a3b8";
      }
    });

    ctrlDC.style.display = "none";
    ctrlAC.style.display = "none";
    ctrlBridge.style.display = "none";
    photoOverlay.style.display = "none";

    if (tab === "dc") {
      tabDC.classList.add("active");
      tabDC.style.background = "rgba(245, 158, 11, 0.25)";
      tabDC.style.color = "#fbbf24";
      ctrlDC.style.display = "block";
    } else if (tab === "ac") {
      tabAC.classList.add("active");
      tabAC.style.background = "rgba(168, 85, 247, 0.25)";
      tabAC.style.color = "#c084fc";
      ctrlAC.style.display = "block";
    } else if (tab === "bridge") {
      tabBridge.classList.add("active");
      tabBridge.style.background = "rgba(16, 185, 129, 0.25)";
      tabBridge.style.color = "#34d399";
      ctrlBridge.style.display = "block";
    } else if (tab === "photo") {
      tabPhoto.classList.add("active");
      tabPhoto.style.background = "rgba(245, 158, 11, 0.25)";
      tabPhoto.style.color = "#fbbf24";
      photoOverlay.style.display = "block";
    }

    updateTelemetry();
  }

  tabDC?.addEventListener("click", () => switchTab("dc"));
  tabAC?.addEventListener("click", () => switchTab("ac"));
  tabBridge?.addEventListener("click", () => switchTab("bridge"));
  tabPhoto?.addEventListener("click", () => switchTab("photo"));

  // --- DC Controls Listeners ---

  document.getElementById("input-voltage")?.addEventListener("input", (e) => {
    voltage = parseFloat(e.target.value);
    updateTelemetry();
  });

  document.getElementById("input-r1")?.addEventListener("input", (e) => {
    r1 = parseFloat(e.target.value);
    updateTelemetry();
  });

  document.getElementById("input-r2")?.addEventListener("input", (e) => {
    r2 = parseFloat(e.target.value);
    updateTelemetry();
  });

  document.getElementById("select-topology")?.addEventListener("change", (e) => {
    topology = e.target.value;
    updateTelemetry();
  });

  document.getElementById("btn-preset-series")?.addEventListener("click", () => {
    topology = "series";
    document.getElementById("select-topology").value = "series";
    voltage = 12;
    r1 = 10;
    r2 = 10;
    document.getElementById("input-voltage").value = 12;
    document.getElementById("input-r1").value = 10;
    document.getElementById("input-r2").value = 10;
    switchClosed = true;
    updateTelemetry();
  });

  document.getElementById("btn-preset-parallel")?.addEventListener("click", () => {
    topology = "parallel";
    document.getElementById("select-topology").value = "parallel";
    voltage = 12;
    r1 = 10;
    r2 = 10;
    document.getElementById("input-voltage").value = 12;
    document.getElementById("input-r1").value = 10;
    document.getElementById("input-r2").value = 10;
    switchClosed = true;
    updateTelemetry();
  });

  // --- AC Controls Listeners ---

  document.getElementById("input-ac-v0")?.addEventListener("input", (e) => {
    acV0 = parseFloat(e.target.value);
    updateTelemetry();
  });

  document.getElementById("input-ac-freq")?.addEventListener("input", (e) => {
    acFreq = parseFloat(e.target.value);
    updateTelemetry();
  });

  document.getElementById("input-ac-l")?.addEventListener("input", (e) => {
    acL = parseFloat(e.target.value) / 1000;
    updateTelemetry();
  });

  document.getElementById("input-ac-c")?.addEventListener("input", (e) => {
    acC = parseFloat(e.target.value) * 1e-6;
    updateTelemetry();
  });

  document.getElementById("input-ac-r")?.addEventListener("input", (e) => {
    acR = parseFloat(e.target.value);
    updateTelemetry();
  });

  // AC Presets
  document.getElementById("btn-preset-resonance")?.addEventListener("click", () => {
    const f0 = 1 / (2 * Math.PI * Math.sqrt(acL * acC));
    acFreq = Math.round(f0);
    document.getElementById("input-ac-freq").value = acFreq;
    updateTelemetry();
    playClickSound(440);
  });

  document.getElementById("btn-preset-inductive")?.addEventListener("click", () => {
    const f0 = 1 / (2 * Math.PI * Math.sqrt(acL * acC));
    acFreq = Math.round(f0 * 2.0);
    document.getElementById("input-ac-freq").value = acFreq;
    updateTelemetry();
  });

  document.getElementById("btn-preset-capacitive")?.addEventListener("click", () => {
    const f0 = 1 / (2 * Math.PI * Math.sqrt(acL * acC));
    acFreq = Math.max(20, Math.round(f0 * 0.5));
    document.getElementById("input-ac-freq").value = acFreq;
    updateTelemetry();
  });

  document.getElementById("btn-preset-high-q")?.addEventListener("click", () => {
    acL = 0.300;
    acC = 3.0e-6;
    acR = 10.0;
    const f0 = 1 / (2 * Math.PI * Math.sqrt(acL * acC));
    acFreq = Math.round(f0);
    document.getElementById("input-ac-l").value = 300;
    document.getElementById("input-ac-c").value = 3;
    document.getElementById("input-ac-r").value = 10;
    document.getElementById("input-ac-freq").value = acFreq;
    updateTelemetry();
    playClickSound(520);
  });

  // --- Wheatstone Bridge Controls Listeners ---

  document.getElementById("input-bridge-v")?.addEventListener("input", (e) => {
    bridgeVin = parseFloat(e.target.value);
    updateTelemetry();
  });

  document.getElementById("input-bridge-r1")?.addEventListener("input", (e) => {
    bridgeR1 = parseFloat(e.target.value);
    updateTelemetry();
  });

  document.getElementById("input-bridge-r2")?.addEventListener("input", (e) => {
    bridgeR2 = parseFloat(e.target.value);
    updateTelemetry();
  });

  document.getElementById("input-bridge-r3")?.addEventListener("input", (e) => {
    bridgeR3 = parseFloat(e.target.value);
    updateTelemetry();
  });

  document.getElementById("btn-nudge-r3-down")?.addEventListener("click", () => {
    bridgeR3 = Math.max(1, bridgeR3 - 1);
    document.getElementById("input-bridge-r3").value = bridgeR3;
    updateTelemetry();
    playClickSound(260);
  });

  document.getElementById("btn-nudge-r3-up")?.addEventListener("click", () => {
    bridgeR3 = Math.min(500, bridgeR3 + 1);
    document.getElementById("input-bridge-r3").value = bridgeR3;
    updateTelemetry();
    playClickSound(340);
  });

  document.getElementById("btn-auto-null")?.addEventListener("click", () => {
    // Null condition: R3 = (R1 * Rx) / R2
    bridgeR3 = Math.round((bridgeR1 * bridgeRx) / bridgeR2);
    document.getElementById("input-bridge-r3").value = bridgeR3;
    updateTelemetry();
    playClickSound(580);
  });

  document.getElementById("select-unknown-dut")?.addEventListener("change", (e) => {
    bridgeRx = parseFloat(e.target.value);
    updateTelemetry();
    playClickSound(300);
  });

  // Universal Action Handlers
  document.getElementById("btn-toggle-switch")?.addEventListener("click", () => {
    switchClosed = !switchClosed;
    playClickSound();

    if (switchClosed) {
      const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
      const w = canvas.width / dpr;
      const switchX = (140 + w - 140) / 2;
      for (let k = 0; k < 12; k++) {
        sparks.push({
          x: switchX + 35,
          y: 100,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5,
          life: 1.0
        });
      }
    }
    updateTelemetry();
  });

  document.getElementById("btn-reset-bench")?.addEventListener("click", () => {
    voltage = 12.0;
    r1 = 10.0;
    r2 = 10.0;
    acV0 = 10.0;
    acFreq = 159.0;
    acL = 0.100;
    acC = 10.0e-6;
    acR = 20.0;
    bridgeVin = 10.0;
    bridgeR1 = 100.0;
    bridgeR2 = 100.0;
    bridgeR3 = 80.0;
    bridgeRx = 120.0;
    switchClosed = true;

    document.getElementById("input-voltage").value = 12;
    document.getElementById("input-r1").value = 10;
    document.getElementById("input-r2").value = 10;
    document.getElementById("input-ac-v0").value = 10;
    document.getElementById("input-ac-freq").value = 159;
    document.getElementById("input-ac-l").value = 100;
    document.getElementById("input-ac-c").value = 10;
    document.getElementById("input-ac-r").value = 20;
    document.getElementById("input-bridge-v").value = 10;
    document.getElementById("input-bridge-r1").value = 100;
    document.getElementById("input-bridge-r2").value = 100;
    document.getElementById("input-bridge-r3").value = 80;

    updateTelemetry();
    playClickSound(360);
  });

  document.getElementById("chk-probes")?.addEventListener("change", (e) => {
    showProbes = e.target.checked;
    requestRender();
  });

  document.getElementById("chk-flow-dir")?.addEventListener("change", (e) => {
    electronFlow = e.target.checked;
    requestRender();
  });

  // --- Direct Tactile Pointer Dragging ---

  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
    const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    return {
      x: (clientX - rect.left),
      y: (clientY - rect.top)
    };
  }

  canvas.addEventListener("pointerdown", (e) => {
    try { canvas.setPointerCapture(e.pointerId); } catch(err) {}
    const { x, y } = getCanvasCoords(e);

    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
    const w = canvas.width / dpr;
    const switchX = (140 + w - 140) / 2;

    // Check click on knife switch
    if (Math.abs(x - switchX) < 45 && Math.abs(y - 100) < 30) {
      switchClosed = !switchClosed;
      playClickSound();
      updateTelemetry();
      return;
    }

    // Check dragging multimeter probes
    if (showProbes) {
      if (Math.hypot(x - probeRedPos.x, y - probeRedPos.y) < 25) {
        dragTarget = "probe_red";
        return;
      }
      if (Math.hypot(x - probeBlackPos.x, y - probeBlackPos.y) < 25) {
        dragTarget = "probe_black";
        return;
      }
    }
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!dragTarget) return;
    const { x, y } = getCanvasCoords(e);
    if (dragTarget === "probe_red") {
      probeRedPos.x = x;
      probeRedPos.y = y;
      requestRender();
    } else if (dragTarget === "probe_black") {
      probeBlackPos.x = x;
      probeBlackPos.y = y;
      requestRender();
    }
  });

  canvas.addEventListener("pointerup", (e) => {
    if (dragTarget) {
      try { canvas.releasePointerCapture(e.pointerId); } catch(err) {}
      dragTarget = null;
    }
  });

  // --- Keyboard Shortcuts ---

  function handleKeyDown(e) {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "SELECT")) return;
    if (e.code === "Space") {
      e.preventDefault();
      switchClosed = !switchClosed;
      playClickSound();
      updateTelemetry();
    } else if (e.key === "1") {
      switchTab("dc");
    } else if (e.key === "2") {
      switchTab("ac");
    } else if (e.key === "3") {
      switchTab("bridge");
    } else if (e.key === "4") {
      switchTab("photo");
    } else if (e.key === "r" || e.key === "R") {
      document.getElementById("btn-reset-bench")?.click();
    } else if (e.key === "e" || e.key === "E") {
      document.getElementById("btn-export-circ-csv")?.click();
    }
  }
  window.addEventListener("keydown", handleKeyDown);

  // --- Multi-Trial Logging & CSV Exporter ---

  document.getElementById("btn-record-circ-trial")?.addEventListener("click", () => {
    let trialData = {};

    if (currentTab === "dc") {
      const dc = calculateDCCircuit();
      trialData = {
        "Mode": "DC Ohm & Kirchhoff",
        "Voltage (V)": parseFloat(voltage.toFixed(1)),
        "R1 (Ω)": parseFloat(r1.toFixed(1)),
        "R2 (Ω)": parseFloat(r2.toFixed(1)),
        "Req (Ω)": parseFloat(isFinite(dc.req) ? dc.req.toFixed(2) : 99999),
        "Current (A)": parseFloat(dc.current.toFixed(3)),
        "Power (W)": parseFloat(dc.power.toFixed(2))
      };
    } else if (currentTab === "ac") {
      const ac = calculateACCircuit();
      trialData = {
        "Mode": "AC RLC Resonance",
        "V0 (V)": parseFloat(acV0.toFixed(1)),
        "Vrms (V)": parseFloat(ac.Vrms.toFixed(2)),
        "Freq (Hz)": parseFloat(acFreq.toFixed(0)),
        "L (mH)": parseFloat((acL * 1000).toFixed(0)),
        "C (µF)": parseFloat((acC * 1e6).toFixed(1)),
        "R (Ω)": parseFloat(acR.toFixed(1)),
        "Z (Ω)": parseFloat(ac.Z.toFixed(2)),
        "Irms (A)": parseFloat(ac.Irms.toFixed(3)),
        "f0 (Hz)": parseFloat(ac.f0.toFixed(0)),
        "Q Factor": parseFloat(ac.Q.toFixed(2)),
        "Phase (deg)": parseFloat(ac.phiDeg.toFixed(1))
      };
    } else {
      const br = calculateBridge();
      trialData = {
        "Mode": "Wheatstone Bridge",
        "Vin (V)": parseFloat(bridgeVin.toFixed(1)),
        "R1 (Ω)": parseFloat(bridgeR1.toFixed(0)),
        "R2 (Ω)": parseFloat(bridgeR2.toFixed(0)),
        "R3 Decade (Ω)": parseFloat(bridgeR3.toFixed(0)),
        "Rx Actual (Ω)": parseFloat(bridgeRx.toFixed(0)),
        "Rx Calc (Ω)": parseFloat(br.rxCalc.toFixed(2)),
        "Galvano V (mV)": parseFloat((br.vg * 1000).toFixed(2)),
        "Status": br.isBalanced ? "BALANCED (NULL)" : "OFF-BALANCE"
      };
    }

    LabTrialStore.addTrial("circuits", { measurements: trialData });
    const trials = LabTrialStore.getTrials("circuits");
    trials.forEach((tr, i) => {
      const pill = document.getElementById(`circ-pill-trial-${i + 1}`);
      if (pill) {
        pill.style.opacity = "1";
        pill.innerText = `Trial ${tr.trialNumber} [${tr.measurements["Mode"]}]: ${tr.measurements["Status"] || "Recorded"}`;
      }
    });
    playClickSound(500);
  });

  document.getElementById("btn-export-circ-csv")?.addEventListener("click", () => {
    if (currentTab === "ac") {
      const ac = calculateACCircuit();
      const f0 = ac.f0;
      const rows = [];

      // Current operating point
      rows.push([
        parseFloat(acFreq.toFixed(1)),
        parseFloat(ac.XL.toFixed(2)),
        parseFloat(ac.XC.toFixed(2)),
        parseFloat(ac.Xnet.toFixed(2)),
        parseFloat(ac.Z.toFixed(2)),
        parseFloat(ac.Irms.toFixed(4)),
        parseFloat(ac.phiDeg.toFixed(2)),
        parseFloat(ac.powerFactor.toFixed(3)),
        parseFloat(ac.powerReal.toFixed(3)),
        ac.isResonant ? "RESONANT" : (ac.phiDeg > 0 ? "INDUCTIVE LAG" : "CAPACITIVE LEAD")
      ]);

      // Frequency sweep around resonance
      const testFreqs = [0.25 * f0, 0.5 * f0, 0.75 * f0, 0.9 * f0, f0, 1.1 * f0, 1.25 * f0, 1.5 * f0, 2.0 * f0];
      testFreqs.forEach(tf => {
        if (Math.abs(tf - acFreq) > 2) {
          const omegaT = 2 * Math.PI * tf;
          const xlT = omegaT * acL;
          const xcT = 1 / (omegaT * acC);
          const xnetT = xlT - xcT;
          const zT = Math.sqrt(acR * acR + xnetT * xnetT);
          const phiRadT = Math.atan2(xnetT, acR);
          const phiDegT = (phiRadT * 180) / Math.PI;
          const irmsT = (acV0 / Math.SQRT2) / zT;
          const pfT = Math.cos(phiRadT);
          const pT = (acV0 / Math.SQRT2) * irmsT * pfT;
          rows.push([
            parseFloat(tf.toFixed(1)),
            parseFloat(xlT.toFixed(2)),
            parseFloat(xcT.toFixed(2)),
            parseFloat(xnetT.toFixed(2)),
            parseFloat(zT.toFixed(2)),
            parseFloat(irmsT.toFixed(4)),
            parseFloat(phiDegT.toFixed(2)),
            parseFloat(pfT.toFixed(3)),
            parseFloat(pT.toFixed(3)),
            Math.abs(tf - f0) < 1 ? "NATURAL RESONANCE f₀" : (phiDegT > 0 ? "Inductive" : "Capacitive")
          ]);
        }
      });

      exportLabDataCsv({
        title: "Precision AC Series RLC Resonance & Impedance Laboratory",
        labId: "circuits_ac",
        parameters: {
          "Active Mode": "AC Series RLC Resonance",
          "AC Voltage Amplitude (V₀)": `${acV0.toFixed(1)} V`,
          "AC Frequency (f)": `${acFreq.toFixed(1)} Hz`,
          "Resistance (R)": `${acR.toFixed(1)} Ω`,
          "Inductance (L)": `${(acL * 1000).toFixed(1)} mH`,
          "Capacitance (C)": `${(acC * 1e6).toFixed(1)} µF`,
          "Resonant Frequency (f₀)": `${f0.toFixed(1)} Hz`,
          "Quality Factor (Q)": ac.Q.toFixed(2),
          "Bandwidth (Δf)": `${ac.deltaF.toFixed(1)} Hz`,
          "Switch State": switchClosed ? "CLOSED" : "OPEN"
        },
        headers: [
          "Frequency f (Hz)",
          "Inductive XL (Ω)",
          "Capacitive XC (Ω)",
          "Net Reactance Xnet (Ω)",
          "Impedance Z (Ω)",
          "Current Irms (A)",
          "Phase φ (deg)",
          "Power Factor",
          "Real Power P (W)",
          "Operating Regime"
        ],
        dataRows: rows
      });
    } else if (currentTab === "bridge") {
      const br = calculateBridge();
      const rows = [
        ["Current Bridge State", bridgeVin, bridgeR1, bridgeR2, bridgeR3, bridgeRx, parseFloat(br.vb.toFixed(3)), parseFloat(br.vd.toFixed(3)), parseFloat(br.vg.toFixed(4)), parseFloat(br.rxCalc.toFixed(2)), br.isBalanced ? "BALANCED NULL (VG ≈ 0)" : "OFF-BALANCE"]
      ];

      // Benchmark balanced null state
      const balancedRx = (bridgeR2 * bridgeR3) / bridgeR1;
      if (Math.abs(balancedRx - bridgeRx) > 0.5) {
        const vbNull = bridgeVin * (bridgeR2 / (bridgeR1 + bridgeR2));
        rows.push([
          "Theoretical Balanced Null",
          bridgeVin,
          bridgeR1,
          bridgeR2,
          bridgeR3,
          parseFloat(balancedRx.toFixed(2)),
          parseFloat(vbNull.toFixed(3)),
          parseFloat(vbNull.toFixed(3)),
          0.0000,
          parseFloat(balancedRx.toFixed(2)),
          "IDEAL NULL (R1/R2 = R3/Rx)"
        ]);
      }

      exportLabDataCsv({
        title: "Precision Wheatstone Bridge Resistance Metrology Laboratory",
        labId: "circuits_bridge",
        parameters: {
          "Active Mode": "Wheatstone Bridge Null Metrology",
          "DC Excitation (Vin)": `${bridgeVin.toFixed(1)} V`,
          "Ratio Arm R1": `${bridgeR1.toFixed(1)} Ω`,
          "Ratio Arm R2": `${bridgeR2.toFixed(1)} Ω`,
          "Standard Arm R3": `${bridgeR3.toFixed(1)} Ω`,
          "Unknown Arm Rx (Actual)": `${bridgeRx.toFixed(1)} Ω`,
          "Calculated Rx": `${br.rxCalc.toFixed(2)} Ω`,
          "Galvanometer Potential VG": `${br.vg.toFixed(4)} V`,
          "Bridge Null Status": br.isBalanced ? "BALANCED (VG = 0 V)" : "DEFLECTED"
        },
        headers: [
          "Measurement Run",
          "Supply Vin (V)",
          "R1 (Ω)",
          "R2 (Ω)",
          "R3 (Ω)",
          "Rx (Ω)",
          "Node VB (V)",
          "Node VD (V)",
          "Galvanometer VG (V)",
          "Calculated Rx (Ω)",
          "Null Balance Status"
        ],
        dataRows: rows
      });
    } else {
      // DC Kirchhoff & Ohm's Law Mode
      const dc = calculateDCCircuit();
      const pTot = switchClosed ? (topology === "series" ? dc.current * dc.current * (r1 + r2) : voltage * (dc.i1 + dc.i2)) : 0;
      const rows = [
        ["Branch 1 (R1)", r1, isFinite(dc.i1) ? parseFloat(dc.i1.toFixed(3)) : 0, isFinite(dc.v1) ? parseFloat(dc.v1.toFixed(2)) : 0, isFinite(dc.i1) ? parseFloat((dc.i1 * dc.v1).toFixed(3)) : 0, "Ohmic Drop V1 = I1 · R1"],
        ["Branch 2 (R2)", r2, isFinite(dc.i2) ? parseFloat(dc.i2.toFixed(3)) : 0, isFinite(dc.v2) ? parseFloat(dc.v2.toFixed(2)) : 0, isFinite(dc.i2) ? parseFloat((dc.i2 * dc.v2).toFixed(3)) : 0, "Ohmic Drop V2 = I2 · R2"],
        ["Total Network", isFinite(dc.req) ? parseFloat(dc.req.toFixed(2)) : "Open", isFinite(dc.current) ? parseFloat(dc.current.toFixed(3)) : 0, voltage, parseFloat(pTot.toFixed(3)), topology === "series" ? "Series Req = R1 + R2" : "Parallel 1/Req = 1/R1 + 1/R2"]
      ];

      exportLabDataCsv({
        title: "Precision DC Circuit Analysis Laboratory",
        labId: "circuits_dc",
        parameters: {
          "Active Mode": topology === "series" ? "DC Series Circuit" : "DC Parallel Circuit",
          "DC Voltage (Vin)": `${voltage.toFixed(1)} V`,
          "Resistor R1": `${r1.toFixed(1)} Ω`,
          "Resistor R2": `${r2.toFixed(1)} Ω`,
          "Equivalent Resistance (Req)": isFinite(dc.req) ? `${dc.req.toFixed(2)} Ω` : "Open Circuit",
          "Total Supply Current (Itot)": isFinite(dc.current) ? `${dc.current.toFixed(3)} A` : "0.000 A",
          "Total Circuit Power": `${pTot.toFixed(2)} W`,
          "Switch State": switchClosed ? "CLOSED" : "OPEN"
        },
        headers: [
          "Component / Node",
          "Resistance (Ω)",
          "Current (A)",
          "Voltage Drop (V)",
          "Power Dissipation (W)",
          "Network Law"
        ],
        dataRows: rows
      });
    }
  });

  document.getElementById("btn-open-circ-report")?.addEventListener("click", () => {
    const trials = LabTrialStore.getTrials("circuits");
    const dc = calculateDCCircuit();
    const ac = calculateACCircuit();
    const br = calculateBridge();

    openLabReportModal({
      title: "Precision DC & AC Circuit Analysis Suite",
      subject: "Physics",
      inquiryQuestion: "How do reactive impedance, phase relationships, and resonance emerge in AC RLC networks compared to DC Kirchhoff and Wheatstone bridge topologies?",
      parameters: {
        "Active Mode": currentTab.toUpperCase(),
        "DC Voltage": `${voltage.toFixed(1)} V`,
        "DC Req": isFinite(dc.req) ? `${dc.req.toFixed(2)} Ω` : "Open",
        "AC Resonant f0": `${ac.f0.toFixed(0)} Hz`,
        "AC Quality Factor Q": `${ac.Q.toFixed(2)}`,
        "AC Impedance Z": `${ac.Z.toFixed(2)} Ω`,
        "Wheatstone Rx Calculated": `${br.rxCalc.toFixed(2)} Ω`
      },
      trials,
      formulas: [
        "V = I \\cdot R \\quad (\\text{Ohm's Law})",
        "Z = \\sqrt{R^2 + (X_L - X_C)^2} \\quad (\\text{AC RLC Impedance})",
        "X_L = \\omega L = 2\\pi f L, \\quad X_C = \\frac{1}{\\omega C} = \\frac{1}{2\\pi f C}",
        "f_0 = \\frac{1}{2\\pi \\sqrt{LC}}, \\quad Q = \\frac{\\omega_0 L}{R} = \\frac{1}{R}\\sqrt{\\frac{L}{C}}",
        "\\tan\\phi = \\frac{X_L - X_C}{R}, \\quad P_{\\text{avg}} = V_{\\text{rms}} I_{\\text{rms}} \\cos\\phi",
        "\\frac{R_1}{R_2} = \\frac{R_3}{R_x} \\implies R_x = \\frac{R_2 R_3}{R_1} \\quad (\\text{Wheatstone Bridge Null})"
      ]
    });
  });

  // Mount Post-Lab Checkpoint Assessment
  mountLabCheckpoint("circuits-checkpoint-container", "circuits");

  function handleResize() {
    if (!container || !container.isConnected) {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const dpr = typeof window.getLabDPR === "function" ? window.getLabDPR() : (window.devicePixelRatio || 1);
    canvas.width = rect.width * dpr;
    canvas.height = 530 * dpr;
    requestRender();
  }
  window.addEventListener("resize", handleResize);
  handleResize();
  updateTelemetry();

  const cleanup = () => {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("keydown", handleKeyDown);
  };
  _currentCircuitsCleanup = cleanup;
  return cleanup;
}
