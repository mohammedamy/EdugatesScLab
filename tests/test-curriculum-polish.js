// Edugates-ClipSAT Science Labs - Unit Test Suite for Subject Progress, Mobile Chrome, and Polish
// Validates:
// 1. Subject-aware progress tracker (isolated chem/bio/phys counters & last opened)
// 2. 404 client-side redirect for old/typo URLs (EdugtesScLab -> EdugatesScLab)
// 3. Social meta, canonical links, and JSON-LD structured data
// 4. Chapter view dialog semantics, focus management, and skip links
// 5. Mobile header chrome resilience and touch-zoom HUD positioning
// 6. Curriculum skeleton transition and shortcuts modal

import fs from "fs";
import path from "path";

console.log("\n========================================================");
console.log("🌟 Educational Platform Critical Fixes & Polish Verification");
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

// ----------------------------------------------------
// 1. Subject-Aware Progress Tracker
// ----------------------------------------------------
const trackerPath = path.resolve("components/progress-tracker.js");
const trackerSrc = fs.readFileSync(trackerPath, "utf-8");

assert(trackerSrc.includes("LAB_SUBJECT_MAP"), "progress-tracker.js defines LAB_SUBJECT_MAP for all virtual labs");
assert(trackerSrc.includes('titration: "chem"') && trackerSrc.includes('anatomy: "bio"') && trackerSrc.includes('projectile: "phys"'),
  "LAB_SUBJECT_MAP classifies chem, bio, and phys laboratories");
assert(trackerSrc.includes("formatRelativeTime"), "progress-tracker.js exports formatRelativeTime helper");
assert(trackerSrc.includes("getSubjectStats"), "ProgressStore provides getSubjectStats(subjectId)");
assert(trackerSrc.includes("recordModuleOpened"), "ProgressStore provides recordModuleOpened(moduleCode)");
assert(trackerSrc.includes("lastOpenedPerSubject"), "ProgressStore persists lastOpenedPerSubject telemetry");

// Dynamic test of formatRelativeTime
import { formatRelativeTime, ProgressStore, LAB_SUBJECT_MAP } from "../components/progress-tracker.js";

const now = Date.now();
assert(formatRelativeTime(now - 1000) === "just now", "formatRelativeTime: <1m returns 'just now'");
assert(formatRelativeTime(now - 5 * 60 * 1000) === "5m ago", "formatRelativeTime: 5m returns '5m ago'");
assert(formatRelativeTime(now - 3 * 3600 * 1000) === "3h ago", "formatRelativeTime: 3h returns '3h ago'");
assert(formatRelativeTime(now - 28 * 3600 * 1000) === "yesterday", "formatRelativeTime: 28h returns 'yesterday'");

// Subject stats isolation
const bioStats = ProgressStore.getSubjectStats("bio");
assert(bioStats.subject === "bio", "getSubjectStats('bio') targets biology");
assert(!bioStats.lastCode || bioStats.lastCode.startsWith("BIO"), "Bio stats never defaults to CHEM chapter");

// ----------------------------------------------------
// 2. Old URL Redirect (404.html)
// ----------------------------------------------------
const redirectPath = path.resolve("404.html");
assert(fs.existsSync(redirectPath), "404.html exists in root directory");
const redirectSrc = fs.readFileSync(redirectPath, "utf-8");
assert(redirectSrc.includes("EdugtesScLab") && redirectSrc.includes("location.replace"),
  "404.html performs instant location.replace redirection for EdugtesScLab typo");
assert(redirectSrc.includes("https://mohammedamy.github.io/EdugatesScLab/"),
  "404.html canonical target is https://mohammedamy.github.io/EdugatesScLab/");

// ----------------------------------------------------
// 3. Social & SEO (index.html)
// ----------------------------------------------------
const indexPath = path.resolve("index.html");
const indexSrc = fs.readFileSync(indexPath, "utf-8");

assert(indexSrc.includes('<link rel="canonical" href="https://mohammedamy.github.io/EdugatesScLab/">'),
  "index.html defines self-referencing canonical URL");
assert(indexSrc.includes('property="og:image"') && indexSrc.includes("assets/hero-social-card-1200x630.jpg"),
  "index.html defines og:image pointing to 1200x630 social card");
assert(indexSrc.includes('name="twitter:card" content="summary_large_image"'),
  "index.html defines twitter:card summary_large_image");
assert(indexSrc.includes('itemtype="https://schema.org/EducationalOrganization"') || indexSrc.includes('"@type": "EducationalOrganization"'),
  "index.html includes EducationalOrganization structured data");
assert(indexSrc.includes('meta[name="theme-color"]') || indexSrc.includes('themeColorMeta.setAttribute("content"'),
  "index.html synchronizes theme-color with active theme");

const socialCardPath = path.resolve("assets/hero-social-card-1200x630.jpg");
assert(fs.existsSync(socialCardPath), "assets/hero-social-card-1200x630.jpg exists on filesystem");

// ----------------------------------------------------
// 4. Accessibility of Chapter View (module-viewer.js)
// ----------------------------------------------------
const viewerPath = path.resolve("components/module-viewer.js");
const viewerSrc = fs.readFileSync(viewerPath, "utf-8");

assert(viewerSrc.includes('role="dialog"') && viewerSrc.includes('aria-modal="true"'),
  "module-viewer.js sets accessible dialog semantics (role='dialog', aria-modal='true')");
assert(viewerSrc.includes('aria-labelledby="modal-chapter-title"'),
  "module-viewer.js labels dialog with chapter title");
assert(viewerSrc.includes('modal-skip-link') && viewerSrc.includes("Skip to lesson content"),
  "module-viewer.js includes internal skip link for keyboard users");
assert(viewerSrc.includes("openerEl && typeof openerEl.focus === \"function\""),
  "module-viewer.js restores focus to trigger element on dismiss");
assert(viewerSrc.includes('if (e.key === "Escape")') && viewerSrc.includes('closeModal();'),
  "module-viewer.js dismisses dialog on Escape key");
assert(viewerSrc.includes('if (e.key === "Tab")'),
  "module-viewer.js traps focus within dialog during keyboard navigation");

// ----------------------------------------------------
// 5. Mobile Chrome & Layout (index.css)
// ----------------------------------------------------
const cssPath = path.resolve("index.css");
const cssSrc = fs.readFileSync(cssPath, "utf-8");

assert(cssSrc.includes(".modal-header-actions"),
  "index.css defines .modal-header-actions container");
assert(cssSrc.includes(".btn-header-action") && cssSrc.includes(".btn-action-label"),
  "index.css defines flexible action button structure");
assert(cssSrc.includes("@media (max-width: 768px)") && cssSrc.includes(".btn-action-label {\n    display: none;"),
  "index.css collapses action labels to icon-only on mobile (<768px)");
assert(cssSrc.includes(".back-label-long") && cssSrc.includes(".back-label-short"),
  "index.css defines responsive long/short labels for Back button");
assert(cssSrc.includes("bottom: 72px;") && cssSrc.includes(".sb-toolbar-toggle"),
  "index.css moves mobile touch zoom HUD above pen toggle to prevent collisions");
assert(viewerSrc.includes('id="btn-header-overflow-modal"') && viewerSrc.includes('id="modal-header-overflow-menu"'),
  "module-viewer.js implements accessible mobile chapter overflow menu (button and role='menu')");
assert(cssSrc.includes(".modal-overflow-wrap") && cssSrc.includes("@media (max-width: 600px)"),
  "index.css includes responsive rules for modal overflow menu on mobile viewports <=600px");

// ----------------------------------------------------
// 6. Curriculum Switch Skeleton & Shortcuts Modal (app.js)
// ----------------------------------------------------
const appPath = path.resolve("app.js");
const appSrc = fs.readFileSync(appPath, "utf-8");

assert(appSrc.includes("renderCurriculumSkeleton"),
  "app.js defines renderCurriculumSkeleton helper");
assert(appSrc.includes("openShortcutsModal"),
  "app.js exports openShortcutsModal");
assert(appSrc.includes("btn-open-shortcuts-cheatsheet"),
  "app.js binds shortcuts cheatsheet button in presenter tip banner");
assert(appSrc.includes("Shift + F") && appSrc.includes("Ctrl + K") && appSrc.includes("Esc"),
  "Shortcuts modal documents Shift+F, Ctrl+K, and Esc keys");
assert(appSrc.includes("localStorage.getItem(\"edugates_focus_mode\")"),
  "app.js restores persisted Focus Mode on startup");
assert(appSrc.includes("window.TouchZoom.setAllowed(tabId === \"labs\")"),
  "app.js restricts TouchZoom HUD on curriculum tabs and allows on virtual labs");

// ----------------------------------------------------
// 7. Service Worker Cache Update
// ----------------------------------------------------
const swPath = path.resolve("sw.js");
const swSrc = fs.readFileSync(swPath, "utf-8");
const vMatch = swSrc.match(/amscilab-pwa-v(\d+)/);
assert(vMatch && parseInt(vMatch[1], 10) >= 55,
  "sw.js cache bumped to v55 or newer");
assert(swSrc.includes("./404.html") && swSrc.includes("./assets/hero-social-card-1200x630.jpg"),
  "sw.js caches 404.html and hero social card");

console.log("\n========================================================");
console.log(`📊 Curriculum Polish Test Results: ${passed} Passed, ${failed} Failed`);
console.log("========================================================\n");

if (failed > 0) {
  process.exit(1);
}
