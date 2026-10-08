// Edugates-ClipSAT Science Labs - Windows Chrome Smartboard, Custom Question Diagrams & Table Views Suite
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("\n========================================================");
console.log("🖥️ Windows/Chrome Tools, Custom Diagrams & Tables Verification");
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

// Emulate minimal browser DOM environment for Node.js
const mockElements = new Map();

class MockNode {
  constructor(tag = "div", id = "") {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.className = "";
    this.children = [];
    this.parentNode = null;
    this.listeners = {};
    this.style = {};
    this.attributes = {};
    this.classList = {
      add: (c) => { if (!this.className.includes(c)) this.className += ` ${c}`; },
      remove: (c) => { this.className = this.className.replace(c, "").trim(); },
      contains: (c) => this.className.includes(c),
      toggle: (c) => { this.contains(c) ? this.remove(c) : this.add(c); }
    };
    this.dataset = {};
    this._value = "";
    this.checked = false;
    this._innerHTML = "";
  }

  get innerHTML() { return this._innerHTML; }
  set innerHTML(html) {
    this._innerHTML = html;
    this.children = [];
    const idRegex = /id="([^"]+)"/g;
    let match;
    while ((match = idRegex.exec(html)) !== null) {
      const id = match[1];
      const node = new MockNode("div", id);
      mockElements.set(id, node);
      this.children.push(node);
    }
  }

  get value() { return this._value; }
  set value(v) { this._value = String(v); }

  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return this.attributes[k] || null; }

  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  removeEventListener(event, fn) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(h => h !== fn);
  }

  dispatchEvent(event) {
    const list = this.listeners[event.type || event] || [];
    list.forEach(fn => fn(event));
  }

  click() {
    this.dispatchEvent({ type: "click", stopPropagation: () => {} });
  }

  remove() {
    if (this.parentNode) {
      this.parentNode.children = this.parentNode.children.filter(c => c !== this);
      this.parentNode = null;
    }
    if (this.id && mockElements.has(this.id)) {
      mockElements.delete(this.id);
    }
  }

  appendChild(child) {
    this.children.push(child);
    child.parentNode = this;
    if (child.id) mockElements.set(child.id, child);
    return child;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const results = [];
    const check = (el) => {
      if (selector.startsWith("#") && el.id === selector.slice(1)) {
        results.push(el);
      } else if (selector.startsWith(".") && el.className.split(" ").includes(selector.slice(1))) {
        results.push(el);
      }
      el.children.forEach(check);
    };
    check(this);
    return results;
  }
}

const bodyEl = new MockNode("body");
globalThis.window = {
  location: {
    origin: "https://mohammedamy.github.io",
    pathname: "/EdugatesScLab/",
    hostname: "mohammedamy.github.io",
    protocol: "https:",
    search: ""
  },
  addEventListener: () => {},
  removeEventListener: () => {}
};

globalThis.document = {
  body: bodyEl,
  getElementById(id) {
    if (!mockElements.has(id)) {
      const node = new MockNode("div", id);
      mockElements.set(id, node);
      return node;
    }
    return mockElements.get(id);
  },
  createElement(tag) {
    return new MockNode(tag);
  },
  querySelector(sel) {
    return bodyEl.querySelector(sel);
  },
  querySelectorAll(sel) {
    return bodyEl.querySelectorAll(sel);
  }
};

const store = {};
const storageMock = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => { store[key] = String(val); },
  removeItem: (key) => { delete store[key]; },
  clear: () => { for (const k in store) delete store[k]; }
};
globalThis.localStorage = storageMock;
window.localStorage = storageMock;

// Dynamic imports after mock setup
const { formatMathText } = await import("../utils/math-renderer.js");
const { 
  compressImageFile, 
  renderQuestionDiagramHtml, 
  openDiagramBankPickerModal, 
  openCustomQuestionModal,
  getUserCustomQuestions,
  saveUserCustomQuestion,
  deleteUserCustomQuestion
} = await import("../components/quiz-engine.js");
const { SCIENTIFIC_DIAGRAMS } = await import("../data/scientific-diagrams.js");

// ----------------------------------------------------
// Section 1: Windows Chrome & Smartboard Touch/Pointer Fixes
// ----------------------------------------------------
console.log("--- 1. Windows Chrome & Smartboard Tools ---");
const cssContent = fs.readFileSync(path.join(rootDir, "index.css"), "utf-8");
const toolbarContent = fs.readFileSync(path.join(rootDir, "components/smartboard-toolbar.js"), "utf-8");

assert(cssContent.includes("#smartboard-draw-canvas") && cssContent.includes("touch-action: none !important;"), "Drawing canvas has touch-action: none !important for Windows touch / stylus gestures");
assert(toolbarContent.includes("elevateSmartboardTool"), "Smartboard toolbar includes elevateSmartboardTool() z-index priority function");
assert(toolbarContent.includes("isTouchOrPen"), "moveDraw identifies touch or stylus pen pointers to protect against Windows Chrome stroke aborts");
assert(toolbarContent.includes('e.pointerType === "mouse"'), "buttons === 0 stroke abort is restricted to mouse pointers, preventing touch event drop");
assert(toolbarContent.includes("hasMovedFar") && toolbarContent.includes("bar.setPointerCapture"), "Toolbar pointer capture delayed until movement exceeds 4px, ensuring buttons receive clicks on Windows");
assert(cssContent.includes(".sb-timer-widget") && cssContent.includes("200095 !important;"), "Timer widget z-index elevated above drawing canvas and modal layers (200095)");

// ----------------------------------------------------
// Section 2: Question Table Enhancements in Math Renderer & CSS
// ----------------------------------------------------
console.log("\n--- 2. Question Table Enhancements (Screen & Print) ---");

const sampleTableMd = `
| Trial | Concentration ($M$) | Initial Rate ($M/s$) |
|:---:|:---:|:---:|
| 1 | $0.100$ | $1.25 \\times 10^{-3}$ |
| 2 | $0.200$ | $2.50 \\times 10^{-3}$ |
| 3 | $0.200$ | $5.00 \\times 10^{-3}$ |
`;

const renderedHtml = formatMathText(sampleTableMd);

assert(renderedHtml.includes('<div class="q-table-wrapper">'), "Markdown tables wrapped in responsive .q-table-wrapper");
assert(renderedHtml.includes('<table class="q-data-table" role="table">'), "Semantic .q-data-table rendered with ARIA role='table'");
assert(renderedHtml.includes('<thead class="q-table-head">'), "Table includes structured <thead>");
assert(renderedHtml.includes('<tbody class="q-table-body">'), "Table includes structured <tbody>");
assert(renderedHtml.includes('class="q-tbl-th align-center"'), "Column alignments properly mapped to CSS classes (align-center)");
assert(renderedHtml.includes('class="q-tbl-row row-even"') && renderedHtml.includes('class="q-tbl-row row-odd"'), "Table rows have alternating zebra striping classes (row-even / row-odd)");
assert(renderedHtml.includes("0.100") && renderedHtml.includes("Concentration"), "Cell contents and math text preserved within table cells");

assert(cssContent.includes(".q-table-wrapper"), "CSS provides styling for .q-table-wrapper");
assert(cssContent.includes(".q-data-table"), "CSS provides styling for .q-data-table");
assert(cssContent.includes("@media print") && cssContent.includes(".q-data-table"), "CSS includes dedicated print styling for question tables");
assert(cssContent.includes("page-break-inside: avoid") || cssContent.includes("break-inside: avoid"), "Print styles prevent table fragmentation across page breaks");

// ----------------------------------------------------
// Section 3: Scientific Diagrams Bank & Custom Question Attachments
// ----------------------------------------------------
console.log("\n--- 3. Scientific Diagrams Bank & Question Visual Models ---");

assert(typeof SCIENTIFIC_DIAGRAMS === "object" && Object.keys(SCIENTIFIC_DIAGRAMS).length >= 20, "SCIENTIFIC_DIAGRAMS bank contains 20+ authentic models");
assert(typeof renderQuestionDiagramHtml === "function", "renderQuestionDiagramHtml exported from quiz-engine.js");
assert(typeof openDiagramBankPickerModal === "function", "openDiagramBankPickerModal exported from quiz-engine.js");
assert(typeof openCustomQuestionModal === "function", "openCustomQuestionModal exported from quiz-engine.js");
assert(typeof compressImageFile === "function", "compressImageFile exported for client-side image compression");

// Test rendering SVG diagram on screen
const testSvgDiag = {
  id: "chem_titration_curve",
  title: "Titration Curve",
  caption: "Figure 1: Strong Acid - Strong Base Titration",
  svg: '<svg viewBox="0 0 540 320"><rect width="540" height="320" fill="#0f172a"/></svg>'
};
const screenSvgHtml = renderQuestionDiagramHtml(testSvgDiag, false);
assert(screenSvgHtml.includes('class="q-diagram-container"'), "Screen SVG diagram renders inside .q-diagram-container");
assert(screenSvgHtml.includes("Figure 1: Strong Acid - Strong Base Titration"), "Caption rendered for screen diagram");
assert(screenSvgHtml.includes("<svg"), "SVG vector markup included in screen output");

// Test rendering SVG diagram in print mode
const printSvgHtml = renderQuestionDiagramHtml(testSvgDiag, true);
assert(printSvgHtml.includes('class="print-diagram-container"'), "Print SVG diagram renders inside .print-diagram-container");
assert(printSvgHtml.includes("page-break-inside: avoid;"), "Print diagram prevents mid-image page breaks");
assert(printSvgHtml.includes('background: #ffffff;') || printSvgHtml.includes('background:#ffffff;'), "Print diagram styled for clean white paper background");

// Test rendering image/picture diagram (uploaded picture or web URL)
const testImgDiag = {
  id: "custom_pic_1",
  title: "Microscope Cell Observation",
  caption: "Figure 2: Plant cell under 400x magnification",
  imageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
};
const screenImgHtml = renderQuestionDiagramHtml(testImgDiag, false);
assert(screenImgHtml.includes('<img src="data:image/png;base64,'), "Uploaded image renders as <img> in screen view");
assert(screenImgHtml.includes("Figure 2: Plant cell under 400x magnification"), "Caption rendered for uploaded image diagram");

const printImgHtml = renderQuestionDiagramHtml(testImgDiag, true);
assert(printImgHtml.includes('class="print-diagram-container"') && printImgHtml.includes('<img src="data:image/png;base64,'), "Uploaded image renders as high-contrast print model with print container");

// ----------------------------------------------------
// Section 4: Quiz Engine Custom Question Storage with Diagram
// ----------------------------------------------------
console.log("\n--- 4. Custom Question Storage with Attached Visual Model ---");

const customQuestionWithDiag = {
  id: `CUSTOM-CHEM-M01-L1-TEST-${Date.now().toString(36)}`,
  subject: "CHEM",
  moduleId: 1,
  lessonId: 1,
  moduleTitle: "Matter and Change",
  lessonTitle: "Properties of Matter",
  type: "mcq",
  difficulty: "honors",
  difficultyTier: "medium",
  angle: "user_custom_question",
  question: "Based on the heating curve shown in the diagram, what phase change occurs along segment B-C?",
  options: [
    "Solid melting to liquid",
    "Liquid boiling to vapor",
    "Gas condensing to liquid",
    "Solid subliming to gas"
  ],
  correctIndex: 0,
  explanation: "Segment B-C is the first plateau where temperature remains constant as solid melts to liquid.",
  hasDiagram: true,
  diagram: testSvgDiag,
  isUserCustom: true
};

const saveSuccess = saveUserCustomQuestion(customQuestionWithDiag);
assert(saveSuccess === true, "saveUserCustomQuestion succeeds with attached diagram");

const storedQuestions = getUserCustomQuestions();
const retrieved = storedQuestions.find(q => q.id === customQuestionWithDiag.id);
assert(Boolean(retrieved), "Retrieved custom question from storage");
assert(retrieved.hasDiagram === true, "hasDiagram preserved in storage");
assert(retrieved.diagram && retrieved.diagram.id === testSvgDiag.id, "Diagram object fully preserved in custom question");

// Cleanup
deleteUserCustomQuestion(customQuestionWithDiag.id);
const afterDelete = getUserCustomQuestions();
assert(!afterDelete.some(q => q.id === customQuestionWithDiag.id), "Custom question cleanly deleted");

console.log("\n========================================================");
console.log(`📊 Summary: ${passed} Passed, ${failed} Failed`);
console.log("========================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
