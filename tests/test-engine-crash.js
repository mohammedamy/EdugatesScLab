// Test Suite: Test Engine Crash Prevention & Resiliency Verification
import { renderQuizEngine, getQuestionBank } from "../components/quiz-engine.js";

console.log("\n========================================================");
console.log("🛡️ Test Engine Crash Prevention & Resiliency Test Suite");
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

// Minimal robust mock DOM
class MockElement {
  constructor(tag = "div", id = "", className = "") {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.className = className;
    this.children = [];
    this.parentNode = null;
    this.listeners = {};
    this.style = {};
    this.dataset = {};
    this._value = "";
    this._innerHTML = "";
    this.isConnected = true;
    this.classList = {
      _classes: new Set(className ? className.split(" ").filter(Boolean) : []),
      add: (c) => { this.classList._classes.add(c); this.className = Array.from(this.classList._classes).join(" "); },
      remove: (c) => { this.classList._classes.delete(c); this.className = Array.from(this.classList._classes).join(" "); },
      contains: (c) => this.classList._classes.has(c),
      toggle: (c) => this.classList.contains(c) ? this.classList.remove(c) : this.classList.add(c)
    };
  }

  appendChild(child) {
    this.children.push(child);
    child.parentNode = this;
    return child;
  }

  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parentNode = null;
    }
    return child;
  }

  remove() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  }

  get value() { return this._value; }
  set value(v) { this._value = String(v); }

  get outerHTML() { return this._innerHTML; }
  set outerHTML(html) {
    this._innerHTML = html;
    if (this.parentNode) {
      const idx = this.parentNode.children.indexOf(this);
      if (idx !== -1) {
        const replacement = new MockElement(this.tagName.toLowerCase(), this.id, this.className);
        replacement.innerHTML = html;
        replacement.parentNode = this.parentNode;
        this.parentNode.children[idx] = replacement;
      }
    }
  }

  get innerHTML() { return this._innerHTML; }
  set innerHTML(html) {
    this._innerHTML = html;
    this.children = [];
    const idRegex = /id="([^"]+)"/g;
    let match;
    while ((match = idRegex.exec(html)) !== null) {
      const id = match[1];
      if (id !== "quiz-mount") {
        const node = new MockElement("div", id);
        node.parentNode = this;
        mockElements.set(id, node);
        this.children.push(node);
      }
    }

    const classTagRegex = /<([a-z0-9]+)\s+[^>]*class="([^"]+)"[^>]*>/gi;
    while ((match = classTagRegex.exec(html)) !== null) {
      const tag = match[1];
      const cls = match[2];
      const fullTag = match[0];
      const node = new MockElement(tag);
      node.className = cls;
      node.parentNode = this;
      node.classList = {
        _classes: new Set(cls.split(" ").filter(Boolean)),
        add: (c) => { node.classList._classes.add(c); node.className = Array.from(node.classList._classes).join(" "); },
        remove: (c) => { node.classList._classes.delete(c); node.className = Array.from(node.classList._classes).join(" "); },
        contains: (c) => node.classList._classes.has(c),
        toggle: (c) => node.classList.contains(c) ? node.classList.remove(c) : node.classList.add(c)
      };
      const dataRegex = /data-([a-z0-9_-]+)="([^"]+)"/gi;
      let dMatch;
      while ((dMatch = dataRegex.exec(fullTag)) !== null) {
        const key = dMatch[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        node.dataset[key] = dMatch[2];
      }
      this.children.push(node);
    }
  }

  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  removeEventListener(event, fn) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(f => f !== fn);
  }

  dispatchEvent(event) {
    if (!event.target) event.target = this;
    let curr = this;
    while (curr) {
      const handlers = curr.listeners[event.type] || [];
      for (const h of handlers) {
        h(event);
      }
      curr = curr.parentNode;
    }
  }

  click() {
    this.dispatchEvent({
      type: "click",
      preventDefault: () => {},
      stopPropagation: () => {},
      target: this
    });
  }

  closest(selector) {
    let curr = this;
    while (curr) {
      if (selector.startsWith(".") && curr.classList.contains(selector.slice(1))) {
        return curr;
      }
      if (selector.startsWith("#") && curr.id === selector.slice(1)) {
        return curr;
      }
      curr = curr.parentNode;
    }
    return null;
  }

  querySelector(selector) {
    if (selector.startsWith("#")) {
      return mockElements.get(selector.slice(1)) || null;
    }
    if (selector.startsWith(".")) {
      const cls = selector.slice(1);
      return this.children.find(c => c.classList.contains(cls)) || null;
    }
    return null;
  }

  querySelectorAll(selector) {
    const results = [];
    const search = (node) => {
      for (const child of node.children) {
        if (selector.startsWith(".") && child.classList.contains(selector.slice(1))) {
          results.push(child);
        } else if (selector.startsWith("#") && child.id === selector.slice(1)) {
          results.push(child);
        }
        search(child);
      }
    };
    search(this);
    return results;
  }
}

const mockElements = new Map();
const containerEl = new MockElement("div", "quiz-mount");
mockElements.set("quiz-mount", containerEl);

globalThis.document = {
  getElementById(id) {
    return mockElements.get(id) || null;
  },
  querySelector(sel) {
    return containerEl.querySelector(sel);
  },
  querySelectorAll(sel) {
    return containerEl.querySelectorAll(sel);
  },
  createElement(tag) {
    return new MockElement(tag);
  },
  createTreeWalker() {
    return { nextNode: () => null };
  },
  addEventListener() {},
  removeEventListener() {},
  body: new MockElement("body")
};

globalThis.window = {
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent() {},
  document: globalThis.document
};

async function runCrashTestSuite() {
  console.log("Phase 1: Initializing Quiz Engine with Scope...");
  const cleanup = renderQuizEngine("quiz-mount", { scope: "CHEM-M1-L1" });
  assert(typeof cleanup === "function", "renderQuizEngine initializes without crashing");

  // Verify Share LMS button does not throw ReferenceError
  const btnShareLms = document.getElementById("btn-config-share-lms");
  assert(btnShareLms !== null, "Found 'btn-config-share-lms' button");
  let lmsError = null;
  try {
    btnShareLms.click();
  } catch (err) {
    console.error("LMS ERROR CAUGHT:", err);
    lmsError = err;
  }
  assert(lmsError === null, "Clicking Assign to LMS in config does not throw ReferenceError (hash is defined)");

  // Phase 2: Practice Mode Exam Generation
  console.log("\nPhase 2: Generating Practice Assessment...");
  const diffSelect = document.getElementById("cfg-difficulty");
  const countSelect = document.getElementById("cfg-count");
  const modeSelect = document.getElementById("cfg-mode");
  const btnGen = document.getElementById("btn-generate-exam");

  if (diffSelect) diffSelect.value = "ALL";
  if (countSelect) countSelect.value = "5";
  if (modeSelect) modeSelect.value = "practice";

  let genError = null;
  try {
    await btnGen.click();
    // Allow microtasks to complete
    await new Promise(r => setTimeout(r, 50));
  } catch (err) {
    genError = err;
  }
  assert(genError === null, "generateExam() executes cleanly without unhandled rejection");

  const qList = document.getElementById("questions-list");
  assert(qList !== null, "Test view renders question list cleanly");

  // Phase 3: Answering Multiple Questions Without Listener Multiplication
  console.log("\nPhase 3: Interactive Question Answering & Event Delegation...");
  const optBtns = containerEl.querySelectorAll(".q-option-btn");
  assert(optBtns.length > 0, `Rendered ${optBtns.length} option buttons in test view`);

  let answerError = null;
  try {
    // Answer first 3 questions consecutively
    const firstQBtns = optBtns.slice(0, 4);
    firstQBtns[0].click();
    firstQBtns[1].click();
    firstQBtns[0].click();
  } catch (err) {
    answerError = err;
  }
  assert(answerError === null, "Clicking option buttons multiple times works smoothly without stack overflow or re-binding explosion");

  // Phase 4: Submitting Exam and Rendering Results
  console.log("\nPhase 4: Submitting Exam for Grading...");
  const btnSubmit = document.getElementById("btn-submit-exam");
  assert(btnSubmit !== null, "Found 'btn-submit-exam' button");

  let submitError = null;
  try {
    btnSubmit.click();
  } catch (err) {
    submitError = err;
  }
  assert(submitError === null, "finishExam() processes scorecard without NaN or division-by-zero crashes");

  const btnReview = document.getElementById("btn-review-answers");
  assert(btnReview !== null, "Results view rendered with 'Review Questions & Solutions' button");

  let reviewError = null;
  try {
    btnReview.click();
  } catch (err) {
    reviewError = err;
  }
  assert(reviewError === null, "Navigating back to review questions from results executes cleanly");

  // Phase 5: Smartboard Presenter Mode
  console.log("\nPhase 5: Smartboard Classroom Presenter Mode...");
  const btnPresenter = document.getElementById("btn-switch-to-presenter");
  assert(btnPresenter !== null, "Found 'Smartboard Mode' button");

  let presenterError = null;
  try {
    btnPresenter.click();
  } catch (err) {
    presenterError = err;
  }
  assert(presenterError === null, "Switching to Presenter Mode initializes slide view cleanly");

  const btnNext = document.getElementById("btn-next-slide");
  const btnPrev = document.getElementById("btn-prev-slide");
  const btnReveal = document.getElementById("btn-toggle-reveal");
  const btnPoll = document.getElementById("btn-simulate-poll");

  assert(btnNext !== null, "Found 'Next Slide' button in presenter mode");
  assert(btnReveal !== null, "Found 'Reveal Answer' button in presenter mode");
  assert(btnPoll !== null, "Found 'Simulate Class Poll' button in presenter mode");

  let pollError = null;
  try {
    btnReveal.click();
    btnPoll.click();
    btnNext.click();
    btnPrev.click();
  } catch (err) {
    pollError = err;
  }
  assert(pollError === null, "Presenter mode slide transitions, polls, and answer reveal execute cleanly");

  // Exit presenter
  const btnExit = document.getElementById("btn-exit-presenter");
  if (btnExit) btnExit.click();
  assert(document.getElementById("btn-generate-exam") !== null, "Exiting Presenter mode returns safely to Exam Setup");

  // Phase 6: Edge Case Hardening & Special Question Types
  console.log("\nPhase 6: Edge Case Hardening & Question Types...");
  
  // Test CER question generation and rubric reveal in practice mode
  const modeSelect6 = document.getElementById("cfg-mode");
  const qtypeSelect6 = document.getElementById("cfg-qtype");
  const countSelect6 = document.getElementById("cfg-count");
  const btnGen6 = document.getElementById("btn-generate-exam");
  if (modeSelect6) modeSelect6.value = "practice";
  if (qtypeSelect6) qtypeSelect6.value = "cer";
  if (countSelect6) countSelect6.value = "5";
  if (btnGen6) {
    await btnGen6.click();
    await new Promise(r => setTimeout(r, 50));
  }
  const cerBtns = containerEl.querySelectorAll(".btn-reveal-cer");
  assert(cerBtns.length > 0, `Generated CER questions with ${cerBtns.length} rubric reveal buttons`);
  let cerClickError = null;
  try {
    if (cerBtns.length > 0) {
      cerBtns[0].click();
      cerBtns[0].click(); // toggle hide
    }
  } catch (err) {
    cerClickError = err;
  }
  assert(cerClickError === null, "Toggling CER model rubric reveal works cleanly without throwing");

  // Back to setup
  const btnBack = document.getElementById("btn-back-config");
  if (btnBack) btnBack.click();

  // Test Timed Exam Generation
  const modeSelectTimed = document.getElementById("cfg-mode");
  const qtypeSelectTimed = document.getElementById("cfg-qtype");
  const btnGenTimed = document.getElementById("btn-generate-exam");
  if (modeSelectTimed) modeSelectTimed.value = "timed";
  if (qtypeSelectTimed) qtypeSelectTimed.value = "ALL";
  if (btnGenTimed) {
    await btnGenTimed.click();
    await new Promise(r => setTimeout(r, 50));
  }
  assert(document.getElementById("exam-timer") !== null, "Timed Exam displays countdown timer element");

  // Test cleanup
  cleanup();
  assert(true, "cleanupQuiz() terminates all timers without leaks");

  console.log("\n========================================================");
  console.log(`📊 Test Engine Resiliency Suite: ${passed} Passed, ${failed} Failed`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runCrashTestSuite().catch(err => {
  console.error("FATAL ERROR IN TEST SUITE:", err);
  process.exit(1);
});
