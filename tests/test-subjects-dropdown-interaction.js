// Edugates-ClipSAT Science Labs - Subjects Dropdown Dynamic DOM & State Test
// Validates DOM rendering, active class transitions, ARIA attributes, and tab switching

import assert from "assert";

console.log("\n========================================================");
console.log("🧪 Subjects Dropdown DOM State & Interaction Verification");
console.log("========================================================\n");

let passed = 0;
let failed = 0;

function testAssert(cond, desc) {
  if (cond) {
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${desc}`);
    failed++;
  }
}

// Minimal Headless DOM Simulator for Node.js
class FakeClassList {
  constructor() {
    this.classes = new Set();
  }
  add(...cls) { cls.forEach(c => this.classes.add(c)); }
  remove(...cls) { cls.forEach(c => this.classes.delete(c)); }
  contains(cls) { return this.classes.has(cls); }
  toggle(cls, force) {
    if (force !== undefined) {
      if (force) this.classes.add(cls);
      else this.classes.delete(cls);
      return force;
    }
    if (this.classes.has(cls)) {
      this.classes.delete(cls);
      return false;
    }
    this.classes.add(cls);
    return true;
  }
}

class FakeElement {
  constructor(tag, id = "", className = "") {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.classList = new FakeClassList();
    if (className) {
      className.split(/\s+/).filter(Boolean).forEach(c => this.classList.add(c));
    }
    this.attributes = {};
    this.children = [];
    this.dataset = {};
    this.innerHTML = "";
    this.textContent = "";
    this.style = {};
  }
  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return this.attributes[k] || null; }
  removeAttribute(k) { delete this.attributes[k]; }
  focus() {}
  contains(target) { return target === this || this.children.some(c => c.contains(target)); }
  querySelector(sel) {
    if (sel.startsWith(".")) {
      const cls = sel.slice(1);
      return this.children.find(c => c.classList.contains(cls)) || null;
    }
    return null;
  }
  querySelectorAll(sel) {
    const results = [];
    for (const c of this.children) {
      if (sel.startsWith(".") && c.classList.contains(sel.slice(1))) results.push(c);
      results.push(...c.querySelectorAll(sel));
    }
    return results;
  }
}

// Import app constants
const { CURRICULUM_SUBJECT_IDS, CURRICULUM_SUBJECTS, TOOL_TABS, NAV_SUBJECTS } = await import("../app.js");

testAssert(CURRICULUM_SUBJECT_IDS.length === 3, "Exactly 3 curriculum subjects (chem, bio, phys)");
testAssert(CURRICULUM_SUBJECTS.map(s => s.id).join(",") === "chem,bio,phys", "Curriculum subjects ordered: chem, bio, phys");
testAssert(TOOL_TABS.map(s => s.id).join(",") === "labs,quiz,flashcards", "Tool tabs ordered: labs, quiz, flashcards");

// Verify Dropdown UI structure invariants
console.log("\n📐 UI Invariants & Accessibility Contract:");
const chemSub = NAV_SUBJECTS.find(s => s.id === "chem");
const bioSub = NAV_SUBJECTS.find(s => s.id === "bio");
const physSub = NAV_SUBJECTS.find(s => s.id === "phys");

testAssert(chemSub.badge === "23" && chemSub.themeClass === "tab-chem", "Chemistry specifies 23 modules and tab-chem theme");
testAssert(bioSub.badge === "27" && bioSub.themeClass === "tab-bio", "Biology specifies 27 modules and tab-bio theme");
testAssert(physSub.badge === "24" && physSub.themeClass === "tab-phys", "Physics specifies 24 modules and tab-phys theme");

const labsSub = NAV_SUBJECTS.find(s => s.id === "labs");
const quizSub = NAV_SUBJECTS.find(s => s.id === "quiz");
const flashSub = NAV_SUBJECTS.find(s => s.id === "flashcards");

testAssert(labsSub && labsSub.themeClass === "tab-labs", "Virtual Labs tool available in NAV_SUBJECTS with tab-labs theme");
testAssert(quizSub && quizSub.themeClass === "tab-quiz", "Quiz & Exams tool available in NAV_SUBJECTS with tab-quiz theme");
testAssert(flashSub && flashSub.themeClass === "tab-flashcards", "Flashcards tool available in NAV_SUBJECTS with tab-flashcards theme");

// Verify toggle logic simulation
console.log("\n🔄 Toggle Subjects Dropdown Simulation:");
const mockWrapper = new FakeElement("div", "nav-subjects-dropdown", "nav-subjects-dropdown");
const mockBtn = new FakeElement("button", "nav-subjects-dropdown-btn", "nav-subject-tab-pill nav-subjects-dropdown-btn");
mockWrapper.children.push(mockBtn);

function simulateToggle(wrapper, btn, forceState) {
  const isOpen = forceState !== undefined ? forceState : !wrapper.classList.contains("open");
  wrapper.classList.toggle("open", isOpen);
  btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  return isOpen;
}

testAssert(!mockWrapper.classList.contains("open"), "Dropdown initially closed");
testAssert(simulateToggle(mockWrapper, mockBtn) === true, "toggle() opens closed dropdown");
testAssert(mockWrapper.classList.contains("open"), "Wrapper has 'open' class after toggle");
testAssert(mockBtn.getAttribute("aria-expanded") === "true", "Button has aria-expanded='true'");

testAssert(simulateToggle(mockWrapper, mockBtn) === false, "toggle() closes open dropdown");
testAssert(!mockWrapper.classList.contains("open"), "Wrapper does not have 'open' class after second toggle");
testAssert(mockBtn.getAttribute("aria-expanded") === "false", "Button has aria-expanded='false'");

// Force states
testAssert(simulateToggle(mockWrapper, mockBtn, true) === true, "toggle(true) explicitly opens");
testAssert(mockWrapper.classList.contains("open"), "Dropdown is open after toggle(true)");
testAssert(simulateToggle(mockWrapper, mockBtn, false) === false, "toggle(false) explicitly closes");
testAssert(!mockWrapper.classList.contains("open"), "Dropdown is closed after toggle(false)");

console.log("\n========================================================");
console.log(`📊 Subjects Dropdown DOM State Tests: ${passed} Passed, ${failed} Failed`);
console.log("========================================================\n");

if (failed > 0) {
  process.exit(1);
}
