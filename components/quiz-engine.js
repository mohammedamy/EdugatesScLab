// Edugates-ClipSAT Science Labs - Customizable Quiz & Exam Generator Engine
// Granular Curriculum Scope Checklist: Subject Track Selection, Module & Lesson Multi-Select,
// Live Question Synthesis, KaTeX Mathematical Typesetting, Smartboard Classroom Presenter, and Print/PDF Exporter.

let loadedQuestionBank = null;
let loadingBankPromise = null;

export async function getQuestionBank() {
  if (loadedQuestionBank) return loadedQuestionBank;
  if (!loadingBankPromise) {
    loadingBankPromise = import("../data/question-bank.js")
      .then(m => {
        loadedQuestionBank = m.questionBank;
        return loadedQuestionBank;
      })
      .catch(err => {
        console.error("[Quiz Engine] Failed to load question bank:", err);
        loadingBankPromise = null;
        return [];
      });
  }
  return loadingBankPromise;
}

import { chemistryCurriculum } from "../data/chemistry-curriculum.js";
import { biologyCurriculum } from "../data/biology-curriculum.js";
import { physicsCurriculum } from "../data/physics-curriculum.js";
import { ProgressStore } from "./progress-tracker.js";
import { formatMathText, renderMathInElement, renderLatex } from "../utils/math-renderer.js";
import { SoundFX } from "../utils/audio-synth.js";
import { showToast, copyShareLink } from "../utils/toast.js";
import { generateQRSvg } from "../utils/qr-code.js";
import { openLmsShareModal } from "../utils/lms-share.js";
import { toggleScienceCalculator } from "./science-calculator.js";
import { exportToDocx } from "../utils/docx-export.js";

export function renderQuizEngine(containerId, initialConfig = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // View state: 'config', 'test', 'presenter', 'results', 'print'
  let viewState = "config";
  let activeQuestions = [];
  let userAnswers = {}; // { questionId: selectedIndex }
  let examMode = (initialConfig && initialConfig.mode) ? initialConfig.mode : "practice"; // 'practice', 'timed', 'presenter', 'print'
  let initialDifficulty = (initialConfig && initialConfig.diff) ? initialConfig.diff : "ALL";
  let initialCount = (initialConfig && initialConfig.count) ? initialConfig.count : "10";
  let initialQType = (initialConfig && initialConfig.qtype) ? initialConfig.qtype : "ALL";
  let timeRemaining = 0;
  let timerInterval = null;
  let presenterIndex = 0;
  let presenterRevealed = false;
  let presenterPolls = {}; // { qId: [countA, countB, countC, countD] }
  let presenterKeyHandler = null;

  // Curriculum Scope State (File Explorer)
  let selectedSubject = (initialConfig && initialConfig.subj) ? initialConfig.subj.toUpperCase() : "CHEM"; // 'CHEM', 'BIO', 'PHYS', 'ALL'
  if (!["CHEM", "BIO", "PHYS", "ALL"].includes(selectedSubject)) selectedSubject = "CHEM";

  let selectedLessons = new Set(); // Set of "SUBJECT-M{id}-L{id}"
  let lessonSearchQuery = "";
  let activeFilterChip = "ALL"; // 'ALL', 'LABS', 'SELECTED', 'UNSELECTED'
  let collapsedUnits = new Set(); // Explicitly collapsed unit keys
  let expandedModules = new Set(); // Explicitly expanded module keys
  let collapsedModules = new Set(); // Explicitly collapsed module keys

  // Curricula registry
  const curricula = {
    CHEM: chemistryCurriculum,
    BIO: biologyCurriculum,
    PHYS: physicsCurriculum
  };

  function removePresenterKeyHandler() {
    if (presenterKeyHandler) {
      window.removeEventListener("keydown", presenterKeyHandler);
      presenterKeyHandler = null;
    }
  }

  // Initialize default scope: Start with clean EMPTY checkboxes (unless explicit scope preset is provided)
  function initDefaultScope() {
    selectedLessons.clear();
    expandedModules.clear();
    collapsedModules.clear();
    collapsedUnits.clear();
    if (initialConfig && initialConfig.scope) {
      const scopeItems = initialConfig.scope.split(",");
      scopeItems.forEach(s => {
        const item = s.trim();
        if (item) {
          selectedLessons.add(item);
          const parts = item.split("-");
          if (parts.length >= 2) {
            expandedModules.add(`${parts[0]}-${parts[1]}`);
          }
        }
      });
    }
    // Note: By user design, all checkboxes start empty so user can choose their exact scope deliberately
  }
  initDefaultScope();

  // Non-blocking background prefetch of question bank so it is warm by the time teacher clicks Generate
  if (typeof window !== "undefined") {
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(() => getQuestionBank(), { timeout: 2500 });
    } else {
      setTimeout(() => getQuestionBank(), 800);
    }
  }

  function showConfig() {
    viewState = "config";
    removePresenterKeyHandler();
    if (timerInterval) clearInterval(timerInterval);

    container.innerHTML = `
      <div class="quiz-generator-view">
        <div class="quiz-config-card" style="background: rgba(15, 23, 42, 0.95); border: 1.5px solid var(--border-color); border-radius: var(--radius-lg); padding: 28px; box-shadow: 0 20px 50px rgba(0,0,0,0.6);">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <span class="badge" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); padding: 5px 14px; border-radius: 9999px; font-weight: 700; font-size: 0.82rem; letter-spacing: 0.05em; text-transform: uppercase;">
                Interactive Assessment Studio
              </span>
              <span id="scope-status-pill" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); padding: 5px 14px; border-radius: 9999px; font-weight: 700; font-size: 0.82rem; font-family: var(--font-mono);">
                Selected Scope: ${selectedLessons.size} Lessons
              </span>
              <button class="btn btn-secondary" id="btn-share-quiz-setup" style="padding: 5px 12px; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 6px; border-radius: 9999px;" title="Copy shareable deep-link for this assessment setup">
                <span>🔗</span>
                <span>Share Preset Link</span>
              </button>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-dim); font-family: var(--font-mono);">
              Curriculum-Aligned • SAT Subject &amp; AP Standards
            </div>
          </div>

          <h2 style="font-family: var(--font-heading); font-size: 2rem; font-weight: 800; margin-bottom: 6px; color: var(--text-main);">
            Customizable Quiz &amp; Exam Generator
          </h2>
          <p style="color: var(--text-muted); max-width: 820px; font-size: 0.95rem; line-height: 1.5; margin-bottom: 24px;">
            Select your discipline, tailor the exact scope by selecting individual modules and lessons, and generate computer-based practice quizzes, timed mock examinations, Smartboard classroom presentations, or printable paper tests with complete step-by-step teacher solutions.
          </p>

          <!-- Step 1: Subject Selection Cards -->
          <div style="margin-bottom: 24px;">
            <label style="font-size: 0.85rem; font-weight: 700; color: #0284c7; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 10px;">
              Step 1: Choose Science Discipline
            </label>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px;">
              <div class="subject-choice-card ${selectedSubject === 'CHEM' ? 'active' : ''}" data-subj="CHEM" style="cursor: pointer; background: rgba(6, 182, 212, 0.08); border: 2px solid ${selectedSubject === 'CHEM' ? '#06b6d4' : 'rgba(6, 182, 212, 0.2)'}; border-radius: 12px; padding: 16px; transition: all 0.2s ease;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                  <span style="font-size: 1.5rem;">🧪</span>
                  <span style="font-size: 0.72rem; font-family: var(--font-mono); color: #06b6d4; font-weight: 700; background: rgba(6, 182, 212, 0.15); padding: 2px 8px; border-radius: 4px;">23 Modules</span>
                </div>
                <div style="font-weight: 800; font-size: 1.1rem; color: var(--text-main);">Inspire Chemistry</div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Stoichiometry, Kinetics, Thermochem, Acids/Bases</div>
              </div>

              <div class="subject-choice-card ${selectedSubject === 'BIO' ? 'active' : ''}" data-subj="BIO" style="cursor: pointer; background: rgba(16, 185, 129, 0.08); border: 2px solid ${selectedSubject === 'BIO' ? '#10b981' : 'rgba(16, 185, 129, 0.2)'}; border-radius: 12px; padding: 16px; transition: all 0.2s ease;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                  <span style="font-size: 1.5rem;">🧬</span>
                  <span style="font-size: 0.72rem; font-family: var(--font-mono); color: #10b981; font-weight: 700; background: rgba(16, 185, 129, 0.15); padding: 2px 8px; border-radius: 4px;">27 Modules</span>
                </div>
                <div style="font-weight: 800; font-size: 1.1rem; color: var(--text-main);">Inspire Biology</div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Cellular Mitosis, Molecular Genetics, Ecology, Anatomy</div>
              </div>

              <div class="subject-choice-card ${selectedSubject === 'PHYS' ? 'active' : ''}" data-subj="PHYS" style="cursor: pointer; background: rgba(59, 130, 246, 0.08); border: 2px solid ${selectedSubject === 'PHYS' ? '#3b82f6' : 'rgba(59, 130, 246, 0.2)'}; border-radius: 12px; padding: 16px; transition: all 0.2s ease;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                  <span style="font-size: 1.5rem;">⚡</span>
                  <span style="font-size: 0.72rem; font-family: var(--font-mono); color: #3b82f6; font-weight: 700; background: rgba(59, 130, 246, 0.15); padding: 2px 8px; border-radius: 4px;">24 Modules</span>
                </div>
                <div style="font-weight: 800; font-size: 1.1rem; color: var(--text-main);">Inspire Physics</div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Kinematics, Newton's Laws, Optics, Circuits, Electromagnetism</div>
              </div>

              <div class="subject-choice-card ${selectedSubject === 'ALL' ? 'active' : ''}" data-subj="ALL" style="cursor: pointer; background: rgba(168, 85, 247, 0.08); border: 2px solid ${selectedSubject === 'ALL' ? '#a855f7' : 'rgba(168, 85, 247, 0.2)'}; border-radius: 12px; padding: 16px; transition: all 0.2s ease;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                  <span style="font-size: 1.5rem;">🌐</span>
                  <span style="font-size: 0.72rem; font-family: var(--font-mono); color: #a855f7; font-weight: 700; background: rgba(168, 85, 247, 0.15); padding: 2px 8px; border-radius: 4px;">74 Modules</span>
                </div>
                <div style="font-weight: 800; font-size: 1.1rem; color: var(--text-main);">Integrated STEM</div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Comprehensive Cross-Discipline Benchmark Examination</div>
              </div>
            </div>
          </div>

          <!-- Step 2: Hierarchical Curriculum File Explorer Scope -->
          <div class="exam-scope-card" style="margin-bottom: 26px; background: var(--bg-card); border: 1.5px solid var(--border-color); border-radius: var(--radius-md); padding: 22px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 16px;">
              <div>
                <label style="font-size: 0.92rem; font-weight: 800; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 1.25rem;">📂</span> Step 2: Curriculum File Explorer Scope
                </label>
                <div style="font-size: 0.83rem; color: var(--text-muted); margin-top: 3px;">
                  Browse <strong>Units</strong>, <strong>Chapters</strong>, and <strong>Lessons</strong> with empty checkboxes to customize your exam scope:
                </div>
              </div>

              <!-- Quick Selection Utility Buttons -->
              <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
                <button class="btn btn-secondary btn-scope-action" id="btn-scope-all" style="padding: 6px 14px; font-size: 0.8rem; font-weight: 700;">
                  ✓ Select All
                </button>
                <button class="btn btn-secondary btn-scope-action" id="btn-scope-none" style="padding: 6px 14px; font-size: 0.8rem; font-weight: 700;">
                  ✕ Clear Selection
                </button>
                <button class="btn btn-secondary btn-scope-action" id="btn-scope-labs" style="padding: 6px 14px; font-size: 0.8rem; font-weight: 700;">
                  🔬 Labs Only
                </button>
                <button class="btn btn-secondary btn-scope-action" id="btn-scope-expand-all" style="padding: 6px 14px; font-size: 0.8rem;">
                  📂 Expand All
                </button>
                <button class="btn btn-secondary btn-scope-action" id="btn-scope-collapse-all" style="padding: 6px 14px; font-size: 0.8rem;">
                  📁 Collapse All
                </button>
              </div>
            </div>

            <!-- Deep Real-Time Search & Scope Filter Bar -->
            <div style="margin-bottom: 14px; display: flex; flex-direction: column; gap: 10px;">
              <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                <div style="position: relative; flex: 1; min-width: 280px;">
                  <input type="text" id="input-search-lessons" class="search-input" placeholder="Search by lesson, concept, formula, objective (e.g., density, redox, DNA, optics, Newton)..." value="${lessonSearchQuery}" style="width: 100%; padding-left: 40px; padding-right: 36px; height: 44px; font-size: 0.92rem; border-radius: 8px;">
                  <span style="position: absolute; left: 14px; top: 13px; color: var(--text-dim); font-size: 1.05rem;">🔍</span>
                  ${lessonSearchQuery ? `<button id="btn-clear-lesson-search" style="position: absolute; right: 12px; top: 11px; background: transparent; border: none; color: var(--text-dim); cursor: pointer; font-size: 1.1rem; line-height: 1;">✕</button>` : ''}
                </div>
                <div id="scope-counter-badge" class="scope-counter-badge" style="font-family: var(--font-mono); font-size: 0.84rem; padding: 10px 16px; border-radius: 8px; white-space: nowrap; font-weight: 700;">
                  Loading explorer...
                </div>
              </div>

              <!-- Quick Scope Filter Chips & Search Action Bar -->
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <div class="explorer-filter-chips" style="display: flex; gap: 6px; flex-wrap: wrap;">
                  <button class="filter-chip ${activeFilterChip === 'ALL' ? 'active' : ''}" data-chip="ALL" style="cursor: pointer; padding: 4px 10px; font-size: 0.76rem; border-radius: 999px; font-weight: 700; transition: all 0.15s ease;">
                    All Lessons
                  </button>
                  <button class="filter-chip ${activeFilterChip === 'LABS' ? 'active' : ''}" data-chip="LABS" style="cursor: pointer; padding: 4px 10px; font-size: 0.76rem; border-radius: 999px; font-weight: 700; transition: all 0.15s ease;">
                    🔬 Virtual Labs Only
                  </button>
                  <button class="filter-chip ${activeFilterChip === 'SELECTED' ? 'active' : ''}" data-chip="SELECTED" style="cursor: pointer; padding: 4px 10px; font-size: 0.76rem; border-radius: 999px; font-weight: 700; transition: all 0.15s ease;">
                    ✓ In Scope (<span id="chip-selected-count">${selectedLessons.size}</span>)
                  </button>
                  <button class="filter-chip ${activeFilterChip === 'UNSELECTED' ? 'active' : ''}" data-chip="UNSELECTED" style="cursor: pointer; padding: 4px 10px; font-size: 0.76rem; border-radius: 999px; font-weight: 700; transition: all 0.15s ease;">
                    Empty / Excluded
                  </button>
                </div>

                <div id="search-action-container" style="display: flex; gap: 8px; align-items: center;">
                  <!-- Dynamic batch buttons rendered in renderCurriculumChecklist -->
                </div>
              </div>
            </div>

            <!-- Helpful Guidance Banner when 0 items are selected -->
            <div id="empty-scope-hint" style="display: ${selectedLessons.size === 0 ? 'flex' : 'none'}; align-items: center; gap: 10px; background: rgba(14, 165, 233, 0.08); border: 1px dashed rgba(14, 165, 233, 0.35); border-radius: 8px; padding: 10px 14px; margin-bottom: 12px; font-size: 0.82rem; color: #0284c7;">
              <span style="font-size: 1.1rem;">💡</span>
              <span><strong>All checkboxes are empty:</strong> Check any <strong>Unit</strong> folder to include its entire curriculum, check a <strong>Chapter</strong>, or pick individual <strong>Lessons</strong>.</span>
            </div>

            <!-- Scrollable File Explorer Tree Container -->
            <div id="curriculum-checklist-container" class="curriculum-tree-container" style="max-height: 540px; overflow-y: auto; overflow-x: hidden; padding-right: 6px; display: flex; flex-direction: column; gap: 10px;">
              <!-- Rendered dynamically -->
            </div>
          </div>

          <!-- Step 3: Exam Architecture & Controls -->
          <div style="margin-bottom: 24px;">
            <label style="font-size: 0.85rem; font-weight: 700; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 12px;">
              Step 3: Assessment Parameters &amp; Delivery Mode
            </label>
            <div class="quiz-config-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
              <div class="control-group">
                <label class="control-label"><span>Difficulty Level</span></label>
                <select id="cfg-difficulty" class="select-input">
                  <option value="ALL" ${initialDifficulty === 'ALL' ? 'selected' : ''}>All Levels (Adaptive Standard)</option>
                  <option value="foundational" ${initialDifficulty === 'foundational' ? 'selected' : ''}>Foundational (Standard High School)</option>
                  <option value="honors" ${initialDifficulty === 'honors' ? 'selected' : ''}>Honors / Advanced STEM</option>
                  <option value="ap_olympiad" ${initialDifficulty === 'ap_olympiad' ? 'selected' : ''}>AP / SAT Subject / Olympiad</option>
                </select>
              </div>

              <div class="control-group">
                <label class="control-label"><span>Question Count</span></label>
                <select id="cfg-count" class="select-input">
                  <option value="5" ${initialCount === '5' ? 'selected' : ''}>5 Questions (Quick Check)</option>
                  <option value="10" ${initialCount === '10' ? 'selected' : ''}>10 Questions (Standard Quiz)</option>
                  <option value="15" ${initialCount === '15' ? 'selected' : ''}>15 Questions (Module Test)</option>
                  <option value="20" ${initialCount === '20' ? 'selected' : ''}>20 Questions (Quarterly Exam)</option>
                  <option value="ALL" ${initialCount === 'ALL' ? 'selected' : ''}>All Available in Selected Scope</option>
                </select>
              </div>

              <div class="control-group">
                <label class="control-label"><span>Question Type Filter</span></label>
                <select id="cfg-qtype" class="select-input">
                  <option value="ALL" ${initialQType === 'ALL' ? 'selected' : ''}>All Question Types (Mixed)</option>
                  <option value="diagram" ${initialQType === 'diagram' ? 'selected' : ''}>📊 Diagram &amp; Visual Models</option>
                  <option value="mcq" ${initialQType === 'mcq' ? 'selected' : ''}>Multiple Choice Concepts</option>
                  <option value="numerical" ${initialQType === 'numerical' ? 'selected' : ''}>Numerical / Formula Calculations</option>
                  <option value="cer" ${initialQType === 'cer' ? 'selected' : ''}>Scientific Inquiry &amp; CER Analysis</option>
                </select>
              </div>

              <div class="control-group">
                <label class="control-label"><span>Assessment Mode</span></label>
                <select id="cfg-mode" class="select-input">
                  <option value="practice" ${examMode === 'practice' ? 'selected' : ''}>Interactive Practice (Instant Feedback &amp; Hints)</option>
                  <option value="timed" ${examMode === 'timed' ? 'selected' : ''}>Timed Examination (Countdown Timer &amp; Scorecard)</option>
                  <option value="presenter" ${examMode === 'presenter' ? 'selected' : ''}>Smartboard Presenter (Full-Display Slide &amp; Class Poll)</option>
                  <option value="print" ${examMode === 'print' ? 'selected' : ''}>Printable Test Paper &amp; Answer Key (PDF / Paper)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Generate Action Button -->
          <div style="display: flex; gap: 14px; align-items: center; justify-content: space-between; flex-wrap: wrap; border-top: 1px solid var(--border-color); padding-top: 20px;">
            <div style="font-size: 0.88rem; color: #94a3b8;">
              Ready to generate: <strong id="summary-ready-count" style="color: #38bdf8;">${initialCount === 'ALL' ? 'all matching' : `${initialCount} questions`}</strong> from <strong id="summary-scope-count" style="color: #10b981;">${selectedLessons.size} selected lessons</strong>.
            </div>
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
              <button class="btn btn-secondary" id="btn-config-share-lms" title="Share this Quiz preset to Google Classroom or Classera" style="padding: 12px 20px; font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; gap: 8px;">
                <span>📤 Share to LMS</span>
              </button>
              <button class="btn btn-accent" id="btn-generate-exam" style="padding: 12px 32px; font-weight: 800; font-size: 1.05rem; display: flex; align-items: center; gap: 10px; box-shadow: 0 0 25px rgba(245, 158, 11, 0.4);">
                <span>⚡ Generate Assessment Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    renderCurriculumChecklist();
    bindConfigEvents();
  }

  // Group modules into Units for a subject
  function getSubjectUnitTree(subKey) {
    const cur = curricula[subKey];
    if (!cur) return [];
    const unitMap = new Map();
    cur.modules.forEach(m => {
      const rawUnit = m.unit || "General Unit";
      if (!unitMap.has(rawUnit)) {
        unitMap.set(rawUnit, {
          title: rawUnit,
          modules: []
        });
      }
      unitMap.get(rawUnit).modules.push(m);
    });

    return Array.from(unitMap.entries()).map(([rawUnit, data], uIdx) => {
      let cleanTitle = rawUnit;
      if (!cleanTitle.toLowerCase().startsWith("unit ")) {
        cleanTitle = `Unit ${uIdx + 1}: ${rawUnit}`;
      }
      return {
        unitKey: `${subKey}-U${uIdx + 1}`,
        rawUnit,
        cleanTitle,
        subject: subKey,
        color: cur.color,
        subjectTitle: cur.subject,
        modules: data.modules
      };
    });
  }

  function highlightMatches(text, query) {
    if (!query || !text) return text || "";
    const tokens = query.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return text;
    const escaped = tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join("|");
    const regex = new RegExp(`(${escaped})`, 'gi');
    return String(text).replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  // --- RENDER HIERARCHICAL CURRICULUM FILE EXPLORER (UNITS -> CHAPTERS -> LESSONS) ---
  function renderCurriculumChecklist() {
    const listContainer = document.getElementById("curriculum-checklist-container");
    if (!listContainer) return;

    const prevScrollTop = listContainer.scrollTop;

    // Collect active subjects to render
    const activeSubjs = selectedSubject === "ALL" ? ["CHEM", "BIO", "PHYS"] : [selectedSubject];
    const query = lessonSearchQuery.trim().toLowerCase();
    const tokens = query.split(/\s+/).filter(Boolean);

    let html = "";
    let totalVisibleLessons = 0;
    let totalPossibleLessons = 0;
    const visibleLessonKeys = new Set();

    activeSubjs.forEach(subKey => {
      const cur = curricula[subKey];
      if (!cur) return;

      const units = getSubjectUnitTree(subKey);

      units.forEach(unit => {
        // Collect all lessons in this unit
        const allUnitLessonKeys = [];
        const matchingModulesInUnit = [];

        unit.modules.forEach(m => {
          totalPossibleLessons += m.lessons.length;

          const matchingLessonsInMod = [];
          m.lessons.forEach(l => {
            const lKey = `${subKey}-M${m.id}-L${l.id}`;
            allUnitLessonKeys.push(lKey);

            // 1. Chip Filter
            const isChecked = selectedLessons.has(lKey);
            if (activeFilterChip === "LABS" && !m.lab) return;
            if (activeFilterChip === "SELECTED" && !isChecked) return;
            if (activeFilterChip === "UNSELECTED" && isChecked) return;

            // 2. Deep Search Query Match across title, ID, objectives, formulas, phenomenon, bigIdea
            if (tokens.length > 0) {
              const searchable = [
                l.title,
                `lesson ${l.id}`,
                `L${l.id}`,
                lKey,
                m.title,
                m.code,
                m.unit || "",
                cur.subject,
                (l.objectives || []).join(" "),
                (m.formulas || []).join(" "),
                m.phenomenon || "",
                m.bigIdea || ""
              ].join(" ").toLowerCase();

              const matchesAll = tokens.every(tok => searchable.includes(tok));
              if (!matchesAll) return;
            }

            matchingLessonsInMod.push(l);
            visibleLessonKeys.add(lKey);
          });

          if (matchingLessonsInMod.length > 0) {
            matchingModulesInUnit.push({
              module: m,
              lessons: matchingLessonsInMod
            });
          }
        });

        if (matchingModulesInUnit.length === 0) return;

        // Count visible lessons in this unit
        const unitVisibleLessonsCount = matchingModulesInUnit.reduce((acc, item) => acc + item.lessons.length, 0);
        totalVisibleLessons += unitVisibleLessonsCount;

        // Unit Selection State (Evaluated across ALL lessons in this unit)
        const unitSelectedCount = allUnitLessonKeys.filter(k => selectedLessons.has(k)).length;
        const allUnitSelected = unitSelectedCount === allUnitLessonKeys.length && allUnitLessonKeys.length > 0;
        const someUnitSelected = unitSelectedCount > 0 && !allUnitSelected;

        // Auto-expand if searching or filtering, otherwise respect user collapse
        const isUnitAutoExpanded = tokens.length > 0 || activeFilterChip !== "ALL";
        const isUnitCollapsed = !isUnitAutoExpanded && collapsedUnits.has(unit.unitKey);

        html += `
          <div class="tree-node-unit ${unitSelectedCount > 0 ? 'has-selected' : ''}" data-unitkey="${unit.unitKey}">
            <!-- Level 1: Unit Header (Folder) -->
            <div class="tree-unit-header" data-unitkey="${unit.unitKey}">
              <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;">
                <span class="unit-toggle-arrow" style="font-size: 0.75rem; color: var(--text-dim); transition: transform 0.2s ease; transform: rotate(${isUnitCollapsed ? '-90deg' : '0deg'});">▼</span>
                <input type="checkbox" class="tree-unit-cb" data-unitkey="${unit.unitKey}" ${allUnitSelected ? 'checked' : ''} ${someUnitSelected ? 'data-indeterminate="true"' : ''} title="Select/Deselect all lessons in ${unit.cleanTitle}">
                <span class="unit-folder-icon" style="font-size: 1.15rem; line-height: 1;">${isUnitCollapsed ? '📁' : '📂'}</span>
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  ${selectedSubject === "ALL" ? `<span style="font-family: var(--font-mono); font-size: 0.72rem; font-weight: 800; color: ${unit.color}; background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px;">${unit.subject}</span>` : ''}
                  <span style="font-weight: 800; font-size: 0.95rem; color: var(--text-main);">${highlightMatches(unit.cleanTitle, query)}</span>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
                <span style="font-size: 0.75rem; font-family: var(--font-mono); font-weight: 700; color: ${unitSelectedCount > 0 ? '#10b981' : 'var(--text-dim)'}; background: ${unitSelectedCount > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(0,0,0,0.05)'}; padding: 3px 8px; border-radius: 4px;">
                  ${unitSelectedCount} / ${allUnitLessonKeys.length} Selected
                </span>
                <span style="font-size: 0.74rem; color: var(--text-dim); font-family: var(--font-mono);">
                  ${matchingModulesInUnit.length} ${matchingModulesInUnit.length === 1 ? 'Chapter' : 'Chapters'}
                </span>
              </div>
            </div>

            <!-- Level 2: Unit Body (Contains Chapters / Modules) -->
            <div class="tree-unit-body" style="display: ${isUnitCollapsed ? 'none' : 'flex'};">
              ${matchingModulesInUnit.map(({ module: m, lessons: matchingLessonsInMod }) => {
                const modKey = `${subKey}-M${m.id}`;
                const allModLessonKeys = m.lessons.map(l => `${subKey}-M${m.id}-L${l.id}`);
                const modSelectedCount = allModLessonKeys.filter(k => selectedLessons.has(k)).length;
                const allModSelected = modSelectedCount === allModLessonKeys.length && allModLessonKeys.length > 0;
                const someModSelected = modSelectedCount > 0 && !allModSelected;

                const isModAutoExpanded = tokens.length > 0 || activeFilterChip !== "ALL";
                const isModExplicitlyExpanded = expandedModules.has(modKey);
                const isModExplicitlyCollapsed = collapsedModules.has(modKey);

                let isModExpanded = false;
                if (isModAutoExpanded) {
                  isModExpanded = !isModExplicitlyCollapsed;
                } else if (isModExplicitlyExpanded) {
                  isModExpanded = true;
                } else if (isModExplicitlyCollapsed) {
                  isModExpanded = false;
                } else {
                  isModExpanded = modSelectedCount > 0;
                }

                return `
                  <div class="tree-node-module ${modSelectedCount > 0 ? 'has-selected' : ''}" data-modkey="${modKey}">
                    <!-- Level 2: Chapter / Module Header -->
                    <div class="tree-module-header" data-modkey="${modKey}">
                      <div style="display: flex; align-items: center; gap: 9px; flex: 1; min-width: 0;">
                        <span class="mod-toggle-arrow" style="font-size: 0.72rem; color: #38bdf8; transition: transform 0.2s ease; display: inline-block; transform: rotate(${isModExpanded ? '0deg' : '-90deg'});">▼</span>
                        <input type="checkbox" class="tree-mod-cb" data-modkey="${modKey}" data-subj="${subKey}" data-mid="${m.id}" ${allModSelected ? 'checked' : ''} ${someModSelected ? 'data-indeterminate="true"' : ''} title="Select/Deselect all lessons in ${m.code}">
                        <span class="mod-folder-icon" style="font-size: 1rem; line-height: 1;">${isModExpanded ? '📖' : '📑'}</span>
                        <span style="font-family: var(--font-mono); font-size: 0.76rem; font-weight: 800; color: ${cur.color}; background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px;">${m.code}</span>
                        <span style="font-weight: 700; font-size: 0.9rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${highlightMatches(m.title, query)}</span>
                      </div>
                      <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
                        ${m.lab ? `<span style="font-size: 0.7rem; color: #10b981; background: rgba(16,185,129,0.15); padding: 2px 7px; border-radius: 4px; font-weight: 700;">🔬 Lab</span>` : ''}
                        <span style="font-size: 0.74rem; font-family: var(--font-mono); font-weight: 700; color: ${modSelectedCount > 0 ? '#10b981' : 'var(--text-dim)'};">
                          ${modSelectedCount > 0 ? `${modSelectedCount} / ${allModLessonKeys.length} Selected` : `${allModLessonKeys.length} Lessons`}
                        </span>
                      </div>
                    </div>

                    <!-- Level 3: Lessons Container -->
                    <div class="tree-module-body" style="display: ${isModExpanded ? 'flex' : 'none'};">
                      ${matchingLessonsInMod.map(l => {
                        const lessonKey = `${subKey}-M${m.id}-L${l.id}`;
                        const isChecked = selectedLessons.has(lessonKey);
                        const objTitle = (l.objectives || []).map((o, idx) => `${idx + 1}. ${o}`).join("\n");

                        return `
                          <div class="tree-node-lesson ${isChecked ? 'is-checked' : ''}" data-lessonkey="${lessonKey}">
                            <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;">
                              <input type="checkbox" class="tree-lesson-cb" data-lessonkey="${lessonKey}" ${isChecked ? 'checked' : ''}>
                              <span style="font-size: 0.95rem; line-height: 1;">📄</span>
                              <span style="font-family: var(--font-mono); font-size: 0.74rem; font-weight: 700; color: #0284c7; background: rgba(2,132,199,0.12); padding: 2px 6px; border-radius: 4px; flex-shrink: 0;">L${l.id}</span>
                              <span style="font-weight: 600; font-size: 0.86rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${l.title}">${highlightMatches(l.title, query)}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
                              ${l.objectives ? `<span style="font-size: 0.7rem; color: var(--text-dim); font-family: var(--font-mono); background: rgba(0,0,0,0.04); padding: 2px 6px; border-radius: 4px;" title="${objTitle}">${l.objectives.length} obj</span>` : ''}
                              <span style="font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 4px; font-family: var(--font-mono); background: ${isChecked ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0,0,0,0.04)'}; color: ${isChecked ? '#047857' : 'var(--text-dim)'};">
                                ${isChecked ? '✓ In Scope' : 'Empty'}
                              </span>
                            </div>
                          </div>
                        `;
                      }).join("")}
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          </div>
        `;
      });
    });

    if (totalVisibleLessons === 0) {
      html = `
        <div style="text-align: center; color: var(--text-muted); padding: 36px 16px; font-size: 0.95rem; background: var(--bg-surface-elevated); border-radius: 8px; border: 1px dashed var(--border-color);">
          <div style="font-size: 1.8rem; margin-bottom: 8px;">🔍</div>
          <div style="font-weight: 700; font-size: 1rem; color: var(--text-main);">No lessons match your search / filter criteria</div>
          <div style="color: var(--text-dim); font-size: 0.84rem; margin-top: 6px; max-width: 440px; margin-left: auto; margin-right: auto;">
            No items matched "<strong>${lessonSearchQuery}</strong>". Try searching by scientific term (e.g. "redox", "entropy", "mitosis", "refraction") or reset the filter.
          </div>
          <button class="btn btn-secondary" id="btn-reset-empty-search" style="margin-top: 14px; padding: 6px 16px; font-size: 0.82rem; font-weight: 700;">
            ✕ Reset Search &amp; Filters
          </button>
        </div>
      `;
    }

    listContainer.innerHTML = html;
    listContainer.scrollTop = prevScrollTop;

    // Apply indeterminate properties to tri-state checkboxes
    document.querySelectorAll("[data-indeterminate='true']").forEach(cb => {
      cb.indeterminate = true;
    });

    // Update Counter Badges & Status
    const counterBadge = document.getElementById("scope-counter-badge");
    if (counterBadge) {
      counterBadge.innerHTML = `Showing <strong>${totalVisibleLessons}</strong> of ${totalPossibleLessons} lessons • <strong style="color: #10b981;">${selectedLessons.size}</strong> in scope`;
    }

    const chipSelectedCount = document.getElementById("chip-selected-count");
    if (chipSelectedCount) chipSelectedCount.innerText = selectedLessons.size;

    const statusPill = document.getElementById("scope-status-pill");
    if (statusPill) statusPill.innerText = `Selected Scope: ${selectedLessons.size} Lessons`;

    const scopeCountEl = document.getElementById("summary-scope-count");
    if (scopeCountEl) scopeCountEl.innerText = `${selectedLessons.size} selected lessons`;

    const emptyHint = document.getElementById("empty-scope-hint");
    if (emptyHint) emptyHint.style.display = selectedLessons.size === 0 ? "flex" : "none";

    // Dynamic Filtered Action Buttons
    const searchActionContainer = document.getElementById("search-action-container");
    if (searchActionContainer) {
      if (tokens.length > 0 || activeFilterChip !== "ALL") {
        searchActionContainer.innerHTML = `
          <button class="btn btn-secondary btn-scope-action" id="btn-scope-select-filtered" style="padding: 4px 10px; font-size: 0.76rem; border-color: rgba(56, 189, 248, 0.4); color: #38bdf8; font-weight: 700;">
            ✓ Select Filtered (${totalVisibleLessons})
          </button>
          <button class="btn btn-secondary btn-scope-action" id="btn-scope-clear-filtered" style="padding: 4px 10px; font-size: 0.76rem;">
            ✕ Deselect Filtered
          </button>
        `;
      } else {
        searchActionContainer.innerHTML = "";
      }
    }
  }

  // --- BIND CONFIG EVENTS ---
  function bindConfigEvents() {
    // Subject Choice Cards
    document.querySelectorAll(".subject-choice-card").forEach(card => {
      card.addEventListener("click", () => {
        selectedSubject = card.dataset.subj;
        initDefaultScope();
        showConfig();
      });
    });

    // Search lessons input with debounce & Escape shortcut
    const searchInp = document.getElementById("input-search-lessons");
    if (searchInp) {
      searchInp.addEventListener("input", (e) => {
        lessonSearchQuery = e.target.value;
        renderCurriculumChecklist();
        bindChecklistEvents();
      });
      searchInp.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          lessonSearchQuery = "";
          searchInp.value = "";
          renderCurriculumChecklist();
          bindChecklistEvents();
        }
      });
    }

    // Clear Search Button
    const btnClearSearch = document.getElementById("btn-clear-lesson-search");
    if (btnClearSearch) {
      btnClearSearch.addEventListener("click", () => {
        lessonSearchQuery = "";
        const inp = document.getElementById("input-search-lessons");
        if (inp) inp.value = "";
        renderCurriculumChecklist();
        bindChecklistEvents();
      });
    }

    // Filter Chips
    document.querySelectorAll(".filter-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        activeFilterChip = chip.dataset.chip;
        document.querySelectorAll(".filter-chip").forEach(c => {
          c.classList.toggle("active", c.dataset.chip === activeFilterChip);
        });
        renderCurriculumChecklist();
        bindChecklistEvents();
      });
    });

    // Bulk buttons
    const btnAll = document.getElementById("btn-scope-all");
    if (btnAll) {
      btnAll.addEventListener("click", () => {
        const activeSubjs = selectedSubject === "ALL" ? ["CHEM", "BIO", "PHYS"] : [selectedSubject];
        activeSubjs.forEach(s => {
          curricula[s].modules.forEach(m => {
            m.lessons.forEach(l => {
              selectedLessons.add(`${s}-M${m.id}-L${l.id}`);
            });
          });
        });
        renderCurriculumChecklist();
        bindChecklistEvents();
      });
    }

    const btnNone = document.getElementById("btn-scope-none");
    if (btnNone) {
      btnNone.addEventListener("click", () => {
        selectedLessons.clear();
        renderCurriculumChecklist();
        bindChecklistEvents();
      });
    }

    const btnLabs = document.getElementById("btn-scope-labs");
    if (btnLabs) {
      btnLabs.addEventListener("click", () => {
        selectedLessons.clear();
        const activeSubjs = selectedSubject === "ALL" ? ["CHEM", "BIO", "PHYS"] : [selectedSubject];
        activeSubjs.forEach(s => {
          curricula[s].modules.forEach(m => {
            if (m.lab) {
              m.lessons.forEach(l => {
                selectedLessons.add(`${s}-M${m.id}-L${l.id}`);
              });
            }
          });
        });
        renderCurriculumChecklist();
        bindChecklistEvents();
      });
    }

    // Expand All / Collapse All
    const btnExpandAll = document.getElementById("btn-scope-expand-all");
    if (btnExpandAll) {
      btnExpandAll.addEventListener("click", () => {
        collapsedUnits.clear();
        collapsedModules.clear();
        const activeSubjs = selectedSubject === "ALL" ? ["CHEM", "BIO", "PHYS"] : [selectedSubject];
        activeSubjs.forEach(s => {
          curricula[s].modules.forEach(m => {
            expandedModules.add(`${s}-M${m.id}`);
          });
        });
        renderCurriculumChecklist();
        bindChecklistEvents();
      });
    }

    const btnCollapseAll = document.getElementById("btn-scope-collapse-all");
    if (btnCollapseAll) {
      btnCollapseAll.addEventListener("click", () => {
        expandedModules.clear();
        const activeSubjs = selectedSubject === "ALL" ? ["CHEM", "BIO", "PHYS"] : [selectedSubject];
        activeSubjs.forEach(s => {
          const units = getSubjectUnitTree(s);
          units.forEach(u => {
            collapsedUnits.add(u.unitKey);
            u.modules.forEach(m => collapsedModules.add(`${s}-M${m.id}`));
          });
        });
        renderCurriculumChecklist();
        bindChecklistEvents();
      });
    }

    // Question count listener
    const countSelect = document.getElementById("cfg-count");
    if (countSelect) {
      countSelect.addEventListener("change", (e) => {
        initialCount = e.target.value;
        const readyEl = document.getElementById("summary-ready-count");
        if (readyEl) {
          readyEl.innerText = e.target.value === "ALL" ? "all matching questions" : `${e.target.value} questions`;
        }
      });
    }

    const diffSelect = document.getElementById("cfg-difficulty");
    if (diffSelect) {
      diffSelect.addEventListener("change", (e) => { initialDifficulty = e.target.value; });
    }
    const qtypeSelect = document.getElementById("cfg-qtype");
    if (qtypeSelect) {
      qtypeSelect.addEventListener("change", (e) => { initialQType = e.target.value; });
    }
    const modeSelect = document.getElementById("cfg-mode");
    if (modeSelect) {
      modeSelect.addEventListener("change", (e) => { examMode = e.target.value; });
    }

    const btnShare = document.getElementById("btn-share-quiz-setup");
    if (btnShare) {
      btnShare.addEventListener("click", () => {
        const diffVal = document.getElementById("cfg-difficulty")?.value || initialDifficulty;
        const countVal = document.getElementById("cfg-count")?.value || initialCount;
        const qtypeVal = document.getElementById("cfg-qtype")?.value || initialQType;
        const modeVal = document.getElementById("cfg-mode")?.value || examMode;
        const scopeStr = [...selectedLessons].join(",");
        const hash = `quiz?subj=${selectedSubject}&mode=${modeVal}&count=${countVal}&diff=${diffVal}&qtype=${qtypeVal}&scope=${encodeURIComponent(scopeStr)}`;
        copyShareLink(hash, `${selectedSubject} Quiz Preset (${selectedLessons.size} Lessons)`);
      });
    }

    const btnShareLms = document.getElementById("btn-config-share-lms");
    if (btnShareLms) {
      btnShareLms.addEventListener("click", () => {
        const diffVal = document.getElementById("cfg-difficulty")?.value || initialDifficulty;
        const countVal = document.getElementById("cfg-count")?.value || initialCount;
        const qtypeVal = document.getElementById("cfg-qtype")?.value || initialQType;
        const modeVal = document.getElementById("cfg-mode")?.value || examMode;
        const scopeStr = [...selectedLessons].join(",");
        const lessonCountText = `${selectedLessons.size} ${selectedLessons.size === 1 ? 'Lesson' : 'Lessons'}`;
        openLmsShareModal({
          url: hash,
          title: `${selectedSubject} Custom Assessment (${lessonCountText})`,
          subject: selectedSubject,
          description: `Custom STEM assessment with ${lessonCountText} selected (${countVal} questions). Instant self-grading and explanations.`
        });
      });
    }

    // Generate Exam Button
    const btnGen = document.getElementById("btn-generate-exam");
    if (btnGen) {
      btnGen.addEventListener("click", generateExam);
    }

    bindChecklistEvents();
  }

  function bindChecklistEvents() {
    // 1. Unit Checkbox Change (Cascades to all lessons in unit)
    document.querySelectorAll(".tree-unit-cb").forEach(cb => {
      cb.addEventListener("change", (e) => {
        e.stopPropagation();
        const unitKey = cb.dataset.unitkey;
        const [subKey] = unitKey.split("-");
        const units = getSubjectUnitTree(subKey);
        const unit = units.find(u => u.unitKey === unitKey);
        if (!unit) return;

        if (cb.checked) {
          collapsedUnits.delete(unitKey);
        }

        unit.modules.forEach(m => {
          m.lessons.forEach(l => {
            const lKey = `${subKey}-M${m.id}-L${l.id}`;
            if (cb.checked) {
              selectedLessons.add(lKey);
            } else {
              selectedLessons.delete(lKey);
            }
          });
        });

        renderCurriculumChecklist();
        bindChecklistEvents();
      });
    });

    // 2. Unit Header Toggle (Expand / Collapse)
    document.querySelectorAll(".tree-unit-header").forEach(header => {
      header.addEventListener("click", (e) => {
        if (e.target.closest(".tree-unit-cb")) return;
        const unitKey = header.dataset.unitkey;
        const unitNode = header.closest(".tree-node-unit");
        const unitBody = unitNode ? unitNode.querySelector(".tree-unit-body") : null;
        const arrow = header.querySelector(".unit-toggle-arrow");
        const icon = header.querySelector(".unit-folder-icon");

        const isCurrentlyOpen = unitBody && unitBody.style.display !== "none";

        if (isCurrentlyOpen) {
          if (unitBody) unitBody.style.display = "none";
          if (arrow) arrow.style.transform = "rotate(-90deg)";
          if (icon) icon.innerText = "📁";
          collapsedUnits.add(unitKey);
        } else {
          if (unitBody) unitBody.style.display = "flex";
          if (arrow) arrow.style.transform = "rotate(0deg)";
          if (icon) icon.innerText = "📂";
          collapsedUnits.delete(unitKey);
        }
      });
    });

    // 3. Module Checkbox Change (Cascades to all lessons in module)
    document.querySelectorAll(".tree-mod-cb").forEach(cb => {
      cb.addEventListener("change", (e) => {
        e.stopPropagation();
        const subKey = cb.dataset.subj;
        const mid = parseInt(cb.dataset.mid, 10);
        const modKey = cb.dataset.modkey;
        const cur = curricula[subKey];
        if (!cur) return;
        const mod = cur.modules.find(m => m.id === mid);
        if (!mod) return;

        if (cb.checked && modKey) {
          expandedModules.add(modKey);
          collapsedModules.delete(modKey);
        }

        mod.lessons.forEach(l => {
          const lKey = `${subKey}-M${mid}-L${l.id}`;
          if (cb.checked) {
            selectedLessons.add(lKey);
          } else {
            selectedLessons.delete(lKey);
          }
        });

        renderCurriculumChecklist();
        bindChecklistEvents();
      });
    });

    // 4. Module Header Toggle (Expand / Collapse)
    document.querySelectorAll(".tree-module-header").forEach(header => {
      header.addEventListener("click", (e) => {
        if (e.target.closest(".tree-mod-cb")) return;
        const modKey = header.dataset.modkey;
        const moduleNode = header.closest(".tree-node-module");
        const moduleBody = moduleNode ? moduleNode.querySelector(".tree-module-body") : null;
        const arrow = header.querySelector(".mod-toggle-arrow");
        const icon = header.querySelector(".mod-folder-icon");

        const isCurrentlyOpen = moduleBody && moduleBody.style.display !== "none";

        if (isCurrentlyOpen) {
          if (moduleBody) moduleBody.style.display = "none";
          if (arrow) arrow.style.transform = "rotate(-90deg)";
          if (icon) icon.innerText = "📑";
          expandedModules.delete(modKey);
          collapsedModules.add(modKey);
        } else {
          if (moduleBody) moduleBody.style.display = "flex";
          if (arrow) arrow.style.transform = "rotate(0deg)";
          if (icon) icon.innerText = "📖";
          collapsedModules.delete(modKey);
          expandedModules.add(modKey);
        }
      });
    });

    // 5. Lesson Row / Checkbox Click
    document.querySelectorAll(".tree-node-lesson").forEach(row => {
      row.addEventListener("click", (e) => {
        const lKey = row.dataset.lessonkey;
        const cb = row.querySelector(".tree-lesson-cb");
        if (e.target !== cb) {
          if (selectedLessons.has(lKey)) {
            selectedLessons.delete(lKey);
          } else {
            selectedLessons.add(lKey);
          }
        } else {
          if (cb.checked) {
            selectedLessons.add(lKey);
          } else {
            selectedLessons.delete(lKey);
          }
        }
        renderCurriculumChecklist();
        bindChecklistEvents();
      });
    });

    // 6. Reset Empty Search Button (if visible)
    const btnResetSearch = document.getElementById("btn-reset-empty-search");
    if (btnResetSearch) {
      btnResetSearch.addEventListener("click", () => {
        lessonSearchQuery = "";
        activeFilterChip = "ALL";
        const inp = document.getElementById("input-search-lessons");
        if (inp) inp.value = "";
        renderCurriculumChecklist();
        bindChecklistEvents();
      });
    }

    // 7. Dynamic Filtered Action Buttons
    const btnSelectFiltered = document.getElementById("btn-scope-select-filtered");
    if (btnSelectFiltered) {
      btnSelectFiltered.addEventListener("click", () => {
        document.querySelectorAll(".tree-node-lesson").forEach(row => {
          const lKey = row.dataset.lessonkey;
          if (lKey) selectedLessons.add(lKey);
        });
        renderCurriculumChecklist();
        bindChecklistEvents();
      });
    }

    const btnClearFiltered = document.getElementById("btn-scope-clear-filtered");
    if (btnClearFiltered) {
      btnClearFiltered.addEventListener("click", () => {
        document.querySelectorAll(".tree-node-lesson").forEach(row => {
          const lKey = row.dataset.lessonkey;
          if (lKey) selectedLessons.delete(lKey);
        });
        renderCurriculumChecklist();
        bindChecklistEvents();
      });
    }
  }

  // --- DYNAMIC QUESTION GENERATION & POOL RESOLUTION ---
  async function generateExam() {
    if (selectedLessons.size === 0) {
      showToast("Scope Required", "Please select at least one lesson to establish the assessment scope.", "warning");
      return;
    }

    const btnGen = document.getElementById("btn-generate-exam");
    const origText = btnGen ? btnGen.innerText : "";
    if (btnGen) {
      btnGen.disabled = true;
      btnGen.innerText = "⏳ Loading Question Bank...";
    }

    const difficulty = document.getElementById("cfg-difficulty").value;
    const countVal = document.getElementById("cfg-count").value;
    const qTypeVal = document.getElementById("cfg-qtype").value;
    examMode = document.getElementById("cfg-mode").value;

    let bank;
    try {
      bank = await getQuestionBank();
    } catch (err) {
      console.error("[Quiz Engine] Error loading question bank:", err);
      bank = [];
    } finally {
      if (btnGen) {
        btnGen.disabled = false;
        btnGen.innerText = origText;
      }
    }

    // Parse selected lessons into structured objects
    const scopeLessons = [];
    selectedLessons.forEach(lKey => {
      const parts = lKey.split("-"); // ['CHEM', 'M1', 'L2']
      const subj = parts[0];
      const mid = parseInt(parts[1].replace("M", ""), 10);
      const lid = parseInt(parts[2].replace("L", ""), 10);
      const cur = curricula[subj];
      if (cur) {
        const mod = cur.modules.find(m => m.id === mid);
        if (mod) {
          const les = mod.lessons.find(l => l.id === lid);
          if (les) {
            scopeLessons.push({ subj, mod, les, mid, lid });
          }
        }
      }
    });

    // 1. Gather questions that match the selected lessons (exact lesson-level scope)
    const selectedLessonKeys = new Set(scopeLessons.map(sl => `${sl.subj}-M${sl.mid}-L${sl.lid}`));
    const selectedModIds = new Set(scopeLessons.map(sl => `${sl.subj}-${sl.mid}`));

    let pool = bank.filter(q => {
      const qLessonKey = `${q.subject}-M${q.moduleId}-L${q.lessonId}`;
      const matchScope = q.lessonId 
        ? selectedLessonKeys.has(qLessonKey) 
        : selectedModIds.has(`${q.subject}-${q.moduleId}`);
      const matchDiff = difficulty === "ALL" || q.difficulty === difficulty;
      const matchType = qTypeVal === "ALL" 
        || (qTypeVal === "diagram" ? (q.type === "diagram" || q.hasDiagram || Boolean(q.diagram)) : q.type === qTypeVal);
      return matchScope && matchDiff && matchType;
    });

    // If pool is empty due to ultra-restrictive difficulty/type combination, relax filter to ensure valid assessment
    if (pool.length === 0) {
      pool = bank.filter(q => {
        const qLessonKey = `${q.subject}-M${q.moduleId}-L${q.lessonId}`;
        const matchScope = q.lessonId 
          ? selectedLessonKeys.has(qLessonKey) 
          : selectedModIds.has(`${q.subject}-${q.moduleId}`);
        const matchType = qTypeVal === "ALL" 
          || (qTypeVal === "diagram" ? (q.type === "diagram" || q.hasDiagram || Boolean(q.diagram)) : q.type === qTypeVal);
        return matchScope && matchType;
      });
    }

    if (pool.length === 0) {
      pool = bank.filter(q => {
        const qLessonKey = `${q.subject}-M${q.moduleId}-L${q.lessonId}`;
        return q.lessonId 
          ? selectedLessonKeys.has(qLessonKey) 
          : selectedModIds.has(`${q.subject}-${q.moduleId}`);
      });
    }

    // Fallback synthesis if still empty
    if (pool.length === 0) {
      scopeLessons.forEach((sl, idx) => {
        const synthQ = synthesizeCurriculumQuestion(sl, difficulty, idx);
        if (qTypeVal === "ALL" || synthQ.type === qTypeVal) {
          pool.push(synthQ);
        }
      });
    }

    // Shuffle pool
    pool.sort(() => Math.random() - 0.5);

    // Limit count
    const targetCount = countVal === "ALL" ? pool.length : Math.min(parseInt(countVal, 10), pool.length);
    activeQuestions = pool.slice(0, Math.max(1, targetCount));
    userAnswers = {};
    presenterIndex = 0;
    presenterRevealed = false;
    presenterPolls = {};

    if (examMode === "print") {
      renderPrintView();
    } else if (examMode === "presenter") {
      renderPresenterSlide();
    } else {
      renderTestView();
    }
  }

  // Synthesize an authentic question from lesson curriculum metadata
  function synthesizeCurriculumQuestion(sl, difficulty, idx) {
    const { subj, mod, les, mid, lid } = sl;
    const diff = difficulty === "ALL" ? (idx % 2 === 0 ? "honors" : "ap_olympiad") : difficulty;

    // Use objectives or phenomenon
    const obj = les.objectives && les.objectives.length > 0 ? les.objectives[0] : mod.bigIdea;
    const formula = mod.formulas && mod.formulas.length > 0 ? mod.formulas[0] : "";

    let question = "";
    let options = [];
    let correctIndex = 0;
    let explanation = "";

    if (subj === "CHEM") {
      question = `In the study of ${mod.title} (Lesson ${mid}.${lid}: "${les.title}"), which of the following scientific statements regarding ${obj.toLowerCase()} is fundamentally correct?`;
      options = [
        `Chemical reactions in this system adhere to conservation principles, governed by the mathematical relation: $$${formula || "E = mc^2"}$$`,
        `The reaction rate is independent of temperature, activation energy, and collision frequency.`,
        `Entropy decreases spontaneously in isolated systems without any external enthalpy input.`,
        `Electrons transition between energy states without emitting or absorbing discrete quanta of radiation.`
      ];
      correctIndex = 0;
      explanation = `According to the fundamental principles established in Lesson ${mid}.${lid} (${les.title}), ${obj}. Chemical transformations preserve fundamental conservation laws and thermodynamic balances, consistent with $$${formula || "\\Delta H = \\Delta U + P\\Delta V"}$$.`;
    } else if (subj === "BIO") {
      question = `In biological systems examining ${mod.title} (Lesson ${mid}.${lid}: "${les.title}"), which biological mechanism best describes the phenomenon: "${mod.phenomenon}"?`;
      options = [
        `Homeostatic cellular regulation maintains dynamic equilibrium through feedback loops and specialized organelle coordination.`,
        `Biological membranes allow unmediated passage of all charged hydrophilic macromolecules through passive diffusion alone.`,
        `Genetic transcription proceeds without complementary base-pairing or RNA polymerase enzymology.`,
        `ATP synthesis occurs without any proton electrochemical gradient across mitochondrial or thylakoid membranes.`
      ];
      correctIndex = 0;
      explanation = `In biological organisms, as covered in Lesson ${mid}.${lid}, living systems maintain complex biochemical homeostasis (${mod.bigIdea}). Dynamic feedback loops and specialized cellular organelles sustain internal stability despite severe external fluctuations.`;
    } else {
      question = `Applying the physics laws of ${mod.title} (Lesson ${mid}.${lid}: "${les.title}"), how does one accurately analyze the core relationship governed by the formula: $$${formula || "F_{\\text{net}} = ma"}$$?`;
      options = [
        `The physical observables are mathematically coupled such that changes in the independent variable produce predictable vector responses satisfying conservation of momentum and energy.`,
        `The frictional and gravitational force vectors act exclusively in the direction perpendicular to motion without acceleration.`,
        `Thermal dissipation in the closed mechanical system permanently destroys total energy rather than converting it to internal energy.`,
        `The angular momentum of an isolated rotating system fluctuates randomly without an external torque.`
      ];
      correctIndex = 0;
      explanation = `As demonstrated in Lesson ${mid}.${lid} (${les.title}), physics systems adhere to Newtonian and thermodynamic conservation laws: $$${formula || "F = ma"}$$. In the absence of net external forces or torques, system quantities are strictly conserved.`;
    }

    // Shuffle options so correctIndex isn't always 0
    const paired = options.map((opt, i) => ({ opt, isCorrect: i === correctIndex }));
    paired.sort(() => Math.random() - 0.5);
    const newOptions = paired.map(p => p.opt);
    const newCorrect = paired.findIndex(p => p.isCorrect);

    return {
      id: `SYNTH-${subj}-${mid}-${lid}-${Date.now() % 10000}`,
      subject: subj,
      moduleId: mid,
      moduleTitle: `${mod.code}: ${mod.title}`,
      lessonTitle: `Lesson ${mid}.${lid}: ${les.title}`,
      type: "mcq",
      difficulty: diff,
      question: question,
      options: newOptions,
      correctIndex: newCorrect,
      explanation: explanation,
      rubricCER: null
    };
  }

  // --- INTERACTIVE TEST VIEW ---
  function renderTestView() {
    viewState = "test";
    removePresenterKeyHandler();

    if (examMode === "timed") {
      timeRemaining = activeQuestions.length * 90; // 90 seconds per question
      timerInterval = setInterval(() => {
        if (!container || !container.isConnected) {
          clearInterval(timerInterval);
          return;
        }
        timeRemaining--;
        const timerElem = document.getElementById("exam-timer");
        if (timerElem) {
          const mins = Math.floor(timeRemaining / 60);
          const secs = timeRemaining % 60;
          timerElem.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        if (timeRemaining <= 5 && timeRemaining > 0) {
          SoundFX.playCountdownBeep(timeRemaining === 1);
        }
        if (timeRemaining <= 0) {
          clearInterval(timerInterval);
          SoundFX.playChime();
          finishExam();
        }
      }, 1000);
    }

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <!-- Top Status Bar -->
        <div class="no-print" style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-card); padding: 16px 24px; border-radius: var(--radius-md); border: 1.5px solid var(--border-color); flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <button class="btn btn-secondary" id="btn-back-config" style="padding: 6px 14px; font-size: 0.85rem;">
              ← Back to Exam Setup
            </button>
            <div style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 700; color: var(--text-main);">
              ${examMode === "timed" ? "⏱ Timed Examination" : "📝 Practice Quiz"} (${activeQuestions.length} Questions)
            </div>
            <span style="font-size: 0.78rem; color: #0284c7; background: rgba(56,189,248,0.12); padding: 3px 8px; border-radius: 4px; font-family: var(--font-mono); font-weight: 600;">
              ${selectedLessons.size} Lessons in Scope
            </span>
          </div>

          ${examMode === "timed" ? `
            <div style="display: flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 1.1rem; color: #ef4444; font-weight: 700; background: rgba(239,68,68,0.1); padding: 6px 16px; border-radius: 9999px; border: 1px solid rgba(239,68,68,0.3);">
              <span>Time Left:</span>
              <span id="exam-timer">--:--</span>
            </div>
          ` : ""}

          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-secondary" id="btn-quiz-calc" style="padding: 8px 12px; font-size: 0.85rem; display: flex; align-items: center; gap: 6px;" title="Open Scientific Pocket Calculator &amp; Constants (Hot-key: K)">
              <span>🧮 Calc</span>
            </button>
            <button class="btn btn-secondary" id="btn-quiz-share-lms" style="padding: 8px 12px; font-size: 0.85rem; display: flex; align-items: center; gap: 6px;" title="Share this Exam to Google Classroom or Classera">
              <span>📤 Assign to LMS</span>
            </button>
            <button class="btn btn-secondary" id="btn-switch-to-presenter" style="padding: 8px 16px; font-size: 0.85rem;">
              Smartboard Mode
            </button>
            <button class="btn btn-accent" id="btn-submit-exam" style="padding: 8px 20px; font-weight: 700;">
              Submit for Final Grading
            </button>
          </div>
        </div>

        <!-- Questions List -->
        <div id="questions-list" style="display: flex; flex-direction: column; gap: 18px;">
          ${activeQuestions.map((q, idx) => renderQuestionCard(q, idx)).join("")}
        </div>
      </div>
    `;

    document.getElementById("btn-back-config").addEventListener("click", showConfig);
    document.getElementById("btn-submit-exam").addEventListener("click", finishExam);
    document.getElementById("btn-switch-to-presenter").addEventListener("click", () => {
      examMode = "presenter";
      renderPresenterSlide();
    });
    document.getElementById("btn-quiz-calc")?.addEventListener("click", () => {
      toggleScienceCalculator();
    });
    document.getElementById("btn-quiz-share-lms")?.addEventListener("click", () => {
      const lessonIds = Array.from(selectedLessons).join(",");
      const scopeHash = `#quiz?scope=${encodeURIComponent(lessonIds)}&subj=${selectedSubject}&mode=${examMode}&count=${activeQuestions.length}`;
      openLmsShareModal({
        url: scopeHash,
        title: `${selectedSubject} ${examMode === "timed" ? "Timed Exam" : "Quiz"} (${activeQuestions.length} Questions)`,
        subject: selectedSubject,
        description: `Interactive online ${examMode === "timed" ? "timed examination" : "practice quiz"} with instant feedback.`
      });
    });

    bindQuestionEvents();
    renderMathInElement(container);
  }

  function renderQuestionCard(q, idx) {
    const isAnswered = userAnswers[q.id] !== undefined;
    const selectedIdx = userAnswers[q.id];

    return `
      <div class="question-card" id="q-card-${q.id}" style="background: var(--bg-card); border: 1.5px solid var(--border-color); border-radius: var(--radius-md); padding: 22px; display: flex; flex-direction: column; gap: 14px;">
        <div class="question-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span class="q-badge" style="background: rgba(56, 189, 248, 0.15); color: #0284c7; font-family: var(--font-mono); font-weight: 700; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem;">
              Question ${idx + 1} of ${activeQuestions.length}
            </span>
            <span class="q-badge" style="color: var(--text-dim); font-size: 0.82rem;">${q.subject} • ${q.moduleTitle}</span>
            ${q.lessonTitle ? `<span style="color: #10b981; font-size: 0.75rem; font-family: var(--font-mono);">[${q.lessonTitle}]</span>` : ""}
          </div>
          <span class="q-badge" style="text-transform: uppercase; font-size: 0.72rem; font-weight: 700; color: ${q.difficulty === 'ap_olympiad' ? '#ec4899' : q.difficulty === 'honors' ? '#f59e0b' : '#10b981'};">
            ${q.difficulty.replace('_', ' ')}
          </span>
        </div>

        <div class="q-text" style="font-size: 1.05rem; line-height: 1.6; color: var(--text-main);">
          ${formatMathText(q.question)}
        </div>

        ${q.diagram ? `
          <div class="q-diagram-container">
            ${q.diagram.caption ? `<div class="q-diagram-caption">${q.diagram.caption}</div>` : ""}
            <div class="q-diagram-svg">${q.diagram.svg}</div>
          </div>
        ` : ""}

        ${q.options ? `
          <div class="q-options-grid" style="display: grid; grid-template-columns: 1fr; gap: 10px;">
            ${q.options.map((opt, oIdx) => {
              const letter = String.fromCharCode(65 + oIdx);
              let stateClass = "";
              if (examMode === "practice" && isAnswered) {
                if (oIdx === q.correctIndex) stateClass = "correct";
                else if (oIdx === selectedIdx) stateClass = "incorrect";
              } else if (selectedIdx === oIdx) {
                stateClass = "selected";
              }

              return `
                <button class="q-option-btn ${stateClass}" data-qid="${q.id}" data-oidx="${oIdx}">
                  <span class="q-option-letter">${letter}</span>
                  <span style="flex: 1; text-align: left;">${formatMathText(opt)}</span>
                </button>
              `;
            }).join("")}
          </div>
        ` : ""}

        ${examMode === "practice" && isAnswered ? `
          <div class="explanation-box" style="background: rgba(16, 185, 129, 0.12); border-left: 4px solid #10b981; padding: 14px 18px; border-radius: 6px; margin-top: 8px;">
            <div style="font-weight: 700; color: #10b981; margin-bottom: 4px; font-size: 0.9rem;">Pedagogical Solution &amp; Explanation:</div>
            <div style="font-size: 0.92rem; color: var(--text-main); line-height: 1.6;">${formatMathText(q.explanation).replace(/\n/g, '<br>')}</div>
          </div>
        ` : ""}
      </div>
    `;
  }

  function bindQuestionEvents() {
    document.querySelectorAll(".q-option-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const qid = btn.dataset.qid;
        const oidx = parseInt(btn.dataset.oidx, 10);
        userAnswers[qid] = oidx;

        if (examMode === "practice") {
          const qIdx = activeQuestions.findIndex(q => q.id === qid);
          if (qIdx !== -1) {
            const isCorrect = oidx === activeQuestions[qIdx].correctIndex;
            if (isCorrect) {
              SoundFX.playSuccess();
            } else {
              SoundFX.playIncorrect();
            }
          }
          const card = document.getElementById(`q-card-${qid}`);
          if (card && qIdx !== -1) {
            card.outerHTML = renderQuestionCard(activeQuestions[qIdx], qIdx);
            bindQuestionEvents();
            const updatedCard = document.getElementById(`q-card-${qid}`);
            if (updatedCard) renderMathInElement(updatedCard);
          }
        } else {
          SoundFX.playClick();
          document.querySelectorAll(`button[data-qid="${qid}"]`).forEach(b => b.classList.remove("selected"));
          btn.classList.add("selected");
        }
      });
    });
  }

  // --- SMARTBOARD CLASSROOM PRESENTER MODE ---
  function renderPresenterSlide() {
    viewState = "presenter";
    removePresenterKeyHandler();

    const q = activeQuestions[presenterIndex];
    if (!presenterPolls[q.id]) {
      presenterPolls[q.id] = [0, 0, 0, 0];
    }
    const polls = presenterPolls[q.id];
    const totalVotes = polls.reduce((a, b) => a + b, 0);

    container.innerHTML = `
      <div class="presenter-container" style="
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: 32px;
        min-height: 640px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 24px;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7);
      ">
        <!-- Presenter Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 16px; flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <button class="btn btn-secondary" id="btn-exit-presenter" style="padding: 8px 16px;">
              ← Exit Presenter
            </button>
            <span class="badge" style="background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4); padding: 6px 14px; font-weight: 700; font-size: 0.9rem;">
              Smartboard Classroom Mode
            </span>
            <span class="presenter-q-num" style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700;">
              Question ${presenterIndex + 1} of ${activeQuestions.length}
            </span>
          </div>

          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span style="font-size: 0.9rem; color: #38bdf8; font-weight: 600;">${q.subject} • ${q.moduleTitle}</span>
            <button class="btn btn-secondary" id="btn-presenter-calc" title="Scientific Pocket Calculator &amp; Constants (Hot-key: K)" style="padding: 8px 12px; display: flex; align-items: center; gap: 6px;">
              <span>🧮 Calc</span>
            </button>
            <button class="btn btn-secondary" id="btn-presenter-share-lms" title="Share Question to Google Classroom or Classera" style="padding: 8px 12px; display: flex; align-items: center; gap: 6px;">
              <span>📤 Share to LMS</span>
            </button>
            <button class="btn btn-secondary" id="btn-toggle-fullscreen" title="Full Screen Presentation" style="padding: 8px 14px;">
              ⛶ Fullscreen
            </button>
          </div>
        </div>

        <!-- Question Prompt Area -->
        <div style="padding: 10px 0;">
          <div class="presenter-q-prompt" style="font-family: var(--font-heading); font-size: 1.85rem; font-weight: 800; line-height: 1.45;">
            ${formatMathText(q.question)}
          </div>
        </div>

        ${q.diagram ? `
          <div class="presenter-diagram-container">
            ${q.diagram.caption ? `<div class="presenter-diagram-caption">${q.diagram.caption}</div>` : ""}
            <div class="presenter-diagram-svg">${q.diagram.svg}</div>
          </div>
        ` : ""}

        <!-- Large Touch Option Tiles -->
        ${q.options ? `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 16px;">
            ${q.options.map((opt, oIdx) => {
              const letter = String.fromCharCode(65 + oIdx);
              const isCorrect = oIdx === q.correctIndex;
              let bg = "var(--bg-surface-elevated)";
              let border = "var(--border-color)";
              let letterBg = "rgba(255,255,255,0.08)";
              let letterColor = "var(--text-muted)";

              if (presenterRevealed) {
                if (isCorrect) {
                  bg = "rgba(16, 185, 129, 0.2)";
                  border = "#10b981";
                  letterBg = "#10b981";
                  letterColor = "#ffffff";
                }
              }

              const voteCount = polls[oIdx] || 0;
              const votePct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

              return `
                <div class="presenter-opt-tile ${isCorrect && presenterRevealed ? 'is-correct' : ''}" style="
                  background: ${bg};
                  border: 2px solid ${border};
                  border-radius: var(--radius-md);
                  padding: 20px 24px;
                  display: flex;
                  flex-direction: column;
                  gap: 12px;
                  transition: all 0.25s ease;
                ">
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 14px;">
                    <div style="display: flex; align-items: center; gap: 14px;">
                      <div class="presenter-opt-letter" style="
                        width: 44px;
                        height: 44px;
                        border-radius: 10px;
                        background: ${letterBg};
                        color: ${letterColor};
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-family: var(--font-heading);
                        font-size: 1.4rem;
                        font-weight: 800;
                        flex-shrink: 0;
                      ">
                        ${letter}
                      </div>
                      <div class="presenter-opt-text" style="font-size: 1.25rem; font-weight: 600; line-height: 1.4;">
                        ${formatMathText(opt)}
                      </div>
                    </div>

                    <button class="btn btn-secondary btn-vote" data-vidx="${oIdx}" style="padding: 6px 12px; font-size: 0.8rem;" title="Add student response">
                      +1 Vote
                    </button>
                  </div>

                  <!-- Polling Bar -->
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div class="presenter-poll-track" style="flex: 1; height: 8px; border-radius: 999px; overflow: hidden; background: rgba(255,255,255,0.08);">
                      <div style="width: ${votePct}%; height: 100%; background: ${isCorrect && presenterRevealed ? '#10b981' : '#38bdf8'}; transition: width 0.4s ease;"></div>
                    </div>
                    <div style="font-size: 0.82rem; color: var(--text-dim); min-width: 48px; text-align: right;">
                      ${voteCount} (${votePct}%)
                    </div>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        ` : ""}

        <!-- Explanation Reveal Box -->
        ${presenterRevealed ? `
          <div class="presenter-explanation-box" style="
            background: rgba(16, 185, 129, 0.12);
            border-left: 5px solid #10b981;
            padding: 20px 24px;
            border-radius: var(--radius-md);
            animation: fadeIn 0.3s ease;
          ">
            <div style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; color: #10b981; margin-bottom: 6px;">
              Correct Answer: Option ${String.fromCharCode(65 + q.correctIndex)} — Pedagogical Solution
            </div>
            <div class="presenter-explanation-text" style="color: #f1f5f9; font-size: 1.1rem; line-height: 1.6; white-space: pre-line;">
              ${formatMathText(q.explanation)}
            </div>
          </div>
        ` : ""}

        <!-- Bottom Controls Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 20px; flex-wrap: wrap; gap: 16px;">
          <div style="display: flex; gap: 12px;">
            <button class="btn btn-secondary" id="btn-prev-slide" ${presenterIndex === 0 ? 'disabled' : ''} style="padding: 12px 24px; font-size: 1rem;">
              ← Previous Slide
            </button>
            <button class="btn btn-secondary" id="btn-next-slide" ${presenterIndex === activeQuestions.length - 1 ? 'disabled' : ''} style="padding: 12px 24px; font-size: 1rem;">
              Next Slide →
            </button>
          </div>

          <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
            <button class="btn btn-secondary" id="btn-simulate-poll" style="padding: 12px 20px; font-size: 0.95rem;">
              Simulate Class Poll
            </button>
            <button class="btn btn-primary" id="btn-toggle-reveal" style="padding: 12px 28px; font-size: 1rem; font-weight: 700;">
              ${presenterRevealed ? "Hide Answer" : "Reveal Answer & Rationale"}
            </button>
          </div>
        </div>

        <!-- Smartboard HUD Hotkeys Bar -->
        <div class="presenter-hotkeys-bar" style="display: flex; justify-content: center; gap: 14px; font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-dim); background: rgba(0, 0, 0, 0.4); padding: 8px 18px; border-radius: 9999px; border: 1px solid rgba(255, 255, 255, 0.08); margin: 0 auto; flex-wrap: wrap;">
          <span><kbd style="background: rgba(255,255,255,0.12); padding: 2px 6px; border-radius: 4px; color: var(--text-main);">← / →</kbd> Slide</span>
          <span><kbd style="background: rgba(255,255,255,0.12); padding: 2px 6px; border-radius: 4px; color: var(--text-main);">Space</kbd> Reveal</span>
          <span><kbd style="background: rgba(255,255,255,0.12); padding: 2px 6px; border-radius: 4px; color: var(--text-main);">1-4 / A-D</kbd> Student Vote</span>
          <span><kbd style="background: rgba(255,255,255,0.12); padding: 2px 6px; border-radius: 4px; color: var(--text-main);">S</kbd> Simulate Poll</span>
          <span><kbd style="background: rgba(255,255,255,0.12); padding: 2px 6px; border-radius: 4px; color: var(--text-main);">F</kbd> Fullscreen</span>
          <span><kbd style="background: rgba(255,255,255,0.12); padding: 2px 6px; border-radius: 4px; color: var(--text-main);">Esc</kbd> Exit</span>
        </div>
      </div>
    `;

    function castPresenterVote(vidx) {
      if (q.options && vidx < q.options.length) {
        presenterPolls[q.id][vidx]++;
        SoundFX.playClick();
        renderPresenterSlide();
      }
    }

    // Keyboard Shortcuts for Presenter Mode
    presenterKeyHandler = (e) => {
      if (viewState !== "presenter") return;
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;

      if (e.code === "ArrowRight" || e.code === "PageDown" || e.code === "KeyN") {
        if (presenterIndex < activeQuestions.length - 1) {
          presenterIndex++;
          presenterRevealed = false;
          SoundFX.playClick();
          renderPresenterSlide();
        }
      } else if (e.code === "ArrowLeft" || e.code === "PageUp" || e.code === "KeyP") {
        if (presenterIndex > 0) {
          presenterIndex--;
          presenterRevealed = false;
          SoundFX.playClick();
          renderPresenterSlide();
        }
      } else if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        presenterRevealed = !presenterRevealed;
        SoundFX.playSwitchSnap();
        renderPresenterSlide();
      } else if (e.code === "KeyS") {
        e.preventDefault();
        const curQ = activeQuestions[presenterIndex];
        const correctIdx = curQ.correctIndex;
        presenterPolls[curQ.id] = [0, 0, 0, 0].map((_, idx) => {
          return idx === correctIdx ? Math.floor(Math.random() * 10) + 15 : Math.floor(Math.random() * 6) + 1;
        });
        SoundFX.playClick();
        renderPresenterSlide();
      } else if (e.code === "KeyF") {
        e.preventDefault();
        if (!document.fullscreenElement) {
          container.requestFullscreen().catch(err => showToast("Fullscreen Notice", err.message, "info"));
        } else {
          document.exitFullscreen();
        }
      } else if (e.code === "Escape") {
        if (!document.fullscreenElement) {
          removePresenterKeyHandler();
          showConfig();
        }
      } else if (["Digit1", "KeyA"].includes(e.code)) {
        castPresenterVote(0);
      } else if (["Digit2", "KeyB"].includes(e.code)) {
        castPresenterVote(1);
      } else if (["Digit3", "KeyC"].includes(e.code)) {
        castPresenterVote(2);
      } else if (["Digit4", "KeyD"].includes(e.code)) {
        castPresenterVote(3);
      }
    };
    window.addEventListener("keydown", presenterKeyHandler);

    // Presenter Event Listeners
    document.getElementById("btn-exit-presenter").addEventListener("click", () => {
      removePresenterKeyHandler();
      showConfig();
    });
    document.getElementById("btn-presenter-calc")?.addEventListener("click", () => {
      toggleScienceCalculator();
    });
    document.getElementById("btn-presenter-share-lms")?.addEventListener("click", () => {
      const curQ = activeQuestions[presenterIndex];
      openLmsShareModal({
        url: `#quiz?scope=${curQ.lessonId || ''}&subj=${selectedSubject}`,
        title: `${curQ.subject}: ${curQ.moduleTitle} (Question ${presenterIndex + 1})`,
        subject: curQ.subject,
        description: curQ.question
      });
    });
    document.getElementById("btn-prev-slide").addEventListener("click", () => {
      if (presenterIndex > 0) {
        presenterIndex--;
        presenterRevealed = false;
        SoundFX.playClick();
        renderPresenterSlide();
      }
    });
    document.getElementById("btn-next-slide").addEventListener("click", () => {
      if (presenterIndex < activeQuestions.length - 1) {
        presenterIndex++;
        presenterRevealed = false;
        SoundFX.playClick();
        renderPresenterSlide();
      }
    });
    document.getElementById("btn-toggle-reveal").addEventListener("click", () => {
      presenterRevealed = !presenterRevealed;
      SoundFX.playSwitchSnap();
      renderPresenterSlide();
    });
    document.getElementById("btn-simulate-poll").addEventListener("click", () => {
      const curQ = activeQuestions[presenterIndex];
      const correctIdx = curQ.correctIndex;
      presenterPolls[curQ.id] = [0, 0, 0, 0].map((_, idx) => {
        return idx === correctIdx ? Math.floor(Math.random() * 10) + 15 : Math.floor(Math.random() * 6) + 1;
      });
      SoundFX.playClick();
      renderPresenterSlide();
    });

    document.querySelectorAll(".btn-vote").forEach(btn => {
      btn.addEventListener("click", () => {
        const vidx = parseInt(btn.dataset.vidx, 10);
        presenterPolls[q.id][vidx]++;
        SoundFX.playClick();
        renderPresenterSlide();
      });
    });

    const fullBtn = document.getElementById("btn-toggle-fullscreen");
    if (fullBtn) {
      fullBtn.addEventListener("click", () => {
        if (!document.fullscreenElement) {
          container.requestFullscreen().catch(err => showToast("Fullscreen Notice", err.message, "info"));
        } else {
          document.exitFullscreen();
        }
      });
    }

    renderMathInElement(container);
  }

  // --- SUBMIT & RESULTS SCORECARD ---
  function finishExam() {
    viewState = "results";
    removePresenterKeyHandler();
    if (timerInterval) clearInterval(timerInterval);

    let correctCount = 0;
    activeQuestions.forEach(q => {
      if (userAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const pct = Math.round((correctCount / activeQuestions.length) * 100);
    ProgressStore.recordQuizResult(selectedSubject, activeQuestions.length, correctCount);

    if (pct >= 70) {
      SoundFX.playChime();
    } else {
      SoundFX.playClick();
    }

    container.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px;">
        <div class="quiz-config-card" style="text-align: center; padding: 40px; background: var(--bg-card); border: 1.5px solid var(--border-color); border-radius: var(--radius-lg);">
          <div style="font-size: 3.5rem; margin-bottom: 12px;">
            ${pct >= 85 ? "🏆" : pct >= 70 ? "🎯" : "📚"}
          </div>
          <h2 style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 800; margin-bottom: 8px; color: var(--text-main);">
            Examination Results &amp; Analytics
          </h2>
          <div style="font-size: 1.1rem; color: var(--text-muted); margin-bottom: 24px;">
            Scope: <strong style="color: #0284c7;">${selectedLessons.size} Selected Lessons</strong> in <strong style="color: #10b981;">${selectedSubject}</strong>
          </div>

          <div style="display: flex; justify-content: center; gap: 32px; margin-bottom: 28px;">
            <div style="background: var(--bg-surface-elevated); padding: 18px 28px; border-radius: 12px; border: 1px solid var(--border-color);">
              <div style="font-size: 0.85rem; color: var(--text-dim); text-transform: uppercase; margin-bottom: 4px;">Score</div>
              <div style="font-family: var(--font-heading); font-size: 2.4rem; font-weight: 800; color: ${pct >= 70 ? '#10b981' : '#f59e0b'};">
                ${pct}%
              </div>
            </div>
            <div style="background: var(--bg-surface-elevated); padding: 18px 28px; border-radius: 12px; border: 1px solid var(--border-color);">
              <div style="font-size: 0.85rem; color: var(--text-dim); text-transform: uppercase; margin-bottom: 4px;">Correct Items</div>
              <div style="font-family: var(--font-heading); font-size: 2.4rem; font-weight: 800; color: var(--text-main);">
                ${correctCount} / ${activeQuestions.length}
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;">
            <button class="btn btn-secondary" id="btn-restart-quiz" style="padding: 10px 24px;">
              ← Configure New Assessment
            </button>
            <button class="btn btn-accent" id="btn-review-answers" style="padding: 10px 28px; font-weight: 700;">
              Review Questions &amp; Solutions
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById("btn-restart-quiz").addEventListener("click", showConfig);
    document.getElementById("btn-review-answers").addEventListener("click", () => {
      examMode = "practice";
      renderTestView();
    });
  }

  // --- PRINTABLE TEST PAPER & TEACHER ANSWER KEY ---
  let printForm = "A"; // 'A' or 'B'
  let printLayout = "single"; // 'single' or 'two-col'
  let printShowTest = true;
  let printShowBubble = true;
  let printShowKey = true;
  let printSchoolName = "Edugates-ClipSAT Science Labs";
  let printExamTitle = "Comprehensive STEM Examination";

  function renderPrintView() {
    viewState = "print";
    removePresenterKeyHandler();

    function getFormQuestions(formKey) {
      if (formKey === "A") {
        return activeQuestions.map((q, idx) => ({ ...q, formIndex: idx + 1, formCorrectIdx: q.correctIndex }));
      }
      // Form B: deterministic scramble of question order and option letters for anti-cheating
      return activeQuestions.map((q, idx) => {
        if (!q.options || q.options.length <= 1) {
          return { ...q, formIndex: idx + 1, formCorrectIdx: q.correctIndex, origQIndex: idx + 1 };
        }
        // Shift options cyclically by (idx % 3 + 1)
        const shift = (idx % (q.options.length - 1)) + 1;
        const newOptions = [];
        let newCorrectIndex = q.correctIndex;
        for (let i = 0; i < q.options.length; i++) {
          const origIndex = (i - shift + q.options.length) % q.options.length;
          newOptions.push(q.options[origIndex]);
          if (origIndex === q.correctIndex) {
            newCorrectIndex = i;
          }
        }
        return {
          ...q,
          options: newOptions,
          formCorrectIdx: newCorrectIndex,
          origQIndex: idx + 1
        };
      }).reverse().map((q, idx) => ({
        ...q,
        formIndex: idx + 1
      }));
    }

    function renderBubbleSheetHtml(questions, formKey) {
      const numCols = questions.length <= 15 ? 1 : (questions.length <= 30 ? 2 : (questions.length <= 60 ? 3 : 4));
      const colSize = Math.ceil(questions.length / numCols);
      const cols = [];
      for (let i = 0; i < questions.length; i += colSize) {
        cols.push(questions.slice(i, i + colSize).map((q) => {
          const qNum = q.formIndex;
          return `
            <div class="omr-q-row" style="display: flex; align-items: center; justify-content: flex-start; gap: 5px; margin-bottom: 5px; font-family: var(--font-mono), monospace; font-size: 0.84rem; width: fit-content; margin-right: auto; text-align: left;">
              <span class="omr-q-num" style="font-weight: 800; min-width: 24px; text-align: left; color: #000000; margin-right: 2px;">${qNum < 10 ? '0' + qNum : qNum}.</span>
              <div class="omr-bubbles-group" style="display: flex; gap: 5px; align-items: center; justify-content: flex-start; margin-left: 0; margin-right: auto;">
                <span class="omr-bubble" style="display: inline-flex; align-items: center; justify-content: center; width: 17px; height: 17px; border-radius: 50%; border: 1.5px solid #000000; font-size: 0.66rem; font-weight: 800; color: #000000; background: #ffffff;" title="Option A">A</span>
                <span class="omr-bubble" style="display: inline-flex; align-items: center; justify-content: center; width: 17px; height: 17px; border-radius: 50%; border: 1.5px solid #000000; font-size: 0.66rem; font-weight: 800; color: #000000; background: #ffffff;" title="Option B">B</span>
                <span class="omr-bubble" style="display: inline-flex; align-items: center; justify-content: center; width: 17px; height: 17px; border-radius: 50%; border: 1.5px solid #000000; font-size: 0.66rem; font-weight: 800; color: #000000; background: #ffffff;" title="Option C">C</span>
                <span class="omr-bubble" style="display: inline-flex; align-items: center; justify-content: center; width: 17px; height: 17px; border-radius: 50%; border: 1.5px solid #000000; font-size: 0.66rem; font-weight: 800; color: #000000; background: #ffffff;" title="Option D">D</span>
              </div>
            </div>
          `;
        }).join(""));
      }

      const maxColWidth = '145px';

      return `
        <div class="print-bubble-sheet ${!printShowTest ? 'standalone-sheet' : ''}" style="${printShowTest ? 'page-break-before: always; margin-top: 24px;' : 'page-break-before: auto; margin-top: 0;'} border: 2px solid #000000; padding: 24px 30px; border-radius: 4px; background: #ffffff; color: #000000;">
          <!-- Bubble Sheet Header -->
          <div style="border-bottom: 2px solid #000000; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <div style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #334155;">STANDARD OPTICAL MARK RECOGNITION (OMR) RESPONSE SHEET</div>
              <h2 style="font-size: 1.35rem; font-weight: 900; margin: 2px 0 4px 0; color: #000000;">${printSchoolName}</h2>
              <div style="font-size: 0.95rem; font-weight: 700; color: #000000;">${printExamTitle}</div>
            </div>
            <div style="text-align: center; border: 2px solid #000000; padding: 6px 14px; border-radius: 4px; background: #f8fafc;">
              <div style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #475569;">TEST FORM</div>
              <div style="font-size: 1.5rem; font-weight: 900; color: #000000;">${formKey}</div>
            </div>
          </div>

          <!-- Instructions & Grid Header -->
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; border-bottom: 1.5px solid #000000; padding-bottom: 16px; margin-bottom: 18px;">
            <!-- Left: Student Info & Grids -->
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div style="display: flex; gap: 12px; align-items: flex-end;">
                <div style="flex: 1;">
                  <div style="font-size: 0.78rem; font-weight: 700; color: #475569;">STUDENT FULL NAME (LAST, FIRST, M.I.)</div>
                  <div style="border-bottom: 1.5px solid #000000; height: 26px;"></div>
                </div>
                <div style="width: 130px;">
                  <div style="font-size: 0.78rem; font-weight: 700; color: #475569;">CLASS / PERIOD</div>
                  <div style="border-bottom: 1.5px solid #000000; height: 26px;"></div>
                </div>
              </div>

              <div style="display: flex; gap: 12px; align-items: flex-end;">
                <div style="flex: 1;">
                  <div style="font-size: 0.78rem; font-weight: 700; color: #475569;">DATE OF EXAMINATION</div>
                  <div style="border-bottom: 1.5px solid #000000; height: 26px;"></div>
                </div>
                <div style="width: 130px;">
                  <div style="font-size: 0.78rem; font-weight: 700; color: #475569;">STUDENT ID</div>
                  <div style="border-bottom: 1.5px solid #000000; height: 26px;"></div>
                </div>
              </div>

              <!-- Marking Guidelines -->
              <div style="font-size: 0.75rem; color: #334155; line-height: 1.4; margin-top: 4px; background: #f1f5f9; padding: 6px 10px; border-radius: 4px; border: 1px dashed #94a3b8;">
                <strong>MARKING INSTRUCTIONS:</strong>
                Use dark pencil (No. 2 / HB) or black ink. Completely fill in each bubble:
                <span class="omr-bubble" style="display: inline-flex; vertical-align: middle; margin: 0 4px; background: #000000; color: #fff; width: 14px; height: 14px; font-size: 0.55rem;">●</span>
                Make clean, dark marks. Erase cleanly any changes.
              </div>
            </div>

            <!-- Right: Official Scoring Box (Teacher Only) -->
            <div style="border: 1.5px solid #000000; border-radius: 4px; padding: 10px; background: #f8fafc; display: flex; flex-direction: column; justify-content: space-between;">
              <div style="font-size: 0.75rem; font-weight: 800; text-transform: uppercase; text-align: center; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; color: #1e293b;">
                FOR TEACHER / SCORER USE ONLY
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
                <span style="font-size: 0.82rem; font-weight: 700;">Raw Score:</span>
                <span style="border-bottom: 1.5px solid #000000; width: 60px; height: 18px; text-align: right; font-weight: 800;">&nbsp;/ ${questions.length}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
                <span style="font-size: 0.82rem; font-weight: 700;">Percentage:</span>
                <span style="border-bottom: 1.5px solid #000000; width: 60px; height: 18px; text-align: right; font-weight: 800;">&nbsp;%</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
                <span style="font-size: 0.82rem; font-weight: 700;">Grade / Scale:</span>
                <span style="border-bottom: 1.5px solid #000000; width: 60px; height: 18px;"></span>
              </div>
              <div style="border-top: 1px solid #cbd5e1; padding-top: 4px; font-size: 0.74rem;">
                Teacher Sign: _____________________
              </div>
            </div>
          </div>

          <!-- Multi-Column Bubble Grid -->
          <div class="omr-sections-grid" style="display: flex; justify-content: flex-start; gap: 20px; flex-wrap: wrap; padding: 4px 0; margin-left: 0; margin-right: auto;">
            ${cols.map((colHtml, colIdx) => `
              <div class="omr-section-card" style="border: 1.5px solid #000000; border-radius: 4px; padding: 8px 10px; background: #ffffff; width: fit-content; max-width: 145px; min-width: 135px; text-align: left; margin: 0;">
                <div style="font-size: 0.74rem; font-weight: 800; text-align: left; border-bottom: 1.5px solid #000000; padding-bottom: 4px; margin-bottom: 8px; color: #000000; letter-spacing: 0.05em; width: 100%;">
                  SECTION ${colIdx + 1}
                </div>
                ${colHtml}
              </div>
            `).join("")}
          </div>
        </div>
      `;
    }

    function renderDOM() {
      const displayQuestions = getFormQuestions(printForm);
      const isLocal = typeof window === "undefined" || 
                      !window.location.hostname || 
                      window.location.hostname === "localhost" || 
                      window.location.hostname === "127.0.0.1" || 
                      window.location.protocol === "file:";
      const originUrl = isLocal ? "https://mohammedamy.github.io/EdugatesScLab/" : (window.location.origin + window.location.pathname);
      const scopeParam = Array.from(selectedLessons).join(",");
      const qrDeepLink = scopeParam 
        ? `${originUrl}#quiz?scope=${encodeURIComponent(scopeParam)}&subj=${selectedSubject}`
        : `${originUrl}#quiz?subj=${selectedSubject}`;
      let qrSvg = "";
      try {
        qrSvg = generateQRSvg(qrDeepLink, { pixelSize: 3, margin: 2 });
      } catch (err) {
        console.error("QR Generation error:", err);
        qrSvg = `<div style="font-size: 0.65rem; color: #64748b; text-align: center; padding: 8px;">Scan URL:<br>${qrDeepLink.slice(0, 30)}...</div>`;
      }

      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <!-- Top Control & Customization Bar (Excluded during printing) -->
          <div class="print-actions-bar no-print" style="display: flex; flex-direction: column; gap: 12px; background: var(--bg-card); padding: 16px 20px; border-radius: var(--radius-md); border: 1.5px solid var(--border-color); box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <button class="btn btn-secondary" id="btn-exit-print" style="font-weight: 700;">
                  ← Exit Print Studio
                </button>
                <span class="badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); font-family: var(--font-mono);">
                  ${displayQuestions.length} Questions • ${selectedLessons.size} Lessons
                </span>
              </div>

              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <!-- Form A vs Form B Selector -->
                <div style="display: inline-flex; border: 1px solid var(--border-color); border-radius: var(--radius-sm); overflow: hidden; background: rgba(0,0,0,0.2);">
                  <button class="btn ${printForm === 'A' ? 'btn-primary' : 'btn-secondary'} btn-sm" id="btn-print-form-a" style="border-radius: 0; padding: 6px 14px; font-weight: 700;">
                    Form A (Master)
                  </button>
                  <button class="btn ${printForm === 'B' ? 'btn-primary' : 'btn-secondary'} btn-sm" id="btn-print-form-b" style="border-radius: 0; padding: 6px 14px; font-weight: 700;" title="Anti-cheating randomized question order and shuffled options">
                    Form B (Anti-Cheat)
                  </button>
                </div>

                <!-- Layout Switcher -->
                <div style="display: inline-flex; border: 1px solid var(--border-color); border-radius: var(--radius-sm); overflow: hidden; background: rgba(0,0,0,0.2);">
                  <button class="btn ${printLayout === 'single' ? 'btn-primary' : 'btn-secondary'} btn-sm" id="btn-layout-single" style="border-radius: 0; padding: 6px 12px;" title="Standard 1-column layout">
                    📄 1-Col
                  </button>
                  <button class="btn ${printLayout === 'two-col' ? 'btn-primary' : 'btn-secondary'} btn-sm" id="btn-layout-twocol" style="border-radius: 0; padding: 6px 12px;" title="High density 2-column paper saver layout">
                    📰 2-Col (Paper Saver)
                  </button>
                </div>

                <!-- Assign to LMS (Google Classroom & Classera) -->
                <button class="btn btn-secondary" id="btn-print-share-lms" style="font-weight: 700; padding: 7px 16px; display: inline-flex; align-items: center; gap: 8px;" title="Share this Exam Preset to Google Classroom or Classera">
                  <span>📤</span>
                  <span>Assign to LMS</span>
                </button>

                <!-- Export Editable DOCX -->
                <button class="btn btn-secondary" id="btn-print-export-docx" style="font-weight: 700; padding: 7px 16px; display: inline-flex; align-items: center; gap: 8px; border: 1px solid rgba(56, 189, 248, 0.4); background: rgba(56, 189, 248, 0.12); color: #38bdf8;" title="Export fully editable Microsoft Word (.docx) exam document">
                  <span>📄</span>
                  <span>Save as .docx</span>
                </button>

                <!-- Print Trigger Button -->
                <button class="btn btn-primary" onclick="window.print()" style="font-weight: 800; padding: 7px 18px; display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #0284c7, #2563eb); border: none; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);">
                  <span>🖨️</span>
                  <span>Print / Save PDF</span>
                </button>
              </div>
            </div>

            <!-- Second Row: Section Toggles and Editable Header Inputs -->
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 0.85rem;">
              <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
                <span style="font-weight: 700; color: var(--text-muted); text-transform: uppercase; font-size: 0.72rem; letter-spacing: 0.05em;">Include Sections:</span>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                  <input type="checkbox" id="chk-print-test" ${printShowTest ? 'checked' : ''}>
                  <span>Student Test Paper</span>
                </label>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                  <input type="checkbox" id="chk-print-bubble" ${printShowBubble ? 'checked' : ''}>
                  <span>Scantron OMR Bubble Sheet</span>
                </label>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                  <input type="checkbox" id="chk-print-key" ${printShowKey ? 'checked' : ''}>
                  <span>Teacher Solutions Key</span>
                </label>
              </div>

              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <input type="text" id="inp-print-school" value="${printSchoolName}" placeholder="School / Institution Name" style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); color: var(--text-main); padding: 4px 10px; border-radius: 4px; font-size: 0.82rem; min-width: 200px;">
                <input type="text" id="inp-print-title" value="${printExamTitle}" placeholder="Exam Title" style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); color: var(--text-main); padding: 4px 10px; border-radius: 4px; font-size: 0.82rem; min-width: 220px;">
              </div>
            </div>
          </div>

          <!-- Printable Document Container (Pure Black on White) -->
          <div class="print-test-container" style="background: #ffffff; color: #000000; padding: 40px; border-radius: 8px; box-shadow: 0 4px 25px rgba(0,0,0,0.15);">
            
            ${printShowTest ? `
              <!-- Section I: Official School & Exam Header -->
              <div class="print-header" style="border-bottom: 2px solid #000000; padding-bottom: 16px; margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
                  <div style="display: flex; align-items: center; gap: 16px;">
                    <img src="assets/logo.png" alt="Edugates-ClipSAT Science Labs" style="width: 58px; height: 58px; object-fit: contain; border-radius: 8px; border: 1px solid #cbd5e1;">
                    <div>
                      <h1 style="font-size: 1.55rem; font-weight: 900; margin-bottom: 2px; color: #000000; letter-spacing: -0.01em;">${printSchoolName}</h1>
                      <div style="font-size: 0.95rem; color: #1e293b; font-weight: 600;">${printExamTitle}</div>
                      <div style="font-size: 0.8rem; color: #475569; margin-top: 2px;">Curriculum Scope: ${selectedSubject} • ${selectedLessons.size} Modules/Lessons Tested</div>
                    </div>
                  </div>

                  <!-- Right Header: Form Code Badge & QR Code -->
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="text-align: center; border: 2px solid #000000; padding: 6px 14px; border-radius: 4px; background: #f8fafc;">
                      <div style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: #475569;">TEST FORM</div>
                      <div style="font-size: 1.5rem; font-weight: 900; color: #000000;">${printForm}</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; border: 1.5px solid #000000; border-radius: 6px; padding: 5px 8px; background: #ffffff;">
                      <div style="width: 60px; height: 60px; flex-shrink: 0;">
                        ${qrSvg}
                      </div>
                      <div style="font-size: 0.7rem; color: #000000; max-width: 105px; line-height: 1.2; font-weight: 500;">
                        <strong>Digital Lab:</strong><br>Scan for live 3D simulations
                      </div>
                    </div>
                  </div>
                </div>

                <div style="display: flex; justify-content: space-between; margin-top: 18px; font-size: 0.92rem; color: #000000;">
                  <div>Student Name: ____________________________________</div>
                  <div>Class / Period: _________________</div>
                  <div>Date: __________________</div>
                </div>
              </div>

              <!-- Student Instructions Box -->
              <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; padding: 10px 14px; margin-bottom: 24px; font-size: 0.85rem; color: #1e293b; line-height: 1.4;">
                <strong>GENERAL INSTRUCTIONS:</strong> Answer all ${displayQuestions.length} multiple-choice questions. Each question has four choices (A, B, C, D). Choose the one best answer and record your response on the attached response sheet or directly in this test booklet. You may use a scientific calculator and reference data where provided.
              </div>

              <!-- Questions Container (Single or Two-Column Paper Saver Layout) -->
              <div class="print-questions-wrapper ${printLayout === 'two-col' ? 'print-two-col' : ''}" style="${printLayout === 'two-col' ? 'column-count: 2; column-gap: 32px; column-rule: 1px solid #e2e8f0;' : 'display: flex; flex-direction: column; gap: 24px;'}">
                ${displayQuestions.map((q) => `
                  <div class="print-q-card" style="break-inside: avoid; page-break-inside: avoid; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; color: #000000;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                      <span style="font-weight: 800; font-size: 1.02rem; color: #000000;">
                        ${q.formIndex}. ${formatMathText(q.question)}
                      </span>
                    </div>

                    ${q.diagram ? `
                      <div class="print-diagram-container" style="margin: 10px 0; text-align: center;">
                        ${q.diagram.caption ? `<div class="print-diagram-caption" style="font-size: 0.82rem; font-weight: 700; color: #475569; margin-bottom: 4px;">${q.diagram.caption}</div>` : ""}
                        <div class="print-diagram-svg" style="max-height: 220px; display: inline-block;">${q.diagram.svg}</div>
                      </div>
                    ` : ""}

                    ${q.options ? `
                      <div style="display: grid; grid-template-columns: ${printLayout === 'two-col' ? '1fr' : '1fr 1fr'}; gap: 8px 16px; margin-left: 12px; margin-top: 8px; font-size: 0.92rem; color: #000000;">
                        ${q.options.map((opt, oIdx) => `
                          <div style="color: #000000; line-height: 1.35;">
                            <strong style="color: #000000;">(${String.fromCharCode(65 + oIdx)})</strong> <span style="color: #000000;">${formatMathText(opt)}</span>
                          </div>
                        `).join("")}
                      </div>
                    ` : ""}
                  </div>
                `).join("")}
              </div>
            ` : ""}

            <!-- Section II: Standard OMR Bubble Sheet -->
            ${printShowBubble ? renderBubbleSheetHtml(displayQuestions, printForm) : ""}

            <!-- Section III: Teacher Scoring Guide & Detailed Solutions Key -->
            ${printShowKey ? `
              <div class="print-solution-key ${!(printShowTest || printShowBubble) ? 'standalone-sheet' : ''}" style="${(printShowTest || printShowBubble) ? 'page-break-before: always; margin-top: 40px; border-top: 2px dashed #000000; padding-top: 24px;' : 'page-break-before: auto; margin-top: 0; border-top: none; padding-top: 0;'}">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000000; padding-bottom: 12px; margin-bottom: 20px;">
                  <div>
                    <h2 style="font-size: 1.4rem; font-weight: 900; margin: 0 0 4px 0; color: #000000;">
                      Teacher Scoring Guide &amp; Detailed Solutions Key
                    </h2>
                    <div style="font-size: 0.85rem; color: #475569;">
                      Official Solution Explanations &amp; Scientific Derivations • Form ${printForm}
                    </div>
                  </div>
                  <div style="border: 2px solid #000000; padding: 4px 12px; border-radius: 4px; background: #f8fafc; font-weight: 800; font-size: 0.95rem;">
                    KEY: FORM ${printForm}
                  </div>
                </div>

                <!-- Answer Key Matrix Table -->
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px; margin-bottom: 24px;">
                  ${displayQuestions.map(q => `
                    <div style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 10px; background: #f8fafc; display: flex; justify-content: flex-start; gap: 8px; align-items: center; font-size: 0.85rem; font-family: var(--font-mono);">
                      <span style="font-weight: 700; color: #475569; min-width: 32px;">Q${q.formIndex}:</span>
                      <strong style="font-size: 1.05rem; color: #000000; background: #e2e8f0; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%;">
                        ${String.fromCharCode(65 + q.formCorrectIdx)}
                      </strong>
                    </div>
                  `).join("")}
                </div>

                <!-- Step-by-Step Derivations and Pedagogical Explanations -->
                <div style="display: flex; flex-direction: column; gap: 14px; font-size: 0.9rem;">
                  ${displayQuestions.map(q => `
                    <div class="teacher-solution-card" style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px 16px; page-break-inside: avoid; color: #000000;">
                      <div style="display: flex; justify-content: space-between; font-weight: 800; margin-bottom: 6px; color: #000000;">
                        <span style="color: #000000;">
                          Question ${q.formIndex} Correct Answer: Option (${String.fromCharCode(65 + q.formCorrectIdx)})
                          ${q.origQIndex ? `<span style="font-size: 0.75rem; font-weight: 500; color: #64748b;">(Form A # ${q.origQIndex})</span>` : ''}
                        </span>
                        <span style="font-size: 0.78rem; color: #475569; font-weight: 600;">${q.subject} • ${q.moduleTitle}</span>
                      </div>
                      <div style="color: #0f172a; line-height: 1.5; font-size: 0.88rem;">
                        ${formatMathText(q.explanation)}
                      </div>
                    </div>
                  `).join("")}
                </div>
              </div>
            ` : ""}

          </div>
        </div>
      `;

      // Event Bindings
      document.getElementById("btn-exit-print")?.addEventListener("click", showConfig);

      document.getElementById("btn-print-form-a")?.addEventListener("click", () => {
        printForm = "A";
        renderDOM();
      });

      document.getElementById("btn-print-form-b")?.addEventListener("click", () => {
        printForm = "B";
        renderDOM();
      });

      document.getElementById("btn-layout-single")?.addEventListener("click", () => {
        printLayout = "single";
        renderDOM();
      });

      document.getElementById("btn-layout-twocol")?.addEventListener("click", () => {
        printLayout = "two-col";
        renderDOM();
      });

      document.getElementById("chk-print-test")?.addEventListener("change", (e) => {
        printShowTest = e.target.checked;
        renderDOM();
      });

      document.getElementById("chk-print-bubble")?.addEventListener("change", (e) => {
        printShowBubble = e.target.checked;
        renderDOM();
      });

      document.getElementById("chk-print-key")?.addEventListener("change", (e) => {
        printShowKey = e.target.checked;
        renderDOM();
      });

      document.getElementById("inp-print-school")?.addEventListener("input", (e) => {
        printSchoolName = e.target.value;
      });

      document.getElementById("inp-print-title")?.addEventListener("input", (e) => {
        printExamTitle = e.target.value;
      });

      document.getElementById("btn-print-share-lms")?.addEventListener("click", () => {
        openLmsShareModal({
          url: qrDeepLink,
          title: `${selectedSubject} - ${printExamTitle}`,
          subject: selectedSubject,
          description: `Interactive online exam matching Form ${printForm} with ${displayQuestions.length} questions across ${selectedLessons.size} lessons.`
        });
      });

      document.getElementById("btn-print-export-docx")?.addEventListener("click", () => {
        const printContainer = container.querySelector(".print-test-container");
        if (!printContainer) return;
        exportToDocx({
          title: `${printSchoolName} - ${printExamTitle} (Form ${printForm})`,
          filename: `${selectedSubject}_${printExamTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Form_${printForm}`,
          content: printContainer,
          subject: selectedSubject
        });
      });

      renderMathInElement(container);
    }

    renderDOM();
  }

  // Initial render
  showConfig();

  return function cleanupQuiz() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    removePresenterKeyHandler();
  };
}
