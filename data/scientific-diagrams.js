// Edugates-ClipSAT Science Labs - Master Scientific Diagrams & Visual Models
// High-fidelity, precision vector SVG illustrations for diagram-based assessment questions.
// Completely avoids generic drawings; features calibrated axes, accurate scientific symbols,
// coordinate labels, and authentic laboratory/phenomenon models.

export const SCIENTIFIC_DIAGRAMS = {
  // ==========================================
  // CHEMISTRY DIAGRAMS
  // ==========================================

  chem_heating_curve: {
    id: "chem_heating_curve",
    subject: "CHEM",
    moduleId: 2,
    title: "Heating Curve of Pure Substance X",
    caption: "Figure 1: Temperature vs Heat Input for Substance X at 1.0 atm",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <!-- Grid Lines -->
      <line x1="70" y1="240" x2="490" y2="240" stroke="#1e293b" stroke-width="1"/>
      <line x1="70" y1="190" x2="490" y2="190" stroke="#1e293b" stroke-width="1" stroke-dasharray="4"/>
      <line x1="70" y1="110" x2="490" y2="110" stroke="#1e293b" stroke-width="1" stroke-dasharray="4"/>
      <line x1="70" y1="50" x2="490" y2="50" stroke="#1e293b" stroke-width="1"/>
      
      <!-- Coordinate Axes -->
      <line x1="70" y1="250" x2="70" y2="40" stroke="#94a3b8" stroke-width="2"/>
      <line x1="60" y1="240" x2="500" y2="240" stroke="#94a3b8" stroke-width="2"/>
      
      <!-- Axis Arrows -->
      <polygon points="70,35 65,45 75,45" fill="#94a3b8"/>
      <polygon points="505,240 495,235 495,245" fill="#94a3b8"/>
      
      <!-- Axis Labels -->
      <text x="25" y="145" fill="#38bdf8" font-size="12" font-weight="700" transform="rotate(-90 25 145)" text-anchor="middle">Temperature (°C)</text>
      <text x="280" y="275" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Heat Added Q (kJ)</text>
      
      <!-- Y-Axis Ticks -->
      <text x="60" y="244" fill="#94a3b8" font-size="10" text-anchor="end">-20°C</text>
      <text x="60" y="194" fill="#34d399" font-size="10" font-weight="700" text-anchor="end">0°C (Tm)</text>
      <text x="60" y="114" fill="#f59e0b" font-size="10" font-weight="700" text-anchor="end">100°C (Tb)</text>
      
      <!-- Curve Segments -->
      <!-- I: Solid -->
      <line x1="70" y1="240" x2="130" y2="190" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/>
      <!-- II: Melting Plateau (B to C) -->
      <line x1="130" y1="190" x2="220" y2="190" stroke="#34d399" stroke-width="3.5" stroke-linecap="round"/>
      <!-- III: Liquid (C to D) -->
      <line x1="220" y1="190" x2="310" y2="110" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/>
      <!-- IV: Boiling Plateau (D to E) -->
      <line x1="310" y1="110" x2="440" y2="110" stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round"/>
      <!-- V: Gas -->
      <line x1="440" y1="110" x2="490" y2="55" stroke="#ec4899" stroke-width="3.5" stroke-linecap="round"/>
      
      <!-- Point Callout Nodes -->
      <circle cx="70" cy="240" r="4.5" fill="#38bdf8"/>
      <circle cx="130" cy="190" r="5" fill="#34d399"/>
      <circle cx="220" cy="190" r="5" fill="#34d399"/>
      <circle cx="310" cy="110" r="5" fill="#f59e0b"/>
      <circle cx="440" cy="110" r="5" fill="#f59e0b"/>
      
      <!-- Segment Text Labels -->
      <text x="90" y="210" fill="#94a3b8" font-size="10" font-weight="700">Solid</text>
      <text x="175" y="178" fill="#34d399" font-size="11" font-weight="800" text-anchor="middle">Segment II (Melting)</text>
      <text x="255" y="145" fill="#94a3b8" font-size="10" font-weight="700">Liquid</text>
      <text x="375" y="98" fill="#f59e0b" font-size="11" font-weight="800" text-anchor="middle">Segment IV (Boiling)</text>
      <text x="470" y="75" fill="#ec4899" font-size="10" font-weight="700">Gas</text>
      
      <!-- Letter Nodes -->
      <text x="125" y="206" fill="#f8fafc" font-size="11" font-weight="800">B</text>
      <text x="225" y="206" fill="#f8fafc" font-size="11" font-weight="800">C</text>
      <text x="305" y="126" fill="#f8fafc" font-size="11" font-weight="800">D</text>
      <text x="445" y="126" fill="#f8fafc" font-size="11" font-weight="800">E</text>
    </svg>`
  },

  chem_titration_curve: {
    id: "chem_titration_curve",
    subject: "CHEM",
    moduleId: 17,
    title: "Weak Acid - Strong Base Titration Curve",
    caption: "Figure 2: Titration of 25.0 mL of 0.100 M Acetic Acid with 0.100 M NaOH",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <!-- Grid Lines -->
      <line x1="60" y1="240" x2="490" y2="240" stroke="#1e293b" stroke-width="1"/>
      <line x1="60" y1="180" x2="490" y2="180" stroke="#1e293b" stroke-width="1" stroke-dasharray="3"/>
      <line x1="60" y1="130" x2="490" y2="130" stroke="#1e293b" stroke-width="1" stroke-dasharray="3"/>
      <line x1="60" y1="60" x2="490" y2="60" stroke="#1e293b" stroke-width="1" stroke-dasharray="3"/>
      
      <!-- Axes -->
      <line x1="60" y1="250" x2="60" y2="35" stroke="#94a3b8" stroke-width="2"/>
      <line x1="50" y1="240" x2="500" y2="240" stroke="#94a3b8" stroke-width="2"/>
      
      <!-- Axis Labels -->
      <text x="22" y="145" fill="#38bdf8" font-size="12" font-weight="700" transform="rotate(-90 22 145)" text-anchor="middle">pH Level</text>
      <text x="275" y="275" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Volume of 0.100 M NaOH Added (mL)</text>
      
      <!-- Y-Axis Values -->
      <text x="52" y="244" fill="#94a3b8" font-size="10" text-anchor="end">pH 0</text>
      <text x="52" y="184" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="end">pH 4.76 (pKa)</text>
      <text x="52" y="134" fill="#10b981" font-size="10" font-weight="700" text-anchor="end">pH 8.72 (Eq)</text>
      <text x="52" y="64" fill="#94a3b8" font-size="10" text-anchor="end">pH 14</text>
      
      <!-- X-Axis Ticks -->
      <line x1="165" y1="237" x2="165" y2="243" stroke="#94a3b8" stroke-width="1.5"/>
      <text x="165" y="256" fill="#94a3b8" font-size="10" text-anchor="middle">12.5 mL</text>
      <line x1="270" y1="237" x2="270" y2="243" stroke="#94a3b8" stroke-width="1.5"/>
      <text x="270" y="256" fill="#10b981" font-size="10" font-weight="700" text-anchor="middle">25.0 mL</text>
      <line x1="420" y1="237" x2="420" y2="243" stroke="#94a3b8" stroke-width="1.5"/>
      <text x="420" y="256" fill="#94a3b8" font-size="10" text-anchor="middle">40.0 mL</text>
      
      <!-- Sigmoidal Titration Curve Path -->
      <path d="M 60 215 Q 110 190 165 180 T 255 160 C 265 155 268 75 275 75 C 285 75 330 65 480 62" fill="none" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/>
      
      <!-- Point B: Half-Equivalence -->
      <circle cx="165" cy="180" r="5" fill="#f59e0b"/>
      <line x1="165" y1="180" x2="165" y2="240" stroke="#f59e0b" stroke-width="1" stroke-dasharray="2"/>
      <text x="175" y="172" fill="#f59e0b" font-size="10" font-weight="700">Point B: [HA] = [A-]</text>
      
      <!-- Point C: Equivalence Point -->
      <circle cx="270" cy="130" r="6" fill="#10b981"/>
      <line x1="270" y1="60" x2="270" y2="240" stroke="#10b981" stroke-width="1.5" stroke-dasharray="3"/>
      <text x="282" y="125" fill="#10b981" font-size="11" font-weight="800">Point C: Equivalence (pH 8.72)</text>
      
      <!-- Indicator Transition Band -->
      <rect x="60" y="112" width="430" height="26" fill="rgba(236, 72, 153, 0.12)" rx="2"/>
      <text x="480" y="128" fill="#ec4899" font-size="9" font-weight="700" text-anchor="end">Phenolphthalein Range (8.2 - 10.0)</text>
    </svg>`
  },

  chem_energy_diagram: {
    id: "chem_energy_diagram",
    subject: "CHEM",
    moduleId: 15,
    title: "Reaction Coordinate Energy Profile",
    caption: "Figure 3: Potential Energy Profile for Uncatalyzed vs Catalyzed Reaction",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <!-- Axes -->
      <line x1="60" y1="250" x2="60" y2="40" stroke="#94a3b8" stroke-width="2"/>
      <line x1="50" y1="240" x2="500" y2="240" stroke="#94a3b8" stroke-width="2"/>
      
      <text x="22" y="145" fill="#38bdf8" font-size="12" font-weight="700" transform="rotate(-90 22 145)" text-anchor="middle">Potential Energy (kJ/mol)</text>
      <text x="275" y="275" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Reaction Coordinate Progress</text>
      
      <!-- Reactants Baseline -->
      <line x1="60" y1="160" x2="140" y2="160" stroke="#94a3b8" stroke-width="3"/>
      <text x="100" y="150" fill="#94a3b8" font-size="11" font-weight="800" text-anchor="middle">Reactants (A + B)</text>
      
      <!-- Products Baseline -->
      <line x1="390" y1="210" x2="480" y2="210" stroke="#94a3b8" stroke-width="3"/>
      <text x="435" y="200" fill="#94a3b8" font-size="11" font-weight="800" text-anchor="middle">Products (C + D)</text>
      
      <!-- Uncatalyzed Path (Red dashed curve) -->
      <path d="M 140 160 C 190 160 210 65 265 65 C 320 65 340 210 390 210" fill="none" stroke="#ef4444" stroke-width="3" stroke-dasharray="5"/>
      <circle cx="265" cy="65" r="5" fill="#ef4444"/>
      <text x="265" y="52" fill="#ef4444" font-size="10" font-weight="700" text-anchor="middle">Uncatalyzed Transition State</text>
      
      <!-- Catalyzed Path (Green solid curve) -->
      <path d="M 140 160 C 190 160 210 115 265 115 C 320 115 340 210 390 210" fill="none" stroke="#10b981" stroke-width="3.5"/>
      <circle cx="265" cy="115" r="5" fill="#10b981"/>
      <text x="265" y="103" fill="#10b981" font-size="10" font-weight="700" text-anchor="middle">Catalyzed Transition State</text>
      
      <!-- Ea Arrows -->
      <line x1="160" y1="160" x2="160" y2="65" stroke="#ef4444" stroke-width="1.5"/>
      <text x="155" y="110" fill="#ef4444" font-size="10" font-weight="700" text-anchor="end">Ea (uncat)</text>
      
      <line x1="200" y1="160" x2="200" y2="115" stroke="#10b981" stroke-width="1.5"/>
      <text x="205" y="140" fill="#10b981" font-size="10" font-weight="700">Ea (cat)</text>
      
      <!-- Delta H (Enthalpy) Arrow -->
      <line x1="460" y1="160" x2="460" y2="210" stroke="#38bdf8" stroke-width="2"/>
      <line x1="140" y1="160" x2="470" y2="160" stroke="#94a3b8" stroke-width="1" stroke-dasharray="2"/>
      <polygon points="460,215 456,205 464,205" fill="#38bdf8"/>
      <text x="472" y="188" fill="#38bdf8" font-size="11" font-weight="800">ΔH &lt; 0 (Exothermic)</text>
    </svg>`
  },

  chem_galvanic_cell: {
    id: "chem_galvanic_cell",
    subject: "CHEM",
    moduleId: 19,
    title: "Standard Daniell Galvanic Electrochemical Cell",
    caption: "Figure 4: Zn-Cu Galvanic Cell Operating at Standard State (298 K, 1.0 M)",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Anode Beaker (Left) -->
      <rect x="70" y="140" width="140" height="120" fill="rgba(56, 189, 248, 0.12)" stroke="#94a3b8" stroke-width="2" rx="4"/>
      <rect x="100" y="100" width="25" height="130" fill="#94a3b8" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="112" y="90" fill="#94a3b8" font-size="11" font-weight="800" text-anchor="middle">Zn(s) Anode (-)</text>
      <text x="140" y="245" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">1.0 M ZnSO4(aq)</text>
      
      <!-- Cathode Beaker (Right) -->
      <rect x="330" y="140" width="140" height="120" fill="rgba(59, 130, 246, 0.2)" stroke="#94a3b8" stroke-width="2" rx="4"/>
      <rect x="415" y="100" width="25" height="130" fill="#f59e0b" stroke="#fbbf24" stroke-width="1.5"/>
      <text x="427" y="90" fill="#f59e0b" font-size="11" font-weight="800" text-anchor="middle">Cu(s) Cathode (+)</text>
      <text x="400" y="245" fill="#60a5fa" font-size="10" font-weight="700" text-anchor="middle">1.0 M CuSO4(aq)</text>
      
      <!-- Salt Bridge (U-tube inverted) -->
      <path d="M 180 170 L 180 120 Q 180 100 200 100 L 340 100 Q 360 100 360 120 L 360 170" fill="none" stroke="#e2e8f0" stroke-width="16" stroke-linecap="round"/>
      <path d="M 180 170 L 180 120 Q 180 100 200 100 L 340 100 Q 360 100 360 120 L 360 170" fill="none" stroke="#64748b" stroke-width="12" stroke-linecap="round"/>
      <text x="270" y="94" fill="#f8fafc" font-size="10" font-weight="800" text-anchor="middle">Salt Bridge (KNO3)</text>
      <text x="210" y="125" fill="#38bdf8" font-size="9" font-weight="700">NO3- →</text>
      <text x="315" y="125" fill="#f59e0b" font-size="9" font-weight="700">→ K+</text>
      
      <!-- External Circuit & Voltmeter -->
      <path d="M 112 100 L 112 50 L 240 50" fill="none" stroke="#facc15" stroke-width="2"/>
      <circle cx="270" cy="50" r="22" fill="#1e293b" stroke="#facc15" stroke-width="2.5"/>
      <text x="270" y="47" fill="#facc15" font-size="10" font-weight="800" text-anchor="middle">V</text>
      <text x="270" y="61" fill="#34d399" font-size="10" font-weight="800" text-anchor="middle">+1.10 V</text>
      <path d="M 300 50 L 427 50 L 427 100" fill="none" stroke="#facc15" stroke-width="2"/>
      
      <!-- Electron Flow Arrow -->
      <polygon points="175,44 185,50 175,56" fill="#facc15"/>
      <text x="180" y="40" fill="#facc15" font-size="10" font-weight="700">e- flow →</text>
      <polygon points="360,44 370,50 360,56" fill="#facc15"/>
      <text x="365" y="40" fill="#facc15" font-size="10" font-weight="700">e- flow →</text>
    </svg>`
  },

  // ==========================================
  // BIOLOGY DIAGRAMS
  // ==========================================

  bio_pedigree_chart: {
    id: "bio_pedigree_chart",
    subject: "BIO",
    moduleId: 10,
    title: "Three-Generation Human Pedigree Chart",
    caption: "Figure 5: Inheritance Pattern Across Generations I, II, and III",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Generation Labels -->
      <text x="35" y="65" fill="#38bdf8" font-size="14" font-weight="800">I</text>
      <text x="35" y="155" fill="#38bdf8" font-size="14" font-weight="800">II</text>
      <text x="35" y="245" fill="#38bdf8" font-size="14" font-weight="800">III</text>
      
      <!-- Legend -->
      <rect x="360" y="20" width="16" height="16" fill="none" stroke="#94a3b8" stroke-width="2"/>
      <text x="382" y="33" fill="#94a3b8" font-size="9">Unaffected Male</text>
      <circle cx="368" cy="52" r="8" fill="none" stroke="#94a3b8" stroke-width="2"/>
      <text x="382" y="55" fill="#94a3b8" font-size="9">Unaffected Female</text>
      <rect x="360" y="70" width="16" height="16" fill="#ef4444" stroke="#fca5a5" stroke-width="2"/>
      <text x="382" y="83" fill="#ef4444" font-size="9" font-weight="700">Affected Male</text>
      
      <!-- Generation I -->
      <!-- I-1 Male Unaffected -->
      <rect x="180" y="50" width="28" height="28" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
      <text x="194" y="93" fill="#94a3b8" font-size="10" text-anchor="middle">I-1</text>
      
      <!-- Marriage Bar -->
      <line x1="208" y1="64" x2="272" y2="64" stroke="#94a3b8" stroke-width="2"/>
      
      <!-- I-2 Female Unaffected -->
      <circle cx="286" cy="64" r="14" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
      <text x="286" y="93" fill="#94a3b8" font-size="10" text-anchor="middle">I-2</text>
      
      <!-- Line to Offspring -->
      <line x1="240" y1="64" x2="240" y2="115" stroke="#94a3b8" stroke-width="2"/>
      <line x1="110" y1="115" x2="350" y2="115" stroke="#94a3b8" stroke-width="2"/>
      
      <!-- Generation II -->
      <!-- II-1 Female Unaffected -->
      <line x1="110" y1="115" x2="110" y2="140" stroke="#94a3b8" stroke-width="2"/>
      <circle cx="110" cy="154" r="14" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
      <text x="110" y="183" fill="#94a3b8" font-size="10" text-anchor="middle">II-1</text>
      
      <!-- II-2 Male Affected (Red Fill) -->
      <line x1="190" y1="115" x2="190" y2="140" stroke="#94a3b8" stroke-width="2"/>
      <rect x="176" y="140" width="28" height="28" fill="#ef4444" stroke="#fca5a5" stroke-width="2"/>
      <text x="190" y="183" fill="#ef4444" font-size="10" font-weight="700" text-anchor="middle">II-2</text>
      
      <!-- II-3 Female Unaffected (Carrier) -->
      <line x1="270" y1="115" x2="270" y2="140" stroke="#94a3b8" stroke-width="2"/>
      <circle cx="270" cy="154" r="14" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
      <text x="270" y="183" fill="#94a3b8" font-size="10" text-anchor="middle">II-3</text>
      
      <!-- II-3 Marriage to II-4 -->
      <line x1="284" y1="154" x2="336" y2="154" stroke="#94a3b8" stroke-width="2"/>
      <rect x="336" y="140" width="28" height="28" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
      <text x="350" y="183" fill="#94a3b8" font-size="10" text-anchor="middle">II-4</text>
      
      <!-- Line to Gen III Offspring -->
      <line x1="310" y1="154" x2="310" y2="205" stroke="#94a3b8" stroke-width="2"/>
      <line x1="250" y1="205" x2="370" y2="205" stroke="#94a3b8" stroke-width="2"/>
      
      <!-- Generation III -->
      <!-- III-1 Male Affected (Red Fill) -->
      <line x1="250" y1="205" x2="250" y2="230" stroke="#94a3b8" stroke-width="2"/>
      <rect x="236" y="230" width="28" height="28" fill="#ef4444" stroke="#fca5a5" stroke-width="2"/>
      <text x="250" y="273" fill="#ef4444" font-size="10" font-weight="700" text-anchor="middle">III-1</text>
      
      <!-- III-2 Female Unaffected -->
      <line x1="370" y1="205" x2="370" y2="230" stroke="#94a3b8" stroke-width="2"/>
      <circle cx="370" cy="244" r="14" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
      <text x="370" y="273" fill="#94a3b8" font-size="10" text-anchor="middle">III-2</text>
    </svg>`
  },

  bio_membrane_fluid_mosaic: {
    id: "bio_membrane_fluid_mosaic",
    subject: "BIO",
    moduleId: 7,
    title: "Plasma Membrane Fluid Mosaic Cross-Section",
    caption: "Figure 6: Eukaryotic Phospholipid Bilayer with Transmembrane Transport Protein",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Regions Labels -->
      <rect x="20" y="20" width="190" height="26" fill="rgba(56, 189, 248, 0.15)" rx="4"/>
      <text x="115" y="37" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">Extracellular Fluid (High Na+)</text>
      <rect x="20" y="255" width="190" height="26" fill="rgba(16, 185, 129, 0.15)" rx="4"/>
      <text x="115" y="272" fill="#10b981" font-size="11" font-weight="800" text-anchor="middle">Cytoplasm (High K+)</text>
      
      <!-- Phospholipid Heads (Top Layer: Extracellular) -->
      ${Array.from({length: 16}).map((_, i) => `
        <circle cx="${40 + i * 30}" cy="100" r="9" fill="#38bdf8"/>
        <line x1="${37 + i * 30}" y1="109" x2="${35 + i * 30}" y2="135" stroke="#94a3b8" stroke-width="2"/>
        <line x1="${43 + i * 30}" y1="109" x2="${45 + i * 30}" y2="135" stroke="#94a3b8" stroke-width="2"/>
      `).filter((_, i) => i < 6 || i > 9).join("")}
      
      <!-- Phospholipid Heads (Bottom Layer: Cytoplasmic) -->
      ${Array.from({length: 16}).map((_, i) => `
        <circle cx="${40 + i * 30}" cy="200" r="9" fill="#10b981"/>
        <line x1="${37 + i * 30}" y1="191" x2="${35 + i * 30}" y2="165" stroke="#94a3b8" stroke-width="2"/>
        <line x1="${43 + i * 30}" y1="191" x2="${45 + i * 30}" y2="165" stroke="#94a3b8" stroke-width="2"/>
      `).filter((_, i) => i < 6 || i > 9).join("")}
      
      <!-- Integral Transmembrane Channel Protein (Center) -->
      <path d="M 220 85 Q 230 150 220 215 L 260 215 Q 250 150 260 85 Z" fill="#6366f1" stroke="#818cf8" stroke-width="2"/>
      <path d="M 280 85 Q 270 150 280 215 L 320 215 Q 310 150 320 85 Z" fill="#6366f1" stroke="#818cf8" stroke-width="2"/>
      
      <!-- Transport Pore Channel -->
      <line x1="270" y1="65" x2="270" y2="235" stroke="#facc15" stroke-width="2" stroke-dasharray="4"/>
      <polygon points="270,240 266,230 274,230" fill="#facc15"/>
      <text x="270" y="55" fill="#facc15" font-size="10" font-weight="800" text-anchor="middle">Ion Influx ↓</text>
      
      <!-- Protein Callout -->
      <text x="270" y="155" fill="#f8fafc" font-size="11" font-weight="800" text-anchor="middle">Channel X</text>
      
      <!-- Hydrophobic Core Indicator -->
      <line x1="390" y1="120" x2="390" y2="180" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="400" y="153" fill="#f59e0b" font-size="10" font-weight="700">Hydrophobic Fatty Acid Core</text>
    </svg>`
  },

  bio_action_potential: {
    id: "bio_action_potential",
    subject: "BIO",
    moduleId: 23,
    title: "Neuron Action Potential Voltage Trace",
    caption: "Figure 7: Axonal Membrane Potential (mV) During Action Potential Phases",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Axes -->
      <line x1="60" y1="250" x2="60" y2="35" stroke="#94a3b8" stroke-width="2"/>
      <line x1="50" y1="230" x2="500" y2="230" stroke="#94a3b8" stroke-width="2"/>
      
      <!-- Axis Labels -->
      <text x="22" y="145" fill="#38bdf8" font-size="12" font-weight="700" transform="rotate(-90 22 145)" text-anchor="middle">Membrane Potential (mV)</text>
      <text x="275" y="275" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Time (milliseconds)</text>
      
      <!-- Voltage Reference Lines -->
      <line x1="60" y1="70" x2="490" y2="70" stroke="#1e293b" stroke-width="1" stroke-dasharray="3"/>
      <text x="52" y="74" fill="#ec4899" font-size="10" font-weight="700" text-anchor="end">+35 mV (Peak)</text>
      
      <line x1="60" y1="130" x2="490" y2="130" stroke="#1e293b" stroke-width="1"/>
      <text x="52" y="134" fill="#94a3b8" font-size="10" text-anchor="end">0 mV</text>
      
      <line x1="60" y1="190" x2="490" y2="190" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3"/>
      <text x="52" y="194" fill="#f59e0b" font-size="10" font-weight="700" text-anchor="end">-55 mV (Threshold)</text>
      
      <line x1="60" y1="210" x2="490" y2="210" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4"/>
      <text x="52" y="214" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="end">-70 mV (Resting)</text>
      
      <!-- Action Potential Curve -->
      <path d="M 60 210 L 140 210 Q 170 210 185 190 Q 200 170 220 70 Q 230 65 245 120 Q 260 210 280 235 Q 310 245 350 220 L 490 210" fill="none" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/>
      
      <!-- Phase 1: Depolarization -->
      <text x="180" y="120" fill="#34d399" font-size="10" font-weight="800">1. Na+ Influx (Depol)</text>
      
      <!-- Phase 2: Repolarization -->
      <text x="275" y="105" fill="#f59e0b" font-size="10" font-weight="800">2. K+ Efflux (Repol)</text>
      
      <!-- Phase 3: Hyperpolarization -->
      <text x="320" y="260" fill="#a855f7" font-size="10" font-weight="800">3. Hyperpolarization (-80 mV)</text>
      
      <!-- Point Callout -->
      <circle cx="220" cy="70" r="5" fill="#ec4899"/>
      <circle cx="185" cy="190" r="5" fill="#f59e0b"/>
    </svg>`
  },

  // ==========================================
  // PHYSICS DIAGRAMS
  // ==========================================

  phys_velocity_time_graph: {
    id: "phys_velocity_time_graph",
    subject: "PHYS",
    moduleId: 3,
    title: "Piecewise Velocity-Time Motion Graph",
    caption: "Figure 8: 1D Kinematic Motion Profile of a Laboratory Cart",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Axes -->
      <line x1="60" y1="250" x2="60" y2="40" stroke="#94a3b8" stroke-width="2"/>
      <line x1="50" y1="240" x2="500" y2="240" stroke="#94a3b8" stroke-width="2"/>
      
      <text x="22" y="145" fill="#38bdf8" font-size="12" font-weight="700" transform="rotate(-90 22 145)" text-anchor="middle">Velocity v (m/s)</text>
      <text x="275" y="275" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Time t (seconds)</text>
      
      <!-- Y-Axis Values -->
      <text x="52" y="244" fill="#94a3b8" font-size="10" text-anchor="end">0</text>
      <text x="52" y="164" fill="#94a3b8" font-size="10" text-anchor="end">10</text>
      <text x="52" y="84" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="end">20</text>
      <line x1="60" y1="80" x2="490" y2="80" stroke="#1e293b" stroke-width="1" stroke-dasharray="3"/>
      
      <!-- X-Axis Ticks -->
      <line x1="180" y1="237" x2="180" y2="243" stroke="#94a3b8" stroke-width="1.5"/>
      <text x="180" y="256" fill="#94a3b8" font-size="10" text-anchor="middle">4 s</text>
      <line x1="320" y1="237" x2="320" y2="243" stroke="#94a3b8" stroke-width="1.5"/>
      <text x="320" y="256" fill="#94a3b8" font-size="10" text-anchor="middle">7 s</text>
      <line x1="460" y1="237" x2="460" y2="243" stroke="#94a3b8" stroke-width="1.5"/>
      <text x="460" y="256" fill="#94a3b8" font-size="10" text-anchor="middle">10 s</text>
      
      <!-- Shaded Displacement Area (Integral under curve) -->
      <polygon points="60,240 180,80 320,80 460,240" fill="rgba(56, 189, 248, 0.15)"/>
      <text x="250" y="170" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">Displacement Area = ∫ v dt</text>
      
      <!-- Segments -->
      <!-- OA: Acceleration -->
      <line x1="60" y1="240" x2="180" y2="80" stroke="#10b981" stroke-width="3.5" stroke-linecap="round"/>
      <!-- AB: Constant Velocity -->
      <line x1="180" y1="80" x2="320" y2="80" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/>
      <!-- BC: Deceleration -->
      <line x1="320" y1="80" x2="460" y2="240" stroke="#ef4444" stroke-width="3.5" stroke-linecap="round"/>
      
      <!-- Points -->
      <circle cx="60" cy="240" r="4.5" fill="#10b981"/>
      <circle cx="180" cy="80" r="5" fill="#10b981"/>
      <text x="180" y="70" fill="#10b981" font-size="11" font-weight="800" text-anchor="middle">A</text>
      
      <circle cx="320" cy="80" r="5" fill="#38bdf8"/>
      <text x="320" y="70" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">B</text>
      
      <circle cx="460" cy="240" r="5" fill="#ef4444"/>
      <text x="465" y="252" fill="#ef4444" font-size="11" font-weight="800">C</text>
      
      <!-- Segment Descriptions -->
      <text x="100" y="145" fill="#10b981" font-size="10" font-weight="700">a = +5.0 m/s²</text>
      <text x="250" y="70" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">a = 0 (Constant v)</text>
      <text x="400" y="145" fill="#ef4444" font-size="10" font-weight="700">a = -6.7 m/s²</text>
    </svg>`
  },

  phys_circuit_resistors: {
    id: "phys_circuit_resistors",
    subject: "PHYS",
    moduleId: 20,
    title: "Series-Parallel DC Circuit Schematic",
    caption: "Figure 9: DC Circuit Network with Series and Parallel Branches",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      
      <!-- DC Voltage Source (Left) -->
      <line x1="80" y1="80" x2="80" y2="135" stroke="#facc15" stroke-width="2.5"/>
      <line x1="60" y1="135" x2="100" y2="135" stroke="#facc15" stroke-width="3"/>
      <line x1="70" y1="145" x2="90" y2="145" stroke="#facc15" stroke-width="2"/>
      <line x1="80" y1="145" x2="80" y2="220" stroke="#facc15" stroke-width="2.5"/>
      <text x="50" y="130" fill="#facc15" font-size="12" font-weight="800">+</text>
      <text x="52" y="158" fill="#facc15" font-size="14" font-weight="800">-</text>
      <text x="45" y="145" fill="#facc15" font-size="11" font-weight="800" text-anchor="end">24.0 V</text>
      
      <!-- Wire to Series Resistor R1 -->
      <line x1="80" y1="80" x2="160" y2="80" stroke="#38bdf8" stroke-width="2.5"/>
      
      <!-- Resistor R1 (Zigzag) -->
      <path d="M 160 80 L 168 70 L 176 90 L 184 70 L 192 90 L 200 70 L 208 90 L 216 80" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
      <text x="188" y="60" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">R1 = 6.0 Ω</text>
      
      <!-- Node A -->
      <line x1="216" y1="80" x2="270" y2="80" stroke="#38bdf8" stroke-width="2.5"/>
      <circle cx="270" cy="80" r="5" fill="#f8fafc"/>
      <text x="270" y="68" fill="#f8fafc" font-size="11" font-weight="800" text-anchor="middle">Node A</text>
      
      <!-- Parallel Split -->
      <line x1="270" y1="80" x2="270" y2="150" stroke="#38bdf8" stroke-width="2.5"/>
      <line x1="270" y1="80" x2="330" y2="80" stroke="#38bdf8" stroke-width="2.5"/>
      <line x1="270" y1="150" x2="330" y2="150" stroke="#38bdf8" stroke-width="2.5"/>
      
      <!-- Top Parallel Resistor R2 -->
      <path d="M 330 80 L 338 70 L 346 90 L 354 70 L 362 90 L 370 70 L 378 90 L 386 80" fill="none" stroke="#10b981" stroke-width="2.5"/>
      <text x="358" y="60" fill="#10b981" font-size="11" font-weight="800" text-anchor="middle">R2 = 12.0 Ω</text>
      <line x1="386" y1="80" x2="440" y2="80" stroke="#38bdf8" stroke-width="2.5"/>
      
      <!-- Bottom Parallel Resistor R3 -->
      <path d="M 330 150 L 338 140 L 346 160 L 354 140 L 362 160 L 370 140 L 378 160 L 386 150" fill="none" stroke="#f59e0b" stroke-width="2.5"/>
      <text x="358" y="138" fill="#f59e0b" font-size="11" font-weight="800" text-anchor="middle">R3 = 24.0 Ω</text>
      <line x1="386" y1="150" x2="440" y2="150" stroke="#38bdf8" stroke-width="2.5"/>
      
      <!-- Node B -->
      <line x1="440" y1="80" x2="440" y2="150" stroke="#38bdf8" stroke-width="2.5"/>
      <circle cx="440" cy="80" r="5" fill="#f8fafc"/>
      <text x="440" y="68" fill="#f8fafc" font-size="11" font-weight="800" text-anchor="middle">Node B</text>
      
      <!-- Return Path Wire -->
      <line x1="440" y1="115" x2="480" y2="115" stroke="#38bdf8" stroke-width="2.5"/>
      <line x1="480" y1="115" x2="480" y2="220" stroke="#38bdf8" stroke-width="2.5"/>
      <line x1="480" y1="220" x2="80" y2="220" stroke="#38bdf8" stroke-width="2.5"/>
      
      <!-- Current Arrow -->
      <polygon points="120,76 130,80 120,84" fill="#facc15"/>
      <text x="125" y="70" fill="#facc15" font-size="10" font-weight="700">Itotal →</text>
    </svg>`
  },

  phys_ray_refraction: {
    id: "phys_ray_refraction",
    subject: "PHYS",
    moduleId: 16,
    title: "Light Refraction Across Optical Interface (Snell's Law)",
    caption: "Figure 10: Laser Ray Refracting from Medium 1 into Optically Denser Medium 2",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Medium 2 Background (Denser) -->
      <rect x="0" y="150" width="540" height="150" fill="rgba(56, 189, 248, 0.12)" rx="0"/>
      
      <!-- Interface Boundary -->
      <line x1="0" y1="150" x2="540" y2="150" stroke="#94a3b8" stroke-width="2.5"/>
      <text x="30" y="135" fill="#38bdf8" font-size="11" font-weight="800">Medium 1 (Air, n1 = 1.00)</text>
      <text x="30" y="175" fill="#38bdf8" font-size="11" font-weight="800">Medium 2 (Crown Glass, n2 = 1.52)</text>
      
      <!-- Normal Line (Dashed) -->
      <line x1="270" y1="30" x2="270" y2="270" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="5"/>
      <text x="275" y="45" fill="#94a3b8" font-size="10" font-weight="700">Normal</text>
      
      <!-- Incident Ray -->
      <line x1="130" y1="50" x2="270" y2="150" stroke="#ef4444" stroke-width="3.5"/>
      <polygon points="200,100 205,108 195,106" fill="#ef4444"/>
      <text x="140" y="80" fill="#ef4444" font-size="11" font-weight="800">Incident Ray</text>
      
      <!-- Angle Theta 1 Arc -->
      <path d="M 270 100 A 50 50 0 0 0 230 120" fill="none" stroke="#facc15" stroke-width="2"/>
      <text x="235" y="105" fill="#facc15" font-size="11" font-weight="800">θ1 = 50.0°</text>
      
      <!-- Refracted Ray (Bends TOWARDS Normal) -->
      <line x1="270" y1="150" x2="350" y2="270" stroke="#34d399" stroke-width="3.5"/>
      <polygon points="310,210 317,218 308,221" fill="#34d399"/>
      <text x="360" y="240" fill="#34d399" font-size="11" font-weight="800">Refracted Ray</text>
      
      <!-- Angle Theta 2 Arc -->
      <path d="M 270 200 A 50 50 0 0 0 295 190" fill="none" stroke="#34d399" stroke-width="2"/>
      <text x="285" y="215" fill="#34d399" font-size="11" font-weight="800">θ2 = 30.3°</text>
    </svg>`
  },

  phys_free_body_incline: {
    id: "phys_free_body_incline",
    subject: "PHYS",
    moduleId: 5,
    title: "Free-Body Force Vectors on an Inclined Plane",
    caption: "Figure 11: Equilibrium Force Resolution for a Block on a Ramp at Angle θ",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Incline Triangle -->
      <polygon points="60,240 460,240 460,70" fill="rgba(30, 41, 59, 0.8)" stroke="#64748b" stroke-width="2"/>
      
      <!-- Incline Angle Arc -->
      <path d="M 120 240 A 60 60 0 0 0 115 220" fill="none" stroke="#facc15" stroke-width="2"/>
      <text x="130" y="235" fill="#facc15" font-size="12" font-weight="800">θ = 30°</text>
      
      <!-- Block on Incline (Rotated) -->
      <g transform="translate(260, 155) rotate(-23)">
        <rect x="-35" y="-25" width="70" height="50" fill="#38bdf8" stroke="#f8fafc" stroke-width="2" rx="4"/>
        <text x="0" y="5" fill="#0f172a" font-size="12" font-weight="800" text-anchor="middle">m = 5.0 kg</text>
        
        <!-- Normal Force Vector (Perpendicular Up) -->
        <line x1="0" y1="-25" x2="0" y2="-90" stroke="#34d399" stroke-width="3"/>
        <polygon points="0,-95 -5,-85 5,-85" fill="#34d399"/>
        <text x="10" y="-75" fill="#34d399" font-size="11" font-weight="800">FN = mg cosθ</text>
        
        <!-- Friction Vector (Up the Ramp) -->
        <line x1="35" y1="0" x2="95" y2="0" stroke="#f59e0b" stroke-width="3"/>
        <polygon points="100,0 90,-5 90,5" fill="#f59e0b"/>
        <text x="70" y="-10" fill="#f59e0b" font-size="11" font-weight="800">Ff (friction)</text>
        
        <!-- Parallel Gravity Component (Down the Ramp) -->
        <line x1="-35" y1="0" x2="-95" y2="0" stroke="#ec4899" stroke-width="3"/>
        <polygon points="-100,0 -90,-5 -90,5" fill="#ec4899"/>
        <text x="-70" y="18" fill="#ec4899" font-size="11" font-weight="800">mg sinθ</text>
      </g>
      
      <!-- True Gravity Vector (Straight Down) -->
      <line x1="260" y1="155" x2="260" y2="250" stroke="#ef4444" stroke-width="3.5"/>
      <polygon points="260,255 255,245 265,245" fill="#ef4444"/>
      <text x="270" y="220" fill="#ef4444" font-size="11" font-weight="800">Fg = mg = 49.0 N</text>
    </svg>`
  },

  chem_mass_spectrometry: {
    id: "chem_mass_spectrometry",
    subject: "CHEM",
    moduleId: 4,
    title: "Mass Spectrometry Isotope Distribution of Chlorine",
    caption: "Figure 12: High-Resolution Mass Spectrum of Pure Chlorine Gas (Cl+ Monatomic Ions)",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <!-- Grid Lines -->
      <line x1="70" y1="240" x2="490" y2="240" stroke="#1e293b" stroke-width="1"/>
      <line x1="70" y1="190" x2="490" y2="190" stroke="#1e293b" stroke-width="1" stroke-dasharray="4"/>
      <line x1="70" y1="140" x2="490" y2="140" stroke="#1e293b" stroke-width="1" stroke-dasharray="4"/>
      <line x1="70" y1="90" x2="490" y2="90" stroke="#1e293b" stroke-width="1" stroke-dasharray="4"/>
      <line x1="70" y1="40" x2="490" y2="40" stroke="#1e293b" stroke-width="1"/>
      
      <!-- Coordinate Axes -->
      <line x1="70" y1="250" x2="70" y2="35" stroke="#94a3b8" stroke-width="2"/>
      <line x1="60" y1="240" x2="500" y2="240" stroke="#94a3b8" stroke-width="2"/>
      
      <!-- Axis Labels -->
      <text x="25" y="140" fill="#38bdf8" font-size="12" font-weight="700" transform="rotate(-90 25 140)" text-anchor="middle">Relative Abundance (%)</text>
      <text x="280" y="275" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Mass-to-Charge Ratio (m/z)</text>
      
      <!-- Y-Axis Ticks -->
      <text x="60" y="244" fill="#94a3b8" font-size="10" text-anchor="end">0%</text>
      <text x="60" y="194" fill="#94a3b8" font-size="10" text-anchor="end">25%</text>
      <text x="60" y="144" fill="#94a3b8" font-size="10" text-anchor="end">50%</text>
      <text x="60" y="94" fill="#94a3b8" font-size="10" text-anchor="end">75%</text>
      <text x="60" y="44" fill="#94a3b8" font-size="10" text-anchor="end">100%</text>
      
      <!-- X-Axis Ticks -->
      <text x="140" y="255" fill="#94a3b8" font-size="10" text-anchor="middle">32</text>
      <text x="200" y="255" fill="#94a3b8" font-size="10" text-anchor="middle">34</text>
      <text x="260" y="255" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">35</text>
      <text x="320" y="255" fill="#94a3b8" font-size="10" text-anchor="middle">36</text>
      <text x="380" y="255" fill="#f59e0b" font-size="11" font-weight="800" text-anchor="middle">37</text>
      <text x="440" y="255" fill="#94a3b8" font-size="10" text-anchor="middle">38</text>
      
      <!-- Isotope Peak 1: 35Cl+ (75.77% -> y = 240 - (0.7577 * 200) = 88.46) -->
      <line x1="260" y1="240" x2="260" y2="88" stroke="#38bdf8" stroke-width="7" stroke-linecap="round"/>
      <circle cx="260" cy="88" r="4" fill="#38bdf8"/>
      <rect x="210" y="55" width="100" height="26" fill="#1e293b" rx="4" stroke="#38bdf8" stroke-width="1"/>
      <text x="260" y="72" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">³⁵Cl⁺ (75.77%)</text>
      
      <!-- Isotope Peak 2: 37Cl+ (24.23% -> y = 240 - (0.2423 * 200) = 191.54) -->
      <line x1="380" y1="240" x2="380" y2="192" stroke="#f59e0b" stroke-width="7" stroke-linecap="round"/>
      <circle cx="380" cy="192" r="4" fill="#f59e0b"/>
      <rect x="330" y="159" width="100" height="26" fill="#1e293b" rx="4" stroke="#f59e0b" stroke-width="1"/>
      <text x="380" y="176" fill="#f59e0b" font-size="11" font-weight="800" text-anchor="middle">³⁷Cl⁺ (24.23%)</text>
      
      <!-- Inset Information Box -->
      <rect x="340" y="35" width="170" height="50" fill="rgba(30, 41, 59, 0.9)" rx="6" stroke="#475569" stroke-width="1"/>
      <text x="350" y="52" fill="#94a3b8" font-size="9" font-weight="700">Ionization: Electron Impact (EI)</text>
      <text x="350" y="66" fill="#94a3b8" font-size="9" font-weight="700">Mass Defect: 34.969 vs 36.966 u</text>
      <text x="350" y="78" fill="#10b981" font-size="9" font-weight="800">Ratio: ~3:1 Isotopic Abundance</text>
    </svg>`
  },

  bio_pcr_thermocycling: {
    id: "bio_pcr_thermocycling",
    subject: "BIO",
    moduleId: 13,
    title: "Polymerase Chain Reaction (PCR) Three-Step Thermal Profile",
    caption: "Figure 13: Temperature vs Time Profile per Amplification Cycle & Inset Electrophoresis Gel",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <!-- Grid Lines -->
      <line x1="60" y1="240" x2="420" y2="240" stroke="#1e293b" stroke-width="1"/>
      <line x1="60" y1="175" x2="420" y2="175" stroke="#1e293b" stroke-width="1" stroke-dasharray="4"/>
      <line x1="60" y1="120" x2="420" y2="120" stroke="#1e293b" stroke-width="1" stroke-dasharray="4"/>
      <line x1="60" y1="60" x2="420" y2="60" stroke="#1e293b" stroke-width="1" stroke-dasharray="4"/>
      
      <!-- Coordinate Axes -->
      <line x1="60" y1="250" x2="60" y2="40" stroke="#94a3b8" stroke-width="2"/>
      <line x1="50" y1="240" x2="425" y2="240" stroke="#94a3b8" stroke-width="2"/>
      
      <!-- Y-Axis Ticks & Labels -->
      <text x="22" y="145" fill="#38bdf8" font-size="11" font-weight="700" transform="rotate(-90 22 145)" text-anchor="middle">Temperature (°C)</text>
      <text x="52" y="244" fill="#94a3b8" font-size="10" text-anchor="end">25°</text>
      <text x="52" y="179" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="end">55°</text>
      <text x="52" y="124" fill="#10b981" font-size="10" font-weight="700" text-anchor="end">72°</text>
      <text x="52" y="64" fill="#ef4444" font-size="10" font-weight="700" text-anchor="end">95°</text>
      
      <text x="240" y="275" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">PCR Cycle Time Progress (s)</text>
      
      <!-- Thermal Profile Curve -->
      <!-- Step 1: Denaturation at 95°C -->
      <line x1="60" y1="240" x2="90" y2="60" stroke="#ef4444" stroke-width="3"/>
      <line x1="90" y1="60" x2="170" y2="60" stroke="#ef4444" stroke-width="4"/>
      <circle cx="130" cy="60" r="4" fill="#ef4444"/>
      <text x="130" y="48" fill="#ef4444" font-size="10" font-weight="800" text-anchor="middle">Step 1: Denaturation (95°C)</text>
      <text x="130" y="80" fill="#94a3b8" font-size="8" text-anchor="middle">H-bonds break (dsDNA → ssDNA)</text>
      
      <!-- Step 2: Annealing at 55°C -->
      <line x1="170" y1="60" x2="210" y2="175" stroke="#38bdf8" stroke-width="3"/>
      <line x1="210" y1="175" x2="280" y2="175" stroke="#38bdf8" stroke-width="4"/>
      <circle cx="245" cy="175" r="4" fill="#38bdf8"/>
      <text x="245" y="163" fill="#38bdf8" font-size="10" font-weight="800" text-anchor="middle">Step 2: Annealing (55°C)</text>
      <text x="245" y="195" fill="#94a3b8" font-size="8" text-anchor="middle">Primers hybridize to 3' ends</text>
      
      <!-- Step 3: Extension at 72°C -->
      <line x1="280" y1="175" x2="310" y2="120" stroke="#10b981" stroke-width="3"/>
      <line x1="310" y1="120" x2="390" y2="120" stroke="#10b981" stroke-width="4"/>
      <line x1="390" y1="120" x2="415" y2="60" stroke="#64748b" stroke-width="2" stroke-dasharray="3"/>
      <circle cx="350" cy="120" r="4" fill="#10b981"/>
      <text x="350" y="108" fill="#10b981" font-size="10" font-weight="800" text-anchor="middle">Step 3: Extension (72°C)</text>
      <text x="350" y="140" fill="#94a3b8" font-size="8" text-anchor="middle">Taq Polymerase synthesizes 5'→3'</text>
      
      <!-- Gel Electrophoresis Inset Box -->
      <g transform="translate(435, 45)">
        <rect width="90" height="210" fill="#020617" rx="6" stroke="#475569" stroke-width="1.5"/>
        <text x="45" y="18" fill="#38bdf8" font-size="9" font-weight="800" text-anchor="middle">Agarose Gel</text>
        <!-- Wells -->
        <rect x="15" y="28" width="25" height="6" fill="#1e293b"/>
        <rect x="50" y="28" width="25" height="6" fill="#1e293b"/>
        <text x="27" y="44" fill="#94a3b8" font-size="7" text-anchor="middle">Ladder</text>
        <text x="62" y="44" fill="#94a3b8" font-size="7" text-anchor="middle">PCR Prod</text>
        
        <!-- Ladder Bands -->
        <rect x="16" y="55" width="23" height="3" fill="#64748b"/>
        <text x="42" y="58" fill="#64748b" font-size="6">1000bp</text>
        <rect x="16" y="85" width="23" height="3" fill="#64748b"/>
        <text x="42" y="88" fill="#64748b" font-size="6">500bp</text>
        <rect x="16" y="125" width="23" height="3" fill="#64748b"/>
        <text x="42" y="128" fill="#64748b" font-size="6">250bp</text>
        
        <!-- Single Target Amplicon Band in Lane 2 -->
        <rect x="51" y="85" width="23" height="4" fill="#22c55e" rx="1"/>
        <text x="62" y="102" fill="#22c55e" font-size="7" font-weight="800" text-anchor="middle">500 bp</text>
      </g>
    </svg>`
  },

  phys_carnot_cycle: {
    id: "phys_carnot_cycle",
    subject: "PHYS",
    moduleId: 11,
    title: "Carnot Heat Engine Reversible Thermodynamic Cycle",
    caption: "Figure 14: P-V Indicator Diagram for an Ideal Gas Carnot Cycle between TH = 600 K and TC = 300 K",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <!-- Grid -->
      <line x1="70" y1="240" x2="490" y2="240" stroke="#1e293b" stroke-width="1"/>
      <line x1="70" y1="180" x2="490" y2="180" stroke="#1e293b" stroke-width="1" stroke-dasharray="4"/>
      <line x1="70" y1="110" x2="490" y2="110" stroke="#1e293b" stroke-width="1" stroke-dasharray="4"/>
      <line x1="70" y1="50" x2="490" y2="50" stroke="#1e293b" stroke-width="1"/>
      
      <!-- Coordinate Axes -->
      <line x1="70" y1="250" x2="70" y2="35" stroke="#94a3b8" stroke-width="2"/>
      <line x1="60" y1="240" x2="500" y2="240" stroke="#94a3b8" stroke-width="2"/>
      
      <!-- Labels -->
      <text x="25" y="140" fill="#38bdf8" font-size="12" font-weight="700" transform="rotate(-90 25 140)" text-anchor="middle">Pressure P (kPa)</text>
      <text x="280" y="275" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Volume V (L)</text>
      
      <!-- Enclosed Shaded Work Area -->
      <path d="M 140 60 Q 220 85 270 120 Q 340 180 380 205 Q 260 215 200 185 Q 160 120 140 60 Z" fill="rgba(56, 189, 248, 0.15)" stroke="none"/>
      
      <!-- Process 1 -> 2: Isothermal Expansion at TH = 600 K -->
      <path d="M 140 60 Q 220 85 270 120" fill="none" stroke="#ef4444" stroke-width="3.5"/>
      <polygon points="210,87 200,80 204,92" fill="#ef4444"/>
      <text x="180" y="68" fill="#ef4444" font-size="10" font-weight="800">1→2: Isothermal (TH = 600 K, Qin)</text>
      
      <!-- Process 2 -> 3: Adiabatic Expansion (Q = 0) -->
      <path d="M 270 120 Q 340 180 380 205" fill="none" stroke="#f59e0b" stroke-width="3.5"/>
      <polygon points="330,172 320,165 328,178" fill="#f59e0b"/>
      <text x="350" y="150" fill="#f59e0b" font-size="10" font-weight="800">2→3: Adiabatic (Q=0)</text>
      
      <!-- Process 3 -> 4: Isothermal Compression at TC = 300 K -->
      <path d="M 380 205 Q 260 215 200 185" fill="none" stroke="#38bdf8" stroke-width="3.5"/>
      <polygon points="280,210 290,215 287,203" fill="#38bdf8"/>
      <text x="320" y="232" fill="#38bdf8" font-size="10" font-weight="800">3→4: Isothermal (TC = 300 K, Qout)</text>
      
      <!-- Process 4 -> 1: Adiabatic Compression (Q = 0) -->
      <path d="M 200 185 Q 160 120 140 60" fill="none" stroke="#10b981" stroke-width="3.5"/>
      <polygon points="163,115 160,127 170,122" fill="#10b981"/>
      <text x="105" y="145" fill="#10b981" font-size="10" font-weight="800">4→1: Adiabatic</text>
      
      <!-- State Nodes -->
      <circle cx="140" cy="60" r="5" fill="#f8fafc" stroke="#ef4444" stroke-width="2"/>
      <text x="125" y="55" fill="#f8fafc" font-size="11" font-weight="800">1</text>
      <circle cx="270" cy="120" r="5" fill="#f8fafc" stroke="#f59e0b" stroke-width="2"/>
      <text x="282" y="118" fill="#f8fafc" font-size="11" font-weight="800">2</text>
      <circle cx="380" cy="205" r="5" fill="#f8fafc" stroke="#38bdf8" stroke-width="2"/>
      <text x="395" y="210" fill="#f8fafc" font-size="11" font-weight="800">3</text>
      <circle cx="200" cy="185" r="5" fill="#f8fafc" stroke="#10b981" stroke-width="2"/>
      <text x="185" y="195" fill="#f8fafc" font-size="11" font-weight="800">4</text>
      
      <!-- Center Work Equation Box -->
      <rect x="215" y="135" width="115" height="38" fill="rgba(15, 23, 42, 0.85)" rx="4" stroke="#38bdf8" stroke-width="1"/>
      <text x="272" y="150" fill="#f8fafc" font-size="10" font-weight="800" text-anchor="middle">Wnet = ∮ P dV</text>
      <text x="272" y="164" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">η = 1 - TC/TH = 50%</text>
    </svg>`
  },

  phys_double_slit_interference: {
    id: "phys_double_slit_interference",
    subject: "PHYS",
    moduleId: 17,
    title: "Young's Double-Slit Wave Interference & Intensity Distribution",
    caption: "Figure 15: Two-Slit Optical Geometry (λ = 632.8 nm, d = 0.20 mm, L = 2.0 m) and Resulting Screen Fringes",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Laser Beam Source (Left) -->
      <rect x="25" y="130" width="45" height="40" fill="#ef4444" rx="4"/>
      <text x="47" y="155" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">Laser</text>
      <text x="47" y="185" fill="#ef4444" font-size="8" font-weight="700" text-anchor="middle">λ = 632.8 nm</text>
      <line x1="70" y1="150" x2="130" y2="150" stroke="#ef4444" stroke-width="3" stroke-dasharray="4"/>
      
      <!-- Slit Barrier with 2 Slits (S1, S2) -->
      <line x1="130" y1="35" x2="130" y2="125" stroke="#94a3b8" stroke-width="5"/>
      <line x1="130" y1="135" x2="130" y2="165" stroke="#94a3b8" stroke-width="5"/>
      <line x1="130" y1="175" x2="130" y2="265" stroke="#94a3b8" stroke-width="5"/>
      
      <!-- Slit Labels -->
      <text x="115" y="133" fill="#38bdf8" font-size="10" font-weight="800">S1</text>
      <text x="115" y="183" fill="#38bdf8" font-size="10" font-weight="800">S2</text>
      <line x1="105" y1="130" x2="105" y2="170" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="95" y="153" fill="#38bdf8" font-size="9" font-weight="800" text-anchor="middle">d</text>
      
      <!-- Central Optical Axis -->
      <line x1="130" y1="150" x2="410" y2="150" stroke="#475569" stroke-width="1" stroke-dasharray="4"/>
      <text x="260" y="165" fill="#64748b" font-size="9" text-anchor="middle">Distance L = 2.00 m</text>
      
      <!-- Rays to Target Point P on Screen -->
      <line x1="130" y1="130" x2="410" y2="80" stroke="#ef4444" stroke-width="2"/>
      <line x1="130" y1="170" x2="410" y2="80" stroke="#ef4444" stroke-width="2"/>
      <circle cx="410" cy="80" r="4" fill="#ef4444"/>
      <text x="425" y="75" fill="#f8fafc" font-size="10" font-weight="800">P (m = +1)</text>
      <text x="425" y="90" fill="#38bdf8" font-size="9">y = λL/d = 6.33 mm</text>
      
      <!-- Screen Barrier (Right) -->
      <line x1="410" y1="35" x2="410" y2="265" stroke="#64748b" stroke-width="3"/>
      
      <!-- Interference Fringes Display (Right edge) -->
      <!-- Central Max (m=0) -->
      <rect x="420" y="140" width="30" height="20" fill="#ef4444" rx="2" opacity="1"/>
      <text x="455" y="154" fill="#f8fafc" font-size="9" font-weight="800">m = 0 (Central Max)</text>
      
      <!-- m = +1 Bright Fringe -->
      <rect x="420" y="70" width="26" height="18" fill="#ef4444" rx="2" opacity="0.85"/>
      <text x="455" y="82" fill="#ef4444" font-size="8" font-weight="700">m = +1</text>
      
      <!-- m = -1 Bright Fringe -->
      <rect x="420" y="212" width="26" height="18" fill="#ef4444" rx="2" opacity="0.85"/>
      <text x="455" y="224" fill="#ef4444" font-size="8" font-weight="700">m = -1</text>
      
      <!-- Dark Minima Indicator -->
      <line x1="420" y1="110" x2="445" y2="110" stroke="#334155" stroke-width="2"/>
      <text x="455" y="113" fill="#64748b" font-size="8">Dark (Destructive)</text>
      <line x1="420" y1="190" x2="445" y2="190" stroke="#334155" stroke-width="2"/>
      <text x="455" y="193" fill="#64748b" font-size="8">Dark (Destructive)</text>
      
      <!-- Fringe Spacing Dimension Line -->
      <line x1="415" y1="80" x2="415" y2="150" stroke="#38bdf8" stroke-width="1.5"/>
      <polygon points="415,80 412,87 418,87" fill="#38bdf8"/>
      <polygon points="415,150 412,143 418,143" fill="#38bdf8"/>
      <text x="395" y="118" fill="#38bdf8" font-size="9" font-weight="800" text-anchor="end">Δy</text>
    </svg>`
  },

  // ==========================================
  // FLAGSHIP BIOLOGY: DNA REPLICATION FORK
  // ==========================================

  bio_dna_replication_fork: {
    id: "bio_dna_replication_fork",
    subject: "BIO",
    moduleId: 11,
    title: "DNA Replication Fork & Enzymatic Machinery",
    caption: "Figure 16: Semiconservative 5' to 3' synthesis showing Helicase, DNA Polymerase III, Primase, Okazaki fragments, and Ligase",
    svg: `<svg viewBox="0 0 540 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 530px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <defs>
        <linearGradient id="helicase-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#34d399"/>
          <stop offset="100%" stop-color="#059669"/>
        </linearGradient>
        <linearGradient id="pol-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38bdf8"/>
          <stop offset="100%" stop-color="#0284c7"/>
        </linearGradient>
        <linearGradient id="primase-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fbbf24"/>
          <stop offset="100%" stop-color="#d97706"/>
        </linearGradient>
        <linearGradient id="ligase-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f472b6"/>
          <stop offset="100%" stop-color="#db2777"/>
        </linearGradient>
      </defs>
      <rect width="540" height="320" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>

      <!-- Header Title Banner -->
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="800" text-anchor="middle" letter-spacing="0.5">DNA REPLICATION FORK ARCHITECTURE (SEMICONSERVATIVE)</text>
      
      <!-- Direction of Fork Movement Arrow -->
      <g transform="translate(320, 160)">
        <line x1="0" y1="0" x2="65" y2="0" stroke="#facc15" stroke-width="2.5" stroke-dasharray="3,2"/>
        <polygon points="65,0 55,-5 55,5" fill="#facc15"/>
        <text x="32" y="-8" fill="#facc15" font-size="9" font-weight="800" text-anchor="middle">Fork Motion →</text>
      </g>

      <!-- Parental Double Helix (Right of Helicase) -->
      <!-- Top Parental Strand (3' -> 5' into fork) -->
      <path d="M 400 148 Q 440 140 480 148 T 520 148" fill="none" stroke="#94a3b8" stroke-width="3"/>
      <!-- Bottom Parental Strand (5' -> 3' into fork) -->
      <path d="M 400 172 Q 440 180 480 172 T 520 172" fill="none" stroke="#94a3b8" stroke-width="3"/>
      <!-- Hydrogen Bond Rungs (Parental) -->
      <line x1="420" y1="145" x2="420" y2="175" stroke="#38bdf8" stroke-width="2"/>
      <line x1="440" y1="141" x2="440" y2="179" stroke="#34d399" stroke-width="2"/>
      <line x1="460" y1="144" x2="460" y2="176" stroke="#fbbf24" stroke-width="2"/>
      <line x1="480" y1="148" x2="480" y2="172" stroke="#f472b6" stroke-width="2"/>
      <line x1="500" y1="144" x2="500" y2="176" stroke="#38bdf8" stroke-width="2"/>
      <text x="525" y="145" fill="#94a3b8" font-size="10" font-weight="800">5'</text>
      <text x="525" y="178" fill="#94a3b8" font-size="10" font-weight="800">3'</text>

      <!-- DNA Helicase (Enzyme Ring at the Junction) -->
      <polygon points="340,130 395,160 340,190" fill="url(#helicase-grad)" stroke="#10b981" stroke-width="1.5"/>
      <text x="355" y="164" fill="#ffffff" font-size="9" font-weight="900" text-anchor="middle">HELICASE</text>

      <!-- Single-Stranded Binding Proteins (SSBs) -->
      <circle cx="310" cy="98" r="5" fill="#06b6d4" stroke="#0891b2" stroke-width="1"/>
      <circle cx="280" cy="108" r="5" fill="#06b6d4" stroke="#0891b2" stroke-width="1"/>
      <circle cx="310" cy="222" r="5" fill="#06b6d4" stroke="#0891b2" stroke-width="1"/>
      <circle cx="280" cy="212" r="5" fill="#06b6d4" stroke="#0891b2" stroke-width="1"/>
      <text x="325" y="92" fill="#06b6d4" font-size="8" font-weight="700">SSB</text>

      <!-- ================= TOP: LEADING STRAND ================= -->
      <!-- Parental Template Strand -->
      <path d="M 345 133 C 300 115 180 85 40 85" fill="none" stroke="#94a3b8" stroke-width="3"/>
      <text x="25" y="89" fill="#94a3b8" font-size="11" font-weight="800">3'</text>
      <text x="27" y="73" fill="#cbd5e1" font-size="8">Parental Template</text>

      <!-- Synthesized Leading Daughter Strand (Continuous 5' -> 3') -->
      <path d="M 60 102 L 250 102" fill="none" stroke="#38bdf8" stroke-width="3.5"/>
      <polygon points="255,102 245,97 245,107" fill="#38bdf8"/>
      <text x="50" y="106" fill="#38bdf8" font-size="11" font-weight="800">5'</text>
      <text x="260" y="106" fill="#38bdf8" font-size="11" font-weight="800">3'</text>

      <!-- Base pairs between parental and daughter -->
      <line x1="80" y1="87" x2="80" y2="101" stroke="#34d399" stroke-width="1.8"/>
      <line x1="100" y1="87" x2="100" y2="101" stroke="#f472b6" stroke-width="1.8"/>
      <line x1="120" y1="87" x2="120" y2="101" stroke="#fbbf24" stroke-width="1.8"/>
      <line x1="140" y1="88" x2="140" y2="101" stroke="#38bdf8" stroke-width="1.8"/>
      <line x1="160" y1="89" x2="160" y2="101" stroke="#34d399" stroke-width="1.8"/>
      <line x1="180" y1="91" x2="180" y2="101" stroke="#f472b6" stroke-width="1.8"/>

      <!-- DNA Polymerase III (Leading Strand) -->
      <rect x="200" y="76" width="55" height="32" rx="6" fill="url(#pol-grad)" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="227" y="96" fill="#ffffff" font-size="8.5" font-weight="800" text-anchor="middle">DNA Pol III</text>
      
      <!-- Leading Strand Label Callout -->
      <rect x="80" y="42" width="160" height="22" rx="4" fill="#0284c7" fill-opacity="0.25" stroke="#38bdf8" stroke-width="1"/>
      <text x="160" y="57" fill="#38bdf8" font-size="9.5" font-weight="800" text-anchor="middle">LEADING STRAND (Continuous 5'→3')</text>

      <!-- ================= BOTTOM: LAGGING STRAND ================= -->
      <!-- Parental Template Strand -->
      <path d="M 345 187 C 300 205 180 235 40 235" fill="none" stroke="#94a3b8" stroke-width="3"/>
      <text x="25" y="239" fill="#94a3b8" font-size="11" font-weight="800">5'</text>
      <text x="27" y="253" fill="#cbd5e1" font-size="8">Parental Template</text>

      <!-- Okazaki Fragment 1 (Synthesized Away from Fork: Leftward) -->
      <!-- RNA Primer 1 -->
      <rect x="150" y="217" width="16" height="5" fill="#f97316" rx="1"/>
      <text x="158" y="212" fill="#f97316" font-size="7.5" font-weight="800" text-anchor="middle">RNA</text>
      <!-- DNA Fragment 1 -->
      <line x1="134" y1="219" x2="70" y2="219" stroke="#38bdf8" stroke-width="3.5"/>
      <polygon points="65,219 75,214 75,224" fill="#38bdf8"/>
      <text x="100" y="210" fill="#38bdf8" font-size="8" font-weight="700">Okazaki Fragment 1</text>

      <!-- DNA Ligase at Nick -->
      <circle cx="62" cy="219" r="11" fill="url(#ligase-grad)" stroke="#f472b6" stroke-width="1.5"/>
      <text x="62" y="222" fill="#ffffff" font-size="6.5" font-weight="800" text-anchor="middle">LIGASE</text>

      <!-- Okazaki Fragment 2 (Under Construction) -->
      <!-- RNA Primase Enzyme -->
      <rect x="245" y="230" width="46" height="24" rx="5" fill="url(#primase-grad)" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="268" y="245" fill="#ffffff" font-size="8" font-weight="800" text-anchor="middle">PRIMASE</text>
      
      <!-- RNA Primer 2 -->
      <rect x="235" y="217" width="18" height="5" fill="#f97316" rx="1"/>
      <text x="244" y="212" fill="#f97316" font-size="7.5" font-weight="800" text-anchor="middle">RNA</text>

      <!-- DNA Polymerase III (Lagging Strand) -->
      <rect x="165" y="203" width="55" height="32" rx="6" fill="url(#pol-grad)" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="192" y="223" fill="#ffffff" font-size="8.5" font-weight="800" text-anchor="middle">DNA Pol III</text>
      <line x1="192" y1="219" x2="165" y2="219" stroke="#38bdf8" stroke-width="3.5"/>
      <polygon points="160,219 168,215 168,223" fill="#38bdf8"/>

      <!-- Lagging Strand Label Callout -->
      <rect x="80" y="278" width="185" height="22" rx="4" fill="#db2777" fill-opacity="0.25" stroke="#f472b6" stroke-width="1"/>
      <text x="172" y="293" fill="#f472b6" font-size="9.5" font-weight="800" text-anchor="middle">LAGGING STRAND (Discontinuous / Okazaki)</text>

      <!-- Legend Pill Box -->
      <rect x="360" y="260" width="165" height="46" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
      <circle cx="372" cy="275" r="4" fill="#f97316"/>
      <text x="382" y="278" fill="#cbd5e1" font-size="8">RNA Primer (Primase)</text>
      <circle cx="372" cy="293" r="4" fill="#38bdf8"/>
      <text x="382" y="296" fill="#cbd5e1" font-size="8">Newly Synthesized DNA</text>
    </svg>`
  },

  // ==========================================
  // FLAGSHIP PHYSICS: PHOTOELECTRIC WORK FUNCTION
  // ==========================================

  phys_photoelectric_effect: {
    id: "phys_photoelectric_effect",
    subject: "PHYS",
    moduleId: 22,
    title: "Photoelectric Effect: Work Function & Stopping Potential",
    caption: "Figure 17: Photon energy E = hν overcoming surface work function Φ with kinetic energy K_max = hν - Φ = eV_stop",
    svg: `<svg viewBox="0 0 540 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 530px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <defs>
        <linearGradient id="metal-surface-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#475569"/>
          <stop offset="100%" stop-color="#1e293b"/>
        </linearGradient>
        <linearGradient id="band-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0284c7" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#0284c7" stop-opacity="0.1"/>
        </linearGradient>
      </defs>
      <rect width="540" height="320" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>

      <!-- Header Title Banner -->
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="800" text-anchor="middle" letter-spacing="0.5">EINSTEIN'S PHOTOELECTRIC EFFECT &amp; WORK FUNCTION (Φ)</text>

      <!-- ================= LEFT: ENERGY LEVEL & ESCAPE DIAGRAM ================= -->
      <g transform="translate(15, 45)">
        <rect width="245" height="255" rx="8" fill="#1e293b" fill-opacity="0.6" stroke="#334155" stroke-width="1"/>
        <text x="122" y="20" fill="#38bdf8" font-size="10" font-weight="800" text-anchor="middle">Potential Energy Diagram</text>

        <!-- Vacuum Level (E = 0) -->
        <line x1="30" y1="50" x2="225" y2="50" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4,3"/>
        <text x="228" y="53" fill="#ef4444" font-size="9" font-weight="700">E_vac = 0</text>

        <!-- Fermi Level (E_F) -->
        <line x1="30" y1="130" x2="225" y2="130" stroke="#38bdf8" stroke-width="2"/>
        <text x="228" y="133" fill="#38bdf8" font-size="9" font-weight="800">E_F (Fermi)</text>

        <!-- Metal Conduction Band Shading -->
        <rect x="30" y="130" width="195" height="100" fill="url(#band-grad)"/>
        <text x="127" y="180" fill="#94a3b8" font-size="10" font-weight="600" text-anchor="middle">Filled Metal States</text>

        <!-- Work Function Φ Arrow (from E_F to E_vac) -->
        <line x1="55" y1="130" x2="55" y2="50" stroke="#f59e0b" stroke-width="2.5"/>
        <polygon points="55,50 51,58 59,58" fill="#f59e0b"/>
        <polygon points="55,130 51,122 59,122" fill="#f59e0b"/>
        <text x="65" y="94" fill="#f59e0b" font-size="11" font-weight="900">Φ</text>
        <text x="65" y="106" fill="#f59e0b" font-size="7.5" font-weight="700">Work Function</text>

        <!-- Incident Photon Arrow (hν) -->
        <path d="M 90 230 C 95 210, 105 210, 110 190 C 115 170, 125 170, 130 150 C 135 130, 145 130, 150 110" fill="none" stroke="#ec4899" stroke-width="2.5"/>
        <polygon points="150,110 142,117 148,122" fill="#ec4899"/>
        <text x="145" y="175" fill="#ec4899" font-size="10" font-weight="800">hν</text>
        <text x="145" y="187" fill="#ec4899" font-size="7.5">(Photon)</text>

        <!-- Ejected Photoelectron with K_max -->
        <line x1="175" y1="50" x2="175" y2="25" stroke="#10b981" stroke-width="2.5"/>
        <polygon points="175,25 171,33 179,33" fill="#10b981"/>
        <circle cx="175" cy="50" r="5" fill="#10b981"/>
        <text x="185" y="36" fill="#10b981" font-size="10" font-weight="900">K_max</text>
        <text x="185" y="46" fill="#10b981" font-size="7.5">e⁻ Ejected</text>
      </g>

      <!-- ================= RIGHT: K_MAX VS FREQUENCY GRAPH ================= -->
      <g transform="translate(275, 45)">
        <rect width="250" height="255" rx="8" fill="#1e293b" fill-opacity="0.6" stroke="#334155" stroke-width="1"/>
        <text x="125" y="20" fill="#38bdf8" font-size="10" font-weight="800" text-anchor="middle">K_max vs Incident Frequency (ν)</text>

        <!-- Axes -->
        <!-- X Axis (Frequency) -->
        <line x1="30" y1="165" x2="235" y2="165" stroke="#94a3b8" stroke-width="1.8"/>
        <polygon points="237,165 230,161 230,169" fill="#94a3b8"/>
        <text x="215" y="180" fill="#cbd5e1" font-size="9" font-weight="700">ν (Hz)</text>

        <!-- Y Axis (Kinetic Energy) -->
        <line x1="60" y1="230" x2="60" y2="35" stroke="#94a3b8" stroke-width="1.8"/>
        <polygon points="60,33 56,40 64,40" fill="#94a3b8"/>
        <text x="20" y="42" fill="#cbd5e1" font-size="9" font-weight="700">K_max (eV)</text>

        <!-- Linear Line: K_max = hν - Φ -->
        <!-- Dashed extrapolation to -Φ on Y axis -->
        <line x1="60" y1="210" x2="115" y2="165" stroke="#f59e0b" stroke-width="2" stroke-dasharray="3,3"/>
        <circle cx="60" cy="210" r="3.5" fill="#f59e0b"/>
        <text x="45" y="214" fill="#f59e0b" font-size="9" font-weight="800" text-anchor="end">-Φ</text>

        <!-- Solid Active Photoemission Line -->
        <line x1="115" y1="165" x2="225" y2="75" stroke="#10b981" stroke-width="3"/>
        
        <!-- Threshold Frequency ν_0 (X-Intercept) -->
        <circle cx="115" cy="165" r="4.5" fill="#facc15" stroke="#0f172a" stroke-width="1.5"/>
        <text x="115" y="182" fill="#facc15" font-size="10" font-weight="900" text-anchor="middle">ν₀</text>
        <text x="115" y="193" fill="#facc15" font-size="7" font-weight="700" text-anchor="middle">(Threshold)</text>

        <!-- Slope Indicator: Slope = h -->
        <line x1="160" y1="128" x2="200" y2="128" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="2,2"/>
        <line x1="200" y1="128" x2="200" y2="95" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="2,2"/>
        <text x="205" y="115" fill="#38bdf8" font-size="9" font-weight="800">Slope = h</text>

        <!-- Governing Formula Card -->
        <rect x="25" y="222" width="200" height="24" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
        <text x="125" y="238" fill="#38bdf8" font-size="9.5" font-weight="800" text-anchor="middle">K_max = hν - Φ = e · V_stop</text>
      </g>
    </svg>`
  },

  // ==========================================
  // FLAGSHIP CHEMISTRY: LE CHATELIER SHIFTS
  // ==========================================

  chem_le_chatelier_shifts: {
    id: "chem_le_chatelier_shifts",
    subject: "CHEM",
    moduleId: 17,
    title: "Le Chatelier's Principle: Equilibrium Shift Kinetics",
    caption: "Figure 18: Concentration response curves for N₂(g) + 3H₂(g) ⇌ 2NH₃(g) following sudden N₂ injection stress",
    svg: `<svg viewBox="0 0 540 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 530px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="320" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>

      <!-- Header Title Banner -->
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="800" text-anchor="middle" letter-spacing="0.5">LE CHATELIER'S PRINCIPLE: CONCENTRATION PERTURBATION</text>
      
      <!-- Reaction Formula Badge -->
      <rect x="135" y="34" width="270" height="24" rx="5" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <text x="270" y="50" fill="#f8fafc" font-size="10.5" font-weight="800" text-anchor="middle">N₂(g) + 3 H₂(g)  ⇌  2 NH₃(g)    ΔH = -92.4 kJ</text>

      <!-- Plot Area -->
      <!-- Coordinate Axes -->
      <line x1="60" y1="260" x2="500" y2="260" stroke="#94a3b8" stroke-width="2"/>
      <polygon points="505,260 495,256 495,264" fill="#94a3b8"/>
      <text x="280" y="285" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">Reaction Time (t)</text>

      <line x1="60" y1="260" x2="60" y2="70" stroke="#94a3b8" stroke-width="2"/>
      <polygon points="60,65 56,72 64,72" fill="#94a3b8"/>
      <text x="22" y="165" fill="#38bdf8" font-size="11" font-weight="700" transform="rotate(-90 22 165)" text-anchor="middle">Concentration [mol/L]</text>

      <!-- Time Phase Vertical Markers -->
      <!-- t_stress (Instantaneous N2 addition) -->
      <line x1="200" y1="75" x2="200" y2="260" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4,3"/>
      <rect x="155" y="70" width="90" height="18" rx="3" fill="#ef4444" fill-opacity="0.2" stroke="#ef4444" stroke-width="1"/>
      <text x="200" y="82" fill="#ef4444" font-size="8" font-weight="800" text-anchor="middle">Stress: +N₂ Injected</text>

      <!-- t_new_eq (Re-establishment of Equilibrium) -->
      <line x1="380" y1="75" x2="380" y2="260" stroke="#10b981" stroke-width="1.5" stroke-dasharray="4,3"/>
      <rect x="335" y="70" width="90" height="18" rx="3" fill="#10b981" fill-opacity="0.2" stroke="#10b981" stroke-width="1"/>
      <text x="380" y="82" fill="#10b981" font-size="8" font-weight="800" text-anchor="middle">New Equilibrium</text>

      <!-- Zone Shading Indicators -->
      <text x="130" y="250" fill="#64748b" font-size="9" font-weight="700" text-anchor="middle">Equilibrium 1 (Q = K)</text>
      <text x="290" y="250" fill="#f59e0b" font-size="9" font-weight="800" text-anchor="middle">Shift Right → (Q &lt; K)</text>
      <text x="440" y="250" fill="#64748b" font-size="9" font-weight="700" text-anchor="middle">Equilibrium 2 (Q = K)</text>

      <!-- ================= CURVE 1: [H2] (Cyan, Decreases by 3Δx) ================= -->
      <!-- Plateaus at 110, then drops smoothly to 145 -->
      <path d="M 60 110 L 200 110 C 240 110, 320 145, 380 145 L 490 145" fill="none" stroke="#38bdf8" stroke-width="3"/>
      <text x="500" y="149" fill="#38bdf8" font-size="10" font-weight="800">[H₂]</text>
      <text x="290" y="125" fill="#38bdf8" font-size="8" font-weight="700">Drops by 3Δx</text>

      <!-- ================= CURVE 2: [N2] (Emerald, Instant Spike then drops by Δx) ================= -->
      <!-- Plateaus at 195, spikes up to 125 at t=200, then drops smoothly to 160 -->
      <!-- Initial plateau -->
      <line x1="60" y1="195" x2="200" y2="195" stroke="#34d399" stroke-width="3"/>
      <!-- Instant vertical spike -->
      <line x1="200" y1="195" x2="200" y2="125" stroke="#34d399" stroke-width="3"/>
      <polygon points="200,123 196,132 204,132" fill="#34d399"/>
      <!-- Recovery curve -->
      <path d="M 200 125 C 240 135, 320 160, 380 160 L 490 160" fill="none" stroke="#34d399" stroke-width="3"/>
      <text x="500" y="164" fill="#34d399" font-size="10" font-weight="800">[N₂]</text>
      <text x="215" y="140" fill="#34d399" font-size="8" font-weight="700">+Δ[N₂] Spike</text>

      <!-- ================= CURVE 3: [NH3] (Amber, Increases by 2Δx) ================= -->
      <!-- Plateaus at 215, then rises smoothly to 180 -->
      <path d="M 60 215 L 200 215 C 240 215, 320 180, 380 180 L 490 180" fill="none" stroke="#f59e0b" stroke-width="3"/>
      <text x="500" y="184" fill="#f59e0b" font-size="10" font-weight="800">[NH₃]</text>
      <text x="290" y="208" fill="#f59e0b" font-size="8" font-weight="700">Rises by +2Δx</text>

      <!-- Stoichiometric Callout Note -->
      <rect x="65" y="294" width="410" height="18" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1"/>
      <text x="270" y="306" fill="#cbd5e1" font-size="8" font-weight="600" text-anchor="middle">
        Stoichiometric Ratio: 1 mole N₂ consumed : 3 moles H₂ consumed : 2 moles NH₃ produced
      </text>
    </svg>`
  },

  chem_rutherford_gold_foil: {
    id: "chem_rutherford_gold_foil",
    subject: "CHEM",
    moduleId: 3,
    title: "Rutherford's Alpha Particle Gold Foil Scattering Experiment",
    caption: "Figure 19: Apparatus schematic and nuclear Coulomb repulsion trajectories discovering the dense atomic nucleus",
    svg: `<svg viewBox="0 0 540 330" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 530px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <defs>
        <radialGradient id="nucGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ef4444" stop-opacity="1"/>
          <stop offset="60%" stop-color="#f59e0b" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#ef4444" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="goldSheetGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#f59e0b"/>
          <stop offset="50%" stop-color="#fef08a"/>
          <stop offset="100%" stop-color="#d97706"/>
        </linearGradient>
      </defs>

      <rect width="540" height="330" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>

      <!-- Header Title Banner -->
      <text x="270" y="22" fill="#38bdf8" font-size="11.5" font-weight="800" text-anchor="middle" letter-spacing="0.5">
        RUTHERFORD'S ALPHA PARTICLE SCATTERING EXPERIMENT (1911)
      </text>

      <!-- ================= LEFT: EXPERIMENTAL APPARATUS ================= -->
      <g transform="translate(10, 30)">
        <!-- Lead Collimator Box -->
        <rect x="15" y="115" width="40" height="40" rx="3" fill="#334155" stroke="#64748b" stroke-width="1.5"/>
        <circle cx="35" cy="135" r="7" fill="#ef4444"/>
        <text x="35" y="105" fill="#94a3b8" font-size="8" font-weight="700" text-anchor="middle">α Emitter</text>
        <text x="35" y="170" fill="#64748b" font-size="7.5" text-anchor="middle">²¹⁴Po in Lead</text>

        <!-- Collimator Slit -->
        <rect x="68" y="100" width="6" height="28" fill="#475569"/>
        <rect x="68" y="142" width="6" height="28" fill="#475569"/>
        <line x1="35" y1="135" x2="140" y2="135" stroke="#f59e0b" stroke-width="2.5"/>

        <!-- Circular ZnS Fluorescent Screen -->
        <path d="M 120 40 A 105 105 0 1 1 120 230" fill="none" stroke="#10b981" stroke-width="3" stroke-dasharray="4,2"/>
        <text x="235" y="45" fill="#10b981" font-size="8" font-weight="700">Circular ZnS Detector Screen</text>

        <!-- Gold Foil Target (Ultrathin) -->
        <line x1="140" y1="75" x2="140" y2="195" stroke="url(#goldSheetGrad)" stroke-width="5"/>
        <rect x="138" y="75" width="4" height="120" fill="url(#goldSheetGrad)"/>
        <text x="140" y="65" fill="#fbbf24" font-size="8.5" font-weight="800" text-anchor="middle">Gold Foil (Au)</text>
        <text x="140" y="210" fill="#f59e0b" font-size="7.5" font-weight="600" text-anchor="middle">~400 nm Thick</text>

        <!-- Beam Scenarios from Foil -->
        <!-- 1. Undeviated (99.9%) -->
        <line x1="140" y1="135" x2="245" y2="135" stroke="#34d399" stroke-width="2.5"/>
        <circle cx="245" cy="135" r="4" fill="#34d399"/>
        <text x="250" y="138" fill="#34d399" font-size="7.5" font-weight="700">0° Undeviated (99.9%)</text>

        <!-- 2. Small Angle Deflection (~0.1%) -->
        <path d="M 140 135 Q 180 130 235 90" fill="none" stroke="#38bdf8" stroke-width="2"/>
        <circle cx="235" cy="90" r="3.5" fill="#38bdf8"/>
        <text x="242" y="92" fill="#38bdf8" font-size="7.5" font-weight="700">Small Angle (θ &lt; 10°)</text>

        <!-- 3. Large Backward Deflection (1 in 20,000) -->
        <path d="M 140 135 Q 145 130 95 65" fill="none" stroke="#ef4444" stroke-width="2.2" stroke-dasharray="3,1"/>
        <circle cx="95" cy="65" r="4" fill="#ef4444"/>
        <polygon points="95,65 104,69 101,75" fill="#ef4444"/>
        <text x="85" y="55" fill="#ef4444" font-size="8" font-weight="800" text-anchor="middle">Backscatter (θ &gt; 90°)</text>
        <text x="85" y="240" fill="#ef4444" font-size="7.5" font-weight="700" text-anchor="middle">1 in 20,000 reflected</text>
      </g>

      <!-- ================= RIGHT: SUBATOMIC COULOMB SCATTERING ZOOM ================= -->
      <g transform="translate(305, 34)">
        <rect x="0" y="0" width="220" height="225" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1.2"/>
        <text x="110" y="16" fill="#38bdf8" font-size="9" font-weight="800" text-anchor="middle">
          SUBATOMIC COULOMB SCATTERING
        </text>

        <!-- Gold Atom Boundary (Faint electron cloud) -->
        <circle cx="110" cy="118" r="85" fill="#0f172a" stroke="#64748b" stroke-width="1" stroke-dasharray="3,3"/>
        <text x="110" y="32" fill="#64748b" font-size="7.5" text-anchor="middle">Electron Cloud (r ≈ 10⁻¹⁰ m)</text>

        <!-- Gold Nucleus (+79e) -->
        <circle cx="110" cy="118" r="16" fill="url(#nucGlow)"/>
        <circle cx="110" cy="118" r="8" fill="#ef4444" stroke="#fbbf24" stroke-width="1.5"/>
        <text x="110" y="121" fill="#ffffff" font-size="8" font-weight="900" text-anchor="middle">+79</text>
        <text x="110" y="145" fill="#fbbf24" font-size="7.5" font-weight="800" text-anchor="middle">Au Nucleus</text>
        <text x="110" y="156" fill="#94a3b8" font-size="7" text-anchor="middle">(r ≈ 10⁻¹⁴ m)</text>

        <!-- Hyperbolic Particle Tracks -->
        <!-- Track 1: Far trajectory (No deflection) -->
        <line x1="5" y1="48" x2="215" y2="48" stroke="#34d399" stroke-width="1.5"/>
        <polygon points="215,48 208,45 208,51" fill="#34d399"/>
        <text x="15" y="44" fill="#34d399" font-size="7">Large b (undeflected)</text>

        <!-- Track 2: Intermediate trajectory (Glancing Coulomb Repulsion) -->
        <path d="M 5 95 C 75 95, 100 85, 150 62 L 210 38" fill="none" stroke="#38bdf8" stroke-width="1.8"/>
        <polygon points="210,38 203,38 206,44" fill="#38bdf8"/>
        <text x="15" y="90" fill="#38bdf8" font-size="7">Medium b: Glancing θ</text>

        <!-- Track 3: Head-on Trajectory (Direct Coulomb Repulsion & Backscatter) -->
        <path d="M 5 118 L 85 118 C 95 118, 95 110, 85 102 L 15 78" fill="none" stroke="#ef4444" stroke-width="2"/>
        <polygon points="15,78 23,76 21,83" fill="#ef4444"/>
        <circle cx="92" cy="118" r="3" fill="#ef4444"/>
        <text x="50" y="132" fill="#ef4444" font-size="7" font-weight="700">Head-on: d_min</text>
      </g>

      <!-- Key Scientific Conclusion Footer -->
      <rect x="15" y="270" width="510" height="50" rx="5" fill="#1e293b" stroke="#334155" stroke-width="1"/>
      <text x="25" y="288" fill="#38bdf8" font-size="9" font-weight="800">RUTHERFORD'S CONCLUSION:</text>
      <text x="25" y="302" fill="#f8fafc" font-size="8.2" font-weight="500">
        1. The atom is mostly empty space — explains why 99.9% of alpha particles pass through unaffected.
      </text>
      <text x="25" y="314" fill="#f8fafc" font-size="8.2" font-weight="500">
        2. Nuclear Core: All positive charge and &gt;99.95% of mass reside in a tiny, dense nucleus (r ≈ 10⁻¹⁴ m) deflecting α particles by electrostatic repulsion (F ∝ 1/r²).
      </text>
    </svg>`
  },

  bio_photosynthesis_z_scheme: {
    id: "bio_photosynthesis_z_scheme",
    subject: "BIO",
    moduleId: 8,
    title: "Thylakoid Membrane Light Reactions: Z-Scheme & Photophosphorylation",
    caption: "Figure 20: Photosystems II & I electron transport chain, water photolysis, and chemiosmotic ATP synthesis across the thylakoid membrane",
    svg: `<svg viewBox="0 0 540 330" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 530px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <defs>
        <linearGradient id="ps2Grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#10b981"/>
          <stop offset="100%" stop-color="#047857"/>
        </linearGradient>
        <linearGradient id="ps1Grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#059669"/>
          <stop offset="100%" stop-color="#064e3b"/>
        </linearGradient>
        <linearGradient id="atpGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#b45309"/>
        </linearGradient>
      </defs>

      <rect width="540" height="330" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>

      <!-- Header Title Banner -->
      <text x="270" y="22" fill="#38bdf8" font-size="11.5" font-weight="800" text-anchor="middle" letter-spacing="0.5">
        LIGHT-DEPENDENT REACTIONS: THYLAKOID CHEMIOSMOSIS
      </text>

      <!-- Region Dividers & pH Labels -->
      <!-- Stroma (Top) -->
      <rect x="15" y="32" width="510" height="98" fill="#1e293b" fill-opacity="0.3"/>
      <text x="25" y="48" fill="#38bdf8" font-size="9" font-weight="800">STROMA (pH ≈ 8.0, Low [H⁺])</text>

      <!-- Thylakoid Membrane Bilayer (Middle) -->
      <rect x="15" y="130" width="510" height="50" fill="#334155" fill-opacity="0.4" stroke="#475569" stroke-width="1"/>
      <line x1="15" y1="130" x2="525" y2="130" stroke="#10b981" stroke-width="2"/>
      <line x1="15" y1="180" x2="525" y2="180" stroke="#10b981" stroke-width="2"/>
      <text x="25" y="158" fill="#94a3b8" font-size="8" font-weight="700">Thylakoid Bilayer</text>

      <!-- Lumen (Bottom) -->
      <rect x="15" y="180" width="510" height="100" fill="#0f172a" fill-opacity="0.6"/>
      <text x="25" y="196" fill="#f59e0b" font-size="9" font-weight="800">THYLAKOID LUMEN (pH ≈ 5.0, High [H⁺] Reservoir)</text>

      <!-- ================= COMPLEX 1: PHOTOSYSTEM II (P680) ================= -->
      <g transform="translate(100, 110)">
        <rect x="0" y="0" width="52" height="70" rx="8" fill="url(#ps2Grad)" stroke="#34d399" stroke-width="1.5"/>
        <text x="26" y="28" fill="#ffffff" font-size="9" font-weight="900" text-anchor="middle">PS II</text>
        <text x="26" y="40" fill="#a7f3d0" font-size="8" font-weight="700" text-anchor="middle">P680</text>

        <!-- Sunlight Photon (hν) -->
        <path d="M 10 -40 L 18 -25 L 14 -20 L 26 -2" fill="none" stroke="#fbbf24" stroke-width="2"/>
        <polygon points="26,-2 20,-7 25,-10" fill="#fbbf24"/>
        <text x="26" y="-45" fill="#fbbf24" font-size="8" font-weight="800" text-anchor="middle">Photon hν (680nm)</text>

        <!-- Photolysis of H2O in Lumen -->
        <rect x="-18" y="74" width="88" height="24" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
        <text x="26" y="86" fill="#38bdf8" font-size="7.5" font-weight="800" text-anchor="middle">2 H₂O → O₂ + 4 H⁺ + 4 e⁻</text>
        <text x="26" y="95" fill="#94a3b8" font-size="6.5" text-anchor="middle">Oxygen Evolving Complex</text>
      </g>

      <!-- ================= ELECTRON FLOW 1: PQ -> Cyt b6f ================= -->
      <!-- Plastoquinone (PQ) -->
      <circle cx="180" cy="145" r="14" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="180" y="148" fill="#ffffff" font-size="8" font-weight="800" text-anchor="middle">PQ</text>

      <!-- Cytochrome b6f Complex -->
      <g transform="translate(220, 115)">
        <rect x="0" y="0" width="46" height="65" rx="6" fill="#475569" stroke="#94a3b8" stroke-width="1.5"/>
        <text x="23" y="30" fill="#ffffff" font-size="8.5" font-weight="800" text-anchor="middle">Cyt</text>
        <text x="23" y="42" fill="#cbd5e1" font-size="8" font-weight="700" text-anchor="middle">b₆f</text>

        <!-- Active H+ Pump Arrow (Stroma -> Lumen) -->
        <path d="M 23 -15 L 23 85" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="3,2"/>
        <polygon points="23,88 19,80 27,80" fill="#f59e0b"/>
        <text x="23" y="-20" fill="#f59e0b" font-size="8" font-weight="800" text-anchor="middle">+4 H⁺ PUMP</text>
      </g>

      <!-- Plastocyanin (PC) -->
      <circle cx="295" cy="170" r="13" fill="#0d9488" stroke="#2dd4bf" stroke-width="1.5"/>
      <text x="295" y="173" fill="#ffffff" font-size="8" font-weight="800" text-anchor="middle">PC</text>

      <!-- ================= COMPLEX 2: PHOTOSYSTEM I (P700) ================= -->
      <g transform="translate(330, 110)">
        <rect x="0" y="0" width="52" height="70" rx="8" fill="url(#ps1Grad)" stroke="#34d399" stroke-width="1.5"/>
        <text x="26" y="28" fill="#ffffff" font-size="9" font-weight="900" text-anchor="middle">PS I</text>
        <text x="26" y="40" fill="#a7f3d0" font-size="8" font-weight="700" text-anchor="middle">P700</text>

        <!-- Sunlight Photon (hν) -->
        <path d="M 10 -40 L 18 -25 L 14 -20 L 26 -2" fill="none" stroke="#fbbf24" stroke-width="2"/>
        <polygon points="26,-2 20,-7 25,-10" fill="#fbbf24"/>
        <text x="26" y="-45" fill="#fbbf24" font-size="8" font-weight="800" text-anchor="middle">Photon hν (700nm)</text>
      </g>

      <!-- Ferredoxin (Fd) & FNR Reductase (Stroma) -->
      <g transform="translate(385, 45)">
        <circle cx="15" cy="15" r="12" fill="#7c3aed" stroke="#c084fc" stroke-width="1.5"/>
        <text x="15" y="18" fill="#ffffff" font-size="7.5" font-weight="800" text-anchor="middle">Fd</text>

        <!-- FNR Arrow to NADPH -->
        <path d="M 28 15 L 75 15" fill="none" stroke="#c084fc" stroke-width="2"/>
        <polygon points="75,15 67,11 67,19" fill="#c084fc"/>
        <rect x="42" y="22" width="85" height="18" rx="3" fill="#1e293b" stroke="#c084fc" stroke-width="1"/>
        <text x="84" y="34" fill="#c084fc" font-size="7.5" font-weight="800" text-anchor="middle">NADP⁺ + H⁺ → NADPH</text>
      </g>

      <!-- ================= COMPLEX 3: ATP SYNTHASE (CHEMIOSMOSIS) ================= -->
      <g transform="translate(460, 95)">
        <!-- CF0 Rotor in Membrane -->
        <rect x="6" y="35" width="30" height="50" rx="4" fill="#475569" stroke="#f59e0b" stroke-width="1.5"/>
        <text x="21" y="62" fill="#fef08a" font-size="7.5" font-weight="800" text-anchor="middle">CF₀</text>

        <!-- CF1 Catalytic Head in Stroma -->
        <circle cx="21" cy="15" r="20" fill="url(#atpGrad)" stroke="#fef08a" stroke-width="1.5"/>
        <text x="21" y="18" fill="#ffffff" font-size="8.5" font-weight="900" text-anchor="middle">CF₁</text>

        <!-- Proton Efflux Arrow (Lumen -> Stroma) -->
        <path d="M 21 115 L 21 40" fill="none" stroke="#f59e0b" stroke-width="2.5"/>
        <polygon points="21,37 17,45 25,45" fill="#f59e0b"/>
        <text x="21" y="125" fill="#f59e0b" font-size="8" font-weight="800" text-anchor="middle">H⁺ Efflux</text>

        <!-- ADP + Pi -> ATP Generation Badge -->
        <rect x="-42" y="-12" width="70" height="18" rx="3" fill="#1e293b" stroke="#f59e0b" stroke-width="1"/>
        <text x="-7" y="0" fill="#f59e0b" font-size="7.5" font-weight="800" text-anchor="middle">ADP + Pᵢ → ATP</text>
      </g>

      <!-- Footer Summary Equation -->
      <rect x="15" y="288" width="510" height="34" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1"/>
      <text x="270" y="302" fill="#cbd5e1" font-size="8.2" font-weight="600" text-anchor="middle">
        Net Light Reaction: 2 H₂O + 2 NADP⁺ + 3 ADP + 3 Pᵢ + Light → O₂ + 2 NADPH + 3 ATP
      </text>
      <text x="270" y="315" fill="#38bdf8" font-size="7.5" font-weight="700" text-anchor="middle">
        Proton Motive Force (PMF) across thylakoid drives photophosphorylation via chemiosmotic rotary coupling
      </text>
    </svg>`
  }
};

/**
 * Retrieves diagram object by unique ID
 */
export function getDiagramById(id) {
  return SCIENTIFIC_DIAGRAMS[id] || null;
}

/**
 * Returns all diagrams matching a subject and module
 */
export function getDiagramsForModule(subject, moduleId) {
  return Object.values(SCIENTIFIC_DIAGRAMS).filter(d => 
    d.subject === subject && d.moduleId === Number(moduleId)
  );
}
