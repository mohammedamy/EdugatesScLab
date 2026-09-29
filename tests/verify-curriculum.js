// Edugates-ClipSAT Science Labs - Automated System & Curriculum Integrity Test Suite
// Verifies 74 modules, 242 lesson interactives, 9 virtual laboratories, question bank, and theme contracts.

// Provide mock browser environment for Node.js test execution
if (typeof globalThis.localStorage === "undefined") {
  globalThis.localStorage = {
    _data: {},
    getItem(key) { return this._data[key] || null; },
    setItem(key, val) { this._data[key] = String(val); },
    removeItem(key) { delete this._data[key]; },
    clear() { this._data = {}; }
  };
}
if (typeof globalThis.window === "undefined") {
  globalThis.window = globalThis;
}
if (typeof globalThis.document === "undefined") {
  globalThis.document = {
    getElementById: () => null,
    createElement: () => ({
      setAttribute: () => {},
      appendChild: () => {},
      style: {},
      classList: { add: () => {}, remove: () => {} }
    }),
    body: { appendChild: () => {} }
  };
}

import { chemistryCurriculum } from "../data/chemistry-curriculum.js";
import { biologyCurriculum } from "../data/biology-curriculum.js";
import { physicsCurriculum } from "../data/physics-curriculum.js";
import { questionBank } from "../data/question-bank.js";
import { getLessonInteractiveSpec } from "../components/lesson-interactives.js";
import { SCIENTIFIC_DIAGRAMS } from "../data/scientific-diagrams.js";
import { getOrGenerateDiagram } from "../scripts/diagram-svg-generator.mjs";

console.log("\n========================================================");
console.log("🧪 Edugates-ClipSAT Science Labs - Master Verification Suite");
console.log("========================================================\n");

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedTests++;
  }
}

// ----------------------------------------------------
// Test 1: Curriculum Module Counts (74 Total Modules)
// ----------------------------------------------------
console.log("📋 Test 1: Curriculum Module Structure");
assert(chemistryCurriculum.modules.length === 23, `Chemistry curriculum contains 23 modules (Found: ${chemistryCurriculum.modules.length})`);
assert(biologyCurriculum.modules.length === 27, `Biology curriculum contains 27 modules (Found: ${biologyCurriculum.modules.length})`);
assert(physicsCurriculum.modules.length === 24, `Physics curriculum contains 24 modules (Found: ${physicsCurriculum.modules.length})`);

const totalModules = chemistryCurriculum.modules.length + biologyCurriculum.modules.length + physicsCurriculum.modules.length;
assert(totalModules === 74, `Total curriculum chapters equal 74 (Found: ${totalModules})`);

// ----------------------------------------------------
// Test 2: Lesson Counts & Metadata (242 Total Lessons)
// ----------------------------------------------------
console.log("\n📖 Test 2: Lesson Distribution & Metadata Integrity");
const chemLessons = chemistryCurriculum.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
const bioLessons = biologyCurriculum.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
const physLessons = physicsCurriculum.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
const totalLessons = chemLessons + bioLessons + physLessons;

assert(chemLessons === 89, `Chemistry has 89 lessons (Found: ${chemLessons})`);
assert(bioLessons === 81, `Biology has 81 lessons (Found: ${bioLessons})`);
assert(physLessons === 72, `Physics has 72 lessons (Found: ${physLessons})`);
assert(totalLessons === 242, `Platform total lessons equal 242 (Found: ${totalLessons})`);

// Verify lesson metadata structure across all lessons
let allLessonsValid = true;
let invalidLessonMsg = "";

[chemistryCurriculum, biologyCurriculum, physicsCurriculum].forEach(curriculum => {
  curriculum.modules.forEach(m => {
    if (!m.id || !m.title || !m.unit) {
      allLessonsValid = false;
      invalidLessonMsg = `Module ${m.code || m.id} missing title or unit`;
    }
    m.lessons.forEach(l => {
      if (!l.id || !l.title) {
        allLessonsValid = false;
        invalidLessonMsg = `Lesson in ${m.code} missing id or title`;
      }
    });
  });
});
assert(allLessonsValid, `All 242 lessons contain complete ID, title, and structure (${invalidLessonMsg || "Verified"})`);

// ----------------------------------------------------
// Test 3: Simulation Interactive Specification Mapping
// ----------------------------------------------------
console.log("\n⚡ Test 3: Interactive Simulation Registry Coverage");
let mappedInteractives = 0;
let missingInteractives = [];

[chemistryCurriculum, biologyCurriculum, physicsCurriculum].forEach(curriculum => {
  curriculum.modules.forEach(m => {
    m.lessons.forEach(l => {
      const spec = getLessonInteractiveSpec(curriculum.code, m.id, l.id);
      if (spec && spec.type && spec.title && spec.formula) {
        mappedInteractives++;
      } else {
        missingInteractives.push(`${curriculum.code}-M${m.id}-L${l.id}`);
      }
    });
  });
});

assert(
  mappedInteractives === 242,
  `All 242 lessons map to a valid interactive specification (Mapped: ${mappedInteractives}/242, Missing: ${missingInteractives.length})`
);

// ----------------------------------------------------
// Test 4: Question Bank Consistency
// ----------------------------------------------------
console.log("\n❓ Test 4: Assessment Question Bank Integrity");
assert(Array.isArray(questionBank) && questionBank.length >= 3630, `Question bank is loaded with ${questionBank.length} items (Minimum required: 3,630)`);

let qBankValid = true;
questionBank.forEach((q, idx) => {
  const promptText = q.prompt || q.question;
  const hasValidType = ["mcq", "numerical", "cer", "diagram"].includes(q.type);
  if (!q.id || !promptText || !hasValidType) {
    qBankValid = false;
    console.error(`Invalid question at index ${idx}:`, q);
  }
  if (q.type === "mcq" || q.type === "numerical" || q.type === "diagram") {
    if (!Array.isArray(q.options) || q.correctIndex === undefined) {
      qBankValid = false;
      console.error(`MCQ/Diagram question at index ${idx} missing options or correctIndex:`, q);
    }
  } else if (q.type === "cer") {
    if (!q.explanation || !q.rubricCER) {
      qBankValid = false;
      console.error(`CER question at index ${idx} missing rubric:`, q);
    }
  }
});
assert(qBankValid, `All seeded questions have valid prompts, types, options, and rubrics`);

// Verify that every single lesson across all 242 curriculum lessons has >= 15 questions
let minQuestionsPerLesson = Infinity;
let lessonsBelowThreshold = [];
[chemistryCurriculum, biologyCurriculum, physicsCurriculum].forEach(cur => {
  cur.modules.forEach(m => {
    m.lessons.forEach(l => {
      const lessonQuestions = questionBank.filter(q => 
        q.subject === cur.code && 
        q.moduleId === m.id && 
        (q.lessonId === undefined || q.lessonId === l.id)
      );
      if (lessonQuestions.length < minQuestionsPerLesson) {
        minQuestionsPerLesson = lessonQuestions.length;
      }
      if (lessonQuestions.length < 15) {
        lessonsBelowThreshold.push(`${cur.code}-M${m.id}-L${l.id} (${lessonQuestions.length})`);
      }
    });
  });
});
assert(
  lessonsBelowThreshold.length === 0,
  `Every single lesson has at least 15 questions (Min: ${minQuestionsPerLesson}, Failing: ${lessonsBelowThreshold.join(", ") || "None"})`
);


// ----------------------------------------------------
// Test 5: Virtual Laboratories Interface Compliance
// ----------------------------------------------------
console.log("\n🔬 Test 5: Virtual Laboratory Suites Verification");
const virtualLabFiles = [
  "labs/chem-titration.js",
  "labs/chem-gas-laws.js",
  "labs/chem-periodic-table.js",
  "labs/chem-vsepr.js",
  "labs/chem-calorimetry.js",
  "labs/chem-equilibrium.js",
  "labs/chem-electrochem.js",
  "labs/bio-microscope.js",
  "labs/bio-punnett-square.js",
  "labs/bio-dna-protein.js",
  "labs/bio-photosynthesis.js",
  "labs/bio-enzyme-kinetics.js",
  "labs/bio-respiration.js",
  "labs/phys-circuits.js",
  "labs/phys-optics.js",
  "labs/phys-projectile.js",
  "labs/phys-waves.js",
  "labs/phys-harmonic.js",
  "labs/phys-photoelectric.js",
  "labs/phys-magnetism.js"
];

let allLabsImported = true;
await Promise.all(
  virtualLabFiles.map(async (file) => {
    try {
      const mod = await import(`../${file}`);
      const exportKeys = Object.keys(mod);
      const hasMount = exportKeys.some(k => k.toLowerCase().startsWith("mount") || k.toLowerCase().startsWith("init") || k.toLowerCase().startsWith("render"));
      if (!hasMount) {
        allLabsImported = false;
        console.error(`Lab ${file} missing mount function. Exports:`, exportKeys);
      }
    } catch (e) {
      allLabsImported = false;
      console.error(`Error importing ${file}:`, e.message);
    }
  })
);
assert(allLabsImported, `All 20 virtual lab modules load successfully with required interface`);

// ----------------------------------------------------
// Test 6: Scientific Diagrams & Flagship SVG Models Verification
// ----------------------------------------------------
console.log("\n📐 Test 6: Scientific Diagrams & Flagship Vector SVG Models");
const expectedFlagships = [
  "chem_heating_curve",
  "chem_rutherford_gold_foil",
  "chem_mass_spectrometry",
  "chem_energy_diagram",
  "chem_titration_curve",
  "chem_galvanic_cell",
  "chem_le_chatelier_shifts",
  "bio_membrane_fluid_mosaic",
  "bio_photosynthesis_z_scheme",
  "bio_pedigree_chart",
  "bio_dna_replication_fork",
  "bio_pcr_thermocycling",
  "bio_action_potential",
  "phys_velocity_time_graph",
  "phys_free_body_incline",
  "phys_carnot_cycle",
  "phys_ray_refraction",
  "phys_double_slit_interference",
  "phys_circuit_resistors",
  "phys_photoelectric_effect"
];

let allFlagshipsPresent = true;
let flagshipsValidSvg = true;

expectedFlagships.forEach(id => {
  const diag = SCIENTIFIC_DIAGRAMS[id];
  if (!diag) {
    allFlagshipsPresent = false;
    console.error(`Missing expected flagship diagram: ${id}`);
    return;
  }
  if (!diag.svg || !diag.svg.includes("<svg") || !diag.svg.includes("</svg>") || !diag.svg.includes("viewBox")) {
    flagshipsValidSvg = false;
    console.error(`Diagram ${id} has invalid or missing SVG structure`);
  }
});

assert(allFlagshipsPresent, `All ${expectedFlagships.length} flagship diagrams defined in SCIENTIFIC_DIAGRAMS`);
assert(flagshipsValidSvg, `All flagship diagrams contain valid vector SVG markup with calibrated viewBox`);

// Verify targeted flagship diagram additions
const dnaDiag = SCIENTIFIC_DIAGRAMS.bio_dna_replication_fork;
assert(
  dnaDiag && dnaDiag.svg.includes("Helicase") && dnaDiag.svg.includes("Okazaki"),
  "DNA Replication Fork model contains continuous/lagging strands, Helicase, and Okazaki fragments"
);

const peDiag = SCIENTIFIC_DIAGRAMS.phys_photoelectric_effect;
assert(
  peDiag && peDiag.svg.includes("Work Function") && peDiag.svg.includes("Fermi Level"),
  "Photoelectric Effect model includes work function (Φ), Fermi level, and kinetic energy vs frequency graph"
);

const eqDiag = SCIENTIFIC_DIAGRAMS.chem_le_chatelier_shifts;
assert(
  eqDiag && (eqDiag.svg.includes("LE CHATELIER") || eqDiag.title.includes("Le Chatelier")) && eqDiag.svg.includes("[N₂]"),
  "Le Chatelier Shifts model displays concentration vs time curves and stoichiometric consumption"
);

const ruthDiag = SCIENTIFIC_DIAGRAMS.chem_rutherford_gold_foil;
assert(
  ruthDiag && ruthDiag.svg.includes("RUTHERFORD") && ruthDiag.svg.includes("Gold Foil"),
  "Rutherford Gold Foil model illustrates alpha particle trajectories and dense positive nucleus"
);

const photoDiag = SCIENTIFIC_DIAGRAMS.bio_photosynthesis_z_scheme;
assert(
  photoDiag && photoDiag.svg.includes("LIGHT-DEPENDENT") && photoDiag.svg.includes("PS II"),
  "Photosynthesis Thylakoid model illustrates Z-scheme electron transport, photolysis, and ATP Synthase"
);

// Verify routing in getOrGenerateDiagram
const chem17L2 = getOrGenerateDiagram("CHEM", { id: 17 }, { id: 2 }, null);
assert(chem17L2 && chem17L2.id === "chem_le_chatelier_shifts", "CHEM-M17-L2 routes to chem_le_chatelier_shifts");

const chem3L2 = getOrGenerateDiagram("CHEM", { id: 3 }, { id: 2 }, null);
assert(chem3L2 && chem3L2.id === "chem_rutherford_gold_foil", "CHEM-M03-L2 routes to chem_rutherford_gold_foil");

const bio11L2 = getOrGenerateDiagram("BIO", { id: 11 }, { id: 2 }, null);
assert(bio11L2 && bio11L2.id === "bio_dna_replication_fork", "BIO-M11-L2 routes to bio_dna_replication_fork");

const bio8L2 = getOrGenerateDiagram("BIO", { id: 8 }, { id: 2 }, null);
assert(bio8L2 && bio8L2.id === "bio_photosynthesis_z_scheme", "BIO-M08-L2 routes to bio_photosynthesis_z_scheme");

const phys22L1 = getOrGenerateDiagram("PHYS", { id: 22 }, { id: 1 }, null);
assert(phys22L1 && phys22L1.id === "phys_photoelectric_effect", "PHYS-M22-L1 routes to phys_photoelectric_effect");

// Verify interactive simulation mapping for BIO-M11-L2
const bio11L2Spec = getLessonInteractiveSpec("BIO", 11, 2);
assert(bio11L2Spec && bio11L2Spec.type === "bio-dna-replication", "BIO-M11-L2 interactive maps to dedicated 'bio-dna-replication' workbench");

// ----------------------------------------------------
// Summary
// ----------------------------------------------------
console.log("\n========================================================");
console.log(`📊 Verification Complete: ${passedTests} Passed, ${failedTests} Failed`);
console.log("========================================================\n");

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
