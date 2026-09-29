// Edugates-ClipSAT Science Labs - Unit Test Suite for QR Code Engine
// Validates ISO/IEC 18004 QR generation, matrix modules, SVG output, and scannable link resolution

import { generateQRSvg, generateQRMatrix, qrcode } from "../utils/qr-code.js";
import { getAbsoluteShareUrl } from "../utils/lms-share.js";

console.log("\n========================================================");
console.log("📱 QR Code Generator & Mobile Scanning Engine Verification");
console.log("========================================================\n");

let passed = 0;
let failed = 0;

function assert(cond, desc) {
  if (cond) {
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${desc}`);
    failed++;
  }
}

// 1. Basic URL Encoding
const testUrl = "https://mohammedamy.github.io/EdugtesScLab/#quiz/chem";
const svg1 = generateQRSvg(testUrl);

assert(typeof svg1 === "string" && svg1.startsWith("<svg") && svg1.endsWith("</svg>"),
  "generateQRSvg returns valid, self-contained SVG markup");

assert(svg1.includes("viewBox=") && svg1.includes("<path d="),
  "SVG uses scalable viewBox and high-performance consolidated path rendering");

assert(svg1.includes('shape-rendering: crispEdges'),
  "SVG includes crispEdges shape rendering for high camera contrast");

// 2. Matrix Module Integrity (Finder Pattern Verification)
const matrix = generateQRMatrix(testUrl);
assert(Array.isArray(matrix) && matrix.length > 20 && matrix.length === matrix[0].length,
  `generateQRMatrix produces valid square module grid (Size: ${matrix.length}x${matrix.length})`);

// Top-left finder pattern 7x7 check: row 0 must be 1,1,1,1,1,1,1
const tlFinderRow0 = matrix[0].slice(0, 7);
assert(tlFinderRow0.every(v => v === 1),
  "Top-left finder pattern row 0 matches ISO standard [1,1,1,1,1,1,1]");

// row 1: 1, 0, 0, 0, 0, 0, 1
const tlFinderRow1 = matrix[1].slice(0, 7);
assert(tlFinderRow1[0] === 1 && tlFinderRow1[6] === 1 && tlFinderRow1.slice(1, 6).every(v => v === 0),
  "Top-left finder pattern row 1 contains hollow white separator");

// 3. Custom Color Options (LMS Share & Print Styles)
const coloredSvg = generateQRSvg(testUrl, {
  fgColor: "#0284c7",
  bgColor: "#ffffff",
  margin: 3
});
assert(coloredSvg.includes('fill="#0284c7"') && coloredSvg.includes('fill="#ffffff"'),
  "generateQRSvg respects custom foreground (#0284c7) and background colors");

// 4. Large Payload & Multi-Lesson Curriculum Scope Deep-Link (> 500 characters)
const longScope = Array.from({ length: 45 }, (_, i) => `CHEM-M${String(i + 1).padStart(2, "0")}-L1`).join(",");
const longUrl = `https://mohammedamy.github.io/EdugtesScLab/#quiz?scope=${encodeURIComponent(longScope)}&subj=CHEM`;
const longSvg = generateQRSvg(longUrl);

assert(typeof longSvg === "string" && longSvg.length > 10000,
  `Successfully encodes large multi-lesson scope (${longUrl.length} bytes) without truncation`);

// 5. URL Normalization for Student Mobile Scanning
const localShareUrl = getAbsoluteShareUrl("#module/CHEM-M02");
assert(localShareUrl.startsWith("https://mohammedamy.github.io/EdugtesScLab/"),
  `Local routes normalize to public canonical URL for student phone scanning: ${localShareUrl}`);

console.log("\n========================================================");
console.log(`📊 QR Code Tests: ${passed} Passed, ${failed} Failed`);
console.log("========================================================\n");

if (failed > 0) process.exit(1);
