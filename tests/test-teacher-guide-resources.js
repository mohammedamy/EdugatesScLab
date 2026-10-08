// Edugates-ClipSAT Science Labs - Teacher Guide & Staff Presentation Resources Verification
// Ensures the teacher guide PDF, staff presentation PPTX, modal component, and PWA offline cache are in place.

import fs from "fs";
import path from "path";

console.log("\n========================================================");
console.log("📚 Teacher Guide & Staff Presentation Verification");
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

// 1. Files Verification
console.log("📁 Document Artifacts on Filesystem:");
const pdfPath = path.join(rootDir, "Edugates_STEM_Labs_Teacher_Guide.pdf");
const pptxPath = path.join(rootDir, "Edugates_STEM_Labs_Staff_Presentation.pptx");

testAssert(fs.existsSync(pdfPath), "Edugates_STEM_Labs_Teacher_Guide.pdf exists in root directory");
if (fs.existsSync(pdfPath)) {
  const pdfStat = fs.statSync(pdfPath);
  testAssert(pdfStat.size > 100000, `Teacher Guide PDF is full-length manual (${(pdfStat.size / 1024).toFixed(1)} KB)`);
}

testAssert(fs.existsSync(pptxPath), "Edugates_STEM_Labs_Staff_Presentation.pptx exists in root directory");
if (fs.existsSync(pptxPath)) {
  const pptxStat = fs.statSync(pptxPath);
  testAssert(pptxStat.size > 2000000, `Staff Presentation PPTX is complete high-res slide deck (${(pptxStat.size / (1024 * 1024)).toFixed(2)} MB)`);
}

// 2. Component Verification
console.log("\n🧩 Teacher Guide Modal Component:");
const modalPath = path.join(rootDir, "components", "teacher-guide-modal.js");
testAssert(fs.existsSync(modalPath), "components/teacher-guide-modal.js exists");
if (fs.existsSync(modalPath)) {
  const modalSrc = fs.readFileSync(modalPath, "utf8");
  testAssert(modalSrc.includes("export function openTeacherGuideModal"), "Exports openTeacherGuideModal function");
  testAssert(modalSrc.includes("Edugates_STEM_Labs_Teacher_Guide.pdf"), "Provides 1-click download link for Teacher Guide PDF");
  testAssert(modalSrc.includes("Edugates_STEM_Labs_Staff_Presentation.pptx"), "Provides 1-click download link for Staff Presentation PPTX");
  testAssert(modalSrc.includes("tg-tab-lesson-flow"), "Includes 45-minute lesson pacing tab");
  testAssert(modalSrc.includes("tg-tab-smartboard"), "Includes MAXHUB and smartboard hardware optimization tab");
  testAssert(modalSrc.includes("tg-tab-shortcuts"), "Includes teacher keyboard shortcuts cheat sheet tab");
}

// 3. App Shell Wiring
console.log("\n🖥️ App Shell Integration:");
const appSrc = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");
testAssert(appSrc.includes('id="btn-open-teacher-guide"'), "Header controls render #btn-open-teacher-guide button");
testAssert(appSrc.includes('id="btn-dropdown-open-guide-desktop"'), "Desktop subjects dropdown includes guide footer action");
testAssert(appSrc.includes('id="btn-dropdown-open-guide-mobile"'), "Mobile subjects dropdown includes guide footer action");
testAssert(appSrc.includes('window.openTeacherGuideModal ='), "Exposes window.openTeacherGuideModal globally");
testAssert(appSrc.includes('e.key === "?"'), "Binds '?' shortcut to open teacher guide modal");

// 4. Offline PWA Caching
console.log("\n⚡ Service Worker & Offline Pre-caching:");
const swSrc = fs.readFileSync(path.join(rootDir, "service-worker.js"), "utf8");
const swMinSrc = fs.readFileSync(path.join(rootDir, "sw.js"), "utf8");
const htmlSrc = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
const diagSrc = fs.readFileSync(path.join(rootDir, "components", "offline-diagnostics.js"), "utf8");

testAssert(/amscilab-pwa-v(73|74|\d+)/.test(swSrc), "service-worker.js upgraded to amscilab-pwa-v73 or newer");
testAssert(/amscilab-pwa-v(73|74|\d+)/.test(swMinSrc), "sw.js upgraded to amscilab-pwa-v73 or newer");
testAssert(/amscilab-pwa-v(73|74|\d+)/.test(diagSrc), "offline-diagnostics.js matches active cache version");
testAssert(swSrc.includes('"./Edugates_STEM_Labs_Teacher_Guide.pdf"'), "service-worker.js pre-caches Teacher Guide PDF");
testAssert((htmlSrc.includes('app.js?v=5.3') || htmlSrc.includes('app.js?v=5.4')) && (htmlSrc.includes('index.css?v=5.3') || htmlSrc.includes('index.css?v=5.4')), "index.html cache-busting queries bumped");

console.log("\n========================================================");
console.log(`📊 Teacher Guide Resources Tests: ${passed} Passed, ${failed} Failed`);
console.log("========================================================\n");

if (failed > 0) process.exit(1);
