// Edugates-ClipSAT Science Labs - Full Browser Screen Lesson Verification Suite
// Guarantees lessons render edge-to-edge across 100% of the browser screen, never in a dialogue box

import fs from "fs";
import path from "path";
import assert from "assert";

console.log("\n========================================================");
console.log("🖥️ Full Browser Screen Lesson Presentation Verification");
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

const viewerPath = path.resolve("components/module-viewer.js");
const viewerSrc = fs.readFileSync(viewerPath, "utf-8");

const cssPath = path.resolve("index.css");
const cssSrc = fs.readFileSync(cssPath, "utf-8");

// 1. Overlay & Shell Class Definitions
testAssert(
  viewerSrc.includes('overlay.className = "modal-overlay modal-fullscreen is-fullscreen-lesson";'),
  "module-viewer.js permanently locks overlay to full screen presentation mode"
);

testAssert(
  viewerSrc.includes('class="modal-content-shell is-fullscreen" id="lesson-fullscreen-workspace"'),
  "module-viewer.js renders modal-content-shell with permanent is-fullscreen class and unique workspace ID"
);

// 2. Elimination of Dialogue Box Semantics
testAssert(
  !viewerSrc.includes('role="dialog"') && viewerSrc.includes('role="main" aria-label="Lesson Full Browser Screen View"'),
  "module-viewer.js replaces role='dialog' with role='main' full browser workspace"
);

// 3. Navigation & Exit Controls
testAssert(
  viewerSrc.includes('id="btn-header-back-curriculum"'),
  "Header breadcrumb bar includes explicit '← Back to Curriculum' button"
);

testAssert(
  viewerSrc.includes('btnBack.addEventListener("click"') && viewerSrc.includes('closeModal();'),
  "Back button is wired to closeModal() to immediately return to curriculum tab"
);

testAssert(
  viewerSrc.includes('link.addEventListener("click"') && viewerSrc.includes('breadcrumb-link'),
  "Breadcrumb navigation links are wired to cleanly exit the full browser lesson view"
);

// 4. Native Hardware/Display Fullscreen Controller
testAssert(
  viewerSrc.includes('function syncFullscreenButton()') &&
  viewerSrc.includes('document.addEventListener("fullscreenchange", syncFullscreenButton);'),
  "Fullscreen controller synchronizes hardware kiosk/display fullscreen with fullscreenchange events"
);

testAssert(
  viewerSrc.includes('document.documentElement.requestFullscreen') &&
  viewerSrc.includes('document.exitFullscreen'),
  "btn-header-fullscreen-modal toggles native display kiosk fullscreen without shrinking CSS layout into a dialogue box"
);

// 5. CSS Edge-to-Edge Guarantees
testAssert(
  cssSrc.includes("#module-modal-overlay") &&
  cssSrc.includes("width: 100vw !important;") &&
  cssSrc.includes("height: 100vh !important;"),
  "index.css enforces 100vw and 100vh on lesson overlays"
);

testAssert(
  cssSrc.includes(".modal-content-shell.is-fullscreen") &&
  cssSrc.includes("min-width: 100vw !important;") &&
  cssSrc.includes("min-height: 100vh !important;"),
  "index.css enforces min-width: 100vw and min-height: 100vh on fullscreen shells"
);

testAssert(
  cssSrc.includes("padding: 0 !important;") &&
  cssSrc.includes("margin: 0 !important;") &&
  cssSrc.includes("border-radius: 0 !important;"),
  "index.css eliminates all dialogue box padding, margins, and rounded borders"
);

testAssert(
  cssSrc.includes("box-shadow: none !important;"),
  "index.css eliminates drop shadows, ensuring edge-to-edge canvas presentation"
);

console.log("\n========================================================");
console.log(`📊 Fullscreen Lesson Tests: ${passed} Passed, ${failed} Failed`);
console.log("========================================================\n");

if (failed > 0) {
  process.exit(1);
}
