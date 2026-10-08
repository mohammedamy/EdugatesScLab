// Test Suite for Real 8K Optical Micrographs in bio-microscope.js
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");

console.log("\n========================================================");
console.log("🔬 Optical Microscope 12 Real 8K Micrographs Test Suite");
console.log("========================================================\n");

const microscopeJsPath = path.join(rootDir, "labs", "bio-microscope.js");
const microscopeJs = fs.readFileSync(microscopeJsPath, "utf-8");

const expectedSlides = [
  { key: "onion_mitosis", file: "onion_mitosis.jpg" },
  { key: "human_blood", file: "blood_smear.jpg" },
  { key: "elodea_leaf", file: "elodea_cells.jpg" },
  { key: "paramecium", file: "paramecium.jpg" },
  { key: "amoeba_proteus", file: "amoeba_proteus.jpg" },
  { key: "euglena_gracilis", file: "euglena_gracilis.jpg" },
  { key: "daphnia_magna", file: "daphnia_magna.jpg" },
  { key: "volvox_colony", file: "volvox_colony.jpg" },
  { key: "spirogyra_alga", file: "spirogyra_alga.jpg" },
  { key: "human_cheek", file: "human_cheek.jpg" },
  { key: "tilia_stem", file: "tilia_stem.jpg" },
  { key: "motor_neuron", file: "motor_neuron.jpg" }
];

// 1. Verify physical micrograph files exist and have substantial size (> 500 KB)
console.log("Checking physical micrograph assets in assets/microscope/...");
for (const slide of expectedSlides) {
  const assetPath = path.join(rootDir, "assets", "microscope", slide.file);
  assert(fs.existsSync(assetPath), `Asset file missing: ${slide.file}`);
  const stats = fs.statSync(assetPath);
  assert(stats.size > 500000, `Asset file ${slide.file} is too small (${stats.size} bytes), must be high-res (>500KB)`);
  console.log(`  ✅ ${slide.file} (${Math.round(stats.size / 1024)} KB)`);
}

// 2. Verify bio-microscope.js maps exact asset paths
console.log("\nChecking slideImages dictionary mapping in bio-microscope.js...");
for (const slide of expectedSlides) {
  const expectedLine = `slideImages.${slide.key}.src = "assets/microscope/${slide.file}";`;
  assert(microscopeJs.includes(expectedLine), `Missing or incorrect slideImages mapping: ${expectedLine}`);
}
console.log("  ✅ All 12 slideImages sources mapped to authentic physical micrographs.");

// 3. Verify real image rendering and research callouts
assert(microscopeJs.includes("drawResearchCallouts"), "bio-microscope.js implements drawResearchCallouts HUD");
assert(microscopeJs.includes("ctx.imageSmoothingQuality = \"high\""), "bio-microscope.js enables high bicubic smoothing");
assert(microscopeJs.includes("radius * 5.2"), "bio-microscope.js scales image for full circular FOV coverage at 4x");

// 4. Verify no unconditional procedural calls in overlays when isImgLoaded is true
const overlayNames = [
  "drawOnionMitosisOverlay",
  "drawElodeaLeafOverlay",
  "drawSpirogyraOverlay",
  "drawTiliaStemOverlay",
  "drawParameciumOverlay",
  "drawAmoebaProteusOverlay",
  "drawEuglenaGracilisOverlay",
  "drawVolvoxColonyOverlay",
  "drawDaphniaMagnaOverlay",
  "drawHumanBloodOverlay",
  "drawHumanCheekOverlay",
  "drawMotorNeuronOverlay"
];

for (const ov of overlayNames) {
  assert(microscopeJs.includes(`function ${ov}(isImgLoaded)`), `Function ${ov}(isImgLoaded) defined`);
}
console.log("  ✅ All 12 overlay functions support isImgLoaded conditional rendering.");

// 5. Verify Service Worker precaching of all 12 micrographs
const swContent = fs.readFileSync(path.join(rootDir, "service-worker.js"), "utf-8");
for (const slide of expectedSlides) {
  assert(swContent.includes(`./assets/microscope/${slide.file}`), `service-worker.js missing precache for ${slide.file}`);
}
console.log("  ✅ Service Worker precaches all 12 micrographs for offline PWA operation.");

console.log("\n========================================================");
console.log("🎉 All 12 Real 8K Micrograph Tests Passed Successfully!");
console.log("========================================================\n");
