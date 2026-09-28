// Edugates-ClipSAT Science Labs - Customizable Quiz & Exam Generator Engine
// Granular Curriculum Scope Checklist: Subject Track Selection, Module & Lesson Multi-Select,
// Live Question Synthesis, KaTeX Mathematical Typesetting, Smartboard Classroom Presenter, and Print/PDF Exporter.

import { questionBank } from "../data/question-bank.js";
import { chemistryCurriculum } from "../data/chemistry-curriculum.js";
import { biologyCurriculum } from "../data/biology-curriculum.js";
import { physicsCurriculum } from "../data/physics-curriculum.js";
import { ProgressStore } from "./progress-tracker.js";
import { formatMathText, renderMathInElement, renderLatex } from "../utils/math-renderer.js";

export function renderQuizEngine(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // View state: 'config', 'test', 'presenter', 'results', 'print'
  let viewState = "config";
  let activeQuestions = [];
  let userAnswers = {}; // { questionId: selectedIndex }
  let examMode = "practice"; // 'practice', 'timed', 'presenter', 'print'
  let timeRemaining = 0;
  let timerInterval = null;
  let presenterIndex = 0;
  let presenterRevealed = false;
  let presenterPolls = {}; // { qId: [countA, countB, countC, countD] }

  // Curriculum Scope State
  let selectedSubject = "CHEM"; // 'CHEM', 'BIO', 'PHYS', 'ALL'
  let selectedLessons = new Set(); // Set of "SUBJECT-M{id}-L{id}"
  let lessonSearchQuery = "";
  let collapsedModules = new Set(); // Modules explicitly collapsed by user

  // Curricula registry
  const curricula = {
    CHEM: chemistryCurriculum,
    BIO: biologyCurriculum,
    PHYS: physicsCurriculum
  };

  // Initialize default scope: Select all lessons in default subject
  function initDefaultScope() {
    selectedLessons.clear();
    const activeSubjs = selectedSubject === "ALL" ? ["CHEM", "BIO", "PHYS"] : [selectedSubject];
    activeSubjs.forEach(s => {
      const cur = curricula[s];
      if (cur) {
        cur.modules.forEach(m => {
          m.lessons.forEach(l => {
            selectedLessons.add(`${s}-M${m.id}-L${l.id}`);
          });
        });
      }
    });
  }
  initDefaultScope();

  function showConfig() {
    viewState = "config";
    if (timerInterval) clearInterval(timerInterval);

    container.innerHTML = `
      <div class="quiz-generator-view">
        <div class="quiz-config-card" style="background: rgba(15, 23, 42, 0.95); border: 1.5px solid var(--border-color); border-radius: var(--radius-lg); padding: 28px; box-shadow: 0 20px 50px rgba(0,0,0,0.6);">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="badge" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); padding: 5px 14px; border-radius: 9999px; font-weight: 700; font-size: 0.82rem; letter-spacing: 0.05em; text-transform: uppercase;">
                Interactive Assessment Studio
              </span>
              <span id="scope-status-pill" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); padding: 5px 14px; border-radius: 9999px; font-weight: 700; font-size: 0.82rem; font-family: var(--font-mono);">
                Selected Scope: ${selectedLessons.size} Lessons
              </span>
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

          <!-- Step 2: Granular Module & Lesson Scope Checklist -->
          <div style="margin-bottom: 26px; background: var(--bg-card); border: 1.5px solid var(--border-color); border-radius: var(--radius-md); padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 16px;">
              <div>
                <label style="font-size: 0.88rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
                  <span>📋</span> Step 2: Select Exam Scope (Checklist of Lessons)
                </label>
                <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 2px;">
                  All lesson names are listed below. Use real-time search to instantly narrow down lessons:
                </div>
              </div>

              <!-- Quick Selection Utility Buttons -->
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button class="btn btn-secondary btn-scope-action" id="btn-scope-all" style="padding: 6px 12px; font-size: 0.8rem;">
                  ✓ Select All
                </button>
                <button class="btn btn-secondary btn-scope-action" id="btn-scope-none" style="padding: 6px 12px; font-size: 0.8rem;">
                  ✕ Deselect All
                </button>
                <button class="btn btn-secondary btn-scope-action" id="btn-scope-filtered" style="padding: 6px 12px; font-size: 0.8rem; border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;">
                  🔍 Select Filtered Only
                </button>
                <button class="btn btn-secondary btn-scope-action" id="btn-scope-labs" style="padding: 6px 12px; font-size: 0.8rem;">
                  🔬 Lab Modules Only
                </button>
                <button class="btn btn-secondary btn-scope-action" id="btn-scope-toggle-expand" style="padding: 6px 12px; font-size: 0.8rem;">
                  ⇕ Collapse/Expand All
                </button>
              </div>
            </div>

            <!-- Real-time Search Box for Lessons with Live Counter -->
            <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 14px; flex-wrap: wrap;">
              <div style="position: relative; flex: 1; min-width: 260px;">
                <input type="text" id="input-search-lessons" class="search-input" placeholder="Type lesson name, concept, or formula to narrow down..." value="${lessonSearchQuery}" style="width: 100%; padding-left: 38px; padding-right: 32px; height: 42px; font-size: 0.92rem; border-radius: 8px;">
                <span style="position: absolute; left: 14px; top: 12px; color: var(--text-dim);">🔍</span>
                ${lessonSearchQuery ? `<button id="btn-clear-lesson-search" style="position: absolute; right: 10px; top: 10px; background: transparent; border: none; color: var(--text-dim); cursor: pointer; font-size: 1rem;">✕</button>` : ''}
              </div>
              <div id="scope-counter-badge" style="font-family: var(--font-mono); font-size: 0.82rem; color: #38bdf8; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.25); padding: 8px 14px; border-radius: 8px; white-space: nowrap;">
                Loading lessons...
              </div>
            </div>

            <!-- Scrollable Container for Lessons Checklist -->
            <div id="curriculum-checklist-container" style="max-height: 480px; overflow-y: auto; padding-right: 8px; display: flex; flex-direction: column; gap: 12px;">
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
                  <option value="ALL" selected>All Levels (Adaptive Standard)</option>
                  <option value="foundational">Foundational (Standard High School)</option>
                  <option value="honors">Honors / Advanced STEM</option>
                  <option value="ap_olympiad">AP / SAT Subject / Olympiad</option>
                </select>
              </div>

              <div class="control-group">
                <label class="control-label"><span>Question Count</span></label>
                <select id="cfg-count" class="select-input">
                  <option value="5">5 Questions (Quick Check)</option>
                  <option value="10" selected>10 Questions (Standard Quiz)</option>
                  <option value="15">15 Questions (Module Test)</option>
                  <option value="20">20 Questions (Quarterly Exam)</option>
                  <option value="ALL">All Available in Selected Scope</option>
                </select>
              </div>

              <div class="control-group">
                <label class="control-label"><span>Question Type Filter</span></label>
                <select id="cfg-qtype" class="select-input">
                  <option value="ALL" selected>All Question Types (Mixed)</option>
                  <option value="mcq">Multiple Choice Concepts</option>
                  <option value="numerical">Numerical / Formula Calculations</option>
                  <option value="cer">Scientific Inquiry &amp; CER Analysis</option>
                </select>
              </div>

              <div class="control-group">
                <label class="control-label"><span>Assessment Mode</span></label>
                <select id="cfg-mode" class="select-input">
                  <option value="practice" selected>Interactive Practice (Instant Feedback &amp; Hints)</option>
                  <option value="timed">Timed Examination (Countdown Timer &amp; Scorecard)</option>
                  <option value="presenter">Smartboard Presenter (Full-Display Slide &amp; Class Poll)</option>
                  <option value="print">Printable Test Paper &amp; Answer Key (PDF / Paper)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Generate Action Button -->
          <div style="display: flex; gap: 14px; align-items: center; justify-content: space-between; flex-wrap: wrap; border-top: 1px solid var(--border-color); padding-top: 20px;">
            <div style="font-size: 0.88rem; color: #94a3b8;">
              Ready to generate: <strong id="summary-ready-count" style="color: #38bdf8;">10 questions</strong> from <strong id="summary-scope-count" style="color: #10b981;">${selectedLessons.size} selected lessons</strong>.
            </div>
            <button class="btn btn-accent" id="btn-generate-exam" style="padding: 12px 32px; font-weight: 800; font-size: 1.05rem; display: flex; align-items: center; gap: 10px; box-shadow: 0 0 25px rgba(245, 158, 11, 0.4);">
              <span>⚡ Generate Assessment Now</span>
            </button>
          </div>
        </div>
      </div>
    `;

    renderCurriculumChecklist();
    bindConfigEvents();
  }

  function highlightMatches(text, query) {
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text.replace(regex, '<mark style="background: rgba(56, 189, 248, 0.35); color: #38bdf8; padding: 1px 4px; border-radius: 3px; font-weight: 800;">$1</mark>');
  }

  // --- RENDER HIERARCHICAL MODULE & LESSON CHECKLIST ---
  function renderCurriculumChecklist() {
    const listContainer = document.getElementById("curriculum-checklist-container");
    if (!listContainer) return;

    // Collect active subjects to render
    const activeSubjs = selectedSubject === "ALL" ? ["CHEM", "BIO", "PHYS"] : [selectedSubject];
    const query = lessonSearchQuery.trim().toLowerCase();

    let html = "";
    let totalVisibleLessons = 0;
    let totalPossibleLessons = 0;

    activeSubjs.forEach(subKey => {
      const cur = curricula[subKey];
      if (!cur) return;

      cur.modules.forEach(m => {
        totalPossibleLessons += m.lessons.length;

        // Filter lessons by query
        const matchingLessons = m.lessons.filter(l => {
          if (!query) return true;
          return l.title.toLowerCase().includes(query) ||
                 m.title.toLowerCase().includes(query) ||
                 m.code.toLowerCase().includes(query);
        });

        if (matchingLessons.length === 0) return;
        totalVisibleLessons += matchingLessons.length;

        const modKey = `${subKey}-M${m.id}`;
        const isCollapsed = collapsedModules.has(modKey) && !query;

        // Check if all lessons in this module are selected
        const allSelected = m.lessons.every(l => selectedLessons.has(`${subKey}-M${m.id}-L${l.id}`));
        const someSelected = m.lessons.some(l => selectedLessons.has(`${subKey}-M${m.id}-L${l.id}`));

        html += `
          <div class="module-scope-group" style="background: var(--bg-surface-elevated); border: 1.5px solid ${allSelected ? 'var(--chem-primary)' : 'var(--border-color)'}; border-radius: 10px; overflow: hidden; transition: border-color 0.2s ease;">
            <!-- Module Header Bar -->
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(0,0,0,0.03); cursor: pointer;" class="module-header-toggle" data-modkey="${modKey}">
              <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;">
                <input type="checkbox" class="mod-checkbox" data-modkey="${modKey}" data-subj="${subKey}" data-mid="${m.id}" ${allSelected ? 'checked' : ''} ${someSelected && !allSelected ? 'indeterminate' : ''} style="width: 18px; height: 18px; cursor: pointer; accent-color: #0284c7; flex-shrink: 0;">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span style="font-family: var(--font-mono); font-size: 0.78rem; font-weight: 800; color: ${cur.color}; background: rgba(0,0,0,0.06); padding: 2px 7px; border-radius: 4px;">${m.code}</span>
                  <span style="font-weight: 700; font-size: 0.94rem; color: var(--text-main);">${highlightMatches(m.title, query)}</span>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
                ${m.lab ? `<span style="font-size: 0.72rem; color: #10b981; background: rgba(16,185,129,0.15); padding: 2px 8px; border-radius: 4px; font-weight: 600;">🔬 Virtual Lab</span>` : ''}
                <span style="font-size: 0.75rem; color: var(--text-dim); font-family: var(--font-mono); font-weight: 600;">${matchingLessons.length} / ${m.lessons.length} Lessons</span>
                <span class="accordion-arrow" style="font-size: 0.75rem; color: var(--text-dim); transition: transform 0.2s ease; transform: rotate(${isCollapsed ? '0deg' : '180deg'});">▼</span>
              </div>
            </div>

            <!-- Lessons List Body: Directly Visible -->
            <div class="module-lessons-list" style="display: ${isCollapsed ? 'none' : 'block'}; padding: 10px 14px 14px 20px; border-top: 1px solid var(--border-color); background: var(--bg-surface);">
              <div style="display: flex; flex-direction: column; gap: 6px;">
                ${matchingLessons.map(l => {
                  const lessonKey = `${subKey}-M${m.id}-L${l.id}`;
                  const isChecked = selectedLessons.has(lessonKey);
                  return `
                    <label class="lesson-checkbox-label" data-lessonkey="${lessonKey}" style="display: flex; align-items: center; justify-content: space-between; gap: 12px; cursor: pointer; font-size: 0.88rem; color: ${isChecked ? 'var(--text-main)' : 'var(--text-muted)'}; padding: 8px 12px; border-radius: 6px; background: ${isChecked ? 'rgba(56, 189, 248, 0.12)' : 'transparent'}; border: 1px solid ${isChecked ? 'rgba(56, 189, 248, 0.35)' : 'transparent'}; transition: all 0.15s ease;">
                      <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;">
                        <input type="checkbox" class="lesson-checkbox" data-lessonkey="${lessonKey}" ${isChecked ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer; accent-color: #10b981; flex-shrink: 0;">
                        <span style="font-family: var(--font-mono); font-size: 0.76rem; font-weight: 700; color: #38bdf8; background: rgba(56, 189, 248, 0.15); padding: 2px 6px; border-radius: 4px; flex-shrink: 0;">Lesson ${l.id}</span>
                        <span class="lesson-title-text" style="font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${highlightMatches(l.title, query)}</span>
                      </div>
                      <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
                        ${l.objectives ? `<span style="font-size: 0.72rem; color: var(--text-dim); font-family: var(--font-mono);">${l.objectives.length} obj</span>` : ''}
                        <span class="lesson-status-tag" style="font-size: 0.72rem; font-weight: 700; padding: 2px 7px; border-radius: 4px; background: ${isChecked ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)'}; color: ${isChecked ? '#34d399' : 'var(--text-dim)'};">
                          ${isChecked ? '✓ Selected' : 'Excluded'}
                        </span>
                      </div>
                    </label>
                  `;
                }).join("")}
              </div>
            </div>
          </div>
        `;
      });
    });

    if (totalVisibleLessons === 0) {
      html = `<div style="text-align: center; color: var(--text-muted); padding: 32px 16px; font-size: 0.95rem; background: rgba(15,23,42,0.5); border-radius: 8px; border: 1px dashed rgba(255,255,255,0.1);">
        <div style="font-size: 1.6rem; margin-bottom: 8px;">🔍</div>
        <div>No lesson names matched "<strong>${lessonSearchQuery}</strong>".</div>
        <div style="color: var(--text-dim); font-size: 0.82rem; margin-top: 4px;">Try searching by scientific concept (e.g. "density", "kinetics", "mitosis", "circuits") or clear the search.</div>
      </div>`;
    }

    listContainer.innerHTML = html;

    // Update indeterminate properties on checkboxes
    document.querySelectorAll(".mod-checkbox").forEach(cb => {
      if (cb.hasAttribute("indeterminate")) {
        cb.indeterminate = true;
      }
    });

    // Update live counter badge & status indicators
    const counterBadge = document.getElementById("scope-counter-badge");
    if (counterBadge) {
      counterBadge.innerHTML = `Showing <strong>${totalVisibleLessons}</strong> of ${totalPossibleLessons} lessons • <strong style="color: #10b981;">${selectedLessons.size}</strong> selected`;
    }

    const statusPill = document.getElementById("scope-status-pill");
    if (statusPill) statusPill.innerText = `Selected Scope: ${selectedLessons.size} Lessons`;
    const scopeCountEl = document.getElementById("summary-scope-count");
    if (scopeCountEl) scopeCountEl.innerText = `${selectedLessons.size} selected lessons`;
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

    // Search lessons input
    const searchInp = document.getElementById("input-search-lessons");
    if (searchInp) {
      searchInp.addEventListener("input", (e) => {
        lessonSearchQuery = e.target.value;
        renderCurriculumChecklist();
        bindChecklistEvents();
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

    // Select Filtered Lessons
    const btnFiltered = document.getElementById("btn-scope-filtered");
    if (btnFiltered) {
      btnFiltered.addEventListener("click", () => {
        const activeSubjs = selectedSubject === "ALL" ? ["CHEM", "BIO", "PHYS"] : [selectedSubject];
        const query = lessonSearchQuery.trim().toLowerCase();
        activeSubjs.forEach(s => {
          curricula[s].modules.forEach(m => {
            m.lessons.forEach(l => {
              if (!query || l.title.toLowerCase().includes(query) || m.title.toLowerCase().includes(query) || m.code.toLowerCase().includes(query)) {
                selectedLessons.add(`${s}-M${m.id}-L${l.id}`);
              }
            });
          });
        });
        renderCurriculumChecklist();
        bindChecklistEvents();
      });
    }

    // Collapse / Expand All
    const btnToggleExpand = document.getElementById("btn-scope-toggle-expand");
    if (btnToggleExpand) {
      btnToggleExpand.addEventListener("click", () => {
        if (collapsedModules.size > 0) {
          collapsedModules.clear();
        } else {
          const activeSubjs = selectedSubject === "ALL" ? ["CHEM", "BIO", "PHYS"] : [selectedSubject];
          activeSubjs.forEach(s => {
            curricula[s].modules.forEach(m => {
              collapsedModules.add(`${s}-M${m.id}`);
            });
          });
        }
        renderCurriculumChecklist();
        bindChecklistEvents();
      });
    }

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

    // Question count listener
    const countSelect = document.getElementById("cfg-count");
    if (countSelect) {
      countSelect.addEventListener("change", (e) => {
        const readyEl = document.getElementById("summary-ready-count");
        if (readyEl) {
          readyEl.innerText = e.target.value === "ALL" ? "all matching questions" : `${e.target.value} questions`;
        }
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
    // Module Accordion Toggle
    document.querySelectorAll(".module-header-toggle").forEach(header => {
      header.addEventListener("click", (e) => {
        // Prevent toggle if clicking checkbox directly
        if (e.target.classList.contains("mod-checkbox")) return;
        const modKey = header.dataset.modkey;
        if (expandedModules.has(modKey)) {
          expandedModules.delete(modKey);
        } else {
          expandedModules.add(modKey);
        }
        renderCurriculumChecklist();
        bindChecklistEvents();
      });
    });

    // Module Checkbox click (selects/deselects all lessons in module)
    document.querySelectorAll(".mod-checkbox").forEach(cb => {
      cb.addEventListener("change", (e) => {
        e.stopPropagation();
        const subKey = cb.dataset.subj;
        const mid = parseInt(cb.dataset.mid, 10);
        const cur = curricula[subKey];
        if (!cur) return;
        const mod = cur.modules.find(m => m.id === mid);
        if (!mod) return;

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

    // Lesson Checkbox click
    document.querySelectorAll(".lesson-checkbox").forEach(cb => {
      cb.addEventListener("change", (e) => {
        e.stopPropagation();
        const lKey = cb.dataset.lessonkey;
        if (cb.checked) {
          selectedLessons.add(lKey);
        } else {
          selectedLessons.delete(lKey);
        }
        renderCurriculumChecklist();
        bindChecklistEvents();
      });
    });
  }

  // --- DYNAMIC QUESTION GENERATION & POOL RESOLUTION ---
  function generateExam() {
    if (selectedLessons.size === 0) {
      alert("Please select at least one lesson to establish the assessment scope.");
      return;
    }

    const difficulty = document.getElementById("cfg-difficulty").value;
    const countVal = document.getElementById("cfg-count").value;
    const qTypeVal = document.getElementById("cfg-qtype").value;
    examMode = document.getElementById("cfg-mode").value;

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

    // 1. Gather static questions that match the selected modules
    const selectedModIds = new Set(scopeLessons.map(sl => `${sl.subj}-${sl.mid}`));
    let pool = questionBank.filter(q => {
      const matchMod = selectedModIds.has(`${q.subject}-${q.moduleId}`);
      const matchDiff = difficulty === "ALL" || q.difficulty === difficulty;
      const matchType = qTypeVal === "ALL" || q.type === qTypeVal;
      return matchMod && matchDiff && matchType;
    });

    // 2. Synthesize curriculum-grounded questions for any lessons in scope that need representation
    scopeLessons.forEach((sl, idx) => {
      const synthQ = synthesizeCurriculumQuestion(sl, difficulty, idx);
      if (qTypeVal === "ALL" || synthQ.type === qTypeVal) {
        pool.push(synthQ);
      }
    });

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

    if (examMode === "timed") {
      timeRemaining = activeQuestions.length * 90; // 90 seconds per question
      timerInterval = setInterval(() => {
        timeRemaining--;
        const timerElem = document.getElementById("exam-timer");
        if (timerElem) {
          const mins = Math.floor(timeRemaining / 60);
          const secs = timeRemaining % 60;
          timerElem.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        if (timeRemaining <= 0) {
          clearInterval(timerInterval);
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

          <div style="display: flex; gap: 10px;">
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
          const card = document.getElementById(`q-card-${qid}`);
          const qIdx = activeQuestions.findIndex(q => q.id === qid);
          if (card && qIdx !== -1) {
            card.outerHTML = renderQuestionCard(activeQuestions[qIdx], qIdx);
            bindQuestionEvents();
            const updatedCard = document.getElementById(`q-card-${qid}`);
            if (updatedCard) renderMathInElement(updatedCard);
          }
        } else {
          document.querySelectorAll(`button[data-qid="${qid}"]`).forEach(b => b.classList.remove("selected"));
          btn.classList.add("selected");
        }
      });
    });
  }

  // --- SMARTBOARD CLASSROOM PRESENTER MODE ---
  function renderPresenterSlide() {
    viewState = "presenter";
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

          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 0.9rem; color: #38bdf8; font-weight: 600;">${q.subject} • ${q.moduleTitle}</span>
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

          <div style="display: flex; gap: 12px; align-items: center;">
            <button class="btn btn-secondary" id="btn-simulate-poll" style="padding: 12px 20px; font-size: 0.95rem;">
              Simulate Class Poll
            </button>
            <button class="btn btn-primary" id="btn-toggle-reveal" style="padding: 12px 28px; font-size: 1rem; font-weight: 700;">
              ${presenterRevealed ? "Hide Answer" : "Reveal Answer & Rationale"}
            </button>
          </div>
        </div>
      </div>
    `;

    // Presenter Event Listeners
    document.getElementById("btn-exit-presenter").addEventListener("click", showConfig);
    document.getElementById("btn-prev-slide").addEventListener("click", () => {
      if (presenterIndex > 0) {
        presenterIndex--;
        presenterRevealed = false;
        renderPresenterSlide();
      }
    });
    document.getElementById("btn-next-slide").addEventListener("click", () => {
      if (presenterIndex < activeQuestions.length - 1) {
        presenterIndex++;
        presenterRevealed = false;
        renderPresenterSlide();
      }
    });
    document.getElementById("btn-toggle-reveal").addEventListener("click", () => {
      presenterRevealed = !presenterRevealed;
      renderPresenterSlide();
    });
    document.getElementById("btn-simulate-poll").addEventListener("click", () => {
      const q = activeQuestions[presenterIndex];
      const correctIdx = q.correctIndex;
      presenterPolls[q.id] = [0, 0, 0, 0].map((_, idx) => {
        return idx === correctIdx ? Math.floor(Math.random() * 10) + 15 : Math.floor(Math.random() * 6) + 1;
      });
      renderPresenterSlide();
    });

    document.querySelectorAll(".btn-vote").forEach(btn => {
      btn.addEventListener("click", () => {
        const vidx = parseInt(btn.dataset.vidx, 10);
        presenterPolls[q.id][vidx]++;
        renderPresenterSlide();
      });
    });

    const fullBtn = document.getElementById("btn-toggle-fullscreen");
    if (fullBtn) {
      fullBtn.addEventListener("click", () => {
        if (!document.fullscreenElement) {
          container.requestFullscreen().catch(err => alert(err.message));
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
    if (timerInterval) clearInterval(timerInterval);

    let correctCount = 0;
    activeQuestions.forEach(q => {
      if (userAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const pct = Math.round((correctCount / activeQuestions.length) * 100);
    ProgressStore.recordQuizResult(selectedSubject, activeQuestions.length, correctCount);

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
  function renderPrintView() {
    viewState = "print";

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div class="print-actions-bar no-print" style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); padding: 14px 20px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
          <button class="btn btn-secondary" id="btn-exit-print">
            ← Exit Print View
          </button>
          <div style="font-size: 0.9rem; color: var(--text-muted); font-weight: 500;">
            Scope: ${selectedLessons.size} Lessons (${activeQuestions.length} Questions)
          </div>
          <button class="btn btn-primary" onclick="window.print()" style="font-weight: 700;">
            🖨 Print / Export PDF
          </button>
        </div>

        <div class="print-test-container" style="background: #ffffff; color: #000000; padding: 40px; border-radius: 8px;">
          <!-- Official School Header -->
          <div class="print-header" style="border-bottom: 2px solid #000000; padding-bottom: 16px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
              <div style="display: flex; align-items: center; gap: 16px;">
                <img src="assets/logo.png" alt="Edugates-ClipSAT Science Labs" style="width: 58px; height: 58px; object-fit: contain; border-radius: 8px; border: 1px solid #e2e8f0;">
                <div>
                  <h1 style="font-size: 1.6rem; font-weight: 800; margin-bottom: 4px; color: #000000; letter-spacing: -0.01em;">Edugates-ClipSAT Science Labs</h1>
                  <div style="font-size: 0.95rem; color: #1e293b; font-weight: 500;">Comprehensive STEM Examination — Standard Form</div>
                </div>
              </div>
              <div style="text-align: right; font-size: 0.85rem; color: #1e293b; min-width: 160px; font-weight: 500;">
                <div>Date: __________________</div>
                <div style="margin-top: 4px;">Score: _______ / ${activeQuestions.length}</div>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; margin-top: 20px; font-size: 0.95rem; color: #000000;">
              <div>Student Name: ____________________________________</div>
              <div>Class / Period: _________________</div>
            </div>
          </div>

          <!-- Section I: Student Questions -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            ${activeQuestions.map((q, idx) => `
              <div class="print-q-card" style="page-break-inside: avoid; margin-bottom: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 14px; color: #000000;">
                <div style="font-weight: 700; margin-bottom: 8px; font-size: 1.05rem; color: #000000;">
                  ${idx + 1}. ${formatMathText(q.question)}
                </div>

                ${q.options ? `
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-left: 18px; font-size: 0.95rem; color: #000000;">
                    ${q.options.map((opt, oIdx) => `
                      <div style="color: #000000;">
                        <strong style="color: #000000;">(${String.fromCharCode(65 + oIdx)})</strong> <span style="color: #000000;">${formatMathText(opt)}</span>
                      </div>
                    `).join("")}
                  </div>
                ` : ""}
              </div>
            `).join("")}
          </div>

          <!-- Section II: Teacher Answer Key & Derivations (Page Break for Printing) -->
          <div style="page-break-before: always; margin-top: 40px; border-top: 2px dashed #94a3b8; padding-top: 24px;">
            <h2 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 16px; color: #000000;">
              Teacher Scoring Guide &amp; Detailed Solutions Key
            </h2>
            <div style="display: flex; flex-direction: column; gap: 16px; font-size: 0.92rem;">
              ${activeQuestions.map((q, idx) => `
                <div class="teacher-solution-card" style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px 16px; page-break-inside: avoid; color: #000000;">
                  <div style="display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 4px; color: #000000;">
                    <span style="color: #000000;">Question ${idx + 1} Answer: Option (${String.fromCharCode(65 + q.correctIndex)})</span>
                    <span style="font-size: 0.8rem; color: #475569;">${q.subject} • ${q.moduleTitle}</span>
                  </div>
                  <div style="color: #0f172a; line-height: 1.5;">
                    ${formatMathText(q.explanation)}
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById("btn-exit-print").addEventListener("click", showConfig);
    renderMathInElement(container);
  }

  // Initial render
  showConfig();
}
