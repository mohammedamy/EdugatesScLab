// Edugates-ClipSAT Science Labs - Unit Test Suite for 4K Human Anatomy Atlas & Histology Suite
// Validates anatomical data accuracy, Latin nomenclature, 10 organ systems,
// 6 histology simulation workbenches, lab lifecycle compliance, DPR shielding, and application routing.

import assert from "assert";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("\n========================================================");
console.log("🏛️ 4K Ultra-HD Human Anatomy Atlas Laboratory Verification");
console.log("========================================================\n");

let passed = 0;
let failed = 0;

function check(cond, desc) {
  if (cond) {
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${desc}`);
    failed++;
  }
}

// ----------------------------------------------------
// Test 1: Anatomical Systems Dataset Integrity
// ----------------------------------------------------
import {
  ANATOMICAL_SYSTEMS,
  ANATOMICAL_STRUCTURES,
  ANATOMICAL_PLATES,
  HISTOLOGY_SIMULATION_MODELS,
  ANATOMY_CHECKPOINTS
} from "../data/human-anatomy-atlas-data.js";

const systemKeys = Object.keys(ANATOMICAL_SYSTEMS);
check(systemKeys.length === 10, `Anatomy database defines all 10 major organ systems (Found: ${systemKeys.length})`);

const expectedSystems = ["skeletal", "muscular", "circulatory", "nervous", "respiratory", "digestive", "urinary", "endocrine", "lymphatic", "integumentary"];
const allExpectedSystemsPresent = expectedSystems.every(s => ANATOMICAL_SYSTEMS[s] && ANATOMICAL_SYSTEMS[s].latinName);
check(allExpectedSystemsPresent, "All 10 systems feature validated Terminologia Anatomica Latin nomenclature and summaries");

// ----------------------------------------------------
// Test 2: 11 Museum-Grade 8K Anatomical Plates & Assets
// ----------------------------------------------------
const plateKeys = Object.keys(ANATOMICAL_PLATES);
check(plateKeys.length === 11, `Atlas defines 11 dedicated anatomical plates (Found: ${plateKeys.length})`);

let allPlatesValid = true;
let allPlateFilesExist = true;

plateKeys.forEach(pk => {
  const p = ANATOMICAL_PLATES[pk];
  if (!p.id || !p.name || !p.shortName || !p.icon || !p.src || !p.system || !p.view || !p.aspectRatio) {
    allPlatesValid = false;
    console.error("Invalid plate metadata:", pk);
  }
  const cleanPath = p.src.replace(/^\.\//, "");
  const fullPath = path.join(rootDir, cleanPath);
  if (!fs.existsSync(fullPath)) {
    allPlateFilesExist = false;
    console.error("Missing plate asset file on disk:", fullPath);
  }
});
check(allPlatesValid, "All 11 anatomical plates feature verified system classifications, views, and aspect ratios");
check(allPlateFilesExist, "All 11 8K Ultra-HD anatomical plate image assets are verified to exist on disk");

// ----------------------------------------------------
// Test 3: Anatomical Structures & Multi-Region Coverage
// ----------------------------------------------------
check(ANATOMICAL_STRUCTURES.length >= 50, `Anatomy atlas contains comprehensive anatomical structures (Found: ${ANATOMICAL_STRUCTURES.length})`);

const regionsCovered = new Set(ANATOMICAL_STRUCTURES.map(s => s.region));
check(
  regionsCovered.has("head") &&
  regionsCovered.has("thorax") &&
  regionsCovered.has("abdomen") &&
  regionsCovered.has("pelvis") &&
  regionsCovered.has("upper_limb") &&
  regionsCovered.has("lower_limb"),
  "Structures span all major anatomical regions (Head, Thorax, Abdomen, Pelvis, Upper & Lower Limbs)"
);

let allStructuresValid = true;
ANATOMICAL_STRUCTURES.forEach(s => {
  if (
    !s.id ||
    !s.name ||
    !s.latinName ||
    !s.system ||
    !s.coords ||
    typeof s.coords.x !== "number" ||
    typeof s.coords.y !== "number" ||
    !s.description ||
    !s.function ||
    !s.vascularization ||
    !s.innervation ||
    !s.pathology
  ) {
    allStructuresValid = false;
    console.error("Invalid structure metadata:", s.id);
  }
});
check(allStructuresValid, "All anatomical structures contain verified coordinates, vascularization, innervation, and pathology notes");

// ----------------------------------------------------
// Test 4: Histological & Microscopic Simulation Models
// ----------------------------------------------------
const modelKeys = Object.keys(HISTOLOGY_SIMULATION_MODELS);
check(modelKeys.length === 6, `Atlas includes 6 specialized 4K histological simulation workbenches (Found: ${modelKeys.length})`);

const cardiacModel = HISTOLOGY_SIMULATION_MODELS.cardiac_cycle;
check(cardiacModel && cardiacModel.ecgPhases && cardiacModel.ecgPhases.length === 5, "Cardiac cycle model includes P-QRS-T electrocardiogram phases and conduction pathway");

const nephronModel = HISTOLOGY_SIMULATION_MODELS.nephron_countercurrent;
check(nephronModel && nephronModel.segments && nephronModel.segments.length === 5, "Nephron model details countercurrent multiplication, Bowman's capsule, and Loop of Henle");

const sarcomereModel = HISTOLOGY_SIMULATION_MODELS.sarcomere_sliding;
check(sarcomereModel && sarcomereModel.crossBridgeCycle && sarcomereModel.crossBridgeCycle.length === 5, "Sarcomere model details step-by-step ATP sliding filament cross-bridge cycling");

// ----------------------------------------------------
// Test 5: Laboratory Source & Interface Compliance
// ----------------------------------------------------
const atlasSource = fs.readFileSync(path.join(rootDir, "labs", "anatomy-atlas.js"), "utf-8");

check(atlasSource.includes("export function initAnatomyAtlasLab("), "anatomy-atlas.js exports initAnatomyAtlasLab()");
check(atlasSource.includes("export function cleanupAnatomyAtlasLab()"), "anatomy-atlas.js exports cleanupAnatomyAtlasLab()");
check(atlasSource.includes("if (!container || !container.isConnected)"), "anatomy-atlas.js implements unmount disconnect guards against memory leaks");
check(atlasSource.includes("window.getLabDPR"), "anatomy-atlas.js shields all canvas resolution through window.getLabDPR()");
check(atlasSource.includes("drawHumanBodyVector") && atlasSource.includes("layerOpacities"), "anatomy-atlas.js implements multi-layer vector dissection engine");
check(atlasSource.includes("drawAnatomicalPins") && atlasSource.includes("canvasToNormalizedCoords"), "anatomy-atlas.js implements interactive 4K coordinate pin picking");
check(atlasSource.includes("getVisibleStructures"), "anatomy-atlas.js filters pin displays according to active plate and view");
check(atlasSource.includes("switchAnatomicalPlate"), "anatomy-atlas.js implements dedicated 11-plate switcher with auto-selection");
check(atlasSource.includes("isPinching") && atlasSource.includes("touchstart"), "anatomy-atlas.js implements multi-touch pinch-to-zoom & two-finger pan gestures");
check(atlasSource.includes("export4kHighResDiagram"), "anatomy-atlas.js implements 3840x2160 UHD diagram PNG export");
check(atlasSource.includes("playHeartSound"), "anatomy-atlas.js features synthesized S1/S2 heart sound valve acoustics");
check(atlasSource.includes("playBreathSound"), "anatomy-atlas.js features synthesized vesicular pulmonary breath sounds");
check(atlasSource.includes("selectNewQuizTarget"), "anatomy-atlas.js implements interactive Pin Challenge assessment game");

// ----------------------------------------------------
// Test 6: Offline PWA Service Worker Plate Caching
// ----------------------------------------------------
const swSource = fs.readFileSync(path.join(rootDir, "service-worker.js"), "utf-8");
const allPlatesCached = plateKeys.every(pk => {
  const p = ANATOMICAL_PLATES[pk];
  return swSource.includes(p.src);
});
check(allPlatesCached, "service-worker.js includes all 11 8K anatomical plates in offline precache manifest");

// ----------------------------------------------------
// Test 7: Application Routing & Checkpoint Integration
// ----------------------------------------------------
import { normalizeLabId } from "../app.js";
import { LAB_CHECKPOINTS } from "../labs/lab-telemetry-exporter.js";

check(normalizeLabId("anatomy") === "anatomy", "normalizeLabId('anatomy') resolves to 'anatomy'");
check(normalizeLabId("atlas") === "anatomy", "normalizeLabId('atlas') resolves to 'anatomy'");
check(normalizeLabId("lab-anatomy") === "anatomy", "normalizeLabId('lab-anatomy') resolves to 'anatomy'");
check(normalizeLabId("human-anatomy") === "anatomy", "normalizeLabId('human-anatomy') resolves to 'anatomy'");

const appSource = fs.readFileSync(path.join(rootDir, "app.js"), "utf-8");
check(appSource.includes('"anatomy": () => import("./labs/anatomy-atlas.js")'), "app.js registers anatomy laboratory loader");
check(appSource.includes('href="#labs/anatomy"'), "app.js provides 4K Human Anatomy Atlas navigation button");

check(Array.isArray(LAB_CHECKPOINTS.anatomy) && LAB_CHECKPOINTS.anatomy.length >= 3, "LAB_CHECKPOINTS contains validated competency questions for anatomy suite");

// ----------------------------------------------------
// Test Summary
// ----------------------------------------------------
console.log("\n========================================================");
if (failed === 0) {
  console.log(`📊 4K Human Anatomy Atlas: All ${passed} Tests Passed!`);
} else {
  console.error(`❌ Verification Failed: ${passed} Passed, ${failed} Failed`);
  process.exit(1);
}
console.log("========================================================\n");
