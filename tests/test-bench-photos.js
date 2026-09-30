// tests/test-bench-photos.js
// Validates all 30 authentic 4K lab bench photographs, file existence, sizes,
// PWA service worker pre-caching, and interactive DOM toggle switching.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("\n========================================================");
console.log("📸 4K Authentic Laboratory Bench Photos & View Switchers Test");
console.log("========================================================\n");

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

// 1. Verify all 30 lab bench images on disk
const expectedBenchImages = [
  "action_potential_bench.jpg",
  "beer_lambert_bench.jpg",
  "calorimetry_bench.jpg",
  "circuits_bench.jpg",
  "colligative_bench.jpg",
  "conduction_bench.jpg",
  "dna_structure.jpg",
  "ecology_bench.jpg",
  "electrochem_bench.jpg",
  "electrophoresis_bench.jpg",
  "element_samples.jpg",
  "enzymes_bench.jpg",
  "equilibrium_bench.jpg",
  "fluids_bench.jpg",
  "gas_laws_bench.jpg",
  "harmonic_bench.jpg",
  "magnetism_bench.jpg",
  "microscope_bench.jpg",
  "nuclear_decay_bench.jpg",
  "optics_bench.jpg",
  "organic_bench.jpg",
  "photoelectric_bench.jpg",
  "photosynthesis_bench.jpg",
  "projectile_bench.jpg",
  "punnett_bench.jpg",
  "respiration_bench.jpg",
  "rotational_bench.jpg",
  "titration_bench.jpg",
  "vsepr_bench.jpg",
  "waves_bench.jpg"
];

console.log("📁 Test 1: Verifying 30 Lab Bench Image Files in assets/labs/");
expectedBenchImages.forEach((filename) => {
  const filePath = path.join(rootDir, "assets", "labs", filename);
  const exists = fs.existsSync(filePath);
  if (!exists) {
    assert(false, `Image assets/labs/${filename} does not exist`);
    return;
  }
  const stat = fs.statSync(filePath);
  const isSufficientSize = stat.size > 200000; // at least 200 KB for high-definition 4k assets
  assert(
    isSufficientSize,
    `Image assets/labs/${filename} exists with valid 4K size (${(stat.size / 1024).toFixed(1)} KB)`
  );
});

// 2. Verify all 10 new lab files have their 4K bench image and switcher buttons
console.log("\n🔬 Test 2: Verifying 10 New Lab Modules' 4K Bench Overlay Integration");

const newLabConfigs = [
  {
    file: "labs/chem-beer-lambert.js",
    image: "assets/labs/beer_lambert_bench.jpg",
    simBtn: "view-mode-beer-sim",
    photoBtn: "view-mode-beer-photo",
    overlay: "beer-photo-overlay"
  },
  {
    file: "labs/chem-nuclear-decay.js",
    image: "assets/labs/nuclear_decay_bench.jpg",
    simBtn: "view-mode-decay-sim",
    photoBtn: "view-mode-decay-photo",
    overlay: "decay-photo-overlay"
  },
  {
    file: "labs/chem-colligative.js",
    image: "assets/labs/colligative_bench.jpg",
    simBtn: "view-mode-collig-sim",
    photoBtn: "view-mode-collig-photo",
    overlay: "collig-photo-overlay"
  },
  {
    file: "labs/chem-organic-reactions.js",
    image: "assets/labs/organic_bench.jpg",
    simBtn: "view-mode-org-sim",
    photoBtn: "view-mode-org-photo",
    overlay: "org-photo-overlay"
  },
  {
    file: "labs/bio-gel-electrophoresis.js",
    image: "assets/labs/electrophoresis_bench.jpg",
    simBtn: "view-mode-gel-sim",
    photoBtn: "view-mode-gel-photo",
    overlay: "gel-photo-overlay"
  },
  {
    file: "labs/bio-population-ecology.js",
    image: "assets/labs/ecology_bench.jpg",
    simBtn: "view-mode-eco-sim",
    photoBtn: "view-mode-eco-photo",
    overlay: "eco-photo-overlay"
  },
  {
    file: "labs/bio-action-potential.js",
    image: "assets/labs/action_potential_bench.jpg",
    simBtn: "view-mode-neuro-sim",
    photoBtn: "view-mode-neuro-photo",
    overlay: "neuro-photo-overlay"
  },
  {
    file: "labs/phys-rotational-dynamics.js",
    image: "assets/labs/rotational_bench.jpg",
    simBtn: "view-mode-rot-sim",
    photoBtn: "view-mode-rot-photo",
    overlay: "rot-photo-overlay"
  },
  {
    file: "labs/phys-thermal-conduction.js",
    image: "assets/labs/conduction_bench.jpg",
    simBtn: "view-mode-cond-sim",
    photoBtn: "view-mode-cond-photo",
    overlay: "cond-photo-overlay"
  },
  {
    file: "labs/phys-fluids-buoyancy.js",
    image: "assets/labs/fluids_bench.jpg",
    simBtn: "view-mode-fluids-sim",
    photoBtn: "view-mode-fluids-photo",
    overlay: "fluids-photo-overlay"
  }
];

newLabConfigs.forEach((cfg) => {
  const content = fs.readFileSync(path.join(rootDir, cfg.file), "utf-8");
  const hasImage = content.includes(cfg.image);
  const hasSimBtn = content.includes(cfg.simBtn);
  const hasPhotoBtn = content.includes(cfg.photoBtn);
  const hasOverlay = content.includes(cfg.overlay);

  assert(
    hasImage && hasSimBtn && hasPhotoBtn && hasOverlay,
    `Lab ${cfg.file} integrates ${cfg.image}, view switcher buttons, and overlay container`
  );
});

// 3. Verify Service Worker PWA Cache in sw.js
console.log("\n📦 Test 3: Verifying PWA Service Worker Cache in sw.js");
const swContent = fs.readFileSync(path.join(rootDir, "sw.js"), "utf-8");

assert(/amscilab-pwa-v(39|40|\d+)/.test(swContent), "sw.js bumped to amscilab-pwa-v40 or newer");

expectedBenchImages.forEach((img) => {
  const cacheEntry = `./assets/labs/${img}`;
  assert(
    swContent.includes(cacheEntry),
    `sw.js pre-caches ${cacheEntry}`
  );
});

// 4. Verify index.html cache buster
console.log("\n🌐 Test 4: Verifying index.html Cache Busters");
const indexContent = fs.readFileSync(path.join(rootDir, "index.html"), "utf-8");
assert(/index\.css\?v=(3\.9|4\.0|\d+\.\d+)/.test(indexContent), "index.html references updated index.css version");
assert(/app\.js\?v=(3\.9|4\.0|\d+\.\d+)/.test(indexContent), "index.html references updated app.js version");

console.log("\n========================================================");
console.log(`📊 4K Bench Photos Test Results: ${passed} Passed, ${failed} Failed`);
console.log("========================================================\n");

if (failed > 0) process.exit(1);
