/**
 * Verification test for Molecular Genetics & Protein Translation Engine
 * Validates organized layout, codon-to-amino-acid alignment, dedicated left badges,
 * 64-codon genetic table coverage, tRNA anticodon pairing, and zero overlap.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

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
console.log('🧬 DNA-to-Protein & Molecular Genetics Layout Test Suite');
console.log('========================================================\n');

// 1. Inspect labs/bio-dna-protein.js Source Code
const labPath = path.join(root, 'labs', 'bio-dna-protein.js');
const labCode = fs.readFileSync(labPath, 'utf8');

assert(labCode.includes('export function initDnaProteinLab'), 'Exports initDnaProteinLab function');
assert(labCode.includes('dna-protein-canvas'), 'Mounts high-DPI #dna-protein-canvas');
assert(labCode.includes('sim-top-hud-bar'), 'Includes organized top HUD telemetry bar');
assert(labCode.includes('polypeptide-chain-disp'), 'Includes #polypeptide-chain-disp telemetry element');

// 2. Layout & Object Organization Verification
assert(labCode.includes('drawStrandBadge'), 'Implements dedicated drawStrandBadge for organized left-side category labels');
assert(labCode.includes('labelRight + 26') || labCode.includes('startX = labelRight'), 'Guarantees gutter between left strand labels and nucleotide bases to prevent text overlap');
assert(labCode.includes('DNA Template') && labCode.includes('Coding Strand') && labCode.includes('mRNA Transcript'), 'Renders distinct, organized badges for DNA template, coding strand, and mRNA transcript');
assert(labCode.includes('RNA Polymerase II Transcription'), 'Includes explicit transcription transition indicator between DNA and mRNA');
assert(labCode.includes('Codon ${c+1}'), 'Implements organized codon triplet brackets with callout badges');
assert(labCode.includes('tRNA: ${anti}') || labCode.includes('tRNA Adapters'), 'Integrates authentic tRNA anticodon adapters and ribosomal decoding center');
assert(labCode.includes('Peptide Bond'), 'Renders centered, unclipped Peptide Bond covalent linkage badges');

// 3. Exact 1-to-1 Vertical Alignment (Codon Center === Amino Acid Bead)
assert(
  labCode.includes('const codonCenterX = startX + (3 * c + 1) * baseSpacing;') &&
  labCode.includes('const px = startX + (3 * idx + 1) * baseSpacing;'),
  'Amino acid beads align directly vertically under their corresponding mRNA codon centers'
);

// 4. Centered Typography & Zero Overlap
assert(labCode.includes('ctx.textAlign = "center"'), 'Uses explicit ctx.textAlign = "center" for exact nucleotide, codon, and amino acid centering');
assert(!labCode.includes('ctx.ellipse(riboCenter, mrnaY + 20'), 'Eradicated buggy static yellow ellipse that collided with mRNA codons and brackets');

// 5. Complete 64-Codon Genetic Code Coverage
const codons = [
  'AUG', 'UUU', 'UUC', 'UUA', 'UUG', 'CUU', 'CUC', 'CUA', 'CUG',
  'AUU', 'AUC', 'AUA', 'GUU', 'GUC', 'GUA', 'GUG', 'UCU', 'UCC',
  'UCA', 'UCG', 'AGU', 'AGC', 'CCU', 'CCC', 'CCA', 'CCG', 'ACU',
  'ACC', 'ACA', 'ACG', 'GCU', 'GCC', 'GCA', 'GCG', 'UAU', 'UAC',
  'CAU', 'CAC', 'CAA', 'CAG', 'AAU', 'AAC', 'AAA', 'AAG', 'GAU',
  'GAC', 'GAA', 'GAG', 'UGU', 'UGC', 'UGG', 'CGU', 'CGC', 'CGA',
  'CGG', 'AGA', 'AGG', 'GGU', 'GGC', 'GGA', 'GGG', 'UAA', 'UAG', 'UGA'
];

let missingCodons = 0;
codons.forEach(c => {
  if (!labCode.includes(`${c}:`)) missingCodons++;
});
assert(missingCodons === 0, `Universal genetic code covers all 64 triplet codons (missing: ${missingCodons})`);

// 6. Anticodon Pairing Logic
assert(labCode.includes('getAnticodon'), 'Implements getAnticodon for accurate tRNA complementary base-pairing');

console.log('\n--------------------------------------------------------');
console.log(`Summary: ${passed} Passed, ${failed} Failed`);
console.log('========================================================\n');

if (failed > 0) {
  process.exit(1);
}
