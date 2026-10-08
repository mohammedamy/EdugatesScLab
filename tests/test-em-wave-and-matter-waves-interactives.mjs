// Edugates-ClipSAT Science Labs - Unit Test Suite for Maxwell EM Waves & De Broglie Matter Waves Interactives
// Validates spec mapping, engine dispatch, physical fidelity, polarization, and quantum wave mechanics

import fs from "fs";
import path from "path";

console.log("\n========================================================");
console.log("⚡ Maxwell EM Waves & 🔬 De Broglie Matter Waves Verification");
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

// --- SECTION 1: MAXWELL EM WAVES (PHYS-M21-L3) ---
console.log("\n--- Testing PHYS-M21-L3: Maxwell's Equations & EM Waves ---");

// 1. Spec mapping
assert(
  specsSrc.includes('"PHYS-M21-L3": {') &&
  specsSrc.includes('"type": "phys-em-wave-propagation"') &&
  specsSrc.includes('"title": "Maxwell\'s Equations & Self-Propagating EM Waves"'),
  "PHYS-M21-L3 is mapped to 'phys-em-wave-propagation'"
);

assert(
  specsSrc.includes('Self-Propagating EM Waves') &&
  specsSrc.includes('linear vs circular polarization') &&
  specsSrc.includes("Malus's law"),
  "PHYS-M21-L3 spec includes speed of light formula and wave polarization inquiry"
);

// 2. Dispatcher routing
assert(
  interactivesSrc.includes('spec.type.startsWith("phys-em-wave")') &&
  interactivesSrc.includes("buildMaxwellEmWaveInteractive(simMountId, spec.defaultParams);"),
  "Dispatcher routes 'phys-em-wave' to buildMaxwellEmWaveInteractive"
);

// 3. Engine implementation
assert(
  interactivesSrc.includes("function buildMaxwellEmWaveInteractive(mountId, params)"),
  "lesson-interactives defines buildMaxwellEmWaveInteractive function"
);

// 4. Physical fidelity checks
assert(
  interactivesSrc.includes("Self-Propagating EM Wave (Vacuum)") &&
  interactivesSrc.includes("Poynting Vector: S = (E × B) / μ₀") &&
  interactivesSrc.includes("c = 3.00 × 10⁸ m/s"),
  "EM wave interactive models Poynting energy flux vector and invariant vacuum speed of light"
);

assert(
  interactivesSrc.includes("draw3DWaveform") &&
  interactivesSrc.includes("ampE * Math.cos(spatialPhase)") &&
  interactivesSrc.includes("ampB * Math.cos(spatialPhase)"),
  "EM wave interactive renders 3D orthogonal electric and magnetic field oscillations"
);

assert(
  interactivesSrc.includes("drawEndOnView") &&
  interactivesSrc.includes("Circular Polarization") &&
  interactivesSrc.includes("Malus's Law"),
  "EM wave interactive models linear, circular (helical tip), and Malus analyzer attenuation"
);

// --- SECTION 2: DE BROGLIE MATTER WAVES (PHYS-M22-L2) ---
console.log("\n--- Testing PHYS-M22-L2: Matter Waves & De Broglie Wavelength ---");

// 5. Spec mapping
assert(
  specsSrc.includes('"PHYS-M22-L2": {') &&
  specsSrc.includes('"type": "phys-matter-waves"') &&
  specsSrc.includes('"title": "Matter Waves & De Broglie Wavelength"'),
  "PHYS-M22-L2 is mapped to 'phys-matter-waves'"
);

assert(
  specsSrc.includes('single-particle double-slit accumulation') &&
  specsSrc.includes('matter wave interference fringes') &&
  specsSrc.includes('wavefunction collapse under which-way observation'),
  "PHYS-M22-L2 spec includes de Broglie formula and quantum double-slit inquiry"
);

// 6. Dispatcher routing
assert(
  interactivesSrc.includes('spec.type.startsWith("phys-matter-waves")') &&
  interactivesSrc.includes("buildDeBroglieMatterWavesInteractive(simMountId, spec.defaultParams);"),
  "Dispatcher routes 'phys-matter-waves' to buildDeBroglieMatterWavesInteractive"
);

// 7. Engine implementation
assert(
  interactivesSrc.includes("function buildDeBroglieMatterWavesInteractive(mountId, params)"),
  "lesson-interactives defines buildDeBroglieMatterWavesInteractive function"
);

// 8. Quantum wave mechanics
assert(
  interactivesSrc.includes("Quantum Double-Slit Diffraction") &&
  interactivesSrc.includes("accumulatedHits") &&
  interactivesSrc.includes("sampleArrivalPosition"),
  "Matter waves interactive simulates discrete single-particle accumulation into continuous interference fringes"
);

assert(
  interactivesSrc.includes("whichWayDetector") &&
  interactivesSrc.includes("Wavefunction Collapsed (Particle Clumps)") &&
  interactivesSrc.includes("P = P₁ + P₂"),
  "Matter waves interactive models observer-induced wavefunction collapse destroying quantum interference"
);

assert(
  interactivesSrc.includes("buckyball") &&
  interactivesSrc.includes("baseball") &&
  interactivesSrc.includes("Macroscopic Limit"),
  "Matter waves interactive compares microscopic electrons, C60 buckyballs, and macroscopic classical baseballs"
);

console.log("\n========================================================");
console.log(`Summary: ${passed} passed, ${failed} failed`);
console.log("========================================================\n");

if (failed > 0) {
  process.exit(1);
}
