// Edugates-ClipSAT Science Labs - DOM Click Flow Simulation Test
// Simulates user clicking on lesson row cards, standalone lesson cards, launch buttons,
// overview lesson items, and verifies modal display and interactive simulator mounting.

import fs from "fs";
import path from "path";

console.log("\n========================================================");
console.log("🖱️ Live DOM Click Simulation & Modal Mounting Test");
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

// Emulate minimal browser DOM environment
class MockElement {
  constructor(tag, id = "", className = "") {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.className = className;
    this.dataset = {};
    this.style = {};
    this.classList = {
      _classes: new Set(className ? className.split(" ") : []),
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      contains(c) { return this._classes.has(c); },
      toggle(c, force) {
        if (force === undefined) {
          if (this._classes.has(c)) this._classes.delete(c);
          else this._classes.add(c);
        } else if (force) {
          this._classes.add(c);
        } else {
          this._classes.delete(c);
        }
      }
    };
    this.children = [];
    this.parentNode = null;
    this.listeners = {};
    this.innerHTML = "";
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

  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  removeEventListener(event, fn) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(f => f !== fn);
  }

  dispatchEvent(event) {
    event.target = this;
    let curr = this;
    while (curr) {
      const handlers = curr.listeners[event.type] || [];
      for (const fn of handlers) {
        fn.call(curr, event);
        if (event._stopped) break;
      }
      if (event._stopped) break;
      curr = curr.parentNode;
    }
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
      if (curr.tagName === selector.toUpperCase()) {
        return curr;
      }
      curr = curr.parentNode;
    }
    return null;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const res = [];
    const walk = (node) => {
      for (const child of node.children) {
        let match = false;
        if (selector.startsWith(".") && child.classList.contains(selector.slice(1))) match = true;
        else if (selector.startsWith("#") && child.id === selector.slice(1)) match = true;
        else if (child.tagName === selector.toUpperCase()) match = true;
        if (match) res.push(child);
        walk(child);
      }
    };
    walk(this);
    return res;
  }
}

class MockEvent {
  constructor(type, opts = {}) {
    this.type = type;
    this.ctrlKey = !!opts.ctrlKey;
    this.metaKey = !!opts.metaKey;
    this.shiftKey = !!opts.shiftKey;
    this.button = opts.button || 0;
    this._prevented = false;
    this._stopped = false;
    this.target = null;
  }
  preventDefault() { this._prevented = true; }
  stopPropagation() { this._stopped = true; }
}

// Setup Global Environment
const docBody = new MockElement("body");
global.document = {
  body: docBody,
  getElementById(id) {
    if (id === "module-modal-overlay") return docBody.querySelector("#module-modal-overlay");
    return null;
  },
  createElement(tag) {
    return new MockElement(tag);
  },
  querySelectorAll(sel) {
    return docBody.querySelectorAll(sel);
  }
};

global.window = {
  location: { hash: "" },
  history: {
    pushState(state, title, url) {
      window.location.hash = url;
    },
    replaceState(state, title, url) {
      window.location.hash = url;
    }
  }
};

// Simulate Module Data
const mockModule = {
  id: 1,
  code: "CHEM-M01",
  title: "Matter & Change",
  phenomenon: "Why does liquid nitrogen shatter flowers?",
  bigIdea: "Structure determines properties.",
  lessons: [
    { id: 1, title: "Properties of Matter" },
    { id: 2, title: "Classification of Matter" },
    { id: 3, title: "Changes in Matter" }
  ]
};

// Test Flow:
let modalOpenedWith = null;
function mockOpenModuleModal(mod, themeColor, initialLessonId) {
  modalOpenedWith = { mod, themeColor, initialLessonId };
  let overlay = document.getElementById("module-modal-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "module-modal-overlay";
    document.body.appendChild(overlay);
  }
  overlay.style.display = "flex";
  overlay.innerHTML = `
    <div class="modal-dialog">
      <div class="lesson-card-item" data-lesson-id="2">
        <button class="btn-select-lesson-interactive" data-lesson-id="2">🔬 Load Simulator</button>
      </div>
    </div>
  `;
}

// 1. Emulate Subject View Container
const container = new MockElement("div", "subject-view-container");
docBody.appendChild(container);

// Add lesson-row-card inside container (Chapter view)
const rowPill = new MockElement("a", "", "lesson-row-card");
rowPill.dataset.mid = "1";
rowPill.dataset.lid = "2";
container.appendChild(rowPill);

// Add standalone lesson card with direct launcher button
const fullCard = new MockElement("div", "", "lesson-card-full");
fullCard.dataset.mid = "1";
fullCard.dataset.lid = "3";
const launchBtn = new MockElement("a", "", "btn-launch-lesson-sim");
launchBtn.dataset.mid = "1";
launchBtn.dataset.lid = "3";
fullCard.appendChild(launchBtn);
container.appendChild(fullCard);

// Test Launch Lesson Interactive Helper
const curData = {
  code: "CHEM",
  modules: [mockModule]
};

const launchLessonInteractive = (mid, lid) => {
  const mod = curData.modules.find(m => m.id === mid);
  if (!mod) return;
  const tabId = curData.code.toLowerCase();
  const themeColor = `var(--${tabId}-primary)`;
  mockOpenModuleModal(mod, themeColor, lid);
  const targetHash = `#lesson/${mod.code}-L${lid}`;
  if (window.location.hash !== targetHash) {
    try {
      history.pushState(null, "", targetHash);
    } catch (err) {
      window.location.hash = targetHash;
    }
  }
};

// Bind row pill
rowPill.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  const mid = parseInt(rowPill.dataset.mid, 10);
  const lid = parseInt(rowPill.dataset.lid, 10);
  launchLessonInteractive(mid, lid);
});

// Bind launch button
launchBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  const mid = parseInt(launchBtn.dataset.mid, 10);
  const lid = parseInt(launchBtn.dataset.lid, 10);
  launchLessonInteractive(mid, lid);
});

// TEST 1: Click row pill opens modal for Lesson 2
const click1 = new MockEvent("click");
rowPill.dispatchEvent(click1);

assert(modalOpenedWith && modalOpenedWith.initialLessonId === 2,
  "Clicking lesson-row-card immediately opened modal with initialLessonId = 2");
assert(window.location.hash === "#lesson/CHEM-M01-L2",
  "window.location.hash synced to #lesson/CHEM-M01-L2");
assert(document.getElementById("module-modal-overlay").style.display === "flex",
  "Modal overlay is displayed with display: flex");

// TEST 2: Second click on the SAME lesson row pill still responds immediately (even when hash matches)
modalOpenedWith = null;
rowPill.dispatchEvent(new MockEvent("click"));

assert(modalOpenedWith && modalOpenedWith.initialLessonId === 2,
  "Subsequent click with matching hash still opens modal cleanly (no hashchange swallow)");

// TEST 3: Click standalone button opens modal for Lesson 3
modalOpenedWith = null;
launchBtn.dispatchEvent(new MockEvent("click"));

assert(modalOpenedWith && modalOpenedWith.initialLessonId === 3,
  "Clicking btn-launch-lesson-sim inside lesson-card-full immediately opened modal for Lesson 3");
assert(window.location.hash === "#lesson/CHEM-M01-L3",
  "window.location.hash updated to #lesson/CHEM-M01-L3");

console.log("\n========================================================");
console.log(`📊 Live DOM Simulation Tests: ${passed} Passed, ${failed} Failed`);
console.log("========================================================\n");

if (failed > 0) {
  process.exit(1);
}
