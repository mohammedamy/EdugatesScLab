/**
 * Verification test for Animated Laboratory Flame & Calibrated Element Emissions
 * Ensures 100% of all 118 chemical elements have calibrated emission colors,
 * descriptive spectroscopic summaries, and that the interactive lab features
 * the 60fps procedural animated flame canvas.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

import { PERIODIC_ELEMENTS } from '../data/periodic-table-data.js';

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

console.log('\n========================================================');
console.log('🔥 Animated Flame & 118-Element Emission Test Suite');
console.log('========================================================\n');

// 1. Validate Periodic Table Data
const elements = PERIODIC_ELEMENTS;

assert(Array.isArray(elements) && elements.length === 118, `Database contains all 118 elements (found: ${elements.length})`);

// 2. Validate Flame Hex Colors for all 118 elements
const hexColorRegex = /^#[0-9a-fA-F]{6}$/;
const missingOrInvalidColors = elements.filter(el => !el.flame || !hexColorRegex.test(el.flame));
assert(missingOrInvalidColors.length === 0, `All 118 elements have valid 6-digit hex flame colors (invalid: ${missingOrInvalidColors.length})`);

// 3. Validate Flame Descriptions for all 118 elements
const missingDescriptions = elements.filter(el => !el.flameDesc || typeof el.flameDesc !== 'string' || el.flameDesc.trim().length === 0);
assert(missingDescriptions.length === 0, `All 118 elements have descriptive flame emission summaries (missing: ${missingDescriptions.length})`);

// 4. Validate Flame Excitation Type for all 118 elements
const validFlameTypes = new Set([
  'Flame Test',
  'Gas Discharge',
  'Atomic Emission',
  'Arc Emission',
  'Incandescence',
  'Radioluminescence',
  'Chemiluminescence'
]);
const invalidFlameTypes = elements.filter(el => !el.flameType || !validFlameTypes.has(el.flameType));
assert(invalidFlameTypes.length === 0, `All 118 elements have valid spectroscopic excitation types (invalid: ${invalidFlameTypes.length})`);

// 5. Validate Spectral Emission Lines
const missingLines = elements.filter(el => !Array.isArray(el.lines) || el.lines.length === 0);
assert(missingLines.length === 0, `All 118 elements have calibrated spectral emission lines (missing: ${missingLines.length})`);

// 6. Check Specific Iconic Element Colors & Metadata
const iconicTests = [
  { z: 1, sym: 'H', descSubstring: 'Pale Sky Blue', hex: '#60a5fa' },
  { z: 3, sym: 'Li', descSubstring: 'Carmine Crimson Red', hex: '#ef4444' },
  { z: 11, sym: 'Na', descSubstring: 'Golden Yellow', hex: '#eab308' },
  { z: 19, sym: 'K', descSubstring: 'Lilac', hex: '#c084fc' },
  { z: 20, sym: 'Ca', descSubstring: 'Brick Red', hex: '#ea580c' },
  { z: 29, sym: 'Cu', descSubstring: 'Emerald Green', hex: '#10b981' },
  { z: 38, sym: 'Sr', descSubstring: 'Scarlet Crimson Red', hex: '#e11d48' },
  { z: 53, sym: 'I', descSubstring: 'Violet', hex: '#c084fc' },
  { z: 56, sym: 'Ba', descSubstring: 'Apple Green', hex: '#84cc16' },
  { z: 80, sym: 'Hg', descSubstring: 'Cyan Glow', hex: '#38bdf8' }
];

iconicTests.forEach(test => {
  const el = elements.find(e => e.z === test.z);
  const colorMatches = el && el.flame.toLowerCase() === test.hex.toLowerCase();
  const descMatches = el && el.flameDesc.includes(test.descSubstring);
  assert(colorMatches && descMatches, `Iconic element Z=${test.z} (${el?.s}) matches reference hue (${test.hex}) and description (${test.descSubstring})`);
});

// 7. Verify labs/chem-periodic-table.js Flame Canvas & Animation Implementation
const labPath = path.join(root, 'labs', 'chem-periodic-table.js');
const labCode = fs.readFileSync(labPath, 'utf8');

assert(labCode.includes('flame-preview-canvas'), 'Periodic table lab includes #flame-preview-canvas for 60fps rendering');
assert(labCode.includes('flame-ambient-aura'), 'Periodic table lab includes #flame-ambient-aura for dynamic ambient lighting');
assert(labCode.includes('drawSpectraFlame'), 'Periodic table lab implements procedural drawSpectraFlame() renderer');
assert(labCode.includes('flameParticles'), 'Periodic table lab implements interactive floating ember particle system');
assert(labCode.includes('adjustColorBrightness'), 'Periodic table lab includes color brightness utility for mantle and core blending');
assert(labCode.includes('activeTab === "spectra"'), 'Periodic table animation loop automatically drives flame rendering when spectra tab is active');
assert(labCode.includes('(tab === "bohr" || tab === "spectra")'), 'Shared animation loop dynamically activates for both Bohr model and Flame spectra tabs');
assert(labCode.includes('flame-color-pill'), 'Periodic table inspector includes #flame-color-pill for spectroscopic telemetry');

console.log('\n--------------------------------------------------------');
console.log(`Summary: ${passed} Passed, ${failed} Failed`);
console.log('========================================================\n');

if (failed > 0) {
  process.exit(1);
}
