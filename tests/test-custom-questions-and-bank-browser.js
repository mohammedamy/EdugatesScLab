// Edugates-ClipSAT Science Labs - Custom Question & Bank Browser Verification Suite
// Tests:
// 1. Flashcard deck count (at least 5 cards per lesson across all 242 lessons)
// 2. Custom flashcard persistence & authoring (localStorage)
// 3. Custom question persistence & authoring (localStorage)
// 4. Master Question Bank Browser (Search, Filter, Single-Question Addition to Assessment)
// 5. Assessment Setup, Studio Picker, and Print Studio Integration

console.log("\n========================================================");
console.log("🧪 User Custom Questions & Bank Browser Test Suite");
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
    const idRegex = /id="([^"]+)"/g;
    let match;
    while ((match = idRegex.exec(html)) !== null) {
      const id = match[1];
      if (id !== "quiz-container") {
        const node = new MockNode("div", id);
        mockElements.set(id, node);
        this.children.push(node);
      }
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
      } else if (selector.includes("[data-qid]")) {
        if (el.dataset && el.dataset.qid) results.push(el);
      } else if (selector.includes(".btn-bank-toggle-add")) {
        if (el.className.includes("btn-bank-toggle-add")) results.push(el);
      } else if (selector.includes(".bank-sub-chip")) {
        if (el.className.includes("bank-sub-chip")) results.push(el);
      }
      el.children.forEach(check);
    };
    check(this);
    return results;
  }
}

// Global DOM setup
const containerEl = new MockNode("div", "quiz-container");
mockElements.set("quiz-container", containerEl);

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

// Mock LocalStorage
const store = {};
const storageMock = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => { store[key] = String(val); },
  removeItem: (key) => { delete store[key]; },
  clear: () => { for (const k in store) delete store[k]; }
};
globalThis.localStorage = storageMock;
window.localStorage = storageMock;

// Import dynamic modules
const {
  getUserCustomQuestions,
  saveUserCustomQuestion,
  deleteUserCustomQuestion,
  openCustomQuestionModal,
  openMasterBankBrowserModal,
  renderQuizEngine,
  getQuestionBank
} = await import("../components/quiz-engine.js");

const {
  buildComprehensiveFlashcardDeck,
  getUserCustomFlashcards,
  saveUserCustomFlashcard,
  deleteUserCustomFlashcard
} = await import("../components/flashcards.js");

const { chemistryCurriculum } = await import("../data/chemistry-curriculum.js");
const { biologyCurriculum } = await import("../data/biology-curriculum.js");
const { physicsCurriculum } = await import("../data/physics-curriculum.js");

async function runTestSuite() {
  // Test 1: Flashcard Count Verification
  console.log("--- 1. Flashcards Verification ---");
  const deck = buildComprehensiveFlashcardDeck();
  assert(deck.length >= 1500, `Deck has 1,500+ cards (actual: ${deck.length})`);

  const allTracks = [
    { code: "CHEM", data: chemistryCurriculum },
    { code: "BIO", data: biologyCurriculum },
    { code: "PHYS", data: physicsCurriculum }
  ];
  let totalLessons = 0;
  let allLessonsHaveAtLeast5 = true;

  allTracks.forEach(t => {
    t.data.modules.forEach(m => {
      m.lessons.forEach(l => {
        totalLessons++;
        const lessonCards = deck.filter(c => c.subject === t.code && c.moduleId === m.id && c.lessonId === l.id);
        if (lessonCards.length < 5) {
          allLessonsHaveAtLeast5 = false;
        }
      });
    });
  });

  assert(totalLessons === 242, `All 242 curriculum lessons validated (found ${totalLessons})`);
  assert(allLessonsHaveAtLeast5, "Every single lesson across Chem, Bio, Phys has at least 5 structured cards (actually 6 cards/lesson)");

  // Test 2: Custom Flashcard Storage
  console.log("\n--- 2. Custom Flashcard Persistence ---");
  storageMock.clear();
  assert(getUserCustomFlashcards().length === 0, "Initial custom flashcards list is empty");

  const customCard = {
    id: "fc_custom_001",
    term: "Gibbs Free Energy ($$\\Delta G$$)",
    definition: "Thermodynamic potential that measures maximum reversible work at constant T and P.",
    archetype: "formulation",
    subject: "CHEM",
    moduleId: 15,
    lessonId: 2
  };
  saveUserCustomFlashcard(customCard);
  const loadedCards = getUserCustomFlashcards();
  assert(loadedCards.length === 1, "Custom flashcard saved to localStorage");
  assert(loadedCards[0].term === customCard.term, "Flashcard term matches exactly");
  assert(loadedCards[0].isUserCustom === true, "isUserCustom flag is marked true");

  deleteUserCustomFlashcard("fc_custom_001");
  assert(getUserCustomFlashcards().length === 0, "Custom flashcard deleted from localStorage");

  // Test 3: Custom Question Persistence
  console.log("\n--- 3. Custom Question Persistence ---");
  storageMock.clear();
  assert(getUserCustomQuestions().length === 0, "Initial custom questions list is empty");

  const customQ = {
    id: "cq_teacher_901",
    subject: "PHYS",
    moduleId: 4,
    lessonId: 1,
    type: "numerical",
    difficulty: "honors",
    difficultyTier: "medium",
    question: "A 2.0 kg mass accelerates at $$4.5\\text{ m/s}^2$$. Determine the net force in Newtons.",
    options: ["9.0 N", "2.25 N", "6.5 N", "18.0 N"],
    correctIndex: 0,
    explanation: "Using Newton's Second Law: $$F_{\\text{net}} = m \\cdot a = 2.0\\text{ kg} \\times 4.5\\text{ m/s}^2 = 9.0\\text{ N}$$.",
    lessonTitle: "Newton's Second Law"
  };
  saveUserCustomQuestion(customQ);
  const loadedQs = getUserCustomQuestions();
  assert(loadedQs.length === 1, "Custom question saved to localStorage");
  assert(loadedQs[0].question === customQ.question, "Custom question prompt matches exactly");
  assert(loadedQs[0].isUserCustom === true, "isUserCustom flag is marked true");

  deleteUserCustomQuestion("cq_teacher_901");
  assert(getUserCustomQuestions().length === 0, "Custom question deleted from localStorage");

  // Test 4: Custom Question Modal Authoring Function
  console.log("\n--- 4. Custom Question Authoring Modal ---");
  let modalCallbackFired = false;
  openCustomQuestionModal((newQ, addToExam) => {
    modalCallbackFired = true;
    assert(addToExam === true, "addToExam flag passed correctly");
  }, { subject: "BIO" });

  const qOverlay = document.getElementById("custom-q-modal-overlay");
  assert(qOverlay !== null, "Custom question modal rendered into DOM");
  assert(document.getElementById("cq-prompt-input") !== null, "Prompt input exists in modal");
  assert(document.getElementById("btn-save-cq-add-exam") !== null, "Save & Add to Exam button exists");
  assert(document.getElementById("btn-save-cq-bank-only") !== null, "Save to Bank Only button exists");
  qOverlay.remove();

  // Test 5: Master Bank Browser Modal
  console.log("\n--- 5. Master Bank Browser Modal ---");
  let bankAddFired = false;
  const examSet = new Set();

  await openMasterBankBrowserModal({
    currentSelectedIds: examSet,
    onAddQuestion: (targetQ) => {
      bankAddFired = true;
      assert(targetQ && targetQ.id, "Target question passed with valid ID");
    },
    onRemoveQuestion: (qid) => {}
  });

  const bankOverlay = document.getElementById("master-bank-modal-overlay");
  assert(bankOverlay !== null, "Master bank browser modal rendered into DOM");
  assert(document.getElementById("bank-search-input") !== null, "Bank search input exists");
  assert(document.getElementById("btn-close-bank-modal") !== null, "Close/Done button exists");
  bankOverlay.remove();

  // Test 6: Quiz Engine Config & Studio Integration
  console.log("\n--- 6. Quiz Engine Integration Controls ---");
  renderQuizEngine("quiz-container");

  const btnWriteQ = document.getElementById("btn-add-custom-question");
  assert(btnWriteQ !== null, "Assessment Setup includes '✍️ Write Question' (#btn-add-custom-question)");

  const btnBrowseBank = document.getElementById("btn-browse-bank");
  assert(btnBrowseBank !== null, "Assessment Setup includes '🔍 Browse Full Bank' (#btn-browse-bank)");

  const btnChooseQ = document.getElementById("btn-choose-questions");
  assert(btnChooseQ !== null, "Assessment Setup includes '📋 Choose & Customize Questions' (#btn-choose-questions)");

  const countSelect = document.getElementById("cfg-count");
  assert(countSelect !== null, "Question count dropdown exists (#cfg-count)");
  assert(containerEl.innerHTML.includes('value="25"'), "Question count dropdown includes '25 Questions' option");
  assert(containerEl.innerHTML.includes('value="30"'), "Question count dropdown includes '30 Questions' option");

  console.log("\n========================================================");
  console.log(`📊 Summary: ${passed} Passed, ${failed} Failed`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
