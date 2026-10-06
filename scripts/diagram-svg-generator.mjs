// Edugates-ClipSAT Science Labs - Master Diagram SVG Generator
// Provides calibrated, domain-authentic vector SVGs for every science lesson.
// Supports 4 distinct pedagogical visual modes:
// 1. "graph": Precision coordinate curves, rate dynamics, and equilibrium data
// 2. "structural": Particulate lattices, molecular bonding, and cellular ultrastructures
// 3. "apparatus": Laboratory experimental setups, instruments, sensors, and meters
// 4. "vector": Force vectors, field lines, ray optics, and energy coordinates

import { SCIENTIFIC_DIAGRAMS } from "../data/scientific-diagrams.js";

/**
 * Returns a flagship diagram if defined for this module/lesson,
 * or generates a domain-calibrated scientific diagram specific to the lesson and mode.
 */
export function getOrGenerateDiagram(subKey, module, lesson, profile, diagramType = "graph") {
  const m = module;
  const l = lesson || { id: 1, title: "" };

  // 1. Check for flagship pre-crafted diagrams when in graph or flagship mode
  if (diagramType === "graph") {
    if (subKey === "CHEM") {
      if (m.id === 2 && l.id === 2) return SCIENTIFIC_DIAGRAMS.chem_heating_curve;
      if (m.id === 3 && l.id === 2) return SCIENTIFIC_DIAGRAMS.chem_rutherford_gold_foil;
      if (m.id === 3 && l.id === 3) return SCIENTIFIC_DIAGRAMS.chem_mass_spectrometry;
      if (m.id === 15) return SCIENTIFIC_DIAGRAMS.chem_energy_diagram;
      if (m.id === 16 && l.id === 2) return SCIENTIFIC_DIAGRAMS.chem_le_chatelier_shifts;
      if (m.id === 17 && l.id === 2) return SCIENTIFIC_DIAGRAMS.chem_le_chatelier_shifts;
      if (m.id === 17) return SCIENTIFIC_DIAGRAMS.chem_titration_curve;
      if (m.id === 19) return SCIENTIFIC_DIAGRAMS.chem_galvanic_cell;
    } else if (subKey === "BIO") {
      if (m.id === 7 && l.id === 4) return SCIENTIFIC_DIAGRAMS.bio_membrane_fluid_mosaic;
      if (m.id === 8 && l.id === 2) return SCIENTIFIC_DIAGRAMS.bio_photosynthesis_z_scheme;
      if (m.id === 10) return SCIENTIFIC_DIAGRAMS.bio_pedigree_chart;
      if (m.id === 11 && l.id === 2) return SCIENTIFIC_DIAGRAMS.bio_dna_replication_fork;
      if (m.id === 12 && l.id === 1) return SCIENTIFIC_DIAGRAMS.bio_pcr_thermocycling;
      if (m.id === 23) return SCIENTIFIC_DIAGRAMS.bio_action_potential;
    } else if (subKey === "PHYS") {
      if (m.id === 3) return SCIENTIFIC_DIAGRAMS.phys_velocity_time_graph;
      if (m.id === 5) return SCIENTIFIC_DIAGRAMS.phys_free_body_incline;
      if (m.id === 11 && l.id === 2) return SCIENTIFIC_DIAGRAMS.phys_carnot_cycle;
      if (m.id === 16) return SCIENTIFIC_DIAGRAMS.phys_ray_refraction;
      if (m.id === 17 && l.id === 1) return SCIENTIFIC_DIAGRAMS.phys_double_slit_interference;
      if (m.id === 20) return SCIENTIFIC_DIAGRAMS.phys_circuit_resistors;
      if (m.id === 22 && l.id === 1) return SCIENTIFIC_DIAGRAMS.phys_photoelectric_effect;
    }
  }

  // 2. Discipline-specific generative diagrams
  if (subKey === "CHEM") {
    return generateChemistryDiagram(m, l, profile, diagramType);
  } else if (subKey === "BIO") {
    return generateBiologyDiagram(m, l, profile, diagramType);
  } else {
    return generatePhysicsDiagram(m, l, profile, diagramType);
  }
}

// =========================================================================
// CHEMISTRY DIAGRAM GENERATOR
// =========================================================================
function generateChemistryDiagram(m, l, p, type) {
  if (type === "structural") {
    return {
      id: `chem_diag_struct_m${m.id}_l${l.id}`,
      subject: "CHEM",
      moduleId: m.id,
      title: `${m.title} - ${l.title} Sub-Microscopic Structure`,
      caption: `Figure ${m.id}.${l.id}S: Particulate Lattice & Molecular Geometry for ${l.title}`,
      svg: `<svg viewBox="0 0 540 280" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <rect width="540" height="280" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
        <text x="270" y="28" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Particulate &amp; Molecular Model: ${l.title}</text>
        
        <!-- Unit Cell / Molecular Grid Frame -->
        <rect x="90" y="50" width="360" height="190" fill="#1e293b" fill-opacity="0.4" rx="8" stroke="#475569" stroke-width="1.5" stroke-dasharray="4"/>
        
        <!-- Intramolecular Bond Rods -->
        <line x1="160" y1="145" x2="270" y2="105" stroke="#38bdf8" stroke-width="5" stroke-linecap="round"/>
        <line x1="270" y1="105" x2="380" y2="145" stroke="#38bdf8" stroke-width="5" stroke-linecap="round"/>
        <line x1="270" y1="105" x2="270" y2="210" stroke="#06b6d4" stroke-width="4" stroke-dasharray="4" stroke-linecap="round"/>
        
        <!-- Intermolecular Dispersion / Hydrogen Bonds -->
        <line x1="160" y1="145" x2="160" y2="210" stroke="#10b981" stroke-width="2.5" stroke-dasharray="3"/>
        <line x1="380" y1="145" x2="380" y2="210" stroke="#10b981" stroke-width="2.5" stroke-dasharray="3"/>
        
        <!-- Central Atom Sphere with 3D Radial Gradient -->
        <circle cx="270" cy="105" r="28" fill="#0284c7" stroke="#38bdf8" stroke-width="2.5"/>
        <circle cx="262" cy="97" r="8" fill="#bae6fd" opacity="0.6"/>
        <text x="270" y="110" fill="#ffffff" font-size="13" font-weight="800" text-anchor="middle">A (δ+)</text>
        
        <!-- Peripheral Ligand Atom 1 -->
        <circle cx="160" cy="145" r="22" fill="#0d9488" stroke="#2dd4bf" stroke-width="2"/>
        <circle cx="153" cy="138" r="6" fill="#ccfbf1" opacity="0.6"/>
        <text x="160" y="150" fill="#ffffff" font-size="11" font-weight="800" text-anchor="middle">X₁ (δ-)</text>
        
        <!-- Peripheral Ligand Atom 2 -->
        <circle cx="380" cy="145" r="22" fill="#0d9488" stroke="#2dd4bf" stroke-width="2"/>
        <circle cx="373" cy="138" r="6" fill="#ccfbf1" opacity="0.6"/>
        <text x="380" y="150" fill="#ffffff" font-size="11" font-weight="800" text-anchor="middle">X₂ (δ-)</text>
        
        <!-- Counterion in Lattice Site -->
        <circle cx="270" cy="210" r="18" fill="#f59e0b" stroke="#fbbf24" stroke-width="2"/>
        <text x="270" y="214" fill="#0f172a" font-size="10" font-weight="800" text-anchor="middle">Z⁺</text>
        
        <!-- Bond Angle Arc & Label -->
        <path d="M 235 120 A 40 40 0 0 1 305 120" fill="none" stroke="#f59e0b" stroke-width="2"/>
        <text x="270" y="75" fill="#f59e0b" font-size="11" font-weight="800" text-anchor="middle">θ = 107.5°</text>
        
        <!-- Annotation Callouts -->
        <text x="110" y="258" fill="#94a3b8" font-size="10">Bond Length: 142 pm</text>
        <text x="430" y="258" fill="#10b981" font-size="10" text-anchor="end">Coulombic Potential Well</text>
      </svg>`
    };
  }

  if (type === "apparatus") {
    return {
      id: `chem_diag_app_m${m.id}_l${l.id}`,
      subject: "CHEM",
      moduleId: m.id,
      title: `${m.title} - ${l.title} Laboratory Bench Setup`,
      caption: `Figure ${m.id}.${l.id}A: Quantitative Analytical Apparatus for ${l.title}`,
      svg: `<svg viewBox="0 0 540 280" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <rect width="540" height="280" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
        <text x="270" y="28" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Analytical Instrument Setup: ${l.title}</text>
        
        <!-- Insulated Outer Vessel / Calorimeter -->
        <rect x="180" y="70" width="180" height="170" rx="12" fill="#1e293b" stroke="#64748b" stroke-width="2"/>
        <rect x="195" y="85" width="150" height="145" rx="8" fill="#0f172a" stroke="#475569" stroke-width="1.5"/>
        
        <!-- Liquid Analyte Volume -->
        <path d="M 195 140 Q 270 145 345 140 L 345 222 Q 270 230 195 222 Z" fill="#0284c7" fill-opacity="0.35"/>
        
        <!-- Precision Thermocouple / Digital Probe -->
        <rect x="235" y="45" width="8" height="150" fill="#cbd5e1" rx="2"/>
        <circle cx="239" cy="195" r="5" fill="#ef4444"/>
        <line x1="239" y1="45" x2="239" y2="35" stroke="#ef4444" stroke-width="2"/>
        <line x1="239" y1="35" x2="390" y2="35" stroke="#ef4444" stroke-width="2"/>
        <line x1="390" y1="35" x2="390" y2="70" stroke="#ef4444" stroke-width="2"/>
        
        <!-- Digital Display Controller -->
        <rect x="370" y="70" width="130" height="75" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="435" y="92" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">DIGITAL MONITOR</text>
        <rect x="385" y="100" width="100" height="30" fill="#090d16" rx="4"/>
        <text x="435" y="121" fill="#10b981" font-size="14" font-family="monospace" font-weight="800" text-anchor="middle">24.85 °C</text>
        
        <!-- Magnetic Stirrer -->
        <rect x="250" y="210" width="35" height="10" rx="3" fill="#f59e0b"/>
        <path d="M 245 200 Q 268 190 290 200" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="2"/>
        
        <!-- Reagent Delivery Pipette / Burette Tip -->
        <polygon points="295,45 305,45 301,120 299,120" fill="#94a3b8"/>
        <circle cx="300" cy="130" r="2.5" fill="#38bdf8"/>
        
        <!-- Annotations -->
        <text x="130" y="120" fill="#94a3b8" font-size="10" text-anchor="middle">Thermal Insulation</text>
        <line x1="130" y1="125" x2="185" y2="140" stroke="#94a3b8" stroke-width="1"/>
        
        <text x="435" y="170" fill="#f59e0b" font-size="10" text-anchor="middle">Magnetic Induction Stirrer</text>
        <text x="435" y="185" fill="#64748b" font-size="9" text-anchor="middle">(Constant ω = 450 rpm)</text>
      </svg>`
    };
  }

  if (type === "vector") {
    return {
      id: `chem_diag_vec_m${m.id}_l${l.id}`,
      subject: "CHEM",
      moduleId: m.id,
      title: `${m.title} - ${l.title} Reaction Coordinate & Free Energy Vector`,
      caption: `Figure ${m.id}.${l.id}V: Potential Energy Coordinate & Activation Barrier for ${l.title}`,
      svg: `<svg viewBox="0 0 540 280" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <rect width="540" height="280" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
        <text x="270" y="28" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Reaction Coordinate: ${l.title}</text>
        
        <!-- Axes -->
        <line x1="70" y1="230" x2="70" y2="45" stroke="#94a3b8" stroke-width="2"/>
        <line x1="60" y1="220" x2="500" y2="220" stroke="#94a3b8" stroke-width="2"/>
        <text x="25" y="130" fill="#38bdf8" font-size="11" font-weight="700" transform="rotate(-90 25 130)" text-anchor="middle">Potential Energy E (kJ/mol)</text>
        <text x="280" y="250" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">Reaction Progress</text>
        
        <!-- Energy Profile Path (Uncatalyzed) -->
        <path d="M 70 170 L 160 170 Q 250 40 330 70 L 370 100 Q 420 200 480 200" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
        <!-- Energy Profile Path (Catalyzed) -->
        <path d="M 160 170 Q 250 100 330 115 L 370 135 Q 420 200 480 200" fill="none" stroke="#10b981" stroke-width="2.5" stroke-dasharray="4" stroke-linecap="round"/>
        
        <!-- Reactants & Products Levels -->
        <line x1="70" y1="170" x2="160" y2="170" stroke="#38bdf8" stroke-width="4"/>
        <text x="115" y="160" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">Reactants</text>
        
        <line x1="420" y1="200" x2="490" y2="200" stroke="#10b981" stroke-width="4"/>
        <text x="455" y="190" fill="#10b981" font-size="11" font-weight="800" text-anchor="middle">Products</text>
        
        <!-- Activation Energy Vector Arrows -->
        <line x1="250" y1="170" x2="250" y2="60" stroke="#f59e0b" stroke-width="1.8"/>
        <polygon points="250,55 246,65 254,65" fill="#f59e0b"/>
        <polygon points="250,175 246,165 254,165" fill="#f59e0b"/>
        <text x="255" y="115" fill="#f59e0b" font-size="10" font-weight="800">Eₐ (Uncatalyzed)</text>
        
        <!-- Enthalpy ΔH Arrow -->
        <line x1="470" y1="170" x2="470" y2="200" stroke="#38bdf8" stroke-width="1.8"/>
        <polygon points="470,205 466,195 474,195" fill="#38bdf8"/>
        <text x="475" y="185" fill="#38bdf8" font-size="10" font-weight="800">ΔH &lt; 0</text>
        
        <!-- Transition State Node -->
        <circle cx="280" cy="58" r="5" fill="#ef4444"/>
        <text x="280" y="48" fill="#ef4444" font-size="10" font-weight="800" text-anchor="middle">[X‡] Transition State</text>
      </svg>`
    };
  }

  if (type === "cycle") {
    return {
      id: `chem_diag_cycle_m${m.id}_l${l.id}`,
      subject: "CHEM",
      moduleId: m.id,
      title: `${m.title} - ${l.title} Thermodynamic & Catalytic Cycle`,
      caption: `Figure ${m.id}.${l.id}C: Closed Catalytic Reaction Cycle & Energy Transitions for ${l.title}`,
      svg: `<svg viewBox="0 0 540 280" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <rect width="540" height="280" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
        <text x="270" y="28" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Thermodynamic &amp; Catalytic Cycle: ${l.title}</text>
        
        <!-- Central Loop Ellipse / Circle -->
        <ellipse cx="270" cy="148" rx="160" ry="85" fill="none" stroke="#334155" stroke-width="2" stroke-dasharray="6"/>
        
        <!-- Stage 1 (Top): Active Catalyst / Free State -->
        <rect x="205" y="48" width="130" height="34" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
        <text x="270" y="69" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">State I: Catalyst [Cat]</text>
        
        <!-- Stage 2 (Right): Substrate Adsorption / Complex -->
        <rect x="365" y="130" width="145" height="36" rx="6" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
        <text x="437" y="152" fill="#f59e0b" font-size="10.5" font-weight="800" text-anchor="middle">State II: [Cat·Substrate]</text>
        
        <!-- Stage 3 (Bottom): Activated Intermediate / Transition -->
        <rect x="195" y="212" width="150" height="36" rx="6" fill="#1e293b" stroke="#ef4444" stroke-width="2"/>
        <text x="270" y="234" fill="#ef4444" font-size="10.5" font-weight="800" text-anchor="middle">State III: [Cat·Intermed]‡</text>
        
        <!-- Stage 4 (Left): Product Release -->
        <rect x="30" y="130" width="145" height="36" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
        <text x="102" y="152" fill="#10b981" font-size="10.5" font-weight="800" text-anchor="middle">State IV: Product + [Cat]</text>
        
        <!-- Directional Flow Arrows -->
        <path d="M 335 65 Q 420 85 435 125" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round"/>
        <polygon points="437,125 430,117 440,119" fill="#38bdf8"/>
        <text x="400" y="85" fill="#94a3b8" font-size="9" font-weight="700">+ Reactants</text>
        
        <path d="M 435 170 Q 410 215 350 228" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/>
        <polygon points="350,228 358,222 360,232" fill="#f59e0b"/>
        <text x="410" y="208" fill="#f59e0b" font-size="9" font-weight="700">Activation Eₐ</text>
        
        <path d="M 195 228 Q 130 215 110 170" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/>
        <polygon points="110,170 112,180 119,173" fill="#ef4444"/>
        <text x="110" y="208" fill="#10b981" font-size="9" font-weight="700">- Product (ΔH)</text>
        
        <path d="M 105 125 Q 120 85 200 65" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round"/>
        <polygon points="200,65 190,67 197,73" fill="#10b981"/>
        <text x="130" y="85" fill="#38bdf8" font-size="9" font-weight="700">Regeneration</text>
        
        <!-- Center Conservation Callout -->
        <circle cx="270" cy="148" r="32" fill="#0f172a" stroke="#06b6d4" stroke-width="1.5"/>
        <text x="270" y="145" fill="#38bdf8" font-size="9.5" font-weight="800" text-anchor="middle">Steady-State</text>
        <text x="270" y="158" fill="#10b981" font-size="9" font-weight="700" text-anchor="middle">ΔG_net &lt; 0</text>
      </svg>`
    };
  }

  if (type === "spectrometry") {
    return {
      id: `chem_diag_spec_m${m.id}_l${l.id}`,
      subject: "CHEM",
      moduleId: m.id,
      title: `${m.title} - ${l.title} Spectrometric & Analytical Profile`,
      caption: `Figure ${m.id}.${l.id}M: Analytical Mass & Optical Absorption Spectrum for ${l.title}`,
      svg: `<svg viewBox="0 0 540 280" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <rect width="540" height="280" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
        <text x="270" y="28" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Spectrometric Profile: ${l.title}</text>
        
        <!-- Axes -->
        <line x1="70" y1="230" x2="70" y2="50" stroke="#94a3b8" stroke-width="2"/>
        <line x1="60" y1="230" x2="500" y2="230" stroke="#94a3b8" stroke-width="2"/>
        
        <text x="25" y="140" fill="#38bdf8" font-size="11" font-weight="700" transform="rotate(-90 25 140)" text-anchor="middle">Relative Abundance / Absorbance (%)</text>
        <text x="280" y="255" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">Mass-to-Charge (m/z) / Wavelength (nm)</text>
        
        <!-- Gridlines -->
        <line x1="70" y1="185" x2="490" y2="185" stroke="#1e293b" stroke-width="1" stroke-dasharray="3"/>
        <line x1="70" y1="140" x2="490" y2="140" stroke="#1e293b" stroke-width="1" stroke-dasharray="3"/>
        <line x1="70" y1="95" x2="490" y2="95" stroke="#1e293b" stroke-width="1" stroke-dasharray="3"/>
        
        <text x="60" y="98" fill="#64748b" font-size="9" text-anchor="end">100%</text>
        <text x="60" y="143" fill="#64748b" font-size="9" text-anchor="end">50%</text>
        <text x="60" y="188" fill="#64748b" font-size="9" text-anchor="end">25%</text>
        
        <!-- Peak 1: Base Peak (Tallest) -->
        <line x1="160" y1="230" x2="160" y2="95" stroke="#38bdf8" stroke-width="4" stroke-linecap="round"/>
        <circle cx="160" cy="95" r="4" fill="#38bdf8"/>
        <text x="160" y="85" fill="#38bdf8" font-size="10" font-weight="800" text-anchor="middle">Peak A (100%)</text>
        <text x="160" y="244" fill="#94a3b8" font-size="9" font-weight="700" text-anchor="middle">m/z = 35</text>
        
        <!-- Peak 2: Secondary Isotope Peak -->
        <line x1="280" y1="230" x2="280" y2="185" stroke="#10b981" stroke-width="4" stroke-linecap="round"/>
        <circle cx="280" cy="185" r="4" fill="#10b981"/>
        <text x="280" y="175" fill="#10b981" font-size="10" font-weight="800" text-anchor="middle">Peak B (32%)</text>
        <text x="280" y="244" fill="#94a3b8" font-size="9" font-weight="700" text-anchor="middle">m/z = 37</text>
        
        <!-- Peak 3: Molecular Fragment Peak -->
        <line x1="420" y1="230" x2="420" y2="140" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
        <circle cx="420" cy="140" r="4" fill="#f59e0b"/>
        <text x="420" y="130" fill="#f59e0b" font-size="10" font-weight="800" text-anchor="middle">Molecular Ion (54%)</text>
        <text x="420" y="244" fill="#94a3b8" font-size="9" font-weight="700" text-anchor="middle">m/z = 70</text>
      </svg>`
    };
  }

  // Default: Coordinate curve
  const yLabel = (m.id >= 14 && m.id <= 16) ? "Energy (kJ/mol)" : (m.id >= 11 && m.id <= 12 ? "Pressure (atm)" : "Concentration [M]");
  const xLabel = (m.id >= 14 && m.id <= 16) ? "Reaction Progress" : (m.id >= 11 && m.id <= 12 ? "Volume (L)" : "Time (minutes)");

  return {
    id: `chem_diag_m${m.id}_l${l.id}`,
    subject: "CHEM",
    moduleId: m.id,
    title: `${m.title} - ${l.title} Phase & Kinetic Profile`,
    caption: `Figure ${m.id}.${l.id}: Experimental ${yLabel} vs ${xLabel} for ${l.title}`,
    svg: `<svg viewBox="0 0 540 280" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="280" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <line x1="70" y1="210" x2="490" y2="210" stroke="#1e293b" stroke-width="1"/>
      <line x1="70" y1="140" x2="490" y2="140" stroke="#1e293b" stroke-width="1" stroke-dasharray="3"/>
      <line x1="70" y1="70" x2="490" y2="70" stroke="#1e293b" stroke-width="1" stroke-dasharray="3"/>
      
      <line x1="70" y1="220" x2="70" y2="40" stroke="#94a3b8" stroke-width="2"/>
      <line x1="60" y1="210" x2="500" y2="210" stroke="#94a3b8" stroke-width="2"/>
      
      <polygon points="70,35 65,45 75,45" fill="#94a3b8"/>
      <polygon points="505,210 495,205 495,215" fill="#94a3b8"/>
      
      <text x="25" y="130" fill="#38bdf8" font-size="11" font-weight="700" transform="rotate(-90 25 130)" text-anchor="middle">${yLabel}</text>
      <text x="280" y="245" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">${xLabel}</text>
      
      <path d="M 70 70 Q 180 80 270 140 T 480 185" fill="none" stroke="#06b6d4" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M 70 195 Q 180 185 270 140 T 480 95" fill="none" stroke="#10b981" stroke-width="3" stroke-dasharray="4" stroke-linecap="round"/>
      
      <circle cx="270" cy="140" r="5" fill="#f59e0b"/>
      <text x="270" y="125" fill="#f59e0b" font-size="11" font-weight="800" text-anchor="middle">Dynamic Equilibrium State</text>
      
      <circle cx="480" cy="185" r="4.5" fill="#06b6d4"/>
      <text x="485" y="195" fill="#06b6d4" font-size="10" font-weight="700">Reactant Decay</text>
      <circle cx="480" cy="95" r="4.5" fill="#10b981"/>
      <text x="485" y="90" fill="#10b981" font-size="10" font-weight="700">Product Plateau</text>
    </svg>`
  };
}

// =========================================================================
// BIOLOGY DIAGRAM GENERATOR
// =========================================================================
function generateBiologyDiagram(m, l, p, type) {
  if (type === "structural") {
    return {
      id: `bio_diag_struct_m${m.id}_l${l.id}`,
      subject: "BIO",
      moduleId: m.id,
      title: `${m.title} - ${l.title} Cellular Ultrastructure`,
      caption: `Figure ${m.id}.${l.id}S: Membrane Architecture & Transport Protein Complex for ${l.title}`,
      svg: `<svg viewBox="0 0 540 280" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <rect width="540" height="280" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
        <text x="270" y="28" fill="#10b981" font-size="12" font-weight="700" text-anchor="middle">Cellular Ultrastructure: ${l.title}</text>
        
        <!-- Fluid Compartment Labels -->
        <text x="90" y="55" fill="#38bdf8" font-size="11" font-weight="700">EXTRACELLULAR MATRIX ([Na⁺] High)</text>
        <text x="90" y="240" fill="#34d399" font-size="11" font-weight="700">CYTOSOL / INTRACELLULAR ([K⁺] High)</text>
        
        <!-- Phospholipid Bilayer Top Leaflet -->
        <g stroke="#38bdf8" stroke-width="1.5">
          <line x1="60" y1="105" x2="60" y2="125"/>
          <line x1="85" y1="105" x2="85" y2="125"/>
          <line x1="110" y1="105" x2="110" y2="125"/>
          <line x1="135" y1="105" x2="135" y2="125"/>
          <line x1="160" y1="105" x2="160" y2="125"/>
          <line x1="375" y1="105" x2="375" y2="125"/>
          <line x1="400" y1="105" x2="400" y2="125"/>
          <line x1="425" y1="105" x2="425" y2="125"/>
          <line x1="450" y1="105" x2="450" y2="125"/>
          <line x1="475" y1="105" x2="475" y2="125"/>
        </g>
        <circle cx="60" cy="100" r="8" fill="#10b981"/>
        <circle cx="85" cy="100" r="8" fill="#10b981"/>
        <circle cx="110" cy="100" r="8" fill="#10b981"/>
        <circle cx="135" cy="100" r="8" fill="#10b981"/>
        <circle cx="160" cy="100" r="8" fill="#10b981"/>
        <circle cx="375" cy="100" r="8" fill="#10b981"/>
        <circle cx="400" cy="100" r="8" fill="#10b981"/>
        <circle cx="425" cy="100" r="8" fill="#10b981"/>
        <circle cx="450" cy="100" r="8" fill="#10b981"/>
        <circle cx="475" cy="100" r="8" fill="#10b981"/>
        
        <!-- Bottom Leaflet -->
        <g stroke="#38bdf8" stroke-width="1.5">
          <line x1="60" y1="175" x2="60" y2="155"/>
          <line x1="85" y1="175" x2="85" y2="155"/>
          <line x1="110" y1="175" x2="110" y2="155"/>
          <line x1="135" y1="175" x2="135" y2="155"/>
          <line x1="160" y1="175" x2="160" y2="155"/>
          <line x1="375" y1="175" x2="375" y2="155"/>
          <line x1="400" y1="175" x2="400" y2="155"/>
          <line x1="425" y1="175" x2="425" y2="155"/>
          <line x1="450" y1="175" x2="450" y2="155"/>
          <line x1="475" y1="175" x2="475" y2="155"/>
        </g>
        <circle cx="60" cy="180" r="8" fill="#10b981"/>
        <circle cx="85" cy="180" r="8" fill="#10b981"/>
        <circle cx="110" cy="180" r="8" fill="#10b981"/>
        <circle cx="135" cy="180" r="8" fill="#10b981"/>
        <circle cx="160" cy="180" r="8" fill="#10b981"/>
        <circle cx="375" cy="180" r="8" fill="#10b981"/>
        <circle cx="400" cy="180" r="8" fill="#10b981"/>
        <circle cx="425" cy="180" r="8" fill="#10b981"/>
        <circle cx="450" cy="180" r="8" fill="#10b981"/>
        <circle cx="475" cy="180" r="8" fill="#10b981"/>
        
        <!-- Integral Transport Channel Protein -->
        <rect x="210" y="80" width="120" height="120" rx="16" fill="#6366f1" stroke="#818cf8" stroke-width="2.5"/>
        <!-- Central Hydrophilic Pore -->
        <ellipse cx="270" cy="140" rx="18" ry="45" fill="#0f172a" stroke="#a5b4fc" stroke-width="2"/>
        <text x="270" y="145" fill="#ffffff" font-size="11" font-weight="800" text-anchor="middle">PORE</text>
        
        <!-- Solute Flux Vector Arrow -->
        <line x1="270" y1="50" x2="270" y2="230" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
        <polygon points="270,235 264,220 276,220" fill="#f59e0b"/>
        <text x="290" y="215" fill="#f59e0b" font-size="11" font-weight="800">Passive Influx</text>
      </svg>`
    };
  }

  if (type === "apparatus") {
    return {
      id: `bio_diag_app_m${m.id}_l${l.id}`,
      subject: "BIO",
      moduleId: m.id,
      title: `${m.title} - ${l.title} Analytical Instrumentation`,
      caption: `Figure ${m.id}.${l.id}A: Agarose Gel Electrophoresis & Molecular Separation for ${l.title}`,
      svg: `<svg viewBox="0 0 540 280" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <rect width="540" height="280" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
        <text x="270" y="28" fill="#10b981" font-size="12" font-weight="700" text-anchor="middle">Electrophoretic Mobility Separation: ${l.title}</text>
        
        <!-- Electrophoresis Buffer Chamber -->
        <rect x="70" y="55" width="400" height="185" rx="10" fill="#1e293b" stroke="#334155" stroke-width="2"/>
        <rect x="110" y="75" width="320" height="145" fill="#0284c7" fill-opacity="0.15" rx="6" stroke="#0284c7" stroke-width="1.5"/>
        
        <!-- Cathode (-) Top & Anode (+) Bottom -->
        <rect x="90" y="65" width="360" height="6" fill="#ef4444" rx="2"/>
        <text x="75" y="72" fill="#ef4444" font-size="11" font-weight="800">(-)</text>
        <rect x="90" y="228" width="360" height="6" fill="#10b981" rx="2"/>
        <text x="75" y="234" fill="#10b981" font-size="11" font-weight="800">(+)</text>
        
        <!-- Loading Wells -->
        <rect x="135" y="85" width="40" height="12" fill="#0f172a" stroke="#64748b" stroke-width="1.5"/>
        <rect x="210" y="85" width="40" height="12" fill="#0f172a" stroke="#64748b" stroke-width="1.5"/>
        <rect x="285" y="85" width="40" height="12" fill="#0f172a" stroke="#64748b" stroke-width="1.5"/>
        <rect x="360" y="85" width="40" height="12" fill="#0f172a" stroke="#64748b" stroke-width="1.5"/>
        
        <!-- Fluorescent Molecular Bands -->
        <!-- Lane 1: Ladder -->
        <rect x="140" y="110" width="30" height="4" fill="#38bdf8" rx="2"/>
        <rect x="140" y="130" width="30" height="4" fill="#38bdf8" rx="2"/>
        <rect x="140" y="160" width="30" height="4" fill="#38bdf8" rx="2"/>
        <rect x="140" y="195" width="30" height="4" fill="#38bdf8" rx="2"/>
        <text x="125" y="114" fill="#94a3b8" font-size="9" text-anchor="end">1000 bp</text>
        <text x="125" y="199" fill="#94a3b8" font-size="9" text-anchor="end">100 bp</text>
        
        <!-- Lane 2: Control Sample -->
        <rect x="215" y="130" width="30" height="5" fill="#10b981" rx="2"/>
        
        <!-- Lane 3: Experimental Digestion -->
        <rect x="290" y="145" width="30" height="5" fill="#f59e0b" rx="2"/>
        <rect x="290" y="175" width="30" height="5" fill="#f59e0b" rx="2"/>
        
        <!-- Migration Vector Arrow -->
        <line x1="445" y1="90" x2="445" y2="210" stroke="#f59e0b" stroke-width="2"/>
        <polygon points="445,215 440,205 450,205" fill="#f59e0b"/>
        <text x="455" y="155" fill="#f59e0b" font-size="9" font-weight="700">DNA Migration</text>
        
        <text x="270" y="258" fill="#94a3b8" font-size="10" text-anchor="middle">Electrolyte: 1X TAE Buffer | Agarose: 1.2% w/v</text>
      </svg>`
    };
  }

  if (type === "vector") {
    return {
      id: `bio_diag_vec_m${m.id}_l${l.id}`,
      subject: "BIO",
      moduleId: m.id,
      title: `${m.title} - ${l.title} Homeostatic Regulatory Loop`,
      caption: `Figure ${m.id}.${l.id}V: Cybernetic Negative Feedback Cascade for ${l.title}`,
      svg: `<svg viewBox="0 0 540 280" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <rect width="540" height="280" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
        <text x="270" y="28" fill="#10b981" font-size="12" font-weight="700" text-anchor="middle">Homeostatic Feedback Loop: ${l.title}</text>
        
        <!-- Circular Loop Nodes -->
        <!-- Center Set Point -->
        <circle cx="270" cy="140" r="32" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
        <text x="270" y="136" fill="#38bdf8" font-size="10" font-weight="800" text-anchor="middle">SET POINT</text>
        <text x="270" y="150" fill="#94a3b8" font-size="9" text-anchor="middle">Dynamic Normal</text>
        
        <!-- Top Node: Receptor / Sensor -->
        <rect x="210" y="45" width="120" height="35" rx="6" fill="#0f766e" stroke="#14b8a6" stroke-width="1.5"/>
        <text x="270" y="66" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">1. SENSOR / RECEPTOR</text>
        
        <!-- Right Node: Integrating Control Center -->
        <rect x="375" y="122" width="130" height="35" rx="6" fill="#4338ca" stroke="#6366f1" stroke-width="1.5"/>
        <text x="440" y="143" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">2. CONTROL CENTER</text>
        
        <!-- Bottom Node: Effector Organ / Enzyme -->
        <rect x="210" y="200" width="120" height="35" rx="6" fill="#b45309" stroke="#f59e0b" stroke-width="1.5"/>
        <text x="270" y="221" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">3. EFFECTOR ORGAN</text>
        
        <!-- Left Node: Systemic Response -->
        <rect x="40" y="122" width="125" height="35" rx="6" fill="#15803d" stroke="#22c55e" stroke-width="1.5"/>
        <text x="102" y="143" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">4. RESPONSE</text>
        
        <!-- Connecting Arrows -->
        <path d="M 330 62 Q 410 70 435 120" fill="none" stroke="#38bdf8" stroke-width="2"/>
        <path d="M 440 160 Q 420 215 330 218" fill="none" stroke="#38bdf8" stroke-width="2"/>
        <path d="M 210 218 Q 120 215 105 160" fill="none" stroke="#38bdf8" stroke-width="2"/>
        <path d="M 105 120 Q 120 65 210 62" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="4"/>
        
        <text x="155" y="85" fill="#ef4444" font-size="10" font-weight="800">(-) Feedback</text>
      </svg>`
    };
  }

  if (type === "cycle") {
    return {
      id: `bio_diag_cycle_m${m.id}_l${l.id}`,
      subject: "BIO",
      moduleId: m.id,
      title: `${m.title} - ${l.title} Biochemical & Feedback Cycle`,
      caption: `Figure ${m.id}.${l.id}C: Cybernetic Negative Feedback & Metabolic Cycle for ${l.title}`,
      svg: `<svg viewBox="0 0 540 280" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <rect width="540" height="280" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
        <text x="270" y="28" fill="#10b981" font-size="12" font-weight="700" text-anchor="middle">Biochemical &amp; Metabolic Cycle: ${l.title}</text>
        
        <!-- Central Loop Circular Orbit -->
        <circle cx="270" cy="148" r="75" fill="none" stroke="#334155" stroke-width="2" stroke-dasharray="5"/>
        
        <!-- Center Pool Annotation -->
        <circle cx="270" cy="148" r="28" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
        <text x="270" y="145" fill="#38bdf8" font-size="9.5" font-weight="800" text-anchor="middle">ATP / ADP</text>
        <text x="270" y="158" fill="#10b981" font-size="8.5" font-weight="700" text-anchor="middle">Coupled Pool</text>
        
        <!-- Node 1 (Top): Substrate Binding -->
        <rect x="200" y="45" width="140" height="34" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
        <text x="270" y="66" fill="#38bdf8" font-size="10.5" font-weight="800" text-anchor="middle">Phase 1: Substrate Influx</text>
        
        <!-- Node 2 (Right): Enzymatic Phosphorylation -->
        <rect x="365" y="130" width="145" height="34" rx="6" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
        <text x="437" y="151" fill="#f59e0b" font-size="10.5" font-weight="800" text-anchor="middle">Phase 2: Enzymatic Step</text>
        
        <!-- Node 3 (Bottom): Electron Transport / Energy Yield -->
        <rect x="195" y="215" width="150" height="34" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
        <text x="270" y="236" fill="#10b981" font-size="10.5" font-weight="800" text-anchor="middle">Phase 3: High-Energy Yield</text>
        
        <!-- Node 4 (Left): Precursor Regeneration -->
        <rect x="30" y="130" width="145" height="34" rx="6" fill="#1e293b" stroke="#a855f7" stroke-width="2"/>
        <text x="102" y="151" fill="#a855f7" font-size="10.5" font-weight="800" text-anchor="middle">Phase 4: Regeneration</text>
        
        <!-- Flow Arrows -->
        <path d="M 335 62 Q 410 75 430 125" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round"/>
        <polygon points="432,125 425,117 435,119" fill="#38bdf8"/>
        
        <path d="M 435 168 Q 410 215 350 228" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/>
        <polygon points="350,228 358,222 360,232" fill="#f59e0b"/>
        
        <path d="M 195 228 Q 130 215 110 168" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round"/>
        <polygon points="110,168 112,178 119,171" fill="#10b981"/>
        
        <path d="M 105 125 Q 120 75 195 62" fill="none" stroke="#a855f7" stroke-width="2.5" stroke-linecap="round"/>
        <polygon points="195,62 185,64 192,70" fill="#a855f7"/>
        
        <text x="270" y="266" fill="#94a3b8" font-size="9.5" text-anchor="middle">Stoichiometric Conservation: 1 Turn Yields 2 CO₂ + 3 NADH + 1 FADH₂ + 1 ATP</text>
      </svg>`
    };
  }

  if (type === "spectrometry") {
    return {
      id: `bio_diag_spec_m${m.id}_l${l.id}`,
      subject: "BIO",
      moduleId: m.id,
      title: `${m.title} - ${l.title} Gel Electrophoresis`,
      caption: `Figure ${m.id}.${l.id}G: Agarose Gel Electrophoresis Sizing Assay for ${l.title}`,
      svg: `<svg viewBox="0 0 540 280" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <rect width="540" height="280" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
        <text x="270" y="28" fill="#10b981" font-size="12" font-weight="700" text-anchor="middle">Agarose Gel Electrophoresis: ${l.title}</text>
        
        <!-- Gel Bed Frame -->
        <rect x="100" y="45" width="340" height="200" fill="#1e293b" fill-opacity="0.8" rx="8" stroke="#475569" stroke-width="2"/>
        
        <!-- Electrodes (+ / -) -->
        <text x="80" y="70" fill="#ef4444" font-size="14" font-weight="900">-</text>
        <text x="80" y="235" fill="#10b981" font-size="14" font-weight="900">+</text>
        
        <!-- Loading Wells -->
        <rect x="135" y="60" width="40" height="12" fill="#0f172a" stroke="#64748b" stroke-width="1.5"/>
        <rect x="210" y="60" width="40" height="12" fill="#0f172a" stroke="#64748b" stroke-width="1.5"/>
        <rect x="285" y="60" width="40" height="12" fill="#0f172a" stroke="#64748b" stroke-width="1.5"/>
        <rect x="360" y="60" width="40" height="12" fill="#0f172a" stroke="#64748b" stroke-width="1.5"/>
        
        <text x="155" y="55" fill="#94a3b8" font-size="9" text-anchor="middle">Ladder</text>
        <text x="230" y="55" fill="#94a3b8" font-size="9" text-anchor="middle">Wild Type</text>
        <text x="305" y="55" fill="#94a3b8" font-size="9" text-anchor="middle">Sample A</text>
        <text x="380" y="55" fill="#94a3b8" font-size="9" text-anchor="middle">Sample B</text>
        
        <!-- Fluorescent Molecular Bands -->
        <!-- Lane 1: Ladder -->
        <rect x="140" y="95" width="30" height="4" fill="#38bdf8" rx="2"/>
        <rect x="140" y="125" width="30" height="4" fill="#38bdf8" rx="2"/>
        <rect x="140" y="160" width="30" height="4" fill="#38bdf8" rx="2"/>
        <rect x="140" y="200" width="30" height="4" fill="#38bdf8" rx="2"/>
        <text x="125" y="99" fill="#94a3b8" font-size="8" text-anchor="end">1000 bp</text>
        <text x="125" y="129" fill="#94a3b8" font-size="8" text-anchor="end">750 bp</text>
        <text x="125" y="164" fill="#94a3b8" font-size="8" text-anchor="end">500 bp</text>
        <text x="125" y="204" fill="#94a3b8" font-size="8" text-anchor="end">250 bp</text>
        
        <!-- Lane 2: Wild Type Sample -->
        <rect x="215" y="125" width="30" height="5" fill="#10b981" rx="2"/>
        
        <!-- Lane 3: Sample A -->
        <rect x="290" y="160" width="30" height="5" fill="#f59e0b" rx="2"/>
        <rect x="290" y="200" width="30" height="5" fill="#f59e0b" rx="2"/>
        
        <!-- Lane 4: Sample B -->
        <rect x="365" y="125" width="30" height="5" fill="#10b981" rx="2"/>
        
        <!-- Migration Vector Arrow -->
        <line x1="455" y1="90" x2="455" y2="210" stroke="#38bdf8" stroke-width="2"/>
        <polygon points="455,215 450,205 460,205" fill="#38bdf8"/>
        <text x="465" y="155" fill="#38bdf8" font-size="9" font-weight="700">Migration</text>
        
        <text x="270" y="260" fill="#94a3b8" font-size="9.5" text-anchor="middle">Electrolyte: 1X TAE Buffer | Agarose: 1.2% w/v</text>
      </svg>`
    };
  }

  // Default: Sigmoidal population/growth curve
  const isPopOrEco = m.id <= 5;
  const yLabel = isPopOrEco ? "Population Size (N)" : "Relative Metabolic Rate";
  const xLabel = isPopOrEco ? "Time (Generations)" : "Environmental Factor (pH / Temp)";

  return {
    id: `bio_diag_m${m.id}_l${l.id}`,
    subject: "BIO",
    moduleId: m.id,
    title: `${m.title} - ${l.title} Homeostatic & Ecological Model`,
    caption: `Figure ${m.id}.${l.id}: Biological Response Curve for ${l.title}`,
    svg: `<svg viewBox="0 0 540 280" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="280" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <line x1="70" y1="210" x2="490" y2="210" stroke="#1e293b" stroke-width="1"/>
      <line x1="70" y1="80" x2="490" y2="80" stroke="#1e293b" stroke-width="1" stroke-dasharray="4"/>
      
      <line x1="70" y1="220" x2="70" y2="40" stroke="#94a3b8" stroke-width="2"/>
      <line x1="60" y1="210" x2="500" y2="210" stroke="#94a3b8" stroke-width="2"/>
      
      <polygon points="70,35 65,45 75,45" fill="#94a3b8"/>
      <polygon points="505,210 495,205 495,215" fill="#94a3b8"/>
      
      <text x="25" y="130" fill="#10b981" font-size="11" font-weight="700" transform="rotate(-90 25 130)" text-anchor="middle">${yLabel}</text>
      <text x="280" y="245" fill="#10b981" font-size="11" font-weight="700" text-anchor="middle">${xLabel}</text>
      
      <line x1="70" y1="80" x2="490" y2="80" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4"/>
      <text x="480" y="72" fill="#f59e0b" font-size="10" font-weight="800" text-anchor="end">Carrying Capacity (K)</text>
      
      <path d="M 70 205 Q 150 205 230 160 T 360 85 L 480 82" fill="none" stroke="#10b981" stroke-width="3.5" stroke-linecap="round"/>
      
      <circle cx="150" cy="200" r="4.5" fill="#38bdf8"/>
      <text x="150" y="185" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">Lag Phase</text>
      
      <circle cx="230" cy="160" r="5" fill="#10b981"/>
      <text x="210" y="145" fill="#10b981" font-size="10" font-weight="800">Exponential Phase</text>
      
      <circle cx="420" cy="83" r="5" fill="#f59e0b"/>
      <text x="420" y="105" fill="#f59e0b" font-size="10" font-weight="800" text-anchor="middle">Dynamic Equilibrium</text>
    </svg>`
  };
}

// =========================================================================
// PHYSICS DIAGRAM GENERATOR
// =========================================================================
function generatePhysicsDiagram(m, l, p, type) {
  if (type === "structural") {
    return {
      id: `phys_diag_struct_m${m.id}_l${l.id}`,
      subject: "PHYS",
      moduleId: m.id,
      title: `${m.title} - ${l.title} Vector Free-Body Diagram`,
      caption: `Figure ${m.id}.${l.id}S: Orthogonal Vector Decomposition & Free-Body Geometry for ${l.title}`,
      svg: `<svg viewBox="0 0 540 280" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <rect width="540" height="280" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
        <text x="270" y="28" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Vector Free-Body Analysis: ${l.title}</text>
        
        <!-- Inclined Plane -->
        <polygon points="90,220 450,220 450,110" fill="#1e293b" stroke="#475569" stroke-width="2"/>
        
        <!-- Incline Angle θ Arc -->
        <path d="M 140 220 A 50 50 0 0 0 135 205" fill="none" stroke="#f59e0b" stroke-width="2"/>
        <text x="155" y="212" fill="#f59e0b" font-size="11" font-weight="800">θ = 30°</text>
        
        <!-- Sliding Mass Block m -->
        <g transform="translate(260, 168) rotate(-17)">
          <rect x="-35" y="-30" width="70" height="50" rx="4" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
          <text x="0" y="0" fill="#ffffff" font-size="12" font-weight="800" text-anchor="middle">m</text>
          
          <!-- Normal Force Fn Vector -->
          <line x1="0" y1="-30" x2="0" y2="-95" stroke="#10b981" stroke-width="3"/>
          <polygon points="0,-100 -5,-90 5,-90" fill="#10b981"/>
          <text x="10" y="-85" fill="#10b981" font-size="11" font-weight="800">Fₙ = mg cosθ</text>
          
          <!-- Friction Ff Vector -->
          <line x1="35" y1="-5" x2="100" y2="-5" stroke="#f59e0b" stroke-width="3"/>
          <polygon points="105,-5 95,-10 95,0" fill="#f59e0b"/>
          <text x="75" y="-12" fill="#f59e0b" font-size="10" font-weight="800">F_f = μFₙ</text>
        </g>
        
        <!-- Gravity Vector Fg straight down -->
        <line x1="260" y1="168" x2="260" y2="255" stroke="#ef4444" stroke-width="3"/>
        <polygon points="260,260 255,250 265,250" fill="#ef4444"/>
        <text x="270" y="245" fill="#ef4444" font-size="11" font-weight="800">F_g = mg</text>
      </svg>`
    };
  }

  if (type === "apparatus") {
    return {
      id: `phys_diag_app_m${m.id}_l${l.id}`,
      subject: "PHYS",
      moduleId: m.id,
      title: `${m.title} - ${l.title} Laboratory Kinematics Apparatus`,
      caption: `Figure ${m.id}.${l.id}A: Air Track Photogate Timing System for ${l.title}`,
      svg: `<svg viewBox="0 0 540 280" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <rect width="540" height="280" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
        <text x="270" y="28" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Precision Kinematics Bench: ${l.title}</text>
        
        <!-- Linear Air Track Rail -->
        <rect x="60" y="160" width="420" height="20" fill="#334155" stroke="#64748b" stroke-width="2"/>
        <!-- Metric Scale Markings -->
        <g stroke="#94a3b8" stroke-width="1">
          <line x1="100" y1="180" x2="100" y2="173"/><line x1="150" y1="180" x2="150" y2="173"/>
          <line x1="200" y1="180" x2="200" y2="173"/><line x1="250" y1="180" x2="250" y2="173"/>
          <line x1="300" y1="180" x2="300" y2="173"/><line x1="350" y1="180" x2="350" y2="173"/>
          <line x1="400" y1="180" x2="400" y2="173"/><line x1="450" y1="180" x2="450" y2="173"/>
        </g>
        
        <!-- Glider Cart -->
        <rect x="180" y="138" width="60" height="22" rx="3" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
        <rect x="205" y="115" width="10" height="23" fill="#38bdf8"/>
        <text x="210" y="153" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">CART</text>
        
        <!-- Photogate 1 -->
        <path d="M 140 110 L 140 160 L 155 160 L 155 110 Z" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
        <line x1="135" y1="125" x2="160" y2="125" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="2"/>
        <text x="147" y="100" fill="#10b981" font-size="9" font-weight="800" text-anchor="middle">GATE 1</text>
        
        <!-- Photogate 2 -->
        <path d="M 330 110 L 330 160 L 345 160 L 345 110 Z" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
        <line x1="325" y1="125" x2="350" y2="125" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="2"/>
        <text x="337" y="100" fill="#10b981" font-size="9" font-weight="800" text-anchor="middle">GATE 2</text>
        
        <!-- Distance Dimension Line Δx -->
        <line x1="147" y1="80" x2="337" y2="80" stroke="#f59e0b" stroke-width="1.5"/>
        <polygon points="147,80 155,77 155,83" fill="#f59e0b"/>
        <polygon points="337,80 329,77 329,83" fill="#f59e0b"/>
        <text x="242" y="73" fill="#f59e0b" font-size="10" font-weight="800" text-anchor="middle">Displacement Δx = 0.500 m</text>
        
        <!-- Digital Timer Counter Display -->
        <rect x="200" y="205" width="140" height="50" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="270" y="222" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">MICROSECOND TIMER</text>
        <text x="270" y="244" fill="#10b981" font-size="14" font-family="monospace" font-weight="800" text-anchor="middle">Δt = 0.2458 s</text>
      </svg>`
    };
  }

  if (type === "vector") {
    return {
      id: `phys_diag_vec_m${m.id}_l${l.id}`,
      subject: "PHYS",
      moduleId: m.id,
      title: `${m.title} - ${l.title} Wave & Field Refraction Interface`,
      caption: `Figure ${m.id}.${l.id}V: Snell's Law & Wavefront Phase Boundary for ${l.title}`,
      svg: `<svg viewBox="0 0 540 280" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <rect width="540" height="280" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
        <text x="270" y="28" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Wavefront Interface &amp; Refraction: ${l.title}</text>
        
        <!-- Media Boundary -->
        <rect x="60" y="140" width="420" height="110" fill="#0284c7" fill-opacity="0.18"/>
        <line x1="60" y1="140" x2="480" y2="140" stroke="#38bdf8" stroke-width="2"/>
        <text x="75" y="125" fill="#94a3b8" font-size="11" font-weight="700">Medium 1 (n₁ = 1.00, Fast v₁)</text>
        <text x="75" y="165" fill="#38bdf8" font-size="11" font-weight="700">Medium 2 (n₂ = 1.50, Slower v₂)</text>
        
        <!-- Normal Line -->
        <line x1="270" y1="50" x2="270" y2="240" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4"/>
        <text x="275" y="60" fill="#64748b" font-size="10">Normal</text>
        
        <!-- Incident Ray -->
        <line x1="130" y1="60" x2="270" y2="140" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
        <polygon points="205,102 195,95 200,107" fill="#f59e0b"/>
        
        <!-- Reflected Ray -->
        <line x1="270" y1="140" x2="410" y2="60" stroke="#f59e0b" stroke-width="2" stroke-dasharray="3" stroke-linecap="round"/>
        
        <!-- Refracted Ray (Bends toward normal) -->
        <line x1="270" y1="140" x2="350" y2="235" stroke="#10b981" stroke-width="3" stroke-linecap="round"/>
        <polygon points="315,193 318,183 310,189" fill="#10b981"/>
        
        <!-- Angle of Incidence θ1 -->
        <path d="M 270 95 A 45 45 0 0 0 235 120" fill="none" stroke="#f59e0b" stroke-width="1.5"/>
        <text x="245" y="90" fill="#f59e0b" font-size="10" font-weight="800">θ₁ = 45°</text>
        
        <!-- Angle of Refraction θ2 -->
        <path d="M 270 180 A 40 40 0 0 0 295 168" fill="none" stroke="#10b981" stroke-width="1.5"/>
        <text x="295" y="195" fill="#10b981" font-size="10" font-weight="800">θ₂ = 28°</text>
      </svg>`
    };
  }

  if (type === "cycle") {
    return {
      id: `phys_diag_cycle_m${m.id}_l${l.id}`,
      subject: "PHYS",
      moduleId: m.id,
      title: `${m.title} - ${l.title} Thermodynamic Heat Engine Cycle`,
      caption: `Figure ${m.id}.${l.id}C: Ideal P-V Thermodynamic Carnot & Reversible Cycle for ${l.title}`,
      svg: `<svg viewBox="0 0 540 280" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <rect width="540" height="280" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
        <text x="270" y="28" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Thermodynamic P-V Engine Cycle: ${l.title}</text>
        
        <!-- P-V Coordinate Axes -->
        <line x1="70" y1="230" x2="70" y2="45" stroke="#94a3b8" stroke-width="2"/>
        <line x1="60" y1="230" x2="490" y2="230" stroke="#94a3b8" stroke-width="2"/>
        <polygon points="70,40 65,50 75,50" fill="#94a3b8"/>
        <polygon points="495,230 485,225 485,235" fill="#94a3b8"/>
        <text x="25" y="130" fill="#38bdf8" font-size="11" font-weight="700" transform="rotate(-90 25 130)" text-anchor="middle">Pressure P (kPa)</text>
        <text x="280" y="255" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">Volume V (L)</text>
        
        <!-- Closed Loop Cycle (States 1 -> 2 -> 3 -> 4 -> 1) -->
        <!-- Path 1->2: Isothermal Expansion (Q_H In) -->
        <path d="M 140 70 Q 220 85 280 115" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
        <polygon points="215,92 205,88 208,98" fill="#ef4444"/>
        <text x="200" y="75" fill="#ef4444" font-size="10" font-weight="800">1→2: Q_H Absorbed (T_H)</text>
        
        <!-- Path 2->3: Adiabatic Expansion -->
        <path d="M 280 115 Q 360 160 410 200" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
        <polygon points="350,160 345,150 355,152" fill="#f59e0b"/>
        <text x="380" y="145" fill="#f59e0b" font-size="9.5" font-weight="700">2→3: Adiabatic</text>
        
        <!-- Path 3->4: Isothermal Compression (Q_C Out) -->
        <path d="M 410 200 Q 320 185 240 165" fill="none" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
        <polygon points="325,186 335,190 332,180" fill="#38bdf8"/>
        <text x="325" y="218" fill="#38bdf8" font-size="10" font-weight="800">3→4: Q_C Exhaust (T_C)</text>
        
        <!-- Path 4->1: Adiabatic Compression -->
        <path d="M 240 165 Q 180 115 140 70" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round"/>
        <polygon points="185,115 190,125 180,123" fill="#10b981"/>
        <text x="145" y="130" fill="#10b981" font-size="9.5" font-weight="700">4→1: Compression</text>
        
        <!-- States Markers -->
        <circle cx="140" cy="70" r="5" fill="#ef4444"/>
        <text x="130" y="65" fill="#ffffff" font-size="10" font-weight="800">1</text>
        <circle cx="280" cy="115" r="5" fill="#f59e0b"/>
        <text x="290" y="115" fill="#ffffff" font-size="10" font-weight="800">2</text>
        <circle cx="410" cy="200" r="5" fill="#38bdf8"/>
        <text x="420" y="200" fill="#ffffff" font-size="10" font-weight="800">3</text>
        <circle cx="240" cy="165" r="5" fill="#10b981"/>
        <text x="230" y="175" fill="#ffffff" font-size="10" font-weight="800">4</text>
        
        <!-- Enclosed Net Work Callout -->
        <text x="270" y="145" fill="#facc15" font-size="11" font-weight="900" text-anchor="middle">W_net = ∮ P·dV</text>
        <text x="270" y="160" fill="#94a3b8" font-size="9" text-anchor="middle">Efficiency η = 1 - T_C / T_H</text>
      </svg>`
    };
  }

  if (type === "spectrometry") {
    return {
      id: `phys_diag_spec_m${m.id}_l${l.id}`,
      subject: "PHYS",
      moduleId: m.id,
      title: `${m.title} - ${l.title} Wave Interference & Diffraction Intensity`,
      caption: `Figure ${m.id}.${l.id}I: Monochromatic Wave Interference Fringe Intensity Distribution for ${l.title}`,
      svg: `<svg viewBox="0 0 540 280" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <rect width="540" height="280" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
        <text x="270" y="28" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Wave Interference &amp; Spectral Intensity: ${l.title}</text>
        
        <!-- Intensity Baseline -->
        <line x1="70" y1="210" x2="490" y2="210" stroke="#94a3b8" stroke-width="2"/>
        <line x1="270" y1="220" x2="270" y2="50" stroke="#64748b" stroke-width="1" stroke-dasharray="3"/>
        <text x="270" y="44" fill="#f59e0b" font-size="10" font-weight="800" text-anchor="middle">Central Maximum (m = 0)</text>
        
        <!-- Intensity Distribution Curve (Sinc² Modulation + Cos² Fringes) -->
        <path d="M 70 210 Q 110 205 130 190 Q 150 170 170 205 Q 190 195 210 150 Q 230 110 250 190 Q 260 110 270 65 Q 280 110 290 190 Q 310 110 330 150 Q 350 195 370 205 Q 390 170 410 190 Q 430 205 470 210" fill="none" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
        
        <!-- Shaded Area Under Central Peak -->
        <path d="M 230 210 Q 250 190 260 110 Q 270 65 Q 280 110 290 190 Q 310 210 310 210 Z" fill="rgba(56, 189, 248, 0.2)"/>
        
        <!-- Order Callouts -->
        <text x="170" y="225" fill="#94a3b8" font-size="9" text-anchor="middle">m = -2</text>
        <text x="220" y="225" fill="#94a3b8" font-size="9" text-anchor="middle">m = -1</text>
        <text x="270" y="225" fill="#f59e0b" font-size="10" font-weight="800" text-anchor="middle">m = 0</text>
        <text x="320" y="225" fill="#94a3b8" font-size="9" text-anchor="middle">m = +1</text>
        <text x="370" y="225" fill="#94a3b8" font-size="9" text-anchor="middle">m = +2</text>
        
        <!-- Fringe Spacing Callout -->
        <line x1="270" y1="120" x2="320" y2="120" stroke="#f59e0b" stroke-width="1.5"/>
        <polygon points="270,120 276,117 276,123" fill="#f59e0b"/>
        <polygon points="320,120 314,117 314,123" fill="#f59e0b"/>
        <text x="295" y="112" fill="#f59e0b" font-size="9" font-weight="800" text-anchor="middle">Δy = λL / d</text>
        
        <text x="270" y="255" fill="#94a3b8" font-size="9.5" text-anchor="middle">Condition for Constructive Interference: d·sin(θ) = m·λ</text>
      </svg>`
    };
  }

  // Default: Kinematic or energy parabolic curve
  const yLabel = (m.id <= 3) ? "Position x (m)" : (m.id <= 6 ? "Force Vector F (N)" : (m.id <= 11 ? "Mechanical Energy (J)" : "Field Potential V"));
  const xLabel = (m.id <= 3) ? "Time t (s)" : (m.id <= 6 ? "Displacement s (m)" : (m.id <= 11 ? "Coordinate Position (m)" : "Distance r (m)"));

  return {
    id: `phys_diag_m${m.id}_l${l.id}`,
    subject: "PHYS",
    moduleId: m.id,
    title: `${m.title} - ${l.title} Vector & Energy Mechanics`,
    caption: `Figure ${m.id}.${l.id}: Precision Kinematic & Force Profile for ${l.title}`,
    svg: `<svg viewBox="0 0 540 280" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="280" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <line x1="70" y1="210" x2="490" y2="210" stroke="#1e293b" stroke-width="1"/>
      <line x1="70" y1="140" x2="490" y2="140" stroke="#1e293b" stroke-width="1" stroke-dasharray="3"/>
      <line x1="70" y1="70" x2="490" y2="70" stroke="#1e293b" stroke-width="1" stroke-dasharray="3"/>
      
      <line x1="70" y1="220" x2="70" y2="40" stroke="#94a3b8" stroke-width="2"/>
      <line x1="60" y1="210" x2="500" y2="210" stroke="#94a3b8" stroke-width="2"/>
      
      <polygon points="70,35 65,45 75,45" fill="#94a3b8"/>
      <polygon points="505,210 495,205 495,215" fill="#94a3b8"/>
      
      <text x="25" y="130" fill="#3b82f6" font-size="11" font-weight="700" transform="rotate(-90 25 130)" text-anchor="middle">${yLabel}</text>
      <text x="280" y="245" fill="#3b82f6" font-size="11" font-weight="700" text-anchor="middle">${xLabel}</text>
      
      <path d="M 70 210 Q 240 50 480 210" fill="none" stroke="#3b82f6" stroke-width="3.5" stroke-linecap="round"/>
      
      <line x1="180" y1="80" x2="300" y2="80" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4"/>
      <circle cx="240" cy="80" r="5.5" fill="#f59e0b"/>
      <text x="240" y="65" fill="#f59e0b" font-size="11" font-weight="800" text-anchor="middle">Point P: Slope = 0 (Apex)</text>
      
      <path d="M 70 210 Q 240 50 480 210 Z" fill="rgba(59, 130, 246, 0.12)"/>
      <text x="240" y="160" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">Work / Integral Area = ∫ F·ds</text>
    </svg>`
  };
}
