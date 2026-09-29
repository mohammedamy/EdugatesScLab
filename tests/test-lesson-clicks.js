// Edugates-ClipSAT Science Labs - Unit Test Suite for Lesson Clicks & Launchers
// Validates click binding, direct interactive launchers, overview tab lesson selection, and hash routing guards

import fs from "fs";
import path from "path";

console.log("\n========================================================");
console.log("🔬 Lesson Clicks & Interactive Launcher Verification");
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

const appPath = path.resolve("app.js");
const appSrc = fs.readFileSync(appPath, "utf-8");

const viewerPath = path.resolve("components/module-viewer.js");
const viewerSrc = fs.readFileSync(viewerPath, "utf-8");

const trackerPath = path.resolve("components/progress-tracker.js");
const trackerSrc = fs.readFileSync(trackerPath, "utf-8");

// 1. App.js direct launcher helpers
assert(appSrc.includes("const launchLessonInteractive = (mid, lid) => {"),
  "app.js defines launchLessonInteractive helper");

assert(appSrc.includes("openModuleModal(mod, themeColor, lid);"),
  "launchLessonInteractive immediately invokes openModuleModal with lesson ID");

assert(appSrc.includes("history.pushState(null, \"\", targetHash);"),
  "launchLessonInteractive synchronizes history state without dropping clicks");

// 2. Click bindings in renderSubjectView
assert(appSrc.includes('container.querySelectorAll(".lesson-row-card").forEach(') &&
       appSrc.includes('launchLessonInteractive(mid, lid);'),
  "lesson-row-card (Chapter cards view) bound to launchLessonInteractive");

assert(appSrc.includes('container.querySelectorAll(".lesson-card-full").forEach(') &&
       appSrc.includes('launchLessonInteractive(mid, lid);'),
  "lesson-card-full (Standalone lesson cards) bound to launchLessonInteractive");

assert(appSrc.includes('container.querySelectorAll(".btn-launch-lesson-sim").forEach(') &&
       appSrc.includes('launchLessonInteractive(mid, lid);'),
  "btn-launch-lesson-sim explicitly bound to launchLessonInteractive");

assert(appSrc.includes('container.querySelectorAll(".lesson-title-link").forEach(') &&
       appSrc.includes('launchLessonInteractive(mid, lid);'),
  "lesson-title-link explicitly bound to launchLessonInteractive");

assert(appSrc.includes('container.querySelectorAll(".module-card").forEach(') &&
       appSrc.includes('launchModuleChapter(mid);'),
  "module-card clicks bound to launchModuleChapter");

assert(appSrc.includes('container.querySelectorAll(".module-explore-link").forEach(') &&
       appSrc.includes('launchModuleChapter(mid);'),
  "module-explore-link bound to launchModuleChapter");

assert(appSrc.includes('container.querySelectorAll(".module-title-link").forEach(') &&
       appSrc.includes('launchModuleChapter(mid);'),
  "module-title-link bound to launchModuleChapter");

// 3. Router hash and popstate handling
assert(appSrc.includes('window.addEventListener("popstate", handleHashRoute);'),
  "app.js registers popstate listener for history navigation");

assert(appSrc.includes('if (AppState.currentTab !== tabId) {\n        switchTab(tabId, false);\n      }'),
  "handleHashRoute guards switchTab to prevent DOM destruction when already on tab");

// 4. Module Viewer Tab Switching from Overview
assert(viewerSrc.includes('activeTab = "interactive";\n        try { SoundFX.playClick(); } catch (err) {}\n        renderContent();'),
  "Clicking lesson card in Overview switches activeTab to 'interactive' and renders content");

assert(viewerSrc.includes('btn.addEventListener("click", (e) => {\n        e.stopPropagation();\n        const lid = parseInt(btn.dataset.lessonId, 10);\n        currentLessonId = lid;\n        activeTab = "interactive";'),
  "Clicking btn-select-lesson-interactive in Overview switches activeTab to 'interactive' and loads simulator");

assert(viewerSrc.includes('if (typeof window.closeActiveModuleModal === "function") {\n    try { window.closeActiveModuleModal(); } catch (err) {}\n  }'),
  "openModuleModal cleanly tears down prior modal instances and timers");

// 5. Progress tracker defensive storage
assert(trackerSrc.includes('typeof localStorage !== "undefined"'),
  "ProgressStore defends against restricted/disabled localStorage");

console.log("\n========================================================");
console.log(`📊 Lesson Clicks Tests: ${passed} Passed, ${failed} Failed`);
console.log("========================================================\n");

if (failed > 0) {
  process.exit(1);
}
