// Edugates-ClipSAT Science Labs - Unit Test Suite for Editable DOCX Exporter

let downloadedBlob = null;
let downloadedFilename = null;

if (typeof globalThis.window === "undefined") {
  globalThis.window = {
    location: { href: "https://mohammedamy.github.io/EdugtesScLab/" }
  };
}

if (!globalThis.URL) {
  globalThis.URL = {};
}
globalThis.URL.createObjectURL = (blob) => {
  downloadedBlob = blob;
  return "blob:mock-url";
};
globalThis.URL.revokeObjectURL = () => {};

if (typeof globalThis.document === "undefined") {
  globalThis.document = {
    getElementById: () => null,
    createElement: (tag) => {
      const el = {
        tagName: tag.toUpperCase(),
        style: {},
        attributes: {},
        classList: {
          add: () => {},
          remove: () => {},
          contains: () => false
        },
        setAttribute: (k, v) => { el.attributes[k] = v; },
        getAttribute: (k) => el.attributes[k] || null,
        appendChild: () => {},
        click: () => {
          if (el.download) downloadedFilename = el.download;
        }
      };
      return el;
    },
    body: {
      appendChild: () => {},
      removeChild: () => {}
    }
  };
}

import { exportToDocx } from "../utils/docx-export.js";

console.log("\n========================================================");
console.log("📄 Editable DOCX Exporter Verification");
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

async function runTests() {
  // Test 1: Simple HTML string export
  const res1 = exportToDocx({
    title: "Chemistry Exam Form A",
    filename: "CHEM_Exam_Form_A",
    content: "<h1>Chemistry Midterm</h1><p>Question 1: What is molarity?</p>",
    subject: "CHEM"
  });

  assert(res1 === true, "exportToDocx returns true on success");
  assert(downloadedFilename === "CHEM_Exam_Form_A.docx", `Filename sanitized and has .docx extension (Got: ${downloadedFilename})`);
  assert(downloadedBlob !== null, "Blob was generated");

  const blobText1 = downloadedBlob.text ? await downloadedBlob.text() : (downloadedBlob.content || "");
  assert(blobText1.includes("xmlns:w='urn:schemas-microsoft-com:office:word'"), "WordProcessing XML namespace included");
  assert(blobText1.includes("<w:WordDocument>"), "WordDocument settings block included");
  assert(blobText1.includes("size: 8.27in 11.69in"), "A4 page sizing included for portrait");
  assert(blobText1.includes("Chemistry Midterm"), "Document content rendered in XML body");

  // Test 2: Filename sanitization with special characters
  exportToDocx({
    title: "Physics Lab & Forces (2026/09/29)",
    filename: "PHYS: Lab & Forces / Vectors (Form B)",
    content: "<p>Velocity and acceleration equations</p>",
    subject: "PHYS"
  });

  assert(downloadedFilename.endsWith(".docx"), "Sanitized filename ends with .docx");
  assert(!downloadedFilename.includes(":") && !downloadedFilename.includes("/"), `Dangerous filename characters replaced: ${downloadedFilename}`);

  // Test 3: Landscape orientation support
  exportToDocx({
    title: "Landscape Data Table",
    filename: "Landscape_Table",
    content: "<table><tr><td>Column 1</td><td>Column 2</td></tr></table>",
    orientation: "landscape"
  });

  const blobText3 = downloadedBlob.text ? await downloadedBlob.text() : (downloadedBlob.content || "");
  assert(blobText3.includes("size: 11.69in 8.27in"), "A4 page dimensions flipped for landscape orientation");

  // Test 4: UTF-8 BOM presence (0xEF, 0xBB, 0xBF)
  const buf = await downloadedBlob.arrayBuffer();
  const bytes = new Uint8Array(buf).slice(0, 3);
  const isBom = bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf;
  assert(isBom, "UTF-8 Byte Order Mark (0xEF, 0xBB, 0xBF) prepended for multi-lingual and scientific character support");

  console.log("\n========================================================");
  console.log(`📊 DOCX Exporter Tests: ${passed} Passed, ${failed} Failed`);
  console.log("========================================================\n");

  if (failed > 0) process.exit(1);
}

runTests();
