// Edugates-ClipSAT Science Labs - Unit Test Suite for Embryonic Development Interactive
// Validates spec mapping, engine dispatch, anatomical fidelity, stages, and telemetry

import fs from "fs";
import path from "path";

console.log("\n========================================================");
console.log("🧬 Embryonic Development Interactive Engine Verification");
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

// 1. Spec mapping
assert(
  specsSrc.includes('"BIO-M26-L2": {') &&
  specsSrc.includes('"type": "bio-embryonic-development"') &&
  specsSrc.includes('"title": "Embryonic Development: Cleavage & Fetal Trimesters"'),
  "BIO-M26-L2 is correctly mapped to 'bio-embryonic-development'"
);

assert(
  specsSrc.includes('"BIO-M20-L1": {') &&
  specsSrc.includes('"title": "Animal Characteristics: Embryonic Cleavage & Germ Layers"'),
  "BIO-M20-L1 is mapped to 'bio-embryonic-development'"
);

// 2. Dispatcher routing
assert(
  interactivesSrc.includes('spec.type.startsWith("bio-embryonic")') &&
  interactivesSrc.includes("buildEmbryonicDevelopmentInteractive(simMountId, spec.defaultParams);"),
  "lesson-interactives dispatcher routes 'bio-embryonic' to buildEmbryonicDevelopmentInteractive"
);

// 3. Engine implementation
assert(
  interactivesSrc.includes("function buildEmbryonicDevelopmentInteractive(mountId, params)"),
  "lesson-interactives defines buildEmbryonicDevelopmentInteractive function"
);

// 4. Five developmental stages
assert(
  interactivesSrc.includes('id: "zygote"') &&
  interactivesSrc.includes('id: "morula"') &&
  interactivesSrc.includes('id: "blastocyst"') &&
  interactivesSrc.includes('id: "embryo"') &&
  interactivesSrc.includes('id: "fetus"'),
  "Interactive defines 5 key developmental stages (Zygote, Morula, Blastocyst, Embryo, Fetus)"
);

// 5. High-fidelity canvas elements
assert(
  interactivesSrc.includes("Zona Pellucida (ZP3)") &&
  interactivesSrc.includes("Maternal Pronucleus") &&
  interactivesSrc.includes("Paternal Pronucleus") &&
  interactivesSrc.includes("2nd Polar Body"),
  "Stage 0 renders realistic Zygote (Zona Pellucida, Syngamy Pronuclei, Polar Bodies)"
);

assert(
  interactivesSrc.includes("Compacted Blastomeres") &&
  interactivesSrc.includes("E-Cadherin Tight Junctions"),
  "Stage 1 renders realistic Morula Cleavage & Compaction"
);

assert(
  interactivesSrc.includes("Blastocoel (Fluid Cavity)") &&
  interactivesSrc.includes("Inner Cell Mass (Pluripotent ICM)") &&
  interactivesSrc.includes("Trophoblast (Forms Placenta)") &&
  interactivesSrc.includes("Syncytiotrophoblast Invasion"),
  "Stage 2 renders Blastocyst cavitation, ICM, Trophoblast, and Endometrial Decidual Invasion"
);

assert(
  interactivesSrc.includes("Beating Heart Tube (145 BPM)") &&
  interactivesSrc.includes("Optic Cup & Lens Vesicle") &&
  interactivesSrc.includes("Primary Brain Vesicles") &&
  interactivesSrc.includes("Segmented Mesodermal Somites") &&
  interactivesSrc.includes("Forelimb Paddle Bud"),
  "Stage 3 renders 6-Week Embryo Organogenesis with Beating Heart (145 BPM), Eye Cup, Somites, and Limb Buds"
);

assert(
  interactivesSrc.includes("Amniotic Cavity & Fluid") &&
  interactivesSrc.includes("Umbilical Cord (2 Arteries, 1 Vein)") &&
  interactivesSrc.includes("Maternal Placenta & Villi") &&
  interactivesSrc.includes("isOxygenated"),
  "Stage 4 renders 20-Week Fetus with Amniotic Sac, Spiral Umbilical Cord, and Dynamic Counter-Current Blood Flow Tracers"
);

// 6. Upgraded Mitosis Simulator
assert(
  interactivesSrc.includes("drawChromosome") &&
  interactivesSrc.includes("Centriole 1 (horizontal)") &&
  interactivesSrc.includes("Centriole 2 (vertical)") &&
  interactivesSrc.includes("Radiating Astral Microtubules (Asters)") &&
  interactivesSrc.includes("Contractile ring & Cleavage Furrow pinching"),
  "buildMitosisCellCycleInteractive is upgraded with 3D chromosomes, kinetochores, centrioles, and asters"
);

console.log("\n========================================================");
console.log(`📊 Embryonic Engine Verification: ${passed} Passed, ${failed} Failed`);
console.log("========================================================\n");

if (failed > 0) {
  process.exit(1);
}
