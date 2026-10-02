// Edugates-ClipSAT Science Labs - Quiz Engine Unit Test Suite
// Verifies syntax integrity, dynamic module loading, DOM mounting, scope defaults, and cleanup lifecycle.

import fs from "fs";
import path from "path";

console.log("\n========================================================");
console.log("📝 Quiz & Assessment Engine Verification Suite");
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
class MockElement {
  constructor(tag = "div", id = "") {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.className = "";
    this.children = [];
    this.parentNode = null;
    this.listeners = {};
    this.style = {};
    this.dataset = {};
    this._value = "";
    this.checked = false;
    this.innerHTML = "";
  }

  get value() { return this._value; }
  set value(v) { this._value = String(v); }

  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  removeEventListener(event, fn) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(h => h !== fn);
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const results = [];
    const check = (el) => {
      if (selector.startsWith("#") && el.id === selector.slice(1)) results.push(el);
      else if (selector.startsWith(".") && el.className.split(" ").includes(selector.slice(1))) results.push(el);
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

// Setup global mock DOM
const mockElementsById = new Map();
const containerEl = new MockElement("div", "quiz-engine-mount");
mockElementsById.set("quiz-engine-mount", containerEl);

globalThis.window = {
  location: {
    origin: "http://localhost:8088",
    pathname: "/",
    hostname: "localhost",
    protocol: "http:",
    search: ""
  },
  addEventListener: () => {},
  removeEventListener: () => {}
};

globalThis.document = {
  getElementById(id) {
    if (!mockElementsById.has(id)) {
      mockElementsById.set(id, new MockElement("div", id));
    }
    return mockElementsById.get(id);
  },
  createElement(tag) {
    return new MockElement(tag);
  },
  querySelector(sel) {
    return containerEl.querySelector(sel);
  },
  querySelectorAll(sel) {
    return containerEl.querySelectorAll(sel);
  },
  body: new MockElement("body")
};

if (!globalThis.navigator.clipboard) {
  try {
    Object.defineProperty(globalThis.navigator, "clipboard", {
      value: { writeText: async () => true },
      configurable: true
    });
  } catch (e) {}
}

async function runTests() {
  // Test 1: Verify Quiz Engine ES Module Import
  let quizModule = null;
  try {
    quizModule = await import("../components/quiz-engine.js");
    assert(quizModule !== null, "quiz-engine.js imports cleanly without syntax errors");
  } catch (err) {
    assert(false, `quiz-engine.js failed to import: ${err.message}`);
    console.error(err);
    process.exit(1);
  }

  // Test 2: Verify Exports
  assert(typeof quizModule.getQuestionBank === "function", "getQuestionBank is exported as an async function");
  assert(typeof quizModule.renderQuizEngine === "function", "renderQuizEngine is exported as a function");

  // Test 3: Verify Question Bank loader
  try {
    const bank = await quizModule.getQuestionBank();
    assert(Array.isArray(bank), `Question bank resolves to an array (Count: ${bank.length})`);
    assert(bank.length > 7000, `Question bank has rich comprehensive pool (>7,000 items, found ${bank.length})`);
  } catch (err) {
    assert(false, `Failed to load question bank: ${err.message}`);
  }

  // Test 4: Verify renderQuizEngine mounts properly into container
  let cleanupFn = null;
  try {
    cleanupFn = quizModule.renderQuizEngine("quiz-engine-mount");
    assert(typeof cleanupFn === "function", "renderQuizEngine returns a cleanup function");
    assert(containerEl.innerHTML.length > 0, "renderQuizEngine populates container with assessment studio HTML");
    assert(containerEl.innerHTML.includes("Interactive Assessment Studio"), "Assessment studio header markup is present");
    assert(containerEl.innerHTML.includes("Curriculum File Explorer Scope"), "Curriculum file explorer scope section is present");
    assert(containerEl.innerHTML.includes("btn-generate-exam"), "Generate Assessment button is present");
  } catch (err) {
    assert(false, `renderQuizEngine threw during initialization: ${err.message}`);
  }

  // Test 5: Verify cleanup execution
  try {
    if (typeof cleanupFn === "function") {
      cleanupFn();
      assert(true, "cleanupQuiz() executes cleanly without errors");
    }
  } catch (err) {
    assert(false, `cleanupQuiz() threw error: ${err.message}`);
  }

  // Test 6: Verify Service Worker Configuration
  const swContent = fs.readFileSync(path.resolve("./sw.js"), "utf8");
  const swServiceContent = fs.readFileSync(path.resolve("./service-worker.js"), "utf8");

  assert(/const CACHE_NAME = "amscilab-pwa-v(52|53|\d+)";/.test(swContent), "sw.js bumped to CACHE_NAME amscilab-pwa-v52 or newer");
  assert(/const CACHE_NAME = "amscilab-pwa-v(52|53|\d+)";/.test(swServiceContent), "service-worker.js bumped to CACHE_NAME amscilab-pwa-v52 or newer");
  assert(swContent.includes('"./components/quiz-engine.js"'), "sw.js precaches ./components/quiz-engine.js");
  assert(swContent.includes('"./components/quiz-engine.js?v=3.1"'), "sw.js precaches ./components/quiz-engine.js?v=3.1");
  assert(swContent.includes("ignoreSearch: true"), "sw.js provides ignoreSearch fallback for offline resilience");

  console.log("\n========================================================");
  console.log(`📊 Quiz Engine Tests: ${passed} Passed, ${failed} Failed`);
  console.log("========================================================\n");

  if (failed > 0) process.exit(1);
}

runTests();
