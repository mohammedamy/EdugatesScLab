// Edugates-ClipSAT Science Labs - Biology: Kirby-Bauer Antibiotic Resistance & Microbiology Suite
// 60 FPS Precision Medical Microbiology Simulation:
// Fickian radial diffusion, Zone of Inhibition (ZOI) clearance physics,
// Clinical & Laboratory Standards Institute (CLSI) M100 interpretive breakpoints (R, I, S),
// Bacterial lawns (E. coli, S. aureus, MRSA, P. aeruginosa),
// Digital vernier caliper millimeter measurement tool, 37°C incubator incubation time course.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initAntibioticResistanceLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return () => {};

  // Bacterial Strains Database
  const BACTERIAL_STRAINS = {
    ecoli: {
      name: "Escherichia coli (ATCC 25922)",
      type: "Gram-Negative Bacillus",
      lawnColor: "#fef3c7", // Creamy off-white lawn
      description: "Standard Gram-negative reference strain. Outer lipopolysaccharide membrane provides intrinsic protection against large glycopeptides.",
      baseGrowthRate: 1.0
    },
    saureus: {
      name: "Staphylococcus aureus (ATCC 25923)",
      type: "Gram-Positive Coccus (Sensitive)",
      lawnColor: "#fde68a", // Golden-yellow colonies
      description: "Standard wild-type Gram-positive pathogen. High sensitivity to beta-lactams and aminoglycosides.",
      baseGrowthRate: 1.1
    },
    mrsa: {
      name: "MRSA (Methicillin-Resistant S. aureus)",
      type: "Gram-Positive Superbug (mecA+)",
      lawnColor: "#fed7aa", // Pale amber lawn
      description: "Harbors mecA gene encoding PBP2a with very low affinity for beta-lactams. Resistant to ampicillin/methicillin, susceptible to vancomycin.",
      baseGrowthRate: 0.95
    },
    paeruginosa: {
      name: "Pseudomonas aeruginosa (ATCC 27853)",
      type: "Gram-Negative Opportunistic Pathogen",
      lawnColor: "#bbf7d0", // Pyocyanin greenish tint
      description: "Opportunistic hospital pathogen with multidrug efflux pumps (MexAB-OprM) and low outer membrane permeability.",
      baseGrowthRate: 1.05
    }
  };

  // Antibiotic Disks & CLSI Interpretive Breakpoints (Zone Diameter in mm: R <= val, S >= val)
  const ANTIBIOTICS = {
    amp: {
      code: "AMP-10",
      name: "Ampicillin (10 µg)",
      class: "β-Lactam / Penicillin Derivative",
      mechanism: "Inhibits transpeptidase (PBP) cross-linking of peptidoglycan cell wall.",
      diskColor: "#ffffff",
      clsi: { R: 13, I: 16, S: 17 }, // mm breakpoints
      // Nominal zone diameters (mm) at 24h:
      zones: { ecoli: 18, saureus: 28, mrsa: 6, paeruginosa: 6 }
    },
    tet: {
      code: "TET-30",
      name: "Tetracycline (30 µg)",
      class: "Polyketide Protein Synthesis Inhibitor",
      mechanism: "Reversibly binds bacterial 30S ribosomal subunit, preventing aminoacyl-tRNA delivery.",
      diskColor: "#ffffff",
      clsi: { R: 14, I: 18, S: 19 },
      zones: { ecoli: 21, saureus: 25, mrsa: 19, paeruginosa: 8 }
    },
    cip: {
      code: "CIP-5",
      name: "Ciprofloxacin (5 µg)",
      class: "Fluoroquinolone Topoisomerase Inhibitor",
      mechanism: "Inhibits bacterial DNA gyrase (topoisomerase II) and topoisomerase IV, halting DNA replication.",
      diskColor: "#ffffff",
      clsi: { R: 15, I: 20, S: 21 },
      zones: { ecoli: 31, saureus: 24, mrsa: 12, paeruginosa: 26 }
    },
    van: {
      code: "VAN-30",
      name: "Vancomycin (30 µg)",
      class: "Glycopeptide Cell Wall Inhibitor",
      mechanism: "Binds D-Ala-D-Ala terminus of cell wall peptidoglycan precursors. Cannot penetrate Gram-negative outer membrane.",
      diskColor: "#ffffff",
      clsi: { R: 14, I: 16, S: 17 },
      zones: { ecoli: 6, saureus: 22, mrsa: 18, paeruginosa: 6 }
    }
  };

  // 4 Standard Disk Positions on 100mm Mueller-Hinton Agar Petri Dish
  const DISK_SLOTS = [
    { id: 0, antKey: "amp", xRel: 0, yRel: -0.42, label: "Top (12h)" },
    { id: 1, antKey: "tet", xRel: 0.42, yRel: 0, label: "Right (3h)" },
    { id: 2, antKey: "cip", xRel: 0, yRel: 0.42, label: "Bottom (6h)" },
    { id: 3, antKey: "van", xRel: -0.42, yRel: 0, label: "Left (9h)" }
  ];

  // State Variables
  let currentStrainKey = "ecoli";
  let incubationHours = 18; // 0 to 24 hours
  let selectedSlotIndex = 0; // For caliper measurement
  let isCaliperActive = true;
  let caliperJawDistanceMm = 18; // Measured distance
  let viewMode = "sim"; // "sim" or "photo"
  let animId = null;
  let timeTick = 0;

  function getSlotStatus(slot) {
    const ant = ANTIBIOTICS[slot.antKey];
    const maxZoneMm = ant.zones[currentStrainKey] || 6;
    // Diffusion dynamics over time: ZOI scales with sqrt(time)
    const currentZoneMm = Math.max(6, 6 + (maxZoneMm - 6) * Math.min(1.0, Math.sqrt(incubationHours / 18)));
    
    let clsiResult = "Susceptible (S)";
    let badgeClass = "badge-success";
    if (currentZoneMm <= ant.clsi.R) {
      clsiResult = "Resistant (R)";
      badgeClass = "badge-danger";
    } else if (currentZoneMm < ant.clsi.S) {
      clsiResult = "Intermediate (I)";
      badgeClass = "badge-warning";
    }

    return {
      ant,
      nominalZoneMm: maxZoneMm,
      currentZoneMm,
      clsiResult,
      badgeClass
    };
  }

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #10b981; box-shadow: 0 0 10px #10b981;"></span>
            Kirby-Bauer Antibiotic Resistance &amp; Microbiology
          </span>
          <span class="badge" style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            CLSI M100 Standards • Agar Disk Diffusion
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-antibiotic-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🧫 Petri Dish
            </button>
            <button id="view-mode-antibiotic-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Bench
            </button>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-antibiotic-incubate" style="padding: 5px 14px; font-size: 0.78rem;">
            ⏳ Fast-Forward 24h
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-antibiotic-caliper-toggle" style="padding: 5px 12px; font-size: 0.78rem;">
            📏 Toggle Digital Caliper
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-antibiotic-export" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export CSV (E)
          </button>
        </div>
      </div>

      <!-- Main Layout Grid -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 20px;" class="antibiotic-layout">
        <!-- Canvas Viewport -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(16, 185, 129, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #064e3b 0%, #022c22 45%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="antibiotic-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block;"></canvas>

          <!-- 4K Real Laboratory Photograph Overlay -->
          <div id="antibiotic-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <picture>
              <source srcset="assets/labs/antibiotic_bench.webp" type="image/webp">
              <img src="assets/labs/antibiotic_bench.jpg" decoding="async" loading="lazy" alt="4K Research Microbiology Kirby-Bauer Antibiotic Sensitivity Workbench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            </picture>
            
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Agar Media</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Mueller-Hinton Agar (pH 7.3)</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Incubation Chamber</div>
                <div style="color: #facc15; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">37.0°C ± 0.5°C Ambient Air</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Inoculum Density</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">0.5 McFarland (1.5×10⁸ CFU/mL)</div>
              </div>
            </div>
          </div>

          <!-- Top HUD -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">ACTIVE MEASUREMENT DISK</div>
              <div id="hud-antibiotic-disk" style="font-size: 1.12rem; font-weight: 800; color: #34d399; font-family: var(--font-mono);">
                AMP-10 • Ampicillin (10 µg)
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">ZOI DIAMETER &amp; CLSI PROFILE</div>
              <div id="hud-antibiotic-zoi" style="font-size: 1.12rem; font-weight: 800; color: #38bdf8; font-family: var(--font-mono);">
                18.0 mm • Susceptible (S)
              </div>
            </div>
          </div>
        </div>

        <!-- Controls & Microbiology Antibiogram Side -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Controls Panel -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #34d399; text-transform: uppercase; margin-bottom: 12px;">Bacterial Inoculum &amp; Incubation</div>
            
            <div style="margin-bottom: 12px;">
              <label style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 4px;">Bacterial Strain Lawn</label>
              <select id="select-bacterial-strain" class="form-control" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; padding: 6px 10px; font-size: 0.82rem;">
                ${Object.entries(BACTERIAL_STRAINS).map(([k, b]) => `<option value="${k}" ${k === currentStrainKey ? "selected" : ""}>${b.name} (${b.type})</option>`).join("")}
              </select>
            </div>

            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                <span style="color: #94a3b8;">Incubation Time at 37°C</span>
                <span id="lbl-incubation-time" style="color: #fbbf24; font-weight: 700;">18.0 Hours (Standard Endpoint)</span>
              </div>
              <input id="slider-incubation" type="range" min="0" max="24" step="0.5" value="18" style="width: 100%; accent-color: #fbbf24;">
              <div style="display: flex; justify-content: space-between; font-size: 0.68rem; color: #64748b; margin-top: 2px;">
                <span>0 Hours (Fresh Inoculum)</span>
                <span>24 Hours (Confluent Lawn)</span>
              </div>
            </div>

            <!-- Active Caliper Target Selection -->
            <div>
              <label style="font-size: 0.78rem; color: #94a3b8; display: block; margin-bottom: 6px;">Select Antibiotic Disk to Measure</label>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
                ${DISK_SLOTS.map((s, idx) => `
                  <button class="btn btn-secondary btn-sm btn-slot-select ${idx === selectedSlotIndex ? 'active' : ''}" data-slot="${idx}" style="font-size: 0.74rem; padding: 4px 6px; border-color: ${idx === selectedSlotIndex ? '#10b981' : '#334155'}; font-family: var(--font-mono);">
                    ${ANTIBIOTICS[s.antKey].code}
                  </button>
                `).join("")}
              </div>
            </div>
          </div>

          <!-- CLSI Antibiogram Breakpoints Table -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div style="font-size: 0.75rem; font-weight: 700; color: #38bdf8; text-transform: uppercase;">CLSI M100 Interpretive Antibiogram</div>
              <span class="badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-size: 0.68rem; padding: 2px 8px; border-radius: 6px;">
                In Vitro Susceptibility
              </span>
            </div>
            
            <div style="background: #030712; border: 1px solid #1e293b; border-radius: 8px; overflow: hidden;">
              <table style="width: 100%; border-collapse: collapse; font-size: 0.74rem; text-align: left;">
                <thead>
                  <tr style="background: rgba(15, 23, 42, 0.8); border-bottom: 1px solid #334155; color: #94a3b8;">
                    <th style="padding: 6px 10px;">Disk</th>
                    <th style="padding: 6px 8px;">Diameter</th>
                    <th style="padding: 6px 8px;">Breakpoints (R / S)</th>
                    <th style="padding: 6px 10px;">Clinical Result</th>
                  </tr>
                </thead>
                <tbody id="antibiogram-table-body">
                  <!-- Dynamically rendered -->
                </tbody>
              </table>
            </div>

            <div id="strain-clinical-note" style="margin-top: 10px; font-size: 0.74rem; color: #94a3b8; line-height: 1.4; background: rgba(0,0,0,0.25); border-radius: 6px; padding: 8px 12px;">
              Standard reference strain. Susceptible to broad spectrum antibiotics.
            </div>
          </div>

          <!-- Post-Lab Checkpoint Container -->
          <div id="antibiotic-checkpoint-container"></div>
        </div>
      </div>
    </div>
  `;

  // Attach Checkpoint
  mountLabCheckpoint("antibiotic-checkpoint-container", "antibiotic");

  // DOM Elements
  const canvas = document.getElementById("antibiotic-canvas");
  const ctx = canvas.getContext("2d");

  const viewSimBtn = document.getElementById("view-mode-antibiotic-sim");
  const viewPhotoBtn = document.getElementById("view-mode-antibiotic-photo");
  const photoOverlay = document.getElementById("antibiotic-photo-overlay");

  const btnIncubate = document.getElementById("btn-antibiotic-incubate");
  const btnCaliperToggle = document.getElementById("btn-antibiotic-caliper-toggle");
  const btnExport = document.getElementById("btn-antibiotic-export");

  const selectStrain = document.getElementById("select-bacterial-strain");
  const sliderIncubation = document.getElementById("slider-incubation");
  const lblIncubation = document.getElementById("lbl-incubation-time");
  const tableBody = document.getElementById("antibiogram-table-body");
  const strainNote = document.getElementById("strain-clinical-note");

  const hudDisk = document.getElementById("hud-antibiotic-disk");
  const hudZoi = document.getElementById("hud-antibiotic-zoi");

  function updateHUD() {
    const activeSlot = DISK_SLOTS[selectedSlotIndex];
    const status = getSlotStatus(activeSlot);

    hudDisk.textContent = `${status.ant.code} • ${status.ant.name}`;
    hudZoi.textContent = `${status.currentZoneMm.toFixed(1)} mm • ${status.clsiResult}`;

    if (status.clsiResult.includes("Susceptible")) hudZoi.style.color = "#34d399";
    else if (status.clsiResult.includes("Resistant")) hudZoi.style.color = "#f43f5e";
    else hudZoi.style.color = "#fbbf24";

    const strain = BACTERIAL_STRAINS[currentStrainKey];
    strainNote.textContent = strain.description;

    // Render Table Body
    tableBody.innerHTML = DISK_SLOTS.map((s, idx) => {
      const st = getSlotStatus(s);
      const isSelected = idx === selectedSlotIndex;
      let badgeBg = "rgba(16, 185, 129, 0.15)";
      let badgeCol = "#10b981";
      if (st.clsiResult.includes("Resistant")) {
        badgeBg = "rgba(239, 68, 68, 0.15)";
        badgeCol = "#f43f5e";
      } else if (st.clsiResult.includes("Intermediate")) {
        badgeBg = "rgba(245, 158, 11, 0.15)";
        badgeCol = "#fbbf24";
      }

      return `
        <tr style="border-bottom: 1px solid #1e293b; background: ${isSelected ? 'rgba(56, 189, 248, 0.1)' : 'transparent'};">
          <td style="padding: 6px 10px; font-weight: 700; color: #f8fafc; font-family: var(--font-mono);">${st.ant.code}</td>
          <td style="padding: 6px 8px; color: #38bdf8; font-family: var(--font-mono);">${st.currentZoneMm.toFixed(1)} mm</td>
          <td style="padding: 6px 8px; color: #94a3b8; font-family: var(--font-mono);">≤${st.ant.clsi.R} / ≥${st.ant.clsi.S}</td>
          <td style="padding: 6px 10px;">
            <span style="background: ${badgeBg}; color: ${badgeCol}; padding: 2px 6px; border-radius: 4px; font-weight: 600; font-size: 0.68rem;">
              ${st.clsiResult}
            </span>
          </td>
        </tr>
      `;
    }).join("");
  }

  // 60 FPS Canvas Render Loop
  function renderPetriCanvas() {
    if (!container || !container.isConnected) return;
    timeTick += 0.03;
    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);

    const centerX = cw * 0.5;
    const centerY = ch * 0.5;
    const dishRadius = 210; // Represents 100mm petri dish (scale: ~4.2 px/mm)
    const pxPerMm = dishRadius / 50;

    const strain = BACTERIAL_STRAINS[currentStrainKey];
    const lawnAlpha = Math.min(1.0, incubationHours / 14);

    // 1. Petri Dish Base Shadow & Rim
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, dishRadius + 14, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fill();

    // Outer Glass Rim
    ctx.beginPath();
    ctx.arc(centerX, centerY, dishRadius + 4, 0, Math.PI * 2);
    ctx.fillStyle = "#1e293b";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Mueller-Hinton Agar Substrate (Translucent amber agar)
    ctx.beginPath();
    ctx.arc(centerX, centerY, dishRadius, 0, Math.PI * 2);
    const agarGrad = ctx.createRadialGradient(centerX - 40, centerY - 40, 30, centerX, centerY, dishRadius);
    agarGrad.addColorStop(0, "#d97706");
    agarGrad.addColorStop(0.7, "#b45309");
    agarGrad.addColorStop(1, "#78350f");
    ctx.fillStyle = agarGrad;
    ctx.fill();

    // Confluent Bacterial Lawn Layer
    if (lawnAlpha > 0.05) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, dishRadius - 2, 0, Math.PI * 2);
      ctx.fillStyle = strain.lawnColor;
      ctx.globalAlpha = lawnAlpha * 0.88;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }
    ctx.restore();

    // 2. Render Antibiotic Disks & Zones of Inhibition (ZOI)
    DISK_SLOTS.forEach((slot, idx) => {
      const diskX = centerX + slot.xRel * dishRadius;
      const diskY = centerY + slot.yRel * dishRadius;
      const status = getSlotStatus(slot);

      const zoneRadiusPx = (status.currentZoneMm / 2) * pxPerMm;

      // Draw Clear Zone of Inhibition (punching hole through bacterial lawn)
      if (status.currentZoneMm > 6.5 && lawnAlpha > 0.1) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(diskX, diskY, zoneRadiusPx, 0, Math.PI * 2);
        // Clear agar view (amber)
        const zoiGrad = ctx.createRadialGradient(diskX, diskY, 5, diskX, diskY, zoneRadiusPx);
        zoiGrad.addColorStop(0, "#d97706");
        zoiGrad.addColorStop(0.85, "#b45309");
        zoiGrad.addColorStop(1, strain.lawnColor);
        ctx.fillStyle = zoiGrad;
        ctx.globalAlpha = lawnAlpha * 0.95;
        ctx.fill();

        // Delicate zone boundary ring
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      // Antibiotic Paper Filter Disk (Standard 6mm diameter)
      const diskRadiusPx = 3 * pxPerMm; // 3mm radius
      ctx.save();
      // Drop shadow for paper disk
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 2;

      ctx.beginPath();
      ctx.arc(diskX, diskY, diskRadiusPx, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(diskX, diskY, diskRadiusPx, 0, Math.PI * 2);
      ctx.stroke();

      // Disk Printed Code
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 9px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(status.ant.code.split("-")[0], diskX, diskY - 2);
      ctx.font = "8px 'JetBrains Mono', monospace";
      ctx.fillText(status.ant.code.split("-")[1], diskX, diskY + 6);

      // Highlight Active Caliper Disk
      if (idx === selectedSlotIndex) {
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(diskX, diskY, diskRadiusPx + 4, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // 3. Digital Vernier Caliper Overlay Tool
    if (isCaliperActive) {
      const activeSlot = DISK_SLOTS[selectedSlotIndex];
      const activeStatus = getSlotStatus(activeSlot);
      const activeX = centerX + activeSlot.xRel * dishRadius;
      const activeY = centerY + activeSlot.yRel * dishRadius;
      const zoneRadiusPx = (activeStatus.currentZoneMm / 2) * pxPerMm;

      ctx.save();
      // Caliper measurement beam line
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(activeX - zoneRadiusPx, activeY);
      ctx.lineTo(activeX + zoneRadiusPx, activeY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Caliper Jaws
      const jawH = 26;
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 3;
      // Left jaw
      ctx.beginPath();
      ctx.moveTo(activeX - zoneRadiusPx, activeY - jawH / 2);
      ctx.lineTo(activeX - zoneRadiusPx, activeY + jawH / 2);
      ctx.stroke();

      // Right jaw
      ctx.beginPath();
      ctx.moveTo(activeX + zoneRadiusPx, activeY - jawH / 2);
      ctx.lineTo(activeX + zoneRadiusPx, activeY + jawH / 2);
      ctx.stroke();

      // Caliper LCD Readout Pod
      const podW = 100;
      const podH = 28;
      const podX = activeX - podW / 2;
      const podY = activeY - zoneRadiusPx - 38;

      ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(podX, podY, podW, podH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 12px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${activeStatus.currentZoneMm.toFixed(1)} mm`, activeX, podY + podH / 2);
      ctx.restore();
    }

    // 4. Petri Dish Plastic Cover Specular Reflection
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(centerX - 40, centerY - 60, dishRadius * 0.7, dishRadius * 0.35, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.fill();
    ctx.restore();

    animId = requestAnimationFrame(renderPetriCanvas);
  }

  // Event Listeners
  selectStrain.addEventListener("change", (e) => {
    currentStrainKey = e.target.value;
    SoundFX.droplet();
    updateHUD();
  });

  sliderIncubation.addEventListener("input", (e) => {
    incubationHours = parseFloat(e.target.value);
    lblIncubation.textContent = `${incubationHours.toFixed(1)} Hours ${incubationHours >= 18 ? "(Standard Endpoint)" : "(Developing)"}`;
    updateHUD();
  });

  document.querySelectorAll(".btn-slot-select").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".btn-slot-select").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedSlotIndex = parseInt(btn.dataset.slot, 10);
      SoundFX.click();
      updateHUD();
    });
  });

  btnIncubate.addEventListener("click", () => {
    incubationHours = 24;
    sliderIncubation.value = 24;
    lblIncubation.textContent = "24.0 Hours (Full Incubation)";
    SoundFX.success();
    updateHUD();
  });

  btnCaliperToggle.addEventListener("click", () => {
    isCaliperActive = !isCaliperActive;
    btnCaliperToggle.classList.toggle("active", isCaliperActive);
    SoundFX.click();
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
    const strain = BACTERIAL_STRAINS[currentStrainKey];

    exportLabDataCsv({
      title: "Kirby-Bauer Antibiotic Susceptibility Antibiogram",
      labId: "antibiotic",
      parameters: {
        "Bacterial Strain": strain.name,
        "Organism Type": strain.type,
        "Growth Medium": "Mueller-Hinton Agar",
        "Incubation Duration": `${incubationHours.toFixed(1)} h at 37°C`,
        "Guideline Standard": "CLSI M100 Performance Standards"
      },
      headers: ["Antibiotic Disk", "Mechanism of Action", "Inhibition Zone (mm)", "CLSI Breakpoints (R / S)", "Clinical Interpretation"],
      dataRows: DISK_SLOTS.map(s => {
        const st = getSlotStatus(s);
        return [
          st.ant.name,
          st.ant.mechanism,
          st.currentZoneMm.toFixed(1),
          `R ≤ ${st.ant.clsi.R} mm, S ≥ ${st.ant.clsi.S} mm`,
          st.clsiResult
        ];
      })
    });
    SoundFX.success();
  });

  // Standardized Hotkey: 'e' or 'E' triggers CSV telemetry export
  const handleKeyDown = (e) => {
    if ((e.key === "e" || e.key === "E") && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      btnExport.click();
    }
  };
  window.addEventListener("keydown", handleKeyDown);

  // Start Animation Loop
  updateHUD();
  animId = requestAnimationFrame(renderPetriCanvas);

  return function cleanupAntibioticResistanceLab() {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("keydown", handleKeyDown);
  };
}
