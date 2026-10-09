// Edugates-ClipSAT Science Labs - Unit Test Suite for Classified Lab Navigation & Touch Screen Zoom
// Verifies:
// 1. All virtual labs are classified by Chemistry (che), Physics (phy), Biology (bio).
// 2. All labs are organized alphabetically (A → Z) within each classification.
// 3. Adding new labs to VIRTUAL_LABS_REGISTRY dynamically categorizes and sorts them alphabetically.
// 4. Universal Touch Screen Pinch-to-Zoom Engine supports zooming in (>1.0) and whole-screen scaling (<1.0 down to 40%).

import { 
  VIRTUAL_LABS_REGISTRY, 
  LAB_SUBJECT_CONFIG, 
  getClassifiedVirtualLabs, 
  registerVirtualLab, 
  renderClassifiedLabNavHTML,
  normalizeLabId
} from "../app.js";

import { 
  getTouchZoomState, 
  setScale, 
  zoomIn, 
  zoomOut, 
  resetZoom, 
  panBy,
  initTouchZoom,
  hideZoomHud,
  showZoomHud,
  toggleZoomHud,
  isZoomHudDismissed
} from "../utils/touch-zoom.js";

let passed = 0;
let failed = 0;

function check(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log("\n========================================================");
console.log("🧪 Virtual Laboratories Classification & Alphabetization Suite");
console.log("========================================================\n");

// ----------------------------------------------------
// Test 1: Registry Integrity & Subject Classification
// ----------------------------------------------------
check(Array.isArray(VIRTUAL_LABS_REGISTRY), "VIRTUAL_LABS_REGISTRY is an array");
check(VIRTUAL_LABS_REGISTRY.length === 45, `VIRTUAL_LABS_REGISTRY contains all 45 platform laboratories (Found: ${VIRTUAL_LABS_REGISTRY.length})`);

const classified = getClassifiedVirtualLabs();
check(Array.isArray(classified.chem) && classified.chem.length === 15, `Chemistry classification contains exactly 15 laboratories (Found: ${classified.chem?.length})`);
check(Array.isArray(classified.phys) && classified.phys.length === 15, `Physics classification contains exactly 15 laboratories (Found: ${classified.phys?.length})`);
check(Array.isArray(classified.bio) && classified.bio.length === 15, `Biology classification contains exactly 15 laboratories (Found: ${classified.bio?.length})`);

// ----------------------------------------------------
// Test 2: Strict Alphabetical Ordering (A to Z)
// ----------------------------------------------------
function isSortedAlphabetically(list) {
  for (let i = 1; i < list.length; i++) {
    const prev = list[i - 1].title;
    const curr = list[i].title;
    if (prev.localeCompare(curr, undefined, { numeric: true, sensitivity: "base" }) > 0) {
      console.error(`Sort violation: "${prev}" comes before "${curr}"`);
      return false;
    }
  }
  return true;
}

check(isSortedAlphabetically(classified.chem), "Chemistry laboratories are strictly arranged in alphabetical order (A → Z)");
check(isSortedAlphabetically(classified.phys), "Physics laboratories are strictly arranged in alphabetical order (A → Z)");
check(isSortedAlphabetically(classified.bio), "Biology laboratories are strictly arranged in alphabetical order (A → Z)");

// Verify specific alphabetical endpoints
check(classified.chem[0].title === "Acid-Base Titration", `Chemistry starts with "Acid-Base Titration" (Found: "${classified.chem[0].title}")`);
check(classified.chem[classified.chem.length - 1].title === "VSEPR 3D Modeler", `Chemistry ends with "VSEPR 3D Modeler" (Found: "${classified.chem[classified.chem.length - 1].title}")`);

check(classified.phys[0].title === "Coulomb & Electric Fields", `Physics starts with "Coulomb & Electric Fields" (Found: "${classified.phys[0].title}")`);
check(classified.phys[classified.phys.length - 1].title === "Wave Interference & Slits", `Physics ends with "Wave Interference & Slits" (Found: "${classified.phys[classified.phys.length - 1].title}")`);

check(classified.bio[0].title === "4K Human Anatomy Atlas", `Biology starts with "4K Human Anatomy Atlas" (Found: "${classified.bio[0].title}")`);
check(classified.bio[classified.bio.length - 1].title === "Ultra-HD Microscope", `Biology ends with "Ultra-HD Microscope" (Found: "${classified.bio[classified.bio.length - 1].title}")`);

// ----------------------------------------------------
// Test 3: Scalability - Adding New Labs Dynamically
// ----------------------------------------------------
console.log("\n--- Testing Dynamic Lab Registry Scalability ---");
const initialChemCount = classified.chem.length;

// Add a new lab that starts with "A" before "Acid-Base Titration" (e.g. "Absolute Zero Cryogenics")
registerVirtualLab({
  id: "chem-cryo",
  subject: "chem",
  title: "Absolute Zero & Cryogenics",
  icon: "❄️",
  ariaLabel: "Absolute Zero and Cryogenic Thermodynamics Lab"
});

const updatedClassified = getClassifiedVirtualLabs();
check(updatedClassified.chem.length === initialChemCount + 1, "Registering a new lab automatically increments subject count");
check(isSortedAlphabetically(updatedClassified.chem), "Subject list remains strictly alphabetical after adding new lab");
check(updatedClassified.chem[0].id === "chem-cryo", `Newly added lab automatically slotted into correct alphabetical index (First item: "${updatedClassified.chem[0].title}")`);

// Add a new biology lab that starts with "Z" (e.g. "Zoology & Ecology")
registerVirtualLab({
  id: "bio-zoology",
  subject: "bio",
  title: "Zoology Taxonomy & Field Biomes",
  icon: "🦁",
  ariaLabel: "Zoology Taxonomy and Biomes Lab"
});

const updatedBio = getClassifiedVirtualLabs().bio;
check(isSortedAlphabetically(updatedBio), "Biology list remains strictly alphabetical after adding new lab");
check(updatedBio[updatedBio.length - 1].id === "bio-zoology", `Newly added lab automatically slotted at end of alphabetical list: "${updatedBio[updatedBio.length - 1].title}"`);

// Clean up test additions
const cryoIdx = VIRTUAL_LABS_REGISTRY.findIndex(l => l.id === "chem-cryo");
if (cryoIdx >= 0) VIRTUAL_LABS_REGISTRY.splice(cryoIdx, 1);
const zooIdx = VIRTUAL_LABS_REGISTRY.findIndex(l => l.id === "bio-zoology");
if (zooIdx >= 0) VIRTUAL_LABS_REGISTRY.splice(zooIdx, 1);

// ----------------------------------------------------
// Test 4: HTML Rendering of Classified Navigation
// ----------------------------------------------------
console.log("\n--- Testing Classified Navigation HTML Output ---");
const html = renderClassifiedLabNavHTML("anatomy", "all");
check(html.includes('data-subject-filter="all"'), "HTML contains 'All' subject filter pill");
check(html.includes('data-subject-filter="chem"'), "HTML contains 'Chemistry' subject filter pill");
check(html.includes('data-subject-filter="phys"'), "HTML contains 'Physics' subject filter pill");
check(html.includes('data-subject-filter="bio"'), "HTML contains 'Biology' subject filter pill");
check(html.includes('data-subject="chem"'), "HTML contains Chemistry subject section");
check(html.includes('data-subject="phys"'), "HTML contains Physics subject section");
check(html.includes('data-subject="bio"'), "HTML contains Biology subject section");
check(html.includes('Organized Alphabetically (A → Z)'), "HTML contains Alphabetical organization badge");
check(html.includes('href="#labs/anatomy"'), "HTML links directly to 4K Human Anatomy Atlas deep-route");

// ----------------------------------------------------
// Test 5: Universal Touch Screen Zoom Engine
// ----------------------------------------------------
console.log("\n========================================================");
console.log("🖐️ Universal Touch Screen Pinch-to-Zoom Engine Verification");
console.log("========================================================\n");

// Mock DOM elements for Headless Node test environment
globalThis.document = {
  getElementById: (id) => ({
    id,
    style: { transform: "", transformOrigin: "", transition: "" },
    classList: { add: () => {}, remove: () => {}, toggle: () => {} }
  }),
  body: {
    classList: { add: () => {}, remove: () => {}, toggle: () => {} },
    appendChild: () => {}
  },
  createElement: (tag) => ({
    tagName: tag,
    className: "",
    style: {},
    setAttribute: () => {},
    innerHTML: "",
    querySelector: () => null,
    querySelectorAll: () => []
  }),
  addEventListener: () => {}
};

globalThis.window = {
  innerWidth: 1920,
  innerHeight: 1080,
  addEventListener: () => {}
};

initTouchZoom();

const initialZoom = getTouchZoomState();
check(initialZoom.scale === 1.0, `Initial touch zoom scale is 1.0 (Found: ${initialZoom.scale})`);
check(!initialZoom.isZoomed, "Initial state reports not zoomed");

// Test Zoom In (> 1.0)
zoomIn(0.5);
const zoomedIn = getTouchZoomState();
check(zoomedIn.scale === 1.5, `zoomIn() increases scale to 1.5 (Found: ${zoomedIn.scale})`);
check(zoomedIn.isZoomed, "State reports isZoomed = true when enlarged");

// Test Zoom Out - Whole Screen Appearing Smaller (< 1.0 down to 0.5)
setScale(0.65, 960, 540);
const zoomedOut = getTouchZoomState();
check(zoomedOut.scale === 0.65, `setScale(0.65) successfully shrinks whole screen smaller (Found: ${zoomedOut.scale})`);
check(zoomedOut.isZoomed, "State reports isZoomed = true when whole screen is shrunk");

// Test Reset Zoom (Fit whole screen back to 100% and center view)
resetZoom(false);
const resetState = getTouchZoomState();
check(resetState.scale === 1.0, `resetZoom() returns scale to exactly 1.0 (Found: ${resetState.scale})`);
check(!resetState.isZoomed, "resetZoom() clears isZoomed state");
check(resetState.panX === 0 && resetState.panY === 0, `resetZoom() centralizes view to pan (0, 0) (Found: ${resetState.panX}, ${resetState.panY})`);

// Test Center on Reset from Deviated Pan State
panBy(150, -90);
const pannedState = getTouchZoomState();
check(pannedState.panX === 150 && pannedState.panY === -90, `panBy() shifts pan coordinates to (150, -90) (Found: ${pannedState.panX}, ${pannedState.panY})`);
check(pannedState.isZoomed, "State reports isZoomed = true when panned off-center");

resetZoom(false);
const centeredState = getTouchZoomState();
check(centeredState.scale === 1.0, "resetZoom() resets scale to 1.0");
check(centeredState.panX === 0 && centeredState.panY === 0, `resetZoom() centralizes panned view back to (0, 0) (Found: ${centeredState.panX}, ${centeredState.panY})`);
check(!centeredState.isZoomed, "resetZoom() clears isZoomed flag when centered");

// Test 100% zoom option with focal coordinates also centralizes view
setScale(1.8, 640, 360);
panBy(-75, 45);
check(getTouchZoomState().scale === 1.8, "Zoomed into 180%");
// Emulate clicking 100% option (which passes winW/2, winH/2)
setScale(1.0, 960, 540, false);
const option100State = getTouchZoomState();
check(option100State.scale === 1.0, `setScale(1.0) returns scale to 1.0 (Found: ${option100State.scale})`);
check(option100State.panX === 0 && option100State.panY === 0, `setScale(1.0) centralizes view back to (0, 0) regardless of focal coordinates (Found: ${option100State.panX}, ${option100State.panY})`);
check(!option100State.isZoomed, "setScale(1.0) clears isZoomed state");

// Test Bounds: Min scale is clamped to 0.40 and Max scale is clamped to 3.50
setScale(0.1);
check(getTouchZoomState().scale === 0.40, `Scale cannot go below MIN_SCALE (Clamped at 0.40, Found: ${getTouchZoomState().scale})`);

setScale(10.0);
check(getTouchZoomState().scale === 3.50, `Scale cannot exceed MAX_SCALE (Clamped at 3.50, Found: ${getTouchZoomState().scale})`);

resetZoom(false);

// Test Hide / Dismiss and Restore HUD Capabilities
console.log("\n--- Testing Hide / Dismiss and Mini-Trigger Restore Capabilities ---");
hideZoomHud();
check(isZoomHudDismissed() === true, "hideZoomHud() sets isZoomHudDismissed() to true");

showZoomHud();
check(isZoomHudDismissed() === false, "showZoomHud() sets isZoomHudDismissed() to false");

toggleZoomHud();
check(isZoomHudDismissed() === true, "toggleZoomHud() toggles dismissed to true");
toggleZoomHud();
check(isZoomHudDismissed() === false, "toggleZoomHud() toggles dismissed back to false");

check(typeof globalThis.window.TouchZoom.hide === "function", "window.TouchZoom.hide() is exposed");
check(typeof globalThis.window.TouchZoom.show === "function", "window.TouchZoom.show() is exposed");
check(typeof globalThis.window.TouchZoom.toggle === "function", "window.TouchZoom.toggle() is exposed");
check(typeof globalThis.window.TouchZoom.isDismissed === "function", "window.TouchZoom.isDismissed() is exposed");

globalThis.window.TouchZoom.hide();
check(globalThis.window.TouchZoom.isDismissed() === true, "window.TouchZoom.hide() updates isDismissed() state");
globalThis.window.TouchZoom.show();
check(globalThis.window.TouchZoom.isDismissed() === false, "window.TouchZoom.show() updates isDismissed() state");

// ----------------------------------------------------
// Summary
// ----------------------------------------------------
console.log("\n========================================================");
if (failed === 0) {
  console.log(`📊 All ${passed} Tests Passed Successfully!`);
} else {
  console.error(`❌ Verification Failed: ${passed} Passed, ${failed} Failed`);
  process.exit(1);
}
console.log("========================================================\n");
