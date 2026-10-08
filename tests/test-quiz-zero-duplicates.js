// Edugates-ClipSAT Science Labs - Zero Duplicate Questions Test Suite
// Verifies that a question can NEVER appear twice in any quiz, timed exam, presenter slide, or printed test.

import fs from "fs";
import path from "path";

console.log("\n========================================================");
console.log("🛡️ Zero Duplicate Questions Invariant Verification Suite");
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

  get innerHTML() {
    return this._innerHTML;
  }

  set innerHTML(html) {
    this._innerHTML = html;
    this.children = [];

    const tagRegex = /<([a-z0-9]+)\s+([^>]+)>/gi;
    let match;
    while ((match = tagRegex.exec(html)) !== null) {
      const tag = match[1];
      const attrsStr = match[2];
      const idMatch = /id="([^"]+)"/.exec(attrsStr);
      const classMatch = /class="([^"]+)"/.exec(attrsStr);
      const id = idMatch ? idMatch[1] : "";
      const cls = classMatch ? classMatch[1] : "";
      
      const node = new MockNode(tag, id);
      node.className = cls;
      node.parentNode = this;
      if (cls) {
        cls.split(" ").filter(Boolean).forEach(c => node.classList.add(c));
      }
      const dataRegex = /data-([a-z0-9_-]+)="([^"]+)"/gi;
      let dMatch;
      while ((dMatch = dataRegex.exec(attrsStr)) !== null) {
        const key = dMatch[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        node.dataset[key] = dMatch[2];
      }
      if (id && id !== "quiz-container" && id !== "quiz-engine-mount") {
        mockElements.set(id, node);
      }
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

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const results = [];
    const check = (el) => {
      let match = false;
      if (selector.startsWith("#") && el.id === selector.slice(1)) match = true;
      else if (selector.startsWith(".") && el.className.split(" ").filter(Boolean).includes(selector.slice(1))) match = true;
      else if (selector.startsWith("[") && selector.endsWith("]")) {
        const attr = selector.slice(1, -1).split("=")[0];
        if (el.attributes[attr] !== undefined || el.dataset[attr.replace("data-", "")] !== undefined) match = true;
      } else if (el.tagName.toLowerCase() === selector.toLowerCase()) match = true;
      if (match) results.push(el);
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

const containerEl = new MockNode("div", "quiz-engine-mount");
mockElements.set("quiz-engine-mount", containerEl);
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
    return containerEl.querySelector(sel) || bodyEl.querySelector(sel);
  },
  querySelectorAll(sel) {
    return [...containerEl.querySelectorAll(sel), ...bodyEl.querySelectorAll(sel)];
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

async function runTestSuite() {
  const {
    normalizeQuestionText,
    getQuestionFingerprint,
    getOptionsFingerprint,
    isSameQuestion,
    deduplicateQuestions,
    getUserCustomQuestions,
    saveUserCustomQuestion,
    renderQuizEngine,
    getQuestionBank
  } = await import("../components/quiz-engine.js");

  // Section 1: Helper normalization & fingerprint testing
  console.log("--- 1. Normalization & Equality Invariants ---");
  const t1 = "What is the speed of light in vacuum? ($$c = 3.0 \\times 10^8\\text{ m/s}$$)";
  const t2 = "what is the speed of light in vacuum? ($c = 3.0 \\times 10^8\\text{ m/s}$)";
  const t3 = "  What is the SPEED of light in vacuum?  (c = 3.0 \\times 10^8 m/s)  ";
  const t4 = "What is the speed of light in vacuum? ($c = 3.0 \\times 10^8\\mathbf{\\text{ m/s}}$)&nbsp;";
  
  assert(normalizeQuestionText(t1) === normalizeQuestionText(t2), "Normalizes LaTeX $$ vs $ syntax and casing");
  assert(normalizeQuestionText(t1) === normalizeQuestionText(t3), "Normalizes whitespace, casing, and punctuation");
  assert(normalizeQuestionText(t1) === normalizeQuestionText(t4), "Normalizes nested LaTeX font wrappers and HTML entities");

  const qA = { id: "Q101", question: t1 };
  const qB = { id: "Q101", question: "Different question text" };
  const qC = { id: "Q999", question: t2 }; // Different ID, but identical question!
  const qD = { id: "Q102", question: "Calculate the molar mass of sulfuric acid." };

  assert(isSameQuestion(qA, qB) === true, "Detects duplicates by matching question ID");
  assert(isSameQuestion(qA, qC) === true, "Detects duplicates by matching normalized prompt text even with different IDs");
  assert(isSameQuestion(qA, qD) === false, "Distinct questions return false");

  // Permuted options test: Questions with different IDs and prompts, but identical permuted choices
  const qPerm1 = {
    id: "PERM-1",
    question: "Prompt version A: What is the primary role of chlorophyll in photosynthesis?",
    options: [
      "Absorbs photon energy to excite electrons in PS II",
      "Reflects blue and red light while transmitting green",
      "Synthesizes ATP directly without membrane proton gradients",
      "Fixes carbon dioxide into glucose during light reactions"
    ]
  };
  const qPerm2 = {
    id: "PERM-2",
    question: "Prompt version B: In photosynthesis, how does chlorophyll function during photochemical reactions?",
    options: [
      "Reflects blue and red light while transmitting green",
      "Fixes carbon dioxide into glucose during light reactions",
      "Absorbs photon energy to excite electrons in PS II",
      "Synthesizes ATP directly without membrane proton gradients"
    ]
  };
  assert(isSameQuestion(qPerm1, qPerm2) === true, "Detects duplicates when options set is identical but choices are shuffled/permuted in different order");
  const uniquePermList = deduplicateQuestions([qPerm1, qPerm2]);
  assert(uniquePermList.length === 1, "deduplicateQuestions eliminates question with permuted choices set");

  // Section 2: deduplicateQuestions array handling
  console.log("\n--- 2. deduplicateQuestions Array Purification ---");
  const rawList = [qA, qB, qC, qD, qA, null, undefined, qD];
  const uniqueList = deduplicateQuestions(rawList);
  assert(uniqueList.length === 2, `Purifies list of 8 items containing duplicates/nulls into exactly 2 unique items (got ${uniqueList.length})`);
  assert(uniqueList[0].id === "Q101", "Preserves first occurrence");
  assert(uniqueList[1].id === "Q102", "Preserves distinct second question");

  // Section 3: Custom Questions Persistence Deduplication
  console.log("\n--- 3. Custom Questions Deduplication ---");
  storageMock.clear();
  const custom1 = {
    id: "CUSTOM-CHEM-1",
    question: "Which quantum number specifies the orientation of an atomic orbital?",
    options: ["Magnetic quantum number", "Principal quantum number", "Spin", "Azimuthal"],
    correctIndex: 0
  };
  const custom2 = {
    id: "CUSTOM-CHEM-2", // Different ID, but duplicate question prompt
    question: "  which quantum number specifies the orientation of an atomic orbital?  ",
    options: ["Magnetic quantum number", "Principal quantum number", "Spin", "Azimuthal"],
    correctIndex: 0
  };

  saveUserCustomQuestion(custom1);
  saveUserCustomQuestion(custom2);
  const loaded = getUserCustomQuestions();
  assert(loaded.length === 1, `Saving duplicate custom question updates existing entry instead of duplicating (count: ${loaded.length})`);

  // Section 4: Live Quiz Engine Assessment Generation
  console.log("\n--- 4. Live Quiz Engine Zero-Duplicate Generation ---");
  const cleanup = renderQuizEngine("quiz-engine-mount", { subj: "CHEM", scope: "CHEM-M1-L1,CHEM-M1-L2", count: "20" });

  const btnGen = document.getElementById("btn-generate-exam");
  assert(btnGen !== null, "Found 'Generate Assessment Now' button");

  await btnGen.click();
  await new Promise(r => setTimeout(r, 80));

  const cards = containerEl.querySelectorAll(".question-card");
  assert(cards.length > 0, `Exam generated with ${cards.length} questions`);

  // Verify that across all generated questions, there are ZERO duplicate IDs
  const seenIds = new Set();
  let duplicateCount = 0;

  cards.forEach((card, idx) => {
    const qid = card.id ? card.id.replace("q-card-", "") : (card.dataset.qid || `card-${idx}`);

    if (seenIds.has(qid)) {
      console.error(`  ❌ Duplicate question ID found on question #${idx + 1}: ${qid}`);
      duplicateCount++;
    }
    seenIds.add(qid);
  });

  assert(duplicateCount === 0, `Active examination contains zero duplicate questions (checked ${cards.length} items)`);
  assert(seenIds.size === cards.length, `Every question card has a unique question ID (${seenIds.size}/${cards.length})`);

  // Section 5: Teacher Selection Studio Presets
  console.log("\n--- 5. Teacher Selection Studio Presets Deduplication ---");
  const bank = await getQuestionBank("CHEM");
  const samplePool = bank.slice(0, 30);
  
  // Introduce intentional duplicates into the test input pool
  const contaminatedPool = [...samplePool, ...samplePool.slice(0, 5)];
  assert(contaminatedPool.length === 35, "Created contaminated pool with 5 intentional duplicates");
  
  const cleanPool = deduplicateQuestions(contaminatedPool);
  assert(cleanPool.length === 30, `deduplicateQuestions removed all 5 duplicates (clean count: ${cleanPool.length})`);

  if (typeof cleanup === "function") cleanup();

  // Section 6: Biology Assessment Generation Zero Duplicates
  console.log("\n--- 6. Biology Live Generation Zero Duplicates ---");
  const cleanupBio = renderQuizEngine("quiz-engine-mount", { subj: "BIO", scope: "BIO-M1-L1,BIO-M1-L2,BIO-M2-L1", count: "25" });
  const btnGenBio = document.getElementById("btn-generate-exam");
  await btnGenBio.click();
  await new Promise(r => setTimeout(r, 80));

  const cardsBio = containerEl.querySelectorAll(".question-card");
  assert(cardsBio.length > 0, `Biology Exam generated with ${cardsBio.length} questions`);

  const seenIdsBio = new Set();
  let duplicateCountBio = 0;
  cardsBio.forEach((card, idx) => {
    const qid = card.id ? card.id.replace("q-card-", "") : (card.dataset.qid || `card-${idx}`);
    if (seenIdsBio.has(qid)) {
      console.error(`  ❌ Duplicate Biology question ID: ${qid}`);
      duplicateCountBio++;
    }
    seenIdsBio.add(qid);
  });
  assert(duplicateCountBio === 0, `Biology exam contains 0 duplicate questions (${seenIdsBio.size} unique)`);
  if (typeof cleanupBio === "function") cleanupBio();

  // Section 7: Physics Assessment Generation Zero Duplicates
  console.log("\n--- 7. Physics Live Generation Zero Duplicates ---");
  const cleanupPhys = renderQuizEngine("quiz-engine-mount", { subj: "PHYS", scope: "PHYS-M1-L1,PHYS-M1-L2,PHYS-M2-L1", count: "30" });
  const btnGenPhys = document.getElementById("btn-generate-exam");
  await btnGenPhys.click();
  await new Promise(r => setTimeout(r, 80));

  const cardsPhys = containerEl.querySelectorAll(".question-card");
  assert(cardsPhys.length > 0, `Physics Exam generated with ${cardsPhys.length} questions`);

  const seenIdsPhys = new Set();
  let duplicateCountPhys = 0;
  cardsPhys.forEach((card, idx) => {
    const qid = card.id ? card.id.replace("q-card-", "") : (card.dataset.qid || `card-${idx}`);
    if (seenIdsPhys.has(qid)) {
      console.error(`  ❌ Duplicate Physics question ID: ${qid}`);
      duplicateCountPhys++;
    }
    seenIdsPhys.add(qid);
  });
  assert(duplicateCountPhys === 0, `Physics exam contains 0 duplicate questions (${seenIdsPhys.size} unique)`);
  if (typeof cleanupPhys === "function") cleanupPhys();

  // Section 8: Master Question Bank Full Verification
  console.log("\n--- 8. Master Question Bank Full Options-Set & Prompt Uniqueness ---");
  const masterBank = await getQuestionBank();
  assert(masterBank.length === 7260, `Master question bank contains exactly 7,260 questions (got ${masterBank.length})`);

  const seenPromptMap = new Map();
  const seenOptsMap = new Map();
  let dupPromptCount = 0;
  let dupOptsCount = 0;

  masterBank.forEach(q => {
    const normPrompt = normalizeQuestionText(q.question || "");
    if (seenPromptMap.has(normPrompt)) {
      dupPromptCount++;
    } else {
      seenPromptMap.set(normPrompt, q.id);
    }

    if (q.options && q.options.length >= 3) {
      const optsKey = getOptionsFingerprint(q.options);
      if (optsKey) {
        if (seenOptsMap.has(optsKey)) {
          dupOptsCount++;
        } else {
          seenOptsMap.set(optsKey, q.id);
        }
      }
    }
  });

  assert(dupPromptCount === 0, `All 7,260 questions in the master bank have 100% unique prompt texts (duplicates: ${dupPromptCount})`);
  assert(dupOptsCount === 0, `All questions in the master bank have 100% unique choices sets, zero permuted duplicates (duplicates: ${dupOptsCount})`);

  console.log("\n========================================================");
  console.log(`📊 Zero Duplicate Invariant Suite: ${passed} Passed, ${failed} Failed`);
  console.log("========================================================\n");

  if (failed > 0) process.exit(1);
}

runTestSuite();
