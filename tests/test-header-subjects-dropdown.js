// Edugates-ClipSAT Science Labs - Header Subjects Dropdown Navigation Test Suite
// Verifies that curriculum subjects are collected into a modern, accessible dropdown menu in the header.

import fs from "fs";
import path from "path";

console.log("\n========================================================");
console.log("📚 Header Subjects Dropdown Navigation Verification");
console.log("========================================================\n");

let passed = 0;
let failed = 0;

function testAssert(cond, desc) {
  if (cond) {
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${desc}`);
    failed++;
  }
}

const rootDir = process.cwd();
const appSource = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");
const cssSource = fs.readFileSync(path.join(rootDir, "index.css"), "utf8");
const iconsSource = fs.readFileSync(path.join(rootDir, "assets", "icons.js"), "utf8");

// 1. Data exports and structure
console.log("📦 Data Constants & Module Exports:");
testAssert(
  appSource.includes("export const CURRICULUM_SUBJECT_IDS = [\"chem\", \"bio\", \"phys\"];"),
  "app.js defines and exports CURRICULUM_SUBJECT_IDS (chem, bio, phys)"
);

testAssert(
  appSource.includes("export const CURRICULUM_SUBJECTS =") &&
  appSource.includes("export const TOOL_TABS ="),
  "app.js exports CURRICULUM_SUBJECTS and TOOL_TABS subsets"
);

testAssert(
  iconsSource.includes("book:") && iconsSource.includes("<svg"),
  "assets/icons.js provides scalable SVG book icon"
);

// 2. DOM Rendering in renderAppShell
console.log("\n🖥️ Header Shell DOM Rendering:");
testAssert(
  appSource.includes('class="nav-subjects-dropdown"') &&
  appSource.includes('id="nav-subjects-dropdown"'),
  "app.js renders #nav-subjects-dropdown container within navbar"
);

testAssert(
  appSource.includes('id="nav-subjects-dropdown-btn"') &&
  appSource.includes('aria-haspopup="true"') &&
  appSource.includes('aria-expanded="false"') &&
  appSource.includes('aria-controls="nav-subjects-menu"'),
  "Subjects dropdown button includes WAI-ARIA popup attributes (aria-haspopup, aria-expanded, aria-controls)"
);

testAssert(
  appSource.includes('id="nav-subjects-btn-icon"') &&
  appSource.includes('id="nav-subjects-btn-text"') &&
  appSource.includes('id="nav-subjects-btn-chevron"'),
  "Subjects dropdown trigger includes icon, text with separator, and chevron indicator"
);

testAssert(
  appSource.includes('class="nav-subjects-menu nav-dropdown-menu"') &&
  appSource.includes('id="nav-subjects-menu"') &&
  appSource.includes('role="menu"'),
  "Subjects menu flyout uses semantic role='menu' and shared nav-dropdown-menu class"
);

testAssert(
  appSource.includes("CURRICULUM_SUBJECTS.map(sub =>") &&
  appSource.includes("TOOL_TABS.map(sub =>"),
  "app.js maps both CURRICULUM_SUBJECTS and TOOL_TABS (labs, quiz, flashcards)"
);

testAssert(
  appSource.includes('id="nav-subjects-menu"') &&
  appSource.includes("Interactive STEM Tools") &&
  appSource.includes("Curriculum Subjects"),
  "app.js includes flash cards, virtual labs, and quizzes inside the subjects dropdown menu flyout"
);

testAssert(
  !appSource.includes('<!-- Sibling Interactive Tool Tabs'),
  "app.js eliminated standalone tool tabs from header navbar so only the dropdown menu remains"
);

// 3. Dropdown Interaction & Event Logic
console.log("\n🔄 Dropdown Lifecycle & Event Handlers:");
testAssert(
  appSource.includes("export function toggleSubjectsDropdown(") &&
  appSource.includes("export function closeSubjectsDropdown("),
  "app.js exports toggleSubjectsDropdown and closeSubjectsDropdown functions"
);

testAssert(
  appSource.includes("subjectsTrigger.addEventListener(\"click\"") &&
  appSource.includes("toggleSubjectsDropdown();"),
  "app.js binds click handler to desktop subjects dropdown button"
);

testAssert(
  appSource.includes('e.key === "ArrowDown" || e.key === "Enter" || e.key === " "') &&
  appSource.includes("toggleSubjectsDropdown(true);"),
  "app.js binds keyboard navigation (ArrowDown, Enter, Space) to open subjects dropdown"
);

testAssert(
  appSource.includes("closeSubjectsDropdown();") &&
  appSource.includes("closeSubjectDropdown();"),
  "app.js ensures light dismiss and tab switching closes both desktop and mobile dropdowns"
);

// 4. CSS Styling & High-Contrast Day/Night Support
console.log("\n🎨 CSS Styles & Responsive Rules:");
testAssert(
  cssSource.includes(".nav-subjects-dropdown {") &&
  cssSource.includes("position: relative;"),
  "index.css styles .nav-subjects-dropdown container"
);

testAssert(
  cssSource.includes(".nav-subjects-dropdown-btn {") &&
  cssSource.includes(".nav-subjects-dropdown-btn .tab-pill-chevron"),
  "index.css styles .nav-subjects-dropdown-btn and chevron animation"
);

testAssert(
  cssSource.includes(".nav-subjects-dropdown.open .nav-subjects-dropdown-btn .tab-pill-chevron {\n  transform: rotate(180deg);"),
  "index.css rotates chevron 180 degrees when subjects dropdown is open"
);

testAssert(
  cssSource.includes(".nav-subjects-dropdown.open .nav-subjects-menu {\n  opacity: 1;"),
  "index.css animates .nav-subjects-menu visibility on open"
);

testAssert(
  cssSource.includes("@media (min-width: 960px) and (max-width: 1180px)") &&
  cssSource.includes(".nav-subjects-dropdown-btn .subjects-label"),
  "index.css provides compact responsive rule for intermediate desktop viewports (960px - 1180px)"
);

testAssert(
  cssSource.includes("[data-theme=\"day\"] .nav-subjects-dropdown.open .nav-subjects-dropdown-btn:not(.active)"),
  "index.css supports Day theme styling for subjects dropdown trigger"
);

console.log("\n========================================================");
console.log(`📊 Header Subjects Dropdown Tests: ${passed} Passed, ${failed} Failed`);
console.log("========================================================\n");

if (failed > 0) {
  process.exit(1);
}
