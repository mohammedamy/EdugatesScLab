// Edugates-ClipSAT Science Labs - Chemistry: Molecular Geometry & VSEPR 3D Modeler
// Interactive 3D Ball-and-Stick & Space-Filling Molecular Modeler:
// Electron Domain Geometry, Molecular Geometry, Lone Pair Lobes, Bond Angles,
// Dipole Moment Vectors, Polarity Heatmaps, and Steric Number Analysis.

import { renderLatex, formatMathText } from "../utils/math-renderer.js";
import { exportLabDataCsv, openLabReportModal, LabTrialStore, mountLabCheckpoint } from "./lab-telemetry-exporter.js";
import { SoundFX } from "../utils/audio-synth.js";

export function initVseprLab(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Preset molecules database covering all VSEPR geometries from AX2 to AX6
  const MOLECULES = [
    {
      id: "h2o",
      name: "Water (H₂O)",
      formula: "H_2O",
      stericNumber: 4,
      bondingPairs: 2,
      lonePairs: 2,
      axCode: "AX_2E_2",
      electronGeo: "Tetrahedral",
      molecularGeo: "Bent",
      idealAngle: "109.5°",
      actualAngle: 104.5,
      hybridization: "sp^3",
      polarity: "Polar (Net Dipole μ = 1.85 D)",
      isPolar: true,
      dipoleVector: [0, -1.2, 0],
      centralAtom: { symbol: "O", color: "#ef4444", radius: 26, name: "Oxygen" },
      ligands: [
        { symbol: "H", color: "#f8fafc", radius: 15, name: "Hydrogen", pos: [-0.76, 0.58, 0] },
        { symbol: "H", color: "#f8fafc", radius: 15, name: "Hydrogen", pos: [0.76, 0.58, 0] }
      ],
      lonePairPositions: [
        [0, -0.6, 0.78],
        [0, -0.6, -0.78]
      ],
      description: "Two bonding pairs and two lone pairs exert stronger repulsion than bonding pairs, compressing the H-O-H bond angle from 109.5° down to 104.5°."
    },
    {
      id: "co2",
      name: "Carbon Dioxide (CO₂)",
      formula: "CO_2",
      stericNumber: 2,
      bondingPairs: 2,
      lonePairs: 0,
      axCode: "AX_2",
      electronGeo: "Linear",
      molecularGeo: "Linear",
      idealAngle: "180°",
      actualAngle: 180.0,
      hybridization: "sp",
      polarity: "Nonpolar (Bond dipoles cancel, μ = 0 D)",
      isPolar: false,
      dipoleVector: [0, 0, 0],
      centralAtom: { symbol: "C", color: "#475569", radius: 25, name: "Carbon" },
      ligands: [
        { symbol: "O", color: "#ef4444", radius: 24, name: "Oxygen", pos: [-1.25, 0, 0] },
        { symbol: "O", color: "#ef4444", radius: 24, name: "Oxygen", pos: [1.25, 0, 0] }
      ],
      lonePairPositions: [],
      description: "Linear geometry with bond angle of 180°. Two double bonds orient opposite each other. Equal and opposite bond dipoles cancel, making CO₂ nonpolar."
    },
    {
      id: "ch4",
      name: "Methane (CH₄)",
      formula: "CH_4",
      stericNumber: 4,
      bondingPairs: 4,
      lonePairs: 0,
      axCode: "AX_4",
      electronGeo: "Tetrahedral",
      molecularGeo: "Tetrahedral",
      idealAngle: "109.5°",
      actualAngle: 109.5,
      hybridization: "sp^3",
      polarity: "Nonpolar (Symmetric cancellation, μ = 0 D)",
      isPolar: false,
      dipoleVector: [0, 0, 0],
      centralAtom: { symbol: "C", color: "#475569", radius: 25, name: "Carbon" },
      ligands: [
        { symbol: "H", color: "#f8fafc", radius: 15, name: "Hydrogen", pos: [0, 1.0, 0] },
        { symbol: "H", color: "#f8fafc", radius: 15, name: "Hydrogen", pos: [0.94, -0.33, 0] },
        { symbol: "H", color: "#f8fafc", radius: 15, name: "Hydrogen", pos: [-0.47, -0.33, 0.81] },
        { symbol: "H", color: "#f8fafc", radius: 15, name: "Hydrogen", pos: [-0.47, -0.33, -0.81] }
      ],
      lonePairPositions: [],
      description: "Four identical C-H bonding electron pairs maximize separation in 3D space, adopting a tetrahedral geometry with bond angles of 109.5°."
    },
    {
      id: "nh3",
      name: "Ammonia (NH₃)",
      formula: "NH_3",
      stericNumber: 4,
      bondingPairs: 3,
      lonePairs: 1,
      axCode: "AX_3E",
      electronGeo: "Tetrahedral",
      molecularGeo: "Trigonal Pyramidal",
      idealAngle: "109.5°",
      actualAngle: 107.0,
      hybridization: "sp^3",
      polarity: "Polar (Net Dipole μ = 1.47 D)",
      isPolar: true,
      dipoleVector: [0, 1.1, 0],
      centralAtom: { symbol: "N", color: "#3b82f6", radius: 25, name: "Nitrogen" },
      ligands: [
        { symbol: "H", color: "#f8fafc", radius: 15, name: "Hydrogen", pos: [0.94, -0.35, 0] },
        { symbol: "H", color: "#f8fafc", radius: 15, name: "Hydrogen", pos: [-0.47, -0.35, 0.81] },
        { symbol: "H", color: "#f8fafc", radius: 15, name: "Hydrogen", pos: [-0.47, -0.35, -0.81] }
      ],
      lonePairPositions: [
        [0, 0.9, 0]
      ],
      description: "One bulky lone pair pushes the three N-H bonds downward, creating a trigonal pyramid with compressed bond angles of 107.0° and strong polarity."
    },
    {
      id: "bf3",
      name: "Boron Trifluoride (BF₃)",
      formula: "BF_3",
      stericNumber: 3,
      bondingPairs: 3,
      lonePairs: 0,
      axCode: "AX_3",
      electronGeo: "Trigonal Planar",
      molecularGeo: "Trigonal Planar",
      idealAngle: "120°",
      actualAngle: 120.0,
      hybridization: "sp^2",
      polarity: "Nonpolar (Coplanar symmetry, μ = 0 D)",
      isPolar: false,
      dipoleVector: [0, 0, 0],
      centralAtom: { symbol: "B", color: "#f59e0b", radius: 23, name: "Boron" },
      ligands: [
        { symbol: "F", color: "#10b981", radius: 22, name: "Fluorine", pos: [0, 1.15, 0] },
        { symbol: "F", color: "#10b981", radius: 22, name: "Fluorine", pos: [1.0, -0.58, 0] },
        { symbol: "F", color: "#10b981", radius: 22, name: "Fluorine", pos: [-1.0, -0.58, 0] }
      ],
      lonePairPositions: [],
      description: "Boron forms an incomplete octet (6 valence electrons). The three B-F bonds lie in a single plane separated by 120°, yielding zero net dipole moment."
    },
    {
      id: "so2",
      name: "Sulfur Dioxide (SO₂)",
      formula: "SO_2",
      stericNumber: 3,
      bondingPairs: 2,
      lonePairs: 1,
      axCode: "AX_2E",
      electronGeo: "Trigonal Planar",
      molecularGeo: "Bent",
      idealAngle: "120°",
      actualAngle: 119.0,
      hybridization: "sp^2",
      polarity: "Polar (Net Dipole μ = 1.63 D)",
      isPolar: true,
      dipoleVector: [0, -1.0, 0],
      centralAtom: { symbol: "S", color: "#eab308", radius: 28, name: "Sulfur" },
      ligands: [
        { symbol: "O", color: "#ef4444", radius: 23, name: "Oxygen", pos: [-0.98, -0.55, 0] },
        { symbol: "O", color: "#ef4444", radius: 23, name: "Oxygen", pos: [0.98, -0.55, 0] }
      ],
      lonePairPositions: [
        [0, 0.85, 0]
      ],
      description: "Trigonal planar electron domain geometry with one lone pair. The lone pair compresses the O-S-O bond angle slightly to 119°, producing a polar molecule."
    },
    {
      id: "pcl5",
      name: "Phosphorus Pentachloride (PCl₅)",
      formula: "PCl_5",
      stericNumber: 5,
      bondingPairs: 5,
      lonePairs: 0,
      axCode: "AX_5",
      electronGeo: "Trigonal Bipyramidal",
      molecularGeo: "Trigonal Bipyramidal",
      idealAngle: "90° & 120°",
      actualAngle: 120.0,
      hybridization: "sp^3d",
      polarity: "Nonpolar (Expanded octet symmetry, μ = 0 D)",
      isPolar: false,
      dipoleVector: [0, 0, 0],
      centralAtom: { symbol: "P", color: "#f97316", radius: 28, name: "Phosphorus" },
      ligands: [
        { symbol: "Cl", color: "#22c55e", radius: 24, name: "Chlorine", pos: [0, 1.25, 0] },   // Axial Top
        { symbol: "Cl", color: "#22c55e", radius: 24, name: "Chlorine", pos: [0, -1.25, 0] },  // Axial Bottom
        { symbol: "Cl", color: "#22c55e", radius: 24, name: "Chlorine", pos: [1.15, 0, 0] },   // Equatorial 1
        { symbol: "Cl", color: "#22c55e", radius: 24, name: "Chlorine", pos: [-0.58, 0, 1.0] }, // Equatorial 2
        { symbol: "Cl", color: "#22c55e", radius: 24, name: "Chlorine", pos: [-0.58, 0, -1.0] } // Equatorial 3
      ],
      lonePairPositions: [],
      description: "Expanded valence shell with 10 electrons. Three equatorial bonds at 120° and two axial bonds perpendicular at 90°. All dipoles cancel symmetrically."
    },
    {
      id: "sf4",
      name: "Sulfur Tetrafluoride (SF₄)",
      formula: "SF_4",
      stericNumber: 5,
      bondingPairs: 4,
      lonePairs: 1,
      axCode: "AX_4E",
      electronGeo: "Trigonal Bipyramidal",
      molecularGeo: "Seesaw",
      idealAngle: "90° & 120°",
      actualAngle: 101.6,
      hybridization: "sp^3d",
      polarity: "Polar (Net Dipole μ = 0.63 D)",
      isPolar: true,
      dipoleVector: [-0.8, 0, 0],
      centralAtom: { symbol: "S", color: "#eab308", radius: 28, name: "Sulfur" },
      ligands: [
        { symbol: "F", color: "#10b981", radius: 22, name: "Fluorine", pos: [0, 1.2, 0.1] },    // Axial Top
        { symbol: "F", color: "#10b981", radius: 22, name: "Fluorine", pos: [0, -1.2, 0.1] },   // Axial Bottom
        { symbol: "F", color: "#10b981", radius: 22, name: "Fluorine", pos: [-0.85, 0, 0.7] },  // Equatorial 1
        { symbol: "F", color: "#10b981", radius: 22, name: "Fluorine", pos: [-0.85, 0, -0.7] }  // Equatorial 2
      ],
      lonePairPositions: [
        [1.0, 0, 0] // Equatorial lone pair (less repulsion than axial)
      ],
      description: "The single lone pair occupies an equatorial position to minimize 90° lone-pair/bonding-pair repulsions, yielding a seesaw shape."
    },
    {
      id: "clf3",
      name: "Chlorine Trifluoride (ClF₃)",
      formula: "ClF_3",
      stericNumber: 5,
      bondingPairs: 3,
      lonePairs: 2,
      axCode: "AX_3E_2",
      electronGeo: "Trigonal Bipyramidal",
      molecularGeo: "T-Shaped",
      idealAngle: "90°",
      actualAngle: 87.5,
      hybridization: "sp^3d",
      polarity: "Polar (Net Dipole μ = 0.56 D)",
      isPolar: true,
      dipoleVector: [0.8, 0, 0],
      centralAtom: { symbol: "Cl", color: "#22c55e", radius: 27, name: "Chlorine" },
      ligands: [
        { symbol: "F", color: "#10b981", radius: 22, name: "Fluorine", pos: [0, 1.2, 0] },   // Axial Top
        { symbol: "F", color: "#10b981", radius: 22, name: "Fluorine", pos: [0, -1.2, 0] },  // Axial Bottom
        { symbol: "F", color: "#10b981", radius: 22, name: "Fluorine", pos: [1.1, 0, 0] }    // Equatorial
      ],
      lonePairPositions: [
        [-0.7, 0, 0.8],
        [-0.7, 0, -0.8]
      ],
      description: "Both lone pairs reside in equatorial positions, repelling the axial fluorine atoms toward the equatorial bond to create a bent T-shape."
    },
    {
      id: "sf6",
      name: "Sulfur Hexafluoride (SF₆)",
      formula: "SF_6",
      stericNumber: 6,
      bondingPairs: 6,
      lonePairs: 0,
      axCode: "AX_6",
      electronGeo: "Octahedral",
      molecularGeo: "Octahedral",
      idealAngle: "90°",
      actualAngle: 90.0,
      hybridization: "sp^3d^2",
      polarity: "Nonpolar (Perfect Octahedral Symmetry, μ = 0 D)",
      isPolar: false,
      dipoleVector: [0, 0, 0],
      centralAtom: { symbol: "S", color: "#eab308", radius: 28, name: "Sulfur" },
      ligands: [
        { symbol: "F", color: "#10b981", radius: 22, name: "Fluorine", pos: [0, 1.2, 0] },
        { symbol: "F", color: "#10b981", radius: 22, name: "Fluorine", pos: [0, -1.2, 0] },
        { symbol: "F", color: "#10b981", radius: 22, name: "Fluorine", pos: [1.2, 0, 0] },
        { symbol: "F", color: "#10b981", radius: 22, name: "Fluorine", pos: [-1.2, 0, 0] },
        { symbol: "F", color: "#10b981", radius: 22, name: "Fluorine", pos: [0, 0, 1.2] },
        { symbol: "F", color: "#10b981", radius: 22, name: "Fluorine", pos: [0, 0, -1.2] }
      ],
      lonePairPositions: [],
      description: "Six equivalent S-F bonds arranged at 90° angles at the vertices of a regular octahedron. Highly symmetric and inert nonpolar gas."
    },
    {
      id: "xef4",
      name: "Xenon Tetrafluoride (XeF₄)",
      formula: "XeF_4",
      stericNumber: 6,
      bondingPairs: 4,
      lonePairs: 2,
      axCode: "AX_4E_2",
      electronGeo: "Octahedral",
      molecularGeo: "Square Planar",
      idealAngle: "90°",
      actualAngle: 90.0,
      hybridization: "sp^3d^2",
      polarity: "Nonpolar (Opposite lone pairs & bonds cancel, μ = 0 D)",
      isPolar: false,
      dipoleVector: [0, 0, 0],
      centralAtom: { symbol: "Xe", color: "#a855f7", radius: 30, name: "Xenon" },
      ligands: [
        { symbol: "F", color: "#10b981", radius: 22, name: "Fluorine", pos: [1.15, 0, 0] },
        { symbol: "F", color: "#10b981", radius: 22, name: "Fluorine", pos: [-1.15, 0, 0] },
        { symbol: "F", color: "#10b981", radius: 22, name: "Fluorine", pos: [0, 0, 1.15] },
        { symbol: "F", color: "#10b981", radius: 22, name: "Fluorine", pos: [0, 0, -1.15] }
      ],
      lonePairPositions: [
        [0, 1.1, 0],
        [0, -1.1, 0]
      ],
      description: "Two lone pairs locate directly opposite each other (180°) in axial sites to minimize electron repulsion, leaving four coplanar F atoms in a square plane."
    }
  ];

  let currentMolecule = MOLECULES[0];
  let showLonePairs = true;
  let showBondAngles = true;
  let showDipoles = true;
  let autoRotate = true;
  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let rotX = 0.35; // Pitch
  let rotY = 0.55; // Yaw
  let rotZ = 0;
  let zoom = 1.0;
  let animId = null;

  container.innerHTML = `
    <div class="lab-container">
      <!-- Header Bar -->
      <div class="lab-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: rgba(15, 23, 42, 0.92); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 18px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #06b6d4; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #06b6d4; box-shadow: 0 0 10px #06b6d4;"></span>
            VSEPR Theory &amp; 3D Molecular Geometry
          </span>
          <span class="badge" style="background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.3); color: #38bdf8; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px;">
            Steric Number &amp; Hybridization Modeler
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="lab-view-switcher" style="display: flex; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 3px;">
            <button id="view-mode-vsepr-sim" class="btn btn-secondary active" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 700; border-radius: 6px; border: none;">
              🌐 3D Modeler
            </button>
            <button id="view-mode-vsepr-photo" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 6px; background: transparent; border: none;">
              📸 4K Real Lab Bench
            </button>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-vsepr-reset-view" style="padding: 5px 12px; font-size: 0.78rem;">
            ⟲ Center View
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-vsepr-autorotate" style="padding: 5px 12px; font-size: 0.78rem;">
            ${autoRotate ? "⏸ Pause Rotation" : "▶ Auto-Rotate"}
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-vsepr-export" style="padding: 5px 12px; font-size: 0.78rem; border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
            📥 Export Telemetry
          </button>
        </div>
      </div>

      <!-- Main Layout: 3D Canvas on Left, Telemetry & Selector on Right -->
      <div style="display: grid; grid-template-columns: 1.25fr 1fr; gap: 20px;" class="vsepr-layout">
        <!-- 3D Canvas Viewport -->
        <div class="lab-canvas-area" style="position: relative; border: 1.5px solid rgba(6, 182, 212, 0.35); box-shadow: 0 20px 45px -15px rgba(0,0,0,0.85); background: radial-gradient(circle at center, #0f172a 0%, #030712 100%); border-radius: 12px; overflow: hidden; height: 530px;">
          <canvas id="vsepr-canvas" width="580" height="530" style="height: 530px; width: 100%; display: block; cursor: grab;"></canvas>

          <!-- 4K Authentic Laboratory Photograph Overlay Viewport -->
          <div id="vsepr-photo-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 4;">
            <img src="assets/labs/vsepr_bench.jpg" alt="4K Molecular Modeling & VSEPR Laboratory Bench" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
            
            <!-- Live Analytical Telemetry Callout on Photo -->
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); border: 1px solid rgba(6, 182, 212, 0.4); border-radius: 12px; padding: 12px 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Physical Ball &amp; Stick Bench</div>
                <div style="color: #38bdf8; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">Prentice Hall Molymod Set</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Orbital Hybridization Clouds</div>
                <div style="color: #34d399; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">sp, sp², sp³, sp³d Acrylic Models</div>
              </div>
              <div>
                <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase;">Goniometric Protractor</div>
                <div style="color: #f59e0b; font-weight: 700; font-family: var(--font-mono); font-size: 0.92rem;">0.5° Angular Precision Calibrated</div>
              </div>
            </div>
          </div>

          <!-- Top HUD Overlay: Active Geometry & Formula -->
          <div style="position: absolute; top: 14px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 5;">
            <div style="background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 10px; padding: 8px 14px; pointer-events: auto;">
              <div style="font-size: 0.7rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">MOLECULE</div>
              <div style="font-weight: 800; font-size: 1.15rem; color: #ffffff;" id="hud-molecule-name">${currentMolecule.name}</div>
              <div style="font-size: 0.78rem; color: #38bdf8; font-family: var(--font-mono);" id="hud-vsepr-code">VSEPR: ${currentMolecule.axCode} • Steric No. ${currentMolecule.stericNumber}</div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 10px; padding: 8px 14px; text-align: right; pointer-events: auto;">
              <div style="font-size: 0.7rem; color: #94a3b8; font-family: var(--font-mono); text-transform: uppercase;">GEOMETRY</div>
              <div style="font-weight: 800; font-size: 1rem; color: #10b981;" id="hud-molecular-geo">${currentMolecule.molecularGeo}</div>
              <div style="font-size: 0.76rem; color: #cbd5e1; font-family: var(--font-mono);" id="hud-hybridization">${currentMolecule.hybridization} Hybridization</div>
            </div>
          </div>

          <!-- Bottom Canvas Instructions Callout -->
          <div style="position: absolute; bottom: 12px; left: 16px; font-family: var(--font-mono); font-size: 0.74rem; color: #94a3b8; background: rgba(0,0,0,0.5); padding: 4px 10px; border-radius: 6px; pointer-events: none;">
            🖱 Drag to Rotate 3D • ⚙ Scroll to Zoom
          </div>
        </div>

        <!-- Right Controls & Analytical Metrology Panel -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <!-- Molecule Selection Cards -->
          <div class="lab-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px;">
            <label style="font-size: 0.8rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">
              Select Benchmark Molecule
            </label>
            <select id="vsepr-mol-select" class="select-input" style="width: 100%; font-size: 0.95rem; font-weight: 600; padding: 8px 12px; margin-bottom: 12px;">
              ${MOLECULES.map(m => `
                <option value="${m.id}" ${m.id === currentMolecule.id ? "selected" : ""}>
                  ${m.name} [${m.axCode} — ${m.molecularGeo}]
                </option>
              `).join("")}
            </select>

            <!-- Toggles Bar -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 6px;">
              <button class="btn btn-secondary btn-sm ${showLonePairs ? 'active' : ''}" id="toggle-lone-pairs" style="font-size: 0.76rem; justify-content: flex-start; padding: 6px 10px;">
                <span>${showLonePairs ? "✓" : "○"}</span>
                <span>Lone Pair Clouds</span>
              </button>
              <button class="btn btn-secondary btn-sm ${showBondAngles ? 'active' : ''}" id="toggle-bond-angles" style="font-size: 0.76rem; justify-content: flex-start; padding: 6px 10px;">
                <span>${showBondAngles ? "✓" : "○"}</span>
                <span>Bond Angle Arcs</span>
              </button>
              <button class="btn btn-secondary btn-sm ${showDipoles ? 'active' : ''}" id="toggle-dipoles" style="font-size: 0.76rem; justify-content: flex-start; padding: 6px 10px;">
                <span>${showDipoles ? "✓" : "○"}</span>
                <span>Net Dipole Vector</span>
              </button>
              <button class="btn btn-secondary btn-sm" id="btn-vsepr-invert-spin" style="font-size: 0.76rem; justify-content: flex-start; padding: 6px 10px;">
                <span>⇄</span>
                <span>Reverse Spin</span>
              </button>
            </div>
          </div>

          <!-- Quantitative VSEPR Telemetry Table -->
          <div class="lab-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; flex: 1;">
            <div style="font-size: 0.8rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
              <span>VSEPR Quantum Telemetry</span>
              <span id="telemetry-polarity-tag" style="font-size: 0.72rem; padding: 2px 8px; border-radius: 4px; font-weight: 800; background: ${currentMolecule.isPolar ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}; color: ${currentMolecule.isPolar ? '#f87171' : '#34d399'};">
                ${currentMolecule.isPolar ? "POLAR" : "NONPOLAR"}
              </span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-family: var(--font-mono); font-size: 0.82rem;">
              <div style="background: var(--bg-surface-elevated); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color);">
                <div style="font-size: 0.68rem; color: #94a3b8;">ELECTRON DOMAIN GEO</div>
                <div style="font-weight: 700; color: var(--text-main); margin-top: 2px;" id="val-electron-geo">${currentMolecule.electronGeo}</div>
              </div>
              <div style="background: var(--bg-surface-elevated); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color);">
                <div style="font-size: 0.68rem; color: #94a3b8;">MOLECULAR SHAPE</div>
                <div style="font-weight: 700; color: #38bdf8; margin-top: 2px;" id="val-molecular-geo">${currentMolecule.molecularGeo}</div>
              </div>
              <div style="background: var(--bg-surface-elevated); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color);">
                <div style="font-size: 0.68rem; color: #94a3b8;">BONDING / LONE PAIRS</div>
                <div style="font-weight: 700; color: var(--text-main); margin-top: 2px;" id="val-pairs">${currentMolecule.bondingPairs} BP • ${currentMolecule.lonePairs} LP</div>
              </div>
              <div style="background: var(--bg-surface-elevated); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color);">
                <div style="font-size: 0.68rem; color: #94a3b8;">EXPERIMENTAL ANGLE</div>
                <div style="font-weight: 700; color: #f59e0b; margin-top: 2px;" id="val-angle">${currentMolecule.actualAngle}° (Ideal ${currentMolecule.idealAngle})</div>
              </div>
            </div>

            <!-- Pedagogical Repulsion Rationale -->
            <div style="margin-top: 12px; background: rgba(6, 182, 212, 0.08); border-left: 3px solid #06b6d4; padding: 10px 14px; border-radius: 6px; font-size: 0.82rem; line-height: 1.5; color: var(--text-main);" id="vsepr-rationale">
              ${currentMolecule.description}
            </div>
          </div>
        </div>
      </div>

      <!-- CER Inquiry Checkpoint Section -->
      <div id="vsepr-checkpoint-mount" style="margin-top: 20px;"></div>
    </div>
  `;

  // --- 3D CANVAS RENDERING ENGINE (60 FPS) ---
  const canvas = document.getElementById("vsepr-canvas");
  const ctx = canvas.getContext("2d");

  function project3D(x, y, z, cx, cy, scale) {
    // 3D rotation matrix (Yaw Y, Pitch X)
    // 1. Rotate around Y
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const x1 = x * cosY + z * sinY;
    const y1 = y;
    const z1 = -x * sinY + z * cosY;

    // 2. Rotate around X
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const x2 = x1;
    const y2 = y1 * cosX - z1 * sinX;
    const z2 = y1 * sinX + z1 * cosX;

    // Perspective projection
    const fov = 400;
    const depth = fov / (fov + z2 * 100);
    const projX = cx + x2 * 130 * scale * depth;
    const projY = cy - y2 * 130 * scale * depth;

    return { x: projX, y: projY, z: z2, depth };
  }

  function render3D() {
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;

    // Background coordinate grid circles
    ctx.save();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.06)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 180 * zoom, 60 * zoom, rotX, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Prepare list of all renderable 3D elements for Z-sorting (Painter's Algorithm)
    const renderQueue = [];

    // Central Atom
    const centerProj = project3D(0, 0, 0, cx, cy, zoom);
    renderQueue.push({
      type: "atom",
      symbol: currentMolecule.centralAtom.symbol,
      color: currentMolecule.centralAtom.color,
      radius: currentMolecule.centralAtom.radius * zoom * centerProj.depth,
      proj: centerProj,
      z: centerProj.z
    });

    // Ligand Atoms and Bonds
    currentMolecule.ligands.forEach((ligand, idx) => {
      const ligProj = project3D(ligand.pos[0], ligand.pos[1], ligand.pos[2], cx, cy, zoom);

      // Bond cylinder
      renderQueue.push({
        type: "bond",
        start: centerProj,
        end: ligProj,
        z: (centerProj.z + ligProj.z) / 2
      });

      // Ligand atom sphere
      renderQueue.push({
        type: "atom",
        symbol: ligand.symbol,
        color: ligand.color,
        radius: ligand.radius * zoom * ligProj.depth,
        proj: ligProj,
        z: ligProj.z
      });
    });

    // Lone Pair Lobes
    if (showLonePairs && currentMolecule.lonePairPositions) {
      currentMolecule.lonePairPositions.forEach((lp, idx) => {
        const lpProj = project3D(lp[0], lp[1], lp[2], cx, cy, zoom);
        renderQueue.push({
          type: "lonePair",
          start: centerProj,
          end: lpProj,
          z: (centerProj.z + lpProj.z) / 2
        });
      });
    }

    // Dipole Vector Arrow
    if (showDipoles && currentMolecule.isPolar && currentMolecule.dipoleVector) {
      const dv = currentMolecule.dipoleVector;
      const dipoleProj = project3D(dv[0], dv[1], dv[2], cx, cy, zoom);
      renderQueue.push({
        type: "dipole",
        start: centerProj,
        end: dipoleProj,
        z: dipoleProj.z + 1 // Draw on top
      });
    }

    // Sort by depth (farthest Z first)
    renderQueue.sort((a, b) => a.z - b.z);

    // Draw elements
    renderQueue.forEach(item => {
      if (item.type === "bond") {
        // Bond cylindrical rod
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(item.start.x, item.start.y);
        ctx.lineTo(item.end.x, item.end.y);
        ctx.strokeStyle = "#64748b";
        ctx.lineWidth = 9 * zoom;
        ctx.lineCap = "round";
        ctx.stroke();

        // Shading highlight
        ctx.beginPath();
        ctx.moveTo(item.start.x - 1, item.start.y - 1);
        ctx.lineTo(item.end.x - 1, item.end.y - 1);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 3 * zoom;
        ctx.stroke();
        ctx.restore();
      } else if (item.type === "lonePair") {
        // Translucent electron lobe
        ctx.save();
        const grad = ctx.createRadialGradient(item.end.x, item.end.y, 2, item.end.x, item.end.y, 26 * zoom);
        grad.addColorStop(0, "rgba(56, 189, 248, 0.85)");
        grad.addColorStop(0.5, "rgba(56, 189, 248, 0.35)");
        grad.addColorStop(1, "rgba(56, 189, 248, 0.0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(item.end.x, item.end.y, 26 * zoom, 0, Math.PI * 2);
        ctx.fill();

        // Connecting lobe cone
        ctx.beginPath();
        ctx.moveTo(item.start.x, item.start.y);
        ctx.lineTo(item.end.x - 10 * zoom, item.end.y);
        ctx.lineTo(item.end.x + 10 * zoom, item.end.y);
        ctx.closePath();
        ctx.fillStyle = "rgba(56, 189, 248, 0.2)";
        ctx.fill();

        // Two dots for the paired electrons
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(item.end.x - 4, item.end.y - 3, 2, 0, Math.PI * 2);
        ctx.arc(item.end.x + 4, item.end.y + 3, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (item.type === "atom") {
        // 3D Spherical Atom with specular highlight
        ctx.save();
        const r = Math.max(8, item.radius);
        const grad = ctx.createRadialGradient(
          item.proj.x - r * 0.35, item.proj.y - r * 0.35, r * 0.1,
          item.proj.x, item.proj.y, r
        );
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.25, item.color);
        grad.addColorStop(1, "#090d16");

        ctx.beginPath();
        ctx.arc(item.proj.x, item.proj.y, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.shadowColor = item.color;
        ctx.shadowBlur = 12 * zoom;
        ctx.fill();

        // Element Symbol text
        ctx.fillStyle = item.color === "#f8fafc" ? "#0f172a" : "#ffffff";
        ctx.font = `bold ${Math.round(r * 0.95)}px var(--font-mono, monospace)`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowBlur = 0;
        ctx.fillText(item.symbol, item.proj.x, item.proj.y);
        ctx.restore();
      } else if (item.type === "dipole") {
        // Golden dipole arrow with cross-tail (+ -> -)
        ctx.save();
        ctx.strokeStyle = "#fbbf24";
        ctx.fillStyle = "#fbbf24";
        ctx.lineWidth = 3.5;

        // Tail cross (+)
        const dx = item.end.x - item.start.x;
        const dy = item.end.y - item.start.y;
        const angle = Math.atan2(dy, dx);
        const perpX = -Math.sin(angle) * 8;
        const perpY = Math.cos(angle) * 8;

        ctx.beginPath();
        ctx.moveTo(item.start.x + perpX, item.start.y + perpY);
        ctx.lineTo(item.start.x - perpX, item.start.y - perpY);
        ctx.stroke();

        // Main arrow body
        ctx.beginPath();
        ctx.moveTo(item.start.x, item.start.y);
        ctx.lineTo(item.end.x, item.end.y);
        ctx.stroke();

        // Arrow head
        ctx.beginPath();
        ctx.moveTo(item.end.x, item.end.y);
        ctx.lineTo(item.end.x - 12 * Math.cos(angle - 0.4), item.end.y - 12 * Math.sin(angle - 0.4));
        ctx.lineTo(item.end.x - 12 * Math.cos(angle + 0.4), item.end.y - 12 * Math.sin(angle + 0.4));
        ctx.closePath();
        ctx.fill();

        // Label
        ctx.font = "bold 11px var(--font-mono, monospace)";
        ctx.fillText("Net Dipole μ", item.end.x + 8, item.end.y);
        ctx.restore();
      }
    });

    // Draw Bond Angle Arc Annotation between first two ligands if requested
    if (showBondAngles && currentMolecule.ligands.length >= 2) {
      const lig1 = project3D(currentMolecule.ligands[0].pos[0], currentMolecule.ligands[0].pos[1], currentMolecule.ligands[0].pos[2], cx, cy, zoom);
      const lig2 = project3D(currentMolecule.ligands[1].pos[0], currentMolecule.ligands[1].pos[1], currentMolecule.ligands[1].pos[2], cx, cy, zoom);

      ctx.save();
      ctx.strokeStyle = "rgba(245, 158, 11, 0.75)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);

      ctx.beginPath();
      ctx.arc(cx, cy, 45 * zoom, Math.atan2(lig1.y - cy, lig1.x - cx), Math.atan2(lig2.y - cy, lig2.x - cx), false);
      ctx.stroke();

      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 12px var(--font-mono, monospace)";
      ctx.textAlign = "center";
      ctx.fillText(`${currentMolecule.actualAngle}°`, cx, cy - 50 * zoom);
      ctx.restore();
    }
  }

  // Animation Loop (60 FPS with Smartboard Pacing & Overdraw Protection)
  let lastVseprTime = 0;
  function animate(now) {
    if (!container.isConnected) {
      if (animId) cancelAnimationFrame(animId);
      return;
    }
    const isSmart = (document.documentElement.getAttribute("data-mode") === "smartboard") ||
                    document.documentElement.classList.contains("fast-smartboard-mode") ||
                    /Android|MAXHUB/i.test(navigator.userAgent);
    const interval = isSmart ? 33 : 16;
    if (!now || now - lastVseprTime >= interval) {
      lastVseprTime = now || performance.now();
      const photoEl = container.querySelector("#vsepr-photo-overlay");
      if (!photoEl || photoEl.style.display !== "block") {
        if (autoRotate && !isDragging) {
          rotY += 0.008;
          render3D();
        } else if (isDragging) {
          render3D();
        }
      }
    }
    animId = requestAnimationFrame(animate);
  }
  animId = requestAnimationFrame(animate);

  // --- INTERACTION EVENT LISTENERS ---
  canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    canvas.style.cursor = "grabbing";
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMouseX;
    const dy = e.clientY - lastMouseY;
    rotY += dx * 0.01;
    rotX += dy * 0.01;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  });

  window.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      canvas.style.cursor = "grab";
    }
  });

  // Touch Support for Interactive Smartboards & Tablets
  canvas.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      lastMouseX = e.touches[0].clientX;
      lastMouseY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener("touchmove", (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - lastMouseX;
    const dy = e.touches[0].clientY - lastMouseY;
    rotY += dx * 0.01;
    rotX += dy * 0.01;
    lastMouseX = e.touches[0].clientX;
    lastMouseY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener("touchend", () => {
    isDragging = false;
  });

  // Zoom via wheel
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    zoom += e.deltaY * -0.0015;
    zoom = Math.min(Math.max(0.65, zoom), 1.8);
  }, { passive: false });

  // Update molecule selection
  const molSelect = document.getElementById("vsepr-mol-select");
  molSelect.addEventListener("change", (e) => {
    const selected = MOLECULES.find(m => m.id === e.target.value);
    if (selected) {
      currentMolecule = selected;
      SoundFX.playClick();
      updateUI();
    }
  });

  function updateUI() {
    document.getElementById("hud-molecule-name").innerText = currentMolecule.name;
    document.getElementById("hud-vsepr-code").innerText = `VSEPR: ${currentMolecule.axCode} • Steric No. ${currentMolecule.stericNumber}`;
    document.getElementById("hud-molecular-geo").innerText = currentMolecule.molecularGeo;
    document.getElementById("hud-hybridization").innerText = `${currentMolecule.hybridization} Hybridization`;

    document.getElementById("val-electron-geo").innerText = currentMolecule.electronGeo;
    document.getElementById("val-molecular-geo").innerText = currentMolecule.molecularGeo;
    document.getElementById("val-pairs").innerText = `${currentMolecule.bondingPairs} BP • ${currentMolecule.lonePairs} LP`;
    document.getElementById("val-angle").innerText = `${currentMolecule.actualAngle}° (Ideal ${currentMolecule.idealAngle})`;
    document.getElementById("vsepr-rationale").innerText = currentMolecule.description;

    const polTag = document.getElementById("telemetry-polarity-tag");
    polTag.innerText = currentMolecule.isPolar ? "POLAR" : "NONPOLAR";
    polTag.style.background = currentMolecule.isPolar ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)";
    polTag.style.color = currentMolecule.isPolar ? "#f87171" : "#34d399";
  }

  // Toggles
  document.getElementById("toggle-lone-pairs").addEventListener("click", (e) => {
    showLonePairs = !showLonePairs;
    e.currentTarget.classList.toggle("active", showLonePairs);
    e.currentTarget.querySelector("span:first-child").innerText = showLonePairs ? "✓" : "○";
    SoundFX.playSwitchSnap();
  });

  document.getElementById("toggle-bond-angles").addEventListener("click", (e) => {
    showBondAngles = !showBondAngles;
    e.currentTarget.classList.toggle("active", showBondAngles);
    e.currentTarget.querySelector("span:first-child").innerText = showBondAngles ? "✓" : "○";
    SoundFX.playSwitchSnap();
  });

  document.getElementById("toggle-dipoles").addEventListener("click", (e) => {
    showDipoles = !showDipoles;
    e.currentTarget.classList.toggle("active", showDipoles);
    e.currentTarget.querySelector("span:first-child").innerText = showDipoles ? "✓" : "○";
    SoundFX.playSwitchSnap();
  });

  document.getElementById("btn-vsepr-autorotate").addEventListener("click", (e) => {
    autoRotate = !autoRotate;
    e.currentTarget.innerText = autoRotate ? "⏸ Pause Rotation" : "▶ Auto-Rotate";
    SoundFX.playClick();
  });

  document.getElementById("btn-vsepr-reset-view").addEventListener("click", () => {
    rotX = 0.35;
    rotY = 0.55;
    zoom = 1.0;
    SoundFX.playClick();
  });

  document.getElementById("btn-vsepr-invert-spin").addEventListener("click", () => {
    rotY = -rotY;
    SoundFX.playClick();
  });

  // 4K Photo Bench Switcher
  const btnModeSim = container.querySelector("#view-mode-vsepr-sim");
  const btnModePhoto = container.querySelector("#view-mode-vsepr-photo");
  const photoOverlay = container.querySelector("#vsepr-photo-overlay");

  btnModeSim?.addEventListener("click", () => {
    btnModeSim.classList.add("active");
    btnModeSim.style.background = "";
    btnModePhoto.classList.remove("active");
    btnModePhoto.style.background = "transparent";
    if (photoOverlay) photoOverlay.style.display = "none";
    SoundFX.playClick();
  });

  btnModePhoto?.addEventListener("click", () => {
    btnModePhoto.classList.add("active");
    btnModePhoto.style.background = "";
    btnModeSim.classList.remove("active");
    btnModeSim.style.background = "transparent";
    if (photoOverlay) photoOverlay.style.display = "block";
    SoundFX.playClick();
  });

  // Export Telemetry CSV
  document.getElementById("btn-vsepr-export").addEventListener("click", () => {
    const data = MOLECULES.map(m => ({
      Molecule: m.name,
      Formula: m.formula,
      StericNumber: m.stericNumber,
      BondingPairs: m.bondingPairs,
      LonePairs: m.lonePairs,
      AX_Code: m.axCode,
      ElectronGeometry: m.electronGeo,
      MolecularGeometry: m.molecularGeo,
      BondAngle_Deg: m.actualAngle,
      Hybridization: m.hybridization,
      Polarity: m.isPolar ? "Polar" : "Nonpolar"
    }));
    exportLabDataCsv("chem_vsepr_geometry_telemetry.csv", data);
  });

  // Mount CER Checkpoint
  mountLabCheckpoint("vsepr-checkpoint-mount", {
    id: "vsepr-checkpoint",
    labTitle: "Chemistry: VSEPR Molecular Geometry & Polarity Analysis",
    prompt: "Compare the molecular geometries and polarities of H₂O (AX₂E₂) and CO₂ (AX₂). Both molecules possess two bonding pairs attached to central atoms, yet H₂O is strongly polar (μ = 1.85 D) while CO₂ is completely nonpolar (μ = 0 D). Formulate your scientific Claim, ground it in Evidence from electron domain repulsion, and provide your thermodynamic Reasoning.",
    claimStarter: "Although both molecules have two terminal atoms, H₂O has a bent shape while CO₂ is linear because...",
    sampleClaim: "Water is polar and bent due to two lone pairs on oxygen, whereas CO₂ has no lone pairs on carbon and has a linear shape with canceling bond dipoles.",
    evidenceStarters: [
      "Oxygen in H₂O has steric number 4 (2 bonding pairs + 2 lone pairs), compressing the bond angle to 104.5°.",
      "Carbon in CO₂ has steric number 2 (2 double bonds, 0 lone pairs), yielding a bond angle of 180°.",
      "The bond dipole vectors in linear CO₂ point in exactly opposite directions and cancel out symmetrically."
    ],
    reasoningKey: "VSEPR theory dictates that electron pairs maximize separation to minimize Coulombic repulsion. Lone pairs exert greater repulsion than bonding pairs. In CO₂, the linear geometry allows the opposite C=O dipoles to vectorially cancel. In H₂O, the tetrahedral electron geometry results in an asymmetrical bent molecular geometry where the two O-H bond dipole components add constructively along the molecular axis."
  });

  // Cleanup on unmount
  return () => {
    if (animId) cancelAnimationFrame(animId);
  };
}
