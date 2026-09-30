// Edugates-ClipSAT Science Labs - Chemistry: Precision Interactive Periodic Table & Quantum Orbitals
// Complete 118-Element Periodic Matrix, Multi-Property Heatmaps (EN, IE, Radius, Density, MP),
// Dual-View Inspector (4K Specimen & Natural Occurrence vs 3D Animated Quantum Bohr Shells vs Flame Spectroscopy),
// Full-Screen 4K Mineral Specimen Modal, and Comprehensive Scientific Telemetry.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { PERIODIC_ELEMENTS, CATEGORY_METADATA } from "../data/periodic-table-data.js";

export function initPeriodicTableLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const elementsData = PERIODIC_ELEMENTS;

  // Active state
  let selectedElem = elementsData.find(e => e.s === "Au") || elementsData[78]; // Default to Gold (Au) for stunning 4K visual
  let trendOverlay = "none";
  let selectedCategory = "all";
  let searchQuery = "";
  let activeTab = "specimen"; // 'specimen' | 'bohr' | 'spectra'
  let electronRotation = 0;
  let animId = null;

  // SVG procedural fallback generator for offline or blocked image scenarios
  function generateElementSpecimenSvg(el) {
    const cat = CATEGORY_METADATA[el.cat] || { color: "#38bdf8", name: el.cat };
    const color = cat.color;

    let bgGrad;
    let motif = "🧊";
    if (el.state === "Gas") {
      bgGrad = `<radialGradient id="g_${el.z}" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.85"/>
        <stop offset="55%" stop-color="#0f172a" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#020617" stop-opacity="1"/>
      </radialGradient>`;
      motif = "💨";
    } else if (el.state === "Liquid") {
      bgGrad = `<linearGradient id="g_${el.z}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.7"/>
        <stop offset="50%" stop-color="#1e1b4b" stop-opacity="0.92"/>
        <stop offset="100%" stop-color="#020617" stop-opacity="1"/>
      </linearGradient>`;
      motif = "💧";
    } else if (el.state === "Synthetic") {
      bgGrad = `<linearGradient id="g_${el.z}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.6"/>
        <stop offset="45%" stop-color="#3b0764" stop-opacity="0.92"/>
        <stop offset="100%" stop-color="#020617" stop-opacity="1"/>
      </linearGradient>`;
      motif = "⚛️";
    } else {
      bgGrad = `<linearGradient id="g_${el.z}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.45"/>
        <stop offset="50%" stop-color="#1e293b" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#0b1329" stop-opacity="1"/>
      </linearGradient>`;
      motif = "🧊";
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" width="100%" height="100%">
      <defs>
        ${bgGrad}
        <pattern id="grid_${el.z}" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="600" height="360" fill="url(#g_${el.z})"/>
      <rect width="600" height="360" fill="url(#grid_${el.z})"/>
      <circle cx="300" cy="180" r="130" fill="none" stroke="${color}" stroke-opacity="0.25" stroke-dasharray="6 6" stroke-width="2"/>
      <circle cx="300" cy="180" r="90" fill="none" stroke="${color}" stroke-opacity="0.35" stroke-width="1.5"/>
      <circle cx="300" cy="180" r="48" fill="${color}" fill-opacity="0.15"/>
      <text x="300" y="198" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="82" fill="#ffffff" text-anchor="middle" letter-spacing="1">${el.s}</text>
      <text x="300" y="112" font-family="monospace" font-weight="700" font-size="20" fill="${color}" text-anchor="middle">Z = ${el.z} • ${el.m} u</text>
      <text x="300" y="248" font-family="system-ui, sans-serif" font-weight="700" font-size="24" fill="#f8fafc" text-anchor="middle">${el.n}</text>
      <text x="300" y="282" font-family="system-ui, sans-serif" font-weight="600" font-size="14" fill="#94a3b8" text-anchor="middle">${motif} Standard State: ${el.state} • ${cat.name}</text>
      <rect x="16" y="16" width="568" height="328" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="1" rx="10"/>
    </svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  function getStateIcon(state) {
    switch (state) {
      case "Solid": return "🧊";
      case "Liquid": return "💧";
      case "Gas": return "💨";
      case "Synthetic": return "⚛️";
      default: return "•";
    }
  }

  function getTrendColor(el) {
    if (trendOverlay === "none") {
      return CATEGORY_METADATA[el.cat]?.color || "#3b82f6";
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
      const frac = Math.max(0, Math.min(1, (el.r - 30) / 250));
      return `rgb(${Math.round(236 * frac + 30)}, ${Math.round(72 + 100 * (1 - frac))}, ${Math.round(153 * (1 - frac))})`;
    } else if (trendOverlay === "density") {
      if (!el.density) return "#334155";
      const frac = Math.max(0, Math.min(1, el.density / 22.6));
      return `rgb(${Math.round(16 + frac * 230)}, ${Math.round(185 * (1 - frac) + 30 * frac)}, ${Math.round(129 * (1 - frac) + 180 * frac)})`;
    } else if (trendOverlay === "mp") {
      if (el.mp === null) return "#334155";
      const frac = Math.max(0, Math.min(1, (el.mp + 273) / 4000));
      return `rgb(${Math.round(245 * frac + 20)}, ${Math.round(158 * frac + 40)}, ${Math.round(11 * (1 - frac) + 200 * (1 - frac))})`;
    }
    return "#3b82f6";
  }

  // Master Layout Template
  container.innerHTML = `
    <div class="lab-container">
      <!-- Top Bar: Heatmap, Filters, Quick Search -->
      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
        <div class="ptable-heatmap-bar" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; background: rgba(15,23,42,0.92); padding: 14px 20px; border-radius: var(--radius-md); border: 1px solid var(--border-color); box-shadow: 0 8px 24px rgba(0,0,0,0.4);">
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <span class="ptable-heatmap-title" style="font-size: 0.9rem; color: #38bdf8; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
              <span>⚛️</span> Periodic Trend Heatmap:
            </span>
            <select id="select-trend" class="select-input" style="width: auto; height: 38px; padding: 0 14px; font-weight: 600; background: #0f172a; border-color: rgba(56, 189, 248, 0.4); color: #f8fafc; border-radius: 6px;">
              <option value="none">Standard Chemical Families (10 Categories)</option>
              <option value="en">Electronegativity (Pauling Scale 0.7 – 4.0)</option>
              <option value="ie">First Ionization Energy (kJ/mol)</option>
              <option value="r">Atomic Radius (Picometers pm)</option>
              <option value="density">Standard Density (g/cm³ at STP)</option>
              <option value="mp">Melting Point (°C)</option>
            </select>
          </div>

          <!-- Instant Element Search -->
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="text" id="ptable-search-input" placeholder="🔍 Search element (e.g. Gold, Au, 79)..." style="width: 250px; height: 38px; padding: 0 14px; background: #0b1329; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 6px; color: #f8fafc; font-size: 0.85rem; outline: none; transition: border-color 0.2s;" />
            <button class="btn btn-secondary" id="btn-clear-search" style="height: 38px; padding: 0 12px; font-size: 0.78rem;" title="Clear search">✕</button>
          </div>
        </div>

        <!-- Chemical Families Filter Pills -->
        <div id="category-filter-bar" style="display: flex; align-items: center; gap: 6px; overflow-x: auto; padding: 4px 2px; -webkit-overflow-scrolling: touch; scrollbar-width: thin;">
          <button class="cat-pill active" data-cat="all" style="padding: 5px 12px; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; background: #38bdf8; color: #020617; border: 1px solid #38bdf8; cursor: pointer; white-space: nowrap; transition: all 0.2s;">
            All 118 Elements
          </button>
          ${Object.entries(CATEGORY_METADATA).map(([key, meta]) => `
            <button class="cat-pill" data-cat="${key}" style="padding: 5px 11px; border-radius: 9999px; font-size: 0.73rem; font-weight: 600; background: rgba(15,23,42,0.8); color: #cbd5e1; border: 1px solid ${meta.color}55; cursor: pointer; white-space: nowrap; transition: all 0.2s; display: flex; align-items: center; gap: 6px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: ${meta.color}; box-shadow: 0 0 6px ${meta.color};"></span>
              ${meta.name}
            </button>
          `).join("")}
        </div>
      </div>

      <!-- Main Layout: Grid on Left (Scrollable), Inspector on Right -->
      <div style="display: grid; grid-template-columns: minmax(0, 1fr) 390px; gap: 20px;" class="ptable-layout">
        <!-- Left Column: 18-Column IUPAC Matrix + Quick Museum Specimens -->
        <div style="display: flex; flex-direction: column; gap: 16px; min-width: 0;">
          <!-- 18-Column Responsive Grid Container -->
          <div style="background: #070a14; border: 1.5px solid rgba(56, 189, 248, 0.25); border-radius: var(--radius-md); padding: 14px; overflow-x: auto; -webkit-overflow-scrolling: touch; box-shadow: 0 20px 45px -15px rgba(0,0,0,0.8);">
            <!-- Group Numbers Header 1-18 -->
            <div style="display: grid; grid-template-columns: repeat(18, minmax(42px, 1fr)); gap: 5px; margin-bottom: 4px; text-align: center;">
              ${Array.from({ length: 18 }, (_, i) => `
                <div style="font-family: var(--font-mono); font-size: 0.65rem; color: #64748b; font-weight: 700;">${i + 1}</div>
              `).join("")}
            </div>

            <!-- Elements CSS Grid: 18 Columns, 10 Rows (Rows 1-7 main, Row 8 gap, Rows 9-10 Lanthanides/Actinides) -->
            <div id="ptable-grid" style="display: grid; grid-template-columns: repeat(18, minmax(42px, 1fr)); grid-template-rows: repeat(10, minmax(54px, auto)); gap: 5px; min-width: 820px;">
              <!-- Rendered dynamically -->
            </div>
          </div>

          <!-- Quick Iconic Museum Specimens Carousel Bar -->
          <div class="ptable-gallery-card" style="background: rgba(15, 23, 42, 0.92); border: 1.5px solid rgba(56, 189, 248, 0.3); border-radius: var(--radius-md); padding: 14px 18px; box-shadow: 0 15px 35px rgba(0,0,0,0.6); display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.82rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
                📸 Iconic Natural Specimens & High-Tech Applications
              </span>
              <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #34d399; font-size: 0.72rem; padding: 2px 8px; border-radius: 9999px;">
                Direct Quick Access
              </span>
            </div>

            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="btn btn-secondary specimen-btn" data-sym="Au" style="padding: 4px 10px; font-size: 0.75rem; background: rgba(15, 23, 42, 0.85); border-color: #eab308; color: #facc15;">
                Native Gold (Au)
              </button>
              <button class="btn btn-secondary specimen-btn" data-sym="Cu" style="padding: 4px 10px; font-size: 0.75rem; background: rgba(15, 23, 42, 0.85); border-color: #f97316; color: #fb923c;">
                Native Copper (Cu)
              </button>
              <button class="btn btn-secondary specimen-btn" data-sym="C" style="padding: 4px 10px; font-size: 0.75rem; background: rgba(15, 23, 42, 0.85); border-color: #94a3b8; color: #f1f5f9;">
                Diamond Carbon (C)
              </button>
              <button class="btn btn-secondary specimen-btn" data-sym="Si" style="padding: 4px 10px; font-size: 0.75rem; background: rgba(15, 23, 42, 0.85); border-color: #10b981; color: #34d399;">
                Silicon Ingot (Si)
              </button>
              <button class="btn btn-secondary specimen-btn" data-sym="Ti" style="padding: 4px 10px; font-size: 0.75rem; background: rgba(15, 23, 42, 0.85); border-color: #3b82f6; color: #60a5fa;">
                Aerospace Titanium (Ti)
              </button>
              <button class="btn btn-secondary specimen-btn" data-sym="Fe" style="padding: 4px 10px; font-size: 0.75rem; background: rgba(15, 23, 42, 0.85); border-color: #f59e0b; color: #fbbf24;">
                Meteoric Iron (Fe)
              </button>
              <button class="btn btn-secondary specimen-btn" data-sym="Ag" style="padding: 4px 10px; font-size: 0.75rem; background: rgba(15, 23, 42, 0.85); border-color: #e2e8f0; color: #ffffff;">
                Crystalline Silver (Ag)
              </button>
              <button class="btn btn-secondary specimen-btn" data-sym="Bi" style="padding: 4px 10px; font-size: 0.75rem; background: rgba(15, 23, 42, 0.85); border-color: #06b6d4; color: #22d3ee;">
                Hopper Bismuth (Bi)
              </button>
              <button class="btn btn-secondary specimen-btn" data-sym="U" style="padding: 4px 10px; font-size: 0.75rem; background: rgba(15, 23, 42, 0.85); border-color: #ec4899; color: #f472b6;">
                Uranium Mineral (U)
              </button>
              <button class="btn btn-secondary specimen-btn" data-sym="Ne" style="padding: 4px 10px; font-size: 0.75rem; background: rgba(15, 23, 42, 0.85); border-color: #8b5cf6; color: #c084fc;">
                Neon Plasma (Ne)
              </button>
              <button class="btn btn-secondary specimen-btn" data-sym="S" style="padding: 4px 10px; font-size: 0.75rem; background: rgba(15, 23, 42, 0.85); border-color: #84cc16; color: #a3e635;">
                Rhombic Sulfur (S)
              </button>
              <button class="btn btn-secondary specimen-btn" data-sym="Nd" style="padding: 4px 10px; font-size: 0.75rem; background: rgba(15, 23, 42, 0.85); border-color: #d946ef; color: #e879f9;">
                Neodymium Magnet (Nd)
              </button>
            </div>
          </div>
        </div>

        <!-- Right Column: Element Quantum & Specimen Inspector -->
        <div class="ptable-inspector-card" style="background: rgba(15,23,42,0.94); border: 1.5px solid var(--border-color); border-radius: var(--radius-md); padding: 20px; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 15px 35px rgba(0,0,0,0.6);" id="element-inspector">
          <!-- Top Badges Row -->
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px;">
            <div style="font-family: var(--font-mono); font-size: 1.15rem; font-weight: 800; color: #38bdf8;" id="elem-z">Z = 79</div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span id="elem-state-badge" style="padding: 3px 10px; border-radius: 9999px; font-size: 0.72rem; font-weight: 700; background: rgba(255,255,255,0.08); color: #f8fafc; border: 1px solid rgba(255,255,255,0.15);">
                🧊 Solid
              </span>
              <span id="elem-block-badge" style="padding: 3px 8px; border-radius: 9999px; font-size: 0.72rem; font-weight: 700; font-family: var(--font-mono); background: rgba(56, 189, 248, 0.15); color: #38bdf8;">
                d-block
              </span>
              <span id="elem-cat-badge" style="padding: 3px 10px; border-radius: 9999px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; background: rgba(59, 130, 246, 0.2); color: #3b82f6;">
                Transition Metal
              </span>
            </div>
          </div>

          <!-- Big Element Banner -->
          <div style="text-align: center; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.08);">
            <div style="font-family: var(--font-heading); font-size: 3.5rem; font-weight: 800; line-height: 1; color: #ffffff; text-shadow: 0 0 25px rgba(56, 189, 248, 0.4);" id="elem-symbol">Au</div>
            <div style="font-size: 1.25rem; font-weight: 700; color: #f8fafc; margin-top: 4px;" id="elem-name">Gold</div>
            <div style="font-family: var(--font-mono); font-size: 0.88rem; color: #94a3b8;" id="elem-mass">196.967 amu</div>
          </div>

          <!-- Dual-View Inspector Tabs Navigation -->
          <div style="display: flex; gap: 6px; background: rgba(2, 6, 23, 0.7); padding: 4px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">
            <button id="tab-btn-specimen" class="btn" style="flex: 1; padding: 6px 4px; font-size: 0.75rem; font-weight: 700; border: none; border-radius: 6px; background: #0284c7; color: #ffffff; transition: all 0.2s;">
              📸 4K Specimen & Uses
            </button>
            <button id="tab-btn-bohr" class="btn" style="flex: 1; padding: 6px 4px; font-size: 0.75rem; font-weight: 700; border: none; border-radius: 6px; background: transparent; color: #94a3b8; transition: all 0.2s;">
              ⚛️ Bohr Orbitals
            </button>
            <button id="tab-btn-spectra" class="btn" style="flex: 1; padding: 6px 4px; font-size: 0.75rem; font-weight: 700; border: none; border-radius: 6px; background: transparent; color: #94a3b8; transition: all 0.2s;">
              🔥 Emission Spectra
            </button>
          </div>

          <!-- TAB 1: 4K Specimen & Real-World Geology / Uses -->
          <div id="tab-content-specimen" style="display: flex; flex-direction: column; gap: 12px;">
            <!-- Specimen Photo Container with Zoom Icon -->
            <div style="position: relative; height: 190px; border-radius: 8px; overflow: hidden; border: 1.5px solid rgba(56, 189, 248, 0.35); background: #000; cursor: pointer; group;" id="specimen-img-container" title="Click to view full-resolution 4K specimen">
              <img id="elem-specimen-img" src="" alt="Element Specimen" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease;" />
              <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%);"></div>

              <!-- Fullscreen button -->
              <button id="btn-fullscreen-specimen" style="position: absolute; top: 8px; right: 8px; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.2); color: #ffffff; border-radius: 6px; padding: 4px 8px; font-size: 0.72rem; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                <span>⛶</span> Full 4K
              </button>

              <!-- Image Caption -->
              <div style="position: absolute; bottom: 8px; left: 10px; right: 10px; font-size: 0.72rem; color: #e2e8f0; line-height: 1.3;" id="elem-img-desc">
                High-definition authentic specimen.
              </div>
            </div>

            <!-- Natural Occurrence in Nature Card -->
            <div style="background: rgba(2, 6, 23, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 4px;">
              <span style="font-size: 0.74rem; font-weight: 800; color: #34d399; text-transform: uppercase; letter-spacing: 0.04em; display: flex; align-items: center; gap: 5px;">
                <span>🌍</span> Natural Occurrence & Cosmic Origin
              </span>
              <p style="font-size: 0.8rem; color: #cbd5e1; line-height: 1.45; margin: 0;" id="elem-occurrence">
                Occurrence description.
              </p>
            </div>

            <!-- Technological & Industrial Applications Card -->
            <div style="background: rgba(2, 6, 23, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 4px;">
              <span style="font-size: 0.74rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.04em; display: flex; align-items: center; gap: 5px;">
                <span>🚀</span> High-Tech Industrial Applications & Uses
              </span>
              <p style="font-size: 0.8rem; color: #cbd5e1; line-height: 1.45; margin: 0;" id="elem-uses">
                Applications description.
              </p>
            </div>
          </div>

          <!-- TAB 2: Quantum Bohr Orbitals Simulator -->
          <div id="tab-content-bohr" style="display: none; flex-direction: column; gap: 10px;">
            <div style="width: 100%; height: 210px; position: relative; background: #030712; border-radius: var(--radius-sm); border: 1px solid rgba(56, 189, 248, 0.3); overflow: hidden; box-shadow: inset 0 0 25px rgba(0,0,0,0.8);">
              <canvas id="bohr-canvas" width="350" height="210" style="width: 100%; height: 100%; display: block;"></canvas>
              <div style="position: absolute; bottom: 6px; left: 8px; font-size: 0.7rem; color: #38bdf8; font-family: var(--font-mono);">
                Quantum Bohr Model (n=1 to 7)
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 6px; background: rgba(2, 6, 23, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 10px 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.75rem; color: #94a3b8;">Electron Config:</span>
                <span style="font-family: var(--font-mono); color: #38bdf8; font-weight: 700; font-size: 0.85rem;" id="elem-ec">[Xe] 6s¹ 4f¹⁴ 5d¹⁰</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.75rem; color: #94a3b8;">Quantum Shell Counts:</span>
                <span style="font-family: var(--font-mono); color: #facc15; font-weight: 700; font-size: 0.78rem;" id="elem-shells-breakdown">2, 8, 18, 32, 18, 1</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.75rem; color: #94a3b8;">Oxidation States:</span>
                <span style="font-family: var(--font-mono); color: #34d399; font-weight: 700; font-size: 0.8rem;" id="elem-ox">-1, +1, +3</span>
              </div>
            </div>
          </div>

          <!-- TAB 3: Flame Test Emission & Discrete Spectral Lines -->
          <div id="tab-content-spectra" style="display: none; flex-direction: column; gap: 10px;">
            <!-- Flame Circle and Description -->
            <div style="background: rgba(2, 6, 23, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px 14px; display: flex; align-items: center; gap: 12px;">
              <div id="flame-preview-circle" style="width: 38px; height: 38px; border-radius: 50%; background: #38bdf8; box-shadow: 0 0 16px #38bdf8; flex-shrink: 0;"></div>
              <div>
                <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase;">Characteristic Flame Emission</div>
                <div style="font-size: 0.85rem; color: #f8fafc; font-weight: 700;" id="flame-desc">Visible emission</div>
              </div>
            </div>

            <!-- Visible Spectrometer Wavelength Bar (380 nm - 750 nm) -->
            <div style="background: rgba(2, 6, 23, 0.8); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase;">Visible Emission Spectrometer</span>
                <span id="spectral-lines-text" style="font-size: 0.72rem; color: #38bdf8; font-family: var(--font-mono);">λ: 589 nm</span>
              </div>

              <!-- Optical Rainbow Bar with Emission Line Overlays -->
              <div style="position: relative; height: 36px; border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.2); background: linear-gradient(to right, #4c00ff 0%, #0044ff 15%, #00d4ff 30%, #00ff44 50%, #eeff00 70%, #ff8800 85%, #ff0000 100%);">
                <div id="spectrometer-lines-overlay" style="position: absolute; inset: 0; pointer-events: none;"></div>
              </div>

              <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 0.65rem; color: #64748b;">
                <span>380 nm (UV)</span>
                <span>500 nm</span>
                <span>600 nm</span>
                <span>750 nm (IR)</span>
              </div>
            </div>
          </div>

          <!-- Comprehensive Physical & Chemical Telemetry Grid (Always visible) -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.8rem; background: rgba(2, 6, 23, 0.5); padding: 10px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">
            <div>
              <span style="color: var(--text-muted); font-size: 0.72rem; display: block;">Electronegativity:</span>
              <span style="font-family: var(--font-mono); color: #f59e0b; font-weight: 700;" id="elem-en">2.54 Pauling</span>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 0.72rem; display: block;">1st Ionization Energy:</span>
              <span style="font-family: var(--font-mono); color: #10b981; font-weight: 700;" id="elem-ie">890 kJ/mol</span>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 0.72rem; display: block;">Atomic Radius:</span>
              <span style="font-family: var(--font-mono); color: #ec4899; font-weight: 700;" id="elem-radius">174 pm</span>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 0.72rem; display: block;">Density at STP:</span>
              <span style="font-family: var(--font-mono); color: #38bdf8; font-weight: 700;" id="elem-density">19.3 g/cm³</span>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 0.72rem; display: block;">Melting Point:</span>
              <span style="font-family: var(--font-mono); color: #f97316; font-weight: 700;" id="elem-mp">1064.18 °C</span>
            </div>
            <div>
              <span style="color: var(--text-muted); font-size: 0.72rem; display: block;">Boiling Point:</span>
              <span style="font-family: var(--font-mono); color: #ef4444; font-weight: 700;" id="elem-bp">2970 °C</span>
            </div>
            <div style="grid-column: 1 / span 2; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 6px;">
              <span style="color: var(--text-muted); font-size: 0.72rem; display: block;">Discovery History:</span>
              <span style="color: #cbd5e1; font-weight: 600; font-size: 0.78rem;" id="elem-discovered">Circa 3000 BCE (Antiquity)</span>
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
            <span>📥 Export All 118 Elements CSV</span>
          </button>
          <button class="btn btn-primary" id="btn-open-ptable-report" style="padding: 6px 14px; font-size: 0.8rem; gap: 6px; background: linear-gradient(135deg, #0284c7, #0369a1); border: none;">
            <span>📑 Generate Lab Report</span>
          </button>
        </div>
      </div>

      <!-- Full-Screen 4K Specimen Interactive Modal -->
      <div id="ptable-specimen-modal" style="display: none; position: fixed; inset: 0; z-index: 99999; background: rgba(3, 7, 18, 0.88); backdrop-filter: blur(12px); padding: 24px; align-items: center; justify-content: center;">
        <div style="background: #0f172a; border: 1.5px solid rgba(56, 189, 248, 0.4); border-radius: var(--radius-lg); max-width: 850px; width: 100%; max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.9);">
          <!-- Modal Header -->
          <div style="padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 1.4rem;" id="modal-motif">💎</span>
              <div>
                <h3 style="margin: 0; font-size: 1.15rem; color: #ffffff;" id="modal-elem-title">Gold (Au) • 4K Specimen</h3>
                <span style="font-size: 0.78rem; color: #38bdf8; font-family: var(--font-mono);" id="modal-elem-meta">Z = 79 • Group 11, Period 6</span>
              </div>
            </div>
            <button id="modal-close-btn" style="background: rgba(255,255,255,0.1); border: none; color: #cbd5e1; width: 32px; height: 32px; border-radius: 50%; font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
          </div>

          <!-- Modal Body -->
          <div style="padding: 20px; display: flex; flex-direction: column; gap: 16px;">
            <div style="width: 100%; height: 380px; border-radius: 8px; overflow: hidden; background: #000; border: 1px solid rgba(255,255,255,0.1); position: relative;">
              <img id="modal-specimen-img" src="" alt="4K Specimen" style="width: 100%; height: 100%; object-fit: contain;" />
            </div>

            <div style="font-size: 0.88rem; color: #94a3b8; font-style: italic; border-left: 3px solid #38bdf8; padding-left: 10px;" id="modal-img-caption">
              Specimen description.
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
              <div style="background: rgba(2, 6, 23, 0.7); padding: 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">
                <h4 style="margin: 0 0 6px 0; font-size: 0.85rem; color: #34d399; text-transform: uppercase;">🌍 Natural Occurrence</h4>
                <p style="margin: 0; font-size: 0.82rem; color: #cbd5e1; line-height: 1.45;" id="modal-occurrence-text"></p>
              </div>

              <div style="background: rgba(2, 6, 23, 0.7); padding: 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">
                <h4 style="margin: 0 0 6px 0; font-size: 0.85rem; color: #38bdf8; text-transform: uppercase;">🚀 Applications & Uses</h4>
                <p style="margin: 0; font-size: 0.82rem; color: #cbd5e1; line-height: 1.45;" id="modal-uses-text"></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Post-Lab Checkpoint Assessment Mount -->
      <div id="ptable-checkpoint-container"></div>
    </div>
  `;

  // Bohr Canvas references
  const bohrCanvas = document.getElementById("bohr-canvas");
  const bohrCtx = bohrCanvas ? bohrCanvas.getContext("2d") : null;

  // Render the IUPAC 18-Column Grid
  function renderGrid() {
    const grid = document.getElementById("ptable-grid");
    if (!grid) return;

    grid.innerHTML = "";

    // 1. Lanthanides & Actinides Indicator Cells (Period 6 and Period 7, Column 3)
    const lanthIndicator = document.createElement("div");
    lanthIndicator.style.gridRow = "6";
    lanthIndicator.style.gridColumn = "3";
    lanthIndicator.style.border = "1.5px dashed #d946ef";
    lanthIndicator.style.background = selectedCategory === "lanthanide" ? "rgba(217, 70, 239, 0.3)" : "rgba(217, 70, 239, 0.12)";
    lanthIndicator.style.borderRadius = "6px";
    lanthIndicator.style.padding = "4px 2px";
    lanthIndicator.style.textAlign = "center";
    lanthIndicator.style.cursor = "pointer";
    lanthIndicator.style.display = "flex";
    lanthIndicator.style.flexDirection = "column";
    lanthIndicator.style.justifyContent = "center";
    lanthIndicator.style.transition = "all 0.2s ease";
    lanthIndicator.innerHTML = `
      <div style="font-size: 0.65rem; color: #d946ef; font-weight: 800;">57–71</div>
      <div style="font-size: 0.82rem; font-weight: 800; color: #fdf4ff;">La–Lu</div>
      <div style="font-size: 0.55rem; color: #e879f9; text-transform: uppercase; font-weight: 700;">Lanthanides</div>
    `;
    lanthIndicator.title = "Click to filter Lanthanide Rare Earths";
    lanthIndicator.addEventListener("click", () => {
      setCategoryFilter(selectedCategory === "lanthanide" ? "all" : "lanthanide");
    });
    grid.appendChild(lanthIndicator);

    const actinIndicator = document.createElement("div");
    actinIndicator.style.gridRow = "7";
    actinIndicator.style.gridColumn = "3";
    actinIndicator.style.border = "1.5px dashed #ec4899";
    actinIndicator.style.background = selectedCategory === "actinide" ? "rgba(236, 72, 153, 0.3)" : "rgba(236, 72, 153, 0.12)";
    actinIndicator.style.borderRadius = "6px";
    actinIndicator.style.padding = "4px 2px";
    actinIndicator.style.textAlign = "center";
    actinIndicator.style.cursor = "pointer";
    actinIndicator.style.display = "flex";
    actinIndicator.style.flexDirection = "column";
    actinIndicator.style.justifyContent = "center";
    actinIndicator.style.transition = "all 0.2s ease";
    actinIndicator.innerHTML = `
      <div style="font-size: 0.65rem; color: #ec4899; font-weight: 800;">89–103</div>
      <div style="font-size: 0.82rem; font-weight: 800; color: #fdf2f8;">Ac–Lr</div>
      <div style="font-size: 0.55rem; color: #f472b6; text-transform: uppercase; font-weight: 700;">Actinides</div>
    `;
    actinIndicator.title = "Click to filter Actinide Heavy Metals";
    actinIndicator.addEventListener("click", () => {
      setCategoryFilter(selectedCategory === "actinide" ? "all" : "actinide");
    });
    grid.appendChild(actinIndicator);

    // 2. F-Block Row Labels (Row 9 and 10, Cols 1 to 3)
    const lanthLabel = document.createElement("div");
    lanthLabel.style.gridRow = "9";
    lanthLabel.style.gridColumn = "1 / span 3";
    lanthLabel.style.display = "flex";
    lanthLabel.style.alignItems = "center";
    lanthLabel.style.justifyContent = "flex-end";
    lanthLabel.style.paddingRight = "8px";
    lanthLabel.style.fontSize = "0.72rem";
    lanthLabel.style.fontWeight = "800";
    lanthLabel.style.color = "#d946ef";
    lanthLabel.style.letterSpacing = "0.04em";
    lanthLabel.innerHTML = `Lanthanides (4f) ▸`;
    grid.appendChild(lanthLabel);

    const actinLabel = document.createElement("div");
    actinLabel.style.gridRow = "10";
    actinLabel.style.gridColumn = "1 / span 3";
    actinLabel.style.display = "flex";
    actinLabel.style.alignItems = "center";
    actinLabel.style.justifyContent = "flex-end";
    actinLabel.style.paddingRight = "8px";
    actinLabel.style.fontSize = "0.72rem";
    actinLabel.style.fontWeight = "800";
    actinLabel.style.color = "#ec4899";
    actinLabel.style.letterSpacing = "0.04em";
    actinLabel.innerHTML = `Actinides (5f) ▸`;
    grid.appendChild(actinLabel);

    // 3. Render all 118 Elements
    elementsData.forEach(el => {
      const color = getTrendColor(el);
      const isSelected = (selectedElem.z === el.z);

      // Filtering criteria
      const matchesCategory = (selectedCategory === "all" || el.cat === selectedCategory);
      let matchesSearch = true;
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.trim().toLowerCase();
        matchesSearch = (
          el.n.toLowerCase().includes(q) ||
          el.s.toLowerCase().includes(q) ||
          el.z.toString() === q
        );
      }

      const isDimmed = !matchesCategory || !matchesSearch;

      const cell = document.createElement("div");
      cell.className = `ptable-cell ${isSelected ? 'selected' : ''}`;
      cell.style.gridRow = `${el.gridRow}`;
      cell.style.gridColumn = `${el.gridCol}`;
      cell.style.setProperty("--trend-color", color);
      cell.style.borderTop = `3px solid ${color}`;
      cell.style.borderRadius = "6px";
      cell.style.padding = "4px 3px";
      cell.style.textAlign = "center";
      cell.style.cursor = "pointer";
      cell.style.transition = "all 0.2s ease";
      cell.style.userSelect = "none";
      cell.style.display = "flex";
      cell.style.flexDirection = "column";
      cell.style.justifyContent = "space-between";

      if (isDimmed) {
        cell.style.opacity = "0.2";
        cell.style.filter = "grayscale(85%)";
        cell.style.transform = "scale(0.96)";
      } else {
        cell.style.opacity = "1";
        cell.style.filter = "none";
      }

      if (isSelected) {
        cell.style.background = `${color}28`;
        cell.style.borderColor = color;
        cell.style.boxShadow = `0 0 14px ${color}88`;
      }

      cell.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; font-size: 0.62rem; color: #94a3b8; font-family: var(--font-mono);">
          <span>${el.z}</span>
          <span style="font-size: 0.58rem;" title="${el.state}">${getStateIcon(el.state)}</span>
        </div>
        <div class="ptable-cell-s" style="font-size: 1.05rem; font-weight: 800; color: #ffffff; line-height: 1.1;">${el.s}</div>
        <div class="ptable-cell-m" style="font-size: 0.58rem; color: #94a3b8; font-family: var(--font-mono); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${typeof el.m === 'number' ? el.m.toFixed(1) : el.m}</div>
      `;

      cell.addEventListener("mouseenter", () => {
        if (!isDimmed) {
          cell.style.transform = "translateY(-3px) scale(1.04)";
          cell.style.boxShadow = `0 8px 18px ${color}66`;
          cell.style.zIndex = "10";
        }
      });

      cell.addEventListener("mouseleave", () => {
        if (!isDimmed) {
          cell.style.transform = "none";
          cell.style.boxShadow = isSelected ? `0 0 14px ${color}88` : "none";
          cell.style.zIndex = "1";
        }
      });

      cell.addEventListener("click", () => {
        selectedElem = el;
        updateInspector();
        renderGrid();
      });

      grid.appendChild(cell);
    });
  }

  // Update Inspector Card with the Selected Element Data
  function updateInspector() {
    const el = selectedElem;
    const cat = CATEGORY_METADATA[el.cat] || { name: el.cat, color: "#38bdf8" };

    // Badges & Header
    const elemZ = document.getElementById("elem-z");
    if (elemZ) elemZ.innerText = `Z = ${el.z}`;

    const elemStateBadge = document.getElementById("elem-state-badge");
    if (elemStateBadge) {
      elemStateBadge.innerText = `${getStateIcon(el.state)} ${el.state}`;
    }

    const elemBlockBadge = document.getElementById("elem-block-badge");
    if (elemBlockBadge) {
      elemBlockBadge.innerText = `${el.block}-block`;
    }

    const elemCatBadge = document.getElementById("elem-cat-badge");
    if (elemCatBadge) {
      elemCatBadge.innerText = cat.name;
      elemCatBadge.style.color = cat.color;
      elemCatBadge.style.background = `${cat.color}22`;
      elemCatBadge.style.borderColor = `${cat.color}55`;
    }

    const elemSymbol = document.getElementById("elem-symbol");
    if (elemSymbol) elemSymbol.innerText = el.s;

    const elemName = document.getElementById("elem-name");
    if (elemName) elemName.innerText = el.n;

    const elemMass = document.getElementById("elem-mass");
    if (elemMass) elemMass.innerText = `${el.m} amu (u)`;

    // Tab 1: Specimen & Occurrence
    const specimenImg = document.getElementById("elem-specimen-img");
    if (specimenImg) {
      specimenImg.onerror = () => {
        specimenImg.onerror = null;
        specimenImg.src = generateElementSpecimenSvg(el);
      };
      specimenImg.src = el.image || generateElementSpecimenSvg(el);
    }

    const imgDesc = document.getElementById("elem-img-desc");
    if (imgDesc) imgDesc.innerText = el.imageDesc || `${el.n} natural specimen.`;

    const occElem = document.getElementById("elem-occurrence");
    if (occElem) occElem.innerText = el.occurrence;

    const usesElem = document.getElementById("elem-uses");
    if (usesElem) usesElem.innerText = el.uses;

    // Tab 2: Bohr Breakdown
    const ecElem = document.getElementById("elem-ec");
    if (ecElem) ecElem.innerText = el.ec;

    const shellsElem = document.getElementById("elem-shells-breakdown");
    if (shellsElem) {
      const shellNames = ["K", "L", "M", "N", "O", "P", "Q"];
      const formatted = (el.shells || []).map((cnt, idx) => `${shellNames[idx] || (idx + 1)}:${cnt}`).join("  ");
      shellsElem.innerText = formatted || el.shells?.join(", ");
    }

    const oxElem = document.getElementById("elem-ox");
    if (oxElem) oxElem.innerText = el.ox || "0";

    // Tab 3: Flame & Spectral Lines
    const flameDot = document.getElementById("flame-preview-circle");
    const flameDesc = document.getElementById("flame-desc");
    const linesText = document.getElementById("spectral-lines-text");
    const overlay = document.getElementById("spectrometer-lines-overlay");

    if (flameDot && flameDesc) {
      if (el.flame) {
        flameDot.style.background = el.flame;
        flameDot.style.boxShadow = `0 0 18px ${el.flame}`;
        flameDesc.innerText = `Characteristic Flame Emission: ${el.n}`;
      } else {
        flameDot.style.background = "#334155";
        flameDot.style.boxShadow = "none";
        flameDesc.innerText = "No visible flame emission color";
      }
    }

    if (linesText) {
      if (el.lines && el.lines.length > 0) {
        linesText.innerText = `λ: ${el.lines.join(", ")} nm`;
      } else {
        linesText.innerText = "UV/Infrared Bands Only";
      }
    }

    if (overlay) {
      overlay.innerHTML = "";
      if (el.lines && el.lines.length > 0) {
        el.lines.forEach(wl => {
          // Visible spectrum: 380nm to 750nm
          const clamped = Math.max(380, Math.min(750, wl));
          const pct = ((clamped - 380) / (750 - 380)) * 100;
          const line = document.createElement("div");
          line.style.position = "absolute";
          line.style.top = "0";
          line.style.bottom = "0";
          line.style.left = `${pct}%`;
          line.style.width = "2px";
          line.style.background = "#ffffff";
          line.style.boxShadow = "0 0 6px #ffffff";
          line.title = `${wl} nm`;
          overlay.appendChild(line);
        });
      }
    }

    // Always-visible Telemetry
    const enElem = document.getElementById("elem-en");
    if (enElem) enElem.innerText = el.en ? `${el.en} Pauling` : "N/A (Noble / Inert)";

    const ieElem = document.getElementById("elem-ie");
    if (ieElem) ieElem.innerText = `${el.ie} kJ/mol`;

    const radElem = document.getElementById("elem-radius");
    if (radElem) radElem.innerText = `${el.r} pm`;

    const denElem = document.getElementById("elem-density");
    if (denElem) denElem.innerText = el.density !== null ? `${el.density} g/cm³` : "N/A";

    const mpElem = document.getElementById("elem-mp");
    if (mpElem) mpElem.innerText = el.mp !== null ? `${el.mp} °C` : "N/A";

    const bpElem = document.getElementById("elem-bp");
    if (bpElem) bpElem.innerText = el.bp !== null ? `${el.bp} °C` : "N/A";

    const discElem = document.getElementById("elem-discovered");
    if (discElem) discElem.innerText = el.discovered || "Ancient Antiquity";
  }

  // 60 FPS Animated Quantum Bohr Orbital Simulation
  function drawBohr() {
    if (!bohrCanvas || !bohrCtx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = bohrCanvas.width / dpr;
    const h = bohrCanvas.height / dpr;

    bohrCtx.save();
    bohrCtx.scale(dpr, dpr);
    bohrCtx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;

    const cat = CATEGORY_METADATA[selectedElem.cat] || { color: "#38bdf8" };
    const nucColor = cat.color;

    // Glowing Central Nucleus
    const nucGrad = bohrCtx.createRadialGradient(cx, cy, 2, cx, cy, 16);
    nucGrad.addColorStop(0, "#ffffff");
    nucGrad.addColorStop(0.35, nucColor);
    nucGrad.addColorStop(1, "rgba(15, 23, 42, 0)");

    bohrCtx.fillStyle = nucGrad;
    bohrCtx.shadowColor = nucColor;
    bohrCtx.shadowBlur = 16;
    bohrCtx.beginPath();
    bohrCtx.arc(cx, cy, 14, 0, Math.PI * 2);
    bohrCtx.fill();
    bohrCtx.shadowBlur = 0;

    bohrCtx.fillStyle = "#ffffff";
    bohrCtx.font = "bold 10px JetBrains Mono";
    bohrCtx.textAlign = "center";
    bohrCtx.textBaseline = "middle";
    bohrCtx.fillText(`${selectedElem.z}+`, cx, cy);

    // Orbiting Electron Shells
    const shells = selectedElem.shells || [1];
    const maxR = Math.min(cx, cy) - 16;
    const stepR = (maxR - 18) / (shells.length || 1);

    electronRotation += 0.015;

    shells.forEach((electronCount, sIdx) => {
      const radius = 22 + (sIdx + 1) * stepR;

      bohrCtx.strokeStyle = "rgba(56, 189, 248, 0.22)";
      bohrCtx.lineWidth = 1.1;
      bohrCtx.beginPath();
      bohrCtx.arc(cx, cy, radius, 0, Math.PI * 2);
      bohrCtx.stroke();

      for (let e = 0; e < electronCount; e++) {
        const speedMult = (sIdx % 2 === 0 ? 1 : -1) * (1 / (sIdx + 1.2));
        const ang = electronRotation * speedMult + (e * Math.PI * 2) / electronCount;
        const ex = cx + Math.cos(ang) * radius;
        const ey = cy + Math.sin(ang) * radius;

        bohrCtx.fillStyle = "#38bdf8";
        bohrCtx.shadowColor = "#38bdf8";
        bohrCtx.shadowBlur = 6;
        bohrCtx.beginPath();
        bohrCtx.arc(ex, ey, 2.8, 0, Math.PI * 2);
        bohrCtx.fill();
        bohrCtx.shadowBlur = 0;
      }
    });

    bohrCtx.restore();
  }

  function loop() {
    if (activeTab === "bohr") {
      drawBohr();
    }
    animId = requestAnimationFrame(loop);
  }

  // Switch Active Tab
  function setTab(tab) {
    activeTab = tab;
    const tabSpecimen = document.getElementById("tab-content-specimen");
    const tabBohr = document.getElementById("tab-content-bohr");
    const tabSpectra = document.getElementById("tab-content-spectra");

    const btnSpecimen = document.getElementById("tab-btn-specimen");
    const btnBohr = document.getElementById("tab-btn-bohr");
    const btnSpectra = document.getElementById("tab-btn-spectra");

    if (tabSpecimen) tabSpecimen.style.display = (tab === "specimen" ? "flex" : "none");
    if (tabBohr) tabBohr.style.display = (tab === "bohr" ? "flex" : "none");
    if (tabSpectra) tabSpectra.style.display = (tab === "spectra" ? "flex" : "none");

    if (btnSpecimen) {
      btnSpecimen.style.background = (tab === "specimen" ? "#0284c7" : "transparent");
      btnSpecimen.style.color = (tab === "specimen" ? "#ffffff" : "#94a3b8");
    }
    if (btnBohr) {
      btnBohr.style.background = (tab === "bohr" ? "#0284c7" : "transparent");
      btnBohr.style.color = (tab === "bohr" ? "#ffffff" : "#94a3b8");
    }
    if (btnSpectra) {
      btnSpectra.style.background = (tab === "spectra" ? "#0284c7" : "transparent");
      btnSpectra.style.color = (tab === "spectra" ? "#ffffff" : "#94a3b8");
    }
  }

  function setCategoryFilter(cat) {
    selectedCategory = cat;
    container.querySelectorAll(".cat-pill").forEach(p => {
      const pCat = p.getAttribute("data-cat");
      if (pCat === cat) {
        p.classList.add("active");
        p.style.background = "#38bdf8";
        p.style.color = "#020617";
        p.style.borderColor = "#38bdf8";
      } else {
        p.classList.remove("active");
        p.style.background = "rgba(15,23,42,0.8)";
        p.style.color = "#cbd5e1";
        const meta = CATEGORY_METADATA[pCat];
        p.style.borderColor = meta ? `${meta.color}55` : "rgba(255,255,255,0.1)";
      }
    });
    renderGrid();
  }

  // Open Fullscreen Specimen Modal
  function openSpecimenModal() {
    const modal = document.getElementById("ptable-specimen-modal");
    if (!modal) return;

    const el = selectedElem;
    const cat = CATEGORY_METADATA[el.cat] || { name: el.cat, color: "#38bdf8" };

    const modalTitle = document.getElementById("modal-elem-title");
    if (modalTitle) modalTitle.innerText = `${el.n} (${el.s}) • 4K Specimen`;

    const modalMeta = document.getElementById("modal-elem-meta");
    if (modalMeta) modalMeta.innerText = `Z = ${el.z} • ${cat.name} • Group ${el.group}, Period ${el.period} • Mass ${el.m} u`;

    const modalImg = document.getElementById("modal-specimen-img");
    if (modalImg) {
      modalImg.onerror = () => {
        modalImg.onerror = null;
        modalImg.src = generateElementSpecimenSvg(el);
      };
      modalImg.src = el.image || generateElementSpecimenSvg(el);
    }

    const modalCap = document.getElementById("modal-img-caption");
    if (modalCap) modalCap.innerText = el.imageDesc || "Specimen photograph.";

    const modalOcc = document.getElementById("modal-occurrence-text");
    if (modalOcc) modalOcc.innerText = el.occurrence;

    const modalUses = document.getElementById("modal-uses-text");
    if (modalUses) modalUses.innerText = el.uses;

    modal.style.display = "flex";
  }

  function closeSpecimenModal() {
    const modal = document.getElementById("ptable-specimen-modal");
    if (modal) modal.style.display = "none";
  }

  // Bind Event Listeners
  document.getElementById("tab-btn-specimen")?.addEventListener("click", () => setTab("specimen"));
  document.getElementById("tab-btn-bohr")?.addEventListener("click", () => setTab("bohr"));
  document.getElementById("tab-btn-spectra")?.addEventListener("click", () => setTab("spectra"));

  document.getElementById("select-trend")?.addEventListener("change", (e) => {
    trendOverlay = e.target.value;
    renderGrid();
  });

  const searchInput = document.getElementById("ptable-search-input");
  searchInput?.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderGrid();

    // If exact match found, auto-select
    const exact = elementsData.find(el =>
      el.s.toLowerCase() === searchQuery.trim().toLowerCase() ||
      el.n.toLowerCase() === searchQuery.trim().toLowerCase() ||
      el.z.toString() === searchQuery.trim()
    );
    if (exact) {
      selectedElem = exact;
      updateInspector();
    }
  });

  document.getElementById("btn-clear-search")?.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    searchQuery = "";
    renderGrid();
  });

  // Category filter pills
  container.querySelectorAll(".cat-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      const cat = pill.getAttribute("data-cat");
      setCategoryFilter(cat);
    });
  });

  // Quick Specimen buttons
  container.querySelectorAll(".specimen-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const sym = btn.getAttribute("data-sym");
      const el = elementsData.find(e => e.s === sym);
      if (el) {
        selectedElem = el;
        setTab("specimen");
        updateInspector();
        renderGrid();
      }
    });
  });

  // Specimen Fullscreen Modal Triggers
  document.getElementById("btn-fullscreen-specimen")?.addEventListener("click", (e) => {
    e.stopPropagation();
    openSpecimenModal();
  });
  document.getElementById("specimen-img-container")?.addEventListener("click", openSpecimenModal);
  document.getElementById("modal-close-btn")?.addEventListener("click", closeSpecimenModal);
  document.getElementById("ptable-specimen-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "ptable-specimen-modal") closeSpecimenModal();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSpecimenModal();
  });

  // Telemetry Suite: Record Element as Trial
  document.getElementById("btn-record-ptable-trial")?.addEventListener("click", () => {
    LabTrialStore.addTrial("ptable", {
      measurements: {
        "Element": `${selectedElem.n} (${selectedElem.s})`,
        "Z": selectedElem.z,
        "Period": selectedElem.period,
        "Group": selectedElem.group,
        "State": selectedElem.state,
        "Config": selectedElem.ec,
        "EN (Pauling)": selectedElem.en || "N/A",
        "IE (kJ/mol)": selectedElem.ie,
        "Radius (pm)": selectedElem.r,
        "Density (g/cm³)": selectedElem.density || "N/A",
        "Melting Point (°C)": selectedElem.mp || "N/A"
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

  // Telemetry Suite: Export All 118 Elements CSV
  document.getElementById("btn-export-ptable-csv")?.addEventListener("click", () => {
    exportLabDataCsv({
      title: "IUPAC 118 Chemical Elements Master Database",
      labId: "ptable",
      parameters: {
        "Currently Inspected": `${selectedElem.n} (${selectedElem.s})`,
        "Selected Trend Heatmap": trendOverlay.toUpperCase(),
        "Catalog Size": `${elementsData.length} Elements`
      },
      headers: [
        "Atomic Number (Z)",
        "Symbol",
        "Element Name",
        "Category",
        "Period",
        "Group",
        "Block",
        "Standard State",
        "Atomic Mass (amu)",
        "Electronegativity (Pauling)",
        "1st Ionization Energy (kJ/mol)",
        "Atomic Radius (pm)",
        "Melting Point (°C)",
        "Boiling Point (°C)",
        "Density (g/cm³)",
        "Oxidation States",
        "Electron Configuration",
        "Discovery",
        "Natural Occurrence",
        "Modern Applications"
      ],
      dataRows: elementsData.map(e => [
        e.z,
        e.s,
        e.n,
        e.cat,
        e.period,
        e.group,
        e.block,
        e.state,
        e.m,
        e.en || "",
        e.ie,
        e.r,
        e.mp !== null ? e.mp : "",
        e.bp !== null ? e.bp : "",
        e.density !== null ? e.density : "",
        `"${e.ox}"`,
        `"${e.ec}"`,
        `"${e.discovered}"`,
        `"${e.occurrence.replace(/"/g, '""')}"`,
        `"${e.uses.replace(/"/g, '""')}"`
      ])
    });
  });

  // Telemetry Suite: Generate Lab Report
  document.getElementById("btn-open-ptable-report")?.addEventListener("click", () => {
    const trials = LabTrialStore.getTrials("ptable");

    openLabReportModal({
      title: "Periodic Trends, Quantum Shell Architecture & Mineralogical Occurrences",
      subject: "Chemistry",
      inquiryQuestion: "How do nuclear charge and electron shielding quantitatively govern periodic trends in atomic radius, ionization energy, electronegativity, and natural crystal formations?",
      parameters: {
        "Target Element": `${selectedElem.n} (${selectedElem.s})`,
        "Atomic Number (Z)": `${selectedElem.z}`,
        "Group & Period": `Group ${selectedElem.group}, Period ${selectedElem.period} (${selectedElem.block}-block)`,
        "Standard State": `${selectedElem.state}`,
        "Ground-State Electron Config": `${selectedElem.ec}`,
        "Electronegativity (Pauling)": `${selectedElem.en || "N/A (Noble / Inert)"}`,
        "First Ionization Energy": `${selectedElem.ie} kJ/mol`,
        "Covalent Atomic Radius": `${selectedElem.r} pm`,
        "Melting / Boiling Points": `${selectedElem.mp} °C / ${selectedElem.bp} °C`
      },
      trials,
      formulas: [
        "Z_{\\text{eff}} = Z - S \\quad (\\text{Effective Nuclear Charge})",
        "E_n = -\\frac{13.6 \\text{ eV}}{n^2} \\cdot Z_{\\text{eff}}^2 \\quad (\\text{Bohr Quantized Energy})",
        "\\Delta E = h\\nu = \\frac{hc}{\\lambda} \\quad (\\text{Photon Spectral Emission})"
      ]
    });
  });

  // Mount Post-Lab Checkpoint Assessment
  mountLabCheckpoint("ptable-checkpoint-container", "ptable");

  // Initial Mount
  renderGrid();
  updateInspector();
  loop();

  return () => {
    if (animId) cancelAnimationFrame(animId);
  };
}
