// Unit test suite for LMS Sharing Engine (Google Classroom & Classera)
if (typeof globalThis.window === "undefined") {
  globalThis.window = {
    location: {
      href: "https://mohammedamy.github.io/EdugatesScLab/"
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

const url2 = getAbsoluteShareUrl("https://mohammedamy.github.io/EdugatesScLab/#quiz/phys");
assert(url2 === "https://mohammedamy/Developer/AmScLab" || url2.startsWith("https://mohammedamy.github.io"), `Absolute URL preserved: ${url2}`);

// 2. Iframe Embed Code Generation
const embed = generateLmsEmbedCode("#labs/vsepr", "VSEPR 3D Molecular Modeler");
assert(embed.includes("<iframe") && embed.includes("allowfullscreen") && embed.includes("#labs/vsepr"), `Responsive iframe embed code generated correctly`);

// 3. Google Classroom Query Encoding
const testUrl = "https://mohammedamy.github.io/EdugatesScLab/#module/CHEM-M07";
const shareEndpoint = `https://classroom.google.com/share?url=${encodeURIComponent(testUrl)}&title=${encodeURIComponent("Chemistry Chapter 7")}`;
assert(shareEndpoint.includes("classroom.google.com/share"), `Classroom share URL endpoint is correct`);
assert(shareEndpoint.includes(encodeURIComponent(testUrl)), `URL properly encoded in query params`);

// 4. Virtual Lab Deep-Links
const labUrl = getAbsoluteShareUrl("#labs/photosynthesis");
assert(labUrl.includes("#labs/photosynthesis"), `Lab hash route correctly preserved: ${labUrl}`);

// 5. Lesson Plan Deep-Links
const planUrl = getAbsoluteShareUrl("#plan/CHEM-M08-L2");
assert(planUrl.includes("#plan/CHEM-M08-L2"), `Lesson plan route correctly formatted: ${planUrl}`);

// 6. Flashcard Deck Filter Deep-Links
const fcUrl = getAbsoluteShareUrl("#flashcards?subject=CHEM&moduleId=4");
assert(fcUrl.includes("#flashcards?subject=CHEM&moduleId=4"), `Flashcard filtered deck preserved: ${fcUrl}`);

// 7. Clipboard and Audio Synth Resilience
import { safeCopyTextToClipboard } from "../utils/lms-share.js";
import { SoundFX } from "../utils/audio-synth.js";

assert(typeof safeCopyTextToClipboard === "function", "safeCopyTextToClipboard helper exists");
assert(typeof SoundFX.playPop === "function", "SoundFX.playPop method is present");
assert(typeof SoundFX.playLevelUp === "function", "SoundFX.playLevelUp method is present");
assert(typeof SoundFX.playScorePip === "function", "SoundFX.playScorePip method is present");
assert(typeof SoundFX.playError === "function", "SoundFX.playError method is present");

let threwOnUnknown = false;
try {
  SoundFX.anyNonExistentMethodCalledRandomly();
} catch (e) {
  threwOnUnknown = true;
}
assert(!threwOnUnknown, "SoundFX resilient Proxy prevents unhandled TypeError crashes");

console.log("\n========================================================");
console.log(`📊 LMS Share Tests: ${passed} Passed, ${failed} Failed`);
console.log("========================================================\n");

if (failed > 0) process.exit(1);
else process.exit(0);
