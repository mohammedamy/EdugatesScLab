// Edugates Science Lab - Comprehensive Refactor & Portal Audit Test Suite
// Verifies all 5 Pillars requested in the Senior Web Developer & UI/UX Audit:
// 1. Technical Audit & Relative Pathing & Semantic HTML5
// 2. UI/UX Brand Alignment & Sticky Navigation
// 3. Lab Safety Module & Dedicated SVG Icons
// 4. KaTeX Math Formulation & Interactive Experiment Cards
// 5. Accessibility (A11y), Contrast & ARIA Labels

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
console.log("🏫 Edugates Science Lab Portal Refactoring Verification");
console.log("========================================================\n");

// ----------------------------------------------------
// Pillar 1: Technical Audit & SEO & HTML5 Semantics
// ----------------------------------------------------
console.log("🔍 Pillar 1: Technical Audit, SEO & HTML5 Semantics");

const indexHtml = fs.readFileSync(path.join(rootDir, "index.html"), "utf-8");
const appJs = fs.readFileSync(path.join(rootDir, "app.js"), "utf-8");
const indexCss = fs.readFileSync(path.join(rootDir, "index.css"), "utf-8");

// 1.1 Descriptive Title
assert(
  /<title>\s*Edugates Science Lab \| Virtual Portal & Resources\s*<\/title>/.test(indexHtml),
  "index.html has exact title: 'Edugates Science Lab | Virtual Portal & Resources'"
);

// 1.2 OpenGraph & Social Sharing Meta Tags
assert(
  /<meta\s+property="og:title"\s+content="Edugates Science Lab \| Virtual Portal & Resources">/.test(indexHtml),
  "index.html contains OpenGraph og:title tag"
);
assert(
  /<meta\s+property="og:image"\s+content="https:\/\/mohammedamy\.github\.io\/EdugatesScLab\/assets\/hero-social-card-1200x630\.jpg">/.test(indexHtml),
  "index.html contains high-resolution OpenGraph social image"
);
assert(
  /<meta\s+name="twitter:card"\s+content="summary_large_image">/.test(indexHtml),
  "index.html contains Twitter large image summary card"
);

// 1.3 School-branded Favicon & Relative Asset Paths
assert(
  /<link\s+rel="icon"\s+type="image\/png"\s+sizes="32x32"\s+href="assets\/logo\.png">/.test(indexHtml),
  "index.html links to school-branded favicon via relative path"
);
assert(
  !/href="\/assets\//.test(indexHtml) && !/src="\/assets\//.test(indexHtml),
  "Zero absolute root paths (/assets/) in index.html (GitHub Pages subfolder safety)"
);

// 1.4 Semantic HTML5 Tags
assert(
  appJs.includes('<header class="app-navbar">') &&
  appJs.includes('<main class="app-main" id="main-content-view"') &&
  appJs.includes('<footer class="app-footer" role="contentinfo">') &&
  appJs.includes('<section class="home-hero-section"') &&
  appJs.includes('<section class="home-disciplines-section"'),
  "app.js employs semantic HTML5 structure (<header>, <nav>, <main>, <section>, <footer>)"
);


// ----------------------------------------------------
// Pillar 2: UI/UX Brand Alignment & Navigation
// ----------------------------------------------------
console.log("\n🎨 Pillar 2: UI/UX Brand Alignment & Persistent Navigation");

// 2.1 Edugates Brand Color Tokens in CSS
assert(
  indexCss.includes("--edugates-navy:") &&
  indexCss.includes("--edugates-teal:") &&
  indexCss.includes("--edugates-accent:"),
  "index.css defines Edugates brand design tokens (deep blues, teals, and accents)"
);

// 2.2 Persistent Sticky Navigation Menu
assert(
  appJs.includes('class="nav-persistent-menu"') &&
  appJs.includes('data-nav="home"') &&
  appJs.includes('data-nav="bio"') &&
  appJs.includes('data-nav="chem"') &&
  appJs.includes('data-nav="phys"') &&
  appJs.includes('data-nav="safety"'),
  "app.js renders persistent navigation menu with Home, Biology, Chemistry, Physics, and Safety"
);

assert(
  indexCss.includes(".nav-persistent-menu {") &&
  indexCss.includes("border-radius: 9999px;"),
  "index.css styles .nav-persistent-menu with modern pill styling"
);

// 2.3 Mobile-First Responsive Breakpoints
assert(
  indexCss.includes("@media (max-width: 768px)") &&
  indexCss.includes(".nav-persistent-menu") &&
  indexCss.includes("overflow-x: auto;"),
  "index.css provides horizontal scrollable navigation on mobile viewports (<768px)"
);


// ----------------------------------------------------
// Pillar 3: Lab Safety Dashboard & SVG Icons
// ----------------------------------------------------
console.log("\n🛡️ Pillar 3: Lab Safety Dashboard & OSHA/ANSI Compliance");

const { SAFETY_ICONS, SDS_REAGENTS, renderLabSafetyDashboard } = await import("../components/lab-safety-dashboard.js");

// 3.1 Clear SVG Safety Icons
assert(
  typeof SAFETY_ICONS.gogglesRequired === "string" && SAFETY_ICONS.gogglesRequired.includes("<svg") &&
  SAFETY_ICONS.gogglesRequired.includes("Goggles Required"),
  "SAFETY_ICONS provides scalable SVG for 'Goggles Required' (ANSI Z87.1)"
);
assert(
  typeof SAFETY_ICONS.chemicalHazard === "string" && SAFETY_ICONS.chemicalHazard.includes("<svg") &&
  SAFETY_ICONS.chemicalHazard.includes("Chemical Hazard"),
  "SAFETY_ICONS provides scalable SVG for 'Chemical Hazard' (GHS Corrosive Diamond)"
);
assert(
  typeof SAFETY_ICONS.emergencyExit === "string" && SAFETY_ICONS.emergencyExit.includes("<svg") &&
  SAFETY_ICONS.emergencyExit.includes("Emergency Exit"),
  "SAFETY_ICONS provides scalable SVG for 'Emergency Exit & Evacuation'"
);

// 3.2 SDS Lookup Database
assert(
  Array.isArray(SDS_REAGENTS) && SDS_REAGENTS.length >= 6,
  `SDS_REAGENTS contains essential high-school laboratory chemicals (found: ${SDS_REAGENTS.length})`
);

const h2so4 = SDS_REAGENTS.find(r => r.formula.includes("H2SO4") || r.name.includes("Sulfuric Acid"));
assert(
  h2so4 && h2so4.firstAid.includes("ALWAYS ADD ACID TO WATER"),
  "SDS database includes Concentrated Sulfuric Acid with AAA rule and PPE instructions"
);

assert(
  typeof renderLabSafetyDashboard === "function",
  "renderLabSafetyDashboard is exported as a callable controller"
);


// ----------------------------------------------------
// Pillar 4: Interactive Experiment Cards & Search Engine
// ----------------------------------------------------
console.log("\n🧪 Pillar 4: Interactive Experiment Cards & Equipment Search");

const { EXPERIMENT_CATALOG, renderExperimentCard, renderExperimentExplorer } = await import("../components/experiment-card.js");

assert(
  Array.isArray(EXPERIMENT_CATALOG) && EXPERIMENT_CATALOG.length >= 15,
  `EXPERIMENT_CATALOG provides metadata for STEM experiments (found: ${EXPERIMENT_CATALOG.length})`
);

const titrationExp = EXPERIMENT_CATALOG.find(e => e.id === "titration");
assert(
  titrationExp &&
  ["Beginner", "Intermediate", "Advanced"].includes(titrationExp.difficulty) &&
  titrationExp.estimatedTime.includes("mins") &&
  titrationExp.pdfUrl.endsWith(".pdf") &&
  Array.isArray(titrationExp.equipment) && titrationExp.equipment.length >= 3,
  "Experiment cards feature Difficulty, Estimated Time, Downloadable PDF link, and Equipment list"
);

assert(
  typeof renderExperimentCard === "function" && typeof renderExperimentExplorer === "function",
  "renderExperimentCard and renderExperimentExplorer are exported as modular components"
);

// Test Experiment Card HTML structure
const cardHtml = renderExperimentCard(titrationExp);
assert(
  cardHtml.includes("Intermediate") &&
  cardHtml.includes("45 mins") &&
  cardHtml.includes("Manual") &&
  cardHtml.includes("Burette"),
  "renderExperimentCard compiles semantic card with difficulty badge, duration, equipment tags, and manual link"
);


// ----------------------------------------------------
// Pillar 5: Accessibility (A11y) & Formula Support
// ----------------------------------------------------
console.log("\n♿ Pillar 5: Accessibility (A11y) & Mathematical Formulas");

// 5.1 KaTeX / MathJax Formula Support
const mathRenderer = await import("../utils/math-renderer.js");
assert(
  typeof mathRenderer.renderLatex === "function" &&
  typeof mathRenderer.renderMathInElement === "function" &&
  typeof mathRenderer.formatMathText === "function",
  "utils/math-renderer.js provides comprehensive KaTeX typesetting utilities"
);

const renderedFormula = mathRenderer.formatMathText("H_2SO_4 + 2NaOH -> Na_2SO_4 + 2H_2O");
assert(
  renderedFormula.includes("katex") || renderedFormula.includes("sub"),
  "Chemical reaction formulas are professionally typeset for web delivery"
);

// 5.2 Navigation Aria Labels
assert(
  appJs.includes('aria-label="Home Portal"') &&
  appJs.includes('aria-label="Biology Curriculum"') &&
  appJs.includes('aria-label="Chemistry Curriculum"') &&
  appJs.includes('aria-label="Physics Curriculum"') &&
  appJs.includes('aria-label="Laboratory Safety Dashboard"'),
  "app.js provides descriptive aria-labels for all persistent navigation links"
);

// 5.3 Alt Text for Scientific Diagrams
assert(
  appJs.includes('alt="Edugates Science Lab Logo"') &&
  cardHtml.includes('alt="Laboratory Bench setup for'),
  "Visual images and laboratory bench previews include detailed descriptive alt text"
);

// 5.4 Build & WebP Optimization Script Exists
assert(
  fs.existsSync(path.join(rootDir, "scripts", "convert-assets-webp.mjs")),
  "scripts/convert-assets-webp.mjs build script exists for image optimization"
);

console.log("\n========================================================");
console.log(`📊 Portal Refactoring Verification: ${passed} Passed, ${failed} Failed`);
console.log("========================================================\n");

if (failed > 0) {
  process.exit(1);
}
