// Edugates-ClipSAT Science Labs - Unit Test Suite for Laboratory Deep-Links & Checkpoint Integrity
// Validates that all curriculum modules map to valid laboratory suites,
// that normalizeLabId resolves all canonical and alias forms,
// that all 12 laboratories contain verified competency checkpoint questions,
// and that all 12 virtual lab modules initialize cleanly without runtime errors.

globalThis.Image = class Image {
  constructor() {
    setTimeout(() => { if (this.onload) this.onload(); }, 0);
  }
};

const ctxProxy = new Proxy({
  createImageData: () => ({ data: new Uint8ClampedArray(400) }),
  measureText: () => ({ width: 50 }),
  createLinearGradient: () => ({ addColorStop: () => {} }),
  createRadialGradient: () => ({ addColorStop: () => {} })
}, {
  get: (target, prop) => {
    if (prop in target) return target[prop];
    return () => {};
  }
});

const elements = {};
function createMockEl(id) {
  return {
    id: id || "",
    innerHTML: "",
    innerText: "",
    style: { setProperty: () => {}, removeProperty: () => {} },
    classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelectorAll: () => [],
    querySelector: () => null,
    appendChild: () => {},
    removeChild: () => {},
    getBoundingClientRect: () => ({ width: 600, height: 500, left: 0, top: 0, right: 600, bottom: 500 }),
    getContext: () => ctxProxy,
    width: 600,
    height: 500,
    dataset: {}
  };
}

globalThis.window = {
  location: { href: "https://mohammedamy.github.io/EdugtesScLab/", hash: "" },
  addEventListener: () => {},
  removeEventListener: () => {},
  requestAnimationFrame: () => 1,
  cancelAnimationFrame: () => {},
  scrollTo: () => {}
};
globalThis.requestAnimationFrame = () => 1;
globalThis.cancelAnimationFrame = () => {};

globalThis.document = {
  documentElement: { setAttribute: () => {} },
  getElementById: (id) => {
    if (!elements[id]) elements[id] = createMockEl(id);
    return elements[id];
  },
  querySelectorAll: () => [],
  querySelector: () => null,
  addEventListener: () => {},
  createElement: (tag) => createMockEl(tag)
};

globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {}
};

import { normalizeLabId } from "../app.js";
import { chemistryCurriculum } from "../data/chemistry-curriculum.js";
import { biologyCurriculum } from "../data/biology-curriculum.js";
import { physicsCurriculum } from "../data/physics-curriculum.js";
import { LAB_CHECKPOINTS } from "../labs/lab-telemetry-exporter.js";

console.log("\n========================================================");
console.log("🔬 Virtual Laboratories Deep-Links & Checkpoints Verification");
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

// 1. Lab Normalization Engine (Resolves aliases to canonical IDs)
const testCases = [
  { input: "lab-periodic-table", expected: "ptable" },
  { input: "periodic-table", expected: "ptable" },
  { input: "ptable", expected: "ptable" },
  { input: "LAB-GAS-LAWS", expected: "gaslaws" },
  { input: "gas-laws", expected: "gaslaws" },
  { input: "gaslaws", expected: "gaslaws" },
  { input: "lab-dna-protein", expected: "dnaprotein" },
  { input: "dna-protein", expected: "dnaprotein" },
  { input: "dnaprotein", expected: "dnaprotein" },
  { input: "lab-punnett", expected: "punnett" },
  { input: "punnett-square", expected: "punnett" },
  { input: "punnett", expected: "punnett" },
  { input: "lab-projectile", expected: "projectile" },
  { input: "kinematics", expected: "projectile" },
  { input: "projectile", expected: "projectile" },
  { input: "lab-titration", expected: "titration" },
  { input: "titration", expected: "titration" },
  { input: "lab-microscope", expected: "microscope" },
  { input: "microscope", expected: "microscope" },
  { input: "lab-circuits", expected: "circuits" },
  { input: "circuit", expected: "circuits" },
  { input: "circuits", expected: "circuits" },
  { input: "lab-optics", expected: "optics" },
  { input: "optic", expected: "optics" },
  { input: "optics", expected: "optics" },
  { input: "lab-vsepr", expected: "vsepr" },
  { input: "vsepr", expected: "vsepr" },
  { input: "lab-waves", expected: "waves" },
  { input: "wave", expected: "waves" },
  { input: "waves", expected: "waves" },
  { input: "lab-photosynthesis", expected: "photosynthesis" },
  { input: "photosynthesis", expected: "photosynthesis" }
];

let allNormalized = true;
testCases.forEach(({ input, expected }) => {
  const result = normalizeLabId(input);
  if (result !== expected) {
    allNormalized = false;
    console.error(`normalizeLabId("${input}") gave "${result}", expected "${expected}"`);
  }
});
assert(allNormalized, "normalizeLabId correctly resolves all 32 alias and canonical permutations");

// 2. All 74 Modules Map to Valid Laboratory Suites
const expectedLabIds = [
  "projectile", "titration", "microscope", "ptable",
  "circuits", "gaslaws", "dnaprotein", "punnett",
  "optics", "vsepr", "waves", "photosynthesis"
];

let allModulesMapValid = true;
const allModules = [
  ...chemistryCurriculum.modules,
  ...biologyCurriculum.modules,
  ...physicsCurriculum.modules
];

allModules.forEach(m => {
  const labNorm = normalizeLabId(m.lab);
  if (!expectedLabIds.includes(labNorm)) {
    allModulesMapValid = false;
    console.error(`Module ${m.code} has unmapped lab: "${m.lab}" -> "${labNorm}"`);
  }
});
assert(allModulesMapValid && allModules.length === 74, `All 74 curriculum modules map to one of 12 verified lab suites (Total: ${allModules.length})`);

// 3. Competency Checkpoint Questions Coverage
let allCheckpointsPresent = true;
expectedLabIds.forEach(id => {
  const qList = LAB_CHECKPOINTS[id];
  if (!Array.isArray(qList) || qList.length < 3) {
    allCheckpointsPresent = false;
    console.error(`Missing or incomplete checkpoint questions for lab: ${id}`);
  }
});
assert(allCheckpointsPresent, "All 12 virtual laboratory suites contain at least 3 validated checkpoint questions");

// 4. Checkpoint Question Structure & Rubric Quality
let questionsValid = true;
Object.entries(LAB_CHECKPOINTS).forEach(([labKey, qList]) => {
  qList.forEach((q, idx) => {
    if (!q.question || !Array.isArray(q.options) || q.options.length < 4 || q.correctIndex === undefined || !q.explanation) {
      questionsValid = false;
      console.error(`Invalid question structure in ${labKey}[${idx}]:`, q);
    }
  });
});
assert(questionsValid, "All lab checkpoint questions contain valid prompts, 4 options, answer keys, and pedagogical explanations");

// 5. Virtual Laboratory Workbench Runtime Loaders
const labLoaders = [
  { name: "projectile", loader: () => import("../labs/phys-projectile.js").then(m => m.initProjectileLab("test-mount")) },
  { name: "titration", loader: () => import("../labs/chem-titration.js").then(m => m.initTitrationLab("test-mount")) },
  { name: "microscope", loader: () => import("../labs/bio-microscope.js").then(m => m.initMicroscopeLab("test-mount")) },
  { name: "ptable", loader: () => import("../labs/chem-periodic-table.js").then(m => m.initPeriodicTableLab("test-mount")) },
  { name: "circuits", loader: () => import("../labs/phys-circuits.js").then(m => m.initCircuitsLab("test-mount")) },
  { name: "gaslaws", loader: () => import("../labs/chem-gas-laws.js").then(m => m.initGasLawsLab("test-mount")) },
  { name: "dnaprotein", loader: () => import("../labs/bio-dna-protein.js").then(m => m.initDnaProteinLab("test-mount")) },
  { name: "punnett", loader: () => import("../labs/bio-punnett-square.js").then(m => m.initPunnettLab("test-mount")) },
  { name: "optics", loader: () => import("../labs/phys-optics.js").then(m => m.initOpticsLab("test-mount")) },
  { name: "vsepr", loader: () => import("../labs/chem-vsepr.js").then(m => m.initVseprLab("test-mount")) },
  { name: "waves", loader: () => import("../labs/phys-waves.js").then(m => m.initWaveLab("test-mount")) },
  { name: "photosynthesis", loader: () => import("../labs/bio-photosynthesis.js").then(m => m.initPhotosynthesisLab("test-mount")) }
];

let allLabsInitCleanly = true;
for (const lab of labLoaders) {
  try {
    const cleanup = await lab.loader();
    if (typeof cleanup === "function") cleanup();
  } catch (err) {
    allLabsInitCleanly = false;
    console.error(`Error initializing lab "${lab.name}":`, err);
  }
}
assert(allLabsInitCleanly, "All 12 virtual laboratory workbenches initialize without runtime errors");

console.log("\n========================================================");
console.log(`📊 Lab Links Tests: ${passed} Passed, ${failed} Failed`);
console.log("========================================================\n");

if (failed > 0) process.exit(1);
else process.exit(0);
