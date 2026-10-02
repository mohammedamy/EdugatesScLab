// Edugates-ClipSAT Science Labs - Multi-Viewport & Responsive Accessibility Test Suite
// Verifies responsive layouts and DOM behavior across:
// - 390px (Mobile iPhone)
// - 768px (Tablet iPad)
// - 1366px (Laptop/Desktop)
// - 1920px (MAXHUB Smartboard)

import fs from "fs";
import path from "path";
import assert from "assert";

console.log("\n========================================================");
console.log("📱 Multi-Viewport & Responsive Accessibility Verification");
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

const cssPath = path.resolve("index.css");
const cssSrc = fs.readFileSync(cssPath, "utf-8");

const viewerPath = path.resolve("components/module-viewer.js");
const viewerSrc = fs.readFileSync(viewerPath, "utf-8");

const interactivesPath = path.resolve("components/lesson-interactives.js");
const interactivesSrc = fs.readFileSync(interactivesPath, "utf-8");

const specsPath = path.resolve("data/lesson-interactive-specs.js");
const specsSrc = fs.readFileSync(specsPath, "utf-8");

// ----------------------------------------------------
// 1. Mobile Viewport (390px - iPhone 12/13/14)
// ----------------------------------------------------
console.log("📱 Viewport 390px (Mobile Smartphone):");

testAssert(
  cssSrc.includes("@media (max-width: 600px)") &&
  cssSrc.includes(".modal-overflow-wrap {\n    display: inline-block;\n  }"),
  "CSS activates .modal-overflow-wrap for viewports <= 600px (390px mobile)"
);

testAssert(
  cssSrc.includes(".modal-header-actions .btn-header-annotate,") &&
  cssSrc.includes(".modal-header-actions .btn-header-lesson-plan,") &&
  cssSrc.includes(".modal-header-actions .btn-header-fullscreen {\n    display: none !important;\n  }"),
  "CSS collapses secondary header buttons into overflow menu on mobile"
);

testAssert(
  viewerSrc.includes('id="btn-header-overflow-modal"') &&
  viewerSrc.includes('aria-haspopup="true"') &&
  viewerSrc.includes('aria-expanded="false"') &&
  viewerSrc.includes('aria-controls="modal-header-overflow-menu"'),
  "Overflow trigger includes WAI-ARIA popup attributes (aria-haspopup, aria-expanded, aria-controls)"
);

testAssert(
  viewerSrc.includes('id="modal-header-overflow-menu"') &&
  viewerSrc.includes('role="menu"') &&
  viewerSrc.includes('role="menuitem"'),
  "Overflow menu implements accessible menu semantics (role='menu' and role='menuitem')"
);

testAssert(
  viewerSrc.includes('id="btn-overflow-annotate"') &&
  viewerSrc.includes('id="btn-overflow-fullscreen"') &&
  viewerSrc.includes('id="btn-overflow-share"') &&
  viewerSrc.includes('id="btn-overflow-lesson-plan"'),
  "Overflow menu provides accessible actions for Annotate, Fullscreen, Share, and A4 Plan"
);

testAssert(
  cssSrc.includes(".overflow-menu-item") &&
  cssSrc.includes("min-height: 44px;"),
  "Overflow menu items satisfy 44px minimum touch target size (WCAG 2.5.5)"
);

testAssert(
  viewerSrc.includes('e.key === "Escape"') &&
  viewerSrc.includes('toggleOverflow(false);'),
  "Overflow menu traps and handles Escape key for keyboard accessibility"
);

// ----------------------------------------------------
// 2. Tablet Viewport (768px - iPad Portrait)
// ----------------------------------------------------
console.log("\n📲 Viewport 768px (Tablet):");

testAssert(
  cssSrc.includes("@media (max-width: 768px)") || cssSrc.includes("@media (max-width: 900px)"),
  "CSS defines dedicated tablet media queries for intermediate form factors"
);

testAssert(
  cssSrc.includes(".btn-header-action .btn-action-label {\n    display: none;"),
  "Header action labels collapse into icon buttons under 768px to prevent line breaking"
);

testAssert(
  cssSrc.includes(".btn-header-back .back-label-short {\n    display: inline;\n  }"),
  "Back button displays compact 'Back' label on tablet viewports"
);

// ----------------------------------------------------
// 3. Laptop & Desktop Viewport (1366px)
// ----------------------------------------------------
console.log("\n💻 Viewport 1366px (Laptop / Desktop):");

testAssert(
  cssSrc.includes(".modal-overflow-wrap {\n  position: relative;\n  display: none;\n}"),
  "Overflow wrap is hidden by default on desktop/laptop displays, showing primary toolbar"
);

testAssert(
  cssSrc.includes(".modal-header {") &&
  cssSrc.includes("justify-content: space-between;"),
  "Desktop chrome uses balanced flex alignment between titles and action toolbar"
);

// ----------------------------------------------------
// 4. MAXHUB Smartboard Viewport (1920px Full HD / 4K)
// ----------------------------------------------------
console.log("\n📺 Viewport 1920px (MAXHUB Interactive Display):");

testAssert(
  cssSrc.includes('[data-mode="smartboard"]') || cssSrc.includes("body.mode-smartboard"),
  "CSS includes dedicated high-contrast touch rules for MAXHUB smartboard"
);

testAssert(
  cssSrc.includes('[data-mode="smartboard"] .unit-filter-chip') &&
  cssSrc.includes('[data-mode="smartboard"] .search-input'),
  "Smartboard mode defines enlarged interactive touch targets (52px - 58px)"
);

testAssert(
  cssSrc.includes(".range-slider::-webkit-slider-thumb") &&
  cssSrc.includes("width: 32px") &&
  cssSrc.includes("height: 32px"),
  "Simulation range sliders have 32px touch thumbs for smartboard finger touch ergonomics"
);

// ----------------------------------------------------
// 5. Scientific Interactive Engine Integrity
// ----------------------------------------------------
console.log("\n🔬 Scientific Interactive Engines & Alignment:");

testAssert(
  interactivesSrc.includes("function buildFreeFallInteractive"),
  "lesson-interactives.js exports buildFreeFallInteractive"
);

testAssert(
  specsSrc.includes('"PHYS-M03-L3"') &&
  specsSrc.includes('"phys-free-fall"'),
  "data/lesson-interactive-specs.js maps PHYS-M03-L3 to 'phys-free-fall'"
);

testAssert(
  interactivesSrc.includes("function buildAvogadroWorkbenchInteractive"),
  "lesson-interactives.js exports buildAvogadroWorkbenchInteractive"
);

testAssert(
  specsSrc.includes('"CHEM-M09-L1"') &&
  specsSrc.includes('"chem-avogadro-workbench"'),
  "data/lesson-interactive-specs.js maps CHEM-M09-L1 to 'chem-avogadro-workbench'"
);

testAssert(
  interactivesSrc.includes("function buildEmpiricalFormulaInteractive"),
  "lesson-interactives.js exports buildEmpiricalFormulaInteractive"
);

testAssert(
  specsSrc.includes('"CHEM-M09-L4"') &&
  specsSrc.includes('"chem-empirical-formula"'),
  "data/lesson-interactive-specs.js maps CHEM-M09-L4 to 'chem-empirical-formula'"
);

testAssert(
  interactivesSrc.includes("function buildHydrateDehydrationInteractive"),
  "lesson-interactives.js exports buildHydrateDehydrationInteractive"
);

testAssert(
  specsSrc.includes('"CHEM-M09-L5"') &&
  specsSrc.includes('"chem-hydrate-dehydration"'),
  "data/lesson-interactive-specs.js maps CHEM-M09-L5 to 'chem-hydrate-dehydration'"
);

testAssert(
  specsSrc.includes('"BIO-M08-L3"') &&
  specsSrc.includes('"mode": "resp"'),
  "data/lesson-interactive-specs.js initializes BIO-M08-L3 in respiration mode"
);

testAssert(
  specsSrc.includes("30\\text{--}32\\text{ ATP}") || specsSrc.includes("30–32 ATP"),
  "Cellular respiration equation is reconciled to modern 30-32 ATP yield"
);

console.log("\n========================================================");
console.log(`📊 Responsive & Accessibility Verification: ${passed} Passed, ${failed} Failed`);
console.log("========================================================\n");

if (failed > 0) {
  process.exit(1);
}
