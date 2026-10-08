import assert from "node:assert";
import fs from "node:fs";

console.log("\n========================================================");
console.log("📐 Diagrams Bank Layout, Sizing & Contrast Test Suite");
console.log("========================================================");

// 1. Check index.css rules
const css = fs.readFileSync("./index.css", "utf8");

assert(css.includes(".diag-picker-grid"), "index.css must include .diag-picker-grid");
assert(css.includes("grid-auto-rows: minmax(320px, auto)"), "grid-auto-rows must be minmax(320px, auto)");
assert(css.includes("align-content: start"), "align-content must be start");
assert(css.includes("min-height: 320px"), "card min-height must be 320px");
assert(css.includes(".diag-picker-preview-box"), "index.css must include .diag-picker-preview-box");
assert(css.includes(".cq-textarea"), "index.css must include .cq-textarea");
assert(css.includes(".cq-input"), "index.css must include .cq-input");
assert(css.includes(".cq-attached-thumb"), "index.css must include .cq-attached-thumb");
assert(css.includes("[data-theme=\"day\"] .cq-textarea"), "Day mode must style .cq-textarea");
assert(css.includes("[data-theme=\"day\"] .diag-picker-card"), "Day mode must style .diag-picker-card");
assert(css.includes(".diag-picker-modal-shell"), "index.css must include .diag-picker-modal-shell");

console.log("  ✅ PASS: CSS rules for grid layout, min-height (320px), preview box, and day theme contrast verified");

// 2. Check quiz-engine.js modal and thumbnail code integrity
const quizJs = fs.readFileSync("./components/quiz-engine.js", "utf8");
assert(quizJs.includes("id=\"diag-picker-grid\" class=\"diag-picker-grid\""), "diag-picker-grid must have class diag-picker-grid");
assert(quizJs.includes("class=\"diag-picker-preview-box\""), "card preview must have class diag-picker-preview-box");
assert(quizJs.includes("id=\"cq-attached-diag-thumb\""), "attachment card must have #cq-attached-diag-thumb");
assert(quizJs.includes("diagThumb.innerHTML ="), "setAttachedDiagram must populate diagThumb.innerHTML");
assert(quizJs.includes("class=\"cq-textarea\""), "prompt textarea must have class cq-textarea");
assert(quizJs.includes("class=\"cq-option-row\""), "option rows must have class cq-option-row");
assert(quizJs.includes("diag-picker-modal-shell"), "modal shell must have diag-picker-modal-shell class");
assert(quizJs.includes("polishDiagramForPrint(d.svg"), "diagram cards must run through polishDiagramForPrint");

console.log("  ✅ PASS: quiz-engine.js correctly implements diag-picker-preview-box, cq-attached-diag-thumb, and contrast classes");

// 3. Lightweight Mock DOM Environment for programmatic interactive verification
class MockElement {
  constructor(tag = "div", id = "") {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.className = "";
    this.children = [];
    this.parentNode = null;
    this.listeners = {};
    this.attributes = {};
    this.dataset = {};
    this.style = {};
    this._innerHTML = "";
    this.classList = {
      add: (c) => {
        if (!this.classList.contains(c)) this.className = (this.className + " " + c).trim();
      },
      remove: (c) => {
        this.className = this.className.split(" ").filter(x => x !== c).join(" ").trim();
      },
      contains: (c) => this.className.split(" ").includes(c)
    };
  }

  setAttribute(name, val) {
    this.attributes[name] = String(val);
  }

  getAttribute(name) {
    return this.attributes[name] || null;
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set innerHTML(html) {
    this._innerHTML = html;
    this.children = [];

    // Parse HTML string to create child mock elements with IDs, classes, datasets, and styles
    const tagRegex = /<([a-z0-9]+)\b([^>]*)>/gi;
    let match;
    while ((match = tagRegex.exec(html)) !== null) {
      const tag = match[1];
      const attrsStr = match[2];
      const child = new MockElement(tag);

      const idMatch = attrsStr.match(/\bid="([^"]+)"/i);
      if (idMatch) child.id = idMatch[1];

      const classMatch = attrsStr.match(/\bclass="([^"]+)"/i);
      if (classMatch) child.className = classMatch[1];

      const styleMatch = attrsStr.match(/\bstyle="([^"]+)"/i);
      if (styleMatch) child.setAttribute("style", styleMatch[1]);

      const dataRegex = /\bdata-([a-z0-9_-]+)="([^"]+)"/gi;
      let dMatch;
      while ((dMatch = dataRegex.exec(attrsStr)) !== null) {
        const key = dMatch[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        child.dataset[key] = dMatch[2];
      }

      this.children.push(child);
      child.parentNode = this;
    }
  }

  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  dispatchEvent(event) {
    const handlers = this.listeners[event.type] || [];
    handlers.forEach(h => h(event));
  }

  click() {
    this.dispatchEvent({ type: "click", stopPropagation: () => {}, target: this });
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
      } else if (selector.startsWith("[data-") && el.dataset[selector.slice(6, -1)] !== undefined) {
        results.push(el);
      }
      el.children.forEach(check);
    };
    check(this);
    return results;
  }

  appendChild(child) {
    this.children.push(child);
    child.parentNode = this;
    return child;
  }

  remove() {
    if (this.parentNode) {
      this.parentNode.children = this.parentNode.children.filter(c => c !== this);
    }
    const idx = mockDocBody.children.indexOf(this);
    if (idx !== -1) mockDocBody.children.splice(idx, 1);
  }
}

const mockDocBody = new MockElement("body");
globalThis.window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  location: { origin: "http://localhost", pathname: "/", hostname: "localhost" }
};
globalThis.document = {
  body: mockDocBody,
  createElement: (tag) => new MockElement(tag),
  getElementById: (id) => {
    const find = (node) => {
      if (node.id === id) return node;
      for (const c of node.children) {
        const res = find(c);
        if (res) return res;
      }
      return null;
    };
    return find(mockDocBody);
  }
};

const { openDiagramBankPickerModal, SCIENTIFIC_DIAGRAMS } = await import("../components/quiz-engine.js");

// Test A: Opening Diagram Bank Picker Modal
let selectedDiag = null;
openDiagramBankPickerModal((diag) => {
  selectedDiag = diag;
});

const modalOverlay = document.getElementById("cq-diagram-picker-modal");
assert(modalOverlay, "Diagram picker modal overlay must be added to document.body");
const modalShell = modalOverlay.querySelector(".custom-modal-shell");
assert(modalShell, "Modal shell exists");
assert(modalShell.className.includes("diag-picker-modal-shell"), "Modal shell has .diag-picker-modal-shell");
assert(modalShell.getAttribute("style").includes("height: 88vh"), "Modal shell has explicit height: 88vh to avoid collapsing");
assert(modalShell.getAttribute("style").includes("background: #ffffff"), "Modal shell has clean white background");

const gridEl = modalOverlay.querySelector("#diag-picker-grid");
assert(gridEl, "Grid element exists");
assert(gridEl.getAttribute("style").includes("flex: 1 1 auto"), "Grid has flex: 1 1 auto for smooth auto-expanding height");

const cards = modalOverlay.querySelectorAll(".diag-picker-card");
assert(cards.length === Object.keys(SCIENTIFIC_DIAGRAMS).length, `Grid renders all ${Object.keys(SCIENTIFIC_DIAGRAMS).length} diagrams`);

// Test B: Verify card white background, preview box, and polished SVG
const previewBoxes = modalOverlay.querySelectorAll(".diag-picker-preview-box");
assert(previewBoxes.length === Object.keys(SCIENTIFIC_DIAGRAMS).length, "Found preview box for every diagram");
const firstPreviewBox = previewBoxes[0];
assert(firstPreviewBox.getAttribute("style").includes("background: #ffffff"), "Preview box has white background");

assert(gridEl.innerHTML.includes("data-print-polished"), "Card SVG was polished with data-print-polished flag");
assert(gridEl.innerHTML.includes("background: #ffffff"), "Card SVG has pure white background");

// Test C: Select diagram by clicking '✓ Select Diagram' button
const selectBtns = modalOverlay.querySelectorAll(".btn-choose-diagram");
assert(selectBtns.length === cards.length, "Every card has a '✓ Select Diagram' button");
const firstBtn = selectBtns[0];
firstBtn.click();

assert(selectedDiag !== null, "onSelectDiagram callback was fired");
assert(selectedDiag.id === cards[0].dataset.id, "Correct diagram was passed to callback");
assert(!document.getElementById("cq-diagram-picker-modal"), "Modal overlay was cleanly removed after selection");

console.log("  ✅ PASS: Diagram picker modal opens with explicit height (88vh), white background, polished SVGs, and selects diagrams via button");

// Test D: Select diagram by clicking card container directly
selectedDiag = null;
openDiagramBankPickerModal((diag) => {
  selectedDiag = diag;
});

const secondModalOverlay = document.getElementById("cq-diagram-picker-modal");
const secondCards = secondModalOverlay.querySelectorAll(".diag-picker-card");
assert(secondCards.length >= 2, "Second modal rendered diagram cards");
secondCards[1].click();

assert(selectedDiag !== null, "onSelectDiagram callback fired when clicking card body");
assert(selectedDiag.id === secondCards[1].dataset.id, "Correct diagram selected via full-card click");
assert(!document.getElementById("cq-diagram-picker-modal"), "Modal overlay cleanly removed after full-card click");

console.log("  ✅ PASS: Clicking anywhere on diagram card selects the diagram and closes modal");

// Test E: Select diagram using keyboard Enter
selectedDiag = null;
openDiagramBankPickerModal((diag) => {
  selectedDiag = diag;
});

const thirdModalOverlay = document.getElementById("cq-diagram-picker-modal");
const thirdCards = thirdModalOverlay.querySelectorAll(".diag-picker-card");
assert(thirdCards.length >= 3, "Third modal rendered diagram cards");
thirdCards[2].dispatchEvent({ type: "keydown", key: "Enter", preventDefault: () => {} });

assert(selectedDiag !== null, "onSelectDiagram callback fired on keyboard Enter");
assert(selectedDiag.id === thirdCards[2].dataset.id, "Correct diagram selected via keyboard Enter");
assert(!document.getElementById("cq-diagram-picker-modal"), "Modal overlay cleanly removed on keyboard Enter");

console.log("  ✅ PASS: Keyboard navigation (Enter key) selects diagram and closes modal");

console.log("\n========================================================");
console.log("📊 Summary: All Layout, Sizing & Selection Tests Passed!");
console.log("========================================================\n");
