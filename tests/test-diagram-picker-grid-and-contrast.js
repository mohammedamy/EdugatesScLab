
import assert from "node:assert";
import fs from "node:fs";

console.log("\n========================================================");
console.log("📐 Diagrams Bank Layout, Sizing & Contrast Test Suite");
console.log("========================================================");

// 1. Check index.css rules
const css = fs.readFileSync("./index.css", "utf8");

assert(css.includes(".diag-picker-grid"), "index.css must include .diag-picker-grid");
assert(css.includes("grid-auto-rows: minmax(320px, auto)"), "grid-auto-rows must be minmax(320px, auto)");
assert(css.includes("align-content: start"), "align-content must be start");
assert(css.includes("min-height: 320px"), "card min-height must be 320px");
assert(css.includes(".diag-picker-preview-box"), "index.css must include .diag-picker-preview-box");
assert(css.includes(".cq-textarea"), "index.css must include .cq-textarea");
assert(css.includes(".cq-input"), "index.css must include .cq-input");
assert(css.includes(".cq-attached-thumb"), "index.css must include .cq-attached-thumb");
assert(css.includes("[data-theme=\"day\"] .cq-textarea"), "Day mode must style .cq-textarea");
assert(css.includes("[data-theme=\"day\"] .diag-picker-card"), "Day mode must style .diag-picker-card");

console.log("  ✅ PASS: CSS rules for grid layout, min-height (320px), preview box, and day theme contrast verified");

// 2. Check quiz-engine.js modal and thumbnail logic
const quizJs = fs.readFileSync("./components/quiz-engine.js", "utf8");
assert(quizJs.includes("id=\"diag-picker-grid\" class=\"diag-picker-grid\""), "diag-picker-grid must have class diag-picker-grid");
assert(quizJs.includes("class=\"diag-picker-preview-box\""), "card preview must have class diag-picker-preview-box");
assert(quizJs.includes("id=\"cq-attached-diag-thumb\""), "attachment card must have #cq-attached-diag-thumb");
assert(quizJs.includes("diagThumb.innerHTML ="), "setAttachedDiagram must populate diagThumb.innerHTML");
assert(quizJs.includes("class=\"cq-textarea\""), "prompt textarea must have class cq-textarea");
assert(quizJs.includes("class=\"cq-option-row\""), "option rows must have class cq-option-row");

console.log("  ✅ PASS: quiz-engine.js correctly implements diag-picker-preview-box, cq-attached-diag-thumb, and contrast classes");

console.log("\n========================================================");
console.log("📊 Summary: All Layout & Contrast Assertions Passed!");
console.log("========================================================\n");
