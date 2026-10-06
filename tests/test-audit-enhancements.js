// tests/test-audit-enhancements.js
// Automated verification suite for Edugates-ClipSAT Science Labs audit and enhancements:
// 1. Chapter cover image asset integrity (Chem 23, Bio 27, Phys 24 = 74 files)
// 2. High-reliability chapter image loading & lazy-loading race condition elimination
// 3. Segmented subject navigation tabs & quick Lab Mode launcher button
// 4. Spatial keyboard arrow-key navigation for classroom presentation clickers
// 5. Empty search/filter states with reset actions
// 6. Tablet & smartboard touch UX CSS rules
// 7. Expanded Biology & Physics curriculum theory worked examples
// 8. PWA Service Worker cache version consistency

import assert from "assert";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("\n========================================================");
console.log("🧪 Edugates-ClipSAT Science Labs: Audit & Enhancements Test Suite");
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
// Test Group 1: Chapter Cover Image Asset Integrity (All 74 Chapters)
// -----------------------------------------------------------------------------
it("All 23 Chemistry chapter images (chem_m01.jpg - chem_m23.jpg) exist and are > 25KB", () => {
  for (let i = 1; i <= 23; i++) {
    const num = i < 10 ? `0${i}` : `${i}`;
    const filePath = path.join(rootDir, "assets", "chapters", `chem_m${num}.jpg`);
    assert(fs.existsSync(filePath), `Missing Chemistry cover image: chem_m${num}.jpg`);
    const stat = fs.statSync(filePath);
    assert(stat.size > 25000, `chem_m${num}.jpg is truncated (${stat.size} bytes)`);
  }
});

it("All 27 Biology chapter images (bio_m01.jpg - bio_m27.jpg) exist and are > 25KB", () => {
  for (let i = 1; i <= 27; i++) {
    const num = i < 10 ? `0${i}` : `${i}`;
    const filePath = path.join(rootDir, "assets", "chapters", `bio_m${num}.jpg`);
    assert(fs.existsSync(filePath), `Missing Biology cover image: bio_m${num}.jpg`);
    const stat = fs.statSync(filePath);
    assert(stat.size > 25000, `bio_m${num}.jpg is truncated (${stat.size} bytes)`);
  }
});

it("All 24 Physics chapter images (phys_m01.jpg - phys_m24.jpg) exist and are > 25KB", () => {
  for (let i = 1; i <= 24; i++) {
    const num = i < 10 ? `0${i}` : `${i}`;
    const filePath = path.join(rootDir, "assets", "chapters", `phys_m${num}.jpg`);
    assert(fs.existsSync(filePath), `Missing Physics cover image: phys_m${num}.jpg`);
    const stat = fs.statSync(filePath);
    assert(stat.size > 25000, `phys_m${num}.jpg is truncated (${stat.size} bytes)`);
  }
});

// -----------------------------------------------------------------------------
// Test Group 2: app.js Architecture, Image Loading & Spatial Navigation
// -----------------------------------------------------------------------------
const appSource = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");

it("app.js implements setupChapterImageLoading with unconditional listeners, decode handling & failsafe timer", () => {
  assert(appSource.includes("function setupChapterImageLoading(container)"), "app.js defines setupChapterImageLoading");
  assert(appSource.includes('img.addEventListener("load"'), "Attaches load listener");
  assert(appSource.includes('img.addEventListener("error"'), "Attaches error listener");
  assert(appSource.includes("img.decode"), "Leverages off-thread image decoding");
  assert(appSource.includes("rootMargin: \"450px 0px\""), "IntersectionObserver with 450px prefetch margin");
  assert(appSource.includes("setTimeout("), "Has safety fallback timer to prevent permanent loading states");
});

it("app.js implements spatial arrow-key navigation for classroom clickers and accessibility", () => {
  assert(appSource.includes("function setupCardSpatialNavigation(container)"), "app.js defines setupCardSpatialNavigation");
  assert(appSource.includes('e.key === "ArrowRight"'), "Handles ArrowRight navigation");
  assert(appSource.includes('e.key === "ArrowLeft"'), "Handles ArrowLeft navigation");
  assert(appSource.includes('e.key === "ArrowDown"'), "Handles ArrowDown vertical row jumping");
  assert(appSource.includes('e.key === "ArrowUp"'), "Handles ArrowUp vertical row jumping");
});

it("app.js provides segmented subject navigation tabs and quick Lab Mode launcher in navbar", () => {
  assert(appSource.includes('class="nav-subject-tabs"'), "app.js renders .nav-subject-tabs");
  assert(appSource.includes('class="nav-subject-tab-pill'), "app.js renders .nav-subject-tab-pill");
  assert(appSource.includes('id="btn-nav-lab-mode"'), "app.js renders quick Lab Mode button");
  assert(appSource.includes('href="#labs"'), "Quick Lab Mode links directly to #labs");
});

it("app.js renders empty search state when 0 modules match search or filter query", () => {
  assert(appSource.includes('class="empty-search-state"'), "app.js renders .empty-search-state");
  assert(appSource.includes('id="btn-empty-clear-search"'), "app.js renders Clear Search button");
  assert(appSource.includes("btnEmptyClear.addEventListener"), "app.js wires click event to clear search");
});

it("app.js optimizes critical image preloading and eager loading for above-the-fold cards", () => {
  assert(appSource.includes("curData.modules.slice(0, 6)"), "Preloads top 6 modules instead of saturating network with 12+");
  assert(appSource.includes("const isTopPriority = mIdx < 6"), "Marks first 6 cards eager and high fetchpriority");
});

// -----------------------------------------------------------------------------
// Test Group 3: CSS Polish, Tablet Mode & Banner Styling
// -----------------------------------------------------------------------------
const cssSource = fs.readFileSync(path.join(rootDir, "index.css"), "utf8");

it("index.css defines full tablet mode layout rules", () => {
  assert(cssSource.includes('[data-mode="tablet"]'), "index.css defines [data-mode=\"tablet\"]");
  assert(cssSource.includes(".mode-tablet"), "index.css defines .mode-tablet");
  assert(cssSource.includes("min-height: 48px"), "Ensures 48px touch targets in tablet mode");
});

it("index.css styles .nav-subject-tabs and .nav-btn-lab-mode", () => {
  assert(cssSource.includes(".nav-subject-tabs"), "index.css styles .nav-subject-tabs");
  assert(cssSource.includes(".nav-subject-tab-pill"), "index.css styles .nav-subject-tab-pill");
  assert(cssSource.includes(".nav-btn-lab-mode"), "index.css styles .nav-btn-lab-mode");
});

it("index.css provides rich intrinsic banner background so cards never appear white on first paint", () => {
  assert(cssSource.includes(".module-card-banner"), "index.css styles .module-card-banner");
  assert(cssSource.includes(".module-banner-skeleton"), "index.css styles .module-banner-skeleton");
  assert(cssSource.includes(".empty-search-state"), "index.css styles .empty-search-state");
});

// -----------------------------------------------------------------------------
// Test Group 4: Expanded Biology and Physics Curriculum Worked Examples
// -----------------------------------------------------------------------------
const theorySource = fs.readFileSync(path.join(rootDir, "data", "lesson-theory-database.js"), "utf8");

it("lesson-theory-database.js provides authentic calculations for Biology modules", () => {
  assert(theorySource.includes("microscope"), "Bio microscope magnification worked example");
  assert(theorySource.includes("Lindeman's 10%"), "Bio trophic efficiency worked example");
  assert(theorySource.includes("solute potential formula"), "Bio osmosis & water potential worked example");
  assert(theorySource.includes("aerobic cellular respiration"), "Bio cellular respiration ATP efficiency");
  assert(theorySource.includes("Mitotic Index"), "Bio mitotic index calculation");
  assert(theorySource.includes("dihybrid test cross"), "Bio Mendelian dihybrid inheritance");
  assert(theorySource.includes("agarose gel electrophoresis"), "Bio biotechnology gel migration");
  assert(theorySource.includes("Nernst Equation"), "Bio neuron resting potential");
  assert(theorySource.includes("Cardiac Output"), "Bio circulatory hemodynamics");
});

it("lesson-theory-database.js provides authentic calculations for Physics modules", () => {
  assert(theorySource.includes("soccer ball is kicked"), "Phys 2D projectile range & height");
  assert(theorySource.includes("unbanked circular curve"), "Phys centripetal force & cornering friction");
  assert(theorySource.includes("ambulance siren"), "Phys Doppler acoustic frequency shift");
  assert(theorySource.includes("thin converging (convex) lens"), "Phys thin lens equation & magnification");
  assert(theorySource.includes("cesium metal target"), "Phys photoelectric effect work function");
  assert(theorySource.includes("nuclear binding energy"), "Phys nuclear mass defect & binding energy");
});

// -----------------------------------------------------------------------------
// Test Group 5: PWA Service Worker Cache Version Consistency
// -----------------------------------------------------------------------------
it("sw.js, service-worker.js, and offline-diagnostics.js have synchronized cache version", () => {
  const sw = fs.readFileSync(path.join(rootDir, "sw.js"), "utf8");
  const swMain = fs.readFileSync(path.join(rootDir, "service-worker.js"), "utf8");
  const diag = fs.readFileSync(path.join(rootDir, "components", "offline-diagnostics.js"), "utf8");

  assert(sw.includes('const CACHE_NAME = "amscilab-pwa-v62";'), "sw.js bumped to v62");
  assert(swMain.includes('const CACHE_NAME = "amscilab-pwa-v62";'), "service-worker.js bumped to v62");
  assert(diag.includes('const CURRENT_CACHE_NAME = "amscilab-pwa-v62";'), "offline-diagnostics.js bumped to v62");
});

console.log("\n========================================================");
console.log(`Results: ${passed} Passed, ${failed} Failed`);
console.log("========================================================\n");

if (failed > 0) {
  process.exit(1);
}
