// Edugates-ClipSAT Science Labs - Chemistry: Precision Interactive Periodic Table & Quantum Orbitals
// Complete Periodic Matrix, Multi-Property Heatmaps (EN, IE, Radius), 3D Animated Bohr Orbital Simulator,
// 4K Museum Mineral Specimen Gallery, and Analytical Flame Emission Spectroscopy.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";

export function initPeriodicTableLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Comprehensive High-Yield Periodic Elements Database
  const elementsData = [
    // Period 1
    { z: 1, s: "H", n: "Hydrogen", m: 1.008, cat: "nonmetal", period: 1, group: 1, en: 2.20, ie: 1312, r: 53, shells: [1], ec: "1s¹", flame: "#60a5fa", lines: [656, 486, 434] },
    { z: 2, s: "He", n: "Helium", m: 4.003, cat: "noble", period: 1, group: 18, en: null, ie: 2372, r: 31, shells: [2], ec: "1s²", flame: "#f472b6", lines: [587, 667, 501] },

    // Period 2
    { z: 3, s: "Li", n: "Lithium", m: 6.94, cat: "alkali", period: 2, group: 1, en: 0.98, ie: 520, r: 167, shells: [2, 1], ec: "[He] 2s¹", flame: "#ef4444", lines: [670, 610] },
    { z: 4, s: "Be", n: "Beryllium", m: 9.012, cat: "alkaline", period: 2, group: 2, en: 1.57, ie: 899, r: 112, shells: [2, 2], ec: "[He] 2s²", flame: "#ffffff", lines: [457, 313] },
    { z: 5, s: "B", n: "Boron", m: 10.81, cat: "metalloid", period: 2, group: 13, en: 2.04, ie: 801, r: 87, shells: [2, 3], ec: "[He] 2s² 2p¹", flame: "#22c55e", lines: [548, 518] },
    { z: 6, s: "C", n: "Carbon", m: 12.011, cat: "nonmetal", period: 2, group: 14, en: 2.55, ie: 1086, r: 67, shells: [2, 4], ec: "[He] 2s² 2p²", flame: null, lines: [426, 658] },
    { z: 7, s: "N", n: "Nitrogen", m: 14.007, cat: "nonmetal", period: 2, group: 15, en: 3.04, ie: 1402, r: 56, shells: [2, 5], ec: "[He] 2s² 2p³", flame: null, lines: [500, 567] },
    { z: 8, s: "O", n: "Oxygen", m: 15.999, cat: "nonmetal", period: 2, group: 16, en: 3.44, ie: 1314, r: 48, shells: [2, 6], ec: "[He] 2s² 2p⁴", flame: null, lines: [777, 844] },
    { z: 9, s: "F", n: "Fluorine", m: 18.998, cat: "halogen", period: 2, group: 17, en: 3.98, ie: 1681, r: 42, shells: [2, 7], ec: "[He] 2s² 2p⁵", flame: null, lines: [685, 739] },
    { z: 10, s: "Ne", n: "Neon", m: 20.180, cat: "noble", period: 2, group: 18, en: null, ie: 2081, r: 38, shells: [2, 8], ec: "[He] 2s² 2p⁶", flame: "#f97316", lines: [585, 614, 640] },

    // Period 3
    { z: 11, s: "Na", n: "Sodium", m: 22.990, cat: "alkali", period: 3, group: 1, en: 0.93, ie: 496, r: 190, shells: [2, 8, 1], ec: "[Ne] 3s¹", flame: "#eab308", lines: [589, 589.6] },
    { z: 12, s: "Mg", n: "Magnesium", m: 24.305, cat: "alkaline", period: 3, group: 2, en: 1.31, ie: 738, r: 145, shells: [2, 8, 2], ec: "[Ne] 3s²", flame: "#ffffff", lines: [518, 517, 285] },
    { z: 13, s: "Al", n: "Aluminum", m: 26.982, cat: "post-transition", period: 3, group: 13, en: 1.61, ie: 578, r: 118, shells: [2, 8, 3], ec: "[Ne] 3s² 3p¹", flame: null, lines: [396, 394] },
    { z: 14, s: "Si", n: "Silicon", m: 28.085, cat: "metalloid", period: 3, group: 14, en: 1.90, ie: 786, r: 111, shells: [2, 8, 4], ec: "[Ne] 3s² 3p²", flame: null, lines: [288, 251] },
    { z: 15, s: "P", n: "Phosphorus", m: 30.974, cat: "nonmetal", period: 3, group: 15, en: 2.19, ie: 1012, r: 98, shells: [2, 8, 5], ec: "[Ne] 3s² 3p³", flame: null, lines: [253, 255] },
    { z: 16, s: "S", n: "Sulfur", m: 32.06, cat: "nonmetal", period: 3, group: 16, en: 2.58, ie: 1000, r: 88, shells: [2, 8, 6], ec: "[Ne] 3s² 3p⁴", flame: "#60a5fa", lines: [469, 545] },
    { z: 17, s: "Cl", n: "Chlorine", m: 35.45, cat: "halogen", period: 3, group: 17, en: 3.16, ie: 1251, r: 79, shells: [2, 8, 7], ec: "[Ne] 3s² 3p⁵", flame: null, lines: [479, 481] },
    { z: 18, s: "Ar", n: "Argon", m: 39.948, cat: "noble", period: 3, group: 18, en: null, ie: 1521, r: 71, shells: [2, 8, 8], ec: "[Ne] 3s² 3p⁶", flame: "#818cf8", lines: [696, 763, 811] },

    // Period 4
    { z: 19, s: "K", n: "Potassium", m: 39.098, cat: "alkali", period: 4, group: 1, en: 0.82, ie: 419, r: 243, shells: [2, 8, 8, 1], ec: "[Ar] 4s¹", flame: "#c084fc", lines: [766, 769, 404] },
    { z: 20, s: "Ca", n: "Calcium", m: 40.078, cat: "alkaline", period: 4, group: 2, en: 1.00, ie: 590, r: 194, shells: [2, 8, 8, 2], ec: "[Ar] 4s²", flame: "#ea580c", lines: [422, 616] },
    { z: 21, s: "Sc", n: "Scandium", m: 44.956, cat: "transition", period: 4, group: 3, en: 1.36, ie: 633, r: 184, shells: [2, 8, 9, 2], ec: "[Ar] 4s² 3d¹", flame: null, lines: [391, 402] },
    { z: 22, s: "Ti", n: "Titanium", m: 47.867, cat: "transition", period: 4, group: 4, en: 1.54, ie: 659, r: 176, shells: [2, 8, 10, 2], ec: "[Ar] 4s² 3d²", flame: null, lines: [334, 365] },
    { z: 23, s: "V", n: "Vanadium", m: 50.942, cat: "transition", period: 4, group: 5, en: 1.63, ie: 651, r: 171, shells: [2, 8, 11, 2], ec: "[Ar] 4s² 3d³", flame: null, lines: [318, 437] },
    { z: 24, s: "Cr", n: "Chromium", m: 51.996, cat: "transition", period: 4, group: 6, en: 1.66, ie: 653, r: 166, shells: [2, 8, 13, 1], ec: "[Ar] 4s¹ 3d⁵", flame: null, lines: [425, 427, 428] },
    { z: 25, s: "Mn", n: "Manganese", m: 54.938, cat: "transition", period: 4, group: 7, en: 1.55, ie: 717, r: 161, shells: [2, 8, 13, 2], ec: "[Ar] 4s² 3d⁵", flame: null, lines: [403, 279] },
    { z: 26, s: "Fe", n: "Iron", m: 55.845, cat: "transition", period: 4, group: 8, en: 1.83, ie: 762, r: 156, shells: [2, 8, 14, 2], ec: "[Ar] 4s² 3d⁶", flame: "#f59e0b", lines: [372, 382] },
    { z: 27, s: "Co", n: "Cobalt", m: 58.933, cat: "transition", period: 4, group: 9, en: 1.88, ie: 760, r: 152, shells: [2, 8, 15, 2], ec: "[Ar] 4s² 3d⁷", flame: null, lines: [345, 350] },
    { z: 28, s: "Ni", n: "Nickel", m: 58.693, cat: "transition", period: 4, group: 10, en: 1.91, ie: 737, r: 149, shells: [2, 8, 16, 2], ec: "[Ar] 4s² 3d⁸", flame: null, lines: [341, 352] },
    { z: 29, s: "Cu", n: "Copper", m: 63.546, cat: "transition", period: 4, group: 11, en: 1.90, ie: 745, r: 145, shells: [2, 8, 18, 1], ec: "[Ar] 4s¹ 3d¹⁰", flame: "#10b981", lines: [510, 521, 324] },
    { z: 30, s: "Zn", n: "Zinc", m: 65.38, cat: "transition", period: 4, group: 12, en: 1.65, ie: 906, r: 142, shells: [2, 8, 18, 2], ec: "[Ar] 4s² 3d¹⁰", flame: "#67e8f9", lines: [481, 472] },
    { z: 31, s: "Ga", n: "Gallium", m: 69.723, cat: "post-transition", period: 4, group: 13, en: 1.81, ie: 579, r: 136, shells: [2, 8, 18, 3], ec: "[Ar] 4s² 3d¹⁰ 4p¹", flame: null, lines: [417, 403] },
    { z: 32, s: "Ge", n: "Germanium", m: 72.630, cat: "metalloid", period: 4, group: 14, en: 2.01, ie: 762, r: 125, shells: [2, 8, 18, 4], ec: "[Ar] 4s² 3d¹⁰ 4p²", flame: null, lines: [265, 303] },
    { z: 33, s: "As", n: "Arsenic", m: 74.922, cat: "metalloid", period: 4, group: 15, en: 2.18, ie: 947, r: 114, shells: [2, 8, 18, 5], ec: "[Ar] 4s² 3d¹⁰ 4p³", flame: "#38bdf8", lines: [234, 286] },
    { z: 34, s: "Se", n: "Selenium", m: 78.971, cat: "nonmetal", period: 4, group: 16, en: 2.55, ie: 941, r: 103, shells: [2, 8, 18, 6], ec: "[Ar] 4s² 3d¹⁰ 4p⁴", flame: "#3b82f6", lines: [196, 203] },
    { z: 35, s: "Br", n: "Bromine", m: 79.904, cat: "halogen", period: 4, group: 17, en: 2.96, ie: 1140, r: 94, shells: [2, 8, 18, 7], ec: "[Ar] 4s² 3d¹⁰ 4p⁵", flame: null, lines: [470, 478] },
    { z: 36, s: "Kr", n: "Krypton", m: 83.798, cat: "noble", period: 4, group: 18, en: 3.00, ie: 1351, r: 88, shells: [2, 8, 18, 8], ec: "[Ar] 4s² 3d¹⁰ 4p⁶", flame: "#e0e7ff", lines: [557, 587, 810] },

    // Key Heavy Elements
    { z: 47, s: "Ag", n: "Silver", m: 107.87, cat: "transition", period: 5, group: 11, en: 1.93, ie: 731, r: 165, shells: [2, 8, 18, 18, 1], ec: "[Kr] 5s¹ 4d¹⁰", flame: null, lines: [328, 338] },
    { z: 79, s: "Au", n: "Gold", m: 196.97, cat: "transition", period: 6, group: 11, en: 2.54, ie: 890, r: 174, shells: [2, 8, 18, 32, 18, 1], ec: "[Xe] 6s¹ 4f¹⁴ 5d¹⁰", flame: null, lines: [267, 312] },
    { z: 83, s: "Bi", n: "Bismuth", m: 208.98, cat: "post-transition", period: 6, group: 15, en: 2.02, ie: 703, r: 143, shells: [2, 8, 18, 32, 18, 5], ec: "[Xe] 6s² 4f¹⁴ 5d¹⁰ 6p³", flame: "#67e8f9", lines: [306, 472] }
  ];

  const catColors = {
    alkali: "#ef4444",
    alkaline: "#f97316",
    transition: "#3b82f6",
    "post-transition": "#06b6d4",
    metalloid: "#10b981",
    nonmetal: "#84cc16",
    halogen: "#eab308",
    noble: "#8b5cf6",
    actinide: "#ec4899"
  };

  container.innerHTML = `
    <div class="lab-container">
      <div style="display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 20px;" class="ptable-layout">
        <!-- Left: Interactive Periodic Table Grid & Heatmap Controls -->
        <div style="display: flex; flex-direction: column; gap: 16px; min-width: 0;">
          <!-- Heatmap Overlay Bar -->
          <div class="ptable-heatmap-bar" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; background: rgba(15,23,42,0.85); padding: 14px 20px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="ptable-heatmap-title" style="font-size: 0.85rem; color: #38bdf8; font-weight: 700; text-transform: uppercase;">
                Periodic Trend Heatmap:
              </span>
              <select id="select-trend" class="select-input" style="width: auto; height: 38px; padding: 0 12px; font-weight: 600;">
                <option value="none">Standard Chemical Groups</option>
                <option value="en">Electronegativity (Pauling 0.7 - 4.0)</option>
                <option value="ie">First Ionization Energy (kJ/mol)</option>
                <option value="r">Atomic Radius (Picometers pm)</option>
              </select>
            </div>
            <div class="ptable-heatmap-hint" style="font-size: 0.82rem; color: var(--text-muted);">
              Hover / Click element to inspect quantum shells & flame spectrum
            </div>
          </div>

          <!-- Periodic Grid Container (Responsive 18-Column Matrix) -->
          <div class="ptable-grid" style="display: grid; grid-template-columns: repeat(18, minmax(38px, 1fr)); gap: 6px; overflow-x: auto; padding: 16px; border-radius: var(--radius-md);" id="ptable-grid">
            <!-- Rendered dynamically -->
          </div>

          <!-- 4K Museum Mineral Specimen Gallery Card -->
          <div class="ptable-gallery-card" style="background: rgba(15, 23, 42, 0.92); border: 1.5px solid rgba(56, 189, 248, 0.3); border-radius: var(--radius-md); padding: 16px 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.6); display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.82rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
                📸 4K Museum Specimen & Mineral Gallery
              </span>
              <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #34d399; font-size: 0.75rem; padding: 2px 8px; border-radius: 9999px;">
                Crystalline Habits & Physical States
              </span>
            </div>

            <!-- Specimen Display Image with Interactive Hotspots -->
            <div style="position: relative; height: 180px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
              <img src="assets/labs/element_samples.jpg" alt="Museum Element Specimens" style="width: 100%; height: 100%; object-fit: cover;">
              <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%);"></div>

              <!-- Quick Specimen Selector Buttons -->
              <div style="position: absolute; bottom: 12px; left: 14px; right: 14px; display: flex; gap: 8px; flex-wrap: wrap;">
                <button class="btn btn-secondary specimen-btn" data-sym="Cu" style="padding: 4px 10px; font-size: 0.75rem; background: rgba(15, 23, 42, 0.85); border-color: #f97316; color: #fb923c;">
                  Native Copper (Cu)
                </button>
                <button class="btn btn-secondary specimen-btn" data-sym="Au" style="padding: 4px 10px; font-size: 0.75rem; background: rgba(15, 23, 42, 0.85); border-color: #eab308; color: #facc15;">
                  Native Gold (Au)
                </button>
                <button class="btn btn-secondary specimen-btn" data-sym="S" style="padding: 4px 10px; font-size: 0.75rem; background: rgba(15, 23, 42, 0.85); border-color: #84cc16; color: #a3e635;">
                  Rhombic Sulfur (S)
                </button>
                <button class="btn btn-secondary specimen-btn" data-sym="Bi" style="padding: 4px 10px; font-size: 0.75rem; background: rgba(15, 23, 42, 0.85); border-color: #06b6d4; color: #22d3ee;">
                  Bismuth Crystal (Bi)
                </button>
                <button class="btn btn-secondary specimen-btn" data-sym="Ne" style="padding: 4px 10px; font-size: 0.75rem; background: rgba(15, 23, 42, 0.85); border-color: #ec4899; color: #f472b6;">
                  Neon Plasma Tube (Ne)
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Element Quantum Inspector, Bohr Orbitals & Flame Test -->
        <div class="ptable-inspector-card" style="background: rgba(15,23,42,0.92); border: 1.5px solid var(--border-color); border-radius: var(--radius-md); padding: 22px; display: flex; flex-direction: column; gap: 16px; box-shadow: 0 15px 35px rgba(0,0,0,0.6);" id="element-inspector">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="font-family: var(--font-mono); font-size: 1.25rem; font-weight: 800; color: #38bdf8;" id="elem-z">Z = 6</div>
            <span id="elem-cat-badge" style="padding: 4px 12px; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; background: rgba(132, 204, 22, 0.2); color: #84cc16;">Nonmetal</span>
          </div>

          <!-- Element Big Header -->
          <div style="text-align: center; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08);">
            <div style="font-family: var(--font-heading); font-size: 3.8rem; font-weight: 800; line-height: 1; color: #ffffff; text-shadow: 0 0 20px rgba(56, 189, 248, 0.4);" id="elem-symbol">C</div>
            <div style="font-size: 1.3rem; font-weight: 700; color: #f8fafc; margin-top: 4px;" id="elem-name">Carbon</div>
            <div style="font-family: var(--font-mono); font-size: 0.92rem; color: #94a3b8;" id="elem-mass">12.011 amu</div>
          </div>

          <!-- 3D Animated Quantum Bohr Shells Canvas -->
          <div style="width: 100%; height: 190px; position: relative; background: #030712; border-radius: var(--radius-sm); border: 1px solid rgba(56, 189, 248, 0.3); overflow: hidden; box-shadow: inset 0 0 25px rgba(0,0,0,0.8);">
            <canvas id="bohr-canvas" width="300" height="190" style="width: 100%; height: 100%; display: block;"></canvas>
            <div style="position: absolute; bottom: 6px; left: 8px; font-size: 0.7rem; color: #38bdf8; font-family: var(--font-mono);">
              Quantum Bohr Shells
            </div>
          </div>

          <!-- Properties Telemetry List -->
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.88rem;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-muted);">Electron Config:</span>
              <span style="font-family: var(--font-mono); color: #38bdf8; font-weight: 700;" id="elem-ec">[He] 2s² 2p²</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-muted);">Electronegativity:</span>
              <span style="font-family: var(--font-mono); color: #f59e0b; font-weight: 700;" id="elem-en">2.55 (Pauling)</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-muted);">1st Ionization Energy:</span>
              <span style="font-family: var(--font-mono); color: #10b981; font-weight: 700;" id="elem-ie">1086 kJ/mol</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-muted);">Atomic Radius:</span>
              <span style="font-family: var(--font-mono); color: #ec4899; font-weight: 700;" id="elem-radius">67 pm</span>
            </div>
          </div>

          <!-- Simulated Flame Emission Spectrum & Discrete Spectral Lines -->
          <div class="ptable-flame-card" style="background: rgba(10, 15, 28, 0.8); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase;">
                Flame Emission Spectrum
              </span>
              <span id="spectral-lines-text" style="font-size: 0.7rem; color: #38bdf8; font-family: var(--font-mono);">λ: 656, 486 nm</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <div id="flame-preview-circle" style="width: 28px; height: 28px; border-radius: 50%; background: #38bdf8; box-shadow: 0 0 12px #38bdf8; flex-shrink: 0;"></div>
              <div style="font-size: 0.8rem; color: #f8fafc; font-family: var(--font-mono);" id="flame-desc">
                Characteristic Emission
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Telemetry Suite & Multi-Trial Bar -->
      <div class="lab-telemetry-suite-bar" style="margin-top: 16px;">
        <div class="lab-trials-badge-group" id="ptable-trials-badge-group">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">Element Quantum Analysis Log:</span>
          <span class="lab-trial-pill trial-1" id="ptable-pill-trial-1" style="opacity: 0.5;">Element 1 (Cyan)</span>
          <span class="lab-trial-pill trial-2" id="ptable-pill-trial-2" style="opacity: 0.5;">Element 2 (Amber)</span>
          <span class="lab-trial-pill trial-3" id="ptable-pill-trial-3" style="opacity: 0.5;">Element 3 (Emerald)</span>
        </div>

        <div class="lab-export-buttons-group">
          <button class="btn btn-secondary" id="btn-record-ptable-trial" style="padding: 6px 12px; font-size: 0.8rem; gap: 6px; border-color: rgba(56,189,248,0.4); color: #38bdf8;">
            <span>📸 Log Element Data</span>
          </button>
          <button class="btn btn-secondary" id="btn-export-ptable-csv" style="padding: 6px 12px; font-size: 0.8rem; gap: 6px;">
            <span>📥 Export CSV Data</span>
          </button>
          <button class="btn btn-primary" id="btn-open-ptable-report" style="padding: 6px 14px; font-size: 0.8rem; gap: 6px; background: linear-gradient(135deg, #0284c7, #0369a1); border: none;">
            <span>📑 Generate Lab Report</span>
          </button>
        </div>
      </div>

      <!-- Post-Lab Checkpoint Assessment Mount -->
      <div id="ptable-checkpoint-container"></div>
    </div>
  `;

  let selectedElem = elementsData.find(e => e.s === "C") || elementsData[5];
  let trendOverlay = "none";
  let electronRotation = 0;
  let animId = null;

  const bohrCanvas = document.getElementById("bohr-canvas");
  const bohrCtx = bohrCanvas.getContext("2d");

  function getTrendColor(el) {
    if (trendOverlay === "none") {
      return catColors[el.cat] || "#3b82f6";
    } else if (trendOverlay === "en") {
      if (!el.en) return "#334155";
      const frac = Math.max(0, Math.min(1, (el.en - 0.7) / 3.3));
      const r = Math.round(16 + frac * 220);
      const g = Math.round(185 * (1 - frac) + 72 * frac);
      const b = Math.round(129 * (1 - frac) + 240 * frac);
      return `rgb(${r}, ${g}, ${b})`;
    } else if (trendOverlay === "ie") {
      const frac = Math.max(0, Math.min(1, (el.ie - 370) / 2000));
      return `rgb(${Math.round(59 + frac * 190)}, ${Math.round(130 * (1 - frac) + 50 * frac)}, ${Math.round(246 * (1 - frac))})`;
    } else if (trendOverlay === "r") {
      const frac = Math.max(0, Math.min(1, (el.r - 30) / 270));
      return `rgb(${Math.round(236 * frac + 30)}, ${Math.round(72 + 100 * (1 - frac))}, ${Math.round(153 * (1 - frac))})`;
    }
    return "#3b82f6";
  }

  function renderGrid() {
    const grid = document.getElementById("ptable-grid");
    if (!grid) return;

    grid.innerHTML = "";

    for (let p = 1; p <= 7; p++) {
      for (let g = 1; g <= 18; g++) {
        const el = elementsData.find(e => e.period === p && e.group === g);
        const cell = document.createElement("div");

        if (el) {
          const color = getTrendColor(el);
          const isSelected = (selectedElem.z === el.z);

          cell.className = `ptable-cell ${isSelected ? 'selected' : ''}`;
          cell.style.setProperty("--trend-color", color);
          cell.style.borderTop = `3px solid ${color}`;
          cell.style.borderRadius = "6px";
          cell.style.padding = "6px 4px";
          cell.style.textAlign = "center";
          cell.style.cursor = "pointer";
          cell.style.transition = "all 0.2s ease";
          cell.style.userSelect = "none";

          cell.innerHTML = `
            <div class="ptable-cell-z">${el.z}</div>
            <div class="ptable-cell-s">${el.s}</div>
            <div class="ptable-cell-m">${el.m.toFixed(1)}</div>
          `;

          cell.addEventListener("mouseenter", () => {
            cell.style.transform = "translateY(-3px)";
            cell.style.boxShadow = `0 6px 15px ${color}55`;
          });
          cell.addEventListener("mouseleave", () => {
            cell.style.transform = "none";
            cell.style.boxShadow = "none";
          });

          cell.addEventListener("click", () => {
            selectedElem = el;
            updateInspector();
            renderGrid();
          });
        } else {
          cell.style.visibility = "hidden";
        }

        grid.appendChild(cell);
      }
    }
  }

  function updateInspector() {
    document.getElementById("elem-z").innerText = `Z = ${selectedElem.z}`;
    document.getElementById("elem-symbol").innerText = selectedElem.s;
    document.getElementById("elem-name").innerText = selectedElem.n;
    document.getElementById("elem-mass").innerText = `${selectedElem.m} amu`;

    const badge = document.getElementById("elem-cat-badge");
    badge.innerText = selectedElem.cat;
    badge.style.color = catColors[selectedElem.cat] || "#38bdf8";
    badge.style.background = `${catColors[selectedElem.cat] || "#38bdf8"}22`;

    document.getElementById("elem-ec").innerText = selectedElem.ec;
    document.getElementById("elem-en").innerText = selectedElem.en ? `${selectedElem.en} (Pauling)` : "N/A (Inert)";
    document.getElementById("elem-ie").innerText = `${selectedElem.ie} kJ/mol`;
    document.getElementById("elem-radius").innerText = `${selectedElem.r} pm`;

    const flameDot = document.getElementById("flame-preview-circle");
    const flameDesc = document.getElementById("flame-desc");
    const linesText = document.getElementById("spectral-lines-text");

    if (selectedElem.flame) {
      flameDot.style.background = selectedElem.flame;
      flameDot.style.boxShadow = `0 0 16px ${selectedElem.flame}`;
      flameDesc.innerText = `Characteristic Flame Emission: ${selectedElem.n}`;
    } else {
      flameDot.style.background = "#475569";
      flameDot.style.boxShadow = "none";
      flameDesc.innerText = "No visible flame test color";
    }

    if (selectedElem.lines && selectedElem.lines.length > 0) {
      linesText.innerText = `λ: ${selectedElem.lines.join(", ")} nm`;
    } else {
      linesText.innerText = "UV/IR Bands";
    }
  }

  function drawBohr() {
    const dpr = window.devicePixelRatio || 1;
    const w = bohrCanvas.width / dpr;
    const h = bohrCanvas.height / dpr;

    bohrCtx.save();
    bohrCtx.scale(dpr, dpr);
    bohrCtx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;

    const nucColor = catColors[selectedElem.cat] || "#38bdf8";
    const nucGrad = bohrCtx.createRadialGradient(cx, cy, 2, cx, cy, 14);
    nucGrad.addColorStop(0, "#ffffff");
    nucGrad.addColorStop(0.4, nucColor);
    nucGrad.addColorStop(1, "rgba(15, 23, 42, 0)");

    bohrCtx.fillStyle = nucGrad;
    bohrCtx.shadowColor = nucColor;
    bohrCtx.shadowBlur = 14;
    bohrCtx.beginPath();
    bohrCtx.arc(cx, cy, 12, 0, Math.PI * 2);
    bohrCtx.fill();
    bohrCtx.shadowBlur = 0;

    bohrCtx.fillStyle = "#ffffff";
    bohrCtx.font = "bold 9px JetBrains Mono";
    bohrCtx.fillText(`${selectedElem.z}+`, cx - 8, cy + 3);

    const shells = selectedElem.shells || [1];
    const maxR = Math.min(cx, cy) - 16;
    const stepR = maxR / (shells.length + 0.5);

    electronRotation += 0.02;

    shells.forEach((electronCount, sIdx) => {
      const radius = 22 + (sIdx + 1) * stepR;

      bohrCtx.strokeStyle = "rgba(56, 189, 248, 0.25)";
      bohrCtx.lineWidth = 1.2;
      bohrCtx.beginPath();
      bohrCtx.arc(cx, cy, radius, 0, Math.PI * 2);
      bohrCtx.stroke();

      for (let e = 0; e < electronCount; e++) {
        const speedMult = (sIdx % 2 === 0 ? 1 : -1) * (1 / (sIdx + 1));
        const ang = electronRotation * speedMult + (e * Math.PI * 2) / electronCount;
        const ex = cx + Math.cos(ang) * radius;
        const ey = cy + Math.sin(ang) * radius;

        bohrCtx.fillStyle = "#38bdf8";
        bohrCtx.shadowColor = "#38bdf8";
        bohrCtx.shadowBlur = 8;
        bohrCtx.beginPath();
        bohrCtx.arc(ex, ey, 3.5, 0, Math.PI * 2);
        bohrCtx.fill();
        bohrCtx.shadowBlur = 0;
      }
    });

    bohrCtx.restore();
  }

  function loop() {
    drawBohr();
    animId = requestAnimationFrame(loop);
  }

  renderGrid();
  updateInspector();
  loop();

  document.getElementById("select-trend").addEventListener("change", (e) => {
    trendOverlay = e.target.value;
    renderGrid();
  });

  // Specimen Quick Buttons
  container.querySelectorAll(".specimen-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const sym = btn.getAttribute("data-sym");
      const el = elementsData.find(e => e.s === sym);
      if (el) {
        selectedElem = el;
        updateInspector();
        renderGrid();
      }
    });
  });

  // Telemetry Suite: Record Element as Trial
  document.getElementById("btn-record-ptable-trial")?.addEventListener("click", () => {
    LabTrialStore.addTrial("ptable", {
      measurements: {
        "Element": `${selectedElem.n} (${selectedElem.s})`,
        "Z": selectedElem.z,
        "Period": selectedElem.period,
        "Group": selectedElem.group,
        "Config": selectedElem.ec,
        "EN (Pauling)": selectedElem.en || "N/A",
        "IE (kJ/mol)": selectedElem.ie,
        "Radius (pm)": selectedElem.r
      }
    });

    const trials = LabTrialStore.getTrials("ptable");
    trials.forEach((tr, i) => {
      const pill = document.getElementById(`ptable-pill-trial-${i + 1}`);
      if (pill) {
        pill.style.opacity = "1";
        pill.innerText = `Obs ${tr.trialNumber}: ${tr.measurements["Element"]} (Z=${tr.measurements["Z"]}, IE=${tr.measurements["IE (kJ/mol)"]} kJ, r=${tr.measurements["Radius (pm)"]}pm)`;
      }
    });
  });

  // Telemetry Suite: Export CSV
  document.getElementById("btn-export-ptable-csv")?.addEventListener("click", () => {
    exportLabDataCsv({
      title: "Interactive Periodic Table & Quantum Orbitals Database",
      labId: "ptable",
      parameters: {
        "Inspected Element": `${selectedElem.n} (${selectedElem.s})`,
        "Selected Trend View": trendOverlay.toUpperCase(),
        "Catalog Size": `${elementsData.length} Elements`
      },
      headers: ["Atomic Number (Z)", "Symbol", "Element Name", "Category", "Period", "Group", "Atomic Mass (amu)", "Electronegativity (Pauling)", "Ionization Energy (kJ/mol)", "Atomic Radius (pm)", "Electron Configuration"],
      dataRows: elementsData.map(e => [
        e.z,
        e.s,
        e.n,
        e.cat,
        e.period,
        e.group,
        e.m,
        e.en || "",
        e.ie,
        e.r,
        e.ec
      ])
    });
  });

  // Telemetry Suite: Generate Lab Report
  document.getElementById("btn-open-ptable-report")?.addEventListener("click", () => {
    const trials = LabTrialStore.getTrials("ptable");

    openLabReportModal({
      title: "Periodic Trends, Electron Configuration & Quantum Shell Architecture",
      subject: "Chemistry",
      inquiryQuestion: "How do nuclear charge and electron shielding quantitatively govern periodic trends in atomic radius, ionization energy, and electronegativity?",
      parameters: {
        "Target Element": `${selectedElem.n} (${selectedElem.s})`,
        "Atomic Number (Z)": `${selectedElem.z}`,
        "Group & Period": `Group ${selectedElem.group}, Period ${selectedElem.period}`,
        "Ground-State Electron Config": `${selectedElem.ec}`,
        "Electronegativity (Pauling)": `${selectedElem.en || "N/A"}`,
        "First Ionization Energy": `${selectedElem.ie} kJ/mol`,
        "Covalent Atomic Radius": `${selectedElem.r} pm`
      },
      trials,
      formulas: [
        "Z_{\\text{eff}} = Z - S \\quad (\\text{Effective Nuclear Charge})",
        "E_n = -\\frac{13.6 \\text{ eV}}{n^2} \\cdot Z^2 \\quad (\\text{Bohr Quantized Energy})",
        "\\Delta E = h\\nu = \\frac{hc}{\\lambda} \\quad (\\text{Photon Spectral Emission})"
      ]
    });
  });

  // Mount Post-Lab Checkpoint Assessment
  mountLabCheckpoint("ptable-checkpoint-container", "ptable");
}
