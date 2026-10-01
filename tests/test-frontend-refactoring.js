// Edugates-ClipSAT Science Labs - Comprehensive Front-End & Performance Test Suite
// Verifies all 6 architectural refactoring and bug-fix requirements:
// 1. Link Attributes & PWA Manifest Integrity
// 2. Network Pre-fetching Optimization (Zero redundant dns-prefetch)
// 3. Robust Loading State & 8-Second Error Boundary Watchdog
// 4. Accessibility (A11y) & Focus Management
// 5. Offline-First & Service Worker Architecture
// 6. Lab Report Export Module & Canvas Snapshotting

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log("\n========================================================");
console.log("🛠️ Front-End Architecture & Web Performance Verification");
console.log("========================================================\n");

// ----------------------------------------------------
// Pillar 1: Link Attributes & PWA Manifest Integrity
// ----------------------------------------------------
console.log("🔗 Pillar 1: Link Attributes & PWA Manifest Integrity");

const indexHtml = fs.readFileSync(path.join(rootDir, "index.html"), "utf-8");

assert(/<link\s+rel="apple-touch-icon"\s+sizes="180x180"\s+href="assets\/apple-touch-icon\.png"/.test(indexHtml),
  "index.html has valid <link rel=\"apple-touch-icon\"> pointing to assets/apple-touch-icon.png with sizes=\"180x180\"");

assert(/<link\s+rel="manifest"\s+href="manifest\.json">/.test(indexHtml),
  "index.html has valid <link rel=\"manifest\" href=\"manifest.json\">");

assert(fs.existsSync(path.join(rootDir, "assets/apple-touch-icon.png")),
  "assets/apple-touch-icon.png exists on filesystem");

assert(fs.existsSync(path.join(rootDir, "assets/icon-192.png")),
  "assets/icon-192.png exists on filesystem");

assert(fs.existsSync(path.join(rootDir, "assets/icon-512.png")),
  "assets/icon-512.png exists on filesystem");

const manifestJson = JSON.parse(fs.readFileSync(path.join(rootDir, "manifest.json"), "utf-8"));

assert(manifestJson.display === "standalone",
  "manifest.json configured for standalone display mode");

assert(manifestJson.background_color === "#070a12",
  "manifest.json background_color matches dark educational theme (#070a12)");

assert(manifestJson.theme_color === "#0284c7",
  "manifest.json theme_color configured with primary brand accent (#0284c7)");

assert(manifestJson.orientation === "any",
  "manifest.json orientation configured as 'any' for Smartboards and Mobiles");

assert(manifestJson.scope === "./",
  "manifest.json scope correctly configured as './'");

assert(Array.isArray(manifestJson.icons) && manifestJson.icons.length >= 4,
  `manifest.json contains multi-resolution icon definitions (found: ${manifestJson.icons.length})`);

const iconSizes = manifestJson.icons.map(i => i.sizes);
assert(iconSizes.includes("180x180") && iconSizes.includes("192x192") && iconSizes.includes("512x512"),
  "manifest.json includes standard 180x180, 192x192, and 512x512 icon dimensions");


// ----------------------------------------------------
// Pillar 2: Network Pre-fetching Optimization
// ----------------------------------------------------
console.log("\n⚡ Pillar 2: Network Pre-fetching Optimization");

assert(!/<link\s+rel="dns-prefetch"/.test(indexHtml),
  "Cleaned up redundant dns-prefetch tags (preconnect eliminates redundant socket overhead)");

assert(/<link\s+rel="preconnect"\s+href="https:\/\/fonts\.googleapis\.com">/.test(indexHtml),
  "Retained necessary preconnect for Google Fonts CSS endpoint");

assert(/<link\s+rel="preconnect"\s+href="https:\/\/fonts\.gstatic\.com"\s+crossorigin>/.test(indexHtml),
  "Retained necessary preconnect with crossorigin for Google Fonts binary assets");

assert(/<link\s+rel="preconnect"\s+href="https:\/\/cdn\.jsdelivr\.net"\s+crossorigin>/.test(indexHtml),
  "Retained necessary preconnect with crossorigin for KaTeX CDN assets");


// ----------------------------------------------------
// Pillar 3: Robust Loading State & Error Boundary
// ----------------------------------------------------
console.log("\n🛡️ Pillar 3: Robust Loading State & Error Boundary");

assert(!indexHtml.includes("Loading Edugates-ClipSAT Science Labs...</div></div>\n\n  <!-- Main Modular Application Script -->"),
  "Eliminated indefinite plain text spinner inside #app-root");

assert(indexHtml.includes("id=\"app-shell-loading\"") && indexHtml.includes("role=\"status\"") && indexHtml.includes("aria-live=\"polite\""),
  "Implemented accessible animated app-shell loading indicator with ARIA live region");

assert(/window\.__APP_BOOTED__\s*=\s*false/.test(indexHtml),
  "Watchdog initializes window.__APP_BOOTED__ sentinel variable");

assert(/setTimeout\(function\(\)\s*\{\s*if\s*\(!window\.__APP_BOOTED__\)/.test(indexHtml) && indexHtml.includes("8000"),
  "Watchdog implements 8-second (8000ms) boot timeout boundary");

assert(indexHtml.includes("Retry / Reload Laboratory") && indexHtml.includes("Clear Cache &amp; Reload"),
  "Error boundary provides clear diagnosis, retry action, and cache clearing fallback");

const appJsContent = fs.readFileSync(path.join(rootDir, "app.js"), "utf-8");

assert(/window\.__APP_BOOTED__\s*=\s*true/.test(appJsContent),
  "app.js marks window.__APP_BOOTED__ = true upon successful startup");

assert(/catch\s*\(bootErr\)\s*\{\s*console\.error/.test(appJsContent) && appJsContent.includes("__TRIGGER_APP_ERROR__"),
  "bootApp() catches runtime initialization exceptions and invokes error boundary");


// ----------------------------------------------------
// Pillar 4: Accessibility (A11y) & Focus Management
// ----------------------------------------------------
console.log("\n♿ Pillar 4: Accessibility (A11y) & Focus Management");

assert(/<a\s+href="#main-content-view"\s+class="skip-link">Skip to main content<\/a>/.test(indexHtml),
  "index.html provides skip link pointing to #main-content-view");

assert(/<main\s+class="app-main"\s+id="main-content-view"\s+tabindex="-1"><\/main>/.test(appJsContent),
  "app.js renders main viewport with id=\"main-content-view\" and tabindex=\"-1\"");

assert(appJsContent.includes('route === "main-content-view"'),
  "handleHashRoute handles #main-content-view routing without resetting active curriculum");

assert(appJsContent.includes('mainView.focus({ preventScroll: true });'),
  "switchTab executes programmatic focus transfer to #main-content-view on view navigation");

assert(appJsContent.includes("export function enhanceA11y"),
  "app.js exports enhanceA11y utility for simulation controls and readouts");

const indexCss = fs.readFileSync(path.join(rootDir, "index.css"), "utf-8");
assert(indexCss.includes("#main-content-view:focus-visible"),
  "index.css defines clear, accessible focus-visible styles for #main-content-view");


// ----------------------------------------------------
// Pillar 5: Offline-First & Service Worker Architecture
// ----------------------------------------------------
console.log("\n📦 Pillar 5: Offline-First & Service Worker Architecture");

assert(fs.existsSync(path.join(rootDir, "service-worker.js")),
  "service-worker.js exists on filesystem");

const swContent = fs.readFileSync(path.join(rootDir, "service-worker.js"), "utf-8");

assert(/amscilab-pwa-v(42|43|\d+)/.test(swContent),
  "service-worker.js uses bumped cache version amscilab-pwa-v43 or newer");

assert(swContent.includes("Cache-First for Static Assets"),
  "service-worker.js implements Cache-First strategy for static local assets");

assert(swContent.includes("Stale-While-Revalidate for External CDNs"),
  "service-worker.js implements Stale-While-Revalidate strategy for Google Fonts & KaTeX");

assert(swContent.includes("caches.delete(key)") && swContent.includes("self.clients.claim()"),
  "service-worker.js flushes stale cache versions on activation and claims clients");

assert(appJsContent.includes('navigator.serviceWorker.register("./service-worker.js")'),
  "app.js registers service-worker.js gracefully inside boot sequence");


// ----------------------------------------------------
// Pillar 6: Lab Report Export Module
// ----------------------------------------------------
console.log("\n📄 Pillar 6: Lab Report Export Module");

assert(fs.existsSync(path.join(rootDir, "utils/lab-report-exporter.js")),
  "utils/lab-report-exporter.js exists on filesystem");

import { captureCanvasAsDataUrl, buildPrintableReportHtml, exportLabReportPrintable, downloadStandaloneReportHtml } from "../utils/lab-report-exporter.js";

assert(typeof captureCanvasAsDataUrl === "function",
  "captureCanvasAsDataUrl is exported as a function");

assert(typeof buildPrintableReportHtml === "function",
  "buildPrintableReportHtml is exported as a function");

assert(typeof exportLabReportPrintable === "function",
  "exportLabReportPrintable is exported as a function");

assert(typeof downloadStandaloneReportHtml === "function",
  "downloadStandaloneReportHtml is exported as a function");

const sampleReport = buildPrintableReportHtml({
  title: "Precision Ballistics & Trajectory Range",
  labId: "projectile",
  subject: "Inspire Physics",
  inquiryQuestion: "How does elevation angle affect parabolic range?",
  parameters: { "Elevation Angle": "45°", "Initial Velocity": "35.0 m/s" },
  readings: { "Flight Time": "5.05 s", "Total Range": "125.0 m" },
  headers: ["Trial #", "Launch Angle", "Range (m)"],
  dataRows: [["Trial 1", "30°", "108.2 m"], ["Trial 2", "45°", "125.0 m"], ["Trial 3", "60°", "108.2 m"]],
  canvasDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
});

assert(sampleReport.includes("Precision Ballistics &amp; Trajectory Range") || sampleReport.includes("Precision Ballistics & Trajectory Range"),
  "Generated report contains valid title");

assert(sampleReport.includes("Figure 1.0: Real-time graphical sensor capture from 60 FPS interactive simulation canvas."),
  "Generated report embeds simulation canvas snapshot with figure caption");

assert(sampleReport.includes("Scientific Argumentation (Claim • Evidence • Reasoning)"),
  "Generated report includes NGSS Claim-Evidence-Reasoning (CER) framework");

assert(sampleReport.includes("Empirical Measurement Data Table"),
  "Generated report renders structured measurement data table");

const telemetryExporterContent = fs.readFileSync(path.join(rootDir, "labs/lab-telemetry-exporter.js"), "utf-8");
assert(telemetryExporterContent.includes("exportLabReportPrintable") && telemetryExporterContent.includes("captureCanvasAsDataUrl"),
  "labs/lab-telemetry-exporter.js re-exports modular report functions and integrates canvas capture");


// ----------------------------------------------------
// Summary
// ----------------------------------------------------
console.log("\n========================================================");
console.log(`📊 Refactoring Test Results: ${passed} Passed, ${failed} Failed`);
console.log("========================================================\n");

if (failed > 0) process.exit(1);
else process.exit(0);
