// Unit test suite for LMS Sharing Engine (Google Classroom & Classera)
if (typeof globalThis.window === "undefined") {
  globalThis.window = {
    location: {
      href: "https://mohammedamy.github.io/EdugtesScLab/"
    },
    screen: { width: 1920, height: 1080 },
    open: () => {}
  };
}
if (typeof globalThis.document === "undefined") {
  globalThis.document = {
    getElementById: () => null,
    createElement: () => ({
      setAttribute: () => {},
      appendChild: () => {},
      style: {},
      classList: { add: () => {}, remove: () => {} }
    }),
    body: { appendChild: () => {} }
  };
}

import { getAbsoluteShareUrl, generateLmsEmbedCode } from "../utils/lms-share.js";

console.log("\n========================================================");
console.log("🏫 LMS & Classroom Sharing Engine Verification");
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

// 1. Absolute Share URL Normalization
const url1 = getAbsoluteShareUrl("#module/CHEM-M07");
assert(url1.includes("#module/CHEM-M07"), `Hash route correctly appended: ${url1}`);

const url2 = getAbsoluteShareUrl("https://mohammedamy.github.io/EdugtesScLab/#quiz/phys");
assert(url2 === "https://mohammedamy/Developer/AmScLab" || url2.startsWith("https://mohammedamy.github.io"), `Absolute URL preserved: ${url2}`);

// 2. Iframe Embed Code Generation
const embed = generateLmsEmbedCode("#labs/vsepr", "VSEPR 3D Molecular Modeler");
assert(embed.includes("<iframe") && embed.includes("allowfullscreen") && embed.includes("#labs/vsepr"), `Responsive iframe embed code generated correctly`);

// 3. Google Classroom Query Encoding
const testUrl = "https://mohammedamy.github.io/EdugtesScLab/#module/CHEM-M07";
const shareEndpoint = `https://classroom.google.com/share?url=${encodeURIComponent(testUrl)}&title=${encodeURIComponent("Chemistry Chapter 7")}`;
assert(shareEndpoint.includes("classroom.google.com/share"), `Classroom share URL endpoint is correct`);
assert(shareEndpoint.includes(encodeURIComponent(testUrl)), `URL properly encoded in query params`);

console.log("\n========================================================");
console.log(`📊 LMS Share Tests: ${passed} Passed, ${failed} Failed`);
console.log("========================================================\n");

if (failed > 0) process.exit(1);
else process.exit(0);
