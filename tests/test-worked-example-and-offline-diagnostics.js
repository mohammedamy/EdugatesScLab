// Edugates-ClipSAT Science Labs - Option 2 & Option 3 Automated Test Suite
// Verifies Interactive Worked Example Calculation Solvers and Offline Diagnostics & Storage Quota Panel

import assert from "assert";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("========================================================");
console.log("🧮 Option 2 & Option 3: Worked Example Solver & Offline Diagnostics");
console.log("========================================================\n");

let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${desc}`);
    console.error(`     Error: ${err.message}`);
    failed++;
  }
}

// -----------------------------------------------------------------------------
// Test Group 1: validateStepAnswer Unit Tests
// -----------------------------------------------------------------------------
import { validateStepAnswer, parseOrGenerateSolverSteps, renderWorkedExampleHTML } from "../components/worked-example-solver.js";

it("validateStepAnswer accepts exact matches", () => {
  const res = validateStepAnswer("16.5", "16.5");
  assert.strictEqual(res.valid, true);
});

it("validateStepAnswer accepts numbers within +/- 3% tolerance", () => {
  const res1 = validateStepAnswer("16.6", "16.5", 0.03); // ~0.6% diff
  assert.strictEqual(res1.valid, true);

  const res2 = validateStepAnswer("16.2", "16.5", 0.03); // ~1.8% diff
  assert.strictEqual(res2.valid, true);

  const res3 = validateStepAnswer("18.0", "16.5", 0.03); // >9% diff
  assert.strictEqual(res3.valid, false);
});

it("validateStepAnswer correctly handles scientific notation", () => {
  const res1 = validateStepAnswer("6.0e-11", "6.00e-11", 0.02);
  assert.strictEqual(res1.valid, true);

  const res2 = validateStepAnswer("6.00 * 10^-11", "6.00e-11", 0.02);
  assert.strictEqual(res2.valid, true);
});

it("validateStepAnswer handles percentage values", () => {
  const res = validateStepAnswer("1.64%", "1.64%", 0.05);
  assert.strictEqual(res.valid, true);

  const resNum = validateStepAnswer("1.64", "1.64%", 0.05);
  assert.strictEqual(resNum.valid, true);
});

it("validateStepAnswer rejects empty or missing input gracefully", () => {
  const res = validateStepAnswer("", "10");
  assert.strictEqual(res.valid, false);
  assert(res.message.length > 0);
});

// -----------------------------------------------------------------------------
// Test Group 2: parseOrGenerateSolverSteps Unit Tests
// -----------------------------------------------------------------------------
import { getLessonComprehensiveTheory } from "../data/lesson-theory-database.js";

it("parseOrGenerateSolverSteps returns explicit solverSteps when defined in database", () => {
  const theoryChem1 = getLessonComprehensiveTheory("CHEM-M01", 1);
  assert(theoryChem1.workedExample.solverSteps, "CHEM-M01 should have explicit solverSteps");
  const steps = parseOrGenerateSolverSteps(theoryChem1.workedExample);
  assert.strictEqual(steps.length, 4);
  assert.strictEqual(steps[0].expected, "16.5");
  assert.strictEqual(steps[1].expected, "9.00");
  assert.strictEqual(steps[2].expected, "66.2");
  assert.strictEqual(steps[3].expected, "1.64");
});

it("parseOrGenerateSolverSteps parses CHEM-M02 enthalpy steps accurately", () => {
  const theoryChem2 = getLessonComprehensiveTheory("CHEM-M02", 1);
  assert(theoryChem2.workedExample.solverSteps, "CHEM-M02 should have explicit solverSteps");
  const steps = parseOrGenerateSolverSteps(theoryChem2.workedExample);
  assert.strictEqual(steps.length, 4);
  assert.strictEqual(steps[0].unit, "J");
  assert.strictEqual(steps[3].unit, "kJ");
});

it("parseOrGenerateSolverSteps auto-derives solver steps from raw steps if solverSteps omitted", () => {
  const dummyExample = {
    problem: "Calculate the pressure when compressed.",
    given: "V1 = 4.5 L, P1 = 1.2 atm, V2 = 2.0 L",
    steps: [
      "1. Apply Boyle's law: P1 V1 = P2 V2.",
      "2. Isolate pressure: P2 = (1.2 * 4.5) / 2.0 = 2.70 atm."
    ],
    answer: "P2 = 2.70 atm"
  };
  const steps = parseOrGenerateSolverSteps(dummyExample);
  assert.strictEqual(steps.length, 2);
  assert.strictEqual(steps[0].stepNumber, 1);
  assert.strictEqual(steps[1].stepNumber, 2);
  assert(steps[1].expected === "2.70" || steps[1].expected.includes("2.70"));
});

// -----------------------------------------------------------------------------
// Test Group 3: renderWorkedExampleHTML Unit Tests
// -----------------------------------------------------------------------------
it("renderWorkedExampleHTML generates dual mode reference and solver markup", () => {
  const theoryPhys1 = getLessonComprehensiveTheory("PHYS-M01", 1);
  const html = renderWorkedExampleHTML(theoryPhys1.workedExample, true, "reference");

  assert(html.includes('id="worked-example-root"'), "Must contain root container with id");
  assert(html.includes('data-target-mode="reference"'), "Must contain Reference Solution toggle");
  assert(html.includes('data-target-mode="solver"'), "Must contain Interactive Solver toggle");
  assert(html.includes('class="we-view-reference"'), "Must contain reference view container");
  assert(html.includes('class="we-view-solver"'), "Must contain solver view container");
  assert(html.includes('id="we-progress-count"'), "Must contain step progress count");
  assert(html.includes('id="we-completion-card"'), "Must contain completion banner");
});

// -----------------------------------------------------------------------------
// Test Group 4: Offline Diagnostics & Storage Quota Verification
// -----------------------------------------------------------------------------
import { getStorageEstimate, getCacheStatistics } from "../components/offline-diagnostics.js";

it("getStorageEstimate returns fallback structure when navigator.storage is simulated/headless", async () => {
  const est = await getStorageEstimate();
  assert(typeof est === "object", "Must return object");
  assert("supported" in est, "Must have supported property");
});

it("getCacheStatistics returns supported cache stats", async () => {
  const stats = await getCacheStatistics();
  assert(typeof stats === "object", "Must return object");
  assert("supported" in stats, "Must have supported property");
});

// -----------------------------------------------------------------------------
// Test Group 5: Integration & File Wiring Verification
// -----------------------------------------------------------------------------
it("module-viewer.js imports and renders worked-example-solver", () => {
  const mvContent = fs.readFileSync(path.join(rootDir, "components", "module-viewer.js"), "utf8");
  assert(mvContent.includes('from "./worked-example-solver.js"'), "module-viewer.js must import worked-example-solver");
  assert(mvContent.includes('renderWorkedExampleHTML'), "module-viewer.js must render renderWorkedExampleHTML");
  assert(mvContent.includes('initWorkedExampleListeners'), "module-viewer.js must bind initWorkedExampleListeners");
});

it("smartboard-toolbar.js includes offline diagnostics button (#sb-tool-offline) and hotkey O", () => {
  const sbContent = fs.readFileSync(path.join(rootDir, "components", "smartboard-toolbar.js"), "utf8");
  assert(sbContent.includes('id="sb-tool-offline"'), "smartboard-toolbar must contain sb-tool-offline button");
  assert(sbContent.includes('openOfflineDiagnosticsModal'), "smartboard-toolbar must call openOfflineDiagnosticsModal");
  assert(sbContent.includes('e.key === "o" || e.key === "O"'), "smartboard-toolbar must support hotkey O");
});

it("app.js exposes window.openOfflineDiagnosticsModal for smartboard toolbar and global shortcuts", () => {
  const appContent = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");
  assert(appContent.includes('window.openOfflineDiagnosticsModal'), "app.js must expose window.openOfflineDiagnosticsModal");
});

it("service-worker.js precaches worked-example-solver.js and offline-diagnostics.js", () => {
  const swContent = fs.readFileSync(path.join(rootDir, "service-worker.js"), "utf8");
  assert(swContent.includes('"./components/worked-example-solver.js"'), "service-worker.js must cache worked-example-solver.js");
  assert(swContent.includes('"./components/offline-diagnostics.js"'), "service-worker.js must cache offline-diagnostics.js");
});

console.log("\n========================================================");
console.log(`📊 Option 2 & 3 Tests: ${passed} Passed, ${failed} Failed`);
console.log("========================================================\n");

if (failed > 0) {
  process.exit(1);
}
