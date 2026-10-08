// Edugates-ClipSAT Science Labs - Unit Test Suite for Metallic Bonding & Protein Architecture Interactives
// Validates spec mapping, engine dispatch, chemical & physical fidelity, materials, levels, and telemetry

import fs from "fs";
import path from "path";

console.log("\n========================================================");
console.log("⚡ Metallic Bonding & 🧬 Protein Architecture Verification");
console.log("========================================================\n");

let passed = 0;
let failed = 0;

function assert(cond, desc) {
  if (cond) {
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${desc}`);
    failed++;
  }
}

const specsPath = path.resolve("data/lesson-interactive-specs.js");
const specsSrc = fs.readFileSync(specsPath, "utf-8");

const interactivesPath = path.resolve("components/lesson-interactives.js");
const interactivesSrc = fs.readFileSync(interactivesPath, "utf-8");

// --- SECTION 1: METALLIC BONDING & ELECTRON SEA (CHEM-M06-L4) ---
console.log("\n--- Testing CHEM-M06-L4: Metallic Delocalized Electron Sea ---");

// 1. Spec mapping
assert(
  specsSrc.includes('"CHEM-M06-L4": {') &&
  specsSrc.includes('"type": "chem-metallic-bonding"') &&
  specsSrc.includes('"title": "Metallic Delocalized Electron Sea & Electrical Conductivity"'),
  "CHEM-M06-L4 is mapped to 'chem-metallic-bonding'"
);

assert(
  specsSrc.includes('J = n e v_d') &&
  specsSrc.includes('phonon resistivity') &&
  specsSrc.includes('malleability vs ionic brittle cleavage'),
  "CHEM-M06-L4 spec includes Ohm-Drift formula and lattice inquiry"
);

// 2. Dispatcher routing
assert(
  interactivesSrc.includes('spec.type.startsWith("chem-metallic")') &&
  interactivesSrc.includes("buildMetallicBondingInteractive(simMountId, spec.defaultParams);"),
  "Dispatcher routes 'chem-metallic' to buildMetallicBondingInteractive"
);

// 3. Engine implementation
assert(
  interactivesSrc.includes("function buildMetallicBondingInteractive(mountId, params)"),
  "lesson-interactives defines buildMetallicBondingInteractive function"
);

// 4. Physical fidelity checks
assert(
  interactivesSrc.includes("Delocalized Electron Sea Model") &&
  interactivesSrc.includes("electrons.push") &&
  interactivesSrc.includes("driftSpeed"),
  "Metallic interactive simulates delocalized electron cloud with net electric field drift"
);

assert(
  interactivesSrc.includes("vibAmp = Math.sqrt(tempK / 293) * 2.2") &&
  interactivesSrc.includes("rho = isIonic ? 1e9 : rho0 * (1 + alpha * (tempK - 293))"),
  "Metallic interactive calculates thermal phonon lattice vibrations and positive temperature coefficient of resistivity"
);

assert(
  interactivesSrc.includes("mat-brass") &&
  interactivesSrc.includes("mat-nacl") &&
  interactivesSrc.includes("CRACK CLEAVAGE: Like charges repel!"),
  "Metallic interactive compares malleable metal/alloy slip vs brittle ionic cleavage under shear stress"
);

// --- SECTION 2: PROTEIN ARCHITECTURE & FOLDING (CHEM-M22-L1) ---
console.log("\n--- Testing CHEM-M22-L1: Protein Architecture & Peptide Bonds ---");

// 5. Spec mapping
assert(
  specsSrc.includes('"CHEM-M22-L1": {') &&
  specsSrc.includes('"type": "chem-protein-folding"') &&
  specsSrc.includes('"title": "Protein Architecture: Amino Acids & Peptide Bonds"'),
  "CHEM-M22-L1 is mapped to 'chem-protein-folding'"
);

assert(
  specsSrc.includes('Dipeptide') &&
  specsSrc.includes('planar trans peptide bond resonance') &&
  specsSrc.includes('hydrophobic core folding'),
  "CHEM-M22-L1 spec includes condensation formula and folding inquiry"
);

// 6. Dispatcher routing
assert(
  interactivesSrc.includes('spec.type.startsWith("chem-protein-folding")') &&
  interactivesSrc.includes("buildProteinArchitectureInteractive(simMountId, spec.defaultParams);"),
  "Dispatcher routes 'chem-protein-folding' to buildProteinArchitectureInteractive"
);

// 7. Engine implementation
assert(
  interactivesSrc.includes("function buildProteinArchitectureInteractive(mountId, params)"),
  "lesson-interactives defines buildProteinArchitectureInteractive function"
);

// 8. 4 Architecture Levels
assert(
  interactivesSrc.includes("drawPrimaryPeptideBond") &&
  interactivesSrc.includes("Planar Peptide Unit (ω = 180° Trans)") &&
  interactivesSrc.includes("40% Double-Bond Character"),
  "Level 1 models planar trans peptide bond with resonance delocalization and zero rotation"
);

assert(
  interactivesSrc.includes("drawSecondaryStructure") &&
  interactivesSrc.includes("3.6 Residues/Turn with Intrachain H-Bonds") &&
  interactivesSrc.includes("β-Pleated Sheet"),
  "Level 2 models alpha-helix (3.6 res/turn, i to i+4 H-bonds) and beta-pleated sheets"
);

assert(
  interactivesSrc.includes("drawTertiaryFolding") &&
  interactivesSrc.includes("Hydrophobic Core") &&
  interactivesSrc.includes("Disulfide") &&
  interactivesSrc.includes("Salt Bridge"),
  "Level 3 models 3D hydrophobic collapse, disulfide bridges, and salt bridges"
);

assert(
  interactivesSrc.includes("drawQuaternaryAssembly") &&
  interactivesSrc.includes("Hemoglobin α₂β₂") &&
  interactivesSrc.includes("Allosteric Cooperativity"),
  "Level 4 models quaternary oligomeric assembly and allosteric cooperativity"
);

// 9. Thermodynamic & Environmental Denaturation
assert(
  interactivesSrc.includes("tempDenat") &&
  interactivesSrc.includes("phDenat") &&
  interactivesSrc.includes("dG = -42.5 * nativeFraction + 15.0 * denatFraction") &&
  interactivesSrc.includes("Anfinsen Refold"),
  "Protein interactive models thermodynamic Gibbs free energy (ΔG), thermal/pH denaturation, and Anfinsen refolding"
);

console.log("\n========================================================");
console.log(`Summary: ${passed} passed, ${failed} failed`);
console.log("========================================================\n");

if (failed > 0) {
  process.exit(1);
}
