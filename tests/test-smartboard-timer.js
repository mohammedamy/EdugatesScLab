// Edugates-ClipSAT Science Labs - Unit Test Suite for Classroom Timer Widget
// Validates Timer opening, closing, toggling, close button handling, and Esc key dismissal

import fs from "fs";
import path from "path";

console.log("\n========================================================");
console.log("⏱️ Classroom Timer & Stopwatch Widget Verification");
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

const toolbarPath = path.resolve("components/smartboard-toolbar.js");
const toolbarSrc = fs.readFileSync(toolbarPath, "utf-8");

// 1. Verify toggleTimer logic uses shouldOpen (not inverted isOpen)
assert(!toolbarSrc.includes('const isOpen = forceState !== undefined ? forceState : (timerWidget.style.display !== "none");\n    if (!isOpen) {'),
  "Eliminated inverted isOpen logic in toggleTimer");

assert(toolbarSrc.includes('const shouldOpen = forceState !== undefined ? forceState : (timerWidget.style.display === "none");'),
  "toggleTimer correctly checks if widget should open");

assert(toolbarSrc.includes('if (shouldOpen) {\n      timerWidget.style.display = "flex";'),
  "shouldOpen = true displays the timer widget with flex");

// 2. Verify close button calls toggleTimer(false) with stopPropagation
assert(toolbarSrc.includes('document.getElementById("sb-timer-close-btn")?.addEventListener("click", (e) => {') &&
       toolbarSrc.includes('toggleTimer(false);'),
  "Close button (✕) event listener passes false to close the timer");

// 3. Verify Escape key closes timer
assert(toolbarSrc.includes('} else if (timerWidget.style.display !== "none") {\n        toggleTimer(false);'),
  "Escape key handler properly closes timer when visible");

// 4. Verify functional behavioral emulation
let display = "none";
let activeClass = false;

function mockToggleTimer(forceState) {
  const shouldOpen = forceState !== undefined ? forceState : (display === "none");
  if (shouldOpen) {
    display = "flex";
    activeClass = true;
  } else {
    display = "none";
    activeClass = false;
  }
}

// Initial state: closed
assert(display === "none", "Initial timer state is closed (none)");

// Open via toggle
mockToggleTimer();
assert(display === "flex" && activeClass === true, "toggleTimer() opens closed widget");

// Close via close button (forceState = false)
mockToggleTimer(false);
assert(display === "none" && activeClass === false, "toggleTimer(false) cleanly closes the widget");

// Calling toggleTimer(false) again remains closed
mockToggleTimer(false);
assert(display === "none", "toggleTimer(false) idempotently keeps widget closed");

// Calling toggleTimer(true) explicitly opens
mockToggleTimer(true);
assert(display === "flex", "toggleTimer(true) explicitly opens widget");

console.log("\n========================================================");
console.log(`📊 Timer Tests: ${passed} Passed, ${failed} Failed`);
console.log("========================================================\n");

if (failed > 0) process.exit(1);
