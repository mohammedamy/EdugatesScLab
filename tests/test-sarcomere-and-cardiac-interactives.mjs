// Edugates-ClipSAT Science Labs - Unit Test Suite for Sarcomere & Cardiac Cycle Interactives
// Validates spec mapping, engine dispatch, physiological fidelity, phases, and telemetry

import fs from "fs";
import path from "path";

console.log("\n========================================================");
console.log("💪 Sarcomere & ❤️ Cardiac Cycle Interactive Verification");
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

// --- SECTION 1: SARCOMERE SLIDING FILAMENT (BIO-M22-L3) ---
console.log("\n--- Testing BIO-M22-L3: Sarcomere Sliding Filament ---");

// 1. Spec mapping
assert(
  specsSrc.includes('"BIO-M22-L3": {') &&
  specsSrc.includes('"type": "bio-sarcomere-sliding-filament"') &&
  specsSrc.includes('"title": "The Muscular System: Sarcomere Sliding Filament Theory"'),
  "BIO-M22-L3 is mapped to 'bio-sarcomere-sliding-filament'"
);

assert(
  specsSrc.includes('Sarcomere Sliding Filament Theory') &&
  specsSrc.includes('A-band constant length') &&
  specsSrc.includes('2.5'),
  "BIO-M22-L3 spec includes biological formula and inquiry text"
);

// 2. Dispatcher routing
assert(
  interactivesSrc.includes('spec.type.startsWith("bio-sarcomere")') &&
  interactivesSrc.includes("buildSarcomereContractionInteractive(simMountId, spec.defaultParams);"),
  "Dispatcher routes 'bio-sarcomere' to buildSarcomereContractionInteractive"
);

// 3. Engine implementation
assert(
  interactivesSrc.includes("function buildSarcomereContractionInteractive(mountId, params)"),
  "lesson-interactives defines buildSarcomereContractionInteractive function"
);

// 4. Biological & Physical fidelity checks
assert(
  interactivesSrc.includes("A-Band: 1.60 µm (CONSTANT)") &&
  interactivesSrc.includes("Z-Disc (Left)") &&
  interactivesSrc.includes("Z-Disc (Right)") &&
  interactivesSrc.includes("M-Line"),
  "Sarcomere interactive models Z-discs, M-line, and invariant 1.60 µm A-band"
);

assert(
  interactivesSrc.includes("Titin Elastic Spring Filaments") &&
  interactivesSrc.includes("drawActinFilament") &&
  interactivesSrc.includes("Tropomyosin"),
  "Sarcomere models Titin elasticity, actin double helix, and tropomyosin wraps"
);

assert(
  interactivesSrc.includes("drawMicroCrossBridge") &&
  interactivesSrc.includes("RIGOR MORTIS") &&
  interactivesSrc.includes("Power Stroke (45° Pivot)"),
  "Sarcomere includes Molecular Cross-Bridge view with 45° power stroke and Rigor Mortis state"
);

assert(
  interactivesSrc.includes("caHill = Math.pow(calcium, 2.8)") &&
  interactivesSrc.includes("Gordon-Huxley Length-Tension Curve"),
  "Sarcomere computes Hill cooperative calcium activation and Gordon-Huxley length-tension curve"
);

// --- SECTION 2: CARDIAC CYCLE & HEMODYNAMICS (BIO-M24-L1) ---
console.log("\n--- Testing BIO-M24-L1: Cardiac Cycle & Hemodynamics ---");

// 5. Spec mapping
assert(
  specsSrc.includes('"BIO-M24-L1": {') &&
  specsSrc.includes('"type": "bio-cardiac-cycle"') &&
  specsSrc.includes('"title": "The Circulatory System: Cardiac Cycle & Hemodynamics"'),
  "BIO-M24-L1 is mapped to 'bio-cardiac-cycle'"
);

assert(
  specsSrc.includes('Cardiac Cycle & Hemodynamics') &&
  specsSrc.includes('Wiggers pressure loops') &&
  specsSrc.includes('S1/S2 heart valve mechanics'),
  "BIO-M24-L1 spec includes cardiac output and mean arterial pressure formulas"
);

// 6. Dispatcher routing
assert(
  interactivesSrc.includes('spec.type.startsWith("bio-cardiac-cycle")') &&
  interactivesSrc.includes("buildCardiacCycleInteractive(simMountId, spec.defaultParams);"),
  "Dispatcher routes 'bio-cardiac-cycle' to buildCardiacCycleInteractive"
);

// 7. Engine implementation
assert(
  interactivesSrc.includes("function buildCardiacCycleInteractive(mountId, params)"),
  "lesson-interactives defines buildCardiacCycleInteractive function"
);

// 8. 4-Chamber Anatomy & Valves
assert(
  interactivesSrc.includes("RA") &&
  interactivesSrc.includes("RV") &&
  interactivesSrc.includes("LA") &&
  interactivesSrc.includes("LV") &&
  interactivesSrc.includes("LV Wall") &&
  interactivesSrc.includes("(3x Thick)"),
  "Cardiac interactive renders 4 chambers with 3x thicker LV myocardium wall"
);

assert(
  interactivesSrc.includes("Tricuspid") &&
  interactivesSrc.includes("Mitral") &&
  interactivesSrc.includes("Pulmonary") &&
  interactivesSrc.includes("Aortic"),
  "Cardiac interactive models all 4 cardiac valves with dynamic leaflet states"
);

// 9. 5 Cardiac Phases & Sound Events
assert(
  interactivesSrc.includes("Phase 1: Atrial Systole") &&
  interactivesSrc.includes("Phase 2: Isovolumetric Contraction") &&
  interactivesSrc.includes("Phase 3: Rapid Ventricular Ejection") &&
  interactivesSrc.includes("Phase 4: Isovolumetric Relaxation") &&
  interactivesSrc.includes("Phase 5: Passive Ventricular Filling"),
  "Cardiac interactive models all 5 authentic phases of the cardiac cycle"
);

assert(
  interactivesSrc.includes("S1 (LUB)") &&
  interactivesSrc.includes("S2 (DUB)"),
  "Cardiac interactive generates S1 LUB and S2 DUB audio-visual sound events"
);

// 10. Oscilloscope Telemetry (Lead II ECG + Wiggers Curves)
assert(
  interactivesSrc.includes("Lead II ECG (mV)") &&
  interactivesSrc.includes("Wiggers Pressure (mmHg)") &&
  interactivesSrc.includes("Dicrotic notch"),
  "Cardiac interactive includes synchronized Lead II ECG and Wiggers pressure curves with dicrotic notch"
);

console.log("\n========================================================");
console.log(`Summary: ${passed} passed, ${failed} failed`);
console.log("========================================================\n");

if (failed > 0) {
  process.exit(1);
}
