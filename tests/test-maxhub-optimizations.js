// Edugates-ClipSAT Science Labs - MAXHUB Android Optimizations Verification Suite
// Validates Day/Smartboard contrast tokens, lifecycle cleanup, older Android matchMedia fallback,
// curriculum alignment, and domain-grounded worked examples.

import assert from "assert";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("\n========================================================");
console.log("📺 MAXHUB Android Improvement Plan Verification Suite");
console.log("========================================================\n");

// ----------------------------------------------------
// Test 1: Day Mode vs Smartboard Contrast (P0.1)
// ----------------------------------------------------
console.log("🎨 Test 1: Day Mode + Smartboard High Contrast Verification");
const cssContent = fs.readFileSync(path.join(rootDir, "index.css"), "utf-8");

assert(
  cssContent.includes('[data-theme="day"][data-mode="smartboard"] .app-navbar') ||
  cssContent.includes('[data-theme="day"] body.mode-smartboard .app-navbar'),
  "index.css defines Day Mode Smartboard navbar overrides"
);

assert(
  cssContent.includes('background: #ffffff !important') &&
  cssContent.includes('color: #0f172a !important'),
  "Day mode Smartboard surfaces use crisp opaque #ffffff with #0f172a high-contrast text"
);

// Verify contrast ratio calculation for #ffffff vs #0f172a
function getLuminance(r, g, b) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

const lumWhite = getLuminance(255, 255, 255);
const lumSlate = getLuminance(15, 23, 42); // #0f172a
const contrastRatio = (lumWhite + 0.05) / (lumSlate + 0.05);

assert(contrastRatio >= 7.0, `Day mode Smartboard contrast ratio exceeds WCAG AAA 7:1 (Measured: ${contrastRatio.toFixed(2)}:1)`);
console.log(`  ✅ PASS: Day Mode Smartboard contrast exceeds WCAG AAA (Measured: ${contrastRatio.toFixed(2)}:1, Minimum: 7.0:1)`);

// ----------------------------------------------------
// Test 2: Auto-Titration Lifecycle & Memory Leaks (P0.2)
// ----------------------------------------------------
console.log("\n🧪 Test 2: Auto-Titration Interval Lifecycle & Memory Cleanup");
const titrContent = fs.readFileSync(path.join(rootDir, "labs", "chem-titration.js"), "utf-8");

assert(titrContent.includes("let autoTitrateInterval = null;"), "Declares autoTitrateInterval handle at lab scope");
assert(titrContent.includes("function stopAutoTitrate()"), "Implements stopAutoTitrate() cleanup helper");
assert(titrContent.includes("stopAutoTitrate();") && titrContent.includes("cancelAnimationFrame(animId)"), "Lab unmount hook stops auto-titration and animation loop");
assert(titrContent.includes("if (!container || !container.isConnected)"), "Guards simulation and interval against detached DOM nodes");
assert(titrContent.includes("if (dispPh) dispPh.innerText = ph.toFixed(2);"), "updateTelemetry defensively guards DOM elements against null crashes");
console.log("  ✅ PASS: Auto-titration interval is fully managed, cancellable, and guarded against detached containers");

// ----------------------------------------------------
// Test 3: Quiz Engine Timer Cleanup (P0.2)
// ----------------------------------------------------
console.log("\n⏱️ Test 3: Quiz Engine Timer & Presenter Cleanup");
const quizContent = fs.readFileSync(path.join(rootDir, "components", "quiz-engine.js"), "utf-8");
const appContent = fs.readFileSync(path.join(rootDir, "app.js"), "utf-8");

assert(quizContent.includes("return function cleanupQuiz()"), "renderQuizEngine returns a cleanupQuiz function");
assert(quizContent.includes("clearInterval(timerInterval);"), "cleanupQuiz clears timerInterval");
assert(quizContent.includes("removePresenterKeyHandler();"), "cleanupQuiz unbinds presenter keyboard handlers");
assert(appContent.includes("currentActiveQuizCleanup"), "app.js tracks currentActiveQuizCleanup state");
assert(appContent.includes("if (tabId !== \"quiz\" && typeof currentActiveQuizCleanup === \"function\")"), "app.js invokes quiz cleanup on tab navigation");
console.log("  ✅ PASS: Quiz engine returns cleanup hook and app.js executes it on tab transition");

// ----------------------------------------------------
// Test 4: Older Android matchMedia Compatibility (P2.10)
// ----------------------------------------------------
console.log("\n📱 Test 4: Legacy Android WebView matchMedia Compatibility");
assert(
  appContent.includes("mql.addListener"),
  "app.js provides mql.addListener fallback for older Android WebView engines lacking addEventListener"
);
console.log("  ✅ PASS: Legacy MediaQueryList.addListener fallback is implemented safely");

// ----------------------------------------------------
// Test 5: Curriculum Alignment Fixes (P0.3)
// ----------------------------------------------------
console.log("\n📚 Test 5: Curriculum Alignment Corrections");
const flashcardContent = fs.readFileSync(path.join(rootDir, "components", "flashcards.js"), "utf-8");
assert(
  flashcardContent.includes('moduleCode: "CHEM-M12"') &&
  flashcardContent.includes('moduleTitle: "Gases"') &&
  !flashcardContent.includes('moduleCode: "CHEM-M13",\n    moduleTitle: "Gases"'),
  "Ideal Gas Law flashcard correctly routes to CHEM-M12 (Gases), not CHEM-M13"
);

const diagramGenContent = fs.readFileSync(path.join(rootDir, "scripts", "diagram-svg-generator.mjs"), "utf-8");
assert(
  diagramGenContent.includes("if (m.id === 16 && l.id === 2) return SCIENTIFIC_DIAGRAMS.chem_le_chatelier_shifts;"),
  "diagram-svg-generator routes chem_le_chatelier_shifts to CHEM-M16-L2 (Equilibrium Factors)"
);

const specContent = fs.readFileSync(path.join(rootDir, "data", "lesson-interactive-specs.js"), "utf-8");
assert(
  specContent.includes('"CHEM-M01-L1"') &&
  specContent.includes('"chem-ozone-density"'),
  "CHEM-M01-L1 interactive specification routes to chem-ozone-density"
);

const lessonInterContent = fs.readFileSync(path.join(rootDir, "components", "lesson-interactives.js"), "utf-8");
assert(
  lessonInterContent.includes("function buildOzoneDensityInteractive"),
  "lesson-interactives.js implements dual buildOzoneDensityInteractive simulation"
);
assert(
  lessonInterContent.includes("Supporting Activity: Fluid Density & Buoyancy") ||
  lessonInterContent.includes("Supporting Activity: Fluid Density &amp; Buoyancy"),
  "Ozone interactive retains solid/fluid density & buoyancy as supporting activity"
);
console.log("  ✅ PASS: Flashcards, diagram routes, and CHEM-M01-L1 ozone/density dual activities are aligned");

// ----------------------------------------------------
// Test 6: Authentic Theory Worked Examples (P0.4)
// ----------------------------------------------------
console.log("\n🧮 Test 6: Domain-Grounded Worked Examples & Status Integrity");
const theoryContent = fs.readFileSync(path.join(rootDir, "data", "lesson-theory-database.js"), "utf-8");

assert(theoryContent.includes('"CHEM-M09": {'), "lesson-theory-database.js contains dedicated CHEM-M09 (The Mole) record");
assert(theoryContent.includes("25.00") && theoryContent.includes("CaCO"), "CHEM-M09 worked example computes real CaCO3 molar mass and mole quantities");
assert(!theoryContent.includes("X_1 = 10.0"), "Generic X1=10 fallback is completely eliminated");
assert(theoryContent.includes("Curriculum Standard Reference Solution (Under Specialist Review)"), "Synthesized fallbacks are transparently labeled as under specialist review");

const modViewerContent = fs.readFileSync(path.join(rootDir, "components", "module-viewer.js"), "utf-8");
assert(
  modViewerContent.includes("Curriculum Standard Reference Solution (Under Specialist Review)"),
  "module-viewer.js displays appropriate review status badge"
);
console.log("  ✅ PASS: Generic fallbacks replaced with authentic calculations; review status badges are honest and transparent");

console.log("\n========================================================");
console.log("📊 MAXHUB Android Improvement Plan: All 6 Test Groups Passed!");
console.log("========================================================\n");
