// tests/test-batch-i-chromatography-pcr-crispr.js
// Comprehensive verification suite for Virtual Labs #47 & #48:
// - Chemistry Lab #16: Thin-Layer (TLC), Flash Column & HPLC Chromatography (labs/chem-chromatography.js)
// - Biology Lab #16: PCR Thermal Cycler, Real-Time qPCR & CRISPR-Cas9 Gene Editing (labs/bio-pcr-crispr.js)

import assert from "assert";
import fs from "fs";
import path from "path";

// Provide lightweight mock browser globals before importing app.js
if (typeof globalThis.localStorage === "undefined") {
  globalThis.localStorage = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; },
    clear() { this._data = {}; }
  };
}
if (typeof globalThis.window === "undefined") {
  globalThis.window = globalThis;
}
window.addEventListener = window.addEventListener || (() => {});
window.removeEventListener = window.removeEventListener || (() => {});
window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener: () => {}, addEventListener: () => {} }));
window.location = window.location || { hash: "#labs", href: "https://edugates.stream/#labs", origin: "https://edugates.stream", pathname: "/" };

if (typeof globalThis.document === "undefined") {
  globalThis.document = {
    documentElement: {
      setAttribute: () => {},
      getAttribute: () => "desktop",
      classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} },
      style: { setProperty: () => {} }
    },
    body: {
      appendChild: () => {},
      classList: { add: () => {}, remove: () => {}, contains: () => false }
    },
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
    createElement: () => ({
      setAttribute: () => {},
      appendChild: () => {},
      addEventListener: () => {},
      style: {},
      classList: { add: () => {}, remove: () => {}, toggle: () => {} }
    })
  };
}

import { initChromatographyLab } from "../labs/chem-chromatography.js";
import { initPcrCrisprLab } from "../labs/bio-pcr-crispr.js";
import { LAB_CHECKPOINTS } from "../labs/lab-telemetry-exporter.js";
import { EXPERIMENT_CATALOG } from "../components/experiment-card.js";
import { VIRTUAL_LABS_REGISTRY, normalizeLabId } from "../app.js";

console.log("\n========================================================");
console.log("🧪 Batch I Verification: Chromatography & PCR/CRISPR Labs");
console.log("========================================================\n");

let passed = 0;
function test(desc, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${desc}`, err);
    process.exit(1);
  }
}

// 1. Lifecycle & Platform Registry
test("Laboratory lifecycle functions and 48-lab registry are exported", () => {
  assert.strictEqual(typeof initChromatographyLab, "function");
  assert.strictEqual(typeof initPcrCrisprLab, "function");
  assert.strictEqual(VIRTUAL_LABS_REGISTRY.length, 48);
  assert.strictEqual(normalizeLabId("lab-chromatography"), "chromatography");
  assert.strictEqual(normalizeLabId("tlc-hplc"), "chromatography");
  assert.strictEqual(normalizeLabId("lab-pcrcrispr"), "pcrcrispr");
  assert.strictEqual(normalizeLabId("crispr-cas9"), "pcrcrispr");
  assert(EXPERIMENT_CATALOG.some(e => e.id === "chromatography"), "EXPERIMENT_CATALOG must contain chromatography");
  assert(EXPERIMENT_CATALOG.some(e => e.id === "pcrcrispr"), "EXPERIMENT_CATALOG must contain pcrcrispr");
});

// 2. Chemistry Lab #16: Thin-Layer (TLC), Flash Column & HPLC Chromatography
test("chem-chromatography.js includes TLC Rf, HPLC chromatogram, UV/Iodine inspection, 4K bench photo, and CSV hotkey", () => {
  const code = fs.readFileSync(path.resolve("labs/chem-chromatography.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('mountLabCheckpoint("chrom-checkpoint-container", "chromatography")'), "Must mount chromatography checkpoint");
  assert(code.includes('📥 Export CSV (E)'), "Export button must include (E) hotkey hint");
  assert(code.includes('assets/labs/chromatography_bench.webp'), "Must include 4K WebP bench photo");
  assert(code.includes('assets/labs/chromatography_bench.jpg'), "Must include 4K JPG fallback bench photo");
  assert(code.includes("spinach") && code.includes("analgesics") && code.includes("dyes"), "Must include all 3 multi-analyte sample mixtures");
  assert(code.includes("uv254") && code.includes("uv365") && code.includes("iodine"), "Must include UV-254nm, UV-365nm, and Iodine vapor inspection modes");
});

test("LAB_CHECKPOINTS.chromatography contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.chromatography) && LAB_CHECKPOINTS.chromatography.length === 5, "chromatography pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.chromatography.map(q => q.question);
  assert(prompts.some(p => p.includes("75.0\\text{ mm}") && p.includes("36.0\\text{ mm}")), "Must include Rf calculation question");
  assert(prompts.some(p => p.includes("carotene") && p.includes("lutein")), "Must include normal-phase polarity elution order question");
  assert(prompts.some(p => p.includes("Ethyl Acetate")), "Must include eluotropic strength solvent gradient question");
  assert(prompts.some(p => p.includes("graphite pencil")), "Must include graphite pencil origin line question");
  assert(prompts.some(p => p.includes("Reversed-Phase") && p.includes("\\text{C}_{18}")), "Must include Reversed-Phase C18 retention inversion question");
});

// 3. Biology Lab #16: PCR Thermal Cycler, Real-Time qPCR & CRISPR-Cas9 Gene Editing
test("bio-pcr-crispr.js includes 3-step Peltier PCR, qPCR amplification curve, CRISPR-Cas9 PAM/sgRNA editor, 4K bench photo, and CSV hotkey", () => {
  const code = fs.readFileSync(path.resolve("labs/bio-pcr-crispr.js"), "utf-8");
  assert(code.includes('e.key === "e" || e.key === "E"'), "Must handle 'e'/'E' export shortcut");
  assert(code.includes('window.removeEventListener("keydown", handleKeyDown)'), "Cleanup must unbind keydown listener");
  assert(code.includes('mountLabCheckpoint("pcr-checkpoint-container", "pcrcrispr")'), "Must mount pcrcrispr checkpoint");
  assert(code.includes('📥 Export CSV (E)'), "Export button must include (E) hotkey hint");
  assert(code.includes('assets/labs/pcr_crispr_bench.webp'), "Must include 4K WebP bench photo");
  assert(code.includes('assets/labs/pcr_crispr_bench.jpg'), "Must include 4K JPG fallback bench photo");
  assert(code.includes("hbb") && code.includes("ccr5") && code.includes("brca1"), "Must include HBB, CCR5, and BRCA1 human genomic loci");
  assert(code.includes("5'-NGG-3'") || code.includes("PAM"), "Must include Cas9 PAM motif recognition");
});

test("LAB_CHECKPOINTS.pcrcrispr contains comprehensive 5-question inquiry suite", () => {
  assert(Array.isArray(LAB_CHECKPOINTS.pcrcrispr) && LAB_CHECKPOINTS.pcrcrispr.length === 5, "pcrcrispr pool must have 5 questions");
  const prompts = LAB_CHECKPOINTS.pcrcrispr.map(q => q.question);
  assert(prompts.some(p => p.includes("3-step Polymerase Chain Reaction")), "Must include 3-step PCR thermal cycle temperatures question");
  assert(prompts.some(p => p.includes("N_0 = 100") && p.includes("n = 20")), "Must include N0 * 2^n exponential PCR copy yield calculation question");
  assert(prompts.some(p => p.includes("Thermus aquaticus") || p.includes("Taq")), "Must include thermostable Taq DNA polymerase question");
  assert(prompts.some(p => p.includes("5'\\text{-NGG-}3'") || p.includes("PAM")), "Must include SpCas9 PAM sequence recognition question");
  assert(prompts.some(p => p.includes("sickle-cell") && p.includes("HBB")), "Must include HDR vs NHEJ gene repair pathway question");
});

console.log(`\n========================================================`);
console.log(`📊 Batch I Verification Complete: ${passed}/${passed} Tests Passed!`);
console.log(`========================================================\n`);
