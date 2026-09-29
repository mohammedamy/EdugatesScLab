// Edugates-ClipSAT Science Labs - Unit Test Suite for OMR Bubble Sheet Formatting

import fs from "fs";
import path from "path";

console.log("\n========================================================");
console.log("📝 OMR Scantron Bubble Sheet Verification");
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

// Read quiz-engine.js source
const quizEnginePath = path.resolve("components/quiz-engine.js");
const quizEngineSrc = fs.readFileSync(quizEnginePath, "utf-8");

// Extract the renderBubbleSheetHtml function logic
// We can test the exact string template and logic
assert(!quizEngineSrc.includes('justify-content: space-between; margin-bottom: 7px; font-family: var(--font-mono); font-size: 0.85rem;'), 
  "Eliminated space-between from .omr-q-row (no wide void between number and bubbles)");

assert(quizEngineSrc.includes('justify-content: flex-start; gap: 5px;'), 
  "omr-q-row uses flex-start with a narrow 5px gap next to question number");

assert(quizEngineSrc.includes('class="omr-q-num"'), 
  "omr-q-num class added for consistent alignment of question numbers");

assert(quizEngineSrc.includes('class="omr-bubbles-group"'), 
  "omr-bubbles-group class groups option bubbles immediately next to question number");

// Verify column balancing logic
assert(quizEngineSrc.includes('const numCols = questions.length <= 15 ? 1 : (questions.length <= 30 ? 2 : (questions.length <= 60 ? 3 : 4));'),
  "Columns are balanced dynamically based on total question count");

// Verify CSS definitions in index.css
const indexCssPath = path.resolve("index.css");
const indexCssSrc = fs.readFileSync(indexCssPath, "utf-8");

assert(indexCssSrc.includes('.omr-q-row {') && indexCssSrc.includes('justify-content: flex-start'),
  "index.css defines .omr-q-row with justify-content: flex-start");

assert(indexCssSrc.includes('.omr-bubbles-group {') && indexCssSrc.includes('display: flex'),
  "index.css defines .omr-bubbles-group");

assert(indexCssSrc.includes('.omr-sections-grid {') && indexCssSrc.includes('justify-content: center'),
  "index.css centers section columns cleanly");

console.log("\n========================================================");
console.log(`📊 Bubble Sheet Tests: ${passed} Passed, ${failed} Failed`);
console.log("========================================================\n");

if (failed > 0) process.exit(1);
