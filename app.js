// Edugates-ClipSAT Science Labs - Main Application Controller
// Responsive across Smartboards, PCs, Laptops, Tablets, and Mobiles

import { chemistryCurriculum } from "./data/chemistry-curriculum.js";
import { biologyCurriculum } from "./data/biology-curriculum.js";
import { physicsCurriculum } from "./data/physics-curriculum.js";
import { icons } from "./assets/icons.js";
import { openModuleModal } from "./components/module-viewer.js";
import { renderQuizEngine } from "./components/quiz-engine.js";
import { initSmartboardToolbar } from "./components/smartboard-toolbar.js";
import { renderFlashcards } from "./components/flashcards.js";
import { openProgressModal, ProgressStore } from "./components/progress-tracker.js";
import { renderMathInElement, renderLatex } from "./utils/math-renderer.js";
import { getLessonInteractiveSpec } from "./components/lesson-interactives.js";
import { openLessonPlanModal } from "./components/lesson-plan-generator.js";

import { initProjectileLab } from "./labs/phys-projectile.js";
import { initTitrationLab } from "./labs/chem-titration.js";
import { initMicroscopeLab } from "./labs/bio-microscope.js";
import { initPeriodicTableLab } from "./labs/chem-periodic-table.js";
import { initCircuitsLab } from "./labs/phys-circuits.js";
import { initGasLawsLab } from "./labs/chem-gas-laws.js";
import { initDnaProteinLab } from "./labs/bio-dna-protein.js";
import { initPunnettLab } from "./labs/bio-punnett-square.js";
import { initOpticsLab } from "./labs/phys-optics.js";

// Initialize Theme
const savedTheme = localStorage.getItem("edugates_theme") || "night";
document.documentElement.setAttribute("data-theme", savedTheme);

// Global Application State
const AppState = {
  currentTab: "chem", // 'chem', 'bio', 'phys', 'labs', 'quiz', 'flashcards'
  deviceMode: "auto", // 'auto', 'smartboard', 'desktop', 'tablet', 'mobile'
  theme: savedTheme, // 'day', 'night'
  homeViewMode: "chapters", // 'chapters', 'lessons'
  searchQuery: "",
  selectedUnit: "ALL",
  activeLabId: "projectile"
};

// Available Curricula and Laboratory Modules for Main Navigation Dropdown
export const NAV_SUBJECTS = [
  {
    id: "chem",
    name: "Chemistry",
    badge: "23",
    tagline: "23 Modules • Inspire Chemistry",
    icon: icons.chemistry,
    themeClass: "tab-chem",
    color: "#06b6d4"
  },
  {
    id: "bio",
    name: "Biology",
    badge: "27",
    tagline: "27 Modules • Inspire Biology",
    icon: icons.biology,
    themeClass: "tab-bio",
    color: "#10b981"
  },
  {
    id: "phys",
    name: "Physics",
    badge: "24",
    tagline: "24 Modules • Inspire Physics",
    icon: icons.physics,
    themeClass: "tab-phys",
    color: "#6366f1"
  },
  {
    id: "labs",
    name: "Virtual Labs",
    badge: "9 Labs",
    tagline: "9 Interactive STEM Workbenches",
    icon: icons.microscope,
    themeClass: "tab-labs",
    color: "#38bdf8"
  },
  {
    id: "quiz",
    name: "Quiz & Exams",
    badge: "Test Gen",
    tagline: "Auto Exam & Assessment Generator",
    icon: icons.quiz,
    themeClass: "tab-quiz",
    color: "#f59e0b"
  },
  {
    id: "flashcards",
    name: "Flashcards",
    badge: "STEM",
    tagline: "Interactive Terminology Cards",
    icon: icons.cards,
    themeClass: "tab-flashcards",
    color: "#ec4899"
  }
];

// Initialize App with fast boot execution for slow smartboards
function bootApp() {
  setupDeviceDetection();
  renderAppShell();
  initCustomLogoDetector();
  bindGlobalEvents();
  renderCurrentView();

  // Defer floating smartboard pen bar canvas initialization slightly so first paint is instantaneous
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => initSmartboardToolbar(), { timeout: 250 });
  } else {
    setTimeout(initSmartboardToolbar, 60);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootApp, { once: true });
} else {
  bootApp();
}

function initCustomLogoDetector() {
  // Official brand asset is assets/logo.png
}

function setupDeviceDetection() {
  const w = window.innerWidth || (window.screen ? window.screen.width : 1920);
  const isTouch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
  const isLowCpu = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
  const savedMode = localStorage.getItem("edugates_device_mode");

  if (savedMode) {
    setDeviceMode(savedMode);
  } else if (w >= 1800 || (isTouch && w >= 1150) || isLowCpu) {
    setDeviceMode("smartboard");
  }
}

function setDeviceMode(mode) {
  AppState.deviceMode = mode;
  try {
    localStorage.setItem("edugates_device_mode", mode);
  } catch (e) {}

  document.body.classList.remove("mode-smartboard", "mode-tablet", "mode-mobile", "fast-smartboard-mode");
  document.documentElement.classList.remove("mode-smartboard", "fast-smartboard-mode");

  if (mode === "smartboard") {
    document.body.classList.add("mode-smartboard", "fast-smartboard-mode");
    document.documentElement.classList.add("mode-smartboard", "fast-smartboard-mode");
    document.documentElement.setAttribute("data-mode", "smartboard");
  } else if (mode === "tablet") {
    document.body.classList.add("mode-tablet");
    document.documentElement.setAttribute("data-mode", "tablet");
  } else if (mode === "mobile") {
    document.body.classList.add("mode-mobile");
    document.documentElement.setAttribute("data-mode", "mobile");
  } else {
    document.documentElement.removeAttribute("data-mode");
    const w = window.innerWidth || 1920;
    const isTouch = navigator.maxTouchPoints > 0;
    const isLowCpu = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    if (w >= 1800 || (isTouch && w >= 1150) || isLowCpu) {
      document.body.classList.add("mode-smartboard", "fast-smartboard-mode");
      document.documentElement.classList.add("mode-smartboard", "fast-smartboard-mode");
      document.documentElement.setAttribute("data-mode", "smartboard");
    }
  }

  // Update active state in device toggle buttons
  document.querySelectorAll(".device-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.mode === mode);
  });
}

function renderAppShell() {
  const root = document.getElementById("app-root");
  const curSub = NAV_SUBJECTS.find(s => s.id === AppState.currentTab) || NAV_SUBJECTS[0];

  root.innerHTML = `
    <!-- Ambient Lighting Glows -->
    <div class="bg-glow-container">
      <div class="bg-glow-blob blob-1"></div>
      <div class="bg-glow-blob blob-2"></div>
      <div class="bg-glow-blob blob-3"></div>
    </div>

    <!-- Navigation Header -->
    <header class="app-navbar">
      <!-- Brand & Title -->
      <div class="brand-section" id="nav-brand-home" title="Edugates-ClipSAT Science Labs - Home">
        <div class="brand-logo-box" id="brand-logo-wrapper">
          <img src="assets/logo.png" alt="Edugates-ClipSAT Science Labs Logo" class="brand-logo-img" id="brand-logo-img" onerror="this.style.display='none'; document.getElementById('brand-logo-fallback').style.display='flex';">
          <div id="brand-logo-fallback" class="brand-logo-icon" style="display: none;">
            ${icons.logo}
          </div>
        </div>
        <div class="brand-text">
          <h1><span class="brand-title-prefix">Edugates-ClipSAT</span> <span class="logo-highlight">Science Labs</span></h1>
          <div class="brand-tagline">Virtual Labs &amp; STEM Curriculum • Chemistry • Biology • Physics</div>
        </div>
      </div>

      <!-- Navigation Subject Dropdown Menu -->
      <div class="nav-dropdown-wrapper" id="nav-dropdown-wrapper">
        <button class="nav-dropdown-trigger ${curSub.themeClass}" id="nav-dropdown-trigger" 
                aria-haspopup="true" aria-expanded="false" 
                title="Select Subject or Area (Chemistry, Biology, Physics, Labs, Quiz, Flashcards)">
          <div class="nav-dropdown-trigger-icon" id="nav-dropdown-current-icon">
            ${curSub.icon}
          </div>
          <div class="nav-dropdown-trigger-info">
            <span class="nav-dropdown-current-label">Curriculum / Area</span>
            <div class="nav-dropdown-current-row">
              <span class="nav-dropdown-current-title" id="nav-dropdown-current-title">${curSub.name}</span>
              <span class="nav-dropdown-current-badge" id="nav-dropdown-current-badge">${curSub.badge}</span>
            </div>
          </div>
          <div class="nav-dropdown-chevron" id="nav-dropdown-chevron">
            ${icons.chevronDown}
          </div>
        </button>

        <!-- Dropdown Menu Panel -->
        <div class="nav-dropdown-menu" id="nav-dropdown-menu" role="menu" aria-label="Curriculum and Laboratories Menu">
          <div class="nav-dropdown-header">
            <span class="nav-dropdown-header-title">Select Curriculum or Lab</span>
            <span class="nav-dropdown-header-count">6 Available</span>
          </div>
          <div class="nav-dropdown-list">
            ${NAV_SUBJECTS.map(sub => `
              <button class="nav-dropdown-item ${sub.themeClass} ${AppState.currentTab === sub.id ? 'active' : ''}" 
                      data-tab="${sub.id}" role="menuitem" tabindex="-1">
                <div class="nav-item-icon-box">
                  ${sub.icon}
                </div>
                <div class="nav-item-content">
                  <div class="nav-item-top">
                    <span class="nav-item-title">${sub.name}</span>
                    <span class="nav-item-badge">${sub.badge}</span>
                  </div>
                  <span class="nav-item-tagline">${sub.tagline}</span>
                </div>
                <div class="nav-item-check" aria-hidden="true">
                  ${icons.check}
                </div>
              </button>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Right Controls & Device Mode -->
      <div class="nav-right-controls">
        <!-- Day / Night Mode Toggle Switch -->
        <button class="theme-toggle-btn" id="btn-theme-toggle" title="Switch Day/Night Mode (Light/Dark)" aria-label="Toggle Day/Night Mode">
          <div class="theme-toggle-track">
            <div class="theme-toggle-thumb">
              <span class="icon-sun">☀️</span>
              <span class="icon-moon">🌙</span>
            </div>
          </div>
          <span class="theme-toggle-text">${AppState.theme === 'day' ? 'Day' : 'Night'}</span>
        </button>

        <button class="btn btn-secondary" id="btn-open-progress" title="Student STEM Mastery Telemetry" style="padding: 6px 12px; font-size: 0.85rem; gap: 6px;">
          ${icons.trophy}
          <span>Mastery</span>
        </button>

        <div class="device-mode-toggle" title="Screen Optimization &amp; Hardware Profile">
          <button class="device-btn ${AppState.deviceMode === 'auto' ? 'active' : ''}" data-mode="auto">Auto</button>
          <button class="device-btn ${AppState.deviceMode === 'smartboard' ? 'active' : ''}" data-mode="smartboard" title="Smartboard Fast Mode (Hardware Accelerated)">⚡ Smartboard</button>
          <button class="device-btn ${AppState.deviceMode === 'tablet' ? 'active' : ''}" data-mode="tablet" title="Tablet Mode">Tablet</button>
          <button class="device-btn ${AppState.deviceMode === 'mobile' ? 'active' : ''}" data-mode="mobile" title="Mobile Mode">Mobile</button>
        </div>
      </div>
    </header>

    <!-- Main Viewport Area -->
    <main class="app-main" id="main-content-view"></main>
  `;
}

export function toggleSubjectDropdown(forceState) {
  const wrapper = document.getElementById("nav-dropdown-wrapper");
  const trigger = document.getElementById("nav-dropdown-trigger");
  if (!wrapper || !trigger) return;

  const isOpen = forceState !== undefined ? forceState : !wrapper.classList.contains("open");
  wrapper.classList.toggle("open", isOpen);
  trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");

  if (isOpen) {
    const activeItem = wrapper.querySelector(".nav-dropdown-item.active") || wrapper.querySelector(".nav-dropdown-item");
    if (activeItem) {
      setTimeout(() => activeItem.focus(), 50);
    }
  }
}

export function closeSubjectDropdown() {
  const wrapper = document.getElementById("nav-dropdown-wrapper");
  const trigger = document.getElementById("nav-dropdown-trigger");
  if (wrapper && wrapper.classList.contains("open")) {
    wrapper.classList.remove("open");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  }
}

function toggleDayNightTheme() {
  const nextTheme = AppState.theme === "day" ? "night" : "day";
  setTheme(nextTheme);
}

function setTheme(theme) {
  AppState.theme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("edugates_theme", theme);
  const label = document.querySelector(".theme-toggle-text");
  if (label) {
    label.textContent = theme === "day" ? "Day" : "Night";
  }
}

function bindGlobalEvents() {
  // Day / Night Theme Switcher
  const themeBtn = document.getElementById("btn-theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      toggleDayNightTheme();
    });
  }

  // Brand Home
  document.getElementById("nav-brand-home").addEventListener("click", () => {
    switchTab("chem");
  });

  // Dropdown Trigger Toggle
  const dropdownTrigger = document.getElementById("nav-dropdown-trigger");
  if (dropdownTrigger) {
    dropdownTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleSubjectDropdown();
    });
  }

  // Dropdown Menu Item Switchers
  document.querySelectorAll(".nav-dropdown-item").forEach(item => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      switchTab(item.dataset.tab);
    });
  });

  // Light Dismiss on outside pointerdown
  document.addEventListener("pointerdown", (e) => {
    const wrapper = document.getElementById("nav-dropdown-wrapper");
    if (wrapper && wrapper.classList.contains("open")) {
      if (!wrapper.contains(e.target)) {
        closeSubjectDropdown();
      }
    }
  });

  // Keyboard navigation & Escape dismiss
  document.addEventListener("keydown", (e) => {
    const wrapper = document.getElementById("nav-dropdown-wrapper");
    if (!wrapper || !wrapper.classList.contains("open")) return;

    if (e.key === "Escape") {
      closeSubjectDropdown();
      dropdownTrigger?.focus();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const items = Array.from(wrapper.querySelectorAll(".nav-dropdown-item"));
      const currentIndex = items.indexOf(document.activeElement);
      let nextIndex = 0;
      if (e.key === "ArrowDown") {
        nextIndex = currentIndex >= 0 ? (currentIndex + 1) % items.length : 0;
      } else {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      }
      items[nextIndex]?.focus();
    }
  });

  // Device Mode Switchers
  document.querySelectorAll(".device-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      setDeviceMode(btn.dataset.mode);
    });
  });

  // Mastery Tracker Modal
  const progressBtn = document.getElementById("btn-open-progress");
  if (progressBtn) {
    progressBtn.addEventListener("click", () => {
      openProgressModal();
    });
  }
}

function switchTab(tabId) {
  AppState.currentTab = tabId;
  AppState.selectedUnit = "ALL";
  AppState.searchQuery = "";

  const sub = NAV_SUBJECTS.find(s => s.id === tabId) || NAV_SUBJECTS[0];

  // Update dropdown trigger button appearance
  const trigger = document.getElementById("nav-dropdown-trigger");
  if (trigger) {
    trigger.classList.remove("tab-chem", "tab-bio", "tab-phys", "tab-labs", "tab-quiz", "tab-flashcards");
    trigger.classList.add(sub.themeClass);
  }
  const curIcon = document.getElementById("nav-dropdown-current-icon");
  if (curIcon) curIcon.innerHTML = sub.icon;
  const curTitle = document.getElementById("nav-dropdown-current-title");
  if (curTitle) curTitle.textContent = sub.name;
  const curBadge = document.getElementById("nav-dropdown-current-badge");
  if (curBadge) curBadge.textContent = sub.badge;

  // Update active state in dropdown items
  document.querySelectorAll(".nav-dropdown-item").forEach(item => {
    const isActive = item.dataset.tab === tabId;
    item.classList.toggle("active", isActive);
    item.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  // Backward compatibility with any legacy nav tabs
  document.querySelectorAll(".nav-tab-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.tab === tabId);
  });

  // Close dropdown menu
  closeSubjectDropdown();

  // Shift atmospheric glow color
  const blob1 = document.querySelector(".blob-1");
  if (blob1) {
    blob1.style.background = sub.color;
  }

  renderCurrentView();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Global Cross-Navigation Helpers
window.openModuleById = function(subjectCode, moduleId, lessonId) {
  const code = (subjectCode || "").toUpperCase();
  let curData = chemistryCurriculum;
  let themeColor = "var(--chem-primary)";
  let tabId = "chem";
  if (code.startsWith("BIO")) {
    curData = biologyCurriculum;
    themeColor = "var(--bio-primary)";
    tabId = "bio";
  } else if (code.startsWith("PHYS")) {
    curData = physicsCurriculum;
    themeColor = "var(--phys-primary)";
    tabId = "phys";
  }
  const mod = curData.modules.find(m => m.id === parseInt(moduleId, 10));
  if (mod) {
    openModuleModal(mod, themeColor, lessonId ? parseInt(lessonId, 10) : undefined);
  }
};

window.switchToFlashcard = function(subjectCode, moduleId, lessonId) {
  AppState.flashcardFilter = {
    subject: subjectCode || "ALL",
    moduleId: moduleId !== undefined ? moduleId : "ALL",
    lessonId: lessonId !== undefined ? lessonId : "ALL"
  };
  switchTab("flashcards");
};

function renderCurrentView() {
  const container = document.getElementById("main-content-view");
  if (!container) return;

  if (AppState.currentTab === "flashcards") {
    container.innerHTML = `<div id="flashcards-mount"></div>`;
    const initialFilter = AppState.flashcardFilter || {};
    AppState.flashcardFilter = null;
    renderFlashcards("flashcards-mount", initialFilter);
    return;
  }

  if (AppState.currentTab === "quiz") {
    container.innerHTML = `<div id="quiz-engine-mount"></div>`;
    renderQuizEngine("quiz-engine-mount");
    return;
  }

  if (AppState.currentTab === "labs") {
    renderVirtualLabsHub(container);
    return;
  }

  // Subject View (Chemistry, Biology, or Physics)
  let curData = chemistryCurriculum;
  let themeColor = "var(--chem-primary)";
  if (AppState.currentTab === "bio") {
    curData = biologyCurriculum;
    themeColor = "var(--bio-primary)";
  } else if (AppState.currentTab === "phys") {
    curData = physicsCurriculum;
    themeColor = "var(--phys-primary)";
  }

  renderSubjectView(container, curData, themeColor);
}

function mCode(num) {
  return num < 10 ? "0" + num : "" + num;
}

function formatLabName(labKey) {
  const map = {
    "lab-projectile": "Kinematics & Dynamics",
    "lab-titration": "Titration & Stoichiometry",
    "lab-microscope": "Microscopy & Histology",
    "lab-periodic-table": "Periodic Table & Atoms",
    "lab-circuits": "DC Circuits & Electricity",
    "lab-gas-laws": "Gas Kinetics & Thermal",
    "lab-dna-protein": "DNA & Molecular Genetics",
    "lab-punnett": "Punnett Genetics & Ecology",
    "lab-optics": "Optics & Wave Phenomena"
  };
  return map[labKey] || "Virtual Laboratory";
}

function getLessonIconEmoji(type) {
  if (!type) return "🔬";
  if (type.startsWith("chem-density")) return "⚖️";
  if (type.startsWith("chem-heating")) return "🔥";
  if (type.startsWith("chem-bohr")) return "⚛️";
  if (type.startsWith("chem-rutherford")) return "🎯";
  if (type.startsWith("chem-stoichiometry")) return "🧪";
  if (type.startsWith("chem-gas-kinetics")) return "💨";
  if (type.startsWith("chem-calorimetry")) return "🌡️";
  if (type.startsWith("chem-molarity")) return "💧";
  if (type.startsWith("chem-equilibrium")) return "🔄";
  if (type.startsWith("chem-galvanic-cell")) return "🔋";
  if (type.startsWith("chem-nuclear-decay")) return "☢️";
  if (type.startsWith("chem-organic-builder")) return "⬡";
  if (type.startsWith("chem-periodic-trends")) return "📊";
  if (type.startsWith("bio-membrane")) return "🫧";
  if (type.startsWith("bio-enzyme")) return "⚡";
  if (type.startsWith("bio-action-potential")) return "🧠";
  if (type.startsWith("bio-punnett")) return "🧬";
  if (type.startsWith("bio-population-growth")) return "📈";
  if (type.startsWith("bio-photosynthesis")) return "🍃";
  if (type.startsWith("bio-mitosis") || type.startsWith("bio-cell-cycle")) return "🔬";
  if (type.startsWith("bio-hardy-weinberg")) return "🦋";
  if (type.startsWith("bio-immune-response")) return "🛡️";
  if (type.startsWith("phys-kinematics")) return "🏎️";
  if (type.startsWith("phys-inclined")) return "📐";
  if (type.startsWith("phys-projectile")) return "🏹";
  if (type.startsWith("phys-gravity-orbits")) return "🪐";
  if (type.startsWith("phys-circular-motion")) return "🎡";
  if (type.startsWith("phys-work-energy")) return "🎢";
  if (type.startsWith("phys-shm-oscillator")) return "〰️";
  if (type.startsWith("phys-doppler")) return "🔊";
  if (type.startsWith("phys-snell")) return "💎";
  if (type.startsWith("phys-wave-optics")) return "🌈";
  if (type.startsWith("phys-coulomb-field")) return "⚡";
  if (type.startsWith("phys-dc-circuit")) return "💡";
  if (type.startsWith("phys-lorentz-force")) return "🧲";
  if (type.startsWith("phys-faraday-induction")) return "🔌";
  if (type.startsWith("phys-photoelectric")) return "☀️";
  if (type.startsWith("phys-collision")) return "💥";
  return "🔬";
}

function renderSubjectView(container, curData, themeColor) {
  // Extract unique units
  const units = ["ALL", ...new Set(curData.modules.map(m => m.unit || "Core Modules"))];

  // Filter modules
  let filtered = curData.modules;
  if (AppState.selectedUnit !== "ALL") {
    filtered = filtered.filter(m => (m.unit || "Core Modules") === AppState.selectedUnit);
  }
  if (AppState.searchQuery.trim() !== "") {
    const q = AppState.searchQuery.toLowerCase();
    filtered = filtered.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.code.toLowerCase().includes(q) ||
      m.phenomenon.toLowerCase().includes(q) ||
      (m.bigIdea && m.bigIdea.toLowerCase().includes(q)) ||
      m.lessons.some(l => l.title.toLowerCase().includes(q))
    );
  }

  const isLessonsView = AppState.homeViewMode === "lessons";
  const totalLessonsCount = filtered.reduce((acc, m) => acc + m.lessons.length, 0);

  container.innerHTML = `
    <!-- Subject Hero Banner -->
    <div class="hero-banner">
      <div class="hero-platform-label">
        <span class="hero-platform-brand">Edugates-ClipSAT Science Labs</span>
        <span class="hero-platform-sep">•</span>
        <span class="hero-platform-curriculum">Inspire Science Curriculum</span>
      </div>
      <div class="hero-badge" style="color: ${themeColor}; border-color: ${themeColor}44; background: ${themeColor}15; margin-top: 8px;">
        ${curData.badge}
      </div>
      <h2 class="hero-title">${curData.subject} Virtual Laboratories</h2>
      <p class="hero-desc">${curData.description}</p>

      <div class="hero-metrics">
        <div class="metric-pill">
          <div class="metric-num" style="color: ${themeColor};">${curData.totalModules}</div>
          <div class="metric-label">Curriculum<br>Chapters</div>
        </div>
        <div class="metric-pill">
          <div class="metric-num" style="color: #38bdf8;">${curData.modules.reduce((sum, m) => sum + m.lessons.length, 0)}</div>
          <div class="metric-label">Interactive<br>Lessons</div>
        </div>
        <div class="metric-pill">
          <div class="metric-num" style="color: #10b981;">100%</div>
          <div class="metric-label">Book Photos<br>&amp; Phenomena</div>
        </div>
        <div class="metric-pill">
          <div class="metric-num" style="color: #f59e0b;">CER</div>
          <div class="metric-label">NGSS Inquiry<br>Aligned</div>
        </div>
      </div>
    </div>

    <!-- Search, View Switcher & Unit Filter Chips -->
    <div class="filter-search-row">
      <div class="search-box-wrapper">
        <div class="search-icon-inside">${icons.search}</div>
        <input type="text" class="search-input" id="search-modules-input" placeholder="Search chapters, lessons, concepts, or phenomena..." value="${AppState.searchQuery}">
      </div>

      <!-- View Switcher: Chapters vs Individual Lesson Cards -->
      <div class="view-mode-toggle-group" title="Toggle between Chapter Cards and Lesson Cards">
        <button class="view-mode-btn ${!isLessonsView ? 'active' : ''}" data-view="chapters">
          <span>📖</span>
          <span>Chapter Cards (${filtered.length})</span>
        </button>
        <button class="view-mode-btn ${isLessonsView ? 'active' : ''}" data-view="lessons">
          <span>🔬</span>
          <span>Lesson Cards (${totalLessonsCount})</span>
        </button>
      </div>

      <div class="unit-filters-scroll">
        ${units.map(u => `
          <button class="unit-filter-chip ${AppState.selectedUnit === u ? 'active' : ''}" data-unit="${u}">
            ${u === 'ALL' ? 'All Units' : u}
          </button>
        `).join("")}
      </div>
    </div>

    <!-- Cards Display Area -->
    ${!isLessonsView ? `
      <!-- Chapters / Modules Grid with Textbook Opener Banners & Lesson Miniatures -->
      <div class="modules-grid" id="modules-cards-container">
        ${filtered.map((m, mIdx) => {
          const imgPath = `assets/chapters/${curData.code.toLowerCase()}_m${mCode(m.id)}.jpg`;
          const isTopPriority = mIdx < 3;
          return `
            <div class="module-card" data-mid="${m.id}" style="--card-accent: ${themeColor};">
              <!-- Textbook Chapter Opener Photo Banner -->
              <div class="module-card-banner">
                <div class="module-banner-fallback-icon" aria-hidden="true">
                  ${curData.code === 'CHEM' ? icons.chemistry : (curData.code === 'BIO' ? icons.biology : icons.physics)}
                </div>
                <img src="${imgPath}" alt="${m.title}" class="module-banner-img" loading="${isTopPriority ? 'eager' : 'lazy'}" decoding="async" fetchpriority="${isTopPriority ? 'high' : 'low'}" onerror="this.style.opacity='0'; this.parentElement.classList.add('has-fallback-pattern');">
                <div class="module-banner-overlay"></div>
                <div class="module-banner-badges">
                  <span class="module-code-badge">${m.code}</span>
                  <span class="module-unit-tag">${m.unit || 'Core Module'}</span>
                </div>
              </div>

              <div class="module-card-content">
                <div>
                  <h3 class="module-title">${m.title}</h3>
                  <div class="module-phenomenon">
                    <span class="phenomenon-label">Encounter Phenomenon</span>
                    <div class="phenomenon-text">"${m.phenomenon}"</div>
                  </div>
                </div>

                <!-- Lessons in this Chapter with Topic Simulation Emblems -->
                <div class="module-lessons-container">
                  <div class="module-lessons-header">
                    <span>Lessons in this Chapter</span>
                    <span class="module-lesson-count">${m.lessons.length} Lessons</span>
                  </div>
                  <div class="module-lessons-list">
                    ${m.lessons.map(l => {
                      const spec = getLessonInteractiveSpec(curData.code, m.id, l.id);
                      const iconEmoji = getLessonIconEmoji(spec.type);
                      return `
                        <div class="lesson-row-card" data-mid="${m.id}" data-lid="${l.id}" title="Click to launch Lesson ${l.id} Interactive: ${l.title}">
                          <div class="lesson-row-pic" title="${spec.title}">
                            <span class="lesson-row-icon">${iconEmoji}</span>
                          </div>
                          <div class="lesson-row-text">
                            <div class="lesson-row-num">Lesson ${l.id}</div>
                            <div class="lesson-row-title">${l.title}</div>
                          </div>
                          <div class="lesson-row-action">
                            <span class="interactive-tag-mini">Sim</span>
                            <span class="play-arrow">▶</span>
                          </div>
                        </div>
                      `;
                    }).join("")}
                  </div>
                </div>

                <div class="module-card-footer">
                  <div class="lab-indicator">
                    ${icons.microscope}
                    <span>Lab: ${formatLabName(m.lab)}</span>
                  </div>
                  <div class="view-module-arrow">
                    Explore Chapter →
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    ` : `
      <!-- Standalone Lesson Cards Grid: Each Lesson has its Dedicated Picture, Formula & Launcher -->
      <div class="lessons-full-grid" id="lessons-cards-container">
        ${filtered.flatMap(m => m.lessons.map(l => ({ m, l }))).map(({ m, l }, idx) => {
          const spec = getLessonInteractiveSpec(curData.code, m.id, l.id);
          const iconEmoji = getLessonIconEmoji(spec.type);
          const imgPath = `assets/chapters/${curData.code.toLowerCase()}_m${mCode(m.id)}.jpg`;
          const isTopPriority = idx < 4;
          return `
            <div class="lesson-card-full" data-mid="${m.id}" data-lid="${l.id}" style="--card-accent: ${themeColor};">
              <div class="lesson-card-banner">
                <div class="module-banner-fallback-icon" aria-hidden="true">
                  ${curData.code === 'CHEM' ? icons.chemistry : (curData.code === 'BIO' ? icons.biology : icons.physics)}
                </div>
                <img src="${imgPath}" alt="${l.title}" class="lesson-banner-img" loading="${isTopPriority ? 'eager' : 'lazy'}" decoding="async" fetchpriority="${isTopPriority ? 'high' : 'low'}" onerror="this.style.opacity='0'; this.parentElement.classList.add('has-fallback-pattern');">
                <div class="lesson-banner-overlay"></div>
                <div class="lesson-banner-badge-group">
                  <span class="lesson-card-mcode">${m.code}</span>
                  <span class="lesson-card-lbadge">Lesson ${l.id}</span>
                </div>
                <div class="lesson-card-pic-circle" title="${spec.title}">
                  ${iconEmoji}
                </div>
              </div>

              <div class="lesson-card-body">
                <div>
                  <div class="lesson-card-chapter">${m.title}</div>
                  <h4 class="lesson-card-title">${l.title}</h4>
                </div>

                <div class="lesson-card-formula">
                  ${renderLatex(spec.formula, false)}
                </div>

                <div class="lesson-card-inquiry">
                  <strong>Inquiry Challenge:</strong> ${spec.inquiry}
                </div>

                <div class="lesson-card-footer" style="display: flex; gap: 8px;">
                  <button class="btn-launch-lesson-sim" data-mid="${m.id}" data-lid="${l.id}" style="flex: 1;">
                    <span>Launch Interactive</span>
                    <span class="play-icon">▶</span>
                  </button>
                  <button class="btn-launch-lesson-plan" data-mid="${m.id}" data-lid="${l.id}" title="Open 2-Page A4 Teacher Lesson Plan &amp; PDF Export" style="padding: 0 12px; height: 38px; font-size: 0.82rem; font-weight: 700; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-surface-elevated); color: var(--text-main); cursor: pointer; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; transition: all 0.2s ease;">
                    <span>📄 Plan</span>
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `}
  `;

  // Bind Search Input
  const searchInput = document.getElementById("search-modules-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      AppState.searchQuery = e.target.value;
      renderSubjectView(container, curData, themeColor);
      const newInp = document.getElementById("search-modules-input");
      if (newInp) {
        newInp.focus();
        newInp.selectionStart = newInp.selectionEnd = newInp.value.length;
      }
    });
  }

  // Bind View Mode Toggle Buttons (Chapters vs All Lessons)
  document.querySelectorAll(".view-mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      AppState.homeViewMode = btn.dataset.view;
      renderSubjectView(container, curData, themeColor);
    });
  });

  // Bind Unit Filter Chips
  document.querySelectorAll(".unit-filter-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      AppState.selectedUnit = btn.dataset.unit;
      renderSubjectView(container, curData, themeColor);
    });
  });

  // Bind Lesson Row Clicks to launch that lesson's interactive directly
  document.querySelectorAll(".lesson-row-card").forEach(pill => {
    pill.addEventListener("click", (e) => {
      e.stopPropagation();
      const mid = parseInt(pill.dataset.mid, 10);
      const lid = parseInt(pill.dataset.lid, 10);
      const mod = curData.modules.find(m => m.id === mid);
      if (mod) {
        openModuleModal(mod, themeColor, lid);
      }
    });
  });

  // Bind Standalone Lesson Card Clicks
  document.querySelectorAll(".lesson-card-full").forEach(card => {
    card.addEventListener("click", () => {
      const mid = parseInt(card.dataset.mid, 10);
      const lid = parseInt(card.dataset.lid, 10);
      const mod = curData.modules.find(m => m.id === mid);
      if (mod) {
        openModuleModal(mod, themeColor, lid);
      }
    });
  });

  // Bind Lesson Plan Button Clicks on Standalone Cards
  document.querySelectorAll(".btn-launch-lesson-plan").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const mid = parseInt(btn.dataset.mid, 10);
      const lid = parseInt(btn.dataset.lid, 10);
      openLessonPlanModal(curData.code, mid, lid);
    });
  });

  // Bind Module Card Clicks
  document.querySelectorAll(".module-card").forEach(card => {
    card.addEventListener("click", () => {
      const mid = parseInt(card.dataset.mid, 10);
      const mod = curData.modules.find(m => m.id === mid);
      if (mod) {
        openModuleModal(mod, themeColor);
      }
    });
  });

  renderMathInElement(container);
}

function renderVirtualLabsHub(container) {
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 28px;">
      <!-- Labs Header -->
      <div class="hero-banner labs-suite-hero">
        <div class="hero-badge labs-suite-badge">
          Interactive Simulation Workbenches (60 FPS)
        </div>
        <h2 class="hero-title">Virtual Laboratories Suite</h2>
        <p class="hero-desc">
          High-performance physics, chemistry, and biological simulations with live numerical data telemetry, variable control inputs, real-time calculus, and interactive laboratory apparatus.
        </p>

        <!-- 9 Lab Selector Tabs -->
        <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 20px;">
          <button class="btn ${AppState.activeLabId === 'projectile' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="projectile">
            ${icons.projectile} Kinematics & Projectiles
          </button>
          <button class="btn ${AppState.activeLabId === 'titration' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="titration">
            ${icons.titration} Acid-Base Titration
          </button>
          <button class="btn ${AppState.activeLabId === 'microscope' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="microscope">
            ${icons.microscope} Ultra-HD Microscope
          </button>
          <button class="btn ${AppState.activeLabId === 'ptable' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="ptable">
            ${icons.periodicTable} Interactive Periodic Table
          </button>
          <button class="btn ${AppState.activeLabId === 'circuits' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="circuits">
            ${icons.circuit} DC Circuits & Ohm's Law
          </button>
          <button class="btn ${AppState.activeLabId === 'gaslaws' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="gaslaws">
            ${icons.gasLaws} Gas Laws & Kinetic Theory
          </button>
          <button class="btn ${AppState.activeLabId === 'dnaprotein' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="dnaprotein">
            ${icons.dna} DNA & Protein Synthesis
          </button>
          <button class="btn ${AppState.activeLabId === 'punnett' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="punnett">
            ${icons.punnett} Punnett Genetics Cross
          </button>
          <button class="btn ${AppState.activeLabId === 'optics' ? 'btn-primary' : 'btn-secondary'} lab-nav-btn" data-lab="optics">
            ${icons.optics} Geometric Optics Ray Tracing
          </button>
        </div>
      </div>

      <!-- Mount Container for Selected Lab -->
      <div id="active-lab-mount" style="min-height: 580px;"></div>
    </div>
  `;

  // Bind Lab Selector Buttons
  document.querySelectorAll(".lab-nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      AppState.activeLabId = btn.dataset.lab;
      renderVirtualLabsHub(container);
    });
  });

  // Mount the chosen lab
  mountActiveLab();
}

function mountActiveLab() {
  const mount = document.getElementById("active-lab-mount");
  if (!mount) return;

  ProgressStore.recordLabLaunched(AppState.activeLabId);

  if (AppState.activeLabId === "projectile") {
    initProjectileLab("active-lab-mount");
  } else if (AppState.activeLabId === "titration") {
    initTitrationLab("active-lab-mount");
  } else if (AppState.activeLabId === "microscope") {
    initMicroscopeLab("active-lab-mount");
  } else if (AppState.activeLabId === "ptable") {
    initPeriodicTableLab("active-lab-mount");
  } else if (AppState.activeLabId === "circuits") {
    initCircuitsLab("active-lab-mount");
  } else if (AppState.activeLabId === "gaslaws") {
    initGasLawsLab("active-lab-mount");
  } else if (AppState.activeLabId === "dnaprotein") {
    initDnaProteinLab("active-lab-mount");
  } else if (AppState.activeLabId === "punnett") {
    initPunnettLab("active-lab-mount");
  } else if (AppState.activeLabId === "optics") {
    initOpticsLab("active-lab-mount");
  }
}
