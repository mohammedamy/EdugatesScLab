// Test for Teacher Question Picker & Print Live Exclusion Interaction Flows
import { renderQuizEngine, getQuestionBank } from "../components/quiz-engine.js";

console.log("\n========================================================");
console.log("🧪 Teacher Question Selection Studio Interaction Test");
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

// Emulate minimal interactive browser DOM
class MockNode {
  constructor(tag = "div", id = "") {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.className = "";
    this.children = [];
    this.parentNode = null;
    this.listeners = {};
    this.style = {};
    this.classList = {
      add: (c) => { this.className += ` ${c}`; },
      remove: (c) => { this.className = this.className.replace(c, "").trim(); },
      contains: (c) => this.className.includes(c),
      toggle: (c) => { this.contains(c) ? this.remove(c) : this.add(c); }
    };
    this.dataset = {};
    this._value = "";
    this.checked = false;
    this._innerHTML = "";
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set innerHTML(html) {
    this._innerHTML = html;
    this.children = [];
    const idRegex = /id="([^"]+)"/g;
    let match;
    while ((match = idRegex.exec(html)) !== null) {
      const id = match[1];
      if (id !== "quiz-test-mount") {
        const node = new MockNode("div", id);
        mockElements.set(id, node);
        this.children.push(node);
      }
    }

    const classTagRegex = /<([a-z0-9]+)\s+[^>]*class="([^"]+)"[^>]*>/gi;
    while ((match = classTagRegex.exec(html)) !== null) {
      const tag = match[1];
      const cls = match[2];
      const fullTag = match[0];
      const node = new MockNode(tag);
      node.className = cls;
      const dataRegex = /data-([a-z0-9_-]+)="([^"]+)"/gi;
      let dMatch;
      while ((dMatch = dataRegex.exec(fullTag)) !== null) {
        const key = dMatch[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        node.dataset[key] = dMatch[2];
      }
      this.children.push(node);
    }
  }

  get value() { return this._value; }
  set value(v) { this._value = String(v); }

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

  change(checked) {
    this.checked = checked;
    this.dispatchEvent({ type: "change", stopPropagation: () => {}, target: this });
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const results = [];
    const check = (el) => {
      if (selector.startsWith("#") && el.id === selector.slice(1)) results.push(el);
      else if (selector.startsWith(".") && el.className.split(" ").includes(selector.slice(1))) results.push(el);
      else if (selector.startsWith("[data-") && el.dataset[selector.slice(6, -1)] !== undefined) results.push(el);
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
}

const mockElements = new Map();
const mountEl = new MockNode("div", "quiz-test-mount");
mockElements.set("quiz-test-mount", mountEl);

globalThis.window = {
  location: { origin: "http://localhost:8089", pathname: "/", hostname: "localhost", protocol: "http:" },
  addEventListener: () => {},
  removeEventListener: () => {},
  print: () => {}
};

globalThis.document = {
  getElementById(id) {
    if (!mockElements.has(id)) {
      mockElements.set(id, new MockNode("div", id));
    }
    return mockElements.get(id);
  },
  createElement(tag) { return new MockNode(tag); },
  querySelector(sel) { return mountEl.querySelector(sel); },
  querySelectorAll(sel) { return mountEl.querySelectorAll(sel); },
  body: new MockNode("body")
};

async function testInteractions() {
  const cleanup = renderQuizEngine("quiz-test-mount", { scope: "CHEM-M1-L1" });
  assert(typeof cleanup === "function", "renderQuizEngine initialized cleanly");

  // Verify setup screen elements
  const btnChoose = document.getElementById("btn-choose-questions");
  assert(btnChoose !== null, "Found 'Choose & Customize Questions' button");

  // Verify bank loads 7260
  const bank = await getQuestionBank();
  assert(bank.length === 7260, `Question bank resolved 7,260 items`);

  // Trigger choose questions
  btnChoose.click();
  // Wait for async question bank load & render
  await new Promise(r => setTimeout(r, 250));

  assert(mountEl.innerHTML.includes("Teacher Question Selection Studio"), "Navigated to Teacher Question Selection Studio");
  assert(mountEl.innerHTML.includes("preset-balanced-30"), "Found Balanced 30 preset");
  assert(mountEl.innerHTML.includes("preset-balanced-15"), "Found Balanced 15 preset");
  assert(mountEl.innerHTML.includes("preset-balanced-10"), "Found Quick 10 preset");
  assert(mountEl.innerHTML.includes("btn-picker-print"), "Found Produce Final Printed Exam button");

  // Test Print Navigation
  const btnPickerPrint = document.getElementById("btn-picker-print");
  btnPickerPrint.click();
  await new Promise(r => setTimeout(r, 100));

  assert(mountEl.innerHTML.includes("print-actions-bar"), "Print Studio loaded with toolbar");
  assert(mountEl.innerHTML.includes("btn-print-reselect"), "Print Studio has 'Choose / Edit Questions' button");
  assert(mountEl.innerHTML.includes("btn-exclude-q"), "Print Studio question cards have '✕ Exclude' buttons");
  assert(mountEl.innerHTML.includes("STANDARD OPTICAL MARK RECOGNITION (OMR) RESPONSE SHEET"), "Print Studio includes OMR Bubble Sheet");
  assert(mountEl.innerHTML.includes("Teacher Scoring Guide &amp; Detailed Solutions Key"), "Print Studio includes Teacher Solutions Key");

  // Test Live Question Exclusion from Print Studio
  const excludeBtns = document.querySelectorAll(".btn-exclude-q");
  assert(excludeBtns.length > 0, `Found ${excludeBtns.length} printable questions with exclude buttons`);
  const initialPrintCount = excludeBtns.length;
  excludeBtns[0].click();
  await new Promise(r => setTimeout(r, 100));

  const freshExcludeBtns = document.querySelectorAll(".btn-exclude-q");
  assert(freshExcludeBtns.length === initialPrintCount - 1, `Live exclusion successfully decremented print questions from ${initialPrintCount} to ${freshExcludeBtns.length}`);
  assert(mountEl.innerHTML.includes("btn-print-undo"), "Undo Exclude button is visible when questions are excluded");
  assert(mountEl.innerHTML.includes("print-excluded-tray"), "Excluded Questions Tray is visible when questions are excluded");

  // Test Undo Exclude
  const btnUndo = document.getElementById("btn-print-undo");
  assert(btnUndo !== null, "Found 'Undo Exclude' button in toolbar");
  btnUndo.click();
  await new Promise(r => setTimeout(r, 100));

  const undoneExcludeBtns = document.querySelectorAll(".btn-exclude-q");
  assert(undoneExcludeBtns.length === initialPrintCount, `Undo successfully restored question back to exam (Count: ${undoneExcludeBtns.length})`);

  // Test Form A and Form B Equivalence Management
  const btnFormB = document.getElementById("btn-print-form-b");
  assert(btnFormB !== null, "Found Form B (Anti-Cheat) button");
  btnFormB.click();
  await new Promise(r => setTimeout(r, 100));

  const formBExcludeBtns = document.querySelectorAll(".btn-exclude-q");
  assert(formBExcludeBtns.length === initialPrintCount, `Form B maintains identical question count to Form A (${formBExcludeBtns.length} Qs)`);
  assert(mountEl.innerHTML.includes("Form A #"), "Form B questions clearly cross-reference equivalent Form A question numbers");
  assert(mountEl.innerHTML.includes("Forms A &amp; B Equivalent"), "Model Equivalence badge is present");

  // Exclude while viewing Form B
  formBExcludeBtns[0].click();
  await new Promise(r => setTimeout(r, 100));
  const formBAfterExclude = document.querySelectorAll(".btn-exclude-q");
  assert(formBAfterExclude.length === initialPrintCount - 1, `Exclusion in Form B decrements question count to ${formBAfterExclude.length}`);

  // Switch to Form A and verify exact same exclusion is reflected
  const btnFormA = document.getElementById("btn-print-form-a");
  btnFormA.click();
  await new Promise(r => setTimeout(r, 100));
  const formAAfterFormBExclude = document.querySelectorAll(".btn-exclude-q");
  assert(formAAfterFormBExclude.length === initialPrintCount - 1, `Form A reflects identical exclusion made in Form B (Count: ${formAAfterFormBExclude.length})`);

  // Test Restore from Tray
  const restoreSingleBtn = document.querySelectorAll(".btn-restore-single-q")[0];
  assert(restoreSingleBtn !== undefined, "Found individual Restore button in Excluded Questions Tray");
  restoreSingleBtn.click();
  await new Promise(r => setTimeout(r, 100));
  const restoredBtns = document.querySelectorAll(".btn-exclude-q");
  assert(restoredBtns.length === initialPrintCount, `Restore from tray restored question to both Form A and Form B (Count: ${restoredBtns.length})`);

  // Test Multiple Exclusions and Restore All
  const multiExBtns = document.querySelectorAll(".btn-exclude-q");
  multiExBtns[0].click();
  await new Promise(r => setTimeout(r, 50));
  const multiExBtns2 = document.querySelectorAll(".btn-exclude-q");
  multiExBtns2[0].click();
  await new Promise(r => setTimeout(r, 50));
  assert(document.querySelectorAll(".btn-exclude-q").length === initialPrintCount - 2, "Excluded 2 questions");

  const btnRestoreAll = document.getElementById("btn-restore-all");
  assert(btnRestoreAll !== null, "Found 'Restore All' button in Excluded Questions Tray");
  btnRestoreAll.click();
  await new Promise(r => setTimeout(r, 100));
  assert(document.querySelectorAll(".btn-exclude-q").length === initialPrintCount, `Restore All restored all questions (Count: ${document.querySelectorAll(".btn-exclude-q").length})`);

  // Test Return to Picker from Print Studio
  const btnReselect = document.getElementById("btn-print-reselect");
  assert(btnReselect !== null, "Found 'Choose / Edit Questions' reselect button in print toolbar");
  btnReselect.click();
  await new Promise(r => setTimeout(r, 250));
  assert(mountEl.innerHTML.includes("Teacher Question Selection Studio"), "Successfully navigated back to Teacher Question Selection Studio from Print view");

  cleanup();
  console.log("\n========================================================");
  console.log(`📊 Picker Interaction Tests: ${passed} Passed, ${failed} Failed`);
  console.log("========================================================\n");

  if (failed > 0) process.exit(1);
}

testInteractions();
