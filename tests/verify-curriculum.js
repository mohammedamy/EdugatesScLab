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
  const hasValidType = ["mcq", "numerical", "cer"].includes(q.type);
  if (!q.id || !promptText || !hasValidType) {
    qBankValid = false;
    console.error(`Invalid question at index ${idx}:`, q);
  }
  if (q.type === "mcq" || q.type === "numerical") {
    if (!Array.isArray(q.options) || q.correctIndex === undefined) {
      qBankValid = false;
      console.error(`MCQ question at index ${idx} missing options or correctIndex:`, q);
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
  "labs/bio-microscope.js",
  "labs/bio-punnett-square.js",
  "labs/bio-dna-protein.js",
  "labs/phys-circuits.js",
  "labs/phys-optics.js",
  "labs/phys-projectile.js"
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
assert(allLabsImported, `All 9 virtual lab modules load successfully with required interface`);

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
