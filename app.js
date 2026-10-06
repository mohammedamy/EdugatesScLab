// Edugates-ClipSAT Science Labs - Main Application Controller
// Responsive across Smartboards, PCs, Laptops, Tablets, and Mobiles

import { chemistryCurriculum } from "./data/chemistry-curriculum.js";
import { biologyCurriculum } from "./data/biology-curriculum.js";
import { physicsCurriculum } from "./data/physics-curriculum.js";
import { icons } from "./assets/icons.js";
import { openModuleModal } from "./components/module-viewer.js";
import { openProgressModal, ProgressStore, formatRelativeTime } from "./components/progress-tracker.js";
import { renderMathInElement, renderLatex } from "./utils/math-renderer.js";
import { getLessonInteractiveSpec } from "./data/lesson-interactive-specs.js";
import { SoundFX } from "./utils/audio-synth.js";
import { showToast, copyShareLink } from "./utils/toast.js";

// Theme-Color Meta Tag Synchronizer
export function syncThemeColor(theme) {
  if (typeof document === "undefined") return;
  let metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (!metaThemeColor) {
    metaThemeColor = document.createElement("meta");
    metaThemeColor.name = "theme-color";
    document.head.appendChild(metaThemeColor);
  }
  metaThemeColor.setAttribute("content", theme === "day" ? "#f8fafc" : "#070a12");
}

// Initialize Theme (Respect user preference or fallback to system color scheme)
const userSavedTheme = typeof localStorage !== "undefined" ? localStorage.getItem("edugates_theme") : null;
const systemPrefersLight = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
const savedTheme = userSavedTheme || (systemPrefersLight ? "day" : "night");
if (typeof document !== "undefined" && document.documentElement) {
  document.documentElement.setAttribute("data-theme", savedTheme);
  syncThemeColor(savedTheme);
  if (document.body) {
    document.body.setAttribute("data-theme", savedTheme);
  } else if (typeof window !== "undefined") {
    window.addEventListener("DOMContentLoaded", () => {
      if (document.body) document.body.setAttribute("data-theme", savedTheme);
      syncThemeColor(savedTheme);
    });
  }
}

if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
  try {
    const mql = window.matchMedia("(prefers-color-scheme: light)");
    const themeChangeHandler = (e) => {
      if (typeof localStorage !== "undefined" && !localStorage.getItem("edugates_theme")) {
        setTheme(e.matches ? "day" : "night");
      }
    };
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", themeChangeHandler);
    } else if (typeof mql.addListener === "function") {
      mql.addListener(themeChangeHandler);
    }
  } catch (err) {
    // Graceful fallback for older Android WebView engines
  }
}

// Global Application State
let currentActiveLabCleanup = null;
let currentActiveQuizCleanup = null;

const AppState = {
  currentTab: "chem", // 'chem', 'bio', 'phys', 'labs', 'quiz', 'flashcards'
  deviceMode: "auto", // 'auto', 'smartboard', 'desktop', 'tablet', 'mobile'
  theme: savedTheme, // 'day', 'night'
  homeViewMode: "chapters", // 'chapters', 'lessons'
  searchQuery: "",
  selectedUnit: "ALL",
  activeLabId: "projectile",
  quizFilter: null,
  labsFilterSubject: "all" // 'all', 'chem', 'phys', 'bio'
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
    badge: "36 Labs",
    tagline: "36 Interactive STEM Workbenches",
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

// Initialize App with fast boot execution and error boundary
function bootApp() {
  try {
    if (typeof window !== "undefined") {
      window.__APP_BOOTED__ = true;
      if (window.__BOOT_WATCHDOG_TIMER__) {
        clearTimeout(window.__BOOT_WATCHDOG_TIMER__);
      }
    }
    setupDeviceDetection();
    renderAppShell();
    if (typeof localStorage !== "undefined" && localStorage.getItem("edugates_focus_mode") === "true") {
      document.body.classList.add("focus-mode");
    }
    initCustomLogoDetector();
    bindGlobalEvents();
    bindAccessibilityEvents();

    // Register PWA Offline Service Worker (Graceful loading with fallback)
    if ("serviceWorker" in navigator && (window.location.protocol === "http:" || window.location.protocol === "https:")) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js").then(reg => {
          console.log("[AmScLab PWA] Service Worker registered with scope:", reg.scope);
          reg.addEventListener("updatefound", () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.addEventListener("statechange", () => {
                if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                  console.log("[AmScLab PWA] New update installed.");
                }
              });
            }
          });
        }).catch(err => {
          // Fallback to sw.js if service-worker.js registration fails
          navigator.serviceWorker.register("./sw.js").catch(swErr => {
            console.warn("[AmScLab PWA] Service Worker registration notice:", swErr);
          });
        });
      });
    }

    // Bind URL Hash Routing and process initial URL
    window.addEventListener("hashchange", handleHashRoute);
    window.addEventListener("popstate", handleHashRoute);
    if (window.location.hash) {
      handleHashRoute();
    } else {
      renderCurrentView();
    }

    // Mark application as successfully booted
    if (typeof window !== "undefined") {
      window.__APP_BOOTED__ = true;
      window.openOfflineDiagnosticsModal = () => {
        import("./components/offline-diagnostics.js").then(m => m.openOfflineDiagnosticsModal());
      };
    }

    // Defer floating smartboard pen bar canvas initialization slightly so first paint is instantaneous
    const loadSmartboardToolbar = () => {
      import("./components/smartboard-toolbar.js?v=3.1").then(m => m.initSmartboardToolbar()).catch(err => {
        console.warn("Smartboard toolbar deferred load warning:", err);
      });
    };
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(loadSmartboardToolbar, { timeout: 350 });
    } else {
      setTimeout(loadSmartboardToolbar, 100);
    }

    // Initialize Touch Screen 2-Finger Pinch-to-Zoom & Whole-Screen Scaling Engine
    import("./utils/touch-zoom.js").then(m => m.initTouchZoom()).catch(err => {
      console.warn("Touch zoom init warning:", err);
    });
  } catch (bootErr) {
    console.error("Application boot exception:", bootErr);
    if (typeof window !== "undefined" && typeof window.__TRIGGER_APP_ERROR__ === "function") {
      window.__TRIGGER_APP_ERROR__(bootErr);
    }
  }
}

function bindAccessibilityEvents() {
  // Direct Skip Link Focus Management
  const skipLink = document.querySelector(".skip-link");
  if (skipLink) {
    skipLink.addEventListener("click", (e) => {
      const mainContent = document.getElementById("main-content-view");
      if (mainContent) {
        e.preventDefault();
        mainContent.focus();
        mainContent.scrollIntoView({ behavior: "smooth" });
      }
    });
  }
}

export function enhanceA11y(container) {
  if (!container) return;

  // 1. Ensure range sliders have role="slider" and synchronized ARIA properties
  container.querySelectorAll('input[type="range"]').forEach(slider => {
    slider.setAttribute("role", "slider");
    const min = slider.getAttribute("min") || "0";
    const max = slider.getAttribute("max") || "100";
    const val = slider.value || min;
    slider.setAttribute("aria-valuemin", min);
    slider.setAttribute("aria-valuemax", max);
    slider.setAttribute("aria-valuenow", val);

    if (!slider.hasAttribute("aria-label")) {
      const label = slider.closest(".control-group")?.querySelector(".control-label") || 
                    slider.closest(".control-slider-group")?.querySelector(".slider-header span") ||
                    slider.parentElement?.querySelector("label");
      if (label) {
        slider.setAttribute("aria-label", label.innerText.replace(/[\r\n]+/g, " ").trim());
      } else if (slider.id) {
        slider.setAttribute("aria-label", slider.id.replace(/[-_]+/g, " "));
      }
    }

    if (!slider.__a11yBound) {
      slider.__a11yBound = true;
      slider.addEventListener("input", () => {
        slider.setAttribute("aria-valuenow", slider.value);
      });
    }
  });

  // 1b. Ensure select dropdowns and numeric inputs have aria-label
  container.querySelectorAll('select, input[type="number"], input[type="text"]').forEach(input => {
    if (!input.hasAttribute("aria-label") && !input.hasAttribute("aria-labelledby")) {
      const label = input.closest(".control-group, .control-slider-group")?.querySelector("label, .control-label, .slider-header span") ||
                    input.parentElement?.querySelector("label");
      if (label) {
        input.setAttribute("aria-label", label.innerText.replace(/[\r\n]+/g, " ").trim());
      } else if (input.id) {
        input.setAttribute("aria-label", input.id.replace(/[-_]+/g, " "));
      }
    }
  });

  // 2. View switchers & mode toggles
  container.querySelectorAll(".lab-view-switcher").forEach(switcher => {
    switcher.setAttribute("role", "group");
    switcher.setAttribute("aria-label", "Workbench View Switcher");
    switcher.querySelectorAll("button").forEach(btn => {
      btn.setAttribute("role", "button");
      btn.setAttribute("aria-pressed", btn.classList.contains("active") ? "true" : "false");
      if (!btn.hasAttribute("aria-label")) {
        btn.setAttribute("aria-label", btn.innerText.trim());
      }
    });
  });

  // 3. Telemetry dashboards & live readouts
  container.querySelectorAll(".sim-telemetry-dashboard").forEach(dash => {
    dash.setAttribute("role", "region");
    dash.setAttribute("aria-label", "Simulation Telemetry Readouts");
    dash.querySelectorAll("[id^='val-'], .metric-val").forEach(val => {
      val.setAttribute("role", "status");
      val.setAttribute("aria-live", "polite");
    });
  });

  // 4. Interactive Simulation Action Buttons (Launch, Fire, Reset, Pause, Record)
  container.querySelectorAll(".btn-lab-action, #btn-fire, #btn-reset, #btn-pause, #btn-play, #btn-record, #btn-launch").forEach(btn => {
    btn.setAttribute("role", "button");
    if (!btn.hasAttribute("aria-label")) {
      btn.setAttribute("aria-label", btn.innerText.trim() || btn.title || "Simulation Control");
    }
  });
}



function initCustomLogoDetector() {
  // Official brand asset is assets/logo.png
}

export function getOptimizedDPR() {
  const isSmart = (typeof document !== "undefined" && document.documentElement && (
    document.documentElement.getAttribute("data-mode") === "smartboard" ||
    document.documentElement.classList.contains("fast-smartboard-mode")
  )) || (typeof navigator !== "undefined" && /Android|MAXHUB|CVTE|seewo|SmartBoard/i.test(navigator.userAgent));
  return isSmart ? 1.0 : Math.min((typeof window !== "undefined" && window.devicePixelRatio) || 1, 2.0);
}
if (typeof window !== "undefined") {
  window.getLabDPR = getOptimizedDPR;
}

function isMaxhubOrSmartboardDevice() {
  const ua = (typeof navigator !== "undefined" && navigator.userAgent) || "";
  const isNamedSmartboard = /MAXHUB|CVTE|seewo|SmartBoard|Promethean|ViewBoard|Newline|BenQ|Clevertouch|TouchPanel|Horion|Huawei.*IdeaHub|Hikvision|HHT|IFP|InteractiveWhiteboard/i.test(ua);
  const isAndroidLargeScreen = /Android/i.test(ua) && (
    (typeof window !== "undefined" && window.screen && (window.screen.width >= 1024 || window.screen.height >= 720)) ||
    (typeof window !== "undefined" && window.innerWidth >= 1024)
  ) && ((typeof navigator !== "undefined" && navigator.maxTouchPoints > 0) || (typeof window !== "undefined" && 'ontouchstart' in window));
  return isNamedSmartboard || isAndroidLargeScreen;
}

function setupDeviceDetection() {
  const savedMode = typeof localStorage !== "undefined" ? localStorage.getItem("edugates_device_mode") : null;
  const isSmartboard = isMaxhubOrSmartboardDevice();

  if (savedMode) {
    setDeviceMode(savedMode);
  } else if (isSmartboard) {
    setDeviceMode("smartboard");
  } else {
    setDeviceMode("auto");
  }
}

function setDeviceMode(mode) {
  AppState.deviceMode = mode;
  try {
    localStorage.setItem("edugates_device_mode", mode);
    SoundFX.playClick();
  } catch (e) {}

  document.body.classList.remove("mode-smartboard", "mode-tablet", "mode-mobile", "fast-smartboard-mode", "is-smartboard");
  document.documentElement.classList.remove("mode-smartboard", "fast-smartboard-mode", "is-smartboard");

  if (mode === "smartboard") {
    document.body.classList.add("mode-smartboard", "fast-smartboard-mode", "is-smartboard");
    document.documentElement.classList.add("mode-smartboard", "fast-smartboard-mode", "is-smartboard");
    document.documentElement.setAttribute("data-mode", "smartboard");
  } else if (mode === "tablet") {
    document.body.classList.add("mode-tablet");
    document.documentElement.setAttribute("data-mode", "tablet");
  } else if (mode === "mobile") {
    document.body.classList.add("mode-mobile");
    document.documentElement.setAttribute("data-mode", "mobile");
  } else {
    // Auto Mode: evaluate hardware profile
    if (isMaxhubOrSmartboardDevice()) {
      document.body.classList.add("mode-smartboard", "fast-smartboard-mode", "is-smartboard");
      document.documentElement.classList.add("mode-smartboard", "fast-smartboard-mode", "is-smartboard");
      document.documentElement.setAttribute("data-mode", "smartboard");
    } else {
      document.documentElement.removeAttribute("data-mode");
    }
  }

  // Update active state in device toggle buttons
  document.querySelectorAll(".device-btn").forEach(b => {
    const isActive = b.dataset.mode === mode;
    b.classList.toggle("active", isActive);
    b.setAttribute("aria-pressed", isActive ? "true" : "false");
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
      <a href="#chem" class="brand-section" id="nav-brand-home" title="Edugates-ClipSAT Science Labs - Home" aria-label="Edugates-ClipSAT Science Labs Home" style="text-decoration: none; color: inherit;">
        <div class="brand-logo-box" id="brand-logo-wrapper">
          <img src="assets/logo.png" alt="Edugates-ClipSAT Science Labs Logo" class="brand-logo-img" id="brand-logo-img" onerror="this.style.display='none'; document.getElementById('brand-logo-fallback').style.display='flex';">
          <div id="brand-logo-fallback" class="brand-logo-icon" style="display: none;">
            ${icons.logo}
          </div>
        </div>
        <div class="brand-text">
          <h1><span class="brand-title-prefix">Edugates-ClipSAT</span> <span class="logo-highlight">Science Labs</span></h1>
          <div class="brand-tagline">
            <span class="tagline-core">Virtual Labs &amp; STEM Curriculum</span><span class="tagline-extra"> • Chemistry • Biology • Physics</span>
          </div>
        </div>
      </a>

      <!-- Semantic Main Navigation Landmark -->
      <nav class="app-nav-container app-nav-center" aria-label="Main Navigation">
        <!-- Responsive Segmented Subject Tabs (Desktop & Large Touch / MAXHUB screens >= 960px) -->
        <div class="nav-subject-tabs" role="tablist" aria-label="Curriculum Subjects and Laboratories">
          ${NAV_SUBJECTS.map(sub => `
            <a href="#${sub.id}" class="nav-subject-tab-pill ${sub.themeClass} ${AppState.currentTab === sub.id ? 'active' : ''}" 
               data-tab="${sub.id}" role="tab" aria-selected="${AppState.currentTab === sub.id ? 'true' : 'false'}"
               title="${sub.name}: ${sub.tagline}" aria-label="${sub.name}: ${sub.tagline}">
              <span class="tab-pill-icon" aria-hidden="true">${sub.icon}</span>
              <span class="tab-pill-text">${sub.name}</span>
            </a>
          `).join('')}
        </div>

        <!-- Navigation Subject Dropdown Menu (Mobile / Compact Viewports) -->
        <div class="nav-dropdown-wrapper" id="nav-dropdown-wrapper">
          <button class="nav-dropdown-trigger ${curSub.themeClass}" id="nav-dropdown-trigger" 
                  aria-haspopup="true" aria-expanded="false" 
                  aria-label="Select Subject (Current: ${curSub.name})"
                  title="Select Subject: ${curSub.name}">
            <div class="nav-dropdown-trigger-icon" id="nav-dropdown-current-icon">
              ${curSub.icon}
            </div>
            <span class="nav-dropdown-current-title" id="nav-dropdown-current-title">${curSub.name}</span>
            <div class="nav-dropdown-chevron" id="nav-dropdown-chevron" aria-hidden="true">
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
                <a href="#${sub.id}" class="nav-dropdown-item ${sub.themeClass} ${AppState.currentTab === sub.id ? 'active' : ''}" 
                        data-tab="${sub.id}" role="menuitem" aria-label="${sub.name}: ${sub.tagline}" style="text-decoration: none; color: inherit;">
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
                </a>
              `).join('')}
            </div>
          </div>
        </div>
      </nav>

      <!-- Right Controls & Device Mode -->
      <div class="nav-right-controls" role="toolbar" aria-label="Display &amp; Hardware Mode Settings">
        <!-- Quick 1-Click Lab Mode Launcher Button -->
        <a href="#labs" class="nav-btn-lab-mode" id="btn-nav-lab-mode" title="Quick Lab Mode - 36 Interactive Virtual Laboratories" aria-label="Quick launch Lab Mode">
          <span class="lab-mode-sparkle" aria-hidden="true">⚡</span>
          <span class="lab-mode-text">Lab Mode</span>
        </a>

        <!-- Day / Night Mode Toggle Switch -->
        <button class="theme-toggle-btn" id="btn-theme-toggle" title="Switch Day/Night Mode (Light/Dark)" aria-label="Toggle Day or Night theme">
          <div class="theme-toggle-track">
            <div class="theme-toggle-thumb">
              <span class="icon-sun">☀️</span>
              <span class="icon-moon">🌙</span>
            </div>
          </div>
          <span class="theme-toggle-text">${AppState.theme === 'day' ? 'Day' : 'Night'}</span>
        </button>

        <!-- Mastery Telemetry Button -->
        <button class="btn btn-secondary nav-action-btn" id="btn-open-progress" title="Student STEM Mastery Telemetry" aria-label="Student STEM Mastery telemetry and progress">
          <span class="nav-btn-icon">${icons.trophy}</span>
          <span class="nav-btn-label">Mastery</span>
        </button>

        <!-- Focus Presentation Mode Toggle Button -->
        <button class="btn btn-secondary nav-action-btn" id="btn-toggle-focus-mode" title="Focus Presentation Mode (Hide Navigation Chrome, Shift+F)" aria-label="Toggle Focus Presentation Mode">
          <span class="nav-btn-icon">🎯</span>
          <span class="nav-btn-label">Focus</span>
        </button>

        <div class="device-mode-toggle" role="group" aria-label="Screen Optimization &amp; Hardware Profile" title="Screen Optimization &amp; Hardware Profile">
          <button class="device-btn ${AppState.deviceMode === 'auto' ? 'active' : ''}" data-mode="auto" aria-label="Auto hardware profile" aria-pressed="${AppState.deviceMode === 'auto'}">Auto</button>
          <button class="device-btn ${AppState.deviceMode === 'smartboard' ? 'active' : ''}" data-mode="smartboard" aria-label="MAXHUB &amp; Smartboard 60 FPS Turbo Profile" aria-pressed="${AppState.deviceMode === 'smartboard'}" title="MAXHUB &amp; Smartboard 60 FPS Turbo Profile (Zero-Blur, Opaque, Hardware Accelerated)">
            <span class="device-btn-icon">⚡</span>
            <span class="device-btn-full">MAXHUB Turbo</span>
            <span class="device-btn-short">Turbo</span>
          </button>
          <button class="device-btn ${AppState.deviceMode === 'tablet' ? 'active' : ''}" data-mode="tablet" aria-label="Tablet Profile" aria-pressed="${AppState.deviceMode === 'tablet'}" title="Tablet Mode">Tablet</button>
          <button class="device-btn ${AppState.deviceMode === 'mobile' ? 'active' : ''}" data-mode="mobile" aria-label="Mobile Profile" aria-pressed="${AppState.deviceMode === 'mobile'}" title="Mobile Mode">Mobile</button>
        </div>
      </div>
    </header>

    <!-- Exit Focus Mode Floating Pill Button -->
    <button class="btn-focus-mode-exit" id="btn-exit-focus-mode" title="Exit Focus Mode (Shift+F or Esc)" aria-label="Exit Focus Presentation Mode">
      <span aria-hidden="true">✕</span>
      <span>Exit Focus Mode</span>
    </button>

    <!-- Main Viewport Area -->
    <main class="app-main" id="main-content-view" tabindex="-1"></main>
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
  if (document.body) {
    document.body.setAttribute("data-theme", theme);
  }
  localStorage.setItem("edugates_theme", theme);
  syncThemeColor(theme);
  try {
    SoundFX.playClick();
  } catch (e) {}
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
  document.getElementById("nav-brand-home")?.addEventListener("click", (e) => {
    e.preventDefault();
    try { SoundFX.playClick(); } catch (err) {}
    window.location.hash = "chem";
  });

  // Dropdown Trigger Toggle
  const dropdownTrigger = document.getElementById("nav-dropdown-trigger");
  if (dropdownTrigger) {
    dropdownTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      try { SoundFX.playClick(); } catch (e) {}
      toggleSubjectDropdown();
    });
  }

  // Dropdown Menu Item Switchers
  document.querySelectorAll(".nav-dropdown-item").forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      try { SoundFX.playClick(); } catch (e) {}
      switchTab(item.dataset.tab, true);
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
      window.location.hash = "mastery";
    });
  }

  // Offline Diagnostics Modal
  const diagBtn = document.getElementById("btn-open-offline-diag");
  if (diagBtn) {
    diagBtn.addEventListener("click", () => {
      import("./components/offline-diagnostics.js").then(m => m.openOfflineDiagnosticsModal());
    });
  }

  // Instant Client-Side Search Shortcut (Ctrl+K, Cmd+K, or / when not typing)
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      const inp = document.getElementById("search-modules-input");
      if (inp) {
        inp.focus();
        inp.select();
      }
    } else if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
      const inp = document.getElementById("search-modules-input");
      if (inp) {
        e.preventDefault();
        inp.focus();
        inp.select();
      }
    }
  });

  // Focus Presentation Mode Toggle & Exit with Persistence
  const toggleFocusMode = (forceState) => {
    const isNowFocus = typeof forceState === "boolean"
      ? forceState
      : !document.body.classList.contains("focus-mode");
    document.body.classList.toggle("focus-mode", isNowFocus);
    try {
      localStorage.setItem("edugates_focus_mode", isNowFocus ? "true" : "false");
    } catch (e) {}
    try { SoundFX.playPop(); } catch (e) {}
  };
  document.getElementById("btn-toggle-focus-mode")?.addEventListener("click", () => toggleFocusMode());
  document.getElementById("btn-exit-focus-mode")?.addEventListener("click", () => toggleFocusMode(false));

  // Shift+F Keyboard Shortcut for Focus Mode
  document.addEventListener("keydown", (e) => {
    if (e.shiftKey && e.key.toLowerCase() === "f" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      toggleFocusMode();
    } else if (e.key === "Escape" && document.body.classList.contains("focus-mode")) {
      toggleFocusMode(false);
    }
  });

  // Direct Subject Switcher Shortcuts: 1: Chem, 2: Bio, 3: Phys, 4: Labs, 5: Quiz, 6: Flashcards
  document.addEventListener("keydown", (e) => {
    if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable) return;
    if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
    if (document.querySelector(".modal-overlay:not([style*='display: none'])")) return;
    const keyMap = { "1": "chem", "2": "bio", "3": "phys", "4": "labs", "5": "quiz", "6": "flashcards" };
    if (keyMap[e.key]) {
      e.preventDefault();
      try { SoundFX.playClick(); } catch (err) {}
      switchTab(keyMap[e.key], true);
    }
  });
}

export function openShortcutsModal() {
  let overlay = document.getElementById("shortcuts-modal-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "shortcuts-modal-overlay";
    overlay.className = "modal-overlay";
    document.body.appendChild(overlay);
  }
  overlay.style.display = "flex";
  document.body.style.overflow = "hidden";

  overlay.innerHTML = `
    <div class="modal-content-shell" role="dialog" aria-modal="true" aria-labelledby="modal-shortcuts-title" style="max-width: 580px;">
      <div class="modal-header">
        <div class="modal-header-titles">
          <div class="modal-category-badge" style="color: #38bdf8;">Classroom &amp; Power User Cheatsheet</div>
          <div class="modal-title" id="modal-shortcuts-title">Keyboard &amp; Smartboard Shortcuts</div>
        </div>
        <button class="modal-close-btn" id="btn-close-shortcuts" aria-label="Close shortcuts cheatsheet">✕</button>
      </div>
      <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px; font-size: 0.9rem;">
        <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px 18px; align-items: center; background: var(--bg-surface-elevated); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
          <kbd style="background: rgba(0,0,0,0.4); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2); font-family: var(--font-mono); font-weight: 700; color: #38bdf8;">Shift + F</kbd>
          <span><strong>Focus Mode</strong> — Distraction-free smartboard presentation (hides header &amp; nav)</span>

          <kbd style="background: rgba(0,0,0,0.4); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2); font-family: var(--font-mono); font-weight: 700; color: #38bdf8;">Ctrl + K</kbd>
          <span><strong>Search</strong> — Quick jump to curriculum search input</span>

          <kbd style="background: rgba(0,0,0,0.4); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2); font-family: var(--font-mono); font-weight: 700; color: #38bdf8;">Esc</kbd>
          <span><strong>Exit / Close</strong> — Close open lesson modal, exit Fullscreen, or exit Focus mode</span>

          <kbd style="background: rgba(0,0,0,0.4); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2); font-family: var(--font-mono); font-weight: 700; color: #38bdf8;">1 – 6</kbd>
          <span><strong>Subject Switcher</strong> — 1: Chem, 2: Bio, 3: Phys, 4: Labs, 5: Quiz, 6: Flashcards</span>

          <kbd style="background: rgba(0,0,0,0.4); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2); font-family: var(--font-mono); font-weight: 700; color: #fbbf24;">P / H / E</kbd>
          <span><strong>Smartboard Annotation</strong> — P: Pen, H: Highlighter, E: Eraser</span>
        </div>
      </div>
    </div>
  `;

  const closeShortcuts = () => {
    overlay.style.display = "none";
    document.body.style.overflow = "";
    document.removeEventListener("keydown", keyHandler);
  };
  const keyHandler = (e) => {
    if (e.key === "Escape") closeShortcuts();
  };
  document.addEventListener("keydown", keyHandler);
  overlay.querySelector("#btn-close-shortcuts")?.addEventListener("click", closeShortcuts);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeShortcuts();
  });
}

export function findModuleByCode(rawCode) {
  if (!rawCode) return null;
  const clean = rawCode.trim().toUpperCase();
  for (const curr of [chemistryCurriculum, biologyCurriculum, physicsCurriculum]) {
    const mod = curr.modules.find(m => m.code.toUpperCase() === clean);
    if (mod) return { mod, curr };
  }
  const match = clean.match(/^(CHEM|BIO|PHYS)?[-_]?M?(\d+)$/i);
  if (match) {
    const prefix = (match[1] || "").toUpperCase();
    const id = parseInt(match[2], 10);
    let curr = chemistryCurriculum;
    if (prefix.startsWith("BIO")) curr = biologyCurriculum;
    else if (prefix.startsWith("PHYS")) curr = physicsCurriculum;
    const mod = curr.modules.find(m => m.id === id);
    if (mod) return { mod, curr };
  }
  return null;
}

export function handleHashRoute() {
  const hash = window.location.hash.slice(1);
  if (!hash) {
    switchTab("chem", false);
    return;
  }

  const [pathPart, queryPart] = hash.split("?");
  const params = {};
  if (queryPart) {
    queryPart.split("&").forEach(pair => {
      const [k, v] = pair.split("=");
      if (k) params[decodeURIComponent(k)] = decodeURIComponent(v || "");
    });
  }

  const segments = pathPart.split("/").filter(Boolean);
  const route = (segments[0] || "chem").toLowerCase();

  // Accessibility Skip-Link Target Anchor Focus Management
  if (route === "main-content-view") {
    const mainEl = document.getElementById("main-content-view");
    if (mainEl) {
      mainEl.focus();
      mainEl.scrollIntoView({ behavior: "smooth" });
    }
    return;
  }

  // Route 1: Main Curriculum Tabs & Hubs
  if (["chem", "bio", "phys", "labs", "lab", "quiz", "flashcards"].includes(route)) {
    if (window.closeActiveModuleModal) window.closeActiveModuleModal();
    if (window.closeActiveLessonPlanModal) window.closeActiveLessonPlanModal();
    if (window.closeActiveProgressModal) window.closeActiveProgressModal();

    if (typeof window !== "undefined" && window.TouchZoom && typeof window.TouchZoom.setAllowed === "function") {
      window.TouchZoom.setAllowed(route === "labs" || route === "lab");
    }

    const targetTab = route === "lab" ? "labs" : route;
    if ((route === "labs" || route === "lab") && segments[1]) {
      AppState.activeLabId = normalizeLabId(segments[1]);
    }
    if (route === "quiz") {
      AppState.quizFilter = params;
    }
    if (params.unit) AppState.selectedUnit = params.unit;
    if (params.view) AppState.homeViewMode = params.view;
    if (params.q) AppState.searchQuery = params.q;

    switchTab(targetTab, false);
    return;
  }

  // Route 2: Specific Module Modal (#module/CHEM-M05 or #module/chem-5)
  if (route === "module") {
    const modCode = segments[1];
    const lid = segments[2] ? parseInt(segments[2], 10) : undefined;
    const res = findModuleByCode(modCode);
    if (res) {
      const tabId = res.curr.code.toLowerCase();
      if (AppState.currentTab !== tabId) {
        switchTab(tabId, false);
      }
      const themeColor = `var(--${tabId}-primary)`;
      openModuleModal(res.mod, themeColor, lid);
    } else {
      switchTab("chem", false);
    }
    return;
  }

  // Route 3: Specific Lesson Interactive (#lesson/CHEM-M05-L2 or #lesson/chem-5/2)
  if (route === "lesson") {
    let modCode = segments[1] || "";
    let lid = segments[2] ? parseInt(segments[2], 10) : undefined;
    if (modCode.toUpperCase().includes("-L")) {
      const parts = modCode.toUpperCase().split("-L");
      modCode = parts[0];
      lid = parseInt(parts[1], 10);
    }
    const res = findModuleByCode(modCode);
    if (res) {
      const tabId = res.curr.code.toLowerCase();
      if (AppState.currentTab !== tabId) {
        switchTab(tabId, false);
      }
      const themeColor = `var(--${tabId}-primary)`;
      openModuleModal(res.mod, themeColor, lid || 1);
    } else {
      switchTab("chem", false);
    }
    return;
  }

  // Route 4: Teacher Lesson Plan Modal (#plan/CHEM-M05-L2 or #plan/chem-5/2)
  if (route === "plan") {
    let modCode = segments[1] || "";
    let lid = segments[2] ? parseInt(segments[2], 10) : 1;
    if (modCode.toUpperCase().includes("-L")) {
      const parts = modCode.toUpperCase().split("-L");
      modCode = parts[0];
      lid = parseInt(parts[1], 10);
    }
    const res = findModuleByCode(modCode);
    if (res) {
      const tabId = res.curr.code.toLowerCase();
      if (AppState.currentTab !== tabId) {
        switchTab(tabId, false);
      }
      import("./components/lesson-plan-generator.js").then(m => {
        m.openLessonPlanModal(res.curr.code, res.mod.id, lid);
      });
    } else {
      switchTab("chem", false);
    }
    return;
  }

  // Route 5: Student STEM Mastery Dashboard (#mastery)
  if (route === "mastery") {
    openProgressModal();
    return;
  }

// Fallback default
  switchTab("chem", false);
}

function switchTab(tabId, updateHash = true) {
  if (tabId !== "labs" && typeof currentActiveLabCleanup === "function") {
    try { currentActiveLabCleanup(); } catch (e) {}
    currentActiveLabCleanup = null;
  }
  if (tabId !== "quiz" && typeof currentActiveQuizCleanup === "function") {
    try { currentActiveQuizCleanup(); } catch (e) {}
    currentActiveQuizCleanup = null;
  }

  // Sync touch zoom HUD: only allowed on labs tab or inside lesson/lab interactives
  if (typeof window !== "undefined" && window.TouchZoom && typeof window.TouchZoom.setAllowed === "function") {
    window.TouchZoom.setAllowed(tabId === "labs");
  }

  const prevTab = AppState.currentTab;
  AppState.currentTab = tabId;
  AppState.selectedUnit = "ALL";
  AppState.searchQuery = "";
  window.lastActiveTab = tabId;

  if (updateHash) {
    const targetHash = tabId === "labs" ? `#labs/${AppState.activeLabId}` : `#${tabId}`;
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
  }

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

  // Update active state in segmented tabs and dropdown items
  document.querySelectorAll(".nav-subject-tab-pill").forEach(pill => {
    const isActive = pill.dataset.tab === tabId;
    pill.classList.toggle("active", isActive);
    pill.setAttribute("aria-selected", isActive ? "true" : "false");
  });

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

  const container = document.getElementById("main-content-view");
  const isCurriculumTab = ["chem", "bio", "phys"].includes(tabId);
  const isDifferentTab = prevTab !== tabId;

  if (container && isCurriculumTab && isDifferentTab) {
    renderCurriculumSkeleton(container, tabId);
    setTimeout(() => {
      renderCurrentView();
      window.scrollTo({ top: 0, behavior: "smooth" });
      const mainView = document.getElementById("main-content-view");
      if (mainView) {
        mainView.focus({ preventScroll: true });
        enhanceA11y(mainView);
      }
    }, 40);
  } else {
    renderCurrentView();
    window.scrollTo({ top: 0, behavior: "smooth" });
    const mainView = document.getElementById("main-content-view");
    if (mainView) {
      mainView.focus({ preventScroll: true });
      enhanceA11y(mainView);
    }
  }
}

// Global Cross-Navigation Helpers
if (typeof window !== "undefined") {
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
}

function renderCurriculumSkeleton(container, subjectKey) {
  if (!container) return;
  const color = subjectKey === "bio" ? "var(--bio-primary)" : (subjectKey === "phys" ? "var(--phys-primary)" : "var(--chem-primary)");
  const name = subjectKey === "bio" ? "Biology" : (subjectKey === "phys" ? "Physics" : "Chemistry");
  container.innerHTML = `
    <div class="curriculum-skeleton-wrap" aria-busy="true" aria-label="Loading ${name} curriculum...">
      <div class="hero-banner skeleton-hero" style="border-left: 4px solid ${color};">
        <div class="skeleton-line shimmer" style="width: 140px; height: 16px; border-radius: 999px; margin-bottom: 12px;"></div>
        <div class="skeleton-line shimmer" style="width: 280px; height: 32px; border-radius: 8px; margin-bottom: 16px;"></div>
        <div class="skeleton-line shimmer" style="width: 70%; height: 18px; border-radius: 6px; margin-bottom: 24px;"></div>
        <div class="hero-metrics skeleton-metrics" style="opacity: 0.6;">
          <div class="metric-pill skeleton-pill shimmer"></div>
          <div class="metric-pill skeleton-pill shimmer"></div>
          <div class="metric-pill skeleton-pill shimmer"></div>
          <div class="metric-pill skeleton-pill shimmer"></div>
        </div>
      </div>
      <div class="modules-grid skeleton-grid">
        ${Array.from({ length: 8 }).map(() => `
          <div class="module-card skeleton-card" style="pointer-events: none;">
            <div class="module-card-banner is-loading" style="height: 145px; position: relative; overflow: hidden; border-radius: 10px 10px 0 0;">
              <div class="module-banner-skeleton" style="position: absolute; inset: 0;"></div>
            </div>
            <div class="module-card-content" style="padding: 16px;">
              <div class="skeleton-line shimmer" style="width: 32%; height: 14px; border-radius: 4px; margin-bottom: 10px;"></div>
              <div class="skeleton-line shimmer" style="width: 85%; height: 22px; border-radius: 6px; margin-bottom: 12px;"></div>
              <div class="skeleton-line shimmer" style="width: 100%; height: 14px; border-radius: 4px; margin-bottom: 6px;"></div>
              <div class="skeleton-line shimmer" style="width: 65%; height: 14px; border-radius: 4px; margin-bottom: 16px;"></div>
              <div style="display: flex; gap: 8px; margin-top: 14px;">
                <div class="skeleton-line shimmer" style="flex: 1; height: 32px; border-radius: 6px;"></div>
                <div class="skeleton-line shimmer" style="flex: 1; height: 32px; border-radius: 6px;"></div>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderCurrentView() {
  const container = document.getElementById("main-content-view");
  if (!container) return;

  if (AppState.currentTab === "flashcards") {
    container.innerHTML = `<div id="flashcards-mount"><div style="padding: 40px; text-align: center; color: var(--text-muted);">Loading Flashcards Deck...</div></div>`;
    const initialFilter = AppState.flashcardFilter || {};
    AppState.flashcardFilter = null;
    import("./components/flashcards.js").then(m => {
      m.renderFlashcards("flashcards-mount", initialFilter);
    }).catch(err => {
      console.error("Flashcards load error:", err);
      container.innerHTML = `<div style="padding: 30px; text-align: center; color: #ef4444;">Failed to load flashcards engine.</div>`;
    });
    return;
  }

  if (AppState.currentTab === "quiz") {
    if (typeof currentActiveQuizCleanup === "function") {
      try { currentActiveQuizCleanup(); } catch (e) {}
      currentActiveQuizCleanup = null;
    }
    container.innerHTML = `<div id="quiz-engine-mount"><div style="padding: 40px; text-align: center; color: var(--text-muted);">Loading Assessment Engine & Question Bank...</div></div>`;
    const initialConfig = AppState.quizFilter || null;
    AppState.quizFilter = null;
    import("./components/quiz-engine.js?v=3.2").then(m => {
      currentActiveQuizCleanup = m.renderQuizEngine("quiz-engine-mount", initialConfig);
    }).catch(err => {
      console.error("Quiz load error:", err);
      container.innerHTML = `<div style="padding: 30px; text-align: center; color: #ef4444;">Failed to load assessment engine.</div>`;
    });
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

function getSubjectPlaceholderSvg(code) {
  if (code === "BIO") return "assets/placeholder-dna.svg";
  if (code === "PHYS") return "assets/placeholder-atom.svg";
  return "assets/placeholder-flask.svg";
}

// Master Registry of Virtual Laboratories (Classified by Chemistry, Physics, Biology)
// Adding new labs here or via registerVirtualLab() automatically categorizes and sorts them alphabetically (A-Z).
export const VIRTUAL_LABS_REGISTRY = [
  // Chemistry Laboratories (12)
  { id: "titration", subject: "chem", title: "Acid-Base Titration", icon: icons.titration, ariaLabel: "Acid-Base Titration Virtual Lab", href: "#labs/titration" },
  { id: "beerlambert", subject: "chem", title: "Beer-Lambert Law", icon: icons.beerLambert, ariaLabel: "Spectrophotometry and Beer-Lambert Law Lab", href: "#labs/beerlambert" },
  { id: "calorimetry", subject: "chem", title: "Calorimetry & ΔH", icon: icons.calorimetry, ariaLabel: "Calorimetry and Thermochemistry Virtual Lab", href: "#labs/calorimetry" },
  { id: "kinetics", subject: "chem", title: "Chemical Kinetics & Rates", icon: icons.reactionKinetics, ariaLabel: "Chemical Kinetics and Reaction Rates Lab", href: "#labs/kinetics" },
  { id: "colligative", subject: "chem", title: "Colligative Properties", icon: icons.colligative, ariaLabel: "Colligative Properties and Freezing Point Lab", href: "#labs/colligative" },
  { id: "electrochem", subject: "chem", title: "Electrochemistry & Voltaic", icon: icons.electrochem, ariaLabel: "Electrochemistry and Voltaic Cells Lab", href: "#labs/electrochem" },
  { id: "equilibrium", subject: "chem", title: "Equilibrium & Le Chatelier", icon: icons.equilibrium, ariaLabel: "Chemical Equilibrium and Le Chatelier Lab", href: "#labs/equilibrium" },
  { id: "gaslaws", subject: "chem", title: "Gas Laws & Kinetic Theory", icon: icons.gasLaws, ariaLabel: "Gas Laws and Kinetic Theory Lab", href: "#labs/gaslaws" },
  { id: "ptable", subject: "chem", title: "Interactive Periodic Table", icon: icons.periodicTable, ariaLabel: "Interactive Periodic Table Lab", href: "#labs/ptable" },
  { id: "decay", subject: "chem", title: "Nuclear Decay & Kinetics", icon: icons.nuclearDecay, ariaLabel: "Radioactive Decay and Nuclear Kinetics Lab", href: "#labs/decay" },
  { id: "organic", subject: "chem", title: "Organic Mechanisms", icon: icons.organicReactions, ariaLabel: "Organic Reaction Mechanisms Lab", href: "#labs/organic" },
  { id: "vsepr", subject: "chem", title: "VSEPR 3D Modeler", icon: icons.vsepr, ariaLabel: "VSEPR 3D Modeler Lab", href: "#labs/vsepr" },

  // Physics Laboratories (12)
  { id: "circuits", subject: "phys", title: "DC Circuits & Ohm's Law", icon: icons.circuit, ariaLabel: "DC Circuits and Ohm's Law Lab", href: "#labs/circuits" },
  { id: "induction", subject: "phys", title: "Electromagnetic Induction & Faraday", icon: icons.induction, ariaLabel: "Electromagnetic Induction and Faraday Lab", href: "#labs/induction" },
  { id: "fluids", subject: "phys", title: "Fluid Dynamics & Buoyancy", icon: icons.fluidsBuoyancy, ariaLabel: "Fluid Dynamics and Buoyancy Lab", href: "#labs/fluids" },
  { id: "optics", subject: "phys", title: "Geometric Optics Ray Tracing", icon: icons.optics, ariaLabel: "Geometric Optics Ray Tracing Lab", href: "#labs/optics" },
  { id: "harmonic", subject: "phys", title: "Harmonic Motion & Hooke", icon: icons.harmonic, ariaLabel: "Harmonic Motion and Hooke's Law Lab", href: "#labs/harmonic" },
  { id: "projectile", subject: "phys", title: "Kinematics & Projectiles", icon: icons.projectile, ariaLabel: "Kinematics and Projectiles Virtual Lab", href: "#labs/projectile" },
  { id: "collisions", subject: "phys", title: "Linear Momentum & Collisions", icon: icons.collisions, ariaLabel: "Linear Momentum and Collisions Virtual Lab", href: "#labs/collisions" },
  { id: "magnetism", subject: "phys", title: "Magnetic Force & e/m", icon: icons.magnetism, ariaLabel: "Magnetic Force and Lorentz e/m Lab", href: "#labs/magnetism" },
  { id: "photoelectric", subject: "phys", title: "Photoelectric Effect", icon: icons.photoelectric, ariaLabel: "Photoelectric Effect and Quantum Physics Lab", href: "#labs/photoelectric" },
  { id: "rotational", subject: "phys", title: "Rotational Dynamics", icon: icons.rotationalDynamics, ariaLabel: "Rotational Dynamics and Moment of Inertia Lab", href: "#labs/rotational" },
  { id: "conduction", subject: "phys", title: "Thermal Conduction", icon: icons.thermalConduction, ariaLabel: "Thermal Conduction and Fourier Law Lab", href: "#labs/conduction" },
  { id: "waves", subject: "phys", title: "Wave Interference & Slits", icon: icons.waveInterference, ariaLabel: "Wave Interference and Slits Lab", href: "#labs/waves" },

  // Biology Laboratories (12) - Suite Navigation href="#labs/anatomy"
  { id: "anatomy", subject: "bio", title: "4K Human Anatomy Atlas", icon: "🏛️", ariaLabel: "4K Human Anatomy Atlas and Histology Lab", href: "#labs/anatomy" },
  { id: "actionpotential", subject: "bio", title: "Action Potential Patch Clamp", icon: icons.actionPotential, ariaLabel: "Neurobiology and Action Potential Patch Clamp Lab", href: "#labs/actionpotential" },
  { id: "mitosis", subject: "bio", title: "Cell Cycle & Mitosis", icon: icons.mitosis, ariaLabel: "Cell Cycle and Mitosis Cytogenetics Lab", href: "#labs/mitosis" },
  { id: "osmosis", subject: "bio", title: "Cell Membrane & Osmosis", icon: icons.osmosis, ariaLabel: "Cell Membrane and Osmosis Virtual Lab", href: "#labs/osmosis" },
  { id: "respiration", subject: "bio", title: "Cellular Respiration", icon: icons.respiration, ariaLabel: "Cellular Respiration and Respirometer Lab", href: "#labs/respiration" },
  { id: "dnaprotein", subject: "bio", title: "DNA & Protein Synthesis", icon: icons.dna, ariaLabel: "DNA and Protein Synthesis Lab", href: "#labs/dnaprotein" },
  { id: "enzymes", subject: "bio", title: "Enzyme Kinetics", icon: icons.enzymes, ariaLabel: "Enzyme Kinetics and Catalysis Lab", href: "#labs/enzymes" },
  { id: "electrophoresis", subject: "bio", title: "Gel Electrophoresis", icon: icons.gelElectrophoresis, ariaLabel: "Agarose Gel Electrophoresis Lab", href: "#labs/electrophoresis" },
  { id: "photosynthesis", subject: "bio", title: "Photosynthesis & Bioenergetics", icon: icons.photosynthesis, ariaLabel: "Photosynthesis and Bioenergetics Lab", href: "#labs/photosynthesis" },
  { id: "ecology", subject: "bio", title: "Population Ecology", icon: icons.populationEcology, ariaLabel: "Population Ecology and Lotka-Volterra Lab", href: "#labs/ecology" },
  { id: "punnett", subject: "bio", title: "Punnett Genetics Cross", icon: icons.punnett, ariaLabel: "Punnett Genetics Cross Lab", href: "#labs/punnett" },
  { id: "microscope", subject: "bio", title: "Ultra-HD Microscope", icon: icons.microscope, ariaLabel: "Ultra-HD Microscope Virtual Lab", href: "#labs/microscope" }
];

export const LAB_SUBJECT_CONFIG = {
  chem: {
    id: "chem",
    label: "Chemistry",
    shortCode: "CHE",
    icon: "🧪",
    color: "#06b6d4",
    description: "Titration, Equilibrium, Gas Laws, Thermodynamics, VSEPR & Reaction Kinetics"
  },
  phys: {
    id: "phys",
    label: "Physics",
    shortCode: "PHY",
    icon: "⚛️",
    color: "#6366f1",
    description: "Kinematics, DC Circuits, Wave Optics, Harmonic Motion & Quantum Phenomena"
  },
  bio: {
    id: "bio",
    label: "Biology",
    shortCode: "BIO",
    icon: "🧬",
    color: "#10b981",
    description: "4K Human Anatomy Atlas, Microscopy, Genetics, Enzyme Kinetics & Bioenergetics"
  }
};

export function registerVirtualLab(labDef) {
  if (!labDef || !labDef.id) return;
  const idx = VIRTUAL_LABS_REGISTRY.findIndex(l => l.id === labDef.id);
  const entry = {
    href: `#labs/${labDef.id}`,
    ariaLabel: labDef.ariaLabel || `${labDef.title} Virtual Lab`,
    ...labDef
  };
  if (idx >= 0) {
    VIRTUAL_LABS_REGISTRY[idx] = { ...VIRTUAL_LABS_REGISTRY[idx], ...entry };
  } else {
    VIRTUAL_LABS_REGISTRY.push(entry);
  }
}

export function getClassifiedVirtualLabs() {
  const subjects = ["chem", "phys", "bio"];
  const result = {};

  subjects.forEach(sub => {
    const list = VIRTUAL_LABS_REGISTRY.filter(lab => (lab.subject || "phys").toLowerCase().startsWith(sub));
    // Sort strictly alphabetically by title (A to Z) using localeCompare
    list.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: "base" }));
    result[sub] = list;
  });

  return result;
}

export function normalizeLabId(rawId) {
  if (!rawId) return "projectile";
  const str = String(rawId).toLowerCase().trim().replace(/^lab[-_]?/, "");
  if (str === "beerlambert" || str.includes("beer") || str.includes("lambert") || str.includes("spectro")) return "beerlambert";
  if (str === "decay" || str.includes("decay") || str.includes("nuclear") || str.includes("radioact")) return "decay";
  if (str === "colligative" || str.includes("collig") || str.includes("freez") || str.includes("boil")) return "colligative";
  if (str === "organic" || str.includes("organ") || str.includes("sn1") || str.includes("sn2")) return "organic";
  if (str === "electrophoresis" || str.includes("electrophor") || str.includes("gel") || str.includes("agarose")) return "electrophoresis";
  if (str === "ecology" || str.includes("ecol") || str.includes("populat") || str.includes("lotka") || str.includes("predat")) return "ecology";
  if (str === "kinetics" || str.includes("kinet") || str.includes("reaction") || str.includes("arrhen") || str.includes("rate-law")) return "kinetics";
  if (str === "actionpotential" || str.includes("action-pot") || str.includes("actionpot") || str.includes("action_pot") || str.includes("neuron") || str.includes("patch") || str.includes("hodgkin")) return "actionpotential";
  if (str === "rotational" || str.includes("rotat") || str.includes("torque") || str.includes("inertia")) return "rotational";
  if (str === "conduction" || str.includes("conduct") || str.includes("fourier") || str.includes("heat")) return "conduction";
  if (str === "fluids" || str.includes("fluid") || str.includes("buoy") || str.includes("archimed") || str.includes("bernoulli")) return "fluids";
  if (str === "collisions" || str.includes("collis") || str.includes("moment") || str.includes("airtrack")) return "collisions";
  if (str === "induction" || str.includes("induct") || str.includes("faraday") || str.includes("lenz") || str.includes("solenoid")) return "induction";
  if (str === "osmosis" || str.includes("osmo") || str.includes("tonicit") || str.includes("plasmol")) return "osmosis";
  if (str === "mitosis" || str.includes("mitos") || str.includes("cellcycle") || str.includes("histol")) return "mitosis";
  if (str === "calorimetry" || str.includes("calorim")) return "calorimetry";
  if (str === "equilibrium" || str.includes("equilib") || str.includes("chatelier")) return "equilibrium";
  if (str === "electrochem" || str.includes("electro") || str.includes("galvan") || str.includes("voltaic")) return "electrochem";
  if (str === "harmonic" || str.includes("harmon") || str.includes("hooke") || str.includes("pendul")) return "harmonic";
  if (str === "photoelectric" || str.includes("photoelec") || str.includes("quantum")) return "photoelectric";
  if (str === "magnetism" || str.includes("magnet") || str.includes("lorentz")) return "magnetism";
  if (str === "enzymes" || str === "enzyme" || str.includes("enzym") || str.includes("catalys")) return "enzymes";
  if (str === "respiration" || str.includes("respir") || str.includes("ferment")) return "respiration";
  if (str === "ptable" || str === "periodic-table" || str === "periodictable" || str.includes("period")) return "ptable";
  if (str === "gaslaws" || str === "gas-laws" || str === "gaslaw" || str.includes("gas")) return "gaslaws";
  if (str === "dnaprotein" || str === "dna-protein" || str.includes("dna") || str.includes("protein")) return "dnaprotein";
  if (str === "punnett" || str === "punnett-square" || str.includes("punnett")) return "punnett";
  if (str === "projectile" || str.includes("project") || str.includes("kinemat")) return "projectile";
  if (str === "titration" || str.includes("titrat")) return "titration";
  if (str === "microscope" || str.includes("micro")) return "microscope";
  if (str === "circuits" || str === "circuit") return "circuits";
  if (str === "optics" || str === "optic") return "optics";
  if (str === "vsepr") return "vsepr";
  if (str === "waves" || str === "wave") return "waves";
  if (str === "photosynthesis" || str.includes("photo")) return "photosynthesis";
  if (str === "anatomy" || str === "atlas" || str === "human-anatomy" || str.includes("anatom") || str.includes("atlas")) return "anatomy";
  return "projectile";
}

function formatLabName(labKey) {
  const norm = normalizeLabId(labKey);
  if (typeof VIRTUAL_LABS_REGISTRY !== "undefined") {
    const reg = VIRTUAL_LABS_REGISTRY.find(l => l.id === norm);
    if (reg && reg.title) return reg.title;
  }
  const map = {
    "projectile": "Kinematics & Dynamics",
    "titration": "Titration & Stoichiometry",
    "microscope": "Microscopy & Histology",
    "ptable": "Periodic Table & Atoms",
    "circuits": "DC Circuits & Electricity",
    "gaslaws": "Gas Kinetics & Thermal",
    "dnaprotein": "DNA & Molecular Genetics",
    "punnett": "Punnett Genetics & Ecology",
    "optics": "Optics & Wave Phenomena",
    "vsepr": "VSEPR & Molecular Geometry",
    "waves": "Wave Interference & Slits",
    "photosynthesis": "Photosynthesis & Bioenergetics",
    "calorimetry": "Calorimetry & Thermochemistry",
    "equilibrium": "Equilibrium & Le Chatelier",
    "electrochem": "Electrochemistry & Voltaic Cells",
    "harmonic": "Harmonic Motion & Hooke's Law",
    "photoelectric": "Photoelectric Effect & Quantum Physics",
    "magnetism": "Magnetic Fields & Lorentz Force",
    "enzymes": "Enzyme Kinetics & Catalysis",
    "respiration": "Cellular Respiration & Respirometer",
    "beerlambert": "Spectrophotometry & Beer-Lambert Law",
    "decay": "Radioactive Decay & Nuclear Kinetics",
    "colligative": "Colligative Properties & Phase Transition",
    "organic": "Organic Reaction Mechanisms & Stereochemistry",
    "electrophoresis": "Agarose Gel Electrophoresis & DNA Migration",
    "ecology": "Population Ecology & Lotka-Volterra",
    "actionpotential": "Neurobiology & Action Potential Patch Clamp",
    "rotational": "Rotational Dynamics & Moment of Inertia",
    "conduction": "Thermal Conduction & Fourier's Law",
    "fluids": "Fluid Dynamics, Buoyancy & Bernoulli",
    "anatomy": "4K Human Anatomy Atlas & Histology",
    "kinetics": "Chemical Kinetics & Rates",
    "collisions": "Linear Momentum & Collisions",
    "induction": "Electromagnetic Induction & Faraday",
    "osmosis": "Cell Membrane & Osmosis",
    "mitosis": "Cell Cycle & Mitosis"
  };
  return map[norm] || "Virtual Laboratory";
}

function getLessonIconEmoji(type) {
  if (!type) return "🔬";
  if (type.startsWith("chem-ozone") || type.startsWith("chem-density-ozone")) return "🛡️";
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

  // Subject-aware learning telemetry and resume point (Never show CHEM on BIO/PHYS)
  const subjKey = curData.code.toLowerCase(); // "chem", "bio", "phys"
  const subjStats = ProgressStore.getSubjectStats(subjKey);
  const subjName = curData.subject;
  const showPresenterTip = localStorage.getItem("sb_hide_presenter_tip") !== "true";

  // Preload top visible card images for this subject for instant above-the-fold first paint
  if (curData && Array.isArray(curData.modules)) {
    const topModules = curData.modules.slice(0, 6);
    topModules.forEach(m => {
      const href = `assets/chapters/${curData.code.toLowerCase()}_m${mCode(m.id)}.jpg`;
      if (typeof document !== "undefined") {
        let existingLink = document.querySelector(`link[rel="preload"][href="${href}"]`);
        if (!existingLink) {
          const link = document.createElement("link");
          link.rel = "preload";
          link.as = "image";
          link.href = href;
          document.head.appendChild(link);
        }
      }
    });
  }

  // Determine Continue Learning module for THIS curriculum
  let lastMod = null;
  let isResuming = false;
  let lastOpenedTimeStr = "";
  if (subjStats.lastCode) {
    const found = findModuleByCode(subjStats.lastCode);
    if (found && found.mod) {
      lastMod = found.mod;
      isResuming = true;
      if (subjStats.lastTimestamp) {
        lastOpenedTimeStr = formatRelativeTime(subjStats.lastTimestamp);
      }
    }
  }
  if (!lastMod && curData.modules && curData.modules.length > 0) {
    lastMod = curData.modules[0];
  }

  const percentExplored = curData.totalModules ? Math.min(100, Math.round((subjStats.modulesCount / curData.totalModules) * 100)) : 0;

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

      <!-- Quick Action Navigation Toolbar -->
      <div class="hero-quick-actions" role="toolbar" aria-label="Classroom and lab shortcuts" style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px;">
        <a href="#labs" class="btn-quick-hero hero-btn-lab" aria-label="Launch Virtual Labs Suite" style="text-decoration: none; display: inline-flex; align-items: center; gap: 8px; padding: 9px 18px; border-radius: 10px; font-weight: 700; font-size: 0.88rem; background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1.5px solid rgba(56, 189, 248, 0.35); transition: all 0.2s ease;">
          <span>🔬</span>
          <span>Open Virtual Labs</span>
        </a>
        <a href="#quiz" class="btn-quick-hero hero-btn-quiz" aria-label="Open Quiz & Exam Generator" style="text-decoration: none; display: inline-flex; align-items: center; gap: 8px; padding: 9px 18px; border-radius: 10px; font-weight: 700; font-size: 0.88rem; background: rgba(245, 158, 11, 0.12); color: #f59e0b; border: 1.5px solid rgba(245, 158, 11, 0.35); transition: all 0.2s ease;">
          <span>📝</span>
          <span>Exam Generator</span>
        </a>
        <a href="#flashcards" class="btn-quick-hero hero-btn-flashcards" aria-label="Open STEM Flashcards" style="text-decoration: none; display: inline-flex; align-items: center; gap: 8px; padding: 9px 18px; border-radius: 10px; font-weight: 700; font-size: 0.88rem; background: rgba(236, 72, 153, 0.12); color: #ec4899; border: 1.5px solid rgba(236, 72, 153, 0.35); transition: all 0.2s ease;">
          <span>🎴</span>
          <span>Flashcards</span>
        </a>
      </div>
    </div>

    ${showPresenterTip ? `
      <!-- Classroom Presenter Tip Banner -->
      <div class="presenter-tip-banner" id="classroom-presenter-tip">
        <div class="presenter-tip-content">
          <span>💡</span>
          <span><strong>Classroom Presenter Tip:</strong> Press <kbd style="background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2); font-family: var(--font-mono, monospace);">Shift + F</kbd> anytime for distraction-free Focus Mode on smartboards and projectors.</span>
          <button class="btn-shortcuts-cheatsheet" id="btn-open-shortcuts-cheatsheet" title="View all keyboard and smartboard shortcuts" aria-label="Open Keyboard Shortcuts Cheatsheet">⌨️ Shortcuts</button>
        </div>
        <button class="presenter-tip-dismiss" id="btn-dismiss-presenter-tip" aria-label="Dismiss presenter tip">✕</button>
      </div>
    ` : ''}

    ${lastMod ? `
      <!-- Continue Learning Progress Strip (Subject-Aware) -->
      <div class="continue-learning-strip" data-subject="${subjKey}">
        <div class="continue-learning-left">
          <div class="continue-learning-pulse-dot"></div>
          <div class="continue-learning-text">
            <span class="continue-learning-label">
              ${isResuming ? 'Continue Where You Left Off' : 'Recommended Starting Chapter'}
              ${lastOpenedTimeStr ? `<span class="last-opened-time">• Last opened ${lastOpenedTimeStr}</span>` : ''}
            </span>
            <span class="continue-learning-target">${lastMod.code}: ${lastMod.title}</span>
            ${subjStats.modulesCount > 0 ? `
              <div class="continue-learning-progress-row" style="display: flex; align-items: center; gap: 8px; margin-top: 5px;">
                <div class="continue-progress-track" title="${subjStats.modulesCount} of ${curData.totalModules} chapters explored (${percentExplored}%)" style="width: 130px; height: 5px; background: rgba(255,255,255,0.12); border-radius: 9999px; overflow: hidden;">
                  <div class="continue-progress-fill" style="width: ${percentExplored}%; height: 100%; background: ${themeColor}; border-radius: 9999px;"></div>
                </div>
                <span style="font-size: 0.74rem; color: var(--text-dim); font-weight: 600;">${percentExplored}% explored</span>
              </div>
            ` : ''}
          </div>
        </div>
        <div class="continue-learning-actions">
          <div class="continue-learning-meta">
            ${subjStats.modulesCount === 0 && subjStats.labsCount === 0 ? `
              <span class="empty-journey-guide">✨ Welcome! Select Chapter 1 below or click Start Chapter to begin ${subjName}</span>
            ` : `
              <span>${subjStats.modulesCount} chapter${subjStats.modulesCount === 1 ? '' : 's'} explored • ${subjStats.labsCount} lab${subjStats.labsCount === 1 ? '' : 's'} launched in ${subjName}</span>
            `}
          </div>
          <a href="#labs/${normalizeLabId(lastMod.lab)}" class="btn-continue-lab" aria-label="Launch Virtual Lab for Chapter ${lastMod.code}" style="text-decoration: none; display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; border: 1.5px solid rgba(56, 189, 248, 0.4); color: #38bdf8; background: rgba(56, 189, 248, 0.08); font-weight: 700; font-size: 0.85rem;">
            <span>🔬 Launch Lab</span>
          </a>
          <a href="#module/${lastMod.code}" class="btn-continue-resume" aria-label="${isResuming ? 'Resume' : 'Start'} Chapter ${lastMod.code}">
            <span>${isResuming ? 'Resume Chapter' : 'Start Chapter 1'}</span>
            <span>→</span>
          </a>
        </div>
      </div>
    ` : ''}

    <!-- Search, View Switcher & Unit Filter Chips -->
    <div class="filter-search-row">
      <div class="search-box-wrapper">
        <div class="search-icon-inside">${icons.search}</div>
        <input type="text" class="search-input" id="search-modules-input" placeholder="Search chapters, lessons, concepts..." value="${AppState.searchQuery}" aria-label="Search chapters, lessons, concepts, or phenomena">
        <kbd class="search-kbd-hint" title="Press Ctrl+K or / to search">Ctrl K</kbd>
      </div>

      <!-- View Switcher: Chapters vs Individual Lesson Cards -->
      <div class="view-mode-toggle-group" title="Toggle between Chapter Cards and Lesson Cards">
        <button class="view-mode-btn ${!isLessonsView ? 'active' : ''}" data-view="chapters" aria-label="Chapter Cards view (${filtered.length} chapters)">
          <span>📖</span>
          <span>Chapter Cards (${filtered.length})</span>
        </button>
        <button class="view-mode-btn ${isLessonsView ? 'active' : ''}" data-view="lessons" aria-label="Lesson Cards view (${totalLessonsCount} lessons)">
          <span>🔬</span>
          <span>Lesson Cards (${totalLessonsCount})</span>
        </button>
      </div>

      <div class="unit-filters-scroll">
        ${units.map(u => `
          <button class="unit-filter-chip ${AppState.selectedUnit === u ? 'active' : ''}" data-unit="${u}" aria-label="Filter curriculum by unit: ${u === 'ALL' ? 'All Units' : u}">
            ${u === 'ALL' ? 'All Units' : u}
          </button>
        `).join("")}
      </div>
    </div>

    <!-- Cards Display Area -->
    ${filtered.length === 0 ? `
      <!-- Friendly Empty State when Search or Unit Filter yields 0 matches -->
      <div class="empty-search-state" role="status" aria-live="polite">
        <div class="empty-search-icon" aria-hidden="true">🔍</div>
        <h3 class="empty-search-title">No Matching Chapters Found</h3>
        <p class="empty-search-desc">We couldn't find any chapters or lessons matching "<strong>${AppState.searchQuery.replace(/</g, "&lt;")}</strong>" in ${curData.subject}. Try adjusting your keywords or clearing filters.</p>
        <button class="btn btn-primary btn-clear-search" id="btn-empty-clear-search">Clear Search &amp; Filters</button>
      </div>
    ` : (!isLessonsView ? `
      <!-- Chapters / Modules Grid with Textbook Opener Banners & Lesson Miniatures -->
      <div class="modules-grid" id="modules-cards-container">
        ${filtered.map((m, mIdx) => {
          const imgPath = `assets/chapters/${curData.code.toLowerCase()}_m${mCode(m.id)}.jpg`;
          const fallbackSvg = getSubjectPlaceholderSvg(curData.code);
          const isTopPriority = mIdx < 6;
          return `
            <div class="module-card" data-mid="${m.id}" tabindex="0" role="article" aria-label="Chapter ${m.code}: ${m.title}, ${m.lessons.length} lessons. Press Enter to explore chapter." style="--card-accent: ${themeColor};">
              <!-- Textbook Chapter Opener Photo Banner with Skeleton & Robust Fallback -->
              <div class="module-card-banner is-loading">
                <div class="module-banner-skeleton" aria-hidden="true"></div>
                <div class="module-banner-fallback-icon" aria-hidden="true">
                  ${curData.code === 'CHEM' ? icons.chemistry : (curData.code === 'BIO' ? icons.biology : icons.physics)}
                </div>
                <img src="${imgPath}" alt="Chapter ${m.code}: ${m.title} cover" class="module-banner-img" loading="${isTopPriority ? 'eager' : 'lazy'}" decoding="async" fetchpriority="${isTopPriority ? 'high' : 'auto'}"
                  onload="this.classList.add('loaded'); this.parentElement.classList.remove('is-loading');"
                  onerror="if (!this.dataset.errored) { this.dataset.errored = '1'; this.src = '${fallbackSvg}'; this.alt = 'Chapter image placeholder'; } else { this.style.display='none'; } this.parentElement.classList.remove('is-loading'); this.parentElement.classList.add('has-fallback-pattern');">
                <div class="module-banner-overlay"></div>
              </div>

              <div class="module-card-content">
                <div>
                  <div class="module-card-header-meta">
                    <span class="module-code-badge">${m.code}</span>
                    <span class="module-unit-tag">${m.unit || 'Core Module'}</span>
                  </div>
                  <h3 class="module-title">
                    <a href="#module/${m.code}" class="module-title-link" aria-label="Open Chapter ${m.code}: ${m.title}">${m.title}</a>
                  </h3>
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
                        <a href="#lesson/${m.code}-L${l.id}" class="lesson-row-card" data-mid="${m.id}" data-lid="${l.id}" title="Click to launch Lesson ${l.id} Interactive: ${l.title}" aria-label="Lesson ${l.id}: ${l.title} - Launch Interactive Simulation">
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
                        </a>
                      `;
                    }).join("")}
                  </div>
                </div>

                <div class="module-card-footer">
                  <a href="#labs/${normalizeLabId(m.lab)}" class="lab-indicator" title="Launch ${formatLabName(m.lab)} Virtual Lab" aria-label="Launch ${formatLabName(m.lab)} Virtual Lab">
                    ${icons.microscope}
                    <span>Lab: ${formatLabName(m.lab)}</span>
                  </a>
                  <a href="#module/${m.code}" class="view-module-arrow module-explore-link" aria-label="Explore Chapter ${m.code}: ${m.title}">
                    Explore Chapter →
                  </a>
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
          const fallbackSvg = getSubjectPlaceholderSvg(curData.code);
          const isTopPriority = idx < 6;
          return `
            <div class="lesson-card-full" data-mid="${m.id}" data-lid="${l.id}" tabindex="0" role="article" aria-label="Lesson ${l.id}: ${l.title} - Chapter ${m.code}. Press Enter to launch interactive." style="--card-accent: ${themeColor};">
              <div class="lesson-card-banner is-loading">
                <div class="module-banner-skeleton" aria-hidden="true"></div>
                <div class="module-banner-fallback-icon" aria-hidden="true">
                  ${curData.code === 'CHEM' ? icons.chemistry : (curData.code === 'BIO' ? icons.biology : icons.physics)}
                </div>
                <img src="${imgPath}" alt="Lesson ${l.id}: ${l.title} illustration" class="lesson-banner-img" loading="${isTopPriority ? 'eager' : 'lazy'}" decoding="async" fetchpriority="${isTopPriority ? 'high' : 'auto'}"
                  onload="this.classList.add('loaded'); this.parentElement.classList.remove('is-loading');"
                  onerror="if (!this.dataset.errored) { this.dataset.errored = '1'; this.src = '${fallbackSvg}'; this.alt = 'Lesson placeholder'; } else { this.style.display='none'; } this.parentElement.classList.remove('is-loading'); this.parentElement.classList.add('has-fallback-pattern');">
                <div class="lesson-banner-overlay"></div>
                <div class="lesson-card-pic-circle" title="${spec.title}">
                  ${iconEmoji}
                </div>
              </div>

              <div class="lesson-card-body">
                <div>
                  <div class="lesson-card-header-meta">
                    <span class="lesson-card-mcode">${m.code}</span>
                    <span class="lesson-card-lbadge">Lesson ${l.id}</span>
                  </div>
                  <div class="lesson-card-chapter">${m.title}</div>
                  <h4 class="lesson-card-title">
                    <a href="#lesson/${m.code}-L${l.id}" class="lesson-title-link" aria-label="Open Lesson ${l.id}: ${l.title}">${l.title}</a>
                  </h4>
                </div>

                <div class="lesson-card-formula">
                  ${renderLatex(spec.formula, false)}
                </div>

                <div class="lesson-card-inquiry">
                  <strong>Inquiry Challenge:</strong> ${spec.inquiry}
                </div>

                <div class="lesson-card-footer" style="display: flex; gap: 8px;">
                  <a href="#lesson/${m.code}-L${l.id}" class="btn-launch-lesson-sim" data-mid="${m.id}" data-lid="${l.id}" style="flex: 1; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px;" aria-label="Launch Interactive Simulation for Lesson ${l.id}">
                    <span>Launch Interactive</span>
                    <span class="play-icon">▶</span>
                  </a>
                  <a href="#plan/${curData.code}-M${m.id}-L${l.id}" class="btn-launch-lesson-plan" data-mid="${m.id}" data-lid="${l.id}" title="Open 2-Page A4 Teacher Lesson Plan &amp; PDF Export" aria-label="Open Lesson Plan for Lesson ${l.id}" style="padding: 0 12px; height: 38px; font-size: 0.82rem; font-weight: 700; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-surface-elevated); color: var(--text-main); cursor: pointer; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; text-decoration: none; transition: all 0.2s ease;">
                    <span>📄 Plan</span>
                  </a>
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `)}
  `;

  // Bind Classroom Presenter Tip Dismiss & Shortcuts Cheatsheet
  const btnDismissTip = document.getElementById("btn-dismiss-presenter-tip");
  if (btnDismissTip) {
    btnDismissTip.addEventListener("click", () => {
      localStorage.setItem("sb_hide_presenter_tip", "true");
      document.getElementById("classroom-presenter-tip")?.remove();
    });
  }
  const btnShortcuts = document.getElementById("btn-open-shortcuts-cheatsheet");
  if (btnShortcuts) {
    btnShortcuts.addEventListener("click", () => {
      openShortcutsModal();
    });
  }

  // Bind Search Input with Debounce (150ms) to prevent Android MAXHUB layout thrashing
  let searchDebounceTimer = null;
  const searchInput = document.getElementById("search-modules-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      AppState.searchQuery = e.target.value;
      if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        renderSubjectView(container, curData, themeColor);
        const newInp = document.getElementById("search-modules-input");
        if (newInp) {
          newInp.focus();
          newInp.selectionStart = newInp.selectionEnd = newInp.value.length;
        }
      }, 150);
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (AppState.searchQuery) {
          AppState.searchQuery = "";
          searchInput.value = "";
          renderSubjectView(container, curData, themeColor);
        } else {
          searchInput.blur();
        }
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

  // Direct launchers to bypass hash desync, duplicate hash suppression, or dropped clicks
  const launchLessonInteractive = (mid, lid) => {
    const mod = curData.modules.find(m => m.id === mid);
    if (!mod) return;
    const tabId = curData.code.toLowerCase();
    const themeColor = `var(--${tabId}-primary)`;
    openModuleModal(mod, themeColor, lid);
    const targetHash = `#lesson/${mod.code}-L${lid}`;
    if (window.location.hash !== targetHash) {
      try {
        history.pushState(null, "", targetHash);
      } catch (err) {
        window.location.hash = targetHash;
      }
    }
  };

  const launchModuleChapter = (mid) => {
    const mod = curData.modules.find(m => m.id === mid);
    if (!mod) return;
    const tabId = curData.code.toLowerCase();
    const themeColor = `var(--${tabId}-primary)`;
    openModuleModal(mod, themeColor);
    const targetHash = `#module/${mod.code}`;
    if (window.location.hash !== targetHash) {
      try {
        history.pushState(null, "", targetHash);
      } catch (err) {
        window.location.hash = targetHash;
      }
    }
  };

  const launchLessonPlan = (mid, lid) => {
    import("./components/lesson-plan-generator.js").then(m => {
      m.openLessonPlanModal(curData.code, mid, lid);
    });
    const targetHash = `#plan/${curData.code}-M${mid}-L${lid}`;
    if (window.location.hash !== targetHash) {
      try {
        history.pushState(null, "", targetHash);
      } catch (err) {
        window.location.hash = targetHash;
      }
    }
  };

  // Bind Lesson Row Clicks (Chapter cards view)
  container.querySelectorAll(".lesson-row-card").forEach(pill => {
    pill.addEventListener("click", (e) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      e.stopPropagation();
      const mid = parseInt(pill.dataset.mid, 10);
      const lid = parseInt(pill.dataset.lid, 10);
      launchLessonInteractive(mid, lid);
    });
  });

  // Bind Standalone Lesson Card Clicks (Lessons view)
  container.querySelectorAll(".lesson-card-full").forEach(card => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".btn-launch-lesson-plan")) return;
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      e.stopPropagation();
      const mid = parseInt(card.dataset.mid, 10);
      const lid = parseInt(card.dataset.lid, 10);
      launchLessonInteractive(mid, lid);
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        if (e.target.closest(".btn-launch-lesson-plan")) return;
        e.preventDefault();
        e.stopPropagation();
        const mid = parseInt(card.dataset.mid, 10);
        const lid = parseInt(card.dataset.lid, 10);
        launchLessonInteractive(mid, lid);
      }
    });
  });

  // Bind direct Launch Interactive buttons on Standalone Lesson Cards
  container.querySelectorAll(".btn-launch-lesson-sim").forEach(btn => {
    btn.addEventListener("click", (e) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      e.stopPropagation();
      const mid = parseInt(btn.dataset.mid, 10);
      const lid = parseInt(btn.dataset.lid, 10);
      launchLessonInteractive(mid, lid);
    });
  });

  // Bind direct Title links on Standalone Lesson Cards
  container.querySelectorAll(".lesson-title-link").forEach(link => {
    link.addEventListener("click", (e) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      e.stopPropagation();
      const card = link.closest(".lesson-card-full");
      if (card) {
        const mid = parseInt(card.dataset.mid, 10);
        const lid = parseInt(card.dataset.lid, 10);
        launchLessonInteractive(mid, lid);
      }
    });
  });

  // Bind Lesson Plan Button Clicks on Standalone Cards
  container.querySelectorAll(".btn-launch-lesson-plan").forEach(btn => {
    btn.addEventListener("click", (e) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      e.stopPropagation();
      const mid = parseInt(btn.dataset.mid, 10);
      const lid = parseInt(btn.dataset.lid, 10);
      launchLessonPlan(mid, lid);
    });
  });

  // Bind Module Card Clicks (Chapter view)
  container.querySelectorAll(".module-card").forEach(card => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("a, button, .lesson-row-card, .lab-indicator")) return;
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      e.stopPropagation();
      const mid = parseInt(card.dataset.mid, 10);
      launchModuleChapter(mid);
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        if (e.target.closest("a, button, .lesson-row-card, .lab-indicator")) return;
        e.preventDefault();
        e.stopPropagation();
        const mid = parseInt(card.dataset.mid, 10);
        launchModuleChapter(mid);
      }
    });
  });

  // Bind Module Explore Links ("Explore Chapter →")
  container.querySelectorAll(".module-explore-link").forEach(link => {
    link.addEventListener("click", (e) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      e.stopPropagation();
      const card = link.closest(".module-card");
      if (card) {
        const mid = parseInt(card.dataset.mid, 10);
        launchModuleChapter(mid);
      }
    });
  });

  // Bind Module Title Links
  container.querySelectorAll(".module-title-link").forEach(link => {
    link.addEventListener("click", (e) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      e.stopPropagation();
      const card = link.closest(".module-card");
      if (card) {
        const mid = parseInt(card.dataset.mid, 10);
        launchModuleChapter(mid);
      }
    });
  });

  // Bind Clear Search button from Empty State if rendered
  const btnEmptyClear = container.querySelector("#btn-empty-clear-search");
  if (btnEmptyClear) {
    btnEmptyClear.addEventListener("click", () => {
      AppState.searchQuery = "";
      AppState.selectedUnit = "ALL";
      renderSubjectView(container, curData, themeColor);
      const searchInput = document.getElementById("search-modules-input");
      if (searchInput) searchInput.value = "";
    });
  }

  // Bind Continue Learning actions to sync progress
  const btnContinueResume = container.querySelector(".btn-continue-resume");
  if (btnContinueResume && lastMod) {
    btnContinueResume.addEventListener("click", () => {
      ProgressStore.recordModuleOpened(lastMod.code);
      ProgressStore.recordModuleExplored(lastMod.code);
    });
  }
  const btnContinueLab = container.querySelector(".btn-continue-lab");
  if (btnContinueLab && lastMod) {
    btnContinueLab.addEventListener("click", () => {
      ProgressStore.recordLabLaunched(normalizeLabId(lastMod.lab));
    });
  }

  // High-reliability image loading with decoding, intersection prefetching, and safety fallback
  setupChapterImageLoading(container);

  // Classroom & Smartboard spatial keyboard navigation (arrow keys across cards)
  setupCardSpatialNavigation(container);

  // Prefetch chapter assets on hover / focus for instant transitions
  document.querySelectorAll(".module-card, .lesson-row-card").forEach(el => {
    el.addEventListener("mouseenter", () => {
      const mid = el.dataset.mid;
      if (mid) {
        const nextImg = new Image();
        nextImg.src = `assets/chapters/${curData.code.toLowerCase()}_m${mCode(parseInt(mid, 10))}.jpg`;
      }
    }, { once: true, passive: true });
  });

  // Background idle pre-fetch for remaining chapters so fast scrolling never encounters blank images
  const scheduleIdle = window.requestIdleCallback || ((cb) => setTimeout(cb, 60));
  if (curData && Array.isArray(curData.modules) && curData.modules.length > 6) {
    const remaining = curData.modules.slice(6);
    remaining.forEach((m, idx) => {
      scheduleIdle(() => {
        const preImg = new Image();
        preImg.src = `assets/chapters/${curData.code.toLowerCase()}_m${mCode(m.id)}.jpg`;
      }, { timeout: 150 + idx * 40 });
    });
  }

  renderMathInElement(container);
}

/**
 * Robust chapter image loader that eliminates lazy-loading race conditions,
 * decodes off-thread, and guarantees cards never stay in a blank loading state.
 */
function setupChapterImageLoading(container) {
  if (!container) return;

  const images = Array.from(container.querySelectorAll(".module-banner-img, .lesson-banner-img"));
  if (images.length === 0) return;

  const markLoaded = (img) => {
    img.classList.add("loaded");
    const banner = img.closest(".module-card-banner, .lesson-card-banner");
    if (banner) {
      banner.classList.remove("is-loading");
    }
  };

  const markFallback = (img) => {
    const banner = img.closest(".module-card-banner, .lesson-card-banner");
    if (banner) {
      banner.classList.remove("is-loading");
      banner.classList.add("has-fallback-pattern");
    }
  };

  let observer = null;
  if (typeof IntersectionObserver !== "undefined") {
    observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          obs.unobserve(img);
          if (img.loading === "lazy") {
            img.loading = "eager";
          }
          if (img.decode) {
            img.decode().then(() => markLoaded(img)).catch(() => {});
          }
        }
      });
    }, { rootMargin: "450px 0px" });
  }

  images.forEach((img, idx) => {
    if (observer) {
      observer.observe(img);
    }

    // Unconditionally attach event listeners
    img.addEventListener("load", () => markLoaded(img), { once: true });
    img.addEventListener("error", () => markFallback(img), { once: true });

    // Handle cached or already-complete images
    if (img.complete) {
      if (img.naturalWidth > 0) {
        markLoaded(img);
      } else if (img.dataset.errored) {
        markFallback(img);
      } else if (img.decode) {
        img.decode().then(() => markLoaded(img)).catch(() => {});
      }
    }

    // Safety timeout: Never leave any card in blank shimmer state
    setTimeout(() => {
      if (img.naturalWidth > 0) {
        markLoaded(img);
      } else {
        const banner = img.closest(".module-card-banner, .lesson-card-banner");
        if (banner && banner.classList.contains("is-loading")) {
          banner.classList.remove("is-loading");
          if (img.complete && img.naturalWidth > 0) {
            img.classList.add("loaded");
          } else {
            banner.classList.add("has-fallback-pattern");
          }
        }
      }
    }, 1200 + Math.min(idx * 25, 1000));
  });
}

/**
 * Spatial keyboard navigation across curriculum chapter and lesson cards
 * Enables teachers and students to use presentation clickers and Arrow keys
 */
function setupCardSpatialNavigation(container) {
  if (!container) return;
  const cards = Array.from(container.querySelectorAll(".module-card, .lesson-card-full"));
  if (cards.length === 0) return;

  cards.forEach((card, idx) => {
    card.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      let targetIdx = -1;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        targetIdx = idx + 1 < cards.length ? idx + 1 : 0;
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        targetIdx = idx - 1 >= 0 ? idx - 1 : cards.length - 1;
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        for (let i = idx + 1; i < cards.length; i++) {
          if (Math.abs(cards[i].offsetLeft - card.offsetLeft) < 25) {
            targetIdx = i;
            break;
          }
        }
        if (targetIdx === -1) {
          targetIdx = Math.min(cards.length - 1, idx + 3);
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        for (let i = idx - 1; i >= 0; i--) {
          if (Math.abs(cards[i].offsetLeft - card.offsetLeft) < 25) {
            targetIdx = i;
            break;
          }
        }
        if (targetIdx === -1) {
          targetIdx = Math.max(0, idx - 3);
        }
      } else if (e.key === "Home" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        targetIdx = 0;
      } else if (e.key === "End" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        targetIdx = cards.length - 1;
      }

      if (targetIdx >= 0 && targetIdx < cards.length) {
        cards[targetIdx].focus();
        cards[targetIdx].scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    });
  });
}

export function renderClassifiedLabNavHTML(activeLabId, filterSubject = "all") {
  const classified = getClassifiedVirtualLabs();
  const subjects = [
    { key: "chem", config: LAB_SUBJECT_CONFIG.chem, labs: classified.chem || [] },
    { key: "phys", config: LAB_SUBJECT_CONFIG.phys, labs: classified.phys || [] },
    { key: "bio", config: LAB_SUBJECT_CONFIG.bio, labs: classified.bio || [] }
  ];

  const totalCount = VIRTUAL_LABS_REGISTRY.length;
  const chemCount = (classified.chem || []).length;
  const physCount = (classified.phys || []).length;
  const bioCount = (classified.bio || []).length;

  return `
    <!-- Subject Filter Tabs & Classification Bar -->
    <div class="lab-nav-header-controls">
      <div class="lab-filter-pills" role="tablist" aria-label="Filter Virtual Laboratories by Subject">
        <button class="lab-filter-pill ${filterSubject === 'all' ? 'active' : ''}" data-subject-filter="all" role="tab" aria-selected="${filterSubject === 'all'}">
          <span class="lab-filter-icon">🌐</span>
          <span class="lab-filter-label">All Laboratories</span>
          <span class="lab-filter-badge">${totalCount}</span>
        </button>
        <button class="lab-filter-pill ${filterSubject === 'chem' ? 'active' : ''}" data-subject-filter="chem" role="tab" aria-selected="${filterSubject === 'chem'}">
          <span class="lab-filter-icon">🧪</span>
          <span class="lab-filter-label">Chemistry (Che)</span>
          <span class="lab-filter-badge chem-badge">${chemCount}</span>
        </button>
        <button class="lab-filter-pill ${filterSubject === 'phys' ? 'active' : ''}" data-subject-filter="phys" role="tab" aria-selected="${filterSubject === 'phys'}">
          <span class="lab-filter-icon">⚛️</span>
          <span class="lab-filter-label">Physics (Phy)</span>
          <span class="lab-filter-badge phys-badge">${physCount}</span>
        </button>
        <button class="lab-filter-pill ${filterSubject === 'bio' ? 'active' : ''}" data-subject-filter="bio" role="tab" aria-selected="${filterSubject === 'bio'}">
          <span class="lab-filter-icon">🧬</span>
          <span class="lab-filter-label">Biology (Bio)</span>
          <span class="lab-filter-badge bio-badge">${bioCount}</span>
        </button>
      </div>

      <div class="lab-sort-badge" title="Laboratories are categorized into Chemistry, Physics, and Biology, and dynamically arranged in alphabetical order (A to Z)">
        <span class="lab-sort-indicator-icon">🔤</span>
        <span class="lab-sort-indicator-text">Organized Alphabetically (A → Z)</span>
      </div>
    </div>

    <!-- Classified Laboratories Subject Sections -->
    <div class="lab-classified-sections">
      ${subjects.map(({ key, config, labs }) => {
        const isVisible = filterSubject === "all" || filterSubject === key;
        return `
          <section class="lab-subject-group lab-group-${key}" data-subject="${key}" style="${isVisible ? '' : 'display: none;'}">
            <div class="lab-subject-header">
              <div class="lab-subject-info">
                <span class="lab-subject-badge badge-${key}">
                  <span class="badge-icon">${config.icon}</span>
                  <span class="badge-title">${config.label.toUpperCase()} LABORATORIES</span>
                  <span class="badge-dot">•</span>
                  <span class="badge-count">${labs.length} EXPERIMENTS</span>
                </span>
                <span class="lab-subject-desc">${config.description}</span>
              </div>
              <div class="lab-alphabetical-chip" title="Alphabetically sorted from A to Z">
                <span>A → Z</span>
              </div>
            </div>

            <div class="lab-nav-pills-container">
              ${labs.map(lab => `
                <a href="${lab.href || '#labs/' + lab.id}" class="btn ${activeLabId === lab.id ? 'btn-primary' : 'btn-secondary'} lab-nav-btn lab-btn-${key}" data-lab="${lab.id}" aria-label="${lab.ariaLabel}" style="text-decoration: none;">
                  <span class="lab-btn-icon-wrapper">${lab.icon}</span>
                  <span class="lab-btn-title">${lab.title}</span>
                </a>
              `).join('')}
            </div>
          </section>
        `;
      }).join('')}
    </div>
  `;
}

function renderVirtualLabsHub(container) {
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 28px;">
      <!-- Labs Header -->
      <div class="hero-banner labs-suite-hero">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div class="hero-badge labs-suite-badge">
            Interactive Simulation Workbenches (60 FPS)
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="btn btn-secondary" id="btn-lms-share-active-lab" title="Assign this laboratory workbench to Google Classroom, Classera, Canvas, or Teams" aria-label="Assign this laboratory workbench to LMS" style="padding: 6px 14px; font-size: 0.85rem; font-weight: 700; gap: 6px; border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;">
              <span>📤 Assign to LMS</span>
            </button>
            <button class="btn btn-secondary btn-share-link" id="btn-share-active-lab" title="Share deep-link to this laboratory workbench" aria-label="Share deep-link to this laboratory workbench">
              <span>🔗 Share Workbench</span>
            </button>
          </div>
        </div>
        <h2 class="hero-title">Virtual Laboratories Suite</h2>
        <p class="hero-desc">
          High-performance physics, chemistry, and biological simulations with live numerical data telemetry, variable control inputs, real-time calculus, and interactive laboratory apparatus.
        </p>

        <!-- Dynamic Classified & Alphabetically Organized Labs Navigation -->
        ${renderClassifiedLabNavHTML(AppState.activeLabId, AppState.labsFilterSubject)}
      </div>

      <!-- Mount Container for Selected Lab -->
      <div id="active-lab-mount" style="min-height: 580px;"></div>
    </div>
  `;

  // Bind Share Buttons
  document.getElementById("btn-share-active-lab")?.addEventListener("click", () => {
    copyShareLink(`#labs/${AppState.activeLabId}`, `Virtual Lab: ${formatLabName("lab-" + AppState.activeLabId)}`);
  });

  document.getElementById("btn-lms-share-active-lab")?.addEventListener("click", () => {
    const labTitle = formatLabName("lab-" + AppState.activeLabId);
    import("./utils/lms-share.js").then(m => {
      m.openLmsShareModal({
        url: `#labs/${AppState.activeLabId}`,
        title: `Virtual Lab: ${labTitle}`,
        subject: "Science Lab",
        description: `Interactive 60 FPS science laboratory workbench with real-time sensor telemetry, controls, and apparatus.`
      });
    }).catch(err => {
      console.error("LMS Share load error:", err);
    });
  });

  // Bind Subject Filter Buttons
  container.querySelectorAll(".lab-filter-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      const filter = pill.dataset.subjectFilter || "all";
      AppState.labsFilterSubject = filter;
      try { SoundFX.playClick(); } catch (err) {}

      container.querySelectorAll(".lab-filter-pill").forEach(p => {
        const isAct = p.dataset.subjectFilter === filter;
        p.classList.toggle("active", isAct);
        p.setAttribute("aria-selected", isAct ? "true" : "false");
      });

      container.querySelectorAll(".lab-subject-group").forEach(group => {
        const grpSub = group.dataset.subject;
        const show = filter === "all" || filter === grpSub;
        group.style.display = show ? "" : "none";
      });
    });
  });

  // Bind Lab Selector Buttons
  container.querySelectorAll(".lab-nav-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      try { SoundFX.playClick(); } catch (err) {}
      AppState.activeLabId = normalizeLabId(btn.dataset.lab);
      window.location.hash = `#labs/${AppState.activeLabId}`;
    });
  });

  // Mount the chosen lab
  mountActiveLab();
}

function mountActiveLab() {
  const mount = document.getElementById("active-lab-mount");
  if (!mount) return;

  if (typeof currentActiveLabCleanup === "function") {
    try { currentActiveLabCleanup(); } catch (e) {}
    currentActiveLabCleanup = null;
  }

  const normId = normalizeLabId(AppState.activeLabId);
  AppState.activeLabId = normId;
  ProgressStore.recordLabLaunched(normId);

  // Update active pill button visual state in case hash was typed directly
  document.querySelectorAll(".lab-nav-btn").forEach(btn => {
    const isThisLab = normalizeLabId(btn.dataset.lab) === normId;
    btn.classList.toggle("btn-primary", isThisLab);
    btn.classList.toggle("btn-secondary", !isThisLab);
  });

  const labLoaders = {
    "projectile": () => import("./labs/phys-projectile.js").then(m => m.initProjectileLab("active-lab-mount")),
    "lab-projectile": () => import("./labs/phys-projectile.js").then(m => m.initProjectileLab("active-lab-mount")),
    "titration": () => import("./labs/chem-titration.js").then(m => m.initTitrationLab("active-lab-mount")),
    "lab-titration": () => import("./labs/chem-titration.js").then(m => m.initTitrationLab("active-lab-mount")),
    "microscope": () => import("./labs/bio-microscope.js").then(m => m.initMicroscopeLab("active-lab-mount")),
    "lab-microscope": () => import("./labs/bio-microscope.js").then(m => m.initMicroscopeLab("active-lab-mount")),
    "ptable": () => import("./labs/chem-periodic-table.js").then(m => m.initPeriodicTableLab("active-lab-mount")),
    "periodic-table": () => import("./labs/chem-periodic-table.js").then(m => m.initPeriodicTableLab("active-lab-mount")),
    "lab-periodic-table": () => import("./labs/chem-periodic-table.js").then(m => m.initPeriodicTableLab("active-lab-mount")),
    "circuits": () => import("./labs/phys-circuits.js").then(m => m.initCircuitsLab("active-lab-mount")),
    "circuit": () => import("./labs/phys-circuits.js").then(m => m.initCircuitsLab("active-lab-mount")),
    "lab-circuits": () => import("./labs/phys-circuits.js").then(m => m.initCircuitsLab("active-lab-mount")),
    "gaslaws": () => import("./labs/chem-gas-laws.js").then(m => m.initGasLawsLab("active-lab-mount")),
    "gas-laws": () => import("./labs/chem-gas-laws.js").then(m => m.initGasLawsLab("active-lab-mount")),
    "lab-gas-laws": () => import("./labs/chem-gas-laws.js").then(m => m.initGasLawsLab("active-lab-mount")),
    "dnaprotein": () => import("./labs/bio-dna-protein.js").then(m => m.initDnaProteinLab("active-lab-mount")),
    "dna-protein": () => import("./labs/bio-dna-protein.js").then(m => m.initDnaProteinLab("active-lab-mount")),
    "lab-dna-protein": () => import("./labs/bio-dna-protein.js").then(m => m.initDnaProteinLab("active-lab-mount")),
    "punnett": () => import("./labs/bio-punnett-square.js").then(m => m.initPunnettLab("active-lab-mount")),
    "punnett-square": () => import("./labs/bio-punnett-square.js").then(m => m.initPunnettLab("active-lab-mount")),
    "lab-punnett": () => import("./labs/bio-punnett-square.js").then(m => m.initPunnettLab("active-lab-mount")),
    "optics": () => import("./labs/phys-optics.js").then(m => m.initOpticsLab("active-lab-mount")),
    "optic": () => import("./labs/phys-optics.js").then(m => m.initOpticsLab("active-lab-mount")),
    "lab-optics": () => import("./labs/phys-optics.js").then(m => m.initOpticsLab("active-lab-mount")),
    "vsepr": () => import("./labs/chem-vsepr.js").then(m => m.initVseprLab("active-lab-mount")),
    "lab-vsepr": () => import("./labs/chem-vsepr.js").then(m => m.initVseprLab("active-lab-mount")),
    "waves": () => import("./labs/phys-waves.js").then(m => m.initWaveLab("active-lab-mount")),
    "wave": () => import("./labs/phys-waves.js").then(m => m.initWaveLab("active-lab-mount")),
    "lab-waves": () => import("./labs/phys-waves.js").then(m => m.initWaveLab("active-lab-mount")),
    "photosynthesis": () => import("./labs/bio-photosynthesis.js").then(m => m.initPhotosynthesisLab("active-lab-mount")),
    "lab-photosynthesis": () => import("./labs/bio-photosynthesis.js").then(m => m.initPhotosynthesisLab("active-lab-mount")),
    "calorimetry": () => import("./labs/chem-calorimetry.js").then(m => m.initCalorimetryLab("active-lab-mount")),
    "lab-calorimetry": () => import("./labs/chem-calorimetry.js").then(m => m.initCalorimetryLab("active-lab-mount")),
    "equilibrium": () => import("./labs/chem-equilibrium.js").then(m => m.initEquilibriumLab("active-lab-mount")),
    "lab-equilibrium": () => import("./labs/chem-equilibrium.js").then(m => m.initEquilibriumLab("active-lab-mount")),
    "electrochem": () => import("./labs/chem-electrochem.js").then(m => m.initElectrochemLab("active-lab-mount")),
    "lab-electrochem": () => import("./labs/chem-electrochem.js").then(m => m.initElectrochemLab("active-lab-mount")),
    "harmonic": () => import("./labs/phys-harmonic.js").then(m => m.initHarmonicLab("active-lab-mount")),
    "lab-harmonic": () => import("./labs/phys-harmonic.js").then(m => m.initHarmonicLab("active-lab-mount")),
    "photoelectric": () => import("./labs/phys-photoelectric.js").then(m => m.initPhotoelectricLab("active-lab-mount")),
    "lab-photoelectric": () => import("./labs/phys-photoelectric.js").then(m => m.initPhotoelectricLab("active-lab-mount")),
    "magnetism": () => import("./labs/phys-magnetism.js").then(m => m.initMagnetismLab("active-lab-mount")),
    "lab-magnetism": () => import("./labs/phys-magnetism.js").then(m => m.initMagnetismLab("active-lab-mount")),
    "enzymes": () => import("./labs/bio-enzyme-kinetics.js").then(m => m.initEnzymeLab("active-lab-mount")),
    "lab-enzymes": () => import("./labs/bio-enzyme-kinetics.js").then(m => m.initEnzymeLab("active-lab-mount")),
    "respiration": () => import("./labs/bio-respiration.js").then(m => m.initRespirationLab("active-lab-mount")),
    "lab-respiration": () => import("./labs/bio-respiration.js").then(m => m.initRespirationLab("active-lab-mount")),
    "beerlambert": () => import("./labs/chem-beer-lambert.js").then(m => m.initBeerLambertLab("active-lab-mount")),
    "lab-beerlambert": () => import("./labs/chem-beer-lambert.js").then(m => m.initBeerLambertLab("active-lab-mount")),
    "decay": () => import("./labs/chem-nuclear-decay.js").then(m => m.initNuclearDecayLab("active-lab-mount")),
    "lab-decay": () => import("./labs/chem-nuclear-decay.js").then(m => m.initNuclearDecayLab("active-lab-mount")),
    "colligative": () => import("./labs/chem-colligative.js").then(m => m.initColligativeLab("active-lab-mount")),
    "lab-colligative": () => import("./labs/chem-colligative.js").then(m => m.initColligativeLab("active-lab-mount")),
    "organic": () => import("./labs/chem-organic-reactions.js").then(m => m.initOrganicReactionsLab("active-lab-mount")),
    "lab-organic": () => import("./labs/chem-organic-reactions.js").then(m => m.initOrganicReactionsLab("active-lab-mount")),
    "electrophoresis": () => import("./labs/bio-gel-electrophoresis.js").then(m => m.initGelElectrophoresisLab("active-lab-mount")),
    "lab-electrophoresis": () => import("./labs/bio-gel-electrophoresis.js").then(m => m.initGelElectrophoresisLab("active-lab-mount")),
    "ecology": () => import("./labs/bio-population-ecology.js").then(m => m.initPopulationEcologyLab("active-lab-mount")),
    "lab-ecology": () => import("./labs/bio-population-ecology.js").then(m => m.initPopulationEcologyLab("active-lab-mount")),
    "actionpotential": () => import("./labs/bio-action-potential.js").then(m => m.initActionPotentialLab("active-lab-mount")),
    "lab-actionpotential": () => import("./labs/bio-action-potential.js").then(m => m.initActionPotentialLab("active-lab-mount")),
    "rotational": () => import("./labs/phys-rotational-dynamics.js").then(m => m.initRotationalDynamicsLab("active-lab-mount")),
    "lab-rotational": () => import("./labs/phys-rotational-dynamics.js").then(m => m.initRotationalDynamicsLab("active-lab-mount")),
    "conduction": () => import("./labs/phys-thermal-conduction.js").then(m => m.initThermalConductionLab("active-lab-mount")),
    "lab-conduction": () => import("./labs/phys-thermal-conduction.js").then(m => m.initThermalConductionLab("active-lab-mount")),
    "fluids": () => import("./labs/phys-fluids-buoyancy.js").then(m => m.initFluidsBuoyancyLab("active-lab-mount")),
    "lab-fluids": () => import("./labs/phys-fluids-buoyancy.js").then(m => m.initFluidsBuoyancyLab("active-lab-mount")),
    "anatomy": () => import("./labs/anatomy-atlas.js").then(m => m.initAnatomyAtlasLab("active-lab-mount")),
    "lab-anatomy": () => import("./labs/anatomy-atlas.js").then(m => m.initAnatomyAtlasLab("active-lab-mount")),
    "atlas": () => import("./labs/anatomy-atlas.js").then(m => m.initAnatomyAtlasLab("active-lab-mount")),
    "anatomy-atlas": () => import("./labs/anatomy-atlas.js").then(m => m.initAnatomyAtlasLab("active-lab-mount")),
    "kinetics": () => import("./labs/chem-reaction-kinetics.js").then(m => m.initReactionKineticsLab("active-lab-mount")),
    "lab-kinetics": () => import("./labs/chem-reaction-kinetics.js").then(m => m.initReactionKineticsLab("active-lab-mount")),
    "collisions": () => import("./labs/phys-collisions.js").then(m => m.initCollisionsLab("active-lab-mount")),
    "lab-collisions": () => import("./labs/phys-collisions.js").then(m => m.initCollisionsLab("active-lab-mount")),
    "momentum": () => import("./labs/phys-collisions.js").then(m => m.initCollisionsLab("active-lab-mount")),
    "induction": () => import("./labs/phys-induction.js").then(m => m.initInductionLab("active-lab-mount")),
    "lab-induction": () => import("./labs/phys-induction.js").then(m => m.initInductionLab("active-lab-mount")),
    "faraday": () => import("./labs/phys-induction.js").then(m => m.initInductionLab("active-lab-mount")),
    "osmosis": () => import("./labs/bio-osmosis.js").then(m => m.initOsmosisLab("active-lab-mount")),
    "lab-osmosis": () => import("./labs/bio-osmosis.js").then(m => m.initOsmosisLab("active-lab-mount")),
    "mitosis": () => import("./labs/bio-mitosis.js").then(m => m.initMitosisLab("active-lab-mount")),
    "lab-mitosis": () => import("./labs/bio-mitosis.js").then(m => m.initMitosisLab("active-lab-mount"))
  };

  const loader = labLoaders[normId] || labLoaders["projectile"];
  mount.innerHTML = `
    <div style="padding: 60px 24px; text-align: center; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px;" role="status" aria-live="polite">
      <div style="width: 40px; height: 40px; border: 3px solid rgba(56, 189, 248, 0.2); border-top-color: #38bdf8; border-radius: 50%; animation: appShellSpin 0.8s linear infinite;" aria-hidden="true"></div>
      <div style="font-weight: 700; color: #f1f5f9; font-size: 1.05rem;">Loading 60 FPS Laboratory Workbench...</div>
      <div style="font-size: 0.82rem; color: #64748b;">Initializing apparatus controls, Canvas rendering, and live sensor telemetry</div>
    </div>
  `;

  loader().then(cleanup => {
    currentActiveLabCleanup = cleanup;
    enhanceA11y(mount);
  }).catch(err => {
    console.error("Failed to load laboratory workbench:", err);
    mount.innerHTML = `
      <div style="padding: 36px 24px; text-align: center; background: rgba(15, 23, 42, 0.85); border: 1.5px solid rgba(239, 68, 68, 0.4); border-radius: 12px; margin: 24px auto; max-width: 540px; box-shadow: 0 20px 40px rgba(0,0,0,0.6);" role="alert">
        <div style="font-size: 32px; margin-bottom: 10px;" aria-hidden="true">⚠️</div>
        <div style="font-weight: 800; color: #f87171; font-size: 1.15rem; margin-bottom: 6px;">Workbench Initialization Interrupted</div>
        <div style="font-size: 0.86rem; color: #94a3b8; margin-bottom: 16px;">
          The simulation script or apparatus assets for <strong>${formatLabName("lab-" + normId)}</strong> could not be loaded.
        </div>
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.76rem; color: #ef4444; background: rgba(0,0,0,0.4); border: 1px solid rgba(239, 68, 68, 0.2); padding: 10px 14px; border-radius: 8px; margin-bottom: 20px; word-break: break-word; text-align: left;">
          <div><strong style="color: #64748b;">DIAGNOSTIC:</strong></div>
          <div>${err.message || String(err)}</div>
        </div>
        <button id="btn-retry-workbench" class="btn btn-primary" style="margin: 0 auto; display: inline-flex; align-items: center; gap: 8px; padding: 10px 22px; font-weight: 700; border-radius: 8px;">
          <span>🔄</span>
          <span>Retry / Reload Workbench</span>
        </button>
      </div>
    `;
    document.getElementById("btn-retry-workbench")?.addEventListener("click", () => {
      mountActiveLab();
    });
  });
}

// Master Application Initialization Entrypoint (Executed after all module definitions are evaluated)
if (typeof document !== "undefined") {
  if (document.getElementById("app-root")) {
    bootApp();
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootApp, { once: true });
  } else {
    bootApp();
  }
}

