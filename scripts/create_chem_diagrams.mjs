// Edugates-ClipSAT Science Labs - Generator for 30 Authentic Chemistry Diagrams
import fs from "fs";
import { SCIENTIFIC_DIAGRAMS } from "../data/scientific-diagrams.js";

// Extract 7 existing CHEM diagrams from master
const existingIds = [
  "chem_heating_curve",
  "chem_titration_curve",
  "chem_energy_diagram",
  "chem_galvanic_cell",
  "chem_mass_spectrometry",
  "chem_le_chatelier_shifts",
  "chem_rutherford_gold_foil"
];

const chem30 = {};
for (const id of existingIds) {
  if (SCIENTIFIC_DIAGRAMS[id]) {
    chem30[id] = SCIENTIFIC_DIAGRAMS[id];
  } else {
    throw new Error(`Missing expected existing diagram: ${id}`);
  }
}

// 23 New Domain-Authentic Vector-Calibrated Chemistry Diagrams
const newChemDiagrams = {
  chem_phase_diagram: {
    id: "chem_phase_diagram",
    subject: "CHEM",
    moduleId: 3,
    title: "Water Phase Diagram: Pressure vs Temperature",
    caption: "Figure: Pressure-Temperature Phase Diagram of Water showing Triple Point and Critical Point",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="26" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Phase Diagram of Water (H₂O)</text>
      <line x1="70" y1="240" x2="490" y2="240" stroke="#94a3b8" stroke-width="2"/>
      <line x1="70" y1="240" x2="70" y2="40" stroke="#94a3b8" stroke-width="2"/>
      <polygon points="495,240 485,235 485,245" fill="#94a3b8"/>
      <polygon points="70,35 65,45 75,45" fill="#94a3b8"/>
      <text x="24" y="140" fill="#38bdf8" font-size="11" font-weight="700" transform="rotate(-90 24 140)" text-anchor="middle">Pressure P (atm, log)</text>
      <text x="280" y="272" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">Temperature T (°C)</text>
      <path d="M 70 235 Q 160 215 210 180" fill="none" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
      <path d="M 210 180 L 195 50" fill="none" stroke="#34d399" stroke-width="3" stroke-linecap="round"/>
      <path d="M 210 180 Q 320 140 440 65" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
      <circle cx="210" cy="180" r="5" fill="#ec4899" stroke="#ffffff" stroke-width="1.5"/>
      <text x="222" y="185" fill="#ec4899" font-size="10" font-weight="800">Triple Point (0.01°C, 0.006 atm)</text>
      <circle cx="440" cy="65" r="5" fill="#ef4444" stroke="#ffffff" stroke-width="1.5"/>
      <text x="440" y="52" fill="#ef4444" font-size="10" font-weight="800" text-anchor="middle">Critical Point (374°C, 218 atm)</text>
      <line x1="70" y1="120" x2="490" y2="120" stroke="#64748b" stroke-width="1" stroke-dasharray="4"/>
      <text x="62" y="124" fill="#94a3b8" font-size="9" text-anchor="end">1.0 atm</text>
      <circle cx="203" cy="120" r="3.5" fill="#34d399"/>
      <text x="203" y="112" fill="#34d399" font-size="9" font-weight="700" text-anchor="middle">Tm = 0°C</text>
      <circle cx="345" cy="120" r="3.5" fill="#f59e0b"/>
      <text x="345" y="112" fill="#f59e0b" font-size="9" font-weight="700" text-anchor="middle">Tb = 100°C</text>
      <rect x="110" y="90" width="60" height="24" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <text x="140" y="106" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">SOLID</text>
      <rect x="250" y="80" width="64" height="24" rx="4" fill="#1e293b" stroke="#34d399" stroke-width="1"/>
      <text x="282" y="96" fill="#34d399" font-size="11" font-weight="800" text-anchor="middle">LIQUID</text>
      <rect x="330" y="200" width="56" height="24" rx="4" fill="#1e293b" stroke="#f59e0b" stroke-width="1"/>
      <text x="358" y="216" fill="#f59e0b" font-size="11" font-weight="800" text-anchor="middle">GAS</text>
      <rect x="420" y="95" width="105" height="22" rx="4" fill="#1e293b" stroke="#a855f7" stroke-width="1"/>
      <text x="472" y="110" fill="#c084fc" font-size="9" font-weight="700" text-anchor="middle">Supercritical Fluid</text>
    </svg>`
  },

  chem_bohr_emission_spectra: {
    id: "chem_bohr_emission_spectra",
    subject: "CHEM",
    moduleId: 5,
    title: "Bohr Model Hydrogen Electronic Transitions",
    caption: "Figure: Quantized Energy Levels and Balmer Series Emission Transitions in Hydrogen",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Bohr Hydrogen Emission Series (Balmer &amp; Lyman)</text>
      <line x1="80" y1="240" x2="480" y2="240" stroke="#38bdf8" stroke-width="2.5"/>
      <text x="65" y="244" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="end">n = 1</text>
      <text x="490" y="244" fill="#94a3b8" font-size="10">-13.6 eV (Ground)</text>
      <line x1="80" y1="160" x2="480" y2="160" stroke="#34d399" stroke-width="2"/>
      <text x="65" y="164" fill="#34d399" font-size="11" font-weight="800" text-anchor="end">n = 2</text>
      <text x="490" y="164" fill="#94a3b8" font-size="10">-3.40 eV</text>
      <line x1="80" y1="110" x2="480" y2="110" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="65" y="114" fill="#f59e0b" font-size="11" font-weight="800" text-anchor="end">n = 3</text>
      <text x="490" y="114" fill="#94a3b8" font-size="10">-1.51 eV</text>
      <line x1="80" y1="80" x2="480" y2="80" stroke="#a855f7" stroke-width="1.5"/>
      <text x="65" y="84" fill="#a855f7" font-size="11" font-weight="800" text-anchor="end">n = 4</text>
      <text x="490" y="84" fill="#94a3b8" font-size="10">-0.85 eV</text>
      <line x1="80" y1="60" x2="480" y2="60" stroke="#ec4899" stroke-width="1.2"/>
      <text x="65" y="64" fill="#ec4899" font-size="10" font-weight="700" text-anchor="end">n = 5</text>
      <text x="490" y="64" fill="#94a3b8" font-size="10">-0.54 eV</text>
      <line x1="140" y1="110" x2="140" y2="155" stroke="#ef4444" stroke-width="2.5"/>
      <polygon points="140,160 136,150 144,150" fill="#ef4444"/>
      <text x="140" y="138" fill="#ef4444" font-size="9" font-weight="800" text-anchor="end">656 nm (Red) </text>
      <line x1="220" y1="80" x2="220" y2="155" stroke="#06b6d4" stroke-width="2.5"/>
      <polygon points="220,160 216,150 224,150" fill="#06b6d4"/>
      <text x="220" y="122" fill="#06b6d4" font-size="9" font-weight="800" text-anchor="end">486 nm (Cyan) </text>
      <line x1="300" y1="60" x2="300" y2="155" stroke="#3b82f6" stroke-width="2.5"/>
      <polygon points="300,160 296,150 304,150" fill="#3b82f6"/>
      <text x="300" y="112" fill="#3b82f6" font-size="9" font-weight="800" text-anchor="end">434 nm (Blue) </text>
      <line x1="400" y1="160" x2="400" y2="235" stroke="#a855f7" stroke-width="2"/>
      <polygon points="400,240 396,230 404,230" fill="#a855f7"/>
      <text x="400" y="200" fill="#c084fc" font-size="9" font-weight="700" text-anchor="middle">Lyman α (121.6 nm, UV)</text>
      <rect x="100" y="262" width="340" height="24" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <text x="270" y="278" fill="#f8fafc" font-size="10" font-weight="700" text-anchor="middle">ΔE = E_final - E_initial = -hc / λ = hν</text>
    </svg>`
  },

  chem_periodic_trends: {
    id: "chem_periodic_trends",
    subject: "CHEM",
    moduleId: 6,
    title: "Periodic Trends: Atomic Radius & Electronegativity",
    caption: "Figure: Principal Periodic Trends across Periods and Groups in the Periodic Table",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Major Periodic Trends Architecture</text>
      <path d="M 60 70 L 110 70 L 110 120 L 370 120 L 370 70 L 460 70 L 460 210 L 60 210 Z" fill="#1e293b" stroke="#64748b" stroke-width="2"/>
      <line x1="110" y1="120" x2="110" y2="210" stroke="#334155" stroke-width="1"/>
      <line x1="370" y1="120" x2="370" y2="210" stroke="#334155" stroke-width="1"/>
      <text x="85" y="160" fill="#94a3b8" font-size="10" font-weight="700" text-anchor="middle">s-block</text>
      <text x="240" y="165" fill="#94a3b8" font-size="10" font-weight="700" text-anchor="middle">d-block (Transition Metals)</text>
      <text x="415" y="160" fill="#94a3b8" font-size="10" font-weight="700" text-anchor="middle">p-block</text>
      <text x="75" y="90" fill="#38bdf8" font-size="9" font-weight="800">H</text>
      <text x="445" y="90" fill="#f59e0b" font-size="9" font-weight="800">He</text>
      <text x="70" y="200" fill="#34d399" font-size="9" font-weight="800">Fr</text>
      <text x="430" y="110" fill="#ef4444" font-size="9" font-weight="800">F</text>
      <line x1="120" y1="52" x2="445" y2="52" stroke="#ef4444" stroke-width="2.5"/>
      <polygon points="450,52 440,48 440,56" fill="#ef4444"/>
      <text x="280" y="46" fill="#ef4444" font-size="10" font-weight="800" text-anchor="middle">Electronegativity &amp; Ionization Energy Increases →</text>
      <line x1="480" y1="205" x2="480" y2="65" stroke="#ef4444" stroke-width="2.5"/>
      <polygon points="480,60 476,70 484,70" fill="#ef4444"/>
      <text x="495" y="135" fill="#ef4444" font-size="10" font-weight="800" transform="rotate(90 495 135)" text-anchor="middle">Ionization Energy Increases</text>
      <line x1="440" y1="230" x2="75" y2="230" stroke="#34d399" stroke-width="2.5"/>
      <polygon points="70,230 80,226 80,234" fill="#34d399"/>
      <text x="255" y="244" fill="#34d399" font-size="10" font-weight="800" text-anchor="middle">← Atomic Radius &amp; Metallic Character Increases</text>
      <line x1="42" y1="75" x2="42" y2="205" stroke="#34d399" stroke-width="2.5"/>
      <polygon points="42,210 38,200 46,200" fill="#34d399"/>
      <text x="30" y="145" fill="#34d399" font-size="10" font-weight="800" transform="rotate(-90 30 145)" text-anchor="middle">Atomic Radius Increases</text>
      <rect x="70" y="260" width="400" height="26" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <text x="270" y="277" fill="#f8fafc" font-size="9.5" font-weight="700" text-anchor="middle">Effective Nuclear Charge Z_eff increases right; Principal Quantum Number n increases down</text>
    </svg>`
  },

  chem_ionic_lattice_unit_cell: {
    id: "chem_ionic_lattice_unit_cell",
    subject: "CHEM",
    moduleId: 7,
    title: "Sodium Chloride (NaCl) Crystal Unit Cell",
    caption: "Figure: Face-Centered Cubic (FCC) Ionic Crystal Lattice with Octahedral Coordination",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Sodium Chloride (NaCl) Face-Centered Cubic (FCC) Lattice</text>
      <rect x="150" y="90" width="140" height="140" fill="none" stroke="#64748b" stroke-width="1.5"/>
      <rect x="230" y="50" width="140" height="140" fill="none" stroke="#475569" stroke-width="1.2" stroke-dasharray="3"/>
      <line x1="150" y1="90" x2="230" y2="50" stroke="#64748b" stroke-width="1.5"/>
      <line x1="290" y1="90" x2="370" y2="50" stroke="#64748b" stroke-width="1.5"/>
      <line x1="150" y1="230" x2="230" y2="190" stroke="#475569" stroke-width="1.2" stroke-dasharray="3"/>
      <line x1="290" y1="230" x2="370" y2="190" stroke="#64748b" stroke-width="1.5"/>
      <circle cx="150" cy="90" r="10" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="290" cy="90" r="10" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="150" cy="230" r="10" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="290" cy="230" r="10" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="220" cy="160" r="10" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="230" cy="50" r="9" fill="#10b981" opacity="0.8"/>
      <circle cx="370" cy="50" r="9" fill="#10b981" opacity="0.8"/>
      <circle cx="370" cy="190" r="9" fill="#10b981" opacity="0.8"/>
      <circle cx="220" cy="90" r="6.5" fill="#a855f7" stroke="#ffffff" stroke-width="1.2"/>
      <circle cx="150" cy="160" r="6.5" fill="#a855f7" stroke="#ffffff" stroke-width="1.2"/>
      <circle cx="290" cy="160" r="6.5" fill="#a855f7" stroke="#ffffff" stroke-width="1.2"/>
      <circle cx="220" cy="230" r="6.5" fill="#a855f7" stroke="#ffffff" stroke-width="1.2"/>
      <circle cx="260" cy="140" r="7" fill="#a855f7" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="330" cy="120" r="6.5" fill="#a855f7" opacity="0.9"/>
      <rect x="400" y="80" width="125" height="150" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
      <text x="462" y="102" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">LATTICE KEY</text>
      <circle cx="420" cy="125" r="9" fill="#10b981" stroke="#ffffff" stroke-width="1"/>
      <text x="438" y="129" fill="#f8fafc" font-size="10" font-weight="700">Cl⁻ (r = 181 pm)</text>
      <circle cx="420" cy="155" r="6.5" fill="#a855f7" stroke="#ffffff" stroke-width="1"/>
      <text x="438" y="159" fill="#f8fafc" font-size="10" font-weight="700">Na⁺ (r = 102 pm)</text>
      <text x="462" y="185" fill="#cbd5e1" font-size="9" text-anchor="middle">Coordination: 6:6</text>
      <text x="462" y="200" fill="#34d399" font-size="9" font-weight="700" text-anchor="middle">4 Na⁺ &amp; 4 Cl⁻ / cell</text>
      <text x="462" y="215" fill="#f59e0b" font-size="9" text-anchor="middle">Edge a = 564 pm</text>
      <text x="270" y="275" fill="#cbd5e1" font-size="10" font-weight="600" text-anchor="middle">High lattice energy (787 kJ/mol) confers high melting point (801°C) and brittle cleavage planes</text>
    </svg>`
  },

  chem_vsepr_molecular_geometries: {
    id: "chem_vsepr_molecular_geometries",
    subject: "CHEM",
    moduleId: 8,
    title: "VSEPR Fundamental Molecular Geometries",
    caption: "Figure: Valence Shell Electron Pair Repulsion Geometries and Ideal Bond Angles",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">VSEPR Theory: 4 Fundamental Molecular Shapes</text>
      <rect x="20" y="45" width="115" height="210" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
      <text x="77" y="66" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">LINEAR</text>
      <line x1="35" y1="130" x2="120" y2="130" stroke="#64748b" stroke-width="3"/>
      <circle cx="77" cy="130" r="10" fill="#38bdf8"/>
      <circle cx="40" cy="130" r="8" fill="#ef4444"/>
      <circle cx="115" cy="130" r="8" fill="#ef4444"/>
      <path d="M 55 120 A 20 20 0 0 1 100 120" fill="none" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="77" y="112" fill="#f59e0b" font-size="9" font-weight="700" text-anchor="middle">180°</text>
      <text x="77" y="195" fill="#f8fafc" font-size="10" font-weight="700" text-anchor="middle">CO₂ / BeCl₂</text>
      <text x="77" y="235" fill="#34d399" font-size="9" font-weight="700" text-anchor="middle">Nonpolar</text>
      <rect x="145" y="45" width="115" height="210" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
      <text x="202" y="66" fill="#38bdf8" font-size="10.5" font-weight="800" text-anchor="middle">TRIGONAL PLANAR</text>
      <line x1="202" y1="130" x2="202" y2="95" stroke="#64748b" stroke-width="3"/>
      <line x1="202" y1="130" x2="170" y2="155" stroke="#64748b" stroke-width="3"/>
      <line x1="202" y1="130" x2="234" y2="155" stroke="#64748b" stroke-width="3"/>
      <circle cx="202" cy="130" r="10" fill="#38bdf8"/>
      <circle cx="202" cy="95" r="7.5" fill="#10b981"/>
      <circle cx="170" cy="155" r="7.5" fill="#10b981"/>
      <circle cx="234" cy="155" r="7.5" fill="#10b981"/>
      <text x="225" y="118" fill="#f59e0b" font-size="9" font-weight="700">120°</text>
      <text x="202" y="195" fill="#f8fafc" font-size="10" font-weight="700" text-anchor="middle">BF₃ / SO₃</text>
      <text x="202" y="235" fill="#34d399" font-size="9" font-weight="700" text-anchor="middle">Nonpolar</text>
      <rect x="270" y="45" width="115" height="210" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
      <text x="327" y="66" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">TETRAHEDRAL</text>
      <line x1="327" y1="130" x2="327" y2="95" stroke="#64748b" stroke-width="3"/>
      <line x1="327" y1="130" x2="295" y2="155" stroke="#64748b" stroke-width="3"/>
      <polygon points="327,130 355,160 348,165" fill="#64748b"/>
      <line x1="327" y1="130" x2="350" y2="120" stroke="#64748b" stroke-width="2" stroke-dasharray="2"/>
      <circle cx="327" cy="130" r="10" fill="#38bdf8"/>
      <circle cx="327" cy="95" r="7" fill="#cbd5e1"/>
      <circle cx="295" cy="155" r="7" fill="#cbd5e1"/>
      <circle cx="355" cy="162" r="7" fill="#cbd5e1"/>
      <circle cx="350" cy="120" r="6" fill="#cbd5e1"/>
      <text x="312" y="115" fill="#f59e0b" font-size="9" font-weight="700">109.5°</text>
      <text x="327" y="195" fill="#f8fafc" font-size="10" font-weight="700" text-anchor="middle">CH₄ / CCl₄</text>
      <text x="327" y="235" fill="#34d399" font-size="9" font-weight="700" text-anchor="middle">Nonpolar</text>
      <rect x="395" y="45" width="125" height="210" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
      <text x="457" y="66" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">BENT / ANGULAR</text>
      <path d="M 450 115 C 445 95 455 95 457 115" fill="none" stroke="#a855f7" stroke-width="1.5" stroke-dasharray="2"/>
      <path d="M 464 115 C 475 95 465 95 457 115" fill="none" stroke="#a855f7" stroke-width="1.5" stroke-dasharray="2"/>
      <line x1="457" y1="130" x2="425" y2="155" stroke="#64748b" stroke-width="3"/>
      <line x1="457" y1="130" x2="489" y2="155" stroke="#64748b" stroke-width="3"/>
      <circle cx="457" cy="130" r="10" fill="#ef4444"/>
      <circle cx="425" cy="155" r="7" fill="#cbd5e1"/>
      <circle cx="489" cy="155" r="7" fill="#cbd5e1"/>
      <text x="457" y="165" fill="#f59e0b" font-size="9" font-weight="700" text-anchor="middle">104.5°</text>
      <text x="457" y="195" fill="#f8fafc" font-size="10" font-weight="700" text-anchor="middle">H₂O</text>
      <text x="457" y="235" fill="#ef4444" font-size="9" font-weight="700" text-anchor="middle">Polar (Net μ &gt; 0)</text>
      <text x="270" y="278" fill="#cbd5e1" font-size="10" font-weight="600" text-anchor="middle">Lone pair - lone pair repulsion &gt; lone pair - bonding pair &gt; bonding pair - bonding pair</text>
    </svg>`
  },

  chem_gas_laws_boyle_charles: {
    id: "chem_gas_laws_boyle_charles",
    subject: "CHEM",
    moduleId: 13,
    title: "Gas Laws: Boyle's Law & Charles's Law",
    caption: "Figure: Pressure vs Inverse Volume (Boyle) and Volume vs Temperature with Absolute Zero Extrapolation (Charles)",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Fundamental Ideal Gas Relationships</text>
      <rect x="25" y="42" width="235" height="215" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
      <text x="142" y="62" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">Boyle's Law: P vs 1/V (Constant T)</text>
      <line x1="55" y1="220" x2="240" y2="220" stroke="#94a3b8" stroke-width="1.5"/>
      <line x1="55" y1="220" x2="55" y2="80" stroke="#94a3b8" stroke-width="1.5"/>
      <text x="40" y="150" fill="#94a3b8" font-size="9" transform="rotate(-90 40 150)" text-anchor="middle">Pressure P</text>
      <text x="145" y="235" fill="#94a3b8" font-size="9" text-anchor="middle">1 / Volume (1/V)</text>
      <line x1="55" y1="220" x2="225" y2="90" stroke="#34d399" stroke-width="2.5"/>
      <circle cx="55" cy="220" r="3.5" fill="#34d399"/>
      <circle cx="140" cy="155" r="3.5" fill="#34d399"/>
      <circle cx="225" cy="90" r="3.5" fill="#34d399"/>
      <text x="145" y="130" fill="#34d399" font-size="9.5" font-weight="700">P ∝ 1/V (PV = k)</text>
      <rect x="280" y="42" width="235" height="215" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
      <text x="397" y="62" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">Charles's Law: V vs T (Constant P)</text>
      <line x1="300" y1="220" x2="495" y2="220" stroke="#94a3b8" stroke-width="1.5"/>
      <line x1="390" y1="220" x2="390" y2="80" stroke="#94a3b8" stroke-width="1.5"/>
      <text x="380" y="150" fill="#94a3b8" font-size="9" transform="rotate(-90 380 150)" text-anchor="middle">Volume V</text>
      <text x="445" y="235" fill="#94a3b8" font-size="9" text-anchor="middle">Temp (°C)</text>
      <line x1="315" y1="220" x2="390" y2="175" stroke="#f59e0b" stroke-width="2" stroke-dasharray="3"/>
      <line x1="390" y1="175" x2="485" y2="95" stroke="#f59e0b" stroke-width="2.5"/>
      <circle cx="315" cy="220" r="3.5" fill="#ef4444"/>
      <text x="315" y="244" fill="#ef4444" font-size="8.5" font-weight="700" text-anchor="middle">-273.15°C (0 K)</text>
      <circle cx="390" cy="175" r="3.5" fill="#f59e0b"/>
      <text x="395" y="190" fill="#94a3b8" font-size="8.5">0°C (V₀)</text>
      <text x="440" y="130" fill="#f59e0b" font-size="9.5" font-weight="700">V₁/T₁ = V₂/T₂</text>
      <rect x="70" y="265" width="400" height="24" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <text x="270" y="281" fill="#f8fafc" font-size="10" font-weight="700" text-anchor="middle">Ideal Gas Equation: PV = nRT (R = 0.08206 L·atm/(mol·K) = 8.314 J/(mol·K))</text>
    </svg>`
  },

  chem_maxwell_boltzmann_distribution: {
    id: "chem_maxwell_boltzmann_distribution",
    subject: "CHEM",
    moduleId: 12,
    title: "Maxwell-Boltzmann Molecular Speed Distribution",
    caption: "Figure: Molecular Velocity Distribution at Temperatures T1 and T2 showing Activation Energy Barrier",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Maxwell-Boltzmann Distribution &amp; Reaction Kinetics</text>
      <line x1="60" y1="240" x2="490" y2="240" stroke="#94a3b8" stroke-width="2"/>
      <line x1="60" y1="240" x2="60" y2="45" stroke="#94a3b8" stroke-width="2"/>
      <polygon points="495,240 485,235 485,245" fill="#94a3b8"/>
      <polygon points="60,40 55,50 65,50" fill="#94a3b8"/>
      <text x="22" y="145" fill="#38bdf8" font-size="11" font-weight="700" transform="rotate(-90 22 145)" text-anchor="middle">Fraction of Molecules f(v)</text>
      <text x="275" y="272" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">Molecular Kinetic Energy E / Speed v</text>
      <path d="M 60 240 C 100 235 120 70 170 70 C 220 70 260 210 380 238 L 470 240" fill="none" stroke="#38bdf8" stroke-width="3"/>
      <path d="M 60 240 C 110 235 170 130 230 130 C 300 130 350 200 480 238" fill="none" stroke="#ef4444" stroke-width="3"/>
      <path d="M 360 205 C 390 215 430 230 480 238 L 480 240 L 360 240 Z" fill="#ef4444" fill-opacity="0.3"/>
      <line x1="360" y1="50" x2="360" y2="240" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4"/>
      <text x="360" y="44" fill="#f59e0b" font-size="11" font-weight="800" text-anchor="middle">Activation Energy (Ea)</text>
      <text x="170" y="60" fill="#38bdf8" font-size="10.5" font-weight="800" text-anchor="middle">T₁ (Lower Temp)</text>
      <text x="235" y="120" fill="#ef4444" font-size="10.5" font-weight="800" text-anchor="middle">T₂ (Higher Temp, T₂ &gt; T₁)</text>
      <rect x="375" y="160" width="135" height="34" rx="4" fill="#1e293b" stroke="#f59e0b" stroke-width="1"/>
      <text x="442" y="174" fill="#f59e0b" font-size="8.5" font-weight="800" text-anchor="middle">E ≥ Ea (Reactive Collisions)</text>
      <text x="442" y="187" fill="#cbd5e1" font-size="8" text-anchor="middle">Fraction increases at T₂</text>
    </svg>`
  },

  chem_solubility_curves: {
    id: "chem_solubility_curves",
    subject: "CHEM",
    moduleId: 14,
    title: "Solubility Curves of Inorganic Salts in Water",
    caption: "Figure: Solubility (g solute / 100g H2O) vs Temperature for KNO3, NaCl, and Ce2(SO4)3",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Solubility Curves of Salts vs. Temperature</text>
      <line x1="70" y1="240" x2="490" y2="240" stroke="#94a3b8" stroke-width="2"/>
      <line x1="70" y1="240" x2="70" y2="40" stroke="#94a3b8" stroke-width="2"/>
      <polygon points="495,240 485,235 485,245" fill="#94a3b8"/>
      <polygon points="70,35 65,45 75,45" fill="#94a3b8"/>
      <text x="24" y="140" fill="#38bdf8" font-size="10.5" font-weight="700" transform="rotate(-90 24 140)" text-anchor="middle">Solubility (g salt / 100g H₂O)</text>
      <text x="280" y="272" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">Temperature (°C)</text>
      <!-- Grid Ticks -->
      <text x="60" y="244" fill="#94a3b8" font-size="9" text-anchor="end">0</text>
      <text x="60" y="190" fill="#94a3b8" font-size="9" text-anchor="end">40</text>
      <text x="60" y="130" fill="#94a3b8" font-size="9" text-anchor="end">80</text>
      <text x="60" y="70" fill="#94a3b8" font-size="9" text-anchor="end">120</text>
      <text x="70" y="254" fill="#94a3b8" font-size="9" text-anchor="middle">0°C</text>
      <text x="170" y="254" fill="#94a3b8" font-size="9" text-anchor="middle">25°C</text>
      <text x="280" y="254" fill="#94a3b8" font-size="9" text-anchor="middle">50°C</text>
      <text x="390" y="254" fill="#94a3b8" font-size="9" text-anchor="middle">75°C</text>
      <text x="480" y="254" fill="#94a3b8" font-size="9" text-anchor="middle">100°C</text>
      <!-- KNO3 (Steep rise, cyan) -->
      <path d="M 70 220 Q 250 180 390 60" fill="none" stroke="#38bdf8" stroke-width="3"/>
      <text x="400" y="55" fill="#38bdf8" font-size="10" font-weight="800">KNO₃ (Steep Endothermic)</text>
      <!-- NaCl (Nearly flat line, emerald) -->
      <line x1="70" y1="195" x2="480" y2="188" stroke="#34d399" stroke-width="3"/>
      <text x="485" y="192" fill="#34d399" font-size="10" font-weight="800">NaCl (~38g, Flat)</text>
      <!-- Ce2(SO4)3 (Retrograde decrease, amber) -->
      <path d="M 70 215 Q 260 225 480 235" fill="none" stroke="#f59e0b" stroke-width="2.5"/>
      <text x="350" y="230" fill="#f59e0b" font-size="9.5" font-weight="800">Ce₂(SO₄)₃ (Retrograde Exothermic)</text>
      <!-- Zone Badges -->
      <rect x="180" y="90" width="130" height="22" rx="4" fill="#1e293b" stroke="#ec4899" stroke-width="1"/>
      <text x="245" y="105" fill="#f472b6" font-size="9" font-weight="700" text-anchor="middle">Supersaturated Zone</text>
      <rect x="230" y="205" width="120" height="20" rx="4" fill="#1e293b" stroke="#64748b" stroke-width="1"/>
      <text x="290" y="219" fill="#94a3b8" font-size="8.5" text-anchor="middle">Unsaturated Zone</text>
    </svg>`
  },

  chem_coffee_cup_calorimeter: {
    id: "chem_coffee_cup_calorimeter",
    subject: "CHEM",
    moduleId: 15,
    title: "Constant-Pressure Coffee-Cup Solution Calorimeter",
    caption: "Figure: Cross-Sectional Schematic of Laboratory Coffee-Cup Calorimeter for Heat of Reaction (ΔH)",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Constant-Pressure Coffee Cup Calorimeter (q = mcΔT)</text>
      <!-- Outer Polystyrene Cup -->
      <polygon points="175,70 195,240 285,240 305,70" fill="#334155" stroke="#94a3b8" stroke-width="2"/>
      <!-- Inner Polystyrene Cup (nested) -->
      <polygon points="182,75 200,235 280,235 298,75" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
      <!-- Solution in cup -->
      <polygon points="185,130 200,235 280,235 295,130" fill="#0284c7" fill-opacity="0.4"/>
      <!-- Styrofoam Cover Lid -->
      <rect x="165" y="60" width="150" height="15" rx="3" fill="#475569" stroke="#94a3b8" stroke-width="1.5"/>
      <!-- Precision Thermometer -->
      <rect x="220" y="35" width="8" height="160" rx="2" fill="#e2e8f0" stroke="#64748b" stroke-width="1"/>
      <circle cx="224" cy="195" r="6" fill="#ef4444"/>
      <!-- Wire Spiral Stirrer -->
      <path d="M 260 40 L 260 160 Q 250 170 260 180 Q 270 190 260 200" fill="none" stroke="#94a3b8" stroke-width="2"/>
      <!-- Callout Labels -->
      <line x1="165" y1="68" x2="90" y2="68" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="85" y="72" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="end">Insulated Styrofoam Lid</text>
      <line x1="224" y1="35" x2="224" y2="28" stroke="#ef4444" stroke-width="1.5"/>
      <line x1="224" y1="28" x2="160" y2="28" stroke="#ef4444" stroke-width="1.5"/>
      <text x="155" y="32" fill="#ef4444" font-size="10" font-weight="700" text-anchor="end">Thermometer (ΔT)</text>
      <line x1="260" y1="40" x2="360" y2="40" stroke="#94a3b8" stroke-width="1.5"/>
      <text x="365" y="44" fill="#94a3b8" font-size="10" font-weight="700">Glass / Wire Stirrer</text>
      <line x1="175" y1="180" x2="90" y2="180" stroke="#34d399" stroke-width="1.5"/>
      <text x="85" y="184" fill="#34d399" font-size="10" font-weight="700" text-anchor="end">Nested Nested Foam Cups</text>
      <line x1="295" y1="170" x2="360" y2="170" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="365" y="174" fill="#38bdf8" font-size="10" font-weight="700">Aqueous Reaction Mix</text>
      <!-- Formula Banner -->
      <rect x="70" y="258" width="400" height="28" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <text x="270" y="276" fill="#f8fafc" font-size="10" font-weight="700" text-anchor="middle">q_reaction = -(m_soln · c_s · ΔT + C_cal · ΔT) = ΔH_rxn at const P</text>
    </svg>`
  },

  chem_arrhenius_kinetics: {
    id: "chem_arrhenius_kinetics",
    subject: "CHEM",
    moduleId: 16,
    title: "Arrhenius Activation Energy Kinetics Plot",
    caption: "Figure: Linear Arrhenius Plot of ln(k) vs Reciprocal Absolute Temperature (1/T) determining Ea",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Arrhenius Equation: Activation Energy Determination</text>
      <line x1="80" y1="240" x2="490" y2="240" stroke="#94a3b8" stroke-width="2"/>
      <line x1="80" y1="240" x2="80" y2="40" stroke="#94a3b8" stroke-width="2"/>
      <polygon points="495,240 485,235 485,245" fill="#94a3b8"/>
      <polygon points="80,35 75,45 85,45" fill="#94a3b8"/>
      <text x="26" y="140" fill="#38bdf8" font-size="11" font-weight="700" transform="rotate(-90 26 140)" text-anchor="middle">Natural Log of Rate Constant ln(k)</text>
      <text x="285" y="272" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">Reciprocal Absolute Temperature 1/T (10⁻³ K⁻¹)</text>
      <!-- Straight Linear Arrhenius Line (Negative slope = -Ea/R) -->
      <line x1="80" y1="65" x2="460" y2="225" stroke="#ef4444" stroke-width="3"/>
      <!-- Intercept on y-axis -->
      <circle cx="80" cy="65" r="4.5" fill="#38bdf8"/>
      <text x="92" y="68" fill="#38bdf8" font-size="10" font-weight="800">y-intercept = ln(A)</text>
      <!-- Data Points -->
      <circle cx="170" cy="103" r="4" fill="#f59e0b"/>
      <circle cx="260" cy="141" r="4" fill="#f59e0b"/>
      <circle cx="350" cy="179" r="4" fill="#f59e0b"/>
      <circle cx="440" cy="217" r="4" fill="#f59e0b"/>
      <!-- Slope Triangle -->
      <line x1="170" y1="179" x2="350" y2="179" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3"/>
      <line x1="170" y1="103" x2="170" y2="179" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3"/>
      <text x="260" y="194" fill="#94a3b8" font-size="9" text-anchor="middle">Δ(1/T)</text>
      <text x="155" y="145" fill="#94a3b8" font-size="9" text-anchor="end">Δln(k)</text>
      <!-- Slope Callout Box -->
      <rect x="280" y="85" width="200" height="50" rx="6" fill="#1e293b" stroke="#ef4444" stroke-width="1.5"/>
      <text x="380" y="105" fill="#ef4444" font-size="11" font-weight="800" text-anchor="middle">Slope m = -Ea / R</text>
      <text x="380" y="123" fill="#f8fafc" font-size="9.5" text-anchor="middle">Ea = -Slope × 8.314 J/(mol·K)</text>
    </svg>`
  },

  chem_electrolytic_cell: {
    id: "chem_electrolytic_cell",
    subject: "CHEM",
    moduleId: 18,
    title: "Downs Cell Electrolysis of Molten NaCl",
    caption: "Figure: Industrial Electrolytic Cell producing Metallic Sodium and Chlorine Gas from Molten Salt",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Downs Cell: Electrolysis of Molten NaCl (Nonspontaneous)</text>
      <!-- Outer Industrial Steel Tank -->
      <rect x="80" y="65" width="380" height="185" rx="8" fill="#1e293b" stroke="#64748b" stroke-width="2"/>
      <!-- Molten Electrolyte (600°C NaCl + CaCl2) -->
      <rect x="90" y="100" width="360" height="140" fill="#f59e0b" fill-opacity="0.25"/>
      <!-- Central Carbon Anode (+) -->
      <rect x="250" y="90" width="40" height="145" rx="3" fill="#334155" stroke="#94a3b8" stroke-width="1.5"/>
      <text x="270" y="165" fill="#ffffff" font-size="9.5" font-weight="800" text-anchor="middle">Anode (+)</text>
      <text x="270" y="180" fill="#38bdf8" font-size="8.5" text-anchor="middle">Graphite</text>
      <!-- Cylindrical Iron Cathode (-) Rings (Left and Right) -->
      <rect x="130" y="110" width="30" height="120" rx="3" fill="#475569" stroke="#94a3b8" stroke-width="1.5"/>
      <rect x="380" y="110" width="30" height="120" rx="3" fill="#475569" stroke="#94a3b8" stroke-width="1.5"/>
      <text x="145" y="170" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">Cathode (-)</text>
      <text x="395" y="170" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">Cathode (-)</text>
      <!-- Chlorine Gas Hood over Anode -->
      <path d="M 230 90 L 230 65 L 310 65 L 310 90 Z" fill="#065f46" stroke="#10b981" stroke-width="1.5"/>
      <text x="270" y="55" fill="#34d399" font-size="10" font-weight="800" text-anchor="middle">Cl₂(g) Out</text>
      <!-- Liquid Sodium Collector over Cathodes -->
      <path d="M 115 110 L 115 85 L 175 85 L 175 110 Z" fill="#78350f" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="145" y="78" fill="#f59e0b" font-size="9.5" font-weight="800" text-anchor="middle">Liquid Na(l)</text>
      <!-- Reaction equations callout -->
      <rect x="60" y="258" width="420" height="28" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
      <text x="270" y="276" fill="#f8fafc" font-size="9.5" font-weight="700" text-anchor="middle">Anode: 2Cl⁻ → Cl₂(g) + 2e⁻ (Ox) | Cathode: 2Na⁺ + 2e⁻ → 2Na(l) (Red)</text>
    </svg>`
  },

  chem_standard_hydrogen_electrode: {
    id: "chem_standard_hydrogen_electrode",
    subject: "CHEM",
    moduleId: 19,
    title: "Standard Hydrogen Electrode (SHE Reference Half-Cell)",
    caption: "Figure: Standard Hydrogen Electrode defining E° = 0.000 V at 298 K, 1 atm H2, and 1.0 M H+",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Standard Hydrogen Electrode (SHE: E° = 0.00 V)</text>
      <!-- Glass Beaker -->
      <rect x="150" y="90" width="240" height="150" rx="4" fill="#1e293b" stroke="#64748b" stroke-width="2"/>
      <!-- Acid Solution 1.00 M H+ -->
      <rect x="155" y="130" width="230" height="105" fill="#0284c7" fill-opacity="0.3"/>
      <text x="270" y="225" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">1.00 M H⁺(aq) Solution (pH = 0.00)</text>
      <!-- Glass Tube Jacket -->
      <rect x="250" y="45" width="40" height="145" rx="3" fill="#334155" fill-opacity="0.5" stroke="#94a3b8" stroke-width="1.5"/>
      <!-- H2 Gas Inflow Pipe -->
      <line x1="200" y1="65" x2="250" y2="65" stroke="#94a3b8" stroke-width="2"/>
      <polygon points="248,65 240,61 240,69" fill="#94a3b8"/>
      <text x="195" y="60" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="end">H₂(g) at 1.00 atm</text>
      <!-- Pt Wire and Platinized Pt Foil -->
      <line x1="270" y1="40" x2="270" y2="175" stroke="#e2e8f0" stroke-width="2"/>
      <rect x="260" y="175" width="20" height="25" fill="#475569" stroke="#ffffff" stroke-width="1.5"/>
      <text x="295" y="190" fill="#f8fafc" font-size="9" font-weight="700">Pt Foil (Black)</text>
      <!-- Bubbles of H2 gas -->
      <circle cx="265" cy="155" r="3" fill="#38bdf8" opacity="0.7"/>
      <circle cx="275" cy="145" r="3.5" fill="#38bdf8" opacity="0.7"/>
      <circle cx="263" cy="135" r="4" fill="#38bdf8" opacity="0.7"/>
      <!-- Half-Reaction Callout Box -->
      <rect x="80" y="255" width="380" height="30" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <text x="270" y="274" fill="#f8fafc" font-size="10" font-weight="700" text-anchor="middle">2H⁺(aq, 1.0 M) + 2e⁻ ⇌ H₂(g, 1.0 atm)   E° ≡ 0.000 V</text>
    </svg>`
  },

  chem_radioactive_decay_penetration: {
    id: "chem_radioactive_decay_penetration",
    subject: "CHEM",
    moduleId: 20,
    title: "Radiation Shielding: Alpha, Beta, & Gamma Penetration",
    caption: "Figure: Penetrating Power and Attenuation of Alpha (Paper), Beta (Aluminum), and Gamma (Lead) Radiation",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Penetrating Power: Alpha, Beta, and Gamma Rays</text>
      <!-- Radioactive Source Box -->
      <rect x="30" y="60" width="55" height="180" rx="6" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
      <circle cx="57" cy="150" r="14" fill="#f59e0b"/>
      <text x="57" y="154" fill="#0f172a" font-size="10" font-weight="800" text-anchor="middle">☢</text>
      <text x="57" y="90" fill="#f59e0b" font-size="9" font-weight="800" text-anchor="middle">Source</text>
      <!-- Barrier 1: Paper -->
      <rect x="180" y="55" width="10" height="190" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
      <text x="185" y="45" fill="#f8fafc" font-size="10" font-weight="700" text-anchor="middle">Paper</text>
      <!-- Barrier 2: Aluminum Sheet -->
      <rect x="300" y="55" width="18" height="190" fill="#94a3b8" stroke="#cbd5e1" stroke-width="1"/>
      <text x="309" y="45" fill="#f8fafc" font-size="10" font-weight="700" text-anchor="middle">Aluminum (5mm)</text>
      <!-- Barrier 3: Lead Brick -->
      <rect x="420" y="55" width="40" height="190" fill="#475569" stroke="#64748b" stroke-width="1"/>
      <text x="440" y="45" fill="#f8fafc" font-size="10" font-weight="700" text-anchor="middle">Lead (10cm)</text>
      <!-- Alpha Ray (Stopped by paper) -->
      <line x1="85" y1="95" x2="180" y2="95" stroke="#ef4444" stroke-width="3.5"/>
      <polygon points="180,95 170,91 170,99" fill="#ef4444"/>
      <text x="125" y="88" fill="#ef4444" font-size="10" font-weight="800">α (⁴₂He²⁺)</text>
      <!-- Beta Ray (Passes paper, stopped by Al) -->
      <line x1="85" y1="145" x2="300" y2="145" stroke="#38bdf8" stroke-width="2.5"/>
      <polygon points="300,145 290,141 290,149" fill="#38bdf8"/>
      <text x="125" y="138" fill="#38bdf8" font-size="10" font-weight="800">β⁻ (e⁻)</text>
      <!-- Gamma Ray (Passes paper, Al, attenuated in lead) -->
      <path d="M 85 195 Q 110 185 135 195 T 185 195 T 235 195 T 285 195 T 335 195 T 385 195 T 435 195" fill="none" stroke="#a855f7" stroke-width="2"/>
      <text x="125" y="188" fill="#c084fc" font-size="10" font-weight="800">γ (Photon)</text>
      <rect x="50" y="258" width="440" height="28" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <text x="270" y="276" fill="#f8fafc" font-size="9.5" font-weight="700" text-anchor="middle">Ionizing Power: α &gt; β &gt; γ  |  Penetrating Power: γ &gt;&gt; β &gt;&gt; α</text>
    </svg>`
  },

  chem_half_life_decay_curve: {
    id: "chem_half_life_decay_curve",
    subject: "CHEM",
    moduleId: 21,
    title: "Radioactive Half-Life Exponential Decay Curve",
    caption: "Figure: Exponential Decay of Radioactive Parent Nuclei N(t)/N0 over Five Consecutive Half-Lives",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Radioactive Decay Kinetics: Half-Life (t₁/₂)</text>
      <line x1="80" y1="240" x2="490" y2="240" stroke="#94a3b8" stroke-width="2"/>
      <line x1="80" y1="240" x2="80" y2="45" stroke="#94a3b8" stroke-width="2"/>
      <polygon points="495,240 485,235 485,245" fill="#94a3b8"/>
      <polygon points="80,40 75,50 85,50" fill="#94a3b8"/>
      <text x="26" y="145" fill="#38bdf8" font-size="11" font-weight="700" transform="rotate(-90 26 145)" text-anchor="middle">Remaining Parent Nuclei (%)</text>
      <text x="285" y="272" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">Elapsed Half-Lives (t / t₁/₂)</text>
      <!-- Y-Axis Ticks -->
      <text x="70" y="65" fill="#94a3b8" font-size="9" text-anchor="end">100%</text>
      <text x="70" y="152" fill="#34d399" font-size="9" font-weight="700" text-anchor="end">50%</text>
      <text x="70" y="197" fill="#f59e0b" font-size="9" font-weight="700" text-anchor="end">25%</text>
      <text x="70" y="219" fill="#ef4444" font-size="9" font-weight="700" text-anchor="end">12.5%</text>
      <!-- X-Axis Ticks -->
      <text x="80" y="254" fill="#94a3b8" font-size="9" text-anchor="middle">0</text>
      <text x="160" y="254" fill="#34d399" font-size="9" font-weight="700" text-anchor="middle">1</text>
      <text x="240" y="254" fill="#f59e0b" font-size="9" font-weight="700" text-anchor="middle">2</text>
      <text x="320" y="254" fill="#ef4444" font-size="9" font-weight="700" text-anchor="middle">3</text>
      <text x="400" y="254" fill="#94a3b8" font-size="9" text-anchor="middle">4</text>
      <text x="470" y="254" fill="#94a3b8" font-size="9" text-anchor="middle">5</text>
      <!-- Exponential Decay Curve -->
      <path d="M 80 60 Q 140 135 160 150 Q 210 185 240 195 Q 290 213 320 217 Q 370 225 470 234" fill="none" stroke="#38bdf8" stroke-width="3"/>
      <circle cx="80" cy="60" r="4" fill="#38bdf8"/>
      <circle cx="160" cy="150" r="4.5" fill="#34d399"/>
      <circle cx="240" cy="195" r="4.5" fill="#f59e0b"/>
      <circle cx="320" cy="217" r="4.5" fill="#ef4444"/>
      <!-- Coordinate Drop Lines -->
      <line x1="160" y1="150" x2="160" y2="240" stroke="#64748b" stroke-width="1" stroke-dasharray="3"/>
      <line x1="80" y1="150" x2="160" y2="150" stroke="#64748b" stroke-width="1" stroke-dasharray="3"/>
      <rect x="270" y="70" width="200" height="45" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <text x="370" y="90" fill="#38bdf8" font-size="10.5" font-weight="800" text-anchor="middle">N(t) = N₀ · (1/2)^(t / t₁/₂)</text>
      <text x="370" y="106" fill="#cbd5e1" font-size="9" text-anchor="middle">ln(2) / k = 0.693 / k</text>
    </svg>`
  },

  chem_fractional_distillation: {
    id: "chem_fractional_distillation",
    subject: "CHEM",
    moduleId: 22,
    title: "Fractional Distillation Laboratory Apparatus",
    caption: "Figure: Separation of Miscible Volatile Liquids via Fractionating Column and Liebig Condenser",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="22" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Fractional Distillation Apparatus</text>
      <!-- Distilling Flask with Liquid -->
      <circle cx="120" cy="210" r="35" fill="#1e293b" stroke="#94a3b8" stroke-width="2"/>
      <path d="M 88 220 Q 120 245 152 220 Z" fill="#f59e0b" fill-opacity="0.5"/>
      <!-- Heating Mantle -->
      <path d="M 80 225 Q 120 260 160 225 Z" fill="#ef4444" stroke="#f87171" stroke-width="1.5"/>
      <!-- Vigreux Fractionating Column -->
      <rect x="110" y="80" width="20" height="100" fill="#1e293b" stroke="#94a3b8" stroke-width="1.5"/>
      <line x1="110" y1="100" x2="125" y2="105" stroke="#94a3b8" stroke-width="1.5"/>
      <line x1="130" y1="120" x2="115" y2="125" stroke="#94a3b8" stroke-width="1.5"/>
      <line x1="110" y1="140" x2="125" y2="145" stroke="#94a3b8" stroke-width="1.5"/>
      <!-- Thermometer at Stillhead -->
      <rect x="117" y="40" width="6" height="50" rx="1.5" fill="#e2e8f0"/>
      <circle cx="120" cy="90" r="4" fill="#ef4444"/>
      <text x="105" y="55" fill="#ef4444" font-size="8.5" font-weight="700" text-anchor="end">78.3°C</text>
      <!-- Liebig Condenser (Inclined) -->
      <line x1="130" y1="85" x2="340" y2="190" stroke="#0284c7" stroke-width="14" stroke-linecap="round"/>
      <line x1="130" y1="85" x2="340" y2="190" stroke="#e2e8f0" stroke-width="4" stroke-linecap="round"/>
      <text x="245" y="125" fill="#38bdf8" font-size="9.5" font-weight="800">Liebig Condenser (Cooling Jacket)</text>
      <!-- Receiving Erlenmeyer Flask -->
      <polygon points="360,205 340,265 400,265 380,205" fill="#1e293b" stroke="#94a3b8" stroke-width="2"/>
      <polygon points="345,250 340,265 400,265 395,250" fill="#38bdf8" fill-opacity="0.6"/>
      <text x="370" y="280" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">Pure Distillate</text>
      <!-- Callouts -->
      <text x="40" y="240" fill="#f59e0b" font-size="9" font-weight="700">Binary Mix</text>
      <text x="140" y="145" fill="#cbd5e1" font-size="8.5">Fractionating Packing</text>
    </svg>`
  },

  chem_thin_layer_chromatography: {
    id: "chem_thin_layer_chromatography",
    subject: "CHEM",
    moduleId: 23,
    title: "Thin-Layer Chromatography (TLC Plate Retention Factor)",
    caption: "Figure: TLC Separation Plate illustrating Retention Factor (Rf) Calculation from Solvent Front",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Thin-Layer Chromatography (TLC): Rf Factor</text>
      <!-- Developing Chamber Beaker -->
      <rect x="80" y="45" width="200" height="215" rx="6" fill="#1e293b" stroke="#64748b" stroke-width="2"/>
      <!-- Solvent pool at base -->
      <rect x="85" y="235" width="190" height="20" fill="#0284c7" fill-opacity="0.3"/>
      <!-- Silica TLC Plate Inside Chamber -->
      <rect x="130" y="60" width="100" height="180" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5"/>
      <!-- Origin Pencil Line -->
      <line x1="130" y1="210" x2="230" y2="210" stroke="#475569" stroke-width="1.5" stroke-dasharray="2"/>
      <text x="122" y="213" fill="#94a3b8" font-size="8.5" text-anchor="end">Origin</text>
      <!-- Solvent Front Line -->
      <line x1="130" y1="80" x2="230" y2="80" stroke="#0284c7" stroke-width="2"/>
      <text x="122" y="83" fill="#0284c7" font-size="8.5" font-weight="700" text-anchor="end">Solvent Front</text>
      <!-- Separated Spots on Plate -->
      <!-- Spot A (Less polar, moves faster with mobile phase) -->
      <circle cx="180" cy="115" r="6" fill="#f59e0b"/>
      <text x="195" y="118" fill="#f59e0b" font-size="9" font-weight="800">Spot A</text>
      <!-- Spot B (More polar, adheres to silica stationary phase) -->
      <circle cx="180" cy="170" r="6" fill="#ec4899"/>
      <text x="195" y="173" fill="#ec4899" font-size="9" font-weight="800">Spot B</text>
      <!-- Mathematical Calculation Panel on Right -->
      <rect x="310" y="55" width="200" height="195" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <text x="410" y="80" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">RETENTION FACTOR (Rf)</text>
      <text x="330" y="110" fill="#f8fafc" font-size="10" font-weight="700">Rf = d_spot / d_solvent</text>
      <text x="330" y="135" fill="#94a3b8" font-size="9">Total d_solvent = 10.0 cm</text>
      <text x="330" y="155" fill="#f59e0b" font-size="9" font-weight="700">d_A = 7.3 cm → Rf = 0.73</text>
      <text x="330" y="175" fill="#ec4899" font-size="9" font-weight="700">d_B = 3.1 cm → Rf = 0.31</text>
      <text x="330" y="210" fill="#34d399" font-size="8.5">Stationary: Silica Gel (Polar)</text>
      <text x="330" y="225" fill="#cbd5e1" font-size="8.5">Mobile: Organic Solvent</text>
    </svg>`
  },

  chem_beer_lambert_spectrophotometry: {
    id: "chem_beer_lambert_spectrophotometry",
    subject: "CHEM",
    moduleId: 24,
    title: "Beer-Lambert Law Spectrophotometer Optical Path",
    caption: "Figure: Spectrophotometric Optical Bench: Monochromator, Cuvette Pathlength b, and Detector (A = εbc)",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Beer-Lambert Law Spectrophotometry (A = εbc)</text>
      <!-- Light Source -->
      <circle cx="50" cy="140" r="16" fill="#facc15" stroke="#f59e0b" stroke-width="2"/>
      <text x="50" y="175" fill="#facc15" font-size="9" font-weight="700" text-anchor="middle">Tungsten Lamp</text>
      <!-- Polychromatic Beam -->
      <polygon points="66,140 130,120 130,160" fill="#fef08a" opacity="0.3"/>
      <!-- Monochromator Prism -->
      <polygon points="140,110 180,140 140,170" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
      <text x="150" y="100" fill="#38bdf8" font-size="9" text-anchor="middle">Prism</text>
      <!-- Wavelength Selector Slit -->
      <rect x="205" y="100" width="6" height="30" fill="#64748b"/>
      <rect x="205" y="150" width="6" height="30" fill="#64748b"/>
      <!-- Monochromatic Incident Beam I0 -->
      <line x1="211" y1="140" x2="280" y2="140" stroke="#06b6d4" stroke-width="5"/>
      <text x="245" y="130" fill="#06b6d4" font-size="10" font-weight="800" text-anchor="middle">I₀ (Incident)</text>
      <!-- Sample Cuvette -->
      <rect x="280" y="105" width="50" height="70" rx="3" fill="#0284c7" fill-opacity="0.5" stroke="#ffffff" stroke-width="2"/>
      <text x="305" y="190" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">Cuvette (b = 1 cm)</text>
      <text x="305" y="145" fill="#ffffff" font-size="8.5" font-weight="700" text-anchor="middle">c (mol/L)</text>
      <!-- Transmitted Beam I < I0 -->
      <line x1="330" y1="140" x2="420" y2="140" stroke="#06b6d4" stroke-width="2.5" opacity="0.6"/>
      <text x="375" y="130" fill="#06b6d4" font-size="10" font-weight="800" text-anchor="middle">I (Transmitted)</text>
      <!-- Photodetector -->
      <rect x="420" y="115" width="30" height="50" rx="4" fill="#334155" stroke="#10b981" stroke-width="2"/>
      <text x="435" y="145" fill="#10b981" font-size="9" font-weight="800" text-anchor="middle">Sensor</text>
      <!-- Digital Meter / Absorbance Display -->
      <rect x="470" y="120" width="50" height="40" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="495" y="144" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">A = 0.43</text>
      <!-- Beer's Law Banner -->
      <rect x="70" y="258" width="400" height="28" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <text x="270" y="276" fill="#f8fafc" font-size="10" font-weight="700" text-anchor="middle">Absorbance A = log₁₀(I₀ / I) = ε · b · c  (Linear vs Concentration c)</text>
    </svg>`
  },

  chem_vapor_pressure_raoult: {
    id: "chem_vapor_pressure_raoult",
    subject: "CHEM",
    moduleId: 25,
    title: "Raoult's Law Ideal Binary Solution Vapor Pressure",
    caption: "Figure: Vapor Pressure Diagram for Ideal Binary Liquid Mixture A and B as a Function of Mole Fraction",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Raoult's Law: Ideal Binary Solution Vapor Pressure</text>
      <!-- Frame & Coordinate Axes -->
      <rect x="90" y="60" width="360" height="180" fill="none" stroke="#64748b" stroke-width="2"/>
      <text x="40" y="150" fill="#38bdf8" font-size="10" font-weight="700" transform="rotate(-90 40 150)" text-anchor="middle">Vapor Pressure (torr)</text>
      <text x="270" y="265" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">Mole Fraction of Component A (X_A)</text>
      <text x="90" y="255" fill="#94a3b8" font-size="9" text-anchor="middle">0.0 (Pure B)</text>
      <text x="450" y="255" fill="#94a3b8" font-size="9" text-anchor="middle">1.0 (Pure A)</text>
      <!-- Pure Vapor Pressures P_A° and P_B° -->
      <text x="80" y="160" fill="#34d399" font-size="9" font-weight="700" text-anchor="end">P_B° = 120 torr</text>
      <text x="460" y="90" fill="#f59e0b" font-size="9" font-weight="700">P_A° = 240 torr</text>
      <!-- Partial Pressure Lines -->
      <line x1="90" y1="240" x2="450" y2="85" stroke="#f59e0b" stroke-width="2" stroke-dasharray="3"/>
      <text x="320" y="170" fill="#f59e0b" font-size="9.5" font-weight="700">P_A = X_A · P_A°</text>
      <line x1="90" y1="155" x2="450" y2="240" stroke="#34d399" stroke-width="2" stroke-dasharray="3"/>
      <text x="170" y="210" fill="#34d399" font-size="9.5" font-weight="700">P_B = X_B · P_B°</text>
      <!-- Total Vapor Pressure Line -->
      <line x1="90" y1="155" x2="450" y2="85" stroke="#38bdf8" stroke-width="3"/>
      <text x="270" y="110" fill="#38bdf8" font-size="10.5" font-weight="800" text-anchor="middle">P_total = P_A + P_B (Ideal Solution)</text>
    </svg>`
  },

  chem_redox_hoffmann_voltameter: {
    id: "chem_redox_hoffmann_voltameter",
    subject: "CHEM",
    moduleId: 18,
    title: "Hoffmann Voltameter for Water Electrolysis",
    caption: "Figure: Quantitative Electrolysis of Water producing 2:1 Volume Ratio of H2 and O2 Gases",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="22" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Hoffmann Voltameter: Water Electrolysis (2 H₂O → 2 H₂ + O₂)</text>
      <!-- Central Reservoir Column -->
      <rect x="255" y="45" width="30" height="180" fill="#1e293b" stroke="#94a3b8" stroke-width="1.5"/>
      <circle cx="270" cy="55" r="22" fill="#0284c7" fill-opacity="0.3" stroke="#94a3b8" stroke-width="1.5"/>
      <text x="270" y="58" fill="#38bdf8" font-size="8.5" font-weight="700" text-anchor="middle">Acid H₂O</text>
      <!-- Cathode Arm (Left - 2 vols of H2) -->
      <rect x="160" y="70" width="25" height="155" fill="#1e293b" stroke="#94a3b8" stroke-width="1.5"/>
      <!-- Trapped H2 gas (large headspace) -->
      <rect x="162" y="72" width="21" height="60" fill="#0284c7" fill-opacity="0.6"/>
      <text x="172" y="105" fill="#38bdf8" font-size="9" font-weight="800" text-anchor="middle">2V H₂</text>
      <!-- Anode Arm (Right - 1 vol of O2) -->
      <rect x="355" y="70" width="25" height="155" fill="#1e293b" stroke="#94a3b8" stroke-width="1.5"/>
      <!-- Trapped O2 gas (half headspace) -->
      <rect x="357" y="72" width="21" height="30" fill="#10b981" fill-opacity="0.6"/>
      <text x="367" y="90" fill="#34d399" font-size="9" font-weight="800" text-anchor="middle">1V O₂</text>
      <!-- Connecting cross-tubes at bottom -->
      <rect x="160" y="210" width="220" height="15" fill="#1e293b" stroke="#94a3b8" stroke-width="1.5"/>
      <!-- Platinum Electrodes at Base -->
      <rect x="168" y="215" width="8" height="20" fill="#e2e8f0"/>
      <rect x="363" y="215" width="8" height="20" fill="#e2e8f0"/>
      <!-- DC Circuit connection -->
      <line x1="172" y1="235" x2="172" y2="255" stroke="#ef4444" stroke-width="2"/>
      <line x1="367" y1="235" x2="367" y2="255" stroke="#38bdf8" stroke-width="2"/>
      <rect x="235" y="245" width="70" height="25" rx="4" fill="#334155" stroke="#64748b" stroke-width="1"/>
      <text x="270" y="261" fill="#facc15" font-size="10" font-weight="800" text-anchor="middle">DC Battery</text>
      <line x1="172" y1="255" x2="235" y2="255" stroke="#ef4444" stroke-width="2"/>
      <line x1="367" y1="255" x2="305" y2="255" stroke="#38bdf8" stroke-width="2"/>
      <!-- Ratio Badge -->
      <text x="270" y="285" fill="#f8fafc" font-size="10" font-weight="700" text-anchor="middle">Avogadro Principle: Volume Ratio V(H₂) : V(O₂) = 2 : 1 exactly</text>
    </svg>`
  },

  chem_gravimetric_vacuum_filtration: {
    id: "chem_gravimetric_vacuum_filtration",
    subject: "CHEM",
    moduleId: 10,
    title: "Gravimetric Analysis Büchner Vacuum Filtration",
    caption: "Figure: Rapid Quantitative Suction Filtration Apparatus for Gravimetric Precipitate Isolation",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Gravimetric Vacuum Filtration Apparatus (Büchner Funnel)</text>
      <!-- Büchner Funnel (Porcelain) -->
      <polygon points="180,50 280,50 250,110 210,110" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
      <rect x="225" y="110" width="10" height="35" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
      <line x1="195" y1="90" x2="265" y2="90" stroke="#475569" stroke-width="2"/>
      <text x="230" y="85" fill="#ef4444" font-size="9" font-weight="800" text-anchor="middle">Filter Paper &amp; Precipitate</text>
      <!-- Rubber Adapter Collar -->
      <polygon points="215,120 245,120 240,135 220,135" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
      <!-- Heavy Wall Filter Flask with Side Arm -->
      <polygon points="210,135 250,135 295,245 165,245" fill="#1e293b" stroke="#64748b" stroke-width="2"/>
      <path d="M 250,150 L 305,150 L 305,160 L 250,160" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
      <!-- Vacuum Hose to Aspirator -->
      <line x1="305" y1="155" x2="430" y2="155" stroke="#ef4444" stroke-width="5" stroke-linecap="round"/>
      <text x="440" y="160" fill="#ef4444" font-size="10" font-weight="800">To Vacuum Pump</text>
      <!-- Clear Filtrate in Flask -->
      <polygon points="175,235 285,235 270,200 190,200" fill="#0284c7" fill-opacity="0.3"/>
      <text x="230" y="225" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">Clear Filtrate</text>
      <rect x="60" y="260" width="420" height="26" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <text x="270" y="277" fill="#f8fafc" font-size="9.5" font-weight="700" text-anchor="middle">Reduced pressure under filter paper accelerates liquid withdrawal without loss of solid</text>
    </svg>`
  },

  chem_limiting_reactant_particles: {
    id: "chem_limiting_reactant_particles",
    subject: "CHEM",
    moduleId: 11,
    title: "Limiting Reactant Nanoscale Particulate Model",
    caption: "Figure: Molecular Representation of 2H2 + O2 -> 2H2O showing Limiting Reagent and Excess Molecule",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Stoichiometric Limiting Reactant Model (2 H₂ + O₂ → 2 H₂O)</text>
      <!-- Container A: Before Reaction -->
      <rect x="30" y="50" width="200" height="190" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
      <text x="130" y="70" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">BEFORE REACTION</text>
      <!-- 6 H2 molecules (pairs of small white spheres) -->
      <circle cx="65" cy="100" r="5" fill="#ffffff"/><circle cx="73" cy="100" r="5" fill="#ffffff"/>
      <circle cx="115" cy="95" r="5" fill="#ffffff"/><circle cx="123" cy="95" r="5" fill="#ffffff"/>
      <circle cx="170" cy="105" r="5" fill="#ffffff"/><circle cx="178" cy="105" r="5" fill="#ffffff"/>
      <circle cx="65" cy="150" r="5" fill="#ffffff"/><circle cx="73" cy="150" r="5" fill="#ffffff"/>
      <circle cx="115" cy="160" r="5" fill="#ffffff"/><circle cx="123" cy="160" r="5" fill="#ffffff"/>
      <circle cx="165" cy="155" r="5" fill="#ffffff"/><circle cx="173" cy="155" r="5" fill="#ffffff"/>
      <text x="130" y="195" fill="#ffffff" font-size="10" font-weight="700" text-anchor="middle">6 H₂ Molecules</text>
      <!-- 4 O2 molecules (pairs of red spheres) -->
      <circle cx="80" cy="125" r="8" fill="#ef4444"/><circle cx="93" cy="125" r="8" fill="#ef4444"/>
      <circle cx="150" cy="130" r="8" fill="#ef4444"/><circle cx="163" cy="130" r="8" fill="#ef4444"/>
      <text x="130" y="225" fill="#ef4444" font-size="10" font-weight="700" text-anchor="middle">4 O₂ Molecules</text>
      <!-- Reaction Arrow -->
      <line x1="240" y1="145" x2="295" y2="145" stroke="#f59e0b" stroke-width="3"/>
      <polygon points="300,145 290,140 290,150" fill="#f59e0b"/>
      <!-- Container B: After Reaction -->
      <rect x="310" y="50" width="200" height="190" rx="8" fill="#1e293b" stroke="#34d399" stroke-width="2"/>
      <text x="410" y="70" fill="#34d399" font-size="11" font-weight="800" text-anchor="middle">AFTER REACTION</text>
      <!-- 6 H2O molecules (bent red + 2 white) -->
      <circle cx="350" cy="100" r="8" fill="#ef4444"/><circle cx="344" cy="94" r="4.5" fill="#ffffff"/><circle cx="356" cy="94" r="4.5" fill="#ffffff"/>
      <circle cx="410" cy="105" r="8" fill="#ef4444"/><circle cx="404" cy="99" r="4.5" fill="#ffffff"/><circle cx="416" cy="99" r="4.5" fill="#ffffff"/>
      <circle cx="470" cy="100" r="8" fill="#ef4444"/><circle cx="464" cy="94" r="4.5" fill="#ffffff"/><circle cx="476" cy="94" r="4.5" fill="#ffffff"/>
      <circle cx="360" cy="150" r="8" fill="#ef4444"/><circle cx="354" cy="144" r="4.5" fill="#ffffff"/><circle cx="366" cy="144" r="4.5" fill="#ffffff"/>
      <circle cx="420" cy="155" r="8" fill="#ef4444"/><circle cx="414" cy="149" r="4.5" fill="#ffffff"/><circle cx="426" cy="149" r="4.5" fill="#ffffff"/>
      <circle cx="470" cy="150" r="8" fill="#ef4444"/><circle cx="464" cy="144" r="4.5" fill="#ffffff"/><circle cx="476" cy="144" r="4.5" fill="#ffffff"/>
      <text x="410" y="195" fill="#34d399" font-size="10" font-weight="800" text-anchor="middle">6 H₂O Product Molecules</text>
      <!-- 1 Excess O2 molecule -->
      <circle cx="410" cy="220" r="8" fill="#ef4444"/><circle cx="423" cy="220" r="8" fill="#ef4444"/>
      <text x="410" y="238" fill="#f59e0b" font-size="9" font-weight="700" text-anchor="middle">1 Excess O₂ Remaining</text>
      <!-- Bottom Conclusion -->
      <rect x="50" y="258" width="440" height="28" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <text x="270" y="276" fill="#f8fafc" font-size="9.5" font-weight="700" text-anchor="middle">H₂ is the Limiting Reactant (completely consumed); O₂ is the Excess Reactant</text>
    </svg>`
  },

  chem_ph_indicator_spectrum: {
    id: "chem_ph_indicator_spectrum",
    subject: "CHEM",
    moduleId: 17,
    title: "Acid-Base Universal Indicator pH Spectrum",
    caption: "Figure: Chromatic Transition Ranges for Methyl Orange, Bromothymol Blue, and Phenolphthalein across pH 0-14",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">pH Scale &amp; Acid-Base Indicator Transition Ranges</text>
      <!-- Horizontal Master pH Ribbon (0 to 14) -->
      <defs>
        <linearGradient id="phGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ef4444"/>
          <stop offset="25%" stop-color="#f59e0b"/>
          <stop offset="50%" stop-color="#10b981"/>
          <stop offset="75%" stop-color="#0284c7"/>
          <stop offset="100%" stop-color="#7c3aed"/>
        </linearGradient>
      </defs>
      <rect x="60" y="55" width="420" height="30" rx="4" fill="url(#phGrad)" stroke="#cbd5e1" stroke-width="1.5"/>
      <!-- pH numbers -->
      <text x="60" y="100" fill="#ef4444" font-size="10" font-weight="800">pH 0</text>
      <text x="270" y="100" fill="#10b981" font-size="10" font-weight="800" text-anchor="middle">pH 7 (Neutral)</text>
      <text x="480" y="100" fill="#a855f7" font-size="10" font-weight="800" text-anchor="end">pH 14</text>
      <!-- Indicator 1: Methyl Orange (pH 3.1 - 4.4) -->
      <rect x="60" y="120" width="93" height="22" fill="#ef4444" rx="3"/>
      <rect x="153" y="120" width="39" height="22" fill="#f59e0b" rx="3"/>
      <rect x="192" y="120" width="288" height="22" fill="#fef08a" rx="3"/>
      <text x="70" y="135" fill="#ffffff" font-size="9" font-weight="800">Methyl Orange</text>
      <text x="172" y="135" fill="#0f172a" font-size="8.5" font-weight="800" text-anchor="middle">3.1 - 4.4</text>
      <!-- Indicator 2: Bromothymol Blue (pH 6.0 - 7.6) -->
      <rect x="60" y="160" width="180" height="22" fill="#facc15" rx="3"/>
      <rect x="240" y="160" width="48" height="22" fill="#10b981" rx="3"/>
      <rect x="288" y="160" width="192" height="22" fill="#0284c7" rx="3"/>
      <text x="70" y="175" fill="#0f172a" font-size="9" font-weight="800">Bromothymol Blue</text>
      <text x="264" y="175" fill="#ffffff" font-size="8.5" font-weight="800" text-anchor="middle">6.0 - 7.6</text>
      <!-- Indicator 3: Phenolphthalein (pH 8.2 - 10.0) -->
      <rect x="60" y="200" width="246" height="22" fill="#e2e8f0" rx="3"/>
      <rect x="306" y="200" width="54" height="22" fill="#f472b6" rx="3"/>
      <rect x="360" y="200" width="120" height="22" fill="#db2777" rx="3"/>
      <text x="70" y="215" fill="#334155" font-size="9" font-weight="800">Phenolphthalein (Colorless)</text>
      <text x="333" y="215" fill="#0f172a" font-size="8.5" font-weight="800" text-anchor="middle">8.2 - 10</text>
      <text x="420" y="215" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">Pink / Magenta</text>
      <!-- Summary -->
      <rect x="60" y="255" width="420" height="28" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <text x="270" y="273" fill="#f8fafc" font-size="9.5" font-weight="700" text-anchor="middle">pH = -log₁₀[H⁺]  |  pOH = -log₁₀[OH⁻]  |  pH + pOH = 14.00 at 25°C</text>
    </svg>`
  },

  chem_colligative_freezing_depression: {
    id: "chem_colligative_freezing_depression",
    subject: "CHEM",
    moduleId: 14,
    title: "Colligative Properties: Freezing Point Depression",
    caption: "Figure: Solvent vs Solution Vapor Pressure Curves showing Freezing Point Depression ΔTf and Boiling Elevation ΔTb",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Colligative Properties: Freezing Depression &amp; Boiling Elevation</text>
      <line x1="70" y1="240" x2="490" y2="240" stroke="#94a3b8" stroke-width="2"/>
      <line x1="70" y1="240" x2="70" y2="40" stroke="#94a3b8" stroke-width="2"/>
      <polygon points="495,240 485,235 485,245" fill="#94a3b8"/>
      <polygon points="70,35 65,45 75,45" fill="#94a3b8"/>
      <text x="24" y="140" fill="#38bdf8" font-size="11" font-weight="700" transform="rotate(-90 24 140)" text-anchor="middle">Vapor Pressure P</text>
      <text x="280" y="272" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">Temperature T (°C)</text>
      <!-- 1 atm Reference Line -->
      <line x1="70" y1="100" x2="490" y2="100" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3"/>
      <text x="62" y="104" fill="#94a3b8" font-size="9" text-anchor="end">1 atm</text>
      <!-- Pure Solvent Curves (Solid blue) -->
      <path d="M 70 230 Q 150 180 220 100" fill="none" stroke="#38bdf8" stroke-width="3"/>
      <path d="M 220 100 Q 300 70 420 50" fill="none" stroke="#38bdf8" stroke-width="3"/>
      <circle cx="220" cy="100" r="4" fill="#38bdf8"/>
      <text x="220" y="88" fill="#38bdf8" font-size="9.5" font-weight="800" text-anchor="middle">Tb° (Pure)</text>
      <!-- Solution Curves (Dashed orange, shifted right/down) -->
      <path d="M 70 238 Q 180 200 270 100" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="4"/>
      <circle cx="270" cy="100" r="4" fill="#f59e0b"/>
      <text x="270" y="88" fill="#f59e0b" font-size="9.5" font-weight="800" text-anchor="middle">Tb (Solution)</text>
      <!-- Boiling Elevation Delta Tb -->
      <line x1="220" y1="120" x2="270" y2="120" stroke="#ef4444" stroke-width="2"/>
      <polygon points="220,120 225,117 225,123" fill="#ef4444"/>
      <polygon points="270,120 265,117 265,123" fill="#ef4444"/>
      <text x="245" y="135" fill="#ef4444" font-size="9.5" font-weight="800" text-anchor="middle">ΔTb = i·Kb·m</text>
      <!-- Freezing Points -->
      <circle cx="150" cy="180" r="3.5" fill="#38bdf8"/>
      <circle cx="115" cy="205" r="3.5" fill="#f59e0b"/>
      <line x1="115" y1="215" x2="150" y2="215" stroke="#34d399" stroke-width="2"/>
      <text x="132" y="230" fill="#34d399" font-size="9" font-weight="800" text-anchor="middle">ΔTf = i·Kf·m</text>
      <rect x="70" y="258" width="400" height="26" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <text x="270" y="275" fill="#f8fafc" font-size="9.5" font-weight="700" text-anchor="middle">Nonvolatile solute lowers solvent vapor pressure, expanding liquid stability range</text>
    </svg>`
  }
};

// Merge all 30
for (const [k, v] of Object.entries(newChemDiagrams)) {
  chem30[k] = v;
}

console.log("Total CHEM diagrams ready:", Object.keys(chem30).length);

const outContent = `// Edugates-ClipSAT Science Labs - Master Chemistry Diagrams Bank (30 Authentic Models)
// Calibrated, authentic vector illustrations for all Inspire Chemistry curriculum modules.

export const CHEM_DIAGRAMS = ${JSON.stringify(chem30, null, 2)};
`;

fs.writeFileSync("./data/diagrams-chem.js", outContent, "utf-8");
console.log("Successfully wrote ./data/diagrams-chem.js with 30 diagrams!");
