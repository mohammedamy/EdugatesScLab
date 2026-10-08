// Edugates-ClipSAT Science Labs - Generator for 30 Authentic Biology Diagrams
import fs from "fs";
import { SCIENTIFIC_DIAGRAMS } from "../data/scientific-diagrams.js";

// Extract 6 existing BIO diagrams from master
const existingIds = [
  "bio_pedigree_chart",
  "bio_membrane_fluid_mosaic",
  "bio_action_potential",
  "bio_pcr_thermocycling",
  "bio_dna_replication_fork",
  "bio_photosynthesis_z_scheme"
];

const bio30 = {};
for (const id of existingIds) {
  if (SCIENTIFIC_DIAGRAMS[id]) {
    bio30[id] = SCIENTIFIC_DIAGRAMS[id];
  } else {
    throw new Error(`Missing expected existing BIO diagram: ${id}`);
  }
}

// 24 New Domain-Authentic Vector-Calibrated Biology Diagrams
const newBioDiagrams = {
  bio_trophic_energy_pyramid: {
    id: "bio_trophic_energy_pyramid",
    subject: "BIO",
    moduleId: 1,
    title: "Trophic Energy Pyramid (10% Ecological Rule)",
    caption: "Figure: Ecological Trophic Energy Transfer Pyramid showing 90% Metabolic Dissipation",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Ecological Energy Pyramid (10% Transfer Efficiency)</text>
      <!-- Apex Tier 4: Tertiary Consumers -->
      <polygon points="270,45 220,95 320,95" fill="#ef4444" stroke="#ffffff" stroke-width="1.5"/>
      <text x="270" y="78" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">Tertiary (10 J)</text>
      <!-- Tier 3: Secondary Consumers -->
      <polygon points="220,95 320,95 360,145 180,145" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5"/>
      <text x="270" y="125" fill="#0f172a" font-size="10" font-weight="800" text-anchor="middle">Secondary Consumers (100 J)</text>
      <!-- Tier 2: Primary Consumers -->
      <polygon points="180,145 360,145 400,195 140,195" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5"/>
      <text x="270" y="175" fill="#0f172a" font-size="10" font-weight="800" text-anchor="middle">Primary Consumers / Herbivores (1,000 J)</text>
      <!-- Tier 1: Primary Producers -->
      <polygon points="140,195 400,195 440,245 100,245" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/>
      <text x="270" y="225" fill="#ffffff" font-size="11" font-weight="800" text-anchor="middle">Primary Producers / Photoautotrophs (10,000 J)</text>
      <!-- Heat Loss Arrows (Right side) -->
      <path d="M 330 85 Q 430 85 450 75" fill="none" stroke="#f43f5e" stroke-width="2"/>
      <polygon points="455,73 445,72 448,80" fill="#f43f5e"/>
      <path d="M 370 135 Q 430 135 450 125" fill="none" stroke="#f43f5e" stroke-width="2"/>
      <polygon points="455,123 445,122 448,130" fill="#f43f5e"/>
      <path d="M 410 185 Q 450 185 470 175" fill="none" stroke="#f43f5e" stroke-width="2"/>
      <polygon points="475,173 465,172 468,180" fill="#f43f5e"/>
      <text x="470" y="105" fill="#f43f5e" font-size="9" font-weight="800">90% Energy</text>
      <text x="470" y="118" fill="#f43f5e" font-size="9" font-weight="800">Lost as Heat</text>
      <!-- Sun Energy Input -->
      <circle cx="50" cy="205" r="18" fill="#facc15" stroke="#f59e0b" stroke-width="2"/>
      <text x="50" y="240" fill="#facc15" font-size="9" font-weight="700" text-anchor="middle">Solar Energy</text>
      <line x1="70" y1="210" x2="100" y2="215" stroke="#facc15" stroke-width="2"/>
      <polygon points="105,216 95,212 97,220" fill="#facc15"/>
      <!-- Bottom Summary -->
      <rect x="50" y="260" width="440" height="26" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <text x="270" y="277" fill="#f8fafc" font-size="9.5" font-weight="700" text-anchor="middle">Only ~10% of biomass energy passes to next trophic level, limiting apex predator population size</text>
    </svg>`
  },

  bio_population_growth_curves: {
    id: "bio_population_growth_curves",
    subject: "BIO",
    moduleId: 2,
    title: "Population Dynamics: Exponential vs Logistic Growth",
    caption: "Figure: J-Curve (Biotic Potential) vs S-Curve showing Environmental Resistance and Carrying Capacity K",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Population Growth: Exponential (J) vs Logistic (S)</text>
      <line x1="70" y1="240" x2="490" y2="240" stroke="#94a3b8" stroke-width="2"/>
      <line x1="70" y1="240" x2="70" y2="40" stroke="#94a3b8" stroke-width="2"/>
      <polygon points="495,240 485,235 485,245" fill="#94a3b8"/>
      <polygon points="70,35 65,45 75,45" fill="#94a3b8"/>
      <text x="24" y="140" fill="#38bdf8" font-size="11" font-weight="700" transform="rotate(-90 24 140)" text-anchor="middle">Population Size (N)</text>
      <text x="280" y="272" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">Time (t)</text>
      <!-- Carrying Capacity K Line -->
      <line x1="70" y1="110" x2="490" y2="110" stroke="#ef4444" stroke-width="2" stroke-dasharray="4"/>
      <text x="62" y="114" fill="#ef4444" font-size="11" font-weight="800" text-anchor="end">K</text>
      <text x="480" y="102" fill="#ef4444" font-size="9.5" font-weight="800" text-anchor="end">Carrying Capacity (K)</text>
      <!-- Exponential Growth J-Curve (Red/Pink) -->
      <path d="M 70 235 Q 220 230 260 50" fill="none" stroke="#ec4899" stroke-width="3"/>
      <text x="270" y="60" fill="#f472b6" font-size="10.5" font-weight="800">Exponential J-Curve: dN/dt = rN</text>
      <!-- Logistic Growth S-Curve (Green/Cyan) -->
      <path d="M 70 235 Q 160 230 230 170 Q 300 115 480 110" fill="none" stroke="#10b981" stroke-width="3.5"/>
      <text x="350" y="135" fill="#34d399" font-size="10.5" font-weight="800">Logistic S-Curve: dN/dt = rN(K - N)/K</text>
      <!-- Environmental Resistance Shading Callout -->
      <rect x="300" y="160" width="180" height="40" rx="4" fill="#1e293b" stroke="#f59e0b" stroke-width="1"/>
      <text x="390" y="176" fill="#f59e0b" font-size="9" font-weight="800" text-anchor="middle">Environmental Resistance</text>
      <text x="390" y="190" fill="#cbd5e1" font-size="8" text-anchor="middle">Density-dependent mortality stabilizes at K</text>
    </svg>`
  },

  bio_carbon_biogeochemical_cycle: {
    id: "bio_carbon_biogeochemical_cycle",
    subject: "BIO",
    moduleId: 3,
    title: "Global Biogeochemical Carbon Cycle Fluxes",
    caption: "Figure: Biospheric Carbon Reservoir Exchange: Photosynthesis, Respiration, Combustion, and Ocean Sink",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Biogeochemical Carbon Cycle Reservoirs &amp; Fluxes</text>
      <!-- Atmospheric CO2 Reservoir Box -->
      <rect x="180" y="45" width="180" height="40" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
      <text x="270" y="65" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">Atmospheric CO₂ Pool</text>
      <text x="270" y="78" fill="#cbd5e1" font-size="9" text-anchor="middle">~850 Gt C (Expanding)</text>
      <!-- Terrestrial Vegetation / Forest (Left) -->
      <rect x="40" y="150" width="120" height="60" rx="6" fill="#065f46" stroke="#10b981" stroke-width="1.5"/>
      <text x="100" y="175" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">Terrestrial Plants</text>
      <text x="100" y="195" fill="#a7f3d0" font-size="8.5" text-anchor="middle">Photosynthesis Sink</text>
      <!-- Soil & Decomposers -->
      <rect x="40" y="225" width="120" height="45" rx="4" fill="#334155" stroke="#64748b" stroke-width="1.5"/>
      <text x="100" y="245" fill="#cbd5e1" font-size="9" font-weight="700" text-anchor="middle">Soil Microbial Organic</text>
      <text x="100" y="258" fill="#94a3b8" font-size="8" text-anchor="middle">Respiration</text>
      <!-- Fossil Fuel Combustion (Center) -->
      <rect x="210" y="170" width="120" height="50" rx="6" fill="#78350f" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="270" y="192" fill="#ffffff" font-size="9.5" font-weight="800" text-anchor="middle">Fossil Fuels</text>
      <text x="270" y="208" fill="#fde68a" font-size="8.5" text-anchor="middle">Combustion (+9 Gt/yr)</text>
      <!-- Marine Ocean Reservoir (Right) -->
      <rect x="380" y="150" width="120" height="85" rx="6" fill="#0c4a6e" stroke="#0284c7" stroke-width="1.5"/>
      <text x="440" y="175" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">Ocean Surface</text>
      <text x="440" y="192" fill="#bae6fd" font-size="8.5" text-anchor="middle">Gas Exchange</text>
      <text x="440" y="215" fill="#38bdf8" font-size="8.5" font-weight="700" text-anchor="middle">Deep Sediments</text>
      <!-- Flow Arrows -->
      <!-- Photosynthesis (Down) -->
      <line x1="200" y1="85" x2="140" y2="150" stroke="#10b981" stroke-width="2"/>
      <polygon points="140,150 144,142 149,148" fill="#10b981"/>
      <text x="155" y="112" fill="#10b981" font-size="8.5" font-weight="800">Photosynthesis</text>
      <!-- Respiration (Up) -->
      <line x1="120" y1="150" x2="220" y2="85" stroke="#ef4444" stroke-width="2"/>
      <polygon points="220,85 212,89 216,95" fill="#ef4444"/>
      <!-- Combustion (Up) -->
      <line x1="270" y1="170" x2="270" y2="90" stroke="#f59e0b" stroke-width="2.5"/>
      <polygon points="270,85 266,95 274,95" fill="#f59e0b"/>
      <!-- Ocean dissolve -->
      <line x1="330" y1="85" x2="400" y2="150" stroke="#0284c7" stroke-width="2"/>
      <polygon points="400,150 395,142 390,147" fill="#0284c7"/>
    </svg>`
  },

  bio_enzyme_catalysis_profile: {
    id: "bio_enzyme_catalysis_profile",
    subject: "BIO",
    moduleId: 4,
    title: "Enzyme Catalysis Reaction Energy Coordinate",
    caption: "Figure: Free Energy Diagram showing Lowered Activation Energy (Ea) with Intact Overall ΔG",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Enzyme Catalysis: Activation Energy Lowering</text>
      <line x1="70" y1="240" x2="490" y2="240" stroke="#94a3b8" stroke-width="2"/>
      <line x1="70" y1="240" x2="70" y2="40" stroke="#94a3b8" stroke-width="2"/>
      <polygon points="495,240 485,235 485,245" fill="#94a3b8"/>
      <polygon points="70,35 65,45 75,45" fill="#94a3b8"/>
      <text x="24" y="140" fill="#38bdf8" font-size="11" font-weight="700" transform="rotate(-90 24 140)" text-anchor="middle">Gibbs Free Energy G</text>
      <text x="280" y="272" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">Reaction Coordinate Progress</text>
      <!-- Substrates Ground State -->
      <line x1="70" y1="160" x2="140" y2="160" stroke="#38bdf8" stroke-width="3"/>
      <text x="105" y="152" fill="#38bdf8" font-size="10.5" font-weight="800" text-anchor="middle">Substrates (S)</text>
      <!-- Products State -->
      <line x1="410" y1="210" x2="480" y2="210" stroke="#34d399" stroke-width="3"/>
      <text x="445" y="202" fill="#34d399" font-size="10.5" font-weight="800" text-anchor="middle">Products (P)</text>
      <!-- Uncatalyzed Path (High curve, red) -->
      <path d="M 140 160 C 200 160 220 55 270 55 C 320 55 350 210 410 210" fill="none" stroke="#ef4444" stroke-width="3"/>
      <text x="270" y="45" fill="#ef4444" font-size="10" font-weight="800" text-anchor="middle">Uncatalyzed Ea (High Barrier)</text>
      <!-- Catalyzed Path (Lower curve, green) -->
      <path d="M 140 160 C 200 160 220 115 270 115 C 320 115 350 210 410 210" fill="none" stroke="#10b981" stroke-width="3"/>
      <text x="270" y="105" fill="#34d399" font-size="10" font-weight="800" text-anchor="middle">Enzyme-Catalyzed Ea</text>
      <!-- Delta G Bracket -->
      <line x1="485" y1="160" x2="485" y2="210" stroke="#f59e0b" stroke-width="2"/>
      <text x="495" y="190" fill="#f59e0b" font-size="10" font-weight="800">ΔG &lt; 0 (Exergonic, Unaltered)</text>
    </svg>`
  },

  bio_peptide_bond_formation: {
    id: "bio_peptide_bond_formation",
    subject: "BIO",
    moduleId: 5,
    title: "Peptide Bond Dehydration Condensation Synthesis",
    caption: "Figure: Biochemical Condensation Synthesis of Amide Peptide Bond releasing H2O",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Peptide Bond Condensation Synthesis (Amino Acids → Dipeptide)</text>
      <!-- Amino Acid 1 (Left) -->
      <rect x="30" y="60" width="200" height="150" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="130" y="80" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">Amino Acid 1</text>
      <text x="60" y="140" fill="#94a3b8" font-size="13" font-weight="800">H₂N —</text>
      <circle cx="120" cy="135" r="14" fill="#0284c7"/>
      <text x="120" y="140" fill="#ffffff" font-size="11" font-weight="800" text-anchor="middle">C_α</text>
      <text x="120" y="105" fill="#f59e0b" font-size="10" font-weight="700" text-anchor="middle">R₁</text>
      <text x="160" y="140" fill="#ef4444" font-size="13" font-weight="800">— C = O</text>
      <!-- OH group targeted for release -->
      <circle cx="215" cy="155" r="14" fill="#ef4444" fill-opacity="0.3" stroke="#ef4444" stroke-dasharray="2"/>
      <text x="215" y="160" fill="#ef4444" font-size="11" font-weight="800" text-anchor="middle">-OH</text>
      <!-- Amino Acid 2 (Right) -->
      <rect x="250" y="60" width="200" height="150" rx="8" fill="#1e293b" stroke="#34d399" stroke-width="1.5"/>
      <text x="350" y="80" fill="#34d399" font-size="11" font-weight="800" text-anchor="middle">Amino Acid 2</text>
      <!-- H atom targeted for release -->
      <circle cx="265" cy="155" r="12" fill="#ef4444" fill-opacity="0.3" stroke="#ef4444" stroke-dasharray="2"/>
      <text x="265" y="160" fill="#ef4444" font-size="11" font-weight="800" text-anchor="middle">H-</text>
      <text x="290" y="140" fill="#94a3b8" font-size="13" font-weight="800">N —</text>
      <circle cx="350" cy="135" r="14" fill="#059669"/>
      <text x="350" y="140" fill="#ffffff" font-size="11" font-weight="800" text-anchor="middle">C_α</text>
      <text x="350" y="105" fill="#f59e0b" font-size="10" font-weight="700" text-anchor="middle">R₂</text>
      <text x="390" y="140" fill="#94a3b8" font-size="13" font-weight="800">— COOH</text>
      <!-- Water Release Box -->
      <path d="M 240 170 Q 240 230 240 240" fill="none" stroke="#ef4444" stroke-width="2"/>
      <polygon points="240,245 236,235 244,235" fill="#ef4444"/>
      <circle cx="240" cy="265" r="16" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="240" y="270" fill="#ffffff" font-size="11" font-weight="800" text-anchor="middle">+ H₂O</text>
      <!-- Resulting Peptide Bond Indicator -->
      <rect x="290" y="240" width="220" height="45" rx="6" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="400" y="258" fill="#f59e0b" font-size="10.5" font-weight="800" text-anchor="middle">Planar Peptide Linkage (-CO-NH-)</text>
      <text x="400" y="273" fill="#cbd5e1" font-size="8.5" text-anchor="middle">Partial double bond character prevents rotation</text>
    </svg>`
  },

  bio_cell_ultrastructure_comparison: {
    id: "bio_cell_ultrastructure_comparison",
    subject: "BIO",
    moduleId: 6,
    title: "Cell Ultrastructure: Prokaryote vs Eukaryote",
    caption: "Figure: Comparative Cytology: Membrane Compartmentalization in Eukaryotes vs Nucleoid in Bacteria",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Cellular Compartmentalization: Prokaryote vs. Eukaryote</text>
      <!-- Panel 1: Prokaryote (Bacterium) -->
      <rect x="30" y="45" width="225" height="210" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
      <text x="142" y="65" fill="#10b981" font-size="11" font-weight="800" text-anchor="middle">PROKARYOTE (Bacterium)</text>
      <!-- Capsule & Wall -->
      <rect x="55" y="85" width="175" height="110" rx="40" fill="#065f46" stroke="#34d399" stroke-width="2"/>
      <!-- Nucleoid DNA (Non-membrane bound tangled loop) -->
      <path d="M 110 130 Q 140 100 160 140 Q 130 160 110 130" fill="none" stroke="#facc15" stroke-width="3"/>
      <text x="142" y="140" fill="#facc15" font-size="9" font-weight="800" text-anchor="middle">Nucleoid DNA</text>
      <!-- 70S Ribosomes -->
      <circle cx="85" cy="115" r="2.5" fill="#ffffff"/><circle cx="95" cy="160" r="2.5" fill="#ffffff"/><circle cx="190" cy="120" r="2.5" fill="#ffffff"/>
      <text x="142" y="215" fill="#94a3b8" font-size="9" text-anchor="middle">70S Ribosomes | No Organelles</text>
      <text x="142" y="235" fill="#a7f3d0" font-size="9" font-weight="700" text-anchor="middle">Peptidoglycan Cell Wall</text>
      <!-- Panel 2: Eukaryote (Animal Cell) -->
      <rect x="285" y="45" width="225" height="210" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
      <text x="397" y="65" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">EUKARYOTE (Animal Cell)</text>
      <!-- Plasma membrane boundary -->
      <ellipse cx="397" cy="140" rx="90" ry="60" fill="#0c4a6e" stroke="#0284c7" stroke-width="2"/>
      <!-- Double-Membrane Nucleus with Nucleolus -->
      <circle cx="365" cy="140" r="25" fill="#1e293b" stroke="#a855f7" stroke-width="2"/>
      <circle cx="365" cy="140" r="8" fill="#ec4899"/>
      <text x="365" y="125" fill="#c084fc" font-size="8.5" font-weight="800" text-anchor="middle">Nucleus</text>
      <!-- Mitochondria -->
      <ellipse cx="440" cy="120" rx="14" ry="8" fill="#78350f" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="440" y="140" fill="#f59e0b" font-size="8" font-weight="700" text-anchor="middle">Mito</text>
      <!-- Endoplasmic Reticulum folds -->
      <path d="M 335 140 Q 330 165 350 170" fill="none" stroke="#38bdf8" stroke-width="2"/>
      <text x="397" y="215" fill="#94a3b8" font-size="9" text-anchor="middle">80S Ribosomes | Endomembrane System</text>
      <text x="397" y="235" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">Membrane-Bound Organelles</text>
      <text x="270" y="278" fill="#cbd5e1" font-size="10" font-weight="600" text-anchor="middle">Eukaryotic compartmentalization enables localized enzyme microenvironments</text>
    </svg>`
  },

  bio_osmosis_tonicity_cells: {
    id: "bio_osmosis_tonicity_cells",
    subject: "BIO",
    moduleId: 7,
    title: "Osmosis & Tonicity in Animal and Plant Cells",
    caption: "Figure: Cellular Morphological Responses in Hypotonic, Isotonic, and Hypertonic Solutions",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Tonicity &amp; Osmotic Effects on Living Cells</text>
      <!-- Column 1: Hypotonic -->
      <rect x="25" y="45" width="155" height="210" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
      <text x="102" y="66" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">HYPOTONIC</text>
      <text x="102" y="80" fill="#94a3b8" font-size="8.5" text-anchor="middle">[Solute]_out &lt; [Solute]_in</text>
      <!-- RBC Lysed -->
      <circle cx="102" cy="115" r="22" fill="#ef4444" stroke="#f87171" stroke-width="1.5" stroke-dasharray="3"/>
      <text x="102" y="119" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">Lysed (Burst)</text>
      <!-- Plant Cell Turgid -->
      <rect x="62" y="155" width="80" height="50" rx="4" fill="#065f46" stroke="#10b981" stroke-width="2"/>
      <rect x="67" y="160" width="70" height="40" rx="3" fill="#0284c7" fill-opacity="0.5"/>
      <text x="102" y="184" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">Turgid (Normal)</text>
      <text x="102" y="235" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">Net H₂O Influx →</text>
      <!-- Column 2: Isotonic -->
      <rect x="192" y="45" width="155" height="210" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
      <text x="269" y="66" fill="#34d399" font-size="11" font-weight="800" text-anchor="middle">ISOTONIC</text>
      <text x="269" y="80" fill="#94a3b8" font-size="8.5" text-anchor="middle">[Solute]_out = [Solute]_in</text>
      <!-- RBC Normal biconcave -->
      <ellipse cx="269" cy="115" rx="20" ry="14" fill="#ef4444" stroke="#ffffff" stroke-width="1.5"/>
      <ellipse cx="269" cy="115" rx="8" ry="5" fill="#7f1d1d"/>
      <text x="269" y="145" fill="#f8fafc" font-size="9" font-weight="700" text-anchor="middle">Normal RBC</text>
      <!-- Plant Cell Flaccid -->
      <rect x="229" y="155" width="80" height="50" rx="4" fill="#065f46" stroke="#10b981" stroke-width="2"/>
      <rect x="237" y="163" width="64" height="34" rx="3" fill="#0284c7" fill-opacity="0.3"/>
      <text x="269" y="184" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">Flaccid</text>
      <text x="269" y="235" fill="#34d399" font-size="9" font-weight="700" text-anchor="middle">← H₂O Equilibrium →</text>
      <!-- Column 3: Hypertonic -->
      <rect x="360" y="45" width="155" height="210" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
      <text x="437" y="66" fill="#ef4444" font-size="11" font-weight="800" text-anchor="middle">HYPERTONIC</text>
      <text x="437" y="80" fill="#94a3b8" font-size="8.5" text-anchor="middle">[Solute]_out &gt; [Solute]_in</text>
      <!-- RBC Shriveled / Crenated -->
      <polygon points="437,95 447,105 457,102 452,115 458,128 445,127 437,137 429,127 416,128 422,115 417,102 427,105" fill="#ef4444"/>
      <text x="437" y="145" fill="#f8fafc" font-size="9" font-weight="700" text-anchor="middle">Shriveled (Crenated)</text>
      <!-- Plant Cell Plasmolyzed -->
      <rect x="397" y="155" width="80" height="50" rx="4" fill="#065f46" stroke="#10b981" stroke-width="2"/>
      <ellipse cx="437" cy="180" rx="20" ry="12" fill="#0284c7" fill-opacity="0.5"/>
      <text x="437" y="184" fill="#facc15" font-size="8.5" font-weight="800" text-anchor="middle">Plasmolyzed</text>
      <text x="437" y="235" fill="#ef4444" font-size="9" font-weight="700" text-anchor="middle">← Net H₂O Efflux</text>
      <text x="270" y="278" fill="#cbd5e1" font-size="10" font-weight="600" text-anchor="middle">Plant cell wall prevents lysis in hypotonic media, generating vital turgor pressure</text>
    </svg>`
  },

  bio_mitochondria_chemiosmosis: {
    id: "bio_mitochondria_chemiosmosis",
    subject: "BIO",
    moduleId: 8,
    title: "Mitochondrial Electron Transport & Chemiosmosis",
    caption: "Figure: Inner Mitochondrial Membrane Complexes I-IV, Proton Gradient, and F0F1-ATP Synthase",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Cellular Respiration: ETC &amp; Oxidative Phosphorylation</text>
      <!-- Intermembrane Space (High [H+], acidic, + charge) -->
      <rect x="40" y="45" width="460" height="55" fill="#0284c7" fill-opacity="0.25"/>
      <text x="270" y="65" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">INTERMEMBRANE SPACE (High H⁺ Concentration, Low pH)</text>
      <text x="120" y="85" fill="#38bdf8" font-size="11" font-weight="800">H⁺</text><text x="220" y="85" fill="#38bdf8" font-size="11" font-weight="800">H⁺</text><text x="320" y="85" fill="#38bdf8" font-size="11" font-weight="800">H⁺</text><text x="420" y="85" fill="#38bdf8" font-size="11" font-weight="800">H⁺</text>
      <!-- Inner Mitochondrial Membrane Bilayer -->
      <rect x="40" y="100" width="460" height="60" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
      <text x="45" y="135" fill="#94a3b8" font-size="9" transform="rotate(-90 45 135)" text-anchor="middle">Inner Membrane</text>
      <!-- Complex I -->
      <rect x="90" y="90" width="45" height="80" rx="6" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="112" y="135" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">I</text>
      <!-- Complex II -->
      <rect x="160" y="115" width="40" height="55" rx="6" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="180" y="145" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">II</text>
      <!-- Complex III -->
      <rect x="225" y="90" width="45" height="80" rx="6" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="247" y="135" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">III</text>
      <!-- Complex IV (Cytochrome c oxidase) -->
      <rect x="295" y="90" width="45" height="80" rx="6" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="317" y="135" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">IV</text>
      <!-- ATP Synthase Rotary Motor -->
      <rect x="390" y="90" width="30" height="60" rx="4" fill="#f59e0b" stroke="#fbbf24" stroke-width="1.5"/>
      <circle cx="405" cy="180" r="22" fill="#d97706" stroke="#f59e0b" stroke-width="2"/>
      <text x="405" y="185" fill="#ffffff" font-size="9.5" font-weight="800" text-anchor="middle">F₁ Motor</text>
      <text x="405" y="80" fill="#f59e0b" font-size="9" font-weight="800" text-anchor="middle">F₀ Channel</text>
      <!-- H+ Flow through ATP Synthase (Down gradient) -->
      <path d="M 405 70 L 405 155" fill="none" stroke="#facc15" stroke-width="3"/>
      <polygon points="405,160 401,150 409,150" fill="#facc15"/>
      <!-- Matrix Area -->
      <rect x="40" y="160" width="460" height="90" fill="#0f172a" fill-opacity="0.8"/>
      <text x="200" y="215" fill="#a7f3d0" font-size="10" font-weight="800">MITOCHONDRIAL MATRIX</text>
      <!-- NADH to NAD+ -->
      <text x="110" y="200" fill="#facc15" font-size="8.5" font-weight="700">NADH → NAD⁺ + H⁺</text>
      <!-- Oxygen Reduction to Water at IV -->
      <text x="290" y="200" fill="#ef4444" font-size="8.5" font-weight="800">½O₂ + 2H⁺ → H₂O</text>
      <!-- ATP Generation -->
      <text x="405" y="225" fill="#34d399" font-size="10" font-weight="800" text-anchor="middle">ADP + Pᵢ → ATP</text>
      <text x="270" y="278" fill="#cbd5e1" font-size="10" font-weight="600" text-anchor="middle">Proton-motive force (PMF) drives rotary catalytic synthesis of ~30-32 ATP per glucose</text>
    </svg>`
  },

  bio_mitosis_stages_karyokinesis: {
    id: "bio_mitosis_stages_karyokinesis",
    subject: "BIO",
    moduleId: 9,
    title: "Mitosis Four Stages of Karyokinesis",
    caption: "Figure: Mitotic Nuclear Division: Prophase, Metaphase, Anaphase, and Telophase with Spindle Microtubules",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Mitosis: The 4 Phases of Nuclear Division (PMAT)</text>
      <!-- Stage 1: Prophase -->
      <circle cx="80" cy="120" r="48" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
      <circle cx="80" cy="120" r="28" fill="#0c4a6e" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3"/>
      <!-- Condensing X chromosomes -->
      <text x="73" y="118" fill="#ec4899" font-size="12" font-weight="800">X</text>
      <text x="85" y="130" fill="#38bdf8" font-size="12" font-weight="800">X</text>
      <text x="80" y="195" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">PROPHASE</text>
      <text x="80" y="215" fill="#94a3b8" font-size="8.5" text-anchor="middle">Chromosomes Condense</text>
      <text x="80" y="228" fill="#94a3b8" font-size="8.5" text-anchor="middle">Envelope Breaks Down</text>
      <!-- Stage 2: Metaphase -->
      <circle cx="205" cy="120" r="48" fill="#1e293b" stroke="#34d399" stroke-width="2"/>
      <!-- Centrosomes at poles -->
      <circle cx="205" cy="76" r="3" fill="#f59e0b"/><circle cx="205" cy="164" r="3" fill="#f59e0b"/>
      <!-- Spindle fibers -->
      <line x1="205" y1="76" x2="205" y2="164" stroke="#64748b" stroke-width="1" stroke-dasharray="2"/>
      <!-- Chromosomes on equatorial plate -->
      <text x="195" y="124" fill="#ec4899" font-size="12" font-weight="800">X</text>
      <text x="207" y="124" fill="#38bdf8" font-size="12" font-weight="800">X</text>
      <text x="205" y="195" fill="#34d399" font-size="11" font-weight="800" text-anchor="middle">METAPHASE</text>
      <text x="205" y="215" fill="#94a3b8" font-size="8.5" text-anchor="middle">Equatorial Alignment</text>
      <text x="205" y="228" fill="#94a3b8" font-size="8.5" text-anchor="middle">Kinetochore Attached</text>
      <!-- Stage 3: Anaphase -->
      <circle cx="330" cy="120" r="48" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
      <!-- Separating chromatids V-shapes -->
      <text x="325" y="100" fill="#ec4899" font-size="11" font-weight="800">∧ ∧</text>
      <text x="325" y="145" fill="#38bdf8" font-size="11" font-weight="800">∨ ∨</text>
      <text x="330" y="195" fill="#f59e0b" font-size="11" font-weight="800" text-anchor="middle">ANAPHASE</text>
      <text x="330" y="215" fill="#94a3b8" font-size="8.5" text-anchor="middle">Sister Chromatids Separate</text>
      <text x="330" y="228" fill="#94a3b8" font-size="8.5" text-anchor="middle">Microtubules Shorten</text>
      <!-- Stage 4: Telophase & Cytokinesis -->
      <ellipse cx="455" cy="120" rx="55" ry="46" fill="#1e293b" stroke="#ec4899" stroke-width="2"/>
      <!-- Cleavage furrow pinch -->
      <path d="M 455 74 Q 452 120 455 166" fill="none" stroke="#f43f5e" stroke-width="2" stroke-dasharray="2"/>
      <circle cx="430" cy="120" r="16" fill="#0c4a6e" stroke="#ec4899" stroke-width="1"/>
      <circle cx="480" cy="120" r="16" fill="#0c4a6e" stroke="#ec4899" stroke-width="1"/>
      <text x="455" y="195" fill="#f472b6" font-size="11" font-weight="800" text-anchor="middle">TELOPHASE</text>
      <text x="455" y="215" fill="#94a3b8" font-size="8.5" text-anchor="middle">Nuclear Envelope Reforms</text>
      <text x="455" y="228" fill="#94a3b8" font-size="8.5" text-anchor="middle">2 Identical Diploid (2n)</text>
      <text x="270" y="278" fill="#cbd5e1" font-size="10" font-weight="600" text-anchor="middle">Mitosis yields two genetically identical daughter cells maintaining chromosome number (2n)</text>
    </svg>`
  },

  bio_meiosis_crossing_over: {
    id: "bio_meiosis_crossing_over",
    subject: "BIO",
    moduleId: 10,
    title: "Meiotic Crossing Over & Homologous Recombination",
    caption: "Figure: Prophase I Chiasma Formation between Non-Sister Chromatids generating Genetic Diversity",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Meiosis Prophase I: Homologous Recombination (Crossing Over)</text>
      <!-- Panel 1: Synapsed Tetrad with Chiasma -->
      <rect x="40" y="50" width="220" height="195" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
      <text x="150" y="70" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">SYNAPSED TETRAD (Bivalent)</text>
      <!-- Maternal Chromatids (Blue) -->
      <line x1="120" y1="90" x2="120" y2="210" stroke="#38bdf8" stroke-width="6" stroke-linecap="round"/>
      <line x1="140" y1="90" x2="160" y2="160" stroke="#38bdf8" stroke-width="6" stroke-linecap="round"/>
      <line x1="160" y1="160" x2="140" y2="210" stroke="#38bdf8" stroke-width="6" stroke-linecap="round"/>
      <!-- Paternal Chromatids (Red/Pink) with Crossing Over -->
      <line x1="160" y1="90" x2="140" y2="160" stroke="#ef4444" stroke-width="6" stroke-linecap="round"/>
      <line x1="140" y1="160" x2="160" y2="210" stroke="#ef4444" stroke-width="6" stroke-linecap="round"/>
      <line x1="180" y1="90" x2="180" y2="210" stroke="#ef4444" stroke-width="6" stroke-linecap="round"/>
      <!-- Chiasma Callout -->
      <circle cx="150" cy="160" r="9" fill="none" stroke="#facc15" stroke-width="2"/>
      <text x="150" y="235" fill="#facc15" font-size="10" font-weight="800" text-anchor="middle">Chiasma Crossing-Over Site</text>
      <!-- Panel 2: Resulting 4 Gametic Chromatids -->
      <rect x="280" y="50" width="220" height="195" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
      <text x="390" y="70" fill="#34d399" font-size="11" font-weight="800" text-anchor="middle">RECOMBINANT CHROMATIDS</text>
      <!-- Chromatid 1: Pure Maternal -->
      <line x1="320" y1="90" x2="320" y2="200" stroke="#38bdf8" stroke-width="6" stroke-linecap="round"/>
      <!-- Chromatid 2: Recombinant Maternal + Paternal tip -->
      <line x1="360" y1="90" x2="360" y2="160" stroke="#38bdf8" stroke-width="6" stroke-linecap="round"/>
      <line x1="360" y1="160" x2="360" y2="200" stroke="#ef4444" stroke-width="6" stroke-linecap="round"/>
      <!-- Chromatid 3: Recombinant Paternal + Maternal tip -->
      <line x1="410" y1="90" x2="410" y2="160" stroke="#ef4444" stroke-width="6" stroke-linecap="round"/>
      <line x1="410" y1="160" x2="410" y2="200" stroke="#38bdf8" stroke-width="6" stroke-linecap="round"/>
      <!-- Chromatid 4: Pure Paternal -->
      <line x1="450" y1="90" x2="450" y2="200" stroke="#ef4444" stroke-width="6" stroke-linecap="round"/>
      <text x="385" y="225" fill="#facc15" font-size="9" font-weight="700" text-anchor="middle">2 Parental &amp; 2 Recombinant Allele Sets</text>
      <text x="270" y="278" fill="#cbd5e1" font-size="10" font-weight="600" text-anchor="middle">Nonsister chromatid exchange at chiasmata produces nonparental allele combinations in gametes</text>
    </svg>`
  },

  bio_dihybrid_punnett_square: {
    id: "bio_dihybrid_punnett_square",
    subject: "BIO",
    moduleId: 11,
    title: "Mendelian Dihybrid Cross 16-Square Punnett Grid",
    caption: "Figure: Two-Factor Cross RrYy x RrYy demonstrating Independent Assortment and 9:3:3:1 Phenotype Ratio",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="22" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Mendelian Dihybrid Cross: RrYy × RrYy (9:3:3:1)</text>
      <!-- 4x4 Grid -->
      <g stroke="#64748b" stroke-width="1.5">
        <line x1="70" y1="50" x2="270" y2="50"/><line x1="70" y1="95" x2="270" y2="95"/>
        <line x1="70" y1="140" x2="270" y2="140"/><line x1="70" y1="185" x2="270" y2="185"/>
        <line x1="70" y1="230" x2="270" y2="230"/>
        <line x1="70" y1="50" x2="70" y2="230"/><line x1="120" y1="50" x2="120" y2="230"/>
        <line x1="170" y1="50" x2="170" y2="230"/><line x1="220" y1="50" x2="220" y2="230"/>
        <line x1="270" y1="50" x2="270" y2="230"/>
      </g>
      <!-- Top Gametes -->
      <text x="95" y="44" fill="#facc15" font-size="10" font-weight="800" text-anchor="middle">RY</text>
      <text x="145" y="44" fill="#facc15" font-size="10" font-weight="800" text-anchor="middle">Ry</text>
      <text x="195" y="44" fill="#facc15" font-size="10" font-weight="800" text-anchor="middle">rY</text>
      <text x="245" y="44" fill="#facc15" font-size="10" font-weight="800" text-anchor="middle">ry</text>
      <!-- Side Gametes -->
      <text x="60" y="76" fill="#facc15" font-size="10" font-weight="800" text-anchor="end">RY</text>
      <text x="60" y="121" fill="#facc15" font-size="10" font-weight="800" text-anchor="end">Ry</text>
      <text x="60" y="166" fill="#facc15" font-size="10" font-weight="800" text-anchor="end">rY</text>
      <text x="60" y="211" fill="#facc15" font-size="10" font-weight="800" text-anchor="end">ry</text>
      <!-- Selected Genotypes Samples -->
      <text x="95" y="75" fill="#ffffff" font-size="8.5" font-weight="700" text-anchor="middle">RRYY</text>
      <text x="145" y="75" fill="#ffffff" font-size="8.5" font-weight="700" text-anchor="middle">RRYy</text>
      <text x="195" y="75" fill="#ffffff" font-size="8.5" font-weight="700" text-anchor="middle">RrYY</text>
      <text x="245" y="75" fill="#ffffff" font-size="8.5" font-weight="700" text-anchor="middle">RrYy</text>
      <text x="245" y="215" fill="#ef4444" font-size="8.5" font-weight="800" text-anchor="middle">rryy</text>
      <!-- Summary Legend (Right side) -->
      <rect x="295" y="48" width="220" height="195" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <text x="405" y="72" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">PHENOTYPIC RATIO (9:3:3:1)</text>
      <circle cx="315" cy="100" r="7" fill="#facc15"/>
      <text x="330" y="104" fill="#ffffff" font-size="10" font-weight="700">9/16 Round Yellow (R_Y_)</text>
      <circle cx="315" cy="130" r="7" fill="#10b981"/>
      <text x="330" y="134" fill="#ffffff" font-size="10" font-weight="700">3/16 Round Green (R_yy)</text>
      <polygon points="315,152 308,165 322,165" fill="#facc15"/>
      <text x="330" y="164" fill="#ffffff" font-size="10" font-weight="700">3/16 Wrinkled Yellow (rrY_)</text>
      <polygon points="315,182 308,195 322,195" fill="#10b981"/>
      <text x="330" y="194" fill="#ffffff" font-size="10" font-weight="700">1/16 Wrinkled Green (rryy)</text>
      <text x="270" y="278" fill="#cbd5e1" font-size="9.5" font-weight="600" text-anchor="middle">Law of Independent Assortment: Alleles for separate traits segregate independently</text>
    </svg>`
  },

  bio_translation_ribosome_elongation: {
    id: "bio_translation_ribosome_elongation",
    subject: "BIO",
    moduleId: 12,
    title: "Ribosomal Translation Elongation Cycle (A, P, E Sites)",
    caption: "Figure: Molecular Translation: mRNA Triplet Codons, tRNA Anticodons, and Growing Polypeptide",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Translation Elongation at the Ribosome (A, P, E Sites)</text>
      <!-- mRNA Ribbon (5' to 3') -->
      <rect x="40" y="210" width="460" height="20" rx="3" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="50" y="225" fill="#38bdf8" font-size="10" font-weight="800">5'</text>
      <text x="490" y="225" fill="#38bdf8" font-size="10" font-weight="800">3'</text>
      <text x="180" y="224" fill="#facc15" font-size="10" font-family="monospace" font-weight="800">AUG</text>
      <text x="250" y="224" fill="#facc15" font-size="10" font-family="monospace" font-weight="800">GAG</text>
      <text x="320" y="224" fill="#facc15" font-size="10" font-family="monospace" font-weight="800">UUC</text>
      <!-- Large Ribosomal Subunit (60S) -->
      <path d="M 120 180 C 120 60 400 60 400 180 Z" fill="#0c4a6e" stroke="#0284c7" stroke-width="2"/>
      <text x="260" y="80" fill="#ffffff" font-size="10" font-weight="800">Large Ribosomal Subunit</text>
      <!-- A, P, E Site Channels -->
      <!-- E Site (Exit) -->
      <rect x="160" y="100" width="40" height="80" rx="4" fill="#1e293b" stroke="#64748b" stroke-width="1"/>
      <text x="180" y="115" fill="#ef4444" font-size="10" font-weight="800" text-anchor="middle">E</text>
      <!-- P Site (Peptidyl) -->
      <rect x="235" y="100" width="45" height="80" rx="4" fill="#1e293b" stroke="#64748b" stroke-width="1"/>
      <text x="257" y="115" fill="#34d399" font-size="10" font-weight="800" text-anchor="middle">P</text>
      <!-- A Site (Aminoacyl) -->
      <rect x="310" y="100" width="45" height="80" rx="4" fill="#1e293b" stroke="#64748b" stroke-width="1"/>
      <text x="332" y="115" fill="#38bdf8" font-size="10" font-weight="800" text-anchor="middle">A</text>
      <!-- tRNA in P Site carrying polypeptide chain -->
      <polygon points="250,140 265,140 260,175 255,175" fill="#10b981"/>
      <!-- Growing Polypeptide Pearl Chain -->
      <circle cx="257" cy="85" r="7" fill="#f59e0b"/><circle cx="257" cy="68" r="7" fill="#f59e0b"/><circle cx="257" cy="51" r="7" fill="#f59e0b"/>
      <text x="275" y="60" fill="#facc15" font-size="8.5" font-weight="800">Nascent Protein</text>
      <!-- Incoming Aminoacyl-tRNA entering A Site -->
      <polygon points="325,130 340,130 335,165 330,165" fill="#38bdf8"/>
      <circle cx="332" cy="115" r="7" fill="#ec4899"/>
      <text x="332" y="102" fill="#f472b6" font-size="8" font-weight="800" text-anchor="middle">Phe</text>
      <!-- Small Subunit at Base (40S) -->
      <rect x="140" y="235" width="240" height="25" rx="6" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="260" y="252" fill="#ffffff" font-size="9.5" font-weight="700" text-anchor="middle">Small Subunit (40S)</text>
      <text x="270" y="280" fill="#cbd5e1" font-size="10" font-weight="600" text-anchor="middle">Peptidyl transferase catalyzes peptide bond; ribosome translocates 5' → 3' by 1 codon</text>
    </svg>`
  },

  bio_lac_operon_regulation: {
    id: "bio_lac_operon_regulation",
    subject: "BIO",
    moduleId: 13,
    title: "Prokaryotic Gene Regulation: The Lac Operon",
    caption: "Figure: Repressed vs Induced States of the Lac Operon: Operator Binding by LacI Repressor",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Prokaryotic Gene Regulation: The Lac Operon</text>
      <!-- State 1: Lactose Absent (Repressed) -->
      <rect x="25" y="45" width="490" height="95" rx="6" fill="#1e293b" stroke="#ef4444" stroke-width="1.5"/>
      <text x="35" y="62" fill="#ef4444" font-size="10" font-weight="800">NO LACTOSE (Repressed State):</text>
      <!-- Operon DNA segments -->
      <g stroke="#ffffff" stroke-width="1">
        <rect x="40" y="75" width="55" height="30" fill="#64748b"/><text x="67" y="94" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">lacI</text>
        <rect x="140" y="75" width="50" height="30" fill="#0284c7"/><text x="165" y="94" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">Promoter</text>
        <rect x="190" y="75" width="45" height="30" fill="#ef4444"/><text x="212" y="94" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">Operator</text>
        <rect x="235" y="75" width="80" height="30" fill="#10b981"/><text x="275" y="94" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">lacZ</text>
        <rect x="315" y="75" width="70" height="30" fill="#10b981"/><text x="350" y="94" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">lacY</text>
        <rect x="385" y="75" width="60" height="30" fill="#10b981"/><text x="415" y="94" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">lacA</text>
      </g>
      <!-- Active Repressor sitting on Operator -->
      <polygon points="195,65 230,65 220,80 205,80" fill="#f59e0b" stroke="#ffffff" stroke-width="1"/>
      <text x="212" y="58" fill="#f59e0b" font-size="8.5" font-weight="800" text-anchor="middle">Repressor Blocks RNAP</text>
      <!-- State 2: Lactose Present (Induced) -->
      <rect x="25" y="150" width="490" height="110" rx="6" fill="#1e293b" stroke="#34d399" stroke-width="1.5"/>
      <text x="35" y="168" fill="#34d399" font-size="10" font-weight="800">+ ALLOLACTOSE (Induced State, Transcription Active):</text>
      <!-- Operon DNA segments -->
      <g stroke="#ffffff" stroke-width="1">
        <rect x="40" y="180" width="55" height="30" fill="#64748b"/><text x="67" y="199" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">lacI</text>
        <rect x="140" y="180" width="50" height="30" fill="#0284c7"/><text x="165" y="199" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">Promoter</text>
        <rect x="190" y="180" width="45" height="30" fill="#ef4444"/><text x="212" y="199" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">Operator</text>
        <rect x="235" y="180" width="80" height="30" fill="#10b981"/><text x="275" y="199" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">lacZ</text>
        <rect x="315" y="180" width="70" height="30" fill="#10b981"/><text x="350" y="199" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">lacY</text>
        <rect x="385" y="180" width="60" height="30" fill="#10b981"/><text x="415" y="199" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">lacA</text>
      </g>
      <!-- Inactivated Repressor with Allolactose -->
      <circle cx="212" cy="235" r="12" fill="#f59e0b"/>
      <circle cx="220" cy="235" r="5" fill="#f43f5e"/>
      <text x="240" y="240" fill="#cbd5e1" font-size="8.5">Repressor Inactivated by Allolactose Inducer</text>
      <!-- mRNA Arrow -->
      <line x1="235" y1="225" x2="440" y2="225" stroke="#34d399" stroke-width="2.5"/>
      <polygon points="445,225 435,221 435,229" fill="#34d399"/>
      <text x="340" y="240" fill="#34d399" font-size="9.5" font-weight="800" text-anchor="middle">Polycistronic mRNA Transcribed</text>
      <text x="270" y="280" fill="#cbd5e1" font-size="10" font-weight="600" text-anchor="middle">Negative inducible operon: Lactose converts repressor to inactive form, allowing transcription</text>
    </svg>`
  },

  bio_karyotype_trisomy_21: {
    id: "bio_karyotype_trisomy_21",
    subject: "BIO",
    moduleId: 14,
    title: "Clinical Human Karyotype: Trisomy 21 (Down Syndrome)",
    caption: "Figure: Human Somatic Metaphase Karyogram showing 47,XY,+21 Aneuploidy from Meiotic Nondisjunction",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="22" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Human Karyotype: 47, XY, +21 (Down Syndrome)</text>
      <!-- Grid representing Chromosome Pairs 1 to 22 + Sex -->
      <!-- Row 1: Pairs 1-5 (Large) -->
      <g fill="#94a3b8" font-size="8" text-anchor="middle">
        <text x="50" y="45">1</text><line x1="47" y1="50" x2="47" y2="85" stroke="#38bdf8" stroke-width="3"/><line x1="53" y1="50" x2="53" y2="85" stroke="#38bdf8" stroke-width="3"/>
        <text x="110" y="45">2</text><line x1="107" y1="52" x2="107" y2="84" stroke="#38bdf8" stroke-width="3"/><line x1="113" y1="52" x2="113" y2="84" stroke="#38bdf8" stroke-width="3"/>
        <text x="170" y="45">3</text><line x1="167" y1="55" x2="167" y2="82" stroke="#38bdf8" stroke-width="3"/><line x1="173" y1="55" x2="173" y2="82" stroke="#38bdf8" stroke-width="3"/>
        <text x="230" y="45">4</text><line x1="227" y1="57" x2="227" y2="80" stroke="#38bdf8" stroke-width="3"/><line x1="233" y1="57" x2="233" y2="80" stroke="#38bdf8" stroke-width="3"/>
        <text x="290" y="45">5</text><line x1="287" y1="58" x2="287" y2="79" stroke="#38bdf8" stroke-width="3"/><line x1="293" y1="58" x2="293" y2="79" stroke="#38bdf8" stroke-width="3"/>
      </g>
      <!-- Row 2: Pairs 6-12 (Medium) -->
      <g fill="#94a3b8" font-size="8" text-anchor="middle">
        <text x="50" y="105">6</text><line x1="47" y1="110" x2="47" y2="135" stroke="#34d399" stroke-width="3"/><line x1="53" y1="110" x2="53" y2="135" stroke="#34d399" stroke-width="3"/>
        <text x="110" y="105">7</text><line x1="107" y1="110" x2="107" y2="135" stroke="#34d399" stroke-width="3"/><line x1="113" y1="110" x2="113" y2="135" stroke="#34d399" stroke-width="3"/>
        <text x="170" y="105">8</text><line x1="167" y1="112" x2="167" y2="134" stroke="#34d399" stroke-width="3"/><line x1="173" y1="112" x2="173" y2="134" stroke="#34d399" stroke-width="3"/>
        <text x="230" y="105">9</text><line x1="227" y1="113" x2="227" y2="133" stroke="#34d399" stroke-width="3"/><line x1="233" y1="113" x2="233" y2="133" stroke="#34d399" stroke-width="3"/>
        <text x="290" y="105">10</text><line x1="287" y1="114" x2="287" y2="132" stroke="#34d399" stroke-width="3"/><line x1="293" y1="114" x2="293" y2="132" stroke="#34d399" stroke-width="3"/>
        <text x="350" y="105">11</text><line x1="347" y1="114" x2="347" y2="132" stroke="#34d399" stroke-width="3"/><line x1="353" y1="114" x2="353" y2="132" stroke="#34d399" stroke-width="3"/>
        <text x="410" y="105">12</text><line x1="407" y1="115" x2="407" y2="131" stroke="#34d399" stroke-width="3"/><line x1="413" y1="115" x2="413" y2="131" stroke="#34d399" stroke-width="3"/>
      </g>
      <!-- Row 3: Pairs 13-20 -->
      <g fill="#94a3b8" font-size="8" text-anchor="middle">
        <text x="50" y="155">13</text><line x1="47" y1="160" x2="47" y2="178" stroke="#f59e0b" stroke-width="2.5"/><line x1="53" y1="160" x2="53" y2="178" stroke="#f59e0b" stroke-width="2.5"/>
        <text x="110" y="155">14</text><line x1="107" y1="160" x2="107" y2="178" stroke="#f59e0b" stroke-width="2.5"/><line x1="113" y1="160" x2="113" y2="178" stroke="#f59e0b" stroke-width="2.5"/>
        <text x="170" y="155">15</text><line x1="167" y1="162" x2="167" y2="177" stroke="#f59e0b" stroke-width="2.5"/><line x1="173" y1="162" x2="173" y2="177" stroke="#f59e0b" stroke-width="2.5"/>
        <text x="230" y="155">16</text><line x1="227" y1="164" x2="227" y2="176" stroke="#f59e0b" stroke-width="2.5"/><line x1="233" y1="164" x2="233" y2="176" stroke="#f59e0b" stroke-width="2.5"/>
        <text x="290" y="155">17</text><line x1="287" y1="164" x2="287" y2="175" stroke="#f59e0b" stroke-width="2.5"/><line x1="293" y1="164" x2="293" y2="175" stroke="#f59e0b" stroke-width="2.5"/>
        <text x="350" y="155">18</text><line x1="347" y1="165" x2="347" y2="175" stroke="#f59e0b" stroke-width="2.5"/><line x1="353" y1="165" x2="353" y2="175" stroke="#f59e0b" stroke-width="2.5"/>
      </g>
      <!-- Row 4: 19, 20, TRISOMY 21 BOX, 22, Sex XY -->
      <!-- Trisomy 21 Highlight Callout -->
      <rect x="150" y="195" width="60" height="45" rx="4" fill="#7f1d1d" stroke="#ef4444" stroke-width="2"/>
      <text x="180" y="208" fill="#ef4444" font-size="8.5" font-weight="800" text-anchor="middle">21 (Trisomy)</text>
      <!-- 3 copies of chromosome 21 -->
      <line x1="168" y1="214" x2="168" y2="230" stroke="#fca5a5" stroke-width="2.5"/>
      <line x1="180" y1="214" x2="180" y2="230" stroke="#fca5a5" stroke-width="2.5"/>
      <line x1="192" y1="214" x2="192" y2="230" stroke="#fca5a5" stroke-width="2.5"/>
      <!-- Sex Chromosomes (23) -->
      <text x="440" y="195" fill="#facc15" font-size="8.5" font-weight="800" text-anchor="middle">Sex (XY)</text>
      <line x1="433" y1="202" x2="433" y2="230" stroke="#facc15" stroke-width="3"/>
      <line x1="447" y1="215" x2="447" y2="230" stroke="#facc15" stroke-width="2.5"/>
      <!-- Clinical Diagnosis Box -->
      <rect x="40" y="255" width="460" height="30" rx="4" fill="#1e293b" stroke="#ef4444" stroke-width="1.5"/>
      <text x="270" y="274" fill="#f8fafc" font-size="10" font-weight="700" text-anchor="middle">Clinical Finding: 3 copies of Chromosome 21 caused by maternal meiotic nondisjunction (47,XY,+21)</text>
    </svg>`
  },

  bio_gel_electrophoresis_ladder: {
    id: "bio_gel_electrophoresis_ladder",
    subject: "BIO",
    moduleId: 15,
    title: "Agarose Gel Electrophoresis DNA Banding Ladder",
    caption: "Figure: Molecular Weight DNA Size Ladder and Sample Fragment Migration toward Positive Anode (+)",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Agarose Gel Electrophoresis: DNA Size Separation</text>
      <!-- Gel Slab Frame -->
      <rect x="100" y="45" width="340" height="205" rx="6" fill="#030712" stroke="#38bdf8" stroke-width="2"/>
      <!-- Cathode (-) Top Terminal -->
      <line x1="100" y1="40" x2="440" y2="40" stroke="#ef4444" stroke-width="2"/>
      <text x="80" y="44" fill="#ef4444" font-size="12" font-weight="800">Cathode (–)</text>
      <!-- Anode (+) Bottom Terminal -->
      <line x1="100" y1="255" x2="440" y2="255" stroke="#38bdf8" stroke-width="2"/>
      <text x="80" y="260" fill="#38bdf8" font-size="12" font-weight="800">Anode (+)</text>
      <!-- Loading Wells at Top -->
      <rect x="140" y="55" width="30" height="12" fill="#1e293b" stroke="#64748b"/>
      <rect x="210" y="55" width="30" height="12" fill="#1e293b" stroke="#64748b"/>
      <rect x="280" y="55" width="30" height="12" fill="#1e293b" stroke="#64748b"/>
      <rect x="350" y="55" width="30" height="12" fill="#1e293b" stroke="#64748b"/>
      <!-- Lane 1: Molecular Weight Ladder (Glowing Orange Bands) -->
      <text x="155" y="50" fill="#f59e0b" font-size="8.5" font-weight="800" text-anchor="middle">Ladder</text>
      <rect x="143" y="75" width="24" height="3" fill="#f59e0b"/><text x="135" y="78" fill="#f59e0b" font-size="7.5" text-anchor="end">1000 bp</text>
      <rect x="143" y="105" width="24" height="3" fill="#f59e0b"/><text x="135" y="108" fill="#f59e0b" font-size="7.5" text-anchor="end">750 bp</text>
      <rect x="143" y="145" width="24" height="3" fill="#f59e0b"/><text x="135" y="148" fill="#f59e0b" font-size="7.5" text-anchor="end">500 bp</text>
      <rect x="143" y="195" width="24" height="3" fill="#f59e0b"/><text x="135" y="198" fill="#f59e0b" font-size="7.5" text-anchor="end">250 bp</text>
      <rect x="143" y="235" width="24" height="3" fill="#f59e0b"/><text x="135" y="238" fill="#f59e0b" font-size="7.5" text-anchor="end">100 bp</text>
      <!-- Lane 2: Patient A (Cyan Bands) -->
      <text x="225" y="50" fill="#38bdf8" font-size="8.5" font-weight="800" text-anchor="middle">Sample 1</text>
      <rect x="213" y="105" width="24" height="3.5" fill="#38bdf8"/>
      <rect x="213" y="195" width="24" height="3.5" fill="#38bdf8"/>
      <!-- Lane 3: Patient B -->
      <text x="295" y="50" fill="#34d399" font-size="8.5" font-weight="800" text-anchor="middle">Sample 2</text>
      <rect x="283" y="75" width="24" height="3.5" fill="#34d399"/>
      <rect x="283" y="145" width="24" height="3.5" fill="#34d399"/>
      <!-- Lane 4: PCR Digest -->
      <text x="365" y="50" fill="#ec4899" font-size="8.5" font-weight="800" text-anchor="middle">Digest</text>
      <rect x="353" y="145" width="24" height="3.5" fill="#ec4899"/>
      <rect x="353" y="235" width="24" height="3.5" fill="#ec4899"/>
      <!-- Migration Direction Arrow -->
      <line x1="460" y1="70" x2="460" y2="230" stroke="#facc15" stroke-width="2.5"/>
      <polygon points="460,235 456,225 464,225" fill="#facc15"/>
      <text x="475" y="155" fill="#facc15" font-size="9" font-weight="800" transform="rotate(90 475 155)" text-anchor="middle">Migration Speed ∝ 1/log(bp)</text>
      <rect x="60" y="265" width="420" height="24" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <text x="270" y="281" fill="#f8fafc" font-size="9.5" font-weight="700" text-anchor="middle">Negatively charged phosphate backbone drives migration; porous agarose sieves by size</text>
    </svg>`
  },

  bio_natural_selection_modes: {
    id: "bio_natural_selection_modes",
    subject: "BIO",
    moduleId: 16,
    title: "Modes of Natural Selection: Directional, Stabilizing, Disruptive",
    caption: "Figure: Polygenic Trait Frequency Shifts under Directional, Stabilizing, and Disruptive Environmental Pressures",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Three Modes of Natural Selection on Polygenic Traits</text>
      <!-- Panel 1: Directional Selection -->
      <rect x="25" y="45" width="155" height="215" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
      <text x="102" y="66" fill="#38bdf8" font-size="10.5" font-weight="800" text-anchor="middle">DIRECTIONAL</text>
      <line x1="35" y1="210" x2="170" y2="210" stroke="#64748b" stroke-width="1.5"/>
      <!-- Original bell curve (Dashed gray) -->
      <path d="M 45 210 Q 95 100 145 210" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3"/>
      <!-- Shifted bell curve (Solid cyan) -->
      <path d="M 65 210 Q 120 90 165 210" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
      <text x="102" y="235" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">Mean Shifts to Extreme →</text>
      <!-- Panel 2: Stabilizing Selection -->
      <rect x="192" y="45" width="155" height="215" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
      <text x="269" y="66" fill="#34d399" font-size="10.5" font-weight="800" text-anchor="middle">STABILIZING</text>
      <line x1="202" y1="210" x2="337" y2="210" stroke="#64748b" stroke-width="1.5"/>
      <!-- Original bell curve -->
      <path d="M 212 210 Q 269 110 327 210" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3"/>
      <!-- Narrowed tall peak -->
      <path d="M 235 210 Q 269 65 305 210" fill="none" stroke="#34d399" stroke-width="2.5"/>
      <text x="269" y="235" fill="#34d399" font-size="9" font-weight="700" text-anchor="middle">Variance Decreases (Mean Favored)</text>
      <!-- Panel 3: Disruptive Selection -->
      <rect x="360" y="45" width="155" height="215" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
      <text x="437" y="66" fill="#ef4444" font-size="10.5" font-weight="800" text-anchor="middle">DISRUPTIVE</text>
      <line x1="370" y1="210" x2="505" y2="210" stroke="#64748b" stroke-width="1.5"/>
      <!-- Original bell curve -->
      <path d="M 380 210 Q 437 110 495 210" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3"/>
      <!-- Bimodal curve (Two peaks) -->
      <path d="M 380 210 Q 405 100 425 160 Q 437 175 450 160 Q 470 100 495 210" fill="none" stroke="#ef4444" stroke-width="2.5"/>
      <text x="437" y="235" fill="#ef4444" font-size="9" font-weight="700" text-anchor="middle">Both Extremes Favored (Bimodal)</text>
      <rect x="50" y="265" width="440" height="24" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <text x="270" y="281" fill="#f8fafc" font-size="9.5" font-weight="700" text-anchor="middle">Disruptive selection can drive sympatric speciation by splitting adaptive peaks</text>
    </svg>`
  },

  bio_cladogram_phylogenetic_tree: {
    id: "bio_cladogram_phylogenetic_tree",
    subject: "BIO",
    moduleId: 17,
    title: "Vertebrate Evolutionary Cladogram & Synapomorphies",
    caption: "Figure: Monophyletic Cladogram showing Derived Evolutionary Shared Traits (Synapomorphies)",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="24" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Vertebrate Cladogram: Derived Synapomorphies</text>
      <!-- Main Diagonal Axis -->
      <line x1="50" y1="230" x2="490" y2="60" stroke="#94a3b8" stroke-width="3"/>
      <!-- Terminal Branches & Taxa -->
      <!-- Taxon 1: Lancelet (Outgroup) -->
      <line x1="90" y1="215" x2="110" y2="160" stroke="#38bdf8" stroke-width="2"/>
      <text x="110" y="150" fill="#f8fafc" font-size="9.5" font-weight="800">Lancelet</text>
      <!-- Taxon 2: Lamprey -->
      <line x1="170" y1="185" x2="190" y2="130" stroke="#38bdf8" stroke-width="2"/>
      <text x="190" y="120" fill="#f8fafc" font-size="9.5" font-weight="800">Lamprey</text>
      <!-- Taxon 3: Tuna (Fish) -->
      <line x1="250" y1="155" x2="270" y2="100" stroke="#38bdf8" stroke-width="2"/>
      <text x="270" y="90" fill="#f8fafc" font-size="9.5" font-weight="800">Tuna</text>
      <!-- Taxon 4: Frog (Amphibian) -->
      <line x1="330" y1="125" x2="350" y2="70" stroke="#38bdf8" stroke-width="2"/>
      <text x="350" y="60" fill="#f8fafc" font-size="9.5" font-weight="800">Frog</text>
      <!-- Taxon 5: Lizard (Reptile) -->
      <line x1="410" y1="95" x2="430" y2="40" stroke="#38bdf8" stroke-width="2"/>
      <text x="430" y="32" fill="#f8fafc" font-size="9.5" font-weight="800">Lizard</text>
      <!-- Taxon 6: Chimpanzee (Mammal) -->
      <line x1="480" y1="65" x2="500" y2="20" stroke="#38bdf8" stroke-width="2"/>
      <text x="500" y="14" fill="#34d399" font-size="9.5" font-weight="800">Chimp</text>
      <!-- Evolutionary Trait Tick Markers (Synapomorphies) -->
      <line x1="125" y1="210" x2="135" y2="190" stroke="#ef4444" stroke-width="3"/>
      <text x="135" y="228" fill="#ef4444" font-size="8.5" font-weight="800" text-anchor="middle">Vertebral Column</text>
      <line x1="205" y1="180" x2="215" y2="160" stroke="#f59e0b" stroke-width="3"/>
      <text x="215" y="198" fill="#f59e0b" font-size="8.5" font-weight="800" text-anchor="middle">Jaws</text>
      <line x1="285" y1="150" x2="295" y2="130" stroke="#facc15" stroke-width="3"/>
      <text x="295" y="168" fill="#facc15" font-size="8.5" font-weight="800" text-anchor="middle">Four Walking Legs</text>
      <line x1="365" y1="120" x2="375" y2="100" stroke="#34d399" stroke-width="3"/>
      <text x="375" y="138" fill="#34d399" font-size="8.5" font-weight="800" text-anchor="middle">Amniotic Egg</text>
      <line x1="445" y1="90" x2="455" y2="70" stroke="#ec4899" stroke-width="3"/>
      <text x="455" y="108" fill="#ec4899" font-size="8.5" font-weight="800" text-anchor="middle">Hair &amp; Mammary</text>
      <rect x="50" y="260" width="440" height="26" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <text x="270" y="277" fill="#f8fafc" font-size="9.5" font-weight="700" text-anchor="middle">Clade members share derived traits (synapomorphies) inherited from common ancestor</text>
    </svg>`
  },

  bio_bacteriophage_lytic_cycle: {
    id: "bio_bacteriophage_lytic_cycle",
    subject: "BIO",
    moduleId: 18,
    title: "T4 Bacteriophage Five-Step Lytic Infection Cycle",
    caption: "Figure: Viral Infection Cycle: Attachment, Penetration, Biosynthesis, Assembly, and Lysis",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="22" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Bacteriophage T4 Lytic Infection Cycle</text>
      <!-- Step 1: Attachment -->
      <rect x="25" y="45" width="85" height="190" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <text x="67" y="65" fill="#38bdf8" font-size="10" font-weight="800" text-anchor="middle">1. Attach</text>
      <rect x="40" y="140" width="55" height="70" rx="8" fill="#065f46" stroke="#34d399"/>
      <!-- Phage icosahedral head and tail -->
      <polygon points="67,85 77,93 74,105 60,105 57,93" fill="#38bdf8"/>
      <line x1="67" y1="105" x2="67" y2="135" stroke="#38bdf8" stroke-width="2"/>
      <text x="67" y="225" fill="#94a3b8" font-size="8" text-anchor="middle">Receptor Binding</text>
      <!-- Step 2: Entry / Penetration -->
      <rect x="125" y="45" width="85" height="190" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <text x="167" y="65" fill="#38bdf8" font-size="10" font-weight="800" text-anchor="middle">2. Inject</text>
      <rect x="140" y="140" width="55" height="70" rx="8" fill="#065f46" stroke="#34d399"/>
      <path d="M 167 115 L 167 165" stroke="#facc15" stroke-width="2.5"/>
      <text x="167" y="225" fill="#facc15" font-size="8" font-weight="700" text-anchor="middle">DNA Injected</text>
      <!-- Step 3: Biosynthesis -->
      <rect x="225" y="45" width="90" height="190" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <text x="270" y="65" fill="#38bdf8" font-size="10" font-weight="800" text-anchor="middle">3. Synthesize</text>
      <rect x="242" y="140" width="55" height="70" rx="8" fill="#065f46" stroke="#34d399"/>
      <circle cx="260" cy="165" r="4" fill="#38bdf8"/><circle cx="280" cy="175" r="4" fill="#38bdf8"/>
      <text x="270" y="225" fill="#94a3b8" font-size="8" text-anchor="middle">Host DNA Degraded</text>
      <!-- Step 4: Assembly -->
      <rect x="330" y="45" width="85" height="190" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <text x="372" y="65" fill="#38bdf8" font-size="10" font-weight="800" text-anchor="middle">4. Assemble</text>
      <rect x="345" y="140" width="55" height="70" rx="8" fill="#065f46" stroke="#34d399"/>
      <polygon points="372,165 378,171 376,179 368,179 366,171" fill="#38bdf8"/>
      <text x="372" y="225" fill="#94a3b8" font-size="8" text-anchor="middle">New Virions</text>
      <!-- Step 5: Lysis -->
      <rect x="430" y="45" width="85" height="190" rx="6" fill="#1e293b" stroke="#ef4444" stroke-width="1.5"/>
      <text x="472" y="65" fill="#ef4444" font-size="10" font-weight="800" text-anchor="middle">5. Lysis</text>
      <!-- Ruptured bacterium releasing phages -->
      <path d="M 445 150 Q 460 140 480 155 Q 495 180 470 205 Q 445 190 445 150" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="3"/>
      <text x="472" y="180" fill="#ef4444" font-size="9" font-weight="800" text-anchor="middle">Lysis!</text>
      <text x="472" y="225" fill="#ef4444" font-size="8" font-weight="700" text-anchor="middle">Release Phages</text>
      <rect x="50" y="260" width="440" height="26" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <text x="270" y="277" fill="#f8fafc" font-size="9.5" font-weight="700" text-anchor="middle">Viral lysozyme hydrolyzes peptidoglycan cell wall, releasing ~200 infectious virions</text>
    </svg>`
  },

  bio_leaf_anatomy_cross_section: {
    id: "bio_leaf_anatomy_cross_section",
    subject: "BIO",
    moduleId: 19,
    title: "Photosynthetic Dicot Leaf Anatomical Cross-Section",
    caption: "Figure: Leaf Histology: Cuticle, Palisade Mesophyll, Spongy Parenchyma, Stomata, and Vein",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="22" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Anatomy of a Photosynthetic Dicot Leaf Blade</text>
      <!-- Upper Waxy Cuticle -->
      <rect x="60" y="45" width="420" height="6" fill="#38bdf8" opacity="0.6"/>
      <text x="490" y="52" fill="#38bdf8" font-size="8.5">Waxy Cuticle</text>
      <!-- Upper Epidermis Monolayer -->
      <rect x="60" y="53" width="420" height="22" fill="#1e293b" stroke="#64748b" stroke-width="1"/>
      <text x="490" y="68" fill="#94a3b8" font-size="8.5">Upper Epidermis</text>
      <!-- Palisade Mesophyll (Vertical columnar cells packed with chloroplasts) -->
      <g fill="#065f46" stroke="#10b981" stroke-width="1">
        <rect x="70" y="78" width="22" height="65" rx="3"/><rect x="96" y="78" width="22" height="65" rx="3"/>
        <rect x="122" y="78" width="22" height="65" rx="3"/><rect x="148" y="78" width="22" height="65" rx="3"/>
        <rect x="174" y="78" width="22" height="65" rx="3"/><rect x="200" y="78" width="22" height="65" rx="3"/>
        <rect x="226" y="78" width="22" height="65" rx="3"/><rect x="252" y="78" width="22" height="65" rx="3"/>
        <rect x="278" y="78" width="22" height="65" rx="3"/><rect x="304" y="78" width="22" height="65" rx="3"/>
      </g>
      <text x="490" y="112" fill="#10b981" font-size="9" font-weight="700">Palisade Mesophyll</text>
      <!-- Vascular Bundle Vein (Xylem & Phloem) -->
      <circle cx="390" cy="130" r="30" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
      <circle cx="390" cy="118" r="8" fill="#ef4444"/><text x="390" y="121" fill="#ffffff" font-size="7" font-weight="800" text-anchor="middle">Xylem</text>
      <circle cx="390" cy="142" r="8" fill="#38bdf8"/><text x="390" y="145" fill="#ffffff" font-size="7" font-weight="800" text-anchor="middle">Phloem</text>
      <!-- Spongy Mesophyll (Loosely organized round cells with air cavities) -->
      <g fill="#047857" stroke="#34d399">
        <circle cx="90" cy="165" r="12"/><circle cx="130" cy="180" r="14"/><circle cx="170" cy="165" r="13"/>
        <circle cx="210" cy="185" r="14"/><circle cx="260" cy="170" r="13"/><circle cx="300" cy="185" r="12"/>
      </g>
      <text x="490" y="175" fill="#34d399" font-size="9" font-weight="700">Spongy Mesophyll</text>
      <!-- Lower Epidermis with Stomatal Pore & Guard Cells -->
      <rect x="60" y="210" width="160" height="20" fill="#1e293b" stroke="#64748b" stroke-width="1"/>
      <rect x="260" y="210" width="220" height="20" fill="#1e293b" stroke="#64748b" stroke-width="1"/>
      <!-- Pair of kidney-shaped Guard Cells -->
      <ellipse cx="230" cy="220" rx="9" ry="12" fill="#059669" stroke="#34d399" stroke-width="1.5"/>
      <ellipse cx="250" cy="220" rx="9" ry="12" fill="#059669" stroke="#34d399" stroke-width="1.5"/>
      <text x="240" y="246" fill="#facc15" font-size="9" font-weight="800" text-anchor="middle">Stoma / Guard Cells</text>
      <text x="270" y="280" fill="#cbd5e1" font-size="9.5" font-weight="600" text-anchor="middle">Spongy air spaces facilitate CO₂/O₂ diffusion; stomata regulate transpirational water loss</text>
    </svg>`
  },

  bio_flower_reproductive_anatomy: {
    id: "bio_flower_reproductive_anatomy",
    subject: "BIO",
    moduleId: 20,
    title: "Angiosperm Flower Reproductive Anatomy",
    caption: "Figure: Longitudinal Section of Flower showing Stamen (Male) and Carpel/Pistil (Female) Organs",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="22" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Anatomy of an Angiosperm Flower</text>
      <!-- Receptacle & Pedicel Stem -->
      <line x1="270" y1="240" x2="270" y2="280" stroke="#10b981" stroke-width="6"/>
      <ellipse cx="270" cy="235" rx="35" ry="12" fill="#065f46" stroke="#10b981" stroke-width="2"/>
      <!-- Sepals (Green calyx) -->
      <path d="M 235 235 Q 180 220 160 200" fill="none" stroke="#10b981" stroke-width="4"/>
      <path d="M 305 235 Q 360 220 380 200" fill="none" stroke="#10b981" stroke-width="4"/>
      <!-- Showy Petals (Pink corolla) -->
      <path d="M 235 230 C 140 180 120 70 200 60 C 240 110 240 170 240 210" fill="#ec4899" fill-opacity="0.3" stroke="#f472b6" stroke-width="2"/>
      <path d="M 305 230 C 400 180 420 70 340 60 C 300 110 300 170 300 210" fill="#ec4899" fill-opacity="0.3" stroke="#f472b6" stroke-width="2"/>
      <!-- Central Carpel / Pistil (Female) -->
      <!-- Ovary at base -->
      <ellipse cx="270" cy="205" rx="28" ry="24" fill="#047857" stroke="#34d399" stroke-width="2"/>
      <circle cx="270" cy="205" r="10" fill="#facc15"/><text x="270" y="209" fill="#0f172a" font-size="7.5" font-weight="800" text-anchor="middle">Ovule</text>
      <!-- Style neck -->
      <line x1="270" y1="181" x2="270" y2="90" stroke="#34d399" stroke-width="8"/>
      <!-- Stigma at top -->
      <ellipse cx="270" cy="85" rx="15" ry="8" fill="#10b981" stroke="#34d399" stroke-width="2"/>
      <text x="270" y="70" fill="#34d399" font-size="10" font-weight="800" text-anchor="middle">Stigma (Sticky)</text>
      <text x="320" y="130" fill="#34d399" font-size="9" font-weight="700">Style</text>
      <text x="320" y="205" fill="#34d399" font-size="9" font-weight="700">Ovary (→ Fruit)</text>
      <!-- Stamens (Male: Filament + Anther with pollen) -->
      <!-- Left Stamen -->
      <path d="M 235 220 Q 190 170 190 100" fill="none" stroke="#f59e0b" stroke-width="2.5"/>
      <ellipse cx="190" cy="95" rx="8" ry="12" fill="#facc15" stroke="#f59e0b" stroke-width="2"/>
      <text x="140" y="98" fill="#facc15" font-size="9.5" font-weight="800">Anther</text>
      <!-- Right Stamen -->
      <path d="M 305 220 Q 350 170 350 100" fill="none" stroke="#f59e0b" stroke-width="2.5"/>
      <ellipse cx="350" cy="95" rx="8" ry="12" fill="#facc15" stroke="#f59e0b" stroke-width="2"/>
      <text x="400" y="98" fill="#facc15" font-size="9.5" font-weight="800">Filament</text>
      <!-- Callout Summary -->
      <rect x="60" y="255" width="420" height="26" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <text x="270" y="272" fill="#f8fafc" font-size="9.5" font-weight="700" text-anchor="middle">Stamen (Male) = Anther + Filament  |  Carpel (Female) = Stigma + Style + Ovary</text>
    </svg>`
  },

  bio_antibody_immunoglobulin_structure: {
    id: "bio_antibody_immunoglobulin_structure",
    subject: "BIO",
    moduleId: 21,
    title: "Immunoglobulin G (IgG) Antibody Architecture",
    caption: "Figure: Y-Shaped Antibody: Heavy/Light Chains, Disulfide Bridges, and Variable Fab Antigen-Binding Sites",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="22" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Immunoglobulin G (IgG) Antibody Structure</text>
      <!-- Y-shaped Heavy Chains (Blue) -->
      <!-- Left Arm Heavy Chain -->
      <line x1="170" y1="60" x2="250" y2="150" stroke="#0284c7" stroke-width="10" stroke-linecap="round"/>
      <!-- Right Arm Heavy Chain -->
      <line x1="370" y1="60" x2="290" y2="150" stroke="#0284c7" stroke-width="10" stroke-linecap="round"/>
      <!-- Stem Heavy Chains -->
      <line x1="260" y1="150" x2="260" y2="240" stroke="#0284c7" stroke-width="10" stroke-linecap="round"/>
      <line x1="280" y1="150" x2="280" y2="240" stroke="#0284c7" stroke-width="10" stroke-linecap="round"/>
      <!-- Light Chains (Green) -->
      <!-- Left Light Chain -->
      <line x1="140" y1="80" x2="220" y2="170" stroke="#10b981" stroke-width="7" stroke-linecap="round"/>
      <!-- Right Light Chain -->
      <line x1="400" y1="80" x2="320" y2="170" stroke="#10b981" stroke-width="7" stroke-linecap="round"/>
      <!-- Variable Antigen-Binding Tips (Red/Orange) -->
      <circle cx="170" cy="60" r="8" fill="#ef4444"/><circle cx="140" cy="80" r="7" fill="#ef4444"/>
      <circle cx="370" cy="60" r="8" fill="#ef4444"/><circle cx="400" cy="80" r="7" fill="#ef4444"/>
      <text x="135" y="45" fill="#ef4444" font-size="9.5" font-weight="800">Antigen-Binding Site (Fab)</text>
      <text x="405" y="45" fill="#ef4444" font-size="9.5" font-weight="800">Antigen-Binding Site (Fab)</text>
      <!-- Disulfide Linkages (-S-S-) -->
      <line x1="260" y1="170" x2="280" y2="170" stroke="#facc15" stroke-width="3"/>
      <line x1="260" y1="185" x2="280" y2="185" stroke="#facc15" stroke-width="3"/>
      <line x1="190" y1="130" x2="198" y2="122" stroke="#facc15" stroke-width="2.5"/>
      <line x1="350" y1="130" x2="342" y2="122" stroke="#facc15" stroke-width="2.5"/>
      <text x="300" y="180" fill="#facc15" font-size="8.5" font-weight="800">-S-S-</text>
      <!-- Region Labels -->
      <text x="270" y="260" fill="#0284c7" font-size="10" font-weight="800" text-anchor="middle">Constant Stem Region (Fc)</text>
      <text x="90" y="140" fill="#10b981" font-size="9" font-weight="700">Light Chain (L)</text>
      <text x="380" y="220" fill="#0284c7" font-size="9" font-weight="700">Heavy Chain (H)</text>
      <rect x="50" y="270" width="440" height="24" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <text x="270" y="285" fill="#f8fafc" font-size="9" font-weight="700" text-anchor="middle">2 identical heavy chains + 2 identical light chains create bivalent antigen-binding specificity</text>
    </svg>`
  },

  bio_blood_glucose_homeostasis: {
    id: "bio_blood_glucose_homeostasis",
    subject: "BIO",
    moduleId: 22,
    title: "Endocrine Blood Glucose Negative Feedback Loop",
    caption: "Figure: Homeostatic Control of Blood Glucose: Pancreatic Islets, Insulin, and Glucagon Dynamics",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="22" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Blood Glucose Homeostasis (Negative Feedback Loop)</text>
      <!-- Center Set Point Box -->
      <rect x="180" y="115" width="180" height="50" rx="8" fill="#1e293b" stroke="#34d399" stroke-width="2"/>
      <text x="270" y="137" fill="#34d399" font-size="11" font-weight="800" text-anchor="middle">NORMAL GLUCOSE</text>
      <text x="270" y="153" fill="#ffffff" font-size="10" font-weight="700" text-anchor="middle">~90 mg / 100 mL</text>
      <!-- Top Branch: Blood Glucose Rises (Post-Meal) -->
      <path d="M 270 115 L 270 50 L 400 50" fill="none" stroke="#ef4444" stroke-width="2"/>
      <polygon points="405,50 395,46 395,54" fill="#ef4444"/>
      <text x="340" y="42" fill="#ef4444" font-size="9" font-weight="800">High Glucose Stimulus</text>
      <rect x="410" y="40" width="115" height="50" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="467" y="58" fill="#38bdf8" font-size="9.5" font-weight="800" text-anchor="middle">Pancreas Beta Cells</text>
      <text x="467" y="75" fill="#facc15" font-size="9" font-weight="700" text-anchor="middle">Secrete INSULIN</text>
      <!-- Target: Liver & Muscle Glycogenesis -->
      <path d="M 467 90 L 467 125 L 365 125" fill="none" stroke="#38bdf8" stroke-width="2"/>
      <polygon points="360,125 370,121 370,129" fill="#38bdf8"/>
      <!-- Bottom Branch: Blood Glucose Drops (Fasting) -->
      <path d="M 270 165 L 270 230 L 140 230" fill="none" stroke="#f59e0b" stroke-width="2"/>
      <polygon points="135,230 145,226 145,234" fill="#f59e0b"/>
      <text x="200" y="244" fill="#f59e0b" font-size="9" font-weight="800">Low Glucose Stimulus</text>
      <rect x="20" y="205" width="115" height="50" rx="6" fill="#1e293b" stroke="#ec4899" stroke-width="1.5"/>
      <text x="77" y="223" fill="#ec4899" font-size="9.5" font-weight="800" text-anchor="middle">Pancreas Alpha Cells</text>
      <text x="77" y="240" fill="#facc15" font-size="9" font-weight="700" text-anchor="middle">Secrete GLUCAGON</text>
      <!-- Target: Liver Glycogenolysis -->
      <path d="M 77 205 L 77 150 L 175 150" fill="none" stroke="#ec4899" stroke-width="2"/>
      <polygon points="180,150 170,146 170,154" fill="#ec4899"/>
      <rect x="50" y="270" width="440" height="24" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <text x="270" y="286" fill="#f8fafc" font-size="9.5" font-weight="700" text-anchor="middle">Insulin promotes glucose uptake/glycogenesis; Glucagon stimulates glycogenolysis</text>
    </svg>`
  },

  bio_cardiac_cycle_blood_flow: {
    id: "bio_cardiac_cycle_blood_flow",
    subject: "BIO",
    moduleId: 23,
    title: "Human 4-Chamber Heart & Double Circulation Circuit",
    caption: "Figure: Anatomical Blood Flow: Deoxygenated Pulmonary vs Oxygenated Systemic Circuits",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="22" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Human Heart: 4-Chamber Double Circulation Circuit</text>
      <!-- Heart Muscular Base Frame -->
      <rect x="130" y="45" width="280" height="205" rx="20" fill="#1e293b" stroke="#64748b" stroke-width="2"/>
      <!-- Central Interventricular & Interatrial Septum -->
      <line x1="270" y1="45" x2="270" y2="250" stroke="#94a3b8" stroke-width="4"/>
      <line x1="130" y1="135" x2="410" y2="135" stroke="#94a3b8" stroke-width="3"/>
      <!-- Right Side (Deoxygenated Blue Blood) -->
      <!-- Right Atrium (RA) -->
      <rect x="140" y="55" width="120" height="70" fill="#0284c7" fill-opacity="0.3"/>
      <text x="200" y="90" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">Right Atrium</text>
      <text x="200" y="105" fill="#bae6fd" font-size="8.5" text-anchor="middle">(Vena Cava Inflow)</text>
      <!-- Right Ventricle (RV) -->
      <rect x="140" y="145" width="120" height="95" fill="#0284c7" fill-opacity="0.4"/>
      <text x="200" y="185" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">Right Ventricle</text>
      <text x="200" y="200" fill="#bae6fd" font-size="8.5" text-anchor="middle">→ Pulmonary Artery</text>
      <!-- Tricuspid Valve -->
      <line x1="175" y1="135" x2="225" y2="135" stroke="#facc15" stroke-width="3"/>
      <text x="200" y="130" fill="#facc15" font-size="7.5" font-weight="800" text-anchor="middle">Tricuspid</text>
      <!-- Left Side (Oxygenated Red Blood) -->
      <!-- Left Atrium (LA) -->
      <rect x="280" y="55" width="120" height="70" fill="#ef4444" fill-opacity="0.3"/>
      <text x="340" y="90" fill="#f87171" font-size="11" font-weight="800" text-anchor="middle">Left Atrium</text>
      <text x="340" y="105" fill="#fecaca" font-size="8.5" text-anchor="middle">(Pulmonary Vein Inflow)</text>
      <!-- Left Ventricle (LV) - Thick myocardium -->
      <rect x="280" y="145" width="120" height="95" fill="#ef4444" fill-opacity="0.4"/>
      <text x="340" y="185" fill="#f87171" font-size="11" font-weight="800" text-anchor="middle">Left Ventricle</text>
      <text x="340" y="200" fill="#fecaca" font-size="8.5" text-anchor="middle">Thick Wall → Systemic Aorta</text>
      <!-- Bicuspid / Mitral Valve -->
      <line x1="315" y1="135" x2="365" y2="135" stroke="#facc15" stroke-width="3"/>
      <text x="340" y="130" fill="#facc15" font-size="7.5" font-weight="800" text-anchor="middle">Bicuspid / Mitral</text>
      <!-- Lateral Flow Annotations -->
      <text x="70" y="100" fill="#38bdf8" font-size="9" font-weight="800" text-anchor="middle">Vena Cava</text>
      <text x="70" y="190" fill="#38bdf8" font-size="9" font-weight="800" text-anchor="middle">To Lungs</text>
      <text x="470" y="100" fill="#ef4444" font-size="9" font-weight="800" text-anchor="middle">From Lungs</text>
      <text x="470" y="190" fill="#ef4444" font-size="9" font-weight="800" text-anchor="middle">Aorta to Body</text>
      <rect x="50" y="260" width="440" height="26" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <text x="270" y="277" fill="#f8fafc" font-size="9.5" font-weight="700" text-anchor="middle">High-pressure systemic circulation driven by thick left ventricular myocardium</text>
    </svg>`
  },

  bio_nephron_osmoregulation: {
    id: "bio_nephron_osmoregulation",
    subject: "BIO",
    moduleId: 24,
    title: "Renal Nephron Functional Microanatomy",
    caption: "Figure: Nephron Architecture: Glomerular Ultrafiltration, Loop of Henle, and Collecting Duct",
    svg: `<svg viewBox="0 0 540 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 520px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="540" height="300" fill="#0f172a" rx="10" stroke="#334155" stroke-width="1.5"/>
      <text x="270" y="22" fill="#38bdf8" font-size="12" font-weight="700" text-anchor="middle">Renal Nephron: Ultrafiltration &amp; Countercurrent Exchange</text>
      <!-- Bowman's Capsule & Glomerulus (Top Left) -->
      <path d="M 60 70 A 25 25 0 1 1 60 120 L 90 120" fill="none" stroke="#f59e0b" stroke-width="3"/>
      <circle cx="60" cy="95" r="16" fill="#ef4444" stroke="#ffffff" stroke-width="1.5"/>
      <text x="60" y="99" fill="#ffffff" font-size="8" font-weight="800" text-anchor="middle">Glom</text>
      <text x="60" y="55" fill="#f59e0b" font-size="9" font-weight="800" text-anchor="middle">Bowman's Capsule</text>
      <!-- Proximal Convoluted Tubule (PCT) -->
      <path d="M 85 120 Q 120 80 150 120 Q 180 160 210 120" fill="none" stroke="#f59e0b" stroke-width="4"/>
      <text x="150" y="100" fill="#f59e0b" font-size="9" font-weight="800" text-anchor="middle">PCT (Reabsorption)</text>
      <!-- Hairpin Loop of Henle (Descending & Ascending) -->
      <!-- Descending Limb (Water permeable) -->
      <path d="M 210 120 L 210 230 Q 230 250 250 230 L 250 120" fill="none" stroke="#38bdf8" stroke-width="4"/>
      <text x="180" y="180" fill="#38bdf8" font-size="8.5" font-weight="700">Descending (H₂O Out)</text>
      <text x="280" y="180" fill="#34d399" font-size="8.5" font-weight="700">Ascending (Na⁺ Out)</text>
      <!-- Distal Convoluted Tubule (DCT) -->
      <path d="M 250 120 Q 290 80 330 120 Q 370 160 410 120" fill="none" stroke="#f59e0b" stroke-width="4"/>
      <text x="330" y="100" fill="#f59e0b" font-size="9" font-weight="800" text-anchor="middle">DCT (Secretion)</text>
      <!-- Collecting Duct (Vertical tube on right) -->
      <rect x="410" y="60" width="22" height="190" rx="3" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
      <text x="440" y="130" fill="#38bdf8" font-size="9" font-weight="800">Collecting Duct</text>
      <text x="440" y="145" fill="#cbd5e1" font-size="8">(ADH Responsive)</text>
      <text x="421" y="240" fill="#facc15" font-size="8.5" font-weight="800" text-anchor="middle">Urine</text>
      <rect x="50" y="260" width="440" height="26" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <text x="270" y="277" fill="#f8fafc" font-size="9.5" font-weight="700" text-anchor="middle">High medullary osmolarity gradient drives water reabsorption, concentrating hypertonic urine</text>
    </svg>`
  }
};

// Merge all 30
for (const [k, v] of Object.entries(newBioDiagrams)) {
  bio30[k] = v;
}

console.log("Total BIO diagrams ready:", Object.keys(bio30).length);

const outContent = `// Edugates-ClipSAT Science Labs - Master Biology Diagrams Bank (30 Authentic Models)
// Calibrated, authentic vector illustrations for all Inspire Biology curriculum modules.

export const BIO_DIAGRAMS = ${JSON.stringify(bio30, null, 2)};
`;

fs.writeFileSync("./data/diagrams-bio.js", outContent, "utf-8");
console.log("Successfully wrote ./data/diagrams-bio.js with 30 diagrams!");
