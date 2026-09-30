// tests/test-periodic-table.js
// Automated Verification Suite for IUPAC 118 Chemical Elements Master Database,
// Grid Coordinates, Quantum Bohr Shells, 4K Specimen Telemetry, and Interactive DOM Controls.

import { PERIODIC_ELEMENTS, CATEGORY_METADATA } from "../data/periodic-table-data.js";
import { initPeriodicTableLab } from "../labs/chem-periodic-table.js";

console.log("\n========================================================");
console.log("⚛️ Precision Periodic Table & Quantum Orbitals Test Suite");
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

// 1. Element Count & Atomic Number Continuity
assert(PERIODIC_ELEMENTS.length === 118, `Database contains exactly 118 elements (found: ${PERIODIC_ELEMENTS.length})`);

const atomicNumbers = PERIODIC_ELEMENTS.map(e => e.z);
const isContiguous = atomicNumbers.every((z, idx) => z === idx + 1);
assert(isContiguous, "Atomic numbers strictly range from Z = 1 (Hydrogen) to Z = 118 (Oganesson) with no gaps");

// 2. Element Metadata Integrity
let missingFields = 0;
let invalidStates = 0;
let invalidMasses = 0;
let invalidOccurrences = 0;
let invalidUses = 0;
let invalidImages = 0;
let invalidShells = 0;

const validStates = new Set(["Solid", "Liquid", "Gas", "Synthetic"]);
const validCategories = new Set(Object.keys(CATEGORY_METADATA));

// Check grid coordinate uniqueness
const gridCoordSet = new Set();
let duplicateGridCoords = 0;

PERIODIC_ELEMENTS.forEach(el => {
  // Required fields
  if (!el.z || !el.s || !el.n || !el.m || !el.cat || !el.period || !el.group || !el.block || !el.gridRow || !el.gridCol) {
    missingFields++;
  }

  // State
  if (!validStates.has(el.state)) {
    invalidStates++;
  }

  // Category
  if (!validCategories.has(el.cat)) {
    console.error(`Invalid category: ${el.cat} for ${el.n}`);
  }

  // Mass
  if (typeof el.m !== "number" || el.m <= 0) {
    invalidMasses++;
  }

  // Occurrences & Uses text length
  if (!el.occurrence || el.occurrence.length < 20) {
    invalidOccurrences++;
  }
  if (!el.uses || el.uses.length < 20) {
    invalidUses++;
  }

  // Images
  if (!el.image || !el.image.startsWith("http") || !el.imageDesc || el.imageDesc.length < 10) {
    invalidImages++;
  }

  // Shells
  if (!Array.isArray(el.shells) || el.shells.length === 0) {
    invalidShells++;
  } else {
    const totalShellElectrons = el.shells.reduce((a, b) => a + b, 0);
    if (totalShellElectrons !== el.z) {
      invalidShells++;
      console.error(`Shell electron mismatch for ${el.n} (Z=${el.z}): shells sum to ${totalShellElectrons}`);
    }
  }

  // Coordinates
  const coordKey = `${el.gridRow},${el.gridCol}`;
  if (gridCoordSet.has(coordKey)) {
    duplicateGridCoords++;
    console.error(`Duplicate grid position (${coordKey}) for element ${el.s} (Z=${el.z})`);
  }
  gridCoordSet.add(coordKey);
});

assert(missingFields === 0, `All 118 elements have complete essential metadata fields (missing: ${missingFields})`);
assert(invalidStates === 0, `All elements have standard IUPAC states: Solid, Liquid, Gas, or Synthetic (invalid: ${invalidStates})`);
assert(invalidMasses === 0, `All elements have positive standard atomic weights (invalid: ${invalidMasses})`);
assert(invalidOccurrences === 0, `All 118 elements have rich natural occurrence descriptions (invalid: ${invalidOccurrences})`);
assert(invalidUses === 0, `All 118 elements have detailed real-world application descriptions (invalid: ${invalidUses})`);
assert(invalidImages === 0, `All 118 elements have high-res photographic image URLs and captions (invalid: ${invalidImages})`);
assert(invalidShells === 0, `All 118 elements have Bohr electron shell arrays accurately summing to Z (invalid: ${invalidShells})`);
assert(duplicateGridCoords === 0, `All 118 elements have distinct, non-overlapping grid layout coordinates (duplicates: ${duplicateGridCoords})`);

// 3. Category Metadata Verification
assert(Object.keys(CATEGORY_METADATA).length === 10, "All 10 chemical families are defined in CATEGORY_METADATA");
Object.entries(CATEGORY_METADATA).forEach(([catKey, meta]) => {
  assert(meta.name && meta.color && meta.desc, `Category '${catKey}' has valid name, color, and description`);
});

// 4. Lanthanides & Actinides Layout Placement
const lanthanides = PERIODIC_ELEMENTS.filter(e => e.cat === "lanthanide");
const actinides = PERIODIC_ELEMENTS.filter(e => e.cat === "actinide");

assert(lanthanides.length === 15, `Lanthanide series contains all 15 elements (Z = 57 La to 71 Lu) (found: ${lanthanides.length})`);
assert(actinides.length === 15, `Actinide series contains all 15 elements (Z = 89 Ac to 103 Lr) (found: ${actinides.length})`);

const allLanthanidesRow9 = lanthanides.every(e => e.gridRow === 9 && e.gridCol >= 4 && e.gridCol <= 18);
const allActinidesRow10 = actinides.every(e => e.gridRow === 10 && e.gridCol >= 4 && e.gridCol <= 18);

assert(allLanthanidesRow9, "All 15 Lanthanides are positioned on Row 9 spanning columns 4 to 18");
assert(allActinidesRow10, "All 15 Actinides are positioned on Row 10 spanning columns 4 to 18");

// 5. Verify chem-periodic-table.js lab initialization function
assert(typeof initPeriodicTableLab === "function", "initPeriodicTableLab is exported as a function from labs/chem-periodic-table.js");

console.log("\n--------------------------------------------------------");
console.log(`Summary: ${passed} Passed, ${failed} Failed`);
console.log("========================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
